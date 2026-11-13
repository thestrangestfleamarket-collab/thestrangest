// builds VESPER WARD's page: node tools/scare.cjs  ->  dist/scare.html (src/scare/, three and cannon-es bundled in) and dist/scare-assets/ (data/scare/, its models, fetched by the page)
const es = require('esbuild'), fs = require('fs');
const js = es.buildSync({ entryPoints: ['src/scare/main.js'], bundle: true, format: 'esm', target: 'es2022', charset: 'utf8', minify: process.env.MIN !== '0', legalComments: 'none', write: false, logLevel: 'error' }).outputFiles[0].text;
const html = fs.readFileSync('src/scare/scare.html', 'utf8').replace('__SCARE__', () => js.replace(/<\/script/gi, '<\\/script'));
fs.mkdirSync('dist', { recursive: true }); fs.writeFileSync('dist/scare.html', html);
fs.rmSync('dist/scare-assets', { recursive: true, force: true }); fs.mkdirSync('dist/scare-assets');
for (const f of fs.readdirSync('data/scare')) if (f.endsWith('.glb')) fs.copyFileSync('data/scare/' + f, 'dist/scare-assets/' + f);
console.log('dist/scare.html', html.length, 'bytes, dist/scare-assets/ copied');
