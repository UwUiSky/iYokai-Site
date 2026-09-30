import httpx
API = "https://discord.com/api/v10"
MANAGE_GUILD, ADMIN = 0x20, 0x8

async def _post(path: str, data: dict) -> httpx.Response:
    async with httpx.AsyncClient(timeout=10) as c:
        return await c.post(f"{API}{path}", data=data)

async def exchange_code(s, code: str, verifier: str) -> str:
    r = await _post("/oauth2/token", {"client_id": s.client_id, "client_secret": s.client_secret, "grant_type": "authorization_code", "code": code, "redirect_uri": s.redirect_uri, "code_verifier": verifier})
    r.raise_for_status()
    return r.json()["access_token"]

async def _get(path: str, token: str):
    async with httpx.AsyncClient(timeout=10) as c:
        r = await c.get(f"{API}{path}", headers={"Authorization": f"Bearer {token}"})
        r.raise_for_status()
        return r.json()

async def fetch_me(token: str) -> dict:
    return await _get("/users/@me", token)

async def fetch_guilds(token: str) -> list[dict]:
    return await _get("/users/@me/guilds", token)

async def revoke(s, token: str) -> None:
    try:
        await _post("/oauth2/token/revoke", {"client_id": s.client_id, "client_secret": s.client_secret, "token": token})
    except Exception:
        pass  # best effort: il token non viene comunque salvato

def manageable(guilds: list[dict]) -> list[dict]:
    """Solo i server che l'utente può amministrare; id sempre come stringa (gli snowflake superano 2^53)."""
    return [{"id": str(g["id"]), "name": g["name"], "icon": g.get("icon")} for g in guilds if g.get("owner") or int(g.get("permissions", 0)) & (MANAGE_GUILD | ADMIN)]
