// THE APARTMENT ROOM CHECK: node tests/bedroom.cjs dist/market.html. Your apartment as one open room: built with its things as real bodies, the near walls down in the isometric view, the picture's green-grey void outside, the lamp and screens switching, the bed, bench and chairs to sit on, the drawers opening, the record turning; the kitchen with its fridge, stove and tap working; every loose thing clear of the walls (the fire escape's pots, out on the landing, aside).
const { chromium } = require('playwright'), path = require('path');
const fails = [], ok = (c, m) => { if (!c) { fails.push(m); console.log((process.env.GITHUB_ACTIONS ? '::error title=bedroom::' : 'FAIL ') + m); } else console.log('ok   ' + m); };
(async () => {
  const b = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const pg = await b.newPage({ viewport: { width: 960, height: 600 } }), errs = [];
  pg.on('pageerror', e => errs.push(e.message.slice(0, 300)));
  await pg.goto('file://' + path.resolve(process.argv[2] || 'dist/market.html') + '?fresh=1&hour=17&place=your%20apartment', { waitUntil: 'commit' });
  let st = false; for (let i = 0; i < 60 && !st; i++) { await pg.waitForTimeout(3000); st = await pg.evaluate(() => !!window.__started).catch(() => false); }
  ok(st, 'the page starts');
  if (st) {
    for (let i = 0; i < 30 && !(await pg.evaluate(() => window.BEDROOMDBG && BEDROOMDBG().built)); i++) await pg.waitForTimeout(1000);
    await pg.evaluate(() => { const b = __dbg.MAPK.MODS.apts.BED, B = SHARED.BOD; __dbg.UI.goTo(B.X(b.x0 + 2), B.Z(b.y0 + 2.4), SHARED.py); SHARED.yawTo = SHARED.yaw = Math.PI / 4; });
    await pg.waitForTimeout(2000);
    const d = await pg.evaluate(() => BEDROOMDBG());
    ok(d.built && d.loose >= 10, 'the room is built, its small things real bodies (' + d.loose + ')');
    const fy = await pg.evaluate(() => SHARED.BOD.Y(__dbg.MAPK.MODS.apts.RB + .15));
    ok(d.walls.filter(w => w < fy + .1).length === 2 && d.walls.filter(w => w > 1e5).length === 2, 'in the isometric view the two walls nearest the camera are down, the far two stand (' + d.walls.map(w => w.toFixed(2)) + ')');
    ok(d.sky === false && await pg.evaluate(() => { const c = __dbg.scene.background; return c.r < .06 && c.g > c.r && c.g < .08; }), 'outside is the picture\'s deep green-grey in the isometric view; the sky shows only in the windows');
    const used = await pg.evaluate(async () => { const s0 = BEDPICDBG().screens, T = __dbg.UI.things.filter(t => /^(LAMP|MONITOR|TV):/.test(t.name)); for (const t of T) t.act(); await new Promise(r => setTimeout(r, 300)); return { n: T.length, d: BEDROOMDBG(), s0, s1: BEDPICDBG().screens }; });
    ok(used.n >= 4 && used.d.lamps.every((l, i) => l !== d.lamps[i]) && used.s0.length === 3 && used.s1.every((x, i) => x !== used.s0[i]), 'the lamp and the screens switch (' + JSON.stringify([d.lamps, used.s0]) + ' -> ' + JSON.stringify([used.d.lamps, used.s1]) + ')');
    ok(await pg.evaluate(() => !!(window.GPH && GPH.loose().some(i => i.k === 'o' && i.name === 'CHAIR'))), 'the chair is a loose thing you can push and pick up');
    ok(await pg.evaluate(() => ['SIT ON THE BED', 'SIT ON THE BENCH', 'PET THE CAT'].every(n => __dbg.UI.things.some(t => t.name === n))), 'you can sit on the bed and the bench, and pet the cat');
    const bp = await pg.evaluate(async () => { const b0 = BEDPICDBG(); for (const t of __dbg.UI.things.filter(t => /^(OPEN THE DRAWERS|RECORD PLAYER: OFF)$/.test(t.name))) t.act(); await new Promise(r => setTimeout(r, 300)); return { b0, b1: BEDPICDBG() }; });
    ok(bp.b0.built && bp.b0.drawers.length >= 3 && bp.b1.drawers.every(x => x) && bp.b1.record.every(x => x), 'the bedroom is built; its drawers open, the record turns (' + JSON.stringify({ d: bp.b1.drawers, r: bp.b1.record }) + ')');
    const k = await pg.evaluate(async () => { const k0 = KITCHENDBG(); for (const n of ['OPEN THE FRIDGE', 'STOVE: OFF', 'TAP: OFF']) { const t = __dbg.UI.things.find(t => t.name === n); if (t) t.act(); } await new Promise(r => setTimeout(r, 300)); return { k0, k1: KITCHENDBG() }; });
    ok(k.k0.built && !k.k0.fridge && k.k1.fridge && k.k1.stove && k.k1.tap, 'the kitchen is built; the fridge opens, the stove lights, the tap runs (' + JSON.stringify(k) + ')');
    ok(k.k0.meshes < 120, 'the kitchen\'s pieces are each baked into a few meshes (' + k.k0.meshes + ')');
    const inside = await pg.evaluate(() => { const A = __dbg.MAPK.MODS.apts.R, B = SHARED.BOD, x0 = Math.min(B.X(A.x0), B.X(A.x1)), x1 = Math.max(B.X(A.x0), B.X(A.x1)), z0 = Math.min(B.Z(A.y0), B.Z(A.y1)), z1 = Math.max(B.Z(A.y0), B.Z(A.y1));
      return LOOSE.list(true).filter(q => q.k === 'o' && q.c[2] > Math.min(B.Z(A.y0), B.Z(A.y1)) - .1 && (q.c[0] - q.h[0] < x0 || q.c[0] + q.h[0] > x1 || q.c[2] - q.h[2] < z0 || q.c[2] + q.h[2] > z1)).map(q => q.name); });
    ok(!inside.length && d.loose >= 40, 'every loose thing starts clear of the walls, so the walls stay solid to it (' + d.loose + ' things; in a wall: ' + inside.join(',') + ')');
    const err = await pg.evaluate(() => Object.entries(SYS.P).flatMap(([k, v]) => v.filter(s => s.err).map(s => k + ':' + s.name)));
    ok(!err.length, 'no SYS errors (' + err.join(',') + ')');
  }
  ok(!errs.length, 'no page errors' + (errs.length ? ': ' + errs.slice(0, 3).join(' | ') : ''));
  await b.close();
  console.log(fails.length ? fails.length + ' failed' : 'all bedroom checks passed');
  process.exit(fails.length ? 1 : 0);
})();
