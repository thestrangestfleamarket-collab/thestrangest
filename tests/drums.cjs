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
    const wk = await ev(async () => { const D = __drums, c = xrDevice.controllers.left, w = (ms) => new Promise(r => setTimeout(r, ms)); c.updateButtonValue('x-button', 1); await w(700); c.updateButtonValue('x-button', 0); await w(300); const on = D.walk.on, p0 = D.head.pos.clone(); c.updateAxes('thumbstick', 0, 1); await w(4000); c.updateAxes('thumbstick', 0, 0); await w(200); return [on, +Math.hypot(D.head.pos.x - p0.x, D.head.pos.z - p0.z).toFixed(2), JSON.stringify(D.dbg), JSON.stringify([p0.x, p0.z, D.head.pos.x, D.head.pos.z].map(v => +v.toFixed(2)))]; });
    ok(wk[0] && wk[1] > 0.3, 'X stands you up and the left stick walks you: ' + wk);
    ok(errs.length === 0, 'no page error in the headset' + (errs.length ? ': ' + errs.join(' | ') : '')); await pg.close(); }

  await b.close(); srv.close(); console.log(fails.length ? fails.length + ' FAILED' : 'the garage check passed'); process.exit(fails.length ? 1 : 0);
})();
