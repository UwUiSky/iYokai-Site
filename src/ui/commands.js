import './commands.css';
import { t,apply,lang } from '../i18n/index.js';
import { indexCommands,filterCommands } from '../core/command-catalog.js';
import { scopedCommands } from '../data/spirit-catalog.js';

export function initCommands(){
 const dialog=document.createElement('dialog');dialog.className='command-dialog';dialog.setAttribute('aria-labelledby','cmd-title');
 dialog.innerHTML='<div class="command-shell"><header class="command-header"><div><p class="command-kicker">IYOKAI / COMMAND LIBRARY</p><h2 id="cmd-title" data-i18n="cmd.t"></h2></div><button type="button" data-command-close data-i18n-attr="aria-label:sheet.close">×</button></header><div class="command-controls"><label for="command-search" class="sr-only" data-i18n="cmd.search"></label><div class="command-search-row"><input id="command-search" type="search" maxlength="200" data-i18n-attr="placeholder:cmd.search" autocomplete="off" spellcheck="false"><button type="button" data-command-clear data-i18n="cmd.reset" hidden></button></div><div class="command-categories" role="group" data-i18n-attr="aria-label:cmd.cats"></div><div class="command-meta"><p class="command-count" role="status" aria-live="polite" aria-atomic="true"></p><p class="command-source" data-i18n="cmd.source"></p></div></div><div class="command-results" tabindex="0" data-lenis-prevent data-i18n-attr="aria-label:cmd.results" aria-busy="false"><ul class="command-list"></ul><div class="command-empty" hidden><h3></h3><p></p><button type="button" class="btn" data-command-retry data-i18n="cmd.retry" hidden></button></div></div><p class="command-copy-status" role="status" aria-live="polite"></p></div>';
 document.body.append(dialog);apply(dialog);
 const input=dialog.querySelector('input'),categories=dialog.querySelector('.command-categories'),results=dialog.querySelector('.command-results'),list=dialog.querySelector('ul'),empty=dialog.querySelector('.command-empty'),count=dialog.querySelector('.command-count'),clear=dialog.querySelector('[data-command-clear]'),copyStatus=dialog.querySelector('.command-copy-status');
 const localized=()=>Object.fromEntries(Object.keys(translations).map(name=>[name,t('command.description.'+name)===('command.description.'+name)?translations[name]:t('command.description.'+name)]));
 let catalog,translations={},commands,groups=[],category='*',scope='*',from,request=0,loading=false,failed=false,debounce,copyRevision=0;
 function index(){commands=scopedCommands(indexCommands(catalog,{translations:localized(),language:lang(),translationLanguage:lang()}),scope);groups=[...new Set(commands.map(c=>c.category))].map(name=>[name,commands.filter(c=>c.category===name).length]);}
 const categoryLabel=name=>t(`cmd.category.${name}`)===`cmd.category.${name}`?name:t(`cmd.category.${name}`);
 function filters(){
  categories.replaceChildren();if(!commands)return;
  const label=document.createElement('label'),select=document.createElement('select');label.textContent=t('cmd.cats');select.dataset.commandCategorySelect='';select.setAttribute('aria-label',t('cmd.cats'));
  for(const [name,total] of [['*',commands.length],...groups]){
   const option=document.createElement('option');option.value=name;option.textContent=`${name==='*'?t('cmd.all'):categoryLabel(name)} (${total})`;select.append(option);
  }
  select.value=category;label.append(select);categories.append(label);
 }
 function placeholder(title,body,{retry=false}={}){
  list.replaceChildren();empty.hidden=false;empty.querySelector('h3').textContent=title;empty.querySelector('p').textContent=body;empty.querySelector('[data-command-retry]').hidden=!retry;
 }
 function render({resetScroll=false}={}){
  clear.hidden=!input.value&&category==='*';const picker=categories.querySelector('select');if(picker)picker.value=category;const source=dialog.querySelector('.command-source');source.hidden=!commands;if(commands)source.textContent=t('cmd.source',{date:catalog.generated});
  if(loading){count.textContent=t('cmd.loading');placeholder(t('cmd.loading'),t('cmd.loading-note'));return;}
  if(failed){count.textContent=t('cmd.load-error');placeholder(t('cmd.load-error'),t('cmd.error-note'),{retry:true});return;}
  if(!commands)return;
  const rows=filterCommands(commands,{category,query:input.value});count.textContent=rows.length===1?t('cmd.one'):t('cmd.count',{n:rows.length});list.replaceChildren();empty.hidden=rows.length>0;
  if(!rows.length)placeholder(t('cmd.none'),t('cmd.search-tip'));
  const fragment=document.createDocumentFragment();
  for(const row of rows){
   const li=document.createElement('li'),details=document.createElement('div'),code=document.createElement('code'),badge=document.createElement('small'),description=document.createElement('p'),copy=document.createElement('button');
   code.textContent=row.kind==='context'?row.name.slice(1):row.name;badge.textContent=categoryLabel(row.category)+(row.kind==='context'?' · '+t('cmd.context'):'');badge.className='command-category';description.textContent=row.description;description.lang=row.language;details.append(code,badge,description);
   copy.type='button';copy.className='command-copy';copy.dataset.copyCommand=row.name;copy.textContent=t('cmd.copy');copy.setAttribute('aria-label',t('cmd.copy-name',{name:row.name}));li.append(details);if(row.kind!=='context')li.append(copy);fragment.append(li);
  }
  list.append(fragment);if(resetScroll)results.scrollTop=0;
 }
 async function load(){
  if(loading)return;const ticket=++request;loading=true;failed=false;results.setAttribute('aria-busy','true');render();
  try{
   const [source,english]=await Promise.all([import('../data/commands.json'),import('../data/commands.en.json')]);
   const data=source.default;
   if(ticket!==request||!dialog.open)return;
   catalog=data;translations=english.default;index();filters();
  }catch{if(ticket===request&&dialog.open)failed=true;}
  finally{if(ticket===request&&dialog.open){loading=false;results.setAttribute('aria-busy','false');render();}}
 }
 function open(trigger,selectedScope='*'){
  scope=selectedScope;category='*';input.value='';if(catalog)index();
  from=trigger?.closest('#dc-mobile-menu')?document.querySelector('.dc-menu-toggle'):trigger;
  if(!dialog.open)dialog.showModal();apply(dialog);if(commands)filters();copyStatus.textContent='';render();input.focus({preventScroll:true});if(!commands)load();
 }
 dialog.addEventListener('keydown',e=>{
  if(e.key!=='Tab')return;
  const focusable=[...dialog.querySelectorAll('button:not([disabled]),input:not([disabled]),select:not([disabled]),[tabindex="0"]')].filter(el=>el.getClientRects().length>0);
  const first=focusable[0],last=focusable.at(-1),active=dialog.ownerDocument.activeElement;
  if(e.shiftKey&&active===first){e.preventDefault();last?.focus();}
  else if(!e.shiftKey&&active===last){e.preventDefault();first?.focus();}
 });
 dialog.addEventListener('close',()=>{request++;loading=false;clearTimeout(debounce);copyRevision++;from?.focus({preventScroll:true});});
 dialog.addEventListener('change',e=>{if(e.target.matches('[data-command-category-select]')){category=e.target.value;render({resetScroll:true});}});
 input.addEventListener('input',()=>{clearTimeout(debounce);debounce=setTimeout(()=>render({resetScroll:true}),90);});
 dialog.addEventListener('click',async e=>{
  if(e.target===dialog||e.target.closest('[data-command-close]')){dialog.close();return;}
  if(e.target.closest('[data-command-clear]')){input.value='';category='*';render({resetScroll:true});input.focus();return;}
  if(e.target.closest('[data-command-retry]')){load();return;}
  const copy=e.target.closest('[data-copy-command]');if(copy){
   const ticket=++copyRevision;copyStatus.textContent='';
   try{await navigator.clipboard.writeText(copy.dataset.copyCommand);if(ticket===copyRevision&&dialog.open)copyStatus.textContent=t('cmd.copied',{name:copy.dataset.copyCommand});}
   catch{if(ticket===copyRevision&&dialog.open)copyStatus.textContent=t('cmd.copy-error');}
  }
 });
 document.addEventListener('click',e=>{const link=e.target.closest('a[href="#commands"]');if(link){e.preventDefault();open(link,link.dataset.commandScope||'*');}});
 document.addEventListener('iyokai:commands-open',e=>open(e.detail?.trigger,e.detail?.scope||'*'));
 document.addEventListener('i18n:change',()=>{if(catalog)index();if(dialog.open){apply(dialog);filters();render();copyStatus.textContent='';}});
}
