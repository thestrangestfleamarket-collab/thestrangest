// THE MICROSCOPE'S EXTRAS CHECK: node tests/micplus.cjs dist/market.html. Stones from the bag as thin sections whose grains go dark at extinction and glow off it (opal dark between crossed polars); a jar's culture follows the succession; a stain stops the living; 100x hazes without oil; tapping a paramecium names it in the book; a full page gives its plate; a micrograph is a sellable print. SHOTS=<dir> saves pictures.
const { chromium } = require('playwright'), path = require('path');
const fails = [], ok = (c, m) => { if (!c) { fails.push(m); console.log((process.env.GITHUB_ACTIONS ? '::error title=micplus::' : 'FAIL ') + m); } else console.log('ok   ' + m); };
const SHOTS = process.env.SHOTS;
(async () => {
  const b = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--allow-file-access-from-files'] });
  const pg = await b.newPage({ viewport: { width: 1100, height: 760 } }), errs = [];
  pg.on('pageerror', e => errs.push(e.message.slice(0, 300)));
  await pg.goto('file://' + path.resolve(process.argv[2] || 'dist/market.html') + '?fresh=1&furnished=1&hour=17&place=your%20apartment', { waitUntil: 'commit' });
  let st = false; for (let i = 0; i < 60 && !st; i++) { await pg.waitForTimeout(3000); st = await pg.evaluate(() => !!window.__started).catch(() => false); }
  ok(st, 'the page starts');
  if (st) {
    for (let i = 0; i < 30 && !(await pg.evaluate(() => window.BEDROOMDBG && BEDROOMDBG().built)); i++) await pg.waitForTimeout(1000);
    await pg.evaluate(() => { for (const id of ['quartz', 'opal', 'meteor', 'bird_feather', 'jar_s']) FORAGE.give(id, 1); __dbg.UI.things.find(t => t.name === 'LOOK IN THE MICROSCOPE').act(); });
    for (let i = 0; i < 30 && !(await pg.evaluate(() => MICDBG().open && !!MIC.data)); i++) await pg.waitForTimeout(300);
    const sl = await pg.evaluate(() => MIC.slides().filter(s => s.mag === 'YOUR BAG').map(s => s.id));
    ok(['bag:stones:quartz', 'bag:stones:opal', 'bag:stones:meteor', 'bag:feathers:bird_feather'].every(i => sl.includes(i)), 'what you carry is in the slide box, FROM YOUR BAG (' + sl.join(', ') + ')');

    // the thin section: a grain dark when its axis lies along a polariser, bright 45 degrees off; opal (no crystal grain) dark between crossed polars, bright between parallel ones
    const th = await pg.evaluate(() => { const P = MICX.P, G = MICX.gr('quartz'), i = G.findIndex(g => g.s2 > .7), sum = c => c[0] + c[1] + c[2]; P.pol = true; P.ana = true;
      P.rot = G[i].az; const ext = sum(MICX.grain('quartz', i)); P.rot = G[i].az + 45; const lit = MICX.grain('quartz', i);
      const op = Math.max(...MICX.gr('opal').map((_, j) => Math.max(...MICX.grain('opal', j)))); P.ana = false; const opP = Math.min(...MICX.gr('opal').map((_, j) => Math.min(...MICX.grain('opal', j)))); P.ana = true;
      P.rot = 0; const ol = MICX.gr('meteor').map((_, j) => MICX.grain('meteor', j)), spread = Math.max(...ol.map(c => Math.max(...c) - Math.min(...c)));
      return { ext, lit, op, opP, spread }; });
    ok(th.ext < .05 && th.lit.reduce((a, b) => a + b) > .6, 'a quartz grain goes dark at extinction and glows 45° off it (' + th.ext.toFixed(3) + ' vs ' + th.lit.map(x => x.toFixed(2)) + ')');
    ok(th.op < .01 && th.opP > .8, 'opal stays dark between crossed polars and bright between parallel ones (' + th.op.toFixed(3) + ', ' + th.opP.toFixed(2) + ')');
    ok(th.spread > .3, 'olivine (Δn .035) shows strong interference colours (' + th.spread.toFixed(2) + ')');
    await pg.evaluate(() => { MIC.place('bag:stones:meteor'); MIC.setFocus(0); MICX.P.rot = 20; });
    for (let i = 0; i < 40 && !(await pg.evaluate(() => !!MICX.S.seen['stones:meteor'] && !!FIRSTS.of('crystal'))); i++) await pg.waitForTimeout(500);
    const cr = await pg.evaluate(() => ({ seen: !!MICX.S.seen['stones:meteor'], first: !!(FIRSTS.of('crystal')) }));
    ok(cr.seen && cr.first, 'a thin section in focus between crossed polars goes in the book and on tonight\'s board (' + JSON.stringify(cr) + ')');
    if (SHOTS) await pg.screenshot({ path: SHOTS + '/mic-thin.png', timeout: 240000 });

    // the jars: the succession
    const cu = await pg.evaluate(() => { const c = MICX.counts; return { d0: c(.5, .5), d4: c(4, .5), d12: c(12, .5), d12s: c(12, 8), d16: c(16, 1) }; });
    ok(cu.d0.paramecium === 0 && cu.d0.silt > cu.d4.silt, 'day ½: bacteria cloud it, no paramecia yet (' + JSON.stringify(cu.d0) + ')');
    ok(cu.d4.paramecium >= 10 && cu.d4.paramecium > cu.d12.paramecium && cu.d12.rotifer >= 3 && cu.d4.rotifer < cu.d12.rotifer, 'day 4 the paramecia boom, by day 12 rotifers graze and they fall (' + cu.d4.paramecium + ' -> ' + cu.d12.paramecium + ', rotifers ' + cu.d4.rotifer + ' -> ' + cu.d12.rotifer + ')');
    ok(cu.d12s.paramecium < cu.d12.paramecium && cu.d16.daphnia === 1 && cu.d4.daphnia === 0, 'a hungry jar declines; only an old, fed jar hatches a water flea (' + cu.d12s.paramecium + ', ' + cu.d16.daphnia + ')');
    const jar = await pg.evaluate(async () => { const pan = document.querySelector('#micp .pan'); pan.querySelector('[data-x="jar"]').click(); await new Promise(r => setTimeout(r, 200));
      const n = MICX.S.jars.length, left = FORAGE.has('jar_s'); MICX.S.jars[0].t0 = Date.now() - 4 * 864e5; document.querySelector('#micp .pan [data-x="drop:0"]').click(); await new Promise(r => setTimeout(r, 300));
      const d = MICDBG(); return { n, left, slide: d.slide, para: d.org.filter(o => o.k === 'paramecium').length }; });
    ok(jar.n === 1 && jar.left === 0 && jar.slide === 'jar:0' && jar.para >= 10, 'START A JAR uses a small jar; a drop of a 4-day jar is full of paramecia (' + JSON.stringify(jar) + ')');

    // a stain kills them: only Brownian motion is left
    const sn = await pg.evaluate(async () => { MIC.place('pond'); await new Promise(r => setTimeout(r, 300)); const a = MICDBG().org; await new Promise(r => setTimeout(r, 1000)); const b0 = MICDBG().org;
      const moved0 = b0.filter((o, i) => Math.hypot(o.x - a[i].x, o.y - a[i].y) > 1).length;
      document.querySelector('#micp .pan [data-x="stain:blue"]').click(); await new Promise(r => setTimeout(r, 200)); const c = MICDBG().org; await new Promise(r => setTimeout(r, 1200)); const d = MICDBG().org;
      return { moved0, after: d.filter((o, i) => Math.hypot(o.x - c[i].x, o.y - c[i].y) > .5).length, still: MIC.K.V.still }; });
    ok(sn.moved0 >= 3 && sn.after === 0 && sn.still, 'a stained drop: they swam (' + sn.moved0 + ' moved), now none does (' + sn.after + ')');
    const fresh = await pg.evaluate(() => { MIC.place('pond'); return { still: MIC.K.V.still, stain: MICX.P.stain }; });
    ok(!fresh.still && fresh.stain === 'none', 'a fresh drop is unstained and alive');

    // oil at 100x
    const oil = await pg.evaluate(async () => { MIC.objective(3); await new Promise(r => setTimeout(r, 100)); const a = MIC.blurAt(0); document.querySelector('#micp .pan [data-x="oil"]').click(); const b = MIC.blurAt(0); MIC.objective(1); const c = MIC.blurAt(0); return { a, b, c }; });
    ok(oil.a > oil.b + 3 && oil.c === 0, '100x without immersion oil is hazy, with it sharp; 10x needs none (' + [oil.a, oil.b, oil.c].map(x => x.toFixed(2)) + ')');

    // tapping a paramecium names it
    const tp = await pg.evaluate(() => { MIC.place('pond'); MIC.objective(1); const V = MIC.K.V, o = V.org.find(o => o.k === 'paramecium'); if (!o) return null; V.zf = o.z - 50;
      MIC.ext[MIC.ext.length - 1].tap(o.x, o.y); return { seen: !!MICX.S.seen['pond:paramecium'], cap: MICX.P.cap && MICX.P.cap.sci, panel: document.querySelector('#micp .pan').innerText.includes('Paramecium') }; });
    ok(tp && tp.seen && tp.cap === 'Paramecium' && tp.panel, 'tapping a paramecium names it (iNaturalist\'s facts beside it) and puts it in the book (' + JSON.stringify(tp) + ')');
    // a full page: its plate, which the Professor buys
    const pl = await pg.evaluate(() => { for (const k of MICX.members('pond')) MICX.see('pond:' + k); return { n: FORAGE.has('plate_pond'), sell: ITEMS.prop('plate_pond', 'sellable'), v: ITEMS.prop('plate_pond', 'value'), buys: (FORAGE.BUYK.plates || []).includes('plate_') }; });
    ok(pl.n === 1 && pl.sell && pl.v === 300 && pl.buys, 'a full page (POND LIFE) gives one sellable plate ($300) in the Professor\'s "plates" (' + JSON.stringify(pl) + ')');
    await pg.evaluate(() => MICX.book('pond')); await pg.waitForTimeout(500);
    const bk = await pg.evaluate(() => { const el = document.getElementById('micbook'); return { shown: el && el.style.display === 'flex', imgs: el.querySelectorAll('img').length }; });
    ok(bk.shown && bk.imgs >= 8, 'MY SPECIMENS opens the book, the pond page drawn (' + JSON.stringify(bk) + ')');
    if (SHOTS) await pg.screenshot({ path: SHOTS + '/mic-book.png', timeout: 240000 });
    await pg.evaluate(() => { document.getElementById('micbook').style.display = 'none'; });

    // a micrograph
    const mg = await pg.evaluate(async () => { MIC.place('cheek'); MIC.objective(2); MIC.setFocus(0); for (let i = 0; i < 30 && !MICDBG().img; i++) await new Promise(r => setTimeout(r, 200));
      document.querySelector('#micp .pan [data-x="stain:blue"]').click(); await new Promise(r => setTimeout(r, 600)); const p = MICX.shoot();
      return p && { v: p.v, cap: p.cap, have: FORAGE.has(p.id), sell: ITEMS.prop(p.id, 'sellable'), val: ITEMS.prop(p.id, 'value'), jpg: p.src.startsWith('data:image/jpeg') }; });
    ok(mg && mg.have === 1 && mg.sell && mg.val === mg.v && mg.v >= 1 && mg.jpg, 'TAKE MICROGRAPH makes a sellable print with its worth (' + JSON.stringify(mg) + ')');
    if (SHOTS) await pg.screenshot({ path: SHOTS + '/mic-stain.png', timeout: 240000 });
    const err = await pg.evaluate(() => Object.entries(SYS.P).flatMap(([k, v]) => v.filter(s => s.err).map(s => k + ':' + s.name)));
    ok(!err.length, 'no SYS errors (' + err.join(',') + ')');
  }
  ok(!errs.length, 'no page errors' + (errs.length ? ': ' + errs.slice(0, 3).join(' | ') : ''));
  await b.close();
  console.log(fails.length ? fails.length + ' failed' : 'all micplus checks passed');
  process.exit(fails.length ? 1 : 0);
})();
