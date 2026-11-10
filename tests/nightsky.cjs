// THE NIGHT SKY CHECK: node tests/nightsky.cjs dist/market.html. One sky over New York for the street and the telescope; the planets among the street's stars; shooting stars, the northern lights and a lunar eclipse in the dome; the name of what you look at; STARGAZE learns a constellation; the Messier catalogue, double stars and the Moon's places in the eyepiece; the field telescope outdoors; the logbook's goals and tonight's sky. SHOTS=<dir> saves pictures.
const { chromium } = require('playwright'), path = require('path');
const fails = [], ok = (c, m) => { if (!c) { fails.push(m); console.log((process.env.GITHUB_ACTIONS ? '::error title=nightsky::' : 'FAIL ') + m); } else console.log('ok   ' + m); };
const SHOTS = process.env.SHOTS;
(async () => {
  const b = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--allow-file-access-from-files'] });
  const pg = await b.newPage({ viewport: { width: 1000, height: 640 } }), errs = [];
  pg.on('pageerror', e => errs.push(e.message.slice(0, 300)));
  await pg.goto('file://' + path.resolve(process.argv[2] || 'dist/market.html') + '?fresh=1&hour=23&at=0,3&npcwait=99', { waitUntil: 'commit' });
  let st = false; for (let i = 0; i < 80 && !st; i++) { await pg.waitForTimeout(3000); st = await pg.evaluate(() => !!window.__started).catch(() => false); }
  for (let i = 0; i < 100; i++) { if (!(await pg.evaluate(() => { const L = document.getElementById('loading'); return !!L && L.offsetWidth > 0; }))) break; await pg.waitForTimeout(3000); }
  ok(st, 'the game starts');
  const shot = async n => { if (SHOTS) await pg.screenshot({ path: path.join(SHOTS, n + '.png') }); };
  const aim = v => pg.evaluate(v => { __dbg.ui().setView('first'); __dbg.ui().upMax = 1.5; SHARED.yawTo = SHARED.yaw = Math.atan2(v[0], v[2]) + Math.PI; SHARED.pitchTo = SHARED.pitch = -Math.asin(v[1]); }, v);
  try {
    // the sums, one sky
    const e = await pg.evaluate(() => { const J = t => EPH.jdOf(Date.parse(t)), a = EPH.shadow(J('2025-03-14T06:59:00Z')), n = EPH.shadow(J('2025-04-13T00:22:00Z')), j = EPH.where('ju', 2461349.7083333);
      return { lat: CLK.LAT, lon: CLK.LON, same: SCOPE.astro === EPH || !SCOPE.astro, ecl: a.mag, none: n.mag, ring: EPH.ring(J('2026-11-11T05:00:00Z')), ring32: EPH.ring(J('2032-06-01T00:00:00Z')), ju: [j.ra, j.dec], gem: EPH.rate(J('2026-12-14T07:00:00Z')).all, day: EPH.rate(J('2026-12-14T17:00:00Z')).all }; });
    ok(Math.abs(e.lat - 40.71) < .01 && Math.abs(e.lon + 74.01) < .01 && e.same, 'the clock\'s sky and the telescope\'s are one, over New York');
    ok(e.ecl > 1 && e.ecl < 1.4 && e.none < 0, `the total lunar eclipse of 14 Mar 2025 is found (${e.ecl.toFixed(2)} of the Moon in the umbra) and an ordinary full Moon is not (${e.none.toFixed(2)})`);
    ok(Math.abs(e.ring) < 12 && Math.abs(e.ring32) > 24 && Math.abs(e.ring32) < 27.2, `Saturn's rings nearly edge on in 2026 (${e.ring.toFixed(1)}°), wide open in 2032 (${e.ring32.toFixed(1)}°)`);
    ok(e.gem > 60 && e.day === 0, `the Geminids at their peak: ${Math.round(e.gem)} an hour in the dark, none by day`);
    // the street's sky at a fixed moment: 11 Nov 2026, 4 am in New York (Jupiter and Mars high in the east)
    const s = await pg.evaluate(async () => { DN.fixT = Date.parse('2026-11-11T09:00:00Z'); SKYSHOW.fresh(); await new Promise(r => setTimeout(r, 2500)); const ju = SKYSHOW.things.find(t => t.id === 'ju'), q = ju && EPH.where('ju', SKYSHOW.jd()), v = q && SKYSHOW.eq(q.ra, q.dec);
      return { ids: SKYSHOW.things.map(t => t.id), ju: ju && { alt: ju.alt, az: ju.az, seen: ju.seen, v: ju.v.toArray(), dot: ju.v.dot(v) }, w: SKY.U.uPl.value.map(u => u.w), star: SKY.U.uStar.value, lst: STARSKY.lst, lstE: EPH.lst(SKYSHOW.jd()) }; });
    ok(s.ju && s.ju.seen && s.ids.includes('ma') && s.w[3] > 1 && s.ju.alt > 30, `Jupiter and Mars are up and drawn in the street's sky (${JSON.stringify(s.ids)}, Jupiter ${s.ju && s.ju.alt.toFixed(0)}° up)`);
    ok(s.ju && s.ju.dot > .9995 && Math.abs(((s.lst - s.lstE + 540) % 360) - 180) < 1, `the planets sit among the stars where the dome turns them (off by ${s.ju ? (Math.acos(Math.min(1, s.ju.dot)) * 57.3).toFixed(2) : '?'}°)`);
    await aim(s.ju.v); await pg.waitForTimeout(2500); await shot('nightsky-jupiter');
    const nm = await pg.evaluate(async () => { for (let i = 0; i < 20 && !GAZE.cur; i++) await new Promise(r => setTimeout(r, 300)); return GAZE.cur; });
    ok(nm === 'JUPITER' || nm === 'MARS', 'looking at it in first person names it: ' + nm);
    const mt = await pg.evaluate(async () => { SKYSHOW.burst(2); await new Promise(r => setTimeout(r, 400)); const w = SKY.U.uMetA.value.map(u => u.w), n = SKYSHOW.mets.length; await new Promise(r => setTimeout(r, 5000)); return { w, n, after: SKYSHOW.mets.length, off: SKY.U.uMetA.value.map(u => u.w) }; });
    ok(mt.n === 2 && mt.w[0] > 0 && mt.after === 0 && mt.off[0] === 0, 'shooting stars streak and burn out');
    const au = await pg.evaluate(async () => { SKYSHOW.kpFix = 8.3; SKYSHOW.fresh(); await new Promise(r => setTimeout(r, 1500)); const on = SKY.U.uAur.value.x; return { on, k: SKYSHOW.aurora }; });
    await aim([0, .35, .94]); await pg.waitForTimeout(2000); await shot('nightsky-aurora');
    const au2 = await pg.evaluate(async () => { SKYSHOW.kpFix = 3; SKYSHOW.fresh(); await new Promise(r => setTimeout(r, 1500)); const off = SKY.U.uAur.value.x; SKYSHOW.kpFix = null; return off; });
    ok(au.on > 0 && au.k === 8.3 && au2 === 0, 'the northern lights at Kp 8.3, none at Kp 3');
    const ec = await pg.evaluate(async () => { DN.fixT = Date.parse('2025-03-14T06:59:00Z'); SKYSHOW.fresh(); await new Promise(r => setTimeout(r, 1500)); const u = SKY.U.uSh.value, r = { mag: SKYSHOW.eclipse && SKYSHOW.eclipse.mag, sh: [u.x, u.y, u.z] };
      DN.fixT = Date.parse('2026-11-11T09:00:00Z'); SKYSHOW.fresh(); await new Promise(r => setTimeout(r, 1500)); r.off = SKY.U.uSh.value.z; return r; });
    ok(ec.mag > 1 && ec.sh[2] > 2 && Math.hypot(ec.sh[0], ec.sh[1]) < 1.5 && ec.off === 0, `the Earth's shadow covers the Moon in the street's sky on 14 Mar 2025 (${JSON.stringify(ec.sh.map(x => +x.toFixed(2)))}), and not on an ordinary night`);
    // stargazing: lie back, a constellation learned
    const gz = await pg.evaluate(async () => { const ok = await MOTION.play('stargaze'); await new Promise(r => setTimeout(r, 2500)); return { ok, on: GAZE.on, view: __dbg.ui().view, cur: MOTION.cur, con: GAZE.dbg().con.length, n: ASTRO.conN }; });
    ok(gz.ok && gz.on && gz.view === 'first' && gz.cur === 'sleep' && gz.con === 88 && gz.n > 50 && gz.n < 88, `STARGAZE lies you back looking up (${gz.n} of 88 constellations rise over New York)`);
    const cn = await pg.evaluate(() => { const L = GAZE.dbg().con.map(c => ({ ...c, v: SKYSHOW.eq(c.ra, c.dec).toArray() })).filter(c => c.v[1] > .5).sort((a, b) => b.v[1] - a.v[1]); return L[0]; });
    await aim(cn.v); const learned = await pg.evaluate(async k => { for (let i = 0; i < 40 && !ASTRO.has('con:' + k); i++) await new Promise(r => setTimeout(r, 400)); return { has: ASTRO.has('con:' + k), n: ASTRO.count('con'), panel: document.getElementById('gazev').innerText }; }, cn.k);
    await shot('nightsky-stargaze');
    ok(learned.has && learned.n === 1 && /TONIGHT'S SKY/.test(learned.panel) && /JUPITER/.test(learned.panel), 'looking at ' + cn.name + ' draws its lines and puts it in the logbook; the panel lists tonight\'s sky');
    const up = await pg.evaluate(async () => { GAZE.stop(); await new Promise(r => setTimeout(r, 800)); return { on: GAZE.on, hidden: document.getElementById('gazev').hidden, cur: MOTION.cur }; });
    ok(!up.on && up.hidden && up.cur !== 'sleep', 'getting up ends it');
    // the field telescope outdoors
    const f = await pg.evaluate(async () => { const have = INV.items.fscope, was = SCOPE.site.ap; await FIELD.toggle(); await new Promise(r => setTimeout(r, 1500));
      return { have, was, open: SCOPE.isOpen(), site: SCOPE.site, on: FIELD.on, sky: SCOPE.data.sky.filter(t => t.m).length, pics: SCOPE.data.sky.filter(t => t.m && t.file).length, dbl: SCOPE.data.doubles.length, moon: SCOPE.data.moon.length, mags: [...document.querySelectorAll('#scopev [data-m]')].map(b => +b.dataset.m) }; });
    ok(f.have === 1 && f.on && f.open && f.site.field && f.site.ap === 60 && f.was === 80 && !f.mags.includes(200) && f.mags.includes(100), 'the field telescope from the pack stands under the open sky and opens the eyepiece (60 mm, 100X at most)');
    ok(f.sky === 110 && f.dbl >= 15 && f.moon >= 15, `the eyepiece knows all 110 Messier objects (${f.pics} with photographs), ${f.dbl} double stars, ${f.moon} places on the Moon`);
    const dz = await pg.evaluate(async () => { SCOPE.site.dark = 1.2; SCOPE.mag = 50; SCOPE.focus = .18; const L = SCOPE.data.sky.filter(t => t.m && !t.file && t.mag < 8.5).map(t => ({ t, h: SCOPE.altOf(t.id) })).filter(x => x.h.alt > 35).sort((a, b) => a.t.mag - b.t.mag), T = L[0].t;
      SCOPE.goTo(T.id); for (let k = 0; k < 120 && SCOPE.goto; k++) await new Promise(r => setTimeout(r, 250)); for (let k = 0; k < 30 && !ASTRO.dbg().seen[T.id]; k++) await new Promise(r => setTimeout(r, 300));
      return { id: T.id, name: T.name, kind: T.kind, centre: SCOPE.centre, seen: !!ASTRO.dbg().seen[T.id], lim: SCOPE.lim }; });
    await shot('nightsky-messier');
    ok(dz.centre === dz.id && dz.seen, `GO TO ${dz.name} (${dz.kind}, no photograph: drawn) finds it and logs it (faintest star ${dz.lim.toFixed(1)})`);
    const db = await pg.evaluate(async () => { const D = SCOPE.data.doubles.map((d, i) => ({ d, i, h: SCOPE.altOf('dbl:' + i) })).filter(x => x.h.alt > 25 && x.d.sep > 8 && x.d.m2 < 6).sort((a, b) => b.d.sep - a.d.sep)[0]; SCOPE.mag = 100; SCOPE.goTo('dbl:' + D.i);
      for (let k = 0; k < 120 && SCOPE.goto; k++) await new Promise(r => setTimeout(r, 250)); const key = 'dbl:' + D.d.name; for (let k = 0; k < 30 && !ASTRO.dbg().seen[key]; k++) await new Promise(r => setTimeout(r, 300));
      return { name: D.d.name, centre: SCOPE.centre, id: 'dbl:' + D.i, seen: !!ASTRO.dbg().seen[key], hold: SCOPE.centreObj && SCOPE.centreObj.hold }; });
    await shot('nightsky-double');
    ok(db.centre === db.id && db.hold && db.seen, db.name + ' parts into two at 100X and goes in the logbook');
    const gl = await pg.evaluate(() => ({ goals: ASTRO.goals(), tn: ASTRO.tonight().map(r => r[0]), panel: document.getElementById('scopev').innerText }));
    ok(gl.goals.length === 9 && gl.goals.find(g => g.id === 'm10').n === 1 && gl.tn.length >= 7 && /TONIGHT'S SKY/.test(gl.panel) && /GOALS/.test(gl.panel), 'the logbook has its goals and tonight\'s sky (' + gl.tn.length + ' lines)');
    const pay = await pg.evaluate(async () => { const c0 = INV.cash; for (let i = 0; i < 9; i++) ASTRO.log('con:T' + i, { g: 'con', tier: 'c', name: 'TEST ' + i }); return { d: INV.cash - c0, paid: ASTRO.goals().find(g => g.id === 'con10').paid }; });
    ok(pay.d === 40 && pay.paid, 'ten constellations pay the goal once ($' + pay.d + ')');
    const pk = await pg.evaluate(async () => { FIELD.at = { x: 1e6, z: 0 }; await new Promise(r => setTimeout(r, 800)); return { on: FIELD.on, open: SCOPE.isOpen(), ap: SCOPE.site.ap }; });
    ok(!pk.on && !pk.open && pk.ap === 80, 'walking away folds the field telescope up');
  } catch (e) { ok(false, 'the check ran through: ' + String(e && e.message || e).slice(0, 400)); }
  ok(!errs.length, 'no page errors' + (errs.length ? ': ' + errs.slice(0, 3).join(' | ') : ''));
  await b.close(); console.log(fails.length ? fails.length + ' FAILED' : 'night sky ok'); process.exit(fails.length ? 1 : 0);
})();
