"""Install in the BOT process; bind only on a private network (see README).
The site asserts the authenticated user, the bot rechecks guild authorization.
No secrets, arbitrary commands, eval, or SQL supplied by the browser.
"""
import hashlib, hmac, json, re, time
from collections import OrderedDict
from aiohttp import web

ACTIONS={'profile','settings','language','role','history','capabilities'}

def build_site_bridge(bot, secret, *, bridge=None, owner_id=None):
    if len(secret)<32:raise ValueError('Bridge secret must have at least 32 characters')
    if bridge is None:
        from core import panel_bridge as bridge
    if owner_id is None:
        from core.config import config
        owner_id=config.OWNER_ID
    seen=OrderedDict()
    async def handle(request):
        raw=await request.read()
        stamp=request.headers.get('X-iYokai-Time','');nonce=request.headers.get('X-iYokai-Nonce','');mac=request.headers.get('X-iYokai-MAC','')
        now=int(time.time())
        if len(stamp)>12 or not stamp.isdigit() or abs(now-int(stamp))>60 or not re.fullmatch('[0-9a-f]{32}',nonce):raise web.HTTPForbidden()
        expected=hmac.new(secret.encode(),stamp.encode()+b'.'+nonce.encode()+b'.'+raw,hashlib.sha256).hexdigest()
        if not hmac.compare_digest(mac,expected):raise web.HTTPForbidden()
        while seen and next(iter(seen.values()))<now-120:seen.popitem(last=False)
        if nonce in seen:raise web.HTTPConflict()
        if len(seen)>=10000:raise web.HTTPTooManyRequests()
        seen[nonce]=now
        try:
            data=json.loads(raw)
            if not isinstance(data,dict):raise ValueError()
            uid=data['user_id'];action=data['action']
            if not isinstance(uid,str) or not uid.isdigit() or not 0<int(uid)<2**63 or action not in ACTIONS:raise ValueError()
            uid=int(uid)
        except (ValueError,KeyError,TypeError):raise web.HTTPBadRequest() from None
        if action=='profile':
            return web.json_response({'is_bot_owner':uid==int(owner_id),'guilds':[{'id':str(g.id),'name':g.name,'can_manage':True,'bot_present':True} for g in await bridge.server_gestibili(bot,uid)]})
        if action=='capabilities':
            if uid!=int(owner_id):raise web.HTTPForbidden()
            return web.json_response({'members_requested':bool(bot.intents.members),'message_content_requested':bool(bot.intents.message_content),'portal_approval_verified':False,'tier_model':['free','premium'],'vip_enforcement_ready':False})
        gid=data.get('guild_id')
        if not isinstance(gid,str) or not gid.isdigit() or not 0<int(gid)<2**63:raise web.HTTPBadRequest()
        guild=await bridge.server_gestibile(bot,int(gid),uid)
        if guild is None:raise web.HTTPForbidden()
        try:
            if action=='settings':
                state=await bridge.stato_server(guild)
                def ids(rows):return [{**r,'id':str(r['id'])} for r in rows]
                state['ruoli_server']=ids(state['ruoli_server'])
                state['ruoli_bot']=[{**r,'attuale':str(r['attuale']) if r['attuale'] is not None else None} for r in state['ruoli_bot']]
                return web.json_response(state)
            if action=='language':
                code=data.get('language')
                if not isinstance(code,str) or len(code)>20:raise web.HTTPBadRequest()
                return web.json_response({'language':await bridge.applica_lingua(guild,code,uid)})
            if action=='role':
                kind=data.get('kind');rid=data.get('role_id')
                if kind not in ('admin','mod','modban') or (rid is not None and (not isinstance(rid,str) or not rid.isdigit() or not 0<int(rid)<2**63)):raise web.HTTPBadRequest()
                await bridge.applica_ruolo(guild,kind,int(rid) if rid else None,uid)
                return web.json_response({'ok':True})
            if action=='history':
                rows=await bridge.storico(guild.id)
                return web.json_response({'items':[{ 'key':str(r.get('key_name','')), 'new':r.get('new_value'), 'by':str(r['changed_by']) if r.get('changed_by') else None,'at':r['created_at'].isoformat()} for r in rows]})
        except ValueError:raise web.HTTPUnprocessableEntity() from None
        return web.json_response({'error':'unsupported'},status=400)
    app=web.Application(client_max_size=8192)
    app.router.add_post('/v1/request',handle)
    return app
