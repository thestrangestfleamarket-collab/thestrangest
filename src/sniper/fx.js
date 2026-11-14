// COLD BORE's effects: dust, sparks and mist where a round lands, the muzzle's flash, the bullet's trace, brass and dropped magazines, a lens glint
import * as THREE from 'three';
import { canvasTex } from './world.js';

const _v = new THREE.Vector3();
export class FX {
  constructor(game) {
    this.g = game; this.group = new THREE.Group(); game.scene.add(this.group); this.parts = []; this.loose = []; this.traces = [];
    this.soft = canvasTex(64, 64, (g) => { const r = g.createRadialGradient(32, 32, 0, 32, 32, 32); r.addColorStop(0, 'rgba(255,255,255,1)'); r.addColorStop(0.4, 'rgba(255,255,255,0.55)'); r.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = r; g.fillRect(0, 0, 64, 64); }, false);
    this.pool = []; for (let i = 0; i < 90; i++) { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: this.soft, transparent: true, depthWrite: false })); s.visible = false; this.group.add(s); this.pool.push(s); }
    this.brassGeo = new THREE.CylinderGeometry(0.0075, 0.0075, 0.07, 8); this.brassMat = new THREE.MeshStandardMaterial({ color: 0xc9a24a, metalness: 0.9, roughness: 0.3 }); this.liveMat = new THREE.MeshStandardMaterial({ color: 0xb87333, metalness: 0.9, roughness: 0.3 });
  }
  clear() { for (const p of this.parts) p.s.visible = false; this.parts = []; for (const l of this.loose) this.group.remove(l.m); this.loose = []; for (const t of this.traces) { this.group.remove(t.line); t.line.geometry.dispose(); } this.traces = []; }
  puff(at, o) {
    const s = this.pool.find(q => !q.visible); if (!s) return; s.visible = true; s.position.copy(at); s.material.color.setRGB(o.c[0], o.c[1], o.c[2]); s.material.blending = o.add ? THREE.AdditiveBlending : THREE.NormalBlending; s.material.fog = !o.add;
    this.parts.push({ s, v: new THREE.Vector3(o.v ? o.v[0] : 0, o.v ? o.v[1] : 0, o.v ? o.v[2] : 0), life: o.life, t: 0, s0: o.s0, s1: o.s1, a: o.a ?? 0.8, grav: o.grav || 0, wind: o.wind || 0 });
  }
  impact(at, n, surf) {
    const rr = () => Math.random() - 0.5;
    if (surf === 'steel') { for (let i = 0; i < 8; i++) this.puff(at, { c: [1, 0.8, 0.4], v: [n.x * 3 + rr() * 6, n.y * 3 + rr() * 6 + 2, n.z * 3 + rr() * 6], life: 0.25 + Math.random() * 0.2, s0: 0.12, s1: 0.03, add: true, grav: 9 }); this.puff(at, { c: [0.8, 0.8, 0.8], life: 0.5, s0: 0.3, s1: 1.2, a: 0.4 }); return; }
    if (surf === 'flesh') { for (let i = 0; i < 5; i++) this.puff(at, { c: [0.35, 0.02, 0.02], v: [n.x * 2 + rr() * 1.5, n.y * 2 + rr() * 1.5 + 0.5, n.z * 2 + rr() * 1.5], life: 0.5 + Math.random() * 0.3, s0: 0.15, s1: 0.7, a: 0.7, grav: 3 }); return; }
    const c = surf === 'dirt' ? [0.55, 0.45, 0.32] : surf === 'water' ? [0.9, 0.95, 1] : surf === 'metal' ? [0.7, 0.7, 0.7] : [0.62, 0.6, 0.57];
    for (let i = 0; i < 6; i++) this.puff(at, { c, v: [n.x * 2.5 + rr() * 2, n.y * 2.5 + rr() * 2 + (surf === 'water' ? 5 : 1.5), n.z * 2.5 + rr() * 2], life: 1.2 + Math.random() * 0.9, s0: 0.25, s1: 2.2 + Math.random() * 1.5, a: 0.6, grav: surf === 'water' ? 9 : 0.6, wind: 1 });
    if (surf === 'metal') for (let i = 0; i < 4; i++) this.puff(at, { c: [1, 0.8, 0.4], v: [n.x * 3 + rr() * 5, n.y * 3 + rr() * 5 + 2, n.z * 3 + rr() * 5], life: 0.2, s0: 0.1, s1: 0.02, add: true, grav: 9 });
  }
  muzzle(at, d) { this.puff(at, { c: [1, 0.85, 0.5], life: 0.06, s0: 0.55, s1: 0.2, add: true, a: 1 }); for (let i = 0; i < 4; i++) this.puff(_v.copy(at).addScaledVector(d, 0.1 + i * 0.1), { c: [0.75, 0.75, 0.75], v: [d.x * (2 + i) + (Math.random() - 0.5), d.y * (2 + i) + 0.4, d.z * (2 + i) + (Math.random() - 0.5)], life: 1.1, s0: 0.12, s1: 0.9, a: 0.28, wind: 1 }); }
  flash(at, s = 1.6) { this.puff(at, { c: [1, 0.9, 0.6], life: 0.09, s0: s, s1: s * 0.4, add: true, a: 1 }); }
  // a glint of glass: stays where it is put until moved or hidden
  glint() { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: this.soft, color: 0xffffff, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, fog: false, depthTest: true })); s.visible = false; this.group.add(s); return s; }
  brass(at, q, spent) { const m = new THREE.Mesh(this.brassGeo, spent ? this.brassMat : this.liveMat); m.position.copy(at); m.quaternion.copy(q); this.group.add(m); const v = new THREE.Vector3(1.6 + Math.random() * 0.5, 1.4 + Math.random() * 0.5, 0.5).applyQuaternion(q); this.loose.push({ m, v, w: new THREE.Vector3(9, 4, 12), t: 0 }); }
  dropMag(at, q, src) { const m = new THREE.Mesh(src.geometry, src.material); m.position.copy(at); m.quaternion.copy(q); this.group.add(m); this.loose.push({ m, v: new THREE.Vector3(0, -0.4, 0), w: new THREE.Vector3(1, 0.3, 0.6), t: 0, keep: true }); }
  trace() { const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(20 * 3), 3)); const line = new THREE.Line(g, new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.22, depthWrite: false, fog: false })); line.frustumCulled = false; this.group.add(line); const t = { line, pts: [], dead: 0 }; this.traces.push(t); return t; }
  update(dt, wind, floorY) {
    for (let i = this.parts.length - 1; i >= 0; i--) { const p = this.parts[i]; p.t += dt; const k = p.t / p.life; if (k >= 1) { p.s.visible = false; this.parts.splice(i, 1); continue; }
      p.v.y -= p.grav * dt; p.s.position.addScaledVector(p.v, dt); if (p.wind) { p.s.position.x += wind.x * dt * 0.6; p.s.position.z += wind.z * dt * 0.6; p.v.multiplyScalar(Math.exp(-dt * 2.5)); } p.s.scale.setScalar(p.s0 + (p.s1 - p.s0) * Math.sqrt(k)); p.s.material.opacity = p.a * (1 - k * k); }
    for (let i = this.loose.length - 1; i >= 0; i--) { const l = this.loose[i]; l.t += dt; l.v.y -= 9.8 * dt; l.m.position.addScaledVector(l.v, dt); l.m.rotation.x += l.w.x * dt; l.m.rotation.y += l.w.y * dt; l.m.rotation.z += l.w.z * dt;
      if (l.m.position.y < floorY + 0.02 && l.v.y < 0) { l.m.position.y = floorY + 0.02; if (!l.hit) { l.hit = true; this.g.audio.play(l.keep ? 'magOut' : 'click'); } l.v.set(l.v.x * 0.3, -l.v.y * 0.25, l.v.z * 0.3); l.w.multiplyScalar(0.3); }
      if (l.t > 6) { this.group.remove(l.m); this.loose.splice(i, 1); } }
    for (let i = this.traces.length - 1; i >= 0; i--) { const t = this.traces[i]; if (t.dead) { t.dead += dt; t.line.material.opacity = Math.max(0, 0.22 * (1 - t.dead / 0.5)); if (t.dead > 0.5) { this.group.remove(t.line); t.line.geometry.dispose(); t.line.material.dispose(); this.traces.splice(i, 1); } } }
  }
  tracePoint(t, p) { t.pts.push(p[0], p[1], p[2]); if (t.pts.length > 60) t.pts.splice(0, 3); const a = t.line.geometry.attributes.position; a.array.set(t.pts); t.line.geometry.setDrawRange(0, t.pts.length / 3); a.needsUpdate = true; }
}
