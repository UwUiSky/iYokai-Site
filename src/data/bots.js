// Le nove code: 7 bot + app utente + eseguibile. Compilare clientId/perms/url reali per attivare i pulsanti.
// (Il bot Creator per i server di backup NON è qui: si invita da un pulsante privato del bot principale.)
export const ITEMS = [
  { kind: 'bot', title: 'iYokaiミ', desc: 'Il bot principale: moderazione, automod, sicurezza, ticket, livelli, gilde, log e utility.', clientId: '', perms: '' },
  ...[1, 2, 3, 4, 5].map((n) => ({ kind: 'bot', title: `iYokai Music ${n}`, desc: `Istanza musicale ${n} di 5: una connessione vocale ciascuna, aggiungine più d'una per più canali insieme.`, clientId: '', perms: '' })),
  { kind: 'bot', title: 'iYokai NSFW', desc: 'Modulo isolato dal core, riservato ai maggiorenni.', clientId: '', perms: '', age: true },
  { kind: 'app', title: 'iYokaiミ App', desc: 'Aggiungila al tuo profilo: funzioni cross-server ovunque tu sia.', clientId: '' },
  { kind: 'exe', title: 'iYokai.exe / .apk', desc: 'Loader con autopatcher per le funzioni desktop e, in futuro, Android.', url: '' },
];
const A = 'https://discord.com/oauth2/authorize';
export function actionFor(it) {
  if (it.kind === 'exe') return it.url ? { href: it.url, label: 'Scarica panel.exe' } : null;
  if (!it.clientId) return null;
  if (it.kind === 'app') return { href: `${A}?client_id=${it.clientId}&integration_type=1&scope=applications.commands`, label: 'Aggiungi al profilo' };
  return { href: `${A}?client_id=${it.clientId}&scope=bot%20applications.commands${it.perms ? `&permissions=${it.perms}` : ''}`, label: 'Aggiungi al server' };
}
