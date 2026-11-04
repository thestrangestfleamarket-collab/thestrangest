// THE BODIES' BAKE: node tools/bodies-bake.mjs → data/full/bodies-ual.json (then python3 tools/rig-rebake.py players → data/bodies.json). The six player bodies (A–F) built from rounded shapes on the UAL skeleton (data/ual.json's rig, its rest turns kept so its clips play on them), clothed, haired and faced, cut down with meshoptimizer, in SKIN's format.
import * as THREE from '../node_modules/three/build/three.module.js';
import { MeshoptSimplifier as MS } from 'meshoptimizer';
import fs from 'fs';

const V = (x, y, z) => new THREE.Vector3(x, y, z);
const clamp = (x, a, b) => Math.max(a, Math.min(b, x));
const smin = (a, b, k) => { if (k <= 0) return Math.min(a, b); const h = clamp(.5 + .5 * (b - a) / k, 0, 1); return b * (1 - h) + a * h - k * h * (1 - h); };
const smax = (a, b, k) => -smin(-a, -b, k);
const tag = (d, f) => { f.d = d; return f; };
const ell = (c, r) => tag({ t: 'e', c: c.clone(), r: r.clone() }, (x, y, z) => { const px = (x - c.x) / r.x, py = (y - c.y) / r.y, pz = (z - c.z) / r.z, k0 = Math.hypot(px, py, pz), k1 = Math.hypot(px / r.x, py / r.y, pz / r.z); return k1 < 1e-9 ? -Math.min(r.x, r.y, r.z) : k0 * (k0 - 1) / k1; });
const cap = (a, b, ra, rb) => { const ab = b.clone().sub(a), L2 = ab.lengthSq() || 1e-12; return tag({ t: 'c', a: a.clone(), b: b.clone(), ra, rb }, (x, y, z) => { const px = x - a.x, py = y - a.y, pz = z - a.z, t = clamp((px * ab.x + py * ab.y + pz * ab.z) / L2, 0, 1); return Math.hypot(px - ab.x * t, py - ab.y * t, pz - ab.z * t) - (ra + (rb - ra) * t); }); };
const rbox = (c, h, r) => tag({ t: 'b', c: c.clone(), r: h.clone() }, (x, y, z) => { const qx = Math.abs(x - c.x) - h.x + r, qy = Math.abs(y - c.y) - h.y + r, qz = Math.abs(z - c.z) - h.z + r; return Math.hypot(Math.max(qx, 0), Math.max(qy, 0), Math.max(qz, 0)) + Math.min(Math.max(qx, qy, qz), 0) - r; });
const plane = (p, n) => { n = n.clone().normalize(); return (x, y, z) => (x - p.x) * n.x + (y - p.y) * n.y + (z - p.z) * n.z; };

// surface nets: a smooth closed surface where f = 0, its points pulled onto it
function nets(f, lo, hi, h) {
  const nx = Math.ceil((hi.x - lo.x) / h) + 1, ny = Math.ceil((hi.y - lo.y) / h) + 1, nz = Math.ceil((hi.z - lo.z) / h) + 1, I = (i, j, k) => i + nx * (j + ny * k);
  const F = new Float32Array(nx * ny * nz); for (let k = 0; k < nz; k++) for (let j = 0; j < ny; j++) for (let i = 0; i < nx; i++) F[I(i, j, k)] = f(lo.x + i * h, lo.y + j * h, lo.z + k * h);
  const vid = new Int32Array(nx * ny * nz).fill(-1), P = [];
  const C = [[0, 0, 0], [1, 0, 0], [0, 1, 0], [1, 1, 0], [0, 0, 1], [1, 0, 1], [0, 1, 1], [1, 1, 1]], E = [[0, 1], [2, 3], [4, 5], [6, 7], [0, 2], [1, 3], [4, 6], [5, 7], [0, 4], [1, 5], [2, 6], [3, 7]];
  for (let k = 0; k < nz - 1; k++) for (let j = 0; j < ny - 1; j++) for (let i = 0; i < nx - 1; i++) {
    const v = C.map(c => F[I(i + c[0], j + c[1], k + c[2])]); let neg = 0; for (const a of v) if (a < 0) neg++; if (!neg || neg === 8) continue;
    let sx = 0, sy = 0, sz = 0, n = 0; for (const [a, b] of E) if ((v[a] < 0) !== (v[b] < 0)) { const t = v[a] / (v[a] - v[b]), ca = C[a], cb = C[b]; sx += ca[0] + (cb[0] - ca[0]) * t; sy += ca[1] + (cb[1] - ca[1]) * t; sz += ca[2] + (cb[2] - ca[2]) * t; n++; }
    vid[I(i, j, k)] = P.length / 3; P.push(lo.x + (i + sx / n) * h, lo.y + (j + sy / n) * h, lo.z + (k + sz / n) * h);
  }
  const idx = [];
  for (let k = 1; k < nz - 1; k++) for (let j = 1; j < ny - 1; j++) for (let i = 1; i < nx - 1; i++) { const a = F[I(i, j, k)];
    for (let ax = 0; ax < 3; ax++) { const ii = i + (ax === 0), jj = j + (ax === 1), kk = k + (ax === 2); if (ii >= nx || jj >= ny || kk >= nz) continue; const b = F[I(ii, jj, kk)]; if ((a < 0) === (b < 0)) continue;
      let q = ax === 0 ? [I(i, j - 1, k - 1), I(i, j, k - 1), I(i, j, k), I(i, j - 1, k)] : ax === 1 ? [I(i - 1, j, k - 1), I(i - 1, j, k), I(i, j, k), I(i, j, k - 1)] : [I(i - 1, j - 1, k), I(i, j - 1, k), I(i, j, k), I(i - 1, j, k)];
      q = q.map(x => vid[x]); if (q.some(x => x < 0)) continue; if (a > 0) q.reverse(); idx.push(q[0], q[1], q[2], q[0], q[2], q[3]); } }
  const e = h * .5; for (let v = 0; v < P.length / 3; v++) { const x = P[3 * v], y = P[3 * v + 1], z = P[3 * v + 2], gx = f(x + e, y, z) - f(x - e, y, z), gy = f(x, y + e, z) - f(x, y - e, z), gz = f(x, y, z + e) - f(x, y, z - e), L = Math.hypot(gx, gy, gz) || 1, d = f(x, y, z); P[3 * v] -= gx / L * d; P[3 * v + 1] -= gy / L * d; P[3 * v + 2] -= gz / L * d; }
  return { P: new Float32Array(P), I: new Uint32Array(idx) };
}

// cut a part down to about `tris` triangles, its hems kept where they are
function slim(m, tris, err = .02) {
  const tgt = Math.min(m.I.length, tris * 3), out = MS.simplify(m.I, m.P, 3, tgt, err, ['LockBorder'])[0];
  const used = new Int32Array(m.P.length / 3).fill(-1), P = [], I = new Uint32Array(out.length); let n = 0;
  for (let i = 0; i < out.length; i++) { const v = out[i]; if (used[v] < 0) { used[v] = n++; P.push(m.P[3 * v], m.P[3 * v + 1], m.P[3 * v + 2]); } I[i] = used[v]; }
  return { P: new Float32Array(P), I };
}

// the skeleton: the UAL rig's bones and rest turns; each body's joints put where its own sizes want them, along the rig's own directions
const UAL = JSON.parse(fs.readFileSync('data/ual.json')).ual, RIG = UAL.rig, NAMES = RIG.names, PAR = RIG.parent, NB = NAMES.length, ix = n => NAMES.indexOf(n);
const restW = (() => { const B = NAMES.map((n, i) => { const b = new THREE.Bone(); b.position.fromArray(RIG.t[i]); b.quaternion.fromArray(RIG.q[i]); return b; }); PAR.forEach((p, i) => { if (p >= 0) B[p].add(B[i]); }); B[0].updateMatrixWorld(true);
  return B.map(b => ({ p: b.getWorldPosition(new THREE.Vector3()), q: b.getWorldQuaternion(new THREE.Quaternion()) })); })();
const UH = UAL.tall, ARM = 48 * Math.PI / 180;

function joints(p) {
  const H = p.H, hh = H / p.heads, s = H / UH, J = {};
  const chinY = H - hh, neckTop = chinY + hh * .12, neckBase = chinY - p.neck * H, shY = neckBase - p.shDrop * H, pelY = p.leg * H + .035 * H, ankY = .045 * H;
  const want = { pelvis: null, spine_01: null, spine_02: null, spine_03: null, neck_01: null, Head: null };
  for (let i = 0; i < NB; i++) { const n = NAMES[i], pa = PAR[i];
    if (pa < 0) { J[n] = V(0, 0, 0); continue; }
    const P = J[NAMES[pa]], dir = restW[i].p.clone().sub(restW[pa].p), L0 = dir.length(); dir.normalize(); let L = L0 * s;
    const side = n.endsWith('_l') ? 1 : -1;
    // arms built angled down (an A-pose), so the shoulders keep their shape when the arms hang
    if (/^(lowerarm|hand|index|middle|ring|pinky|thumb)/.test(n)) dir.applyQuaternion(new THREE.Quaternion().setFromAxisAngle(V(0, 0, 1), -side * ARM));
    if (n === 'pelvis') { J[n] = V(0, pelY, restW[i].p.z * s); continue; }
    if (n === 'spine_01') J[n] = V(0, pelY + (neckBase - pelY) * .18, P.z);
    else if (n === 'spine_02') J[n] = V(0, pelY + (neckBase - pelY) * .45, P.z);
    else if (n === 'spine_03') J[n] = V(0, pelY + (neckBase - pelY) * .72, P.z);
    else if (n === 'neck_01') J[n] = V(0, neckBase, P.z);
    else if (n === 'Head') J[n] = V(0, neckTop, restW[i].p.z * s);
    else if (/^clavicle/.test(n)) J[n] = V(side * .012 * H, shY + .01 * H, restW[i].p.z * s);
    else if (/^upperarm/.test(n)) J[n] = V(side * p.shW * H, shY, restW[i].p.z * s);
    else if (/^lowerarm/.test(n)) J[n] = P.clone().addScaledVector(dir, p.ua * H);
    else if (/^hand/.test(n)) J[n] = P.clone().addScaledVector(dir, p.fa * H);
    else if (/^(index|middle|ring|pinky|thumb)/.test(n)) J[n] = P.clone().addScaledVector(dir, L * p.hand);
    else if (/^thigh/.test(n)) J[n] = V(side * p.hipW * H * .5, pelY - .05 * H, restW[i].p.z * s);
    else if (/^calf/.test(n)) J[n] = V(P.x, ankY + (P.y - ankY) * .5, P.z);
    else if (/^foot/.test(n)) J[n] = V(P.x, ankY, P.z - .01 * H);
    else J[n] = P.clone().addScaledVector(dir, /^ball/.test(n) ? L * p.foot : L);
  }
  return { J, H, hh, chinY, neckBase, shY, pelY, ankY, crotch: p.leg * H };
}

const headR = (p, hh) => V(hh * .39 * p.headW, hh * .5 * p.headL, hh * .45);
function bodyPrims(p, Lo) {
  const { J, H, hh, chinY, neckBase, shY, pelY } = Lo, P = [], add = (f, bone, k, tag) => P.push({ f, bone, k, tag }), R = p.r;
  const hc = V(0, H - hh * .5, J.Head.z);
  add(ell(hc, headR(p, hh)), 'Head', 0, 'head');
  add(ell(V(0, chinY + hh * .3, hc.z + hh * .04), V(hh * .31 * p.headW * p.jaw, hh * .3, hh * .37)), 'Head', .05, 'head');
  const nz = 1 + .7 * R, nL = hh * .08 * nz * p.noseL; add(ell(V(0, H - hh * (.57 + .03 * R) - (nL - hh * .08 * nz) * .5, hc.z + hh * (.43 + .02 * R + .05 * p.noseP)), V(hh * .05 * nz * p.noseW, nL, hh * .065 * nz)), 'Head', .02, 'nose');
  if (R > .25) { add(cap(V(0, H - hh * .45, hc.z + hh * .43), V(0, H - hh * .57 - (nL - hh * .08 * nz) * .7, hc.z + hh * (.44 + .03 * R + .045 * p.noseP)), hh * .03 * R * Math.sqrt(p.noseW), hh * .04 * R * Math.sqrt(p.noseW)), 'Head', .02, 'nose');
    add(ell(V(0, chinY + hh * .05, hc.z + hh * (.25 + .09 * p.chin)), V(hh * .13, hh * .09, hh * .12).multiplyScalar((.6 + .5 * R) * (1 + .3 * p.chin))), 'Head', .04, 'head'); }
  for (const s of [1, -1]) add(ell(V(s * hh * .2 * p.headW, H - hh * .66, hc.z + hh * (.255 + .065 * p.cheek)), V(hh * .11, hh * .085, hh * .08).multiplyScalar(1 + .13 * p.cheek)), 'Head', .012, 'head');
  for (const s of [1, -1]) add(ell(V(s * hh * (.38 * p.headW + .07 * p.earOut), H - hh * .52, hc.z - .01), V(hh * .05, hh * .12, hh * .08).multiplyScalar(p.ear)), 'Head', .015, 'ear');
  add(cap(V(0, neckBase - .02, J.neck_01.z), V(0, chinY + hh * .2, hc.z - .01), p.neckR * H, p.neckR * H * .92), 'neck_01', .03, 'neck');
  const tH = shY - pelY, cz = J.spine_03.z;
  add(ell(V(0, J.spine_03.y - .01, cz), V(p.shW * H * .88, tH * .33, p.chestD * H + .006 * H * p.mus)), 'spine_03', 0, 'torso');
  add(ell(V(0, J.spine_02.y, J.spine_02.z + p.belly * H * .3), V(p.waistW * H, tH * .33, p.chestD * H * .92 + p.belly * H * .6)), 'spine_02', .07, 'torso');
  add(ell(V(0, J.spine_01.y - .01, J.spine_01.z), V(p.hipW * H * .95, tH * .3, p.chestD * H * .95)), 'spine_01', .07, 'torso');
  add(ell(V(0, pelY - .03 * H, J.pelvis.z - .005), V(p.hipW * H * .98, .075 * H, p.chestD * H * .95)), 'pelvis', .06, 'hips');
  for (const s of [1, -1]) add(cap(V(s * .02 * H, neckBase - .012 * H, cz - .012 * H), V(s * p.shW * H * .78, shY - .006 * H, cz - .008 * H), .026 * H, .02 * H), 'spine_03', .04, 'torso');
  if (p.bust) for (const s of [1, -1]) add(ell(V(s * .045 * H, J.spine_03.y - .03 * H, cz + p.chestD * H * .62), V(.042 * H, .04 * H, .035 * H).multiplyScalar(p.bust)), 'spine_03', .03, 'torso');
  for (const s of [1, -1]) { const L = s > 0 ? 'l' : 'r', ua = J['upperarm_' + L], el = J['lowerarm_' + L], wr = J['hand_' + L];
    const mu = 1 + .14 * p.mus; add(ell(ua.clone().add(V(-s * .008 * H, -.004 * H, 0)), V(p.uaR * H * 1.12, p.uaR * H * 1.05, p.uaR * H * 1.08).multiplyScalar(mu)), 'upperarm_' + L, .045, 'shoulder');
    add(cap(ua, el, p.uaR * H * mu, p.uaR * H * .82 * mu), 'upperarm_' + L, .02, 'ua');
    add(cap(el, wr, p.uaR * H * .8, p.uaR * H * .6), 'lowerarm_' + L, .02, 'fa');
    add(ell(el.clone().lerp(wr, .28), V(p.uaR * H * .85, p.uaR * H * .85, p.uaR * H * .85).multiplyScalar(.8 + .3 * R)), 'lowerarm_' + L, .05, 'fa');
    // the hand: a palm to the knuckles, then each finger's three joints
    const kn = J['index_01_' + L].clone().lerp(J['pinky_01_' + L], .5), hw = J['index_01_' + L].distanceTo(J['pinky_01_' + L]);
    add(cap(wr.clone().lerp(kn, .15), kn.clone().lerp(wr, .08), hw * .48, hw * .5), 'hand_' + L, .015, 'hand');
    for (const f of ['index', 'middle', 'ring', 'pinky', 'thumb']) { const r0 = (f === 'thumb' ? .0072 : f === 'pinky' ? .0052 : .0062) * H * p.hand;
      for (let k = 1; k <= 3; k++) { const a = J[`${f}_0${k}_${L}`], b = J[k < 3 ? `${f}_0${k + 1}_${L}` : `${f}_04_leaf_${L}`]; add(cap(a, b, r0 * (1 - .08 * k), r0 * (1 - .08 * (k + 1))), `${f}_0${k}_${L}`, .004, 'hand'); } }
    const th = J['thigh_' + L], kn2 = J['calf_' + L], an = J['foot_' + L];
    add(cap(th, kn2, p.thR * H * p.thF * (1 + .1 * p.mus), p.thR * H * .72 * p.thF), 'thigh_' + L, .05, 'th');
    add(cap(kn2, an, p.thR * H * .68, p.thR * H * .42), 'calf_' + L, .02, 'calf');
    add(ell(kn2.clone().lerp(an, .3).add(V(0, 0, -.012 * H)), V(p.thR * H * .6, p.thR * H * 1.3, p.thR * H * .62).multiplyScalar((.85 + .2 * R) * p.calfF)), 'calf_' + L, .05, 'calf');
    add(rbox(V(an.x, .02 * H, an.z + .04 * H * p.foot), V(.032 * H * p.foot, .02 * H, .072 * H * p.foot), .016 * H), 'foot_' + L, .02, 'foot'); }
  for (const s of [1, -1]) add(ell(V(s * p.hipW * H * .42, pelY - .045 * H, J.pelvis.z - .045), V(.05 * H, .055 * H, .045 * H).multiplyScalar(p.glute)), 'pelvis', .02, 'hips');
  return { P, f: (x, y, z) => { let d = 1e9; for (const pr of P) d = smin(d, pr.f(x, y, z), pr.k); return d; } };
}

// skin weights: each point's nearest shape gives its bone; it blends with that bone's parent and child by nearness
function weights(P, prims, J, rigid, Lo) {
  const n = P.length / 3, jj = new Uint8Array(n * 4), ww = new Uint8Array(n * 4), kids = NAMES.map((_, i) => NAMES.filter((_, k) => PAR[k] === i));
  const next = b => { const ch = kids[ix(b)]; if (!ch.length) return b; if (/^hand/.test(b)) return ch.find(k => /^middle_01/.test(k)); if (/^spine_03/.test(b)) return 'neck_01'; if (/^pelvis/.test(b)) return 'spine_01'; return ch[0]; };
  const seg = (b, x, y, z) => { const a = J[b], c = J[next(b)], ab = c.clone().sub(a), L2 = ab.lengthSq() || 1e-9, t = clamp(((x - a.x) * ab.x + (y - a.y) * ab.y + (z - a.z) * ab.z) / L2, 0, 1); return Math.hypot(x - a.x - ab.x * t, y - a.y - ab.y * t, z - a.z - ab.z * t); };
  for (let v = 0; v < n; v++) { const x = P[3 * v], y = P[3 * v + 1], z = P[3 * v + 2]; let ws;
    if (rigid) ws = [[rigid, 1]];
    else { let best = null, bd = 1e9; for (const pr of prims) { const d = pr.f(x, y, z); if (d < bd) { bd = d; best = pr; } }
      const b = best.bone, cand = new Set([b]), pa = PAR[ix(b)]; if (pa >= 0) cand.add(NAMES[pa]); for (const k of kids[ix(b)]) if (!/leaf/.test(k) && !(/^hand/.test(b))) cand.add(k);
      ws = [...cand].map(c => [c, 1 / Math.pow(seg(c, x, y, z) + .015, 4)]);
      // round the hips the jeans' top and the shirt's hem go with the hips, not the thigh
      if (/^thigh/.test(b) && Lo && y > Lo.crotch - .03 * Lo.H) { const t = clamp((y - (Lo.crotch - .03 * Lo.H)) / (.07 * Lo.H), 0, 1), tot = ws.reduce((a, w) => a + w[1], 0), pw = ws.find(w => w[0] === 'pelvis'); ws.forEach(w => w[1] *= 1 - t); if (pw) pw[1] += tot * t; else ws.push(['pelvis', tot * t]); } }
    ws.sort((a, b) => b[1] - a[1]); ws = ws.slice(0, 4); const s = ws.reduce((a, b) => a + b[1], 0); let left = 255;
    ws.forEach((w, k) => { jj[4 * v + k] = ix(w[0]); const q = k === ws.length - 1 ? left : Math.round(w[1] / s * 255); ww[4 * v + k] = q; left -= q; }); }
  return { jj, ww };
}

const HAIR = {
  part: (hc, hr, hh) => { const s = ell(hc.clone().add(V(0, .012, -.006)), hr.clone().addScalar(hh * .07)), sw = ell(V(hr.x * .25, hc.y + hr.y * .6, hc.z + hr.z * .55), V(hr.x * .75, hr.y * .22, hr.z * .4)), fr = plane(V(0, hc.y + hr.y * .42, 0), V(-.25, 1, -.6)), bk = plane(V(0, hc.y - hr.y * .55, 0), V(0, 1, .2));
    return (x, y, z) => { let d = s(x, y, z); if (z > hc.z) d = Math.max(d, -fr(x, y, z - hc.z)); d = Math.max(d, -bk(x, y, z - hc.z)); if (y < hc.y - hr.y * .05) d = Math.max(d, -(Math.abs(x) - hr.x * .72)); return smin(d, sw(x, y, z), .03); }; },
  bob: (hc, hr, hh) => { const s = ell(hc.clone().add(V(0, 0, -.01)), hr.clone().multiply(V(1.08, 1, 1.02)).addScalar(hh * .075)), fr = plane(V(0, hc.y + hr.y * .3, 0), V(0, 1, -.15)), lo = plane(V(0, hc.y - hr.y * .85, 0), V(0, 1, .2)), face = ell(V(0, hc.y - hr.y * .35, hc.z + hr.z * .6), V(hr.x * .82, hr.y * .95, hr.z * .7));
    return (x, y, z) => { let d = s(x, y, z); d = Math.max(d, -lo(x, y, z - hc.z)); d = Math.max(d, -face(x, y, z)); if (z > hc.z + hr.z * .2) d = Math.max(d, -fr(x, y, z - hc.z)); return d; }; },
  curly: (hc, hr, hh) => { const s = ell(hc.clone().add(V(0, .03, -.01)), hr.clone().multiply(V(1.12, 1.04, 1.06)).addScalar(hh * .09)), fr = plane(V(0, hc.y + hr.y * .38, 0), V(0, 1, -.45)), lo = plane(V(0, hc.y - hr.y * .55, 0), V(0, 1, .15)), face = ell(V(0, hc.y - hr.y * .3, hc.z + hr.z * .6), V(hr.x * .8, hr.y * .9, hr.z * .7));
    return (x, y, z) => { let d = s(x, y, z) - hh * .022 * Math.sin(x * 95) * Math.sin(y * 95) * Math.sin(z * 95); d = Math.max(d, -lo(x, y, z - hc.z)); d = Math.max(d, -face(x, y, z)); if (z > hc.z + hr.z * .3) d = Math.max(d, -fr(x, y, z - hc.z)); return d; }; },
  crop: (hc, hr, hh) => { const s = ell(hc.clone().add(V(0, .004, -.004)), hr.clone().addScalar(hh * .03)), fr = plane(V(0, hc.y + hr.y * .45, 0), V(0, 1, -.8)), bk = plane(V(0, hc.y - hr.y * .45, 0), V(0, 1, .3));
    return (x, y, z) => { let d = s(x, y, z); if (z > hc.z) d = Math.max(d, -fr(x, y, z - hc.z)); d = Math.max(d, -bk(x, y, z - hc.z)); if (y < hc.y) d = Math.max(d, -(Math.abs(x) - hr.x * .75)); return d; }; },
  ponytail: (hc, hr, hh) => { const s = ell(hc.clone().add(V(0, .008, -.004)), hr.clone().addScalar(hh * .045)), fr = plane(V(0, hc.y + hr.y * .4, 0), V(0, 1, -.7)), bk = plane(V(0, hc.y - hr.y * .4, 0), V(0, 1, .4)), tie = V(0, hc.y + hr.y * .15, hc.z - hr.z * 1.05), tail = cap(tie, V(0, hc.y - hr.y * 1.15, hc.z - hr.z * 1.25), hh * .11, hh * .05), knot = ell(tie, V(hh * .09, hh * .09, hh * .08));
    return (x, y, z) => { let d = s(x, y, z); if (z > hc.z) d = Math.max(d, -fr(x, y, z - hc.z)); d = Math.max(d, -bk(x, y, z - hc.z)); if (y < hc.y) d = Math.max(d, -(Math.abs(x) - hr.x * .72)); return smin(d, smin(tail(x, y, z), knot(x, y, z), .03), .03); }; },
  bun: (hc, hr, hh) => { const s = ell(hc.clone().add(V(0, .006, -.004)), hr.clone().addScalar(hh * .04)), fr = plane(V(0, hc.y + hr.y * .42, 0), V(0, 1, -.7)), bk = plane(V(0, hc.y - hr.y * .45, 0), V(0, 1, .35)), bn = ell(V(0, hc.y + hr.y * .75, hc.z - hr.z * .75), V(hh * .16, hh * .15, hh * .15));
    return (x, y, z) => { let d = s(x, y, z); if (z > hc.z) d = Math.max(d, -fr(x, y, z - hc.z)); d = Math.max(d, -bk(x, y, z - hc.z)); if (y < hc.y) d = Math.max(d, -(Math.abs(x) - hr.x * .72)); return smin(d, bn(x, y, z), .03); }; },
};

// the face: small flat pieces laid on the head's surface (eyes, lids, brows, mouth)
function faceParts(p, Lo, headF) {
  const { H, hh, J } = Lo, out = [], hcz = J.Head.z, surf = (x, y) => { let z = hcz + hh * .6; while (z > hcz && headF(x, y, z) > 0) z -= .0005; return z; };
  const nrm = (x, y, z) => { const e = .002; return V(headF(x + e, y, z) - headF(x - e, y, z), headF(x, y + e, z) - headF(x, y - e, z), headF(x, y, z + e) - headF(x, y, z - e)).normalize(); };
  const stick = (g, col, x, y, lift, rz = 0) => { const z = surf(x, y), n = nrm(x, y, z), m = new THREE.Matrix4().compose(V(x, y, z).addScaledVector(n, lift), new THREE.Quaternion().setFromUnitVectors(V(0, 0, 1), n).multiply(new THREE.Quaternion().setFromAxisAngle(V(0, 0, 1), rz)), V(1, 1, 1)); g.applyMatrix4(m); out.push({ g, col }); };
  const disc = (rx, ry) => { const g = new THREE.CircleGeometry(1, 14); g.scale(rx, ry, 1); return g; }, bar = (w, h) => new THREE.PlaneGeometry(w, h);
  const ey = H - hh * p.eyeY, ex = hh * .15 * p.headW * p.eyeX, brow = new THREE.Color(p.hairC).multiplyScalar(.7).getHex(), lipC = new THREE.Color(p.skin).lerp(new THREE.Color(0xa05a50), .45).getHex();
  for (const s of [1, -1]) { const x = s * ex, t = s * p.eyeT * .35;
    stick(disc(hh * .065 * p.eye, hh * .048 * p.eye), 0xf3efe8, x, ey, .0008, t);
    stick(disc(hh * .036 * p.eye, hh * .042 * p.eye), p.eyeC, x, ey - .001, .0016);
    stick(bar(hh * .14 * p.eye, hh * .014), 0x3a2a24, x - Math.sin(t) * hh * .042 * p.eye, ey + Math.cos(t) * hh * .042 * p.eye, .0018, t);
    stick(bar(hh * .15, hh * .026 * p.brow), brow, x + s * .002, ey + hh * (.13 + .07 * p.browY), .0016, s * (-.08 + .4 * p.browT)); }
  const my = H - hh * (.8 - .05 * p.mouthY); stick(bar(hh * .12 * p.mouthW, hh * .012), 0x8a4c44, 0, my, .0012);
  stick(disc(hh * .052 * p.mouthW, hh * .009 * p.lip), lipC, 0, my + hh * .011 * p.lip, .001);
  stick(disc(hh * .058 * p.mouthW, hh * .019 * p.lip), lipC, 0, my - hh * .022 * p.lip, .001);
  return out;
}

function shapes(p) {
  const Lo = joints(p), { J, H, hh, chinY, neckBase, pelY, ankY } = Lo, B = bodyPrims(p, Lo), C = p.clothes;
  const box = (x0, y0, z0, x1, y1, z1) => [V(x0, y0, z0), V(x1, y1, z1)];
  const fullX = J.middle_04_leaf_l.x + .03, zb = -.2 * H, zf = .25 * H;
  // the clothes' shapes
  const tP = B.P.filter(x => ['torso', 'hips', 'shoulder'].includes(x.tag)), torso = (x, y, z) => { let d = 1e9; for (const pr of tP) d = smin(d, pr.f(x, y, z), pr.k); return d; };
  const sleeve = s => { const L = s > 0 ? 'l' : 'r', a = J['upperarm_' + L], e = J['lowerarm_' + L], w = J['hand_' + L], end = C.sleeve <= 1 ? a.clone().lerp(e, C.sleeve) : e.clone().lerp(w, C.sleeve - 1);
    const c1 = cap(a, e, p.uaR * H, p.uaR * H * .82), fb = B.P.filter(x => x.tag === 'fa' && x.bone === 'lowerarm_' + L), c2 = (x, y, z) => { let d = 1e9; for (const pr of fb) d = smin(d, pr.f(x, y, z), pr.k); return d; };
    const dir = (C.sleeve <= 1 ? e.clone().sub(a) : w.clone().sub(e)).normalize(), cut = plane(end, dir);
    return (x, y, z) => smax(C.sleeve <= 1 ? c1(x, y, z) : smin(c1(x, y, z), c2(x, y, z), .02), cut(x, y, z), .006); };
  const sl = [sleeve(1), sleeve(-1)], hemY = pelY - .03 * H, waist = pelY + .03 * H, hemL = C.shorts ? J.calf_l.y + .03 * H : ankY + .035 * H;
  const legP = B.P.filter(x => ['hips', 'th', 'calf'].includes(x.tag)), tor1 = B.P.find(x => x.tag === 'torso' && x.bone === 'spine_01'), crE = ell(V(0, Lo.crotch + .012 * H, J.pelvis.z - .004), V(p.thR * H * 1.25, .035 * H, p.thR * H * 1.05));
  const pantsRaw = (x, y, z) => { let d = crE(x, y, z); for (const pr of legP) d = smin(d, pr.f(x, y, z), pr.tag === 'th' ? .03 : pr.k); return smin(d, tor1.f(x, y, z), .02); };
  const pantsF = (x, y, z) => smax(pantsRaw(x, y, z) - .004 * H, Math.max(hemL - y, y - waist), .005);
  const neckCut = ell(V(0, neckBase + .012 * H, J.spine_03.z + .022 * H), V(.046 * H, .026 * H, .05 * H));
  const shirtF = (x, y, z) => { let d = smin(torso(x, y, z), Math.min(sl[0](x, y, z), sl[1](x, y, z)), .035); if (y < waist + .03 * H) d = Math.min(d, pantsRaw(x, y, z)); d -= C.loose * H + .004 * H; d = smax(d, hemY - y, .006); d = Math.max(d, -neckCut(x, y, z)); return Math.max(d, y - (neckBase + .03 * H)); };
  const shoeF = s => { const a = J['foot_' + s], bl = J['ball_leaf_' + s]; return (x, y, z) => smin(rbox(V(a.x, .024 * H, (a.z + bl.z) / 2 - .005 * H), V(.038 * H * p.foot, .024 * H, (bl.z - a.z) / 2 + .03 * H), .02 * H)(x, y, z), cap(V(a.x, .03 * H, a.z), V(a.x, ankY + .025 * H, a.z), .034 * H, .03 * H)(x, y, z), .03); };
  const hc = V(0, H - hh * .5, J.Head.z), hr = headR(p, hh), hairF = HAIR[p.hair](hc, hr, hh);
  const headF = (x, y, z) => { let d = 1e9; for (const pr of B.P) if (pr.tag === 'head' || pr.tag === 'nose') d = smin(d, pr.f(x, y, z), pr.k); return d; };
  return { Lo, B, F: { body: B.f, shirt: shirtF, pants: pantsF, shoe_l: shoeF('l'), shoe_r: shoeF('r'), hair: hairF, face: headF }, pantsRaw, hemY, hemL, waist };
}

function build(p) {
  const S = shapes(p), { Lo, B, pantsRaw, hemY, hemL, waist } = S, { J, H, chinY, neckBase, ankY } = Lo, { shirt: shirtF, pants: pantsF, hair: hairF, face: headF } = S.F, C = p.clothes, res = .0075;
  const box = (x0, y0, z0, x1, y1, z1) => [V(x0, y0, z0), V(x1, y1, z1)];
  const fullX = J.middle_04_leaf_l.x + .03, zb = -.2 * H, zf = .25 * H;
  // the parts, each meshed, cut down and coloured
  const parts = [];
  const part = (name, f, bb, h, tris, col, rigid, keep) => { let m = nets(f, bb[0], bb[1], h); if (keep) { const I = []; for (let i = 0; i < m.I.length; i += 3) if (keep(m, m.I[i], m.I[i + 1], m.I[i + 2])) I.push(m.I[i], m.I[i + 1], m.I[i + 2]); m.I = new Uint32Array(I); }
    m = slim(m, tris); parts.push({ name, m, col, rigid, f }); };
  const under = (m, a, b, c) => { const inC = v => { const x = m.P[3 * v], y = m.P[3 * v + 1], z = m.P[3 * v + 2]; return shirtF(x, y, z) < -.003 || pantsF(x, y, z) < -.003 || y < ankY + .02 * H || (y > hemL && y < waist && pantsRaw(x, y, z) < .012); }; return !(inC(a) && inC(b) && inC(c)); };
  part('body', B.f, box(-fullX, -.01, zb, fullX, H + .02, zf), res, p.tris.body, p.skin, null, under);
  part('shirt', shirtF, box(-fullX, hemY - .02, zb, fullX, neckBase + .05 * H, zf), res, p.tris.shirt, C.shirt);
  part('pants', pantsF, box(-.4 * H, hemL - .02, zb, .4 * H, waist + .02, zf), res, p.tris.pants, C.pants);
  for (const s of ['l', 'r']) { const a = J['foot_' + s]; part('shoe_' + s, S.F['shoe_' + s], box(a.x - .06 * H, -.005, a.z - .07 * H, a.x + .06 * H, ankY + .06 * H, J['ball_leaf_' + s].z + .06 * H), res * .8, p.tris.shoe, C.shoes, 'foot_' + s); }
  part('hair', hairF, box(-.3 * H, chinY - .25 * H, J.Head.z - .3 * H, .3 * H, H + .06 * H, J.Head.z + .2 * H), res * .75, p.tris.hair, p.hairC, 'Head');
  // into one mesh: points, colours, joints, weights
  const Pall = [], Call = [], Iall = [], Jall = [], Wall = [], ranges = []; let base = 0;
  const put = (P, I, col, jw, colAt) => { const n = P.length / 3; for (let v = 0; v < n; v++) { Pall.push(P[3 * v], P[3 * v + 1], P[3 * v + 2]); const c = new THREE.Color(colAt ? colAt(P[3 * v + 1]) : col); Call.push(Math.round(c.r * 255), Math.round(c.g * 255), Math.round(c.b * 255)); for (let k = 0; k < 4; k++) { Jall.push(jw.jj[4 * v + k]); Wall.push(jw.ww[4 * v + k]); } } for (const i of I) Iall.push(i + base); base += n; };
  for (const pt of parts) { const jw = weights(pt.m.P, B.P, J, pt.rigid, Lo); const sole = new THREE.Color(C.sole).getHex(); ranges.push([pt.name, base, pt.m.P.length / 3]); put(pt.m.P, pt.m.I, pt.col, jw, /^shoe/.test(pt.name) ? y => y < .012 * H ? sole : pt.col : null); }
  for (const fp of faceParts(p, Lo, headF)) { const g = fp.g.index ? fp.g : fp.g, P = g.attributes.position.array, I = g.index ? Array.from(g.index.array) : [...Array(P.length / 3).keys()]; const n = P.length / 3; ranges.push(['face', base, n]); const jw = { jj: new Uint8Array(n * 4).fill(0), ww: new Uint8Array(n * 4) }; for (let v = 0; v < n; v++) { jw.jj[4 * v] = ix('Head'); jw.ww[4 * v] = 255; } put(P, I, fp.col, jw); }
  // the rig: the UAL rig's turns, this body's joint places
  const t = [], q = [], ibm = new Float32Array(NB * 16);
  for (let i = 0; i < NB; i++) { const pa = PAR[i], wq = restW[i].q, d = J[NAMES[i]].clone().sub(pa >= 0 ? J[NAMES[pa]] : V(0, 0, 0)); if (pa >= 0) d.applyQuaternion(restW[pa].q.clone().invert()); t.push(d.toArray().map(v => +v.toFixed(5))); q.push(RIG.q[i]);
    new THREE.Matrix4().compose(J[NAMES[i]], wq, V(1, 1, 1)).invert().toArray(ibm, i * 16); }
  return { S, ranges, P: Pall, C: Call, I: Iall, J: Jall, W: Wall, rig: { names: NAMES, parent: PAR, t, q, ibm }, H, pelY: Lo.pelY, tris: Iall.length / 3, parts: Object.fromEntries(parts.map(x => [x.name, x.m.I.length / 3])) };
}

const b64 = a => Buffer.from(a.buffer, a.byteOffset, a.byteLength).toString('base64');
function pack(b) {
  const lo = [0, 1, 2].map(k => Math.min(...b.P.filter((_, i) => i % 3 === k))), hi = [0, 1, 2].map(k => Math.max(...b.P.filter((_, i) => i % 3 === k))), sc = Math.max(...hi.map((h, k) => h - lo[k])) / 65000;
  const qp = new Int16Array(b.P.length); for (let i = 0; i < b.P.length; i++) qp[i] = Math.round((b.P[i] - lo[i % 3]) / sc) - 32500;
  return { n: b.P.length / 3, sc, lo, p: b64(qp), c: b64(Uint8Array.from(b.C)), i: b64(Uint16Array.from(b.I)), j: b64(Uint8Array.from(b.J)), w: b64(Uint8Array.from(b.W)) };
}

// the six (owner, 4 Nov 2026: realism "2-3 but real hands")
const base = { H: 1.76, heads: 6.2, neck: .035, neckR: .031, shW: .115, waistW: .085, hipW: .095, chestD: .064, belly: 0, bust: 0, uaR: .028, thR: .046, ua: .165, fa: .15, hand: 1, leg: .465, mus: 0, thF: 1, calfF: 1, foot: 1, glute: .6,
  headW: 1, headL: 1, jaw: 1, chin: 0, cheek: 0, noseW: 1, noseL: 1, noseP: 0, eyeX: 1, eyeT: 0, browY: 0, browT: 0, mouthW: 1, mouthY: 0, lip: 1, ear: 1, earOut: 0, eye: 1, eyeY: .52, brow: 1, eyeC: 0x4a3428, skin: 0xd9a988, hairC: 0x5b4636, hair: 'part',
  clothes: { shirt: 0xd8d4c8, pants: 0x2c4258, shoes: 0x6b4630, sole: 0x2a1d16, sleeve: .55, loose: .006 }, tris: { body: 7000, shirt: 2600, pants: 2200, shoe: 500, hair: 1400 } };
const mk = o => ({ ...base, ...o, clothes: { ...base.clothes, ...(o.clothes || {}) } });
const PROTOS = {
  A: mk({ name: 'THE NEIGHBOUR (m)' }),
  B: mk({ name: 'THE NEIGHBOUR (f)', H: 1.66, heads: 6, shW: .103, waistW: .074, hipW: .104, chestD: .06, bust: 1, uaR: .025, thR: .047, neckR: .027, headW: .96, jaw: .9, eye: 1.08, hair: 'bob', hairC: 0x6e4a32, skin: 0xe2b498, clothes: { shirt: 0xc9d3c3, pants: 0x384a66 } }),
  C: mk({ name: 'THE LANKY ONE (m)', H: 1.85, heads: 6.6, shW: .108, waistW: .075, hipW: .088, chestD: .057, uaR: .025, thR: .041, neck: .042, neckR: .028, leg: .48, ua: .17, fa: .155, hair: 'curly', hairC: 0x2c221d, skin: 0x9a6a4c, eyeC: 0x2a1a14, clothes: { shirt: 0x8a9a6a, pants: 0x4b4740, shoes: 0x2f2f33, sole: 0xd9d4c8, sleeve: 1.85 } }),
  D: mk({ name: 'THE SOFT ONE (m)', H: 1.72, heads: 5.9, shW: .12, waistW: .11, hipW: .108, chestD: .075, belly: .03, uaR: .032, thR: .052, neckR: .036, neck: .028, headW: 1.06, jaw: 1.1, hair: 'crop', hairC: 0x8b6a48, skin: 0xe8c0a0, clothes: { shirt: 0x9a4c3c, pants: 0x5a5f66, sleeve: .6 } }),
  E: mk({ name: 'THE SMALL ONE (f)', H: 1.58, heads: 5.6, shW: .1, waistW: .072, hipW: .1, chestD: .058, bust: .85, uaR: .024, thR: .045, neckR: .026, headW: .95, jaw: .88, eye: 1.15, eyeY: .53, hair: 'ponytail', hairC: 0xb07a3c, skin: 0xf0cdb0, eyeC: 0x3d5a6a, clothes: { shirt: 0xe0c46a, pants: 0x3a5a7a, shoes: 0xd9d4c8, sole: 0x7a7064 } }),
  F: mk({ name: 'THE STURDY ONE (f)', H: 1.7, heads: 6.1, shW: .115, waistW: .088, hipW: .112, chestD: .066, bust: 1.1, uaR: .029, thR: .052, neckR: .03, hair: 'bun', hairC: 0x1e1714, skin: 0x6e4a36, eyeC: 0x21140e, clothes: { shirt: 0x5a6e8e, pants: 0x2e2a28, shoes: 0x8a3a2e, sole: 0x2a1d16, sleeve: 1.9 } }),
};
const RR = .3, lerp = (a, b, t) => a + (b - a) * t;
const realize = p => ({ ...p, r: RR, heads: lerp(p.heads, p.heads + 1.35, RR), neck: lerp(p.neck, p.neck * 1.5, RR), neckR: p.neckR * lerp(1, .9, RR), shDrop: lerp(.032, .05, RR),
  eye: p.eye * lerp(1, .78, RR), eyeY: lerp(p.eyeY, .5, RR), headW: p.headW * lerp(1, .9, RR), jaw: p.jaw * lerp(1, .95, RR), brow: p.brow * lerp(1, .8, RR), hand: p.hand * lerp(1, .92, RR), waistW: p.waistW * lerp(1, .94, RR), uaR: p.uaR * lerp(1, .94, RR) });

// the BODY sliders (owner, 4 Nov 2026: the designer's BODY tab): each one's change at +1 from a body's own sizes; -1 is the same change the other way
const SLIDERS = [
  ['HEIGHT', p => ({ H: p.H * 1.08 })], ['WEIGHT', p => ({ waistW: p.waistW * 1.35, hipW: p.hipW * 1.15, chestD: p.chestD * 1.2, belly: p.belly + .035, uaR: p.uaR * 1.3, thR: p.thR * 1.22, neckR: p.neckR * 1.18, shW: p.shW + .005 })],
  ['MUSCLE', p => ({ mus: p.mus + 2.6 })], ['HEAD SIZE', p => ({ heads: p.heads - .55 })], ['NECK', p => ({ neck: p.neck * 1.4 })], ['SHOULDERS', p => ({ shW: p.shW + .015 })],
  ['ARM LENGTH', p => ({ ua: p.ua * 1.08, fa: p.fa * 1.08 })], ['LEG LENGTH', p => ({ leg: p.leg + .025 })],
  ['CHEST', p => p.bust ? { bust: p.bust * 1.5, chestD: p.chestD + .004 } : { chestD: p.chestD + .014 }], ['WAIST', p => ({ waistW: p.waistW + .026 })], ['BELLY', p => ({ belly: p.belly + .06 })],
  ['HIPS', p => ({ hipW: p.hipW + .02 })], ['BOTTOM', p => ({ glute: p.glute * 2.4 })], ['UPPER ARMS', p => ({ uaR: p.uaR * 1.3 })], ['THIGHS', p => ({ thF: p.thF * 1.3 })],
  ['CALVES', p => ({ calfF: p.calfF * 1.5 })], ['HANDS', p => ({ hand: p.hand * 1.15 })], ['FEET', p => ({ foot: p.foot * 1.15 })],
  // the FACE sliders (owner, 4 Nov 2026), after the BODY ones so older designs keep their values
  ['HEAD WIDTH', p => ({ headW: p.headW * 1.18 })], ['HEAD HEIGHT', p => ({ headL: p.headL * 1.14 })], ['JAW', p => ({ jaw: p.jaw * 1.4 })], ['CHIN', p => ({ chin: p.chin + 1 })], ['CHEEKS', p => ({ cheek: p.cheek + 1 })],
  ['EYE SIZE', p => ({ eye: p.eye * 1.45 })], ['EYE SPACING', p => ({ eyeX: p.eyeX * 1.25 })], ['EYE HEIGHT', p => ({ eyeY: p.eyeY - .06 })], ['EYE TILT', p => ({ eyeT: p.eyeT + 1 })],
  ['BROW HEIGHT', p => ({ browY: p.browY + 1 })], ['BROW TILT', p => ({ browT: p.browT + 1 })], ['BROW THICKNESS', p => ({ brow: p.brow * 2 })],
  ['NOSE WIDTH', p => ({ noseW: p.noseW * 1.6 })], ['NOSE LENGTH', p => ({ noseL: p.noseL * 1.5 })], ['NOSE TIP', p => ({ noseP: p.noseP + 1 })],
  ['MOUTH WIDTH', p => ({ mouthW: p.mouthW * 1.45 })], ['LIPS', p => ({ lip: p.lip * 2.2 })], ['MOUTH HEIGHT', p => ({ mouthY: p.mouthY + 1 })],
  ['EAR SIZE', p => ({ ear: p.ear * 1.45 })], ['EARS OUT', p => ({ earOut: p.earOut + 1 })]];
// the joints BODIES moves (rig-rebake.py's 15 bones), where each starts
const B15 = [['hips', 'pelvis'], ['torso', 'spine_01'], ['head', 'neck_01'], ['upperArmL', 'upperarm_l'], ['forearmL', 'lowerarm_l'], ['handL', 'hand_l'], ['upperArmR', 'upperarm_r'], ['forearmR', 'lowerarm_r'], ['handR', 'hand_r'],
  ['thighL', 'thigh_l'], ['shinL', 'calf_l'], ['shoeL', 'foot_l'], ['thighR', 'thigh_r'], ['shinR', 'calf_r'], ['shoeR', 'foot_r']];
// a point on one shape carried to the same place on that shape at other sizes
function carry(d0, d1, x, y, z) {
  const v = V(x, y, z);
  if (d0.t !== 'c') { const u = V((x - d0.c.x) / d0.r.x, (y - d0.c.y) / d0.r.y, (z - d0.c.z) / d0.r.z), l = u.length() || 1; u.divideScalar(l);   // moved as its shape's surface under it moves; its height above that surface kept
    const s0 = V(d0.c.x + u.x * d0.r.x, d0.c.y + u.y * d0.r.y, d0.c.z + u.z * d0.r.z), s1 = V(d1.c.x + u.x * d1.r.x, d1.c.y + u.y * d1.r.y, d1.c.z + u.z * d1.r.z); return v.add(s1.sub(s0)); }
  const ab0 = d0.b.clone().sub(d0.a), ab1 = d1.b.clone().sub(d1.a), L0 = ab0.lengthSq() || 1e-12, t = v.clone().sub(d0.a).dot(ab0) / L0, tc = clamp(t, 0, 1);
  const u = v.clone().sub(d0.a.clone().addScaledVector(ab0, t)), ul = u.length(), r0 = d0.ra + (d0.rb - d0.ra) * tc, r1 = d1.ra + (d1.rb - d1.ra) * tc, q = new THREE.Quaternion().setFromUnitVectors(ab0.clone().normalize(), ab1.clone().normalize());
  const dir = ul > 1e-9 ? u.divideScalar(ul).applyQuaternion(q) : V(0, 0, 0); return d1.a.clone().addScaledVector(ab1, t).addScaledVector(dir, ul - r0 + r1); }
// a point pulled onto f at the level it had on the base's own part
function settle(f, v, lvl) { const e = .0006; for (let k = 0; k < 5; k++) { const d = f(v.x, v.y, v.z) - lvl; if (Math.abs(d) < 1e-5) break;
  const g = V(f(v.x + e, v.y, v.z) - f(v.x - e, v.y, v.z), f(v.x, v.y + e, v.z) - f(v.x, v.y - e, v.z), f(v.x, v.y, v.z + e) - f(v.x, v.y, v.z - e)).divideScalar(2 * e), g2 = g.lengthSq(); if (g2 < 1e-8) break; v.addScaledVector(g, -clamp(d, -.03, .03) / g2); } return v; }
function targets(p, b) {
  const S0 = b.S, P0 = b.P, n = P0.length / 3, near = new Int32Array(n), lvl = new Float32Array(n), partOf = new Array(n);
  for (const [name, st, cnt] of b.ranges) for (let v = st; v < st + cnt; v++) { partOf[v] = name; const x = P0[3 * v], y = P0[3 * v + 1], z = P0[3 * v + 2]; let bi = 0, bd = 1e9;
    S0.B.P.forEach((pr, i) => { if (name === 'face' && pr.tag !== 'head' && pr.tag !== 'nose') return; const d = pr.f(x, y, z); if (d < bd) { bd = d; bi = i; } }); near[v] = bi; lvl[v] = S0.F[name](x, y, z); }
  const o0 = B15.map(([, u]) => S0.Lo.J[u]), out = [], f0 = b.ranges.find(r => r[0] === 'face')[1];
  for (const [nm, ch] of SLIDERS) { const p1 = { ...p, ...ch(p) }, S1 = shapes(p1); if (S1.B.P.length !== S0.B.P.length) throw new Error(nm + ': the shapes differ in number');
    const D = new Float32Array(n * 3), F1 = []; for (const fp of faceParts(p1, S1.Lo, S1.F.face)) F1.push(...fp.g.attributes.position.array);
    for (let v = 0; v < n; v++) { if (partOf[v] === 'face') { const j = v - f0; for (let k = 0; k < 3; k++) D[3 * v + k] = F1[3 * j + k] - P0[3 * v + k]; continue; } const x = P0[3 * v], y = P0[3 * v + 1], z = P0[3 * v + 2], w = settle(S1.F[partOf[v]], carry(S0.B.P[near[v]].f.d, S1.B.P[near[v]].f.d, x, y, z), lvl[v]); D[3 * v] = w.x - x; D[3 * v + 1] = w.y - y; D[3 * v + 2] = w.z - z; }
    // a few points can be pulled onto the wrong surface: none moves much further than its neighbours along the part
    out.push({ name: nm, D, o: B15.map(([, u], i) => S1.Lo.J[u].clone().sub(o0[i]).toArray()) }); }
  return out;
}
const packT = (T, n) => T.map(t => { const used = new Uint8Array(Math.ceil(n / 8)), vals = []; let mx = 0; for (let v = 0; v < n; v++) for (let k = 0; k < 3; k++) mx = Math.max(mx, Math.abs(t.D[3 * v + k]));
  const sc = mx / 127 || 1e-6; for (let v = 0; v < n; v++) { const a = [0, 1, 2].map(k => Math.round(t.D[3 * v + k] / sc)); if (a.some(q => Math.abs(q) > 0)) { used[v >> 3] |= 1 << (v & 7); vals.push(...a); } }
  return { name: t.name, sc: +sc.toPrecision(5), m: b64(used), d: b64(Int8Array.from(vals)), o: t.o.map(a => a.map(x => +x.toFixed(4))) }; });

await MS.ready;
const only = process.argv[2] ? process.argv[2].split(',') : Object.keys(PROTOS), out = { bodies: {} };
for (const k of only) { const t0 = Date.now(), p = realize(PROTOS[k]), b = build(p);
  out.bodies[k] = { name: PROTOS[k].name, H: +b.H.toFixed(3), pelvis: +b.pelY.toFixed(4), rig: { ...b.rig, ibm: b64(b.rig.ibm) }, mesh: pack(b) };
  console.log(k, PROTOS[k].name, 'triangles', b.tris, JSON.stringify(b.parts), ((Date.now() - t0) / 1000).toFixed(1) + 's');
  if (process.env.SLIDERS !== '0') { const t1 = Date.now(), T = packT(targets(p, b), b.P.length / 3), f = `data/shapes-${k}.json`; fs.writeFileSync(f, JSON.stringify({ n: b.P.length / 3, bones: B15.map(x => x[0]), sliders: T }));
    console.log('  ', f, (fs.statSync(f).size / 1024).toFixed(0) + ' KB', ((Date.now() - t1) / 1000).toFixed(1) + 's'); } }
out.ualPelvis = +restW[ix('pelvis')].p.y.toFixed(4);
fs.writeFileSync(process.env.OUT || 'data/full/bodies-ual.json', JSON.stringify(out));
console.log('wrote', process.env.OUT || 'data/full/bodies-ual.json', (fs.statSync(process.env.OUT || 'data/full/bodies-ual.json').size / 1024).toFixed(0) + ' KB');
