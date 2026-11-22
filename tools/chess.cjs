// builds SKIRMISH TABLE's page: node tools/chess.cjs  ->  dist/chess.html (src/chess/, three bundled in) and dist/chess-assets/ (data/chess/: its people (from tools/chess-bake.cjs), sprites and sounds, fetched by the page)
const es = require('esbuild'), fs = require('fs');
const js = es.buildSync({ entryPoints: ['src/chess/main.js'], bundle: true, format: 'esm', target: 'es2022', charset: 'utf8', minify: process.env.MIN !== '0', legalComments: 'none', write: false, logLevel: 'error' }).outputFiles[0].text;
const html = fs.readFileSync('src/chess/chess.html', 'utf8').replace('__CHESS__', () => js.replace(/<\/script/gi, '<\\/script'));
fs.mkdirSync('dist', { recursive: true }); fs.writeFileSync('dist/chess.html', html);
fs.rmSync('dist/chess-assets', { recursive: true, force: true }); fs.cpSync('data/chess', 'dist/chess-assets', { recursive: true });
console.log('dist/chess.html', html.length, 'bytes, dist/chess-assets/ copied');
