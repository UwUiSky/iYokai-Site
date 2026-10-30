import os
from pathlib import Path
from dataclasses import dataclass, field
from functools import lru_cache

def _e(k: str, d: str = "") -> str:
    return os.environ.get(k, d)

@dataclass(frozen=True)
class Settings:
    database_url: str = field(default_factory=lambda: _e("DATABASE_URL"), repr=False)
    client_id: str = field(default_factory=lambda: _e("OAUTH2_CLIENT_ID"))
    client_secret: str = field(default_factory=lambda: _e("OAUTH2_CLIENT_SECRET"), repr=False)
    redirect_uri: str = field(default_factory=lambda: _e("OAUTH2_REDIRECT_URI"))
    secret_key: str = field(default_factory=lambda: _e("WEB_PANEL_SECRET_KEY"), repr=False)
    site_origin: str = field(default_factory=lambda: _e("PANEL_SITE_ORIGIN", "https://iyokai.dev"))
    cookie_secure: bool = field(default_factory=lambda: _e("PANEL_COOKIE_SECURE", "1") != "0")
    trust_cf: bool = field(default_factory=lambda: _e("PANEL_TRUST_CF", "1") != "0")  # solo se l'API non è raggiungibile se non dal tunnel
    twitch_client_id: str = field(default_factory=lambda: _e("TWITCH_CLIENT_ID"))
    twitch_client_secret: str = field(default_factory=lambda: _e("TWITCH_CLIENT_SECRET"), repr=False)
    twitch_login: str = field(default_factory=lambda: _e("TWITCH_LOGIN"))
    yt_channels: tuple = field(default_factory=lambda: tuple(x.strip() for x in _e("YOUTUBE_CHANNEL_IDS").split(",") if x.strip()))
    auto_migrate: bool = field(default_factory=lambda: _e("PANEL_AUTO_MIGRATE", "1") != "0")
    policy_file: str = field(default_factory=lambda: _e("PANEL_POLICY_FILE", str(Path(__file__).resolve().parents[1] / "policy.example.json")))
    billing_secret: str = field(default_factory=lambda: _e("PANEL_BILLING_BRIDGE_SECRET"), repr=False)
    bot_bridge_url: str = field(default_factory=lambda: _e("PANEL_BOT_BRIDGE_URL"))
    bot_bridge_secret: str = field(default_factory=lambda: _e("PANEL_BOT_BRIDGE_SECRET"), repr=False)
    site_settings_file: str = field(default_factory=lambda: _e("PANEL_SITE_SETTINGS_FILE", str(Path(__file__).resolve().parents[1] / "site-settings.example.json")))
    commerce_file: str = field(default_factory=lambda: _e("PANEL_COMMERCE_FILE", str(Path(__file__).resolve().parents[1] / "commerce.example.json")))
    data_keys: str = field(default_factory=lambda: _e("PANEL_DATA_KEYS"), repr=False)
    session_ttl: int = 7 * 24 * 3600

@lru_cache
def get_settings() -> Settings:
    s = Settings()
    missing = [n for n, v in (("DATABASE_URL", s.database_url), ("OAUTH2_CLIENT_ID", s.client_id), ("OAUTH2_CLIENT_SECRET", s.client_secret), ("OAUTH2_REDIRECT_URI", s.redirect_uri)) if not v]
    if missing or len(s.secret_key) < 32:
        raise RuntimeError(f"Configurazione incompleta: {', '.join(missing) or 'WEB_PANEL_SECRET_KEY (min 32 caratteri)'}")
    return s
