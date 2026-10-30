import test from 'node:test';
import assert from 'node:assert/strict';
import { createPanelNavigation } from '../src/core/panels.js';
test('one wheel burst advances one panel, swipe direction and modal blocking are respected',async()=>{
 const listeners={},calls=[],selected=[];let active=true;
 globalThis.addEventListener=(type,fn)=>{listeners[type]=fn;};
 globalThis.innerHeight=800;globalThis.scrollY=0;
 globalThis.location={hash:''};globalThis.history={pushState(_a,_b,hash){location.hash=hash;},replaceState(_a,_b,hash){location.hash=hash;}};
 const sections=['one','two','three'].map((id,i)=>({id,offsetTop:i*800}));
 const lenis={scrollTo(target,options){calls.push(target.id);options.onComplete();},resize(){}};
 const panels=createPanelNavigation({sections,lenis,enabled:()=>active,onSelect:(i,options)=>selected.push({i,...options}),reduced:{matches:false}});
 const target={closest:()=>null};let prevented=0;
 const wheel=()=>listeners.wheel({target,deltaY:80,deltaMode:0,preventDefault(){prevented++;}});
 wheel();wheel();wheel();assert.deepEqual(calls,['two']);assert.equal(panels.index,1);assert.equal(prevented,3);
 assert.deepEqual(selected[0],{i:1,immediate:false,direction:1});
 await new Promise(resolve=>setTimeout(resolve,220));wheel();assert.equal(panels.index,2);
 active=false;wheel();assert.equal(calls.length,2);active=true;
 listeners.touchstart({target,touches:[{clientX:100,clientY:100}]});listeners.touchend({changedTouches:[{clientX:100,clientY:220}]});assert.equal(panels.index,1);
 listeners.keydown({target,key:'Home',preventDefault(){}});assert.equal(panels.index,0);
 panels.go(-10,{immediate:true});assert.equal(panels.index,0);assert.equal(selected.at(-1).immediate,true);panels.go(40,{immediate:true});assert.equal(panels.index,2);
});

test('a fitting catalogue advances the panel; an overflowing one keeps wheel and keyboard input',()=>{
 const listeners={},calls=[];
 globalThis.addEventListener=(type,fn)=>listeners[type]=fn;
 globalThis.innerHeight=800;globalThis.scrollY=0;globalThis.location={hash:'#protocol/discord'};
 const sections=['one','two'].map((id,i)=>({id,offsetTop:i*800}));
 const panels=createPanelNavigation({sections,lenis:{scrollTo(s,o){calls.push(s.id);o.onComplete();},resize(){}},enabled:()=>true,onSelect(){},reduced:{matches:true},historyMode:false});
 const area={scrollHeight:400,clientHeight:400};
 const target={closest:selector=>selector==='[data-panel-scroll]'?area:null};
 let prevented=0;
 const wheel=()=>listeners.wheel({target,deltaY:80,deltaMode:0,preventDefault(){prevented++;}});
 wheel();assert.equal(panels.index,1);assert.equal(prevented,1);
 area.scrollHeight=900;area.scrollTop=100;
 wheel();listeners.keydown({target,key:'Home',preventDefault(){prevented++;}});
 assert.equal(panels.index,1);assert.equal(prevented,1);assert.deepEqual(calls,['two']);
 area.scrollHeight=400;
 listeners.keydown({target,key:'Home',preventDefault(){prevented++;}});
 assert.equal(panels.index,0);assert.equal(prevented,2);assert.equal(location.hash,'#protocol/discord');
});


test('catalogue boundaries hand the next wheel or swipe to the page without momentum skips',async()=>{
 const listeners={},calls=[];globalThis.addEventListener=(t,f)=>listeners[t]=f;globalThis.location={hash:''};globalThis.innerHeight=800;
 const sections=['one','two','three'].map((id,i)=>({id,offsetTop:800*i}));
 const nav=createPanelNavigation({sections,lenis:{scrollTo(s,o){calls.push(s.id);o.onComplete();},resize(){}},enabled:()=>true,onSelect(){},reduced:{matches:true},historyMode:false});
 const area={scrollTop:100,clientHeight:400,scrollHeight:900},target={closest:s=>s==='[data-panel-scroll]'?area:null};
 const wheel=()=>listeners.wheel({target,deltaY:80,deltaMode:0,preventDefault(){}});
 wheel();assert.equal(nav.index,0);area.scrollTop=500;wheel();assert.equal(nav.index,0);
 await new Promise(r=>setTimeout(r,220));wheel();assert.equal(nav.index,1);
 listeners.touchstart({target,touches:[{clientX:100,clientY:200}]});listeners.touchmove({touches:[{clientX:100,clientY:100}],preventDefault(){}});listeners.touchend({changedTouches:[{clientX:100,clientY:100}]});assert.equal(nav.index,2);
 area.scrollTop=100;listeners.touchstart({target,touches:[{clientX:100,clientY:200}]});listeners.touchmove({touches:[{clientX:100,clientY:100}],preventDefault(){throw Error('should stay native');}});listeners.touchend({changedTouches:[{clientX:100,clientY:100}]});assert.equal(nav.index,2);
 area.scrollTop=0;listeners.touchstart({target,touches:[{clientX:100,clientY:100}]});listeners.touchmove({touches:[{clientX:100,clientY:200}],preventDefault(){}});listeners.touchend({changedTouches:[{clientX:100,clientY:200}]});assert.equal(nav.index,1);
});
