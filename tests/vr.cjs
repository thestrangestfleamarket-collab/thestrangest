// THE HEADSET CHECK: node tests/vr.cjs dist/market.html [folder for screenshots]. An emulated Quest 3 (IWER) with the website's ONLINE box up: ENTER VR shows, the headset sees the street out of the Walker's eyes, the sticks walk and snap-turn, stepping in the room moves him, the menu button opens ESC's wheel on a panel (the stick points and A chooses, or a controller's ray and its trigger), the menu floats on a panel pressed by a controller's trigger or a hand's pinch, the wrist MENU button, and leaving VR.
const { chromium } = require('playwright'), path = require('path'), fs = require('fs');
const fails = [], ok = (c, m) => { if (!c) { fails.push(m); console.log((process.env.GITHUB_ACTIONS ? '::error title=vr::' : 'FAIL ') + m); } else console.log('ok   ' + m); };
(async () => {
  const b = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const pg = await b.newPage({ viewport: { width: 960, height: 600 } }), errs = [], warns = [];
  pg.on('pageerror', e => errs.push(e.message.slice(0, 300)));
  pg.on('console', m => { if (/^VR: /.test(m.text())) warns.push(m.text().slice(0, 300)); });
  // the Quest browser stops the page's own animation frames while in VR: with window.__quest set, only the emulator's device frames (onDeviceFrame) still come
  await pg.addInitScript('{ const R0 = window.requestAnimationFrame.bind(window); window.requestAnimationFrame = f => window.__quest && window.VR && VR.on && !new Error().stack.split("\\n").slice(2, 4).some(l => l.includes("onDeviceFrame")) ? (window.__blocked = (window.__blocked || 0) + 1, -1) : R0(f); }');
  await pg.addInitScript(fs.readFileSync(require.resolve('iwer/build/iwer.js'), 'utf8') + ';window.__xrd=new IWER.XRDevice(IWER.metaQuest3);window.__xrd.installRuntime({forceInstall:true});');
  await pg.goto('file://' + path.resolve(process.argv[2] || 'dist/market.html') + '?fresh=1&hour=13&at=49,10', { waitUntil: 'commit' });
  let st = false; for (let i = 0; i < 60 && !st; i++) { await pg.waitForTimeout(3000); st = await pg.evaluate(() => !!window.__started).catch(() => false); }
  ok(st, 'the page starts');
  if (st) {
    await pg.waitForTimeout(2000);
    await pg.evaluate(() => { ONLINE.send = () => {}; ONLINE.feed({ t: 'hi', you: 'me', all: [] }); });
    ok(await pg.isVisible('#onl'), 'the ONLINE box shows, as on the website');
    ok(await pg.isVisible('#vrbtn'), 'ENTER VR shows when a headset is there');
    const view0 = await pg.evaluate(() => VR.state().view), fov0 = await pg.evaluate(() => VR.state().fov), pitch0 = await pg.evaluate(() => VR.state().pitch);
    const camBack = async () => { const s = await pg.evaluate(() => VR.state()); return Math.abs(s.pitch - pitch0) < 1e-3 ? '' : ' (looking ' + s.pitch.toFixed(2) + ' down, was ' + pitch0.toFixed(2) + ')'; };
    const frames = n => pg.evaluate(n => new Promise(r => { const d = VR.draw; let k = 0; VR.draw = h => { d(h); if (++k >= n) { VR.draw = d; r(k); } }; }), n);
    const drawn = () => pg.evaluate(() => new Promise(r => { const C = SHARED.composer, d = C.render; let n = 0; C.render = function (...a) { n++; return d.apply(this, a); }; setTimeout(() => { C.render = d; r(n); }, 6000); }));
    const OUT = process.argv[3]; let nShot = 0; if (OUT) fs.mkdirSync(OUT, { recursive: true });
    const shot = async name => { if (!OUT) return; if (await pg.evaluate(() => VR.on)) await frames(2); const f = path.join(OUT, String(++nShot).padStart(2, '0') + '-' + name + '.png'); await pg.screenshot({ path: f, timeout: 180000 }); console.log('shot ' + f); };
    const until = async (f, ms = 20000) => { for (let t = 0; t < ms; t += 250) { if (await pg.evaluate(f).catch(() => false)) return true; await pg.waitForTimeout(250); } return false; };
    // the menu button opens ESC's wheel (162ed-hub): the walking stick points at SETTINGS, A opens the menu
    const wheel = async () => { await pg.evaluate(() => __xrd.controllers.left.updateButtonValue('thumbstick', 1)); await frames(2); await pg.evaluate(() => __xrd.controllers.left.updateButtonValue('thumbstick', 0)); await frames(1); return until(() => HUB.on, 8000); };
    const wheelPick = async pic => { await pg.evaluate(() => __xrd.controllers.left.updateAxes('thumbstick', -.95, -.3)); await frames(3); const name = await pg.evaluate(() => HUB.dbg().name); if (pic) { await until(() => VR.state().fresh, 90000); await shot(pic); } await pg.evaluate(() => __xrd.controllers.left.updateAxes('thumbstick', 0, 0)); await frames(2);
      await pg.evaluate(() => __xrd.controllers.right.updateButtonValue('a-button', 1)); await frames(2); await pg.evaluate(() => __xrd.controllers.right.updateButtonValue('a-button', 0)); await frames(2); return name; };
    await shot('enter-vr-button');
    await pg.evaluate(() => { window.__cv = document.querySelector('#stage canvas'); });
    await pg.click('#vrbtn', { noWaitAfter: true, timeout: 120000 });
    ok(await until(() => VR.on && VR.cal), 'the headset starts and stands you in the Walker');
    await shot('headset-welcome');
    ok(await pg.evaluate(() => { const s = VR.state(); return s.view === 'first' && s.body && s.nohead && s.fov > 100; }), 'in the headset you look out of his eyes (first view, his body shown without its head)');
    const pic = await pg.evaluate(() => new Promise(res => { const d = VR.draw; VR.draw = h => { d(h); VR.draw = d; const gl = __cv.getContext('webgl2'), w = gl.drawingBufferWidth, hh = gl.drawingBufferHeight, n = 24, px = new Uint8Array(4), seen = new Set(); let lit = 0;
      for (let i = 0; i < n; i++)for (let j = 0; j < n; j++){ gl.readPixels(Math.floor((i + .5) * w / n), Math.floor((j + .5) * hh / n), 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, px); if (px[0] + px[1] + px[2] > 30) lit++; seen.add(px[0] >> 4 << 8 | px[1] >> 4 << 4 | px[2] >> 4); }
      res({ lit: lit / (n * n), colours: seen.size, w, h: hh }); }; }));
    ok(pic.lit > .5 && pic.colours > 8, 'the headset draws the world, not black (' + JSON.stringify(pic) + ')');
    if (OUT) { await pg.evaluate(() => { __xrd.stereoEnabled = true; }); await shot('both-eyes'); await pg.evaluate(() => { __xrd.stereoEnabled = false; }); }
    const fr = await pg.evaluate(() => new Promise(r => { const d = VR.draw; let n = 0; VR.draw = h => { n++; d(h); }; setTimeout(() => { VR.draw = d; r(n); }, 4000); }));
    ok(fr >= 2, 'the headset keeps getting frames (' + fr + ' in 4 s here, software drawing)');
    const s0 = await pg.evaluate(() => ({ x: __dbg.you().x, z: __dbg.you().z, a: SHARED.yaw }));
    await pg.evaluate(() => __xrd.controllers.left.updateAxes('thumbstick', 0, -1));
    await frames(14);
    await pg.evaluate(() => __xrd.controllers.left.updateAxes('thumbstick', 0, 0));
    await pg.waitForTimeout(400);
    const s1 = await pg.evaluate(() => ({ x: __dbg.you().x, z: __dbg.you().z }));
    const mv = Math.hypot(s1.x - s0.x, s1.z - s0.z), along = mv && ((s1.x - s0.x) * -Math.sin(s0.a) + (s1.z - s0.z) * -Math.cos(s0.a)) / mv;
    ok(mv > .3 && along > .7, 'the left stick walks him where you look (' + mv.toFixed(2) + ' units, ' + (along || 0).toFixed(2) + ' along your gaze)');
    await shot('walked-forward');
    const y0 = await pg.evaluate(() => VR.yaw);
    await pg.evaluate(() => __xrd.controllers.right.updateAxes('thumbstick', 1, 0)); await frames(3);
    await pg.evaluate(() => __xrd.controllers.right.updateAxes('thumbstick', 0, 0)); await frames(2);
    const y1 = await pg.evaluate(() => VR.yaw);
    ok(Math.abs(y1 - y0 + Math.PI / 6) < 1e-3, 'the right stick turns you right by one 30° step (' + ((y1 - y0) * 180 / Math.PI).toFixed(1) + '°)');
    await shot('turned-right');
    const g0 = await pg.evaluate(() => ({ x: __dbg.you().x, z: __dbg.you().z }));
    await pg.evaluate(() => { const p = __xrd.position; p.x += 1; });
    await frames(3);
    const g1 = await pg.evaluate(() => ({ x: __dbg.you().x, z: __dbg.you().z, mh: FEEL.MH }));
    const step = Math.hypot(g1.x - g0.x, g1.z - g0.z);
    ok(step > .5 * g1.mh && step < 1.1 * g1.mh, 'a metre stepped in the room carries him with you (' + (step / g1.mh).toFixed(2) + ' m)');
    await shot('stepped-in-room');
    await pg.evaluate(() => { const p = __xrd.position; p.x -= 1; });
    await pg.evaluate(() => { window.__keys = []; addEventListener('keydown', e => __keys.push(e.key.toLowerCase()), true); });
    const press = async (d, id) => { await pg.evaluate(([d, i]) => __xrd.controllers[d].updateButtonValue(i, 1), [d, id]); await frames(2); await pg.evaluate(([d, i]) => __xrd.controllers[d].updateButtonValue(i, 0), [d, id]); await frames(2); return pg.evaluate(() => __keys.splice(0)); };
    for (const [d, i, k, m] of [['right', 'a-button', ' ', 'A jumps'], ['left', 'y-button', 'k', 'Y kicks'], ['right', 'trigger', 'shift', 'the right trigger runs'], ['left', 'trigger', 'y', 'the left trigger rolls (roll\'s key is Y)'], ['left', 'squeeze', 'q', 'the left grip turns you left']]) {
      const got = await press(d, i); ok(got.includes(k), m + ' (the game got ' + JSON.stringify(got) + ')'); }
    await frames(6);
    const ctl = await pg.evaluate(() => VR.state().ctl); ok(ctl === 2, 'both controllers show in your hands (' + ctl + ')');
    ok(await pg.evaluate(() => !!document.querySelector('#menu [data-p="vr"]') && typeof VR.open === 'function'), 'the menu has the VR settings (SET, CONTROLS)');
    await pg.evaluate(() => VR.set('move', 'teleport'));
    const t0 = await pg.evaluate(() => ({ x: __dbg.you().x, z: __dbg.you().z }));
    let tp = null;   // aim ahead, turning the controller until the arc lands on clear ground (a parked car can stand straight ahead)
    for (const a of [0, .8, -.8, 1.6, -1.6, 3.1]) {
      await pg.evaluate(a => { const sy = Math.sin(a / 2), cy = Math.cos(a / 2), sx = -.2, cx = .98; __xrd.controllers.left.quaternion.set(cy * sx, cx * sy, -sy * sx, cy * cx); __xrd.controllers.left.updateAxes('thumbstick', 0, -1); }, a); await frames(4);
      tp = await pg.evaluate(() => VR.state().tp); if (tp && tp.ok) break;
    }
    ok(tp && tp.ok, 'in TELEPORT the left stick forward shows an arc landing ahead (' + JSON.stringify(tp) + ')');
    await shot('teleport-arc');
    await pg.evaluate(() => __xrd.controllers.left.updateAxes('thumbstick', 0, 0)); await frames(3);
    const t1 = await pg.evaluate(() => ({ x: __dbg.you().x, z: __dbg.you().z })), jump = Math.hypot(t1.x - t0.x, t1.z - t0.z);
    ok(jump > .5 && tp && Math.hypot(t1.x - tp.x, t1.z - tp.z) < .3, 'letting go teleports him there (' + jump.toFixed(2) + ' units)');
    await shot('teleported');
    ok(await pg.evaluate(() => JSON.parse(JSON.parse(localStorage.getItem('market-save')).vr).move === 'teleport'), 'the VR settings are kept');
    await pg.evaluate(() => { VR.set('move', 'stick'); __xrd.controllers.left.quaternion.set(0, 0, 0, 1); }); await frames(2);
    const menuText = () => pg.evaluate(() => (document.querySelector('#menu') || {}).innerText || '');
    const changed = async (m, ms = 10000) => { for (let t = 0; t < ms; t += 250) { if ((await menuText()) !== m) return true; await pg.waitForTimeout(250); } return false; };
    const target = text => pg.evaluate(t => { const own = e => [...e.childNodes].filter(n => n.nodeType === 3).map(n => n.textContent).join('').trim(), e = [...document.querySelectorAll('#menu *')].find(e => own(e) === t && e.getClientRects().length); if (!e) return null; const r = e.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; }, text);
    const aim = async (dev, h, text) => { const c = typeof text === 'string' ? await target(text) : text; if (!c) return 'no ' + text + ' in the menu'; const d = await pg.evaluate(() => VR.dbg()), ray = d.rays.find(r => r.h === h && r.hand === (dev === 'hands')); if (!ray) return 'no ' + h + ' ' + dev + ' ray';
      const p = await pg.evaluate(c => VR.aim(c.x, c.y), c), mul = (a, b) => [a[3] * b[0] + a[0] * b[3] + a[1] * b[2] - a[2] * b[1], a[3] * b[1] - a[0] * b[2] + a[1] * b[3] + a[2] * b[0], a[3] * b[2] + a[0] * b[1] - a[1] * b[0] + a[2] * b[3], a[3] * b[3] - a[0] * b[0] - a[1] * b[1] - a[2] * b[2]];
      for (let i = 0; i < 3; i++) {   // turn the device so its pointing ray goes from where it starts to the item: whatever angle the ray sits at in the hand, the same turn applies
        const r = (await pg.evaluate(() => VR.dbg())).rays.find(r => r.h === h && r.hand === (dev === 'hands')); let v = [p.x - r.o[0], p.y - r.o[1], p.z - r.o[2]]; const n = Math.hypot(...v); v = v.map(a => a / n); const u = r.d;
        const cr = [u[1] * v[2] - u[2] * v[1], u[2] * v[0] - u[0] * v[2], u[0] * v[1] - u[1] * v[0]], w = 1 + u[0] * v[0] + u[1] * v[1] + u[2] * v[2], qn = Math.hypot(...cr, w), dq = [cr[0] / qn, cr[1] / qn, cr[2] / qn, w / qn];
        await pg.evaluate(([dev, h, dq, mulS]) => { const q = __xrd[dev][h].quaternion, m = eval(mulS)(dq, [q.x, q.y, q.z, q.w]); q.set(m[0], m[1], m[2], m[3]); }, [dev, h, dq, mul.toString()]); await frames(2); }
      const r = (await pg.evaluate(() => VR.dbg())).rays.find(r => r.h === h && r.hand === (dev === 'hands')); return r && r.hit && Math.hypot(r.x - c.x, r.y - c.y) < 12 ? '' : 'the ray lands at ' + (r && r.hit ? Math.round(r.x) + ',' + Math.round(r.y) : 'nothing') + ', not ' + Math.round(c.x) + ',' + Math.round(c.y); };
    ok(await wheel(), 'the left stick press opens the wheel');
    ok(await until(() => VR.state().panel && VR.state().fresh, 90000), 'the wheel shows on a panel in the headset (' + JSON.stringify(await pg.evaluate(() => ({ win: VR.state().win, panel: VR.state().panel, hint: HUB.dbg().hint }))) + ')');
    await shot('wheel-panel');
    { const n = await wheelPick('wheel-lit'); ok(n === 'SETTINGS', 'the stick points at SETTINGS on the wheel (' + n + ')'); }
    ok(await until(() => VR.state().menu && !HUB.on, 8000), 'A opens the menu from the wheel');
    ok(await until(() => VR.state().panel, 90000), 'the menu shows on a panel in the headset (' + JSON.stringify(await pg.evaluate(() => VR.state())) + ')');
    const sh0 = await pg.evaluate(() => VR.state().shots); await pg.waitForTimeout(10000); const sh1 = await pg.evaluate(() => VR.state().shots);
    ok(sh1 - sh0 <= 1, 'a still menu is not pictured over and over (' + (sh1 - sh0) + ' pictures in 10 s)');
    await shot('menu-panel');
    const a1 = await aim('controllers', 'right', 'PETS');   // the menu opens at SETTINGS (no PROFILE, 9 Nov 2026), so the first press goes to another section
    ok(!a1, 'the right controller points at PETS in the menu' + (a1 ? ' (' + a1 + ')' : ''));
    await shot('controller-points');
    const m0 = await menuText();
    await pg.evaluate(() => __xrd.controllers.right.updateButtonValue('trigger', 1)); await frames(2);
    await pg.evaluate(() => __xrd.controllers.right.updateButtonValue('trigger', 0)); await frames(2);
    ok(await changed(m0), 'the trigger presses PETS (' + (await menuText()).split('\n')[0] + ')');
    ok(await until(() => VR.state().fresh, 90000), 'the panel shows the PETS page');
    await shot('controller-pressed');
    // a cabinet in the headset: the game's canvas lives on the panel, the stick and the buttons play it, the sticks do not turn you meanwhile
    for (let i = 0; i < 2 && await pg.evaluate(() => VR.state().menu); i++) { await pg.keyboard.press('Escape'); await pg.waitForTimeout(500); } await until(() => !VR.state().menu, 8000);   // the menu shuts
    await pg.evaluate(() => { INV.cash = Math.max(INV.cash || 0, 20); STORE.cabs.play('RAINBOW RUN'); });
    ok(await until(() => STORE.cabs.on && STORE.cabs.dbg().loaded, 90000), 'a cabinet opens in the headset');
    ok(await until(() => VR.state().panel && VR.state().live, 90000), 'its game shows live on the panel (' + JSON.stringify(await pg.evaluate(() => { const s = VR.state(); return { panel: s.panel, live: s.live, gamewin: s.gamewin }; })) + ')');
    await shot('cabinet-panel');
    await pg.evaluate(() => __xrd.controllers.right.updateButtonValue('a-button', 1)); await frames(2); await pg.evaluate(() => __xrd.controllers.right.updateButtonValue('a-button', 0)); await frames(2);
    ok(await until(() => STORE.cabs.dbg().mode === 'play', 8000), 'A puts the coin in and starts the run');
    await pg.evaluate(() => { window.__keys = []; }); await pg.evaluate(() => __xrd.controllers.left.updateAxes('thumbstick', -1, 0)); await frames(3); await pg.evaluate(() => __xrd.controllers.left.updateAxes('thumbstick', 0, 0)); await frames(2);
    const gk = await pg.evaluate(() => __keys.splice(0)); ok(gk.includes('arrowleft'), 'the left stick is the game\'s arrows (' + JSON.stringify(gk) + ')');
    const yg = await pg.evaluate(() => VR.state().yaw); await pg.evaluate(() => __xrd.controllers.right.updateAxes('thumbstick', 1, 0)); await frames(3); await pg.evaluate(() => __xrd.controllers.right.updateAxes('thumbstick', 0, 0)); await frames(2);
    ok(Math.abs((await pg.evaluate(() => VR.state().yaw)) - yg) < 1e-6, 'the right stick does not turn you while the game is up');
    await pg.evaluate(() => { window.__keys = []; STORE.cabs.close(); }); await frames(2);   // (B is ESC on the pad, the same path; held over two of these slow frames it would be the hold that leaves VR)
    ok(await until(() => !STORE.cabs.on && !VR.state().win, 15000), 'leaving the cabinet takes its panel down (' + JSON.stringify(await pg.evaluate(() => { const s = VR.state(); return { win: s.win, panel: s.panel, gamewin: s.gamewin }; })) + ')');
    await pg.evaluate(() => { window.__keys = []; });
    // the wheel by the ray: the right controller points at the PETS slice on the panel, its trigger chooses it
    ok(await wheel() && await until(() => VR.state().panel && VR.state().fresh, 90000), 'the wheel is on the panel again');
    { const c = await pg.evaluate(() => { const t = [...document.querySelectorAll('#hub text:not(.s)')].find(t => t.textContent.trim() === 'PETS'); if (!t) return null; const r = t.getBoundingClientRect(), hub = document.getElementById('hub'), e = document.elementsFromPoint(r.left + r.width / 2, r.top + r.height / 2).find(e => hub.contains(e)); return { x: r.left + r.width / 2, y: r.top + r.height / 2, on: !!e && e.tagName === 'path' && HUB.dbg().slices[+e.dataset.i] }; });
      const ar = c ? await aim('controllers', 'right', c) : 'no PETS slice'; ok(c && c.on === 'PETS' && !ar, 'the right controller\'s ray lands on the wheel\'s PETS slice' + (ar ? ' (' + ar + ')' : '') + ' ' + JSON.stringify(c)); await shot('wheel-ray');
      const k0 = await pg.evaluate(() => VR.state().clicks); await pg.evaluate(() => __xrd.controllers.right.updateButtonValue('trigger', 1)); await frames(2); await pg.evaluate(() => __xrd.controllers.right.updateButtonValue('trigger', 0)); await frames(2);
      ok(await until(() => VR.state().menu && !HUB.on && __UI.menuNow()[0] === 'pets', 10000), 'the trigger chooses it: the wheel shuts and the menu opens at PETS (' + JSON.stringify(await pg.evaluate(k0 => ({ clicks: VR.state().clicks - k0, hub: HUB.on, menu: VR.state().menu, now: window.__UI && __UI.menuNow ? __UI.menuNow() : null }), k0)) + ')'); }
    ok(await until(() => VR.state().menu, 8000), 'the menu opens again after the cabinet (' + JSON.stringify(await pg.evaluate(() => { const s = VR.state(); return { menu: s.menu, panel: s.panel, win: s.win, gamewin: s.gamewin, cab: STORE.cabs.on, keys: __keys.splice(0) }; })) + ')');
    ok(await until(() => VR.state().panel && VR.state().fresh, 90000), 'and shows on the panel');
    ok(await until(() => VR.state().fresh, 90000), 'its picture is fresh'); const a3 = await aim('controllers', 'right', 'SETTINGS'); ok(!a3, 'the right controller points at SETTINGS again' + (a3 ? ' (' + a3 + ')' : ''));   // back where the hands' part of this check began
    await pg.evaluate(() => __xrd.controllers.right.updateButtonValue('trigger', 1)); await frames(2); await pg.evaluate(() => __xrd.controllers.right.updateButtonValue('trigger', 0)); await frames(2);
    ok(await until(() => VR.state().fresh, 90000), 'the panel shows the settings again');
    await pg.evaluate(() => { __xrd.primaryInputMode = 'hand'; });
    ok(await until(() => VR.state().hands === 2, 15000), 'put the controllers down and your hands show (' + (await pg.evaluate(() => VR.state().hands)) + ' hands)');
    ok(await until(() => VR.state().wrist, 5000), 'a MENU button sits on your left wrist');
    const m1 = await menuText(), word = await pg.evaluate(() => { const own = e => [...e.childNodes].filter(n => n.nodeType === 3).map(n => n.textContent).join('').trim(), v = [...document.querySelectorAll('#menu button,#menu [role=tab]')].filter(e => e.getClientRects().length && own(e) && e.getAttribute('aria-selected') !== 'true'), h = v.find(e => own(e) === 'HELP'); return h ? 'HELP' : v[0] ? own(v[0]) : ''; });
    const a2 = await aim('hands', 'right', word);
    ok(!a2, 'your right hand points at ' + word + ' on the panel' + (a2 ? ' (' + a2 + ')' : ''));
    await shot('hand-points');
    const c0 = await pg.evaluate(() => VR.state().clicks);
    await pg.evaluate(() => __xrd.hands.right.updatePinchValue(1)); await frames(3);
    await pg.evaluate(() => __xrd.hands.right.updatePinchValue(0)); await frames(3);
    ok(await pg.evaluate(c0 => VR.state().clicks > c0, c0) && await changed(m1), 'a pinch presses it (' + (await menuText()).split('\n')[0] + ')');
    ok(await until(() => VR.state().fresh, 90000), 'the panel shows the page the pinch opened');
    await shot('hand-pressed');
    const d = await pg.evaluate(() => VR.dbg());
    await pg.evaluate(([w, f]) => { const p = __xrd.hands.right.position; p.set(p.x + w[0] - f[0], p.y + w[1] - f[1], p.z + w[2] - f[2]); }, [d.wrist, d.finger]); await frames(3);
    ok(await until(() => !VR.state().menu, 8000), 'touching the MENU button on your wrist closes the menu');
    await shot('wrist-menu');
    await pg.evaluate(() => { __xrd.primaryInputMode = 'controller'; }); await frames(2);
    await pg.evaluate(() => document.getElementById('vrbtn').click());
    ok(await until(() => !VR.on, 15000), 'LEAVE VR on the page leaves');
    const back = await pg.evaluate(() => VR.state());
    const cb1 = await camBack();
    ok(!cb1, 'leaving VR gives back your camera angle' + cb1);
    ok(back.view === view0 && !back.pad && back.fov === fov0, 'leaving VR gives back the view you had and drops the headset pad (' + JSON.stringify(back) + ', was ' + view0 + ')');
    await shot('back-on-screen');
    for (let i = 0; i < 2 && await pg.evaluate(() => VR.state().menu); i++) { await pg.keyboard.press('Escape'); await pg.waitForTimeout(500); }
    ok(await drawn() > 0, 'the game draws on the screen again after VR');
    await pg.evaluate(() => { window.__quest = true; });
    await pg.click('#vrbtn', { noWaitAfter: true, timeout: 120000 });
    ok(await until(() => VR.on && VR.cal), 'the headset starts again, with the page frames stopped as on a Quest');
    const q0 = await pg.evaluate(() => ({ x: __dbg.you().x, z: __dbg.you().z }));
    await pg.evaluate(() => __xrd.controllers.left.updateAxes('thumbstick', 0, -1)); await frames(14);
    await pg.evaluate(() => __xrd.controllers.left.updateAxes('thumbstick', 0, 0)); await frames(3);
    const q1 = await pg.evaluate(() => ({ x: __dbg.you().x, z: __dbg.you().z }));
    ok(Math.hypot(q1.x - q0.x, q1.z - q0.z) > .3, 'with the page frames stopped the controllers still walk him (' + Math.hypot(q1.x - q0.x, q1.z - q0.z).toFixed(2) + ' units)');
    await shot('quest-walked');
    ok(await pg.evaluate(() => window.__blocked >= 10), 'the page frames really were stopped (about one held back a headset frame; ' + await pg.evaluate(() => window.__blocked) + ' held back)');
    ok(await pg.evaluate(() => new Promise(r => { let k = 0; const f = () => ++k >= 3 ? r(true) : requestAnimationFrame(f); requestAnimationFrame(f); setTimeout(() => r(false), 30000); })), 'waiting on frames (fades, loading) still ends in VR');
    await pg.evaluate(() => __xrd.controllers.right.updateButtonValue('b-button', 1));
    const held = await until(() => !VR.on, 15000);
    await pg.evaluate(() => __xrd.controllers.right.updateButtonValue('b-button', 0));
    ok(held, 'holding B leaves VR');
    const cb2 = await camBack();
    ok(!cb2, 'leaving VR by holding B gives back your camera angle' + cb2);
    await pg.evaluate(() => { window.__quest = false; });
    ok(await drawn() > 0, 'after VR on a Quest the game draws on the screen again');
    await shot('after-hold-b');
  }
  ok(!warns.length, 'no VR warnings' + (warns.length ? ': ' + warns.slice(0, 3).join(' | ') : ''));
  ok(!errs.length, 'no page errors' + (errs.length ? ': ' + errs.slice(0, 3).join(' | ') : ''));
  await b.close();
  console.log(fails.length ? fails.length + ' failed' : 'all VR checks passed');
  process.exit(fails.length ? 1 : 0);
})();
