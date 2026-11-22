// Textures and lighting generated in code: no downloaded image files.
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

function mulberry(seed) {
  let a = seed >>> 0;
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Tileable fractal noise in [0,1]. sx/sy stretch the pattern (wood grain uses a long sx).
function fbm(size, seed, octaves, basePeriod = 4, sx = 1, sy = 1) {
  const rand = mulberry(seed);
  const out = new Float32Array(size * size);
  let amp = 1, total = 0;
  for (let o = 0; o < octaves; o++) {
    const px = Math.max(1, Math.round(basePeriod * 2 ** o * sx)), py = Math.max(1, Math.round(basePeriod * 2 ** o * sy));
    const lattice = new Float32Array(px * py);
    for (let i = 0; i < lattice.length; i++) lattice[i] = rand();
    for (let y = 0; y < size; y++) {
      const fy = (y / size) * py, y0 = Math.floor(fy), ty = fy - y0, wy = ty * ty * (3 - 2 * ty);
      for (let x = 0; x < size; x++) {
        const fx = (x / size) * px, x0 = Math.floor(fx), tx = fx - x0, wx = tx * tx * (3 - 2 * tx);
        const a = lattice[(y0 % py) * px + (x0 % px)], b = lattice[(y0 % py) * px + ((x0 + 1) % px)];
        const c = lattice[((y0 + 1) % py) * px + (x0 % px)], d = lattice[((y0 + 1) % py) * px + ((x0 + 1) % px)];
        out[y * size + x] += amp * (a + (b - a) * wx + (c - a) * wy + (a - b - c + d) * wx * wy);
      }
    }
    total += amp;
    amp *= 0.5;
  }
  for (let i = 0; i < out.length; i++) out[i] /= total;
  return out;
}

function toTexture(size, fill, srgb) {
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext('2d');
  const img = ctx.createImageData(size, size);
  for (let i = 0; i < size * size; i++) {
    const [r, g, b] = fill(i);
    img.data[i * 4] = r; img.data[i * 4 + 1] = g; img.data[i * 4 + 2] = b; img.data[i * 4 + 3] = 255;
  }
  ctx.putImageData(img, 0, 0);
  const tex = new THREE.CanvasTexture(canvas);
  if (srgb) tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.anisotropy = 4;
  return tex;
}

function normalFromHeight(size, h, strength) {
  return toTexture(size, i => {
    const x = i % size, y = (i / size) | 0;
    const l = h[y * size + ((x + size - 1) % size)], r = h[y * size + ((x + 1) % size)];
    const u = h[((y + size - 1) % size) * size + x], d = h[((y + 1) % size) * size + x];
    let nx = (l - r) * strength, ny = (d - u) * strength, nz = 1;
    const n = Math.hypot(nx, ny, nz);
    return [(nx / n * 0.5 + 0.5) * 255, (ny / n * 0.5 + 0.5) * 255, (nz / n * 0.5 + 0.5) * 255];
  }, false);
}

// One hewn flagstone per texture: chiselled edges, mottled colour, pits.
export function makeStone(seed, size = 256) {
  const big = fbm(size, seed, 5, 3), fine = fbm(size, seed + 7, 3, 32), tint = fbm(size, seed + 13, 2, 2);
  const rand = mulberry(seed + 99);
  const h = new Float32Array(size * size);
  for (let i = 0; i < h.length; i++) {
    const x = (i % size) / size, y = ((i / size) | 0) / size;
    const edge = Math.min(x, y, 1 - x, 1 - y);
    const bevel = Math.min(1, edge / 0.07 + (big[i] - 0.5) * 0.5);
    h[i] = (0.55 * big[i] + 0.25 * fine[i]) * 0.6 + 0.4 * Math.max(0, bevel);
  }
  for (let p = 0; p < 26; p++) { // pits
    const cx = rand() * size, cy = rand() * size, r = 2 + rand() * 5;
    for (let y = -r | 0; y <= r; y++) for (let x = -r | 0; x <= r; x++) {
      const d = Math.hypot(x, y) / r;
      if (d < 1) h[((cy + y + size) % size | 0) * size + ((cx + x + size) % size | 0)] -= (1 - d) * 0.12;
    }
  }
  const map = toTexture(size, i => {
    const v = 70 + h[i] * 120 + (fine[i] - 0.5) * 30, w = (tint[i] - 0.5) * 26;
    return [v + w, v + w * 0.4, v - w];
  }, true);
  const roughnessMap = toTexture(size, i => { const r = 150 + (1 - h[i]) * 80 + (fine[i] - 0.5) * 40; return [0, Math.min(255, r), 0]; }, false);
  return { map, normalMap: normalFromHeight(size, h, 5), roughnessMap };
}

// Dark oak planks.
export function makeWood(seed, size = 512, planks = 4) {
  const grain = fbm(size, seed, 5, 2, 0.5, 8), rings = fbm(size, seed + 3, 3, 2, 1, 4), fine = fbm(size, seed + 5, 2, 64, 0.25, 1);
  const rand = mulberry(seed + 1);
  const shade = Array.from({ length: planks }, () => 0.8 + rand() * 0.35);
  const h = new Float32Array(size * size);
  const col = new Float32Array(size * size);
  for (let i = 0; i < h.length; i++) {
    const y = ((i / size) | 0) / size;
    const pv = y * planks, plank = Math.floor(pv), seam = Math.min(pv - plank, plank + 1 - pv);
    const ring = 0.5 + 0.5 * Math.sin((rings[i] * 9 + grain[i] * 22) * Math.PI);
    const gap = Math.min(1, seam / 0.035);
    col[i] = (0.55 + 0.3 * ring + (fine[i] - 0.5) * 0.3) * shade[plank] * (0.35 + 0.65 * gap);
    h[i] = 0.6 * gap + 0.25 * ring + 0.15 * fine[i];
  }
  const map = toTexture(size, i => [col[i] * 120, col[i] * 74, col[i] * 40], true);
  const roughnessMap = toTexture(size, i => [0, 130 + (1 - col[i]) * 90, 0], false);
  return { map, normalMap: normalFromHeight(size, h, 3), roughnessMap };
}

// Soft studio-style reflections for metal and stone, built from a tiny generated room.
export function makeEnvironment(renderer) {
  const pmrem = new THREE.PMREMGenerator(renderer);
  const env = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  pmrem.dispose();
  return env;
}

// Dim hall backdrop for the flat-screen view: warm glow low down fading to near-black.
export function makeBackdrop() {
  const canvas = document.createElement('canvas');
  canvas.width = 16; canvas.height = 256;
  const ctx = canvas.getContext('2d');
  const g = ctx.createLinearGradient(0, 0, 0, 256);
  g.addColorStop(0, '#06070a'); g.addColorStop(0.45, '#0d0f14'); g.addColorStop(0.62, '#2a1d14'); g.addColorStop(0.75, '#120e0b'); g.addColorStop(1, '#050505');
  ctx.fillStyle = g; ctx.fillRect(0, 0, 16, 256);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.mapping = THREE.EquirectangularReflectionMapping;
  return tex;
}
