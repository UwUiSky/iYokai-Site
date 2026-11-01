# iYokai — Architettura del sito (proposta)

> **Aggiornamento 1/11/2026 — leggere prima `VISION.md`.** L'utente vuole una
> struttura a **hub**: intro → scelta del protocollo (mouse, tasti 1–6, default
> Discord Bot) → sezione del protocollo, con funzione Linktree e scroll a
> scatti (un gesto = una sezione). Le sezioni qui sotto restano valide come
> catalogo di scene e regole di motion/materiali, ma vanno **riordinate dentro
> i protocolli**: la home del Discord Bot segue il percorso della kitsune
> (Casa degli Spiriti → Sala del suono → Sala degli schermi → Nove Code →
> Lore → Invito); Social/Gaming, Music, Live, Progetti e Contatti sono
> protocolli con le proprie pagine di link. L'intro "rituale" (ofuda +
> incenso + tavolette ema) sostituisce il terminale se l'utente approva.

Riferimento vincolante: `DESIGN_SYSTEM.md` (CLAUDE.md originale dell'utente).
Il sito attuale fuori da `iyokai-next/` non viene modificato.

---

## 0. Design System e Motion System — sintesi operativa

### Palette (unica fonte: `src/styles/tokens.css`)

| Token | Hex | Regola |
|---|---|---|
| `--void` | `#07070b` | Sfondo sempre, o quasi |
| `--cinnabar` | `#C24A3A` | Solo CTA, highlight, focus |
| `--orchid` | `#9B4D7A` | ≤ 5–8% della superficie, uso deliberato |
| `--pale-ink` | `#C8C4BC` | Testo primario — mai `#fff` |
| `--mist` | `#8A8680` | Testo secondario |
| `--ash` | `#2A2928` | Superfici, pannelli |

Vietati: neon, cute/chibi/kawaii, viola generico, gradienti viola, Inter,
layout centrati banali, card generiche, bianco puro.

### Tipografia

- Display: Instrument Serif (o PP Editorial New, se licenziato), tracking −0.02/−0.03em.
- Body: Geist (o Neue Montreal), line-height 1.6–1.75 sui testi lunghi.
- Accento calligrafico: Yokai Fude (font originale già nella repo), solo capilettera/sigilli.
- Scala fluida, solo `clamp()`:

```css
--fs-mega:  clamp(4rem, 14vw, 13rem);
--fs-h1:    clamp(2.75rem, 7vw, 6.5rem);
--fs-h2:    clamp(2rem, 4.5vw, 4rem);
--fs-lead:  clamp(1.125rem, 1.6vw, 1.5rem);
--fs-body:  clamp(1rem, 1.05vw, 1.125rem);
--fs-micro: clamp(.75rem, .8vw, .875rem);
```

### Motion tokens (CSS e JS con gli stessi valori)

```js
export const ease  = { primary:'cubic-bezier(0.16,1,0.3,1)', soft:'cubic-bezier(0.22,1,0.36,1)', dramatic:'cubic-bezier(0.7,0,0.3,1)' };
export const dur   = { micro:.38, std:.75, cine:1.5 };       // 0.3–0.45 / 0.6–0.9 / 1.2–1.8
export const scrub = { light:.8, base:1.2, heavy:1.5 };      // sempre 0.8–1.5
```

- Lenis sempre attivo, sincronizzato a un unico `gsap.ticker`.
- ScrollTrigger con scrub 0.8–1.5; pinning sulle sezioni chiave.
- Camera "pesante": si muove solo lungo una spline, con damping; mai rumore casuale.

### 3D Material Language (unica fonte: `src/stage/materials.js`)

| Preset | Base | Parametri |
|---|---|---|
| `spirit` (code, hitodama) | `MeshPhysicalMaterial` | transmission .85–.95, thickness 0.8–1.4, roughness .25–.35, iridescence .1–.2, emissive orchid/cinnabar ≤ .08 |
| `lacquer` (maschera, torii, casa) | `MeshPhysicalMaterial` | roughness .2–.3, clearcoat 1, clearcoatRoughness .25, emissive cinnabar ≤ .04 |
| `ink` (nebbia, terreno) | `MeshPhysicalMaterial` | roughness .45, sheen .3 (sheenColor ash), nessuna transmission |
| `lite` (tier ≤ 1) | `MeshStandardMaterial` | stesso colore/roughness, emissive al posto della transmission |

### Performance

- 60fps su laptop medio (tier 2 = riferimento).
- Qualità adattiva + LOD, governor FPS.
- `prefers-reduced-motion`: niente scrub di camera, solo dissolvenze in opacità.
- Mobile: meno geometria, nessun post-processing pesante.

---

## 1. Architettura tecnica

```
iyokai-next/
├─ CLAUDE.md
├─ index.html                 percorso a sezioni 00–10
├─ src/
│  ├─ core/       lenis.js · ticker.js · quality.js · motion-tokens.js · router.js
│  ├─ stage/      renderer.js (WebGPU → WebGL2 → fallback 2D)
│  │              camera-rail.js (spline CatmullRom, damping)
│  │              materials.js · post.js (solo tier ≥ 2)
│  │              scenes/  mask · tails · hitodama · wave · torii · fog
│  ├─ sections/   s00-threshold … s10-farewell — ognuna { mount, timeline, dispose }
│  ├─ ui/         sistema esistente preservato (panel, commands, i18n, player, dialog…)
│  └─ styles/     tokens.css · type.css · layout.css · sections/*.css
└─ server/ deploy/ public/ … invariati
```

- **Un solo canvas persistente** dietro al DOM: niente scene che si
  smontano. La camera percorre il "sentiero del santuario", una spline
  continua dalla soglia all'altare; ogni sezione pinnata guida un tratto della
  spline con il proprio `progress`.
- **Tier di qualità** (`quality.js`, benchmark di 1s + governor):

| Tier | Target | Contenuto |
|---|---|---|
| 3 | GPU dedicata | transmission piena, bloom morbido, code ad alta geometria, 4k particelle |
| 2 | laptop medio | transmission a mezza risoluzione, bloom leggero, LOD medio |
| 1 | mobile | nessun post, preset `lite`, 1.5k particelle, DPR ≤ 1.5, 3 code |
| 0 | no GPU / reduced-motion | tavole statiche, fade 0.6s, niente scrub di camera |

- **Kitsune**: resta la tavola dipinta approvata, montata su piani in
  profondità (parallax). Il 3D è riservato ad ambiente ed elementi spirituali
  (code-luce, hitodama, maschera, torii), finché non si decide diversamente
  sul GLB.

---

## 2. Sezioni

Per ogni sezione: scopo · layout · 3D · motion · mobile / reduced-motion.

### 00 — La Soglia (preloader + terminale)
- **Scopo**: porta rituale; il terminale `/iYokai ミ` + Invio resta.
- **Layout**: tutto void; maschera kitsune al 38% sinistra, prompt in basso a sinistra.
- **3D**: maschera, preset `lacquer`, rim cinnabar debolissimo.
- **Motion**: caricamento come linea d'inchiostro; all'Invio la maschera si
  sfalda in cenere (dramatic, 1.6s), la camera entra nella nebbia.
- **Ridotto**: crossfade 0.6s verso 01.

### 01 — Risveglio (Hero)
- **Scopo**: primo impatto, Kitsune e nove code.
- **Layout**: tavola nel terzo destro; wordmark "iYokai" `--fs-mega` tagliato dal bordo sinistro; tagline mist in basso a sinistra.
- **3D**: nove code-luce `spirit` dietro la tavola.
- **Motion**: titolo a gruppi di lettere (primary 1.4s, stagger .06); pin 150vh, scrub 1.2: code che si aprono a ventaglio lento, camera che arretra.
- **Mobile**: 3 code, tavola 65dvh, titolo sopra.

### 02 — Origine (Manifesto)
- **Scopo**: "equilibrio tra tecnologia e leggenda".
- **Layout**: colonna 38ch al 58% destra; kanji verticale `妖怪` gigante a sinistra, ash su void.
- **3D**: pausa: nebbia `ink` e pochi hitodama alla deriva.
- **Motion**: righe rivelate con maschera dal basso (soft .9s, stagger .08); una sola parola in cinnabar.

### 03 — Le Nove Code (ecosistema)
- **Scopo**: cuore del sito, le 9 identità canoniche: iYokaiミ (core), Shirayuki, Aoi, Kuro, Hana, Rei, iYokai NSFW, iYokai App, iYokai Mod.
- **Layout**: pin di circa 500vh. Indice verticale `01–09` a sinistra; nome, bio breve e invito a destra. Niente card.
- **3D**: la coda attiva ha emissive cinnabar .08, la camera orbita lenta verso di lei; le altre restano velate.
- **Motion**: scrub 1.5 (il più pesante del sito); cambio testo std .75s primary.
- **Regole**: la Casa degli Spiriti non è una decima coda; NSFW resta solo
  un'etichetta con accesso 18+ separato.
- **Mobile**: lista verticale, una coda per schermata, niente orbita.

### 04 — Gli Spiriti dei Moduli (Discord Core)
- **Scopo**: moderazione, ticket, XP, sicurezza, automazioni, raccontati da Kitsune, Tengu, Nekomata, Bakeneko, Oni, Rokurokubi.
- **Layout**: elenco editoriale asimmetrico (sostituisce `.dc__grid`/`.glass`): numero · yokai in serif · funzione in sans; rientri sfalsati (8% / 32% / 14% …); anteprima in pannello ash all'hover/focus.
- **Motion**: micro .38s; underline cinnabar disegnata da sinistra; parallax per riga.
- **CTA**: Invita / Dashboard in cinnabar, collegati al pannello esistente.

### 05 — Il Suono (Music)
- **Scopo**: identità musicale, cinque istanze musicali, player e Spotify.
- **Layout**: tavola studio ricolorata, a tutta larghezza e molto scura; player esistente ridotto a un elemento fisso sottile in basso a destra.
- **3D**: anello d'onda di particelle, reattivo all'audio solo dopo il play dell'utente; a riposo respira lento.
- **Motion**: apertura dell'onda con scrub .8 all'ingresso.

### 06 — Protocolli (Live · Social · Progetti WIP)
- **Scopo**: protocolli secondari già esistenti.
- **Layout**: tre "stanze" in un pin orizzontale (scroll verticale → traslazione), altezze diverse per ritmo asimmetrico.
- **Motion**: scrub 1.2, tilt prospettico ≤ 3°.
- **Mobile**: stack verticale, nessun pin orizzontale.

### 07 — Makimono (Lore)
- **Scopo**: lore completa, 16 sezioni da `spirit-lore.it.json`, senza riscritture.
- **Layout**: rotolo che si srotola; misura 60ch, line-height 1.7; indice delle 16 voci sticky a lato.
- **Motion**: srotolamento con scrub 1.0; capilettera Yokai Fude "dipinti" (stroke-dashoffset, cine 1.5s).
- **Colore**: i sigilli hanko sono l'unico uso di orchid oltre alla Hero.

### 08 — La Casa degli Spiriti (Desktop / Android)
- **Scopo**: la dimora, cioè le app.
- **3D**: torii o piccola casa low-poly, preset `lacquer`, luce interna calda.
- **Layout**: oggetto a sinistra, due download a destra (disabilitati senza URL configurato, come oggi).
- **Motion**: la camera si avvicina alla porta (dramatic, scrub 1.5), che si apre in luce cinnabar.

### 09 — Invocazione (CTA finale)
- **Scopo**: conversione, "Invita lo spirito".
- **Layout**: vuoto quasi totale; una frase in serif e un solo bottone cinnabar, fuori asse in basso a sinistra.
- **3D**: le nove code convergono in un unico hitodama; fine della spline.
- **Motion**: bottone magnetico (micro .38s), glow cinnabar .15 al focus.

### 10 — Commiato (Contatti + footer)
- **Contenuto**: form di contatto Discord (backend esistente), legali, lingue, © 2026.
- **Layout**: footer alto 60vh, wordmark gigante tagliato in ash, specchio della Hero.

### Viste fuori dal percorso di scroll
Dashboard/pannello, catalogo comandi, Lounge NSFW (gate 18+), pagine legali,
model-lab interno. Transizione a velo (dramatic 1.2s), stessa grammatica
visiva, niente 3D pesante.

---

## 3. Navigazione globale

- Menu fisso in alto a destra: wordmark piccolo + "Menu" → overlay void, voci 01–10 in serif.
- Indicatore di progresso: linea d'inchiostro verticale a sinistra, marcatore di sezione in cinnabar.
- Cursore custom solo desktop: punto pale-ink → anello cinnabar sulle CTA.
- Tastiera: tutte le sezioni raggiungibili, focus visibile in cinnabar.

---

## 4. Conflitti rilevati nella repo originale (da risolvere nella copia)

1. **Palette**: il CSS usa `#e6afc3`, `#7c3aed`, `#c026d3`, `#ff9be8` e `#ffffff`, tutti fuori dalla palette.
2. **Font**: Syne e Manrope non sono nella linea tipografica di CLAUDE.md.
3. **Artwork**: la città neon blu/rosa e i riflessi magenta/plum dei protocolli vanno ricolorati verso void/cinnabar/orchid oppure rigenerati.
4. **Direzione statica** (`docs/STATIC_ART_DIRECTION.md`): Kitsune non animata. La proposta la rispetta: si muove solo l'ambiente.
5. **Griglia `.glass`**: card generiche in griglia regolare, da sostituire con layout editoriali.
6. **Skill**: CLAUDE.md cita `3d-web-pack`, che non risulta installata; disponibili `awwwards-web-design`, `scroll-3d-scene`, `scaffold-3d-site`, `add-postprocessing`, `optimize-3d-assets`, `frontend-design`.

---

## 5. Ordine di costruzione

1. Fondamenta: tokens, tipografia, Lenis + ticker, `quality.js`, renderer con fallback.
2. 00 Soglia + 01 Hero: fissano il Material Language.
3. 03 Nove Code: la più complessa, validata subito sulle prestazioni.
4. 02 · 04 · 05.
5. 06 · 07 · 08.
6. 09 · 10, poi viste fuori percorso migrate ai token.
7. Collaudo: reduced-motion, mobile, profilo FPS sul tier 2, tastiera.

## 6. Decisioni aperte

1. Artwork: regrade delle tavole esistenti o rigenerazione?
2. Font: Instrument Serif (gratuito) o PP Editorial New (licenza)? Geist o Neue Montreal?
3. Kitsune: tavola dipinta (proposta) o ripresa del GLB?
4. Struttura in 11 sezioni confermata, o da accorpare (es. 06)?
