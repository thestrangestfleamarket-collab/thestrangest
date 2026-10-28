// THE FISHING CHECK: node tests/fishing.cjs dist/market.html. On the Hudson's pier: buy a rod and bait, hold the rod, bait the hook, cast, a bite, strike,
// the fight, land, unhook into the pack; the odds by species; too much strain snaps the line, too little lets the hook slip.
const { chromium } = require('playwright'), path = require('path');
const fails = [], ok = (c, m) => { if (!c) { fails.push(m); console.log((process.env.GITHUB_ACTIONS ? '::error title=fishing::' : 'FAIL ') + m); } else console.log('ok   ' + m); };
(async () => {
  const b = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const pg = await b.newPage({ viewport: { width: 800, height: 500 } }), errs = [];
  pg.on('pageerror', e => errs.push(e.message.slice(0, 300)));
  await pg.goto('file://' + path.resolve(process.argv[2] || 'dist/market.html') + '?fresh=1&hour=19&res=1', { waitUntil: 'commit' });
  await pg.waitForFunction(() => window.__started, null, { timeout: 300000 });
  const wait = (f, a, t = 180000) => pg.waitForFunction(f, a, { timeout: t, polling: 200 });
  const before = await pg.evaluate(() => !!(window.PIER && PIER.G));
  for (let k = 0; k < 4; k++) { await wait(() => !FADE.busy).catch(() => {}); await pg.evaluate(() => { if (!RIVER.on) STORE.goTo(SHARED.BOD.XS(61), SHARED.BOD.ZS(-118), 'up'); });
    if (await wait(() => window.RIVER && RIVER.on && window.PIER && PIER.G && !FADE.busy && window.FISHING && FISHING.STAND, null, 90000).then(() => 1, () => 0)) break; }
  const hp = await pg.evaluate(() => { const T = __dbg.cv().TILE, o = {}; o.built = PIER.G.parent && PIER.G.parent.name === 'river'; o.long = +((PIER.z0 - PIER.zE) / T).toFixed(1);
    o.longest = RIVER.decks.every(d => d.pier || d.r.every(r => PIER.z0 - r[1] < PIER.z0 - PIER.zE)); o.deck = [RIVER.onPier(PIER.x, (PIER.z0 + PIER.zH) / 2), RIVER.onPier(PIER.x + PIER.HW - T, PIER.zE + T), !RIVER.onPier(PIER.x, PIER.zE - T)];
    o.water = (FISHING.at(PIER.x, PIER.zE - 6 * T) || {}).kind; o.notDeck = !FISHING.at(PIER.x, PIER.zH + 2 * T); return o; });
  ok(!before && hp.built && hp.long >= 30 && hp.longest && hp.deck.every(Boolean) && hp.water === 'river' && hp.notDeck, 'the fishing pier is built only with the Hudson, reaches further out than any other; its water is the river, its deck is not: ' + JSON.stringify({ before, ...hp }));
  const r1 = await pg.evaluate(() => { FISHING.speed = 20; INV.cash = 100; FISHING.STAND.open(); const q = s => document.querySelector('#fishp ' + s); q('[data-buy="rod"]').click(); q('[data-bait="bait"]').click(); q('[data-bait="bait_cut"]').click();
    document.getElementById('fishp').hidden = true; return { rod: FORAGE.has('rod'), worms: FORAGE.has('bait'), cut: FORAGE.has('bait_cut'), cash: INV.cash }; });
  ok(r1.rod === 1 && r1.worms === 12 && r1.cut === 6 && r1.cash === 78, 'BAIT & BOATS sells a rod, worms and cut bait: ' + JSON.stringify(r1));
  await pg.evaluate(() => { const T = __dbg.cv().TILE; STORE.goTo(PIER.x + 3.2 * T, PIER.zE + 1.6 * T, 'up'); });
  await pg.waitForTimeout(1500); await wait(() => !FADE.busy); await pg.evaluate(async () => { let p = __dbg.pos(), still = 0; while (still < 15) { await new Promise(r => setTimeout(r, 100)); const q = __dbg.pos(); still = Math.hypot(q[0] - p[0], q[2] - p[2]) < 1e-3 ? still + 1 : 0; p = q; } });
  const r2 = await pg.evaluate(async () => { SHARED.heading = Math.PI; WIELD.set('rod'); FORAGE.ACT.fhook('bait_cut'); for (let i = 0; i < 20; i++) await new Promise(r => requestAnimationFrame(r));
    const p = __dbg.pos(); return { held: WIELD.on, hook: FISHDBG().hook, tip: WIELD.tip.y > SHARED.py + 1, cut: FORAGE.has('bait_cut'), swim: RIVER.swim, deck: Math.abs(p[1]) < .2 && RIVER.onPier(p[0], p[2]) }; });
  ok(r2.held === 'rod' && r2.hook === 'bait_cut' && r2.tip && r2.cut === 5 && !r2.swim && r2.deck, 'he stands on the deck (not in the water), holds the rod (its tip above his head) on the pier and baits the hook: ' + JSON.stringify(r2));
  const od = await pg.evaluate(() => { const T = __dbg.cv().TILE, x = PIER.x, z = PIER.zE - 6 * T, o = {}; for (const [b, h] of [['bait', 13], ['bait_cut', 13], ['bait_cut', 19], ['bait', 23]]) o[b + '@' + h] = FISHING.odds(x, z, b, h);
    o.bare = FISHING.odds(x, z, null, 13); o.shallow = FISHING.odds(x + 4 * T, PIER.z0 - 2 * T, 'bait', 13); return o; });
  console.log('odds', JSON.stringify(od));
  const sum = o => Object.values(o.per).reduce((a, b) => a + b, 0);
  ok(Object.keys(od).filter(k => k !== 'bare').every(k => Math.abs(sum(od[k]) - 1) < .01 && od[k].bite > 0 && od[k].bite < 1), 'every odds table sums to one and some casts get nothing');
  ok(od['bait_cut@19'].per.x_bass > od['bait@13'].per.x_bass * 3 && od['bait@23'].per.x_eel > od['bait@13'].per.x_eel && od.bare.rate === 0 && !od.shallow.per.x_sturgeon && !od['bait@13'].per.x_bluegill,
    'bass take cut bait at dusk, eels worms at night, a bare hook catches nothing, sturgeon keep to deep water, lake fish not in the river');
  const r3 = await pg.evaluate(async () => { const T = __dbg.cv().TILE, seen = new Set(); FISHING.force = 'x_bass'; FISHING.win = 30; FISHING.cast(PIER.x + 3.2 * T, PIER.zE - 7 * T);
    const t0 = performance.now(); while (performance.now() - t0 < 400000) { const s = FISHING.state(); if (s) seen.add(s.st); if (s && s.st === 'bite') break; await new Promise(r => setTimeout(r, 50)); }
    const bob = FISHDBG().state; FISHING.click(); const hooked = FISHING.state() && FISHING.state().st; FISHING.auto = true;
    while (performance.now() - t0 < 900000) { const s = FISHING.state(); if (s) seen.add(s.st); if (!s) break; await new Promise(r => setTimeout(r, 50)); } FISHING.auto = false; FISHING.force = null;
    return { seen: [...seen], bob, hooked, bass: INV.items.x_bass || 0, kg: FORAGE.S.fishkg.x_bass, last: FISHING.last, hook: FORAGE.S.hook || null }; });
  ok(['wind', 'fly', 'wait', 'bite', 'fight', 'land'].every(s => r3.seen.includes(s)) && r3.hooked === 'fight', 'a cast goes back and through, the float sits, a bite, the strike sets the hook, the fight, the lift out: ' + r3.seen.join(','));
  ok(r3.bass === 1 && r3.kg && r3.kg[0] > 0 && r3.last && r3.last.id === 'x_bass' && !r3.hook, 'the striped bass comes off the hook into the pack with its weight, the bait eaten: ' + JSON.stringify({ kg: r3.kg, last: r3.last, hook: r3.hook }));
  const fight = (id, reel) => pg.evaluate(async ([id, reel]) => { const T = __dbg.cv().TILE; FISHING.force = id; FISHING.win = 30; if (!FORAGE.S.hook) FORAGE.ACT.fhook('bait'); FISHING.cast(PIER.x + 3.2 * T, PIER.zE - 7 * T);
    const t0 = performance.now(); let s; while (performance.now() - t0 < 400000) { s = FISHING.state(); if (s && s.st === 'bite') break; await new Promise(r => setTimeout(r, 50)); }
    FISHING.click(); const n0 = INV.items[id] || 0; while (performance.now() - t0 < 900000) { s = FISHING.state(); FISHING.reeling = reel; if (!s || s.st === 'land') break; await new Promise(r => setTimeout(r, 30)); }
    const landed = !!s; FISHING.reel(); FISHING.force = null; return { landed, got: (INV.items[id] || 0) - n0, msg: [...document.querySelectorAll('#fjour div')].map(d => d.textContent).slice(-2) }; }, [id, reel]);
  const snap = await fight('x_sturgeon', true);
  ok(!snap.landed && snap.msg.some(m => /SNAPS/.test(m)), 'reeling hard against a sturgeon snaps the line: ' + JSON.stringify(snap));
  const slip = await fight('x_perch', false);
  ok(!slip.landed && slip.msg.some(m => /SLACK|SLIPS/.test(m)), 'never reeling a perch lets the hook slip: ' + JSON.stringify(slip));
  ok(!errs.length, 'no page errors' + (errs.length ? ': ' + errs.slice(0, 3).join(' | ') : ''));
  await b.close(); console.log(fails.length ? fails.length + ' failed' : 'all fishing checks passed'); process.exit(fails.length ? 1 : 0);
})();
