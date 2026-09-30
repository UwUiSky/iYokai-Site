-- Copia dello schema del bot (iYokai-DS-BOT, core/migrations) sufficiente per provare il panel.
CREATE TABLE IF NOT EXISTS guild_config (
  guild_id BIGINT PRIMARY KEY, modules JSONB NOT NULL DEFAULT '{}'::jsonb, settings JSONB NOT NULL DEFAULT '{}'::jsonb,
  prefix TEXT, language TEXT NOT NULL DEFAULT 'it', setup_completed BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now());
CREATE TABLE IF NOT EXISTS guild_config_history (
  id SERIAL PRIMARY KEY, guild_id BIGINT NOT NULL, changed_by BIGINT, change_type TEXT NOT NULL, key_name TEXT NOT NULL,
  old_value TEXT, new_value TEXT NOT NULL, created_at TIMESTAMPTZ NOT NULL DEFAULT now());
