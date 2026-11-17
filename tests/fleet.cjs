// THE FLEET CHECK: node tests/fleet.cjs [dist/space.html] [folder for screenshots]. The battle's rules with no page (building, orders, ships that fight on their own, blasts that shove, the bot, a whole battle to its end, the picture there and back, the room's filter); the page alone against the bot (ships drawn, an order, a ship blown into loose pieces that move by physics); two linked pages (the battle starts when the second joins, the second's order reaches the host, the host leaving hands the battle on); then an emulated Quest 3 goes in and plays
const { chromium } = require('playwright'), path = require('path'), fs = require('fs'), { pathToFileURL } = require('url');
const fails = [], ok = (c, m) => { if (!c) { fails.push(m); console.log((process.env.GITHUB_ACTIONS ? '::error title=fleet::' : 'FAIL ') + m); } else console.log('ok   ' + m); };
const PAGE = path.resolve(process.argv[2] || 'dist/space.html'), ROOT = path.dirname(PAGE), OUT = process.argv[3]; if (OUT) fs.mkdirSync(OUT, { recursive: true });
const TY = { glb: 'model/gltf-binary', mp3: 'audio/mpeg', jpg: 'image/jpeg', json: 'application/json', html: 'text/html' };
const srv = require('http').createServer((q, r) => { const f = path.join(ROOT, decodeURIComponent(q.url.split('?')[0])); if (!f.startsWith(ROOT)) { r.writeHead(403); return r.end(); }
  fs.readFile(f, (e, d) => { if (e) { r.writeHead(404); return r.end(); } r.writeHead(200, { 'content-type': TY[f.split('.').pop()] || 'text/html' }); r.end(d); }); });
const IWER = fs.readFileSync(require.resolve('iwer/build/iwer.min.js'), 'utf8');

(async () => {
  // ---- the rules, no page ----
  const { Sim, read, TYPES, FIGHTER, FRIGATE, CRUISER, MOTHER } = await import(pathToFileURL(path.resolve('src/space/sim.js'))), { Bot } = await import(pathToFileURL(path.resolve('src/space/bot.js')));
  { const s = new Sim(); ok(s.units.filter(u => u.side === 0).length === 5 && s.credits[0] === 300, 'each side starts with a mothership, three fighters, a frigate and 300 credits');
    ok(s.build(0, CRUISER) && s.credits[0] === 0 && !s.build(0, FIGHTER), 'building costs credits, and not without them');
    for (let i = 0; i < TYPES[CRUISER].time + 2; i++) s.step(); ok(s.units.some(u => u.side === 0 && u.type === CRUISER), 'the shipyard launches what it built'); ok(s.credits[0] > 100, 'credits come in over time'); }
  { const s = new Sim(), f = s.units.find(u => u.side === 0 && u.type === FRIGATE); s.order(0, [f.id], 0, [0.5, 0.1, 0.3]); s.order(1, [f.id], 0, [0, 0, 0]); let t = 0; while (f.k === 1 && t++ < 400) s.step();
    ok(Math.hypot(f.x - 0.5, f.y - 0.1, f.z - 0.3) < 0.05 && t > 20, 'a ship ordered to a place flies there on its own and holds; the other side cannot order it'); }
  { const s = new Sim(), f = s.units.find(u => u.side === 0 && u.type === FIGHTER); s.order(0, [f.id], 0, [0.3, 0, 0.5], 0, true); s.order(0, [f.id], 0, [-0.3, 0.1, 0.4], 0, true); s.order(0, [f.id], 0, [0, 0, 0.6], 0, true); ok(f.k === 1 && f.q.length === 2 && Math.abs(f.gx - 0.3) < 1e-6, 'orders given one after another make a mission: the first is flown, the rest wait');
    let t = 0, seen = []; while ((f.k === 1 || f.q.length) && t++ < 900) { s.step(); if (!seen.length && f.q.length === 1) seen.push(1); if (seen.length === 1 && !f.q.length && f.k === 1) seen.push(2); } ok(seen.length === 2 && Math.hypot(f.x, f.z - 0.6) < 0.06, 'the ship flies its whole mission in order and holds at the end');
    s.order(0, [f.id], 0, [0.5, 0, 0.5], 0, true); s.order(0, [f.id], 0, [-0.5, 0, 0.5], 0, true); s.order(0, [f.id], 0, [0, 0, 0.9], 0, false); ok(f.q.length === 0 && Math.abs(f.gz - 0.9) < 1e-6, 'an order given in place of the mission drops the rest'); }
  { const s = new Sim(), a = s.spawn(FRIGATE, 0, [0, 0, 0.1]), b = s.spawn(FRIGATE, 1, [0, 0, -0.1]); for (let i = 0; i < 30; i++) s.step(); ok(a.sh < s.T[0][FRIGATE].sh && b.sh < s.T[1][FRIGATE].sh && a.hp === s.T[0][FRIGATE].hp, 'ships left alone take on the enemy they meet, and their force fields take the first of it'); for (let i = 0; i < 60; i++) s.step(); ok(a.hp < s.T[0][FRIGATE].hp || b.hp < s.T[1][FRIGATE].hp, 'a field beaten down, the hull is hit');
    ok(s.T[1][FRIGATE].cost < s.T[0][FRIGATE].cost && s.T[1][FRIGATE].speed > s.T[0][FRIGATE].speed && s.T[0][FRIGATE].sh > s.T[1][FRIGATE].sh, 'the two navies differ: Corsair ships cheaper and faster, Admiralty fields stronger');
    ok(s.snap().includes(1), 'their shots are told to the headsets'); }
  { const s = new Sim(), big = s.spawn(CRUISER, 1, [0.5, 0, 0]), f = s.spawn(FIGHTER, 0, [0.56, 0, 0]); f.k = 1; f.gx = 0.56; f.gz = 0; big.hp = 0; big.hurt = 1; s.step(); ok(Math.hypot(f.vx, f.vy, f.vz) > 0.05 && f.vx > 0, 'a ship that blows up shoves the ships beside it away'); }
  { const s = new Sim(), n = s.nodes[0], f = s.spawn(FRIGATE, 0, [0, 0.02, 0]); for (let i = 0; i < 60; i++) s.step(); ok(n.owner === 0 && s.income(0) > s.income(1), 'a relay with only your ships beside it becomes yours and pays'); }
  { const s = new Sim(), b0 = new Bot(s, 0), b1 = new Bot(s, 1); b1.wave = 6; let bad = 0, top = 0; while (s.winner < 0 && s.tick < 10 * 60 * 30) { b0.step(); b1.step(); s.step(); if (s.tick % 5 === 0) { const a = s.snap(), o = read(a); if (!o || o.units.length !== s.units.length) bad++; top = Math.max(top, JSON.stringify(a).length); } }
    ok(s.winner >= 0, 'two bots fight a whole battle to its end (' + (s.tick / 600).toFixed(1) + ' minutes)'); ok(!bad && top < 6000, 'the battle\'s picture reads back whole and stays small (' + top + ' bytes at most)'); }
  { const s = new Sim(), fake = { messages: { create: async (q) => { const o = JSON.parse(q.messages[0].content), f = o.mine.find(u => u.kind === 'frigate'), e = o.theirs.find(u => u.kind === 'mothership'); return { stop_reason: 'end_turn', content: [{ type: 'text', text: JSON.stringify({ thought: 'strike', build: ['fighter', 'dreadnought'], orders: [{ ships: [f.id, 99999], action: 'attack', x: 0, y: 0, z: 0, target: e.id }, { ships: [o.mine[1].id], action: 'move', x: 30, y: 5, z: -20, target: 0 }, { ships: [e.id], action: 'move', x: 0, y: 0, z: 0, target: 0 }] }) }] }; } } };
    const { SPACE } = await import(pathToFileURL(path.resolve('worker/space.js'))); let mem = null; const bot = new Bot(s, 1, (obs) => SPACE.think({}, { get: async () => mem, put: async v => { mem = v; } }, obs, fake));
    for (let i = 0; i < 12; i++) { bot.step(); s.step(); await new Promise(r => setTimeout(r, 5)); } const f = s.units.find(u => u.side === 1 && u.type === FRIGATE), m = s.units.find(u => u.side === 0 && u.type === MOTHER), g = s.units.filter(u => u.side === 1)[1];
    ok(f.k === 2 && f.tid === m.id && s.queue[1].some(q => q.type === FIGHTER) && mem.n === 1, 'the admiral (Claude, here a stand-in) is shown the battle and its orders reach the bot\'s ships: attack, build; what is not its own or not real is dropped');
    ok(g.k === 1 && Math.abs(g.gx + 0.3) < 0.16 && g.gz > 0, 'its places are turned round for the side it commands'); }
  { const { SPACE } = await import(pathToFileURL(path.resolve('worker/space.js')));
    ok(SPACE.clean({ t: 's', a: [1, 2, 3] }, 0).a.length === 3 && SPACE.clean({ t: 's', a: [1] }, 1) === null && SPACE.clean({ t: 'o', ids: [3], k: 1, p: [0, 9, 0], tid: 4 }, 1).p[1] === 2 && SPACE.clean({ t: 'b', u: 99 }, 1).u === 5 && SPACE.clean({ t: 'cheat' }, 0) === null && SPACE.slot([0]) === 1,
      'the room passes the host\'s pictures, orders and builds, drops the rest, and seats the second player'); }

  // ---- the page alone against the bot ----
  await new Promise(res => srv.listen(0, '127.0.0.1', res)); const URL = 'http://127.0.0.1:' + srv.address().port + '/' + path.basename(PAGE);
  const b = await chromium.launch({ ...(process.env.PWCHROME ? { executablePath: process.env.PWCHROME } : {}), args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const errs = [], watch = pg => { pg.on('pageerror', e => errs.push(e.message.slice(0, 300))); pg.on('console', m => { if (m.type() === 'error' && !/WebSocket|parties|Failed to load resource/.test(m.text())) errs.push('console: ' + m.text().slice(0, 300)); }); };
  const ctx = await b.newContext({ viewport: { width: 640, height: 400 } });
  { const pg = await ctx.newPage(); watch(pg); await pg.goto(URL + '?sim&fx'); await pg.waitForFunction(() => window.__space && __space.G.view.units.size >= 10, null, { timeout: 180000 });
    ok(true, 'the page starts a battle against the bot and draws both fleets');
    const id = await pg.evaluate(() => { const V = __space.G.view, u = [...V.units.values()].find(u => u.side === 0 && u.type === 2); __space.cmd.order([u.id], 0, { x: 0.4, y: 0, z: 0.5 }); return u.id; });
    await pg.waitForFunction((id) => { const u = __space.G.sim.byId.get(id); return u && u.k === 1; }, id, { timeout: 30000 }); ok(true, 'an order from the hands reaches the ship');
    ok(await pg.evaluate(() => __space.post.valid && __space.post.w > 0 && __space.cosmos() && __space.cosmos().bodies > 10000), 'open space is drawn through the lens (depth of field, motion blur) and its stars are bodies in space, not a picture');
    await pg.evaluate(() => { __space.setPause(true); }); const t0 = await pg.evaluate(() => __space.G.sim.tick); await pg.waitForTimeout(1500); ok(await pg.evaluate((t0) => __space.G.paused && __space.G.sim.tick === t0, t0), 'paused, the battle stands still'); await pg.evaluate(() => { __space.setPause(false); });
    await pg.evaluate(() => { __space.cmd.build(1); }); ok(await pg.evaluate(() => __space.G.sim.queue[0].length === 1), 'the wrist panel\'s button builds a ship');
    await pg.evaluate(() => { const S = __space.G.sim; __space.G.bots = []; const c = S.spawn(3, 1, [0.2, 0, 0.3]); window.__c = c.id; });
    await pg.waitForFunction(() => __space.G.view.units.has(window.__c), null, { timeout: 30000 }); await pg.evaluate(() => { __space.G.sim.byId.get(window.__c).hurt = 1e5; });
    await pg.waitForFunction(() => __space.G.view.bodies.filter(b => b.kind === 1).length >= 8, null, { timeout: 30000 });
    const p0 = await pg.evaluate(() => __space.G.view.bodies.filter(b => b.kind === 1).map(b => [b.p.x, b.p.y, b.p.z, b.v.length(), b.w.length()])); await pg.waitForTimeout(1500);
    const p1 = await pg.evaluate(() => __space.G.view.bodies.filter(b => b.kind === 1).map(b => [b.p.x, b.p.y, b.p.z]));
    ok(p0.length >= 8 && p0.every(a => a[3] > 0.002) && p0.some(a => a[4] > 0.2) && p1.some((a, i) => p0[i] && Math.hypot(a[0] - p0[i][0], a[1] - p0[i][1], a[2] - p0[i][2]) > 0.01), 'a destroyed cruiser breaks into ' + p0.length + ' pieces of its own hull, each flying and spinning on its own');
    if (OUT) await pg.screenshot({ path: path.join(OUT, 'space-solo.png') }); await pg.close(); }

  // ---- two linked pages ----
  { const host = await ctx.newPage(), guest = await ctx.newPage(); watch(host); watch(guest);
    await host.goto(URL + '?sim&local&slot=0'); await host.waitForFunction(() => window.__space && __space.G.state === 'wait', null, { timeout: 180000 });
    ok(await host.evaluate(() => __space.G.view.units.size === 0), 'the first player in waits; no battle yet');
    await guest.goto(URL + '?sim&local&slot=1'); await guest.waitForFunction(() => !!window.__space, null, { timeout: 180000 });
    const tick = async (ms = 400) => { await host.bringToFront(); await host.waitForTimeout(ms / 2); await guest.bringToFront(); await guest.waitForTimeout(ms / 2); };
    const until = async (f, n = 120) => { for (let i = 0; i < n; i++) { if (await f()) return true; await tick(); } return false; };
    ok(await until(async () => (await host.evaluate(() => __space.G.state === 'play')) && (await guest.evaluate(() => __space.G.state === 'play' && __space.G.view.units.size >= 10))), 'the battle starts as soon as the second player joins, and both see both fleets');
    ok(await guest.evaluate(() => __space.G.me === 1 && !__space.G.sim), 'the second player commands the other fleet from the host\'s pictures');
    const gid = await guest.evaluate(() => { const u = [...__space.G.view.units.values()].find(u => u.side === 1 && u.type === 2); __space.cmd.order([u.id], 0, { x: -0.4, y: 0, z: -0.5 }); __space.cmd.build(1); return u.id; });
    ok(await until(() => host.evaluate((id) => { const u = __space.G.sim.byId.get(id); return u && u.k === 1 && __space.G.sim.queue[1].length === 1; }, gid)), 'the second player\'s order and build reach the host\'s battle');
    await host.evaluate(() => __space.G.net.close()); await host.close(); await guest.bringToFront(); ok(await guest.waitForFunction(() => !!__space.G.sim && __space.G.bots.length === 1 && __space.G.view.units.size >= 10, null, { timeout: 60000 }).then(() => true, () => false), 'when the host leaves, the battle carries on where it was with the bot in their place');
    await guest.close(); }

  // ---- an emulated Quest 3 ----
  { const xc = await b.newContext({ viewport: { width: 800, height: 600 } }), pg = await xc.newPage(); watch(pg);
    await pg.addInitScript(IWER + ';window.xrDevice=new IWER.XRDevice(IWER.metaQuest3);xrDevice.installRuntime({forceInstall:true});xrDevice.position.set(0,1.6,0);');
    await pg.goto(URL); await pg.waitForFunction(() => { const e = document.getElementById('bot'); return e && !e.disabled; }, null, { timeout: 180000 }); ok(true, 'in a headset the page offers TWO PLAYERS and PLAY THE BOT');
    await pg.click('#bot'); await pg.waitForFunction(() => window.__space && __space.G.state === 'play' && __space.G.view.units.size >= 10, null, { timeout: 60000 });
    const s = await pg.evaluate(() => ({ xr: !!document.querySelector('canvas') && __space.G.view.units.size, y: __space.arena.position.y, sc: __space.arena.scale.x, z: __space.arena.position.z, hands: __space.hands.filter(h => h.on).length, panel: !!__space.panel.mesh.parent }));
    ok(s.sc > 0.3 && s.sc < 1 && s.y > 0.7 && s.y < 1.5 && s.z < -0.5, 'the field is set an arm\'s length in front of you, below eye height'); ok(s.hands === 2 && s.panel, 'both controllers are held and the console floats beside you');
    // each controller in turn points at a ship on the console and pulls the trigger: the shipyard takes the order
    const con = await pg.evaluate(async () => { const P = __space.panel, wait = (ms) => new Promise(r => setTimeout(r, ms)), out = [], V3 = __space.arena.position.constructor, until = async (f, ms) => { for (let t = 0; t < ms && !f(); t += 100) await wait(100); return f(); }; await wait(1500);
      for (const [name, i] of [['right', 0], ['left', 1]]) { const c = xrDevice.controllers[name], goal = P.spot(i, new V3()), t = goal.clone(), h = __space.hands.find(h => h.src && h.src.handedness === name); c.position.set(name === 'right' ? 0.2 : -0.2, 1.3, -0.1);
        // aim as a person does: point, see where the dot lands, correct
        for (let k = 0; k < 8; k++) { const d = t.clone().sub(c.position).normalize(), yaw = Math.atan2(-d.x, -d.z), pitch = Math.asin(d.y), cy = Math.cos(yaw / 2), sy = Math.sin(yaw / 2), cp = Math.cos(pitch / 2), sp = Math.sin(pitch / 2); c.quaternion.set(cy * sp, sy * cp, -sy * sp, cy * cp); const o0 = h.dir.clone(); await until(() => h.dir.distanceTo(o0) > 1e-4 || k === 0, 4000); await wait(500); if (h.ui === i) break; if (h.onPanel) t.add(goal.clone().sub(h.cur)); }
        const hot = h.ui, q0 = __space.G.sim.queue[0].length; c.updateButtonValue('trigger', 1); await until(() => __space.G.sim.queue[0].length > q0, 5000); c.updateButtonValue('trigger', 0); await wait(600); out.push({ hot, built: __space.G.sim.queue[0].length - q0, type: __space.G.sim.queue[0].map(q => q.type).join() }); c.position.set(name === 'right' ? 0.25 : -0.25, 0.9, 0.2); c.quaternion.set(0.7, 0, 0, 0.7); await wait(200); }
      return out; });
    ok(con[0].hot === 0 && con[0].built === 1, 'the right controller points at FIGHTER on the console, pulls the trigger, and one is built'); ok(con[1].hot === 1 && con[1].built === 1, 'the left controller does the same with FRIGATE');
    // point the right controller at your frigate, pull the trigger, drag, let go
    const moved = await pg.evaluate(async () => { const V = __space.G.view, u = [...V.units.values()].find(u => u.side === 0 && u.type === 2), w = __space.arena.localToWorld(u.pos.clone()), c = xrDevice.controllers.right, wait = (ms) => new Promise(r => setTimeout(r, ms));
      const aim = (t) => { c.position.set(0.2, 1.3, -0.1); const d = t.clone().sub(c.position).normalize(), yaw = Math.atan2(-d.x, -d.z), pitch = Math.asin(d.y), cy = Math.cos(yaw / 2), sy = Math.sin(yaw / 2), cp = Math.cos(pitch / 2), sp = Math.sin(pitch / 2); c.quaternion.set(cy * sp, sy * cp, -sy * sp, cy * cp); };
      aim(w); await wait(600); const hov = V.hover.includes(u.id); c.updateButtonValue('trigger', 1); await wait(500); const drag = __space.hands.some(h => h.mode === 'drag'); const t = w.clone(); t.x += 0.25; aim(t); await wait(700); c.updateButtonValue('trigger', 0); await wait(600);
      const su = __space.G.sim.byId.get(u.id); return { hov, drag, k: su && su.k, sel: V.sel.has(u.id) }; });
    ok(moved.hov, 'pointing a controller at a ship rings it'); ok(moved.drag && moved.sel, 'the trigger takes hold of it'); ok(moved.k === 1, 'dragging it and letting go orders it there');
    // the right thumbstick zooms in on what is pointed at; a click on it pauses
    const zoom = await pg.evaluate(async () => { const c = xrDevice.controllers.right, wait = (ms) => new Promise(r => setTimeout(r, ms)), s0 = __space.arena.scale.x; c.updateAxes('thumbstick', 0, -1); await wait(900); c.updateAxes('thumbstick', 0, 0); const s1 = __space.arena.scale.x; c.updateButtonValue('thumbstick', 1); await wait(400); c.updateButtonValue('thumbstick', 0); await wait(300); return { s0, s1, paused: __space.G.paused, post: __space.post.valid, ar: __space.G.ar }; });
    ok(zoom.s1 > zoom.s0 * 1.15, 'the thumbstick zooms the field in'); ok(zoom.paused, 'a click of the thumbstick pauses the battle');
    await pg.evaluate(() => { __space.setPause(false); __space.setView(false); }); await pg.waitForTimeout(600); ok(await pg.evaluate(() => !__space.G.ar && !__space.G.fx && !__space.post.valid), 'open space is drawn plain and sharp unless the lens is asked for'); await pg.evaluate(() => { __space.G.fx = true; }); await pg.waitForTimeout(800); ok(await pg.evaluate(() => __space.post.valid), 'with LENS ON the headset\'s two eyes are drawn through the lens'); await pg.evaluate(() => { __space.G.fx = false; __space.post.rest(); });
    const g = await pg.evaluate(async () => { __space.guide.start(); await new Promise(r => setTimeout(r, 300)); const a = __space.guide.mesh.visible && __space.guide.i === 0; __space.guide.mark('hover'); await new Promise(r => setTimeout(r, 2400)); return { a, i: __space.guide.i }; }); ok(g.a && g.i === 1, 'the guide shows a step and moves on when you have done it');
    if (OUT) await pg.screenshot({ path: path.join(OUT, 'space-quest.png') }); await xc.close(); }
  ok(!errs.length, 'no errors on the pages' + (errs.length ? ': ' + errs.slice(0, 4).join(' | ') : ''));
  await b.close(); srv.close(); console.log(fails.length ? fails.length + ' FAILED' : 'ALL OK'); process.exit(fails.length ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
