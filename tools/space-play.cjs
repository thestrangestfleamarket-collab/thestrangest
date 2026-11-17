// plays SPACE FLEET against its bot the way a player does (the same commands the hands give), writes down every move with what should come of it and what did, and watches the battle for anything out of order: node tools/space-play.cjs [games] [fast] [folder for pictures]  (needs dist/space.html; PWCHROME for the browser)
const { chromium } = require('playwright'), path = require('path'), fs = require('fs');
const ROOT = path.resolve(__dirname, '..', 'dist'), GAMES = +process.argv[2] || 2, FAST = +process.argv[3] || 20, OUT = process.argv[4];
const TY = { glb: 'model/gltf-binary', mp3: 'audio/mpeg', jpg: 'image/jpeg', json: 'application/json', html: 'text/html' };
const srv = require('http').createServer((q, r) => { const f = path.join(ROOT, decodeURIComponent(q.url.split('?')[0])); fs.readFile(f, (e, d) => { if (e) { r.writeHead(404); return r.end(); } r.writeHead(200, { 'content-type': TY[f.split('.').pop()] || 'text/html' }); r.end(d); }); });

// runs in the page: the player
async function play(navy, whole) {
  const S = window.__space, G = S.G, V = G.view, cmd = S.cmd, sim = () => G.sim, log = [], bad = [];
  const wait = (ms) => new Promise(r => setTimeout(r, ms)), ticks = async (n) => { const t = sim().tick + n; while (sim() && sim().tick < t && sim().winner < 0) await wait(60); };
  const mine = (t) => sim().units.filter(u => u.side === 0 && (t === undefined || u.type === t)), foes = (t) => sim().units.filter(u => u.side === 1 && (t === undefined || u.type === t)), D = (a, b) => Math.hypot(a.x - b.x, a.y - b.y, a.z - b.z);
  const move = (name, expect, actual, ok) => { log.push({ t: +(sim().tick / 10).toFixed(1), move: name, expect, actual, ok: !!ok }); };
  const legs = (id) => (V.plan.get(id) || []).length;
  // things that must hold at every look
  const watch = () => { const s = sim(); if (!s) return; for (const u of s.units) { if (![u.x, u.y, u.z, u.hp, u.vx].every(Number.isFinite)) bad.push('not a number in a ship'); if (Math.abs(u.x) > 1.001 || Math.abs(u.y) > 0.401 || Math.abs(u.z) > 1.351) bad.push('a ship outside the field'); if (u.hp > s.T[u.side][u.type].hp + 1e-6 || u.sh > s.T[u.side][u.type].sh + 1e-6) bad.push('a ship over its full strength'); }
    for (const sd of [0, 1]) { if (s.credits[sd] < 0) bad.push('credits below nothing'); if (s.count(sd) > 30) bad.push('fleet over its limit'); if (s.queue[sd].length > 5) bad.push('shipyard over its limit'); }
    for (const id of V.sel) if (!V.units.has(id)) bad.push('a destroyed ship is still picked'); for (const [id, L] of V.plan) if (!V.units.has(id) && L.length) bad.push('a destroyed ship still has a mission drawn'); };
  await ticks(5); const bots = G.bots.slice(); if (!whole) G.bots.length = 0;   // the bot waits while the moves are tried one at a time
  const home = mine(0)[0], relays = sim().nodes.map((n, i) => ({ i, p: n.p, d: Math.hypot(n.p[0] - home.x, n.p[2] - home.z) })).sort((a, b) => a.d - b.d);
  const P = (r, dy = 0) => ({ x: r.p[0], y: r.p[1] + dy, z: r.p[2] });

  if (!whole) {
  // 1 build: costs credits, joins the yard, launches
  { const c0 = sim().credits[0], cost = sim().T[0][1].cost; cmd.build(1); const q = sim().queue[0].length, c1 = sim().credits[0], n0 = mine(1).length; await ticks(55); move('BUILD a fighter', 'credits drop by ' + cost + ', one in the yard, a fighter launches in about 4 s', 'credits ' + (c0 | 0) + ' -> ' + (c1 | 0) + ', yard ' + q + ', fighters ' + n0 + ' -> ' + mine(1).length, Math.abs(c0 - c1 - cost) < 1 && q === 1 && mine(1).length === n0 + 1); }
  { const c = sim().credits[0]; sim().credits[0] = 10; const q = sim().queue[0].length; cmd.build(3); const q2 = sim().queue[0].length; sim().credits[0] = c; move('BUILD with too few credits', 'refused, nothing in the yard', 'yard ' + q + ' -> ' + q2, q2 === q); }
  // 2 send a ship: it flies there, the line goes when it arrives
  { const f = mine(1)[0], r = relays[0], to = P(r, 0.05); cmd.stance(0); V.sel.clear(); V.sel.add(f.id); cmd.order([f.id], 0, to, 0, true); await wait(400); const l0 = legs(f.id), t0 = sim().tick; while (f.k === 1 && sim().tick - t0 < 400) await wait(60); const took = (sim().tick - t0) / 10; await ticks(25); await wait(600);
    move('SEND a fighter to the near relay', 'arrives within 12 s and holds; its line is drawn, then gone', 'took ' + took.toFixed(1) + ' s, ' + D(f, to).toFixed(3) + ' from the spot; line legs ' + l0 + ' -> ' + legs(f.id), took < 12 && D(f, to) < 0.06 && l0 === 1 && !legs(f.id)); }
  // 3 the relay is taken by the ship beside it
  { const r = relays[0], t0 = sim().tick; while (sim().nodes[r.i].owner !== 0 && sim().tick - t0 < 150) await wait(60); move('HOLD a relay', 'yours within about 5 s of arriving, income up by 5', 'owner ' + sim().nodes[r.i].owner + ' after ' + ((sim().tick - t0) / 10).toFixed(1) + ' s more, income ' + sim().income(0), sim().nodes[r.i].owner === 0 && sim().income(0) >= 13); }
  // 4 a mission of three legs, flown in order
  { const f = mine(1)[1], pts = [{ x: 0.35, y: 0.1, z: 0.75 }, { x: -0.3, y: 0.15, z: 0.7 }, { x: 0, y: 0.1, z: 0.6 }], seen = [], S = sim(), adv = S.advance; S.advance = function (u) { if (u === f) pts.forEach((p, i) => { if (D(f, p) < 0.05 && !seen.includes(i)) seen.push(i); }); return adv.call(this, u); }; for (const p of pts) cmd.order([f.id], 0, p, 0, true); const l0 = legs(f.id), t0 = sim().tick;
    while ((f.k === 1 || f.q.length) && sim().tick - t0 < 500) await wait(40); pts.forEach((p, i) => { if (D(f, p) < 0.05 && !seen.includes(i)) seen.push(i); }); S.advance = adv; await wait(500);
    move('QUEUE three orders on one ship', 'three legs drawn; visited in order 1,2,3; ends at the last; lines gone', 'legs ' + l0 + ', visited ' + seen.map(i => i + 1).join(',') + ', ' + D(f, pts[2]).toFixed(3) + ' from the end, legs left ' + legs(f.id), l0 === 3 && seen.join() === '0,1,2' && D(f, pts[2]) < 0.06 && !legs(f.id)); }
  // 5 stop (two taps)
  { const f = mine(1)[1]; cmd.order([f.id], 0, { x: 0.6, y: 0, z: 0.9 }, 0, true); cmd.order([f.id], 0, { x: -0.6, y: 0, z: 0.9 }, 0, true); await ticks(8); const at = { x: f.x, y: f.y, z: f.z }; cmd.stop([f.id]); await ticks(30); await wait(600);
    move('STOP a ship (two taps)', 'its mission is dropped; it holds near where it was; no lines left', 'moved ' + D(f, at).toFixed(3) + ' since, queue ' + f.q.length + ', legs ' + legs(f.id), D(f, at) < 0.08 && !f.q.length && !legs(f.id)); }
  // 6 pick all and move as a group
  { cmd.all(); const ids = [...V.sel], us = ids.map(id => sim().byId.get(id)).filter(Boolean); cmd.order(ids, 0, { x: 0, y: 0, z: 0.55 }, 0, false); const t0 = sim().tick; while (us.some(u => u.k === 1) && sim().tick - t0 < 300) await wait(60);
    const cx = us.reduce((s, u) => s + u.x, 0) / us.length, cz = us.reduce((s, u) => s + u.z, 0) / us.length, overlap = us.some(a => us.some(b => a !== b && D(a, b) < 0.012));
    move('PICK ALL and send them together', 'every warship picked; the group arrives round the spot without piling onto one point', ids.length + ' picked, centre ' + Math.hypot(cx, cz - 0.55).toFixed(3) + ' off, ships on top of each other: ' + overlap, ids.length >= 3 && Math.hypot(cx, cz - 0.55) < 0.12 && !overlap); }
  // 7 DEFEND holds, ATTACK chases
  { const e = sim().spawn(1, 1, [0.32, 0.1, 0.5]); e.hp = 1e6; e.m = 1; const fr = mine(2)[0], post = { x: 0, y: 0.1, z: 0.5 }; cmd.order([fr.id], 0, post, 0, false, 1); await ticks(70); const dDef = D(fr, post);
    cmd.order([fr.id], 0, post, 0, false, 0); await ticks(70); const dAtk = D(fr, post); e.hp = 0; e.hurt = 1; await ticks(3);
    move('DEFEND, then ATTACK, beside an enemy', 'on DEFEND it stays at its post; on ATTACK it leaves the post to close with the enemy', 'on DEFEND ' + dDef.toFixed(3) + ' from the post, on ATTACK ' + dAtk.toFixed(3), dDef < 0.06 && dAtk > 0.08); }
  // 8 SNEAK is not seen from afar
  { const g = sim().spawn(2, 1, [-0.5, 0.2, 0.35]); g.hp = 1e6; g.m = 1; const f = mine(1)[0], h0 = f.hp, to = { x: -0.3, y: 0.2, z: 0.35 }; cmd.order([f.id], 0, to, 0, false, 2); const t0 = sim().tick; while (f.k === 1 && sim().tick - t0 < 300) await wait(60); await ticks(40); const quiet = f.hp === h0, dist = D(f, g);
    cmd.order([f.id], 1, null, g.id, false, 0); await ticks(60); const loud = f.hp < h0 || !sim().byId.get(f.id); g.hp = 0; g.hurt = 1; await ticks(3);
    move('SNEAK up beside an enemy frigate, then ATTACK it', 'unhurt while sneaking ' + dist.toFixed(2) + ' away (its guns reach 0.22); shot at once it attacks', 'unhurt while sneaking: ' + quiet + '; shot at after attacking: ' + loud, quiet && loud); }
  // 9 attack a named target
  { const t = sim().spawn(4, 1, [0.5, -0.1, 0.45]); t.m = 1; while (!V.units.has(t.id)) await wait(50); cmd.all(); const ids = [...V.sel]; cmd.order(ids, 1, null, t.id, false); const l0 = [...V.plan.values()].filter(L => L.some(o => o.tid === t.id)).length, t0 = sim().tick; while (sim().byId.get(t.id) && sim().tick - t0 < 900) await wait(60); await wait(700);
    move('ATTACK a turret with everything', 'red lines to it; it is destroyed; the lines go', 'ships with a line to it ' + l0 + ', destroyed after ' + ((sim().tick - t0) / 10).toFixed(0) + ' s: ' + !sim().byId.get(t.id) + ', lines left ' + [...V.plan.values()].filter(L => L.some(o => o.tid === t.id)).length, l0 >= 1 && !sim().byId.get(t.id) && ![...V.plan.values()].some(L => L.some(o => o.tid === t.id))); }
  // 10 FALL BACK
  { cmd.all(); cmd.home(); const ids = [...V.sel], us = ids.map(id => sim().byId.get(id)).filter(Boolean), t0 = sim().tick; while (us.some(u => u.k === 1) && sim().tick - t0 < 400) await wait(60); const far = Math.max(0, ...us.filter(u => sim().byId.get(u.id)).map(u => Math.hypot(u.x, u.z - home.z * 0.6)));
    move('FALL BACK', 'the picked ships come home in front of the mothership and hold on DEFEND', 'farthest ' + far.toFixed(2) + ' from the spot, modes ' + [...new Set(us.map(u => u.m))].join(), far < 0.2 && us.every(u => u.m === 1)); }
  // 11 PAUSE
  { cmd.pause(); await wait(300); const t0 = sim().tick; await wait(1200); const f = mine(1)[0] || mine(2)[0]; cmd.order([f.id], 0, { x: 0.2, y: 0, z: 0.7 }, 0, false); const took = f.k === 1, still = sim().tick === t0; cmd.pause(); await ticks(5);
    move('PAUSE, give an order, RESUME', 'the battle stands still, the order is taken, it flies on resume', 'stood still: ' + still + ', order taken while paused: ' + took + ', running again: ' + (sim().tick > t0), still && took && sim().tick > t0); }
  watch(); return { navy, log, bad: [...new Set(bad)].slice(0, 12), winner: -1, minutes: 0, moves: 0, left: [], relays: '' }; }

  // ---- now play to win: hold relays, build what beats what they have, strike when stronger ----
  let lastPush = 0, moves = 0; const start = sim().tick; cmd.stance(0);
  while (sim() && sim().winner < 0 && sim().tick - start < 10 * 60 * 14) { await ticks(20); if (!sim() || sim().winner >= 0) break; watch(); const s = sim(), cr = s.credits[0], e = foes(), c = [0, 0, 0]; for (const u of e) if (u.type && u.type !== 5) c[s.T[1][u.type].cls]++;
    const want = c[2] * 2 > c[0] + c[1] && c[2] ? 1 : c[0] > c[1] + c[2] ? 2 : c[1] >= c[0] ? 3 : [2, 1, 3][(s.tick / 20 | 0) % 3]; if (s.queue[0].length < 2 && cr >= s.T[0][want].cost) { cmd.build(want); moves++; }
    if (mine(4).length + s.queue[0].filter(q => q.type === 4).length < 1 && cr > 400) { cmd.build(4); moves++; }
    const army = mine().filter(u => u.type >= 1 && u.type <= 3), raid = mine(1).slice(0, 2), main = army.filter(u => !raid.includes(u)), val = (us, T) => us.reduce((t, u) => t + T[u.type].cost * u.hp / T[u.type].hp, 0), mineV = val(main, s.T[0]), theirV = val(e.filter(u => u.type >= 1 && u.type <= 3), s.T[1]);
    for (const t of mine(4)) if (t.k === 0 && Math.hypot(t.x - relays[0].p[0], t.z - relays[0].p[2]) > 0.2) { cmd.order([t.id], 0, P(relays[0], 0.08), 0, false, 1); moves++; }
    const open = relays.filter(r => s.nodes[r.i].owner !== 0); if (raid.length && open.length && raid.some(u => u.k === 0 && Math.hypot(u.x - open[0].p[0], u.z - open[0].p[2]) > 0.1)) { cmd.order(raid.map(u => u.id), 0, P(open[0]), 0, false, 2); moves++; }
    const threat = e.find(u => u.type !== 5 && Math.hypot(u.x - home.x, u.z - home.z) < 0.55);
    if (threat && main.length) { cmd.order(main.map(u => u.id), 1, null, threat.id, false, 0); moves++; }
    else if (main.length >= 5 && mineV > theirV * 1.25 && s.tick - lastPush > 150) { lastPush = s.tick; const m = foes(0)[0]; if (m) { cmd.order(main.map(u => u.id), 0, { x: 0, y: 0.05, z: m.z * 0.72 }, 0, false, 0); cmd.order(main.map(u => u.id), 1, null, m.id, true, 0); moves++; } }
    else if (main.some(u => u.k === 0 && Math.hypot(u.x, u.z - home.z * 0.45) > 0.3) && s.tick - lastPush > 300) { cmd.order(main.filter(u => u.k === 0).map(u => u.id), 0, { x: 0, y: 0, z: home.z * 0.45 }, 0, false, 1); moves++; } }
  const s = sim(); return { navy, log, bad: [...new Set(bad)].slice(0, 12), winner: s ? s.winner : null, minutes: s ? +((s.tick - start) / 600).toFixed(1) : 0, moves, left: s ? [mine().length, foes().length] : [], relays: s ? s.nodes.map(n => n.owner).join('') : '' };
}

(async () => {
  await new Promise(res => srv.listen(0, '127.0.0.1', res)); const URL = 'http://127.0.0.1:' + srv.address().port + '/space.html';
  const b = await chromium.launch({ ...(process.env.PWCHROME ? { executablePath: process.env.PWCHROME } : {}), args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] }); let fails = 0;
  for (let g = 0; g < GAMES; g++) { const pg = await b.newPage({ viewport: { width: 640, height: 400 } }), errs = []; pg.on('pageerror', e => errs.push(e.message.slice(0, 200))); pg.on('console', m => { if (m.type() === 'error' && !/WebSocket|parties|Failed to load resource/.test(m.text())) errs.push(m.text().slice(0, 200)); });
    await pg.goto(URL + '?sim&fast=' + FAST + '&navy=' + (g % 2)); await pg.waitForFunction(() => window.__space && __space.G.view.units.size >= 10, null, { timeout: 180000 }); await pg.addScriptTag({ content: 'window.play = ' + play.toString() });
    const whole = g >= GAMES / 2, r = await pg.evaluate(([n, w]) => play(n, w), [g % 2, whole]); if (OUT) { fs.mkdirSync(OUT, { recursive: true }); await pg.screenshot({ path: path.join(OUT, 'play-' + g + '.png') }); } await pg.close();
    console.log('\n=== ' + (whole ? 'a whole battle' : 'the moves, one at a time') + ': navy ' + ['ADMIRALTY', 'CORSAIRS'][r.navy] + ' ===');
    for (const m of r.log) { if (!m.ok) fails++; console.log((m.ok ? 'ok   ' : 'FAIL ') + String(m.t).padStart(6) + 's  ' + m.move + '\n         should: ' + m.expect + '\n         did:    ' + m.actual); }
    if (whole) console.log('played to the end: ' + (r.winner === 0 ? 'WON' : r.winner === 1 ? 'LOST' : r.winner === 2 ? 'DRAW' : 'not finished') + ' after ' + r.minutes + ' min, ' + r.moves + ' more commands; ships left ' + r.left.join(' v ') + '; relays ' + r.relays);
    console.log('out of order: ' + (r.bad.length ? r.bad.join('; ') : 'nothing') + ' | page errors: ' + ([...new Set(errs)].slice(0, 4).join(' | ') || 'none')); fails += r.bad.length + errs.length; }
  await b.close(); srv.close(); console.log('\n' + (fails ? fails + ' THINGS TO FIX' : 'ALL AS IT SHOULD BE')); process.exit(fails ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
