const s = (d) => `<svg viewBox="0 0 24 24" aria-hidden="true">${d}</svg>`;
// Ordine: colonna sinistra (1-3), colonna destra (4-6). tk/dk = chiavi di traduzione di titolo e descrizione.
export const MODULES = [
  { title: 'Discord Bot', dk: 'mod.bot.d', href: '#discord', icon: s('<rect x="4" y="8" width="16" height="11" rx="4"/><path d="M12 4v4M9 13h.01M15 13h.01"/>') },
  { tk: 'mod.comm.t', dk: 'mod.comm.d', href: '#community', icon: s('<circle cx="9" cy="9" r="3"/><circle cx="17" cy="10" r="2.5"/><path d="M3 19c0-3 3-5 6-5s6 2 6 5M15 15c3 0 6 1.5 6 4"/>') },
  { tk: 'mod.social.t', dk: 'mod.social.d', href: '#social', icon: s('<circle cx="6" cy="12" r="2.5"/><circle cx="18" cy="6" r="2.5"/><circle cx="18" cy="18" r="2.5"/><path d="M8.2 11l7.6-4M8.2 13l7.6 4"/>') },
  { tk: 'mod.music.t', dk: 'mod.music.d', href: '#music', icon: s('<path d="M9 18V6l10-2v12"/><circle cx="7" cy="18" r="2"/><circle cx="17" cy="16" r="2"/>') },
  { tk: 'mod.proj.t', dk: 'mod.proj.d', href: '#progetti', icon: s('<rect x="4" y="4" width="7" height="7" rx="2"/><rect x="13" y="4" width="7" height="7" rx="2"/><rect x="4" y="13" width="7" height="7" rx="2"/><rect x="13" y="13" width="7" height="7" rx="2"/>') },
  { title: 'System', dk: 'mod.sys.d', href: '#', sealed: true, icon: s('<rect x="5" y="11" width="14" height="9" rx="3"/><path d="M8 11V8a4 4 0 018 0v3"/>') },
];
