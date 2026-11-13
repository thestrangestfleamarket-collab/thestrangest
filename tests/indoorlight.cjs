// THE INSIDES' LIGHT CHECK: node tests/indoorlight.cjs dist/market.html. At night a roofed public inside (a shop, the bodega, the observatory) keeps the day's light and no night tint; the street, an inside open to the sky and your apartment keep the real hour.
const { chromium } = require('playwright'), path = require('path');
let bad = 0; const ok = (c, n) => { console.log((c ? 'ok   ' : 'FAIL ') + n); if (!c) bad++; };
(async () => {
  const b = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const pg = await b.newPage({ viewport: { width: 640, height: 400 } }), errs = [];
  pg.on('pageerror', e => errs.push(e.message.slice(0, 300)));
  await pg.goto('file://' + path.resolve(process.argv[2] || 'dist/market.html') + '?fresh=1&hour=23&npcwait=99', { waitUntil: 'commit' });
  let st = false; for (let i = 0; i < 80 && !st; i++) { await pg.waitForTimeout(3000); st = await pg.evaluate(() => !!window.__started).catch(() => false); }
  ok(st, 'the game starts');
  if (st) {
    // (the tint eases, a place takes a moment to enter: each state is waited for, up to 40 s)
    const read = want => pg.evaluate(async want => { const I = DN.INDOOR, get = () => ({ indoor: DN.indoor(), sun: +CLOCK.sun.intensity.toFixed(2), fill: DN.fillL ? +DN.fillL.intensity.toFixed(2) : -1, day: [I.sun[1], I.fill[1]], night: +LOOK.night.value.toFixed(2), dark: CLOCK.dark() });
      const fits = r => want === 'day' ? r.indoor && r.sun === r.day[0] && r.fill === r.day[1] && r.night < .05 : !r.indoor && r.sun < 1 && r.night > .95; let r = get(); for (let i = 0; i < 80 && !fits(r); i++) { await new Promise(q => setTimeout(q, 500)); r = get(); } return { ...r, fits: fits(r) }; }, want);
    const out = await read('night');
    ok(out.dark && out.fits, 'on the street at 11 pm it is night: ' + JSON.stringify(out));
    for (const id of ['observatory', 'bodega', 'books']) { await pg.evaluate(id => ROOMS.enter(id), id); const r = await read('day'); await pg.evaluate(id => ROOMS.exit(id), id); await read('night');
      ok(r.fits, 'inside ' + id + ' the light is the day\'s and the night tint is off: ' + JSON.stringify(r)); }
    await pg.evaluate(() => ROOMS.enter('playhouse')); await pg.waitForTimeout(6000); const p = await read('night'); await pg.evaluate(() => ROOMS.exit('playhouse')); await pg.waitForTimeout(3000);
    ok(p.fits, 'the playhouse, open to the sky, keeps the night: ' + JSON.stringify(p));
    await pg.evaluate(() => __dbg.MAPK.MODS.apts.enterReal()); await pg.waitForTimeout(6000); const a = await pg.evaluate(() => ({ indoor: DN.indoor(), sun: +CLOCK.sun.intensity.toFixed(2), inReal: __dbg.MAPK.MODS.apts.inReal }));
    ok(a.inReal && !a.indoor && a.sun < 1, 'your apartment keeps the real hour: ' + JSON.stringify(a));
    await pg.evaluate(() => __dbg.MAPK.MODS.apts.exitReal()); const back = await read('night');
    ok(back.fits, 'back on the street it is night again');
  }
  ok(!errs.length, 'no page errors' + (errs.length ? ': ' + errs.join(' | ') : ''));
  await b.close(); console.log(bad ? bad + ' failed' : 'indoor light ok'); process.exit(bad ? 1 : 0);
})();
