import { spiritBio } from '../data/spirit-catalog.js';
import { loadPublicLinks } from '../core/links-config.js';
import { createNsfwLounge } from './nsfw-lounge.js';
import { ITEMS, configureBots } from '../data/bots.js';
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
  const render=()=>{
    grid.replaceChildren();
    ITEMS.forEach((it,i)=>{
      const card=document.createElement('article');card.className='glass inv rv';card.dataset.r=String(i);card.style.setProperty('--z',String(.6+(i%4)*.25));
      const number=document.createElement('span');number.className='inv__n';number.textContent=t('inv.tail',{n:i+1});
      const title=document.createElement('h3');title.textContent=it.title;
      const bio=document.createElement('p');bio.className='inv__bio';bio.lang='it';bio.textContent=spiritBio(it.id).bio;
      const kind=document.createElement('p');kind.className='inv__identity';kind.textContent=it.musicNumber?t('spirit.musicNumber',{n:it.musicNumber}):t(it.kind==='app'?'spirit.kind.app':'spirit.kind.bot');
      const actions=document.createElement('div');actions.className='inv__a';
      const button=document.createElement('button');button.type='button';button.className='btn btn--main';button.dataset.spirit=it.id;button.textContent=t('spirit.discover');actions.append(button);
      card.append(number,title,kind,bio,actions);grid.append(card);
    });
    document.dispatchEvent(new CustomEvent('rv:refresh'));
  };render();
  document.addEventListener('i18n:change',render);
  loadPublicLinks().then(p=>{configureBots(p);render();}).catch(()=>{});
  document.addEventListener('iyokai:nsfw-open',e=>{const trigger=e.detail?.trigger;if(ok())lounge(trigger);else open(()=>lounge(trigger));});
  const focus = (e, r) => { const c = e.target.closest('.inv'); if (c) document.dispatchEvent(new CustomEvent('tail:focus', { detail: r ? +c.dataset.r : -1 })); };
  grid.addEventListener('pointerover', (e) => focus(e, true)); grid.addEventListener('focusin', (e) => focus(e, true));
  grid.addEventListener('pointerleave', (e) => focus(e, false)); grid.addEventListener('focusout', () => document.dispatchEvent(new CustomEvent('tail:focus', { detail: -1 })));
}
