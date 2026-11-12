// BOARDED UP's HEADSET CHECK: node tests/boarded-vr.cjs dist/market.html [folder for screenshots]. An emulated Quest 3 (IWER): in the headset in the arcade, BOARDED UP started from the
// holodeck draws its own menu in the headset; A starts a solo game and stands you in the hall (the dolly at your place, in metres); the left stick walks you, the right trigger
// fires from the right controller, the dead come; leaving ends the program and gives the headset the arcade back.
const { chromium } = require('playwright'), path = require('path'), fs = require('fs');
const fails = [], ok = (c, m) => { if (!c) { fails.push(m); console.log((process.env.GITHUB_ACTIONS ? '::error title=boarded-vr::' : 'FAIL ') + m); } else console.log('ok   ' + m); };
(async () => {
  const b = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const pg = await b.newPage({ viewport: { width: 960, height: 600 } }), errs = [];
  pg.on('pageerror', e => errs.push(e.message.slice(0, 300))); pg.on('console', m => { if (/^VR: |^BOARDED|^SYS |not loaded before use/.test(m.text())) errs.push(m.text().slice(0, 300)); });
  await pg.addInitScript('{ const R0 = window.requestAnimationFrame.bind(window); window.requestAnimationFrame = f => window.__quest && window.VR && VR.on && !new Error().stack.split("\\n").slice(2, 4).some(l => l.includes("onDeviceFrame")) ? (window.__blocked = (window.__blocked || 0) + 1, -1) : R0(f); }');
  await pg.addInitScript(fs.readFileSync(require.resolve('iwer/build/iwer.js'), 'utf8') + ';window.__xrd=new IWER.XRDevice(IWER.metaQuest3);window.__xrd.installRuntime({forceInstall:true});');
  await pg.goto('file://' + path.resolve(process.argv[2] || 'dist/market.html') + '?fresh=1&hour=13&res=1&buq=low', { waitUntil: 'commit' });
  await pg.waitForFunction(() => window.__started, null, { timeout: 400000 });
  const wait = (f, a, t = 180000) => pg.waitForFunction(f, a, { timeout: t, polling: 200 });
  const frames = n => pg.evaluate(n => new Promise(r => { const d = VR.draw; let k = 0; VR.draw = h => { d(h); if (++k >= n) { VR.draw = d; r(k); } }; }), n);
  const OUT = process.argv[3]; let nShot = 0; if (OUT) fs.mkdirSync(OUT, { recursive: true });
  const shot = async name => { if (!OUT) return; await frames(2); const f = path.join(OUT, String(++nShot).padStart(2, '0') + '-' + name + '.png'); await pg.screenshot({ path: f, timeout: 180000 }); console.log('shot ' + f); };
  const until = async (f, ms = 30000) => { for (let t = 0; t < ms; t += 250) { if (await pg.evaluate(f).catch(() => false)) return true; await pg.waitForTimeout(250); } return false; };
  const press = async (hand, btn, n = 3) => { await pg.evaluate(([h, b]) => __xrd.controllers[h].updateButtonValue(b, 1), [hand, btn]); await frames(n); await pg.evaluate(([h, b]) => __xrd.controllers[h].updateButtonValue(b, 0), [hand, btn]); await frames(2); };
  await pg.waitForTimeout(12000); await wait(() => !FADE.busy).catch(() => {});
  for (let k = 0; k < 4; k++) { await pg.evaluate(() => { if (!ARCDBG().built && !FADE.busy) ROOMS.enter('arcade'); }); if (await wait(() => ARCDBG().built && !FADE.busy, null, 60000).then(() => 1, () => 0)) break; }
  await pg.evaluate(() => { window.__cv = document.querySelector('#stage canvas'); });
  await pg.click('#vrbtn', { noWaitAfter: true, timeout: 120000 });
  ok(await until(() => VR.on && VR.cal), 'the headset starts in the arcade');
  await pg.evaluate(() => { const H = STORE.holo; H.start(H.programs.find(p => p.name === 'BOARDED UP')); });
  ok(await until(() => BOARDEDDBG().ready && BOARDED.api.VRS.on, 300000), 'BOARDED UP, started in the headset, comes up in the headset');
  await frames(4);
  const s0 = await pg.evaluate(() => ({ scene: SHARED.drive && SHARED.drive.scene === BOARDED.api.scene, state: BOARDED.api.G.state, hud: BOARDED.api.VRS.hud.visible && /SOLO/.test(BOARDED.api.VRS.sig), flat: getComputedStyle(document.getElementById('boarded')).display }));
  ok(s0.scene && s0.state === 'menu' && s0.hud && s0.flat === 'none', 'the headset is handed the game\'s scene; its menu is a card in front of you, the flat screen put away: ' + JSON.stringify(s0));
  await shot('headset-menu');
  await press('right', 'a-button');
  ok(await until(() => BOARDED.api.G.state === 'play'), 'A starts a solo game');
  await frames(6);
  const s1 = await pg.evaluate(() => { const A = BOARDED.api, p = A.players[0], d = VR.dolly; return { n: A.players.length, dolly: [d.position.x, d.position.y, d.position.z].map(v => +v.toFixed(2)), scale: d.scale.x, at: [p.pos.x, p.pos.z].map(v => +v.toFixed(2)), dist: +Math.hypot(d.position.x - p.pos.x, d.position.z - p.pos.z).toFixed(2), body: p.J.root.visible, gun: A.VRS.guns.pistol.visible }; });
  ok(s1.n === 1 && s1.scale === 1 && s1.dist < 1 && !s1.body && s1.gun, 'you stand in the hall: the dolly at your place, in metres, your own body not drawn, the pistol at your hand: ' + JSON.stringify(s1));
  const pic = await pg.evaluate(() => new Promise(res => { const d = VR.draw; VR.draw = h => { d(h); VR.draw = d; const gl = __cv.getContext('webgl2'), w = gl.drawingBufferWidth, hh = gl.drawingBufferHeight, n = 24, px = new Uint8Array(4), seen = new Set(); let lit = 0;
    for (let i = 0; i < n; i++)for (let j = 0; j < n; j++){ gl.readPixels(Math.floor((i + .5) * w / n), Math.floor((j + .5) * hh / n), 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, px); if (px[0] + px[1] + px[2] > 30) lit++; seen.add(px[0] >> 4 << 8 | px[1] >> 4 << 4 | px[2] >> 4); }
    res({ lit: +(lit / (n * n)).toFixed(2), colours: seen.size }); }; }));
  ok(pic.lit > .2 && pic.colours > 8, 'the headset draws the mansion, not black: ' + JSON.stringify(pic));
  await shot('headset-hall');
  const p0 = await pg.evaluate(() => { const p = BOARDED.api.players[0]; return { x: p.pos.x, z: p.pos.z, mag: p.w[p.cur].mag }; });
  await pg.evaluate(() => __xrd.controllers.left.updateAxes('thumbstick', 0, -1)); await frames(20); await pg.evaluate(() => __xrd.controllers.left.updateAxes('thumbstick', 0, 0)); await frames(2);
  const p1 = await pg.evaluate(() => { const p = BOARDED.api.players[0]; return { x: p.pos.x, z: p.pos.z }; });
  ok(Math.hypot(p1.x - p0.x, p1.z - p0.z) > .3, 'the left stick walks you (' + Math.hypot(p1.x - p0.x, p1.z - p0.z).toFixed(2) + ' m)');
  await press('right', 'trigger', 3);
  const p2 = await pg.evaluate(() => { const p = BOARDED.api.players[0]; return { mag: p.w[p.cur].mag, aim: BOARDED.api.VRS.ad.toArray().map(v => +v.toFixed(2)) }; });
  ok(p2.mag === p0.mag - 1, 'the right trigger fires along the right controller: ' + JSON.stringify(p2));
  await pg.evaluate(() => { const A = BOARDED.api; A.G.between = .1; for (let i = 0; i < 30 * 30; i++) { A.players[0].hp = 100; A.step(1 / 30); } });
  await frames(4); const s2 = await pg.evaluate(() => ({ round: BOARDED.api.G.round, zombies: BOARDED.api.zombies.length, hud: BOARDED.api.VRS.sig.slice(0, 60) }));
  ok(s2.round === 1 && s2.zombies > 0 && /ROUND 1/.test(s2.hud), 'the round runs and the card shows it: ' + JSON.stringify(s2));
  await pg.evaluate(() => { const A = BOARDED.api, p = A.players[0], z = A.zombies.filter(z => z.state !== 'dead' && z.state !== 'rise').slice(0, 3); p.pos.set(0, 0, 5.6); A.VRS.yaw = 0; z.forEach((q, i) => { q.state = 'chase'; q.pos.set([-1, .6, 1.8][i], 0, [2.6, 3.2, 2.4][i]); q.yaw = 0; }); A.G.state = 'x'; });
  await frames(3); await shot('headset-zombies');
  await pg.evaluate(() => { BOARDED.api.G.state = 'play'; STORE.holo.end(); }); await frames(4);
  const s3 = await pg.evaluate(() => ({ on: BOARDEDDBG().on, drive: !!SHARED.drive, vr: VR.on, vrs: BOARDED.api.VRS.on }));
  ok(!s3.on && !s3.drive && s3.vr && !s3.vrs, 'ending the program gives the headset the arcade back: ' + JSON.stringify(s3));
  await shot('headset-arcade-again');
  ok(!errs.length, 'no page errors ' + errs.join(' | '));
  await b.close(); console.log(fails.length ? fails.length + ' FAILED' : 'all good'); process.exit(fails.length ? 1 : 0);
})().catch(e => { console.log('FAIL ' + e.message); process.exit(1); });
