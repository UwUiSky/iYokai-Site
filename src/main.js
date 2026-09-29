import './style.css';
import '@fontsource-variable/syne';
import '@fontsource-variable/manrope';
import * as THREE from 'three/webgpu';
import Lenis from 'lenis';
import gsap from 'gsap';
import { loadPrefs, applyPrefs } from './core/prefs.js';
import { detectTier } from './core/quality.js';
import { createRenderer } from './core/renderer.js';
import { createMark } from './scenes/mark.js';
import { createEntry } from './scenes/entry.js';
import { initTerminal } from './ui/terminal.js';
import { tear } from './core/audio.js';
import { createOrb } from './scenes/orb.js';
import { initHub } from './ui/hub.js';
import { initPlayer } from './ui/player.js';

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
const orb = createOrb(scene);
const layout = { mark: 1 };
const fit = () => { // il simbolo resta intero anche in verticale; l'orbe sale su schermi stretti
  const narrow = camera.aspect < 0.8;
  mark.group.scale.setScalar(Math.min(1, camera.aspect * 1.1) * layout.mark);
  orb.group.position.y = mark.group.position.y = narrow ? 0.9 : -0.3;
  orb.base = narrow ? 0.36 : 0.82;
};
fit();
const hub = initHub();
initPlayer();

const fx = { markScale: 1, mark: 0.3 };
const entry = createEntry(scene, camera, quality.particles);
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const term = initTerminal({
  onEnter({ rect }) {
    if (prefs.sound) tear();
    const s = reduced ? 0.35 : 1;
    gsap.timeline()
      .to(fx, { mark: 1, duration: 0.12 * s }, 0) // i tre tagli lampeggiano
      .to(fx, { markScale: 0, mark: 0, duration: 1.4 * s, ease: 'power3.in' }, 0.25 * s)
      .to(fx, { markScale: 1, mark: 0.9, duration: 1.6 * s, ease: 'power2.out' }, 2.6 * s);
    entry.play({ rect, scale: s, onReveal() { root.dataset.stage = 'hub'; term.hide(); hub.show(s); orb.show(); gsap.to(layout, { mark: 0.3, duration: 1.4 * s, ease: 'power3.inOut', onUpdate: fit }); document.dispatchEvent(new CustomEvent('realm:entered')); } });
  },
});

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
  mark.update(now / 1000, pointer, fx);
  entry.update(now / 1000);
  orb.update(now / 1000, pointer);
  hub.update(pointer);
  renderer.render(scene, camera);
});
