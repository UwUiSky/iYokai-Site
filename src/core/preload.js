import { STILL_ART } from '../data/artworks.js';
const FIRST = ['/cinematic/shrine.webp', '/cinematic/kitsune.webp'];
const NEXT = ['/cinematic/city.webp', '/cinematic/theater.webp'];
let workerStarted;
const idle = () => new Promise(resolve => {
  if ('requestIdleCallback' in window) window.requestIdleCallback(resolve, { timeout:1800 });
  else setTimeout(resolve, 100);
});

export function startAssetPipeline() {
  if (workerStarted) return workerStarted;
  workerStarted = (async () => {
    if (!import.meta.env.PROD || !isSecureContext || !('serviceWorker' in navigator)) return false;
    try {
      await navigator.serviceWorker.register('/asset-worker.js', { type:'module', updateViaCache:'none' });
      document.documentElement.dataset.assetCache = 'ready';
      return true;
    } catch { document.documentElement.dataset.assetCache = 'network'; return false; }
  })();
  return workerStarted;
}

const images = new Map();
export function preloadImage(url) {
  if (!images.has(url)) images.set(url, new Promise(resolve => {
    const image = new Image(); image.decoding = 'async';
    let done = false;
    const finish = success => { if (done) return; done = true; clearTimeout(timer); if (!success) images.delete(url); resolve(success); };
    const timer = setTimeout(() => finish(false), 8000);
    image.onload = () => Promise.resolve(image.decode?.()).catch(() => {}).then(() => finish(true));
    image.onerror = () => finish(false);
    image.src = url;
  }));
  return images.get(url);
}

export async function preloadCinematicAssets({ prototype = false, still = false } = {}) {
  // Critical imagery is prepared immediately. Later worlds yield to input and
  // respect Save-Data rather than downloading every chapter at the entrance.
  await Promise.all((still ? [STILL_ART.shrine] : FIRST).map(preloadImage));
  if (prototype) preloadImage('/cinematic/prototype-cutout.webp');
  if (navigator.connection?.saveData) return;
  for (const url of (still ? [STILL_ART.city,STILL_ART.music,STILL_ART.theater] : NEXT)) { await idle(); await preloadImage(url); }
}

export async function warmGpuAssets(renderer, object, camera, scene) {
  if (renderer.staticFallback || typeof renderer.compileAsync !== 'function') return false;
  try {
    // Compile the hidden object using the final scene's lights. This does not
    // persist compiled GPU binaries: that cache belongs to the browser/driver.
    const visible = object.visible;
    let compilation;
    try { object.visible = true; compilation = renderer.compileAsync(object, camera, scene); }
    finally { object.visible = visible; }
    await compilation;
    document.documentElement.dataset.gpuPrepared = 'true'; return true;
  } catch { return false; }
}
