"""ASGI contract tests with a memory repository and mocked Discord, no live API."""
import hashlib,hmac,json,time
from datetime import datetime,timedelta,timezone
from types import SimpleNamespace
from pathlib import Path
from urllib.parse import parse_qs,urlparse
import httpx,pytest,pytest_asyncio
from app.main import app,limiter
from app.db import ModuleConflict
from app.config import Settings
from app.status import TTL
from app.entitlements import tier_for,support_grant,verify_internal
from app.billing import Receipt
from app import discord as dc

class MemoryDb:
    def __init__(self):self.sessions={};self.grants=[];self.events={};self.used=0;self.usage={};self.modules={}
    async def create_session(self,h,user,guilds,csrf,ttl):self.sessions[h]={'user_id':int(user['id']),'username':user['username'],'avatar':None,'guilds':guilds,'csrf':csrf}
    async def get_session(self,h):return self.sessions.get(h)
    async def delete_session(self,h):self.sessions.pop(h,None)
    async def get_guild(self,g):return {'language':'it','modules':self.modules}
    async def history(self,g,l):return []
    async def set_module(self,g,k,v,u,expected_active):
        if bool(self.modules.get(k,False))!=expected_active:raise ModuleConflict()
        self.modules[k]=v
    async def entitlements(self,k,s):return [g for g in self.grants if g['subject_type']==k and g['subject_id']==s]
    async def ai_used(self,*args):return self.used
    async def apply_receipt(self,e,d):
        if e['event_id'] in self.events:
            if self.events[e['event_id']]!=d:raise ValueError()
            return True
        self.events[e['event_id']]=d;self.grants=[{**e,'source':'purchase'}];return False
    async def consume_ai(self,id,k,s,p,t,l,d):
        if id in self.usage:
            if self.usage[id]!=d:raise ValueError()
            return True
        if self.used+t>l:raise OverflowError()
        self.used+=t;self.usage[id]=d;return False

@pytest_asyncio.fixture
async def setup(monkeypatch,tmp_path):
    config=json.loads((Path(__file__).resolve().parents[1]/'policy.example.json').read_text());config['tiers']['vip']['monthly_ai_tokens']=100
    path=tmp_path/'policy.json';path.write_text(json.dumps(config))
    from cryptography.fernet import Fernet
    app.state.s=Settings(policy_file=str(path),billing_secret='b'*40,data_keys=Fernet.generate_key().decode())
    app.state.db=MemoryDb();app.state.cache=TTL();limiter.hits.clear();state={'manage':True}
    monkeypatch.setenv('DISCORD_BOT_TOKEN','test-only-bot-token')
    def discord(req):
        path=req.url.path
        if req.method=='DELETE' and path.endswith('/users/@me/guilds/111'):state['deleted']=True;return httpx.Response(204)
        if path.endswith('/users/@me/guilds'):return httpx.Response(200,json=[{'id':'111'},{'id':'222'}])
        if path.endswith('/members/999'):return httpx.Response(200,json={'roles':['9'] if state['manage'] else [],'premium_since':None})
        if path.endswith('/roles'):return httpx.Response(200,json=[{'id':'111','name':'everyone','permissions':'0'},{'id':'9','name':'Manager','permissions':'8' if state.get('admin') else '32'}])
        if path.endswith('/guilds/111'):return httpx.Response(200,json={'id':'111','owner_id':'1'})
        return httpx.Response(404,json={})
    app.state.http=httpx.AsyncClient(transport=httpx.MockTransport(discord))
    async def exchange(*a):return 'test-oauth-token'
    async def me(*a):return {'id':'999','username':'Kitsune'}
    async def guilds(*a):return [{'id':'111','name':'Dojo','permissions':'32'},{'id':'222','name':'Read only','permissions':'0'},{'id':'333','name':'Invite','owner':True,'permissions':'0'}]
    async def revoke(*a):pass
    for name,fn in [('exchange_code',exchange),('fetch_me',me),('fetch_guilds',guilds),('revoke',revoke)]:monkeypatch.setattr(dc,name,fn)
    async with httpx.AsyncClient(transport=httpx.ASGITransport(app=app),base_url='https://iyokai.dev') as client:yield client,state
    await app.state.http.aclose()

async def login(c):
    r=await c.get('/api/auth/login');assert 'prompt=none' not in r.headers['location']
    q=parse_qs(urlparse(r.headers['location']).query);assert q['code_challenge_method']==['S256']
    r=await c.get('/api/auth/callback',params={'code':'ok','state':q['state'][0]});assert r.status_code==303
    return (await c.get('/api/me')).json()

async def test_server_list_includes_manage_readonly_and_invitable(setup):
    c,state=setup;me=await login(c)
    assert len(me['guilds'])==3
    assert me['guilds'][0]['bot_present'] and me['guilds'][0]['can_manage']
    assert not me['guilds'][1]['can_manage']
    assert 'guild_id=333' in me['guilds'][2]['invite_url']
    r=await c.get('/api/guilds/111');assert r.status_code==200 and r.json()['access']['role']=='manager'
    state['manage']=False
    assert (await c.get('/api/guilds/111')).status_code==403
    assert (await c.patch('/api/guilds/111/modules/automod',json={'active':True,'expected_active':False},headers={'Origin':'https://iyokai.dev','X-CSRF-Token':me['csrf']})).status_code==403

async def test_csrf_membership_identity_and_checkout_fail_closed(setup):
    c,_=setup
    assert (await c.get('/api/me')).status_code==401
    me=await login(c)
    assert (await c.patch('/api/guilds/111/modules/automod',json={'active':True,'expected_active':False})).status_code==403
    assert (await c.get('/api/guilds/444')).status_code==403
    assert (await c.get('/api/me?identity=invalid')).status_code==404
    assert (await c.post('/api/billing/checkout',headers={'Origin':'https://iyokai.dev','X-CSRF-Token':me['csrf']})).status_code==503
    assert not (await c.get('/api/plans')).json()['checkout_ready']

def signed(raw):
    stamp=str(int(time.time()));return {'X-iYokai-Signature':f't={stamp},v1='+hmac.new(b'b'*40,stamp.encode()+b'.'+raw,hashlib.sha256).hexdigest(),'Content-Type':'application/json'}

async def test_signed_receipt_replay_and_quota_are_not_browser_upgrades(setup):
    c,_=setup;await login(c);now=datetime.now(timezone.utc)
    event={'event_id':'paid-1','grant_id':'sub-1','subject_type':'user','subject_id':'999','tier':'vip','cycle':'monthly','active':True,'occurred_at':now.isoformat(),'starts_at':now.isoformat(),'expires_at':(now+timedelta(days=30)).isoformat()}
    raw=json.dumps(event).encode()
    assert (await c.post('/api/internal/entitlements',content=raw)).status_code==403
    assert (await c.post('/api/internal/entitlements',content=raw,headers=signed(raw))).json()=={'ok':True,'duplicate':False}
    assert (await c.post('/api/internal/entitlements',content=raw,headers=signed(raw))).json()['duplicate']
    changed=json.dumps({**event,'tier':'premium'}).encode()
    assert (await c.post('/api/internal/entitlements',content=changed,headers=signed(changed))).status_code==409
    access=(await c.get('/api/me/entitlements')).json();assert access['tier']=='vip' and access['aida']['remaining_tokens']==100
    use=json.dumps({'event_id':'ai-1','user_id':'999','tokens':60}).encode()
    assert (await c.post('/api/internal/aida/usage',content=use,headers=signed(use))).status_code==200
    assert (await c.post('/api/internal/aida/usage',content=use,headers=signed(use))).json()['duplicate']
    use2=json.dumps({'event_id':'ai-2','user_id':'999','tokens':60}).encode()
    assert (await c.post('/api/internal/aida/usage',content=use2,headers=signed(use2))).status_code==402
    assert (await c.get('/api/me/entitlements')).json()['aida']['remaining_tokens']==40

def test_expiry_revocation_boost_roles_and_signature_expiry():
    now=datetime.now(timezone.utc)
    assert tier_for([{'tier':'vip','active':False},{'tier':'vip','expires_at':now-timedelta(seconds=1)},{'tier':'premium','expires_at':now+timedelta(days=1)}])['tier']=='premium'
    assert support_grant({'boost_tier':'premium'},{'premium_since':now.isoformat(),'roles':[]})['tier']=='premium'
    assert support_grant({'boost_tier':'premium'},{'premium_since':None,'roles':[]}) is None
    assert support_grant({'vip_roles':['7']},{'roles':['7']})['tier']=='vip'
    assert support_grant({'vip_roles':['7']},{'roles':['7'],'pending':True}) is None
    with pytest.raises(Exception):verify_internal('b'*40,'t=1,v1=no',b'{}')
    with pytest.raises(ValueError):Receipt(event_id='e',grant_id='g',subject_type='user',subject_id='1',tier='premium',cycle='monthly',active=True,occurred_at=now,starts_at=now)

async def test_paid_module_requires_verified_tier_and_missing_bot_fails_closed(setup,monkeypatch):
    c,_=setup;me=await login(c)
    path=Path(app.state.s.policy_file);rules=json.loads(path.read_text());rules['feature_tiers']={'automod':'vip'};path.write_text(json.dumps(rules))
    headers={'Origin':'https://iyokai.dev','X-CSRF-Token':me['csrf']}
    assert (await c.patch('/api/guilds/111/modules/automod',json={'active':True,'expected_active':False},headers=headers)).status_code==403
    # Downgrades can always turn a module off; they cannot turn it on again.
    assert (await c.patch('/api/guilds/111/modules/automod',json={'active':False,'expected_active':False},headers=headers)).status_code==200
    app.state.db.grants=[{'tier':'vip','active':True,'subject_type':'user','subject_id':'999'}]
    assert (await c.patch('/api/guilds/111/modules/automod',json={'active':True,'expected_active':False},headers=headers)).status_code==200
    monkeypatch.delenv('DISCORD_BOT_TOKEN');app.state.cache=TTL()
    assert (await c.get('/api/me')).status_code==503
    assert (await c.patch('/api/guilds/111/modules/automod',json={'active':True,'expected_active':False},headers=headers)).status_code==503


async def test_remember_choice_and_bot_removal_guards(setup):
    c,state=setup
    first=await c.get('/api/auth/login');q=parse_qs(urlparse(first.headers['location']).query)
    callback=await c.get('/api/auth/callback',params={'code':'ok','state':q['state'][0]})
    cookie=next(v for v in callback.headers.get_list('set-cookie') if v.startswith('__Host-iy_sid='))
    assert 'Max-Age' not in cookie and 'HttpOnly' in cookie and 'Secure' in cookie
    first=await c.get('/api/auth/login?remember=true');q=parse_qs(urlparse(first.headers['location']).query)
    callback=await c.get('/api/auth/callback',params={'code':'ok','state':q['state'][0]})
    cookie=next(v for v in callback.headers.get_list('set-cookie') if v.startswith('__Host-iy_sid='))
    assert 'Max-Age=604800' in cookie
    me=(await c.get('/api/me')).json();headers={'Origin':'https://iyokai.dev','X-CSRF-Token':me['csrf']}
    assert (await c.request('DELETE','/api/guilds/111/bot',json={'confirm_guild_id':'111'})).status_code==403
    assert (await c.request('DELETE','/api/guilds/111/bot',json={'confirm_guild_id':'111'},headers=headers)).status_code==403
    state['admin']=True
    assert (await c.request('DELETE','/api/guilds/111/bot',json={'confirm_guild_id':'222'},headers=headers)).status_code==422
    result=await c.request('DELETE','/api/guilds/111/bot',json={'confirm_guild_id':'111'},headers=headers)
    assert result.status_code==200 and result.json()['removed'] and state['deleted']

async def test_module_access_metadata_matches_enforced_tier_and_revocation(setup):
    c,_=setup;me=await login(c)
    path=Path(app.state.s.policy_file);rules=json.loads(path.read_text());rules['feature_tiers']={'automod':'vip','music':'premium','anti_raid':'invalid'};path.write_text(json.dumps(rules))
    def modules(response):return {m['key']:m for m in response.json()['modules']}
    rows=modules(await c.get('/api/guilds/111'))
    assert rows['automod']['required_tier']=='vip' and not rows['automod']['can_enable']
    assert rows['music']['required_tier']=='premium' and not rows['music']['can_enable']
    assert rows['tickets']['required_tier']=='free' and rows['tickets']['can_enable']
    assert not rows['anti_raid']['can_enable']
    app.state.db.grants=[{'tier':'premium','active':True,'subject_type':'user','subject_id':'999'}]
    rows=modules(await c.get('/api/guilds/111'))
    assert rows['music']['can_enable'] and not rows['automod']['can_enable']
    app.state.db.grants=[{'tier':'vip','active':True,'subject_type':'user','subject_id':'999'}]
    rows=modules(await c.get('/api/guilds/111'));assert rows['automod']['can_enable'] and not rows['anti_raid']['can_enable']
    app.state.db.grants=[];app.state.db.modules['automod']=True
    rows=modules(await c.get('/api/guilds/111'));assert rows['automod']['active'] and not rows['automod']['can_enable']
    headers={'Origin':'https://iyokai.dev','X-CSRF-Token':me['csrf']}
    assert (await c.patch('/api/guilds/111/modules/automod',json={'active':False,'expected_active':True},headers=headers)).status_code==200

async def test_logout_revokes_session_for_all_panel_reads_and_writes(setup):
    c,_=setup;me=await login(c);headers={'Origin':'https://iyokai.dev','X-CSRF-Token':me['csrf']}
    assert (await c.post('/api/auth/logout',headers=headers)).status_code==200
    assert (await c.get('/api/me')).status_code==401
    assert (await c.get('/api/guilds/111')).status_code==401
    assert (await c.get('/api/guilds/111/history')).status_code==401
    assert (await c.patch('/api/guilds/111/modules/automod',json={'active':True,'expected_active':False},headers=headers)).status_code==401


async def test_stale_module_write_returns_conflict_without_overwriting(setup):
    c,_=setup;me=await login(c);headers={'Origin':'https://iyokai.dev','X-CSRF-Token':me['csrf']}
    path='/api/guilds/111/modules/automod'
    app.state.db.modules['automod']=True
    response=await c.patch(path,json={'active':True,'expected_active':False},headers=headers)
    assert response.status_code==409 and response.json()['detail']['code']=='module_conflict'
    assert app.state.db.modules['automod'] is True
    modules=(await c.get('/api/guilds/111')).json()['modules']
    assert next(m for m in modules if m['key']=='automod')['active'] is True
    assert (await c.patch(path,json={'active':False,'expected_active':True},headers=headers)).status_code==200
    assert app.state.db.modules['automod'] is False

async def test_module_write_requires_boolean_snapshot_and_handles_deleted_configuration(setup,monkeypatch):
    c,_=setup;me=await login(c);headers={'Origin':'https://iyokai.dev','X-CSRF-Token':me['csrf']};path='/api/guilds/111/modules/automod'
    for payload in [{'active':True},{'active':'true','expected_active':False},{'active':True,'expected_active':0}]:
        assert (await c.patch(path,json=payload,headers=headers)).status_code==422
    async def deleted(*args):raise LookupError('missing')
    monkeypatch.setattr(app.state.db,'set_module',deleted)
    response=await c.patch(path,json={'active':True,'expected_active':False},headers=headers)
    assert response.status_code==409 and response.json()['detail']['code']=='configuration_unavailable'

async def test_settings_fail_closed_without_bridge(setup):
    c,state=setup;me=await login(c)
    assert (await c.get('/api/guilds/111/settings')).status_code==503
    headers={'Origin':'https://iyokai.dev','X-CSRF-Token':me['csrf']}
    assert (await c.patch('/api/guilds/111/settings/role',json={'kind':'admin','role_id':'9'},headers=headers)).status_code==503
    assert (await c.get('/api/owner/capabilities')).status_code==503

async def test_contact_requires_session_csrf_and_records_only_after_success(setup,monkeypatch):
    c,state=setup
    body={'topic':'lifetime','message':'Test contact request without any credentials.','language':'it'}
    assert (await c.post('/api/contact',json=body)).status_code==401
    me=await login(c);saved=[]
    async def create(*args):saved.append(args);return 'test-ticket'
    monkeypatch.setattr(app.state.db,'create_contact',create,raising=False)
    async def delivery(*args):pass
    monkeypatch.setattr(app.state.db,'contact_delivery',delivery,raising=False)
    assert (await c.post('/api/contact',json=body)).status_code==403
    headers={'Origin':'https://iyokai.dev','X-CSRF-Token':me['csrf']}
    r=await c.post('/api/contact',json=body,headers=headers)
    assert r.status_code==201 and r.json()['id']=='test-ticket' and saved[0][0]==999
    assert saved[0][2].startswith('fernet:v1:') and body['message'] not in saved[0][2]
    assert r.json()['delivery']=='unconfigured'
    assert (await c.post('/api/contact',json={**body,'topic':'arbitrary'},headers=headers)).status_code==422

async def test_private_bridge_signs_user_and_never_retries_mutation(setup):
    from dataclasses import replace
    c,state=setup;me=await login(c)
    app.state.s=replace(app.state.s,bot_bridge_url='http://bot.internal:8423',bot_bridge_secret='z'*40)
    calls=[]
    def transport(req):
        calls.append(req)
        stamp=req.headers['X-iYokai-Time'];nonce=req.headers['X-iYokai-Nonce']
        expected=hmac.new(b'z'*40,stamp.encode()+b'.'+nonce.encode()+b'.'+req.content,hashlib.sha256).hexdigest()
        assert hmac.compare_digest(req.headers['X-iYokai-MAC'],expected)
        payload=json.loads(req.content);assert payload['user_id']=='999'
        return httpx.Response(403)
    await app.state.http.aclose();app.state.http=httpx.AsyncClient(transport=httpx.MockTransport(transport))
    headers={'Origin':'https://iyokai.dev','X-CSRF-Token':me['csrf']}
    r=await c.patch('/api/guilds/111/settings/language',json={'language':'en'},headers=headers)
    assert r.status_code==403 and len(calls)==1

async def test_request_body_limits_include_chunked_bodies(setup):
    c,_=setup
    r=await c.post('/api/contact',content=b'x'*65537)
    assert r.status_code==413
    async def stream():
        yield b'x'*40000
        yield b'y'*40000
    r=await c.post('/api/contact',content=stream())
    assert r.status_code==413
