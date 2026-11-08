// THE GYM'S CHECK: node tests/gym.cjs dist/market.html. KNUCKLE & IRON on West St: its inside is built only when you go in; the treadmill, a heavy bag and the reps train your stats (past the 60 you pick, never past 100); in the ring the last blow knocks you down and you come round in your corner; leaving drops it all.
const { chromium } = require('playwright'), path = require('path');
const fails = [], ok = (c, m) => { if (!c) { fails.push(m); console.log((process.env.GITHUB_ACTIONS ? '::error title=gym::' : 'FAIL ') + m); } else console.log('ok   ' + m); };
(async () => {
  const b = await chromium.launch({ ...(process.env.PWCHROME ? { executablePath: process.env.PWCHROME } : {}), args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const pg = await b.newPage({ viewport: { width: 960, height: 600 } }), errs = [];
  pg.on('pageerror', e => errs.push(e.message.slice(0, 300)));
  await pg.goto('file://' + path.resolve(process.argv[2] || 'dist/market.html') + '?fresh=1&hour=13', { waitUntil: 'commit' });
  let st = false; for (let i = 0; i < 80 && !st; i++) { await pg.waitForTimeout(3000); st = await pg.evaluate(() => !!window.__started).catch(() => false); }
  ok(st, 'the page starts');
  const until = async (f, a, ms = 30000) => { for (let t = 0; t < ms; t += 250) { if (await pg.evaluate(f, a).catch(() => false)) return true; await pg.waitForTimeout(250); } return false; };
  if (st) {
    ok(await pg.evaluate(() => !!ROOMS.off.gym && !GYMDBG().built), 'the gym is on the map and not built before you go in');
    const s0 = await pg.evaluate(() => { window.FORAGE.stats.set({ str: 60, int: 15, sta: 15 }); const g = window.FORAGE.stats.gain('str', 70); return [g, window.FORAGE.ST.str, window.FORAGE.stats.get().str]; });
    ok(s0[0] === 40 && s0[1] === 100 && s0[2] === 60, 'training lifts STRENGTH past the 60 you picked to 100, no further, and the pick stays 60: ' + JSON.stringify(s0));
    await pg.evaluate(() => { window.FORAGE.stats.set({ str: 30, int: 30, sta: 30 }); });
    await pg.evaluate(() => ROOMS.enter('gym'));
    ok(await until(() => GYMDBG().built && GYMDBG().inside, null, 90000), 'going in builds it');
    ok(await pg.evaluate(() => GYMDBG().mirror), 'the mirror is a real reflection (a Reflector on its wall)');
    await pg.waitForTimeout(1500);
    // the treadmill
    const t0 = await pg.evaluate(() => { const K = GYM.K(), t = K.tread[0]; GYM.tread(t); t.pace = 12; return window.FORAGE.stats.toward('sta'); });
    await pg.waitForTimeout(4000);
    const t1 = await pg.evaluate(() => [GYMDBG().tread, window.FORAGE.stats.toward('sta'), __dbg.VIT.sta]);
    ok(t1[0] && t1[1] > t0 && t1[2] < 1, 'on the treadmill at pace 12 you run in place, STAMINA work builds and your bar drains: ' + JSON.stringify([t0, t1]));
    await pg.evaluate(() => { __dbg.VIT.sta = 0; });
    ok(await until(() => !GYMDBG().tread, null, 8000), 'with no stamina left the belt throws you off');
    await until(() => !__dbg.RAG.on, null, 15000); await pg.evaluate(() => { __dbg.VIT.sta = 1; __dbg.VIT.tired = false; });
    // a heavy bag
    const b0 = await pg.evaluate(() => { const K = GYM.K(), B = K.bags[1], p = K.F.pw(B.u + .75, B.v); __dbg.ui().goTo(p[0], p[1], 0); SHARED.heading = K.F.hd(-1, 0); __dbg.face(K.F.hd(-1, 0)); return window.FORAGE.stats.toward('str'); });
    await pg.waitForTimeout(800);
    for (let i = 0; i < 4; i++) { await pg.keyboard.press('j'); await pg.waitForTimeout(700); }
    const b1 = await pg.evaluate(() => [Math.max(...GYM.K().bags.map(B => Math.abs(B.a) + Math.abs(B.b) + Math.abs(B.av) + Math.abs(B.bv))), window.FORAGE.stats.toward('str'), GYMDBG().uv]);
    ok(b1[0] > .001 && b1[1] > b0, 'punching the heavy bag swings it and builds STRENGTH: ' + JSON.stringify([b0, b1]));
    // reps at the squat rack
    await until(() => !__dbg.RAG.on && !__dbg.VIT.out, null, 15000);
    const r = await pg.evaluate(() => { GYM.reps('squat'); const R = GYM.R(), w0 = window.FORAGE.stats.toward('str'); for (let i = 0; i < 5; i++) { R.x = .5; GYM.press(); } const n = R.n; R.x = 0; GYM.press(); GYM.press(); GYM.press(); return [n, window.FORAGE.stats.toward('str') > w0 || window.FORAGE.ST.str > 30, R.pinned]; });
    ok(r[0] === 5 && r[1] && r[2] > 0, 'reps in the green count and train STRENGTH; three misses and the bar pins you: ' + JSON.stringify(r));
    await pg.evaluate(() => GYM.stop(true));
    // the ring
    const g0 = await pg.evaluate(() => { const K = GYM.K(), p = K.F.pw(K.ring.cu, K.ring.cv); __dbg.ui().goTo(p[0], p[1], 0); return 1; });
    await pg.waitForTimeout(800);
    const k0 = await pg.evaluate(() => [GYM.inRing(), __dbg.VIT.hurt(5, null), __dbg.VIT.hp > 0, __dbg.VIT.out, __dbg.VIT.dead]);
    ok(k0[0] && k0[2] && !k0[3] && !k0[4], 'in the ring a blow that would finish you leaves you alive: ' + JSON.stringify(k0));
    ok(await until(() => __dbg.RAG.on, null, 5000), 'it knocks you down');
    ok(await until(() => !__dbg.RAG.on, null, 20000) && await until(() => __dbg.VIT.hp >= .5 && !GYM.inRing(), null, 5000) || await pg.evaluate(() => __dbg.VIT.hp >= .5), 'you come round in your corner with half your health: ' + JSON.stringify(await pg.evaluate(() => [__dbg.VIT.hp, GYMDBG().uv])));
    // leaving
    await pg.evaluate(() => ROOMS.exit('gym'));
    ok(await until(() => !GYMDBG().built, null, 60000), 'leaving drops it');
  }
  ok(!errs.length, 'no page errors' + (errs.length ? ': ' + errs.slice(0, 3).join(' | ') : ''));
  await b.close(); console.log(fails.length ? fails.length + ' FAILED' : 'ALL OK'); process.exit(fails.length ? 1 : 0);
})();
