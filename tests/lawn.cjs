// THE LAWN CHECK: node tests/lawn.cjs dist/market.html. One start on the park lawn: the painted ground, the tall blades (built, standing, swaying in the wind, pressed where you stand).
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
    for (let i = 0; i < 30; i++) { if (await pg.evaluate(() => WEEDS.chunks.size >= 9 && [...WEEDS.chunks.values()].some(m => m && m.I))) break; await pg.waitForTimeout(1000); }   // the chunks round you build a few a second
    const r = await pg.evaluate(() => {
      const o = {}, c = W3.group.position, lc = SHARED.BOD.g.lawnCol(3.3, 7.1), map = __dbg.MAPK.MODS.land && __dbg.MAPK.MODS.land.material.map;
      o.painted = !!(map && map.image && map.image.width > 0 && map.repeat.x > 0); o.col = Array.isArray(lc) && lc.length === 3;
      const M = [...WEEDS.chunks.values()].filter(m => m && m.I); o.chunks = M.length; o.tris = WEEDS.lawnN;
      let spot = null; for (let x = c.x - 16; x < c.x + 16 && !spot; x += .6) for (let z = c.z - 16; z < c.z + 16; z += .6) { const t = WEEDS.top(x, z); if (typeof t === 'number') { spot = [x, z, t]; break; } }
      o.spot = spot; if (spot) o.topUp = spot[2] > 0 && spot[2] < 1.8;
      const sh = WEEDS.shader; o.shader = !!sh && [sh.vertexShader.includes('uSwAt'), sh.vertexShader.includes('uTr'), sh.uniforms.uSwAt && sh.uniforms.uSw && sh.uniforms.uTr ? true : false];
      o.swayT = sh && sh.uniforms.uSw.value; return o;
    });
    await pg.waitForTimeout(700);
    const r2 = await pg.evaluate(() => ({ swayT: WEEDS.shader && WEEDS.shader.uniforms.uSw.value, wind: WEEDS.shader && WEEDS.shader.uniforms.uWk.value }));
    ok(r.painted && r.col, 'the ground under the grass has its lawn texture and lawnCol gives a colour: ' + JSON.stringify([r.painted, r.col]));
    ok(r.chunks > 0 && r.tris > 1000, 'the lawn chunks round you hold the treetop clumps (' + r.chunks + ' chunks, ' + r.tris + ' triangles)');
    ok(r.spot && r.topUp, 'on the lawn the grass top stands over the ground, under head height (' + JSON.stringify(r.spot) + ')');
    ok(r.shader && r.shader.every(Boolean), 'the blades\' shader sways them in the wind (uSwAt, uSw, uWk) and parts them round what walks through (uTr): ' + JSON.stringify(r.shader));
    ok(typeof r2.swayT === 'number' && r2.swayT > r.swayT && r2.wind > 0, 'the wind clock runs and blows (' + JSON.stringify([r.swayT, r2.swayT, r2.wind]) + ')');
    if (r.spot) {   // a second start right on the lawn: a step, then the grass is pressed where you stand
      await pg.goto('file://' + path.resolve(process.argv[2] || 'dist/market.html') + '?fresh=1&hour=13&at=' + r.spot[0].toFixed(1) + ',' + r.spot[1].toFixed(1), { waitUntil: 'commit' });
      let st2 = false; for (let i = 0; i < 60 && !st2; i++) { await pg.waitForTimeout(3000); st2 = await pg.evaluate(() => !!window.__started).catch(() => false); }
      for (let i = 0; i < 20; i++) { if (await pg.evaluate(() => typeof WEEDS.top(W3.group.position.x, W3.group.position.z) === 'number').catch(() => false)) break; await pg.waitForTimeout(1000); }
      await pg.keyboard.down('w'); await pg.waitForTimeout(900); await pg.keyboard.up('w'); await pg.waitForTimeout(400);
      const k = await pg.evaluate(() => { const c = W3.group.position; return WEEDS.top(c.x, c.z) == null ? 'off the lawn' : WEEDS.pressAt(c.x, c.z); });
      ok(typeof k === 'number' && k > 0, 'standing on the lawn, the grass is pressed where you stand after a step (' + k + ')');
    }
  }
  ok(!errs.length, 'no page errors' + (errs.length ? ': ' + errs.join(' | ') : ''));
  await b.close(); console.log(fails.length ? fails.length + ' failed' : 'all lawn checks passed'); process.exit(fails.length ? 1 : 0);
})();
