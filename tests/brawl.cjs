// THE BRAWL CHECK: node tests/brawl.cjs dist/market.html. A player fed to ONLINE (no network): their moves play, they are solid, your punch lands only when your fist reaches them, their blows hurt, shove and knock you down.
const { chromium } = require('playwright'), path = require('path');
const fails = [], ok = (c, m) => { if (!c) { fails.push(m); console.log((process.env.GITHUB_ACTIONS ? '::error title=brawl::' : 'FAIL ') + m); } else console.log('ok   ' + m); };
(async () => {
  const b = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const pg = await b.newPage({ viewport: { width: 960, height: 600 } }), errs = [];
  pg.on('pageerror', e => errs.push(e.message.slice(0, 300)));
  await pg.goto('file://' + path.resolve(process.argv[2] || 'dist/market.html') + '?fresh=1&hour=13&at=53,10', { waitUntil: 'commit' });
  let st = false; for (let i = 0; i < 60 && !st; i++) { await pg.waitForTimeout(3000); st = await pg.evaluate(() => !!window.__started).catch(() => false); }
  ok(st, 'the page starts');
  if (st) {
    await pg.waitForTimeout(2000);
    const place = (fwd) => pg.evaluate(f => { const P = __dbg.you(), h = SHARED.heading; ONLINE.feed({ t: 'mv', id: 'a', at: [P.x + Math.sin(h) * f, P.z + Math.cos(h) * f, SHARED.py, h + Math.PI, SHARED.LVL, ''] }); }, fwd);
    await pg.evaluate(() => { window.__sent = []; ONLINE.send = m => __sent.push(m); const P = __dbg.you(), h = SHARED.heading;
      ONLINE.feed({ t: 'hi', you: 'me', all: [{ id: 'a', name: 'ROSA', look: 'w00', at: [P.x + Math.sin(h) * .6, P.z + Math.cos(h) * .6, SHARED.py, h + Math.PI, SHARED.LVL, ''] }] }); });
    await pg.waitForTimeout(1500);
    await pg.evaluate(() => ONLINE.feed({ t: 'act', id: 'a', k: 'J', on: 1 }));
    await pg.waitForTimeout(300);
    ok(await pg.evaluate(() => { const o = ONLINE.others.get('a'); return !!(o.S.up && /jab/.test(o.S.up.name)); }), 'their jab plays on their figure');
    const pushed = await pg.evaluate(() => { const o = ONLINE.others.get('a'), c = __dbg.collide(o.p.x + .1, o.p.z); return Math.hypot(c[0] - o.p.x, c[1] - o.p.z); });
    ok(pushed > .5, 'you cannot walk into them (pushed out to ' + pushed.toFixed(2) + ')');
    await pg.keyboard.press('j'); await pg.waitForTimeout(1500);
    const hit = await pg.evaluate(() => __sent.filter(m => m.t === 'hit'));
    ok(hit.length === 1 && hit[0].to === 'a' && hit[0].d > 0 && hit[0].k === 'fist', 'your jab lands once when your fist reaches them (' + JSON.stringify(hit) + ')');
    await place(-1.2); await pg.waitForTimeout(800); await pg.evaluate(() => { __sent.length = 0; });
    await pg.keyboard.press('j'); await pg.waitForTimeout(1500);
    ok(await pg.evaluate(() => !__sent.some(m => m.t === 'hit')), 'a jab with them behind you misses');
    const before = await pg.evaluate(() => ({ hp: __dbg.VIT.hp, p: __dbg.you() }));
    await pg.evaluate(() => { const o = ONLINE.others.get('a'); ONLINE.feed({ t: 'hit', id: 'a', d: .1, kb: 1, k: 'fist', from: [o.p.x, o.p.z] }); });
    await pg.waitForTimeout(2500);
    const after = await pg.evaluate(() => ({ hp: __dbg.VIT.hp, p: __dbg.you(), rag: window.RAGON() }));
    ok(after.hp < before.hp, 'their blow takes health (' + before.hp.toFixed(2) + ' -> ' + after.hp.toFixed(2) + ')');
    ok(Math.hypot(after.p.x - before.p.x, after.p.z - before.p.z) > .1 && !after.rag, 'a light blow shoves you without knocking you down');
    await pg.waitForTimeout(400);
    await pg.evaluate(() => { const o = ONLINE.others.get('a'); ONLINE.feed({ t: 'hit', id: 'a', d: .05, kb: 1.8, heavy: true, k: 'blade', from: [o.p.x, o.p.z] }); });
    await pg.waitForTimeout(600);
    ok(await pg.evaluate(() => window.RAGON()), 'a heavy blow knocks you down into the ragdoll');
    ok(await pg.evaluate(() => __sent.some(m => m.t === 'act' && m.k === 'F' && m.on === 1)), 'everyone is told you went down');
    const err = await pg.evaluate(() => Object.entries(SYS.P).flatMap(([k, v]) => v.filter(s => s.err).map(s => k + ':' + s.name)));
    ok(!err.length, 'no SYS errors (' + err.join(',') + ')');
  }
  ok(!errs.length, 'no page errors' + (errs.length ? ': ' + errs.slice(0, 3).join(' | ') : ''));
  await b.close();
  console.log(fails.length ? fails.length + ' failed' : 'all brawl checks passed');
  process.exit(fails.length ? 1 : 0);
})();
