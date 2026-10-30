import './style.css';
import './cinematic.css';
import { initI18n, t } from './i18n/index.js';
import '@fontsource-variable/syne';
import '@fontsource-variable/manrope';
import '@fontsource/jetbrains-mono/400.css';
import '@fontsource/jetbrains-mono/500.css';
import * as THREE from 'three/webgpu';
import Lenis from 'lenis';
import gsap from 'gsap';
import { loadPrefs, applyPrefs } from './core/prefs.js';
import { detectTier } from './core/quality.js';
import { createRenderer } from './core/renderer.js';
import { createMark } from './scenes/mark.js';
import { createEntry } from './scenes/entry.js';
import { createAvatar } from './scenes/avatar.js';
import { composition } from './scenes/composition.js';
import { fallbackTailMarkup } from './scenes/tails.js';
import { createPetals, staticPetals } from './scenes/petals.js';
import { createStreet } from './scenes/street.js';
import { initTerminal } from './ui/terminal.js';
import { initHub } from './ui/hub.js';
import { initPlayer } from './ui/player.js';
import { initYokai } from './ui/yokai.js';
import { initPanel } from './ui/panel.js';
import { initCommands } from './ui/commands.js';
import { initInvite } from './ui/invite.js';
import { initSystem } from './ui/system.js';
import { initStatus } from './ui/status.js';
import { createAdaptive } from './core/adaptive.js';
import { initSheet } from './ui/sheet.js';
import { initPrefsPanel } from './ui/prefsPanel.js';
import { initCinematic } from './ui/cinematic.js';
import { tear } from './core/audio.js';
import { startAssetPipeline, preloadCinematicAssets, preloadImage, warmGpuAssets } from './core/preload.js';

startAssetPipeline();
preloadCinematicAssets({ prototype:new URLSearchParams(location.search).get('avatar') === 'prototype' });

const prefs = loadPrefs();
applyPrefs(prefs);
await initI18n(prefs.lang);
const quality = detectTier();
const root = document.documentElement;
const renderer = await createRenderer(document.getElementById('gl'), quality);
root.dataset.backend = renderer.backend?.isWebGPUBackend ? 'webgpu' : renderer.staticFallback ? 'static' : 'webgl2';
root.dataset.tier = quality.tier;
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(40, innerWidth / innerHeight, .1, 50);
camera.position.z = 6;
const mark = createMark(prefs.accent); scene.add(mark.group);
mark.group.scale.setScalar(.5);
const street = createStreet(scene, quality.tier);
const prototype = new URLSearchParams(location.search).get('avatar') === 'prototype';
const petals = createPetals(scene, quality.tier); staticPetals();
const kit = createAvatar(quality.tier); scene.add(kit.group); kit.group.visible = false;
const entry = createEntry(scene, camera, quality.particles);
const adapt = createAdaptive(renderer, quality, { onLowest: () => street.lite() });
const hub = initHub();
initPlayer(); initSheet(); initStatus(); initSystem(); initInvite(); initYokai(); initCommands(); initPanel();
gsap.globalTimeline.timeScale(prefs.speed);
initPrefsPanel({ prefs, onChange(k) { if (k === 'accent') mark.setAccent(prefs.accent); if (k === 'speed') gsap.globalTimeline.timeScale(prefs.speed); } });
// Preferences remain reachable while the product hub is closed.
document.body.append(document.getElementById('gear'), document.getElementById('prefs'));
const hubEl = document.getElementById('hub'), dcEl = document.getElementById('dc'), dcState = document.getElementById('dcstate');
hubEl.classList.add('cinematic-quick');
const quickClose = document.createElement('button'); quickClose.className = 'quick-close'; quickClose.textContent = '×'; quickClose.setAttribute('aria-label', t('sheet.close')); hubEl.append(quickClose);
const reduced = matchMedia('(prefers-reduced-motion: reduce)');
const lenis = new Lenis({ lerp:.08, smoothWheel:!reduced.matches, virtualScroll:() => root.dataset.stage !== 'cinema' });
gsap.ticker.add((time) => lenis.raf(time * 1000)); gsap.ticker.lagSmoothing(0);
const fx = { markScale:1, mark:.12, avatar:0 };
const pointer = { x:0, y:0, sx:0, sy:0 };
let mode = 'terminal', dcP = 0, returnScroll = 0;
const cinema = initCinematic({ lenis, prefs, onDiscord:enterDiscord, onQuick:openQuick });
function playGesture(name) {
  if (reduced.matches) return;
  kit.ready.then(() => {
    if (!kit.play(name, true)) return;
  });
}
document.addEventListener('realm:chapter', (e) => { if (mode === 'cinema' && e.detail.index === 3) playGesture('Welcome'); });
const fallback = document.createElement('img'); fallback.id = 'avatar-fallback'; fallback.src = new URLSearchParams(location.search).get('avatar') === 'prototype' ? '/cinematic/prototype-cutout.webp' : '/cinematic/kitsune.webp'; fallback.alt = ''; if (prototype) root.dataset.avatarPreview = 'prototype'; fallback.setAttribute('aria-hidden','true'); document.body.append(fallback);
const fallbackTails = document.createElement('div'); fallbackTails.id = 'fallback-tails'; fallbackTails.setAttribute('aria-hidden', 'true');
fallbackTails.innerHTML = fallbackTailMarkup();
fallback.before(fallbackTails);
const fallbackTailParts = [...fallbackTails.querySelectorAll('[data-tail]')];
const pose = { x:.76, height:.82, bottom:.035, z:0 };
function fit() {
  if (mode === 'discord') return;
  const c = composition(cinema.state.chapter, innerWidth, innerHeight);
  gsap.to(pose, { x:c.x, height:c.height, bottom:c.bottom, z:c.z, duration:reduced.matches ? 0 : .95, overwrite:true });
}
function placeAvatar() {
  const h = 2 * (camera.position.z - pose.z) * Math.tan(camera.fov * Math.PI / 360), w = h * camera.aspect;
  const scale = pose.height * h / 3.72;
  kit.group.scale.setScalar(scale);
  kit.group.position.set((pose.x - .5)*w, (-.5 + pose.bottom)*h + .41*scale, pose.z);
  fallback.style.height = `${pose.height * 100}dvh`;
  fallback.style.left = `${pose.x * 100}%`; fallback.style.bottom = `${pose.bottom * 100}dvh`;
  fallbackTails.style.height = `${pose.height * 100}dvh`;
  fallbackTails.style.left = `${pose.x * 100}%`; fallbackTails.style.bottom = `${pose.bottom * 100}dvh`;
}
document.addEventListener('realm:chapter', fit);
fit();
kit.ready.then(async () => {
  if (!prototype) kit.showPortrait(false);
  await warmGpuAssets(renderer, kit.group, camera, scene);
  if (!navigator.connection?.saveData) await warmGpuAssets(renderer, street.group, camera, scene);
});
const term = initTerminal({
  onEnter({ rect, auto }) {
    mode = 'transition';
    if (prefs.sound && !auto) tear(.15);
    mark.group.visible = false;
    root.dataset.stage = 'transition';
    entry.play({ rect, scale:reduced.matches ? .15 : 1, onReveal() {
      term.hide(); mode = 'cinema'; kit.group.visible = true; cinema.show(); fit();
      gsap.to(fx, { avatar:1, duration:reduced.matches ? 0 : 1.8, ease:'power2.out' });
      playGesture('Welcome');
      document.dispatchEvent(new CustomEvent('realm:entered'));
      requestAnimationFrame(() => {
        lenis.resize();
        const target = location.hash && document.getElementById(location.hash.slice(1));
        if (target && document.getElementById('cinematic').contains(target)) cinema.navigate(location.hash, true);
      });
    } });
  },
});
function openQuick() {
  if (mode !== 'cinema') return;
  cinema.quick(true); hub.show(reduced.matches ? 0 : .6); quickClose.focus();
}
function closeQuick() { hubEl.hidden = true; cinema.quick(false); }
quickClose.addEventListener('click', closeQuick);
addEventListener('keydown', (e) => { if (e.key === 'Escape' && !hubEl.hidden) closeQuick(); });
function enterDiscord(rect) {
  if (mode !== 'cinema') return;
  returnScroll = scrollY; mode = 'transition';
  if (!hubEl.hidden) closeQuick();
  cinema.hide(); root.dataset.stage = 'transition';
  gsap.to(fx, { avatar:0, duration:reduced.matches ? 0 : .4 });
  preloadImage('/cinematic/city.webp').then(() => entry.play({ rect, scale:reduced.matches ? .15 : 1, onReveal() {
    street.group.visible = true; scene.fog = new THREE.FogExp2(0x080a15, .045);
    dcEl.hidden = false; root.dataset.stage = 'discord'; mode = 'discord'; dcP = 0;
    document.getElementById('city').style.opacity = 1;
    document.getElementById('city').style.backgroundImage = 'url("/cinematic/city.webp")';
    document.getElementById('theater').style.opacity = 0;
    document.querySelector('.world-shade').style.opacity = 0;
    kit.group.position.set(.9, -.15, 0); kit.group.scale.setScalar(.85);
    const dcPose = composition(1, innerWidth, innerHeight);
    fallback.style.height = `${dcPose.height*100}dvh`; fallback.style.left = `${dcPose.x*100}%`; fallback.style.bottom = `${dcPose.bottom*100}dvh`;
    fallbackTails.style.height = fallback.style.height; fallbackTails.style.left = fallback.style.left; fallbackTails.style.bottom = fallback.style.bottom;
    camera.position.set(0, 1, 7); camera.lookAt(.6, 1.1, 0);
    lenis.scrollTo(0, { immediate:true });
    gsap.to(fx, { avatar:1, duration:reduced.matches ? 0 : .8 });
    requestAnimationFrame(() => lenis.resize());
  } }));
}
function leaveDiscord() {
  if (mode !== 'discord') return;
  mode = 'transition';
  gsap.to(dcEl, { opacity:0, duration:reduced.matches ? 0 : .5, onComplete() {
    dcEl.hidden = true; dcEl.style.opacity = '';
    street.group.visible = false; scene.fog = null;
    camera.position.set(0, 0, 6); camera.lookAt(0, 0, 0); camera.fov = 40; camera.updateProjectionMatrix();
    mode = 'cinema'; dcP = 0; fit(); cinema.show(); lenis.resize(); cinema.navigate(location.hash || '#origine', true);
    playGesture('Bow');
  } });
}
hubEl.addEventListener('click', (e) => { const a = e.target.closest('a[href="#discord"]'); if (a) { e.preventDefault(); enterDiscord(a.getBoundingClientRect()); } });
document.getElementById('dcback').addEventListener('click', leaveDiscord);
document.addEventListener('tail:focus', (e) => kit.focus(e.detail));
document.addEventListener('i18n:change', () => { dcState.dataset.n = ''; });
dcEl.addEventListener('click', (e) => {
  const a = e.target.closest('a[href^="#"]'), hash = a?.getAttribute('href');
  if (!hash || hash === '#') return;
  const target = document.getElementById(hash.slice(1));
  if (target) { e.preventDefault(); lenis.scrollTo(target, { immediate:reduced.matches }); }
});
const io = new IntersectionObserver((entries) => entries.forEach((x) => x.target.classList.toggle('in', x.isIntersecting)), { threshold:.15 });
const watch = () => document.querySelectorAll('.rv').forEach((el) => io.observe(el));
watch(); document.addEventListener('rv:refresh', watch);
addEventListener('pointermove', (e) => { pointer.x = e.clientX / innerWidth * 2 - 1; pointer.y = e.clientY / innerHeight * 2 - 1; }, { passive:true });
addEventListener('pointerleave', () => { pointer.x = pointer.y = 0; });
addEventListener('resize', () => { renderer.setSize(innerWidth, innerHeight, false); camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix(); fit(); });
lenis.on('scroll', () => {
  const max = document.documentElement.scrollHeight - innerHeight;
  dcP = mode === 'discord' && max > 0 ? Math.min(1, scrollY / max) : 0;
  dcEl.style.setProperty('--sp', dcP.toFixed(3));
});
let last = performance.now();
renderer.setAnimationLoop((now) => {
  const dt = Math.min((now - last) / 1000, .08); last = now;
  if (document.hidden) return;
  const k = 1 - Math.exp(-dt * 4 * prefs.speed);
  pointer.sx += ((reduced.matches ? 0 : pointer.x) - pointer.sx) * k;
  pointer.sy += ((reduced.matches ? 0 : pointer.y) - pointer.sy) * k;
  adapt.tick(dt); petals.update(now/1000, reduced.matches, ['cinema','discord'].includes(mode)); entry.update(now / 1000);
  if (mode === 'terminal') mark.update(now / 1000, pointer, fx);
  if (mode === 'cinema') {
    cinema.update(pointer);
    placeAvatar();
    kit.update(now / 1000, dt, pointer, cinema.state.tails, fx.avatar * (1 - cinema.state.dim * .94));
    if (!reduced.matches) {
      camera.position.x = pointer.sx * .035 + Math.sin(cinema.state.progress * Math.PI * 2) * .08;
      camera.position.y = pointer.sy * -.025;
      camera.position.z = 6;
    }
    fallback.style.opacity = fx.avatar * (1 - cinema.state.dim * .94);
    fallbackTails.style.opacity = fallback.style.opacity;
    fallbackTailParts.forEach(part => { part.style.opacity = Number(part.dataset.tail) < cinema.state.tails ? '1' : '0'; });
  }
  if (mode === 'discord') {
    const e = dcP * dcP * (3 - 2 * dcP), angle = reduced.matches ? 0 : -.12 + .24 * e;
    camera.position.set(Math.sin(angle) * 7 + pointer.sx * .12, 1 - pointer.sy * .05, Math.cos(angle) * (7 - .6 * e));
    camera.lookAt(.6, 1.1, 0); camera.fov = 42 - 3 * e; camera.updateProjectionMatrix();
    street.update(reduced.matches ? 0 : now / 1000, dt); kit.update(now / 1000, dt, pointer, 1 + dcP * 8, fx.avatar);
    fallback.style.opacity = fx.avatar;
    fallbackTails.style.opacity = fx.avatar;
    fallbackTailParts.forEach(part => { part.style.opacity = Number(part.dataset.tail) < Math.min(4, 1 + dcP*4) ? '1' : '0'; });
    const n = Math.min(9, Math.floor(1 + dcP * 8));
    if (dcState.dataset.n != n) { dcState.dataset.n = n; dcState.textContent = t('dc.tails', { n }); }
  }
  renderer.render(scene, camera);
});
