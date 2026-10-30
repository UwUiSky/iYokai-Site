import secrets
import httpx
from contextlib import asynccontextmanager
from urllib.parse import urlencode
from fastapi import Depends, FastAPI, HTTPException, Request
from fastapi.responses import JSONResponse, RedirectResponse
from pydantic import BaseModel, StrictBool
from . import discord as dc
from .access import leave_guild, bot_guild_ids, permissions_for, invite_url, identity as get_identity
from .entitlements import policy, RANK
from .billing import resolve, install_billing
from .config import get_settings
from .db import Db, ModuleConflict
from .modules import MODULES
from .status import TTL, twitch_live, youtube_feed
from .security import RateLimiter, client_ip, derive, hash_sid, pkce_pair, sign, unsign

limiter = RateLimiter()
MAX_ID = 2**63 - 1

@asynccontextmanager
async def lifespan(app: FastAPI):
    app.state.s = get_settings()
    app.state.db = await Db.connect(app.state.s.database_url, app.state.s.auto_migrate)
    app.state.http, app.state.cache = httpx.AsyncClient(timeout=6, follow_redirects=False), TTL()
    yield
    await app.state.http.aclose()
    await app.state.db.close()

app = FastAPI(title="iYokai Panel API", docs_url=None, redoc_url=None, openapi_url=None, lifespan=lifespan)

@app.middleware("http")
async def secure_headers(request: Request, call_next):
    if request.method in ('POST','PATCH','PUT'):
        size=request.headers.get('content-length','')
        if size and (not size.isascii() or not size.isdigit() or int(size)>65536):
            return JSONResponse({'detail':'Request too large'},status_code=413)
        # Count streamed bytes as well: Content-Length is not a security boundary.
        total=0
        chunks=[]
        async for chunk in request.stream():
            total+=len(chunk)
            chunks.append(chunk)
            if total>65536:return JSONResponse({'detail':'Request too large'},status_code=413)
        # Replay the bounded body for the downstream validator.
        request._body = b''.join(chunks)
    r = await call_next(request)
    r.headers.update({"Cache-Control": "no-store", "X-Content-Type-Options": "nosniff", "Referrer-Policy": "no-referrer"})
    return r

def sid_name(s): return "__Host-iy_sid" if s.cookie_secure else "iy_sid"
def oauth_name(s): return "__Secure-iy_oauth" if s.cookie_secure else "iy_oauth"

def hit(request: Request, name: str, limit: int, window: int, who: str | None = None):
    key = f"{name}:{who or client_ip(request, request.app.state.s.trust_cf)}"
    if not limiter.allow(key, limit, window):
        raise HTTPException(429, "Troppe richieste")

async def session(request: Request):
    s = request.app.state.s
    sid = request.cookies.get(sid_name(s))
    row = await request.app.state.db.get_session(hash_sid(sid)) if sid and len(sid) < 200 else None
    if not row:
        raise HTTPException(401, "Non autenticato")
    return row

def guard(request: Request, sess=Depends(session)):
    """Richieste che modificano dati: Origin del sito + token CSRF della sessione."""
    if request.headers.get("origin") != request.app.state.s.site_origin:
        raise HTTPException(403, "Origine non valida")
    if not secrets.compare_digest(request.headers.get("x-csrf-token", ""), sess["csrf"]):
        raise HTTPException(403, "Token CSRF non valido")
    return sess

async def guild_for(request: Request, gid: int, sess: dict, identity: str = 'core') -> int:
    if not 0 < gid <= MAX_ID or str(gid) not in {g['id'] for g in sess['guilds']}:
        raise HTTPException(403,'Server non consentito')
    if str(gid) not in await bot_guild_ids(request,identity):raise HTTPException(404,'Bot assente')
    access=await permissions_for(request,gid,sess['user_id'],identity)
    if not access['can_manage']:raise HTTPException(403,'Permessi insufficienti')
    request.state.guild_access=access
    return gid

@app.get('/api/panel/config')
async def panel_config(request:Request):
    import os
    s=request.app.state.s
    return {'identities':[{'id':i['id'],'name':i['name'],'configured':bool(os.environ.get(i.get('token_env',''))) and bool(get_identity(s,i['id'])['client_id'])} for i in policy(s)['identities']]}

@app.get("/api/health")
async def health():
    return {"ok": True}

@app.get("/api/status")
async def status(request: Request):
    """Pubblico: Twitch live/offline e date degli ultimi video YouTube (il conteggio dei nuovi lo fa il browser)."""
    hit(request, "st", 60, 60)
    s, http, cache = request.app.state.s, request.app.state.http, request.app.state.cache
    return {"twitch": await twitch_live(s, http, cache), "youtube": [{"latest": await youtube_feed(http, cache, c)} for c in s.yt_channels]}

@app.get("/api/auth/login")
async def login(request: Request, remember: bool = False):
    hit(request, "login", 10, 60)
    s = request.app.state.s
    verifier, challenge = pkce_pair()
    state = secrets.token_urlsafe(24)
    url = "https://discord.com/oauth2/authorize?" + urlencode({"client_id": s.client_id, "redirect_uri": s.redirect_uri, "response_type": "code", "scope": "identify guilds",
                                                                "state": state, "code_challenge": challenge, "code_challenge_method": "S256"})
    resp = RedirectResponse(url, 303)
    resp.set_cookie(oauth_name(s), sign(derive(s.secret_key, "oauth"), {"s": state, "v": verifier, "remember": remember}, 600), max_age=600, httponly=True, secure=s.cookie_secure, samesite="lax", path="/api/auth")
    return resp

@app.get("/api/auth/callback")
async def callback(request: Request, code: str = "", state: str = ""):
    hit(request, "cb", 20, 60)
    s, db = request.app.state.s, request.app.state.db
    fail = RedirectResponse(f"{s.site_origin}/#panel-error", 303)
    data = unsign(derive(s.secret_key, "oauth"), request.cookies.get(oauth_name(s), ""))
    if not code or not data or not secrets.compare_digest(str(data.get("s")), state):
        return fail
    try:
        token = await dc.exchange_code(s, code, data["v"])
        user, guilds = await dc.fetch_me(token), await dc.fetch_guilds(token)
        await dc.revoke(s, token)  # il token Discord non viene mai salvato
    except Exception:
        return fail
    sid, csrf = secrets.token_urlsafe(32), secrets.token_urlsafe(24)
    persistent=data.get("remember") is True
    ttl=s.session_ttl if persistent else min(s.session_ttl,12*3600)
    await db.create_session(hash_sid(sid), user, dc.guild_profiles(guilds), csrf, ttl)
    resp = RedirectResponse(f"{s.site_origin}/#panel", 303)
    resp.set_cookie(sid_name(s), sid, max_age=s.session_ttl if persistent else None, httponly=True, secure=s.cookie_secure, samesite="lax", path="/")
    resp.delete_cookie(oauth_name(s), path="/api/auth")
    return resp

@app.get('/api/me')
async def me(request:Request,identity:str='core',sess=Depends(session)):
    hit(request,'me',120,60,str(sess['user_id']))
    present=await bot_guild_ids(request,identity)
    result={'user':{'id':str(sess['user_id']),'name':sess['username'],'avatar':sess['avatar']},'csrf':sess['csrf'],'is_bot_owner':False,
      'guilds':[{**g,'bot_present':g['id'] in present,'invite_url':invite_url(request.app.state.s,g['id'],identity) if g.get('can_manage') and g['id'] not in present else None} for g in sess['guilds']]}
    if getattr(request.app.state.s,'bot_bridge_url','') and identity=='core':
        from .bot_bridge import call
        profile=await call(request,'profile',sess['user_id'])
        result['is_bot_owner']=profile.get('is_bot_owner') is True
        merged={g['id']:g for g in result['guilds']}
        for g in profile['guilds']:merged[g['id']]={**merged.get(g['id'],{}),**g}
        result['guilds']=list(merged.values())
    return result

@app.post("/api/auth/logout")
async def logout(request: Request, sess=Depends(guard)):
    s = request.app.state.s
    await request.app.state.db.delete_session(hash_sid(request.cookies[sid_name(s)]))
    resp = JSONResponse({"ok": True})
    resp.delete_cookie(sid_name(s), path="/")
    return resp

@app.get("/api/guilds/{gid}")
async def guild(gid: int, request: Request, identity: str='core', sess=Depends(session)):
    hit(request, "g", 120, 60, str(sess["user_id"]))
    gid = await guild_for(request, gid, sess, identity)
    g = await request.app.state.db.get_guild(gid)
    if g is None:raise HTTPException(409,'Configurazione del bot non sincronizzata')
    access=request.state.guild_access
    allowed=get_identity(request.app.state.s,identity).get('modules',list(MODULES) if identity=='core' else [])
    entitlement = await resolve(request,sess["user_id"],gid)
    requirements = policy(request.app.state.s).get("feature_tiers",{})
    name = next(x["name"] for x in sess["guilds"] if x["id"] == str(gid))
    return {"id": str(gid), "name": name, "language": g["language"], "access":access, "entitlement":entitlement,
            "modules": [{"key": k, "label": lab, "group": grp, "active": bool(g["modules"].get(k, False)), "required_tier": requirements.get(k,"free"), "can_enable": RANK[entitlement["tier"]]>=RANK.get(requirements.get(k,"free"),99)} for k, (lab, grp) in MODULES.items() if k in allowed]}

class Toggle(BaseModel):
    active: StrictBool
    expected_active: StrictBool

@app.patch("/api/guilds/{gid}/modules/{key}")
async def toggle(gid: int, key: str, body: Toggle, request: Request, identity: str='core', sess=Depends(guard)):
    hit(request, "w", 30, 60, str(sess["user_id"]))
    if key not in MODULES:
        raise HTTPException(404, "Modulo sconosciuto")
    gid = await guild_for(request, gid, sess, identity)
    allowed=get_identity(request.app.state.s,identity).get('modules',list(MODULES) if identity=='core' else [])
    if key not in allowed:raise HTTPException(403,'Modulo non disponibile per questa identità')
    required=policy(request.app.state.s).get('feature_tiers',{}).get(key,'free')
    if body.active and RANK[(await resolve(request,sess['user_id'],gid))['tier']]<RANK.get(required,99):raise HTTPException(403,'Tier richiesto')
    try:
        await request.app.state.db.set_module(gid, key, body.active, sess["user_id"], body.expected_active)
    except ModuleConflict:
        raise HTTPException(409, {"code": "module_conflict"})
    except LookupError:
        raise HTTPException(409, {"code": "configuration_unavailable"})
    return {"key": key, "active": body.active}

@app.get("/api/guilds/{gid}/history")
async def history(gid: int, request: Request, limit: int = 20, identity: str='core', sess=Depends(session)):
    hit(request, "h", 60, 60, str(sess["user_id"]))
    gid = await guild_for(request, gid, sess, identity)
    return {"items": await request.app.state.db.history(gid, max(1, min(limit, 50)))}

class RemoveBot(BaseModel):
    confirm_guild_id: str

@app.delete('/api/guilds/{gid}/bot')
async def remove_bot(gid:int,body:RemoveBot,request:Request,identity:str='core',sess=Depends(guard)):
    hit(request,'remove',5,60,str(sess['user_id']))
    await guild_for(request,gid,sess,identity)
    if request.state.guild_access['role'] not in ('owner','administrator'):raise HTTPException(403,'Owner or administrator required')
    if body.confirm_guild_id!=str(gid):raise HTTPException(422,'Guild confirmation required')
    await leave_guild(request,gid,identity)
    return {'removed':True,'guild_id':str(gid),'identity':identity}

install_billing(app,session,guard,guild_for,hit)


# Settings go through the bot's shared command logic, never direct SQL.
class GuildLanguage(BaseModel):
    language: str

class GuildRole(BaseModel):
    kind: str
    role_id: str | None = None

@app.get('/api/guilds/{gid}/settings')
async def settings(gid: int, request: Request, sess=Depends(session)):
    from .bot_bridge import call
    hit(request,'settings',60,60,str(sess['user_id']))
    return await call(request,'settings',sess['user_id'],gid)

@app.patch('/api/guilds/{gid}/settings/language')
async def set_language(gid: int, body: GuildLanguage, request: Request, sess=Depends(guard)):
    from .bot_bridge import call
    hit(request,'settings-write',20,60,str(sess['user_id']))
    return await call(request,'language',sess['user_id'],gid,language=body.language)

@app.patch('/api/guilds/{gid}/settings/role')
async def set_role(gid: int, body: GuildRole, request: Request, sess=Depends(guard)):
    from .bot_bridge import call
    hit(request,'settings-write',20,60,str(sess['user_id']))
    return await call(request,'role',sess['user_id'],gid,kind=body.kind,role_id=body.role_id)

@app.get('/api/owner/capabilities')
async def owner_capabilities(request: Request, sess=Depends(session)):
    from .bot_bridge import call
    hit(request,'owner',30,60,str(sess['user_id']))
    return await call(request,'capabilities',sess['user_id'])


from typing import Literal
from pydantic import Field
class ContactRequest(BaseModel):
    topic: Literal['support','lifetime','privacy']
    message: str = Field(min_length=20,max_length=4000)
    language: str = Field(min_length=2,max_length=20,pattern=r'^[a-zA-Z-]+$')

@app.post('/api/contact', status_code=201)
async def contact(body: ContactRequest, request: Request, sess=Depends(guard)):
    hit(request,'contact',3,3600,str(sess['user_id']))
    message=body.message.strip()
    if len(message)<20:raise HTTPException(422,'Message too short')
    from .vault import encrypt
    from .contact_delivery import deliver
    encrypted=encrypt(request.app.state.s,message)
    key=await request.app.state.db.create_contact(sess['user_id'],body.topic,encrypted,body.language)
    delivery=await deliver(request,key,sess['user_id'],body.topic,message,body.language)
    await request.app.state.db.contact_delivery(key,delivery)
    return {'id':key,'status':'recorded','delivery':delivery}

@app.get('/api/owner/contacts')
async def contacts(request: Request, sess=Depends(session)):
    from .bot_bridge import call
    hit(request,'owner-contacts',20,60,str(sess['user_id']))
    await call(request,'capabilities',sess['user_id']) # Owner checked inside bot process.
    from .vault import decrypt
    rows=await request.app.state.db.contact_requests()
    for row in rows:row['message']=decrypt(request.app.state.s,row['message'])
    return {'items':rows}
