// THE OBSERVATORY CHECK: node tests/observatory.cjs dist/market.html [shots dir]. The park's public observatory: its dome on flat ground, the walk-in inside, THE GREAT TELESCOPE (400 mm, deeper than the others), one steering and the rest watching, asking for the tube, its two goals.
const { chromium } = require('playwright'), path = require('path');
const SHOTS = process.argv[3], SITE = (require('../data/world.json').parkPlaces.sites || []).some(s => s.id === 'observatory'); let bad = 0; const ok = (c, n) => { console.log((c ? 'ok   ' : 'FAIL ') + n); if (!c) bad++; };
(async () => {
  const b = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const pg = await b.newPage({ viewport: { width: 960, height: 600 } }), errs = [];
  pg.on('pageerror', e => errs.push(e.message.slice(0, 300)));
  await pg.goto('file://' + path.resolve(process.argv[2] || 'dist/market.html') + '?fresh=1&hour=23&npcwait=99', { waitUntil: 'commit' });
  let st = false; for (let i = 0; i < 80 && !st; i++) { await pg.waitForTimeout(3000); st = await pg.evaluate(() => !!window.__started).catch(() => false); }
  for (let i = 0; i < 100; i++) { if (!(await pg.evaluate(() => { const L = document.getElementById('loading'); return !!L && L.offsetWidth > 0; }))) break; await pg.waitForTimeout(3000); }
  ok(st, 'the game starts');
  const shot = async n => { if (SHOTS) await pg.screenshot({ path: path.join(SHOTS, n + '.png') }); }, wait = ms => pg.waitForTimeout(ms);
  if (st) {
    const o = await pg.evaluate(() => { const A = MSHOP.at.observatory, R = ROOMS.off.observatory, dx = A.door[0] - A.mid[0], dz = A.door[1] - A.mid[1], l = Math.hypot(dx, dz), T = A.half[0] / 3.6;
      __dbg.ui().goTo(A.door[0] + dx / l * 11 * T, A.door[1] + dz / l * 11 * T, 0, R.out[3] + Math.PI);
      return { at: !!A, room: !!R && R.name, dome: !!(A.out && A.out.getObjectByName('dome')), go: STORE.places.some(p => p[0] === 'THE OBSERVATORY') }; });
    ok(o.at && o.room === 'THE OBSERVATORY' && o.dome && SITE && o.go, 'the observatory stands in the park: its lot, its dome, its tree-free site, a GO TO place');
    await wait(3000); await pg.evaluate(() => __dbg.ui().setView('third')); await wait(8000); await shot('observatory-out');
    const g = await pg.evaluate(() => { const A = MSHOP.at.observatory; return [SHARED.groundY(A.mid[0], A.mid[1]), SHARED.groundY(A.door[0], A.door[1])]; });
    ok(g.every(v => Math.abs(v) < .01), 'on flat ground (' + g.join(', ') + ')');
    const i = await pg.evaluate(async () => { await ROOMS.enter('observatory'); await new Promise(r => setTimeout(r, 3000)); __dbg.ui().setView('third'); const T = __dbg.ui().things.map(t => t.name || '');
      return { inn: ROOMS.offIn(), scope: T.filter(n => /GREAT TELESCOPE/.test(n)).length, bench: T.filter(n => n === 'A BENCH').length, out: T.some(n => /OUT TO/.test(n)) }; });
    ok(i.inn === 'observatory' && i.scope === 1 && i.bench === 4, 'double-clicking the door takes you inside: the telescope on its pier, four benches');
    await wait(6000); await shot('observatory-in');
    const u = await pg.evaluate(async () => { const was = { ...SCOPE.site }; await OBSV.use(); await new Promise(r => setTimeout(r, 2500));
      return { was, open: SCOPE.isOpen(), site: { ...SCOPE.site }, party: ASTRO.party(), mags: [...document.querySelectorAll('#scopev [data-m]')].map(b => +b.dataset.m), goals: ASTRO.goals().map(g => g.id) }; });
    ok(u.open && u.site.obs && u.site.ap === 400 && u.was.ap === 80 && u.mags.includes(400) && u.party.on, 'THE GREAT TELESCOPE opens the eyepiece: 400 mm, 400X, and the first to step up shares the view');
    ok(u.goals.includes('obs10') && u.goals.includes('obsparty'), 'the logbook has the observatory\'s two goals');
    const dz = await pg.evaluate(async () => { SCOPE.mag = 50; SCOPE.focus = .18; await new Promise(r => setTimeout(r, 1200)); const lim = SCOPE.lim;
      const L = SCOPE.data.sky.filter(t => t.m && t.kind !== 'cluster' && t.mag > 9 && t.mag < lim).map(t => ({ t, h: SCOPE.altOf(t.id) })).filter(x => x.h.alt > 30).sort((a, b) => b.t.mag - a.t.mag), T = L[0] && L[0].t; if (!T) return { lim, none: true };
      SCOPE.goTo(T.id); for (let k = 0; k < 120 && SCOPE.goto; k++) await new Promise(r => setTimeout(r, 250)); for (let k = 0; k < 40 && !ASTRO.dbg().obs[T.id]; k++) await new Promise(r => setTimeout(r, 300));
      return { lim, id: T.id, name: T.name, mag: T.mag, obs: ASTRO.dbg().obs[T.id], n: ASTRO.goals().find(g => g.id === 'obs10').n, small: 8.3 + 1.2 }; });
    await shot('observatory-faint');
    ok(dz.lim > 11.5, 'it reaches fainter than any other telescope (faintest star ' + (dz.lim || 0).toFixed(1) + ' at 50X)');
    ok(!dz.none && dz.obs === 'deepr' && dz.n === 1, 'a faint Messier object (' + dz.name + ', magnitude ' + dz.mag + ') is found and counts toward the observatory\'s goal');
    const p = await pg.evaluate(async () => { const c0 = INV.cash; ONLINE.hear.skyw({ op: 'join', id: 'w1', name: 'ROSA' }); ONLINE.hear.skyw({ op: 'join', id: 'w2', name: 'MILO' }); ONLINE.hear.skyw({ op: 'ask', id: 'w2', name: 'MILO' });
      await new Promise(r => setTimeout(r, 1200)); const a = ASTRO.party(), btn = [...document.querySelectorAll('#scopev [data-x="astro-give"]')][0], label = btn && btn.textContent; if (btn) btn.click(); await new Promise(r => setTimeout(r, 300));
      return { n: a.watchers.length, ask: a.ask, label, ctl: ASTRO.party().ctl, paid: ASTRO.goals().find(g => g.id === 'obsparty').paid, d: INV.cash - c0 }; });
    ok(p.n === 2 && p.ask === 'w2' && /HAND IT TO MILO/.test(p.label || '') && p.ctl === 'w2', 'two more step up and watch; one asks for the tube and is handed it');
    ok(p.paid && p.d === 120, 'three at the eyepiece is the star party goal: $120 once');
    const c = await pg.evaluate(async () => { SCOPE.close(); await new Promise(r => setTimeout(r, 600)); return { open: SCOPE.isOpen(), site: SCOPE.site.ap, on: ASTRO.party().on }; });
    ok(!c.open && c.site === 80 && !c.on, 'DONE puts the eyepiece away: sharing ends, your own telescope is as it was');
    const w = await pg.evaluate(async () => { const say = { t: 'sky', id: 'op1', name: 'ROSA', on: 1, obs: 1, alt: 41, az: 200, mag: 100, f: .18, fl: 0, jd: SCOPE.jd(), ctl: '', n: 0 }; ONLINE.hear.sky(say); const op = OBSV.op();
      await OBSV.use(); ONLINE.hear.sky(say); await new Promise(r => setTimeout(r, 2500)); const a = ASTRO.party(), ask = !!document.querySelector('#scopev [data-x="astro-ask"]');
      const r = { op: op && op.id, watching: a.watching && a.watching.id, on: a.on, ask, mag: SCOPE.mag, alt: SCOPE.alt, site: SCOPE.site.obs }; ONLINE.hear.sky({ ...say, on: 0 }); await new Promise(r => setTimeout(r, 6500)); r.heir = ASTRO.party().on && !ASTRO.party().watching; SCOPE.close(); await new Promise(r => setTimeout(r, 500)); return r; });
    ok(w.op === 'op1' && w.watching === 'op1' && !w.on && w.ask && w.mag === 100 && Math.abs(w.alt - 41) < 3 && w.site, 'when someone already has the tube, stepping up shows you their view, with ASK FOR THE TUBE: ' + JSON.stringify(w));
    ok(w.heir, 'when they walk off, the tube is yours after a moment');
    const x = await pg.evaluate(async () => { await ROOMS.exit('observatory'); await new Promise(r => setTimeout(r, 2500)); const A = MSHOP.at.observatory, P = __dbg.pos(); return { inn: ROOMS.offIn(), d: Math.hypot(P[0] - A.door[0], P[2] - A.door[1]) / (A.half[0] / 3.6) }; });
    ok(!x.inn && x.d < 3, 'the inside door takes you back out to the park, by the door: ' + JSON.stringify(x));
  }
  ok(!errs.length, 'no page errors' + (errs.length ? ': ' + errs.join(' | ') : ''));
  await b.close(); console.log(bad ? bad + ' failed' : 'observatory ok'); process.exit(bad ? 1 : 0);
})();
