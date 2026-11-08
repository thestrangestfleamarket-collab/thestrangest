// THE HUDSON'S SET PIECES CHECK: node tests/river-quests.cjs dist/market.html [shots dir]. Nothing built far from the river; the Old Catfish bites by the pilings 2-4 am on cut bait and a heavy rod, lands as a trophy and a ring once a day; Heron Island stands in the shallows with herons at dawn (the page at 6 am) to watch for feathers; the Long Swim times you to the island; the logbook in the stern cabin, mended and read, leads to the captain's dig; the safe opens once its debris is heaved off in order; the bell rises with a winch and rings in the park; the scanner and extractor find gold in the silt.
const { chromium } = require('playwright'), path = require('path'), fs = require('fs');
const fails = [], ok = (c, m) => { if (!c) { fails.push(m); console.log((process.env.GITHUB_ACTIONS ? '::error title=river-quests::' : 'FAIL ') + m); } else console.log('ok   ' + m); };
const SHOTS = process.argv[3];
(async () => {
  const b = await chromium.launch({ ...(process.env.PWCHROME ? { executablePath: process.env.PWCHROME } : {}), args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const pg = await b.newPage({ viewport: { width: 960, height: 600 } }), errs = [];
  pg.on('pageerror', e => errs.push(e.message.slice(0, 300)));
  await pg.goto('file://' + path.resolve(process.argv[2] || 'dist/market.html') + '?fresh=1&hour=6', { waitUntil: 'commit' });
  let st = false; for (let i = 0; i < 60 && !st; i++) { await pg.waitForTimeout(3000); st = await pg.evaluate(() => !!window.__started).catch(() => false); }
  ok(st, 'the page starts');
  const wait = async (f, ms = 60000, a) => { for (let t = 0; t < ms; t += 500) { if (await pg.evaluate(f, a).catch(() => false)) return true; await pg.waitForTimeout(500); } return false; };
  const shot = async n => { if (SHOTS) { fs.mkdirSync(SHOTS, { recursive: true }); await pg.waitForTimeout(1200); await pg.screenshot({ path: path.join(SHOTS, n + '.png') }); } };
  if (st) {
    ok(await pg.evaluate(() => !HUDSONDBG().isle && !HUDSONDBG().wreck && !HUDSONDBG().park), 'nothing of the Hudson\'s set pieces is built at the start, far from the river');
    await pg.evaluate(() => STORE.goTo(112, -112, 'up'));
    await wait(() => RIVER.on, 90000); await pg.evaluate(() => { const T = __dbg.cv().TILE; STORE.goTo(RIVER.fpier, RIVER.box.z1 + 1.5 * T, 'up'); });
    ok(await wait(() => HUDSONDBG().isle, 90000), 'near the river, Heron Island is built: ' + JSON.stringify(await pg.evaluate(() => HUDSONDBG().at)));
    // the Old Catfish
    const cat = await pg.evaluate(async () => { const T = __dbg.cv().TILE; INV.add('rod', 1); INV.add('rod_surf', 1); await new Promise(r => setTimeout(r, 700));
      let spot = null; for (const [px, pz, r] of RIVER.posts) { if (r > .5 * T) continue; for (const [dx, dz] of [[1.2, 0], [-1.2, 0], [0, -1.2], [1, -1], [-1, -1]]) { const x = px + dx * T, z = pz + dz * T; if (FISHING.at(x, z)) { spot = [x, z]; break; } } if (spot) break; }
      const o = (b, h) => (FISHING.odds(spot[0], spot[1], b, h) || { per: {} }).per.x_oldcat || 0, a = { spot: !!spot, at3: o('bait_cut', 3), at13: o('bait_cut', 13), worm: o('bait', 3) };
      FORAGE.give('x_oldcat', 1); for (const g of FISHING.LAND) g('x_oldcat', 30); a.trophy = FORAGE.has('trophy_cat'); a.ring = FORAGE.has('ring_belly'); a.fish = FORAGE.has('x_oldcat'); a.again = o('bait_cut', 3); return a; });
    ok(cat.spot && cat.at3 > .5 && !cat.at13 && !cat.worm, 'the Old Catfish bites by the pilings at 3 am on cut bait and a heavy rod, not at 1 pm, not on worms: ' + JSON.stringify(cat));
    ok(cat.trophy === 1 && cat.ring === 1 && !cat.fish && !cat.again, 'landed, it is a trophy and a ring from its belly, once a day: ' + JSON.stringify(cat));
    // Heron Island at dawn: stand on it, watch the herons
    await pg.evaluate(() => { const I = HUDSON.isle, T = __dbg.cv().TILE; STORE.goTo(I.ix - I.dir * 2.6 * T, I.iz + .8 * T, 'up'); });
    await pg.waitForTimeout(2500);
    const isle = await pg.evaluate(() => ({ on: RIVER.onPier(__dbg.you().x, __dbg.you().z), swim: RIVER.swim, herons: HUDSONDBG().herons }));
    ok(isle.on && !isle.swim && isle.herons === 3, 'you stand on Heron Island (not swimming), three herons on it at dawn: ' + JSON.stringify(isle));
    await shot('heron-island');
    const f0 = await pg.evaluate(() => { HUDSON.isle.HR[0].th.act(); return FORAGE.has('bird_feather'); });
    ok(await wait(() => !INV.ready('heron'), 90000), 'watched quietly for a while, the herons give Birding and feathers');
    ok(await pg.evaluate(f0 => FORAGE.has('bird_feather') > f0, f0), 'feathers in your pack');
    // the Long Swim
    await pg.evaluate(() => { const I = HUDSON.isle; STORE.goTo(I.sx, I.sz, 'up'); }); await wait(() => RIVER.swim, 60000);
    const r0 = await pg.evaluate(() => { const t = __dbg.UI.things.find(t => t.name === 'THE LONG SWIM (START)'); t.act(); return { on: HUDSON.race.on, x: __dbg.you().x }; });
    await pg.waitForTimeout(3000);
    const r1 = await pg.evaluate(x0 => ({ on: HUDSON.race.on, t: HUDSON.race.t, drift: (__dbg.you().x - x0) * -HUDSON.isle.dir }), r0.x);
    ok(r0.on && r1.on && r1.t > 0 && r1.drift > 0, 'the Long Swim starts at the red buoy and the current pushes you back downriver: ' + JSON.stringify(r1));
    await pg.evaluate(() => { const I = HUDSON.isle; STORE.goTo(I.fx, I.fz, 'up'); });
    ok(await wait(() => !HUDSON.race.on && HUDSON.S.best > 0, 20000), 'at the blue buoy the swim is timed and your best kept: ' + JSON.stringify(await pg.evaluate(() => HUDSONDBG().S.best)));
    ok(await pg.evaluate(() => FORAGE.has('medal_swim') === 1), 'a medal for the first Long Swim');
    // the wreck's things
    await pg.evaluate(() => { const [x, z] = WRECK.at; STORE.goTo(x, z, 'up'); });
    ok(await wait(() => HUDSONDBG().wreck, 90000), 'at the wreck: the bell, the logbook, the safe and the silt are built');
    const lb = await pg.evaluate(() => { const W = HUDSON.wreck; W.book.act(); const a = { book: FORAGE.has('logbook_capt') };
      FORAGE.ST.int = 60; FORAGE.ACT.capread(); a.read = HUDSON.S.read; FORAGE.S.sk.forage = 1000; const c0 = INV.cash; HUDSON.isle.dig.act(); a.dug = HUDSON.S.dug; a.cash = INV.cash - c0; const c1 = INV.cash; HUDSON.isle.dig.act(); a.again = INV.cash - c1; return a; });
    ok(lb.book === 1 && lb.read === 1, 'the logbook from the stern cabin, read with intelligence: ' + JSON.stringify(lb));
    ok(lb.dug === 1 && lb.cash >= 500 && lb.again === 0, 'its clue: the captain\'s box dug up on Heron Island, once: ' + JSON.stringify(lb));
    const sf = await pg.evaluate(() => { const W = HUDSON.wreck, n = () => HUDSON.S.safe.n, a = {}; FORAGE.ST.str = 30; W.parts[2].th.act(); a.pinned = n(); W.parts[0].th.act(); W.parts[1].th.act(); a.two = n(); W.parts[2].th.act(); a.weak = n();
      FORAGE.ST.str = 60; W.parts[2].th.act(); a.three = n(); const c0 = INV.cash, d0 = FORAGE.has('doubloon'); W.safe.act(); a.cash = INV.cash - c0; a.coins = FORAGE.has('doubloon') - d0; const c1 = INV.cash; W.safe.act(); a.again = INV.cash - c1; return a; });
    ok(sf.pinned === 0 && sf.two === 2 && sf.weak === 2 && sf.three === 3, 'the safe\'s debris comes off top first, the anchor only with more strength: ' + JSON.stringify(sf));
    ok(sf.cash >= 60 && sf.coins >= 2 && sf.again === 0, 'the safe gives silver and doubloons once a day: ' + JSON.stringify(sf));
    const bl = await pg.evaluate(() => { const W = HUDSON.wreck; W.bell.act(); const a = { without: HUDSONDBG().raised }; INV.add('winch', 1); W.bell.act(); a.raised = HUDSONDBG().raised; return a; });
    ok(!bl.without && bl.raised, 'the bell needs a winch, then rises: ' + JSON.stringify(bl));
    // gold in the silt: scan from above, dive, extract
    await pg.evaluate(() => { for (const id of ['goggles', 'headlight', 'scuba', 'scanner', 'extractor']) { INV.add(id, 1); if (id !== 'scanner' && id !== 'extractor') EQUIP.wear(id, true); } SYS.run('rent', 'scuba'); const p = HUDSON.wreck.SI[0]; STORE.goTo(p.x, p.z, 'up'); });
    await wait(() => { const p = HUDSON.wreck.SI[0], y = __dbg.you(); return RIVER.swim && Math.hypot(y.x - p.x, y.z - p.z) < 2 * __dbg.cv().TILE; }, 90000);
    const sc = await pg.evaluate(() => { FORAGE.ACT.tool('scanner'); return HUDSON.wreck.SI.filter(p => p.lit > performance.now()).length; });
    ok(sc >= 1, 'the scanner lights gold in the silt near you: ' + sc);
    await pg.mouse.click(480, 300); await pg.keyboard.down(' '); await wait(() => SWIM.d != null, 60000); await pg.keyboard.up(' ');
    for (let t = 0; t < 20; t++) { const g = await pg.evaluate(() => { const W = __dbg.ST.water, p = HUDSON.wreck.SI[0], gap = (HUDSON.sy() - p.y) / (__dbg.cv().TILE / .84) - 3; if (W && SWIM.d != null && gap > 1) { const k = gap * 29.36 / .84; W.y -= k; SWIM.d += k; } return gap; }); if (g < 4) break; await pg.waitForTimeout(1500); }   // (straight down to the silt: this machine's frame rate swims too slowly)
    const ex = await pg.evaluate(() => { const g0 = (FORAGE.has('gold_flake') || 0) + (FORAGE.has('gold_nugget') || 0); FORAGE.ACT.tool('extractor'); const p = HUDSON.wreck.SI[0], y = __dbg.you(), MW = __dbg.cv().TILE / .84; return { got: (FORAGE.has('gold_flake') || 0) + (FORAGE.has('gold_nugget') || 0) - g0, done: !INV.ready('silt0'), up: +((HUDSON.sy() - p.y) / MW).toFixed(1), off: +(Math.hypot(y.x - p.x, y.z - p.z) / MW).toFixed(1) }; });
    ok(ex.got > 0 && ex.done, 'down by the silt, the extractor frees gold, once a day a patch: ' + JSON.stringify(ex));
    await shot('silt');
    // the bell in the park
    await pg.evaluate(() => { EQUIP.off && EQUIP.off('back'); const p = HUDSON.bellAt(); STORE.goTo(p.x + 2 * __dbg.cv().TILE, p.z, 'up'); });
    ok(await wait(() => HUDSONDBG().park, 90000), 'the raised bell hangs in Central Park');
    ok(await pg.evaluate(() => { HUDSON.bell.th.act(); return HUDSON.bell.n === 1; }), 'anyone can ring it');
    await wait(() => PARK.ready && !FADE.busy, 120000); await pg.evaluate(() => __dbg.UI.setView('third')); await shot('park-bell');
  }
  ok(!errs.length, 'no page errors' + (errs.length ? ': ' + errs.slice(0, 3).join(' | ') : ''));
  await b.close(); console.log(fails.length ? fails.length + ' FAILED' : 'ALL OK'); process.exit(fails.length ? 1 : 0);
})();
