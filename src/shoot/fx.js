// Pooled visual effects: tracers, sparks, smoke, bullet-hole decals, shell casings, muzzle/explosion lights.
import * as THREE from 'three';
import { radialTexture, smokeTexture, holeTexture, flashTexture } from './textures.js';

const _v = new THREE.Vector3(), _n = new THREE.Vector3(), _z = new THREE.Vector3(0, 0, 1);

export class FX {
  constructor(scene, audio, quality) {
    this.scene = scene; this.audio = audio; this.q = quality;
    this.root = new THREE.Group(); scene.add(this.root);
    this.world = null;
    this.flashTex = flashTexture(); this.smokeTex = smokeTexture(); this.glowTex = radialTexture([[0, 'rgba(255,255,255,1)'], [0.3, 'rgba(255,220,160,0.6)'], [1, 'rgba(255,120,30,0)']]);

    // tracers
    this.tracers = [];
    const tg = new THREE.BoxGeometry(0.012, 0.012, 1); tg.translate(0, 0, 0.5);
    const tm = new THREE.MeshBasicMaterial({ color: new THREE.Color(3, 2.2, 1.2), transparent: true, opacity: 0.9, blending: THREE.AdditiveBlending, depthWrite: false, fog: false });
    for (let i = 0; i < 24; i++) { const m = new THREE.Mesh(tg, tm); m.visible = false; m.frustumCulled = false; this.root.add(m); this.tracers.push({ m, t: 0, len: 0, dist: 0 }); }
    this.ti = 0;

    // sparks (points)
    this.SN = 500; this.sp = new Float32Array(this.SN * 3).fill(-999); this.sv = new Float32Array(this.SN * 3); this.sl = new Float32Array(this.SN); this.si = 0;
    const sg = new THREE.BufferGeometry(); sg.setAttribute('position', new THREE.BufferAttribute(this.sp, 3));
    this.sparks = new THREE.Points(sg, new THREE.PointsMaterial({ color: new THREE.Color(4, 2.4, 0.9), size: 0.03, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, fog: false }));
    this.sparks.frustumCulled = false; this.root.add(this.sparks);

    // smoke / dust puffs
    this.puffs = [];
    for (let i = 0; i < 40; i++) { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: this.smokeTex, transparent: true, depthWrite: false, opacity: 0 })); s.visible = false; this.root.add(s); this.puffs.push({ s, t: 0, life: 1, v: new THREE.Vector3(), s0: 0.1, s1: 0.5, a: 0.5 }); }
    this.pi = 0;

    // glow flashes (sprites, additive)
    this.glows = [];
    for (let i = 0; i < 16; i++) { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: this.glowTex, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, fog: false })); s.visible = false; this.root.add(s); this.glows.push({ s, t: 0, life: 0.1, size: 1 }); }
    this.gi = 0;

    // decals
    this.decals = [];
    const dg = new THREE.PlaneGeometry(1, 1), dm = new THREE.MeshBasicMaterial({ map: holeTexture(), transparent: true, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -4 });
    const sm = new THREE.MeshBasicMaterial({ map: radialTexture([[0, 'rgba(0,0,0,0.9)'], [0.5, 'rgba(8,6,4,0.7)'], [1, 'rgba(0,0,0,0)']]), transparent: true, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -4 });
    this.decalMats = [dm, sm];
    for (let i = 0; i < 140; i++) { const m = new THREE.Mesh(dg, dm); m.visible = false; this.root.add(m); this.decals.push(m); }
    this.di = 0;

    // casings
    this.casings = [];
    const cg = new THREE.CylinderGeometry(0.0048, 0.0048, 0.02, 6); cg.rotateX(Math.PI / 2);
    const brass = new THREE.MeshStandardMaterial({ color: 0xc9a23f, metalness: 1, roughness: 0.3 }), redShell = new THREE.MeshStandardMaterial({ color: 0xa01810, metalness: 0.1, roughness: 0.5 });
    this.casingMats = [brass, redShell];
    for (let i = 0; i < 28; i++) { const m = new THREE.Mesh(cg, brass); m.visible = false; this.root.add(m); this.casings.push({ m, v: new THREE.Vector3(), w: new THREE.Vector3(), t: 0, rest: false }); }
    this.ci = 0;

    // debris meshes (dropped magazines etc.)
    this.debris = [];

    // dynamic lights: fixed pool so shaders never recompile
    this.lights = [];
    for (let i = 0; i < 3; i++) { const l = new THREE.PointLight(0xffb060, 0, 14, 1.6); this.root.add(l); this.lights.push({ l, t: 0, life: 0.06, peak: 0 }); }
    this.li = 0;
  }

  light(pos, color, peak, life) {
    const o = this.lights[this.li = (this.li + 1) % this.lights.length];
    o.l.position.copy(pos); o.l.color.set(color); o.t = life; o.life = life; o.peak = peak; o.l.intensity = peak;
  }
  glow(pos, size, life, color = 0xffffff) {
    const o = this.glows[this.gi = (this.gi + 1) % this.glows.length];
    o.s.position.copy(pos); o.s.material.color.set(color); o.size = size; o.t = life; o.life = life; o.s.visible = true; o.s.scale.setScalar(size); o.s.material.opacity = 1;
  }
  tracer(from, dir, dist) {
    if (dist < 2) return;
    const o = this.tracers[this.ti = (this.ti + 1) % this.tracers.length];
    o.m.position.copy(from); o.m.quaternion.setFromUnitVectors(_z, dir);
    o.dir = (o.dir || new THREE.Vector3()).copy(dir); o.from = (o.from || new THREE.Vector3()).copy(from);
    o.dist = dist; o.t = 0; o.m.visible = true;
  }
  spark(pos, normal, count, speed = 4, spread = 0.9) {
    for (let i = 0; i < count; i++) {
      const k = (this.si = (this.si + 1) % this.SN) * 3;
      this.sp[k] = pos.x; this.sp[k + 1] = pos.y; this.sp[k + 2] = pos.z;
      const s = speed * (0.3 + Math.random() * 0.9);
      this.sv[k] = (normal.x + (Math.random() - 0.5) * 2 * spread) * s; this.sv[k + 1] = (normal.y + (Math.random() - 0.5) * 2 * spread) * s + 1; this.sv[k + 2] = (normal.z + (Math.random() - 0.5) * 2 * spread) * s;
      this.sl[k / 3] = 0.25 + Math.random() * 0.5;
    }
  }
  puff(pos, vel, s0, s1, life, alpha = 0.5, color = 0x999999) {
    const o = this.puffs[this.pi = (this.pi + 1) % this.puffs.length];
    o.s.position.copy(pos); o.v.copy(vel); o.s0 = s0; o.s1 = s1; o.life = life; o.t = 0; o.a = alpha; o.s.visible = true;
    o.s.material.color.set(color); o.s.material.rotation = Math.random() * 6.28;
  }
  decal(pos, normal, size, scorch = false) {
    const m = this.decals[this.di = (this.di + 1) % this.decals.length];
    m.material = this.decalMats[scorch ? 1 : 0];
    m.position.copy(pos).addScaledVector(normal, 0.004); m.quaternion.setFromUnitVectors(_z, normal); m.rotateZ(Math.random() * 6.28);
    m.scale.setScalar(size); m.visible = true;
  }
  casing(pos, vel, shell = false) {
    const o = this.casings[this.ci = (this.ci + 1) % this.casings.length];
    o.m.material = this.casingMats[shell ? 1 : 0]; o.m.scale.setScalar(shell ? 2.4 : 1);
    o.m.position.copy(pos); o.v.copy(vel); o.w.set(Math.random() * 30, Math.random() * 30, Math.random() * 30); o.t = 6; o.rest = false; o.m.visible = true; o.bounced = false;
  }
  // a mesh that falls to the floor and fades out (ejected magazine)
  drop(mesh, pos, quat, vel) {
    mesh.position.copy(pos); mesh.quaternion.copy(quat); this.root.add(mesh);
    this.debris.push({ m: mesh, v: vel.clone(), t: 5 });
  }

  impact(pos, normal, surf, big = false) {
    if (surf === 'body') {
      this.spark(pos, normal, 10, 3, 0.7); this.puff(pos, _v.copy(normal).multiplyScalar(0.4), 0.06, 0.3, 0.35, 0.5, 0x703020);
    } else {
      this.decal(pos, normal, big ? 0.09 : 0.06 + Math.random() * 0.03);
      const metal = surf === 'metal';
      this.spark(pos, normal, metal ? 14 : 5, metal ? 5 : 2.5);
      this.puff(pos, _v.copy(normal).multiplyScalar(0.5), 0.05, metal ? 0.25 : 0.55, 0.6, metal ? 0.25 : 0.5, surf === 'wood' ? 0x8a6a40 : 0x8a8a88);
    }
    this.audio.impact(pos, surf);
  }
  muzzle(pos, dir, power = 1) {
    this.light(_v.copy(pos).addScaledVector(dir, 0.15), 0xffb060, 26 * power, 0.07);
    this.glow(_n.copy(pos).addScaledVector(dir, 0.06), 0.28 * power, 0.05, 0xffd9a0);
    this.puff(_n.copy(pos).addScaledVector(dir, 0.1), _v.copy(dir).multiplyScalar(0.8).setY(0.25), 0.05, 0.4 * power, 0.9, 0.16, 0xbbbbbb);
  }
  explosion(pos) {
    this.light(_v.copy(pos).setY(pos.y + 0.5), 0xffa040, 320, 0.4);
    this.glow(pos, 5, 0.16, 0xffe0b0); this.glow(pos, 2.5, 0.3, 0xff9040);
    _n.set(0, 1, 0);
    this.spark(pos, _n, 110, 11, 1.2);
    for (let i = 0; i < 9; i++) { _v.set((Math.random() - 0.5) * 3, 0.6 + Math.random() * 1.6, (Math.random() - 0.5) * 3); this.puff(pos, _v, 0.5, 2.6 + Math.random(), 2.2 + Math.random(), 0.6, i % 2 ? 0x2a2622 : 0x5a5048); }
    if (pos.y < 0.6) this.decal(_v.set(pos.x, 0, pos.z), _n, 2.6, true);
    this.audio.explode(pos);
  }

  update(dt) {
    for (const o of this.tracers) {
      if (!o.m.visible) continue;
      o.t += dt * 320; // tracer speed m/s
      const head = Math.min(o.t, o.dist), tail = Math.max(0, o.t - 7);
      if (tail >= o.dist) { o.m.visible = false; continue; }
      o.m.position.copy(o.from).addScaledVector(o.dir, tail); o.m.scale.set(1, 1, head - tail);
    }
    const sp = this.sp, sv = this.sv, sl = this.sl;
    for (let i = 0; i < this.SN; i++) {
      if (sl[i] <= 0) continue;
      const k = i * 3; sl[i] -= dt;
      if (sl[i] <= 0) { sp[k + 1] = -999; continue; }
      sv[k + 1] -= 9.8 * dt; sp[k] += sv[k] * dt; sp[k + 1] += sv[k + 1] * dt; sp[k + 2] += sv[k + 2] * dt;
      if (sp[k + 1] < 0.01) { sp[k + 1] = 0.01; sv[k + 1] *= -0.35; sv[k] *= 0.6; sv[k + 2] *= 0.6; }
    }
    this.sparks.geometry.attributes.position.needsUpdate = true;
    for (const o of this.puffs) {
      if (!o.s.visible) continue;
      o.t += dt; const k = o.t / o.life;
      if (k >= 1) { o.s.visible = false; continue; }
      o.s.position.addScaledVector(o.v, dt); o.v.multiplyScalar(1 - dt * 1.8);
      o.s.scale.setScalar(o.s0 + (o.s1 - o.s0) * (1 - (1 - k) * (1 - k)));
      o.s.material.opacity = o.a * (1 - k) * Math.min(1, k * 12);
    }
    for (const o of this.glows) {
      if (!o.s.visible) continue;
      o.t -= dt; if (o.t <= 0) { o.s.visible = false; continue; }
      const k = o.t / o.life; o.s.material.opacity = k; o.s.scale.setScalar(o.size * (1.3 - 0.3 * k));
    }
    for (const o of this.lights) { if (o.t > 0) { o.t -= dt; o.l.intensity = o.t > 0 ? o.peak * (o.t / o.life) ** 2 : 0; } }
    for (const o of this.casings) {
      if (!o.m.visible) continue;
      o.t -= dt; if (o.t <= 0) { o.m.visible = false; continue; }
      if (o.rest) continue;
      o.v.y -= 9.8 * dt; o.m.position.addScaledVector(o.v, dt);
      o.m.rotation.x += o.w.x * dt; o.m.rotation.y += o.w.y * dt;
      if (o.m.position.y < 0.006) {
        o.m.position.y = 0.006; o.v.y *= -0.4; o.v.x *= 0.5; o.v.z *= 0.5; o.w.multiplyScalar(0.5);
        if (!o.bounced) { o.bounced = true; this.audio.casing(o.m.position); }
        if (Math.abs(o.v.y) < 0.4) { o.rest = true; o.m.rotation.set(0, o.m.rotation.y, 0); }
      }
    }
    for (let i = this.debris.length - 1; i >= 0; i--) {
      const o = this.debris[i]; o.t -= dt;
      if (o.m.position.y > 0.02) { o.v.y -= 9.8 * dt; o.m.position.addScaledVector(o.v, dt); o.m.rotateX(dt * 4); if (o.m.position.y <= 0.02) { o.m.position.y = 0.02; this.audio.click(o.m.position, 0.5, 0.4); } }
      if (o.t <= 0) { this.root.remove(o.m); this.debris.splice(i, 1); }
    }
  }

  clear() {
    for (const d of this.decals) d.visible = false;
    for (const c of this.casings) c.m.visible = false;
    for (const o of this.debris) this.root.remove(o.m); this.debris.length = 0;
  }
}
