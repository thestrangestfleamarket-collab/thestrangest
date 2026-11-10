// THE ITEMS CHECK: node tests/items.cjs dist/market.html. Every live item has its own 3D model for its picture (owner, 8 Nov 2026) and a name; the dead tools and the gift shop's prints are archived; the BMX, kite and camera are sold; in your apartment fish food feeds the koi (they rise).
const { chromium } = require('playwright'), path = require('path'), fs = require('fs');
const fails = [], ok = (c, m) => { if (!c) { fails.push(m); console.log((process.env.GITHUB_ACTIONS ? '::error title=items::' : 'FAIL ') + m); } else console.log('ok   ' + m); };
(async () => {
  const b = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const pg = await b.newPage({ viewport: { width: 1100, height: 760 } }), errs = [];
  pg.on('pageerror', e => errs.push(e.message.slice(0, 300)));
  await pg.goto('file://' + path.resolve(process.argv[2] || 'dist/market.html') + '?fresh=1&furnished=1&hour=17&place=your%20apartment', { waitUntil: 'commit' });
  let st = false; for (let i = 0; i < 60 && !st; i++) { await pg.waitForTimeout(3000); st = await pg.evaluate(() => !!window.__started).catch(() => false); }
  ok(st, 'the page starts');
  if (st) {
    const C = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/characters.json'), 'utf8')), sold = new Set(Object.values(C).flatMap(c => c && c.trade && c.trade.sells || []));
    ok(['bmx', 'kite', 'camera'].every(id => sold.has(id)), 'the BMX, the kite and the camera have a shop');
    // (a thing's picture is its own 3D model photographed, owner 8 Nov 2026: "no more icons"; so every live item needs a model with something in it)
    const r = await pg.evaluate(async () => { const T = window.THREE || (window.__dbg && __dbg.THREE);
      const live = ITEMS.ids().filter(id => !ARCHI(id)), small = [], noname = [];
      live.forEach(id => { let m = null; try { m = INSPECT.model(id); } catch (e) {} let ok = false; if (m) { let n = 0; m.traverse(o => { if (o.isMesh && o.geometry && o.geometry.attributes.position && o.geometry.attributes.position.count) n++; }); ok = n > 0; } if (!ok) small.push(id); const nm = FORAGE.name(id); if (!nm || nm === id) noname.push(id); });
      return { n: live.length, small, noname, arch: ['scanner', 'extractor', 'cutter', 'art_print', 'art_postcard'].filter(id => !ARCHI(id)) }; });
    ok(r.n > 300 && !r.small.length, 'every live item (' + r.n + ') has its own 3D model for its picture' + (r.small.length ? ': not ' + r.small.slice(0, 12) : ''));
    ok(!r.noname.length, 'every live item has a name' + (r.noname.length ? ': not ' + r.noname : ''));
    ok(!r.arch.length, 'the scanner, extractor, cutter and the painting print and postcard are archived' + (r.arch.length ? ': not ' + r.arch : ''));
    for (let i = 0; i < 40 && !(await pg.evaluate(() => window.TANKDBG && TANKDBG().some(t => t.fish > 0 && t.vis))); i++) await pg.waitForTimeout(1000);
    const th = () => __dbg.UI.things.find(t => /FISH TANK|FEED THE FISH/.test(t.name));
    ok(await pg.evaluate(th), 'the fish tank can be double-clicked');
    const y0 = await pg.evaluate(() => TANKDBG()[0].y);
    await pg.evaluate(() => { FORAGE.give('g_fishfood', 1); __dbg.UI.things.find(t => /FISH TANK|FEED THE FISH/.test(t.name)).act(); });
    for (let i = 0; i < 40 && (await pg.evaluate(() => TANKDBG()[0].y)) < y0 + .1; i++) await pg.waitForTimeout(500);
    const d = await pg.evaluate(() => ({ t: TANKDBG()[0], left: FORAGE.has('g_fishfood') }));
    ok(d.t.fed > 0 && d.t.y > y0 + .1 && !d.left, 'fish food is used up and the koi rise to eat (' + y0 + ' -> ' + d.t.y + ')');
  }
  ok(!errs.length, 'no page errors' + (errs.length ? ': ' + errs.slice(0, 3).join(' | ') : ''));
  await b.close(); process.exit(fails.length ? 1 : 0);
})();
