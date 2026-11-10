// THE CARS CHECK: node tests/cars.cjs dist/market.html. The six parked cars on Market St and the police cruiser on West St (its doors, trunk, light bar, horn and siren); get in one and W drives it on Rapier's wheels; F gets out and it stays parked where it stopped; a car someone else drives (as the section's server says) is not drawn parked and cannot be taken, and shows where they park it. No page errors.
const { chromium } = require('playwright'), path = require('path');
const fails = [], ok = (c, m) => { if (!c) { fails.push(m); console.log((process.env.GITHUB_ACTIONS ? '::error title=cars::' : 'FAIL ') + m); } else console.log('ok   ' + m); };
(async () => {
  const b = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const pg = await b.newPage({ viewport: { width: 960, height: 540 } }), errs = [];
  pg.on('pageerror', e => errs.push(e.message.slice(0, 300))); pg.on('console', m => { if (m.type() === 'warning' && /^SYS |CARS/.test(m.text())) errs.push(m.text().slice(0, 300)); });
  await pg.goto('file://' + path.resolve(process.argv[2] || 'dist/market.html') + '?fresh=1&hour=13&physics=1', { waitUntil: 'commit' });
  await pg.waitForFunction(() => window.__started && window.CARS && CARS.dbg().loaded, null, { timeout: 400000, polling: 500 });
  const d0 = await pg.evaluate(() => CARS.dbg());
  ok(d0.cars.length === 12 && d0.cars.slice(7).every(c => /taxi|ambulance|flier|submersible/.test(c.model) && c.shown) && d0.cars.slice(0, 6).every(c => c.shown && c.z < -60 && c.z > -72) && d0.cars[6].model === 'police-cruiser-80s' && d0.cars[6].shown && d0.cars[6].x < -24.5 && d0.cars[6].x > -52.5, 'six cars parked along Market St\'s kerb, the police cruiser on West St: ' + JSON.stringify(d0.cars.map(c => [c.id, c.model, c.x, c.z])));
  const past = await pg.evaluate(async () => { CARS.getIn('c1'); await new Promise(r => setTimeout(r, 800)); return CARS.driving; });
  ok(!past, 'a car parked past the map\'s edge is only seen: no one gets in (owner, 8 Nov 2026)');
  await pg.evaluate(() => { const C = CARS.cars.get('c1'); C.x = SHARED.BOD.XS(78.2); C.z = SHARED.BOD.ZS(-67); });   // the rest drives one brought back onto Market St
  const v0 = await pg.evaluate(() => __dbg.UI.view);
  await pg.evaluate(() => CARS.getIn('c1')); await pg.waitForTimeout(1500);
  const d1 = await pg.evaluate(() => ({ ...CARS.dbg(), hud: document.getElementById('carhud').style.display === 'flex', ride: RIDE.on }));
  ok(d1.driving === 'c1' && d1.ride === 'car:muscle-car-60s' && !d1.cars[0].shown && d1.hud, 'double-clicking gets you in: driving it, the parked one not drawn, the controls on screen: ' + JSON.stringify({ driving: d1.driving, ride: d1.ride, hud: d1.hud }));
  const cam = () => pg.evaluate(() => ({ view: __dbg.UI.view, here: __dbg.UI.viewsHere().join(), off: +((((SHARED.yawTo - SHARED.heading - Math.PI) % (2 * Math.PI)) + 3 * Math.PI) % (2 * Math.PI) - Math.PI).toFixed(2), pitch: +SHARED.pitchTo.toFixed(2), dist: +(__dbg.UI.distTo ?? __dbg.UI.dist).toFixed(1) }));
  const off = () => { return (((SHARED.yawTo - SHARED.heading - Math.PI) % (2 * Math.PI)) + 3 * Math.PI) % (2 * Math.PI) - Math.PI; }, until = (f, a) => pg.waitForFunction(f, a, { timeout: 30000, polling: 200 }).then(() => true, () => false);
  const c0 = await cam(); await pg.evaluate(() => { __dbg.UI.orbit(300, 150); __dbg.UI.setView('first'); }); await until(() => __dbg.UI.view === 'third' && Math.abs(SHARED.pitchTo - .3) < .01); const c1 = await cam();
  await pg.keyboard.down('q'); await until(new Function('return (' + off + ')() > 1.2')); const cq = await cam(); await pg.keyboard.up('q');
  await pg.keyboard.down('r'); await until(new Function('return (' + off + ')() < -1.2')); const ce = await cam(); await pg.keyboard.up('r');
  await until(new Function('return Math.abs((' + off + ')()) < .1')); const cb = await cam();
  await pg.evaluate(() => __dbg.UI.zoomLv({ deltaY: -120 })); await pg.waitForTimeout(300); const cz = await cam();
  ok(c0.view === 'third' && c0.here === 'third' && Math.abs(c0.off) < .05 && c1.view === 'third' && Math.abs(c1.off) < .05 && c1.pitch === c0.pitch && cq.off > 1.2 && ce.off < -1.2 && Math.abs(cb.off) < .1 && cz.dist < c0.dist, 'driving, the view is locked behind the car (no drag, tilt or other view), Q and E look left and right, the wheel zooms: ' + JSON.stringify({ c0, c1, cq, ce, cb, cz }));
  const x0 = await pg.evaluate(() => __dbg.pos()[0] / __dbg.cv().TILE);
  await pg.keyboard.down('w'); let top = 0, veh = false; for (let i = 0; i < 20; i++) { await pg.waitForTimeout(500); const q = await pg.evaluate(() => ({ ...CARS.dbg(), x: __dbg.pos()[0] / __dbg.cv().TILE })); top = Math.max(top, q.v); veh = veh || q.veh; if (q.x - x0 > 2) break; } await pg.keyboard.up('w');   // let go after two tiles: held for a fixed time a fast runner reaches the next parked car and bounces off it
  const x1 = await pg.evaluate(() => __dbg.pos()[0] / __dbg.cv().TILE);
  ok(veh && x1 - x0 > 1 && top > 1, 'W drives it east on Rapier\'s wheels: ' + JSON.stringify({ moved: +(x1 - x0).toFixed(1), top, veh }));
  await pg.waitForTimeout(2500); await pg.keyboard.press('f'); await pg.waitForTimeout(1200);
  const d2 = await pg.evaluate(() => { const c = CARS.dbg(), p = __dbg.pos(), T = __dbg.cv().TILE, c1 = c.cars[0]; return { driving: c.driving, ride: RIDE.on, c1, gap: +Math.hypot(p[0] / T + SHARED.BOD.OX - c1.x, p[2] / T + SHARED.BOD.OY - c1.z).toFixed(2), hud: document.getElementById('carhud').style.display === 'flex' }; });
  ok(await pg.evaluate(() => __dbg.UI.view) === v0, 'out of the car in town, the view is the one you had before ('+v0+')');
  ok(!d2.driving && !d2.ride && d2.c1.shown && d2.c1.x - 78.2 > 1 && d2.gap > 1 && d2.gap < 4 && !d2.hud, 'F gets you out beside it, and it stays parked where it stopped: ' + JSON.stringify(d2));
  const d3 = await pg.evaluate(() => { ONLINE.feed({ t: 'car', k: 'c2', by: 'a' }); const s = CARS.dbg().cars[1]; CARS.getIn('c2'); return { shown: s.shown, by: s.by, driving: CARS.dbg().driving }; });
  const d4 = await pg.evaluate(() => { ONLINE.feed({ t: 'car', k: 'c2', by: null, at: [SHARED.BOD.XS(60), SHARED.BOD.ZS(-60), 1.2].join(',') }); return CARS.dbg().cars[1]; });
  ok(d3.by === 'a' && !d3.shown && !d3.driving && d4.shown && !d4.by && Math.abs(d4.x - 60) < .2 && Math.abs(d4.z + 60) < .2, 'a car someone else drives is not drawn parked and cannot be taken; it shows where they park it: ' + JSON.stringify({ d3, d4 }));
  // the police cruiser (150pe-carparts): its parts open on their hinges, the light bar, the lamps, the horn and the siren, one shared word a car
  await pg.evaluate(() => SYS.run('world', 'car:c7', [SHARED.BOD.XS(70), SHARED.BOD.ZS(-67), 1.57].join())); await pg.waitForTimeout(600);
  const P = () => pg.evaluate(() => { const d = CARX.dbg(); return { st: d.cars.c7, parts: d.parts }; }), p0 = await P();
  ok(p0.parts.length >= 1 && Object.keys(p0.parts[0].open).length === 6 && p0.parts[0].marks === 4 && p0.st.b === 0, 'the cruiser is made with six parts on hinges its shields and blank plates (no words): ' + JSON.stringify(p0.parts[0]));
  const things = await pg.evaluate(() => __dbg.UI.things.filter(t => t.car && t.car.id === 'c7').map(t => t.name));
  await pg.evaluate(() => { const t = __dbg.UI.things.find(t => t.car && t.car.id === 'c7' && t.name === 'TRUNK'); t.act(); ONLINE.feed({ t: 'world', k: 'cst:c7', v: (CARX.parts.bits(CARS.cars.get('c7')) | 64 | 4) + '.3' }); }); await pg.waitForTimeout(2500); const p1 = await P();
  ok(things.length === 6 && things.includes('DRIVER\'S DOOR') && p1.st.b === 84 && p1.st.h === 3 && p1.parts[0].open.TRUNK > .9 && p1.parts[0].open['DOOR RL'] > .9 && p1.parts[0].open.HOOD === 0 && p1.parts[0].bar, 'double-clicking the trunk opens it; what another player does (a door, the roof lights) shows on the parked car: ' + JSON.stringify({ things, p1 }));
  await pg.evaluate(() => __dbg.UI.things.find(t => t.car && t.car.id === 'c7' && t.name === 'DRIVER\'S DOOR').act()); await pg.waitForTimeout(1800);
  const h0 = await pg.evaluate(() => ({ driving: CARS.dbg().driving, st: CARX.dbg().cars.c7, hud: document.getElementById('carhud').innerText.replace(/\s+/g, ' ') }));
  for (const k of ['h', 'n', 'l', 'b']) await pg.keyboard.press(k); await pg.waitForTimeout(500);
  const h1 = await pg.evaluate(() => ({ st: CARX.dbg().cars.c7, ride: CARX.dbg().parts.find(p => p.head > 1) }));
  await pg.keyboard.press('f'); await pg.waitForTimeout(1200); const h2 = await pg.evaluate(() => CARX.dbg().cars.c7);
  ok(h0.driving === 'c7' && !(h0.st.b & 15) && /HORN H/.test(h0.hud) && /SIREN N/.test(h0.hud) && h1.st.h === 4 && (h1.st.b & 448) === 128 + 256 && !!h1.ride && !(h2.b & 128) && (h2.b & 256), 'the driver\'s door lets you in (the doors shut); H honks, N the siren, L the lamps, B the roof lights; out of it the siren stops: ' + JSON.stringify({ h0, h1, h2 }));
  // the hover cars (tools/fliers-bake.py): a car that flies is flown like the helicopter (SPACE up, SHIFT down); you get out only landed on the street
  await pg.evaluate(() => SYS.run('world', 'car:c8', [SHARED.BOD.XS(60), SHARED.BOD.ZS(-60), 1.57].join())); await pg.waitForTimeout(400);
  await pg.evaluate(() => CARS.getIn('c8')); await pg.waitForTimeout(1500);
  const fl = async (key, n) => { await pg.keyboard.down(key); const r = await pg.evaluate(n => { const k = CARS.kinds['taxi-coupe']; for (let i = 0; i < n; i++) k.step(RIDE, .1); return { y: +(k.F.y - SHARED.groundY(k.F.x, k.F.z)).toFixed(2), down: k.F.down }; }, n); await pg.keyboard.up(key); return r; };
  const f0 = await pg.evaluate(() => ({ ride: RIDE.on, parts: Object.keys(CARX.dbg().parts.slice(-1)[0].open).length, hud: document.getElementById('carhud').innerText.replace(/\s+/g, ' ') }));
  const up = await fl(' ', 30); await pg.keyboard.press('f'); await pg.waitForTimeout(300); const still = await pg.evaluate(() => CARS.dbg().driving);
  const dn = await fl('Shift', 120); await pg.keyboard.press('f'); await pg.waitForTimeout(1200); const out = await pg.evaluate(() => ({ driving: CARS.dbg().driving, ride: RIDE.on, c: CARS.dbg().cars.find(c => c.id === 'c8') }));
  ok(f0.ride === 'car:taxi-coupe' && f0.parts === 4 && /SPACE UP/.test(f0.hud) && up.y > 1 && !up.down && still === 'c8' && dn.down && dn.y < .2 && !out.driving && !out.ride && out.c.shown, 'a hover taxi lifts on SPACE, cannot be left in the air, comes down on SHIFT and parks where it lands: ' + JSON.stringify({ f0, up, still, dn, out }));
  ok(!errs.length, 'no page errors' + (errs.length ? ': ' + errs.slice(0, 3).join(' | ') : ''));
  await b.close(); console.log(fails.length ? fails.length + ' failed' : 'all car checks passed'); process.exit(fails.length ? 1 : 0);
})();
