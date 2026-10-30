import test from 'node:test';
import assert from 'node:assert/strict';
import { assetCacheKey, fetchCachedAsset } from '../src/core/cache-policy.js';
const origin='https://iyokai.example';
const manifest={'/cinematic/kitsune.glb':'aaaaaaaaaaaaaaaa','/assets/app-hash.js':'bbbbbbbbbbbbbbbb'};
function storage(){const items=new Map();return{items,async open(){return{async match(key){return items.get(key)?.clone()},async put(key,res){items.set(key,res)},async keys(){return[...items.keys()].map(x=>new Request(x))},async delete(key){return items.delete(key)}}}}}
const response=body=>new Response(body,{headers:{'Content-Type':'model/gltf-binary'}});
test('a repeated model request is served locally and a changed model revision is fetched anew',async()=>{
 const cacheStorage=storage();let calls=0;
 const fetchImpl=async()=>{calls++;return response('model-'+calls)};
 const request=new Request(origin+'/cinematic/kitsune.glb');
 assert.equal(await(await fetchCachedAsset(request,{origin,manifest,cacheStorage,fetchImpl})).text(),'model-1');
 assert.equal(await(await fetchCachedAsset(request,{origin,manifest,cacheStorage,fetchImpl})).text(),'model-1');
 assert.equal(calls,1);
 const revised={...manifest,'/cinematic/kitsune.glb':'cccccccccccccccc'};
 assert.equal(await(await fetchCachedAsset(request,{origin,manifest:revised,cacheStorage,fetchImpl})).text(),'model-2');
 assert.equal(calls,2);assert.equal(cacheStorage.items.size,2);
});
test('API, auth, documents, external requests, query strings, ranges and writes bypass the asset cache',()=>{
 for(const url of ['/api/me','/api/guilds/1','/signin-with-chatgpt','/index.html','/cinematic/avatar.json','/cinematic/kitsune.glb?token=private','https://other.example/cinematic/kitsune.glb']){
  assert.equal(assetCacheKey(new Request(new URL(url,origin)),origin,manifest),null,url);
 }
 assert.equal(assetCacheKey(new Request(origin+'/cinematic/kitsune.glb',{method:'POST'}),origin,manifest),null);
 assert.equal(assetCacheKey(new Request(origin+'/cinematic/kitsune.glb',{headers:{Range:'bytes=0-20'}}),origin,manifest),null);
 assert.equal(assetCacheKey({url:origin+'/cinematic/kitsune.glb',method:'GET',mode:'navigate'},origin,manifest),null);
});
test('a login page returned with HTTP 200 is never stored as a model',async()=>{
 const cacheStorage=storage();let calls=0;const fetchImpl=async()=>{calls++;return new Response('<html>Sign in</html>',{headers:{'Content-Type':'text/html'}})};
 for(let i=0;i<2;i++)await fetchCachedAsset(new Request(origin+'/cinematic/kitsune.glb'),{origin,manifest,cacheStorage,fetchImpl});
 assert.equal(cacheStorage.items.size,0);assert.equal(calls,2);
});
test('blocked storage and quota failures preserve the usable network response',async()=>{
 for(const cacheStorage of [{open:async()=>{throw Error('denied')}},{open:async()=>({match:async()=>null,put:async()=>{throw Error('quota')}})}]){
  const res=await fetchCachedAsset(new Request(origin+'/cinematic/kitsune.glb'),{origin,manifest,cacheStorage,fetchImpl:async()=>response('valid model')});
  assert.equal(await res.text(),'valid model');
 }
});
test('an API error disguised as a successful model response is not cached',async()=>{
 const cacheStorage=storage();let calls=0;
 const fetchImpl=async()=>{calls++;return new Response('{"error":"not ready"}',{headers:{'Content-Type':'application/json'}})};
 for(let i=0;i<2;i++)await fetchCachedAsset(new Request(origin+'/cinematic/kitsune.glb'),{origin,manifest,cacheStorage,fetchImpl});
 assert.equal(cacheStorage.items.size,0);assert.equal(calls,2);
});
