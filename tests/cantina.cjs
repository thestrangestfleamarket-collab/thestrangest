// THE CANTINA CHECK: node tests/cantina.cjs [dist/cantina.html] [folder for screenshots]. The hall loads with every model and picture, you walk in, sit at the long table, the deal reaches every seat, a card comes into your hand and goes back down, the look changes, a regular answers, the band keeps the bar, and in an emulated headset you sit and draw; no page errors.
const { chromium } = require('playwright'), path = require('path'), fs = require('fs');
const fails = [], ok = (c, m) => { if (!c) { fails.push(m); console.log((process.env.GITHUB_ACTIONS ? '::error title=cantina::' : 'FAIL ') + m); } else console.log('ok   ' + m); };
const PAGE = path.resolve(process.argv[2] || 'dist/cantina.html'), ROOT = path.dirname(PAGE), OUT = process.argv[3]; if (OUT) fs.mkdirSync(OUT, { recursive: true });
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.json': 'application/json', '.jpg': 'image/jpeg', '.glb': 'model/gltf-binary', '.mp3': 'audio/mpeg' };
const srv = require('http').createServer((q, r) => { const f = path.join(ROOT, decodeURIComponent(q.url.split('?')[0])); if (!f.startsWith(ROOT)) { r.writeHead(403); return r.end(); }
  fs.readFile(f, (e, d) => { if (e) { r.writeHead(404); return r.end(); } r.writeHead(200, { 'content-type': TYPES[path.extname(f)] || 'application/octet-stream' }); r.end(d); }); });
(async () => {
  await new Promise(res => srv.listen(0, '127.0.0.1', res)); const FILE = 'http://127.0.0.1:' + srv.address().port + '/' + path.basename(PAGE);
  const b = await chromium.launch({ ...(process.env.PWCHROME ? { executablePath: process.env.PWCHROME } : {}), args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--autoplay-policy=no-user-gesture-required'] });
  const pg = await b.newPage({ viewport: { width: 960, height: 540 } }), errs = [], miss = [];
  pg.on('pageerror', e => errs.push(e.message.slice(0, 300))); pg.on('requestfailed', r => { if (!/talk$/.test(r.url())) miss.push(r.url().split('/').pop()); });
  pg.on('response', r => { if (r.status() === 404 && !/talk$/.test(r.url())) miss.push(r.url().split('/').pop()); });
  pg.on('console', m => { if (m.type() === 'error' && !/404/.test(m.text())) errs.push('console: ' + m.text().slice(0, 300)); });
  let n = 0; const shot = async name => { if (OUT) await pg.screenshot({ path: path.join(OUT, String(++n).padStart(2, '0') + '-' + name + '.png'), timeout: 120000 }); };
  const wait = ms => new Promise(r => setTimeout(r, ms)), ev = (f, a) => pg.evaluate(f, a);
  const t0 = Date.now(); await pg.goto(FILE + '?hour=19' + (process.env.QUALITY ? '&quality=' + process.env.QUALITY : '')); await pg.waitForFunction(() => window.__game, null, { timeout: 420000 }).catch(() => {});
  const up = await ev(() => !!(window.__game && __game.world)); ok(up, 'the hall is built (' + ((Date.now() - t0) / 1000).toFixed(0) + ' s)');
  if (!up) { console.log(errs.join(' | ')); await b.close(); srv.close(); process.exit(1); }
  ok(miss.length === 0, 'every model, picture and the track is found' + (miss.length ? ': ' + [...new Set(miss)].join(', ') : ''));
  ok(await ev(() => __game.world.key === 'A'), 'at seven in the evening it is the Onyx Room');
  const st = await ev(() => { let lights = 0, skinned = 0; __game.world.root.traverse(o => { if (o.isLight) lights++; if (o.isSkinnedMesh) skinned++; }); return { lights, skinned, npcs: __game.world.npcs.length, calls: __game.renderer.info.render.calls, tris: __game.renderer.info.render.triangles }; });
  ok(st.lights <= 24, 'the room keeps to its budget of lights (' + st.lights + ')'); ok(st.npcs >= 14, st.npcs + ' regulars can be talked to; ' + st.skinned + ' bodies in the room; ' + st.calls + ' draws');
  await shot('menu');
  await pg.click('#play'); await wait(600);
  ok(await ev(() => __game.started && __game.cards.decks[0].length === 52), 'walking in shuffles a deck onto each table'); await shot('door');
  await ev(() => { __desk.locked = true; __game.sit(0, 0); }); await pg.waitForFunction(() => Math.abs(__game.me.pose.head.p.y - 1.3) < 0.08, null, { timeout: 60000 }).catch(() => {});
  const seat = await ev(() => ({ seat: __game.me.seat, y: +__game.me.pose.head.p.y.toFixed(2) })); ok(seat.seat && seat.seat.t === 0 && Math.abs(seat.y - 1.3) < 0.1, 'you sit at the long table (eyes at ' + seat.y + ' m)'); await shot('seated');
  await ev(() => { __game.pressButton(0, 1); __game.pressButton(0, 1); }); await wait(2500);
  const dealt = await ev(() => __game.cards.cards.filter(c => c.loc === 'table').length); ok(dealt === 12, 'two deals reach the five regulars and you (' + dealt + ' cards down)'); await shot('dealt');
  const hand = await ev(() => { const g = __game, me = g.me.pose.head.p, mine = g.cards.cards.filter(c => c.loc === 'table').sort((a, b) => a.p.distanceTo(me) - b.p.distanceTo(me)).slice(0, 2);
    for (const c of mine) { __desk.hover = { type: 'card', id: c.id }; __desk.primary(); } return g.cards.fan(g.me.id, 'L').length; }); await wait(900);
  ok(hand === 2, 'your two cards come up into your hand'); await shot('hand');
  await ev(() => { __desk.pitch = -0.55; }); await wait(300);
  const played = await ev(() => { __desk.hover = null; __desk.play(false); const c = __game.cards.cards.filter(c => c.loc === 'table'); return { fan: __game.cards.fan(1, 'L').length, onFelt: c.every(k => Math.abs(k.p.y - 0.78) < 0.03) }; }); await wait(600);
  ok(played.fan === 1 && played.onFelt, 'one is played back onto the felt'); await shot('played');
  const said = await ev(async () => { const c = __game.talk.cast.occultist; __game.talk.start(c); await __game.talk.say('hello'); return document.getElementById('talkLog').textContent; });
  ok(/Madame Ink/.test(said) && said.length > 30, 'Madame Ink answers (her own line without the website)'); await shot('talk'); await ev(() => __game.talk.close());
  const ph = await ev(() => [0.5, 2.5, 3.2, 20].map(t => +__band.phase(t).toFixed(2))); ok(ph[0] === -1 && ph[1] >= 0 && ph[1] < 0.1 && ph[2] > 0.4, 'the band finds its place in the bar (' + ph.join(', ') + ')');
  await ev(() => __game.stand()); await pg.waitForFunction(() => __desk.seatKey === -1, null, { timeout: 60000 }).catch(() => {});
  await ev(() => { __desk.pos.set(-6.5, 0, 6.5); }); await pg.waitForFunction(() => __desk.pos.y > 3, null, { timeout: 60000 }).catch(() => {});
  await ev(() => { __desk.pos.x = -8.5; __desk.yaw = -1.9; __desk.pitch = -0.25; }); await pg.waitForFunction(() => __desk.pos.y > 3.55, null, { timeout: 60000 }).catch(() => {});
  const climb = await ev(() => +__desk.pos.y.toFixed(2)); ok(Math.abs(climb - 3.62) < 0.2, 'the stair takes you up to the loft (' + climb + ' m up)'); await shot('loft');
  await ev(() => __setLook('C')); await pg.waitForFunction(() => __game.world && __game.world.key === 'C', null, { timeout: 300000 }).catch(() => {});
  ok(await ev(() => __game.world && __game.world.key === 'C' && __game.cards.fan(1, 'L').length === 1), 'the look changes to After Hours and your hand stays'); await wait(800); await shot('afterhours');
  // in a headset (an emulated Quest 3): you sit, reach the deck and take the top card in your hand
  await pg.close();
  { const vp = await b.newPage({ viewport: { width: 960, height: 540 } }); vp.on('pageerror', e => errs.push('vr: ' + e.message.slice(0, 300)));
    await vp.addInitScript(fs.readFileSync(require.resolve('iwer/build/iwer.min.js'), 'utf8') + '\n;window.xrDevice = new IWER.XRDevice(IWER.metaQuest3); window.xrDevice.installRuntime({ forceInstall: true });');
    await vp.goto(FILE + '?hour=19&quality=low', { timeout: 180000 }); await vp.waitForFunction(() => window.__game && __game.world && !document.getElementById('vr').disabled, null, { timeout: 420000 }).catch(() => {});
    await vp.click('#vr'); await vp.waitForFunction(() => __game.started && __game.renderer.xr.isPresenting, null, { timeout: 60000 }).catch(() => {});
    ok(await vp.evaluate(() => __game.renderer.xr.isPresenting), 'ENTER VR starts the headset');
    await vp.evaluate(() => __game.sit(0, 0)); await vp.waitForFunction(() => Math.abs(__game.me.pose.head.p.y - 1.3) < 0.06 && Math.hypot(__game.me.pose.head.p.x - 2.35, __game.me.pose.head.p.z - 2.23) < 0.3, null, { timeout: 60000 }).catch(() => {});
    const hp = await vp.evaluate(() => __game.me.pose.head.p.toArray().map(v => +v.toFixed(2))); ok(Math.abs(hp[1] - 1.3) < 0.06, 'your head is at the long table (' + hp.join(', ') + ')');
    const got = await vp.evaluate(async () => { const g = __game, T = g.dolly, c = xrDevice.controllers.right, st = __xrc.st.R, V3 = g.camera.position.constructor, top = g.cards.deckTopPos(0, new V3());
      for (let i = 0; i < 6; i++) { T.updateMatrixWorld(true); const want = T.worldToLocal(top.clone()), have = T.worldToLocal(st.pp.clone()); c.position.set(c.position.x + want.x - have.x, c.position.y + want.y - have.y, c.position.z + want.z - have.z); await new Promise(r => setTimeout(r, 400)); }
      c.updateButtonValue('squeeze', 1); for (let i = 0; i < 20 && g.cards.pinched(1, 'R') === null; i++) await new Promise(r => setTimeout(r, 300));
      return { miss: +st.pp.distanceTo(top).toFixed(3), card: g.cards.pinched(1, 'R'), deck: g.cards.decks[0].length }; });
    ok(got.card !== null && got.deck === 51, 'your hand closes on the top card of the deck (' + JSON.stringify(got) + ')'); if (OUT) await vp.screenshot({ path: path.join(OUT, 'vr.png'), timeout: 120000 }).catch(() => {});
    await vp.close(); }
  ok(errs.length === 0, 'no page errors' + (errs.length ? ': ' + errs.join(' | ') : ''));
  await b.close(); srv.close(); if (fails.length) { console.log(fails.length + ' failed'); process.exit(1); } console.log('all ok');
})();
