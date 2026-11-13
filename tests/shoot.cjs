// THE SHOOT CHECK: node tests/shoot.cjs [dist/shoot.html] [folder for screenshots]. BREACHLINE loads, a practice round goes live on each arena's start, the rifle fires and reloads, shots at the bot kill it and score; then in an emulated Quest 3 the pistol is drawn from its holster, fired, its magazine swapped by hand; no page errors.
const { chromium } = require('playwright'), path = require('path'), fs = require('fs');
const fails = [], ok = (c, m) => { if (!c) { fails.push(m); console.log((process.env.GITHUB_ACTIONS ? '::error title=shoot::' : 'FAIL ') + m); } else console.log('ok   ' + m); };
const PAGE = path.resolve(process.argv[2] || 'dist/shoot.html'), ROOT = path.dirname(PAGE), OUT = process.argv[3]; if (OUT) fs.mkdirSync(OUT, { recursive: true });
const srv = require('http').createServer((q, r) => { const f = path.join(ROOT, decodeURIComponent(q.url.split('?')[0])); if (!f.startsWith(ROOT)) { r.writeHead(403); return r.end(); }
  fs.readFile(f, (e, d) => { if (e) { r.writeHead(404); return r.end(); } r.writeHead(200, { 'content-type': 'text/html' }); r.end(d); }); });
(async () => {
  await new Promise(res => srv.listen(0, '127.0.0.1', res)); const FILE = 'http://127.0.0.1:' + srv.address().port + '/' + path.basename(PAGE) + '?q=0';
  const b = await chromium.launch({ ...(process.env.PWCHROME ? { executablePath: process.env.PWCHROME } : {}), args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const errs = [], watch = pg => { pg.on('pageerror', e => errs.push(e.message.slice(0, 300))); pg.on('console', m => { if (m.type() === 'error') errs.push('console: ' + m.text().slice(0, 300)); }); };
  // frames, not seconds: software rendering is slow and the game clamps its step
  const frames = (pg, n) => pg.evaluate(n => new Promise(r => { let c = 0, l = game.time; const iv = setInterval(() => { if (game.time !== l) { l = game.time; c++; } if (c >= n) { clearInterval(iv); r(); } }, 5); }), n);
  const live = pg => pg.evaluate(() => { game.match.tl = 0.02; }).then(() => pg.waitForFunction(() => game.match.ph === 'live', null, { timeout: 240000 }));

  const pg = await b.newPage({ viewport: { width: 480, height: 270 } }); watch(pg);
  const t0 = Date.now(); await pg.goto(FILE); await pg.waitForFunction(() => window.game && game.world, null, { timeout: 240000 }).catch(() => {});
  const up = await pg.evaluate(() => !!(window.game && game.world)); ok(up, 'the page starts on its menu with the first arena built (' + ((Date.now() - t0) / 1000).toFixed(0) + ' s)');
  if (!up) { console.log(errs.join(' | ')); await b.close(); srv.close(); process.exit(1); }
  if (OUT) await pg.screenshot({ path: path.join(OUT, '01-menu.png') });
  for (let i = 0; i < 3; i++) { const r = await pg.evaluate(i => { game.loadMap(i); const w = game.world, bad = w.spawns.filter(([x, z]) => { const p = { x, z }; w.resolveCircle(p, 0.24, 0.35, 1.7); return Math.hypot(p.x - x, p.z - z) > 0.02; }); return { name: w.name, col: w.colliders.length, bad: bad.length }; }, i);
    ok(r.col > 50 && r.bad === 0, r.name + ' builds and every start is clear of walls'); }
  await pg.evaluate(() => game.loadMap(0)); await pg.click('#practice'); await pg.click('#desktop'); await live(pg);
  ok(await pg.evaluate(() => game.playing && !game.player.locked && !!game.bot), 'PRACTICE starts a round against the bot');
  // stand the bot still four metres ahead, the view held level
  await pg.evaluate(() => { const g = game, pl = g.player; g.bot.update = () => {}; pl.spawn(-12.5, 0, 0, 0); pl.cur = 'rifle'; const yw = pl.yaw; Object.defineProperty(pl, 'pitch', { get: () => 0, set() {} }); Object.defineProperty(pl, 'yaw', { get: () => yw, set() {} });
    g.bot.pos.set(-8.5, 0, 0); g.bot.head.set(-8.5, 1.62, 0); g.bot.alive = true; g.bot.hp = 100;
    setInterval(() => g.onMsg({ t: 's', h: [-8.5, 1.62, 0], hq: [0, 0, 0, 1], l: null, r: null, al: g.bot.alive ? 1 : 0, w: [], g: [] }), 30); });
  await frames(pg, 12);
  await pg.evaluate(() => { game.player.mouse[0] = true; game.player.mouseEdge = true; });
  await pg.waitForFunction(() => !game.bot.alive, null, { timeout: 240000 }).catch(() => {});
  await pg.evaluate(() => { game.player.mouse[0] = false; }); if (OUT) await pg.screenshot({ path: path.join(OUT, '02-kill.png') });
  let s = await pg.evaluate(() => ({ alive: game.bot.alive, sc: game.match.sc, r: game.player.weapons.rifle.rounds }));
  ok(!s.alive && s.sc[0] === 1 && s.r < 31, 'rifle fire kills the bot and scores (' + (31 - s.r) + ' rounds)');
  await pg.evaluate(() => game.player.weapons.rifle.autoReload()); await pg.waitForFunction(() => game.player.weapons.rifle.rounds >= 30, null, { timeout: 240000 }).catch(() => {});
  ok(await pg.evaluate(() => game.player.weapons.rifle.rounds >= 30 && game.player.weapons.rifle.chambered), 'R reloads it');
  await pg.close();

  const vr = await b.newPage({ viewport: { width: 320, height: 180 } }); watch(vr);
  await vr.addInitScript(fs.readFileSync(require.resolve('iwer/build/iwer.js'), 'utf8') + ';window.__xrd=new IWER.XRDevice(IWER.metaQuest3);window.__xrd.installRuntime({forceInstall:true});window.__xrd.position.set(0,1.7,0);');
  await vr.goto(FILE); await vr.waitForFunction(() => window.game && game.world, null, { timeout: 240000 });
  await vr.click('#practice'); await vr.waitForFunction(() => !document.getElementById('vr').disabled, null, { timeout: 30000 }).catch(() => {}); await vr.click('#vr');
  await vr.waitForFunction(() => game.renderer.xr.isPresenting, null, { timeout: 60000 }).catch(() => {});
  ok(await vr.evaluate(() => game.renderer.xr.isPresenting), 'ENTER VR starts the headset session'); await live(vr);
  await vr.evaluate(() => { game.bot.update = () => {}; const g = game, V = g.player.head.constructor;
    window.put = (c, w) => { const l = w.clone().applyMatrix4(g.rig.matrixWorld.clone().invert()); c.position.set(l.x, l.y, l.z); }; window.V3 = V; });
  await frames(vr, 6);
  const R = (f, a) => vr.evaluate(f, a), pistol = () => R(() => { const w = game.player.weapons.pistol; return { st: w.state, r: w.rounds, mag: w.magIn, res: w.reserve }; });
  ok(await R(() => game.player.hands.every(h => h.active)), 'both controllers are tracked as hands');
  await R(() => put(__xrd.controllers.right, game.player.holsters.pistol.p)); await frames(vr, 4); await R(() => __xrd.controllers.right.updateButtonValue('squeeze', 1)); await frames(vr, 4);
  ok((await pistol()).st === 'held', 'gripping at the right hip draws the pistol');
  await R(() => { const pl = game.player, f = new V3(0, 0, -1).applyQuaternion(pl.headQ); put(__xrd.controllers.right, pl.head.clone().addScaledVector(f, 0.45).add(new V3(0, -0.15, 0))); }); await frames(vr, 4);
  for (let i = 0; i < 2; i++) { await R(() => __xrd.controllers.right.updateButtonValue('trigger', 1)); await frames(vr, 4); await R(() => __xrd.controllers.right.updateButtonValue('trigger', 0)); await frames(vr, 5); }
  ok((await pistol()).r === 14, 'the trigger fires it, a round each pull');
  await R(() => __xrd.controllers.right.updateButtonValue('a-button', 1)); await frames(vr, 3); await R(() => __xrd.controllers.right.updateButtonValue('a-button', 0)); await frames(vr, 3);
  ok(!(await pistol()).mag, 'A drops the magazine');
  await R(() => put(__xrd.controllers.left, game.player.holsters.pouchL.p)); await frames(vr, 4); await R(() => __xrd.controllers.left.updateButtonValue('squeeze', 1)); await frames(vr, 4);
  await R(() => put(__xrd.controllers.left, game.player.weapons.pistol.magwell.getWorldPosition(new V3()))); await frames(vr, 5);
  s = await pistol(); ok(s.mag && s.r === 16, 'a magazine from the belt goes into the magwell by hand');
  await R(() => { __xrd.controllers.left.updateButtonValue('squeeze', 0); __xrd.controllers.right.updateButtonValue('squeeze', 0); });
  await vr.waitForFunction(() => game.player.weapons.pistol.state === 'holster', null, { timeout: 120000 }).catch(() => {});
  ok((await pistol()).st === 'holster', 'let go, it returns to its holster');
  ok(errs.length === 0, 'no page errors' + (errs.length ? ': ' + errs.join(' | ') : ''));
  await b.close(); srv.close(); if (fails.length) { console.log(fails.length + ' failed'); process.exit(1); } console.log('all ok');
})();
