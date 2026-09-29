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
import { createStreet } from './scenes/street.js';
import { createKitsune } from './scenes/kitsune.js';

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
const street = createStreet(scene, quality.tier), kit = createKitsune(quality.tier);
kit.group.visible = false; scene.add(kit.group);
const dcEl = document.getElementById('dc'), hubEl = document.getElementById('hub'), dcState = document.getElementById('dcstate');
let mode = 'hub', dcP = 0;

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
addEventListener('pointerdown', (e) => { pointer.x = (e.clientX / innerWidth) * 2 - 1; pointer.y = (e.clientY / innerHeight) * 2 - 1; }, { passive: true }); // il tocco fa girare lo sguardo
addEventListener('resize', () => {
  renderer.setSize(innerWidth, innerHeight, false);
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  fit();
});

lenis.on('scroll', () => { const max = document.documentElement.scrollHeight - innerHeight; dcP = mode === 'discord' && max > 0 ? Math.min(1, scrollY / max) : 0; dcEl.style.setProperty('--sp', dcP.toFixed(3)); });
const io = new IntersectionObserver((es) => es.forEach((x) => x.target.classList.toggle('in', x.isIntersecting)), { threshold: 0.15 });
document.querySelectorAll('.rv').forEach((el) => io.observe(el));
function enterDiscord(rect) {
  if (mode !== 'hub') return; mode = 'busy';
  if (prefs.sound) tear();
  gsap.to(hubEl, { opacity: 0, duration: 0.6, ease: 'power2.in' });
  gsap.to(orb.group.scale, { x: 0.001, y: 0.001, z: 0.001, duration: 1.1, ease: 'power3.in' });
  gsap.to(fx, { markScale: 0, duration: 1, ease: 'power3.in' });
  entry.play({ rect, scale: 1, onReveal() {
    orb.group.visible = mark.group.visible = false; hubEl.hidden = true; hubEl.style.opacity = 1;
    street.group.visible = kit.group.visible = true; scene.fog = new THREE.FogExp2(0x07040d, 0.075); entry.dim(0.3);
    dcEl.hidden = false; root.dataset.stage = 'discord'; mode = 'discord'; lenis.scrollTo(0, { immediate: true }); requestAnimationFrame(() => lenis.resize());
  } });
}
function leaveDiscord() {
  if (mode !== 'discord') return; mode = 'busy';
  gsap.to(dcEl, { opacity: 0, duration: 0.5, onComplete() {
    dcEl.hidden = true; dcEl.style.opacity = 1; street.group.visible = kit.group.visible = false; scene.fog = null;
    camera.position.set(0, 0, 6); camera.lookAt(0, 0, 0); camera.fov = 40; camera.updateProjectionMatrix();
    mark.group.visible = true; fx.markScale = 1; entry.dim(1); orb.show(); hubEl.hidden = false; gsap.fromTo(hubEl, { opacity: 0 }, { opacity: 1, duration: 0.8 });
    root.dataset.stage = 'hub'; mode = 'hub'; dcP = 0; lenis.scrollTo(0, { immediate: true });
  } });
}
hubEl.addEventListener('click', (e) => { const a = e.target.closest('a[href="#discord"]'); if (a) { e.preventDefault(); enterDiscord(a.getBoundingClientRect()); } });
document.getElementById('dcback').addEventListener('click', leaveDiscord);

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
  if (mode === 'discord') {
    const e = dcP * dcP * (3 - 2 * dcP), ang = -0.35 + 0.8 * e, rad = 7.4 - 2.6 * e, tails = 3 + dcP * 4;
    camera.position.set(Math.sin(ang) * rad + pointer.sx * 0.25, 1.15 - 0.15 * e - pointer.sy * 0.1, Math.cos(ang) * rad);
    camera.lookAt(0, 0.95, 0); camera.fov = 42 - 8 * e; camera.updateProjectionMatrix();
    street.update(now / 1000, dt); kit.update(now / 1000, dt, pointer, tails);
    const n = Math.min(7, Math.round(tails)); if (dcState.dataset.n != n) { dcState.dataset.n = n; dcState.textContent = `code ${n}/7`; }
  }
  renderer.render(scene, camera);
});
