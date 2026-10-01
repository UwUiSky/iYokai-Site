import * as THREE from 'three/webgpu';
import bodyUrl from '../assets/claws.png';
import rimUrl from '../assets/claws-rim.png';
// Il simbolo: i tre graffi. Corpo viola scuro con le crepe del disegno e bordo luminoso nel colore d'accento.
const H = 2.7, W = H * (502 / 660);
export function createMark(accent) {
  const group = new THREE.Group(), L = new THREE.TextureLoader();
  const tex = (u) => { const t = L.load(u); t.colorSpace = THREE.SRGBColorSpace; return t; };
  const body = new THREE.MeshBasicMaterial({ map: tex(bodyUrl), color: 0x3a0f52, transparent: true, depthWrite: false });
  const rim = new THREE.MeshBasicMaterial({ map: tex(rimUrl), color: accent, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending });
  const meshes = [body, rim].map((m, i) => { const me = new THREE.Mesh(new THREE.PlaneGeometry(W, H), m); me.position.z = i * 0.01; group.add(me); return me; });
  return {
    group,
    setAccent(c) { rim.color.set(c); },
    update(t, p, fx) {
      group.rotation.y = p.sx * 0.35; group.rotation.x = p.sy * 0.2;
      meshes.forEach((m) => m.scale.setScalar(Math.max(fx.markScale, 0.0001)));
      const pulse = 0.85 + 0.15 * Math.sin(t * 0.9);
      body.opacity = Math.min(1, fx.mark) * 0.95; rim.opacity = Math.min(1, fx.mark * pulse * 1.15);
    },
  };
}
