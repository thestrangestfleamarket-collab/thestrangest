// THE LAST CHANCE CHECK: node tests/saloon.cjs [dist/saloon.html]. The saloon loads on a screen with its people on the physics engine; the bell opens the night and the first customer comes in, sits and orders; a beer is drawn from the keg, left to settle, served, paid for with change made; a secret told to the right person changes the week; a game of pool and a game of darts play to an end; a drunk walks round the furniture to a chair; no page errors.
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
    const gl = G.bar.glasses.find((g) => g.shape === 'mug'), tap = G.buttons.find((q) => q.name === 'the beer tap'), x = who.root.position.x;
    gl.obj.position.set(0.75, 0.92, 1.05); tap.press(); n = 0; while (gl.vol + gl.head < 0.97 && n++ < 400) step(1); tap.press(); o.froth = +gl.head.toFixed(2); o.frothy = !G.bar.judge(gl, 'beer').ok; step(150); o.settled = G.bar.judge(gl, 'beer').ok;
    gl.obj.position.set(x, 1.06, -0.72); step(60); o.served = ev.includes('served:' + who.id) && gl.owner === who; o.due = who.due;
    if (who.due > 0) { let d = who.due; for (const c of [100, 25, 10, 5]) while (d >= c) { new G.bar.Coin(c).obj.position.set(x, 1.06, -0.68); d -= c; } step(40); } o.changed = !(who.due > 0);
    n = 0; while (!ev.some((e) => e.startsWith('drank:')) && n++ < 4000) step(1); o.drank = ev.some((e) => e.startsWith('drank:')); o.dirty = gl.dirty;
    G.story.learn('bell'); const ada = G.folk.enter('ada', [['bar', 0, 9999]]); step(400); o.told = G.story.told(ada, 'It was Pike who shot your husband Tom Bell, not Cole.'); o.adaKnows = W.facts.has('ada_knows_pike');
    G.debug.pool.seed(3); G.debug.pool.challenge('doc', 100, 0.5); const pg = G.debug.pool.playOut(0.6); o.pool = pg && pg.on === false && (pg.you === 8 || pg.them === 8);
    const dg = G.debug.darts.play({ you: 0.8, them: 0.4, stake: 100, who: 'doc' }); o.darts = dg && (dg.you === 0 || dg.them === 0);
    const ruby = G.folk.enter('ruby', [['sit', 'middle', 9999]]); step(30 * 18); o.ruby = ruby.state + ' ' + ruby.P.pose;
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
  ok(!errs.length, 'no page errors' + (errs.length ? ': ' + errs[0] : '')); ok(!miss.length, 'nothing missing' + (miss.length ? ': ' + [...new Set(miss)].join(', ') : ''));
  await b.close(); srv.close(); console.log(fails.length ? fails.length + ' failed' : 'all passed'); process.exit(fails.length ? 1 : 0);
})();
