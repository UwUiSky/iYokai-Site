#!/usr/bin/env bash
# Prepares the Claude Code machine for iyokai-next work:
#   - Blender skills into ~/.claude/skills (Claude Code user level)
#   - web 3D / Awwwards skills and agents provided by the environment, made user level
#   - Blender 5.2 LTS headless in /opt (optional: --blender)
# Writes nothing inside the repository. Safe to rerun.
#   bash iyokai-next/tools/install-skills.sh [--blender]
set -euo pipefail

SKILLS="$HOME/.claude/skills"
AGENTS="$HOME/.claude/agents"
ENV_DIR="/home/user/.claude"            # skills shipped with the cloud environment
TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT
mkdir -p "$SKILLS" "$AGENTS"

fetch() { # repo commit dir
  git clone -q https://github.com/"$1" "$TMP/$3"
  git -C "$TMP/$3" checkout -q "$2"
}

# Blender skills (MIT), commits reviewed on 2026-11-01: bpy only, no network calls
fetch EL4CTEO/blender-skills fb92cfb el4
for k in "$TMP"/el4/skills/*; do
  cp -r "$k" "$SKILLS/"; cp "$TMP/el4/LICENSE" "$SKILLS/$(basename "$k")/LICENSE"
done
fetch majidmanzarpour/blender-game-skills f0ef293 mm
cp -r "$TMP/mm/skills/blender-image-to-3d" "$SKILLS/"
cp "$TMP/mm/LICENSE" "$SKILLS/blender-image-to-3d/LICENSE"

# Environment-provided web skills and agents, copied to user level when present
for s in add-postprocessing optimize-3d-assets scaffold-3d-site scroll-3d-scene frontend-design web-artifacts-builder; do
  [ -d "$ENV_DIR/skills/$s" ] && cp -r "$ENV_DIR/skills/$s" "$SKILLS/"
done
if [ -d "$ENV_DIR/skills/awwwards-web-design/skills/awwwards-web-design" ]; then
  cp -r "$ENV_DIR/skills/awwwards-web-design/skills/awwwards-web-design" "$SKILLS/"
  cp "$ENV_DIR/skills/awwwards-web-design/LICENSE" "$ENV_DIR/skills/awwwards-web-design/NOTICE.md" \
     "$SKILLS/awwwards-web-design/" 2>/dev/null || true
fi
[ -d "$ENV_DIR/agents" ] && cp "$ENV_DIR"/agents/*.md "$AGENTS/" 2>/dev/null || true

# Optional: Blender 5.2 LTS headless (~350 MB download, ~1 GB on disk)
if [ "${1:-}" = "--blender" ] && ! command -v blender >/dev/null; then
  V=5.2.3
  curl -sSL "https://download.blender.org/release/Blender5.2/blender-$V-linux-x64.tar.xz" -o "$TMP/b.tar.xz"
  tar -xf "$TMP/b.tar.xz" -C /opt
  ln -sf "/opt/blender-$V-linux-x64/blender" /usr/local/bin/blender
fi

echo "Skills in $SKILLS: $(ls "$SKILLS" | wc -l)"
command -v blender >/dev/null && blender --version | head -1 || echo "Blender not installed (use --blender)"
