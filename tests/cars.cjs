// THE CARS CHECK: node tests/cars.cjs dist/market.html. The six parked cars on Market St; get in one and W drives it on Rapier's wheels; F gets out and it stays parked where it stopped; a car someone else drives (as the section's server says) is not drawn parked and cannot be taken, and shows where they park it. No page errors.
const { chromium } = require('playwright'), path = require('path');
const fails = [], ok = (c, m) => { if (!c) { fails.push(m); console.log((process.env.GITHUB_ACTIONS ? '::error title=cars::' : 'FAIL ') + m); } else console.log('ok   ' + m); };
(async () => {
  const b = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const pg = await b.newPage({ viewport: { width: 960, height: 540 } }), errs = [];
  pg.on('pageerror', e => errs.push(e.message.slice(0, 300))); pg.on('console', m => { if (m.type() === 'warning' && /^SYS |CARS/.test(m.text())) errs.push(m.text().slice(0, 300)); });
  await pg.goto('file://' + path.resolve(process.argv[2] || 'dist/market.html') + '?fresh=1&hour=13&physics=1', { waitUntil: 'commit' });
  await pg.waitForFunction(() => window.__started && window.CARS && CARS.dbg().loaded, null, { timeout: 400000, polling: 500 });
  const d0 = await pg.evaluate(() => CARS.dbg());
  ok(d0.cars.length === 6 && d0.cars.every(c => c.shown && c.z < -60 && c.z > -72), 'six cars parked along Market St\'s kerb: ' + JSON.stringify(d0.cars.map(c => [c.id, c.model, c.x, c.z])));
  await pg.evaluate(() => CARS.getIn('c1')); await pg.waitForTimeout(1500);
  const d1 = await pg.evaluate(() => ({ ...CARS.dbg(), hud: document.getElementById('carhud').style.display === 'flex', ride: RIDE.on }));
  ok(d1.driving === 'c1' && d1.ride === 'car:muscle-car-60s' && !d1.cars[0].shown && d1.hud, 'double-clicking gets you in: driving it, the parked one not drawn, the controls on screen: ' + JSON.stringify({ driving: d1.driving, ride: d1.ride, hud: d1.hud }));
  const x0 = await pg.evaluate(() => __dbg.pos()[0] / __dbg.cv().TILE);
  await pg.keyboard.down('w'); let top = 0, veh = false; for (let i = 0; i < 20; i++) { await pg.waitForTimeout(500); const q = await pg.evaluate(() => CARS.dbg()); top = Math.max(top, q.v); veh = veh || q.veh; } await pg.keyboard.up('w');
  const x1 = await pg.evaluate(() => __dbg.pos()[0] / __dbg.cv().TILE);
  ok(veh && x1 - x0 > 1 && top > 1, 'W drives it east on Rapier\'s wheels: ' + JSON.stringify({ moved: +(x1 - x0).toFixed(1), top, veh }));
  await pg.waitForTimeout(2500); await pg.keyboard.press('f'); await pg.waitForTimeout(1200);
  const d2 = await pg.evaluate(() => { const c = CARS.dbg(), p = __dbg.pos(), T = __dbg.cv().TILE, c1 = c.cars[0]; return { driving: c.driving, ride: RIDE.on, c1, gap: +Math.hypot(p[0] / T + SHARED.BOD.OX - c1.x, p[2] / T + SHARED.BOD.OY - c1.z).toFixed(2), hud: document.getElementById('carhud').style.display === 'flex' }; });
  ok(!d2.driving && !d2.ride && d2.c1.shown && d2.c1.x - d0.cars[0].x > 1 && d2.gap > 1 && d2.gap < 4 && !d2.hud, 'F gets you out beside it, and it stays parked where it stopped: ' + JSON.stringify(d2));
  const d3 = await pg.evaluate(() => { ONLINE.feed({ t: 'car', k: 'c2', by: 'a' }); const s = CARS.dbg().cars[1]; CARS.getIn('c2'); return { shown: s.shown, by: s.by, driving: CARS.dbg().driving }; });
  const d4 = await pg.evaluate(() => { ONLINE.feed({ t: 'car', k: 'c2', by: null, at: [SHARED.BOD.XS(60), SHARED.BOD.ZS(-60), 1.2].join(',') }); return CARS.dbg().cars[1]; });
  ok(d3.by === 'a' && !d3.shown && !d3.driving && d4.shown && !d4.by && Math.abs(d4.x - 60) < .2 && Math.abs(d4.z + 60) < .2, 'a car someone else drives is not drawn parked and cannot be taken; it shows where they park it: ' + JSON.stringify({ d3, d4 }));
  ok(!errs.length, 'no page errors' + (errs.length ? ': ' + errs.slice(0, 3).join(' | ') : ''));
  await b.close(); console.log(fails.length ? fails.length + ' failed' : 'all car checks passed'); process.exit(fails.length ? 1 : 0);
})();
