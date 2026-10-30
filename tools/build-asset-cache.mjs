import { readFile, readdir, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import path from 'node:path';

export async function buildAssetCache(directory) {
  const manifest = {};
  async function collect(relative) {
    for (const entry of await readdir(path.join(directory, relative), { withFileTypes:true })) {
      const name = path.posix.join(relative, entry.name);
      if (entry.isDirectory()) await collect(name);
      else if (/\.(?:js|css|woff2?|otf|ttf|webp|png|svg|glb|mp4)$/.test(name)) {
        const bytes = await readFile(path.join(directory, name));
        manifest['/' + name] = createHash('sha256').update(bytes).digest('hex').slice(0, 16);
      }
    }
  }
  await collect('assets'); await collect('cinematic'); await collect('fonts');
  const policy = await readFile(new URL('../src/core/cache-policy.js', import.meta.url), 'utf8');
  await writeFile(path.join(directory, 'asset-cache-policy.js'), policy);
  await writeFile(path.join(directory, 'asset-manifest.json'), JSON.stringify(manifest));
  const worker = `import { ASSET_CACHE_NAME, assetCacheKey, fetchCachedAsset } from '/asset-cache-policy.js';
const manifest = ${JSON.stringify(manifest)};
self.addEventListener('install', event => { event.waitUntil(self.skipWaiting()); });
self.addEventListener('activate', event => { event.waitUntil((async () => {
  await self.clients.claim();
  const tabs = await self.clients.matchAll({ type:'window' });
  if (tabs.length > 1) return;
  try {
    const keep = new Set(Object.keys(manifest).map(path => assetCacheKey(new Request(new URL(path, self.location.origin)), self.location.origin, manifest)));
    const cache = await caches.open(ASSET_CACHE_NAME);
    await Promise.all((await cache.keys()).filter(request => !keep.has(request.url)).map(request => cache.delete(request)));
  } catch { /* Cleanup is optional if storage is unavailable. */ }
})()); });
self.addEventListener('fetch', event => {
  if (!assetCacheKey(event.request, self.location.origin, manifest)) return;
  event.respondWith(fetchCachedAsset(event.request, {
    origin:self.location.origin, manifest, cacheStorage:caches, fetchImpl:request => fetch(request)
  }));
});
`;
  await writeFile(path.join(directory, 'asset-worker.js'), worker);
  return manifest;
}

export function assetCachePlugin() {
  let directory;
  return { name:'iyokai-asset-cache', apply:'build', configResolved(config) { directory = path.resolve(config.root, config.build.outDir); }, async closeBundle() { await buildAssetCache(directory); } };
}
