// THE GARAGE CHECK: node tests/drums.cjs [dist/drums.html] [folder for screenshots] (ONLY=screen leaves the headset out). THE GARAGE loads its kit, models and recordings; every key plays its piece and its zone, a click strikes where it lands, the hi-hat's pedal chicks; then the same page in an emulated Quest 3 (IWER): you are seated at the kit, a stick through a head plays it once and not again until it has come up, the bell, bow and edge of a cymbal are told apart, a rimshot and a hoop are told from a head, the triggers are the kick and the hi-hat, a grip on a cymbal stops it, the sticks set by the thumbstick stay set.
const { chromium } = require('playwright'), path = require('path'), fs = require('fs');
const fails = [], ok = (c, m) => { if (!c) { fails.push(m); console.log((process.env.GITHUB_ACTIONS ? '::error title=drums::' : 'FAIL ') + m); } else console.log('ok   ' + m); };
const PAGE = path.resolve(process.argv[2] || 'dist/drums.html'), ROOT = path.dirname(PAGE), OUT = process.argv[3]; if (OUT) fs.mkdirSync(OUT, { recursive: true });
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.glb': 'model/gltf-binary', '.json': 'application/json', '.mp3': 'audio/mpeg', '.jpg': 'image/jpeg' };
const srv = require('http').createServer((q, r) => { const f = path.join(ROOT, decodeURIComponent(q.url.split('?')[0])); if (!f.startsWith(ROOT)) { r.writeHead(403); return r.end(); }
  fs.readFile(f, (e, d) => { if (e) { r.writeHead(404); return r.end(); } r.writeHead(200, { 'content-type': TYPES[path.extname(f)] || 'application/octet-stream' }); r.end(d); }); });
const IWER = fs.readFileSync(require.resolve('iwer/build/iwer.min.js'), 'utf8');
const quest = IWER + ';window.xrDevice=new IWER.XRDevice(IWER.metaQuest3);xrDevice.installRuntime({forceInstall:true});xrDevice.position.set(0.3,1.6,0.2);xrDevice.primaryInputMode="controller";';
(async () => {
  await new Promise(res => srv.listen(0, '127.0.0.1', res)); const FILE = 'http://127.0.0.1:' + srv.address().port + '/' + path.basename(PAGE) + '?low&hour=15&hold' + (OUT ? '&lines=600' : '');
  const b = await chromium.launch({ ...(process.env.PWCHROME ? { executablePath: process.env.PWCHROME } : {}), args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--autoplay-policy=no-user-gesture-required'] });
  let n = 0; const shot = async (pg, name) => { if (OUT) await pg.screenshot({ path: path.join(OUT, String(++n).padStart(2, '0') + '-' + name + '.png'), timeout: 120000 }); };
  const open = async init => { const pg = await b.newPage({ viewport: { width: 1024, height: 640 } }), errs = [], miss = [];
    pg.on('pageerror', e => errs.push(e.message.slice(0, 300))); pg.on('requestfailed', r => { if (!/\/drums\/(load|save|talk)$|archive\.org/.test(r.url())) miss.push(r.url().split('/').pop()); }); pg.on('response', r => { if (r.status() >= 400 && !/\/drums\/(load|save|talk)$|archive\.org/.test(r.url())) miss.push(r.status() + ' ' + r.url().split('/').pop()); }); pg.on('console', m => { if (m.type() === 'error' && !/Failed to load resource/.test(m.text())) errs.push('console: ' + m.text().slice(0, 300)); });
    if (init) await pg.addInitScript(init); await pg.goto(FILE, { waitUntil: 'commit', timeout: 120000 }); await pg.waitForFunction(() => window.__drums && __drums.ready, null, { timeout: 420000 }).catch(() => {});
    return { pg, errs, miss, ev: (f, a) => pg.evaluate(f, a), wait: (f, ms = 60000) => pg.waitForFunction(f, null, { timeout: ms }).then(() => true, () => false) }; };

  // on a screen
  if (process.env.ONLY !== 'vr') { const { pg, errs, miss, ev, wait } = await open(); await shot(pg, 'start');
    const s0 = await ev(() => ({ ready: __drums.ready, snd: __drums.sound.ready, takes: Object.values(__drums.sound.kit.pieces).reduce((a, p) => a + p.s.length, 0), pieces: __drums.kit.pieces.length, guide: document.querySelectorAll('#go dt').length, go: !document.getElementById('go').hidden }));
    ok(s0.ready && s0.snd && s0.takes > 200 && s0.pieces === 9 && s0.go && s0.guide >= 18, 'it loads: nine pieces, the recorded kit, and the start card lists every control: ' + JSON.stringify(s0));
    await pg.click('#screen'); ok(await wait(() => __drums.mode === 'screen' && !document.getElementById('help').hidden), 'PLAY ON SCREEN seats you with the keys on a strip'); await pg.waitForTimeout(600); await shot(pg, 'seat');
    const seen = []; for (const k of ['Space', 'KeyS', 'KeyA', 'KeyD', 'KeyF', 'KeyG', 'KeyW', 'KeyT', 'KeyE', 'KeyR', 'KeyX', 'KeyC']) { await pg.keyboard.press(k); await pg.waitForTimeout(90); seen.push(await ev(() => __drums.stats.last.piece + ':' + __drums.stats.last.zone)); }
    ok(seen.join() === 'kick:head,snare:head,hat:bow,tom1:head,tom2:head,floor:head,crash1:edge,crash2:edge,ride:bow,ride:bell,snare:cross,snare:rimshot', 'twelve keys play nine pieces and their zones: ' + seen.join(' '));
    ok(await ev(() => __drums.stats.hits === 12 && __drums.sound.stats.hits >= 12 && Object.values(__drums.guide.labels).every(l => l.played)), 'each sounded once, and each piece\'s name went once it was played'); await shot(pg, 'played');
    await pg.keyboard.down('KeyQ'); await pg.keyboard.press('KeyA'); const open1 = await ev(() => __drums.sound.hat); await pg.keyboard.up('KeyQ'); await pg.waitForTimeout(80);
    ok(open1 === 1 && await ev(() => __drums.sound.hat === 0 && __drums.sound.stats.last.zone === 'pedal'), 'Q holds the hi-hat open; letting go shuts it with the pedal\'s chick');
    await ev(async () => { const p = __drums.kit.P.crash1; p.ax = p.az = p.vx = p.vz = 0; await new Promise(r => setTimeout(r, 600)); });
    const at = await ev(() => { const D = __drums, p = D.kit.P.crash1, v = p.wc.clone().add(new p.wc.constructor(0, 0.03, 0)); v.project(D.camera); const e = new p.wc.constructor(0, D.kit.height(p, p.radius * 0.6), p.radius * 0.6).applyMatrix4(p.group.matrixWorld); e.project(D.camera); return [[(v.x + 1) / 2 * innerWidth, (1 - v.y) / 2 * innerHeight], [(e.x + 1) / 2 * innerWidth, (1 - e.y) / 2 * innerHeight]]; });
    await pg.waitForTimeout(0); await pg.mouse.click(at[0][0], at[0][1]); const c1 = await ev(() => __drums.stats.last); await pg.mouse.click(at[1][0], at[1][1]); const c2 = await ev(() => __drums.stats.last);
    ok(c1.piece === 'crash1' && c1.zone === 'bell' && c2.piece === 'crash1' && c2.zone === 'bow' && c2.r > c1.r, 'a click on a crash\'s bell plays the bell, a click on its bow the bow, where it landed: ' + c1.piece + ' ' + c1.zone + ', ' + c2.piece + ' ' + c2.zone);
    // the garage door, the hour, the street and its people
    const d0 = await ev(() => __drums.garage.door.open); await pg.keyboard.press('KeyO');
    ok(d0 < 0.3 && await wait(() => __drums.garage.door.open > 0.99, 90000), 'O runs the garage door up its tracks');
    const hr = await ev(async () => { const D = __drums, L = D.life, a = [+D.garage.sunE.toFixed(1), +L.hour.toFixed(1) >= +L.dusk.toFixed(1)]; let top = -99, dark = 0; for (let i = 0; i < 30; i++) { L.skip(); await new Promise(r => setTimeout(r, 250)); top = Math.max(top, D.garage.sunE); if (D.garage.day < 0.05) dark++; } return [...a, +top.toFixed(1), dark, D.street.group.children.length > 20]; });
    ok(hr[0] <= 8 && hr[1] && hr[2] <= 8 && hr[3] >= 15 && hr[4], 'it is dusk when you come in, and through thirty hours on the sun never climbs: dusk, evening and night only: ' + hr);
    const st = await ev(async () => { const D = __drums, S = D.street, p = S.people.find(q => q.id === 'marcus'), nap = ms => new Promise(r => setTimeout(r, ms)); D.life.to(D.life.dusk + 1); await nap(600);
      for (let i = 0; i < 6; i++) D.life.note(1); p.g.visible = true; p.pos.set(-1.5, 0, p.pos.z = -13.75); p.dir = 1; p.asked = false; p.state = 'walk'; p.path = [[44, -13.75]]; p.pi = 0;
      for (let i = 0; i < 160 && p.state !== 'visit'; i++) { D.life.note(1); await nap(250); } const came = p.state, bub = p.bub.sprite.visible, rel = p.rel; await D.life.say('Hello Marcus, how was your shift?'); await nap(300);
      return { n: S.people.length, mixers: S.people.filter(q => q.mixer).length, came, bub, rel, met: p.met, said: D.life.said.length, near: S.nearest() && S.nearest().id, cars: S.cars.length }; });
    ok(st.n === 7 && st.mixers === 7 && st.came === 'visit' && st.bub && st.rel > 0 && st.met && st.said === 1 && st.near === 'marcus' && st.cars === 3, 'seven neighbours with their own motion; one passing hears you play, comes up the drive, speaks, likes you a little more, and answers when spoken to: ' + JSON.stringify(st));
    // a lesson: the count, the notes laid out a bar ahead, each played on its beat, marked, and the next lesson opened
    const les = await ev(async () => { const D = __drums, T = D.teach; let t = 100, played = 0; T.clock = () => t; T.mute = true; T.i = 1; T.start(true); const n0 = T.board.visible;
      for (let k = 0; k < 4000 && T.state !== 'done'; k++) { t += 0.01; T.update(); for (const n of T.notes) if (!n.done && t >= n.t - 0.005) { T.hit(n.piece, 0.7, n.hand === 'L' ? 'left' : 'right'); played++; } }
      const rings = Object.values(D.scene.children).filter(m => m.isMesh && m.geometry.type === 'TorusGeometry').length;
      const out = { shown: n0, played, best: T.best[1], next: D.set.lesson, state: T.state, rings }; T.start(false); T.clock = () => D.sound.ctx.currentTime; T.mute = false; return out; });
    ok(les.shown && les.played === 16 && les.best >= 85 && les.next === 2 && les.state === 'done' && les.rings >= 27, 'a lesson counts you in, lays its notes on the kit, marks sixteen played on the beat as passed and opens the next: ' + JSON.stringify(les));
    // on your feet: the door stops you until it is up, the shotgun is taken, loaded, pumped and fired, a neighbour runs
    const wk = await ev(async () => { const D = __drums, g = D.gun, nap = ms => new Promise(r => setTimeout(r, ms)), key = async (c, ms = 250) => { window.dispatchEvent(new KeyboardEvent('keydown', { code: c })); await nap(60); window.dispatchEvent(new KeyboardEvent('keyup', { code: c })); await nap(ms); }, o = {};
      await key('Tab'); o.up = D.walk.on; D.garage.setDoor(0.1); D.walk.pos.set(0, 0, -3.0); D.scr.yaw = 0; window.dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyW' })); await nap(2500); o.shut = +D.walk.pos.z.toFixed(1);
      D.garage.setDoor(1); await nap(3500); window.dispatchEvent(new KeyboardEvent('keyup', { code: 'KeyW' })); o.out = D.walk.pos.z < -4.5;
      D.walk.pos.set(-1.0, 0, 2.2); await nap(200); await key('KeyE'); D.walk.pos.set(0.9, 0, 2.3); await nap(200); await key('KeyE'); o.held = g.held; o.pouch = g.pouch;
      for (let i = 0; i < 6 && g.tube < 2; i++) await key('KeyR', 1500); o.tube = g.tube; await key('KeyF', 1500); o.ready = g.chamber;
      const p = D.street.people[0]; p.g.visible = true; p.state = 'walk'; p.pos.set(3, 0, -13.75); p.path = [[70, -13.75]]; p.pi = 0; p.asked = true; const rel = p.rel;
      D.walk.pos.set(-0.08, 0, 1.4); D.scr.yaw = 0; D.scr.pitch = -0.51; await nap(600); const k0 = D.stats.hits; g.shoot(true); await nap(500); o.shots = g.shots; o.kit = D.stats.hits - k0; o.spent = g.chamber; o.fled = p.fled && p.rel < rel;
      await key('KeyF', 1500); o.next = g.chamber; D.walk.pos.set(0, 0, 0.5); await nap(200); await key('Tab'); o.sat = !D.walk.on && !g.held; return o; });
    ok(wk.up && wk.shut > -3.6 && wk.out && wk.held && wk.pouch === 25 && wk.tube >= 2 && wk.ready === 1 && wk.shots === 1 && wk.kit >= 1 && wk.spent === 2 && wk.fled && wk.next === 1 && wk.sat, 'TAB stands you up; the shut door stops you and the open one lets you out; the shotgun is taken, loaded from your belt, pumped and fired, its shot rings the kit and sends a neighbour running; the pump brings up the next; TAB at the stool sits you down: ' + JSON.stringify(wk));
    const r = await ev(() => ({ calls: __drums.renderer.info.render.calls, tris: __drums.renderer.info.render.triangles, lines: __drums.renderer.domElement.height }));
    ok(r.calls < 520 && r.tris < 520000, 'the whole garage is ' + r.calls + ' draws and ' + r.tris + ' triangles, drawn ' + r.lines + ' lines tall');
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
  if (process.env.ONLY !== 'screen') { const { pg, errs, ev, wait } = await open(quest); await wait(() => !document.getElementById('vr').disabled); await ev(drive);
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
    const clk = await ev(async () => { const D = __drums, S = D.sticks, V = D.camera.position.constructor, Qn = D.camera.quaternion.constructor, q = new Qn(), n0 = D.sound.stats.hits; let n = 0; const keep = S.onClick; S.onClick = (v) => { n++; keep(v); };
      const A = new V(-0.1, 1.2, -0.3), B = new V(0.1, 1.2, -0.3), qa = new Qn().setFromAxisAngle(new V(0, 1, 0), -0.5), qb = new Qn().setFromAxisAngle(new V(0, 1, 0), 0.5); S.time = 10; S.detect = true;
      for (let i = 0; i < 12; i++) { const up = i % 2 ? 0.04 : -0.04; S.set('left', A.clone().setY(1.2 + up), qa, true); S.set('right', B, qb, true); S.left.had = S.right.had = true; S._knock(0.011); S.time += 0.06; }
      S.onClick = keep; return [n, D.sound.stats.hits - n0]; });
    ok(clk[0] >= 10, 'two sticks crossed twelve times in under a second click nearly every time: ' + clk);
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
    const wk = await ev(async () => { const D = __drums, c = xrDevice.controllers.left, w = (ms) => new Promise(r => setTimeout(r, ms)); c.updateButtonValue('x-button', 1); await w(700); c.updateButtonValue('x-button', 0); await w(300); const on = D.walk.on, z0 = D.head.pos.z; c.updateAxes('thumbstick', 0, 1); await w(4000); c.updateAxes('thumbstick', 0, 0); await w(200); return [on, +Math.abs(D.head.pos.z - z0).toFixed(2), D.walk.on, JSON.stringify(D.rig.position.toArray().map(v => +v.toFixed(2))), JSON.stringify(D.dbg)]; });
    ok(wk[0] && wk[1] > 0.3, 'X stands you up and the left stick walks you: ' + wk);
    ok(errs.length === 0, 'no page error in the headset' + (errs.length ? ': ' + errs.join(' | ') : '')); await pg.close(); }

  await b.close(); srv.close(); console.log(fails.length ? fails.length + ' FAILED' : 'the garage check passed'); process.exit(fails.length ? 1 : 0);
})();
