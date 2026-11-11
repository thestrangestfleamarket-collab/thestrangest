// THE ITEMS CHECK: node tests/items.cjs dist/market.html. Every live item has its own picture (a photograph of its 3D model, 8 Nov 2026) and a name; the dead tools and the gift shop's prints are archived; the BMX, kite and camera are sold; in your apartment fish food feeds the koi (they rise).
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
    // each picture is a photograph of the thing's own 3D model (owner, 8 Nov 2026: "no more icons"), taken a few a frame once asked for: ask for them all, wait until no more come
    const pics = () => pg.evaluate(async () => { const live = ITEMS.ids().filter(id => !ARCHI(id) && !/^hb_/.test(id)), B = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';   // the bag's blank, until the picture is taken
      const look = u => new Promise(r => { if (!u || u === B) return r({ w: 0, ink: 0 }); const im = new Image(); im.onload = () => { const c = document.createElement('canvas'); c.width = im.width; c.height = im.height; const g = c.getContext('2d'); g.drawImage(im, 0, 0); const d = g.getImageData(0, 0, c.width, c.height).data; let ink = 0; for (let i = 3; i < d.length; i += 4) if (d[i] > 20) ink++; r({ w: im.width, ink }); }; im.onerror = () => r({ w: -1, ink: 0 }); im.src = u; });
      const L = await Promise.all(live.map(id => look(BAG.icon(id)))), bad = [], noname = [];
      live.forEach((id, i) => { if (L[i].w !== 96 || L[i].ink < 30 || !INSPECT.has(id)) bad.push(id + ' ' + L[i].w + '/' + L[i].ink + (INSPECT.has(id) ? '' : ' (the parcel)')); const n = FORAGE.name(id); if (!n || n === id) noname.push(id); });
      return { n: live.length, bad, noname, arch: ['scanner', 'extractor', 'cutter', 'art_print', 'art_postcard'].filter(id => !ARCHI(id)) }; });
    // (the Polyfork models come a few seconds after the start and every picture taken before is taken again then: ask once they are here)
    await pg.evaluate(() => window.PFI && PFI.load && PFI.load()).catch(() => {});
    let r = await pics(), last = -1, still = 0;
    for (let i = 0; i < 300 && r.bad.length && still < 10; i++) { await pg.waitForTimeout(2000); r = await pics(); still = r.bad.length === last ? still + 1 : 0; last = r.bad.length; }
    ok(r.n > 300 && !r.bad.length, 'every live item (' + r.n + ') has its own picture, a photograph of its own 3D model (not the parcel)' + (r.bad.length ? ': not ' + r.bad.length + ': ' + r.bad.slice(0, 12) : ''));
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
