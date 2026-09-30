// Anteprima: un unico file HTML autonomo (JS, CSS e font inclusi). Uso: npm run build:single
import { viteSingleFile } from 'vite-plugin-singlefile';
export default { plugins: [viteSingleFile()], build: { target: 'es2022', outDir: 'dist-single', assetsInlineLimit: 100000000, rolldownOptions: { output: { codeSplitting: false } } } };
