import { hexLayout } from '../core/hex-layout.js';
export function initGateLayout(host){
 const orbit=host.querySelector('.gate-orbit'),nodes=[...host.querySelectorAll('.protocol-node')];let frame;
 function fit(){
  if(host.hidden)return;
  const compact=innerHeight<600&&innerWidth/innerHeight>1.35;
  host.dataset.hexCompact=String(compact);
  const {width,height}=orbit.getBoundingClientRect(),layout=hexLayout(width,height,{compact});
  host.style.setProperty('--hex-node-width',`${layout.nodeWidth}px`);host.style.setProperty('--hex-node-height',`${layout.nodeHeight}px`);host.style.setProperty('--hex-flame',`${layout.flame}px`);host.style.setProperty('--hex-mask',`${layout.mask}px`);
  nodes.forEach((n,i)=>{n.style.left=`${layout.points[i].x+layout.offsetX}px`;n.style.top=`${layout.points[i].y+layout.offsetY}px`;});
  for(const n of host.querySelectorAll('.mask-wrap,.mask-aura')){n.style.left=`${layout.cx}px`;n.style.top=`${layout.cy}px`;}
 }
 const schedule=()=>{cancelAnimationFrame(frame);frame=requestAnimationFrame(fit);};
 new ResizeObserver(schedule).observe(orbit);addEventListener('resize',schedule);window.visualViewport?.addEventListener('resize',schedule);document.addEventListener('i18n:change',schedule);
 return {fit};
}
