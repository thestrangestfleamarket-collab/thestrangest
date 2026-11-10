// THE TELESCOPE AND THE GLOBES CHECK: node tests/scope.cjs dist/market.html. Nothing of the sky is fetched before you use it; the planets and the Moon where JPL's Horizons puts them; Betelgeuse up on the game's night and the tube slews to it; the Sun whites the eyepiece out without the solar filter; a flicked globe spins and slows; the close look opens with NASA's Earth. SHOTS=<dir> saves pictures.
const { chromium } = require('playwright'), path = require('path');
const fails = [], ok = (c, m) => { if (!c) { fails.push(m); console.log((process.env.GITHUB_ACTIONS ? '::error title=scope::' : 'FAIL ') + m); } else console.log('ok   ' + m); };
const SHOTS = process.env.SHOTS;
(async () => {
  const b = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--allow-file-access-from-files'] });   // the page's own pictures beside it, as on the website's one origin
  const pg = await b.newPage({ viewport: { width: 1000, height: 640 } }), errs = [], reqs = [];
  pg.on('pageerror', e => errs.push(e.message.slice(0, 300))); pg.on('request', r => reqs.push(r.url()));
  await pg.goto('file://' + path.resolve(process.argv[2] || 'dist/market.html') + '?fresh=1&furnished=1&hour=17&place=your%20apartment', { waitUntil: 'commit' });
  let st = false; for (let i = 0; i < 60 && !st; i++) { await pg.waitForTimeout(3000); st = await pg.evaluate(() => !!window.__started).catch(() => false); }
  ok(st, 'the page starts');
  if (st) {
    for (let i = 0; i < 30 && !(await pg.evaluate(() => window.BEDROOMDBG && BEDROOMDBG().built)); i++) await pg.waitForTimeout(1000);
    const t0 = await pg.evaluate(() => ({ things: __dbg.UI.things.map(t => t.name).filter(n => /TELESCOPE|GLOBE$/.test(n)), stars: !!SCOPE.stars, data: !!SCOPE.data, view: !!SCOPE.view, g: GLOBEDBG() }));
    ok(t0.things.includes('TELESCOPE') && ['EARTH GLOBE', 'MOON GLOBE', 'MARS GLOBE'].every(n => t0.things.includes(n)), 'the telescope and the three globes stand in your apartment (' + t0.things.join(', ') + ')');
    const early = reqs.filter(u => /data\/scope|stars\.json|scope\.json/.test(u));
    ok(!t0.stars && !t0.data && !t0.view && t0.g.loaded === 0 && !early.length, 'nothing of the sky or the globes is loaded before you use them (' + early.join(' ') + ')');

    await pg.evaluate(async () => { await SCOPE.open(); });
    const jd = (Date.UTC(2026, 10, 5, 5) / 864e5) + 2440587.5;
    const eph = await pg.evaluate(jd => { const A = SCOPE.astro, j = A.where('ju', jd), m = A.where('moon', jd); return { j: [j.ra, j.dec], m: [m.ra, m.dec], open: SCOPE.isOpen(), n: SCOPE.stars.s.length }; }, jd);
    const dd = (a, b) => Math.hypot((a[0] - b[0]) * Math.cos(b[1] * Math.PI / 180), a[1] - b[1]);
    const re = await pg.evaluate(async () => { const m = SCOPE.mag; SCOPE.filter = true; SCOPE.focus = -1; SCOPE.close(); await SCOPE.open(); return { m, f: SCOPE.focus, fl: SCOPE.filter }; });
    ok(re.m === 1 && re.f === .18 && !re.fl, 'it opens on the wide view, in focus, the solar filter off, every time (' + JSON.stringify(re) + ')');
    ok(eph.open && eph.n > 8000, 'the eyepiece opens with the Yale Bright Star Catalogue (' + eph.n + ' stars)');
    ok(dd(eph.j, [146.978, 14.039]) < 1, 'Jupiter within a degree of JPL Horizons on 5 Nov 2026 05:00 UT (' + eph.j.map(x => x.toFixed(2)) + ' vs 146.98,14.04)');
    ok(dd(eph.m, [173.894, .073]) < 1, 'the Moon within a degree of JPL Horizons (' + eph.m.map(x => x.toFixed(2)) + ' vs 173.89,0.07)');

    // the game's night is the real night: at the game's 1 am Betelgeuse is well up; GO TO slews the tube onto it
    const bt = await pg.evaluate(async () => { SCOPE.fixJD = SCOPE.jdAt(1); const i = SCOPE.stars.named.findIndex(n => n[2] === 'BETELGEUSE'), id = 'star:' + i, h = SCOPE.altOf(id); SCOPE.mag = 50; SCOPE.goTo(id);
      for (let k = 0; k < 80 && SCOPE.goto; k++) await new Promise(r => setTimeout(r, 250)); const d = SCOPE.altOf(id); return { h, d, alt: SCOPE.alt, az: SCOPE.az, left: !!SCOPE.goto, sunAlt: (() => { const A = SCOPE.astro, s = A.where('sun', SCOPE.fixJD); return A.eq2hor(s.ra, s.dec, A.lst(SCOPE.fixJD)).alt; })() }; });
    ok(bt.h.alt > 15 && bt.sunAlt < -18, 'at the game\'s 1 am the Sun is down (' + bt.sunAlt.toFixed(0) + '°) and Betelgeuse is up (' + bt.h.alt.toFixed(1) + '°)');
    ok(!bt.left && Math.abs(bt.alt - bt.d.alt) < .3 && Math.abs(((bt.az - bt.d.az + 540) % 360) - 180) < .5, 'GO TO slews the tube onto Betelgeuse (' + [bt.alt, bt.az].map(x => x.toFixed(2)) + ' vs ' + [bt.d.alt, bt.d.az].map(x => x.toFixed(2)) + ')');
    if (SHOTS) { await pg.evaluate(() => { SCOPE.mag = 6; SCOPE.focus = .18; }); await pg.waitForTimeout(1500); await pg.screenshot({ path: SHOTS + '/scope-orion.png' }); }

    // below the horizon: GO TO says so and stays put; aimed under the rooftops the eyepiece shows the ground, not sky
    const bh = await pg.evaluate(async () => { let H = 0; for (; H < 24 && SCOPE.altOf('moon').alt > -5; H++) SCOPE.fixJD = SCOPE.jdAt(H); SCOPE.filter = false; SCOPE.mag = 200; SCOPE.goTo('moon'); const g = !!SCOPE.goto, n = SCOPE.note && SCOPE.note.s;
      SCOPE.fixJD = SCOPE.jdAt(12); SCOPE.alt = -9; SCOPE.va = SCOPE.vz = 0; await new Promise(r => setTimeout(r, 600)); const c = [...document.querySelectorAll('canvas')].find(c => c.style.cursor === 'grab' && c.offsetWidth);
      const x = c.getContext('2d').getImageData(c.width / 2, c.height / 2, 1, 1).data; return { g, n, px: [x[0], x[1], x[2]] }; });
    ok(!bh.g && /BELOW THE HORIZON/.test(bh.n || ''), 'GO TO a Moon below the horizon says so and does not drive into the ground (' + bh.n + ')');
    const m31 = await pg.evaluate(async () => { SCOPE.fixJD = SCOPE.jdAt(22); await new Promise(r => setTimeout(r, 300)); SCOPE.mag = 200; SCOPE.focus = .9; const h = SCOPE.altOf('m31'); SCOPE.alt = h.alt; SCOPE.az = h.az; SCOPE.goto = null; SCOPE.va = SCOPE.vz = 0;
      for (let k = 0; k < 40 && !(SCOPE.centre === 'm31'); k++) await new Promise(r => setTimeout(r, 100)); const t = performance.now(); for (let i = 0; i < 10; i++) SCOPE.view.draw(.016); SCOPE.focus = .18; return { ms: (performance.now() - t) / 10, c: SCOPE.centre, alt: h.alt }; });
    ok(m31.c === 'm31' && m31.ms < 60, 'Andromeda at 200x, out of focus, draws in ' + m31.ms.toFixed(1) + ' ms a frame (centre ' + m31.c + ', alt ' + m31.alt.toFixed(0) + '°)');
    ok(bh.px[2] < 120, 'aimed below the rooftops at noon, the eyepiece shows the ground, not blue sky (' + bh.px + ')');

    const sun = await pg.evaluate(async () => { SCOPE.fixJD = SCOPE.jdAt(12); SCOPE.filter = false; SCOPE.mag = 50; SCOPE.goTo('sun'); for (let k = 0; k < 120 && SCOPE.goto; k++) await new Promise(r => setTimeout(r, 250)); await new Promise(r => setTimeout(r, 400));
      const a = { glare: SCOPE.glare }; SCOPE.filter = true; await new Promise(r => setTimeout(r, 600)); return { a, b: { glare: SCOPE.glare, centre: SCOPE.centre } }; });
    ok(sun.a.glare > .6, 'pointed at the Sun without a filter, the eyepiece whites out (' + sun.a.glare.toFixed(2) + ')');
    ok(sun.b.glare === 0 && sun.b.centre === 'sun', 'with the solar filter on, the Sun is safe to look at (' + JSON.stringify(sun.b) + ')');
    if (SHOTS) await pg.screenshot({ path: SHOTS + '/scope-sun.png' });
    await pg.evaluate(() => { SCOPE.fixJD = null; SCOPE.filter = false; SCOPE.close(); });

    // the globes: a flick spins one, its bearing slows it
    const sp = await pg.evaluate(async () => { GLOBE.flick('earth', 6); await new Promise(r => setTimeout(r, 1200)); const a = GLOBEDBG().earth.w; await new Promise(r => setTimeout(r, 1500)); return [a, GLOBEDBG().earth.w]; });
    ok(sp[0] > 0 && sp[0] < 6 && sp[1] < sp[0], 'a flicked globe spins and its bearing slows it (6 -> ' + sp.map(x => x.toFixed(2)).join(' -> ') + ')');
    const gv = await pg.evaluate(async () => { await GLOBE.open('earth'); await new Promise(r => setTimeout(r, 800)); return GLOBEDBG(); });
    ok(gv.view && gv.view.open && gv.view.gl && gv.view.tex && gv.loaded >= 2, 'the close look opens on its own renderer with NASA\'s Earth by day and night (' + JSON.stringify(gv.view) + ', ' + gv.loaded + ' pictures)');
    if (SHOTS) { await pg.waitForTimeout(800); await pg.screenshot({ path: SHOTS + '/globe-earth.png' }); await pg.evaluate(() => GLOBE.view.show('mars')); await pg.waitForTimeout(1500); await pg.screenshot({ path: SHOTS + '/globe-mars.png' }); await pg.evaluate(() => GLOBE.view.show('moon')); await pg.waitForTimeout(1500); await pg.screenshot({ path: SHOTS + '/globe-moon.png' }); }
    const gc = await pg.evaluate(() => { GLOBE.close(); return GLOBEDBG().view; });
    ok(!gc.open && !gc.gl, 'closing lets its renderer go');
    const err = await pg.evaluate(() => Object.entries(SYS.P).flatMap(([k, v]) => v.filter(s => s.err).map(s => k + ':' + s.name)));
    ok(!err.length, 'no SYS errors (' + err.join(',') + ')');
  }
  ok(!errs.length, 'no page errors' + (errs.length ? ': ' + errs.slice(0, 3).join(' | ') : ''));
  await b.close();
  console.log(fails.length ? fails.length + ' failed' : 'all scope checks passed');
  process.exit(fails.length ? 1 : 0);
})();
