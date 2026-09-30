import asyncio, json
from urllib.parse import parse_qs, urlparse
import asyncpg, pytest
from app import discord as dc
from app.security import b64, pkce_pair, sign, unsign
import hashlib, os

GUILDS = [{"id": "111", "name": "A", "permissions": "32"}, {"id": "222", "name": "B", "permissions": "0"}, {"id": "333", "name": "C", "owner": True, "permissions": "0"}]
OK = {"Origin": "https://iyokai.dev"}

async def login(client, monkeypatch, guilds=GUILDS):
    async def ex(s, code, v): return "tok"
    async def me(t): return {"id": "999", "username": "kit"}
    async def gl(t): return guilds
    async def rv(s, t): pass
    for n, f in (("exchange_code", ex), ("fetch_me", me), ("fetch_guilds", gl), ("revoke", rv)): monkeypatch.setattr(dc, n, f)
    r = await client.get("/api/auth/login")
    state = parse_qs(urlparse(r.headers["location"]).query)["state"][0]
    return await client.get("/api/auth/callback", params={"code": "c", "state": state})

async def csrf(client): return (await client.get("/api/me")).json()["csrf"]

def test_pkce_and_signing():
    v, c = pkce_pair()
    assert c == b64(hashlib.sha256(v.encode()).digest())
    k = b"x" * 32
    t = sign(k, {"a": 1}, 60)
    assert unsign(k, t)["a"] == 1 and unsign(k, t[:-2] + "zz") is None and unsign(b"y" * 32, t) is None
    assert unsign(k, sign(k, {"a": 1}, -1)) is None

async def test_login_redirect_flags(client):
    r = await client.get("/api/auth/login")
    q = parse_qs(urlparse(r.headers["location"]).query)
    assert r.status_code == 303 and q["code_challenge_method"] == ["S256"] and q["scope"] == ["identify guilds"]
    c = r.headers["set-cookie"].lower()
    assert "httponly" in c and "secure" in c and "samesite=lax" in c and "path=/api/auth" in c

async def test_callback_rejects_bad_state(client):
    await client.get("/api/auth/login")
    r = await client.get("/api/auth/callback", params={"code": "c", "state": "sbagliato"})
    assert r.headers["location"].endswith("#panel-error") and "__host-iy_sid" not in r.headers.get("set-cookie", "").lower()

async def test_login_me_and_cookie(client, monkeypatch):
    r = await login(client, monkeypatch)
    assert r.headers["location"].endswith("/#panel")
    c = r.headers["set-cookie"].lower()
    assert "__host-iy_sid=" in c and "httponly" in c and "secure" in c and "path=/" in c and "domain" not in c
    me = (await client.get("/api/me")).json()
    assert [g["id"] for g in me["guilds"]] == ["111"]  # 222 senza permessi, 333 senza bot
    assert me["user"]["id"] == "999"
    assert (await client.get("/api/guilds/111")).json()["modules"][0]["active"] is False

async def test_requires_auth(client):
    assert (await client.get("/api/me")).status_code == 401
    assert (await client.patch("/api/guilds/111/modules/automod", json={"active": True})).status_code == 401

async def test_toggle_guards(client, monkeypatch):
    await login(client, monkeypatch); t = await csrf(client)
    p = lambda gid, key, h: client.patch(f"/api/guilds/{gid}/modules/{key}", json={"active": True}, headers=h)
    assert (await p(111, "automod", {})).status_code == 403                                  # niente Origin/CSRF
    assert (await p(111, "automod", {"Origin": "https://evil.example", "X-CSRF-Token": t})).status_code == 403
    assert (await p(111, "automod", {**OK, "X-CSRF-Token": "no"})).status_code == 403
    good = {**OK, "X-CSRF-Token": t}
    assert (await p(222, "automod", good)).status_code == 403                                # nessun permesso
    assert (await p(333, "automod", good)).status_code == 404                                # bot assente
    assert (await p(111, "drop_table", good)).status_code == 404                             # modulo non in allowlist
    assert (await p(99999999999999999999, "automod", good)).status_code in (403, 422)

async def test_toggle_writes_like_the_bot(client, monkeypatch):
    await login(client, monkeypatch); t = await csrf(client); h = {**OK, "X-CSRF-Token": t}
    listener = await asyncpg.connect(os.environ["DATABASE_URL"]); got = asyncio.Queue()
    await listener.add_listener("guild_config_changed", lambda *a: got.put_nowait(a[3]))
    assert (await client.patch("/api/guilds/111/modules/automod", json={"active": True}, headers=h)).json() == {"key": "automod", "active": True}
    assert json.loads(await asyncio.wait_for(got.get(), 3)) == {"guild_id": 111, "what": "modules"}
    await client.patch("/api/guilds/111/modules/automod", json={"active": False}, headers=h)
    pool = client._transport.app.state.db.pool
    assert await pool.fetchval("SELECT (modules -> 'automod')::boolean FROM guild_config WHERE guild_id=111") is False  # lettura identica a quella del bot
    rows = await pool.fetch("SELECT changed_by, change_type, old_value, new_value FROM guild_config_history WHERE guild_id=111 ORDER BY id")
    assert [(r["changed_by"], r["change_type"], r["old_value"], r["new_value"]) for r in rows] == [(999, "module", "null", "true"), (999, "module", "true", "false")]
    hist = (await client.get("/api/guilds/111/history")).json()["items"]
    assert hist[0]["by"] == "999" and hist[0]["new"] == "false"
    await listener.close()

async def test_rate_limit_and_logout(client, monkeypatch):
    await login(client, monkeypatch); t = await csrf(client); h = {**OK, "X-CSRF-Token": t}
    codes = [(await client.patch("/api/guilds/111/modules/fun", json={"active": i % 2 == 0}, headers=h)).status_code for i in range(32)]
    assert codes[:30] == [200] * 30 and 429 in codes[30:]
    assert (await client.post("/api/auth/logout", headers=h)).status_code == 200
    assert (await client.get("/api/me")).status_code == 401
