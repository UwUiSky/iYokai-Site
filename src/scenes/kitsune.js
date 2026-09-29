import * as THREE from 'three/webgpu';
import { glowTexture } from './entry.js';
// Kitsune procedurale in penombra: corpo quasi nero, solo i contorni si vedono; occhio magenta, maschera di lato, fino a 7 code indipendenti.
const TAILS = 7, PTS = 26, ORDER = [3, 2, 4, 1, 5, 0, 6], RANK = [0, 1, 2, 3, 4, 5, 6].map((i) => ORDER.indexOf(i));
export function createKitsune(tier) {
  const root = new THREE.Group(), tex = glowTexture();
  const dark = new THREE.MeshBasicMaterial({ color: 0x07040b });
  const outline = (geo, o = 0.55) => new THREE.LineSegments(new THREE.EdgesGeometry(geo, 20), new THREE.LineBasicMaterial({ color: 0xff5fe0, transparent: true, opacity: o }));
  const part = (geo, x, y, z, parent = root, o) => { const m = new THREE.Mesh(geo, dark); m.position.set(x, y, z); m.add(outline(geo, o)); parent.add(m); return m; };
  const B = (w, h, d) => new THREE.BoxGeometry(w, h, d);
  part(B(1.6, 0.08, 0.5), 0, 0.45, 0, root, 0.3); part(B(1.6, 0.5, 0.06), 0, 0.75, -0.24, root, 0.3); part(B(0.08, 0.45, 0.4), -0.7, 0.22, 0, root, 0.25); part(B(0.08, 0.45, 0.4), 0.7, 0.22, 0, root, 0.25);
  part(new THREE.CylinderGeometry(0.13, 0.26, 0.6, 10), 0, 0.8, 0); part(new THREE.CylinderGeometry(0.24, 0.42, 0.28, 12), 0, 0.58, 0.1);
  [-1, 1].forEach((s) => { part(B(0.13, 0.13, 0.45), s * 0.1, 0.52, 0.28); part(B(0.12, 0.42, 0.12), s * 0.1, 0.28, 0.5); });
  const head = new THREE.Group(); head.position.set(0, 1.16, 0.02); root.add(head);
  part(new THREE.SphereGeometry(0.13, 14, 10), 0, 0, 0, head, 0.5);
  [-1, 1].forEach((s) => { const e = part(new THREE.ConeGeometry(0.07, 0.26, 6), s * 0.08, 0.19, 0, head); e.rotation.z = -s * 0.35; });
  part(new THREE.CylinderGeometry(0.17, 0.36, 1.05, 14, 1, true), 0, -0.4, -0.05, head, 0.35);
  const mask = new THREE.Mesh(new THREE.CircleGeometry(0.075, 20), new THREE.MeshBasicMaterial({ color: 0xe9e2f2, transparent: true, opacity: 0.9, side: THREE.DoubleSide }));
  mask.position.set(0.118, 0.03, 0.05); mask.rotation.y = Math.PI * 0.42; mask.scale.x = 0.8; head.add(mask);
  const eye = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, color: 0xff2fd0, transparent: true, opacity: 1, depthWrite: false, blending: THREE.AdditiveBlending }));
  eye.scale.set(0.14, 0.14, 1); eye.position.set(0.06, 0.035, 0.125); head.add(eye);
  const rim = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, color: 0xb24bff, transparent: true, opacity: 0.4, depthWrite: false, blending: THREE.AdditiveBlending }));
  rim.scale.set(3.2, 3.2, 1); rim.position.set(0, 1.1, -0.5); root.add(rim); // controluce: staglia la sagoma
  const tails = Array.from({ length: TAILS }, (_, i) => {
    const pts = Array.from({ length: PTS }, () => new THREE.Vector3(0, 0.62, -0.28)), strands = tier === 'low' ? 4 : tier === 'mid' ? 7 : 9, V = strands * (PTS - 1) * 2;
    const pos = new Float32Array(V * 3), col = new Float32Array(V * 3), geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3)); geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
    const mat = new THREE.LineBasicMaterial({ vertexColors: true, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false });
    const ls = new THREE.LineSegments(geo, mat); ls.frustumCulled = false; root.add(ls);
    const tip = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, color: 0xff6ee7, transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending })); tip.scale.set(0.3, 0.3, 1); root.add(tip);
    return { pts, strands, pos, col, geo, mat, tip, th: (i - 3) * 0.34, len: 2.5 - Math.abs(i - 3) * 0.16, damp: 2.2 + i * 0.7, ph: i * 1.3, w: 0.7 + i * 0.13 };
  });
  return { group: root, update(t, dt, p, count) {
    const kh = 1 - Math.exp(-dt * 1.6); // sguardo: smorzamento forte
    head.rotation.y += (Math.max(-0.6, Math.min(0.6, p.sx * 0.7)) - head.rotation.y) * kh;
    head.rotation.x += (p.sy * 0.25 - head.rotation.x) * kh;
    tails.forEach((T, i) => {
      const vis = Math.min(1, Math.max(0, count - RANK[i]));
      T.mat.opacity += (vis * 0.9 - T.mat.opacity) * Math.min(1, dt * 3); T.tip.material.opacity = T.mat.opacity;
      if (T.mat.opacity < 0.01) return;
      const k = 1 - Math.exp(-dt * T.damp), L = T.len;
      for (let j = 1; j < PTS; j++) {
        const s = j / (PTS - 1), a = T.th + Math.sin(t * T.w + T.ph + s * 2.4) * 0.2 * s + p.sx * 0.25 * s;
        const tx = Math.sin(a) * L * s * 0.95, ty = 0.62 + 0.35 * L * s + 0.5 * L * s * s + Math.cos(t * T.w * 1.3 + T.ph + s * 3) * 0.08 * s, tz = -0.28 - Math.cos(a) * L * s * 0.55 - 0.1 * s;
        const q = T.pts[j], kk = k * (1 - 0.45 * s); q.x += (tx - q.x) * kk; q.y += (ty - q.y) * kk; q.z += (tz - q.z) * kk;
      }
      let o = 0;
      for (let st = 0; st < T.strands; st++) {
        const off = (st - (T.strands - 1) / 2) * 0.06;
        for (let j = 0; j < PTS - 1; j++) for (let e = 0; e < 2; e++) {
          const q = T.pts[j + e], s = (j + e) / (PTS - 1), w = off * (0.5 + 3 * Math.sin(Math.PI * Math.min(1, s * 1.15))), c = 0.25 + 0.75 * s;
          T.pos[o] = q.x + w; T.pos[o + 1] = q.y + w * 0.3; T.pos[o + 2] = q.z; T.col[o] = c; T.col[o + 1] = 0.25 * c; T.col[o + 2] = 0.9 * c; o += 3;
        }
      }
      T.geo.attributes.position.needsUpdate = true; T.geo.attributes.color.needsUpdate = true; T.tip.position.copy(T.pts[PTS - 1]);
    });
  } };
}
