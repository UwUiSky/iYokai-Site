import { loadPublicLinks } from '../core/links-config.js';
import { createNsfwLounge } from './nsfw-lounge.js';
import { ITEMS, actionFor } from '../data/bots.js';
import { a, t } from '../i18n/index.js';
const OK = 'iyokai:age18', NO = 'iyokai:ageblocked';
const ok = () => { try { return localStorage.getItem(OK) === '1'; } catch { return false; } };
// Verifica età: autodichiarazione, la data di nascita non viene salvata. Non è una verifica d'identità.
function ageGate() {
  const d = document.createElement('div'); d.className = 'sheet'; d.hidden = true; d.setAttribute('role', 'dialog'); d.setAttribute('aria-modal', 'true'); d.setAttribute('aria-labelledby', 'age-t');
  d.innerHTML = `<form class="sheet__box glass" novalidate><button type="button" class="sheet__x" aria-label="${t('sheet.close')}" data-i18n-attr="aria-label:sheet.close">×</button><h3 id="age-t" ${a('age.t')}>${t('age.t')}</h3><p ${a('age.body')}>${t('age.body')}</p><label class="age__f"><span ${a('age.dob')}>${t('age.dob')}</span><input type="date" id="dob" required></label><p class="age__msg" role="alert"></p><button class="btn btn--main" type="submit" ${a('age.ok')}>${t('age.ok')}</button></form>`;
  document.body.appendChild(d);
  const f = d.querySelector('form'), dob = d.querySelector('#dob'), msg = d.querySelector('.age__msg'), x = d.querySelector('.sheet__x');
  let pass;
  const shut = () => { d.hidden = true; };
  const blocked = () => { msg.textContent = t('age.minor'); dob.disabled = true; f.querySelector('[type=submit]').hidden = true; };
  x.addEventListener('click', shut); d.addEventListener('click', (e) => { if (e.target === d) shut(); });
  addEventListener('keydown', (e) => { if (e.key === 'Escape' && !d.hidden) shut(); });
  f.addEventListener('submit', (e) => {
    e.preventDefault(); if (!dob.value) { msg.textContent = t('age.need'); return; }
    const b = new Date(dob.value), n = new Date(); let age = n.getFullYear() - b.getFullYear(); const m = n.getMonth() - b.getMonth();
    if (m < 0 || (m === 0 && n.getDate() < b.getDate())) age--;
    if (isNaN(age) || age < 0 || age > 120) { msg.textContent = t('age.bad'); return; }
    if (age >= 18) { try { localStorage.setItem(OK, '1'); } catch { /* storage non disponibile */ } shut(); pass(); }
    else { try { sessionStorage.setItem(NO, '1'); } catch { /* storage non disponibile */ } blocked(); }
  });
  return (cb) => { pass = cb; d.hidden = false; let b = false; try { b = sessionStorage.getItem(NO) === '1'; } catch { /* storage non disponibile */ } if (b) blocked(); else dob.focus(); };
}
export function initInvite() {
  const grid = document.getElementById('invgrid'), open = ageGate(), lounge=createNsfwLounge();
  const btn = (it) => {
    const ac = actionFor(it);
    if (it.age) return `<button class="btn btn--age" type="button" data-nsfw>${ok()?t('inv.nsfw-open'):t('inv.age')}</button>`;
    return ac ? `<a class="btn btn--main" href="${ac.href}" target="_blank" rel="noopener" ${a(ac.lk)}>${t(ac.lk)}</a>` : `<span class="btn btn--off" aria-disabled="true" ${a('inv.soon')}>${t('inv.soon')}</span>`;
  };
  const render=()=>{grid.innerHTML = ITEMS.map((it, i) => `<article class="glass inv rv" data-r="${i}" style="--z:${(0.6 + (i % 4) * 0.25).toFixed(2)};--bd:${7 + (i % 3)}s"><span class="inv__n" ${a('inv.tail', { n: i + 1 })}>${t('inv.tail', { n: i + 1 })}</span><h3>${it.title}</h3><p ${a(it.dk, it.dv)}>${t(it.dk, it.dv)}</p><span class="inv__a">${btn(it)}</span></article>`).join('');
  document.dispatchEvent(new CustomEvent('rv:refresh'));};render();
  document.addEventListener('i18n:change',render);
  loadPublicLinks().then(p=>{ITEMS[0].clientId=p.discord.botClientId;ITEMS[0].perms=p.discord.botPermissions;ITEMS.find(i=>i.kind==='app').clientId=p.discord.appClientId;ITEMS.find(i=>i.age).clientId=p.discord.nsfwClientId;ITEMS.find(i=>i.kind==='exe').url=p.discord.desktopUrl||p.discord.mobileUrl||'';render();}).catch(()=>{});
  const focus = (e, r) => { const c = e.target.closest('.inv'); if (c) document.dispatchEvent(new CustomEvent('tail:focus', { detail: r ? +c.dataset.r : -1 })); };
  grid.addEventListener('pointerover', (e) => focus(e, true)); grid.addEventListener('focusin', (e) => focus(e, true));
  grid.addEventListener('pointerleave', (e) => focus(e, false)); grid.addEventListener('focusout', () => document.dispatchEvent(new CustomEvent('tail:focus', { detail: -1 })));
  grid.addEventListener('click', (e) => {
    const n=e.target.closest('[data-nsfw]');if(n){if(ok())lounge(n);else open(()=>{render();lounge(grid.querySelector('[data-nsfw]'));});return;}
    const b = e.target.closest('[data-age]'); if (!b) return;
    const c = b.closest('.inv'), it = ITEMS[+c.dataset.r];
    open(() => { c.querySelector('.inv__a').innerHTML = btn(it); });
  });
}
