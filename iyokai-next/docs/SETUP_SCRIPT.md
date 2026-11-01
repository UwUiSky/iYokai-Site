# Setup dell'ambiente di lavoro

Due scenari, stesso risultato: skill, agenti e strumenti pronti, senza mai
scrivere nella repo.

## Cloud (claude.ai/code)

La macchina cloud viene ricreata a ogni sessione. Incolla **l'intero contenuto**
di `tools/setup-iyokai.sh` nello **Setup script** dell'ambiente (menu
dell'ambiente nella barra del titolo della sessione → Edit → Setup script).
È autonomo: non dipende dal branch della repo.

Installa:
- 36 skill e 6 agenti in `~/.claude` (versioni fisse e controllate);
- il design system come `CLAUDE.md` una cartella sopra la repo (valido solo
  per il sito: dice di ignorarlo per il bot);
- `gltf-transform` e `gltfpack` per ottimizzare i modelli;
- Blender 5.2.3 headless in `/opt` (circa 350 MB, solo se manca).

Collaudato il 1/11/2026: completato senza errori.

## Locale, con il tuo Blender aperto

Requisiti: Git, Node.js 22+, Claude Code, Blender 5.2+.

- macOS/Linux: `bash iyokai-next/tools/setup-iyokai.sh --local`
- Windows: `powershell -ExecutionPolicy Bypass -File iyokai-next\tools\setup-iyokai-local.ps1`

Installa le stesse skill e agenti, gli strumenti glTF, `uv`, l'addon
**MCP for Blender** e registra in Claude Code il server `blender` (telemetria
spenta). Poi: apri Blender → `N` nella viewport → scheda **MCP for Blender** →
**Start MCP Server**, e riavvia Claude Code.

Non ancora provato sul tuo PC: segnala eventuali errori, il riepilogo finale
elenca i passaggi non riusciti.

## Cloud che usa il Blender del PC

Una sessione cloud non vede il Blender aperto sul tuo PC via MCP. Per farla
lavorare sul PC si usa **Remote Control** (Claude desktop → Settings → Claude
Code → Remote Control): la sessione esegue i comandi in una cartella del PC,
incluso `blender --background`.
