// Le nove code: 7 bot + app utente + eseguibile. Compilare clientId/perms/url reali per attivare i pulsanti.
// (Il bot Creator per i server di backup NON è qui: si invita da un pulsante privato del bot principale.)
export const ITEMS = [
  { kind: 'bot', title: 'iYokai', desc: 'Il bot principale: moderazione, utility e community.', clientId: '', perms: '' },
  { kind: 'bot', title: 'Musica', desc: 'La colonna sonora della tua community.', clientId: '', perms: '' },
  { kind: 'bot', title: 'NSFW', desc: 'Contenuti per adulti, solo per maggiorenni.', clientId: '', perms: '', age: true },
  { kind: 'bot', title: 'Bot 4', desc: 'Descrizione in arrivo.', clientId: '', perms: '' },
  { kind: 'bot', title: 'Bot 5', desc: 'Descrizione in arrivo.', clientId: '', perms: '' },
  { kind: 'bot', title: 'Bot 6', desc: 'Descrizione in arrivo.', clientId: '', perms: '' },
  { kind: 'bot', title: 'Bot 7', desc: 'Descrizione in arrivo.', clientId: '', perms: '' },
  { kind: 'app', title: 'iYokai App', desc: 'Aggiungila al tuo profilo: funzioni cross-server ovunque tu sia.', clientId: '' },
  { kind: 'exe', title: 'Panel per Windows', desc: 'panel.exe: alcune funzioni del bot, e altre dedicate, dal tuo PC.', url: '' },
];
const A = 'https://discord.com/oauth2/authorize';
export function actionFor(it) {
  if (it.kind === 'exe') return it.url ? { href: it.url, label: 'Scarica panel.exe' } : null;
  if (!it.clientId) return null;
  if (it.kind === 'app') return { href: `${A}?client_id=${it.clientId}&integration_type=1&scope=applications.commands`, label: 'Aggiungi al profilo' };
  return { href: `${A}?client_id=${it.clientId}&scope=bot%20applications.commands${it.perms ? `&permissions=${it.perms}` : ''}`, label: 'Aggiungi al server' };
}
