import { decorateLanguageSelect } from '../i18n/index.js';
import { currentRoute } from '../core/navigation.js';
import gsap from 'gsap';
import template from './cinematic.html?raw';
import { LANGS, apply, t, lang, setLang } from '../i18n/index.js';
import { preloadImage } from '../core/preload.js';
import { createPanelNavigation } from '../core/panels.js';
import { createStillScenes } from './still-scenes.js';
import { STILL_ART } from '../data/artworks.js';
import { composition } from '../scenes/composition.js';
import { savePrefs } from '../core/prefs.js';
import { initSpotify } from './spotify.js';
import { applyHarukazeFallbacks, harukazeNodes } from './harukaze.js';

const CLAMP = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const scenes = ['IL SANTUARIO', 'NEON DISTRICT', 'SOUND OF YŌKAI', 'CREATOR WORLD', 'NOVE MONDI', 'LA STORIA', 'OLTRE LA SOGLIA'];
const DETAILS = {
  music: ['MUSIC / 04', 'La voce di iYokai.', 'Italiano, patois e giapponese si incontrano in un’identità musicale che attraversa generi e confini.', ['Il player riproduce le tracce del catalogo quando disponibili.', 'Nessun autoplay: scegli tu quando ascoltare.', 'I canali ufficiali saranno collegati appena configurati.']],
  ai: ['AI & TOOLS / 07', 'Nuove possibilità.', 'Uno spazio per gli strumenti e le sperimentazioni che estenderanno l’ecosistema.', ['Area in progettazione.', 'Le integrazioni saranno presentate quando disponibili.']],
  dev: ['API & DEV / 09', 'Lo spirito del codice.', 'Un progetto che cresce attraverso sviluppo, sperimentazione e strumenti modulari.', ['Frontend Three.js, WebGPU e WebGL 2.', 'Backend Python per pannello e integrazioni Discord.', 'Segui il codice e gli aggiornamenti su GitHub.']],
};

export function initCinematic({ lenis, prefs, onDiscord, onQuick }) {
  const host = document.createElement('div');
  host.id = 'cinematic'; host.hidden = true; host.innerHTML = template;
  document.body.append(host);
  // The environment belongs below the existing renderer, not over its transparent canvas.
  document.body.prepend(host.querySelector('#world'));
  apply(host);
  host.querySelectorAll('.chapter h2').forEach(heading=>{
    const lines=[[]];[...heading.childNodes].forEach(node=>{if(node.nodeName==='BR'){node.remove();lines.push([]);}else lines.at(-1).push(node);});
    heading.replaceChildren(...lines.map(nodes=>{const line=document.createElement('span');line.className='heading-line';line.append(...nodes);return line;}));
  });
  const fitHeadings=()=>{ applyHarukazeFallbacks(host); host.querySelectorAll('.chapter h2').forEach(heading=>{
    heading.style.fontSize='';const base=parseFloat(getComputedStyle(heading).fontSize),width=heading.clientWidth;
    const widest=Math.max(...[...heading.children].map(line=>line.scrollWidth));
    if(width&&widest>width)heading.style.fontSize=`${base*width/widest*.985}px`;
  }); };
  document.fonts.ready.then(fitHeadings);document.fonts.addEventListener('loadingdone',fitHeadings);addEventListener('resize',fitHeadings);document.addEventListener('i18n:change',fitHeadings);
  const player = document.getElementById('player');
  player.classList.add('cinematic-player'); host.querySelector('#cinema-player-slot').append(player);
  const menu = host.querySelector('#cinema-menu'), toggle = host.querySelector('#menu-toggle');
  const detail = host.querySelector('#module-dialog');
  const sections = [...host.querySelectorAll('[data-scene]')];
  const rail = [...host.querySelectorAll('.chapter-rail a')];
  const world = document.getElementById('world');
  const shrine = document.getElementById('shrine'), city = document.getElementById('city'), theater = document.getElementById('theater');
  const shade = world.querySelector('.world-shade');
  const state = { progress: 0, chapter: 0, tails: 1, dim: 0, city: 0, theater:0, active: false, quick: false };
  const still = document.documentElement.dataset.artwork === 'static';
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const stillScenes = still ? createStillScenes(world) : null;
  let ambient;

  function selectChapter(i, { immediate = false, direction = 1 } = {}) {
    state.chapter = i; state.tails = composition(i, innerWidth, innerHeight).tails;
    rail.forEach((a, n) => { a.classList.toggle('active', i === n); if (i === n) a.setAttribute('aria-current','step'); else a.removeAttribute('aria-current'); });
    sections.forEach((s, n) => { s.inert = n !== i; s.classList.toggle('is-active', n === i); });
    document.documentElement.dataset.chapter = i;
    document.dispatchEvent(new CustomEvent('realm:chapter', { detail:{ index:i } }));
    host.querySelector('#scene-name').textContent = t(`cinema.scene.${i}`);
    const name = still && i === 2 ? 'music' : composition(i, innerWidth, innerHeight).background;
    const onTheaterLayer = name === 'theater' || name === 'music';
    const background = name === 'city' ? city : onTheaterLayer ? theater : shrine;
    document.documentElement.dataset.environment = name;
    const url = still ? STILL_ART[name] : `/cinematic/${name}.webp`;
    preloadImage(url).then(ok => {
      if (!ok || state.chapter !== i) return;
      if (still) stillScenes.show(url, { immediate:immediate || reduced.matches, direction });
      else background.style.backgroundImage = `url("${url}")`;
      gsap.to(state, { city:name === 'city' ? 1 : 0, theater:onTheaterLayer ? 1 : 0, dim:i === 4 ? .45 : i === 6 ? .4 : i === 5 ? .12 : 0, duration:immediate || reduced.matches ? 0 : .9, overwrite:'auto' });
    });
    const copy = sections[i].querySelector('.chapter-copy, .ecosystem-content, .final-content');
    gsap.killTweensOf(copy);
    if (immediate || reduced.matches) gsap.set(copy, { y:0, opacity:1 });
    else gsap.fromTo(copy, { y:22 * (direction || 1), opacity:.2 }, { y:0, opacity:1, duration:.7, delay:.15, overwrite:true });
  }
  const panels = createPanelNavigation({ sections, lenis, reduced, onSelect:selectChapter,
    enabled:() => state.active && !state.quick && !document.querySelector('dialog[open]') && !document.querySelector('.sheet:not([hidden]), .sys:not([hidden])') });
  function navigate(hash, immediate = false) {
    const index = sections.findIndex(section => `#${section.id}` === hash);
    if (index >= 0) panels.go(index, { immediate });
  }
  const language = host.querySelector('#cinema-language');
  language.replaceChildren(...LANGS.map(l => { const o = document.createElement('option'); o.value = l.code; o.textContent = l.code.toUpperCase(); o.label = `${l.badge} · ${l.name}`; return o; }));
  language.value = lang();
  decorateLanguageSelect(language);
  language.addEventListener('change', async () => { await setLang(language.value); prefs.lang = lang(); savePrefs(prefs); });
  initSpotify(host.querySelector('#spotify-slot'));
  host.addEventListener('click', (e) => {
    const close = e.target.closest('[data-close]');
    if (close) { document.getElementById(close.dataset.close)?.close(); return; }
    const link = e.target.closest('a[href^="#"]');
    if (link && host.querySelector(link.getAttribute('href'))) {
      e.preventDefault(); if (menu.open) menu.close(); navigate(link.getAttribute('href')); return;
    }
    const button = e.target.closest('[data-module]');
    if (!button) return;
    const key = button.dataset.module;
    if (key === 'bot' || key === 'security') return onDiscord(button.getBoundingClientRect());
    if (key === 'community' || key === 'creator' || key === 'live') {
      document.dispatchEvent(new CustomEvent('realm:portal', { detail: { key: key === 'community' ? '#community' : '#social', from: button } })); return;
    }
    if (key === 'panel') {
      const a = document.createElement('a'); a.href = '#panel'; a.hidden = true; document.body.append(a); a.click(); a.remove(); return;
    }
    const d = DETAILS[key]; if (!d) return;
    host.querySelector('#module-eyebrow').textContent = t(`cinema.detail.${key}.eyebrow`);
    const moduleTitle = host.querySelector('#module-title');
    moduleTitle.setAttribute('aria-label',t(`cinema.detail.${key}.title`));
    moduleTitle.replaceChildren(...harukazeNodes(t(`cinema.detail.${key}.title`)));
    host.querySelector('#module-description').textContent = t(`cinema.detail.${key}.body`);
    const facts = host.querySelector('#module-details'); facts.className = 'module-facts'; facts.replaceChildren();
    d[3].forEach((_, i) => { const p = document.createElement('p'); p.textContent = t(`cinema.detail.${key}.fact.${i}`); facts.append(p); });
    const links = host.querySelector('#module-links'); links.className = 'module-links'; links.replaceChildren();
    if (key === 'dev') { const a = document.createElement('a'); a.href = 'https://github.com/UwUiSky/iYokai-Site'; a.target = '_blank'; a.rel = 'noopener noreferrer'; a.className = 'text-link'; a.textContent = 'GitHub ↗'; links.append(a); }
    if (key === 'music') { const b = document.createElement('button'); b.className = 'text-link'; b.textContent = t('cinema.go-player'); b.onclick = () => { detail.close(); navigate('#musica'); document.getElementById('ppl').focus({ preventScroll: true }); }; links.append(b); }
    detail.showModal();
  });
  toggle.addEventListener('click', () => menu.showModal());
  menu.addEventListener('close', () => { toggle.setAttribute('aria-expanded', 'false'); lenis.start(); });
  const modalObserver = new MutationObserver(() => {
    toggle.setAttribute('aria-expanded', String(menu.open));
    if (menu.open || detail.open) lenis.stop(); else if (!state.quick) lenis.start();
  });
  modalObserver.observe(menu, { attributes:true, attributeFilter:['open'] });
  modalObserver.observe(detail, { attributes:true, attributeFilter:['open'] });
  [menu, detail].forEach((d) => d.addEventListener('click', (e) => { if (e.target === d) { const r = d.getBoundingClientRect(); if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) d.close(); } }));
  host.querySelector('#quick-access').addEventListener('click', onQuick);
  host.querySelector('#replay').addEventListener('click', () => navigate('#origine'));
  const sound = host.querySelector('#cinema-sound');
  sound.addEventListener('click', async () => {
    try {
      if (!ambient) {
        const Audio = window.AudioContext || window.webkitAudioContext;
        if (!Audio) return;
        const ctx = new Audio(), gain = ctx.createGain(); gain.gain.value = 0; gain.connect(ctx.destination);
        [110, 164.81, 220.3].forEach((hz) => { const osc = ctx.createOscillator(), g = ctx.createGain(); osc.type = 'sine'; osc.frequency.value = hz; g.gain.value = .07; osc.connect(g).connect(gain); osc.start(); });
        ambient = { ctx, gain, on:false };
      }
      await ambient.ctx.resume(); ambient.on = !ambient.on;
      ambient.gain.gain.setTargetAtTime(ambient.on ? .22 : 0, ambient.ctx.currentTime, .8);
      sound.setAttribute('aria-pressed', String(ambient.on)); sound.setAttribute('aria-label', t(ambient.on ? 'cinema.sound-off' : 'cinema.sound-on'));
    } catch { sound.setAttribute('aria-pressed', 'false'); }
  });
  document.addEventListener('visibilitychange', () => { if (ambient) document.hidden ? ambient.ctx.suspend() : ambient.on && ambient.ctx.resume(); });
  addEventListener('popstate', () => { if (state.active && sections.some(s=>`#${s.id}` === (currentRoute() || '#origine'))) navigate(currentRoute() || '#origine', true); });
  document.addEventListener('i18n:change', () => { language.value = lang(); host.querySelector('#scene-name').textContent = t(`cinema.scene.${state.chapter}`); });
  return {
    state,
    show() { state.active = true; host.hidden = false; host.inert = false; rootStage('cinema'); requestAnimationFrame(() => { fitHeadings(); lenis.resize(); navigate(sections.some(s => `#${s.id}` === currentRoute()) ? currentRoute() : `#${sections[state.chapter].id}`, true); }); },
    navigate,
    hide() { state.active = false; host.hidden = true; },
    quick(open) { state.quick = open; host.inert = open; open ? lenis.stop() : lenis.start(); },
    update(pointer) {
      if (!state.active) return;
      const total = Math.max(1, document.documentElement.scrollHeight - innerHeight);
      state.progress = CLAMP(scrollY / total);
      host.querySelector('#scroll-progress').style.transform = `scaleX(${state.progress})`;
      const count = Math.min(9, Math.max(1, Math.floor(state.tails)));
      host.querySelector('#tail-count').textContent = still ? t('cinema.still-frame',{n:String(state.chapter+1).padStart(2,'0')}) : t('cinema.tails',{n:String(count).padStart(2,'0')});
      city.style.opacity = state.city;
      theater.style.opacity = state.theater;
      shade.style.opacity = state.dim;
      if (!still && !reduced.matches) {
        const transform = `translate3d(${pointer.sx * -3}px,${pointer.sy * -2}px,0)`;
        shrine.style.transform = city.style.transform = theater.style.transform = transform;
      }
    },
  };
}
function rootStage(stage) { document.documentElement.dataset.stage = stage; }
