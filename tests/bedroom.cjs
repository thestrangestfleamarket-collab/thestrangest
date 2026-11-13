// THE APARTMENT ROOM CHECK: node tests/bedroom.cjs dist/market.html. Your apartment as one open room: built with its things as real bodies, the near walls dropping away in the isometric view, the picture's green-grey void outside, the lamp and screens switching, the bed, bench and chairs to sit on, the drawers opening, the record turning; the CRT TV's channels; the kitchen with its fridge, stove and tap working; every loose thing clear of the walls (the fire escape's pots, out on the landing, aside).
const { chromium } = require('playwright'), path = require('path');
const fails = [], ok = (c, m) => { if (!c) { fails.push(m); console.log((process.env.GITHUB_ACTIONS ? '::error title=bedroom::' : 'FAIL ') + m); } else console.log('ok   ' + m); };
(async () => {
  const b = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const pg = await b.newPage({ viewport: { width: 960, height: 600 } }), errs = [];
  pg.on('pageerror', e => errs.push(e.message.slice(0, 300)));
  await pg.goto('file://' + path.resolve(process.argv[2] || 'dist/market.html') + '?fresh=1&furnished=1&hour=17&place=your%20apartment', { waitUntil: 'commit' });
  let st = false; for (let i = 0; i < 60 && !st; i++) { await pg.waitForTimeout(3000); st = await pg.evaluate(() => !!window.__started).catch(() => false); }
  ok(st, 'the page starts');
  if (st) {
    for (let i = 0; i < 30 && !(await pg.evaluate(() => window.BEDROOMDBG && BEDROOMDBG().built)); i++) await pg.waitForTimeout(1000);
    await pg.evaluate(() => { const b = __dbg.MAPK.MODS.apts.BED, B = SHARED.BOD; __dbg.UI.goTo(B.X(b.x0 + 2), B.Z(b.y0 + 2.4), SHARED.py); SHARED.yawTo = SHARED.yaw = Math.PI / 4; });
    await pg.waitForTimeout(2000);
    const d = await pg.evaluate(() => BEDROOMDBG());
    ok(d.built && d.loose >= 10, 'the room is built, its small things real bodies (' + d.loose + ')');
    const fy = await pg.evaluate(() => SHARED.BOD.Y(__dbg.MAPK.MODS.apts.RB + .15));
    ok(d.walls.length === 4 && d.walls.filter(w => w > 1e5).length >= 2 && d.walls.some(w => w < 1e5), 'in the isometric view the far walls stand and those between you and the eye drop away (owner, 12 Nov 2026: "walls should vanish when you\'re inside your apartment") (' + d.walls.map(w => w.toFixed(2)) + ')');
    const bg = await pg.evaluate(() => { const c = __dbg.scene.background; return c && c.isColor ? c.getHexString() : String(c); });   // 27 Oct: the house below and the live sky round your rooms, no longer the green-grey void
    ok(/^[0-9a-f]{6}$/.test(bg) && !(parseInt(bg.slice(0, 2), 16) < 16 && parseInt(bg.slice(2, 4), 16) < 21), 'outside is the live sky round your rooms, not the old green-grey void (' + bg + ')');
    { const m = await pg.evaluate(() => { const A = __dbg.MAPK.MODS.apts; let r = A.meshes[0]; while (r.parent) r = r.parent; const L = []; r.traverse(o => { if (o.name === 'merged' && o.userData.tri) { const g = o.geometry; L.push([(g.index ? g.index.count : g.attributes.position.count) / 3, o.userData.tri]); } }); return L; });
      ok(m.length && m.every(([a, b]) => a === b), 'the room\'s merged meshes keep every face of their pieces (owner, 13 Nov 2026: "missing triangles"): ' + m.filter(([a, b]) => a !== b).length + ' of ' + m.length + ' short'); }
    { const a = await pg.evaluate(() => window.AIRDBG && AIRDBG()); ok(a && a.on && a.bowl && a.shafts > 0 && a.motes, 'round your rooms a black void under the sky; a sun shaft for every window and dust in the air (owner, 13 Nov 2026): ' + JSON.stringify(a)); }
    const used = await pg.evaluate(async () => { const s0 = BEDPICDBG().screens, T = __dbg.UI.things.filter(t => /^(LAMP|MONITOR|TV):/.test(t.name)); for (const t of T) t.act(); await new Promise(r => setTimeout(r, 300)); return { n: T.length, d: BEDROOMDBG(), s0, s1: BEDPICDBG().screens }; });
    ok(used.n >= 4 && used.d.lamps.every((l, i) => l !== d.lamps[i]) && used.s0.length === 3 && used.s1.every((x, i) => x !== used.s0[i]), 'the lamp and the screens switch (' + JSON.stringify([d.lamps, used.s0]) + ' -> ' + JSON.stringify([used.d.lamps, used.s1]) + ')');
    const cl0 = await pg.evaluate(() => CEILDBG());
    ok(cl0.n === 0 && !cl0.thing && cl0.i.length === 0, 'no ceiling lights in the loft, no switch for them (owner, 13 Nov 2026) (' + JSON.stringify([cl0.n, cl0.thing]) + ')');
    ok(await pg.evaluate(() => !!(window.GPH && GPH.loose().some(i => i.k === 'o' && i.name === 'CHAIR'))), 'the chair is a loose thing you can push and pick up');
    ok(await pg.evaluate(() => ['SIT ON THE BED', 'SIT ON THE BENCH', 'PET THE CAT'].every(n => __dbg.UI.things.some(t => t.name === n))), 'you can sit on the bed and the bench, and pet the cat');
    const bp = await pg.evaluate(async () => { const b0 = BEDPICDBG(); for (const t of __dbg.UI.things.filter(t => /^(OPEN THE DRAWERS|RECORD PLAYER: OFF)$/.test(t.name))) t.act(); await new Promise(r => setTimeout(r, 300)); return { b0, b1: BEDPICDBG() }; });
    ok(bp.b0.built && bp.b0.drawers.length >= 3 && bp.b1.drawers.every(x => x) && bp.b1.record.every(x => x), 'the bedroom is built; its drawers open, the record turns (' + JSON.stringify({ d: bp.b1.drawers, r: bp.b1.record }) + ')');
    ok(await pg.evaluate(() => !window.KITCHENDBG && !__dbg.UI.things.some(t => /FRIDGE|STOVE|TAP:/.test(t.name))), 'no kitchen in the apartment (owner, 9 Nov 2026)');
    const inside = await pg.evaluate(() => { const A = __dbg.MAPK.MODS.apts.R, B = SHARED.BOD, x0 = Math.min(B.X(A.x0), B.X(A.x1)), x1 = Math.max(B.X(A.x0), B.X(A.x1)), z0 = Math.min(B.Z(A.y0), B.Z(A.y1)), z1 = Math.max(B.Z(A.y0), B.Z(A.y1));
      return LOOSE.list(true).filter(q => q.k === 'o' && q.c[2] > Math.min(B.Z(A.y0), B.Z(A.y1)) - .1 && (q.c[0] - q.h[0] < x0 || q.c[0] + q.h[0] > x1 || q.c[2] - q.h[2] < z0 || q.c[2] + q.h[2] > z1)).map(q => q.name); });
    ok(!inside.length && d.loose >= 40, 'every loose thing starts clear of the walls, so the walls stay solid to it (' + d.loose + ' things; in a wall: ' + inside.join(',') + ')');
    const tv = await pg.evaluate(async () => { const t = __dbg.UI.things.find(t => /^CRT TV/.test(t.name)); if (!t) return null; t.act(); for (let i = 0; i < 20 && !CRTDBG().data; i++) await new Promise(r => setTimeout(r, 250));
      const a = CRTDBG(); document.querySelector('#crtp button[data-a=on]').click(); const b = CRTDBG(); document.querySelector('#crtp button[data-c="4"]').click(); const c = CRTDBG();
      const v = document.querySelector('#crtp input[data-k=vol]'); v.value = 80; v.dispatchEvent(new Event('input', { bubbles: true })); const d = CRTDBG(); document.querySelector('#crtp button[data-a=off]').click(); const e = CRTDBG(); CRT.close();
      return { a, b, c, d, e, n: CRT.data.channels.map(c => c.shows.length) }; });
    ok(tv && tv.a.panel && tv.a.data && tv.a.unit, 'the CRT TV stands in the room; a double click opens its panel and loads the channels only then (' + JSON.stringify(tv && tv.n) + ')');
    ok(tv && tv.b.on && /\.mp4$/.test(tv.b.src) && tv.c.ch === 4 && tv.c.src !== tv.b.src && Math.abs(tv.d.vol - .8) < .01 && !tv.e.on && !tv.e.src, 'it turns on to a cartoon, changes channel, sets the volume, turns off (' + JSON.stringify(tv && [tv.b.src, tv.c.src]) + ')');
    const err = await pg.evaluate(() => Object.entries(SYS.P).flatMap(([k, v]) => v.filter(s => s.err).map(s => k + ':' + s.name)));
    ok(!err.length, 'no SYS errors (' + err.join(',') + ')');
  }
  ok(!errs.length, 'no page errors' + (errs.length ? ': ' + errs.slice(0, 3).join(' | ') : ''));
  await b.close();
  console.log(fails.length ? fails.length + ' failed' : 'all bedroom checks passed');
  process.exit(fails.length ? 1 : 0);
})();
