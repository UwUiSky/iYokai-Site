# iyokai-next — istruzioni operative per Claude

Questa cartella è lo spazio di lavoro della **revisione cinematografica** del sito
iYokai. Leggi questo file per intero all'inizio di ogni sessione che riguarda il
sito, poi `docs/DESIGN_SYSTEM.md`, `docs/VISION.md` e `docs/ROADMAP.md`.

## 0. Regola assoluta: la sorgente attuale non si tocca

- Lavora **solo** dentro `iyokai-next/`. Qualsiasi file fuori da questa cartella
  (radice della repo: `index.html`, `src/`, `public/`, `server/`, `deploy/`,
  `docs/`, `tools/`, `package.json`, ecc.) è il sito in produzione e **non va
  modificato, spostato, rinominato, formattato o cancellato per nessun motivo**.
- Si può **leggere** la sorgente e **copiarla** dentro `iyokai-next/site/` quando
  inizia il lavoro sul sito (vedi §3). Mai il contrario.
- Prima di ogni commit verifica che lo stage contenga solo `iyokai-next/`:
  ```bash
  git diff --cached --name-only | grep -v '^iyokai-next/' && echo "STOP: file fuori cartella" || echo ok
  ```
  Se compare anche un solo file fuori cartella: `git restore --staged <file>` e
  `git checkout -- <file>`; non committare.
- Non modificare il branch `main` direttamente. Lavora sul branch indicato dalla
  sessione (es. `claude/...`) e apri una PR in bozza.

## 1. Priorità dell'utente

1. Ora la priorità è **chiudere il bot Discord**. Il sito si riprende solo quando
   l'utente lo chiede esplicitamente.
2. Budget di token e tempo limitato: preferire fasi piccole e ad alto impatto
   (vedi `docs/ROADMAP.md`), niente lavoro speculativo.
3. A sito finito l'utente chiederà l'installazione sul suo server
   (stack esistente in `deploy/`: Caddy + Cloudflare Tunnel, backend FastAPI in
   `server/`). Non farlo prima della richiesta.

## 2. Mappa della cartella

```
iyokai-next/
├─ CLAUDE.md               ← questo file
├─ README.md               ← spiegazione breve per l'utente
├─ docs/
│  ├─ DESIGN_SYSTEM.md     ← CLAUDE.md originale dell'utente (palette, font, motion, materiali) — VINCOLANTE
│  ├─ VISION.md            ← l'idea dell'utente, parola per parola nei punti chiave, + fattibilità
│  ├─ ARCHITECTURE.md      ← architettura tecnica e sezioni
│  ├─ ROADMAP.md           ← fasi e checklist
│  ├─ BLENDER.md           ← come usare Blender (headless o sul PC dell'utente) per kitsune e ambienti
│  ├─ SKILLS.md            ← inventario skill/agent, origine, licenze, commit
│  └─ SETUP_SCRIPT.md      ← comando per avere skill e Blender pronti a ogni sessione
├─ tools/setup-iyokai.sh   ← setup cloud (incollare nello setup script) e locale macOS/Linux (--local)
├─ tools/setup-iyokai-local.ps1 ← setup locale Windows (skill + Blender via MCP)
└─ site/                   ← (da creare in Fase 1) copia di lavoro del sito
```

## 3. Avvio del lavoro sul sito (solo quando l'utente lo chiede)

1. `git fetch origin main` e verifica cosa è cambiato nella sorgente da `9c1c625`.
2. Crea la copia **aggiornata** della sorgente in `iyokai-next/site/`:
   ```bash
   mkdir -p iyokai-next/site
   git ls-files -- . ':!iyokai-next' | tar -cf - -T - | tar -xf - -C iyokai-next/site
   ```
   (Git deduplica i file identici: la copia non raddoppia il peso della repo.)
3. Scrivi in `iyokai-next/site/SOURCE_BASE.txt` il commit di partenza.
4. Lavora solo dentro `iyokai-next/site/`. `npm install` e `npm run dev` da lì.
   `node_modules/` e `dist/` non si committano.
5. I dati sensibili (`.env`, segreti, token) non vanno mai nei file né nei commit.

## 4. Regole di design e motion

Applica sempre `docs/DESIGN_SYSTEM.md`. In sintesi:
- Palette solo token: void `#07070b`, cinnabar `#C24A3A` (CTA/focus), orchid
  `#9B4D7A` (≤ 5–8%), pale-ink `#C8C4BC`, mist `#8A8680`, ash `#2A2928`. Mai `#fff`.
- Vietati: neon, cute/chibi/kawaii, viola generico e gradienti viola, Inter,
  layout centrati banali, card generiche, griglie regolari.
- Font display serif (Instrument Serif / Editorial New), body Geist / Neue
  Montreal, tutto in `clamp()`.
- Easing primary `cubic-bezier(0.16,1,0.3,1)`, soft `(0.22,1,0.36,1)`, dramatic
  `(0.7,0,0.3,1)`; durate micro .3–.45s, std .6–.9s, cine 1.2–1.8s; Lenis +
  ScrollTrigger scrub 0.8–1.5; camera pesante.
- 3D: `MeshPhysicalMaterial`, transmission+thickness per gli spiriti, roughness
  .15–.45, emissive debole e calda.
- 60fps su laptop medio, qualità adattiva, `prefers-reduced-motion`, mobile leggero.

Conflitti noti della sorgente attuale (palette viola/magenta/bianco, Syne e
Manrope, tavole con neon, griglia `.glass`) sono elencati in
`docs/ARCHITECTURE.md` §4: si risolvono **nella copia**, mai nella sorgente.

## 5. Skill da usare

Le skill vanno installate **in Claude Code** (`~/.claude/skills`, livello
utente), **non nella repo**. La macchina cloud è temporanea: all'inizio di ogni
sessione sul sito controlla che ci siano (`ls ~/.claude/skills | grep blender-core`
e `blender --version`); se mancano esegui
`bash iyokai-next/tools/setup-iyokai.sh` dalla cartella sopra la repo (scrive
solo nella macchina, mai nella repo). In locale sul PC dell'utente:
`setup-iyokai.sh --local` (macOS/Linux) o `setup-iyokai-local.ps1` (Windows),
che collegano anche il Blender aperto via MCP. Per averle sempre pronte, l'utente può mettere quel
comando nello **setup script** dell'ambiente: testo pronto in
`docs/SETUP_SCRIPT.md`. Gli asset generati (render, GLB, texture) si salvano
nella macchina o, se servono al sito, dentro `iyokai-next/`.

- Web/3D: `scroll-3d-scene`, `add-postprocessing`, `optimize-3d-assets`,
  `scaffold-3d-site` (attenzione: è React/R3F, il sito è vanilla — usarne solo
  i principi), `awwwards-web-design`, `frontend-design`.
- Blender: parti sempre da `blender-core`; per la kitsune da reference
  `blender-image-to-3d`; poi `blender-character-rigging`, `blender-hair-grooming`
  (pelliccia delle code), `blender-clothing` (kimono), `blender-facial-shapekeys`,
  `blender-animation`, `blender-stylized-npr`, `blender-environment-kits`,
  `blender-lighting-lookdev`, `blender-game-optimization`,
  `blender-export-pipelines` (target web/glTF), `blender-asset-qa`.
- Dettagli e licenze: `docs/SKILLS.md`. Procedura Blender: `docs/BLENDER.md`.

## 6. GitHub e credenziali

- Push con l'accesso della sessione: `git push -u origin <branch>`.
- Se GitHub risponde 403, l'utente deve ricollegare GitHub
  (https://claude.ai/connect-github). Se l'utente fornisce un token personale,
  usarlo **solo nella riga di comando del push** (variabile d'ambiente o header
  temporaneo), **mai** scriverlo in file, config git, remote URL, commit o PR.
- Commit piccoli e descrittivi; PR in bozza; niente force push su branch altrui.

## 7. Onestà sui risultati

- Non dichiarare qualità finale, prestazioni o rig funzionanti senza verifica
  (render di controllo, test, misure). Il browser cloud non ha una GPU reale:
  FPS e WebGPU vanno verificati sull'hardware dell'utente.
- Non sostituire in silenzio la Kitsune approvata: ogni nuovo modello o tavola
  va mostrato all'utente prima dell'integrazione.
- Nessuna spesa (crediti, servizi a pagamento) senza istruzione esplicita.
