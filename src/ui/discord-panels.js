import { renderBotFaq } from './bot-faq.js';
import { decorateLanguageSelect } from '../i18n/index.js';
import gsap from 'gsap';
import { initDiscordChrome } from './discord-chrome.js';
import { DISCORD_ART } from '../data/artworks.js';
import { DISCORD_LAYOUT } from '../data/discord-layout.js';
import { createStillScenes } from './still-scenes.js';
import { preloadImage } from '../core/preload.js';
import { harukazeNodes } from './harukaze.js';
import { createPanelNavigation } from '../core/panels.js';
import { apply, t, LANGS, lang, setLang } from '../i18n/index.js';
import { savePrefs } from '../core/prefs.js';

// Keep the existing functional Discord DOM and listeners. Only the presentation
// shell changes; long catalogues scroll inside their own full-screen panel.
export function initDiscordPanels({ host, lenis, prefs, enabled, reduced }) {
 const music=document.createElement('section');music.className='dc__sec dc__music';music.id='discord-music';
 music.innerHTML='<div><h2 class="dc__h" data-i18n="dc.music-title"></h2><p class="dc__sub" data-i18n="dc.music-body"></p><div class="dc-module-actions"><a class="btn btn--main" href="#commands" data-i18n="dc.music-commands"></a><a class="btn" href="#invita" data-i18n="dc.music-invite"></a></div><p class="dc__note" data-i18n="dc.music-note"></p></div>';
 host.querySelector('#comandi').before(music);apply(music);
 const house=document.createElement('section');house.className='dc__sec dc__house';house.id='spirit-house';
 house.innerHTML='<div class="dc-house-copy"><p class="dc__kick" data-i18n="house.kicker"></p><h2 class="dc__h" data-i18n="house.title"></h2><p class="spirit-house-intro" data-i18n="house.intro"></p><div class="dc-house-actions"><button type="button" class="btn btn--main" data-spirit="house" data-i18n="house.discover"></button><button type="button" class="btn" data-house-features data-i18n="house.features"></button></div><p class="dc__note" data-i18n="house.note"></p></div>';
 host.querySelector('.dc__foot').before(house);apply(house);
 const faq=document.createElement('section');faq.className='dc__sec dc__faq';faq.id='discord-faq';
 faq.innerHTML='<div><h2 class="dc__h" data-i18n="help.faq"></h2><div class="dc-faq-list"></div></div>';
 host.querySelector('.dc__foot').before(faq);apply(faq);
 const updateFaq=()=>{faq.querySelector('.dc-faq-list').innerHTML=renderBotFaq();};updateFaq();document.addEventListener('i18n:change',updateFaq);
 const background=document.createElement('div');background.className='discord-page-bg';background.setAttribute('aria-hidden','true');background.innerHTML='<div class="world-vignette"></div>';host.prepend(background);
 host.querySelector('[data-i18n="ft.mod.t"]').closest('.dc__sec').id='discord-features';
 const scenes=createStillScenes(background),art=DISCORD_LAYOUT.map(p=>DISCORD_ART[p.art]);
 const sections=DISCORD_LAYOUT.map(p=>host.querySelector(p.selector));
 const names=DISCORD_LAYOUT.map(p=>p.label);
 const footer=host.querySelector('.dc__foot');
 sections.forEach(section=>footer.before(section));
 sections.forEach((section,i)=>{
  section.id ||= `discord-${i}`;
  section.tabIndex=-1;section.dataset.panelName=names[i];
  const content=document.createElement('div');content.className='dc-panel-content';
  if(i){content.dataset.panelScroll='';content.dataset.lenisPrevent='';content.tabIndex=0;}
  content.append(...section.childNodes);
  if(DISCORD_LAYOUT[i].heading){const heading=document.createElement('h2');heading.className='dc__h dc-panel-title';heading.dataset.i18n=names[i];heading.textContent=t(names[i]);content.prepend(heading);}
  section.append(content);
 });
 sections.at(-1).firstElementChild.append(footer);
 const hud=document.createElement('nav');hud.className='dc-panel-hud';hud.setAttribute('aria-label',t('dc.navigation'));
 hud.innerHTML='<button type="button" data-prev data-i18n-attr="aria-label:dc.previous">↑</button><span class="dc-panel-count" aria-hidden="true"></span><span class="dc-panel-label"></span><button type="button" data-next data-i18n-attr="aria-label:dc.next">↓</button>';
 host.append(hud);
 const language=document.createElement('select');language.className='dc-language';language.dataset.i18nAttr='aria-label:prefs.lang';
 LANGS.forEach(l=>language.add(new Option(l.code.toUpperCase(),l.code)));
 host.querySelector('.dc__bar').append(language);decorateLanguageSelect(language);
 initDiscordChrome(host);
 const dashboardAction=document.createElement('a');dashboardAction.className='btn btn--main';dashboardAction.href='#panel';dashboardAction.dataset.i18n='dc.open-panel';dashboardAction.textContent=t('dc.open-panel');host.querySelector('.dc__end .glass').append(dashboardAction);
 language.addEventListener('change',async()=>{await setLang(language.value);prefs.lang=lang();savePrefs(prefs);});
 const prev=hud.querySelector('[data-prev]'),next=hud.querySelector('[data-next]');
 let current=0;
 function translate(){
  apply(hud);apply(host.querySelector('.dc__bar'));language.value=lang();hud.setAttribute('aria-label',t('dc.navigation'));
  sections.forEach((s,i)=>{s.setAttribute('aria-label',t(names[i]));const inner=s.firstElementChild;if(i)inner.setAttribute('aria-label',t('dc.scroll-content',{section:t(names[i])}));});
  hud.querySelector('.dc-panel-label').textContent=t(names[current]);
  host.querySelectorAll('.dc__h[data-i18n]').forEach(heading=>{const text=t(heading.dataset.i18n);heading.setAttribute('aria-label',text);heading.replaceChildren(...harukazeNodes(text));[...heading.children].forEach(n=>n.setAttribute('aria-hidden','true'));});
 }
 const nav=createPanelNavigation({sections,lenis,reduced,historyMode:false,enabled,onSelect(i,{immediate,direction}){
  const focus=document.activeElement,leaving=sections.find((s,n)=>n!==i&&s.contains(focus));
  current=i;scenes.show(art[i],{immediate,direction});sections.forEach((s,n)=>s.inert=n!==i);
  prev.disabled=i===0;next.disabled=i===sections.length-1;
  hud.querySelector('.dc-panel-count').textContent=`${String(i+1).padStart(2,'0')} / ${String(sections.length).padStart(2,'0')}`;
  translate();
  if(leaving||(focus===next&&next.disabled)||(focus===prev&&prev.disabled))sections[i].focus({preventScroll:true});
  const copy=sections[i].firstElementChild;gsap.killTweensOf(copy);
  if(immediate)gsap.set(copy,{opacity:1,y:0});
  else gsap.fromTo(copy,{opacity:.25,y:16*(direction||1)},{opacity:1,y:0,duration:.65,ease:'power2.out'});
 }});
 const go=(i,immediate=false)=>nav.go(i,{immediate,historyMode:false});
 prev.onclick=()=>go(current-1);next.onclick=()=>go(current+1);
 document.addEventListener('i18n:change',translate);translate();
 // Feature cards are entry points to their relevant functional layouts.
 const musicCard=host.querySelector('[data-i18n="ft.music.t"]').closest('article');
 const openMusic=document.createElement('button');openMusic.className='protocol-action';openMusic.type='button';openMusic.dataset.i18n='dc.music-open';openMusic.textContent=t('dc.music-open');openMusic.onclick=()=>go(sections.indexOf(music));musicCard.append(openMusic);
 const sisters=document.createElement('button');sisters.type='button';sisters.className='btn';sisters.dataset.spirit='music';sisters.dataset.i18n='spirit.sisters';sisters.textContent=t('spirit.sisters');music.querySelector('.dc-module-actions').append(sisters);
 music.querySelector('a[href="#commands"]').dataset.commandScope='music';
 const musicNames=document.createElement('div');musicNames.className='dc-house-actions';
 for(const id of ['shirayuki','aoi','kuro','hana','rei']){const b=document.createElement('button');b.type='button';b.className='btn';b.dataset.spirit=id;b.textContent=id[0].toUpperCase()+id.slice(1);musicNames.append(b);}
 music.querySelector('div').append(musicNames);
 const featureScopes={'ft.mod.t':['oni','moderation'],'ft.tick.t':['kitsune','tickets'],'ft.lvl.t':['nekomata','levels'],'ft.sec.t':['tengu','safety'],'ft.auto.t':['rokurokubi','automation']};
 for(const [key,[id,scope]]of Object.entries(featureScopes)){const card=host.querySelector(`[data-i18n="${key}"]`).closest('article'),b=document.createElement('button');b.type='button';b.className='protocol-action';b.dataset.spirit=id;b.dataset.spiritScope=scope;b.dataset.i18n='spirit.discover';b.textContent=t('spirit.discover');card.append(b);}
 return {
  async prepare(){const ready=await Promise.all(art.map(preloadImage));if(ready.some(ok=>!ok))throw new Error('discord-art');},
  show(){lenis.resize();go(0,true);sections[0].focus({preventScroll:true});},
  goTo(target){const i=sections.findIndex(s=>s===target||s.contains(target));if(i<0)return false;go(i);return true;},
 };
}
