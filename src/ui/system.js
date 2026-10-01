import { t } from '../i18n/index.js';
import { CLAWS } from '../assets/claws-paths.js';
// Modulo System: overlay in vetro con glitch, "work in progress" e tre graffi che compaiono a scatti.
export function initSystem() {
  const hub = document.getElementById('hub'), o = document.createElement('div');
  o.className = 'sys'; o.hidden = true; o.setAttribute('role', 'dialog'); o.setAttribute('aria-modal', 'true'); o.setAttribute('aria-label', t('sys.aria')); o.dataset.i18nAttr = 'aria-label:sys.aria';
  o.innerHTML = `<div class="sys__box"><svg class="sys__cuts" viewBox="0 0 ${CLAWS.w} ${CLAWS.h}" preserveAspectRatio="xMidYMid meet" aria-hidden="true"><defs><linearGradient id="sg" x1="0" x2="1" y1="0" y2="1"><stop offset="0" stop-color="#7c3aed"/><stop offset="1" stop-color="#ff4fd8"/></linearGradient></defs><g transform="${CLAWS.transform}">${CLAWS.paths.map((d, i) => `<path class="sc sc${i + 1}" d="${d}"/>`).join('')}</g></svg>
    <p class="glitch" data-text="Work in progress">Work in progress</p><button class="sheet__x" type="button" aria-label="${t('sheet.close')}" data-i18n-attr="aria-label:sheet.close">×</button></div>`;
  hub.appendChild(o);
  const x = o.querySelector('.sheet__x'); let from;
  const shut = () => { o.hidden = true; from?.focus(); };
  x.addEventListener('click', shut); o.addEventListener('click', (e) => { if (e.target === o) shut(); });
  addEventListener('keydown', (e) => { if (e.key === 'Escape' && !o.hidden) shut(); });
  hub.addEventListener('click', (e) => { const a = e.target.closest('.mod--sealed'); if (a) { e.preventDefault(); from = a; o.hidden = false; x.focus(); } });
}
