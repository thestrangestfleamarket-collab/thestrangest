// THE BBS CHECK: node tests/bbs.cjs dist/market.html. The computer in your apartment: double-click it and THE MARKET BBS (the C64 terminal) fills the screen; the dial-in runs to the menu; the bodega and the furniture catalog take an order; the money comes off, a drone brings it to your fire escape and the furniture is yours; DRONE VIEW shows the delivery; Esc stands you up.
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

    // open the terminal
    await pg.evaluate(() => window.DRONE.open()); await pg.waitForTimeout(400);
    ok(await pg.evaluate(() => !!document.getElementById('bbswin') && DRONEDBG().on), 'double-clicking the computer fills the screen with the BBS');
    ok(await pg.evaluate(() => { const c = document.querySelector('#bbswin canvas'); return c && c.width === 320 && c.height === 144; }), 'the screen is the C64 terminal canvas (40x18 cells)');

    // dial-in runs to the logo, a key opens the menu
    for (let i = 0; i < 12 && (await pg.evaluate(() => DRONEDBG().page)) === 'boot'; i++) await pg.waitForTimeout(600);
    ok((await pg.evaluate(() => DRONEDBG().page)) !== 'boot', 'the dial-in runs through to the terminal');
    await dispatch(pg, 'x'); await pg.waitForTimeout(150);
    ok((await pg.evaluate(() => DRONEDBG().page)) === 'menu', 'a key brings up the main menu');
    await dispatch(pg, 'S'); await pg.waitForTimeout(150);
    ok((await pg.evaluate(() => DRONEDBG().page)) === 'shop', 'S opens the bodega shop');

    await dispatch(pg, 'Enter'); await pg.waitForTimeout(150); const cf = await pg.evaluate(() => DRONEDBG().page);
    await dispatch(pg, 'N'); await pg.waitForTimeout(150); const nb = await pg.evaluate(() => DRONEDBG().page);
    ok(cf === 'confirm' && nb === 'shop', 'Enter on a pick opens the confirm screen, N backs out (' + cf + ', ' + nb + ')');
    // place an order (the one delivery path, DRONE.pick -> DRONE.go); the money comes off
    const d0 = await pg.evaluate(() => DRONEDBG());
    const furn = d0.furn > 0;
    await pg.evaluate(f => window.DRONE.pick(f ? 'furn' : 'shop', f ? 0 : 9), furn); await pg.waitForTimeout(500);
    const d1 = await pg.evaluate(() => DRONEDBG());
    ok(d1.cash < d0.cash, 'the order takes the money off (' + d0.cash + ' -> ' + d1.cash + ')');
    ok(d1.page === 'ordered', 'the screen confirms the order');
    { const e0 = await pg.evaluate(() => { const D = DRONEDBG(); return { cash: D.cash }; }); await dispatch(pg, 'M'); await pg.waitForTimeout(150); await dispatch(pg, 'S'); await pg.waitForTimeout(150); await dispatch(pg, 'Enter'); await pg.waitForTimeout(150); const p1 = await pg.evaluate(() => DRONEDBG().page); await dispatch(pg, 'Enter'); await pg.waitForTimeout(500); const e1 = await pg.evaluate(() => DRONEDBG());
      ok(p1 === 'confirm' && e1.page !== 'confirm', 'Enter on the confirm screen orders, so a pad\'s or the headset\'s A can buy (' + p1 + ' -> ' + e1.page + ')'); }

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

    // DRONE VIEW, then Esc stands you up
    await pg.evaluate(() => { window.DRONE.open(); }); await pg.waitForTimeout(200);
    // THE ARCADE from the BBS: the main menu by arrows and RETURN, the cabinets' list, a game over the terminal, ESC brings the terminal back
    const page = () => pg.evaluate(() => DRONEDBG().page);   // the terminal may still be up from the order: M brings its menu back
    for (let i = 0; i < 40 && (await page()) === 'boot'; i++) await pg.waitForTimeout(500);
    if ((await page()) === 'logo') await dispatch(pg, 'x'); else if ((await page()) !== 'menu') await dispatch(pg, 'm'); for (let i = 0; i < 20 && (await page()) !== 'menu'; i++) await pg.waitForTimeout(300);
    await dispatch(pg, 'ArrowDown'); await dispatch(pg, 'ArrowDown'); await pg.waitForTimeout(100); await dispatch(pg, 'Enter'); await pg.waitForTimeout(200);
    ok((await page()) === 'games', 'arrows and RETURN pick THE ARCADE on the main menu (' + await page() + ')');
    for (let i = 0; i < 60 && !(await pg.evaluate(() => DRONEDBG().arc)); i++) await pg.waitForTimeout(500);
    const ga = await pg.evaluate(() => DRONEDBG()); ok(ga.arc && ga.games.length === 8 && ga.games[0] === 'RAINBOW RUN' && ga.games[6] === 'TORCHBEARER', 'the arcade\'s eight cabinets list, wall by wall (' + ga.games.join(', ') + ')');
    await pg.evaluate(() => { INV.cash = Math.max(INV.cash || 0, 20); }); await dispatch(pg, 'Enter');
    let cab = false; for (let i = 0; i < 120 && !(cab = await pg.evaluate(() => STORE.cabs.on && STORE.cabs.dbg().loaded)); i++) await pg.waitForTimeout(500);
    ok(cab && (await pg.evaluate(() => STORE.cabs.dbg().name)) === 'RAINBOW RUN', 'RETURN opens the cabinet over the terminal');
    await dispatch(pg, ' '); await pg.waitForTimeout(400); ok((await pg.evaluate(() => STORE.cabs.dbg().mode)) === 'play', 'the keys reach the game, not the terminal (a coin starts a run)');
    await dispatch(pg, 'Escape'); await pg.waitForTimeout(300);
    ok(await pg.evaluate(() => !STORE.cabs.on && DRONEDBG().on && DRONEDBG().page === 'games'), 'ESC leaves the cabinet and the terminal is still up on THE ARCADE');
    await dispatch(pg, 'm'); await pg.waitForTimeout(150); ok((await pg.evaluate(() => DRONEDBG().page)) === 'menu', 'M goes back to the main menu');
    await dispatch(pg, 'Escape'); await pg.waitForTimeout(200);
    ok(await pg.evaluate(() => !document.getElementById('bbswin') && !DRONEDBG().on), 'Esc stands you up and clears the screen');

    const err = await pg.evaluate(() => Object.entries(SYS.P).flatMap(([k, v]) => v.filter(s => s.err).map(s => k + ':' + s.name)));
    ok(!err.length, 'no SYS errors (' + err.join(',') + ')');
  }
  ok(!errs.length, 'no page errors' + (errs.length ? ': ' + errs.slice(0, 3).join(' | ') : ''));
  await b.close();
  console.log(fails.length ? fails.length + ' failed' : 'all bbs checks passed');
  process.exit(fails.length ? 1 : 0);
})();
