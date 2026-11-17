// THE SWIVEL CHECK: node tests/turret.cjs [dist/turret.html] [folder for screenshots]. The fight's rules with no page (waves, bolts, heat, missiles, shield and hull, a cruiser, the end); the page on a screen (it starts, the guns follow the aim and kill a ship); an emulated Quest 3 (the seat is set, a trigger starts and fires along the controller, a grip sends a missile, a thumbstick turns you).
const { chromium } = require('playwright'), path = require('path'), fs = require('fs'), { pathToFileURL } = require('url');
const fails = [], ok = (c, m) => { if (!c) { fails.push(m); console.log((process.env.GITHUB_ACTIONS ? '::error title=turret::' : 'FAIL ') + m); } else console.log('ok   ' + m); };
const PAGE = path.resolve(process.argv[2] || 'dist/turret.html'), ROOT = path.dirname(PAGE), OUT = process.argv[3]; if (OUT) fs.mkdirSync(OUT, { recursive: true });
const srv = require('http').createServer((q, r) => { const f = path.join(ROOT, decodeURIComponent(q.url.split('?')[0])); if (!f.startsWith(ROOT)) { r.writeHead(403); return r.end(); }
  fs.readFile(f, (e, d) => { if (e) { r.writeHead(404); return r.end(); } r.writeHead(200, { 'content-type': f.endsWith('.html') ? 'text/html' : 'application/octet-stream' }); r.end(d); }); });
const IWER = fs.readFileSync(require.resolve('iwer/build/iwer.min.js'), 'utf8');
const exe = process.env.PW_CHROMIUM || (fs.existsSync('/opt/pw-browsers/chromium') ? '/opt/pw-browsers/chromium' : undefined);

(async () => {
  // ---- the rules, no page ----
  const { Sim, plan, RULES, TYPES } = await import(pathToFileURL(path.resolve('src/turret/sim.js')));
  const run = (s, secs, each) => { for (let t = 0; t < secs; t += 1 / 60) { each && each(); s.step(1 / 60); } }, has = (s, t) => s.events.some(e => e.t === t);
  const lead = (s, f) => { const tt = Math.hypot(...f.p) / RULES.bolt, p = f.p.map((v, i) => v + f.v[i] * tt), l = Math.hypot(...p); return p.map(v => v / l); };
  ok(plan(1).every(t => t === 'fighter') && plan(2).includes('drone') && plan(5)[0] === 'cruiser' && plan(10)[0] === 'cruiser' && plan(4).includes('bomber') && plan(9).length > plan(2).length, 'the waves: fighters first, then drones, bombers and aces, a cruiser every fifth');
  { const s = new Sim(2); s.start(); s.rest = 1e9; const d = s.spawn('drone', { p: [0, 200, 500], d: [0, 0, -1] }); run(s, 8); ok(d.dead && s.shield < 100 && has(s, 'boom'), 'a drone left alone rams the hull'); const e = s.spawn('drone', { p: [0, 200, 500], d: [0, 0, -1] }); s.hurt(e, 1, e.p); ok(e.dead && s.score > 0 && s.events.some(x => x.t === 'boom' && x.pts > 0), 'one bolt kills a drone, and the kill says its points'); }
  { const s = new Sim(3); s.step(1); ok(s.state === 'ready' && !s.ships.length && !s.fire([0, 0, 0], [0, 0, 1]), 'nothing moves or fires before the start');
    s.start(); run(s, 6); ok(s.wave === 1 && s.ships.length === plan(1).length && has(s, 'wave'), 'wave 1 arrives');
    ok(s.ships.every(f => Math.hypot(...f.p) > 300 && f.p[1] > 0), 'they come in from far off, above the hull'); }
  { const s = new Sim(4); s.start(); let low = 1e9; run(s, 60, () => { for (const f of s.ships) low = Math.min(low, f.p[1]); }); ok(s.shield < 100 || s.hull < 100, 'left alone they hit you: the shield takes it first'); ok(low > 12, 'no ship flies through your hull (lowest ' + low.toFixed(0) + ' m)'); ok(s.state === 'play', 'two fighters alone do not end a ship in a minute'); }
  { const s = new Sim(5); s.start(); run(s, 400, () => { const f = s.ships.filter(x => !x.dead).sort((a, b) => Math.hypot(...a.p) - Math.hypot(...b.p))[0]; if (f && Math.hypot(...f.p) < 800) s.fire([0, 0, 0], lead(s, f)); });
    ok(s.kills > 10 && s.score > 1000, 'aiming ahead of a ship by its speed kills it (' + s.kills + ' kills, ' + s.score + ' points)'); ok(s.wave >= 5, 'clearing a wave brings the next (wave ' + s.wave + ')'); }
  { const s = new Sim(6); s.start(); let n = 0; for (let i = 0; i < 400 && !s.hot; i++) { if (s.fire([0, 0, 0], [0, 1, 0])) n++; s.step(1 / 60); } ok(s.hot && n > 15 && n < 60, 'the guns overheat after a long burst (' + n + ' shots)'); ok(!s.fire([0, 0, 0], [0, 1, 0]), 'and will not fire hot');
    run(s, 2.5); ok(!s.hot && s.fire([0, 0, 0], [0, 1, 0]), 'they cool and fire again'); }
  { const s = new Sim(7); s.start(); s.rest = 1e9; const f = s.spawn('fighter', { p: [0, 300, 600], d: [1, 0, 0], st: 'break', bt: 5, side: [1, 0, 0], rout: 1e9 }); const aimd = [0, 300, 600].map(v => v / Math.hypot(300, 600));
    ok(s.lock([0, 0, 0], aimd) === f && s.lock([0, 0, 0], [0, 0, -1]) === null, 'a missile locks the ship nearest the aim, not one behind you'); ok(s.missile([0, 0, 0], aimd) && s.msl === RULES.missiles - 1, 'a missile leaves the rack');
    run(s, 6); ok(f.dead && s.score === TYPES.fighter.score, 'it follows the turning fighter and kills it'); for (let i = 0; i < 9; i++) { s.missile([0, 0, 0], [0, 1, 0]); s.step(0.5); } ok(s.msl === 0 || s.msl === 1, 'the rack runs out'); const m0 = s.msl; run(s, RULES.reload + 0.5); ok(s.msl > m0, 'and reloads one at a time'); }
  { const s = new Sim(8); s.start(); s.rest = 1e9; s.hurtShip(30, [0, 0, 0]); ok(s.shield === 70 && s.hull === 100, 'a hit takes the shield'); run(s, 2); ok(s.shield === 70, 'no shield back while the hit is fresh'); run(s, 6); ok(s.shield > 95, 'then it comes back');
    s.hurtShip(120, [0, 0, 0]); ok(s.shield === 0 && s.hull < 100 && s.hull > 60, 'what gets through the shield takes hull'); s.hurtShip(200, [0, 0, 0]); ok(s.state === 'over' && has(s, 'over') && s.best === s.score, 'no hull: the ship is lost'); ok(!s.fire([0, 0, 0], [0, 1, 0]), 'no firing after'); s.start(); ok(s.state === 'play' && s.hull === 100 && s.wave === 0, 'and you can go again'); }
  { const s = new Sim(9); s.start(); s.rest = 1e9; const c = s.enter('cruiser', 1); ok(s.ships.filter(x => x.type === 'pod').length === 4, 'a cruiser carries four gun pods'); run(s, 20); ok(c.rad < 500, 'it closes and holds off your beam'); const h0 = s.shield + s.hull; run(s, 10); ok(s.shield + s.hull < h0 || has(s, 'foefire'), 'its pods fire on you');
    for (const p of s.ships.filter(x => x.type === 'pod')) s.hurt(p, 99, p.p); s.events.length = 0; s.shield = 100; s.lastHit = -99; run(s, 6); ok(!s.events.some(e => e.t === 'foefire' && e.heavy), 'pods shot off: its guns stop');
    let n = 0; for (let i = 0; i < 9000 && !c.dead; i++) { if (s.fire([0, 0, 0], lead(s, c))) n++; s.step(1 / 60); } ok(c.dead && s.score >= TYPES.cruiser.score, 'the cruiser dies to the guns (' + n + ' bolts)'); }

  // ---- the page on a screen ----
  await new Promise(r => srv.listen(0, r)); const URL = 'http://localhost:' + srv.address().port + '/' + path.basename(PAGE);
  const b = await chromium.launch({ executablePath: exe, args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  { const pg = await b.newPage({ viewport: { width: 960, height: 600 } }), errs = []; pg.on('pageerror', e => errs.push(e.message.slice(0, 300)));
    await pg.goto(URL); ok(await pg.waitForFunction(() => !document.getElementById('screen').disabled, null, { timeout: 180000 }).then(() => true, () => false), 'the ships load and PLAY ON THIS SCREEN opens');
    await pg.click('#screen'); await pg.waitForTimeout(600); ok(await pg.evaluate(() => __turret.mode === 'screen' && __turret.sim.state === 'ready' && __turret.world.said === 'SWIVEL'), 'in the turret, waiting for the first click');
    if (OUT) await pg.screenshot({ path: path.join(OUT, '01-ready.png') });
    await pg.mouse.click(480, 300); await pg.mouse.up(); ok(await pg.waitForFunction(() => __turret.sim.state === 'play', null, { timeout: 20000 }).then(() => true, () => false), 'a click starts the fight');
    await pg.evaluate(() => { const S = __turret.sim; S.rest = 1e9; S.spawn('fighter', { p: [120, 60, -220], d: [-1, 0, 0], st: 'break', bt: 9, side: [0, 1, 0], rout: 1e9 }); });
    await pg.evaluate(() => { __turret.auto = setInterval(() => { const T = __turret, s = T.sim.ships[0]; if (!s) return; const tt = Math.hypot(...s.p) / 700, p = s.p.map((v, i) => v + s.v[i] * tt), l = Math.hypot(...p); T.look(Math.atan2(-p[0], -p[2]), Math.asin(p[1] / l)); T.held = true; }, 16); });
    ok(await pg.waitForFunction(() => __turret.sim.kills === 1, null, { timeout: 90000 }).then(() => true, () => false), 'looking ahead of a fighter and holding fire kills it: the bolts leave the barrels and meet at the sight');
    if (OUT) await pg.screenshot({ path: path.join(OUT, '02-kill.png') });
    const y = await pg.evaluate(() => { clearInterval(__turret.auto); __turret.held = false; __turret.look(2, 0.3); return new Promise(r => requestAnimationFrame(() => requestAnimationFrame(() => r(__turret.world.yoke.rotation.y)))); }); ok(Math.abs(y - 2) < 0.01, 'the guns swing to where you look');
    ok(errs.length === 0, 'no page errors' + (errs.length ? ': ' + errs.slice(0, 3).join(' | ') : '')); await pg.close(); }

  // ---- an emulated Quest 3 ----
  { const pg = await b.newPage({ viewport: { width: 800, height: 500 } }), errs = []; pg.on('pageerror', e => errs.push(e.message.slice(0, 300)));
    await pg.addInitScript(IWER + ';window.xrDevice=new IWER.XRDevice(IWER.metaQuest3);xrDevice.installRuntime({forceInstall:true});xrDevice.position.set(0.3,1.15,0.2);');
    await pg.goto(URL); await pg.waitForFunction(() => !document.getElementById('vr').disabled, null, { timeout: 180000 }).catch(() => { });
    await pg.click('#vr'); ok(await pg.waitForFunction(() => __turret.renderer.xr.isPresenting && __turret.mode === 'vr', null, { timeout: 60000 }).then(() => true, () => false), 'ENTER THE TURRET starts the headset');
    await pg.waitForTimeout(1500); const head = await pg.evaluate(() => { const v = __turret.camera.getWorldPosition(__turret.rig.position.clone()); return [v.x, v.y, v.z]; });
    ok(Math.hypot(...head) < 0.05, 'wherever you sit, your head is the middle of the turret (' + head.map(v => v.toFixed(2)) + ')');
    const tap = async (hand, btn) => { await pg.evaluate(([h, b]) => xrDevice.controllers[h].updateButtonValue(b, 1), [hand, btn]); await pg.waitForTimeout(400); await pg.evaluate(([h, b]) => xrDevice.controllers[h].updateButtonValue(b, 0), [hand, btn]); await pg.waitForTimeout(300); };
    await tap('right', 'trigger'); ok(await pg.evaluate(() => __turret.sim.state === 'play'), 'a trigger starts the fight');
    // the right controller points up and to the left; its bolts go that way
    await pg.evaluate(() => { __turret.sim.rest = 1e9; xrDevice.controllers.right.position.set(0.5, 1.0, 0); const q = xrDevice.controllers.right.quaternion, a = Math.PI / 2, e = 0.4, cy = Math.cos(a / 2), sy = Math.sin(a / 2), cx = Math.cos(e / 2), sx = Math.sin(e / 2); q.set(cy * sx, sy * cx, -sy * sx, cy * cx); });
    await pg.evaluate(() => xrDevice.controllers.right.updateButtonValue('trigger', 1)); await pg.waitForTimeout(1200);
    const sh = await pg.evaluate(() => { const T = __turret, bs = T.sim.bolts.filter(b => b.mine), b = bs[bs.length - 1]; return { n: bs.length, v: b ? b.v.map(x => x / 700) : null, aim: [T.aim.d.x, T.aim.d.y, T.aim.d.z], yoke: T.world.yoke.rotation.y, heat: T.sim.heat }; });
    await pg.evaluate(() => xrDevice.controllers.right.updateButtonValue('trigger', 0));
    ok(sh.n > 0 && sh.heat > 0, 'holding the trigger fires'); ok(sh.aim[0] < -0.8 && sh.aim[1] > 0.3, 'the aim is the controller\'s (' + sh.aim.map(v => v.toFixed(2)) + ')');
    ok(sh.v && sh.v[0] * sh.aim[0] + sh.v[1] * sh.aim[1] + sh.v[2] * sh.aim[2] > 0.999, 'the bolts fly along it'); ok(Math.abs(sh.yoke - Math.PI / 2) < 0.05, 'the guns have swung round to it');
    if (OUT) { await pg.screenshot({ path: path.join(OUT, '03-headset.png') }); }
    const m0 = await pg.evaluate(() => __turret.sim.msl); await tap('left', 'squeeze'); ok((await pg.evaluate(() => __turret.sim.msl)) === m0 - 1, 'a grip sends a missile');
    const r0 = await pg.evaluate(() => __turret.rig.rotation.y); await pg.evaluate(() => xrDevice.controllers.left.updateAxes('thumbstick', 1, 0)); await pg.waitForTimeout(400); await pg.evaluate(() => xrDevice.controllers.left.updateAxes('thumbstick', 0, 0)); await pg.waitForTimeout(300);
    const r1 = await pg.evaluate(() => { const v = __turret.camera.getWorldPosition(__turret.rig.position.clone()); return [__turret.rig.rotation.y, Math.hypot(v.x, v.y, v.z)]; });
    ok(Math.abs(r0 - r1[0] - Math.PI / 6) < 0.01 && r1[1] < 0.05, 'a thumbstick turns you a twelfth of the way round, about your own head');
    ok(errs.length === 0, 'no page errors in the headset' + (errs.length ? ': ' + errs.join(' | ') : '')); await pg.close(); }

  await b.close(); srv.close(); console.log(fails.length ? fails.length + ' FAILED' : 'the swivel check passed'); process.exit(fails.length ? 1 : 0);
})();
