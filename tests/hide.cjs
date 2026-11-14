// THE HIDE CHECK: node tests/hide.cjs [dist/hide.html] [folder for screenshots]. DEAD END loads, its twenty places can each be reached by the thing, a body cannot pass a wall, climbs into the dumpster and shuts the lid, a knocked can is heard and remembered, standing in the open is caught, lying under the shutter with nothing disturbed is not; then the same page in an emulated Quest 3 (start, walk, turn, crouch, hold breath).
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
  ok(up, 'the page loads its pictures, models and sounds (' + ((Date.now() - t0) / 1000).toFixed(0) + ' s)');
  if (!up) { console.log('it says: ' + await pg.textContent('#note').catch(() => '?') + (errs.length ? '\npage errors: ' + errs.join(' | ') : '')); await b.close(); srv.close(); process.exit(1); }
  ok(miss.length === 0, 'every file is found' + (miss.length ? ': ' + miss.join(', ') : '')); await shot(pg, 'title');
  await pg.click('#bdesk'); await pg.waitForFunction(() => __hide.G.mode === 'ready'); await pg.waitForTimeout(1500); await shot(pg, 'ready');
  // from here the test steps the game itself, a sixtieth of a second at a time, and the page stops drawing
  await ev(() => { const h = __hide; h.renderer.setAnimationLoop(null); window.go = (keys, k) => { for (const c of keys) h.PL.keys[c] = true; h.sim(k); for (const c of keys) h.PL.keys[c] = false; };
    window.round = (setup, secs) => { h.reset(); h.startRound(); h.G.left = .05; h.sim(5); setup(h); for (let i = 0; i < secs * 60 && h.G.mode === 'seek'; i++) h.sim(1); return { mode: h.G.mode, won: h.G.won, t: Math.round(h.SK.t), searched: Object.keys(h.SK.searched).length, thoughts: h.SK.thoughts.length, clues: h.SK.clues.map(c => c.kind).join() }; }; });
  let s = await ev(() => { const h = __hide; return { spots: h.SPOTS.length, geo: h.SPOTS.every(s => h.WORLD.GEO[s.id]), mess: h.SPOTS.map(s => h.SK.messAt(s.id)).filter(Boolean), things: h.P.things.length, lids: Object.keys(h.P.lids).sort().join(),
    far: h.SPOTS.filter(s => { const g = h.WORLD.GEO[s.id]; h.SK.pos.set(0, 0, 2); const p = h.SK.pathTo(g.at[0], g.at[1]), e = p[p.length - 1]; return p.length < 2 || Math.hypot(e[0] - g.at[0], e[1] - g.at[1]) > .4; }).map(s => s.id) }; });
  ok(s.spots === 20 && s.geo && s.things > 45 && s.lids === 'dumpster1,dumpster2,locker', 'twenty places, ' + s.things + ' loose things, two lids and a door');
  ok(s.mess.length === 0, 'nothing is out of place before you touch it' + (s.mess.length ? ': ' + s.mess.join(' / ') : '')); ok(s.far.length === 0, 'the thing can walk to every place' + (s.far.length ? ', but not: ' + s.far.join() : ''));
  s = await ev(() => { const h = __hide; h.startRound(); h.sim(30); const left = h.G.left; h.PL.place(2, 0, -5, -Math.PI / 2); go(['KeyW'], 120); const wall = h.PL.pos.x; h.PL.place(0, 0, -32, 0); go(['KeyW', 'ShiftLeft'], 240); return { mode: h.G.mode, left, wall, end: h.PL.pos.z, y: h.PL.pos.y }; });
  ok(s.mode === 'hide' && s.left < 60 && s.left > 58, 'START begins the count from sixty'); ok(s.wall < 2.4 && s.wall > 2.2 && s.end > -33.8 && Math.abs(s.y) < .1, 'walls stop a body: ' + JSON.stringify(s));
  s = await ev(() => { const h = __hide; h.PL.place(-.9, 0, -6.5, Math.PI / 2); h.sim(5); h.PL.tryMantle(); h.sim(60); const inside = { x: h.PL.pos.x, y: h.PL.pos.y }; h.PL.setStance(1); h.sim(20); h.PL.use(); h.sim(180); const a = h.P.lids.dumpster1.angle(); h.PL.setStance(0); h.sim(20); return { inside, a, st: h.PL.stance, mess: h.SK.messAt('dumpster1') }; });
  ok(s.inside.x < -1.6 && s.inside.y > .1 && s.inside.y < .3, 'SPACE climbs into the dumpster'); ok(s.a < .1 && s.st === 1 && /SHUT/.test(s.mess), 'its lid shuts over you, you cannot stand up under it, and a shut lid is something it can notice');
  s = await ev(() => { const h = __hide; h.PL.place(-1.6, 0, -31.2, Math.PI / 2); h.PL.stance = 1; h.sim(20); go(['KeyW'], 200); const crouch = h.PL.pos.x; h.PL.place(-1.6, 0, -31.2, Math.PI / 2); h.PL.stance = 2; h.sim(20); go(['KeyW'], 300); return { crouch, prone: h.PL.pos.x }; });
  ok(s.crouch > -2.6 && s.prone < -3.5, 'the shutter lets you under only lying flat: ' + JSON.stringify(s));
  s = await ev(() => { const h = __hide; h.PL.place(-1.5, 0, -13.2, 0); h.PL.stance = 2; h.sim(20); go(['KeyW'], 150); h.sim(90); return { covered: h.WORLD.cloth.blocks(new h.THREE.Vector3(0, 2, -14.9), h.PL.head), mess: h.SK.messAt('blankets') }; });
  ok(s.covered && /lump/.test(s.mess), 'the blanket lies over you, and makes a lump');
  s = await ev(() => round(h => { h.PL.place(0, 0, -12, Math.PI); }, 150)); ok(s.mode === 'end' && !s.won, 'standing in the open, it finds you: ' + JSON.stringify(s));
  await ev(() => { __hide.renderer.render(__hide.scene, __hide.camera); }); await shot(pg, 'caught');
  s = await ev(() => round(h => { h.PL.place(.6, 0, -3.1, -Math.PI / 2); go(['KeyW', 'ShiftLeft'], 60); h.sim(60); h.PL.place(0, 0, -9, Math.PI); h.PL.noises.length && 0; for (let i = 0; i < 240 && !h.SK.clues.length; i++) h.sim(1); }, 0));
  const c2 = await ev(() => { const h = __hide; return { clues: h.SK.clues.map(c => c.kind + ':' + (c.note || '')).join(' | '), mess: h.SK.messAt('bins') }; }); ok(/noise/.test(c2.clues) && /knocked/.test(c2.mess), 'a can kicked over while it is in the alley is heard, and stays knocked over: ' + JSON.stringify(c2));
  s = await ev(() => round(h => { h.PL.place(-4.3, 0, -32.3, 0); h.PL.stance = 2; h.PL.keys.KeyQ = true; h.SK.patience = 40; }, 120)); await ev(() => { __hide.PL.keys.KeyQ = false; });
  ok(s.thoughts > 1 && s.searched > 0, 'it thinks and searches: ' + JSON.stringify(s));
  ok(errs.length === 0, 'no errors on the page' + (errs.length ? ': ' + errs.slice(0, 4).join(' | ') : '')); await pg.close();

  const iwer = fs.readFileSync(require.resolve('iwer/build/iwer.js'), 'utf8') + ';window.__xrd=new IWER.XRDevice(IWER.metaQuest3);window.__xrd.installRuntime({forceInstall:true});';
  const V = await open(iwer), vr = V.pg, ve = (f, a) => vr.evaluate(f, a);
  ok(await ve(() => !document.getElementById('bvr').disabled), 'in a Quest 3 ENTER HEADSET is offered');
  await vr.click('#bvr', { noWaitAfter: true }); let on = false; for (let i = 0; i < 60 && !on; i++) { await vr.waitForTimeout(500); on = await ve(() => __hide.renderer.xr.isPresenting && __hide.G.mode === 'ready'); }
  ok(on, 'ENTER HEADSET puts you in the alley'); await vr.waitForTimeout(1500);
  s = await ve(() => ({ y: __hide.PL.head.y, z: __hide.PL.pos.z, hands: __hide.PL.hands.filter(h => h.on).length })); ok(s.y > 1.2 && s.hands === 2, 'you stand at your own height with two hands: ' + JSON.stringify(s));
  await ve(() => __xrd.controllers.right.updateButtonValue('trigger', 1)); await vr.waitForFunction(() => __hide.G.mode === 'hide', null, { timeout: 60000 }).catch(() => {}); await ve(() => __xrd.controllers.right.updateButtonValue('trigger', 0)); ok(await ve(() => __hide.G.mode === 'hide'), 'the right trigger starts the minute');
  const p0 = await ve(() => ({ z: __hide.PL.pos.z, r: __hide.rig.rotation.y })); await ve(() => __xrd.controllers.left.updateAxes('thumbstick', 0, -.8)); await vr.waitForFunction(p => __hide.PL.pos.z < p.z - .3, p0, { timeout: 90000 }).catch(() => {}); await ve(() => __xrd.controllers.left.updateAxes('thumbstick', 0, 0));
  ok(await ve(p => __hide.PL.pos.z < p.z - .3, p0), 'the left stick walks you in');
  await ve(() => __xrd.controllers.right.updateAxes('thumbstick', 1, 0)); await vr.waitForFunction(p => Math.abs(__hide.rig.rotation.y - p.r) > .4, p0, { timeout: 60000 }).catch(() => {}); await ve(() => __xrd.controllers.right.updateAxes('thumbstick', 0, 0)); ok(await ve(p => Math.abs(__hide.rig.rotation.y - p.r) > .4, p0), 'the right stick turns you');
  await vr.waitForTimeout(600); await ve(() => __xrd.controllers.right.updateAxes('thumbstick', 0, 1)); await vr.waitForFunction(() => __hide.PL.stance === 1, null, { timeout: 60000 }).catch(() => {}); await ve(() => __xrd.controllers.right.updateAxes('thumbstick', 0, 0)); await vr.waitForTimeout(1500);
  s = await ve(() => ({ st: __hide.PL.stance, y: __hide.PL.head.y - __hide.PL.pos.y })); ok(s.st === 1 && s.y < 1.2, 'the right stick pulled down crouches you: ' + JSON.stringify(s));
  await ve(() => __xrd.controllers.left.updateButtonValue('trigger', 1)); await vr.waitForFunction(() => __hide.PL.breath.holding, null, { timeout: 60000 }).catch(() => {}); ok(await ve(() => __hide.PL.breath.holding), 'the left trigger holds your breath'); await ve(() => __xrd.controllers.left.updateButtonValue('trigger', 0));
  await shot(vr, 'quest'); ok(V.errs.length === 0, 'no errors in the headset' + (V.errs.length ? ': ' + V.errs.slice(0, 4).join(' | ') : ''));
  await b.close(); srv.close(); console.log(fails.length ? fails.length + ' FAILED' : 'ALL OK'); process.exit(fails.length ? 1 : 0);
})().catch(e => { console.log('FAIL the check itself broke: ' + e.message); process.exit(1); });
