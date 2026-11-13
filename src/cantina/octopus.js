// THE CANTINA's drummer: THE MARKET's octopus (src/125, 126, 127) for this page; body units x forward, y left, z up, 26 to the metre.
import * as THREE from 'three';

const E = (x, y, z, rx, ry, rz, c, yaw = 0, pit = 0, rol = 0, grp) => [x, y, z, rx, ry, rz, yaw, pit, rol, c, grp];
const OCTP = { b: [150, 88, 196], B: [104, 58, 142], m: [214, 176, 236], M: [124, 70, 166], k: [18, 16, 22], w: [236, 236, 250], s: [218, 184, 124], h: [52, 54, 62], H: [76, 78, 88], e: [18, 16, 22],
  c: [92, 58, 34], C: [132, 86, 50], E: [255, 120, 40], a: [150, 146, 140], g: [196, 212, 220], G: [236, 244, 248], q: [70, 130, 176], Q: [150, 200, 228], r: [206, 60, 40], R: [236, 196, 64], y: [176, 132, 80] };
const OCTSEAT = 13, OCTS = 1.25;
export const UNITS = 26;

// where each drum is, in body units: kick, snare, tom, tom, floor tom, hi-hat, crash, ride
export const OCTD = [[24, 0, 6], [15, 9, 21], [22, 4.5, 30], [22, -5, 30], [14, -12.5, 18], [15, 16.5, 24], [25, 14, 41], [25, -15, 38]];

function octArm(L, r, t, bw, r0 = 3, r1 = 1, n = 11, g = 40) {
  const P = (u) => { const a = (1 - u) * (1 - u), b = 2 * u * (1 - u), c = u * u; return [a * r[0] + b * bw[0] + c * t[0], a * r[1] + b * bw[1] + c * t[1], a * r[2] + b * bw[2] + c * t[2]]; };
  for (let i = 0; i < n; i++) {
    const u0 = i / n, u1 = (i + 1) / n, p = P(u0), q = P(u1), dx = q[0] - p[0], dy = q[1] - p[1], dz = q[2] - p[2], len = Math.hypot(dx, dy, dz) || 1, rad = r0 + (r1 - r0) * (i + .5) / n;
    const yaw = Math.atan2(dy, dx), pit = Math.atan2(dz, Math.hypot(dx, dy));
    L.push(E((p[0] + q[0]) / 2, (p[1] + q[1]) / 2, (p[2] + q[2]) / 2, len / 2 + rad * .55, rad, rad, 'b', yaw, pit, 0, g));
  }
}
function octStick(L, t, aim) {
  const dx = aim[0] - t[0], dy = aim[1] - t[1], dz = aim[2] - t[2], l = Math.hypot(dx, dy, dz) || 1, k = 8 / l;
  L.push(E(t[0] + dx * k, t[1] + dy * k, t[2] + dz * k, 8, .75, .75, 's', Math.atan2(dy, dx), Math.atan2(dz, Math.hypot(dx, dy)), 0, 50));
}
function octBody(A) {
  const L = [], D = [], z0 = OCTSEAT, nod = A.nod || 0;
  const root = (a) => [Math.cos(a) * 4.3 * OCTS, Math.sin(a) * 4.3 * OCTS, z0 + 5 * OCTS];
  let ai = 0;
  const arm = (a, tip, bow, r0, r1) => octArm(L, root(a), tip, bow, r0 * OCTS, r1 * OCTS, 11, 40 + ai++);
  if (A.XA) { arm(2.2, A.XA[0], [6, 14, z0 + 11], 2.8, 1.1); octStick(L, A.XA[0], A.XA[1]); }
  if (A.XB) { arm(-2.2, A.XB[0], [6, -14, z0 + 11], 2.8, 1.1); octStick(L, A.XB[0], A.XB[1]); }
  const cg = A.CG; arm(2.8, cg, [-6, 15, z0 + 2], 2.8, 1);
  { const a = A.CGA, l = Math.hypot(...a), u = [a[0] / l, a[1] / l, a[2] / l], yaw = Math.atan2(u[1], u[0]), pit = Math.atan2(u[2], Math.hypot(u[0], u[1]));
    L.push(E(cg[0] + u[0] * 3.4, cg[1] + u[1] * 3.4, cg[2] + u[2] * 3.4, 4.4, 1.15, 1.15, 'c', yaw, pit, 0, 62));
    L.push(E(cg[0] + u[0] * 7.4, cg[1] + u[1] * 7.4, cg[2] + u[2] * 7.4, .7, 1.1, 1.1, 'E', yaw, pit, 0, 62)); }
  const gl = A.GL; arm(-2.8, gl, [-6, -15, z0 + 2], 2.8, 1);
  L.push(E(gl[0] + 2.2, gl[1], gl[2] + 3, 2.3, 2.3, 3.5, 'glass', 0, A.GLP || 0, 0, 63));
  L.push(E(gl[0] + 2.2, gl[1], gl[2] + 1.6, 1.9, 1.9, 1.8, 'whisky', 0, A.GLP || 0, 0, 63));
  arm(-.55, A.RF, [8, -4, z0 - 1], 2.9, 1.1); arm(.55, A.LF, [8, 6, z0 - 1], 2.9, 1.1);
  const [lt, la] = A.LS, [rt, ra] = A.RS;
  arm(1.1, lt, [7, 10, z0 + 14], 3, 1.2); octStick(L, lt, la); arm(-1.1, rt, [7, -10, z0 + 14], 3, 1.2); octStick(L, rt, ra);
  const hz = z0 + 10 * OCTS + nod * .6, K = OCTS;
  L.push(E(1.3 * K, 0, hz, 6.4 * K, 7.2 * K, 5.5 * K, 'b', 0, 0, 0, 42));
  L.push(E(-2.6 * K, 0, hz + 9.4 * K, 7.7 * K, 8.1 * K, 10.6 * K, 'b', 0, -.32 + nod * .04, 0, 42));
  L.push(E(-3.6 * K, 0, hz + 14.3 * K, 7.9 * K, 8.3 * K, 7 * K, 'h', 0, -.32, 0, 43)); L.push(E(-2.9 * K, 0, hz + 11.4 * K, 8.1 * K, 8.5 * K, 2.3 * K, 'H', 0, -.32, 0, 44));
  L.push(E(4.8 * K, 0, hz + 1.2 * K, 2.8 * K, 7.2 * K, 2.1 * K, 'k', 0, 0, 0, 45));   // sunglasses
  D.push([7.4 * K, 3.1 * K, hz + 1.9 * K, 'w'], [7.4 * K, -3.8 * K, hz + 1.9 * K, 'w']);
  D.push([3.4 * K, 4.7 * K, hz + 12 * K, 'M'], [3.8 * K, -2.6 * K, hz + 15 * K, 'M'], [2.4 * K, .9 * K, hz + 18 * K, 'M']);
  return { E: L, D };
}
function octArms(p) {
  const sh = [[4, 7, 26], [4, -7, 26], [-1, 12, 20], [-1, -12, 20]];
  const hand = (h, [i, k]) => { const D = OCTD[i], S = sh[h === 'L' ? 0 : 1], v = [S[0] - D[0], S[1] - D[1], S[2] - D[2]], l = Math.hypot(...v) || 1, kk = k / 3;
    const tip = [D[0] + v[0] / l * 14, D[1] + v[1] / l * 14, D[2] + v[2] / l * 14 + 1], up = [tip[0] - 2, tip[1], tip[2] + 10], aimUp = [D[0], D[1], D[2] + 16];
    return [[tip[0] + (up[0] - tip[0]) * kk, tip[1] + (up[1] - tip[1]) * kk, tip[2] + (up[2] - tip[2]) * kk], [D[0], D[1], D[2] + 1 + (aimUp[2] - D[2] - 1) * kk]]; };
  const side = (s, ix) => { const D = OCTD[s[0]], S = sh[ix], v = [S[0] - D[0], S[1] - D[1], S[2] - D[2]], l = Math.hypot(...v) || 1, kk = s[1] / 3, tip = [D[0] + v[0] / l * 14, D[1] + v[1] / l * 14, D[2] + v[2] / l * 14 + 1];
    return [[tip[0] - 2 * kk, tip[1], tip[2] + 10 * kk], [D[0], D[1], D[2] + 1 + 15 * kk]]; };
  const kd = OCTD[0], hd = OCTD[5], Z = OCTSEAT, mix = (a, b, k) => a.map((v, j) => v + (b[j] - v) * k);
  return { LS: hand('L', p.L), RS: hand('R', p.R), RF: [kd[0] - 5, kd[1] - 3, p.kick ? 1 : 4], LF: [hd[0] - 1, hd[1], p.hat ? 4 : 1], nod: p.nod * 2,
    XA: side(p.A, 2), XB: side(p.B, 3),
    CG: mix([1, 15 * OCTS, Z + 9], [9.4, 2.6, Z + 10], p.puff), CGA: mix([.5, 1, .55], [.45, 1, .05], p.puff),
    GL: mix([1, -15 * OCTS, Z + 7], [8.2, -5.2, Z + 6], p.sip), GLP: p.sip * .55 };
}

// The octopus as one instanced mesh; +Z is the way he faces. g.userData.draw(pose) moves him.
export const REST = { L: [1, 3], R: [4, 3], A: [6, 3], B: [5, 3], puff: 0, sip: 0, kick: 0, hat: 0, nod: 0 };
export function makeOctopus() {
  const g = new THREE.Group();
  g.scale.setScalar(1 / UNITS);
  const skin = new THREE.MeshPhysicalMaterial({ roughness: 0.38, clearcoat: 0.55, clearcoatRoughness: 0.35, sheen: 0.12, sheenColor: 0xd8b0ff });
  const geo = new THREE.SphereGeometry(1, 18, 12), im = new THREE.InstancedMesh(geo, skin, 150);
  im.instanceMatrix.setUsage(THREE.DynamicDrawUsage); im.castShadow = im.receiveShadow = true; im.frustumCulled = false;
  const extra = {
    glass: new THREE.Mesh(geo, new THREE.MeshPhysicalMaterial({ color: 0xffffff, roughness: 0.05, transparent: true, opacity: 0.35 })),
    whisky: new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ color: 0xb8650f, roughness: 0.2, emissive: 0x3a1a00 })),
    E: new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ color: 0xff7a28 })),
  };
  for (const k in extra) { extra[k].matrixAutoUpdate = false; g.add(extra[k]); }
  g.add(im);
  const col = new THREE.Color(), M4 = new THREE.Matrix4(), Q = new THREE.Quaternion(), EU = new THREE.Euler(0, 0, 0, 'YXZ'), P3 = new THREE.Vector3(), S3 = new THREE.Vector3();
  g.userData.draw = (pose) => {
    const B = octBody(octArms(pose));
    let i = 0;
    const place = (x, y, z, rx, ry, rz, yaw, pit, rol, c) => {
      P3.set(y, z, x); EU.set(-pit, yaw, rol); Q.setFromEuler(EU); S3.set(ry, rz, rx); M4.compose(P3, Q, S3);
      if (extra[c]) { extra[c].matrix.copy(M4); return; }
      if (i >= 150) return;
      im.setMatrixAt(i, M4);
      const rgb = OCTP[c] || OCTP.b; col.setRGB(rgb[0] / 255, rgb[1] / 255, rgb[2] / 255, THREE.SRGBColorSpace); im.setColorAt(i, col); i++;
    };
    for (const e of B.E) place(e[0], e[1], e[2], e[3], e[4], e[5], e[6], e[7], e[8], e[9]);
    for (const [x, y, z, c] of B.D) place(x, y, z, .7, .7, .7, 0, 0, 0, c);
    im.count = i; im.instanceMatrix.needsUpdate = true; if (im.instanceColor) im.instanceColor.needsUpdate = true;
  };
  g.userData.draw(REST);
  return g;
}
