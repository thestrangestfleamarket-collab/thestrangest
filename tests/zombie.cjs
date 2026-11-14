// THE EYES DOWN CHECK: node tests/zombie.cjs [dist/zombie.html] [folder for screenshots]. The apartment loads; meeting an eye is noticed, then hunts; looking away in time is not a hunt but they remember; hiding in the bathroom or under the covers with your eyes shut survives once, the same place twice does not; a careful player gets through whole nights to six o'clock; a careless one is caught; then the page in an emulated Quest 3 (start, walk, turn, use, shut your eyes)
const { chromium } = require('playwright'), path = require('path'), fs = require('fs');
const fails = [], ok = (c, m) => { if (!c) { fails.push(m); console.log((process.env.GITHUB_ACTIONS ? '::error title=zombie::' : 'FAIL ') + m); } else console.log('ok   ' + m); };
const PAGE = path.resolve(process.argv[2] || 'dist/zombie.html'), ROOT = path.dirname(PAGE), OUT = process.argv[3]; if (OUT) fs.mkdirSync(OUT, { recursive: true });
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.glb': 'model/gltf-binary', '.jpg': 'image/jpeg', '.mp3': 'audio/mpeg' };
const srv = require('http').createServer((q, r) => { const f = path.join(ROOT, decodeURIComponent(q.url.split('?')[0])); if (!f.startsWith(ROOT)) { r.writeHead(403); return r.end(); }
  if (q.method === 'POST') { r.writeHead(404); return r.end(); }
  fs.readFile(f, (e, d) => { if (e) { r.writeHead(404); return r.end(); } r.writeHead(200, { 'content-type': TYPES[path.extname(f)] || 'application/octet-stream' }); r.end(d); }); });
(async () => {
  // the visitors' mind on the website (worker/zombie.js), with a stand-in for Claude
  { const { ZOMBIE } = await import(path.resolve('worker/zombie.js')); let mem = null; const store = { get: async () => mem, put: async v => { mem = v; } }, sent = [];
    const fake = { messages: { create: async q => { sent.push(q); return { stop_reason: 'end_turn', content: [{ type: 'text', text: JSON.stringify({ thought: 'We think it sees us.', orders: [{ id: 'v0', spot: 'sofa', test: 'approach', thing: 'radio', say: '' }, { id: 'v9', spot: 'tub', test: 'none', say: '' }, { id: 'v1', spot: 'roof', test: 'bite', say: 'x'.repeat(200) }] }) }] }; } } };
    const r = await ZOMBIE.think({ ANTHROPIC_API_KEY: 'x' }, store, { night: 2, clock: '11:40 PM', chore: 'news', them: [{ id: 'v0', at: 'tvcorner', suspicion: .4 }, { id: 'v1', at: 'away' }], events: [{ t: 3, what: 'flinched' }], where: 'ignored' }, fake);
    ok(r.thought && r.orders.length === 2 && r.orders[0].spot === 'sofa' && r.orders[0].test === 'approach' && r.orders[0].thing === 'radio' && r.orders[1].spot === '' && r.orders[1].test === 'none' && r.orders[1].say.length <= 60, 'the mind gives each visitor a place and a test, and nothing it may not: ' + JSON.stringify(r.orders));
    ok(!JSON.stringify(sent[0].messages).includes('ignored') && sent[0].model === 'claude-haiku-5-5' && mem.n === 1, 'it is sent only what the visitors saw, by Haiku, and counted');
    mem = { day: new Date().toISOString().slice(0, 10), n: ZOMBIE.DAY }; const r2 = await ZOMBIE.think({ ANTHROPIC_API_KEY: 'x' }, store, { them: [{ id: 'v0' }] }, fake); ok(r2.why && sent.length === 1, 'after the day\'s thoughts it stops asking');
    mem = null; const sv = await ZOMBIE.save(store, { night: 4 }), sv2 = await ZOMBIE.save(store, { night: 9 }); ok(sv.night === 4 && sv2.night === 4, 'the night reached is kept, and only a real night'); }
  await new Promise(res => srv.listen(0, '127.0.0.1', res)); const FILE = 'http://127.0.0.1:' + srv.address().port + '/' + path.basename(PAGE) + '?mind=local';
  const b = await chromium.launch({ ...(process.env.PWCHROME ? { executablePath: process.env.PWCHROME } : {}), args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--autoplay-policy=no-user-gesture-required'] });
  const open = async (init, q = '') => { const pg = await b.newPage({ viewport: { width: 640, height: 400 } }), errs = [], miss = [];
    pg.on('pageerror', e => errs.push(e.message.slice(0, 300))); pg.on('response', r => { if (r.status() >= 400 && r.request().method() === 'GET') miss.push(r.url().split('/').pop()); }); pg.on('console', m => { if (m.type() === 'error' && !/404|Failed to load resource/.test(m.text())) errs.push('console: ' + m.text().slice(0, 300)); });
    if (init) await pg.addInitScript(init); await pg.goto(FILE + q, { timeout: 180000 }); await pg.waitForFunction(() => !document.getElementById('bdesk').disabled || document.getElementById('note').textContent, null, { timeout: 420000 }).catch(e => errs.push('load: ' + e.message.slice(0, 200))); return { pg, errs, miss }; };
  const t0 = Date.now(), { pg, errs, miss } = await open(), ev = (f, a) => pg.evaluate(f, a); let n = 0;
  const shot = async name => { if (!OUT) return; await ev(() => __zombie.draw(1 / 60)); await pg.screenshot({ path: path.join(OUT, String(++n).padStart(2, '0') + '-' + name + '.png'), timeout: 180000 }); };
  const up = await ev(() => !document.getElementById('bdesk').disabled && !!window.__zombie);
  ok(up, 'the page loads its pictures and models (' + ((Date.now() - t0) / 1000).toFixed(0) + ' s)'); if (!up) { console.log('it says: ' + await pg.textContent('#note').catch(() => '?') + ' ' + errs.join(' | ')); await b.close(); srv.close(); process.exit(1); }
  ok(miss.length === 0, 'every file is found' + (miss.length ? ': ' + miss.join(', ') : ''));
  await pg.click('#bdesk'); await pg.waitForTimeout(300);
  // from here the check steps the game itself and the page stops drawing; the helpers below are a player
  await ev(() => { const z = window.__zombie; z.renderer.setAnimationLoop(null); z.A.voice = false;
    const V = (x, y, zz) => new z.THREE.Vector3(x, y, zz);
    window.Z = { z, V,
      // look somewhere: a point, or down at the floor in front
      look(p) { z.look(p); }, down() { z.PL.pitch = -1.1; z.PL.jump = true; },
      // the eyes of every visitor that is in, in the world
      eyes() { const out = []; for (const C of z.THEM.list) if (C.state !== 'away') for (const e of C.eyes) out.push({ C, p: e.getWorldPosition(V()) }); return out; },
      // a careful player keeps every eye at least this far from the middle of its sight
      safe(minDeg = 14) { const fwd = z.PL.fwd, h = z.PL.head; for (const { p } of Z.eyes()) { const d = p.clone().sub(h).normalize(); if (Math.acos(Math.min(1, d.dot(fwd))) < minDeg * Math.PI / 180) return false; } return true; },
      // step the game a number of seconds, as a careful player: if an eye drifts near the middle of sight, look slowly down
      run(sec, careful = true, eyesShut = false) { for (let i = 0; i < sec * 30; i++) { z.PL.keys.Space = eyesShut; if (careful && !eyesShut && !Z.safe(12)) { z.PL.pitch = Math.max(-1.3, z.PL.pitch - .05); } z.sim(1, 1 / 30); if (z.G.mode !== 'play' && z.G.mode !== 'sleep') break; } z.PL.keys.Space = false; return z.G.mode; },
      use(id) { const U = z.ROOM.uses.find(u => u.id === id); z.PL.onUse(U); },
      at(x, zz, yaw) { z.PL.place(x, zz, yaw); z.sim(2, 1 / 30); } };
  });
  let s = await ev(() => { const z = Z.z; return { them: z.THEM.list.length, spots: Object.keys(z.ROOM.spots).length, uses: z.ROOM.uses.length, things: z.P.things.length, mode: z.G.mode, chores: z.G.chores.join() }; });
  ok(s.them === 6 && s.spots >= 14 && s.uses >= 14 && s.things > 20 && s.mode === 'play', 'six visitors, fourteen places to wait, things to use and ' + s.things + ' loose things: ' + JSON.stringify(s));
  // the rules of the eyes
  s = await ev(() => { const z = Z.z, C = z.THEM.list[0]; z.startNight(1); C.active = true; z.setSpot(C, 'tvcorner'); C.dwell = 999; C.testAt = 999; Z.at(2.6, 3.0, 0); Z.down(); z.sim(10, 1 / 30);
    const e = C.eyes[0].getWorldPosition(Z.V()); Z.look(e); const r = {}; for (let i = 0; i < 24; i++) z.sim(1, 1 / 60); r.noticed = C.noticed; r.mode1 = z.G.mode; Z.down(); for (let i = 0; i < 40; i++) z.sim(1, 1 / 60); r.mode2 = z.G.mode; r.sus = +C.sus.toFixed(2);
    Z.look(C.eyes[0].getWorldPosition(Z.V())); for (let i = 0; i < 60; i++) z.sim(1, 1 / 60); r.mode3 = z.G.mode; r.power = z.ROOM.power; return r; });
  ok(s.noticed && s.mode1 === 'play', 'a third of a second on its eyes and it notices you'); ok(s.mode2 === 'play' && s.sus > .3, 'look away in time and it does not hunt, but it remembers: ' + JSON.stringify(s)); ok(s.mode3 === 'hunt' && s.power === false, 'hold its eyes and the lights die: it hunts');
  await shot('hunted');
  s = await ev(() => { const z = Z.z; Z.at(5.6, 4.4, 0); z.ROOM.bathDoor.shut = true; z.PL.keys.Space = true; for (let i = 0; i < 30 * 14; i++) z.sim(1, 1 / 30); z.PL.keys.Space = false; return { mode: z.G.mode, power: z.ROOM.power, mem: z.G.hideMem }; });
  ok(s.mode === 'play' && s.power && s.mem === 'bathroom', 'shut in the bathroom with your eyes closed, it searches and goes: ' + JSON.stringify(s));
  s = await ev(() => { const z = Z.z, C = z.THEM.list[0]; z.ROOM.bathDoor.shut = false; z.startHunt(C, 'contact'); z.G.hideMem = 'bathroom'; Z.at(5.6, 4.4, 0); z.ROOM.bathDoor.shut = true; z.PL.keys.Space = true; for (let i = 0; i < 30 * 14 && z.G.mode === 'hunt'; i++) z.sim(1, 1 / 30); z.PL.keys.Space = false; return { mode: z.G.mode }; });
  ok(s.mode === 'dead', 'the same place twice, and it finds you');
  s = await ev(() => { const z = Z.z, C = z.THEM.list[0]; z.startNight(1); C.active = true; z.setSpot(C, 'kitchen'); z.startHunt(C, 'contact'); Z.at(6.0, 1.9, 0); Z.use('bed'); for (let i = 0; i < 30 * 14 && z.G.mode === 'hunt'; i++) z.sim(1, 1 / 30); return { mode: z.G.mode, mem: z.G.hideMem, covered: z.PL.covered }; });
  ok(s.mode === 'play' && s.mem === 'bed', 'under the covers it stands over you, and goes: ' + JSON.stringify(s));
  s = await ev(() => { const z = Z.z, C = z.THEM.list[0]; z.startNight(1); C.active = true; z.setSpot(C, 'kitchen'); z.startHunt(C, 'contact'); Z.at(3.3, 2.4, 0); for (let i = 0; i < 30 * 10 && z.G.mode === 'hunt'; i++) z.sim(1, 1 / 30); return { mode: z.G.mode }; });
  ok(s.mode === 'dead', 'standing in the open when the four seconds are up, it takes you');
  await shot('caught');
  // a whole night, played carefully: every chore, the phone, bed, and the alarm
  const night = async (N, careful) => ev(([N, careful]) => { const z = Z.z, G = z.G; z.startNight(N); for (const C of z.THEM.list) C.enterAt = Math.min(C.enterAt, 12);
    const go = { chain: [.95, 4.55, Math.PI, 'chain'], milk: [.45, 1.25, Math.PI, 'fridge'], cook: [1.15, .95, 0, 'stove'], eat: [.62, 2.65, 0, 'table'], news: [2.55, 4.35, 0, 'sofa'], dishes: [1.85, .9, 0, 'sink'], teeth: [5.75, 3.85, 0, 'basin'], alarm: [5.5, .95, 0, 'alarmclock'], coat: [1.62, 3.7, Math.PI, 'closet'] };
    const doChore = id => { const g = go[id]; Z.at(g[0], g[1], g[2]); if (careful) Z.down();
      if (id === 'milk') { Z.use('fridge'); Z.run(1, careful); z.PL.onTake(z.ROOM.milk); Z.use('fridge'); return; }
      if (id === 'coat') { Z.use('closet'); Z.run(1, careful); Z.use('closet'); return; }
      Z.use(g[3]); if (careful) Z.down(); const c = z.CHORES[id]; if (c.hold) { let k = 0; while (!G.done[id] && k++ < 60 && (G.mode === 'play')) { if (z.PL.seat === null && c.seat) { Z.use(g[3]); } if (careful) { z.PL.pitch = Math.min(z.PL.pitch, -.9); } runF(1); } } };
    // anyone puts right what was switched on or opened: walk to it, use it
    const DEVAT = { tv: [4.0, 3.9, -Math.PI / 2, 'tv'], radio: [1.0, 1.85, Math.PI / 2, 'radio'], blender: [2.28, 1.0, 0, 'blender'], fridge: [.45, 1.25, Math.PI, 'fridge'], tap: [1.85, .95, 0, 'sink'], stove: [1.15, .95, 0, 'stove'], light: [1.35, 4.5, Math.PI, 'switch'], bathlight: [4.6, 4.3, -Math.PI / 2, 'bathlight'], closet: [1.62, 3.7, Math.PI, 'closet'], bathdoor: [4.6, 3.7, -Math.PI / 2, 'bathdoor'] };
    const fix = () => { for (const id of Object.keys(G.messes)) { const g = DEVAT[id]; if (!g) continue; const back = { x: z.PL.pos.x, z: z.PL.pos.z, seat: z.PL.seat }; Z.at(g[0], g[1], g[2]); Z.down(); Z.use(g[3]); Z.run(.5, careful); if (back.seat) { z.PL.sit(back.seat); } } };
    const runF = (sec, eyes = false) => { for (let k = 0; k < sec * 2 && (G.mode === 'play' || G.mode === 'sleep'); k++) { if (careful && Object.keys(G.messes).some(id => G.t - G.messes[id].t > 4)) fix(); Z.run(.5, careful, eyes); } };
    for (let guard = 0; guard < 40 && G.mode === 'play'; guard++) { const id = G.chores.find(id => !G.done[id] && !z.CHORES[id].last && id !== 'phone' && id !== 'leave' && (!z.CHORES[id].after || G.done[z.CHORES[id].after]));
      if (G.phone.ringing) { Z.at(.55, 4.0, Math.PI / 2); Z.down(); Z.use('phone'); runF(22); continue; }
      if (id) { doChore(id); continue; }
      if (!G.done.phone) { Z.at(2.5, 3.6, 0); Z.down(); runF(4); continue; }
      break; }
    if (G.mode !== 'play') return { mode: G.mode, why: G.why, done: Object.keys(G.done).join(), min: Math.round(G.min) };
    Z.at(1.35, 4.5, Math.PI); Z.use('switch'); Z.at(6.0, 1.9, 0); Z.use('bed'); const slept = G.mode;
    for (let i = 0; i < 300 && G.mode === 'sleep'; i++) { if (G.sleep.alarm > 0) { Z.down(); Z.use('alarmclock'); } if (careful && Object.keys(G.messes).length) { fix(); Z.at(6.0, 1.9, 0); Z.use('bed'); } Z.run(.5, careful, careful && !(G.sleep.alarm > 0)); }
    if (G.mode === 'play' && G.cur === 'leave') { Z.at(6.0, 2.6, Math.PI); Z.down(); Z.run(1, careful); Z.at(1.0, 4.4, Math.PI); Z.use('chain'); Z.use('front'); }
    return { mode: G.mode, why: G.why, slept, done: Object.keys(G.done).join(), min: Math.round(G.min), flinches: G.flinches, comp: Math.round(G.composure), sus: z.THEM.list.map(C => +C.sus.toFixed(2)).join() }; }, [N, careful]);
  for (const N of [1, 3, 5]) { s = await night(N, true); ok(s.mode === 'won', 'night ' + N + ', played carefully, ends at six with every chore done: ' + JSON.stringify(s)); if (s.mode === 'won') await shot('night' + N).catch(() => {}); }
  // their tricks: put right, nothing; left running, they notice
  s = await ev(() => { const z = Z.z, C = z.THEM.list[0]; z.startNight(1); C.active = true; z.setSpot(C, 'corner'); C.dwell = 999; C.testAt = 999; Z.at(3.0, 3.0, 0); Z.down(); z.sim(5, 1 / 30);
    const r = {}; z.mess(C, 'radio'); r.on = z.ROOM.radio.on; r.spot = C.spot; Z.at(1.0, 1.85, -Math.PI / 2); Z.down(); Z.use('radio'); z.sim(30, 1 / 30); r.fixed = !Object.keys(z.G.messes).length; r.sus1 = +C.sus.toFixed(2);
    z.mess(C, 'blender'); Z.at(3.0, 3.0, 0); Z.down(); for (let i = 0; i < 30 * 40; i++) z.sim(1, 1 / 30); r.left = Object.keys(z.G.messes).join(); r.sus2 = +C.sus.toFixed(2); r.blender = z.ROOM.blender.on;
    const T = z.P.things[3], p0 = { ...T.b.translation() }; Z.at(.5, 4.4, Math.PI); z.moveThing(C); z.sim(5, 1 / 30); const p1 = T.b.translation(); r.moved = z.P.things.some(t => { const h = t.home.p, q = t.b.translation(); return Math.hypot(h.x - q.x, h.z - q.z) > .5; }); return r; });
  ok(s.on && s.fixed && s.sus1 < .1, 'they switch the radio on; you turn it off, as anyone would, and that is the end of it: ' + JSON.stringify(s));
  ok(s.blender && s.left === 'blender' && s.sus2 > s.sus1 + .3, 'leave the blender running as if you knew who did it, and they notice: ' + JSON.stringify(s)); ok(s.moved, 'they move your things');
  s = await ev(() => { const z = Z.z; z.startNight(2); for (const C of z.THEM.list) if (C.active) { z.setSpot(C, 'sofa'); C.dwell = 999; } Z.at(1.8, 3.4, 0); for (let i = 0; i < 30 * 30 && z.G.mode === 'play'; i++) { const e = Z.eyes()[0]; if (e) Z.look(e.p); z.sim(1, 1 / 30); } return { mode: z.G.mode }; });
  ok(s.mode === 'hunt' || s.mode === 'dead', 'a player who stares at them is hunted: ' + JSON.stringify(s));
  s = await ev(() => { const z = Z.z; z.startNight(1); const C = z.THEM.list[0]; C.active = true; z.setSpot(C, 'sofa'); C.dwell = 999; C.testAt = 999; Z.at(2.6, 2.4, Math.PI); z.sim(20, 1 / 30); const s0 = C.sus; z.PL.yaw += Math.PI * .9; z.sim(4, 1 / 60); return { before: +s0.toFixed(2), after: +C.sus.toFixed(2), flinches: z.G.flinches }; });
  ok(s.after > s.before && s.flinches > 0, 'turning sharply away when you see one is a flinch: ' + JSON.stringify(s));
  ok(errs.length === 0, 'no errors on the page' + (errs.length ? ': ' + errs.slice(0, 4).join(' | ') : '')); await pg.close();

  const iwer = fs.readFileSync(require.resolve('iwer/build/iwer.js'), 'utf8') + ';window.__xrd=new IWER.XRDevice(IWER.metaQuest3);window.__xrd.installRuntime({forceInstall:true});';
  const Vr = await open(iwer, '&post=0'), vr = Vr.pg, ve = (f, a) => vr.evaluate(f, a);
  ok(await ve(() => !document.getElementById('bvr').disabled), 'in a Quest 3 ENTER HEADSET is offered');
  await vr.click('#bvr', { noWaitAfter: true }); let on = false; for (let i = 0; i < 60 && !on; i++) { await vr.waitForTimeout(500); on = await ve(() => __zombie.renderer.xr.isPresenting && __zombie.G.mode === 'play'); }
  ok(on, 'ENTER HEADSET puts you in the apartment'); await vr.waitForTimeout(1500);
  s = await ve(() => ({ y: __zombie.PL.head.y, hands: __zombie.PL.hands.filter(h => h.on).length })); ok(s.y > 1.2 && s.hands === 2, 'you stand at your own height with two hands: ' + JSON.stringify(s));
  const p0 = await ve(() => ({ x: __zombie.PL.pos.x, z: __zombie.PL.pos.z, r: __zombie.rig.rotation.y })); await ve(() => __xrd.controllers.left.updateAxes('thumbstick', 0, -.9));
  await vr.waitForFunction(p => Math.hypot(__zombie.PL.pos.x - p.x, __zombie.PL.pos.z - p.z) > .3, p0, { timeout: 90000 }).catch(() => {}); await ve(() => __xrd.controllers.left.updateAxes('thumbstick', 0, 0));
  ok(await ve(p => Math.hypot(__zombie.PL.pos.x - p.x, __zombie.PL.pos.z - p.z) > .3, p0), 'the left stick walks you');
  await ve(() => __xrd.controllers.right.updateAxes('thumbstick', 1, 0)); await vr.waitForFunction(p => Math.abs(__zombie.rig.rotation.y - p.r) > .4, p0, { timeout: 60000 }).catch(() => {}); await ve(() => __xrd.controllers.right.updateAxes('thumbstick', 0, 0));
  ok(await ve(p => Math.abs(__zombie.rig.rotation.y - p.r) > .4, p0), 'the right stick turns you');
  await ve(() => __xrd.controllers.left.updateButtonValue('trigger', 1)); await vr.waitForFunction(() => __zombie.PL.eyesShut, null, { timeout: 60000 }).catch(() => {}); ok(await ve(() => __zombie.PL.eyesShut), 'the left trigger shuts your eyes'); await ve(() => __xrd.controllers.left.updateButtonValue('trigger', 0));
  await ve(() => { const z = __zombie; z.PL.place(1.0, 4.55, Math.PI); }); await vr.waitForTimeout(800); await ve(() => { __xrd.controllers.right.position.set(.2, 1.4, -.4); });
  const ch0 = await ve(() => __zombie.ROOM.chain); await ve(() => __xrd.controllers.right.updateButtonValue('trigger', 1)); await vr.waitForTimeout(800); await ve(() => __xrd.controllers.right.updateButtonValue('trigger', 0)); await vr.waitForTimeout(400);
  ok(await ve(c => __zombie.ROOM.chain !== c, ch0), 'pointing and pulling the right trigger uses what you point at (the door chain)');
  await shot.call(null, 'quest').catch(() => {}); ok(Vr.errs.length === 0, 'no errors in the headset' + (Vr.errs.length ? ': ' + Vr.errs.slice(0, 4).join(' | ') : ''));
  await b.close(); srv.close(); console.log(fails.length ? fails.length + ' FAILED' : 'ALL OK'); process.exit(fails.length ? 1 : 0);
})().catch(e => { console.log('FAIL the check itself broke: ' + e.message); process.exit(1); });
