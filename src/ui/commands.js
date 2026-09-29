// Elenco comandi del bot (generato da COMMAND_LIST.md): ricerca e filtro per categoria.
const esc = (t) => t.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
export function initCommands() {
  const o = document.createElement('div'); o.className = 'sheet'; o.hidden = true; o.setAttribute('role', 'dialog'); o.setAttribute('aria-modal', 'true'); o.setAttribute('aria-labelledby', 'cmd-t');
  o.innerHTML = '<div class="sheet__box glass cmd__box"><button class="sheet__x" type="button" aria-label="Chiudi">×</button><h3 id="cmd-t">Comandi</h3><p class="cmd__meta"></p><input class="cmd__q" type="search" placeholder="Cerca un comando" aria-label="Cerca un comando" autocomplete="off"><div class="cmd__cats" role="group" aria-label="Categorie"></div><ul class="cmd__list"></ul></div>';
  document.body.appendChild(o);
  const $ = (s) => o.querySelector(s), meta = $('.cmd__meta'), qi = $('.cmd__q'), cats = $('.cmd__cats'), list = $('.cmd__list');
  let data, cat = 'Tutti', q = '', from;
  const render = () => {
    const rows = [];
    data.categories.forEach((c) => { if (cat === 'Tutti' || cat === c.name) c.commands.forEach(([n, d]) => { if (!q || `${n} ${d}`.toLowerCase().includes(q)) rows.push(`<li><code>${esc(n)}</code><span>${esc(d)}</span></li>`); }); });
    list.innerHTML = rows.join('') || '<li class="cmd__none">Nessun comando trovato.</li>'; meta.textContent = `${rows.length} comandi`;
    cats.querySelectorAll('button').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.c === cat)));
  };
  const shut = () => { o.hidden = true; from?.focus(); };
  const open = async (el) => {
    from = el; o.hidden = false;
    if (!data) { data = (await import('../data/commands.json')).default; cats.innerHTML = [['Tutti', data.total], ...data.categories.map((c) => [c.name, c.commands.length])].map(([n, k]) => `<button type="button" data-c="${esc(n)}">${esc(n)} <small>${k}</small></button>`).join(''); }
    render(); qi.focus();
  };
  qi.addEventListener('input', () => { q = qi.value.trim().toLowerCase(); render(); });
  cats.addEventListener('click', (e) => { const b = e.target.closest('button'); if (b) { cat = b.dataset.c; render(); } });
  o.querySelector('.sheet__x').addEventListener('click', shut); o.addEventListener('click', (e) => { if (e.target === o) shut(); });
  addEventListener('keydown', (e) => { if (e.key === 'Escape' && !o.hidden) shut(); });
  document.addEventListener('click', (e) => { const a = e.target.closest('a[href="#commands"]'); if (a) { e.preventDefault(); open(a); } });
}
