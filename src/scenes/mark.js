import * as THREE from 'three/webgpu';
// ミ: tre tagli diagonali che crescono verso il basso.
const CUTS = [{ x: 0.15, y: 0.9, w: 1.5 }, { x: 0, y: 0, w: 2.1 }, { x: -0.3, y: -0.9, w: 2.9 }];
export function createMark(accent) {
  const group = new THREE.Group();
  const bars = CUTS.map((c) => {
    const bar = new THREE.Mesh(new THREE.PlaneGeometry(c.w, 0.045), new THREE.MeshBasicMaterial({ color: accent, transparent: true }));
    bar.position.set(c.x, c.y, 0);
    bar.rotation.z = 0.32;
    group.add(bar);
    return bar;
  });
  return {
    group,
    update(t, p) {
      group.rotation.y = p.sx * 0.35;
      group.rotation.x = p.sy * 0.2;
      bars.forEach((b, i) => { b.material.opacity = 0.65 + 0.3 * Math.sin(t * 0.9 + i * 1.7); });
    },
  };
}
