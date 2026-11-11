// THE TAMING CHECK (src/146zjd-taming.js): node tests/taming.cjs [dist/market.html]. TAMING starts at 0 under THE WILD; its three tiers open at 0, 40 and 70; a forced pass tames a
// park crow into a pet of yours (saved with your pets, gone from the wild a while); a forced fail sends one running; a dungeon creature tamed fights what attacks you (its blows
// as yours go); a deer tamed at 70 carries you (W moves you, GET DOWN puts you down, it follows again); another player sees your pet and your mount; the server's tame; no page errors.
const { chromium } = require('playwright'), path = require('path');
const fails = [], ok = (c, m) => { if (!c) { fails.push(m); console.log((process.env.GITHUB_ACTIONS ? '::error title=taming::' : 'FAIL ') + m); } else console.log('ok   ' + m); };
(async () => {
  // the dungeon's own sim (worker/dunmobs.js): a tamed monster leaves with no reward, once
  const { MOBSIM } = await import(path.resolve('worker/dunmobs.js'));
  { const S = { t: 5, m: [{ i: 3, dead: 0, hp: 2, tg: 'me' }] }, a = MOBSIM.tame(S, 3), b = MOBSIM.tame(S, 3);
    ok(a && S.m[0].dead && S.m[0].hp === 0 && b === null, 'the dungeon sim: a tamed monster leaves, and only once'); }
  const b = await chromium.launch({ ...(process.env.PWEXE ? { executablePath: process.env.PWEXE } : {}), args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const pg = await b.newPage({ viewport: { width: 800, height: 500 } }), errs = [];
  pg.on('pageerror', e => errs.push(e.message.slice(0, 300)));
  await pg.goto('file://' + path.resolve(process.argv[2] || 'dist/market.html') + '?fresh=1&hour=13&at=80,95&res=0', { waitUntil: 'commit' });
  await pg.waitForFunction(() => window.__started, null, { timeout: 300000 });
  await pg.waitForFunction(() => !FADE.busy && OUT.open, null, { timeout: 120000, polling: 200 });
  await pg.waitForFunction(() => !document.getElementById('loading'), null, { timeout: 150000, polling: 500 });
  await pg.evaluate(async () => { window.UI = __dbg.UI; UI.setView('third'); WX.hold = 'CLEAR'; window.WU = 33.9 / 30 / .84; window.P0 = { x: PETS.dbg.pos.x, z: PETS.dbg.pos.z }; await TAMING.load(); });
  const D = () => pg.evaluate(() => TAMING.dbg());
  const done = async () => { for (let i = 0; i < 120; i++) { if (!(await D()).trying) break; await pg.waitForTimeout(500); } await pg.waitForTimeout(800); };   // (the try is three seconds of the game's time; software rendering here runs it slower)

  const s0 = await pg.evaluate(() => ({ sk: FORAGE.sk('tame'), listed: FORAGE.SK.some(s => s[0] === 'tame' && s[1] === 'TAMING'), band: TAMING.BAND }));
  ok(s0.sk === 0 && s0.listed && s0.band.pet === 0 && s0.band.fight === 40 && s0.band.ride === 70, 'TAMING starts at 0; its tiers open at 0, 40, 70 ' + JSON.stringify(s0));

  // the tiers by band: at 0 a crow may be tried, a dungeon slime and a deer not; at 45 the slime may, the deer not; at 75 the deer may
  const gate = await pg.evaluate(() => { const S = FORAGE.S.sk, r = {};
    const at = (v, w) => { S.tame = v * 10; const ok = (() => { TAMING.go({ src: 'm', i: -1, w }); return !!TAMING.dbg().trying; })(); TAMING.stop(); return ok; };
    r.p0 = at(0, 'Crow'); r.f0 = at(0, 's:green'); r.r0 = at(0, 'Deer'); r.f45 = at(45, 's:green'); r.r45 = at(45, 'Deer'); r.r75 = at(75, 'Deer'); S.tame = 0; return r; });
  ok(gate.p0 && !gate.f0 && !gate.r0 && gate.f45 && !gate.r45 && gate.r75, 'the tiers: wildlife from 0, dungeon creatures from 40, big animals from 70 ' + JSON.stringify(gate));

  // stand by one of the park's creatures of a kind and TAME it (the use key's thing on it)
  const near = kind => pg.evaluate(k => { const P = PETS.dbg.pos, L = CREATS.filter(N => N.kind === k && N.body.visible && N.g.visible && !N.life); if (!L.length) return null;
    L.sort((a, b) => Math.hypot(a.st.x - P.x, a.st.z - P.z) - Math.hypot(b.st.x - P.x, b.st.z - P.z)); const N = L[0]; window.TN = N; N.st.hold = true; N.st.to = null;
    P.x = N.st.x + 1.1 * WU; P.z = N.st.z; return { x: +(N.st.x / WU).toFixed(1), z: +(N.st.z / WU).toFixed(1) }; }, kind);
  const tame = async (kind, force) => { const at = await near(kind); if (!at) return { at };
    for (let i = 0; i < 20; i++) { const d = await D(); if (d.cur && d.cur.w === kind) break; await pg.evaluate(k => { const P = PETS.dbg.pos; TN.st.hold = true; TN.st.to = null; P.x = TN.st.x + 1.1 * WU; P.z = TN.st.z; }, kind); await pg.waitForTimeout(300); }
    await pg.waitForTimeout(700); const r0 = await pg.evaluate(f => { TAMING.force = f; const c = TAMING.cur(); if (!c) return null; TAMING.go(c); return { cur: TAMING.dbg().cur, try: TAMING.dbg().trying }; }, force);
    await done(); return { at, r0, pets: await pg.evaluate(() => PETS.list().map(r => ({ k: PETS.decode(r.c).k, tm: r.tm, out: r.out, z: PETS.decode(r.c).z }))) }; };
  const t1 = await tame('Crow', true), crow = t1.pets && t1.pets.find(p => p.k === 'crow');
  const t1b = await pg.evaluate(() => ({ why: TAMING.dbg().why, hidden: !TN.g.visible || !TN.body.visible || TAMING.dbg().hid > 0, saved: (JSON.parse(PETS.dbg.OWNED.get('pets') || '[]')).some(r => r.tm && r.c.startsWith('crow|')) }));
  ok(t1.r0 && t1.r0.cur && /TAME THE/.test(t1.r0.cur.name) && crow && crow.tm && crow.out && t1b.hidden && t1b.saved, 'a forced pass: the park crow is your pet, out with you and saved; gone from the wild ' + JSON.stringify({ ...t1, ...t1b }));
  await pg.waitForTimeout(1500);
  const pm = await pg.evaluate(() => { const N = PETS.mine(); return N ? { k: N.pet.k, vis: N.g.visible } : null; });
  ok(pm && pm.k === 'crow' && pm.vis, 'the tamed crow follows you ' + JSON.stringify(pm));

  // a forced fail: it runs off and will not have you for a while
  const f1 = await tame('Duck', false);
  await pg.evaluate(() => { TN.st.hold = false; }); for (let i = 0; i < 50; i++) { if (await pg.evaluate(() => Math.hypot(TN.st.x - PETS.dbg.pos.x, TN.st.z - PETS.dbg.pos.z) / WU > 2.5)) break; await pg.waitForTimeout(500); }
  const f2 = await pg.evaluate(() => ({ why: TAMING.dbg().why, d1: Math.hypot(TN.st.x - PETS.dbg.pos.x, TN.st.z - PETS.dbg.pos.z) / WU, ducks: PETS.list().filter(r => PETS.decode(r.c).k === 'duck').length, again: (TAMING.go({ src: 'c', N: TN, w: 'Duck', key: TN.wkey || 'cr' + CREATS.indexOf(TN) }), !!TAMING.dbg().trying) }));
  ok(f1.r0 && f1.r0.try && f2.ducks === 0 && f2.d1 > 2.5 && !f2.again, 'a forced fail: the duck runs off, no pet, and will not be tried again yet ' + JSON.stringify({ f1, f2 }));

  // a dungeon creature (a stand-in dungeon: its picture and its two calls): tamed at 45 it is yours and goes for what attacks you, striking it as your blows go
  const m0 = await pg.evaluate(() => { const P = PETS.dbg.pos; window.MH = []; window.MT = []; window.M0 = __dbg.MAPK.MODS.dunmobs; window.DUNMOBS = __dbg.MAPK.MODS.dunmobs = { pic: { m: [[7, 'r', 's', 'green', P.x + .9 * WU, P.z, 0, 2, 2, 0, 0, 0, 0, 'me', 0], [8, 'r', 's', 'blue', P.x - 4 * WU, P.z + 1 * WU, 0, 3, 3, 0, 0, 0, 0, 'me', 0]] },
      smite: (i, d) => MH.push([i, +d.toFixed(2)]), tame: i => { MT.push(i); DUNMOBS.pic.m = DUNMOBS.pic.m.filter(e => e[0] !== i); return Promise.resolve(true); } };
    FORAGE.S.sk.tame = 450; TAMING.force = true; TAMING.go({ src: 'm', i: 7, w: 's:green', key: 'm7' }); return { try: TAMING.dbg().trying }; });
  await done();
  const m1 = await pg.evaluate(() => ({ tamed: MT.slice(), out: PETS.decode(PETS.out().c).k }));
  for (let i = 0; i < 80; i++) { if (await pg.evaluate(() => MH.length > 1)) break; await pg.waitForTimeout(500); }
  const m2 = await pg.evaluate(() => ({ hits: MH.slice(), fight: TAMING.dbg().fight, pet: (N => N && { d: +(Math.hypot(N.st.x - DUNMOBS.pic.m[0][4], N.st.z - DUNMOBS.pic.m[0][5]) / WU).toFixed(2) })(PETS.mine()) }));
  ok(m0.try && m1.tamed[0] === 7 && m1.out === 'greenslime' && m2.fight && m2.fight.i === 8 && m2.hits.length && m2.hits.every(h => h[0] === 8 && h[1] > 0), 'a dungeon slime tamed at 45 leaves the dungeon, is yours, and fights the one that attacks you ' + JSON.stringify({ m0, m1, m2 }));
  const m3 = await pg.evaluate(() => { __dbg.MAPK.MODS.dunmobs = M0; delete window.DUNMOBS; const r = PETS.out(); const n0 = PETS.list().length; PETS.letGo(r.id); return { n0, n1: PETS.list().length }; });
  ok(m3.n1 === m3.n0 - 1, 'and it can be released ' + JSON.stringify(m3));

  // a big animal: a deer of the woods, tamed at 75, ridden: W moves you, GET DOWN puts you down and it follows again
  await pg.evaluate(() => { FORAGE.S.sk.tame = 750; });
  const r1 = await tame('Deer', true), deer = r1.pets && r1.pets.find(p => p.k === 'deer');
  ok(deer && deer.tm && deer.out && deer.z > 150, 'a forced pass at 75: the deer is yours, at its life size ' + JSON.stringify(r1));
  await pg.evaluate(() => { PETS.dbg.pos.x = P0.x; PETS.dbg.pos.z = P0.z; }); await pg.waitForTimeout(4000);   // (back on the open, dry ground where you began: it comes to you)
  const acts = await pg.evaluate(() => { const N = PETS.mine(); return N && N.th && (N.th.acts || []).map(a => a.name); });
  const r2 = await pg.evaluate(() => { const N = PETS.mine(), a = N && N.th.acts.find(a => /^RIDE/.test(a.name)); if (a) a.act(); return { on: RIDE.on }; });
  await pg.waitForTimeout(3000);
  const r3 = await pg.evaluate(() => ({ ...TAMING.mount.dbg(), petShown: !!(PETS.mine() && PETS.mine().g.visible), pf: ONLINE.mine.pf(), mt: !!ONLINE.mine.mt(), x: PETS.dbg.pos.x, z: PETS.dbg.pos.z }));
  ok(acts && acts.some(n => /^RIDE/.test(n)) && r2.on === 'mount' && r3.mine && r3.ok && !r3.petShown && r3.pf == null && r3.mt, 'RIDE: you are up on your deer (saddled), it no longer walks beside you; others are told your mount ' + JSON.stringify({ acts, r2, r3 }));
  if (r3.seat) { const g = await pg.evaluate(() => SHARED.groundY(PETS.dbg.pos.x, PETS.dbg.pos.z) / WU); ok(r3.seat[1] - g > .8 && r3.seat[1] - g < 2, 'the seat is on its back ' + JSON.stringify({ seat: r3.seat, g })); }
  for (let k = 0; k < 4; k++) {   // (in the woods a trunk may stand right before it: it pulls up there, so try the four ways)
    const p0 = await pg.evaluate(k => { const h = RIDE.hd + k * Math.PI / 2; RIDE.hd = SHARED.heading = h; SHARED.yaw = SHARED.yawTo = h - Math.PI; return { x: PETS.dbg.pos.x, z: PETS.dbg.pos.z }; }, k);
    await pg.keyboard.down('w'); let went = false; for (let i = 0; i < 24; i++) { if (went = await pg.evaluate(a => Math.hypot(PETS.dbg.pos.x - a.x, PETS.dbg.pos.z - a.z) / WU > 1.5, p0)) break; await pg.waitForTimeout(500); }
    if (went) break; await pg.keyboard.up('w'); }
  const r4 = await pg.evaluate(() => ({ v: TAMING.mount.dbg().v, x: PETS.dbg.pos.x, z: PETS.dbg.pos.z })); await pg.keyboard.up('w');
  ok(r4.v > .5 || Math.hypot(r4.x - r3.x, r4.z - r3.z) > 1, 'W: it carries you ' + JSON.stringify({ v: r4.v, moved: Math.hypot(r4.x - r3.x, r4.z - r3.z) / (33.9 / 30 / .84) }));
  await pg.waitForTimeout(2500);
  const r5 = await pg.evaluate(() => { const th = UI.things.find(t => t.name === 'GET DOWN'), c = UI.choices(); const first = c[0] && c[0].name; th.act(); return { first, on: RIDE.on }; });
  await pg.waitForTimeout(1500);
  const r6 = await pg.evaluate(() => ({ on: RIDE.on, pet: !!(PETS.mine() && PETS.mine().g.visible), pf: !!ONLINE.mine.pf() }));
  ok(r5.first === 'GET DOWN' && r6.on == null && r6.pet && r6.pf, 'GET DOWN (the first choice while up): you are down and it follows you again ' + JSON.stringify({ r5, r6 }));

  // another player: their tamed pet beside them, then their mount under them
  const o1 = await pg.evaluate(async () => { ONLINE.on = true; const P = PETS.dbg.pos, code = PETS.code(PETS.my()), crow = 'crow||' + '|' + '|100|0|';
    ONLINE.feed({ t: 'hi', you: 'me', all: [{ id: 'q', name: 'ROSA', look: 'w00', x: { pf: crow }, at: [P.x + 3 * WU, P.z, SHARED.py, 0, SHARED.LVL, ''] }] });
    await new Promise(r => setTimeout(r, 3000)); const t = PETS.theirs.get('q');
    const pet = !!(t && t.N && t.N.pet.k === 'crow');
    ONLINE.feed({ t: 'in', p: { id: 'q', name: 'ROSA', look: 'w00', x: { mt: code }, at: [P.x + 3 * WU, P.z, SHARED.py, 0, SHARED.LVL, ''] } });
    ONLINE.feed({ t: 'ride', id: 'q', b: 'mount' }); await new Promise(r => setTimeout(r, 4000));
    const r = { pet, ride: RIDEDBG().theirs, mount: TAMING.mount.dbg().theirs }; ONLINE.on = false; return r; });
  ok(o1.pet && o1.ride.some(r => r.id === 'q' && r.b === 'mount') && o1.mount === 1, 'another player is seen with their tamed pet, then up on their mount ' + JSON.stringify(o1));

  ok(!errs.length, 'no page errors ' + errs.join(' | '));
  await b.close(); console.log(fails.length ? fails.length + ' failed' : 'all good'); process.exit(fails.length ? 1 : 0);
})().catch(e => { console.log('FAIL ' + e.message); process.exit(1); });
