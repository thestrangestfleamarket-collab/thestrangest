// THE AIM CHECK: node tests/aim.cjs dist/market.html [shots-prefix]. A held thing points exactly at the spot under the mouse, and he turns to face it (146a-wield).
const { chromium } = require('playwright'), path = require('path');
const fails = [], ok = (c, m) => { if (!c) { fails.push(m); console.log((process.env.GITHUB_ACTIONS ? '::error title=aim::' : 'FAIL ') + m); } else console.log('ok   ' + m); };
(async () => {
  const b = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'], ...(process.env.PW_CHROMIUM ? { executablePath: process.env.PW_CHROMIUM } : {}) });
  const pg = await b.newPage({ viewport: { width: 960, height: 600 } }), errs = [], shots = process.argv[3];
  pg.on('pageerror', e => errs.push(e.message.slice(0, 300)));
  await pg.goto('file://' + path.resolve(process.argv[2] || 'dist/market.html') + '?fresh=1&hour=13&res=0&at=40,150', { waitUntil: 'commit' });
  let st = false; for (let i = 0; i < 60 && !st; i++) { await pg.waitForTimeout(3000); st = await pg.evaluate(() => !!window.__started).catch(() => false); }
  ok(st, 'the page starts');
  if (st) {
    await pg.waitForTimeout(4000);
    await pg.evaluate(() => { const L = document.getElementById('loading'); if (L) L.remove(); if (window.WX) WX.hold = 'CLEAR'; __dbg.UI.setView('third'); WIELD.set('flamer');
      const R = __dbg.THREE.Raycaster.prototype, f = R.intersectObjects; window.__rc = { n: 0, ms: 0 }; R.intersectObjects = function (...a) { const t = performance.now(), r = f.apply(this, a); __rc.n++; __rc.ms += performance.now() - t; return r; }; });
    const fps = await pg.evaluate(() => new Promise(r => { let n = 0; const t0 = performance.now(), f = () => { n++; if (performance.now() - t0 < 2000) requestAnimationFrame(f); else r(n / 2); }; requestAnimationFrame(f); })); console.log('frames a second here:', fps);
    for (const [x, y] of [[700, 420], [330, 330], [480, 150], [620, 250]]) {
      await pg.mouse.move(x, y); await pg.waitForTimeout(1500);
      let r; for (let t = 0; t < 20000; t += 1000) { r = await pg.evaluate(() => { const P = WIELD.pt; if (!P) return null; let m = null; __dbg.scene.traverse(o => { if (o.userData.anyRoom && o.visible && !o.matrixAutoUpdate && o.matrix) m = o; });
        if (!m) return { noMesh: 1 }; const e = m.matrix.elements, ax = new __dbg.THREE.Vector3(e[4], e[5], e[6]).normalize(), base = new __dbg.THREE.Vector3(e[12], e[13], e[14]), want = P.clone().sub(base).normalize(), you = __dbg.you();
        let dh = Math.atan2(P.x - you.x, P.z - you.z) - SHARED.heading; dh = Math.atan2(Math.sin(dh), Math.cos(dh));
        return { off: +(ax.angleTo(want) * 180 / Math.PI).toFixed(2), face: +(Math.abs(dh) * 180 / Math.PI).toFixed(1), d: +Math.hypot(P.x - you.x, P.z - you.z).toFixed(2), f: WIELD.face, mv: __dbg.ST.move && __dbg.ST.move.name }; }); if (r && r.face < 5) break; await pg.waitForTimeout(1000); }
      ok(r && r.off < 2, 'the tool points at the spot under the mouse at ' + x + ',' + y + ' (' + JSON.stringify(r) + ')');
      ok(r && r.face < 5, 'he faces the spot (' + JSON.stringify(r) + ')');
      if (shots) await pg.screenshot({ path: shots + '-' + x + '-' + y + '.png' });
    }
    const c = await pg.evaluate(() => { const n0 = __rc.n, m0 = __rc.ms; return new Promise(res => setTimeout(() => res({ calls: __rc.n - n0, msPerSec: +(__rc.ms - m0).toFixed(1) }), 4000)); });
    console.log('pick cost over 4 s (mouse still, software rendering):', JSON.stringify(c));
    const mv = await pg.evaluate(() => { __rc.n = 0; __rc.ms = 0; return 0; }); for (let i = 0; i < 20; i++) { await pg.mouse.move(300 + i * 20, 200 + i * 8); await pg.waitForTimeout(200); }
    console.log('pick cost over 4 s, mouse moving:', await pg.evaluate(() => JSON.stringify({ calls: __rc.n, msPerSec: +(__rc.ms / 4).toFixed(1), msEach: +(__rc.ms / Math.max(1, __rc.n)).toFixed(2) })));
  }
  ok(!errs.length, 'no page errors (' + errs.join(' | ') + ')');
  await b.close(); process.exit(fails.length ? 1 : 0);
})();
