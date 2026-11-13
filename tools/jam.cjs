// builds STADIUM JAM's page: node tools/jam.cjs  ->  dist/jam.html (src/jam/, three bundled in) and dist/jam-assets/ (data/jam/ and the recorded kit and guitar, fetched by the page)
const es = require('esbuild'), fs = require('fs');
const js = es.buildSync({ entryPoints: ['src/jam/main.js'], bundle: true, format: 'esm', target: 'es2022', charset: 'utf8', minify: process.env.MIN !== '0', legalComments: 'none', write: false, logLevel: 'error' }).outputFiles[0].text;
const html = fs.readFileSync('src/jam/jam.html', 'utf8').replace('__JAM__', () => js.replace(/<\/script/gi, '<\\/script'));
fs.mkdirSync('dist', { recursive: true }); fs.writeFileSync('dist/jam.html', html);
fs.rmSync('dist/jam-assets', { recursive: true, force: true }); fs.cpSync('data/jam', 'dist/jam-assets', { recursive: true });
for (const n of ['drums', 'guitar']) for (const e of ['mp3', 'json']) fs.copyFileSync('data/' + n + '-samples.' + e, 'dist/jam-assets/' + n + '.' + e);
console.log('dist/jam.html', html.length, 'bytes, dist/jam-assets/ copied');
