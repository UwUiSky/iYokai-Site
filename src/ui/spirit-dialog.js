import { t } from '../i18n/index.js';
import { spiritById,spiritBio } from '../data/spirit-catalog.js';
import { ITEMS,configureBots,actionFor } from '../data/bots.js';
import { loadPublicLinks } from '../core/links-config.js';
import './spirit-dialog.css';

export function initSpiritDialog(){
 initHouseFeatures();
 const dialog=document.createElement('dialog');dialog.className='spirit-dialog';dialog.setAttribute('aria-labelledby','spirit-title');
 dialog.innerHTML='<div class="spirit-shell"><header><div><p class="spirit-kicker"></p><h2 id="spirit-title"></h2></div><button type="button" data-spirit-close>×</button></header><div class="spirit-content" data-lenis-prevent tabindex="0"><p class="spirit-original"></p><p class="spirit-bio" lang="it"></p><div class="spirit-actions"></div><section class="spirit-story" lang="it" id="spirit-story" hidden></section><p class="spirit-note"></p></div></div>';
 document.body.append(dialog);
 const content=dialog.querySelector('.spirit-content'),story=dialog.querySelector('.spirit-story'),actions=dialog.querySelector('.spirit-actions');
 let selected=null,from,lore,pending,profile,revision=0,expanded=false;
 const button=(label,fn)=>{const b=document.createElement('button');b.type='button';b.className='btn';b.textContent=label;b.onclick=fn;return b;};
 function link(label,href){
  if(!href){const b=button(label+' · '+t('inv.soon'),()=>{});b.disabled=true;return b;}
  const a=document.createElement('a');a.className='btn btn--main';a.textContent=label;a.href=href;a.target='_blank';a.rel='noopener';return a;
 }
 async function showLore(){
  expanded=!expanded;story.hidden=!expanded;
  const b=actions.querySelector('[data-spirit-lore]');b.setAttribute('aria-expanded',String(expanded));
  if(!expanded)return;
  const version=revision;story.textContent=t('spirit.loading');
  try{
   lore ||= await (pending ||= import('../data/spirit-lore.it.json').then(x=>x.default).catch(e=>{pending=null;throw e;}));
   if(version!==revision||!dialog.open)return;
   story.replaceChildren();
   for(const paragraph of lore[selected.lore].body.split(/\n\n+/)){const p=document.createElement('p');p.textContent=paragraph;story.append(p);}
  }catch{if(version===revision){story.textContent=t('spirit.loadError');const retry=button(t('cmd.retry'),()=>{expanded=false;showLore();});story.append(retry);}}
 }
 function render(){
  if(!selected)return;
  dialog.querySelector('#spirit-title').textContent=selected.id==='house'?t('house.title'):selected.id==='music'?t('spirit.sisters'):selected.name;
  dialog.querySelector('.spirit-kicker').textContent=selected.musicNumber?t('spirit.musicNumber',{n:selected.musicNumber}):t('spirit.kind.'+selected.type);
  dialog.querySelector('[data-spirit-close]').setAttribute('aria-label',t('sheet.close'));
  dialog.querySelector('.spirit-bio').textContent=spiritBio(selected.id).bio;
  dialog.querySelector('.spirit-original').textContent=t('spirit.original');
  dialog.querySelector('.spirit-note').textContent=t('spirit.availability')+(selected.scope==='music'?' '+t('spirit.musicShared'):'')+(selected.id==='mod'?' '+t('spirit.modCompanion'):'');
  actions.replaceChildren();
  const loreButton=button(t('spirit.lore'),showLore);loreButton.dataset.spiritLore='';loreButton.setAttribute('aria-controls','spirit-story');loreButton.setAttribute('aria-expanded',String(expanded));actions.append(loreButton);
  if(selected.scope)actions.append(button(t('spirit.commands'),()=>{
   const scope=selected.scope,trigger=from;dialog.close();document.dispatchEvent(new CustomEvent('iyokai:commands-open',{detail:{scope,trigger}}));
  }));
  if(selected.age)actions.append(button(t('spirit.commands')+' · 18+',()=>{const trigger=from;dialog.close();document.dispatchEvent(new CustomEvent('iyokai:nsfw-open',{detail:{trigger}}));}));
  const bot=ITEMS.find(b=>b.id===selected.id);
  if(bot){
   if(bot.age)actions.append(button(t('inv.addServer')+' · 18+',()=>{const trigger=from;dialog.close();document.dispatchEvent(new CustomEvent('iyokai:nsfw-open',{detail:{trigger}}));}));
   else actions.append(link(t(bot.kind==='app'?'inv.addProfile':'inv.addServer'),actionFor(bot)?.href));
  }
  if(selected.id==='house'){
   actions.append(link(t('house.desktop'),profile?.discord.desktopUrl),link(t('house.android'),profile?.discord.mobileUrl));
  }
  if(selected.musicNumber)actions.append(button(t('spirit.sistersLore'),()=>open('music',from)));
 }
 function open(id,trigger){
  const item=spiritById(id);if(!item)return;
  selected={...item,scope:trigger?.dataset.spiritScope||item.scope};from=trigger;expanded=false;revision++;story.hidden=true;story.replaceChildren();content.scrollTop=0;
  render();if(!dialog.open)dialog.showModal();dialog.querySelector('[data-spirit-close]').focus({preventScroll:true});
  const version=revision;
  loadPublicLinks().then(p=>{if(version!==revision||!dialog.open)return;profile=p;configureBots(p);render();}).catch(()=>{});
 }
 dialog.addEventListener('click',e=>{if(e.target===dialog||e.target.closest('[data-spirit-close]'))dialog.close();});
 dialog.addEventListener('close',()=>{revision++;from?.focus?.({preventScroll:true});});
 document.addEventListener('click',e=>{const trigger=e.target.closest('[data-spirit]');if(trigger){e.preventDefault();open(trigger.dataset.spirit,trigger);}});
 document.addEventListener('i18n:change',()=>{if(dialog.open)render();});
 return {open};
}

function initHouseFeatures(){
 const dialog=document.createElement('dialog');dialog.className='spirit-dialog house-features';dialog.setAttribute('aria-labelledby','house-features-title');
 dialog.innerHTML='<div class="spirit-shell"><header><h2 id="house-features-title"></h2><button type="button" data-features-close>×</button></header><div class="spirit-content"><p class="spirit-bio" lang="en">Work in Progress</p></div></div>';
 document.body.append(dialog);let from;
 const translate=()=>{dialog.querySelector('h2').textContent=t('house.features');dialog.querySelector('button').setAttribute('aria-label',t('sheet.close'));};
 document.addEventListener('click',e=>{const trigger=e.target.closest('[data-house-features]');if(trigger){from=trigger;translate();dialog.showModal();}});
 dialog.addEventListener('click',e=>{if(e.target===dialog||e.target.closest('[data-features-close]'))dialog.close();});
 dialog.addEventListener('close',()=>from?.focus({preventScroll:true}));
 document.addEventListener('i18n:change',translate);translate();
}
