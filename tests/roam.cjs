// THE ROAM CHECK: node tests/roam.cjs dist/market.html. The holodeck lists ROAM free; running it puts you in the ship's cockpit, the market stopped (first person,
// the ship owning the controls and the camera, a field of rocks round you); the throttle and boost move you, pitching for a while turns you upside down (full 360°),
// lasers break rocks, a missile launches and bursts, a dead hull sends you back to the holodeck, and holding Q ends the program.
const { chromium } = require('playwright'), path = require('path');
const fails = [], ok = (c, m) => { if (!c) { fails.push(m); console.log((process.env.GITHUB_ACTIONS ? '::error title=roam::' : 'FAIL ') + m); } else console.log('ok   ' + m); };
(async () => {
  const b = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const pg = await b.newPage({ viewport: { width: 800, height: 500 } }), errs = [];
  pg.on('pageerror', e => errs.push(e.message.slice(0, 300))); pg.on('console', m => { if (/not loaded before use|^ROAM|^SYS /.test(m.text())) errs.push(m.text().slice(0, 300)); });
  await pg.goto('file://' + path.resolve(process.argv[2] || 'dist/market.html') + '?fresh=1&hour=13&res=1', { waitUntil: 'commit' });
  await pg.waitForFunction(() => window.__started, null, { timeout: 300000 });
  const wait = (f, a, t = 180000) => pg.waitForFunction(f, a, { timeout: t, polling: 200 });
  const U = `const U=async(f,ms=60000)=>{ for(const t=Date.now();Date.now()-t<ms;await new Promise(r=>setTimeout(r,150)))if(f())return true; return false; };`;
  await pg.waitForTimeout(12000); await wait(() => !FADE.busy).catch(() => {});
  for (let k = 0; k < 4; k++) { await pg.evaluate(() => { if (!ARCDBG().built && !FADE.busy) ROOMS.enter('arcade'); }); if (await wait(() => ARCDBG().built && !FADE.busy, null, 60000).then(() => 1, () => 0)) break; }
  const r1 = await pg.evaluate(() => { STORE.holo.menu(); const hp = document.getElementById('holog'), t = hp.textContent; STORE.holo.hide(); return { programs: ARCDBG().holo.programs, free: /ROAM\s*FREE/.test(t.replace(/\s+/g, ' ')) }; });
  ok(r1.programs.includes('ROAM') && r1.free, 'the holodeck lists ROAM, free: ' + JSON.stringify(r1));
  const s1 = await pg.evaluate(async () => { const H = STORE.holo, P = H.programs.find(p => p.name === 'ROAM'); INV.cash = 3; H.start(P);
    const U = async (f, ms = 90000) => { for (const t = Date.now(); Date.now() - t < ms; await new Promise(r => setTimeout(r, 150))) if (f()) return true; return false; };
    const on = await U(() => ROAMDBG().on && !FADE.busy); await new Promise(r => setTimeout(r, 1500)); const d = ROAMDBG();
    return { on, cash: INV.cash, off: ROOMS.offIn && ROOMS.offIn(), run: ARCDBG().holo.run, d, drive: !!SHARED.drive, solo: !!SHARED.solo, walker: __dbg.W3.group.visible, camNear: Math.abs(d.cam[0] - 3000) < 20 }; });
  ok(s1.on && s1.cash === 3 && s1.off === 'arcade' && s1.solo && s1.run === 'ROAM' && s1.d.view === 'first' && s1.drive && !s1.walker && s1.d.chunks > 150 && s1.d.instances === s1.d.chunks && s1.d.meteors > 60 && s1.d.hull === 100 && s1.d.far === 9000 && s1.camNear,
    'ROAM costs nothing and puts you in the cockpit, the market stopped: first person, the ship owns the controls, the camera sits in the room, a field of rocks round you: ' + JSON.stringify(s1).slice(0, 600));
  const f1 = await pg.evaluate(async () => { const U = async (f, ms = 20000) => { for (const t = Date.now(); Date.now() - t < ms; await new Promise(r => setTimeout(r, 150))) if (f()) return true; return false; };
    ROAM.input({ thr: 1, boost: 1 }); const fast = await U(() => ROAMDBG().speed > 120, 90000); const d = ROAMDBG(); ROAM.input({ thr: -1 }); await new Promise(r => setTimeout(r, 2500)); const d2 = ROAMDBG(); ROAM.input(null);
    return { fast, speed: d.speed, boost: d.boost, moved: Math.hypot(...d.world), slowed: d2.speed < d.speed, pos: [__dbg.you().x, __dbg.you().z] }; });
  ok(f1.fast && f1.boost && f1.moved > 50 && f1.slowed && Math.abs(f1.pos[0] - 3000) < 1, 'the throttle and boost move the ship (the rocks move past you, the Walker stays put), the throttle back slows it: ' + JSON.stringify(f1));
  const f2 = await pg.evaluate(async () => { ROAM.input({ pitch: 1 }); let flipped = false, minUp = 1; for (const t = Date.now(); Date.now() - t < 90000; await new Promise(r => setTimeout(r, 100))) { const u = ROAMDBG().up; minUp = Math.min(minUp, u); if (u < -.5) { flipped = true; break; } } ROAM.input(null); return { flipped, minUp, up: ROAMDBG().up }; });
  ok(f2.flipped, 'pitching for a while turns you upside down: the full 360°: ' + JSON.stringify(f2));
  const w1 = await pg.evaluate(async () => { let r0 = ROAMDBG().rocks, hit = false, dist = null; for (const t = Date.now(); Date.now() - t < 90000; await new Promise(r => setTimeout(r, 250))) { dist = ROAM.aim(); ROAM.input({ fire: 1 }); if (ROAMDBG().rocks > r0) { hit = true; break; } } const d = ROAMDBG(); ROAM.input(null); return { hit, dist, rocks: d.rocks, heat: d.heat, shards: d.shards, chunks: d.chunks, meteors: d.meteors }; });
  ok(w1.hit && w1.heat > 0 && w1.chunks > 150, 'lasers break a rock (its shards fly, the laser warms, a new rock comes in far off): ' + JSON.stringify(w1));
  const w2 = await pg.evaluate(async () => { ROAM.aim(); const m0 = ROAMDBG().mis, r0 = ROAMDBG().rocks; ROAM.input({ mis: 1 }); await new Promise(r => setTimeout(r, 300)); const fired = ROAMDBG(); ROAM.input(null);
    let burst = false; for (const t = Date.now(); Date.now() - t < 90000; await new Promise(r => setTimeout(r, 200))) { const d = ROAMDBG(); if (d.missiles === 0 && d.rocks > r0) { burst = true; break; } } return { m0, mis: fired.mis, flying: fired.missiles, burst, rocks: ROAMDBG().rocks - r0 }; });
  ok(w2.m0 === 6 && w2.mis === 5 && w2.flying === 1 && w2.burst, 'a missile launches (one of six), chases the rock ahead and bursts it: ' + JSON.stringify(w2));
  const h1 = await pg.evaluate(async () => { const U = async (f, ms = 20000) => { for (const t = Date.now(); Date.now() - t < ms; await new Promise(r => setTimeout(r, 150))) if (f()) return true; return false; };
    ROAM.hurt(60); const hull = ROAMDBG().hull; ROAM.hurt(100); const dead = ROAMDBG().dead; const back = await U(() => !ARCDBG().holo.run && ROOMS.offIn && ROOMS.offIn() === 'arcade' && !FADE.busy);
    return { hull, dead, back, on: ROAMDBG().on, drive: !!SHARED.drive, view: __dbg.UI.view, walker: __dbg.W3.group.visible, best: window.ROAMBEST }; });
  ok(h1.hull === 40 && h1.dead && h1.back && !h1.on && !h1.drive && h1.walker && h1.best > 0, 'hits wear the hull; a dead hull breaks the ship up and fades you back into the holodeck, the program ended, the controls yours again: ' + JSON.stringify(h1));
  const e1 = await pg.evaluate(async () => { const U = async (f, ms = 90000) => { for (const t = Date.now(); Date.now() - t < ms; await new Promise(r => setTimeout(r, 150))) if (f()) return true; return false; };
    const H = STORE.holo, P = H.programs.find(p => p.name === 'ROAM'); H.start(P); const on = await U(() => ROAMDBG().on && !FADE.busy); await new Promise(r => setTimeout(r, 1200));
    const q = { key: 'q', bubbles: true, cancelable: true }; window.dispatchEvent(new KeyboardEvent('keydown', q)); const walked = false; await U(() => !ARCDBG().holo.run, 40000); window.dispatchEvent(new KeyboardEvent('keyup', q));   // a second held (the frames here are slow)
    const ended = await U(() => !ARCDBG().holo.run && ROOMS.offIn && ROOMS.offIn() === 'arcade' && !FADE.busy, 30000); return { on, walked, ended, run: ARCDBG().holo.run }; });
  ok(e1.on && !e1.walked && e1.ended, 'ROAM runs again; holding Q (kept from the game while flying) ends the program and brings you back: ' + JSON.stringify(e1));
  ok(!errs.length, 'no page errors ' + errs.join(' | '));
  await b.close(); console.log(fails.length ? fails.length + ' FAILED' : 'all good'); process.exit(fails.length ? 1 : 0);
})().catch(e => { console.log('FAIL ' + e.message); process.exit(1); });
