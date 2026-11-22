// THE BALL CHECK: node tests/ball.cjs [dist/ball.html] [folder for screenshots]. JUNGLE COURT loads with the ball in hand; a free throw goes in, a dropped ball rebounds as a regulation one, two balls knock, the 60 second game counts a streak and ends, the sky and weather change; then an emulated Quest 3: a controller takes the ball and throws it, the stick teleports, tracked hands show, and the frame's cost is held.
const { chromium } = require('playwright'), path = require('path'), fs = require('fs');
const fails = [], ok = (c, m) => { if (!c) { fails.push(m); console.log((process.env.GITHUB_ACTIONS ? '::error title=ball::' : 'FAIL ') + m); } else console.log('ok   ' + m); };
const PAGE = path.resolve(process.argv[2] || 'dist/ball.html'), ROOT = path.dirname(PAGE), OUT = process.argv[3]; if (OUT) fs.mkdirSync(OUT, { recursive: true });
const TYPE = { html: 'text/html', jpg: 'image/jpeg', glb: 'model/gltf-binary' };
const srv = require('http').createServer((q, r) => { const f = path.join(ROOT, decodeURIComponent(q.url.split('?')[0])); if (!f.startsWith(ROOT)) { r.writeHead(403); return r.end(); }
  fs.readFile(f, (e, d) => { if (e) { r.writeHead(404); return r.end(); } r.writeHead(200, { 'content-type': TYPE[f.split('.').pop()] || 'application/octet-stream' }); r.end(d); }); });
(async () => {
  await new Promise(res => srv.listen(0, '127.0.0.1', res)); const FILE = 'http://127.0.0.1:' + srv.address().port + '/' + path.basename(PAGE);
  const b = await chromium.launch({ ...(process.env.PWCHROME ? { executablePath: process.env.PWCHROME } : {}), args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const errs = [], watch = pg => { pg.on('pageerror', e => errs.push(e.message.slice(0, 300))); pg.on('console', m => { if (m.type() === 'error' && !/Failed to load resource/.test(m.text())) errs.push('console: ' + m.text().slice(0, 300)); }); };
  const till = (pg, f, a) => pg.waitForFunction(f, a, { timeout: 300000 }).then(() => true).catch(() => false);
  const shot = async (pg, n) => { if (OUT) await pg.screenshot({ path: path.join(OUT, n + '.png'), timeout: 240000 }); };
  const frames = (pg, n) => pg.evaluate(n => new Promise(r => { let k = 0; const f = () => (++k >= n ? r() : requestAnimationFrame(f)); requestAnimationFrame(f); }), n);
  // a free throw from the line, by the sums
  const THROW = `(()=>{const c=__ball,B=c.ball;c.free(B);B.p.set(0,2.2,-8.5);const dx=4.22,dy=3.048-2.2,th=52*Math.PI/180,v=Math.sqrt(9.81*dx*dx/(2*Math.cos(th)**2*(dx*Math.tan(th)-dy)))*1.035;B.v.set(0,v*Math.sin(th),-v*Math.cos(th));B.w.set(8,0,0);c.rig.position.set(0,0,-8.5);c.camera.updateMatrixWorld(true);c.launched(B);c.simulate(2.5);})()`;

  const pg = await b.newPage({ viewport: { width: 640, height: 360 } }); watch(pg);
  const t0 = Date.now(); await pg.goto(FILE); const up = await till(pg, () => window.__ball && __ball.t > .2);
  ok(up && await pg.evaluate(() => __ball.ball.holder === 'cam' && __ball.balls.length === 4 && __ball.balls.filter(q => q.rest).length === 3), 'the page starts with a ball in hand and three on the rack (' + ((Date.now() - t0) / 1000).toFixed(0) + ' s)');
  if (!up) { console.log(errs.join(' | ')); await b.close(); srv.close(); process.exit(1); }
  await pg.evaluate(() => { __ball.q = 2; }); await shot(pg, '01-court');
  ok(await pg.evaluate(t => { eval(t); const s = __ball.stats; return s.made === 1 && s.pts === 2 && s.shots === 1; }, THROW), 'a free throw from the line drops through the net for two');
  const peak = await pg.evaluate(() => { const c = __ball, B = c.ball; c.free(B); B.p.set(3, 1.8 + .1194, 0); B.v.set(0, 0, 0); B.w.set(0, 0, 0); let up = false, pk = 0; for (let i = 0; i < 400; i++) { c.simulate(.01); const y = B.p.y - .1194; if (B.v.y > 0) up = true; if (up) { pk = Math.max(pk, y); if (B.v.y < 0) break; } } return pk; });
  ok(peak > 1.15 && peak < 1.45, 'dropped from 1.8 m the ball comes back to ' + peak.toFixed(2) + ' m (a regulation ball: 1.2 to 1.4)');
  ok(await pg.evaluate(() => { const c = __ball, A = c.balls[1], B = c.balls[2]; c.free(A); c.free(B); A.p.set(0, 1, 0); A.v.set(3, 0, 0); B.p.set(.6, 1, 0); B.v.set(0, 0, 0); c.simulate(.3); return B.v.x > .8 && A.v.x < 2; }), 'one ball knocks another on');
  const g = await pg.evaluate(t => { const c = __ball; c.startGame(); for (let i = 0; i < 3; i++) eval(t); const mid = { score: c.game.score, streak: c.game.streak, on: c.game.on }; c.simulate(60); return { mid, on: c.game.on, best: c.game.best }; }, THROW);
  ok(g.mid.on && g.mid.score === 7 && g.mid.streak === 3 && !g.on && g.best >= 7, 'the 60 second game: three in a row score 2, 2 and 3, the clock ends it and the best is kept (' + g.mid.score + ', best ' + g.best + ')');
  ok(await pg.evaluate(async () => { const c = __ball; for (const [h, w] of [[12, 'clear'], [19, 'storm'], [22, 'mist']]) { c.world.hour = h; c.world.wx = w; c.applyWorld(); await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r))); } return c.world.wx === 'mist' && !!c.scene.fog; }), 'noon, a storm at dusk and a misty night each draw');
  const z0 = await pg.evaluate(() => __ball.rig.position.z); await pg.keyboard.down('KeyW'); await till(pg, z => __ball.rig.position.z < z - .3, z0); await pg.keyboard.up('KeyW');
  ok(await pg.evaluate(z => __ball.rig.position.z < z - .3, z0), 'W walks up the court'); await shot(pg, '02-walk'); await pg.close();

  const vr = await b.newPage({ viewport: { width: 320, height: 180 } }); watch(vr);
  await vr.addInitScript(fs.readFileSync(require.resolve('iwer/build/iwer.min.js'), 'utf8') + ';window.__xrd=new IWER.XRDevice(IWER.metaQuest3);window.__xrd.installRuntime({forceInstall:true});window.__xrd.position.set(0,1.7,0);');
  await vr.goto(FILE); await till(vr, () => window.__ball && __ball.t > .2); await till(vr, () => !document.getElementById('btnVR').hidden); await vr.click('#btnVR');
  ok(await till(vr, () => __ball.renderer.xr.isPresenting && __ball.mode === 'vr' && __ball.hands.some(h => h.src)), 'ENTER VR starts the headset session with its controllers');
  await vr.evaluate(() => { __ball.q = 2; }); await frames(vr, 3);
  await vr.evaluate(() => { const c = __ball, B = c.ball, R = __xrd.controllers.right; R.position.set(B.p.x - c.rig.position.x, B.p.y, B.p.z - c.rig.position.z + .08); R.updateButtonValue('squeeze', 1); });
  ok(await till(vr, () => __ball.hands.some(h => h.ball)), 'a grip beside the ball takes it in the hand');
  const flew = await vr.evaluate(async () => { const c = __ball, R = __xrd.controllers.right, H = c.hands.find(h => h.ball), B = H.ball, p0 = { x: R.position.x, y: R.position.y, z: R.position.z }, fr = () => new Promise(r => requestAnimationFrame(r));
    for (let i = 1; i <= 6; i++) { R.position.set(p0.x, p0.y + i * .06, p0.z - i * .07); await fr(); } const hv = H.vel.clone(), by = B.p.y; R.updateButtonValue('squeeze', 0); await fr(); await fr(); return { free: !B.holder && !H.ball, up: hv.y, fwd: -hv.z, rose: by - 1.15 }; });
  ok(flew.free && flew.up > 0 && flew.fwd > 0 && flew.rose > .2, 'the ball follows the hand up, and a swing and letting go sends it on its way');
  const tp = await vr.evaluate(async () => { const c = __ball, R = __xrd.controllers.right, z0 = c.rig.position.z, fr = () => new Promise(r => requestAnimationFrame(r)); R.position.set(.2, 1.2, -.2); R.quaternion.set(0, 0, 0, 1); R.updateAxes('thumbstick', 0, -1); for (let i = 0; i < 4; i++) await fr(); const aim = c.tp.valid; R.updateAxes('thumbstick', 0, 0); for (let i = 0; i < 3; i++) await fr(); return { aim, moved: z0 - c.rig.position.z }; });
  ok(tp.aim && tp.moved > 1, 'the right stick pushed forward aims an arc and letting go teleports there (' + tp.moved.toFixed(1) + ' m)');
  const cost = await vr.evaluate(async () => { const c = __ball, I = c.renderer.info; I.autoReset = false; I.reset(); await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r))); const o = { calls: I.render.calls, tris: I.render.triangles }; I.autoReset = true; return o; });
  ok(cost.calls > 0 && cost.calls < 520 && cost.tris < 1500000, 'a frame in the headset: ' + cost.calls + ' draws and ' + cost.tris + ' triangles, shadows and both eyes (under 520 and 1,500,000)'); await shot(vr, '03-vr');
  await vr.evaluate(() => { __xrd.primaryInputMode = 'hand'; });
  ok(await till(vr, () => __ball.hands.some(h => h.isHand)), 'with the controllers down the hands are tracked');
  ok(errs.length === 0, 'no page errors' + (errs.length ? ': ' + errs.join(' | ') : ''));
  await b.close(); srv.close(); if (fails.length) { console.log(fails.length + ' failed'); process.exit(1); } console.log('all ok');
})();
