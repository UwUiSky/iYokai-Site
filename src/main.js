import './style.css';
import * as THREE from 'three/webgpu';
import Lenis from 'lenis';
import gsap from 'gsap';
import { loadPrefs, applyPrefs } from './core/prefs.js';
import { detectTier } from './core/quality.js';
import { createRenderer } from './core/renderer.js';
import { createMark } from './scenes/mark.js';

const prefs = loadPrefs();
applyPrefs(prefs);
const quality = detectTier();
const renderer = await createRenderer(document.getElementById('gl'), quality);
const root = document.documentElement;
root.dataset.backend = renderer.backend?.isWebGPUBackend ? 'webgpu' : 'webgl2';
root.dataset.tier = quality.tier;

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(40, innerWidth / innerHeight, 0.1, 50);
camera.position.z = 6;
const mark = createMark(prefs.accent);
scene.add(mark.group);
const fit = () => mark.group.scale.setScalar(Math.min(1, camera.aspect * 1.1)); // il simbolo resta intero anche in verticale
fit();

const lenis = new Lenis({ lerp: 0.08 });
gsap.ticker.add((t) => lenis.raf(t * 1000));
gsap.ticker.lagSmoothing(0);

const pointer = { x: 0, y: 0, sx: 0, sy: 0 };
addEventListener('pointermove', (e) => {
  pointer.x = (e.clientX / innerWidth) * 2 - 1;
  pointer.y = (e.clientY / innerHeight) * 2 - 1;
}, { passive: true });
addEventListener('resize', () => {
  renderer.setSize(innerWidth, innerHeight, false);
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  fit();
});

let last = performance.now();
renderer.setAnimationLoop((now) => {
  const dt = Math.min((now - last) / 1000, 0.05);
  last = now;
  const k = 1 - Math.exp(-dt * 4 * prefs.speed); // smorzamento forte
  pointer.sx += (pointer.x - pointer.sx) * k;
  pointer.sy += (pointer.y - pointer.sy) * k;
  mark.update(now / 1000, pointer);
  renderer.render(scene, camera);
});
