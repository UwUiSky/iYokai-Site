export default { build: { target: 'es2022' }, server: { host: true, proxy: { '/api': 'http://127.0.0.1:8000' } } };
