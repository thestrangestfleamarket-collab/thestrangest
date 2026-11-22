// SKIRMISH TABLE's labels: a thin health bar over every piece and the name of the one picked or pointed at, all one mesh on one picture; each turns to the eye from where the head is, never with the head's turning, so none swims
import * as THREE from 'three';

const COLS = 4, ROWS = 8, CW = 256, CH = 128, MAX = COLS * ROWS;   // one cell a piece: its name and state above (92 dots), its bar below
const BAR = ['#46a89b', '#d28d52'];

export class Labels {
  constructor(parent, renderer) {
    this.canvas = document.createElement('canvas'); this.canvas.width = COLS * CW; this.canvas.height = ROWS * CH;
    this.ctx = this.canvas.getContext('2d');
    this.tex = new THREE.CanvasTexture(this.canvas); this.tex.colorSpace = THREE.SRGBColorSpace; this.tex.anisotropy = Math.min(4, renderer.capabilities.getMaxAnisotropy());
    this.pos = new Float32Array(MAX * 8 * 3); this.uv = new Float32Array(MAX * 8 * 2);
    const idx = []; for (let q = 0; q < MAX * 2; q++) idx.push(q * 4, q * 4 + 1, q * 4 + 2, q * 4, q * 4 + 2, q * 4 + 3);
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(this.pos, 3).setUsage(THREE.DynamicDrawUsage)); g.setAttribute('uv', new THREE.BufferAttribute(this.uv, 2).setUsage(THREE.DynamicDrawUsage)); g.setIndex(idx);
    this.mesh = new THREE.Mesh(g, new THREE.MeshBasicMaterial({ map: this.tex, transparent: true, depthTest: false, depthWrite: false }));
    this.mesh.frustumCulled = false; this.mesh.renderOrder = 5; this.mesh.raycast = () => {}; this.mesh.matrixAutoUpdate = false;
    parent.add(this.mesh);
    this.slots = new Map(); this.free = [...Array(MAX).keys()].reverse();
    this.f = new THREE.Vector3(); this.r = new THREE.Vector3(); this.u = new THREE.Vector3(); this.c = new THREE.Vector3();
  }
  // a piece's cell, drawn again only when what it says changes: { name, hp (0 to 1), owner, tag }
  set(id, d) {
    let s = this.slots.get(id);
    if (!s) { if (!this.free.length) return; s = { i: this.free.pop(), key: '', tag: false }; this.slots.set(id, s); }
    const key = d.name + '|' + d.hp.toFixed(3) + '|' + d.owner + '|' + d.tag;
    if (key === s.key) return;
    s.key = key; s.tag = !!d.tag;
    const c = this.ctx, x = (s.i % COLS) * CW, y = Math.floor(s.i / COLS) * CH;
    c.clearRect(x, y, CW, CH);
    c.textAlign = 'center'; c.textBaseline = 'middle';
    const plate = (py, h, text, color, font) => { c.font = font; const w = Math.min(CW - 8, c.measureText(text).width + 28); c.fillStyle = 'rgba(24,26,31,0.78)'; c.beginPath(); c.roundRect(x + (CW - w) / 2, y + py, w, h, 10); c.fill(); c.fillStyle = color; c.fillText(text, x + CW / 2, y + py + h / 2 + 2, CW - 24); };
    plate(4, 44, d.name, '#ece8df', '600 30px system-ui, sans-serif');
    if (d.tag) plate(52, 36, d.tag, d.tag[0] === 's' ? '#cdb2ea' : '#e6cf8e', '600 24px system-ui, sans-serif');
    c.fillStyle = 'rgba(24,26,31,0.82)'; c.beginPath(); c.roundRect(x + 28, y + 98, 200, 24, 8); c.fill();
    c.fillStyle = BAR[d.owner]; c.beginPath(); c.roundRect(x + 32, y + 102, Math.max(6, 192 * Math.max(0, Math.min(1, d.hp))), 16, 5); c.fill();
    this.tex.needsUpdate = true;
  }
  drop(id) { const s = this.slots.get(id); if (s) { this.slots.delete(id); this.free.push(s.i); } }
  clear() { for (const id of [...this.slots.keys()]) this.drop(id); }
  quad(q, c, r, u, w, h, u0, v0, u1, v1) {
    const p = this.pos, t = this.uv, o = q * 12, k = q * 8, W = this.canvas.width, H = this.canvas.height;
    for (let i = 0; i < 4; i++) { const sx = (i === 0 || i === 3 ? -0.5 : 0.5) * w, sy = (i < 2 ? -0.5 : 0.5) * h;
      p[o + i * 3] = c.x + r.x * sx + u.x * sy; p[o + i * 3 + 1] = c.y + r.y * sx + u.y * sy; p[o + i * 3 + 2] = c.z + r.z * sx + u.z * sy;
      t[k + i * 2] = (i === 0 || i === 3 ? u0 : u1) / W; t[k + i * 2 + 1] = 1 - (i < 2 ? v1 : v0) / H; }
  }
  // where: id -> the piece's place (board space); eye: the head's place there; named: the ids whose names show (or true for all)
  // right: on a screen, the view's own right (bars lie level across the picture); big: how much larger the names are (the headset's, read from half a metre)
  update(where, eye, named, right, big = 1) {
    this.pos.fill(0);
    // one facing for them all, from the board's middle to the head: level, parallel, and unmoved by the head's turning
    const f = this.f.set(eye.x, eye.y - 1.75, eye.z).normalize(), r = right ? this.r.set(right.x, 0, right.z) : this.r.set(f.z, 0, -f.x);
    if (r.lengthSq() < 1e-4) r.set(1, 0, 0); r.normalize();
    const u = this.u.crossVectors(f, r);
    for (const [id, s] of this.slots) {
      const at = where(id); if (!at) continue;
      const c = this.c.copy(at); c.y += 1.75;
      const x = (s.i % COLS) * CW, y = Math.floor(s.i / COLS) * CH, name = named === true || named.has(id);
      this.quad(s.i * 2, c, r, u, 0.86, 0.103, x + 28, y + 98, x + 228, y + 122);
      if (name || s.tag) { const top = name ? 0 : 50, h = 92 - top, w = 1.24 * big; c.addScaledVector(u, 0.09 + h / 256 * w / 2); this.quad(s.i * 2 + 1, c, r, u, w, h / 256 * w, x, y + top, x + CW, y + 92); }
    }
    this.mesh.geometry.attributes.position.needsUpdate = true; this.mesh.geometry.attributes.uv.needsUpdate = true;
  }
}
