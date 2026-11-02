// THE ROAM HEADSET CHECK: node tests/roam-vr.cjs dist/market.html [folder for screenshots]. An emulated Quest 3 (IWER): ROAM started on screen, then ENTER VR seats you in the
// cockpit (the headset's dolly is the ship's seat, the Walker hidden, nothing turns you but the ship), the right stick pitches the ship, the left stick opens the throttle,
// the right trigger fires, the sticks never walk or snap-turn, and holding Y ends the program.
const { chromium } = require('playwright'), path = require('path'), fs = require('fs');
const fails = [], ok = (c, m) => { if (!c) { fails.push(m); console.log((process.env.GITHUB_ACTIONS ? '::error title=roam-vr::' : 'FAIL ') + m); } else console.log('ok   ' + m); };
(async () => {
  const b = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const pg = await b.newPage({ viewport: { width: 960, height: 600 } }), errs = [];
  pg.on('pageerror', e => errs.push(e.message.slice(0, 300))); pg.on('console', m => { if (/^VR: |^ROAM|^SYS /.test(m.text()) || m.type() === 'error') errs.push(m.text().slice(0, 300)); });
  await pg.addInitScript('{ const R0 = window.requestAnimationFrame.bind(window); window.requestAnimationFrame = f => window.__quest && window.VR && VR.on && !new Error().stack.split("\\n").slice(2, 4).some(l => l.includes("onDeviceFrame")) ? (window.__blocked = (window.__blocked || 0) + 1, -1) : R0(f); }');
  await pg.addInitScript(fs.readFileSync(require.resolve('iwer/build/iwer.js'), 'utf8') + ';window.__xrd=new IWER.XRDevice(IWER.metaQuest3);window.__xrd.installRuntime({forceInstall:true});');
  await pg.goto('file://' + path.resolve(process.argv[2] || 'dist/market.html') + '?fresh=1&hour=13&res=1', { waitUntil: 'commit' });
  await pg.waitForFunction(() => window.__started, null, { timeout: 300000 });
  const wait = (f, a, t = 180000) => pg.waitForFunction(f, a, { timeout: t, polling: 200 });
  const frames = n => pg.evaluate(n => new Promise(r => { const d = VR.draw; let k = 0; VR.draw = h => { d(h); if (++k >= n) { VR.draw = d; r(k); } }; }), n);
  const OUT = process.argv[3]; let nShot = 0; if (OUT) fs.mkdirSync(OUT, { recursive: true });
  const shot = async name => { if (!OUT) return; if (await pg.evaluate(() => VR.on)) await frames(2); const f = path.join(OUT, String(++nShot).padStart(2, '0') + '-' + name + '.png'); await pg.screenshot({ path: f, timeout: 180000 }); console.log('shot ' + f); };
  const until = async (f, ms = 30000) => { for (let t = 0; t < ms; t += 250) { if (await pg.evaluate(f).catch(() => false)) return true; await pg.waitForTimeout(250); } return false; };
  await pg.waitForTimeout(12000); await wait(() => !FADE.busy).catch(() => {});
  for (let k = 0; k < 4; k++) { await pg.evaluate(() => { if (!ARCDBG().built && !FADE.busy) ROOMS.enter('arcade'); }); if (await wait(() => ARCDBG().built && !FADE.busy, null, 60000).then(() => 1, () => 0)) break; }
  await pg.evaluate(() => { const H = STORE.holo; H.start(H.programs.find(p => p.name === 'ROAM')); });
  ok(await until(() => ROAMDBG().on && !FADE.busy, 120000), 'ROAM starts on screen');
  await pg.waitForTimeout(1500); await shot('screen-cockpit');
  ok(await pg.isVisible('#vrbtn'), 'ENTER VR shows when a headset is there');
  await pg.evaluate(() => { window.__cv = document.querySelector('#stage canvas'); });
  await pg.click('#vrbtn', { noWaitAfter: true, timeout: 120000 });
  ok(await until(() => VR.on && VR.cal), 'the headset starts');
  await frames(3);
  const s1 = await pg.evaluate(() => { const d = VR.dolly, D = ROAMDBG(); return { on: D.on, drive: !!SHARED.drive, body: VR.state().body, view: VR.state().view, dolly: [d.position.x, d.position.y, d.position.z], scale: d.scale.x, dist: Math.hypot(d.position.x - D.cam[0], d.position.y - D.cam[1], d.position.z - D.cam[2]), far: VR.cam.far }; });
  ok(s1.on && s1.drive && !s1.body && s1.view === 'first' && s1.dist < 3 && s1.far > 5000 && Math.abs(s1.scale - 1.345) < .05, 'in the headset you sit in the cockpit: the dolly at the seat (scaled to metres), the Walker hidden, the far plane out past the rocks: ' + JSON.stringify(s1));
  await shot('headset-cockpit');
  const pic = await pg.evaluate(() => new Promise(res => { const d = VR.draw; VR.draw = h => { d(h); VR.draw = d; const gl = __cv.getContext('webgl2'), w = gl.drawingBufferWidth, hh = gl.drawingBufferHeight, n = 24, px = new Uint8Array(4), seen = new Set(); let lit = 0;
    for (let i = 0; i < n; i++)for (let j = 0; j < n; j++){ gl.readPixels(Math.floor((i + .5) * w / n), Math.floor((j + .5) * hh / n), 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, px); if (px[0] + px[1] + px[2] > 30) lit++; seen.add(px[0] >> 4 << 8 | px[1] >> 4 << 4 | px[2] >> 4); }
    res({ lit: lit / (n * n), colours: seen.size }); }; }));
  ok(pic.lit > .25 && pic.colours > 8, 'the headset draws the cockpit, not black (' + JSON.stringify(pic) + ')');
  const p0 = await pg.evaluate(() => ({ up: ROAMDBG().up, fwd: ROAMDBG().fwd, you: __dbg.you(), yaw: VR.yaw }));
  await pg.evaluate(() => __xrd.controllers.right.updateAxes('thumbstick', 0, -1)); await frames(30); await pg.evaluate(() => __xrd.controllers.right.updateAxes('thumbstick', 0, 0)); await frames(2);
  const p1 = await pg.evaluate(() => ({ up: ROAMDBG().up, fwd: ROAMDBG().fwd, you: __dbg.you(), yaw: VR.yaw }));
  ok(Math.abs(p1.fwd[1] - p0.fwd[1]) > .2 && p1.yaw === p0.yaw && p1.you.x === p0.you.x && p1.you.z === p0.you.z, 'the right stick pitches the ship (the nose moved ' + (p1.fwd[1] - p0.fwd[1]).toFixed(2) + ' up or down), never snap-turning or walking the Walker');
  await pg.evaluate(() => __xrd.controllers.left.updateAxes('thumbstick', 0, -1)); await frames(30); await pg.evaluate(() => __xrd.controllers.left.updateAxes('thumbstick', 0, 0));
  const t1 = await pg.evaluate(() => ROAMDBG());
  ok(t1.thr > .5 && t1.speed > 20, 'the left stick opens the throttle (' + t1.thr + ', ' + t1.speed + ' m/s)');
  await shot('headset-flying');
  await pg.evaluate(() => { ROAM.aim(); __xrd.controllers.right.updateButtonValue('trigger', 1); }); await frames(12); await pg.evaluate(() => __xrd.controllers.right.updateButtonValue('trigger', 0));
  const f1 = await pg.evaluate(() => ROAMDBG());
  ok(f1.heat > 0 || f1.rocks > 0, 'the right trigger fires the lasers (heat ' + f1.heat + ', rocks ' + f1.rocks + ')');
  await shot('headset-firing');
  await pg.evaluate(() => __xrd.controllers.left.updateButtonValue('y-button', 1)); await until(() => !ARCDBG().holo.run, 60000); await pg.evaluate(() => __xrd.controllers.left.updateButtonValue('y-button', 0));
  const e1 = await pg.evaluate(() => ({ on: ROAMDBG().on, run: ARCDBG().holo.run, vr: VR.on }));
  ok(!e1.on && !e1.run, 'holding Y ends the program (' + JSON.stringify(e1) + ')');
  ok(await until(() => ROOMS.offIn && ROOMS.offIn() === 'arcade' && !FADE.busy, 60000), 'you are back in the holodeck');
  const back = await pg.evaluate(() => ({ drive: !!SHARED.drive, body: VR.state().body, vr: VR.on }));
  ok(!back.drive && back.vr, 'the headset stays on, the Walker is yours again: ' + JSON.stringify(back));
  ok(!errs.length, 'no page errors ' + errs.join(' | '));
  await b.close(); console.log(fails.length ? fails.length + ' FAILED' : 'all good'); process.exit(fails.length ? 1 : 0);
})().catch(e => { console.log('FAIL ' + e.message); process.exit(1); });
