// THE LAWN CHECK: node tests/lawn.cjs dist/market.html. One start on the park lawn: the painted ground, the grass field (its floors painted with blades, built once, still).
const { chromium } = require('playwright'), path = require('path');
const fails = [], ok = (c, m) => { if (!c) { fails.push(m); console.log((process.env.GITHUB_ACTIONS ? '::error title=lawn::' : 'FAIL ') + m); } else console.log('ok   ' + m); };
(async () => {
  const b = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const pg = await b.newPage(), errs = [];
  pg.on('pageerror', e => errs.push(e.message.slice(0, 300)));
  await pg.goto('file://' + path.resolve(process.argv[2] || 'dist/market.html') + '?fresh=1&hour=13&at=40,150', { waitUntil: 'commit' });
  let st = false; for (let i = 0; i < 60 && !st; i++) { await pg.waitForTimeout(3000); st = await pg.evaluate(() => !!window.__started).catch(() => false); }
  ok(st, 'the page starts in the park');
  if (st) {
    for (let i = 0; i < 40; i++) { const busy = await pg.evaluate(() => !!(window.FADE && FADE.busy)).catch(() => true); if (!busy && i > 3) break; await pg.waitForTimeout(1000); }
    for (let i = 0; i < 40; i++) { if (await pg.evaluate(() => WEEDS.chunks.size >= 9 && [...WEEDS.chunks.values()].some(m => m && m.I) && GRASS.chunks.size > 0)) break; await pg.waitForTimeout(1000); }   // the chunks you can see build at once, the ring past them a few a second
    const r = await pg.evaluate(() => {
      const o = {}, c = W3.group.position, lc = SHARED.BOD.g.lawnCol(3.3, 7.1), map = __dbg.MAPK.MODS.land && __dbg.MAPK.MODS.land.material.map;
      o.painted = !!(map && map.image && map.image.width > 0 && map.repeat.x > 0); o.col = Array.isArray(lc) && lc.length === 3;
      const M = [...WEEDS.chunks.values()].filter(m => m && m.I); o.chunks = M.length; o.tris = WEEDS.lawnN;
      let spot = null; for (let x = c.x - 16; x < c.x + 16 && !spot; x += .6) for (let z = c.z - 16; z < c.z + 16; z += .6) { const t = WEEDS.top(x, z); if (typeof t === 'number') { spot = [x, z, t]; break; } }
      o.spot = spot; if (spot) o.topUp = spot[2] > 0 && spot[2] < 1.8;
      o.floors = GRASS.chunks.size; o.blades = [...GRASS.chunks.values()].filter(g => g && g.blades).length;
      const CS = 8 * __dbg.cv().TILE, pcx = Math.floor(c.x / CS), pcz = Math.floor(c.z / CS); o.missing = 0; for (let j = -2; j <= 2; j++) for (let i = -2; i <= 2; i++) if (!WEEDS.chunks.has((pcx + i) + ',' + (pcz + j))) o.missing++; const U = GRASS.U; o.shader = [U.uSunOn != null, !U.uTime && !U.uWindStrength];
      return o;
    });
    await pg.waitForTimeout(700);
    for (let i = 0; i < 30; i++) { if (await pg.evaluate(() => GRASS.baked > 0)) break; await pg.waitForTimeout(1000); }
    const bk = await pg.evaluate(() => ({ baked: GRASS.baked, on: GRASS.U.uBakeOn.value, held: !CLOCK.run || CLOCK.shadeH != null, tex: !!GRASS.U.uGTex.value }));
    ok(bk.baked > 0 && bk.on === 1 && bk.held && bk.tex, 'the still things\' shadows are baked into the grass, the sun\'s shadow direction held, the floor painted with blades: ' + JSON.stringify(bk));
    ok(r.painted && r.col, 'the ground under the grass has its lawn texture and lawnCol gives a colour: ' + JSON.stringify([r.painted, r.col]));
    ok(r.chunks > 0 && r.floors > 0 && r.blades === 0, 'the lawn chunks round you hold the grass field, painted floors only, no blades drawn (' + r.chunks + ' chunks, ' + r.floors + ' floors, ' + r.blades + ' with blades)');
    ok(!r.missing, 'every lawn chunk that can be on screen is built (' + r.missing + ' missing)');
    ok(r.spot && r.topUp, 'on the lawn the grass top stands over the ground, under head height (' + JSON.stringify(r.spot) + ')');
    ok(r.shader && r.shader.every(Boolean), 'the grass is baked and still (no wind), shadowed only while the sun is up (uSunOn): ' + JSON.stringify(r.shader));
  }
  ok(!errs.length, 'no page errors' + (errs.length ? ': ' + errs.join(' | ') : ''));
  await b.close(); console.log(fails.length ? fails.length + ' failed' : 'all lawn checks passed'); process.exit(fails.length ? 1 : 0);
})();
