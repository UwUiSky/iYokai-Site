// An uneven advancing edge, while every point moves upwards monotonically.
export function burnClip(progress){
 const p=Math.max(0,Math.min(1,Number.isFinite(progress)?progress:0));
 if(!p)return 'inset(0)';if(p===1)return 'inset(0 0 100% 0)';
 const y=100*(1-p),amplitude=1.8*Math.sin(Math.PI*p);
 const edge=Array.from({length:17},(_,i)=>{const x=100-i*6.25,notch=(Math.sin(i*2.3)+1)*amplitude/2;return `${x}% ${Math.max(0,y-notch).toFixed(3)}%`;});
 return `polygon(0 0,100% 0,${edge.join(',')})`;
}
