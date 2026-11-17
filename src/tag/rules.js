// SENSOR TAG's rules and where a beam lands: ten lives, one shot a second, only the chest sensor counts; no screen or network here
export const RULES = { LIVES: 10, RATE: 1000 };

export class Player {
  constructor(rules = RULES) { this.R = rules; this.on = () => {}; this.reset(); }
  reset() { this.phase = 'u'; this.lives = 0; this.tags = 0; this.lastFire = -1e12; }
  start() { this.reset(); this.phase = 'n'; this.lives = this.R.LIVES; }
  get playing() { return this.phase === 'n'; }
  pull(now) { if (this.phase === 'o' || now - this.lastFire < this.R.RATE) return false; this.lastFire = now; return true; }
  charge(now) { return Math.max(0, Math.min(1, (now - this.lastFire) / this.R.RATE)); }
  hit() {
    if (!this.playing) return false;
    this.lives--; this.on('hit');
    if (this.lives <= 0) { this.lives = 0; this.phase = 'o'; this.on('out'); }
    return true;
  }
  good() { if (this.playing) this.tags++; }
  view() { return { ph: this.phase, l: this.lives, k: this.tags }; }
}

// the body under a headset (metres): the sensor on the chest, a torso behind it, a head, and a ball round each hand
export const BODY = { DROP: 0.34, FWD: 0.06, W: 0.26, H: 0.2, HAND: 0.1, TORSO: 0.15, BACK: 0.1, HEAD: 0.12, TOP: 0.16, LEN: 0.8 };
const B = BODY, fwd = (yaw) => [-Math.sin(yaw), 0, -Math.cos(yaw)];
export const wrap = (a) => Math.atan2(Math.sin(a), Math.cos(a));
export const sensorAt = (head, yaw) => { const f = fwd(yaw); return [head[0] + f[0] * B.FWD, head[1] - B.DROP, head[2] + f[2] * B.FWD]; };

// the chest turns with the head only past a glance to the side, then settles under it
export function follow(by, hy, dt) {
  const M = 0.6; let d = wrap(hy - by);
  if (d > M) by = hy - M; else if (d < -M) by = hy + M;
  return wrap(by + wrap(hy - by) * (1 - Math.exp(-dt * 1.5)));
}

function sphere(o, d, c, r) {
  const x = o[0] - c[0], y = o[1] - c[1], z = o[2] - c[2], b = x * d[0] + y * d[1] + z * d[2], cc = x * x + y * y + z * z - r * r;
  if (cc < 0) return 0;
  const q = b * b - cc; if (q < 0) return Infinity;
  const t = -b - Math.sqrt(q); return t < 0 ? Infinity : t;
}
function column(o, d, ax, az, y0, y1, r) {
  const x = o[0] - ax, z = o[2] - az, a = d[0] * d[0] + d[2] * d[2]; if (a < 1e-9) return Infinity;
  const b = x * d[0] + z * d[2], q = b * b - a * (x * x + z * z - r * r); if (q < 0) return Infinity;
  const t = (-b - Math.sqrt(q)) / a; if (t < 0) return Infinity;
  const y = o[1] + d[1] * t; return y < y0 || y > y1 ? Infinity : t;
}

// a beam from o along d (unit) at a body { head, yaw, hands }: what it reaches first ('sensor', 'hand', 'body' or '') and how far
export function judge(o, d, b) {
  const f = fwd(b.yaw), c = sensorAt(b.head, b.yaw);
  let ts = Infinity; const dn = d[0] * f[0] + d[2] * f[2];
  if (dn < -0.05) {
    const t = ((c[0] - o[0]) * f[0] + (c[2] - o[2]) * f[2]) / dn;
    if (t > 0) { const px = o[0] + d[0] * t - c[0], py = o[1] + d[1] * t - c[1], pz = o[2] + d[2] * t - c[2], u = pz * f[0] - px * f[2];
      if (Math.abs(u) <= B.W / 2 && Math.abs(py) <= B.H / 2) ts = t; }
  }
  let tb = Infinity, kb = '';
  for (const h of b.hands || []) { const t = sphere(o, d, h, B.HAND); if (t < tb) { tb = t; kb = 'hand'; } }
  const ax = b.head[0] - f[0] * B.BACK, az = b.head[2] - f[2] * B.BACK;
  let t = sphere(o, d, [ax, b.head[1], az], B.HEAD); if (t < tb) { tb = t; kb = 'body'; }
  t = column(o, d, ax, az, b.head[1] - B.LEN, b.head[1] - B.TOP, B.TORSO); if (t < tb) { tb = t; kb = 'body'; }
  if (ts < tb) return { k: 'sensor', d: ts };
  return tb < Infinity ? { k: kb, d: tb } : { k: '', d: 25 };
}

// is a hand held in front of the sensor (the panel is drawn faint then, so the real hand shows)
export function covered(head, yaw, hands) {
  const f = fwd(yaw), c = sensorAt(head, yaw);
  return (hands || []).some((h) => { const x = h[0] - c[0], y = h[1] - c[1], z = h[2] - c[2], n = x * f[0] + z * f[2], u = z * f[0] - x * f[2];
    return n > -0.02 && n < 0.35 && Math.abs(u) < B.W / 2 + 0.05 && Math.abs(y) < B.H / 2 + 0.05; });
}
