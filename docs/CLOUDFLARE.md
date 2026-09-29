# Cloudflare: hosting e protezioni per iyokai.dev

## Architettura consigliata
- **Frontend (questo repo):** Cloudflare Pages, collegato a GitHub. Build `npm run build`, cartella `dist`. Gli asset statici sono gratuiti e illimitati; le intestazioni di sicurezza stanno in `public/_headers`.
- **Backend del panel (API + OAuth2 Discord):** sul tuo server, accanto al bot, esposto con **Cloudflare Tunnel** su `api.iyokai.dev` (nessuna porta aperta, IP di origine nascosto). Evita Pages Functions per le chiamate frequenti: sul piano gratuito contano nel tetto di 100.000 richieste al giorno dei Workers.
- **Cookie di sessione:** `HttpOnly; Secure; SameSite=Lax; Domain=.iyokai.dev`, firmati. OAuth2 con `state` e PKCE, CSRF token sulle azioni che modificano dati.

## Da attivare nel dashboard Cloudflare
1. **SSL/TLS:** modalità *Full (strict)*, *Always Use HTTPS*, HSTS (già inviato da `_headers`), TLS minimo 1.2.
2. **DNSSEC** attivo sul dominio.
3. **WAF:** regole gestite Cloudflare + OWASP; regola custom che blocca `/api/*` senza `Origin` di iyokai.dev sui metodi che scrivono.
4. **Rate limiting** su `/api/auth/*` e `/api/*` (più stretto sul login).
5. **Bot Fight Mode** attivo; **Turnstile** (gratuito) sul login e sulle azioni sensibili.
6. **Cloudflare Access** (Zero Trust, gratuito fino a 50 utenti) davanti a qualunque endpoint admin/owner.
7. **Tunnel** con `cloudflared` come servizio sul server; firewall del server chiuso a tutto tranne l'uscita.
8. **Segreti** (token del bot, `WEB_PANEL_SECRET_KEY`, `OAUTH_ENCRYPTION_KEY`, client secret Discord) solo nelle variabili d'ambiente del server o in Worker secrets, mai nel repo.

## Verifica
`public/_headers` è stato provato con un server locale che invia le stesse intestazioni: nessuna violazione della CSP in hub, sezione Discord, elenco comandi e invito.
