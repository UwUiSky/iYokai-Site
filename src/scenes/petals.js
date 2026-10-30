import * as THREE from 'three/webgpu';
export function createPetals(scene, tier) {
 const shape=new THREE.Shape();shape.moveTo(0,-.035);shape.bezierCurveTo(-.035,-.01,-.04,.022,-.012,.035);shape.quadraticCurveTo(0,.024,.012,.035);shape.bezierCurveTo(.04,.022,.035,-.01,0,-.035);
 const g=new THREE.ShapeGeometry(shape,5),m=new THREE.MeshStandardMaterial({color:0xeac2d0,roughness:.8,side:THREE.DoubleSide,transparent:true,opacity:.65,depthWrite:false});
 const count=tier==='low'?22:50,mesh=new THREE.InstancedMesh(g,m,count);mesh.frustumCulled=false;scene.add(mesh);
 const dummy=new THREE.Object3D(),seeds=Array.from({length:count},(_,i)=>({x:Math.sin(i*127.1)*8,y:(i*.618%1)*9,z:Math.cos(i*73.7)*2.5,speed:.16+(i*.37%1)*.26,phase:i*2.4}));
 return { update(t,reduced,visible){mesh.visible=visible;if(!visible)return;const time=reduced?0:t;seeds.forEach((s,i)=>{dummy.position.set(s.x+Math.sin(time*.25+s.phase)*.6,((s.y-time*s.speed)%9+9)%9-4.5,s.z);dummy.rotation.set(time*.7+s.phase,time*.42+s.phase,Math.sin(time*.4+s.phase));dummy.scale.setScalar(.6+(i*.23%1)*.9);dummy.updateMatrix();mesh.setMatrixAt(i,dummy.matrix);});mesh.instanceMatrix.needsUpdate=true;} };
}
export function staticPetals(){const layer=document.createElement('div');layer.id='sakura';layer.setAttribute('aria-hidden','true');layer.innerHTML=Array.from({length:22},(_,i)=>`<i style="--x:${(i*61.8)%100}%;--z:${-180+(i%5)*80}px;--delay:${-i*1.7}s;--duration:${14+(i%6)*2}s"></i>`).join('');document.body.append(layer);}
