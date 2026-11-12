// BOARDED UP CHECK: node tests/boarded.cjs dist/market.html. The holodeck's booth lists BOARDED UP; RUN puts its own screen over the page and holds the
// game's drawing; a solo game starts, the dead rise and come for the windows, and a board goes back on; LEAVE THE HOLODECK ends the program and gives the page back.
const { chromium } = require('playwright'), path = require('path');
const fails = [], ok = (c, m) => { if (!c) { fails.push(m); console.log((process.env.GITHUB_ACTIONS ? '::error title=boarded::' : 'FAIL ') + m); } else console.log('ok   ' + m); };
(async () => {
  const b = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const pg = await b.newPage({ viewport: { width: 800, height: 500 } }), errs = [];
  pg.on('pageerror', e => errs.push(e.message.slice(0, 300)));
  await pg.goto('file://' + path.resolve(process.argv[2] || 'dist/market.html') + '?fresh=1&hour=13&res=1&buq=low', { waitUntil: 'commit' });
  await pg.waitForFunction(() => window.__started, null, { timeout: 300000 });
  const wait = (f, a, t = 180000) => pg.waitForFunction(f, a, { timeout: t, polling: 200 });
  await pg.waitForTimeout(12000); await wait(() => !FADE.busy).catch(() => {});
  for (let k = 0; k < 4; k++) { await pg.evaluate(() => { if (!ARCDBG().built && !FADE.busy) ROOMS.enter('arcade'); }); if (await wait(() => ARCDBG().built && !FADE.busy, null, 60000).then(() => 1, () => 0)) break; }
  const r1 = await pg.evaluate(() => { const H = STORE.holo, P = H.programs.find(p => p.name === 'BOARDED UP'); if (!P) return { listed: false }; H.start(P); return { listed: true, run: H.run && H.run.P.name, on: BOARDEDDBG().on, held: !!(__dbg.SHARED || window.SHARED || {}).drive }; });
  ok(r1.listed && r1.run === 'BOARDED UP' && r1.on, 'the booth lists BOARDED UP and RUN starts it: ' + JSON.stringify(r1));
  const ready = await wait(() => BOARDEDDBG().ready, null, 240000).then(() => 1, () => 0);
  ok(ready, 'its world builds (models fetched, or stand-ins where one does not come)');
  if (ready) {
    const r2 = await pg.evaluate(() => { const A = BOARDED.api; A.start(1); A.G.between = .1; const p = A.players[0]; for (let i = 0; i < 30 * 50; i++) { p.hp = 100; A.step(1 / 30); }
      const w = A.windows.find(w => w.count < 6 && !w.vault), c0 = w ? w.count : -1; if (w) { window.dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyF' })); for (let i = 0; i < 90 && w.count === c0; i++) { p.hp = 100; p.pos.set(w.x - w.nx * .7, 0, w.z - w.nz * .7); A.step(1 / 30); } window.dispatchEvent(new KeyboardEvent('keyup', { code: 'KeyF' })); }
      return { round: A.G.round, zombies: A.zombies.length, states: [...new Set(A.zombies.map(z => z.state))], torn: A.windows.some(w => w.count < 6), c0, c1: w ? w.count : -1, shown: getComputedStyle(document.getElementById('boarded')).display }; });
    ok(r2.round === 1 && r2.zombies > 0 && r2.torn && r2.c1 > r2.c0 && r2.shown === 'block', 'a solo game runs: round 1, the dead come, boards are torn off and one goes back on with F: ' + JSON.stringify(r2));
    const r3 = await pg.evaluate(() => { BOARDED.api.toMenu(); document.getElementById('boarded').shadowRoot.querySelector('#bleave').click(); return { on: BOARDEDDBG().on, run: STORE.holo.run, shown: getComputedStyle(document.getElementById('boarded')).display }; });
    ok(!r3.on && !r3.run && r3.shown === 'none', 'LEAVE THE HOLODECK ends the program and gives the page back: ' + JSON.stringify(r3));
  }
  ok(!errs.length, 'no page errors ' + errs.join(' | '));
  await b.close(); console.log(fails.length ? fails.length + ' FAILED' : 'all good'); process.exit(fails.length ? 1 : 0);
})().catch(e => { console.log('FAIL ' + e.message); process.exit(1); });
