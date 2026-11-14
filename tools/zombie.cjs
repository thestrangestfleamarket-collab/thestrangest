// builds EYES DOWN's page: node tools/zombie.cjs  ->  dist/zombie.html (src/zombie/, three and Rapier bundled in) and dist/zombie-assets/ (data/zombie/: pictures and models)
const es = require('esbuild'), fs = require('fs');
const js = es.buildSync({ entryPoints: ['src/zombie/main.js'], bundle: true, format: 'esm', target: 'es2022', charset: 'utf8', minify: process.env.MIN !== '0', legalComments: 'none', write: false, logLevel: 'error' }).outputFiles[0].text;
const html = fs.readFileSync('src/zombie/zombie.html', 'utf8').replace('__ZOMBIE__', () => js.replace(/<\/script/gi, '<\\/script'));
fs.mkdirSync('dist', { recursive: true }); fs.writeFileSync('dist/zombie.html', html);
fs.rmSync('dist/zombie-assets', { recursive: true, force: true }); fs.cpSync('data/zombie', 'dist/zombie-assets', { recursive: true });
console.log('dist/zombie.html', html.length, 'bytes, dist/zombie-assets/ copied');
