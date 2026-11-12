// THE CARS CHECK: node tests/cars.cjs dist/market.html. Five parked cars on Market St past the edge, the convertible in the park (boarded, painted outside and in, driven, seen from the driver's seat), the police cruiser, the hover cars, the police flier and the submersible on West St and at the pier (doors, trunk, light bar, horn, siren, flying); get in one and W drives it on Rapier's wheels; F gets out and it stays parked where it stopped; a resized car drives at its size; the kerb and a corner's arc are rolled over; the go-kart is set down in front of you and throws you out at a wall; a car someone else drives (as the section's server says) is not drawn parked and cannot be taken, and shows where they park it. No page errors.
const { chromium } = require('playwright'), path = require('path');
const fails = [], ok = (c, m) => { if (!c) { fails.push(m); console.log((process.env.GITHUB_ACTIONS ? '::error title=cars::' : 'FAIL ') + m); } else console.log('ok   ' + m); };
(async () => {
  const b = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const pg = await b.newPage({ viewport: { width: 960, height: 540 } }), errs = [];
  pg.on('pageerror', e => errs.push(e.message.slice(0, 300))); pg.on('console', m => { if (m.type() === 'warning' && /^SYS |CARS/.test(m.text())) errs.push(m.text().slice(0, 300)); });
  await pg.goto('file://' + path.resolve(process.argv[2] || 'dist/market.html') + '?fresh=1&hour=13&physics=1', { waitUntil: 'commit' });
  await pg.waitForFunction(() => window.__started && window.CARS && CARS.dbg().loaded, null, { timeout: 400000, polling: 500 });
  const d0 = await pg.evaluate(() => CARS.dbg());
  ok(d0.cars.length === 11 && d0.cars.slice(6).every(c => /taxi|ambulance|flier|submersible/.test(c.model) && c.shown) && d0.cars.slice(0, 5).every((c, i) => c.shown && (i === 1 ? c.model === 'convertible-60s' && c.x === -27.5 && c.z === 56 : c.z < -60 && c.z > -72)) && d0.cars[5].model === 'police-cruiser-80s' && d0.cars[5].shown && d0.cars[5].x < -24.5 && d0.cars[5].x > -52.5, 'four cars parked along Market St\'s kerb (the pickup archived, 12 Nov 2026), the convertible and the police cruiser on West St\'s line in the park: ' + JSON.stringify(d0.cars.map(c => [c.id, c.model, c.x, c.z])));
  const past = await pg.evaluate(async () => { CARS.getIn('c1'); await new Promise(r => setTimeout(r, 800)); return CARS.driving; });
  ok(!past, 'a car parked past the map\'s edge is only seen: no one gets in (owner, 8 Nov 2026)');
  const cab = await pg.evaluate(async () => { const C = [...CARS.cars.values()].find(q => q.id !== 'c1' && q.mesh && q.mesh.getObjectByName('INSIDE')), I = C.mesh.getObjectByName('INSIDE'), w = { x: C.x, z: C.z }, sl = () => new Promise(r => setTimeout(r, 900));
    const far = { x: STORE.pos.x, z: STORE.pos.z }; STORE.pos.set(w.x + 60, 0, w.z); await sl(); const until = async v => { const t0 = performance.now(); while (I.visible !== v && performance.now() - t0 < 15000) await new Promise(r => setTimeout(r, 100)); return I.visible; }; const away = await until(false); STORE.pos.set(w.x + 3, 0, w.z); const near = await until(true); STORE.pos.set(far.x, 0, far.z); return { away, near }; });
  ok(cab.away === false && cab.near === true, "a car's inside is drawn only near it (owner, 9 Nov 2026): " + JSON.stringify(cab));
  await pg.evaluate(() => { const C = CARS.cars.get('c1'); C.x = SHARED.BOD.XS(78.2); C.z = SHARED.BOD.ZS(-67); });   // the rest drives one brought back onto Market St
  const v0 = await pg.evaluate(() => __dbg.UI.view);
  await pg.evaluate(() => CARS.getIn('c1')); await pg.waitForTimeout(1500);
  const d1 = await pg.evaluate(() => ({ ...CARS.dbg(), hud: document.getElementById('carhud').style.display === 'flex', ride: RIDE.on }));
  ok(d1.driving === 'c1' && d1.ride === 'car:muscle-car-60s' && !d1.cars[0].shown && d1.hud, 'double-clicking gets you in: driving it, the parked one not drawn, the controls on screen: ' + JSON.stringify({ driving: d1.driving, ride: d1.ride, hud: d1.hud }));
  const cam = () => pg.evaluate(() => ({ view: __dbg.UI.view, here: __dbg.UI.viewsHere().join(), off: +((((SHARED.yawTo - SHARED.heading - Math.PI) % (2 * Math.PI)) + 3 * Math.PI) % (2 * Math.PI) - Math.PI).toFixed(2), pitch: +SHARED.pitchTo.toFixed(2), dist: +(__dbg.UI.distTo ?? __dbg.UI.dist).toFixed(1) }));
  const off = () => { return (((SHARED.yawTo - SHARED.heading - Math.PI) % (2 * Math.PI)) + 3 * Math.PI) % (2 * Math.PI) - Math.PI; }, until = (f, a) => pg.waitForFunction(f, a, { timeout: 30000, polling: 200 }).then(() => true, () => false);
  const c0 = await cam(); await pg.evaluate(() => { __dbg.UI.orbit(300, 150); __dbg.UI.setView('iso'); }); await until(() => __dbg.UI.view === 'third' && Math.abs(SHARED.pitchTo - .3) < .01); const c1 = await cam();
  await pg.keyboard.down('q'); await until(new Function('return (' + off + ')() > 1.2')); const cq = await cam(); await pg.keyboard.up('q');
  await pg.keyboard.down('r'); await until(new Function('return (' + off + ')() < -1.2')); const ce = await cam(); await pg.keyboard.up('r');
  await until(new Function('return Math.abs((' + off + ')()) < .1')); const cb = await cam();
  await pg.evaluate(() => __dbg.UI.zoomLv({ deltaY: -120 })); await pg.waitForTimeout(300); const cz = await cam();
  ok(c0.view === 'third' && c0.here === 'third,first' && Math.abs(c0.off) < .05 && c1.view === 'third' && Math.abs(c1.off) < .05 && c1.pitch === c0.pitch && cq.off > 1.2 && ce.off < -1.2 && Math.abs(cb.off) < .1 && cz.dist < c0.dist, 'driving, the view starts locked behind the car (no drag, tilt or overhead view; first person allowed), Q and E look left and right, the wheel zooms: ' + JSON.stringify({ c0, c1, cq, ce, cb, cz }));
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
  await pg.evaluate(() => { const t = __dbg.UI.things.find(t => t.car && t.car.id === 'c7' && t.name === 'TRUNK'); t.act(); ONLINE.feed({ t: 'world', k: 'cst:c7', v: (CARX.parts.bits(CARS.cars.get('c7')) | 64 | 4) + '.3' }); });
  await pg.waitForFunction(() => { const o = CARX.dbg().parts[0].open; return o.TRUNK > .9 && o['DOOR RL'] > .9; }, null, { timeout: 10000, polling: 200 }).catch(() => {});   // (the lid swings at its own pace: a slow machine draws fewer frames)
  const p1 = await P();
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
  // a car resized in the VEHICLE EDITOR drives at that size; while someone drives it, on their next boarding (owner, 10 Nov 2026)
  const half = () => pg.evaluate(() => { const V = CARS.kinds['muscle-car-60s'].V; return { h: V.S.half[0], next: !!V.next, kart: RIDE.kinds.kart.V.S.half[0] }; }), near = (a, b) => Math.abs(a / b - 1) < .01;
  const r0 = await half(); await pg.evaluate(() => { VLOOK.set('car:muscle-car-60s', { s: 1.3 }); VLOOK.set('kart', { s: 1.5 }); });
  await until(new Function('return Math.abs(CARS.kinds["muscle-car-60s"].V.S.half[0] / ' + r0.h + ' - 1.3) < .01 && Math.abs(RIDE.kinds.kart.V.S.half[0] / ' + r0.kart + ' - 1.5) < .01')); const r1 = await half();
  ok(near(r1.h, r0.h * 1.3) && near(r1.kart, r0.kart * 1.5), 'resized in the VEHICLE EDITOR, a car and the go-kart drive at that size: ' + JSON.stringify({ r0, r1 }));
  // the kerb (owner, 10 Nov 2026: "Just the kerb"): driven at it from the road, a car rolls up onto the pavement
  await pg.evaluate(() => __dbg.UI.goTo(78.2, -62, 'up')); await pg.waitForTimeout(3000);
  await pg.evaluate(() => { const C = CARS.cars.get('c1'); C.x = SHARED.BOD.XS(78.2); C.z = SHARED.BOD.ZS(-66.5); C.hd = Math.PI; CARS.getIn('c1'); }); await pg.waitForTimeout(2500);
  await pg.evaluate(() => VLOOK.set('car:muscle-car-60s', null)); await until(() => CARS.kinds['muscle-car-60s'].V.next || !CARS.driving); const r2 = await half();
  await until(() => !!CARS.dbg().rb).catch(() => {});
  await pg.evaluate(() => { const V = CARS.kinds['muscle-car-60s'].V, x = SHARED.BOD.XS(78.2), z = SHARED.BOD.ZS(-66.5), y = SHARED.groundY(x, z) + V.S.lift; if (!V.rb) return;   // (set flat on the road, facing the kerb, at rest: where boarding drops it varies on a slow page)
    V.rb.setTranslation({ x, y, z }, true); V.rb.setRotation({ x: 0, y: 1, z: 0, w: 0 }, true); V.rb.setLinvel({ x: 0, y: 0, z: 0 }, true); V.rb.setAngvel({ x: 0, y: 0, z: 0 }, true); });
  await pg.waitForTimeout(2000);
  const k0 = await pg.evaluate(() => CARS.dbg().rb); await pg.keyboard.down('w'); let k1 = k0, kn = 0;
  for (let i = 0; i < 40; i++) { await pg.waitForTimeout(400); const q = await pg.evaluate(() => ({ rb: CARS.dbg().rb, n: GPH.kerbs() })); if (q.rb) k1 = q.rb; kn = Math.max(kn, q.n); if (k1.p[2] < -69.5) break; } await pg.keyboard.up('w');
  ok(kn > 0 && k0 && k1.p[2] < -69.5 && Math.abs(k1.p[0] - k0.p[0]) < .5 && k1.p[1] > k0.p[1] - .1, 'the kerb is a slope to the physics: the car rolls up onto the pavement, not shoved along it: ' + JSON.stringify({ kerbs: kn, from: k0 && k0.p, to: k1.p }));
  await pg.waitForTimeout(1500); await pg.keyboard.press('f'); await pg.waitForTimeout(1200); const r3 = await half();
  ok(near(r2.h, r0.h * 1.3) && r2.next && near(r3.h, r0.h) && !r3.next, 'a resize while it is driven waits for the next boarding: ' + JSON.stringify({ driving: r2, out: r3 }));
  // a corner's arc the same (owner, 10 Nov 2026: "fix the small leftovers"): driven at it from the road, toward the corner's centre, the car's front rolls up onto the pavement, its nose tipped up (the pole on the corner taken away for the drive)
  const ka = await pg.evaluate(() => { const a = (SHARED.BOD.kerbArcs || [])[0]; if (!a) return null; const t = -Math.PI / 4, R = a.r + 3; return { cx: a.cx, cy: a.cy, r: a.r, x: a.cx + Math.cos(t) * R, y: a.cy + Math.sin(t) * R }; });
  if (ka) {
  await pg.evaluate(k => __dbg.UI.goTo(k.x, k.y, 'up'), ka); await pg.waitForTimeout(3000);
  await pg.evaluate(k => { const B = SHARED.BOD, T = __dbg.cv().TILE, cx = B.XS(k.cx), cz = B.ZS(k.cy), inn = (x0, z0, x1, z1) => Math.hypot(Math.max(x0 - cx, 0, cx - x1), Math.max(z0 - cz, 0, cz - z1)) < k.r * T && x1 - x0 < T && z1 - z0 < T;
    window.__pole = [SHARED.solids.filter(r => inn(r[0], r[1], r[2], r[3])), SHARED.fixed.filter(f => inn(f[0], f[1], f[3], f[4]))]; for (const r of __pole[0]) SHARED.solids.splice(SHARED.solids.indexOf(r), 1); for (const f of __pole[1]) SHARED.fixed.splice(SHARED.fixed.indexOf(f), 1);
    const C = CARS.cars.get('c1'); C.x = B.XS(k.x); C.z = B.ZS(k.y); CARS.getIn('c1'); }, ka); await pg.waitForTimeout(2500); await until(() => !!CARS.dbg().rb).catch(() => {});
  await pg.evaluate(k => { const V = CARS.kinds['muscle-car-60s'].V, B = SHARED.BOD, x = B.XS(k.x), z = B.ZS(k.y), y = SHARED.groundY(x, z) + V.S.lift, h = Math.atan2(B.XS(k.cx) - x, B.ZS(k.cy) - z); if (!V.rb) return;
    V.rb.setTranslation({ x, y, z }, true); V.rb.setRotation({ x: 0, y: Math.sin(h / 2), z: 0, w: Math.cos(h / 2) }, true); V.rb.setLinvel({ x: 0, y: 0, z: 0 }, true); V.rb.setAngvel({ x: 0, y: 0, z: 0 }, true); }, ka);
  await pg.waitForTimeout(2000);
  const rad = q => Math.hypot(q.p[0] - ka.cx, q.p[2] - ka.cy), side = q => { const L = Math.hypot(ka.x - ka.cx, ka.y - ka.cy); return ((q.p[0] - ka.cx) * (ka.y - ka.cy) - (q.p[2] - ka.cy) * (ka.x - ka.cx)) / L; };
  const arc0 = await pg.evaluate(() => CARS.dbg().rb); await pg.keyboard.down('w'); let arc1 = arc0, arcN = 0, arcIn = 1e9, tilt = 0; const tl = q => Math.acos(Math.min(1, 1 - 2 * (q.r[0] * q.r[0] + q.r[2] * q.r[2]))) * 180 / Math.PI;
  for (let i = 0; i < 40; i++) { await pg.waitForTimeout(400); const q = await pg.evaluate(() => ({ rb: CARS.dbg().rb, n: GPH.kerbs('kerbc') })); if (q.rb) arc1 = q.rb; arcN = Math.max(arcN, q.n); arcIn = Math.min(arcIn, rad(arc1)); tilt = Math.max(tilt, tl(arc1)); if (arcIn < ka.r + 1.7 && Math.abs(arc1.sp) < .5) break; } await pg.keyboard.up('w');
  const pole = await pg.evaluate(() => { SHARED.solids.push(...__pole[0]); SHARED.fixed.push(...__pole[1]); return __pole[0].length + __pole[1].length; });
  ok(arcN > 0 && arc0 && rad(arc0) > ka.r + 2.5 && arcIn < ka.r + 1.7 && tilt > 3 && Math.abs(side(arc1)) < .6, 'a corner\'s arc is a slope too: driven at it, the car rolls up onto the pavement, not shoved along it: ' + JSON.stringify({ arcs: arcN, pole, corner: ka, from: arc0 && arc0.p, to: arc1.p, r: +arcIn.toFixed(2), tilt: +tilt.toFixed(1), side: +side(arc1).toFixed(2) }));
  await pg.waitForTimeout(1500); await pg.keyboard.press('f'); await pg.waitForTimeout(1200);
  } else ok(true, 'no corner kerb to drive at (West St is park, no road: owner, 10 Nov 2026)');
  await pg.evaluate(() => VLOOK.set('kart', null)); await until(new Function('return Math.abs(RIDE.kinds.kart.V.S.half[0] / ' + r0.kart + ' - 1) < .01'));
  // the go-kart (owner, 10 Nov 2026: "Throw you out"): E sets it down in front of you and you get in there; a wall at speed throws you out over the front, the kart left where it hit
  await pg.evaluate(() => __dbg.UI.goTo(100, -60, 'up')); await pg.waitForTimeout(3000);
  const g0 = await pg.evaluate(() => { const B = SHARED.BOD; STORE.pos.x = B.XS(100); STORE.pos.z = B.ZS(-60); SHARED.heading = Math.PI / 2; FORAGE.give('kart', 1); WIELD.set('kart'); const x0 = STORE.pos.x, z0 = STORE.pos.z, m = RIDE.mount('kart'); return { m, dx: (STORE.pos.x - x0) / __dbg.cv().TILE, dz: (STORE.pos.z - z0) / __dbg.cv().TILE, n: FORAGE.has('kart') }; });
  ok(g0.m && g0.dx > .5 && Math.abs(g0.dz) < .05, 'E sets the kart down in front of you and you get in there: ' + JSON.stringify(g0));
  await pg.evaluate(() => { const B = SHARED.BOD, x = B.XS(112), z = B.ZS(-60); window.__wall = [x, z - 3, x + 1, z + 3]; SHARED.solids.push(__wall); }); await pg.waitForTimeout(1500);
  await pg.keyboard.down('w'); let g1 = null; for (let i = 0; i < 50; i++) { await pg.waitForTimeout(300); g1 = await pg.evaluate(() => ({ on: RIDE.on, x: STORE.pos.x / __dbg.cv().TILE + SHARED.BOD.OX, top: Math.max(window.__top || 0, window.__top = (PHYSDBG().kart || { sp: 0 }).sp / __dbg.cv().TILE) })); if (!g1.on) break; } await pg.keyboard.up('w');
  await pg.waitForTimeout(2000);
  const g2 = await pg.evaluate(() => { SHARED.solids.splice(SHARED.solids.indexOf(__wall), 1); const k = (BAG.ground || []).filter(g => g.id === 'kart').map(g => +(g.x / __dbg.cv().TILE + SHARED.BOD.OX).toFixed(2)); return { on: RIDE.on, kart: k, x: +(STORE.pos.x / __dbg.cv().TILE + SHARED.BOD.OX).toFixed(2), n: FORAGE.has('kart') }; });
  ok(g1 && !g1.on && g1.top > 4 && g2.kart.length === 1 && g2.kart[0] > 108 && g2.kart[0] < 112 && g2.x > g2.kart[0] && g2.n === g0.n - 1, 'a wall at speed throws you out over the front; the kart stays where it hit, on the ground: ' + JSON.stringify({ g1, g2 }));
  // the convertible (owner, 10 Nov 2026: "make this car drivable by players. you can choose the color of interior, exterior ... 1st person view. you sit in the seats"): boarded where it is parked, painted outside and in from the PAINT window, driven by W from the driver's seat, left parked
  await pg.evaluate(() => SYS.run('world', 'car:c2', [SHARED.BOD.XS(-27.5), SHARED.BOD.ZS(56), 0].join()));   // (last: out on foot there, the park is built) back at its own spot
  const calm = () => pg.waitForFunction(() => { const e = document.getElementById('subfade'); return !e || getComputedStyle(e).display === 'none' || +getComputedStyle(e).opacity < .05; }, null, { timeout: 300000, polling: 500 }).catch(() => {});
  await pg.evaluate(() => __dbg.UI.goTo(-27.5, 50, 'up')); await pg.waitForTimeout(3000); await calm();   // (into the park: it is built first)
  const cv0 = await pg.evaluate(() => __dbg.UI.view); await pg.waitForFunction(() => { if (!CARS.driving) CARS.getIn('c2'); return CARS.driving && CARS.driving.id === 'c2'; }, null, { timeout: 120000, polling: 1000 }).catch(() => {}); await pg.waitForTimeout(1500);   // (once the kart's fall has let you up)
  const col = () => pg.evaluate(() => { const one = m => { const o = m && m.getObjectByName('BODY').children[0], L = o && o.userData.tint; if (!L) return null; const A = o.geometry.attributes.color.array, at = c => { const v = L.cls.indexOf(c); return [A[v * 3], A[v * 3 + 1], A[v * 3 + 2]].map(x => +x.toFixed(3)); }; return { out: at(1), in: at(2) }; };
    return { ride: one(CARS.kinds['convertible-60s'].m), parked: one(CARS.cars.get('c2').mesh), w: ONLINE.world['paint:c2'] || null }; });
  const pc = await pg.evaluate(() => ({ driving: CARS.dbg().driving, ride: RIDE.on, btn: getComputedStyle(document.querySelector('#carhud [data-p]')).display !== 'none' })), q0 = await col();
  await pg.evaluate(() => { for (const q of ['#carhud [data-p]', '#carpaint [data-e="1"]', '#carpaint [data-i="3"]']) document.querySelector(q).click(); }); await pg.waitForTimeout(400); const q1 = await col();
  const lu = c => .2126 * c[0] + .7152 * c[1] + .0722 * c[2];
  ok(pc.driving === 'c2' && pc.ride === 'car:convertible-60s' && pc.btn && q0.ride && q1.w === '1,3' && q1.ride.out[0] > 2 * q1.ride.out[1] && q1.ride.out.join() !== q0.ride.out.join() && lu(q1.ride.in) < lu(q0.ride.in) * .5 && q1.parked && q1.parked.out.join() === q1.ride.out.join(), 'the convertible: in it, PAINT picks the outside (red) and the inside (black), kept in the section\'s world and on the parked car too: ' + JSON.stringify({ pc, q0, q1 }));
  await pg.keyboard.press('v'); await pg.waitForTimeout(800);
  const fp = await pg.evaluate(() => { const m = CARS.kinds['convertible-60s'].m, l = m.worldToLocal(SHARED.cam.position.clone()), D = CARS.data().cars['convertible-60s'], f = SHARED.cam.getWorldDirection(SHARED.cam.position.clone()), fl = m.worldToLocal(f.add(SHARED.cam.position)).sub(l).normalize();
    return { view: __dbg.UI.view, me: W3.group.visible, at: [l.x, l.y, l.z].map(v => +v.toFixed(2)), fwd: +fl.z.toFixed(2), seat: D.seat, cab: [D.size[0] / 2, D.wheels[0][2], D.wheels[2][2]] }; });
  ok(fp.view === 'first' && !fp.me && fp.at[0] > .2 && fp.at[0] < .7 && fp.at[1] > fp.seat[1] + .3 && fp.at[1] < fp.seat[1] + .9 && fp.at[2] > fp.cab[2] && fp.at[2] < fp.cab[1] && fp.fwd > .9, 'V gives first person from the driver\'s (left) seat: the eye inside the cabin at seat height, looking down the road, your own body not drawn: ' + JSON.stringify(fp));
  const z0 = await pg.evaluate(() => __dbg.pos()[2] / __dbg.cv().TILE); await pg.keyboard.down('w'); let cvTop = 0;
  for (let i = 0; i < 20; i++) { await pg.waitForTimeout(500); const q = await pg.evaluate(() => ({ ...CARS.dbg(), z: __dbg.pos()[2] / __dbg.cv().TILE })); cvTop = Math.max(cvTop, q.v); if (Math.abs(q.z - z0) > 2) break; } await pg.keyboard.up('w');
  const z1 = await pg.evaluate(() => __dbg.pos()[2] / __dbg.cv().TILE), fv = await pg.evaluate(() => __dbg.UI.view);
  ok(Math.abs(z1 - z0) > 1 && cvTop > 1 && fv === 'first', 'W drives the convertible from the driver\'s seat: ' + JSON.stringify({ moved: +(z1 - z0).toFixed(1), top: cvTop, view: fv }));
  await pg.waitForTimeout(2500); await pg.keyboard.press('f'); await pg.waitForTimeout(1200);
  const cp0 = await pg.evaluate(() => ({ driving: CARS.dbg().driving, ride: RIDE.on, c: CARS.dbg().cars[1], view: __dbg.UI.view, pp: document.getElementById('carpaint').style.display })); await pg.waitForTimeout(1500); const cp1 = await pg.evaluate(() => CARS.dbg().cars[1]);
  ok(!cp0.driving && !cp0.ride && cp0.c.shown && Math.hypot(cp0.c.x + 27.5, cp0.c.z - 56) > 1 && cp1.x === cp0.c.x && cp1.z === cp0.c.z && cp0.view === cv0 && cp0.pp === 'none', 'F gets you out of the convertible; it stays parked where it stopped, the view the one you had: ' + JSON.stringify({ cp0, cp1 }));
  ok(!errs.length, 'no page errors' + (errs.length ? ': ' + errs.slice(0, 3).join(' | ') : ''));
  await b.close(); console.log(fails.length ? fails.length + ' failed' : 'all car checks passed'); process.exit(fails.length ? 1 : 0);
})();
