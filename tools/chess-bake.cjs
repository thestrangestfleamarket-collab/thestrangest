// bakes SKIRMISH TABLE's dungeon and the mountainside round it: PWCHROME=/opt/pw-browsers/chromium node tools/chess-bake.cjs dungeon  ->  data/chess/dungeon/ (the hall, the near ground, the gorge's far wall and their leaves and water, dungeon.glb; their pictures, atlas.jpg, land.jpg, leaf.webp; the far country and its sky, pano.jpg, mask.jpg; the tiles', the floor's, the lava's and the falling water's pictures) from data/full/chess/dungeon/ (tools/chess-dungeon.py)
// its trees' pictures first: node tools/chess-bake.cjs trees  ->  data/full/chess/dungeon/trees.png, from the whole trees in .cache/chess-trees/ (python3 tools/chess-dungeon.py trees)
// and its people: PWCHROME=/opt/pw-browsers/chromium node tools/chess-bake.cjs  ->  data/chess/units/ (each unit type one thinned skinned mesh, <type>.glb; the one picture they share, atlas.jpg; their clips, anim.glb) from the originals in data/full/chess/characters/ (people) and data/full/chess/creatures/ (each creature one mesh with its own clips)
const es = require('esbuild'), fs = require('fs'), http = require('http'), path = require('path'), { chromium } = require('playwright');
const TREES = process.argv[2] === 'trees', DUN = TREES || process.argv[2] === 'dungeon', SRC = path.resolve(DUN ? 'data/full/chess/dungeon' : 'data/full/chess/characters'), OUT = TREES ? 'data/full/chess/dungeon' : DUN ? 'data/chess/dungeon' : 'data/chess/units';
const js = es.buildSync({ entryPoints: [DUN ? 'tools/chess-dungeon.page.js' : 'tools/chess-bake.page.js'], bundle: true, format: 'esm', target: 'es2022', write: false, logLevel: 'error' }).outputFiles[0].text;
const srv = http.createServer((q, r) => {
  if (q.url === '/') { r.writeHead(200, { 'content-type': 'text/html' }); return r.end('<!doctype html><script type="module">' + js.replace(/<\/script/gi, '<\\/script') + '</script>'); }
  const cre = q.url.startsWith('/creatures/'), tree = q.url.startsWith('/trees/'), f = cre ? path.join(path.resolve('data/full/chess/creatures'), q.url.slice(11)) : tree ? path.join(path.resolve('.cache/chess-trees'), q.url.slice(7)) : path.join(SRC, q.url.slice(6));
  if (!(cre || tree || q.url.startsWith('/full/')) || q.url.includes('..') || !fs.existsSync(f)) { r.writeHead(404); return r.end(); }
  r.writeHead(200, { 'content-type': f.endsWith('.jpg') ? 'image/jpeg' : f.endsWith('.png') ? 'image/png' : f.endsWith('.gltf') ? 'model/gltf+json' : f.endsWith('.dae') ? 'text/xml' : 'model/gltf-binary' }); fs.createReadStream(f).pipe(r);
});
(async () => {
  await new Promise(r => srv.listen(0, '127.0.0.1', r));
  const b = await chromium.launch({ ...(process.env.PWCHROME ? { executablePath: process.env.PWCHROME } : {}), args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] }), pg = await b.newPage();
  pg.on('console', m => { if (m.type() === 'log') console.log(m.text()); });
  pg.on('pageerror', e => console.log('page: ' + e.message));
  await pg.goto('http://127.0.0.1:' + srv.address().port + '/'); await pg.waitForFunction(() => !!window.bake);
  pg.setDefaultTimeout(0);
  const { files, log, copy = {} } = await pg.evaluate(d => (d === 2 ? window.bakeTrees() : d ? window.bakeDungeon() : window.bake()), TREES ? 2 : DUN ? 1 : 0);
  if (!TREES) fs.rmSync(OUT, { recursive: true, force: true }); fs.mkdirSync(OUT, { recursive: true });
  let all = 0; for (const [name, data] of Object.entries(files)) { const buf = Buffer.from(data, 'base64'); all += buf.length; fs.writeFileSync(path.join(OUT, name), buf); }
  for (const [name, from] of Object.entries(copy)) { fs.copyFileSync(path.join(SRC, from), path.join(OUT, name)); all += fs.statSync(path.join(OUT, name)).size; }
  console.log(log.join('\n') + '\n' + OUT + ': ' + Object.keys(files).length + ' files, ' + Math.round(all / 1024) + ' KB');
  await b.close(); srv.close();
})().catch(e => { console.log(e.stack || e); process.exit(1); });
