// THE HELIPAD CHECK: node tests/heli.cjs dist/market.html. The deck on the bank's roof; the news helicopter flies its round every five minutes from the shared clock and rests on the pad, its rotor still; a seat carries a passenger round the tour; you take the controls, SPACE lifts you, W flies you, and you land and get out; someone else flying one (the section's server says) is not yours to take.
const { chromium } = require('playwright'), path = require('path');
const fails = [], ok = (c, m) => { if (!c) { fails.push(m); console.log((process.env.GITHUB_ACTIONS ? '::error title=heli::' : 'FAIL ') + m); } else console.log('ok   ' + m); };
(async () => {
  const b = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const pg = await b.newPage({ viewport: { width: 960, height: 540 } }), errs = [];
  pg.on('pageerror', e => errs.push(e.message.slice(0, 300))); pg.on('console', m => { if (m.type() === 'warning' && /^SYS |HELI/.test(m.text())) errs.push(m.text().slice(0, 300)); });
  await pg.goto('file://' + path.resolve(process.argv[2] || 'dist/market.html') + '?fresh=1&hour=13&at=-50,-38', { waitUntil: 'commit' });
  await pg.waitForFunction(() => window.__started && window.HELI && HELI.dbg().built, null, { timeout: 400000, polling: 500 });
  const until = async (f, n = 60, a) => { for (let i = 0; i < n; i++) { if (await pg.evaluate(f, a)) return true; await pg.waitForTimeout(500); } return false; };   // (the test machine's frames are slow: wait on the game, not the clock)
  const at = async u => { const n = await pg.evaluate(u => { const H = HELI.list[0]; HELI.skew += ((u - HELI.phase(H)) % 300 + 300) % 300; return HELI.n; }, u); await until(n => HELI.n >= n + 2, 120, n); };   // its own clock to u seconds, once two of its updates have run (a place loading holds the frames)
  const d0 = await pg.evaluate(() => HELI.dbg());
  ok(d0.pad && d0.pad.top > 10 && d0.list.length === 1 && d0.list[0].id === 'news', 'the deck stands on the bank roof, one news helicopter: ' + JSON.stringify(d0.pad));
  await at(200); const still = await pg.evaluate(() => HELI.dbg().list[0]);
  ok(still.mode === 'rest' && still.rot === 0, 'resting on the pad its rotor is off: ' + JSON.stringify(still));
  // the tour: a helicopter flying it is high over the section, well away from the pad
  await at(60); const fly = await pg.evaluate(() => { const d = HELI.dbg(); return { d: d.list[0], pad: d.pad }; });
  ok(fly.d.mode === 'tour' && fly.d.y > fly.pad.top + 20 && Math.hypot(fly.d.x - fly.pad.x, fly.d.z - fly.pad.z) > 40, 'a minute into its flight it is up over the section: ' + JSON.stringify(fly.d));
  // ride along: back to its rest, take a seat, then its flight carries you
  await at(190); const rest = await pg.evaluate(() => { const ok = HELI.rideAlong(HELI.list[0]); return { ok, ride: RIDE.on, d: HELI.dbg().list[0] }; });
  ok(rest.d.mode === 'rest' && rest.ok && /^heliseat:news:/.test(rest.ride || ''), 'at rest on the pad you ride along in a seat: ' + JSON.stringify(rest));
  await at(50); await pg.waitForTimeout(800); const carried = await pg.evaluate(() => { const p = __dbg.pos(), d = HELI.dbg().list[0]; return { p, py: SHARED.py, d, ride: RIDE.on }; });
  ok(carried.d.mode === 'tour' && Math.hypot(carried.p[0] - carried.d.x, carried.p[2] - carried.d.z) < 5 && carried.py > 20, 'its tour carries you in your seat: ' + JSON.stringify({ p: carried.p, py: carried.py, heli: [carried.d.x, carried.d.y, carried.d.z] }));
  const noOut = await pg.evaluate(() => { HELI.out(); return RIDE.on; });
  ok(/^heliseat/.test(noOut || ''), 'no getting out in the air');
  await at(190); const off = await pg.evaluate(() => { HELI.out(); return { ride: RIDE.on, p: __dbg.pos(), py: SHARED.py }; });
  ok(!off.ride && off.py < 3, 'back on the pad you get out and come down to the street: ' + JSON.stringify(off));
  // fly it yourself
  await at(150); const took = await pg.evaluate(() => { HELI.fly(HELI.list[0]); return { ride: RIDE.on, hud: document.getElementById('helihud').style.display }; });
  ok(took.ride === 'heli:news' && took.hud === 'flex', 'you take the controls: ' + JSON.stringify(took));
  await until(() => HELI.dbg().fly && HELI.dbg().fly.rot >= 1); await pg.keyboard.down(' '); await until(() => { const d = HELI.dbg(); return d.fly && d.fly.y > d.pad.top + 6; }); await pg.keyboard.up(' ');
  const up = await pg.evaluate(() => HELI.dbg());
  ok(up.fly && up.fly.y > up.pad.top + 4, 'SPACE lifts it off the pad: ' + JSON.stringify(up.fly && { y: up.fly.y, top: up.pad.top }));
  await pg.keyboard.down('w'); await until(() => { const d = HELI.dbg(); return d.fly && Math.hypot(d.fly.x - d.pad.x, d.fly.z - d.pad.z) > 14; }); await pg.keyboard.up('w');
  const fw = await pg.evaluate(() => HELI.dbg());
  ok(fw.fly && Math.hypot(fw.fly.x - fw.pad.x, fw.fly.z - fw.pad.z) > 10, 'W flies it forward: ' + JSON.stringify(fw.fly && { x: fw.fly.x, z: fw.fly.z }));
  await pg.keyboard.down('Shift'); await until(() => HELI.dbg().fly && HELI.dbg().fly.down, 120); await pg.keyboard.up('Shift');
  const landed = await pg.evaluate(() => { const f = HELI.dbg().fly; HELI.out(); return { f, ride: RIDE.on, d: HELI.dbg().list[0] }; });
  ok(landed.f && landed.f.down && !landed.ride && landed.d.mode === 'parked', 'SHIFT sets it down; you get out and it stays parked where it landed: ' + JSON.stringify({ down: landed.f && landed.f.down, ride: landed.ride, mode: landed.d.mode }));
  await at(136); const a = await pg.evaluate(() => HELI.dbg().list[0]); await at(225); const home = { a, b: await pg.evaluate(() => HELI.dbg().list[0]) };
  ok(home.a.mode === 'home' && home.b.mode === 'rest', 'at its next rest its pilot flies it home to the pad: ' + JSON.stringify(home));
  const theirs = await pg.evaluate(() => { ONLINE.feed({ t: 'car', k: 'heli-news', by: 'a' }); const H = HELI.list[0]; HELI.fly(H); return { by: H.by, ride: RIDE.on }; });
  ok(theirs.by === 'a' && !theirs.ride, 'one someone else flies is not yours to take: ' + JSON.stringify(theirs));
  ok(!errs.length, 'no page errors' + (errs.length ? ': ' + errs.slice(0, 3).join(' | ') : ''));
  await b.close(); console.log(fails.length ? fails.length + ' failed' : 'all helipad checks passed'); process.exit(fails.length ? 1 : 0);
})();
