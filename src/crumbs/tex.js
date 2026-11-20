// Procedural PBR textures (albedo + normal + roughness) and the shared material library.
'use strict';
(function () {
const { lerp, clamp, sstep, col } = MC;
function hash(x, y, s) { let h = Math.imul(x, 374761393) + Math.imul(y, 668265263) + Math.imul(s, 1442695041) | 0; h = Math.imul(h ^ h >>> 13, 1274126177); return ((h ^ h >>> 16) >>> 0) / 4294967295; }
function vnoise(x, y, per, seed) {
  const xi = Math.floor(x), yi = Math.floor(y), xf = x - xi, yf = y - yi, u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf);
  const w = (i, j) => hash(((xi + i) % per + per) % per, ((yi + j) % per + per) % per, seed);
  return lerp(lerp(w(0, 0), w(1, 0), u), lerp(w(0, 1), w(1, 1), u), v);
}
function fbm(u, v, oct, fx, fy, seed) { let a = 0, amp = 0.5, n = 0; for (let i = 0; i < oct; i++) { a += amp * vnoise(u * fx, v * fy, Math.max(fx, fy), seed + i * 17); n += amp; amp *= 0.5; fx *= 2; fy *= 2; } return a / n; }
// cellular (Worley) noise, tileable: distance to the nearest jittered point, 0 at a cell centre
function worley(u, v, n, seed) { const x = u * n, y = v * n, xi = Math.floor(x), yi = Math.floor(y); let d = 9;
  for (let j = -1; j <= 1; j++) for (let i = -1; i <= 1; i++) { const cx = xi + i, cy = yi + j, wx = ((cx % n) + n) % n, wy = ((cy % n) + n) % n, px = cx + hash(wx, wy, seed), py = cy + hash(wx, wy, seed + 7); d = Math.min(d, Math.hypot(x - px, y - py)); }
  return d; }
MC.noise = { hash, vnoise, fbm, worley };

// fn(u, v, o) fills o.h (height 0..1), o.r/g/b (sRGB 0..1), o.rough (0..1)
function gen(N, fn, bump = 2) {
  N = Math.min(N, 128);   // a PlayStation's worth of texture: small and unfiltered
  const colD = new Uint8ClampedArray(N * N * 4), rghD = new Uint8ClampedArray(N * N * 4), nrmD = new Uint8ClampedArray(N * N * 4), H = new Float32Array(N * N), o = {};
  for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
    o.h = 0.5; o.r = o.g = o.b = 0.5; o.rough = 0.7; fn(x / N, y / N, o);
    const i = (y * N + x) * 4; H[y * N + x] = o.h;
    colD[i] = o.r * 255; colD[i + 1] = o.g * 255; colD[i + 2] = o.b * 255; colD[i + 3] = 255;
    rghD[i] = rghD[i + 1] = rghD[i + 2] = o.rough * 255; rghD[i + 3] = 255;
  }
  for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
    const xm = (x + N - 1) % N, xp = (x + 1) % N, ym = (y + N - 1) % N, yp = (y + 1) % N;
    let nx = (H[y * N + xm] - H[y * N + xp]) * bump * N / 64, ny = (H[yp * N + x] - H[ym * N + x]) * bump * N / 64, nz = 1;
    const l = Math.hypot(nx, ny, nz); nx /= l; ny /= l; nz /= l;
    const i = (y * N + x) * 4; nrmD[i] = (nx * 0.5 + 0.5) * 255; nrmD[i + 1] = (ny * 0.5 + 0.5) * 255; nrmD[i + 2] = (nz * 0.5 + 0.5) * 255; nrmD[i + 3] = 255;
  }
  const mk = (d, srgb) => {
    const c = document.createElement('canvas'); c.width = c.height = N; c.getContext('2d').putImageData(new ImageData(d, N, N), 0, 0);
    const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.magFilter = THREE.NearestFilter; t.minFilter = THREE.NearestMipmapNearestFilter; if (srgb) t.colorSpace = THREE.SRGBColorSpace; return t;
  };
  return { map: mk(colD, true), normalMap: mk(nrmD), roughnessMap: mk(rghD) };
}
MC.genTex = gen;
const mix3 = (o, a, b, t) => { o.r = lerp(a[0], b[0], t); o.g = lerp(a[1], b[1], t); o.b = lerp(a[2], b[2], t); };
const rgb = h => [(h >> 16 & 255) / 255, (h >> 8 & 255) / 255, (h & 255) / 255];
const std = (set, extra = {}) => new THREE.MeshStandardMaterial(Object.assign({ map: set.map, normalMap: set.normalMap, roughnessMap: set.roughnessMap, roughness: 1, metalness: 0 }, extra));

const M = MC.M = {};
MC.buildMaterials = function (pal) {
  // pal: per-home palette {wood:[a,b], tile:[a,b], grout, wall, enamel, ...}
  const P = Object.assign({ woodA: 0x9a6a3c, woodB: 0x5d3a1c, tileA: 0xe9e4d6, tileB: 0xd9d2bf, grout: 0x8d877a, enamel: 0x4f8a8b, mugC: 0xc9553f, floorA: 0x3d3a36, floorB: 0x8b8375, cab: 0x5a6b74, towelA: 0xed8029, towelB: 0xf7e6c2 }, pal || {});
  const wA = rgb(P.woodA), wB = rgb(P.woodB);
  M.wood = std(gen(512, (u, v, o) => {
    const strip = Math.floor(u * 6), su = u * 6 - strip, off = hash(strip, 7, 3);
    const g = fbm(u + off, v + off * 3, 4, 6, 2, 11 + strip), ring = 0.5 + 0.5 * Math.sin((u * 40 + g * 9 + off * 20) * 6.283 * 0.5);
    const t = clamp(0.35 * ring + 0.65 * g + (off - 0.5) * 0.35, 0, 1), seam = sstep(0, 0.03, Math.min(su, 1 - su));
    mix3(o, wA, wB, t); const k = 0.55 + 0.45 * seam; o.r *= k; o.g *= k; o.b *= k;
    o.h = 0.5 + 0.12 * ring * g - 0.4 * (1 - seam); o.rough = 0.42 + 0.3 * g;
  }, 1.2));
  const tA = rgb(P.tileA), tB = rgb(P.tileB), gr = rgb(P.grout);
  M.tile = std(gen(512, (u, v, o) => {
    const tx = Math.floor(u * 2), ty = Math.floor(v * 2), fu = u * 2 - tx, fv = v * 2 - ty, d = Math.min(fu, 1 - fu, fv, 1 - fv), e = sstep(0.012, 0.045, d);
    const var1 = hash(tx, ty, 5), sp = fbm(u, v, 3, 16, 16, 3);
    mix3(o, tA, tB, var1 * 0.7 + sp * 0.3); if (e < 1) { o.r = lerp(gr[0], o.r, e); o.g = lerp(gr[1], o.g, e); o.b = lerp(gr[2], o.b, e); }
    o.h = e * 0.6 + sp * 0.03; o.rough = lerp(0.95, 0.12 + sp * 0.12, e);
  }, 2.2));
  M.steel = std(gen(256, (u, v, o) => {
    const s = vnoise(u * 3, v * 180, 180, 4) * 0.6 + vnoise(u * 9, v * 256, 256, 9) * 0.4, b = fbm(u, v, 3, 4, 4, 2);
    const c = 0.66 + s * 0.08 + b * 0.05; o.r = c; o.g = c * 1.005; o.b = c * 1.02; o.h = s * 0.5; o.rough = 0.28 + s * 0.1;
  }, 0.05), { metalness: 0.85 });
  // crumb: open cells (Worley pores) with darker rims, low contrast, golden-cream
  M.bread = std(gen(512, (u, v, o) => {
    const w1 = worley(u, v, 22, 21), w2 = worley(u, v, 54, 5), f = fbm(u, v, 3, 8, 8, 2), pore = sstep(0.32, 0.12, w1), fine = sstep(0.3, 0.1, w2) * 0.5, rim = sstep(0.18, 0.34, w1) * sstep(0.5, 0.34, w1);
    mix3(o, [0.95, 0.88, 0.71], [0.78, 0.64, 0.44], clamp(pore * 0.75 + fine * 0.35 + (f - 0.5) * 0.2, 0, 1)); const k = 1 - rim * 0.07; o.r *= k; o.g *= k; o.b *= k;
    o.h = 0.75 - pore * 0.55 - fine * 0.25 + rim * 0.08; o.rough = 0.95;
  }, 2.6));
  M.crust = std(gen(256, (u, v, o) => { const p = fbm(u, v, 4, 8, 8, 31); mix3(o, [0.7, 0.45, 0.2], [0.5, 0.3, 0.12], p); o.h = p; o.rough = 0.75; }, 2));
  // Every grippable surface in the game uses this one woven, striped cloth.
  const TA = rgb(P.towelA), TB = rgb(P.towelB);
  M.grip = std(gen(256, (u, v, o) => {
    const a = Math.abs(Math.sin(u * 6.283 * 10)), b = Math.abs(Math.sin(v * 6.283 * 10)), over = (Math.floor(u * 20) + Math.floor(v * 20)) % 2;
    const w = over ? a * (1 - b * 0.5) : b * (1 - a * 0.5), fz = fbm(u, v, 3, 48, 48, 7), stripe = sstep(0.44, 0.5, Math.abs(((v * 3) % 1) - 0.5) * 2);
    mix3(o, TA, TB, stripe); const k = 0.8 + 0.2 * w + (fz - 0.5) * 0.12; o.r *= k; o.g *= k; o.b *= k;
    o.h = w * 0.7 + fz * 0.3; o.rough = 1;
  }, 1.1));
  M.card = std(gen(256, (u, v, o) => { const f = fbm(u, v, 4, 6, 60, 13), g2 = fbm(u, v, 3, 30, 30, 2); mix3(o, [0.7, 0.55, 0.37], [0.58, 0.43, 0.27], f); o.h = f * 0.6 + g2 * 0.4; o.rough = 0.9; }, 1.5));
  M.cork = std(gen(256, (u, v, o) => { const f = fbm(u, v, 4, 64, 64, 17), d = sstep(0.12, 0.02, worley(u, v, 90, 8)) * 0.5; mix3(o, [0.72, 0.55, 0.36], [0.6, 0.44, 0.27], clamp(f * 0.6 + d * 0.6, 0, 1)); o.h = f - d * 0.5; o.rough = 0.95; }, 1.0));
  M.plaster = std(gen(256, (u, v, o) => { const f = fbm(u, v, 5, 6, 6, 23); const c = 0.78 + f * 0.1; o.r = c; o.g = c * 0.98; o.b = c * 0.93; o.h = f; o.rough = 0.92; }, 1.2));
  const fA = rgb(P.floorA), fB = rgb(P.floorB);
  M.floor = std(gen(256, (u, v, o) => {
    const tx = Math.floor(u * 4), ty = Math.floor(v * 4), fu = u * 4 - tx, fv = v * 4 - ty, e = sstep(0.01, 0.04, Math.min(fu, 1 - fu, fv, 1 - fv)), f = fbm(u, v, 3, 12, 12, 4);
    mix3(o, (tx + ty) % 2 ? fA : fB, [0.1, 0.1, 0.1], 1 - e); o.r *= 0.85 + f * 0.3; o.g *= 0.85 + f * 0.3; o.b *= 0.85 + f * 0.3; o.h = e; o.rough = 0.3 + f * 0.3;
  }, 1.5));
  M.cheese = std(gen(256, (u, v, o) => { const f = fbm(u, v, 3, 5, 5, 41), hole = sstep(0.7, 0.76, fbm(u, v, 2, 9, 9, 6)); mix3(o, [0.98, 0.78, 0.25], [0.86, 0.6, 0.14], f * 0.6 + hole * 0.5); o.h = 0.6 - hole * 0.6 + f * 0.1; o.rough = 0.45 + f * 0.15; }, 2));
  M.sponge = std(gen(256, (u, v, o) => { const w = worley(u, v, 14, 51), hole = sstep(0.42, 0.22, w) * 0.85 + sstep(0.2, 0.05, worley(u, v, 40, 9)) * 0.4; mix3(o, [0.95, 0.82, 0.3], [0.8, 0.64, 0.16], hole); o.h = 1 - hole; o.rough = 1; }, 1.6));
  M.paint = std(gen(256, (u, v, o) => { const f = fbm(u, v, 3, 24, 24, 61); const c = rgb(P.enamel); o.r = c[0]; o.g = c[1]; o.b = c[2]; o.h = f; o.rough = 0.3 + f * 0.12; }, 0.1));
  M.cab = std(gen(256, (u, v, o) => { const f = fbm(u, v, 4, 3, 40, 71); const c = rgb(P.cab); o.r = c[0] * (0.85 + f * 0.3); o.g = c[1] * (0.85 + f * 0.3); o.b = c[2] * (0.85 + f * 0.3); o.h = f; o.rough = 0.55; }, 0.25));
  // inside the walls: old brick, rough-sawn studs, lath and crumbling plaster (the pub)
  M.brick = std(gen(512, (u, v, o) => { const rows = 8, by = v * rows, row = Math.floor(by), bx = u * 4 + (row % 2) * 0.5, col = Math.floor(bx), fx = bx - col, fy = by - row;
    const mort = Math.min(fx, 1 - fx) * 4 < 0.09 || Math.min(fy, 1 - fy) < 0.07, k = hash(col, row, 31), f = fbm(u, v, 4, 32, 32, 41);
    if (mort) { const m = 0.38 + f * 0.12; o.r = m; o.g = m * 0.95; o.b = m * 0.86; o.h = 0.1; o.rough = 0.97; }
    else { mix3(o, [0.52, 0.22, 0.14], [0.36, 0.17, 0.11], clamp(k * 0.7 + f * 0.5, 0, 1)); const soot = sstep(0.55, 0.9, fbm(u, v, 3, 6, 6, 9)) * 0.4; o.r *= 1 - soot; o.g *= 1 - soot; o.b *= 1 - soot; o.h = 0.6 + f * 0.3; o.rough = 0.88; } }, 2.4));
  M.stud = std(gen(256, (u, v, o) => { const g = fbm(u, v, 4, 4, 48, 77), s = fbm(u, v, 3, 30, 30, 5); mix3(o, [0.62, 0.48, 0.32], [0.42, 0.3, 0.19], clamp(g * 0.8 + s * 0.3, 0, 1)); o.h = g * 0.6 + s * 0.4; o.rough = 0.93; }, 1.6));
  M.lath = std(gen(256, (u, v, o) => { const by = v * 10, fy = by - Math.floor(by), gap = fy > 0.82, f = fbm(u, v, 4, 20, 20, 13);
    if (gap) { const c = 0.42 + f * 0.12; o.r = c; o.g = c * 0.95; o.b = c * 0.86; o.h = 0.7 + f * 0.2; o.rough = 0.95; } else { mix3(o, [0.5, 0.38, 0.25], [0.36, 0.26, 0.16], f); o.h = 0.4 + f * 0.2; o.rough = 0.9; } }, 1.4));
  M.felt = std(gen(128, (u, v, o) => { const f = fbm(u, v, 4, 40, 40, 3); o.r = 0.2 + f * 0.05; o.g = 0.32 + f * 0.06; o.b = 0.2 + f * 0.04; o.h = f; o.rough = 1; }, 0.6));
  M.paper = std(gen(256, (u, v, o) => { const f = fbm(u, v, 4, 30, 30, 81); const c = 0.9 + f * 0.08; o.r = c; o.g = c * 0.98; o.b = c * 0.93; o.h = f; o.rough = 0.95; }, 1));
  // nothing is factory-new: every plain surface carries scratches, scuffs, dents and grime (roughness, relief and a little colour)
  if (!MC.WEAR) {
    const scr = (u, v, n, seed, len) => { let a = 0; for (let k = 0; k < n; k++) { const cx = hash(k, 1, seed), cy = hash(k, 2, seed), ang = hash(k, 3, seed) * 3.14159, L = len * (0.3 + hash(k, 4, seed)); let dx = u - cx, dy = v - cy; dx -= Math.round(dx); dy -= Math.round(dy); const t = dx * Math.cos(ang) + dy * Math.sin(ang), d = Math.abs(-dx * Math.sin(ang) + dy * Math.cos(ang)); if (Math.abs(t) < L) a = Math.max(a, sstep(0.004, 0.001, d) * (1 - Math.abs(t) / L)); } return a; };
    const mk = (metal) => gen(256, (u, v, o) => {
      const s1 = scr(u, v, metal ? 70 : 34, 11, metal ? 0.22 : 0.1), scuff = sstep(0.52, 0.8, fbm(u, v, 4, 5, 5, 91)), dent = sstep(0.16, 0.0, worley(u, v, 5, 23)), fine = fbm(u, v, 3, 60, metal ? 6 : 60, 37), grime = fbm(u, v, 4, 3, 3, 55);
      o.h = 0.5 - dent * 0.5 - s1 * 0.25 + (fine - 0.5) * 0.12; o.rough = clamp(0.5 + scuff * 0.38 + s1 * 0.35 + (fine - 0.5) * 0.22 - dent * 0.1, 0.2, 1);
      const c = 1 - grime * 0.2 - scuff * 0.1 - s1 * 0.12 + dent * 0.05; o.r = c; o.g = c * 0.985; o.b = c * 0.96; }, metal ? 0.7 : 0.5);
    MC.WEAR = { metal: mk(true), soft: mk(false) };
  }
  const flat = (hex, rough, metal = 0, extra = {}) => { const w = extra.transparent || extra.noWear ? null : metal ? MC.WEAR.metal : MC.WEAR.soft, e = Object.assign({}, extra); delete e.noWear;
    const m = new THREE.MeshStandardMaterial(Object.assign({ color: col(hex), roughness: w ? Math.min(1, rough * 2) : rough, metalness: metal }, w ? { map: w.map, roughnessMap: w.roughnessMap, normalMap: w.normalMap } : {}, e));
    if (w) m.normalScale.set(0.55, 0.55); if (metal) m.envMapIntensity = 3.2; return m; };   // metal is only what it reflects: it keeps more of the room than the rest does
  M.flat = flat;
  M.ceramic = flat(P.mugC, 0.18); M.white = flat(0xf2efe6, 0.25); M.black = flat(0x0c0c0e, 0.5); M.chrome = flat(0xdfe3e6, 0.12, 1);
  M.rubber = flat(0x1a1a1d, 0.85); M.wax = flat(0xe9dfc4, 0.6, 0, { emissive: col(0x3a2006), emissiveIntensity: 0.35 });
  M.tin = flat(0xb9bcc0, 0.38, 1); M.brass = flat(0xc9a14a, 0.3, 1); M.glass = flat(0xcfe6ee, 0.05, 0, { transparent: true, opacity: 0.28 });
  M.skin = flat(0xe0a98a, 0.55); M.pj = flat(0x5b6fa8, 0.9); M.hair = flat(0x3b2a20, 0.8);
  M.pea = flat(0x6fb043, 0.45); M.fur = flat(0x6e665c, 1); M.pink = flat(0xe9a6a0, 0.38, 0, { emissive: col(0x3a1010), emissiveIntensity: 0.15 }); M.plastic = flat(0xd94f4f, 0.35);
  M.slot = new THREE.MeshStandardMaterial({ color: col(0x0a0a0c), roughness: 0.6, emissive: col(0xff4a0a), emissiveIntensity: 0 });
  for (const k in M) if (M[k] && M[k].normalMap) M[k].normalScale = new THREE.Vector2(1, 1);
  M.steel.normalScale.set(0.35, 0.35); M.crumbGold = M.bread.clone(); M.crumbGold.color = col(0xe9b872);
};
})();
