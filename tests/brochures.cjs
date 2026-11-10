// THE BROCHURES (owner, 10 Nov 2026): node tests/brochures.cjs dist/market.html [shots dir]. A rack on the street sells one for each thing to do: every one names a GO TO place,
// buying takes $2 and puts it in your pack, READ from the pack opens it, its three panels fit their paper, START goes to its place and lends its gear (back when you leave), a full set pays once, ESC closes.
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
  ok(!over.length, 'READ from the pack opens each one: three panels that fit, its photographs, START' + (over.length ? ' (' + over.join(' ') + ')' : ''));
  // START on the last one opened (the gems): to the dungeon with a headlight lent and on
  const p0 = await pg.evaluate(() => { const p = __dbg.pos(); document.querySelector('#bq [data-go]').click(); return p; });
  await wait(() => BROCH.loan(), null, 90000); await wait(() => !FADE.busy);
  const g = await pg.evaluate(() => ({ gone: getComputedStyle(document.getElementById('bq')).display === 'none', up: BROCH.up(), p: __dbg.pos(), loan: BROCH.loan(), wheel: FORAGE.has('gem_wheel'), lamp: Object.values(EQUIP.by).includes('headlight') }));
  ok(g.gone && !g.up && Math.hypot(g.p[0] - p0[0], g.p[2] - p0[2]) > 1 && g.lamp && g.loan && g.loan.kit.headlight === 1, 'START folds it away, takes you to the place and lends its gear: ' + JSON.stringify({ kit: g.loan && g.loan.kit, lamp: g.lamp }));
  // START the wreck: in the water by the ship, the scuba set on; the gems' loan goes back first
  await pg.evaluate(() => BROCH.start('wreck')); await wait(() => BROCH.loan() && BROCH.loan().id === 'wreck', null, 120000); await pg.waitForTimeout(3000);
  const w = await pg.evaluate(() => { const [x, z] = WRECK.at, p = __dbg.pos(); return { d: +(Math.hypot(p[0] - x, p[2] - z) / __dbg.cv().TILE).toFixed(1), swim: !!RIVER.swim, worn: Object.values(EQUIP.by), wheel: FORAGE.has('gem_wheel') || 0, kit: BROCH.loan().kit }; });
  ok(w.d < 12 && w.swim && ['scuba', 'goggles', 'headlight'].every(k => w.worn.includes(k)) && !w.wheel && w.kit.scuba === 1 && !w.kit.winch, 'START the wreck: in the water by the ship, dressed to dive, the last loan given back: ' + JSON.stringify(w));
  // walk off (the bodega, far away): the loan goes back
  await pg.evaluate(() => __dbg.UI.goName('THE BODEGA')); await wait(() => !BROCH.loan(), null, 60000);
  const r = await pg.evaluate(() => ({ loan: BROCH.loan(), worn: Object.values(EQUIP.by), has: ['scuba', 'goggles', 'headlight'].map(k => FORAGE.has(k) || 0) }));
  ok(!r.loan && !r.worn.includes('scuba') && r.has.every(n => !n), 'leave, and the loaned gear goes back: ' + JSON.stringify(r));
  const f = await pg.evaluate(() => { INV.cash = 100; for (const id of BROCH.ids) { FORAGE.take('bq_' + id, FORAGE.has('bq_' + id) || 0); } for (const id of BROCH.ids) BROCH.buy(id); const a = { cash: INV.cash, paid: BROCH.paid(), got: BROCHDBG().got };
    FORAGE.take('bq_fish', 1); BROCH.buy('fish'); a.again = INV.cash; return a; });
  ok(f.got === 12 && f.paid === 1 && f.cash === 100 - 24 + 50 && f.again === f.cash - 2, 'a full set pays $50, once: ' + JSON.stringify(f));
  await pg.evaluate(() => BROCH.rack()); await wait(() => BROCH.up() && BROCH.up().mode === 'rack'); await pg.evaluate(() => document.getElementById('bq').focus()); await pg.keyboard.press('Escape'); await pg.waitForTimeout(300);
  ok(await pg.evaluate(() => !BROCH.up() && getComputedStyle(document.getElementById('bq')).display === 'none' && !document.elementsFromPoint(innerWidth / 2, innerHeight / 2).some(e => e.closest('#bq'))), 'ESC closes it, nothing of it left over the game');
  ok(!errs.length, 'no page errors' + (errs.length ? ': ' + errs.slice(0, 3).join(' | ') : ''));
  await b.close(); console.log(fails.length ? fails.length + ' failed' : 'all brochure checks passed'); process.exit(fails.length ? 1 : 0);
})();
