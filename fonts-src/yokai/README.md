# Yokai Font — sorgenti modificabili

Normale per testo, Extreme per titoli. Designer: Yokai.

Le due cartelle comprendono TTF modificabile in FontForge, XML TTX completo,
SVG delle lettere base, numeri, punteggiatura e ミ, e metriche JSON. I contorni
di partenza sono in docs/font-proposals/spacing-source/. I supporti Noto sono
separati e conservano la licenza OFL. Non sono rinominati come font Yokai.

Da root con Python, fontTools e Pillow con supporto RAQM:

```
python tools/fonts/rebuild-spacing.py
python tools/fonts/check-spacing.py
python tools/fonts/check-raster-spacing.py
python tools/fonts/export-editable.py
```

Per ricompilare un XML: `python -m fontTools.ttx fonts-src/yokai/normal/yokai-normal.ttx`.
Modificare il TTF esportato non aggiorna automaticamente il WOFF del sito:
aggiornare il generatore e la revisione dei file caricati nel frontend.
