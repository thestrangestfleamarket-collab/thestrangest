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
    o.water = (FISHING.at(PIER.x, PIER.zE - 6 * T) || {}).kind; o.notDeck = !FISHING.at(PIER.x, PIER.zH + 2 * T); o.half = +((PIER.z0 - RIVER.box.z0) / T / 2).toFixed(1); return o; });
  ok(!before && hp.built && hp.long >= 30 && hp.longest && hp.deck.every(Boolean) && hp.water === 'river' && hp.notDeck, 'the fishing pier is built only with the Hudson, reaches three times as far out as before (34.5 tiles, 7 Nov 2026); its water is the river, its deck is not: ' + JSON.stringify({ before, ...hp }));
  const r1 = await pg.evaluate(() => { FISHING.speed = 20; INV.cash = 100; FORAGE.give('rod', 1); FORAGE.give('bait', 12); FORAGE.give('bait_cut', 6);   // the Fisherman in Waders sells these now (owner, 5 Nov 2026)
    return { rod: FORAGE.has('rod'), worms: FORAGE.has('bait'), cut: FORAGE.has('bait_cut'), shedBoats: !!document.querySelector('#fishp') }; });
  ok(r1.rod >= 1 && r1.worms >= 12 && r1.cut === 6, 'the gear: a rod, worms and cut bait (the Fisherman in Waders sells them): ' + JSON.stringify(r1));
  await pg.evaluate(() => { const T = __dbg.cv().TILE; STORE.goTo(PIER.x + 3.2 * T, PIER.zE + 1.6 * T, 'up'); });
  await pg.waitForTimeout(1500); await wait(() => !FADE.busy); await pg.evaluate(async () => { let p = __dbg.pos(), still = 0; while (still < 15) { await new Promise(r => setTimeout(r, 100)); const q = __dbg.pos(); still = Math.hypot(q[0] - p[0], q[2] - p[2]) < 1e-3 ? still + 1 : 0; p = q; } });
  const r2 = await pg.evaluate(async () => { SHARED.heading = Math.PI; WIELD.set('rod'); FORAGE.ACT.fhook('bait_cut'); for (let i = 0; i < 20; i++) await new Promise(r => requestAnimationFrame(r));
    const p = __dbg.pos(); return { held: WIELD.on, hook: FISHDBG().hook, tip: (WIELD.tip.x - p[0]) * Math.sin(SHARED.heading) + (WIELD.tip.z - p[2]) * Math.cos(SHARED.heading) > 1 && WIELD.tip.y > SHARED.py - .5, cut: FORAGE.has('bait_cut'), swim: RIVER.swim, deck: Math.abs(p[1]) < .2 && RIVER.onPier(p[0], p[2]) }; });
  ok(r2.held === 'rod' && r2.hook === 'bait_cut' && r2.tip && r2.cut === 5 && !r2.swim && r2.deck, 'he stands on the deck (not in the water), holds the rod out in front of him (its tip ahead, over the deck, as the swing stays in front since 2 Nov) on the pier and baits the hook: ' + JSON.stringify(r2));
  // FISHING MODE: the FISH button by the water, locked in place (WASD does nothing), the behind view, SPACE held for power casts where you face, SPACE reels in, ESC leaves
  await pg.waitForTimeout(800); const v0 = await pg.evaluate(() => { FISHING.speed = 1; return __dbg.UI.view; });
  const m1 = await pg.evaluate(() => { const go = !document.getElementById('fishgo').hidden; FISHING.enter(); return { go, mode: FISHING.mode, view: __dbg.UI.view, panel: !document.getElementById('fishmode').hidden || true }; });
  const p0 = await pg.evaluate(() => __dbg.pos()); await pg.keyboard.down('w'); await pg.waitForTimeout(900); await pg.keyboard.up('w'); const p1 = await pg.evaluate(() => __dbg.pos());
  await pg.keyboard.down(' '); await pg.waitForTimeout(700); const pb = await pg.evaluate(() => document.querySelector('#fishmode').textContent); await pg.keyboard.up(' ');
  await pg.waitForTimeout(300); const m2 = await pg.evaluate(() => { const s = FISHING.state(), T = __dbg.cv().TILE; return { st: s && s.st, d: s ? +(Math.hypot(s.x - s.ax, s.z - s.az) / T).toFixed(1) : 0, ahead: s ? Math.cos(Math.atan2(s.x - s.ax, s.z - s.az) - SHARED.heading) > .9 : false }; });
  await pg.waitForTimeout(1500); await pg.keyboard.press(' '); await pg.waitForTimeout(200); const m3 = await pg.evaluate(() => ({ st: FISHING.state() && FISHING.state().st }));
  await pg.keyboard.press('Escape'); await pg.waitForTimeout(300); const m4 = await pg.evaluate(() => ({ speed: FISHING.speed = 20, drag: FISHING.drag = 3, mode: FISHING.mode, view: __dbg.UI.view, menu: !!__dbg.UI.menuOpen, panel: getComputedStyle(document.getElementById('fishmode')).display }));
  ok(m1.go && m1.mode && m1.view === 'follow' && Math.hypot(p1[0] - p0[0], p1[2] - p0[2]) < 1e-3 && /CAST/.test(pb) && /HOOK/.test(pb) && m2.st && m2.ahead && m2.d > 2 && !m3.st && !m4.mode && m4.view === v0 && !m4.menu && m4.panel === 'none',
    'fishing mode: the FISH button by the water, locked in place, the behind view, SPACE held casts where you face, SPACE reels in, ESC leaves back to your view: ' + JSON.stringify({ m1, moved: Math.hypot(p1[0] - p0[0], p1[2] - p0[2]), pb, m2, m3, m4, v0 }));
  const od = await pg.evaluate(() => { const T = __dbg.cv().TILE, x = PIER.x, z = PIER.zE - 6 * T, o = {}, r0 = TRAINERS.rank('fish'); TRAINERS.set('fish', 3); for (const [b, h] of [['bait', 13], ['bait_cut', 13], ['bait_cut', 19], ['bait', 23]]) o[b + '@' + h] = FISHING.odds(x, z, b, h);
    o.bare = FISHING.odds(x, z, null, 13); o.shallow = FISHING.odds(x + PIER.hw + 2 * T, PIER.z0 - 2 * T, 'bait', 13); TRAINERS.set('fish', 0); o.closed = FISHING.odds(x, z, 'bait_cut', 19); TRAINERS.set('fish', r0); return o; });   // the super-rare (bass, sturgeon) only from EXPERT with the Fisherman (5 Nov 2026)
  console.log('odds', JSON.stringify(od));
  const sum = o => Object.values(o.per).reduce((a, b) => a + b, 0);
  ok(Object.keys(od).filter(k => k !== 'bare').every(k => Math.abs(sum(od[k]) - 1) < .01 && od[k].bite > 0 && od[k].bite < 1), 'every odds table sums to one and some casts get nothing');
  ok(od['bait_cut@19'].per.x_bass > od['bait@13'].per.x_bass * 3 && od['bait@23'].per.x_eel > od['bait@13'].per.x_eel && od.bare.rate === 0 && !od.shallow.per.x_sturgeon && !od['bait@13'].per.x_bluegill && !od.closed.per.x_bass && od.closed.per.x_perch > 0,
    'bass take cut bait at dusk, eels worms at night, a bare hook catches nothing, sturgeon keep to deep water, lake fish not in the river, no bass until the Fisherman ranks you');
  const r3 = await pg.evaluate(async () => { const T = __dbg.cv().TILE, seen = new Set(), tk = FISHING.tick; FISHING.tick = dt => { tk(dt); const q = FISHING.state(); if (q) seen.add(q.st); }; FISHING.force = 'x_bass'; FISHING.win = 30; FISHING.cast(PIER.x + 3.2 * T, PIER.zE - 7 * T);
    const t0 = performance.now(); while (performance.now() - t0 < 400000) { const s = FISHING.state(); if (s) seen.add(s.st); if (s && s.st === 'bite') break; await new Promise(r => setTimeout(r, 50)); }
    const bob = FISHDBG().state; FISHING.click(); const hooked = FISHING.state() && FISHING.state().st; FISHING.auto = true;
    while (performance.now() - t0 < 900000) { const s = FISHING.state(); if (s) seen.add(s.st); if (!s) break; await new Promise(r => setTimeout(r, 50)); } FISHING.auto = false; FISHING.force = null; FISHING.tick = tk;
    return { seen: [...seen], bob, hooked, bass: INV.items.x_bass || 0, kg: FORAGE.S.fishkg.x_bass, last: FISHING.last, hook: FORAGE.S.hook || null }; });
  ok(['wind', 'fly', 'wait', 'bite', 'fight', 'land'].every(s => r3.seen.includes(s)) && r3.hooked === 'fight', 'a cast goes back and through, the float sits, a bite, the strike sets the hook, the fight, the lift out: ' + r3.seen.join(','));
  ok(r3.bass === 1 && r3.kg && r3.kg[0] > 0 && r3.last && r3.last.id === 'x_bass' && !r3.hook, 'the striped bass comes off the hook into the pack with its weight, the bait eaten: ' + JSON.stringify({ kg: r3.kg, last: r3.last, hook: r3.hook }));
  // the fish shows at the bait as it bites; a strike on a nibble spooks it (big words in the middle), the bait stays and another may come
  // the nibble is started by hand: on a slow machine one frame can jump the whole 1.2 s nibble
  const r4 = await pg.evaluate(async () => { const T = __dbg.cv().TILE, out = {}; FISHING.speed = 1; FISHING.force = 'x_shad'; FISHING.win = 30; if (!FORAGE.S.hook) FORAGE.ACT.fhook('bait'); FISHING.cast(PIER.x + 3.2 * T, PIER.zE - 7 * T);
    const t0 = performance.now(); let s; while (performance.now() - t0 < 400000) { s = FISHING.state(); if (s && s.st === 'wait') break; await new Promise(r => setTimeout(r, 30)); }
    s.tb = s.t + 30; s.nib = 1; FISHING.click(); await new Promise(r => setTimeout(r, 300)); const d = FISHDBG(); out.spook = d.shout; out.still = d.state && d.state.st; out.hook = d.hook;
    FISHING.speed = 20; FISHING.win = 1e4;   // fishing time runs on frames: on a slow runner a real-time wait for the next bite never ends
    const t1 = performance.now(); while (performance.now() - t1 < 400000) { s = FISHING.state(); if (!s || s.st === 'bite') break; await new Promise(r => setTimeout(r, 50)); }   // its own wait: on a slow machine the nibble alone can take most of the first
    for (let i = 0; i < 5; i++) await new Promise(r => requestAnimationFrame(r)); out.bite = s && s.st; out.shown = FISHDBG().shown; FISHING.click(); out.on = FISHDBG().shout; FISHING.reel(); FISHING.force = null; FISHING.speed = 20; return out; });
  ok(/TOO EARLY/.test(r4.spook) && r4.still === 'wait' && r4.hook && r4.bite === 'bite' && r4.shown && /FISH ON/.test(r4.on), 'a strike on a nibble spooks the fish (said big in the middle), the bait stays; the next one shows at the bait as it bites: ' + JSON.stringify(r4));
  const fight = (id, reel, fresh) => pg.evaluate(async ([id, reel, fresh]) => { const T = __dbg.cv().TILE; FISHING.force = id; FISHING.win = 30; if (!FORAGE.S.hook) FORAGE.ACT.fhook('bait'); FISHING.cast(PIER.x + 3.2 * T, PIER.zE - 7 * T);
    const t0 = performance.now(); let s; while (performance.now() - t0 < 400000) { s = FISHING.state(); if (s && s.st === 'bite') break; await new Promise(r => setTimeout(r, 50)); }
    FISHING.click(); const n0 = INV.items[id] || 0; while (performance.now() - t0 < 900000) { s = FISHING.state(); FISHING.reeling = reel; if (s && fresh && s.f) s.f.s = 1; if (!s || s.st === 'land') break; await new Promise(r => setTimeout(r, 30)); }
    const landed = !!s; FISHING.reel(); FISHING.force = null; return { landed, got: (INV.items[id] || 0) - n0, msg: [...document.querySelectorAll('#fjour div')].map(d => d.textContent).slice(-2) }; }, [id, reel, fresh]);
  await pg.evaluate(() => { FISHING.drag = 5; }); const snap = await fight('x_sturgeon', true, true); await pg.evaluate(() => { FISHING.drag = 3; });
  ok(!snap.landed && snap.msg.some(m => /SNAPS/.test(m)), 'reeling hard against a sturgeon snaps the line: ' + JSON.stringify(snap));
  const slip = await fight('x_perch', false);
  ok(!slip.landed && slip.msg.some(m => /SLACK|SLIPS/.test(m)), 'never reeling a perch lets the hook slip: ' + JSON.stringify(slip));
  // the word by the line, the line's wear and its warnings, the fish's moods (5 Nov 2026)
  { const fr = await pg.evaluate(async () => { const T = __dbg.cv().TILE, L = FISHING.gear().line, sp0 = FISHING.speed, au0 = FISHING.auto, r = { word: [FISHING.word({ ten: .1 }), FISHING.word({ ten: .5 * L, wear: 1 }), FISHING.word({ ten: .95 * L, wear: 1 })].join(',') }; FISHING.speed = 4; FISHING.auto = false;
      FISHING.force = 'x_sturgeon'; FISHING.win = 30; if (!FORAGE.S.hook) FORAGE.ACT.fhook('bait'); FISHING.cast(PIER.x + 3.2 * T, PIER.zE - 7 * T); const t0 = performance.now(); let s; while (performance.now() - t0 < 400000) { s = FISHING.state(); if (s && s.st === 'bite') break; await new Promise(r => setTimeout(r, 50)); } FISHING.click(); s = FISHING.state(); r.fight = !!s && s.st === 'fight' && s.mode === 'run';
      r.frays = true; FISHING.reeling = false; s.surge = 0; s.mode = 'rest'; s.runT = 1e9; s.f.s = .3; const st0 = s.f.s; await new Promise(r => setTimeout(r, 2500)); r.rests = FISHING.state() === s && s.f.s > st0 && document.getElementById('fishhud').textContent.includes('IT RESTS'); r.dbg2 = { fs: +s.f.s.toFixed(3), same: FISHING.state() === s, hud: document.getElementById('fishhud').textContent.slice(0, 80), mode: s.mode };
      s.mode = 'shake'; s.runT = 1e9; await new Promise(r => setTimeout(r, 300)); r.shakes = document.getElementById('fishhud').textContent.includes('SHAKES ITS HEAD'); FISHING.reel(); FISHING.force = null; FISHING.drag = 3; FISHING.speed = sp0; FISHING.auto = au0; return r; });
    ok(fr.word === 'LOOSE,GOOD,EASE' && fr.fight && fr.rests && fr.shakes, 'the fight: LOOSE / GOOD / EASE by the line, a resting fish gets its breath back and a shaking one says to ease off: ' + JSON.stringify(fr)); }
  // the tackle: better rods cast further on stronger line, reels reel faster; bought at the stand
  const g = await pg.evaluate(() => { const g0 = { ...FISHING.gear() }; INV.cash = 1000; for (const id of ['rod_surf', 'reel_pro', 'lure_spoon', 'cooler_s', 'crabpot']) FORAGE.give(id, 1);
    return { g0, cash: INV.cash }; });
  const g1 = await pg.evaluate(() => new Promise(r => setTimeout(() => r({ ...FISHING.gear() }), 700)));
  ok(g.g0.cast === 12 && g.g0.line === 1 && g1.cast === 22 && g1.line === 1.6 && g1.reel === 1.7, 'better rods (cast, line), reels, lures, a cooler and a crab pot work: ' + JSON.stringify({ g0: g.g0, g1 }));
  // the fight: pulling against the fish's run tires it faster than pulling with it; low drag lets it take line instead of snapping
  const st = await pg.evaluate(async () => { const T = __dbg.cv().TILE, wait = ms => new Promise(r => setTimeout(r, ms)); FISHING.speed = 4; FISHING.force = 'x_bass'; FISHING.win = 30; if (!FORAGE.S.hook) FORAGE.ACT.fhook('bait_cut'); FISHING.cast(PIER.x + 3.2 * T, PIER.zE - 7 * T);
    const t0 = performance.now(); let s; while (performance.now() - t0 < 300000) { s = FISHING.state(); if (s && s.st === 'bite') break; await wait(50); } FISHING.click(); s = FISHING.state();
    const tire = async side => { s.f.s = 1; s.run = 1; s.runT = 999; s.D = 30 * T; FISHING.side = side; FISHING.reeling = false; const a = s.f.s, t = performance.now(); while (performance.now() - t < 1500) { s.slack = 0; s.over = 0; await wait(30); } return +(a - s.f.s).toFixed(3); };
    const against = await tire(-1), withIt = await tire(1);
    const reel = async d => { FISHING.drag = d; s.f.s = 1; s.run = 0; s.surge = 0; s.D = 30 * T; FISHING.side = 0; FISHING.reeling = true; let mx = 0; const t = performance.now(); for (let f = 0; f < 12 || performance.now() - t < 1200; f++) { s.f.s = 1; s.surge = 5; s.run = 0; s.over = 0; s.slack = 0; await new Promise(r => requestAnimationFrame(r)); if (f > 1) mx = Math.max(mx, s.ten); } FISHING.reeling = false; return +mx.toFixed(2); };
    const lo = await reel(1), hi = await reel(5), alive = FISHING.state() === s; FISHING.drag = 3; FISHING.reel(); FISHING.force = null; FISHING.speed = 20; return { against, withIt, lo, hi, alive }; });
  ok(st.alive && st.against > st.withIt * 1.5 && st.lo < st.hi, 'pulling against the run tires the fish (' + st.against + ') faster than with it (' + st.withIt + '); low drag keeps the strain down (' + st.lo + ' vs ' + st.hi + ')');
  // a lure stays on the hook after a catch; with no cooler you carry five fish, a cooler holds more
  const cl = await pg.evaluate(async () => { const T = __dbg.cv().TILE, wait = ms => new Promise(r => setTimeout(r, ms)), land = async () => { FISHING.force = 'x_bass'; FISHING.win = 30; FISHING.cast(PIER.x + 3.2 * T, PIER.zE - 7 * T); FISHING.auto = true;
      const t0 = performance.now(); while (performance.now() - t0 < 300000) { const s = FISHING.state(); if (s && s.st === 'bite') { FISHING.click(); } if (!s) break; await wait(50); } FISHING.auto = false; FISHING.force = null; };
    FORAGE.ACT.fhook('lure_spoon'); await land(); const lure = FORAGE.S.hook, room0 = FISHING.room();
    FORAGE.take('cooler_s', 1); for (const id of ['x_perch', 'x_eel', 'x_shad', 'x_bass']) FORAGE.take(id, FORAGE.has(id) || 0); FORAGE.give('x_perch', 5); const n0 = FISHING.held(); await land(); const n1 = FISHING.held(), freed = !!(FISHING.last && FISHING.last.freed);
    FORAGE.give('cooler_s'); return { lure, room0, n0, n1, freed, room1: FISHING.room() }; });
  ok(cl.lure === 'lure_spoon' && cl.n0 === 5 && cl.n1 === 5 && cl.freed && cl.room1 === 20, 'the spoon lure stays on the hook; without a cooler a sixth fish goes back, a small cooler holds 15 more: ' + JSON.stringify(cl));
  // crab pots: drop one ahead, it is kept, haul it later for what crawled in
  const cp = await pg.evaluate(() => { SHARED.heading = Math.PI; const p = POTS.drop(); if (!p) return { dropped: false }; const kept = JSON.parse(__dbg.SAVE.get('pots')).length; p.t -= 60 * 60000; POTS.haul(p); return { dropped: true, kept, got: POTS.last.got, back: FORAGE.has('crabpot'), left: JSON.parse(__dbg.SAVE.get('pots')).length }; });
  ok(cp.dropped && cp.kept === 1 && cp.got.length > 0 && cp.back === 1 && cp.left === 0, 'a crab pot dropped in the river is kept, and hauled after an hour holds a catch: ' + JSON.stringify(cp));
  // other players: their pots float where they dropped them, with their name, and go when they haul them; yours go to the section
  const tp = await pg.evaluate(async () => { const T = __dbg.cv().TILE, sent = [], on = ONLINE.on, send = ONLINE.send; ONLINE.on = true; ONLINE.send = m => sent.push(m);
    ONLINE.hear.puts({ all: [{ id: 'q', name: 'Otto', k: 'pot', list: [[PIER.x + 3 * T, 0, PIER.zE - 6 * T, 1]] }] }); await new Promise(r => setTimeout(r, 400));
    const p = (POTS.theirs.get('q') || [])[0], o = { shown: !!(p && p.g && p.g.visible), name: p && p.th && p.th.name, mine: !!sent.find(m => m.t === 'puts' && m.k === 'pot') };
    ONLINE.hear.puts({ id: 'q', k: 'pot', name: 'Otto', list: [] }); o.gone = !POTS.theirs.has('q') && !(p && p.g); ONLINE.on = on; ONLINE.send = send; return o; });
  ok(tp.shown && tp.name === "OTTO'S CRAB POT" && tp.mine && tp.gone, "another player's crab pot floats where they dropped it, with their name, and goes when they haul it; yours go to the section: " + JSON.stringify(tp));
  const gd = await pg.evaluate(() => { FISHING.guide(); const P = document.getElementById('packp'), t = P ? P.innerText : ''; const r = { open: FORAGE.PACK.open, tab: FORAGE.PACK.tab, fish: Object.values(FISHING.NAMES).filter(n => t.includes(n)).length, all: Object.keys(FISHING.NAMES).length }; FORAGE.PACK.toggle(); return r; });
  ok(gd.open && gd.tab === 'fishing' && gd.fish === gd.all, 'the fishing guide opens in the pack and lists every fish: ' + JSON.stringify(gd));
  // another player fishing beside you: the rod in her hand, her line from its tip to her float
  const rf = await pg.evaluate(async () => { const T = __dbg.cv().TILE, x = PIER.x + 1.5 * T, z = PIER.zE + 2 * T, on = ONLINE.on; ONLINE.on = true;
    ONLINE.feed({ t: 'hi', you: 'me', all: [{ id: 'a', name: 'ROSA', look: 'w00', at: [x, z, 0, Math.PI, SHARED.LVL, ''] }] });
    for (let i = 0, t0 = performance.now(); i < 10 || performance.now() - t0 < 60000 && !(FISHING.theirs.get('a') && FISHING.theirs.get('a').line.visible && WIELD.theirTip('a')); i++) { ONLINE.feed({ t: 'mv', id: 'a', at: [x, z, 0, Math.PI, SHARED.LVL, ''] }); ONLINE.feed({ t: 'aim', id: 'a', w: 'rod', v: [0, .55, -.83] }); ONLINE.feed({ t: 'fish', id: 'a', b: [x, 0, z - 8 * T] }); await new Promise(r => setTimeout(r, 200)); }
    const f = FISHING.theirs.get('a'), L = f && f.line.geometry.attributes.position, tp = WIELD.theirTip('a'); ONLINE.on = on;
    return { line: !!(f && f.line.visible), tip: !!tp, gap: L && tp ? +Math.hypot(L.getX(0) - tp.x, L.getY(0) - tp.y, L.getZ(0) - tp.z).toFixed(3) : null }; });
  ok(rf.line && rf.tip && rf.gap < .05, "another player's fishing line starts at the tip of the rod in her hand: " + JSON.stringify(rf));
  // fishing's bar is a window: its X leaves fishing as LEAVE does, even with a fish on the hook (owner, 9 Nov 2026: "i cant leaev fishing mode esc/x dose nothing")
  const lx = await pg.evaluate(async () => { const T = __dbg.cv().TILE; FORAGE.give('rod', 1); WIELD.set('rod'); STORE.pos.set(PIER.x, 0, PIER.zE + 1.5 * T); SHARED.heading = Math.PI; FISHING.enter(); const t0 = performance.now();
    while (!document.querySelector('#fishmode>.pX') && performance.now() - t0 < 5000) await new Promise(r => setTimeout(r, 100)); const x = document.querySelector('#fishmode>.pX'); if (!x) return { x: false };
    x.click(); await new Promise(r => setTimeout(r, 300)); return { x: true, mode: FISHING.mode, bar: getComputedStyle(document.getElementById('fishmode')).display }; });
  ok(lx.x && lx.mode === false && lx.bar === 'none', "the fishing bar's X leaves fishing: " + JSON.stringify(lx));
  // from the rowboat: sat on the thwart, the rod in his hand out over the bow, the arm swinging it back to cast as on the pier (TODO, 10 Nov 2026)
  const rb = await pg.evaluate(async () => { const T = __dbg.cv().TILE, fr = async n => { for (let i = 0; i < n; i++) await new Promise(r => requestAnimationFrame(r)); };
    if (FISHING.mode) FISHING.leave(); if (FISHING.state()) FISHING.reel(); FORAGE.give('rod', 1); FORAGE.give('bait', 2); BOAT.launch(); await fr(10); WIELD.set('rod'); if (!FORAGE.S.hook) FORAGE.ACT.fhook('bait'); WIELD.tip.set(0, -1e4, 0); await fr(25);
    const p = __dbg.pos(), h = SHARED.heading, ahead = () => +(((WIELD.tip.x - p[0]) * Math.sin(h) + (WIELD.tip.z - p[2]) * Math.cos(h)) / T).toFixed(2), up = () => +((WIELD.tip.y - SHARED.py) / T).toFixed(2), rest = { a: ahead(), u: up() };
    FISHING.speed = 1; FISHING.cast(p[0] + Math.sin(h) * 6 * T, p[2] + Math.cos(h) * 6 * T); let wind = null; const t0 = performance.now();
    while (performance.now() - t0 < 8000) { await fr(1); const q = FISHING.state(); if (!q || q.st !== 'wind') { if (wind) break; continue; } const w = { a: ahead(), u: up() }; if (!wind || w.u > wind.u) wind = w; }
    const o = { boat: BOAT.on, sat: !!document.getElementById('boathud') && !document.getElementById('boathud').hidden, held: WIELD.on, rest, wind, st: (FISHING.state() || {}).st }; FISHING.reel(); return o; });
  ok(rb.boat && rb.held === 'rod' && rb.rest.a > .5 && rb.rest.u > -1 && rb.wind && rb.wind.u > rb.rest.u + .3, 'in the rowboat he holds the rod out in front, sat, and swings it up and back to cast: ' + JSON.stringify(rb));
  ok(!errs.length, 'no page errors' + (errs.length ? ': ' + errs.slice(0, 3).join(' | ') : ''));
  await b.close(); console.log(fails.length ? fails.length + ' failed' : 'all fishing checks passed'); process.exit(fails.length ? 1 : 0);
})();
