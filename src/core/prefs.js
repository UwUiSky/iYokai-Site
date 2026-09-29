const KEY = 'iyokai:prefs';
const defaults = { theme: 'dark', speed: 1, accent: '#b24bff', sound: true };
export function loadPrefs() {
  try { return { ...defaults, ...JSON.parse(localStorage.getItem(KEY) || '{}') }; }
  catch { return { ...defaults }; }
}
export function savePrefs(p) { try { localStorage.setItem(KEY, JSON.stringify(p)); } catch { /* storage non disponibile */ } }
export function applyPrefs(p) {
  const r = document.documentElement;
  r.dataset.theme = p.theme;
  r.style.setProperty('--accent', p.accent);
  r.style.setProperty('--speed', p.speed);
}
