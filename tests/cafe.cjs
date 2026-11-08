// THE BOOKSTORE CAFÉ CHECK: node tests/cafe.cjs dist/market.html. The bookstore is twice as wide inside: its sixteen cases in the left half, the café in the right (the coffee bar sells, the cupboard lists every game, eight framed paintings open with their guided tours); sitting at a table opens its window, a game is picked, the computer fills the empty seat, and a game of tic-tac-toe is played to the end by clicks; the table's state is what the online store would carry.
const { chromium } = require('playwright'), path = require('path');
const fails = [], ok = (c, m) => { if (!c) { fails.push(m); console.log((process.env.GITHUB_ACTIONS ? '::error title=cafe::' : 'FAIL ') + m); } else console.log('ok   ' + m); };
(async () => {
  const b = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--allow-file-access-from-files'] });
  const pg = await b.newPage({ viewport: { width: 1100, height: 760 } }), errs = [];
  pg.on('pageerror', e => errs.push(e.message.slice(0, 300)));
  await pg.goto('file://' + path.resolve(process.argv[2] || 'dist/market.html') + '?fresh=1&hour=13', { waitUntil: 'commit' });
  let st = false; for (let i = 0; i < 80 && !st; i++) { await pg.waitForTimeout(3000); st = await pg.evaluate(() => !!window.__started).catch(() => false); }
  ok(st, 'the page starts');
  if (st) {
    await pg.evaluate(() => ROOMS.enter('books'));
    for (let i = 0; i < 60 && !(await pg.evaluate(() => __dbg.UI.things.some(t => /^TABLE 5/.test(t.name)))); i++) await pg.waitForTimeout(1000);
    await pg.waitForTimeout(1500);
    const th = await pg.evaluate(() => __dbg.UI.things.map(t => t.name));
    ok(th.filter(n => / SHELF$/.test(n)).length === 64 && th.includes('RETURNS'), 'the books\' half: sixteen cases of four shelves and the returns');
    ok(th.filter(n => /^TABLE [1-5] /.test(n)).length === 20, 'the café: five tables of four chairs (' + th.filter(n => /^TABLE/.test(n)).length + ')');
    ok(th.some(n => /COFFEE BAR/.test(n)) && th.some(n => /GAME CUPBOARD/.test(n)), 'the coffee bar and the game cupboard');
    const W = await pg.evaluate(() => { const R = MSHOP.at.books.R; return R.x1 - R.x0; });
    ok(W === 16, 'the room is twice as wide inside (' + W + ' tiles, was 8)');
    const bar = await pg.evaluate(async () => { INV.cash = 10; const n0 = INV.count ? INV.count('d_coffee') : 0; __dbg.UI.things.find(t => /COFFEE BAR/.test(t.name)).act(); await new Promise(r => setTimeout(r, 300));
      const cv = document.querySelector('#minig canvas'), r = cv.getBoundingClientRect(), S = MINI.state(); S.mx = 200; S.my = 60; S.press = true; await new Promise(r => setTimeout(r, 200)); const cash = INV.cash; MINI.close(); return { cash, title: document.querySelector('#minig h3').textContent }; });
    ok(bar.cash === 9 && /COFFEE BAR/.test(bar.title), 'the coffee bar: a coffee for $1 (' + JSON.stringify(bar) + ')');
    const list = await pg.evaluate(async () => { __dbg.UI.things.find(t => /CUPBOARD/.test(t.name)).act(); await new Promise(r => setTimeout(r, 300)); const n = Object.keys(TG.games()).length; const t = document.querySelector('#minig h3').textContent; MINI.close(); return { n, t }; });
    ok(list.n >= 40 && /CUPBOARD/.test(list.t), 'the cupboard lists every game (' + list.n + ')');
    const art = await pg.evaluate(async () => { const P = __dbg.UI.things.filter(t => / · /.test(t.name) && !/^TABLE|COFFEE|CUPBOARD/.test(t.name)); const t = P.find(t => /RAINY DAY/.test(t.name)); if (!t) return { n: P.length };
      t.act(); for (let i = 0; i < 40 && !(STORE.art.viewer() && STORE.art.viewer().open); i++) await new Promise(r => setTimeout(r, 250)); const v = STORE.art.viewer(); STORE.art.tourOn(); const a = STORE.art.viewer().tour; STORE.art.tourNext(); const b = STORE.art.viewer().tour; STORE.art.tourOff();
      return { n: P.length, t: v && v.t, has: v && v.hasTour, a, b }; });
    await pg.keyboard.press('Escape'); await pg.waitForTimeout(300);
    ok(art.n === 8 && art.t === 'Paris Street; Rainy Day' && art.has && art.a && art.a.n >= 5 && art.b.i === 1, 'eight paintings on the café walls; one double-clicked opens in the viewer with its guided tour (' + JSON.stringify(art) + ')');
    // sit at table 1, seat 1: the window opens; pick tic-tac-toe; the computer takes the other seat; START; play by clicks until it ends
    const click = async (x, y) => { const r = await pg.evaluate(() => { const c = document.querySelector('#minig canvas').getBoundingClientRect(); return [c.left, c.top, c.width / 520]; }); await pg.mouse.click(r[0] + x * r[2], r[1] + y * r[2]); await pg.waitForTimeout(120); };
    const btn = async id => { const r = await pg.evaluate(id => { const S = MINI.state(); return S && S.sys && S.sys[id]; }, id); if (!r) return false; await click(r[0] + r[2] / 2, r[1] + r[3] / 2); return true; };
    await pg.evaluate(() => __dbg.UI.things.find(t => /^TABLE 1 /.test(t.name)).act()); await pg.waitForTimeout(1500);
    const s0 = await pg.evaluate(() => ({ open: !!(MINI.on && MINI.on.tbl), at: TABLES.at(), sit: !!__dbg.ST.sit }));
    ok(s0.open && s0.at && s0.at[0] === 0 && s0.sit, 'a chair at table 1: you sit and its window opens (' + JSON.stringify(s0) + ')');
    ok(await btn('g:tictactoe'), 'the lobby lists the games: tic-tac-toe picked');
    if (process.env.SHOT) await pg.screenshot({ path: process.env.SHOT + '-lobby.png' });
    const s1 = await pg.evaluate(() => TABLES.state()[0]);
    ok(s1.g === 'tictactoe' && s1.s.filter(x => x === 'cpu').length === 1, 'the computer fills the seat the game needs (' + JSON.stringify(s1.s) + ')');
    ok(await btn('start'), 'START');
    let done = null;
    for (let k = 0; k < 40 && !done; k++) {
      const s = await pg.evaluate(() => { const R = TABLES.state()[0], P = R.s.map((id, i) => id ? i : -1).filter(i => i >= 0); return { b: R.st && R.st.b, p: R.st && R.st.p, mine: P.indexOf(TABLES.at()[1]), over: R.st && TG.games().tictactoe.over(R.st) }; });
      if (s.over) { done = s.over; break; }
      if (s.p === s.mine) { const i = s.b.indexOf('.'); await click((i % 3 + .5) * 520 / 3, 58 + (Math.floor(i / 3) + .5) * 520 / 3); }
      await pg.waitForTimeout(600);
    }
    ok(done && Array.isArray(done.win), 'a whole game against the computer, played by clicks (' + (done && done.text) + ')');
    const top = await pg.evaluate(() => { const R = TABLES.state()[0]; return JSON.stringify(R).length; });
    ok(top < 3600, 'the table\'s shared state is small (' + top + ' chars)');
    ok(await btn('up'), 'GET UP');
    const s2 = await pg.evaluate(() => ({ at: TABLES.at(), open: !!MINI.on, R: TABLES.state()[0].s }));
    ok(!s2.at && !s2.open && s2.R.every(x => !x), 'you get up: the window closes and the table is free (' + JSON.stringify(s2) + ')');
    const err = await pg.evaluate(() => Object.entries(SYS.P).flatMap(([k, v]) => v.filter(s => s.err).map(s => k + ':' + s.name)));
    ok(!err.length, 'no SYS errors (' + err.join(',') + ')');
  }
  ok(!errs.length, 'no page errors (' + errs.join(' | ') + ')');
  await b.close(); console.log(fails.length ? fails.length + ' failed' : 'all good'); process.exit(fails.length ? 1 : 0);
})();
