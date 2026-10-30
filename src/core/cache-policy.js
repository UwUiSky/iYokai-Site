// Only revisioned public assets are cached. Documents, sessions and API responses
// always use the network and never enter this cache.
export const ASSET_CACHE_NAME = 'iyokai-static-assets-v1';

export function assetCacheKey(request, origin, manifest) {
  const url = new URL(request.url, origin);
  if (request.method !== 'GET' || request.mode === 'navigate' || request.destination === 'document') return null;
  if (url.origin !== origin || url.search || request.headers?.has('range')) return null;
  const revision = Object.hasOwn(manifest, url.pathname) && manifest[url.pathname];
  if (typeof revision !== 'string' || !/^[a-f0-9]{16}$/.test(revision)) return null;
  url.searchParams.set('__iyokai_hash', revision);
  return url.href;
}

export function safeAssetResponse(response, pathname = '') {
  if (!response.ok || response.redirected || response.type === 'opaque') return false;
  const type = response.headers.get('content-type') || '';
  if (/text\/html|application\/xhtml/i.test(type) || !type) return false;
  if (/\.glb$/.test(pathname)) return /model\/gltf-binary|application\/octet-stream/i.test(type);
  if (/\.(webp|png|svg)$/.test(pathname)) return /^image\//i.test(type);
  if (/\.js$/.test(pathname)) return /(?:java|ecma)script/i.test(type);
  if (/\.css$/.test(pathname)) return /text\/css/i.test(type);
  if (/\.mp4$/.test(pathname)) return /video\/mp4/i.test(type);
  if (/\.(?:woff2?|otf|ttf)$/.test(pathname)) return /font|octet-stream|opentype/i.test(type);
  return false;
}

export async function fetchCachedAsset(request, { origin, manifest, cacheStorage, fetchImpl }) {
  const key = assetCacheKey(request, origin, manifest);
  if (!key) return fetchImpl(request);
  let cache;
  try {
    cache = await cacheStorage.open(ASSET_CACHE_NAME);
    const hit = await cache.match(key);
    if (hit) return hit;
  } catch { /* Storage denied or full: the site still loads over the network. */ }
  const response = await fetchImpl(request);
  if (cache && safeAssetResponse(response, new URL(request.url).pathname)) {
    try { await cache.put(key, response.clone()); } catch { /* Best-effort caching. */ }
  }
  return response;
}
