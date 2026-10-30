import * as THREE from 'three/webgpu';
// WebGPU quando disponibile, ripiego automatico su WebGL 2.
export async function createRenderer(canvas, q) {
  const renderer = new THREE.WebGPURenderer({ canvas, alpha: true, antialias: q.tier !== 'low', powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(devicePixelRatio, q.dpr));
  renderer.setSize(innerWidth, innerHeight, false);
  renderer.setClearColor(0x000000, 0);
  try {
    await renderer.init();
    return renderer;
  } catch (error) {
    // Content remains available even with graphics disabled by the browser.
    console.warn('3D renderer unavailable; using the illustrated experience.', error);
    canvas.hidden = true;
    document.documentElement.dataset.graphics = 'static';
    let loop;
    return {
      staticFallback:true,
      setSize() {}, setPixelRatio() {}, render() {},
      setAnimationLoop(callback) {
        cancelAnimationFrame(loop);
        const frame = (time) => { callback(time); loop = requestAnimationFrame(frame); };
        loop = requestAnimationFrame(frame);
      },
    };
  }
}
