// THE LAKE WRECK CHECK: node tests/lakewreck.cjs dist/market.html. The red interceptor crashed in the big lake (066bb): its basin dug where the lake is inside the map, the ship and its debris built when you come near,
// solid to a swimmer down among it and not above it, its four chests on its deck; the lake two to six times deeper in spots (owner, 10 Nov 2026). No page errors.
const { chromium } = require('playwright'), path = require('path');
const fails = [], ok = (c, m) => { if (!c) { fails.push(m); console.log((process.env.GITHUB_ACTIONS ? '::error title=lakewreck::' : 'FAIL ') + m); } else console.log('ok   ' + m); };
(async () => {
  const b = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const pg = await b.newPage({ viewport: { width: 960, height: 540 } }), errs = [];
  pg.on('pageerror', e => errs.push(e.message.slice(0, 300))); pg.on('console', m => { if (m.type() === 'warning' && /^SYS |LAKEWRECK|FOUNT/.test(m.text())) errs.push(m.text().slice(0, 300)); });
  const U = 'file://' + path.resolve(process.argv[2] || 'dist/market.html') + '?fresh=1&hour=13';
  await pg.goto(U, { waitUntil: 'commit' }); await pg.waitForFunction(() => window.__started, null, { timeout: 400000, polling: 500 });
  const d0 = await pg.evaluate(() => LAKEWRECK.dbg());
  ok(d0.lake && !d0.none && !d0.built, 'its spot found in the lake inside the map, nothing built from the street: ' + JSON.stringify(d0));
  const AT = await pg.evaluate(L => [SHARED.BOD.XS(L[0] - 11), SHARED.BOD.ZS(L[1] + 2)].join(), d0.lake);
  await pg.goto(U + '&at=' + AT, { waitUntil: 'commit' }); await pg.waitForFunction(() => window.__started, null, { timeout: 400000, polling: 500 });
  await pg.waitForFunction(() => LAKEWRECK.built, null, { timeout: 200000, polling: 1000 }).catch(() => {});
  const d1 = await pg.evaluate(() => { const L = LAKEWRECK, M = __dbg.cv().TILE / .84, c = WRECK.chests.filter(q => /^lakewreck/.test(q.k)); return { ...L.dbg(), depth: +((FOUNT.LV - L.floorY) / M).toFixed(1), chests: c.map(q => +((q.G.position.y - L.floorY) / M).toFixed(1)) }; });
  ok(d1.built && d1.shown && d1.walls > 40 && d1.depth > 14 && d1.depth < 18, 'beside it the wreck is built and drawn in its basin, some 16 m down: ' + JSON.stringify(d1));
  ok(d1.chests.length === 4 && d1.chests.every(y => Math.abs(y) < 1.5), 'its four chests lie on its deck: ' + JSON.stringify(d1.chests));
  const sol = async y => pg.evaluate(async y => { const W = __rigst().water, k = W.level / FOUNT.LV; EQUIP.breathe = true; SWIM.tankS = 1e9; for (let i = 0; i < 250; i++) { SWIM.d = (y * __dbg.cv().TILE / .84) * k; await new Promise(r => setTimeout(r, 120)); if (Math.abs((FOUNT.LV - W.y * (FOUNT.LV / W.level)) / (__dbg.cv().TILE / .84) - y) < 1) break; } await new Promise(r => setTimeout(r, 600)); return { solid: LAKEWRECK.solid, swim: FOUNT.swim, on: LAKEWRECK.dbg().on, m: +((FOUNT.LV - W.y * (FOUNT.LV / W.level)) / (__dbg.cv().TILE / .84)).toFixed(1) }; }, y);
  const deep = await sol(13), shallow = await sol(1);
  ok(deep.swim && deep.solid && deep.on === d1.walls && !shallow.solid && shallow.on === 0, 'its hull is solid to a swimmer down among it, not to one over it: ' + JSON.stringify({ deep, shallow }));
  const lake = await pg.evaluate(() => { const M = __dbg.cv().TILE / .84; let n = 0, deep = 0, mx = 0; for (let y = 96; y < 181; y += 3) for (let x = 150; x < 262; x += 3) { const d = -FOUNT.lake(x, y); if (d <= 0) continue; const m = (FOUNT.LV - FOUNT.bedY(d, x, y)) / M; n++; if (m > 7) deep++; if (!FOUNT.HOLES.some(([hx, hy, r]) => Math.hypot(x - hx, y - hy) < r * 2.5)) mx = Math.max(mx, m); } return { n, deep, share: +(deep / n).toFixed(2), mx: +mx.toFixed(1) }; });
  ok(lake.share > .2 && lake.share < .7 && lake.mx > 12, 'the lake is two to six times deeper in spots (over 7 m in some of it, not all): ' + JSON.stringify(lake));
  ok(!errs.length, 'no page errors' + (errs.length ? ': ' + errs.slice(0, 3).join(' | ') : ''));
  await b.close(); console.log(fails.length ? fails.length + ' failed' : 'all lake wreck checks passed'); process.exit(fails.length ? 1 : 0);
})();
