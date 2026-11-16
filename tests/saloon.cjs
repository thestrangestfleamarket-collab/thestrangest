// THE LAST CHANCE CHECK: node tests/saloon.cjs [dist/saloon.html]. The saloon loads on a screen with its people on the physics engine; the bell opens the night and the first customer comes in, sits and orders; a beer is drawn from the keg, left to settle, served, paid for with change made; a secret told to the right person changes the week; a game of pool and a game of darts play to an end; a townswoman walks round the furniture to a chair; the render inspector moves the look and exports it; no page errors.
const { chromium } = require('playwright'), path = require('path'), fs = require('fs');
const fails = [], ok = (c, m) => { if (!c) { fails.push(m); console.log((process.env.GITHUB_ACTIONS ? '::error title=saloon::' : 'FAIL ') + m); } else console.log('ok   ' + m); };
const PAGE = path.resolve(process.argv[2] || 'dist/saloon.html'), ROOT = path.dirname(PAGE);
const srv = require('http').createServer((q, r) => { const f = path.join(ROOT, decodeURIComponent(q.url.split('?')[0])); if (!f.startsWith(ROOT) || q.method !== 'GET') { r.writeHead(404); return r.end(); } fs.readFile(f, (e, d) => { if (e) { r.writeHead(404); return r.end(); } r.writeHead(200, { 'content-type': f.endsWith('.html') ? 'text/html' : 'application/octet-stream' }); r.end(d); }); });
(async () => {
  await new Promise(res => srv.listen(0, '127.0.0.1', res));
  const b = await chromium.launch({ ...(process.env.PWCHROME ? { executablePath: process.env.PWCHROME } : {}), args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--autoplay-policy=no-user-gesture-required'] });
  const errs = [], miss = [], p = await b.newPage({ viewport: { width: 800, height: 450 } });
  p.on('pageerror', e => errs.push(e.message.slice(0, 300))); p.on('response', r => { if (r.status() === 404 && !/talk$|say$|save$|hear$/.test(r.url())) miss.push(r.url().split('/').pop()); });
  await p.goto('http://127.0.0.1:' + srv.address().port + '/' + path.basename(PAGE) + '?desktop&nopost&nomic'); await p.waitForFunction('window.G && G.debug', null, { timeout: 240000 }); await p.waitForTimeout(3000);
  const r = await p.evaluate(() => { const o = {}; try {
    G.frozen = true; G.renderer.setAnimationLoop(null); const step = (n = 1) => { for (let i = 0; i < n; i++) { G.scene.updateMatrixWorld(); G.debug.tick(1 / 30); } }, W = G.story.W, ev = [], oe = G.story.event; G.story.event = (n, d) => { ev.push(n + ':' + (d.id || '')); return oe(n, d); };
    o.loaded = G.mode === 'desktop' && G.debug.PH.ready && !!G.castReady; o.stock = G.bar.stock();
    G.cardT = 0.01; step(2); G.story.bell(); o.open = W.phase === 'open';
    let n = 0; while (!ev.some((e) => e.startsWith('order:')) && n++ < 3000) step(1); const who = G.folk.people.find((q) => q.want); o.order = who && who.id + ' ' + who.want + ' ' + who.state;
    const gl = G.bar.glasses.find((g) => g.cut === 'mug'), tap = G.buttons.find((q) => q.name === 'the beer tap'), x = who.root.position.x;
    gl.obj.position.set(0.75, 0.92, 1.05); tap.press(); n = 0; while (gl.vol + gl.head < 0.97 && n++ < 400) step(1); tap.press(); o.froth = +gl.head.toFixed(2); o.frothy = !G.bar.judge(gl, 'beer').ok; step(150); o.settled = G.bar.judge(gl, 'beer').ok;
    gl.obj.position.set(x, 1.06, -0.72); step(60); o.served = ev.includes('served:' + who.id) && gl.owner === who; o.due = who.due;
    if (who.due > 0) { let d = who.due; for (const c of [100, 25, 10, 5]) while (d >= c) { new G.bar.Coin(c).obj.position.set(x, 1.06, -0.68); d -= c; } step(40); } o.changed = !(who.due > 0);
    n = 0; while (!ev.some((e) => e.startsWith('drank:')) && n++ < 4000) step(1); o.drank = ev.some((e) => e.startsWith('drank:')); o.dirty = gl.dirty;
    G.story.learn('bell'); const ada = G.folk.enter('ada', [['bar', 0, 9999]]); step(400); o.told = G.story.told(ada, 'It was Pike who shot your husband Tom Bell, not Cole.'); o.adaKnows = W.facts.has('ada_knows_pike');
    G.debug.pool.seed(3); G.debug.pool.challenge('doc', 100, 0.5); const pg = G.debug.pool.playOut(0.6); o.pool = pg && pg.on === false && (pg.you === 8 || pg.them === 8);
    const dg = G.debug.darts.play({ you: 0.8, them: 0.4, stake: 100, who: 'doc' }); o.darts = dg && (dg.you === 0 || dg.them === 0);
    const ruby = G.folk.enter('ruby', [['sit', 'middle', 9999]]); step(30 * 18); o.ruby = ruby.state + ' ' + ruby.P.pose;
    { const I = G.inspect; I.open(); I.L.exposure = 1.4; I.L.sat = 1; I.apply(); const c = I.changed(); I.take({ exposure: 0.6, bogus: 1 }); o.inspect = I.shown && c.exposure === 1.4 && c.sat === 1 && Object.keys(c).length === 2 && G.renderer.toneMappingExposure === 0.6 && G.look.grade.sat.value === 1; Object.assign(I.L, I.LOOK); I.apply(); }
    { const n0 = G.bar.bottles.length, src = G.sources.find((q) => q.name === 'whiskey' && q.can()), b = src.take(); o.shelf = !src.can() && G.bar.bottles.length === n0 + 1 && b.drink === 'whiskey' && b.corked; }
    { const z0 = G.rig.position.z; G.rig.position.set(0, 0, -9); G.desk.yaw = 0; G.desk.keys.KeyS = false; G.desk.keys.KeyW = true; G.desk.yaw = Math.PI; for (let i = 0; i < 120; i++) { G.scene.updateMatrixWorld(); G.debug.tick(1 / 30); } G.desk.keys.KeyW = false; o.doorZ = +G.rig.position.z.toFixed(2); G.look.town.backdrop(); o.baked = G.look.town.baked && !!G.scene.background; G.rig.position.set(0, 0, z0); }
    { const T = G.debug.THREE, V = (x, y, z) => new T.Vector3(x, y, z), F = G.furn, st60 = (n) => { for (let i = 0; i < n; i++) { G.scene.updateMatrixWorld(); G.debug.tick(1 / 60); } }; F.reset(); st60(5); const ch = F.list.filter((f) => f.d.kind === 'chair' && !f.d.seat.who), a = ch[0], b = ch[1], st = F.list.find((f) => f.d.kind === 'stool' && !f.d.seat.who), y0 = a.obj.position.y; st60(60); const still = Math.abs(a.obj.position.y - y0) < 0.01 && !a.free;
      a.drop(V(2.5, 1.5, 0), V(0, 0, 3)); st60(180); const thrown = a.dead || (a.obj.position.distanceTo(V(a.d.x, 0, a.d.z)) > 0.4 && a.d.seat.gone); b.obj.position.set(0.2, 3, -2.7); b.drop(V(0, -9, 0)); st60(120); const smashed = b.dead && G.items.some((i) => i.kind === 'plank'); const shot = !st.onImpact(10) && st.onImpact(10) && st.dead;
      const t = G.room.tables.find((q) => q.name === 'left'); for (let i = 0; i < 4; i++) G.guns.fire({ from: V(t.x, 0.6, t.z - 3), dir: V(0, 0, 1), by: 'test', kind: 'revolver' }); const m = G.room.panes.find((q) => q.name === 'mirror'); for (const dx of [0, 0.3]) G.guns.fire({ from: V(m.x + dx, m.y, m.z - 4), dir: V(0, 0, 1), by: 'test', kind: 'revolver' });
      const cb = G.room.cupboards[0]; cb.btn.press(); st60(60); const open = Math.abs(cb.g.rotation.y) > 1.5; cb.btn.press(); st60(90);
      o.phys = { still, thrown, smashed, shot, table: !t.alive, mirror: m.state === 2 && !m.m.visible, open, shut: Math.abs(cb.g.rotation.y) < 0.05 }; F.reset(); st60(3); o.phys.reset = F.list.length === G.room.loose.length && t.alive && !m.state; }
    o.crowd = G.folk.crowd(); o.calls = G.renderer.info.render.calls;
  } catch (e) { o.err = e.stack.slice(0, 500); } return o; });
  ok(!r.err, 'the play ran' + (r.err ? ': ' + r.err : ''));
  ok(r.loaded && r.stock.shots === 12 && r.stock.mugs === 6 && r.stock.whiskey > 5, 'the saloon loads on a screen: people, physics, twelve shot glasses, six mugs, whiskey on the shelves');
  ok(r.open && /sit|stand/.test(r.order || ''), 'the bell opens the night and the first customer orders (' + r.order + ')');
  ok(r.frothy && r.settled, 'a beer drawn straight is half froth (' + r.froth + ') and is right once it settles');
  ok(r.served && r.changed, 'served, paid for, and change made (owed ' + r.due + ' cents)');
  ok(r.drank && r.dirty, 'they drink it and leave a dirty glass');
  ok(r.adaKnows, 'a secret told to the widow changes what she means to do');
  ok(r.pool, 'a game of pool plays to eight'); ok(r.darts, 'a game of 301 plays out');
  ok(r.ruby === 'sit sit', 'a townswoman walks round the furniture and sits at a table (' + r.ruby + ')');
  ok(r.inspect, 'the render inspector opens, moves the look, exports only what changed and takes a saved look');
  ok(r.shelf, 'a bottle taken down from the shelf becomes a real corked bottle');
  ok(r.doorZ > -10 && r.baked, 'the doors are as far as you walk (z ' + r.doorZ + ') and the town outside is one baked picture');
  ok(r.phys && Object.values(r.phys).every(Boolean), 'real physics: a chair rests, is thrown, smashes; a stool and a table are shot to pieces; the mirror breaks; a cupboard opens and shuts; the night resets it all (' + JSON.stringify(r.phys) + ')');
  ok(!errs.length, 'no page errors' + (errs.length ? ': ' + errs[0] : '')); ok(!miss.length, 'nothing missing' + (miss.length ? ': ' + [...new Set(miss)].join(', ') : ''));
  await b.close(); srv.close(); console.log(fails.length ? fails.length + ' failed' : 'all passed'); process.exit(fails.length ? 1 : 0);
})();
