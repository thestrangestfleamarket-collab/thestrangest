// Procedural PBR-ish textures (albedo + normal) generated on canvases at load.
import * as THREE from 'three';
import { fbm, noise2, mulberry32 } from './util.js';

function make(size, fn, { normalStrength = 2, repeat = 1 } = {}) {
  const c = document.createElement('canvas'); c.width = c.height = size;
  const ctx = c.getContext('2d');
  const img = ctx.createImageData(size, size);
  const H = new Float32Array(size * size);
  const out = [0, 0, 0, 0];
  for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
    fn(x / size, y / size, out, x, y);
    const i = (y * size + x) * 4;
    img.data[i] = out[0] * 255; img.data[i + 1] = out[1] * 255; img.data[i + 2] = out[2] * 255; img.data[i + 3] = 255;
    H[y * size + x] = out[3];
  }
  ctx.putImageData(img, 0, 0);
  const nc = document.createElement('canvas'); nc.width = nc.height = size;
  const nctx = nc.getContext('2d');
  const nimg = nctx.createImageData(size, size);
  const at = (x, y) => H[((y + size) % size) * size + ((x + size) % size)];
  for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
    const dx = (at(x + 1, y) - at(x - 1, y)) * normalStrength;
    const dy = (at(x, y + 1) - at(x, y - 1)) * normalStrength;
    const l = 1 / Math.hypot(dx, dy, 1);
    const i = (y * size + x) * 4;
    nimg.data[i] = (-dx * l * 0.5 + 0.5) * 255; nimg.data[i + 1] = (dy * l * 0.5 + 0.5) * 255;
    nimg.data[i + 2] = (l * 0.5 + 0.5) * 255; nimg.data[i + 3] = 255;
  }
  nctx.putImageData(nimg, 0, 0);
  const map = new THREE.CanvasTexture(c); map.colorSpace = THREE.SRGBColorSpace;
  const normalMap = new THREE.CanvasTexture(nc);
  for (const t of [map, normalMap]) {
    t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(repeat, repeat); t.anisotropy = 8;
  }
  return { map, normalMap };
}

export function createTextures() {
  const rnd = mulberry32(7);
  const grain = new Float32Array(512 * 512); for (let i = 0; i < grain.length; i++) grain[i] = rnd();

  // Putting felt: short fibres, faint blotches. Near-white so material.color tints it.
  const felt = make(512, (u, v, o, x, y) => {
    const g = grain[y * 512 + x];
    const blot = fbm(u * 6, v * 6, 4, 6);
    const fib = noise2(u * 180, v * 60, 180) * 0.5 + noise2(u * 60, v * 180, 60) * 0.5;
    const l = 0.74 + blot * 0.2 + (g - 0.5) * 0.16 + (fib - 0.5) * 0.1;
    o[0] = l; o[1] = l; o[2] = l; o[3] = g * 0.55 + fib * 0.45;
  }, { normalStrength: 1.6 });

  // Weathered timber planks (grain runs along U).
  const wood = make(512, (u, v, o, x, y) => {
    const plank = Math.floor(v * 4);
    const pv = v * 4 - plank;
    const off = plank * 13.7;
    const g1 = fbm(u * 3 + off, v * 70 + off, 4);
    const ring = Math.sin((g1 * 9 + u * 2 + fbm(u * 2 + off, v * 8, 2) * 4) * 6.283) * 0.5 + 0.5;
    const tone = 0.72 + (noise2(plank * 3.1, 2.2) - 0.5) * 0.3;
    const gap = Math.min(pv, 1 - pv) < 0.035 ? 0.35 : 1;
    const l = (0.62 + ring * 0.2 + (grain[y * 512 + x] - 0.5) * 0.08) * tone * gap;
    o[0] = l * 1.0; o[1] = l * 0.82; o[2] = l * 0.62; o[3] = ring * 0.5 + (gap < 1 ? -1.2 : 0.4);
  }, { normalStrength: 2.2 });

  // Rough stone / concrete.
  const stone = make(512, (u, v, o, x, y) => {
    const a = fbm(u * 5, v * 5, 5, 5);
    const crack = Math.abs(fbm(u * 3 + 9, v * 3 + 4, 4, 3) - 0.5);
    const ck = crack < 0.012 ? 0.55 : 1;
    const sp = grain[y * 512 + x];
    const l = (0.55 + a * 0.4 + (sp - 0.5) * 0.18) * ck;
    o[0] = l; o[1] = l * 0.98; o[2] = l * 0.95; o[3] = a + (ck < 1 ? -0.6 : 0) + sp * 0.25;
  }, { normalStrength: 3 });

  // Sand with wind ripples.
  const sand = make(512, (u, v, o, x, y) => {
    const warp = fbm(u * 4, v * 4, 3, 4);
    const rip = Math.sin((v * 22 + warp * 2.2) * 6.283) * 0.5 + 0.5;
    const sp = grain[y * 512 + x];
    const l = 0.8 + rip * 0.1 + (sp - 0.5) * 0.2;
    o[0] = l; o[1] = l * 0.95; o[2] = l * 0.86; o[3] = rip * 0.7 + sp * 0.5;
  }, { normalStrength: 2 });

  // Ice: smooth with scratches.
  const ice = make(256, (u, v, o) => {
    const a = fbm(u * 4, v * 4, 4, 4);
    const s = Math.abs(noise2(u * 40 + a * 6, v * 3, 40) - 0.5) < 0.02 ? 1 : 0;
    const l = 0.82 + a * 0.14 + s * 0.08;
    o[0] = l * 0.93; o[1] = l * 0.98; o[2] = l; o[3] = a * 0.3 - s * 0.3;
  }, { normalStrength: 1 });

  return { felt, wood, stone, sand, ice };
}

// Soft radial glow sprite texture.
export function glowTexture() {
  const c = document.createElement('canvas'); c.width = c.height = 64;
  const g = c.getContext('2d');
  const grd = g.createRadialGradient(32, 32, 0, 32, 32, 32);
  grd.addColorStop(0, 'rgba(255,255,255,1)'); grd.addColorStop(0.25, 'rgba(255,255,255,0.55)');
  grd.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = grd; g.fillRect(0, 0, 64, 64);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
}
