// the asylum's patient: his body, how he walks, and the rule that he only moves in the dark
import * as T from 'three';
import { lit, glow, tex } from './tex.js';
import { G } from './state.js';
import { W, GW, GH, cell, los, litAt } from './world.js';
import { A } from './audio.js';

const skin = lit({ rough: .55, map: tex(64, 64, (g, w, h) => { g.fillStyle = '#8a8c7c'; g.fillRect(0, 0, w, h); for (let i = 0; i < 26; i++) { const x = Math.random() * w, y = Math.random() * h, r = 3 + Math.random() * 9, gr = g.createRadialGradient(x, y, 0, x, y, r); gr.addColorStop(0, i % 3 ? 'rgba(70,60,80,.45)' : 'rgba(90,50,40,.4)'); gr.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = gr; g.fillRect(0, 0, w, h); }
  g.strokeStyle = 'rgba(50,60,90,.35)'; g.lineWidth = 1; for (let i = 0; i < 7; i++) { let x = Math.random() * w, y = Math.random() * h; g.beginPath(); g.moveTo(x, y); for (let k = 0; k < 6; k++) g.lineTo(x += Math.random() * 10 - 5, y += Math.random() * 9); g.stroke(); } }) });
const dark = glow(0x000000), eye = glow(0xaab4a8), nail = lit(0x2a2620), tooth = lit({ color: 0x9a9070, rough: .4 }), hair = new T.MeshBasicMaterial({ color: 0x050505, side: T.DoubleSide });
const gown = lit({ rough: .95, side: T.DoubleSide, map: tex(64, 128, (g, w, h) => { g.fillStyle = '#5c655e'; g.fillRect(0, 0, w, h); g.fillStyle = 'rgba(40,44,40,.5)'; for (let x = 4; x < w; x += 9) g.fillRect(x, 0, 1, h);
  for (const [x, y, r] of [[20, 40, 16], [44, 90, 22], [30, 118, 14], [50, 20, 10]]) { const gr = g.createRadialGradient(x, y, 0, x, y, r); gr.addColorStop(0, 'rgba(58,8,6,.92)'); gr.addColorStop(1, 'rgba(60,20,10,0)'); g.fillStyle = gr; g.fillRect(0, 0, w, h); } g.fillStyle = 'rgba(20,16,10,.6)'; g.fillRect(0, h - 16, w, 16); }) });
const m = (geo, mat, p, x = 0, y = 0, z = 0) => { const o = new T.Mesh(geo, mat); o.position.set(x, y, z); o.castShadow = true; p.add(o); return o; };
const pv = (p, x, y, z) => { const g = new T.Group(); g.position.set(x, y, z); p.add(g); return g; };
const limb = (p, r, l, mat) => { m(new T.SphereGeometry(r * 1.12, 8, 6), mat, p); return m(new T.CapsuleGeometry(r * .9, l - r, 3, 8), mat, p, 0, -l / 2, 0); };
const lathe = pts => new T.LatheGeometry(pts.map(([r, y]) => new T.Vector2(r, y)), 14);

const g = new T.Group(), B = {};
B.hip = pv(g, 0, .98, 0); B.torso = pv(B.hip, 0, 0, 0); B.torso.rotation.z = .05;
m(lathe([[.165, 0], [.15, .14], [.125, .3], [.16, .46], [.175, .56], [.13, .65], [.05, .7]]), gown, B.torso).scale.z = .7;
m(lathe([[.165, .02], [.19, -.18], [.23, -.42], [.25, -.5]]), gown, B.hip).scale.z = .8;
m(new T.CapsuleGeometry(.036, .1, 3, 8), skin, B.torso, 0, .72, .025).rotation.x = .35;
B.head = pv(B.torso, 0, .79, .05);
const sk = m(new T.SphereGeometry(.1, 18, 14), skin, B.head, 0, .09, 0); sk.scale.set(.86, 1.12, 1);
m(new T.SphereGeometry(.07, 12, 10), skin, B.head, 0, .03, .035).scale.set(.95, .9, .9);
m(new T.CapsuleGeometry(.014, .1, 3, 6), skin, B.head, 0, .118, .088).rotation.z = Math.PI / 2;
m(new T.ConeGeometry(.014, .05, 6), skin, B.head, 0, .07, .1).rotation.x = -.35;
for (const s of [-1, 1]) { m(new T.SphereGeometry(.026, 10, 8), dark, B.head, s * .036, .095, .078).scale.set(1.05, 1.15, .7); m(new T.SphereGeometry(.0045, 6, 4), eye, B.head, s * .036, .093, .094);
  m(new T.SphereGeometry(.022, 8, 6), skin, B.head, s * .088, .08, -.005).scale.set(.35, 1, .7); m(new T.SphereGeometry(.03, 8, 6), dark, B.head, s * .058, .03, .062).scale.set(.5, 1.1, .5); }
B.mouth = m(new T.SphereGeometry(.03, 10, 8), dark, B.head, 0, .012, .078); B.mouth.scale.set(1, .4, .6);
B.jaw = pv(B.head, 0, .02, .0); m(new T.SphereGeometry(.052, 10, 8, 0, Math.PI * 2, Math.PI * .5, Math.PI * .5), skin, B.jaw, 0, -.005, .04).scale.set(.9, 1, 1.1);
for (let i = -3; i <= 3; i++) { m(new T.BoxGeometry(.007, .012, .004), tooth, B.head, i * .0085, .024, .1 - Math.abs(i) * .003); m(new T.BoxGeometry(.007, .011, .004), tooth, B.jaw, i * .0085, -.012, .092 - Math.abs(i) * .003); }
for (let i = 0; i < 34; i++) { const a = Math.PI - 2.1 + i * .127 + Math.random() * .05, hl = .16 + Math.random() * .22, h = m(new T.PlaneGeometry(.012 + Math.random() * .01, hl), hair, B.head, Math.sin(a) * .09, .185 - hl / 2, Math.cos(a) * .102); h.rotation.set(Math.random() * .16 - .08, a, Math.random() * .2 - .1, 'YXZ'); h.castShadow = false; }
for (let i = 0; i < 6; i++) { const hl = .1 + Math.random() * .14, h = m(new T.PlaneGeometry(.01, hl), hair, B.head, -.06 + i * .024 + Math.random() * .01, .19 - hl / 2, .098); h.rotation.x = .12; h.castShadow = false; }
B.arm = [-1, 1].map(s => { const sh = pv(B.torso, s * .2, s < 0 ? .575 : .6, 0); limb(sh, .04, .36, skin); const el = pv(sh, 0, -.37, 0); limb(el, .032, .38, skin); const hn = pv(el, 0, -.4, 0); m(new T.SphereGeometry(.034, 8, 6), skin, hn, 0, -.04, 0).scale.set(1, 1.4, .45);
  for (let f = 0; f < 4; f++) { const k = pv(hn, -.027 + f * .018, -.08, 0); k.rotation.x = -.25 - f * .05; m(new T.CapsuleGeometry(.007, .07, 2, 5), skin, k, 0, -.04, 0); const k2 = pv(k, 0, -.085, 0); k2.rotation.x = -.5; m(new T.CapsuleGeometry(.006, .06, 2, 5), skin, k2, 0, -.035, 0); m(new T.ConeGeometry(.006, .03, 5), nail, k2, 0, -.085, 0).rotation.x = Math.PI; }
  const th = pv(hn, s * .03, -.03, .01); th.rotation.z = s * .7; m(new T.CapsuleGeometry(.008, .05, 2, 5), skin, th, 0, -.03, 0); return { sh, el }; });
B.leg = [-1, 1].map(s => { const hp = pv(B.hip, s * .09, 0, 0); limb(hp, .055, .47, skin); const kn = pv(hp, 0, -.47, 0); limb(kn, .042, .46, skin); m(new T.SphereGeometry(.05, 8, 6), skin, kn, 0, -.475, .06).scale.set(.8, .5, 1.9); return { hp, kn }; });
g.visible = false;

const dist = new Int16Array(GW * GH); let bfsT = 0, target = null, ph = 0, vx = 0, vz = 0, burst = 0, lurches = 0, croakT = 5;
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
  ph += sp * dt * 3.4; const s = Math.sin(ph), run = P.mode === 'chase' || P.opt.reach, kill = P.mode === 'kill';
  B.leg.forEach((l, i) => { const k = i ? -s : s; l.hp.rotation.x = sp ? k * .55 : 0; l.kn.rotation.x = sp ? Math.max(0, -k) * .8 + .1 : (P.opt.crouch ? .0 : 0); });
  B.arm.forEach((a, i) => { const k = i ? s : -s; a.sh.rotation.x = run || kill ? -1.35 + k * .15 : sp ? k * .25 - .1 : -.05; a.sh.rotation.z = (i ? 1 : -1) * (run || kill ? -.12 : .06); a.el.rotation.x = run || kill ? -.25 : -.18; });
  B.torso.rotation.x = (run ? .42 : .24) + Math.sin(G.t * 1.9) * .012; B.hip.position.y = .98 - Math.abs(Math.cos(ph)) * (sp ? .03 : 0);
  const tw = P.frozen ? 0 : Math.sin(G.t * 31) > .93 ? .25 : 0; let hy = Math.atan2(G.head.x - P.x, G.head.z - P.z) - g.rotation.y; hy = Math.atan2(Math.sin(hy), Math.cos(hy));
  B.head.rotation.set(-.2 + (run ? -.3 : 0), Math.max(-1.3, Math.min(1.3, hy)), tw + .2 + (P.opt.tilt || 0));
  if (kill) g.position.x += (Math.random() - .5) * .03;
  const jaw = kill || P.opt.jaw ? 1 : run ? .6 + Math.sin(G.t * 20) * .2 : .1; B.jaw.rotation.x = jaw * .75; B.mouth.scale.set(1 + jaw * .15, .4 + jaw * 1.3, .6); B.mouth.position.y = .012 - jaw * .022;
  A.breath([P.x, 1.6, P.z], Math.max(0, 1 - d / 13) * (.55 + .45 * Math.sin(G.t * 2.8)) * (P.frozen ? .5 : 1));
}
