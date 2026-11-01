# Skill e agenti

Installati in Claude Code (`~/.claude/skills`, `~/.claude/agents`), **non nella
repo**, con `tools/setup-iyokai.sh` (o `setup-iyokai-local.ps1`). Ogni skill mantiene la propria licenza.
Per aggiornare: cambiare il commit nello script dopo aver controllato la nuova versione.

## Web / 3D / design

| Skill | Fonte | Licenza |
|---|---|---|
| `awwwards-web-design` | https://github.com/owenisas/awwwards-web-design `4546147` | MIT (+ `NOTICE.md`) |
| `frontend-design`, `web-artifacts-builder` | https://github.com/anthropics/skills `ca45fc4` | Apache-2.0 |
| `scroll-3d-scene`, `add-postprocessing`, `optimize-3d-assets`, `scaffold-3d-site` + 6 agenti | https://github.com/skinnye/3d-web-pack `cabd221` | MIT |

Agenti (`~/.claude/agents/`, da 3d-web-pack): `threejs-architect`, `r3f-engineer`,
`shader-artist`, `motion-choreographer`, `webgl-perf-auditor`, `asset-pipeline-engineer`. Nota: alcuni assumono React Three Fiber; il sito è Three.js
vanilla + GSAP + Lenis.

## Blender

| Skill | Fonte | Commit | Licenza |
|---|---|---|---|
| 28 skill `blender-*` (core, sculpting, rigging, hair-grooming, clothing, facial-shapekeys, animation, stylized-npr, environment-kits, lighting-lookdev, time-of-day, weather-fx, export-pipelines, asset-qa, …) | https://github.com/EL4CTEO/blender-skills | `fb92cfb` | MIT |
| `blender-image-to-3d` (da reference a modello riggato, con verifiche a fasi) | https://github.com/majidmanzarpour/blender-game-skills | `f0ef293` | MIT |

Valutati e non inclusi:
- `arjun988/blender-skills` (94 skill, orientate a Cursor e a generi di
  videogioco, molte fuori tema).
- `ahujasid/mcp-for-blender` (MIT, `992233b`): non è una skill ma un addon +
  server MCP; lo installano gli script locali (telemetria disattivata con
  `DISABLE_TELEMETRY=true`). Istruzioni in `BLENDER.md`.

Gli script delle skill Blender sono stati controllati: solo `bpy`, nessuna
chiamata di rete o esecuzione di comandi esterni.
