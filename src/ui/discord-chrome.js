import './discord-chrome.css';
import { t,apply,lang } from '../i18n/index.js';
import { loadPublicLinks } from '../core/links-config.js';
import { actionFor,ITEMS } from '../data/bots.js';

export function initDiscordChrome(host){
 const MOBILE='(max-width:800px), (max-height:500px) and (max-width:1000px)';
 const bar=host.querySelector('.dc__bar'),back=host.querySelector('#dcback'),actions=host.querySelector('.dc__acts');
 back.dataset.i18n='dc.return';
 actions.innerHTML='<a class="btn" href="#panel" data-i18n="dc.login"></a><a class="btn" href="#panel" data-i18n="dash.t"></a><a class="btn" href="#commands" data-i18n="dc.commands"></a><button class="btn" type="button" data-patches data-i18n="dc.patches"></button>';
 const toggle=document.createElement('button');toggle.type='button';toggle.className='dc-menu-toggle';toggle.setAttribute('aria-controls','dc-mobile-menu');toggle.setAttribute('aria-expanded','false');toggle.dataset.i18nAttr='aria-label:dc.menu';toggle.innerHTML='<span></span><span></span><span></span>';bar.append(toggle);
 const menu=document.createElement('dialog');menu.id='dc-mobile-menu';menu.className='dc-drawer';menu.setAttribute('aria-labelledby','dc-menu-title');
 menu.innerHTML='<header><h2 id="dc-menu-title">Discord Core</h2><button type="button" data-close data-i18n-attr="aria-label:sheet.close">×</button></header><p class="dc-drawer-kicker">IYOKAI / CONTROL & EXPLORE</p><nav><a href="#panel" data-i18n="dc.login"></a><a href="#panel" data-i18n="dash.t"></a><a href="#commands" data-i18n="dc.commands"></a><button type="button" data-patches data-i18n="dc.patches"></button><a href="#panel" data-i18n="dc.manage-bots"></a><button type="button" data-protocols data-i18n="dc.return"></button></nav>';
 document.body.append(menu);
 const helpLinks=['faq','privacy','plans','contact'].map(p=>`<button type="button" data-bot-help="${p}" data-i18n="help.${p}"></button>`).join('');
 menu.querySelector('nav').insertAdjacentHTML('beforeend',helpLinks);
 const helpButton=document.createElement('button');helpButton.type='button';helpButton.className='btn';helpButton.dataset.botHelp='faq';helpButton.dataset.i18n='help.faq';actions.append(helpButton);
 let following=false;
 toggle.onclick=()=>{following=false;menu.showModal();toggle.setAttribute('aria-expanded','true');};
 menu.addEventListener('close',()=>{toggle.setAttribute('aria-expanded','false');if(!following)toggle.focus({preventScroll:true});});
 menu.addEventListener('click',e=>{if(e.target===menu||e.target.closest('[data-close]')){menu.close();return;}if(e.target.closest('a,nav button')){following=true;menu.close();if(e.target.closest('[data-protocols]'))back.click();}});
 matchMedia(MOBILE).addEventListener('change',e=>{if(!e.matches&&menu.open)menu.close();});
 const notes=document.createElement('dialog');notes.className='dc-notes';notes.setAttribute('aria-labelledby','dc-notes-title');notes.innerHTML='<header><div><p class="dc-drawer-kicker">IYOKAI / CHANGELOG</p><h2 id="dc-notes-title" data-i18n="dc.patches"></h2></div><button type="button" data-close data-i18n-attr="aria-label:sheet.close">×</button></header><div class="dc-notes-list"></div>';document.body.append(notes);
 let revisions,notesFrom;
 async function renderNotes(){const list=notes.querySelector('.dc-notes-list');list.replaceChildren();if(!revisions){list.textContent=t('dc.notes-loading');try{const r=await fetch('/patch-notes.json',{cache:'no-store'});if(!r.ok)throw Error('notes');revisions=(await r.json()).revisions||[];}catch{list.textContent=t('dc.notes-error');return;}}list.replaceChildren();for(const revision of revisions){const article=document.createElement('article'),date=document.createElement('p'),heading=document.createElement('h3'),changes=document.createElement('ul');date.className='dc-note-date';date.textContent=new Date(revision.date+'T12:00:00Z').toLocaleDateString(lang(),{year:'numeric',month:'long',day:'numeric'});heading.textContent=(revision.translationKey?t(revision.translationKey+'.title'):revision.title?.[lang()]||revision.title?.en||'');for(const [index,item] of (revision.changes?.[lang()]||revision.changes?.en||[]).entries()){const li=document.createElement('li');li.textContent=revision.translationKey?t(revision.translationKey+'.change.'+index):item;changes.append(li);}article.append(date,heading,changes);list.append(article);}if(!revisions.length)list.textContent=t('dc.notes-empty');}
 document.addEventListener('click',e=>{const button=e.target.closest('[data-patches]');if(button){notesFrom=button;notes.showModal();renderNotes();}});
 notes.addEventListener('click',e=>{if(e.target===notes||e.target.closest('[data-close]'))notes.close();});notes.addEventListener('close',()=>{(notesFrom?.closest('dialog')?toggle:notesFrom)?.focus({preventScroll:true});});
 const hero=host.querySelector('.dc__hero .dc-panel-content');hero.dataset.panelScroll='';hero.dataset.lenisPrevent='';hero.tabIndex=0;
 const cta=document.createElement('div');cta.className='dc-home-actions';cta.innerHTML='<div class="dc-home-pair"><a class="btn btn--main" data-home-bot target="_blank" rel="noopener" data-i18n="dc.add-bot" aria-disabled="true"></a><a class="btn" data-home-app target="_blank" rel="noopener" data-i18n="dc.add-app" aria-disabled="true"></a></div><div class="dc-home-download"><p data-i18n="dc.download-intro"></p><a class="btn" data-home-download target="_blank" rel="noopener" data-i18n="dc.download" aria-disabled="true"></a></div><small class="dc-links-status" data-i18n="dc.links-pending"></small>';hero.append(cta);
 let profile;
 const connect=(node,url)=>{if(url){node.href=url;node.removeAttribute('aria-disabled');}else{node.removeAttribute('href');node.setAttribute('aria-disabled','true');}};
 function update(){apply(bar);apply(menu);apply(notes);apply(cta);if(notes.open)renderNotes();if(profile){connect(cta.querySelector('[data-home-bot]'),actionFor({kind:'bot',clientId:profile.discord.botClientId,perms:profile.discord.botPermissions})?.href);connect(cta.querySelector('[data-home-app]'),actionFor({kind:'app',clientId:profile.discord.appClientId})?.href);const mobile=matchMedia(MOBILE).matches;connect(cta.querySelector('[data-home-download]'),mobile?(profile.discord.mobileUrl||profile.discord.desktopUrl):(profile.discord.desktopUrl||profile.discord.mobileUrl));cta.querySelector('.dc-links-status').hidden=Boolean(profile.discord.botClientId&&profile.discord.appClientId&&(profile.discord.desktopUrl||profile.discord.mobileUrl));}}
 loadPublicLinks().then(p=>{profile=p;update();}).catch(()=>{});matchMedia(MOBILE).addEventListener('change',update);document.addEventListener('i18n:change',update);update();
}
