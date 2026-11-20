// Open world: 82 km x 82 km procedurally-shaped island (heights, forests, farmland, towns, airbases) rendered with
// chunked LOD terrain, PBR-sourced splat texturing, shader water, instanced tree impostors and instanced buildings.
import * as THREE from 'three';
import { atmo, ATMO_GLSL } from './sky.js';

export const N = 1024, CELL = 80, SIZE = N * CELL, HALF = SIZE / 2;
const CH = 64, NCH = N / CH; // 16x16 chunks

// ---------- noise ----------
const perm = new Uint8Array(512); { let s = 1337; const r = () => (s = (s * 1664525 + 1013904223) >>> 0) / 4294967296; const p = Array.from({ length: 256 }, (_, i) => i); for (let i = 255; i > 0; i--) { const j = (r() * (i + 1)) | 0;[p[i], p[j]] = [p[j], p[i]]; } for (let i = 0; i < 512; i++) perm[i] = p[i & 255]; }
const GX = [1, -1, 1, -1, 1.414, -1.414, 0, 0], GY = [1, 1, -1, -1, 0, 0, 1.414, -1.414];
function noise(x, y) {
  const xi = Math.floor(x), yi = Math.floor(y), xf = x - xi, yf = y - yi, X = xi & 255, Y = yi & 255;
  const u = xf * xf * xf * (xf * (xf * 6 - 15) + 10), v = yf * yf * yf * (yf * (yf * 6 - 15) + 10);
  const a = perm[perm[X] + Y] & 7, b = perm[perm[X + 1] + Y] & 7, c = perm[perm[X] + Y + 1] & 7, d = perm[perm[X + 1] + Y + 1] & 7;
  const n00 = GX[a] * xf + GY[a] * yf, n10 = GX[b] * (xf - 1) + GY[b] * yf, n01 = GX[c] * xf + GY[c] * (yf - 1), n11 = GX[d] * (xf - 1) + GY[d] * (yf - 1);
  return (n00 + (n10 - n00) * u + (n01 + (n11 - n01) * u - n00 - (n10 - n00) * u) * v) * 0.7;
}
function fbm(x, y, o) { let s = 0, a = 0.5, f = 1; for (let i = 0; i < o; i++) { s += a * noise(x * f, y * f); a *= 0.5; f *= 2.03; } return s; }
function ridged(x, y, o) { let s = 0, a = 0.5, f = 1, w = 1; for (let i = 0; i < o; i++) { let n = 1 - Math.abs(noise(x * f, y * f)) * 1.6; n = n * n * w; w = Math.min(1, Math.max(0, n * 1.6)); s += a * n; a *= 0.5; f *= 2.1; } return s; }
const sstep = (a, b, x) => { x = Math.min(1, Math.max(0, (x - a) / (b - a))); return x * x * (3 - 2 * x); };
const hash2 = (x, y) => { let h = (x * 374761393 + y * 668265263) | 0; h = (h ^ (h >>> 13)) * 1274126177 | 0; return ((h ^ (h >>> 16)) >>> 0) / 4294967296; };

export class World {
  constructor() { this.H = new Float32Array(N * N); this.forest = new Uint8Array(N * N); this.farm = new Uint8Array(N * N); this.bases = []; this.towns = []; }

  generate() {
    const H = this.H;
    for (let j = 0; j < N; j++) for (let i = 0; i < N; i++) {
      const u = i / N * 2 - 1, v = j / N * 2 - 1, px = u * 3.1, py = v * 3.1;
      const r = Math.hypot(u, v) + 0.22 * fbm(px * 0.9 + 9.1, py * 0.9 + 3.3, 4);
      const land = 1 - sstep(0.5, 0.86, r);
      const base = fbm(px * 1.4 + 1.7, py * 1.4 - 4.2, 6) * 0.5 + 0.5;
      const mm = sstep(0.02, 0.3, fbm(px * 0.55 - 7.7, py * 0.55 + 2.4, 3) + 0.08);
      const rg = ridged(px * 1.25 + 4.4, py * 1.25 + 8.8, 6);
      let h = -160 + land * (175 + 240 * Math.pow(base, 1.6)) + land * land * mm * (rg * rg * 3100 + base * 250);
      h += fbm(px * 14, py * 14, 3) * 26 * sstep(40, 500, h); // rocky detail on high ground
      if (h > 0 && h < 60) h = h * (0.35 + 0.65 * h / 60); // broad coastal plains
      if (h < 0) h = Math.max(-400, h * 3);
      H[j * N + i] = h;
    }
    this.pickSites();
    // biome masks
    for (let j = 1; j < N - 1; j++) for (let i = 1; i < N - 1; i++) {
      const k = j * N + i, h = H[k]; if (h < 1.5) continue;
      const sx = (H[k + 1] - H[k - 1]) / (2 * CELL), sz = (H[k + N] - H[k - N]) / (2 * CELL), sl = Math.hypot(sx, sz);
      const u = i / N * 2 - 1, v = j / N * 2 - 1;
      const site = this.siteMask(i, j);
      const fm = h < 260 && sl < 0.07 ? sstep(-0.05, 0.12, fbm(u * 9 + 31, v * 9 - 17, 3)) : 0;
      const fo = sstep(-0.08, 0.2, fbm(u * 15 + 5, v * 15 + 51, 4)) * (1 - sstep(1300, 1750, h)) * (1 - sstep(0.45, 0.8, sl)) * sstep(2, 8, h);
      this.farm[k] = 255 * fm * (1 - site); this.forest[k] = 255 * fo * (1 - fm * 0.92) * (1 - site);
    }
  }

  pickSites() {
    const H = this.H, cand = [];
    for (let j = 40; j < N - 40; j += 8) for (let i = 40; i < N - 40; i += 8) {
      const h = H[j * N + i]; if (h < 10 || h > 240) continue; let mn = 1e9, mx = -1e9;
      for (let b = -24; b <= 24; b += 6) for (let a = -10; a <= 10; a += 5) { const q = H[(j + b) * N + i + a]; mn = Math.min(mn, q); mx = Math.max(mx, q); }
      if (mn < 4) continue; cand.push({ i, j, rough: mx - mn, d: Math.hypot(i - N / 2, j - N / 2) });
    }
    cand.sort((a, b) => a.rough - b.rough);
    const sites = []; for (const c of cand) { if (sites.every(s => Math.hypot(s.i - c.i, s.j - c.j) > 110)) sites.push(c); if (sites.length >= 14) break; }
    sites.sort((a, b) => a.d - b.d);
    sites.forEach((s, n) => {
      const x = s.i * CELL - HALF, z = s.j * CELL - HALF, isBase = n % 4 === 0 && this.bases.length < 3;
      const rx = isBase ? 14 : 12, rz = isBase ? 30 : 12; let sum = 0, cnt = 0;
      for (let b = -rz; b <= rz; b += 3) for (let a = -rx; a <= rx; a += 3) { sum += H[(s.j + b) * N + s.i + a]; cnt++; }
      const h0 = Math.max(8, sum / cnt);
      for (let b = -rz * 2; b <= rz * 2; b++) for (let a = -rx * 2; a <= rx * 2; a++) {
        const k = (s.j + b) * N + s.i + a; if (k < 0 || k >= N * N) continue; const d = Math.hypot(a / rx, b / rz); const w = 1 - sstep(1, 2, d); H[k] = H[k] + (h0 - H[k]) * w;
      }
      const site = { x, z, y: h0, i: s.i, j: s.j, rx, rz, isBase }; (isBase ? this.bases : this.towns).push(site);
    });
  }
  townMask(i, j) { let m = 0; for (const s of this.towns) m = Math.max(m, 1 - sstep(0.7, 1.1, Math.hypot((i - s.i) / s.rx, (j - s.j) / s.rz))); return m; }
  siteMask(i, j) { let m = 0; for (const s of this.bases) m = Math.max(m, 1 - sstep(0.9, 1.3, Math.hypot((i - s.i) / s.rx, (j - s.j) / s.rz))); for (const s of this.towns) m = Math.max(m, 1 - sstep(0.7, 1.1, Math.hypot((i - s.i) / s.rx, (j - s.j) / s.rz))); return m; }

  // terrain height (bilinear). Outside the map: deep sea.
  heightAt(x, z) {
    const fx = (x + HALF) / CELL, fz = (z + HALF) / CELL; if (fx < 0 || fz < 0 || fx >= N - 1 || fz >= N - 1) return -300;
    const i = fx | 0, j = fz | 0, u = fx - i, v = fz - j, H = this.H, k = j * N + i;
    // match the mesh triangulation (diagonal split) for exact wheel contact
    const h00 = H[k], h10 = H[k + 1], h01 = H[k + N], h11 = H[k + N + 1];
    return u + v <= 1 ? h00 + (h10 - h00) * u + (h01 - h00) * v : h11 + (h01 - h11) * (1 - u) + (h10 - h11) * (1 - v);
  }
  ground = (x, z) => Math.max(0, this.heightAt(x, z));
  // top of whatever stands at (x,z): building roof or forest canopy; -1e9 if clear
  obstacleTop(x, z) {
    const cell = this.bgrid && this.bgrid.get(((Math.floor(x / 256) + 4096) << 13) | (Math.floor(z / 256) + 4096)); let top = -1e9;
    if (cell) for (const b of cell) { const dx = x - b.x, dz = z - b.z, lx = dx * b.c + dz * b.s, lz = -dx * b.s + dz * b.c; if (Math.abs(lx) < b.hw && Math.abs(lz) < b.hd) top = Math.max(top, b.top); }
    if (top < -1e8 && this.forestAt(x, z) > 0.55) { const h = this.heightAt(x, z); if (h > 2.5 && h < 1750) top = h + 9; }
    return top;
  }
  forestAt(x, z) { const i = Math.round((x + HALF) / CELL), j = Math.round((z + HALF) / CELL); return i < 0 || j < 0 || i >= N || j >= N ? 0 : this.forest[j * N + i] / 255; }

  // ---------- GPU resources ----------
  build(scene, tex) {
    const H = this.H;
    // normal + water depth texture, splat texture
    const nd = new Uint8Array(N * N * 4), sp = new Uint8Array(N * N * 4);
    for (let j = 0; j < N; j++) for (let i = 0; i < N; i++) {
      const k = j * N + i, i0 = Math.max(i - 1, 0), i1 = Math.min(i + 1, N - 1), j0 = Math.max(j - 1, 0), j1 = Math.min(j + 1, N - 1);
      let nx = -(H[j * N + i1] - H[j * N + i0]) / ((i1 - i0) * CELL), nz = -(H[j1 * N + i] - H[j0 * N + i]) / ((j1 - j0) * CELL); const l = 1 / Math.hypot(nx, 1, nz);
      nd[k * 4] = (nx * l * 0.5 + 0.5) * 255; nd[k * 4 + 1] = (l * 0.5 + 0.5) * 255; nd[k * 4 + 2] = (nz * l * 0.5 + 0.5) * 255; nd[k * 4 + 3] = Math.min(255, Math.max(0, -H[k] / 60 * 255));
      sp[k * 4] = this.forest[k]; sp[k * 4 + 1] = this.farm[k]; sp[k * 4 + 2] = this.townMask(i, j) * 255; sp[k * 4 + 3] = 255;
    }
    const mk = d => { const t = new THREE.DataTexture(d, N, N, THREE.RGBAFormat); t.magFilter = t.minFilter = THREE.LinearFilter; t.wrapS = t.wrapT = THREE.ClampToEdgeWrapping; t.needsUpdate = true; return t; };
    this.normalTex = mk(nd); this.splatTex = mk(sp);

    const U = { ...atmo, uNormalTex: { value: this.normalTex }, uSplat: { value: this.splatTex },
      tGrass: { value: tex.grass }, tRock: { value: tex.rock }, tSand: { value: tex.sand }, tSnow: { value: tex.snow }, tForest: { value: tex.forest }, tFarm: { value: tex.farm }, tDetailN: { value: tex.grassN }, tCliff: { value: tex.cliff } };
    this.terrainMat = new THREE.ShaderMaterial({ uniforms: U, fog: false,
      vertexShader: /* glsl */`varying vec3 vW; void main(){ vW = position; gl_Position = projectionMatrix * viewMatrix * vec4(position, 1.0); }`,
      fragmentShader: ATMO_GLSL + /* glsl */`
        varying vec3 vW; uniform sampler2D uNormalTex, uSplat, tGrass, tRock, tSand, tSnow, tForest, tFarm, tDetailN, tCliff;
        float h21(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
        vec3 two(sampler2D t, vec2 p, float near, float far, float k){ return mix(texture2D(t, p / near).rgb, texture2D(t, p / far).rgb, k); }
        void main(){
          vec2 uv = (vW.xz + ${HALF.toFixed(1)}) / ${SIZE.toFixed(1)};
          vec4 nt = texture2D(uNormalTex, uv); vec3 n = normalize(nt.xyz * 2.0 - 1.0);
          vec4 sp = texture2D(uSplat, uv + (texture2D(uNoise, vW.xz / 700.0).rg - 0.5) * 0.0022);
          float dist = distance(vW, cameraPosition); float kf = smoothstep(150.0, 2200.0, dist);
          vec3 mac = texture2D(uNoise, vW.xz / 5200.0).rgb; float mac2 = texture2D(uNoise, vW.xz / 900.0).g;
          float h = vW.y + (mac.r - 0.5) * 120.0; float slope = 1.0 - n.y;
          vec2 rxz = mat2(0.8, -0.6, 0.6, 0.8) * vW.xz;
          #ifdef LOWQ
          vec3 gfar = texture2D(tGrass, vW.xz / 410.0).rgb;
          #else
          vec3 gfar = mix(texture2D(tGrass, vW.xz / 410.0).rgb, texture2D(tGrass, rxz / 1130.0).rgb, 0.35 + 0.4 * mac.b);
          #endif
          vec3 gnear = mix(texture2D(tGrass, vW.xz / 34.0).rgb, texture2D(tGrass, rxz / 53.0).rgb, smoothstep(0.35, 0.65, texture2D(uNoise, vW.xz / 190.0).r));
          vec3 grass = mix(gnear, gfar, kf * 0.9) * mix(vec3(0.42, 0.62, 0.3), vec3(0.8, 0.86, 0.5), mac.g) * (0.75 + 0.5 * mac2);
          #ifdef LOWQ
          vec3 rock = texture2D(tRock, vW.xz / mix(60.0, 700.0, kf)).rgb; vec3 cliff = rock * 0.8;
          #else
          vec3 rock = two(tRock, vW.xz, 60.0, 700.0, kf * 0.7); vec3 cliff = texture2D(tCliff, vec2(vW.x + vW.z, vW.y) / 90.0).rgb * 0.8;
          #endif
          vec3 col = grass;
          // farmland patchwork
          vec2 fp = vW.xz * mat2(0.94, -0.34, 0.34, 0.94); vec2 fc = fp / vec2(310.0, 190.0); vec2 fid = floor(fc); float fh = h21(fid); vec2 fe = abs(fract(fc) - 0.5);
          vec3 crop = fh < 0.3 ? vec3(0.62, 0.55, 0.26) : fh < 0.55 ? vec3(0.3, 0.42, 0.14) : fh < 0.78 ? vec3(0.42, 0.5, 0.2) : vec3(0.4, 0.3, 0.2);
          vec3 fur = texture2D(tFarm, (fh > 0.5 ? fp.xy : fp.yx) / mix(22.0, 160.0, kf)).rgb;
          vec3 farm = crop * (0.35 + fur * 0.9) * (0.8 + 0.4 * mac2); farm = mix(farm, vec3(0.1, 0.16, 0.07), smoothstep(0.465, 0.49, max(fe.x, fe.y)));
          col = mix(col, farm, sp.g);
          // forest floor / canopy tint
          vec3 fo = texture2D(tForest, vW.xz / 28.0).rgb * vec3(0.5, 0.62, 0.35); float can = texture2D(tRock, rxz / 150.0).g * 1.4 + texture2D(uNoise, vW.xz / 260.0).b * 0.8; fo = mix(fo, vec3(0.05, 0.1, 0.03) * (0.35 + can), kf * 0.9);
          col = mix(col, fo, smoothstep(0.25, 0.6, sp.r + (mac2 - 0.5) * 0.3));
          // beach, rock, snow
          vec3 sand = two(tSand, vW.xz, 40.0, 380.0, kf) * vec3(1.1, 1.0, 0.82);
          col = mix(sand, col, smoothstep(2.0, 9.0, vW.y + mac2 * 4.0));
          float rk = smoothstep(0.16, 0.34, slope + (mac2 - 0.5) * 0.08) ; rk = max(rk, smoothstep(1500.0, 2100.0, h));
          col = mix(col, mix(rock, cliff, smoothstep(0.38, 0.6, slope)), rk);
          float sn = smoothstep(1750.0, 2150.0, h + mac.b * 300.0) * (1.0 - smoothstep(0.45, 0.75, slope));
          col = mix(col, vec3(0.86, 0.89, 0.93) * (0.82 + 0.25 * mac2) * (0.9 + 0.2 * texture2D(tSnow, vW.xz / 60.0).g), sn);
          vec2 rg = abs(fract(vW.xz / 46.0) - 0.5); float road = smoothstep(0.42, 0.46, max(rg.x, rg.y)); float urb = smoothstep(0.35, 0.8, sp.b + (mac2 - 0.5) * 0.5) * (1.0 - sn);
          col = mix(col, mix(col * 0.75 + vec3(0.06, 0.07, 0.04), vec3(0.11, 0.11, 0.115), road), urb * 0.8); // urban ground + street grid
          // seabed
          col = mix(col, vec3(0.2, 0.3, 0.26) * col * 3.0, smoothstep(0.0, -4.0, vW.y));
          // detail normal near the camera
          #ifndef LOWQ
          vec3 dn = texture2D(tDetailN, vW.xz / 34.0).xyz * 2.0 - 1.0; n = normalize(n + vec3(dn.x, 0.0, dn.y) * 0.45 * (1.0 - smoothstep(60.0, 900.0, dist)));
          #endif
          float ndl = max(dot(n, uSunDir), 0.0);
          vec3 lit = col * (sunLight(ndl) * cloudShadow(vW) + hemi(n));
          gl_FragColor = vec4(applyFog(lit, vW, cameraPosition), 1.0);
          #include <tonemapping_fragment>
          #include <colorspace_fragment>
        }` });

    // shared index buffers per LOD (5 levels), with skirts
    const VS = CH + 1, nv = VS * VS; const idxLOD = [];
    for (let l = 0; l < 5; l++) { const s = 1 << l, a = []; for (let j = 0; j < CH; j += s) for (let i = 0; i < CH; i += s) { const p = j * VS + i; a.push(p, p + s * VS, p + s, p + s, p + s * VS, p + s * VS + s); }
      // skirts: vertices nv.. arranged as 4 edges of VS each
      for (let e = 0; e < 4; e++) for (let i = 0; i < CH; i += s) { const edge = t => e === 0 ? t : e === 1 ? CH * VS + t : e === 2 ? t * VS : t * VS + CH; const p0 = edge(i), p1 = edge(i + s), s0 = nv + e * VS + i, s1 = nv + e * VS + i + s; if (e === 0 || e === 3) a.push(p0, p1, s0, p1, s1, s0); else a.push(p0, s0, p1, p1, s0, s1); }
      idxLOD.push(new THREE.BufferAttribute(new Uint32Array(a), 1)); }
    this.chunks = []; const grp = new THREE.Group(); scene.add(grp);
    for (let cj = 0; cj < NCH; cj++) for (let ci = 0; ci < NCH; ci++) {
      const pos = new Float32Array((nv + 4 * VS) * 3); let mn = 1e9, mx = -1e9;
      for (let j = 0; j < VS; j++) for (let i = 0; i < VS; i++) { const gi = Math.min(ci * CH + i, N - 1), gj = Math.min(cj * CH + j, N - 1), h = H[gj * N + gi], p = (j * VS + i) * 3; pos[p] = (ci * CH + i) * CELL - HALF; pos[p + 1] = h; pos[p + 2] = (cj * CH + j) * CELL - HALF; mn = Math.min(mn, h); mx = Math.max(mx, h); }
      if (mx < -6) continue;
      for (let e = 0; e < 4; e++) for (let t = 0; t < VS; t++) { const src = (e === 0 ? t : e === 1 ? CH * VS + t : e === 2 ? t * VS : t * VS + CH) * 3, d = (nv + e * VS + t) * 3; pos[d] = pos[src]; pos[d + 1] = pos[src + 1] - 260; pos[d + 2] = pos[src + 2]; }
      const pa = new THREE.BufferAttribute(pos, 3); const cx = (ci + 0.5) * CH * CELL - HALF, cz = (cj + 0.5) * CH * CELL - HALF;
      const sphere = new THREE.Sphere(new THREE.Vector3(cx, (mn + mx) / 2, cz), Math.hypot(CH * CELL * 0.71, (mx - mn) / 2 + 130));
      const geos = idxLOD.map(ix => { const g = new THREE.BufferGeometry(); g.setAttribute('position', pa); g.setIndex(ix); g.boundingSphere = sphere; return g; });
      const mesh = new THREE.Mesh(geos[2], this.terrainMat); mesh.matrixAutoUpdate = false; grp.add(mesh); this.chunks.push({ mesh, geos, cx, cz, cy: (mn + mx) / 2, lod: 2 });
    }

    // ---------- ocean ----------
    this.waterMat = new THREE.ShaderMaterial({ uniforms: { ...atmo, uNormalTex: { value: this.normalTex }, uWaterN: { value: tex.waterN } }, fog: false,
      vertexShader: /* glsl */`varying vec3 vW; void main(){ vec4 w = modelMatrix * vec4(position, 1.0); vW = w.xyz; gl_Position = projectionMatrix * viewMatrix * w; }`,
      fragmentShader: ATMO_GLSL + /* glsl */`
        varying vec3 vW; uniform sampler2D uNormalTex, uWaterN;
        void main(){
          vec3 v = vW - cameraPosition; float dist = length(v); vec3 vd = v / dist;
          vec2 uv = (vW.xz + ${HALF.toFixed(1)}) / ${SIZE.toFixed(1)}; float inside = step(0.0, uv.x) * step(uv.x, 1.0) * step(0.0, uv.y) * step(uv.y, 1.0);
          float depth = mix(1.0, texture2D(uNormalTex, uv).a, inside);
          float t = uTime; float kd = 1.0 - smoothstep(300.0, 9000.0, dist);
          vec3 n1 = texture2D(uWaterN, vW.xz / 37.0 + vec2(t * 0.021, t * 0.013)).xyz * 2.0 - 1.0;
          vec3 n2 = texture2D(uWaterN, vW.xz / 113.0 - vec2(t * 0.011, -t * 0.017)).xyz * 2.0 - 1.0;
          vec3 n3 = texture2D(uWaterN, vW.xz / 911.0 + vec2(t * 0.004, t * 0.002)).xyz * 2.0 - 1.0;
          vec3 n = normalize(vec3((n1.x * kd + n2.x) * 0.22 + n3.x * 0.12, 1.0, (n1.y * kd + n2.y) * 0.22 + n3.y * 0.12));
          float fres = 0.02 + 0.98 * pow(1.0 - max(dot(-vd, n), 0.0), 5.0);
          vec3 r = reflect(vd, n); r.y = abs(r.y);
          vec3 refl = skyColor(r); float sd = max(dot(r, uSunDir), 0.0);
          refl += uSunCol * (pow(sd, 380.0) * 7.0 + pow(sd, 40.0) * 0.12);
          vec3 deep = vec3(0.004, 0.03, 0.07), shallow = vec3(0.02, 0.26, 0.26);
          vec3 body = mix(shallow, deep, smoothstep(0.0, 0.45, depth)) * (uSunCol * max(uSunDir.y, 0.0) * 0.3 + uSkyAmb * 1.0) * cloudShadow(vW);
          vec3 col = mix(body, refl, fres);
          float foam = smoothstep(0.035, 0.0, depth) * smoothstep(0.35, 0.75, texture2D(uNoise, vW.xz / 60.0 + vec2(t * 0.01, 0.0)).r + (0.035 - depth) * 8.0);
          col = mix(col, (uSunCol * max(uSunDir.y, 0.05) + uSkyAmb) * 0.75, foam * 0.8 * inside);
          gl_FragColor = vec4(applyFog(col, vW, cameraPosition), 1.0);
          #include <tonemapping_fragment>
          #include <colorspace_fragment>
        }` });
    const wg = new THREE.RingGeometry(0, 1, 48, 12); wg.rotateX(-Math.PI / 2); { const p = wg.attributes.position; for (let i = 0; i < p.count; i++) { const r = Math.hypot(p.getX(i), p.getZ(i)), s = Math.pow(r, 2.5) * 260000 / (r || 1); p.setX(i, p.getX(i) * s); p.setZ(i, p.getZ(i) * s); } }
    this.water = new THREE.Mesh(wg, this.waterMat); this.water.frustumCulled = false; scene.add(this.water);

    this.buildTrees(scene, tex); this.buildSites(scene, tex);
  }

  // ---------- trees ----------
  buildTrees(scene, tex) {
    const MAXT = 34000; this.maxTrees = MAXT;
    const g = new THREE.InstancedBufferGeometry();
    const q = [-0.5, 0, 0, 0.5, 0, 0, 0.5, 1, 0, -0.5, 1, 0, 0, 0, -0.5, 0, 0, 0.5, 0, 1, 0.5, 0, 1, -0.5];
    g.setAttribute('position', new THREE.Float32BufferAttribute(q, 3)); g.setAttribute('uv', new THREE.Float32BufferAttribute([0, 0, 1, 0, 1, 1, 0, 1, 0, 0, 1, 0, 1, 1, 0, 1], 2));
    g.setIndex([0, 1, 2, 0, 2, 3, 4, 5, 6, 4, 6, 7]);
    this.treeData = new Float32Array(MAXT * 4); this.treeData2 = new Float32Array(MAXT * 4);
    this.treeA = new THREE.InstancedBufferAttribute(this.treeData, 4); this.treeB = new THREE.InstancedBufferAttribute(this.treeData2, 4);
    this.treeA.setUsage(THREE.DynamicDrawUsage); this.treeB.setUsage(THREE.DynamicDrawUsage);
    g.setAttribute('iPos', this.treeA); g.setAttribute('iPar', this.treeB); g.instanceCount = 0;
    const mat = new THREE.ShaderMaterial({ uniforms: { ...atmo, tTrees: { value: tex.trees }, uRange: { value: 3600 } }, side: THREE.DoubleSide, fog: false,
      vertexShader: /* glsl */`attribute vec4 iPos, iPar; uniform float uRange; varying vec2 vUv; varying vec3 vW; varying float vTint, vFade;
        void main(){ float d = distance(iPos.xz, cameraPosition.xz); vFade = 1.0 - smoothstep(uRange * 0.8, uRange, d);
          float c = cos(iPar.z), s = sin(iPar.z); vec3 p = position; p.xz = mat2(c, -s, s, c) * p.xz;
          p = vec3(p.x * iPar.x, p.y * iPos.w * vFade, p.z * iPar.x) + iPos.xyz; vW = p; vTint = iPar.w;
          float cell = iPar.y; vUv = (uv + vec2(mod(cell, 2.0), 1.0 - floor(cell / 2.0))) * 0.5;
          gl_Position = projectionMatrix * viewMatrix * vec4(p, 1.0); }`,
      fragmentShader: ATMO_GLSL + /* glsl */`uniform sampler2D tTrees; varying vec2 vUv; varying vec3 vW; varying float vTint, vFade;
        void main(){ vec4 t = texture2D(tTrees, vUv); if (t.a < 0.42) discard;
          vec3 col = t.rgb * mix(vec3(0.72, 0.85, 0.6), vec3(1.05, 1.0, 0.85), vTint);
          float up = fract(vUv.y * 2.0);
          vec3 lit = col * 2.1 * (sunLight(0.35 + 0.55 * up) * cloudShadow(vW) + hemi(vec3(0.0, 1.0, 0.0)) * (0.55 + 0.6 * up));
          gl_FragColor = vec4(applyFog(lit, vW, cameraPosition), 1.0);
          #include <tonemapping_fragment>
          #include <colorspace_fragment>
        }` });
    this.trees = new THREE.Mesh(g, mat); this.trees.frustumCulled = false; scene.add(this.trees); this.treeCenter = new THREE.Vector2(1e9, 1e9); this.treeMat = mat;
  }
  updateTrees(cam) {
    const TC = 240, R = this.treeMat.uniforms.uRange.value;
    if (cam.y - this.ground(cam.x, cam.z) > 5200) { this.trees.visible = false; return; } this.trees.visible = true;
    const ccx = Math.round(cam.x / TC), ccz = Math.round(cam.z / TC); if (ccx === this.treeCenter.x && ccz === this.treeCenter.y) return; this.treeCenter.set(ccx, ccz);
    const A = this.treeData, B = this.treeData2, rc = Math.ceil(R / TC); let n = 0; const MAXT = this.maxTrees;
    for (let dz = -rc; dz <= rc && n < MAXT; dz++) for (let dx = -rc; dx <= rc && n < MAXT; dx++) {
      if (dx * dx + dz * dz > rc * rc) continue; const cx = ccx + dx, cz = ccz + dz; const f = this.forestAt(cx * TC, cz * TC); const near = dx * dx + dz * dz < (rc * 0.5) ** 2;
      const cnt = f > 0.08 ? Math.floor(f * (near ? 80 : 22) * (this.lodScale || 1)) : (hash2(cx, cz) < 0.25 ? 1 : 0);
      for (let t = 0; t < cnt && n < MAXT; t++) {
        const x = (cx + hash2(cx * 7 + t, cz * 13 - t) - 0.5) * TC, z = (cz + hash2(cx * 3 - t * 5, cz * 11 + t) - 0.5) * TC; const y = this.heightAt(x, z); if (y < 2.5 || y > 1750) continue;
        const r = hash2(cx * 31 + t * 17, cz * 57 + t), r2 = hash2(cx * 91 + t, cz * 23 + t * 3); const conifer = y > 650 + r * 400;
        const type = conifer ? 0 : r2 < 0.5 ? 1 : r2 < 0.78 ? 2 : 3; const hgt = conifer ? 24 + r * 12 : type === 1 ? 15 + r * 9 : 11 + r * 7; const wid = conifer ? hgt * 0.95 : hgt * 1.25;
        A[n * 4] = x; A[n * 4 + 1] = y - 0.4; A[n * 4 + 2] = z; A[n * 4 + 3] = hgt; B[n * 4] = wid; B[n * 4 + 1] = type; B[n * 4 + 2] = r * 3.14; B[n * 4 + 3] = r2; n++;
      }
    }
    this.trees.geometry.instanceCount = n; this.treeA.needsUpdate = true; this.treeB.needsUpdate = true; this.treeCount = n;
  }

  // ---------- towns & airbases ----------
  buildSites(scene, tex) {
    const std = (map, nor, rep, extra = {}) => { const m = new THREE.MeshStandardMaterial({ map, normalMap: nor, roughness: 0.9, metalness: 0, envMapIntensity: 0.2, ...extra }); return m; };
    const house = (() => { // unit house: walls 1x1x1 (y 0..1) + gable roof (y 1..1.45); groups: 0 walls, 1 roof
      const w = new THREE.BoxGeometry(1, 1, 1).translate(0, 0.5, 0); const uv = w.attributes.uv; for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * 2, uv.getY(i));
      const r = new THREE.BufferGeometry(); const P = [-0.55, 1, -0.55, 0.55, 1, -0.55, 0, 1.5, -0.55, -0.55, 1, 0.55, 0.55, 1, 0.55, 0, 1.5, 0.55];
      const tri = (a, b, c) => [a, b, c].flatMap(i => P.slice(i * 3, i * 3 + 3)); const pos = [...tri(0, 2, 1), ...tri(3, 4, 5), ...tri(0, 3, 5), ...tri(0, 5, 2), ...tri(1, 2, 5), ...tri(1, 5, 4)];
      r.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); const uvs = []; for (let i = 0; i < pos.length; i += 3) uvs.push(pos[i + 2] * 2, pos[i + 1] * 2 + pos[i]); r.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2)); r.computeVertexNormals();
      const wn = w.toNonIndexed(); const g = new THREE.BufferGeometry(); const cat = n => new THREE.Float32BufferAttribute([...wn.attributes[n].array, ...r.attributes[n].array], n === 'uv' ? 2 : 3);
      g.setAttribute('position', cat('position')); g.setAttribute('normal', cat('normal')); g.setAttribute('uv', cat('uv')); g.addGroup(0, 36, 0); g.addGroup(36, 18, 1); return g; })();
    const block = (() => { const g = new THREE.BoxGeometry(1, 1, 1).translate(0, 0.5, 0); const uv = g.attributes.uv; for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * 3, uv.getY(i) * 3); return g; })();
    const lists = { house: [], block: [], shed: [] }; const m4 = new THREE.Matrix4(), qq = new THREE.Quaternion(), ss = new THREE.Vector3(), pp = new THREE.Vector3(), up = new THREE.Vector3(0, 1, 0);
    this.bgrid = new Map(); const reg = (x, z, w, h, d, rot, y0) => { const b = { x, z, hw: w / 2, hd: d / 2, c: Math.cos(rot), s: -Math.sin(rot), top: y0 + h * 1.3 }, r = Math.hypot(w, d) / 2; for (let i = Math.floor((x - r) / 256); i <= Math.floor((x + r) / 256); i++) for (let j = Math.floor((z - r) / 256); j <= Math.floor((z + r) / 256); j++) { const k = ((i + 4096) << 13) | (j + 4096); if (!this.bgrid.has(k)) this.bgrid.set(k, []); this.bgrid.get(k).push(b); } };
    const add = (kind, x, z, w, h, d, rot, y) => { reg(x, z, w, h, d, rot, y ?? this.heightAt(x, z)); pp.set(x, y ?? this.heightAt(x, z) - 0.6, z); qq.setFromAxisAngle(up, rot); ss.set(w, h, d); lists[kind].push(m4.compose(pp, qq, ss).clone()); };
    this.towns.forEach((t, ti) => { const R = t.rx * CELL * 0.85, grid = 46; const ang = hash2(ti, 77) * 3.14;
      for (let gz = -R; gz < R; gz += grid) for (let gx = -R; gx < R; gx += grid) { const d = Math.hypot(gx, gz) / R; if (d > 1) continue; const hsh = hash2(Math.round(gx) + ti * 1000, Math.round(gz));
        if (hsh > 0.97 - d * 0.4 || Math.abs((gx / grid) % 5) < 0.5 || Math.abs((gz / grid) % 6) < 0.5) continue;
        const x = t.x + gx * Math.cos(ang) - gz * Math.sin(ang) + (hsh - 0.5) * 10, z = t.z + gx * Math.sin(ang) + gz * Math.cos(ang); const h2 = hash2(Math.round(gx) * 3, Math.round(gz) * 7 + ti);
        if (d < 0.28 && h2 < 0.6) add('block', x, z, 22 + h2 * 16, 14 + hsh * 60 * (1 - d * 2), 22 + hsh * 14, -ang);
        else if (h2 > 0.93) add('shed', x, z, 30, 9, 44, -ang + (h2 > 0.96 ? 1.57 : 0));
        else add('house', x, z, 10 + h2 * 6, 5 + hsh * 4, 12 + hsh * 8, -ang + (hsh > 0.4 ? 1.57 : 0)); } });
    // airbases
    const flat = new THREE.PlaneGeometry(1, 1).rotateX(-Math.PI / 2); this.runways = [];
    const rwMat = new THREE.MeshStandardMaterial({ map: tex.runway, roughness: 0.92, envMapIntensity: 0.2, polygonOffset: true, polygonOffsetFactor: -4, polygonOffsetUnits: -8 });
    const apMat = std(tex.concrete, tex.concreteN, 1, { polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -4 });
    this.bases.forEach((b, bi) => { const y = b.y + 0.02;
      const rw = new THREE.Mesh(flat, rwMat); rw.scale.set(46, 1, 2400); rw.position.set(b.x, y + 0.04, b.z); scene.add(rw);
      const ap = new THREE.Mesh(flat.clone(), apMat); { const uv = ap.geometry.attributes.uv; for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * 22, uv.getY(i) * 80); }
      ap.scale.set(220, 1, 800); ap.position.set(b.x + 190, y, b.z); scene.add(ap);
      const tw = new THREE.Mesh(flat.clone(), apMat); tw.scale.set(22, 1, 2400); tw.position.set(b.x + 70, y + 0.02, b.z); { const uv = tw.geometry.attributes.uv; for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * 2, uv.getY(i) * 240); } scene.add(tw);
      for (let k = 0; k < 5; k++) add('shed', b.x + 250, b.z - 300 + k * 110, 60, 16, 70, 0, b.y - 0.3);
      add('block', b.x + 150, b.z + 330, 14, 34, 14, 0, b.y); add('block', b.x + 150, b.z + 330, 22, 6, 22, 0, b.y + 33); add('block', b.x + 240, b.z + 380, 60, 12, 30, 0, b.y);
      this.runways.push({ x: b.x, z: b.z, y: b.y + 0.06, len: 2400 }); });
    const mats = { house: [std(tex.brick, tex.brickN), std(tex.roof, tex.roofN)], block: std(tex.facade, tex.facadeN), shed: [std(tex.iron, tex.ironN, 1, { metalness: 0.5, roughness: 0.6 }), std(tex.iron, tex.ironN, 1, { metalness: 0.5, roughness: 0.55 })] };
    this.buildings = [];
    for (const k of ['house', 'block', 'shed']) { if (!lists[k].length) continue; const im = new THREE.InstancedMesh(k === 'block' ? block : house, mats[k], lists[k].length); const c = new THREE.Color();
      lists[k].forEach((m, i) => { im.setMatrixAt(i, m); const v = (k === 'block' ? 1.5 : 0.9) + hash2(i, 5) * 0.5; c.setRGB(v, v * (0.92 + hash2(i, 9) * 0.1), v * (0.85 + hash2(i, 3) * 0.15)); im.setColorAt(i, c); });
      im.frustumCulled = false; scene.add(im); this.buildings.push(im); }
    this.buildingCount = lists.house.length + lists.block.length + lists.shed.length;
  }

  setQuality(q) { const low = q < 1; this.terrainMat.defines = low ? { LOWQ: 1 } : {}; this.terrainMat.needsUpdate = true; this.treeMat.uniforms.uRange.value = low ? 2600 : 3600; this.treeCenter.set(1e9, 1e9); this.lodScale = low ? 0.75 : 1; }
  update(cam, dt) {
    for (const c of this.chunks) { const d = Math.hypot(cam.x - c.cx, cam.z - c.cz, (cam.y - c.cy) * 0.6); const ds = d / (this.lodScale || 1); const l = ds < 6500 ? 0 : ds < 13000 ? 1 : ds < 26000 ? 2 : ds < 52000 ? 3 : 4; if (l !== c.lod) { c.lod = l; c.mesh.geometry = c.geos[l]; } }
    this.water.position.set(cam.x, 0, cam.z); this.updateTrees(cam);
  }
}

// ---------- procedural helper textures ----------
export function makeNoiseTexture() { // tiling RGB fbm noise used for macro variation, cloud shadows, cirrus
  const S = 256, d = new Uint8Array(S * S * 4); const tile = (x, y, o, f) => { let s = 0, a = 0.5, fr = f; for (let i = 0; i < o; i++) { const X = x * fr, Y = y * fr; const u = x, v = y; s += a * (noise(X, Y) * (1 - u) * (1 - v) + noise(X - fr, Y) * u * (1 - v) + noise(X, Y - fr) * (1 - u) * v + noise(X - fr, Y - fr) * u * v); a *= 0.5; fr *= 2; } return s; };
  for (let j = 0; j < S; j++) for (let i = 0; i < S; i++) { const x = i / S, y = j / S, k = (j * S + i) * 4; d[k] = 255 * Math.min(1, Math.max(0, 0.5 + tile(x, y, 5, 4) * 1.1)); d[k + 1] = 255 * Math.min(1, Math.max(0, 0.5 + tile(x + 0.37, y + 0.11, 5, 6) * 1.1)); d[k + 2] = 255 * Math.min(1, Math.max(0, 0.5 + tile(x + 0.71, y + 0.53, 4, 3) * 1.1)); d[k + 3] = 255; }
  const t = new THREE.DataTexture(d, S, S, THREE.RGBAFormat); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.magFilter = THREE.LinearFilter; t.minFilter = THREE.LinearMipmapLinearFilter; t.generateMipmaps = true; t.needsUpdate = true; return t;
}
export function makeWaterNormal() {
  const S = 256, hgt = new Float32Array(S * S), d = new Uint8Array(S * S * 4);
  for (let j = 0; j < S; j++) for (let i = 0; i < S; i++) { let h = 0; for (let w = 0; w < 14; w++) { const a = hash2(w, 1) * 6.283, kx = Math.round(Math.cos(a) * (2 + w * 1.3)), ky = Math.round(Math.sin(a) * (2 + w * 1.3)); h += Math.sin((i * kx + j * ky) / S * 6.283 + hash2(w, 2) * 6.283) / (1.5 + w * 0.6); } hgt[j * S + i] = h; }
  for (let j = 0; j < S; j++) for (let i = 0; i < S; i++) { const dx = hgt[j * S + (i + 1) % S] - hgt[j * S + (i + S - 1) % S], dy = hgt[((j + 1) % S) * S + i] - hgt[((j + S - 1) % S) * S + i]; const k = (j * S + i) * 4; const l = 1 / Math.hypot(dx * 2, dy * 2, 1); d[k] = (dx * 2 * l * 0.5 + 0.5) * 255; d[k + 1] = (dy * 2 * l * 0.5 + 0.5) * 255; d[k + 2] = (l * 0.5 + 0.5) * 255; d[k + 3] = 255; }
  const t = new THREE.DataTexture(d, S, S, THREE.RGBAFormat); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.magFilter = THREE.LinearFilter; t.minFilter = THREE.LinearMipmapLinearFilter; t.generateMipmaps = true; t.needsUpdate = true; return t;
}
export function makeRunwayTexture() {
  const c = document.createElement('canvas'); c.width = 128; c.height = 4096; const g = c.getContext('2d');
  g.fillStyle = '#2b2c2e'; g.fillRect(0, 0, 128, 4096); for (let i = 0; i < 9000; i++) { const v = 30 + Math.random() * 30; g.fillStyle = `rgba(${v},${v},${v + 2},0.5)`; g.fillRect(Math.random() * 128, Math.random() * 4096, 1 + Math.random() * 2, 2 + Math.random() * 14); }
  g.fillStyle = 'rgba(12,12,12,0.55)'; for (const y of [300, 3796]) for (let i = 0; i < 60; i++) g.fillRect(40 + Math.random() * 48, y - 200 + Math.random() * 500, 2, 40 + Math.random() * 120); // rubber
  g.fillStyle = '#d8d8d2'; for (let y = 170; y < 3930; y += 86) g.fillRect(62, y, 4, 44); g.fillRect(4, 0, 2, 4096); g.fillRect(122, 0, 2, 4096);
  for (const y0 of [20, 4010]) for (let x = 12; x < 116; x += 12) g.fillRect(x, y0, 6, 66);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t;
}
