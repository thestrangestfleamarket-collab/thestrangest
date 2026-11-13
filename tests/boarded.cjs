// BOARDED UP CHECK: node tests/boarded.cjs dist/boarded.html. BOARDED UP is a page of its own (/boarded, no market in it): its own screen holds the
// game's drawing; a solo game starts, the dead rise and come for the windows, and a board goes back on; an open doorway lets you out and the dead follow; LEAVE THE HOLODECK ends the program and gives the page back.
const { chromium } = require('playwright'), path = require('path');
const fails = [], ok = (c, m) => { if (!c) { fails.push(m); console.log((process.env.GITHUB_ACTIONS ? '::error title=boarded::' : 'FAIL ') + m); } else console.log('ok   ' + m); };
(async () => {
  const b = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const pg = await b.newPage({ viewport: { width: 800, height: 500 } }), errs = [];
  pg.on('pageerror', e => errs.push(e.message.slice(0, 300)));
  await pg.goto('file://' + path.resolve(process.argv[2] || 'dist/boarded.html') + '?stay=1&buq=low', { waitUntil: 'commit' });
  const wait = (f, a, t = 180000) => pg.waitForFunction(f, a, { timeout: t, polling: 200 });
  await wait(() => window.BOARDEDDBG && window.HOLO && HOLO.run);
  const r1 = await pg.evaluate(() => ({ run: HOLO.run && HOLO.run.P.name, on: BOARDEDDBG().on, market: typeof window.__dbg !== 'undefined' || typeof window.ARCDBG !== 'undefined' }));
  ok(r1.run === 'BOARDED UP' && r1.on && !r1.market, 'BOARDED UP\'s page starts it with no market loaded: ' + JSON.stringify(r1));
  const ready = await wait(() => BOARDEDDBG().ready, null, 240000).then(() => 1, () => 0);
  ok(ready, 'its world builds (models fetched, or stand-ins where one does not come)');
  if (ready) {
    const r2 = await pg.evaluate(() => { const A = BOARDED.api; A.start(1); A.G.between = .1; const p = A.players[0]; for (let i = 0; i < 30 * 50; i++) { p.hp = 100; A.step(1 / 30); }
      const w = A.windows.find(w => w.count < 6 && !w.vault), c0 = w ? w.count : -1; if (w) { window.dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyF' })); for (let i = 0; i < 90 && w.count === c0; i++) { p.hp = 100; p.pos.set(w.x - w.nx * .7, 0, w.z - w.nz * .7); A.step(1 / 30); } window.dispatchEvent(new KeyboardEvent('keyup', { code: 'KeyF' })); }
      return { round: A.G.round, zombies: A.zombies.length, states: [...new Set(A.zombies.map(z => z.state))], torn: A.windows.some(w => w.count < 6), c0, c1: w ? w.count : -1, shown: getComputedStyle(document.getElementById('boarded')).display }; });
    ok(r2.round === 1 && r2.zombies > 0 && r2.torn && r2.c1 > r2.c0 && r2.shown === 'block', 'a solo game runs: round 1, the dead come, boards are torn off and one goes back on with F: ' + JSON.stringify(r2));
    const r2b = await pg.evaluate(() => { const A = BOARDED.api, p = A.players[0], d = A.windows.find(w => w.door), o = {}; const walk = () => { p.pos.set(d.x, 0, d.z - 1.2); p.yaw = Math.PI; p.pitch = 0; window.dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyW' })); for (let i = 0; i < 60; i++) { p.hp = 100; p.yaw = Math.PI; A.step(1 / 30); } window.dispatchEvent(new KeyboardEvent('keyup', { code: 'KeyW' })); return +p.pos.z.toFixed(2); };
      for (const z of A.zombies) if (z.win === d && z.state !== 'dead') z.hp = 0; for (let i = d.count; i < 6; i++) d.count = i + 1; d.vault = null; o.shut = walk(); d.count = 0; o.open = walk();
      for (let i = 0; i < 30 * 14; i++) { p.hp = 100; A.step(1 / 30); } o.at = [+p.pos.x.toFixed(1), +p.pos.z.toFixed(1)]; o.hunters = A.zombies.filter(z => z.state === 'chase' || z.state === 'attack').length; o.near = +Math.min(...A.zombies.filter(z => z.state !== 'dead').map(z => Math.hypot(z.pos.x - p.pos.x, z.pos.z - p.pos.z))).toFixed(1); return o; });
    ok(r2b.shut < 8 && r2b.open > 8.6 && r2b.hunters > 0 && r2b.near < 3, 'a boarded door keeps you in; with no boards left you walk out onto the grounds, and the dead come for you there: ' + JSON.stringify(r2b));
    const r3 = await pg.evaluate(() => { BOARDED.api.toMenu(); document.getElementById('boarded').shadowRoot.querySelector('#bleave').click(); return { on: BOARDEDDBG().on, run: HOLO.run, left: !!HOLO.left, shown: getComputedStyle(document.getElementById('boarded')).display }; });
    ok(!r3.on && !r3.run && r3.left && r3.shown === 'none', 'LEAVE THE HOLODECK ends the program and leaves the page for the market: ' + JSON.stringify(r3));
  }
  ok(!errs.length, 'no page errors ' + errs.join(' | '));
  await b.close(); console.log(fails.length ? fails.length + ' FAILED' : 'all good'); process.exit(fails.length ? 1 : 0);
})().catch(e => { console.log('FAIL ' + e.message); process.exit(1); });
