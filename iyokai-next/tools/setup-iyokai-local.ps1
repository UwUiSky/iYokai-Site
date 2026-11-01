# =============================================================================
# iYokai — setup locale su Windows (Claude Code + Blender aperto sul PC)
#   powershell -ExecutionPolicy Bypass -File setup-iyokai-local.ps1
# Installa skill e agenti in %USERPROFILE%\.claude e collega Blender via MCP.
# Non scrive nulla dentro la repo iYokai-Site.
# Requisiti: Git, Node.js 22+, Claude Code, Blender 5.2+.
# =============================================================================
$ErrorActionPreference = "Continue"
$Skills = Join-Path $HOME ".claude\skills"
$Agents = Join-Path $HOME ".claude\agents"
$Tmp = Join-Path $env:TEMP ("iyokai-setup-" + [guid]::NewGuid())
$Failed = @()
New-Item -ItemType Directory -Force -Path $Skills, $Agents, $Tmp | Out-Null

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

Write-Host "=== 1. Requisiti ==="
foreach ($c in "git","node","npm","claude") {
  if (-not (Get-Command $c -ErrorAction SilentlyContinue)) { $Failed += "manca $c" }
}

Write-Host "=== 2. Skill e agenti ==="
if (Fetch "skinnye/3d-web-pack" "cabd221" "web3d") {
  Get-ChildItem (Join-Path $Tmp "web3d\skills") -Directory | ForEach-Object { Put $_.FullName }
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
    Put $_.FullName; Copy-Item (Join-Path $Tmp "bsk\LICENSE") (Join-Path $Skills $_.Name)
  }
} else { $Failed += "blender-skills" }
if (Fetch "majidmanzarpour/blender-game-skills" "f0ef293" "i23") {
  Put (Join-Path $Tmp "i23\skills\blender-image-to-3d")
  Copy-Item (Join-Path $Tmp "i23\LICENSE") (Join-Path $Skills "blender-image-to-3d")
} else { $Failed += "blender-image-to-3d" }

Write-Host "=== 3. Strumenti glTF ==="
if (-not (Get-Command gltf-transform -ErrorAction SilentlyContinue)) {
  npm install -g @gltf-transform/cli gltfpack | Out-Null
  if ($LASTEXITCODE -ne 0) { $Failed += "gltf-transform/gltfpack" }
}

Write-Host "=== 4. Blender via MCP ==="
if (-not (Get-Command uvx -ErrorAction SilentlyContinue)) {
  winget install --id=astral-sh.uv -e --accept-source-agreements --accept-package-agreements
  $env:Path += ";" + (Join-Path $HOME ".local\bin")
}
uvx mcp-for-blender install-addon
if ($LASTEXITCODE -ne 0) { $Failed += "addon mcp-for-blender" }
claude mcp get blender *> $null
if ($LASTEXITCODE -ne 0) {
  claude mcp add --scope user blender -e DISABLE_TELEMETRY=true -- uvx mcp-for-blender
  if ($LASTEXITCODE -ne 0) { $Failed += "claude mcp add blender" }
}

Remove-Item -Recurse -Force $Tmp -ErrorAction SilentlyContinue
Write-Host "=== Riepilogo ==="
Write-Host ("Skill: " + (Get-ChildItem $Skills -Directory).Count + " in $Skills")
Write-Host "Blender: apri Blender, premi N nella viewport, scheda 'MCP for Blender' -> Start MCP Server."
Write-Host "Poi riavvia Claude Code (o chiudi l'app dalla tray): lo strumento 'blender' sara' disponibile."
if ($Failed.Count -gt 0) { Write-Host "Passaggi NON riusciti:"; $Failed | ForEach-Object { Write-Host " - $_" }; exit 1 }
Write-Host "=== SETUP COMPLETATO ==="
