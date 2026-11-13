// builds the asylum's page: node tools/asylum.cjs  ->  dist/asylum.html (src/asylum/, three bundled in, one file)
const es = require('esbuild'), fs = require('fs');
const js = es.buildSync({ entryPoints: ['src/asylum/main.js'], bundle: true, format: 'esm', target: 'es2022', charset: 'utf8', minify: process.env.MIN !== '0', legalComments: 'none', write: false, logLevel: 'error', loader: { '.glb': 'binary', '.jpg': 'dataurl', '.mp3': 'binary' } }).outputFiles[0].text;
const html = fs.readFileSync('src/asylum/asylum.html', 'utf8').replace('__ASYLUM__', () => js.replace(/<\/script/gi, '<\\/script'));
fs.mkdirSync('dist', { recursive: true }); fs.writeFileSync('dist/asylum.html', html); console.log('dist/asylum.html', html.length, 'bytes');
