// COLD BORE's external ballistics: a .338 round under drag, gravity and wind, the range card and the firing solution (no screen)
export const AMMO = { name: '.338 LAPUA MAGNUM 250 gr', mv: 905, k: 5.8e-4, sightH: 0.092 };
export const G = 9.81, SOUND = 343, ZERO = 100;
const H = 1 / 300;

// one step of a bullet {p:[x,y,z], v:[x,y,z]} through air moving at wind [x,y,z]
export function step(b, dt, w) {
  const rx = b.v[0] - w[0], ry = b.v[1] - w[1], rz = b.v[2] - w[2], s = Math.hypot(rx, ry, rz), k = AMMO.k * s;
  b.v[0] -= k * rx * dt; b.v[1] -= (k * ry + G) * dt; b.v[2] -= k * rz * dt;
  b.p[0] += b.v[0] * dt; b.p[1] += b.v[1] * dt; b.p[2] += b.v[2] * dt;
}

// flat fire down -Z from the bore, the sight line sightH above it: where the bullet is at range R (y against the sight line, x drift, time, speed)
export function fly(R, ang, cross = 0) {
  const b = { p: [0, -AMMO.sightH, 0], v: [0, Math.sin(ang) * AMMO.mv, -Math.cos(ang) * AMMO.mv] }, w = [cross, 0, 0]; let t = 0;
  while (-b.p[2] < R && t < 6) { step(b, H, w); t += H; }
  const over = (-b.p[2] - R) / Math.max(1, -b.v[2]);
  return { y: b.p[1] - b.v[1] * over, x: b.p[0] - b.v[0] * over, t: t - over, v: Math.hypot(b.v[0], b.v[1], b.v[2]) };
}
export function angleFor(R) { let a = 0; for (let i = 0; i < 6; i++) a -= fly(R, a).y / R; return a; }
export const ZERO_ANGLE = angleFor(ZERO);

// the card taped to the rifle: for each range the elevation to dial (mil), the hold for 1 m/s of full crosswind (mil), the flight time
export function card(ranges) {
  return ranges.map(R => { const a = angleFor(R), f = fly(R, a, 1); return { R, el: (a - ZERO_ANGLE) * 1000, wind: Math.abs(f.x) / R * 1000, t: f.t, v: f.v }; });
}

// the launch direction that puts a round through `to` from `from` in this wind (the check's aim, and the counter-sniper's)
export function solve(from, to, wind) {
  const aim = [to[0], to[1], to[2]], R = Math.hypot(to[0] - from[0], to[1] - from[1], to[2] - from[2]);
  let d = null;
  for (let i = 0; i < 7; i++) {
    const dx = aim[0] - from[0], dy = aim[1] - from[1], dz = aim[2] - from[2], L = Math.hypot(dx, dy, dz); d = [dx / L, dy / L, dz / L];
    const b = { p: from.slice(), v: [d[0] * AMMO.mv, d[1] * AMMO.mv, d[2] * AMMO.mv] }; let t = 0, last = null;
    while (t < 8) { last = b.p.slice(); step(b, H, wind); t += H; if (Math.hypot(b.p[0] - from[0], b.p[1] - from[1], b.p[2] - from[2]) >= R) break; }
    aim[0] += to[0] - b.p[0]; aim[1] += to[1] - b.p[1]; aim[2] += to[2] - b.p[2];
  }
  return d;
}
