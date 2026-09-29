// Modulo System: overlay in vetro con glitch, "work in progress" e tre graffi che compaiono a scatti.
export function initSystem() {
  const hub = document.getElementById('hub'), o = document.createElement('div');
  o.className = 'sys'; o.hidden = true; o.setAttribute('role', 'dialog'); o.setAttribute('aria-modal', 'true'); o.setAttribute('aria-label', 'Modulo System: work in progress');
  o.innerHTML = `<div class="sys__box"><svg class="sys__cuts" viewBox="0 0 400 260" preserveAspectRatio="none" aria-hidden="true"><defs><linearGradient id="sg" x1="0" x2="1"><stop offset="0" stop-color="#7c3aed"/><stop offset="1" stop-color="#ff4fd8"/></linearGradient></defs>
    <path class="sc sc1" d="M20 84 Q210 30 392 24 Q214 52 20 84Z"/><path class="sc sc2" d="M8 150 Q210 92 396 88 Q214 116 8 150Z"/><path class="sc sc3" d="M30 226 Q220 160 388 158 Q216 186 30 226Z"/></svg>
    <p class="glitch" data-text="Work in progress">Work in progress</p><button class="sheet__x" type="button" aria-label="Chiudi">×</button></div>`;
  hub.appendChild(o);
  const x = o.querySelector('.sheet__x'); let from;
  const shut = () => { o.hidden = true; from?.focus(); };
  x.addEventListener('click', shut); o.addEventListener('click', (e) => { if (e.target === o) shut(); });
  addEventListener('keydown', (e) => { if (e.key === 'Escape' && !o.hidden) shut(); });
  hub.addEventListener('click', (e) => { const a = e.target.closest('.mod--sealed'); if (a) { e.preventDefault(); from = a; o.hidden = false; x.focus(); } });
}
