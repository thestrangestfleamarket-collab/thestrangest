// builds SLOWFIRE DUEL's page: node tools/qzar.cjs  ->  dist/qzar.html (src/qzar/, three and peerjs bundled in)
const es = require('esbuild'), fs = require('fs');
const js = es.buildSync({ entryPoints: ['src/qzar/main.js'], bundle: true, format: 'esm', target: 'es2022', charset: 'utf8', minify: process.env.MIN !== '0', legalComments: 'none', write: false, logLevel: 'error' }).outputFiles[0].text;
const html = fs.readFileSync('src/qzar/qzar.html', 'utf8').replace('__QZAR__', () => js.replace(/<\/script/gi, '<\\/script'));
fs.mkdirSync('dist', { recursive: true }); fs.writeFileSync('dist/qzar.html', html);
console.log('dist/qzar.html', html.length, 'bytes');
