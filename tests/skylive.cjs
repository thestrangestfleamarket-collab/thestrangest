// THE LIVE SKY CHECK (src/150fg-skylive.js): node tests/skylive.cjs [dist/market.html]. The feeds are tests/sky/ (real responses, trimmed). Nothing is fetched before the eyepiece opens; New York's cloud from the weather feed; the ISS where satellite.js puts it; Ceres within a degree of JPL Horizons; a comet's place sane; meteors at the shower's rate and drawn in the naked-eye view; today's Sun picture under the solar filter with its sunspot groups; Kp 8 lights the north. SHOTS=<dir> saves pictures.
const { chromium } = require('playwright'), path = require('path'), fs = require('fs');
const fails = [], ok = (c, m) => { if (!c) { fails.push(m); console.log((process.env.GITHUB_ACTIONS ? '::error title=skylive::' : 'FAIL ') + m); } else console.log('ok   ' + m); };
const SHOTS = process.env.SHOTS, FX = path.join(__dirname, 'sky'), SJS = path.join(process.cwd(), 'node_modules/satellite.js/dist/satellite.es.js');
const jdOf = s => Date.parse(s) / 864e5 + 2440587.5;
(async () => {
  const b = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--allow-file-access-from-files'] });
  const pg = await b.newPage({ viewport: { width: 1000, height: 640 } }), errs = [], reqs = [];
  pg.on('pageerror', e => errs.push(e.message.slice(0, 300)));
  const feed = (re, f, type) => pg.route(re, r => { reqs.push(r.request().url()); r.fulfill({ path: path.join(FX, f), contentType: type || 'application/json', headers: { 'access-control-allow-origin': '*' } }); });
  await feed(/api\.open-meteo\.com/, 'weather.json'); await feed(/celestrak\.org.*GROUP=stations/, 'st.txt', 'text/plain'); await feed(/celestrak\.org.*GROUP=visual/, 'vis.txt', 'text/plain');
  await feed(/sbdb_query\.api.*sb-kind=c/, 'comets.json'); await feed(/sbdb_query\.api.*sb-kind=a/, 'rocks.json'); await feed(/sdo\.gsfc\.nasa\.gov/, 'sun.jpg', 'image/jpeg');
  await feed(/solar_regions\.json/, 'spots.json'); await feed(/xray-flares-7-day/, 'flares.json'); await feed(/noaa-planetary-k-index-forecast/, 'kpf.json'); await feed(/noaa-planetary-k-index\.json/, 'kp.json');
  await pg.route(/cdn\.jsdelivr\.net\/npm\/satellite\.js@/, r => { reqs.push(r.request().url()); if (!fs.existsSync(SJS)) return r.continue(); r.fulfill({ path: SJS, contentType: 'text/javascript', headers: { 'access-control-allow-origin': '*' } }); });
  await pg.goto('file://' + path.resolve(process.argv[2] || 'dist/market.html') + '?fresh=1&furnished=1&hour=1&place=your%20apartment', { waitUntil: 'commit' });
  let st = false; for (let i = 0; i < 60 && !st; i++) { await pg.waitForTimeout(3000); st = await pg.evaluate(() => !!window.__started).catch(() => false); }
  ok(st, 'the page starts');
  if (st) {
    for (let i = 0; i < 30 && !(await pg.evaluate(() => window.BEDROOMDBG && BEDROOMDBG().built)); i++) await pg.waitForTimeout(1000);
    ok(!reqs.length, 'nothing of the live sky is fetched before the eyepiece opens (' + reqs.length + ')');
    await pg.evaluate(async () => { DN.fixT = Date.parse('2026-11-09T06:00:00Z'); await SCOPE.open(); });   // (a night inside the weather fixture's three days)
    for (let i = 0; i < 40 && !(await pg.evaluate(() => SKYL.data.weather && SKYL.data.kp && SKYL.data.comets && SKYL.data.rocks && SKYL.sats.ready && SKYL.sunLive)); i++) await pg.waitForTimeout(500);
    const got = await pg.evaluate(() => ({ k: Object.keys(SKYL.data), sats: SKYL.sats.list.length, ready: !!SKYL.sats.ready, sun: !!SKYL.sunLive, err: SKYL.err }));
    ok(got.k.length >= 7 && got.ready && got.sats > 50 && got.sun, 'opening it fetches the feeds and satellite.js (' + JSON.stringify(got) + ')');

    // the weather: the hour's cloud over New York is the eyepiece's
    const W = JSON.parse(fs.readFileSync(path.join(FX, 'weather.json'))), i5 = 5, jw = jdOf(W.hourly.time[i5] + ':00Z') + 10 / 1440;
    const wx = await pg.evaluate(j => { SCOPE.fixJD = j; return SCOPE.wx(j); }, jw);
    ok(wx && Math.abs(wx.cloud - W.hourly.cloud_cover[i5] / 100) < 1e-9, 'the eyepiece\'s cloud is the feed\'s for that hour (' + JSON.stringify(wx) + ' vs ' + W.hourly.cloud_cover[i5] + '%)');
    const html = await pg.evaluate(() => document.getElementById('scopev').innerText);
    ok(/THE SKY TONIGHT/.test(html) && /OPEN-METEO/.test(html) && /SPACE WEATHER/.test(html), 'the panel shows THE SKY TONIGHT and SPACE WEATHER');

    // the ISS: the page's satellite.js, from the same orbit, here
    const sat = require(path.join(process.cwd(), 'node_modules/satellite.js'));
    const tle = fs.readFileSync(path.join(FX, 'st.txt'), 'utf8').split(/\r?\n/), rec = sat.twoline2satrec(tle[1], tle[2]), jI = jdOf('2026-11-09T01:00:00Z'), d = new Date((jI - 2440587.5) * 864e5);
    const pv = sat.propagate(rec, d), la = sat.ecfToLookAngles({ latitude: 40.7128 * Math.PI / 180, longitude: -74.006 * Math.PI / 180, height: .01 }, sat.eciToEcf(pv.position, sat.gstime(d)));
    const iss = await pg.evaluate(j => SKYL.look(25544, j), jI);
    ok(iss && Math.abs(iss.alt - la.elevation * 180 / Math.PI) < .01 && Math.abs(((iss.az - la.azimuth * 180 / Math.PI) % 360 + 360) % 360) < .01, 'the ISS where SGP4 puts it from New York (' + (iss && [iss.alt.toFixed(2), iss.az.toFixed(2)]) + ' vs ' + [la.elevation * 180 / Math.PI, la.azimuth * 180 / Math.PI].map(x => x.toFixed(2)) + ')');

    // Ceres against JPL Horizons (9 Nov 2026 05:00 UT: RA 115.367, Dec 24.399, mag 8.09, 2.089 AU); a comet's place is sane
    const ce = await pg.evaluate(j => SKYL.seenFrom('(1) CERES', j), jdOf('2026-11-09T05:00:00Z'));
    const dd = ce && Math.hypot((ce.ra - 115.367) * Math.cos(24.399 * Math.PI / 180), ce.dec - 24.399);
    ok(ce && dd < 1 && Math.abs(ce.mag - 8.09) < .5 && Math.abs(ce.dl - 2.089) < .05, 'Ceres within a degree of JPL Horizons (' + (ce && [ce.ra.toFixed(2), ce.dec.toFixed(2), ce.mag.toFixed(2), ce.dl.toFixed(3)]) + ')');
    const C = JSON.parse(fs.readFileSync(path.join(FX, 'comets.json'))), cn = C.data[0][0].trim().toUpperCase(), q = +C.data[0][2];
    const co = await pg.evaluate(([n, j]) => SKYL.seenFrom(n, j), [cn, jdOf('2026-11-09T05:00:00Z')]);
    ok(co && co.r >= q - 1e-6 && co.dl > .05 && co.dl < co.r + 1.02 && co.dec >= -90 && co.dec <= 90 && isFinite(co.mag), 'a comet\'s place is sane (' + cn + ': ' + (co && [co.ra.toFixed(1), co.dec.toFixed(1), 'r ' + co.r.toFixed(2), 'Δ ' + co.dl.toFixed(2), 'mag ' + co.mag.toFixed(1)]) + ')');

    // meteors: the Geminids' peak at 2 am in New York; ten hours of them counted, and a burst drawn in the naked-eye view
    const jG = jdOf('2026-12-14T07:00:00Z');
    const mt = await pg.evaluate(j => { const r = SKYL.rate(j), s = SKYL.sim(j, 36000); return { rate: r.all, top: r.list[0] && r.list[0].nm, n: s.n }; }, jG);
    ok(mt.top === 'GEMINIDS' && mt.rate > 60 && mt.rate < 170 && Math.abs(mt.n - mt.rate * 10) < 4 * Math.sqrt(mt.rate * 10), 'at the Geminids\' peak about ' + mt.rate.toFixed(0) + ' an hour, and ten hours give ' + mt.n);
    const seen = await pg.evaluate(async j => { SCOPE.fixJD = j; SCOPE.mag = 1; SCOPE.goto = null; SCOPE.alt = 55; SCOPE.az = 120; const n0 = SKYL.metCount; let hit = false;
      await new Promise(r => setTimeout(r, 1200)); SKYL.burst(30); for (let k = 0; k < 40 && !hit; k++) { await new Promise(r => requestAnimationFrame(r)); hit = (SCOPE.near || []).some(e => e[0] === 'meteor'); } return { hit, n: SKYL.metCount - n0 }; }, jG);
    ok(seen.hit, 'a burst of Geminids streaks across the naked-eye view (' + JSON.stringify(seen) + ')');

    // today's Sun under the filter, its sunspot groups; Kp 8 lights the north
    const sn = await pg.evaluate(async () => { SCOPE.fixJD = SCOPE.jdAt(12); SCOPE.filter = true; SCOPE.mag = 50; SCOPE.goTo('sun'); for (let k = 0; k < 120 && SCOPE.goto; k++) await new Promise(r => setTimeout(r, 250)); await new Promise(r => setTimeout(r, 800));
      return { live: SKYL.sunLive, file: SCOPE.files.sun, fill: SCOPE.astro.BODY.sun.fill, centre: SCOPE.centre, txt: document.getElementById('scopev').innerText }; });
    ok(sn.live && /sdo\.gsfc/.test(sn.file) && sn.fill === .9375 && sn.centre === 'sun' && /THE SUN TODAY/.test(sn.txt) && /SUNSPOT GROUPS [1-9]/.test(sn.txt), 'with the filter the Sun is today\'s SDO picture, its groups counted (' + JSON.stringify({ live: sn.live, fill: sn.fill, centre: sn.centre }) + ')');
    if (SHOTS) await pg.screenshot({ path: SHOTS + '/skylive-sun.png' });
    const au = await pg.evaluate(async () => { SCOPE.filter = false; SCOPE.goto = null; SCOPE.track = false; SCOPE.fixJD = SCOPE.jdAt(0); SKYL.kpFix = 8; SCOPE.mag = 1; SCOPE.alt = 18; SCOPE.az = 0; await new Promise(r => setTimeout(r, 1200)); const a = SKYL.auroraSeen;
      SKYL.kpFix = 3; await new Promise(r => setTimeout(r, 800)); const q = SKYL.auroraSeen; return { a, q }; });
    ok(au.a && !au.q, 'Kp 8 lights the northern sky, Kp 3 does not (' + JSON.stringify(au) + ')');
    if (SHOTS) { await pg.evaluate(async () => { SKYL.kpFix = 8; await new Promise(r => setTimeout(r, 1500)); }); await pg.screenshot({ path: SHOTS + '/skylive-aurora.png' }); await pg.evaluate(() => { SKYL.kpFix = null; }); }

    // the ISS in the finder on a pass after dark: found by stepping through the next three days
    const pass = await pg.evaluate(() => { const j0 = Date.parse('2026-11-08T00:00:00Z') / 864e5 + 2440587.5, A = SCOPE.astro;
      for (let k = 0; k < 7 * 2880; k++) { const j = j0 + k * 30 / 86400, q = SKYL.look(25544, j); if (!q || q.alt < 15 || !q.lit) continue; const s = A.where('sun', j); if (A.eq2hor(s.ra, s.dec, A.lst(j)).alt < -6) return { j, ...q }; } return null; });
    ok(!!pass, 'a visible ISS pass within a week of the orbit\'s epoch (' + (pass && [pass.alt.toFixed(1), pass.mag.toFixed(1)]) + ')');
    if (pass) { const r = await pg.evaluate(async p => { SCOPE.fixJD = p.j; SCOPE.mag = 6; SCOPE.goto = null; SCOPE.alt = p.alt + .4; SCOPE.az = p.az - .6; SCOPE.track = false; await new Promise(r => setTimeout(r, 1500));
        return { near: (SCOPE.near || []).map(e => e[0]), first: FIRSTS.of('iss') }; }, pass);
      ok(r.near.includes('iss') && !!r.first, 'the ISS shows in the finder and goes on tonight\'s board (' + JSON.stringify(r) + ')');
      if (SHOTS) await pg.screenshot({ path: SHOTS + '/skylive-iss.png' }); }

    const cost = await pg.evaluate(async () => { SCOPE.mag = 25; SCOPE.alt = 45; SCOPE.az = 180; await new Promise(r => setTimeout(r, 3000)); return SKYL.cost; });
    ok(cost < 4, 'the live sky costs ' + cost.toFixed(2) + ' ms a frame here (software graphics)');
    await pg.evaluate(() => { SCOPE.fixJD = null; SCOPE.track = true; SCOPE.close(); });
    const err = await pg.evaluate(() => Object.entries(SYS.P).flatMap(([k, v]) => v.filter(s => s.err).map(s => k + ':' + s.name)));
    ok(!err.length, 'no SYS errors (' + err.join(',') + ')');
  }
  ok(!errs.length, 'no page errors' + (errs.length ? ': ' + errs.slice(0, 3).join(' | ') : ''));
  await b.close();
  console.log(fails.length ? fails.length + ' failed' : 'all live sky checks passed');
  process.exit(fails.length ? 1 : 0);
})();
