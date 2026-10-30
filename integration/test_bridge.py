import hashlib,hmac,json,time,unittest
from types import SimpleNamespace
from aiohttp.test_utils import TestClient,TestServer
from iyokai_site_bridge import build_site_bridge
KEY='test-only-'+'x'*40
class BridgeTests(unittest.IsolatedAsyncioTestCase):
    async def asyncSetUp(self):
        self.changes=[]
        async def guild(bot,gid,uid):return SimpleNamespace(id=gid) if uid==42 else None
        async def profile(bot,uid):return []
        async def role(g,kind,rid,uid):self.changes.append((g.id,kind,rid,uid))
        fake=SimpleNamespace(server_gestibile=guild,server_gestibili=profile,applica_ruolo=role)
        bot=SimpleNamespace(intents=SimpleNamespace(members=True,message_content=False))
        self.client=TestClient(TestServer(build_site_bridge(bot,KEY,bridge=fake,owner_id=42)));await self.client.start_server()
    async def asyncTearDown(self):await self.client.close()
    async def send(self,data,nonce='0'*32,stamp=None,mac=None):
        raw=json.dumps(data).encode();stamp=str(int(time.time())) if stamp is None else stamp
        signature=hmac.new(KEY.encode(),stamp.encode()+b'.'+nonce.encode()+b'.'+raw,hashlib.sha256).hexdigest()
        return await self.client.post('/v1/request',data=raw,headers={'X-iYokai-Time':stamp,'X-iYokai-Nonce':nonce,'X-iYokai-MAC':mac or signature})
    async def test_auth_replay_and_expiry(self):
        data={'action':'profile','user_id':'42'}
        self.assertEqual((await self.send(data,mac='bad')).status,403)
        self.assertEqual((await self.send(data,stamp='1')).status,403)
        self.assertEqual((await self.send(data)).status,200)
        self.assertEqual((await self.send(data)).status,409)
    async def test_owner_is_not_guild_owner(self):
        r=await self.send({'action':'capabilities','user_id':'7'});self.assertEqual(r.status,403)
        r=await self.send({'action':'capabilities','user_id':'42'},nonce='1'*32)
        self.assertFalse((await r.json())['portal_approval_verified'])
    async def test_guild_authorization_and_role_validation(self):
        data={'action':'role','guild_id':'111','user_id':'7','kind':'admin','role_id':'99'}
        self.assertEqual((await self.send(data)).status,403)
        data['user_id']='42';data['kind']='arbitrary'
        self.assertEqual((await self.send(data,nonce='1'*32)).status,400)
        data['kind']='mod'
        self.assertEqual((await self.send(data,nonce='2'*32)).status,200)
        self.assertEqual(self.changes,[(111,'mod',99,42)])
    async def test_unknown_action_and_malformed_body(self):
        self.assertEqual((await self.send({'action':'eval','user_id':'42'})).status,400)
        self.assertEqual((await self.send([],nonce='1'*32)).status,400)
if __name__=='__main__':unittest.main()
