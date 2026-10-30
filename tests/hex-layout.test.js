import test from 'node:test';
import assert from 'node:assert/strict';
import { hexLayout } from '../src/core/hex-layout.js';
test('flame centres form a regular hexagon within the responsive selector',()=>{
 for(const [width,height,compact] of [[340,476,false],[370,634,false],[920,530,false],[2400,500,false],[804,266,true]]){
  const l=hexLayout(width,height,{compact});
  for(let i=0;i<6;i++){
   const p=l.points[i],q=l.points[(i+1)%6];
   assert.ok(Math.abs(Math.hypot(p.x-l.cx,p.y-l.cy)-l.radius)<1e-8);
   assert.ok(Math.abs(Math.hypot(q.x-p.x,q.y-p.y)-l.radius)<1e-8);
   const x=p.x+l.offsetX,y=p.y+l.offsetY;
   assert.ok(x-l.nodeWidth/2>=-1e-8&&x+l.nodeWidth/2<=width+1e-8);
   assert.ok(y-l.nodeHeight/2>=-1e-8&&y+l.nodeHeight/2<=height+1e-8);
  }
 }
});
