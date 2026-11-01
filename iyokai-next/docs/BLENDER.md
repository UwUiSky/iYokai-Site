# Blender — kitsune e ambienti

## Due modi di lavorare

### A. Headless nel container cloud (sempre disponibile)

Claude scrive script `bpy` e li esegue senza interfaccia. Nessuna GPU: render
di controllo con Workbench o Cycles su CPU (lenti, a bassa risoluzione).

```bash
# Scaricare nello scratchpad della sessione, NON nella repo (≈ 350 MB)
cd "$SCRATCH" && curl -LO https://download.blender.org/release/Blender5.2/blender-5.2.3-linux-x64.tar.xz
tar -xf blender-5.2.3-linux-x64.tar.xz
export BLENDER_BIN="$SCRATCH/blender-5.2.3-linux-x64/blender"
"$BLENDER_BIN" --background --python script.py -- --args
```

- Controlla prima se esiste una 5.2.x più recente in
  https://download.blender.org/release/Blender5.2/ (le skill richiedono 5.2+).
- Il container viene eliminato a fine sessione: sorgenti `.py` e `.blend`
  importanti vanno salvati in `iyokai-next/art/` e committati (i `.blend`
  pesanti solo se necessari; preferire script riproducibili).

### B. Blender sul PC dell'utente (consigliato per scultura e revisione)

Due strade, entrambe richiedono l'utente al computer:

1. **Remote Control**: l'utente condivide una cartella del suo PC con la
   sessione cloud (Claude desktop → Settings → Claude Code → Remote Control,
   oppure `claude remote-control` nella cartella). Claude esegue
   `blender --background --python ...` sul PC, con la sua GPU.
2. **MCP per Blender** (`ahujasid/mcp-for-blender`, MIT, commit `992233b` al
   1/11/2026): addon dentro Blender + server MCP nell'app Claude desktop.
   Claude comanda il Blender aperto e vede la viewport. Installazione
   dell'utente: addon `addon.py` da Blender → Preferences → Add-ons → Install,
   poi server MCP `uvx blender-mcp` nella configurazione di Claude Desktop.
   Leggere il README del progetto prima di installare; non è software ufficiale
   Blender Foundation.

## Pipeline kitsune (skill `blender-image-to-3d` + skill `blender-*`)

Riferimento: `public/cinematic/kitsune.webp` (identità approvata: adulta,
capelli argento, orecchie, maschera laterale bianca/rossa, kimono nero/avorio
ricamato, corde rosse, stivali). Non sostituirla in silenzio.

1. **Reference sheet**: servono almeno fronte, profilo e retro. Se esiste solo
   una vista, tutto il non visto va dichiarato "inferred". Chiedere all'utente
   una turnaround se possibile.
2. **Blockout e proporzioni** (`init_master.py`, render confrontati con la
   reference dalla stessa camera). Nessun dettaglio finché la silhouette non
   passa.
3. **Corpo e volto** (`blender-sculpting`, `blender-retopology-uv`).
4. **Kimono** (`blender-clothing`), **capelli e pelliccia delle code**
   (`blender-hair-grooming`: per il web usare hair cards, non curve).
5. **Look** (`blender-stylized-npr` per lo stile dipinto anime;
   `blender-pbr-materials` per la base). Sul web i materiali vengono ricreati
   in Three.js secondo il Material Language.
6. **Rig** (`blender-character-rigging`): corpo, catena testa/collo per lo
   sguardo verso il mouse, catene per le 9 code; shape key del volto
   (`blender-facial-shapekeys`) per sbattere le palpebre e piccole espressioni.
7. **Animazioni** (`blender-animation`): idle/respiro, camminata, sguardo dentro
   la casa, ingresso, inchino, saluto, posa davanti agli schermi, posa al mixer.
   Loop verificati (`loop_check.py`).
8. **QA ed export** (`blender-asset-qa`, `blender-game-optimization` per i LOD,
   `blender-export-pipelines` → GLB). Poi `optimize-3d-assets`
   (meshopt/Draco + KTX2). Budget web indicativi: desktop ≤ 60k triangoli e
   ≤ 8 MB, mobile ≤ 20k triangoli e ≤ 3 MB.
9. **Approvazione**: render fronte/3⁄4/profilo affiancati alla reference e
   inviati all'utente prima di usarlo nel sito.

## Ambienti

Per ogni sezione un ambiente modulare (`blender-environment-kits`,
`blender-time-of-day`, `blender-lighting-lookdev`):

| Ambiente | Contenuto | Note |
|---|---|---|
| Casa degli Spiriti (home) | sentiero, torii, casa con porta scorrevole, lanterne, ciliegi | porta che si apre per la transizione |
| Sala del suono (music bot) | mixer, microfoni, casse, cavi, tatami, luce calda | zona per l'onda audio reattiva |
| Sala degli schermi (funzionalità) | parete di monitor in cornici di legno laccato | ogni schermo è un piano UV separato: nel sito diventa un elemento vivo e cliccabile |
| Santuario della lore | rotoli, altare, incenso | |

Due modalità di consegna, da decidere per sezione:
- **3D in tempo reale** (GLB leggero + luce cotta / lightmap), oppure
- **render pre-calcolati** (sequenze di immagini o video) usati come fondali
  con profondità, più leggeri e più belli su laptop medi.

## Limiti onesti

- Un personaggio anime di qualità pari alle tavole dipinte, costruito solo via
  script, è difficile: servono molte iterazioni e la revisione dell'utente.
- Nel cloud niente GPU: render lenti; la qualità finale si verifica sul PC
  dell'utente.
- Il prototipo di ottobre (`tools/model/build_kitsune.py`,
  `public/cinematic/kitsune-prototype.glb`) è un punto di partenza tecnico
  (18 ossa, 3 clip), non estetico.
