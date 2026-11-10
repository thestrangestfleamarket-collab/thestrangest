// THE CARS CHECK: node tests/cars.cjs dist/market.html. The six parked cars on Market St; get in one and W drives it on Rapier's wheels; F gets out and it stays parked where it stopped; a resized car drives at its size; the kerb is rolled over; the go-kart is set down in front of you and throws you out at a wall; a car someone else drives (as the section's server says) is not drawn parked and cannot be taken, and shows where they park it. No page errors.
const { chromium } = require('playwright'), path = require('path');
const fails = [], ok = (c, m) => { if (!c) { fails.push(m); console.log((process.env.GITHUB_ACTIONS ? '::error title=cars::' : 'FAIL ') + m); } else console.log('ok   ' + m); };
(async () => {
  const b = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const pg = await b.newPage({ viewport: { width: 960, height: 540 } }), errs = [];
  pg.on('pageerror', e => errs.push(e.message.slice(0, 300))); pg.on('console', m => { if (m.type() === 'warning' && /^SYS |CARS/.test(m.text())) errs.push(m.text().slice(0, 300)); });
  await pg.goto('file://' + path.resolve(process.argv[2] || 'dist/market.html') + '?fresh=1&hour=13&physics=1', { waitUntil: 'commit' });
  await pg.waitForFunction(() => window.__started && window.CARS && CARS.dbg().loaded, null, { timeout: 400000, polling: 500 });
  const d0 = await pg.evaluate(() => CARS.dbg());
  ok(d0.cars.length === 6 && d0.cars.every(c => c.shown && c.z < -60 && c.z > -72), 'six cars parked along Market St\'s kerb: ' + JSON.stringify(d0.cars.map(c => [c.id, c.model, c.x, c.z])));
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
  ok(kn > 0 && k0 && k1.p[2] < -69.5 && k1.p[1] - k0.p[1] > .15, 'the kerb is a slope to the physics: the car rolls up onto the pavement, not shoved along it: ' + JSON.stringify({ kerbs: kn, from: k0 && k0.p, to: k1.p }));
  await pg.waitForTimeout(1500); await pg.keyboard.press('f'); await pg.waitForTimeout(1200); const r3 = await half();
  ok(near(r2.h, r0.h * 1.3) && r2.next && near(r3.h, r0.h) && !r3.next, 'a resize while it is driven waits for the next boarding: ' + JSON.stringify({ driving: r2, out: r3 }));
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
  ok(!errs.length, 'no page errors' + (errs.length ? ': ' + errs.slice(0, 3).join(' | ') : ''));
  await b.close(); console.log(fails.length ? fails.length + ' failed' : 'all car checks passed'); process.exit(fails.length ? 1 : 0);
})();
