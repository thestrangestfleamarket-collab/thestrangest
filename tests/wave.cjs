// SHARDWAVE played by its own bot: node tests/wave.cjs dist/wave.html
const { chromium } = require('playwright'), path = require('path');
(async () => {
  let bad = 0; const ok = (c, m) => { console.log((c ? 'ok   ' : 'FAIL ') + m); if (!c) bad++; };
  const b = await chromium.launch({ ...(process.env.PWCHROME ? { executablePath: process.env.PWCHROME } : {}), args: ['--autoplay-policy=no-user-gesture-required', '--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const pg = await b.newPage({ viewport: { width: 320, height: 180 } }), errs = [];
  pg.on('pageerror', e => errs.push(e.message)); pg.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  const url = 'file://' + path.resolve(process.argv[2] || 'dist/wave.html') + '?autoplay';
  for (const [i, dk, lk] of [[0, 'normal', 0], [3, 'easy', 1]]) {
    await pg.goto(url); await pg.waitForFunction(() => window.__sw);
    await pg.evaluate(([i, dk, lk]) => { __sw.setLook(lk); __sw.start(i, dk); }, [i, dk, lk]);
    await pg.waitForFunction(() => __sw.state === 'playing' && __sw.songT > 11, null, { timeout: 90000 });
    const r = await pg.evaluate(() => { const c = __sw.cur; return { track: c.track.name, look: __sw.LOOKS[__sw.look].name, hits: c.hits, passed: c.notes.filter(n => n.t < __sw.songT - 0.3).length, dirs: c.notes.filter(n => n.dir).length, state: __sw.state }; });
    ok(r.state === 'playing' && r.passed >= 5 && r.hits >= r.passed - 1 && r.dirs === 0, 'the bot cuts every shard on time, none needs a direction: ' + JSON.stringify(r));
  }
  ok(!errs.length, 'no page errors ' + errs.slice(0, 3).join(' | '));
  await b.close(); console.log(bad ? bad + ' FAILED' : 'all good'); process.exit(bad ? 1 : 0);
})();
