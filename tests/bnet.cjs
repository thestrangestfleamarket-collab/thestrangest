// THE BUTTERFLY NET CHECK: node tests/bnet.cjs dist/market.html. In the park by day: 5 butterflies in your hands, more in jars (the HOLDS property, summed);
// a perched one takes off when you run at it; a fast mouse swing sweeps the net's hoop through one and catches it; the Nature Merchant and the Fox sell jars, the merchant buys butterflies.
const { chromium } = require('playwright'), path = require('path');
const fails = [], ok = (c, m) => { if (!c) { fails.push(m); console.log((process.env.GITHUB_ACTIONS ? '::error title=bnet::' : 'FAIL ') + m); } else console.log('ok   ' + m); };
(async () => {
  const b = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const pg = await b.newPage({ viewport: { width: 800, height: 500 } }), errs = [];
  pg.on('pageerror', e => errs.push(e.message.slice(0, 300)));
  await pg.goto('file://' + path.resolve(process.argv[2] || 'dist/market.html') + '?fresh=1&hour=11&place=CENTRAL PARK', { waitUntil: 'commit' });
  await pg.waitForFunction(() => window.__started, null, { timeout: 300000 });
  await pg.waitForFunction(() => window.BFLYDBG && BFLYDBG().near > 0 && BFLY.out, null, { timeout: 180000, polling: 500 });
  const frames = n => pg.evaluate(async n => { for (let i = 0; i < n; i++) await new Promise(r => requestAnimationFrame(r)); }, n);

  const r1 = await pg.evaluate(() => { const o = { hands: BFLY.room() }; FORAGE.give('jar_s'); o.small = BFLY.room(); FORAGE.give('jar_l'); o.both = BFLY.room(); FORAGE.take('jar_s'); FORAGE.take('jar_l'); return o; });
  ok(r1.hands === 5 && r1.small === 20 && r1.both === 120, 'hands hold 5, a small jar 20, a small and a large jar 120: ' + JSON.stringify(r1));

  const r2 = await pg.evaluate(() => { FORAGE.give('b_0', 5); const w = BFLY.list().find(x => x.wild && x.g.parent), n0 = BFLY.held(); BFLY.catch(w, { spd: 30, air: false }); const o = { held: BFLY.held(), was: n0, still: !!w.g.parent }; FORAGE.take('b_0', 5); return o; });
  ok(r2.was === 5 && r2.held === 5 && r2.still, 'with 5 in hand and no jar, a butterfly cannot be caught: ' + JSON.stringify(r2));

  const r3 = await pg.evaluate(async () => { const T = __dbg.cv().TILE, w = BFLY.list().filter(x => x.wild && x.g.parent && !x.dur)[0]; if (!w) return null; const p = W3.group.position;
    w.perches = [[p.x + .5 * T, p.y + .6 * T, p.z], [p.x + 8 * T, p.y + .6 * T, p.z]]; w.at = w.to = 0; w.until = 1e9; for (let i = 0; i < 50 && w.until === 1e9 && !w.dur; i++) await new Promise(r => setTimeout(r, 60)); await new Promise(r => setTimeout(r, 200));
    return { off: w.until < 1e9 || !!w.dur, to: w.to }; });
  ok(r3 && r3.off && r3.to === 1, 'a perched butterfly takes off from you as you come close, away from you: ' + JSON.stringify(r3));

  // the swing: hold the net, aim a little ahead, set a butterfly where the hoop rests, aim off to one side, then sweep the mouse fast across (through where it rested)
  const scr = async (fx, fz) => pg.evaluate(([fx, fz]) => { const T = __dbg.cv().TILE, h = SHARED.heading, p = __dbg.pos(), v = new __dbg.THREE.Vector3(p[0] + Math.sin(h) * fz * T + Math.cos(h) * fx * T, p[1] + .9 * T, p[2] + Math.cos(h) * fz * T - Math.sin(h) * fx * T).project(SHARED.cam), r = __dbg.renderer.domElement.getBoundingClientRect();
    return [r.left + (v.x + 1) / 2 * r.width, r.top + (1 - v.y) / 2 * r.height]; }, [fx, fz]);
  await pg.evaluate(() => { FORAGE.S.sk.ento = 1000; FORAGE.give('net'); WIELD.set('net'); });
  let c = await scr(0, 1.2); await pg.mouse.move(c[0], c[1]); await frames(40);
  const r4a = await pg.evaluate(() => { const w = BFLY.list().filter(x => x.wild && x.g.parent && !x.dur).sort((a, b) => a.g.position.distanceTo(W3.group.position) - b.g.position.distanceTo(W3.group.position))[0], H = WIELD.head;
    w.perches = [[H.x, H.y, H.z]]; w.at = w.to = 0; w.until = 1e9; w.nt = 0; w.fast = -.75; window.__bt = w; return { k: w.k, b: BFLY.held() }; });
  c = await scr(-2.5, 1.2); await pg.mouse.move(c[0], c[1]); await frames(40);
  await pg.evaluate(() => { __bt.until = 1e9; });
  const e = await scr(2.5, 1.2); await pg.mouse.move(e[0], e[1], { steps: 4 }); await frames(20);
  const r4 = await pg.evaluate(() => ({ held: BFLY.held(), gone: !__bt.g.parent }));
  ok(r4.held === r4a.b + 1 && r4.gone, 'a fast sweep of the net through a butterfly catches it: ' + JSON.stringify({ ...r4a, ...r4 }));
  // the mouse takes the arm round in a full circle: above him the hoop rises over his head, below him it drops; a left-hander's net is in the left hand
  const hoop = () => pg.evaluate(() => { const p = __dbg.pos(), h = SHARED.heading, H = WIELD.head; return { y: H.y - p[1], side: (H.z - p[2]) * Math.sin(h) - (H.x - p[0]) * Math.cos(h) }; });
  const body = await pg.evaluate(() => { const v = W3.group.position.clone(); v.y += __dbg.cv().TILE * 1.3; v.project(SHARED.cam); const r = __dbg.renderer.domElement.getBoundingClientRect(); return [r.left + (v.x + 1) / 2 * r.width, r.top + (1 - v.y) / 2 * r.height, r.height]; });
  await pg.mouse.move(body[0], body[1] - body[2] * .4); await frames(30); const hi = await hoop(); await pg.mouse.move(body[0], body[1] + body[2] * .4); await frames(30); const lo = await hoop();
  await pg.mouse.move(body[0] - body[2] * .3, body[1]); await frames(30); const rt = await hoop(); await pg.evaluate(() => PASSPORT.setHand('L')); await frames(30); const lf = await hoop(); await pg.evaluate(() => PASSPORT.setHand('R'));
  ok(hi.y > lo.y + 1 && lf.side < rt.side - .1, 'the net goes over his head and down past his knees as the mouse circles him, and into the left hand for a left-hander: ' + JSON.stringify({ hi, lo, rt, lf }));

  const r5 = await pg.evaluate(async () => { INV.cash = 100; const N = __dbg.NPCS.find(n => CHARS.id(n) === 'origamifox'), F = __dbg.NPCS.find(n => CHARS.id(n) === 'fox'), o = {};
    o.fox = !!(F && CHARS.trade(F) && CHARS.trade(F).sells.includes('jar_m'));
    SHOPS.open(N); const q = s => document.querySelector('#shopg ' + s); o.buyRow = !!q('[data-buy="jar_m"]'); SHOPS.buy('jar_m'); o.jar = FORAGE.has('jar_m'); o.room = BFLY.room(); o.cash = INV.cash;
    FORAGE.give('b_3', 2); SHOPS.draw(); const sb = q('[data-sold="b_3"]'); o.sellRow = !!sb; if (sb) SHOPS.sell('b_3', INV.items.b_3); o.left = FORAGE.has('b_3'); o.paid = INV.cash - o.cash; SHOPS.close(); return o; });
  ok(r5.fox && r5.jar === 1 && r5.room === 50 && r5.cash === 86 && r5.sellRow && r5.left === 0 && r5.paid > 0, 'the Fox sells jars; the Nature Merchant sells a medium jar ($14, room 50) and buys butterflies: ' + JSON.stringify(r5));

  ok(!errs.length, 'no page errors' + (errs.length ? ': ' + errs.join(' | ') : ''));
  await b.close(); if (fails.length) process.exit(1);
})();
