// builds JUNGLE COURT's page: node tools/ball.cjs  ->  dist/ball.html (src/ball/, three bundled in) and dist/ball-assets/ (data/ball/, fetched by the page)
const es = require('esbuild'), fs = require('fs'), path = require('path');
// THE MARKET's skee-ball and THE LAST CHANCE's pool table are bundled as they are: what each asks of its own game is answered by a small stand-in
const lend = { name: 'lend', setup(b) { b.onResolve({ filter: /^\.\.?\// }, a => { const from = a.importer.replace(/\\/g, '/');
  if (/src\/146yz-skee\.js$/.test(from)) return { path: path.resolve('src/ball/shim-market.js') }; if (/src\/saloon\/pool\.js$/.test(from)) return { path: path.resolve('src/ball/shim-saloon.js') }; }); } };
const out = es.build({ entryPoints: ['src/ball/main.js'], bundle: true, format: 'esm', target: 'es2022', charset: 'utf8', minify: process.env.MIN !== '0', legalComments: 'none', write: false, logLevel: 'error', plugins: [lend] });
out.then(r => { const code = r.outputFiles[0].text, html = fs.readFileSync('src/ball/ball.html', 'utf8').replace('__BALL__', () => code.replace(/<\/script/gi, '<\\/script'));
  fs.mkdirSync('dist', { recursive: true }); fs.writeFileSync('dist/ball.html', html);
  fs.rmSync('dist/ball-assets', { recursive: true, force: true }); fs.cpSync('data/ball', 'dist/ball-assets', { recursive: true });
  console.log('dist/ball.html', html.length, 'bytes, dist/ball-assets/ copied'); }).catch(e => { console.error(e.message || e); process.exit(1); });
