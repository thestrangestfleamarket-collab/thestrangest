// builds BALL's page: node tools/ball.cjs  ->  dist/ball.html (src/ball/, three bundled in) and dist/ball-assets/ (data/ball/, fetched by the page)
const es = require('esbuild'), fs = require('fs');
const js = es.buildSync({ entryPoints: ['src/ball/main.js'], bundle: true, format: 'esm', target: 'es2022', charset: 'utf8', minify: process.env.MIN !== '0', legalComments: 'none', write: false, logLevel: 'error' }).outputFiles[0].text;
const html = fs.readFileSync('src/ball/ball.html', 'utf8').replace('__BALL__', () => js.replace(/<\/script/gi, '<\\/script'));
fs.mkdirSync('dist', { recursive: true }); fs.writeFileSync('dist/ball.html', html);
fs.rmSync('dist/ball-assets', { recursive: true, force: true }); fs.cpSync('data/ball', 'dist/ball-assets', { recursive: true });
console.log('dist/ball.html', html.length, 'bytes, dist/ball-assets/ copied');
