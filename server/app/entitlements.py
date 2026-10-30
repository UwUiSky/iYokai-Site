"""Policy and billing-independent entitlements. Never trust a browser tier claim."""
import hashlib, hmac, json, time
from datetime import datetime, timezone
from pathlib import Path
from fastapi import HTTPException

RANK={"free":0,"premium":1,"vip":2}
CYCLES=("monthly","annual","lifetime")

def policy(settings):
    data=json.loads(Path(settings.policy_file).read_text())
    if not isinstance(data.get("identities"),list): raise RuntimeError("Invalid panel policy")
    return data

def tier_for(grants, now=None):
    now=now or datetime.now(timezone.utc); valid=[]
    for g in grants:
        if not g.get("active",True) or g.get("tier") not in RANK: continue
        def date(v): return datetime.fromisoformat(v.replace("Z","+00:00")) if isinstance(v,str) else v
        start,end=date(g.get("starts_at")),date(g.get("expires_at"))
        if start and start>now or end and end<=now: continue
        valid.append(g)
    tier=max((g["tier"] for g in valid),key=RANK.get,default="free")
    return {"tier":tier,"sources":[{"source":g.get("source","purchase"),"tier":g["tier"],"expires_at":str(g.get("expires_at")) if g.get("expires_at") else None} for g in valid]}

def support_grant(rule,member):
    if member.get("pending"): return None
    roles=set(member.get("roles",[]))
    if roles.intersection(rule.get("vip_roles",[])): tier="vip"
    elif roles.intersection(rule.get("premium_roles",[])): tier="premium"
    elif member.get("premium_since") and rule.get("boost_tier") in ("premium","vip"): tier=rule["boost_tier"]
    else: return None
    return {"tier":tier,"source":"discord_support","active":True}

def verify_internal(secret,signature,body,now=None):
    if len(secret)<32: raise HTTPException(503,"Internal integration not configured")
    try:
        parts=dict(p.split("=",1) for p in signature.split(","));stamp=int(parts["t"])
        expected=hmac.new(secret.encode(),str(stamp).encode()+b"."+body,hashlib.sha256).hexdigest()
        if abs((now or time.time())-stamp)>300 or not hmac.compare_digest(expected,parts["v1"]): raise ValueError()
    except (ValueError,KeyError): raise HTTPException(403,"Invalid signature")
