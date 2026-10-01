// Traduzioni: un file JSON per lingua, caricato solo quando serve. Per aggiungere una lingua: nuovo src/i18n/<codice>.json + una riga in LANGS.
const FILES = import.meta.glob('./*.json'); // basta aggiungere src/i18n/<codice>.json: la lingua compare da sola nel selettore
const NAMES = { bg: 'Български', cs: 'Čeština', da: 'Dansk', de: 'Deutsch', el: 'Ελληνικά', en: 'English', 'es-419': 'Español (Latinoamérica)', 'es-ES': 'Español (España)', fi: 'Suomi', fr: 'Français', hi: 'हिन्दी', hr: 'Hrvatski', hu: 'Magyar', id: 'Bahasa Indonesia', it: 'Italiano', ja: '日本語', ko: '한국어', lt: 'Lietuvių', nl: 'Nederlands', no: 'Norsk', pl: 'Polski', 'pt-BR': 'Português (Brasil)', ro: 'Română', ru: 'Русский', 'sv-SE': 'Svenska', th: 'ไทย', tr: 'Türkçe', uk: 'Українська', vi: 'Tiếng Việt', 'zh-CN': '简体中文', 'zh-TW': '繁體中文' };
export const LANGS = Object.keys(FILES).map((p) => { const code = p.slice(2, -5); return { code, name: NAMES[code] || code, load: FILES[p] }; }).sort((x, y) => x.name.localeCompare(y.name));
const RTL = new Set(['ar', 'he', 'fa', 'ur']);
let dict = {}, en = {}, cur = 'en';
export const lang = () => cur;
export const t = (k, v) => { let s = dict[k] ?? en[k] ?? k; if (v) for (const n in v) s = s.replaceAll(`{${n}}`, v[n]); return s; };
export const a = (k, v) => `data-i18n="${k}"${v ? ` data-i18n-v='${JSON.stringify(v)}'` : ''}`; // attributi per i nodi generati da JS
export function apply(root = document) {
  root.querySelectorAll('[data-i18n]').forEach((el) => { el.textContent = t(el.dataset.i18n, el.dataset.i18nV ? JSON.parse(el.dataset.i18nV) : null); });
  root.querySelectorAll('[data-i18n-attr]').forEach((el) => el.dataset.i18nAttr.split(';').forEach((p) => { const [at, k] = p.split(':'); el.setAttribute(at, t(k)); }));
}
export const detect = () => {
  for (const raw of navigator.languages || [navigator.language || 'en']) {
    const l = raw.toLowerCase(), hit = LANGS.find((L) => L.code.toLowerCase() === l) || LANGS.find((L) => L.code.toLowerCase().split('-')[0] === l.split('-')[0]);
    if (hit) return hit.code;
  }
  return 'en';
};
export async function setLang(code) {
  const L = LANGS.find((x) => x.code === code) || LANGS.find((x) => x.code === 'en');
  if (!en.meta) en = (await FILES['./en.json']()).default; // l'inglese è la base: le chiavi mancanti ripiegano su di lui
  dict = L.code === 'en' ? en : (await L.load()).default; cur = L.code;
  const r = document.documentElement; r.lang = cur; r.dir = RTL.has(cur.split('-')[0]) ? 'rtl' : 'ltr';
  document.querySelector('meta[name=description]')?.setAttribute('content', t('meta.desc')); apply();
  document.dispatchEvent(new CustomEvent('i18n:change'));
}
export const initI18n = (pref) => setLang(LANGS.some((x) => x.code === pref) ? pref : detect());
