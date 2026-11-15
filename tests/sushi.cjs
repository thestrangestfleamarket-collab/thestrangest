// YATAI '86 CHECK: node tests/sushi.cjs [dist/sushi.html] [folder for screenshots]. The cart loads with its people, the burners light, the sign opens, a customer orders, a whole bowl is built by hand through the same hand code a player uses (tare, broth, noodles, a roll sliced, toppings), served and paid, the dirty bowl cleared; a customer struck with a ladle and a passer-by hit by a thrown bowl react and the street remembers, and a passer-by waves back at the cook; then in an emulated Quest 3 a knob is touched, a bowl is taken, a ladle poured by the wrist and a log chopped, a held pot stops on the counter, a held bowl shoves a shaker aside and a throw lands where it was aimed; no page errors.
const { chromium } = require('playwright'), path = require('path'), fs = require('fs');
const fails = [], ok = (c, m) => { if (!c) { fails.push(m); console.log((process.env.GITHUB_ACTIONS ? '::error title=sushi::' : 'FAIL ') + m); } else console.log('ok   ' + m); };
const PAGE = path.resolve(process.argv[2] || 'dist/sushi.html'), ROOT = path.dirname(PAGE), OUT = process.argv[3]; if (OUT) fs.mkdirSync(OUT, { recursive: true });
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.json': 'application/json', '.webp': 'image/webp', '.fbx': 'application/octet-stream' };
const srv = require('http').createServer((q, r) => { const f = path.join(ROOT, decodeURIComponent(q.url.split('?')[0])); if (!f.startsWith(ROOT) || q.method !== 'GET') { r.writeHead(404); return r.end(); }
  fs.readFile(f, (e, d) => { if (e) { r.writeHead(404); return r.end(); } r.writeHead(200, { 'content-type': TYPES[path.extname(f)] || 'application/octet-stream' }); r.end(d); }); });
(async () => {
  await new Promise(res => srv.listen(0, '127.0.0.1', res)); const FILE = 'http://127.0.0.1:' + srv.address().port + '/' + path.basename(PAGE);
  const b = await chromium.launch({ ...(process.env.PWCHROME ? { executablePath: process.env.PWCHROME } : {}), args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--autoplay-policy=no-user-gesture-required'] });
  const errs = [], miss = [];
  const open = async (q, init) => { const p = await b.newPage({ viewport: { width: 800, height: 450 } }); if (init) await p.addInitScript(init);
    p.on('pageerror', e => errs.push(e.message.slice(0, 300))); p.on('response', r => { if (r.status() === 404 && !/talk$|hear$|say$|opacity_color|\/film\//.test(r.url())) miss.push(r.url().split('/').pop()); });
    await p.goto(FILE + q); await p.waitForFunction('window.G && G.debug', null, { timeout: 240000 }); await p.waitForTimeout(3000); return p; };
  const p = await open('?desktop&nopost');
  ok(await p.evaluate(() => G.mode === 'desktop' && G.debug.PH.ready), 'the cart loads on a screen, its loose things on the physics engine');
  { const f = await p.evaluate(() => { const L = []; G.scene.traverse((o) => { if (o.isLight) L.push(o); }); let worst = 0, who = ''; const was = L.map((l) => l.intensity); G.frozen = true;
      for (let i = 0; i < 60; i++) { G.debug.tick(1 / 20); L.forEach((l, j) => { const a = was[j], b = l.intensity, d = Math.abs(b - a) / Math.max(0.05, a, b); if (d > worst) { worst = d; who = l.type + ' ' + (l.color && l.color.getHexString()); } was[j] = b; }); }
      G.frozen = false; return { worst: +worst.toFixed(3), who, easy: !!(G.set && G.set.easy), fill: G.city ? null : null }; });
    ok(f.worst < 0.05 && f.easy, 'easy on the eyes: on from the start, and no light flickers (largest change between frames ' + f.worst + (f.who ? ', ' + f.who : '') + ')'); }
  ok(await p.evaluate(() => G.game.customers.length === 0 && G.cart.pots.length === 3 && Object.keys(G.cart.bins).length === 7), 'three pots, seven bins, nobody yet');
  const log = await p.evaluate(async () => {
    const log = []; const L = (...a) => log.push(a.join(' '));
    G.frozen = true; Math.random = (() => { let s = 7; return () => { s = (s * 16807) % 2147483647; return s / 2147483647; }; })();
    const h = G.desk.hand, T3 = G.debug.THREE, V = (x, y, z) => new T3.Vector3(x, y, z);
    const step = (n = 1) => { for (let i = 0; i < n; i++) { G.scene.updateMatrixWorld(); G.debug.tick(1 / 60); } };
    const stand = (x, z) => { G.rig.position.set(x, 0, z); };
    const aim = (pt) => { const c = V(G.rig.position.x, 1.62, G.rig.position.z), d = pt.clone().sub(c); G.desk.yaw = Math.atan2(-d.x, -d.z); G.desk.pitch = Math.atan2(d.y, Math.hypot(d.x, d.z)); step(3); };
    const click = () => { h.grip = true; step(2); h.grip = false; step(2); };
    const use = (sec = 0.7) => { h.use = true; step(Math.round(sec * 60)); h.use = false; step(25); };
    const C = G.cart, game = G.game;
    try {
    // 1 burners
    stand(-0.2, 0.4);
    for (const pot of C.pots) { aim(V(-0.665, 0.7, pot.z)); L('aim knob', h.aim.button?.name); click(); }
    L('pots on:', C.pots.map((p) => p.on));
    // 2 open
    stand(0.3, 0.2); const sw = G.buttons.find((b) => b.name.startsWith('OPEN')); aim(sw.getPos().clone()); L('aim sw', h.aim.button?.name); click(); L('state', game.state, 'open', C.open);
    step(60 * 22); L('heat', C.pots.map((p) => p.heat.toFixed(2)), 'customers', game.customers.length, game.customers.map((c) => c.state));
    let c = game.customers.find((c) => c.state === 'waiting'); let guard = 0; while (!c && guard++ < 40) { step(60); c = game.customers.find((c) => c.state === 'waiting'); }
    const o = c.order; L('ORDER seat', c.seat, o.key, JSON.stringify(o.tops), o.mods.join(';'), 'drink', o.drink, 'firm', o.firm);
    // 3 bowl to mat
    stand(0.45, 0.25); aim(V(0.93, 1.0, -0.36)); L('cand', h.aim.cand?.name); click(); L('held', h.held?.kind);
    stand(-0.2, 0.25); const spot = V(-0.3, 0.905, -0.26); aim(spot); click(); step(40);
    const bowl = G.items.find((i) => i.kind === 'bowl'); L('bowl at', bowl.obj.position.toArray().map((v) => v.toFixed(2)), 'free', bowl.free);
    const bc = () => bowl.obj.position.clone().setY(bowl.obj.position.y + 0.03);
    // 4 tare
    const tl = G.items.find((i) => i.kind === 'ladle' && i.mode === 'tare' && i.type === o.recipe.tare);
    aim(tl.obj.position.clone()); L('cand', h.aim.cand?.name); click(); L('held', h.held?.name, 'filled', h.held?.filled);
    aim(bc()); step(10); use(0.8); L('bowl tare', bowl.tare); click(); step(60); L('ladle home', tl.atHome, 'filled', tl.filled);
    // 5 broth x2
    const bl = C.brothLadles.find((l) => l.vessel.type === o.recipe.broth);
    for (let k = 0; k < 2; k++) { stand(-0.3, 0.45); aim(bl.obj.position.clone()); click(); if (!h.held) L('!! no ladle, cand', h.aim.cand?.name); stand(-0.2, 0.25); aim(bc()); step(10); use(0.8); click(); step(70); }
    L('bowl broth', bowl.brothType, bowl.broth, 'temp', bowl.temp.toFixed(2));
    // 6 noodles
    stand(-0.3, 0.3); aim(V(-0.93, 0.93, -0.36)); L('cand', h.aim.cand?.name); click(); L('held', h.held?.name);
    const bk = C.baskets[0]; aim(bk.point(bk.cup, V(0, 0, 0)).clone()); click(); L('basket noodles', JSON.stringify(bk.noodles));
    step(60 * (o.firm ? 11 : 17)); L('cook', bk.noodles.cook.toFixed(1));
    aim(bk.obj.position.clone()); click(); L('held', h.held?.name); stand(-0.2, 0.25); aim(bc()); step(10); use(0.8); click(); step(60);
    L('bowl noodles', JSON.stringify(bowl.noodles), 'basket home', bk.atHome);
    // 7 prep: slice chashu
    stand(0.35, 0.3); aim(V(0.925, 0.94, -0.02)); L('cand', h.aim.cand?.name); click(); L('held', h.held?.name);
    aim(V(C.board.x - 0.03, C.board.y, C.board.z)); click(); step(20); L('board item', C.board.item?.raw);
    aim(C.knife.obj.position.clone()); L('cand', h.aim.cand?.name); click(); L('held', h.held?.name);
    aim(V(C.board.x - 0.06, C.board.y + 0.08, C.board.z)); step(10); for (let k = 0; k < 3; k++) use(0.1);
    L('raw left', C.board.item?.left, 'slices on board', G.items.filter((i) => i.kind === 'food' && i.topping === 'chashu').length); click(); step(60);
    const sl = G.items.find((i) => i.kind === 'food' && i.topping === 'chashu'); aim(sl.obj.position.clone()); L('cand', h.aim.cand?.name); click(); const st0 = C.bins.chashu.stock; aim(V(C.bins.chashu.x, 0.95, C.bins.chashu.z)); click(); L('bin stock', st0, '->', C.bins.chashu.stock);
    // 8 toppings
    for (const [t, n] of Object.entries(o.tops)) for (let k = 0; k < n; k++) { const bin = C.bins[t]; stand(0.1, 0.25); aim(V(bin.x, 0.95, bin.z)); click(); if (!h.held) L('!! no topping', t, h.aim.cand?.name); stand(-0.2, 0.25); aim(bc()); click(); step(5); }
    step(40); L('bowl toppings', bowl.toppings.join(','));
    // 9 drink + serve
    const sx = [-0.72, 0, 0.72][c.seat];
    if (o.drink) { stand(0.4, 0.6); aim(V(0.935, 1.1, 0.68 + (o.drink === 'beer' ? -0.055 : 0.055))); L('cand', h.aim.cand?.name); click(); L('held', h.held?.name); stand(sx * 0.6, 0.02); aim(V(sx, 1.0, -0.71)); click(); L('gotDrink', c.gotDrink); }
    stand(-0.2, 0.25); aim(bc()); L('cand', h.aim.cand?.name); click(); L('held', h.held?.kind);
    stand(sx * 0.6, 0.02); aim(V(sx, 1.0, -0.71)); click(); step(5);
    L('state', c.state, 'RESULT', JSON.stringify(c.result));
    step(60 * 17); L('money', game.money, 'tips', game.tips, 'served', game.served, 'seat dirty', !!game.seats[c.seat].dirty, 'bowl dirty', bowl.dirty);
    aim(bowl.obj.position.clone().setY(1.04)); click(); L('held', h.held?.kind); stand(0.4, 0.7); aim(V(0.935, 0.98, 0.91)); click(); step(5); L('bowl removed', bowl.dead, 'seat dirty', !!game.seats[c.seat].dirty);
    L('items', G.items.length, 'customers', game.customers.map((c) => c.state));
    } catch (e) { L('EXC', e.stack); }
    return log;
  });
  const L = log.join('\n'), has = (re, m) => ok(re.test(L), m + (re.test(L) ? '' : '  [' + (L.match(/EXC.*/) || [''])[0].slice(0, 200) + ']'));
  if (process.env.SUSHI_LOG) console.log(L);
  has(/pots on: true,true,true/, 'each knob lights its burner'); has(/state open open true/, 'the switch opens the cart'); has(/ORDER seat \d shoyu/, 'the first customer of night one orders plain shoyu');
  has(/bowl tare shoyu/, 'a tare ladle tips into the bowl'); has(/bowl broth chicken (2|1\.[89]\d*) temp 0\.9/, 'two ladles of hot broth, poured'); has(/bowl noodles \{"cook":1[4-9]/, 'noodles boiled into the green and tipped in');
  has(/raw left 5 slices on board 3/, 'three chops, three slices on the board'); has(/bin stock 8 -> 9/, 'a slice restocks its bin'); has(/bowl toppings chashu,chashu,menma,negi,nori,naruto/, 'every topping lands in the bowl');
  has(/RESULT \{"score":100/, 'served as ordered: 100'); has(/money 450 tips \d+ served 1 seat dirty true/, 'they eat, pay and tip, and leave a dirty bowl'); has(/bowl removed true seat dirty false/, 'the bus tub clears the seat'); ok(!/EXC/.test(L), 'the order ran through');
  const phys = await p.evaluate(() => { const T = G.debug.THREE, C = G.cart, pot = C.pots[2], it = pot.item, hand = { pos: new T.Vector3(), vs: new T.Vector3(), vel: new T.Vector3() }, step = (n) => { for (let i = 0; i < n; i++) G.debug.tick(1 / 60); }, l0 = pot.level;
    it.held = hand; for (let i = 0; i < 40; i++) { it.obj.position.set(-0.4, 1.3, 0.3); it.obj.quaternion.setFromAxisAngle(new T.Vector3(0, 0, -1), 1.5); step(1); } const spilt = pot.level < l0 - 0.05, off = !pot.on;
    it.obj.quaternion.identity(); it.obj.position.set(-0.93, 0.95, 0.79); it.held = null; it.drop(); step(120); const back = pot.on && Math.abs(it.obj.position.y - 0.86) < 0.03;
    G.fx.splat(new T.Vector3(0, 0.9, -0.3), 0xc99a3c, 0.08); const s0 = G.fx.splats.length, rag = C.rag; rag.held = hand; rag.onGrab(); for (let i = 0; i < 120; i++) { hand.pos.set(Math.sin(i * 0.3) * 0.08, 0.93, -0.3); hand.vs.set(0.5, 0, 0); step(1); } rag.held = null; rag.drop();
    return { props: G.items.filter((x) => x.kind === 'prop').length, spilt, off, back, wiped: G.fx.splats.length < s0 }; });
  ok(phys.props > 15 && phys.spilt && phys.off && phys.back, 'a pot lifts off its burner, spills when tipped, and heats again set back down'); ok(phys.wiped, 'the rag wipes a spill off the counter');
  const blk = await p.evaluate(() => { const B = G.block; let moved = 0, seen = 0; const x0 = B.people.map((h) => h.p.root.position.x); for (let i = 0; i < 20 * 150; i++) { G.debug.tick(1 / 20); seen = Math.max(seen, B.people.filter((h) => h.p.root.visible).length); } B.people.forEach((h, i) => { if (Math.abs(h.p.root.position.x - x0[i]) > 1 || h.taken) moved++; }); const h = B.take(), named = !!(h && h.p.cast.name && B.story(h.def).includes(' is ')); if (h) B.give(h); return { n: B.people.length, moved, seen, named, ok: B.people.every((q) => isFinite(q.p.root.position.x)) }; });
  ok(blk.n === 10 && blk.moved >= 3 && blk.seen >= 2 && blk.named && blk.ok, 'the block has its ten regulars, about their night, and one of them can come to the cart as themself');
  const hurt = await p.evaluate(() => { const T = G.debug.THREE, V = (x, y, z) => new T.Vector3(x, y, z), step = (n) => { for (let i = 0; i < n; i++) { G.scene.updateMatrixWorld(); G.debug.tick(1 / 60); } }, game = G.game, B = G.block, out = {};
    G.talk.live = false; G.talk.tts = false; if (game.state !== 'open') game.toggleOpen(); const c = game.customers.find((x) => x.state === 'waiting' || x.state === 'eating') || game.forceSpawn(); let g = 0; while (c.state !== 'waiting' && c.state !== 'eating' && g++ < 2400) step(1);
    const torso = (P) => P.bones.find((b) => b.name === 'torso').quaternion.clone(), H = c.p.bones.find((b) => b.name === 'head').getWorldPosition(V(0, 0, 0)), q0 = torso(c.p), h = G.hands[0], ladle = G.items.find((i) => i.kind === 'ladle'), n0 = G.react.log.length;
    h.active = true; h.held = ladle; for (let i = 0; i < 12; i++) { const at = H.clone().add(V(0.04, 0, 0.4 - i * 0.05)); h.pos.copy(at); h.vs.set(0, 0, -3); ladle.obj.position.copy(at).sub(ladle.center.clone().applyQuaternion(ladle.obj.quaternion)); step(1); if (i === 9) out.lean = q0.angleTo(torso(c.p)); }
    h.active = false; h.held = null; step(10); const e = G.react.log[n0]; out.cust = { seated: e && e.seated, kind: e && e.kind, gone: c.state === 'leaving', said: G.talk.last && G.talk.last.who, cop: !!B.by.denise.cop || B.by.denise.taken };
    game.spawnT = 999; const free = () => B.people.find((x) => !x.taken && x.def.id !== 'denise' && !B.mad[x.def.id]), park = (x, at) => { x.hidden = false; x.lead = null; x.crew.length = 0; x.chat = null; x.greet = null; x.step = 'stand'; x.t = 60; x.p.root.position.copy(at); };
    const pb = free(); park(pb, V(1.2, 0, -2.6)); pb.p.root.rotation.y = Math.PI; step(5); const ch = pb.p.bones.find((b) => b.name === 'torso').getWorldPosition(V(0, 0, 0)), bw = new G.debug.Items.Bowl(); bw.obj.position.set(ch.x, ch.y + 0.1, ch.z + 1); bw.drop(V(0, 0.3, -6));
    let down = false; for (let i = 0; i < 60; i++) { step(1); down = down || pb.p.down(); } const e2 = G.react.log[G.react.log.length - 1]; out.pass = { who: e2 && e2.who === pb.def.name, seated: e2 && e2.seated, down, mad: !!B.mad[pb.def.id] }; step(60 * 5); out.pass.up = !pb.p.down() && !pb.p.reeling();
    let back = false; for (let k = 0; k < 10; k++) { const t = B.take(); if (!t) break; back = back || t === pb; B.give(t); } out.pass.notBack = !back;
    const pw = free(); park(pw, V(-1.6, 0, -2.7)); for (const o of B.people) if (o !== pw && !o.taken) o.p.root.position.x += 40; step(5); G.talk.last = null; game.onWave(); out.wave = { greet: !!pw.greet }; step(50); out.wave.waving = pw.p.waveT > 0; out.wave.said = G.talk.last && G.talk.last.who === pw.def.name;
    const cam = G.camera.getWorldPosition(V(0, 0, 0)); out.wave.faces = Math.abs(Math.atan2(Math.sin(pw.p.root.rotation.y - Math.atan2(cam.x - pw.p.root.position.x, cam.z - pw.p.root.position.z)), Math.cos(pw.p.root.rotation.y - Math.atan2(cam.x - pw.p.root.position.x, cam.z - pw.p.root.position.z)))) < 0.5;
    return out; });
  ok(hurt.lean > 0.05 && hurt.cust.seated && hurt.cust.kind === 'thing' && hurt.cust.gone && hurt.cust.said && hurt.cust.cop, 'a seated customer struck with a held ladle lurches, says so, leaves unpaid, and the beat cop comes over (' + JSON.stringify(hurt.cust) + ')');
  ok(hurt.pass.who && !hurt.pass.seated && hurt.pass.down && hurt.pass.up && hurt.pass.mad && hurt.pass.notBack, 'a passer-by hit by a thrown bowl is knocked down, gets up, and will not come to the cart tonight (' + JSON.stringify(hurt.pass) + ')');
  ok(hurt.wave.greet && hurt.wave.waving && hurt.wave.said && hurt.wave.faces, 'a passer-by turns to a wave from the cook, waves back and says something (' + JSON.stringify(hurt.wave) + ')');
  ok(await p.evaluate(() => !!G.debug.city.alley && !!G.debug.city.rain && G.debug.city.shops.length >= 5), 'the cart stands in the alley, in the rain, with its back doors');
  const tvc = await p.evaluate(() => { const t = G.tv, b = (n) => G.buttons.find((x) => x.name === n), c0 = t.ch.ch; b('TV channel').press(); const c1 = t.ch.ch; b('TV power').press(); const off = !t.on; b('TV power').press(); for (let i = 0; i < 10; i++) G.debug.tick(1 / 30); return { sets: t.tubes.reduce((a, q) => a + q.sets.length, 0), changed: c0 !== c1, off, on: t.on, chans: t.channels.length }; });
  ok(tvc.sets >= 1 && tvc.changed && tvc.off && tvc.on && tvc.chans >= 5, 'the cart has a television: its knobs change the channel and switch it off and on');
  const rtv = await p.evaluate(async () => { for (let i = 0; i < 100 && !(G.tv.models >= 1 && G.cart.radio); i++) await new Promise((r) => setTimeout(r, 200)); const names = G.tv.channels.map((c) => c.name), a = G.audio, was = a.label(); a.setRadio(true); const l0 = a.label(); a.tune(); const l1 = a.label(); return { films: names.includes('THE LATE MOVIE') && names.includes('CLASSIC TV'), models: G.tv.models + !!G.cart.radio, n: a.stations, l0, l1, was }; });
  ok(rtv.films && rtv.models >= 2 && rtv.n >= 4 && rtv.n <= 8 && rtv.l0 !== rtv.l1 && /WBGO|WWOZ|WNYC|WQXR|SomaFM|TAPE/.test(rtv.l0 + rtv.l1), 'the TV and boombox are real models, the TV has the late movie and classic TV, the radio tunes real stations (' + rtv.l0 + ' > ' + rtv.l1 + ')');
  ok(await p.evaluate(() => document.querySelectorAll('canvas').length === 1 && G.renderer.info.memory.geometries > 60 && G.baked > 100), 'the street is drawn, its still parts baked together');
  if (OUT) await p.screenshot({ path: path.join(OUT, '01-cart.png'), timeout: 120000 }).catch(() => {});
  await p.close();
  // an emulated Quest 3 with controllers
  const iwer = fs.readFileSync(require.resolve('iwer/build/iwer.js'), 'utf8') + ';window.__xrd=new IWER.XRDevice(IWER.metaQuest3);window.__xrd.installRuntime({forceInstall:true});';
  const v = await open('?nopost', iwer); if (OUT) await v.exposeFunction('__shot', (n) => v.screenshot({ path: path.join(OUT, n + '.png'), timeout: 120000 }).catch(() => {}));
  const vr = await v.evaluate(async () => {
    const T3 = G.debug.THREE, V = (x, y, z) => new T3.Vector3(x, y, z), Q = T3.Quaternion, xr = window.__xrd, out = {}; G.renderer.shadowMap.enabled = false;
    const frames = n => new Promise(res => { const t0 = G.t, iv = setInterval(() => { if (G.t - t0 >= n * 0.049) { clearInterval(iv); res(); } }, 50); });
    const ctl = h => xr.controllers[h], put = (h, w, q) => { const l = w.clone(); G.rig.worldToLocal(l); ctl(h).position.set(l.x, l.y, l.z); if (q) ctl(h).quaternion.set(q.x, q.y, q.z, q.w); }, H = h => G.hands.find(x => x.source && x.source.handedness === h);
    await G.debug.startVR(); await frames(6); out.presenting = G.renderer.xr.isPresenting; out.hands = !!(H('left') && H('right'));
    put('right', V(0.22, 1.12, -0.05), new Q()); put('left', V(-0.22, 1.12, -0.05), new Q()); await frames(5); { const P = G.cook && G.cook.P, d = (s) => { const h = H(s === 'R' ? 'right' : 'left'); return P && h ? P.bones.find((b) => b.name === 'hand' + s).getWorldPosition(V(0, 0, 0)).distanceTo(h.models[s].root.position) : 9; }; out.cook = { on: !!(G.cook && G.cook.on), L: +d('L').toFixed(3), R: +d('R').toFixed(3), sleeves: H('right').arm.up.visible }; }
    const pot = G.cart.pots[0]; put('left', V(-0.6, 0.7, pot.z), new Q().setFromAxisAngle(V(0, 1, 0), Math.PI / 2)); await frames(3); put('left', V(-0.588, 0.7, pot.z)); await frames(3); out.knob = pot.on;
    put('right', V(0.93, 1.06, -0.36), new Q()); await frames(3); ctl('right').updateButtonValue('squeeze', 1); await frames(3); out.took = H('right').held && H('right').held.kind;
    put('right', V(-0.3, 1.0, -0.26)); await frames(4); ctl('right').updateButtonValue('squeeze', 0); await frames(24); const bowl = G.items.find(i => i.kind === 'bowl'); out.rest = !bowl.free && Math.abs(bowl.obj.position.y - 0.9) < 0.02;
    const tl = G.items.find(i => i.kind === 'ladle' && i.mode === 'tare' && i.type === 'shoyu'); put('right', tl.obj.position.clone()); await frames(3); ctl('right').updateButtonValue('squeeze', 1); await frames(3);
    const roll = new Q().setFromAxisAngle(V(0, 0, 1), 1.4); const aim = bowl.obj.position.clone().add(V(0, 0.22, 0)).sub(tl.cup.clone().applyQuaternion(roll)); put('right', aim, roll); for (let i = 0; i < 30 && !bowl.tare; i++) await frames(1); out.tare = bowl.tare;   // (a held thing is driven to the hand, not teleported: it takes a moment to cross half a metre)
    out.dbg = { held: H('right').held && H('right').held.name, gap: +tl.obj.position.distanceTo(bowl.obj.position).toFixed(3), amt: bowl.tareAmt || 0, ly: +tl.obj.position.y.toFixed(3), by: +bowl.obj.position.y.toFixed(3), tilt: +(tl.obj.up ? 0 : 0) }; ctl('right').updateButtonValue('squeeze', 0); await frames(20); out.home = tl.atHome && tl.filled;
    const C = G.cart, raw = new G.debug.Items.Raw('naruto'); G.targets.find(t => t.accepts(raw)).receive(raw); put('right', C.knife.obj.position.clone(), new Q()); await frames(3); ctl('right').updateButtonValue('squeeze', 1); await frames(3);
    const up = V(C.board.x - 0.05, C.board.y + 0.2, C.board.z).sub(C.knife.blade), dn = V(C.board.x - 0.05, C.board.y + 0.03, C.board.z).sub(C.knife.blade); const near = async (t) => { for (let k = 0; k < 12; k++) { await frames(1); if (C.knife.obj.position.clone().add(C.knife.blade).distanceTo(t.clone().add(C.knife.blade)) < 0.03) break; } };   // (a held knife is driven to the hand: each stroke waits for it)
    for (let i = 0; i < 3; i++) { put('right', up); await near(up); put('right', dn); await near(dn); await frames(1); } out.left = raw.left;
    ctl('right').updateButtonValue('squeeze', 0); await frames(10);
    { // a held pot is a body: pushed into the counter it stays on top of it, the hand stays on its handle and a ghost shows where the real hand is
      const pot = G.cart.pots[2], it = pot.item, hd = it.handles.map(l => l.clone().applyQuaternion(it.obj.quaternion).add(it.obj.position)).sort((a, b) => a.z - b.z)[0], L = H('left'); bowl.remove();
      put('left', hd, new Q()); await frames(3); ctl('left').updateButtonValue('squeeze', 1); await frames(3); const took = L.held === it;
      const off = hd.clone().sub(it.obj.position), over = V(-0.05, 0.9, -0.33); put('left', over.clone().add(off).setY(1.25)); await frames(4);
      let low = 9; for (const y of [0.98, 0.9, 0.82, 0.76, 0.76, 0.76]) { put('left', over.clone().add(off).setY(y + off.y)); await frames(2); low = Math.min(low, it.obj.position.y); }
      out.pot = { took, low: +low.toFixed(3), ghost: L.gs === 1 && L.ga > 0.1 && L.ghosts.L.root.visible, gap: +L.ghosts.L.root.position.distanceTo(L.models.L.root.position).toFixed(3) };
      if (window.__shot) { const q0 = xr.quaternion.clone(); xr.quaternion.set(-0.38, 0, 0, 0.925); await frames(2); await window.__shot('02-held-pot'); xr.quaternion.copy(q0); await frames(2); }
      put('left', over.clone().add(off).setY(1.05)); await frames(4); put('left', hd.clone().setY(hd.y + 0.02)); await frames(4); ctl('left').updateButtonValue('squeeze', 0); await frames(12); out.pot.back = pot.on || !G.cart.burners[2].on; }
    { // a held bowl shoves a loose shaker along the counter instead of passing through it
      put('right', V(0.93, 1.06, -0.36), new Q()); await frames(3); ctl('right').updateButtonValue('squeeze', 1); await frames(3); const R = H('right'), bw = R.held;
      const sh = G.items.find(i => i.name === 'shichimi shaker'); sh.obj.position.set(-0.2, 0.9, -0.28); sh.obj.quaternion.identity(); await frames(3); const s0 = sh.obj.position.clone(), off = V(0.93, 1.06, -0.36).sub(bw.obj.position);
      for (let x = -0.45; x <= 0.0; x += 0.03) { put('right', V(x, 0.905, -0.28).add(off)); await frames(2); }
      await frames(10); const d = sh.obj.position.clone().sub(s0), bx = bw.obj.position;
      out.shove = { bowl: bw && bw.kind, moved: +d.x.toFixed(3), apart: +Math.hypot(sh.obj.position.x - bx.x, sh.obj.position.z - bx.z).toFixed(3), up: sh.obj.position.y > 0.85 };
      put('right', V(0.4, 1.1, -0.3)); await frames(4); ctl('right').updateButtonValue('squeeze', 0); await frames(10); }
    { // a throw: the controller swings at a known speed and lets go; the thing lands where that swing aims it
      const R = H('right'), raw = new G.debug.Items.Raw('naruto'), p0 = V(0.05, 1.1, 0.2), vel = V(0.2, 0.6, 1.2), ses = G.renderer.xr.getSession(); put('right', p0, new Q()); await frames(3);
      raw.obj.position.copy(R.pos).sub(raw.center); await frames(1); ctl('right').updateButtonValue('squeeze', 1); await frames(3); const took = R.held === raw;
      const rel = raw.worldCenter(V(0, 0, 0)).sub(R.pos); let t0 = null, n = 0, at = null, land = null;
      await new Promise(res => { const f = () => { if (t0 === null) t0 = G.t; const t = G.t - t0; n++; if (n <= 12) put('right', p0.clone().addScaledVector(vel, t)); if (n === 9) ctl('right').updateButtonValue('squeeze', 0);
        if (!raw.held && !at && n > 9) at = raw.worldCenter(V(0, 0, 0)); if (at && !land && raw.worldCenter(V(0, 0, 0)).y < 0.15) land = raw.worldCenter(V(0, 0, 0)); if (land || raw.dead || n > 120) return res(); ses.requestAnimationFrame(f); }; ses.requestAnimationFrame(f); });
      let aim = null; if (at) { const vy = vel.y - 9.81 * 0.05, h = at.y - 0.15, T = (vy + Math.sqrt(vy * vy + 2 * 9.81 * h)) / 9.81; aim = V(at.x + vel.x * T, 0.15, at.z + vel.z * T); }
      out.toss = { took, flew: land && at ? +Math.hypot(land.x - at.x, land.z - at.z).toFixed(2) : 0, miss: land && aim ? +Math.hypot(land.x - aim.x, land.z - aim.z).toFixed(3) : 9 }; }
    const x0 = G.rig.position.x; ctl('left').updateAxis('thumbstick', 'x-axis', 1); await frames(6); ctl('left').updateAxis('thumbstick', 'x-axis', 0); out.moved = G.rig.position.x > x0 + 0.05;
    return out; });
  ok(vr.presenting && vr.hands, 'in the headset: a session with both controllers'); ok(vr.knob, 'a controller tip turns a burner knob'); ok(vr.took === 'bowl' && vr.rest, 'grip takes a bowl from the stack; let go, it comes to rest on the counter');
  ok(vr.cook.on && vr.cook.L < 0.05 && vr.cook.R < 0.05 && !vr.cook.sleeves, 'in the headset you are the carving chef: its arms reach your own wrists (' + JSON.stringify(vr.cook) + ')');
  ok(vr.tare === 'shoyu' && vr.home, 'a roll of the wrist pours the tare; the ladle flies home and refills (' + JSON.stringify([vr.tare, vr.home, vr.dbg]) + ')'); ok(vr.left === 7, 'the knife chops by its own motion (' + vr.left + ' of 10 left)'); ok(vr.moved, 'the left stick steps along the cart');
  ok(vr.pot.took && vr.pot.low > 0.885 && vr.pot.ghost && vr.pot.gap > 0.08 && vr.pot.back, 'a pot taken by its handle and pushed down into the counter stays on top of it; a faint ghost shows the real hand (' + JSON.stringify(vr.pot) + ')');
  ok(vr.shove.bowl === 'bowl' && vr.shove.moved > 0.08 && vr.shove.apart > 0.08 && vr.shove.up, 'a held bowl shoves a loose shaker aside instead of passing through it (' + JSON.stringify(vr.shove) + ')');
  ok(vr.toss.took && vr.toss.flew > 0.4 && vr.toss.miss < 0.2, 'a throw lands where the swing aimed it (' + JSON.stringify(vr.toss) + ')');
  ok(!miss.length, 'nothing missing' + (miss.length ? ': ' + [...new Set(miss)].slice(0, 6).join(', ') : '')); ok(!errs.length, 'no page errors' + (errs.length ? ': ' + errs.slice(0, 3).join(' | ') : ''));
  await b.close(); srv.close(); console.log(fails.length ? fails.length + ' FAILED' : 'YATAI \'86 passes'); process.exit(fails.length ? 1 : 0);
})();
