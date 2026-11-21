// THE SKIRMISH TABLE CHECK: node tests/chess.cjs [dist/chess.html] [folder for screenshots]. The game's rules (its own test, ported), the match room with no network (seats, a spectator, the turn order); then the website's own worker (wrangler dev) and its Chess Durable Object: /chess and every kind of file it fetches, two pages open a match by its code, move, shoot, come back to their seat after a reload, and the match is played out to a win; a surrender; then an emulated Quest 3 enters AR and picks a piece with its controller.
const { chromium } = require('playwright'), path = require('path'), fs = require('fs'), os = require('os'), { pathToFileURL } = require('url'), { spawn } = require('child_process');
const fails = [], ok = (c, m) => { if (!c) { fails.push(m); console.log((process.env.GITHUB_ACTIONS ? '::error title=chess::' : 'FAIL ') + m); } else console.log('ok   ' + m); };
const PAGE = path.resolve(process.argv[2] || 'dist/chess.html'), OUT = process.argv[3]; if (OUT) fs.mkdirSync(OUT, { recursive: true });
const PORT = 8797, BASE = 'http://127.0.0.1:' + PORT, ROOT = path.join(__dirname, '..');
const IWER = fs.readFileSync(require.resolve('iwer/build/iwer.min.js'), 'utf8');
const nap = ms => new Promise(r => setTimeout(r, ms));
let halt = () => {};

(async () => {
  ok(fs.existsSync(PAGE), 'the page is built (' + path.relative(ROOT, PAGE) + ')');
  // ---- the rules, no page (the game's own test) ----
  const G = await import(pathToFileURL(path.join(ROOT, 'src/chess/game.js')));
  const never = () => 0.999, always = () => 0;
  { let s = G.newGame();
    ok(s.units.length === 20 && new Set(s.units.map(u => u.x + ',' + u.y)).size === 20, 'twenty pieces on a 9 by 11 board, none on the same tile');
    const st = s.units.find(u => u.owner === 0 && u.type === 'strider'), other = s.units.find(u => u.owner === 0 && u.type === 'bulwark');
    ok(!G.apply(s, 1, { type: 'move', unit: st.id, x: 1, y: 5 }).ok && !G.apply(s, 0, { type: 'move', unit: st.id, x: 1, y: 0 }).ok, 'no move out of turn, none too far');
    ok(G.apply(s, 0, { type: 'move', unit: st.id, x: 1, y: 4 }).ok && !G.apply(s, 0, { type: 'move', unit: st.id, x: 1, y: 5 }).ok && !G.apply(s, 0, { type: 'move', unit: other.id, x: other.x, y: other.y - 1 }).ok, 'one piece a turn, one move');
    ok(G.apply(s, 0, { type: 'end', facing: 'N' }).ok && s.turn === 1 && st.rec === 0, 'facing ends the turn; a move alone with rest 1 costs nothing'); }
  { const s = G.newGame(); s.units = s.units.filter(u => ['strider', 'bulwark'].includes(u.type));
    const a = s.units.find(u => u.owner === 0 && u.type === 'strider'), d = s.units.find(u => u.owner === 1 && u.type === 'bulwark');
    Object.assign(a, { x: 4, y: 5 }); Object.assign(d, { x: 4, y: 4, facing: 'S' });
    let r = G.apply(s, 0, { type: 'act', unit: a.id, x: 4, y: 4 }, always);
    ok(G.sideOf(d, a.x, a.y) === 'front' && r.ok && r.events.some(e => e.t === 'block') && d.hp === 50, 'an attack from the front can be blocked');
    G.apply(s, 0, { type: 'end' }); const rested = a.rec === 1; G.apply(s, 1, { type: 'end' });
    ok(rested && !G.apply(s, 0, { type: 'act', unit: a.id, x: 4, y: 4 }).ok, 'a piece that acted rests');
    G.apply(s, 0, { type: 'end' }); G.apply(s, 1, { type: 'end' }); d.facing = 'N';
    r = G.apply(s, 0, { type: 'act', unit: a.id, x: 4, y: 4 }, always);
    ok(a.rec === 0 && G.sideOf(d, a.x, a.y) === 'back' && r.events.some(e => e.t === 'hit') && d.hp === 50 - Math.round(18 * 1.5 * 0.75), 'from behind: no block, the rogue\'s backstab, then armour'); }
  { const s = G.newGame(), pick = (o, t) => s.units.find(u => u.owner === o && u.type === t);
    const em = pick(0, 'ember'), me = pick(0, 'mender'), hx = pick(0, 'hexbinder'), e1 = pick(1, 'bulwark'), e2 = pick(1, 'lancer');
    s.units = [em, me, hx, e1, e2];
    Object.assign(em, { x: 4, y: 6 }); Object.assign(me, { x: 4, y: 7 }); Object.assign(hx, { x: 3, y: 6 }); Object.assign(e1, { x: 4, y: 4 }); Object.assign(e2, { x: 4, y: 3 });
    let r = G.apply(s, 0, { type: 'act', unit: em.id, x: 4, y: 4 }, always);
    ok(r.events.filter(e => e.t === 'hit').length === 2, 'the fire mage\'s burst cannot be blocked and splashes');
    G.apply(s, 0, { type: 'end' }); G.apply(s, 1, { type: 'end' });
    G.apply(s, 0, { type: 'act', unit: hx.id, x: 4, y: 4 }, never); const snared = e1.snare === 2; G.apply(s, 0, { type: 'end' });
    ok(snared && !G.apply(s, 1, { type: 'move', unit: e1.id, x: 5, y: 4 }).ok && !G.apply(s, 1, { type: 'act', unit: e2.id, x: 4, y: 4 }, never).ok, 'a snared piece cannot move; the axe cannot be aimed at a friend');
    G.apply(s, 1, { type: 'end' }); em.hp = 5;
    ok(G.apply(s, 0, { type: 'act', unit: me.id, x: 4, y: 6 }).ok && em.hp === 19, 'the cleric heals 14');
    G.apply(s, 0, { type: 'end' }); G.apply(s, 1, { type: 'surrender' });
    ok(s.winner === 0 && !G.apply(s, 0, { type: 'end' }).ok, 'a surrender gives the other the win; nothing after the end'); }
  { const s = G.newGame(); for (let i = 0; i < G.MAX_PASSES; i++) G.apply(s, s.turn, { type: 'end' }); ok(s.winner === -1, 'four passes in a row is a draw'); }
  { let bad = 0;
    for (let g = 0; g < 200; g++) { const s = G.newGame();
      for (let i = 0; i < 600 && s.winner === null; i++) { const p = s.turn, mine = s.units.filter(u => G.canUse(s, p, u)), u = mine[Math.floor(Math.random() * mine.length)];
        if (u) { const mv = G.reachable(s, u); if (mv.length && Math.random() < 0.8 && !G.apply(s, p, { type: 'move', unit: u.id, ...mv[Math.floor(Math.random() * mv.length)] }).ok) bad++;
          const tg = G.targets(s, u); if (tg.length && !G.apply(s, p, { type: 'act', unit: u.id, ...tg[Math.floor(Math.random() * tg.length)] }).ok) bad++; }
        if (s.winner === null && !G.apply(s, p, { type: 'end', unit: u && u.id, facing: u ? 'NESW'[Math.floor(Math.random() * 4)] : undefined }).ok) bad++; }
      if (new Set(s.units.map(u => u.x + ',' + u.y)).size !== s.units.length) bad++; }
    ok(bad === 0, 'two hundred random games: every move the rules offer is taken, no two pieces share a tile'); }

  // ---- the match room, no network ----
  { const { CHESS } = await import(pathToFileURL(path.join(ROOT, 'worker/chess.js')));
    const host = { room: null, saves: 0, save() { this.saves++; } }, M = new CHESS.Match(host), sock = () => ({ got: [], send(s) { this.got.push(JSON.parse(s)); } });
    const a = sock(), b = sock(), c = sock(), say = (w, m) => M.message(w, 'ABCD', JSON.stringify(m)), last = (w, t) => w.got.filter(m => m.t === t).pop();
    for (const w of [a, b, c]) M.open(w);
    say(b, { t: 'join', code: 'ABCD', token: 'tb' }); const none = last(b, 'error');
    say(a, { t: 'create', token: 'ta' }); say(a, { t: 'act', action: { type: 'end' } }); const waiting = last(a, 'error');
    say(b, { t: 'join', code: 'ABCD', token: 'tb' }); say(c, { t: 'join', code: 'ABCD', token: 'tc' });
    ok(none && /No room/.test(none.msg) && last(a, 'joined').you === 0 && last(b, 'joined').you === 1 && last(c, 'joined').you === -1 && /Waiting/.test(waiting.msg), 'the room: nothing to join before it is made, two seats, the third watches, no move before the second sits');
    say(b, { t: 'act', action: { type: 'end' } }); const turn = last(b, 'error'); say(c, { t: 'act', action: { type: 'surrender' } });
    ok(turn && /not your turn/.test(turn.msg) && host.room.state.winner === null && last(c, 'state').started && host.room.deadline > Date.now(), 'the rules decide in the room: no move out of turn, none from a spectator, the turn clock runs');
    M.gone(b); const off = last(a, 'state').present; const b2 = sock(); M.open(b2); say(b2, { t: 'join', code: 'ABCD', token: 'tb' });
    ok(off[0] && !off[1] && last(b2, 'joined').you === 1 && last(a, 'state').present[1] && host.saves > 0, 'a player who drops is shown offline and comes back to the same seat');
    say(a, { t: 'act', action: { type: 'surrender' } }); ok(host.room.state.winner === 1 && host.room.deadline === null && last(c, 'state').state.winner === 1, 'a surrender ends it for everyone and stops the clock');
    clearTimeout(M.timer);
    ok(CHESS.CODE.test(CHESS.code()) && !CHESS.CODE.test('abcd') && !CHESS.CODE.test('ABCDE'), 'a room\'s code is four capital letters'); }

  // ---- the website's worker and its Chess Durable Object ----
  const CFG = path.join(ROOT, '.site-wrangler.jsonc'); fs.writeFileSync(CFG, fs.readFileSync(path.join(ROOT, 'wrangler.jsonc'), 'utf8').replace(/^\s*"ai"\s*:\s*\{[^}]*\},?\s*$/m, '')); process.on('exit', () => { try { fs.unlinkSync(CFG); } catch (e) {} });
  const w = spawn('npx', ['wrangler', 'dev', '-c', CFG, '--port', String(PORT), '--ip', '127.0.0.1', '--var', 'DEV_AUTH:1', '--show-interactive-dev-session=false', '--persist-to', fs.mkdtempSync(path.join(os.tmpdir(), 'chess-'))], { cwd: ROOT, stdio: ['ignore', 'pipe', 'pipe'], detached: true, env: { ...process.env, WRANGLER_SEND_METRICS: 'false' } });
  const stop = () => { try { process.kill(-w.pid, 'SIGKILL'); } catch (e) { try { w.kill('SIGKILL'); } catch (_) {} } };
  halt = stop;
  let log = ''; w.stdout.on('data', d => log += d); w.stderr.on('data', d => log += d);
  let up = false; for (let i = 0; i < 120 && !up; i++) { await nap(1000); up = await fetch(BASE + '/chess').then(r => r.ok).catch(() => false); }
  if (!up) { console.log('FAIL: the worker never started\n' + log); stop(); process.exit(1); }
  const done = async b => { if (b) await b.close().catch(() => {}); stop(); console.log(fails.length ? fails.length + ' FAILED' : 'the skirmish table check passed'); process.exit(fails.length ? 1 : 0); };

  { const r = await fetch(BASE + '/chess'), t = await r.text(), h = await fetch(BASE + '/chess.html'), sl = await fetch(BASE + '/chess/', { redirect: 'manual' });
    ok(r.status === 200 && /<title>Skirmish Table<\/title>/.test(t) && h.status === 404 && sl.status === 301, '/chess is SKIRMISH TABLE, to anyone, no login');
    // every file the page's code names: the people, the sprites, the sounds
    const src = f => fs.readFileSync(path.join(ROOT, 'src/chess', f), 'utf8'), names = (f, re) => [...new Set([...src(f).matchAll(re)].map(m => m[1]))];
    const sfx = eval(/const FILES = (\[[\s\S]*?\]);/.exec(src('audio.js'))[1]), glb = [...names('characters.js', /'((?:Male|Female|Hair)_[A-Za-z]+)'/g), 'animations'], png = fs.readdirSync(path.join(ROOT, 'data/chess/fx')).map(f => f.replace('.png', ''));
    const urls = [...sfx.map(n => 'sfx/' + n + '.mp3'), ...glb.map(n => 'characters/' + n + '.glb'), ...png.map(n => 'fx/' + n + '.png')], bad = [], types = {};
    for (const u of urls) { const q = await fetch(BASE + '/chess-assets/' + u, { method: 'HEAD' }); if (q.status !== 200) bad.push(u + ' ' + q.status); else types[u.split('.').pop()] = q.headers.get('content-type'); }
    ok(sfx.length >= 30 && glb.length >= 8 && png.length >= 10 && !bad.length, 'every file it fetches is handed out (' + sfx.length + ' mp3, ' + glb.length + ' glb, ' + png.length + ' png)' + (bad.length ? ': ' + bad.join(', ') : ''));
    ok(/audio\/mpeg/.test(types.mp3) && /gltf-binary/.test(types.glb) && /image\/png/.test(types.png), 'each as its kind: ' + JSON.stringify(types));
    const x = await fetch(BASE + '/chess-assets/../g/market.html'), y = await fetch(BASE + '/chess-assets/CREDITS.md'), z = await fetch(BASE + '/chess/ws?create=1');
    ok(x.status !== 200 && y.status === 404 && z.status === 426, 'nothing else under /chess-assets/, and the room answers only a socket'); }

  // a seat over a bare socket (the page's own messages)
  const seat = (query, first) => new Promise(res => { const s = new WebSocket('ws://127.0.0.1:' + PORT + '/chess/ws?' + query), o = { s, got: [], state: null, you: null, code: null, err: [], act: a => s.send(JSON.stringify({ t: 'act', action: a })) };
    s.onmessage = e => { const m = JSON.parse(e.data); o.got.push(m); if (m.t === 'joined') { o.you = m.you; o.code = m.code; } if (m.t === 'state') o.state = m.state; if (m.t === 'error') o.err.push(m.msg); };
    s.onopen = () => { s.send(JSON.stringify(first)); res(o); }; s.onerror = () => res(o); });
  const wait = async (f, ms = 15000) => { const t = Date.now(); while (Date.now() - t < ms) { if (f()) return true; await nap(20); } return false; };
  { const a = await seat('create=1', { t: 'create', token: 'sock-a' }); await wait(() => a.code);
    const n = await seat('room=QQQQ', { t: 'join', code: 'QQQQ', token: 'x' }); await wait(() => n.err.length);
    const b = await seat('room=' + (a.code || '').toLowerCase(), { t: 'join', code: a.code, token: 'sock-b' }); await wait(() => b.state && b.got.some(m => m.t === 'state' && m.started));
    ok(/^[A-Z]{4}$/.test(a.code || '') && a.you === 0 && b.you === 1 && /No room/.test(n.err[0] || ''), 'the Durable Object: a made room has a four-letter code, the second player joins by it, an unknown code has no room (' + a.code + ')');
    b.act({ type: 'surrender' }); await wait(() => a.state && a.state.winner !== null);
    ok(a.state && a.state.winner === 0, 'a surrender there gives the other player the win');
    for (const o of [a, b, n]) o.s.close(); }

  // ---- two pages, one match ----
  const launch = () => chromium.launch({ ...(process.env.PWCHROME ? { executablePath: process.env.PWCHROME } : {}), args: OUT ? ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] : ['--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const b = await launch(), b2 = OUT ? await launch() : b;   // for pictures the second player has a browser of their own
  const errs = [], miss = [];
  const open = async (init, br = b) => { const ctx = await br.newContext({ viewport: { width: 1280, height: 800 }, deviceScaleFactor: OUT ? 2 : 1 }), pg = await ctx.newPage();
    if (!OUT) await pg.addInitScript(() => { try { localStorage.setItem('quality', 'low'); } catch (e) {} });   // the software renderer is slow
    if (init) await pg.addInitScript(init);
    pg.on('pageerror', e => errs.push(e.message.slice(0, 300))); pg.on('console', m => { if (m.type() === 'error') errs.push('console: ' + m.text().slice(0, 300)); });
    pg.on('response', r => { if (r.status() >= 400) miss.push(r.status() + ' ' + r.url().replace(BASE, '')); }); return pg; };
  // for pictures the pages draw at full quality, too slow for two at once in software: only the page being used is at full size, the other is shrunk to a stamp
  let cur = null; const on = async pg => { if (OUT && cur !== pg) { if (cur) await cur.setViewportSize({ width: 96, height: 60 }); await pg.setViewportSize({ width: 1280, height: 800 }); cur = pg; await pg.waitForTimeout(500); } return pg; };
  const st = async pg => (await on(pg)).evaluate(() => window.__t.state), tap = async (pg, p) => (await on(pg)).evaluate(p => window.__t.handlePick(p), p);
  const until = async (pg, fn, arg, ms = OUT ? 240000 : 60000) => { await on(pg); await pg.waitForFunction(() => !!window.__t, null, { timeout: ms }).catch(() => {}); return pg.waitForFunction(fn, arg, { timeout: ms }).then(() => true, () => false); };
  const shot = async (pg, name) => { if (OUT) { await on(pg); await pg.waitForTimeout(1500); await pg.screenshot({ path: path.join(OUT, name + '.png'), timeout: 240000 }).catch(e => ok(false, 'the picture ' + name + ': ' + e.message.split('\n')[0])); } };
  const people = pg => until(pg, () => { let n = 0; window.__t.scene.traverse(o => { if (o.isSkinnedMesh) n++; }); return n >= 20; }, null, 180000);
  const A = await open(), B = await open(null, b2); await on(A);
  await (await on(A)).goto(BASE + '/chess', { waitUntil: 'commit', timeout: 120000 }); ok(await until(A, () => !!window.__t && !!document.getElementById('createBtn')), 'the page starts on its menu');
  await shot(A, 'menu');
  await (await on(A)).evaluate(() => document.getElementById('createBtn').click()); ok(await until(A, () => window.__t.code && window.__t.me === 0), 'CREATE A MATCH opens a room and seats you');
  const code = await (await on(A)).evaluate(() => window.__t.code);
  ok(/^[A-Z]{4}$/.test(code || '') && (await (await on(A)).evaluate(() => location.pathname + location.search)) === '/chess?room=' + code && /waiting for opponent/.test(await (await on(A)).textContent('#status')), 'its link is /chess?room=' + code + ', and it waits for an opponent');
  await (await on(B)).goto(BASE + '/chess?room=' + code, { waitUntil: 'commit', timeout: 120000 });
  ok(await until(B, () => window.__t.me === 1) && await until(A, () => document.getElementById('status').textContent.startsWith('Your turn')), 'the link seats the second player, and the first is told it is their turn');
  await people(A);

  let s = await st(A); const rogue = s.units.find(u => u.owner === 0 && u.type === 'strider');
  await tap(A, { kind: 'unit', id: rogue.id }); const picked = await (await on(A)).evaluate(() => window.__t.selected);
  await tap(A, { kind: 'tile', x: rogue.x, y: rogue.y - 4 });
  ok(picked === rogue.id && await until(A, id => window.__t.state.active && window.__t.state.active.id === id, rogue.id), 'player 1 picks the rogue and moves it four tiles');
  await shot(A, 'move');
  await tap(A, { kind: 'face', dir: 'E' }); await until(B, () => window.__t.state.turn === 1); s = await st(B);
  { const r = s.units.find(u => u.id === rogue.id); ok(s.turn === 1 && r.y === rogue.y - 4 && r.facing === 'E', 'facing east ends the turn, and the other page sees the same board'); }
  await tap(A, { kind: 'end' }); await (await on(A)).waitForTimeout(400); ok((await st(A)).turn === 1, 'player 1 cannot end a turn that is not theirs');
  const archer = s.units.filter(u => u.owner === 1 && u.type === 'slinger').find(u => Math.abs(u.x - rogue.x) + Math.abs(u.y - (rogue.y - 4)) <= 5);
  await tap(B, { kind: 'unit', id: archer.id }); await tap(B, { kind: 'unit', id: rogue.id });
  ok(!!archer && await until(B, () => window.__t.state.active && window.__t.state.active.acted), 'player 2\'s archer shoots the rogue');
  await (await on(B)).waitForTimeout(350); await shot(B, 'attack');
  await tap(B, { kind: 'end' }); await until(A, () => window.__t.state.turn === 0); s = await st(A);
  ok(s.units.find(u => u.id === archer.id).rec === 2, 'the archer rests two turns');
  await (await on(A)).reload({ waitUntil: 'commit', timeout: 120000 }); ok(await until(A, () => window.__t && window.__t.me === 0 && window.__t.state && window.__t.state.turnNo === 3), 'a reload comes back to the same seat and the same board: ' + JSON.stringify(await A.evaluate(() => window.__t ? { me: window.__t.me, code: window.__t.code, turnNo: window.__t.state && window.__t.state.turnNo, lobby: document.getElementById('lobbyMsg').textContent } : null)));
  await people(A);
  { const P = (await st(A)).turn === 0 ? A : B; await people(P);   // on a slow machine the turn clock may have run out by now: whoever's turn it is clicks
    const hit = await (await on(P)).evaluate(() => { const T = window.__t, id = T.state.units.find(u => u.owner === T.me && u.type === 'bulwark').id; let g = null; T.scene.traverse(o => { if (o.userData && o.userData.pick && o.userData.pick.kind === 'unit' && o.userData.pick.id === id) g = o; });
      const p = g.getWorldPosition(T.V(0, 0, 0)); p.y += 0.06; p.project(T.camera); return { id, x: (p.x + 1) / 2 * innerWidth, y: (1 - p.y) / 2 * innerHeight }; });
    await (await on(P)).mouse.click(hit.x, hit.y); await (await on(P)).waitForTimeout(400);
    ok((await (await on(P)).evaluate(() => window.__t.selected)) === hit.id, 'a real click on a knight\'s base picks it'); await tap(P, null); }

  ok(await people(A) && await people(B), 'the twenty people are drawn as their models on both pages');
  await shot(A, 'board-player1'); await shot(B, 'board-player2');

  // the rest of the match, played out for both seats over their own sockets (each page's token), the pages watching: every piece that can strike does, the others close in
  { const tok = async pg => (await on(pg)).evaluate(() => sessionStorage.getItem('token')), bots = [await seat('room=' + code, { t: 'join', code, token: await tok(A) }), await seat('room=' + code, { t: 'join', code, token: await tok(B) })];
    await wait(() => bots[0].state && bots[1].state);
    const seated = bots[0].you === 0 && bots[1].you === 1, d = (a, c) => Math.abs(a.x - c.x) + Math.abs(a.y - c.y);
    let turns = 0, refused = 0;
    while (seated && turns < 1500) { const S = bots[0].state; if (!S || S.winner !== null) break; const p = S.turn, me = bots[p], n0 = me.got.length, e0 = me.err.length, step = async a => { const n = me.got.length; me.act(a); await wait(() => me.got.length > n, 5000); if (me.err.length > e0) refused++; return me.state; };
      const foes = S.units.filter(u => u.owner !== p), mine = S.units.filter(u => G.canUse(S, p, u)), strike = u => G.targets(S, u).filter(t => { const v = G.unitAt(S, t.x, t.y); return v && v.owner !== p; });
      let u = mine.find(u => G.TYPES[u.type].pow > 0 && strike(u).length), cur = S;
      if (u) cur = await step({ type: 'act', unit: u.id, ...strike(u)[0] });
      else { u = mine.filter(u => G.TYPES[u.type].pow > 0).sort((a, c) => Math.min(...foes.map(f => d(a, f))) - Math.min(...foes.map(f => d(c, f))))[0] || mine[0];
        if (u) { const near = t => Math.min(...foes.map(f => d(t, f))), mv = G.reachable(S, u).sort((a, c) => near(a) - near(c))[0];
          if (mv && (near(mv) < near(u) || Math.random() < 0.5)) { cur = await step({ type: 'move', unit: u.id, x: mv.x, y: mv.y }); const v = G.unitById(cur, u.id), tg = v ? G.targets(cur, v).filter(t => { const q = G.unitAt(cur, t.x, t.y); return q && q.owner !== p && G.TYPES[v.type].pow > 0; }) : []; if (tg.length) cur = await step({ type: 'act', unit: u.id, ...tg[0] }); } } }
      if (cur.winner === null) { const n = me.got.length; me.act({ type: 'end' }); await wait(() => me.got.length > n, 5000); }
      await wait(() => bots[0].state.turn !== p || bots[0].state.winner !== null, 5000); turns++; if (me.got.length === n0) break; }
    const E = bots[0].state, win = E.winner;
    ok(seated && (win === 0 || win === 1) && refused === 0 && E.units.length > 0 && E.units.every(u => u.owner === win), 'the match is played out to a win in the Durable Object: after ' + turns + ' more turns player ' + (win + 1) + ' has the only pieces left (' + E.units.length + '), no move refused');
    const W = win === 0 ? A : B, L = win === 0 ? B : A;
    ok(await until(W, () => document.getElementById('status').textContent === 'You win!') && await until(L, () => document.getElementById('status').textContent === 'You lose'), 'the winner\'s page says You win!, the other\'s You lose');
    await shot(W, 'win');
    for (const o of bots) o.s.close(); }
  ok(errs.length === 0, 'no page errors' + (errs.length ? ': ' + errs.slice(0, 4).join(' | ') : ''));
  ok(miss.length === 0, 'nothing the pages asked for was refused' + (miss.length ? ': ' + [...new Set(miss)].slice(0, 6).join(', ') : ''));
  await A.context().close(); await B.context().close(); if (b2 !== b) await b2.close();

  // ---- an emulated Quest 3: AR, the board in front of you, a controller picks a piece ----
  { const n0 = errs.length, Q = await open(IWER + ';window.xrDevice=new IWER.XRDevice(IWER.metaQuest3);xrDevice.installRuntime({forceInstall:true});xrDevice.position.set(0,1.6,0);'
      + ';(()=>{const raf=window.requestAnimationFrame.bind(window);let real=-1,ft=0;window.__even=false;window.requestAnimationFrame=cb=>raf(t=>{if(t!==real){real=t;ft=window.__even?ft+1000/90:t;}cb(ft);});})();');   // __even: every frame is told it is 1/90 s after the last, however long it took
    await Q.goto(BASE + '/chess', { waitUntil: 'commit', timeout: 120000 }); await until(Q, () => !!window.__t); await Q.evaluate(() => document.getElementById('createBtn').click()); await until(Q, () => window.__t.code && window.__t.state);
    const qc = await Q.evaluate(() => window.__t.code), foe = await seat('room=' + qc, { t: 'join', code: qc, token: 'quest-foe' }); await until(Q, () => document.getElementById('status').textContent.startsWith('Your turn'));
    ok(await until(Q, () => !document.getElementById('arBtn').hidden, null, 20000), 'in a Quest 3 the page offers ENTER AR');
    await Q.evaluate(() => document.getElementById('arBtn').click());
    ok(await until(Q, () => window.__t.renderer.xr.isPresenting && window.__t.scene.background === null), 'it starts a passthrough session: no sky, no table, the room shows through');
    const board = () => Q.evaluate(() => { const T = window.__t, w = T.scene.children.find(o => o.isGroup && o.children.length > 3); return { s: w.scale.x, x: w.position.x, y: w.position.y, z: w.position.z }; });
    await until(Q, () => { const w = window.__t.scene.children.find(o => o.isGroup && o.children.length > 3); return w.position.z < -0.3; }, null, 30000);
    const bd = await board(); ok(Math.abs(bd.s - 0.06) < 1e-6 && Math.abs(bd.z + 0.55) < 0.05 && Math.abs(bd.y - 1.1) < 0.05, 'the board is set at table size (a tile 6 cm) half a metre in front of you: ' + JSON.stringify(bd));
    await people(Q);
    // the checks below step by drawn frames, however slow they are
    await Q.evaluate(() => { const T = window.__t, R = T.renderer, draw = R.render; window.__after = null; R.render = (s, c) => { draw.call(R, s, c); const f = window.__after; if (f) f(); };
      window.__drawn = fn => new Promise(res => { window.__after = () => { window.__after = null; res(fn && fn()); }; });   // after the next frame is drawn
      window.__w = T.scene.children.find(o => o.isGroup && o.children.length > 3); });
    const aim = async id => Q.evaluate(id => { const T = window.__t; let g = null; T.scene.traverse(o => { if (o.userData && o.userData.pick && o.userData.pick.kind === 'unit' && o.userData.pick.id === id) g = o; });
      const p = g.getWorldPosition(T.V(0, 0, 0)), c = xrDevice.controllers.right; c.position.set(p.x, p.y + 0.3, p.z); c.quaternion.set(-Math.SQRT1_2, 0, 0, Math.SQRT1_2); }, id);
    const press = (k = 'trigger') => Q.evaluate(async k => { const c = xrDevice.controllers.right; c.updateButtonValue(k, 1); await window.__drawn(); await window.__drawn(); c.updateButtonValue(k, 0); await window.__drawn(); await window.__drawn(); }, k);   // held over two drawn frames, however slow they are
    const kn = (await st(Q)).units.find(u => u.owner === 0 && u.type === 'lancer'); await aim(kn.id); await Q.evaluate(async () => { await window.__drawn(); await window.__drawn(); }); await press();
    ok((await Q.evaluate(() => window.__t.selected)) === kn.id, 'the controller\'s trigger, pointed down at a piece, picks it');
    await tap(Q, { kind: 'tile', x: kn.x, y: kn.y - 2 }); await until(Q, id => window.__t.state.active && window.__t.state.active.id === id, kn.id); await tap(Q, { kind: 'end' });
    ok(await wait(() => foe.state && foe.state.turn === 1 && foe.state.units.find(u => u.id === kn.id).y === kn.y - 2), 'a move made in the headset reaches the other player');
    // smooth in the headset: under a head sweep the board stays where it is in the room, drawn from that frame's own head pose, and a label keeps to its piece
    { const r = await Q.evaluate(async () => { const T = window.__t, w = window.__w, V = () => T.V(0, 0, 0); let g = null; T.scene.traverse(o => { if (!g && o.userData && o.userData.pick && o.userData.pick.kind === 'unit') g = o; });
        const eyes = () => { const e = T.renderer.xr.getCamera().cameras; return V().setFromMatrixPosition(e[0].matrixWorld).add(V().setFromMatrixPosition(e[1].matrixWorld)).multiplyScalar(0.5); };   // midway between the two eyes as drawn
        const see = () => ({ cam: eyes().distanceTo(xrDevice.position), w: w.getWorldPosition(V()), l: g.userData.label.getWorldPosition(V()).sub(g.getWorldPosition(V())) });
        const a = await window.__drawn(see); let cam = a.cam, drift = 0, lab = 0;
        for (let i = 1; i <= 12; i++) { xrDevice.position.set(0.3 * Math.sin(i * 0.2), 1.6 + 0.05 * Math.sin(i * 0.3), 0.1 * Math.sin(i * 0.15)); const b = await window.__drawn(see); cam = Math.max(cam, b.cam); drift = Math.max(drift, b.w.distanceTo(a.w)); lab = Math.max(lab, b.l.distanceTo(a.l)); }
        xrDevice.position.set(0, 1.6, 0); await window.__drawn(); return { cam: cam * 1000, drift: drift * 1000, lab: lab * 1000 }; });
      ok(r.cam < 0.01 && r.drift < 0.01 && r.lab < 0.01, 'a head sweep of 30 cm: each frame is drawn from its own head pose, the board does not move in the room, a label keeps to its piece (mm: ' + JSON.stringify(r) + ')'); }
    await Q.evaluate(() => xrDevice.controllers.right.updateButtonValue('squeeze', 1)); await Q.waitForTimeout(3000); await Q.evaluate(() => { const c = xrDevice.controllers.right; c.position.set(c.position.x + 0.2, c.position.y, c.position.z); }); await until(Q, x => { const w = window.__t.scene.children.find(o => o.isGroup && o.children.length > 3); return Math.abs(w.position.x - x - 0.2) < 0.03; }, bd.x, 20000);
    const moved = await board(); await Q.evaluate(() => xrDevice.controllers.right.updateButtonValue('squeeze', 0));
    ok(Math.abs(moved.x - bd.x - 0.2) < 0.03, 'holding the grip drags the board with the hand');
    { const slip = await Q.evaluate(async () => { const T = window.__t, w = window.__w, V = () => T.V(0, 0, 0), c = xrDevice.controllers.right, hands = T.scene.children.filter(o => o.isGroup && o.children.some(k => k.isLine));
        const rel = () => w.getWorldPosition(V()).x - hands.map(h => h.getWorldPosition(V())).sort((a, b) => a.distanceTo(c.position) - b.distanceTo(c.position))[0].x;   // the board from the hand as drawn
        c.updateButtonValue('squeeze', 1); for (let i = 0; i < 5; i++) await window.__drawn(); const r0 = await window.__drawn(rel); let slip = 0;
        for (let i = 0; i < 8; i++) { c.position.set(c.position.x + 0.002, c.position.y, c.position.z); slip = Math.max(slip, Math.abs(await window.__drawn(rel) - r0)); }
        c.updateButtonValue('squeeze', 0); await window.__drawn(); return slip * 1000; });
      ok(slip < 0.05, 'dragged smoothly (2 mm a frame) the board is drawn with the hand in the same frame, not one behind (' + slip.toFixed(3) + ' mm apart)'); }
    ok(await until(Q, () => window.__t.lean === 2 && !window.__t.sun.castShadow, null, 120000), 'a headset whose frames run late is eased: a lower frame rate where it has one, then no shadows');
    if (OUT) await Q.screenshot({ path: path.join(OUT, 'quest3-ar.png'), timeout: 180000 }).catch(() => {});
    await Q.evaluate(() => window.__t.renderer.xr.getSession().end()); ok(await until(Q, () => !window.__t.renderer.xr.isPresenting && window.__t.scene.background !== null), 'leaving AR puts the table and its hall back');
    // smooth on the screen too: a piece on its way moves by the frame's own time, so equal frames are equal steps
    { const r = await Q.evaluate(async () => { const T = window.__t; let g = null; T.scene.traverse(o => { if (!g && o.userData && o.userData.pick && o.userData.pick.kind === 'unit') g = o; });
        const tg = g.userData.target, x0 = tg.x; let xs; window.__even = true;
        for (let n = 0, whole = false; n < 3 && !whole; n++) { xs = []; tg.x = x0 + 3; g.position.x = x0;
          await new Promise(res => { const f = () => { xs.push(g.position.x); if (xs.length < 26) requestAnimationFrame(f); else res(); }; requestAnimationFrame(f); });
          whole = tg.x === x0 + 3; }   // a turn that ran out meanwhile put the piece's goal back: again
        tg.x = x0; g.position.x = x0; window.__even = false;
        const q = []; for (let i = 4; i < xs.length; i++) q.push((x0 + 3 - xs[i]) / (x0 + 3 - xs[i - 1])); return { lo: Math.min(...q), hi: Math.max(...q), want: Math.exp(-7 / 90) }; });
      ok(Math.abs(r.lo - r.want) < 1e-6 && Math.abs(r.hi - r.want) < 1e-6, 'a walking piece steps by the frame\'s own time: over equal frames every step is the same share of the way left (' + r.lo.toFixed(6) + ' to ' + r.hi.toFixed(6) + ', ' + r.want.toFixed(6) + ' wanted)'); }
    ok(errs.length === n0, 'no page errors in the headset' + (errs.length > n0 ? ': ' + errs.slice(n0, n0 + 4).join(' | ') : '')); foe.s.close(); }
  await done(b);
})().catch(e => { console.log('FAIL the check itself broke: ' + (e && e.stack || e)); halt(); process.exit(1); });
