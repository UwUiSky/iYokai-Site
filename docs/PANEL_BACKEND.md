# Backend del panel (Python / FastAPI)

Servizio in `server/`, sullo stesso database del bot. Frontend statico (`dist`) e API escono dallo stesso dominio dietro Cloudflare Tunnel (`deploy/`).

## Cosa fa
- **Login Discord** OAuth2 con PKCE e `state` firmato (scope `identify guilds`). Il token Discord viene revocato subito e non è mai salvato.
- **Sessioni** nel DB (tabella `panel_sessions`, solo l'hash dell'id), cookie `__Host-iy_sid` HttpOnly, Secure, SameSite=Lax.
- **Autorizzazione:** si gestiscono solo i server dove sei proprietario o hai Gestisci server/Amministratore **e** dove l’identità è presente, con verifica live Discord di appartenenza e ruoli. Il catalogo mostra anche i server dove invitarla.
- **Scritture** (attiva/disattiva moduli): controllo Origin, token CSRF, allowlist dei moduli, rate limit per utente, stessa semantica del bot (`jsonb_set` + riga in `guild_config_history`).
- **Limiti** per IP/utente su login e API; gli ID Discord viaggiano sempre come stringhe.

## Da fare nel bot (obbligatorio)
Il bot tiene in cache i moduli per server (`_modules_cache`): una modifica dal panel non ha effetto finché la voce non viene rimossa. Il panel invia `NOTIFY guild_config_changed`; nel bot aggiungi un listener (vedi `docs/BOT_CACHE_PATCH.md`).

## Utente Postgres a privilegi minimi
```sql
CREATE ROLE panel LOGIN PASSWORD '...';
GRANT SELECT, UPDATE ON guild_config TO panel;
GRANT SELECT, INSERT ON guild_config_history TO panel;
GRANT USAGE, SELECT ON SEQUENCE guild_config_history_id_seq TO panel;
-- una volta, da admin:
CREATE TABLE IF NOT EXISTS panel_sessions (sid_hash TEXT PRIMARY KEY, user_id BIGINT NOT NULL, username TEXT NOT NULL, avatar TEXT, guilds JSONB NOT NULL, csrf TEXT NOT NULL, created_at TIMESTAMPTZ NOT NULL DEFAULT now(), expires_at TIMESTAMPTZ NOT NULL);
CREATE INDEX IF NOT EXISTS idx_panel_sessions_exp ON panel_sessions (expires_at);
GRANT SELECT, INSERT, DELETE ON panel_sessions TO panel;   -- e PANEL_AUTO_MIGRATE=0
```
Sviluppo: `cd server && pip install -r requirements.txt pytest pytest-asyncio` e `TEST_DATABASE_URL=postgresql://... pytest`.


## Aggiornamento 29 ottobre 2026 — pannello e abbonamenti

Il frontend contiene una control room IT/EN responsive, selezione identità/server,
moduli, attività e pagina Premium/VIP. L’anteprima è esplicitamente dimostrativa:
non autentica e non scrive dati. `public/panel.json` contiene `enabled:false`.
La pubblicazione Sites attuale serve file statici: **Python/Postgres non sono
ospitati da questa anteprima**. Non impostare enabled:true prima che `/api/health`,
OAuth e DB funzionino sullo stesso dominio tramite `deploy/`.

### Attivazione reale

1. Compilare `deploy/.env` dalla copia esempio: DB, OAuth client ID/secret,
   callback HTTPS, origine esatta, segreto sessione >=32 caratteri, token bot.
   Registrare la callback esatta nel Developer Portal Discord.
2. Eseguire `server/panel-schema.sql` come admin; conservare i grant delle tabelle
   bot riportati sopra. `PANEL_AUTO_MIGRATE=0` con ruolo minimo.
3. Personalizzare `server/policy.example.json` (o montare una copia privata e
   indicare `PANEL_POLICY_FILE`). Ogni identità ha client_id, token_env e allowlist
   moduli. Sono predisposte Core, cinque Music e NSFW (allowlist vuota finché il bot non espone i suoi moduli); senza token/client_id restano
   disabilitate. Il database moduli rimane quello condiviso del bot per server:
   non sono inventate configurazioni autonome dei singoli Music.
4. Collegare invalidazione cache al bot (BOT_CACHE_PATCH.md), avviare lo stack,
   verificare login, ruoli e revoca su un server di prova. Solo allora abilitare
   `public/panel.json` e ricostruire il frontend. Nessun token in public/.

### Regole Premium / VIP

`support_servers` contiene regole esplicite, per esempio (ID da sostituire):

```json
{"guild_id":"ID_SERVER","identity":"core","boost_tier":"premium",
 "premium_roles":["ID_RUOLO_PREMIUM"],"vip_roles":["ID_RUOLO_VIP"]}
```

La verifica legge il membro attraverso il token dell’identità. `premium_since`
indica un boost attivo a quel server; non certifica il numero di boost né il
possesso generale di Nitro. I ruoli VIP hanno precedenza. In caso di verifica
Discord indisponibile quel vantaggio non viene assegnato. I grant da acquisto
restano validi fino alla propria scadenza/revoca.

`feature_tiers` associa le chiavi dei moduli a free/premium/vip; controllato
anche dal backend quando si attiva un modulo. I prezzi per monthly/annual/lifetime
sono null, checkout risponde 503 finché non viene integrato il provider scelto.
Nessun acquisto o abbonamento viene eseguito dal prototipo.

### Bridge pagamenti e AIDA (server → server)

Il browser non può assegnarsi un tier. Un futuro adapter del provider dovrà
verificare la firma nativa del provider, importo, prodotto, stato e destinatario
**prima** di inviare il grant al bridge interno. Questo endpoint non è un webhook
Stripe/PayPal già integrato. Firma con `PANEL_BILLING_BRIDGE_SECRET` distinta:
`X-iYokai-Signature: t=UNIX_SECONDS,v1=HEX_HMAC_SHA256` sul messaggio binario
`timestamp + "." + corpo_JSON_esatto`. Finestra 5 minuti; event_id idempotente,
stesso ID/corpo diverso rifiutato. Non esporre il segreto al client.

POST `/api/internal/entitlements`:

```json
{"event_id":"provider:event","grant_id":"subscription:123",
 "subject_type":"user","subject_id":"ID_DISCORD","tier":"vip",
 "cycle":"monthly","active":true,"occurred_at":"2026-10-29T12:00:00Z",
 "starts_at":"2026-10-29T12:00:00Z","expires_at":"2026-11-29T12:00:00Z"}
```

Revoca: nuovo event_id, stesso grant_id, active:false. Eventi più vecchi non
sovrascrivono i nuovi; a parità di timestamp vince la revoca. Lifetime può avere
expires_at:null ma rimane revocabile. Subject può essere user o guild.

VIP abilita le funzionalità AIDA, **non token illimitati**. La quota mensile UTC
è configurabile in `tiers.vip.monthly_ai_tokens`, inizialmente 0. Il bot/bridge
fidato deve prenotare il massimo budget della richiesta **prima** di chiamare
il provider AI, tramite POST `/api/internal/aida/usage` firmato:

```json
{"event_id":"aida:request-unique","user_id":"ID_DISCORD",
 "guild_id":"ID_SERVER","tokens":2048}
```

Il budget comprende input/output massimo. Omettere guild_id per uso personale.
Quota guild condivisa tra membri, quota user personale; operazione atomica con
lock Postgres e deduplicazione. Quota esaurita:402; tier/quote assenti:403.
Per ora la prenotazione è conservativa: niente rimborsi automatici o top-up,
provider AI, checkout e adapter webhook non sono implementati. Il bot deve
rispettare questo contratto: il solo pannello non può bloccare chiamate AI
eseguite fuori dal bridge. Limiti e condizioni economiche vanno configurati.

### Verifiche e API

`/api/panel/config`, `/api/me?identity=core`, `/api/guilds/{id}?identity=core`,
`/api/me/entitlements`, `/api/guilds/{id}/entitlements`, `/api/plans`.
OAuth usa identify+guilds, niente token OAuth conservato. Scritture: cookie
HttpOnly, CSRF e Origin, permessi live e allowlist identità. I server della
sessione sono una fotografia al login: per quelli appena aggiunti, rifare login.

Test senza servizi reali:
`cd server && pytest -q tests/test_foundations.py tests/test_panel.py::test_pkce_and_signing`.
Usano mock Discord e DB in memoria: non verificano transazioni Postgres reali.
La suite `test_panel.py` completa richiede TEST_DATABASE_URL di prova; **mai il DB
produzione**, poiché il fixture svuota le tabelle. Il test OAuth live, i webhook
provider e i boost reali richiedono le credenziali e lo stack effettivo.

Riferimenti primari: [OAuth2](https://docs.discord.com/developers/topics/oauth2),
[permessi](https://docs.discord.com/developers/topics/permissions),
[membro server](https://docs.discord.com/developers/resources/guild#guild-member-object).

## Sessione scelta dall’utente e rimozione identità

La casella «Resta connessa/o» è disattivata di default. `/api/auth/login?remember=true`
lega la scelta allo state OAuth firmato: cookie persistente fino a7giorni.
Senza scelta: cookie di sessione senza Max-Age e sessione server limitata a12ore.
Logout invalida entrambe. Il frontend statico rimane disabilitato per il login
reale finché non viene avviato lo stack Python/Postgres configurato.

La voce mobile «Invita / rimuovi bot» apre la gestione server. Per i server senza
bot compare l’invito; nella panoramica dei server con bot, soltanto owner/admin
possono confermare la rimozione dell’identità selezionata. API:
`DELETE /api/guilds/{gid}/bot?identity=core`, body `{"confirm_guild_id":"ID"}`,
Origin+CSRF, appartenenza/ruoli Discord verificati live. Usa il token del bot per
Leave Guild; non rimuove utenti né elimina il server. Cache presenza invalidata
solo dopo204 Discord. Percorso verificato con mock, nessun bot reale rimosso.


## Metadati di accesso moduli e gestione errori

GET `/api/guilds/{id}` include per ciascun modulo `required_tier` e `can_enable`,
calcolati dall’entitlement verificato e da `feature_tiers`. Il frontend aggiornato
richiede questi campi: pubblicare anche il backend aggiornato prima di abilitarlo.
Requisiti sconosciuti non consentono attivazioni. Il PATCH continua a ricontrollare
i permessi e il tier: il campo visualizzato non costituisce autorizzazione.
La disattivazione resta consentita dopo downgrade.

Ricerca e filtri server agiscono sulla fotografia della sessione. Aggiorna elenco
ricontrolla la presenza delle identità (cache breve del backend); per server
aggiunti all’account dopo il login serve ancora un nuovo login. Aggiorna server
ricontrolla ruoli, configurazione e vantaggi. Lo storico indisponibile viene
segnalato esplicitamente. Sessione401 richiede un nuovo accesso; nessun dato
OAuth o token bot viene salvato dal frontend.

Suite senza servizi esterni aggiornata:9test Python e27Node. Browser con fixture
API locale verifica successo, errore di scrittura, storico indisponibile,
riprova e scadenza sessione; non equivale a OAuth Discord o Postgres live.


## Scritture concorrenti dei moduli

PATCH `/api/guilds/{id}/modules/{key}` ora richiede due booleani stretti:
`{"active":true,"expected_active":false}`. `expected_active` è lo stato letto
dall’ultima GET guild. Campi assenti, stringhe o numeri sono rifiutati con422.
Aggiornare frontend e backend insieme prima di abilitare il pannello reale.

La transazione blocca la riga con SELECT FOR UPDATE, confronta lo stato attuale
(del modulo, non una revisione globale) e solo dopo aggiorna, scrive lo storico
e invia NOTIFY. Stato diverso da expected_active:409 con detail.code
`module_conflict`; nessuna scrittura o notifica. Il frontend rilegge il server e
chiede una nuova scelta esplicita, senza ritentare il PATCH. Configurazione
eliminata durante la richiesta:409 `configuration_unavailable`. Richiesta con
stato atteso corretto e active già uguale:200 senza nuovo storico/NOTIFY.

Aggiunto test di due scritture concorrenti nella suite Postgres: attesi200/409 e
una sola riga audit. NON eseguito senza TEST_DATABASE_URL dedicato. Le prove
eseguite usano ASGI/Discord mock e una connessione in memoria per l’adapter
transazionale: non sostituiscono la prova delle lock sul database reale.

## Prima integrazione privata al processo bot — 30 ottobre

Vedere `integration/README.md`: adapter da installare nel bot. Nuove rotte
settings e riconoscimento owner usano le funzioni condivise del bot, HMAC,
nonce e permessi ricontrollati dal bot. Vecchie rotte moduli/identità ancora da
migrare; non abilitare il pannello pubblico. Nessuna patch già pushata al bot.

`POST /api/contact` richiede sessione, Origin e CSRF; 3 richieste/ora/utente,
20–4000 caratteri, topic support/lifetime/privacy, risposta201 solo dopo INSERT.
Non invia email né DM. L'owner confermato dal bot legge le ultime50 richieste
con `GET /api/owner/contacts`. Applicare lo schema aggiornato da admin e:

```sql
GRANT SELECT, INSERT ON panel_contact_requests TO panel;
```

Prima dell'apertura pubblica definire tempi di conservazione, cancellazione,
contatto privacy e gestione risposte. Bozza privacy e modulo nella preview non
costituiscono un processo GDPR completato. Non attivare i pagamenti al lancio.


## Revisione contatti e sicurezza — 30 ottobre (supera note contatti precedenti)

I contatti non restano plaintext: Fernet, PANEL_DATA_KEYS separata; invio embed
Discord configurato con guild/channel nel JSON privato. GRANT UPDATE necessario
per registrare la consegna; migrazione schema in server/panel-schema.sql.
Dettagli in docs/CONTACT_AND_PLANS.md e docs/SECURITY_REVIEW.md. Le vecchie righe
plaintext richiedono migrazione esplicita e non sono dichiarate cifrate.
