import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {MUSIC_NAMES,SPIRITS,spiritById,spiritBio,scopedCommands} from '../src/data/spirit-catalog.js';
import {ITEMS,configureBots,actionFor} from '../src/data/bots.js';
import {normalizeLinks} from '../src/core/links-config.js';
import {indexCommands} from '../src/core/command-catalog.js';
const read=p=>JSON.parse(fs.readFileSync(new URL(p,import.meta.url),'utf8'));
const stories=read('../src/data/spirit-lore.it.json');
test('all sixteen author lore sections are retained verbatim from the attached source',()=>{
 const txt=fs.readFileSync(new URL('../docs/lore/iYokai_Lore_Complete.it.txt',import.meta.url),'utf8');
 const sections=[...txt.matchAll(/-{15,}\n([^\n]+)\n-{15,}\n([\s\S]*?)(?=\n-{15,}\n|$)/g)].slice(0,16);
 assert.equal(Object.keys(stories).length,16);assert.equal(sections.length,16);
 for(const [id,entry]of Object.entries(stories)){
  const source=sections.find(m=>m[1]===entry.heading);assert.ok(source,id);
  assert.equal(entry.body,source[2].trim(),id);assert.equal(entry.language,'it');
 }
 for(const item of SPIRITS){assert.ok(stories[item.lore],item.id);assert.ok(spiritBio(item.id).bio.trim(),item.id);}
});
test('nine tails contain exactly five named music instances and Mod; the House is separate',()=>{
 assert.equal(ITEMS.length,9);assert.equal(ITEMS.filter(i=>i.kind==='bot').length,8);
 assert.deepEqual(ITEMS.filter(i=>i.musicNumber).map(i=>i.title),MUSIC_NAMES);
 assert.deepEqual(ITEMS.filter(i=>i.musicNumber).map(i=>i.musicNumber),[1,2,3,4,5]);
 assert.ok(ITEMS.find(i=>i.id==='mod'));assert.ok(!ITEMS.some(i=>i.id==='house'));
 assert.equal(spiritById('house').type,'home');assert.equal(spiritById('missing'),null);
});
test('each named music bot and Mod uses its own configured OAuth client ID',()=>{
 const p=normalizeLinks({discord:{botClientId:'100',appClientId:'200',nsfwClientId:'300',modClientId:'400',modPermissions:'32',musicBots:MUSIC_NAMES.map((name,i)=>({name,clientId:String(501+i),permissions:'0'}))}});
 configureBots(p);
 for(const item of ITEMS){const action=actionFor(item);assert.ok(action,item.id);const url=new URL(action.href);assert.equal(url.origin,'https://discord.com');assert.equal(url.searchParams.get('client_id'),item.clientId);if(item.musicNumber)assert.equal(item.clientId,String(500+item.musicNumber));}
 assert.equal(ITEMS.find(i=>i.id==='mod').perms,'32');
 assert.equal(new URL(actionFor(ITEMS.find(i=>i.id==='app')).href).searchParams.get('integration_type'),'1');
 configureBots(normalizeLinks({discord:{modClientId:'javascript:alert(1)',musicBots:[{clientId:'bad',permissions:'" onclick="bad'}]}}));
 assert.ok(ITEMS.every(i=>actionFor(i)===null));
});
test('scoped catalogues contain only real commands of the requested feature and fail closed',()=>{
 const commands=indexCommands(read('../src/data/commands.json'));
 const music=scopedCommands(commands,'music');assert.equal(music.length,28);assert.ok(music.every(c=>c.name.startsWith('/music ')));
 const safety=scopedCommands(commands,'safety');assert.ok(safety.some(c=>c.name.startsWith('/antiraid ')));assert.ok(!safety.some(c=>c.name.startsWith('/music ')));
 const personal=scopedCommands(commands,'personal');assert.equal(personal.length,15);assert.ok(personal.every(c=>c.category.startsWith('iYokai App (')));
 for(const scope of ['community','creative','core'])assert.ok(scopedCommands(commands,scope).length);
 assert.ok(scopedCommands(commands,'tickets').every(c=>c.category==='Ticket'));
 assert.equal(scopedCommands(commands,'tickets').length,31);
 assert.equal(scopedCommands(commands,'levels').length,34);
 assert.deepEqual(scopedCommands(commands,'untrusted'),[]);assert.equal(scopedCommands(commands,'*').length,584);
});
