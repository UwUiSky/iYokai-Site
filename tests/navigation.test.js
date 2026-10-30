import test from 'node:test';import assert from 'node:assert/strict';
import {currentRoute,setRoute,normalizeRoute} from '../src/core/navigation.js';
test('incoming OAuth route survives normalization while the visible URL stays at root',()=>{
 globalThis.location={pathname:'/',search:'',hash:'#panel'};const urls=[];
 globalThis.history={state:null,replaceState(state,_,url){this.state=state;urls.push(url);location.hash='';},pushState(state,_,url){this.state=state;urls.push(url);location.hash='';}};
 normalizeRoute();assert.equal(currentRoute(),'#panel');assert.deepEqual(urls,['/']);
 setRoute('#protocol/discord');assert.equal(currentRoute(),'#protocol/discord');assert.equal(urls.at(-1),'/');
 assert.throws(()=>setRoute('https://evil.invalid'),TypeError);
});
