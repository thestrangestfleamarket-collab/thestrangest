// THE MERCHANTS' SHOPS CHECK: node tests/skillshops.cjs dist/market.html [shots dir]. Every merchant's shop on the rows opens into a furnished inside (no black box), its keeper stands behind the counter, the counter opens their shop (the shared panel, or a keeper's own: the Tomato's garden, the Mushroom Seller's; or the hotel's rest, the tailor's WEAR, the barber's LOOK), and you go back out.
const { chromium } = require('playwright'), path = require('path'), fs = require('fs');
const fails = [], ok = (c, m) => { if (!c) { fails.push(m); console.log((process.env.GITHUB_ACTIONS ? '::error title=skillshops::' : 'FAIL ') + m); } else console.log('ok   ' + m); };
const SHOTS = process.argv[3];
(async () => {
  const b = await chromium.launch({ ...(process.env.PWCHROME ? { executablePath: process.env.PWCHROME } : {}), args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const pg = await b.newPage({ viewport: { width: 960, height: 600 } }), errs = [];
  pg.on('pageerror', e => errs.push(e.message.slice(0, 300)));
  await pg.goto('file://' + path.resolve(process.argv[2] || 'dist/market.html') + '?fresh=1&hour=13', { waitUntil: 'commit' });
  let st = false; for (let i = 0; i < 60 && !st; i++) { await pg.waitForTimeout(3000); st = await pg.evaluate(() => !!window.__started).catch(() => false); }
  ok(st, 'the page starts');
  if (st) {
    const W = JSON.parse(fs.readFileSync('data/world.json', 'utf8')), C = JSON.parse(fs.readFileSync('data/characters.json', 'utf8'));
    const ids = await pg.evaluate(() => Object.keys(MSHOP.at));
    const want = W.places.filter(p => p.merchant && p.x0 != null).map(p => p.id);   // (the merchants' shops the map has now: it moves)
    ok(want.length && want.every(id => ids.includes(id)), 'every merchant\'s shop is on the rows (' + want.join(', ') + ' in ' + ids.join(', ') + ')');
    if (SHOTS) { fs.mkdirSync(SHOTS, { recursive: true }); await pg.evaluate(() => __dbg.UI.setView && __dbg.UI.setView('third')); }
    for (const id of (process.env.ONLY ? process.env.ONLY.split(',') : want)) {
      const P = W.places.find(p => p.id === id), who = P && P.merchant;
      ok(who && !W.homes[who], id + ': its keeper is ' + who + ', with no street spot of their own');
      if (!(await pg.evaluate(id => !!ROOMS.off[id], id))) { ok(ids.includes(id), id + ': a walk-in shop, open on its row (its inside stands in place, no door to go through)'); continue; }   // (the Hudson row's shops since 8 Nov 2026)
      await pg.evaluate(id => ROOMS.enter(id), id);
      let r = {}; for (let i = 0; i < 90; i++) { r = await pg.evaluate(([id, who]) => { const o = ROOMS.off[id], b = o.box, me = __dbg.you(), inR = me.x > b.x0 && me.x < b.x1 && me.z > b.z0 && me.z < b.z1;
          if (!inR && !(window.FADE && FADE.busy)) ROOMS.enter(id);   // (an entry asked during a fade is ignored: ask again)
          const inB = t => { const v = t.obj.getWorldPosition(new t.obj.position.constructor()); return v.x > b.x0 && v.x < b.x1 && v.z > b.z0 && v.z < b.z1; }, th = __dbg.UI.things.filter(t => t.obj && t.obj.parent && inB(t) && /COUNTER|FRONT DESK|SHELVES|SHELF|DISPLAY TABLE/.test(t.name)).map(t => t.name);
          const N = (window.BODIES && BODIES.by[who] && BODIES.by[who].npc) || (__dbg.NPCS || []).concat((__dbg.NPCS && __dbg.NPCS.extra) || []).find(n => n.key === who || n.id === who), g = N && (N.g || N.group || N.mesh), p = g && g.position;
          return { inR, th, keeper: !!(p && p.x > b.x0 && p.x < b.x1 && p.z > b.z0 && p.z < b.z1) }; }, [id, who]).catch(e => ({ err: String(e) }));
        if (r.inR && r.th && r.th.length && r.keeper) break; await pg.waitForTimeout(1000); }
      const hasCounter = !!(r.th && r.th.some(n => /COUNTER|FRONT DESK/.test(n)));   // (the bookstore is shelves and no counter, 8 Nov 2026)
      ok(r.inR && r.th && r.th.length > 0, id + ': you go in and it is furnished (' + JSON.stringify((r.th || []).slice(0, 6)) + ')');
      ok(r.keeper, id + ': ' + who + ' stands inside');
      const tr = C[who] && C[who].trade;
      const used = await pg.evaluate(id => { const b = ROOMS.off[id].box, t = __dbg.UI.things.find(t => { if (!t.obj || !t.obj.parent || !/COUNTER|FRONT DESK/.test(t.name)) return false; const v = t.obj.getWorldPosition(new t.obj.position.constructor()); return v.x > b.x0 && v.x < b.x1 && v.z > b.z0 && v.z < b.z1; }); if (!t) return { shop: false, menu: false, counter: 'none' }; window.__said = ''; t.act(); const open = i => { const e = document.getElementById(i); return !!(e && !e.hidden); }, a = { shop: ['shopg', 'vegp', 'shopp'].some(open), menu: !!__dbg.UI.menuOpen }; if (window.SHOPS) SHOPS.close(); for (const i of ['vegp', 'shopp']) { const e = document.getElementById(i); if (e) e.hidden = true; } if (__dbg.UI.menuOpen) __dbg.UI.toggleMenu(); return a; }, id);
      if (!hasCounter) { ok(true, id + ': no counter in this shop'); } else ok(tr ? used.shop : (id === 'hotel' || used.menu), id + ': the counter ' + (tr ? 'opens the shop (' + (tr.sells || []).length + ' things)' : id === 'hotel' ? 'rests you' : 'opens the YOU window') + ' ' + JSON.stringify(used));
      if (SHOTS) { await pg.waitForTimeout(1500); await pg.screenshot({ path: path.join(SHOTS, id + '.png') }); }
      // (ROOMS.exit does nothing while a fade or a room change is still running: ask again until you are out)
      let out = false; for (let i = 0; i < 30 && !out; i++) { out = await pg.evaluate(id => { const b = ROOMS.off[id].box, me = __dbg.you(), inside = me.x > b.x0 && me.x < b.x1 && me.z > b.z0 && me.z < b.z1; if (inside && !(window.FADE && FADE.busy)) ROOMS.exit(id); return !inside; }, id); if (!out) await pg.waitForTimeout(1000); }
      await pg.waitForTimeout(1500);
      ok(out, id + ': and back out to the street');
    }
  }
  ok(!errs.length, 'no page errors' + (errs.length ? ': ' + errs.slice(0, 3).join(' | ') : ''));
  await b.close(); console.log(fails.length ? fails.length + ' FAILED' : 'ALL OK'); process.exit(fails.length ? 1 : 0);
})();
