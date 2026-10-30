import { MUSIC_NAMES } from './spirit-catalog.js';
// Nine Discord tails. The House is a separate destination, never a tenth tail.
// (Il bot Creator per i server di backup NON è qui: si invita da un pulsante privato del bot principale.)
export const ITEMS = [
  { id:'main', kind: 'bot', title: 'iYokaiミ', dk: 'inv.main', clientId: '', perms: '' },
  ...MUSIC_NAMES.map((title,i)=>({id:title.toLowerCase(),kind:'bot',title,dk:'inv.music',dv:{n:i+1},musicNumber:i+1,clientId:'',perms:''})),
  { id:'nsfw', kind: 'bot', title: 'iYokai NSFW', dk: 'inv.nsfw', clientId: '', perms: '', age: true },
  { id:'app', kind: 'app', title: 'iYokai App', dk: 'inv.app', clientId: '' },
  { id:'mod', kind:'bot', title:'iYokai Mod', dk:'inv.mod',clientId:'',perms:'' },
];
export function configureBots(profile){
 const d=profile.discord;
 for(const item of ITEMS){
  const music=item.musicNumber?d.musicBots?.[item.musicNumber-1]:null;
  item.clientId=music?.clientId||({main:d.botClientId,app:d.appClientId,nsfw:d.nsfwClientId,mod:d.modClientId}[item.id])||'';
  item.perms=music?.permissions|| (item.id==='mod'?d.modPermissions:d.botPermissions)||'0';
 }
}
const A = 'https://discord.com/oauth2/authorize';
export function actionFor(it) {
  if (it.kind === 'exe') return it.url ? { href: it.url, lk: 'inv.download' } : null;
  if (!it.clientId) return null;
  if (it.kind === 'app') return { href: `${A}?client_id=${it.clientId}&integration_type=1&scope=applications.commands`, lk: 'inv.addProfile' };
  return { href: `${A}?client_id=${it.clientId}&scope=bot%20applications.commands${it.perms ? `&permissions=${it.perms}` : ''}`, lk: 'inv.addServer' };
}
