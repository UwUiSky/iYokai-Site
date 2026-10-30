import { translateCopy } from '../i18n/index.js';
import {lang,t} from '../i18n/index.js';
import {loadPublicLinks} from '../core/links-config.js';
import {actionFor} from '../data/bots.js';
const text=translateCopy;
export function createNsfwLounge(){
 const dialog=document.createElement('dialog');dialog.className='nsfw-lounge';dialog.setAttribute('aria-labelledby','nsfw-title');document.body.append(dialog);let profile,catalog,from;
 async function render(){
  dialog.replaceChildren();const header=document.createElement('header');header.innerHTML='<span>iYokai NSFW · 18+</span><button type="button" data-close>×</button>';header.querySelector('button').setAttribute('aria-label',t('sheet.close'));dialog.append(header);
  const content=document.createElement('div');content.className='nsfw-content';const title=document.createElement('h2');title.id='nsfw-title';title.textContent=text('Il salotto delle Kitsune','The Kitsune lounge');const body=document.createElement('p');body.textContent=text('Un’identità separata dal Core. Esplora i comandi e configura gli spazi del tuo server riservati agli adulti.','An identity separate from Core. Explore its commands and configure your server’s adult-only spaces.');content.append(title,body);dialog.append(content);
  try{profile ||= await loadPublicLinks();if(!catalog){const r=await fetch('/nsfw-commands.json',{cache:'no-store'});if(!r.ok)throw Error('commands');catalog=await r.json();}}catch{const error=document.createElement('p');error.textContent=text('Catalogo non disponibile. Riprova tra poco.','Catalogue unavailable. Please try again shortly.');content.append(error);return;}
  if(!dialog.open)return;
  if(profile.discord.nsfwArtworkUrl){const img=document.createElement('img');img.src=profile.discord.nsfwArtworkUrl;img.alt=text('Le sei Kitsune nel salotto notturno','The six Kitsune in their night lounge');img.className='nsfw-art';header.after(img);}
  const invite=document.createElement('a'),href=actionFor({kind:'bot',clientId:profile.discord.nsfwClientId,perms:'0'})?.href;invite.className='btn btn--main';invite.textContent=text('Aggiungi iYokai NSFW al tuo server','Add iYokai NSFW to your server');if(href){invite.href=href;invite.target='_blank';invite.rel='noopener';}else{invite.setAttribute('aria-disabled','true');invite.textContent+=' · '+text('in arrivo','coming soon');}content.append(invite);
  const label=document.createElement('p');label.className='nsfw-catalog-label';label.textContent=text('Comandi dell’istanza NSFW','NSFW identity commands');content.append(label);
  for(const row of catalog.commands){const item=document.createElement('article'),code=document.createElement('code'),desc=document.createElement('p');code.textContent=row.name;desc.textContent=(t('nsfw.description.'+row.name)===('nsfw.description.'+row.name)?row.description.en:t('nsfw.description.'+row.name));item.append(code,desc);content.append(item);}
  const note=document.createElement('small');note.textContent=text('Conferma 18+ tramite autodichiarazione. I permessi e i canali per adulti sono verificati anche dal bot su Discord.','18+ confirmation is self-declared. Permissions and adult-only channels are also checked by the bot on Discord.');content.append(note);
 }
 dialog.addEventListener('click',e=>{if(e.target===dialog||e.target.closest('[data-close]'))dialog.close();});dialog.addEventListener('close',()=>from?.focus({preventScroll:true}));document.addEventListener('i18n:change',()=>{if(dialog.open)render();});return async(el)=>{from=el;if(!dialog.open)dialog.showModal();await render();};
}
