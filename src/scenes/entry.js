import * as THREE from 'three/webgpu';
import gsap from 'gsap';
// Direct terminal dissolve. No core, orb, convergence or central flash.
const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const clamp01 = (v) => Math.min(1, Math.max(0, v));
export function glowTexture() {
  const c = document.createElement('canvas'); c.width = c.height = 128;
  const g = c.getContext('2d'), r = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  r.addColorStop(0, 'rgba(255,255,255,1)'); r.addColorStop(0.25, 'rgba(255,120,230,.8)');
  r.addColorStop(0.6, 'rgba(150,50,255,.25)'); r.addColorStop(1, 'rgba(120,40,255,0)');
  g.fillStyle = r; g.fillRect(0, 0, 128, 128);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
}
export function createEntry(scene, camera, budget) {
  const count = Math.min(budget, 2400), pos = new Float32Array(count * 3), start = new Float32Array(count * 3), end = new Float32Array(count * 3);
  const geometry = new THREE.BufferGeometry(); geometry.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const material = new THREE.PointsMaterial({ color:0xe6afc3, size:.018, transparent:true, opacity:0, depthWrite:false, blending:THREE.AdditiveBlending });
  const points = new THREE.Points(geometry, material); points.frustumCulled = false; scene.add(points);
  let tween;
  return {
    update() {},
    dim(opacity) { gsap.to(material, { opacity, duration:.5 }); },
    play({ rect, scale = 1, onReveal }) {
      tween?.kill();
      const H = 2 * camera.position.z * Math.tan(camera.fov * Math.PI / 360), W = H * camera.aspect;
      for (let i = 0; i < count; i++) {
        const j = i * 3;
        start[j] = ((rect.left + Math.random() * rect.width) / innerWidth - .5) * W;
        start[j + 1] = -((rect.top + Math.random() * rect.height) / innerHeight - .5) * H;
        start[j + 2] = 1;
        end[j] = start[j] + (Math.random() - .5) * 3;
        end[j + 1] = start[j + 1] + 1 + Math.random() * 2;
        end[j + 2] = -Math.random() * 3;
      }
      pos.set(start); geometry.attributes.position.needsUpdate = true; material.opacity = .8;
      const progress = { value:0 };
      tween = gsap.timeline().to(progress, { value:1, duration:1.3 * scale, ease:'power2.out', onUpdate() {
        for (let j = 0; j < pos.length; j++) pos[j] = start[j] + (end[j] - start[j]) * progress.value;
        geometry.attributes.position.needsUpdate = true;
      } }, 0).to(material, { opacity:0, duration:.7 * scale }, .45 * scale).add(onReveal, .45 * scale);
    },
  };
}
