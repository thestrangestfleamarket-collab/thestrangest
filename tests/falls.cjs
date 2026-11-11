// THE FALLS CHECK (src/089b-falls.js): node tests/falls.cjs [dist/market.html] [shots dir]. The falls build with the park; the pool is under water and you swim in it; the rod knows it;
// the rock face stops you, the mossy stairs take you up, the jump rock drops you into deep water, the ledge behind the falls is dry; the rope swing carries you out and lets go over the pool.
const { chromium } = require('playwright'), path = require('path'), fs = require('fs');
const fails = [], ok = (c, m) => { if (!c) { fails.push(m); console.log((process.env.GITHUB_ACTIONS ? '::error title=falls::' : 'FAIL ') + m); } else console.log('ok   ' + m); };
const SHOTS = process.argv[3];
(async () => {
  const b = await chromium.launch({ ...(process.env.PWCHROME ? { executablePath: process.env.PWCHROME } : {}), args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const pg = await b.newPage({ viewport: { width: 960, height: 600 } }), errs = [];
  pg.setDefaultTimeout(900000); pg.on('pageerror', e => errs.push(e.message.slice(0, 300)));
  await pg.goto('file://' + path.resolve(process.argv[2] || 'dist/market.html') + '?fresh=1&hour=13&wx=clear', { waitUntil: 'commit' });
  let up = false; for (let i = 0; i < 100 && !up; i++) { await pg.waitForTimeout(3000); up = await pg.evaluate(() => !!window.__started).catch(() => false); }
  ok(up, 'the page starts');
  const ev = (f, a) => pg.evaluate(f, a);
  const wait = async (f, ms = 60000, a) => { for (let t = 0; t < ms; t += 500) { if (await ev(f, a).catch(() => false)) return true; await pg.waitForTimeout(500); } return false; };
  const shot = async n => { if (SHOTS) { fs.mkdirSync(SHOTS, { recursive: true }); await pg.waitForTimeout(1500); await pg.screenshot({ path: path.join(SHOTS, n + '.png'), timeout: 300000 }).catch(() => {}); } };
  // stand at map tiles (x, y), face map tiles (tx, ty), the camera behind
  const at = (x, y, tx, ty, o = {}) => ev(([x, y, tx, ty, o]) => { const M = __dbg.MAPK, P = M.PARK, X = M.BOD.XS(x + P.ox), Z = M.BOD.ZS(y + P.oy), h = Math.atan2(M.BOD.XS(tx + P.ox) - X, M.BOD.ZS(ty + P.oy) - Z);
    if (!o.stay) STORE.goTo(X, Z, 'up'); __dbg.UI.setView(o.view || 'third'); if (o.dist) __dbg.UI.dist = o.dist; SHARED.heading = h; SHARED.yaw = SHARED.yawTo = h + Math.PI; SHARED.pitch = SHARED.pitchTo = o.pitch ?? -.2; }, [x, y, tx, ty, o]);
  const me = () => ev(() => { const M = __dbg.MAPK, P = M.PARK, p = __dbg.pos(); return { x: M.BOD.MX(p[0]) - P.ox, y: M.BOD.MY(p[2]) - P.oy, m: p[1] / (__dbg.cv().TILE / .84), swim: !!(__dbg.ST.water && __dbg.ST.water.in), ride: RIDE.on || null }; });
  const hold = async (k, ms) => { await pg.keyboard.down(k); await pg.waitForTimeout(ms); await pg.keyboard.up(k); };
  // (software drawing runs at a frame or two a second: hold a key until what should happen happens, or the time runs out)
  const holdTill = async (k, f, ms, a) => { await pg.keyboard.down(k); const r = await wait(f, ms, a); await pg.keyboard.up(k); await pg.waitForTimeout(800); return r; };
  if (up) {
    await ev(() => { const M = __dbg.MAPK, P = M.PARK; STORE.goTo(M.BOD.XS(195 + P.ox), M.BOD.ZS(86 + P.oy), 'up'); });
    ok(await wait(() => window.FALLS && FALLS.ready, 240000), 'in the park, the falls are built');
    const F = await ev(() => ({ C: FALLS.C, R: FALLS.R, LIP: FALLS.LIP, JA: FALLS.JA, tris: FALLS.tris, WL: FALLS.WL, ledges: (__dbg.MAPK.MODS.ledges || []).map(l => l.lv), hole: __dbg.MAPK.PARK.wetHole().length }));
    console.log('     ', JSON.stringify(F));
    ok(F.tris > 10000 && F.tris < 120000, 'the falls cost ' + Math.round(F.tris) + ' triangles (10k to 120k)');
    ok(F.ledges.includes('up') && F.ledges.includes('down'), 'a ledge too high stops you, up here and underground (MODS.ledges: ' + F.ledges + ')');
    const deep = await ev(([x, y]) => { const M = __dbg.MAPK, P = M.PARK; return M.MODS.hill(M.BOD.XS(x + P.ox), M.BOD.ZS(y + P.oy)) / (__dbg.cv().TILE / .84); }, F.C);
    ok(deep < -3, 'the pool is deep in the middle (' + deep.toFixed(2) + ' m)');
    ok(await ev(([x, y]) => { const M = __dbg.MAPK, P = M.PARK, w = FISHING.at(M.BOD.XS(x + P.ox), M.BOD.ZS(y + P.oy)); return !!w && w.kind === 'lake'; }, F.C), 'the rod knows the pool as still water');
    // into the pool from the east shore
    const sx = F.C[0] + F.R + 3, sy = F.C[1] - 2;
    await at(sx, sy, F.C[0], F.C[1], { pitch: -.12 }); await pg.waitForTimeout(6000); await shot('1-shore');
    await at(sx, sy, F.C[0], F.C[1], { stay: 1 }); await holdTill('w', () => !!(__dbg.ST.water && __dbg.ST.water.in), 120000); let m = await me();
    ok(m.swim, 'walking west off the shore you swim in the pool (' + JSON.stringify(m) + ')');
    // the face stops you: from the ledge behind the falls, walk into the rock
    const [lx, ly] = await ev(() => { const C = FALLS.C, a = .35; for (let r = 6; r < 16; r += .1) { const x = C[0] - Math.cos(a) * r, y = C[1] + Math.sin(a) * r, h = FALLS.drawH(x, y); if (FALLS.cutD(x, y) > -1.1 && h > FALLS.WL + .2 && h < .6) return [x, y]; } return [0, 0]; });
    await at(lx, ly, lx - 10, ly); await pg.waitForTimeout(3000); const l0 = await me();
    ok(!l0.swim && l0.m > F.WL && l0.m < 1, 'the ledge behind the falls is dry, just above the water (' + l0.m.toFixed(2) + ' m)');
    await at(lx, ly, lx - 10, ly, { stay: 1 }); await holdTill('w', ([x]) => { const M = __dbg.MAPK; return M.BOD.MX(__dbg.pos()[0]) - M.PARK.ox < x - 5; }, 40000, [lx]); m = await me();
    ok(m.m < 2 && m.x > lx - 4.5, 'the rock face stops you (' + JSON.stringify(m) + ')');
    await at(lx, ly, F.C[0] + 6, F.C[1], { stay: 1, pitch: .05 }); await pg.waitForTimeout(2500); await shot('2-behind');
    // up the mossy stairs
    const st0 = await ev(() => FALLS.FP);
    await at(186.5, 103.4, 150, 103.4); await pg.waitForTimeout(3000); await at(186.5, 103.4, 150, 103.4, { stay: 1 });
    await holdTill('w', () => __dbg.pos()[1] / (__dbg.cv().TILE / .84) > 12, 300000); m = await me();
    ok(m.m > 10, 'the mossy stairs take you up (' + m.m.toFixed(1) + ' m at x ' + m.x.toFixed(1) + ')');
    await at(m.x, m.y, F.C[0], F.C[1] - 2, { stay: 1, pitch: -.35 }); await pg.waitForTimeout(2500); await shot('3-stairs');
    // the jump rock: off its tip into the deep water
    const J = await ev(() => { const C = FALLS.C, a = FALLS.JA, d = [-Math.cos(a), Math.sin(a)]; return { x0: C[0] + d[0] * 14.5, y0: C[1] + d[1] * 14.5, x1: C[0] + d[0] * 2, y1: C[1] + d[1] * 2 }; });
    await at(J.x0, J.y0, J.x1, J.y1); await pg.waitForTimeout(3000); const j0 = await me();
    ok(j0.m > 10, 'the jump rock stands high over the pool (' + j0.m.toFixed(1) + ' m)');
    await at(J.x0, J.y0, J.x1, J.y1, { stay: 1, pitch: -.4 }); await pg.waitForTimeout(1500); await shot('4-jump');
    await holdTill('w', () => !!(__dbg.ST.water && __dbg.ST.water.in), 120000); await pg.waitForTimeout(2000); m = await me();
    ok(m.swim, 'off its tip you drop into the deep water (' + JSON.stringify(m) + ')');
    // the rope swing: grab it on the shore, it carries you out, SPACE lets go over the water
    const S = await ev(() => { const s = FALLS.swing, M = __dbg.MAPK, P = M.PARK; return { x: M.BOD.MX(s.piv.x) - P.ox, y: M.BOD.MY(s.piv.z) - P.oy }; });
    await at(S.x + 1.5, S.y - .8, S.x, S.y); await pg.waitForTimeout(2500);
    await ev(() => { const t = __dbg.UI.things.find(t => t.name === 'THE ROPE SWING'); t.act(); });
    ok((await me()).ride === 'ropeswing', 'double-clicking the rope swing, you hold on');
    await pg.waitForTimeout(1400); await shot('5-swing'); await pg.waitForTimeout(400);
    await hold(' ', 1500); await wait(() => !RIDE.on && !!(__dbg.ST.water && __dbg.ST.water.in), 60000); m = await me();
    ok(!m.ride && m.swim, 'you let go and drop into the pool (' + JSON.stringify(m) + ')');
    // the bats: the falls' roost has its own, out at dark (the creatures' bats)
    ok(await wait(() => __dbg.NPCS.filter(n => n.key === 'bat').length >= 4, 120000), 'four bats keep the falls\' roost (' + await ev(() => __dbg.NPCS.filter(n => n.key === 'bat').length) + ')');
    // a cairn on the lip: double click it and a stone goes on, the same count for everyone (world cairn:0)
    const c0 = await ev(() => FALLS.cairns[0] && FALLS.cairns[0].h);
    await ev(() => __dbg.UI.things.find(t => t.name === 'A CAIRN').act());
    const c1 = await ev(() => ({ h: FALLS.cairns[0].h, n: FALLS.cairns[0].n, w: (ONLINE.world || {})['cairn:0'] }));
    ok(c1.n === 1 && c1.h > c0 && +c1.w === 1, 'setting a stone raises the cairn and counts it for the section (' + JSON.stringify(c1) + ')');
  }
  ok(!errs.length, 'no page errors' + (errs.length ? ': ' + errs.slice(0, 4).join(' | ') : ''));
  await b.close(); console.log(fails.length ? fails.length + ' FAILED' : 'all ok'); process.exit(fails.length ? 1 : 0);
})();
