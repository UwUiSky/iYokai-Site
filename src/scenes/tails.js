import * as THREE from 'three/webgpu';
// Tails emerge from the sacrum, sweep down under gravity, then curl at the tip.
// Deliberately asymmetrical; no radial flower / uniformly rotated silhouettes.
export const TAIL_PATHS = [
 [[0,0,0],[-.48,-.18,-.22],[-1.1,-.30,-.12],[-1.40,.05,.10],[-1.15,.66,.18]],
 [[.03,0,-.12],[.56,-.15,-.28],[1.03,.06,-.2],[1.25,.63,-.08],[1.08,1.12,.1]],
 [[-.02,0,-.24],[-.48,.32,-.45],[-1.00,.73,-.30],[-1.12,1.26,-.14],[-.82,1.64,.02]],
 [[.02,0,-.3],[.45,-.26,-.48],[.96,-.48,-.25],[1.48,-.3,-.02],[1.65,.12,.14]],
 [[0,0,-.4],[.14,.45,-.6],[.53,1.00,-.45],[.52,1.58,-.18],[.24,1.86,-.06]],
 [[0,0,-.45],[-.55,-.32,-.5],[-1.1,-.58,-.3],[-1.65,-.40,-.12],[-1.8,.02,.1]],
 [[0,0,-.5],[.5,.28,-.6],[1.0,.7,-.4],[1.28,1.2,-.2],[1.04,1.65,0]],
 [[0,0,-.55],[-.2,.42,-.7],[-.52,1.05,-.4],[-.55,1.65,-.2],[-.35,1.98,0]],
 [[0,0,-.6],[.4,-.3,-.65],[.7,-.65,-.4],[1.25,-.8,-.2],[1.65,-.62,.1]],
];
export const tailCurve = i => new THREE.CatmullRomCurve3(TAIL_PATHS[i].map(p => new THREE.Vector3(...p)));
export function tailGeometry(curve, segments, radial) {
 const frames = curve.computeFrenetFrames(segments, false), points = curve.getPoints(segments);
 const positions=[],colors=[],uv=[],indices=[];
 const root=new THREE.Color('#645868'),ivory=new THREE.Color('#ded5d8'),pink=new THREE.Color('#e2b6c5');
 for(let i=0;i<=segments;i++){
  const t=i/segments, radius=.018+.20*Math.pow(Math.sin(Math.PI*t),.72)*(1-t*.15);
  const c=root.clone().lerp(ivory,Math.min(1,t*2.8)).lerp(pink,Math.max(0,(t-.78)/.22)*.4);
  for(let j=0;j<=radial;j++){
   const a=j/radial*Math.PI*2, fur=1+.045*Math.sin(i*4.1+a*11)+.022*Math.cos(i*2.7-a*19);
   const v=points[i].clone().addScaledVector(frames.normals[i],Math.cos(a)*radius*fur).addScaledVector(frames.binormals[i],Math.sin(a)*radius*fur);
   positions.push(v.x,v.y,v.z);const shade=.92+.08*Math.cos(a*3+i*.7);colors.push(c.r*shade,c.g*shade,c.b*shade);uv.push(j/radial,t);
   if(i<segments&&j<radial){const n=i*(radial+1)+j,m=n+radial+1;indices.push(n,m,n+1,m,m+1,n+1);}
  }
 }
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));g.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.setIndex(indices);g.computeVertexNormals();return g;
}
// Same curved volumes rendered with directional fur strokes for the illustrated
// experience. SVG remains crisp independently of canvas resolution / GPU tier.
export function fallbackTailMarkup() {
 let seed=24; const random=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};
 const layer = (i) => {
  const curve=tailCurve(i),points=curve.getPoints(100), left=[],right=[];
  for(let n=0;n<=100;n++){
   const t=n/100,p=points[n],tangent=curve.getTangent(t),radius=.018+.20*Math.pow(Math.sin(Math.PI*t),.72)*(1-t*.15);
   const normal=new THREE.Vector2(-tangent.y,tangent.x).normalize();
   left.push([p.x+normal.x*radius,p.y+normal.y*radius]);right.push([p.x-normal.x*radius,p.y-normal.y*radius]);
  }
  const xy=p=>`${(300+p[0]*110).toFixed(2)},${(315-p[1]*110).toFixed(2)}`;
  const outline=`M${left.map(xy).join(' L')} L${right.reverse().map(xy).join(' L')} Z`;
  let hair='';
  for(let n=0;n<330;n++){
   const t=.08+random()*.88,p=curve.getPoint(t),tan=curve.getTangent(t),normal=new THREE.Vector2(-tan.y,tan.x).normalize();
   const r=(.018+.20*Math.pow(Math.sin(Math.PI*t),.72))*(random()*2-1),len=4+random()*12;
   const x=300+(p.x+normal.x*r)*110,y=315-(p.y+normal.y*r)*110;
   hair+=`<path d="M${x.toFixed(1)} ${y.toFixed(1)}q${(tan.x*len+normal.x*1.5).toFixed(1)} ${(-tan.y*len-normal.y*1.5).toFixed(1)} ${(tan.x*len*1.8).toFixed(1)} ${(-tan.y*len*1.8).toFixed(1)}" stroke="${n%3?'#f1e5e5':'#786774'}" stroke-opacity="${n%3?'.28':'.2'}" stroke-width=".45" fill="none"/>`;
  }
  return `<g class="tail-volume" data-tail="${i}" style="--phase:${-i*1.3}s"><defs><clipPath id="fur-clip-${i}"><path d="${outline}"/></clipPath></defs><path d="${outline}" fill="url(#fur-volume)" stroke="#c9b9c5" stroke-opacity=".5" stroke-width=".6"/><g clip-path="url(#fur-clip-${i})">${hair}</g></g>`;
 };
 return `<svg viewBox="0 0 600 450"><defs><linearGradient id="fur-volume" x1="0" y1="1" x2=".8" y2="0"><stop stop-color="#514552"/><stop offset=".32" stop-color="#a895a5"/><stop offset=".6" stop-color="#e2d8dc"/><stop offset=".76" stop-color="#b6a5b4"/><stop offset="1" stop-color="#f0d0da"/></linearGradient></defs>${[8,7,6,5,4,3,2,1,0].map(layer).join('')}</svg>`;
}

export function furTexture() {
 const canvas=document.createElement('canvas');canvas.width=512;canvas.height=1024;
 const c=canvas.getContext('2d');c.fillStyle='#e4dde0';c.fillRect(0,0,512,1024);
 let seed=7;const random=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};
 for(let i=0;i<9500;i++){
  const x=random()*512,y=random()*1024,length=8+random()*45;
  c.strokeStyle=i%3?'rgba(255,247,248,.35)':'rgba(78,61,77,.13)';c.lineWidth=.4+random()*.8;
  c.beginPath();c.moveTo(x,y);c.quadraticCurveTo(x+2,y+length*.55,x+(random()-.5)*5,y+length);c.stroke();
 }
 const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;texture.wrapS=THREE.RepeatWrapping;texture.anisotropy=4;return texture;
}
