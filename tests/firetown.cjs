// THE TOWN FROM YOUR FIRE ESCAPE CHECK: node tests/firetown.cjs dist/market.html (owner, 9 Nov 2026): out on your landing the real town is pictured behind it, a cube in the behind view, one flat picture in the isometric, retaken slowly; back in your rooms it is gone and no more pictures are taken.
const { chromium } = require('playwright'), path = require('path');
const fails = [], ok = (c, m) => { if (!c) { fails.push(m); console.log((process.env.GITHUB_ACTIONS ? '::error title=firetown::' : 'FAIL ') + m); } else console.log('ok   ' + m); };
(async () => {
  const b = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const pg = await b.newPage({ viewport: { width: 900, height: 600 } }), errs = [];
  pg.on('pageerror', e => errs.push(e.message.slice(0, 300)));
  await pg.goto('file://' + path.resolve(process.argv[2] || 'dist/market.html') + '?fresh=1&hour=13&place=your%20fire%20escape', { waitUntil: 'commit' });
  let st = false; for (let i = 0; i < 60 && !st; i++) { await pg.waitForTimeout(3000); st = await pg.evaluate(() => !!window.__started).catch(() => false); }
  ok(st, 'the page starts');
  if (st) {
    const T = () => pg.evaluate(() => FIREDBG()), till = async f => { let d = null; for (let i = 0; i < 60; i++) { d = await T(); if (f(d)) break; await pg.waitForTimeout(1000); } return d; };
    let d = await till(d => d.on && d.town.on && d.town.n > 0);
    ok(d.on && d.town.on && d.town.flat, 'on the landing the town is pictured, flat in the isometric view (' + JSON.stringify(d.town) + ')');
    await pg.evaluate(() => __dbg.ui().setView('third')); const n0 = d.town.n;
    d = await till(d => !d.town.flat && d.town.n >= n0 + 7);
    ok(!d.town.flat && d.town.n >= n0 + 7, 'in the behind view a cube of pictures, retaken a face at a time (' + JSON.stringify(d.town) + ')');
    await pg.screenshot({ path: process.env.SHOT || '/tmp/firetown.png' });
    await pg.evaluate(async () => { await FIREV.back(); for (let i = 0; i < 40 && (window.FADE && FADE.busy); i++) await new Promise(r => setTimeout(r, 250)); });
    d = await till(d => !d.on && !d.town.on); const n1 = d.town.n; await pg.waitForTimeout(3000); d = await T();
    ok(!d.on && !d.town.on && d.town.n === n1, 'in your rooms no town is pictured (' + JSON.stringify(d.town) + ')');
  }
  ok(!errs.length, 'no page errors' + (errs.length ? ': ' + errs.join(' | ') : ''));
  await b.close(); process.exit(fails.length ? 1 : 0);
})();
