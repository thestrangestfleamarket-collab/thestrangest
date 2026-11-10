// THE BROCHURES (owner, 10 Nov 2026): node tests/brochures.cjs dist/market.html [shots dir]. A rack on the street sells one for each thing to do: every one names a GO TO place,
// buying takes $2 and puts it in your pack, READ from the pack opens it, its three panels fit their paper, GO THERE goes to its place, a full set pays once, ESC closes.
const { chromium } = require('playwright'), path = require('path');
const fails = [], ok = (c, m) => { if (!c) { fails.push(m); console.log((process.env.GITHUB_ACTIONS ? '::error title=brochures::' : 'FAIL ') + m); } else console.log('ok   ' + m); };
(async () => {
  const shots = process.argv[3];
  const b = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'], ...(process.env.PWCHROME ? { executablePath: process.env.PWCHROME } : {}) });
  const pg = await b.newPage({ viewport: { width: 1280, height: 720 } }), errs = [];
  pg.on('pageerror', e => errs.push(e.message.slice(0, 300)));
  await pg.goto('file://' + path.resolve(process.argv[2] || 'dist/market.html') + '?fresh=1&hour=13&res=1', { waitUntil: 'commit' });
  await pg.waitForFunction(() => window.__started, null, { timeout: 300000 });
  const wait = (f, a, t = 60000) => pg.waitForFunction(f, a, { timeout: t, polling: 200 }).then(() => 1, () => 0);
  await wait(() => { const L = document.getElementById('loading'); return (!L || getComputedStyle(L).display === 'none' || getComputedStyle(L).opacity === '0') && !FADE.busy; }, null, 240000);
  const r0 = await pg.evaluate(() => ({ ids: BROCH.ids, racks: BROCH.racks.length, things: __dbg.UI.things.filter(t => /^BROCHURES/.test(t.name)).length, names: BROCH.ids.map(id => FORAGE.NM['bq_' + id]) }));
  ok(r0.ids.length === 12 && r0.names.every(n => /^BROCHURE: /.test(n)), 'twelve brochures, each named in the pack: ' + r0.ids.join(' '));
  ok(r0.racks >= 1 && r0.things === r0.racks, 'the racks stand on the street, each a thing to double-click: ' + r0.racks);
  await pg.evaluate(() => { INV.cash = 100; __dbg.UI.things.find(t => /^BROCHURES/.test(t.name)).act(); });
  ok(await wait(() => BROCHDBG().panels === 12 && BROCH.up().mode === 'rack'), 'double-clicking a rack shows the twelve covers');
  if (shots) await pg.screenshot({ path: shots + '/rack.png' });
  const pl = await pg.evaluate(() => { const P = new Set(__dbg.UI.places().map(p => p[0])); return BROCH.D.list.filter(q => !P.has(q.place)).map(q => q.id + ':' + q.place); });
  ok(!pl.length, 'every brochure names one of GO TO\'s places' + (pl.length ? ', not: ' + pl.join(', ') : ''));
  await pg.evaluate(() => document.querySelector('#bq [data-o=wreck]').click()); await pg.waitForTimeout(600);
  const b1 = await pg.evaluate(() => ({ cash: INV.cash, has: FORAGE.has('bq_wreck'), up: BROCH.up(), got: BROCHDBG().got }));
  ok(b1.cash === 98 && b1.has === 1 && b1.up.mode === 'cover' && b1.up.id === 'wreck' && b1.got === 1, 'a click on a cover buys it for $2, into your pack, and shows it: ' + JSON.stringify(b1));
  await pg.evaluate(() => document.querySelector('#bq [data-o=wreck]').click()); await pg.waitForTimeout(400);
  await pg.evaluate(() => BROCH.buy('wreck')); const b2 = await pg.evaluate(() => ({ cash: INV.cash, has: FORAGE.has('bq_wreck') }));
  ok(b2.cash === 98 && b2.has === 1, 'one you carry is read, not bought again');
  // every one opened: three panels, nothing spilling off the paper, its photographs loaded
  const over = [];
  for (const id of r0.ids) { await pg.evaluate(id => { BROCH.close(); FORAGE.give('bq_' + id, 1); FORAGE.ACT.bqread('bq_' + id); }, id); await wait(() => BROCH.up() && BROCH.up().mode === 'cover' && BROCHDBG().panels === 1);
    await pg.evaluate(() => document.querySelector('#bq .cv').click()); await wait(() => BROCHDBG().panels === 3 && [...document.querySelectorAll('#bq img')].every(i => i.complete), null, 20000);
    const d = await pg.evaluate(() => ({ ...BROCHDBG(), pics: [...document.querySelectorAll('#bq img')].filter(i => i.naturalWidth > 0).length, go: !!document.querySelector('#bq [data-go]') }));
    if (d.panels !== 3 || d.over || d.pics < 3 || !d.go) over.push(id + ':' + JSON.stringify(d)); if (shots) await pg.screenshot({ path: `${shots}/${id}.png` }); }
  ok(!over.length, 'READ from the pack opens each one: three panels that fit, its photographs, GO THERE' + (over.length ? ' (' + over.join(' ') + ')' : ''));
  const p0 = await pg.evaluate(() => { const p = __dbg.pos(); document.querySelector('#bq [data-go]').click(); return p; }); await pg.waitForTimeout(1500); await wait(() => !FADE.busy);
  const g = await pg.evaluate(() => ({ up: BROCH.up(), p: __dbg.pos() }));
  ok(!g.up && Math.hypot(g.p[0] - p0[0], g.p[2] - p0[2]) > 1, 'GO THERE folds it away and takes you to the place');
  const f = await pg.evaluate(() => { INV.cash = 100; for (const id of BROCH.ids) { FORAGE.take('bq_' + id, FORAGE.has('bq_' + id) || 0); } for (const id of BROCH.ids) BROCH.buy(id); const a = { cash: INV.cash, paid: BROCH.paid(), got: BROCHDBG().got };
    FORAGE.take('bq_fish', 1); BROCH.buy('fish'); a.again = INV.cash; return a; });
  ok(f.got === 12 && f.paid === 1 && f.cash === 100 - 24 + 50 && f.again === f.cash - 2, 'a full set pays $50, once: ' + JSON.stringify(f));
  await pg.evaluate(() => BROCH.rack()); await wait(() => BROCH.up() && BROCH.up().mode === 'rack'); await pg.evaluate(() => document.getElementById('bq').focus()); await pg.keyboard.press('Escape'); await pg.waitForTimeout(300);
  ok(await pg.evaluate(() => !BROCH.up() && document.getElementById('bq').hidden), 'ESC closes it');
  ok(!errs.length, 'no page errors' + (errs.length ? ': ' + errs.slice(0, 3).join(' | ') : ''));
  await b.close(); console.log(fails.length ? fails.length + ' failed' : 'all brochure checks passed'); process.exit(fails.length ? 1 : 0);
})();
