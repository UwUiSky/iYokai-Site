import * as THREE from 'three/webgpu';
import gsap from 'gsap';
// Particelle: dal terminale → nucleo luminoso → nebulosa. Interpolazione su CPU solo durante la sequenza.
const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const clamp01 = (v) => Math.min(1, Math.max(0, v));
function glowTexture() {
  const c = document.createElement('canvas'); c.width = c.height = 128;
  const g = c.getContext('2d'), r = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  r.addColorStop(0, 'rgba(255,255,255,1)'); r.addColorStop(0.25, 'rgba(255,120,230,.8)');
  r.addColorStop(0.6, 'rgba(150,50,255,.25)'); r.addColorStop(1, 'rgba(120,40,255,0)');
  g.fillStyle = r; g.fillRect(0, 0, 128, 128);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
}
export function createEntry(scene, camera, count) {
  const N3 = count * 3, start = new Float32Array(N3), mid = new Float32Array(N3), end = new Float32Array(N3), pos = new Float32Array(N3), delay = new Float32Array(count);
  const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const mat = new THREE.PointsMaterial({ size: 0.05, color: 0xff6ee7, transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending });
  const points = new THREE.Points(geo, mat); points.frustumCulled = false; points.renderOrder = 1;
  const glow = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTexture(), transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending, depthTest: false }));
  glow.renderOrder = 2; // il bagliore sta sempre sopra i tagli, senza tagli di profondità
  glow.scale.set(0.4, 0.4, 1);
  scene.add(points, glow);
  const st = { gather: 0, burst: 0 };
  let active = false;
  const apply = () => {
    for (let i = 0; i < count; i++) {
      const i3 = i * 3, t1 = ease(clamp01((st.gather - delay[i]) / 0.65)), t2 = ease(clamp01((st.burst - delay[i]) / 0.65));
      for (let k = 0; k < 3; k++) { const g = start[i3 + k] + (mid[i3 + k] - start[i3 + k]) * t1; pos[i3 + k] = g + (end[i3 + k] - g) * t2; }
    }
    geo.attributes.position.needsUpdate = true;
  };
  return {
    update(t) { if (active) points.rotation.z = t * 0.015; },
    play({ rect, scale: s, onReveal }) {
      const H = 2 * camera.position.z * Math.tan((camera.fov * Math.PI) / 360), W = H * camera.aspect;
      for (let i = 0; i < count; i++) {
        const i3 = i * 3, r = 0.02 + 0.35 * Math.pow(Math.random(), 2), a = Math.random() * 6.283, b = Math.acos(2 * Math.random() - 1);
        const px = rect.left + Math.random() * rect.width, py = rect.top + Math.random() * rect.height;
        start[i3] = (px / innerWidth - 0.5) * W; start[i3 + 1] = -(py / innerHeight - 0.5) * H; start[i3 + 2] = (Math.random() - 0.5) * 0.3;
        mid[i3] = r * Math.sin(b) * Math.cos(a); mid[i3 + 1] = r * Math.sin(b) * Math.sin(a); mid[i3 + 2] = r * Math.cos(b);
        const th = Math.random() * 6.283, R = 1.2 + 3.8 * Math.pow(Math.random(), 0.7), tw = th + R * 0.5;
        end[i3] = Math.cos(tw) * R; end[i3 + 1] = Math.sin(tw) * R * 0.65; end[i3 + 2] = (Math.random() - 0.5) * 3;
        delay[i] = Math.random() * 0.35;
      }
      active = true; apply();
      gsap.timeline()
        .to(mat, { opacity: 1, duration: 0.3 * s }, 0)
        .to(st, { gather: 1, duration: 1.5 * s, ease: 'none', onUpdate: apply }, 0.2 * s)
        .to(glow.material, { opacity: 1, duration: 0.6 * s }, 1.1 * s)
        .to(glow.scale, { x: 1.2, y: 1.2, duration: 0.7 * s, ease: 'power2.in' }, 1.1 * s)
        .to(glow.scale, { x: 5, y: 5, duration: 0.5 * s, ease: 'expo.out' }, 1.9 * s)
        .to(st, { burst: 1, duration: 1.4 * s, ease: 'none', onUpdate: apply }, 1.9 * s)
        .to(glow.material, { opacity: 0, duration: 1 * s }, 2.1 * s)
        .add(onReveal, 2.9 * s);
    },
  };
}
