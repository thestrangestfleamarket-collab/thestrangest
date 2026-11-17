// SPACE FLEET's words in the headset: the command panel on your left wrist (credits, the shipyard's buttons, the room/space switch) and the notice that hangs over the field
import * as THREE from 'three';
import { TYPES, CAP, QMAX } from './sim.js';

const W = 512, H = 644, KEYS = [1, 2, 3, 4, 5], COL = ['#3aa0ff', '#ff6a2a'];
const NOTE = ['', 'fast, hunts big ships', 'all-round, swats fighters', 'heavy beam, breaks hulls', 'slow gun platform', 'waits, then blasts'];

class Panel {
  constructor() {
    this.c = document.createElement('canvas'); this.c.width = W; this.c.height = H; this.x = this.c.getContext('2d');
    this.tex = new THREE.CanvasTexture(this.c); this.tex.colorSpace = THREE.SRGBColorSpace; this.tex.anisotropy = 4;
    this.mesh = new THREE.Mesh(new THREE.PlaneGeometry(0.2, 0.25), new THREE.MeshBasicMaterial({ map: this.tex, transparent: true, toneMapped: false, side: THREE.DoubleSide }));
    this.mesh.position.set(0.02, 0.13, -0.05); this.mesh.rotation.set(-0.75, 0.35, 0); this.btn = []; this.key = ''; this.hot = -1;
  }
  // s: { credits, income, count, queue, me, ar, canAR, state, extra }
  draw(s) {
    const key = [s.paused, s.fx, s.guide, s.costs && s.costs[1].cost, s.credits | 0, s.income, s.count, s.queue.map(q => q.type + ':' + Math.round(q.done * 20)).join(), s.me, s.ar, s.state, s.extra, this.hot].join('|'); if (key === this.key) return; this.key = key;
    const x = this.x; x.clearRect(0, 0, W, H); x.fillStyle = 'rgba(6,10,18,0.9)'; x.beginPath(); x.roundRect(0, 0, W, H, 28); x.fill(); x.strokeStyle = COL[s.me]; x.lineWidth = 4; x.stroke();
    x.textBaseline = 'middle'; x.textAlign = 'left'; x.fillStyle = '#ffd766'; x.font = 'bold 44px system-ui,sans-serif'; x.fillText('◈ ' + (s.credits | 0), 26, 46);
    x.fillStyle = '#9fb0c8'; x.font = '24px system-ui,sans-serif'; x.fillText('+' + s.income + '/s', 230, 50); x.textAlign = 'right'; x.fillStyle = s.count >= CAP ? '#ff6a5a' : '#cfd8e6'; x.fillText('FLEET ' + s.count + '/' + CAP, W - 26, 50);
    this.btn = []; const play = s.state === 'play';
    KEYS.forEach((t, i) => { const T = (s.costs || TYPES)[t], y = 86 + i * 82, ok = play && s.credits >= T.cost && s.queue.length < QMAX && s.count + s.queue.length < CAP, n = s.queue.filter(q => q.type === t).length, hot = this.hot === i;
      x.fillStyle = hot && ok ? '#24406a' : ok ? '#15243c' : '#10151e'; x.beginPath(); x.roundRect(18, y, W - 36, 72, 14); x.fill();
      const first = s.queue[0] && s.queue[0].type === t ? s.queue[0].done : 0; if (first) { x.fillStyle = 'rgba(80,220,140,0.35)'; x.beginPath(); x.roundRect(18, y, (W - 36) * first, 72, 14); x.fill(); }
      x.textAlign = 'left'; x.fillStyle = ok ? '#fff' : '#66707f'; x.font = 'bold 30px system-ui,sans-serif'; x.fillText(T.name, 36, y + 26); x.font = '19px system-ui,sans-serif'; x.fillStyle = ok ? '#9fb0c8' : '#566070'; x.fillText(NOTE[t], 36, y + 54);
      x.textAlign = 'right'; x.font = 'bold 30px system-ui,sans-serif'; x.fillStyle = ok ? '#ffd766' : '#7a6a3a'; x.fillText(T.cost, W - 36, y + 26); if (n) { x.font = '20px system-ui,sans-serif'; x.fillStyle = '#6fe0a0'; x.fillText('building ' + n, W - 36, y + 54); }
      this.btn.push({ x0: 18, y0: y, x1: W - 18, y1: y + 72, id: 'b' + t }); });
    const y = 86 + 5 * 82 + 6, half = (W - 46) / 2;
    const b2 = (x0, label, id, on, hot) => { x.fillStyle = hot ? '#2c4a78' : on ? '#1b3050' : '#10151e'; x.beginPath(); x.roundRect(x0, y, half, 60, 14); x.fill(); x.textAlign = 'center'; x.fillStyle = on ? '#fff' : '#66707f'; x.font = 'bold 24px system-ui,sans-serif'; x.fillText(label, x0 + half / 2, y + 31); this.btn.push({ x0, y0: y, x1: x0 + half, y1: y + 60, id }); };
    b2(18, s.ar ? 'VIEW: ROOM' : 'VIEW: SPACE', 'ar', s.canAR, this.hot === 5); b2(28 + half, s.extra || 'ALL SHIPS', s.extra ? 'x' : 'all', true, this.hot === 6);
    const y2 = y + 68, third = (W - 56) / 3, b3 = (k, label, id, on, lit) => { const x0 = 18 + k * (third + 10); x.fillStyle = this.hot === 7 + k ? '#2c4a78' : lit ? '#2a5a3a' : on ? '#1b3050' : '#10151e'; x.beginPath(); x.roundRect(x0, y2, third, 60, 14); x.fill(); x.textAlign = 'center'; x.fillStyle = on ? '#fff' : '#66707f'; x.font = 'bold 22px system-ui,sans-serif'; x.fillText(label, x0 + third / 2, y2 + 31); this.btn.push({ x0, y0: y2, x1: x0 + third, y1: y2 + 60, id }); };
    b3(0, s.paused ? 'RESUME' : 'PAUSE', 'pause', play, s.paused); b3(1, s.guide ? 'SKIP GUIDE' : 'GUIDE', 'guide', true, s.guide); b3(2, s.fx ? 'LENS: ON' : 'LENS: OFF', 'fx', !s.ar, s.fx && !s.ar);
    this.tex.needsUpdate = true;
  }
  // which button a spot on the panel (uv 0..1) is on
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
  ['BUILD', ['Your LEFT WRIST is the shipyard. Point your other', 'hand at a ship on it and pull the trigger.', 'Fighters beat cruisers, frigates beat fighters,', 'cruisers beat frigates.'], 'built'],
  ['ZOOM AND FLY', ['RIGHT thumbstick up/down: zoom in on what you point at.', 'RIGHT stick left/right: turn the field.', 'LEFT thumbstick: fly through it.', 'Or hold a GRIP to drag the field; both to size it.'], 'moved'],
  ['PAUSE', ['Click a thumbstick in (or PAUSE on your wrist) to freeze', 'the battle. You can still look around, zoom in and give', 'orders. Click again to go on.'], 'paused'],
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
    const tx = head.x + fwd.x * 0.95 - fwd.z * 0.62, tz = head.z + fwd.z * 0.95 + fwd.x * 0.62, ty = head.y - 0.02, m = this.mesh; if (!this.placed || Math.hypot(m.position.x - tx, m.position.z - tz) > 0.7) { this.placed = true; this.tx = tx; this.ty = ty; this.tz = tz; if (m.position.lengthSq() === 0) m.position.set(tx, ty, tz); }
    m.position.x += (this.tx - m.position.x) * 0.08; m.position.y += (this.ty - m.position.y) * 0.08; m.position.z += (this.tz - m.position.z) * 0.08; m.lookAt(head);
    const done = this.did[STEPS[this.i][2]] ? 1 : 0, key = this.i * 2 + done; if (key === this.key) return; this.key = key; const x = this.c.getContext('2d'), s = STEPS[this.i]; x.clearRect(0, 0, 1100, 620);
    x.fillStyle = 'rgba(6,10,18,0.92)'; x.beginPath(); x.roundRect(0, 0, 1100, 620, 36); x.fill(); x.strokeStyle = done ? '#6fe0a0' : '#3aa0ff'; x.lineWidth = 6; x.stroke();
    x.textBaseline = 'middle'; x.textAlign = 'left'; x.fillStyle = '#7f8ea6'; x.font = '30px system-ui,sans-serif'; x.fillText('HOW TO PLAY   ' + (this.i + 1) + ' of ' + STEPS.length, 50, 60); x.textAlign = 'right'; x.fillText('SKIP GUIDE is on your left wrist', 1050, 60);
    x.textAlign = 'left'; x.fillStyle = done ? '#6fe0a0' : '#ffffff'; x.font = 'bold 78px system-ui,sans-serif'; x.fillText(s[0] + (done ? '  \u2713' : ''), 50, 160); x.fillStyle = '#d6deea'; x.font = '40px system-ui,sans-serif'; s[1].forEach((l, k) => x.fillText(l, 50, 260 + k * 62)); this.tex.needsUpdate = true; }
}
export { Panel, Banner, Guide, STEPS };
