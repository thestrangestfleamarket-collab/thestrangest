// SPACE FLEET's words in the headset: the console that floats beside you (credits, the shipyard, pause, the view, the guide, the lens), the notice that hangs over the field, and the guide
import * as THREE from 'three';
import { TYPES, CAP, QMAX } from './sim.js';

const W = 1000, H = 760, KEYS = [1, 2, 3, 4, 5], COL = ['#3aa0ff', '#ff6a2a'];
const NOTE = ['', ['fast swarm', 'beats cruisers'], ['line ship', 'beats fighters'], ['heavy beam', 'beats frigates'], ['gun platform', 'holds a spot'], ['hidden', 'blasts what nears']];

// the console: one board that floats at your left hand's side, big enough to read at a glance. Point EITHER controller at a button and pull the trigger; hold a grip on it to carry it somewhere else
class Panel {
  constructor() {
    this.c = document.createElement('canvas'); this.c.width = W; this.c.height = H; this.x = this.c.getContext('2d'); this.w = 0.5; this.h = 0.38;
    this.tex = new THREE.CanvasTexture(this.c); this.tex.colorSpace = THREE.SRGBColorSpace; this.tex.anisotropy = 4;
    this.mesh = new THREE.Mesh(new THREE.PlaneGeometry(this.w, this.h), new THREE.MeshBasicMaterial({ map: this.tex, transparent: true, toneMapped: false, side: THREE.DoubleSide, depthTest: false })); this.mesh.renderOrder = 25;
    this.btn = []; this.key = ''; this.hot = -1; this.hot2 = -1; this.pinned = false; this.placed = false; this.t = new THREE.Vector3(); this.flash = -1; this.flashAt = 0;
  }
  // it keeps to your left, low, turned to your face; once you have carried it somewhere it stays there
  follow(head, fwd, force) { const m = this.mesh; if (!this.pinned || force) { const tx = head.x + fwd.x * 0.5 + fwd.z * 0.42, tz = head.z + fwd.z * 0.5 - fwd.x * 0.42, ty = head.y - 0.33; if (force) this.pinned = false;
      if (!this.placed || force || Math.hypot(m.position.x - tx, m.position.z - tz) > 0.55 || Math.abs(m.position.y - ty) > 0.35) { this.t.set(tx, ty, tz); if (!this.placed || force) m.position.copy(this.t); this.placed = true; }
      m.position.lerp(this.t, 0.1); m.lookAt(head); } }
  // where a button's middle is in the room (for the check, and for the pointer)
  spot(i, out) { const b = this.btn[i]; return this.mesh.localToWorld(out.set(((b.x0 + b.x1) / 2 / W - 0.5) * this.w, (0.5 - (b.y0 + b.y1) / 2 / H) * this.h, 0)); }
  press(i) { this.flash = i; this.flashAt = performance.now(); this.key = ''; }
  // s: { credits, income, count, queue, me, ar, canAR, state, extra, paused, fx, guide, costs }
  draw(s) {
    const lit = this.flash >= 0 && performance.now() - this.flashAt < 220 ? this.flash : -1; if (lit < 0) this.flash = -1;
    const key = [lit, s.paused, s.fx, s.guide, s.costs && s.costs[1].cost, s.credits | 0, s.income, s.count, s.queue.map(q => q.type + ':' + Math.round(q.done * 20)).join(), s.me, s.ar, s.state, s.extra, this.hot, this.hot2].join('|'); if (key === this.key) return; this.key = key;
    const x = this.x, play = s.state === 'play'; x.clearRect(0, 0, W, H); x.fillStyle = 'rgba(6,10,18,0.94)'; x.beginPath(); x.roundRect(3, 3, W - 6, H - 6, 34); x.fill(); x.strokeStyle = COL[s.me]; x.lineWidth = 6; x.stroke();
    x.textBaseline = 'middle'; x.textAlign = 'left'; x.fillStyle = '#ffd766'; x.font = 'bold 64px system-ui,sans-serif'; x.fillText('\u25C8 ' + (s.credits | 0), 36, 62);
    x.fillStyle = '#9fb0c8'; x.font = '32px system-ui,sans-serif'; x.fillText('+' + s.income + ' a second', 330, 66); x.textAlign = 'right'; x.fillStyle = s.count >= CAP ? '#ff6a5a' : '#cfd8e6'; x.fillText('FLEET ' + s.count + ' / ' + CAP, W - 36, 66);
    x.textAlign = 'left'; x.fillStyle = '#7f8ea6'; x.font = '26px system-ui,sans-serif'; x.fillText('BUILD  \u2014  point at a ship and pull the trigger', 36, 128);
    this.btn = []; const tw = (W - 36 * 2 - 14 * 4) / 5;
    KEYS.forEach((t, i) => { const T = (s.costs || TYPES)[t], x0 = 36 + i * (tw + 14), y0 = 156, th = 330, full = s.count + s.queue.length >= CAP || s.queue.length >= QMAX, ok = play && s.credits >= T.cost && !full, n = s.queue.filter(q => q.type === t).length, hot = this.hot === i || this.hot2 === i;
      x.fillStyle = lit === i ? '#3f8f5f' : hot ? (ok ? '#2b4f86' : '#2a2f3a') : ok ? '#172a46' : '#10151e'; x.beginPath(); x.roundRect(x0, y0, tw, th, 20); x.fill(); if (hot) { x.strokeStyle = ok ? '#7fc0ff' : '#5a6474'; x.lineWidth = 5; x.stroke(); }
      const first = s.queue[0] && s.queue[0].type === t ? s.queue[0].done : 0; if (first) { x.fillStyle = 'rgba(80,220,140,0.4)'; x.beginPath(); x.roundRect(x0, y0 + th - 26, tw * first, 26, [0, 0, 20, 20]); x.fill(); }
      x.textAlign = 'center'; x.fillStyle = ok ? '#fff' : '#66707f'; x.font = 'bold 32px system-ui,sans-serif'; x.fillText(T.name, x0 + tw / 2, y0 + 44);
      x.font = 'bold 70px system-ui,sans-serif'; x.fillStyle = ok ? '#ffd766' : '#7a6a3a'; x.fillText(T.cost, x0 + tw / 2, y0 + 128);
      x.font = '24px system-ui,sans-serif'; x.fillStyle = ok ? '#9fb0c8' : '#566070'; x.fillText(NOTE[t][0], x0 + tw / 2, y0 + 198); x.fillText(NOTE[t][1], x0 + tw / 2, y0 + 230);
      x.font = 'bold 24px system-ui,sans-serif'; x.fillStyle = n ? '#6fe0a0' : !play ? '#566070' : full ? '#ff8a6a' : s.credits < T.cost ? '#b8894a' : '#566070'; x.fillText(n ? 'building ' + n : !play ? '' : full ? 'yard full' : s.credits < T.cost ? 'need ' + (T.cost - (s.credits | 0)) : '', x0 + tw / 2, y0 + 278);
      this.btn.push({ x0, y0, x1: x0 + tw, y1: y0 + th, id: 'b' + t }); });
    const y = 514, bh = 92, row = (k, n, label, id, on, glow) => { const bw = (W - 72 - 14 * (n - 1)) / n, x0 = 36 + k * (bw + 14), i = this.btn.length; x.fillStyle = lit === i ? '#3f8f5f' : (this.hot === i || this.hot2 === i) ? '#2b4f86' : glow ? '#285a3c' : on ? '#1b3050' : '#10151e'; x.beginPath(); x.roundRect(x0, y, bw, bh, 18); x.fill(); if (this.hot === i || this.hot2 === i) { x.strokeStyle = '#7fc0ff'; x.lineWidth = 5; x.stroke(); }
      x.textAlign = 'center'; x.fillStyle = on ? '#fff' : '#66707f'; x.font = 'bold 28px system-ui,sans-serif'; x.fillText(label, x0 + bw / 2, y + bh / 2 + 2); this.btn.push({ x0, y0: y, x1: x0 + bw, y1: y + bh, id }); };
    row(0, 5, s.paused ? 'RESUME' : 'PAUSE', 'pause', play, s.paused); row(1, 5, s.extra || 'PICK ALL', s.extra ? 'x' : 'all', true, !!s.extra); row(2, 5, s.ar ? 'SEE SPACE' : 'SEE ROOM', 'ar', s.canAR); row(3, 5, s.guide ? 'SKIP GUIDE' : 'GUIDE', 'guide', true, s.guide); row(4, 5, s.fx ? 'LENS ON' : 'LENS OFF', 'fx', !s.ar, s.fx && !s.ar);
    x.textAlign = 'center'; x.fillStyle = '#7f8ea6'; x.font = '25px system-ui,sans-serif';
    x.fillText('TRIGGER a ship and drag: send it.  Drop it on an enemy: attack.  Tap twice: stop.', W / 2, 648); x.fillText('RIGHT stick: zoom and turn.  LEFT stick: fly.  Click a stick: pause.  GRIP: drag the field.', W / 2, 684); x.fillText('Hold a GRIP on this board to move it.', W / 2, 720);
    this.tex.needsUpdate = true;
  }
  // which button a spot on the board (uv 0..1) is on
  at(uv) { const px = uv.x * W, py = (1 - uv.y) * H; for (let i = 0; i < this.btn.length; i++) { const b = this.btn[i]; if (px >= b.x0 && px <= b.x1 && py >= b.y0 && py <= b.y1) return i; } return -1; }
}

class Banner {
  constructor() { this.c = document.createElement('canvas'); this.c.width = 1024; this.c.height = 256; this.tex = new THREE.CanvasTexture(this.c); this.tex.colorSpace = THREE.SRGBColorSpace;
    this.mesh = new THREE.Mesh(new THREE.PlaneGeometry(0.72, 0.18), new THREE.MeshBasicMaterial({ map: this.tex, transparent: true, toneMapped: false, depthTest: false })); this.mesh.renderOrder = 20; this.mesh.visible = false; this.key = ''; this.until = 0; }
  set(text, color = '#ffffff', secs = 0) { this.until = secs ? performance.now() + secs * 1000 : 0; if (text === this.key) return; this.key = text; this.mesh.visible = !!text; if (!text) return; const x = this.c.getContext('2d'); x.clearRect(0, 0, 1024, 256);
    const lines = text.split('\n'); x.textAlign = 'center'; x.textBaseline = 'middle'; x.shadowColor = 'rgba(0,0,0,0.9)'; x.shadowBlur = 14;
    lines.forEach((l, i) => { x.fillStyle = i ? '#c8d2e2' : color; x.font = (i ? '40px' : 'bold 84px') + ' system-ui,sans-serif'; x.fillText(l, 512, lines.length === 1 ? 128 : i ? 190 : 88); }); this.tex.needsUpdate = true; }
  tick(now) { if (this.until && now > this.until) this.set(''); }
}
// the guide: a board that hangs beside the field and walks you through one thing at a time, moving on when you have done it
const STEPS = [
  ['YOUR FLEET', ['Your ships are the ones nearest you. They fly and fight', 'on their own; you only give the orders.', '', 'Point a controller at one of your ships.'], 'hover'],
  ['SEND A SHIP', ['Hold the TRIGGER (index finger) on your ship, drag', 'the green dot to where it should go, and let go.', 'Order it again and it does that next: a mission.', 'Tap a ship twice to cancel its mission.'], 'ordered'],
  ['PICK MANY', ['Hold the TRIGGER on empty space and drag: a bubble', 'grows between where you began and where you point.', 'Let go with two or more ships inside it.', '(B or Y picks every warship at once.)'], 'multi'],
  ['ATTACK', ['Drag a picked ship ONTO an enemy (the dot turns red)', 'and let go: everything you picked goes for it.', 'Or just pull the trigger on an enemy.'], 'attacked'],
  ['BUILD', ['The CONSOLE floats at your left. Point either', 'controller at a ship on it and pull the trigger.', 'Fighters beat cruisers, frigates beat fighters,', 'cruisers beat frigates.'], 'built'],
  ['ZOOM AND FLY', ['RIGHT thumbstick up/down: zoom in on what you point at.', 'RIGHT stick left/right: turn the field.', 'LEFT thumbstick: fly through it.', 'Or hold a GRIP to drag the field; both to size it.'], 'moved'],
  ['PAUSE', ['Click a thumbstick in (or PAUSE on the console) to freeze', 'the battle. You can still look around, zoom in and give', 'orders. Click again to go on.'], 'paused'],
  ['WIN', ['Hold the ringed relays for more income.', 'Destroy the enemy mothership to win.', 'A or X: your room, or open space.', '', 'Pull a trigger to begin.'], 'go'],
];
class Guide {
  constructor() { this.c = document.createElement('canvas'); this.c.width = 1100; this.c.height = 620; this.tex = new THREE.CanvasTexture(this.c); this.tex.colorSpace = THREE.SRGBColorSpace; this.tex.anisotropy = 4;
    this.mesh = new THREE.Mesh(new THREE.PlaneGeometry(0.82, 0.462), new THREE.MeshBasicMaterial({ map: this.tex, transparent: true, toneMapped: false, depthTest: false })); this.mesh.renderOrder = 30; this.mesh.visible = false; this.on = false; this.i = 0; this.did = {}; this.at = 0; this.key = -1; this.placed = false; }
  start() { this.on = true; this.i = 0; this.did = {}; this.at = performance.now(); this.key = -1; this.placed = false; this.mesh.visible = true; }
  stop() { this.on = false; this.mesh.visible = false; try { localStorage.setItem('spaceGuide', '1'); } catch (e) {} }
  // something the player did; the step that waits for it moves on (not at once: the words stay a moment so they are read)
  mark(what) { if (this.on) this.did[what] = 1; }
  tick(now, head, fwd) {
    if (!this.on) return; const st = STEPS[this.i]; if (this.did[st[2]] && now - this.at > 1800) { this.did = {}; this.i++; this.at = now; if (this.i >= STEPS.length) return this.stop(); }
    // it keeps to your right, a little ahead, and follows only when you have turned well away
    const tx = head.x + fwd.x * 0.95 - fwd.z * 0.52, tz = head.z + fwd.z * 0.95 + fwd.x * 0.52, ty = head.y - 0.02, m = this.mesh; if (!this.placed || Math.hypot(m.position.x - tx, m.position.z - tz) > 0.7) { this.placed = true; this.tx = tx; this.ty = ty; this.tz = tz; if (m.position.lengthSq() === 0) m.position.set(tx, ty, tz); }
    m.position.x += (this.tx - m.position.x) * 0.08; m.position.y += (this.ty - m.position.y) * 0.08; m.position.z += (this.tz - m.position.z) * 0.08; m.lookAt(head);
    const done = this.did[STEPS[this.i][2]] ? 1 : 0, key = this.i * 2 + done; if (key === this.key) return; this.key = key; const x = this.c.getContext('2d'), s = STEPS[this.i]; x.clearRect(0, 0, 1100, 620);
    x.fillStyle = 'rgba(6,10,18,0.92)'; x.beginPath(); x.roundRect(0, 0, 1100, 620, 36); x.fill(); x.strokeStyle = done ? '#6fe0a0' : '#3aa0ff'; x.lineWidth = 6; x.stroke();
    x.textBaseline = 'middle'; x.textAlign = 'left'; x.fillStyle = '#7f8ea6'; x.font = '30px system-ui,sans-serif'; x.fillText('HOW TO PLAY   ' + (this.i + 1) + ' of ' + STEPS.length, 50, 60); x.textAlign = 'right'; x.fillText('SKIP GUIDE is on the console at your left', 1050, 60);
    x.textAlign = 'left'; x.fillStyle = done ? '#6fe0a0' : '#ffffff'; x.font = 'bold 78px system-ui,sans-serif'; x.fillText(s[0] + (done ? '  \u2713' : ''), 50, 160); x.fillStyle = '#d6deea'; x.font = '40px system-ui,sans-serif'; s[1].forEach((l, k) => x.fillText(l, 50, 260 + k * 62)); this.tex.needsUpdate = true; }
}
export { Panel, Banner, Guide, STEPS };
