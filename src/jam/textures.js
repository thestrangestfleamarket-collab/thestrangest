// STADIUM JAM's procedural PBR textures (colour + bump + roughness), generated once at load.
import * as THREE from 'three';

function hash(ix, iy, seed) {
  let h = Math.imul(ix, 374761393) ^ Math.imul(iy, 668265263) ^ Math.imul(seed, 1274126177);
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967295;
}
const mod = (a, n) => ((a % n) + n) % n;
function vnoise(x, y, wrapX, wrapY, seed) {
  const ix = Math.floor(x), iy = Math.floor(y);
  let fx = x - ix, fy = y - iy;
  fx = fx * fx * (3 - 2 * fx);
  fy = fy * fy * (3 - 2 * fy);
  const x0 = mod(ix, wrapX), x1 = mod(ix + 1, wrapX), y0 = mod(iy, wrapY), y1 = mod(iy + 1, wrapY);
  const a = hash(x0, y0, seed), b = hash(x1, y0, seed), c = hash(x0, y1, seed), d = hash(x1, y1, seed);
  return a + (b - a) * fx + (c - a) * fy + (a - b - c + d) * fx * fy;
}
// Tileable fractal noise over u,v in [0,1).
export function fbm(u, v, bx, by, oct, seed = 1) {
  let s = 0, a = 0.5, n = 0;
  for (let o = 0; o < oct; o++) {
    s += a * vnoise(u * bx, v * by, bx, by, seed + o * 31);
    n += a;
    a *= 0.5; bx *= 2; by *= 2;
  }
  return s / n;
}

function tex(canvas, srgb, repeat) {
  const t = new THREE.CanvasTexture(canvas);
  if (srgb) t.colorSpace = THREE.SRGBColorSpace;
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  if (repeat) t.repeat.set(repeat[0], repeat[1]);
  t.anisotropy = 8;
  return t;
}

// fn(u, v) -> [r, g, b, height, roughness], all 0..1 (rgb in sRGB)
export function pbr(size, fn, { repeat, bump = true } = {}) {
  const mk = () => { const c = document.createElement('canvas'); c.width = c.height = size; return c; };
  const cc = mk(), bc = mk(), rc = mk();
  const cg = cc.getContext('2d'), bg = bc.getContext('2d'), rg = rc.getContext('2d');
  const ci = cg.createImageData(size, size), bi = bg.createImageData(size, size), ri = rg.createImageData(size, size);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const o = fn((x + 0.5) / size, (y + 0.5) / size), i = (y * size + x) * 4;
      ci.data[i] = o[0] * 255; ci.data[i + 1] = o[1] * 255; ci.data[i + 2] = o[2] * 255; ci.data[i + 3] = 255;
      const h = o[3] * 255, r = o[4] * 255;
      bi.data[i] = bi.data[i + 1] = bi.data[i + 2] = h; bi.data[i + 3] = 255;
      ri.data[i] = ri.data[i + 1] = ri.data[i + 2] = r; ri.data[i + 3] = 255;
    }
  }
  cg.putImageData(ci, 0, 0);
  rg.putImageData(ri, 0, 0);
  const out = { map: tex(cc, true, repeat), roughnessMap: tex(rc, false, repeat) };
  if (bump) { bg.putImageData(bi, 0, 0); out.bumpMap = tex(bc, false, repeat); }
  return out;
}

export function makeTextures(low) {
  const S = low ? 256 : 1024, M = low ? 128 : 512, bump = !low;
  const T = {};

  // Painted plywood stage deck: 1.2 x 2.4 m sheets, scuffed where people walk.
  T.deck = pbr(S, (u, v) => {
    const row = Math.floor(v * 4), pu = (u * 2 + (row % 2) * 0.5) % 1, pv = (v * 4) % 1;
    const edge = Math.min(pu, 1 - pu) * 2.4, edge2 = Math.min(pv, 1 - pv) * 1.2;
    const seam = Math.min(edge, edge2) < 0.006 ? 1 : 0;
    const panel = hash(Math.floor(u * 2 + (row % 2) * 0.5), row, 7);
    const wear = fbm(u, v, 6, 6, 5, 3);
    const scuff = Math.max(0, fbm(u, v, 90, 14, 3, 11) - 0.62) * 2 + Math.max(0, fbm(u, v, 14, 90, 3, 19) - 0.64) * 2;
    const grain = fbm(u, v, 8, 160, 2, 5);
    const c = 0.075 + panel * 0.02 + wear * 0.045 + scuff * 0.06 - seam * 0.05;
    return [c, c, c * 1.04, 0.5 + grain * 0.12 - seam * 0.5 + scuff * 0.05, Math.min(1, 0.3 + wear * 0.4 + scuff * 0.25 + seam * 0.4)];
  }, { repeat: [5.4, 2.9], bump });

  // Poured concrete with stepped seating rows (v runs up the tier).
  T.tier = pbr(M, (u, v) => {
    const n = fbm(u, v, 8, 8, 5, 23), step = (v * 8) % 1;
    const riser = step < 0.3 ? 1 : 0, aisle = Math.abs(((u * 4) % 1) - 0.5) < 0.03 ? 1 : 0;
    const seat = !riser && !aisle && (u * 64) % 1 > 0.15 && step > 0.42 && step < 0.92 ? 1 : 0;
    const c = 0.2 + n * 0.14 - riser * 0.07 + aisle * 0.12;
    return seat ? [0.1, 0.16, 0.34, 0.9, 0.5] : [c, c, c * 1.03, riser ? 0.2 : 0.6 + n * 0.1, 0.9];
  }, { bump });

  T.concrete = pbr(M, (u, v) => {
    const n = fbm(u, v, 6, 6, 5, 41), stain = Math.max(0, fbm(u, v, 3, 12, 3, 43) - 0.5);
    const c = 0.17 + n * 0.13 - stain * 0.2;
    return [c, c, c * 1.02, n, 0.92];
  }, { bump });

  const wood = (r, g, b, seed) => pbr(M, (u, v) => {
    const grain = fbm(u, v, 3, 90, 4, seed), fig = fbm(u, v, 2, 6, 3, seed + 9);
    const k = 0.72 + grain * 0.4 + fig * 0.12;
    return [Math.min(1, r * k), Math.min(1, g * k), Math.min(1, b * k), grain, 0.38 + grain * 0.25];
  }, { bump });
  T.maple = wood(0.8, 0.62, 0.38, 51);
  T.rosewood = wood(0.2, 0.11, 0.07, 57);
  T.hickory = wood(0.86, 0.72, 0.5, 63);

  // Coated drum head with stick wear in the middle.
  T.head = pbr(M, (u, v) => {
    const r = Math.hypot(u - 0.5, v - 0.5) * 2, n = fbm(u, v, 64, 64, 2, 71);
    const wear = Math.max(0, 1 - r / 0.45) * (0.5 + fbm(u, v, 9, 9, 3, 73));
    const c = 0.9 - n * 0.06 - wear * 0.2;
    return [c, c * 0.985, c * 0.94, n, 0.78 - wear * 0.3];
  }, { bump });

  // Lathed cymbal bronze: v runs bell -> edge on the lathe profile.
  T.cymbal = pbr(M, (u, v) => {
    const rings = 0.5 + 0.5 * Math.sin(v * 330), hammer = fbm(u, v, 28, 10, 2, 81), patina = fbm(u, v, 5, 3, 4, 83);
    const k = 0.72 + rings * 0.16 + patina * 0.25;
    return [0.92 * k, 0.72 * k, 0.36 * k, rings * 0.6 + hammer * 0.4, 0.2 + rings * 0.14 + patina * 0.2];
  }, { bump });

  // Sparkle drum wrap / metallic paint flake (tinted by material.color).
  T.sparkle = pbr(M, (u, v) => {
    const f = hash(Math.floor(u * 512), Math.floor(v * 512), 91);
    const k = 0.78 + f * 0.22;
    return [k, k, k, f, 0.15 + f * 0.35];
  }, { repeat: [3, 1], bump });

  // Perforated steel speaker grille.
  T.grille = pbr(M, (u, v) => {
    const a = Math.sin(u * Math.PI * 48), b = Math.sin(v * Math.PI * 48);
    const hole = a * a * b * b > 0.3 ? 1 : 0;
    const c = hole ? 0.012 : 0.07;
    return [c, c, c, hole ? 0 : 1, hole ? 0.9 : 0.42];
  }, { bump });

  // Tolex-style textured vinyl for cabinets and road cases.
  T.tolex = pbr(M, (u, v) => {
    const n = fbm(u, v, 48, 48, 3, 101);
    const c = 0.035 + n * 0.03;
    return [c, c, c, n, 0.55 + n * 0.3];
  }, { bump });

  return T;
}

export function drawnTexture(w, h, draw) {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  draw(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  return t;
}
