// THE VISIT CHECK: node tests/visit.cjs dist/market.html. Visiting another player's apartment: your rooms dressed in their layout (their caged bird, not your candle), DECORATE refused,
// the room shared with them (the online room is theirs); leaving puts your own layout back.
const { chromium } = require('playwright'), path = require('path');
const fails = [], ok = (c, m) => { if (!c) { fails.push(m); console.log((process.env.GITHUB_ACTIONS ? '::error title=visit::' : 'FAIL ') + m); } else console.log('ok   ' + m); };
(async () => {
  const b = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const pg = await b.newPage({ viewport: { width: 800, height: 500 } }), errs = [];
  pg.on('pageerror', e => errs.push(e.message.slice(0, 300)));
  await pg.goto('file://' + path.resolve(process.argv[2] || 'dist/market.html') + '?fresh=1&hour=13', { waitUntil: 'commit' });
  await pg.waitForFunction(() => window.__started && window.ENTERAPT && window.ROOMED, null, { timeout: 300000, polling: 500 });
  const wait = ms => pg.evaluate(ms => new Promise(r => setTimeout(r, ms)), ms);
  const kinds = () => pg.evaluate(() => { const A = ROOMED._api(); return A ? A.units().filter(u => u.added && !u.gone).map(u => u.kind) : null; });

  // your own apartment, with a candle you placed
  await pg.evaluate(() => ENTERAPT()); await pg.waitForFunction(() => ROOMED._api && ROOMED._api(), null, { timeout: 120000, polling: 500 });
  const own = await pg.evaluate(() => { const A = ROOMED._api(); A.spawn('bk:candle', { u: 1, h: 0, v: 1, ry: 0, s: 1 }, 'c1').added = true; const L = ROOMED.snapshot(); ROOMED.HOME.layout = L; window.__own = L; return L.added.map(a => a.kind); });
  ok(own.includes('bk:candle'), 'your apartment keeps the candle you placed: ' + JSON.stringify(own));
  await pg.evaluate(() => EXITAPT()); await wait(1500);

  // ROSA's apartment: her caged blue jay, no candle; you can look but not decorate; the room is hers
  await pg.evaluate(() => { const L = JSON.parse(JSON.stringify(window.__own)); window.__lay = ROOMED.HOME.layout; L.added = L.added.map(a => ({ ...a, id: 'r1', kind: 'sp:bd_5' })); return ROOMED.HOME.visit('rosa', 'Rosa', L); });
  await wait(1500);
  const v = await pg.evaluate(() => { const o = { kinds: ROOMED._api().units().filter(u => u.added && !u.gone).map(u => u.kind), guest: ROOMED.HOME.guest && ROOMED.HOME.guest.name, rk: ONLINEDBG().me.rk };
    ROOMED.toggle(); o.decorating = ROOMED.on; return o; });
  ok(v.kinds.includes('sp:bd_5') && !v.kinds.includes('bk:candle') && v.guest === 'ROSA', "in ROSA'S APARTMENT: her caged bird stands there, your candle doesn't: " + JSON.stringify(v));
  ok(!v.decorating, 'a visitor cannot DECORATE');
  ok(v.rk === 'apt:rosa', 'you share her room with her (the online room is hers): ' + v.rk);

  // leaving puts your own apartment back
  await pg.evaluate(() => EXITAPT()); await wait(1500);
  const back = await pg.evaluate(() => ({ guest: ROOMED.HOME.guest, kinds: ROOMED._api() ? ROOMED._api().units().filter(u => u.added && !u.gone).map(u => u.kind) : null }));
  ok(!back.guest && back.kinds && back.kinds.includes('bk:candle') && !back.kinds.includes('sp:bd_5'), 'leaving puts your own apartment back: ' + JSON.stringify(back));

  ok(!errs.length, 'no page errors' + (errs.length ? ': ' + errs.slice(0, 3).join(' | ') : ''));
  await b.close(); console.log(fails.length ? fails.length + ' failed' : 'all visit checks passed'); process.exit(fails.length ? 1 : 0);
})();
