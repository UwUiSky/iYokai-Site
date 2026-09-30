// Stato live: badge LIVE/OFFLINE per Twitch e contatore rosso dei video YouTube nuovi dall'ultima visita (localStorage).
import { t } from '../i18n/index.js';
const LS = 'iyokai:yt:';
export const status = { twitch: null, yt: [] };
const subs = []; let raw = null;
export const onStatus = (fn) => subs.push(fn);
const seen = (i) => { try { let v = localStorage.getItem(LS + i); if (!v) { v = new Date().toISOString(); localStorage.setItem(LS + i, v); } return Date.parse(v); } catch { return Date.now(); } };
function compute() {
  if (!raw) return;
  status.twitch = raw.twitch;
  status.yt = raw.youtube.map((c, i) => (Array.isArray(c.latest) ? c.latest.filter((d) => Date.parse(d) > seen(i)).length : null));
  subs.forEach((f) => f(status));
}
export function markSeen(i) { try { localStorage.setItem(LS + i, new Date().toISOString()); } catch { /* storage non disponibile */ } compute(); }
export function badgeFor(key) {
  if (key === 'twitch') return status.twitch?.live === true ? '<b class="bdg bdg--live">LIVE</b>' : status.twitch?.live === false ? '<b class="bdg bdg--off">OFFLINE</b>' : '';
  const n = status.yt[+key.split(':')[1]];
  return n > 0 ? `<b class="bdg bdg--n" aria-label="${t('status.videos', { n })}">${n > 99 ? '99+' : n}</b>` : '';
}
async function poll() { try { const r = await fetch('/api/status', { credentials: 'omit' }); if (r.ok) { raw = await r.json(); compute(); } } catch { /* API non raggiungibile: nessun badge */ } }
export function initStatus() {
  const card = document.querySelector('.mod[href="#social"]');
  if (card) { const b = document.createElement('span'); b.className = 'mod__b'; card.appendChild(b); onStatus((s) => { const n = s.yt.reduce((a, v) => a + (v || 0), 0); b.innerHTML = s.twitch?.live ? '<b class="bdg bdg--live">LIVE</b>' : n > 0 ? `<b class="bdg bdg--n">${n > 99 ? '99+' : n}</b>` : ''; }); }
  poll(); setInterval(() => { if (document.visibilityState === 'visible') poll(); }, 60000);
}
