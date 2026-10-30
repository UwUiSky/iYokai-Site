import { currentRoute,setRoute,normalizeRoute } from './core/navigation.js';
import { initBotHelp } from './ui/bot-help.js';
import { initSpiritDialog } from './ui/spirit-dialog.js';
import './style.css';
import './cinematic.css';
import './protocols.css';
import './readability.css';
import './atmosphere.css';
import './typography.css';
import { loadPublicLinks } from './core/links-config.js';
import { initDiscordPanels } from './ui/discord-panels.js';
import { initProtocolGate } from './ui/protocol-gate.js';
import { protocolFromHash, prepareResources } from './data/protocols.js';
import '@fontsource-variable/manrope';
import '@fontsource/jetbrains-mono/400.css';
import '@fontsource/jetbrains-mono/500.css';
import gsap from 'gsap';
import Lenis from 'lenis';
import { STILL_ART } from './data/artworks.js';
import { initI18n, t } from './i18n/index.js';
import { loadPrefs, applyPrefs } from './core/prefs.js';
import { startAssetPipeline, preloadCinematicAssets, preloadImage } from './core/preload.js';
import { initTerminal } from './ui/terminal.js';
import { initCinematic } from './ui/cinematic.js';
import { initHub } from './ui/hub.js';
import { initPlayer } from './ui/player.js';
import { initSheet } from './ui/sheet.js';
import { initStatus } from './ui/status.js';
import { initSystem } from './ui/system.js';
import { initInvite } from './ui/invite.js';
import { initYokai } from './ui/yokai.js';
import { initCommands } from './ui/commands.js';
import { initPanel } from './ui/panel.js';
import { initPrefsPanel } from './ui/prefsPanel.js';
const root=document.documentElement;root.dataset.artwork='static';root.dataset.backend='still';document.getElementById('gl').hidden=true;
startAssetPipeline();preloadImage('/cinematic/gate-mask.webp');preloadImage('/cinematic/wisp-frames-v2.webp');preloadImage('/cinematic/loading-scroll-v2.webp');
normalizeRoute();
const prefs=loadPrefs();applyPrefs(prefs);await initI18n(prefs.lang);
initBotHelp();initSpiritDialog();
const hub=initHub();initPlayer();initSheet();initStatus();initSystem();initInvite();initYokai();initCommands();initPanel();initPrefsPanel({prefs,onChange(){}});
document.body.append(document.getElementById('gear'),document.getElementById('prefs'));
const hubEl=document.getElementById('hub'),dc=document.getElementById('dc');hubEl.classList.add('cinematic-quick');
const quickClose=document.createElement('button');quickClose.className='quick-close';quickClose.textContent='×';quickClose.setAttribute('aria-label',t('sheet.close'));hubEl.append(quickClose);
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
const lenis=new Lenis({smoothWheel:!reduced.matches,virtualScroll:()=>!['cinema','protocol-world','discord'].includes(root.dataset.stage)});let mode='terminal';
const discordPanels=initDiscordPanels({host:dc,lenis,prefs,reduced,enabled:()=>mode==='discord'&&!document.querySelector('dialog[open],.sheet:not([hidden]),.sys:not([hidden]),.prefs:not([hidden])')});
const cinema=initCinematic({lenis,prefs,onDiscord:enterDiscord,onQuick:()=>{if(mode!=='cinema')return;cinema.quick(true);hub.show(0);quickClose.focus();}});
// Keep Lenis and scene dissolves on wall time after a throttled/background frame.
gsap.ticker.lagSmoothing(0);
const zeroPointer={sx:0,sy:0};gsap.ticker.add(time=>{lenis.raf(time*1000);if(mode==='cinema')cinema.update(zeroPointer);});
let pages, pageModule, profilePromise;
const loadProfile=()=>profilePromise ||= loadPublicLinks().catch(error=>{profilePromise=null;throw error;});
const gate=initProtocolGate({prefs,prepare:async(protocol,onProgress,signal)=>{
 let data;
 await prepareResources([
  async()=>{if(!await preloadImage(protocol.art))throw new Error('artwork');},
  async()=>{await Promise.all([document.fonts.load('40px Yokaiextreme'),document.fonts.load('22px Yokainormal')]);},
  async()=>{if(protocol.id==='discord'){await discordPanels.prepare();}else{[pageModule,data]=await Promise.all([pageModule||import('./ui/protocol-pages.js'),loadProfile()]);if(signal.aborted)throw new Error('cancelled');pages ||= pageModule.initProtocolPages({lenis,prefs,onBack:showProtocols});await pages.prepare(protocol,data,signal);}}
 ],onProgress);
 return data;
},onShow(){cinema.hide();pages?.hide();dc.hidden=true;hubEl.hidden=true;mode='protocols';lenis.stop();lenis.scrollTo(0,{immediate:true,force:true});},onOpen:async(protocol)=>{
 if(currentRoute()!==`#protocol/${protocol.id}`)setRoute(`#protocol/${protocol.id}`);
 if(protocol.id==='discord')await enterDiscord(true);else{mode='protocol-world';pages.show();}
}});
function showProtocols(){setRoute('#protocols');gate.show();}
const term=initTerminal({onEnter(){term.hide();const requested=protocolFromHash(currentRoute());gate.show({focus:!requested});if(requested)gate.choose(requested.id);document.dispatchEvent(new CustomEvent('realm:entered'));}});
addEventListener('popstate',()=>{
 if(mode==='terminal')return;
 const route=currentRoute(),requested=protocolFromHash(route);
 if(!requested&&document.getElementById(route.slice(1))?.closest('#cinematic')){
  pages?.hide();gate.hide();dc.hidden=true;mode='cinema';root.dataset.stage='cinema';preloadCinematicAssets({still:true});cinema.show();return;
 }
 gate.show({focus:!requested});if(requested)gate.choose(requested.id);
});
document.addEventListener('protocol:story',()=>{pages?.hide();gate.hide();mode='cinema';root.dataset.stage='cinema';setRoute('#origine');preloadCinematicAssets({still:true});cinema.show();});
const returnToProtocols=document.createElement('button');returnToProtocols.className='story-protocol-back';returnToProtocols.dataset.i18n='gate.back';returnToProtocols.textContent=t('gate.back');returnToProtocols.onclick=()=>{cinema.hide();showProtocols();};document.getElementById('cinematic').append(returnToProtocols);

function closeQuick(){hubEl.hidden=true;cinema.quick(false);}
quickClose.addEventListener('click',closeQuick);addEventListener('keydown',e=>{if(e.key==='Escape'&&!hubEl.hidden)closeQuick();});
async function enterDiscord(fromProtocol=false){
 if(mode!=='cinema'&&!fromProtocol)return;if(!hubEl.hidden)closeQuick();await preloadImage(STILL_ART.discord);
 cinema.hide();pages?.hide();lenis.start();mode='discord';root.dataset.stage='discord';document.getElementById('city').style.backgroundImage=`url("${STILL_ART.discord}")`;document.getElementById('city').style.opacity=1;document.getElementById('theater').style.opacity=0;document.querySelector('.world-shade').style.opacity='.15';dc.hidden=false;discordPanels.show();
}
document.getElementById('dcback').addEventListener('click',()=>{if(mode!=='discord')return;dc.hidden=true;showProtocols();});
hubEl.addEventListener('click',e=>{const a=e.target.closest('a[href="#discord"]');if(a){e.preventDefault();enterDiscord();}});
dc.addEventListener('click',e=>{const a=e.target.closest('a[href^="#"]');const target=a&&document.getElementById(a.hash.slice(1));if(target){e.preventDefault();discordPanels.goTo(target);}});
const io=new IntersectionObserver(entries=>entries.forEach(e=>e.target.classList.toggle('in',e.isIntersecting)),{threshold:.1});const watch=()=>document.querySelectorAll('.rv').forEach(el=>io.observe(el));watch();document.addEventListener('rv:refresh',watch);
document.addEventListener('i18n:change',()=>quickClose.setAttribute('aria-label',t('sheet.close')));
