// builds FOURTH & LONG's page: node tools/football.cjs  ->  dist/football.html (src/football/, three bundled in)
const es = require('esbuild'), fs = require('fs');
const js = es.buildSync({ entryPoints: ['src/football/main.js'], bundle: true, format: 'esm', target: 'es2022', charset: 'utf8', minify: process.env.MIN !== '0', legalComments: 'none', write: false, logLevel: 'error' }).outputFiles[0].text;
const html = fs.readFileSync('src/football/football.html', 'utf8').replace('__FOOTBALL__', () => js.replace(/<\/script/gi, '<\\/script'));
fs.mkdirSync('dist', { recursive: true }); fs.writeFileSync('dist/football.html', html);
console.log('dist/football.html', html.length, 'bytes');
