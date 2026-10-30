// THE LAWN CHECK: node tests/lawn.cjs dist/market.html. One start on the park lawn: the standing grass (each kind its own shape) stands over the lawn round you (none out on the paths or water, none past the far ring), they do not bend as you walk through, the ground is painted in the same tufts, and the lawn is still known chunk by chunk for the foragers.
const { chromium } = require('playwright'), path = require('path');
const fails = [], ok = (c, m) => { if (!c) { fails.push(m); console.log((process.env.GITHUB_ACTIONS ? '::error title=lawn::' : 'FAIL ') + m); } else console.log('ok   ' + m); };
(async () => {
  const b = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const pg = await b.newPage(), errs = [];
  pg.on('pageerror', e => errs.push(e.message.slice(0, 300)));
  await pg.goto('file://' + path.resolve(process.argv[2] || 'dist/market.html') + '?fresh=1&grass=all&hour=13&at=40,150&res=0', { waitUntil: 'commit' });
  let st = false; for (let i = 0; i < 60 && !st; i++) { await pg.waitForTimeout(3000); st = await pg.evaluate(() => !!window.__started).catch(() => false); }
  ok(st, 'the page starts in the park');
  if (st) {
    for (let i = 0; i < 40; i++) { if (await pg.evaluate(() => WEEDS.chunks.size >= 9 && [...WEEDS.chunks.values()].some(m => m && m.I) && TUFTS.stat().near > 0).catch(() => false)) break; await pg.waitForTimeout(1000); }
    // stand on open lawn
    await pg.evaluate(() => { const c = W3.group.position; for (let r = 0; r < 60; r += .5) for (let a = 0; a < 6.28; a += .3) { const x = c.x + Math.cos(a) * r, z = c.z + Math.sin(a) * r; if ([[0, 0], [2, 0], [-2, 0], [0, 2], [0, -2]].every(([u, v]) => typeof WEEDS.top(x + u, z + v) === 'number' && GRASS.at((x + u) / (33.9 / 30), (z + v) / (33.9 / 30)).shape)) { __dbg.UI.goTo(x, z, SHARED.py); return; } } });
    await pg.waitForTimeout(4000);
    const r = await pg.evaluate(async () => {
      const o = {}, c = W3.group.position, S = TUFTS.stat(); o.stat = S;
      const cols = new Set(); let green = true; for (let i = 0; i < 400; i++) { const v = SHARED.BOD.g.lawnCol(3 + i * .137, 7 + (i % 23) * .21); cols.add(v.map(Math.round).join()); if (!(v[1] > v[0] && v[1] > v[2])) green = false; }
      o.painted = { colours: cols.size, green };
      const M = [...WEEDS.chunks.values()].filter(m => m && m.I); o.chunks = M.length;
      let spot = null; for (let x = c.x - 16; x < c.x + 16 && !spot; x += .6) for (let z = c.z - 16; z < c.z + 16; z += .6) { const t = WEEDS.top(x, z); if (typeof t === 'number') { spot = [x, z, t]; break; } }
      o.onGround = !!spot && Math.abs(spot[2] - SHARED.groundY(spot[0], spot[1])) < 1e-6;
      // where each tuft stands: on the lawn or just at its edge, never out on a path or the water, never past the far ring
      const near = (x, z, d) => [[0, 0], [d, 0], [-d, 0], [0, d], [0, -d]].some(([u, v]) => typeof WEEDS.fine(x + u, z + v) === 'number');
      let off = 0, far = 0, n = 0, R2 = 0; const P = []; for (const me of TUFTS.meshes) { const A = me.instanceMatrix.array; for (let i = 0; i < me.count; i++) { const x = A[i * 16 + 12], z = A[i * 16 + 14]; n++; P.push([x, z]); const d = Math.hypot(x - c.x, z - c.z); R2 = Math.max(R2, d); if (!near(x, z, .36)) off++; } }
      let bare = 0, hit = 0; for (let x = c.x - 10; x < c.x + 10; x += .5) for (let z = c.z - 10; z < c.z + 10; z += .5) { if ([0, .4, .75].every(d => [...Array(8)].every((_, k) => WEEDS.fine(x + d * Math.cos(k * .785), z + d * Math.sin(k * .785)) === null))) { bare++; if (P.some(p => Math.hypot(p[0] - x, p[1] - z) < .2)) hit++; } }
      o.where = { n, off, bare, hit, R2: +R2.toFixed(1) };
      // no bending (owner, 30 Oct 2026: "turn off grass bending too"): nothing presses the tufts as you walk through
      const y0 = __dbg.you(), p0 = [y0.x, y0.z]; __dbg.UI.goTo(p0[0] + 3, p0[1], SHARED.py); await new Promise(r => setTimeout(r, 3000)); o.press0 = TUFTS.pressing().length === 0;
      o.live = await new Promise(r => { const T = []; let on = true; const f = () => { if (!on) return; T.push(performance.now()); requestAnimationFrame(f); }; requestAnimationFrame(f);   // the page keeps drawing after the start: frames 20 s long, no gap of 10 s (a slow software-drawn page or a one-off stall passes, a freeze does not)
        setTimeout(() => { on = false; T.push(performance.now()); let g = 0; for (let i = 1; i < T.length; i++) g = Math.max(g, T[i] - T[i - 1]); r({ ok: T.length > 3 && g < 10000, frames: T.length - 1, gap: Math.round(g) }); }, 20000); });
      return o;
    });
    ok(r.stat.near > 300 && r.stat.far > 300 && r.stat.draws >= 1 && r.stat.draws <= 10, 'tufts stand over the lawn round you, whole ones near and small ones further, one draw a shape: ' + JSON.stringify(r.stat));
    ok(r.where.n > 0 && r.where.off === 0 && r.where.hit === 0, 'no tuft stands out on a path or the water (each is on the lawn or at its edge): ' + JSON.stringify(r.where));
    ok(r.where.R2 < 26, 'no tuft past the far ring (' + r.where.R2 + ')');
    ok(r.painted.colours > 30 && r.painted.green, 'the lawn ground is painted in the tufts\' greens, not one flat green: ' + JSON.stringify(r.painted));
    ok(r.press0, 'the tufts do not bend as you walk through them');
    ok(r.chunks > 0 && r.onGround, 'the lawn is known round you (' + r.chunks + ' chunks), its top the ground itself');
    ok(r.live.ok, 'the page keeps running after the start (' + r.live.frames + ' frames in 20 s, the longest gap ' + r.live.gap + ' ms)');
  }
  ok(!errs.length, 'no page errors' + (errs.length ? ': ' + errs.join(' | ') : ''));
  await b.close(); console.log(fails.length ? fails.length + ' failed' : 'all lawn checks passed'); process.exit(fails.length ? 1 : 0);
})();
