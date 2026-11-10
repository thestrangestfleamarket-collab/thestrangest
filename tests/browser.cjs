// THE BROWSER'S EXTRAS CHECK: node tests/browser.cjs dist/market.html. The mouse look (Pointer Lock) in first person, a sound's place in 3D, the screen kept awake.
const { chromium } = require('playwright'), path = require('path');
const fails = [], ok = (c, m) => { if (!c) { fails.push(m); console.log((process.env.GITHUB_ACTIONS ? '::error title=browser::' : 'FAIL ') + m); } else console.log('ok   ' + m); };
(async () => {
  const b = await chromium.launch({ ...(process.env.PWCHROME ? { executablePath: process.env.PWCHROME } : {}), args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--autoplay-policy=no-user-gesture-required'] });
  const pg = await b.newPage({ viewport: { width: 960, height: 600 } }), errs = [];
  pg.on('pageerror', e => errs.push(e.message.slice(0, 300)));
  await pg.goto('file://' + path.resolve(process.argv[2] || 'dist/market.html') + '?fresh=1&hour=13&at=53,10&sound=1', { waitUntil: 'commit' });
  let st = false; for (let i = 0; i < 80 && !st; i++) { await pg.waitForTimeout(3000); st = await pg.evaluate(() => !!window.__started).catch(() => false); }
  ok(st, 'the page starts');
  if (st) {
    const held = () => pg.evaluate(() => !!document.pointerLockElement), until = async (f, ms = 8000) => { for (let t = 0; t < ms; t += 200) { if (await f()) return true; await pg.waitForTimeout(200); } return false; };
    const view = v => pg.evaluate(v => __dbg.ui().setView(v), v);
    await until(() => pg.evaluate(() => { const e = document.elementFromPoint(480, 300); return !!e && e.tagName === 'CANVAS'; }), 60000);
    await view('third'); await pg.mouse.click(480, 300); await pg.waitForTimeout(600);
    ok(!(await held()), 'a click in the third-person view leaves the mouse free');
    await view('first'); await pg.mouse.click(480, 300);
    ok(await until(held), 'a click in first person takes the mouse');
    ok(await pg.evaluate(() => !document.getElementById('mlk').hidden), 'the centre dot shows');
    const y0 = await pg.evaluate(() => [SHARED.yawTo, SHARED.pitchTo]);
    await pg.evaluate(() => document.dispatchEvent(new MouseEvent('mousemove', { movementX: 100, movementY: 40 })));
    const y1 = await pg.evaluate(() => [SHARED.yawTo, SHARED.pitchTo]);
    ok(y1[0] < y0[0] - .1 && y1[1] > y0[1] + .02, 'the mouse turns your head: yaw ' + y0[0].toFixed(2) + ' to ' + y1[0].toFixed(2) + ', pitch ' + y0[1].toFixed(2) + ' to ' + y1[1].toFixed(2));
    await pg.waitForTimeout(500); ok(await pg.evaluate(() => __dbg.ui().locked()), 'clicks aim at the centre while it is held');
    await view('third'); ok(await until(async () => !(await held())), 'leaving first person gives the mouse back');
    ok(await pg.evaluate(() => document.getElementById('mlk').hidden), 'the centre dot hides');
    await view('first'); await pg.mouse.click(480, 300); ok(await until(held), 'taken again');
    await pg.keyboard.press('Escape'); await pg.waitForTimeout(300); if (await held()) await pg.evaluate(() => { const u = __dbg.ui(); if (!u.menuOpen) u.toggleMenu && u.toggleMenu(); });
    await pg.evaluate(() => { const u = __dbg.ui(); if (!u.menuOpen) dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' })); });
    ok(await until(async () => !(await held())), 'the menu gives the mouse back');
    await pg.evaluate(() => { const u = __dbg.ui(); if (u.menuOpen) dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' })); });

    const snd = await pg.evaluate(async () => { const c = new AudioContext(); await c.resume().catch(() => {}); const P = __dbg.SFX.spot(c, true), Q = __dbg.SFX.spot(c); P.to(); Q.to(100, 5, -40); __dbg.ui().setView('first');
      await new Promise(r => setTimeout(r, 600)); const L = c.listener, you = __dbg.you(), cam = SHARED.cam.position;
      const o = { state: c.state, model: [P.panningModel, Q.panningModel], roll: P.rolloffFactor, ear: [L.positionX.value, L.positionY.value, L.positionZ.value], cam: [cam.x, cam.y, cam.z], head: [P.positionX.value, P.positionY.value, P.positionZ.value], far: [Q.positionX.value, Q.positionY.value, Q.positionZ.value], fwd: [L.forwardX.value, L.forwardY.value, L.forwardZ.value] };
      __dbg.face(SHARED.yaw + 1.2); await new Promise(r => setTimeout(r, 600)); o.fwd2 = [L.forwardX.value, L.forwardY.value, L.forwardZ.value];
      __dbg.ui().setView('iso'); await new Promise(r => setTimeout(r, 600)); o.up = [L.upX.value, L.upY.value, L.upZ.value]; o.fy = L.forwardY.value; o.ear2 = [L.positionX.value, L.positionZ.value]; o.you = [you.x, you.z]; P.end(); Q.end(); return o; });
    const near = (a, b, e = .01) => a.every((v, i) => Math.abs(v - b[i]) < e);
    ok(snd.state === 'running', 'the test sound context runs: ' + snd.state);
    ok(snd.model[0] === 'HRTF' && snd.model[1] === 'equalpower' && snd.roll === 0, 'a spot is a panner (HRTF for the long sounds), its loudness left to the sound');
    ok(near(snd.ear, snd.cam, .05), 'in first person the ears are at the eye');
    ok(near(snd.head, snd.ear, 1e-4), 'a sound of your own stays in the middle of your head');
    ok(near(snd.far, [100, 5, -40]), 'a placed sound is where it was put');
    ok(Math.hypot(snd.fwd[0] - snd.fwd2[0], snd.fwd[2] - snd.fwd2[2]) > .5, 'the ears turn with the view');
    ok(near(snd.up, [0, 1, 0]) && Math.abs(snd.fy) < 1e-3 && near(snd.ear2, snd.you, .5), 'in the overhead view the ears are level, on your head');
    const fx = await pg.evaluate(() => { const r = __dbg.SFX.play('thud', { at: { x: __dbg.you().x + 20, z: __dbg.you().z } }); return r ? { p: !!(r.P && r.P.positionX), x: r.P && r.P.positionX.value - __dbg.you().x } : null; });
    if (fx) ok(fx.p && Math.abs(fx.x - 20) < .01, 'a sound effect with a place goes through the same panner'); else console.log('skip the sound effects did not play here (no running sound context)');

    await pg.context().newCDPSession(pg).then(c => c.send('Browser.grantPermissions', { permissions: ['wakeLockScreen'] })).catch(() => {});   // the headless browser says no unless told
    const wl = await pg.evaluate(() => navigator.wakeLock ? navigator.wakeLock.request('screen').then(l => l.release().then(() => true), () => false) : false); await pg.mouse.click(480, 300);
    if (wl) ok(await until(async () => { await pg.keyboard.press('Shift'); return pg.evaluate(() => SHARED.awake()); }, 10000), 'the screen is kept awake after you act'); else console.log('skip this browser gives no Screen Wake Lock');
  }
  ok(!errs.length, 'no page errors' + (errs.length ? ': ' + errs.join(' | ') : ''));
  await b.close(); console.log(fails.length ? fails.length + ' FAILED' : 'all passed'); process.exit(fails.length ? 1 : 0);
})();
