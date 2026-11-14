// builds LASER TAG's page: node tools/laser.cjs  ->  dist/laser.html (src/laser/, three bundled in)
const es = require('esbuild'), fs = require('fs');
const js = es.buildSync({ entryPoints: ['src/laser/main.js'], bundle: true, format: 'esm', target: 'es2022', charset: 'utf8', minify: process.env.MIN !== '0', legalComments: 'none', write: false, logLevel: 'error' }).outputFiles[0].text;
const html = fs.readFileSync('src/laser/laser.html', 'utf8').replace('__LASER__', () => js.replace(/<\/script/gi, '<\\/script'));
fs.mkdirSync('dist', { recursive: true }); fs.writeFileSync('dist/laser.html', html);
console.log('dist/laser.html', html.length, 'bytes');
