// FOURTH & LONG's picture: the field, the 22 players (players.js; blocks until their bodies come), the ball, the marks on the grass and the scoreboard. Everything hangs off one group in yards (W), which the page sizes as a table or as a life-size field
import * as THREE from 'three';
import { FIELD } from './sim.js';
import { KIT, loadPlayers, makePlayer } from './players.js';

const TEAM = KIT, NUMS = [55, 66, 67, 72, 76, 12, 81, 84, 88, 44, 23], LINEMEN = /^(C|LG|RG|LT|RT|DE|DT)$/;
const M = new THREE.Matrix4(), B = new THREE.Matrix4(), T1 = new THREE.Matrix4(), R1 = new THREE.Matrix4(), Q = new THREE.Quaternion(), E = new THREE.Euler(), V = new THREE.Vector3(), SC = new THREE.Vector3(), C = new THREE.Color();

function fieldTexture() {
  const c = document.createElement('canvas'); c.width = 2048; c.height = 912; const g = c.getContext('2d'), px = c.width / 120, X = (yd) => (yd + 60) * px, Z = (yd) => (yd + FIELD.W) * px;
  for (let i = 0; i < 20; i++) { g.fillStyle = i % 2 ? '#2f7d32' : '#2a722d'; g.fillRect(X(-50 + i * 5), 0, 5 * px + 1, c.height); }
  [[-60, TEAM[0]], [50, TEAM[1]]].forEach(([x, t], i) => { g.fillStyle = t.css; g.fillRect(X(x), 0, 10 * px, c.height); g.save(); g.translate(X(x + 5), c.height / 2); g.rotate(i ? Math.PI / 2 : -Math.PI / 2); g.fillStyle = '#fff'; g.font = '900 ' + 6.5 * px + 'px system-ui, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(t.name, 0, 0); g.restore(); });
  g.strokeStyle = '#fff'; g.fillStyle = '#fff'; g.lineWidth = px * 0.35; g.strokeRect(X(-60) + 2, 2, c.width - 4, c.height - 4);
  for (let y = -50; y <= 50; y += 5) { g.beginPath(); g.moveTo(X(y), 0); g.lineTo(X(y), c.height); g.stroke(); }
  g.lineWidth = px * 0.2; for (let y = -49; y < 50; y++) for (const z of [-FIELD.W + 0.4, -6.2, 6.2, FIELD.W - 1.1]) { g.beginPath(); g.moveTo(X(y), Z(z)); g.lineTo(X(y), Z(z + 0.7)); g.stroke(); }
  g.font = '800 ' + 3.4 * px + 'px system-ui, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle';
  for (let y = -40; y <= 40; y += 10) for (const s of [-1, 1]) { g.save(); g.translate(X(y), Z(s * 17)); if (s < 0) g.rotate(Math.PI); g.fillText(String(50 - Math.abs(y)), 0, 0); g.restore(); }
  g.globalAlpha = 0.5; g.font = '900 ' + 5 * px + 'px system-ui, sans-serif'; g.fillText('4TH & LONG', X(0), Z(0)); g.globalAlpha = 1;
  { let s = 5; const r = () => (s = (s * 16807) % 2147483647) / 2147483647; for (let i = 0; i < 60000; i++) { g.fillStyle = r() < 0.5 ? 'rgba(0,0,0,0.07)' : 'rgba(255,255,200,0.05)'; g.fillRect(r() * c.width, r() * c.height, 1 + r() * 2, 1 + r() * 3); } }   // the turf's grain
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8;
  const img = new Image(); img.onload = () => { g.save(); g.globalCompositeOperation = 'overlay'; g.globalAlpha = 0.85; g.scale(0.28, 0.28); g.fillStyle = g.createPattern(img, 'repeat'); g.fillRect(0, 0, c.width / 0.28, c.height / 0.28); g.restore();   // SKIRMISH TABLE's photographed grass
    g.save(); g.globalCompositeOperation = 'soft-light'; for (let i = 0; i < 24; i++) { g.fillStyle = i % 2 ? 'rgba(255,255,255,0.22)' : 'rgba(0,0,0,0.22)'; g.fillRect(i * 5 * px, 0, 5 * px, c.height); } g.restore(); t.needsUpdate = true; }; img.src = '/chess-assets/board/grass.jpg';
  return t;
}
export class View {
  constructor(scene) {
    const W = this.W = new THREE.Group(); scene.add(W); this.table = true;
    const field = this.field = new THREE.Mesh(new THREE.PlaneGeometry(120, FIELD.W * 2), new THREE.MeshLambertMaterial({ map: fieldTexture() })); field.rotation.x = -Math.PI / 2; W.add(field);
    const slab = new THREE.Mesh(new THREE.BoxGeometry(132, 1.2, FIELD.W * 2 + 12), new THREE.MeshLambertMaterial({ color: 0x1d5a22 })); slab.position.y = -0.62; W.add(slab);
    // goal posts
    const post = new THREE.MeshLambertMaterial({ color: 0xf2d020 }); for (const s of [-1, 1]) { const g = new THREE.Group(), cyl = (r, h) => new THREE.Mesh(new THREE.CylinderGeometry(r, r, h, 8), post); const a = cyl(0.14, 3.3); a.position.y = 1.65; const bar = cyl(0.1, 6.2); bar.rotation.x = Math.PI / 2; bar.position.y = 3.3; g.add(a, bar); for (const z of [-3.1, 3.1]) { const u = cyl(0.08, 10); u.position.set(0, 8.3, z); g.add(u); } g.position.x = s * 60.3; W.add(g); }
    // the line of scrimmage, the line to gain, where the ball will come down
    const strip = (col) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(0.3, FIELD.W * 2), new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: 0.75 })); m.rotation.x = -Math.PI / 2; m.position.y = 0.03; W.add(m); return m; };
    this.los = strip(0x3aa0ff); this.gain = strip(0xffe030);
    const ring = (col, a, b) => { const m = new THREE.Mesh(new THREE.RingGeometry(a, b, 28), new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: 0.9, side: THREE.DoubleSide })); m.rotation.x = -Math.PI / 2; m.position.y = 0.05; m.visible = false; W.add(m); return m; };
    this.rCtl = ring(0xffe030, 0.75, 1.0); this.rSel = ring(0xffffff, 0.85, 1.05); this.rHov = ring(0x40e0ff, 0.95, 1.1); this.rLand = ring(0xff5030, 0.8, 1.2); this.rSpot = ring(0xffffff, 0.2, 0.5);
    // the players: torso, helmet, legs, arms
    const lam = () => new THREE.MeshLambertMaterial(), im = (geo, n) => { const m = new THREE.InstancedMesh(geo, lam(), n); m.frustumCulled = false; m.instanceMatrix.setUsage(THREE.DynamicDrawUsage); W.add(m); return m; };
    this.torso = im(new THREE.CylinderGeometry(0.36, 0.22, 0.78, 10), 22); this.helm = im(new THREE.SphereGeometry(0.21, 12, 8), 22); this.legs = im(new THREE.BoxGeometry(0.17, 0.85, 0.17), 44); this.arms = im(new THREE.BoxGeometry(0.13, 0.62, 0.13), 44);
    this.shade = new THREE.InstancedMesh(new THREE.CircleGeometry(0.55, 14).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ color: 0, transparent: true, opacity: 0.28, depthWrite: false }), 23); this.shade.frustumCulled = false; W.add(this.shade);
    for (let i = 0; i < 22; i++) { const t = TEAM[i < 11 ? 0 : 1]; this.torso.setColorAt(i, C.set(t.jersey)); this.helm.setColorAt(i, C.set(t.helmet)); for (const k of [0, 1]) { this.legs.setColorAt(i * 2 + k, C.set(t.pants)); this.arms.setColorAt(i * 2 + k, C.set(t.jersey)); } }
    // the ball at its real size (11 in long, 6.7 in across), pointed, pebbled leather with its laces and seams
    { const pts = []; for (let i = 0; i <= 16; i++) { const u = i / 16 * 2 - 1; pts.push(new THREE.Vector2(0.093 * Math.pow(Math.max(0, 1 - u * u), 0.7), u * 0.153)); }
      const c = document.createElement('canvas'); c.width = 256; c.height = 128; const g = c.getContext('2d'); g.fillStyle = '#6f3716'; g.fillRect(0, 0, 256, 128); let s = 9; const r = () => (s = (s * 16807) % 2147483647) / 2147483647;
      for (let i = 0; i < 5000; i++) { g.fillStyle = r() < 0.5 ? 'rgba(0,0,0,0.16)' : 'rgba(255,190,130,0.1)'; g.fillRect(r() * 256, r() * 128, 1.5, 1.5); } g.strokeStyle = 'rgba(30,12,4,0.8)'; g.lineWidth = 1.5; for (const x of [0, 64, 128, 192, 256]) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, 128); g.stroke(); }
      g.fillStyle = '#f1ede2'; g.fillRect(62.5, 40, 3, 48); for (let y = 44; y <= 84; y += 8) g.fillRect(57, y - 1.2, 14, 2.6);
      const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; this.ball = new THREE.Mesh(new THREE.LatheGeometry(pts, 16).rotateZ(Math.PI / 2), new THREE.MeshLambertMaterial({ map: t })); W.add(this.ball); }
    // a marker over each receiver while the user's quarterback has the ball: green open, red covered
    this.marks = []; for (let i = 0; i < 5; i++) { const m = new THREE.Mesh(new THREE.ConeGeometry(0.45, 0.9, 4).rotateX(Math.PI), new THREE.MeshBasicMaterial({ color: 0x30e060 })); m.visible = false; W.add(m); this.marks.push(m); }
    this.routes = new THREE.Group(); W.add(this.routes); this.routeMat = [new THREE.LineBasicMaterial({ color: 0xffe030 }), new THREE.LineBasicMaterial({ color: 0xff7a30 })];
    this.phase = new Float32Array(22);
    // the scoreboard: one picture on three boards (behind each end zone and along the far side)
    const sc = this.sc = document.createElement('canvas'); sc.width = 1024; sc.height = 384; this.scTex = new THREE.CanvasTexture(sc); this.scTex.colorSpace = THREE.SRGBColorSpace; const sm = new THREE.MeshBasicMaterial({ map: this.scTex, fog: false });
    this.boards = [[0, 15, -34, 0, 30], [100, 30, 0, -Math.PI / 2, 44], [-100, 30, 0, Math.PI / 2, 44]].map(([x, y, z, ry, w]) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, w * 0.375), sm); m.position.set(x, y, z); m.rotation.y = ry; W.add(m); return m; }); this.scKey = '';
  }
  // the players' bodies: until they arrive, and if they never do, the players are drawn as blocks
  async people() {
    try { await loadPlayers(); } catch (e) { return false; }
    this.fig = []; for (let i = 0; i < 22; i++) { const f = makePlayer(i < 11 ? 0 : 1, NUMS[i % 11]); this.W.add(f.g); this.fig.push(f); }
    for (const m of [this.torso, this.helm, this.legs, this.arms]) m.visible = false; return true;
  }
  score(sim) {
    const mm = Math.floor(sim.clock / 60), ss = String(Math.floor(sim.clock % 60)).padStart(2, '0'), key = [sim.score, sim.q, mm, ss, sim.phase, sim.msg, sim.down, sim.los, sim.poss].join('|'); if (key === this.scKey) return; this.scKey = key;
    const g = this.sc.getContext('2d'); g.fillStyle = '#0b0e14'; g.fillRect(0, 0, 1024, 384); g.textBaseline = 'middle'; g.textAlign = 'center';
    [0, 1].forEach(t => { const x = t ? 762 : 262; g.fillStyle = TEAM[t].css; g.fillRect(t ? 524 : 24, 20, 476, 150); g.fillStyle = '#fff'; g.font = '800 44px system-ui, sans-serif'; g.fillText(sim.names[t] + (sim.poss === t && sim.phase !== 'over' ? '  ●' : ''), x, 52); g.font = '900 96px system-ui, sans-serif'; g.fillText(String(sim.score[t]), x, 118); });
    g.fillStyle = '#ffe030'; g.font = '800 50px system-ui, sans-serif'; g.fillText(sim.phase === 'over' ? 'FINAL' : 'Q' + Math.min(4, sim.q) + '   ' + mm + ':' + ss + '   ' + sim.downText + '   ' + sim.yard, 512, 218);
    g.fillStyle = '#fff'; g.font = '800 ' + (sim.msg.length > 30 ? 40 : 54) + 'px system-ui, sans-serif'; g.fillText(sim.phase === 'dead' || sim.phase === 'over' ? sim.msg : sim.phase === 'pre' && sim.play ? (sim.human[sim.poss] ? sim.play.name : sim.human[1 - sim.poss] ? sim.dplay.name : '') : '', 512, 310);
    this.scTex.needsUpdate = true;
  }
  // the routes of the user's offense before the snap
  showRoutes(sim, on) {
    const R = this.routes; for (const l of [...R.children]) { l.geometry.dispose(); R.remove(l); } if (!on) return;
    for (const p of sim.team(sim.poss)) { if (!p.way || !p.way.length) continue; const pts = [new THREE.Vector3(p.hx, 0.12, p.hz), ...p.way.map(w => new THREE.Vector3(w.x, 0.12, w.z))]; R.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), this.routeMat[p.job === 'runner' ? 1 : 0])); }
  }
  update(sim, dt, o) {
    const big = this.table ? 1.7 : 1; let n = 0; this.boards[0].visible = this.table; this.boards[1].visible = this.boards[2].visible = !this.table;
    for (const p of sim.P) {
      if (this.fig) { const f = this.fig[p.id], sp = Math.hypot(p.vx, p.vz), down = p.st === 'down', g = f.g; g.visible = o.hide !== p.id; g.position.set(p.x, p.y + (down ? 0.25 : 0), p.z); g.scale.setScalar(big);
        g.rotation.y = Math.atan2(Math.cos(p.face), Math.sin(p.face)) - (p.mv === 'spin' ? (0.45 - p.mvT) * 14 : 0); const want = down ? 1.45 : p.mv === 'dive' || p.mv === 'hit' ? 1.15 : Math.min(0.2, sp * 0.02); g.rotation.x += (want - g.rotation.x) * Math.min(1, dt * 12);
        if (g.visible) f.update(dt, down ? 0 : sp, sim.phase === 'pre' && LINEMEN.test(p.role), down); M.makeTranslation(p.x, 0.04, p.z); if (!g.visible) M.scale(V.set(0, 0, 0)); this.shade.setMatrixAt(n++, M); continue; }
      const i = p.id, sp = Math.hypot(p.vx, p.vz), down = p.st === 'down', hide = o.hide === i; this.phase[i] += dt * sp * 1.9; const sw = down ? 0.3 : Math.sin(this.phase[i]) * Math.min(1, sp / 5) * 0.9;
      let tilt = down ? -1.45 : p.mv === 'dive' || p.mv === 'hit' ? -1.15 : -Math.min(0.3, sp * 0.03), spin = p.mv === 'spin' ? (0.45 - p.mvT) * 14 : 0;
      E.set(0, -p.face - spin, tilt, 'YZX'); Q.setFromEuler(E); V.set(p.x, (down ? 0.25 : 0) + p.y, p.z); B.compose(V, Q, hide ? SC.set(0, 0, 0) : SC.set(big, big, big));
      const part = (mesh, k, px, py, pz, rz, len) => { M.copy(B).multiply(T1.makeTranslation(px, py, pz)).multiply(R1.makeRotationZ(rz)).multiply(T1.makeTranslation(0, -len / 2, 0)); mesh.setMatrixAt(k, M); };
      part(this.torso, i, 0, 1.64, 0, 0, 0.78); part(this.helm, i, 0.03, 1.84, 0, 0, 0);
      part(this.legs, i * 2, 0, 0.88, -0.14, sw, 0.85); part(this.legs, i * 2 + 1, 0, 0.88, 0.14, -sw, 0.85);
      const arm = p.mv === 'stiff' ? 1.5 : p.mv === 'jump' ? 2.9 : p.id === sim.carrier ? 0.5 : -sw; part(this.arms, i * 2, 0, 1.58, -0.42, arm, 0.62); part(this.arms, i * 2 + 1, 0, 1.58, 0.42, p.mv === 'jump' ? 2.9 : sw, 0.62);
      M.makeTranslation(p.x, 0.04, p.z); if (hide) M.scale(V.set(0, 0, 0)); this.shade.setMatrixAt(n++, M);
    }
    const b = sim.ball, bs = this.table ? 1.5 : 1; M.makeTranslation(b.x, 0.045, b.z); M.scale(V.set(0.5, 1, 0.5)); this.shade.setMatrixAt(22, M);
    for (const m of [this.torso, this.helm, this.legs, this.arms, this.shade]) m.instanceMatrix.needsUpdate = true;
    if (o.ballAt) this.ball.position.copy(o.ballAt); else this.ball.position.set(b.x, Math.max(0.1, b.y), b.z); this.ball.scale.setScalar(bs);
    if (b.st === 'air' || b.st === 'kick') { this.ball.rotation.set(0, Math.atan2(-b.vz, b.vx), Math.atan2(b.vy, Math.hypot(b.vx, b.vz))); this.ball.rotateX(performance.now() * 0.02); } else this.ball.rotation.set(0, 0, 0);
    const live = sim.phase === 'pre' || sim.phase === 'live' || sim.phase === 'call'; this.los.visible = this.gain.visible = live && !sim.past; this.los.position.x = sim.los; this.gain.position.x = sim.first; this.gain.visible &&= Math.abs(sim.first) < 50;
    const at = (r, id) => { r.visible = id >= 0 && id !== o.hide; if (r.visible) { r.position.x = sim.P[id].x; r.position.z = sim.P[id].z; } };
    at(this.rCtl, sim.ctl); at(this.rSel, o.sel ?? -1); at(this.rHov, o.hover ?? -1);
    this.rLand.visible = b.st === 'air' && !!b.land; if (this.rLand.visible) { this.rLand.position.x = b.land.x; this.rLand.position.z = b.land.z; }
    this.rSpot.visible = !!o.spot; if (o.spot) { this.rSpot.position.x = o.spot.x; this.rSpot.position.z = o.spot.z; }
    const pass = o.targets; let k = 0; if (pass) for (const r of sim.team(sim.poss)) { if (!r.elig || k > 4) continue; const m = this.marks[k++], op = sim.open(r, 0.5); m.visible = true; m.position.set(r.x, 3.4 * big + (o.far ? Math.hypot(r.x - o.far.x, r.z - o.far.z) * 0.04 : 0), r.z); m.scale.setScalar(o.far ? 1 + Math.hypot(r.x - o.far.x, r.z - o.far.z) * 0.035 : 1.6); m.material.color.set(op > 3.5 ? 0x30e060 : op > 2 ? 0xffd030 : 0xff4030); }
    for (; k < 5; k++) this.marks[k].visible = false;
    this.score(sim);
  }
}
