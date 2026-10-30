import { decorateLanguageSelect } from '../i18n/index.js';
import gsap from 'gsap';
import { PROTOCOL_DETAIL_ART } from '../data/artworks.js';
import { preloadImage } from '../core/preload.js';
import { t, apply, lang, LANGS, setLang } from '../i18n/index.js';
import { savePrefs } from '../core/prefs.js';
import { createPanelNavigation } from '../core/panels.js';
import { createStillScenes } from './still-scenes.js';
import { initSpotify } from './spotify.js';
import { harukazeNodes } from './harukaze.js';
const esc=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const safeUrl=value=>{try{const u=new URL(value);return u.protocol==='https:'?u.href:null;}catch{return null;}};
export function initProtocolPages({lenis,prefs,onBack}) {
 const host=document.createElement('main');host.className='protocol-pages';host.hidden=true;host.id='protocol-pages';
 host.innerHTML=`<div class="protocol-page-bg" aria-hidden="true"><div class="world-vignette"></div></div><header class="protocol-page-header"><button class="protocol-back" data-i18n="gate.back"></button><div class="gate-language"><a class="gate-brand" href="#protocols" aria-label="iYokaiミ">iYokaiミ</a><select data-i18n-attr="aria-label:prefs.lang" aria-label="${t('prefs.lang')}">${LANGS.map(l=>`<option value="${l.code}">${l.code.toUpperCase()}</option>`).join('')}</select></div></header><section class="protocol-panel" id="protocol-intro" aria-labelledby="protocol-title"></section><section class="protocol-panel protocol-detail" id="protocol-detail" aria-labelledby="protocol-detail-title"></section><footer class="protocol-page-hud"><span class="protocol-world-name"></span><div class="protocol-steps"><button type="button" data-step="0" data-i18n-attr="aria-label:gate.overview" aria-label="${t('gate.overview')}">01</button><button type="button" data-step="1" data-i18n-attr="aria-label:gate.explore" aria-label="${t('gate.explore')}">02</button></div></footer>`;
 document.body.append(host);
 const sections=[...host.querySelectorAll('.protocol-panel')],bg=host.querySelector('.protocol-page-bg'),scenes=createStillScenes(bg),language=host.querySelector('select'),reduced=matchMedia('(prefers-reduced-motion: reduce)');
 let current,profile,active=false;
 function translate(){
  apply(host);language.value=lang();
  host.querySelectorAll('[data-brush]').forEach(el=>{const text=t(el.dataset.brush);el.setAttribute('aria-label',text);el.replaceChildren(...harukazeNodes(text));});
  host.querySelectorAll('h1>span').forEach(s=>s.setAttribute('aria-hidden','true'));
  if(current){host.querySelector('h1').setAttribute('aria-label',t(`world.${current.id}.line1`)+' '+t(`world.${current.id}.line2`));host.querySelector('.protocol-world-name').textContent=t(`protocol.${current.key}`);}
  fit();
 }
 function fit(){if(!active)return;host.querySelectorAll('h1,h2').forEach(h=>{h.style.fontSize='';const width=h.clientWidth,base=parseFloat(getComputedStyle(h).fontSize),widest=h.tagName==='H1'?Math.max(...[...h.children].map(s=>s.scrollWidth)):h.scrollWidth;if(width&&widest>width)h.style.fontSize=`${base*width/widest*.98}px`;});}
 const nav=createPanelNavigation({sections,lenis,reduced,historyMode:false,enabled:()=>active&&!document.querySelector('dialog[open],.sheet:not([hidden]),.sys:not([hidden]),.prefs:not([hidden])'),onSelect(i,{immediate,direction}){
  const leaving=sections.find((s,n)=>n!==i&&s.contains(document.activeElement));
  sections.forEach((s,n)=>s.inert=n!==i);if(leaving){const title=sections[i].querySelector('h1,h2');title.tabIndex=-1;title.focus({preventScroll:true});}host.querySelectorAll('[data-step]').forEach((b,n)=>{if(n===i)b.setAttribute('aria-current','step');else b.removeAttribute('aria-current');});
  if(current)scenes.show(i===0?current.art:PROTOCOL_DETAIL_ART[current.id],{immediate,direction});const copy=sections[i].firstElementChild;gsap.killTweensOf(copy);if(immediate||reduced.matches)gsap.set(copy,{y:0,opacity:1});else gsap.fromTo(copy,{y:18*(direction||1),opacity:.2},{y:0,opacity:1,duration:.7,delay:.12});
 }});
 function go(i,immediate=false){nav.go(i,{immediate,historyMode:false});}
 const card=(name,url,subtitle)=>{const u=safeUrl(url);return `<${u?'a':'article'} class="protocol-card"${u?` href="${esc(u)}" target="_blank" rel="noopener noreferrer"`:''}><strong>${esc(name)}${u?' ↗':''}</strong><small data-i18n="${subtitle}">${esc(t(subtitle))}</small></${u?'a':'article'}>`;};
 async function prepare(protocol,data,signal){
  active=false;host.hidden=true;current=protocol;profile=data;
  if(!await preloadImage(PROTOCOL_DETAIL_ART[protocol.id]))throw new Error('detail-art');
  if(signal?.aborted)throw new Error('cancelled');
  sections[0].innerHTML=`<div class="protocol-copy"><p class="gate-kicker">${protocol.number} / <span data-i18n="protocol.${protocol.key}"></span></p><h1 id="protocol-title" tabindex="-1"><span data-brush="world.${protocol.id}.line1"></span><span data-brush="world.${protocol.id}.line2"></span></h1><p class="protocol-description" data-i18n="world.${protocol.id}.body"></p>${protocol.id==='music'?'<div id="protocol-music-actions" class="music-destinations"></div>':`<button class="protocol-action" data-explore><span data-i18n="world.${protocol.id}.cta"></span> ↘</button>`}</div>`;
  let content='';
  if(protocol.id==='music')content=`<p class="music-release-credit">${esc(profile.music.artist||'iYokaiミ')} · ${esc(profile.music.title||'The Oni of Jah')}</p><ol class="music-track-list">${(Array.isArray(profile.music.tracks)?profile.music.tracks:[]).filter(title=>typeof title==='string').map(title=>`<li>${esc(title)}</li>`).join('')}</ol>`;
  if(protocol.id==='social'||protocol.id==='live')content=`<div class="protocol-card-grid" data-panel-scroll data-lenis-prevent>${(profile[protocol.id]||[]).map(item=>card(item.name,item.url,item.url?'gate.open-link':'gate.link-pending')).join('')}</div>`;
  if(protocol.id==='projects')content=`<div class="protocol-card-grid" data-panel-scroll data-lenis-prevent>${(profile.projects||[]).map(item=>card(item.name,item.url,'gate.project-state')).join('')}<button class="protocol-card" data-story><strong data-i18n="gate.story"></strong><small data-i18n="gate.story-description"></small></button></div>`;
  if(protocol.id==='contact'){
   const email=profile.contactEmail&&/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profile.contactEmail)?profile.contactEmail:null;
   content=`<div class="contact-draft"><label for="protocol-message" data-i18n="gate.message"></label><textarea id="protocol-message" maxlength="4000" data-panel-scroll data-i18n-attr="placeholder:gate.message-placeholder" placeholder="${esc(t('gate.message-placeholder'))}"></textarea><button class="protocol-action" type="button" data-copy data-i18n="gate.copy-message"></button>${email?`<a class="protocol-action" href="mailto:${esc(email)}">${esc(email)} ↗</a>`:'<p class="protocol-detail-intro" data-i18n="gate.contact-pending"></p>'}<p role="status"></p></div>`;
  }
  sections[1].innerHTML=`<div class="protocol-details-content" data-panel-scroll data-lenis-prevent tabindex="0"><p class="gate-kicker">${protocol.number} / <span data-i18n="protocol.${protocol.key}"></span></p><h2 id="protocol-detail-title" data-brush="world.${protocol.id}.detail"></h2><p class="protocol-detail-intro" data-i18n="world.${protocol.id}.detail-body"></p>${content}</div>`;
  translate();if(protocol.id==='music')await initSpotify(host.querySelector('#protocol-music-actions'),profile.music,{platformButtons:true});
 }
 host.addEventListener('click',async e=>{
  if(e.target.closest('.protocol-back,a[href="#protocols"]')){e.preventDefault();onBack();return;}
  const step=e.target.closest('[data-step]');if(step)go(+step.dataset.step);
  if(e.target.closest('[data-explore]'))go(1);
  if(e.target.closest('[data-story]'))document.dispatchEvent(new CustomEvent('protocol:story'));
  if(e.target.closest('[data-copy]')){const field=host.querySelector('textarea'),status=host.querySelector('.contact-draft [role="status"]');if(!field.value.trim()){field.focus();return;}try{await navigator.clipboard.writeText(field.value);status.textContent=t('gate.copied');}catch{field.focus();field.select();status.textContent=t('gate.copy-manually');}}
 });
 decorateLanguageSelect(language);
 language.addEventListener('change',async()=>{await setLang(language.value);prefs.lang=lang();savePrefs(prefs);});
 document.addEventListener('i18n:change',translate);document.fonts.ready.then(fit);addEventListener('resize',fit);
 return {prepare,show(){active=true;host.hidden=false;document.documentElement.dataset.stage='protocol-world';translate();lenis.start();lenis.resize();go(0,true);host.querySelector('h1').focus({preventScroll:true});},hide(){active=false;host.hidden=true;},get active(){return active;}};
}
