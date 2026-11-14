// THE SNIPER CHECK: node tests/sniper.cjs [dist/sniper.html] [folder for screenshots]. COLD BORE loads with its skies, surfaces and models (dist/sniper-assets/), the scope draws its picture, rounds drop and drift as the card says, the range is qualified, each contract is won by its target and lost by a bystander, the counter-sniper shoots back; then in an emulated Quest 3 the rifle is taken from the sandbags on its bipod, fired, its bolt worked and its magazine changed by hand, the board pressed with a pointed controller; no page errors.
const { chromium } = require('playwright'), path = require('path'), fs = require('fs');
const fails = [], ok = (c, m) => { if (!c) { fails.push(m); console.log((process.env.GITHUB_ACTIONS ? '::error title=sniper::' : 'FAIL ') + m); } else console.log('ok   ' + m); };
const PAGE = path.resolve(process.argv[2] || 'dist/sniper.html'), ROOT = path.dirname(PAGE), OUT = process.argv[3]; if (OUT) fs.mkdirSync(OUT, { recursive: true });
const srv = require('http').createServer((q, r) => { const f = path.join(ROOT, decodeURIComponent(q.url.split('?')[0])); if (!f.startsWith(ROOT)) { r.writeHead(403); return r.end(); }
  fs.readFile(f, (e, d) => { if (e) { r.writeHead(404); return r.end(); } r.writeHead(200, { 'content-type': { jpg: 'image/jpeg', glb: 'model/gltf-binary', json: 'application/json', mp3: 'audio/mpeg' }[f.split('.').pop()] || 'text/html' }); r.end(d); }); });
(async () => {
  await new Promise(res => srv.listen(0, '127.0.0.1', res)); const FILE = 'http://127.0.0.1:' + srv.address().port + '/' + path.basename(PAGE) + '?q=0';
  const exe = process.env.PWCHROME || (fs.existsSync('/opt/pw-browsers/chromium') ? '/opt/pw-browsers/chromium' : null);
  const b = await chromium.launch({ ...(exe ? { executablePath: exe } : {}), args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const errs = [], watch = pg => { pg.on('pageerror', e => errs.push(e.message.slice(0, 300))); pg.on('console', m => { if (m.type() === 'error') errs.push('console: ' + m.text().slice(0, 300)); }); };
  // frames, not seconds: software rendering is slow and the game clamps its step
  const frames = (pg, n) => pg.evaluate(n => new Promise(r => { let c = 0, l = game.time; const iv = setInterval(() => { if (game.time !== l) { l = game.time; c++; } if (c >= n) { clearInterval(iv); r(); } }, 5); }), n);
  const until = (pg, f, a, ms = 240000) => pg.waitForFunction(f, a, { timeout: ms }).then(() => true).catch(() => false);
  const snap = async (pg, n) => { if (OUT) await pg.screenshot({ path: path.join(OUT, n + '.png') }); };

  const pg = await b.newPage({ viewport: { width: 480, height: 270 } }); pg.setDefaultTimeout(240000); watch(pg);
  const t0 = Date.now(); await pg.goto(FILE); const up = await until(pg, () => window.game && game.time > 0.05 && game.mission && game.up);
  ok(up, 'the page starts with the range built behind its menu (' + ((Date.now() - t0) / 1000).toFixed(0) + ' s)'); if (!up) { console.log(errs.join(' | ')); await b.close(); srv.close(); process.exit(1); }
  await snap(pg, '01-menu'); await pg.click('#desktop'); await frames(pg, 3);
  ok(await pg.evaluate(() => game.board.screen === 'missions' && game.board.buttons.length >= 5), 'PLAY ON THIS SCREEN shows the board with five contracts'); await snap(pg, '02-board');
  await pg.evaluate(() => { window.V3 = game.rig.position.constructor; window.calm = (w) => { game.mission.def = { ...game.mission.def, wind: w }; }; });
  // a contract live, the rifle held steady, the eye at the scope
  const go = async (i) => { await pg.evaluate(async (i) => { await game.setup(i); game.begin(); game.steady = true; game.I.ads = true; }, i); await frames(pg, 4); };
  const send = async (f, a) => { await pg.evaluate(f, a); await pg.evaluate(() => { game.I.fire = true; }); await frames(pg, 2); return until(pg, () => (game.bullets.length === 0 && game.rifle.ready()) || game.state !== 'live' || (game.bullets.length === 0 && !game.rifle.chambered && game.rifle.b === 0 && game.rifle.boltAnim < 0)); };
  const plate = (d) => send((d) => game.aimAt(game.world.site.plates.find(p => p.d === d).pos), d), st = () => pg.evaluate(() => ({ state: game.state, text: game.board.data.text, win: game.board.data.win, stars: game.board.data.stars, shots: game.shots, log: game.board.log.slice(-1)[0] || '' }));

  await go(0); await frames(pg, 6);
  ok(await pg.evaluate(() => game.state === 'live' && game.rifle.scoped && game.rifle.lensMat.uniforms.on.value === 1), 'BEGIN makes the contract live, and the scope draws its picture with the eye behind it'); await snap(pg, '03-scope');
  // the card against the flight: still air, 500 m
  let s = await pg.evaluate(() => { calm({ from: 90, speed: 0, gust: 0 }); game.wind.set(0, 0, 0); const g = game, R = g.rifle, p = g.world.site.plates.find(p => p.d === 500), t = R.table.find(r => r.R === 500); g.aimAt(p.pos); R.g.updateMatrixWorld(true);
    const up = () => { const c = R.cam.getWorldPosition(new V3()), los = p.pos.clone().sub(c).normalize(), f = new V3(0, 0, -1).transformDirection(R.g.matrixWorld); return (Math.asin(f.y) - Math.asin(los.y)) * 1000; }, a = up(); R.dial(R.solution(500), 0); g.aimAt(p.pos); R.g.updateMatrixWorld(true); return { card: t.el, tof: t.t, wind: t.wind, held: a, dialled: up(), el: R.elev }; });
  ok(s.card > 2.2 && s.card < 2.9 && s.tof > 0.55 && s.tof < 0.75 && Math.abs(s.held - s.card) < 0.25, 'the card says 500 m needs ' + s.card.toFixed(2) + ' mil up; a round that lands there leaves ' + s.held.toFixed(2) + ' mil above the crosshair');
  ok(Math.abs(s.dialled) < 0.2 && Math.abs(s.el - s.card) < 0.06, 'with that dialled on the turret the crosshair sits on the plate (' + s.dialled.toFixed(2) + ' mil off)');
  await pg.evaluate(() => { game.I.fire = true; }); await frames(pg, 2); await until(pg, () => game.bullets.length === 0 && game.rifle.ready());
  ok(await pg.evaluate(() => game.world.site.plates.find(p => p.d === 500).hits === 1), 'fired so, the round rings the 500 m plate');
  // the same aim in a 5 m/s wind from the left: the round lands right by about what the card says
  await pg.evaluate(() => { game.aimAt(game.world.site.plates.find(p => p.d === 500).pos); calm({ from: 270, speed: 5, gust: 0 }); game.windDir.set(1, 0, 0); }); await frames(pg, 2); await pg.evaluate(() => { game.I.fire = true; }); await frames(pg, 2); await until(pg, () => game.bullets.length === 0 && game.rifle.ready());
  s = await st(); const m = /right (\d+\.\d)/.exec(s.log), exp = 5 * (await pg.evaluate(() => game.rifle.table.find(r => r.R === 500).wind));
  ok(m && Math.abs(+m[1] - exp) < 0.35, 'a 5 m/s crosswind carries it off the plate and the spotter calls it: "' + s.log + '" (the card: ' + exp.toFixed(2) + ' mil)');
  // the rangefinder
  s = await pg.evaluate(() => { calm({ from: 90, speed: 0, gust: 0 }); game.wind.set(0, 0, 0); const R = game.rifle; R.dial(-R.elev, 0); const p = game.world.site.plates.find(p => p.d === 300); for (let i = 0; i < 4; i++) { R.desk(0, game.camera, game.aim, {}); R.g.updateMatrixWorld(true); const c = R.cam.getWorldPosition(new V3()), d = p.pos.clone().sub(c).applyQuaternion(game.rig.quaternion.clone().invert()); game.aim.pitch = Math.atan2(d.y, Math.hypot(d.x, d.z)); game.aim.yaw = Math.atan2(-d.x, -d.z); } return 0; });
  await frames(pg, 3); s = await pg.evaluate(() => { game.lase(); return game.rifle.lased; }); ok(Math.abs(s - 300) < 4, 'the laser reads the 300 m plate at ' + s.toFixed(0) + ' m');
  // five rounds, then the magazine
  await go(0); for (let i = 0; i < 5; i++) await plate(100);
  s = await pg.evaluate(() => ({ r: game.rifle.rounds, ch: game.rifle.chambered, hits: game.world.site.plates[0].hits })); ok(s.r === 0 && !s.ch && s.hits >= 4, 'five rounds at the 100 m plate empty the rifle (' + s.hits + ' rang it)');
  await pg.evaluate(() => { game.I.fire = true; }); await frames(pg, 2); ok(await pg.evaluate(() => game.shots === 5), 'an empty chamber only clicks');
  await pg.evaluate(() => { game.I.reload = true; }); await until(pg, () => game.rifle.ready()); s = await pg.evaluate(() => game.rifle.rounds); ok(s === 4, 'R changes the magazine and the bolt feeds a round (4 left in it)');
  // qualify
  await go(0); for (const d of [100, 300, 500, 800]) await plate(d); s = await st();
  ok(s.state === 'debrief' && s.win && s.stars === 3 && s.shots === 4, 'ZERO DAY: steel at 100, 300, 500 and 800 m in four rounds is three stars'); await snap(pg, '04-debrief');
  ok(await pg.evaluate(() => JSON.parse(localStorage.getItem('coldbore')).save.done.zero.stars === 3), 'the result is kept');
  // PAPER TRAIL
  const chest = () => send(() => game.aimAt(game.mission.focus()[0]));
  await go(1); await snap(pg, '05-plaza'); await chest(); s = await st(); ok(s.state === 'debrief' && s.win && /Dahl/.test(s.text), 'PAPER TRAIL: a round through Dahl by his car wins it');
  await go(1); await send(() => { const p = game.crowd.list.find(p => p.role === 'civ' && p.curPose === 'sit'); game.aimAt(game.crowd.chest(p, new V3())); }); s = await st(); ok(s.state === 'debrief' && !s.win && /bystander/.test(s.text), 'a bystander shot loses it');
  await go(1); await send(() => { const P = game.world.site.plaza; game.aimAt(new V3(P.x - 3, 0.3, P.z + 14)); }); await frames(pg, 30);
  s = await pg.evaluate(() => ({ t: game.mission.target.alert, run: game.crowd.list.filter(p => p.role === 'civ' && p.alert).length, log: game.board.log.join(' ') })); ok(s.t && s.run > 5 && /Miss/.test(s.log), 'a round into the paving sends the plaza running, Dahl for his car (' + s.run + ' fled)');
  // DEAD AIR
  await go(2); await pg.evaluate(() => { game.I.zoom = 9; }); await frames(pg, 3); await snap(pg, '06-terrace'); await chest(); s = await st(); ok(s.state === 'debrief' && s.win && /Marek/.test(s.text), 'DEAD AIR: Marek at 440 m in a quartering wind');
  // GLASS
  await go(3); await snap(pg, '07-flats'); await pg.evaluate(() => { Math.random0 = Math.random; Math.random = () => 0; game.mission.update(13.1); }); await until(pg, () => game.hp === 1);
  ok(await pg.evaluate(() => game.hp === 1 && /hit/.test(game.board.log.join(' '))), 'GLASS: the other rifle fires first and can hit you');
  await pg.evaluate(() => { game.mission.update(20); }); await until(pg, () => game.state === 'debrief'); s = await st(); ok(!s.win && /found you/.test(s.text), 'hit twice, it is over');
  await pg.evaluate(() => { Math.random = Math.random0; }); await go(3); await chest(); s = await st(); ok(s.state === 'debrief' && s.win, 'found in his window at 580 m, he is silenced');
  // LAST LIGHT
  await go(4); await pg.evaluate(() => { game.mission.update(12); }); await frames(pg, 3);
  ok(await pg.evaluate(() => !!game.mission.target && game.crowd.list.length === 4), 'LAST LIGHT: the cars stop and four walk for the helicopter'); await snap(pg, '08-pier');
  await pg.evaluate(() => { const T = game.mission.target; game.crowd.set(T, [{ wait: 99 }]); }); await frames(pg, 3); await chest(); s = await st(); ok(s.state === 'debrief' && s.win && /Commodore/.test(s.text), 'the Commodore, stopped on the pier at 830 m, is hit');
  await go(4); await pg.evaluate(() => { game.mission.update(12); }); await frames(pg, 2); await pg.evaluate(() => { const T = game.mission.target, t = T.tasks[1].to; T.pos.x = t[0] - 0.3; T.ti = 1; }); await until(pg, () => game.state === 'debrief'); s = await st(); ok(!s.win && /aboard/.test(s.text), 'once he is aboard it is lost');
  await pg.close();

  // ---------- an emulated Quest 3 ----------
  const vr = await b.newPage({ viewport: { width: 320, height: 180 } }); vr.setDefaultTimeout(240000); watch(vr);
  await vr.addInitScript(fs.readFileSync(require.resolve('iwer/build/iwer.js'), 'utf8') + ';window.__xrd=new IWER.XRDevice(IWER.metaQuest3);window.__xrd.installRuntime({forceInstall:true});window.__xrd.position.set(0,1.7,0);window.__xrd.controllers.left.position.set(-0.3,1.1,-0.2);window.__xrd.controllers.right.position.set(0.3,1.1,-0.2);');
  await vr.goto(FILE); await until(vr, () => window.game && game.time > 0.05 && game.mission && game.up); await until(vr, () => !document.getElementById('vr').disabled, null, 30000); await vr.click('#vr');
  await until(vr, () => game.renderer.xr.isPresenting, null, 60000); ok(await vr.evaluate(() => game.renderer.xr.isPresenting && game.board.screen === 'missions'), 'ENTER VR starts the headset session on the contracts board');
  const R = (f, a) => vr.evaluate(f, a); await frames(vr, 30);
  await R(() => { window.V3 = game.rig.position.constructor; const g = game.rifle.g; window.loc = (x, y, z) => new V3(x, y, z).applyQuaternion(g.quaternion).add(g.position); window.put = (c, v) => c.position.set(v.x, v.y, v.z); window.L = __xrd.controllers.left; window.RC = __xrd.controllers.right; });
  s = await R(() => ({ rest: game.rest.y, planted: game.rifle.planted, hands: game.hands.every(h => h.active) })); ok(s.hands && Math.abs(s.rest - 1.28) < 0.03 && s.planted, 'the sandbags rise to suit your height (' + s.rest.toFixed(2) + ' m) and the rifle waits on them; both controllers are hands');
  // press a contract on the board with a pointed controller
  await R(() => { const B = game.board, bt = B.buttons[1], u = (bt.x + bt.w / 2) / 1024, v = 1 - (bt.y + bt.h / 2) / 768, w = B.mesh.localToWorld(new V3((u - 0.5) * 1.3, (v - 0.5) * 0.975, 0)), l = game.rig.worldToLocal(w), e = new V3(-0.3, 1.2, -0.1), M = new (game.rig.matrix.constructor)().lookAt(e, l, new V3(0, 1, 0)), q = new (game.rig.quaternion.constructor)().setFromRotationMatrix(M); put(L, e); L.quaternion.set(q.x, q.y, q.z, q.w); });
  await frames(vr, 5); ok(await R(() => game.board.hover === 1), 'a controller pointed at the board lights the contract under it');
  await R(() => L.updateButtonValue('trigger', 1)); await frames(vr, 3); await R(() => L.updateButtonValue('trigger', 0)); await until(vr, () => game.state === 'brief' && game.mi === 1 && !game.loading);
  ok(await R(() => game.state === 'brief' && game.mi === 1), 'its trigger opens that briefing'); if (OUT) await vr.screenshot({ path: path.join(OUT, '09-vr-brief.png') });
  await R(async () => { await game.setup(0); game.begin(); L.quaternion.set(0, 0, 0, 1); put(L, new V3(-0.4, 1.0, -0.1)); }); await frames(vr, 4);
  // take the grip
  await R(() => put(RC, loc(0, -0.02, 0.01))); await frames(vr, 3); await R(() => RC.updateButtonValue('squeeze', 1)); await frames(vr, 5);
  s = await R(() => ({ main: game.rifle.main, planted: game.rifle.planted })); ok(s.main === 1 && s.planted, 'gripping the pistol grip takes the rifle, its bipod still planted');
  const yaw0 = await R(() => new V3(0, 0, -1).applyQuaternion(game.rifle.g.quaternion).x); await R(() => { RC.position.x -= 0.03; }); await frames(vr, 25);
  s = await R(() => new V3(0, 0, -1).applyQuaternion(game.rifle.g.quaternion).x); ok(s - yaw0 > 0.03 && await R(() => game.rifle.planted), 'moving the grip left swings the muzzle right about the bipod');
  // the eye to the scope
  await R(() => { const g = game.rifle.g, q = g.quaternion, e = loc(0, 0.194, 0.162).sub(new V3(0.0315, 0, 0).applyQuaternion(q)); __xrd.position.set(e.x, e.y, e.z); __xrd.quaternion.set(q.x, q.y, q.z, q.w); }); await frames(vr, 6);
  s = await R(() => { const g = game.rifle.g, q = g.quaternion, e = loc(0, 0.194, 0.162).sub(new V3(0.0315, 0, 0).applyQuaternion(q)); __xrd.position.set(e.x, e.y, e.z); return game.rifle.scoped; }); await frames(vr, 4);
  ok(await R(() => game.rifle.scoped), 'with an eye behind the eyepiece the scope draws'); if (OUT) await vr.screenshot({ path: path.join(OUT, '10-vr-scope.png') });
  // sticks: elevation on the rifle hand, zoom on the other
  await R(() => RC.updateAxes('thumbstick', 0, -1)); await frames(vr, 6); await R(() => RC.updateAxes('thumbstick', 0, 0)); await R(() => L.updateAxes('thumbstick', 0, -1)); await frames(vr, 6); await R(() => L.updateAxes('thumbstick', 0, 0));
  s = await R(() => ({ el: game.rifle.elev, z: game.rifle.zoom })); ok(s.el >= 0.1 && s.z > 10.2, 'the rifle hand\'s stick clicks the elevation up (' + s.el.toFixed(1) + ' mil), the other hand\'s zooms (' + s.z.toFixed(1) + 'x)');
  await R(() => L.updateButtonValue('x-button', 1)); await frames(vr, 3); await R(() => L.updateButtonValue('x-button', 0)); ok(await R(() => game.rifle.lased > 20), 'X on the other hand ranges what the crosshair is on');
  // fire, and work the bolt by hand
  await R(() => RC.updateButtonValue('trigger', 1)); await frames(vr, 3); await R(() => RC.updateButtonValue('trigger', 0)); await frames(vr, 2);
  s = await R(() => ({ shots: game.shots, spent: game.rifle.spent })); ok(s.shots === 1 && s.spent, 'the trigger fires; the spent case stays in the chamber');
  await R(() => RC.updateButtonValue('trigger', 1)); await frames(vr, 3); await R(() => RC.updateButtonValue('trigger', 0)); ok(await R(() => game.shots === 1), 'it will not fire again until the bolt is worked');
  await R(() => put(L, loc(0.05, 0.088, -0.1))); await frames(vr, 3); await R(() => L.updateButtonValue('squeeze', 1)); await frames(vr, 3); ok(await R(() => game.rifle.boltHand === 0), 'the free hand takes the bolt knob');
  await R(() => put(L, loc(0.05, 0.095, -0.1 + 0.1))); await frames(vr, 4); s = await R(() => ({ b: game.rifle.b, ch: game.rifle.chambered })); ok(s.b > 0.95 && !s.ch, 'pulled back, the case is thrown out');
  await R(() => put(L, loc(0.05, 0.088, -0.1))); await frames(vr, 4); await R(() => L.updateButtonValue('squeeze', 0)); await frames(vr, 3);
  s = await R(() => ({ b: game.rifle.b, ch: game.rifle.chambered, r: game.rifle.rounds, ready: game.rifle.ready() })); ok(s.b === 0 && s.ch && s.r === 3 && s.ready, 'pushed home, the next round is chambered (3 left in the magazine)');
  await R(() => RC.updateButtonValue('a-button', 1)); await frames(vr, 2); await R(() => RC.updateButtonValue('a-button', 0)); await until(vr, () => game.rifle.boltAnim < 0 && game.rifle.b === 0); ok(await R(() => game.rifle.rounds === 2 && game.rifle.chambered), 'A works the bolt for you (a live round thrown out, 2 left)');
  // the magazine by hand
  await R(() => RC.updateButtonValue('b-button', 1)); await frames(vr, 2); await R(() => RC.updateButtonValue('b-button', 0)); await frames(vr, 2); ok(await R(() => !game.rifle.magIn), 'B drops the magazine');
  await R(() => put(L, game.supply[0])); await frames(vr, 3); await R(() => L.updateButtonValue('squeeze', 1)); await frames(vr, 3); ok(await R(() => game.hands[0].mag), 'a fresh one is gripped from the tin on the sandbags');
  await R(() => put(L, game.rifle.mag.position.clone().applyQuaternion(game.rifle.g.quaternion).add(game.rifle.g.position))); await frames(vr, 4); s = await R(() => ({ in: game.rifle.magIn, r: game.rifle.rounds })); ok(s.in && s.r === 5, 'and pushed into the well: five rounds'); await R(() => L.updateButtonValue('squeeze', 0));
  // let go: it stays on its bipod
  await R(() => RC.updateButtonValue('squeeze', 0)); await frames(vr, 4); s = await R(() => ({ main: game.rifle.main, mode: game.rifle.mode, planted: game.rifle.planted })); ok(s.main === -1 && s.mode === 'rest' && s.planted, 'let go, the rifle stays on its bipod');
  ok(errs.length === 0, 'no page errors' + (errs.length ? ': ' + errs.join(' | ') : ''));
  await b.close(); srv.close(); if (fails.length) { console.log(fails.length + ' failed'); process.exit(1); } console.log('all ok');
})();
