import asyncio, re, time

class TTL:
    """Cache con scadenza e un solo aggiornamento alla volta (niente raffiche verso Twitch/YouTube)."""
    def __init__(self): self.v, self.locks = {}, {}  # un lock per chiave: il token Twitch si può chiedere mentre "twitch" è in aggiornamento
    async def get(self, key, ttl, fn):
        hit = self.v.get(key)
        if hit and time.monotonic() - hit[0] < ttl: return hit[1]
        async with self.locks.setdefault(key, asyncio.Lock()):
            hit = self.v.get(key)
            if hit and time.monotonic() - hit[0] < ttl: return hit[1]
            val = await fn(); self.v[key] = (time.monotonic(), val); return val

async def _twitch_token(s, http, cache):
    async def go():
        r = await http.post("https://id.twitch.tv/oauth2/token", data={"client_id": s.twitch_client_id, "client_secret": s.twitch_client_secret, "grant_type": "client_credentials"})
        r.raise_for_status(); return r.json()["access_token"]
    return await cache.get("twitch_token", 3000, go)

async def twitch_live(s, http, cache):
    """None = sconosciuto/non configurato (il sito non mostra nulla); mai un falso OFFLINE."""
    if not (s.twitch_client_id and s.twitch_client_secret and s.twitch_login): return None
    async def go():
        try:
            r = await http.get("https://api.twitch.tv/helix/streams", params={"user_login": s.twitch_login}, headers={"Client-Id": s.twitch_client_id, "Authorization": f"Bearer {await _twitch_token(s, http, cache)}"})
            if r.status_code == 401: cache.v.pop("twitch_token", None); return None
            r.raise_for_status(); d = r.json().get("data", [])
            return {"live": bool(d), "title": (d[0].get("title") or "")[:120] if d else ""}
        except Exception: return None
    return await cache.get("twitch", 45, go)

async def youtube_feed(http, cache, cid):
    if not re.fullmatch(r"UC[\w-]{22}", cid): return None
    async def go():
        try:
            r = await http.get("https://www.youtube.com/feeds/videos.xml", params={"channel_id": cid}); r.raise_for_status()
            return [m.group(1) for e in r.text[:600_000].split("<entry>")[1:16] if (m := re.search(r"<published>([^<]{10,40})</published>", e))]
        except Exception: return None
    return await cache.get(f"yt:{cid}", 300, go)
