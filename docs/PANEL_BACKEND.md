# Backend del panel (Python / FastAPI)

Servizio in `server/`, sullo stesso database del bot. Frontend statico (`dist`) e API escono dallo stesso dominio dietro Cloudflare Tunnel (`deploy/`).

## Cosa fa
- **Login Discord** OAuth2 con PKCE e `state` firmato (scope `identify guilds`). Il token Discord viene revocato subito e non è mai salvato.
- **Sessioni** nel DB (tabella `panel_sessions`, solo l'hash dell'id), cookie `__Host-iy_sid` HttpOnly, Secure, SameSite=Lax.
- **Autorizzazione:** si gestiscono solo i server dove sei proprietario o hai Gestisci server/Amministratore **e** dove il bot è presente (`guild_config`).
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
