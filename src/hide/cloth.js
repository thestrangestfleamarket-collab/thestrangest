// DEAD END's blanket: a sheet of points held together by its threads, that lies on the ground, drapes over a body, can be dragged by a corner, torn away, and hides what is under it from a look
import { THREE, scene } from './core.js';

function makeCloth(nx, nz, w, d, x0, z0, material) {
  const n = nx * nz, p = new Float32Array(n * 3), q = new Float32Array(n * 3), home = new Float32Array(n * 3), links = [], pins = new Map();
  const geo = new THREE.PlaneGeometry(w, d, nx - 1, nz - 1); geo.rotateX(-Math.PI / 2);
  const uv = geo.attributes.uv; for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * w / 1.1, uv.getY(i) * d / 1.1);
  const mesh = new THREE.Mesh(geo, material); mesh.castShadow = mesh.receiveShadow = true; mesh.frustumCulled = false; scene.add(mesh);
  const I = (i, j) => j * nx + i, dx = w / (nx - 1), dz = d / (nz - 1);
  for (let j = 0; j < nz; j++) for (let i = 0; i < nx; i++) { const k = I(i, j) * 3; home[k] = x0 + i * dx; home[k + 1] = .05 + .035 * Math.sin(i * 1.7) * Math.cos(j * 1.3) + .02 * Math.sin(i * .6 + j * .9); home[k + 2] = z0 - j * dz; }
  for (let j = 0; j < nz; j++) for (let i = 0; i < nx; i++) { if (i + 1 < nx) links.push(I(i, j), I(i + 1, j), dx); if (j + 1 < nz) links.push(I(i, j), I(i, j + 1), dz);
    if (i + 1 < nx && j + 1 < nz) links.push(I(i, j), I(i + 1, j + 1), Math.hypot(dx, dz), I(i + 1, j), I(i, j + 1), Math.hypot(dx, dz)); if (i + 2 < nx) links.push(I(i, j), I(i + 2, j), dx * 2); if (j + 2 < nz) links.push(I(i, j), I(i, j + 2), dz * 2); }
  const C = { mesh, n, p, pins, min: new THREE.Vector3(), max: new THREE.Vector3(), moved: 0,
    reset() { p.set(home); q.set(home); pins.clear(); C.sync(); },
    // one moment: fall, keep its threads' lengths, stay out of the ground and out of the balls (a body, hands)
    step(dt, balls) { dt = Math.min(dt, 1 / 45); const g = 9.8 * dt * dt; let moved = 0;
      for (let k = 0; k < n * 3; k += 3) { const vx = (p[k] - q[k]) * .975, vy = (p[k + 1] - q[k + 1]) * .975, vz = (p[k + 2] - q[k + 2]) * .975; q[k] = p[k]; q[k + 1] = p[k + 1]; q[k + 2] = p[k + 2]; p[k] += vx; p[k + 1] += vy - g; p[k + 2] += vz; moved += Math.abs(vx) + Math.abs(vy) + Math.abs(vz); }
      C.moved = moved / n;
      for (let it = 0; it < 4; it++) {
        for (let l = 0; l < links.length; l += 3) { const a = links[l] * 3, b = links[l + 1] * 3, r = links[l + 2], x = p[b] - p[a], y = p[b + 1] - p[a + 1], z = p[b + 2] - p[a + 2], len = Math.hypot(x, y, z) || 1e-6, f = (len - r) / len * .5;
          p[a] += x * f; p[a + 1] += y * f; p[a + 2] += z * f; p[b] -= x * f; p[b + 1] -= y * f; p[b + 2] -= z * f; }
        for (const s of balls) { const rr = s.r * s.r; if (s.up) { for (let k = 0; k < n * 3; k += 3) { const x = p[k] - s.x, z = p[k + 2] - s.z, d2 = x * x + z * z; if (d2 < rr) { const y = s.y + Math.sqrt(rr - d2); if (p[k + 1] < y) p[k + 1] = y; } } continue; } for (let k = 0; k < n * 3; k += 3) { const x = p[k] - s.x, y = p[k + 1] - s.y, z = p[k + 2] - s.z, d2 = x * x + y * y + z * z; if (d2 < rr && d2 > 1e-8) { const dd = Math.sqrt(d2), f = (s.r - dd) / dd; p[k] += x * f; p[k + 1] += y * f; p[k + 2] += z * f; } } }
        for (let k = 0; k < n * 3; k += 3) if (p[k + 1] < .03) { p[k + 1] = .03; p[k] = q[k] + (p[k] - q[k]) * .5; p[k + 2] = q[k + 2] + (p[k + 2] - q[k + 2]) * .5; }
        for (const [i, v] of pins) { p[i * 3] = v.x; p[i * 3 + 1] = v.y; p[i * 3 + 2] = v.z; }
      } C.sync(); },
    sync() { const a = geo.attributes.position; a.array.set(p); a.needsUpdate = true; geo.computeVertexNormals(); C.min.set(1e9, 1e9, 1e9); C.max.set(-1e9, -1e9, -1e9);
      for (let k = 0; k < n * 3; k += 3) { C.min.x = Math.min(C.min.x, p[k]); C.min.y = Math.min(C.min.y, p[k + 1]); C.min.z = Math.min(C.min.z, p[k + 2]); C.max.x = Math.max(C.max.x, p[k]); C.max.y = Math.max(C.max.y, p[k + 1]); C.max.z = Math.max(C.max.z, p[k + 2]); } },
    near(v, r) { let best = -1, bd = r * r; for (let i = 0; i < n; i++) { const x = p[i * 3] - v.x, y = p[i * 3 + 1] - v.y, z = p[i * 3 + 2] - v.z, d2 = x * x + y * y + z * z; if (d2 < bd) { bd = d2; best = i; } } return best; },
    rip(vx, vz) { pins.clear(); for (let k = 0; k < n * 3; k += 3) { q[k] = p[k] - vx * .016 * (.6 + Math.random() * .6); q[k + 1] = p[k + 1] - .07 * (.5 + Math.random()); q[k + 2] = p[k + 2] - vz * .016 * (.6 + Math.random() * .6); } },
    // is the cloth between two points?
    blocks(a, b) { if (Math.max(a.x, b.x) < C.min.x || Math.min(a.x, b.x) > C.max.x || Math.max(a.y, b.y) < C.min.y || Math.min(a.y, b.y) > C.max.y || Math.max(a.z, b.z) < C.min.z || Math.min(a.z, b.z) > C.max.z) return false;
      const dxr = b.x - a.x, dyr = b.y - a.y, dzr = b.z - a.z;
      const tri = (i0, i1, i2) => { const ax = p[i0 * 3], ay = p[i0 * 3 + 1], az = p[i0 * 3 + 2], e1x = p[i1 * 3] - ax, e1y = p[i1 * 3 + 1] - ay, e1z = p[i1 * 3 + 2] - az, e2x = p[i2 * 3] - ax, e2y = p[i2 * 3 + 1] - ay, e2z = p[i2 * 3 + 2] - az;
        const px = dyr * e2z - dzr * e2y, py = dzr * e2x - dxr * e2z, pz = dxr * e2y - dyr * e2x, det = e1x * px + e1y * py + e1z * pz; if (Math.abs(det) < 1e-9) return false;
        const inv = 1 / det, tx = a.x - ax, ty = a.y - ay, tz = a.z - az, u = (tx * px + ty * py + tz * pz) * inv; if (u < 0 || u > 1) return false;
        const qx = ty * e1z - tz * e1y, qy = tz * e1x - tx * e1z, qz = tx * e1y - ty * e1x, v = (dxr * qx + dyr * qy + dzr * qz) * inv; if (v < 0 || u + v > 1) return false;
        const t = (e2x * qx + e2y * qy + e2z * qz) * inv; return t > .02 && t < .97; };
      for (let j = 0; j < nz - 1; j++) for (let i = 0; i < nx - 1; i++) if (tri(I(i, j), I(i + 1, j), I(i, j + 1)) || tri(I(i + 1, j), I(i + 1, j + 1), I(i, j + 1))) return true; return false; } };
  C.reset(); return C;
}
export { makeCloth };
