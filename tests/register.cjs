// THE BODEGA'S REGISTER: node tests/register.cjs dist/market.html [shot.png]. Double-click the register: every thing the bodega sells in one list (supplies, pet food among them, the shelves, the goods), the wheel scrolls it, a click puts one in the basket, PAY buys it.
const { chromium } = require('playwright'), path = require('path');
const fails = [], ok = (c, m) => { if (!c) { fails.push(m); console.log((process.env.GITHUB_ACTIONS ? '::error title=register::' : 'FAIL ') + m); } else console.log('ok   ' + m); };
(async () => {
  const b = await chromium.launch({ ...(process.env.PWEXE ? { executablePath: process.env.PWEXE } : {}), args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const pg = await b.newPage({ viewport: { width: 960, height: 640 } }), errs = [];
  pg.on('pageerror', e => errs.push(e.message.slice(0, 300) + (process.env.STACK ? ' @ ' + String(e.stack).slice(0, 600) : '')));
  await pg.goto('file://' + path.resolve(process.argv[2] || 'dist/market.html') + '?fresh=1&hour=12&res=0', { waitUntil: 'commit' });
  let st = false; for (let i = 0; i < 60 && !st; i++) { await pg.waitForTimeout(3000); st = await pg.evaluate(() => !!window.__started).catch(() => false); }
  ok(st, 'the page starts');
  if (st) {
    await pg.evaluate(() => ROOMS.enter('bodega'));
    const inB = await pg.waitForFunction(() => ROOMS.offIn && ROOMS.offIn() === 'bodega' && !(window.FADE && FADE.busy), null, { timeout: 180000 }).then(() => true).catch(() => false);
    ok(inB, 'in the bodega');
    const reg = await pg.evaluate(() => !!__dbg.UI.things.find(t => /THE REGISTER/.test(t.name)));
    ok(reg, 'the register is a thing to double-click');
    const A = await pg.evaluate(() => { const A = BODEGA.all(); return { sup: A.supplies.map(r => r.id), shelves: A.shelves.length, goods: A.goods.length }; });
    ok(['g_catfood', 'g_dogfood', 'g_fishfood', 'bottle', 'bait'].every(id => A.sup.includes(id)), 'the supplies are on the register: ' + A.sup.join(','));
    ok(A.shelves + A.goods > 5, 'the shelves and the goods are listed too (' + A.shelves + ' + ' + A.goods + ')');
    await pg.evaluate(() => { INV.cash = Math.max(INV.cash, 100); BODEGA.register(); });
    await pg.waitForTimeout(500);
    const cv = await pg.$('canvas[width="400"][height="440"]'), bx = await cv.boundingBox(), k = bx.width / 400;
    // the dog food's line: find its row and click it
    const row = await pg.evaluate(() => { const S = MINI.state(); return { i: S.rows.findIndex(r => r.id === 'g_dogfood'), sy: S.sy || 0 }; });   // the window's own rows and scroll
    const ky = bx.height / 440;
    await pg.mouse.click(bx.x + 200 * k, bx.y + (12 + row.i * 22 + 11 - row.sy) * ky);   // the window reads a click on its next frame: wait for it (a slow machine's frames are long)
    await pg.waitForFunction(() => (BODEGA.basket.get('g_dogfood') || 0) > 0, null, { timeout: 10000, polling: 100 }).catch(() => {});
    const bag = await pg.evaluate(() => BODEGA.basket.get('g_dogfood') || 0);
    ok(bag === 1, 'a click on the dog food puts one in the basket');
    if (process.argv[3]) await pg.screenshot({ path: process.argv[3], clip: { x: bx.x - 20, y: bx.y - 50, width: bx.width + 40, height: bx.height + 110 } });
    await pg.mouse.move(bx.x + 200 * k, bx.y + 200 * k); for (let i = 0; i < 6; i++) { await pg.mouse.wheel(0, 200); await pg.waitForTimeout(80); }
    await pg.waitForTimeout(300);
    const d0 = await pg.evaluate(() => INV.items.g_dogfood || 0);
    await pg.mouse.click(bx.x + 100 * k, bx.y + 410 * (bx.height / 440));
    await pg.waitForFunction(() => BODEGA.basket.size === 0, null, { timeout: 10000, polling: 100 }).catch(() => {});
    const d1 = await pg.evaluate(() => ({ n: INV.items.g_dogfood || 0, left: BODEGA.basket.size }));
    ok(d1.n === d0 + 1 && d1.left === 0, 'PAY buys it: the dog food is yours (' + d0 + ' -> ' + d1.n + ')');
    const err = await pg.evaluate(() => Object.entries(SYS.P).flatMap(([k, v]) => v.filter(s => s.err).map(s => k + ':' + s.name)));
    ok(!err.length, 'no SYS errors (' + err.join(',') + ')');
  }
  ok(!errs.length, 'no page errors (' + errs.slice(0, 3).join(' | ') + ')');
  await b.close(); console.log(fails.length ? fails.length + ' failed' : 'all ok'); process.exit(fails.length ? 1 : 0);
})();
