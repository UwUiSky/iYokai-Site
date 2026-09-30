// Traduzioni: un file JSON per lingua, caricato solo quando serve. Per aggiungere una lingua: nuovo src/i18n/<codice>.json + una riga in LANGS.
export const LANGS = [{ code: 'it', name: 'Italiano', load: () => import('./it.json') }, { code: 'en', name: 'English', load: () => import('./en.json') }];
const RTL = new Set(['ar', 'he', 'fa', 'ur']);
let dict = {}, base = {}, cur = 'it';
export const lang = () => cur;
export const t = (k, v) => { let s = dict[k] ?? base[k] ?? k; if (v) for (const n in v) s = s.replaceAll(`{${n}}`, v[n]); return s; };
export const a = (k, v) => `data-i18n="${k}"${v ? ` data-i18n-v='${JSON.stringify(v)}'` : ''}`; // attributi per i nodi generati da JS
export function apply(root = document) {
  root.querySelectorAll('[data-i18n]').forEach((el) => { el.textContent = t(el.dataset.i18n, el.dataset.i18nV ? JSON.parse(el.dataset.i18nV) : null); });
  root.querySelectorAll('[data-i18n-attr]').forEach((el) => el.dataset.i18nAttr.split(';').forEach((p) => { const [at, k] = p.split(':'); el.setAttribute(at, t(k)); }));
}
export const detect = () => { const l = (navigator.languages || [navigator.language || 'en']).map((x) => x.slice(0, 2).toLowerCase()).find((c) => LANGS.some((L) => L.code === c)); return l || 'en'; };
export async function setLang(code) {
  const L = LANGS.find((x) => x.code === code) || LANGS[1];
  if (!base.meta) base = (await LANGS[0].load()).default;
  dict = L.code === 'it' ? base : (await L.load()).default; cur = L.code;
  const r = document.documentElement; r.lang = cur; r.dir = RTL.has(cur) ? 'rtl' : 'ltr';
  document.querySelector('meta[name=description]')?.setAttribute('content', t('meta.desc')); apply();
  document.dispatchEvent(new CustomEvent('i18n:change'));
}
export const initI18n = (pref) => setLang(LANGS.some((x) => x.code === pref) ? pref : detect());
