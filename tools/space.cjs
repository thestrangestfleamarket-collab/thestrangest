// builds SPACE FLEET's page: node tools/space.cjs  ->  dist/space.html (src/space/, three bundled in) and dist/space-assets/ (data/space/: models, the sky, sounds)
const fs = require('fs'), es = require('esbuild');
const js = es.buildSync({ entryPoints: ['src/space/main.js'], bundle: true, format: 'esm', target: 'es2022', charset: 'utf8', minify: process.env.MIN !== '0', legalComments: 'none', write: false, logLevel: 'error' }).outputFiles[0].text;
const html = fs.readFileSync('src/space/space.html', 'utf8').replace('__SPACE__', () => js.replace(/<\/script/gi, '<\\/script'));
fs.mkdirSync('dist', { recursive: true }); fs.writeFileSync('dist/space.html', html);
fs.rmSync('dist/space-assets', { recursive: true, force: true }); fs.cpSync('data/space', 'dist/space-assets', { recursive: true, filter: f => !f.endsWith('models.json') }); // the star catalogue (Yale Bright Star Catalogue, public domain: data/stars.json) as whole numbers
fs.writeFileSync('dist/space-assets/stars.json', JSON.stringify(JSON.parse(fs.readFileSync('data/stars.json', 'utf8')).s.flatMap(s => s.map(v => Math.round(v * 100)))));
console.log('dist/space.html', html.length, 'bytes, dist/space-assets/ copied');
