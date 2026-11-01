# Setup script dell'ambiente cloud

La macchina di Claude Code nel cloud viene ricreata a ogni sessione: skill e
programmi installati a mano spariscono. Per averli sempre pronti, incolla
questo nello **Setup script** dell'ambiente (menu dell'ambiente nella barra del
titolo della sessione → Edit → Setup script). Lo script parte una cartella
sopra la repository.

```bash
cd iYokai-Site && bash iyokai-next/tools/install-skills.sh --blender
```

Cosa fa (niente viene scritto nella repo):
- installa in `~/.claude/skills` le 28 skill `blender-*` e `blender-image-to-3d`
  (versioni fisse e controllate) e porta a livello utente le skill web 3D,
  Awwwards e gli agenti forniti dall'ambiente;
- installa Blender 5.2.3 LTS headless in `/opt` (circa 350 MB di download:
  togli `--blender` se vuoi sessioni più rapide quando non serve Blender).

Il nome della cartella dopo `cd` deve corrispondere a quello della repo nel
container (oggi `iYokai-Site`).
