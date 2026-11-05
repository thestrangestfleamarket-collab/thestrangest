// THE MICROSCOPE CHECK: node tests/microscope.cjs dist/market.html. In your apartment: nothing of the slides fetched at the start; a double click opens the eyepiece on the pond water, its microbes swimming at their real size; the field and scale bar follow the objective (field number 18 mm); focus blurs; the stage stops at the slide's edge; a photo slide is fetched only when it is put on the stage.
const { chromium } = require('playwright'), path = require('path');
const fails = [], ok = (c, m) => { if (!c) { fails.push(m); console.log((process.env.GITHUB_ACTIONS ? '::error title=microscope::' : 'FAIL ') + m); } else console.log('ok   ' + m); };
(async () => {
  const b = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const pg = await b.newPage({ viewport: { width: 1100, height: 760 } }), errs = [], reqs = [];
  pg.on('pageerror', e => errs.push(e.message.slice(0, 300))); pg.on('request', r => { if (/data\/scope|scope\.json|\/g\/.*\.jpg/.test(r.url())) reqs.push(r.url()); });
  await pg.goto('file://' + path.resolve(process.argv[2] || 'dist/market.html') + '?fresh=1&furnished=1&hour=17&place=your%20apartment', { waitUntil: 'commit' });
  let st = false; for (let i = 0; i < 60 && !st; i++) { await pg.waitForTimeout(3000); st = await pg.evaluate(() => !!window.__started).catch(() => false); }
  ok(st, 'the page starts');
  if (st) {
    for (let i = 0; i < 30 && !(await pg.evaluate(() => window.BEDROOMDBG && BEDROOMDBG().built)); i++) await pg.waitForTimeout(1000);
    ok(!reqs.length && await pg.evaluate(() => !MIC.data && !MICDBG().open), 'nothing of the microscope is fetched or loaded at the start (' + reqs.length + ')');
    const th = await pg.evaluate(() => !!__dbg.UI.things.find(t => t.name === 'LOOK IN THE MICROSCOPE') && __dbg.UI.things.some(t => t.name === 'SIT ON THE LAB STOOL'));
    ok(th, 'the lab desk with its microscope stands in the room, and its stool to sit on');
    await pg.evaluate(() => __dbg.UI.things.find(t => t.name === 'LOOK IN THE MICROSCOPE').act());
    for (let i = 0; i < 20 && !(await pg.evaluate(() => MICDBG().open)); i++) await pg.waitForTimeout(250);
    const d0 = await pg.evaluate(() => MICDBG());
    ok(d0.open && d0.slide === 'pond' && d0.org && d0.org.length >= 8, 'the eyepiece opens on a fresh drop of pond water, alive (' + (d0.org && d0.org.length) + ' organisms)');
    ok(Math.abs(d0.fov - 4500) < 1 && d0.mag === 40, 'at 4x the field is 18 mm / 4 = 4.5 mm, 40x in all (' + d0.fov + ')');
    await pg.waitForTimeout(1500); const d1 = await pg.evaluate(() => MICDBG());
    const moved = d1.org.filter((o, i) => Math.hypot(o.x - d0.org[i].x, o.y - d0.org[i].y) > 1).length;
    ok(moved >= 3, 'they swim: ' + moved + ' moved in 1.5 s');
    const p4 = d1.pxPerUm, bar4 = [d1.bar, d1.barPx];
    await pg.evaluate(() => MIC.objective(2)); await pg.waitForTimeout(600); const d2 = await pg.evaluate(() => MICDBG());
    ok(Math.abs(d2.fov - 450) < .1 && Math.abs(d2.pxPerUm / p4 - 10) < .01 && d2.mag === 400, 'at 40x the field is 450 µm and everything is ten times bigger on screen (' + d2.fov + ', ' + (d2.pxPerUm / p4).toFixed(2) + ')');
    ok(d2.bar < bar4[0] && Math.abs(d2.barPx - d2.bar * d2.pxPerUm) < .5, 'the scale bar follows (' + bar4[0] + ' µm -> ' + d2.bar + ' µm)');
    const pa = d2.org.find(o => o.k === 'paramecium'); ok(!pa || (pa.len > 150 && pa.len < 260), 'a paramecium is its real 150-260 µm (' + (pa && pa.len.toFixed(0)) + ')');
    const bl = await pg.evaluate(() => [MIC.blurAt(0), MIC.blurAt(0.4), MIC.blurAt(5), MIC.blurAt(30)]);
    ok(bl[0] === 0 && bl[2] > 0 && bl[3] > bl[2], 'focus: sharp in the focal plane, blurring with distance from it at 40x (' + bl.map(x => x.toFixed(2)) + ')');
    await pg.evaluate(() => MIC.objective(0)); await pg.waitForTimeout(300);
    const bl4 = await pg.evaluate(() => MIC.blurAt(5)); ok(bl4 === 0, 'at 4x the depth of field is deep: 5 µm off is still sharp (' + bl4 + ')');
    const bx = await pg.evaluate(() => { const r = document.querySelector('#micp canvas').getBoundingClientRect(); return [r.x + r.width / 2, r.y + r.height / 2, r.width]; });
    for (let i = 0; i < 3; i++) { await pg.mouse.move(bx[0] + bx[2] * .35, bx[1]); await pg.mouse.down(); await pg.mouse.move(bx[0] - bx[2] * .35, bx[1], { steps: 4 }); await pg.mouse.up(); }
    await pg.waitForTimeout(800); const d3 = await pg.evaluate(() => MICDBG());
    ok(Math.abs(d3.sx - 1200) < 1, 'the stage stops at the drop\'s edge (' + d3.sx.toFixed(1) + ' of 1200 µm)');
    const slides = await pg.evaluate(() => MIC.slides().filter(s => s.id !== 'pond').map(s => s.id));
    if (slides.length) {
      const n0 = reqs.length; await pg.evaluate(id => MIC.place(id), slides[0]);
      for (let i = 0; i < 20 && !(await pg.evaluate(() => MICDBG().img)); i++) await pg.waitForTimeout(300);
      const d4 = await pg.evaluate(() => MICDBG());
      ok(d4.img && reqs.length > n0 && reqs.slice(n0).every(u => /slides|\.jpg/.test(u)), 'a photo slide is fetched only when it is put on the stage (' + slides.length + ' in the box; ' + slides[0] + ', ' + (d4.W && d4.W.toFixed(0)) + ' µm wide)');
    } else ok(false, 'the slide box has photo slides');
    const err = await pg.evaluate(() => Object.entries(SYS.P).flatMap(([k, v]) => v.filter(s => s.err).map(s => k + ':' + s.name)));
    ok(!err.length, 'no SYS errors (' + err.join(',') + ')');
    if (process.env.SHOT) { await pg.evaluate(() => { MIC.place('pond'); MIC.objective(1); }); await pg.waitForTimeout(1500); await pg.screenshot({ path: process.env.SHOT }); }
    await pg.evaluate(() => MIC.close()); ok(await pg.evaluate(() => !MICDBG().open), 'DONE closes it');
  }
  ok(!errs.length, 'no page errors' + (errs.length ? ': ' + errs.slice(0, 3).join(' | ') : ''));
  await b.close();
  console.log(fails.length ? fails.length + ' failed' : 'all microscope checks passed');
  process.exit(fails.length ? 1 : 0);
})();
