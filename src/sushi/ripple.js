// live water (owner, 16 Nov 2026: "realistic physics ... liquids just like in market game. No fake things"): a liquid's surface in a round vessel as a height for every point of a small grid, stepped by the wave equation with damping, its edge reflecting; poked by what enters or moves in it, sloshed when its vessel is moved or tipped; its curvature is the light it throws on the bottom (caustics); it sleeps when still and far
import * as THREE from 'three';
import { G } from './ctx.js';

let DISC = null;
const disc = () => DISC || (DISC = (() => { const c = document.createElement('canvas'); c.width = c.height = 64; const g = c.getContext('2d'); g.fillStyle = '#000'; g.fillRect(0, 0, 64, 64); g.fillStyle = '#fff'; g.beginPath(); g.arc(32, 32, 31, 0, 7); g.fill(); const t = new THREE.CanvasTexture(c); return t; })());
const _w = new THREE.Vector3(), _c = new THREE.Vector3();

// r: the vessel's inner radius at the surface (m); o.n: cells across; o.speed: m/s the ripples travel; o.damp: kept per step; o.caustics: a texture of the light the surface focuses
export function makeWater(r, material, o = {}) {
  const N = o.n || 26, h0 = new Float32Array(N * N), h1 = new Float32Array(N * N), inside = new Uint8Array(N * N), d = (2 * r) / (N - 1);
  for (let j = 0; j < N; j++) for (let i = 0; i < N; i++) inside[j * N + i] = Math.hypot(i * d - r, j * d - r) <= r ? 1 : 0;
  const geo = new THREE.PlaneGeometry(2 * r, 2 * r, N - 1, N - 1); geo.rotateX(-Math.PI / 2);
  material.alphaMap = disc(); material.alphaTest = 0.5; material.transparent = material.transparent ?? false;
  const mesh = new THREE.Mesh(geo, material); mesh.castShadow = false; mesh.userData.nopick = true; mesh.userData.dyn = true;
  const W = { mesh, r, N, h: h0, p: h1, E: 0, acc: 0, awake: 2, steps: 0, speed: o.speed ?? 0.25, damp: o.damp ?? 0.992, peak: 0 };
  const ftx = o.caustics ? new THREE.DataTexture(new Uint8Array(N * N * 4).fill(128), N, N) : null; if (ftx) { ftx.magFilter = ftx.minFilter = THREE.LinearFilter; ftx.needsUpdate = true; W.caustics = ftx; }
  // a disturbance at (x, z) in the surface's own frame: a dip of a in metres, r wide
  W.poke = (x, z, a, rr = 0.02) => { const cx = (x + r) / d, cz = (z + r) / d, R = Math.ceil((2 * rr) / d) + 1, h = W.h;
    for (let j = Math.max(0, Math.floor(cz - R)); j <= Math.min(N - 1, Math.ceil(cz + R)); j++) for (let i = Math.max(0, Math.floor(cx - R)); i <= Math.min(N - 1, Math.ceil(cx + R)); i++) { const k = j * N + i; if (!inside[k]) continue; const d2 = ((i - cx) * d) ** 2 + ((j - cz) * d) ** 2; if (d2 < rr * rr * 4) h[k] -= a * Math.exp(-d2 / (rr * rr)); }
    W.awake = 3; };
  // the vessel moved or tipped: the liquid lags behind it, piling up on the side it was pushed from
  W.slosh = (ax, az) => { if (Math.abs(ax) + Math.abs(az) < 1e-5) return; const h = W.h; for (let j = 0; j < N; j++) for (let i = 0; i < N; i++) { const k = j * N + i; if (inside[k]) h[k] += ((i * d - r) * ax + (j * d - r) * az) * 0.02; } W.awake = 3; };
  // the height at a point (for what floats on it) and its slope
  W.at = (x, z) => { const i = Math.max(0, Math.min(N - 1, Math.round((x + r) / d))), j = Math.max(0, Math.min(N - 1, Math.round((z + r) / d))); return W.h[j * N + i]; };
  W.slope = (x, z, out) => { const i = Math.max(1, Math.min(N - 2, Math.round((x + r) / d))), j = Math.max(1, Math.min(N - 2, Math.round((z + r) / d))), h = W.h, k = j * N + i; return out.set((h[k + 1] - h[k - 1]) / (2 * d), 0, (h[k + N] - h[k - N]) / (2 * d)); };
  const step = () => { const h = W.h, p = W.p, a = Math.min(0.46, ((W.speed / 60) / d) ** 2), Dm = W.damp; let E = 0;
    for (let j = 0; j < N; j++) for (let i = 0; i < N; i++) { const k = j * N + i; if (!inside[k]) { p[k] = 0; continue; } const c = h[k], l = i && inside[k - 1] ? h[k - 1] : c, rr = i < N - 1 && inside[k + 1] ? h[k + 1] : c, u = j && inside[k - N] ? h[k - N] : c, dd = j < N - 1 && inside[k + N] ? h[k + N] : c;   // the wall: a reflecting edge
      p[k] = (2 * c - p[k] + a * (l + rr + u + dd - 4 * c)) * Dm; E += Math.abs(p[k]); }
    W.h = p; W.p = h; W.E = E / (N * N); W.steps++; };
  const shape = () => { const h = W.h, P = geo.attributes.position, F = ftx && ftx.image.data; let pk = 0;
    for (let j = 0; j < N; j++) for (let i = 0; i < N; i++) { const k = j * N + i; P.setY(k, h[k]); pk = Math.max(pk, Math.abs(h[k]));
      if (F) { const l = i ? h[k - 1] : h[k], rr = i < N - 1 ? h[k + 1] : h[k], u = j ? h[k - N] : h[k], dd = j < N - 1 ? h[k + N] : h[k], v = Math.max(0, Math.min(255, 128 - (l + rr + u + dd - 4 * h[k]) * 40000)); F[k * 4] = F[k * 4 + 1] = F[k * 4 + 2] = v; F[k * 4 + 3] = 255; } }
    P.needsUpdate = true; geo.computeVertexNormals(); if (ftx) ftx.needsUpdate = true; W.peak = pk; };
  // stepped 60 times a second (at most three a frame) while it moves or is near the cook; still and far, it sleeps
  W.update = (dt) => { if (W.awake <= 0 && W.E < 1e-7) return; mesh.getWorldPosition(_w); const near = G.camera ? G.camera.getWorldPosition(_c).distanceTo(_w) < 7 : true; if (!near && W.awake <= 0) return;
    W.awake -= dt; W.acc = Math.min(W.acc + dt, 0.05); let n = 0; while (W.acc >= 1 / 60) { W.acc -= 1 / 60; step(); n++; } if (n) shape(); if (W.E < 2e-7 && W.awake <= 0) { W.h.fill(0); W.p.fill(0); shape(); } };
  return W;
}
