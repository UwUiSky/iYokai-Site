import { assetCachePlugin } from './tools/build-asset-cache.mjs';
export default { plugins:[assetCachePlugin()], build: { target: 'es2022', rollupOptions: { input: { main:'index.html', model:'model-lab.html' } } }, server: { host: true, allowedHosts: ['terminal.local'], proxy: { '/api': 'http://127.0.0.1:8000' } } };
