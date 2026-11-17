// THE SENSOR TAG CHECK: node tests/tag.cjs [dist/tag.html] [folder for screenshots]. The rules (ten lives, one shot a second), where a beam lands (the sensor from the front only; a hand, a turned back, a duck), the room's filter; two linked pages: ORANGE hits BLUE's sensor, a hand over it blocks, a turned back and a duck are no hit, the last life ends the game on both; then an emulated Quest 3 lines up on two spots and fires.
const { chromium } = require('playwright'), path = require('path'), fs = require('fs'), { pathToFileURL } = require('url');
const fails = [], ok = (c, m) => { if (!c) { fails.push(m); console.log((process.env.GITHUB_ACTIONS ? '::error title=tag::' : 'FAIL ') + m); } else console.log('ok   ' + m); };
const PAGE = path.resolve(process.argv[2] || 'dist/tag.html'), ROOT = path.dirname(PAGE), OUT = process.argv[3]; if (OUT) fs.mkdirSync(OUT, { recursive: true });
const srv = require('http').createServer((q, r) => { const f = path.join(ROOT, decodeURIComponent(q.url.split('?')[0])); if (!f.startsWith(ROOT)) { r.writeHead(403); return r.end(); }
  fs.readFile(f, (e, d) => { if (e) { r.writeHead(404); return r.end(); } r.writeHead(200, { 'content-type': 'text/html' }); r.end(d); }); });
const IWER = fs.readFileSync(require.resolve('iwer/build/iwer.min.js'), 'utf8');

(async () => {
  // ---- the rules and where a beam lands, no page ----
  const { Player, RULES: R, judge, follow, sensorAt, covered } = await import(pathToFileURL(path.resolve('src/tag/rules.js')));
  { const p = new Player(), ev = []; p.on = (e) => ev.push(e); ok(!p.hit() && p.lives === 0, 'no hit lands before the game starts');
    p.start(); ok(p.lives === 10 && R.LIVES === 10 && R.RATE === 1000, 'ten lives, one shot a second');
    ok(p.pull(5000) && !p.pull(5900) && p.pull(6000), 'the pistol fires once a second'); ok(p.charge(6500) === 0.5, 'the pistol shows its recharge');
    p.hit(); ok(p.lives === 9 && ev.includes('hit'), 'a hit on the sensor costs a life');
    for (let i = 0; i < 9; i++) p.hit(); ok(p.lives === 0 && p.phase === 'o' && ev.includes('out') && !p.pull(99999) && !p.hit(), 'the last life: out, the pistol is dead'); }
  { const head = [0, 1.6, 0], s = sensorAt(head, 0), from = [0, 1.3, -3], to = (a, b) => { const d = [b[0] - a[0], b[1] - a[1], b[2] - a[2]], l = Math.hypot(...d); return d.map(v => v / l); };
    const body = { head, yaw: 0, hands: [[0.4, 1.0, 0]] };
    ok(judge(from, to(from, s), body).k === 'sensor', 'a beam from the front reaches the sensor');
    ok(judge(from, to(from, [s[0] + 0.12, s[1] + 0.09, s[2]]), body).k === 'sensor' && judge(from, to(from, [s[0] + 0.16, s[1], s[2]]), body).k !== 'sensor' && judge(from, to(from, [s[0], s[1] - 0.14, s[2]]), body).k === 'body', 'the sensor is 26 cm by 20 cm: past its edge is no hit');
    ok(judge([0, 1.3, 3], to([0, 1.3, 3], s), body).k === 'body', 'from behind the beam lands on the back');
    ok(judge(from, to(from, s), { head, yaw: Math.PI, hands: [] }).k === 'body', 'turned away: the back, no hit');
    ok(judge([3, 1.3, 0], to([3, 1.3, 0], s), body).k !== 'sensor', 'from the side the sensor cannot be reached');
    ok(judge(from, to(from, s), { head, yaw: 0, hands: [[s[0], s[1], s[2] - 0.12]] }).k === 'hand', 'a hand held over the sensor stops the beam');
    ok(judge(from, to(from, s), { head, yaw: 0, hands: [[0.3, s[1], s[2] - 0.12]] }).k === 'sensor', 'a hand held to the side does not');
    ok(judge(from, to(from, s), { head: [0, 1.0, 0], yaw: 0, hands: [] }).k !== 'sensor', 'ducked: a beam at where the sensor was does not hit it');
    ok(judge(from, to(from, s), { head: [0.5, 1.6, 0], yaw: 0, hands: [] }).k === '', 'stepped aside: the beam passes');
    ok(covered(head, 0, [[s[0], s[1], s[2] - 0.12]]) && !covered(head, 0, [[0.4, 1.0, 0]]), 'the panel knows when a hand is over it');
    ok(Math.abs(follow(0, 0.4, 0.016)) < 0.02 && Math.abs(follow(0, Math.PI, 0.016)) > 2.5, 'a glance to the side leaves the chest where it is, turning round turns it'); }
  { const { TAG } = await import(pathToFileURL(path.resolve('worker/tag.js')));
    ok(TAG.clean({ t: 'fire', k: 'sensor', d: 3.2, sid: 4 }).k === 'sensor' && TAG.clean({ t: 'fire', k: 'heart' }).k === '' && TAG.clean({ t: 'cheat' }) === null && TAG.clean({ t: 'pose', p: [1] }) === null && TAG.clean({ t: 'st', ph: 'n', l: 99 }).l === 10 && TAG.slot([0]) === 1,
      'the room passes shots, poses and states, drops the rest, and gives the second player BLUE'); }

  // ---- two linked pages: ORANGE and BLUE ----
  await new Promise(res => srv.listen(0, '127.0.0.1', res)); const URL = 'http://127.0.0.1:' + srv.address().port + '/' + path.basename(PAGE);
  const b = await chromium.launch({ ...(process.env.PWCHROME ? { executablePath: process.env.PWCHROME } : {}), args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const errs = [], watch = pg => { pg.on('pageerror', e => errs.push(e.message.slice(0, 300))); pg.on('console', m => { if (m.type() === 'error' && !/WebSocket|parties/.test(m.text())) errs.push('console: ' + m.text().slice(0, 300)); }); };
  const ctx = await b.newContext({ viewport: { width: 640, height: 400 }, deviceScaleFactor: 2 });
  const A = await ctx.newPage(), B = await ctx.newPage(); watch(A); watch(B);
  await A.goto(URL + '?sim&local&slot=0'); await A.waitForFunction(() => !!window.__tag, null, { timeout: 120000 });
  await B.goto(URL + '?sim&local&slot=1'); await B.waitForFunction(() => !!window.__tag, null, { timeout: 120000 });
  const tick = async (ms = 300) => { await A.bringToFront(); await A.waitForTimeout(ms / 2); await B.bringToFront(); await B.waitForTimeout(ms / 2); };
  const until = async (f, n = 80) => { for (let i = 0; i < n; i++) { if (await f()) return true; await tick(); } return false; };
  ok(await until(async () => (await A.evaluate(() => !!__tag.foe)) && (await B.evaluate(() => !!__tag.foe))), 'two pages in the room see each other');
  // ORANGE at +z facing BLUE at -z; both touch the same two spots
  const HA = [0, 1.6, 2], GA = [0.25, 1.3, 1.75], HB = [0, 1.6, -2], GB = [-0.3, 1.0, -1.8];
  await A.evaluate(([h, g]) => { __tag.pose(h, 0, g, [0.3, 0, 1]); __tag.cal([-1, 0, 0], [1, 0, 0]); }, [HA, GA]);
  await B.evaluate(([h, g]) => { __tag.pose(h, Math.PI, g, [-0.3, 0, -1]); __tag.cal([1, 0, 0], [-1, 0, 0]); }, [HB, GB]);
  ok(await until(() => A.evaluate(() => __tag.foeSeen)), 'once both have lined up, ORANGE sees BLUE\'s sensor and pistol');
  await A.evaluate(() => __tag.pull()); await tick(); await B.evaluate(() => __tag.pull());
  ok(await until(() => B.evaluate(() => __tag.stage === 'play'), 60) && await until(() => A.evaluate(() => __tag.stage === 'play'), 20), 'both pull the trigger, the count runs, the game starts');
  ok((await B.evaluate(() => __tag.me.lives)) === 10 && (await A.evaluate(() => __tag.foe.view.l)) === 10, 'both start with 10 lives');
  await tick(1600);
  const lives = () => B.evaluate(() => __tag.me.lives), stat = (k) => A.evaluate(k => __tag.stats[k], k);
  const shoot = async (at) => { const s = at || await A.evaluate(() => __tag.sensor()); await A.evaluate(([h, g, s]) => __tag.pose(h, 0, g, s), [HA, GA, s]); await tick(250); await A.evaluate(() => __tag.pull()); await tick(900); return s; };
  const s0 = await shoot();
  ok(await until(async () => (await lives()) === 9, 20) && (await stat('good')) === 1, 'ORANGE hits BLUE\'s sensor: BLUE loses a life');
  if (OUT) { await A.bringToFront(); await A.evaluate(([h, g]) => __tag.pose(h, 0, g, [0, 1.3, -2]), [HA, GA]); await tick(400); await A.screenshot({ path: path.join(OUT, '01-blue-sensor.png') }); }
  // BLUE puts the other hand over the sensor
  await B.evaluate(([h, g]) => __tag.pose(h, Math.PI, g, [-0.3, 0, -1], [0, 1.26, -1.8]), [HB, GB]); await tick(1200);
  await shoot(); ok((await lives()) === 9 && (await stat('blocked')) === 1, 'a hand over the sensor: the beam is blocked, no life lost');
  ok(await A.evaluate(() => __tag.foePanel.faint), 'the covered panel is drawn faint so the real hand shows');
  if (OUT) { await A.bringToFront(); await A.screenshot({ path: path.join(OUT, '02-blue-covered.png') }); }
  // BLUE turns round
  await B.evaluate(([h, g]) => __tag.pose(h, 0, g, [-0.3, 0, -3]), [HB, [-0.3, 1.0, -2.2]]); await tick(2500);
  const b0 = await stat('body'); await shoot(s0); ok((await lives()) === 9 && (await stat('body')) === b0 + 1, 'turned away: the beam lands on the back, no life lost');
  // BLUE faces again and ducks: a beam at where the sensor was passes over
  await B.evaluate(([h, g]) => __tag.pose(h, Math.PI, g, [-0.3, 0, -1]), [HB, GB]); await tick(2500);
  const s1 = await A.evaluate(() => __tag.sensor());
  await B.evaluate(([g]) => __tag.pose([0, 0.95, -2], Math.PI, g, [-0.3, 0, -1]), [[-0.3, 0.5, -1.8]]); await tick(1200);
  const g0 = await stat('good'); await shoot(s1); ok((await lives()) === 9 && (await stat('good')) === g0, 'ducked: the beam aimed at where the sensor was takes no life');
  // the last life
  await B.evaluate(([h, g]) => { __tag.pose(h, Math.PI, g, [-0.3, 0, -1]); __tag.me.lives = 1; }, [HB, GB]); await tick(1500);
  await shoot();
  ok(await until(async () => (await B.evaluate(() => __tag.stage)) === 'over' && (await A.evaluate(() => __tag.stage)) === 'over', 40), 'the last life: game over on both');
  ok((await A.evaluate(() => __tag.me.lives)) === 10 && (await B.evaluate(() => __tag.me.view().ph)) === 'o', 'ORANGE wins untouched, BLUE is out');
  ok(errs.length === 0, 'no page errors' + (errs.length ? ': ' + errs.slice(0, 3).join(' | ') : ''));
  await ctx.close();

  // ---- an emulated Quest 3: enter, line up on two spots, the pistol in hand, the trigger fires ----
  { const pg = await b.newPage({ viewport: { width: 640, height: 400 } }), e2 = []; pg.on('pageerror', e => e2.push(e.message.slice(0, 300)));
    await pg.addInitScript(IWER + ';window.xrDevice=new IWER.XRDevice(IWER.metaQuest3);xrDevice.installRuntime({forceInstall:true});xrDevice.position.set(0,1.6,1.5);');
    await pg.goto(URL + '?local&slot=0'); await pg.waitForFunction(() => !document.getElementById('enter').disabled, null, { timeout: 120000 }).catch(() => {});
    await pg.click('#enter');
    ok(await pg.waitForFunction(() => __tag.renderer.xr.isPresenting && __tag.stage === 'calA', null, { timeout: 60000 }).then(() => true, () => false), 'ENTER starts the passthrough session and asks for spot 1');
    const press = async () => { await pg.evaluate(() => xrDevice.controllers.right.updateButtonValue('trigger', 1)); await pg.waitForTimeout(250); await pg.evaluate(() => xrDevice.controllers.right.updateButtonValue('trigger', 0)); await pg.waitForTimeout(250); };
    await pg.evaluate(() => xrDevice.controllers.right.position.set(-1, 0.6, 0.6)); await pg.waitForTimeout(300); await press();
    await pg.evaluate(() => xrDevice.controllers.right.position.set(1, 0.6, 0.6)); await pg.waitForTimeout(300); await press();
    ok(await pg.waitForFunction(() => __tag.stage === 'idle' && __tag.myGun.group.visible && __tag.myPanel.group.visible, null, { timeout: 30000 }).then(() => true, () => false), 'two spots touched: lined up, the pistol is in the hand and the sensor is on the chest');
    const f0 = await pg.evaluate(() => __tag.stats.fired); await pg.waitForTimeout(1100); await press();
    ok((await pg.evaluate(() => __tag.stats.fired)) === f0 + 1, 'the trigger fires the pistol, waiting for player 2');
    await pg.evaluate(() => xrDevice.controllers.left.position.set(0, 1.26, 1.35)); await pg.waitForTimeout(600);
    ok(await pg.evaluate(() => __tag.myPanel.faint), 'the left controller held over your chest covers your sensor');
    ok(e2.length === 0, 'no page errors in the headset' + (e2.length ? ': ' + e2.join(' | ') : ''));
    await pg.close(); }

  await b.close(); srv.close(); console.log(fails.length ? fails.length + ' FAILED' : 'the sensor tag check passed'); process.exit(fails.length ? 1 : 0);
})();
