// SENSOR TAG's drawn things: the chest sensor panel, the pistol, the beams (the players themselves are real, seen in passthrough)
import * as THREE from 'three';
import { BODY } from './rules.js';

export const TEAM = [{ name: 'ORANGE', col: 0xff7a1a, css: '#ff7a1a' }, { name: 'BLUE', col: 0x25c8ff, css: '#25c8ff' }];
const _up = new THREE.Vector3(0, 1, 0), _a = new THREE.Vector3();
const dark = () => new THREE.MeshStandardMaterial({ color: 0x15181d, roughness: 0.55, metalness: 0.4 });

function board(w, h) { const c = document.createElement('canvas'); c.width = w; c.height = h; const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace; return { c, x: c.getContext('2d'), tex }; }

// the sensor: a lit plate on the chest that shows its wearer's lives; its -z faces the way the body faces
export class Panel {
  constructor(parent, slot) {
    this.slot = slot; this.team = TEAM[slot % 2]; this.lives = -1; this.flash = 0; this.faint = false;
    const g = this.group = new THREE.Group(); parent.add(g);
    const back = new THREE.Mesh(new THREE.BoxGeometry(BODY.W + 0.03, BODY.H + 0.03, 0.012), dark()); back.position.z = 0.008; g.add(back);
    this.b = board(260, 200);
    this.face = new THREE.Mesh(new THREE.PlaneGeometry(BODY.W, BODY.H), new THREE.MeshBasicMaterial({ map: this.b.tex, transparent: true, toneMapped: false }));
    this.face.rotation.y = Math.PI; this.face.position.z = 0; g.add(this.face);
    this.glow = new THREE.Mesh(new THREE.PlaneGeometry(BODY.W + 0.08, BODY.H + 0.08), new THREE.MeshBasicMaterial({ color: 0xff2030, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false }));
    this.glow.rotation.y = Math.PI; this.glow.position.z = -0.004; g.add(this.glow);
    this.back = back; this.set(0);
  }
  set(lives) {
    if (lives === this.lives) return; this.lives = lives;
    const { x, tex } = this.b, c = this.team.css; x.fillStyle = '#0a0d12'; x.fillRect(0, 0, 260, 200);
    x.strokeStyle = c; x.lineWidth = 10; x.strokeRect(5, 5, 250, 190);
    x.fillStyle = c; x.font = 'bold 120px Arial, sans-serif'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(String(lives), 130, 88);
    for (let i = 0; i < 10; i++) { x.globalAlpha = i < lives ? 1 : 0.18; x.fillRect(22 + i * 22, 162, 16, 16); } x.globalAlpha = 1;
    tex.needsUpdate = true;
  }
  place(head, yaw) { this.group.position.set(head.x - Math.sin(yaw) * BODY.FWD, head.y - BODY.DROP, head.z - Math.cos(yaw) * BODY.FWD); this.group.rotation.set(0, yaw, 0); }
  cover(on) { if (on === this.faint) return; this.faint = on; this.face.material.opacity = on ? 0.22 : 1; this.back.visible = !on; }
  update(dt) { this.flash = Math.max(0, this.flash - dt * 2.5); this.glow.material.opacity = this.flash; }
  drop() { this.group.parent?.remove(this.group); }
}

// the pistol, drawn on the controller's pointing ray: -z is the barrel
export class Gun {
  constructor(parent, slot) {
    this.team = TEAM[slot % 2]; this.lives = -1;
    const g = this.group = new THREE.Group(); parent.add(g);
    const body = new THREE.Mesh(new THREE.BoxGeometry(0.032, 0.044, 0.18), dark()); body.position.set(0, 0, -0.03); g.add(body);
    const grip = new THREE.Mesh(new THREE.BoxGeometry(0.028, 0.09, 0.036), dark()); grip.position.set(0, -0.058, 0.035); grip.rotation.x = 0.28; g.add(grip);
    const ring = new THREE.Mesh(new THREE.CylinderGeometry(0.013, 0.013, 0.012, 16), new THREE.MeshBasicMaterial({ color: this.team.col, toneMapped: false })); ring.rotation.x = Math.PI / 2; ring.position.set(0, 0, -0.124); g.add(ring);
    this.bar = new THREE.Mesh(new THREE.BoxGeometry(0.01, 0.004, 0.14), new THREE.MeshBasicMaterial({ color: 0x35e06a, toneMapped: false })); this.bar.position.set(0, 0.025, -0.03); g.add(this.bar);
    this.b = board(96, 96);
    const disp = new THREE.Mesh(new THREE.PlaneGeometry(0.03, 0.03), new THREE.MeshBasicMaterial({ map: this.b.tex, toneMapped: false })); disp.position.set(0, 0.004, 0.0605); g.add(disp);
    this.muzzle = new THREE.Vector3(0, 0, -0.13); this.set(0);
  }
  set(lives) {
    if (lives === this.lives) return; this.lives = lives;
    const { x, tex } = this.b; x.fillStyle = '#05070a'; x.fillRect(0, 0, 96, 96); x.fillStyle = this.team.css; x.font = 'bold 64px Arial, sans-serif'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(String(lives), 48, 52); tex.needsUpdate = true;
  }
  charge(k) { this.bar.scale.z = Math.max(0.02, k); this.bar.position.z = -0.03 + 0.07 * (1 - k); this.bar.material.color.setHex(k >= 1 ? 0x35e06a : 0xffb020); }
  aim(origin, dir) { this.group.updateMatrixWorld(true); origin.copy(this.muzzle).applyMatrix4(this.group.matrixWorld); dir.set(0, 0, -1).transformDirection(this.group.matrixWorld); }
  drop() { this.group.parent?.remove(this.group); }
}

export class Beams {
  constructor(scene) { this.scene = scene; this.live = []; }
  shoot(from, to, slot) {
    const col = TEAM[slot % 2].col, len = Math.max(0.01, from.distanceTo(to)), g = new THREE.Group();
    const mk = (r, c, o) => new THREE.Mesh(new THREE.CylinderGeometry(r, r, 1, 8, 1, true), new THREE.MeshBasicMaterial({ color: c, transparent: true, opacity: o, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false }));
    const core = mk(0.003, 0xffffff, 1), halo = mk(0.011, col, 0.6); core.userData.o = 1; halo.userData.o = 0.6;
    g.add(core, halo); g.position.copy(from).lerp(to, 0.5); g.scale.set(1, len, 1); g.quaternion.setFromUnitVectors(_up, _a.copy(to).sub(from).normalize());
    const dot = new THREE.Mesh(new THREE.SphereGeometry(0.03, 10, 8), new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: 0.8, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false })); dot.userData.o = 0.8; dot.position.copy(to);
    this.scene.add(g, dot); this.live.push({ objs: [core, halo, dot], roots: [g, dot], t: 0 });
  }
  update(dt) {
    for (let i = 0; i < this.live.length; i++) { const L = this.live[i]; L.t += dt; const k = Math.max(0, 1 - L.t / 0.16);
      for (const m of L.objs) m.material.opacity = m.userData.o * k;
      if (L.t > 0.16) { for (const r of L.roots) this.scene.remove(r); for (const m of L.objs) { m.geometry.dispose(); m.material.dispose(); } this.live.splice(i--, 1); } }
  }
}
