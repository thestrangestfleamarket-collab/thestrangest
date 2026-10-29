// THE SWIM CHECK: node tests/swim.cjs dist/market.html [shots dir]. In the Hudson: SPACE swims down and you hold there, SHIFT swims up, in first person you
// swim where you look and see your arms; under water the murk; the river two to ten times deeper out in the channel; the cave mouth mid-river asks for
// more air than a plain breath; the shark rents a scuba set (its tank breathes for you); through the mouth into the flooded tunnel and its air pocket.
const { chromium } = require('playwright'), path = require('path');
const fails = [], ok = (c, m) => { if (!c) { fails.push(m); console.log((process.env.GITHUB_ACTIONS ? '::error title=swim::' : 'FAIL ') + m); } else console.log('ok   ' + m); };
(async () => {
  const shots = process.argv[3];
  const b = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'], ...(process.env.PWCHROME ? { executablePath: process.env.PWCHROME } : {}) });
  const pg = await b.newPage({ viewport: { width: 800, height: 500 } }), errs = [];
  pg.on('pageerror', e => errs.push(e.message.slice(0, 300)));
  await pg.goto('file://' + path.resolve(process.argv[2] || 'dist/market.html') + '?fresh=1&hour=13&res=1', { waitUntil: 'commit' });
  await pg.waitForFunction(() => window.__started, null, { timeout: 300000 });
  const wait = (f, a, t = 180000) => pg.waitForFunction(f, a, { timeout: t, polling: 200 });
  const shot = async n => { if (shots) await pg.screenshot({ path: `${shots}/${n}.png` }); };
  for (let k = 0; k < 4; k++) { await wait(() => !FADE.busy).catch(() => {}); await pg.evaluate(() => { if (!RIVER.on) STORE.goTo(SHARED.BOD.XS(61), SHARED.BOD.ZS(-118), 'up'); });
    if (await wait(() => window.RIVER && RIVER.on && !FADE.busy, null, 90000).then(() => 1, () => 0)) break; }
  const dep = await pg.evaluate(() => { const B = RIVER.box, mid = (B.z0 + B.z1) / 2, o = []; for (let x = B.x0 + 20; x < B.x1 - 20; x += 25) o.push(RIVER.depthAt(x, mid)); const m = RIVER.mouth;
    return { min: Math.min(...o), max: Math.max(...o), bank: RIVER.depthAt(m.x, B.z1 - 1), mouth: RIVER.depthAt(m.x, m.z) }; });
  ok(dep.min >= 12 && dep.max >= 40 && dep.max <= 260 && dep.bank < 3 && dep.mouth > 20, 'the Hudson is shallow at the quay and 2 to 10 times deeper out in the channel, the mouth in a pit: ' + JSON.stringify(dep));
  // into the water, two tiles from the long pier's side, away from posts
  const into = () => pg.evaluate(() => { const T = __dbg.cv().TILE, B = RIVER.box, m = RIVER.mouth; STORE.goTo(m.x + 6 * T, B.z1 - 8 * T, 'up'); });
  await into(); await wait(() => !FADE.busy); await wait(() => RIVER.swim, null, 60000);
  await wait(() => { const s = SWIMDBG(); return s.in && s.y < s.level; }, null, 60000); await pg.waitForTimeout(1500);
  const d0 = await pg.evaluate(() => SWIMDBG());
  await pg.keyboard.down(' '); await wait(() => RIVER.dep > 2.5, null, 60000); await pg.keyboard.up(' ');
  const d1 = await pg.evaluate(() => ({ s: SWIMDBG(), dep: RIVER.dep }));
  await pg.waitForTimeout(1500); const d2 = await pg.evaluate(() => ({ s: SWIMDBG(), dep: RIVER.dep }));
  ok(!d0.dive && d1.s.dive && d1.dep > 2.2 && d2.s.dive && d2.dep > 1.5, 'SPACE swims down, and let go you stay under, drifting slowly up: ' + JSON.stringify({ d0, d1, d2 }));
  await pg.keyboard.down('Shift'); await wait(() => !SWIMDBG().dive, null, 60000).catch(() => {}); await pg.keyboard.up('Shift');
  ok(!(await pg.evaluate(() => SWIMDBG().dive)) && await pg.evaluate(() => RIVER.swim), 'SHIFT swims back up to the surface');
  // first person: arms, look down and swim to dive
  await pg.evaluate(() => { __dbg.UI.setView('first'); SHARED.pitch = SHARED.pitchTo = .9; });
  await pg.waitForTimeout(800); await pg.keyboard.down('w'); await wait(() => RIVER.dep > 2, null, 60000).catch(() => {}); await pg.keyboard.up('w');
  const fp = await pg.evaluate(() => ({ s: SWIMDBG(), dep: RIVER.dep }));
  await pg.evaluate(() => { SHARED.pitch = SHARED.pitchTo = .05; }); await pg.waitForTimeout(1200);
  const look = await pg.evaluate(() => ({ s: SWIMDBG(), far: RIVER.U && 1 }));
  ok(fp.dep > 2 && fp.s.arms && look.s.uw, 'in first person you swim down where you look, your arms in view, the murk round you: ' + JSON.stringify({ dep: fp.dep, arms: fp.s.arms, uw: look.s.uw }));
  await shot('under-first');
  await pg.keyboard.down('w'); await pg.waitForTimeout(1500); await shot('under-stroke'); await pg.keyboard.up('w');
  // the mouth: a plain breath is not enough
  const toMouth = async () => { await pg.evaluate(() => { const T = __dbg.cv().TILE, m = RIVER.mouth; STORE.goTo(m.x, m.z + .4 * T, 'up'); }); await wait(() => !FADE.busy); await wait(() => RIVER.swim, null, 60000);
    await pg.keyboard.down(' '); await pg.keyboard.down('k'); const r = await wait(() => RIVER.bot - RIVER.dep < 2.4 || window.HUDSON && HUDSON.built, null, 240000).then(() => 1, () => 0); await pg.keyboard.up('k'); await pg.keyboard.up(' '); return r; };
  await pg.evaluate(() => { __dbg.VIT.air = __dbg.VIT.airMax; });
  ok(await toMouth(), 'you can swim right down to the cave mouth on the bed');
  await pg.waitForTimeout(1500);
  const g1 = await pg.evaluate(() => ({ built: HUDSON.built, air: __dbg.VIT.air, msg: [...document.querySelectorAll('*')].some(e => e.childElementCount === 0 && /YOU NEED MORE AIR/.test(e.textContent)) }));
  ok(!g1.built && g1.msg, 'with a plain breath the tunnel turns you back (more air: mushrooms or scuba): ' + JSON.stringify(g1));
  await pg.keyboard.down('Shift'); await wait(() => !SWIMDBG().dive, null, 120000).catch(() => {}); await pg.keyboard.up('Shift');
  // rent the scuba set from the shark
  const rent = await pg.evaluate(() => { INV.cash = 500; const N = __dbg.NPCS.concat(__dbg.NPCS.extra || []).find(n => CHARS.id(n) === 'shark'); SHOPS.open(N); const b = document.querySelector('#shopg [data-buy="scuba"]'); const label = b && b.textContent; b && b.click(); SHOPS.close();
    return { label, has: FORAGE.has('scuba'), cash: INV.cash, tank: SWIM.tankS, breathe: EQUIP.breathe }; });
  ok(rent.label === 'RENT' && rent.has === 1 && rent.cash === 460 && rent.tank === 300 && rent.breathe, 'THE SHARK rents the scuba set for $40: a full five-minute tank, worn at once: ' + JSON.stringify(rent));
  ok(await toMouth() && await wait(() => HUDSON.built && HUDSONDBG().inside && !FADE.busy, null, 120000).then(() => 1, () => 0), 'with the tank you swim through the mouth into the tunnel under the city');
  const t1 = await pg.evaluate(() => ({ tank: SWIM.tankS, air: __dbg.VIT.air, s: SWIMDBG() })); await pg.waitForTimeout(3000);
  const t2 = await pg.evaluate(() => ({ tank: SWIM.tankS, air: __dbg.VIT.air, s: SWIMDBG() }));
  ok(t2.tank < t1.tank && t2.air >= t1.air - .01 && t2.s.uw, 'in the flooded tunnel the tank breathes for you, not your own breath: ' + JSON.stringify({ t1: t1.tank, t2: t2.tank, air: t2.air }));
  await shot('tunnel');
  const pk = await pg.evaluate(async () => { const X = SHARED.BOD.XS, Z = SHARED.BOD.ZS; __dbg.UI.goTo(X(1339), Z(-33), 'down'); for (let i = 0; i < 60; i++) await new Promise(r => requestAnimationFrame(r));
    const t0 = performance.now(); while (__dbg.ST.water && __dbg.ST.water.y < __dbg.ST.water.level - 34 && performance.now() - t0 < 60000) { dispatchEvent(new KeyboardEvent('keydown', { key: 'Shift' })); await new Promise(r => setTimeout(r, 100)); }
    dispatchEvent(new KeyboardEvent('keyup', { key: 'Shift' })); const W = __dbg.ST.water; return { in: W && W.in, lv: W && W.level, y: W && W.y, under: W && W.y < W.level - 34, things: __dbg.UI.things.filter(t => /SHAFT/.test(t.name)).length }; });
  ok(pk.in && pk.lv === 75 && !pk.under && pk.things === 1, 'at the far end an air pocket you can surface in, and the old shaft up to the river: ' + JSON.stringify(pk));
  await pg.evaluate(() => HUDSON.go(0)); await wait(() => !HUDSON.built && !FADE.busy && SHARED.LVL === 'up', null, 120000);
  ok(await pg.evaluate(() => RIVER.on && Math.hypot(__dbg.pos()[0] - RIVER.mouth.x, __dbg.pos()[2] - RIVER.mouth.z) < 6), 'out again you are back over the mouth in the river');
  const empty = await pg.evaluate(() => { SWIM.tankS = .01; __dbg.VIT.supply(.05); return { has: FORAGE.has('scuba'), breathe: EQUIP.breathe, tank: SWIM.tankS }; });
  ok(!empty.has && !empty.breathe && empty.tank === 0, 'a dry tank goes back to the shark: ' + JSON.stringify(empty));
  ok(!errs.length, 'no page errors' + (errs.length ? ': ' + errs.slice(0, 3).join(' | ') : ''));
  await b.close(); console.log(fails.length ? fails.length + ' failed' : 'all swim checks passed'); process.exit(fails.length ? 1 : 0);
})();
