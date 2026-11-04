// THE GREENS CHECK: node tests/greens.cjs dist/market.html [folder for a screenshot]. The holodeck lists THE GREENS; RUN takes $6 and fades you to the zen garden
// off the map with the putter in hand and the ball on the tee; a putt rolls the ball and it comes to rest inside the rails with a stroke counted; a slow ball
// at the cup drops (a hole in one pays and is the best); the stroke limit ends a hole at par+3 with par+4 written and the ball comes back to the tee; END PROGRAM fades you back.
const { chromium } = require('playwright'), path = require('path'), fs = require('fs');
const fails = [], ok = (c, m) => { if (!c) { fails.push(m); console.log((process.env.GITHUB_ACTIONS ? '::error title=greens::' : 'FAIL ') + m); } else console.log('ok   ' + m); };
(async () => {
  const b = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const pg = await b.newPage({ viewport: { width: 960, height: 600 } }), errs = [];
  pg.on('pageerror', e => errs.push(e.message.slice(0, 300)));
  await pg.goto('file://' + path.resolve(process.argv[2] || 'dist/market.html') + '?fresh=1&hour=13&res=1', { waitUntil: 'commit' });
  await pg.waitForFunction(() => window.__started, null, { timeout: 300000 });
  const wait = (f, a, t = 180000) => pg.waitForFunction(f, a, { timeout: t, polling: 200 });
  await pg.waitForTimeout(12000); await wait(() => !FADE.busy).catch(() => {});
  for (let k = 0; k < 4; k++) { await pg.evaluate(() => { if (!ARCDBG().built && !FADE.busy) ROOMS.enter('arcade'); }); if (await wait(() => ARCDBG().built && !FADE.busy, null, 60000).then(() => 1, () => 0)) break; }
  const r1 = await pg.evaluate(() => ({ programs: ARCDBG().holo.programs, putter: !!ITEMS.def('putter'), golf: !!(FORAGE.SK || []).find(s => s[0] === 'golf') }));
  ok(r1.programs.includes('THE GREENS') && r1.putter && r1.golf, 'THE GREENS is on the holodeck panel; the putter is an item, GOLF a skill: ' + JSON.stringify(r1));
  const c1 = await pg.evaluate(async () => { const H = STORE.holo, P = H.programs.find(p => p.name === 'THE GREENS'); INV.cash = 50; H.start(P);
    const U = async (f, ms = 90000) => { for (const t = Date.now(); Date.now() - t < ms; await new Promise(r => setTimeout(r, 150))) if (f()) return true; return false; };
    const w1 = await U(() => GREENSDBG().ready && ROOMS.offIn && ROOMS.offIn() === 'greens' && !FADE.busy); await new Promise(r => setTimeout(r, 800));
    const d = GREENSDBG(), tee = GREENS.tee; return { cash: INV.cash, w1, ...d, atTee: Math.hypot(d.ball[0] - tee.x, d.ball[1] - tee.z) < .01, card: !!document.getElementById('greensc') && !document.getElementById('greensc').hidden, run: ARCDBG().holo.run }; });
  ok(c1.cash === 44 && c1.w1 && c1.built && c1.meshes > 20 && c1.atTee && c1.rest && c1.strokes === 0 && c1.tool === 'putter' && c1.card && c1.run === 'THE GREENS',
    'RUN takes $6, fades to the garden off the map, the putter in hand, the ball on the tee, the card up: ' + JSON.stringify(c1));
  const OUT = process.argv[3]; if (OUT) { fs.mkdirSync(OUT, { recursive: true }); await pg.evaluate(() => { GREENS.warp(); if (__dbg.UI.setView) __dbg.UI.setView('follow'); }); await pg.waitForTimeout(2500); await pg.screenshot({ path: path.join(OUT, 'greens.png'), timeout: 180000 }); console.log('shot ' + path.join(OUT, 'greens.png')); }
  const c2 = await pg.evaluate(async () => { const U = async (f, ms = 60000) => { for (const t = Date.now(); Date.now() - t < ms; await new Promise(r => setTimeout(r, 150))) if (f()) return true; return false; };
    const b0 = GREENSDBG().ball; const went = GREENS.putt(Math.PI / 2, 2.6); const moving = await U(() => !GREENSDBG().rest, 5000); const rested = await U(() => GREENSDBG().rest, 40000); const d = GREENSDBG();
    return { went, moving, rested, moved: Math.hypot(d.ball[0] - b0[0], d.ball[1] - b0[1]), x: d.ball[0], strokes: d.strokes, inCup: d.inCup }; });
  ok(c2.went && c2.moving && c2.rested && c2.moved > .2 && Math.abs(c2.x) < .45 && c2.strokes === 1 && !c2.inCup, 'a hard putt sideways rolls the ball off the rail and it rests inside the lane, one stroke counted: ' + JSON.stringify(c2));
  const c3 = await pg.evaluate(async () => { const U = async (f, ms = 60000) => { for (const t = Date.now(); Date.now() - t < ms; await new Promise(r => setTimeout(r, 150))) if (f()) return true; return false; };
    const C = GREENS.cup; GREENS.place(C.x - C.tx * .5, C.z - C.tz * .5); const a = GREENS.toCup().ang; const sk0 = FORAGE.sk('golf'), cash0 = INV.cash; GREENS.putt(a, 1.1);
    const holed = await U(() => GREENSDBG().inCup, 20000); const d1 = GREENSDBG(); const back = await U(() => GREENSDBG().strokes === 0 && !GREENSDBG().done && GREENSDBG().rest, 20000); const d2 = GREENSDBG(), tee = GREENS.tee;
    return { holed, strokesAtHole: d1.strokes, done: d1.done, best: d2.best, rounds: d2.rounds, back, atTee: Math.hypot(d2.ball[0] - tee.x, d2.ball[1] - tee.z) < .01, paid: INV.cash - cash0, sk: FORAGE.sk('golf') >= sk0 }; });
  ok(c3.holed && c3.strokesAtHole === 2 && c3.done && c3.best === 2 && c3.rounds === 1 && c3.back && c3.atTee && c3.paid === 0 && c3.sk, 'a slow ball at the cup drops: par, the round written as the best, the ball back on the tee: ' + JSON.stringify(c3));
  const c4 = await pg.evaluate(async () => { const U = async (f, ms = 60000) => { for (const t = Date.now(); Date.now() - t < ms; await new Promise(r => setTimeout(r, 150))) if (f()) return true; return false; };
    for (let i = 0; i < 5; i++) { GREENS.putt(Math.PI + (i % 2 ? .3 : -.3), .4); await U(() => !GREENSDBG().rest, 3000); await U(() => GREENSDBG().rest, 20000); if (GREENSDBG().done) break; }
    const d1 = GREENSDBG(); const back = await U(() => GREENSDBG().strokes === 0 && !GREENSDBG().done, 20000); const d2 = GREENSDBG(); return { strokes: d1.strokes, done: d1.done, inCup: d1.inCup, best: d2.best, rounds: d2.rounds, back }; });
  ok(c4.strokes === 5 && c4.done && !c4.inCup && c4.best === 2 && c4.rounds === 2 && c4.back, 'the stroke limit: the fifth stroke ends the hole (par+4 written), the best stays, the ball comes back: ' + JSON.stringify(c4));
  const c45 = await pg.evaluate(async () => { const U = async (f, ms = 60000) => { for (const t = Date.now(); Date.now() - t < ms; await new Promise(r => setTimeout(r, 150))) if (f()) return true; return false; };
    await U(() => GREENSDBG().rest && !GREENSDBG().done, 20000); const b0 = GREENSDBG().ball, s0 = GREENSDBG().strokes;
    // a stand-in pad: d-pad left walks you to the ball, RT held and let go putts, d-pad down takes it back
    const pad = { id: 'test pad', connected: true, mapping: 'standard', index: 0, timestamp: 0, axes: [0, 0, 0, 0], buttons: Array.from({ length: 17 }, () => ({ value: 0, pressed: false })) };
    const real = navigator.getGamepads; navigator.getGamepads = () => [pad]; const press = async (i, v, ms = 300) => { pad.buttons[i] = { value: v, pressed: v > .5 }; await new Promise(r => setTimeout(r, ms)); };
    await press(14, 1); await press(14, 0); const addr = await U(() => GREENSDBG().addr, 5000);
    await press(7, 1, 700); await press(7, 0); const moved = await U(() => !GREENSDBG().rest, 5000); await U(() => GREENSDBG().rest, 20000); const s1 = GREENSDBG().strokes, b1 = GREENSDBG().ball;
    await press(13, 1); await press(13, 0); const d = GREENSDBG(); navigator.getGamepads = real;
    return { addr, moved, s0, s1, back: d.strokes === s0 && Math.hypot(d.ball[0] - b0[0], d.ball[1] - b0[1]) < .01, ball: d.ball, b0, b1 }; });
  ok(c45.addr && c45.moved && c45.s1 === c45.s0 + 1 && c45.back, 'on a pad: d-pad left addresses the ball, RT held and let go putts, d-pad down takes the putt back (ball and stroke count as they were): ' + JSON.stringify(c45));
  const c5 = await pg.evaluate(async () => { const U = async (f, ms = 60000) => { for (const t = Date.now(); Date.now() - t < ms; await new Promise(r => setTimeout(r, 150))) if (f()) return true; return false; };
    STORE.holo.end(); const back = await U(() => !ARCDBG().holo.run && ROOMS.offIn && ROOMS.offIn() === 'arcade' && !FADE.busy, 60000); await new Promise(r => setTimeout(r, 500)); const d = GREENSDBG();
    return { back, on: d.on, built: d.built, card: !!document.getElementById('greensc') && !document.getElementById('greensc').hidden, saved: d.saved }; });
  ok(c5.back && !c5.on && !c5.built && !c5.card && c5.saved.best && c5.saved.best.zen === 2 && c5.saved.rounds === 2, 'END PROGRAM fades you back into the holodeck, the garden dropped, the card gone, the best kept: ' + JSON.stringify(c5));
  const c6 = await pg.evaluate(async () => { const U = async (f, ms = 90000) => { for (const t = Date.now(); Date.now() - t < ms; await new Promise(r => setTimeout(r, 150))) if (f()) return true; return false; };
    const H = STORE.holo; INV.cash = 50; H.start(H.programs.find(p => p.name === 'THE GREENS')); const inn = await U(() => GREENSDBG().ready && ROOMS.offIn && ROOMS.offIn() === 'greens' && !FADE.busy);
    ROOMS.enter('arcade'); const out = await U(() => ROOMS.offIn && ROOMS.offIn() === 'arcade' && !FADE.busy); await U(() => !ARCDBG().holo.run, 30000); await new Promise(r => setTimeout(r, 500));
    const c = document.getElementById('greensc'); H.menu(); const hp = document.getElementById('holog'), off = [...hp.querySelectorAll('button[data-run]')].filter(b => b.disabled).length; H.hide();
    return { inn, out, run: ARCDBG().holo.run, on: GREENSDBG().on, built: GREENSDBG().built, card: !!c && !c.hidden, disabled: off, tool: WIELD.on }; });
  ok(c6.inn && c6.out && !c6.run && !c6.on && !c6.built && !c6.card && c6.disabled === 0, 'leaving the garden any other way (straight to the arcade) ends the program: the card goes and every RUN is open again: ' + JSON.stringify(c6));
  ok(!errs.length, 'no page errors ' + errs.join(' | '));
  await b.close(); console.log(fails.length ? fails.length + ' FAILED' : 'all good'); process.exit(fails.length ? 1 : 0);
})().catch(e => { console.log('FAIL ' + e.message); process.exit(1); });
