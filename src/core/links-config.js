// Public links only: this configuration is served to visitors, never put secrets here.
export function publicLink(value) {
 try {const url=new URL(value);return url.protocol==='https:'?url.href:null;}catch{return null;}
}
export function normalizeLinks(config={}) {
 const snowflake=v=>/^[1-9][0-9]{0,19}$/.test(String(v||''))?String(v):'';
 const p=config.platforms||{},d=config.discord||{},list=entries=>entries.map(([key,name])=>({name,url:publicLink(p[key])}));
 return {
  discord:{botClientId:snowflake(d.botClientId),appClientId:snowflake(d.appClientId),nsfwClientId:snowflake(d.nsfwClientId),botPermissions:/^[0-9]+$/.test(String(d.botPermissions))?String(d.botPermissions):'0',desktopUrl:publicLink(d.desktopUrl),mobileUrl:publicLink(d.mobileUrl),nsfwArtworkUrl:typeof d.nsfwArtworkUrl==='string'&&/^\/cinematic\/[a-z0-9._-]+$/i.test(d.nsfwArtworkUrl)?d.nsfwArtworkUrl:null},
  social:list([['instagram','Instagram'],['tiktok','TikTok'],['youtube','YouTube'],['twitch','Twitch'],['kick','Kick'],['x','X'],['bluesky','Bluesky'],['steam','Steam'],['discord','Discord']]),
  live:list([['youtube','YouTube Live'],['twitch','Twitch'],['kick','Kick']]),
  music:{...config.music,spotify:publicLink(p.spotify),youtube:publicLink(p.youtubeMusic||p.youtube)},
  contactEmail:config.contactEmail,
  projects:Array.isArray(config.projects)?config.projects.filter(item=>item&&typeof item.name==='string').map(item=>({name:item.name,url:publicLink(item.url)})):[],
 };
}
export async function loadPublicLinks() {
 const r=await fetch('/links.json',{cache:'no-store'});
 if(!r.ok)throw new Error('links');
 return normalizeLinks(await r.json());
}
