// Keep the supplied flame's fine filaments. A small moving displacement field
// animates the cutout itself; no GPU canvas or replacement fire illustration.
export function initSpiritFilter(){
 if(document.getElementById('wisp-flow'))return;
 const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');
 svg.setAttribute('width','0');svg.setAttribute('height','0');svg.setAttribute('aria-hidden','true');svg.style.position='absolute';svg.style.pointerEvents='none';
 svg.innerHTML='<defs><filter id="wisp-flow" x="-15%" y="-15%" width="130%" height="130%" color-interpolation-filters="sRGB"><feTurbulence type="fractalNoise" baseFrequency=".025 .014" numOctaves="2" seed="7" result="noise"><animate attributeName="baseFrequency" values=".025 .014;.020 .019;.025 .014" dur="4.8s" repeatCount="indefinite"/></feTurbulence><feOffset in="noise" dy="0" result="flow"><animate attributeName="dy" values="35;0;-35;35" dur="6.4s" repeatCount="indefinite"/></feOffset><feDisplacementMap in="SourceGraphic" in2="flow" scale="7" xChannelSelector="R" yChannelSelector="G"/></filter></defs>';
 document.body.append(svg);
 const reduced=matchMedia('(prefers-reduced-motion: reduce)'),visibility=()=>{if(document.hidden||reduced.matches||!['protocols','protocol-loading'].includes(document.documentElement.dataset.stage))svg.pauseAnimations?.();else svg.unpauseAnimations?.();};reduced.addEventListener('change',visibility);document.addEventListener('visibilitychange',visibility);new MutationObserver(visibility).observe(document.documentElement,{attributes:true,attributeFilter:['data-stage']});visibility();
}
