import { searchable } from './command-catalog.js';
export function filterGuilds(guilds,{query='',filter='all'}={}){
 const words=searchable(query).split(' ').filter(Boolean);
 return guilds.filter(g=>words.every(word=>searchable(`${g.name} ${g.id}`).includes(word))&&(
  filter==='all'||filter==='manage'&&g.can_manage&&g.bot_present||filter==='invite'&&g.can_manage&&!g.bot_present||filter==='member'&&!g.can_manage));
}
// A locked active module can still be disabled after a tier expires.
// Missing access metadata must not turn a paid feature into a free one.
export function moduleLocked(module){
 return !module.active&&(module.can_enable===false||module.can_enable!==true&&module.required_tier!=='free');
}
export function panelError(status){
 return ({401:'session',403:'permission',404:'missing',409:'sync',429:'rate'})[status]||'unavailable';
}

export function moduleWrite(module){
 if(typeof module?.active!=='boolean')throw new TypeError('Module state must be a boolean');
 return {active:!module.active,expected_active:module.active};
}
