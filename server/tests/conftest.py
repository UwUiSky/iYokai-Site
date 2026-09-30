import os, sys
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))
os.environ.update({"DATABASE_URL": os.environ.get("TEST_DATABASE_URL", ""), "OAUTH2_CLIENT_ID": "123", "OAUTH2_CLIENT_SECRET": "sec",
                   "OAUTH2_REDIRECT_URI": "https://iyokai.dev/api/auth/callback", "WEB_PANEL_SECRET_KEY": "k" * 40, "PANEL_SITE_ORIGIN": "https://iyokai.dev"})
import httpx, pytest, pytest_asyncio

@pytest_asyncio.fixture
async def client():
    from app.main import app, limiter
    limiter.hits.clear()
    async with app.router.lifespan_context(app):
        pool = app.state.db.pool
        await pool.execute(open(os.path.join(os.path.dirname(__file__), "schema.sql")).read())
        await pool.execute("TRUNCATE guild_config, guild_config_history, panel_sessions")
        await pool.execute("INSERT INTO guild_config (guild_id) VALUES (111), (222)")
        async with httpx.AsyncClient(transport=httpx.ASGITransport(app=app), base_url="https://iyokai.dev") as c:
            yield c
