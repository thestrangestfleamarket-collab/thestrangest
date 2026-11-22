// builds JUNGLE COURT's page: node tools/ball.cjs  ->  dist/ball.html (src/ball/, three bundled in) and dist/ball-assets/ (data/ball/, fetched by the page)
const es = require('esbuild'), fs = require('fs'), path = require('path');
// THE MARKET's skee-ball and THE LAST CHANCE's pool table are bundled as they are: what each asks of its own game is answered by a small stand-in
const lend = { name: 'lend', setup(b) { b.onResolve({ filter: /^\.\.?\// }, a => { const from = a.importer.replace(/\\/g, '/');
  if (/src\/146yz-skee\.js$/.test(from)) return { path: path.resolve('src/ball/shim-market.js') }; if (/src\/saloon\/pool\.js$/.test(from)) return { path: path.resolve('src/ball/shim-saloon.js') }; }); } };
const out = es.build({ entryPoints: ['src/ball/main.js'], bundle: true, format: 'esm', target: 'es2022', charset: 'utf8', minify: process.env.MIN !== '0', legalComments: 'none', write: false, logLevel: 'error', plugins: [lend] });
out.then(r => { const code = r.outputFiles[0].text, html = fs.readFileSync('src/ball/ball.html', 'utf8').replace('__BALL__', () => code.replace(/<\/script/gi, '<\\/script'));
  fs.mkdirSync('dist', { recursive: true }); fs.writeFileSync('dist/ball.html', html);
  fs.rmSync('dist/ball-assets', { recursive: true, force: true }); fs.cpSync('data/ball', 'dist/ball-assets', { recursive: true });
  // THE MARKET's own furniture for the clubhouse (data/bookstore.json, bar.json), only the pieces it stands, and the market's television channels
  const J = f => JSON.parse(fs.readFileSync('data/' + f + '.json', 'utf8')), kit = {}, pick = (src, names) => { for (const n of names) { if (!src[n]) throw new Error('ball: no market model ' + n); kit[n] = src[n]; } };
  pick(J('bookstore'), ['armchair', 'tubchair', 'floorlamp', 'tablelamp', 'rug2', 'radiator', 'clock', 'plant', 'globe', 'sidetable', 'alcove', 'sideboard', 'bookstack']); pick(J('bar'), ['jukebox', 'stool', 'palm']);
  fs.writeFileSync('dist/ball-assets/market.json', JSON.stringify(kit)); fs.writeFileSync('dist/ball-assets/tv.json', JSON.stringify(J('tv').channels.filter(c => !c.live && c.shows && c.shows.length).map(c => ({ ch: c.ch, name: c.name, shows: c.shows.map(s => ({ id: s.id, file: s.file })) }))));
  console.log('dist/ball.html', html.length, 'bytes, dist/ball-assets/ copied'); }).catch(e => { console.error(e.message || e); process.exit(1); });
