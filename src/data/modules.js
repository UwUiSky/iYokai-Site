const s = (d) => `<svg viewBox="0 0 24 24" aria-hidden="true">${d}</svg>`;
// Ordine: colonna sinistra (1-3), colonna destra (4-6). href reali da collegare alle sezioni.
export const MODULES = [
  { title: 'Discord Bot', desc: 'Moderazione, utility, fun e molto altro.', href: '#discord', icon: s('<rect x="4" y="8" width="16" height="11" rx="4"/><path d="M12 4v4M9 13h.01M15 13h.01"/>') },
  { title: 'Community', desc: 'I server dove vive l\u2019ecosistema.', href: '#community', icon: s('<circle cx="9" cy="9" r="3"/><circle cx="17" cy="10" r="2.5"/><path d="M3 19c0-3 3-5 6-5s6 2 6 5M15 15c3 0 6 1.5 6 4"/>') },
  { title: 'Social', desc: 'Instagram, TikTok, Twitch, YouTube, Steam.', href: '#social', icon: s('<circle cx="6" cy="12" r="2.5"/><circle cx="18" cy="6" r="2.5"/><circle cx="18" cy="18" r="2.5"/><path d="M8.2 11l7.6-4M8.2 13l7.6 4"/>') },
  { title: 'Musica', desc: 'Le mie release, da ascoltare qui.', href: '#music', icon: s('<path d="M9 18V6l10-2v12"/><circle cx="7" cy="18" r="2"/><circle cx="17" cy="16" r="2"/>') },
  { title: 'Progetti', desc: 'Gli altri mondi su cui sto lavorando.', href: '#progetti', icon: s('<rect x="4" y="4" width="7" height="7" rx="2"/><rect x="13" y="4" width="7" height="7" rx="2"/><rect x="4" y="13" width="7" height="7" rx="2"/><rect x="13" y="13" width="7" height="7" rx="2"/>') },
  { title: 'System', desc: 'Sigillato. Qualcosa arriverà.', href: '#', sealed: true, icon: s('<rect x="5" y="11" width="14" height="9" rx="3"/><path d="M8 11V8a4 4 0 018 0v3"/>') },
];
