// THE ROOM THINGS TAKE (owner, 8 Nov 2026: "do all three go"): node tests/space.cjs [dist/market.html]. Every character takes its body's own room
// (an elephant is not a point), you stop at its edge and at a standing body's, characters wait for each other, the server's walkers wait for each
// other (worker/folk.js), and the characters near you are bodies in the loose things' physics.
const { chromium } = require('playwright'), path = require('path'), fs = require('fs'), vm = require('vm');
const ROOT = path.resolve(__dirname, '..'), PAGE = path.resolve(process.argv[2] || ROOT + '/dist/market.html');
const fails = [], ok = (c, m) => { if (!c) { fails.push(m); console.log((process.env.GITHUB_ACTIONS ? '::error title=space::' : 'FAIL ') + m); } else console.log('ok   ' + m); };

// the server's walks: one walker sent through another standing in its way waits for it, then goes on (never stuck for good)
{ const ctx = {}; vm.runInNewContext(fs.readFileSync(ROOT + '/worker/folk.js', 'utf8').replace(/^export .*$/m, '') + '\nthis.F=FOLKSIM;', ctx); const F = ctx.F, S = F.make(); S.T = 1; S.freeFn = () => true;
  F.set(S, 'a', { x: 0, z: 0, v: 1, R: .3, mode: { roam: 1 } }); F.set(S, 'b', { x: 2, z: 0, v: 1, R: .3, mode: { hold: 1 } });
  const A = S.by.a; A.to = { x: 6, z: 0 }; A.wait = 0; let min = 1e9, t = 0; for (; t < 12 && A.to; t++) { F.step(S, 1, () => .5); if (t < 2) min = Math.min(min, Math.hypot(A.x - 2, A.z)); }
  ok(min >= .6 - 1e-6, 'a walker waits for one in its way (closest ' + min.toFixed(2) + ', bodies .60)'); ok(A.x > 2.5, 'and goes on after a while (at ' + A.x.toFixed(2) + ')'); }

(async () => {
  const b = await chromium.launch({ executablePath: process.env.PW_CHROMIUM || undefined, args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader'] }), pg = await b.newPage({ viewport: { width: 900, height: 620 } });
  const errs = {}; pg.on('pageerror', e => { errs[e.message] = (errs[e.message] || 0) + 1; });
  await pg.goto('file://' + PAGE + '?hour=12&physics=1', { waitUntil: 'commit', timeout: 300000 });
  let up = false; for (let i = 0; i < 400 && !(up = await pg.evaluate(() => !!window.__started).catch(() => false)); i++) await pg.waitForTimeout(1000);
  if (!up) { ok(false, 'the page started'); await b.close(); process.exit(1); }
  // no horse walks the map now: the check stands one by you, out on the street (the animals' file waits until you are out)
  await pg.evaluate(async () => { if (__dbg.NPCS.find(n => n.key === 'horse')) return; if (window.LOAD) await LOAD('later'); if (__dbg.out && !__dbg.out()) { const B = __dbg.MAPK.BOD; __dbg.UI.goTo(B.X(40), B.Z(60), 0); } for (let i = 0; i < 100 && !(window.CREATURES && CREATURES.Horse); i++) await new Promise(r => setTimeout(r, 300)); const h = CREATNEW('Horse', 'horse', 1.6); h.st.x = STORE.pos.x + 4; h.st.z = STORE.pos.z; });
  await pg.waitForTimeout(15000);
  // (the tomato is a standing body of the cast now, NPCS.extra, no longer a walker)
  // (the cast is built over the start's first seconds: wait till the tomato and a second character who blocks are standing, or two minutes)
  for (let i = 0; i < 120 && !(await pg.evaluate(() => { const N = __dbg.NPCS, a = (N.find(n => n.key === 'tomato') || N.extra.find(x => x.key === 'tomato' && x.on && x.st)); return !!a && N.some(n => n !== a && n.st && n.blocks && (n.lv || 'up') === (a.lv || 'up') && !n.fly && !n.tiny && n.key !== 'dragon'); }).catch(() => false)); i++) await pg.waitForTimeout(1000);
  const r = await pg.evaluate(() => { const N = __dbg.NPCS, by = k => N.find(n => n.key === k), o = {};
    for (const k of ['elephant', 'horse', 'cat', 'tomato', 'bat', 'rat']) { const n = by(k); if (n) o[k] = { R: n.st.R, L: n.st.L || 0, fly: !!n.fly, tiny: !!n.tiny }; }
    // you walk into the horse's flank and the elephant's trunk end: kept out of the body itself, not just its middle
    const out = (n, fx) => { if (!n) return null; const s = n.st, far = n.far, x0 = s.x, z0 = s.z, py = SHARED.py; n.far = false; SHARED.py = n.g.position.y; const k = (s.LZ || 0) + (s.L || 0) * fx, p = { x: s.x + Math.sin(s.h) * k + Math.cos(s.h) * .01, z: s.z + Math.cos(s.h) * k - Math.sin(s.h) * .01 }; n.push(p);
      const L = s.L || 0, cx = s.x + Math.sin(s.h) * (s.LZ || 0), cz = s.z + Math.cos(s.h) * (s.LZ || 0), t = Math.max(-L, Math.min(L, (p.x - cx) * Math.sin(s.h) + (p.z - cz) * Math.cos(s.h))), d = Math.hypot(p.x - cx - Math.sin(s.h) * t, p.z - cz - Math.cos(s.h) * t);
      const moved = Math.hypot(s.x - x0, s.z - z0); s.x = x0; s.z = z0; n.far = far; SHARED.py = py; return { d, need: s.R + .3, moved }; };
    o.horse_in = out(by('horse'), .5); o.elephant_nose = out(by('elephant'), 1);
    // a standing body (the cast's, NPCS.extra) keeps you out too
    const X = N.extra.find(x => x.on && x.st && x.g && x.mode !== 'hidden' && (x.lv || 'up') === SHARED.LVL); if (X) { const vis = X.g.visible, s = X.st, p = { x: s.x + .02, z: s.z }; X.g.visible = true; N.pushX(p); X.g.visible = vis; o.extra = { key: X.key, d: Math.hypot(p.x - s.x, p.z - s.z), need: (s.R || .3) + .3 }; }
    // two characters: the second is told to walk through the first, it waits instead
    const ok1 = n => n.st && n.blocks && !n.fly && !n.tiny && n.key !== 'dragon', a = (N.find(n => n.key === 'tomato') || N.extra.find(x => x.key === 'tomato' && x.on && x.st) || N.find(n => ok1(n) && (n.lv || 'up') === 'up')), m = a && N.find(n => n !== a && n.st && n.blocks && (n.lv || 'up') === (a.lv || 'up') && !n.fly && !n.tiny && n.key !== 'dragon'); if (a && m) { const f = [a.far, m.far]; a.far = m.far = false; o.inway = N.inway(m, a.st.x + .05, a.st.z) && !N.inway(m, a.st.x + 50, a.st.z); [a.far, m.far] = f; }
    o.clip = { added: CLIP.added, found: CLIP.found.length };
    return o; });
  console.log(JSON.stringify(r));
  ok(r.horse && r.horse.R > .3 && r.horse.L > 0, 'a horse is long, not a point (radius ' + (r.horse && r.horse.R.toFixed(2)) + ')');
  ok(!r.rat || r.rat.tiny, 'a rat is too small to bump into');
  ok(r.horse_in && r.horse_in.d >= r.horse_in.need - 1e-3, 'walking into a horse\'s flank stops you at its side');
  ok(!r.extra || r.extra.d >= r.extra.need - 1e-3, 'a standing body keeps you out' + (r.extra ? ' (' + r.extra.key + ')' : ' (none standing)'));
  ok(r.inway === true, 'a character waits for one in its way, not when the way is clear');
  ok(r.clip.added > 0, 'the load\'s pass made the placed things solid (' + r.clip.added + ' boxes)');
  // the physics: walk to the nearest character so the loose things' world wakes, then it holds a body for each character near you
  const near = await pg.evaluate(() => { const L = __dbg.NPCS, N = L.find(n => n.key === 'tomato') || L.extra.find(x => x.key === 'tomato' && x.on && x.st) || L.find(n => n.st && n.g && !n.fly && !n.tiny && n.key !== 'dragon' && (n.lv || 'up') === 'up' && n.st.inT == null && !/^(squirrel|ticketfox)$/.test(n.key) && n.mode !== 'hidden'); if (!N) return null; __dbg.ui().goTo(N.st.x + 2, N.st.z); return N.key; });
  let crowd = []; for (let i = 0; i < 40 && !crowd.length; i++) { await pg.waitForTimeout(1000); crowd = await pg.evaluate(() => GPH.ready && GPH.crowd ? GPH.crowd() : []); }
  if (!crowd.length) console.log('physics:', JSON.stringify(await pg.evaluate(() => ({ ready: !!GPH.ready, n: GPH.n, me: __dbg.pos(), near: __dbg.NPCS.filter(n => n.st && Math.hypot(n.st.x - __dbg.pos()[0], n.st.z - __dbg.pos()[2]) < 15).map(n => [n.key, n.lv, !!n.far, !!n.fly, !!n.tiny, n.mode, n.st.inT, n.g.visible, !!n._cv, +n.g.position.y.toFixed(2)]) }))));
  ok(crowd.length > 0, 'the characters near you are bodies in the loose things\' physics (' + crowd.slice(0, 6).join(', ') + (near ? '; near ' + near : '') + ')');
  ok(!Object.keys(errs).length, 'no page errors' + (Object.keys(errs).length ? ': ' + JSON.stringify(errs).slice(0, 400) : ''));
  await b.close(); console.log(fails.length ? fails.length + ' failed' : 'all passed'); process.exit(fails.length ? 1 : 0);
})();
