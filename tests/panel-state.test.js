import test from 'node:test';
import assert from 'node:assert/strict';
import {filterGuilds,moduleLocked,panelError} from '../src/core/panel-state.js';
import {PANEL_MODULES,moduleText} from '../src/data/panel-modules.js';
const guilds=[{id:'9007199254740993',name:'Città Dojo',can_manage:true,bot_present:true},{id:'22',name:'Studio Kitsune',can_manage:true,bot_present:false},{id:'33',name:'Dojo friends',can_manage:false,bot_present:true}];
test('server search combines names, exact string IDs, accents and access filters',()=>{
 assert.deepEqual(filterGuilds(guilds,{query:'CITTA dojo',filter:'manage'}),[guilds[0]]);
 assert.deepEqual(filterGuilds(guilds,{query:'9007199254740993'}),[guilds[0]]);
 assert.deepEqual(filterGuilds(guilds,{filter:'invite'}),[guilds[1]]);
 assert.deepEqual(filterGuilds(guilds,{filter:'member'}),[guilds[2]]);
 assert.deepEqual(filterGuilds(guilds,{query:'Dojo',filter:'invite'}),[]);
 assert.equal(guilds.length,3);
});
test('paid modules need backend permission while active modules remain removable',()=>{
 assert.equal(moduleLocked({active:false,required_tier:'vip',can_enable:false}),true);
 assert.equal(moduleLocked({active:true,required_tier:'vip',can_enable:false}),false);
 assert.equal(moduleLocked({active:false,required_tier:'vip',can_enable:true}),false);
 assert.equal(moduleLocked({active:false,required_tier:'vip'}),true);
 assert.equal(moduleLocked({active:false}),true);
 assert.equal(moduleLocked({active:false,required_tier:'free',can_enable:false}),true);
 assert.equal(moduleLocked({active:false,required_tier:'free',can_enable:true}),false);
 assert.equal(panelError(401),'session');assert.equal(panelError(429),'rate');assert.equal(panelError(503),'unavailable');
});
test('module copy is bilingual and unknown future modules keep their server labels',()=>{
 assert.equal(Object.keys(PANEL_MODULES).length,32);
 for(const key of Object.keys(PANEL_MODULES))for(const lang of ['it','en']){
  const info=moduleText({key,group:'Sicurezza'},lang);assert.ok(info.label&&info.description);assert.equal(info.group,lang==='it'?'Sicurezza':'Security');
 }
 assert.deepEqual(moduleText({key:'future',label:'Future',group:'New'},'en'),{label:'Future',description:'',group:'New'});
});
test('module writes include the exact observed boolean state and never coerce unknown values',async()=>{
 const {moduleWrite}=await import('../src/core/panel-state.js');
 const module={active:false};assert.deepEqual(moduleWrite(module),{active:true,expected_active:false});assert.equal(module.active,false);
 assert.deepEqual(moduleWrite({active:true}),{active:false,expected_active:true});
 for(const active of [undefined,null,'false',0])assert.throws(()=>moduleWrite({active}),TypeError);
});
