# Roadmap della revisione

Stato al 1 novembre 2026: **in pausa**. Priorità dell'utente: chiudere il bot
Discord. Riprendere solo su richiesta esplicita.

## Fase 0 — Preparazione ✅
- [x] Cartella `iyokai-next/` con istruzioni, design system, visione, architettura.
- [x] Skill web 3D, Awwwards e Blender installate in Claude Code; Blender 5.2.3 headless collaudato (export GLB ok).
- [ ] Utente: incollare il comando di `docs/SETUP_SCRIPT.md` nello setup script dell'ambiente.

## Fase 1 — Il massimo effetto con il minimo sforzo
- [ ] Copia aggiornata della sorgente in `iyokai-next/site/` (CLAUDE.md §3).
- [ ] Token CSS/JS (palette, tipografia `clamp()`, motion).
- [ ] Intro (rituale o terminale, decisione utente) con cooldown e ingresso automatico.
- [ ] Scelta del protocollo: mouse, tasti 1–6, default Discord Bot.
- [ ] Pagine link stile Linktree guidate da `links.json` (social, gaming, community, musica).
- [ ] Scroll a scatti per sezione (rotella, trackpad, frecce, swipe; sezioni lunghe scorrono dentro).
- [ ] Pioggia di sakura (3D istanziato; versione leggera su mobile; ferma con reduced-motion).
- [ ] Transizioni tra le tavole esistenti (ricolorate se approvato).

## Fase 2 — Ambienti del Discord Bot
- [ ] Casa degli Spiriti (home del bot).
- [ ] Sala del suono (music bot) con onda audio reattiva.
- [ ] Sala degli schermi: funzionalità cliccabili sugli schermi.
- [ ] Dashboard, inviti, download desktop/Android, identità e lore integrati.

## Fase 3 — Kitsune viva
- [ ] Decidere strada A (video) / B (tavole) / C (modello Blender).
- [ ] Camminata verso la casa, sguardo dentro, ingresso, pose per sezione.
- [ ] Sguardo/testa/corpo che seguono il mouse.

## Fase 4 — Collaudo e messa online
- [ ] Prove su hardware reale dell'utente (FPS, WebGPU/WebGL2), mobile, tastiera, reduced-motion.
- [ ] Installazione sul server dell'utente (stack `deploy/`) — solo su richiesta.
