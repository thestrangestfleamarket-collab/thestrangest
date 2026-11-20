// RAMEN's people: node tools/sushi-cast.cjs  ->  data/sushi/cast.json; THE LAST CHANCE's: node tools/sushi-cast.cjs saloon  ->  data/saloon/cast.json (those named in src/<game>/cast.js).
// Polyfork's people as Polyfork made them (owner, 19 Nov 2026: "reimport the polyfork characters their sahpes dont make sense"): each one's own model (polyfork.dev/cdn/<id>.glb, the id from data/characters.json,
// fetched into .polyfork/, never committed) on its own 22 bones with every skin weight, its flat faces and its own colours, nothing thinned; what a hand was modelled holding is left out (its own mesh);
// and Polyfork's recorded motion (polyfork.dev/anim/clips.json) as each bone's turn from the T pose, so one set plays on everybody.
const fs = require('fs'), path = require('path'), cp = require('child_process');
const GAME = process.argv[2] || 'sushi', WHO = [...fs.readFileSync('src/' + GAME + '/cast.js', 'utf8').matchAll(/^\s+([a-z_0-9]+): \['[mf]'/gm)].map((m) => m[1]);
const CHARS = JSON.parse(fs.readFileSync('data/characters.json', 'utf8')), C = '.polyfork', UA = 'TheStrangestFleaMarket-bake/1.0 (thestrangestfleamarket.com)';
const get = (url, f) => { if (!fs.existsSync(f) || !fs.statSync(f).size) { fs.mkdirSync(path.dirname(f), { recursive: true }); cp.execFileSync('curl', ['-sSf', '--retry', '4', '-A', UA, '-o', f + '.part', url]); fs.renameSync(f + '.part', f); } return f; };
const CLIPS = ['Idle', 'Walk', 'Sitting', 'Sitting talking', 'Talking', 'Agree', 'Head shake', 'Laughing', 'Arms folded'].concat(GAME === 'saloon' ? ['Punch', 'Drunk idle', 'Leaning on rail', 'Swing', 'Drinking', 'Crouch'] : []);
// the game's names for Polyfork's bones: the trunk and the head turn about their lowest joint (torso: Spine, head: Neck), as the game's limbs and blows expect
const NAME = { Hips: 'hips', Spine: 'torso', Spine1: 'spine1', Spine2: 'spine2', Neck: 'head', Head: 'skull' };
for (const [s, S] of [['L', 'Left'], ['R', 'Right']]) Object.assign(NAME, { [S + 'Shoulder']: 'collar' + s, [S + 'Arm']: 'upperArm' + s, [S + 'ForeArm']: 'forearm' + s, [S + 'Hand']: 'hand' + s, [S + 'UpLeg']: 'thigh' + s, [S + 'Leg']: 'shin' + s, [S + 'Foot']: 'shoe' + s, [S + 'ToeBase']: 'toe' + s });
const HELD = /^attach-(left|right)hand-mesh$/, HIP = 0.95;   // (Polyfork's clips move the hips for a hip 0.95 m up; each body scales that by its own)
const b64 = (a) => Buffer.from(a.buffer, a.byteOffset, a.byteLength).toString('base64'), toS = (x) => (x <= 0.0031308 ? 12.92 * x : 1.055 * Math.pow(x, 1 / 2.4) - 0.055);
const mul = (a, b) => [a[3] * b[0] + a[0] * b[3] + a[1] * b[2] - a[2] * b[1], a[3] * b[1] - a[0] * b[2] + a[1] * b[3] + a[2] * b[0], a[3] * b[2] + a[0] * b[1] - a[1] * b[0] + a[2] * b[3], a[3] * b[3] - a[0] * b[0] - a[1] * b[1] - a[2] * b[2]];
const rot = (q, v) => { const [x, y, z, w] = q, ix = w * v[0] + y * v[2] - z * v[1], iy = w * v[1] + z * v[0] - x * v[2], iz = w * v[2] + x * v[1] - y * v[0], iw = -x * v[0] - y * v[1] - z * v[2]; return [ix * w - iw * x - iy * z + iz * y, iy * w - iw * y - iz * x + ix * z, iz * w - iw * z - ix * y + iy * x]; };

let BONES = null, PARENT = null, SRC = null, REF = null;
function body(file) {
  const b = fs.readFileSync(file), n = b.readUInt32LE(12), J = JSON.parse(b.slice(20, 20 + n).toString('utf8')), BIN = b.slice(28 + n);
  const acc = (i) => { const a = J.accessors[i], v = J.bufferViews[a.bufferView], k = { VEC4: 4, VEC3: 3, VEC2: 2, SCALAR: 1, MAT4: 16 }[a.type], T = { 5126: Float32Array, 5123: Uint16Array, 5121: Uint8Array, 5125: Uint32Array }[a.componentType];
    if (v.byteStride && v.byteStride !== T.BYTES_PER_ELEMENT * k) throw new Error('interleaved'); const o = BIN.byteOffset + (v.byteOffset || 0) + (a.byteOffset || 0), buf = BIN.buffer.slice(o, o + a.count * k * T.BYTES_PER_ELEMENT); return { a: new T(buf), k, norm: a.normalized, type: a.componentType }; };
  const sk = J.skins[0], jn = sk.joints.map((j) => J.nodes[j].name), par = new Map(); J.nodes.forEach((nd, i) => (nd.children || []).forEach((c) => par.set(c, i)));
  const at = (i) => { const nd = J.nodes[i], m = nd.matrix; if (m ? [m[0], m[5], m[10]].some((x) => Math.abs(x - 1) > 1e-6) : (nd.rotation && Math.abs(nd.rotation[3]) < 0.999999) || nd.scale) throw new Error(file + ': ' + nd.name + ' is turned or scaled at rest'); const t = m ? [m[12], m[13], m[14]] : nd.translation || [0, 0, 0], p = par.has(i) ? at(par.get(i)) : [0, 0, 0]; return [t[0] + p[0], t[1] + p[1], t[2] + p[2]]; };
  const keep = jn.filter((x) => NAME[x]), names = keep.map((x) => NAME[x]), parent = keep.map((x) => { let p = par.get(sk.joints[jn.indexOf(x)]); while (p != null && !NAME[J.nodes[p].name]) p = par.get(p); return p == null ? -1 : keep.indexOf(J.nodes[p].name); });
  if (!BONES) { BONES = names; PARENT = parent; SRC = keep; } else if (names.join() !== BONES.join() || parent.join() !== PARENT.join()) throw new Error(file + ': another skeleton');
  const origin = keep.map((x) => at(sk.joints[jn.indexOf(x)])), HEAD = keep.indexOf('Head'), to = jn.map((x) => (NAME[x] ? keep.indexOf(x) : /^Face_/.test(x) ? HEAD : -1));   // (the face's bones never move in Polyfork's motion: they ride the head)
  const P = [], Cc = [], Jn = [], Wt = []; let tris = 0;
  for (const nd of J.nodes) { if (nd.mesh == null || HELD.test(nd.name)) continue; if (J.skins[nd.skin].joints.join() !== sk.joints.join()) throw new Error('two skins');
    for (const pr of J.meshes[nd.mesh].primitives) { const A = pr.attributes, p = acc(A.POSITION).a, c = acc(A.COLOR_0), j = acc(A.JOINTS_0).a, w = acc(A.WEIGHTS_0), ix = pr.indices != null ? acc(pr.indices).a : null, nv = ix ? ix.length : p.length / 3;
      const cd = c.type === 5126 ? 1 : c.type === 5121 ? 255 : 65535, wd = w.type === 5126 ? 1 : w.type === 5121 ? 255 : 65535;
      for (let q = 0; q < nv; q++) { const v = ix ? ix[q] : q; P.push(p[v * 3], p[v * 3 + 1], p[v * 3 + 2]); Cc.push(c.a[v * c.k] / cd, c.a[v * c.k + 1] / cd, c.a[v * c.k + 2] / cd);
        const m = new Map(); for (let k = 0; k < 4; k++) { const ww = w.a[v * 4 + k] / wd; if (ww <= 0) continue; const t = to[j[v * 4 + k]]; if (t < 0) throw new Error('a vertex on ' + jn[j[v * 4 + k]]); m.set(t, (m.get(t) || 0) + ww); }
        const L = [...m].sort((a, c2) => c2[1] - a[1]).slice(0, 4), s = L.reduce((a, x) => a + x[1], 0); let left = 255; const jj = [0, 0, 0, 0], wj = [0, 0, 0, 0];
        L.forEach(([t, ww], k) => { jj[k] = t; wj[k] = Math.round((ww / s) * 255); }); wj[0] += 255 - wj.reduce((a, x) => a + x, 0); Jn.push(...jj); Wt.push(...wj); }
      tris += nv / 3; } }
  // corners that share a place, a colour and their weights become one (the faces stay flat: the page shades each by its own plane)
  const nv = P.length / 3, lo = [1e9, 1e9, 1e9], hi = [-1e9, -1e9, -1e9]; for (let i = 0; i < P.length; i++) { lo[i % 3] = Math.min(lo[i % 3], P[i]); hi[i % 3] = Math.max(hi[i % 3], P[i]); }
  const sc = Math.max(hi[0] - lo[0], hi[1] - lo[1], hi[2] - lo[2]) / 65000, seen = new Map(), pos = [], col = [], bone = [], wt = [], tri = [], id = new Int32Array(nv);
  for (let v = 0; v < nv; v++) { const q = [0, 1, 2].map((a) => Math.max(-32768, Math.min(32767, Math.round((P[v * 3 + a] - lo[a]) / sc) - 32500))), c = [0, 1, 2].map((a) => Math.max(0, Math.min(255, Math.round(toS(Cc[v * 3 + a]) * 255)))), k = q.join() + '|' + c.join() + '|' + Jn.slice(v * 4, v * 4 + 4).join() + '|' + Wt.slice(v * 4, v * 4 + 4).join();
    let i = seen.get(k); if (i == null) { seen.set(k, i = pos.length / 3); pos.push(...q); col.push(...c); bone.push(...Jn.slice(v * 4, v * 4 + 4)); wt.push(...Wt.slice(v * 4, v * 4 + 4)); } id[v] = i; }
  let flat = 0; for (let t = 0; t < nv; t += 3) { const a = id[t], c = id[t + 1], d = id[t + 2]; if (a === c || c === d || a === d) { flat++; continue; } tri.push(a, c, d); }
  if (pos.length / 3 > 65535) throw new Error('too many points');
  return { out: { height: +hi[1].toFixed(4), hipY: +origin[0][1].toFixed(4), origin: origin.map((o) => o.map((x) => +x.toFixed(4))), lo: lo.map((x) => +x.toFixed(5)), sc, pos: b64(Int16Array.from(pos)), tri: b64(Uint16Array.from(tri)), bone: b64(Uint8Array.from(bone)), w: b64(Uint8Array.from(wt)), vcol: b64(Uint8Array.from(col)) },
    tris, kept: tri.length / 3, flat, points: pos.length / 3, origin };
}

const out = { license: 'Polyfork (polyfork.dev/licensing): use in games, no reselling the files', bones: null, parent: null, hip: HIP, bodies: {}, clips: {} }; let T = 0, V = 0;
for (const k of WHO) { const id = CHARS[k] && CHARS[k].pf; if (!id) throw new Error('no Polyfork model for ' + k); const r = body(get('https://polyfork.dev/cdn/' + id + '.glb', path.join(C, id + '.glb'))); out.bodies[k] = r.out; T += r.kept; V += r.points; if (!REF && Math.abs(r.out.hipY - HIP) < 0.01) REF = r.origin;
  console.log(k.padEnd(26), 'triangles', r.tris, 'kept', r.kept, r.flat ? '(' + r.flat + ' with no area)' : '', 'points', r.points, 'height', r.out.height); }
out.bones = BONES; out.parent = PARENT;
// the motion: each frame, every bone's turn from the T pose in the body's own space (the bones' own turns multiplied down from the hips; at rest they are all unturned), and how far the hips rise or sink
const LIB = JSON.parse(fs.readFileSync(get('https://polyfork.dev/anim/clips.json', path.join(C, 'anim', 'clips.json')), 'utf8')), NB = BONES.length;
for (const name of CLIPS) { const c = LIB[name]; if (!c) throw new Error('no clip ' + name); let n = c.times.length; const dt = c.times[1] - c.times[0], W = [];
  for (let f = 0; f < n; f++) { const w = []; for (let i = 0; i < NB; i++) { const t = c.tracks[SRC[i]], q = t ? [t[f * 4], t[f * 4 + 1], t[f * 4 + 2], t[f * 4 + 3]] : [0, 0, 0, 1]; w.push(PARENT[i] < 0 ? q : mul(w[PARENT[i]], q)); } W.push(w); }
  if (W[0].every((q, i) => q.every((x, a) => Math.abs(x - W[n - 1][i][a]) < 0.005))) n--;   // (a loop's last frame repeating its first: dropped)
  const step = n > 45 ? 2 : 1, fr = []; for (let f = 0; f < n; f += step) fr.push(f); const Q = new Int16Array(fr.length * NB * 4);
  fr.forEach((f, a) => W[f].forEach((q, i) => { const p = a ? W[fr[a - 1]][i] : q, s = p[0] * q[0] + p[1] * q[1] + p[2] * q[2] + p[3] * q[3] < 0 ? -1 : 1; if (s < 0) for (let x = 0; x < 4; x++) q[x] = -q[x]; for (let x = 0; x < 4; x++) Q[(a * NB + i) * 4 + x] = Math.round(q[x] * 32767); }));
  // how fast a planted foot slides back (metres a second, for a hip 0.95 m up): the speed to move at for the feet to stay put
  let sp = 0, k = 0; if (name === 'Walk') { const foot = W.slice(0, n).map((w, f) => ['shoeL', 'shoeR'].map((b) => { const ch = []; for (let i = BONES.indexOf(b); i >= 0; i = PARENT[i]) ch.unshift(i); let p = [0, REF[0][1] + (c.hips ? c.hips[f * 3 + 1] : 0), 0]; for (let a = 1; a < ch.length; a++) { const i = ch[a], pa = ch[a - 1], d = rot(w[pa], [REF[i][0] - REF[pa][0], REF[i][1] - REF[pa][1], REF[i][2] - REF[pa][2]]); p = [p[0] + d[0], p[1] + d[1], p[2] + d[2]]; } return p; }));
    for (const s of [0, 1]) { const low = Math.min(...foot.map((r) => r[s][1])); for (let f = 1; f < n; f++) if (foot[f][s][1] < low + 0.03) { sp += -(foot[f][s][2] - foot[f - 1][s][2]) / dt; k++; } } }
  out.clips[name] = { n: fr.length, dur: +(n * dt).toFixed(4), speed: +(k ? sp / k : 0).toFixed(4), q: b64(Q), h: fr.map((f) => +(c.hips ? c.hips[f * 3 + 1] : 0).toFixed(4)) };
  console.log(name.padEnd(18), 'frames', n, 'kept', fr.length, 'seconds', out.clips[name].dur, out.clips[name].speed ? 'walks at ' + out.clips[name].speed : ''); }
const s = JSON.stringify(out); fs.writeFileSync(path.join('data/' + GAME + '/cast.json'), s);
console.log('data/' + GAME + '/cast.json', s.length, 'bytes;', Object.keys(out.bodies).length, 'people,', T, 'triangles,', V, 'points,', Object.keys(out.clips).length, 'clips');
