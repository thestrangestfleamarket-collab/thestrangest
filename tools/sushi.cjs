// builds YATAI '86's page: node tools/sushi.cjs  ->  dist/sushi.html (src/sushi/, three bundled in) and dist/sushi-assets/ (data/sushi/: the Rocketbox people and their motion, fetched by the page)
const es = require('esbuild'), fs = require('fs');
const js = es.buildSync({ entryPoints: ['src/sushi/main.js'], bundle: true, format: 'esm', target: 'es2022', charset: 'utf8', minify: process.env.MIN !== '0', legalComments: 'none', write: false, logLevel: 'error' }).outputFiles[0].text;
const html = fs.readFileSync('src/sushi/sushi.html', 'utf8').replace('__SUSHI__', () => js.replace(/<\/script/gi, '<\\/script'));
fs.mkdirSync('dist', { recursive: true }); fs.writeFileSync('dist/sushi.html', html);
fs.rmSync('dist/sushi-assets', { recursive: true, force: true }); fs.cpSync('data/sushi', 'dist/sushi-assets', { recursive: true });
console.log('dist/sushi.html', html.length, 'bytes, dist/sushi-assets/ copied');
