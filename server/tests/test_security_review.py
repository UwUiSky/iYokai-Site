import json
from dataclasses import replace
from pathlib import Path
from types import SimpleNamespace
import httpx,pytest
from cryptography.fernet import Fernet
from fastapi import HTTPException
from pydantic import ValidationError
from app.vault import encrypt,decrypt
from app.security import RateLimiter
from app.billing import Usage,Receipt
from app.commerce import catalogue
from app.contact_delivery import deliver

def test_encrypted_contact_roundtrip_rotation_and_wrong_key():
    a,b=Fernet.generate_key().decode(),Fernet.generate_key().decode()
    s=SimpleNamespace(data_keys=a);raw='Private contact 😀'*300
    value=encrypt(s,raw)
    assert raw not in value and decrypt(s,value)==raw and len(value)<32768
    assert decrypt(SimpleNamespace(data_keys=b+','+a),value)==raw
    with pytest.raises(HTTPException):decrypt(SimpleNamespace(data_keys=b),value)
    with pytest.raises(HTTPException):encrypt(SimpleNamespace(data_keys=''),raw)

def test_rate_limiter_capacity_does_not_evict_live_limits(monkeypatch):
    now=[100.0];monkeypatch.setattr('app.security.time.monotonic',lambda:now[0])
    r=RateLimiter(max_keys=2)
    assert r.allow('contact',1,3600) and r.allow('short',1,60)
    assert not r.allow('attack',1,60) and len(r.hits)==2
    now[0]+=61
    assert r.allow('new',1,60)
    assert not r.allow('contact',1,3600) and len(r.hits)==2

def test_ai_tokens_reject_boolean_and_string():
    for tokens in (True,'2048',1.5):
        with pytest.raises(ValidationError):Usage.model_validate({'event_id':'test','user_id':'123','tokens':tokens})

def test_catalogue_has_three_unpriced_vip_levels_and_no_checkout():
    root=Path(__file__).resolve().parents[1]
    data=catalogue(SimpleNamespace(commerce_file=str(root/'commerce.example.json')))
    assert data['launch_free'] and not data['checkout_ready']
    assert [p['id'] for p in data['products']]==['premium','vip-1','vip-5','vip-20']
    assert all(p['monthly_minor'] is None and p['annual_minor'] is None for p in data['products'])

@pytest.mark.asyncio
async def test_discord_delivery_checks_guild_and_disables_mentions(tmp_path,monkeypatch):
    path=tmp_path/'settings.json';path.write_text(json.dumps({'contact_discord':{'guild_id':'111','channel_id':'222','token_env':'DISCORD_BOT_TOKEN'}}));monkeypatch.setenv('DISCORD_BOT_TOKEN','test-token')
    posts=[];guild=['wrong']
    def handler(req):
        if req.method=='GET':return httpx.Response(200,json={'guild_id':guild[0],'type':0})
        posts.append(json.loads(req.content));return httpx.Response(200,json={'id':'333'})
    async with httpx.AsyncClient(transport=httpx.MockTransport(handler)) as http:
        request=SimpleNamespace(app=SimpleNamespace(state=SimpleNamespace(s=SimpleNamespace(site_settings_file=str(path)),http=http)))
        assert await deliver(request,'ticket','123','support','@everyone test','it')=='invalid_destination'
        assert not posts
        guild[0]='111'
        assert await deliver(request,'ticket','123','support','@everyone test','it')=='delivered'
        assert posts[0]['allowed_mentions']=={'parse':[]}

@pytest.mark.asyncio
async def test_discord_post_timeout_is_ambiguous_and_never_retried(tmp_path,monkeypatch):
    path=tmp_path/'settings.json';path.write_text(json.dumps({'contact_discord':{'guild_id':'111','channel_id':'222','token_env':'DISCORD_BOT_TOKEN'}}));monkeypatch.setenv('DISCORD_BOT_TOKEN','test-token');posts=[]
    def handler(req):
        if req.method=='GET':return httpx.Response(200,json={'guild_id':'111','type':0})
        posts.append(req);raise httpx.ReadTimeout('test-only')
    async with httpx.AsyncClient(transport=httpx.MockTransport(handler)) as http:
        request=SimpleNamespace(app=SimpleNamespace(state=SimpleNamespace(s=SimpleNamespace(site_settings_file=str(path)),http=http)))
        assert await deliver(request,'ticket','123','support','test','it')=='unknown'
        assert len(posts)==1
