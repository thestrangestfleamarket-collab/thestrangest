// THE EDGE CHECK: node tests/edge.cjs [dist/edge.html] [folder for screenshots]. EDGE OF 88 loads on its menu over the city, the lift rides from the lobby to floor 88 and its doors open, ten seconds on the chalk X clears the floor, a step off the plank falls and puts you back in the lobby; then an emulated Quest 3 enters VR and rides the lift; no page errors.
const { chromium } = require('playwright'), path = require('path'), fs = require('fs');
const fails = [], ok = (c, m) => { if (!c) { fails.push(m); console.log((process.env.GITHUB_ACTIONS ? '::error title=edge::' : 'FAIL ') + m); } else console.log('ok   ' + m); };
const PAGE = path.resolve(process.argv[2] || 'dist/edge.html'), ROOT = path.dirname(PAGE), OUT = process.argv[3]; if (OUT) fs.mkdirSync(OUT, { recursive: true });
const srv = require('http').createServer((q, r) => { const f = path.join(ROOT, decodeURIComponent(q.url.split('?')[0])); if (!f.startsWith(ROOT)) { r.writeHead(403); return r.end(); }
  fs.readFile(f, (e, d) => { if (e) { r.writeHead(404); return r.end(); } r.writeHead(200, { 'content-type': 'text/html' }); r.end(d); }); });
(async () => {
  await new Promise(res => srv.listen(0, '127.0.0.1', res)); const FILE = 'http://127.0.0.1:' + srv.address().port + '/' + path.basename(PAGE);
  const b = await chromium.launch({ ...(process.env.PWCHROME ? { executablePath: process.env.PWCHROME } : {}), args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const errs = [], watch = pg => { pg.on('pageerror', e => errs.push(e.message.slice(0, 300))); pg.on('console', m => { if (m.type() === 'error' && !/Failed to load resource/.test(m.text())) errs.push('console: ' + m.text().slice(0, 300)); }); pg.route(/fonts\.(googleapis|gstatic)\.com/, r => r.abort()); };
  const secs = (pg, n) => pg.evaluate(n => new Promise(r => { const t = game.time + n, iv = setInterval(() => { if (game.time >= t) { clearInterval(iv); r(); } }, 10); }), n);
  const till = (pg, f, a) => pg.waitForFunction(f, a, { timeout: 300000 }).catch(() => {});
  const shot = async (pg, n) => { if (OUT) await pg.screenshot({ path: path.join(OUT, n + '.png') }); };
  const ride = async pg => { await pg.evaluate(() => game.pressFloor(game.FLOORS[0])); await till(pg, () => !game.ride && game.H > 300 && game.doorOpen > .98); };

  const pg = await b.newPage({ viewport: { width: 480, height: 270 } }); watch(pg);
  const t0 = Date.now(); await pg.goto(FILE); await till(pg, () => window.game && game.time > .2);
  const up = await pg.evaluate(() => !!window.game && game.state === 'preview' && !document.getElementById('overlay').hidden); ok(up, 'the page starts on its menu over the city (' + ((Date.now() - t0) / 1000).toFixed(0) + ' s)');
  if (!up) { console.log(errs.join(' | ')); await b.close(); srv.close(); process.exit(1); }
  await shot(pg, '01-menu');
  await pg.evaluate(() => localStorage.removeItem('edge88-cleared')); await pg.click('#flatBtn'); await secs(pg, .3);
  ok(await pg.evaluate(() => game.state === 'play' && game.H < 1 && game.doorOpen === 0), 'PLAY IN BROWSER puts you in the lift at the lobby, doors shut'); await shot(pg, '02-lift');
  await ride(pg); ok(await pg.evaluate(() => game.H === 308 && game.doorOpen > .98), 'the 88 button rides to floor 88 (308 m) and the doors open'); await shot(pg, '03-doors');
  await pg.keyboard.down('KeyW'); await till(pg, () => game.getHead().z < -1.2); await pg.keyboard.up('KeyW');
  ok(await pg.evaluate(() => game.getHead().z < -1.2 && game.state === 'play'), 'W walks out of the lift onto the plank'); await shot(pg, '04-plank');
  await pg.evaluate(() => { game.rig.position.x = 0; game.rig.position.z = -4.3; }); await till(pg, () => game.cleared['88'] === 1 || game.state !== 'play');
  ok(await pg.evaluate(() => game.cleared['88'] === 1 && game.state === 'play' && JSON.parse(localStorage.getItem('edge88-cleared'))['88'] === 1), 'ten seconds on the chalk X clears floor 88'); await shot(pg, '05-x');
  ok(await pg.evaluate(() => game.fear > .5), 'out there the fear is up (' + (await pg.evaluate(() => game.fear)).toFixed(2) + ')');
  await pg.evaluate(() => { game.rig.position.x = .8; }); await till(pg, () => game.state === 'fall'); ok(await pg.evaluate(() => game.state === 'fall'), 'a step off the plank falls'); await secs(pg, .6); await shot(pg, '06-fall');
  await till(pg, () => game.state === 'play'); ok(await pg.evaluate(() => game.state === 'play' && game.H < 1 && game.getHead().z > 1), 'and you are put back in the lift at the lobby');
  await pg.close();

  const vr = await b.newPage({ viewport: { width: 320, height: 180 } }); watch(vr);
  await vr.addInitScript(fs.readFileSync(require.resolve('iwer/build/iwer.js'), 'utf8') + ';window.__xrd=new IWER.XRDevice(IWER.metaQuest3);window.__xrd.installRuntime({forceInstall:true});window.__xrd.position.set(0,1.7,0);');
  await vr.goto(FILE); await till(vr, () => window.game && game.time > .2); await till(vr, () => !document.getElementById('vrBtn').disabled); await vr.click('#vrBtn');
  await till(vr, () => game.renderer.xr.isPresenting); ok(await vr.evaluate(() => game.renderer.xr.isPresenting && game.xr && game.state === 'play'), 'ENTER VR starts the headset session in the lift');
  await secs(vr, .5); await ride(vr); ok(await vr.evaluate(() => game.H === 308 && game.doorOpen > .98 && game.getHead().y > 1.5), 'in the headset the lift rides to floor 88 and opens, your head at standing height'); await shot(vr, '07-vr');
  ok(errs.length === 0, 'no page errors' + (errs.length ? ': ' + errs.join(' | ') : ''));
  await b.close(); srv.close(); if (fails.length) { console.log(fails.length + ' failed'); process.exit(1); } console.log('all ok');
})();
