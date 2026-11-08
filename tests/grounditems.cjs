// THE GROUND'S THINGS CHECK (owner, 8 Nov 2026: "when you drop items on ground they should have their own icons and be realistic relative size"): node tests/grounditems.cjs [dist/market.html] [shot.png].
// A dropped thing with a model of its own lies at its real size (a BMX about 1.7 m, a sword about 1 m); one without stands as its own picture at its real size (a guitar about 1 m, a ruby a few cm); none is the parcel.
const { chromium } = require('playwright'), path = require('path');
const ROOT = path.resolve(__dirname, '..'), PAGE = path.resolve(process.argv[2] || ROOT + '/dist/market.html'), SHOT = process.argv[3] || null;
const fails = [], ok = (c, m) => { if (!c) { fails.push(m); console.log((process.env.GITHUB_ACTIONS ? '::error title=grounditems::' : 'FAIL ') + m); } else console.log('ok   ' + m); };
(async () => {
  const b = await chromium.launch({ executablePath: process.env.PW_CHROMIUM || undefined, args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader'] }), pg = await b.newPage({ viewport: { width: 1000, height: 700 } });
  const errs = {}; pg.on('pageerror', e => { errs[e.message] = (errs[e.message] || 0) + 1; });
  await pg.goto('file://' + PAGE + '?hour=13&fresh=1', { waitUntil: 'commit', timeout: 300000 });
  let up = false; for (let i = 0; i < 400 && !(up = await pg.evaluate(() => !!window.__started).catch(() => false)); i++) await pg.waitForTimeout(1000);
  if (!up) { ok(false, 'the page started'); await b.close(); process.exit(1); }
  await pg.evaluate(() => LOAD('later')); await pg.waitForTimeout(5000);
  const ITEMS_ = [['guitar', 1.0, 'picture'], ['bmx', 1.7, 'model'], ['sword', .99, 'model'], ['ruby', .04, 'picture'], ['g_soda', .12, 'picture']];
  // an open lawn in the park (where a deer grazes), the things laid out in a row in front of you
  await pg.evaluate(() => { const d = __dbg.NPCS.find(n => n.key === 'deer'); if (d) __dbg.ui().goTo(d.st.x + 6, d.st.z + 6); }); for (let i = 0; i < 90 && await pg.evaluate(() => !!document.querySelector('#fade') && getComputedStyle(document.querySelector('#fade')).opacity > .05).catch(() => false); i++) await pg.waitForTimeout(1000); await pg.waitForTimeout(25000);
  const r = await pg.evaluate(async L => { const T = __dbg.cv().TILE, M = T / .84, P = __dbg.pos(), h = __dbg.cv().heading, fx = Math.sin(h), fz = Math.cos(h), out = {};
    L.forEach(([id], i) => { FORAGE.give(id, 1); BAG.drop(id, 1, { x: P[0] + fx * 2.2 * M + fz * (i - 2) * 1.1 * M, y: P[1], z: P[2] + fz * 2.2 * M - fx * (i - 2) * 1.1 * M }); });
    for (let t = 0; t < 60 && !L.every(([id]) => { const g = BAG.ground.find(q => q.id === id); return g && g.m; }); t++) await new Promise(r => setTimeout(r, 500));
    for (const [id] of L) { const g = BAG.ground.find(q => q.id === id); if (!g || !g.m) { out[id] = null; continue; } g.sp.updateMatrixWorld(true); let sprite = false; g.m.traverse(o => { if (o.isSprite) sprite = true; });
      const B = { min: [1e9, 1e9, 1e9], max: [-1e9, -1e9, -1e9] }; g.m.traverse(o => { if (!o.isMesh && !o.isSprite) return; if (o.isSprite) { const s = o.getWorldScale(new o.position.constructor()), p = o.getWorldPosition(new o.position.constructor()); for (const [k, v] of [[0, p.x], [1, p.y], [2, p.z]]) { const h = k === 1 ? s.y / 2 : s.x / 2; B.min[k] = Math.min(B.min[k], v - h); B.max[k] = Math.max(B.max[k], v + h); } return; }
        const gg = o.geometry; if (!gg.boundingBox) gg.computeBoundingBox(); const e = o.matrixWorld.elements; for (const X of [gg.boundingBox.min.x, gg.boundingBox.max.x]) for (const Y of [gg.boundingBox.min.y, gg.boundingBox.max.y]) for (const Z of [gg.boundingBox.min.z, gg.boundingBox.max.z]) { const p = [e[0] * X + e[4] * Y + e[8] * Z + e[12], e[1] * X + e[5] * Y + e[9] * Z + e[13], e[2] * X + e[6] * Y + e[10] * Z + e[14]]; for (let k = 0; k < 3; k++) { B.min[k] = Math.min(B.min[k], p[k]); B.max[k] = Math.max(B.max[k], p[k]); } } });
      out[id] = { m: (sprite ? g.m.parent.parent && 0 || (g.m.children[0] && g.m.children[0].isSprite ? (() => { const c = g.m.children[0].material.map.image, W = c.width, H = c.height, D = c.getContext('2d').getImageData(0, 0, W, H).data; let x0 = W, x1 = -1, y0 = H, y1 = -1; for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if (D[(y * W + x) * 4 + 3] > 127) { x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y); } return g.m.children[0].scale.x * Math.max(x1 - x0 + 1, y1 - y0 + 1) / W; })() : Math.max(...B.max.map((v, k) => v - B.min[k]))) : Math.max(...B.max.map((v, k) => v - B.min[k]))) / M, sprite }; }
    return out; }, ITEMS_);
  for (const [id, want, kind] of ITEMS_) { const x = r[id]; ok(x && Math.abs(x.m - want) / want < .25 && x.sprite === (kind === 'picture'), id + ' lies as its ' + kind + ' at about ' + want + ' m (' + (x ? x.m.toFixed(2) + ' m' + (x.sprite ? ', picture' : ', model') : 'not drawn') + ')'); }
  if (SHOT) { await pg.evaluate(() => { __dbg.ui().setView && __dbg.ui().setView('third'); }); await pg.waitForTimeout(1500); await pg.mouse.move(500, 350); for (let i = 0; i < 6; i++) { await pg.mouse.wheel(0, -300); await pg.waitForTimeout(150); } await pg.waitForTimeout(2500); await pg.screenshot({ path: SHOT }); }
  ok(!Object.keys(errs).length, 'no page errors' + (Object.keys(errs).length ? ': ' + JSON.stringify(errs).slice(0, 300) : ''));
  await b.close(); console.log(fails.length ? fails.length + ' failed' : 'all passed'); process.exit(fails.length ? 1 : 0);
})();
