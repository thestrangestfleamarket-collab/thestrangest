// builds SENSOR TAG's page: node tools/tag.cjs  ->  dist/tag.html (src/tag/, three bundled in)
const es = require('esbuild'), fs = require('fs');
const js = es.buildSync({ entryPoints: ['src/tag/main.js'], bundle: true, format: 'esm', target: 'es2022', charset: 'utf8', minify: process.env.MIN !== '0', legalComments: 'none', write: false, logLevel: 'error' }).outputFiles[0].text;
const html = fs.readFileSync('src/tag/tag.html', 'utf8').replace('__TAG__', () => js.replace(/<\/script/gi, '<\\/script'));
fs.mkdirSync('dist', { recursive: true }); fs.writeFileSync('dist/tag.html', html);
console.log('dist/tag.html', html.length, 'bytes');
