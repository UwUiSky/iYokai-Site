import test from 'node:test';
import assert from 'node:assert/strict';
import { composition } from '../src/scenes/composition.js';
import { spotifyEmbed } from '../src/core/spotify.js';
import { tailCurve, tailGeometry } from '../src/scenes/tails.js';
test('all requested ratios keep the character bounds in the viewport, with a limited tail count',()=>{
 for(const [w,h] of [[1024,768],[1280,800],[1280,720],[1680,720],[2560,720],[390,844],[360,640],[844,390]]){
  for(let i=0;i<7;i++){const c=composition(i,w,h);assert.ok(c.bottom>=0&&c.bottom+c.height<=1,`${w}/${h} chapter ${i}`);assert.ok(c.x>0&&c.x<1);assert.ok(c.tails>=1&&c.tails<=4);}
 }
 assert.ok(new Set(Array.from({length:7},(_,i)=>JSON.stringify(composition(i,1280,720)))).size>=6);
});
test('Spotify only accepts canonical music entities on the official secure host',()=>{
 assert.equal(spotifyEmbed('https://open.spotify.com/artist/70DyeGC3ucG1pMEWCcjFUU?si=test')?.kind,'artist');
 for(const v of [null,'javascript:alert(1)','https://open.spotify.com.evil.test/artist/70DyeGC3ucG1pMEWCcjFUU','https://user:pass@open.spotify.com/artist/70DyeGC3ucG1pMEWCcjFUU','http://open.spotify.com/artist/70DyeGC3ucG1pMEWCcjFUU','https://open.spotify.com/artist/nope'])assert.equal(spotifyEmbed(v),null);
});
test('all nine natural tail curves produce finite volumetric geometry',()=>{
 for(let i=0;i<9;i++){const g=tailGeometry(tailCurve(i),42,10);assert.ok([...g.attributes.position.array].every(Number.isFinite));g.computeBoundingBox();assert.ok(g.boundingBox.max.z-g.boundingBox.min.z>.2);g.dispose();}
});
