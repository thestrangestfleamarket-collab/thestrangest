// THE HUDSON'S SET PIECES CHECK: node tests/river-quests.cjs dist/market.html [shots dir]. Nothing built far from the river; the Old Catfish bites by the pilings 2-4 am on cut bait and a heavy rod, lands as a trophy and a ring once a day; Heron Island and the Long Swim are gone (owner, 11 Nov 2026); the logbook in the stern cabin is read; the safe opens once its debris is heaved off in order; the bell lies on the wreck (the winch is retired) and one raised before rings in the park; the scanner and extractor find gold in the silt.
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
    ok(await pg.evaluate(() => !HUDSONDBG().wreck && !HUDSONDBG().park), 'nothing of the Hudson\'s set pieces is built at the start, far from the river');
    await pg.evaluate(() => STORE.goTo(112, -112, 'up'));
    await wait(() => RIVER.on, 90000); await pg.evaluate(() => { const T = __dbg.cv().TILE; STORE.goTo(RIVER.fpier, RIVER.box.z1 + 1.5 * T, 'up'); });
    await pg.waitForTimeout(4000); ok(await pg.evaluate(() => !window.HUDSON.isle && !__dbg.UI.things.some(t => /HERON|LONG SWIM|MARK IN THE SAND/.test(t.name))), 'near the river, no Heron Island, herons, dig or Long Swim');
    // the Old Catfish
    const cat = await pg.evaluate(async () => { const T = __dbg.cv().TILE; INV.add('rod', 1); INV.add('rod_surf', 1); await new Promise(r => setTimeout(r, 700));
      let spot = null; for (const [px, pz, r] of RIVER.posts) { if (r > .5 * T) continue; for (const [dx, dz] of [[1.2, 0], [-1.2, 0], [0, -1.2], [1, -1], [-1, -1]]) { const x = px + dx * T, z = pz + dz * T; if (FISHING.at(x, z)) { spot = [x, z]; break; } } if (spot) break; }
      const o = (b, h) => (FISHING.odds(spot[0], spot[1], b, h) || { per: {} }).per.x_oldcat || 0, a = { spot: !!spot, at3: o('bait_cut', 3), at13: o('bait_cut', 13), worm: o('bait', 3) };
      FORAGE.give('x_oldcat', 1); for (const g of FISHING.LAND) g('x_oldcat', 30); a.trophy = FORAGE.has('trophy_cat'); a.ring = FORAGE.has('ring_belly'); a.fish = FORAGE.has('x_oldcat'); a.again = o('bait_cut', 3); return a; });
    ok(cat.spot && cat.at3 > .5 && !cat.at13 && !cat.worm, 'the Old Catfish bites by the pilings at 3 am on cut bait and a heavy rod, not at 1 pm, not on worms: ' + JSON.stringify(cat));
    ok(cat.trophy === 1 && cat.ring === 1 && !cat.fish && !cat.again, 'landed, it is a trophy and a ring from its belly, once a day: ' + JSON.stringify(cat));
    // the wreck's things
    await pg.evaluate(() => { const [x, z] = WRECK.at; STORE.goTo(x, z, 'up'); });
    ok(await wait(() => HUDSONDBG().wreck, 90000), 'at the wreck: the bell, the logbook, the safe and the silt are built');
    const lb = await pg.evaluate(() => { const W = HUDSON.wreck; W.book.act(); const a = { book: FORAGE.has('logbook_capt') };
      FORAGE.ST.int = 60; FORAGE.ACT.capread(); a.read = HUDSON.S.read; return a; });
    ok(lb.book === 1 && lb.read === 1, 'the logbook from the stern cabin, read with intelligence: ' + JSON.stringify(lb));
    const sf = await pg.evaluate(() => { const W = HUDSON.wreck, n = () => HUDSON.S.safe.n, a = {}; FORAGE.ST.str = 30; W.parts[2].th.act(); a.pinned = n(); W.parts[0].th.act(); W.parts[1].th.act(); a.two = n(); W.parts[2].th.act(); a.weak = n();
      FORAGE.ST.str = 60; W.parts[2].th.act(); a.three = n(); const c0 = INV.cash, d0 = FORAGE.has('doubloon'); W.safe.act(); a.cash = INV.cash - c0; a.coins = FORAGE.has('doubloon') - d0; const c1 = INV.cash; W.safe.act(); a.again = INV.cash - c1; return a; });
    ok(sf.pinned === 0 && sf.two === 2 && sf.weak === 2 && sf.three === 3, 'the safe\'s debris comes off top first, the anchor only with more strength: ' + JSON.stringify(sf));
    ok(sf.cash >= 60 && sf.coins >= 2 && sf.again === 0, 'the safe gives silver and doubloons once a day: ' + JSON.stringify(sf));
    const bl = await pg.evaluate(() => { const a = { thing: !!HUDSON.wreck.bell, raised: HUDSONDBG().raised }; ONLINE.world = { ...(ONLINE.world || {}), riverbell: 1 }; a.after = HUDSONDBG().raised; return a; });
    ok(!bl.thing && !bl.raised && bl.after, 'the winch is retired: the bell lies on the wreck with nothing to do; one raised before (the section\'s riverbell) still counts: ' + JSON.stringify(bl));
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
