import * as THREE from 'three/webgpu';
// WebGPU quando disponibile, ripiego automatico su WebGL 2.
export async function createRenderer(canvas, q) {
  const renderer = new THREE.WebGPURenderer({ canvas, alpha: true, antialias: q.tier !== 'low', powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(devicePixelRatio, q.dpr));
  renderer.setSize(innerWidth, innerHeight, false);
  renderer.setClearColor(0x000000, 0);
  await renderer.init();
  return renderer;
}
