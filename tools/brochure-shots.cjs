// THE BROCHURES' PHOTOGRAPHS (data/brochures/<id>-<n>.jpg; n 0 the cover, 1 and 2 inside, 3 the place): taken in the built game, the HUD hidden, cut clear of the minimap.
// MIN=0 SKIP=g python3 build.py, then PW_CHROMIUM=/opt/pw-browsers/chromium node tools/brochure-shots.cjs [out dir] [only, as art-0,books]; slow under software rendering (about 15 s a picture).
// The game's hour is HOUR (13 unless set); the sky's photographs are taken at dusk: HOUR=20 ... stars, the cover and the room then brightened 1.7x (the Moon is wherever it really is that evening).
// Re-shoot a brochure when its place changes. Each picture: [stop, view, yaw, pitch, cut (x0,y0,x1,y1 of the game's frame), set (code run first, optional)]; PICS=table.json FULL=1 to try framings; a stop is how you get there and what you hold.
const { chromium } = require('playwright'), path = require('path'), fs = require('fs');
const OUT = path.resolve(process.argv[2] || 'data/brochures'), ONLY = process.argv[3] && process.argv[3].split(','), PI = Math.PI, W = 720, H = 480;
const PICS = process.env.PICS ? require(path.resolve(process.env.PICS)) : {
  wreck: [['dive', 'third', 0, .1, [0, .27, .78, 1]], ['deep', 'third', PI, .35, [0, .4, 1, 1]], ['deep', 'third', 0, .35, [0, .45, .9, 1]], ['fsfront', 'third', PI, .1, [0, .12, .72, 1]]],
  fish: [['pier', 'third', 0, .12, [0, .36, 1, 1]], ['pier', 'third', PI, .12, [0, .3, .74, 1]], ['cast', 'third', null, null, [0, .05, .72, 1]], ['pier', 'third', -PI / 2, .12, [0, .3, .74, 1]]],
  pets: [['pets', 'third', 0, .2, [0, .05, 1, .62]], ['rept', 'third', 0, .15, [0, .05, 1, .62]], ['aqua', 'third', PI / 2, .12, [0, .3, .72, 1]], ['pets', 'third', -PI / 2, .15, [0, .12, .74, 1]]],
  nature: [['lake', 'third', PI / 2, .12, [0, .3, .72, 1]], ['lawn', 'third', PI / 2, .12, [0, .3, .72, 1]], ['lake', 'third', -PI / 2, .12, [0, .3, .72, 1]], ['gate', 'third', 0, .12, [0, 0, .72, 1]]],
  shroom: [['fly60', 'third', PI / 2, .35, [0, .1, .72, 1]], ['fly60', 'third', PI, .7, [0, .1, .72, 1]], ['fly130', 'third', -PI / 2, .6, [0, .12, .72, 1]], ['mstall', 'third', PI, .12, [0, .3, .74, 1]]],
  bees: [['hive', 'third', 0, .2, [.1, .1, .72, 1]], ['bstall', 'third', PI, .12, [0, .4, 1, 1]], ['hive', 'third', PI, .2, [0, .35, .72, 1]], ['bstall', 'third', -PI / 2, .12, [0, .3, .72, 1]]],
  art: [['artfront', 'third', 0, .1, [.03, 0, .72, .82]], ['mus', 'first', 0, .05, [0, .05, 1, 1]], ['mus', 'third', 3 * PI / 4, .2, [0, .15, 1, 1]], ['artside', 'third', PI / 4, .1, [0, .05, .66, 1]]],
  books: [['books', 'third', 0, .12, [0, .08, 1, .72]], ['books', 'third', -PI / 2, .1, [0, .12, .62, 1]], ['books', 'third', PI / 2, .12, [.3, .15, 1, 1]], ['books', 'third', 0, .12, [.05, .2, .6, .75]]],
  arcade: [['arcade', 'first', -PI / 3, .05, [0, .1, .72, 1]], ['arcade', 'first', PI / 3, .05, [0, .15, .72, 1]], ['arcade', 'third', -2 * PI / 3, .1, [0, .15, .72, 1]], ['arcade', 'third', PI, .12, [0, .25, 1, 1]]],
  music: [['guitar', 'third', 0, .2, [0, 0, .72, 1]], ['guitar', 'third', PI, .2, [0, .08, .72, 1]], ['bar', 'third', 0, .12, [0, .08, 1, .72]], ['bodfront', 'third', 0, .1, [0, 0, .7, 1]]],
  stars: [['scope', 'third', PI / 6, .12, [0, 0, .62, 1]], ['moon', 'hud', null, null, [.01, .125, .61, .875]], ['mic', 'hud', null, null, [.15, .1, .86, .72]], ['scopefar', 'third', .55, .1, [0, .08, 1, 1]]],
  gems: [['dungeon', 'third', 0, .12, [0, .1, .72, 1]], ['dungeon', 'third', -PI, .12, [0, .15, .72, 1]], ['deep', 'third', -PI / 2, .35, [0, .45, 1, 1]], ['gstall', 'third', PI, .12, [0, .35, .74, 1]]],
};
(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const b = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'], ...(process.env.PW_CHROMIUM ? { executablePath: process.env.PW_CHROMIUM } : {}) });
  const pg = await b.newPage({ viewport: { width: W, height: H } }); pg.on('pageerror', e => console.log('page error', e.message.slice(0, 200)));
  await pg.goto('file://' + path.resolve('dist/market.html') + '?fresh=1&res=1&hour=' + (process.env.HOUR || 13), { waitUntil: 'commit' }); await pg.waitForFunction(() => window.__started, null, { timeout: 400000 });
  const ev = (f, a) => pg.evaluate(f, a), wait = (f, t = 120000) => pg.waitForFunction(f, null, { timeout: t, polling: 200 }).catch(() => console.log('timed out', String(f).slice(0, 60)));
  const clear = () => wait(() => { const L = document.getElementById('loading'); return (!L || getComputedStyle(L).display === 'none' || getComputedStyle(L).opacity === '0') && !FADE.busy; }, 240000);
  const settle = async (ms = 5000) => { await pg.waitForTimeout(2500); await clear(); await pg.waitForTimeout(ms); };
  const goN = async n => { await ev(n => __dbg.UI.goName(n), n); await settle(); }, goW = async (x, z) => { await ev(([x, z]) => STORE.goTo(x, z, 'up'), [x, z]); await settle(); };
  const goT = (x, y) => ev(([x, y]) => [SHARED.BOD.XS(x), SHARED.BOD.ZS(y)], [x, y]).then(p => goW(...p)), room = async id => { await ev(id => ROOMS.enter(id), id); await settle(7000); };
  const river = async () => { await goT(61, -118); await wait(() => window.RIVER && RIVER.on, 90000); };
  const fly = async m => { await goW(45.2, 62); await ev(() => { WIELD.set(null); FORAGE.give('shroom_fly', 1); FORAGE.eat('shroom_fly'); }); await pg.keyboard.press('g'); await pg.waitForTimeout(3000); await pg.keyboard.down(' '); await pg.waitForTimeout(5000); await pg.keyboard.up(' ');
    await ev(m => { SHARED.py = m * 33.9 / 30 / .84; }, m); await pg.keyboard.down('w'); await pg.waitForTimeout(3500); };
  const land = async () => { await pg.keyboard.up('w'); await ev(() => { const y = __dbg.you(); SHARED.py = SHARED.groundY(y.x, y.z) + 2; }); await pg.keyboard.press('g'); await pg.waitForTimeout(6000); };
  const dive = async () => { await river(); await ev(() => { for (const id of ['goggles', 'headlight', 'scuba']) { INV.add(id, 1); EQUIP.wear(id, true); } const [x, z] = WRECK.at, T = __dbg.cv().TILE; STORE.goTo(x + 4 * T, z + 3 * T, 'up'); }); await settle(3000); await wait(() => RIVER.swim); await pg.waitForTimeout(3000); };
  const undress = () => ev(() => { for (const s in EQUIP.by) EQUIP.off(s); });
  // each stop: how to get there, and how to leave it
  const STOPS = {
    fs: [() => goN('FISHING & SCUBA')], mstall: [() => goN('THE MUSHROOM STALL')], bstall: [() => goN("THE BEEKEEPER'S STALL")], gstall: [() => goN('THE GEM STALL')], gate: [() => goN('CENTRAL PARK')],
    pets: [() => goN('DOGS & CATS')], aqua: [() => goN('THE AQUARIUM')], bodega: [() => goN('THE BODEGA')], mus: [() => goN('THE ART MUSEUM')], dungeon: [() => goN('THE DUNGEON')], apt: [() => goN('YOUR APARTMENT')],
    rept: [() => room('reptiles')], books: [() => room('books')], arcade: [() => room('arcade')], bar: [() => room('bar')],
    artfront: [() => goT(241, -68)], fsfront: [() => goT(-24.5, -112)], bodfront: [() => goT(101, -71)], artside: [() => goT(247, -65)], lake: [() => goW(89, 98)], lawn: [async () => { await goW(45.2, 75); await ev(() => WIELD.set('bnet')); }, () => ev(() => WIELD.set(null))],
    hive: [async () => { await goW(60, 70); await ev(() => { FORAGE.give('bee_hive', 1); BEES.set(); __dbg.UI.dist *= .6; }); }, () => ev(() => { __dbg.UI.dist /= .6; })],
    guitar: [async () => { await goW(56.3, 153.9); await ev(() => __dbg.UI.things.find(t => /GUITAR/.test(t.name) && t.obj.visible).act()); await pg.waitForTimeout(6000); }, () => ev(() => GUITAR.stop && GUITAR.stop())],
    pier: [async () => { await river(); const p = await ev(() => { const T = __dbg.cv().TILE; return [PIER.x + 3.2 * T, PIER.zE + 1.6 * T]; }); await goW(...p); await ev(() => WIELD.set('rod')); }],
    cast: [async () => { await STOPS.pier[0](); await ev(() => { FORAGE.give('bait_cut', 5); FORAGE.ACT.fhook('bait_cut'); FISHING.enter(); }); await pg.waitForTimeout(4000); }, () => pg.keyboard.press('Escape')],
    fly60: [() => fly(60), land], fly130: [() => fly(130), land],
    dive: [async () => { await dive(); await pg.keyboard.down(' '); await pg.waitForTimeout(6000); }, async () => { await pg.keyboard.up(' '); await undress(); }],
    deep: [async () => { await dive(); await pg.keyboard.down(' '); await pg.waitForTimeout(3000); await ev(() => { const W = __dbg.ST.water; W.dive = true; W.y = W.level + (W.floor - W.level) * .95; }); await pg.waitForTimeout(3500); await pg.keyboard.up(' '); }, () => undress()],
    scope: [async () => { await goN('YOUR APARTMENT'); const p = await ev(() => { const t = __dbg.UI.things.find(t => t.name === 'TELESCOPE'), q = t.obj.getWorldPosition(t.obj.position.clone()), y = __dbg.you(), d = Math.hypot(y.x - q.x, y.z - q.z) || 1, T = __dbg.cv().TILE; return [q.x + (y.x - q.x) / d * .9 * T, q.z + (y.z - q.z) / d * .9 * T]; });
      await goW(...p); await ev(() => { __dbg.UI.dist *= .5; }); }, () => ev(() => { __dbg.UI.dist /= .5; })],
    moon: [async () => { await goN('YOUR APARTMENT'); await ev(async () => { await SCOPE.open(); for (const k in FORAGE.S.sk) FORAGE.S.sk[k] = Math.max(FORAGE.S.sk[k], 1000); }); await pg.waitForTimeout(5000);
      await ev(() => { const b = [...document.querySelectorAll('[data-m]')].find(b => b.dataset.m === '50'); if (b) b.click(); SCOPE.fixJD = SCOPE.jdAt(20); SCOPE.goTo('moon'); }); await pg.waitForTimeout(25000); }, () => ev(() => { SCOPE.fixJD = null; SCOPE.close(); })],
    scopefar: [async () => { await goN('YOUR APARTMENT'); const p = await ev(() => { const t = __dbg.UI.things.find(t => t.name === 'TELESCOPE'), q = t.obj.getWorldPosition(t.obj.position.clone()), y = __dbg.you(), d = Math.hypot(y.x - q.x, y.z - q.z) || 1, T = __dbg.cv().TILE; return [q.x + (y.x - q.x) / d * 3 * T, q.z + (y.z - q.z) / d * 3 * T]; });
      await goW(...p); await ev(() => { __dbg.UI.dist *= .6; }); }, () => ev(() => { __dbg.UI.dist /= .6; })],
    mic: [async () => { await goN('YOUR APARTMENT'); await ev(() => __dbg.UI.things.find(t => /MICROSCOPE/.test(t.name)).act()); await pg.waitForTimeout(12000); }, () => ev(() => MIC.close && MIC.close())],
  };
  const hud = on => ev(on => { if (!on) { window.__hid = []; document.querySelectorAll('body *').forEach(e => { if (e.tagName !== 'CANVAS' && !e.querySelector('canvas') && e.tagName !== 'SCRIPT' && e.tagName !== 'STYLE' && e.style.visibility !== 'hidden') { window.__hid.push([e, e.style.visibility]); e.style.visibility = 'hidden'; } }); } else for (const [e, v] of window.__hid || []) e.style.visibility = v; }, on);
  const todo = []; for (const id in PICS) PICS[id].forEach((p, i) => { if (!ONLY || ONLY.includes(id) || ONLY.includes(id + '-' + i)) todo.push([id, i, ...p]); });
  todo.sort((a, c) => a[2] < c[2] ? -1 : a[2] > c[2] ? 1 : 0); await clear(); let at = null;
  for (const [id, i, stop, view, yaw, pitch, cut0, set] of todo) { const cut = process.env.FULL ? [0, 0, 1, 1] : cut0; try {
      if (stop !== at) { if (at && STOPS[at][1]) await STOPS[at][1](); await ev(() => { if (ROOMS.cur && ROOMS.cur.off) ROOMS.exit(ROOMS.cur.off); }); await pg.waitForTimeout(1500); await clear(); await STOPS[stop][0](); at = stop; }
      if (view !== 'hud') { await ev(v => { __dbg.UI.viewsHere = () => ['iso', 'third', 'first']; __dbg.UI.setView(v); }, view); if (yaw != null) await ev(([y, p]) => { SHARED.yaw = SHARED.yawTo = y; SHARED.pitch = SHARED.pitchTo = p; }, [yaw, pitch]); if (set) await ev(set); await pg.waitForTimeout(set ? 3000 : 1800); await hud(false); await pg.waitForTimeout(250); }
      const gx = W * .0667, gy = H * .0656, gw = W * .8666, gh = H * .8684, clip = view === 'hud' ? { x: W * cut[0], y: H * cut[1], width: W * (cut[2] - cut[0]), height: H * (cut[3] - cut[1]) } : { x: gx + gw * cut[0] + 2, y: gy + gh * cut[1] + 2, width: gw * (cut[2] - cut[0]) - 4, height: gh * (cut[3] - cut[1]) - 4 };
      await pg.screenshot({ path: `${OUT}/${id}-${i}.jpg`, type: 'jpeg', quality: 80, clip }); if (view !== 'hud') await hud(true); console.log('shot', id + '-' + i, stop);
    } catch (e) { console.log('FAILED', id + '-' + i, stop, e.message.slice(0, 160)); at = null; } }
  await b.close();
})();
