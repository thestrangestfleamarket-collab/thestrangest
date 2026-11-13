// THE DUEL CHECK: node tests/duel.cjs [dist/duel.html]. AR DUEL loads its pictures, a round against the bot starts, every weapon hurts a bot held still, ducking clears a wave, a cryo mine freezes the launcher, burning floor hurts until you step out, and two linked pages agree on a hit; no page errors.
const { chromium } = require('playwright'), path = require('path'), fs = require('fs');
const fails = [], ok = (c, m) => { if (!c) { fails.push(m); console.log((process.env.GITHUB_ACTIONS ? '::error title=duel::' : 'FAIL ') + m); } else console.log('ok   ' + m); };
const PAGE = path.resolve(process.argv[2] || 'dist/duel.html'), ROOT = path.dirname(PAGE);
const TYPES = { '.html': 'text/html', '.jpg': 'image/jpeg', '.txt': 'text/plain' };
const srv = require('http').createServer((q, r) => { const f = path.join(ROOT, decodeURIComponent(q.url.split('?')[0])); if (!f.startsWith(ROOT)) { r.writeHead(403); return r.end(); }
  fs.readFile(f, (e, d) => { if (e) { r.writeHead(404); return r.end(); } r.writeHead(200, { 'content-type': TYPES[path.extname(f)] || 'application/octet-stream' }); r.end(d); }); });
(async () => {
  await new Promise(res => srv.listen(0, '127.0.0.1', res)); const URL = 'http://127.0.0.1:' + srv.address().port + '/' + path.basename(PAGE);
  const b = await chromium.launch({ ...(process.env.PWCHROME ? { executablePath: process.env.PWCHROME } : {}), args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const errs = [], miss = [], watch = pg => { pg.on('pageerror', e => errs.push(e.message.slice(0, 300))); pg.on('requestfailed', r => miss.push(r.url().split('/').pop())); pg.on('response', r => { if (r.status() >= 400) miss.push(r.url().split('/').pop()); }); };
  const fight = pg => pg.waitForFunction(() => window.__duel && __duel.game.phase === 'fight', null, { timeout: 120000 });
  const pg = await b.newPage({ viewport: { width: 400, height: 240 } }); watch(pg);
  await pg.goto(URL + '?bot&auto&nolock'); await fight(pg).catch(() => {});
  ok(await pg.evaluate(() => !!window.__duel && __duel.game.phase === 'fight'), 'the page starts and a round against the bot begins');
  ok(miss.length === 0, 'every picture is found' + (miss.length ? ': ' + miss.join(', ') : ''));
  // the bot is held still in front of you and does not fire back
  await pg.evaluate(() => { const g = __duel.game, P = Object.getPrototypeOf(g); g.fire = (id, ...r) => id === 1 ? null : P.fire.call(g, id, ...r); g.setShield = (id, w, dt) => P.setShield.call(g, id, id === 1 ? false : w, dt);
    window.botFire = (type, o, d, x = [1, 0, 0]) => { const V = g.local.head.constructor; g.cd[1] = {}; P.fire.call(g, 1, type, new V(...o), new V(...d), new V(...x)); };
    setInterval(() => g.actors[1].head.set(0, 1.6, -1.8), 1); });
  const wait = async sec => { const t0 = await pg.evaluate(() => __duel.game.time); await pg.waitForFunction(([t, s]) => __duel.game.time >= t + s, [t0, sec], { polling: 16, timeout: 120000 }); };
  const hp = () => pg.evaluate(() => __duel.game.actors.map(a => a.hp)), click = () => pg.mouse.click(200, 120);
  await wait(0.3); const got = {};
  for (const [k, name, w] of [['Digit1', 'pulse', 1], ['Digit4', 'ricochet', 1.2], ['Digit5', 'wave', 1.6], ['Digit3', 'seeker', 2.2]]) { const h0 = (await hp())[1]; await pg.keyboard.press(k); await click(); await wait(w); got[name] = h0 - (await hp())[1]; }
  let h0 = (await hp())[1]; await pg.keyboard.press('Digit2'); await click(); await wait(1.25); await click(); await wait(0.3); got.detonator = h0 - (await hp())[1];
  ok(got.pulse === 8 && got.ricochet === 12 && got.wave === 18 && got.seeker > 15 && got.detonator > 25, 'every weapon hurts the bot: ' + JSON.stringify(got));
  await pg.evaluate(() => { __duel.game.actors[1].hp = 100; });
  h0 = (await hp())[0]; await pg.keyboard.down('KeyC'); await wait(0.5); await pg.evaluate(() => botFire('wave', [0.3, 1.45, -1.6], [0, 0, 1])); await wait(1.5); const ducked = h0 - (await hp())[0]; await pg.keyboard.up('KeyC'); await wait(0.4);
  await pg.evaluate(() => botFire('wave', [0.3, 1.45, -1.6], [0, 0, 1])); await wait(1.5); const stood = h0 - ducked - (await hp())[0];
  ok(ducked === 0 && stood === 18, 'a wave at chest height misses you ducking and hits you standing (' + ducked + ', ' + stood + ')');
  await pg.evaluate(() => botFire('mine', [0.3, 1.3, -0.6], [0, 0, 1])); await wait(2.2);
  const frozen = await pg.evaluate(() => __duel.game.local.frozen > 0); await pg.keyboard.press('Digit1'); await click(); await wait(0.1); const held = await pg.evaluate(() => __duel.game.projectiles.size);
  await wait(3); await click(); await wait(0.1); const thawed = await pg.evaluate(() => __duel.game.projectiles.size);
  ok(frozen && held === 0 && thawed === 1, 'a cryo mine freezes the launcher, then it thaws');
  await pg.evaluate(() => { const g = __duel.game; g.local.hp = 100; g.actors[1].hp = 100; g.emit({ t: 'explode', id: 'test-1', w: 'orb', o: 1, p: [0.2, 0.3, 1.8] }); }); await wait(0.1);
  const a = (await hp())[0]; await wait(3); const c = (await hp())[0]; await pg.evaluate(() => { __duel.desk.pos.x = -1.5; }); await wait(0.3); const d = (await hp())[0]; await wait(1.5);
  ok(a < 100 && a - c > 10 && d === (await hp())[0] && await pg.evaluate(() => __duel.game.fx.scars.marks.length > 0), 'the blast scorches the floor, the fire burns you (' + (a - c) + ') until you step out');
  await pg.close();
  // two pages of one browser, linked without a network
  const ctx = await b.newContext({ viewport: { width: 400, height: 240 } }), h = await ctx.newPage(), g = await ctx.newPage(); watch(h); watch(g);
  await h.goto(URL + '?host=TEST&local&auto&nolock'); await g.goto(URL + '?join=TEST&local&auto&nolock');
  const st = p => p.evaluate(() => ({ phase: __duel.game.phase, hp: __duel.game.actors.map(a => a.hp), score: __duel.game.score }));
  let both = false;
  for (let i = 0; i < 120 && !both; i++) { await h.bringToFront(); await h.waitForTimeout(250); await g.bringToFront(); await g.waitForTimeout(250); both = (await st(h).catch(() => ({}))).phase === 'fight' && (await st(g).catch(() => ({}))).phase === 'fight'; }
  ok(both, 'two linked pages both reach the fight');
  let hs, gs; for (let i = 0; i < 40; i++) { await h.bringToFront(); await h.mouse.click(200, 120); await h.waitForTimeout(450); await g.bringToFront(); await g.waitForTimeout(350); hs = await st(h); gs = await st(g); if (hs.hp[1] < 100 || hs.score[0]) break; }
  ok((hs.hp[1] < 100 || hs.score[0] > 0) && JSON.stringify(hs.hp) === JSON.stringify(gs.hp) && JSON.stringify(hs.score) === JSON.stringify(gs.score), 'the host\'s shot hurts the guest and both pages agree: ' + JSON.stringify(hs));
  ok(errs.length === 0, 'no page errors' + (errs.length ? ': ' + errs.slice(0, 3).join(' | ') : ''));
  await b.close(); srv.close(); if (fails.length) { console.log(fails.length + ' failed'); process.exit(1); } console.log('all ok');
})();
