// Live liquid surface, after thestrangest's sushi/ripple.js: a height grid in a round vessel stepped by the damped wave
'use strict';
// equation with a reflecting rim; poked by what drops in, bubbled by the heat, sleeps when still and far from the player.
(function () {
let DISC = null;
const disc = () => DISC || (DISC = (() => { const c = document.createElement('canvas'); c.width = c.height = 64; const g = c.getContext('2d'); g.fillStyle = '#000'; g.fillRect(0, 0, 64, 64); g.fillStyle = '#fff'; g.beginPath(); g.arc(32, 32, 31, 0, 7); g.fill(); return new THREE.CanvasTexture(c); })());
const _w = new THREE.Vector3();
// r: inner radius at the surface; o.n cells across, o.speed units/s, o.damp kept per step
MC.makeWater = function (r, material, o = {}) {
  const N = o.n || 26, h0 = new Float32Array(N * N), h1 = new Float32Array(N * N), inside = new Uint8Array(N * N), d = (2 * r) / (N - 1);
  for (let j = 0; j < N; j++) for (let i = 0; i < N; i++) inside[j * N + i] = Math.hypot(i * d - r, j * d - r) <= r ? 1 : 0;
  const geo = new THREE.PlaneGeometry(2 * r, 2 * r, N - 1, N - 1); geo.rotateX(-Math.PI / 2);
  material.alphaMap = disc(); material.alphaTest = 0.5;
  const mesh = new THREE.Mesh(geo, material); mesh.castShadow = false; mesh.receiveShadow = true;
  const W = { mesh, r, N, h: h0, p: h1, E: 0, acc: 0, awake: 2, speed: o.speed == null ? 0.9 : o.speed, damp: o.damp == null ? 0.985 : o.damp, peak: 0, heat: 0, bubT: 0 };
  W.poke = (x, z, a, rr = 0.06) => { const cx = (x + r) / d, cz = (z + r) / d, R = Math.ceil((2 * rr) / d) + 1, h = W.h;
    for (let j = Math.max(0, Math.floor(cz - R)); j <= Math.min(N - 1, Math.ceil(cz + R)); j++) for (let i = Math.max(0, Math.floor(cx - R)); i <= Math.min(N - 1, Math.ceil(cx + R)); i++) { const k = j * N + i; if (!inside[k]) continue; const d2 = ((i - cx) * d) ** 2 + ((j - cz) * d) ** 2; if (d2 < rr * rr * 4) h[k] -= a * Math.exp(-d2 / (rr * rr)); }
    W.awake = 3; };
  // a poke at a world point (what fell in)
  W.pokeWorld = (p, a, rr) => { mesh.updateWorldMatrix(true, false); const l = mesh.worldToLocal(_w.copy(p)); W.poke(Math.max(-r, Math.min(r, l.x)), Math.max(-r, Math.min(r, l.z)), a, rr); };
  W.slosh = (ax, az) => { const h = W.h; for (let j = 0; j < N; j++) for (let i = 0; i < N; i++) { const k = j * N + i; if (inside[k]) h[k] += ((i * d - r) * ax + (j * d - r) * az) * 0.02; } W.awake = 3; };
  W.at = (x, z) => { const i = Math.max(0, Math.min(N - 1, Math.round((x + r) / d))), j = Math.max(0, Math.min(N - 1, Math.round((z + r) / d))); return W.h[j * N + i]; };
  const step = () => { const h = W.h, p = W.p, a = Math.min(0.46, ((W.speed / 60) / d) ** 2), Dm = W.damp; let E = 0;
    for (let j = 0; j < N; j++) for (let i = 0; i < N; i++) { const k = j * N + i; if (!inside[k]) { p[k] = 0; continue; } const c = h[k], l = i && inside[k - 1] ? h[k - 1] : c, rr = i < N - 1 && inside[k + 1] ? h[k + 1] : c, u = j && inside[k - N] ? h[k - N] : c, dd = j < N - 1 && inside[k + N] ? h[k + N] : c;
      p[k] = (2 * c - p[k] + a * (l + rr + u + dd - 4 * c)) * Dm; E += Math.abs(p[k]); }
    W.h = p; W.p = h; W.E = E / (N * N); };
  const shape = () => { const h = W.h, P = geo.attributes.position; let pk = 0; for (let k = 0; k < N * N; k++) { P.setY(k, h[k]); pk = Math.max(pk, Math.abs(h[k])); } P.needsUpdate = true; geo.computeVertexNormals(); W.peak = pk; };
  // heat 0..1: bubbles rise and burst at random points, more and bigger as it nears a boil
  W.update = dt => {
    if (W.heat > 0) { W.bubT -= dt; if (W.bubT <= 0) { W.bubT = (0.5 - 0.42 * W.heat) * (0.4 + Math.random()); const a = Math.random() * 6.283, q = Math.sqrt(Math.random()) * r * 0.8; W.poke(Math.cos(a) * q, Math.sin(a) * q, -(0.006 + 0.02 * W.heat), 0.03 + 0.03 * W.heat); } }
    if (W.awake <= 0 && W.E < 1e-6) return; mesh.getWorldPosition(_w); const near = MC.camera ? MC.player && MC.player.head ? MC.player.head.distanceTo(_w) < 14 : true : true; if (!near && W.awake <= 0) return;
    W.awake -= dt; W.acc = Math.min(W.acc + dt, 0.05); let n = 0; while (W.acc >= 1 / 60) { W.acc -= 1 / 60; step(); n++; } if (n) shape(); if (W.E < 2e-6 && W.awake <= 0 && W.heat <= 0) { W.h.fill(0); W.p.fill(0); shape(); } };
  return W;
};
})();
