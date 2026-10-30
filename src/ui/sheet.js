import gsap from 'gsap';
import { loadPublicLinks } from '../core/links-config.js';
import { SHEETS } from '../data/links.js';
import { badgeFor, markSeen, onStatus } from './status.js';
import { t } from '../i18n/index.js';
// Pannello in vetro per Social / Community / Progetti; Musica fa pulsare il player.
const esc=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function initSheet() {
  const hub = document.getElementById('hub'), sh = document.createElement('div');
  sh.className = 'sheet'; sh.hidden = true; sh.setAttribute('role', 'dialog'); sh.setAttribute('aria-modal', 'true'); sh.setAttribute('aria-labelledby', 'sheet-t');
  sh.innerHTML = `<div class="sheet__box glass"><button class="sheet__x" type="button" aria-label="${t('sheet.close')}" data-i18n-attr="aria-label:sheet.close">×</button><h3 id="sheet-t"></h3><div class="sheet__items"></div></div>`;
  document.body.appendChild(sh);
  const title = sh.querySelector('#sheet-t'), items = sh.querySelector('.sheet__items'), close = sh.querySelector('.sheet__x');
  let from, cur;
  const render = () => {
    const d = SHEETS[cur]; title.textContent = t(d.tk);
    items.innerHTML = d.items.length ? d.items.map(([n, u, k, lk]) => {
      const b = k ? badgeFor(k) : '', name = lk ? t(lk) : n;
      return u ? `<a class="chip" href="${esc(u)}" target="_blank" rel="noopener"${k?.startsWith('yt:') ? ` data-yt="${k.slice(3)}"` : ''}>${esc(name)}${b}</a>` : `<span class="chip chip--off">${esc(name)} · ${t('sheet.soon')}${b}</span>`;
    }).join('') : `<span class="chip chip--off">${t('sheet.presto')}</span>`;
  };
  loadPublicLinks().then(config=>{
    SHEETS['#social'].items=config.social.map(item=>[item.name,item.url||'']);
    SHEETS['#progetti'].items=config.projects.map(item=>[item.name,item.url||'']);
    const discord=config.social.find(item=>item.name==='Discord');
    SHEETS['#community'].items=[['Server Discord iYokai',discord?.url||'',null,'link.server']];
    if(!sh.hidden&&cur)render();
  }).catch(()=>{});
  onStatus(() => { if (!sh.hidden && cur) render(); });
  document.addEventListener('i18n:change', () => { if (!sh.hidden && cur) render(); });
  items.addEventListener('click', (e) => { const a = e.target.closest('[data-yt]'); if (a) markSeen(+a.dataset.yt); });
  const open = (key, el) => {
    from = el; cur = key; render(); sh.hidden = false;
    gsap.fromTo(sh.firstChild, { opacity: 0, y: 24, scale: 0.96 }, { opacity: 1, y: 0, scale: 1, duration: 0.5, ease: 'power3.out' }); close.focus();
  };
  const shut = () => { sh.hidden = true; from?.focus(); };
  document.addEventListener('realm:portal', (e) => { if (SHEETS[e.detail?.key]) open(e.detail.key, e.detail.from); });
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
