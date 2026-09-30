// "Ogni modulo ha il suo spirito": sei sigilli in linea, ognuno con colore e movimento propri; la carta segue il puntatore.
import { a, t } from '../i18n/index.js';
const S = (d) => `<svg viewBox="0 0 120 120" aria-hidden="true">${d}</svg>`;
const YOKAI = [
  { n: 'Kitsune', k: 'yk.kitsune', c: '#ff6ee7', d: 6.5, i: S('<path d="M30 70 38 26 56 46M90 70 82 26 64 46"/><path d="M30 70Q60 108 90 70Q60 52 30 70Z"/><path d="M48 66l-8-2M72 66l8-2M60 82v6"/><path d="M92 92q24-6 16-34M96 98q28 2 22-26M88 100q16 14 34 4"/>') },
  { n: 'Tengu', k: 'yk.tengu', c: '#8aa4ff', d: 7.5, i: S('<path d="M30 60Q60 20 90 60Q90 92 60 98Q30 92 30 60Z"/><path d="M56 66 60 96 64 66"/><path d="M36 52l22 6M84 52l-22 6"/><path d="M22 40q-14 14-4 34M98 40q14 14 4 34"/>') },
  { n: 'Nekomata', k: 'yk.nekomata', c: '#c58bff', d: 5.8, i: S('<path d="M34 50 38 24 54 40M86 50 82 24 66 40"/><circle cx="60" cy="68" r="30"/><path d="M46 64q4-6 8 0M66 64q4-6 8 0M56 78l4 4 4-4"/><path d="M96 96q10-20 0-30M100 100q20-6 18-26"/>') },
  { n: 'Bakeneko', k: 'yk.bakeneko', c: '#ff9bd0', d: 8, i: S('<path d="M34 50 36 22 54 38M86 50 84 22 66 38"/><ellipse cx="60" cy="68" rx="30" ry="28"/><circle cx="48" cy="64" r="7"/><circle cx="72" cy="64" r="7"/><path d="M50 82q10 8 20 0M60 96v12"/>') },
  { n: 'Oni', k: 'yk.oni', c: '#ff5f7e', d: 6.8, i: S('<circle cx="60" cy="70" r="30"/><path d="M38 48 30 20 48 40M82 48 90 20 72 40"/><path d="M40 62l14 6M80 62l-14 6"/><path d="M46 86q14 8 28 0M50 86l3 8M70 86l-3 8"/>') },
  { n: 'Rokurokubi', k: 'yk.rokurokubi', c: '#7fe3d0', d: 7.2, i: S('<circle cx="60" cy="26" r="14"/><path d="M54 40q-18 18 0 34t6 30M66 40q-18 18 0 34t6 30"/><path d="M40 106h40"/>') },
];
export function initYokai() {
  const grid = document.getElementById('ykgrid'); if (!grid) return;
  grid.innerHTML = YOKAI.map((y, k) => `<article class="glass yk rv" style="--c:${y.c};--d:${y.d}s;--z:${(0.7 + (k % 3) * 0.3).toFixed(1)};--bd:${8 + (k % 3)}s"><div class="yk__in"><span class="yk__i">${y.i}</span><h3>${y.n}</h3><p ${a(y.k)}>${t(y.k)}</p></div></article>`).join('');
  if (!matchMedia('(pointer: fine)').matches || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  grid.addEventListener('pointermove', (e) => {
    const c = e.target.closest('.yk'); if (!c) return;
    const r = c.getBoundingClientRect(), x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height, s = c.style;
    s.setProperty('--mx', `${(x * 100).toFixed(0)}%`); s.setProperty('--my', `${(y * 100).toFixed(0)}%`);
    s.setProperty('--ry', `${((x - 0.5) * 14).toFixed(1)}deg`); s.setProperty('--rx', `${((0.5 - y) * 14).toFixed(1)}deg`);
  });
  grid.addEventListener('pointerout', (e) => { const c = e.target.closest('.yk'); if (c && !c.contains(e.relatedTarget)) { c.style.setProperty('--rx', '0deg'); c.style.setProperty('--ry', '0deg'); } });
}
