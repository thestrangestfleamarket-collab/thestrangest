// builds AR DUEL's page: node tools/duel.cjs  ->  dist/duel.html (src/duel/, three and peerjs bundled in) and dist/duel-assets/ (data/duel/, fetched by the page)
const es = require('esbuild'), fs = require('fs');
const js = es.buildSync({ entryPoints: ['src/duel/main.js'], bundle: true, format: 'esm', target: 'es2022', charset: 'utf8', minify: process.env.MIN !== '0', legalComments: 'none', write: false, logLevel: 'error' }).outputFiles[0].text;
const html = fs.readFileSync('src/duel/duel.html', 'utf8').replace('__DUEL__', () => js.replace(/<\/script/gi, '<\\/script'));
fs.mkdirSync('dist', { recursive: true }); fs.writeFileSync('dist/duel.html', html);
fs.rmSync('dist/duel-assets', { recursive: true, force: true }); fs.cpSync('data/duel', 'dist/duel-assets', { recursive: true });
console.log('dist/duel.html', html.length, 'bytes, dist/duel-assets/ copied');
