// THE HIDE CHECK: node tests/hide.cjs [dist/hide.html] [folder for screenshots]. DEAD END's school loads, the thing can walk to each of its thirty-two places, nothing is out of place before you touch it, walls stop a body, a locker shuts on you and a moved door is noticed, the breaker cuts the lights, the key opens the fire door, standing in the open is caught; then in an emulated Quest 3 the trigger alone starts the minute and the sticks move you.
const { chromium } = require('playwright'), path = require('path'), fs = require('fs');
const fails = [], ok = (c, m) => { if (!c) { fails.push(m); console.log((process.env.GITHUB_ACTIONS ? '::error title=hide::' : 'FAIL ') + m); } else console.log('ok   ' + m); };
const PAGE = path.resolve(process.argv[2] || 'dist/hide.html'), ROOT = path.dirname(PAGE), OUT = process.argv[3]; if (OUT) fs.mkdirSync(OUT, { recursive: true });
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.glb': 'model/gltf-binary', '.jpg': 'image/jpeg', '.mp3': 'audio/mpeg' };
const srv = require('http').createServer((q, r) => { const f = path.join(ROOT, decodeURIComponent(q.url.split('?')[0])); if (!f.startsWith(ROOT)) { r.writeHead(403); return r.end(); }
  fs.readFile(f, (e, d) => { if (e) { r.writeHead(404); return r.end(); } r.writeHead(200, { 'content-type': TYPES[path.extname(f)] || 'application/octet-stream' }); r.end(d); }); });
(async () => {
  await new Promise(res => srv.listen(0, '127.0.0.1', res)); const FILE = 'http://127.0.0.1:' + srv.address().port + '/' + path.basename(PAGE) + '?mind=local&night=plain&dof=0';
  const b = await chromium.launch({ ...(process.env.PWCHROME ? { executablePath: process.env.PWCHROME } : {}), args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--autoplay-policy=no-user-gesture-required'] });
  const open = async (init) => { const pg = await b.newPage({ viewport: { width: 640, height: 400 } }), errs = [], miss = [];
    pg.on('pageerror', e => errs.push(e.message.slice(0, 300))); pg.on('requestfailed', r => miss.push(r.url().split('/').pop())); pg.on('response', r => { if (r.status() >= 400) miss.push(r.url().split('/').pop()); }); pg.on('console', m => { if (m.type() === 'error') errs.push('console: ' + m.text().slice(0, 300)); });
    if (init) await pg.addInitScript(init); await pg.goto(FILE); await pg.waitForFunction(() => !document.getElementById('bdesk').disabled || document.getElementById('note').textContent, null, { timeout: 420000 }).catch(e => errs.push('load: ' + e.message.slice(0, 200))); return { pg, errs, miss }; };
  let n = 0; const t0 = Date.now(), { pg, errs, miss } = await open(), ev = (f, a) => pg.evaluate(f, a), shot = async (p, name) => { if (OUT) await p.screenshot({ path: path.join(OUT, String(++n).padStart(2, '0') + '-' + name + '.png'), timeout: 120000 }); };
  const up = await ev(() => !document.getElementById('bdesk').disabled && !!window.__hide);
  ok(up, 'the page loads its pictures, posters, models and sounds (' + ((Date.now() - t0) / 1000).toFixed(0) + ' s)');
  if (!up) { console.log('it says: ' + await pg.textContent('#note').catch(() => '?') + (errs.length ? '\npage errors: ' + errs.join(' | ') : '')); await b.close(); srv.close(); process.exit(1); }
  ok(miss.length === 0, 'every file is found' + (miss.length ? ': ' + miss.join(', ') : '')); await shot(pg, 'title');
  await pg.click('#bdesk'); await pg.waitForFunction(() => __hide.G.mode === 'ready'); await pg.waitForTimeout(1500); await shot(pg, 'ready');
  // from here the test steps the game itself, a sixtieth of a second at a time, and the page stops drawing
  await ev(() => { const h = __hide; h.renderer.setAnimationLoop(null); window.go = (keys, k) => { for (const c of keys) h.PL.keys[c] = true; h.sim(k); for (const c of keys) h.PL.keys[c] = false; };
    window.round = (setup, secs) => { h.reset(); h.startRound(); h.G.left = .05; h.sim(5); setup(h); for (let i = 0; i < secs * 60 && h.G.mode === 'seek'; i++) h.sim(1); return { mode: h.G.mode, won: h.G.won, t: Math.round(h.SK.t), searched: Object.keys(h.SK.searched).length, thoughts: h.SK.thoughts.length }; }; });
  let s = await ev(() => { const h = __hide; return { spots: h.SPOTS.length, geo: h.SPOTS.every(s => h.WORLD.GEO[s.id]), mess: h.SPOTS.map(s => h.SK.messAt(s.id)).filter(Boolean), things: h.P.things.length, lids: Object.keys(h.P.lids).length, lockers: Object.keys(h.P.lids).filter(k => /^lockers/.test(k)).length,
    far: h.SPOTS.filter(s => { const g = h.WORLD.GEO[s.id]; h.SK.pos.set(0, 0, 2); const p = h.SK.pathTo(g.at[0], g.at[1]), e = p[p.length - 1]; return p.length < 2 || Math.hypot(e[0] - g.at[0], e[1] - g.at[1]) > .45; }).map(s => s.id) }; });
  ok(s.spots === 32 && s.geo && s.things > 150 && s.lockers === 53, 'thirty-two places, ' + s.things + ' loose things, ' + s.lockers + ' lockers among ' + s.lids + ' doors and lids');
  ok(s.mess.length === 0, 'nothing is out of place before you touch it' + (s.mess.length ? ': ' + s.mess.join(' / ') : '')); ok(s.far.length === 0, 'the thing can walk to every place' + (s.far.length ? ', but not: ' + s.far.join() : ''));
  s = await ev(() => { const h = __hide; h.startRound(); h.sim(30); const left = h.G.left; h.PL.place(0, 0, -21.5, -Math.PI / 2); go(['KeyW'], 150); const wall = h.PL.pos.x; h.PL.place(0, 0, -38, 0); go(['KeyW', 'ShiftLeft'], 150); return { mode: h.G.mode, left, wall, end: h.PL.pos.z, y: h.PL.pos.y }; });
  ok(s.mode === 'hide' && s.left < 60 && s.left > 58, 'START begins the count from sixty'); ok(Math.abs(s.wall) < 1.5 && s.end > -40 && Math.abs(s.y) < .1, 'walls stop a body: ' + JSON.stringify(s));
  s = await ev(() => { const h = __hide, L = h.P.lids.lockersA_3, g = h.WORLD.GEO.lockersA, r = {}; r.shut0 = L.angle(); L.set(true); h.sim(90); r.open = L.angle(); r.mess = h.SK.messAt('lockersA'); L.set(false); h.sim(120); r.shut = L.angle(); const d = h.P.lids.doorL2, a = d.angle(); d.set(a < .35); h.sim(120); r.door = Math.abs(d.angle() - a); d.set(a >= .35); h.sim(120); return r; });
  ok(s.open > .6 && /locker door/.test(s.mess) && s.shut < .25 && s.door > .5, 'a locker opens and shuts, an open one is noticed, and a room door swings: ' + JSON.stringify(s));
  s = await ev(() => { const h = __hide, r = {}, B = h.WORLD.breaker; h.PL.place(B.x, 0, B.z - .7, Math.PI); h.sim(5); h.PL.use(); h.sim(3); r.off = h.WORLD.power; h.PL.use(); h.sim(3); r.back = h.WORLD.power; const D = h.WORLD.door; h.PL.place(D.x, 0, D.z + .8, 0); h.sim(10); h.PL.use(); h.sim(5); r.locked = h.G.mode === 'hide'; h.PL.key = true; h.PL.use(); h.sim(200); r.mode = h.G.mode; r.how = h.G.how; r.won = h.G.won; r.limbs = h.PL.body ? 1 : 0; return r; });
  ok(s.off === false && s.back === true, 'the breaker box puts the lights out and on again'); ok(s.locked && s.mode === 'end' && s.won && s.how === 'escaped', 'the fire door is chained without the key, and with it you get out: ' + JSON.stringify(s));
  s = await ev(() => round(h => { h.PL.place(0, 0, -12, Math.PI); }, 200)); ok(s.mode === 'end' && !s.won, 'standing in the corridor, it finds you: ' + JSON.stringify(s));
  await ev(() => { __hide.renderer.render(__hide.scene, __hide.camera); }); await shot(pg, 'caught');
  s = await ev(() => round(h => { h.PL.place(-6.9, 0, -39.2, 0); h.PL.stance = 2; h.PL.keys.KeyQ = true; h.SK.patience = 40; }, 120)); await ev(() => { __hide.PL.keys.KeyQ = false; });
  ok(s.thoughts > 1 && s.searched > 0, 'it thinks and searches: ' + JSON.stringify(s));
  ok(errs.length === 0, 'no errors on the page' + (errs.length ? ': ' + errs.slice(0, 4).join(' | ') : '')); await pg.close();

  const iwer = fs.readFileSync(require.resolve('iwer/build/iwer.js'), 'utf8') + ';window.__xrd=new IWER.XRDevice(IWER.metaQuest3);window.__xrd.installRuntime({forceInstall:true});';
  const V = await open(iwer), vr = V.pg, ve = (f, a) => vr.evaluate(f, a);
  ok(await ve(() => !document.getElementById('bvr').disabled), 'in a Quest 3 ENTER HEADSET is offered');
  await vr.click('#bvr', { noWaitAfter: true }); let on = false; for (let i = 0; i < 60 && !on; i++) { await vr.waitForTimeout(500); on = await ve(() => __hide.renderer.xr.isPresenting && __hide.G.mode === 'ready'); }
  ok(on, 'ENTER HEADSET puts you in the school'); await vr.waitForTimeout(1500);
  s = await ve(() => ({ y: __hide.PL.head.y, hands: __hide.PL.hands.filter(h => h.on).length })); ok(s.y > 1.2 && s.hands === 2, 'you stand at your own height with two hands: ' + JSON.stringify(s));
  await ve(() => __xrd.controllers.right.updateButtonValue('trigger', 1)); await vr.waitForFunction(() => __hide.G.mode === 'hide', null, { timeout: 90000 }).catch(() => {}); await ve(() => __xrd.controllers.right.updateButtonValue('trigger', 0)); ok(await ve(() => __hide.G.mode === 'hide'), 'a trigger starts the minute');
  const p0 = await ve(() => ({ z: __hide.PL.pos.z, r: __hide.rig.rotation.y })); await ve(() => __xrd.controllers.left.updateAxes('thumbstick', 0, -.8)); await vr.waitForFunction(p => __hide.PL.pos.z < p.z - .3, p0, { timeout: 120000 }).catch(() => {}); await ve(() => __xrd.controllers.left.updateAxes('thumbstick', 0, 0));
  ok(await ve(p => __hide.PL.pos.z < p.z - .3, p0), 'the left stick walks you in');
  await ve(() => __xrd.controllers.right.updateAxes('thumbstick', 1, 0)); await vr.waitForFunction(p => Math.abs(__hide.rig.rotation.y - p.r) > .4, p0, { timeout: 90000 }).catch(() => {}); await ve(() => __xrd.controllers.right.updateAxes('thumbstick', 0, 0)); ok(await ve(p => Math.abs(__hide.rig.rotation.y - p.r) > .4, p0), 'the right stick turns you');
  await shot(vr, 'quest'); ok(V.errs.length === 0, 'no errors in the headset' + (V.errs.length ? ': ' + V.errs.slice(0, 4).join(' | ') : ''));
  await b.close(); srv.close(); console.log(fails.length ? fails.length + ' FAILED' : 'ALL OK'); process.exit(fails.length ? 1 : 0);
})().catch(e => { console.log('FAIL the check itself broke: ' + e.message); process.exit(1); });
