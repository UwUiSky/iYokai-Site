import * as THREE from 'three/webgpu';
import gsap from 'gsap';
import { glowTexture } from './entry.js';
// Il nucleo della transizione diventa l'orbe dell'hub: bagliore + tre anelli inclinati che ruotano.
export function createOrb(scene) {
  const group = new THREE.Group(); group.visible = false; group.scale.setScalar(0.001);
  const core = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTexture(), transparent: true, depthWrite: false, depthTest: false, blending: THREE.AdditiveBlending, opacity: 0.85 }));
  core.scale.set(1.9, 1.9, 1); core.renderOrder = 2;
  const rings = [[1.0, 0.012, 0.4, 0.2, 0x9d5cff], [1.3, 0.008, 1.1, -0.5, 0xff5fe0], [1.65, 0.006, 0.2, 0.9, 0x9d5cff]].map(([r, t, rx, ry, c]) => {
    const m = new THREE.Mesh(new THREE.TorusGeometry(r, t, 8, 128), new THREE.MeshBasicMaterial({ color: c, transparent: true, opacity: 0.7, depthWrite: false, blending: THREE.AdditiveBlending }));
    m.rotation.set(rx, ry, 0); group.add(m); return m;
  });
  group.add(core); scene.add(group);
  const o = { group, base: 1,
    show() { group.visible = true; gsap.to(group.scale, { x: o.base, y: o.base, z: o.base, duration: 1.8, ease: 'expo.out' }); },
    update(t, p) {
      rings.forEach((r, i) => { r.rotation.z = t * (0.15 + i * 0.1) * (i % 2 ? -1 : 1); });
      group.rotation.y = p.sx * 0.25; group.rotation.x = p.sy * 0.15;
      core.material.opacity = 0.8 + 0.15 * Math.sin(t * 1.6);
    } };
  return o;
}
