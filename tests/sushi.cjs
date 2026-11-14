// YATAI '86 CHECK: node tests/sushi.cjs [dist/sushi.html] [folder for screenshots]. The cart loads with its people, the burners light, the sign opens, a customer orders, a whole bowl is built by hand through the same hand code a player uses (tare, broth, noodles, a roll sliced, toppings), served and paid, the dirty bowl cleared; then in an emulated Quest 3 a knob is touched, a bowl is taken, a ladle poured by the wrist and a log chopped; no page errors.
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
    p.on('pageerror', e => errs.push(e.message.slice(0, 300))); p.on('response', r => { if (r.status() === 404 && !/talk$|opacity_color/.test(r.url())) miss.push(r.url().split('/').pop()); });
    await p.goto(FILE + q); await p.waitForFunction('window.G && G.debug', null, { timeout: 240000 }); await p.waitForTimeout(3000); return p; };
  const p = await open('?desktop&nopost');
  ok(await p.evaluate(() => G.mode === 'desktop' && G.debug.PH.ready), 'the cart loads on a screen, its loose things on the physics engine');
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
    L('bowl toppings', bowl.toppings.join(','));
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
  has(/bowl tare shoyu/, 'a tare ladle tips into the bowl'); has(/bowl broth chicken 2 temp 0\.9/, 'two ladles of hot broth'); has(/bowl noodles \{"cook":1[4-9]/, 'noodles boiled into the green and tipped in');
  has(/raw left 5 slices on board 3/, 'three chops, three slices on the board'); has(/bin stock 8 -> 9/, 'a slice restocks its bin'); has(/bowl toppings chashu,chashu,menma,negi,nori,naruto/, 'every topping lands in the bowl');
  has(/RESULT \{"score":100/, 'served as ordered: 100'); has(/money 450 tips \d+ served 1 seat dirty true/, 'they eat, pay and tip, and leave a dirty bowl'); has(/bowl removed true seat dirty false/, 'the bus tub clears the seat'); ok(!/EXC/.test(L), 'the order ran through');
  ok(await p.evaluate(() => document.querySelectorAll('canvas').length === 1 && G.renderer.info.render.triangles > 50000), 'the street is drawn');
  if (OUT) await p.screenshot({ path: path.join(OUT, '01-cart.png'), timeout: 120000 }).catch(() => {});
  await p.close();
  // an emulated Quest 3 with controllers
  const iwer = fs.readFileSync(require.resolve('iwer/build/iwer.js'), 'utf8') + ';window.__xrd=new IWER.XRDevice(IWER.metaQuest3);window.__xrd.installRuntime({forceInstall:true});';
  const v = await open('?nopost', iwer);
  const vr = await v.evaluate(async () => {
    const T3 = G.debug.THREE, V = (x, y, z) => new T3.Vector3(x, y, z), Q = T3.Quaternion, xr = window.__xrd, out = {}; G.renderer.shadowMap.enabled = false;
    const frames = n => new Promise(res => { const t0 = G.t, iv = setInterval(() => { if (G.t - t0 >= n * 0.049) { clearInterval(iv); res(); } }, 50); });
    const ctl = h => xr.controllers[h], put = (h, w, q) => { const l = w.clone(); G.rig.worldToLocal(l); ctl(h).position.set(l.x, l.y, l.z); if (q) ctl(h).quaternion.set(q.x, q.y, q.z, q.w); }, H = h => G.hands.find(x => x.source && x.source.handedness === h);
    await G.debug.startVR(); await frames(6); out.presenting = G.renderer.xr.isPresenting; out.hands = !!(H('left') && H('right'));
    const pot = G.cart.pots[0]; put('left', V(-0.6, 0.7, pot.z), new Q().setFromAxisAngle(V(0, 1, 0), Math.PI / 2)); await frames(3); put('left', V(-0.588, 0.7, pot.z)); await frames(3); out.knob = pot.on;
    put('right', V(0.93, 1.06, -0.36), new Q()); await frames(3); ctl('right').updateButtonValue('squeeze', 1); await frames(3); out.took = H('right').held && H('right').held.kind;
    put('right', V(-0.3, 1.0, -0.26)); await frames(4); ctl('right').updateButtonValue('squeeze', 0); await frames(24); const bowl = G.items.find(i => i.kind === 'bowl'); out.rest = !bowl.free && Math.abs(bowl.obj.position.y - 0.9) < 0.02;
    const tl = G.items.find(i => i.kind === 'ladle' && i.mode === 'tare' && i.type === 'shoyu'); put('right', tl.obj.position.clone()); await frames(3); ctl('right').updateButtonValue('squeeze', 1); await frames(3);
    const roll = new Q().setFromAxisAngle(V(0, 0, 1), 1.4); put('right', bowl.obj.position.clone().add(V(0, 0.22, 0)).sub(tl.cup.clone().applyQuaternion(roll)), roll); await frames(4); out.tare = bowl.tare; ctl('right').updateButtonValue('squeeze', 0); await frames(20); out.home = tl.atHome && tl.filled;
    const C = G.cart, raw = new G.debug.Items.Raw('naruto'); G.targets.find(t => t.accepts(raw)).receive(raw); put('right', C.knife.obj.position.clone(), new Q()); await frames(3); ctl('right').updateButtonValue('squeeze', 1); await frames(3);
    const up = V(C.board.x - 0.05, C.board.y + 0.2, C.board.z).sub(C.knife.blade), dn = V(C.board.x - 0.05, C.board.y + 0.03, C.board.z).sub(C.knife.blade); for (let i = 0; i < 3; i++) { put('right', up); await frames(2); put('right', dn); await frames(2); } out.left = raw.left;
    const x0 = G.rig.position.x; ctl('left').updateAxis('thumbstick', 'x-axis', 1); await frames(6); ctl('left').updateAxis('thumbstick', 'x-axis', 0); out.moved = G.rig.position.x > x0 + 0.05;
    return out; });
  ok(vr.presenting && vr.hands, 'in the headset: a session with both controllers'); ok(vr.knob, 'a controller tip turns a burner knob'); ok(vr.took === 'bowl' && vr.rest, 'grip takes a bowl from the stack; let go, it comes to rest on the counter');
  ok(vr.tare === 'shoyu' && vr.home, 'a roll of the wrist pours the tare; the ladle flies home and refills'); ok(vr.left === 7, 'the knife chops by its own motion (' + vr.left + ' of 10 left)'); ok(vr.moved, 'the left stick steps along the cart');
  ok(!miss.length, 'nothing missing' + (miss.length ? ': ' + [...new Set(miss)].slice(0, 6).join(', ') : '')); ok(!errs.length, 'no page errors' + (errs.length ? ': ' + errs.slice(0, 3).join(' | ') : ''));
  await b.close(); srv.close(); console.log(fails.length ? fails.length + ' FAILED' : 'YATAI \'86 passes'); process.exit(fails.length ? 1 : 0);
})();
