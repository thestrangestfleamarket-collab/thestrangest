// THE BBS CHECK: node tests/bbs.cjs dist/market.html. The computer in your apartment: double-click it and the menu's BBS opens; the bodega and the furniture catalog take an order; the money comes off; the drone delivers to the fire escape; THE ARCADE's games play from it.
const { chromium } = require('playwright'), path = require('path');
const fails = [], ok = (c, m) => { if (!c) { fails.push(m); console.log((process.env.GITHUB_ACTIONS ? '::error title=bbs::' : 'FAIL ') + m); } else console.log('ok   ' + m); };
const dispatch = (pg, key) => pg.evaluate(k => window.dispatchEvent(new KeyboardEvent('keydown', { key: k, bubbles: true })), key);
(async () => {
  const b = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const pg = await b.newPage({ viewport: { width: 960, height: 600 } }), errs = [];
  pg.on('pageerror', e => errs.push(e.message.slice(0, 300)));
  await pg.goto('file://' + path.resolve(process.argv[2] || 'dist/market.html') + '?fresh=1&furnished=1&hour=17&place=your%20apartment', { waitUntil: 'commit' });
  let st = false; for (let i = 0; i < 60 && !st; i++) { await pg.waitForTimeout(3000); st = await pg.evaluate(() => !!window.__started).catch(() => false); }
  ok(st, 'the page starts');
  if (st) {
    for (let i = 0; i < 30 && !(await pg.evaluate(() => typeof window.DRONEDBG === 'function')); i++) await pg.waitForTimeout(1000);
    ok(await pg.evaluate(() => typeof window.DRONEDBG === 'function'), 'the drone/BBS is set up in the apartment');
    ok(await pg.evaluate(() => __dbg.UI.things.some(t => t.name === 'THE COMPUTER')), 'the computer is a thing you can use');

    // open the BBS
    await pg.evaluate(() => window.DRONE.open()); await pg.waitForTimeout(400);
    ok(await pg.evaluate(() => DRONEDBG().on && DRONEDBG().page === 'shop' && document.querySelectorAll('#dbbs [data-buy]').length > 0), 'double-clicking the computer opens the menu\'s BBS at the bodega');
    ok(await pg.evaluate(() => !document.getElementById('bbswin')), 'no C64 terminal any more');
    await pg.evaluate(() => document.querySelector('#msub [data-sub="furn"]').click()); await pg.waitForTimeout(150);
    ok(await pg.evaluate(() => DRONEDBG().page === 'furn'), 'FURNITURE is a tab');
    // place an order (the one delivery path, DRONE.pick -> DRONE.go); the money comes off
    const d0 = await pg.evaluate(() => DRONEDBG());
    const furn = d0.furn > 0;
    await pg.evaluate(f => window.DRONE.pick(f ? 'furn' : 'shop', 0), furn); await pg.waitForTimeout(500);
    const d1 = await pg.evaluate(() => DRONEDBG());
    ok(d1.cash < d0.cash, 'the order takes the money off (' + d0.cash + ' -> ' + d1.cash + ')');
    ok(d1.page === 'orders' && d1.orders === 1, 'YOUR ORDERS shows it');

    // the drone delivers to the fire escape; bring the parcel in (furniture becomes yours)
    let delivered = false;
    for (let i = 0; i < 40 && !delivered; i++) {
      await pg.waitForTimeout(500);
      const dd = await pg.evaluate(o0 => {
        const t = __dbg.UI.things.find(t => /^A PARCEL:/.test(t.name)); if (t) t.act();   // bring any parcel in
        return DRONEDBG();
      }, d0.owned);
      if (furn) delivered = dd.owned > d0.owned;                       // furniture placed itself
      else delivered = dd.parcels === 0 && dd.state === 'home';        // bodega parcel brought in, drone home
    }
    const dEnd = await pg.evaluate(() => DRONEDBG());
    if (furn) ok(dEnd.owned === d0.owned + 1, 'the drone delivers it and the furniture is yours (owned ' + d0.owned + ' -> ' + dEnd.owned + ')');
    else ok(delivered, 'the drone delivers the bodega order to your fire escape');

    // THE ARCADE from the BBS: the cabinets' list, PLAY opens a game, ESC leaves it
    await pg.evaluate(() => window.DRONE.openAt('games')); await pg.waitForTimeout(200);
    ok(await pg.evaluate(() => DRONEDBG().page === 'games'), 'THE ARCADE is a tab');
    for (let i = 0; i < 60 && !(await pg.evaluate(() => DRONEDBG().arc)); i++) await pg.waitForTimeout(500);
    const ga = await pg.evaluate(() => ({ ...DRONEDBG(), want: [...STORE.cabs.walls.e, ...STORE.cabs.walls.w].filter(n => STORE.cabs.reg[n]) }));   // the arcade's cabinets as they stand (archived games are not there)
    ok(ga.arc && ga.games.length >= 1 && ga.games.join() === ga.want.join() && ga.games.includes('TORCHBEARER'), 'the arcade\'s cabinets list, wall by wall (' + ga.games.join(', ') + ')');
    await pg.waitForTimeout(300); await pg.evaluate(() => { INV.cash = Math.max(INV.cash || 0, 20); document.querySelector('#dbbs [data-play]').click(); });
    let cab = false; for (let i = 0; i < 120 && !(cab = await pg.evaluate(() => STORE.cabs.on && STORE.cabs.dbg().loaded)); i++) await pg.waitForTimeout(500);
    ok(cab && (await pg.evaluate(() => STORE.cabs.dbg().name)) === 'RAINBOW RUN', 'PLAY opens the cabinet');
    await dispatch(pg, ' '); await pg.waitForTimeout(400); ok((await pg.evaluate(() => STORE.cabs.dbg().mode)) === 'play', 'the keys reach the game (a coin starts a run)');
    await dispatch(pg, 'Escape'); await pg.waitForTimeout(300);
    ok(await pg.evaluate(() => !STORE.cabs.on), 'ESC leaves the cabinet');

    const err = await pg.evaluate(() => Object.entries(SYS.P).flatMap(([k, v]) => v.filter(s => s.err).map(s => k + ':' + s.name)));
    ok(!err.length, 'no SYS errors (' + err.join(',') + ')');
  }
  ok(!errs.length, 'no page errors' + (errs.length ? ': ' + errs.slice(0, 3).join(' | ') : ''));
  await b.close();
  console.log(fails.length ? fails.length + ' failed' : 'all bbs checks passed');
  process.exit(fails.length ? 1 : 0);
})();
