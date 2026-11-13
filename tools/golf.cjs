// builds HALCYON GREENS' page: node tools/golf.cjs  ->  dist/golf.html (src/golf/, three bundled in) and dist/golf-assets/ (data/golf/, fetched by the page)
const es = require('esbuild'), fs = require('fs');
const js = es.buildSync({ entryPoints: ['src/golf/main.js'], bundle: true, format: 'esm', target: 'es2022', charset: 'utf8', minify: process.env.MIN !== '0', legalComments: 'none', write: false, logLevel: 'error' }).outputFiles[0].text;
const html = fs.readFileSync('src/golf/golf.html', 'utf8').replace('__GOLF__', () => js.replace(/<\/script/gi, '<\\/script'));
fs.mkdirSync('dist', { recursive: true }); fs.writeFileSync('dist/golf.html', html);
fs.rmSync('dist/golf-assets', { recursive: true, force: true }); fs.cpSync('data/golf', 'dist/golf-assets', { recursive: true });
console.log('dist/golf.html', html.length, 'bytes, dist/golf-assets/ copied');
