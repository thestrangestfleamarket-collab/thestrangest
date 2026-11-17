// THE GARAGE CHECK: node tests/drums.cjs [dist/drums.html] [folder for screenshots]. THE GARAGE loads its kit, models and recordings; every key plays its piece and its zone, a click strikes where it lands, the hi-hat's pedal chicks; then the same page in an emulated Quest 3 (IWER): you are seated at the kit, a stick through a head plays it once and not again until it has come up, the bell, bow and edge of a cymbal are told apart, a rimshot and a hoop are told from a head, the triggers are the kick and the hi-hat, a grip on a cymbal stops it, the sticks set by the thumbstick stay set.
const { chromium } = require('playwright'), path = require('path'), fs = require('fs');
const fails = [], ok = (c, m) => { if (!c) { fails.push(m); console.log((process.env.GITHUB_ACTIONS ? '::error title=drums::' : 'FAIL ') + m); } else console.log('ok   ' + m); };
const PAGE = path.resolve(process.argv[2] || 'dist/drums.html'), ROOT = path.dirname(PAGE), OUT = process.argv[3]; if (OUT) fs.mkdirSync(OUT, { recursive: true });
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.glb': 'model/gltf-binary', '.json': 'application/json', '.mp3': 'audio/mpeg', '.jpg': 'image/jpeg' };
const srv = require('http').createServer((q, r) => { const f = path.join(ROOT, decodeURIComponent(q.url.split('?')[0])); if (!f.startsWith(ROOT)) { r.writeHead(403); return r.end(); }
  fs.readFile(f, (e, d) => { if (e) { r.writeHead(404); return r.end(); } r.writeHead(200, { 'content-type': TYPES[path.extname(f)] || 'application/octet-stream' }); r.end(d); }); });
const IWER = fs.readFileSync(require.resolve('iwer/build/iwer.min.js'), 'utf8');
const quest = IWER + ';window.xrDevice=new IWER.XRDevice(IWER.metaQuest3);xrDevice.installRuntime({forceInstall:true});xrDevice.position.set(0.3,1.6,0.2);xrDevice.primaryInputMode="controller";';
(async () => {
  await new Promise(res => srv.listen(0, '127.0.0.1', res)); const FILE = 'http://127.0.0.1:' + srv.address().port + '/' + path.basename(PAGE) + '?low' + (OUT ? '&lines=600' : '');
  const b = await chromium.launch({ ...(process.env.PWCHROME ? { executablePath: process.env.PWCHROME } : {}), args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--autoplay-policy=no-user-gesture-required'] });
  let n = 0; const shot = async (pg, name) => { if (OUT) await pg.screenshot({ path: path.join(OUT, String(++n).padStart(2, '0') + '-' + name + '.png'), timeout: 120000 }); };
  const open = async init => { const pg = await b.newPage({ viewport: { width: 1024, height: 640 } }), errs = [], miss = [];
    pg.on('pageerror', e => errs.push(e.message.slice(0, 300))); pg.on('requestfailed', r => miss.push(r.url().split('/').pop())); pg.on('response', r => { if (r.status() >= 400) miss.push(r.status() + ' ' + r.url().split('/').pop()); }); pg.on('console', m => { if (m.type() === 'error') errs.push('console: ' + m.text().slice(0, 300)); });
    if (init) await pg.addInitScript(init); await pg.goto(FILE, { waitUntil: 'commit', timeout: 120000 }); await pg.waitForFunction(() => window.__drums && __drums.ready, null, { timeout: 420000 }).catch(() => {});
    return { pg, errs, miss, ev: (f, a) => pg.evaluate(f, a), wait: (f, ms = 60000) => pg.waitForFunction(f, null, { timeout: ms }).then(() => true, () => false) }; };

  // on a screen
  { const { pg, errs, miss, ev, wait } = await open(); await shot(pg, 'start');
    const s0 = await ev(() => ({ ready: __drums.ready, snd: __drums.sound.ready, takes: Object.values(__drums.sound.kit.pieces).reduce((a, p) => a + p.s.length, 0), pieces: __drums.kit.pieces.length, guide: document.querySelectorAll('#go dt').length, go: !document.getElementById('go').hidden }));
    ok(s0.ready && s0.snd && s0.takes > 200 && s0.pieces === 9 && s0.go && s0.guide >= 18, 'it loads: nine pieces, the recorded kit, and the start card lists every control: ' + JSON.stringify(s0));
    await pg.click('#screen'); ok(await wait(() => __drums.mode === 'screen' && !document.getElementById('help').hidden), 'PLAY ON SCREEN seats you with the keys on a strip'); await pg.waitForTimeout(600); await shot(pg, 'seat');
    const seen = []; for (const k of ['Space', 'KeyS', 'KeyA', 'KeyD', 'KeyF', 'KeyG', 'KeyW', 'KeyT', 'KeyE', 'KeyR', 'KeyX', 'KeyC']) { await pg.keyboard.press(k); await pg.waitForTimeout(90); seen.push(await ev(() => __drums.stats.last.piece + ':' + __drums.stats.last.zone)); }
    ok(seen.join() === 'kick:head,snare:head,hat:bow,tom1:head,tom2:head,floor:head,crash1:edge,crash2:edge,ride:bow,ride:bell,snare:cross,snare:rimshot', 'twelve keys play nine pieces and their zones: ' + seen.join(' '));
    ok(await ev(() => __drums.stats.hits === 12 && __drums.sound.stats.hits >= 12 && Object.values(__drums.guide.labels).every(l => l.played)), 'each sounded once, and each piece\'s name went once it was played'); await shot(pg, 'played');
    await pg.keyboard.down('KeyQ'); await pg.keyboard.press('KeyA'); const open1 = await ev(() => __drums.sound.hat); await pg.keyboard.up('KeyQ'); await pg.waitForTimeout(80);
    ok(open1 === 1 && await ev(() => __drums.sound.hat === 0 && __drums.sound.stats.last.zone === 'pedal'), 'Q holds the hi-hat open; letting go shuts it with the pedal\'s chick');
    await pg.waitForTimeout(6000);
    const at = await ev(() => { const D = __drums, p = D.kit.P.crash1, v = p.wc.clone().add(new p.wc.constructor(0, 0.03, 0)); v.project(D.camera); const e = new p.wc.constructor(0, D.kit.height(p, p.radius * 0.6), p.radius * 0.6).applyMatrix4(p.group.matrixWorld); e.project(D.camera); return [[(v.x + 1) / 2 * innerWidth, (1 - v.y) / 2 * innerHeight], [(e.x + 1) / 2 * innerWidth, (1 - e.y) / 2 * innerHeight]]; });
    await pg.waitForTimeout(0); await pg.mouse.click(at[0][0], at[0][1]); const c1 = await ev(() => __drums.stats.last); await pg.mouse.click(at[1][0], at[1][1]); const c2 = await ev(() => __drums.stats.last);
    ok(c1.piece === 'crash1' && c1.zone === 'bell' && c2.piece === 'crash1' && c2.zone === 'bow' && c2.r > c1.r, 'a click on a crash\'s bell plays the bell, a click on its bow the bow, where it landed: ' + c1.piece + ' ' + c1.zone + ', ' + c2.piece + ' ' + c2.zone);
    const r = await ev(() => ({ calls: __drums.renderer.info.render.calls, tris: __drums.renderer.info.render.triangles, lines: __drums.renderer.domElement.height }));
    ok(r.calls < 320 && r.tris < 260000, 'the whole garage is ' + r.calls + ' draws and ' + r.tris + ' triangles, drawn ' + r.lines + ' lines tall');
    ok(miss.length === 0 && errs.length === 0, 'no missing file, no page error' + (miss.length || errs.length ? ': ' + miss.concat(errs).join(' | ') : '')); await pg.close(); }

  // in the headset
  const drive = () => {
    const V = __drums.camera.position.constructor;
    // move a controller until its stick's tip is at a point in the world
    window.tipTo = async (side, w) => { const D = __drums, c = xrDevice.controllers[side]; for (let i = 0; i < 3; i++) { const e = D.rig.worldToLocal(w.clone()).sub(D.rig.worldToLocal(D.sticks[side].tip.clone())); c.position.x += e.x; c.position.y += e.y; c.position.z += e.z; await new Promise(r => setTimeout(r, 120)); } };
    // turn a controller until its stick points down and away, as a drummer holds one
    window.aim = async (side) => { const D = __drums, c = xrDevice.controllers[side], Qn = D.camera.quaternion.constructor; for (let i = 0; i < 3; i++) { const st = D.sticks[side], cur = st.tip.clone().sub(st.pos).normalize(), q = new Qn().setFromUnitVectors(cur, new V(0, -0.5, -0.866)).multiply(new Qn(c.quaternion.x, c.quaternion.y, c.quaternion.z, c.quaternion.w)); c.quaternion.set(q.x, q.y, q.z, q.w); await new Promise(r => setTimeout(r, 150)); } const st = D.sticks[side]; return +st.tip.clone().sub(st.pos).normalize().y.toFixed(2); };
    // a point on a piece: u across its radius toward you, h above its surface
    window.on = (name, u, h) => { const D = __drums, p = D.kit.P[name], o = name === 'hat' ? p.top : p.group, rho = u * p.radius; return new V(0, D.kit.height(p, rho) + h, rho).applyMatrix4(o.matrixWorld); };
    window.strike = async (side, name, u) => { const D = __drums, b = D.stats.hits; for (const h of [0.12, 0.04, -0.03]) await tipTo(side, on(name, u, h)); const got = D.stats.hits - b, last = D.stats.last; await tipTo(side, on(name, u, 0.15)); return { got, zone: last && last.zone, piece: last && last.piece, r: last && +last.r.toFixed(2) }; };
  };
  { const { pg, errs, ev, wait } = await open(quest); await wait(() => !document.getElementById('vr').disabled); await ev(drive);
    await pg.click('#vr'); ok(await wait(() => __drums.renderer.xr.isPresenting && __drums.sticks.right.active && __drums.sticks.left.active, 60000), 'ENTER VR starts the session with a stick in each hand');
    await pg.waitForTimeout(1500);
    const seat = await ev(() => { const D = __drums, p = new D.camera.position.constructor(); D.renderer.xr.getCamera().getWorldPosition(p); return [+p.x.toFixed(2), +p.y.toFixed(2), +p.z.toFixed(2)]; });
    ok(Math.abs(seat[0]) < 0.05 && Math.abs(seat[1] - 1.24) < 0.05 && Math.abs(seat[2] - 0.1) < 0.05, 'wherever you stand in your room, your eyes are at the drummer\'s: ' + seat);
    const held = await ev(async () => [await aim('left'), await aim('right')]); ok(held.join() === '-0.5,-0.5', 'the sticks are held sloping down at the kit: ' + held);
    const a = await ev(async () => { const o = []; o.push(await strike('right', 'snare', 0.2)); o.push(await strike('right', 'tom2', 0.1)); o.push(await strike('left', 'tom1', 0.6)); o.push(await strike('right', 'floor', 0.3)); return o; });
    ok(a.every(x => x.got === 1 && x.zone === 'head') && a.map(x => x.piece).join() === 'snare,tom2,tom1,floor' && a[2].r > 0.5 && a[1].r < 0.2, 'a stick through a head plays that drum once, and where on the head is known: ' + JSON.stringify(a));
    const hold = await ev(async () => { const D = __drums, b = D.stats.hits; await tipTo('right', on('snare', 0.2, 0.1)); await tipTo('right', on('snare', 0.2, -0.04)); await tipTo('right', on('snare', 0.3, -0.05)); await tipTo('right', on('snare', 0.1, -0.02)); const one = D.stats.hits - b; await tipTo('right', on('snare', 0.2, 0.004)); await tipTo('right', on('snare', 0.2, -0.03)); const low = D.stats.hits - b; await tipTo('right', on('snare', 0.2, 0.03)); await tipTo('right', on('snare', 0.2, -0.03)); return [one, low, D.stats.hits - b]; });
    ok(hold.join() === '1,1,2', 'a stick left in the head does not play again; nor one lifted half a centimetre; lifted clear and brought down, it does: ' + hold);
    const cy = await ev(async () => { const o = []; for (const u of [0.05, 0.5, 0.92]) o.push((await strike('right', 'ride', u)).zone); o.push((await strike('left', 'crash1', 0.5)).zone); o.push((await strike('left', 'hat', 0.5)).piece); return o; });
    ok(cy.join() === 'bell,bow,edge,bow,hat', 'a cymbal\'s bell, bow and edge are told apart: ' + cy);
    const rim = await ev(async () => { const D = __drums, p = D.kit.P.snare, b = D.stats.hits; for (const h of [0.1, 0.03, -0.02]) await tipTo('right', on('snare', 1.05, h)); const z = D.stats.last.zone, got = D.stats.hits - b; await tipTo('right', on('snare', 1.05, 0.15)); return [got, z]; });
    ok(rim[0] === 1 && rim[1] === 'rim', 'the tip on a hoop is the hoop, not the head: ' + rim);
    const kick = await ev(async () => { const D = __drums, b = D.stats.hits, c = xrDevice.controllers.right; c.updateButtonValue('trigger', 1); await new Promise(r => setTimeout(r, 300)); const down = D.stats.hits - b, ped = D.kit.pedal; await new Promise(r => setTimeout(r, 300)); const held = D.stats.hits - b; c.updateButtonValue('trigger', 0); await new Promise(r => setTimeout(r, 300)); return [down, held, D.stats.last.piece, ped]; });
    ok(kick[0] === 1 && kick[1] === 1 && kick[2] === 'kick' && kick[3] === 1, 'the right trigger is the kick: once as it is pulled, not again while it is held: ' + kick);
    const hat = await ev(async () => { const D = __drums, c = xrDevice.controllers.left; c.updateButtonValue('trigger', 1); await new Promise(r => setTimeout(r, 1500)); const open = D.sound.hat, gap = D.kit.P.hat.top.position.y; const s = await strike('right', 'hat', 0.5); c.updateButtonValue('trigger', 0); await new Promise(r => setTimeout(r, 300)); return [open, +gap.toFixed(3), s.got, D.sound.hat, D.sound.stats.last.zone]; });
    ok(hat[0] === 1 && hat[1] > 0.015 && hat[2] === 1 && hat[3] === 0 && hat[4] === 'pedal', 'the left trigger lifts the hi-hat\'s top cymbal; struck, it rings open; let go, it shuts with a chick: ' + hat);
    const choke = await ev(async () => { const D = __drums, c = xrDevice.controllers.left, e = on('crash2', 1, 0); for (let i = 0; i < 3; i++) { const d = D.rig.worldToLocal(e.clone()).sub(D.rig.worldToLocal(D.sticks.left.pos.clone())); c.position.x += d.x; c.position.y += d.y; c.position.z += d.z; await new Promise(r => setTimeout(r, 120)); }
      D.sound.hit('crash2', 0.9, 'edge', 0.9); const ring = D.sound.voices.crash2.filter(v => !v.dead).length; c.updateButtonValue('squeeze', 1); await new Promise(r => setTimeout(r, 1500)); const left = D.sound.voices.crash2.filter(v => !v.dead).length; c.updateButtonValue('squeeze', 0); return [ring, left]; });
    ok(choke[0] >= 1 && choke[1] === 0, 'a hand closed on a ringing crash stops it: ' + choke);
    const tilt = await ev(async () => { const D = __drums, c = xrDevice.controllers.right, t0 = D.set.tilt; c.updateAxes('thumbstick', 0, -1); await new Promise(r => setTimeout(r, 1500)); c.updateAxes('thumbstick', 0, 0); await new Promise(r => setTimeout(r, 100)); return [t0, +D.set.tilt.toFixed(2), JSON.parse(localStorage.getItem('drums1')).tilt > 0]; });
    ok(tilt[1] > tilt[0] + 0.02 && tilt[2], 'the right thumbstick tips the sticks in your hands, and it is kept: ' + tilt);
    ok(await ev(() => __drums.guide.card.visible && __drums.hands.right.ready && __drums.hands.left.ready && __drums.body.ready), 'the guide card is up, a hand is closed round each stick, your body is on the throne'); await shot(pg, 'vr');
    ok(errs.length === 0, 'no page error in the headset' + (errs.length ? ': ' + errs.join(' | ') : '')); await pg.close(); }

  await b.close(); srv.close(); console.log(fails.length ? fails.length + ' FAILED' : 'the garage check passed'); process.exit(fails.length ? 1 : 0);
})();
