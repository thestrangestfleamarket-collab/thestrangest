// THE CATACOMB RUN CHECK: node tests/catrun.cjs dist/market.html. The run starts you standing at the line, seen from behind, with the controls
// shown; 3, 2, 1, GO; the first three obstacles teach (a log to jump, a branch to duck, a rock to dodge) and forgive a miss. On the keyboard the
// arrows clear each one; in an emulated Quest 3 the run is seen from behind with turning held, its words are on the headset's card, and the
// stick (left/right lanes, up jumps, down ducks), A (jumps) and the left trigger (rolls) all work.
const { chromium } = require('playwright'), path = require('path'), fs = require('fs');
const fails = [], ok = (c, m) => { if (!c) { fails.push(m); console.log((process.env.GITHUB_ACTIONS ? '::error title=catrun::' : 'FAIL ') + m); } else console.log('ok   ' + m); };
(async () => {
  const b = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const pg = await b.newPage({ viewport: { width: 800, height: 500 } }), errs = [];
  pg.on('pageerror', e => errs.push(e.message.slice(0, 300)));
  await pg.addInitScript(fs.readFileSync(require.resolve('iwer/build/iwer.js'), 'utf8') + ';window.__xrd=new IWER.XRDevice(IWER.metaQuest3);window.__xrd.installRuntime({forceInstall:true});');
  await pg.goto('file://' + path.resolve(process.argv[2] || 'dist/market.html') + '?fresh=1&hour=13&res=1', { waitUntil: 'commit' });
  await pg.waitForFunction(() => window.__started, null, { timeout: 300000 });
  const wait = (f, a, t = 180000) => pg.waitForFunction(f, a, { timeout: t, polling: 200 });
  const until = (f, ms) => wait(f, null, ms).then(() => true, () => false);
  await pg.waitForTimeout(12000); await wait(() => !FADE.busy).catch(() => {});
  for (let k = 0; k < 4; k++) { await pg.evaluate(() => { if (!ARCDBG().built && !FADE.busy) ROOMS.enter('arcade'); }); if (await until(() => ARCDBG().built && !FADE.busy, 60000)) break; }
  const start = () => pg.evaluate(() => { const P = __dbg.UI.things.find(t => t.name === 'THE HOLODECK PANEL'); if (P) P.act(); document.getElementById('holog').dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true })); INV.cash = 50; const H = STORE.holo; H.start(H.programs.find(p => p.name === 'THE CATACOMB RUN')); });
  const toasts = () => pg.evaluate(() => [...document.querySelectorAll('div')].filter(d => d.children.length === 0 && /CHANGE LANE|JUMP:|DUCK:/.test(d.textContent)).map(d => d.textContent).filter((t, i, a) => a.indexOf(t) === i));

  // the keyboard
  await start();
  ok(await until(() => CATDBG().ready && !FADE.busy, 90000), 'the run fades you to the jungle track');
  const s0 = await pg.evaluate(() => ({ ...CATDBG(), view: __dbg.UI.view }));
  await pg.waitForTimeout(1500);
  const s1 = await pg.evaluate(() => CATDBG()), t0 = await toasts();
  ok(s0.view === 'follow' && !s1.go && s1.dist === s0.dist && t0.length === 3, 'you start standing at the line, seen from behind, the three controls shown: ' + JSON.stringify({ view: s0.view, go: s1.go, d0: s0.dist, d1: s1.dist, t0 }));
  const l0 = s1.lane; await pg.keyboard.press('ArrowLeft'); await pg.waitForTimeout(300); const l1 = (await pg.evaluate(() => CATDBG())).lane;
  await pg.keyboard.press('d'); await pg.waitForTimeout(300); const l2 = (await pg.evaluate(() => CATDBG())).lane;
  ok(l1 === l0 - 1 && l2 === l0, 'at the line the left arrow and D change lane (try the controls before GO): ' + [l0, l1, l2]);
  ok(await until(() => CATDBG().go, 20000), '3, 2, 1, GO: the run starts by itself');
  // the autopilot: the arrows, as a player would, a moment before each obstacle
  await pg.evaluate(() => { let last = null, held = false; const K = (t, key) => dispatchEvent(new KeyboardEvent(t, { key, bubbles: true }));
    window.__pilot = setInterval(() => { const d = CATDBG(), n = CATNEXT(); if (!d.go || d.dead) return;
      if (held && (!n || n.kind !== 'duck' || n.dz > 3)) { K('keyup', 'ArrowDown'); held = false; }
      if (!n) return; if (n.kind === 'dodge' && d.lane === n.lane && n.dz < 5) K('keydown', d.lane === 2 ? 'ArrowLeft' : 'ArrowRight');
      if (n.kind === 'jump' && n.dz < 1.6 && last !== n) { last = n.dz; K('keydown', 'ArrowUp'); K('keyup', 'ArrowUp'); }
      if (n.kind === 'duck' && n.dz < 2.4 && !held) { held = true; K('keydown', 'ArrowDown'); } }, 30); });
  ok(await until(() => CATDBG().log.length >= 3 || CATDBG().dead, 120000), 'you reach the three teaching obstacles');
  const s2 = await pg.evaluate(() => ({ ...CATDBG(), said: [...document.querySelectorAll('div')].some(d => /NOW RUN/.test(d.textContent)) }));
  ok(s2.log.slice(0, 3).join() === 'jump,duck,dodge' && !s2.dead, 'up jumps the log, holding down ducks the branch, a lane change dodges the rock: ' + JSON.stringify(s2.log));
  ok(s2.said, 'after the three, NOW RUN AS FAR AS YOU CAN');
  await pg.evaluate(() => { clearInterval(__pilot); STORE.holo.end(); });
  ok(await until(() => !STORE.holo.run && ROOMS.offIn && ROOMS.offIn() === 'arcade' && !FADE.busy, 60000), 'END PROGRAM fades you back to the holodeck');
  // a miss on a teaching obstacle is forgiven
  await start(); await until(() => CATDBG().go, 90000);
  ok(await until(() => CATDBG().log.length >= 1, 90000) && await pg.evaluate(() => CATDBG().log[0] === 'jump!' && !CATDBG().dead), 'missing the first log is forgiven (you keep running): ' + JSON.stringify(await pg.evaluate(() => CATDBG().log)));
  await pg.evaluate(() => STORE.holo.end()); await until(() => !STORE.holo.run && ROOMS.offIn() === 'arcade' && !FADE.busy, 60000);

  // the headset
  await pg.evaluate(() => VR.set('scale', .5, true));
  await pg.click('#vrbtn', { noWaitAfter: true, timeout: 120000 });
  ok(await until(() => VR.on && VR.cal, 60000), 'the headset starts');
  const frames = n => pg.evaluate(n => new Promise(r => { const d = VR.draw; let k = 0; VR.draw = h => { d(h); if (++k >= n) { VR.draw = d; r(k); } }; }), n);
  const C = (f, a) => pg.evaluate(f, a), ax = (h, x, y) => C(([h, x, y]) => __xrd.controllers[h].updateAxes('thumbstick', x, y), [h, x, y]), btn = (h, k, v) => C(([h, k, v]) => __xrd.controllers[h].updateButtonValue(k, v), [h, k, v]);
  const v0 = await C(() => VR.state());
  await start();
  ok(await until(() => CATDBG().ready && !FADE.busy && VR.cal, 120000), 'in the headset the run takes you to the track (the fade is not undone by your head)');
  await frames(2);
  const v1 = await C(() => ({ ...VR.state(), off: ROOMS.offIn(), d: CATDBG() }));
  ok(v0.vrview === 'first' && v1.vrview === 'behind' && !v1.turns && v1.off === 'catrun' && v1.d.on, 'the run is seen from behind the runner, turning held: ' + JSON.stringify({ was: v0.vrview, now: v1.vrview, turns: v1.turns, off: v1.off }));
  ok(v1.notes.some(t => /CHANGE LANE: STICK/.test(t)) && v1.notes.some(t => /JUMP: A OR STICK UP/.test(t)) && v1.notes.some(t => /DUCK: HOLD STICK DOWN/.test(t)), 'the controls are on the headset\'s card, in the controllers\' words: ' + JSON.stringify(v1.notes));
  const y0 = await C(() => VR.yaw); await ax('right', 1, 0); await frames(3); await ax('right', 0, 0); await frames(2);
  ok(Math.abs(await C(() => VR.yaw) - y0) < 1e-6, 'the right stick does not turn you off the track');
  const L = await C(() => CATDBG().lane); await ax('left', -1, 0); await frames(3); await ax('left', 0, 0); await frames(3); const La = await C(() => CATDBG().lane);
  await ax('left', 1, 0); await frames(3); await ax('left', 0, 0); await frames(3); const Lb = await C(() => CATDBG().lane);
  ok(La === L - 1 && Lb === L, 'the stick left and right change lane: ' + [L, La, Lb]);
  const mv = async (f, n = 3) => { await f(1); await frames(n); const m = await C(() => CATDBG().mv); await f(0); await frames(12); return m; };
  const mA = await mv(v => btn('right', 'a-button', v)), mU = await mv(v => ax('left', 0, -v)), mD = await mv(v => ax('left', 0, v)), mT = await mv(v => btn('left', 'trigger', v));
  ok(/jump/i.test(mA) && /jump/i.test(mU) && /crouch|duck|slide/.test(mD) && /roll/.test(mT), 'A jumps, the stick up jumps, the stick down ducks, the left trigger rolls: ' + JSON.stringify({ mA, mU, mD, mT }));
  ok(await until(() => CATDBG().go, 240000), 'GO comes in the headset too');
  const n1 = await C(() => VR.state().notes); const d1 = await C(() => CATDBG().dist); await frames(6);
  ok(await C(d => CATDBG().dist > d, d1), 'and you run: ' + JSON.stringify(n1));
  await C(() => STORE.holo.end());
  ok(await until(() => !STORE.holo.run && ROOMS.offIn() === 'arcade' && !FADE.busy, 120000), 'END PROGRAM takes you back in the headset');
  await frames(2);
  const v2 = await C(() => VR.state());
  ok(v2.vrview === 'first' && v2.turns, 'back in the holodeck the headset is as it was (your own view, turning): ' + JSON.stringify({ view: v2.vrview, turns: v2.turns }));
  ok(!errs.length, 'no page errors ' + errs.join(' | '));
  await b.close(); console.log(fails.length ? fails.length + ' FAILED' : 'all good'); process.exit(fails.length ? 1 : 0);
})().catch(e => { console.log('FAIL ' + e.message); process.exit(1); });
