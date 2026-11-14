// the street's buildings as real things: fronts of piers, bands and recessed rooms behind glass, and ground-floor shops you can see into, each a stocked room; shuttered ones too
import * as THREE from 'three';
import { mat } from './ctx.js';
import * as T from './tex.js';

const _m = new THREE.Matrix4(), _q = new THREE.Quaternion(), _p = new THREE.Vector3(), _s = new THREE.Vector3(), _c = new THREE.Color(), _e = new THREE.Euler();
class Bag { // many boxes or cylinders in one draw: add(centre, size, colour, turn)
  constructor(geo, material, cap) { this.m = new THREE.InstancedMesh(geo, material, cap); this.n = 0; this.cap = cap; }
  add(x, y, z, sx, sy, sz, color = 0xffffff, ry = 0, rx = 0) {
    if (this.n >= this.cap) return;
    _m.compose(_p.set(x, y, z), _q.setFromEuler(_e.set(rx, ry, 0)), _s.set(sx, sy, sz)); this.m.setMatrixAt(this.n, _m);
    this.m.setColorAt(this.n, color.isColor ? color : _c.set(color)); this.n++;
  }
  done(parent, shadow) { this.m.count = this.n; if (!this.n) return; this.m.instanceMatrix.needsUpdate = true; if (this.m.instanceColor) this.m.instanceColor.needsUpdate = true; this.m.castShadow = !!shadow; this.m.receiveShadow = !!shadow; this.m.frustumCulled = false; this.m.userData.nopick = true; parent.add(this.m); }
}
const shade = (g, f) => { g = g.toNonIndexed(); const n = g.attributes.normal, c = new Float32Array(n.count * 3); for (let i = 0; i < n.count; i++) { const v = f(n.getX(i), n.getY(i), n.getZ(i)); c[i * 3] = c[i * 3 + 1] = c[i * 3 + 2] = v; } g.setAttribute('color', new THREE.BufferAttribute(c, 3)); return g; };

export function makeStreet(scene, city, glow, R, o) {
  // self-lit things inside rooms: shaded as if lit from the ceiling, so no light is spent on them
  const boxLit = shade(new THREE.BoxGeometry(1, 1, 1), (x, y, z) => (y > 0.5 ? 1 : y < -0.5 ? 0.42 : z > 0.5 ? 0.86 : z < -0.5 ? 0.6 : 0.72));
  const cylLit = shade(new THREE.CylinderGeometry(0.5, 0.5, 1, 10), (x, y, z) => (y > 0.5 ? 1 : y < -0.5 ? 0.4 : 0.62 + 0.3 * z));
  const roomGeo = (() => { const g = new THREE.BoxGeometry(1, 1, 1).translate(0, 0, -0.5).toNonIndexed(), p = g.attributes.position, n = g.attributes.normal, keep = [], col = [];
    for (let i = 0; i < p.count; i += 3) { if (n.getZ(i) > 0.5) continue; const v = n.getZ(i) < -0.5 ? 1 : n.getY(i) > 0.5 ? 0.8 : n.getY(i) < -0.5 ? 0.4 : 0.66; for (let k = 0; k < 3; k++) { keep.push(p.getX(i + k), p.getY(i + k), p.getZ(i + k)); col.push(v, v, v); } }
    const o2 = new THREE.BufferGeometry(); o2.setAttribute('position', new THREE.Float32BufferAttribute(keep, 3)); o2.setAttribute('color', new THREE.Float32BufferAttribute(col, 3)); return o2; })();
  const box = new THREE.BoxGeometry(1, 1, 1), cyl = new THREE.CylinderGeometry(0.5, 0.5, 1, 10);
  const litM = new THREE.MeshBasicMaterial({ vertexColors: true }), roomM = new THREE.MeshBasicMaterial({ vertexColors: true, side: THREE.BackSide });
  const wallT = T.canvasTex(256, 256, (g, w, h) => { g.fillStyle = '#b4b0a8'; g.fillRect(0, 0, w, h); const r = T.rng(5); for (let i = 0; i < 2600; i++) { g.globalAlpha = 0.08; g.fillStyle = r() > 0.5 ? '#000' : '#fff'; g.fillRect(r() * w, r() * h, 1 + r() * 3, 1 + r() * 3); } g.globalAlpha = 1; });
  T.dirty(wallT, 61, { drips: 26, stains: 20, cracks: 3 });
  const frameM = mat({ map: wallT, roughness: 0.86 }); frameM.normalMap = T.normalOf(wallT, 2);
  const glassM = new THREE.MeshPhysicalMaterial({ color: 0x1a2630, roughness: 0.06, metalness: 0, transparent: true, opacity: 0.26, envMapIntensity: 2.2, depthWrite: false });
  const spillM = (c) => new THREE.MeshBasicMaterial({ map: o.glowMap, color: c, transparent: true, opacity: 0.2, blending: THREE.AdditiveBlending, depthWrite: false });
  const pk = (a) => a[(R() * a.length) | 0], rr = (a, b) => a + R() * (b - a);
  const col = (hex, k = 1, j = 0.12) => new THREE.Color(hex).multiplyScalar(k * (1 - j / 2 + R() * j));
  const seats = [];

  const WALLS = [0x8a8478, 0x6e6a64, 0x8c7a66, 0x5e646a, 0x7a6e60, 0x9a948a, 0x66605a, 0x74807a];
  const LIGHTS = [[1, 0.78, 0.5], [1, 0.9, 0.72], [0.8, 0.92, 1], [1, 0.84, 0.6], [0.7, 0.85, 1], [1, 0.72, 0.42]];
  const BOOKS = [0x7a2a22, 0x1c3a5e, 0x2a5a3a, 0x8a6a2a, 0xb8b0a0, 0x3a2a4a, 0x5a1c2a, 0xc8a040, 0x2a2a2e, 0x9a4a2a];
  const SLEEVES = [0xc82a3a, 0x2a6ac8, 0xe8c020, 0x111114, 0xe8e0d0, 0x8a2ac8, 0x2aa86a, 0xf08a2a, 0xd84a8a];
  const PACKS = [0xf0f0ea, 0x2a8a5a, 0x2a5ab8, 0xe8862a, 0xd03030, 0xf0d040, 0xb8d8e8];
  const GLASSB = [0x5a2a0c, 0x1c4a24, 0x8a5a14, 0xb8c8c0, 0x3a1408, 0x6a7a2a];
  const PRODUCE = [0xe8862a, 0xc8201c, 0x5a9a2a, 0xe8d040, 0x8a3a8a, 0xd8c8a0];
  const SCREENS = [[0.5, 0.75, 1.6], [1.5, 1.4, 1.2], [1.6, 0.5, 0.9], [0.4, 1.5, 0.8], [1.5, 1.1, 0.3]];

  // one building: w wide, h tall, its front on the line z, facing dir (+1 toward +z); near ones get open shops
  function building(x, w, h, z, dir, si, opt = {}) {
    const g = new THREE.Group(), gl = new THREE.Group();
    for (const k of [g, gl]) { k.position.set(dir > 0 ? x : x + w, 0, z); k.rotation.y = dir > 0 ? 0 : Math.PI; }
    city.add(g); glow.add(gl);
    const W = (lx, ly, lz) => new THREE.Vector3(dir > 0 ? x + lx : x + w - lx, ly, z + dir * lz);
    const frame = new Bag(box, frameM, 1500), rooms = new Bag(roomGeo, roomM, 420), props = new Bag(boxLit, litM, 3600), glass = new Bag(box, glassM, 520), cy = new Bag(cylLit, litM, 900), oc = new Bag(cyl, frameM, 160);
    const wall = pk(WALLS), trim = 0x2a2c30, y0 = opt.y0 ?? 3.3, near = opt.near;
    if (!opt.noBody) { const b = new THREE.Mesh(box, o.body); b.scale.set(w - 0.02, h, 7); b.position.set(w / 2, h / 2 - 0.05, -4.7 - 3.5); b.castShadow = true; g.add(b); }

    // ---- upper floors: piers and bands with the windows left open between them, a room behind each
    const fh = rr(2.9, 3.3), rows = Math.max(1, Math.floor((h - y0) / fh)), top = y0 + rows * fh, cols = Math.max(2, Math.round(w / rr(1.7, 2.6))), cell = w / cols, pw = rr(0.28, 0.6), sh = rr(0.85, 1.3), wh = fh - sh, ww = cell - pw;
    for (let c = 0; c <= cols; c++) frame.add(c * cell, (y0 + top) / 2, -0.16, c === 0 || c === cols ? pw * 0.5 + 0.2 : pw, top - y0, 0.42, col(wall, 1, 0.08));
    for (let r = 0; r <= rows; r++) frame.add(w / 2, y0 + r * fh + (r === rows ? 0.45 : sh / 2), -0.13, w, r === rows ? 0.9 : sh, 0.36, col(wall, 0.94, 0.1));
    const light = pk(LIGHTS);
    for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
      const cx = (c + 0.5) * cell, wy = y0 + r * fh + sh, cyy = wy + wh / 2, lit = R() < 0.3, tv = lit && R() < 0.12, b = lit ? rr(0.35, 1.05) : 0;
      const tint = tv ? [0.45, 0.6, 1.1] : R() < 0.75 ? light : pk(LIGHTS), depth = rr(1.3, 2.4);
      rooms.add(cx, cyy, -0.3, ww, wh, depth, lit ? new THREE.Color(tint[0] * b, tint[1] * b, tint[2] * b) : new THREE.Color(0.012, 0.014, 0.02));
      glass.add(cx, cyy, -0.2, ww, wh, 0.012);
      frame.add(cx, cyy, -0.2, 0.045, wh, 0.05, trim); frame.add(cx, wy + wh * 0.62, -0.2, ww, 0.04, 0.05, trim);
      frame.add(cx, wy - 0.03, 0.07, ww + 0.12, 0.06, 0.2, col(wall, 0.8));
      if (R() < 0.14) { frame.add(cx + ww * 0.1, wy - 0.42, 0.26, 0.72, 0.5, 0.34, col(0x9a9c98, 1, 0.2)); frame.add(cx + ww * 0.1, wy - 0.7, 0.2, 0.6, 0.04, 0.4, trim); }
      if (lit) {
        const k = b * 0.9;
        if (R() < 0.7) { const cw = ww * rr(0.18, 0.42), side = R() < 0.5 ? -1 : 1, fc = col(pk([0xd8c8a8, 0xb8c0c8, 0xc8a890, 0xa8b89a]), k); props.add(cx + side * (ww - cw) / 2, cyy, -0.36, cw, wh, 0.03, fc); if (R() < 0.4) props.add(cx - side * (ww - cw * 0.6) / 2, cyy, -0.36, cw * 0.6, wh, 0.03, fc); }
        props.add(cx + rr(-0.3, 0.3) * ww, wy + rr(0.25, 0.5), -depth * 0.75, rr(0.5, 1.1), rr(0.5, 1.0), 0.4, col(pk([0x5a4030, 0x3a3a40, 0x6a5a48, 0x2a3a34]), k * 0.8));
        if (R() < 0.6) props.add(cx + rr(-0.25, 0.25) * ww, wy + wh - 0.12, -depth * 0.5, 0.3, 0.08, 0.3, new THREE.Color(tint[0] * 2.2, tint[1] * 2.2, tint[2] * 2.0));
        if (tv) props.add(cx, wy + 0.45, -depth * 0.8, 0.5, 0.38, 0.05, new THREE.Color(0.7, 1.0, 1.9));
      } else if (R() < 0.45) props.add(cx, cyy, -0.36, ww, wh, 0.03, col(pk([0x2a2c30, 0x3a342c, 0x20262c]), 0.5)); // blinds down
    }
    frame.add(w / 2, top + 0.02, -2.4, w, 0.24, 4.7, col(0x3a3a3c, 1, 0.1)); frame.add(w / 2, y0 - 0.14, -2.4, w - 0.3, 0.2, 4.6, col(0x3a3a3c));
    for (const sx of [0.06, w - 0.06]) frame.add(sx, (y0 + top) / 2, -2.5, 0.12, top - y0, 4.4, col(wall, 0.8));
    // roof: parapet, a water tank, an aerial
    if (h > 8) { const tx = rr(1.2, w - 1.2); oc.add(tx, top + 1.9, -3.5, 1.5, 1.6, 1.5, col(0x5a5c60)); for (const sx of [-0.5, 0.5]) frame.add(tx + sx, top + 0.6, -3.5, 0.08, 1.0, 0.08, 0x2a2a2a); }
    frame.add(rr(0.6, w - 0.6), top + 1.4, -2.2, 0.04, 2.6, 0.04, 0x1a1a1c);

    // ---- street level
    if (!opt.noShops) {
      const n = Math.max(1, Math.round(w / rr(3.3, 4.6))), bw = w / n;
      frame.add(w / 2, 3.0, 0.02, w, 0.62, 0.5, col(wall, 0.8));
      for (let i = 0; i <= n; i++) frame.add(i * bw, 1.65, -0.05, 0.26, 3.3, 0.5, col(wall, 0.9));
      for (let i = 0; i < n; i++) shop(i * bw, bw, near && R() > 0.24, si * 7 + i);
    }

    function shutter(x0, bw) {
      const sc = pk([0x6a7074, 0x5a6266, 0x74706a, 0x4e565c]);
      for (let k = 0; k < 15; k++) frame.add(x0 + bw / 2, 0.1 + k * 0.18, -0.06 - (k % 2) * 0.03, bw - 0.3, 0.17, 0.05, col(sc, 1, 0.16));
      frame.add(x0 + bw / 2, 0.05, -0.02, bw - 0.26, 0.1, 0.1, 0x2a2c30); frame.add(x0 + bw * 0.5, 1.15, -0.02, 0.26, 0.05, 0.03, 0x1a1a1c);
      if (R() < 0.5) frame.add(x0 + 0.5, 1.5, 0.02, 0.26, 0.36, 0.1, col(0x7a2a22, 1, 0.2)); // post box
    }

    function shop(x0, bw, open, seed) {
      const KINDS = ['izakaya', 'books', 'liquor', 'pharmacy', 'records', 'kissa', 'grocer', 'tv', 'camera', 'game', 'izakaya', 'liquor'], type = KINDS[(seed * 5 + ((R() * 3) | 0)) % KINDS.length];
      const sm = o.signFor(type), sgH = Math.min(0.46, (bw - 0.6) / sm.userData.aspect);
      if (open || R() < 0.5) o.addSign(sm, ...W(x0 + bw / 2, 3.0, 0.3).toArray(), sgH, dir > 0 ? 0 : Math.PI, open ? 1 : 0.18);
      if (!open) { shutter(x0, bw); return; }
      const D = rr(3.2, 4.4), L = { izakaya: [1, 0.72, 0.42], books: [1, 0.9, 0.72], records: [0.9, 0.95, 1], pharmacy: [0.86, 1, 0.9], tv: [0.75, 0.88, 1], kissa: [1, 0.7, 0.4], grocer: [1, 0.92, 0.76], game: [0.55, 0.4, 0.8], liquor: [1, 0.86, 0.6], camera: [0.92, 0.96, 1] }[type];
      const B = type === 'game' ? 0.2 : type === 'kissa' || type === 'izakaya' ? 0.34 : 0.44, lc = (hex, k = 1) => { const c = col(hex, k * B); c.r *= L[0]; c.g *= L[1]; c.b *= L[2]; return c; };
      const xa = x0 + 0.13, xb = x0 + bw - 0.13, iw = xb - xa, xm = (xa + xb) / 2, wallC = pk([0xd8d0c0, 0xc8c0b0, 0xb8b4a8, 0xd0c8b4]), floorC = pk([0x6a5a48, 0x8a8478, 0x4a4a4e, 0x7a6a50]);
      // the room itself
      props.add(xm, 0.03, -D / 2, iw, 0.06, D, lc(floorC, 0.8)); props.add(xm, 2.72, -D / 2, iw, 0.06, D, lc(0xd8d4c8, 0.7));
      props.add(xm, 1.37, -D, iw, 2.7, 0.08, lc(wallC)); props.add(xa, 1.37, -D / 2, 0.06, 2.7, D, lc(wallC, 0.85)); props.add(xb, 1.37, -D / 2, 0.06, 2.7, D, lc(wallC, 0.85));
      for (const tz of [-D * 0.3, -D * 0.72]) { props.add(xm, 2.66, tz, Math.min(1.2, iw * 0.5), 0.05, 0.09, new THREE.Color(L[0] * 2.4, L[1] * 2.4, L[2] * 2.4)); props.add(xm, 2.69, tz, Math.min(1.3, iw * 0.55), 0.03, 0.16, lc(0x8a8a84, 0.6)); }
      // the front: a low wall, panes between posts, a door standing open
      const doorR = R() < 0.5, dw = 0.92, dx = doorR ? xb - dw / 2 - 0.05 : xa + dw / 2 + 0.05, gx0 = doorR ? xa : xa + dw + 0.1, gx1 = doorR ? xb - dw - 0.1 : xb, openFront = type === 'grocer';
      if (!openFront) {
        frame.add((gx0 + gx1) / 2, 0.24, -0.04, gx1 - gx0, 0.48, 0.16, col(pk([0x4a5a5a, 0x5a4a3a, 0x3a4450, 0x6a6258]), 1, 0.1));
        glass.add((gx0 + gx1) / 2, 1.6, -0.04, gx1 - gx0, 2.24, 0.012);
        const nm = Math.max(1, Math.round((gx1 - gx0) / 1.1)); for (let k = 0; k <= nm; k++) frame.add(gx0 + (gx1 - gx0) * k / nm, 1.6, -0.04, 0.05, 2.24, 0.07, trim);
        frame.add((gx0 + gx1) / 2, 0.5, -0.04, gx1 - gx0, 0.05, 0.08, trim); frame.add((gx0 + gx1) / 2, 2.2, -0.04, gx1 - gx0, 0.04, 0.07, trim);
        const sl = doorR ? -1 : 1; // sliding door, pushed half back behind the pane
        for (const ox of [-dw / 2, dw / 2]) frame.add(dx + sl * dw * 0.55 + ox, 1.36, -0.11, 0.05, 2.7, 0.04, trim);
        for (const oy of [0.06, 1.0, 2.68]) frame.add(dx + sl * dw * 0.55, oy, -0.11, dw, 0.06, 0.04, trim);
        glass.add(dx + sl * dw * 0.55, 1.85, -0.11, dw - 0.08, 1.64, 0.01);
        frame.add(dx, 0.02, 0.1, dw + 0.2, 0.04, 0.5, col(0x3a342c, 1, 0.2)); // worn mat on the step
      }
      const shelf = (xs, xe, zc, kind, face = 1) => { // boards on a wall with things stood along them
        const len = Math.abs(xe - xs); if (len < 0.4) return;
        for (const sy of [0.35, 0.85, 1.35, 1.85]) {
          props.add((xs + xe) / 2, sy, zc, len, 0.03, 0.3, lc(0x7a5a3a, 0.9));
          let px = Math.min(xs, xe) + 0.04; const end = Math.max(xs, xe) - 0.04;
          while (px < end) {
            if (R() < 0.12) { px += rr(0.05, 0.25); continue; }
            if (kind === 'books') { const bwid = rr(0.022, 0.05), bh = rr(0.17, 0.27); props.add(px + bwid / 2, sy + 0.015 + bh / 2, zc + rr(-0.02, 0.03), bwid, bh, 0.17, lc(pk(BOOKS)), 0, R() < 0.08 ? 0.2 : 0); px += bwid + 0.002; }
            else if (kind === 'records') { props.add(px + 0.008, sy + 0.17, zc, 0.012, 0.31, 0.3, lc(pk(SLEEVES))); px += 0.02; }
            else if (kind === 'packs') { const a = rr(0.06, 0.15), bh = rr(0.07, 0.2); props.add(px + a / 2, sy + 0.015 + bh / 2, zc, a, bh, rr(0.08, 0.2), lc(pk(PACKS))); px += a + rr(0.005, 0.03); }
            else if (kind === 'bottles') { const bh = rr(0.2, 0.3); cy.add(px + 0.04, sy + 0.015 + bh / 2, zc, 0.07, bh, 0.07, lc(pk(GLASSB), 1.1)); cy.add(px + 0.04, sy + 0.015 + bh + 0.03, zc, 0.025, 0.07, 0.025, lc(pk(GLASSB), 1.1)); px += rr(0.085, 0.13); }
            else if (kind === 'cans') { for (let s2 = 0; s2 < 1 + ((R() * 2) | 0); s2++) cy.add(px + 0.04, sy + 0.07 + s2 * 0.115, zc, 0.07, 0.11, 0.07, lc(pk(PACKS))); px += 0.082; }
            else if (kind === 'tv') { const s2 = rr(0.34, 0.5); if (sy > 1.4 || px + s2 > end) { px += s2; continue; } props.add(px + s2 / 2, sy + 0.015 + s2 * 0.42, zc - 0.05, s2, s2 * 0.84, 0.36, lc(pk([0x2a2a2e, 0x4a3a2a, 0x8a8a8a]), 0.7)); const sc2 = pk(SCREENS); props.add(px + s2 * 0.44, sy + 0.015 + s2 * 0.44, zc + 0.135 * face, s2 * 0.68, s2 * 0.58, 0.02, new THREE.Color(sc2[0] * rr(0.5, 1), sc2[1] * rr(0.5, 1), sc2[2] * rr(0.5, 1))); px += s2 + rr(0.03, 0.1); }
          }
        }
      };
      const counter = (cx, cz, len, alongZ) => { props.add(cx, 0.5, cz, alongZ ? 0.5 : len, 1.0, alongZ ? len : 0.5, lc(0x5a3a22)); props.add(cx, 1.02, cz, alongZ ? 0.6 : len + 0.06, 0.04, alongZ ? len + 0.06 : 0.6, lc(0x8a6a48)); };
      const stool = (sx, sz) => { cy.add(sx, 0.67, sz, 0.32, 0.05, 0.32, lc(pk([0x7a1814, 0x2a2a2e, 0x8a6a3a]))); cy.add(sx, 0.33, sz, 0.04, 0.64, 0.04, lc(0x9a9a9a)); cy.add(sx, 0.02, sz, 0.3, 0.03, 0.3, lc(0x8a8a8a)); };
      if (type === 'books') { shelf(xa + 0.1, xb - 0.1, -D + 0.2, 'books'); for (const tz of [-D * 0.35, -D * 0.62]) { props.add(xm, 0.4, tz, iw * 0.45, 0.8, 0.6, lc(0x6a4a2e)); for (let k = 0; k < 9; k++) { const n2 = 2 + ((R() * 6) | 0); for (let s2 = 0; s2 < n2; s2++) props.add(xm - iw * 0.18 + (k % 5) * iw * 0.09, 0.82 + s2 * 0.03, tz - 0.14 + Math.floor(k / 5) * 0.28, 0.15, 0.028, 0.21, lc(pk(BOOKS)), rr(-0.2, 0.2)); } } }
      else if (type === 'records') { shelf(xa + 0.1, xb - 0.1, -D + 0.2, 'records'); for (const bx of [xa + iw * 0.3, xa + iw * 0.7]) { props.add(bx, 0.42, -D * 0.5, 0.7, 0.84, D * 0.5, lc(0x4a3a2a)); for (let k = 0; k < 44; k++) props.add(bx + rr(-0.28, 0.28), 1.0, -D * 0.5 + (k / 44 - 0.5) * D * 0.46, 0.31, 0.31, 0.01, lc(pk(SLEEVES)), 0, rr(-0.25, -0.05)); } for (let k = 0; k < 4; k++) props.add(xa + 0.04, rr(1.2, 2.2), -rr(0.6, D - 0.5), 0.02, 0.6, 0.42, lc(pk(SLEEVES))); }
      else if (type === 'pharmacy') { shelf(xa + 0.1, xb - 0.1, -D + 0.2, 'packs'); counter(xm, -D * 0.55, iw * 0.7, false); props.add(xm + iw * 0.2, 1.17, -D * 0.55, 0.34, 0.26, 0.36, lc(0x3a3a40)); for (let k = 0; k < 12; k++) cy.add(xm - iw * 0.3 + k * 0.05, 1.11, -D * 0.5, 0.045, 0.14, 0.045, lc(pk(PACKS))); props.add(xm, 2.2, -D + 0.06, 0.5, 0.16, 0.03, new THREE.Color(0.3, 2.0, 0.7)); props.add(xm, 2.2, -D + 0.06, 0.16, 0.5, 0.03, new THREE.Color(0.3, 2.0, 0.7)); }
      else if (type === 'tv') { shelf(xa + 0.1, xb - 0.1, -D + 0.25, 'tv'); for (let k = 0; k < 3; k++) { const s2 = 0.5, px = gx0 + 0.4 + k * 0.62; if (px > gx1 - 0.3) break; props.add(px, 0.78, -0.45, s2, s2 * 0.84, 0.4, lc(0x2a2a2e, 0.7)); const sc2 = pk(SCREENS); props.add(px - 0.03, 0.8, -0.24, s2 * 0.68, s2 * 0.58, 0.02, new THREE.Color(...sc2)); props.add(px, 0.25, -0.45, 0.56, 0.5, 0.44, lc(0x4a3a2a)); } counter(xb - 0.5, -D * 0.6, D * 0.4, true); }
      else if (type === 'izakaya' || type === 'kissa') {
        const side = doorR ? xa + 0.75 : xb - 0.75, sgn = doorR ? 1 : -1; counter(side, -D * 0.55, D * 0.62, true); shelf(side - sgn * 0.62, side - sgn * 0.3, -D + 0.2, 'bottles');
        for (let k = 0; k < 4; k++) { const sz = -D * 0.28 - k * 0.52; if (sz < -D + 0.5) break; stool(side + sgn * 0.5, sz); if (near && Math.abs(x + w / 2) < 22 && R() < 0.6) seats.push({ p: W(side + sgn * 0.5, 0, sz + 0.04), ry: (dir > 0 ? 0 : Math.PI) + (sgn > 0 ? -Math.PI / 2 : Math.PI / 2) }); for (let b2 = 0; b2 < 2; b2++) cy.add(side + rr(-0.15, 0.15), 1.1, sz + rr(-0.2, 0.2), 0.07, 0.12, 0.07, lc(pk([0xd8d8d0, 0x5a2a0c, 0xe8e0c8]))); }
        for (let k = 0; k < 14; k++) cy.add(side - sgn * 0.12, 1.16, -D * 0.25 - k * 0.14, 0.07, 0.24, 0.07, lc(pk(GLASSB), 1.1));
        if (type === 'kissa') for (const tz of [-D * 0.3, -D * 0.68]) { const tx = side + sgn * 1.5; if (Math.abs(tx - xm) > iw / 2 - 0.4) continue; cy.add(tx, 0.7, tz, 0.7, 0.04, 0.7, lc(0x4a2e1c)); cy.add(tx, 0.35, tz, 0.06, 0.7, 0.06, lc(0x2a2a2a)); for (const cz of [-0.5, 0.5]) { props.add(tx, 0.44, tz + cz, 0.38, 0.05, 0.38, lc(0x6a1c1c)); props.add(tx, 0.7, tz + cz * 1.35, 0.38, 0.5, 0.04, lc(0x6a1c1c)); for (const lx of [-0.16, 0.16]) props.add(tx + lx, 0.22, tz + cz, 0.03, 0.44, 0.03, lc(0x2a2a2a)); } cy.add(tx, 2.2, tz, 0.22, 0.16, 0.22, new THREE.Color(2.2, 1.4, 0.6)); cy.add(tx, 2.5, tz, 0.012, 0.5, 0.012, lc(0x1a1a1a)); }
        if (type === 'izakaya') { for (let k = 0; k < 3; k++) frame.add(dx - 0.3 + k * 0.3, 2.42, 0.04, 0.28, 0.5, 0.012, col(pk([0x8f1712, 0x1c2c5a, 0x8f1712])), 0, rr(-0.06, 0.06)); cy.add(dx + (doorR ? -0.7 : 0.7), 1.75, 0.22, 0.3, 0.44, 0.3, new THREE.Color(2.4, 0.5, 0.2)); cy.add(dx + (doorR ? -0.7 : 0.7), 2.0, 0.22, 0.16, 0.05, 0.16, col(0x111111)); }
      } else if (type === 'grocer') { shelf(xa + 0.1, xb - 0.1, -D + 0.2, 'cans'); for (let k = 0; k < Math.floor(iw / 0.62); k++) for (const zz of [0.45, -0.35, -1.1]) { const cx2 = xa + 0.36 + k * 0.62, pc = pk(PRODUCE); props.add(cx2, 0.42 + (zz > 0 ? -0.1 : 0.1), zz, 0.56, 0.08, 0.42, lc(0x8a6a3a), 0, 0.22); for (const ez of [-0.2, 0.2]) props.add(cx2, 0.5 + (zz > 0 ? -0.1 : 0.1), zz + ez, 0.56, 0.14, 0.02, lc(0x8a6a3a), 0, 0.22); for (let q = 0; q < 14; q++) cy.add(cx2 - 0.22 + (q % 5) * 0.11, 0.52 + (zz > 0 ? -0.1 : 0.1) + Math.floor(q / 10) * 0.07, zz - 0.14 + (Math.floor(q / 5) % 2) * 0.14, 0.1, 0.085, 0.1, zz > 0 ? col(pc, 0.3) : lc(pc)); props.add(cx2, 0.17, zz, 0.5, 0.34, 0.36, lc(0x9a7a14, 0.8)); } counter(xb - 0.5, -D * 0.7, 1.2, true); }
      else if (type === 'liquor') { shelf(xa + 0.1, xb - 0.1, -D + 0.2, 'bottles'); for (const sx of [xa + 0.22, xb - 0.22]) for (const sy of [0.35, 0.85, 1.35, 1.85]) { props.add(sx, sy, -D * 0.5, 0.3, 0.03, D * 0.6, lc(0x7a5a3a, 0.9)); for (let q = 0; q < Math.floor(D * 0.6 / 0.1); q++) { const bh = rr(0.22, 0.32); cy.add(sx, sy + 0.015 + bh / 2, -D * 0.2 - q * 0.1, 0.075, bh, 0.075, lc(pk(GLASSB), 1.1)); } }
        for (let k = 0; k < 3; k++) for (let j = 0; j < 2 + (k % 2); j++) props.add(xm - 0.5 + k * 0.5, 0.16 + j * 0.31, -D * 0.5, 0.44, 0.3, 0.34, lc(pk([0x9a7a14, 0x1c5a8a, 0x8a2a1c]))); for (const bx of [xm - 0.6, xm + 0.6]) { cy.add(bx, 0.3, -D * 0.82, 0.5, 0.6, 0.5, lc(0xc8b890)); cy.add(bx, 0.3, -D * 0.82, 0.52, 0.06, 0.52, lc(0x3a2a1a)); } counter(doorR ? xa + 0.6 : xb - 0.6, -0.9, 1.0, true); }
      else if (type === 'camera') { shelf(xa + 0.1, xb - 0.1, -D + 0.2, 'packs'); counter(xm, -D * 0.5, iw * 0.72, false); glass.add(xm, 1.18, -D * 0.5, iw * 0.72, 0.28, 0.5); for (let k = 0; k < Math.floor(iw * 0.7 / 0.2); k++) { const px = xm - iw * 0.33 + k * 0.2; props.add(px, 1.1, -D * 0.5, 0.13, 0.08, 0.07, lc(pk([0x1a1a1c, 0x8a8a8a, 0x2a2a2e]))); cy.add(px, 1.1, -D * 0.5 + 0.06, 0.06, 0.06, 0.06, lc(0x2a2a2e), 0, 1.57); } for (let k = 0; k < 5; k++) props.add(xa + 0.04, rr(1.3, 2.3), -rr(0.5, D - 0.5), 0.02, 0.36, 0.5, lc(pk(SLEEVES), 0.8)); }
      else if (type === 'game') { for (let k = 0; k < Math.floor((D - 0.6) / 0.8); k++) for (const sgn of [-1, 1]) { const cx2 = sgn < 0 ? xa + 0.45 : xb - 0.45, cz = -0.6 - k * 0.8, sc2 = pk(SCREENS), cc = pk([0x1a1a22, 0x2a1a3a, 0x1a2a3a, 0x3a1a1a]); props.add(cx2, 0.85, cz, 0.74, 1.7, 0.66, col(cc, 0.5)); props.add(cx2 - sgn * 0.38, 1.25, cz, 0.02, 0.44, 0.46, new THREE.Color(sc2[0] * 1.3, sc2[1] * 1.3, sc2[2] * 1.3)); props.add(cx2 - sgn * 0.38, 1.62, cz, 0.03, 0.14, 0.6, new THREE.Color(2, 1.6, 0.4)); props.add(cx2 - sgn * 0.5, 0.92, cz, 0.3, 0.05, 0.56, col(cc, 0.8)); stool(cx2 - sgn * 0.85, cz); } }
      // light spilling out onto the pavement, and the things people leave by a shop door
      const sp = new THREE.Mesh(new THREE.PlaneGeometry(bw * 1.5, 4.6), spillM(new THREE.Color(L[0] * B, L[1] * B, L[2] * B))); sp.rotation.x = -Math.PI / 2; sp.position.set(x0 + bw / 2, 0.011, 1.7); sp.userData.nopick = true; sp.renderOrder = -1; g.add(sp);
      if (R() < 0.7) { const px = doorR ? xa + rr(0.2, 0.5) : xb - rr(0.2, 0.5); oc.add(px, 0.17, 0.42, 0.3, 0.34, 0.3, col(pk([0x7a4a2e, 0x4a4a4e, 0x2a4a6a]), 1, 0.2)); oc.add(px, 0.58, 0.42, 0.44, 0.5, 0.44, col(pk([0x2a5a24, 0x3a6a2a, 0x1c4a24]))); oc.add(px + 0.1, 0.8, 0.46, 0.26, 0.4, 0.26, col(0x2a5a24)); }
      if (R() < 0.5) { const ax = xm + rr(-0.5, 0.5), ac = col(pk([0xd8d0b8, 0x1c2c4a, 0x8a1c1c])), ay = rr(-0.3, 0.3); frame.add(ax, 0.45, 0.9, 0.5, 0.9, 0.03, ac, ay, 0.2); frame.add(ax, 0.45, 1.12, 0.5, 0.9, 0.03, ac, ay, -0.2); }
      if (R() < 0.45) for (let k = 0; k < 2 + ((R() * 2) | 0); k++) frame.add(doorR ? xa + 0.3 : xb - 0.3, 0.16 + k * 0.31, 0.75, 0.42, 0.3, 0.32, col(pk([0x9a7a14, 0x1c5a8a, 0x8a2a1c]), 1, 0.2), rr(-0.2, 0.2));
      if (R() < 0.4) bike(xm + rr(-0.8, 0.8), 1.25 + rr(0, 0.3), rr(-0.25, 0.25) + Math.PI / 2);
    }
    function bike(lx, lz, ry) {
      const b = new THREE.Group(), fm = mat({ color: pk([0x1a3a5a, 0x7a1c1c, 0x2a2a2e, 0x6a6a2a]), roughness: 0.4, metalness: 0.6 }), tm = mat({ color: 0x0c0c0d, roughness: 0.9 }), tube = (x1, y1, x2, y2, r = 0.014) => { const l = Math.hypot(x2 - x1, y2 - y1), m = new THREE.Mesh(new THREE.CylinderGeometry(r, r, l, 6), fm); m.position.set((x1 + x2) / 2, (y1 + y2) / 2, 0); m.rotation.z = Math.atan2(x2 - x1, y1 - y2) + Math.PI; m.castShadow = true; b.add(m); };
      for (const wx of [-0.52, 0.52]) { const t2 = new THREE.Mesh(new THREE.TorusGeometry(0.32, 0.018, 6, 22), tm); t2.position.set(wx, 0.34, 0); t2.castShadow = true; b.add(t2); for (let k = 0; k < 6; k++) { const s2 = new THREE.Mesh(new THREE.CylinderGeometry(0.003, 0.003, 0.62, 3), fm); s2.position.set(wx, 0.34, 0); s2.rotation.z = k * Math.PI / 6; b.add(s2); } }
      tube(-0.52, 0.34, -0.18, 0.78); tube(-0.18, 0.78, 0.36, 0.82); tube(0.36, 0.82, 0.52, 0.34); tube(-0.18, 0.78, 0.02, 0.32); tube(0.02, 0.32, 0.36, 0.82); tube(-0.52, 0.34, 0.02, 0.32); tube(-0.18, 0.78, -0.22, 0.95); tube(0.36, 0.82, 0.4, 1.02);
      const sd = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.05, 0.12), tm); sd.position.set(-0.24, 0.97, 0); b.add(sd); const hb = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.5, 6), fm); hb.rotation.x = Math.PI / 2; hb.position.set(0.4, 1.03, 0); b.add(hb);
      const bk = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.2, 0.26), mat({ color: 0x3a3a3a, roughness: 0.6, metalness: 0.5, wireframe: false })); bk.position.set(0.56, 0.86, 0); b.add(bk);
      b.position.set(lx, 0, lz); b.rotation.set(0, ry, 0); b.rotateX(0.13); b.traverse((c) => { c.userData.nopick = true; }); g.add(b);
    }
    frame.done(g, true); glass.done(g); oc.done(g, true); rooms.done(gl); props.done(gl); cy.done(gl);
    return { top, g };
  }
  return { building, seats };
}
