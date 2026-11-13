// Procedural PBR texture + material library. Everything is generated at load time, no image assets.
import * as THREE from 'three';

const TAB = new Float32Array(65536);
{
  let s = 1337;
  for (let i = 0; i < 65536; i++) { s = (s * 1664525 + 1013904223) >>> 0; TAB[i] = s / 4294967296; }
}
const hash = (x, y, s = 0) => TAB[(x * 73 + y * 179 + s * 31 + x * y * 7) & 65535];

// tileable value noise; `per` is the lattice period
function vnoise(x, y, per, s) {
  const xi = Math.floor(x), yi = Math.floor(y);
  const fx = x - xi, fy = y - yi;
  const x0 = ((xi % per) + per) % per, x1 = (x0 + 1) % per;
  const y0 = ((yi % per) + per) % per, y1 = (y0 + 1) % per;
  const u = fx * fx * (3 - 2 * fx), v = fy * fy * (3 - 2 * fy);
  const a = hash(x0, y0, s), b = hash(x1, y0, s), c = hash(x0, y1, s), d = hash(x1, y1, s);
  return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
}
function fbm(u, v, freq, oct, s = 0) {
  let a = 0.5, sum = 0, f = freq;
  for (let i = 0; i < oct; i++) { sum += a * vnoise(u * f, v * f, f, s + i); a *= 0.5; f *= 2; }
  return sum / (1 - Math.pow(0.5, oct));
}
const clamp01 = (x) => (x < 0 ? 0 : x > 1 ? 1 : x);
const sstep = (a, b, x) => { const t = clamp01((x - a) / (b - a)); return t * t * (3 - 2 * t); };
const mix = (a, b, t) => a + (b - a) * t;

function tex(canvas, srgb, aniso) {
  const t = new THREE.CanvasTexture(canvas);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.colorSpace = srgb ? THREE.SRGBColorSpace : THREE.NoColorSpace;
  t.anisotropy = aniso;
  return t;
}

// fn(u, v, o) fills o.h (height 0..1), o.r/g/b (albedo 0..1), o.ro (roughness), o.me (metalness)
function gen(size, fn, bump, aniso) {
  const mk = () => { const c = document.createElement('canvas'); c.width = c.height = size; return c; };
  const cA = mk(), cN = mk(), cR = mk();
  const xA = cA.getContext('2d'), xN = cN.getContext('2d'), xR = cR.getContext('2d');
  const iA = xA.createImageData(size, size), iN = xN.createImageData(size, size), iR = xR.createImageData(size, size);
  const H = new Float32Array(size * size);
  const o = { h: 0, r: 0, g: 0, b: 0, ro: 0.8, me: 0 };
  for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
    o.h = 0.5; o.ro = 0.8; o.me = 0;
    fn(x / size, y / size, o);
    const i = y * size + x, j = i * 4;
    H[i] = o.h;
    iA.data[j] = clamp01(o.r) * 255; iA.data[j + 1] = clamp01(o.g) * 255; iA.data[j + 2] = clamp01(o.b) * 255; iA.data[j + 3] = 255;
    iR.data[j] = 255; iR.data[j + 1] = clamp01(o.ro) * 255; iR.data[j + 2] = clamp01(o.me) * 255; iR.data[j + 3] = 255;
  }
  const m = size - 1;
  for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
    const l = H[y * size + ((x - 1) & m)], r = H[y * size + ((x + 1) & m)];
    const d = H[((y - 1) & m) * size + x], u = H[((y + 1) & m) * size + x];
    let nx = (l - r) * bump, ny = (d - u) * bump, nz = 1;
    const k = 1 / Math.hypot(nx, ny, nz); nx *= k; ny *= k; nz *= k;
    const j = (y * size + x) * 4;
    iN.data[j] = (nx * 0.5 + 0.5) * 255; iN.data[j + 1] = (-ny * 0.5 + 0.5) * 255; iN.data[j + 2] = (nz * 0.5 + 0.5) * 255; iN.data[j + 3] = 255;
  }
  xA.putImageData(iA, 0, 0); xN.putImageData(iN, 0, 0); xR.putImageData(iR, 0, 0);
  const orm = tex(cR, false, aniso);
  return { map: tex(cA, true, aniso), normalMap: tex(cN, false, aniso), roughnessMap: orm, metalnessMap: orm };
}

const DEFS = {
  concrete: [6, (u, v, o) => {
    const n = fbm(u, v, 4, 5, 1), fine = fbm(u, v, 48, 3, 2), stain = fbm(u, v, 2, 4, 3);
    const su = Math.abs(((u * 2) % 1) - 0.5), sv = Math.abs(((v * 2) % 1) - 0.5);
    const seam = Math.min(sstep(0.492, 0.5, su) + sstep(0.492, 0.5, sv), 1);
    const hole = Math.hypot(((u * 4 + 0.5) % 1) - 0.5, ((v * 4 + 0.5) % 1) - 0.5) < 0.035 ? 1 : 0;
    const pit = fine > 0.72 ? (fine - 0.72) * 2 : 0;
    let c = 0.42 + n * 0.2 + fine * 0.08 - sstep(0.5, 0.75, stain) * 0.14;
    c -= seam * 0.12 + hole * 0.15 + pit * 0.3;
    o.r = c * 1.0; o.g = c * 0.98; o.b = c * 0.94;
    o.h = 0.5 + n * 0.2 + fine * 0.12 - seam * 0.25 - hole * 0.35 - pit;
    o.ro = 0.82 + fine * 0.15 - sstep(0.55, 0.8, stain) * 0.2;
  }],
  panel: [5, (u, v, o) => {
    const pu = (u * 2) % 1, pv = (v * 2) % 1;
    const eu = Math.min(pu, 1 - pu), ev = Math.min(pv, 1 - pv), e = Math.min(eu, ev);
    const seam = 1 - sstep(0.0, 0.02, e), bevel = sstep(0.02, 0.06, e);
    const rv = Math.hypot(Math.min(pu, 1 - pu) - 0.08, Math.min(pv, 1 - pv) - 0.08);
    const rivet = 1 - sstep(0.018, 0.028, rv);
    const brush = fbm(u * 0.25, v * 4, 16, 4, 7), grime = fbm(u, v, 3, 5, 8);
    const id = hash(Math.floor(u * 2), Math.floor(v * 2), 9);
    const scratch = sstep(0.78, 0.8, fbm(u * 0.15, v * 6, 24, 3, 10)) * 0.5;
    const dirt = sstep(0.5, 0.8, grime + (1 - sstep(0, 0.2, e)) * 0.25);
    let c = 0.3 + id * 0.08 + brush * 0.1 + scratch * 0.25;
    c = mix(c, 0.09, Math.max(seam, dirt * 0.6));
    o.r = c * 0.86; o.g = c * 0.93; o.b = c * 1.02;
    o.h = 0.4 + bevel * 0.35 - seam * 0.3 + rivet * 0.3 + brush * 0.04 - scratch * 0.08;
    o.ro = mix(0.32 + brush * 0.22, 0.9, dirt);
    o.me = 1 - dirt * 0.7;
  }],
  rust: [5, (u, v, o) => {
    const n = fbm(u, v, 5, 6, 20), f = fbm(u, v, 40, 3, 21);
    const rust = sstep(0.46, 0.6, n + f * 0.15);
    const streak = fbm(u * 6, v * 0.4, 8, 3, 22);
    const pr = 0.16 + f * 0.05, pg = 0.2 + f * 0.05, pb = 0.2 + f * 0.05;
    const k = 0.6 + f * 0.6;
    o.r = mix(pr, 0.42 * k, rust) - streak * 0.04; o.g = mix(pg, 0.19 * k, rust) - streak * 0.04; o.b = mix(pb, 0.07 * k, rust) - streak * 0.04;
    o.h = 0.5 + rust * (f * 0.4 - 0.05) + sstep(0.44, 0.48, n) * 0.08;
    o.ro = mix(0.42, 0.95, rust); o.me = mix(0.85, 0.1, rust);
  }],
  corrugated: [7, (u, v, o) => {
    const w = Math.cos(u * Math.PI * 2 * 12) * 0.5 + 0.5;
    const ridge = sstep(0.15, 0.85, w);
    const n = fbm(u, v, 4, 5, 30), f = fbm(u, v, 32, 3, 31);
    const drip = fbm(u * 8, v * 0.6, 8, 4, 32);
    const rust = sstep(0.62, 0.75, n * 0.7 + drip * 0.4 + sstep(0.85, 1, v) * 0.25);
    const c = 0.72 + f * 0.12 - (1 - ridge) * 0.12 - drip * 0.12;
    o.r = mix(c, 0.38, rust); o.g = mix(c, 0.2, rust); o.b = mix(c, 0.1, rust);
    o.h = ridge * 0.9 + f * 0.05;
    o.ro = mix(0.5, 0.95, rust) + f * 0.1; o.me = mix(0.5, 0, rust);
  }],
  asphalt: [4, (u, v, o) => {
    const g = fbm(u, v, 64, 3, 40), n = fbm(u, v, 3, 5, 41), mid = fbm(u, v, 12, 4, 42);
    const crack = 1 - sstep(0.0, 0.012, Math.abs(fbm(u, v, 5, 4, 43) - 0.5));
    const wet = sstep(0.5, 0.6, n);
    let c = 0.075 + g * 0.09 + mid * 0.04;
    c = mix(c, c * 0.45, wet) - crack * 0.05;
    o.r = c; o.g = c; o.b = c * 1.06;
    o.h = mix(0.45 + g * 0.3 + mid * 0.15, 0.4, wet) - crack * 0.3;
    o.ro = mix(0.88 + g * 0.1, 0.06, wet);
  }],
  brick: [6, (u, v, o) => {
    const rows = 12, cols = 5;
    const ry = v * rows, row = Math.floor(ry), fy = ry - row;
    const rx = u * cols + (row % 2) * 0.5, col = Math.floor(rx), fx = rx - col;
    const id = hash(((col % cols) + cols) % cols, row, 50);
    const n = fbm(u, v, 24, 4, 51), big = fbm(u, v, 3, 4, 52);
    const mx = Math.min(fx, 1 - fx) * (rows / cols) * 2.2, my = Math.min(fy, 1 - fy);
    const mortar = 1 - sstep(0.05, 0.11, Math.min(mx, my) + (n - 0.5) * 0.05);
    const soot = sstep(0.55, 0.85, big);
    const k = 0.75 + id * 0.5 + n * 0.25;
    o.r = mix(0.36 * k, 0.4, mortar) * (1 - soot * 0.55); o.g = mix(0.15 * k, 0.38, mortar) * (1 - soot * 0.55); o.b = mix(0.11 * k, 0.35, mortar) * (1 - soot * 0.5);
    o.h = mix(0.6 + n * 0.25 + id * 0.1, 0.25 + n * 0.1, mortar);
    o.ro = 0.9;
  }],
  plate: [4, (u, v, o) => {
    const pu = (u * 2) % 1, pv = (v * 2) % 1;
    const e = Math.min(Math.min(pu, 1 - pu), Math.min(pv, 1 - pv));
    const seam = 1 - sstep(0, 0.012, e);
    const k = 20, a = (u + v) * k, b = (u - v) * k;
    const ca = Math.floor(a), cb = Math.floor(b);
    const fa = a - ca - 0.5, fb = b - cb - 0.5;
    const flip = (ca + cb) & 1;
    const d = flip ? Math.hypot(fa * 3.2, fb) : Math.hypot(fa, fb * 3.2);
    const tread = 1 - sstep(0.3, 0.42, d);
    const n = fbm(u, v, 6, 5, 60), f = fbm(u, v, 48, 2, 61);
    const dirt = sstep(0.5, 0.75, n);
    let c = 0.24 + tread * 0.14 + f * 0.06;
    c = mix(c, 0.07, Math.max(seam, dirt * 0.7 * (1 - tread * 0.6)));
    o.r = c * 0.95; o.g = c; o.b = c * 1.05;
    o.h = 0.3 + tread * 0.5 - seam * 0.25 + f * 0.04;
    o.ro = mix(0.3 + f * 0.2, 0.85, dirt * (1 - tread * 0.5)); o.me = 1 - dirt * 0.6;
  }],
  wood: [5, (u, v, o) => {
    const planks = 4, pv = v * planks, pid = Math.floor(pv), fp = pv - pid;
    const gap = 1 - sstep(0, 0.035, Math.min(fp, 1 - fp));
    const off = hash(pid, 3, 70);
    const grain = fbm(u * 0.25 + off, v * 3, 16, 5, 71 + pid), ring = Math.sin((grain * 14 + u * 2) * 6.283) * 0.5 + 0.5;
    const f = fbm(u, v, 48, 2, 72);
    const k = 0.7 + off * 0.35 + ring * 0.18 + f * 0.1;
    o.r = 0.36 * k * (1 - gap * 0.8); o.g = 0.24 * k * (1 - gap * 0.8); o.b = 0.13 * k * (1 - gap * 0.8);
    o.h = 0.5 + ring * 0.12 + f * 0.08 - gap * 0.4;
    o.ro = 0.78 + ring * 0.12;
  }],
  plaster: [5, (u, v, o) => {
    const n = fbm(u, v, 3, 5, 80), f = fbm(u, v, 40, 3, 81), drip = fbm(u * 10, v * 0.5, 8, 4, 82);
    const crack = 1 - sstep(0, 0.008, Math.abs(fbm(u, v, 4, 4, 83) - 0.5));
    const peel = sstep(0.66, 0.7, fbm(u, v, 5, 4, 84));
    let c = 0.58 + f * 0.08 - sstep(0.45, 0.8, n) * 0.18 - drip * 0.12 * sstep(0.3, 1, v);
    o.r = mix(c, 0.46, peel) - crack * 0.25; o.g = mix(c * 0.97, 0.43, peel) - crack * 0.25; o.b = mix(c * 0.9, 0.4, peel) - crack * 0.25;
    o.h = 0.55 + f * 0.1 - peel * 0.2 - crack * 0.3;
    o.ro = 0.88;
  }],
};

export class Materials {
  constructor(renderer, size) {
    this.size = size; this.renderer = renderer;
    this.aniso = Math.min(8, renderer.capabilities.getMaxAnisotropy());
    this.sets = {};
    this.cache = {};
  }
  set(kind) {
    if (!this.sets[kind]) { const [bump, fn] = DEFS[kind]; this.sets[kind] = gen(this.size, fn, bump, this.aniso); }
    return this.sets[kind];
  }
  // textured world material; tint multiplies albedo
  get(kind, tint = 0xffffff, extra) {
    const key = kind + ':' + tint + (extra ? JSON.stringify(extra) : '');
    if (!this.cache[key]) {
      const s = this.set(kind);
      this.cache[key] = new THREE.MeshStandardMaterial({
        ...s, color: tint, roughness: 1, metalness: 1, normalScale: new THREE.Vector2(1, 1), envMapIntensity: 1, ...extra,
      });
    }
    return this.cache[key];
  }
  flat(color, rough = 0.6, metal = 0, extra) {
    const key = 'f' + color + ':' + rough + ':' + metal + (extra ? JSON.stringify(extra) : '');
    if (!this.cache[key]) this.cache[key] = new THREE.MeshStandardMaterial({ color, roughness: rough, metalness: metal, ...extra });
    return this.cache[key];
  }
  glow(color, intensity = 2) {
    const key = 'g' + color + ':' + intensity;
    if (!this.cache[key]) {
      const c = new THREE.Color(color).multiplyScalar(intensity);
      this.cache[key] = new THREE.MeshBasicMaterial({ color: c, fog: false });
    }
    return this.cache[key];
  }
}

// ---------- sprites / misc canvases ----------
export function radialTexture(stops, size = 128) {
  const c = document.createElement('canvas'); c.width = c.height = size;
  const x = c.getContext('2d');
  const g = x.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  for (const [p, col] of stops) g.addColorStop(p, col);
  x.fillStyle = g; x.fillRect(0, 0, size, size);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
}

export function smokeTexture(size = 128) {
  const c = document.createElement('canvas'); c.width = c.height = size;
  const x = c.getContext('2d'), img = x.createImageData(size, size);
  for (let j = 0; j < size; j++) for (let i = 0; i < size; i++) {
    const u = i / size, v = j / size, d = Math.hypot(u - 0.5, v - 0.5) * 2;
    const n = fbm(u, v, 4, 4, 90);
    const a = clamp01((1 - d) * 1.6) * sstep(0.25, 0.7, n + (1 - d) * 0.4);
    const k = (j * size + i) * 4, l = 200 + n * 55;
    img.data[k] = l; img.data[k + 1] = l; img.data[k + 2] = l; img.data[k + 3] = a * 255;
  }
  x.putImageData(img, 0, 0);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
}

export function flashTexture(size = 128) {
  const c = document.createElement('canvas'); c.width = c.height = size;
  const x = c.getContext('2d');
  x.translate(size / 2, size / 2);
  const g = x.createRadialGradient(0, 0, 0, 0, 0, size / 2);
  g.addColorStop(0, 'rgba(255,255,235,1)'); g.addColorStop(0.25, 'rgba(255,200,90,0.85)'); g.addColorStop(0.6, 'rgba(255,110,20,0.25)'); g.addColorStop(1, 'rgba(255,60,0,0)');
  x.fillStyle = g;
  x.beginPath();
  const spikes = 9;
  for (let i = 0; i <= spikes * 2; i++) {
    const a = (i / (spikes * 2)) * Math.PI * 2, r = (i % 2 ? 0.22 + hash(i, 1, 95) * 0.12 : 0.6 + hash(i, 2, 96) * 0.4) * size / 2;
    x.lineTo(Math.cos(a) * r, Math.sin(a) * r);
  }
  x.fill();
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
}

export function holeTexture(size = 64) {
  const c = document.createElement('canvas'); c.width = c.height = size;
  const x = c.getContext('2d'), img = x.createImageData(size, size);
  for (let j = 0; j < size; j++) for (let i = 0; i < size; i++) {
    const u = i / size - 0.5, v = j / size - 0.5, d = Math.hypot(u, v) * 2;
    const a = Math.atan2(v, u), wob = fbm((a / 6.283 + 0.5), 0.3, 8, 3, 97) * 0.25;
    const core = 1 - sstep(0.16, 0.24, d + wob * 0.2);
    const ring = (1 - sstep(0.3, 0.75 + wob, d)) * 0.6;
    const k = (j * size + i) * 4, al = Math.max(core, ring);
    const l = core > 0.5 ? 6 : 28;
    img.data[k] = l; img.data[k + 1] = l; img.data[k + 2] = l; img.data[k + 3] = al * 255;
  }
  x.putImageData(img, 0, 0);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
}

// equirect sky: returns canvas texture
export function skyTexture(kind) {
  const W = 2048, H = 1024;
  const c = document.createElement('canvas'); c.width = W; c.height = H;
  const x = c.getContext('2d');
  const g = x.createLinearGradient(0, 0, 0, H);
  const P = {
    night: [[0, '#01030a'], [0.42, '#081226'], [0.5, '#16233a'], [0.52, '#05070b'], [1, '#020203']],
    dusk: [[0, '#0b1024'], [0.3, '#3a2a48'], [0.44, '#b0502a'], [0.5, '#ffa040'], [0.52, '#1a120e'], [1, '#080605']],
    void: [[0, '#000205'], [0.5, '#020a12'], [1, '#000000']],
  }[kind];
  for (const [p, col] of P) g.addColorStop(p, col);
  x.fillStyle = g; x.fillRect(0, 0, W, H);
  if (kind !== 'dusk') {
    for (let i = 0; i < (kind === 'void' ? 1400 : 500); i++) {
      const sx = hash(i, 1, 100) * W, sy = hash(i, 2, 101) * H * (kind === 'void' ? 1 : 0.48), b = hash(i, 3, 102);
      x.fillStyle = `rgba(${200 + b * 55},${210 + b * 45},255,${0.25 + b * 0.75})`;
      x.fillRect(sx, sy, b > 0.92 ? 2.5 : 1.5, b > 0.92 ? 2.5 : 1.5);
    }
  }
  const blob = (px, py, r, col0, col1) => {
    const rg = x.createRadialGradient(px, py, 0, px, py, r);
    rg.addColorStop(0, col0); rg.addColorStop(1, col1);
    x.fillStyle = rg; x.fillRect(px - r, py - r, r * 2, r * 2);
  };
  if (kind === 'night') { blob(W * 0.62, H * 0.2, 180, 'rgba(170,200,255,0.5)', 'rgba(120,160,255,0)'); blob(W * 0.62, H * 0.2, 30, 'rgba(255,255,255,1)', 'rgba(235,240,255,0.9)'); }
  if (kind === 'dusk') {
    blob(W * 0.25, H * 0.47, 520, 'rgba(255,170,70,0.8)', 'rgba(255,90,20,0)'); blob(W * 0.25, H * 0.47, 44, 'rgba(255,250,220,1)', 'rgba(255,220,150,0.6)');
    for (let i = 0; i < 40; i++) { const cx = hash(i, 5, 110) * W, cy = H * (0.15 + hash(i, 6, 111) * 0.3); x.fillStyle = `rgba(30,18,30,${0.12 + hash(i, 7, 112) * 0.2})`; x.beginPath(); x.ellipse(cx, cy, 120 + hash(i, 8, 113) * 280, 12 + hash(i, 9, 114) * 28, 0, 0, 6.3); x.fill(); }
  }
  if (kind === 'void') { blob(W * 0.3, H * 0.4, 400, 'rgba(40,120,150,0.35)', 'rgba(0,40,60,0)'); blob(W * 0.75, H * 0.6, 320, 'rgba(120,40,30,0.25)', 'rgba(40,0,0,0)'); }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace; t.mapping = THREE.EquirectangularReflectionMapping;
  return t;
}
