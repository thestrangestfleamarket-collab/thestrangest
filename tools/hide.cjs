// builds DEAD END's page: node tools/hide.cjs  ->  dist/hide.html (src/hide/, three and Rapier bundled in) and dist/hide-assets/ (data/hide/: pictures, models, sounds; the thing's body is VESPER WARD's brute)
const es = require('esbuild'), fs = require('fs');
const js = es.buildSync({ entryPoints: ['src/hide/main.js'], bundle: true, format: 'esm', target: 'es2022', charset: 'utf8', minify: process.env.MIN !== '0', legalComments: 'none', write: false, logLevel: 'error' }).outputFiles[0].text;
const html = fs.readFileSync('src/hide/hide.html', 'utf8').replace('__HIDE__', () => js.replace(/<\/script/gi, '<\\/script'));
fs.mkdirSync('dist', { recursive: true }); fs.writeFileSync('dist/hide.html', html);
fs.rmSync('dist/hide-assets', { recursive: true, force: true }); fs.cpSync('data/hide', 'dist/hide-assets', { recursive: true }); fs.copyFileSync('data/scare/brute.glb', 'dist/hide-assets/m/brute.glb');
console.log('dist/hide.html', html.length, 'bytes, dist/hide-assets/ copied');
