import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
const bytes=await fs.readFile(new URL('../public/cinematic/kitsune-prototype.glb',import.meta.url));
const gltf=await new GLTFLoader().parseAsync(bytes.buffer.slice(bytes.byteOffset,bytes.byteOffset+bytes.byteLength),'');
test('prototype contains an actual skin, 18 bones and three playable animation clips',()=>{
 const skins=[];gltf.scene.traverse(o=>{if(o.isSkinnedMesh)skins.push(o)});assert.ok(skins.length>0);
 assert.equal(skins[0].skeleton.bones.length,18);
 assert.deepEqual(gltf.animations.map(a=>a.name).sort(),['Bow','Idle_Breath','Welcome']);
 for(const mesh of skins){const weights=mesh.geometry.attributes.skinWeight,indices=mesh.geometry.attributes.skinIndex;
  for(let i=0;i<weights.count;i++){let sum=0;for(let k=0;k<4;k++){const w=weights.array[i*4+k];sum+=w;assert.ok(Number.isFinite(w)&&w>=0);if(w>0)assert.ok(indices.array[i*4+k]<18)}assert.ok(Math.abs(sum-1)<1e-4)}
 }
});
test('welcome animation changes the right forearm transform and preserves finite bounds',()=>{
 let bone;gltf.scene.traverse(o=>{if(o.isBone&&/forearm.*R/.test(o.name))bone=o});assert.ok(bone);
 const mixer=new THREE.AnimationMixer(gltf.scene),clip=gltf.animations.find(a=>a.name==='Welcome');
 mixer.clipAction(clip).play();mixer.setTime(0);const before=bone.quaternion.clone();mixer.setTime(clip.duration*.4);
 assert.ok(1-Math.abs(before.dot(bone.quaternion))>1e-6,'forearm did not animate');
 gltf.scene.updateMatrixWorld(true);gltf.scene.traverse(o=>{if(o.isSkinnedMesh){o.computeBoundingBox();assert.ok([...o.boundingBox.min,...o.boundingBox.max].every(Number.isFinite));}});
 mixer.stopAllAction();
});
