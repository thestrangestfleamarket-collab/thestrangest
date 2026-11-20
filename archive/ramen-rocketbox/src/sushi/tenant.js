// a tenant of THE MARKET at the cart, as themselves: one of the street's bodies (rb.js) in the colours they really wear and at their own height, their name over them (live.js): their figure, sent once by their market page (146bg), is read for those, and what they hold (a guitar) is drawn where their hands have it, its place sent ten times a second; the body itself walks, stands, sits and eats as the cart's people do
import * as THREE from 'three';
import { makePerson, avatarsReady } from './avatars.js';
import { bodyInfo, VISITORS } from './rb.js';

const dec = (s, T) => { const b = atob(s), u = new Uint8Array(b.length); for (let i = 0; i < b.length; i++) u[i] = b.charCodeAt(i); return new T(u.buffer); };
const _c = new THREE.Color(), _h = {};
// the colours they wear: the two commonest that are neither skin nor hair (by how many points carry them)
export function wornColours(c) {
  const n = new Map(); for (let i = 0; i < c.length; i += 3) { _c.setRGB(c[i] / 255, c[i + 1] / 255, c[i + 2] / 255, THREE.SRGBColorSpace); _c.getHSL(_h); const skin = _h.h > 0.015 && _h.h < 0.12 && _h.s > 0.2 && _h.s < 0.8 && _h.l > 0.15 && _h.l < 0.8; if (skin || _h.l < 0.05) continue;
    const k = ((c[i] >> 4) << 8) | ((c[i + 1] >> 4) << 4) | (c[i + 2] >> 4); n.set(k, (n.get(k) || 0) + 1); }
  const top = [...n.entries()].sort((a, b) => b[1] - a[1]).map(([k]) => [((k >> 8) & 15) * 17, ((k >> 4) & 15) * 17, (k & 15) * 17]);
  const a = top[0] || [58, 74, 106], b = top.find((x) => Math.abs(x[0] - a[0]) + Math.abs(x[1] - a[1]) + Math.abs(x[2] - a[2]) > 90) || a.map((v) => v * 0.55); return [a, b];
}
// the body's own pictures with its clothes in their colours: what it wears above the waist the first, below it the second (the cloth's folds kept by shade; skin, hair and shoes left); where each is in the picture comes with the body (rb.js wear)
const dyed = (key, [a, b]) => { const info = bodyInfo(key), img = info && info.tex.image, wear = info && info.wear; if (!img || !wear) return null; const W = img.width, cv = document.createElement('canvas'); cv.width = cv.height = W; const g = cv.getContext('2d'); g.drawImage(img, 0, 0);
  const q = W / 1024, bw = Math.round(1024 * q), bh = Math.round(512 * q), d = g.getImageData(0, 0, bw, bh), p = d.data, N = wear.n, pad = 8 * q, sum = [0, 0, 0], cnt = [0, 0, 0];
  const at = (x, y) => wear.m[Math.min(N - 1, Math.max(0, ((y - pad) / (bh - 2 * pad) * N) | 0)) * N + Math.min(N - 1, Math.max(0, ((x - pad) / (bw - 2 * pad) * N) | 0))];
  const skin = (i) => { const r = p[i], gg = p[i + 1], bb = p[i + 2]; return r > gg && gg > bb && r - bb > 28 && r > 110 && r - bb < 120; };
  for (let y = 0; y < bh; y++) for (let x = 0; x < bw; x++) { const k = at(x, y); if (k === 1 || k === 2) { const i = (y * bw + x) * 4; if (skin(i)) continue; sum[k] += p[i] + p[i + 1] + p[i + 2]; cnt[k]++; } }
  const mean = [1, sum[1] / Math.max(1, cnt[1]) || 1, sum[2] / Math.max(1, cnt[2]) || 1], col = [null, a, b];
  for (let y = 0; y < bh; y++) for (let x = 0; x < bw; x++) { const k = at(x, y); if (k !== 1 && k !== 2) continue; const i = (y * bw + x) * 4; if (skin(i)) continue; const l = Math.min(1.7, (p[i] + p[i + 1] + p[i + 2]) / mean[k]), c = col[k]; p[i] = Math.min(255, c[0] * l); p[i + 1] = Math.min(255, c[1] * l); p[i + 2] = Math.min(255, c[2] * l); }
  g.putImageData(d, 0, 0); const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 2; return t; };
const hash = (s) => { let h = 7; for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0; return h; };

// D: {kind 'w' | 'b', np matrices, n points, lo, hi, s scale to metres, p points, c colours, b piece or bones, i index, x held things [{n, lo, hi, p, c, i}]}; mirror: -1 when the market's alley runs the other way round; who: their name or id (which body they come as)
export function tenantFigure(D, mirror = 1, who = '') {
  const n = D.n, q = dec(D.p, Uint16Array), P = new Float32Array(n * 3); for (let i = 0; i < n * 3; i++) { const a = i % 3; P[i] = D.lo[a] + (q[i] / 65535) * (D.hi[a] - D.lo[a]); }
  const B = dec(D.b, Uint8Array), cols = wornColours(dec(D.c, Uint8Array)), np = Math.max(1, D.np | 0), M = Array.from({ length: np }, () => new THREE.Matrix4());
  const root = new THREE.Group(), inner = new THREE.Group(); inner.scale.set(D.s[0] * mirror, D.s[1], D.s[2]); root.add(inner);
  const held = (Array.isArray(D.x) ? D.x : []).slice(0, 8).map((x) => { const q = dec(x.p, Uint16Array), P = new Float32Array(x.n * 3); for (let i = 0; i < x.n * 3; i++) { const a = i % 3; P[i] = x.lo[a] + (q[i] / 65535) * (x.hi[a] - x.lo[a]); }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(P, 3)); g.setAttribute('color', new THREE.BufferAttribute(dec(x.c, Uint8Array), 3, true)); if (x.i) g.setIndex(new THREE.BufferAttribute(dec(x.i, Uint16Array), 1)); g.computeVertexNormals();
    const m = new THREE.Mesh(g, new THREE.MeshLambertMaterial({ vertexColors: true, side: THREE.DoubleSide })); m.matrixAutoUpdate = false; m.visible = false; m.castShadow = true; m.userData.nopick = true; m.frustumCulled = false; inner.add(m); return { m, cur: new THREE.Matrix4(), want: new THREE.Matrix4(), on: false }; });
  // how tall they stand: their points as their rig first poses them (12 numbers a bone)
  const tall = (m) => { for (let i = 0; i < np && i * 12 + 11 < m.length; i++) { const k = i * 12; M[i].set(+m[k], +m[k + 3], +m[k + 6], +m[k + 9], +m[k + 1], +m[k + 4], +m[k + 7], +m[k + 10], +m[k + 2], +m[k + 5], +m[k + 8], +m[k + 11], 0, 0, 0, 1); }
    let lo = 1e9, hi = -1e9; const v = new THREE.Vector3(), u = new THREE.Vector3(); for (let j = 0; j < n; j += 3) { v.set(P[j * 3], P[j * 3 + 1], P[j * 3 + 2]); if (D.kind === 'w') v.applyMatrix4(M[Math.min(np - 1, B[j])]); else { const w = B[j * 3 + 2] / 255; u.copy(v).applyMatrix4(M[Math.min(np - 1, B[j * 3 + 1])]).multiplyScalar(1 - w); v.applyMatrix4(M[Math.min(np - 1, B[j * 3])]).multiplyScalar(w).add(u); } lo = Math.min(lo, v.y); hi = Math.max(hi, v.y); }
    return (hi - lo) * D.s[1]; };
  const key = VISITORS[hash(String(who) + (D.n | 0)) % VISITORS.length];
  let got = false, me = null, height = 0, map = null; const sticks = null;
  const make = () => { if (me || !avatarsReady()) return; const info = bodyInfo(key); if (!info) return; map ||= dyed(key, cols); const sc = height > 0.5 ? THREE.MathUtils.clamp(height / info.height, 0.8, 1.2) : 1;
    me = makePerson(0, key, { map, scale: sc }); me.root.traverse((o) => { o.userData.nopick = true; if (o.isMesh) o.castShadow = true; }); root.add(me.root); };
  return { root, key: '', body: key, colours: cols, get person() { return me; },
    // the bones as their market page posed them: their held things follow; the first standing pose gives their height
    pose(m, x) { if (!Array.isArray(m)) return; if (!got) { got = true; try { height = tall(m); } catch (e) { height = 0; } make(); }
      for (let j = 0; j < held.length; j++) { const H = held[j], a = Array.isArray(x) ? x[j] : null; if (!Array.isArray(a) || a.length < 12) { H.on = H.m.visible = false; continue; } H.want.set(+a[0], +a[3], +a[6], +a[9], +a[1], +a[4], +a[7], +a[10], +a[2], +a[5], +a[8], +a[11], 0, 0, 0, 1); if (!H.on) { H.on = true; H.cur.copy(H.want); H.m.matrix.copy(H.want); H.m.visible = true; } } },
    // how they are (walk, stand, sit, eat), as fast as they go, looking at what they look at
    update(dt, how = 'stand', speed = 1.3, look = null) { if (!got) return; make(); if (me) { me.pose = how; me.speed = Math.max(0.6, speed); me.look = look; me.update(dt); }
      const k = Math.min(1, dt * 12); for (const H of held) if (H.on) { const a = H.cur.elements, b = H.want.elements; for (let j = 0; j < 16; j++) a[j] += (b[j] - a[j]) * k; H.m.matrix.copy(H.cur); H.m.matrixWorldNeedsUpdate = true; } },
    held: () => held.filter((H) => H.on).length,
    posed: () => got, height: () => height, sticks,
    dispose() { root.removeFromParent(); if (map) map.dispose(); if (me) me.root.traverse((o) => { if (o.isMesh && o.material && o.material.map === map) o.material.dispose(); }); for (const H of held) { H.m.geometry.dispose(); H.m.material.dispose(); } } };
}
