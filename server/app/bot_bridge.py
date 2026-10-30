"""Authenticated private transport to the adapter running inside the bot.
Never retries a mutation and never falls back to direct configuration SQL.
"""
import hashlib, hmac, json, secrets, time
from urllib.parse import urlsplit
from fastapi import HTTPException

async def call(request, action, user_id, guild_id=None, **values):
    s=request.app.state.s
    url=getattr(s,'bot_bridge_url','')
    key=getattr(s,'bot_bridge_secret','')
    parsed=urlsplit(url)
    if not url or len(key)<32 or parsed.scheme not in ('http','https') or parsed.username or parsed.password:
        raise HTTPException(503, {'code':'bot_bridge_unavailable'})
    body=json.dumps({'action':action,'user_id':str(user_id),'guild_id':str(guild_id) if guild_id else None,**values},separators=(',',':')).encode()
    timestamp=str(int(time.time()));nonce=secrets.token_hex(16)
    signature=hmac.new(key.encode(),timestamp.encode()+b'.'+nonce.encode()+b'.'+body,hashlib.sha256).hexdigest()
    try:
        r=await request.app.state.http.post(url.rstrip('/')+'/v1/request',content=body,headers={'Content-Type':'application/json','X-iYokai-Time':timestamp,'X-iYokai-Nonce':nonce,'X-iYokai-MAC':signature})
    except Exception:
        raise HTTPException(503,{'code':'bot_bridge_unavailable'}) from None
    if r.status_code in (400,403,404,409,422,429):
        raise HTTPException(r.status_code,{'code':'bot_request_rejected'})
    if r.status_code!=200:raise HTTPException(503,{'code':'bot_bridge_unavailable'})
    try:return r.json()
    except ValueError:raise HTTPException(503,{'code':'bot_bridge_unavailable'}) from None
