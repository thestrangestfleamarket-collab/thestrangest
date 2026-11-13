// Halcyon Greens: small maths helpers (clamp, lerp, seeded random, value noise)
export const clamp = (x, a, b) => Math.min(b, Math.max(a, x));
export const lerp = (a, b, t) => a + (b - a) * t;
export const smoothstep = (a, b, x) => { const t = clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };

export function mulberry32(a) {
  return function () {
    a |= 0; a = a + 0x6D2B79F5 | 0;
    let t = Math.imul(a ^ a >>> 15, 1 | a);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

function hash(i, j) {
  let h = Math.imul(i | 0, 374761393) + Math.imul(j | 0, 668265263) | 0;
  h = Math.imul(h ^ h >>> 13, 1274126177);
  return ((h ^ h >>> 16) >>> 0) / 4294967296;
}

// Value noise; `period` (integer) makes it tile.
export function noise2(x, y, period = 0) {
  const xi = Math.floor(x), yi = Math.floor(y);
  const xf = x - xi, yf = y - yi;
  const u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf);
  const w = (n) => period ? ((n % period) + period) % period : n;
  const a = hash(w(xi), w(yi)), b = hash(w(xi + 1), w(yi));
  const c = hash(w(xi), w(yi + 1)), d = hash(w(xi + 1), w(yi + 1));
  return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
}

export function fbm(x, y, oct = 4, period = 0) {
  let s = 0, a = 0.5, n = 0;
  for (let i = 0; i < oct; i++) {
    s += a * noise2(x, y, period); n += a;
    x *= 2; y *= 2; period *= 2; a *= 0.5;
  }
  return s / n;
}
