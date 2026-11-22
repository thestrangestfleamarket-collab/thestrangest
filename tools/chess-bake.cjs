// bakes SKIRMISH TABLE's people: PWCHROME=/opt/pw-browsers/chromium node tools/chess-bake.cjs  ->  data/chess/units/ (each unit type one thinned skinned mesh, <type>.glb; the one picture they share, atlas.jpg; their clips, anim.glb) from the originals in data/full/chess/characters/
const es = require('esbuild'), fs = require('fs'), http = require('http'), path = require('path'), { chromium } = require('playwright');
const SRC = path.resolve('data/full/chess/characters'), OUT = 'data/chess/units';
const js = es.buildSync({ entryPoints: ['tools/chess-bake.page.js'], bundle: true, format: 'esm', target: 'es2022', write: false, logLevel: 'error' }).outputFiles[0].text;
const srv = http.createServer((q, r) => {
  if (q.url === '/') { r.writeHead(200, { 'content-type': 'text/html' }); return r.end('<!doctype html><script type="module">' + js.replace(/<\/script/gi, '<\\/script') + '</script>'); }
  const f = path.join(SRC, path.basename(q.url));
  if (!q.url.startsWith('/full/') || !fs.existsSync(f)) { r.writeHead(404); return r.end(); }
  r.writeHead(200, { 'content-type': 'model/gltf-binary' }); fs.createReadStream(f).pipe(r);
});
(async () => {
  await new Promise(r => srv.listen(0, '127.0.0.1', r));
  const b = await chromium.launch(process.env.PWCHROME ? { executablePath: process.env.PWCHROME } : {}), pg = await b.newPage();
  pg.on('pageerror', e => console.log('page: ' + e.message));
  await pg.goto('http://127.0.0.1:' + srv.address().port + '/'); await pg.waitForFunction(() => !!window.bake);
  const { files, log } = await pg.evaluate(() => window.bake());
  fs.rmSync(OUT, { recursive: true, force: true }); fs.mkdirSync(OUT, { recursive: true });
  let all = 0; for (const [name, data] of Object.entries(files)) { const buf = Buffer.from(data, 'base64'); all += buf.length; fs.writeFileSync(path.join(OUT, name), buf); }
  console.log(log.join('\n') + '\n' + OUT + ': ' + Object.keys(files).length + ' files, ' + Math.round(all / 1024) + ' KB');
  await b.close(); srv.close();
})().catch(e => { console.log(e.stack || e); process.exit(1); });
