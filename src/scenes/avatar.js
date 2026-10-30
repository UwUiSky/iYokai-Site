import * as THREE from 'three/webgpu';

import { tailCurve, tailGeometry, furTexture } from './tails.js';
export { tailGeometry } from './tails.js';
const ORDER = [0,1,2,3,4,5,6,7,8];

export function createAvatar(tier) {
  const group = new THREE.Group(), tailsRoot = new THREE.Group();
  group.add(tailsRoot);
  let imageReady;
  const textureReady = new Promise(resolve => { imageReady = resolve; });
  const texture = new THREE.TextureLoader().load('/cinematic/kitsune.webp', () => imageReady(true), undefined, () => imageReady(false));
  texture.colorSpace = THREE.SRGBColorSpace;
  const material = new THREE.MeshBasicMaterial({ map:texture, transparent:true, depthWrite:false, side:THREE.DoubleSide, toneMapped:false });
  const portrait = new THREE.Mesh(new THREE.PlaneGeometry(2.48, 3.72), material);
  portrait.position.set(0, 1.45, .12); portrait.renderOrder = 4; group.add(portrait);
  let model = null, mixer = null, head = null, currentAction = null;
  const actions = new Map();
  const modelReady = (async () => {
    try {
      const response = await fetch('/cinematic/avatar.json');
      if (!response.ok) return;
      const config = await response.json();
      const prototype = new URLSearchParams(location.search).get('avatar') === 'prototype';
      const modelPath = prototype ? config.prototype : config.model;
      if (!modelPath) return; // Artwork remains active until a reviewed model is supplied.
      const url = new URL(modelPath, location.origin);
      if (url.origin !== location.origin) throw new Error('Avatar models must be hosted with the site.');
      const { GLTFLoader } = await import('three/addons/loaders/GLTFLoader.js');
      const gltf = await new GLTFLoader().loadAsync(url.href);
      model = gltf.scene;
      const box = new THREE.Box3().setFromObject(model), size = box.getSize(new THREE.Vector3()), center = box.getCenter(new THREE.Vector3());
      if (!Number.isFinite(size.y) || size.y < .001) throw new Error('Invalid avatar bounds.');
      const scale = 3.72 / size.y;
      model.scale.setScalar(scale);
      model.position.set(-center.x * scale, -.41 - box.min.y * scale, -center.z * scale);
      model.rotation.y = config.rotationY || 0;
      group.add(model); portrait.visible = false;
      model.traverse((object) => { if (object.isBone && /(^|[:_])head$/i.test(object.name)) head = object; });
      mixer = new THREE.AnimationMixer(model);
      gltf.animations.forEach((clip) => actions.set(clip.name, mixer.clipAction(clip)));
      const idle = [...actions.entries()].find(([name]) => /idle|rest|breath/i.test(name)) || [...actions.entries()][0];
      if (idle) { currentAction = idle[1]; currentAction.play(); }
      mixer.addEventListener('finished', event => {
        if (event.action !== currentAction || currentAction.loop !== THREE.LoopOnce || !idle) return;
        const previous = currentAction;
        currentAction = idle[1]; currentAction.reset().setLoop(THREE.LoopRepeat, Infinity).play();
        previous.crossFadeTo(currentAction, .65, false);
      });
      document.documentElement.dataset.avatar = 'model';
    } catch (error) {
      model?.removeFromParent(); model = null; mixer = null; portrait.visible = true;
      console.warn('Avatar model could not be loaded; keeping the approved artwork.', error);
    }
  })();
  const ready = Promise.all([modelReady, textureReady]);
  const hemi = new THREE.HemisphereLight(0xe3d9f8, 0x202137, 2.2); group.add(hemi);
  const pinkLight = new THREE.PointLight(0xe6a4c7, 12, 8); pinkLight.position.set(-2, 2, 2); group.add(pinkLight);
  const coolLight = new THREE.PointLight(0xa1b5ef, 9, 8); coolLight.position.set(2, 3, 1); group.add(coolLight);
  let focusRank = -1;
  const fur = furTexture();
  const tails = Array.from({ length:9 }, (_, i) => {
    const curve = tailCurve(i);
    const mat = new THREE.MeshPhysicalMaterial({ vertexColors:true, map:fur, bumpMap:fur, bumpScale:.009, roughness:.93, metalness:0, sheen:1, sheenRoughness:.85, sheenColor:0xf1d9e5, transparent:true, opacity:0, depthWrite:false });
    const mesh = new THREE.Mesh(tailGeometry(curve, tier === 'low' ? 24 : 42, tier === 'low' ? 6 : 10), mat);
    mesh.position.set(0, .85, -.2 - i * .018); mesh.scale.setScalar(.001); tailsRoot.add(mesh);
    return { mesh, mat, grow:0, rank:ORDER.indexOf(i), phase:i * 1.7 };
  });
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  const gaze = { x:0, y:0 };
  return {
    group,
    portrait,
    showPortrait(show) { portrait.visible = show; },
    ready,
    play(name, once = false) {
      const next = actions.get(name);
      if (!next || next === currentAction) return false;
      next.reset(); next.setLoop(once ? THREE.LoopOnce : THREE.LoopRepeat, once ? 1 : Infinity);
      next.clampWhenFinished = once;
      next.play(); currentAction?.crossFadeTo(next, .6, false); currentAction = next; return true;
    },
    focus(rank) { focusRank = rank; },
    update(time, dt, pointer, count, opacity = 1) {
      const still = reduce.matches;
      const t = still ? 0 : time;
      if (mixer && !still) mixer.update(dt);
      const damping = 1 - Math.exp(-Math.min(dt, .1) * 4);
      gaze.x += ((still ? 0 : pointer.sx * .16) - gaze.x) * damping;
      gaze.y += ((still ? 0 : pointer.sy * .08) - gaze.y) * damping;
      if (head && !still) { head.rotation.y += gaze.x; head.rotation.x += gaze.y; }
      if (model) model.traverse((object) => { if (object.isMesh) {
        for (const mat of Array.isArray(object.material) ? object.material : [object.material]) {
          mat.transparent = true; mat.opacity = opacity;
        }
      } });
      material.opacity = opacity;
      portrait.position.y = 1.45 + (still ? 0 : Math.sin(t * .6) * .012);
      portrait.rotation.y = still ? 0 : pointer.sx * .035;
      tails.forEach((tail) => {
        const target = Math.min(1, Math.max(0, count - tail.rank));
        tail.grow += (target - tail.grow) * (still ? 1 : Math.min(1, dt * 3));
        tail.mesh.scale.setScalar(1);
        tail.mesh.visible = tail.grow > .01 && opacity > .01;
        tail.mesh.rotation.z = still ? 0 : Math.sin(t * .65 + tail.phase) * .045 + pointer.sx * .018;
        tail.mesh.position.x = still ? 0 : Math.sin(t * .38 + tail.phase) * .025;
        tail.mesh.rotation.y = still ? 0 : Math.cos(t * .4 + tail.phase) * .045;
        tail.mat.opacity = opacity * tail.grow;
        tail.mat.emissiveIntensity = focusRank === tail.rank ? .8 : .2;
      });

    },
  };
}
