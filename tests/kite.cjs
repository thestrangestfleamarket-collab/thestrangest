// THE KITE CHECK: node tests/kite.cjs dist/market.html. Outdoors: the nature merchant's kite in the pack, held, launched; in a fair wind it climbs on its line,
// pulls, takes line and settles high in the wind window; in still air it comes down; held mouse winds it in; nothing throws.
const { chromium } = require('playwright'), path = require('path');
const fails = [], ok = (c, m) => { if (!c) { fails.push(m); console.log((process.env.GITHUB_ACTIONS ? '::error title=kite::' : 'FAIL ') + m); } else console.log('ok   ' + m); };
(async () => {
  const b = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const pg = await b.newPage({ viewport: { width: 800, height: 500 } }), errs = [];
  pg.on('pageerror', e => errs.push(e.message.slice(0, 300)));
  await pg.goto('file://' + path.resolve(process.argv[2] || 'dist/market.html') + '?fresh=1&hour=13&at=40,150&res=0', { waitUntil: 'commit' });
  await pg.waitForFunction(() => window.__started, null, { timeout: 300000 });
  await pg.waitForFunction(() => !FADE.busy && OUT.open, null, { timeout: 120000, polling: 200 });
  const r1 = await pg.evaluate(() => { FORAGE.give('kite'); WIELD.set('kite'); WX.hold = 'CLOUDY'; return { held: WIELD.on, fly: ITEMS.prop('kite', 'grants') }; });
  ok(r1.held === 'kite' && r1.fly === 'fly', 'the kite is held from the pack: ' + JSON.stringify(r1));
  await pg.waitForTimeout(1500);
  await pg.evaluate(() => KITE.launch());
  const path1 = [];
  for (let i = 0; i < 400; i++) { await pg.waitForTimeout(1000); const d = await pg.evaluate(() => KITE.dbg()); path1.push(d); if (d.up > 10 && d.line > 10) break; }
  console.log(path1.filter((d, i) => i % 5 === 0).map(d => `up ${d.up} line ${d.line} pull ${d.pull} elev ${d.elev} sag ${d.sag}${d.ground ? ' GROUND' : ''}`).join('\n'));
  await pg.waitForTimeout(3000); const end = await pg.evaluate(() => KITE.dbg());
  ok(end.on && end.up > 8, 'in a fair wind (' + end.wind + ' m/s at 10 m) the kite climbs high: ' + end.up + ' m');
  ok(end.line > 8 && end.pull > .8, 'it pulls and takes line: ' + end.line + ' m, ' + end.pull + ' N');
  ok(end.elev > 30 && end.elev < 85, 'it sits up in the wind window: ' + end.elev + ' deg');
  await pg.screenshot({ path: process.env.SHOT || '/dev/null' }).catch(() => {});
  await pg.evaluate(() => { WX.hold = 'FOG'; });
  for (let i = 0; i < 150; i++) { await pg.waitForTimeout(1000); if (await pg.evaluate(() => KITE.dbg().ground)) break; }
  const calm = await pg.evaluate(() => KITE.dbg());
  ok(calm.ground, 'in still air it comes down: ' + JSON.stringify(calm));
  await pg.evaluate(() => { WX.hold = 'CLOUDY'; KITE.reeling = true; });
  for (let i = 0; i < 150; i++) { await pg.waitForTimeout(1000); if (!(await pg.evaluate(() => KITE.on))) break; await pg.evaluate(() => { KITE.reeling = true; }); }
  ok(!(await pg.evaluate(() => KITE.on)), 'winding in brings it home');
  await pg.evaluate(() => { const P = __dbg.you(); ONLINE.feed({ t: 'hi', you: 'me', all: [{ id: 'a', name: 'ROSA', look: 'w00', at: [P.x + 1.5, P.z, SHARED.py, 0, SHARED.LVL, ''] }] }); });
  await pg.waitForTimeout(3000);
  await pg.evaluate(() => { const P = __dbg.you(); ONLINE.feed({ t: 'kite', id: 'a', k: [P.x + 6, SHARED.py + 9, P.z] }); });
  await pg.waitForTimeout(2000); const th = await pg.evaluate(() => KITE.dbg().theirs);
  ok(th.length === 1 && th[0].shown, "another player's kite flies from their hand: " + JSON.stringify(th));
  await pg.evaluate(() => ONLINE.feed({ t: 'kite', id: 'a', k: null })); await pg.waitForTimeout(500);
  ok(!(await pg.evaluate(() => KITE.dbg().theirs.length)), 'and is gone when they wind it in');
  ok(!errs.length, 'no page errors: ' + errs.join(' | '));
  await b.close(); if (fails.length) process.exit(1);
})();
