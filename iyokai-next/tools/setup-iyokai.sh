#!/bin/bash
# =============================================================================
# iYokai — setup completo dell'ambiente Claude Code (Awwwards stack + Blender)
#
#   CLOUD  (lavoro da telefono, claude.ai/code): incollare TUTTO il file nello
#          Setup script dell'ambiente. Parte una cartella sopra la repo.
#   LOCALE macOS/Linux:  bash setup-iyokai.sh --local
#   LOCALE Windows:      usare setup-iyokai-local.ps1
#
# Prepara:
#   1. strumenti di base (Node 22, git, curl, xz)
#   2. progetto pronto "iyokai-stack" ACCANTO alla repo (non dentro):
#      Vite + React 19 + TypeScript + Tailwind 4 + Three/R3F/drei/postprocessing
#      + GSAP + Lenis + Motion + Zustand + Leva + Theatre.js + font
#   3. skill e agenti in ~/.claude (3d-web-pack, awwwards, Anthropic, Blender)
#   4. design system (CLAUDE.md)
#   5. strumenti glTF (gltf-transform, gltfpack)
#   6. Blender: cloud = 5.2.3 headless; locale = addon + server MCP verso il
#      Blender aperto sul PC
#
# Non scrive nulla dentro iYokai-Site/ (il sito attuale resta intatto).
# Si può rieseguire: salta ciò che è già pronto.
# =============================================================================
set -u

MODE="cloud"
[ "${1:-}" = "--local" ] && MODE="local"
[ "${1:-}" = "--cloud" ] && MODE="cloud"

BASE="$(pwd)"                         # cloud: cartella sopra la repo
[ "$MODE" = "local" ] && BASE="$HOME"
STACK="$BASE/iyokai-stack"
SKILLS="$HOME/.claude/skills"
AGENTS="$HOME/.claude/agents"
TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT
FAILED=()
step() { echo; echo "=== $* ==="; }
fail() { echo "!! $*"; FAILED+=("$*"); }

# Versioni fissate e collaudate insieme il 1/11/2026 (build riuscita).
PIN_3DWEB=cabd221           # skinnye/3d-web-pack                (MIT)
PIN_AWWWARDS=4546147        # owenisas/awwwards-web-design       (MIT)
PIN_ANTHROPIC=ca45fc4       # anthropics/skills                  (Apache-2.0)
PIN_BLENDER_SKILLS=fb92cfb  # EL4CTEO/blender-skills             (MIT)
PIN_IMAGE_TO_3D=f0ef293     # majidmanzarpour/blender-game-skills (MIT)
BLENDER_VER=5.2.3
# three resta a 0.186: postprocessing 6.x non supporta ancora 0.187.
# @theatre/r3f è escluso: richiede React 18 / R3F 8 (si usa @theatre/core).
DEPS="react@^19 react-dom@^19 three@~0.186.1 @react-three/fiber@^9 @react-three/drei@^10 \
@react-three/postprocessing@^3 postprocessing@^6 gsap@^3 @gsap/react@^2 lenis@^1 motion@^14 \
zustand@^5 leva@^0.10 @theatre/core@^0.7 @theatre/studio@^0.7 \
clsx@^2 tailwind-merge@^3 class-variance-authority@^0.7 \
@fontsource-variable/geist @fontsource/instrument-serif"
DEV_DEPS="@types/three@~0.186.0 tailwindcss@^4 @tailwindcss/vite@^4"

echo "=== Setup iYokai — modalità: $MODE ==="

# -----------------------------------------------------------------------------
step "1. Strumenti di base"
# -----------------------------------------------------------------------------
if [ "$MODE" = "cloud" ]; then
  NEED=0
  for c in curl git unzip xz; do command -v "$c" >/dev/null || NEED=1; done
  if [ $NEED = 1 ]; then
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
step "2. Progetto pronto: $STACK"
# -----------------------------------------------------------------------------
if [ ! -f "$STACK/package.json" ]; then
  (cd "$BASE" && npm create vite@latest iyokai-stack -- --template react-ts --no-interactive >/dev/null 2>&1) \
    || fail "npm create vite"
fi
if [ -f "$STACK/package.json" ]; then
  cd "$STACK"
  # shellcheck disable=SC2086
  npm install --no-audit --no-fund $DEPS >/dev/null 2>&1 || fail "dipendenze del progetto"
  # shellcheck disable=SC2086
  npm install -D --no-audit --no-fund $DEV_DEPS >/dev/null 2>&1 || fail "dipendenze di sviluppo"

  cat > vite.config.ts << 'EOF'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
})
EOF

  # Tailwind 4: i token si definiscono in CSS con @theme (niente tailwind.config.js)
  cat > src/index.css << 'EOF'
@import "tailwindcss";
@import "@fontsource-variable/geist";
@import "@fontsource/instrument-serif";

@theme {
  /* Palette iYokai */
  --color-void: #07070b;
  --color-cinnabar: #C24A3A;
  --color-orchid: #9B4D7A;
  --color-pale-ink: #C8C4BC;
  --color-mist: #8A8680;
  --color-ash: #2A2928;

  /* Tipografia */
  --font-display: "Instrument Serif", ui-serif, Georgia, serif;
  --font-sans: "Geist Variable", ui-sans-serif, system-ui, sans-serif;
  --text-mega: clamp(4rem, 14vw, 13rem);
  --text-h1: clamp(2.75rem, 7vw, 6.5rem);
  --text-h2: clamp(2rem, 4.5vw, 4rem);
  --text-lead: clamp(1.125rem, 1.6vw, 1.5rem);
  --text-body: clamp(1rem, 1.05vw, 1.125rem);
  --tracking-display: -0.03em;

  /* Motion */
  --ease-primary: cubic-bezier(0.16, 1, 0.3, 1);
  --ease-soft: cubic-bezier(0.22, 1, 0.36, 1);
  --ease-dramatic: cubic-bezier(0.7, 0, 0.3, 1);
}

html { background: var(--color-void); color: var(--color-pale-ink); }
body { font-family: var(--font-sans); line-height: 1.65; }

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after { animation-duration: .01ms !important; transition-duration: .01ms !important; }
}
EOF

  mkdir -p src/lib
  cat > src/lib/motion.ts << 'EOF'
// Motion tokens iYokai (stessi valori di index.css)
export const ease = {
  primary: 'cubic-bezier(0.16, 1, 0.3, 1)',
  soft: 'cubic-bezier(0.22, 1, 0.36, 1)',
  dramatic: 'cubic-bezier(0.7, 0, 0.3, 1)',
} as const
export const dur = { micro: 0.38, std: 0.75, cine: 1.5 } as const // secondi
export const scrub = { light: 0.8, base: 1.2, heavy: 1.5 } as const
export const reducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
EOF
  cat > src/lib/cn.ts << 'EOF'
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
export const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs))
EOF
  cat > src/App.tsx << 'EOF'
import { ReactLenis } from 'lenis/react'

export default function App() {
  return (
    <ReactLenis root>
      <main className="min-h-dvh bg-void px-6 py-24 md:px-24">
        <h1 className="font-display text-[length:var(--text-mega)] leading-none tracking-[var(--tracking-display)]">
          iYokai
        </h1>
        <p className="mt-6 max-w-[38ch] text-mist">Stack pronto.</p>
      </main>
    </ReactLenis>
  )
}
EOF
  rm -f src/App.css
  npm run build >/dev/null 2>&1 && echo "Build di prova riuscita" || fail "build di prova di iyokai-stack"
  cd "$BASE"
fi

# -----------------------------------------------------------------------------
step "3. Skill e agenti"
# -----------------------------------------------------------------------------
mkdir -p "$SKILLS" "$AGENTS"
fetch() { git clone -q "https://github.com/$1" "$TMP/$3" && git -C "$TMP/$3" checkout -q "$2"; }
put() { local name; name="$(basename "$1")"; rm -rf "${SKILLS:?}/${name:?}" && cp -r "$1" "$SKILLS/"; }

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
  put "$TMP/i23/skills/blender-image-to-3d"; cp "$TMP/i23/LICENSE" "$SKILLS/blender-image-to-3d/LICENSE"
else fail "blender-image-to-3d"; fi
echo "Skill: $(ls "$SKILLS" | wc -l) | agenti: $(ls "$AGENTS" | wc -l)"

# -----------------------------------------------------------------------------
step "4. Design system (CLAUDE.md)"
# -----------------------------------------------------------------------------
# Cloud: una cartella sopra la repo (vale per la repo). Locale: dentro iyokai-stack.
DS="$BASE/CLAUDE.md"; [ "$MODE" = "local" ] && DS="$STACK/CLAUDE.md"
cat > "$DS" << 'EOF'
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
- In Tailwind: classi bg-void, text-pale-ink, text-mist, bg-ash, bg-cinnabar, text-orchid (token in src/index.css, @theme).

## 3. Tipografia
- Display: serif elegante o grotesk ad alto contrasto (es. "Instrument Serif", "PP Editorial New", "Playfair Display")
- Body: sans-serif neutra e leggibile (es. "Satoshi", "Inter" vietato → preferire "Geist", "Söhne", "Neue Montreal")
- Default dello stack: Instrument Serif (font-display) + Geist (font-sans)
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
- Token in src/lib/motion.ts (ease, dur, scrub)

### Scroll
- Usare sempre Lenis (lenis/react, ReactLenis root)
- GSAP ScrollTrigger con scrub: true (valori 0.8–1.5), via @gsap/react (useGSAP)
- Navigazione a scatti: un gesto di scroll = una sezione, con animazione completa
- Camera movement deve sembrare "pesante" e deliberato, mai fluttuante a caso
- Pinning delle sezioni chiave

### 3D Materials Language
- Preferire MeshPhysicalMaterial (o MeshTransmissionMaterial di drei per gli spiriti)
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
- Adaptive quality / LOD (drei: PerformanceMonitor, AdaptiveDpr, Detailed)
- prefers-reduced-motion deve essere rispettato
- Mobile: versione alleggerita (meno geometria, niente post-processing pesante)
- Asset 3D: GLB compressi (meshopt/Draco, texture WebP/KTX2); desktop ≤ 60k triangoli, mobile ≤ 20k

## 7. Stack tecnico
- Vite + React 19 + TypeScript + Tailwind 4 (@tailwindcss/vite, token con @theme)
- 3D: three 0.186 + @react-three/fiber 9 + drei 10 + @react-three/postprocessing 3
- Motion: GSAP 3 + @gsap/react, Lenis, Motion (motion/react) per micro-interazioni UI
- Stato: Zustand. Debug/tuning: Leva (solo sviluppo). Regia camera/sequenze: Theatre.js
  (@theatre/core + @theatre/studio solo in sviluppo; @theatre/r3f non compatibile con R3F 9)
- UI: clsx + tailwind-merge (cn) + class-variance-authority
- Progetto base pronto in `iyokai-stack/` accanto alla repo: si copia in `iyokai-next/site/`
- 3D da Blender 5.2: export GLB, poi gltf-transform / gltfpack

## 8. Come lavorare
1. Prima di generare qualsiasi codice, consulta questo documento e `iyokai-next/CLAUDE.md`.
2. Preferisci le skill installate (soprattutto 3d-web-pack e awwwards-web-design):
   scaffold-3d-site, scroll-3d-scene, add-postprocessing, optimize-3d-assets,
   frontend-design; per il 3D blender-core (punto di partenza), blender-image-to-3d e le altre blender-*.
3. Costruisci sezione per sezione.
4. Ogni elemento 3D deve rispettare il Material Language sopra.
5. Ogni animazione deve rispettare i Motion Tokens.
6. Nessuna modifica fuori da `iyokai-next/`.
EOF
echo "CLAUDE.md scritto in $DS"

# -----------------------------------------------------------------------------
step "5. Strumenti glTF"
# -----------------------------------------------------------------------------
if ! command -v gltf-transform >/dev/null || ! command -v gltfpack >/dev/null; then
  npm install -g @gltf-transform/cli gltfpack >/dev/null 2>&1 || fail "gltf-transform/gltfpack (npm -g)"
fi
command -v gltf-transform >/dev/null && echo "gltf-transform ok"
command -v gltfpack >/dev/null && echo "gltfpack ok"

# -----------------------------------------------------------------------------
step "6. Blender"
# -----------------------------------------------------------------------------
if [ "$MODE" = "cloud" ]; then
  if ! command -v blender >/dev/null; then
    URL="https://download.blender.org/release/Blender${BLENDER_VER%.*}/blender-$BLENDER_VER-linux-x64.tar.xz"
    if curl -fsSL "$URL" -o "$TMP/blender.tar.xz" && tar -xf "$TMP/blender.tar.xz" -C /opt; then
      ln -sf "/opt/blender-$BLENDER_VER-linux-x64/blender" /usr/local/bin/blender
    else fail "download Blender $BLENDER_VER"; fi
  fi
  blender --version 2>/dev/null | head -1
else
  if ! command -v uvx >/dev/null; then
    curl -LsSf https://astral.sh/uv/install.sh | sh >/dev/null || fail "uv"
    export PATH="$HOME/.local/bin:$PATH"
  fi
  uvx mcp-for-blender install-addon || fail "addon mcp-for-blender (installarlo da Blender: Preferences → Add-ons)"
  if command -v claude >/dev/null; then
    claude mcp get blender >/dev/null 2>&1 || \
      claude mcp add --scope user blender -e DISABLE_TELEMETRY=true -- uvx mcp-for-blender || fail "claude mcp add blender"
  else
    fail "Claude Code (comando claude) non trovato: installarlo e rieseguire"
  fi
  command -v blender >/dev/null && blender --version 2>/dev/null | head -1 || \
    echo "Blender non è nel PATH: va bene via MCP; per gli script headless aggiungilo al PATH."
fi

# -----------------------------------------------------------------------------
step "Riepilogo"
# -----------------------------------------------------------------------------
echo "Progetto: $STACK"
echo "Skill:    $(ls "$SKILLS" | grep -c .) in $SKILLS"
echo "Agenti:   $(ls "$AGENTS" | grep -c .) in $AGENTS"
if [ "$MODE" = "local" ]; then
  echo "Blender:  apri Blender → N nella viewport → scheda 'MCP for Blender' → Start MCP Server,"
  echo "          poi riavvia Claude Code: lo strumento 'blender' sarà disponibile."
fi
if [ ${#FAILED[@]} -gt 0 ]; then
  echo "Passaggi NON riusciti:"; printf ' - %s\n' "${FAILED[@]}"
  exit 1
fi
echo "=== SETUP COMPLETATO ==="
