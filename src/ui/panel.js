// Panel: login Discord, scelta del server, moduli attivabili e storico. Parla con l'API Python (/api) sullo stesso dominio.
const esc = (t) => String(t).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
export function initPanel() {
  const o = document.createElement('div'); o.className = 'sheet'; o.hidden = true; o.setAttribute('role', 'dialog'); o.setAttribute('aria-modal', 'true'); o.setAttribute('aria-labelledby', 'pnl-t');
  o.innerHTML = '<div class="sheet__box glass pnl__box"><button class="sheet__x" type="button" aria-label="Chiudi">×</button><h3 id="pnl-t">Panel</h3><div class="pnl__body" aria-live="polite"></div></div>';
  document.body.appendChild(o);
  const body = o.querySelector('.pnl__body'); let csrf = '', gid = '', from;
  const api = async (path, method = 'GET', data) => {
    const r = await fetch(`/api${path}`, { method, credentials: 'same-origin', headers: { Accept: 'application/json', ...(method !== 'GET' ? { 'Content-Type': 'application/json', 'X-CSRF-Token': csrf } : {}) }, body: data ? JSON.stringify(data) : undefined });
    if (!r.ok) throw Object.assign(new Error('http'), { status: r.status });
    return r.json();
  };
  const note = (m) => { body.innerHTML = `<p class="pnl__msg">${esc(m)}</p>`; };
  const loginView = (m = 'Accedi con Discord per gestire i server dove iYokai è presente.') => { body.innerHTML = `<p class="pnl__msg">${esc(m)}</p><a class="btn btn--main" href="/api/auth/login">Login Discord</a>`; };
  const hist = async () => {
    const h = await api(`/guilds/${gid}/history?limit=8`), box = body.querySelector('.pnl__hist'); if (!box) return;
    box.innerHTML = h.items.length ? h.items.map((i) => `<div class="pnl__row"><span>${esc(i.key)} ${i.new === 'true' ? 'attivato' : 'disattivato'}</span><small>${esc(new Date(i.at).toLocaleString('it-IT'))}</small></div>`).join('') : '<p class="pnl__msg">Nessuna modifica.</p>';
  };
  const showGuild = async (id) => {
    gid = id; const g = await api(`/guilds/${id}`), groups = {};
    g.modules.forEach((m) => (groups[m.group] ||= []).push(m));
    body.querySelectorAll('[data-g]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.g === id)));
    body.querySelector('.pnl__main').innerHTML = `<div class="pnl__mods">${Object.entries(groups).map(([n, ms]) => `<section class="pnl__grp"><h4>${esc(n)}</h4>${ms.map((m) => `<div class="pnl__row"><span>${esc(m.label)}</span><button class="sw2" type="button" role="switch" aria-checked="${m.active}" aria-label="${esc(m.label)}" data-k="${esc(m.key)}"></button></div>`).join('')}</section>`).join('')}</div><section class="pnl__grp"><h4>Ultime modifiche</h4><div class="pnl__hist"></div></section>`;
    await hist();
  };
  const load = async (msg) => {
    if (msg) return loginView(msg);
    body.textContent = 'Caricamento…';
    try {
      const me = await api('/me'); csrf = me.csrf;
      body.innerHTML = `<div class="pnl__top"><span>${esc(me.user.name)}</span><button class="btn" type="button" data-out>Esci</button></div><div class="pnl__guilds" role="group" aria-label="Server">${me.guilds.map((g) => `<button type="button" data-g="${esc(g.id)}" aria-pressed="false">${esc(g.name)}</button>`).join('')}</div><div class="pnl__main">${me.guilds.length ? '' : '<p class="pnl__msg">Il bot non è ancora in nessun server che gestisci.</p>'}</div>`;
      if (me.guilds.length) await showGuild(me.guilds[0].id);
    } catch (e) { if (e.status === 401) loginView(); else note('Il panel non è raggiungibile in questo momento.'); }
  };
  const open = (el, msg) => { from = el; o.hidden = false; o.querySelector('.sheet__x').focus(); load(msg); };
  const shut = () => { o.hidden = true; from?.focus?.(); };
  body.addEventListener('click', async (e) => {
    const g = e.target.closest('[data-g]'), k = e.target.closest('[data-k]'), out = e.target.closest('[data-out]');
    try {
      if (g) await showGuild(g.dataset.g);
      else if (out) { await api('/auth/logout', 'POST'); loginView('Sei uscito.'); }
      else if (k) {
        const next = k.getAttribute('aria-checked') !== 'true'; k.setAttribute('aria-checked', String(next)); k.disabled = true;
        try { await api(`/guilds/${gid}/modules/${k.dataset.k}`, 'PATCH', { active: next }); await hist(); } catch { k.setAttribute('aria-checked', String(!next)); } finally { k.disabled = false; k.focus(); }
      }
    } catch { note('Operazione non riuscita. Riprova.'); }
  });
  o.querySelector('.sheet__x').addEventListener('click', shut); o.addEventListener('click', (e) => { if (e.target === o) shut(); });
  addEventListener('keydown', (e) => { if (e.key === 'Escape' && !o.hidden) shut(); });
  document.addEventListener('click', (e) => { const a = e.target.closest('a[href="#panel"]'); if (a) { e.preventDefault(); open(a); } });
  document.addEventListener('realm:entered', () => { if (location.hash === '#panel') open(); else if (location.hash === '#panel-error') open(null, 'Accesso non riuscito. Riprova.'); });
}
