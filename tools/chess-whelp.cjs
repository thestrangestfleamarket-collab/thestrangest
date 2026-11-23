// makes SKIRMISH TABLE's dragon whelp's body from a scan of a real lizard: PWCHROME=/opt/pw-browsers/chromium node tools/chess-whelp.cjs [the scan's .glb]  ->  data/full/chess/creatures/iguana.glb (the animal off its board, 6,000 triangles) and iguana.jpg (its skin, 512 px)
// the scan: "Green iguana" (Iguana iguana), the State Darwin Museum, CC0, Sketchfab 217da036aae14762904ef4630023978b, fetched when no file is given from Objaverse's copy (25 MB, not kept); then PWCHROME=/opt/pw-browsers/chromium node tools/chess-bake.cjs
const es = require('esbuild'), fs = require('fs'), http = require('http'), os = require('os'), path = require('path'), { chromium } = require('playwright');
const URL0 = 'https://huggingface.co/datasets/allenai/objaverse/resolve/main/glbs/000-128/217da036aae14762904ef4630023978b.glb', OUT = 'data/full/chess/creatures/';
(async () => {
  let file = process.argv[2], tmp = null;
  if (!file) { tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'iguana-')); file = path.join(tmp, 'scan.glb'); const r = await fetch(URL0); if (!r.ok) throw new Error('no scan: ' + r.status); fs.writeFileSync(file, Buffer.from(await r.arrayBuffer())); }
  const js = es.buildSync({ entryPoints: ['tools/chess-whelp.page.js'], bundle: true, format: 'esm', target: 'es2022', write: false, logLevel: 'error' }).outputFiles[0].text;
  const srv = http.createServer((q, r) => { if (q.url.startsWith('/scan.glb')) { r.writeHead(200, { 'content-type': 'model/gltf-binary' }); return fs.createReadStream(file).pipe(r); }
    r.writeHead(200, { 'content-type': 'text/html' }); r.end('<!doctype html><script type="module">' + js.replace(/<\/script/gi, '<\\/script') + '</script>'); });
  await new Promise(r => srv.listen(0, '127.0.0.1', r));
  const b = await chromium.launch(process.env.PWCHROME ? { executablePath: process.env.PWCHROME } : {}), pg = await b.newPage();
  pg.on('pageerror', e => console.log('page: ' + e.message));
  await pg.goto('http://127.0.0.1:' + srv.address().port + '/' + '?lift=' + (process.env.LIFT || 6) + '&weld=' + (process.env.WELD || 1.2) + (process.env.LOG ? '&log=' + process.env.LOG : '')); await pg.waitForFunction(() => !!window.cut);
  const { glb, jpg, log } = await pg.evaluate(() => window.cut());
  fs.writeFileSync(OUT + 'iguana.glb', Buffer.from(glb, 'base64')); fs.writeFileSync(OUT + 'iguana.jpg', Buffer.from(jpg, 'base64'));
  console.log(log.join('\n') + '\n' + OUT + 'iguana.glb ' + Math.round(fs.statSync(OUT + 'iguana.glb').size / 1024) + ' KB, iguana.jpg ' + Math.round(fs.statSync(OUT + 'iguana.jpg').size / 1024) + ' KB');
  await b.close(); srv.close(); if (tmp) fs.rmSync(tmp, { recursive: true, force: true });
})().catch(e => { console.log(e.stack || e); process.exit(1); });
