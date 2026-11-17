# =============================================================================
# iYokai — setup completo su PC Windows (Claude Code + Blender aperto)
#   powershell -ExecutionPolicy Bypass -File setup-iyokai-local.ps1
#
# Prepara:
#   1. requisiti (Git, Node 22+, Claude Code; uv installato se manca)
#   2. progetto pronto %USERPROFILE%\iyokai-stack (NON dentro la repo):
#      Vite + React 19 + TypeScript + Tailwind 4 + Three/R3F/drei/postprocessing
#      + GSAP + Lenis + Motion + Zustand + Leva + Theatre.js + font
#   3. skill e agenti in %USERPROFILE%\.claude
#   4. design system (iyokai-stack\CLAUDE.md)
#   5. strumenti glTF (gltf-transform, gltfpack)
#   6. Blender collegato via MCP (addon + server "blender" in Claude Code)
# Non scrive nulla dentro la repo iYokai-Site. Si può rieseguire.
# =============================================================================
$ErrorActionPreference = "Continue"
$Stack  = Join-Path $HOME "iyokai-stack"
$Skills = Join-Path $HOME ".claude\skills"
$Agents = Join-Path $HOME ".claude\agents"
$Tmp    = Join-Path $env:TEMP ("iyokai-setup-" + [guid]::NewGuid())
$Failed = @()
New-Item -ItemType Directory -Force -Path $Skills, $Agents, $Tmp | Out-Null
function Step($t) { Write-Host ""; Write-Host "=== $t ===" }
function Write-Utf8($path, $text) { [IO.File]::WriteAllText($path, $text, (New-Object Text.UTF8Encoding $false)) }

# Versioni fissate e collaudate insieme il 1/11/2026
$Deps = @("react@^19","react-dom@^19","three@~0.186.1","@react-three/fiber@^9","@react-three/drei@^10",
  "@react-three/postprocessing@^3","postprocessing@^6","gsap@^3","@gsap/react@^2","lenis@^1","motion@^14",
  "zustand@^5","leva@^0.10","@theatre/core@^0.7","@theatre/studio@^0.7",
  "clsx@^2","tailwind-merge@^3","class-variance-authority@^0.7",
  "@fontsource-variable/geist","@fontsource/instrument-serif")
$DevDeps = @("@types/three@~0.186.0","tailwindcss@^4","@tailwindcss/vite@^4")

# ---------------------------------------------------------------------------
Step "1. Requisiti"
foreach ($c in "git","node","npm","claude") {
  if (-not (Get-Command $c -ErrorAction SilentlyContinue)) { $Failed += "manca $c (installarlo e rieseguire)" }
}
Write-Host ("Node: " + (node -v) + " | npm: " + (npm -v))

# ---------------------------------------------------------------------------
Step "2. Progetto pronto: $Stack"
if (-not (Test-Path (Join-Path $Stack "package.json"))) {
  Push-Location $HOME
  npm create vite@latest iyokai-stack -- --template react-ts --no-interactive | Out-Null
  if ($LASTEXITCODE -ne 0) { $Failed += "npm create vite" }
  Pop-Location
}
if (Test-Path (Join-Path $Stack "package.json")) {
  Push-Location $Stack
  npm install --no-audit --no-fund @Deps | Out-Null
  if ($LASTEXITCODE -ne 0) { $Failed += "dipendenze del progetto" }
  npm install -D --no-audit --no-fund @DevDeps | Out-Null
  if ($LASTEXITCODE -ne 0) { $Failed += "dipendenze di sviluppo" }

  Write-Utf8 (Join-Path $Stack "vite.config.ts") @'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
})
'@

  Write-Utf8 (Join-Path $Stack "src\index.css") @'
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
'@

  New-Item -ItemType Directory -Force -Path (Join-Path $Stack "src\lib") | Out-Null
  Write-Utf8 (Join-Path $Stack "src\lib\motion.ts") @'
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
'@
  Write-Utf8 (Join-Path $Stack "src\lib\cn.ts") @'
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
export const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs))
'@
  Write-Utf8 (Join-Path $Stack "src\App.tsx") @'
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
'@
  Remove-Item (Join-Path $Stack "src\App.css") -ErrorAction SilentlyContinue
  npm run build | Out-Null
  if ($LASTEXITCODE -eq 0) { Write-Host "Build di prova riuscita" } else { $Failed += "build di prova di iyokai-stack" }
  Pop-Location
}

# ---------------------------------------------------------------------------
Step "3. Skill e agenti"
function Fetch($repo, $commit, $dir) {
  git clone -q "https://github.com/$repo" (Join-Path $Tmp $dir)
  if ($LASTEXITCODE -ne 0) { return $false }
  git -C (Join-Path $Tmp $dir) checkout -q $commit
  return ($LASTEXITCODE -eq 0)
}
function Put($src) {
  $dest = Join-Path $Skills (Split-Path $src -Leaf)
  if (Test-Path $dest) { Remove-Item -Recurse -Force $dest }
  Copy-Item -Recurse $src $dest
}
if (Fetch "skinnye/3d-web-pack" "cabd221" "web3d") {
  Get-ChildItem (Join-Path $Tmp "web3d\skills") -Directory | ForEach-Object {
    Put $_.FullName; Copy-Item (Join-Path $Tmp "web3d\LICENSE") (Join-Path $Skills $_.Name) }
  Copy-Item (Join-Path $Tmp "web3d\agents\*.md") $Agents -ErrorAction SilentlyContinue
} else { $Failed += "3d-web-pack" }
if (Fetch "owenisas/awwwards-web-design" "4546147" "aww") {
  Put (Join-Path $Tmp "aww\skills\awwwards-web-design")
  Copy-Item (Join-Path $Tmp "aww\LICENSE"), (Join-Path $Tmp "aww\NOTICE.md") (Join-Path $Skills "awwwards-web-design")
} else { $Failed += "awwwards-web-design" }
if (Fetch "anthropics/skills" "ca45fc4" "anth") {
  foreach ($s in "frontend-design","web-artifacts-builder") { Put (Join-Path $Tmp "anth\skills\$s") }
} else { $Failed += "anthropics/skills" }
if (Fetch "EL4CTEO/blender-skills" "fb92cfb" "bsk") {
  Get-ChildItem (Join-Path $Tmp "bsk\skills") -Directory | ForEach-Object {
    Put $_.FullName; Copy-Item (Join-Path $Tmp "bsk\LICENSE") (Join-Path $Skills $_.Name) }
} else { $Failed += "blender-skills" }
if (Fetch "majidmanzarpour/blender-game-skills" "f0ef293" "i23") {
  Put (Join-Path $Tmp "i23\skills\blender-image-to-3d")
  Copy-Item (Join-Path $Tmp "i23\LICENSE") (Join-Path $Skills "blender-image-to-3d")
} else { $Failed += "blender-image-to-3d" }
Write-Host ("Skill: " + (Get-ChildItem $Skills -Directory).Count + " | agenti: " + (Get-ChildItem $Agents -File).Count)

# ---------------------------------------------------------------------------
Step "4. Design system"
if (Test-Path $Stack) {
Write-Utf8 (Join-Path $Stack "CLAUDE.md") @'
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
- void: #07070b → Background primario
- cinnabar: #C24A3A → Accent primario (CTA, highlight, focus)
- orchid: #9B4D7A → Accent secondario (max 5-8%)
- pale-ink: #C8C4BC → Testo primario
- mist: #8A8680 → Testo secondario
- ash: #2A2928 → Surface / pannelli
Mai bianco puro. Classi Tailwind: bg-void, text-pale-ink, text-mist, bg-ash, bg-cinnabar, text-orchid.

## 3. Tipografia
- Display: Instrument Serif (o PP Editorial New / Playfair Display); Body: Geist (o Söhne / Neue Montreal). Inter vietato.
- Accento calligrafico: Yokai Fude (nella repo), solo capilettera e sigilli
- clamp() obbligatorio; tracking titoli -0.02/-0.03em; line-height testi lunghi 1.6–1.75

## 4. Motion System
- Easing: primary cubic-bezier(0.16,1,0.3,1) · soft (0.22,1,0.36,1) · dramatic (0.7,0,0.3,1)
- Durate: micro 0.3–0.45s · standard 0.6–0.9s · cinematic 1.2–1.8s (token in src/lib/motion.ts)
- Lenis sempre (ReactLenis root); GSAP ScrollTrigger scrub 0.8–1.5 via @gsap/react
- Navigazione a scatti: un gesto di scroll = una sezione; pinning delle sezioni chiave
- Camera pesante e deliberata, mai fluttuante

## 5. 3D Materials Language
- MeshPhysicalMaterial / MeshTransmissionMaterial; transmission + thickness per gli spiriti
- Iridescence sottile; roughness 0.15–0.45; emissive debole e calda (cinnabar/orchid)

## 6. Layout & Performance
- Sezioni alte, asimmetria controllata, margini generosi, niente griglie regolari
- 60fps su laptop medi; adaptive quality/LOD; prefers-reduced-motion; mobile leggero
- GLB compressi (meshopt/Draco, WebP/KTX2); desktop ≤ 60k triangoli, mobile ≤ 20k

## 7. Stack tecnico
- Vite + React 19 + TypeScript + Tailwind 4 (@theme in src/index.css)
- three 0.186 + R3F 9 + drei 10 + @react-three/postprocessing 3
- GSAP + @gsap/react, Lenis, Motion; Zustand; Leva (sviluppo); Theatre.js (@theatre/core, studio in sviluppo)
- clsx + tailwind-merge (cn) + class-variance-authority
- Blender 5.2 → GLB → gltf-transform / gltfpack; Blender aperto collegato via MCP ("blender")

## 8. Come lavorare
1. Consulta questo documento e `iyokai-next/CLAUDE.md` prima di scrivere codice.
2. Usa le skill installate (3d-web-pack, awwwards-web-design, blender-core e blender-*).
3. Sezione per sezione; Material Language e Motion Tokens sempre rispettati.
4. Nessuna modifica fuori da `iyokai-next/`.
'@
Write-Host "CLAUDE.md scritto in $Stack"
}

# ---------------------------------------------------------------------------
Step "5. Strumenti glTF"
if (-not (Get-Command gltf-transform -ErrorAction SilentlyContinue) -or -not (Get-Command gltfpack -ErrorAction SilentlyContinue)) {
  npm install -g @gltf-transform/cli gltfpack | Out-Null
  if ($LASTEXITCODE -ne 0) { $Failed += "gltf-transform/gltfpack" }
}

# ---------------------------------------------------------------------------
Step "6. Blender via MCP"
if (-not (Get-Command uvx -ErrorAction SilentlyContinue)) {
  winget install --id=astral-sh.uv -e --accept-source-agreements --accept-package-agreements
  $env:Path += ";" + (Join-Path $HOME ".local\bin")
}
uvx mcp-for-blender install-addon
if ($LASTEXITCODE -ne 0) { $Failed += "addon mcp-for-blender (installarlo da Blender: Preferences -> Add-ons)" }
claude mcp get blender *> $null
if ($LASTEXITCODE -ne 0) {
  claude mcp add --scope user blender -e DISABLE_TELEMETRY=true -- uvx mcp-for-blender
  if ($LASTEXITCODE -ne 0) { $Failed += "claude mcp add blender" }
}

Remove-Item -Recurse -Force $Tmp -ErrorAction SilentlyContinue
Step "Riepilogo"
Write-Host "Progetto: $Stack"
Write-Host ("Skill: " + (Get-ChildItem $Skills -Directory).Count + " in $Skills")
Write-Host "Blender: apri Blender, premi N nella viewport, scheda 'MCP for Blender' -> Start MCP Server."
Write-Host "Poi riavvia Claude Code (o chiudi l'app dalla tray): lo strumento 'blender' sara' disponibile."
if ($Failed.Count -gt 0) { Write-Host "Passaggi NON riusciti:"; $Failed | ForEach-Object { Write-Host " - $_" }; exit 1 }
Write-Host "=== SETUP COMPLETATO ==="
