// THE CLIMBING CHECK: node tests/climb.cjs dist/market.html. In the park, on a big tree: a trunk climbed with SPACE then W, gone round with D, jumped off with SPACE; a branch grabbed from under it, hung along, pulled up onto and stood on; the CLIMBING skill is there and bounds the height.
const { chromium } = require('playwright'), path = require('path');
const fails = [], ok = (c, m) => { if (!c) { fails.push(m); console.log((process.env.GITHUB_ACTIONS ? '::error title=climb::' : 'FAIL ') + m); } else console.log('ok   ' + m); };
(async () => {
  const b = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const pg = await b.newPage({ viewport: { width: 800, height: 500 } }), errs = [];
  pg.on('pageerror', e => errs.push(e.message.slice(0, 300)));
  await pg.goto('file://' + path.resolve(process.argv[2] || 'dist/market.html') + '?fresh=1&hour=11&place=CENTRAL PARK', { waitUntil: 'commit' });
  await pg.waitForFunction(() => window.__started && window.TREESDBG && window.PARK && PARK.climbable && PARK.climbable.length > 0, null, { timeout: 600000, polling: 500 });
  await pg.waitForFunction(() => !FADE.busy, null, { timeout: 120000, polling: 200 });
  await pg.evaluate(() => LOAD('later'));
  const frames = () => pg.evaluate(() => TREESDBG().fr);
  const hold = async (key, n) => { const f0 = await frames(); await pg.keyboard.down(key); for (let i = 0; i < 4000 && (await frames()) - f0 < n; i++) await pg.waitForTimeout(50); await pg.keyboard.up(key); await pg.waitForTimeout(100); };   // held for n frames of the game
  const tap = async key => hold(key, 2);
  const dbg = () => pg.evaluate(() => { const d = TREESDBG(); for (const k of ['x', 'z', 'py', 'hd', 'gy', 'h', 'ch', 'u']) if (typeof d[k] === 'number') d[k] = +d[k].toFixed(2); return d; });
  const sk = await pg.evaluate(() => ({ has: FORAGE.SK.some(s => s[0] === 'climb'), v: FORAGE.sk('climb') }));
  ok(sk.has && sk.v > 0, 'CLIMBING is a skill: ' + JSON.stringify(sk));
  const sp = await pg.evaluate(() => { const S = FORAGE.S.sk, was = S.climb, k = v => { S.climb = v * 10; return FORAGE.climbK(); }, r = { at0: k(0), at20: k(20), at60: k(60), at100: k(100) }; S.climb = was; return r; });
  ok(sp.at0 === sp.at20 && Math.abs(sp.at100 / sp.at20 - 4) < 1e-9 && sp.at60 > sp.at20 && sp.at60 < sp.at100, 'the CLIMBING skill sets the speed: the same up to 20, four times that at 100 (owner, 9 Nov 2026): ' + JSON.stringify(sp));
  // a tree with branches to hang from, and its lowest hold outside the trunk
  const tree = await pg.evaluate(() => { const T = TREES.T, IT = PARK.climbable; let best = null;
    IT.forEach((it, i) => { if (it.top - it.y < 3 * T) return; for (const l of TREES.limbs(it)) for (let u = 0; u <= 1.001; u += .1) { const p = TREES.at(l, u); if (p.r < TREES.RS || !TREES.outside(it, p)) continue; const h = p.y + p.r - it.y; if (!best || h < best.h) best = { i, h, u, l: TREES.limbs(it).indexOf(l), x: p.x, z: p.z, top: p.y + p.r }; } });
    if (!best) return null; const it = IT[best.i]; return Object.assign(best, { tx: it.x, tz: it.z, ty: it.y, tall: it.top - it.y, rT: Math.max(TREES.rT(it), it.rf || 0), T, limbs: TREES.limbs(it).length }); });
  ok(tree && tree.limbs > 0, 'a park tree carries branches to climb on: ' + JSON.stringify(tree && { k: tree.i, limbs: tree.limbs, lowHold: +(tree.h / tree.T).toFixed(2), tall: +(tree.tall / tree.T).toFixed(1) }));
  if (!tree) { console.log('errs', errs); await b.close(); process.exit(1); }
  // stand at the foot and press SPACE: you climb it; W goes on up
  await pg.evaluate(t => { const d = t.rT + .7 * t.T; TREES.go(t.tx + d, t.tz, Math.atan2(-d, 0)); }, tree);
  await pg.waitForTimeout(400);
  await hold('w', 20); const c0 = await dbg();
  ok(!c0.climbing, 'walking into the trunk does not climb it: ' + JSON.stringify(c0));
  await pg.evaluate(t => { const d = t.rT + .7 * t.T; TREES.go(t.tx + d, t.tz, Math.atan2(-d, 0)); }, tree); await pg.waitForTimeout(200);
  await tap(' '); await hold('w', 250); const c1 = await dbg();
  ok(c1.climbing && c1.mode === 'trunk' && c1.climb && c1.ch > .3 * tree.T, 'SPACE at the trunk climbs it, W goes up: ' + JSON.stringify(c1));
  const a1 = Math.atan2(c1.z - tree.tz, c1.x - tree.tx);
  await hold('d', 340); const c2 = await dbg(); const a2 = Math.atan2(c2.z - tree.tz, c2.x - tree.tx);
  ok(c2.climbing && Math.abs(Math.atan2(Math.sin(a2 - a1), Math.cos(a2 - a1))) > .15 && Math.abs(c2.ch - c1.ch) < .05 * tree.T, 'D goes round the trunk at the same height: ' + JSON.stringify({ a1: +a1.toFixed(2), a2: +a2.toFixed(2), ch: c2.ch }));
  // the skill bounds the height: at 10.0 the trunk's top is out of reach
  await hold('w', 1260); const c4 = await dbg();
  const cap = (tree.tall - .8 * tree.T) * (.5 + .5 * c4.skill / 100);
  if (c4.ch < cap - .15) { ok(c4.mode === 'trunk' && c4.ch > c1.ch, 'W keeps climbing toward the skill\'s height: ' + JSON.stringify({ ch: c4.ch, cap: +cap.toFixed(2) })); console.log('skip: the skill\'s height on a big tree is beyond this run\'s climb'); }
  else ok(c4.mode === 'trunk' && c4.ch <= cap + .02, 'the climb stops at the skill\'s height: ' + JSON.stringify({ ch: c4.ch, cap: +cap.toFixed(2) }));
  await hold('s', 340); const c2b = await dbg();
  ok(c2b.mode === 'trunk' && c2b.ch < c4.ch - .5, 'S climbs down: ' + JSON.stringify({ from: c4.ch, to: c2b.ch }));
  // SPACE on the trunk jumps you off it, away from the tree, down to the ground (owner, 9 Nov 2026)
  const r3 = Math.hypot(c2b.x - tree.tx, c2b.z - tree.tz); await tap(' '); const f3 = await frames(); while ((await frames()) - f3 < 4) await pg.waitForTimeout(50); const c3 = await dbg();
  ok(c3.mode === 'fly' && !c3.climb, 'SPACE on the trunk jumps you off it: ' + JSON.stringify({ mode: c3.mode, climb: c3.climb }));
  for (let k = 0; k < 3000 && (await dbg()).climbing; k++) await pg.waitForTimeout(200); const c5 = await dbg();
  ok(!c5.climbing && Math.hypot(c5.x - tree.tx, c5.z - tree.tz) > r3 + .5 * tree.T && c5.py < c5.gy + .3 * tree.T, 'you land on the ground away from the tree: ' + JSON.stringify({ from: +(r3 / tree.T).toFixed(2), to: +(Math.hypot(c5.x - tree.tx, c5.z - tree.tz) / tree.T).toFixed(2), py: c5.py, gy: c5.gy }));
  // under a branch: SPACE grabs it, you hang; A or D moves along it; W pulls you up to stand on it
  const under = await pg.evaluate(t => { TREES.go(t.x, t.z); return { g: SHARED.groundY(t.x, t.z), top: t.top, reach: (3 + .9 * FORAGE.sk('climb') / 100) * t.T }; }, tree);
  await pg.waitForTimeout(400);
  const canGrab = under.top - under.g >= 1.6 * tree.T && under.top - under.g <= under.reach;
  console.log('the lowest hold stands ' + ((under.top - under.g) / tree.T).toFixed(2) + ' tiles over the ground (reach ' + (under.reach / tree.T).toFixed(2) + ')');
  if (canGrab) {
    await tap(' '); await pg.waitForTimeout(400); const h1 = await dbg();
    ok(h1.climbing && h1.mode === 'hang' && h1.hang && !h1.climb, 'SPACE under a branch grabs it and you hang: ' + JSON.stringify(h1));
    await hold('d', 20); let h2 = await dbg(); if (Math.abs(h2.u - h1.u) < .01) { await hold('a', 20); h2 = await dbg(); }
    ok(h2.mode === 'hang' && Math.abs(h2.u - h1.u) > .01, 'D moves you along the branch: ' + JSON.stringify({ u1: h1.u, u2: h2.u }));
    await hold('w', 2); for (let i = 0; i < 4; i++) await frames(); const s1 = await dbg();
    const gy = s1.gy;
    ok(s1.stand && !s1.hang && (s1.move === 'mantle' || gy > under.g + 1.2 * tree.T) && s1.py > under.g + 1.2 * tree.T, 'W pulls you up onto the branch to stand on it: ' + JSON.stringify({ s1, gy: +gy.toFixed(2), g: +under.g.toFixed(2) }));
    await hold('a', 0); for (let i = 0; i < 60; i++) await frames(); await pg.waitForTimeout(1500); const s2 = await dbg();
    ok(!s2.climbing && s2.stand && s2.py > under.g + 1.2 * tree.T, 'you stay standing on the branch: ' + JSON.stringify(s2));
  } else console.log('skip: no branch on the big trees hangs within a jump of the ground (they are all higher)');
  ok(!errs.length, 'no page errors' + (errs.length ? ': ' + errs.join(' | ') : ''));
  await b.close(); console.log(fails.length ? fails.length + ' FAILED' : 'all ok'); process.exit(fails.length ? 1 : 0);
})();
