const AUTO_MS = 4000; // cooldown: dopo 4 s il comando parte da solo
export function initTerminal({ onEnter }) {
  const $ = (id) => document.getElementById(id);
  const term = $('term'), form = $('cmd'), input = $('in'), err = $('err'), cd = $('cd'), cdt = $('cdt'), cdf = $('cdf');
  let done = false, auto = true, raf;
  const t0 = performance.now();
  const submit = (fromAuto) => {
    if (done) return;
    if (!/ミ|iyokai/i.test(input.value)) {
      err.textContent = 'Comando non riconosciuto. Prova /iYokai ミ';
      input.value = '/iYokai ミ'; auto = false; cd.hidden = true;
      return;
    }
    done = true; cancelAnimationFrame(raf);
    term.classList.add('is-leaving');
    onEnter({ rect: term.querySelector('.term__win').getBoundingClientRect(), auto: fromAuto });
  };
  form.addEventListener('submit', (e) => { e.preventDefault(); submit(false); }); // Invio, click e tap
  input.addEventListener('input', () => { auto = false; cd.hidden = true; err.textContent = ''; });
  const tick = (now) => {
    if (!auto || done) return;
    const left = Math.max(0, AUTO_MS - (now - t0));
    cdf.style.transform = `scaleX(${1 - left / AUTO_MS})`;
    cdt.textContent = `Ingresso automatico tra ${Math.ceil(left / 1000)} s. Modifica il comando per annullare.`;
    if (left <= 0) return submit(true);
    raf = requestAnimationFrame(tick);
  };
  raf = requestAnimationFrame(tick);
  if (matchMedia('(pointer: fine)').matches) input.focus({ preventScroll: true });
  return { hide() { term.hidden = true; } };
}
