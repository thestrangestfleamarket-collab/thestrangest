// RAMEN CHECK: node tests/sushi.cjs [dist/ramen.html] [folder for screenshots]. The cart loads with its people, the burners light, the sign opens, a customer orders, a whole bowl is built by hand through the same hand code a player uses (tare, broth, noodles, a roll sliced, toppings), served and paid, the dirty bowl cleared; a customer struck with a ladle and a passer-by hit by a thrown bowl react and the street remembers, and a passer-by waves back at the cook; then in an emulated Quest 3 a knob is touched, a bowl is taken, a ladle poured by the wrist and a log chopped, a held pot stops on the counter, a held bowl shoves a shaker aside and a throw lands where it was aimed; no page errors.
const { chromium } = require('playwright'), path = require('path'), fs = require('fs');
const fails = [], ok = (c, m) => { if (!c) { fails.push(m); console.log((process.env.GITHUB_ACTIONS ? '::error title=sushi::' : 'FAIL ') + m); } else console.log('ok   ' + m); };
const PAGE = path.resolve(process.argv[2] || 'dist/ramen.html'), ROOT = path.dirname(PAGE), OUT = process.argv[3]; if (OUT) fs.mkdirSync(OUT, { recursive: true });
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.json': 'application/json', '.webp': 'image/webp', '.fbx': 'application/octet-stream' };
const srv = require('http').createServer((q, r) => { const f = path.join(ROOT, decodeURIComponent(q.url.split('?')[0])); if (!f.startsWith(ROOT) || q.method !== 'GET') { r.writeHead(404); return r.end(); }
  fs.readFile(f, (e, d) => { if (e) { r.writeHead(404); return r.end(); } r.writeHead(200, { 'content-type': TYPES[path.extname(f)] || 'application/octet-stream' }); r.end(d); }); });
(async () => {
  await new Promise(res => srv.listen(0, '127.0.0.1', res)); const FILE = 'http://127.0.0.1:' + srv.address().port + '/' + path.basename(PAGE);
  const b = await chromium.launch({ ...(process.env.PWCHROME ? { executablePath: process.env.PWCHROME } : {}), args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--autoplay-policy=no-user-gesture-required'] });
  const errs = [], miss = [];
  const open = async (q, init) => { const p = await b.newPage({ viewport: { width: 800, height: 450 } }); if (init) await p.addInitScript(init);
    p.on('pageerror', e => errs.push(e.message.slice(0, 300))); p.on('response', r => { if (r.status() === 404 && !/talk$|hear$|say$|log$|mind$|opacity_color|\/film\//.test(r.url())) miss.push(r.url().split('/').pop()); });
    await p.goto(FILE + q); await p.waitForFunction('window.G && G.debug', null, { timeout: 240000 }); await p.waitForTimeout(3000); return p; };
  const p = await open('?desktop&nopost'); await p.waitForFunction('G.till && G.till.ready', null, { timeout: 180000 }).catch(() => console.log('the register model did not load'));
  ok(await p.evaluate(() => G.mode === 'desktop' && G.debug.PH.ready), 'the cart loads on a screen, its loose things on the physics engine');
  { const f = await p.evaluate(() => { const L = []; G.scene.traverse((o) => { if (o.isLight) L.push(o); }); let worst = 0, who = ''; const was = L.map((l) => l.intensity); G.frozen = true;
      for (let i = 0; i < 60; i++) { G.debug.tick(1 / 20); L.forEach((l, j) => { const a = was[j], b = l.intensity, d = Math.abs(b - a) / Math.max(0.05, a, b); if (d > worst) { worst = d; who = l.type + ' ' + (l.color && l.color.getHexString()); } was[j] = b; }); }
      G.frozen = false; return { worst: +worst.toFixed(3), who, easy: !!(G.set && G.set.easy), fill: G.city ? null : null }; });
    ok(f.worst < 0.05 && f.easy, 'easy on the eyes: on from the start, and no light flickers (largest change between frames ' + f.worst + (f.who ? ', ' + f.who : '') + ')'); }
  ok(await p.evaluate(() => G.game.customers.length === 0 && G.cart.pots.length === 3 && Object.keys(G.cart.bins).length === 7), 'three pots, seven bins, nobody yet');
  { // the recorded sounds, every source through one chain: quieter and duller with distance, wetter with it, muffled behind the counter; things sound as what they are made of
    await p.waitForFunction('G.audio.ready && G.audio.loaded + (G.audio.missing || 0) >= 31', null, { timeout: 90000 }).catch(() => { });
    const a = await p.evaluate(() => { const A = G.audio, V = G.debug.THREE.Vector3; A.earAt = new V(0, 1.6, 0.4);
      const at = (p) => { const e = A.spatial('item', p), o = { g: +e.dist.gain.value.toFixed(3), f: Math.round(e.air.frequency.value), s: +e.send.gain.value.toFixed(3) }; e.free(); return o; };
      const far = [1, 4, 12, 30].map((m) => at(new V(0, 1.6, 0.4 - m))), behind = at(new V(0, 0.3, -0.9)), over = at(new V(0, 1.2, -0.9)); A.earAt = null;
      const heard = []; const shot = A.shot; A.shot = function (n, ...r) { heard.push(n); return shot.call(this, n, ...r); };
      const bowl = new G.debug.Items.Bowl(), ladle = G.items.find((i) => i.kind === 'ladle'); A.play('grab', bowl); bowl.remove(); A.hit(ladle, 2.5); A.play('chop', new V(0.3, 0.93, -0.26)); A.shot = shot;
      return { loaded: A.loaded, missing: A.missing || 0, far, behind, over, heard, beds: !!(A.bedOn && A.edges && A.edges.length === 4 && A.street), live: A.emit.size }; });
    ok(a.loaded === 31 && !a.missing && !a.beds, `the recorded sounds load (${a.loaded} of 31), and on a dry day in the village no rain or traffic plays (${a.live} sources live)`);
    ok(a.far.every((o, i) => !i || (o.g < a.far[i - 1].g && o.f < a.far[i - 1].f && o.s >= a.far[i - 1].s)), 'a sound grows quieter, duller and more of the alley with distance ' + JSON.stringify(a.far));
    ok(a.behind.f < 1500 && a.over.f > 5000, `behind the counter it is muffled (${a.behind.f} Hz), over it not (${a.over.f} Hz)`);
    ok(/^ceramic/.test(a.heard[0]) && /^(metal|clank)/.test(a.heard[1]) && /^chop/.test(a.heard[2]), 'a bowl is taken up as ceramic, a ladle knocks as metal, the knife chops on the board ' + a.heard.join(','));
    const s = await p.evaluate(() => { const bad = new Set(); let n = 0; G.scene.traverse((o) => { if (!o.isMesh) return; for (const m of [].concat(o.material)) if (m && m.map && m.map.userData.photo) { if (m.userData.surface) n++; else bad.add(m.map.userData.photo + ' on ' + (o.name || o.geometry.type)); } }); return { n, bad: [...bad] }; });
    ok(s.n > 10 && !s.bad.length, `every photographed surface wears the shared material (no tile repeats, grime, wear): ${s.n}${s.bad.length ? ', not: ' + s.bad.join('; ') : ''}`); }
  const log = await p.evaluate(async () => {
    const log = []; const L = (...a) => log.push(a.join(' '));
    G.frozen = true; Math.random = (() => { let s = 7; return () => { s = (s * 16807) % 2147483647; return s / 2147483647; }; })();
    const h = G.desk.hand, T3 = G.debug.THREE, V = (x, y, z) => new T3.Vector3(x, y, z);
    const step = (n = 1) => { for (let i = 0; i < n; i++) { G.scene.updateMatrixWorld(); G.debug.tick(1 / 60); } };
    const stand = (x, z) => { G.rig.position.set(x, 0, z); };
    const aim = (pt) => { const c = V(G.rig.position.x, 1.62, G.rig.position.z), d = pt.clone().sub(c); G.desk.yaw = Math.atan2(-d.x, -d.z); G.desk.pitch = Math.atan2(d.y, Math.hypot(d.x, d.z)); step(3); };
    const click = () => { h.grip = true; step(2); h.grip = false; step(2); };
    const use = (sec = 0.7) => { h.use = true; step(Math.round(sec * 60)); h.use = false; step(25); };
    const C = G.cart, game = G.game; { const pay = G.till.pay; G.till.pay = (c, d, t, k) => pay(c, d, t, k || ['c4', 'c4', 'c4', 'c4', 'c4']); } // five four-mon pieces, so change has to be made
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
    step(60 * 19); L('paying', c.state, JSON.stringify({ due: c.pay && c.pay.due, tender: c.pay && c.pay.tender, owed: c.pay && c.pay.owed, kinds: c.pay && c.pay.kinds }));
    // 10 paid in cash: ring the register open behind you, the money into its drawer, the change from it laid by their seat
    const TL = G.till, front = () => stand(sx * 0.6, 0.05), back = () => stand(0.2, 1.0); // a held bill follows the hand over a few frames: each put-down waits for it to arrive
    back(); aim(TL.regPos.clone()); L('aim reg', h.aim.button?.name); click(); step(30); L('drawer open', TL.open);
    for (const it of c.pay.items.filter((i) => !i.dead)) { front(); aim(it.obj.position.clone()); click(); const got = h.held && h.held.kind; back(); aim(TL.drawerPos.clone()); step(20); click(); step(3); L('deposit', got, it.dead); }
    for (const k of TL.coins(c.pay.owed) || []) { back(); aim(TL.slotPos(k).clone()); click(); const got = h.held && h.held.money; front(); aim(TL.spot(c.seat).clone()); step(20); click(); step(3); L('change', k, got); }
    step(60 * 5); L('paid', c.state, 'rung', c.pay.rung, 'till', TL.total() - TL.float);
    for (const it of G.items.filter((i) => i.kind === 'cash' && i.tipOf === c)) { front(); aim(it.obj.position.clone()); click(); back(); aim(TL.drawerPos.clone()); step(20); click(); step(3); }
    L('money', game.money, 'tips', game.tips, 'served', game.served, 'seat dirty', !!game.seats[c.seat].dirty, 'bowl dirty', bowl.dirty);
    front(); aim(bowl.obj.position.clone().setY(1.04)); click(); L('held', h.held?.kind); stand(0.4, 0.7); aim(V(0.935, 0.98, 0.91)); click(); step(5); L('bowl removed', bowl.dead, 'seat dirty', !!game.seats[c.seat].dirty);
    L('items', G.items.length, 'customers', game.customers.map((c) => c.state));
    } catch (e) { L('EXC', e.stack); }
    return log;
  });
  const L = log.join('\n'); if (process.env.LOG) console.log(L); const has = (re, m) => ok(re.test(L), m + (re.test(L) ? '' : '  [' + (L.match(/EXC.*/) || [''])[0].slice(0, 200) + ']'));
  if (process.env.SUSHI_LOG) console.log(L);
  has(/pots on: true,true,true/, 'each knob lights its burner'); has(/state open open true/, 'the switch opens the cart'); has(/ORDER seat \d shoyu/, 'the first customer of night one orders plain shoyu');
  has(/bowl tare shoyu/, 'a tare ladle tips into the bowl'); has(/bowl broth chicken (2|1\.[89]\d*) temp 0\.9/, 'two ladles of hot broth, poured'); has(/bowl noodles \{"cook":1[4-9]/, 'noodles boiled into the green and tipped in');
  has(/raw left 5 slices on board 3/, 'three chops, three slices on the board'); has(/bin stock 8 -> 9/, 'a slice restocks its bin'); has(/bowl toppings chashu,chashu,menma,negi,nori,naruto/, 'every topping lands in the bowl');
  has(/RESULT \{"score":100/, 'served as ordered: 100'); has(/paid leaving rung true till [1-9]/, 'they pay in coin: the coins into the coin box, the right change back by their seat, and they go' + (/paid leaving rung true till [1-9]/.test(L) ? '' : ' (' + ((L.match(/paid .*/) || [''])[0]).slice(0, 120) + ')'));
  has(/money 16 tips [1-9]\d* served 1 seat dirty true/, 'the sale rung up and the tip left on the ledge goes in the till; a dirty bowl left'); has(/bowl removed true seat dirty false/, 'the bus tub clears the seat'); ok(!/EXC/.test(L), 'the order ran through');
  const chg = await p.evaluate(() => { // six four-mon pieces for a 21-mon bill: two mon laid back is short and they say so; one more and they thank you and go
    const step = (n) => { for (let i = 0; i < n; i++) G.debug.tick(1 / 30); }, game = G.game, TL = G.till; let c = game.forceSpawn(); if (!c) return { none: true }; for (let i = 0; i < 400 && c.state !== 'waiting'; i++) step(1);
    if (c.ticket) c.ticket.removeFromParent(); c.result = { score: 90, issues: [], pay: 21, tip: 0 }; game.scores.push(90); const m0 = game.money; TL.pay(c, 21, 0, ['c4', 'c4', 'c4', 'c4', 'c4', 'c4']); step(60);
    const r = { owed: c.pay.owed, laid: c.pay.items.length }; TL.toggle(true); for (const it of [...c.pay.items]) TL.deposit(it);
    const give = (k) => { const it = G.sources.find((s) => s.till === k).take(); G.targets.find((t) => t.accepts(it) && t.getPos().distanceTo(TL.spot(c.seat)) < 0.01).receive(it); };
    for (let i = 0; i < 2; i++) give('c1'); step(30 * 5); r.short = !!c.pay.shorted && c.state === 'paying';
    give('c1'); step(30 * 4); r.gone = c.state === 'leaving'; r.rung = game.money - m0; r.change = TL.coins(3).join(','); return r; });
  ok(chg.owed === 3 && chg.laid === 6 && chg.short && chg.gone && chg.rung === 21, 'six four-mon pieces for 21 mon: short change is called out, the right change and they go, the sale rung up (' + JSON.stringify(chg) + ')');
  const stk = await p.evaluate(() => { const C = G.cart, a = C.avail(), n0 = C.stock.noodles, src = G.sources.find((s) => s.name === 'fresh noodle portion'); C.stock.noodles = 0; C.showStock(); const can = src.can(), sold = !C.canMake('shoyu'); C.stock.noodles = n0; C.showStock(); return { a, can, sold }; });
  ok(stk.a.noodles === 29 && stk.a.broth.chicken >= 2 && !stk.can && stk.sold, 'the day is stocked for its twenty-four customers and a quarter more (one bowl made); out of noodles, the box is empty and shoyu is sold out (' + JSON.stringify(stk.a).slice(0, 160) + ')');
  const phys = await p.evaluate(() => { const T = G.debug.THREE, C = G.cart, pot = C.pots[1], it = pot.item, hand = { pos: new T.Vector3(), vs: new T.Vector3(), vel: new T.Vector3() }, step = (n) => { for (let i = 0; i < n; i++) G.debug.tick(1 / 60); }, l0 = pot.level;
    it.held = hand; for (let i = 0; i < 40; i++) { it.obj.position.set(-0.4, 1.3, 0.3); it.obj.quaternion.setFromAxisAngle(new T.Vector3(0, 0, -1), 1.5); step(1); } const spilt = pot.level < l0 - 0.05, off = !pot.on;
    it.obj.quaternion.identity(); it.obj.position.set(-0.93, 0.95, 0.42); it.held = null; it.drop(); step(120); const back = pot.on && Math.abs(it.obj.position.y - 0.86) < 0.03;
    G.fx.splat(new T.Vector3(0, 0.9, -0.3), 0xc99a3c, 0.08); const s0 = G.fx.splats.length, rag = C.rag; rag.held = hand; rag.onGrab(); for (let i = 0; i < 120; i++) { hand.pos.set(Math.sin(i * 0.3) * 0.08, 0.93, -0.3); hand.vs.set(0.5, 0, 0); step(1); } rag.held = null; rag.drop();
    return { props: G.items.filter((x) => x.kind === 'prop').length, spilt, off, back, wiped: G.fx.splats.length < s0 }; });
  ok(phys.props > 15 && phys.spilt && phys.off && phys.back, 'a pot lifts off its burner, spills when tipped, and heats again set back down'); ok(phys.wiped, 'the rag wipes a spill off the counter');
  const blk = await p.evaluate(() => { const B = G.block; let moved = 0, seen = 0; const x0 = B.people.map((h) => h.p.root.position.x); for (let i = 0; i < 20 * 150; i++) { G.debug.tick(1 / 20); seen = Math.max(seen, B.people.filter((h) => h.p.root.visible).length); } B.people.forEach((h, i) => { if (Math.abs(h.p.root.position.x - x0[i]) > 1 || h.taken) moved++; }); const h = B.take(), named = !!(h && h.p.cast.name && B.story(h.def).includes(' is ')); if (h) B.give(h); return { n: B.people.length, moved, seen, named, ok: B.people.every((q) => isFinite(q.p.root.position.x)) }; });
  ok(blk.n === 10 && blk.moved >= 3 && blk.seen >= 2 && blk.named && blk.ok, 'the block has its ten regulars, about their night, and one of them can come to the cart as themself');
  const hurt = await p.evaluate(() => { const T = G.debug.THREE, V = (x, y, z) => new T.Vector3(x, y, z), step = (n) => { for (let i = 0; i < n; i++) { G.scene.updateMatrixWorld(); G.debug.tick(1 / 60); } }, game = G.game, B = G.block, out = {};
    G.talk.live = false; G.talk.tts = false; if (game.state !== 'open') game.toggleOpen(); const c = game.customers.find((x) => x.state === 'waiting' || x.state === 'eating') || game.forceSpawn(); let g = 0; while (c.state !== 'waiting' && c.state !== 'eating' && g++ < 2400) step(1);
    const torso = (P) => P.bones.find((b) => b.name === 'torso').quaternion.clone(), H = c.p.bones.find((b) => b.name === 'head').getWorldPosition(V(0, 0, 0)), q0 = torso(c.p), h = G.hands[0], ladle = G.items.find((i) => i.kind === 'ladle'), n0 = G.react.log.length;
    h.active = true; h.held = ladle; for (let i = 0; i < 12; i++) { const at = H.clone().add(V(0.04, 0, 0.4 - i * 0.05)); h.pos.copy(at); h.vs.set(0, 0, -3); ladle.obj.position.copy(at).sub(ladle.center.clone().applyQuaternion(ladle.obj.quaternion)); step(1); out.lean = Math.max(out.lean || 0, q0.angleTo(torso(c.p))); }
    h.active = false; h.held = null; for (let i = 0; i < 20; i++) { step(1); out.lean = Math.max(out.lean, q0.angleTo(torso(c.p))); } const e = G.react.log[n0]; out.cust = { seated: e && e.seated, kind: e && e.kind, gone: c.state === 'leaving', said: G.talk.last && G.talk.last.who, cop: !!B.by[B.cop].cop || B.by[B.cop].taken, lean: +out.lean.toFixed(3) };
    game.spawnT = 999; const free = () => B.people.find((x) => !x.taken && x.def.id !== G.block.cop && !B.mad[x.def.id]), park = (x, at) => { x.hidden = false; x.lead = null; x.crew.length = 0; x.chat = null; x.greet = null; x.step = 'stand'; x.t = 60; x.p.root.position.copy(at); for (const o of B.people) if (o !== x && !o.taken && Math.abs(o.p.root.position.x) < 30) o.p.root.position.x += 40; }; // alone in the alley, so nothing else is in the way
    out.cust.J = e && e.J; out.cust.limbs = G.react.limbs ? G.react.limbs.active : 0;
    const pb = free(); park(pb, V(1.2, 0, -2.6)); pb.p.root.rotation.y = Math.PI; step(5); const ch = pb.p.bones.find((b) => b.name === 'torso').getWorldPosition(V(0, 0, 0)), throwAt = (y, v) => { const bw = new G.debug.Items.Bowl(); bw.obj.position.set(ch.x, y, ch.z + 1); bw.drop(V(0, 0.3, -v)); bw.letT = G.t; return bw; };
    // a bowl thrown at the chest: it bounces off them (never through), and they take it as hard as it landed
    const n1 = G.react.log.length, tq = (P) => P.bones.find((b) => b.name === 'torso').quaternion.clone(), t0 = tq(pb.p), bw = throwAt(ch.y + 0.1, 6); let minZ = 9, rb = false, rock = 0, lastY = 9;
    for (let i = 0; i < 40; i++) { step(1); if (!bw.dead) { lastY = bw.obj.position.y; minZ = Math.min(minZ, bw.obj.position.z); if (bw.vel.z > 0.2) rb = true; } rock = Math.max(rock, t0.angleTo(tq(pb.p))); }
    const e1 = G.react.log.slice(n1).find((x) => x.who === pb.def.name); out.bounce = { J: e1 && e1.J, kind: e1 && e1.kind, bone: e1 && e1.bone, through: minZ < ch.z - 0.1, back: rb, whole: !bw.dead || lastY < 0.3, rock: +rock.toFixed(3), mad: !!B.mad[pb.def.id] };
    // the same bowl thrown twice as hard at the head floors them
    step(60); park(pb, V(1.2, 0, -2.6)); pb.p.root.rotation.y = Math.PI; step(5); const hd = pb.p.bones.find((b) => b.name === 'head').getWorldPosition(V(0, 0, 0)); throwAt(hd.y + 0.12, 13);
    let down = false; for (let i = 0; i < 60; i++) { step(1); down = down || pb.p.down(); } const e2 = G.react.log[G.react.log.length - 1]; out.pass = { who: e2 && e2.who === pb.def.name, seated: e2 && e2.seated, J: e2 && e2.J, down, mad: !!B.mad[pb.def.id] }; step(60 * 5); out.pass.up = !pb.p.down() && !pb.p.reeling();
    // a slow hand laid on someone's chest is a touch: nobody is knocked about
    const pt = free(); park(pt, V(-1.3, 0, -2.6)); pt.p.root.rotation.y = 0; step(5); const tc = pt.p.bones.find((b) => b.name === 'torso').getWorldPosition(V(0, 0, 0)), n3 = G.react.log.length; h.active = true; h.held = null; step(40);
    let reel = false; for (let i = 0; i < 50; i++) { h.pos.set(tc.x, tc.y + 0.05, tc.z + 0.35 - i * 0.006); h.vs.set(0, 0, -0.3); step(1); reel = reel || pt.p.down() || pt.p.reeling(); } h.active = false;
    const e3 = G.react.log.slice(n3).find((x) => x.who === pt.def.name); out.touch = { kind: e3 && e3.kind, J: e3 && e3.J, level: e3 && e3.level, reel, mad: !!B.mad[pt.def.id] };
    let back = false; for (let k = 0; k < 10; k++) { const t = B.take(); if (!t) break; back = back || t === pb; B.give(t); } out.pass.notBack = !back;
    for (let w = 0; w < 900 && (G.talk.D.cur || G.talk.D.q.length || G.t < (G.talk.floorT || 0)); w++) step(1); // the shouts above have had the floor
    const pw = free(); park(pw, V(-1.6, 0, -2.7)); for (const o of B.people) if (o !== pw && !o.taken) o.p.root.position.x += 40; step(5); G.talk.last = null; game.onWave(); out.wave = { greet: !!pw.greet }; step(50); out.wave.waving = pw.p.waveT > 0; out.wave.said = G.talk.last && G.talk.last.who === pw.def.name;
    const cam = G.camera.getWorldPosition(V(0, 0, 0)); out.wave.faces = Math.abs(Math.atan2(Math.sin(pw.p.root.rotation.y - Math.atan2(cam.x - pw.p.root.position.x, cam.z - pw.p.root.position.z)), Math.cos(pw.p.root.rotation.y - Math.atan2(cam.x - pw.p.root.position.x, cam.z - pw.p.root.position.z)))) < 0.5;
    return out; });
  ok(hurt.lean > 0.05 && hurt.cust.seated && hurt.cust.kind === 'thing' && hurt.cust.gone && hurt.cust.said && hurt.cust.cop, 'a seated customer struck with a held ladle lurches, says so, leaves unpaid, and the beat cop comes over (' + JSON.stringify(hurt.cust) + ')');
  ok(hurt.cust.J > 2 && hurt.cust.limbs >= 12, 'the people near the cart have real limbs, and the ladle\'s blow is measured (' + JSON.stringify([hurt.cust.J, hurt.cust.limbs]) + ')');
  ok(hurt.bounce.kind === 'thing' && hurt.bounce.J > 0.5 && !hurt.bounce.through && hurt.bounce.back && hurt.bounce.whole && hurt.bounce.rock > 0.01 && hurt.bounce.mad, 'a bowl thrown at a passer-by bounces off them, not through, and they rock with the impact and are angry (' + JSON.stringify(hurt.bounce) + ')');
  ok(hurt.pass.who && !hurt.pass.seated && hurt.pass.J >= 3 && hurt.pass.down && hurt.pass.up && hurt.pass.mad && hurt.pass.notBack, 'a bowl thrown hard at the head knocks them down, they get up, and will not come to the cart tonight (' + JSON.stringify(hurt.pass) + ')');
  ok(hurt.touch.kind === 'tap' && hurt.touch.J < 0.9 && !hurt.touch.level && !hurt.touch.reel && !hurt.touch.mad, 'a slow hand on someone\'s chest is only a touch: nobody is knocked about (' + JSON.stringify(hurt.touch) + ')');
  ok(hurt.wave.greet && hurt.wave.waving && hurt.wave.said && hurt.wave.faces, 'a passer-by turns to a wave from the cook, waves back and says something (' + JSON.stringify(hurt.wave) + ')');
  ok(await p.evaluate(() => !!G.debug.city.alley && !G.debug.city.rain && G.debug.city.shops.length >= 5 && G.debug.city.lamps.length >= 6), 'the stall stands in the village street, a dry day, with its doors and lanterns');
  { // nothing after the 1860s in the scene: no television, radio, boombox, car, register, bills, electric lamps or bottles of cola
    const ana = await p.evaluate(() => { const bad = []; G.scene.traverse((o) => { const n = (o.name || '') + ' ' + ((o.material && o.material.name) || ''); if (/television|boombox|radio|car_|corrado|cashregister|register|propane|bulb|neon/i.test(n)) bad.push(n.trim()); });
      const names = [...G.buttons.map((b) => b.name), ...G.sources.map((s) => s.name), ...G.items.map((i) => i.name)].filter((n) => /\bTV\b|television|radio|register|bill|dollar|beer|cola|LIGHTS switch|burner knob/i.test(n));
      return { bad: bad.slice(0, 6), names: names.slice(0, 6), tv: !!G.tv, radio: G.audio.stations, cars: G.debug.city.cars.length, drinks: Object.keys(G.cart.stock.drinks) }; });
    ok(!ana.bad.length && !ana.names.length && !ana.tv && !ana.radio && !ana.cars && ana.drinks.join() === 'sake,tea', 'no anachronisms: no television, radio, cars, register, bills or electric lamps; the drinks are sake and tea (' + JSON.stringify(ana) + ')'); }
  const tk = await p.evaluate(async () => { const K = G.tank; for (let i = 0; i < 100 && !K.ready; i++) await new Promise((r) => setTimeout(r, 200)); const y0 = K.fish.y, h0 = K.hunger, n0 = K.fed;
    const src = G.sources.find((s) => s.name.startsWith('fish food')), pinch = src.take(), tgt = G.targets.find((t) => t.accepts(pinch) && t.getPos().distanceTo(K.fish.g.position) < 1); tgt.receive(pinch); const dropped = K.flakes.length;
    let top = y0; for (let i = 0; i < 30 * 25 && K.flakes.length; i++) { G.debug.tick(1 / 30); top = Math.max(top, K.fish.y); }
    return { ready: K.ready, fish: K.fish.g ? K.fish.g.children.length : 0, dropped, rose: +(top - y0).toFixed(3), ate: K.fed - n0, fed: K.hunger < h0, state: K.state() }; });
  ok(tk.ready && tk.fish === 1 && tk.dropped > 0 && tk.rose > 0.02 && tk.ate > 0 && tk.fed, 'the goldfish basin: a pinch of food dropped on the water floats and sinks, the fish rises to it and eats, and is fed (' + JSON.stringify(tk) + ')');
  const clk = await p.evaluate(() => { const K = G.clock, seen = [], st = []; const u1 = K.on('night', () => seen.push('night')), u2 = K.on('stage:ramp', () => st.push('ramp')); const was = [K.frac, K.running, K.speed];
    K.running = true; K.speed = 600; for (let i = 0; i < 200 && K.phase !== 'night'; i++) G.debug.tick(1 / 20); K.speed = 1; for (let i = 0; i < 100; i++) G.debug.tick(1 / 20); const r = { phase: K.phase, stage: K.stage, hour: +K.hour.toFixed(1), dark: K.light, seen, st, lit: G.cart.lampK, closed: G.game.state !== 'open' };
    K.speed = was[2]; K.reset(); u1(); u2(); return r; });
  ok(clk.phase === 'night' && clk.seen.length === 1 && clk.st.length === 1 && clk.dark === 0 && clk.lit > 0.2, 'the run\'s clock runs the day into the night (fast): G.clock.on fires, the lanterns are lit, it is dark (' + JSON.stringify(clk) + ')');
  const liq = await p.evaluate(() => { const T3 = G.debug.THREE, K = G.tank, W = K.water, step = (n) => { for (let i = 0; i < n; i++) G.debug.tick(1 / 60); }, out = {};
    const it = new G.debug.Items.Food('negi'); it.obj.position.set(K.fish.g.position.x * 0 + -1.45, 1.25, 1.25); it.drop(); let peak = 0, at = -1; for (let i = 0; i < 90; i++) { step(1); if (W.peak > peak) { peak = W.peak; at = i; } }
    const e1 = W.E; step(60 * 10); out.drop = { peak: +peak.toFixed(5), at, fade: W.E < e1 * 0.3, steps: W.steps };
    const pot = G.cart.pots[1], P = pot.water, hand = { pos: new T3.Vector3(), vs: new T3.Vector3(), vel: new T3.Vector3() }; pot.item.held = hand; let sl = 0;
    for (let i = 0; i < 30; i++) { pot.item.obj.position.set(-0.93 + i * 0.01, 1.0, 0.42); pot.item.obj.quaternion.setFromAxisAngle(new T3.Vector3(0, 0, 1), Math.min(0.4, i * 0.03)); step(1); sl = Math.max(sl, P.peak); }
    pot.item.obj.quaternion.identity(); pot.item.obj.position.set(-0.93, 0.95, 0.42); pot.item.held = null; pot.item.drop(); step(60); out.slosh = +sl.toFixed(5); return out; });
  ok(liq.drop.peak > 0.001 && liq.drop.fade && liq.slosh > 0.0005, 'live liquids: a thing dropped in the goldfish basin rings its water and the rings die away; a pot carried and tipped sloshes (' + JSON.stringify(liq) + ')');
  const sto = await p.evaluate(() => { const K = G.clock, S = G.story; K.go('signs'); for (let i = 0; i < 20 * 12; i++) G.debug.tick(1 / 20); const r = { notes: S.notes.slice(), talking: G.block.people.some((h) => h.greet && h.greet.kind === 'story') || !!(G.talk.last && G.talk.last.line) }; K.reset(); return r; });
  ok(sto.notes.length >= 1 && /Jinbei/.test(sto.notes[0]), 'the story: at the first signs a villager brings the news and the cook\'s book keeps it (' + JSON.stringify(sto) + ')');
  ok(await p.evaluate(() => document.querySelectorAll('canvas').length === 1 && G.renderer.info.memory.geometries > 60 && G.baked > 100), 'the street is drawn, its still parts baked together');
  { // the conversation director, offline: the site's mind and voice are fakes; one floor, the cook's turn ends only when they have stopped, the cook cuts in, stale lines drop
    const d = await p.evaluate(async () => {
      const T = G.talk, D = T.D, out = {}, wait = (ms) => new Promise((r) => setTimeout(r, ms)), real = window.fetch, fz = G.frozen; G.frozen = true; if (!G.audio.ctx) G.audio.init(); await G.audio.ctx.resume?.(); G.muteVoices = false; T.tts = null;
      window.fetch = async (u, o) => { u = String(u);
        if (/\/sushi\/say$/.test(u)) { const text = JSON.parse(o.body).text, secs = Math.max(0.5, (text.match(/[\w']+/g) || []).length * 0.3), n = Math.round(secs * 24000), per = 2400; let i = 0;
          const body = new ReadableStream({ async pull(c) { if (i >= n) return c.close(); await new Promise((r) => setTimeout(r, 30)); const k = Math.min(per, n - i), b = new Int16Array(k); for (let j = 0; j < k; j++) b[j] = Math.round(Math.sin((i + j) * 0.05) * 3000); i += k; c.enqueue(new Uint8Array(b.buffer)); } });
          await new Promise((r) => setTimeout(r, 120)); return new Response(body, { headers: { 'content-type': 'audio/pcm', 'x-rate': '24000', 'x-voice': 'eleven-ny' } }); }
        if (/\/sushi\/talk$/.test(u)) { await new Promise((r) => setTimeout(r, 300)); return new Response(JSON.stringify({ say: 'Yeah, long night, pal.' }), { headers: { 'content-type': 'application/json' } }); }
        if (/\/sushi\/log$|\/holmes\/hear$/.test(u)) return new Response('{}', { headers: { 'content-type': 'application/json' } });
        return real(u, o); };
      const T3 = G.debug.THREE, who = (n) => { const c = { p: { root: new T3.Object3D(), sex: 'm', style: '-', talkT: 0, gesture() {} }, here: () => true }; G.scene.add(c.p.root); c.p.root.position.set(n - 1, 1.2, -1.2); return c; };
      const A = who(0), B = who(1), C = who(2), idle = async (ms = 8000) => { const t0 = performance.now(); while ((D.cur || D.q.length) && performance.now() - t0 < ms) await wait(50); };
      D.cookEnd = -9; D.cookOn = false; T.EP.text = ''; const s0 = T.spoken.length;
      // three people with something to say at once: one at a time, a breath between them
      T.queue(A, 'Evening. One shoyu, please, and a cola.', { kind: 'order' }); T.queue(B, 'This rain won’t quit, huh?', { kind: 'order' }); T.queue(C, 'Smells good tonight.', { kind: 'order' });
      await idle(); const L = T.spoken.slice(s0); let over = 0, gap = 9; for (let i = 1; i < L.length; i++) { over = Math.max(over, (L[i - 1].t1 || 1e9) - L[i].t0); gap = Math.min(gap, L[i].t0 - L[i - 1].t1); }
      out.floor = { n: L.length, over: +over.toFixed(3), gap: +gap.toFixed(2) };
      // the cook's words are held until a real pause, longer after a trailing "and", and the pieces of one turn are joined
      const was = T.cookSays, got = []; T.cookSays = (text) => { got.push({ text, at: performance.now() }); return true; };
      T.cookVoice(true); await wait(200); T.cookVoice(true); T.cookVoice(false); const t1 = performance.now(); T.heard('so I was thinking and'); await wait(1000); const early = got.length; await wait(1000);
      out.trail = { early, got: got.length, ms: got.length ? Math.round(got[0].at - t1) : -1 };
      got.length = 0; T.cookVoice(true); await wait(150); T.cookVoice(false); const t2 = performance.now(); T.heard('the broth is'); await wait(300); T.cookVoice(true); await wait(200); T.cookVoice(false); T.heard('almost ready.'); const mid = got.length; await wait(1300);
      out.join = { mid, n: got.length, text: got[0] && got[0].text, ms: got.length ? Math.round(got[0].at - t2) : -1 }; T.cookSays = was;
      // a long line stops when the cook starts talking, and is remembered only as far as it got; a short one is let finish
      const h = { who: 'me', text: 'Listen, I been comin’ here three years now and I gotta tell ya, this is the best bowl on the whole West Side, no kiddin’.' };
      D.cookEnd = -9; const it = T.queue(A, h.text, { kind: 'reply', h }); for (let i = 0; i < 80 && D.cur !== it; i++) await wait(50); await wait(900);
      const tb = performance.now(); T.cookVoice(true); const cutNow = D.cur !== it; await wait(250); T.cookVoice(false);
      out.barge = { playing: !!it.playing, stopped: cutNow && D.cur === null, ms: Math.round(performance.now() - tb), cut: !!(it.log && it.log.cut), kept: h.text };
      await idle(); const sh = T.queue(B, 'Yeah, sure.', { kind: 'reply' }); for (let i = 0; i < 80 && D.cur !== sh; i++) await wait(50); T.cookVoice(true); await wait(100); out.barge.short = D.cur === sh; T.cookVoice(false); await idle();
      // nobody starts while the cook is talking; small talk that waits too long is dropped, and an answer the cook has moved past is dropped
      T.cookVoice(true); T.queue(C, 'You been here long tonight?', { kind: 'chat' }); const held = []; for (let i = 0; i < 27; i++) { await wait(200); T.cookVoice(true); held.push(!!D.cur); } T.cookVoice(false); await wait(400);
      const r1 = T.queue(B, 'Nah, it’s fine.', { kind: 'reply' }); B.voice.gen++; await wait(600);
      const drops = T.book.filter((x) => x.dropped).map((x) => x.who + ': ' + x.dropped);
      out.stale = { quiet: !held.some(Boolean), chatGone: !T.spoken.slice(-3).some((x) => x.kind === 'chat') && drops.some((x) => /moment passed/.test(x)), superseded: !r1.playing && drops.some((x) => /superseded/.test(x)) };
      await idle(); window.fetch = real; G.frozen = fz; for (const c of [A, B, C]) G.scene.remove(c.p.root); return out; });
    ok(d.floor.n === 3 && d.floor.over <= 0.01 && d.floor.gap >= 0.25, 'the director gives one floor: three people with something to say speak one after another, a breath between (' + JSON.stringify(d.floor) + ')');
    ok(d.trail.early === 0 && d.trail.got === 1 && d.trail.ms >= 1300, 'the cook\'s turn is not answered before it ends: after a trailing "and" it waits for a longer pause (' + JSON.stringify(d.trail) + ')');
    ok(d.join.mid === 0 && d.join.n === 1 && /broth is almost ready/.test(d.join.text || ''), 'two pieces of one turn, a short pause between, are joined and answered once (' + JSON.stringify(d.join) + ')');
    ok(d.barge.playing && d.barge.stopped && d.barge.cut && / —$/.test(d.barge.kept) && d.barge.short, 'when the cook cuts in a long line stops at once and is remembered only as far as it got; a short one is let finish (' + JSON.stringify(d.barge) + ')');
    ok(d.stale.quiet && d.stale.chatGone && d.stale.superseded, 'nobody speaks while the cook does, small talk whose moment has passed is dropped, and so is an answer the cook has moved past (' + JSON.stringify(d.stale) + ')'); }
  if (OUT) await p.screenshot({ path: path.join(OUT, '01-cart.png'), timeout: 120000 }).catch(() => {});
  await p.close();
  { // RAMEN's night (outbreak.js), on the run's clock: a normal day, the signs, the first to rise, a cut that takes a head and a touch that does nothing, a flat blow, a parry, a noise that draws them, a death, and dawn with its score
    const o = await open('?desktop&nopost'); if (OUT) await o.exposeFunction('__shot', (n) => o.screenshot({ path: path.join(OUT, n + '.png'), timeout: 120000 }).catch(() => {}));
    const r = await o.evaluate(async () => {
      const T3 = G.debug.THREE, V = (x, y, z) => new T3.Vector3(x, y, z), I = G.infected, W = G.weapons, O = G.outbreak, out = {};
      const frames = n => new Promise(res => { const t0 = G.t, iv = setInterval(() => { if (G.t - t0 >= n * 0.049) { clearInterval(iv); res(); } }, 30); });
      G.game.toggleOpen(); G.game.forceSpawn(); await frames(30);
      G.clock.follow(0.1); await frames(10); out.day = { inf: I.list.length, ev: O.events.length, stage: G.clock.stage };
      G.clock.follow(0.29); await frames(10); out.signs = { ev: O.events.map(e => e.what), inf: I.list.length, stage: G.clock.stage };
      G.clock.follow(0.343); await frames(10); out.rise = { st: O.first && O.first.st, near: O.first ? +O.first.p.root.position.length().toFixed(2) : 9, stop: O.stop, bars: Object.values(O.sides).map(s => Math.round(s.bar)) };
      for (let i = 0; i < 160 && O.first && O.first.st === 'rise'; i++) await frames(1); out.rise.after = O.first && O.first.st;
      if (window.__shot) { G.desk.yaw = 0; G.desk.pitch = -0.15; await frames(4); await window.__shot('10-first-risen'); }
      I.kill(O.first); O.quiet = true; for (const k of Object.keys(O.sides)) O.sides[k].bar = 0; G.clock.follow(0.5); O.quiet = true;
      const still = (x) => { const z = I.spawn(V(x, 0, -1.05)); z.p.root.rotation.y = 0; z.think = 1e9; z.path = null; z.st = 'stand'; return z; };
      const cl = W.list.find(w => w.wk === 'cleaver'); G.debug.input.grab(G.desk.hand, cl); const zA = still(0); await frames(20);
      const neck = (z) => G.react.limbs.recs.get(z.p).segs.find(s => s.name === 'torso').B.clone();
      const stroke = async (z, roll, sp) => { const n0 = neck(z), t0 = G.t, q = new T3.Quaternion().setFromAxisAngle(V(0, 0, 1), roll), c0 = W.log.length; cl.drive = (w) => { w.obj.position.set(n0.x - 0.45 + (G.t - t0) * sp, n0.y, n0.z + 0.22); w.obj.quaternion.copy(q); };
        for (let i = 0; i < 80 && (G.t - t0) * sp < 0.9; i++) await frames(1); cl.drive = null; await frames(2); return { hits: W.log.slice(c0), lost: [...z.p.lost], dead: !!z.dead }; };
      out.touch = await stroke(zA, Math.PI / 2, 0.8); await frames(20); out.flat = await stroke(zA, 0, 5); await frames(25); out.edge = await stroke(zA, Math.PI / 2, 5);
      await frames(30); const hd = G.gore.pieces.find(p => p.it.name === 'a head'); out.head = hd ? { free: hd.it.free, y: +hd.it.obj.position.y.toFixed(2), body: !!G.debug.PH.live.get(hd.it) } : null; out.blood = G.gore.n;
      if (window.__shot) { G.desk.pitch = -0.45; await frames(6); await window.__shot('11-severed'); }
      const zB = still(0.05); await frames(20); const n0 = neck(zB), kt = W.make('katana', V(n0.x - 0.05, n0.y - 0.3, n0.z + 0.08), new T3.Quaternion().setFromEuler(new T3.Euler(Math.PI / 2, 0, 0))); kt.guard = true; const p0 = W.parries;
      out.parry = await stroke(zB, Math.PI / 2, 5); out.parry.n = W.parries - p0; kt.guard = false; kt.remove(); I.kill(zB);
      // a noise far down the street draws one that cannot see you in the dark
      G.cart.setOpen(false); const zn = I.spawn(V(8, 0, -3.2)); await frames(10); const x0 = zn.p.root.position.x; O.noise(V(-6, 0.5, -3.2), 1); await frames(60); out.noise = { x0: +x0.toFixed(2), x1: +zn.p.root.position.x.toFixed(2), heard: !!zn.heard }; I.kill(zn);
      // one inside the cart: grabs and bites until you die, and the night says so
      const zi = I.spawn(V(0.3, 0, 1.0)); zi.inside = true; G.rig.position.set(0, 0, 0.4); const hp = [];
      for (let i = 0; i < 400 && !O.dead; i++) { await frames(1); if (i % 20 === 0) hp.push(Math.round(O.me.hp)); } await frames(70);
      out.death = { dead: O.dead, bites: I.bites, hp, card: document.body.innerText.includes('BEGIN AGAIN') && document.body.innerText.includes('THE NIGHT TOOK YOU') };
      return out; });
    ok(r.day.inf === 0 && r.day.ev === 0 && r.day.stage === 'normal', 'RAMEN: the day is normal, no signs and none of them (' + JSON.stringify(r.day) + ')');
    ok(r.signs.stage === 'signs' && r.signs.inf === 0 && r.signs.ev.some(e => /bell/.test(e)) && r.signs.ev.some(e => /sickness/.test(e)), 'RAMEN: late in the day the signs come, a far bell and a runner with news of a sickness, and none of them yet (' + JSON.stringify(r.signs) + ')');
    ok(r.rise.st === 'rise' && r.rise.near < 2 && r.rise.stop && r.rise.after === 'walk' && r.rise.bars.some(b => b > 0), 'RAMEN: at the turn a regular collapses at the counter, close to you, and rises wrong; the cart stops serving and its sides are barricaded (' + JSON.stringify(r.rise) + ')');
    ok(!r.touch.hits.length && !r.touch.lost.length && !r.touch.dead, 'RAMEN: a slow touch of the cleaver does nothing (' + JSON.stringify(r.touch) + ')');
    ok(r.flat.hits.length && r.flat.hits[0].cut < 0.3 && !r.flat.lost.length && !r.flat.dead, 'RAMEN: the flat of the blade only knocks: nothing cut off (' + JSON.stringify(r.flat.hits[0]) + ')');
    ok(r.edge.lost.includes('head') && r.edge.dead && r.head && r.head.body && r.blood > 0, 'RAMEN: the cleaver\'s edge leading through a neck takes the head off; it falls as a body of its own, and there is blood (' + JSON.stringify([r.edge.hits.slice(-1)[0], r.head, r.blood]) + ')');
    ok(r.parry.n >= 1 && !r.parry.hits.filter(h => h.seg).length && !r.parry.lost.length, 'RAMEN: a blade held across parries the stroke: it never reaches them (' + JSON.stringify(r.parry) + ')');
    ok(r.noise.heard && r.noise.x1 < r.noise.x0 - 0.8, 'RAMEN: in the dark, a loud noise down the street draws them to it (' + JSON.stringify(r.noise) + ')');
    ok(r.death.dead && r.death.bites >= 3 && r.death.card, 'RAMEN: bitten enough, you die; a quiet card and BEGIN AGAIN (' + JSON.stringify(r.death) + ')');
    await o.close(); }
  { // the period arms: a shuriken thrown spins and sticks, and is taken up again; the matchlock fires once, clicks empty, is reloaded by its four steps, and its bang draws them from far down the street
    const o = await open('?desktop&nopost'); if (OUT) await o.exposeFunction('__shot', (n) => o.screenshot({ path: path.join(OUT, n + '.png'), timeout: 120000 }).catch(() => {}));
    const r = await o.evaluate(async () => { const frames = n => new Promise(res => { const t0 = G.t, iv = setInterval(() => { if (G.t - t0 >= n * 0.049) { clearInterval(iv); res(); } }, 30); });
const T3 = G.debug.THREE, V = (x, y, z) => new T3.Vector3(x, y, z), I = G.infected, W = G.weapons, O = G.outbreak, out = {}, inp = G.debug.input, h = G.desk.hand;
G.clock.follow(0.5); O.quiet = true; for (const k of Object.keys(O.sides)) O.sides[k].bar = 0;
const still = (x, z = -1.05) => { const q = I.spawn(V(x, 0, z)); q.p.root.rotation.y = 0; q.think = 1e9; q.path = null; q.st = 'stand'; return q; };
const za = still(0.2, -1.3); await frames(20);
// a shuriken thrown from the hand at the one by the counter: it spins in flight and sticks
const sh = W.make('shuriken', V(0.2, 0.95, -0.3)); await frames(2); inp.grab(h, sh); await frames(2);
G.rig.position.set(0.2, 0, -0.02); const tgt = G.react.limbs.recs.get(za.p).segs.find(s => s.name === 'torso'), aimP = tgt.A.clone().lerp(tgt.B, 0.6);
const cam = G.camera.getWorldPosition(V(0, 0, 0)); const d = aimP.clone().sub(cam); G.desk.yaw = Math.atan2(-d.x, -d.z); G.desk.pitch = Math.atan2(d.y, Math.hypot(d.x, d.z)); await frames(2);
let spun = 0, flew = false, tries = 0; const path = [];
for (; tries < 3 && !sh.stuckT; tries++) { if (tries) { sh.stuck = null; sh.v = null; inp.grab(h, sh); await frames(3); } const q0 = sh.obj.quaternion.clone(); h.grip = true; await frames(8); h.grip = false; flew = false;
for (let i = 0; i < 30; i++) { await frames(1); if (sh.v) { flew = true; path.push(sh.obj.position.toArray().map(v => +v.toFixed(2))); spun = Math.max(spun, sh.obj.quaternion.angleTo(q0)); } if (sh.stuck || (!sh.v && flew)) break; } }
out.tries = tries; out.path = path.slice(-4);
out.shuriken = { flew, spun: +spun.toFixed(2), stuck: !!sh.stuck, any: !!sh.stuckT, tries: out.tries, path: out.path, bone: sh.stuck && sh.stuck.bone && sh.stuck.bone.name, log: W.log.slice(-1) };
await frames(4); if (window.__shot) await window.__shot('13-shuriken');
// taken up again
const hp = sh.obj.position.clone(); inp.grab(h, sh); await frames(2); out.again = h.held === sh && !sh.stuck; sh.wantDrop = true; await frames(2);
// the matchlock: fires once, clicks empty, a real reload, fires again; and its bang draws one far down the street
const gun = W.make('teppo', V(0.3, 1.0, -0.3)); await frames(2); inp.grab(h, gun); await frames(2);
G.cart.setOpen(false); const zf = I.spawn(V(-12, 0, -3.5)); zf.think = 0; await frames(10); const fx0 = zf.p.root.position.x;
const s0 = gun.shots; h.grip = true; await frames(2); h.grip = false; await frames(10); const one = gun.shots - s0, loaded1 = gun.loaded;
h.grip = true; await frames(2); h.grip = false; await frames(10); const after = gun.shots - s0, clicks = gun.clicks;
G.desk.keys.KeyR = true; for (let i = 0; i < 260 && !gun.loaded; i++) await frames(1); G.desk.keys.KeyR = false; const reloaded = gun.loaded;
await frames(40); out.gun = { one, loaded1, after, clicks, reloaded, drawn: { x0: +fx0.toFixed(2), x1: +zf.p.root.position.x.toFixed(2), heard: !!zf.heard } };
gun.wantDrop = true; await frames(3);
// a lantern thrown hard breaks and burns
const ln = G.items.find(i => i.lantern) || null; out.lantern = !!ln;
return out;
    });
    ok(r.shuriken.flew && r.shuriken.spun > 0.5 && (r.shuriken.stuck || r.shuriken.any) && r.again, 'RAMEN: a shuriken thrown from the hand spins in flight, sticks where it strikes, and can be taken up again (' + JSON.stringify(r.shuriken) + ')');
    ok(r.gun.one === 1 && !r.gun.loaded1 && r.gun.after === 1 && r.gun.clicks >= 1 && r.gun.reloaded, 'RAMEN: the tanegashima fires once, then only clicks until it is reloaded, powder, ball, ram and pan (' + JSON.stringify(r.gun) + ')');
    ok(r.gun.drawn.heard && r.gun.drawn.x1 > r.gun.drawn.x0 + 0.8, 'RAMEN: the matchlock\'s bang draws one of them from far down the street (' + JSON.stringify(r.gun.drawn) + ')');
    await o.close(); }
  { // dawn: the samurai come, and the run ends with its score
    const o = await open('?desktop&nopost'); if (OUT) await o.exposeFunction('__shot', (n) => o.screenshot({ path: path.join(OUT, n + '.png'), timeout: 120000 }).catch(() => {}));
    const r = await o.evaluate(async () => { const frames = n => new Promise(res => { const t0 = G.t, iv = setInterval(() => { if (G.t - t0 >= n * 0.049) { clearInterval(iv); res(); } }, 30); });
      G.clock.follow(0.89); await frames(10); const n = G.infected.alive().length; G.clock.follow(0.902); await frames(80); const troop = !!G.outbreak.torch;
      if (window.__shot) { G.desk.yaw = Math.PI / 2 + 0.3; G.desk.pitch = -0.1; await frames(4); await window.__shot('12-dawn'); }
      G.clock.follow(0.97); await frames(10); return { n, troop, won: G.outbreak.won, card: document.body.innerText.includes('DAWN') && /lived to see the dawn/.test(document.body.innerText), text: document.body.innerText.split('\n').filter(l => /lived|put down/.test(l)) }; });
    ok(r.troop && r.won && r.card, 'RAMEN: at dawn the domain\'s samurai come with torches and the run ends with its score (' + JSON.stringify(r) + ')');
    await o.close(); }
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
    const roll = new Q().setFromAxisAngle(V(0, 0, 1), 1.4); const aim = bowl.obj.position.clone().add(V(0, 0.22, 0)).sub(tl.cup.clone().applyQuaternion(roll)); put('right', aim, roll); for (let i = 0; i < 30 && !bowl.tare && !(bowl.tareAmt > 0); i++) await frames(1);   // (a held thing is driven to the hand, not teleported: it takes a moment to cross half a metre)
    ctl('right').updateButtonValue('squeeze', 0); await frames(20); out.tare = bowl.tare; out.home = tl.atHome && tl.filled;   // what was poured lands a moment later
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
  ok(vr.tare === 'shoyu' && vr.home, 'a roll of the wrist pours the tare; the ladle flies home and refills (' + JSON.stringify([vr.tare, vr.home]) + ')'); ok(vr.left === 7, 'the knife chops by its own motion (' + vr.left + ' of 10 left)'); ok(vr.moved, 'the left stick steps along the cart');
  ok(vr.pot.took && vr.pot.low > 0.885 && vr.pot.ghost && vr.pot.gap > 0.08 && vr.pot.back, 'a pot taken by its handle and pushed down into the counter stays on top of it; a faint ghost shows the real hand (' + JSON.stringify(vr.pot) + ')');
  ok(vr.shove.bowl === 'bowl' && vr.shove.moved > 0.08 && vr.shove.apart > 0.08 && vr.shove.up, 'a held bowl shoves a loose shaker aside instead of passing through it (' + JSON.stringify(vr.shove) + ')');
  ok(vr.toss.took && vr.toss.flew > 0.4 && vr.toss.miss < 0.2, 'a throw lands where the swing aimed it (' + JSON.stringify(vr.toss) + ')');
  { // RAMEN in the headset: a katana taken up in the right hand, steadied by the left on its grip, swung with both across one of them at the counter: it cuts
    const k = await v.evaluate(async () => {
      const T3 = G.debug.THREE, V = (x, y, z) => new T3.Vector3(x, y, z), Q = T3.Quaternion, xr = window.__xrd, I = G.infected, W = G.weapons;
      const frames = n => new Promise(res => { const t0 = G.t, iv = setInterval(() => { if (G.t - t0 >= n * 0.049) { clearInterval(iv); res(); } }, 50); });
      const rq = () => G.rig.getWorldQuaternion(new Q()).invert(), ctl = h => xr.controllers[h], H = h => G.hands.find(x => x.source && x.source.handedness === h);
      const put = (h, w, q) => { const l = w.clone(); G.rig.worldToLocal(l); ctl(h).position.set(l.x, l.y, l.z); if (q) { const ql = rq().multiply(q); ctl(h).quaternion.set(ql.x, ql.y, ql.z, ql.w); } };
      G.clock.follow(0.5); G.outbreak.quiet = true; for (const s of Object.values(G.outbreak.sides)) s.bar = 0;
      const kt = W.make('katana', V(0.1, 1.15, -0.25), new Q()); await frames(3);
      const z = I.spawn(V(0, 0, -1.02)); z.p.root.rotation.y = 0; z.think = 1e9; z.path = null; z.st = 'stand'; await frames(20);
      const n0 = G.react.limbs.recs.get(z.p).segs.find(s => s.name === 'torso').B.clone(), edge = new Q().setFromAxisAngle(V(0, 0, 1), Math.PI / 2);
      put('right', V(0.1, 1.15, -0.25), edge); await frames(3); ctl('right').updateButtonValue('squeeze', 1); await frames(3); const took = H('right').held === kt;
      put('left', V(0.1, 1.15, -0.25).add(V(0, 0, 0.14)), edge); await frames(3); ctl('left').updateButtonValue('squeeze', 1); await frames(3); const two = !!(kt.supp && kt.two);
      const zr = n0.z + 0.6, c0 = W.log.length; put('right', V(-0.75, n0.y, zr), edge); put('left', V(-0.75, n0.y, zr + 0.15), edge); await frames(10);
      for (let i = 0; i <= 10; i++) { const x = -0.75 + i * 0.15; put('right', V(x, n0.y, zr), edge); put('left', V(x, n0.y, zr + 0.15), edge); await frames(1); }
      await frames(6); ctl('right').updateButtonValue('squeeze', 0); ctl('left').updateButtonValue('squeeze', 0); await frames(4);
      return { took, two, hits: W.log.slice(c0), lost: [...z.p.lost], dead: !!z.dead }; });
    ok(k.took && k.two && k.hits.some(h => h.cut > 0.5) && (k.lost.length || k.dead), 'RAMEN in the headset: a katana held in both hands and swung across one of them at the counter cuts (' + JSON.stringify(k) + ')'); }
  ok(!miss.length, 'nothing missing' + (miss.length ? ': ' + [...new Set(miss)].slice(0, 6).join(', ') : '')); ok(!errs.length, 'no page errors' + (errs.length ? ': ' + errs.slice(0, 3).join(' | ') : ''));
  await b.close(); srv.close(); console.log(fails.length ? fails.length + ' FAILED' : 'RAMEN passes'); process.exit(fails.length ? 1 : 0);
})();
