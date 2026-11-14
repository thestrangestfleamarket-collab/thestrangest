// builds COLD BORE's page: node tools/sniper.cjs  ->  dist/sniper.html (src/sniper/, three and three-mesh-bvh bundled in) and dist/sniper-assets/ (data/sniper/: skies, surfaces, models, sounds)
const fs = require('fs'), es = require('esbuild');
const js = es.buildSync({ entryPoints: ['src/sniper/main.js'], bundle: true, format: 'esm', target: 'es2022', charset: 'utf8', minify: process.env.MIN !== '0', legalComments: 'none', write: false, logLevel: 'error' }).outputFiles[0].text;
const html = fs.readFileSync('src/sniper/sniper.html', 'utf8').replace('__SNIPER__', () => js.replace(/<\/script/gi, '<\\/script'));
fs.mkdirSync('dist', { recursive: true }); fs.writeFileSync('dist/sniper.html', html);
fs.rmSync('dist/sniper-assets', { recursive: true, force: true }); fs.cpSync('data/sniper', 'dist/sniper-assets', { recursive: true }); console.log('dist/sniper.html', html.length, 'bytes, dist/sniper-assets/ copied');
