// builds THE GARAGE's page: node tools/drums.cjs  ->  dist/drums.html (src/drums/, three bundled in) and dist/drums-assets/ (data/drums/: the recorded kit, the garage's models and surfaces, fetched by the page)
const es = require('esbuild'), fs = require('fs');
const js = es.buildSync({ entryPoints: ['src/drums/main.js'], bundle: true, format: 'esm', target: 'es2022', charset: 'utf8', minify: process.env.MIN !== '0', legalComments: 'none', write: false, logLevel: 'error' }).outputFiles[0].text;
const html = fs.readFileSync('src/drums/drums.html', 'utf8').replace('__DRUMS__', () => js.replace(/<\/script/gi, '<\\/script'));
fs.mkdirSync('dist', { recursive: true }); fs.writeFileSync('dist/drums.html', html);
fs.rmSync('dist/drums-assets', { recursive: true, force: true }); fs.cpSync('data/drums', 'dist/drums-assets', { recursive: true });
console.log('dist/drums.html', html.length, 'bytes, dist/drums-assets/ copied');
