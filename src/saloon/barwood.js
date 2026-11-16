// the bar's joinery: the long counter with its panelled front, pilasters, rounded nosing and brass foot rail, and the back bar: cupboards with doors and the cash drawer's opening, turned columns, three shelves a side, the great mirror in its arched frame, a dentilled cornice
import * as THREE from 'three';
import { R } from './room.js';
import { pbr, plain, brass, slab, tube, model } from './kit.js';

export function buildBarWood(g, top, solid) {
  const X = R.barX, by = R.barY, z0 = R.barZ0, z1 = R.barZ1, B = R.B, bz = R.backZ, W = R.W;
  const wal = pbr('walnut', { tile: 1.1, color: 0x4c3a2e, rough: 0.82, env: 0.22 }), dk = pbr('walnut', { tile: 0.9, color: 0x2e221c, rough: 0.9, env: 0.15 }), pan = pbr('planks', { tile: 1.2, color: 0x5e5044, rough: 0.95 }), br = brass();
  const rod = (len, r, m, x, y, z, ax = 'x') => { const t = tube(r, r, len, m, x, y, z, g, 10); if (ax === 'x') t.rotation.z = Math.PI / 2; else if (ax === 'z') t.rotation.x = Math.PI / 2; return t; };

  // ---- the counter
  slab(2 * X + 0.34, 0.055, z1 - z0 + 0.2, wal, 0, by - 0.0275, (z0 + z1) / 2 - 0.02, g);
  rod(2 * X + 0.34, 0.0275, wal, 0, by - 0.0275, z0 - 0.12);                                             // the nosing your customers lean on
  slab(2 * X + 0.3, 0.05, 0.05, dk, 0, by - 0.08, z0 - 0.07, g); slab(2 * X + 0.3, 0.03, 0.03, dk, 0, by - 0.12, z0 - 0.045, g);   // the mouldings under it
  slab(2 * X + 0.04, by - 0.2, 0.06, dk, 0, (by - 0.2) / 2 + 0.06, z0 + 0.05, g);
  slab(2 * X + 0.16, 0.13, 0.14, dk, 0, 0.065, z0 + 0.02, g);
  const n = 8, pw = 2 * X / n;
  for (let i = 0; i <= n; i++) { const x = -X + i * pw; slab(0.1, by - 0.2, 0.045, wal, x, (by - 0.2) / 2 + 0.06, z0, g); slab(0.14, 0.05, 0.07, wal, x, by - 0.16, z0 - 0.005, g); slab(0.13, 0.07, 0.06, wal, x, 0.165, z0 - 0.003, g); }
  for (let i = 0; i < n; i++) { const x = -X + (i + 0.5) * pw, w = pw - 0.2, h = by - 0.48, y = 0.2 + h / 2 + 0.06; slab(w, h, 0.02, pan, x, y, z0 + 0.012, g);
    for (const s of [-1, 1]) { slab(w + 0.05, 0.028, 0.035, wal, x, y + s * (h / 2 + 0.006), z0 + 0.004, g); slab(0.028, h, 0.035, wal, x + s * (w / 2 + 0.011), y, z0 + 0.004, g); } }
  for (const s of [-1, 1]) { slab(0.12, by - 0.055, z1 - z0 + 0.1, wal, s * (X + 0.04), (by - 0.055) / 2, (z0 + z1) / 2, g); }
  rod(2 * X + 0.1, 0.024, br, 0, 0.19, z0 - 0.2); for (let x = -X + 0.2; x <= X; x += 1.06) { const p = tube(0.013, 0.016, 0.19, br, x, 0.095, z0 - 0.2, g, 8); p.castShadow = false; rod(0.19, 0.011, br, x, 0.19, z0 - 0.1, 'z'); }
  // your side: the shelf under the counter, its uprights, a brass drip rail along the back edge of the top
  slab(2 * X, 0.035, z1 - z0 - 0.12, pan, 0, 0.622, (z0 + z1) / 2 + 0.06, g); for (let x = -X + 0.8; x < X; x += 1.6) slab(0.04, 0.6, z1 - z0 - 0.14, dk, x, 0.3, (z0 + z1) / 2 + 0.06, g);
  rod(2 * X, 0.006, br, 0, by + 0.006, z1 + 0.06);
  top(-X - 0.17, X + 0.17, z0 - 0.14, z1 + 0.08, by); top(-X, X, z0 + 0.15, z1, 0.64, 0.02);
  solid(-X - 0.1, X + 0.1, z0 - 0.05, z1, by); solid(-X - 0.16, -X - 0.02, z1, B, by);   // the far end returns to the wall; the near end is the way out
  slab(0.1, by - 0.055, B - z1, dk, -X - 0.09, (by - 0.055) / 2, (z1 + B) / 2, g); slab(0.42, 0.055, B - z1, wal, -X - 0.09, by - 0.0275, (z1 + B) / 2, g); top(-X - 0.3, -X + 0.12, z1, B, by);

  // ---- the back bar's cupboards: doors with brass knobs, and the opening the cash drawer runs in (bar.js)
  const D = B - bz, cy = R.backY;
  slab(2 * X, 0.1, D, dk, 0, 0.05, (bz + B) / 2, g); slab(2 * X + 0.08, 0.045, D + 0.07, wal, 0, cy - 0.0225, (bz + B) / 2 - 0.02, g); rod(2 * X + 0.08, 0.0225, wal, 0, cy - 0.0225, bz - 0.055);
  slab(2 * X, cy - 0.145, D - 0.04, dk, 0, 0.1 + (cy - 0.145) / 2, (bz + B) / 2 + 0.02, g);
  const nd = 8, dw = 2 * X / nd; for (let i = 0; i < nd; i++) { const x = -X + (i + 0.5) * dw; if (i === 5) continue; slab(dw - 0.06, cy - 0.3, 0.025, wal, x, 0.1 + (cy - 0.2) / 2, bz + 0.012, g); slab(dw - 0.2, cy - 0.44, 0.012, pan, x, 0.1 + (cy - 0.2) / 2, bz - 0.002, g); const k = new THREE.Mesh(new THREE.SphereGeometry(0.014, 10, 8), br); k.position.set(x + (i % 2 ? -1 : 1) * (dw / 2 - 0.09), 0.52, bz - 0.012); g.add(k); }
  top(-X, X, bz - 0.06, B, cy); solid(-X, X, bz, B, cy);

  // ---- above: columns, shelves, the mirror in its arch, the cornice
  const shelves = [], colX = [-3.15, -1.18, 1.18, 3.15], topY = cy + 2.5;
  for (const x of colX) { tube(0.045, 0.055, 2.3, wal, x, cy + 1.25, B - 0.2, g, 14); slab(0.15, 0.1, 0.15, dk, x, cy + 0.05, B - 0.2, g); slab(0.16, 0.07, 0.16, dk, x, cy + 2.44, B - 0.2, g); tube(0.062, 0.062, 0.03, br, x, cy + 0.12, B - 0.2, g, 14); tube(0.055, 0.055, 0.03, br, x, cy + 2.39, B - 0.2, g, 14); }
  slab(2 * X + 0.1, 2.5, 0.04, pbr('walnut', { tile: 1.4, color: 0x2a1a14, rough: 0.6 }), 0, cy + 1.25, B - 0.03, g);
  for (const sx of [-1, 1]) for (const y of [1.42, 1.86, 2.3]) { slab(1.84, 0.03, 0.25, wal, sx * 2.165, y - 0.015, B - 0.16, g); rod(1.84, 0.012, wal, sx * 2.165, y - 0.015, B - 0.285); slab(1.84, 0.012, 0.012, br, sx * 2.165, y + 0.02, B - 0.275, g); top(sx * 2.165 - 0.92, sx * 2.165 + 0.92, B - 0.28, B - 0.04, y, 0.015); shelves.push({ x0: sx * 2.165 - 0.84, x1: sx * 2.165 + 0.84, y, z: B - 0.15 }); }
  slab(2 * X + 0.36, 0.16, 0.42, wal, 0, topY + 0.08, B - 0.2, g); slab(2 * X + 0.44, 0.05, 0.48, dk, 0, topY + 0.185, B - 0.22, g); for (let x = -X; x <= X; x += 0.14) slab(0.07, 0.06, 0.05, dk, x, topY - 0.03, B - 0.41, g);
  // the mirror: silvered glass that shows the room (look.js gives it the room's own picture), a moulded frame, an arch and a carved crest over it
  const mir = new THREE.Mesh(new THREE.PlaneGeometry(2.0, 1.56), new THREE.MeshStandardMaterial({ color: 0x77746a, metalness: 1, roughness: 0.2, envMapIntensity: 0.9 })); mir.position.set(0, cy + 1.2, B - 0.06); mir.rotation.y = Math.PI; mir.userData.keep = true; g.add(mir);
  for (const s of [-1, 1]) { slab(0.09, 1.7, 0.06, wal, s * 1.045, cy + 1.2, B - 0.07, g); slab(0.03, 1.6, 0.03, br, s * 0.995, cy + 1.2, B - 0.085, g); }
  slab(2.18, 0.09, 0.06, wal, 0, cy + 0.375, B - 0.07, g); slab(2.18, 0.09, 0.06, wal, 0, cy + 2.025, B - 0.07, g); slab(2.0, 0.03, 0.03, br, 0, cy + 0.42, B - 0.085, g); slab(2.0, 0.03, 0.03, br, 0, cy + 1.98, B - 0.085, g);
  const arch = new THREE.Mesh(new THREE.TorusGeometry(1.09, 0.05, 8, 24, Math.PI), wal); arch.scale.y = 0.34; arch.position.set(0, cy + 2.07, B - 0.07); arch.castShadow = true; g.add(arch);
  const crest = new THREE.Mesh(new THREE.SphereGeometry(0.13, 14, 10), wal); crest.scale.set(1.5, 0.9, 0.35); crest.position.set(0, cy + 2.36, B - 0.07); g.add(crest);
  return { shelves, mirror: mir };
}
