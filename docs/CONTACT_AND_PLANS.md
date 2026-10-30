# Contatti Discord e piani

## Contatti

Copia `server/site-settings.example.json` in un file privato sul server,
configura `contact_discord.guild_id` e `contact_discord.channel_id`, lascia il
nome della variabile token (`DISCORD_BOT_TOKEN`) o un'altra DISCORD_ privata.
Il token va soltanto nell'ambiente, mai nel JSON pubblico o in `links.json`.
Imposta `PANEL_SITE_SETTINGS_FILE` sul percorso del file montato nel container.
Il bot deve poter vedere il canale, scrivere e incorporare link. Usa un canale
privato con accesso limitato all'owner/staff di supporto, non un log pubblico.

L'API salva prima il testo cifrato, tenta una sola consegna embed e registra:
`delivered`, `unconfigured`, `invalid_destination`, `failed` o `unknown`.
`unknown` significa che l'invio potrebbe essere arrivato: non ritentare alla
cieca. La sezione owner mostra lo stato; nessuna email viene inviata.
Non esiste ancora una coda di retry o gestione risposte dei ticket completa.

Genera la chiave **sul tuo server**, conserva backup separato e permessi stretti:

```
python -c "from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())"
```

Mettila in `PANEL_DATA_KEYS`. Per rotazione: nuova,vecchia (separate da virgola).
Nessuna chiave reale è stata generata/salvata nel repository. Senza chiave il
contatto viene rifiutato, non salvato in chiaro. Applicare schema aggiornato e
`GRANT SELECT,INSERT,UPDATE ON panel_contact_requests TO panel`.

## Piani

Copia `server/commerce.example.json` in un file privato e imposta
`PANEL_COMMERCE_FILE`. Prodotti: premium,vip-1,vip-5,vip-20. I campi
`monthly_minor` e `annual_minor` sono prezzi in centesimi EUR; null=da definire,
NON zero euro. `monthly_ai_tokens` è un budget distinto, null=non definito.
I nomi VIP1/5/20 non vengono interpretati automaticamente come euro o numero
utenti: nessun prezzo o diritto è stato inventato. Le pagine pubbliche Piani
leggono il catalogo sanitizzato dall'API quando è online.

Lancio gratuito, checkout disabilitato anche se si cambia il flag nel JSON.
Lifetime conduce al modulo di contatto. Un provider, webhook autenticati,
SKU nei grant e consumo quote per prodotto devono ancora essere integrati e
verificati anche nel bot. La sola tabella prezzi non applica budget diversi.

Per montare i file privati senza inserirli nell'immagine, copia i JSON dentro
deploy/private/ (ignorata da Git) e usa anche
`deploy/docker-compose.private.example.yml` nello stack Compose. Le chiavi
restano in deploy/.env o nel gestore segreti del server, non nei file pubblici.
