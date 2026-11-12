// THE ARCADE'S PINBALL'S CHECK (src/146zcz-pinball.js, src/pinball/table.js): node tests/pinball.cjs [dist/market.html] [out folder]. Two tables stand on the arcade's west wall (few draws, no stool in their way); taking one puts you at it looking down, SPACE starts a game and the plunger sends the ball,
// A and D work the flippers; a finished game goes on the arcade's top ten and pays tickets; stepping away gives your view back; leaving the arcade drops the tables; no page errors. With an out folder, pictures.
const { chromium } = require('playwright'), path = require('path');
const fails = [], ok = (c, m) => { if (!c) { fails.push(m); console.log((process.env.GITHUB_ACTIONS ? '::error title=pinball::' : 'FAIL ') + m); } else console.log('ok   ' + m); };
const OUT = process.argv[3];
(async () => {
  const b = await chromium.launch({ ...(process.env.PW_CHROMIUM || process.env.PWCHROME ? { executablePath: process.env.PW_CHROMIUM || process.env.PWCHROME } : {}), args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const pg = await b.newPage({ viewport: { width: 960, height: 600 } }), errs = [];
  pg.on('pageerror', e => errs.push(e.message.slice(0, 300)));
  pg.on('console', m => { if (/was not loaded before use/.test(m.text())) errs.push(m.text().slice(0, 200)); });
  await pg.goto('file://' + path.resolve(process.argv[2] || 'dist/market.html') + '?fresh=1&hour=13&at=-2,-73', { waitUntil: 'commit' });
  let st = false; for (let i = 0; i < 80 && !st; i++) { await pg.waitForTimeout(3000); st = await pg.evaluate(() => !!window.__started).catch(() => false); }
  ok(st, 'the page starts');
  const until = async (f, a, ms = 30000) => { for (let t = 0; t < ms; t += 250) { if (await pg.evaluate(f, a).catch(() => false)) return true; await pg.waitForTimeout(250); } return false; };
  if (st) {
    ok(await pg.evaluate(() => !PIN.dbg && !LOADED('pinball')), 'the tables\' code is not fetched before you go in');
    let inn = false; for (let i = 0; i < 12 && !inn; i++) { await until(() => !FADE.busy, null, 60000); await pg.evaluate(() => ROOMS.enter('arcade')); inn = await until(() => ARCDBG().built && ROOMS.offIn() === 'arcade' && !!PIN.dbg && PIN.dbg().built === 2, null, 15000); }
    ok(inn, 'going into the arcade builds it');
    const view0 = await pg.evaluate(() => __dbg.UI.view);
    const lay = await pg.evaluate(() => { const D = PIN.dbg(), F = IKIT.frame(ROOMS.off.arcade.ar), wall = F.pw(F.W, 0)[0], th = ARCDBG().things;
      return { n: D.built, names: D.tables.map(t => t.name), meshes: D.tables.map(t => t.meshes), wall: D.tables.map(t => +(Math.abs(t.at[0] - wall) / IKIT.MW).toFixed(2)), play: th.filter(n => /^PLAY .* PINBALL$/.test(n)).length, stools: th.filter(n => n === 'STOOL').length, idle: D.tables.every(t => t.phase === 'idle'), cabs: th.filter(n => /^PLAY /.test(n)).length }; });
    ok(lay.n === 2 && lay.names.join() === 'POOH PINBALL,MICKEY PINBALL' && lay.play === 2 && lay.cabs === 8 && lay.idle, 'two tables, POOH and MICKEY, each a thing to play, beside the six cabinets: ' + JSON.stringify(lay));
    ok(lay.wall.every(d => d > .6 && d < 1) && lay.stools === 6, 'their backs to the west wall, no stool where they stand: ' + JSON.stringify(lay.wall) + ' ' + lay.stools);
    ok(lay.meshes.every(n => n < 140), 'a table\'s still pieces are drawn together (under 140 meshes a table): ' + lay.meshes);
    if (OUT) { await pg.evaluate(() => { __dbg.UI.setView('third'); const t = PIN.T()[0]; __dbg.UI.goTo(t.x - 2.2, t.z + 2, 0, Math.PI / 2); }); await pg.waitForTimeout(3000); await pg.screenshot({ path: OUT + '/pinball-room.png' }); await pg.evaluate(v => __dbg.UI.setView(v), view0); }
    // your game on POOH
    await pg.evaluate(() => PIN.take(0)); await pg.waitForTimeout(600);
    const t0 = await pg.evaluate(() => { const D = PIN.dbg(), t = PIN.T()[0]; return { me: D.me, view: D.view, pinned: !!window.RUNNER, panel: !document.getElementById('pinp').hidden, at: Math.hypot(__dbg.pos()[0] - t.x, __dbg.pos()[2] - t.z) < .05 }; });
    ok(t0.me === 0 && t0.view === 'first' && t0.pinned && t0.panel && t0.at, 'taking a table: you stand at it, looking down through your own eyes, its panel up: ' + JSON.stringify(t0));
    await pg.keyboard.press('Space'); await pg.waitForTimeout(400);
    const s0 = await pg.evaluate(() => PIN.dbg().tables[0]);
    ok(s0.phase === 'ready' && s0.ball === 1 && s0.balls.length === 1 && s0.balls[0][0] > .46, 'SPACE starts a game: ball 1 waits in the shooter lane: ' + JSON.stringify(s0));
    if (OUT) { await pg.waitForTimeout(1500); await pg.screenshot({ path: OUT + '/pinball-ready.png' }); }
    await pg.keyboard.down('Space'); await pg.waitForTimeout(900); await pg.keyboard.up('Space');
    ok(await until(() => { const t = PIN.dbg().tables[0]; return t.phase === 'play' && t.balls[0] && t.balls[0][1] > .4; }, null, 8000), 'holding SPACE and letting go: the plunger sends the ball up the lane');
    await pg.keyboard.down('a'); await pg.keyboard.down('ArrowRight'); await pg.waitForTimeout(250);
    const f1 = await pg.evaluate(() => PIN.dbg().tables[0].fl); if (OUT) await pg.screenshot({ path: OUT + '/pinball-play.png' });
    await pg.keyboard.up('a'); await pg.keyboard.up('ArrowRight'); await pg.waitForTimeout(250);
    const f2 = await pg.evaluate(() => PIN.dbg().tables[0].fl);
    ok(f1.join() === 'true,true' && f2.join() === 'false,false', 'A and D (or the arrows) raise the flippers while held: ' + f1 + ' then ' + f2);
    // the last ball drains with 45,000 on the board: the game is over, the score on the top ten, tickets out
    const tix0 = await pg.evaluate(() => { const S = PIN.T()[0].pin.state; S.ball = 3; S.save = 0; S.score = 45000; for (const q of S.balls) { q.x = .234; q.y = -.05; } const n = INV.items.ptix || 0; for (let i = 0; i < 100 && S.phase !== 'over'; i++) PIN.T()[0].pin.update(.04); return n; });
    ok(await until(() => PIN.dbg().tables[0].phase === 'over' && PIN.dbg().last, null, 15000), 'the third ball down the drain ends the game');
    await pg.waitForTimeout(500);
    const e1 = await pg.evaluate(() => { const L = PIN.dbg().last, top = STORE.cabs.kit().top('POOH PINBALL'); return { last: L, top: top[0], tix: INV.items.ptix || 0 }; });
    ok(e1.last && e1.last.table === 'pooh' && e1.last.score >= 45000 && e1.last.tickets === Math.min(10, Math.floor(e1.last.score / 20000)) && e1.tix - tix0 === e1.last.tickets, 'tickets come out by the score (one a 20,000, ten at most): ' + JSON.stringify(e1));
    ok(e1.top && e1.top.score === e1.last.score, 'the game goes on the arcade\'s top ten under POOH PINBALL: ' + JSON.stringify(e1.top));
    await pg.keyboard.press('Space'); await pg.waitForTimeout(400);
    const s2 = await pg.evaluate(() => PIN.dbg().tables[0]);
    ok(s2.phase === 'ready' && s2.score === 0 && s2.ball === 1, 'SPACE again starts another game: ' + JSON.stringify(s2));
    // stepping away, then MICKEY
    await pg.keyboard.press('Escape'); await pg.waitForTimeout(400);
    const l1 = await pg.evaluate(() => ({ me: PIN.dbg().me, view: PIN.dbg().view, pinned: !!window.RUNNER, panel: !document.getElementById('pinp').hidden }));
    ok(l1.me === null && l1.view === view0 && !l1.pinned && !l1.panel, 'ESC steps away: you walk again, your view as it was: ' + JSON.stringify(l1));
    await pg.evaluate(() => { PIN.take(1); PIN.start(); }); await pg.waitForTimeout(600);
    const m1 = await pg.evaluate(() => ({ me: PIN.dbg().me, t: PIN.dbg().tables[1] }));
    ok(m1.me === 1 && m1.t.phase === 'ready', 'MICKEY plays the same: ' + JSON.stringify(m1));
    if (OUT) { await pg.waitForTimeout(1500); await pg.screenshot({ path: OUT + '/pinball-mickey.png' }); }
    // out of the arcade: the game let go, the tables dropped
    await until(() => !FADE.busy, null, 30000); await pg.evaluate(() => ROOMS.exit('arcade'));
    ok(await until(() => ROOMS.offIn() !== 'arcade' && PIN.dbg().built === 0 && PIN.dbg().me === null && !window.RUNNER, null, 30000), 'leaving the arcade lets go of your game and drops the tables');
    ok(await pg.evaluate(v => __dbg.UI.view === v, view0), 'your view is as it was outside');
  }
  ok(!errs.length, 'no page errors: ' + errs.join(' | '));
  await b.close();
  console.log(fails.length ? fails.length + ' FAILED' : 'pinball: all ok'); process.exit(fails.length ? 1 : 0);
})();
