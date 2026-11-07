// THE BANK CHECK: node tests/bank.cjs dist/market.html. The bank's big door, the hoard made when you go in, the dragon waking as you come near and sleeping again when you leave.
const { chromium } = require('playwright'), path = require('path');
const fails = [], ok = (c, m) => { if (!c) { fails.push(m); console.log((process.env.GITHUB_ACTIONS ? '::error title=bank::' : 'FAIL ') + m); } else console.log('ok   ' + m); };
(async () => {
  const b = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const pg = await b.newPage({ viewport: { width: 640, height: 400 } }), errs = [];
  pg.on('pageerror', e => errs.push(e.message.slice(0, 300)));
  await pg.goto('file://' + path.resolve(process.argv[2] || 'dist/market.html') + '?fresh=1&hour=13', { waitUntil: 'commit' });
  await pg.waitForFunction(() => window.__started && STORE.inside && STORE.inside.bank && STORE.bank, null, { timeout: 300000, polling: 500 });
  const d0 = await pg.evaluate(() => { const D = STORE.inside.bank.door; return { wd: D.wd, h: D.h, pic: typeof D.pic, hoard: !!STORE.bank.hoard }; });
  ok(d0.wd >= 4 && d0.h >= 140 && d0.pic === 'function' && !d0.hoard, 'the bank has a big painted vault door, and nothing of the hoard is made before you go in: ' + JSON.stringify(d0));
  await pg.waitForFunction(() => window.PFROWDBG && PFROWDBG().done && STORE.streetDoor && STORE.streetDoor.bank, null, { timeout: 300000, polling: 500 });
  const fp = await pg.evaluate(() => { const T = __dbg.THREE, box = id => { const f = PFROW.fronts.find(f => f.id === id); return f && new T.Box3().setFromObject(f.obj); }, b = box('bank'), a = box('art'), L = STORE.bank.lot, X = SHARED.BOD.X, Z = SHARED.BOD.Z, M = __dbg.cv().TILE / .84, r = v => +(v / M).toFixed(2);
    const lx0 = Math.min(X(L.x0), X(L.x1)), lx1 = Math.max(X(L.x0), X(L.x1)), lz0 = Math.min(Z(L.y0), Z(L.y1)), lz1 = Math.max(Z(L.y0), Z(L.y1));
    return { bank: b && [b.min.x, b.max.x, b.min.z, b.max.z].map(r), lot: [lx0, lx1, lz0, lz1].map(r), art: a && [a.min.x, a.max.x].map(r), inLot: !!b && b.min.x >= lx0 - .3 * M && b.max.x <= lx1 + .3 * M && b.min.z >= lz0 - .3 * M && b.max.z <= lz1 + .3 * M, apart: !!b && !!a && b.max.x <= a.min.x, off: STORE.bank.B.x1 < L.x0 - 50 || STORE.bank.B.x0 > L.x1 + 50 }; });
  ok(fp.inLot && fp.apart && fp.off, 'the bank is a Polyfork building inside its own lot, clear of the art museum\'s, its inside off the map: ' + JSON.stringify(fp));
  await pg.evaluate(() => STORE.enter('bank', true)); await pg.waitForFunction(() => STORE.bank.hoard && !FADE.busy, null, { timeout: 300000, polling: 500 });
  const at = (k) => pg.evaluate(k => { const B = STORE.bank.B, X = SHARED.BOD.X, Z = SHARED.BOD.Z, T = __dbg.cv().TILE; __dbg.UI.goTo(X((B.x0 + B.x1) / 2) + 2.6 * T, k ? Z(B.y0) + 8.6 * T : Z(B.y1) - T, 'up'); }, k);
  const st = () => pg.evaluate(() => STORE.bank.dragon());
  const s0 = await st(); await at(1); await pg.waitForTimeout(3000); const s1 = await st(); await at(0); await pg.waitForTimeout(9000); const s2 = await st();
  ok(!s0.awake && s1.awake && s1.W > 0 && !s2.awake, 'the dragon sleeps, wakes as you come near its head, and sleeps again after you leave: ' + JSON.stringify({ s0, s1, s2 }));
  await pg.evaluate(() => STORE.exit('bank')); await pg.waitForTimeout(3000); await pg.waitForFunction(() => !FADE.busy, null, { timeout: 120000 });
  await pg.evaluate(() => { const o = STORE.streetDoor.bank.out; __dbg.UI.goTo(SHARED.BOD.X(o[0]), SHARED.BOD.Z(o[1]), 'up'); }); await pg.waitForTimeout(3000);
  const o = await pg.evaluate(() => { const h = STORE.bank.hoard; let on = !!h; for (let q = h; q && on; q = q.parent) { if (!q.visible) on = false; if (!q.parent && q.type !== 'Scene') on = false; } return { hoard: on, dropped: !!h && !h.parent, p: __dbg.pos().map(v => +v.toFixed(1)), why: h ? VIS.why(h) : [], lvl: SHARED.LVL, dead: __dbg.VIT.dead }; });   // drawn = in the scene with every parent shown (dropped once you leave, 3 Nov 2026)
  ok(!o.hoard, 'back on the street, nothing of the bank\'s inside is drawn: ' + JSON.stringify(o));
  const vn = await pg.evaluate(() => VAULT.near()); ok(vn, 'by the bank\'s door on Market St, saying BANK opens your vault: ' + vn);
  await pg.evaluate(() => STORE.enter('bank', true)); await pg.waitForTimeout(2000); await pg.waitForFunction(() => !FADE.busy, null, { timeout: 120000 }); await at(1); await pg.waitForTimeout(1500); const g0 = await pg.evaluate(() => { const c = INV.cash; STORE.bank.steal(); return c; }); await pg.waitForTimeout(4000);
  const fr = await pg.evaluate(() => ({ dead: __dbg.VIT.dead, cash: INV.cash, d: STORE.bank.dragon(), p: __dbg.pos().map(v => +v.toFixed(1)) }));
  ok(fr.dead && fr.cash === g0, 'taking its gold, the dragon breathes fire and burns you up; the gold falls back: ' + JSON.stringify(fr));
  ok(!errs.length, 'no page errors' + (errs.length ? ': ' + errs.slice(0, 3).join(' | ') : ''));
  await b.close(); console.log(fails.length ? fails.length + ' failed' : 'all bank checks passed'); process.exit(fails.length ? 1 : 0);
})();
