// THE ARMS CHECK: node tests/arms.cjs dist/market.html [shots-prefix]. The fourteen weapons (146hc): owned from the start; a gun's shot on a player in front is sent as a hit; a grenade goes off and hurts who is near; a molotov lights a fire; a net catches a player; a mine goes off under a player; portals carry you and close after 30 seconds; the leaf blower shoves; their hits on you hurt you, and a net holds you still; another player's shot is drawn; no page errors.
const { chromium } = require('playwright'), path = require('path');
const fails = [], ok = (c, m) => { if (!c) { fails.push(m); console.log((process.env.GITHUB_ACTIONS ? '::error title=arms::' : 'FAIL ') + m); } else console.log('ok   ' + m); };
(async () => {
  const b = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'], ...(process.env.PW_CHROMIUM ? { executablePath: process.env.PW_CHROMIUM } : {}) });
  const pg = await b.newPage({ viewport: { width: 960, height: 600 } }), errs = [], shots = process.argv[3];
  pg.on('pageerror', e => errs.push(e.message.slice(0, 300)));
  await pg.goto('file://' + path.resolve(process.argv[2] || 'dist/market.html') + '?fresh=1&hour=13&res=0&at=40,150', { waitUntil: 'commit' });
  let st = false; for (let i = 0; i < 60 && !st; i++) { await pg.waitForTimeout(3000); st = await pg.evaluate(() => !!window.__started).catch(() => false); }
  ok(st, 'the page starts');
  const until = async (f, ms, arg) => { let v; for (let t = 0; t < ms; t += 400) { v = await pg.evaluate(f, arg); if (v) return v; await pg.waitForTimeout(400); } return v; };
  const shot = async n => { if (shots) { await pg.evaluate(() => { const L = document.getElementById('loading'); if (L) L.remove(); }); await pg.screenshot({ path: shots + '-' + n + '.png' }); } };
  if (st) {
    await pg.waitForTimeout(4000);
    await pg.evaluate(() => { if (window.WX) WX.hold = 'CLEAR'; __dbg.UI.setView('third'); window.__sent = []; ONLINE.send = m => __sent.push(m); });
    const own = await pg.evaluate(() => { const d = ARMSDBG(); return { n: d.W.length, owned: d.owned.length, held: d.W.every(id => WIELD.LIST.includes(id)) }; });
    ok(own.n === 15 && own.owned === 15 && own.held, 'every player owns the fifteen weapons, held from the pack (' + JSON.stringify(own) + ')');
    const aim = dn => pg.evaluate(d => { const h = SHARED.heading, v = { x: Math.sin(h), y: -d, z: Math.cos(h) }, l = Math.hypot(v.x, v.y, v.z); ARMS.aim = new __dbg.THREE.Vector3(v.x / l, v.y / l, v.z / l); }, dn);
    const place = k => pg.evaluate(k => { const P = __dbg.you(), h = SHARED.heading, M = ARMSDBG().M; ONLINE.feed({ t: 'mv', id: 'a', at: [P.x + Math.sin(h) * k * M, P.z + Math.cos(h) * k * M, SHARED.py, h + Math.PI, SHARED.LVL, ''] }); }, k);
    const hold = id => pg.evaluate(id => { WIELD.set(id); }, id);
    const up = () => until(() => !RAGON() && !(SHARED.stuck > 0) && !__dbg.VIT.out, 40000);
    const fire = async id => { await up(); return pg.evaluate(id => { ARMS.cd = {}; ONLINE.on = true; try { ARMS.fire(id); } finally { ONLINE.on = false; } ARMS.hold = false; }, id); };
    await pg.evaluate(() => { const P = __dbg.you(), h = SHARED.heading, M = ARMSDBG().M; ONLINE.feed({ t: 'hi', you: 'me', all: [{ id: 'a', name: 'ROSA', look: 'w00', at: [P.x + Math.sin(h) * 4 * M, P.z + Math.cos(h) * 4 * M, SHARED.py, h + Math.PI, SHARED.LVL, ''] }] }); });
    await until(() => { const o = ONLINE.others.get('a'); return o && o.fig && o.fig.g && o.fig.g.parent; }, 15000); await pg.waitForTimeout(1500);

    // the guns
    for (const id of ['w_revolver', 'w_shotgun', 'w_sniper', 'w_mgun', 'w_laser']) {
      await place(4); await hold(id); await pg.waitForTimeout(id === 'w_revolver' ? 3000 : 500); await aim(.06); await pg.evaluate(() => { __sent.length = 0; });
      let r = null; for (let i = 0; i < 4 && !r; i++) { await fire(id); await pg.waitForTimeout(300); r = await pg.evaluate(id => { const s = __sent.filter(m => m.t === 'shot' && m.to === 'a' && m.w === id), a = __sent.find(m => m.t === 'arm' && m.k === 'shot'); return s.length && a ? { d: s[0].d, kb: s[0].kb, dn: s[0].dn, ends: a.e.length } : null; }, id); }
      if (!r) r = { miss: await pg.evaluate(() => { const o = ONLINE.others.get('a'), g = WIELD.held(); return { last: ARMS.last, sent: __sent.slice(0, 4), a: o && o.p, fig: !!(o && o.fig && o.fig.g), me: __dbg.you(), py: SHARED.py, on: WIELD.on, g: !!g, rag: RAGON(), stuck: SHARED.stuck, out: __dbg.VIT.out, dead: __dbg.VIT.dead, frozen: SHARED.frozen }; }) };
      ok(r && !r.miss, 'the ' + id.slice(2) + ' hits the player in front (' + JSON.stringify(r) + ')');
      if (id === 'w_shotgun') await shot('shotgun');
    }
    await hold('w_laser'); await aim(.06); await pg.evaluate(() => { ARMS.cd = {}; ARMS.fire('w_laser'); ARMS.hold = false; }); await pg.waitForTimeout(60); await shot('laser'); await pg.evaluate(() => { ARMS.hold = false; });

    // the grenade: thrown down in front, it goes off; the player near it is hurt
    await place(2.5); await hold('w_grenade'); await pg.waitForTimeout(500); await aim(.9); await pg.evaluate(() => { __sent.length = 0; }); await fire('w_grenade');
    const flew = await until(() => ARMSDBG().P.find(p => p.id === 'w_grenade'), 2000);
    const gb = await until(() => { const s = __sent.filter(m => m.t === 'shot' && m.to === 'a' && m.w === 'w_grenade'); return s.length && !ARMSDBG().P.length ? { d: s[0].d, dn: s[0].dn } : null; }, 20000);
    ok(!!flew && !!gb, 'a grenade flies, goes off and hurts the player near it (' + JSON.stringify([flew, gb]) + ')');
    await pg.waitForTimeout(150); await shot('grenade');
    await pg.evaluate(() => { __dbg.VIT.hp = 1; }); await pg.waitForTimeout(3500);

    // the molotov: a fire where it lands
    const f0 = await pg.evaluate(() => BLAZE.F.length); await hold('w_molotov'); await pg.waitForTimeout(500); await aim(.5); await fire('w_molotov');
    const lit = await until(n => BLAZE.F.length > n ? BLAZE.F.length : 0, 15000, f0);
    ok(lit > f0, 'a molotov lights a fire where it lands (' + f0 + ' -> ' + lit + ')');
    await shot('molotov');

    // the net: the player in front is caught
    await place(4); await hold('w_net'); await pg.waitForTimeout(500); await aim(.02); await pg.evaluate(() => { __sent.length = 0; }); await fire('w_net');
    const caught = await until(() => { const s = __sent.find(m => m.t === 'shot' && m.to === 'a' && m.tr === 'net'), t = ARMSDBG().traps.find(x => x[0] === 'a'); return s && t ? { tt: s.tt, trap: t } : null; }, 10000);
    ok(!!caught, 'a net catches the player it hits (' + JSON.stringify(caught) + ')');
    await shot('net');

    // the bubble and the snowball fly
    for (const id of ['w_bubble', 'w_snowball', 'w_fireworks', 'w_rocket']) { await hold(id); await pg.waitForTimeout(300); await aim(id === 'w_fireworks' ? -.4 : .1); await fire(id); const f = await until(id => ARMSDBG().P.find(p => p.id === id), 1500, id); ok(!!f, 'the ' + id.slice(2) + ' fires (' + JSON.stringify(f) + ')'); if (id === 'w_fireworks') { await pg.waitForTimeout(1350); await shot('fireworks'); } }
    await pg.waitForTimeout(3000);

    // the mine: set in front, the player steps on it
    await place(8); await hold('w_mine'); await pg.waitForTimeout(400); await pg.evaluate(() => { __sent.length = 0; }); await fire('w_mine');
    const set = await pg.evaluate(() => ({ n: ARMSDBG().mines.length, s: __sent.some(m => m.t === 'arm' && m.k === 'mine') }));
    await until(() => ARMSDBG().mines.some(q => q.t > 1.6), 30000); await place(.9);
    const mb = await until(() => { const s = __sent.find(m => m.t === 'shot' && m.to === 'a' && m.w === 'w_mine'), b = !ARMSDBG().mines.length; return s && b ? { d: s.d, mines: ARMSDBG().mines.length } : null; }, 15000);
    ok(set.n === 1 && set.s && !!mb, 'a mine is set and goes off under the player who steps on it (' + JSON.stringify([set, mb]) + ')');
    await pg.evaluate(() => { __dbg.VIT.hp = 1; }); await pg.waitForTimeout(3500);

    // the leaf blower shoves the player in front
    await place(3); await hold('w_blower'); await pg.waitForTimeout(400); await aim(.1); await up(); await pg.evaluate(() => { __sent.length = 0; ARMS.hold = true; });
    const blown = await until(() => { const s = __sent.find(m => m.t === 'shot' && m.to === 'a' && m.w === 'w_blower'); return s ? { kb: s.kb, bits: ARMSDBG().bits } : null; }, 4000);
    ok(!!blown && blown.kb > 0, 'the leaf blower shoves the player in front (' + JSON.stringify(blown) + ')');
    await shot('blower'); await pg.evaluate(() => { ARMS.hold = false; });

    // the portals: blue in front, orange further on; stepping in one comes out of the other
    await pg.evaluate(() => ONLINE.feed({ t: 'out', id: 'a' })); await hold('w_portal'); await pg.waitForTimeout(400);
    await aim(.35); await fire('w_portal'); await pg.waitForTimeout(200); await aim(.12); await fire('w_portal'); await pg.waitForTimeout(300);
    const pr = await pg.evaluate(() => (ARMSDBG().portals.find(p => p[0] === 'me') || [])[1]);
    const seen = await pg.evaluate(() => (ARMS.portals.get('me') || []).every(p => p && LEVELS.drawn(p.m)));
    ok(seen, 'both portals are drawn where they opened');
    let tp = null; if (pr && pr[0] && pr[1]) { await pg.evaluate(p => __dbg.UI.goTo(p[0], p[2], p[1]), pr[0]); tp = await until(q => { const P = __dbg.you(); return Math.hypot(P.x - q[0], P.z - q[2]) < 2 ? [+P.x.toFixed(1), +P.z.toFixed(1)] : null; }, 10000, pr[1]); }
    ok(!!pr && !!pr[0] && !!pr[1] && !!tp, 'two portals open on the ground and stepping in one carries you to the other (' + JSON.stringify([pr, tp]) + ')');
    await shot('portal');
    await pg.evaluate(() => { for (const p of ARMS.portals.get('me') || []) if (p) p.t = 29.9; }); await pg.waitForTimeout(6000);
    const gone = await pg.evaluate(() => !ARMSDBG().portals.some(p => p[0] === 'me'));
    ok(gone, 'the portals close after 30 seconds');
    await pg.evaluate(() => { ARMS.aim = null; WIELD.set(null); });

    // their hits on you: hurt, and a net holds you still
    await pg.evaluate(() => ONLINE.feed({ t: 'hi', you: 'me', all: [{ id: 'b', name: 'MOE', look: 'w00', at: [0, 0, 0, 0, SHARED.LVL, ''] }] }));
    await up(); const hurt = await pg.evaluate(async () => { __dbg.VIT.hp = 1; const h0 = __dbg.VIT.hp; ONLINE.feed({ t: 'shot', id: 'b', w: 'w_revolver', d: .18, kb: .5, dn: 0, from: [0, 0] }); await new Promise(r => setTimeout(r, 200)); return { h0, h: __dbg.VIT.hp }; });
    ok(hurt.h < hurt.h0, 'their shot hurts you (' + JSON.stringify(hurt) + ')');
    await pg.waitForTimeout(1500);
    const n0 = await pg.evaluate(async () => { ONLINE.feed({ t: 'shot', id: 'b', w: 'w_net', d: 0, kb: 0, dn: 0, tr: 'net', tt: 4, from: [0, 0] }); await new Promise(r => setTimeout(r, 200)); const p = __dbg.you(); return { s: SHARED.stuck, x: p.x, z: p.z }; });
    await pg.keyboard.down('w'); await pg.waitForTimeout(1200); await pg.keyboard.up('w');
    const n1 = await pg.evaluate(() => { const p = __dbg.you(); return { s: SHARED.stuck, x: p.x, z: p.z }; });
    ok(n0.s > 0 && Math.hypot(n1.x - n0.x, n1.z - n0.z) < .05, 'their net holds you: you cannot walk till it ends (' + JSON.stringify([n0, n1]) + ')');
    await shot('netted');
    const free = await until(() => SHARED.stuck === 0 && !ARMSDBG().traps.length, 40000);
    ok(free, 'the net lets you go after a few seconds');

    // their shot, drawn from where they fired
    await up(); const drawn = await pg.evaluate(async () => { const P = __dbg.you(); ONLINE.feed({ t: 'arm', id: 'b', k: 'proj', w: 'w_snowball', p: [P.x + 3, SHARED.py + 1.5, P.z], v: [0, .2, 1] }); await new Promise(r => setTimeout(r, 100)); return ARMSDBG().P.filter(p => p.id === 'w_snowball').length; });
    ok(drawn > 0, 'another player\'s snowball is drawn flying (' + drawn + ')');
  }
  ok(!errs.length, 'no page errors (' + errs.slice(0, 3).join(' | ') + ')');
  await b.close(); if (fails.length) { console.log(fails.length + ' failed'); process.exit(1); } console.log('all passed');
})();
