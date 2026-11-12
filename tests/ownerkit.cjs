// THE OWNERS' KIT: an owner starts with every usable thing you can carry, and the carried telescope and microscope open their eyepieces on the street.
const { chromium: C0 } = require('playwright'), chromium = { launch: o => C0.launch({ ...o, ...(process.env.PW_CHROMIUM ? { executablePath: process.env.PW_CHROMIUM } : {}) }) }, path = require('path');
let bad = 0; const ok = (c, m) => { console.log((c ? 'ok   ' : 'FAIL ') + m); if (!c) bad++; };
(async () => {
  const b = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const pg = await b.newPage({ viewport: { width: 640, height: 360 } }), errs = []; pg.on('pageerror', e => errs.push(e.message.slice(0, 300)));
  await pg.goto('file://' + path.resolve(process.argv[2] || 'dist/market.html') + '?hour=13&at=53,10&fresh=1', { waitUntil: 'commit' });
  let st = false; for (let i = 0; i < 60 && !st; i++) { await pg.waitForTimeout(3000); st = await pg.evaluate(() => !!window.__started).catch(() => false); }
  ok(st, 'the page starts');
  await pg.waitForTimeout(2000);
  const r = await pg.evaluate(async () => { const had = !!(INV.items.telescope || INV.items.microscope), g = await FORAGE.ownerKit(), again = await FORAGE.ownerKit();
    return { had, g, again, it: { ...INV.items }, arch: Object.keys(INV.items).filter(id => ARCHI(id) && !['mortar', 'passport'].includes(id)), rows: ['telescope', 'microscope'].map(id => FORAGE.ROWB.flatMap(f => f(id)).map(x => x[0]).join()) }; });
  ok(!r.had, 'a player who is no owner has none of it');
  ok(r.g > 100 && r.again === 0, 'the kit gives ' + r.g + ' kinds, and nothing the second time');
  for (const id of ['telescope', 'microscope', 'flamer', 'frost', 'magic_carpet', 'balloon', 'saddle', 'brickphone', 'cigar', 'nv_goggles', 'cowboyhat', 'spray_gold', 'jar_fly', 'spyglass', 'scuba', 'kart', 'rod', 'camera', 'binoc', 'sword_ench', 'guitar', 'trumpet', 'bee_hive', 'jugball', 'jugclub', 'birdnet', 'burlap', 'play_ticket'])
    ok(r.it[id] >= 1, 'in the bag: ' + id);
  ok(r.it.shroom_fly >= 99 && r.it.bait >= 20, '99 of a power mushroom, 20 of what stacks');
  ok(!r.arch.length, 'nothing archived: ' + r.arch.join(','));
  ok(r.rows.every(x => x.includes('SET IT HERE')), 'both instruments have SET IT HERE');
  ok(await pg.evaluate(() => INSPECT.has('telescope') && INSPECT.has('microscope')), 'both have a model of their own');
  await pg.evaluate(() => FORAGE.ACT.scopeset()); let o = false; for (let i = 0; i < 20 && !o; i++) { await pg.waitForTimeout(1500); o = await pg.evaluate(() => SCOPE.isOpen()); }
  ok(o, 'the telescope opens on the street'); await pg.evaluate(() => SCOPE.close());
  await pg.evaluate(() => FORAGE.ACT.micset()); o = false; for (let i = 0; i < 20 && !o; i++) { await pg.waitForTimeout(1500); o = await pg.evaluate(() => MIC.open === true); }
  ok(o, 'the microscope opens on the street'); if (process.env.SHOT) await pg.screenshot({ path: process.env.SHOT }); await pg.evaluate(() => MIC.close());
  ok(await pg.evaluate(() => !SCOPE.isOpen() && !MIC.open), 'both close');
  ok(!errs.length, 'no page errors ' + errs.join(' | '));
  await b.close(); process.exit(bad ? 1 : 0);
})();
