// THE FISH TANK CHECK (owner, 9 Nov 2026): node tests/fishtank.cjs dist/market.html [shots-dir]. A fresh apartment's tank is built, its water surface moves (the wave sim steps), the koi swims, a double-click without fish food opens the close look and its settings, a setting changes the tank and is in the saved layout; with fish food it still feeds.
const { chromium } = require('playwright'), path = require('path');
const fails = [], ok = (c, m) => { if (!c) { fails.push(m); console.log((process.env.GITHUB_ACTIONS ? '::error title=fishtank::' : 'FAIL ') + m); } else console.log('ok   ' + m); };
(async () => {
  const out = process.argv[3], b = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const pg = await b.newPage({ viewport: { width: 1100, height: 700 } }), errs = [];
  pg.on('pageerror', e => errs.push(e.message.slice(0, 300)));
  await pg.goto('file://' + path.resolve(process.argv[2] || 'dist/market.html') + '?fresh=1&hour=13&place=your%20apartment', { waitUntil: 'commit' });
  let st = false; for (let i = 0; i < 80 && !st; i++) { await pg.waitForTimeout(3000); st = await pg.evaluate(() => !!window.__started).catch(() => false); }
  ok(st, 'the page starts');
  if (st) {
    const T = () => pg.evaluate(() => window.TANKDBG && TANKDBG()[0]);
    let t = null; for (let i = 0; i < 90; i++) { t = await T(); if (t && t.vis && t.fish > 0 && t.kinds.length) break; await pg.waitForTimeout(1000); }
    ok(t && t.vis && t.size[0] >= 1.5 && t.size[0] <= 1.8 && t.size[2] >= 1.2, 'the tank builds, half as long as it was (owner, 12 Nov 2026): ' + JSON.stringify(t && t.size));
    ok(t && t.kinds.includes('pfkoi'), 'the Polyfork koi is in it: ' + JSON.stringify(t && t.kinds));
    ok(t && t.kinds.filter(k => /koi/.test(k)).length >= 4 && t.kinds.includes('goldfish') && t.ways.length >= 2 && t.koiL < .2, 'koi of several colourings, half the size, with a shoal of goldfish, each kind swimming its own way (owner, 10 Nov 2026): ' + JSON.stringify([t && t.kinds, t && t.ways, t && t.koiL]));
    const a = await T(); await pg.waitForTimeout(12000); const c = await T();
    ok(c.steps > a.steps && c.wave > 0 && (c.sy !== a.sy || c.wave !== a.wave), 'the water surface moves (' + a.steps + ' -> ' + c.steps + ' steps, middle height ' + a.sy + ' -> ' + c.sy + ', highest wave ' + a.wave + ' -> ' + c.wave + ' mm)');
    ok(a.f0 && c.f0 && Math.hypot(c.f0[1] - a.f0[1], c.f0[3] - a.f0[3]) > .01, 'the koi swims: ' + JSON.stringify([a.f0, c.f0]));
    await pg.evaluate(() => { while (FORAGE.has('g_fishfood')) FORAGE.take('g_fishfood', 1); __dbg.UI.things.find(t => /FISH TANK|FEED THE FISH/.test(t.name)).act(); });
    let v = false; for (let i = 0; i < 30 && !v; i++) { await pg.waitForTimeout(500); v = await pg.evaluate(() => TANKV.on() && !!document.querySelector('#tankp:not([hidden]) button[data-a="w:salt"]')); }
    ok(v, 'a double-click without fish food opens the close look and its settings');
    if (v) {
      await pg.waitForTimeout(3000); const cam = await pg.evaluate(() => ({ hold: __dbg.UI.holdCam, persp: __dbg.UI.persp }));
      ok(cam.hold === 'tank' && cam.persp, 'the camera comes close on the tank: ' + JSON.stringify(cam));
      if (out) await pg.screenshot({ path: path.join(out, 'tank-fresh.png'), timeout: 180000 });
      for (const a of ['w:salt', 'f:pfclown:1', 'd:castle', 'l:c:blue']) await pg.$eval('#tankp button[data-a="' + a + '"]', b => b.click());
      let s = null; for (let i = 0; i < 30; i++) { await pg.waitForTimeout(1000); s = await T(); if (s.kinds.includes('pfclown')) break; }
      ok(s.set.w === 'salt' && s.set.f.pfclown === 1 && s.set.d.includes('castle') && s.set.l.c === 'blue', 'the settings change the tank: ' + JSON.stringify(s.set));
      ok(s.kinds.includes('pfclown') && !s.kinds.includes('pfkoi'), 'in salt water the clownfish swims and the koi (fresh) waits: ' + JSON.stringify(s.kinds));
      await pg.waitForTimeout(2000); const L = await pg.evaluate(() => { const H = ROOMED.HOME.layout; return H && H.tanks; });
      ok(L && L.fishtank && L.fishtank.w === 'salt' && L.fishtank.f.pfclown === 1, 'and they are in the saved layout: ' + JSON.stringify(L));
      if (out) { await pg.waitForTimeout(3000); await pg.screenshot({ path: path.join(out, 'tank-salt.png'), timeout: 180000 }); }
      await pg.keyboard.press('Escape'); await pg.waitForTimeout(500);
      ok(await pg.evaluate(() => !TANKV.on() && !__dbg.UI.holdCam), 'Esc steps back');
    }
    const y0 = (await T()).y;
    await pg.evaluate(() => { FORAGE.give('g_fishfood', 1); __dbg.UI.things.find(t => /FISH TANK|FEED THE FISH/.test(t.name)).act(); });
    let f = null; for (let i = 0; i < 40; i++) { f = await T(); if (f.y > y0 + .1) break; await pg.waitForTimeout(500); }
    ok(f.fed > 0 && f.y > y0 + .1 && !(await pg.evaluate(() => FORAGE.has('g_fishfood'))), 'with fish food it still feeds: the food is used and the fish rise (' + y0 + ' -> ' + f.y + ')');
  }
  ok(!errs.length, 'no page errors' + (errs.length ? ': ' + errs.slice(0, 3).join(' | ') : ''));
  await b.close(); process.exit(fails.length ? 1 : 0);
})();
