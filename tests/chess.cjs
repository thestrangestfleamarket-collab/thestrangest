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
  const LV = (await import(pathToFileURL(path.join(ROOT, 'archive/chess-levels/src/levels.js')))).LEVELS;
  ok(Object.keys(G.MAPS).join() === 'board' && Object.keys(LV).length === 8 && !fs.existsSync(path.join(ROOT, 'src/chess/land.js')) && !fs.existsSync(path.join(ROOT, 'data/chess/land')), 'the plain board is the only battlefield; the eight landscaped ones, their drawing and their files are set aside in archive/chess-levels/');
  Object.assign(G.MAPS, LV);   // back as data for the checks of the ground rules below (the terrain table is still the game's own): taken out again before the room and the page are tried
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
    // the three worlds (Glimmerdeep, the Rimewater, Cinderscar): new grounds in the one table, the same rules
    { const at = (id, ...units) => { const s = G.newGame(id); s.units = units.map((u, i) => ({ ...u, id: i + 1 })); return s; }, half = () => 0.5, T = G.TERRAIN;
      ok(['deep', 'rime', 'scar'].every(id => G.MAPS[id] && G.MAPS[id].look.amb && G.MAPS[id].look.tex && G.MAPS[id].look.foot) && 'inmclakv'.split('').every(c => T[c] && T[c].name) && JSON.stringify(G.MAPS.board) === '{"name":"The Board","info":"The plain stone board: no ground rules, nine by eleven.","cols":9,"rows":11,"zone":3}'
        && T.s.cost === 2 && T.s.slip === 0.5 && T.f.cost === 2 && T.f.cover === 0.5 && T.w.solid && !T.w.wall && T.r.solid && T.r.wall && T.x.wall && !T['.'].cost && !T.d.cost && !T.b.cost,
        'the three worlds are maps like the others, their grounds (' + 'inmclakv'.split('').map(c => T[c].name).join(', ') + ') rows of the one table; the plain board and the old grounds are as they were');
      { const clear = ['deep', 'rime', 'scar'].every(id => { const m = G.MAPS[id]; return m.props.every(p => p.k === 'glow' || p.x < -0.3 || p.y < -0.3 || p.x > m.cols + 0.3 || p.y > m.rows + 0.3 || (Math.abs(p.x - Math.round(p.x)) < 0.06 && Math.abs(p.y - Math.round(p.y)) < 0.06) || (p.x >= 0 && p.y >= 0 && p.x < m.cols && p.y < m.rows && T[m.tiles[Math.floor(p.y)][Math.floor(p.x)]].solid)); });
        ok(clear, 'nothing of a world stands where a piece can: its props are off the grid, on ground nobody can enter, or at the corner where four tiles meet'); }
      { const s = at('rime', on('bulwark', 0, 5, 7)), k = s.units[0], d = at('rime', on('bulwark', 0, 3, 7));
        ok(T.i.slip === 0.5 && !T.i.cost && !T.i.solid && can(s, k, 5, 4) && !can(s, k, 4, 5) && G.ground(s, 4, 5).solid && can(d, d.units[0], 2, 7) && !can(d, d.units[0], 1, 7), 'the Rimewater: the ice bears a knight across at walking pace, the black water where it broke does not, and deep snow takes two move points');
        const f = at('rime', on('strider', 0, 5, 6), on('bulwark', 1, 5, 5, 'S'), on('strider', 0, 5, 9), on('bulwark', 1, 5, 8, 'S')), [r1, icy, r2, dry] = f.units;
        G.apply(f, 0, { type: 'act', unit: r1.id, x: 5, y: 5 }, half); G.apply(f, 0, { type: 'end' }); G.apply(f, 1, { type: 'end' }); G.apply(f, 0, { type: 'act', unit: r2.id, x: 5, y: 8 }, half);
        ok(icy.hp < 50 && dry.hp === 50, 'a piece standing on the ice blocks at half its block: the same blow gets through there and is blocked on the bank'); }
      { const s = at('deep', on('bulwark', 0, 7, 9)), k = s.units[0], a = at('deep', on('slinger', 0, 9, 5), on('mender', 1, 9, 9, 'N')), l = at('deep', on('lancer', 0, 1, 9), on('mender', 1, 1, 7, 'S'), on('lancer', 0, 2, 9), on('mender', 1, 2, 7, 'S'));
        const r = G.apply(a, 0, { type: 'act', unit: a.units[0].id, x: 9, y: 9 }, never);
        ok(can(s, k, 9, 9) && !can(s, k, 10, 9) && r.ok && a.units[1].hp === 24 - 8 && G.ground(l, 1, 8).wall && G.ground(l, 1, 8).solid && G.targets(l, l.units[0]).length === 0 && G.targets(l, l.units[2]).length === 1, 'Glimmerdeep: giant fungus takes two move points and halves an arrow (16 becomes 8); crystal cannot be entered and stops the axe'); }
      { const s = at('scar', on('bulwark', 0, 5, 7)), k = s.units[0], h = at('scar', on('bulwark', 0, 0, 8)), l = at('scar', on('lancer', 0, 3, 5), on('mender', 1, 5, 5, 'W')), a = at('scar', on('slinger', 0, 5, 9), on('mender', 1, 5, 5, 'S'));
        const r = G.apply(a, 0, { type: 'act', unit: a.units[0].id, x: 5, y: 5 }, never);
        ok(G.ground(s, 4, 5).solid && !G.ground(s, 4, 5).wall && G.reachable(s, k).every(p => !G.ground(s, p.x, p.y).solid) && can(s, k, 5, 4) && G.targets(l, l.units[0]).length === 1 && r.ok && a.units[1].hp === 24 - 8 && !T.v.cost && can(h, h.units[0], 2, 8) && !can(h, h.units[0], 3, 8),
          'Cinderscar: lava cannot be entered but the axe reaches over it; the neck of land is crossed through the steam vent, where an arrow does half; an ash drift takes two move points'); }
    }
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
    ok(G.PICK.length === 14 && Object.keys(G.TYPES).length === 15 && G.PICK.map(q => G.TYPES[q]).every(t => t.cost >= 3 && t.cost <= 13 && t.limit >= 1 && G.GROUPS[t.group] && t.info) && !G.TYPES.skeleton.group && /Unknown/.test(t(k('skeleton', 0))) && ['pike', 'warden', 'arbalest', 'assassin', 'bard', 'frost', 'summoner', 'storm', 'golem'].every(c => !G.TYPES[c] && !G.UPGRADES[c] && /Unknown/.test(t(k(c, 0)))) && G.TYPES.captain.limit === 1 && G.TYPES.whelp.limit === 1 && G.TYPES.whelp.cost * 3 >= G.BUDGET - 3 && G.PICK.map(q => G.TYPES[q]).filter(t => t.group !== 'fighter').every(t => t.limit <= 4) && /At most 1 of the Captain/.test(t(k('captain', 0), k('captain', 1))) && /At most 1 of the Dragon/.test(t(k('whelp', 0), k('whelp', 1))) && /budget/.test(t(...[0, 1, 2, 3].map(x => k('bulwark', x)), ...[4, 5, 6, 7].map(x => k('strider', x)), k('slinger', 8), k('slinger', 9))) && /At most 2/.test(t(k('mender', 0), k('mender', 1), k('mender', 2))), 'fourteen types may be picked (the Skeleton is only raised, and the nine cut types are unknown); a team over the budget is refused, and so is a third cleric');
    ok(/own rows/.test(t(k('strider', 0, 3))) && /own rows/.test(t(k('strider', 99))) && /own rows/.test(t(k('strider', 0.5))) && /Two units/.test(t(k('strider', 0), k('lancer', 0))) && /Unknown/.test(t(k('dragon', 0))) && /Unknown/.test(t(k('constructor', 0))) && /1 to 12/.test(t()) && /1 to 12/.test(G.checkTeam(s, 0, 'x')) && /own rows/.test(G.checkTeam(s, 1, [k('strider', 0)])), 'units go on your own rows, one a tile, of a kind the game has');
    const small = [k('strider', 5), k('ember', 4), k('ember', 6, row - 1)];
    ok(G.setTeam(s, 0, small) === null && s.units.filter(u => u.owner === 0).length === 3 && s.units.filter(u => u.owner === 1).length === 10 && new Set(s.units.map(u => u.id)).size === 13 && s.units.find(u => u.owner === 0 && u.type === 'strider').facing === 'N', 'a checked team replaces that side\'s units and leaves the other side alone');
    G.begin(s); ok(s.phase === 'play' && /started/.test(G.setTeam(s, 0, def)) && G.apply(s, 0, { type: 'end' }).ok, 'once begun the teams are fixed and the match plays'); }
  // ---- experience and upgrades: levels, the trees, what each upgrade does in the rules ----
  { const T = G.tidyUps, has = (o, k) => (o[k] || []).join();
    ok(G.levelOf(0) === 0 && G.levelOf(30) === 1 && G.levelOf(89) === 1 && G.levelOf(90) === 2 && G.levelOf(5000) === 3 && Object.keys(G.UPGRADES).join() === G.PICK.join() && Object.values(G.UPGRADES).every(t => t.map(u => u.tier).join() === '1,1,2,2,3' && t.every(u => u.name && u.info && Object.keys(u.up).length) && new Set(t.map(u => u.id)).size === 5), 'every type that may be picked has its own tree of five upgrades in three tiers; a type reaches level 1, 2 and 3 at 30, 90 and 180 experience');
    ok(has(T({ bulwark: ['plate'] }, {}), 'bulwark') === '' && has(T({ bulwark: ['plate', 'edge'] }, { bulwark: 30 }), 'bulwark') === 'plate' && has(T({ bulwark: ['march'] }, { bulwark: 999 }), 'bulwark') === '' && has(T({ bulwark: ['plate', 'march', 'wall'] }, { bulwark: 180 }), 'bulwark') === 'plate,march,wall' && has(T({ bulwark: ['plate', 'edge', 'march', 'mail'] }, { bulwark: 180 }), 'bulwark') === 'plate,edge,march' && has(T({ bulwark: ['plate', 'plate', 'pierce', 7], dragon: ['x'] }, { bulwark: 999 }), 'bulwark') === 'plate' && has(T({ slinger: ['draw', 'eye', 'pierce'] }, { slinger: 100 }), 'slinger') === 'draw,eye' && JSON.stringify(G.upsOf({ bulwark: ['plate', 'march'] })) === '{"bulwark":{"hp":8,"move":1}}' && JSON.stringify(T({ golem: ['mass'], skeleton: ['wired'], bard: ['cloak'], wolf: ['pelt'] }, { golem: 999, skeleton: 999, bard: 999, wolf: 30 })) === '{"wolf":["pelt"]}', 'a type holds no more upgrades than its level, none above its level\'s tier, a higher tier only on top of a lower one, and only its own; saved upgrades of a cut type are dropped');
    const on = (type, owner, x, y, facing = 'N', up) => { const u = { id: 0, type, owner, x, y, facing, hp: G.TYPES[type].hp, rec: 0, snare: 0 }; if (up) u.up = up; return u; }, game = (...units) => { const s = G.newGame('river'); s.units = units.map((u, i) => ({ ...u, id: i + 1 })); return s; }, hit = () => 0.999;
    { const s = G.newGame('board', { setup: true }); G.setTeam(s, 0, [{ type: 'bulwark', x: 4, y: 10 }, { type: 'slinger', x: 3, y: 10 }], G.upsOf({ bulwark: ['plate', 'march'] })); const k = s.units.find(u => u.owner === 0 && u.type === 'bulwark'), a = s.units.find(u => u.owner === 0 && u.type === 'slinger');
      ok(k.hp === 58 && G.stats(k).hp === 58 && G.stats(k).move === 4 && G.stats(k).pow === 18 && !a.up && G.stats(a) === G.TYPES.slinger && G.reachable(s, k).some(p => p.y === 6), 'an upgrade is numbers added to the unit\'s own: a knight with Tempered plate and Forced march has 58 health and moves four, and the archer beside it is as it was'); }
    { const mk = up => game(on('strider', 0, 3, 9, 'N'), on('bulwark', 1, 4, 9, 'N', up)), a = mk(null), b = mk({ flank: 0.5 }), half = () => 0.6;
      G.apply(a, 0, { type: 'act', unit: 1, x: 4, y: 9 }, half); G.apply(b, 0, { type: 'act', unit: 1, x: 4, y: 9 }, half);
      ok(G.sideOf(a.units[1], 3, 9) === 'side' && a.units[1].hp < 50 && b.units[1].hp === 50, 'Shield wall: the same blow from the side gets past a plain knight\'s shield and is blocked by the upgraded one'); }
    { const s = game(on('lancer', 0, 4, 9, 'N', { leech: 0.34, max: 1 }), on('mender', 1, 4, 6, 'S')), l = s.units[0]; l.hp = 20; const reach3 = G.targets(s, l).length === 1; G.apply(s, 0, { type: 'act', unit: 1, x: 4, y: 6 }, hit);
      ok(reach3 && s.units[1].hp === 24 - 20 && l.hp === 20 + Math.round(20 * 0.34), 'Long haft reaches a third tile, and Bloodlust gives back a third of the damage dealt as health (20 becomes ' + l.hp + ')'); }
    { const mk = up => { const s = game(on('strider', 0, 4, 9, 'N', up), on('mender', 1, 4, 8, 'N'), on('bulwark', 1, 0, 0, 'S')); s.units[1].hp = 5; G.apply(s, 0, { type: 'act', unit: 1, x: 4, y: 8 }, hit); G.apply(s, 0, { type: 'end' }); return s.units[0].rec; };
      ok(mk(null) === 1 && mk({ chain: 1 }) === 0, 'Slip away: a rogue that kills does not rest'); }
    { const mk = up => { const s = game(on('slinger', 0, 2, 7, 'N', up), on('mender', 1, 2, 2, 'S')); G.apply(s, 0, { type: 'act', unit: 1, x: 2, y: 2 }, hit); G.apply(s, 0, { type: 'end' }); return [s.units[1].hp, s.units[0].rec]; };
      ok(mk(null).join() === '16,2' && mk({ pierce: 1, rec: -1, pow: 3 }).join() === '5,1', 'Bodkin points ignore the forest\'s cover, Heavy draw adds three, Quick nock rests a turn less (8 damage becomes 19)'); }
    { const mk = up => { const s = game(on('ember', 0, 4, 9, 'N', up), on('mender', 1, 4, 7, 'S'), on('bulwark', 0, 4, 8, 'N')); G.apply(s, 0, { type: 'act', unit: 1, x: 4, y: 7 }, hit); return [s.units[1].hp, s.units[2].hp]; };
      ok(mk(null).join() === '10,39' && mk({ spare: 1 }).join() === '10,50', 'Tamed flame: the burst passes over its own side'); }
    { const s = game(on('mender', 0, 4, 9, 'N', { cleanse: 1 }), on('bulwark', 0, 4, 8, 'N'), on('mender', 0, 6, 9, 'N'), on('hexbinder', 1, 4, 5, 'S', { sting: 8, snare: 1 })); s.units[1].snare = 2; const plain = G.targets(s, s.units[2]).length; G.apply(s, 0, { type: 'act', unit: 1, x: 4, y: 8 }); G.apply(s, 0, { type: 'end' });
      const freed = s.units[1].snare === 0; G.apply(s, 1, { type: 'act', unit: 4, x: 4, y: 8 }, hit);
      ok(plain === 0 && freed && s.units[1].snare === 3 && s.units[1].hp === 50 - 6, 'Unbinding breaks a snare (a plain cleric has nothing to do for an unhurt ally); a Thorned snare with a Tighter knot holds three turns and does its damage through armour\'s share'); }
    { const s = G.newGame('board', { setup: true }); G.setTeam(s, 0, [{ type: 'strider', x: 4, y: 9 }, { type: 'mender', x: 0, y: 10 }]); G.setTeam(s, 1, [{ type: 'mender', x: 4, y: 0 }, { type: 'bulwark', x: 0, y: 0 }]); const none = Object.keys(G.earned(s, 0)).length; G.begin(s);
      const r = s.units.find(u => u.type === 'strider'), v = s.units.find(u => u.owner === 1 && u.type === 'mender'); Object.assign(v, { x: 4, y: 8, hp: 3 }); G.apply(s, 0, { type: 'act', unit: r.id, x: 4, y: 8 }, hit); const mid = Object.keys(G.earned(s, 0)).length; G.apply(s, 1, { type: 'surrender' });
      ok(none === 0 && mid === 0 && JSON.stringify(G.earned(s, 0)) === '{"strider":24,"mender":20}' && JSON.stringify(G.earned(s, 1)) === '{"mender":10,"bulwark":10}', 'a finished match earns each type fielded 10 experience, 10 more for the win and 4 for each kill it made: ' + JSON.stringify(G.earned(s, 0))); } }
  // ---- the later unit types: each one's rule in the rules, and what the rules refuse ----
  { const on = (type, owner, x, y, facing = 'N', more) => ({ id: 0, type, owner, x, y, facing, hp: G.TYPES[type].hp, rec: 0, snare: 0, ...more }), game = (...units) => { const s = G.newGame('board'); s.units = units.map((u, i) => ({ ...u, id: i + 1 })); return s; }, hit = () => 0.999, blocked = () => 0;
    const act = (s, p, unit, x, y, rand = hit) => G.apply(s, p, { type: 'act', unit, x, y }, rand), end = (s, n = 1) => { let r; for (let i = 0; i < n; i++) { s.passes = 0; r = G.apply(s, s.turn, { type: 'end' }); } return r; }, kinds = r => r.events.map(e => e.t).join(), can = (s, u, x, y) => G.targets(s, u).some(p => p.x === x && p.y === y), to = (s, u, x, y) => G.reachable(s, u).some(p => p.x === x && p.y === y);
    { const s = game(on('alchemist', 0, 4, 9), on('bulwark', 1, 4, 6, 'S'), on('mender', 1, 0, 0), on('bulwark', 0, 3, 9)); const r = act(s, 0, 1, 4, 6), g1 = G.ground(s, 4, 6).burn, cost = G.stepCost(s, 4, 7, 4, 6); end(s); const r2 = end(s); const burnt = s.units[1].hp; end(s, 2); const twice = s.units[1].hp, gone = !G.poolAt(s, 4, 6);
      const e = game(on('alchemist', 0, 4, 9), on('bulwark', 1, 0, 0)), re = act(e, 0, 1, 4, 6), t = game(on('alchemist', 0, 4, 9, 'N', { up: { tar: 1 } }), on('bulwark', 1, 0, 0)); act(t, 0, 1, 4, 6);
      ok(kinds(r) === 'act,hit,pool' && g1 === 6 && cost === 1 && burnt === 50 - 8 - 6 && /hit/.test(kinds(r2)) && twice === 50 - 8 - 12 && gone && re.ok && G.poolAt(e, 4, 6).k === 'fire' && !can(e, e.units[0], 4, 8) && G.ground(t, 4, 6).cost === 2 && G.ground(t, 4, 6).slip === 0.5, 'the Alchemist\'s flask burns whoever stands on its tile and leaves the ground burning for four turns: 6 to whoever stands there when their side\'s turn ends, then it is out; it may be thrown at empty ground 2 to 4 away; Burning pitch also slows and spoils footing'); }
    { const s = game(on('necro', 0, 4, 9), on('strider', 0, 4, 6), on('mender', 1, 4, 5, 'N', { hp: 2 }), on('bulwark', 1, 0, 0)); const before = G.targets(s, s.units[0]).length; act(s, 0, 2, 4, 5); end(s, 2); const far = G.targets(s, s.units[0]).length; s.units[0].y = 7; const offGrave = act(s, 0, 1, 4, 6), r = act(s, 0, 1, 4, 5), sk = s.units.find(u => u.type === 'skeleton'), raised = !!sk && sk.owner === 0 && sk.sum === 'necro' && sk.hp === 14;
      const again = G.targets(s, s.units[0]).length; sk.hp = 1; end(s); Object.assign(s.units.find(u => u.type === 'bulwark'), { x: 4, y: 4 }); act(s, 1, s.units.find(u => u.type === 'bulwark').id, 4, 5);
      ok(before === 0 && far === 0 && !offGrave.ok && r.ok && raised && again === 0 && !s.units.some(u => u.type === 'skeleton') && !(s.graves || []).some(g => g.x === 4 && g.y === 5) && G.TYPES.necro.cap === 3, 'the Necromancer raises a Skeleton for his side only on an empty tile where a piece fell, within three tiles; a grave is used once, and a raised skeleton that falls leaves none'); }
    { const three = game(on('wolf', 0, 4, 7), on('wolf', 0, 3, 6), on('wolf', 0, 5, 6), on('mender', 1, 4, 6, 'S'), on('bulwark', 0, 4, 5)), one = game(on('wolf', 0, 4, 7), on('mender', 1, 4, 6, 'S'));
      ok(G.damage(one, one.units[0], one.units[1]) === 10 && G.damage(three, three.units[0], three.units[3]) === 16 && G.TYPES.wolf.move === 6 && G.TYPES.wolf.hp <= 20, 'the Wolf is fast and weak, and hits 30% harder for each other wolf of its side beside the target (10 becomes 16 with two; a knight beside it adds nothing)'); }
    { const s = game(on('ogre', 0, 4, 7), on('mender', 1, 4, 6, 'N'), on('mender', 1, 0, 0)); s.units[0].hp = 50; const r = act(s, 0, 1, 4, 6); end(s);
      const wall = game(on('ogre', 0, 4, 7), on('bulwark', 1, 4, 6, 'N'), on('bulwark', 1, 4, 5, 'N')); const rw = act(wall, 0, 1, 4, 6), edge = game(on('ogre', 0, 4, 1), on('bulwark', 1, 4, 0, 'N'), on('mender', 1, 8, 8)), re = act(edge, 0, 1, 4, 0);
      ok(kinds(r) === 'act,hit,push' && s.units[1].y === 5 && s.units[0].hp === 54 && !/push/.test(kinds(rw)) && wall.units[1].y === 6 && !/push/.test(kinds(re)) && G.TYPES.ogre.move === 2, 'the Ogre is slow, mends 4 each of its turns, and knocks what it hits back a tile, unless a piece or the board\'s edge is behind it'); }
    { const s = game(on('slinger', 0, 4, 9), on('skeleton', 1, 4, 5, 'S'), on('strider', 0, 4, 6));
      ok(G.damage(s, s.units[0], s.units[1]) === 8 && G.damage(s, s.units[2], s.units[1]) === 18 && !G.TYPES.skeleton.group && !G.TYPES.skeleton.limit, 'the Skeleton is never picked, only raised; arrows do half to it (16 becomes 8), a blade its whole'); }
    { const s = game(on('ghost', 0, 4, 8), on('bulwark', 1, 4, 7, 'S'), on('bulwark', 1, 4, 6, 'S'), on('slinger', 1, 4, 3, 'S'), on('ember', 1, 6, 8, 'W'), on('ghost', 1, 5, 8, 'W')); const g = s.units[0];
      const through = to(s, g, 4, 5), bladeless = !can(s, s.units[1], 4, 8) && !can(s, s.units[3], 4, 8), spell = can(s, s.units[4], 4, 8), dmg = G.damage(s, s.units[4], g), touch = G.damage(s, g, s.units[1]), ghosts = can(s, s.units[5], 4, 8); s.turn = 1; const r = G.apply(s, 1, { type: 'act', unit: 2, x: 4, y: 8 });
      const burn = game(on('ghost', 0, 4, 8), on('mender', 1, 0, 0)); burn.pools = [{ x: 4, y: 8, k: 'fire', n: 3 }]; end(burn); const axe = game(on('lancer', 0, 4, 9), on('bulwark', 1, 4, 8, 'S'), on('ghost', 1, 4, 7, 'S')), ra = act(axe, 0, 1, 4, 8);
      ok(through && bladeless && spell && dmg === 14 && touch === 8 && ghosts && /immune/.test(kinds(ra)) && axe.units[2].hp === 18 && !r.ok && /invalid target/.test(r.error) && burn.units[0].hp === 12, 'the Ghost passes through pieces; a blade or an arrow cannot be aimed at it (the rules refuse it), a spell and burning ground hurt it; its touch counts as a spell: armour still turns part of it, another ghost feels it; an axe swung through it does nothing'); }
    { const s = game(on('whelp', 0, 4, 8), on('bulwark', 1, 4, 7, 'S'), on('mender', 1, 3, 6, 'S'), on('strider', 0, 4, 6), on('mender', 1, 8, 8)); const fly = to(s, s.units[0], 4, 5) && !to(s, s.units[0], 4, 6), aim = JSON.stringify(G.targets(s, s.units[0])), side = act(s, 0, 1, 5, 8), r = act(s, 0, 1, 4, 7, blocked);
      const water = G.newGame('board'); water.units = [{ ...on('whelp', 0, 4, 8), id: 1 }];
      ok(fly && aim === '[{"x":4,"y":7}]' && !side.ok && r.events.filter(e => e.t === 'hit').map(e => e.id + ':' + e.dmg).join() === '2:12,4:16,3:16' && G.TYPES.whelp.fly === 1 && G.TYPES.whelp.cost === 13, 'the Dragon Whelp flies over pieces; its fire covers the tile ahead and the three beyond, cannot be blocked, burns its own side too, and may only be breathed where a foe it can hurt stands; it costs 13 of the 40 points'); }
    { const s = game(on('captain', 0, 4, 8), on('strider', 0, 4, 7), on('bulwark', 0, 0, 10), on('lancer', 1, 4, 6, 'S'), on('mender', 1, 0, 0)); const near = G.damage(s, s.units[1], s.units[3]), far = G.damage(s, { ...s.units[1], x: 8, y: 6 }, s.units[3]), blk = G.eff(s, s.units[1]).block, own = G.eff(s, s.units[0]).pow;
      s.turn = 1; s.units[0].hp = 3; s.units[0].facing = 'S'; Object.assign(s.units[3], { x: 4, y: 9, facing: 'N' }); const r = act(s, 1, 4, 4, 8), r2 = G.apply(s, 1, { type: 'end' }), again = s.turn, r3 = G.apply(s, 0, { type: 'end' }), r4 = G.apply(s, 1, { type: 'end' });
      ok(near === Math.round(18 * 1.2 * 0.9) && far === Math.round(18 * 0.9) && blk === 70 && own === 18 && /rout/.test(kinds(r)) && s.winner === null && kinds(r2) === 'turn,skip,turn' && again === 1 && !r3.ok && r4.ok && s.turn === 0 && s.units.filter(u => u.owner === 0).length === 2, 'allies within two tiles of the Captain hit 20% harder and block 10 better (not the Captain itself); when it falls its side loses its next turn and no more: the match goes on, and is won only as before'); }
    { const s = game(on('mender', 0, 4, 8), on('mender', 1, 4, 2)); let n = 0; while (s.winner === null && n < 300) { const u = s.units.find(q => q.owner === s.turn), mv = G.reachable(s, u); G.apply(s, s.turn, { type: 'move', unit: u.id, ...mv[0] }); G.apply(s, s.turn, { type: 'end' }); n++; }
      ok(s.winner === -1 && n === G.QUIET, 'two sides that cannot hurt each other (a cleric each) draw after ' + G.QUIET + ' turns without a wound'); }
    { let bad = 0, games = 0; const types = Object.keys(G.TYPES);   // random games with every type on the board: every move and target the rules offer is taken
      for (let g = 0; g < 60; g++) { const s = G.newGame('board'), pick = () => types[Math.floor(Math.random() * types.length)]; s.units = [];
        for (const o of [0, 1]) for (let i = 0; i < 12; i++) s.units.push({ id: o * 100 + i + 1, type: g < 2 ? types[(i + o * 12) % types.length] : pick(), owner: o, x: i % 9, y: o ? Math.floor(i / 9) : 10 - Math.floor(i / 9), facing: o ? 'S' : 'N', rec: 0, snare: 0 }); for (const u of s.units) u.hp = G.TYPES[u.type].hp;
        for (let i = 0; i < 700 && s.winner === null; i++) { const p = s.turn, mine = s.units.filter(u => G.canUse(s, p, u)), u = mine[Math.floor(Math.random() * mine.length)];
          if (u) { const mv = G.reachable(s, u); if (mv.length && Math.random() < 0.8 && !G.apply(s, p, { type: 'move', unit: u.id, ...mv[Math.floor(Math.random() * mv.length)] }).ok) bad++;
            const tg = G.unitById(s, u.id) ? G.targets(s, u) : []; if (tg.length && s.winner === null && !G.apply(s, p, { type: 'act', unit: u.id, ...tg[Math.floor(Math.random() * tg.length)] }).ok) bad++; }
          if (s.winner === null && !G.apply(s, p, { type: 'end' }).ok) bad++;
          if (new Set(s.units.map(q => q.x + ',' + q.y)).size !== s.units.length || s.units.some(q => q.hp <= 0 || !G.inBounds(s, q.x, q.y))) bad++; }
        games++; }
      ok(bad === 0, games + ' random games with every type (the fourteen and the Skeleton): every move and target the rules offer is taken, no two pieces ever share a tile, nothing dead stays on the board'); } }
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
    { let bad = 0, turns = 0;   // on each of the three worlds: six turns planned and played, every action accepted, each turn ended
      for (const id of ['deep', 'rime', 'scar']) { const s = G.newGame(id); for (let t = 0; t < 6 && s.winner === null; t++, turns++) { const p = s.turn; for (const a of AI.plan(s, p, t % 2 ? 'hard' : 'easy')) if (!G.apply(s, p, a).ok) bad++; if (s.turn === p && s.winner === null) bad++; if (s.units.some(u => G.ground(s, u.x, u.y).solid)) bad++; } }
      ok(bad === 0 && turns === 18, 'the computer finishes its turns on Glimmerdeep, the Rimewater and Cinderscar: ' + turns + ' turns, nothing refused, nobody in lava, water or crystal'); }
    { // teams of its own choosing with the later types, from both seats: every action it sends is taken by the rules, and every type's power is used
      const used = {}, res = { won: 0, lost: 0, drawn: 0, open: 0 }; let bad = 0, wrong = 0, n = 0, turns = 0;
      const game2 = (who, all) => { const s = G.newGame('board', { setup: true }); for (const o of [0, 1]) { const t = all ? all[o] : AI.muster(s, o); if (!all && (G.checkTeam(s, o, t) !== null || G.teamCost(t) > G.BUDGET || t.some(m => !G.PICK.includes(m.type)))) wrong++; G.placeTeam(s, o, t); } G.begin(s); let k = 0;
        while (s.winner === null && k < 900) { const p = s.turn, acts = who[p] === 'random' ? rnd(s, p) : AI.plan(s, p, who[p]);
          for (const a of acts) { if (s.winner !== null) break;
            if (a.type === 'hit') { const u = G.unitById(s, a.unit), tg = u ? G.targets(s, u) : []; if (tg.length) G.apply(s, p, { type: 'act', unit: u.id, ...tg[Math.floor(Math.random() * tg.length)] }); continue; }
            const u = a.unit && G.unitById(s, a.unit), r = G.apply(s, p, a); if (!r.ok) { if (who[p] !== 'random') bad++; } else if (who[p] !== 'random') for (const e of r.events) if (e.t === 'act') used[u.type + ' ' + e.kind] = 1; }
          if (s.turn === p && s.winner === null) G.apply(s, p, { type: 'end' }); k++; }
        turns += k; n++; return s.winner; };
      for (let i = 0; i < 24; i++) { const seat = i % 2, w = game2(seat ? ['random', 'hard'] : ['hard', 'random']); if (w === seat) res.won++; else if (w === 1 - seat) res.lost++; else if (w === -1) res.drawn++; else res.open++; }
      for (let i = 0; i < 12; i++) game2(i % 2 ? ['easy', 'hard'] : ['hard', 'easy']);
      for (let i = 0; i < 12; i++) { game2(['hard', 'hard'], [0, 1].map(o => Object.keys(G.TYPES).sort(() => Math.random() - 0.5).slice(0, 12).map((type, j) => ({ type, x: j % 9, y: o ? Math.floor(j / 9) : 10 - Math.floor(j / 9) })))); }   // and twelve types a side, the Skeleton among them, against itself
      const want = Object.entries(G.TYPES).map(([k, t]) => k + ' ' + t.kind), unused = want.filter(k => !used[k]);
      ok(bad === 0 && wrong === 0 && res.lost <= 1 && res.won >= 18 && unused.length === 0, 'the computer picks its own team from the fourteen types (always legal, within 40 points, never a Skeleton) and plays it from either seat: of 24 matches against a random mover it won ' + res.won + ', lost ' + res.lost + ', drew ' + res.drawn + '; no action of its own refused in ' + n + ' matches (' + Math.round(turns / n) + ' turns each), and it used every type\'s power' + (unused.length ? ', except: ' + unused.join(', ') : ''));
      const B = (...units) => { const s = G.newGame('board'); s.units = units.map((u, i) => ({ id: i + 1, facing: u.owner ? 'S' : 'N', hp: G.TYPES[u.type].hp, rec: 0, snare: 0, ...u })); s.turn = 1; return s; }, half = () => 0.5;
      { const n2 = B({ type: 'necro', owner: 1, x: 4, y: 1 }, { type: 'bulwark', owner: 0, x: 4, y: 8 }); n2.graves = [{ x: 4, y: 3 }]; const raise = AI.plan(n2, 1, 'hard', half).find(q => q.type === 'act');
        ok(raise && raise.x === 4 && raise.y === 3, 'it raises a skeleton where one fell'); } }
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
      if (!n.needs.every(q => ids.includes(q)) || !n.text || !n.won || !AI.LEVELS[n.level] || n.map !== 'board') bad.push(n.id + ' node'); }
    const order = []; let grew = true; while (grew) { grew = false; for (const n of C.nodes) if (!order.includes(n.id) && CAMP.isOpen(n.id, order)) { order.push(n.id); grew = true; } }
    ok(bad.length === 0 && C.nodes.length >= 6 && C.nodes.filter(n => n.optional).length >= 2 && C.nodes.filter(n => n.last).length === 1 && new Set(ids).size === ids.length && !C.map, 'the campaign is whole: ' + C.nodes.length + ' battles (' + C.nodes.filter(n => n.optional).length + ' to the side, one last), each on the plain board with its enemy in its own rows' + (bad.length ? ': ' + bad.join('; ') : ''));
    ok(order.length === ids.length && CAMP.isOpen(ids[0], []) && !CAMP.isOpen(C.nodes.find(n => n.last).id, []) && CAMP.budgetFor([]) === C.start && CAMP.budgetFor(ids) === C.start + C.nodes.reduce((a, n) => a + n.gain, 0) && CAMP.budgetFor(['toll', 'toll', 'nope', 7]) === C.start + 3 && CAMP.finished(ids) && !CAMP.finished(['toll']), 'its battles open in order from the first to the last, and each win adds to the points you may field (' + C.start + ' to ' + CAMP.budgetFor(ids) + ')'); }
  { let bad = 0;
    for (let g = 0; g < 200; g++) { const s = G.newGame();
      for (let i = 0; i < 600 && s.winner === null; i++) { const p = s.turn, mine = s.units.filter(u => G.canUse(s, p, u)), u = mine[Math.floor(Math.random() * mine.length)];
        if (u) { const mv = G.reachable(s, u); if (mv.length && Math.random() < 0.8 && !G.apply(s, p, { type: 'move', unit: u.id, ...mv[Math.floor(Math.random() * mv.length)] }).ok) bad++;
          const tg = G.targets(s, u); if (tg.length && !G.apply(s, p, { type: 'act', unit: u.id, ...tg[Math.floor(Math.random() * tg.length)] }).ok) bad++; }
        if (s.winner === null && !G.apply(s, p, { type: 'end', unit: u && u.id, facing: u ? 'NESW'[Math.floor(Math.random() * 4)] : undefined }).ok) bad++; }
      if (new Set(s.units.map(u => u.x + ',' + u.y)).size !== s.units.length) bad++; }
    ok(bad === 0, 'two hundred random games: every move the rules offer is taken, no two pieces share a tile'); }
  for (const k of Object.keys(LV)) delete G.MAPS[k];

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
    { // the room judges the later types by the same rules: each illegal use is refused, a legal one taken
      const h2 = { room: null, save() {} }, R = new CHESS.Match(h2), p = sock(), q = sock(), tell = (w, m) => R.message(w, 'UNIT', JSON.stringify(m)), err = w => (last(w, 'error') || {}).msg || ''; R.open(p); R.open(q);
      await tell(p, { t: 'create', token: 'p' }); await tell(q, { t: 'join', code: 'UNIT', token: 'q' });
      await tell(p, { t: 'team', units: [{ type: 'captain', x: 3, y: 10 }, { type: 'captain', x: 4, y: 10 }] }); const twoCaptains = err(p); await tell(p, { t: 'team', units: [{ type: 'whelp', x: 3, y: 10 }, { type: 'whelp', x: 4, y: 10 }] }); const twoWhelps = err(p);
      await tell(p, { t: 'team', units: [{ type: 'whelp', x: 0, y: 10 }, { type: 'ogre', x: 1, y: 10 }, { type: 'ogre', x: 2, y: 10 }, { type: 'captain', x: 3, y: 10 }, { type: 'bulwark', x: 4, y: 10 }, { type: 'bulwark', x: 5, y: 10 }] }); const over = err(p); await tell(p, { t: 'team', units: [{ type: 'golem', x: 3, y: 10 }] }); const cut = err(p); await tell(p, { t: 'team', units: [{ type: 'bulwark', x: 3, y: 10 }, { type: 'skeleton', x: 4, y: 10 }] }); const bones = err(p);
      const mine = ['slinger', 'necro', 'alchemist', 'whelp', 'ember'].map((type, i) => ({ type, x: i + 1, y: 8 })); await tell(p, { t: 'team', units: mine }); const taken = h2.room.state.units.filter(u => u.owner === 0).length === 5;
      await tell(q, { t: 'team', units: [{ type: 'ghost', x: 2, y: 2 }, { type: 'bulwark', x: 3, y: 2 }, { type: 'captain', x: 5, y: 2 }] }); await tell(p, { t: 'ready', on: true }); await tell(q, { t: 'ready', on: true });
      const S = h2.room.state, id = (o, t) => S.units.find(u => u.owner === o && u.type === t).id, at = (o, t) => S.units.find(u => u.owner === o && u.type === t), tryAct = async (w, o, t, x, y) => { const n = w.got.filter(m => m.t === 'error').length; await tell(w, { t: 'act', action: { type: 'act', unit: id(o, t), x, y } }); return w.got.filter(m => m.t === 'error').length > n ? err(w) : 'ok'; };
      const refused = [];
      Object.assign(at(1, 'ghost'), { y: 5 }); Object.assign(at(1, 'bulwark'), { y: 5 });
      refused.push(await tryAct(p, 0, 'slinger', 2, 5));     // an arrow at a ghost
      refused.push(await tryAct(p, 0, 'necro', 3, 7));       // a skeleton where nothing fell
      refused.push(await tryAct(p, 0, 'alchemist', 3, 7));   // a flask too near
      refused.push(await tryAct(p, 0, 'whelp', 4, 7));       // fire at nobody
      refused.push(await tryAct(p, 0, 'ember', 5, 6));       // a fire burst at empty ground
      const shot = await tryAct(p, 0, 'slinger', 3, 5);
      clearTimeout(R.timer);
      ok(/At most 1 of the Captain/.test(twoCaptains) && /At most 1 of the Dragon/.test(twoWhelps) && /budget/.test(over) && /Unknown/.test(cut) && /Unknown/.test(bones) && taken && refused.length === 5 && refused.every(m => /invalid target/.test(m)) && shot === 'ok' && h2.room.state.winner === null, 'the room refuses what the rules do: a second Captain or Whelp, a team over the budget, a cut type, a picked Skeleton; an arrow at a ghost, a skeleton where nothing fell, a flask too near, fire at nobody, a fire burst at empty ground; and takes the legal shot'); }
    ok(CHESS.CODE.test(CHESS.code()) && !CHESS.CODE.test('abcd') && !CHESS.CODE.test('ABCDE'), 'a room\'s code is four capital letters');
    { const mem = { v: null }, st = { get: async () => mem.v, put: async v => { mem.v = v; } }, team = { name: 'Two <mages>!', units: [{ type: 'ember', dx: -1, r: 0 }, { type: 'ember', dx: 1, r: 0 }, { type: 'dragon', dx: 0, r: 0 }, { type: 'golem', dx: 2, r: 0 }, { type: 'skeleton', dx: 3, r: 0 }, { type: 'mender', dx: 99, r: 0 }] };
      const kept = await CHESS.save(st, { teams: [team, { name: 'All cut', units: [{ type: 'bard', dx: 0, r: 0 }, { type: 'storm', dx: 1, r: 0 }] }, { name: '', units: [] }, 7], xp: { bulwark: 999 } }), back = await CHESS.load(st);
      const old = { v: { xp: { golem: 200, skeleton: 200, wolf: 40 }, ups: { golem: ['mass'], skeleton: ['wired'], wolf: ['pelt'] }, teams: [{ name: 'Old', units: [{ type: 'pike', dx: 0, r: 0 }, { type: 'wolf', dx: 1, r: 0 }] }], company: [{ type: 'assassin', dx: 0, r: 0 }, { type: 'ogre', dx: 1, r: 0 }] } }, was = (await CHESS.load({ get: async () => old.v })).rec;
      ok(JSON.stringify(was.xp) === '{"wolf":40}' && JSON.stringify(was.ups) === '{"wolf":["pelt"]}' && was.teams.length === 1 && was.teams[0].units.map(u => u.type).join() === 'wolf' && was.company.map(u => u.type).join() === 'ogre', 'a record from before the cut loads without error: its cut types and picked Skeletons are dropped from teams, company, experience and upgrades');
      ok(kept.ok && back.rec.teams.length === 1 && back.rec.teams[0].name === 'Two mages' && back.rec.teams[0].units.length === 2 && !('xp' in mem.v) && (await CHESS.load({ get: async () => null })).rec.teams.length === 0, 'a login\'s saved teams are cut to size before they are kept (a team of only cut types is not kept): ' + JSON.stringify(back.rec.teams[0])); }
    { const mem = {}, h = { room: null, save() {}, store: pid => ({ get: async () => mem[pid], put: async v => { mem[pid] = v; } }) }, M2 = new CHESS.Match(h), w = sock(), w2 = sock(), tell = (x, m) => M2.message(x, 'SOLO', JSON.stringify(m)); M2.open(w); M2.open(w2);
      await tell(w, { t: 'create', token: 'me', solo: 'hard', map: 'river' }); const s0 = last(w, 'state'); await tell(w2, { t: 'join', code: 'SOLO', token: 'other' });
      ok(last(w, 'joined').you === 0 && last(w2, 'joined').you === -1 && s0.solo === 'hard' && s0.state.phase === 'setup' && s0.ready[1] && !s0.ready[0] && s0.state.units.every(u => u.owner === 0) && h.room.state.units.filter(u => u.owner === 1).length >= 3 && G.checkTeam(h.room.state, 1, h.room.state.units.filter(u => u.owner === 1).map(u => ({ type: u.type, x: u.x, y: u.y }))) === null, 'a room against the computer: you have seat one, it has the other with a legal team of its own choosing and is ready, a second person can only watch');
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
    { const mem = { ann: { xp: { bulwark: 95, slinger: 30 }, ups: { bulwark: ['plate', 'march', 'wall'], slinger: ['draw'], ember: ['heat'] } } }, store = pid => ({ get: async () => mem[pid], put: async v => { mem[pid] = v; } });
      const room = async (first, pa, pb) => { const h = { room: null, save() {}, store }, m = new CHESS.Match(h), a = sock(), b = sock(); m.open(a, pa); m.open(b, pb); await m.message(a, 'OPEN', JSON.stringify({ t: 'create', token: 'ta', ...first })); if (pb !== undefined) await m.message(b, 'OPEN', JSON.stringify({ t: 'join', code: 'OPEN', token: 'tb' })); clearTimeout(m.timer); clearTimeout(m.aiTimer); return { h, m, a, b }; };
      const kn = r => r.h.room.state.units.find(u => u.owner === 0 && u.type === 'bulwark'), fair = await room({}, 'ann', 'bob'), open = await room({ open: true }, 'ann', 'bob');
      ok(!kn(fair).up && kn(fair).hp === 50 && !last(fair.a, 'state').open && last(open.a, 'state').open && JSON.stringify(kn(open).up) === '{"hp":8,"move":1}' && kn(open).hp === 58 && !open.h.room.state.units.some(u => u.owner === 1 && u.up) && (await CHESS.load(store('ann'))).rec.ups.bulwark.join() === 'plate,march', 'a fair duel (the default) ignores upgrades; in an open one the room gives each login the upgrades its own record allows (level 2: two of the three asked for), and nothing to a side that has none');
      await open.m.message(open.a, 'OPEN', JSON.stringify({ t: 'team', units: [{ type: 'bulwark', x: 4, y: 10 }, { type: 'slinger', x: 3, y: 10 }] })); const st = open.h.room.state;
      ok(st.units.filter(u => u.owner === 0).length === 2 && kn(open).hp === 58 && st.units.find(u => u.owner === 0 && u.type === 'slinger').up.pow === 3, 'a team set out in an open match carries them too');
      for (const w of [open.a, open.b]) await open.m.message(w, 'OPEN', JSON.stringify({ t: 'ready', on: true })); await open.m.message(open.b, 'OPEN', JSON.stringify({ t: 'act', action: { type: 'surrender' } })); clearTimeout(open.m.timer); await nap(30);
      ok(st.winner === 0 && mem.ann.xp.bulwark === 95 + 20 && mem.ann.xp.slinger === 30 + 20 && mem.bob.xp.bulwark === 10 && Object.keys(mem.bob.xp).length === 7, 'when the match ends the room writes what each login\'s unit types earned to its record: ' + JSON.stringify(mem.ann.xp));
      const own = await room({ solo: 'easy', prog: { xp: { bulwark: 30, lancer: 9999 }, ups: { bulwark: ['plate', 'edge'], lancer: ['hide', 'haft', 'blood'], slinger: ['draw'] } } }, ''), su = own.h.room.state.units;
      ok(JSON.stringify(su.find(u => u.owner === 0 && u.type === 'bulwark').up) === '{"hp":8}' && Object.keys(su.find(u => u.owner === 0 && u.type === 'lancer').up).join() === 'hp,max,leech' && !su.find(u => u.owner === 0 && u.type === 'slinger').up && !su.some(u => u.owner === 1 && u.up) && last(own.a, 'state').open, 'against the computer anyone not signed in brings the upgrades their own browser holds, cut to what its experience allows');
      await CHESS.save(store('cy'), { ups: { bulwark: ['plate'] }, xp: { bulwark: 999 } }); ok(!(await CHESS.load(store('cy'))).rec.ups.bulwark && !(await CHESS.load(store('cy'))).rec.xp.bulwark, 'the page cannot write experience, and upgrades it saves are cut to the experience the website holds'); }
    const mk = map => { const h = { room: null, save() {} }, m = new CHESS.Match(h), w = sock(); m.open(w); m.message(w, 'WXYZ', JSON.stringify({ t: 'create', token: 't', map })); clearTimeout(m.timer); return h.room.state; };
    ok(mk('river').map === 'board' && mk('river').cols === 9 && mk('nowhere').map === 'board' && mk(7).map === 'board' && mk(undefined).map === 'board', 'the host names the map when the room is made; one the server does not know is the plain board'); }

  // ---- the website's worker and its Chess Durable Object ----
  const CFG = path.join(ROOT, '.site-wrangler.jsonc'); fs.writeFileSync(CFG, fs.readFileSync(path.join(ROOT, 'wrangler.jsonc'), 'utf8').replace(/^\s*"ai"\s*:\s*\{[^}]*\},?\s*$/m, '')); process.on('exit', () => { try { fs.unlinkSync(CFG); } catch (e) {} });
  const w = spawn('npx', ['wrangler', 'dev', '-c', CFG, '--port', String(PORT), '--ip', '127.0.0.1', '--var', 'DEV_AUTH:1', '--var', 'CHESS_TURN_SECONDS:900', '--show-interactive-dev-session=false', '--persist-to', fs.mkdtempSync(path.join(os.tmpdir(), 'chess-'))], { cwd: ROOT, stdio: ['ignore', 'pipe', 'pipe'], detached: true, env: { ...process.env, WRANGLER_SEND_METRICS: 'false' } });
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
    const sfx = eval(/const FILES = (\[[\s\S]*?\]);/.exec(src('audio.js'))[1]), glb = [...Object.keys(G.TYPES), 'anim'], png = fs.readdirSync(path.join(ROOT, 'data/chess/fx')).map(f => f.replace('.png', ''));
    const land = ['units/atlas.jpg', ...['dungeon.glb', 'atlas.jpg', 'ivy.png', 'flag.jpg', 'floor.jpg', 'lava.jpg'].map(f => 'dungeon/' + f)];
    const urls = [...sfx.map(n => 'sfx/' + n + '.mp3'), ...glb.map(n => 'units/' + n + '.glb'), ...png.map(n => 'fx/' + n + '.png'), ...land], bad = [], types = {};
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
    ok(/not open/.test(b.err[0] || '') && c.state && c.state.map === 'board' && c.state.budget === 28 && c.got.some(m => m.camp === 'toll'), 'and a battle of the campaign there: a closed one is refused, the first is set on its map with the campaign\'s points');
    for (const o of [a, b, c]) o.s.close(); }
  { const a = await seat('create=1', { t: 'create', token: 'map-a', map: 'river' }); await wait(() => a.state);
    ok(a.state && a.state.map === 'board' && a.state.cols === 9 && a.state.rows === 11, 'a match asked for on a battlefield that is set aside is made on the plain board, in the Durable Object too');
    a.s.close(); }

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
  const soon = async (pg, fn, arg, ms = 12000) => { const t = Date.now(); while (Date.now() - t < ms) { if (await pg.evaluate(fn, arg).catch(() => false)) return true; await nap(250); } return false; };   // asked of the page directly, not on its next frame: a software-drawn frame can outlast the wait
  const shot = async (pg, name) => { if (OUT) { await on(pg); await pg.waitForTimeout(1500); await pg.screenshot({ path: path.join(OUT, name + '.png'), timeout: 240000 }).catch(e => ok(false, 'the picture ' + name + ': ' + e.message.split('\n')[0])); } };
  const people = pg => until(pg, () => { const T = window.__t; return T.unitsReady && Object.values(T.crowd.types).reduce((n, m) => n + m.count, 0) + [...T.unitMeshes.values()].filter(g => g.userData.live).length >= 20; }, null, 180000);
  const A = await open(), B = await open(null, b2); await on(A);
  await (await on(A)).goto(BASE + '/chess', { waitUntil: 'commit', timeout: 120000 }); ok(await until(A, () => !!window.__t && !!document.getElementById('createBtn')), 'the page starts on its menu');
  await shot(A, 'menu');
  await (await on(A)).evaluate(() => document.getElementById('createBtn').click()); ok(await until(A, () => window.__t.code && window.__t.me === 0), 'CREATE A MATCH opens a room and seats you');
  const code = await (await on(A)).evaluate(() => window.__t.code);
  ok(/^[A-Z]{4}$/.test(code || '') && (await (await on(A)).evaluate(() => location.pathname + location.search)) === '/chess?room=' + code && /Choose your team - 40\/40 points/.test(await (await on(A)).textContent('#status')), 'its link is /chess?room=' + code + ', and it starts by choosing a team');
  // the team picker: remove a rogue, place a third archer, a tile off your rows is refused, save the team, go back to the standing one, load the saved one
  { const P = await on(A), mine = async () => (await st(A)).units, n = async t => (await mine()).filter(u => u.type === t).length, txt = id => P.textContent('#' + id);
    ok(await P.isVisible('#setup') && (await mine()).length === 10 && (await mine()).every(u => u.owner === 0) && /40 \/ 40 points/.test(await txt('budget')) && (await P.locator('#roster button').count()) === 14 && (await P.locator('#roster h3').count()) === 4, 'the picker shows the budget, the fourteen kinds in their four groups with their cost and limit, and only your own side on the table');
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
  { let got = false, why = '';   // a real click; if the page was busy it is tried once more, and a miss says what the page held
    for (let i = 0; i < 2 && !got; i++) { const hit = await (await on(A)).evaluate(() => { const T = window.__t, id = T.state.units.find(u => u.owner === 0 && u.type === 'bulwark').id; let g = null; T.scene.traverse(o => { if (o.userData && o.userData.pick && o.userData.pick.kind === 'unit' && o.userData.pick.id === id) g = o; });
        const p = g.getWorldPosition(T.V(0, 0, 0)); p.y += 0.06; p.project(T.camera); return { id, x: (p.x + 1) / 2 * innerWidth, y: (1 - p.y) / 2 * innerHeight }; });
      await (await on(A)).mouse.click(hit.x, hit.y); got = await soon(A, id => window.__t.selected === id, hit.id);
      if (!got) why += ' | ' + JSON.stringify(await A.evaluate(h => { const T = window.__t, el = document.elementFromPoint(h.x, h.y); return { want: h.id, at: [Math.round(h.x), Math.round(h.y)], sel: T.selected, me: T.me, turn: T.state.turn, phase: T.state.phase, el: el && (el.id || el.tagName), info: document.getElementById('info').textContent.slice(0, 60), status: document.getElementById('status').textContent }; }, hit)); }
    ok(got, 'a real click on a knight\'s base picks it' + why); await tap(A, null); }

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

  // ---- only the board is offered: the menu, a link to a level that is set aside, the board as one mesh ----
  { const n0 = errs.length, L = await open(), asked = []; cur = null; L.on('request', r => asked.push(r.url()));
    await L.goto(BASE + '/chess', { waitUntil: 'commit', timeout: 120000 }); await until(L, () => !!window.__t && !!document.getElementById('createBtn'));
    ok((await L.locator('#mapSel option').count()) === 1 && !(await L.isVisible('#mapSel')) && (await fetch(BASE + '/chess-assets/land/tex/grass_d.jpg')).status === 404 && (await fetch(BASE + '/chess-assets/characters/animations.glb')).status === 404, 'the menu offers one battlefield, the board: nothing to choose, and the levels\' files and the unthinned people are not on the website');
    await L.goto(BASE + '/chess?show=river', { waitUntil: 'commit', timeout: 120000 }); await until(L, () => !!window.__t && !!window.__t.field && window.__t.unitsReady, null, 180000);
    const f = await L.evaluate(() => { const T = window.__t; let tiles = 0, flick = 0; T.field.group.traverse(o => { if (o.isMesh && o.material.visible !== false) tiles++; if (o.isLight) flick++; });
      return { id: T.field.id, map: T.state.map, cols: T.field.cols, help: document.getElementById('helpBtn').hidden, meshes: tiles, lights: flick, unlit: T.field.slab.material.type, mips: T.field.slab.material.map.generateMipmaps, an: T.field.slab.material.map.anisotropy }; });
    ok(f.id === 'board' && f.map === 'board' && f.cols === 9 && f.help && !asked.some(u => /\/land\//.test(u)), 'a link to a landscaped map shows the board, and nothing of the levels is fetched (' + asked.filter(u => /chess-assets/.test(u)).length + ' files in all)');
    ok(f.meshes <= 3 && f.lights === 0 && f.unlit === 'MeshBasicMaterial' && f.mips && f.an >= 1, 'the board, its frame and its four braziers are one mesh under one painted picture, unlit, with its glow and its marks a sheet each (' + f.meshes + ' meshes, no lamp)');
    const kn = (await st(L)).units.find(u => u.owner === 0 && u.type === 'bulwark'); await tap(L, { kind: 'unit', id: kn.id });
    const marks = await L.evaluate(() => ({ n: window.__t.field.marks.size, sheet: window.__t.field.sheet.visible }));
    const at = await L.evaluate(() => { const T = window.__t, p = T.V(0 - (T.field.cols - 1) / 2, 0, 4 - (T.field.rows - 1) / 2); p.project(T.camera); return { x: (p.x + 1) / 2 * innerWidth, y: (1 - p.y) / 2 * innerHeight }; });
    await L.mouse.click(at.x, at.y); const aimed = await soon(L, () => window.__t.field.aimed === 4 * 9 && window.__t.selected === null);
    ok(marks.n > 4 && marks.sheet && aimed, 'a picked knight\'s moves are marked on the one sheet (' + marks.n + ' tiles), and a real click on an empty tile finds that tile');
    await shot(L, 'board'); await tap(L, null);
    ok(errs.length === n0, 'no page errors on the board' + (errs.length > n0 ? ': ' + errs.slice(n0, n0 + 4).join(' | ') : '')); await L.context().close(); }

  // ---- picking a team from the fourteen types, on the page and on the table's chips; their upgrade trees; a power aimed at empty ground ----
  { const n0 = errs.length, T = await open(); cur = null;
    await T.goto(BASE + '/chess?show=board&setup=1', { waitUntil: 'commit', timeout: 120000 }); await until(T, () => !!window.__t && !!window.__t.field && window.__t.state && window.__t.state.phase === 'setup');
    const groups = await T.evaluate(() => [...document.querySelectorAll('#roster h3')].map(h => h.textContent + ':' + (() => { let n = 0; for (let e = h.nextElementSibling; e && e.tagName === 'BUTTON'; e = e.nextElementSibling) n++; return n; })()).join());
    const mine = () => T.evaluate(() => window.__t.state.units.filter(u => u.owner === 0).map(u => u.type)), text = id => T.evaluate(id => document.getElementById(id).textContent, id);
    for (let i = 0; i < 4; i++) { const u = (await st(T)).units.find(q => q.owner === 0); await tap(T, { kind: 'unit', id: u.id }); await tap(T, { kind: 'setup', act: 'remove' }); }
    const free = async () => { const s = await st(T); for (let x = 0; x < 9; x++) for (const y of [10, 9, 8]) if (!s.units.some(u => u.x === x && u.y === y)) return { x, y }; };
    const put = async type => { if ((await T.evaluate(() => window.__t.held)) !== type) await T.click('#roster button[data-type="' + type + '"]'); await tap(T, { kind: 'tile', ...(await free()) }); await T.waitForTimeout(150); return text('setupMsg'); };
    const m1 = await put('wolf'), m2 = await put('captain'), m3 = await put('captain'), m4 = await put('ghost'), m5 = await put('whelp'), team = await mine(), label = await T.textContent('#roster button[data-type="captain"]');
    ok(groups === 'Fighters:5,Casters:4,Creatures:4,Leader:1' && (await T.locator('#roster button[data-type="skeleton"]').count()) === 0 && m1 === '' && m2 === '' && /At most 1 of the Captain/.test(m3) && m4 === '' && /budget/.test(m5) && team.includes('wolf') && team.includes('ghost') && team.filter(t => t === 'captain').length === 1 && !team.includes('whelp') && /Captain - 6 pts - 1\/1/.test(label), 'on the page the kinds are listed by group (' + groups + '); no Skeleton among them; a Wolf, a Captain and a Ghost are placed, a second Captain and a Whelp that does not fit the budget are refused');
    const chips = async () => T.evaluate(() => { const t = window.__t; return t.chips3D.filter(b => b.visible).map(b => b.userData.pick.type).join() + '|' + t.tabs3D.filter(b => b.visible).length + '|' + Math.max(...t.chips3D.filter(b => b.visible).map(b => Math.abs(b.position.x) + 0.67)).toFixed(1) + '|' + new Set(t.chips3D.filter(b => b.visible).map(b => b.position.z.toFixed(2))).size + '|' + t.chips3D.length; });
    const c0 = await chips(); await tap(T, { kind: 'page', page: 'creature' }); const c1 = await chips(); await tap(T, { kind: 'chip', type: 'ogre' }); const held = await T.evaluate(() => window.__t.held); await tap(T, { kind: 'page', page: 'leader' }); const c2 = await chips();
    ok(c0.split('|')[0] === 'bulwark,lancer,strider,slinger,alchemist' && c0.split('|')[3] === '1' && c0.split('|')[4] === '14' && c0.split('|')[1] === '4' && +c0.split('|')[2] <= 3.6 && c1.split('|')[0] === 'wolf,ogre,ghost,whelp' && held === 'ogre' && c2.split('|')[0] === 'captain', 'on the table the chips show one group at a time under four tabs, one row each, no wider than the status board: five fighters, then the four creatures, then the leader');
    await T.evaluate(() => { window.__t.prog.xp.wolf = 200; window.__t.drawUnits(); document.getElementById('units').hidden = false; });
    const rows = await T.evaluate(() => [...document.querySelectorAll('#unitRows .urow')].map(r => r.dataset.type + ':' + r.querySelectorAll('button').length)); await T.click('#unitRows .urow[data-type="wolf"] button[data-id="pelt"]'); await T.click('#unitRows .urow[data-type="wolf"] button[data-id="lope"]'); await T.click('#unitRows .urow[data-type="wolf"] button[data-id="packs"]');
    ok(rows.length === 14 && !rows.some(r => r.startsWith('skeleton')) && rows.every(r => r.endsWith(':5')) && (await T.evaluate(() => (window.__t.prog.ups.wolf || []).join())) === 'pelt,lope,packs', 'the upgrade trees list the fourteen types, five upgrades each; a Wolf at level 3 takes Thick pelt, Lope and Pack hunters');
    await shot(T, 'pick');
    // a staged turn: the alchemist's flask on empty ground needs the unit tapped again (aiming), so a tile is never both a move and a target
    await T.evaluate(async () => { document.getElementById('units').hidden = true; await window.__t.stage([{ type: 'alchemist', owner: 0, x: 4, y: 8 }, { type: 'bulwark', owner: 1, x: 4, y: 2 }, { type: 'mender', owner: 1, x: 0, y: 0 }], 0); });
    await until(T, () => window.__t.unitsReady, null, 120000);
    const marks = () => T.evaluate(() => { const t = window.__t, s = t.state, u = s.units[0]; return { aim: t.aim, sel: t.selected, pools: (s.pools || []).length, drawn: t.pools.count, at: u.x + ',' + u.y, acted: !!(s.active && s.active.acted) }; });
    await tap(T, { kind: 'unit', id: 1 }); const a0 = await marks(); await tap(T, { kind: 'tile', x: 4, y: 6 }); await T.waitForTimeout(200); const a1 = await marks();
    await T.evaluate(() => window.__t.stage([{ type: 'alchemist', owner: 0, x: 4, y: 8 }, { type: 'bulwark', owner: 1, x: 4, y: 2 }, { type: 'mender', owner: 1, x: 0, y: 0 }], 0)); await tap(T, { kind: 'unit', id: 1 }); await tap(T, { kind: 'unit', id: 1 }); const a2 = await marks();
    const thrown = await T.evaluate(() => { const t = window.__t; return t.act(0, { type: 'act', unit: 1, x: 4, y: 6 }).ok; }); await T.waitForTimeout(1500); const a3 = await marks();
    ok(a0.sel === 1 && !a0.aim && a1.at === '4,8' && a2.aim && thrown && a3.pools === 1 && a3.drawn === 1 && a3.acted, 'a flask at empty ground: the first tap picks the alchemist, a second aims; thrown, the tile burns and its glow is drawn');
    ok(errs.length === n0, 'no page errors picking a team' + (errs.length > n0 ? ': ' + errs.slice(n0, n0 + 4).join(' | ') : '')); await T.context().close(); }

  // ---- the campaign on the page: the overland map, a banner a battle, a battle against the computer, back to the map ----
  { const n0 = errs.length, C = await open(), N = CAMP.CAMPAIGN.nodes.length; cur = null;
    await C.goto(BASE + '/chess', { waitUntil: 'commit', timeout: 120000 }); await until(C, () => !!window.__t && !!document.getElementById('campBtn'));
    ok((await C.locator('#levelSel option').count()) === 2 && /Cold Beacon/.test(await C.textContent('#campBtn')), 'the menu offers a match against the computer at two levels, and the campaign');
    await C.evaluate(() => document.getElementById('campBtn').click());
    ok(await until(C, () => window.__t.inCamp && window.__t.field && window.__t.field.id === 'board' && window.__t.unitMeshes.size === 0, null, 120000) && (await C.locator('#campList button').count()) === N && /0 of/.test(await C.textContent('#status')), 'CAMPAIGN lists its ' + N + ' battles beside the plain board');
    await C.click('#campList button[data-id="toll"]'); const picked = await soon(C, () => window.__t.campSel === 'toll');
    const listed = await C.evaluate(() => [...document.querySelectorAll('#campList button')].map(b => b.className).join());
    ok(picked && /sel/.test(listed.split(',')[0]) && listed.split('shut').length === 6 && /Toll at Millford/.test(await C.textContent('#campName')) && /28 points/.test(await C.textContent('#campPts')) && /Knight/.test(await C.textContent('#campFoe')) && !(await C.isDisabled('#fightBtn')), 'a click on a battle in the list tells it (the rest are shown as not open yet): its words, who stands against you, the points you field');
    await tap(C, { kind: 'node', id: 'beacon' }); const shut = (await C.isDisabled('#fightBtn')) && /Not open yet/.test(await C.textContent('#campPts')); await shot(C, 'campaign'); await tap(C, { kind: 'node', id: 'toll' });
    await C.evaluate(() => document.getElementById('fightBtn').click());
    ok(shut && await until(C, () => window.__t.state && window.__t.state.map === 'board' && window.__t.state.phase === 'setup' && window.__t.campNode === 'toll' && window.__t.me === 0) && (await st(C)).budget === 28 && /\/ 28 points/.test(await C.textContent('#budget')), 'a battle not yet open cannot be fought; FIGHT opens the first on the board, to set out under the campaign\'s points');
    await C.evaluate(() => document.getElementById('readyBtn').click()); await until(C, () => window.__t.state.phase === 'play' && window.__t.state.units.length > 10);
    const foes = (await st(C)).units.filter(u => u.owner === 1).length; await tap(C, { kind: 'end' });
    ok(foes === CAMP.nodeOf('toll').enemy.length && await soon(C, () => window.__t.state.turn === 0 && window.__t.state.turnNo >= 3, null, 40000) && /^Your turn$/.test(await C.textContent('#status')), 'READY starts the battle against the enemy as written (' + foes + '); the computer takes its turn and gives yours back, with no clock');
    // the rest of the battle, played for you over your own socket by the Veteran's mind; whichever way it ends, the page must say so and take you back to the map
    const me = await seat('room=' + await C.evaluate(() => window.__t.code), { t: 'join', code: await C.evaluate(() => window.__t.code), token: await C.evaluate(() => sessionStorage.getItem('token')) }, false); await wait(() => me.state);
    for (let i = 0; i < 400 && me.state.winner === null; i++) { if (me.state.turn !== 0) { await wait(() => me.state.turn === 0 || me.state.winner !== null, 20000); continue; }
      for (const a of AI.plan(me.state, 0, 'hard')) { const n = me.got.length; me.act(a); await wait(() => me.got.length > n, 5000); if (me.state.winner !== null) break; }
      if (me.state.turn === 0 && me.state.winner === null) { const n = me.got.length; me.act({ type: 'end' }); await wait(() => me.got.length > n, 5000); } }
    const won = me.state.winner === 0; me.s.close();
    ok(me.state.winner !== null && await soon(C, () => !document.getElementById('after').hidden, null, 40000) && (won ? /won/ : /lost/).test(await C.textContent('#afterTitle')), 'the battle is fought to its end (' + (won ? 'won' : 'lost') + ' in ' + me.state.turnNo + ' turns), and the page says how it went');
    await C.evaluate(() => document.getElementById('afterBtn').click());
    ok(await until(C, () => window.__t.inCamp && window.__t.field.id === 'board') && (await C.evaluate(() => window.__t.camp.done.join())) === (won ? 'toll' : '') && (await C.evaluate(() => window.__t.CAMPAIGN && JSON.parse(localStorage.getItem('chess-camp') || '{"done":[]}').done.join())) === (won ? 'toll' : ''), 'BACK TO THE CAMPAIGN: ' + (won ? 'the battle is marked won, kept in the browser for anyone not signed in, and the next ones are open' : 'nothing is won, and the battle can be tried again'));
    ok(errs.length === n0, 'no page errors in the campaign' + (errs.length > n0 ? ': ' + errs.slice(n0, n0 + 4).join(' | ') : '')); await C.context().close(); }

  // ---- upgrades on the page: the trees, a point spent, the upgraded unit on the table against the computer, none in a fair duel ----
  { const n0 = errs.length, U = await open(() => { try { if (!localStorage.getItem('chess-prog')) localStorage.setItem('chess-prog', JSON.stringify({ xp: { bulwark: 95, slinger: 30 }, ups: {} })); } catch (e) {} }); cur = null;
    await U.goto(BASE + '/chess', { waitUntil: 'commit', timeout: 120000 }); await until(U, () => !!window.__t && !!document.getElementById('unitsBtn') && window.__t.prog.xp.bulwark === 95);
    await U.evaluate(() => document.getElementById('unitsBtn').click()); const row = '#unitRows .urow[data-type="bulwark"]';
    ok(await U.isVisible('#units') && (await U.locator('#unitRows .urow').count()) === 14 && /level 2/.test(await U.textContent(row + ' .uhead')) && /2 points to spend/.test(await U.textContent(row + ' .uhead')) && (await U.isDisabled(row + ' button[data-id="wall"]')) && (await U.isDisabled(row + ' button[data-id="march"]')) && /level 0/.test(await U.textContent('#unitRows .urow[data-type="mender"] .uhead')), 'YOUR UNITS shows each type\'s level, experience and tree: a level 2 knight has two points, its third tier closed, its second waiting on the first');
    await U.evaluate(r => document.querySelector(r + ' button[data-id="plate"]').click(), row); await U.evaluate(r => document.querySelector(r + ' button[data-id="march"]').click(), row);
    ok(/0 points to spend/.test(await U.textContent(row + ' .uhead')) && (await U.evaluate(() => JSON.parse(localStorage.getItem('chess-prog')).ups.bulwark.join())) === 'plate,march' && (await U.isDisabled(row + ' button[data-id="edge"]')) && /taken/.test(await U.textContent(row + ' button[data-id="plate"]')), 'a point spent takes an upgrade and is kept in the browser for anyone not signed in');
    await shot(U, 'upgrades'); await U.evaluate(() => document.getElementById('unitsClose').click());
    await U.evaluate(() => document.getElementById('soloBtn').click()); await until(U, () => window.__t.state && window.__t.state.phase === 'setup' && window.__t.state.units.some(u => u.up));
    const k = (await st(U)).units.find(u => u.type === 'bulwark'); await tap(U, { kind: 'unit', id: k.id });
    ok(k.hp === 58 && k.up.move === 1 && /HP 58\/58/.test(await U.textContent('#info')) && /move 4/.test(await U.textContent('#info')) && /upgrades count/.test(await U.textContent('#fairNote')) && !(await st(U)).units.some(u => u.type === 'slinger' && u.up), 'against the computer the upgraded knight is on the table with its own numbers (58 health, move 4)');
    await U.goto(BASE + '/chess', { waitUntil: 'commit', timeout: 120000 }); await until(U, () => !!window.__t && !!document.getElementById('createBtn')); await U.evaluate(() => document.getElementById('createBtn').click()); await until(U, () => window.__t.state && window.__t.state.phase === 'setup');
    ok(!(await st(U)).units.some(u => u.up) && (await st(U)).units.find(u => u.type === 'bulwark').hp === 50 && /fair match/.test(await U.textContent('#fairNote')), 'and a duel is fair unless its host opens it: the same knight is plain there');
    ok(errs.length === n0, 'no page errors with upgrades' + (errs.length > n0 ? ': ' + errs.slice(n0, n0 + 4).join(' | ') : '')); await U.context().close(); }

  // ---- an emulated Quest 3: AR, the board in front of you, a controller picks a piece ----
  { const n0 = errs.length, Q = await open(IWER + ';window.xrDevice=new IWER.XRDevice(IWER.metaQuest3);xrDevice.installRuntime({forceInstall:true});xrDevice.position.set(0,1.6,0);'
      + ';(()=>{const raf=window.requestAnimationFrame.bind(window);let real=-1,ft=0;window.__even=false;window.requestAnimationFrame=cb=>raf(t=>{if(t!==real){real=t;ft=window.__even?ft+1000/90:t;}cb(ft);});})();');   // __even: every frame is told it is 1/90 s after the last, however long it took
    await Q.goto(BASE + '/chess', { waitUntil: 'commit', timeout: 120000 }); await until(Q, () => !!window.__t); await Q.evaluate(() => document.getElementById('createBtn').click()); await until(Q, () => window.__t.code && window.__t.state);
    const qc = await Q.evaluate(() => window.__t.code), foe = await seat('room=' + qc, { t: 'join', code: qc, token: 'quest-foe' }); await until(Q, () => window.__t.ready[1]);
    ok(await until(Q, () => !document.getElementById('arBtn').hidden, null, 20000), 'in a Quest 3 the page offers ENTER AR');
    await Q.evaluate(() => document.getElementById('arBtn').click());
    ok(await until(Q, () => window.__t.renderer.xr.isPresenting && window.__t.scene.background === null), 'it starts a passthrough session: no sky, no table, the room shows through');
    const board = () => Q.evaluate(() => { const T = window.__t, w = T.scene.children.find(o => o.isGroup && o.children.length > 3); return { s: w.scale.x, x: w.position.x, y: w.position.y, z: w.position.z }; });
    await until(Q, () => { const w = window.__t.scene.children.find(o => o.isGroup && o.children.length > 3); return w.position.z < -0.3; }, null, 30000);
    const bd = await board(); ok(Math.abs(bd.s - 0.06) < 1e-6 && Math.abs(bd.z + 0.62) < 0.05 && Math.abs(bd.y - 1.1) < 0.05, 'the board is set at table size (a tile 6 cm) a little over half a metre in front of you: ' + JSON.stringify(bd));
    await people(Q);
    // the checks below step by drawn frames, however slow they are
    await Q.evaluate(() => { const T = window.__t, R = T.renderer, draw = R.render; window.__after = null; R.render = (s, c) => { draw.call(R, s, c); const f = window.__after; if (f) f(); };
      window.__drawn = fn => new Promise(res => { window.__after = () => { window.__after = null; res(fn && fn()); }; });   // after the next frame is drawn
      window.__w = T.scene.children.find(o => o.isGroup && o.children.length > 3); });
    const aim = async id => Q.evaluate(id => { const T = window.__t; let g = null; T.scene.traverse(o => { if (o.userData && o.userData.pick && o.userData.pick.kind === 'unit' && o.userData.pick.id === id) g = o; });
      const p = g.getWorldPosition(T.V(0, 0, 0)), c = xrDevice.controllers.right; c.position.set(p.x, p.y + 0.3, p.z); c.quaternion.set(-Math.SQRT1_2, 0, 0, Math.SQRT1_2); }, id);
    const press = (k = 'trigger') => Q.evaluate(async k => { const c = xrDevice.controllers.right; c.updateButtonValue(k, 1); await window.__drawn(); await window.__drawn(); c.updateButtonValue(k, 0); await window.__drawn(); await window.__drawn(); }, k);   // held over two drawn frames, however slow they are
    { const spot = pk => Q.evaluate(pk => { const T = window.__t; let g = null; T.scene.traverse(o => { const p = o.userData && o.userData.pick; if (p && p.kind === pk.kind && (p.type === pk.type) && (p.act === pk.act) && (p.page === pk.page) && o.visible) g = o; }); if (!g) return false;
        const p = g.getWorldPosition(T.V(0, 0, 0)), c = xrDevice.controllers.right; c.position.set(p.x, p.y + 0.25, p.z); c.quaternion.set(-Math.SQRT1_2, 0, 0, Math.SQRT1_2); return true; }, pk);
      const mage = (await st(Q)).units.find(u => u.type === 'mender'); await tap(Q, { kind: 'unit', id: mage.id }); const s1 = await spot({ kind: 'setup', act: 'remove' }); await Q.evaluate(async () => { await window.__drawn(); await window.__drawn(); }); await press(); await until(Q, () => window.__t.state.units.length === 9);
      const s0 = await spot({ kind: 'page', page: 'caster' }); await Q.evaluate(async () => { await window.__drawn(); await window.__drawn(); }); await press(); await until(Q, () => window.__t.page === 'caster');
      const s2 = s0 && await spot({ kind: 'chip', type: 'hexbinder' }); await Q.evaluate(async () => { await window.__drawn(); await window.__drawn(); }); await press(); const heldQ = await Q.evaluate(() => window.__t.held);
      await tap(Q, { kind: 'tile', x: mage.x, y: mage.y }); await until(Q, () => window.__t.state.units.length === 10);
      ok(s1 && s2 && heldQ === 'hexbinder' && (await st(Q)).units.filter(u => u.type === 'hexbinder').length === 2 && (await st(Q)).units.every(u => u.owner === 0), 'in the headset the table\'s own buttons set out a team: REMOVE under the controller, then the CASTERS tab and the Enchanter\'s chip, then a tile');
      const s3 = await spot({ kind: 'setup', act: 'ready' }); await Q.evaluate(async () => { await window.__drawn(); await window.__drawn(); }); await press();
      ok(s3 && await until(Q, () => window.__t.state.phase === 'play' && window.__t.state.units.length === 20) && foe.state.units.filter(u => u.owner === 0 && u.type === 'hexbinder').length === 2, 'READY under the controller starts the match with that team'); }
    const kn = (await st(Q)).units.find(u => u.owner === 0 && u.type === 'lancer'); await aim(kn.id); await Q.evaluate(async () => { await window.__drawn(); await window.__drawn(); }); await press();
    ok((await Q.evaluate(() => window.__t.selected)) === kn.id, 'the controller\'s trigger, pointed down at a piece, picks it');
    await tap(Q, { kind: 'tile', x: kn.x, y: kn.y - 2 }); await until(Q, id => window.__t.state.active && window.__t.state.active.id === id, kn.id); await tap(Q, { kind: 'end' });
    ok(await wait(() => foe.state && foe.state.turn === 1 && foe.state.units.find(u => u.id === kn.id).y === kn.y - 2), 'a move made in the headset reaches the other player');
    // smooth in the headset: under a head sweep the board stays where it is in the room, drawn from that frame's own head pose, and a label keeps to its piece
    { const r = await Q.evaluate(async () => { const T = window.__t, w = window.__w, V = () => T.V(0, 0, 0); let g = null; T.scene.traverse(o => { if (!g && o.userData && o.userData.pick && o.userData.pick.kind === 'unit') g = o; });
        const eyes = () => { const e = T.renderer.xr.getCamera().cameras; return V().setFromMatrixPosition(e[0].matrixWorld).add(V().setFromMatrixPosition(e[1].matrixWorld)).multiplyScalar(0.5); };   // midway between the two eyes as drawn
        const see = () => ({ cam: eyes().distanceTo(xrDevice.position), w: w.getWorldPosition(V()), l: (() => { const s = T.labels.slots.get(g.userData.pick.id), q = T.labels.pos, o = s.i * 24, c = V(); for (let k = 0; k < 4; k++) c.add(V().fromArray(q, o + k * 3)); return T.labels.mesh.localToWorld(c.multiplyScalar(0.25)).sub(g.getWorldPosition(V())); })() });
        const a = await window.__drawn(see); let cam = a.cam, drift = 0, lab = 0;
        for (let i = 1; i <= 12; i++) { xrDevice.position.set(0.3 * Math.sin(i * 0.2), 1.6 + 0.05 * Math.sin(i * 0.3), 0.1 * Math.sin(i * 0.15)); const b = await window.__drawn(see); cam = Math.max(cam, b.cam); drift = Math.max(drift, b.w.distanceTo(a.w)); lab = Math.max(lab, b.l.distanceTo(a.l)); }
        xrDevice.position.set(0, 1.6, 0); await window.__drawn(); return { cam: cam * 1000, drift: drift * 1000, lab: lab * 1000 }; });
      ok(r.cam < 0.01 && r.drift < 0.01 && r.lab < 0.01, 'a head sweep of 30 cm: each frame is drawn from its own head pose, the board does not move in the room, the bar over a piece keeps to it (mm: ' + JSON.stringify(r) + ')'); }
    await Q.evaluate(() => xrDevice.controllers.right.updateButtonValue('squeeze', 1)); await Q.waitForTimeout(3000); await Q.evaluate(() => { const c = xrDevice.controllers.right; c.position.set(c.position.x + 0.2, c.position.y, c.position.z); }); await until(Q, x => { const w = window.__t.scene.children.find(o => o.isGroup && o.children.length > 3); return Math.abs(w.position.x - x - 0.2) < 0.03; }, bd.x, 20000);
    const moved = await board(); await Q.evaluate(() => xrDevice.controllers.right.updateButtonValue('squeeze', 0));
    ok(Math.abs(moved.x - bd.x - 0.2) < 0.03, 'holding the grip drags the board with the hand');
    { const slip = await Q.evaluate(async () => { const T = window.__t, w = window.__w, V = () => T.V(0, 0, 0), c = xrDevice.controllers.right, hands = T.scene.children.filter(o => o.isGroup && o.userData.hand);
        const rel = () => w.getWorldPosition(V()).x - hands.map(h => h.getWorldPosition(V())).sort((a, b) => a.distanceTo(c.position) - b.distanceTo(c.position))[0].x;   // the board from the hand as drawn
        c.updateButtonValue('squeeze', 1); for (let i = 0; i < 5; i++) await window.__drawn(); const r0 = await window.__drawn(rel); let slip = 0;
        for (let i = 0; i < 8; i++) { c.position.set(c.position.x + 0.002, c.position.y, c.position.z); slip = Math.max(slip, Math.abs(await window.__drawn(rel) - r0)); }
        c.updateButtonValue('squeeze', 0); await window.__drawn(); return slip * 1000; });
      ok(slip < 0.05, 'dragged smoothly (2 mm a frame) the board is drawn with the hand in the same frame, not one behind (' + slip.toFixed(3) + ' mm apart)'); }
    ok(await until(Q, () => window.__t.lean === 2 && !window.__t.sun.castShadow, null, 120000), 'a headset whose frames run late is eased: a lower frame rate where it has one, then coarser edges of the view; there is no shadow to drop');
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
  // ---- what the board costs to draw in the headset, with twelve a side: the budget, no shadow pass, nothing that varies ----
  { const n0 = errs.length, F = await open(IWER + ';window.xrDevice=new IWER.XRDevice(IWER.metaQuest3);xrDevice.installRuntime({forceInstall:true});xrDevice.position.set(0,1.6,0);'); cur = null;
    await F.goto(BASE + '/chess?show=board&full=1', { waitUntil: 'commit', timeout: 120000 }); await until(F, () => !!window.__t && !!window.__t.field && window.__t.unitsReady && window.__t.dungeon.ready, null, 180000);
    // the worst a legal match can be: for each side the team of up to twelve under 40 points and the limits that has the most triangles
    const worst = await F.evaluate(async () => { const T = window.__t, G = T.G, types = G.PICK; await T.need(types); for (let i = 0; i < 600 && !T.typesReady(types); i++) await new Promise(r => setTimeout(r, 100));
      let best = new Map([['0,0', { tris: 0, team: [] }]]);
      for (const t of types) { const next = new Map(best); for (const [k, v] of best) { const [n, c] = k.split(',').map(Number); for (let q = 1; q <= G.TYPES[t].limit; q++) { const n2 = n + q, c2 = c + q * G.TYPES[t].cost; if (n2 > G.TEAM_MAX || c2 > G.BUDGET) break; const key = n2 + ',' + c2, tris = v.tris + q * T.trisOf(t); if (!next.has(key) || next.get(key).tris < tris) next.set(key, { tris, team: [...v.team, ...Array(q).fill(t)] }); } } best = next; }
      const top = [...best.values()].sort((a, b) => b.tris - a.tris)[0], units = [];
      for (const owner of [0, 1]) top.team.forEach((type, i) => units.push({ type, owner, x: i % 9, y: owner ? Math.floor(i / 9) : 10 - Math.floor(i / 9) }));
      const legal = G.checkTeam(G.newGame('board', { setup: true }), 0, units.filter(u => u.owner === 0).map(u => ({ type: u.type, x: u.x, y: u.y }))) === null;
      await T.stage(units, 0); const count = {}; for (const t of top.team) count[t] = (count[t] || 0) + 1;
      return { tris: top.tris, legal, cost: G.teamCost(top.team.map(type => ({ type }))), team: Object.entries(count).map(([t, n]) => n + ' ' + G.TYPES[t].name).join(', '), most: Math.max(...types.map(t => T.trisOf(t))), least: Math.min(...types.map(t => T.trisOf(t))) }; });
    await until(F, () => window.__t.unitsReady, null, 120000);
    await until(F, () => !document.getElementById('arBtn').hidden, null, 20000); await F.evaluate(() => document.getElementById('arBtn').click());
    await until(F, () => window.__t.renderer.xr.isPresenting && window.__t.world.position.z < -0.3, null, 30000);
    const m = await F.evaluate(async () => { const T = window.__t, R = T.renderer, I = R.info, draw = R.render; let after = null; R.render = (s, c) => { draw.call(R, s, c); const f = after; if (f) f(); };
      const drawn = fn => new Promise(res => { after = () => { after = null; res(fn()); }; });
      const cost = () => { let skinned = 0, lights = 0, casting = 0; T.scene.traverse(o => { let v = true; for (let q = o; q; q = q.parent) if (!q.visible) v = false; if (!v) return; if (o.isSkinnedMesh) skinned++; if (o.isLight) { lights++; if (o.castShadow) casting++; } }); return { calls: I.render.calls, tris: I.render.triangles, skinned, lights, casting }; };
      const look = () => { const a = []; T.scene.traverse(o => { if (o.isLight) a.push(o.intensity, o.color.getHex()); }); T.field.group.traverse(o => { if (o.isMesh && o.material.visible !== false) { a.push(o.material.opacity, o.material.color.getHex(), o.matrixWorld.elements.join()); const p = o.geometry.attributes.position; a.push(p.version, p.array[0], p.array[p.array.length - 1]); if (o.material.map) a.push(o.material.map.version); } }); return a.join('|'); };
      for (let i = 0; i < 8; i++) await drawn(() => 0);
      const rest = await drawn(cost), seen = new Set(); for (let i = 0; i < 14; i++) seen.add(await drawn(look));
      const u = T.state.units.find(u => u.owner === 0), g = T.unitMeshes.get(u.id); g.userData.target.z -= 3; let walk = null;
      for (let i = 0; i < 40 && !(walk && walk.skinned); i++) walk = await drawn(cost);
      const ember = T.state.units.find(q => q.owner === 0 && q.id !== u.id), eg = T.unitMeshes.get(ember.id); T.castFx('blast', eg, eg.position.clone(), T.V(0, 0, -1)); let spell = { calls: 0 };
      for (let i = 0; i < 30; i++) { const c = await drawn(cost); if (c.calls > spell.calls) spell = c; }
      await T.need(Object.keys(T.G.TYPES)); const all = Object.keys(T.G.TYPES).map((type, i) => ({ type, owner: i % 2, x: i % 9, y: i % 2 ? Math.floor(i / 9) : 10 - Math.floor(i / 9) })); await T.stage(all, 0); let many = null;
      for (let i = 0; i < 500 && !(many && T.unitsReady && many.skinned === 0 && many.calls <= rest.calls); i++) many = await drawn(cost);   // until the burst has faded and every type has arrived
      const D = T.dungeon, dm = []; D.group.traverse(o => { if (o.isMesh) dm.push(o.material.type); if (o.isLight) dm.push('light'); }); const t0 = D.lava.material.uniforms.t.value; await drawn(() => 0);
      return { dun: { kinds: dm.sort().join(), tris: D.tris, flows: D.lava.material.uniforms.t.value > t0, wall: D.group.children.some(o => o.name === 'dungeon'), ivy: D.group.children.some(o => o.name === 'ivy') }, rest, walk, spell, many, kinds: new Set(T.state.units.map(q => q.type)).size, steady: seen.size, units: T.state.units.length, fov: R.xr.getFoveation(), map: !!T.sun.shadow.map, tone: R.toneMapping, eyes: R.xr.getCamera().cameras.length }; });
    ok(worst.legal && worst.cost <= 40 && m.eyes === 2 && m.rest.calls < 60 && m.rest.tris < 150000 && m.rest.skinned === 0, 'the worst legal match at rest in the headset, both eyes (each side the twelve with the most triangles that 40 points and the limits allow: ' + worst.team + ', ' + worst.tris + ' triangles a side; a type is ' + worst.least + ' to ' + worst.most + '): ' + m.rest.calls + ' draws and ' + m.rest.tris + ' triangles a frame (under 60 and 150,000), no piece with bones');
    ok(m.kinds === 15 && m.many.calls <= m.rest.calls && m.many.calls < 60 && m.many.tris < 150000 && m.many.skinned === 0, 'the number of types costs no draws: with all fourteen and the Skeleton on the board at once it is ' + m.many.calls + ' draws and ' + m.many.tris + ' triangles, every standing piece of every type in one batched draw an eye');
    ok(m.rest.lights === 2 && m.rest.casting === 0 && !m.map && m.walk.casting === 0, 'one sun and the sky\'s fill, and no shadow pass: no light casts, no shadow map was ever made');
    ok(m.steady === 1, 'nothing in the fire or the light varies from frame to frame: the lights, the board, its glow and its marks are the same over fourteen frames');
    ok(m.dun.wall && m.dun.ivy && m.dun.kinds === 'MeshBasicMaterial,MeshBasicMaterial,ShaderMaterial' && m.dun.tris < 12500 && m.dun.flows, 'the dungeon round the board is three draws, unlit, with no lamp: its walls, rock and bank one baked mesh, its ivy one, its lava one that drifts (' + m.dun.tris + ' triangles)');
    ok(m.walk && m.walk.skinned === 1 && m.walk.calls < 60 && m.spell.calls < 60 && m.spell.casting === 0, 'only the piece that walks has bones (' + m.walk.calls + ' draws then), and a fire burst at its fullest is ' + m.spell.calls + ' draws');
    ok(m.fov > 0 && m.tone === 0, 'the view\'s edges are drawn coarser (fixed foveation ' + m.fov + '), with no tone curve or post pass over the picture');
    if (OUT) await F.screenshot({ path: path.join(OUT, 'quest3-full.png'), timeout: 180000 }).catch(() => {});
    ok(errs.length === n0, 'no page errors measuring the headset' + (errs.length > n0 ? ': ' + errs.slice(n0, n0 + 4).join(' | ') : '')); await F.context().close(); }
  await done(b);
})().catch(e => { console.log('FAIL the check itself broke: ' + (e && e.stack || e)); halt(); process.exit(1); });
