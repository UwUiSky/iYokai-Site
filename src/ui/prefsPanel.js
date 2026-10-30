import { decorateLanguageSelect } from '../i18n/index.js';
import { savePrefs, applyPrefs } from '../core/prefs.js';
import { LANGS, a, lang, setLang, t } from '../i18n/index.js';
const ACCENTS = ['#b24bff', '#ff4fd8', '#7c5cff', '#ff6a9e'];
export function initPrefsPanel({ prefs, onChange }) {
  const hub = document.getElementById('hub'), wrap = document.createElement('div');
  wrap.innerHTML = `<button class="gear" id="gear" type="button" aria-label="${t('prefs.open')}" data-i18n-attr="aria-label:prefs.open" aria-expanded="false"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h10M18 7h2M4 17h2M10 17h10"/><circle cx="16" cy="7" r="2"/><circle cx="8" cy="17" r="2"/></svg></button>
  <div class="prefs glass" id="prefs" hidden role="group" aria-label="${t('prefs.open')}" data-i18n-attr="aria-label:prefs.open">
    <div class="prefs__row"><span ${a('prefs.theme')}>${t('prefs.theme')}</span><span><button data-k="theme" data-v="dark" ${a('prefs.dark')}>${t('prefs.dark')}</button><button data-k="theme" data-v="light" ${a('prefs.light')}>${t('prefs.light')}</button></span></div>
    <label class="prefs__row"><span ${a('prefs.anim')}>${t('prefs.anim')}</span><input id="pspd" type="range" min="0.5" max="1.5" step="0.1" aria-label="${t('prefs.animAria')}" data-i18n-attr="aria-label:prefs.animAria"></label>
    <div class="prefs__row"><span ${a('prefs.accent')}>${t('prefs.accent')}</span><span>${ACCENTS.map((c) => `<button class="sw" data-k="accent" data-v="${c}" style="--c:${c}" aria-label="${c}"></button>`).join('')}</span></div>
    <label class="prefs__row"><span ${a('prefs.sound')}>${t('prefs.sound')}</span><input id="psnd" type="checkbox"></label>
    <label class="prefs__row"><span ${a('prefs.lang')}>${t('prefs.lang')}</span><select id="plang" class="prefs__sel">${LANGS.map((l) => `<option value="${l.code}">${l.name}</option>`).join('')}</select></label></div>`;
  hub.append(...wrap.children);
  const gear = document.getElementById('gear'), panel = document.getElementById('prefs'), spd = document.getElementById('pspd'), snd = document.getElementById('psnd'), sel = document.getElementById('plang');
  decorateLanguageSelect(sel);
  const sync = () => {
    spd.value = prefs.speed; snd.checked = prefs.sound; sel.value = lang();
    panel.querySelectorAll('[data-k]').forEach((b) => b.setAttribute('aria-pressed', String(prefs[b.dataset.k] === b.dataset.v)));
  };
  const set = (k, v) => { prefs[k] = v; savePrefs(prefs); applyPrefs(prefs); sync(); onChange(k); };
  panel.addEventListener('click', (e) => { const b = e.target.closest('[data-k]'); if (b) set(b.dataset.k, b.dataset.v); });
  spd.addEventListener('input', () => set('speed', +spd.value)); snd.addEventListener('change', () => set('sound', snd.checked));
  sel.addEventListener('change', async () => { await setLang(sel.value); set('lang', sel.value); });
  gear.addEventListener('click', () => { panel.hidden = !panel.hidden; gear.setAttribute('aria-expanded', String(!panel.hidden)); });
  document.addEventListener('i18n:change', sync);
  sync();
}
