import gsap from 'gsap';
import { SHEETS } from '../data/links.js';
// Pannello in vetro per Social / Community / Progetti; Musica fa pulsare il player.
export function initSheet() {
  const hub = document.getElementById('hub'), sh = document.createElement('div');
  sh.className = 'sheet'; sh.hidden = true; sh.setAttribute('role', 'dialog'); sh.setAttribute('aria-modal', 'true'); sh.setAttribute('aria-labelledby', 'sheet-t');
  sh.innerHTML = '<div class="sheet__box glass"><button class="sheet__x" type="button" aria-label="Chiudi">×</button><h3 id="sheet-t"></h3><div class="sheet__items"></div></div>';
  hub.appendChild(sh);
  const title = sh.querySelector('#sheet-t'), items = sh.querySelector('.sheet__items'), close = sh.querySelector('.sheet__x');
  let from;
  const open = (key, el) => {
    const d = SHEETS[key]; from = el; title.textContent = d.title;
    items.innerHTML = d.items.length ? d.items.map(([n, u]) => (u ? `<a class="chip" href="${u}" target="_blank" rel="noopener">${n}</a>` : `<span class="chip chip--off">${n} · in arrivo</span>`)).join('') : '<span class="chip chip--off">Presto</span>';
    sh.hidden = false; gsap.fromTo(sh.firstChild, { opacity: 0, y: 24, scale: 0.96 }, { opacity: 1, y: 0, scale: 1, duration: 0.5, ease: 'power3.out' }); close.focus();
  };
  const shut = () => { sh.hidden = true; from?.focus(); };
  close.addEventListener('click', shut);
  sh.addEventListener('click', (e) => { if (e.target === sh) shut(); });
  addEventListener('keydown', (e) => { if (e.key === 'Escape' && !sh.hidden) shut(); });
  hub.addEventListener('click', (e) => {
    const a = e.target.closest('a.mod'); if (!a) return;
    const h = a.getAttribute('href');
    if (SHEETS[h]) { e.preventDefault(); open(h, a); }
    else if (h === '#music') { e.preventDefault(); gsap.fromTo('#player', { scale: 1 }, { scale: 1.06, yoyo: true, repeat: 3, duration: 0.18 }); }
  });
}
