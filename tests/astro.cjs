// ASTRONOMY AT THE TELESCOPE (src/150fh-astro.js, 150fcz-firsts.js): node tests/astro.cjs [dist/market.html]. Every zoom is open; a planet held in the middle goes in the logbook and teaches the skill; the camera makes a sellable print worth more in focus at the right exposure; a star party: the host's eyepiece is followed by a watcher, the host can hand over the tube; tonight's firsts keep the first name. SHOTS=<dir> saves pictures.
const { chromium } = require('playwright'), path = require('path');
const fails = [], ok = (c, m) => { if (!c) { fails.push(m); console.log((process.env.GITHUB_ACTIONS ? '::error title=astro::' : 'FAIL ') + m); } else console.log('ok   ' + m); };
const SHOTS = process.env.SHOTS;
(async () => {
  const b = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--allow-file-access-from-files'] });
  const pg = await b.newPage({ viewport: { width: 1000, height: 640 } }), errs = [];
  pg.on('pageerror', e => errs.push(e.message.slice(0, 300)));
  await pg.goto('file://' + path.resolve(process.argv[2] || 'dist/market.html') + '?fresh=1&furnished=1&hour=1&online=0&place=your%20apartment', { waitUntil: 'commit' });
  let st = false; for (let i = 0; i < 60 && !st; i++) { await pg.waitForTimeout(3000); st = await pg.evaluate(() => !!window.__started).catch(() => false); }
  ok(st, 'the page starts');
  if (st) {
    for (let i = 0; i < 30 && !(await pg.evaluate(() => window.BEDROOMDBG && BEDROOMDBG().built)); i++) await pg.waitForTimeout(1000);
    await pg.evaluate(async () => { FORAGE.S.sk.astro = 100; await SCOPE.open(); });
    const g0 = await pg.evaluate(() => { const B = [...document.querySelectorAll('#scopev [data-m]')].map(b => [+b.dataset.m, b.disabled]); return { B, skill: ASTRO.dbg().skill, eye: B.some(x => x[0] === 1) }; });
    ok(g0.eye && g0.B.every(x => !x[1]) && g0.B.some(x => x[0] === 200) && g0.B.some(x => x[0] >= 1000), 'every zoom is open whatever the skill, NAKED EYE to the thousands (12 Nov 2026) (' + JSON.stringify(g0.B) + ')');
    await pg.evaluate(() => { FORAGE.S.sk.astro = 500; SCOPE.view.panel(); });

    // a planet held in the middle: the logbook, and the skill learnt from it
    const lg = await pg.evaluate(async () => { let h = 1; for (; h < 24; h++) { SCOPE.fixJD = SCOPE.jdAt(h); const a = SCOPE.altOf('ju'); if (a && a.alt > 25) { const s = SCOPE.astro.where('sun', SCOPE.fixJD), sa = SCOPE.astro.eq2hor(s.ra, s.dec, SCOPE.astro.lst(SCOPE.fixJD)).alt; if (sa < -12) break; } }
      WX.hold = 'CLEAR'; SCOPE.mag = 50; SCOPE.focus = .18; SCOPE.goTo('ju'); for (let k = 0; k < 120 && SCOPE.goto; k++) await new Promise(r => setTimeout(r, 250));
      const sk0 = FORAGE.S.sk.astro; for (let k = 0; k < 20 && !ASTRO.dbg().seen.ju; k++) await new Promise(r => setTimeout(r, 250)); return { h, centre: SCOPE.centre, seen: !!ASTRO.dbg().seen.ju, sk0, sk1: FORAGE.S.sk.astro }; });
    ok(lg.centre === 'ju' && lg.seen, 'Jupiter held in the middle goes in the logbook (' + JSON.stringify(lg) + ')');
    if (SHOTS) await pg.screenshot({ path: SHOTS + '/astro-jupiter.png' });

    // the camera: a sharp print at the right exposure is worth more than a blurred one at the wrong one
    const ph = await pg.evaluate(async () => { ASTRO.exp(1); const a = await ASTRO.shoot(); SCOPE.focus = .9; ASTRO.exp(3); const b = await ASTRO.shoot(); SCOPE.focus = .18;
      return { a: a && { v: a.v, cap: a.cap, tier: a.tier, src: a.src.slice(0, 23), mine: PHOTOS.mine.some(p => p.id === a.id), bag: FORAGE.has(a.id), sell: ITEMS.prop(a.id, 'sellable'), val: ITEMS.prop(a.id, 'value') }, b: b && { v: b.v } }; });
    ok(ph.a && ph.a.src === 'data:image/jpeg;base64,' && ph.a.mine && ph.a.bag && ph.a.sell && ph.a.val === ph.a.v && /JUPITER/.test(ph.a.cap), 'TAKE PHOTO makes a print of Jupiter, in the bag, sellable at its worth (' + JSON.stringify(ph.a) + ')');
    ok(ph.b && ph.b.v < ph.a.v, 'out of focus at 30 S it is worth less (' + (ph.b && ph.b.v) + ' < ' + ph.a.v + ')');

    // the star party: a watcher follows the host's tube; the host hands it over and follows the watcher's
    const sp = await pg.evaluate(async () => { const sent = []; ONLINE.send = m => sent.push(m); ONLINE.on = true; ONLINE.me = 'me1';
      await ASTRO.watch('host1', 'BOB'); ONLINE.hear.sky({ id: 'host1', name: 'BOB', on: 1, alt: 42, az: 133, mag: 50, f: .1, fl: 0, jd: SCOPE.jd(), ctl: '' });
      await new Promise(r => setTimeout(r, 600)); const w = { alt: SCOPE.alt, az: SCOPE.az, mag: SCOPE.mag, party: ASTRO.party(), join: sent.some(m => m.t === 'skyw' && m.op === 'join' && m.to === 'host1') };
      ONLINE.hear.sky({ id: 'host1', on: 0 }); const left = !ASTRO.party().watching;
      sent.length = 0; ASTRO.share(true); await new Promise(r => setTimeout(r, 700)); const out = sent.filter(m => m.t === 'sky' && m.on === 1).length;
      ONLINE.hear.skyw({ id: 'g1', name: 'ANN', op: 'join' }); document.querySelector('#scopev [data-x="astro-give"]').click(); const ctl = ASTRO.party().ctl;
      ONLINE.hear.skyw({ id: 'g1', op: 'steer', alt: 22, az: 210 }); await new Promise(r => setTimeout(r, 500)); const h = { alt: SCOPE.alt, az: SCOPE.az };
      ASTRO.share(false); ONLINE.on = false; return { w, left, out, ctl, h, watchers: ASTRO.party().watchers.length }; });
    ok(Math.abs(sp.w.alt - 42) < .01 && Math.abs(sp.w.az - 133) < .01 && sp.w.mag === 50 && sp.w.join && sp.w.party.watching, 'a watcher\'s tube follows the host\'s (' + JSON.stringify(sp.w) + ')');
    ok(sp.left, 'when the host puts it away, the watcher is told and let go');
    ok(sp.out >= 1 && sp.ctl === 'g1' && Math.abs(sp.h.alt - 22) < .01 && Math.abs(sp.h.az - 210) < .01, 'sharing sends the tube\'s pointing; HAND IT OVER lets the watcher steer it (' + JSON.stringify(sp) + ')');

    // tonight's firsts: the first name stays
    const fr = await pg.evaluate(() => { const a = FIRSTS.mark('rings'), b = FIRSTS.mark('rings'); FIRSTS.show(); const t = document.getElementById('firstsb').innerText; return { a, b, of: FIRSTS.of('rings'), t: /SATURN'S RINGS/.test(t) && /NOT YET FOUND/.test(t) }; });
    ok(fr.a && !fr.b && fr.of && fr.of.name && fr.t, 'tonight\'s firsts keep the first finder and show on the board (' + JSON.stringify(fr) + ')');
    const err = await pg.evaluate(() => Object.entries(SYS.P).flatMap(([k, v]) => v.filter(s => s.err).map(s => k + ':' + s.name)));
    ok(!err.length, 'no SYS errors (' + err.join(',') + ')');
  }
  ok(!errs.length, 'no page errors' + (errs.length ? ': ' + errs.slice(0, 3).join(' | ') : ''));
  await b.close();
  console.log(fails.length ? fails.length + ' failed' : 'all astro checks passed');
  process.exit(fails.length ? 1 : 0);
})();
