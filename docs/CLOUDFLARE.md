# Cloudflare: hosting sul tuo server e protezioni

## Architettura
- **Tutto sul tuo server** (`deploy/docker-compose.yml`): Caddy serve il frontend (`npm run build`, cartella `dist`) e inoltra `/api/*` al backend Python; **Cloudflare Tunnel** (`cloudflared`) è l'unico ingresso. Nessuna porta pubblicata, IP di origine nascosto.
- Nel dashboard Cloudflare: Zero Trust, Networks, Tunnels; hostname pubblico `iyokai.dev` verso `http://web:80`.

## Da attivare
1. **SSL/TLS** *Full (strict)*, Always Use HTTPS, HSTS, TLS minimo 1.2; **DNSSEC**.
2. **WAF** con regole gestite; **Bot Fight Mode**; **rate limiting** su `/api/auth/*` e `/api/*`; **Turnstile** sul login se subisce abusi.
3. **Cloudflare Access** davanti a qualsiasi endpoint admin.
4. **Cache:** regola per `/assets/*` e `/audio/*` (file con nome e contenuto stabili).
5. Firewall dell'host chiuso in ingresso: il tunnel esce, non serve entrare.
6. Segreti solo in `deploy/.env` (mai nel repo); il file è fuori da git.

## Le intestazioni di sicurezza
Stanno in `deploy/Caddyfile` (CSP senza script inline, HSTS, anti-framing). `public/_headers` serve solo se un giorno userai Cloudflare Pages.

## Attenzione: file pesanti (audio, 3D)
Il Tunnel è gratuito, ma passare dalla CDN di Cloudflare video o una quota sproporzionata di file grandi senza i servizi a pagamento previsti (Stream, Images, R2, Developer Platform) può portare a redirect o limitazioni sui piani Free/Pro/Business (vedi la pagina "Delivering videos with Cloudflare" nella documentazione). Regole pratiche:
- Pagine, JS, CSS, JSON e modelli 3D compressi (Draco/KTX2) sono il normale traffico di un sito.
- **Audio:** meglio MP3/Opus (non WAV) per il player; se i file crescono, spostali su **Cloudflare R2** (dominio tipo `media.iyokai.dev`) e aggiungilo a `media-src` nella CSP di `deploy/Caddyfile`.
- Il corpo delle richieste è limitato a 100 MB sui piani Free e Pro.
