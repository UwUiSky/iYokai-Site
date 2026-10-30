import test from 'node:test';
import assert from 'node:assert/strict';
import { DISCORD_LAYOUT } from '../src/data/discord-layout.js';
import { DISCORD_ART } from '../src/data/artworks.js';
test('Discord follows the requested eight-panel sequence with each matching painting',()=>{
 assert.deepEqual(DISCORD_LAYOUT.map(p=>p.art),['overview','dashboard','features','music','spirits','invites','house','faq']);
 assert.equal(new Set(DISCORD_LAYOUT.map(p=>p.selector)).size,8);
 assert.ok(DISCORD_LAYOUT.every(p=>DISCORD_ART[p.art]));
 assert.equal(DISCORD_LAYOUT[1].label,'dash.t');
 assert.equal(DISCORD_LAYOUT[3].selector,'#discord-music');
 assert.ok(DISCORD_LAYOUT.filter(p=>p.heading).every(p=>['dashboard','features'].includes(p.art)));
});
