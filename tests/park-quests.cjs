// THE PARK'S FINDS CHECK: node tests/park-quests.cjs dist/market.html [shots dir]. Nothing is built at the start; in the park the orchard, the hollow oak, the ball pond, the hidden green and the moth lamp are placed; the well's key opens the orchard (fruit and seeds once a day, thorns scratch); the wild hive stings without smoke and gives honey and once a queen with it; the pond gives balls and its turtle bites a wader; a ball holed on the green pays once a day; the loft is climbed and its lamp lit at midnight brings moths to net and bats; in the snow the lake freezes, an auger cuts a hole that fishes the ice's own fish, and thin ice cracks under you.
const { chromium } = require('playwright'), path = require('path'), fs = require('fs');
const fails = [], ok = (c, m) => { if (!c) { fails.push(m); console.log((process.env.GITHUB_ACTIONS ? '::error title=park-quests::' : 'FAIL ') + m); } else console.log('ok   ' + m); };
const SHOTS = process.argv[3];
(async () => {
  const b = await chromium.launch({ ...(process.env.PWCHROME ? { executablePath: process.env.PWCHROME } : {}), args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const pg = await b.newPage({ viewport: { width: 960, height: 600 } }), errs = [];
  pg.on('pageerror', e => errs.push(e.message.slice(0, 300)));
  await pg.goto('file://' + path.resolve(process.argv[2] || 'dist/market.html') + '?fresh=1&hour=13&wx=SNOW', { waitUntil: 'commit' });
  let st = false; for (let i = 0; i < 60 && !st; i++) { await pg.waitForTimeout(3000); st = await pg.evaluate(() => !!window.__started).catch(() => false); }
  ok(st, 'the page starts');
  const wait = async (f, ms = 60000, a) => { for (let t = 0; t < ms; t += 500) { if (await pg.evaluate(f, a).catch(() => false)) return true; await pg.waitForTimeout(500); } return false; };
  const shot = async n => { if (SHOTS) { fs.mkdirSync(SHOTS, { recursive: true }); await pg.waitForTimeout(1200); await pg.screenshot({ path: path.join(SHOTS, n + '.png'), timeout: 90000 }).catch(() => {}); } };
  const ev = (f, a) => pg.evaluate(f, a);
  if (st) {
    ok(await ev(() => !PQDBG().placed), 'nothing of the park\'s finds is built at the start');
    await ev(() => { for (const k in FORAGE.S.sk) FORAGE.S.sk[k] = 1000; STORE.goTo(-34, 245, 'up'); });
    ok(await wait(() => PQDBG().placed, 180000), 'in the park, its finds are placed: ' + JSON.stringify(await ev(() => PQDBG())));
    const D = await ev(() => PQDBG());
    ok(D.orch && D.hive && D.loft && !D.pond && !D.green, 'the orchard, the hollow oak and the moth lamp all found room (no golf: archived 8 Nov 2026)');
    const go = (x, z) => ev(([x, z]) => { STORE.goTo(x, z, 'up'); }, [x, z]);
    const hurt = () => ev(() => __dbg.VIT.hp);
    // the orchard
    if (D.orch) {
      const r = await ev(() => { const o = []; PQ.gate(false); o.push(PQ.ORCH.trees.length, FORAGE.has('orchard_key')); return o; });
      ok(r[0] === 6 && !r[1], 'six old trees behind a locked gate: ' + JSON.stringify(r));
      const k = await ev(() => { const W = __dbg.UI.things.find(t => t.name === 'THE CASTLE WELL'); W.act(); const a = FORAGE.has('orchard_key'); W.act(); return [a, FORAGE.has('orchard_key')]; });
      ok(k[0] === 1 && k[1] === 1, 'the castle well gives the orchard\'s key, once: ' + JSON.stringify(k));
      await ev(() => { const O = PQ.ORCH; STORE.goTo(O.x, O.z - O.d - 1.4 * __dbg.cv().TILE, 'up'); }); await pg.waitForTimeout(1500);
      const inn = await ev(() => { PQ.gate(false); const O = PQ.ORCH, y = __dbg.you(); return Math.abs(y.x - O.x) < O.w && Math.abs(y.z - O.z) < O.d; });
      ok(inn, 'the key opens the gate: you step into the orchard');
      await pg.waitForTimeout(1500); await shot('orchard');
      const f = await ev(() => { const t = PQ.ORCH.trees[0], n0 = FORAGE.has(t.id); PQ.pick(t); const n1 = FORAGE.has(t.id); PQ.pick(t); PQ.seeds(); const sd = FORAGE.has('sd_sweetpea') + FORAGE.has('sd_hollyhock'); return [n1 - n0, FORAGE.has(t.id) - n1, sd]; });
      ok(f[0] >= 1 && f[1] === 0 && f[2] === 1, 'a tree gives its heirloom fruit once a day, the seed bed a packet of seeds: ' + JSON.stringify(f));
      const pl = await ev(() => { const id = FORAGE.has('sd_sweetpea') ? 'sd_sweetpea' : 'sd_hollyhock'; return !!(GARDEN.FL[id.slice(3)] && GARDEN.SEED[id.slice(3)]); });
      ok(pl, 'the heirloom seeds plant through the garden\'s own path');
      await ev(() => __dbg.VIT.heal(1)); const h0 = await hurt(); await ev(() => { const [x, z] = PQ.ORCH.thorns[0]; STORE.goTo(x, z, 'up'); }); await pg.waitForTimeout(2500);
      ok((await hurt()) < h0, 'the thorns scratch you');
      await ev(() => PQ.gate(true)); await pg.waitForTimeout(800);
      const c = await ev(() => { for (let i = 0; i < 30; i++) { PQ.climbWall(); const O = PQ.ORCH, y = __dbg.you(); if (Math.abs(y.x - O.x) < O.w && Math.abs(y.z - O.z) < O.d) return i + 1; } return 0; });
      ok(c > 0, 'the wall can be climbed (CLIMBING), in ' + c + ' tries');
      await ev(() => PQ.gate(true));
    }
    // the wild hive
    if (D.hive) {
      await ev(() => STORE.goTo(PQ.HIVE.x, PQ.HIVE.z + 1.5 * __dbg.cv().TILE, 'up')); await pg.waitForTimeout(1500);
      await ev(() => __dbg.VIT.heal(1)); const h0 = await hurt(); await ev(() => PQ.wild()); const h1 = await hurt();
      ok(h1 < h0, 'without a smoker the swarm stings');
      const w = await ev(() => { FORAGE.give('bee_smoker', 1); FORAGE.give('jar_honey', 3); const n0 = FORAGE.has('honey_wild'), q0 = FORAGE.has('bee_hive'); for (let i = 0; i < 10 && FORAGE.has('honey_wild') === n0; i++) PQ.wild(); return [FORAGE.has('honey_wild') - n0, FORAGE.has('bee_hive') - q0]; });
      ok(w[0] >= 1 && w[1] === 1, 'with smoke and jars, wild honey and once a queen: ' + JSON.stringify(w));
      await shot('hive');
    }
    // the moth lamp
    if (D.loft) {
      await ev(() => STORE.goTo(PQ.LOFT.foot[0], PQ.LOFT.foot[1], 'up')); await pg.waitForTimeout(1500);
      await ev(() => PQ.climbLoft(1));
      ok(await wait(() => PQ.LOFT.up, 20000), 'you climb the ladder to the wall-walk');
      await pg.waitForTimeout(1000);
      const y = await ev(() => ({ py: SHARED.py, top: PQ.LOFT.top }));
      ok(Math.abs(y.py - y.top) < 1, 'and stand at the top: ' + JSON.stringify(y));
      ok(await ev(() => { PQ.lamp(); return !PQ.LOFT.lit; }), 'by day the lamp will not draw moths');
      await ev(() => { CLOCK.run = true; CLOCK.speed = 0; CLOCK.h = 23.6; PQ.lamp(); });
      ok(await ev(() => PQ.LOFT.lit && PQ.LOFT.moths.length === 6), 'lit at midnight, six moths come to its sheet');
      await shot('mothlamp');
      const m = await ev(() => { FORAGE.give('net', 1); const n0 = Object.keys(INV.items).filter(k => k.startsWith('mo_')).reduce((a, k) => a + INV.items[k], 0); for (let i = 0; i < 10 && PQ.LOFT.moths.length; i++) PQ.net(PQ.LOFT.moths[0]); return Object.keys(INV.items).filter(k => k.startsWith('mo_')).reduce((a, k) => a + INV.items[k], 0) - n0; });
      ok(m >= 1, 'the net catches moths: ' + m);
      await ev(() => { PQ.LOFT.lit = false; PQ.lamp(); });
      const n0 = await ev(() => PQ.LOFT.moths.length);
      ok(await wait(n => { PQ.step(.5); return PQ.LOFT.moths.length < n; }, 30000, n0), 'a bat swoops and takes a moth from a slow netter');
      await ev(() => PQ.climbLoft(-1)); ok(await wait(() => { PQ.step(.5); return !PQ.LOFT.up && !PQ.LOFT.mode; }, 30000), 'and you climb back down');
      await ev(() => { CLOCK.run = false; CLOCK.speed = 1; });
    }
    // the ice
    const T = await ev(() => __dbg.cv().TILE);
    const spots = await ev(() => { const T = __dbg.cv().TILE, B = SHARED.BOD, L = FOUNT.S.L, cx = B.XS(L.x + (PARK.ox || 0)), cz = B.ZS(L.y + (PARK.oy || 0)); let thick = null, thin = null;
      for (let a = 0; a < 6.28 && !(thick && thin); a += .2) for (let r = 0; r < 120; r += 1) { const x = cx + Math.cos(a) * r * T, z = cz + Math.sin(a) * r * T, d = PQ.lk(x, z); if (!thin && d > 20) thin = [x, z]; if (!thick && d > 3 && d < 8) thick = [x, z]; } return { thick, thin }; });
    await go(...spots.thick);
    ok(await wait(() => PQ.ICE.on, 60000), 'in the snow the big lake freezes: ' + JSON.stringify(await ev(() => PQDBG().ice)));
    await pg.waitForTimeout(2000);
    const iy = await ev(() => ({ held: FOUNT.held(__dbg.you().x, __dbg.you().z), swim: !!FOUNT.swim, py: SHARED.py, ice: PQ.iceY() }));
    ok(iy.held && !iy.swim && Math.abs(iy.py - iy.ice) < .5, 'you walk on the ice, not swim: ' + JSON.stringify(iy));
    await shot('ice');
    const fz = await ev(() => { const y = __dbg.you(); return FISHING.at(y.x + 3, y.z + 3); });
    ok(fz === null, 'the frozen lake cannot be fished without a hole');
    const hl = await ev(() => { const a = PQ.drill(); FORAGE.give('auger', 1); const h = PQ.drill(); if (!h) return null; const w = FISHING.at(h.x, h.z), o = FISHING.odds(h.x, h.z, 'bait'); return { none: !a, kind: w && w.kind, fish: o && Object.keys(o.per) }; });
    ok(hl && hl.none && hl.kind === 'ice' && hl.fish.includes('x_smelt') && hl.fish.every(id => ['x_smelt', 'x_whitefish', 'x_burbot'].includes(id)), 'an auger drills a hole that fishes the cold-water fish only: ' + JSON.stringify(hl));
    await go(...spots.thin); await pg.waitForTimeout(2000);
    ok(await wait(() => { PQ.step(.5); return PQ.ICE.cracks.length > 0; }, 30000), 'standing still on the thin ice, it cracks');
    ok(await wait(() => !!FOUNT.swim, 30000), 'and you are in the water');
  }
  ok(!errs.length, 'no page errors' + (errs.length ? ': ' + errs.slice(0, 3).join(' | ') : ''));
  await b.close(); console.log(fails.length ? fails.length + ' FAILED' : 'ALL OK'); process.exit(fails.length ? 1 : 0);
})();
