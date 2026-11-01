#!/bin/bash
# =============================================================================
# iYokai — setup dell'ambiente di lavoro di Claude Code (cloud e locale)
#
#   CLOUD  (setup script dell'ambiente claude.ai/code): incollare l'intero file.
#          Parte una cartella sopra la repo. Installa skill, agenti, design
#          system, Blender 5.2 headless e strumenti glTF.
#   LOCALE (macOS/Linux, Blender aperto sul PC):  bash setup-iyokai.sh --local
#          Installa skill, agenti e il collegamento MCP a Blender
#          (mcp-for-blender), senza scaricare Blender.
#          Windows: usare setup-iyokai-local.ps1.
#
# Regole: non crea progetti, non lancia npm install nella repo, non scrive
# nulla dentro iYokai-Site/ (il sito attuale deve restare intatto).
# Si può rieseguire: salta quello che è già installato.
# =============================================================================
set -u

MODE="cloud"
[ "${1:-}" = "--local" ] && MODE="local"
[ "${1:-}" = "--cloud" ] && MODE="cloud"

SKILLS="$HOME/.claude/skills"
AGENTS="$HOME/.claude/agents"
TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT
FAILED=()
step() { echo; echo "=== $* ==="; }
fail() { echo "!! $*"; FAILED+=("$*"); }

# Versioni fissate (controllate il 1/11/2026). Aggiornare solo dopo verifica.
PIN_3DWEB=cabd221        # skinnye/3d-web-pack            (MIT)
PIN_AWWWARDS=4546147     # owenisas/awwwards-web-design   (MIT)
PIN_ANTHROPIC=ca45fc4    # anthropics/skills              (Apache-2.0 per queste skill)
PIN_BLENDER_SKILLS=fb92cfb  # EL4CTEO/blender-skills      (MIT)
PIN_IMAGE_TO_3D=f0ef293     # majidmanzarpour/blender-game-skills (MIT)
BLENDER_VER=5.2.3

echo "=== Setup iYokai — modalità: $MODE ==="

# -----------------------------------------------------------------------------
# 1. Strumenti di base (solo se mancano)
# -----------------------------------------------------------------------------
step "1. Strumenti di base"
if [ "$MODE" = "cloud" ]; then
  NEED=()
  for c in curl git unzip xz; do command -v "$c" >/dev/null || NEED+=("$c"); done
  if [ ${#NEED[@]} -gt 0 ]; then
    apt-get update -y >/dev/null && apt-get install -y curl git unzip xz-utils >/dev/null || fail "apt-get"
  fi
  NODE_MAJOR=$(node -v 2>/dev/null | sed 's/v\([0-9]*\).*/\1/')
  if [ -z "$NODE_MAJOR" ] || [ "$NODE_MAJOR" -lt 22 ]; then
    curl -fsSL https://deb.nodesource.com/setup_22.x | bash - >/dev/null && apt-get install -y nodejs >/dev/null || fail "Node.js 22"
  fi
fi
for c in git node npm; do command -v "$c" >/dev/null || fail "manca $c (installarlo e rieseguire)"; done
echo "Node: $(node -v 2>/dev/null) | npm: $(npm -v 2>/dev/null)"

# -----------------------------------------------------------------------------
# 2. Skill e agenti in Claude Code (livello utente, mai nella repo)
# -----------------------------------------------------------------------------
step "2. Skill e agenti"
mkdir -p "$SKILLS" "$AGENTS"
fetch() { # repo commit dir
  git clone -q "https://github.com/$1" "$TMP/$3" && git -C "$TMP/$3" checkout -q "$2"
}
put() { # sorgente -> ~/.claude/skills/<nome> (sostituisce la versione vecchia)
  local name; name="$(basename "$1")"
  rm -rf "${SKILLS:?}/${name:?}" && cp -r "$1" "$SKILLS/"
}

if fetch skinnye/3d-web-pack "$PIN_3DWEB" web3d; then
  for s in "$TMP"/web3d/skills/*/; do put "${s%/}"; cp "$TMP/web3d/LICENSE" "$SKILLS/$(basename "$s")/LICENSE"; done
  cp "$TMP"/web3d/agents/*.md "$AGENTS/" 2>/dev/null || true
else fail "3d-web-pack"; fi

if fetch owenisas/awwwards-web-design "$PIN_AWWWARDS" aww; then
  put "$TMP/aww/skills/awwwards-web-design"
  cp "$TMP/aww/LICENSE" "$TMP/aww/NOTICE.md" "$SKILLS/awwwards-web-design/" 2>/dev/null || true
else fail "awwwards-web-design"; fi

if fetch anthropics/skills "$PIN_ANTHROPIC" anth; then
  for s in frontend-design web-artifacts-builder; do put "$TMP/anth/skills/$s"; done
else fail "anthropics/skills"; fi

if fetch EL4CTEO/blender-skills "$PIN_BLENDER_SKILLS" bsk; then
  for s in "$TMP"/bsk/skills/*/; do put "${s%/}"; cp "$TMP/bsk/LICENSE" "$SKILLS/$(basename "$s")/LICENSE"; done
else fail "blender-skills"; fi

if fetch majidmanzarpour/blender-game-skills "$PIN_IMAGE_TO_3D" i23; then
  put "$TMP/i23/skills/blender-image-to-3d"
  cp "$TMP/i23/LICENSE" "$SKILLS/blender-image-to-3d/LICENSE"
else fail "blender-image-to-3d"; fi
echo "Skill installate: $(ls "$SKILLS" | wc -l) | agenti: $(ls "$AGENTS" | wc -l)"

# -----------------------------------------------------------------------------
# 3. Design system (solo cloud: in locale vale iyokai-next/CLAUDE.md della repo)
#    Scritto una cartella sopra la repo, come nello script originale.
# -----------------------------------------------------------------------------
if [ "$MODE" = "cloud" ]; then
step "3. Design system"
cat > CLAUDE.md << 'EOF'
# iYokai — Awwwards Level Project

> Vale solo per il SITO iYokai. Per altri lavori (es. il bot Discord) ignoralo.
> Prima di lavorare al sito leggi `iYokai-Site/iyokai-next/CLAUDE.md`:
> si lavora SOLO dentro `iyokai-next/`, la sorgente attuale non si tocca mai.

## 1. Identità & Atmosfera
Sito immersivo, dark, mysterious, ethereal, elegante.
Tema: Japanese yokai / kitsune spiriti.
Sensazione: silenzio, profondità, presenza spirituale, lusso quieto.
Vietato: neon, cute, chibi, kawaii, purple generico, Inter, layout centrati banali, gradienti viola, card generiche.

## 2. Palette ufficiale (Token)

### Core
- void: #07070b          → Background primario, profondità
- cinnabar: #C24A3A      → Accent primario, energia controllata
- orchid: #9B4D7A        → Accent secondario (uso raro e deliberato)
- pale-ink: #C8C4BC      → Testo primario
- mist: #8A8680          → Testo secondario
- ash: #2A2928           → Surface / card / pannelli

### Utilizzo
- Background sempre void o quasi.
- Cinnabar solo per momenti importanti (CTA, highlight, focus).
- Orchid massimo 5-8% dell'interfaccia.
- Mai usare bianco puro.

## 3. Tipografia
- Display: serif elegante o grotesk ad alto contrasto (es. "Instrument Serif", "PP Editorial New", "Playfair Display")
- Body: sans-serif neutra e leggibile (es. "Satoshi", "Inter" vietato → preferire "Geist", "Söhne", "Neue Montreal")
- Accento calligrafico: font originale Yokai Fude (già nella repo), solo capilettera e sigilli
- Scale fluid obbligatoria con clamp()
- Letter-spacing leggermente negativo sui titoli grandi (-0.02em / -0.03em)
- Line-height generosa sui testi lunghi (1.6–1.75)

## 4. Motion System (molto importante)

### Easing
- Primary: cubic-bezier(0.16, 1, 0.3, 1)     → elegante e deciso
- Soft: cubic-bezier(0.22, 1, 0.36, 1)
- Dramatic: cubic-bezier(0.7, 0, 0.3, 1)

### Durate
- Micro: 0.3–0.45s
- Standard: 0.6–0.9s
- Cinematic: 1.2–1.8s
- Scroll scrub: molto fluido, mai nervoso

### Scroll
- Usare sempre Lenis
- GSAP ScrollTrigger con scrub: true (valori 0.8–1.5)
- Navigazione a scatti: un gesto di scroll = una sezione, con animazione completa
- Camera movement deve sembrare "pesante" e deliberato, mai fluttuante a caso
- Pinning delle sezioni chiave

### 3D Materials Language
- Preferire MeshPhysicalMaterial
- Transmission + thickness per elementi spiritici
- Iridescence controllata e sottile
- Roughness bassa-media (0.15–0.45)
- Emissive molto debole e calda (cinnabar / orchid a bassa intensità)
- Evitare materiali troppo "plastica lucida" o troppo opachi

## 5. Layout & Spacing
- Ritmo verticale forte (sezioni alte, respiro generoso)
- Asimmetria controllata
- Margini laterali generosi su desktop
- Evitare griglie troppo regolari e simmetriche

## 6. Performance Rules
- Target 60fps su laptop medi
- Adaptive quality / LOD
- prefers-reduced-motion deve essere rispettato
- Mobile: versione alleggerita (meno geometria, niente post-processing pesante)
- Asset 3D: GLB compressi (meshopt/Draco, texture WebP/KTX2); desktop ≤ 60k triangoli, mobile ≤ 20k

## 7. Stack tecnico
- Il sito è Vite + JavaScript vanilla + Three.js + GSAP + Lenis (NON React).
  Skill e agenti pensati per React Three Fiber: usarne solo i principi.
- 3D da Blender 5.2: export GLB, poi ottimizzazione (gltf-transform / gltfpack).

## 8. Come lavorare
1. Prima di generare qualsiasi codice, consulta questo documento e `iyokai-next/CLAUDE.md`.
2. Skill da preferire: awwwards-web-design, scroll-3d-scene, add-postprocessing,
   optimize-3d-assets, frontend-design; per il 3D blender-core (punto di partenza),
   blender-image-to-3d e le altre blender-*.
3. Costruisci sezione per sezione.
4. Ogni elemento 3D deve rispettare il Material Language sopra.
5. Ogni animazione deve rispettare i Motion Tokens.
6. Nessuna modifica fuori da `iyokai-next/`.
EOF
echo "CLAUDE.md scritto in $(pwd)"
fi

# -----------------------------------------------------------------------------
# 4. Strumenti per asset 3D web (gltf-transform, gltfpack)
# -----------------------------------------------------------------------------
step "4. Strumenti glTF"
if ! command -v gltf-transform >/dev/null || ! command -v gltfpack >/dev/null; then
  npm install -g @gltf-transform/cli gltfpack >/dev/null 2>&1 || fail "gltf-transform/gltfpack (npm -g)"
fi
command -v gltf-transform >/dev/null && echo "gltf-transform ok"
command -v gltfpack >/dev/null && echo "gltfpack ok"

# -----------------------------------------------------------------------------
# 5. Blender
#    cloud : Blender headless in /opt (niente interfaccia, niente GPU)
#    locale: si usa il Blender già installato e aperto, collegato via MCP
# -----------------------------------------------------------------------------
step "5. Blender"
if [ "$MODE" = "cloud" ]; then
  if ! command -v blender >/dev/null; then
    URL="https://download.blender.org/release/Blender${BLENDER_VER%.*}/blender-$BLENDER_VER-linux-x64.tar.xz"
    if curl -fsSL "$URL" -o "$TMP/blender.tar.xz" && tar -xf "$TMP/blender.tar.xz" -C /opt; then
      ln -sf "/opt/blender-$BLENDER_VER-linux-x64/blender" /usr/local/bin/blender
    else fail "download Blender $BLENDER_VER"; fi
  fi
  blender --version 2>/dev/null | head -1
else
  # uv serve per avviare il server MCP
  if ! command -v uvx >/dev/null; then
    curl -LsSf https://astral.sh/uv/install.sh | sh >/dev/null || fail "uv"
    export PATH="$HOME/.local/bin:$PATH"
  fi
  # Addon dentro Blender (va poi abilitato e avviato dall'interfaccia)
  uvx mcp-for-blender install-addon || fail "addon mcp-for-blender (installarlo da Blender: Preferences → Add-ons)"
  # Server MCP registrato in Claude Code per tutti i progetti, telemetria spenta
  if command -v claude >/dev/null; then
    claude mcp get blender >/dev/null 2>&1 || \
      claude mcp add --scope user blender -e DISABLE_TELEMETRY=true -- uvx mcp-for-blender || fail "claude mcp add blender"
  else
    fail "Claude Code (comando claude) non trovato: installarlo e rieseguire"
  fi
  command -v blender >/dev/null && blender --version 2>/dev/null | head -1 || \
    echo "Blender non è nel PATH: va bene se lo usi via MCP. Per gli script headless aggiungilo al PATH."
fi

# -----------------------------------------------------------------------------
# Riepilogo
# -----------------------------------------------------------------------------
step "Riepilogo"
echo "Skill:   $(ls "$SKILLS" | grep -c . ) in $SKILLS"
echo "Agenti:  $(ls "$AGENTS" | grep -c . ) in $AGENTS"
if [ "$MODE" = "local" ]; then
  echo "Blender: apri Blender → premi N nella viewport → scheda 'MCP for Blender' → Start MCP Server."
  echo "         Poi riavvia Claude Code: lo strumento 'blender' sarà disponibile."
fi
if [ ${#FAILED[@]} -gt 0 ]; then
  echo "Passaggi NON riusciti:"; printf ' - %s\n' "${FAILED[@]}"
  exit 1
fi
echo "=== SETUP COMPLETATO ==="
