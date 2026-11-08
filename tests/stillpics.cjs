// FREED PAST 64 TILES IN A ROOM (owner, 7 Nov 2026): node tests/stillpics.cjs dist/market.html. In a room off the map with windows out (the diner), in a person view with the haze off (the default), the street's places past 64 tiles of it let go of their pictures (130b's stow), put back on the way out; on the street the ground is kept as before.
const { chromium } = require('playwright'), path = require('path');
const fails = [], ok = (c, m) => { if (!c) { fails.push(m); console.log((process.env.GITHUB_ACTIONS ? '::error title=stillpics::' : 'FAIL ') + m); } else console.log('ok   ' + m); };
(async () => {
  const b = await chromium.launch({ ...(process.env.PWCHROME ? { executablePath: process.env.PWCHROME } : {}), args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const pg = await b.newPage({ viewport: { width: 960, height: 600 } }), errs = [];
  pg.on('pageerror', e => errs.push(e.message.slice(0, 300)));
  await pg.goto('file://' + path.resolve(process.argv[2] || 'dist/market.html') + '?fresh=1&hour=13&at=0,6', { waitUntil: 'commit' });
  let st = false; for (let i = 0; i < 60 && !st; i++) { await pg.waitForTimeout(3000); st = await pg.evaluate(() => !!window.__started).catch(() => false); }
  ok(st, 'the page starts');
  if (st) {
    await pg.keyboard.press('v'); await pg.waitForTimeout(1500);
    const r = await pg.evaluate(() => ({ cut: DFOG.cut(), reach: BATCH.reach()[1] / (BATCH.VIEW / 20) }));
    ok(!r.cut && !(r.reach < 1e9), 'third person on the street, haze off: painted ground kept as far as it goes (no gap at the far end): ' + JSON.stringify(r));
    for (let i = 0; i < 5 && !(await pg.evaluate(() => ROOMS.offIn())); i++) { await pg.evaluate(() => Promise.race([ROOMS.enter('diner'), new Promise(r => setTimeout(r, 30000))])); await pg.waitForTimeout(3000); } await pg.waitForTimeout(3000);
    await pg.keyboard.press('v'); await pg.waitForTimeout(1000); await pg.keyboard.press('v'); await pg.waitForTimeout(5000);   // in the diner, out of the overhead view (entering a room puts you in it)
    const s = await pg.evaluate(() => { const L = ROOMS.stowed(); return { in: ROOMS.offIn(), persp: BATCH.reach()[1] / (BATCH.VIEW / 20), places: L.length, MB: Math.round(L.reduce((n, p) => n + p.pics + p.shape, 0) / 1048576), names: L.map(p => p.name).slice(0, 12) }; });
    ok(s.in === 'diner' && s.places > 5 && s.MB > 50 && !s.names.includes('diner'), 'in the diner (windows out) in a person view, the places past 64 tiles of its windows let go of their pictures: ' + JSON.stringify(s));
    await pg.evaluate(() => Promise.race([ROOMS.exit('diner'), new Promise(r => setTimeout(r, 30000))])); await pg.waitForTimeout(4000);
    const o = await pg.evaluate(() => ({ in: ROOMS.offIn(), stowed: ROOMS.stowed().length }));
    ok(!o.in && !o.stowed, 'out of the diner everything is put back: ' + JSON.stringify(o));
  }
  ok(!errs.length, 'no page errors: ' + errs.slice(0, 3).join(' | '));
  await b.close(); if (fails.length) process.exit(1);
})();
