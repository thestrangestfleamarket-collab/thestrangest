// builds BREACHLINE's page: node tools/shoot.cjs  ->  dist/shoot.html (src/shoot/, three and peerjs bundled in, one file)
const fs = require('fs'), es = require('esbuild');
const js = es.buildSync({ entryPoints: ['src/shoot/main.js'], bundle: true, format: 'esm', target: 'es2022', charset: 'utf8', minify: process.env.MIN !== '0', legalComments: 'none', write: false, logLevel: 'error' }).outputFiles[0].text;
const html = fs.readFileSync('src/shoot/shoot.html', 'utf8').replace('__SHOOT__', () => js.replace(/<\/script/gi, '<\\/script'));
fs.mkdirSync('dist', { recursive: true }); fs.writeFileSync('dist/shoot.html', html); console.log('dist/shoot.html', html.length, 'bytes');
