import * as THREE from 'three/webgpu';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { createRenderer } from './core/renderer.js';
import { tailGeometry, tailCurve } from './scenes/tails.js';
import { startAssetPipeline, warmGpuAssets } from './core/preload.js';
startAssetPipeline();
const canvas=document.getElementById('model-canvas'),stage=document.querySelector('.stage'),offline=document.getElementById('offline-render'),video=document.getElementById('animation-video'),reference=document.getElementById('reference');
const renderer=await createRenderer(canvas,{tier:'mid',dpr:1.5});
const mode=document.getElementById('render-mode'),note=document.getElementById('controls-note'),clipSelect=document.getElementById('clip'),pause=document.getElementById('play-pause');
let scene,camera,controls,mixer,action,paused=false,comparing=false;const actions=new Map(),tails=[];let time=0;
if(renderer.staticFallback){canvas.hidden=true;mode.textContent='RENDER BLENDER / GPU NON DISPONIBILE';note.textContent='Le viste e il saluto provengono dal modello reale renderizzato in Blender. Per la rotazione libera serve WebGL 2 o WebGPU.';document.getElementById('tail-slider').disabled=true;clipSelect.value='Welcome';clipSelect.querySelector('[value="Idle_Breath"]').disabled=true;clipSelect.querySelector('[value="Bow"]').disabled=true;pause.textContent='Vedi saluto';}
else{
 offline.hidden=true;scene=new THREE.Scene();scene.background=new THREE.Color('#0b101a');camera=new THREE.PerspectiveCamera(34,1,.1,100);camera.position.set(1.5,.7,8);
 scene.add(new THREE.HemisphereLight(0xe8d8f8,0x161b30,3));const key=new THREE.DirectionalLight(0xffe8df,3);key.position.set(3,5,5);scene.add(key);const rim=new THREE.PointLight(0xe27ba8,30,15);rim.position.set(-3,2,-2);scene.add(rim);
 controls=new OrbitControls(camera,canvas);controls.enableDamping=true;controls.target.set(0,0,0);controls.minDistance=4;controls.maxDistance=12;
 const gltf=await new GLTFLoader().loadAsync('/cinematic/kitsune-prototype.glb');const model=gltf.scene;const box=new THREE.Box3().setFromObject(model),center=box.getCenter(new THREE.Vector3());model.position.sub(center);scene.add(model);
 mixer=new THREE.AnimationMixer(model);gltf.animations.forEach(c=>actions.set(c.name,mixer.clipAction(c)));action=actions.get('Idle_Breath');action?.play();mode.textContent=renderer.backend?.isWebGPUBackend?'WEBGPU / MODIFICA VISTA LIBERA':'WEBGL 2 / MODIFICA VISTA LIBERA';
 for(let i=0;i<9;i++){const curve=tailCurve(i);const mesh=new THREE.Mesh(tailGeometry(curve,32,8),new THREE.MeshStandardMaterial({vertexColors:true,roughness:.8,metalness:.04}));mesh.position.y=-.3;scene.add(mesh);tails.push(mesh);}
 const resize=()=>{const w=stage.clientWidth,h=stage.clientHeight;renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix();};new ResizeObserver(resize).observe(stage);resize();await warmGpuAssets(renderer,scene,camera,scene);let last=performance.now();renderer.setAnimationLoop(now=>{const dt=Math.min((now-last)/1000,.05);last=now;if(!paused)mixer.update(dt);time+=dt;tails.forEach((t,i)=>t.rotation.z=Math.sin(time*.6+i)*.018);controls.update();renderer.render(scene,camera);});
}
document.querySelectorAll('[data-view]').forEach(b=>b.addEventListener('click',()=>{document.querySelectorAll('[data-view]').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));video.pause();video.hidden=true;if(renderer.staticFallback){offline.src=`/cinematic/prototype-${b.dataset.view}.webp`;offline.hidden=comparing;}else{const pos={front:[0,.5,8],'three-quarter':[4,1,7],back:[0,.5,-8]}[b.dataset.view];camera.position.set(...pos);controls.update();}}));
clipSelect.addEventListener('change',()=>{if(!mixer)return;const next=actions.get(clipSelect.value);if(next&&next!==action){next.reset().play();action?.crossFadeTo(next,.5,false);action=next;}});
pause.addEventListener('click',()=>{if(renderer.staticFallback){comparing=false;reference.hidden=true;offline.hidden=true;video.hidden=false;video.paused?video.play().catch(()=>{}):video.pause();pause.textContent=video.paused?'Riproduci':'Pausa';}else{paused=!paused;pause.textContent=paused?'Riprendi':'Pausa';pause.setAttribute('aria-pressed',String(paused));}});
document.getElementById('tail-slider').addEventListener('input',e=>{const count=+e.target.value;document.getElementById('tail-value').value=count;tails.forEach((tail,i)=>tail.visible=[4,3,5,2,6,1,7,0,8].indexOf(i)<count);});
document.getElementById('compare').addEventListener('click',e=>{comparing=!comparing;reference.hidden=!comparing;canvas.hidden=comparing||renderer.staticFallback;offline.hidden=comparing||!renderer.staticFallback;video.pause();video.hidden=true;e.target.textContent=comparing?'Mostra modello 3D':'Mostra riferimento';});
