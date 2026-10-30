import { t } from '../i18n/index.js';
// The unmodified demo lacks Latin accents. CSS marks preserve the language
// visually; accessible headings keep the exact original Italian text.
export function harukazeNodes(text) {
 if(document.documentElement.dataset.artwork==='static')return [document.createTextNode(text)];
 return [...text].map(char=>{
  const decomposition=char.normalize('NFD');
  if(/^[A-Za-z][\u0300\u0301]$/.test(decomposition)){
   const span=document.createElement('span');span.className=`display-accent ${decomposition[1]==='\u0300'?'grave':'acute'}`;span.textContent=decomposition[0];return span;
  }
  return document.createTextNode(char==='’'?"'":char);
 });
}
export function applyHarukazeFallbacks(host) {
 host.querySelectorAll('.chapter h2').forEach(heading=>{
  const parts=[...heading.querySelectorAll('[data-i18n]')];
  heading.setAttribute('aria-label',parts.map(el=>t(el.dataset.i18n)).join(' '));
  parts.forEach(el=>el.replaceChildren(...harukazeNodes(t(el.dataset.i18n))));
  heading.querySelectorAll('.heading-line').forEach(line=>line.setAttribute('aria-hidden','true'));
 });
}
