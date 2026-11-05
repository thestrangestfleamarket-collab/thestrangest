// THE FOLK'S WALKS CHECK: node tests/folk.cjs dist/market.html. The walks alone (worker/folk.js): a roamer crosses the park wall only through its gate, a home ranger keeps to its range and goes in and out of its shop, an errand is routed round a block, the walks are saved and reloaded; in the page (111db-walks): the street's walkers join the walks and follow them, a server's word puts and walks them, a job's errand gets there, the walk grid is baked for a server from another build.
const { chromium } = require('playwright'), path = require('path');
const fails = [], ok = (c, m) => { if (!c) { fails.push(m); console.log((process.env.GITHUB_ACTIONS ? '::error title=folk::' : 'FAIL ') + m); } else console.log('ok   ' + m); };
(async () => {
  const { FOLKSIM: F } = await import(path.resolve(__dirname, '../worker/folk.js'));
  { const T = 1.13, C = T / 2, w = 120, h = 100, m = new Uint8Array(w * h);
    for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) m[j * w + i] = (j === 50 && (i < 56 || i > 63)) || (i >= 20 && i <= 30 && j >= 20 && j <= 30) || i < 2 || j < 2 || i >= w - 2 || j >= h - 2 ? 0 : 1;
    const S = F.make(), rle = F.pack(m, w * h); let seed = 7; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
    ok(F.grid(S, { v: 'v1', x0: 0, z0: 0, c: C, w, h, rle, T, gate: { z: 50.5 * C, x0: 57 * C, x1: 63 * C } }) && rle.length < 2000 && F.free(S, 40 * C, 40 * C) && !F.free(S, 25 * C, 25 * C), 'the walk grid: packed small, free where the page said');
    F.set(S, 'a', { x: 40 * C, z: 40 * C, v: .4 * T, R: .3 * T, auto: 1, mode: { roam: 1 } }, rnd);
    F.set(S, 'b', { x: 80 * C, z: 80 * C, v: .4 * T, R: .3 * T, auto: 1, mode: { b: { x: 80 * C, z: 80 * C, r: 6 * T }, shop: { x: 90 * C, z: 90 * C } } }, rnd);
    F.set(S, 'c', { x: 10 * C, z: 10 * C, v: .4 * T, R: .3 * T, mode: { hold: 1 } }, rnd); F.set(S, 'c', { goal: { gid: 'work@1', at: { x: 40 * C, z: 40 * C } } }, rnd);
    ok(!F.set(S, 'x', { mode: { roam: 1 } }) && !F.set(S, '', { x: 1, z: 1 }) && !S.by.x, 'a walker with no place to start, or no name, is not taken');
    let crossed = 0, offGate = 0, side = S.by.a.z < S.gate.z, maxB = 0, inB = 0, outB = 0, cDone = 0, blocked = 0, held = 0;
    for (let i = 0; i < 2400; i++) { F.step(S, .5, rnd); const a = S.by.a, b = S.by.b, c = S.by.c; if (!F.free(S, a.x, a.z) || !F.free(S, b.x, b.z)) blocked++;
      const sd = a.z < S.gate.z; if (sd !== side) { crossed++; if (Math.abs(a.x - 60 * C) > 5 * C) offGate++; side = sd; }
      maxB = Math.max(maxB, Math.hypot(b.x - 80 * C, b.z - 80 * C) / T); if (b.in) inB++; else outB++; if (c.done === 'work@1' && !cDone) cDone = i; if (i > cDone + 10 && cDone && c.to) held++; }
    ok(crossed >= 2 && !offGate, 'a roamer crosses the park wall only through its gate (' + crossed + ' crossings)');
    ok(maxB < 8 && inB > 50 && outB > 200, 'a home ranger keeps to its range and goes in and out of its shop (' + maxB.toFixed(1) + ' tiles out at most, in ' + inB + ' of ' + (inB + outB) + ' half-seconds)');
    ok(cDone > 20 && cDone < 400 && S.by.c.path === null && !held, 'an errand is routed round the block and walked there, then the walker stands as told (' + (cDone / 2) + ' s)');
    ok(!blocked, 'nobody walks into a wall');
    const sn = F.snap(S); ok(sn.n.length === 3 && sn.n.every(r => r.length === 9 && typeof r[0] === 'string' && typeof r[6] === 'number'), 'the word to the page: every walker, its place, its way, its state');
    const S2 = F.load(JSON.parse(JSON.stringify(F.save(S)))); F.step(S2, 1, rnd); ok(Object.keys(S2.by).length === 3 && !!S2.g && F.free(S2, 40 * C, 40 * C) && JSON.stringify(F.save(S)).length < 20000, 'the walks are saved and reloaded whole');
    const S3 = F.make(); F.set(S3, 'd', { x: 1, z: 1, mode: { roam: 1 } }); F.step(S3, 5); ok(S3.by.d.x === 1 && S3.by.d.z === 1, 'with no grid yet nobody moves'); }

  const b = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const pg = await b.newPage({ viewport: { width: 960, height: 600 } }), errs = [];
  pg.on('pageerror', e => errs.push(e.message.slice(0, 300)));
  await pg.goto('file://' + path.resolve(process.argv[2] || 'dist/market.html') + '?fresh=1&hour=13&at=53,10', { waitUntil: 'commit' });
  let st = false; for (let i = 0; i < 60 && !st; i++) { await pg.waitForTimeout(3000); st = await pg.evaluate(() => !!window.__started).catch(() => false); }
  ok(st, 'the page starts');
  if (st) {
    await pg.waitForTimeout(6000);
    const r1 = await pg.evaluate(() => { const T = __dbg.MAPK.BOD.XS(1) - __dbg.MAPK.BOD.XS(0), D = WALKSDBG(), L = [...WALKS.by.values()]; window.__T = T;
      const auto = L.filter(r => r.auto), out = L.filter(r => !r.N.st.pin && r.N.mode !== 'hidden'), near = out.filter(r => { const E = WALKS.S.by[r.k]; return E && Math.hypot(E.x - r.N.st.x, E.z - r.N.st.z) < 2.5 * T; });   // (one settled inside at a work spot stands off its door: the walks hold it at the door)
      window.__K = WALKS.by.has('tvcat') ? 'tvcat' : (auto.find(r => r.N.st.v != null) || auto[0] || {}).k;
      return { n: D.n, remote: D.remote, auto: auto.length, near: near.length, all: out.length, keys: D.keys.slice(0, 8), one: !!WALKS.by.get(window.__K), hooked: L.every(r => r.N.st.folk === r) }; });
    ok(r1.n > 10 && r1.auto > 10 && !r1.remote && r1.one && r1.hooked, 'the street\'s walkers join the walks, run here off the website (' + r1.n + ', ' + r1.auto + ' of their own: ' + r1.keys.join(' ') + ')');
    ok(r1.near === r1.all, 'every walker stands where the walks have it (' + r1.near + ' of ' + r1.all + ')');
    // the walks move them: a roamer the walks send somewhere is walking there itself after a while
    // (brought next to you: a walker out of sight is only put where the walks have it, not walked)
    const r2 = await pg.evaluate(async () => { const T = __T, P = __dbg.you(), C = [...WALKS.by.values()].filter(r => r.auto && r.N.st.v != null); C.sort((a, b) => (a.k === __K ? -1 : 0) - (b.k === __K ? -1 : 0));
      // free ground d tiles from (x, z), the longest clear run of any of 16 ways (a stall or a stoop is no place to start a walk)
      window.__free = (x, z, d) => { let best = null, bl = -1; for (let a = 0; a < 16; a++) { const dx = Math.sin(a * Math.PI / 8), dz = Math.cos(a * Math.PI / 8); let k = 1; for (; k <= d + 6; k++) if (!STFREE(x + dx * k * T, z + dz * k * T, .3 * T)) break; if (k - 1 >= d && k - 1 > bl) { bl = k - 1; best = { x: x + dx * d * T, z: z + dz * d * T }; } } return best; };
      const at = __free(P.x, P.z, 2) || { x: P.x + 2 * T, z: P.z };
      let r = null; for (const c of C.slice(0, 6)) { const N = c.N, E = WALKS.S.by[c.k]; E.x = N.st.x = at.x; E.z = N.st.z = at.z; E.to = null; E.wait = 0; N.st.to = null; await new Promise(r => setTimeout(r, 700)); if (!N.far) { r = c; break; } }
      if (!r) return { moved: 0, picks: 0, far: true, to: false, near: 0 }; window.__K = r.k; const N = r.N, E = WALKS.S.by[r.k]; const x0 = N.st.x, z0 = N.st.z;
      let moved = 0, picks = 0; for (let i = 0; i < 40; i++) { await new Promise(r => setTimeout(r, 250)); WALKS.sim.step(WALKS.S, .25); if (E.to && N.st.to && N.st.to.x === E.to.x) picks++; moved = Math.max(moved, Math.hypot(N.st.x - x0, N.st.z - z0)); }
      return { moved: moved / T, picks, far: N.far, to: !!E.to, near: Math.hypot(N.st.x - P.x, N.st.z - P.z) / T }; });
    ok(r2.picks > 0 && r2.moved > .5, 'the roamer walks to where the walks send it, by its own steps (' + r2.picks + ' looks, moved ' + r2.moved.toFixed(1) + ' tiles, ' + r2.near.toFixed(1) + ' from you' + (r2.far ? ', FAR' : '') + ')');
    // a server's word: a snapshot puts a walker, then walks it
    const r3 = await pg.evaluate(async () => { const T = __T, sent = []; const s0 = ONLINE.send; ONLINE.send = m => sent.push(m); const was = ONLINE.on; ONLINE.on = true;
      const r = WALKS.by.get(__K), N = r.N, P = __dbg.you(), p2 = __free(P.x, P.z, 3) || { x: N.st.x + 2 * T, z: N.st.z }, x = p2.x, z = p2.z;
      const till = async f => { for (let i = 0; i < 80 && !f(); i++) await new Promise(r => setTimeout(r, 250)); return f(); };   // (a slow renderer: wait for frames, not seconds)
      ONLINE.feed({ t: 'hi', you: 'me', all: [], world: {}, folk: { at: 1, n: [[__K, x, z, '', '', 0, 0, '', 0]] }, fv: WALKS.stamp() });
      await till(() => Math.hypot(N.st.x - x, N.st.z - z) < T); const d1 = Math.hypot(N.st.x - x, N.st.z - z) / T;
      ONLINE.feed({ t: 'folk', at: 2, n: [[__K, x, z, x + 4 * T, z, 0, 1, '', 0]] }); const to = await till(() => N.st.to && Math.abs(N.st.to.x - (x + 4 * T)) < .01);
      ONLINE.feed({ t: 'folk', at: 3, n: [[__K, x + 30 * T, z, '', '', 0, 0, '', 0]] }); await till(() => Math.hypot(N.st.x - (x + 30 * T), N.st.z - z) < .5 * T); const far = Math.hypot(N.st.x - (x + 30 * T), N.st.z - z) / T;
      const reg = sent.find(m => m.t === 'folk' && Array.isArray(m.set) && m.set.some(a => a[0] === __K && a[1].mode && a[1].mode.roam));
      const out = { remote: WALKS.remote, d1, to, far, reg: !!reg, grid: sent.some(m => m.t === 'folk' && m.grid), sets: sent.filter(m => m.t === 'folk' && m.set).length };
      ONLINE.send = s0; ONLINE.on = was; return out; });
    ok(r3.remote && r3.reg, 'on the website the server is told of every walker (its place, pace and mode)');
    ok(r3.d1 < 1, 'the server\'s word puts a walker where it has it (' + r3.d1.toFixed(2) + ' tiles off after 1.5 s)');
    ok(r3.to, 'and sets its way: the walker walks to the server\'s next point');
    ok(r3.far < .5, 'a walker far from the server\'s word is put there (' + r3.far.toFixed(2) + ')');
    ok(!r3.grid, 'a server from this build is not sent the walk grid again');
    // a server from another build asks for the grid: it is baked a few rows a frame and sent
    const r4 = await pg.evaluate(async () => { const sent = []; const s0 = ONLINE.send; ONLINE.send = m => sent.push(m); const was = ONLINE.on; ONLINE.on = true; const t0 = performance.now();
      ONLINE.feed({ t: 'hi', you: 'me', all: [], world: {}, folk: { at: 1, n: [] }, fv: 'another build' });
      let g = null; for (let i = 0; i < 120 && !g; i++) { await new Promise(r => setTimeout(r, 250)); g = sent.find(m => m.t === 'folk' && m.grid); }
      ONLINE.send = s0; ONLINE.on = was; WALKS.remote = false; const G = g && g.grid;
      return G ? { ms: performance.now() - t0, w: G.w, h: G.h, rle: G.rle.length, v: G.v === WALKS.stamp(), gate: !!(G.gate && G.gate.x1 > G.gate.x0), free: (G.rle.match(/,/g) || []).length } : null; });
    ok(r4 && r4.w > 100 && r4.h > 100 && r4.rle > 1000 && r4.rle < 200000 && r4.v && r4.gate, 'the walk grid is baked and sent to a server from another build (' + JSON.stringify(r4) + ')');
    // a job's errand goes by the walks: the roamer is sent to a door some tiles off and gets there
    const r5 = await pg.evaluate(async () => { const T = __T, r = WALKS.by.get(__K), N = r.N, s = N.st; let tx = s.x, tz = s.z, best = 0;
      for (let a = 0; a < 16; a++) { const dx = Math.sin(a * Math.PI / 8), dz = Math.cos(a * Math.PI / 8); let k = 1; for (; k < 10; k++) if (!STFREE(s.x + dx * k * T, s.z + dz * k * T, s.R)) break; if (k - 1 > best) { best = k - 1; tx = s.x + dx * best * T; tz = s.z + dz * best * T; } }
      let got = null; const t0 = performance.now(); WALKS.errand(N, { x: tx, z: tz }, { gid: 'test@1', then: ok => { got = ok; } });
      for (let i = 0; i < 160 && got == null; i++) { await new Promise(r => setTimeout(r, 250)); WALKS.sim.step(WALKS.S, 1); }   // (the walks stepped a second a quarter: a slow renderer's frames are few)
      await new Promise(r => setTimeout(r, 1500)); return { got, d: Math.hypot(s.x - tx, s.z - tz) / T, best, s: (performance.now() - t0) / 1000, done: WALKS.S.by[__K].done }; });
    ok(r5.got === true && r5.d < 1.5, 'an errand walks the roamer to a door ' + r5.best + ' tiles off and says when it is there (' + r5.d.toFixed(2) + ' tiles off after ' + r5.s.toFixed(0) + ' s)');
    const r6 = await pg.evaluate(() => { const J = JOBS.list.find(J => J.state === 'work' || J.state === 'off' || J.state === 'home'); const D = J && WALKSDBG(WALKS.key(J.N)); return { jobs: JOBS.list.length, J: !!J, has: !!(J && WALKS.has(J.N)), mode: D && D.r && D.r.mode }; });
    ok(!r6.J || r6.has && r6.mode && /hold|band|"r"/.test(r6.mode), 'the cast\'s jobs tell the walks where each stands or wanders (' + JSON.stringify(r6) + ')');
  }
  ok(!errs.length, 'no page errors' + (errs.length ? ': ' + errs.join(' | ') : ''));
  await b.close();
  console.log(fails.length ? 'FAILED ' + fails.length : 'ALL OK'); process.exit(fails.length ? 1 : 0);
})();
