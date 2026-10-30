import { currentRoute,setRoute } from './navigation.js';
// One wheel burst / completed swipe advances exactly one chapter. Trackpad
// momentum must settle before another chapter can be requested.
export function createPanelNavigation({ sections, lenis, enabled, onSelect, reduced, historyMode: navigationHistory = 'push' }) {
  let index = 0, busy = false, wheelTotal = 0, quietTimer, wheelLatched = false, touch, resizeTimer;
  const blocked = target => target.closest('dialog, .sheet, .sys, .prefs, .hub, input, select, textarea, iframe, [contenteditable="true"]');
  const scrollArea = target => target.closest('[data-panel-scroll]');
  const consumes = (area, delta) => area && area.scrollHeight > area.clientHeight + 1 && (delta > 0 ? (area.scrollTop || 0) + area.clientHeight < area.scrollHeight - 2 : delta < 0 && (area.scrollTop || 0) > 2);
  const settleWheel = () => { clearTimeout(quietTimer); quietTimer=setTimeout(()=>{wheelLatched=false;wheelTotal=0;},200); };
  function go(next, { immediate = false, historyMode = navigationHistory } = {}) {
    next = Math.max(0, Math.min(sections.length - 1, next));
    const direction = Math.sign(next - index);
    index = next; busy = !immediate && !reduced.matches;
    onSelect(index, { immediate:immediate || reduced.matches, direction });
    lenis.scrollTo(sections[index], { force:true, lock:true, immediate:immediate || reduced.matches, duration:.9, easing:t => 1 - Math.pow(1 - t, 4), onComplete() { busy = false; } });
    const hash = `#${sections[index].id}`;
    if (historyMode && currentRoute() !== hash) setRoute(hash,{replace:historyMode==='replace'});
  }
  addEventListener('wheel', e => {
    if (!enabled() || e.ctrlKey || blocked(e.target)) return;
    const delta=e.deltaY*(e.deltaMode===1?16:e.deltaMode===2?innerHeight:1);
    settleWheel();
    if(consumes(scrollArea(e.target),delta)){wheelLatched=true;wheelTotal=0;return;}
    // At the edge a fresh gesture advances the page. Momentum from scrolling
    // the catalogue cannot accidentally open the next page in the same burst.
    e.preventDefault();if(busy||wheelLatched)return;
    wheelTotal+=delta;if(Math.abs(wheelTotal)<32)return;
    wheelLatched=true;go(index+Math.sign(wheelTotal));wheelTotal=0;
  },{passive:false});
  addEventListener('touchstart',e=>{
    touch=enabled()&&!blocked(e.target)&&e.touches.length===1?{x:e.touches[0].clientX,y:e.touches[0].clientY,area:scrollArea(e.target),native:false,panel:false}:null;
  },{passive:true});
  addEventListener('touchmove',e=>{
    if(!touch||!enabled()||e.touches.length!==1)return;
    const dx=touch.x-e.touches[0].clientX,dy=touch.y-e.touches[0].clientY;
    if(Math.max(Math.abs(dx),Math.abs(dy))<8)return;
    if(touch.native)return;
    if(!touch.panel&&Math.abs(dy)>=Math.abs(dx)&&consumes(touch.area,dy)){touch.native=true;return;}
    touch.panel=true;e.preventDefault();
  },{passive:false});
  addEventListener('touchend',e=>{
    if(!touch)return;const gesture=touch;touch=null;
    const dx=gesture.x-e.changedTouches[0].clientX,dy=gesture.y-e.changedTouches[0].clientY;
    if(gesture.native||busy||!enabled()||Math.max(Math.abs(dx),Math.abs(dy))<45)return;
    if(!gesture.panel&&Math.abs(dy)>=Math.abs(dx)&&consumes(gesture.area,dy))return;
    go(index+Math.sign(Math.abs(dy)>=Math.abs(dx)?dy:dx));
  },{passive:true});
  addEventListener('touchcancel',()=>{touch=null;});
  addEventListener('keydown',e=>{
    if(!enabled()||blocked(e.target)||e.altKey||e.ctrlKey||e.metaKey||e.target.closest('button,a')&&[' ','Enter'].includes(e.key))return;
    const directions={ArrowDown:1,ArrowRight:1,PageDown:1,' ':e.shiftKey?-1:1,ArrowUp:-1,ArrowLeft:-1,PageUp:-1};
    if(!(e.key in directions)&&!['Home','End'].includes(e.key))return;
    const area=scrollArea(e.target),delta=e.key==='Home'?-1:e.key==='End'?1:directions[e.key];
    if(consumes(area,delta))return;
    e.preventDefault();if(busy)return;
    go(e.key==='Home'?0:e.key==='End'?sections.length-1:index+delta);
  });
  // Scrollbar and assistive-tech scrolling also settle on a whole panel.
  addEventListener('scroll', () => {
    if (!enabled() || busy) return;
    clearTimeout(resizeTimer); resizeTimer = setTimeout(() => {
      if (!enabled() || busy) return;
      const closest = sections.reduce((best, s, i) => Math.abs(s.offsetTop - scrollY) < Math.abs(sections[best].offsetTop - scrollY) ? i : best, 0);
      if (Math.abs(sections[closest].offsetTop - scrollY) > 2 || index !== closest) go(closest, { historyMode:'replace' });
    }, 140);
  }, { passive:true });
  addEventListener('resize', () => { if (enabled()) { lenis.resize(); go(index, { immediate:true, historyMode:false }); } });
  return { go, get index() { return index; } };
}
