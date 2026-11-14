// COLD BORE's board: one drawn panel for contracts, briefing, the live log and the debrief, pointed at in a headset and clicked on a screen
import * as THREE from 'three';

const W = 1024, H = 768, FONT = 'system-ui, -apple-system, "Segoe UI", sans-serif', MONO = 'ui-monospace, Menlo, Consolas, monospace';
const css = (c) => `rgb(${c.map(v => Math.round(Math.min(1, v) * 255)).join(',')})`;

export class Board {
  constructor(game) {
    this.g = game; const c = this.c = document.createElement('canvas'); c.width = W; c.height = H; c.id = 'board'; this.x = c.getContext('2d'); this.buttons = []; this.hover = -1; this.screen = 'missions'; this.log = []; this.data = {};
    this.tex = new THREE.CanvasTexture(c); this.tex.colorSpace = THREE.SRGBColorSpace; this.tex.anisotropy = 8;
    this.mesh = new THREE.Mesh(new THREE.PlaneGeometry(1.3, 0.975), new THREE.MeshBasicMaterial({ map: this.tex, toneMapped: false, fog: false })); this.mesh.position.set(-1.05, 1.32, -0.95); this.mesh.rotation.y = 0.75; game.rig.add(this.mesh);
    const frame = new THREE.Mesh(new THREE.BoxGeometry(1.34, 1.015, 0.02), new THREE.MeshStandardMaterial({ color: 0x15181a, roughness: 0.6 })); frame.position.z = -0.012; this.mesh.add(frame);
    this.dot = new THREE.Mesh(new THREE.CircleGeometry(0.008, 12), new THREE.MeshBasicMaterial({ color: 0xff6a30, toneMapped: false, fog: false })); this.dot.position.z = 0.002; this.dot.visible = false; this.mesh.add(this.dot);
    this.ray = new THREE.Raycaster(); document.body.appendChild(c);
    c.addEventListener('mousemove', (e) => { const r = c.getBoundingClientRect(); this.point((e.clientX - r.left) / r.width * W, (e.clientY - r.top) / r.height * H); });
    c.addEventListener('click', (e) => { const r = c.getBoundingClientRect(); this.point((e.clientX - r.left) / r.width * W, (e.clientY - r.top) / r.height * H); this.click(); });
  }
  show(screen, data) { this.screen = screen; if (data) this.data = data; this.hover = -1; this.draw(); }
  say(line) { this.log.push(line); if (this.log.length > 7) this.log.shift(); if (this.screen === 'live') this.draw(); }
  point(px, py) { const i = this.buttons.findIndex(b => px >= b.x && px <= b.x + b.w && py >= b.y && py <= b.y + b.h); if (i !== this.hover) { this.hover = i; this.draw(); } return i; }
  click() { const b = this.buttons[this.hover]; if (b) { this.g.audio.start(); this.g.audio.play('ui'); b.fn(); } }
  // a controller's ray in the world: where it meets the board
  aim(origin, dir) { this.ray.set(origin, dir); const h = this.ray.intersectObject(this.mesh, false)[0]; if (!h || !h.uv) return false; this.point(h.uv.x * W, (1 - h.uv.y) * H); this.dot.visible = true; this.dot.position.set((h.uv.x - 0.5) * 1.3, (h.uv.y - 0.5) * 0.975, 0.002); return true; }
  btn(label, x, y, w, h, fn, o = {}) { const g = this.x, i = this.buttons.length, hot = this.hover === i; this.buttons.push({ x, y, w, h, fn });
    g.fillStyle = o.primary ? (hot ? '#ff8450' : '#ff6a30') : hot ? '#24424e' : '#14262e'; g.strokeStyle = o.primary ? '#ffb090' : hot ? '#6fc8dc' : '#2a4e5c'; g.lineWidth = 2; g.beginPath(); g.roundRect(x, y, w, h, 10); g.fill(); g.stroke();
    g.fillStyle = o.primary ? '#140700' : '#e6edf2'; g.font = `800 ${o.size || 26}px ${FONT}`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(label, x + w / 2, y + h / 2 + 1); }
  wrap(text, x, y, w, lh) { const g = this.x, words = text.split(' '); let line = ''; for (const wd of words) { const t = line ? line + ' ' + wd : wd; if (g.measureText(t).width > w && line) { g.fillText(line, x, y); y += lh; line = wd; } else line = t; } if (line) { g.fillText(line, x, y); y += lh; } return y; }
  stars(n, x, y, s = 22) { const g = this.x; g.font = `${s}px ${FONT}`; g.textAlign = 'left'; g.textBaseline = 'middle'; for (let i = 0; i < 3; i++) { g.fillStyle = i < n ? '#ffd040' : '#33424a'; g.fillText('★', x + i * s * 1.1, y); } }
  doll(L, x, y, s) { const g = this.x, r = (c, a, b, w, h) => { g.fillStyle = css(c); g.fillRect(x + a * s, y + b * s, w * s, h * s); }, skin = [0.85, 0.68, 0.56];
    r(L.legs || [0.15, 0.15, 0.2], -0.17, 0.95, 0.15, 0.85); r(L.legs || [0.15, 0.15, 0.2], 0.02, 0.95, 0.15, 0.85); r(L.coat, -0.24, 0.32, 0.48, 0.66); r(L.coat, -0.36, 0.34, 0.11, 0.6); r(L.coat, 0.25, 0.34, 0.11, 0.6);
    if (L.tie) { r([0.95, 0.95, 0.95], -0.07, 0.32, 0.14, 0.3); r(L.tie, -0.03, 0.34, 0.06, 0.36); } g.fillStyle = css(skin); g.beginPath(); g.arc(x, y + 0.16 * s, 0.14 * s, 0, 7); g.fill();
    if (!L.bald && !L.hat) { g.fillStyle = '#1a120c'; g.beginPath(); g.arc(x, y + 0.13 * s, 0.145 * s, Math.PI, 0); g.fill(); } if (L.hat) { r(L.hat, -0.24, 0.04, 0.48, 0.04); r(L.hat, -0.14, -0.08, 0.28, 0.13); } if (L.cap) r(L.cap, -0.15, -0.02, 0.36, 0.09);
    if (L.shades) r([0.02, 0.02, 0.02], -0.12, 0.12, 0.24, 0.05); if (L.case) r(L.case, 0.24, 0.94, 0.3, 0.22); if (L.phone) r([0.05, 0.05, 0.06], 0.13, 0.1, 0.05, 0.14); }
  draw() {
    const g = this.x, G = this.g, d = this.data; this.buttons = []; g.fillStyle = '#0a1116'; g.fillRect(0, 0, W, H); g.fillStyle = '#101b22'; g.fillRect(0, 0, W, 84); g.fillStyle = '#ff6a30'; g.fillRect(0, 84, W, 3);
    g.textBaseline = 'middle'; g.textAlign = 'left'; g.fillStyle = '#e6edf2'; g.font = `900 40px ${FONT}`; g.fillText('COLD BORE', 34, 44); g.fillStyle = '#7f98a6'; g.font = `600 20px ${FONT}`; g.textAlign = 'right';
    g.fillText({ missions: 'CONTRACTS', brief: 'BRIEFING', live: 'ON THE GLASS', debrief: 'DEBRIEF' }[this.screen], W - 34, 46);
    if (this.screen === 'missions') {
      G.missions.forEach((m, i) => { const y = 110 + i * 104, rec = G.save.done[m.id]; this.btn('', 34, y, W - 68, 92, () => G.load(i)); g.textAlign = 'left'; g.fillStyle = '#ff6a30'; g.font = `900 22px ${MONO}`; g.fillText('0' + (i + 1), 58, y + 46);
        g.fillStyle = '#e6edf2'; g.font = `800 30px ${FONT}`; g.fillText(m.name, 110, y + 32); g.fillStyle = '#8fa6b2'; g.font = `500 20px ${FONT}`; g.fillText(m.tag, 110, y + 66);
        if (rec) { this.stars(rec.stars, W - 190, y + 34, 26); g.fillStyle = '#8fa6b2'; g.font = `500 17px ${MONO}`; g.textAlign = 'right'; g.fillText(rec.shots + (rec.shots === 1 ? ' round' : ' rounds'), W - 60, y + 68); } });
      const S = G.settings, tog = (label, key, x) => this.btn((S[key] ? '[x] ' : '[  ] ') + label, x, 660, 228, 56, () => { S[key] = !S[key]; G.saveAll(); this.draw(); }, { size: 19 });
      tog('Assisted reload', 'assist', 34); tog('Grip toggles', 'toggle', 276); tog('Spotter voice', 'voice', 518); tog('Left-handed', 'lefty', 760);
    } else if (this.screen === 'brief') {
      const m = d.m; g.textAlign = 'left'; g.fillStyle = '#e6edf2'; g.font = `900 38px ${FONT}`; g.fillText(m.name, 34, 128); g.fillStyle = '#ff6a30'; g.font = `700 19px ${MONO}`; g.fillText(m.tag.toUpperCase(), 34, 166);
      const tw = m.dossier ? 610 : W - 68; g.fillStyle = '#c8d4dc'; g.font = `500 22px ${FONT}`; let y = 212; for (const line of m.brief) y = this.wrap(line, 34, y, tw, 29) + 12;
      if (m.dossier) { g.fillStyle = '#e9e4d2'; g.fillRect(680, 108, 310, 470); g.fillStyle = '#8a1c1c'; g.font = `900 17px ${MONO}`; g.textAlign = 'left'; g.fillText('TARGET', 698, 130); g.fillStyle = '#16181a'; g.font = `900 23px ${FONT}`; g.fillText(m.dossier.name, 698, 160);
        g.fillStyle = '#cfc9b4'; g.fillRect(698, 180, 274, 232); this.doll(m.dossier.look, 835, 196, 112); g.fillStyle = '#16181a'; g.font = `600 21px ${FONT}`; m.dossier.lines.forEach((s, i) => g.fillText('· ' + s, 700, 444 + i * 31)); }
      g.fillStyle = '#8ff0b0'; g.font = `700 19px ${MONO}`; g.textAlign = 'left'; g.fillText(`WIND ${m.wind.speed.toFixed(1)} m/s gusting · ${m.rounds} rounds`, 34, 628);
      this.btn('BEGIN', 34, 660, 300, 76, () => G.begin(), { primary: true, size: 32 }); this.btn('CONTRACTS', 354, 660, 240, 76, () => G.toMissions());
    } else if (this.screen === 'live') {
      g.textAlign = 'left'; g.fillStyle = '#ff6a30'; g.font = `700 19px ${MONO}`; g.fillText(G.mission.def.name, 34, 122); g.fillStyle = '#e6edf2'; g.font = `700 26px ${FONT}`; this.wrap(G.objectiveText || '', 34, 160, W - 68, 34);
      g.fillStyle = '#8fa6b2'; g.font = `700 18px ${MONO}`; g.fillText('SPOTTER', 34, 262); g.font = `500 23px ${FONT}`; this.log.forEach((s, i) => { g.fillStyle = i === this.log.length - 1 ? '#ffe9a0' : '#9fb0ba'; g.fillText(s, 34, 300 + i * 40); });
      g.fillStyle = '#8ff0b0'; g.font = `700 22px ${MONO}`; g.fillText(`ROUNDS LEFT ${Math.max(0, G.mission.def.rounds - G.shots)}`, 34, 610);
      this.btn('ABORT', 34, 660, 220, 76, () => G.toMissions()); this.btn('RESTART', 274, 660, 220, 76, () => G.load(G.mi));
    } else if (this.screen === 'debrief') {
      g.textAlign = 'left'; g.fillStyle = d.win ? '#8ff0b0' : '#ff5a4a'; g.font = `900 52px ${FONT}`; g.fillText(d.win ? 'CONTRACT COMPLETE' : 'CONTRACT FAILED', 34, 150); g.fillStyle = '#e6edf2'; g.font = `600 27px ${FONT}`; this.wrap(d.text, 34, 212, W - 68, 36);
      if (d.win) this.stars(d.stars, 34, 300, 54); g.font = `600 24px ${MONO}`; g.textAlign = 'left'; const rows = [['Rounds fired', d.shots], ['Hits', d.hits], ['Time', d.time.toFixed(0) + ' s']]; if (d.far) rows.push(['Longest hit', d.far.toFixed(0) + ' m'], ['Flight time', d.tof.toFixed(2) + ' s']); if (d.zone) rows.push(['Placed', d.zone]);
      rows.forEach(([a, b], i) => { g.fillStyle = '#8fa6b2'; g.fillText(a, 34, 372 + i * 40); g.fillStyle = '#e6edf2'; g.fillText(String(b), 330, 372 + i * 40); });
      this.btn('AGAIN', 34, 660, 220, 76, () => G.load(G.mi)); if (d.win && G.mi < G.missions.length - 1) this.btn('NEXT CONTRACT', 274, 660, 300, 76, () => G.load(G.mi + 1), { primary: true }); this.btn('CONTRACTS', d.win ? 594 : 274, 660, 240, 76, () => G.toMissions());
    }
    this.tex.needsUpdate = true;
  }
}
