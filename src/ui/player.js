// Player: legge public/audio/tracks.json ([{ title, artist?, src }]); vuoto = stato "in arrivo". Nessun autoplay: parte solo da un tocco.
import { t } from '../i18n/index.js';
const ICON = { play: '<path d="M8 5v14l11-7z"/>', pause: '<path d="M7 5h4v14H7zM13 5h4v14h-4z"/>', prev: '<path d="M6 5h2v14H6zM20 5v14L9 12z"/>', next: '<path d="M16 5h2v14h-2zM4 5v14l11-7z"/>' };
const svg = (k) => `<svg viewBox="0 0 24 24" aria-hidden="true">${ICON[k]}</svg>`;
export async function initPlayer() {
  const $ = (id) => document.getElementById(id);
  const title = $('pt'), sub = $('pa'), prog = $('pp'), play = $('ppl'), prev = $('pprev'), next = $('pnext');
  play.innerHTML = svg('play'); prev.innerHTML = svg('prev'); next.innerHTML = svg('next');
  let tracks = [];
  try { tracks = await (await fetch('/audio/tracks.json')).json(); } catch { /* nessun manifest */ }
  if (!Array.isArray(tracks) || !tracks.length) { [play, prev, next].forEach((b) => (b.disabled = true)); return; }
  title.removeAttribute('data-i18n'); // da qui il titolo è quello della traccia
  const audio = new Audio(); audio.preload = 'none';
  let i = 0;
  const load = (n) => { i = (n + tracks.length) % tracks.length; audio.src = tracks[i].src; title.textContent = tracks[i].title; sub.textContent = tracks[i].artist || 'iYokaiミ'; };
  const go = (n, autoplay) => { load(n); if (autoplay) audio.play().catch(() => {}); };
  load(0);
  play.addEventListener('click', () => (audio.paused ? audio.play().catch(() => {}) : audio.pause()));
  prev.addEventListener('click', () => go(i - 1, !audio.paused));
  next.addEventListener('click', () => go(i + 1, !audio.paused));
  audio.addEventListener('play', () => { play.innerHTML = svg('pause'); play.setAttribute('aria-label', t('player.pause')); });
  audio.addEventListener('pause', () => { play.innerHTML = svg('play'); play.setAttribute('aria-label', t('player.play')); });
  audio.addEventListener('ended', () => go(i + 1, true));
  audio.addEventListener('timeupdate', () => { prog.style.transform = `scaleX(${audio.duration ? audio.currentTime / audio.duration : 0})`; });
}
