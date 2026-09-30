import * as THREE from 'three/webgpu';
import { glowTexture } from './entry.js';
// Strada notturna procedurale: palazzi istanziati, finestre, neon con riflessi, torii lontano, pioggia e nebbia.
const rnd = (a, b) => a + Math.random() * (b - a);
const NEON = [0xff4fd8, 0xb24bff, 0x7c5cff, 0xff6ec7];
export function createStreet(scene, tier) {
  const g = new THREE.Group(); g.visible = false;
  const tex = glowTexture();
  const glow = (c, o) => new THREE.SpriteMaterial({ map: tex, color: c, transparent: true, opacity: o, depthWrite: false, blending: THREE.AdditiveBlending });
  const road = new THREE.Mesh(new THREE.PlaneGeometry(14, 90), new THREE.MeshBasicMaterial({ color: 0x0b0714 }));
  road.rotation.x = -Math.PI / 2; road.position.z = -30; g.add(road);
  const N = 44, blds = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 1, 1), new THREE.MeshBasicMaterial({ color: 0x120a1e }), N), mtx = new THREE.Matrix4(), win = [];
  for (let i = 0; i < N; i++) {
    const side = i % 2 ? 1 : -1, w = rnd(2, 4), h = rnd(3, 11), d = rnd(3, 6), x = side * (4.2 + w / 2 + rnd(0, 1.2)), z = 6 - (i >> 1) * 2.2 - rnd(0, 1);
    mtx.compose(new THREE.Vector3(x, h / 2, z), new THREE.Quaternion(), new THREE.Vector3(w, h, d)); blds.setMatrixAt(i, mtx);
    for (let k = 0; k < 14; k++) win.push(x - side * (w / 2 + 0.02), rnd(0.8, h - 0.3), z + rnd(-d / 2, d / 2));
  }
  g.add(blds);
  const wg = new THREE.BufferGeometry(); wg.setAttribute('position', new THREE.BufferAttribute(new Float32Array(win), 3));
  g.add(new THREE.Points(wg, new THREE.PointsMaterial({ size: 0.06, color: 0xffb0f0, transparent: true, opacity: 0.8, blending: THREE.AdditiveBlending, depthWrite: false })));
  for (let i = 0; i < 12; i++) {
    const side = i % 2 ? 1 : -1, c = NEON[i % 4], x = side * rnd(3.9, 4.2), y = rnd(1.8, 5), z = 4 - i * 3.2, v = i % 3 === 0;
    const s = new THREE.Mesh(new THREE.PlaneGeometry(v ? 0.16 : 1.1, v ? 1.5 : 0.16), new THREE.MeshBasicMaterial({ color: c }));
    s.position.set(x, y, z); s.rotation.y = -side * Math.PI / 2; g.add(s);
    const gl = new THREE.Sprite(glow(c, 0.5)); gl.scale.set(1.8, 1.8, 1); gl.position.set(x - side * 0.2, y, z); g.add(gl);
    const rf = new THREE.Sprite(glow(c, 0.28)); rf.scale.set(1.4, 4.2, 1); rf.position.set(x - side * 0.2, -y * 0.6, z); g.add(rf); // riflesso sull'asfalto bagnato
  }
  const red = new THREE.MeshBasicMaterial({ color: 0x2a0a22 }), edge = new THREE.LineBasicMaterial({ color: 0xff4fd8, transparent: true, opacity: 0.6 });
  const box = (w, h, d, x, y) => { const geo = new THREE.BoxGeometry(w, h, d), me = new THREE.Mesh(geo, red); me.position.set(x, y, -16); me.add(new THREE.LineSegments(new THREE.EdgesGeometry(geo), edge)); g.add(me); };
  box(0.35, 5, 0.35, -2, 2.5); box(0.35, 5, 0.35, 2, 2.5); box(6, 0.4, 0.5, 0, 5.1); box(4.6, 0.25, 0.4, 0, 4.2);
  const halo = new THREE.Sprite(glow(0xff4fd8, 0.35)); halo.scale.set(14, 14, 1); halo.position.set(0, 3, -18); g.add(halo);
  const R = tier === 'high' ? 1400 : tier === 'mid' ? 800 : 350, rp = new Float32Array(R * 6), rs = new Float32Array(R);
  for (let i = 0; i < R; i++) { const o = i * 6, x = rnd(-7, 7), z = rnd(-20, 7), y = rnd(0, 9); rp.set([x, y, z, x, y + 0.35, z], o); rs[i] = rnd(9, 15); }
  const rg = new THREE.BufferGeometry(); rg.setAttribute('position', new THREE.BufferAttribute(rp, 3));
  const rain = new THREE.LineSegments(rg, new THREE.LineBasicMaterial({ color: 0xc9a4ff, transparent: true, opacity: 0.22, blending: THREE.AdditiveBlending, depthWrite: false }));
  g.add(rain);
  const mist = Array.from({ length: 9 }, (_, i) => { const s = new THREE.Sprite(glow(0x6a3aa8, 0.1)); s.scale.set(9, 3, 1); s.position.set(rnd(-4, 4), rnd(0.4, 1.6), -i * 3); g.add(s); return s; });
  scene.add(g);
  return { group: g, lite() { rain.visible = false; }, update(t, dt) {
    for (let i = 0; i < R; i++) { const o = i * 6; let y = rp[o + 1] - rs[i] * dt; if (y < 0) y += 9; rp[o + 1] = y; rp[o + 4] = y + 0.35; }
    rg.attributes.position.needsUpdate = true;
    mist.forEach((m, i) => { m.position.x = Math.sin(t * 0.08 + i) * 4; });
  } };
}
