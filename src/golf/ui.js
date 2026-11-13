// Tiny immediate-mode canvas UI rendered onto a 3D panel (works with mouse or VR laser).
import * as THREE from 'three';

export class Panel {
  constructor(w = 1024, h = 768, widthM = 1.0) {
    this.w = w; this.h = h;
    this.canvas = document.createElement('canvas'); this.canvas.width = w; this.canvas.height = h;
    this.g = this.canvas.getContext('2d');
    this.tex = new THREE.CanvasTexture(this.canvas); this.tex.colorSpace = THREE.SRGBColorSpace; this.tex.anisotropy = 8;
    this.mesh = new THREE.Mesh(new THREE.PlaneGeometry(widthM, widthM * h / w),
      new THREE.MeshBasicMaterial({ map: this.tex, transparent: true, toneMapped: false, depthTest: false, fog: false }));
    this.mesh.renderOrder = 100;
    this.widgets = []; this.hover = -1; this.dirty = true; this.accent = '#ffb347';
  }
  rr(x, y, w, h, r) { const g = this.g; g.beginPath(); g.roundRect(x, y, w, h, r); }
  begin() {
    const g = this.g; g.clearRect(0, 0, this.w, this.h); this.widgets = [];
    this.rr(6, 6, this.w - 12, this.h - 12, 36);
    const grd = g.createLinearGradient(0, 0, 0, this.h); grd.addColorStop(0, 'rgba(20,28,40,0.94)'); grd.addColorStop(1, 'rgba(10,14,22,0.94)');
    g.fillStyle = grd; g.fill(); g.lineWidth = 3; g.strokeStyle = 'rgba(255,255,255,0.18)'; g.stroke();
  }
  text(s, x, y, size = 30, color = '#e8edf4', align = 'left', weight = '500') {
    const g = this.g; g.font = `${weight} ${size}px "Segoe UI", system-ui, sans-serif`; g.fillStyle = color; g.textAlign = align; g.textBaseline = 'middle';
    g.fillText(s, x, y);
  }
  button(label, x, y, w, h, cb, o = {}) {
    const i = this.widgets.length, g = this.g, hot = this.hover === i && !o.disabled;
    this.widgets.push({ x, y, w, h, cb: o.disabled ? null : cb });
    this.rr(x, y, w, h, o.radius ?? 16);
    g.fillStyle = o.disabled ? 'rgba(255,255,255,0.04)' : o.active ? this.accent : hot ? 'rgba(255,255,255,0.26)' : 'rgba(255,255,255,0.1)';
    g.fill();
    if (hot) { g.lineWidth = 3; g.strokeStyle = this.accent; g.stroke(); }
    this.text(label, x + w / 2, y + h / 2 + 1, o.size || 30, o.disabled ? '#667' : o.active ? '#141a24' : '#fff', 'center', '600');
    if (o.sub) this.text(o.sub, x + w / 2, y + h - 26, 20, o.active ? '#3a2a10' : '#9fb0c4', 'center');
  }
  end() { this.tex.needsUpdate = true; this.dirty = false; }
  // uv from a raycast hit (or null). Returns true if hovering a widget.
  point(uv) {
    let h = -1;
    if (uv) {
      const px = uv.x * this.w, py = (1 - uv.y) * this.h;
      h = this.widgets.findIndex(w => w.cb && px >= w.x && px <= w.x + w.w && py >= w.y && py <= w.y + w.h);
    }
    if (h !== this.hover) { this.hover = h; this.dirty = true; }
    return h >= 0;
  }
  click() { const w = this.widgets[this.hover]; if (w && w.cb) { w.cb(); this.dirty = true; return true; } return false; }
}

export function textSprite(text, { color = '#fff', size = 64, bg = 'rgba(10,14,22,0.6)', height = 0.09 } = {}) {
  const c = document.createElement('canvas'), g = c.getContext('2d');
  const font = `600 ${size}px "Segoe UI", system-ui, sans-serif`;
  g.font = font; const w = Math.ceil(g.measureText(text).width) + size;
  c.width = w; c.height = size * 1.6;
  g.font = font; g.beginPath(); g.roundRect(0, 0, c.width, c.height, size * 0.5); g.fillStyle = bg; g.fill();
  g.fillStyle = color; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(text, c.width / 2, c.height / 2 + 2);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace;
  const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: t, transparent: true, depthTest: false, toneMapped: false, fog: false }));
  s.scale.set(height * c.width / c.height, height, 1); s.renderOrder = 90;
  return s;
}
