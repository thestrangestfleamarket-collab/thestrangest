// the asylum's patient: his body, how he walks, and the rule that he only moves in the dark
import * as T from 'three';
import { toon, glow, tex } from './tex.js';
import { G } from './state.js';
import { W, GW, GH, cell, los, litAt } from './world.js';
import { A } from './audio.js';

const skin = toon(0x86897a), dark = glow(0x000000), eye = glow(0xd8e0d0), nail = toon(0x2a2620);
const gown = toon({ map: tex(64, 128, (g, w, h) => { g.fillStyle = '#626c64'; g.fillRect(0, 0, w, h); g.fillStyle = 'rgba(40,44,40,.5)'; for (let x = 4; x < w; x += 9) g.fillRect(x, 0, 1, h);
  for (const [x, y, r] of [[20, 40, 16], [44, 90, 22], [30, 118, 14]]) { const gr = g.createRadialGradient(x, y, 0, x, y, r); gr.addColorStop(0, 'rgba(70,10,8,.9)'); gr.addColorStop(1, 'rgba(60,20,10,0)'); g.fillStyle = gr; g.fillRect(0, 0, w, h); } g.fillStyle = 'rgba(20,16,10,.6)'; g.fillRect(0, h - 16, w, 16); }) });
const m = (geo, mat, p, x = 0, y = 0, z = 0) => { const o = new T.Mesh(geo, mat); o.position.set(x, y, z); o.castShadow = true; p.add(o); return o; };
const pv = (p, x, y, z) => { const g = new T.Group(); g.position.set(x, y, z); p.add(g); return g; };
const limb = (p, r, l, mat) => m(new T.CylinderGeometry(r * .8, r, l, 7), mat, p, 0, -l / 2, 0);

const g = new T.Group(), B = {};
B.hip = pv(g, 0, .98, 0); B.torso = pv(B.hip, 0, 0, 0);
m(new T.CylinderGeometry(.15, .19, .62, 9), gown, B.torso, 0, .31, 0); m(new T.CylinderGeometry(.2, .27, .52, 9, 1, true), gown, B.hip, 0, -.25, 0).material.side = T.DoubleSide;
m(new T.CapsuleGeometry(.075, .36, 4, 8), gown, B.torso, 0, .6, 0).rotation.z = Math.PI / 2; m(new T.CylinderGeometry(.04, .05, .14, 7), skin, B.torso, 0, .7, .02);
B.head = pv(B.torso, 0, .78, .03); const hd = m(new T.SphereGeometry(.115, 14, 10), skin, B.head, 0, .08, 0); hd.scale.set(1, 1.28, 1.06);
for (const s of [-1, 1]) { const so = m(new T.SphereGeometry(.034, 8, 6), dark, B.head, s * .045, .1, .092); so.scale.set(1, 1.5, .6); m(new T.SphereGeometry(.007, 6, 4), eye, B.head, s * .045, .098, .113); }
B.jaw = pv(B.head, 0, .0, .04); m(new T.BoxGeometry(.1, .05, .1), skin, B.jaw, 0, -.045, .03); B.mouth = m(new T.SphereGeometry(.04, 8, 6), dark, B.head, 0, .0, .1); B.mouth.scale.set(1, .5, .5);
for (let i = 0; i < 9; i++) { const a = Math.PI - 1.5 + i * .375, hl = .22 + (i % 3) * .09, h = m(new T.BoxGeometry(.014, hl, .008), dark, B.head, Math.sin(a) * .116, .2 - hl / 2, Math.cos(a) * .116); h.rotation.y = a; }
B.arm = [-1, 1].map(s => { const sh = pv(B.torso, s * .24, .6, 0); limb(sh, .045, .38, skin); const el = pv(sh, 0, -.38, 0); limb(el, .038, .4, skin); const hn = pv(el, 0, -.4, 0); m(new T.BoxGeometry(.07, .1, .03), skin, hn, 0, -.05, 0);
  for (let f = 0; f < 4; f++) { const fg = m(new T.BoxGeometry(.012, .15, .012), skin, hn, -.027 + f * .018, -.17, 0); m(new T.BoxGeometry(.012, .03, .013), nail, fg, 0, -.08, 0); } return { sh, el }; });
B.leg = [-1, 1].map(s => { const hp = pv(B.hip, s * .1, 0, 0); limb(hp, .06, .47, skin); const kn = pv(hp, 0, -.47, 0); limb(kn, .048, .47, skin); m(new T.BoxGeometry(.08, .05, .22), skin, kn, 0, -.485, .06); return { hp, kn }; });
g.visible = false;

const dist = new Int16Array(GW * GH); let bfsT = 0, target = null, ph = 0, vx = 0, vz = 0;
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
function hide() { P.mode = 'off'; g.visible = false; P.frozen = false; P.lookT = P.blockT = 0; A.breath([0, 0, 0], 0); }
function stalk(delay) { P.on = true; if (P.mode === 'pose') { P.mode = 'stalk'; P.opt = {}; target = null; } else { hide(); P.respawnAt = G.t + delay; } }
function chase(x, z) { P.on = true; P.mode = 'chase'; P.x = x; P.z = z; P.opt = {}; target = null; show(); }
function spawn() {
  bfs(); const c = [];
  for (let z = 0; z < GH; z++) for (let x = 0; x < GW; x++) { const d = dist[z * GW + x]; if (d >= 9 && d <= 17 && cell(x, z) !== 'D' && !los(G.head.x, G.head.z, x + .5, z + .5) && !litAt(x + .5, z + .5) && !(z >= 24 && x >= 9 && x <= 17)) c.push([x, z]); }
  if (!c.length) { P.respawnAt = G.t + 3; return; }
  const s = c[Math.random() * c.length | 0]; P.x = s[0] + .5; P.z = s[1] + .5; P.mode = 'stalk'; P.opt = {}; target = null; P.lookT = P.blockT = 0; show();
}
function lit() {
  if (!G.lightOn || G.lightCut > 0 || G.batt <= 0) return false; const dx = P.x - G.lightPos.x, dz = P.z - G.lightPos.z, dy = 1.3 - G.lightPos.y, d = Math.hypot(dx, dy, dz);
  if (d > 13) return false; if (d > .3 && (dx * G.lightDir.x + dy * G.lightDir.y + dz * G.lightDir.z) / d < .9) return false; return los(G.head.x, G.head.z, P.x, P.z);
}
function update(dt) {
  if (P.mode === 'off') { if (P.on && G.t > P.respawnAt && G.mode === 'play') spawn(); return; }
  const d = P.dist(), mv = P.mode === 'stalk' || P.mode === 'chase'; let sp = 0;
  if (mv && G.mode === 'play') {
    const fl = P.mode === 'stalk' && lit(); let tb = null;
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
    P.frozen = fl || !!tb;
    if (fl) { if ((P.lookT += dt) > 5.5) { G.lightCut = .4; A.click(null); hide(); P.respawnAt = G.t + 16 + Math.random() * 14; return; } } else P.lookT = Math.max(0, P.lookT - dt * .5);
    if (tb && !fl) { if ((P.blockT += dt) > 3.5) { P.blockT = 0; tb.state = 'dead'; A.spark([tb.x, 2.7, tb.z]); if (P.onTubeKill) P.onTubeKill(tb); } } else P.blockT = Math.max(0, P.blockT - dt);
    if (!P.frozen) {
      if (dc && dc.a < .6) { dc.t = 1; } else { sp = P.mode === 'chase' ? P.speed * 2.75 : P.speed; const st = Math.min(sp * dt, tl); P.x += tx / tl * st; P.z += tz / tl * st; vx = tx / tl; vz = tz / tl; }
      const a = Math.atan2(vx, vz); let da = a - g.rotation.y; da = Math.atan2(Math.sin(da), Math.cos(da)); g.rotation.y += da * Math.min(1, dt * 8);
    }
    if (d < .85 && los(P.x, P.z, G.head.x, G.head.z) && P.onKill) { P.onKill(); return; }
  }
  if (P.mode === 'pose' && P.opt.track) face(G.head.x, G.head.z);
  g.position.set(P.x, P.opt.crouch ? -P.opt.crouch : 0, P.z);
  ph += sp * dt * 3.4; const s = Math.sin(ph), run = P.mode === 'chase' || P.opt.reach, kill = P.mode === 'kill';
  B.leg.forEach((l, i) => { const k = i ? -s : s; l.hp.rotation.x = sp ? k * .55 : 0; l.kn.rotation.x = sp ? Math.max(0, -k) * .8 + .1 : (P.opt.crouch ? .0 : 0); });
  B.arm.forEach((a, i) => { const k = i ? s : -s; a.sh.rotation.x = run || kill ? -1.35 + k * .15 : sp ? k * .25 - .1 : -.05; a.sh.rotation.z = (i ? 1 : -1) * (run || kill ? -.12 : .06); a.el.rotation.x = run || kill ? -.25 : -.18; });
  B.torso.rotation.x = run ? .42 : .2; B.hip.position.y = .98 - Math.abs(Math.cos(ph)) * (sp ? .03 : 0);
  const tw = P.frozen ? 0 : Math.sin(G.t * 31) > .93 ? .25 : 0; let hy = Math.atan2(G.head.x - P.x, G.head.z - P.z) - g.rotation.y; hy = Math.atan2(Math.sin(hy), Math.cos(hy));
  B.head.rotation.set(-.15 + (run ? -.3 : 0), Math.max(-1.3, Math.min(1.3, hy)), tw + (P.opt.tilt || 0));
  const jaw = kill || P.opt.jaw ? 1 : run ? .6 + Math.sin(G.t * 20) * .2 : .1; B.jaw.position.y = -jaw * .07; B.mouth.scale.set(1 + jaw * .3, .5 + jaw * 2.2, .5); B.mouth.position.y = -jaw * .035;
  A.breath([P.x, 1.6, P.z], Math.max(0, 1 - d / 13) * (.55 + .45 * Math.sin(G.t * 2.8)) * (P.frozen ? .5 : 1));
}
