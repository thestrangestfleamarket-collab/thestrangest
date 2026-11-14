// THE LASER CHECK: node tests/laser.cjs [dist/laser.html] [folder for screenshots]. The pack's rules (a tag, the reflex second, shield and warning, cancel, double, running out of shots, five in a row, game over), the room's filter; two linked pages: RED tags GREEN's front sensor, a gun held across the chest covers it, the last life ends the game on both; then an emulated Quest 3 lines up on two spots and fires.
const { chromium } = require('playwright'), path = require('path'), fs = require('fs'), { pathToFileURL } = require('url');
const fails = [], ok = (c, m) => { if (!c) { fails.push(m); console.log((process.env.GITHUB_ACTIONS ? '::error title=laser::' : 'FAIL ') + m); } else console.log('ok   ' + m); };
const PAGE = path.resolve(process.argv[2] || 'dist/laser.html'), ROOT = path.dirname(PAGE), OUT = process.argv[3]; if (OUT) fs.mkdirSync(OUT, { recursive: true });
const srv = require('http').createServer((q, r) => { const f = path.join(ROOT, decodeURIComponent(q.url.split('?')[0])); if (!f.startsWith(ROOT)) { r.writeHead(403); return r.end(); }
  fs.readFile(f, (e, d) => { if (e) { r.writeHead(404); return r.end(); } r.writeHead(200, { 'content-type': 'text/html' }); r.end(d); }); });
const IWER = fs.readFileSync(require.resolve('iwer/build/iwer.min.js'), 'utf8');

(async () => {
  // ---- the rules, no page ----
  const { Pack, RULES: R } = await import(pathToFileURL(path.resolve('src/laser/rules.js')));
  const mk = () => { const p = new Pack(), ev = []; p.on = (e) => ev.push(e); p.energize(); return { p, ev }; };
  { const { p, ev } = mk(); ok(p.lives === 25 && p.shots === 20 && p.phase === 'n', 'Super Charge 25: 25 lives, 20 shots');
    p.hit(10000); p.update(10100); ok(p.lives === 25, 'a tag waits for "the moment" before it counts');
    p.update(10200); ok(p.lives === 24 && p.phase === 'r', 'a tag costs a life and opens the reflex second');
    p.update(11050); ok(p.phase === 's' && ev.includes('shield'), 'then the defense shield');
    p.hit(12000); p.update(12200); ok(p.lives === 24, 'no tag lands under the shield');
    ok(p.pull(12300) === null, 'no firing under the shield');
    p.update(14050); ok(p.phase === 'w' && ev.includes('warning'), 'then the warning'); ok(p.pull(14100) === null, 'no firing in the warning');
    p.hit(15000); p.update(15200); ok(p.lives === 23 && p.phase === 'r', 'a tag in the warning lands and starts it all again');
    p.update(22100); ok(p.phase === 'n', 'seven seconds after a tag you are back in play'); }
  { const { p } = mk(); p.hit(10000); p.update(10200); const r = p.pull(10600); ok(r && r.reflex, 'the reflex shot: firing back inside the second');
    ok(p.pull(10700) === null, 'only one reflex shot'); }
  { const { p } = mk(); p.pull(9500); p.hit(10000); p.update(10200); ok(p.pull(10600) === null, 'no reflex shot when you fired in the second before the tag'); }
  { const { p, ev } = mk(); p.pull(10000); p.hit(10080); p.update(10300); ok(p.lives === 25 && ev.includes('cancel'), 'cancel: the trigger pulled the moment you are tagged, the tag does not count');
    const q = mk(); q.p.hit(20000); q.p.pull(20100); q.p.update(20300); ok(q.p.lives === 25, 'cancel works with the trigger just after the tag too'); }
  { const { p, ev } = mk(); p.hit(10000); p.update(10200); p.pull(10900); p.hit(10950); p.update(11200); ok(p.lives === 23 && ev.includes('double'), 'a double: a second tag at the moment of the reflex shot takes two lives');
    const q = mk(); q.p.hit(10000); q.p.update(10200); q.p.hit(10500); q.p.update(10800); ok(q.p.lives === 24, 'any other tag in the reflex second does not count'); }
  { const { p, ev } = mk(); let t = 0; for (let i = 0; i < 17; i++) p.pull(t += 1000); ok(p.shots === 3 && ev.includes('low'), 'LOW ON SHOTS at three');
    p.pull(t += 50); ok(p.shots === 3, 'one shot a second'); for (let i = 0; i < 3; i++) p.pull(t += 1000); ok(p.lives === 24 && p.shots === 20, 'all twenty shots without a tag cost a life and fill the shots again'); }
  { const { p, ev } = mk(); p.lives = 9; p.shots = 4; for (let i = 0; i < 4; i++) p.good(1); ok(p.shots === 20 && p.streak === 4 && p.score === 800 && !p.supercharged, 'a good shot fills the shots and scores 200');
    p.good(1); ok(p.supercharged && p.lives === 25 && ev.includes('super'), 'five in a row: supercharged, and every life back');
    const r = p.pull(5000); ok(r.n === 3 && p.shots === 17, 'supercharged: three shots a pull');
    p.hit(6000); p.update(6200); ok(!p.supercharged && p.streak === 0, 'a tag ends the supercharge and the run'); }
  { const { p } = mk(); p.hit(1000, { reflex: true }); p.update(1200); ok(p.score === -100, 'hit by a reflex shot: -100'); }
  { const { p, ev } = mk(); p.lives = 1; p.hit(1000); p.update(1200); ok(p.phase === 'o' && ev.includes('out') && p.pull(5000) === null, 'the last life: game over, the gun is dead'); }
  { const { LASER } = await import(pathToFileURL(path.resolve('worker/laser.js')));
    ok(LASER.clean({ t: 'fire', k: 'front', rf: 1, d: 3.2, sid: 4 }).k === 'front' && LASER.clean({ t: 'fire', k: 'heart' }).k === '' && LASER.clean({ t: 'cheat' }) === null && LASER.clean({ t: 'pose', p: [1] }) === null && LASER.slot([0]) === 1,
      'the room passes shots, poses and states, drops the rest, and gives the second player GREEN'); }

  // ---- two linked pages: RED and GREEN ----
  await new Promise(res => srv.listen(0, '127.0.0.1', res)); const URL = 'http://127.0.0.1:' + srv.address().port + '/' + path.basename(PAGE);
  const b = await chromium.launch({ ...(process.env.PWCHROME ? { executablePath: process.env.PWCHROME } : {}), args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const errs = [], watch = pg => { pg.on('pageerror', e => errs.push(e.message.slice(0, 300))); pg.on('console', m => { if (m.type() === 'error' && !/WebSocket|parties/.test(m.text())) errs.push('console: ' + m.text().slice(0, 300)); }); };
  const ctx = await b.newContext({ viewport: { width: 640, height: 400 }, deviceScaleFactor: 2 });
  const red = await ctx.newPage(), green = await ctx.newPage(); watch(red); watch(green);
  await red.goto(URL + '?sim&local&slot=0'); await red.waitForFunction(() => !!window.__laser, null, { timeout: 120000 });
  await green.goto(URL + '?sim&local&slot=1'); await green.waitForFunction(() => !!window.__laser, null, { timeout: 120000 });
  const tick = async (ms = 300) => { await red.bringToFront(); await red.waitForTimeout(ms / 2); await green.bringToFront(); await green.waitForTimeout(ms / 2); };
  const until = async (f, n = 80) => { for (let i = 0; i < n; i++) { if (await f()) return true; await tick(); } return false; };
  ok(await until(async () => (await red.evaluate(() => !!__laser.foe)) && (await green.evaluate(() => !!__laser.foe))), 'two pages in the room see each other');
  // RED at +z facing GREEN at -z; both touch the same two spots
  await red.evaluate(() => { __laser.pose([0, 1.6, 2], 0, [0.25, 1.2, 1.75], [0.3, 0, 1]); __laser.cal([-1, 0, 0], [1, 0, 0]); });
  await green.evaluate(() => { __laser.pose([0, 1.6, -2], Math.PI, [0.3, 1.0, -1.8], [0.3, 0, -1]); __laser.cal([1, 0, 0], [-1, 0, 0]); });
  ok(await until(() => red.evaluate(() => __laser.foeKit && __laser.foeKit.visible)), 'once both have lined up, RED sees GREEN\'s pack and gun');
  await red.evaluate(() => __laser.pull()); await tick(); await green.evaluate(() => __laser.pull());
  ok(await until(() => green.evaluate(() => __laser.stage === 'play'), 60), 'both pull the trigger, the count runs, the packs energize');
  const v0 = await green.evaluate(() => __laser.pack.view());
  ok(v0.l === 25 && v0.s === 20, 'GREEN starts with 25 lives and 20 shots');
  await tick(1200);
  const aimAt = async (name) => { const s = await red.evaluate(n => __laser.sensor(n), name); await red.evaluate(s => __laser.pose([0, 1.6, 2], 0, [0.25, 1.2, 1.75], s), s); await tick(200); await red.evaluate(() => __laser.pull()); };
  await aimAt('front');
  ok(await until(async () => (await green.evaluate(() => __laser.pack.lives)) === 24 && (await red.evaluate(() => __laser.pack.score)) === 200, 40), 'RED tags GREEN\'s front sensor: GREEN loses a life, RED scores a good shot');
  if (OUT) { await red.bringToFront(); await red.evaluate(() => __laser.pose([0, 1.6, 2], 0, [0.25, 1.2, 1.75], [0, 1.3, -2])); await tick(400); await red.screenshot({ path: path.join(OUT, '01-green-pack-tagged.png') }); }
  // GREEN covers: the gun held across the chest, in front of the big sensor
  await green.evaluate(() => { const p = __laser.pack; p.phase = 'n'; p.pending.length = 0; __laser.pose([0, 1.6, -2], Math.PI, [-0.25, 1.31, -1.75], [1, 1.31, -1.75]); });
  await tick(1500); const b0 = await red.evaluate(() => __laser.stats.blocked);
  const s = await red.evaluate(() => __laser.sensor('front')); await red.evaluate(s => __laser.pose([0, 1.6, 2], 0, [0.25, 1.2, 1.75], s), s); await tick(200); await red.evaluate(() => __laser.pull()); await tick(800);
  ok((await green.evaluate(() => __laser.pack.lives)) === 24 && (await red.evaluate(() => __laser.stats.blocked)) === b0 + 1, 'covering: a gun across the chest stops the beam before the front sensor');
  if (OUT) { await red.evaluate(() => __laser.pose([0, 1.6, 2], 0, [0.25, 1.2, 1.75], [0, 1.3, -2])); await tick(400); await red.screenshot({ path: path.join(OUT, '02-green-covering.png') }); }
  // GREEN turns: RED reads the back panel, then takes the last life
  await green.evaluate(() => { __laser.pack.lives = 1; __laser.pose([0, 1.6, -2], 0, [0.25, 1.1, -2.2], [0.3, 0, -3]); }); await tick(1500);
  if (OUT) { await red.screenshot({ path: path.join(OUT, '03-green-back-panel.png') }); }
  await aimAt('back');
  ok(await until(async () => (await green.evaluate(() => __laser.stage)) === 'over' && (await red.evaluate(() => __laser.stage)) === 'over', 40), 'a tag on the back sensor takes GREEN\'s last life: game over on both packs');
  ok((await red.evaluate(() => __laser.pack.lives)) > 0 && (await green.evaluate(() => __laser.pack.view().ph)) === 'o', 'RED still has lives, GREEN\'s pack is out');
  ok(errs.length === 0, 'no page errors' + (errs.length ? ': ' + errs.slice(0, 3).join(' | ') : ''));
  await ctx.close();

  // ---- an emulated Quest 3: enter, line up on two spots, the gun in hand, the trigger fires ----
  { const pg = await b.newPage({ viewport: { width: 640, height: 400 } }), e2 = []; pg.on('pageerror', e => e2.push(e.message.slice(0, 300)));
    await pg.addInitScript(IWER + ';window.xrDevice=new IWER.XRDevice(IWER.metaQuest3);xrDevice.installRuntime({forceInstall:true});xrDevice.position.set(0,1.6,1.5);');
    await pg.goto(URL + '?local&slot=0'); await pg.waitForFunction(() => !document.getElementById('enter').disabled, null, { timeout: 120000 }).catch(() => {});
    await pg.click('#enter');
    ok(await pg.waitForFunction(() => __laser.renderer.xr.isPresenting && __laser.stage === 'calA', null, { timeout: 60000 }).then(() => true, () => false), 'ENTER starts the passthrough session and asks for spot 1');
    const press = async () => { await pg.evaluate(() => xrDevice.controllers.right.updateButtonValue('trigger', 1)); await pg.waitForTimeout(250); await pg.evaluate(() => xrDevice.controllers.right.updateButtonValue('trigger', 0)); await pg.waitForTimeout(250); };
    await pg.evaluate(() => xrDevice.controllers.right.position.set(-1, 0.6, 0.6)); await pg.waitForTimeout(300); await press();
    await pg.evaluate(() => xrDevice.controllers.right.position.set(1, 0.6, 0.6)); await pg.waitForTimeout(300); await press();
    ok(await pg.waitForFunction(() => __laser.stage === 'idle' && __laser.myKit.visible, null, { timeout: 30000 }).then(() => true, () => false), 'two spots touched: lined up, the gun is in the hand and the pack is on');
    const f0 = await pg.evaluate(() => __laser.stats.fired); await pg.waitForTimeout(1100); await press();
    ok((await pg.evaluate(() => __laser.stats.fired)) === f0 + 1, 'the trigger fires the gun, waiting for player 2');
    ok(e2.length === 0, 'no page errors in the headset' + (e2.length ? ': ' + e2.join(' | ') : ''));
    await pg.close(); }

  await b.close(); srv.close(); console.log(fails.length ? fails.length + ' FAILED' : 'the laser check passed'); process.exit(fails.length ? 1 : 0);
})();
