// builds SKY ACES' page: node tools/fly.cjs  ->  dist/fly.html (src/fly/, three bundled in) and dist/fly-assets/ (data/fly/, fetched by the page)
const es = require('esbuild'), fs = require('fs');
const js = es.buildSync({ entryPoints: ['src/fly/main.js'], bundle: true, format: 'esm', target: 'es2022', charset: 'utf8', minify: process.env.MIN !== '0', legalComments: 'none', write: false, logLevel: 'error' }).outputFiles[0].text;
const html = fs.readFileSync('src/fly/fly.html', 'utf8').replace('__FLY__', () => js.replace(/<\/script/gi, '<\\/script'));
fs.mkdirSync('dist', { recursive: true }); fs.writeFileSync('dist/fly.html', html);
fs.rmSync('dist/fly-assets', { recursive: true, force: true }); fs.cpSync('data/fly', 'dist/fly-assets', { recursive: true });
console.log('dist/fly.html', html.length, 'bytes, dist/fly-assets/ copied');
