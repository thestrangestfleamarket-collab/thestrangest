// THE OPTICS CHECK: node tests/optics.cjs dist/market.html. The binoculars and the camera (146ma): both owned from the start; raised, the view narrows to the optic's real field and comes back when lowered; the hand shakes less standing still than walking; the rangefinder reads a box set 20 m off; the exposure value of the settings; a shot makes a print in PHOTOS, and the exposure shows in it (over is brighter than under).
const { chromium } = require('playwright'), path = require('path');
const fails = [], ok = (c, m) => { if (!c) { fails.push(m); console.log((process.env.GITHUB_ACTIONS ? '::error title=optics::' : 'FAIL ') + m); } else console.log('ok   ' + m); };
(async () => {
  const b = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const pg = await b.newPage({ viewport: { width: 960, height: 600 } }), errs = [];
  pg.on('pageerror', e => errs.push(e.message.slice(0, 300)));
  await pg.goto('file://' + path.resolve(process.argv[2] || 'dist/market.html') + '?fresh=1&hour=12&at=40,150&res=0', { waitUntil: 'commit' });
  let st = false; for (let i = 0; i < 60 && !st; i++) { await pg.waitForTimeout(3000); st = await pg.evaluate(() => !!window.__started).catch(() => false); }
  ok(st, 'the page starts');
  if (st) {
    await pg.evaluate(() => { if (window.WX) WX.hold = 'CLEAR'; });
    const d0 = await pg.evaluate(() => OPTICDBG());
    ok(d0.own.binoc && d0.own.camera, 'every player owns the binoculars and the camera from the start');
    const fov0 = d0.fov;
    const up = await pg.evaluate(async () => { WIELD.set('binoc'); await OPTIC.toggle('binoc'); await new Promise(r => setTimeout(r, 600)); return OPTICDBG(); });
    ok(up.up === 'binoc' && Math.abs(up.fov - 7.5) < .01 && fov0 > 30, 'raised, the binoculars narrow the view to their 7.5 degree field (' + fov0 + ' -> ' + up.fov + ')');
    await pg.waitForTimeout(3000);
    const still = await pg.evaluate(() => OPTIC.shake.rms);
    await pg.keyboard.down('w'); let walk = [0, null]; for (let i = 0; i < 8; i++) { await pg.waitForTimeout(500); const w = await pg.evaluate(() => [OPTIC.shake.rms, OPTIC.up]); walk = [Math.max(walk[0], w[0]), w[1]]; } await pg.keyboard.up('w');
    ok(walk[1] === 'binoc' && walk[0] > still * 2 && still < .004, 'the hand is steady standing still and shakes walking (' + still.toFixed(5) + ' rad -> ' + walk[0].toFixed(5) + ' rad)');
    await pg.waitForTimeout(2500);
    const r20 = await pg.evaluate(async () => { SHARED.pitchTo = SHARED.pitch = -.7; await new Promise(r => setTimeout(r, 400)); const m = OPTIC.metre, cam = SHARED.cam, f = cam.getWorldDirection(cam.position.clone().set(0, 0, 0)), p = cam.position.clone().addScaledVector(f, 22.5 * m);
      const b = OPTICBOX(p, 5 * m); for (let i = 0; i < 8; i++) await new Promise(r => setTimeout(r, 250)); const d = OPTIC.dist; b.removeFromParent(); return d; });
    ok(r20 != null && Math.abs(r20 - 20) < 1, 'the rangefinder reads the face of a box set 20 m off (' + (r20 && r20.toFixed(2)) + ' m)');
    const ev = await pg.evaluate(() => ({ a: OPTIC.evSet(8, 1 / 125, 100), b: OPTIC.evSet(8, 1 / 125, 400), sun: OPTIC.ev(), where: [!!ROOMS.cur, SHARED.LVL, !!(__dbg.MAPK.MODS.apts && __dbg.MAPK.MODS.apts.inReal)] }));
    ok(Math.abs(ev.a - 12.97) < .02 && Math.abs(ev.b - 10.97) < .02 && ev.sun > 12.5, 'the exposure value: f/8 at 1/125 is EV 13 at ISO 100, 11 at 400; noon in the open is about ' + ev.sun.toFixed(1) + ' (' + JSON.stringify(ev.where) + ')');
    const cam = await pg.evaluate(async () => { OPTIC.lower(); WIELD.set('camera'); await OPTIC.toggle('camera'); await new Promise(r => setTimeout(r, 500)); const fov = OPTICDBG().fov, n0 = PHOTOS.mine.length, l0 = OPTIC.cam.left;
      const lum = async src => { const im = new Image(); im.src = src; await im.decode(); const c = document.createElement('canvas'); c.width = im.width; c.height = im.height; const g = c.getContext('2d'); g.drawImage(im, 0, 0); const d = g.getImageData(0, 0, c.width, c.height).data; let s = 0; for (let i = 0; i < d.length; i += 4) s += d[i] + d[i + 1] + d[i + 2]; return s / (d.length / 4) / 3; };
      Object.assign(OPTIC.cam, { f: 50, N: 2, t: 1 / 15, iso: 400 }); OPTIC.shoot(); const over = PHOTOS.mine[PHOTOS.mine.length - 1];
      Object.assign(OPTIC.cam, { N: 16, t: 1 / 1000, iso: 100 }); OPTIC.shoot(); const under = PHOTOS.mine[PHOTOS.mine.length - 1];
      return { fov, n: PHOTOS.mine.length - n0, left: l0 - OPTIC.cam.left, src: /^data:image\/jpeg/.test(under.src), lo: await lum(over.src), lu: await lum(under.src), inPack: FORAGE.has(under.id), w: OPTIC.last }; });
    ok(Math.abs(cam.fov - 26.99) < .05, 'raised, the camera\'s 50 mm lens shows its real field (' + cam.fov + ' degrees)');
    ok(cam.n === 2 && cam.left === 2 && cam.src && cam.inPack, 'two shots make two prints in PHOTOS and in the pack; the roll counts down');
    ok(cam.lo > cam.lu + 30, 'the exposure shows in the print: over is brighter than under (' + cam.lo.toFixed(0) + ' vs ' + cam.lu.toFixed(0) + ')');
    const down = await pg.evaluate(() => { OPTIC.lower(); return OPTICDBG(); });
    ok(!down.up && Math.abs(down.fov - fov0) < .01, 'lowered, the view comes back (' + down.fov + ')');
    const err = await pg.evaluate(() => Object.entries(SYS.P).flatMap(([k, v]) => v.filter(s => s.err).map(s => k + ':' + s.name)));
    ok(!err.length, 'no SYS errors (' + err.join(',') + ')');
  }
  ok(!errs.length, 'no page errors' + (errs.length ? ': ' + errs.slice(0, 3).join(' | ') : ''));
  await b.close();
  console.log(fails.length ? fails.length + ' failed' : 'all optics checks passed');
  process.exit(fails.length ? 1 : 0);
})();
