// THE SKIRMISH TABLE CHECK: node tests/chess.cjs [dist/chess.html] [folder for screenshots]. The game's rules (its own test, ported), the match room with no network (seats, a spectator, the turn order); then the website's own worker (wrangler dev) and its Chess Durable Object: /chess and every kind of file it fetches, two pages open a match by its code, move, shoot, come back to their seat after a reload, and the match is played out to a win; a surrender; then an emulated Quest 3 enters AR and picks a piece with its controller.
const { chromium } = require('playwright'), path = require('path'), fs = require('fs'), os = require('os'), { pathToFileURL } = require('url'), { spawn } = require('child_process');
const fails = [], ok = (c, m) => { if (!c) { fails.push(m); console.log((process.env.GITHUB_ACTIONS ? '::error title=chess::' : 'FAIL ') + m); } else console.log('ok   ' + m); };
const PAGE = path.resolve(process.argv[2] || 'dist/chess.html'), OUT = process.argv[3]; if (OUT) fs.mkdirSync(OUT, { recursive: true });
const PORT = +process.env.PORT || 8797, BASE = 'http://127.0.0.1:' + PORT, ROOT = path.join(__dirname, '..');
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
  // ---- the ground (src/chess/maps.js): every map the same from both seats, every rule the same for every piece ----
  { const land = Object.entries(G.MAPS).filter(([, m]) => m.tiles), turned = m => m.tiles.every((r, y) => [...r].every((c, x) => c === m.tiles[m.rows - 1 - y][m.cols - 1 - x] && m.high[y][x] === m.high[m.rows - 1 - y][m.cols - 1 - x]));
    ok(land.length >= 3 && land.every(([, m]) => m.tiles.length === m.rows && m.high.length === m.rows && m.tiles.every(r => r.length === m.cols && [...r].every(c => G.TERRAIN[c])) && turned(m)), 'the landscaped maps (' + land.map(([id]) => id).join(', ') + ') are whole and read the same from both seats');
    ok(G.newGame().map === 'board' && G.newGame('nowhere').map === 'board' && !G.MAPS.board.tiles && G.newGame().cols === 9 && G.newGame().rows === 11, 'the plain board is still a map, with no ground, and the one a match gets when none is named');
    ok(land.every(([id, m]) => { const s = G.newGame(id); return s.units.length === 20 && s.cols === m.cols && s.rows === m.rows && s.units.every(u => !G.ground(s, u.x, u.y).solid && (u.owner === 0 ? u.y >= m.rows - m.zone : u.y < m.zone)) && new Set(s.units.map(u => u.x + ',' + u.y)).size === 20; }), 'on every map the twenty pieces set out on open ground in their own rows');
    const on = (type, owner, x, y, facing = 'N') => ({ id: 0, type, owner, x, y, facing, hp: G.TYPES[type].hp, rec: 0, snare: 0 }), game = (...units) => { const s = G.newGame('river'); s.units = units.map((u, i) => ({ ...u, id: i + 1 })); return s; }, can = (s, u, x, y) => G.reachable(s, u).some(p => p.x === x && p.y === y);
    { const s = game(on('bulwark', 0, 3, 6)), k = s.units[0], all = G.reachable(s, k);
      ok(all.every(p => !G.ground(s, p.x, p.y).solid) && !can(s, k, 3, 5) && can(s, k, 2, 5) && !can(s, k, 2, 4), 'deep water cannot be entered; the ford takes two move points, so a knight three tiles from the far bank only reaches the ford');
      const r = game(on('strider', 0, 3, 6)); ok(can(r, r.units[0], 2, 4) && can(r, r.units[0], 3, 4) && !can(r, r.units[0], 3, 5), 'the rogue wades the ford and comes out the other side');
      const b = game(on('bulwark', 0, 5, 7)); ok(can(b, b.units[0], 5, 5) && can(b, b.units[0], 5, 4) && !can(b, b.units[0], 4, 5), 'the bridge crosses the river at walking pace'); }
    { const s = game(on('bulwark', 0, 5, 7)), k = s.units[0]; ok(can(s, k, 6, 7) && !can(s, k, 7, 7) && can(s, k, 4, 7) && !can(s, k, 3, 7), 'forest takes two move points a tile; rock cannot be entered'); }
    { const s = game(on('bulwark', 0, 3, 8)), k = s.units[0]; ok(G.high(s, 2, 8) === 1 && can(s, k, 2, 8) && can(s, k, 1, 8) && !can(s, k, 0, 8) && can(game(on('bulwark', 0, 2, 8)), { type: 'bulwark', x: 2, y: 8 }, 5, 8), 'stepping up a level costs one more move point (down costs nothing more)'); }
    { const s = game(on('slinger', 0, 2, 8), on('mender', 1, 2, 2, 'S'), on('slinger', 0, 6, 9), on('mender', 1, 6, 3, 'S')), [hi, a, lo, b] = s.units, t = (u, v) => G.targets(s, u).some(p => p.x === v.x && p.y === v.y);
      ok(t(hi, a) && !t(lo, b) && G.reach(s, hi, a.x, a.y) === 6 && G.reach(s, lo, b.x, b.y) === 5, 'an archer on high ground reaches one tile further at a target below; on the level it does not');
      const r = G.apply(s, 0, { type: 'act', unit: hi.id, x: a.x, y: a.y }, never); ok(r.ok && a.hp === 24 - 8, 'arrows do half damage to a piece in the forest (16 becomes 8)'); }
    { const s = game(on('strider', 0, 2, 6), on('bulwark', 1, 2, 5, 'S'), on('strider', 0, 6, 7), on('bulwark', 1, 6, 6, 'S')), [r1, wet, r2, dry] = s.units, half = () => 0.5;
      G.apply(s, 0, { type: 'act', unit: r1.id, x: 2, y: 5 }, half); G.apply(s, 0, { type: 'end' }); G.apply(s, 1, { type: 'end' }); G.apply(s, 0, { type: 'act', unit: r2.id, x: 6, y: 6 }, half);
      ok(wet.hp < 50 && dry.hp === 50, 'a piece standing in the ford blocks at half its block: the same blow gets through there and is blocked on dry ground'); }
    { const s = game(on('lancer', 0, 3, 8), on('mender', 1, 3, 6, 'S'), on('lancer', 0, 4, 8), on('mender', 1, 4, 6, 'S')), [l1, , l2, v2] = s.units;
      ok(G.ground(s, 3, 7).wall && G.targets(s, l1).length === 0 && G.targets(s, l2).length === 1 && !G.apply(s, 0, { type: 'act', unit: l1.id, x: 3, y: 6 }).ok && G.apply(s, 0, { type: 'act', unit: l2.id, x: 4, y: 6 }, never).ok && v2.hp < 24, 'a rock stops the berserker\'s axe; open ground does not'); }
    let bad = 0, games = 0;
    for (const [id] of land) for (let g = 0; g < 60; g++, games++) { const s = G.newGame(id);
      for (let i = 0; i < 600 && s.winner === null; i++) { const p = s.turn, mine = s.units.filter(u => G.canUse(s, p, u)), u = mine[Math.floor(Math.random() * mine.length)];
        if (u) { const mv = G.reachable(s, u); if (mv.length && Math.random() < 0.8 && !G.apply(s, p, { type: 'move', unit: u.id, ...mv[Math.floor(Math.random() * mv.length)] }).ok) bad++;
          const tg = G.targets(s, u); if (tg.length && !G.apply(s, p, { type: 'act', unit: u.id, ...tg[Math.floor(Math.random() * tg.length)] }).ok) bad++; }
        if (s.winner === null && !G.apply(s, p, { type: 'end', unit: u && u.id, facing: u ? 'NESW'[Math.floor(Math.random() * 4)] : undefined }).ok) bad++;
        if (s.units.some(u => G.ground(s, u.x, u.y).solid)) bad++; }
      if (new Set(s.units.map(u => u.x + ',' + u.y)).size !== s.units.length) bad++; }
    ok(bad === 0, games + ' random games on the landscaped maps: every move the rules offer is taken, nobody ends in water or rock'); }
  // ---- teams: a point budget, limits by type, your own rows ----
  { const s = G.newGame('river', { setup: true }), def = G.defaultTeam('river', 0), row = s.rows - 1, k = (type, x, y = row) => ({ type, x, y }), t = (...u) => G.checkTeam(s, 0, u) || '';
    ok(s.phase === 'setup' && G.BUDGET === 40 && G.teamCost(def) === G.BUDGET && def.length === 10 && G.checkTeam(s, 0, def) === null && G.checkTeam(s, 1, G.defaultTeam('river', 1)) === null && !G.apply(s, 0, { type: 'end' }).ok, 'the standing line-up costs exactly the budget of 40 points and may be fielded by either side; no move before the match starts');
    ok(Object.values(G.TYPES).every(t => t.cost >= 3 && t.cost <= 5 && t.limit >= 2) && /budget/.test(t(...[0, 1, 2, 3].map(x => k('bulwark', x)), ...[4, 5, 6, 7].map(x => k('strider', x)), k('slinger', 8), k('slinger', 9))) && /At most 2/.test(t(k('mender', 0), k('mender', 1), k('mender', 2))), 'a team over the budget is refused, and so is a third cleric');
    ok(/own rows/.test(t(k('strider', 0, 3))) && /own rows/.test(t(k('strider', 99))) && /own rows/.test(t(k('strider', 0.5))) && /Two units/.test(t(k('strider', 0), k('lancer', 0))) && /Unknown/.test(t(k('dragon', 0))) && /Unknown/.test(t(k('constructor', 0))) && /1 to 12/.test(t()) && /1 to 12/.test(G.checkTeam(s, 0, 'x')) && /own rows/.test(G.checkTeam(s, 1, [k('strider', 0)])), 'units go on your own rows, one a tile, of a kind the game has');
    const small = [k('strider', 5), k('ember', 4), k('ember', 6, row - 1)];
    ok(G.setTeam(s, 0, small) === null && s.units.filter(u => u.owner === 0).length === 3 && s.units.filter(u => u.owner === 1).length === 10 && new Set(s.units.map(u => u.id)).size === 13 && s.units.find(u => u.owner === 0 && u.type === 'strider').facing === 'N', 'a checked team replaces that side\'s units and leaves the other side alone');
    G.begin(s); ok(s.phase === 'play' && /started/.test(G.setTeam(s, 0, def)) && G.apply(s, 0, { type: 'end' }).ok, 'once begun the teams are fixed and the match plays'); }
  // ---- the computer opponent (src/chess/ai.js): by the rules, to a win, with nothing it should not know ----
  const AI = await import(pathToFileURL(path.join(ROOT, 'src/chess/ai.js'))), CAMP = await import(pathToFileURL(path.join(ROOT, 'src/chess/campaign.js')));
  { const rnd = (s, p) => { const mine = s.units.filter(u => G.canUse(s, p, u)), u = mine[Math.floor(Math.random() * mine.length)], out = []; if (!u) return [{ type: 'end' }];
      const mv = G.reachable(s, u); if (mv.length && Math.random() < 0.8) out.push({ type: 'move', unit: u.id, ...mv[Math.floor(Math.random() * mv.length)] });
      out.push({ type: 'hit', unit: u.id }, { type: 'end', unit: u.id, facing: 'NESW'[Math.floor(Math.random() * 4)] }); return out; };
    const play = (map, who) => { const s = G.newGame(map); let bad = 0, turns = 0;
      while (s.winner === null && turns < 600) { const p = s.turn, acts = who[p] === 'random' ? rnd(s, p) : AI.plan(s, p, who[p]);
        for (const a of acts) { if (s.winner !== null) break;
          if (a.type === 'hit') { const u = G.unitById(s, a.unit), tg = u ? G.targets(s, u).filter(t => G.unitAt(s, t.x, t.y).owner !== p) : []; if (tg.length) G.apply(s, p, { type: 'act', unit: u.id, ...tg[Math.floor(Math.random() * tg.length)] }); continue; }
          if (!G.apply(s, p, a).ok && who[p] !== 'random') bad++; }
        if (s.turn === p && s.winner === null) G.apply(s, p, { type: 'end' }); turns++; }
      return { winner: s.winner, bad, turns }; };
    let won = 0, lost = 0, n = 0, bad = 0, turns = 0;
    for (const map of Object.keys(G.MAPS)) for (const seat of [0, 1]) { const r = play(map, seat ? ['random', 'hard'] : ['hard', 'random']); n++; bad += r.bad; turns += r.turns; if (r.winner === seat) won++; else if (r.winner === 1 - seat) lost++; }
    ok(bad === 0 && lost === 0 && won >= n - 1, 'the computer (Veteran) plays whole matches on every map from either seat and never loses to a random mover: ' + won + ' of ' + n + ' won, ' + Math.round(turns / n) + ' turns a match, no move of its own refused (' + bad + ')');
    let easy = 0; for (const map of ['board', 'river']) for (const seat of [0, 1]) { const r = play(map, seat ? ['random', 'easy'] : ['easy', 'random']); bad += r.bad; if (r.winner === seat) easy++; }
    let h = 0, e = 0; for (let i = 0; i < 16; i++) { const seat = i % 2, r = play(['board', 'river', 'ruins'][i % 3], seat ? ['easy', 'hard'] : ['hard', 'easy']); bad += r.bad; if (r.winner === seat) h++; else if (r.winner === 1 - seat) e++; }
    ok(bad === 0 && easy >= 3 && h >= 7, 'the Recruit also wins against a random mover (' + easy + ' of 4), and the Veteran is the stronger of the two: of sixteen against the Recruit it won ' + h + ' and lost ' + e);
    const on = (type, owner, x, y, facing = 'N', hp) => ({ id: 0, type, owner, x, y, facing, hp: hp || G.TYPES[type].hp, rec: 0, snare: 0 }), game = (map, ...units) => { const s = G.newGame(map); s.units = units.map((u, i) => ({ ...u, id: i + 1 })); s.turn = 1; return s; }, sure = () => 0.5;
    { const s = game('board', on('slinger', 1, 4, 2, 'S'), on('bulwark', 0, 4, 5, 'N'), on('mender', 0, 6, 5, 'N', 10), on('strider', 0, 2, 6, 'N')), before = JSON.stringify(s), pl = AI.plan(s, 1, 'hard', sure), act = pl.find(a => a.type === 'act');
      ok(JSON.stringify(s) === before && act && act.x === 6 && act.y === 5, 'it plans without touching the board, and of two targets in reach it shoots the one it can finish (focus fire)'); }
    { const s = game('board', on('bulwark', 1, 4, 4, 'N'), on('strider', 0, 5, 4, 'W')), pl = AI.plan(s, 1, 'hard', sure), end = pl[pl.length - 1], act = pl.find(a => a.type === 'act'), mv = pl.find(a => a.type === 'move') || { x: 4, y: 4 };
      ok(act && act.x === 5 && act.y === 4 && end.type === 'end' && end.facing && G.sideOf({ x: mv.x, y: mv.y, facing: end.facing }, 5, 4) === 'front', 'it strikes the rogue beside it and ends the turn facing it, where its shield blocks'); }
    { const s = game('river', on('slinger', 1, 3, 8, 'S'), on('mender', 0, 2, 2, 'S', 6)), pl = AI.plan(s, 1, 'hard', sure), mv = pl.find(a => a.type === 'move'), act = pl.find(a => a.type === 'act');
      ok(mv && G.high(s, mv.x, mv.y) === 1 && act && act.x === 2 && act.y === 2, 'it climbs the hill to reach a target it could not reach from the ground below (terrain)'); }
    { const s = game('river', on('bulwark', 1, 5, 2, 'S'), on('strider', 0, 5, 9, 'N')), pl = AI.plan(s, 1, 'hard', sure), mv = pl.find(a => a.type === 'move');
      ok(mv && mv.y > 2 && !G.ground(s, mv.x, mv.y).solid, 'with nothing in reach it closes by the way a unit can walk'); } }
  // ---- the campaign as data ----
  { const C = CAMP.CAMPAIGN, ids = C.nodes.map(n => n.id), bad = [];
    for (const n of C.nodes) { const m = G.MAPS[n.map], seen = new Set(); if (!m) { bad.push(n.id + ' map'); continue; }
      for (const [type, x, y] of n.enemy) { const k = x + ',' + y; if (!G.TYPES[type] || x < 0 || x >= m.cols || y < 0 || y >= m.zone || (m.tiles && G.TERRAIN[m.tiles[y][x]].solid) || seen.has(k)) bad.push(n.id + ' ' + type + ' ' + k); seen.add(k); }
      if (!n.needs.every(q => ids.includes(q)) || !n.text || !n.won || !AI.LEVELS[n.level] || G.TERRAIN[C.map.tiles[n.at[1]][n.at[0]]].solid) bad.push(n.id + ' node'); }
    const order = []; let grew = true; while (grew) { grew = false; for (const n of C.nodes) if (!order.includes(n.id) && CAMP.isOpen(n.id, order)) { order.push(n.id); grew = true; } }
    ok(bad.length === 0 && C.nodes.length >= 6 && C.nodes.filter(n => n.optional).length >= 2 && C.nodes.filter(n => n.last).length === 1 && new Set(ids).size === ids.length && C.map.tiles.length === C.map.rows && C.map.tiles.every(r => r.length === C.map.cols), 'the campaign is whole: ' + C.nodes.length + ' battles (' + C.nodes.filter(n => n.optional).length + ' to the side, one last), each on a map the game has with its enemy on open ground in its own rows' + (bad.length ? ': ' + bad.join('; ') : ''));
    ok(order.length === ids.length && CAMP.isOpen(ids[0], []) && !CAMP.isOpen(C.nodes.find(n => n.last).id, []) && CAMP.budgetFor([]) === C.start && CAMP.budgetFor(ids) === C.start + C.nodes.reduce((a, n) => a + n.gain, 0) && CAMP.budgetFor(['toll', 'toll', 'nope', 7]) === C.start + 3 && CAMP.finished(ids) && !CAMP.finished(['toll']), 'its battles open in order from the first to the last, and each win adds to the points you may field (' + C.start + ' to ' + CAMP.budgetFor(ids) + ')'); }
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
    { const sa = last(a, 'state'), sb = last(b, 'state').state, sc = last(c, 'state').state;
      ok(sa.state.phase === 'setup' && !sa.started && sa.state.units.length === 10 && sa.state.units.every(u => u.owner === 0) && sb.units.length === 10 && sb.units.every(u => u.owner === 1) && sc.units.length === 0 && host.room.deadline === null, 'while the sides set out each sees only its own units, a spectator none, and no clock runs');
      say(a, { t: 'team', units: [{ type: 'strider', x: 4, y: 10 }, { type: 'ember', x: 3, y: 9 }] }); say(a, { t: 'team', units: [{ type: 'strider', x: 4, y: 2 }] }); const zone = last(a, 'error'); say(c, { t: 'team', units: [{ type: 'strider', x: 4, y: 10 }] }); say(c, { t: 'ready', on: true });
      ok(last(a, 'state').state.units.length === 2 && /own rows/.test(zone.msg) && last(b, 'state').state.units.length === 10 && host.room.state.units.length === 12, 'the room checks a team by the rules: a good one is taken, one off your rows refused, a spectator has no say');
      say(a, { t: 'ready', on: true }); const one = last(a, 'state'); say(a, { t: 'team', units: G.defaultTeam('board', 0) }); const fixed = last(a, 'error'); say(a, { t: 'ready', on: false }); const down = last(a, 'state').ready[0]; say(a, { t: 'ready', on: true }); say(b, { t: 'ready', on: true });
      ok(!one.started && one.ready[0] && !one.ready[1] && /ready/.test(fixed.msg) && !down && last(a, 'state').started && last(b, 'state').state.phase === 'play' && last(b, 'state').state.units.length === 12 && host.room.deadline > Date.now(), 'ready fixes your team (stand down to change it); when both are ready the match starts, each sees the other, the clock runs');
      say(b, { t: 'team', units: G.defaultTeam('board', 1) }); ok(/started/.test(last(b, 'error').msg), 'no team is changed once the match has started'); }
    say(b, { t: 'act', action: { type: 'end' } }); const turn = last(b, 'error'); say(c, { t: 'act', action: { type: 'surrender' } });
    ok(turn && /not your turn/.test(turn.msg) && host.room.state.winner === null && last(c, 'state').started && host.room.deadline > Date.now(), 'the rules decide in the room: no move out of turn, none from a spectator, the turn clock runs');
    M.gone(b); const off = last(a, 'state').present; const b2 = sock(); M.open(b2); say(b2, { t: 'join', code: 'ABCD', token: 'tb' });
    ok(off[0] && !off[1] && last(b2, 'joined').you === 1 && last(a, 'state').present[1] && host.saves > 0, 'a player who drops is shown offline and comes back to the same seat');
    say(a, { t: 'act', action: { type: 'surrender' } }); ok(host.room.state.winner === 1 && host.room.deadline === null && last(c, 'state').state.winner === 1, 'a surrender ends it for everyone and stops the clock');
    clearTimeout(M.timer);
    ok(CHESS.CODE.test(CHESS.code()) && !CHESS.CODE.test('abcd') && !CHESS.CODE.test('ABCDE'), 'a room\'s code is four capital letters');
    { const mem = { v: null }, st = { get: async () => mem.v, put: async v => { mem.v = v; } }, team = { name: 'Two <mages>!', units: [{ type: 'ember', dx: -1, r: 0 }, { type: 'ember', dx: 1, r: 0 }, { type: 'dragon', dx: 0, r: 0 }, { type: 'mender', dx: 99, r: 0 }] };
      const kept = await CHESS.save(st, { teams: [team, { name: '', units: [] }, 7], xp: { bulwark: 999 } }), back = await CHESS.load(st);
      ok(kept.ok && back.rec.teams.length === 1 && back.rec.teams[0].name === 'Two mages' && back.rec.teams[0].units.length === 2 && !('xp' in mem.v) && (await CHESS.load({ get: async () => null })).rec.teams.length === 0, 'a login\'s saved teams are cut to size before they are kept: ' + JSON.stringify(back.rec.teams[0])); }
    { const mem = {}, h = { room: null, save() {}, store: pid => ({ get: async () => mem[pid], put: async v => { mem[pid] = v; } }) }, M2 = new CHESS.Match(h), w = sock(), w2 = sock(), tell = (x, m) => M2.message(x, 'SOLO', JSON.stringify(m)); M2.open(w); M2.open(w2);
      await tell(w, { t: 'create', token: 'me', solo: 'hard', map: 'river' }); const s0 = last(w, 'state'); await tell(w2, { t: 'join', code: 'SOLO', token: 'other' });
      ok(last(w, 'joined').you === 0 && last(w2, 'joined').you === -1 && s0.solo === 'hard' && s0.state.phase === 'setup' && s0.ready[1] && !s0.ready[0] && s0.state.units.every(u => u.owner === 0) && h.room.state.units.filter(u => u.owner === 1).length === 10, 'a room against the computer: you have seat one, it has the other and is ready, a second person can only watch');
      await tell(w, { t: 'ready', on: true }); await tell(w, { t: 'act', action: { type: 'end' } }); clearTimeout(M2.aiTimer); const mine = last(w, 'state');
      let steps = 0; while (M2.aiStep() && steps < 9) { steps++; clearTimeout(M2.aiTimer); } clearTimeout(M2.aiTimer);
      ok(mine.started && mine.deadline === null && mine.state.turn === 1 && steps >= 1 && steps <= 3 && h.room.state.turn === 0 && h.room.state.turnNo === 3 && w.got.filter(m => m.t === 'state').slice(-steps).every(m => m.events.length > 0), 'READY starts it with no clock; after your turn the computer takes its own through the same rules, a step at a time (' + steps + '), and hands the turn back'); clearTimeout(M2.timer);
      const camp = async (pid, msg) => { const hh = { room: null, save() {}, store: h.store }, m = new CHESS.Match(hh), x = sock(); m.open(x, pid); await m.message(x, 'CAMP', JSON.stringify({ t: 'create', token: 't', ...msg })); clearTimeout(m.aiTimer); return { hh, m, x }; };
      const shut = await camp('p1', { camp: 'pass' }), first = await camp('p1', { camp: 'toll' }), st = first.hh.room && first.hh.room.state, node = CAMP.nodeOf('toll');
      ok(/not open/.test((last(shut.x, 'error') || {}).msg || '') && !shut.hh.room && st && st.map === node.map && st.budget === CAMP.CAMPAIGN.start && G.teamCost(st.units.filter(u => u.owner === 0)) <= st.budget && st.units.filter(u => u.owner === 1).map(u => u.type + u.x + u.y).join() === node.enemy.map(e => e.join('')).join() && first.hh.room.ai.level === node.level && last(first.x, 'state').camp === 'toll', 'a battle of the campaign: only an open one can be fought; it is on its own map with the enemy as written and your points as the campaign gives them (' + (st && st.budget) + ')');
      st.phase = 'play'; st.units = st.units.filter(u => u.owner === 0); st.winner = 0; first.m.finish(); await nap(20);
      const next = await camp('p1', { camp: 'ruins' }), cheat = await camp('', { camp: 'ruins', done: [] }), anon = await camp('', { camp: 'ruins', done: ['toll'] }), back = await CHESS.load(h.store('p1'));
      ok(mem.p1 && back.rec.camp.done.join() === 'toll' && next.hh.room && next.hh.room.state.budget === CAMP.CAMPAIGN.start + 3 && !cheat.hh.room && anon.hh.room && anon.hh.room.state.budget === CAMP.CAMPAIGN.start + 3, 'a battle won by the rules is written to the login\'s record by the room (never by the page), opens the next and adds its points; anyone not signed in keeps their own');
      const kept = await CHESS.save(h.store('p1'), { company: [{ type: 'bulwark', dx: 0, r: 0 }], camp: { done: ['beacon'] } }); ok(kept.ok && (await CHESS.load(h.store('p1'))).rec.camp.done.join() === 'toll' && (await CHESS.load(h.store('p1'))).rec.company.length === 1, 'the page can save the company it fields, not which battles are won'); }
    const mk = map => { const h = { room: null, save() {} }, m = new CHESS.Match(h), w = sock(); m.open(w); m.message(w, 'WXYZ', JSON.stringify({ t: 'create', token: 't', map })); clearTimeout(m.timer); return h.room.state; };
    ok(mk('river').map === 'river' && mk('river').cols === 11 && mk('nowhere').map === 'board' && mk(7).map === 'board' && mk(undefined).map === 'board', 'the host names the map when the room is made; one the server does not know is the plain board'); }

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
    const land = fs.readdirSync(path.join(ROOT, 'data/chess/land')).flatMap(d => fs.readdirSync(path.join(ROOT, 'data/chess/land', d)).map(f => 'land/' + d + '/' + f));
    ok(land.length >= 15 && [...src('land.js').matchAll(/tex\('(\w+)'/g)].every(m => land.includes('land/tex/' + m[1] + '.jpg')) && [...src('land.js').matchAll(/model\('(\w+)'\)/g)].every(m => land.includes('land/m/' + m[1] + '.glb')), 'every picture and model the landscape names is in data/chess/land/ (' + land.length + ' files)');
    const urls = [...sfx.map(n => 'sfx/' + n + '.mp3'), ...glb.map(n => 'characters/' + n + '.glb'), ...png.map(n => 'fx/' + n + '.png'), ...land], bad = [], types = {};
    for (const u of urls) { const q = await fetch(BASE + '/chess-assets/' + u, { method: 'HEAD' }); if (q.status !== 200) bad.push(u + ' ' + q.status); else types[u.split('.').pop()] = q.headers.get('content-type'); }
    ok(sfx.length >= 30 && glb.length >= 8 && png.length >= 10 && !bad.length, 'every file it fetches is handed out (' + sfx.length + ' mp3, ' + glb.length + ' glb, ' + png.length + ' png)' + (bad.length ? ': ' + bad.join(', ') : ''));
    ok(/audio\/mpeg/.test(types.mp3) && /gltf-binary/.test(types.glb) && /image\/png/.test(types.png) && /image\/jpeg/.test(types.jpg), 'each as its kind: ' + JSON.stringify(types));
    const x = await fetch(BASE + '/chess-assets/../g/market.html'), y = await fetch(BASE + '/chess-assets/CREDITS.md'), z = await fetch(BASE + '/chess/ws?create=1');
    ok(x.status !== 200 && y.status === 404 && z.status === 426, 'nothing else under /chess-assets/, and the room answers only a socket'); }

  // a seat over a bare socket (the page's own messages)
  const seat = (query, first, auto = true) => new Promise(res => { const s = new WebSocket('ws://127.0.0.1:' + PORT + '/chess/ws?' + query), o = { s, got: [], state: null, you: null, code: null, err: [], act: a => s.send(JSON.stringify({ t: 'act', action: a })), say: m => s.send(JSON.stringify(m)) };
    s.onmessage = e => { const m = JSON.parse(e.data); o.got.push(m); if (m.t === 'joined') { o.you = m.you; o.code = m.code; if (auto && m.you >= 0) o.say({ t: 'ready', on: true }); } if (m.t === 'state') o.state = m.state; if (m.t === 'error') o.err.push(m.msg); };
    s.onopen = () => { s.send(JSON.stringify(first)); res(o); }; s.onerror = () => res(o); });
  const wait = async (f, ms = 15000) => { const t = Date.now(); while (Date.now() - t < ms) { if (f()) return true; await nap(20); } return false; };
  { const a = await seat('create=1', { t: 'create', token: 'sock-a' }); await wait(() => a.code);
    const n = await seat('room=QQQQ', { t: 'join', code: 'QQQQ', token: 'x' }); await wait(() => n.err.length);
    const b = await seat('room=' + (a.code || '').toLowerCase(), { t: 'join', code: a.code, token: 'sock-b' }); await wait(() => b.state && b.got.some(m => m.t === 'state' && m.started));
    ok(/^[A-Z]{4}$/.test(a.code || '') && a.you === 0 && b.you === 1 && /No room/.test(n.err[0] || ''), 'the Durable Object: a made room has a four-letter code, the second player joins by it, an unknown code has no room (' + a.code + ')');
    b.act({ type: 'surrender' }); await wait(() => a.state && a.state.winner !== null);
    ok(a.state && a.state.winner === 0, 'a surrender there gives the other player the win');
    for (const o of [a, b, n]) o.s.close(); }
  { const a = await seat('create=1', { t: 'create', token: 'team-a', map: 'ruins' }, false); await wait(() => a.state);
    const b = await seat('room=' + a.code, { t: 'join', code: a.code, token: 'team-b' }, false); await wait(() => b.state);
    a.say({ t: 'team', units: [{ type: 'bulwark', x: 5, y: 10 }, { type: 'slinger', x: 4, y: 10 }, { type: 'slinger', x: 6, y: 10 }] }); await wait(() => a.state.units.length === 3);
    b.say({ t: 'team', units: [{ type: 'ember', x: 5, y: 0 }, { type: 'ember', x: 4, y: 0 }, { type: 'ember', x: 6, y: 0 }] }); await wait(() => b.err.length);
    const hidden = a.state.units.length === 3 && b.state.units.length === 10 && b.state.units.every(u => u.owner === 1) && /At most 2/.test(b.err[0] || '');
    a.say({ t: 'ready', on: true }); b.say({ t: 'ready', on: true }); await wait(() => a.state.phase === 'play' && b.state.phase === 'play');
    ok(hidden && a.state.units.length === 13 && b.state.units.filter(u => u.owner === 0).map(u => u.type).sort().join() === 'bulwark,slinger,slinger' && a.got.some(m => m.t === 'state' && m.started), 'in the Durable Object: each side sets out unseen, a team over a limit is refused, and both ready starts the match with the teams as placed');
    const dev = await fetch(BASE + '/chess/load', { method: 'POST', headers: { 'content-type': 'application/json', Origin: 'https://elsewhere.example' }, body: '{}' });
    const anon = await fetch(BASE + '/chess/load', { method: 'POST', headers: { 'content-type': 'application/json', Origin: BASE }, body: '{}' }).then(r => r.json()).catch(() => 0);
    ok(dev.status === 403 && anon && anon.rec === null, 'saved teams are a login\'s own: the website refuses the call from another site, and tells anyone not signed in to keep theirs in the browser');
    for (const o of [a, b]) o.s.close(); }
  { const a = await seat('create=1', { t: 'create', token: 'solo-a', solo: 'easy', map: 'board' }); await wait(() => a.state && a.state.phase === 'play');
    a.act({ type: 'end' }); const back = await wait(() => a.state.turn === 0 && a.state.turnNo >= 3, 20000);
    ok(back && a.got.some(m => m.t === 'state' && m.solo === 'easy' && m.started && m.deadline === null) && a.got.filter(m => m.t === 'state' && m.events.some(e => ['move', 'act', 'face', 'turn'].includes(e.t))).length >= 2, 'against the computer in the Durable Object: READY starts it, and it answers your turn with its own (turn ' + (a.state && a.state.turnNo) + ')');
    const b = await seat('create=1', { t: 'create', token: 'camp-b', camp: 'pass', done: [] }, false); await wait(() => b.err.length);
    const c = await seat('create=1', { t: 'create', token: 'camp-c', camp: 'toll', done: [] }, false); await wait(() => c.state);
    ok(/not open/.test(b.err[0] || '') && c.state && c.state.map === 'river' && c.state.budget === 28 && c.got.some(m => m.camp === 'toll'), 'and a battle of the campaign there: a closed one is refused, the first is set on its map with the campaign\'s points');
    for (const o of [a, b, c]) o.s.close(); }
  { const a = await seat('create=1', { t: 'create', token: 'map-a', map: 'river' }); await wait(() => a.code);
    const b = await seat('room=' + a.code, { t: 'join', code: a.code, token: 'map-b' }); await wait(() => b.state && a.state && b.got.some(m => m.t === 'state' && m.started));
    const k = a.state.units.find(u => u.owner === 0 && u.type === 'bulwark' && u.x === 4), e0 = a.err.length;
    a.act({ type: 'move', unit: k.id, x: 4, y: 5 }); await wait(() => a.err.length > e0); const wet = a.err.length > e0;
    a.act({ type: 'move', unit: k.id, x: 4, y: 6 }); await wait(() => b.state.active);
    ok(a.state.map === 'river' && b.state.map === 'river' && b.state.cols === 11 && wet && b.state.units.find(u => u.id === k.id).y === 6, 'a match made on Millford Crossing is judged by its ground in the Durable Object: no step into the river, the step to its bank goes through');
    for (const o of [a, b]) o.s.close(); }

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
  ok(/^[A-Z]{4}$/.test(code || '') && (await (await on(A)).evaluate(() => location.pathname + location.search)) === '/chess?room=' + code && /Choose your team - 40\/40 points/.test(await (await on(A)).textContent('#status')), 'its link is /chess?room=' + code + ', and it starts by choosing a team');
  // the team picker: remove a rogue, place a third archer, a tile off your rows is refused, save the team, go back to the standing one, load the saved one
  { const P = await on(A), mine = async () => (await st(A)).units, n = async t => (await mine()).filter(u => u.type === t).length, txt = id => P.textContent('#' + id);
    ok(await P.isVisible('#setup') && (await mine()).length === 10 && (await mine()).every(u => u.owner === 0) && /40 \/ 40 points/.test(await txt('budget')) && (await P.locator('#roster button').count()) === 7, 'the picker shows the budget, the seven kinds with their cost and limit, and only your own side on the table');
    const rogue = (await mine()).find(u => u.type === 'strider'); await tap(A, { kind: 'unit', id: rogue.id }); await P.click('#removeBtn'); await until(A, () => window.__t.state.units.length === 9);
    ok((await n('strider')) === 1 && /36 \/ 40 points/.test(await txt('budget')), 'REMOVE takes the picked unit off and gives its points back');
    await P.click('#roster button[data-type="slinger"]'); const heldNow = await P.evaluate(() => window.__t.held); await tap(A, { kind: 'tile', x: 0, y: 10 }); await until(A, () => window.__t.state.units.length === 10);
    await tap(A, { kind: 'tile', x: 0, y: 5 }); await P.waitForTimeout(300);
    ok(heldNow === 'slinger' && (await n('slinger')) === 3 && (await mine()).some(u => u.type === 'slinger' && u.x === 0 && u.y === 10) && /own rows/.test(await txt('setupMsg')) && /40 \/ 40/.test(await txt('budget')), 'a kind is picked, then a tile on your rows: a third archer stands there; a tile off your rows is refused');
    await tap(A, { kind: 'tile', x: 1, y: 10 }); await P.waitForTimeout(300); ok(/budget/.test(await txt('setupMsg')) && (await mine()).length === 10, 'and nothing more fits in the budget');
    await tap(A, null); const arch = (await mine()).find(u => u.x === 0 && u.y === 10); await tap(A, { kind: 'unit', id: arch.id }); await tap(A, { kind: 'tile', x: 8, y: 9 }); await until(A, () => window.__t.state.units.some(u => u.x === 8 && u.y === 9));
    ok((await mine()).some(u => u.type === 'slinger' && u.x === 8 && u.y === 9) && !(await mine()).some(u => u.x === 0 && u.y === 10), 'a placed unit is picked up and set down on another tile');
    const saved = await P.evaluate(() => window.__t.saveTeam('Three bows')); await P.click('#defaultBtn'); await until(A, () => window.__t.state.units.filter(u => u.type === 'slinger').length === 2);
    const std = (await n('strider')) === 2; await P.selectOption('#teamSel', '0'); await until(A, () => window.__t.state.units.filter(u => u.type === 'slinger').length === 3);
    ok(saved && std && (await n('slinger')) === 3 && (await mine()).some(u => u.x === 8 && u.y === 9) && (await P.evaluate(() => window.__t.teams.length)) === 1 && /Three bows/.test(await txt('teamSel')), 'a team is saved by name, DEFAULT brings the standing line-up back, and the saved team is set out again from the list');
    await P.click('#defaultBtn'); await until(A, () => window.__t.state.units.filter(u => u.type === 'slinger').length === 2);
    await shot(A, 'team');
    await P.click('#readyBtn'); ok(await until(A, () => /^Ready - waiting for an opponent/.test(document.getElementById('status').textContent)) && (await txt('readyBtn')) === 'Stand down', 'READY, and it waits for an opponent'); }
  await (await on(B)).goto(BASE + '/chess?room=' + code, { waitUntil: 'commit', timeout: 120000 });
  ok(await until(B, () => window.__t.me === 1 && window.__t.state && window.__t.state.units.length === 10) && (await st(B)).units.every(u => u.owner === 1) && (await st(A)).units.length === 10, 'the link seats the second player, who sets out without seeing the first\'s side');
  await (await on(B)).evaluate(() => document.getElementById('readyBtn').click());
  ok(await until(A, () => document.getElementById('status').textContent.startsWith('Your turn')) && await until(B, () => window.__t.state.units.length === 20) && !(await (await on(B)).isVisible('#setup')), 'both ready: the match starts, both sides are on the table, and the first is told it is their turn');
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
  { const hit = await (await on(A)).evaluate(() => { const T = window.__t, id = T.state.units.find(u => u.owner === 0 && u.type === 'bulwark').id; let g = null; T.scene.traverse(o => { if (o.userData && o.userData.pick && o.userData.pick.kind === 'unit' && o.userData.pick.id === id) g = o; });
      const p = g.getWorldPosition(T.V(0, 0, 0)); p.y += 0.06; p.project(T.camera); return { id, x: (p.x + 1) / 2 * innerWidth, y: (1 - p.y) / 2 * innerHeight }; });
    await (await on(A)).mouse.click(hit.x, hit.y);
    ok(await until(A, id => window.__t.selected === id, hit.id, 8000), 'a real click on a knight\'s base picks it'); await tap(A, null); }

  ok(await people(A) && await people(B), 'the twenty people are drawn as their models on both pages');
  await shot(A, 'board-player1'); await shot(B, 'board-player2');

  // the rest of the match, played out for both seats over their own sockets (each page's token), the pages watching: every piece that can strike does, the others close in
  { const tok = async pg => (await on(pg)).evaluate(() => sessionStorage.getItem('token')), bots = [await seat('room=' + code, { t: 'join', code, token: await tok(A) }, false), await seat('room=' + code, { t: 'join', code, token: await tok(B) }, false)];
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

  // ---- the landscaped maps on the page: built from the map's data, a piece stands on its ground, a click finds its tile ----
  { const n0 = errs.length, L = await open(); cur = null;
    for (const id of Object.keys(G.MAPS).filter(id => G.MAPS[id].tiles)) { const m = G.MAPS[id];
      await L.goto(BASE + '/chess?show=' + id, { waitUntil: 'commit', timeout: 120000 }); await until(L, () => !!window.__t && !!window.__t.field && window.__t.field.land);
      await until(L, () => window.__t.field.stats().draws > 20, null, 120000); await people(L);
      const f = await L.evaluate(() => { const T = window.__t, F = T.field, st = F.stats(); let off = 0; T.scene.traverse(o => { const p = o.userData && o.userData.pick; if (p && p.kind === 'unit') { const u = T.state.units.find(u => u.id === p.id); if (u && Math.abs(o.userData.target.y - F.yAt(u.x, u.y)) > 1e-6) off++; } }); return { id: F.id, cols: F.cols, rows: F.rows, st, off, lights: F.lights.length, bg: !!T.scene.background }; });
      ok(f.id === id && f.cols === m.cols && f.rows === m.rows && f.off === 0 && f.bg && f.lights <= 2, m.name + ' is built from its data, every piece standing on its own tile\'s ground');
      ok(f.st.tris > 20000 && f.st.tris < 260000 && f.st.draws < 90, 'its cost on the low setting: ' + f.st.draws + ' draws, ' + f.st.tris + ' triangles, ' + f.st.blades + ' blades of grass, ' + f.st.trees + ' trees');
      const taken = new Set(G.newGame(id).units.map(u => u.x + ',' + u.y)), tile = (() => { for (let y = m.rows - 1; y >= 0; y--) for (let x = 0; x < m.cols; x++) if (m.tiles[y][x] === 'f' && !taken.has(x + ',' + y) && G.MAPS[id].high[y][x] >= (G.MAPS[id].high[Math.min(m.rows - 1, y + 1)][x])) return { x, y }; })();   // the forest tile nearest the seat with nobody on it and nothing higher in front
      const at = await L.evaluate(t => { const T = window.__t, p = T.V(t.x - (T.field.cols - 1) / 2, T.field.yAt(t.x, t.y), t.y - (T.field.rows - 1) / 2); p.project(T.camera); return { x: (p.x + 1) / 2 * innerWidth, y: (1 - p.y) / 2 * innerHeight }; }, tile);
      await L.mouse.click(at.x, at.y); await until(L, () => /^Forest/.test(document.getElementById('info').textContent), null, 8000);
      ok(/^Forest/.test(await L.textContent('#info')), 'a real click on a forest tile there says what the ground is: ' + (await L.textContent('#info')).slice(0, 60));
      const u = (await st(L)).units.find(u => u.owner === 0 && u.type === 'strider'); await tap(L, { kind: 'unit', id: u.id });
      const marks = await L.evaluate(() => { const T = window.__t, G = T.G, s = T.state, u = s.units.find(u => u.id === T.selected); return { n: G.reachable(s, u).length, solid: G.reachable(s, u).filter(p => G.ground(s, p.x, p.y).solid).length }; });
      ok(marks.n > 4 && marks.solid === 0, 'the rogue\'s moves are marked over the ground (' + marks.n + ' tiles, none of them water or rock)');
      await shot(L, 'map-' + id); await tap(L, null); }
    await L.goto(BASE + '/chess', { waitUntil: 'commit', timeout: 120000 }); await until(L, () => !!window.__t && document.getElementById('mapSel').options.length >= 4);
    await L.selectOption('#mapSel', 'pass'); await L.evaluate(() => document.getElementById('createBtn').click());
    ok(await until(L, () => window.__t.state && window.__t.state.map === 'pass' && window.__t.field && window.__t.field.id === 'pass') && /crags/.test(await L.textContent('#mapInfo')), 'the host picks the map on the menu: Greywether Pass is the one the room is made on');
    await L.evaluate(() => document.getElementById('helpBtn').click()); ok(/Forest/.test(await L.textContent('#rules')) && /High ground/.test(await L.textContent('#rules')), 'GROUND RULES lists what each ground does');
    ok(errs.length === n0, 'no page errors on the landscaped maps' + (errs.length > n0 ? ': ' + errs.slice(n0, n0 + 4).join(' | ') : '')); await L.context().close(); }

  // ---- the campaign on the page: the overland map, a banner a battle, a battle against the computer, back to the map ----
  { const n0 = errs.length, C = await open(), N = CAMP.CAMPAIGN.nodes.length; cur = null;
    await C.goto(BASE + '/chess', { waitUntil: 'commit', timeout: 120000 }); await until(C, () => !!window.__t && !!document.getElementById('campBtn'));
    ok((await C.locator('#levelSel option').count()) === 2 && /Cold Beacon/.test(await C.textContent('#campBtn')), 'the menu offers a match against the computer at two levels, and the campaign');
    await C.evaluate(() => document.getElementById('campBtn').click());
    ok(await until(C, () => window.__t.overland && window.__t.field && window.__t.field.id === '@camp' && window.__t.field.stats().draws > 20, null, 120000) && (await C.evaluate(() => { let n = 0; window.__t.scene.traverse(o => { if (o.userData && o.userData.pick && o.userData.pick.kind === 'node') n++; }); return n; })) === N && /0 of/.test(await C.textContent('#status')), 'CAMPAIGN lays the overland map on the table with a banner at each of its ' + N + ' battles');
    const at = await C.evaluate(() => { const T = window.__t; let g = null; T.scene.traverse(o => { if (o.userData && o.userData.pick && o.userData.pick.kind === 'node' && o.userData.pick.id === 'toll') g = o; }); const p = g.getWorldPosition(T.V(0, 0, 0)); p.y += 0.06; p.project(T.camera); return { x: (p.x + 1) / 2 * innerWidth, y: (1 - p.y) / 2 * innerHeight }; });
    await C.mouse.click(at.x, at.y); const picked = await until(C, () => window.__t.campSel === 'toll', null, 8000);
    ok(picked && /Toll at Millford/.test(await C.textContent('#campName')) && /28 points/.test(await C.textContent('#campPts')) && /Knight/.test(await C.textContent('#campFoe')) && !(await C.isDisabled('#fightBtn')), 'a real click on a banner tells the battle there: its words, who stands against you, the points you field');
    await tap(C, { kind: 'node', id: 'beacon' }); const shut = (await C.isDisabled('#fightBtn')) && /Not open yet/.test(await C.textContent('#campPts')); await shot(C, 'campaign'); await tap(C, { kind: 'node', id: 'toll' });
    await C.evaluate(() => document.getElementById('fightBtn').click());
    ok(shut && await until(C, () => window.__t.state && window.__t.state.map === 'river' && window.__t.state.phase === 'setup' && window.__t.campNode === 'toll' && window.__t.me === 0) && (await st(C)).budget === 28 && /\/ 28 points/.test(await C.textContent('#budget')), 'a battle not yet open cannot be fought; FIGHT opens the first on its own field, to set out under the campaign\'s points');
    await C.evaluate(() => document.getElementById('readyBtn').click()); await until(C, () => window.__t.state.phase === 'play' && window.__t.state.units.length > 10);
    const foes = (await st(C)).units.filter(u => u.owner === 1).length; await tap(C, { kind: 'end' });
    ok(foes === CAMP.nodeOf('toll').enemy.length && await until(C, () => window.__t.state.turn === 0 && window.__t.state.turnNo >= 3, null, 30000) && /^Your turn$/.test(await C.textContent('#status')), 'READY starts the battle against the enemy as written (' + foes + '); the computer takes its turn and gives yours back, with no clock');
    // the rest of the battle, played for you over your own socket by the Veteran's mind; whichever way it ends, the page must say so and take you back to the map
    const me = await seat('room=' + await C.evaluate(() => window.__t.code), { t: 'join', code: await C.evaluate(() => window.__t.code), token: await C.evaluate(() => sessionStorage.getItem('token')) }, false); await wait(() => me.state);
    for (let i = 0; i < 400 && me.state.winner === null; i++) { if (me.state.turn !== 0) { await wait(() => me.state.turn === 0 || me.state.winner !== null, 20000); continue; }
      for (const a of AI.plan(me.state, 0, 'hard')) { const n = me.got.length; me.act(a); await wait(() => me.got.length > n, 5000); if (me.state.winner !== null) break; }
      if (me.state.turn === 0 && me.state.winner === null) { const n = me.got.length; me.act({ type: 'end' }); await wait(() => me.got.length > n, 5000); } }
    const won = me.state.winner === 0; me.s.close();
    ok(me.state.winner !== null && await until(C, () => !document.getElementById('after').hidden, null, 20000) && (won ? /won/ : /lost/).test(await C.textContent('#afterTitle')), 'the battle is fought to its end (' + (won ? 'won' : 'lost') + ' in ' + me.state.turnNo + ' turns), and the page says how it went');
    await C.evaluate(() => document.getElementById('afterBtn').click());
    ok(await until(C, () => window.__t.overland && window.__t.field.id === '@camp') && (await C.evaluate(() => window.__t.camp.done.join())) === (won ? 'toll' : '') && (await C.evaluate(() => window.__t.CAMPAIGN && JSON.parse(localStorage.getItem('chess-camp') || '{"done":[]}').done.join())) === (won ? 'toll' : ''), 'BACK TO THE MAP: ' + (won ? 'the battle is marked won, kept in the browser for anyone not signed in, and the next ones are open' : 'nothing is won, and the battle can be tried again'));
    ok(errs.length === n0, 'no page errors in the campaign' + (errs.length > n0 ? ': ' + errs.slice(n0, n0 + 4).join(' | ') : '')); await C.context().close(); }

  // ---- an emulated Quest 3: AR, the board in front of you, a controller picks a piece ----
  { const n0 = errs.length, Q = await open(IWER + ';window.xrDevice=new IWER.XRDevice(IWER.metaQuest3);xrDevice.installRuntime({forceInstall:true});xrDevice.position.set(0,1.6,0);');
    await Q.goto(BASE + '/chess', { waitUntil: 'commit', timeout: 120000 }); await until(Q, () => !!window.__t); await Q.evaluate(() => document.getElementById('createBtn').click()); await until(Q, () => window.__t.code && window.__t.state);
    const qc = await Q.evaluate(() => window.__t.code), foe = await seat('room=' + qc, { t: 'join', code: qc, token: 'quest-foe' }); await until(Q, () => window.__t.ready[1]);
    ok(await until(Q, () => !document.getElementById('arBtn').hidden, null, 20000), 'in a Quest 3 the page offers ENTER AR');
    await Q.evaluate(() => document.getElementById('arBtn').click());
    ok(await until(Q, () => window.__t.renderer.xr.isPresenting && window.__t.scene.background === null), 'it starts a passthrough session: no sky, no table, the room shows through');
    const board = () => Q.evaluate(() => { const T = window.__t, w = T.scene.children.find(o => o.isGroup && o.children.length > 3); return { s: w.scale.x, x: w.position.x, y: w.position.y, z: w.position.z }; });
    await until(Q, () => { const w = window.__t.scene.children.find(o => o.isGroup && o.children.length > 3); return w.position.z < -0.3; }, null, 30000);
    const bd = await board(); ok(Math.abs(bd.s - 0.06) < 1e-6 && Math.abs(bd.z + 0.55) < 0.05 && Math.abs(bd.y - 1.1) < 0.05, 'the board is set at table size (a tile 6 cm) half a metre in front of you: ' + JSON.stringify(bd));
    await people(Q);
    const aim = async id => Q.evaluate(id => { const T = window.__t; let g = null; T.scene.traverse(o => { if (o.userData && o.userData.pick && o.userData.pick.kind === 'unit' && o.userData.pick.id === id) g = o; });
      const p = g.getWorldPosition(T.V(0, 0, 0)), c = xrDevice.controllers.right; c.position.set(p.x, p.y + 0.3, p.z); c.quaternion.set(-Math.SQRT1_2, 0, 0, Math.SQRT1_2); }, id);
    const press = async (k = 'trigger') => { await Q.evaluate(k => xrDevice.controllers.right.updateButtonValue(k, 1), k); await Q.waitForTimeout(400); await Q.evaluate(k => xrDevice.controllers.right.updateButtonValue(k, 0), k); await Q.waitForTimeout(400); };
    { const spot = pk => Q.evaluate(pk => { const T = window.__t; let g = null; T.scene.traverse(o => { const p = o.userData && o.userData.pick; if (p && p.kind === pk.kind && (p.type === pk.type) && (p.act === pk.act) && o.visible) g = o; }); if (!g) return false;
        const p = g.getWorldPosition(T.V(0, 0, 0)), c = xrDevice.controllers.right; c.position.set(p.x, p.y + 0.25, p.z); c.quaternion.set(-Math.SQRT1_2, 0, 0, Math.SQRT1_2); return true; }, pk);
      const mage = (await st(Q)).units.find(u => u.type === 'mender'); await tap(Q, { kind: 'unit', id: mage.id }); const s1 = await spot({ kind: 'setup', act: 'remove' }); await Q.waitForTimeout(600); await press(); await until(Q, () => window.__t.state.units.length === 9);
      const s2 = await spot({ kind: 'chip', type: 'hexbinder' }); await Q.waitForTimeout(600); await press(); const heldQ = await Q.evaluate(() => window.__t.held);
      await tap(Q, { kind: 'tile', x: mage.x, y: mage.y }); await until(Q, () => window.__t.state.units.length === 10);
      ok(s1 && s2 && heldQ === 'hexbinder' && (await st(Q)).units.filter(u => u.type === 'hexbinder').length === 2 && (await st(Q)).units.every(u => u.owner === 0), 'in the headset the table\'s own buttons set out a team: REMOVE under the controller, then the Enchanter\'s chip, then a tile');
      const s3 = await spot({ kind: 'setup', act: 'ready' }); await Q.waitForTimeout(600); await press();
      ok(s3 && await until(Q, () => window.__t.state.phase === 'play' && window.__t.state.units.length === 20) && foe.state.units.filter(u => u.owner === 0 && u.type === 'hexbinder').length === 2, 'READY under the controller starts the match with that team'); }
    const kn = (await st(Q)).units.find(u => u.owner === 0 && u.type === 'lancer'); await aim(kn.id); await Q.waitForTimeout(600); await press();
    ok((await Q.evaluate(() => window.__t.selected)) === kn.id, 'the controller\'s trigger, pointed down at a piece, picks it');
    await tap(Q, { kind: 'tile', x: kn.x, y: kn.y - 2 }); await until(Q, id => window.__t.state.active && window.__t.state.active.id === id, kn.id); await tap(Q, { kind: 'end' });
    ok(await wait(() => foe.state && foe.state.turn === 1 && foe.state.units.find(u => u.id === kn.id).y === kn.y - 2), 'a move made in the headset reaches the other player');
    await Q.evaluate(() => xrDevice.controllers.right.updateButtonValue('squeeze', 1)); await Q.waitForTimeout(3000); await Q.evaluate(() => { const c = xrDevice.controllers.right; c.position.set(c.position.x + 0.2, c.position.y, c.position.z); }); await until(Q, x => { const w = window.__t.scene.children.find(o => o.isGroup && o.children.length > 3); return Math.abs(w.position.x - x - 0.2) < 0.03; }, bd.x, 20000);
    const moved = await board(); await Q.evaluate(() => xrDevice.controllers.right.updateButtonValue('squeeze', 0));
    ok(Math.abs(moved.x - bd.x - 0.2) < 0.03, 'holding the grip drags the board with the hand');
    if (OUT) await Q.screenshot({ path: path.join(OUT, 'quest3-ar.png'), timeout: 180000 }).catch(() => {});
    await Q.evaluate(() => window.__t.openCampaign()); await until(Q, () => window.__t.overland && window.__t.field.id === '@camp');
    await Q.evaluate(() => { const T = window.__t; let g = null; T.scene.traverse(o => { const p = o.userData && o.userData.pick; if (p && p.kind === 'node' && p.id === 'toll') g = o; }); const p = g.getWorldPosition(T.V(0, 0, 0)), c = xrDevice.controllers.right; c.position.set(p.x, p.y + 0.3, p.z); c.quaternion.set(-Math.SQRT1_2, 0, 0, Math.SQRT1_2); }); await Q.waitForTimeout(600); await press();
    ok((await Q.evaluate(() => window.__t.campSel)) === 'toll' && await Q.evaluate(() => { let v = false; window.__t.scene.traverse(o => { if (o.userData && o.userData.pick && o.userData.pick.kind === 'fight' && o.visible) v = true; }); return v; }) && (await Q.evaluate(() => window.__t.renderer.xr.isPresenting)), 'in the headset the campaign\'s map is on the table too: the trigger on a banner picks its battle and FIGHT stands beside the board');
    await Q.evaluate(() => window.__t.renderer.xr.getSession().end()); ok(await until(Q, () => !window.__t.renderer.xr.isPresenting && window.__t.scene.background !== null), 'leaving AR puts the table and its hall back');
    ok(errs.length === n0, 'no page errors in the headset' + (errs.length > n0 ? ': ' + errs.slice(n0, n0 + 4).join(' | ') : '')); foe.s.close(); }
  await done(b);
})().catch(e => { console.log('FAIL the check itself broke: ' + (e && e.stack || e)); halt(); process.exit(1); });
