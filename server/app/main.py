import secrets
from contextlib import asynccontextmanager
from urllib.parse import urlencode
from fastapi import Depends, FastAPI, HTTPException, Request
from fastapi.responses import JSONResponse, RedirectResponse
from pydantic import BaseModel
from . import discord as dc
from .config import get_settings
from .db import Db
from .modules import MODULES
from .security import RateLimiter, client_ip, derive, hash_sid, pkce_pair, sign, unsign

limiter = RateLimiter()
MAX_ID = 2**63 - 1

@asynccontextmanager
async def lifespan(app: FastAPI):
    app.state.s = get_settings()
    app.state.db = await Db.connect(app.state.s.database_url, app.state.s.auto_migrate)
    yield
    await app.state.db.close()

app = FastAPI(title="iYokai Panel API", docs_url=None, redoc_url=None, openapi_url=None, lifespan=lifespan)

@app.middleware("http")
async def secure_headers(request: Request, call_next):
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

async def guild_for(request: Request, gid: int, sess: dict) -> int:
    if not 0 < gid <= MAX_ID or str(gid) not in {g["id"] for g in sess["guilds"]}:
        raise HTTPException(403, "Server non consentito")
    if gid not in await request.app.state.db.bot_guilds([gid]):
        raise HTTPException(404, "Il bot non è in questo server")
    return gid

@app.get("/api/health")
async def health():
    return {"ok": True}

@app.get("/api/auth/login")
async def login(request: Request):
    hit(request, "login", 10, 60)
    s = request.app.state.s
    verifier, challenge = pkce_pair()
    state = secrets.token_urlsafe(24)
    url = "https://discord.com/oauth2/authorize?" + urlencode({"client_id": s.client_id, "redirect_uri": s.redirect_uri, "response_type": "code", "scope": "identify guilds",
                                                                "state": state, "code_challenge": challenge, "code_challenge_method": "S256", "prompt": "none"})
    resp = RedirectResponse(url, 303)
    resp.set_cookie(oauth_name(s), sign(derive(s.secret_key, "oauth"), {"s": state, "v": verifier}, 600), max_age=600, httponly=True, secure=s.cookie_secure, samesite="lax", path="/api/auth")
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
    await db.create_session(hash_sid(sid), user, dc.manageable(guilds), csrf, s.session_ttl)
    resp = RedirectResponse(f"{s.site_origin}/#panel", 303)
    resp.set_cookie(sid_name(s), sid, max_age=s.session_ttl, httponly=True, secure=s.cookie_secure, samesite="lax", path="/")
    resp.delete_cookie(oauth_name(s), path="/api/auth")
    return resp

@app.get("/api/me")
async def me(request: Request, sess=Depends(session)):
    hit(request, "me", 120, 60, str(sess["user_id"]))
    present = await request.app.state.db.bot_guilds([int(g["id"]) for g in sess["guilds"]])
    return {"user": {"id": str(sess["user_id"]), "name": sess["username"], "avatar": sess["avatar"]}, "csrf": sess["csrf"],
            "guilds": [g for g in sess["guilds"] if int(g["id"]) in present]}

@app.post("/api/auth/logout")
async def logout(request: Request, sess=Depends(guard)):
    s = request.app.state.s
    await request.app.state.db.delete_session(hash_sid(request.cookies[sid_name(s)]))
    resp = JSONResponse({"ok": True})
    resp.delete_cookie(sid_name(s), path="/")
    return resp

@app.get("/api/guilds/{gid}")
async def guild(gid: int, request: Request, sess=Depends(session)):
    hit(request, "g", 120, 60, str(sess["user_id"]))
    gid = await guild_for(request, gid, sess)
    g = await request.app.state.db.get_guild(gid)
    name = next(x["name"] for x in sess["guilds"] if x["id"] == str(gid))
    return {"id": str(gid), "name": name, "language": g["language"],
            "modules": [{"key": k, "label": lab, "group": grp, "active": bool(g["modules"].get(k, False))} for k, (lab, grp) in MODULES.items()]}

class Toggle(BaseModel):
    active: bool

@app.patch("/api/guilds/{gid}/modules/{key}")
async def toggle(gid: int, key: str, body: Toggle, request: Request, sess=Depends(guard)):
    hit(request, "w", 30, 60, str(sess["user_id"]))
    if key not in MODULES:
        raise HTTPException(404, "Modulo sconosciuto")
    gid = await guild_for(request, gid, sess)
    await request.app.state.db.set_module(gid, key, body.active, sess["user_id"])
    return {"key": key, "active": body.active}

@app.get("/api/guilds/{gid}/history")
async def history(gid: int, request: Request, limit: int = 20, sess=Depends(session)):
    hit(request, "h", 60, 60, str(sess["user_id"]))
    gid = await guild_for(request, gid, sess)
    return {"items": await request.app.state.db.history(gid, max(1, min(limit, 50)))}
