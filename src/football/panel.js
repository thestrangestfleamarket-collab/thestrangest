// FOURTH & LONG's board: one canvas you point at, with the play cards (formation and routes drawn), the pre-snap orders and the options
import * as THREE from 'three';
import { OFFENSE, DEFENSE, OCATS, DCATS, DALIGN, ROUTES, HOT, formation } from './plays.js';

const CW = 1024, CH = 640;
export class Panel {
  constructor() { const c = this.c = document.createElement('canvas'); c.width = CW; c.height = CH; this.tex = new THREE.CanvasTexture(c); this.tex.colorSpace = THREE.SRGBColorSpace; this.tex.anisotropy = 4;
    this.mesh = new THREE.Mesh(new THREE.PlaneGeometry(0.9, 0.9 * CH / CW), new THREE.MeshBasicMaterial({ map: this.tex, transparent: true, opacity: 0.96 })); this.btns = []; this.key = ''; this.hover = ''; }
  at(uv) { const x = uv.x * CW, y = (1 - uv.y) * CH; for (const b of this.btns) if (x >= b.x && x <= b.x + b.w && y >= b.y && y <= b.y + b.h) return b; return null; }
  offCard(g, p, x, y, w, h) {
    const s = 4.4, cx = x + w / 2, cy = y + h - 52, F = formation(p.form); g.strokeStyle = '#5a6578'; g.lineWidth = 2; g.beginPath(); g.moveTo(x + 10, cy); g.lineTo(x + w - 10, cy); g.stroke();
    F.forEach((f, i) => { const px = cx + f.s * s, py = cy - f.f * s + 5; g.fillStyle = i < 5 ? '#9aa6b8' : i === 5 ? '#fff' : '#ffe030'; g.beginPath(); g.arc(px, py, 5, 0, 7); g.fill(); if (i < 6) return; const j = p.sk[i - 6]; if (j === 'block') return;
      const legs = typeof j === 'string' ? ROUTES[j].w.map(([a, b]) => [px + (f.s < 0 ? -1 : 1) * b * s, py - a * s]) : j.run.map(([a, b]) => [cx + b * s, cy - a * s]); g.strokeStyle = typeof j === 'string' ? '#ffe030' : '#ff7a30'; g.lineWidth = 3; g.beginPath(); g.moveTo(px, py); for (const [a, b] of legs) g.lineTo(Math.max(x + 6, Math.min(x + w - 6, a)), Math.max(y + 6, b)); g.stroke(); });
  }
  defCard(g, p, x, y, w, h) {
    const s = 4.4, cx = x + w / 2, cy = y + h - 60; g.strokeStyle = '#5a6578'; g.lineWidth = 2; g.beginPath(); g.moveTo(x + 10, cy); g.lineTo(x + w - 10, cy); g.stroke();
    DALIGN.forEach(([f, sd], i) => { const j = p.jobs[i], px = cx + sd * s, py = cy - f * s; g.fillStyle = j === 'rush' ? '#ff5a40' : j === 'man' ? '#fff' : '#40c8ff'; g.font = '800 18px system-ui, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('X', px, py);
      if (j === 'rush') { g.strokeStyle = '#ff5a40'; g.lineWidth = 3; g.beginPath(); g.moveTo(px, py + 8); g.lineTo(px * 0.7 + cx * 0.3, cy + 22); g.stroke(); } else if (j !== 'man') { g.strokeStyle = 'rgba(64,200,255,.8)'; g.lineWidth = 2; g.beginPath(); g.ellipse(cx + j[1] * s, Math.max(y + 22, cy - j[0] * s), 30, 16, 0, 0, 7); g.stroke(); } });
  }
  draw(S) {
    const sim = S.sim, off = sim.poss === S.user, key = [sim.phase, sim.poss, sim.down, sim.los, S.tab, S.sel, S.auto, S.room, S.wx, S.hour, S.mode, this.hover, sim.msg, sim.call[S.user], sim.q, sim.score, sim.play && sim.phase === 'pre' ? sim.play.name : '', S.xr, S.selRoute].join('|'); if (key === this.key) return; this.key = key;
    const g = this.c.getContext('2d'), B = this.btns = []; g.clearRect(0, 0, CW, CH); g.fillStyle = 'rgba(12,16,24,.94)'; g.beginPath(); g.roundRect(0, 0, CW, CH, 28); g.fill();
    const text = (t, x, y, sz = 28, col = '#fff', al = 'left', wt = 700) => { g.fillStyle = col; g.font = wt + ' ' + sz + 'px system-ui, sans-serif'; g.textAlign = al; g.textBaseline = 'middle'; g.fillText(t, x, y); };
    const btn = (id, label, x, y, w, h, on, sz = 26) => { const hot = this.hover === id; g.fillStyle = on ? '#ffe030' : hot ? '#3a4a66' : '#1e2736'; g.beginPath(); g.roundRect(x, y, w, h, 12); g.fill(); if (hot) { g.strokeStyle = '#40e0ff'; g.lineWidth = 3; g.stroke(); } if (label) text(label, x + w / 2, y + h / 2 + 1, sz, on ? '#14100a' : '#fff', 'center', 800); B.push({ id, x, y, w, h }); };
    text(sim.names[0] + ' ' + sim.score[0] + '   ' + sim.names[1] + ' ' + sim.score[1], 28, 40, 30, '#fff', 'left', 800); text(sim.phase === 'over' ? 'FINAL' : 'Q' + Math.min(4, sim.q) + '  ' + Math.floor(sim.clock / 60) + ':' + String(Math.floor(sim.clock % 60)).padStart(2, '0') + '   ' + sim.downText + '   ' + sim.yard, CW - 28, 40, 28, '#ffe030', 'right', 800);
    const opts = () => { const o = [['auto', 'QB VIEW: ' + (S.auto ? 'AUTO' : 'MANUAL'), 236], ['wx', S.wx, 150], ['hour', S.hour, 110], ...(S.xr ? [['room', S.room ? 'YOUR ROOM' : 'STADIUM', 170]] : []), ['view', S.mode === 'first' ? 'TABLE VIEW' : 'FIELD VIEW', 150], ['again', 'NEW GAME', 140]]; let x = 22; for (const [id, t, w] of o) { btn(id, t, x, 568, w, 52, false, 20); x += w + 8; } };
    if (sim.phase === 'call') {
      const cats = off ? OCATS : DCATS, list = (off ? OFFENSE : DEFENSE).map((p, i) => [p, i]).filter(([p]) => p.cat === S.tab); text(off ? 'OFFENSE: CHOOSE A PLAY' : 'DEFENSE: CHOOSE A PLAY', 28, 96, 26, '#9fb0c8');
      cats.forEach((c, i) => btn('tab:' + c, c, 420 + i * 148, 72, 138, 48, c === S.tab, 22));
      list.slice(0, 6).forEach(([p, i], k) => { const x = 28 + (k % 3) * 326, y = 134 + Math.floor(k / 3) * 212, w = 314, h = 200; btn('play:' + i, '', x, y, w, h, false); if (off) this.offCard(g, p, x, y, w, h - 34); else this.defCard(g, p, x, y, w, h - 30); text(p.name, x + w / 2, y + h - 20, 24, '#fff', 'center', 800); });
      opts();
    } else if (sim.phase === 'pre') {
      text(off ? sim.play.name : sim.dplay.name, 28, 104, 44, '#fff', 'left', 900);
      const L = off ? (S.xr ? ['A: snap the ball     B: pick another play', 'Point at one of yours and pull the trigger, then:', '   point at a spot: he runs there', '   point at a defender: he blocks him', '   or give him a new route below'] : ['SPACE: snap     E: pick another play', 'Click one of yours, then click a spot (he runs there),', 'a defender (he blocks him), or a route below'])
        : (S.xr ? ['You are the ringed defender. B: switch to the nearest one', 'Point at one of yours and pull the trigger, then:', '   point at a spot: he guards it', '   point at a receiver: he covers him', '   point at the quarterback: he blitzes'] : ['You are the ringed defender. E: switch', 'Click one of yours, then a spot (he guards it),', 'a receiver (he covers him) or the quarterback (he blitzes)']);
      L.forEach((t, i) => text(t, 28, 170 + i * 42, 27, i ? '#c8d2e0' : '#ffe030'));
      if (off) { if (S.selRoute) { text('NEW ROUTE:', 28, 420, 24, '#9fb0c8'); HOT.forEach((r, i) => btn('hot:' + r, r.toUpperCase(), 28 + i * 140, 444, 130, 56, false, 22)); } btn('snap', 'SNAP', 28, 568, 220, 52, true); btn('audible', 'OTHER PLAY', 264, 568, 220, 52, false, 22); }
      else text('The offense snaps when it is ready.', 28, 594, 26, '#9fb0c8');
    } else if (sim.phase === 'over') { text(sim.msg, CW / 2, 250, 64, '#ffe030', 'center', 900); text(sim.score[0] + '  -  ' + sim.score[1], CW / 2, 350, 80, '#fff', 'center', 900); btn('again', 'PLAY AGAIN', CW / 2 - 160, 450, 320, 70, true, 30); }
    else { text(sim.msg || '', CW / 2, 280, sim.msg.length > 28 ? 44 : 64, '#fff', 'center', 900); if (sim.phase === 'dead') text(S.xr ? 'A: next play' : 'SPACE: next play', CW / 2, 380, 26, '#9fb0c8', 'center'); opts(); }
    this.tex.needsUpdate = true;
  }
}
