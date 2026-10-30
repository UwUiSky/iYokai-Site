import test from 'node:test';
import assert from 'node:assert/strict';
import {indexCommands,filterCommands} from '../src/core/command-catalog.js';
import {readFile} from 'node:fs/promises';
test('search combines case-insensitive words, accents and category without changing slash signatures',()=>{
 const rows=indexCommands({categories:[{name:'Sicurezza',commands:[['/verify setup','Verifica identità e ruoli'],['/raid status','Stato protezione']]},{name:'Utility',commands:[['/profile','La tua identità']]}]});
 assert.deepEqual(filterCommands(rows,{query:'  IDENTITA   verifica '}).map(r=>r.name),['/verify setup']);
 assert.deepEqual(filterCommands(rows,{category:'Utility',query:'identità'}).map(r=>r.name),['/profile']);
 assert.equal(filterCommands(rows,{category:'Sicurezza',query:'inesistente'}).length,0);
 assert.equal(filterCommands(rows).length,3);
 assert.equal(rows[0].description,'Verifica identità e ruoli');
 assert.throws(()=>indexCommands({categories:[{name:'bad',commands:[[null,'description']]}]}),TypeError);
});
test('the shipped catalogue keeps every declared command and category searchable',async()=>{
 const data=JSON.parse(await readFile(new URL('../src/data/commands.json',import.meta.url),'utf8'));const rows=indexCommands(data);
 assert.equal(rows.length,data.total);assert.equal(data.total,584);assert.equal(data.categories.length,25);assert.equal(rows.filter(r=>r.kind==='context').length,3);assert.ok(!rows.some(r=>r.name==='/play'));
 for(const group of data.categories)assert.equal(filterCommands(rows,{category:group.name}).length,group.commands.length);
 assert.ok(filterCommands(rows,{query:'/automod filtri anti-caps'}).some(r=>r.name==='/automod filtri anti-caps'));
});
test('English catalogue covers every signature without changing permissions or numeric limits',async()=>{
 const catalog=JSON.parse(await readFile(new URL('../src/data/commands.json',import.meta.url),'utf8'));
 const english=JSON.parse(await readFile(new URL('../src/data/commands.en.json',import.meta.url),'utf8'));
 const italian=indexCommands(catalog,{translations:english});
 const translated=indexCommands(catalog,{translations:english,language:'en'});
 assert.deepEqual(Object.keys(english).sort(),italian.map(r=>r.name).sort());
 assert.deepEqual(translated.map(r=>r.name),italian.map(r=>r.name));
 for(let i=0;i<translated.length;i++){
  assert.equal(translated[i].language,'en');
  assert.ok(translated[i].description.trim());
  assert.deepEqual((translated[i].description.match(/\d+/g)||[]).sort(),(italian[i].description.match(/\d+/g)||[]).sort(),translated[i].name);
  assert.equal(translated[i].description.startsWith('['),italian[i].description.startsWith('['),translated[i].name);
 }
 assert.ok(filterCommands(translated,{query:'attachment spam'}).some(r=>r.name==='/automod filtri anti-attachment'));
 assert.ok(filterCommands(translated,{query:'allegati'}).some(r=>r.name==='/automod filtri anti-attachment'));
 assert.ok(filterCommands(italian,{query:'attachment spam'}).some(r=>r.name==='/automod filtri anti-attachment'));
 assert.equal(translated.find(r=>r.name==='/mod timeout').description,'Time out a member (up to 28 days).');
 assert.equal(translated.find(r=>r.name==='/music volume set').description,'Set the volume to a specific value (0–200).');
});
test('missing or empty translations retain their original language truthfully',()=>{
 const catalog={categories:[{name:'Utility',commands:[['/one','Primo'],['/two','Secondo']]}]};
 const rows=indexCommands(catalog,{translations:{'/one':'  '},language:'en'});
 assert.deepEqual(rows.map(r=>[r.description,r.language]),[['Primo','it'],['Secondo','it']]);
});

test('the pinned bot snapshot matches every shipped name and description',async()=>{
 const snapshot=await readFile(new URL('../docs/BOT_COMMAND_LIST.md',import.meta.url),'utf8');
 const data=JSON.parse(await readFile(new URL('../src/data/commands.json',import.meta.url),'utf8'));
 const source=[...snapshot.matchAll(/^- \*\*`(\/[^`]+)`\*\*\s*[—-]\s*(.*)$/gm)].map(m=>[m[1],m[2]]);
 assert.deepEqual(indexCommands(data).map(r=>[r.name,r.description]),source);
 assert.equal(data.source.blob_sha,'77c0f05593a3d419ec7ab30d14485ef1bb96b6fe');
 assert.equal(data.generated,'2026-10-28');
 assert.deepEqual(indexCommands(data).filter(r=>r.kind==='context').map(r=>r.name),['/Profilo','/Stato rete iYokai','/Testo pulito']);
 for(const code of ['it','en']){
  const dictionary=JSON.parse(await readFile(new URL(`../src/i18n/${code}.json`,import.meta.url),'utf8'));
  for(const group of data.categories)assert.ok(dictionary[`cmd.category.${group.name}`],group.name);
 }
});
