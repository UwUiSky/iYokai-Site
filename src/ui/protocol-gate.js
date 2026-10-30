import { decorateLanguageSelect } from '../i18n/index.js';
import { setRoute } from '../core/navigation.js';
import gsap from 'gsap';
import { burnClip } from '../core/burn.js';
import { initGateLayout } from './gate-layout.js';
import { PROTOCOLS } from '../data/protocols.js';
import { t, apply, LANGS, lang, setLang } from '../i18n/index.js';
import { savePrefs } from '../core/prefs.js';

export const spiritMarkup = `<span class="spirit" aria-hidden="true"><i class="spirit-halo"></i><span class="spirit-sprite"></span><b></b><b></b><b></b></span>`;
export function initProtocolGate({ prefs, prepare, onOpen, onShow }) {
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 const host=document.createElement('main');host.id='protocol-gate';host.hidden=true;
 host.innerHTML=`<header class="gate-header"><a class="gate-brand" href="#protocols" aria-label="iYokaiミ">iYokaiミ</a><label class="gate-language"><span class="sr-only" data-i18n="prefs.lang"></span><select data-i18n-attr="aria-label:prefs.lang" aria-label="${t('prefs.lang')}">${LANGS.map(l=>`<option value="${l.code}">${l.code.toUpperCase()}</option>`).join('')}</select></label></header><div class="gate-intro"><p class="gate-kicker">境界 / IYOKAI OS</p><h1 tabindex="-1" data-i18n="gate.title"></h1><p data-i18n="gate.subtitle"></p></div><div class="gate-orbit"><div class="mask-aura" aria-hidden="true"></div><div class="mask-wrap"><img src="/cinematic/gate-mask.webp" alt="" width="400" height="470" class="gate-mask"><span class="mask-seal" aria-hidden="true">ミ</span></div><nav class="protocol-orbit" aria-label="${t('gate.title')}">${PROTOCOLS.map(p=>`<button type="button" class="protocol-node" data-protocol="${p.id}"><span class="protocol-index">${p.number}</span>${spiritMarkup}<span class="protocol-name" data-i18n="protocol.${p.key}"></span><span class="protocol-hint" data-i18n="protocol.${p.key}.hint"></span></button>`).join('')}</nav></div><footer class="gate-footer"><span>妖怪 / SIX PATHS · ONE SPIRIT</span><span data-i18n="gate.instruction"></span></footer>`;
 document.body.append(host);apply(host);const layout=initGateLayout(host);
 const language=host.querySelector('select');decorateLanguageSelect(language);language.value=lang();language.addEventListener('change',async()=>{await setLang(language.value);prefs.lang=lang();savePrefs(prefs);});
 const loader=document.createElement('section');loader.id='protocol-loading';loader.hidden=true;loader.setAttribute('aria-label',t('gate.loading'));
 loader.innerHTML=`<div class="loading-heading"><p class="gate-kicker" data-i18n="gate.opening"></p><h2></h2></div><div class="burn-scroll" aria-hidden="true"><div class="scroll-paper"><span class="scroll-rule"></span><span class="scroll-writing">境界の向こうへ</span><span class="scroll-seal">ミ</span></div><div class="burn-edge">${spiritMarkup}<i></i><i></i><i></i><i></i><i></i></div></div><div class="loading-readout"><div class="load-progress" data-i18n-attr="aria-label:gate.loading" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0" aria-label="${t('gate.loading')}"><span class="load-percent">0%</span></div><p class="load-status" role="status" aria-live="polite"></p><button class="load-retry" type="button" data-i18n="gate.retry" hidden></button><button class="load-back" type="button" data-i18n="gate.back"></button></div>`;
 document.body.append(loader);apply(loader);
 const nodes=[...host.querySelectorAll('.protocol-node')], mask=host.querySelector('.mask-wrap'), aura=host.querySelector('.mask-aura');
 const paper=loader.querySelector('.scroll-paper'),edge=loader.querySelector('.burn-edge'),progress=loader.querySelector('[role="progressbar"]'),percent=loader.querySelector('.load-percent'),status=loader.querySelector('.load-status');
 let entrance,flight,progressTween,preparation,token=0,busy=false,selected,focusId;
 const proxy={p:0};let loadedFraction=0,ignited=false;
 function paint(){const n=Math.round(proxy.p*100);percent.textContent=`${n}%`;progress.setAttribute('aria-valuenow',n);paper.style.clipPath=burnClip(proxy.p);edge.style.opacity=ignited&&proxy.p<1?'1':'0';edge.style.top=`${(1-proxy.p)*100}%`;}
 function show({focus=true}={}){
  token++;preparation?.abort();busy=false;loader.hidden=true;host.hidden=false;host.inert=false;document.documentElement.dataset.stage='protocols';
  flight?.kill();progressTween?.kill();document.querySelectorAll('.flying-spirit').forEach(n=>n.remove());
  onShow?.();nodes.forEach(n=>n.disabled=false);gsap.set(host,{opacity:1});gsap.set([mask,aura,...nodes],{clearProps:'all'});gsap.set([mask,aura,...nodes],{xPercent:-50,yPercent:-50,x:0,y:0});layout.fit();entrance?.kill();
  if(!reduced.matches){
   nodes.forEach(n=>n.disabled=true);
   entrance=gsap.timeline({onComplete:()=>nodes.forEach(n=>n.disabled=false)}).fromTo(mask,{opacity:0,y:14,filter:'brightness(.12)'},{opacity:1,y:0,filter:'brightness(1)',duration:1.25,ease:'power2.out'})
    .fromTo(aura,{opacity:0},{opacity:1,duration:1.2},.2)
    .fromTo(nodes,{opacity:0,scale:.35,x:(_,el)=>{const r=el.getBoundingClientRect(),m=mask.getBoundingClientRect();return m.left+m.width/2-r.left-r.width/2;},y:(_,el)=>{const r=el.getBoundingClientRect(),m=mask.getBoundingClientRect();return m.top+m.height/2-r.top-r.height/2;}},{opacity:1,scale:1,x:0,y:0,duration:.85,stagger:.16,ease:'power2.out'},.6);
  }
  if(focus){const previous=nodes.find(n=>n.dataset.protocol===focusId);const node=previous&&!previous.disabled?previous:host.querySelector('h1');node.focus({preventScroll:true});}
 }
 async function choose(id,origin){
  const protocol=PROTOCOLS.find(p=>p.id===id);if(!protocol||busy)return;
  busy=true;preparation?.abort();preparation=new AbortController();const signal=preparation.signal;selected=protocol;focusId=id;const nonce=++token;entrance?.kill();
  const source=origin?.querySelector('.spirit')?.getBoundingClientRect();
  loader.hidden=false;host.inert=true;document.documentElement.dataset.stage='protocol-loading';
  loader.querySelector('h2').textContent=t(`protocol.${protocol.key}`);loader.querySelector('.load-retry').hidden=true;
  status.textContent=t('gate.preparing');proxy.p=0;loadedFraction=0;ignited=false;paint();gsap.set(loader,{opacity:0});gsap.set(loader.querySelector('.burn-scroll'),{opacity:0});
  const ready=prepare(protocol,p=>{if(nonce!==token)return;loadedFraction=p;if(ignited){progressTween?.kill();progressTween=gsap.to(proxy,{p,duration:reduced.matches?0:.5,onUpdate:paint});}},signal).then(value=>({value}),error=>({error}));
  const flying=document.createElement('div');flying.className='flying-spirit';flying.innerHTML=spiritMarkup;document.body.append(flying);
  const dest=loader.querySelector('.burn-scroll').getBoundingClientRect();
  gsap.set(flying,{left:source?source.left+source.width/2:innerWidth/2,top:source?source.top+source.height/2:innerHeight/2,xPercent:-50,yPercent:-50});
  loader.querySelector('.load-back').focus({preventScroll:true});
  await new Promise(resolve=>{
   flight=gsap.timeline({onComplete:resolve,onInterrupt:resolve}).to([mask,aura],{opacity:0,scale:.94,duration:reduced.matches?0:.35},0)
    .to(nodes,{opacity:0,duration:reduced.matches?0:.25},0)
    .to(loader,{opacity:1,duration:reduced.matches?0:.45},0)
    .to(flying,{left:dest.left+dest.width/2,top:dest.bottom,scale:.75,duration:reduced.matches?0:.85,ease:'power2.inOut'},0)
    .to(loader.querySelector('.burn-scroll'),{opacity:1,duration:reduced.matches?0:.25},reduced.matches?0:.6);
  });
  flying.remove();if(nonce!==token)return;ignited=true;progressTween?.kill();progressTween=gsap.to(proxy,{p:loadedFraction,duration:reduced.matches?0:1.05,onUpdate:paint});
  const result=await ready;if(nonce!==token)return;
  if(result.error){status.textContent=t('gate.error');loader.querySelector('.load-retry').hidden=false;busy=false;return;}
  progressTween?.kill();
  await new Promise(resolve=>{progressTween=gsap.to(proxy,{p:1,duration:reduced.matches?0:1.05,onUpdate:paint,onComplete:resolve,onInterrupt:resolve});});
  if(nonce!==token)return;status.textContent=t('gate.ready');
  await onOpen(protocol,result.value);if(nonce!==token)return;
  host.hidden=true;
  await new Promise(resolve=>{flight=gsap.to(loader,{opacity:0,duration:reduced.matches?0:.55,onComplete:resolve,onInterrupt:resolve});});
  if(nonce===token){loader.hidden=true;busy=false;}
 }
 host.addEventListener('click',e=>{const button=e.target.closest('[data-protocol]');if(button)choose(button.dataset.protocol,button);const home=e.target.closest('a[href="#protocols"]');if(home)e.preventDefault();});
 loader.querySelector('.load-back').addEventListener('click',()=>{setRoute('#protocols',{replace:true});show();});
 loader.querySelector('.load-retry').addEventListener('click',()=>choose(selected.id));
 document.addEventListener('i18n:change',()=>{language.value=lang();loader.setAttribute('aria-label',t('gate.loading'));host.querySelector('nav').setAttribute('aria-label',t('gate.title'));});
 return {show,choose,hide(){host.hidden=true;host.inert=true;}};
}
