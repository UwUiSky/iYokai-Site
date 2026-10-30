import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const read=name=>JSON.parse(fs.readFileSync(new URL('../src/i18n/'+name+'.json',import.meta.url),'utf8'));
const en=read('en'),codes=['it','en','de','fr','es-ES','ru','uk','ja','ko','zh-CN'];
test('ten dictionaries have the same keys and preserve every placeholder',()=>{for(const code of codes){const d=read(code);assert.deepEqual(Object.keys(d).sort(),Object.keys(en).sort(),code);for(const [k,v]of Object.entries(en)){assert.equal(typeof d[k],'string');assert.ok(d[k].trim());assert.deepEqual(d[k].match(/\{\w+\}/g)?.sort()||[],v.match(/\{\w+\}/g)?.sort()||[],code+':'+k);}}});
test('all official command signatures keep a description in every locale',()=>{const c=JSON.parse(fs.readFileSync(new URL('../src/data/commands.json',import.meta.url),'utf8'));for(const code of codes)for(const g of c.categories)for(const [name]of g.commands)assert.ok(read(code)['command.description.'+name],code+':'+name);});
test('visible country badges have local SVG files; Japanese language tag stays ja',()=>{for(const b of ['it','en','es','fr','de','ru','ua','jp','kr','cn'])assert.ok(fs.existsSync(new URL('../public/flags/'+b+'.svg',import.meta.url)));assert.ok(read('ja')['gate.title'].includes('プロトコル'));});
