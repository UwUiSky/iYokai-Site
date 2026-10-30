"""ASGI retry contracts; memory storage/Discord transport, no live services."""
import asyncio
import pytest
from fastapi import HTTPException
from app.main import app
from app.vault import encrypt
from test_foundations import setup, login

ID='a'*32

def install(monkeypatch,delivery='failed',blocked=False):
    row={'id':ID,'user_id':123,'topic':'support','language':'it',
         'message':encrypt(app.state.s,'A private support message.'),'delivery':delivery}
    calls=[]
    async def owner(request,action,user_id):
        if blocked:raise HTTPException(403,'owner only')
        return {'is_bot_owner':True}
    async def claim(key):
        if key!=ID or row['delivery'] not in ('failed','unconfigured','invalid_destination'):return None
        row['delivery']='retrying'
        return dict(row)
    async def save(key,value):row['delivery']=value
    async def send(*args):calls.append(args);return 'delivered'
    monkeypatch.setattr('app.bot_bridge.call',owner)
    monkeypatch.setattr(app.state.db,'claim_contact_retry',claim,raising=False)
    monkeypatch.setattr(app.state.db,'contact_delivery',save,raising=False)
    monkeypatch.setattr('app.contact_delivery.deliver',send)
    return row,calls

async def test_retry_requires_session_csrf_and_live_owner_check(setup,monkeypatch):
    c,_=setup;row,calls=install(monkeypatch,blocked=True)
    url=f'/api/owner/contacts/{ID}/retry'
    assert (await c.post(url)).status_code==401
    profile=await login(c)
    assert (await c.post(url)).status_code==403
    headers={'Origin':'https://iyokai.dev','X-CSRF-Token':profile['csrf']}
    assert (await c.post(url,headers=headers)).status_code==403
    assert row['delivery']=='failed' and not calls

@pytest.mark.parametrize('state',['failed','unconfigured','invalid_destination'])
async def test_owner_retries_known_failed_delivery_once(setup,monkeypatch,state):
    c,_=setup;profile=await login(c);row,calls=install(monkeypatch,state)
    h={'Origin':'https://iyokai.dev','X-CSRF-Token':profile['csrf']}
    response=await c.post(f'/api/owner/contacts/{ID}/retry',headers=h)
    assert response.status_code==200 and response.json()=={'id':ID,'delivery':'delivered'}
    assert len(calls)==1 and calls[0][4]=='A private support message.'
    assert (await c.post(f'/api/owner/contacts/{ID}/retry',headers=h)).status_code==409
    assert len(calls)==1 and row['delivery']=='delivered'

@pytest.mark.parametrize('state',['delivered','unknown','pending','retrying'])
async def test_uncertain_inflight_and_delivered_contacts_are_not_replayed(setup,monkeypatch,state):
    c,_=setup;profile=await login(c);row,calls=install(monkeypatch,state)
    h={'Origin':'https://iyokai.dev','X-CSRF-Token':profile['csrf']}
    assert (await c.post(f'/api/owner/contacts/{ID}/retry',headers=h)).status_code==409
    assert row['delivery']==state and not calls

async def test_concurrent_click_and_timeout_do_not_duplicate_delivery(setup,monkeypatch):
    c,_=setup;profile=await login(c);row,calls=install(monkeypatch)
    h={'Origin':'https://iyokai.dev','X-CSRF-Token':profile['csrf']}
    entered,release=asyncio.Event(),asyncio.Event()
    async def send(*args):calls.append(args);entered.set();await release.wait();return 'unknown'
    monkeypatch.setattr('app.contact_delivery.deliver',send)
    first=asyncio.create_task(c.post(f'/api/owner/contacts/{ID}/retry',headers=h))
    await asyncio.wait_for(entered.wait(),2)
    try:
        second=await c.post(f'/api/owner/contacts/{ID}/retry',headers=h)
        assert second.status_code==409
    finally:release.set()
    assert (await first).json()['delivery']=='unknown'
    assert (await c.post(f'/api/owner/contacts/{ID}/retry',headers=h)).status_code==409
    assert len(calls)==1

async def test_bad_ticket_and_missing_key_never_send_plaintext(setup,monkeypatch):
    from dataclasses import replace
    c,_=setup;profile=await login(c);row,calls=install(monkeypatch)
    h={'Origin':'https://iyokai.dev','X-CSRF-Token':profile['csrf']}
    assert (await c.post('/api/owner/contacts/not-a-ticket/retry',headers=h)).status_code==422
    app.state.s=replace(app.state.s,data_keys='')
    assert (await c.post(f'/api/owner/contacts/{ID}/retry',headers=h)).status_code==503
    assert not calls and row['delivery']=='failed'

async def test_worker_failure_preserves_claim_instead_of_reopening_retry(setup,monkeypatch):
    c,_=setup;profile=await login(c);row,calls=install(monkeypatch)
    h={'Origin':'https://iyokai.dev','X-CSRF-Token':profile['csrf']}
    async def broken(*args):calls.append(args);raise RuntimeError('simulated worker failure')
    monkeypatch.setattr('app.contact_delivery.deliver',broken)
    with pytest.raises(Exception):await c.post(f'/api/owner/contacts/{ID}/retry',headers=h)
    assert row['delivery']=='retrying' and len(calls)==1
    assert (await c.post(f'/api/owner/contacts/{ID}/retry',headers=h)).status_code==409
    assert len(calls)==1
