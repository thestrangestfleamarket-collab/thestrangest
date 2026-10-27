// THE LAWN CHECK: node tests/lawn.cjs dist/market.html. One start on the park lawn: the lawns are plain flat green ground (no grass, weeds or reeds drawn), and the lawn is still known chunk by chunk for the foragers.
const { chromium } = require('playwright'), path = require('path');
const fails = [], ok = (c, m) => { if (!c) { fails.push(m); console.log((process.env.GITHUB_ACTIONS ? '::error title=lawn::' : 'FAIL ') + m); } else console.log('ok   ' + m); };
(async () => {
  const b = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const pg = await b.newPage(), errs = [];
  pg.on('pageerror', e => errs.push(e.message.slice(0, 300)));
  await pg.goto('file://' + path.resolve(process.argv[2] || 'dist/market.html') + '?fresh=1&hour=13&at=40,150&res=0', { waitUntil: 'commit' });
  let st = false; for (let i = 0; i < 60 && !st; i++) { await pg.waitForTimeout(3000); st = await pg.evaluate(() => !!window.__started).catch(() => false); }
  ok(st, 'the page starts in the park');
  if (st) {
    for (let i = 0; i < 40; i++) { if (await pg.evaluate(() => WEEDS.chunks.size >= 9 && [...WEEDS.chunks.values()].some(m => m && m.I)).catch(() => false)) break; await pg.waitForTimeout(1000); }
    const r = await pg.evaluate(async () => {
      const o = {}, c = W3.group.position, a = SHARED.BOD.g.lawnCol(3.3, 7.1), b = SHARED.BOD.g.lawnCol(91.7, 12.2);
      o.flat = Array.isArray(a) && a.join() === b.join();
      const M = [...WEEDS.chunks.values()].filter(m => m && m.I); o.chunks = M.length; o.meshes = M.filter(m => m.isMesh).length;
      o.grass = !window.GRASS; o.weeds = !WEEDS.meshes && !WEEDS.gold && !WEEDS.pressAt;
      let spot = null; for (let x = c.x - 16; x < c.x + 16 && !spot; x += .6) for (let z = c.z - 16; z < c.z + 16; z += .6) { const t = WEEDS.top(x, z); if (typeof t === 'number') { spot = [x, z, t]; break; } }
      o.onGround = !!spot && Math.abs(spot[2] - SHARED.groundY(spot[0], spot[1])) < 1e-6;
      o.live = await new Promise(r => { const T = []; let on = true; const f = () => { if (!on) return; T.push(performance.now()); requestAnimationFrame(f); }; requestAnimationFrame(f);   // the page keeps drawing after the start: frames 20 s long, no gap of 10 s (a slow software-drawn page or a one-off stall passes, a freeze does not)
        setTimeout(() => { on = false; T.push(performance.now()); let g = 0; for (let i = 1; i < T.length; i++) g = Math.max(g, T[i] - T[i - 1]); r({ ok: T.length > 3 && g < 10000, frames: T.length - 1, gap: Math.round(g) }); }, 20000); });
      return o;
    });
    ok(r.flat, 'the lawns are one flat green: ' + JSON.stringify(r.flat));
    ok(r.grass && r.weeds && r.meshes === 0, 'no grass, weeds or reeds are drawn: ' + JSON.stringify([r.grass, r.weeds, r.meshes]));
    ok(r.chunks > 0 && r.onGround, 'the lawn is known round you (' + r.chunks + ' chunks), its top the ground itself');
    ok(r.live.ok, 'the page keeps running after the start (' + r.live.frames + ' frames in 20 s, the longest gap ' + r.live.gap + ' ms)');
  }
  ok(!errs.length, 'no page errors' + (errs.length ? ': ' + errs.join(' | ') : ''));
  await b.close(); console.log(fails.length ? fails.length + ' failed' : 'all lawn checks passed'); process.exit(fails.length ? 1 : 0);
})();
