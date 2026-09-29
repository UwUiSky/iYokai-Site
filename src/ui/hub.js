import gsap from 'gsap';
import { MODULES } from '../data/modules.js';
const DEPTH = [1, 1.5, 0.8, 1.2, 0.7, 1.6]; // parallasse: ogni modulo ha la sua profondità
export function initHub() {
  const hub = document.getElementById('hub'), nav = hub.querySelector('.hub__mods');
  nav.innerHTML = MODULES.map((m, i) => `<a class="mod${m.sealed ? ' mod--sealed' : ''}" href="${m.href}" style="--d:${DEPTH[i]}"${m.sealed ? ' aria-disabled="true" tabindex="-1"' : ''}>
    <span class="mod__ico">${m.icon}</span><span class="mod__t">${m.title}</span><span class="mod__d">${m.desc}</span></a>`).join('');
  nav.addEventListener('click', (e) => { if (e.target.closest('.mod--sealed')) e.preventDefault(); });
  let shown = false;
  return {
    show(s = 1) {
      hub.hidden = false; shown = true;
      const cx = innerWidth / 2, cy = innerHeight * 0.5, cards = [...nav.children];
      gsap.from(cards, { duration: 1.2 * s, ease: 'expo.out', stagger: 0.09 * s, opacity: 0, scale: 0.3, filter: 'blur(12px)',
        x: (i, el) => { const r = el.getBoundingClientRect(); return cx - (r.left + r.width / 2); },
        y: (i, el) => { const r = el.getBoundingClientRect(); return cy - (r.top + r.height / 2); } });
      gsap.from('.hub__word, .hub__tag', { duration: 1.1 * s, ease: 'power3.out', opacity: 0, y: 24, filter: 'blur(8px)', stagger: 0.12 * s, delay: 0.3 * s });
      gsap.from('#player', { duration: 1 * s, ease: 'power3.out', opacity: 0, x: 40, delay: 0.9 * s });
    },
    update(p) { if (shown) { hub.style.setProperty('--px', (p.sx * 14).toFixed(2)); hub.style.setProperty('--py', (p.sy * 10).toFixed(2)); } },
  };
}
