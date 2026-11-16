// builds THE LAST CHANCE's page: node tools/saloon.cjs  ->  dist/saloon.html (src/saloon/, three bundled in) and dist/saloon-assets/ (data/saloon/: its surfaces, models, light and people, fetched by the page)
const es = require('esbuild'), fs = require('fs');
const js = es.buildSync({ entryPoints: ['src/saloon/main.js'], bundle: true, format: 'esm', target: 'es2022', charset: 'utf8', minify: process.env.MIN !== '0', legalComments: 'none', write: false, logLevel: 'error' }).outputFiles[0].text;
const html = fs.readFileSync('src/saloon/saloon.html', 'utf8').replace('__SALOON__', () => js.replace(/<\/script/gi, '<\\/script'));
fs.mkdirSync('dist', { recursive: true }); fs.writeFileSync('dist/saloon.html', html);
fs.rmSync('dist/saloon-assets', { recursive: true, force: true }); fs.cpSync('data/saloon', 'dist/saloon-assets', { recursive: true });
if (!fs.existsSync('dist/cantina-assets/hand')) fs.cpSync('data/cantina/hand', 'dist/cantina-assets/hand', { recursive: true }); // the hands' mesh is the cantina's
console.log('dist/saloon.html', html.length, 'bytes, dist/saloon-assets/ copied');
