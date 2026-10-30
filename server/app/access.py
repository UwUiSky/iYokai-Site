import os
from urllib.parse import urlencode
from fastapi import HTTPException
from .entitlements import policy
from .discord import MANAGE_GUILD, ADMIN, API

def identity(s,key="core"):
    for item in policy(s)["identities"]:
        if item["id"]==key:
            return {**item,"client_id":item.get("client_id") or (s.client_id if key=="core" else "")}
    raise HTTPException(404,"Unknown identity")

async def bot_get(request,path,key="core",missing_ok=False):
    item=identity(request.app.state.s,key);token=os.environ.get(item.get("token_env",""),"")
    if not token: raise HTTPException(503,"Discord identity not configured")
    try:
        r=await request.app.state.http.get(API+path,headers={"Authorization":"Bot "+token})
    except Exception: raise HTTPException(503,"Discord unavailable")
    if missing_ok and r.status_code==404: return None
    if r.status_code!=200: raise HTTPException(503,"Discord verification unavailable")
    return r.json()

async def bot_guild_ids(request,key="core"):
    async def fetch():
        result=set();after="0"
        for _ in range(100):
            rows=await bot_get(request,f"/users/@me/guilds?limit=200&after={after}",key)
            result.update(str(g["id"]) for g in rows)
            if len(rows)<200:return result
            after=str(max(int(g["id"]) for g in rows))
        raise HTTPException(503,"Guild list incomplete")
    return await request.app.state.cache.get("bot-guilds:"+key,30,fetch)

def invite_url(s,gid,key="core"):
    item=identity(s,key)
    if not item["client_id"]:return None
    return "https://discord.com/oauth2/authorize?"+urlencode({"client_id":item["client_id"],"scope":"bot applications.commands","permissions":item.get("invite_permissions","0"),"guild_id":str(gid),"disable_guild_select":"true"})

async def permissions_for(request,gid,user_id,key="core"):
    # Rechecked on every configuration read/write. No seven-day permission cache.
    member=await bot_get(request,f"/guilds/{gid}/members/{user_id}",key,True)
    if not member or member.get("pending"): raise HTTPException(403,"No longer a server member")
    guild=await bot_get(request,f"/guilds/{gid}",key)
    roles=await bot_get(request,f"/guilds/{gid}/roles",key)
    ids={str(gid),*map(str,member.get("roles",[]))};permissions=0
    for role in roles:
        if str(role["id"]) in ids:permissions|=int(role.get("permissions",0))
    owner=str(guild.get("owner_id"))==str(user_id)
    return {"can_manage":owner or bool(permissions&(MANAGE_GUILD|ADMIN)),"role":"owner" if owner else "administrator" if permissions&ADMIN else "manager" if permissions&MANAGE_GUILD else "member","roles":[{"id":str(r["id"]),"name":r["name"]} for r in roles if str(r["id"]) in ids],"permissions":str(permissions)}

async def leave_guild(request,gid,key='core'):
    item=identity(request.app.state.s,key);token=os.environ.get(item.get('token_env',''),'')
    if not token:raise HTTPException(503,'Discord identity not configured')
    try:r=await request.app.state.http.delete(API+f'/users/@me/guilds/{gid}',headers={'Authorization':'Bot '+token})
    except Exception:raise HTTPException(503,'Discord unavailable')
    if r.status_code!=204:raise HTTPException(503,'Bot removal not confirmed by Discord')
    request.app.state.cache.v.pop('bot-guilds:'+key,None)
