// Le nove code: 7 bot + app utente + eseguibile. Compilare clientId/perms/url reali per attivare i pulsanti.
// (Il bot Creator per i server di backup NON è qui: si invita da un pulsante privato del bot principale.)
export const ITEMS = [
  { kind: 'bot', title: 'iYokaiミ', dk: 'inv.main', clientId: '', perms: '' },
  ...[1, 2, 3, 4, 5].map((n) => ({ kind: 'bot', title: `iYokai Music ${n}`, dk: 'inv.music', dv: { n }, clientId: '', perms: '' })),
  { kind: 'bot', title: 'iYokai NSFW', dk: 'inv.nsfw', clientId: '', perms: '', age: true },
  { kind: 'app', title: 'iYokaiミ App', dk: 'inv.app', clientId: '' },
  { kind: 'exe', title: 'iYokai.exe / .apk', dk: 'inv.exe', url: '' },
];
const A = 'https://discord.com/oauth2/authorize';
export function actionFor(it) {
  if (it.kind === 'exe') return it.url ? { href: it.url, lk: 'inv.download' } : null;
  if (!it.clientId) return null;
  if (it.kind === 'app') return { href: `${A}?client_id=${it.clientId}&integration_type=1&scope=applications.commands`, lk: 'inv.addProfile' };
  return { href: `${A}?client_id=${it.clientId}&scope=bot%20applications.commands${it.perms ? `&permissions=${it.perms}` : ''}`, lk: 'inv.addServer' };
}
