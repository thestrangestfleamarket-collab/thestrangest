// THE FLY CHECK: node tests/skyaces.cjs [dist/fly.html] [folder for screenshots]. SKY ACES loads, every aircraft starts from the cockpit, one takes off, a fight is fought, the cockpit's controls work; then an emulated Quest 3.
const { chromium } = require('playwright'), path = require('path'), fs = require('fs');
const IWER = fs.readFileSync(require.resolve('iwer/build/iwer.min.js'), 'utf8');
const fails = [], ok = (c, m) => { if (!c) { fails.push(m); console.log((process.env.GITHUB_ACTIONS ? '::error title=fly::' : 'FAIL ') + m); } else console.log('ok   ' + m); };
const PAGE = path.resolve(process.argv[2] || 'dist/fly.html'), ROOT = path.dirname(PAGE), OUT = process.argv[3]; if (OUT) fs.mkdirSync(OUT, { recursive: true });
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.json': 'application/json', '.jpg': 'image/jpeg', '.webp': 'image/webp', '.mp3': 'audio/mpeg', '.glb': 'model/gltf-binary' };
const srv = require('http').createServer((q, r) => { const f = path.join(ROOT, decodeURIComponent(q.url.split('?')[0])); if (!f.startsWith(ROOT)) { r.writeHead(403); return r.end(); }
  fs.readFile(f, (e, d) => { if (e) { r.writeHead(404); return r.end(); } r.writeHead(200, { 'content-type': TYPES[path.extname(f)] || 'application/octet-stream' }); r.end(d); }); });
const IDS = ['camel', 'dr1', 'spitfire', 'bf109', 'p51', 'zero', 'f86', 'mig15', 'f4', 'mig21', 'f14', 'f15', 'f16', 'mig29', 'su27', 'f22'];
(async () => {
  await new Promise(res => srv.listen(0, '127.0.0.1', res)); const URL = 'http://127.0.0.1:' + srv.address().port + '/' + path.basename(PAGE);
  const b = await chromium.launch({ ...(process.env.PWCHROME ? { executablePath: process.env.PWCHROME } : {}), args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--autoplay-policy=no-user-gesture-required'] });
  const open = async (init) => { const pg = await b.newPage({ viewport: { width: 640, height: 360 } }), errs = [], miss = []; pg.on('pageerror', e => errs.push(e.message.slice(0, 300))); pg.on('response', r => { if (r.status() >= 400) miss.push(r.url().split('/').pop()); });
    if (init) await pg.addInitScript(init); await pg.goto(URL); await pg.waitForFunction(() => window.game && !document.getElementById('fly').disabled, null, { timeout: 420000 }).catch(() => {}); return { pg, errs, miss }; };

  // ---- on a screen ----
  { const t0 = Date.now(), { pg, errs, miss } = await open(), ev = (f, a) => pg.evaluate(f, a);
    ok(await ev(() => !!window.game && game.world.bases.length === 3 && game.world.towns.length === 0 && !game.world.buildings), 'the island is made: three airstrips, no towns or buildings (' + ((Date.now() - t0) / 1000).toFixed(0) + ' s)');
    const each = await ev(async ids => { const out = []; game.opts.enemies = 0; for (const id of ids) { game.view = 'cockpit'; const f0 = game.renderer.info.render.frame; await game.start(id); game.simulate(2); await new Promise(r => setTimeout(r, 1500));
      const p = game.player, fm = p.fm; out.push([id, game.state === 'fly' && p.alive && fm.ias > 20 && isFinite(fm.pos.y) && game.cockpit.controls.length > 5 && game.renderer.info.render.frame > f0 && !game._err]); } return out; }, IDS);
    ok(each.every(e => e[1]), 'all sixteen aircraft start from the cockpit and fly' + (each.every(e => e[1]) ? '' : ': not ' + each.filter(e => !e[1]).map(e => e[0])));
    ok(miss.length === 0, 'every model, picture and sound is found' + (miss.length ? ': ' + [...new Set(miss)].join(', ') : ''));
    const mem = await ev(async () => { const a = game.renderer.info.memory.geometries; for (const id of ['f16', 'spitfire', 'f16', 'spitfire']) await game.start(id); return [a, game.renderer.info.memory.geometries]; });
    ok(mem[1] < mem[0] + 60, 'changing aircraft gives its memory back (' + mem + ')');
    // a runway take-off by the keys
    const to = await ev(async () => { game.opts.start = 'runway'; await game.start('spitfire'); const fm = game.player.fm; game.simulate(5); const parked = [Math.asin(game.player.fwd.y), fm.ias, fm.onGround];
      game.input.setThrottle(1); game.simulate(11); game.input.keys.KeyS = true; game.simulate(6); game.input.keys.KeyS = false; game.opts.start = 'air'; return { parked, agl: fm.agl, ias: fm.ias, alive: game.player.alive, ground: fm.onGround }; });
    ok(to.parked[2] && to.parked[1] < 1 && to.parked[0] > 0.1 && to.parked[0] < 0.3, 'parked, a Spitfire sits on its tail wheel and stays put');
    ok(to.alive && !to.ground && to.agl > 20, 'full throttle, then the stick back: it takes off (' + to.agl.toFixed(0) + ' m up at ' + (to.ias * 3.6).toFixed(0) + ' km/h)');
    if (OUT) { await ev(() => { game.setView('chase'); game.simulate(1); }); await pg.waitForTimeout(3000); await pg.screenshot({ path: path.join(OUT, '01-airborne.png') }); }
    // gear, flaps, a stall, the autopilot
    const sys = await ev(async () => { await game.start('f15'); const p = game.player, fm = p.fm, c = n => game.cockpit.controls.find(k => k.name === n); c('GEAR').press(); game.simulate(4); const down = fm.gearPos; c('GEAR').press(); game.simulate(4);
      c('A/P').press(); fm.apAlt = fm.alt; game.input.setThrottle(0.9); game.simulate(40); const hold = Math.abs(fm.alt - fm.apAlt); c('A/P').press(); const arm0 = p.masterArm; c('GUNS').press(); const arm1 = p.masterArm; c('GUNS').press();
      const dead = game.cockpit.controls.filter(k => typeof k.press !== 'function').length; return { down, up: fm.gearPos, gearShown: p.parts.gear && p.parts.gear.visible, hold, arm: arm0 && !arm1, n: game.cockpit.controls.length, dead }; });
    ok(sys.down > 0.9 && sys.up < 0.05 && sys.gearShown === false, 'the gear lever lowers and raises the wheels'); ok(sys.hold < 30, 'the autopilot holds its height (' + sys.hold.toFixed(1) + ' m off)');
    ok(sys.arm && sys.dead === 0 && sys.n > 25, 'the cockpit\'s ' + sys.n + ' switches, buttons and levers all work');
    // a fight flown by the game itself
    const fight = await ev(async () => { game.opts.enemies = 2; game.opts.wing = 1; await game.start('f4'); game.demo(true); let stall = 0, n = 0, shots = 0; const a0 = game.aircraft.reduce((s, a) => s + a.ammo, 0);
      for (let i = 0; i < 240; i++) { game.simulate(1); for (const a of game.aircraft) { if (a.hp < a.hpMax || !a.alive) shots++; if (a.ai && a.alive) { n++; if (a.fm.ias < a.ai.vs * 1.05) stall++; } } await new Promise(r => setTimeout(r, 0)); }
      return { stall: stall / Math.max(n, 1), foes: game.aircraft.filter(a => a.team === 1 && a.alive).length, wave: game.wave, hurt: shots > 0 || game.wave > 1, err: !!game._err, t: game.time }; });
    ok(fight.hurt && !fight.err, 'four minutes of a jet fight: shots land'); ok(fight.stall < 0.05, 'the pilots keep their speed (' + (fight.stall * 100).toFixed(1) + '% of the time stalled)'); ok(fight.foes > 0 || fight.wave > 1, 'there is always someone to fight (wave ' + fight.wave + ')');
    const crash = await ev(() => { const p = game.player, w = game.world; p.ai = null; let at = null; for (let x = -20000; x < 20000 && !at; x += 400) for (let z = -20000; z < 20000; z += 400) if (w.forestAt(x, z) > 0.8 && w.heightAt(x, z) > 20) { at = [x, z]; break; }
      game.simulate(0.2); p.fm.pos.set(at[0], w.heightAt(at[0], at[1]) + 5, at[1]); p.fm.vel.set(0, 0, -40); game.simulate(0.3); return p.removed || !!p.fm.crashed; });
    ok(crash, 'flying into the forest\'s canopy is the end of you');
    ok(errs.length === 0, 'no page errors' + (errs.length ? ': ' + errs.slice(0, 3).join(' | ') : '')); await pg.close(); }

  // ---- an emulated Quest 3 ----
  { const { pg, errs } = await open(IWER + ';window.xrDevice=new IWER.XRDevice(IWER.metaQuest3);xrDevice.installRuntime({forceInstall:true});xrDevice.position.set(0.2,1.3,0.1);'), ev = (f, a) => pg.evaluate(f, a);
    await pg.waitForFunction(() => !document.getElementById('vr').disabled, null, { timeout: 60000 }).catch(() => {});
    await ev(() => { game.opts.enemies = 0; document.getElementById('oEnemies').value = '0'; game.selected = 'f16'; }); await pg.click('#vr');
    ok(await pg.waitForFunction(() => game.renderer.xr.isPresenting && game.state === 'fly', null, { timeout: 240000 }).then(() => true, () => false), 'ENTER VR starts the headset in the cockpit');
    const frames = async n => { const f0 = await ev(() => game.renderer.info.render.frame); await pg.waitForFunction(a => game.renderer.info.render.frame >= a, f0 + n, { timeout: 180000 }).catch(() => {}); };
    const tap = async (hand, btn) => { await ev(([h, k]) => xrDevice.controllers[h].updateButtonValue(k, 1), [hand, btn]); await frames(3); await ev(([h, k]) => xrDevice.controllers[h].updateButtonValue(k, 0), [hand, btn]); await frames(3); };
    await ev(() => { game.player.fm.autopilot = true; game.player.fm.apAlt = game.player.fm.alt; }); await frames(4);
    await tap('left', 'y-button'); await frames(3);
    const head = await ev(() => { const c = game.camera.getWorldPosition(game.camPos.clone()), e = game.cockpit.group.localToWorld(game.cockpit.eye.clone().set(0, 0, 0)); return c.distanceTo(e); });
    ok(head < 0.08, 'Y puts your head on the pilot\'s eye point wherever you sit (' + head.toFixed(3) + ' m off)');
    await ev(() => xrDevice.controllers.right.updateAxes('thumbstick', 0.8, 0.6)); await frames(4); const st = await ev(() => ({ p: game.player.fm.ctl.pitch, r: game.player.fm.ctl.roll })); await ev(() => xrDevice.controllers.right.updateAxes('thumbstick', 0, 0));
    ok(st.p > 0.3 && st.r > 0.4, 'the right stick is the control column (pitch ' + st.p.toFixed(2) + ', roll ' + st.r.toFixed(2) + ')');
    const a0 = await ev(() => game.player.ammo); await ev(() => xrDevice.controllers.right.updateButtonValue('trigger', 1)); await frames(5); await ev(() => xrDevice.controllers.right.updateButtonValue('trigger', 0)); await frames(2);
    ok((await ev(() => game.player.ammo)) < a0, 'the right trigger fires the gun');
    const t0 = await ev(() => game.input.throttle); await ev(() => xrDevice.controllers.left.updateAxes('thumbstick', 0, 1)); await frames(5); await ev(() => xrDevice.controllers.left.updateAxes('thumbstick', 0, 0));
    ok((await ev(() => game.input.throttle)) < t0, 'the left stick pulled back closes the throttle');
    if (OUT) await pg.screenshot({ path: path.join(OUT, '02-headset.png') });
    await tap('left', 'x-button'); ok(await ev(() => game.view === 'chase'), 'X steps outside the aircraft'); await tap('left', 'x-button');
    ok(await ev(() => game.view === 'cockpit' && !game._err), 'and back in');
    await ev(() => { game.setView('chase'); }); await frames(4); const snap = await ev(() => game.rig.rotation.y / (Math.PI / 6)); ok(Math.abs(snap - Math.round(snap)) < 0.01, 'outside, the view turns in steps of thirty degrees');
    await ev(() => { game.setView('cockpit', true); game.player.fm.autopilot = false; xrDevice.controllers.right.updateAxes('thumbstick', 1, 0); }); await frames(6); const vg = await ev(() => game.vignette.material.uniforms.uA.value); await ev(() => xrDevice.controllers.right.updateAxes('thumbstick', 0, 0));
    ok(vg > 0.1, 'a hard roll narrows the view (' + vg.toFixed(2) + ')');
    await ev(() => { game.opts.comfort = 2; }); await tap('left', 'x-button'); ok(await ev(() => game.view === 'cockpit'), 'MOST COMFORTABLE keeps you in the cockpit');
    ok(errs.length === 0, 'no page errors in the headset' + (errs.length ? ': ' + errs.slice(0, 3).join(' | ') : '')); await pg.close(); }

  await b.close(); srv.close(); console.log(fails.length ? fails.length + ' FAILED' : 'the fly check passed'); process.exit(fails.length ? 1 : 0);
})();
