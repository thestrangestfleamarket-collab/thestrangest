// THE TREE GROWER (bake time only, not shipped): grows the park's trees and bushes as recipes (trunk and branch segments, leaf clumps, bunches and cards) for tools/trees-bake.cjs to write into data/trees.json.
module.exports = THREE => {
  const mul = a => () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
  const V = THREE.Vector3, r3 = v => Math.round(v * 100) / 100, ri = v => Math.max(0, Math.min(255, Math.round(v)));
  const PALS = [[[63,107,47],[85,133,59],[111,158,71]],[[79,95,42],[102,118,58],[130,144,74]],[[92,122,42],[120,154,54],[152,183,74]],
    [[47,90,46],[63,114,64],[87,138,79]],[[70,104,44],[95,138,55],[122,166,74]],[[59,100,64],[79,127,79],[108,154,95]]];
  const BARK = [[90,70,50],[78,61,44],[102,80,58],[87,74,60]];
  const skel = (R, o) => { const segs = [], tips = [];
    const grow = (p, dir, len, rad, depth) => { const mid = p.clone().addScaledVector(dir, len * .5).add(new V((R() - .5) * len * .14, 0, (R() - .5) * len * .14));
      const d2 = dir.clone().add(new V((R() - .5) * .35, (R() - .3) * .2, (R() - .5) * .35)).normalize(), end = mid.clone().addScaledVector(d2, len * .5), rm = rad * .86, re = rad * o.taper;
      segs.push([p, mid, rad, rm, depth], [mid, end, rm, re, depth]);
      if (depth === 0) { tips.push({ p: end, d: d2, len }); return; }
      const kids = o.kids[0] + Math.floor(R() * (o.kids[1] - o.kids[0] + 1)), az0 = R() * 6.283;
      for (let i = 0; i < kids; i++) { const az = az0 + i / kids * 6.283 + (R() - .5) * .9, el = o.spread * (.65 + R() * .6), side = new V(Math.cos(az), 0, Math.sin(az)), nd = d2.clone().multiplyScalar(Math.cos(el)).addScaledVector(side, Math.sin(el));
        nd.y += o.up * (.7 + R() * .6); nd.normalize(); grow(mid.clone().lerp(end, .45 + R() * .55), nd, len * (o.lenK + R() * .14), re * .78, depth - 1); }
      if (R() < o.lead) grow(end, d2.clone().add(new V(0, .35, 0)).normalize(), len * (o.lenK + .05), re * .85, depth - 1); };
    grow(new V(0, 0, 0), new V((R() - .5) * o.lean, 1, (R() - .5) * o.lean).normalize(), o.trunk, o.r, o.depth);
    return { segs, tips }; };
  const cluster = (CL, K) => { if (CL.length <= K) return CL.map(p => p.slice()); const S = [CL[0]];
    while (S.length < K) { let best = null, bd = -1; for (const p of CL) { let d = 1e9; for (const s of S) d = Math.min(d, Math.hypot(p[0] - s[0], p[1] - s[1], p[2] - s[2])); if (d > bd) { bd = d; best = p; } } S.push(best); }
    const G = S.map(() => []); for (const p of CL) { let bi = 0, bd = 1e9; S.forEach((s, i) => { const d = Math.hypot(p[0] - s[0], p[1] - s[1], p[2] - s[2]); if (d < bd) { bd = d; bi = i; } }); G[bi].push(p); }
    return G.filter(g => g.length).map(g => { const m = [0, 0, 0, 0, 0, 0, 0]; for (const p of g) for (let i = 0; i < 7; i++) m[i] += p[i] / g.length; let r = 0; for (const p of g) r = Math.max(r, Math.hypot(p[0] - m[0], p[1] - m[1], p[2] - m[2]) + p[3] * .9); m[3] = r; return m; }); };
  // a tree: 'clumps' (round clumps) or 'bunches' (small faceted bunches); low=true starts the crown just above the wall and fills it to there
  const tree = (style, seed, low) => {
    const R = mul(seed), clumps = style === 'clumps', h = 7 + R() * 2.5, pal = PALS[Math.floor(R() * PALS.length)], bc = BARK[Math.floor(R() * BARK.length)], shape = R();
    const o = { trunk: h * (low ? .17 + R() * .07 : .32 + R() * .1), r: .2 + R() * .1, depth: clumps ? 2 : 3, kids: [2, 3], spread: low ? .8 + R() * .35 : .55 + R() * .45, lenK: .62 + R() * .1,
      up: low ? .14 + R() * .12 : shape < .3 ? .55 : shape < .7 ? .35 : .2, taper: .72, lead: clumps ? .7 + R() * .25 : .35 + R() * .3, lean: .25 };
    const sk = skel(R, o), pr = [], LB = [], CL = [];
    for (const [a, b, r0, r1, dp] of sk.segs) { if (!clumps && dp === 0) continue; const j = .9 + R() * .2;
      pr.push([0, r3(a.x), r3(a.y), r3(a.z), r3(b.x), r3(b.y), r3(b.z), r3(Math.max(.03, r0)), r3(Math.max(.02, r1)), dp === o.depth ? 6 : 4, ri(bc[0] * j), ri(bc[1] * j), ri(bc[2] * j)]);
      if (dp >= o.depth - (clumps ? 1 : 2)) LB.push([a, b, r0]); }
    const c = new V(); for (const t of sk.tips) c.add(t.p); c.divideScalar(sk.tips.length || 1);
    let rad = 1.5, rh = 1, y0 = 1e9, y1 = -1e9; for (const t of sk.tips) { rad = Math.max(rad, t.p.distanceTo(c)); rh = Math.max(rh, Math.hypot(t.p.x - c.x, t.p.z - c.z)); y0 = Math.min(y0, t.p.y); y1 = Math.max(y1, t.p.y); }
    if (low) y0 = Math.min(y0, h * .2);
    const leaf = (x, y, z, s) => { const base = pal[Math.floor(R() * 3)], j = .88 + R() * .28, sx = s * (1 + R() * .3), sy = s * (clumps ? .8 + R() * .18 : .72 + R() * .3), sz = s * (1 + R() * .3);
      pr.push([clumps ? 1 : 2, r3(x), r3(y), r3(z), r3(sx), r3(sy), r3(sz), r3(R() * 6.283), ri(base[0] * j), ri(base[1] * j), ri(base[2] * j)]); CL.push([x, y, z, (sx + sy + sz) / 3, base[0] * j * .92, base[1] * j * .92, base[2] * j * .92]); };
    const S = () => clumps ? 1.1 + R() * .6 : .62 + R() * .4;
    // at every branch end, and once more pulled back toward the fork so the bunch reaches its branch
    for (const t of sk.tips) { leaf(t.p.x + (R() - .5) * .4, t.p.y + (R() - .3) * .4, t.p.z + (R() - .5) * .4, S());
      if (clumps || R() < .5) { const b = t.len * (.35 + R() * .3); leaf(t.p.x - t.d.x * b + (R() - .5) * .5, t.p.y - t.d.y * b, t.p.z - t.d.z * b + (R() - .5) * .5, S() * .9); } }
    // along the outer branches
    for (const [a, b, , , dp] of sk.segs) { if (dp > 1 || dp === o.depth) continue; const L = a.distanceTo(b), step = clumps ? 1.9 : 1.7;
      for (let u = step * .6; u < L; u += step) if (R() < .5) { const p = a.clone().lerp(b, u / L); leaf(p.x + (R() - .5) * .5, p.y + (R() - .4) * .4, p.z + (R() - .5) * .5, S()); } }
    // filling the crown's middle so it reads as one mass, and down to the crown's foot
    const ry = Math.max(1, (y1 - y0) / 2 + .7), cy = (y0 + y1) / 2 + .2, nf = (clumps ? 6 : 9) + (low ? (clumps ? 4 : 6) : 0);
    for (let i = 0; i < nf; i++) { const a = R() * 6.283, u = Math.sqrt(R()) * .78, v = (R() * 2 - 1) * .8; leaf(c.x + Math.cos(a) * rh * u, cy + v * ry, c.z + Math.sin(a) * rh * u, S() * (clumps ? 1.2 : 1.15)); }
    if (low) for (let i = 0, n = clumps ? 5 : 7; i < n; i++) { const a = i / n * 6.283 + R() * .5; leaf(c.x + Math.cos(a) * rh * (.55 + R() * .3), y0 + R() * .6, c.z + Math.sin(a) * rh * (.55 + R() * .3), S()); }
    return { pr, c: [r3(c.x), r3(c.y), r3(c.z), r3(rad + .6)], kN: clumps ? .35 : .6, tr: r3(2 * o.r), CL, LB, bc, K: clumps ? 10 : 9 };
  };
  // a vase tree (owner, 2 Nov 2026, his picture of the Mall's elms): a bare trunk forking into a few leaders that climb steeply and arch out, each
  // sprouting arcs that bend further over, the leaves an umbrella along the outer arcs; 'cherry' forks low, spreads wider than it is tall, pink, leaning to +x
  const PINKS = [[214,118,160],[232,150,186],[244,176,206]];
  const vase = (style, seed) => {
    const R = mul(seed), cherry = style === 'cherry', h = 10, pal = cherry ? PINKS : PALS[Math.floor(R() * PALS.length)], bc = cherry ? [64,48,42] : BARK[Math.floor(R() * BARK.length)];
    const r0 = cherry ? .3 : .36 + R() * .05, fy = h * (cherry ? .13 + R() * .05 : .24 + R() * .06), segs = [], tips = [], arcs = [];
    const lean = new V((R() - .5) * .12, 1, (R() - .5) * .12).normalize(), p1 = new V().addScaledVector(lean, fy * .55), fork = new V().addScaledVector(lean, fy);
    segs.push([new V(0, 0, 0), p1, r0, r0 * .93, 3], [p1, fork, r0 * .93, r0 * .86, 3]);
    const arc = (p, az, th0, th1, len, rad, depth) => { const k = 4; let cur = p.clone(), a = az, dir = null;
      for (let s = 0; s < k; s++) { const th = th0 + (th1 - th0) * Math.pow((s + .5) / k, 1.25); a += (R() - .5) * .25; dir = new V(Math.sin(th) * Math.cos(a), Math.cos(th), Math.sin(th) * Math.sin(a));
        const end = cur.clone().addScaledVector(dir, len / k), ra = rad * (1 - .62 * s / k), rb = rad * (1 - .62 * (s + 1) / k); segs.push([cur, end, ra, rb, depth]); arcs.push([cur, end, depth, s]);
        if (s >= 1 && depth > 0) for (let i = 0, m = 1 + Math.floor(R() * 2); i < m; i++) { const az2 = a + (R() < .5 ? -1 : 1) * (.5 + R() * .6), th2 = Math.min(1.4, th + .05 + R() * .25);
          arc(cur.clone().lerp(end, .4 + R() * .6), az2, th2, Math.min(cherry ? 1.5 : 1.65, th2 + .4 + R() * .3), len * (.3 + R() * .15) * (1 - .12 * s), rb * .62, depth - 1); }
        cur = end; }
      tips.push({ p: cur, d: dir, len: len / k }); };
    const n = cherry ? 4 + Math.floor(R() * 2) : 3 + Math.floor(R() * 3), az0 = R() * 6.283;
    for (let i = 0; i < n; i++) { const az = cherry ? (i < n - 1 ? -1.15 + 2.3 * i / (n - 2) + (R() - .5) * .3 : 3.14 + (R() - .5) * .8) : az0 + i / n * 6.283 + (R() - .5) * .6;
      const th0 = cherry ? .5 + R() * .25 : .22 + R() * .12, th1 = cherry ? 1.1 + R() * .2 : 1 + R() * .2, len = h * (cherry ? .75 + R() * .15 : .95 + R() * .15);
      arc(fork, az, th0, th1, len, r0 * (cherry ? .6 : .55), 2); }
    const pr = [], LB = [], CL = [];
    for (const [a, b, q0, q1, dp] of segs) { const j = .9 + R() * .2; pr.push([0, r3(a.x), r3(a.y), r3(a.z), r3(b.x), r3(b.y), r3(b.z), r3(Math.max(.03, q0)), r3(Math.max(.02, q1)), dp === 3 ? 7 : 4, ri(bc[0] * j), ri(bc[1] * j), ri(bc[2] * j)]); if (dp >= 1) LB.push([a, b, q0]); }
    const leaf = (x, y, z, s) => { y = Math.max(y, fy * 1.35 + s * .5); const base = pal[Math.floor(R() * 3)], j = .88 + R() * .28, sx = s * (1 + R() * .3), sy = s * (.72 + R() * .22), sz = s * (1 + R() * .3);
      pr.push([1, r3(x), r3(y), r3(z), r3(sx), r3(sy), r3(sz), r3(R() * 6.283), ri(base[0] * j), ri(base[1] * j), ri(base[2] * j)]); CL.push([x, y, z, (sx + sy + sz) / 3, base[0] * j * .92, base[1] * j * .92, base[2] * j * .92]); };
    const S = () => (cherry ? 1.15 : 1.25) + R() * .55;
    for (const t of tips) leaf(t.p.x + (R() - .5) * .4, t.p.y + (R() - .3) * .4, t.p.z + (R() - .5) * .4, S());
    // along the outer arcs (the leaders' last two steps, every side arc), so the leaves follow the arches
    for (const [a, b, dp, s] of arcs) { if (dp === 2 && s < 2) continue; const L = a.distanceTo(b), step = 1.5; for (let u = step * .5; u < L; u += step) if (R() < (dp === 2 ? .7 : .55)) { const p = a.clone().lerp(b, u / L); leaf(p.x + (R() - .5) * .6, p.y + (R() - .35) * .5, p.z + (R() - .5) * .6, S()); } }
    // the canopy's roof between the leaders' ends, hollow underneath
    const c = new V(); for (const t of tips) c.add(t.p); c.divideScalar(tips.length || 1); let rad = 1.5, rh = 1, y0 = 1e9, y1 = -1e9;
    for (const t of tips) { rad = Math.max(rad, t.p.distanceTo(c)); rh = Math.max(rh, Math.hypot(t.p.x - c.x, t.p.z - c.z)); y0 = Math.min(y0, t.p.y); y1 = Math.max(y1, t.p.y); }
    for (let i = 0, nf = cherry ? 10 : 8; i < nf; i++) { const a = R() * 6.283, u = .3 + Math.sqrt(R()) * .6; leaf(c.x + Math.cos(a) * rh * u, y1 - (y1 - y0) * .35 * u * u + (R() - .5) * .8, c.z + Math.sin(a) * rh * u, S() * 1.1); }
    return { pr, c: [r3(c.x), r3(c.y), r3(c.z), r3(rad + .8)], kN: .4, tr: r3(2 * r0), CL, LB, bc, K: cherry ? 14 : 22, vase: 1, card: cherry ? .45 : .8, hollow: cherry ? 0 : 1 };
  };
  // a bush: a few stems from one root, a low dome of leaf bunches on crossed cards, full to the ground
  const bush = seed => { const R = mul(seed), H = 1.2 + R() * .5, W = 1.7 + R() * .9, D = W * (.8 + R() * .3), pal = PALS[Math.floor(R() * PALS.length)], bc = BARK[Math.floor(R() * BARK.length)], cy = H * .42, pr = [];
    for (let i = 0, ns = 4 + Math.floor(R() * 3); i < ns; i++) { const az = i / ns * 6.283 + R() * .8, sp = .35 + R() * .45;
      pr.push([0, r3((R() - .5) * .15), 0, r3((R() - .5) * .15), r3(Math.cos(az) * W * .5 * sp), r3(H * (.55 + R() * .35)), r3(Math.sin(az) * D * .5 * sp), .06, .03, 4, bc[0], bc[1], bc[2]]); }
    for (let i = 0, nb = 16 + Math.floor(R() * 8); i < nb; i++) { const az = R() * 6.283, y = -.55 + R() * 1.5, rr = Math.sqrt(Math.max(0, 1 - Math.min(1, y * y))) * (.72 + R() * .3), base = pal[Math.floor(R() * 3)], j = .88 + R() * .24;
      const x = Math.cos(az) * rr * W * .5, z = Math.sin(az) * rr * D * .5, yy = Math.max(.18, cy + y * H * .6);
      for (let k = 0, nc = 3 + Math.floor(R() * 3); k < nc; k++) { const k2 = .9 + R() * .2;
        pr.push([3, r3(x + (R() - .5) * .35), r3(Math.max(.12, yy + (R() - .4) * .3)), r3(z + (R() - .5) * .35), r3(.45 + R() * .3), r3(R() * 6.283), r3(R() * 6.283), r3(R() * 6.283), ri(base[0] * j * k2), ri(base[1] * j * k2), ri(base[2] * j * k2)]); } }
    return { pr, c: [0, r3(cy), 0, r3(Math.max(W, H) * .5)], kN: .85, tr: r3(.7 * W) }; };
  return { tree, vase, bush, cluster };
};
