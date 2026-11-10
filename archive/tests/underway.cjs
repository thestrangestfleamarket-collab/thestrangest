// THE UNDERWAY CHECK: node tests/underway.cjs dist/market.html [shots dir]. The cavern from the Hudson to the park lake: nothing of it is built at the start; its mouths wait in the river and the lake and ask for air; in from the river you are under water (the silt run), the air pocket lets you surface, the dry gallery you walk and its glints give a stone once a day, and you come out through the lake; out again it is all dropped. Also the wreck's chests on the Hudson bed.
const { chromium } = require('playwright'), path = require('path'), fs = require('fs');
const fails = [], ok = (c, m) => { if (!c) { fails.push(m); console.log((process.env.GITHUB_ACTIONS ? '::error title=underway::' : 'FAIL ') + m); } else console.log('ok   ' + m); };
const SHOTS = process.argv[3];
(async () => {
  const b = await chromium.launch({ ...(process.env.PWCHROME ? { executablePath: process.env.PWCHROME } : {}), args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const pg = await b.newPage({ viewport: { width: 960, height: 600 } }), errs = [];
  pg.on('pageerror', e => errs.push(e.message.slice(0, 300)));
  await pg.goto('file://' + path.resolve(process.argv[2] || 'dist/market.html') + '?fresh=1&hour=13&at=112,-112', { waitUntil: 'commit' });
  let st = false; for (let i = 0; i < 60 && !st; i++) { await pg.waitForTimeout(3000); st = await pg.evaluate(() => !!window.__started).catch(() => false); }
  ok(st, 'the page starts');
  const wait = async (f, ms = 60000, a) => { for (let t = 0; t < ms; t += 500) { if (await pg.evaluate(f, a).catch(() => false)) return true; await pg.waitForTimeout(500); } return false; };
  const shot = async n => { if (SHOTS) { fs.mkdirSync(SHOTS, { recursive: true }); await pg.waitForTimeout(1200); await pg.screenshot({ path: path.join(SHOTS, n + '.png') }); } };
  if (st) {
    ok(await pg.evaluate(() => !UNDERWAY.built), 'nothing of the Underway is built at the start');
    // the wreck
    ok(await wait(() => window.WRECK && WRECK.built), 'the wreck lies on the Hudson bed: ' + JSON.stringify(await pg.evaluate(() => window.WRECKDBG && WRECKDBG())));
    const w = await pg.evaluate(() => { const C = WRECK.chests[0], c0 = INV.cash; C.th.act(); const a = { got: INV.cash - c0, empty: !INV.ready(C.k) }; const c1 = INV.cash; C.th.act(); a.again = INV.cash - c1; return a; });
    ok(w.got >= 10 && w.empty && w.again === 0, 'a sunken chest gives coins and a stone, once a day: ' + JSON.stringify(w));
    // diving: SPACE held once carries you down past the river's loading, the view drops to your own eyes, and a chest on the bed is the thing in front of you when you reach it
    await pg.evaluate(() => { for (const id of ['goggles', 'headlight', 'scuba']) { INV.add(id, 1); EQUIP.wear(id, true); } SYS.run('rent', 'scuba'); const C = WRECK.chests[0].G.position; STORE.goTo(C.x, C.z, 'up'); });
    await wait(() => RIVER.swim, 60000); await pg.mouse.click(480, 300); await pg.keyboard.down(' ');
    const held = await wait(() => RIVER.dep > 3.5, 120000); await pg.keyboard.up(' ');
    ok(held, 'one held SPACE dives on past the river loading (a fade keeps the keys you hold)');
    ok(await pg.evaluate(() => __dbg.UI.view === 'first'), 'a dive takes the view: under the water you see through your own eyes');
    for (let t = 0; t < 80; t++) { const g = await pg.evaluate(() => { const W = __dbg.ST.water, gap = RIVER.bot - RIVER.dep - 1; if (W && SWIM.d != null && gap > 0) { const k = Math.min(60, gap * 6); W.y -= k; SWIM.d += k; } return gap; }); if (g < .5) break; await pg.waitForTimeout(400); }
    const near = await pg.evaluate(() => { const t = __dbg.UI.nearThing(); return { name: t && t.name, dep: +RIVER.dep.toFixed(1), bot: +RIVER.bot.toFixed(1) }; });
    ok(near.name && /SUNKEN CHEST/.test(near.name), 'dived down beside a sunken chest, it is the thing to double-click: ' + JSON.stringify(near));
    const hull = await pg.evaluate(() => ({ solid: WRECK.solid, walls: WRECK.walls.length, inSol: WRECK.walls.filter(r => SHARED.solids.includes(r)).length, you: !!(__dbg.UI.nearThing() && __dbg.UI.nearThing().name === 'YOU') }));
    ok(hull.solid && hull.inSol === hull.walls && hull.walls > 50, 'down among the wreck its planks, cabin and cargo are solid to swim against: ' + JSON.stringify(hull));
    ok(!hull.you, 'through your own eyes you are not the thing in front of you (no DOUBLE-CLICK YOU under water)');
    await pg.keyboard.down('Shift'); for (let t = 0; t < 80; t++) { const d = await pg.evaluate(() => { const W = __dbg.ST.water; if (W && RIVER.dep > 3) { const k = Math.min(60, (RIVER.dep - 2) * 6); W.y += k; if (SWIM.d != null) SWIM.d = Math.max(30, SWIM.d - k); } return RIVER.dep; }); if (d <= 3) break; await pg.waitForTimeout(400); }   // (this machine's frame rate swims slowly: up near the top, then swim the rest)
    await wait(() => SWIM.d == null, 120000); await pg.keyboard.up('Shift');
    ok(await wait(() => __dbg.UI.view === 'iso', 20000), 'back at the surface, the overhead view again');
    ok(await pg.evaluate(() => !WRECK.solid && !WRECK.walls.some(r => SHARED.solids.includes(r))), 'above the wreck again, its planks no longer stand in the way');
    // the river mouth asks for air, then lets a diver in
    await wait(() => window.UNDERWAYAT && UNDERWAYAT.river, 60000);
    const gate = await pg.evaluate(() => { const t = __dbg.UI.things.find(t => /DROWNED GATE/.test(t.name)), t2 = __dbg.UI.things.find(t => /LAKE RISE/.test(t.name)); return { river: !!t, lake: !!t2 }; });
    ok(gate.river, 'the drowned gate waits at the bottom of the Hudson\'s old cavern pit: ' + JSON.stringify(gate));
    await pg.evaluate(() => { for (const id of ['goggles', 'headlight', 'scuba']) { INV.add(id, 1); EQUIP.wear(id, true); } SYS.run('rent', 'scuba'); __dbg.UI.setView('third'); });
    await pg.evaluate(() => UNDERWAY.go(1, 'river'));
    ok(await wait(() => UNDERWAY.built && SHARED.LVL === 'down' && UNDERWAYDBG().inside && !FADE.busy, 90000), 'in through the drowned gate: the Underway is built and you are in it, down');
    await pg.waitForTimeout(1500);
    const sw = await pg.evaluate(() => ({ swim: !!(SWIMDBG().in), things: UNDERWAYDBG().things }));
    ok(sw.swim, 'the silt run is flooded: you swim');
    ok(sw.things.includes('UP TO THE RIVER') && sw.things.includes('UP THROUGH THE LAKE') && sw.things.filter(n => /GLINT/.test(n)).length === 6 && sw.things.includes('A RUSTED GRATE'), 'its ways out at both ends, six glints in the gallery, the old grate: ' + JSON.stringify(sw.things));
    await shot('silt-run');
    // the dry gallery: walk there
    const T = await pg.evaluate(() => __dbg.cv().TILE), X = await pg.evaluate(() => [SHARED.BOD.XS(0), SHARED.BOD.XS(1) - SHARED.BOD.XS(0), SHARED.BOD.ZS(0), SHARED.BOD.ZS(1) - SHARED.BOD.ZS(0)]);
    await pg.evaluate(([x, z]) => __dbg.UI.goTo(x, z, 'down'), [X[0] + X[1] * (1346 - 2000), X[2] + X[3] * (-33)]);
    await pg.waitForTimeout(2500);
    const dg = await pg.evaluate(() => ({ swim: !!(SWIMDBG().in), inside: UNDERWAYDBG().inside }));
    ok(dg.inside && !dg.swim, 'the dry gallery under Market St: you walk, not swim: ' + JSON.stringify(dg));
    await shot('dry-gallery');
    const gl = await pg.evaluate(() => { const t = __dbg.UI.things.find(t => /GLINT/.test(t.name)), n0 = Object.values(INV.items).reduce((a, b) => a + b, 0); t.act(); const n1 = Object.values(INV.items).reduce((a, b) => a + b, 0); t.act(); return { got: n1 - n0, gone: !t.obj.visible }; });
    ok(gl.got === 1 && gl.gone, 'a glint gives a stone and is gone till tomorrow: ' + JSON.stringify(gl));
    // out through the lake
    await pg.evaluate(() => { const t = __dbg.UI.things.find(t => t.name === 'UP THROUGH THE LAKE'); t.act(); });
    ok(await wait(() => !UNDERWAY.built && SHARED.LVL === 'up' && !FADE.busy, 90000), 'up through the lake: out on the street level and the Underway dropped');
    const at = await pg.evaluate(() => { const m = UNDERWAYAT.lake, y = __dbg.you(); return m ? Math.hypot(y.x - m.x, y.z - m.z) / __dbg.cv().TILE : -1; });
    ok(at >= 0 && at < 4, 'you come up at the lake (' + at.toFixed(1) + ' tiles from its shaft)');
    await shot('lake');
  }
  ok(!errs.length, 'no page errors' + (errs.length ? ': ' + errs.slice(0, 3).join(' | ') : ''));
  await b.close(); console.log(fails.length ? fails.length + ' FAILED' : 'ALL OK'); process.exit(fails.length ? 1 : 0);
})();
