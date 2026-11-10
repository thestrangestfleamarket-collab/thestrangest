// THE WATER CHECK: node tests/water.cjs dist/market.html. One water (FLOW, 065a): the Hudson, the big lake and the stream share the simulation; still water stays still,
// a splash makes waves, a swimmer is carried; the fish (FISHES, 141f) swim in each water, the catch and the colourful ones; the deep holes, dark below without a light or a glowcap.
const { chromium } = require('playwright'), path = require('path');
const fails = [], ok = (c, m) => { if (!c) { fails.push(m); console.log((process.env.GITHUB_ACTIONS ? '::error title=water::' : 'FAIL ') + m); } else console.log('ok   ' + m); };
(async () => {
  const b = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const pg = await b.newPage({ viewport: { width: 640, height: 400 } }), errs = [];
  pg.on('pageerror', e => errs.push(e.message.slice(0, 300))); pg.on('console', m => { if (/^SYS /.test(m.text())) errs.push(m.text().slice(0, 300)); });
  await pg.goto('file://' + path.resolve(process.argv[2] || 'dist/market.html') + '?fresh=1&hour=13&res=1', { waitUntil: 'commit' });
  await pg.waitForFunction(() => window.__started, null, { timeout: 300000 });
  const wait = (f, a, t = 180000) => pg.waitForFunction(f, a, { timeout: t, polling: 250 });
  for (let k = 0; k < 4; k++) { await wait(() => !FADE.busy).catch(() => {}); await pg.evaluate(() => { if (!RIVER.on) STORE.goTo(SHARED.BOD.XS(61), SHARED.BOD.ZS(-118), 'up'); });
    if (await wait(() => window.RIVER && RIVER.on && !FADE.busy, null, 90000).then(() => 1, () => 0)) break; }
  await pg.evaluate(() => { const T = __dbg.cv().TILE, B = RIVER.box, m = RIVER.mouth; STORE.goTo(m.x + 6 * T, B.z1 - 8 * T, 'up'); });
  await wait(() => !FADE.busy); await wait(() => RIVER.swim && FLOW.on.value && FLOW.stats.steps > 40, null, 240000).catch(() => {});
  const r1 = await pg.evaluate(() => ({ names: FLOW.waters.map(w => w.name), on: FLOW.on.value, steps: FLOW.stats.steps, rip: RIVER.U.uRipOn.value, peek: FLOW.peek(__dbg.renderer), cur: FLOW.cur.ok }));
  ok(r1.names.includes('hudson') && r1.on && r1.rip, 'the Hudson runs in the one water round you: ' + JSON.stringify(r1));
  ok(r1.peek && r1.peek.wet > 1000 && r1.peek.speed < 1 && r1.peek.rise < .5, 'the water at rest stays still (no runaway flow or rise): ' + JSON.stringify(r1.peek));
  ok(r1.cur, 'a swimmer reads the water where they are (its rise and its flow)');
  const r2 = await pg.evaluate(async () => { const T = __dbg.cv().TILE, p = __dbg.pos(), a = FLOW.peek(__dbg.renderer); for (let i = 0; i < 6; i++) FLOW.drop(p[0] + 3 * T, p[2] - 3 * T, .8 * T, .3 * FLOW.WU);
    const s0 = FLOW.stats.steps; while (FLOW.stats.steps < s0 + 8) await new Promise(r => setTimeout(r, 50)); return { a, b: FLOW.peek(__dbg.renderer) }; });
  ok(r2.b.rise > r2.a.rise + .02 || r2.b.speed > r2.a.speed + .05, 'a splash sends waves out: ' + JSON.stringify(r2));
  await wait(() => FISHES.ready && FISHES.list.length >= 8, null, 240000).catch(() => {});
  const r3 = await pg.evaluate(() => { const ids = [...new Set(FISHES.list.map(f => f.id))]; return { n: FISHES.list.length, ids, models: FISHES.ids.length, koi: ['koi', 'koi_gold', 'koi_showa', 'goldfish'].every(k => FISHES.ids.includes(k)), catchRiver: ids.filter(i => i.startsWith('x_')).every(i => ITEMS.prop(i, 'water') === 'river'), sizes: FISHES.list.map(f => +(f.L / FLOW.WU).toFixed(2)) }; });
  ok(r3.n >= 8 && r3.ids.some(i => i.startsWith('x_')) && r3.catchRiver && r3.models >= 30 && r3.koi, 'fish swim in the Hudson, the catch among them (the river\'s own) and the colourful ones; every kind has its model: ' + JSON.stringify(r3));
  ok(Math.max(...r3.sizes) > 1.6 * Math.min(...r3.sizes), 'small fish and big fish: ' + JSON.stringify(r3.sizes));
  const r4 = await pg.evaluate(() => { const B = RIVER.box; let d = 0; for (let x = B.x0; x < B.x1; x += 2) for (let f = .3; f < .9; f += .05) d = Math.max(d, RIVER.depthAt(x, B.z1 - (B.z1 - B.z0) * f));
    const see = dm => { const s = FLOW.see(dm, 30); return [+s.k.toFixed(3), +s.far.toFixed(1)]; }; const l0 = EQUIP.light; const top = see(1), deep = see(60); EQUIP.light = true; const lamp = see(60); EQUIP.light = l0;
    FORAGE.give('glowcap'); FORAGE.eat('glowcap'); const glow = see(60), dark = FORAGE.S.fx.dark; delete FORAGE.S.fx.dark;
    return { d: +d.toFixed(0), top, deep, lamp, glow, dark, item: ITEMS.prop('glowcap', 'darksight') }; });
  ok(r4.d > 100, 'the Hudson goes very deep in places: ' + r4.d + ' m');
  ok(r4.deep[0] < r4.top[0] * .2 && r4.deep[1] < 3 && r4.lamp[1] > r4.deep[1] * 3 && r4.glow[1] > r4.lamp[1] && r4.dark > 0 && r4.item > 0, 'deep down it is dark; a headlight lights round you, a glowcap lets you see far: ' + JSON.stringify(r4));
  const r6 = await pg.evaluate(() => { const THREE = __dbg.THREE, T = __dbg.cv().TILE, B = RIVER.box, rc = new THREE.Raycaster(), out = []; rc.camera = SHARED.cam;   // the scene has sprites (lamp halos, name tags): a raycast needs the camera for them
    for (const d of [5, 40, 150]) { rc.set(new THREE.Vector3(PIER.x, 300 * T, B.z0 - d * T), new THREE.Vector3(0, -1, 0)); const h = rc.intersectObjects(__dbg.scene.children, true).find(h => { for (let p = h.object; p; p = p.parent) if (!p.visible) return false; return true; }); out.push(h && h.object === __dbg.MAPK.MODS.land ? 'land' : h ? 'other' : 'none'); } return out; });
  ok(!r6.includes('land'), 'no land past the Hudson: open water out to the skyline: ' + JSON.stringify(r6));
  // the big lake: its deep holes, its fish (koi and goldfish among them)
  await pg.evaluate(() => { const M = __dbg.MAPK, P = M.PARK, S = FOUNT.S, L = S.L; const H = FOUNT.HOLES[0]; STORE.goTo(M.BOD.XS(H[0] + (P.ox || 0)), M.BOD.ZS(H[1] + 6 + (P.oy || 0)), 'up'); });
  await wait(() => !FADE.busy).catch(() => {}); await wait(() => window.FOUNT && FOUNT.ready && FISHES.list.some(f => f.w.name !== 'hudson'), null, 300000).catch(() => {});
  await wait(() => FLOW.on.value, null, 60000).catch(() => {});
  const r5 = await pg.evaluate(() => { const M = __dbg.MAPK, P = M.PARK, S = FOUNT.S, L = S.L, H = FOUNT.HOLES[0], x = M.BOD.XS(H[0] + (P.ox || 0)), z = M.BOD.ZS(H[1] + (P.oy || 0)), T = __dbg.cv().TILE;
    const b = FOUNT.bedAt(x, z); const lake = [...new Set(FISHES.list.filter(f => f.w.kind === 'lake').map(f => f.id))]; return { deep: b == null ? null : +((FOUNT.LV - b) * .84 / T).toFixed(1), lake, own: lake.every(i => !i.startsWith('x_') || ITEMS.prop(i, 'water') === 'lake'), names: FLOW.waters.map(w => w.name), on: FLOW.on.value }; });
  ok(r5.deep > 15, 'the big lake has a very deep hole: ' + r5.deep + ' m');
  ok(['hudson', 'lake', 'brook'].every(n => r5.names.includes(n)) && r5.on, 'the big lake and the stream join the same one water: ' + JSON.stringify(r5.names));
  ok(r5.lake.length >= 2 && r5.own, 'the lake has its own fish (its catch, koi, goldfish): ' + JSON.stringify(r5.lake));
  ok(!errs.length, 'no page errors' + (errs.length ? ': ' + errs.slice(0, 3).join(' | ') : ''));
  await b.close(); console.log(fails.length ? fails.length + ' failed' : 'all water checks passed'); process.exit(fails.length ? 1 : 0);
})();
