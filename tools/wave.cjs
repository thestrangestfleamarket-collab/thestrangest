// builds SHARDWAVE's page: node tools/wave.cjs  ->  dist/wave.html (src/wave/, three bundled in, one file)
const fs = require('fs'), es = require('esbuild');
const js = es.buildSync({ entryPoints: ['src/wave/main.js'], bundle: true, format: 'esm', target: 'es2022', charset: 'utf8', minify: process.env.MIN !== '0', legalComments: 'none', write: false, logLevel: 'error', loader: { '.mp3': 'binary' } }).outputFiles[0].text;
const html = fs.readFileSync('src/wave/wave.html', 'utf8').replace('__WAVE__', () => js.replace(/<\/script/gi, '<\\/script'));
fs.mkdirSync('dist', { recursive: true }); fs.writeFileSync('dist/wave.html', html); console.log('dist/wave.html', html.length, 'bytes');
