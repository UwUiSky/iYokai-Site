# Revisione tecnica — 30 ottobre 2026

Questa è una revisione del codice e della configurazione, non una certificazione,
un penetration test del server o una garanzia di inviolabilità/disponibilità.

## Correzioni applicate

- RateLimiter: tetto massimo delle chiavi realmente applicato senza espellere
  limiti ancora attivi; conservazione distinta delle scadenze brevi/lunghe.
- Fatturazione: booleani e contatori token stretti, niente coercizione da stringhe
  o booleani a interi. Checkout sempre disabilitato, nessuna concessione dal client.
- Richieste: limite64KiB al proxy e nell'API, anche su streaming senza Content-Length.
- Cookie di sessione HttpOnly/Secure/SameSite, Origin e CSRF sulle scritture,
  query SQL parametrizzate e permessi verificati server-side già presenti.
- Container API: access log Uvicorn spento per non registrare query OAuth;
  dipendenze esatte nel requirements.lock. Nessun PHP o interprete di script
  caricati dagli utenti. Nessun upload file o eval aggiunti.
- Contatti: testo cifrato con Fernet (cifratura autenticata della libreria
  cryptography), chiavi solo backend, rotazione con chiavi precedenti per leggere.
  ID utente e metadati di instradamento NON cifrati applicativamente; richiedono
  comunque accesso DB minimo e cifratura dischi/backup sul server reale.
- Canale Discord: guild_id verificato, solo canale testo/annunci, menzioni
  disattivate, nessun webhook fornito dal browser. Timeout dopo POST = unknown,
  nessun retry automatico che possa duplicare messaggi. Salvataggio != consegna.
- Browser: risorse del sito/font locali; rimosso iframe Spotify. Spotify e YouTube
  si aprono come link esterni espliciti. Nessun recorder di sessione o tracker.
- Il percorso rimane alla radice, viste nella History API. Non è una difesa
  contro l'accesso ai dati: gli endpoint devono autorizzare ogni richiesta.
- Proxy: nessuna porta host pubblicata dallo stack; endpoint internal bloccati
  dal proxy pubblico, bridge bot soltanto sulla rete privata.

## Impronte e raccolta dati

Letto core/alt_detection_logic.py del bot, blob
`a64ecd3e851b9da6634b7a835d88698bb5025033`: HMAC-SHA256 con segreto e server ID,
IP originale non salvato nel registro impronte, confronto limitato allo stesso
server, segnali allo staff senza ban automatico. La durata dichiarata nel codice
è30giorni per impronte,90per segnalazioni: verificare il job reale di cancellazione.
Il sito richiede identify+guilds, NON email; non è stata aggiunta raccolta email
né fingerprint invasivo di canvas/hardware. Un segnale rete/browser non prova
l'identità di una persona. Dati pseudonimizzati non sono automaticamente anonimi.
Il segreto HMAC deve essere separato dalle chiavi cifratura e dal segreto sessione.

## Da verificare prima del lancio

- Completare integrazione bot (rotte moduli legacy ancora da migrare), tier VIP
  applicati ai comandi, pannelli owner e broadcast tradotto. Non abilitare panel.json.
- Credenziali reali, OAuth live, grant DB e test PostgreSQL concorrenti, cifratura
  dischi/backup, ripristino, rotazione chiavi e segreti, aggiornamento immagini Docker.
- Controllare firewall origin chiuso, tunnel reale, WAF/rate limits Cloudflare,
  certificato valido sul dominio finale e risposte HTTPS. Non sono stati modificati
  NS, DNS, firewall o account Cloudflare. Tunnel cifrato su Internet; segmenti
  HTTP locali fra container restano sulla rete privata, non sono TLS end-to-end.
- La mitigazione DDoS non garantisce continuità100%: servono monitoraggio,
  capacità, backup e procedure di risposta. TLS non certifica la sicurezza del codice.
- Completare titolare, basi giuridiche, contatto, retention, diritti interessati,
  destinatari Discord/Cloudflare, eventuali trasferimenti e accordi fornitori.
  I contatti inviati su Discord sono leggibili dallo staff autorizzato di quel
  canale e trattati da Discord: la cifratura del DB non li rende E2E su Discord.
- Migrare/cancellare in modo controllato le vecchie richieste plaintext prima del
  lancio; non trasformare silenziosamente vecchie righe in dati dichiarati cifrati.
- Le risorse mostrate dal browser possono essere scaricate o registrate. Non
  esistono cifratura dell'interfaccia o blocco screenshot che risolvano questo.
- Non è stata identificata una CVE dalla descrizione «PHP shell,70%dei siti»;
  non è un dato verificato. Per verificarla serve nome/CVE/fonte precisa.

## Riferimenti primari

- https://cheatsheetseries.owasp.org/cheatsheets/Cryptographic_Storage_Cheat_Sheet.html
- https://developers.cloudflare.com/cloudflare-one/networks/connectors/cloudflare-tunnel/
- https://www.edpb.europa.eu/topics/ai-and-technology/anonymisation-pseudonymisation_en

Gli esiti dei test e delle scansioni sono riportati nelle ultime sezioni dello
sprint. Nessun test qui equivale a una prova DDoS, audit terzo o attacco live.

## Esiti verificati del 30 ottobre

23test backend (ASGI/mock + sicurezza) e4test adapter bot passati. Suite
JavaScript completa e build Vite passate. npm audit --omit=dev:0segnalazioni;
pip-audit su32dipendenze del lock:0vulnerabilità note. Sono controlli puntuali
del catalogo advisories, non una garanzia su vulnerabilità nuove o logiche.
Il proxy Caddy non è stato avviato qui (binario non disponibile): ordine
letterale esplicito nel blocco route, da validare sullo stack reale.
