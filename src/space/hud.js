// SPACE FLEET's words in the headset: the command panel on your left wrist (credits, the shipyard's buttons, the room/space switch) and the notice that hangs over the field
import * as THREE from 'three';
import { TYPES, CAP, QMAX } from './sim.js';

const W = 512, H = 640, KEYS = [1, 2, 3, 4, 5], COL = ['#3aa0ff', '#ff6a2a'];
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
    const key = [s.costs && s.costs[1].cost, s.credits | 0, s.income, s.count, s.queue.map(q => q.type + ':' + Math.round(q.done * 20)).join(), s.me, s.ar, s.state, s.extra, this.hot].join('|'); if (key === this.key) return; this.key = key;
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
    x.textAlign = 'center'; x.fillStyle = '#7f8ea6'; x.font = '18px system-ui,sans-serif';
    x.fillText('TRIGGER a ship: drag it where to go, or onto a target', W / 2, y + 86); x.fillText('TRIGGER empty space: drag a bubble to pick many', W / 2, y + 110); x.fillText('GRIP: move the field   both GRIPS: turn and size it', W / 2, y + 134);
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
export { Panel, Banner };
