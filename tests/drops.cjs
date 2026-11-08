// THE GROUND DROPS CHECK: node tests/drops.cjs dist/market.html. A quick bar slot dragged onto the world drops one where you point (within 3 tiles), Shift the whole stack, the slot emptying when none is left; dragged off the bar elsewhere it only leaves the bar; the thing lies on the ground in its own 3D look, drawn only near you, and a double click brings it back to the pack; a drop's time up, it goes; the room's word on drops is followed (one already gone, one missing when you join again).
const { chromium } = require('playwright'), path = require('path');
const fails = [], ok = (c, m) => { if (!c) { fails.push(m); console.log((process.env.GITHUB_ACTIONS ? '::error title=drops::' : 'FAIL ') + m); } else console.log('ok   ' + m); };
(async () => {
  const b = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const pg = await b.newPage({ viewport: { width: 1000, height: 700 } }), errs = [];
  pg.on('pageerror', e => errs.push(e.message.slice(0, 300)));
  await pg.goto('file://' + path.resolve(process.argv[2] || 'dist/market.html') + '?fresh=1&hour=12&at=32,25', { waitUntil: 'commit' });
  await pg.waitForFunction(() => window.__started, null, { timeout: 400000 }); await pg.waitForFunction(() => { const L = document.getElementById('loading'); return !L || L.style.pointerEvents === 'none'; }, null, { timeout: 60000 }); await pg.waitForTimeout(1500);
  if (process.env.SHOT) await pg.evaluate(() => __dbg.UI.setView('third'));
  const at = sel => pg.evaluate(sel => { const r = document.querySelector(sel).getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; }, sel);
  const ahead = d => pg.evaluate(d => { const T = TILE_(), cv = [...document.querySelectorAll('canvas')].sort((a, b) => b.clientWidth * b.clientHeight - a.clientWidth * a.clientHeight)[0], r = cv.getBoundingClientRect(), P = __dbg.you(), V = SHARED.cam.position.constructor;   // the first way round you, from your heading, whose point d tiles off lies on the bare game view
    for (let k = 0; k < 16; k++) { const h = (SHARED.heading || 0) + k * Math.PI / 8, v = new V(P.x + Math.sin(h) * d * T, SHARED.py, P.z + Math.cos(h) * d * T), w = v.clone().project(SHARED.cam), x = r.left + (w.x + 1) / 2 * r.width, y = r.top + (1 - w.y) / 2 * r.height;
      if (x > 40 && x < innerWidth - 40 && y > 40 && y < innerHeight - 40 && document.elementFromPoint(x, y) === cv) return { x, y, wx: v.x, wz: v.z }; } return null; }, d);
  // the browser's own drag events, dispatched as a drag would send them (headless Chromium's emulated drag and drop crashes the page here): dragstart on the slot, dragover and drop on whatever lies under the point, dragend on the slot
  const drag = async (from, to, shift) => { await pg.evaluate(({ from, to, shift }) => { const s = document.querySelector(from), dt = new DataTransfer(), o = { dataTransfer: dt, bubbles: true, cancelable: true, clientX: to.x, clientY: to.y, shiftKey: !!shift };
    s.dispatchEvent(new DragEvent('dragstart', o)); const u = document.elementFromPoint(to.x, to.y) || [...document.querySelectorAll('canvas')].sort((a, b) => b.clientWidth * b.clientHeight - a.clientWidth * a.clientHeight)[0]; const over = new DragEvent('dragover', o); u.dispatchEvent(over); if (over.defaultPrevented) u.dispatchEvent(new DragEvent('drop', o)); s.dispatchEvent(new DragEvent('dragend', o)); }, { from, to, shift }); await pg.waitForTimeout(500); };
  await pg.evaluate(() => { window.TILE_ = () => 33.9 / 30; window.__box = o => { const V = SHARED.cam.position.constructor, mn = new V(1e9, 1e9, 1e9), mx = new V(-1e9, -1e9, -1e9); o.updateMatrixWorld(true); o.traverse(c => { if (!c.isMesh) return; c.geometry.computeBoundingBox(); const B = c.geometry.boundingBox; for (let i = 0; i < 8; i++) { const p = new V(i & 1 ? B.max.x : B.min.x, i & 2 ? B.max.y : B.min.y, i & 4 ? B.max.z : B.min.z).applyMatrix4(c.matrixWorld); mn.min(p); mx.max(p); } }); return { min: mn, max: mx, getCenter: v => v.copy(mn).add(mx).multiplyScalar(.5) }; }; for (const g of BAG.ground.slice()) g.th.act(); FORAGE.give('fr_apple', 3); FORAGE.give('quartz', 2); HUD.set(0, 'fr_apple'); HUD.set(1, 'quartz'); });
  const p = await ahead(1.6), a0 = await pg.evaluate(() => INV.items.fr_apple);
  await drag('#hqb .qs[data-i="0"]', p);
  let r = await pg.evaluate(() => { const D = BAGDBG(), g = D.ground.find(q => q.id === 'fr_apple'); return { n: INV.items.fr_apple, slot: HUD.slots[0], g, lines: HUD.lines().slice(-3), m: BAG.ground.find(q => q.id === 'fr_apple') }; });
  const g1 = r.g;
  ok(g1 && g1.n === 1 && r.n === a0 - 1 && r.slot === 'fr_apple', 'an apple dragged off the bar onto the world: one drops, two left, the slot kept ' + JSON.stringify({ n: r.n, slot: r.slot, g: g1 }));
  ok(g1 && Math.hypot(g1.x - p.wx, g1.z - p.wz) < .6 * 1.13, 'it lies where you pointed, 1.6 tiles ahead ' + JSON.stringify({ g: g1 && [g1.x, g1.z], at: [p.wx, p.wz] }));
  ok(/YOU DROP THE APPLE/.test(r.lines.join('|')), 'the log says YOU DROP THE APPLE');
  r = await pg.evaluate(() => { const g = BAG.ground.find(q => q.id === 'fr_apple'); let meshes = 0; g.sp.traverse(c => { if (c.isMesh) meshes++; }); const b = __box(g.sp); return { drawn: BAGDBG().ground.find(q => q.id === 'fr_apple').drawn, meshes, sprite: g.sp.isSprite, w: +(b.max.x - b.min.x).toFixed(2), foot: +(b.min.y - g.y).toFixed(3), until: (g.until - Date.now()) / 6e4, name: g.th.name }; });
  ok(r.drawn && r.meshes > 0 && !r.sprite && r.w > .1 && r.w < 1.2 && Math.abs(r.foot) < .02, 'it lies on the ground in its own 3D look (no flat picture) ' + JSON.stringify(r));
  ok(r.until > 59 && r.until <= 120, 'it lasts 60 to 120 minutes (' + r.until.toFixed(1) + ')');
  if (process.env.SHOT) await pg.screenshot({ path: process.env.SHOT });
  await drag('#hqb .qs[data-i="1"]', await ahead(1.2), true);
  r = await pg.evaluate(() => ({ q: INV.items.quartz || 0, slot: HUD.slots[1], g: BAGDBG().ground.find(q => q.id === 'quartz'), name: (BAG.ground.find(q => q.id === 'quartz') || { th: {} }).th.name }));
  ok(r.q === 0 && r.g && r.g.n === 2 && r.slot == null && /×2/.test(r.name || ''), 'Shift drops the whole stack and the slot empties ' + JSON.stringify(r));
  const far = await ahead(4.5); await drag('#hqb .qs[data-i="0"]', far);
  r = await pg.evaluate(() => BAGDBG().ground.filter(q => q.id === 'fr_apple').map(q => q.d));
  ok(r.length === 2 && r.every(d => d < 3.1), 'pointing past 3 tiles drops it at your feet instead ' + JSON.stringify(r));
  await pg.evaluate(() => HUD.set(2, 'fr_apple')); const a2 = await pg.evaluate(() => INV.items.fr_apple), n2 = await pg.evaluate(() => BAG.ground.length); await drag('#hqb .qs[data-i="2"]', await at('#hqb .qg'));
  r = await pg.evaluate(() => ({ slot: HUD.slots[2], n: BAG.ground.length, a: INV.items.fr_apple })); r.a0 = a2;
  ok(r.slot == null && r.n === n2 && r.a === r.a0, 'dragged off the bar but not onto the world, it only leaves the bar ' + JSON.stringify(r));
  // a double click on it: you walk to it and it is back in the pack
  const q = await pg.evaluate(() => { const g = BAG.ground.find(q => q.id === 'quartz'), v = __box(g.sp).getCenter(new (SHARED.cam.position.constructor)()).project(SHARED.cam), r = [...document.querySelectorAll('canvas')].sort((a, b) => b.clientWidth * b.clientHeight - a.clientWidth * a.clientHeight)[0].getBoundingClientRect(); return { x: r.left + (v.x + 1) / 2 * r.width, y: r.top + (1 - v.y) / 2 * r.height }; });
  await pg.mouse.dblclick(q.x, q.y); await pg.waitForFunction(() => (INV.items.quartz || 0) === 2, null, { timeout: 30000 }).catch(() => {});
  r = await pg.evaluate(() => ({ q: INV.items.quartz || 0, left: BAG.ground.filter(g => g.id === 'quartz').length, lines: HUD.lines().slice(-2) }));
  ok(r.q === 2 && r.left === 0, 'a double click on the quartz brings both back to the pack ' + JSON.stringify(r));
  // drawn only near you; time up, it goes; the room's word followed
  r = await pg.evaluate(async () => { const P = __dbg.you(); ONLINE.feed({ t: 'world', k: 'drop:far1', v: JSON.stringify({ id: 'quartz', n: 1, x: P.x + 40 * 1.13, y: SHARED.py, z: P.z, lv: 'street', t: Date.now(), until: Date.now() + 36e5 }) });
    ONLINE.feed({ t: 'world', k: 'drop:old1', v: JSON.stringify({ id: 'quartz', n: 1, x: P.x, y: SHARED.py, z: P.z, lv: 'street', t: Date.now() - 9e6, until: Date.now() - 1000 }) });
    await new Promise(r => setTimeout(r, 600)); const D = BAGDBG(), far = D.ground.find(g => g.key === 'drop:far1'), old = D.ground.some(g => g.key === 'drop:old1');
    const a = BAG.ground.find(g => g.id === 'fr_apple'); a.until = Date.now() - 1; await new Promise(r => setTimeout(r, 800)); const apples = BAG.ground.filter(g => g.id === 'fr_apple').length;
    ONLINE.feed({ t: 'hi', you: 'me', all: [], world: {} }); await new Promise(r => setTimeout(r, 300)); const gone = !BAG.ground.some(g => g.key === 'drop:far1');
    return { far: far && { drawn: far.drawn, d: far.d }, old, apples, gone, saved: JSON.parse(JSON.parse(localStorage.getItem('market-save')).ground || '[]').length }; });
  ok(r.far && !r.far.drawn, 'a drop 40 tiles away is known but not drawn ' + JSON.stringify(r.far));
  ok(!r.old, 'a drop whose time is up is not laid down');
  ok(r.apples === 1 && r.saved === 1, 'an apple\'s time up, it goes (and from the saved ground) ' + JSON.stringify(r));
  ok(r.gone, 'joining again, a drop the room no longer has goes');
  ok(!errs.length, 'no page errors ' + JSON.stringify(errs.slice(0, 3)));
  await b.close(); console.log(fails.length ? fails.length + ' FAILED' : 'all ground drop checks passed'); process.exit(fails.length ? 1 : 0);
})();
