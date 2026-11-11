// THE JETS CHECK: node tests/jets.cjs dist/market.html [shots-prefix]. The flamethrower and the freeze ray (146hb): owned from the start; the flamethrower's fire lights a fire where it lands; the freeze ray puts it out and frosts the ground, freezes the river to ice you stand on; a player in either stream is zapped; zaps freeze and burn you, and frozen you cannot walk; another player's stream is drawn from their hand.
const { chromium } = require('playwright'), path = require('path');
const fails = [], ok = (c, m) => { if (!c) { fails.push(m); console.log((process.env.GITHUB_ACTIONS ? '::error title=jets::' : 'FAIL ') + m); } else console.log('ok   ' + m); };
(async () => {
  const b = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'], ...(process.env.PW_CHROMIUM ? { executablePath: process.env.PW_CHROMIUM } : {}) });
  const pg = await b.newPage({ viewport: { width: 960, height: 600 } }), errs = [], shots = process.argv[3];
  pg.on('pageerror', e => errs.push(e.message.slice(0, 300)));
  await pg.goto('file://' + path.resolve(process.argv[2] || 'dist/market.html') + '?fresh=1&hour=13&res=0&at=40,150', { waitUntil: 'commit' });
  let st = false; for (let i = 0; i < 60 && !st; i++) { await pg.waitForTimeout(3000); st = await pg.evaluate(() => !!window.__started).catch(() => false); }
  ok(st, 'the page starts');
  const until = async (f, ms, arg) => { let v; for (let t = 0; t < ms; t += 500) { v = await pg.evaluate(f, arg); if (v) return v; await pg.waitForTimeout(500); } return v; };
  const shot = async n => { if (shots) { await pg.evaluate(() => { const L = document.getElementById('loading'); if (L) L.remove(); }); await pg.screenshot({ path: shots + '-' + n + '.png' }); } };
  if (st) {
    await pg.waitForTimeout(4000);
    await pg.evaluate(() => { if (window.WX) WX.hold = 'CLEAR'; __dbg.UI.setView('third'); window.__sent = []; ONLINE.send = m => __sent.push(m); });
    const own = await pg.evaluate(() => [INV.items.flamer, INV.items.frost, WIELD.LIST.includes('flamer') && WIELD.LIST.includes('frost')]);
    ok(own[0] && own[1] && own[2], 'every player owns the flamethrower and the freeze ray, held from the pack (' + JSON.stringify(own) + ')');
    const aim = (dn) => pg.evaluate(d => { const h = SHARED.heading, v = { x: Math.sin(h), y: -d, z: Math.cos(h) }, l = Math.hypot(v.x, v.y, v.z); JETS.aim = new __dbg.THREE.Vector3(v.x / l, v.y / l, v.z / l); }, dn);
    await aim(.55); await pg.evaluate(() => { WIELD.set('flamer'); JETS.hold = true; });
    const lit = await until(() => { const d = JETDBG(); return d.streams[0] && d.streams[0].what === 'ground' && BLAZE.F.length > 0 && d.parts > 5 ? { s: d.streams[0], fires: BLAZE.F.length, parts: d.parts } : null; }, 12000);
    ok(!!lit, 'the flamethrower shoots fire that lands on the ground and lights a fire there (' + JSON.stringify(lit) + ')');
    await shot('fire');
    const modes = {}; for (const [m, nm] of [['jet', 'fuel jet'], ['tube', 'cel flame'], ['plasma', 'plasma']]) { await pg.evaluate(m => { JETS.mode = m; }, m);
      modes[m] = await until(nm => { let v = false; __scene.traverse(o => { if (o.name === nm && o.visible) v = true; }); return v; }, 8000, nm); await shot('mode-' + m); }
    await pg.evaluate(() => { JETS.mode = 'fluid'; });
    ok(modes.jet && modes.tube && modes.plasma, 'the flamethrower\'s modes each draw their fire (' + JSON.stringify(modes) + ')');
    await pg.evaluate(() => { JETS.hold = false; }); await pg.waitForTimeout(800);
    const n0 = await pg.evaluate(() => BLAZE.F.length);
    await pg.evaluate(() => { WIELD.set('frost'); JETS.hold = true; });
    const doused = await until(n => { const d = JETDBG(); return BLAZE.F.length < n && d.frost > 0 ? { left: BLAZE.F.length, frost: d.frost } : null; }, 40000, n0);
    ok(!!doused, 'the freeze ray puts the fire out and frosts the ground (' + n0 + ' fires -> ' + JSON.stringify(doused) + ')');
    await shot('frost');
    await pg.evaluate(() => { JETS.hold = false; }); await pg.waitForTimeout(500);

    // a player in front of you, in each stream
    await pg.evaluate(() => { const P = __dbg.you(), h = SHARED.heading, M = JETDBG().M; ONLINE.feed({ t: 'hi', you: 'me', all: [{ id: 'a', name: 'ROSA', look: 'w00', at: [P.x + Math.sin(h) * 2.2 * M, P.z + Math.cos(h) * 2.2 * M, SHARED.py, h + Math.PI, SHARED.LVL, ''] }] }); });
    await pg.waitForTimeout(1500); await aim(.12);
    await pg.evaluate(() => { __sent.length = 0; WIELD.set('flamer'); JETS.hold = true; });
    const zf = await until(() => { const z = __sent.filter(m => m.t === 'zap' && m.to === 'a' && m.k === 'f'), e = JETDBG().fx.find(f => f.id === 'a'); return z.length && e && e.fire > 0 ? { zaps: z.length, fire: e.fire } : null; }, 10000);
    ok(!!zf, 'a player in the fire is zapped and burns (' + JSON.stringify(zf) + ')');
    await shot('burn');
    await pg.evaluate(() => { JETS.hold = false; __sent.length = 0; WIELD.set('frost'); JETS.hold = true; });
    const zi = await until(() => { const z = __sent.filter(m => m.t === 'zap' && m.to === 'a' && m.k === 'i'), e = JETDBG().fx.find(f => f.id === 'a'); return z.length && e && e.ice > 0 ? { zaps: z.length, ice: e.ice } : null; }, 40000);
    ok(!!zi, 'a player in the freezing mist is zapped and frozen in ice (' + JSON.stringify(zi) + ')');
    await shot('frozen');
    // the mouse on a player further off: the fire goes to them, not the ground before them
    await pg.evaluate(() => { JETS.hold = false; JETS.aim = null; WIELD.set(null); const P = __dbg.you(), h = SHARED.heading + .5, M = JETDBG().M; ONLINE.feed({ t: 'in', p: { id: 'b', name: 'TEST', look: 'w00', at: [P.x + Math.sin(h) * 4.5 * M, P.z + Math.cos(h) * 4.5 * M, SHARED.py, h + Math.PI, SHARED.LVL, ''] } }); });
    await pg.waitForTimeout(1500);
    const at = await pg.evaluate(() => { const o = ONLINE.others.get('b'), M = JETDBG().M, v = new __dbg.THREE.Vector3(o.p.x, (o.p.y ?? SHARED.py) + 1.1 * M, o.p.z).project(SHARED.cam), r = document.querySelector('canvas').getBoundingClientRect(); return [r.left + (v.x + 1) / 2 * r.width, r.top + (1 - v.y) / 2 * r.height]; });
    await pg.mouse.move(at[0], at[1]); await pg.evaluate(() => { __sent.length = 0; WIELD.set('flamer'); JETS.hold = true; });
    const zp = await until(() => { const z = __sent.filter(m => m.t === 'zap' && m.to === 'b'); return z.length ? { zaps: z.length } : null; }, 10000);
    ok(!!zp, 'the mouse on a player 4.5 tiles off: the fire reaches them (' + JSON.stringify(zp) + ')');
    await shot('pointed');
    await pg.evaluate(() => { JETS.hold = false; JETS.aim = null; WIELD.set(null); ONLINE.feed({ t: 'out', id: 'b' }); });

    // their zaps on you
    const fr = await pg.evaluate(async () => { for (let i = 0; i < 4; i++) ONLINE.feed({ t: 'zap', id: 'a', k: 'i', from: [0, 0] }); await new Promise(r => setTimeout(r, 200)); const p = __dbg.you(); return { f: SHARED.frozen, x: p.x, z: p.z }; });
    await pg.keyboard.down('w'); await pg.waitForTimeout(1200); await pg.keyboard.up('w');
    const fr2 = await pg.evaluate(() => { const p = __dbg.you(); return { f: SHARED.frozen, x: p.x, z: p.z }; });
    ok(fr.f > 0 && Math.hypot(fr2.x - fr.x, fr2.z - fr.z) < .05, 'their freeze ray freezes you: you cannot walk till it thaws (' + JSON.stringify([fr, fr2]) + ')');
    await pg.evaluate(() => { SHARED.frozen = .01; }); await pg.waitForTimeout(3200);
    const burnt = await pg.evaluate(async () => { const h0 = __dbg.VIT.hp; for (let i = 0; i < 3; i++) { ONLINE.feed({ t: 'zap', id: 'a', k: 'f', from: [0, 0] }); await new Promise(r => setTimeout(r, 200)); } return { h0, h: __dbg.VIT.hp, burn: JETS.burnT }; });
    ok(burnt.h < burnt.h0 && burnt.burn > 0, 'their flamethrower burns you (' + JSON.stringify(burnt) + ')');

    // their stream, from their hand
    const theirs = await until(() => { ONLINE.feed({ t: 'aim', id: 'a', w: 'flamer', v: [0, -.3, 1] }); ONLINE.feed({ t: 'jet', id: 'a', k: 'f' }); const s = JETDBG().streams.find(s => s.id === 'a'); return s && s.len > 0 ? s : null; }, 6000);
    ok(!!theirs, 'another player firing is drawn from the flamethrower in their hand (' + JSON.stringify(theirs) + ')');
    await pg.evaluate(() => ONLINE.feed({ t: 'jet', id: 'a', k: '' }));

    // the river: frozen, stood on
    await pg.evaluate(() => __dbg.UI.goTo(40, -130, 'up')); await until(() => { for (let x = -300; x <= 300; x += 6) for (let z = -300; z <= 300; z += 6) if (RIVER.over(x, z)) return true; return false; }, 40000);
    const shore = await pg.evaluate(() => { let best = null; const P = __dbg.you(); for (let x = -300; x <= 300; x += 6) for (let z = -300; z <= 300; z += 6) { if (!RIVER.over(x, z)) continue; const d = Math.hypot(x - P.x, z - P.z); if (!best || d < best.d) best = { x, z, d }; } if (!best) return null;
      const dirs = [[0, 1], [0, -1], [1, 0], [-1, 0]]; for (const [dx, dz] of dirs) { let k = 0; while (k < 60 && RIVER.over(best.x + dx * k, best.z + dz * k)) k += .5; if (k < 60 && k > 3) return { wx: best.x + dx * (k - 2.5), wz: best.z + dz * (k - 2.5), sx: best.x + dx * (k + .6), sz: best.z + dz * (k + .6) }; } return null; });
    ok(!!shore, 'the river is found (' + JSON.stringify(shore) + ')');
    if (shore) {
      await pg.evaluate(s => { __dbg.UI.goTo(s.sx, s.sz, 'up'); SHARED.heading = Math.atan2(s.wx - s.sx, s.wz - s.sz); }, shore); await pg.waitForTimeout(3000);
      await pg.evaluate(s => { const p = __dbg.you(), h = Math.atan2(s.wx - p.x, s.wz - p.z); SHARED.heading = h; JETS.aim = new __dbg.THREE.Vector3(Math.sin(h), -.55, Math.cos(h)).normalize(); WIELD.set('frost'); JETS.hold = true; }, shore);
      const ice = await until(() => { const d = JETDBG(); const big = d.ice.slice().sort((a, b) => b.r - a.r); return big.length && big[0].r > .45 ? { what: d.streams[0] && d.streams[0].what, ice: big } : null; }, 40000);
      if (!ice) console.log('  stream at the river: ' + JSON.stringify(await pg.evaluate(() => JETDBG().streams.map(s => ({ what: s.what, len: s.len, tip: s.tip, dir: s.dir })))));
      ok(!!ice, 'the freeze ray freezes the river where it lands (' + JSON.stringify(ice) + ')');
      await shot('ice');
      await pg.evaluate(() => { JETS.hold = false; WIELD.set(null); });
      if (ice) {
        const c = ice.ice[0]; await pg.evaluate(c => __dbg.UI.goTo(c.x, c.z, 'up'), c); await pg.waitForTimeout(2500);
        const on = await pg.evaluate(() => ({ swim: !!(__dbg.ST.water && __dbg.ST.water.in), py: SHARED.py, at: ICE.at(__dbg.you().x, __dbg.you().z) }));
        ok(!on.swim && on.at != null && Math.abs(on.py - on.at) < .3, 'you stand on the ice, not in the water (' + JSON.stringify(on) + ')');
      }
    }
  }
  ok(!errs.length, 'no page errors (' + errs.join(' | ') + ')');
  await b.close(); console.log(fails.length ? fails.length + ' FAILED' : 'all passed'); process.exit(fails.length ? 1 : 0);
})();
