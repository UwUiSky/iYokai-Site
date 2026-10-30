import hashlib
from datetime import datetime, timezone
from typing import Literal
from fastapi import Depends, HTTPException, Request
from pydantic import BaseModel, Field, model_validator, StrictBool, StrictInt
from .access import bot_get, permissions_for
from .entitlements import policy, tier_for, support_grant, verify_internal, RANK, CYCLES

class Receipt(BaseModel):
    event_id: str=Field(min_length=1,max_length=180)
    grant_id: str=Field(min_length=1,max_length=180)
    subject_type: Literal['user','guild']
    subject_id: str=Field(pattern=r'^[1-9][0-9]{0,18}$')
    tier: Literal['premium','vip']
    cycle: Literal['monthly','annual','lifetime']
    active: StrictBool
    occurred_at: datetime
    starts_at: datetime
    expires_at: datetime | None=None
    @model_validator(mode='after')
    def dates(self):
        if self.occurred_at.tzinfo is None or self.starts_at.tzinfo is None or self.expires_at and self.expires_at.tzinfo is None: raise ValueError('Timezone required')
        if self.active and self.cycle!='lifetime' and self.expires_at is None: raise ValueError('Expiry required')
        if self.expires_at and self.expires_at<=self.starts_at: raise ValueError('Invalid period')
        return self

class Usage(BaseModel):
    event_id: str=Field(min_length=1,max_length=180)
    user_id: str=Field(pattern=r'^[1-9][0-9]{0,18}$')
    guild_id: str | None=Field(default=None,pattern=r'^[1-9][0-9]{0,18}$')
    tokens: StrictInt=Field(gt=0,le=100_000_000)

async def resolve(request,user_id,gid=None):
    rules=policy(request.app.state.s)
    grants=await request.app.state.db.entitlements('user',str(user_id))
    if gid:grants+=await request.app.state.db.entitlements('guild',str(gid))
    verified=True
    for rule in rules.get('support_servers',[]):
        try: member=await bot_get(request,f"/guilds/{rule['guild_id']}/members/{user_id}",rule.get('identity','core'),True)
        except HTTPException: verified=False;continue
        grant=support_grant(rule,member) if member else None
        if grant:grants.append({**grant,'subject_type':'user','subject_id':str(user_id)})
    result=tier_for(grants);tier=result['tier'];limit=max(0,int(rules.get('tiers',{}).get(tier,{}).get('monthly_ai_tokens',0))) if tier=='vip' else 0
    # Paid guild allowances are shared across that guild, not multiplied per member.
    personal=tier_for([g for g in grants if g.get('subject_type','user')=='user'])['tier']
    scope='user' if personal==tier or not gid else 'guild';subject=str(user_id) if scope=='user' else str(gid)
    month=datetime.now(timezone.utc).strftime('%Y-%m');used=await request.app.state.db.ai_used(scope,subject,month)
    return {**result,'support_verified':verified,'aida':{'enabled':tier=='vip' and limit>0,'monthly_tokens':limit,'used_tokens':used,'remaining_tokens':max(0,limit-used),'period':month,'scope':scope,'subject_id':subject}}

def install_billing(app,session,guard,guild_for,hit):
    @app.get('/api/plans')
    async def plans(request:Request):
        from .commerce import catalogue
        return catalogue(request.app.state.s)

    @app.get('/api/me/entitlements')
    async def personal(request:Request,sess=Depends(session)):
        return await resolve(request,sess['user_id'])

    @app.get('/api/guilds/{gid}/entitlements')
    async def guild_entitlements(gid:int,request:Request,identity:str='core',sess=Depends(session)):
        await guild_for(request,gid,sess,identity)
        return await resolve(request,sess['user_id'],gid)

    @app.post('/api/billing/checkout')
    async def checkout(request:Request,sess=Depends(guard)):
        # No browser-provided success flag, fake checkout URL or automatic grant.
        raise HTTPException(503,'Checkout not configured: provider and prices required')

    async def trusted(request):
        raw=await request.body()
        if len(raw)>16384:raise HTTPException(413,'Event too large')
        verify_internal(request.app.state.s.billing_secret,request.headers.get('x-iyokai-signature',''),raw)
        hit(request,'bridge',120,60)
        return raw

    @app.post('/api/internal/entitlements')
    async def receipt(request:Request):
        raw=await trusted(request)
        try:data=Receipt.model_validate_json(raw)
        except ValueError:raise HTTPException(422,'Invalid entitlement event')
        try:duplicate=await request.app.state.db.apply_receipt(data.model_dump(),hashlib.sha256(raw).hexdigest())
        except ValueError:raise HTTPException(409,'Event or grant identity conflict')
        return {'ok':True,'duplicate':duplicate}

    @app.post('/api/internal/aida/usage')
    async def usage(request:Request):
        raw=await trusted(request)
        try:data=Usage.model_validate_json(raw)
        except ValueError:raise HTTPException(422,'Invalid usage event')
        if data.guild_id:await permissions_for(request,int(data.guild_id),int(data.user_id))
        access=await resolve(request,int(data.user_id),int(data.guild_id) if data.guild_id else None)
        if not access['aida']['enabled']:raise HTTPException(403,'AIDA allowance unavailable')
        q=access['aida']
        try:duplicate=await request.app.state.db.consume_ai(data.event_id,q['scope'],q['subject_id'],q['period'],data.tokens,q['monthly_tokens'],hashlib.sha256(raw).hexdigest())
        except OverflowError:raise HTTPException(402,'AIDA allowance exhausted')
        except ValueError:raise HTTPException(409,'Usage event conflict')
        return {'ok':True,'duplicate':duplicate}
