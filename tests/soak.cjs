// THE SOAK: node tests/soak.cjs dist/market.html [n] [simSeconds]. Scatters n extra pawns (default 100) over the walkable map, lets them roam, and
// reports every one that breaks an invariant (NaN, out of bounds, inside a solid, no ground, stuck with a target), any system that threw, and the
// frame time under the load. Manual (not in CI): slow under software rendering.
const { chromium } = require('playwright'), path = require('path');
const N = +process.argv[3] || 100, SIM = +process.argv[4] || 90, WALL = 9 * 60e3;
const fails = [], ok = (c, m) => { if (!c) { fails.push(m); console.log('FAIL ' + m); } else console.log('ok   ' + m); };
(async () => {
  const b = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const pg = await b.newPage(), errs = []; await pg.setViewportSize({ width: 640, height: 360 });
  pg.on('pageerror', e => errs.push(e.message.slice(0, 300)));
  await pg.goto('file://' + path.resolve(process.argv[2] || 'dist/market.html') + '?fresh=1&hour=13&at=53,10', { waitUntil: 'commit' });
  let st = false; for (let i = 0; i < 60 && !st; i++) { await pg.waitForTimeout(3000); st = await pg.evaluate(() => !!window.__started).catch(() => false); }
  ok(st, 'the page starts');
  if (st) {
    await pg.waitForTimeout(3000);
    const t0 = Date.now(), made = await pg.evaluate(n => { window.__fr = []; let last = performance.now(); (function f(t) { window.__fr.push(t - last); last = t; requestAnimationFrame(f); })(last); return PAWNSOAK(n); }, N);
    console.log('     spawned ' + made + ' pawns in ' + (Date.now() - t0) + ' ms');
    ok(made === N, N + ' soak pawns scattered on free ground (' + made + ')');
    let r = null, w0 = Date.now();
    while (Date.now() - w0 < WALL) { await pg.waitForTimeout(5000); r = await pg.evaluate(() => PAWNSOAKDBG()); process.stdout.write('     sim ' + r.simT + 's, moved ' + r.moved + '/' + r.n + ', bad ' + r.bad.length + '\r'); if (r.simT >= SIM) break; }
    console.log();
    const fr = await pg.evaluate(() => { const a = window.__fr.slice(10).sort((x, y) => x - y); return { n: a.length, med: a[a.length >> 1], p95: a[Math.floor(a.length * .95)] }; });
    console.log('     frames: ' + fr.n + ', median ' + fr.med.toFixed(0) + ' ms, p95 ' + fr.p95.toFixed(0) + ' ms (software rendering; relative, not absolute)');
    const hard = r.bad.filter(x => x.why.some(w => w !== 'stuck' && !w.startsWith('stuck'))), stuck = r.bad.filter(x => x.why.some(w => w.startsWith('stuck')));
    ok(r.simT >= SIM * .5, 'the soak ran ' + r.simT + ' s of sim time (wanted ' + SIM + ')');
    const boxed = r.still.filter(x => x.exits === 0), noTick = r.still.filter(x => !x.ticks && x.far), other = r.still.filter(x => x.exits > 0 && (x.ticks || !x.far));
    ok(!noTick.length, 'every far pawn ticked (' + noTick.length + ' never did)');
    ok(!boxed.length, 'no pawn stands in a pocket it cannot walk out of (0 free exits at 3 tiles)' + (boxed.length ? ':\n' + boxed.map(x => '       ' + x.key + ' at ' + x.x + ',' + x.z).join('\n') : ''));
    ok(other.length <= r.n * .2, other.length + ' pawns ticked and had exits but never moved in ' + r.simT + ' s (allowed up to 20%)' + (other.length ? ':\n' + other.slice(0, 12).map(x => '       ' + x.key + ' at ' + x.x + ',' + x.z + ' exits ' + x.exits + (x.toSeen ? ', picked targets' : ', never picked a target') + ', wait ' + x.wait).join('\n') : ''));
    console.log('     moved ' + r.moved + '/' + r.n + ' (' + r.still.length + ' still: ' + boxed.length + ' boxed in, ' + noTick.length + ' never ticked, ' + other.length + ' other)');
    ok(!hard.length, 'no pawn is NaN, out of bounds, inside a solid or without ground' + (hard.length ? ':\n' + hard.map(x => '       ' + x.key + ' at ' + x.x + ',' + x.z + (x.far ? ' (far)' : '') + ': ' + x.why.join(', ')).join('\n') : ''));
    ok(stuck.length <= r.n * .1, stuck.length + ' pawns stuck > 25 s with a target (allowed up to 10%)' + (stuck.length ? ':\n' + stuck.slice(0, 15).map(x => '       ' + x.key + ' at ' + x.x + ',' + x.z + (x.far ? ' (far)' : '') + ': ' + x.why.join(', ')).join('\n') : ''));
    ok(!r.errs.length, 'no system has thrown' + (r.errs.length ? ': ' + r.errs.join(', ') : ''));
  }
  ok(!errs.length, 'no page errors' + (errs.length ? ': ' + errs.slice(0, 3).join(' | ') : ''));
  await b.close(); console.log(fails.length ? fails.length + ' failed' : 'all soak checks passed'); process.exit(fails.length ? 1 : 0);
})();
