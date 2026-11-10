// THE BOWLING ALLEY'S CHECK (src/146zkb-bowling.js, worker/lanes.js): node tests/bowling.cjs [dist/market.html] [out folder]. Its door on Market St opens its inside off the map (built only on the way in, dropped on the way out);
// a throw rolls the ball down a lane in Rapier and knocks pins; the same throw rolls the same; the scoring of a perfect game, a gutter game, all spares and a known mixed game; a frame tries BOWLING;
// another player's throw rolls on your page and their count is the score; a lane is one bowler's (the worker's rules); a finished game goes on the board of the best games; no page errors. With an out folder, pictures.
const { chromium } = require('playwright'), path = require('path'), fs = require('fs');
const fails = [], ok = (c, m) => { if (!c) { fails.push(m); console.log((process.env.GITHUB_ACTIONS ? '::error title=bowling::' : 'FAIL ') + m); } else console.log('ok   ' + m); };
const OUT = process.argv[3];
(async () => {
  // the worker's rules, without a page: one bowler a lane, freed when they go; impossible games refused
  { const { BOWLS } = await import(path.resolve(__dirname, '../worker/lanes.js')); const L = BOWLS.lanes();
    const r = [BOWLS.take(L, 'a', 'ANN', 0), BOWLS.take(L, 'b', 'BO', 0), BOWLS.take(L, 'b', 'BO', 1), BOWLS.take(L, 'a', 'ANN', 2), !!L[0], BOWLS.roll(L, 'b', 1, [10, 10]), BOWLS.roll(L, 'a', 1, [3]), BOWLS.roll(L, 'a', 2, [7, 5]), BOWLS.leave(L, 'b'), L[1]];
    ok(r.join() === 'true,false,true,true,false,true,false,false,true,', 'the worker\'s lanes: one bowler a lane, a second is turned away, taking another lane lets the first go, only the holder\'s possible games are kept, leaving frees it: ' + r.join()); }
  const b = await chromium.launch({ ...(process.env.PW_CHROMIUM || process.env.PWCHROME ? { executablePath: process.env.PW_CHROMIUM || process.env.PWCHROME } : {}), args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const pg = await b.newPage({ viewport: { width: 960, height: 600 } }), errs = [];
  pg.on('pageerror', e => errs.push(e.message.slice(0, 300)));
  { const DIR = path.join(__dirname, '../node_modules/@dimforge/rapier3d-compat');   // Rapier from the packages, as the CDN would hand it
    await pg.route(/\/@dimforge\/rapier3d-compat@[^/]+\/(.+)$/, r => { const f = path.join(DIR, new URL(r.request().url()).pathname.split(/rapier3d-compat@[^/]+\//)[1] || ''); if (!fs.existsSync(f)) return r.continue(); r.fulfill({ path: f, contentType: /\.wasm$/.test(f) ? 'application/wasm' : 'text/javascript' }); }); }
  await pg.goto('file://' + path.resolve(process.argv[2] || 'dist/market.html') + '?fresh=1&hour=13&at=-2,-73', { waitUntil: 'commit' });
  let st = false; for (let i = 0; i < 80 && !st; i++) { await pg.waitForTimeout(3000); st = await pg.evaluate(() => !!window.__started).catch(() => false); }
  ok(st, 'the page starts');
  const until = async (f, a, ms = 30000) => { for (let t = 0; t < ms; t += 250) { if (await pg.evaluate(f, a).catch(() => false)) return true; await pg.waitForTimeout(250); } return false; };
  if (st) {
    // the scoring (worker/lanes.js, the same in the page)
    const sc = await pg.evaluate(() => { const B = BOWL.BOWLS, t = R => [B.score(R).total, B.score(R).done];
      return { perfect: t(Array(12).fill(10)), gutter: t(Array(20).fill(0)), spares: t(Array(21).fill(5)), mixed: t([10, 7, 3, 9, 0, 10, 0, 8, 8, 2, 0, 6, 10, 10, 10, 8, 1]), open: t([10, 10, 10]), marks: B.score([10, 7, 3, 9, 0]).frames.slice(0, 3).map(f => f.m.join('')).join(' '), bad: [B.ok([7, 5]), B.ok(Array(18).fill(0).concat([10, 3, 8])), B.ok(Array(21).fill(0))] }; });
    ok(sc.perfect.join() === '300,true' && sc.gutter.join() === '0,true' && sc.spares.join() === '150,true' && sc.mixed.join() === '167,true', 'ten-pin scoring: a perfect game 300, a gutter game 0, all spares (5 and 5, a 5 at the end) 150, a known mixed game 167: ' + JSON.stringify(sc));
    ok(sc.open.join() === '30,false' && sc.marks === 'X 7/ 9-' && sc.bad.every(v => !v), 'an unfinished game counts only what can be counted, strikes and spares are marked X and /, impossible games are refused: ' + JSON.stringify(sc));
    // the door on Market St, the inside off the map, not built yet
    const d0 = await pg.evaluate(() => ({ ...BOWL.where(), built: !!(BOWL.K && BOWL.K()), lazy: !(ROOMS.lazy.bowling && ROOMS.lazy.bowling.done), skill: FORAGE.SK.some(s => s[0] === 'bowl' && s[1] === 'BOWLING') && FORAGE.sk('bowl') === 0 }));
    ok(d0.reg && !d0.built && d0.lazy && d0.off && d0.door && d0.door[0] > d0.lot[0] && d0.door[0] < d0.lot[1] && Math.abs(d0.door[1] - d0.lot[2]) < 1.5, 'THE STRANGEST LANES: its door on Market St\'s row, its inside off the map, not built before you go in: ' + JSON.stringify(d0));
    ok(d0.skill, 'BOWLING is a skill, starting at 0');
    // (a way in is refused while a fade runs, as a player's click would be: wait for the start's fades to finish)
    await until(() => !FADE.busy, null, 60000);
    await pg.evaluate(() => ROOMS.enter('bowling'));
    ok(await until(() => BOWL.dbg().built && BOWL.dbg().inside, null, 120000), 'going in builds it and puts you inside');
    ok(await until(() => BOWL.dbg().phys, null, 60000), 'the physics (Rapier) is ready in the alley');
    const lay = await pg.evaluate(() => { const D = BOWL.dbg(); return { lanes: D.lanes.length, boards: D.lanes.every(l => l.board > 0), stand: D.lanes.every(l => l.stand === 1023), spot: !!(ROOMS.off.bowling.spots && ROOMS.off.bowling.spots['RUNS THE LANES']), keeper: BOWL.where().keeper }; });
    ok(lay.lanes === 4 && lay.boards && lay.stand && lay.spot && lay.keeper && lay.keeper.at === 'bowling', 'four lanes, ten pins on each, a scoreboard over each, the keeper\'s spot at the shoe counter (the longboarder runs the lanes): ' + JSON.stringify(lay));
    // the physics on its own: a ball down the middle knocks pins; the same numbers roll the same
    const ph = await pg.evaluate(() => { const a = BOWL.sim([.06, 0, 7.5, .3, 14, 1]), b = BOWL.sim([.06, 0, 7.5, .3, 14, 1]), g = BOWL.sim([.4, .03, 7, 0, 12, 2]); return { a: { out: a.out, down: a.down, t: a.t, z: a.path.map(p => p[1]) }, same: a.out === b.out && JSON.stringify(a.path) === JSON.stringify(b.path), gutter: g.down, gpath: g.path.slice(-2) }; });
    ok(ph.a.down >= 3 && ph.a.z.length > 3 && ph.a.z[ph.a.z.length - 1] > 18 && ph.same, 'a ball rolled down the lane in Rapier reaches the pins and knocks them over, and the same throw rolls the same: ' + JSON.stringify(ph));
    ok(ph.gutter === 0, 'a ball thrown wide drops in the gutter and knocks none: ' + JSON.stringify(ph.gutter));
    // your turn: take lane 1 (shoes and a game, $3), a throw rolls on the page; the pins it knocks are the first roll
    const t0 = await pg.evaluate(() => { INV.cash = 50; window.__fu = 0; const U = FORAGE.use; FORAGE.use = (k, ...a) => { if (k === 'bowl') window.__fu++; return U(k, ...a); }; BOWL.take(0); const D = BOWL.dbg(); return { me: D.me, cash: INV.cash, who: D.lanes[0].who, panel: !document.getElementById('bowlp').hidden }; });
    ok(t0.me && t0.me.ln === 0 && t0.me.ph === 'aim' && t0.cash === 47 && t0.who && t0.who.me && t0.panel, 'taking a lane: $3 for shoes and a game, you stand on its approach, the panel shows: ' + JSON.stringify(t0));
    if (OUT) { await pg.evaluate(() => { __dbg.UI.setView('third'); }); await pg.waitForTimeout(2500); await pg.screenshot({ path: OUT + '/bowling-approach.png' }); }
    const v1 = [.06, 0, 7.5, .3, 14, 7];
    const p0 = await pg.evaluate(v => { const want = BOWL.sim(v); const okk = BOWL.throw(v); const D = BOWL.dbg(); return { okk, rolling: D.lanes[0].rolling, want }; }, v1);
    await pg.waitForTimeout(1200);
    const p1 = await pg.evaluate(() => BOWL.dbg().lanes[0]);
    if (OUT) await pg.screenshot({ path: OUT + '/bowling-rolling.png' });
    ok(await until(() => !BOWL.dbg().lanes[0].rolling, null, 90000), 'the throw ends when the pins lie still');
    const p2 = await pg.evaluate(() => { const D = BOWL.dbg(); return { l: D.lanes[0], me: D.me }; });
    ok(p0.okk && p0.rolling && p1.ball && p2.l.rolls.length === 1 && p2.l.rolls[0] === p0.want.down && p2.l.out === p0.want.out && p2.l.rolls[0] >= 3, 'a throw rolls the ball down your lane, knocks pins over with the physics (the count is the roll, the same as the throw rolled alone): ' + JSON.stringify({ p0, ball: p1.ball, rolls: p2.l.rolls, out: p2.l.out }));
    ok(await until(() => { const D = BOWL.dbg(); return D.me && D.me.ph === 'aim' && !D.lanes[0].sweep; }, null, 20000), 'the pinsetter clears the fallen pins and you aim the second ball');
    // a second ball closes the frame: BOWLING is tried (a strike or a spare a pass)
    await pg.evaluate(() => BOWL.throw([.3, -.01, 7.5, .2, 14, 8])); await until(() => !BOWL.dbg().lanes[0].rolling, null, 90000);
    const f1 = await pg.evaluate(() => ({ rolls: BOWL.dbg().lanes[0].rolls, fu: window.__fu }));
    ok(f1.rolls.length === 2 && f1.rolls[0] + f1.rolls[1] <= 10 && f1.fu === 1, 'the second ball counts only the pins left standing, and the finished frame tries BOWLING once: ' + JSON.stringify(f1));
    if (OUT) { await pg.waitForTimeout(1500); await pg.screenshot({ path: OUT + '/bowling-board.png' }); }
    // another player on lane 2: their throw rolls here from the same numbers, their count is the score on their board
    const v2 = [-.05, .002, 7.8, .4, 15, 99];
    const o0 = await pg.evaluate(v => { ONLINE.hear.bowl({ t: 'bowl', op: 'lanes', lanes: [{ id: ONLINE.me || 'me', name: 'YOU', rolls: [] }, { id: 'g1', name: 'ROSA', rolls: [] }, null, null] }); const want = BOWL.sim(v);
      ONLINE.hear.bowl({ t: 'bowl', op: 'throw', id: 'g1', name: 'ROSA', ln: 1, v, st: 1023 }); const D = BOWL.dbg(); return { want, rolling: D.lanes[1].rolling, who: D.lanes[1].who, mine: D.me && D.me.ln }; }, v2);
    await pg.waitForTimeout(900); const o1 = await pg.evaluate(() => BOWL.dbg().lanes[1].ball);
    ok(await until(() => !BOWL.dbg().lanes[1].rolling, null, 90000), 'their throw ends here too');
    const o2 = await pg.evaluate(w => { const L = BOWL.dbg().lanes[1], seen = L.out; ONLINE.hear.bowl({ t: 'bowl', op: 'res', id: 'g1', name: 'ROSA', ln: 1, out: w.out, rolls: [w.down] }); return { seen, after: BOWL.dbg().lanes[1] }; }, o0.want);
    ok(o0.rolling && o0.who && o0.who.name === 'ROSA' && !o0.who.me && o0.mine === 0 && o1 && o2.seen === o0.want.out && o2.after.rolls[0] === o0.want.down && o2.after.rolls.length === 1, 'another player\'s throw on their lane rolls the ball and pins on your page, the same as theirs; their count is their score: ' + JSON.stringify({ o0, o1, o2 }));
    const tk = await pg.evaluate(() => { const c0 = INV.cash; BOWL.take(1); return { mine: BOWL.dbg().me.ln, cash: INV.cash === c0 }; });
    ok(tk.mine === 0 && tk.cash, 'their lane is theirs: you cannot take it: ' + JSON.stringify(tk));
    // a finished game goes on the board of the best games (kept by the worker on the website; your copy here)
    const hs = await pg.evaluate(() => { const L = BOWL.K().lanes[0]; L.rolls = Array(18).fill(0).concat([10, 10]); L.stand = 1023; return BOWL.throw([.06, 0, 7.5, .3, 14, 7]); });
    await until(() => !BOWL.dbg().lanes[0].rolling, null, 90000); await pg.waitForTimeout(500);
    const h1 = await pg.evaluate(() => { const D = BOWL.dbg(); return { ph: D.me.ph, score: D.lanes[0].score, top: D.top }; });
    ok(hs && h1.ph === 'over' && h1.score >= 23 && h1.top.some(e => e.score === h1.score), 'the tenth frame\'s bonus ball ends the game, and the game goes on the board of the best games: ' + JSON.stringify(h1));
    // stepping off frees the lane; leaving the alley drops it all
    await pg.evaluate(() => BOWL.leave()); const lf = await pg.evaluate(() => ({ me: BOWL.dbg().me, who: BOWL.dbg().lanes[0].who }));
    ok(!lf.me && !lf.who, 'stepping off frees the lane: ' + JSON.stringify(lf));
    await pg.evaluate(() => ROOMS.exit('bowling'));
    ok(await until(() => !BOWL.dbg().built && !(ROOMS.lazy.bowling && ROOMS.lazy.bowling.done), null, 60000), 'leaving drops the inside');
  }
  ok(!errs.length, 'no page errors' + (errs.length ? ': ' + errs.slice(0, 3).join(' | ') : ''));
  await b.close(); console.log(fails.length ? fails.length + ' FAILED' : 'ALL OK'); process.exit(fails.length ? 1 : 0);
})();
