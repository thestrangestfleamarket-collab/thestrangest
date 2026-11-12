// the asylum's patient: a scanned human head on a motion-captured body (data/asylum/), how he walks, and the rule that he only moves in the dark
import * as T from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { lit } from './tex.js';
import bodyGlb from '../../data/asylum/body.glb';
import headGlb from '../../data/asylum/head.glb';
import faceJpg from '../../data/asylum/face.jpg';
import headNormal from '../../data/asylum/head-normal.jpg';
import { G } from './state.js';
import { W, GW, GH, cell, los, litAt } from './world.js';
import { A } from './audio.js';

const g = new T.Group(), R = { ready: false, mixer: null, w: {}, a: {}, b: {}, head: null, acc: 0 }; g.visible = false;
const tx = (url, srgb, rep) => { const t = new T.TextureLoader().load(url); t.flipY = !!rep ? false : true; if (srgb) t.colorSpace = T.SRGBColorSpace; if (rep) { t.wrapS = t.wrapT = T.RepeatWrapping; t.repeat.set(rep, rep); } return t; };
const parse = u8 => new Promise((res, rej) => new GLTFLoader().parse(u8.buffer.slice(u8.byteOffset, u8.byteOffset + u8.byteLength), '', res, rej));
Promise.all([parse(bodyGlb), parse(headGlb)]).then(([body, hd]) => {
  const rig = body.scene; rig.rotation.y = Math.PI;
  rig.traverse(o => { if (o.isBone) R.b[o.name.replace('mixamorig', '').replace(':', '')] = o; if (!o.isMesh) return; o.castShadow = true; o.frustumCulled = false; if (/visor/i.test(o.name)) { o.visible = false; return; }
    const im = o.material.map && o.material.map.image; if (!im) return; const c = document.createElement('canvas'); c.width = c.height = 1024; const x = c.getContext('2d'); x.drawImage(im, 0, 0, 1024, 1024); const d = x.getImageData(0, 0, 1024, 1024), p = d.data;
    for (let i = 0; i < p.length; i += 4) { const l = Math.min(1, (p[i] * .3 + p[i + 1] * .59 + p[i + 2] * .11) / 255 * 1.7 + .06); p[i] = 104 * l; p[i + 1] = 98 * l; p[i + 2] = 84 * l; } x.putImageData(d, 0, 0);
    for (let i = 0; i < 90; i++) { const X = Math.random() * 1024, Y = Math.random() * 1024, r = 10 + Math.random() * 60, gr = x.createRadialGradient(X, Y, 0, X, Y, r); gr.addColorStop(0, i % 3 ? 'rgba(46,34,16,.55)' : 'rgba(64,8,6,.8)'); gr.addColorStop(1, 'rgba(0,0,0,0)'); x.fillStyle = gr; x.fillRect(X - r, Y - r, r * 2, r * 2); }
    const t = new T.CanvasTexture(c); t.flipY = false; t.colorSpace = T.SRGBColorSpace; o.material = lit({ map: t, normalMap: o.material.normalMap, rough: .9 }); o.material.bumpMap = null; });
  const h0 = new T.Box3().setFromObject(rig), k = 1.93 / (h0.max.y - h0.min.y); rig.scale.set(k * .9, k, k * .9); g.add(rig);
  R.mixer = new T.AnimationMixer(rig);
  for (const c of body.animations) { let clip = c; const n = c.name.toLowerCase(); if (!['idle', 'walk', 'run'].includes(n)) continue;
    const a = R.a[n] = R.mixer.clipAction(clip); a.setEffectiveWeight(n === 'idle' ? 1 : 0); a.play(); R.w[n] = n === 'idle' ? 1 : 0; }
  let hm = null; hd.scene.traverse(o => { if (o.isMesh) hm = o; }); const geo = hm.geometry.clone(), uv = geo.attributes.uv, pos = geo.attributes.position;
  const at = (u, v) => { let b = 0, bd = 9; for (let i = 0; i < uv.count; i++) { const d = (uv.getX(i) - u) ** 2 + (1 - uv.getY(i) - v) ** 2; if (d < bd) { bd = d; b = i; } } return new T.Vector3().fromBufferAttribute(pos, b); };
  const mouth = at(.5, .468), chin = at(.5, .57), eyeL = at(.43, .31), eyeR = at(.572, .31), drop = chin.clone().sub(mouth), mt = new Float32Array(pos.count * 3);
  for (let i = 0; i < uv.count; i++) { const u = uv.getX(i), v = 1 - uv.getY(i); if (v < .47) continue; const d = Math.hypot((u - .5) * 1.25, v - .55), w = Math.max(0, 1 - d / .16); if (w <= 0) continue; const s = w * w * (3 - 2 * w) * 1.25; mt[i * 3] = drop.x * s; mt[i * 3 + 1] = drop.y * s; mt[i * 3 + 2] = drop.z * s; }
  geo.morphAttributes.position = [new T.Float32BufferAttribute(mt, 3)]; geo.morphTargetsRelative = true;
  const fm = lit({ map: tx(faceJpg, true), normalMap: tx(headNormal, false), rough: .48 }); fm.bumpMap = null;
  const head = R.head = new T.Mesh(geo, fm); head.castShadow = true; head.frustumCulled = false; head.morphTargetInfluences = [0]; head.updateMorphTargets();
  const eyeW = eyeL.distanceTo(eyeR), sc = .064 / eyeW, mid = eyeL.clone().add(eyeR).multiplyScalar(.5), hb = R.b.Head, hs = new T.Vector3(); hb.getWorldScale(hs);
  const hold = R.hold = new T.Group(); hb.add(hold); hb.scale.setScalar(.01); hb.getWorldScale(hs); hold.scale.setScalar(1 / hs.y); head.scale.setScalar(sc * 1.2); head.position.copy(mid).multiplyScalar(-sc * 1.2).add(new T.Vector3(0, .105, .085)); hold.add(head);
  R.ready = true;
}).catch(e => console.warn('the patient did not load', e));
const qa = new T.Quaternion(), qb = new T.Quaternion(), va = new T.Vector3(), UP = new T.Vector3(0, 1, 0);
function aim(bone, child, dir, w) { bone.parent.getWorldQuaternion(qa).invert(); va.copy(dir).normalize().applyQuaternion(qa); qb.setFromUnitVectors(UP.copy(child.position).normalize(), va); bone.quaternion.slerp(qb, w); }

const dist = new Int16Array(GW * GH); let bfsT = 0, target = null, vx = 0, vz = 0, burst = 0, lurches = 0, croakT = 5;
export const P = { g, x: 0, z: 0, mode: 'off', frozen: false, speed: 1.25, lookT: 0, blockT: 0, respawnAt: 1e9, on: false, opt: {}, onKill: null, onTubeKill: null, dist: () => Math.hypot(P.x - G.head.x, P.z - G.head.z), pose, hide, stalk, chase, update, face, bfs };

function passable(cx, cz) { const c = cell(cx, cz); if (c === '#' || W.blocked.has(cz * GW + cx)) return false; if (c === 'D') { const d = W.doorAt[cz * GW + cx]; return !d.locked && d.id !== 'exit'; } return true; }
function bfs() {
  dist.fill(-1); let px = Math.floor(G.head.x), pz = Math.floor(G.head.z); if (!passable(px, pz)) { let best = 99; for (let z = pz - 1; z <= pz + 1; z++) for (let x = px - 1; x <= px + 1; x++) if (passable(x, z)) { const d = Math.hypot(x + .5 - G.head.x, z + .5 - G.head.z); if (d < best) { best = d; px = x; pz = z; } } px = Math.floor(px); }
  if (!passable(px, pz)) return; const q = [pz * GW + px]; dist[q[0]] = 0;
  for (let i = 0; i < q.length; i++) { const k = q[i], x = k % GW, z = k / GW | 0; for (const [dx, dz] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const n = (z + dz) * GW + x + dx; if (dist[n] < 0 && passable(x + dx, z + dz)) { dist[n] = dist[k] + 1; q.push(n); } } }
}
function face(x, z) { g.rotation.y = Math.atan2(x - P.x, z - P.z); }
function show() { g.visible = true; g.position.set(P.x, P.opt.crouch ? -P.opt.crouch : 0, P.z); }
function pose(x, z, opt = {}) { P.mode = 'pose'; P.x = x; P.z = z; P.opt = opt; target = null; face(opt.face ? opt.face[0] : G.head.x, opt.face ? opt.face[1] : G.head.z); show(); }
function hide() { burst = 0; P.mode = 'off'; g.visible = false; P.frozen = false; P.lookT = P.blockT = 0; A.breath([0, 0, 0], 0); }
function stalk(delay) { P.on = true; if (P.mode === 'pose') { P.mode = 'stalk'; P.opt = {}; target = null; } else { hide(); P.respawnAt = G.t + delay; } }
function chase(x, z) { P.on = true; P.mode = 'chase'; P.x = x; P.z = z; P.opt = {}; target = null; show(); }
function spawn() {
  bfs(); const c = [];
  for (let z = 0; z < GH; z++) for (let x = 0; x < GW; x++) { const d = dist[z * GW + x]; if (d >= 9 && d <= 17 && cell(x, z) !== 'D' && !los(G.head.x, G.head.z, x + .5, z + .5) && !litAt(x + .5, z + .5) && !(z >= 24 && x >= 9 && x <= 17)) c.push([x, z]); }
  if (!c.length) { P.respawnAt = G.t + 3; return; }
  const s = c[Math.random() * c.length | 0]; P.x = s[0] + .5; P.z = s[1] + .5; P.mode = 'stalk'; P.opt = {}; target = null; P.lookT = P.blockT = 0; show();
}
function inBeam() {
  if (!G.lightOn || G.lightCut > 0 || G.batt <= 0) return false; const dx = P.x - G.lightPos.x, dz = P.z - G.lightPos.z, dy = 1.3 - G.lightPos.y, d = Math.hypot(dx, dy, dz);
  if (d > 13) return false; if (d > .3 && (dx * G.lightDir.x + dy * G.lightDir.y + dz * G.lightDir.z) / d < .9) return false; return los(G.head.x, G.head.z, P.x, P.z);
}
function update(dt) {
  if (P.mode === 'off') { if (P.on && G.t > P.respawnAt && G.mode === 'play') spawn(); return; }
  const d = P.dist(), mv = P.mode === 'stalk' || P.mode === 'chase'; let sp = 0;
  if (mv && G.mode === 'play') {
    const fl = P.mode === 'stalk' && burst <= 0 && inBeam(); let tb = null;
    if ((bfsT -= dt) <= 0) { bfs(); bfsT = .25; }
    const cx = Math.floor(P.x), cz = Math.floor(P.z);
    if (!target || (Math.abs(P.x - target[0]) < .06 && Math.abs(P.z - target[1]) < .06)) {
      let best = dist[cz * GW + cx], bx = -1, bz = 0; if (best < 0) best = 999;
      for (const [dx, dz] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const n = dist[(cz + dz) * GW + cx + dx]; if (n >= 0 && n < best) { best = n; bx = cx + dx; bz = cz + dz; } }
      target = bx < 0 || d < 1.3 ? [G.head.x, G.head.z] : [bx + .5, bz + .5];
    }
    if (d < 1.3 && los(P.x, P.z, G.head.x, G.head.z)) target = [G.head.x, G.head.z];
    const tx = target[0] - P.x, tz = target[1] - P.z, tl = Math.hypot(tx, tz) || 1, dc = W.doorAt[Math.floor(target[1]) * GW + Math.floor(target[0])];
    if (P.mode === 'stalk') tb = litAt(P.x + tx / tl * .8, P.z + tz / tl * .8) || litAt(P.x, P.z);
    P.frozen = (fl || !!tb) && burst <= 0;
    if (fl) { if (d < 6.5 && Math.random() < dt * .35) G.lightCut = .1;
      if ((P.lookT += dt) > 3.6) { P.lookT = 0; A.click(null); if (++lurches > 3) { lurches = 0; G.lightCut = .45; hide(); P.respawnAt = G.t + 14 + Math.random() * 12; return; } G.lightCut = .22; burst = Math.min(1.5, Math.max(0, d - 2)); A.croak([P.x, 1.6, P.z]); } } else P.lookT = Math.max(0, P.lookT - dt * .5);
    if ((croakT -= dt) < 0) { croakT = 5 + Math.random() * 7; if (P.mode === 'stalk' && d < 12 && !fl) A.croak([P.x, 1.6, P.z]); }
    if (tb && !fl) { if ((P.blockT += dt) > 3.5) { P.blockT = 0; tb.state = 'dead'; A.spark([tb.x, 2.7, tb.z]); if (P.onTubeKill) P.onTubeKill(tb); } } else P.blockT = Math.max(0, P.blockT - dt);
    if (!P.frozen) {
      if (dc && dc.a < .6) { dc.t = 1; } else { sp = burst > 0 ? 9 : P.mode === 'chase' ? P.speed * 2.75 : P.speed; if (burst > 0 && ((burst -= sp * dt) <= 0 || d < 1.9)) burst = 0; const st = Math.min(sp * dt, tl); P.x += tx / tl * st; P.z += tz / tl * st; vx = tx / tl; vz = tz / tl; }
      const a = Math.atan2(vx, vz); let da = a - g.rotation.y; da = Math.atan2(Math.sin(da), Math.cos(da)); g.rotation.y += da * Math.min(1, dt * 8);
    }
    if (d < .85 && los(P.x, P.z, G.head.x, G.head.z) && P.onKill) { P.onKill(); return; }
  }
  if (P.mode === 'pose' && P.opt.track) face(G.head.x, G.head.z);
  g.position.set(P.x, P.opt.crouch ? -P.opt.crouch : 0, P.z);
  if (R.ready) {
    const run = P.mode === 'chase' || burst > 0, kill = P.mode === 'kill', reach = run || kill || P.opt.reach, want = { idle: sp ? 0 : 1, walk: sp && !run ? 1 : 0, run: sp && run ? 1 : 0 };
    for (const k in R.a) { R.w[k] = (R.w[k] || 0) + (want[k] - (R.w[k] || 0)) * Math.min(1, dt * 7); R.a[k].setEffectiveWeight(R.w[k]); }
    R.a.walk.timeScale = sp / 1.45; R.a.run.timeScale = burst > 0 ? 1.9 : .95;
    const step = P.mode === 'stalk' && burst <= 0 ? 1 / 10 : 0; R.acc += P.frozen ? 0 : dt; if (R.acc >= step) { R.mixer.update(R.acc); R.acc = 0; } else R.mixer.update(0);
    const b = R.b, tw = !P.frozen && Math.sin(G.t * 31) > .93 ? .3 : 0; let hy = Math.atan2(G.head.x - P.x, G.head.z - P.z) - g.rotation.y; hy = Math.atan2(Math.sin(hy), Math.cos(hy));
    b.Neck.rotateY(Math.max(-.6, Math.min(.6, hy * .5))); b.Head.rotateY(Math.max(-.7, Math.min(.7, hy * .5))); b.Head.rotateX(run ? -.5 : P.opt.crouch ? -.55 : -.1); b.Head.rotateZ(.22 + tw + (P.opt.tilt || 0)); b.Head.scale.setScalar(.01); for (const n of ['Spine', 'Spine1', 'Spine2']) b[n].rotateX(run ? .13 : .07); b.Neck.rotateX(.1); b.LeftShoulder.rotateZ(-.12);
    if (reach) { g.updateMatrixWorld(true); const f = new T.Vector3(Math.sin(g.rotation.y), -.12, Math.cos(g.rotation.y)), side = new T.Vector3(f.z, 0, -f.x); for (const [n, s] of [['Left', 1], ['Right', -1]]) { const d = f.clone().addScaledVector(side, s * .1).add(new T.Vector3(0, Math.sin(G.t * 9 + s) * .06, 0)); aim(b[n + 'Arm'], b[n + 'ForeArm'], d, .85); b[n + 'Arm'].updateMatrixWorld(true); aim(b[n + 'ForeArm'], b[n + 'Hand'], d, .8); } }
    const jaw = kill || P.opt.jaw ? 1 : run ? .55 + Math.sin(G.t * 17) * .25 : .06; R.head.morphTargetInfluences[0] += (jaw - R.head.morphTargetInfluences[0]) * Math.min(1, dt * 12);
    if (kill) { g.position.x += (Math.random() - .5) * .03; R.hold.rotation.z = (Math.random() - .5) * .25; } else R.hold.rotation.z = 0;
  }
  A.breath([P.x, 1.6, P.z], Math.max(0, 1 - d / 13) * (.55 + .45 * Math.sin(G.t * 2.8)) * (P.frozen ? .5 : 1));
}
