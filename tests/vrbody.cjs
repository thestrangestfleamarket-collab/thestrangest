// YOUR REAL MOVES IN THE HEADSET: node tests/vrbody.cjs dist/market.html [folder for screenshots]. An emulated Quest 3 (IWER): a raised controller raises your avatar's hand to it, the trigger and grip close its fingers, your tracked hands bend its fingers as yours, the head turns with the headset, all of it is sent to the others, and another player's body sent it moves the same.
const { chromium } = require('playwright'), path = require('path'), fs = require('fs');
const fails = [], ok = (c, m) => { if (!c) { fails.push(m); console.log((process.env.GITHUB_ACTIONS ? '::error title=vrbody::' : 'FAIL ') + m); } else console.log('ok   ' + m); };
(async () => {
  const b = await chromium.launch({ executablePath: process.env.PW_CHROMIUM || undefined, args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const pg = await b.newPage({ viewport: { width: 960, height: 600 } }), errs = [];
  pg.on('pageerror', e => errs.push(e.message.slice(0, 300)));
  await pg.addInitScript('{ const R0 = window.requestAnimationFrame.bind(window); window.requestAnimationFrame = f => window.__quest && window.VR && VR.on && !new Error().stack.split("\\n").slice(2, 4).some(l => l.includes("onDeviceFrame")) ? (window.__blocked = (window.__blocked || 0) + 1, -1) : R0(f); }');
  await pg.addInitScript(fs.readFileSync(require.resolve('iwer/build/iwer.js'), 'utf8') + ';window.__xrd=new IWER.XRDevice(IWER.metaQuest3);window.__xrd.installRuntime({forceInstall:true});');
  await pg.goto('file://' + path.resolve(process.argv[2] || 'dist/market.html') + '?fresh=1&hour=13&at=49,10', { waitUntil: 'commit' });
  let st = false; for (let i = 0; i < 60 && !st; i++) { await pg.waitForTimeout(3000); st = await pg.evaluate(() => !!window.__started).catch(() => false); }
  ok(st, 'the page starts');
  if (st) {
    await pg.waitForTimeout(2000);
    await pg.evaluate(() => { window.__sent = []; ONLINE.send = m => __sent.push(m); ONLINE.feed({ t: 'hi', you: 'me', all: [] }); ONLINE.on = true; });
    const frames = n => pg.evaluate(n => new Promise(r => { const d = VR.draw; let k = 0; VR.draw = h => { d(h); if (++k >= n) { VR.draw = d; r(k); } }; }), n);
    const until = async (f, ms = 20000) => { for (let t = 0; t < ms; t += 250) { if (await pg.evaluate(f).catch(() => false)) return true; await pg.waitForTimeout(250); } return false; };
    const OUT = process.argv[3]; let nShot = 0; if (OUT) fs.mkdirSync(OUT, { recursive: true });
    const shot = async name => { if (!OUT) return; if (await pg.evaluate(() => VR.on)) await frames(2); const f = path.join(OUT, String(++nShot).padStart(2, '0') + '-' + name + '.png'); await pg.screenshot({ path: f, timeout: 180000 }); console.log('shot ' + f); };
    await pg.click('#vrbtn', { noWaitAfter: true, timeout: 120000 });
    ok(await until(() => VR.on && VR.cal), 'the headset starts');
    // your right wrist (the avatar's) and where the controller says it is, in metres apart
    const gap = () => pg.evaluate(() => { const M = BODIES.mine(), H = BODIES.hand('R'), U = VR.hand('right'); if (!M || !H || !U) return null; M.me.updateMatrixWorld(true);
      const w = H.wrist.clone().applyMatrix4(M.me.matrixWorld), g = new VR.dolly.position.constructor(0, 0, .06).applyQuaternion(U.wq).multiplyScalar(VR.dolly.scale.x).add(U.wp);
      const head = BODIES.mine().me.localToWorld(new VR.dolly.position.constructor()).y; return { d: w.distanceTo(g) / VR.dolly.scale.x, wy: (w.y - head) / VR.dolly.scale.y }; });
    await pg.evaluate(() => { const c = __xrd.controllers.right, h = __xrd.position; c.position.set(h.x + .25, h.y + .35, h.z - .3); }); await frames(4);
    const up = await gap(); ok(up && up.d < .2, 'a controller raised over your head raises your avatar\'s right hand to it (' + (up ? up.d.toFixed(2) + ' m off' : 'no hand') + ')');
    const eye = await pg.evaluate(() => VRB.eye || null); ok(eye && Math.hypot(...eye) < .12, 'the avatar\'s eyes are where yours are, so the others see your hands where they are (' + (eye ? eye.map(v => v.toFixed(2)).join(', ') + ' m off' : 'none') + ')');
    await pg.evaluate(() => { const c = __xrd.controllers.right, h = __xrd.position; c.position.set(h.x + .3, h.y - .45, h.z - .25); }); await frames(4);
    const dn = await gap(); ok(dn && dn.d < .2 && up && up.wy - dn.wy > .5, 'lowered, the hand comes down with it (' + (dn ? dn.d.toFixed(2) + ' m off, ' + (up.wy - dn.wy).toFixed(2) + ' m lower' : 'no hand') + ')');
    // the trigger and grip close its fingers
    const curl = () => pg.evaluate(() => { const s = BODIES.mine().PM.hands; return s && s.fg && s.fg.R ? s.fg.R.map(f => +f[1].toFixed(2)) : null; });
    const c0 = await curl();
    await pg.evaluate(() => { __xrd.controllers.right.updateButtonValue('trigger', 1); __xrd.controllers.right.updateButtonValue('squeeze', 1); }); await frames(4);
    const c1 = await curl(); ok(c0 && c1 && c1[1] > c0[1] + .3 && c1[3] > c0[3] + .3, 'the trigger closes the index finger, the grip the others (' + JSON.stringify([c0, c1]) + ')');
    await pg.evaluate(() => { __xrd.controllers.right.updateButtonValue('trigger', 0); __xrd.controllers.right.updateButtonValue('squeeze', 0); }); await frames(2);
    // the head turns with the headset
    const hq = () => pg.evaluate(() => { const M = BODIES.mine(), P = M.PM.value[2], V = VR.dolly.position.constructor, q = VR.dolly.quaternion.clone(); P.decompose(new V(), q, new V()); return q.toArray(); });
    const h0 = await hq(); await pg.evaluate(() => { __xrd.quaternion.set(0, Math.sin(.35), 0, Math.cos(.35)); }); await frames(4); const h1 = await hq();
    const dq = Math.abs(h0[0] * h1[0] + h0[1] * h1[1] + h0[2] * h1[2] + h0[3] * h1[3]); ok(2 * Math.acos(Math.min(1, dq)) > .5, 'the avatar\'s head turns with the headset (' + (2 * Math.acos(Math.min(1, dq))).toFixed(2) + ' rad)');
    await pg.evaluate(() => { __xrd.quaternion.set(0, 0, 0, 1); }); await frames(2);
    // what the others are told
    await pg.evaluate(() => { const c = __xrd.controllers.right, h = __xrd.position; c.position.set(h.x + .25, h.y + .35, h.z - .3); __sent.length = 0; }); await frames(12);
    const msg = await pg.evaluate(() => { const v = __sent.filter(m => m.t === 'vr'); return { n: v.length, last: v[v.length - 1] || null, len: JSON.stringify(v[v.length - 1] || {}).length }; });
    ok(msg.n >= 1 && msg.last && msg.last.h.length === 4 && msg.last.R.length === 27 && msg.last.L.length === 27, 'your head, hands and fingers are sent to the others (' + msg.n + ' messages, ' + msg.len + ' bytes each)');
    // another player in a headset: their body moves as they do
    await pg.evaluate(() => { const a = SHARED.yaw, m = VR.dolly.scale.x, x = __dbg.you().x - Math.sin(a) * 2.2 * m, z = __dbg.you().z - Math.cos(a) * 2.2 * m;
      ONLINE.feed({ t: 'in', p: { id: 'p2', name: 'WAVER', look: 'b:avatar:' + BODIES.by.avatar.look(), at: [x, z, SHARED.py, a, SHARED.LVL || 'up', ''] } }); });
    const fig = await until(() => { const o = ONLINE.others.get('p2'); return o && o.why === 'near you' && o.fig && o.fig.PM && o.fig.body && o.fig.body.binv && o.B; }, 60000); ok(fig, 'another player stands before you');
    const their = () => pg.evaluate(() => { const o = ONLINE.others.get('p2'), F = o.fig, H = BODIES.hand('R', F.PM, F.body, o.B); if (!H) return null; F.me.updateMatrixWorld(true); const w = H.wrist.clone().applyMatrix4(F.me.matrixWorld), g = F.g.position; return (w.y - g.y) / VR.dolly.scale.y; });
    await frames(6); const t0 = await their(); const last = msg.last;
    const waitFor = async f => { let v = null; for (let i = 0; i < 40; i++) { await frames(2); v = await their(); if (v != null && f(v)) break; } return v; };
    await pg.evaluate(m => { const d = window.__d0 = VR.draw; VR.draw = h => { ONLINE.feed({ ...m, id: 'p2' }); d(h); }; }, last);   // (sent every frame: here a frame can take longer than the others wait)
    const t1 = await waitFor(v => v - t0 > .5), dg = await pg.evaluate(() => { const o = ONLINE.others.get('p2'), F = o.fig; return { why: o.why, age: o.vr ? Math.round(performance.now() - o.vr.t) : -1, pm: !!(F.PM && F.PM.vr), binv: !!(F.body && F.body.binv), key: F.body && F.body.key.slice(0, 12), vis: F.g.visible }; });
    ok(t0 != null && t1 != null && t1 - t0 > .5, 'their hand goes up when they raise theirs (' + (t0 != null && t1 != null ? (t1 - t0).toFixed(2) + ' m higher' : 'no hand') + ', ' + JSON.stringify(dg) + ')');
    await shot('their-hand-raised');
    await pg.evaluate(() => { VR.draw = __d0; ONLINE.feed({ t: 'vr', id: 'p2', off: 1 }); });
    const t2 = await waitFor(v => t1 - v > .5); ok(t2 != null && t1 - t2 > .5, 'out of the headset, their arms are their moves again (' + (t2 != null ? (t1 - t2).toFixed(2) + ' m lower' : 'no hand') + ')');
    // your tracked hands: the fingers as yours
    await pg.evaluate(() => { __xrd.primaryInputMode = 'hand'; });
    ok(await until(() => VR.state().hands === 2, 15000), 'put the controllers down and your hands are tracked');
    await frames(4);
    const f0 = await pg.evaluate(() => { const d = VRB.capture(); return d && d.R ? d.R.f.slice() : null; });
    await pg.evaluate(() => __xrd.hands.right.updatePinchValue(1)); await frames(4);
    const f1 = await pg.evaluate(() => { const d = VRB.capture(); return d && d.R ? d.R.f.slice() : null; });
    const moved = f0 && f1 ? Math.max(...f1.map((v, i) => Math.abs(v - f0[i]))) : 0;
    ok(moved > .2, 'a pinch bends your avatar\'s fingers as yours (' + moved.toFixed(2) + ' rad the most)');
    const hid = await pg.evaluate(() => { const s = BODIES.mine().PM.hands; return s ? !s.hm.visible : true; }); ok(hid, 'your avatar\'s own hands stand down under your tracked hands');
    await pg.evaluate(() => __xrd.hands.right.updatePinchValue(0));
    await pg.evaluate(() => VR.leave && VR.leave()); await until(() => !VR.on, 20000);
    const off = await pg.evaluate(() => { const M = BODIES.mine(); return { vr: !!(M && M.PM.vr), bye: __sent.some(m => m.t === 'vr' && m.off) }; });
    ok(!off.vr && off.bye, 'leaving VR hands your body back to its moves and tells the others (' + JSON.stringify(off) + ')');
  }
  ok(!errs.length, 'no page errors' + (errs.length ? ': ' + errs.slice(0, 3).join(' | ') : ''));
  await b.close(); if (fails.length) { console.log(fails.length + ' failed'); process.exit(1); } console.log('all passed');
})();
