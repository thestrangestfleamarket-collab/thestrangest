// THE LANYARD STRING: node tests/lanyard.cjs dist/market.html [shot-prefix]. The passport's strands and badge hang as a string (LANYARD, 111bb): they fall under gravity from the neck, swing when you move and settle when you stop, and stay outside what you wear.
const { chromium } = require('playwright'), path = require('path');
const fails = [], ok = (c, m) => { if (!c) { fails.push(m); console.log((process.env.GITHUB_ACTIONS ? '::error title=lanyard::' : 'FAIL ') + m); } else console.log('ok   ' + m); };
(async () => {
  const b = await chromium.launch({ ...(process.env.PWEXE ? { executablePath: process.env.PWEXE } : {}), args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const pg = await b.newPage({ viewport: { width: 800, height: 600 } }), errs = [];
  pg.on('pageerror', e => errs.push(e.message.slice(0, 300)));
  await pg.goto('file://' + path.resolve(process.argv[2] || 'dist/market.html') + '?fresh=1&hour=12&res=0&at=40,150', { waitUntil: 'commit' });
  let st = false; for (let i = 0; i < 60 && !st; i++) { await pg.waitForTimeout(3000); st = await pg.evaluate(() => !!window.__started).catch(() => false); }
  ok(st, 'the page starts');
  if (st) {
    await pg.evaluate(async () => { if (window.WX) WX.hold = 'CLEAR'; __dbg.UI.setView('third'); if (!PASSPORT.worn) PASSPORT.wear(true); });
    const live = await pg.waitForFunction(() => LANYARD.live().length > 0 && LANYARD.live()[0].on, null, { timeout: 60000 }).then(() => true).catch(() => false);
    ok(live, 'your passport hangs on a string');
    const snap = () => pg.evaluate(() => { const s = LANYARD.live()[0], X = s.X, n = X.length / 3, pts = []; for (let i = 0; i < n; i++)pts.push([X[i * 3], X[i * 3 + 1], X[i * 3 + 2]]); return pts; });
    await pg.waitForTimeout(3000);
    const a = await snap();
    const foot = a[a.length - 1], clip = a[a.length - 2];
    ok(foot[1] < clip[1], 'the badge hangs below its clip (' + (clip[1] - foot[1]).toFixed(3) + ')');
    const footP = () => pg.evaluate(() => LANYARD.live()[0].foot().toArray());
    const worldP = () => pg.evaluate(() => { const X = LANYARD.live()[0].X, n = X.length / 3; return [[X[0], X[1], X[2]], [X[(n - 1) * 3], X[(n - 1) * 3 + 1], X[(n - 1) * 3 + 2]]]; });
    const wspread = async () => { const P = []; for (let i = 0; i < 12; i++) { await pg.waitForTimeout(150); P.push(await worldP()); } const sp = j => { let m = 0; for (const p of P)for (const q of P)m = Math.max(m, Math.hypot(p[j][0] - q[j][0], p[j][1] - q[j][1], p[j][2] - q[j][2])); return m; }; return [sp(0), sp(1)]; };
    const spread = async (ms, act) => { const P = []; for (let i = 0; i < 12; i++) { if (act && i === 1) await act(); await pg.waitForTimeout(ms); P.push(await footP()); } let m = 0; for (const p of P)for (const q of P)m = Math.max(m, Math.hypot(p[0] - q[0], p[1] - q[1], p[2] - q[2])); return m; };
    const m = await spread(80, () => pg.evaluate(() => { SHARED.heading += 2.2; SHARED.headingTo = SHARED.heading; }).then(() => pg.keyboard.press('Space')));
    let ws = [1, 1]; for (let i = 0; i < 20 && ws[0] > .005; i++)ws = await wspread();   // (till you stand still)
    await pg.waitForFunction(n => LANYARD.live()[0].n > n + 300, await pg.evaluate(() => LANYARD.live()[0].n), { timeout: 300000, polling: 500 }).catch(() => {});
    const r = await spread(150); ws = await wspread(); console.log('     standing, the pin moves', ws[0].toFixed(4), 'and the badge', ws[1].toFixed(4));
    ok(m > .05 && r < .02 && r < m / 10, 'it swings when you turn and jump, and hangs still when you stand (the badge moves ' + m.toFixed(4) + ' on the chest, then ' + r.toFixed(4) + ')');
    const fin = await pg.evaluate(() => { const s = LANYARD.live()[0]; return [...s.X].every(Number.isFinite); });
    ok(fin, 'every point of it is a real place (no NaN)');
    if (process.argv[3]) {
      await pg.evaluate(() => { for (const e of document.body.children) if (!e.querySelector('canvas') && e.tagName !== 'CANVAS') e.style.visibility = 'hidden'; });   // (the HUD out of the picture)
      for (const [nm, y] of [['front', 0]]) {
        await pg.evaluate(y => { const U = __dbg.UI; U.distTo = Math.max(.5, (U.dist || 3) * .25); SHARED.yawTo = SHARED.heading + y; SHARED.pitchTo = .1; }, y); await pg.waitForTimeout(1800);
        await pg.screenshot({ path: process.argv[3] + '-' + nm + '.png', clip: { x: 200, y: 150, width: 400, height: 450 } }); }
    }
    const err = await pg.evaluate(() => Object.entries(SYS.P).flatMap(([k, v]) => v.filter(s => s.err).map(s => k + ':' + s.name)));
    ok(!err.length, 'no SYS errors (' + err.join(',') + ')');
  }
  ok(!errs.length, 'no page errors (' + errs.slice(0, 3).join(' | ') + ')');
  await b.close(); console.log(fails.length ? fails.length + ' failed' : 'all ok'); process.exit(fails.length ? 1 : 0);
})();
