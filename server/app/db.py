import json
import asyncpg
# Tabella del panel: le sessioni stanno nel DB condiviso, indicizzate per hash dell'id (l'id in chiaro esiste solo nel cookie).
SCHEMA = """
CREATE TABLE IF NOT EXISTS panel_sessions (
  sid_hash TEXT PRIMARY KEY, user_id BIGINT NOT NULL, username TEXT NOT NULL, avatar TEXT,
  guilds JSONB NOT NULL, csrf TEXT NOT NULL, created_at TIMESTAMPTZ NOT NULL DEFAULT now(), expires_at TIMESTAMPTZ NOT NULL);
CREATE INDEX IF NOT EXISTS idx_panel_sessions_exp ON panel_sessions (expires_at);"""

class Db:
    def __init__(self, pool): self.pool = pool

    @classmethod
    async def connect(cls, url: str, migrate: bool = True) -> "Db":
        pool = await asyncpg.create_pool(url, min_size=1, max_size=5, command_timeout=10)
        if migrate:  # con un ruolo a privilegi minimi: PANEL_AUTO_MIGRATE=0 e schema creato una volta da admin
            async with pool.acquire() as c:
                await c.execute(SCHEMA)
        return cls(pool)

    async def close(self): await self.pool.close()

    async def create_session(self, h, user, guilds, csrf, ttl):
        await self.pool.execute("DELETE FROM panel_sessions WHERE expires_at < now()")
        await self.pool.execute("INSERT INTO panel_sessions (sid_hash,user_id,username,avatar,guilds,csrf,expires_at) VALUES ($1,$2,$3,$4,$5::jsonb,$6, now() + make_interval(secs => $7))",
                                h, int(user["id"]), user.get("global_name") or user["username"], user.get("avatar"), json.dumps(guilds), csrf, float(ttl))

    async def get_session(self, h):
        r = await self.pool.fetchrow("SELECT user_id, username, avatar, guilds, csrf FROM panel_sessions WHERE sid_hash=$1 AND expires_at > now()", h)
        return None if r is None else {"user_id": r["user_id"], "username": r["username"], "avatar": r["avatar"], "guilds": json.loads(r["guilds"]), "csrf": r["csrf"]}

    async def delete_session(self, h): await self.pool.execute("DELETE FROM panel_sessions WHERE sid_hash=$1", h)

    async def bot_guilds(self, ids: list[int]) -> set[int]:
        rows = await self.pool.fetch("SELECT guild_id FROM guild_config WHERE guild_id = ANY($1::bigint[])", ids)
        return {r["guild_id"] for r in rows}

    async def get_guild(self, gid: int):
        r = await self.pool.fetchrow("SELECT modules, language FROM guild_config WHERE guild_id=$1", gid)
        return None if r is None else {"modules": json.loads(r["modules"]), "language": r["language"]}

    async def set_module(self, gid: int, key: str, active: bool, by: int) -> None:
        """Stessa semantica del bot (jsonb_set + riga nello storico) più NOTIFY, per far invalidare la cache dei moduli al bot."""
        async with self.pool.acquire() as c, c.transaction():
            row = await c.fetchrow("SELECT (modules -> $2)::boolean AS v FROM guild_config WHERE guild_id=$1 FOR UPDATE", gid, key)
            if row is None:
                raise LookupError(gid)
            await c.execute("UPDATE guild_config SET modules = jsonb_set(modules, ARRAY[$2], to_jsonb($3::boolean)), updated_at = now() WHERE guild_id=$1", gid, key, active)
            await c.execute("INSERT INTO guild_config_history (guild_id, changed_by, change_type, key_name, old_value, new_value) VALUES ($1,$2,'module',$3,$4,$5)",
                            gid, by, key, json.dumps(row["v"]), json.dumps(active))
            await c.execute("SELECT pg_notify('guild_config_changed', $1)", json.dumps({"guild_id": gid, "what": "modules"}))

    async def history(self, gid: int, limit: int):
        rows = await self.pool.fetch("SELECT id, changed_by, change_type, key_name, old_value, new_value, created_at FROM guild_config_history WHERE guild_id=$1 ORDER BY created_at DESC, id DESC LIMIT $2", gid, limit)
        return [{"id": r["id"], "by": None if r["changed_by"] is None else str(r["changed_by"]), "type": r["change_type"], "key": r["key_name"],
                 "old": r["old_value"], "new": r["new_value"], "at": r["created_at"].isoformat()} for r in rows]
