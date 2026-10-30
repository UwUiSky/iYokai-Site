"""One attempted Discord delivery. Never automatically replay an ambiguous POST."""
import json, os
from pathlib import Path

def destination(settings):
    path=getattr(settings,'site_settings_file','')
    try:config=json.loads(Path(path).read_text()).get('contact_discord',{})
    except (OSError,ValueError,TypeError):return None
    guild=str(config.get('guild_id',''));channel=str(config.get('channel_id',''));env=config.get('token_env','')
    if not guild.isascii() or not guild.isdigit() or not channel.isascii() or not channel.isdigit():return None
    if not isinstance(env,str) or not env.startswith('DISCORD_'):return None
    token=os.environ.get(env,'')
    return (guild,channel,token) if token else None

async def deliver(request,key,user_id,topic,message,language):
    target=destination(request.app.state.s)
    if not target:return 'unconfigured'
    guild,channel,token=target;http=request.app.state.http
    headers={'Authorization':'Bot '+token}
    try:
        r=await http.get('https://discord.com/api/v10/channels/'+channel,headers=headers)
        if r.status_code!=200:return 'failed'
        data=r.json()
        if str(data.get('guild_id'))!=guild or data.get('type') not in (0,5):return 'invalid_destination'
    except Exception:return 'failed' # No message POST was attempted.
    embed={'title':'iYokaiミ · '+topic,'description':message,'color':10445823,'fields':[{'name':'Discord ID','value':str(user_id),'inline':True},{'name':'Language','value':language,'inline':True}],'footer':{'text':'Request '+key}}
    try:
        r=await http.post('https://discord.com/api/v10/channels/'+channel+'/messages',headers=headers,json={'embeds':[embed],'allowed_mentions':{'parse':[]}})
    except Exception:return 'unknown' # It may have reached Discord: no blind retry.
    if r.status_code in (200,201):return 'delivered'
    return 'failed' if 400<=r.status_code<500 else 'unknown'
