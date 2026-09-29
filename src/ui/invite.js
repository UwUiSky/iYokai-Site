import { ITEMS, actionFor } from '../data/bots.js';
const OK = 'iyokai:age18', NO = 'iyokai:ageblocked';
const ok = () => { try { return localStorage.getItem(OK) === '1'; } catch { return false; } };
// Verifica età: autodichiarazione, la data di nascita non viene salvata. Non è una verifica d'identità.
function ageGate() {
  const d = document.createElement('div'); d.className = 'sheet'; d.hidden = true; d.setAttribute('role', 'dialog'); d.setAttribute('aria-modal', 'true'); d.setAttribute('aria-labelledby', 'age-t');
  d.innerHTML = `<form class="sheet__box glass" novalidate><button type="button" class="sheet__x" aria-label="Chiudi">×</button><h3 id="age-t">Verifica dell'età</h3><p>Questo bot è riservato ai maggiorenni. Inserisci la tua data di nascita: non viene salvata.</p><label class="age__f">Data di nascita<input type="date" id="dob" required></label><p class="age__msg" role="alert"></p><button class="btn btn--main" type="submit">Conferma</button></form>`;
  document.body.appendChild(d);
  const f = d.querySelector('form'), dob = d.querySelector('#dob'), msg = d.querySelector('.age__msg'), x = d.querySelector('.sheet__x');
  let pass;
  const shut = () => { d.hidden = true; };
  const blocked = () => { msg.textContent = 'Devi avere almeno 18 anni per aggiungere questo bot.'; dob.disabled = true; f.querySelector('[type=submit]').hidden = true; };
  x.addEventListener('click', shut); d.addEventListener('click', (e) => { if (e.target === d) shut(); });
  addEventListener('keydown', (e) => { if (e.key === 'Escape' && !d.hidden) shut(); });
  f.addEventListener('submit', (e) => {
    e.preventDefault(); if (!dob.value) { msg.textContent = 'Inserisci la data di nascita.'; return; }
    const b = new Date(dob.value), n = new Date(); let age = n.getFullYear() - b.getFullYear(); const m = n.getMonth() - b.getMonth();
    if (m < 0 || (m === 0 && n.getDate() < b.getDate())) age--;
    if (isNaN(age) || age < 0 || age > 120) { msg.textContent = 'Data non valida.'; return; }
    if (age >= 18) { try { localStorage.setItem(OK, '1'); } catch { /* storage non disponibile */ } shut(); pass(); }
    else { try { sessionStorage.setItem(NO, '1'); } catch { /* storage non disponibile */ } blocked(); }
  });
  return (cb) => { pass = cb; d.hidden = false; let b = false; try { b = sessionStorage.getItem(NO) === '1'; } catch { /* storage non disponibile */ } if (b) blocked(); else dob.focus(); };
}
export function initInvite() {
  const grid = document.getElementById('invgrid'), open = ageGate();
  const btn = (it) => {
    const a = actionFor(it);
    if (it.age && !ok()) return '<button class="btn btn--age" type="button" data-age>Verifica età</button>';
    return a ? `<a class="btn btn--main" href="${a.href}" target="_blank" rel="noopener">${a.label}</a>` : '<span class="btn btn--off" aria-disabled="true">Link in arrivo</span>';
  };
  grid.innerHTML = ITEMS.map((it, i) => `<article class="glass inv rv" data-r="${i}" style="--z:${(0.6 + (i % 4) * 0.25).toFixed(2)};--bd:${7 + (i % 3)}s"><span class="inv__n">Coda ${i + 1}</span><h3>${it.title}</h3><p>${it.desc}</p><span class="inv__a">${btn(it)}</span></article>`).join('');
  document.dispatchEvent(new CustomEvent('rv:refresh'));
  const focus = (e, r) => { const c = e.target.closest('.inv'); if (c) document.dispatchEvent(new CustomEvent('tail:focus', { detail: r ? +c.dataset.r : -1 })); };
  grid.addEventListener('pointerover', (e) => focus(e, true)); grid.addEventListener('focusin', (e) => focus(e, true));
  grid.addEventListener('pointerleave', (e) => focus(e, false)); grid.addEventListener('focusout', () => document.dispatchEvent(new CustomEvent('tail:focus', { detail: -1 })));
  grid.addEventListener('click', (e) => {
    const b = e.target.closest('[data-age]'); if (!b) return;
    const c = b.closest('.inv'), it = ITEMS[+c.dataset.r];
    open(() => { c.querySelector('.inv__a').innerHTML = btn(it); });
  });
}
