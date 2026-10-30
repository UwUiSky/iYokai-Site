-- Eseguire una volta come amministratore; il ruolo applicativo non necessita DDL.

CREATE TABLE IF NOT EXISTS panel_sessions (
  sid_hash TEXT PRIMARY KEY, user_id BIGINT NOT NULL, username TEXT NOT NULL, avatar TEXT,
  guilds JSONB NOT NULL, csrf TEXT NOT NULL, created_at TIMESTAMPTZ NOT NULL DEFAULT now(), expires_at TIMESTAMPTZ NOT NULL);
CREATE INDEX IF NOT EXISTS idx_panel_sessions_exp ON panel_sessions (expires_at);
CREATE TABLE IF NOT EXISTS panel_entitlements (
 grant_id TEXT PRIMARY KEY, subject_type TEXT NOT NULL CHECK(subject_type IN ('user','guild')), subject_id TEXT NOT NULL,
 tier TEXT NOT NULL CHECK(tier IN ('premium','vip')), cycle TEXT NOT NULL CHECK(cycle IN ('monthly','annual','lifetime')),
 active BOOLEAN NOT NULL, starts_at TIMESTAMPTZ NOT NULL, expires_at TIMESTAMPTZ, source TEXT NOT NULL DEFAULT 'purchase', last_event_at TIMESTAMPTZ NOT NULL DEFAULT '-infinity');
ALTER TABLE panel_entitlements ADD COLUMN IF NOT EXISTS last_event_at TIMESTAMPTZ NOT NULL DEFAULT '-infinity';
CREATE INDEX IF NOT EXISTS panel_entitlements_subject ON panel_entitlements(subject_type,subject_id);
CREATE TABLE IF NOT EXISTS panel_payment_events(event_id TEXT PRIMARY KEY, body_hash TEXT NOT NULL, received_at TIMESTAMPTZ NOT NULL DEFAULT now());
CREATE TABLE IF NOT EXISTS panel_ai_usage(event_id TEXT PRIMARY KEY, subject_type TEXT NOT NULL, subject_id TEXT NOT NULL,
 period TEXT NOT NULL, tokens BIGINT NOT NULL CHECK(tokens>0), body_hash TEXT NOT NULL, created_at TIMESTAMPTZ NOT NULL DEFAULT now());
CREATE INDEX IF NOT EXISTS panel_ai_subject ON panel_ai_usage(subject_type,subject_id,period);
GRANT SELECT, INSERT, DELETE ON panel_sessions TO panel;
GRANT SELECT, INSERT, UPDATE ON panel_entitlements TO panel;
GRANT SELECT, INSERT ON panel_payment_events, panel_ai_usage TO panel;

CREATE TABLE IF NOT EXISTS panel_contact_requests (
 id TEXT PRIMARY KEY, user_id BIGINT NOT NULL, topic TEXT NOT NULL CHECK(topic IN ('support','lifetime','privacy')),
 message TEXT NOT NULL CHECK(length(message) BETWEEN 20 AND 32768), language TEXT NOT NULL,
 created_at TIMESTAMPTZ NOT NULL DEFAULT now(), status TEXT NOT NULL DEFAULT 'open');
CREATE INDEX IF NOT EXISTS panel_contact_user ON panel_contact_requests(user_id,created_at);

ALTER TABLE panel_contact_requests ADD COLUMN IF NOT EXISTS delivery TEXT NOT NULL DEFAULT 'pending';

-- Encrypted UTF-8 contact bodies are larger than the original 4000 characters.
ALTER TABLE panel_contact_requests DROP CONSTRAINT IF EXISTS panel_contact_requests_message_check;
ALTER TABLE panel_contact_requests ADD CONSTRAINT panel_contact_requests_message_check CHECK(length(message) BETWEEN 20 AND 32768);
