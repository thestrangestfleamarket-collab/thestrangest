// THE ROAM CHECK: node tests/roam.cjs dist/roam.html. ROAM is a page of its own (/roam, no market in it): it puts you in the ship's cockpit (first person,
// the ship owning the controls and the camera, a field of rocks round you); the throttle and boost move you, pitching for a while turns you upside down (full 360°),
// lasers break rocks, a missile launches and bursts, a dead hull ends the program and leaves the page, and so does holding Q.
const { chromium } = require('playwright'), path = require('path');
const fails = [], ok = (c, m) => { if (!c) { fails.push(m); console.log((process.env.GITHUB_ACTIONS ? '::error title=roam::' : 'FAIL ') + m); } else console.log('ok   ' + m); };
(async () => {
  const b = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const pg = await b.newPage({ viewport: { width: 800, height: 500 } }), errs = [];
  pg.on('pageerror', e => errs.push(e.message.slice(0, 300))); pg.on('console', m => { if (/not loaded before use|^ROAM|^SYS /.test(m.text())) errs.push(m.text().slice(0, 300)); });
  const page = 'file://' + path.resolve(process.argv[2] || 'dist/roam.html') + '?stay=1';
  await pg.goto(page, { waitUntil: 'commit' });
  const wait = (f, a, t = 180000) => pg.waitForFunction(f, a, { timeout: t, polling: 200 });
  await wait(() => window.ROAMDBG && ROAMDBG().on); await pg.waitForTimeout(1500);
  const s1 = await pg.evaluate(() => { const d = ROAMDBG(); return { on: d.on, market: typeof window.__dbg !== 'undefined' || typeof window.ARCDBG !== 'undefined', run: HOLO.run && HOLO.run.P.name, d, drive: !!SHARED.drive, leave: !!document.getElementById('leave'), camNear: Math.abs(d.cam[0] - 3000) < 20 }; });
  ok(s1.on && !s1.market && s1.run === 'ROAM' && s1.leave && s1.d.view === 'first' && s1.drive && s1.d.chunks > 150 && s1.d.instances === s1.d.chunks && s1.d.meteors > 60 && s1.d.hull === 100 && s1.d.far === 9000 && s1.camNear,
    'ROAM\'s page puts you in the cockpit with no market loaded: the ship owns the controls, a field of rocks round you, LEAVE THE HOLODECK on screen: ' + JSON.stringify(s1).slice(0, 600));
  const f1 = await pg.evaluate(async () => { const U = async (f, ms = 20000) => { for (const t = Date.now(); Date.now() - t < ms; await new Promise(r => setTimeout(r, 150))) if (f()) return true; return false; };
    ROAM.input({ thr: 1, boost: 1 }); const fast = await U(() => ROAMDBG().speed > 120, 90000); const d = ROAMDBG(); ROAM.input({ thr: -1 }); await new Promise(r => setTimeout(r, 2500)); const d2 = ROAMDBG(); ROAM.input(null);
    return { fast, speed: d.speed, boost: d.boost, moved: Math.hypot(...d.world), slowed: d2.speed < d.speed }; });
  ok(f1.fast && f1.boost && f1.moved > 50 && f1.slowed, 'the throttle and boost move the ship (the rocks move past you), the throttle back slows it: ' + JSON.stringify(f1));
  const f2 = await pg.evaluate(async () => { ROAM.input({ pitch: 1 }); let flipped = false, minUp = 1; for (const t = Date.now(); Date.now() - t < 90000; await new Promise(r => setTimeout(r, 100))) { const u = ROAMDBG().up; minUp = Math.min(minUp, u); if (u < -.5) { flipped = true; break; } } ROAM.input(null); return { flipped, minUp, up: ROAMDBG().up }; });
  ok(f2.flipped, 'pitching for a while turns you upside down: the full 360°: ' + JSON.stringify(f2));
  const w1 = await pg.evaluate(async () => { let r0 = ROAMDBG().rocks, hit = false, dist = null; for (const t = Date.now(); Date.now() - t < 90000; await new Promise(r => setTimeout(r, 250))) { dist = ROAM.aim(); ROAM.input({ fire: 1 }); if (ROAMDBG().rocks > r0) { hit = true; break; } } const d = ROAMDBG(); ROAM.input(null); return { hit, dist, rocks: d.rocks, heat: d.heat, shards: d.shards, chunks: d.chunks, meteors: d.meteors }; });
  ok(w1.hit && w1.heat > 0 && w1.chunks > 150, 'lasers break a rock (its shards fly, the laser warms, a new rock comes in far off): ' + JSON.stringify(w1));
  const w2 = await pg.evaluate(async () => { ROAM.aim(); const m0 = ROAMDBG().mis, r0 = ROAMDBG().rocks; ROAM.input({ mis: 1 }); await new Promise(r => setTimeout(r, 300)); const fired = ROAMDBG(); ROAM.input(null);
    let burst = false; for (const t = Date.now(); Date.now() - t < 90000; await new Promise(r => setTimeout(r, 200))) { const d = ROAMDBG(); if (d.missiles === 0 && d.rocks > r0) { burst = true; break; } } return { m0, mis: fired.mis, flying: fired.missiles, burst, rocks: ROAMDBG().rocks - r0 }; });
  ok(w2.m0 === 6 && w2.mis === 5 && w2.flying === 1 && w2.burst, 'a missile launches (one of six), chases the rock ahead and bursts it: ' + JSON.stringify(w2));
  const h1 = await pg.evaluate(async () => { const U = async (f, ms = 20000) => { for (const t = Date.now(); Date.now() - t < ms; await new Promise(r => setTimeout(r, 150))) if (f()) return true; return false; };
    ROAM.hurt(60); const hull = ROAMDBG().hull; ROAM.hurt(100); const dead = ROAMDBG().dead; const back = await U(() => !HOLO.run && HOLO.left);
    return { hull, dead, back, on: ROAMDBG().on, drive: !!SHARED.drive, best: window.ROAMBEST }; });
  ok(h1.hull === 40 && h1.dead && h1.back && !h1.on && !h1.drive && h1.best > 0, 'hits wear the hull; a dead hull breaks the ship up, ends the program and leaves the page for the market: ' + JSON.stringify(h1));
  await pg.goto(page, { waitUntil: 'commit' }); await wait(() => window.ROAMDBG && ROAMDBG().on); await pg.waitForTimeout(1200);
  const e1 = await pg.evaluate(async () => { const U = async (f, ms = 90000) => { for (const t = Date.now(); Date.now() - t < ms; await new Promise(r => setTimeout(r, 150))) if (f()) return true; return false; };
    const on = ROAMDBG().on, q = { key: 'q', bubbles: true, cancelable: true }; window.dispatchEvent(new KeyboardEvent('keydown', q)); const ended = await U(() => !HOLO.run && HOLO.left, 40000); window.dispatchEvent(new KeyboardEvent('keyup', q));   // a second held (the frames here are slow)
    return { on, ended }; });
  ok(e1.on && e1.ended, 'ROAM runs again; holding Q ends the program and leaves the page: ' + JSON.stringify(e1));
  ok(!errs.length, 'no page errors ' + errs.join(' | '));
  await b.close(); console.log(fails.length ? fails.length + ' FAILED' : 'all good'); process.exit(fails.length ? 1 : 0);
})().catch(e => { console.log('FAIL ' + e.message); process.exit(1); });
