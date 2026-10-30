# Bridge sito → processo bot (prima integrazione)

La preview statica non avvia questo servizio. Il file `iyokai_site_bridge.py`
va installato nel checkout del bot; non è già stato pubblicato nella sua repo.
Dipendenze: aiohttp già usato dal bot. Contratto verificato sui file pubblici
`core/panel_bridge.py` blob a57e96d8c438c547f09855069b673feb289e5c32 e
`core/config_schema.py` blob f03dee1788409654beddc34630a22b73a3bc6046 (30/10/2026).

Nel lifecycle del bot, dopo setup DB/registrazione moduli:

```python
from aiohttp import web
from iyokai_site_bridge import build_site_bridge
import os
runner = web.AppRunner(build_site_bridge(bot, os.environ['PANEL_BOT_BRIDGE_SECRET']))
await runner.setup()
await web.TCPSite(runner, '127.0.0.1', 8423).start()
# Conservare runner e chiamare await runner.cleanup() nello shutdown.
```

Per Docker usare una rete privata dedicata con host raggiungibile dal solo API,
non loopback dell'host inaccessibile dal container. Non pubblicare la porta né
instradare `/v1/request` dal proxy pubblico. URL consentito e segreto separato
>=32 caratteri in `deploy/.env`:

```
PANEL_BOT_BRIDGE_URL=http://HOST_PRIVATO:8423
PANEL_BOT_BRIDGE_SECRET=SEGRETO_CASUALE_NON_COMMITTATO
```

Ogni richiesta firma timestamp, nonce e corpo esatto HMAC-SHA256; finestra60s,
nonce monouso120s, dimensione8KiB, nessun retry automatico. Il sito prende user_id
solo dalla sessione, il bot ricontrolla i permessi con panel_bridge prima delle
letture/scritture. Registro nonce in memoria: la porta deve restare privata;
un riavvio azzera il registro. Il segreto autentica il sito, non il browser.

Coperti: impostazioni ruoli e lingua, stato moduli dal registro bot, storico,
profilo owner e diagnostica intent richiesti. Nessuna concessione di intent:
l'approvazione reale nel Developer Portal non è certificata dal valore locale.
Il backend attuale del bot espone solo flag Free/Premium: VIP non è simulato.

Non ancora migrati: interruttori moduli del vecchio API, gestione identità,
log channels ed eventi, privacy export/cancellazione, tier VIP condivisi e
broadcast owner. Non abilitare public/panel.json prima del completamento e dei
test live. Non usare docs/BOT_CACHE_PATCH.md come integrazione aggiornata:
questo percorso usa le funzioni condivise del processo bot.
