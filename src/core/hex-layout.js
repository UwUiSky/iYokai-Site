// Flame centres, not text-box edges, are the vertices of a regular hexagon.
export function hexLayout(width,height,{compact=false}={}) {
 const nodeWidth=compact?180:Math.max(100,Math.min(186,width*.29));
 const nodeHeight=compact?70:166;
 const flame=compact?62:(width<500?104:114);
 const offsetX=compact?(nodeWidth-flame)/2:0;
 const offsetY=compact?0:(nodeHeight-flame)/2;
 const radius=Math.max(18,Math.min(230,(width-nodeWidth)/Math.sqrt(3),(height-nodeHeight)/2));
 const cx=width/2-offsetX,cy=height/2-offsetY;
 const points=Array.from({length:6},(_,i)=>{const a=(-90+i*60)*Math.PI/180;return {x:cx+radius*Math.cos(a),y:cy+radius*Math.sin(a)};});
 return {points,cx,cy,radius,nodeWidth,nodeHeight,flame,offsetX,offsetY,mask:Math.max(54,Math.min(210,radius*.74))};
}
