import base64, hashlib, hmac, json, secrets, time
from collections import deque

def b64(b: bytes) -> str:
    return base64.urlsafe_b64encode(b).rstrip(b"=").decode()

def pkce_pair() -> tuple[str, str]:
    v = b64(secrets.token_bytes(48))
    return v, b64(hashlib.sha256(v.encode()).digest())

def derive(secret: str, purpose: str) -> bytes:
    return hmac.new(secret.encode(), purpose.encode(), hashlib.sha256).digest()

def sign(key: bytes, payload: dict, ttl: int) -> str:
    body = b64(json.dumps({**payload, "exp": int(time.time()) + ttl}).encode())
    return f"{body}.{b64(hmac.new(key, body.encode(), hashlib.sha256).digest())}"

def unsign(key: bytes, token: str) -> dict | None:
    try:
        body, sig = token.split(".", 1)
        if not hmac.compare_digest(sig, b64(hmac.new(key, body.encode(), hashlib.sha256).digest())):
            return None
        data = json.loads(base64.urlsafe_b64decode(body + "=" * (-len(body) % 4)))
        return data if data.get("exp", 0) > time.time() else None
    except Exception:
        return None

def hash_sid(sid: str) -> str:
    return hashlib.sha256(sid.encode()).hexdigest()

def client_ip(request, trust_cf: bool) -> str:
    if trust_cf and (h := request.headers.get("cf-connecting-ip")):
        return h.strip()[:64]
    return request.client.host if request.client else "?"

class RateLimiter:
    """Finestra scorrevole in memoria, con tetto alle chiavi per non crescere senza limite."""
    def __init__(self, max_keys: int = 10_000):
        self.hits: dict[str, deque] = {}
        self.max_keys = max_keys
        self.deadlines = {}

    def allow(self, key: str, limit: int, window: int) -> bool:
        now = time.monotonic()
        if key not in self.hits and len(self.hits) >= self.max_keys:
            self.hits = {k: q for k, q in self.hits.items() if self.deadlines.get(k,0) > now}
            self.deadlines = {k:self.deadlines[k] for k in self.hits}
            # Do not evict live rate limits to make room for attacker-controlled keys.
            if len(self.hits) >= self.max_keys:
                return False
        q = self.hits.setdefault(key, deque())
        while q and now - q[0] > window:
            q.popleft()
        if len(q) >= limit:
            return False
        q.append(now)
        self.deadlines[key] = now + window
        return True
