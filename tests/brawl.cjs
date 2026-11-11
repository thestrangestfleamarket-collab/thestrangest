// THE BRAWL CHECK: node tests/brawl.cjs dist/market.html. A player fed to ONLINE (no network): their moves play, they are solid, your punch lands only when your fist reaches them, their blows hurt, shove and knock you down.
const { chromium } = require('playwright'), path = require('path');
const fails = [], ok = (c, m) => { if (!c) { fails.push(m); console.log((process.env.GITHUB_ACTIONS ? '::error title=brawl::' : 'FAIL ') + m); } else console.log('ok   ' + m); };
(async () => {
  const b = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const pg = await b.newPage({ viewport: { width: 960, height: 600 } }), errs = [];
  pg.on('pageerror', e => errs.push(e.message.slice(0, 300)));
  await pg.goto('file://' + path.resolve(process.argv[2] || 'dist/market.html') + '?fresh=1&hour=13&at=49,10', { waitUntil: 'commit' });
  let st = false; for (let i = 0; i < 60 && !st; i++) { await pg.waitForTimeout(3000); st = await pg.evaluate(() => !!window.__started).catch(() => false); }
  ok(st, 'the page starts');
  if (st) {
    await pg.waitForTimeout(2000);
    const place = (fwd) => pg.evaluate(f => { const P = __dbg.you(), h = SHARED.heading; ONLINE.feed({ t: 'mv', id: 'a', at: [P.x + Math.sin(h) * f, P.z + Math.cos(h) * f, SHARED.py, h + Math.PI, SHARED.LVL, ''] }); }, fwd);
    await pg.evaluate(() => { window.__sent = []; ONLINE.send = m => __sent.push(m); const P = __dbg.you(), h = SHARED.heading;
      ONLINE.feed({ t: 'hi', you: 'me', all: [{ id: 'a', name: 'ROSA', look: 'w00', at: [P.x + Math.sin(h) * .6, P.z + Math.cos(h) * .6, SHARED.py, h + Math.PI, SHARED.LVL, ''] }] }); });
    await pg.waitForTimeout(1500);
    await pg.evaluate(() => ONLINE.feed({ t: 'act', id: 'a', k: 'J', on: 1 }));
    await pg.waitForTimeout(300);
    ok(await pg.evaluate(() => { const o = ONLINE.others.get('a'); return !!(o.S.up && /jab/.test(o.S.up.name)); }), 'their jab plays on their figure');
    const pushed = await pg.evaluate(() => { const o = ONLINE.others.get('a'), c = __dbg.collide(o.p.x + .1, o.p.z); return Math.hypot(c[0] - o.p.x, c[1] - o.p.z); });
    ok(pushed > .5, 'you cannot walk into them (pushed out to ' + pushed.toFixed(2) + ')');
    const ghost = await pg.evaluate(() => { ONLINE.feed({ t: 'in', p: { id: 'a', dead: 1 } }); const o = ONLINE.others.get('a'), c = __dbg.collide(o.p.x + .1, o.p.z), d = Math.hypot(c[0] - o.p.x, c[1] - o.p.z); ONLINE.feed({ t: 'in', p: { id: 'a', dead: 0 } }); return d; });
    ok(ghost < .3, 'a dead player is a ghost you walk through (' + ghost.toFixed(2) + ')');
    const look = await pg.evaluate(async () => { ONLINE.feed({ t: 'in', p: { id: 'a', dead: 1 } }); await new Promise(r => setTimeout(r, 400)); const o = ONLINE.others.get('a'), g = { ghost: o.fig.me.material.transparent, tag: o.tagS };
      ONLINE.feed({ t: 'in', p: { id: 'a', dead: 0, hp: .5 } }); await new Promise(r => setTimeout(r, 400)); return { ...g, solid: !o.fig.me.material.transparent, bar: o.tagS }; });
    ok(look.ghost && /GHOST/.test(look.tag) && look.solid, 'a dead player looks like a ghost (' + JSON.stringify(look) + ')');
    ok(/\n0\.5(\n|$)/.test(look.bar), 'a hurt player shows a health bar over their name');
    let hit = [];   // retry one jab: under slow CI frames a single swing's few samples can miss the brief reach; a fresh swing lands it (a real miss still fails — all tries come back empty)
    for (let tryi = 0; tryi < 6 && !hit.length; tryi++) {
      await pg.evaluate(() => { __dbg.VIT.sta = 1; window.__sent.length = 0; });
      await pg.keyboard.press('j'); await pg.waitForTimeout(800);
      hit = await pg.evaluate(() => __sent.filter(m => m.t === 'hit'));
    }
    for (let w = 0; w < 8 && await pg.evaluate(() => __dbg.VIT.sta >= .99); w++) { if (w === 4) await pg.keyboard.press('j'); await pg.waitForTimeout(500); }   // (a slow runner may not have swung yet)
    const mart = await pg.evaluate(() => ({ sta: __dbg.VIT.sta, sk: FORAGE.sk('fight'), row: FORAGE.SK.some(r => r[0] === 'fight') }));
    ok(mart.sta < .99, 'a punch costs stamina (' + mart.sta.toFixed(3) + ')');
    ok(mart.row && mart.sk >= 0, 'MARTIAL ARTS is a skill (skills start at 0: ' + mart.sk + ')');
    const tired = await pg.evaluate(async () => { __dbg.VIT.sta = 0; await new Promise(r => setTimeout(r, 300)); const a = { tired: __dbg.VIT.tired, run: __dbg.ST.runTarget }; __dbg.VIT.sta = .4; await new Promise(r => setTimeout(r, 300)); return { ...a, after: __dbg.VIT.tired }; });
    ok(tired.tired && !tired.after, 'with no stamina you are too tired to run till a third is back (' + JSON.stringify(tired) + ')');
    ok(hit.length === 1 && hit[0].to === 'a' && hit[0].d > 0 && hit[0].k === 'fist', 'your jab lands once when your fist reaches them (' + JSON.stringify(hit) + ')');
    ok(await pg.evaluate(() => ONLINE.others.get('a').flashT > 0), 'they flash when your blow lands');
    const jolt = await pg.evaluate(async () => { const p0 = __dbg.you(), h = SHARED.heading; __dbg.VIT.hurt(.01, { x: p0.x + Math.sin(h), z: p0.z + Math.cos(h) }); await new Promise(r => setTimeout(r, 600)); const p = __dbg.you(); return Math.hypot(p.x - p0.x, p.z - p0.z); });
    ok(jolt > .05, 'a creature\'s blow jolts you back (' + jolt.toFixed(2) + ')');
    await place(-1.2); await pg.waitForTimeout(800); await pg.evaluate(() => { __sent.length = 0; });
    await pg.keyboard.press('j'); await pg.waitForTimeout(1500);
    ok(await pg.evaluate(() => !__sent.some(m => m.t === 'hit')), 'a jab with them behind you misses');
    const idle = async () => { for (let i = 0; i < 40 && await pg.evaluate(() => !!(__dbg.ST.move || __dbg.ST.up)); i++) await pg.waitForTimeout(250); };
    await idle(); await pg.evaluate(() => { __sent.length = 0; }); await pg.keyboard.press('n'); await pg.waitForTimeout(300);
    ok(await pg.evaluate(() => __sent.some(m => m.t === 'act' && m.k === 'N' && m.on === 1)), 'N slaps, and everyone sees it');
    await idle(); await pg.keyboard.down('c'); for (let i = 0; i < 20 && await pg.evaluate(() => !(__dbg.ST.move && __dbg.ST.move.name === 'crouch' && __dbg.ST.move.t > .1)); i++) await pg.waitForTimeout(100);
    await pg.keyboard.press('j'); await pg.waitForTimeout(50);
    const up = await pg.evaluate(() => __dbg.ST.up && __dbg.ST.up.name);
    await pg.keyboard.up('c'); await idle();
    ok(up === 'uppercut', 'crouch, then J: an uppercut (' + up + ')');
    await pg.keyboard.down('p'); await pg.waitForTimeout(400);
    const bk = await pg.evaluate(() => { const h = SHARED.heading, f = { x: __dbg.you().x + Math.sin(h), z: __dbg.you().z + Math.cos(h) }; return { block: WIELD.block, bare: WIELD.bare, d: __dbg.VIT.guard(.1, f).d, act: __sent.some(m => m.t === 'act' && m.k === 'B' && m.on === 1) }; });
    await pg.keyboard.up('p'); await pg.waitForTimeout(400);
    ok(bk.block && bk.bare && bk.d < .1 && bk.act, 'P with bare hands blocks and softens a blow (' + JSON.stringify(bk) + ')');
    const before = await pg.evaluate(() => ({ hp: __dbg.VIT.hp, p: __dbg.you() }));
    const busy = await pg.evaluate(() => { const o = ONLINE.others.get('a'); ONLINE.feed({ t: 'hit', id: 'a', d: .1, kb: 1, k: 'fist', from: [o.p.x, o.p.z] }); return JSON.stringify({ rag: RAGON(), out: __dbg.VIT.out }); });
    await pg.waitForFunction(b => { const p = __dbg.you(); return Math.hypot(p.x - b.x, p.z - b.z) > .05 || window.RAGON(); }, before.p, { timeout: 6000 }).catch(() => {});   // the shove lands when the runner gets to it; wait for it rather than a fixed time
    await pg.waitForTimeout(300);
    const after = await pg.evaluate(() => ({ hp: __dbg.VIT.hp, p: __dbg.you(), rag: window.RAGON() }));
    ok(after.hp < before.hp, 'their blow takes health (' + before.hp.toFixed(2) + ' -> ' + after.hp.toFixed(2) + ')');
    // the light blow's whole shove is 0.35 of a tile (0.099 here): half of it counts, a bump from elsewhere is not needed
    ok(Math.hypot(after.p.x - before.p.x, after.p.z - before.p.z) > .05 && !after.rag, 'a light blow shoves you without knocking you down' + (after.rag || Math.hypot(after.p.x - before.p.x, after.p.z - before.p.z) <= .05 ? ' ' + busy + JSON.stringify([before, after]) : ''));
    await pg.waitForTimeout(400);
    await pg.evaluate(() => { const o = ONLINE.others.get('a'); ONLINE.feed({ t: 'hit', id: 'a', d: .05, kb: 1.8, heavy: true, k: 'blade', from: [o.p.x, o.p.z] }); });
    await pg.waitForTimeout(600);
    ok(await pg.evaluate(() => window.RAGON()), 'a heavy blow knocks you down into the ragdoll');
    ok(await pg.evaluate(() => __sent.some(m => m.t === 'act' && m.k === 'F' && m.on === 1)), 'everyone is told you went down');
    const sent = await pg.evaluate(() => ({ on: __sent.find(m => m.t === 'ragon'), frames: __sent.filter(m => m.t === 'rag').length }));
    ok(sent.on && sent.on.n.length >= 11 && sent.frames >= 1, 'your ragdoll goes out to everyone (' + (sent.on ? sent.on.n.length : 0) + ' bodies, ' + sent.frames + ' frames)');
    await pg.evaluate(() => ONLINE.feed({ t: 'grab', id: 'a' }));
    ok(await pg.evaluate(() => __dbg.RAG.held && __dbg.RAG.held.by === 'a'), 'a player can pick you up while you are down');
    ok(await pg.evaluate(() => { ONLINE.feed({ t: 'grab', id: 'a' }); ONLINE.feed({ t: 'toss', id: 'b', v: [1, 0] }); return __dbg.RAG.held && __dbg.RAG.held.by === 'a'; }), 'only the one holding you can throw you');   // in one step: a hold lets go by itself after 10 s, which a slow runner can reach between steps
    const ko0 = await pg.evaluate(() => __dbg.RAG.ko);
    await pg.waitForTimeout(200); await pg.evaluate(() => { const o = ONLINE.others.get('a'); ONLINE.feed({ t: 'hit', id: 'a', d: .01, kb: 1, heavy: true, k: 'fist', from: [o.p.x, o.p.z] }); });
    ok(await pg.evaluate(k => __dbg.RAG.ko === k, ko0), 'a blow while you are down does not keep you down longer');
    ok(await pg.evaluate(() => { ONLINE.feed({ t: 'grab', id: 'a' }); for (let i = 0; i < 7; i++) { dispatchEvent(new KeyboardEvent('keydown', { key: 'a' })); dispatchEvent(new KeyboardEvent('keyup', { key: 'a' })); }
      return !__dbg.RAG.held && __sent.some(m => m.t === 'free' && m.to === 'a'); }), 'mashing keys breaks you free of their hands');
    await pg.evaluate(() => ONLINE.feed({ t: 'grab', id: 'a' }));
    await pg.evaluate(() => ONLINE.feed({ t: 'toss', id: 'a', v: [1, 0] }));
    ok(await pg.evaluate(() => !__dbg.RAG.held), 'and throw you');
    for (let i = 0; i < 120 && await pg.evaluate(() => window.RAGON() || __dbg.VIT.out > 0); i++) await pg.waitForTimeout(500);
    const down = await pg.evaluate(async () => { const on = __sent.find(m => m.t === 'ragon'), fr = __sent.filter(m => m.t === 'rag').pop(), o = ONLINE.others.get('a');
      ONLINE.feed({ ...on, id: 'a' }); const P = __dbg.you(); const f = { ...fr, id: 'a', o: [P.x / 1.13 + .5, -P.z / 1.13] };
      window.__ragF = f; for (let i = 0; i < 6; i++) { ONLINE.feed(f); await new Promise(r => setTimeout(r, 200)); }
      return { rag: !!(o.rag && o.rag.b), posed: !!(o.B && o.B.J && o.B.J.pelvis) }; });
    ok(down.rag && down.posed, 'a player who is down lies on your screen as their ragdoll fell (' + JSON.stringify(down) + ')');
    const g = await pg.evaluate(() => { __sent.length = 0; ONLINE.feed(__ragF); window.__ragI = 1; const fr = () => { if (!__ragI) return; ONLINE.feed(__ragF); requestAnimationFrame(fr); }; requestAnimationFrame(fr); const o = ONLINE.others.get('a'); let e = ''; try { ONLINE.use(o); } catch (x) { e = x.message; } return { e, age: performance.now() - (o.rag ? o.rag.t : 0), use: typeof ONLINE.use, sent: __sent.map(m => m.t) }; });
    ok(g.sent.includes('grab'), 'double-clicking a player who is down picks them up (' + JSON.stringify(g) + ')');
    await pg.evaluate(() => { SYS.run('act', 'J', 1); __ragI = 0; });
    ok(await pg.evaluate(() => __sent.some(m => m.t === 'toss' && m.to === 'a')), 'a punch throws them');
    const blade = await pg.evaluate(async () => { const o = ONLINE.others.get('a'); ONLINE.feed({ t: 'ragoff', id: 'a' }); ONLINE.feed({ t: 'aim', id: 'a', w: 'sword', v: [0, -.3, 1] });
      // their sword is drawn on a frame: wait for it, not a fixed time
      let seen = null; for (const t0 = performance.now(); performance.now() - t0 < 15000; await new Promise(r => setTimeout(r, 250))) { seen = WIELDDBG().find(x => x.id === 'a'); if (seen && seen.w === 'sword' && seen.shown) break; } ONLINE.feed({ t: 'swing', id: 'a', s: 1, h: 0 }); const sw = WIELDDBG().find(x => x.id === 'a');
      __sent.length = 0; ONLINE.on = true; FORAGE.give('sword', 1); WIELD.set('sword'); await new Promise(r => setTimeout(r, 1500)); const mine = __sent.find(m => m.t === 'aim');
      WIELD.set(null); await new Promise(r => setTimeout(r, 800)); const off = __sent.filter(m => m.t === 'aim').pop(); ONLINE.on = false; ONLINE.feed({ t: 'aim', id: 'a', w: '' });
      return { seen: !!(seen && seen.w === 'sword'), shown: !!(seen && seen.shown), swing: !!(sw && sw.sw), mine: mine ? mine.w + ':' + (mine.v || []).length : '', off: off ? off.w : null, left: WIELDDBG().length }; });
    ok(blade.seen && blade.shown && blade.swing, 'a player\'s sword is drawn in their hand and swings (' + JSON.stringify(blade) + ')');
    ok(blade.mine === 'sword:3' && blade.off === '' && blade.left === 0, 'your sword and your aim go out to everyone, and putting it away too');
    const hand = await pg.evaluate(async () => { ONLINE.feed({ t: 'aim', id: 'a', w: 'sword', v: [0, -.3, 1], h: 'L' }); await new Promise(r => setTimeout(r, 300)); const o = ONLINE.others.get('a'), l = o.S.hand; ONLINE.feed({ t: 'aim', id: 'a', w: 'sword', v: [0, -.3, 1] }); await new Promise(r => setTimeout(r, 300)); const r = o.S.hand; ONLINE.feed({ t: 'aim', id: 'a', w: '' }); return { l, r }; });
    ok(hand.l === 'L' && hand.r === 'R', 'a left-hander\'s sword is drawn in their left hand (' + JSON.stringify(hand) + ')');
    const faint = await pg.evaluate(async () => { const V = __dbg.VIT, o = ONLINE.others.get('a'); V.hp = .05; await new Promise(r => setTimeout(r, 200));
      ONLINE.feed({ t: 'hit', id: 'a', d: .1, kb: 1, k: 'fist', from: [o.p.x, o.p.z] }); const a = { fainted: V.fainted, dead: V.dead };
      await new Promise(r => setTimeout(r, 200)); ONLINE.feed({ t: 'hit', id: 'a', d: .1, kb: 1, k: 'fist', from: [o.p.x, o.p.z] }); return { ...a, dead2: V.dead }; });
    ok(faint.fainted && !faint.dead, 'at no health you faint, not die (' + JSON.stringify(faint) + ')');
    ok(faint.dead2, 'and a blow while you are out cold kills you');
    const err = await pg.evaluate(() => Object.entries(SYS.P).flatMap(([k, v]) => v.filter(s => s.err).map(s => k + ':' + s.name)));
    ok(!err.length, 'no SYS errors (' + err.join(',') + ')');
  }
  ok(!errs.length, 'no page errors' + (errs.length ? ': ' + errs.slice(0, 3).join(' | ') : ''));
  await b.close();
  console.log(fails.length ? fails.length + ' failed' : 'all brawl checks passed');
  process.exit(fails.length ? 1 : 0);
})();
