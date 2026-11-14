// steam, drops and the slip of paper that says how a bowl went
import * as THREE from 'three';
import { G, V3, mat } from './ctx.js';
import * as T from './tex.js';

export function buildFx(scene) {
  const root = new THREE.Group(); scene.add(root);
  const smoke = T.smokeTex();
  const steam = [], NS = 70;
  for (let i = 0; i < NS; i++) {
    const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: smoke, color: 0xffe8d0, transparent: true, opacity: 0, depthWrite: false }));
    s.visible = false; s.userData = { life: 0, nopick: true }; root.add(s); steam.push(s);
  }
  const drops = [], ND = 260, dg = new THREE.SphereGeometry(0.006, 6, 5);
  for (let i = 0; i < ND; i++) { const d = new THREE.Mesh(dg, mat({ roughness: 0.1 })); d.visible = false; d.userData = { v: new V3(), life: 0, nopick: true }; root.add(d); drops.push(d); }
  const pops = [], splats = [];
  let si = 0, di = 0, seq = 0;
  // a pour is one body of liquid: the falling drops of one source are skinned as a stream that thins as it speeds up and breaks where it parts
  const SP = 26, SR = 6, streams = [], chains = new Map();
  for (let i = 0; i < 5; i++) { const g = new THREE.BufferGeometry(), idx = []; g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(SP * SR * 3), 3)); g.setAttribute('normal', new THREE.BufferAttribute(new Float32Array(SP * SR * 3), 3));
    for (let a = 0; a < SP - 1; a++) for (let b = 0; b < SR; b++) { const p = a * SR + b, q = a * SR + (b + 1) % SR; idx.push(p, q, p + SR, q, q + SR, p + SR); } g.setIndex(idx);
    const m = new THREE.Mesh(g, mat({ roughness: 0.05, transparent: true, opacity: 0.93, emissive: 0x000000 })); m.frustumCulled = false; m.visible = false; m.userData.nopick = true; root.add(m); streams.push({ m, key: null, pts: [] }); }
  const _a = new V3(), _b = new V3(), _t = new V3(), _n = new V3(), _bn = new V3();
  const skin = (st, c) => {
    const pts = st.pts; pts.length = 0; if (G.t - c.t < 0.09) pts.push({ p: c.lip, r: c.r });
    for (const d of c.list) if (d.visible && d.userData.chain === c) pts.push({ p: d.position, r: c.r * Math.min(1, Math.sqrt(0.55 / Math.max(0.55, d.userData.v.length()))) });
    if (pts.length < 2) { st.m.visible = false; return; }
    const n = Math.min(pts.length, SP), P = st.m.geometry.attributes.position, N = st.m.geometry.attributes.normal;
    for (let i = 0; i < SP; i++) { const k = Math.min(i, n - 1), a = pts[k].p, gapUp = k > 0 && pts[k - 1].p.distanceTo(a) > 0.11, gapDn = k < n - 1 && pts[k + 1].p.distanceTo(a) > 0.11; let r = i >= n - 1 || gapUp || gapDn ? 0.0006 : pts[k].r;
      _t.copy(pts[Math.min(k + 1, n - 1)].p).sub(pts[Math.max(k - 1, 0)].p); if (_t.lengthSq() < 1e-8) _t.set(0, -1, 0); _t.normalize(); _n.set(1, 0, 0).cross(_t); if (_n.lengthSq() < 0.01) _n.set(0, 0, 1).cross(_t); _n.normalize(); _bn.copy(_t).cross(_n);
      for (let j = 0; j < SR; j++) { const an = (j / SR) * 6.283, cx = Math.cos(an), sy = Math.sin(an), nx = _n.x * cx + _bn.x * sy, ny = _n.y * cx + _bn.y * sy, nz = _n.z * cx + _bn.z * sy, o = (i * SR + j) * 3; P.array[o] = a.x + nx * r; P.array[o + 1] = a.y + ny * r; P.array[o + 2] = a.z + nz * r; N.array[o] = nx; N.array[o + 1] = ny; N.array[o + 2] = nz; } }
    P.needsUpdate = N.needsUpdate = true; st.m.material.color.set(c.color); st.m.visible = true;
  };
  const fx = {
    steam(p, k = 1) {
      const s = steam[si++ % NS]; s.visible = true; s.position.copy(p); s.userData.life = 1; s.userData.k = k; s.userData.vx = (Math.random() - 0.5) * 0.06; s.userData.r = Math.random() * 6;
      s.scale.setScalar(0.08 * k + 0.04);
    },
    drops(p, color, n = 8) {
      for (let i = 0; i < n; i++) { const d = drops[di++ % ND]; d.visible = true; d.userData.chain = null; d.userData.pay = null; d.scale.setScalar(1); d.position.copy(p); d.material.color.set(color); d.userData.v.set((Math.random() - 0.5) * 0.5, Math.random() * 0.4, (Math.random() - 0.5) * 0.5); d.userData.life = 0.6; }
    },
    popup() { }, // nothing is written in the air: people say it
    pour(p, v, color, q, pay, src, r = 0.006) { // src: whatever is pouring, so its drops run together
      const d = drops[di++ % ND]; d.position.copy(p); d.material.color.set(color); d.scale.setScalar(1.5); d.userData.v.copy(v); d.userData.life = 1.6; d.userData.q = q; d.userData.pay = pay; d.userData.seq = ++seq; d.userData.chain = null; d.userData.from = src; d.visible = true;
      if (!src) return; let c = chains.get(src); if (!c) chains.set(src, (c = { list: [], lip: new V3(), t: 0, r, color })); c.lip.copy(p); c.t = G.t; c.r = r; c.color = color; c.list.unshift(d); if (c.list.length > SP) c.list.length = SP; d.userData.chain = c; d.scale.setScalar(0.001);
    },
    wipe(p, r) { let n = 0; for (let i = splats.length - 1; i >= 0; i--) { const s = splats[i]; if (Math.hypot(s.m.position.x - p.x, s.m.position.z - p.z) < r && Math.abs(s.m.position.y - p.y) < 0.08) { s.m.material.opacity -= 0.12; if (s.m.material.opacity <= 0.05) { s.m.removeFromParent(); splats.splice(i, 1); } n++; } } return n; },
    splats,
    popupOld(pos, lines, good) {
      const t = T.canvasTex(512, 320, (g, w, h) => {
        g.fillStyle = 'rgba(250,246,232,0.96)'; g.fillRect(0, 0, w, h); g.strokeStyle = good ? '#1c7a3a' : '#a01c1c'; g.lineWidth = 10; g.strokeRect(5, 5, w - 10, h - 10);
        g.textAlign = 'center'; g.fillStyle = good ? '#1c7a3a' : '#a01c1c'; g.font = `bold 54px ${T.JP}`; g.fillText(lines[0], w / 2, 66, w - 30);
        g.fillStyle = '#1b1b1b'; g.font = `bold 34px ${T.JP}`; lines.slice(1, 7).forEach((l, i) => g.fillText(l, w / 2, 120 + i * 40, w - 30));
      });
      const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: t, transparent: true })); s.renderOrder = 50; s.userData.nopick = true;
      s.scale.set(0.3, 0.1875, 1); s.position.copy(pos); root.add(s); pops.push({ s, life: 6.5 });
    },
    splat(p, color, r = 0.08, yolk) { // what a broken egg or a spilt bowl leaves where it hit
      const m = new THREE.Mesh(new THREE.CircleGeometry(r, 12).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ color: new THREE.Color(color).multiplyScalar(0.45), transparent: true, opacity: 0.85, depthWrite: false })); m.position.set(p.x, Math.max(0.006, p.y + 0.004), p.z); m.scale.set(0.7 + Math.random() * 0.8, 1, 0.7 + Math.random() * 0.8); m.rotation.y = Math.random() * 6; m.userData.nopick = true; root.add(m); splats.push({ m, life: 50 });
      if (yolk) { const y = new THREE.Mesh(new THREE.SphereGeometry(r * 0.38, 8, 6), new THREE.MeshBasicMaterial({ color: new THREE.Color(yolk).multiplyScalar(0.6) })); y.scale.y = 0.35; y.position.set(p.x + 0.01, m.position.y + 0.004, p.z); y.userData.nopick = true; root.add(y); splats.push({ m: y, life: 50 }); }
    },
    update(dt) {
      for (let i = splats.length - 1; i >= 0; i--) { const s = splats[i]; s.life -= dt; if (s.life <= 0) { s.m.removeFromParent(); splats.splice(i, 1); } }
      for (const s of steam) if (s.visible) {
        const u = s.userData; u.life -= dt * 0.55; if (u.life <= 0) { s.visible = false; continue; }
        s.position.y += dt * 0.22; s.position.x += u.vx * dt; s.scale.addScalar(dt * 0.11); s.material.rotation = u.r + u.life;
        s.material.opacity = Math.sin(u.life * Math.PI) * 0.13 * Math.min(1, u.k);
      }
      for (const d of drops) if (d.visible) { const u = d.userData; u.life -= dt; if (u.life <= 0) { d.visible = false; u.pay = null; u.chain = null; d.scale.setScalar(1); continue; } const y0 = d.position.y; u.v.y -= 9.8 * dt; d.position.addScaledVector(u.v, dt);
        if (!u.pay) continue; const p = d.position; let done = false; // poured liquid: whatever bowl it falls into gets it; anything else it wets
        for (const b of G.items) { if (b.kind !== 'bowl' || b.dirty) continue; const bp = b.obj.position, top = bp.y + 0.085; if (y0 >= top - 0.03 && p.y <= top && Math.hypot(p.x - bp.x, p.z - bp.z) < 0.098) { b.receive(u.pay, u.q); done = true; break; } }
        if (!done) for (const b of G.items) { if (!b.takes || b.held && b.tilt() > 0.7) continue; const bp = b.obj.position, top = bp.y + b.takes.h; if (y0 >= top - 0.04 && p.y <= top && Math.hypot(p.x - bp.x, p.z - bp.z) < b.takes.r) { if (b !== u.from) { b.receive(u.pay, u.q); done = true; } break; } }
        if (!done) for (const s of G.surfaces) if (p.y <= s.y && y0 > s.y - 0.05 && p.x > s.minX && p.x < s.maxX && p.z > s.minZ && p.z < s.maxZ) { if (Math.random() < 0.12) fx.splat(p.clone().setY(s.y), d.material.color.getHex(), 0.025); done = true; break; }
        if (!done && p.y <= 0.01) { if (Math.random() < 0.12) fx.splat(p.clone().setY(0), d.material.color.getHex(), 0.03); done = true; }
        if (done) { d.visible = false; u.pay = null; u.chain = null; d.scale.setScalar(1); } }
      let k = 0; for (const [src, c] of chains) { c.list = c.list.filter((d) => d.visible && d.userData.chain === c); if (!c.list.length && G.t - c.t > 0.1) { chains.delete(src); continue; } if (k < streams.length) skin(streams[k++], c); } for (; k < streams.length; k++) streams[k].m.visible = false;
      for (let i = pops.length - 1; i >= 0; i--) { const p = pops[i]; p.life -= dt; p.s.position.y += dt * 0.012; p.s.material.opacity = Math.min(1, p.life); if (p.life <= 0) { p.s.removeFromParent(); p.s.material.map.dispose(); p.s.material.dispose(); pops.splice(i, 1); } }
    },
  };
  G.fx = fx; return fx;
}
