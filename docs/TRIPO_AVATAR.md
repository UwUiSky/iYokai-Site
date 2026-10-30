# Pipeline avatar Tripo

Reference approvata: `public/cinematic/kitsune.webp`. La reference è originale ed è stata generata per questo progetto.

Il loader supporta un GLB locale, materiali, scheletro e clip glTF. Il file `public/cinematic/avatar.json` mantiene `model: null` finché non viene fornito un modello revisionato. Con `model: "/cinematic/kitsune.glb"`, il loader normalizza altezza e posizione e avvia una clip idle/rest/breath; se il caricamento fallisce conserva l'artwork. `avatar.play(nomeClip)` esegue un crossfade di 0,6 secondi.

Le nove code sono entità procedurali separate: non affidare a una singola generazione il loro numero o la loro gerarchia. Verificare che il modello generato non abbia code aggiuntive incompatibili. Per il corpo serve un rig umanoide; capelli e kimono possono richiedere correzioni manuali prima delle animazioni.

Documentazione ufficiale consultata il 28 ottobre 2026:

- https://developers.tripo3d.ai/en/docs/codex-plugin
- https://developers.tripo3d.ai/en/docs/generation-image-to-model/standard
- https://developers.tripo3d.ai/en/docs/animations-rig
- https://developers.tripo3d.ai/en/docs/animations-retarget

La generazione non è stata eseguita: accesso Tripo non configurato. Non inserire chiavi API nel browser del sito, nei file tracciati o in chat. Non acquistare crediti senza autorizzazione.
