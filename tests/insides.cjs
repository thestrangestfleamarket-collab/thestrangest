// THE SHOPS' INSIDES CHECK: node tests/insides.cjs dist/market.html. Each street shop's inside is built only when you go in and dropped when you leave; twice round leaves nothing behind (the lists it adds to come back to where they were).
const { chromium } = require('playwright'), path = require('path');
const fails = [], ok = (c, m) => { if (!c) { fails.push(m); console.log((process.env.GITHUB_ACTIONS ? '::error title=insides::' : 'FAIL ') + m); } else console.log('ok   ' + m); };
(async () => {
  const b = await chromium.launch({ ...(process.env.PWCHROME ? { executablePath: process.env.PWCHROME } : {}), args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const pg = await b.newPage({ viewport: { width: 960, height: 600 } }), errs = [];
  pg.on('pageerror', e => errs.push(e.message.slice(0, 300)));
  await pg.goto('file://' + path.resolve(process.argv[2] || 'dist/market.html') + '?fresh=1&hour=13&at=53,10', { waitUntil: 'commit' });
  let st = false; for (let i = 0; i < 60 && !st; i++) { await pg.waitForTimeout(3000); st = await pg.evaluate(() => !!window.__started).catch(() => false); }
  ok(st, 'the page starts');
  if (st) {
    await pg.evaluate(async () => { await STORE.ensure(); for (const id in STORE.gate) STORE.gate[id] = () => true; });
    const ids = await pg.evaluate(() => Object.keys(STORE.inside));
    ok(ids.length > 0, 'the street has shops with insides: ' + ids.join(', '));
    const sizes = () => pg.evaluate(() => ({ things: __UI && __UI.things ? __UI.things.length : -1, sol: SHARED.solids.length, fix: SHARED.fixed.length, flames: FLAMES.length, peek: PEEK.boxes.length, sys: Object.values(SYS.P).reduce((s, a) => s + a.length, 0), kids: __dbg.THREE ? 0 : 0 }));
    const until = async (f, a, ms = 30000) => { for (let t = 0; t < ms; t += 250) { if (await pg.evaluate(f, a).catch(() => false)) return true; await pg.waitForTimeout(250); } return false; };
    const s0 = await pg.evaluate(() => Object.keys(STORE.inside).map(id => [id, !!STORE.inside[id].done]));
    ok(s0.every(([, d]) => !d), 'no inside is built before you go in: ' + JSON.stringify(s0));
    let after1 = null;
    for (let round = 1; round <= 2; round++) {
      for (const id of ids) {
        await pg.evaluate(id => STORE.enter(id, true), id);
        const built = await until(id => STORE.inside[id].done && !!STORE.inside[id].P, id);
        await pg.evaluate(id => STORE.exit(id), id);
        const dropped = await until(id => !STORE.inside[id].done && !STORE.inside[id].P, id);
        ok(built && dropped, 'round ' + round + ': ' + id + ' is built when you go in and dropped when you leave');
      }
      if (round === 1) after1 = await sizes(); else { const after2 = await sizes(); ok(JSON.stringify(after1) === JSON.stringify(after2), 'going round again leaves nothing behind: ' + JSON.stringify(after1) + ' then ' + JSON.stringify(after2)); }
    }
  }
  ok(!errs.length, 'no page errors' + (errs.length ? ': ' + errs.slice(0, 3).join(' | ') : ''));
  await b.close(); console.log(fails.length ? fails.length + ' FAILED' : 'ALL OK'); process.exit(fails.length ? 1 : 0);
})();
