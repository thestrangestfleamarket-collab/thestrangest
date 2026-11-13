// Golf-ball physics: sphere vs triangle soup, moving boxes, posts and a real cup.
// Plain numbers only (no three.js) so it stays fast and allocation-free.
export const SURF = { GREEN: 0, SAND: 1, ICE: 2, WOOD: 3, ROUGH: 4 };
const MU = [0.085, 0.62, 0.012, 0.12, 0.3]; // rolling resistance per surface
const G = 9.81;
const CELL = 0.25;
const STRIDE = 13;
const key = (ix, iz) => (ix + 4096) * 8192 + (iz + 4096);

export function makeBall(r) {
  return { x: 0, y: 0, z: 0, vx: 0, vy: 0, vz: 0, r, grounded: false, gnx: 0, gny: 1, gnz: 0,
    surf: 0, restT: 0, atRest: false, holed: false };
}

export class World {
  constructor() {
    this.t = []; this.grid = new Map(); this.boxes = []; this.cyls = []; this.cup = null;
    this.minY = Infinity; this.frameDt = 1 / 60;
  }

  // Triangle with a hint normal (winding is fixed up so the normal faces the hint).
  addTri(ax, ay, az, bx, by, bz, cx, cy, cz, surf, hx, hy, hz) {
    let nx = (by - ay) * (cz - az) - (bz - az) * (cy - ay);
    let ny = (bz - az) * (cx - ax) - (bx - ax) * (cz - az);
    let nz = (bx - ax) * (cy - ay) - (by - ay) * (cx - ax);
    const l = Math.hypot(nx, ny, nz); if (l < 1e-12) return;
    nx /= l; ny /= l; nz /= l;
    if (nx * hx + ny * hy + nz * hz < 0) {
      let t; t = bx; bx = cx; cx = t; t = by; by = cy; cy = t; t = bz; bz = cz; cz = t;
      nx = -nx; ny = -ny; nz = -nz;
    }
    this.t.push(ax, ay, az, bx, by, bz, cx, cy, cz, nx, ny, nz, surf);
    this.minY = Math.min(this.minY, ay, by, cy);
  }

  finalize() {
    const T = this.t = new Float32Array(this.t);
    this.grid.clear();
    for (let i = 0; i < T.length; i += STRIDE) {
      const x0 = Math.floor((Math.min(T[i], T[i + 3], T[i + 6]) - 0.03) / CELL);
      const x1 = Math.floor((Math.max(T[i], T[i + 3], T[i + 6]) + 0.03) / CELL);
      const z0 = Math.floor((Math.min(T[i + 2], T[i + 5], T[i + 8]) - 0.03) / CELL);
      const z1 = Math.floor((Math.max(T[i + 2], T[i + 5], T[i + 8]) + 0.03) / CELL);
      for (let ix = x0; ix <= x1; ix++) for (let iz = z0; iz <= z1; iz++) {
        const k = key(ix, iz); let a = this.grid.get(k);
        if (!a) this.grid.set(k, a = []);
        a.push(i);
      }
    }
  }

  // Highest walkable surface at (x,z) not above yMax, or -Infinity.
  heightAt(x, z, yMax = Infinity) {
    const a = this.grid.get(key(Math.floor(x / CELL), Math.floor(z / CELL)));
    let best = -Infinity; if (!a) return best;
    const T = this.t;
    for (let n = 0; n < a.length; n++) {
      const i = a[n]; if (T[i + 10] < 0.5) continue;
      const ax = T[i], az = T[i + 2], bx = T[i + 3], bz = T[i + 5], cx = T[i + 6], cz = T[i + 8];
      const d = (bz - cz) * (ax - cx) + (cx - bx) * (az - cz); if (Math.abs(d) < 1e-12) continue;
      const u = ((bz - cz) * (x - cx) + (cx - bx) * (z - cz)) / d;
      const v = ((cz - az) * (x - cx) + (ax - cx) * (z - cz)) / d;
      const w = 1 - u - v;
      if (u < -1e-4 || v < -1e-4 || w < -1e-4) continue;
      const y = u * T[i + 1] + v * T[i + 4] + w * T[i + 7];
      if (y <= yMax && y > best) best = y;
    }
    return best;
  }

  // Call once per frame after animated meshes have updated their world matrices.
  updateMovers(dt) {
    this.frameDt = Math.max(dt, 1e-4);
    for (const b of this.boxes) {
      const e = b.mesh.matrixWorld.elements;
      if (!b.cur) { b.cur = new Float64Array(e); b.prev = new Float64Array(e); }
      else { b.prev.set(b.cur); b.cur.set(e); }
    }
  }

  step(ball, dt, ev) {
    const sp = Math.hypot(ball.vx, ball.vy, ball.vz);
    const hMax = Math.min(1 / 240, ball.r * 0.5 / Math.max(sp, 1e-3));
    const n = Math.min(96, Math.max(1, Math.ceil(dt / hMax)));
    const h = dt / n;
    for (let i = 0; i < n; i++) this._sub(ball, h, ev);
  }

  _contact(b, nx, ny, nz, depth, e, surf, vcx, vcy, vcz, ev, kind) {
    b.x += nx * depth; b.y += ny * depth; b.z += nz * depth;
    let rx = b.vx - vcx, ry = b.vy - vcy, rz = b.vz - vcz;
    const vn = rx * nx + ry * ny + rz * nz;
    const ground = ny > 0.6;
    if (vn < 0) {
      let ee = e;
      if (ground && kind !== 'bumper') ee = -vn > 0.7 ? 0.36 : 0;
      else if (-vn < 0.12) ee = 0;
      const j = (1 + ee) * vn;
      rx -= j * nx; ry -= j * ny; rz -= j * nz;
      if (!ground && -vn > 0.12) { rx *= 0.985; ry *= 0.985; rz *= 0.985; }
      if (kind === 'bumper' && -vn > 0.1) { rx += nx * 0.9; rz += nz * 0.9; }
      b.vx = rx + vcx; b.vy = ry + vcy; b.vz = rz + vcz;
      if (-vn > ev.impact) { ev.impact = -vn; ev.kind = ground && kind === 'wall' ? 'ground' : kind; }
    }
    if (ground) { b.grounded = true; b.gnx = nx; b.gny = ny; b.gnz = nz; b.surf = surf; }
  }

  _tri(b, i, ev) {
    const T = this.t, px = b.x, py = b.y, pz = b.z;
    const ax = T[i], ay = T[i + 1], az = T[i + 2];
    const abx = T[i + 3] - ax, aby = T[i + 4] - ay, abz = T[i + 5] - az;
    const acx = T[i + 6] - ax, acy = T[i + 7] - ay, acz = T[i + 8] - az;
    const nx = T[i + 9], ny = T[i + 10], nz = T[i + 11];
    const apx = px - ax, apy = py - ay, apz = pz - az;
    const side = apx * nx + apy * ny + apz * nz;
    if (side < 0 || side > b.r) return;
    let qx, qy, qz;
    const d1 = abx * apx + aby * apy + abz * apz, d2 = acx * apx + acy * apy + acz * apz;
    if (d1 <= 0 && d2 <= 0) { qx = ax; qy = ay; qz = az; }
    else {
      const bpx = apx - abx, bpy = apy - aby, bpz = apz - abz;
      const d3 = abx * bpx + aby * bpy + abz * bpz, d4 = acx * bpx + acy * bpy + acz * bpz;
      if (d3 >= 0 && d4 <= d3) { qx = ax + abx; qy = ay + aby; qz = az + abz; }
      else {
        const vc = d1 * d4 - d3 * d2;
        if (vc <= 0 && d1 >= 0 && d3 <= 0) { const v = d1 / (d1 - d3); qx = ax + abx * v; qy = ay + aby * v; qz = az + abz * v; }
        else {
          const cpx = apx - acx, cpy = apy - acy, cpz = apz - acz;
          const d5 = abx * cpx + aby * cpy + abz * cpz, d6 = acx * cpx + acy * cpy + acz * cpz;
          if (d6 >= 0 && d5 <= d6) { qx = ax + acx; qy = ay + acy; qz = az + acz; }
          else {
            const vb = d5 * d2 - d1 * d6;
            if (vb <= 0 && d2 >= 0 && d6 <= 0) { const w = d2 / (d2 - d6); qx = ax + acx * w; qy = ay + acy * w; qz = az + acz * w; }
            else {
              const va = d3 * d6 - d5 * d4;
              if (va <= 0 && (d4 - d3) >= 0 && (d5 - d6) >= 0) {
                const w = (d4 - d3) / ((d4 - d3) + (d5 - d6));
                qx = ax + abx + (acx - abx) * w; qy = ay + aby + (acy - aby) * w; qz = az + abz + (acz - abz) * w;
              } else {
                const dn = 1 / (va + vb + vc), v = vb * dn, w = vc * dn;
                qx = ax + abx * v + acx * w; qy = ay + aby * v + acy * w; qz = az + abz * v + acz * w;
              }
            }
          }
        }
      }
    }
    const dx = px - qx, dy = py - qy, dz = pz - qz;
    const d2s = dx * dx + dy * dy + dz * dz;
    if (d2s >= b.r * b.r) return;
    const surf = T[i + 12];
    const c = this.cup;
    if (c && surf === SURF.GREEN && Math.abs(qy - c.y) < 0.06) {
      const hx = qx - c.x, hz = qz - c.z;
      if (hx * hx + hz * hz < c.r * c.r) return; // the hole in the green
    }
    const dist = Math.sqrt(d2s);
    if (dist > 1e-7) this._contact(b, dx / dist, dy / dist, dz / dist, b.r - dist, 0.74, surf, 0, 0, 0, ev, 'wall');
    else this._contact(b, nx, ny, nz, b.r, 0.74, surf, 0, 0, 0, ev, 'wall');
  }

  _box(b, bx, ev) {
    const m = bx.cur; if (!m) return;
    const tx = b.x - m[12], ty = b.y - m[13], tz = b.z - m[14];
    const lx = m[0] * tx + m[1] * ty + m[2] * tz;
    const ly = m[4] * tx + m[5] * ty + m[6] * tz;
    const lz = m[8] * tx + m[9] * ty + m[10] * tz;
    const hx = bx.half[0], hy = bx.half[1], hz = bx.half[2], r = b.r;
    if (Math.abs(lx) > hx + r || Math.abs(ly) > hy + r || Math.abs(lz) > hz + r) return;
    let qx = Math.max(-hx, Math.min(hx, lx)), qy = Math.max(-hy, Math.min(hy, ly)), qz = Math.max(-hz, Math.min(hz, lz));
    let dx = lx - qx, dy = ly - qy, dz = lz - qz;
    let d2 = dx * dx + dy * dy + dz * dz, depth;
    if (d2 > r * r) return;
    if (d2 < 1e-12) { // centre inside: push out through nearest face
      const ex = hx - Math.abs(lx), ey = hy - Math.abs(ly), ez = hz - Math.abs(lz);
      dx = dy = dz = 0;
      if (ex <= ey && ex <= ez) { dx = Math.sign(lx) || 1; depth = ex + r; qx = dx * hx; }
      else if (ey <= ez) { dy = Math.sign(ly) || 1; depth = ey + r; qy = dy * hy; }
      else { dz = Math.sign(lz) || 1; depth = ez + r; qz = dz * hz; }
    } else { const d = Math.sqrt(d2); dx /= d; dy /= d; dz /= d; depth = r - d; }
    const nx = m[0] * dx + m[4] * dy + m[8] * dz, ny = m[1] * dx + m[5] * dy + m[9] * dz, nz = m[2] * dx + m[6] * dy + m[10] * dz;
    const p = bx.prev, f = 1 / this.frameDt;
    const vcx = ((m[0] - p[0]) * qx + (m[4] - p[4]) * qy + (m[8] - p[8]) * qz + m[12] - p[12]) * f;
    const vcy = ((m[1] - p[1]) * qx + (m[5] - p[5]) * qy + (m[9] - p[9]) * qz + m[13] - p[13]) * f;
    const vcz = ((m[2] - p[2]) * qx + (m[6] - p[6]) * qy + (m[10] - p[10]) * qz + m[14] - p[14]) * f;
    this._contact(b, nx, ny, nz, depth, bx.e ?? 0.6, SURF.WOOD, vcx, vcy, vcz, ev, 'obstacle');
  }

  _cyl(b, c, ev) {
    const dx = b.x - c.x, dz = b.z - c.z, r = b.r;
    const dh = Math.hypot(dx, dz);
    if (dh > c.r + r || b.y < c.y0 - r || b.y > c.y1 + r) return;
    if (b.y > c.y1) {
      if (dh < c.r) this._contact(b, 0, 1, 0, r - (b.y - c.y1), 0.4, SURF.WOOD, 0, 0, 0, ev, 'obstacle');
      else {
        const qx = c.x + dx / dh * c.r, qz = c.z + dz / dh * c.r;
        const ex = b.x - qx, ey = b.y - c.y1, ez = b.z - qz, d = Math.hypot(ex, ey, ez);
        if (d < r && d > 1e-7) this._contact(b, ex / d, ey / d, ez / d, r - d, c.e, SURF.WOOD, 0, 0, 0, ev, c.kind);
      }
    } else if (dh > 1e-7) {
      this._contact(b, dx / dh, 0, dz / dh, c.r + r - dh, c.e, SURF.WOOD, 0, 0, 0, ev, c.kind);
    }
  }

  _cup(b, ev) {
    const c = this.cup, r = b.r;
    const dx = b.x - c.x, dz = b.z - c.z, dh = Math.hypot(dx, dz);
    if (dh >= c.r || b.y > c.y + r) return;
    if (b.y >= c.y) { // rolling over the lip
      if (dh > 1e-6) {
        const qx = c.x + dx / dh * c.r, qz = c.z + dz / dh * c.r;
        const ex = b.x - qx, ey = b.y - c.y, ez = b.z - qz, d = Math.hypot(ex, ey, ez);
        if (d < r && d > 1e-7) this._contact(b, ex / d, ey / d, ez / d, r - d, 0.3, SURF.GREEN, 0, 0, 0, ev, 'cup');
      }
    } else { // inside the cup
      if (dh > c.r - r && dh > 1e-6) this._contact(b, -dx / dh, 0, -dz / dh, dh - (c.r - r), 0.35, SURF.WOOD, 0, 0, 0, ev, 'cup');
      const floor = c.y - c.depth;
      if (b.y - r < floor) this._contact(b, 0, 1, 0, floor - (b.y - r), 0.25, SURF.SAND, 0, 0, 0, ev, 'cup');
      if (b.y < c.y - r * 0.9) b.holed = true;
    }
  }

  _sub(b, h, ev) {
    b.vy -= G * h;
    b.x += b.vx * h; b.y += b.vy * h; b.z += b.vz * h;
    b.grounded = false;
    const r = b.r;
    for (let it = 0; it < 2; it++) {
      const x0 = Math.floor((b.x - r) / CELL), x1 = Math.floor((b.x + r) / CELL);
      const z0 = Math.floor((b.z - r) / CELL), z1 = Math.floor((b.z + r) / CELL);
      for (let ix = x0; ix <= x1; ix++) for (let iz = z0; iz <= z1; iz++) {
        const a = this.grid.get(key(ix, iz)); if (!a) continue;
        for (let n = 0; n < a.length; n++) this._tri(b, a[n], ev);
      }
      for (let n = 0; n < this.boxes.length; n++) this._box(b, this.boxes[n], ev);
      for (let n = 0; n < this.cyls.length; n++) this._cyl(b, this.cyls[n], ev);
      if (this.cup) this._cup(b, ev);
    }
    const s = Math.hypot(b.vx, b.vy, b.vz);
    if (b.grounded) {
      const dec = MU[b.surf] * G * h;
      if (s <= dec) { b.vx = b.vy = b.vz = 0; }
      else { const k = (s - dec) / s; b.vx *= k; b.vy *= k; b.vz *= k; }
      if (s < 0.025) b.restT += h; else b.restT = 0;
    } else b.restT = 0;
    b.atRest = b.restT > 0.3;
  }
}
