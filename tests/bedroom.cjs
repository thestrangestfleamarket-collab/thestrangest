// THE BEDROOM CHECK: node tests/bedroom.cjs dist/market.html. Your apartment's bedroom (the owner's picture): built with its things as real bodies, the near walls down in the isometric view, the far ones at the picture's height, the doors and lamps working.
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
    ok(d.built && d.loose >= 16, 'the bedroom is built, its small things real bodies (' + d.loose + ')');
    const fy = await pg.evaluate(() => SHARED.BOD.Y(.15));
    ok(d.walls.filter(w => w < fy + .1).length === 2 && d.walls.filter(w => w > fy + 3 && w < 1e5).length === 2, 'in the isometric view the two near walls are down and the far two stand at the picture\'s height (' + d.walls.map(w => w.toFixed(2)) + ')');
    ok(d.sun > 0, 'the late sun comes in through the window');
    const used = await pg.evaluate(async () => { const T = __dbg.UI.things.filter(t => /WARDROBE|LAMP:/.test(t.name)); for (const t of T) t.act(); await new Promise(r => setTimeout(r, 1500)); return { names: T.map(t => t.name), d: BEDROOMDBG() }; });
    ok(used.d.doors[0] > .5 && used.d.doors[1] > .5, 'the wardrobe opens (' + JSON.stringify(used.d.doors) + ')');
    ok(used.d.lamps.every(l => l !== d.lamps[0]) || used.d.lamps.some((l, i) => l !== d.lamps[i]), 'the lamps switch (' + JSON.stringify(d.lamps) + ' -> ' + JSON.stringify(used.d.lamps) + ')');
    ok(await pg.evaluate(() => !!(window.GPH && GPH.loose().some(i => i.k === 'o' && i.name === 'TEAPOT'))), 'the teapot is a loose thing you can pick up');
    const err = await pg.evaluate(() => Object.entries(SYS.P).flatMap(([k, v]) => v.filter(s => s.err).map(s => k + ':' + s.name)));
    ok(!err.length, 'no SYS errors (' + err.join(',') + ')');
  }
  ok(!errs.length, 'no page errors' + (errs.length ? ': ' + errs.slice(0, 3).join(' | ') : ''));
  await b.close();
  console.log(fails.length ? fails.length + ' failed' : 'all bedroom checks passed');
  process.exit(fails.length ? 1 : 0);
})();
