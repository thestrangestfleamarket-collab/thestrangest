// THE ROAM HEADSET CHECK: node tests/roam-vr.cjs dist/roam.html [folder for screenshots]. An emulated Quest 3 (IWER): ROAM started on screen, then ENTER VR seats you in the
// cockpit (the headset's dolly is the ship's seat, the Walker hidden, nothing turns you but the ship), the right stick pitches the ship, the left stick opens the throttle,
// the right trigger fires, the sticks never walk or snap-turn, and holding Y ends the program.
const { chromium } = require('playwright'), path = require('path'), fs = require('fs');
const fails = [], ok = (c, m) => { if (!c) { fails.push(m); console.log((process.env.GITHUB_ACTIONS ? '::error title=roam-vr::' : 'FAIL ') + m); } else console.log('ok   ' + m); };
(async () => {
  const b = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const pg = await b.newPage({ viewport: { width: 960, height: 600 } }), errs = [];
  pg.on('pageerror', e => errs.push(e.message.slice(0, 300))); pg.on('console', m => { if (/^VR: |^ROAM|^SYS |not loaded before use/.test(m.text())) errs.push(m.text().slice(0, 300)); });
  await pg.addInitScript('{ const R0 = window.requestAnimationFrame.bind(window); window.requestAnimationFrame = f => window.__quest && window.VR && VR.on && !new Error().stack.split("\\n").slice(2, 4).some(l => l.includes("onDeviceFrame")) ? (window.__blocked = (window.__blocked || 0) + 1, -1) : R0(f); }');
  await pg.addInitScript(fs.readFileSync(require.resolve('iwer/build/iwer.js'), 'utf8') + ';window.__xrd=new IWER.XRDevice(IWER.metaQuest3);window.__xrd.installRuntime({forceInstall:true});');
  await pg.goto('file://' + path.resolve(process.argv[2] || 'dist/roam.html') + '?stay=1', { waitUntil: 'commit' });
  const wait = (f, a, t = 180000) => pg.waitForFunction(f, a, { timeout: t, polling: 200 });
  const frames = n => pg.evaluate(n => new Promise(r => { const k = (VR.fn || 0) + n, t = setInterval(() => { if ((VR.fn || 0) >= k) { clearInterval(t); r(k); } }, 20); }), n);
  const OUT = process.argv[3]; let nShot = 0; if (OUT) fs.mkdirSync(OUT, { recursive: true });
  const shot = async name => { if (!OUT) return; if (await pg.evaluate(() => VR.on)) await frames(2); const f = path.join(OUT, String(++nShot).padStart(2, '0') + '-' + name + '.png'); await pg.screenshot({ path: f, timeout: 180000 }); console.log('shot ' + f); };
  const until = async (f, ms = 30000) => { for (let t = 0; t < ms; t += 250) { if (await pg.evaluate(f).catch(() => false)) return true; await pg.waitForTimeout(250); } return false; };
  ok(await until(() => window.ROAMDBG && ROAMDBG().on, 120000), 'ROAM starts on screen, on its own page');
  await pg.waitForTimeout(1500); await shot('screen-cockpit');
  ok(await pg.isVisible('#vrbtn'), 'ENTER VR shows when a headset is there');
  await pg.evaluate(() => { window.__cv = document.querySelector('#stage canvas'); });
  await pg.click('#vrbtn', { noWaitAfter: true, timeout: 120000 });
  ok(await until(() => VR.on && VR.cal), 'the headset starts');
  await frames(3);
  const s1 = await pg.evaluate(() => { const d = VR.dolly, D = ROAMDBG(); return { on: D.on, drive: !!SHARED.drive, market: typeof window.__dbg !== 'undefined', dolly: [d.position.x, d.position.y, d.position.z], scale: d.scale.x, dist: Math.hypot(d.position.x - D.cam[0], d.position.y - D.cam[1], d.position.z - D.cam[2]), far: VR.cam.far }; });
  ok(s1.on && s1.drive && !s1.market && s1.dist < 3 && s1.far > 5000 && Math.abs(s1.scale - 1.345) < .05, 'in the headset you sit in the cockpit: the dolly at the seat (scaled to metres), no market loaded, the far plane out past the rocks: ' + JSON.stringify(s1));
  await shot('headset-cockpit');
  const pic = await pg.evaluate(() => new Promise(res => { VR.after = () => { const gl = __cv.getContext('webgl2'), w = gl.drawingBufferWidth, hh = gl.drawingBufferHeight, n = 24, px = new Uint8Array(4), seen = new Set(); let lit = 0;
    for (let i = 0; i < n; i++)for (let j = 0; j < n; j++){ gl.readPixels(Math.floor((i + .5) * w / n), Math.floor((j + .5) * hh / n), 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, px); if (px[0] + px[1] + px[2] > 30) lit++; seen.add(px[0] >> 4 << 8 | px[1] >> 4 << 4 | px[2] >> 4); }
    res({ lit: lit / (n * n), colours: seen.size }); }; }));
  ok(pic.lit > .25 && pic.colours > 8, 'the headset draws the cockpit, not black (' + JSON.stringify(pic) + ')');
  const p0 = await pg.evaluate(() => ({ up: ROAMDBG().up, fwd: ROAMDBG().fwd }));
  await pg.evaluate(() => __xrd.controllers.right.updateAxes('thumbstick', 0, -1)); await frames(30); await pg.evaluate(() => __xrd.controllers.right.updateAxes('thumbstick', 0, 0)); await frames(2);
  const p1 = await pg.evaluate(() => ({ up: ROAMDBG().up, fwd: ROAMDBG().fwd }));
  ok(Math.abs(p1.fwd[1] - p0.fwd[1]) > .2, 'the right stick pitches the ship (the nose moved ' + (p1.fwd[1] - p0.fwd[1]).toFixed(2) + ' up or down)');
  await pg.evaluate(() => __xrd.controllers.left.updateAxes('thumbstick', 0, -1)); await frames(30); await pg.evaluate(() => __xrd.controllers.left.updateAxes('thumbstick', 0, 0));
  const t1 = await pg.evaluate(() => ROAMDBG());
  ok(t1.thr > .5 && t1.speed > 20, 'the left stick opens the throttle (' + t1.thr + ', ' + t1.speed + ' m/s)');
  await shot('headset-flying');
  await pg.evaluate(() => { ROAM.aim(); __xrd.controllers.right.updateButtonValue('trigger', 1); }); await frames(12); await pg.evaluate(() => __xrd.controllers.right.updateButtonValue('trigger', 0));
  const f1 = await pg.evaluate(() => ROAMDBG());
  ok(f1.heat > 0 || f1.rocks > 0, 'the right trigger fires the lasers (heat ' + f1.heat + ', rocks ' + f1.rocks + ')');
  await shot('headset-firing');
  // hands (or gripping controllers) on the stick, the throttle and the red button: a stand-in pair of hands put where the headset would report them
  const h1 = await pg.evaluate(async () => { const G = ROAM.grips(); ROAM.fake = [{ h: 'right', p: G.stick, pinch: false }, { h: 'left', p: G.thr }]; await new Promise(r => setTimeout(r, 400)); const held = ROAMDBG().hand;
    ROAM.fake = [{ h: 'right', p: [G.stick[0], G.stick[1], G.stick[2] + .06], pinch: true }, { h: 'left', p: [G.thr[0], G.thr[1], G.thr[2] - .3] }]; await new Promise(r => setTimeout(r, 400)); const moved = ROAMDBG();
    ROAM.fake = [{ h: 'right', p: [9, 9, 9] }]; await new Promise(r => setTimeout(r, 300)); const off = ROAMDBG().hand; ROAM.fake = null; return { held, moved: moved.hand, inp: moved.in, thr: moved.thr, boost: moved.boost, off, placard: moved.placard }; });
  ok(h1.held.stick && h1.held.thr && h1.held.pitch === 0 && h1.moved.pitch > .9 && h1.moved.fire === 1 && h1.inp.fire === 1 && h1.thr === 1 && h1.boost && !h1.off.stick && !h1.off.thr, 'a right hand on the stick holds it (pulling back pitches up, a pinch fires), a left hand on the throttle pushes it to full and past the stop into boost, and letting go lets go: ' + JSON.stringify(h1));
  const h2 = await pg.evaluate(async () => { const G = ROAM.grips(); ROAM.fake = [{ h: 'right', p: G.end, tip: G.end }]; await new Promise(r => setTimeout(r, 300)); const pressed = ROAMDBG(); ROAM.fake = null; return { end: pressed.hand.end, inEnd: pressed.in.end }; });
  ok(h2.end === 1 && h2.inEnd === 1, 'a finger on the red button presses it: ' + JSON.stringify(h2));
  await pg.evaluate(() => __xrd.controllers.left.updateButtonValue('y-button', 1)); await until(() => !HOLO.run, 60000); await pg.evaluate(() => __xrd.controllers.left.updateButtonValue('y-button', 0));
  ok(await until(() => !VR.on && HOLO.left, 30000), 'holding Y ends the program: the headset is let go and the page left for the market (' + JSON.stringify(await pg.evaluate(() => ({ on: ROAMDBG().on, run: !!HOLO.run, vr: VR.on, left: !!HOLO.left }))) + ')');
  ok(!errs.length, 'no page errors ' + errs.join(' | '));
  await b.close(); console.log(fails.length ? fails.length + ' FAILED' : 'all good'); process.exit(fails.length ? 1 : 0);
})().catch(e => { console.log('FAIL ' + e.message); process.exit(1); });
