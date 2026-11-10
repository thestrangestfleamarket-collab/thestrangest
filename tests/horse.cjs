// THE HORSE CHECK: node tests/horse.cjs dist/market.html. Everyone has a SADDLE and a COWBOY HAT; held, the saddle's E calls the horse and you ride (in the saddle, on its back); W walks, held a trot, Shift gallops; it will not go into deep water; E gets down and the horse waits; the hat goes on your head and comes off; nothing throws.
const { chromium } = require('playwright'), path = require('path');
const fails = [], ok = (c, m) => { if (!c) { fails.push(m); console.log((process.env.GITHUB_ACTIONS ? '::error title=horse::' : 'FAIL ') + m); } else console.log('ok   ' + m); };
const SHOTS = process.env.SHOTS;
(async () => {
  const b = await chromium.launch({ ...(process.env.PWEXE ? { executablePath: process.env.PWEXE } : {}), args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const pg = await b.newPage({ viewport: { width: 800, height: 500 } }), errs = [];
  pg.on('pageerror', e => errs.push(e.message.slice(0, 300)));
  await pg.goto('file://' + path.resolve(process.argv[2] || 'dist/market.html') + '?fresh=1&hour=13&at=80,95&res=0', { waitUntil: 'commit' });
  await pg.waitForFunction(() => window.__started, null, { timeout: 300000 });
  await pg.waitForFunction(() => !FADE.busy && OUT.open, null, { timeout: 120000, polling: 200 });
  await pg.waitForFunction(() => !document.getElementById('loading'), null, { timeout: 150000, polling: 500 });
  await pg.evaluate(() => { window.UI = __dbg.UI; UI.setView('third'); WX.hold = 'CLEAR'; });
  const shot = async (n, side = 1.4) => { if (!SHOTS) return; await pg.evaluate(a => { UI.setView('third'); SHARED.pitchTo = SHARED.pitch = .2; UI.dist = 7; if (a != null) SHARED.yawTo = SHARED.yaw = SHARED.heading + a; }, side); await pg.waitForTimeout(1200); await pg.screenshot({ path: SHOTS + '/' + n + '.png' }); };
  const S = () => pg.evaluate(() => ({ ...HORSE.dbg(), saddle: FORAGE.has('saddle'), hat: FORAGE.has('cowboyhat'), x: +(__dbg.you().x / (33.9 / 30 / .84)).toFixed(1), z: +(__dbg.you().z / (33.9 / 30 / .84)).toFixed(1), t: performance.now() }));
  const until = async (f, s = 60) => { let r; for (let i = 0; i < s * 2; i++) { r = await S(); if (f(r)) return r; await pg.waitForTimeout(500); } return r; };
  const s0 = await S();
  ok(s0.saddle && s0.hat, 'every player has a saddle and a cowboy hat ' + JSON.stringify(s0));
  await pg.evaluate(() => WIELD.set('saddle')); await pg.waitForTimeout(300); await pg.keyboard.press('e');
  const s1 = await until(s => s.on === 'saddle' && s.ok, 90);
  await pg.evaluate(() => { for (const e of document.body.children) if (e.tagName !== 'CANVAS' && !e.querySelector('canvas')) e.style.visibility = 'hidden'; });
  ok(s1.on === 'saddle' && s1.mine && s1.ok, 'E with the saddle: your horse, saddled, and you on it ' + JSON.stringify(s1));
  ok(s1.seat && s1.seat[1] > 1.3 && s1.seat[1] < 2.3, 'the seat is on a life-size horse\'s back (1.3-2.3 units up) ' + JSON.stringify(s1.seat));
  await pg.waitForTimeout(1500); await shot('1-mounted');
  // the owner's look (ADMIN > VEHICLE EDITOR, 10 Nov 2026): a bigger horse lifts the seat with it, its gait takes fewer strides; a coat colour turned into his paints the body
  const lk = await pg.evaluate(async () => { const WU = 33.9 / 30 / .84, y = __dbg.you(), g = SHARED.groundY(y.x, y.z) / WU, N = HORSE.body(), C = N.me.geometry.attributes.color.array, pink = () => { let n = 0; for (let i = 0; i < C.length; i += 3) if (C[i] > 60 && C[i + 1] < 12 && Math.abs(C[i] - C[i + 2]) < 12) n++; return n; };
    const s0 = HORSE.dbg().seat[1] - g, p0 = pink(), coat = VLOOK.kinds.horse.pal(); VLOOK.set('horse', { s: 1.3, pal: Object.fromEntries(coat.map(k => [k, 'ff00ff'])) }); await new Promise(r => setTimeout(r, 1500));
    const d = HORSE.dbg(), s1 = d.seat[1] - g, p1 = pink(); VLOOK.set('horse', null); await new Promise(r => setTimeout(r, 1500));
    return { s0: +s0.toFixed(2), s1: +s1.toFixed(2), size: d.size, p0, p1, back: pink(), size2: HORSE.dbg().size, on: RIDE.on }; });
  ok(lk.size === 1.3 && Math.abs(lk.s1 / lk.s0 - 1.3) < .08 && lk.p0 === 0 && lk.p1 > 100 && lk.back === 0 && lk.size2 === 1 && lk.on === 'saddle', 'its look: size 1.3 lifts the seat 1.3 times, the coat repainted, and back again ' + JSON.stringify(lk));

  // the brook is a few steps ahead (north-east of the start): it wades the edge, pulls up before the deep water, and you stay up, dry
  await pg.keyboard.down('w'); const sw = await until(s => s.v > .5, 30), sb = await until(s => s.v < .05 || !s.on, 40);
  const wet = await pg.evaluate(() => ({ depth: +(FLOW.depth(__dbg.you().x, __dbg.you().z) / (33.9 / 30 / .84)).toFixed(2) }));
  ok(sw.v > .5 && sb.on === 'saddle' && sb.v < .05 && wet.depth < .7, 'into the brook: it pulls up before the deep water and you stay in the saddle ' + JSON.stringify({ ...sb, ...wet }));
  await pg.keyboard.up('w'); await pg.evaluate(() => { const h = RIDE.hd + Math.PI; RIDE.hd = SHARED.heading = h; SHARED.yaw = SHARED.yawTo = h - Math.PI; }); await pg.waitForTimeout(500);   // (turned round, the brook behind: open ground ahead; W goes the way the camera looks)
  await pg.keyboard.down('w'); const s2 = await until(s => s.v > 3.4, 60); await shot('2-trot', null);
  ok(s2.v > 3.4 && s2.v < 4.2, 'W walks, held it trots ' + JSON.stringify(s2));
  await pg.keyboard.down('Shift'); const s3 = await until(s => s.v > 9, 60); await shot('3-gallop', null);
  ok(s3.v > 9, 'Shift gallops ' + JSON.stringify(s3));
  await pg.keyboard.up('Shift'); await pg.keyboard.up('w');
  const s4 = await until(s => s.v < .05, 20); ok(s4.v < .05, 'let go: it slows to a halt ' + JSON.stringify(s4));
  await shot('3b-side', 1.57); await shot('3c-side', -1.57);
  await pg.keyboard.press('e'); const s5 = await until(s => !s.on, 10);
  ok(!s5.on && s5.park, 'E gets down; the horse waits where you left it ' + JSON.stringify(s5));
  await pg.waitForTimeout(1500); await shot('4-parked');
  await pg.evaluate(() => EQUIP.wear('cowboyhat'));
  const h1 = await pg.evaluate(() => { const w = AVATAR.worn().hat, p = w && AVATAR.pieces.find(q => q.n === w[0]); return p && p.label; });
  ok(h1 === 'BRIM HAT · SHERIFF', 'the cowboy hat goes on your head: ' + h1);
  await pg.waitForTimeout(2500); await shot('5-hat');
  await pg.evaluate(() => EQUIP.wear('cowboyhat'));
  const h2 = await pg.evaluate(() => { const w = AVATAR.worn().hat; return w ? w[0] : null; });
  ok(h2 == null, 'and comes off again: ' + h2);
  ok(!errs.length, 'no page errors ' + errs.join(' | '));
  await b.close(); console.log(fails.length ? fails.length + ' failed' : 'all good'); process.exit(fails.length ? 1 : 0);
})().catch(e => { console.log('FAIL ' + e.message); process.exit(1); });
