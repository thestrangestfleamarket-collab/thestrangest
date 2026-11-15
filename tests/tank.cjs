// THE TANK CHECK: node tests/tank.cjs [dist/tank.html] [folder for screenshots]. HULL DOWN loads its models, pictures and sounds and starts on its menu, a battle starts inside the dark turret with the platoon's two tanks out, the hatch opens and the eyes adjust, the tank drives over the land, a wave comes, the laser gives the range and a SABOT laid by the fire control kills a tank, the loader brings up the HEAT asked for, zoom, thermal and smoke work, a tank's shell costs armour and breaks a track, four waves cleared hold the sector, armour gone ends the battle; then an emulated Quest 3 enters VR, lays the gun with the stick, lases and fires with the triggers; no page errors.
const { chromium } = require('playwright'), path = require('path'), fs = require('fs');
const fails = [], ok = (c, m) => { if (!c) { fails.push(m); console.log((process.env.GITHUB_ACTIONS ? '::error title=tank::' : 'FAIL ') + m); } else console.log('ok   ' + m); };
const PAGE = path.resolve(process.argv[2] || 'dist/tank.html'), ROOT = path.dirname(PAGE), OUT = process.argv[3]; if (OUT) fs.mkdirSync(OUT, { recursive: true });
const srv = require('http').createServer((q, r) => { const f = path.join(ROOT, decodeURIComponent(q.url.split('?')[0])); if (!f.startsWith(ROOT)) { r.writeHead(403); return r.end(); }
  fs.readFile(f, (e, d) => { if (e) { r.writeHead(404); return r.end(); } r.writeHead(200, f.endsWith('.html') ? { 'content-type': 'text/html' } : {}); r.end(d); }); });
(async () => {
  await new Promise(res => srv.listen(0, '127.0.0.1', res)); const FILE = 'http://127.0.0.1:' + srv.address().port + '/' + path.basename(PAGE);
  const b = await chromium.launch({ ...(process.env.PWCHROME ? { executablePath: process.env.PWCHROME } : {}), args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const errs = [], watch = pg => { pg.on('pageerror', e => errs.push(e.message.slice(0, 300))); pg.on('console', m => { if (m.type() === 'error' && !/Failed to load resource|WebSocket/.test(m.text())) errs.push('console: ' + m.text().slice(0, 300)); }); pg.route(/fonts\.(googleapis|gstatic)\.com/, r => r.abort()); };
  // the game's own seconds, not the clock's: software rendering is slow and the game clamps its step
  const secs = (pg, n) => pg.evaluate(n => new Promise(r => { const t = game.time + n, iv = setInterval(() => { if (game.time >= t) { clearInterval(iv); r(); } }, 10); }), n);
  const till = (pg, f, a) => pg.waitForFunction(f, a, { timeout: 240000 }).catch(() => {});
  const shot = async (pg, n) => { if (OUT) await pg.screenshot({ path: path.join(OUT, n + '.png') }); };
  // a tank stood still d metres ahead of the gun where the land lets each see the other, and the sight laid on it (the gun is laid from the hull, which leans with the land)
  const stand = (pg, i, d) => pg.evaluate(([i, d]) => { const P = game.P, e = game.foes[i]; let a = P.yaw + P.tyaw;
    for (let k = 0; k < 60; k++, a += .21) { e.x = P.x - Math.sin(a) * d; e.z = P.z - Math.cos(a) * d; e.y = game.hAt(e.x, e.z); if (game.los(e.x, e.y + 2, e.z, P.x, P.y + .75, P.z) < 0 && game.los(e.x, e.y + .6, e.z, P.x, P.y + 2.3, P.z) < 0) break; }
    e.dx = e.x; e.dz = e.z; e.state = 'hold'; e.fireT = 1e9; e.yaw = Math.atan2(-(P.x - e.x), -(P.z - e.z)); e.tyaw = 0;
    game.tank.updateWorldMatrix(true, false); const l = game.tank.worldToLocal(new P.n.constructor(e.x, e.y + 1.3, e.z));
    P.aimYaw = P.yaw + Math.atan2(-l.x, -l.z); P.aimPitch = Math.atan2(l.y - 2.02, Math.hypot(l.x, l.z)); }, [i, d]);
  const laid = pg => till(pg, () => { const P = game.P, w = a => Math.atan2(Math.sin(a), Math.cos(a)); return Math.abs(w(P.aimYaw - P.yaw - P.tyaw)) < .002 && Math.abs(P.elev - P.aimPitch) < .002 && Math.abs(P.v) < .05; });
  const alone = pg => pg.evaluate(() => { for (const f of game.friends) { f.fireT = 1e9; f.x = 5000; } });   // the platoon kept out of it, so the count is the test's own

  const pg = await b.newPage({ viewport: { width: 480, height: 270 } }); watch(pg);
  const t0 = Date.now(); await pg.goto(FILE); await pg.waitForFunction(() => window.game && game.time > .2, null, { timeout: 600000 }).catch(() => {});
  const up = await pg.evaluate(() => !!window.game && game.state === 'preview' && !document.getElementById('overlay').hidden); ok(up, 'its models, pictures and sounds load and the page starts on its menu over the land (' + ((Date.now() - t0) / 1000).toFixed(0) + ' s)');
  if (!up) { console.log(await pg.evaluate(() => document.getElementById('loading').textContent), errs.join(' | ')); await b.close(); srv.close(); process.exit(1); }
  await shot(pg, '01-menu');
  await pg.evaluate(() => { document.getElementById('levelToggle').checked = false; }); await pg.click('#flatBtn', { timeout: 300000 }); await secs(pg, .5);
  let s = await pg.evaluate(() => ({ st: game.state, a: game.P.armour, r: game.P.rounds, h: game.P.hatch, e: game.expo, f: game.friends.length, fh: game.friends.every(f => f.hp === 3), ld: game.P.loaded, ins: game.inside.visible }));
  ok(s.st === 'play' && s.a === 100 && s.r === 40 && s.h === 0 && s.ins && s.ld === 'S', 'PLAY IN BROWSER starts a battle inside the turret, hatch shut, a SABOT in the breech'); ok(s.f === 2 && s.fh, 'two tanks of your platoon are out with you');
  await shot(pg, '02-inside'); await alone(pg);
  await pg.keyboard.press('KeyH'); await till(pg, () => game.P.hatch >= 1); await secs(pg, 3);
  const e1 = await pg.evaluate(() => game.expo); ok(e1 < s.e - .25 && !(await pg.evaluate(() => game.inside.visible)), 'H opens the hatch, you rise out and your eyes adjust to the daylight (' + s.e.toFixed(2) + ' to ' + e1.toFixed(2) + ')'); await shot(pg, '03-hatch');
  await pg.keyboard.down('KeyW'); await pg.keyboard.down('KeyA'); await secs(pg, 3); await pg.keyboard.up('KeyW'); await pg.keyboard.up('KeyA');
  s = await pg.evaluate(() => ({ d: Math.hypot(game.P.x, game.P.z), yaw: game.P.yaw, dy: Math.abs(game.P.y - game.hAt(game.P.x, game.P.z)) })); ok(s.d > 6 && s.yaw > .3 && s.dy < .6, 'W and A drive and steer it, on the ground (' + s.d.toFixed(0) + ' m)');
  await secs(pg, 2); await pg.evaluate(() => game.skip()); await till(pg, () => game.foes.length > 0);
  ok(await pg.evaluate(() => game.foes.length === game.WAVES[0] && game.live() === game.WAVES[0] && game.foes.every(e => Math.hypot(e.x - game.P.x, e.z - game.P.z) > 400)), 'the first wave comes in from far off');
  await pg.keyboard.press('KeyH'); await till(pg, () => game.P.hatch === 0); await stand(pg, 0, 220); await pg.evaluate(() => { game.foes[1].fireT = 1e9; game.foes[1].state = 'hold'; });
  await laid(pg); await secs(pg, 1.5); await stand(pg, 0, 220); await laid(pg); await secs(pg, .5);
  await pg.keyboard.press('KeyF'); await secs(pg, .3); ok(await pg.evaluate(() => !document.getElementById('scope').hidden), 'F looks through the gunsight');
  await pg.keyboard.press('KeyR'); s = await pg.evaluate(() => game.P.range); ok(Math.abs(s - 218) < 9, 'R lases the tank: ' + Math.round(s) + ' m'); await shot(pg, '04-sight');
  await pg.keyboard.press('KeyZ'); await pg.keyboard.press('KeyT'); await secs(pg, .3); ok(await pg.evaluate(() => game.P.zoom === 1 && game.P.thermal === true), 'Z zooms the sight and T is its thermal picture'); await shot(pg, '04b-thermal'); await pg.keyboard.press('KeyZ'); await pg.keyboard.press('KeyT');
  await pg.keyboard.press('Digit2'); await pg.keyboard.press('Space'); await till(pg, () => game.P.kills >= 1 || game.P.reload === 0); await secs(pg, .4); await shot(pg, '05-kill');
  s = await pg.evaluate(() => ({ r: game.P.rounds, S: game.P.ammo.S, k: game.P.kills, dead: game.foes[0].state === 'dead', live: game.live() })); ok(s.r === 39 && s.S === 21 && s.k === 1 && s.dead && s.live === 1, 'Space fires the SABOT the fire control laid; it kills the tank at 220 m');
  ok(await pg.evaluate(() => game.fire()) === false, 'the gun will not fire while it is loading'); await till(pg, () => game.P.reload === 0);
  ok(await pg.evaluate(() => game.P.loaded) === 'H', '2 asked for HEAT and the loader brings it up next');
  await pg.keyboard.press('KeyF'); await pg.keyboard.press('KeyG'); ok(await pg.evaluate(() => game.P.smoke === 1 && game.P.smokeT > game.time), 'G fires the smoke dischargers'); await pg.evaluate(() => { game.P.smokeT = -99; });
  await stand(pg, 1, 160);
  await pg.evaluate(() => { const e = game.foes[1]; e.shots = 1; e.fireT = 0; window.__r = Math.random; Math.random = () => 0; }); await till(pg, () => game.P.armour < 100); await pg.evaluate(() => { Math.random = window.__r; });
  s = await pg.evaluate(() => ({ a: game.P.armour, c: game.cover, st: game.state, t: game.P.dmg.tracks })); ok(s.a === 78 && s.st === 'play', 'a tank that can see you fires and its hit costs armour (' + s.a + '%)');
  ok(s.c === 'EXPOSED', 'the panel says the hull is showing'); await shot(pg, '06-hit');
  await pg.evaluate(() => { game.foes[1].fireT = 1e9; }); await pg.keyboard.down('KeyW'); await secs(pg, 1); const v = await pg.evaluate(() => game.P.v); await pg.keyboard.up('KeyW'); ok(s.t > 0 && Math.abs(v) < .05, 'the hit broke a track: the tank cannot move while the crew mend it');
  await pg.evaluate(() => { const P = game.P, e = game.foes[1]; for (let k = 0; k < 4000; k++) { const a = k * .37, d = 150 + k % 400; e.x = e.dx = P.x + Math.sin(a) * d; e.z = e.dz = P.z + Math.cos(a) * d; if (game.los(e.x, game.hAt(e.x, e.z) + 2, e.z, P.x, P.y + 2.3, P.z) >= 0) break; } }); await secs(pg, .5);
  ok(await pg.evaluate(() => game.cover) === 'IN DEFILADE', 'out of its sight the panel says so');
  for (let w = 1; w <= 4; w++) { await pg.evaluate(() => { for (const e of game.foes) if (e.state !== 'dead') game.kill(e); game.skip(); }); await secs(pg, .3); if (w < 4) { await till(pg, w => game.wave === w + 1 && game.live() > 0, w); await pg.evaluate(() => game.foes.forEach(e => { e.fireT = 1e9; })); } }
  await till(pg, () => game.state === 'over');
  s = await pg.evaluate(() => ({ st: game.state, k: game.P.kills, n: game.foes.length, m: document.querySelector('#msg p').textContent })); ok(s.st === 'over' && s.k === 14 && /Sector held/.test(s.m), 'four waves cleared: ' + s.m); await shot(pg, '07-held');
  await pg.keyboard.press('Space'); await secs(pg, .3);
  ok(await pg.evaluate(() => game.state === 'play' && game.P.kills === 0 && game.foes.length === 0 && game.P.armour === 100 && game.P.ammo.S === 22), 'firing starts a fresh battle'); await alone(pg);
  await pg.evaluate(() => game.skip()); await till(pg, () => game.foes.length > 0); await stand(pg, 0, 160);
  await pg.evaluate(() => { const e = game.foes[0]; game.P.armour = 5; e.shots = 1; e.fireT = 0; e.tyaw = 0; Math.random = () => 0; }); await till(pg, () => game.state !== 'play'); await pg.evaluate(() => { Math.random = window.__r; }); await till(pg, () => game.state === 'over');
  ok(await pg.evaluate(() => game.state === 'over' && /Knocked out/.test(document.querySelector('#msg p').textContent)), 'armour gone, the tank is knocked out and the battle ends');
  // on foot: a crewman close by, a grenade for him, a mine for a tank
  await till(pg, () => game.state === 'over'); await pg.keyboard.press('Space'); await secs(pg, .3); await alone(pg); await pg.evaluate(() => game.skip()); await till(pg, () => game.foes.length > 0); await pg.evaluate(() => game.foes.forEach(e => { e.fireT = 1e9; e.state = 'hold'; e.dx = e.x; e.dz = e.z; }));
  await pg.keyboard.press('KeyH'); await till(pg, () => game.P.hatch >= 1 && !game.P.headIn); await secs(pg, .3);
  await pg.evaluate(() => { const P = game.P, a = P.yaw + P.tyaw; game.addCrew(P.x - Math.sin(a) * 19, P.z - Math.cos(a) * 19).fireT = 1e9; });
  await pg.keyboard.press('Digit4'); ok(await pg.evaluate(() => game.P.item) === 'grenade', 'head out, 4 takes a grenade in your hand'); await pg.keyboard.press('Space'); await till(pg, () => game.crews[0].state === 'dead');
  ok(await pg.evaluate(() => game.crews[0].state === 'dead' && game.INV.grenade === 3), 'thrown at a crewman on foot, it kills him');
  await pg.keyboard.press('Digit5'); await pg.keyboard.press('Space'); s = await pg.evaluate(() => ({ n: game.mines.length, left: game.INV.mine })); ok(s.n === 1 && s.left === 2, '5 lays a mine on the ground ahead');
  await pg.evaluate(() => { const m = game.mines[0], e = game.foes[0]; e.x = e.dx = m.x; e.z = e.dz = m.z; }); await till(pg, () => game.foes[0].state === 'dead'); ok(await pg.evaluate(() => game.foes[0].state === 'dead' && game.mines.length === 0), 'a tank that runs on to it is knocked out');
  await pg.keyboard.press('KeyB'); ok(await pg.evaluate(() => game.P.item === 'bino' && !document.getElementById('bino').hidden), 'B raises the binoculars'); await pg.keyboard.press('KeyB');
  await pg.close();

  // the three tanks, and one against one: two pages in the one lobby
  const ctx = await b.newContext({ viewport: { width: 256, height: 144 } }), page2 = async q => { const p = await ctx.newPage(); watch(p); await p.goto(FILE + q); await p.waitForFunction(() => window.game && game.time > .2, null, { timeout: 600000 }).catch(() => {}); return p; };
  const A = await page2('?local&slot=0'); await A.click('[data-tank="hunter"]'); await A.click('#flatBtn', { timeout: 300000 }); await secs(A, .3);
  ok(await A.evaluate(() => game.type === 'hunter' && game.P.rounds === 20 && game.friends.length === 2), 'the ARCHER chosen on the menu goes out with its own load (20 rounds)');
  const B = await page2('?local&slot=1'); await B.click('[data-tank="light"]'); await B.click('#flatBtn', { timeout: 300000 }); await secs(B, .5); await secs(A, .5);
  s = await A.evaluate(() => ({ peer: !!game.NET.peer, f: game.friends.length, foes: game.foes.length, rem: game.rem.on, d: Math.hypot(game.rem.x - game.P.x, game.rem.z - game.P.z), m: document.querySelector('#msg p').textContent }));
  ok(s.peer && s.f === 0 && s.foes === 0 && s.rem && s.d > 300 && /Another player has joined/.test(s.m), 'a second player in: "' + s.m + '", the waves and the platoon go, the other tank stands ' + Math.round(s.d) + ' m off');
  ok(await B.evaluate(() => !!game.NET.peer && game.NET.slot === 1 && game.rem.on && game.type === 'light'), 'the second player is in the same fight, in a SCIMITAR');
  await B.evaluate(() => new BroadcastChannel('tank-local').postMessage({ from: 'zz', m: { t: 'hit', d: 30 } })); await secs(A, .3); ok(await A.evaluate(() => game.P.armour) < 100, 'a hit the other player scores costs your armour');
  await B.evaluate(() => dispatchEvent(new Event('pagehide'))); await B.close(); await secs(A, .4); ok(await A.evaluate(() => !game.NET.peer && /has left/.test(document.querySelector('#msg p').textContent)), 'when they leave you are back to the waves'); await ctx.close();

  const vr = await b.newPage({ viewport: { width: 320, height: 180 } }); watch(vr);
  await vr.addInitScript(fs.readFileSync(require.resolve('iwer/build/iwer.js'), 'utf8') + ';window.__xrd=new IWER.XRDevice(IWER.metaQuest3);window.__xrd.installRuntime({forceInstall:true});window.__xrd.position.set(0.3,1.2,0.2);');
  await vr.goto(FILE); await vr.waitForFunction(() => window.game && game.time > .2, null, { timeout: 600000 }).catch(() => {}); await till(vr, () => !document.getElementById('vrBtn').disabled); await vr.click('#vrBtn', { timeout: 300000 });
  await till(vr, () => game.renderer.xr.isPresenting); ok(await vr.evaluate(() => game.renderer.xr.isPresenting && game.xr && game.state === 'play'), 'ENTER VR starts the headset session and the battle');
  await secs(vr, 1.5);
  s = await vr.evaluate(() => { game.rig.parent.updateWorldMatrix(true, true); const h = game.camera.getWorldPosition(new game.P.n.constructor()), l = game.rig.parent.worldToLocal(h.clone()); return { x: l.x, y: l.y, z: l.z, roof: game.ROOF, floor: game.FLOOR, ins: game.inside.visible }; });
  ok(Math.abs(s.x - .62) < .05 && Math.abs(s.z - .55) < .05 && s.y > s.floor + .9 && s.y < s.roof && s.ins, 'your head is centred on the gunner’s seat inside the turret (' + s.x.toFixed(2) + ', ' + (s.y - s.floor).toFixed(2) + ' m over its floor, ' + s.z.toFixed(2) + ')');
  await vr.evaluate(() => __xrd.controllers.right.updateAxes('thumbstick', 1, -1)); await secs(vr, 1.2); await vr.evaluate(() => __xrd.controllers.right.updateAxes('thumbstick', 0, 0));
  s = await vr.evaluate(() => ({ t: game.P.tyaw, e: game.P.elev })); ok(s.t < -.3 && s.e > .1, 'the right stick turns the turret and raises the gun');
  await vr.evaluate(() => __xrd.controllers.left.updateAxes('thumbstick', 0, -1)); await secs(vr, 2); await vr.evaluate(() => __xrd.controllers.left.updateAxes('thumbstick', 0, 0));
  ok(await vr.evaluate(() => game.P.v > 2), 'the left stick drives');
  await vr.evaluate(() => __xrd.controllers.right.updateButtonValue('trigger', 1)); await secs(vr, .2); await vr.evaluate(() => __xrd.controllers.right.updateButtonValue('trigger', 0));
  ok(await vr.evaluate(() => game.P.rounds === 39 && game.shells.length + game.P.shots >= 1), 'the right trigger fires the gun');
  await vr.evaluate(() => { game.P.aimPitch = 0; game.P.elev = -.1; __xrd.controllers.right.updateButtonValue('squeeze', 1); }); await secs(vr, .2); await vr.evaluate(() => __xrd.controllers.right.updateButtonValue('squeeze', 0));
  ok(await vr.evaluate(() => game.time - game.P.lased < 2 || /No return/.test(document.querySelector('#msg p').textContent)), 'the right grip lases (' + (await vr.evaluate(() => game.time - game.P.lased < 2 ? Math.round(game.P.range) + ' m' : 'no return off the sky')) + ')');
  await vr.evaluate(() => __xrd.controllers.right.updateButtonValue('b-button', 1)); await secs(vr, .2); await vr.evaluate(() => __xrd.controllers.right.updateButtonValue('b-button', 0)); ok(await vr.evaluate(() => game.P.zoom === 1), 'B zooms the sight');
  ok(await vr.evaluate(() => game.hands.left.root.visible && game.hands.right.root.visible && game.hands.right.root.position.distanceTo(game.camera.position) < 1.2), 'your gloved hands and sleeved arms follow the controllers');
  await vr.evaluate(() => __xrd.controllers.right.updateButtonValue('a-button', 1)); await secs(vr, .2); await vr.evaluate(() => __xrd.controllers.right.updateButtonValue('a-button', 0)); await till(vr, () => game.P.hatch >= 1);
  s = await vr.evaluate(() => { game.rig.parent.updateWorldMatrix(true, true); return game.rig.parent.worldToLocal(game.camera.getWorldPosition(new game.P.n.constructor())).y - game.ROOF; }); ok(s > .3 && !(await vr.evaluate(() => game.inside.visible)), 'A opens the hatch and lifts your head out of it (' + s.toFixed(2) + ' m over the roof)');
  await shot(vr, '08-vr');
  ok(errs.length === 0, 'no page errors' + (errs.length ? ': ' + errs.join(' | ') : ''));
  await b.close(); srv.close(); if (fails.length) { console.log(fails.length + ' failed'); process.exit(1); } console.log('all ok');
})();
