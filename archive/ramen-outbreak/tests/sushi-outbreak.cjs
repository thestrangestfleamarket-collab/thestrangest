// RAMEN's outbreak checks (16 Nov 2026), taken out of tests/sushi.cjs when the outbreak was archived (owner, 17 Nov 2026): they drive a page built with archive/ramen-outbreak/ put back in src/sushi/ with its hooks (git fe47d088 and after): node archive/ramen-outbreak/tests/sushi-outbreak.cjs [dist/ramen.html] [folder for screenshots]
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