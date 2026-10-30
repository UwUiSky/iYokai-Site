import test from 'node:test';
import assert from 'node:assert/strict';
import { PROTOCOLS, protocolFromHash, prepareResources } from '../src/data/protocols.js';
test('six protocols resolve only complete protocol routes',()=>{
 assert.deepEqual(PROTOCOLS.map(p=>p.id),['discord','social','music','live','projects','contact']);
 assert.equal(protocolFromHash('#protocol/music').id,'music');
 assert.equal(protocolFromHash('#protocol/music/catalog').id,'music');
 assert.equal(protocolFromHash('#protocol/musical'),undefined);
 assert.equal(protocolFromHash('#protocol/unknown'),undefined);
});
test('preparation progress follows completed prerequisites and rejects failed resources',async()=>{
 let release;const progress=[];
 const ready=prepareResources([()=>Promise.resolve(),()=>new Promise(r=>release=r)],p=>progress.push(p));
 await Promise.resolve();assert.deepEqual(progress,[0,.5]);release();await ready;assert.deepEqual(progress,[0,.5,1]);
 const failed=[];await assert.rejects(prepareResources([()=>Promise.reject(new Error('offline'))],p=>failed.push(p)),/offline/);assert.deepEqual(failed,[0]);
});
import { normalizeLinks } from '../src/core/links-config.js';
test('public links feed YouTube, Spotify, Twitch and Kick from one configuration',()=>{
 const config=normalizeLinks({platforms:{youtube:'https://www.youtube.com/@example',youtubeMusic:'https://www.youtube.com/channel/example',spotify:'https://open.spotify.com/album/0X5K33clT2LfQSn5vrn8t4',twitch:'https://www.twitch.tv/example',kick:'https://kick.com/example',instagram:'javascript:alert(1)'}});
 assert.deepEqual(config.live.map(c=>c.name),['YouTube Live','Twitch','Kick']);
 assert.equal(config.music.youtube,'https://www.youtube.com/channel/example');
 assert.equal(config.music.spotify,'https://open.spotify.com/album/0X5K33clT2LfQSn5vrn8t4');
 assert.equal(config.social.find(c=>c.name==='Instagram').url,null);
 assert.equal(normalizeLinks({platforms:{youtube:'https://www.youtube.com/@example'}}).music.youtube,'https://www.youtube.com/@example');
});

test('every current inner layout has its own existing painted scene',async()=>{
 const { DISCORD_ART, PROTOCOL_DETAIL_ART }=await import('../src/data/artworks.js');
 const { stat }=await import('node:fs/promises');
 const home=PROTOCOLS.map(p=>p.art),inner=[...Object.values(DISCORD_ART).slice(1),...Object.values(PROTOCOL_DETAIL_ART)];
 assert.equal(inner.length,10);assert.equal(new Set([...home,...inner]).size,16);
 for(const path of inner)assert.ok((await stat(new URL('../public'+path,import.meta.url))).size>10000,path);
});
