# iYokaiミ

Sito dell'ecosistema iYokaiミ. Esperienza predefinita: tavole statiche integrate,
terminale, sei protocolli, fuochi fatui, pergamena e transizioni fra pannelli.
Il prototipo GPU è archiviato e non è l'esperienza predefinita.

```
npm install
npm run dev
npm run build
```

Il backend Python/FastAPI è in `server/`; lo stack Caddy/Cloudflare Tunnel è in
`deploy/`. La preview Sites è statica: `public/panel.json` rimane disabilitato
finché l'integrazione e il collaudo reale non sono completati.

- Stato e priorità: `docs/CINEMATIC_SPRINT.md`, `docs/STATIC_ART_DIRECTION.md`.
- Backend e adapter del bot: `docs/PANEL_BACKEND.md`, `integration/README.md`.
- Contatti Discord e prezzi: `docs/CONTACT_AND_PLANS.md`.
- Revisione sicurezza e limiti verificati: `docs/SECURITY_REVIEW.md`.
- Mappa delle pagine operative da completare: `docs/PANEL_IMPLEMENTATION_MAP.md`.
- Licenze: `LICENSE`, `THIRD_PARTY_NOTICES.md`. Harukaze demo rimane soltanto
  nella preview privata e non deve essere pushata alla repository pubblica.

Nessun prezzo o diritto VIP è stato inventato. Checkout disabilitato al lancio.
