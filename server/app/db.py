import json
import asyncpg
# Tabella del panel: le sessioni stanno nel DB condiviso, indicizzate per hash dell'id (l'id in chiaro esiste solo nel cookie).
SCHEMA = """
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
CREATE TABLE IF NOT EXISTS panel_contact_requests (
 id TEXT PRIMARY KEY, user_id BIGINT NOT NULL, topic TEXT NOT NULL CHECK(topic IN ('support','lifetime','privacy')),
 message TEXT NOT NULL CHECK(length(message) BETWEEN 20 AND 32768), language TEXT NOT NULL,
 created_at TIMESTAMPTZ NOT NULL DEFAULT now(), status TEXT NOT NULL DEFAULT 'open', delivery TEXT NOT NULL DEFAULT 'pending');
ALTER TABLE panel_contact_requests ADD COLUMN IF NOT EXISTS delivery TEXT NOT NULL DEFAULT 'pending';
ALTER TABLE panel_contact_requests DROP CONSTRAINT IF EXISTS panel_contact_requests_message_check;
ALTER TABLE panel_contact_requests ADD CONSTRAINT panel_contact_requests_message_check CHECK(length(message) BETWEEN 20 AND 32768);
CREATE INDEX IF NOT EXISTS panel_contact_user ON panel_contact_requests(user_id,created_at);
"""

class ModuleConflict(Exception):
    """The module changed after the client read its state."""

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

    async def set_module(self, gid: int, key: str, active: bool, by: int, expected_active: bool) -> None:
        """Stessa semantica del bot (jsonb_set + riga nello storico) più NOTIFY, per far invalidare la cache dei moduli al bot."""
        async with self.pool.acquire() as c, c.transaction():
            row = await c.fetchrow("SELECT (modules -> $2)::boolean AS v FROM guild_config WHERE guild_id=$1 FOR UPDATE", gid, key)
            if row is None:
                raise LookupError(gid)
            current = bool(row["v"])
            if current != expected_active:
                raise ModuleConflict()
            if current == active:
                return  # Unchanged settings do not create duplicate audit rows.
            await c.execute("UPDATE guild_config SET modules = jsonb_set(modules, ARRAY[$2], to_jsonb($3::boolean)), updated_at = now() WHERE guild_id=$1", gid, key, active)
            await c.execute("INSERT INTO guild_config_history (guild_id, changed_by, change_type, key_name, old_value, new_value) VALUES ($1,$2,'module',$3,$4,$5)",
                            gid, by, key, json.dumps(row["v"]), json.dumps(active))
            await c.execute("SELECT pg_notify('guild_config_changed', $1)", json.dumps({"guild_id": gid, "what": "modules"}))

    async def history(self, gid: int, limit: int):
        rows = await self.pool.fetch("SELECT id, changed_by, change_type, key_name, old_value, new_value, created_at FROM guild_config_history WHERE guild_id=$1 ORDER BY created_at DESC, id DESC LIMIT $2", gid, limit)
        return [{"id": r["id"], "by": None if r["changed_by"] is None else str(r["changed_by"]), "type": r["change_type"], "key": r["key_name"],
                 "old": r["old_value"], "new": r["new_value"], "at": r["created_at"].isoformat()} for r in rows]

    async def entitlements(self,kind,subject):
        rows=await self.pool.fetch("SELECT * FROM panel_entitlements WHERE subject_type=$1 AND subject_id=$2",kind,subject)
        return [dict(r) for r in rows]

    async def apply_receipt(self,event,digest):
        async with self.pool.acquire() as c,c.transaction():
            inserted=await c.fetchval("INSERT INTO panel_payment_events(event_id,body_hash) VALUES($1,$2) ON CONFLICT DO NOTHING RETURNING event_id",event['event_id'],digest)
            if not inserted:
                if await c.fetchval("SELECT body_hash FROM panel_payment_events WHERE event_id=$1",event['event_id'])!=digest:raise ValueError('replayed event changed')
                return True
            changed=await c.fetchval("""INSERT INTO panel_entitlements(grant_id,subject_type,subject_id,tier,cycle,active,starts_at,expires_at,last_event_at)
              VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9) ON CONFLICT(grant_id) DO UPDATE SET tier=EXCLUDED.tier,cycle=EXCLUDED.cycle,
              active=EXCLUDED.active,starts_at=EXCLUDED.starts_at,expires_at=EXCLUDED.expires_at,last_event_at=EXCLUDED.last_event_at
              WHERE panel_entitlements.subject_type=EXCLUDED.subject_type AND panel_entitlements.subject_id=EXCLUDED.subject_id AND (panel_entitlements.last_event_at<EXCLUDED.last_event_at OR (panel_entitlements.last_event_at=EXCLUDED.last_event_at AND NOT EXCLUDED.active)) RETURNING grant_id""",
              event['grant_id'],event['subject_type'],event['subject_id'],event['tier'],event['cycle'],event['active'],event['starts_at'],event['expires_at'],event['occurred_at'])
            if not changed:
                previous=await c.fetchrow('SELECT subject_type,subject_id FROM panel_entitlements WHERE grant_id=$1',event['grant_id'])
                if not previous or previous['subject_type']!=event['subject_type'] or previous['subject_id']!=event['subject_id']:raise ValueError('grant moved between subjects')
            return False

    async def ai_used(self,kind,subject,period):
        return await self.pool.fetchval("SELECT COALESCE(sum(tokens),0)::bigint FROM panel_ai_usage WHERE subject_type=$1 AND subject_id=$2 AND period=$3",kind,subject,period)

    async def consume_ai(self,event_id,kind,subject,period,tokens,limit,digest):
        async with self.pool.acquire() as c,c.transaction():
            await c.execute("SELECT pg_advisory_xact_lock(hashtext($1))",f'aida:{kind}:{subject}:{period}')
            await c.execute("SELECT pg_advisory_xact_lock(hashtext($1))",'aida-event:'+event_id)
            previous=await c.fetchval("SELECT body_hash FROM panel_ai_usage WHERE event_id=$1",event_id)
            if previous:
                if previous!=digest:raise ValueError('usage event changed')
                return True
            used=await c.fetchval("SELECT COALESCE(sum(tokens),0) FROM panel_ai_usage WHERE subject_type=$1 AND subject_id=$2 AND period=$3",kind,subject,period)
            if used+tokens>limit:raise OverflowError('budget exhausted')
            await c.execute("INSERT INTO panel_ai_usage(event_id,subject_type,subject_id,period,tokens,body_hash) VALUES($1,$2,$3,$4,$5,$6)",event_id,kind,subject,period,tokens,digest)
            return False


    async def create_contact(self, user_id, topic, message, language):
        import uuid
        key=uuid.uuid4().hex
        await self.pool.execute("INSERT INTO panel_contact_requests(id,user_id,topic,message,language) VALUES($1,$2,$3,$4,$5)",key,int(user_id),topic,message,language)
        return key

    async def contact_requests(self):
        rows=await self.pool.fetch("SELECT id,user_id,topic,message,language,created_at,status,delivery FROM panel_contact_requests ORDER BY created_at DESC LIMIT 50")
        return [{**dict(r),'user_id':str(r['user_id']),'created_at':r['created_at'].isoformat()} for r in rows]


    async def contact_delivery(self, key, delivery):
        await self.pool.execute("UPDATE panel_contact_requests SET delivery=$2 WHERE id=$1",key,delivery)

    async def claim_contact_retry(self, key):
        # One atomic claim across processes. Pending/ambiguous/in-flight deliveries
        # must never be replayed, even after a worker crash or a second click.
        row=await self.pool.fetchrow("""UPDATE panel_contact_requests
            SET delivery='retrying' WHERE id=$1
            AND delivery IN ('unconfigured','invalid_destination','failed')
            AND message LIKE 'fernet:v1:%'
            RETURNING id,user_id,topic,message,language""",key)
        return dict(row) if row else None
