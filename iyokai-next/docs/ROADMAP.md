# Roadmap della revisione

Stato al 1 novembre 2026: **in pausa**. Priorità dell'utente: chiudere il bot
Discord. Riprendere solo su richiesta esplicita.

## Fase 0 — Preparazione ✅
- [x] Cartella `iyokai-next/` con istruzioni, design system, visione, architettura.
- [x] Skill web 3D, Awwwards e Blender installate in Claude Code; Blender 5.2.3 headless collaudato (export GLB ok).
- [x] Script di setup cloud collaudato (skill, agenti, design system, glTF tools, Blender 5.2.3).
- [ ] Utente: incollare `tools/setup-iyokai.sh` nello setup script dell'ambiente.
- [ ] Script locale (`--local` / `.ps1`): da provare sul PC dell'utente con Blender aperto.

## Fase 1 — Il massimo effetto con il minimo sforzo (in corso, 16/11/2026)
Progetto in `iyokai-next/site/` (Vite + React 19 + TypeScript + Tailwind 4 + R3F). Scelte prese
in attesa di conferma dell'utente: intro «rituale», Instrument Serif + Geist, tavole esistenti
con regrade CSS provvisorio (`.plate`).
- [x] Token di design (palette, tipografia `clamp()`, easing, durate) in `src/index.css` e `src/lib/motion.ts`.
- [x] Intro rituale: talismano, incenso come conto alla rovescia (9 s), Invio/tocco, Esc ferma l'attesa.
- [x] Scelta del protocollo: mouse, tasti 1–6, Discord Bot quando l'incenso finisce (14 s).
- [x] Pagine link stile Linktree guidate da `public/links.json` (solo https; link vuoto = «In arrivo»).
- [x] Navigazione a scatti: rotella, trackpad, frecce, Pagina su/giù, spazio, dito; Esc torna ai protocolli.
- [x] Pioggia di sakura in 3D (una mesh istanziata, vento dal puntatore, 4 livelli di qualità, ferma con movimento ridotto).
- [x] Transizioni tra le sezioni (prima l'illustrazione, poi il testo).
- [ ] Verifica su hardware reale (FPS, GPU): nel cloud solo rendering software.
- [ ] Lingue (ora solo italiano), dati reali in `links.json`, contenuti di Social/Live/Progetti.
- [ ] Peso: bundle principale 555 KB (175 KB gzip), scena 3D 1 MB caricata dopo l'intro: da ridurre.
- [ ] Decisioni utente: intro rituale o terminale; regrade o rigenerazione delle tavole; font.

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
