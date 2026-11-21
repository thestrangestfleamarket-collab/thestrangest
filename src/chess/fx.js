// Particle and flash effects. Everything is a Sprite or flat Mesh parented to the board group,
// so effects scale and move with the board in AR without any size fixes.
import * as THREE from 'three';

const NAMES = ['fire_01', 'flame_05', 'smoke_04', 'smoke_07', 'spark_01', 'spark_05', 'star_06', 'magic_03', 'magic_05',
  'twirl_01', 'slash_02', 'circle_05', 'light_01', 'scorch_02', 'trace_01', 'dirt_02', 'flare_01'];

export class FX {
  constructor(parent) {
    this.parent = parent;
    this.tex = {};
    this.items = []; // each has update(dt) -> false when finished, and dispose()
    const loader = new THREE.TextureLoader();
    for (const n of NAMES) {
      const t = loader.load(`/chess-assets/fx/${n}.png`);
      t.colorSpace = THREE.SRGBColorSpace;
      this.tex[n] = t;
    }
    // One pooled light: adding/removing lights at runtime would force shader rebuilds.
    this.light = new THREE.PointLight(0xffa040, 0, 9, 1.6);
    this.light.position.set(0, 1.5, 0);
    parent.add(this.light);
    this.lightLife = 0; this.lightMax = 1; this.lightPeak = 0;
  }

  mat(tex, color, additive, opacity = 1) {
    return new THREE.SpriteMaterial({
      map: this.tex[tex], color, transparent: true, opacity, depthWrite: false,
      blending: additive ? THREE.AdditiveBlending : THREE.NormalBlending,
    });
  }

  // A puff of sprites flying outward.
  burst({ pos, tex, color = 0xffffff, count = 10, size = 0.4, life = 0.6, speed = 2, up = 1, gravity = 0, drag = 2, grow = 0, additive = true, spread = 0.1, opacity = 1 }) {
    const mat = this.mat(tex, color, additive, opacity);
    const sprites = [], vel = [];
    for (let i = 0; i < count; i++) {
      const s = new THREE.Sprite(mat);
      const a = Math.random() * Math.PI * 2, r = Math.random();
      s.position.set(pos.x + Math.cos(a) * r * spread, pos.y + Math.random() * spread, pos.z + Math.sin(a) * r * spread);
      const sz = size * (0.6 + Math.random() * 0.8);
      s.scale.set(sz, sz, 1);
      s.userData.size = sz;
      s.raycast = () => {};
      s.renderOrder = 8;
      this.parent.add(s);
      sprites.push(s);
      const sp = speed * (0.4 + Math.random() * 0.8);
      vel.push(new THREE.Vector3(Math.cos(a) * sp, (Math.random() * 0.8 + 0.2) * up * speed, Math.sin(a) * sp));
    }
    let age = 0;
    this.items.push({
      update: dt => {
        age += dt;
        const k = age / life;
        if (k >= 1) return false;
        mat.opacity = opacity * (k < 0.15 ? k / 0.15 : 1 - (k - 0.15) / 0.85);
        for (let i = 0; i < sprites.length; i++) {
          const v = vel[i];
          v.multiplyScalar(Math.max(0, 1 - drag * dt));
          v.y -= gravity * dt;
          sprites[i].position.addScaledVector(v, dt);
          if (sprites[i].position.y < 0.03) { sprites[i].position.y = 0.03; v.y *= -0.3; }
          const sz = sprites[i].userData.size * (1 + grow * k);
          sprites[i].scale.set(sz, sz, 1);
        }
        return true;
      },
      dispose: () => { sprites.forEach(s => this.parent.remove(s)); mat.dispose(); },
    });
  }

  // One sprite that swells and fades (slashes, glows, rings).
  flash({ pos, tex, color = 0xffffff, size = 1, life = 0.25, grow = 0.6, rotation = 0, spin = 0, additive = true, opacity = 1 }) {
    const mat = this.mat(tex, color, additive, opacity);
    mat.rotation = rotation;
    const s = new THREE.Sprite(mat);
    s.position.copy(pos);
    s.raycast = () => {};
    s.renderOrder = 9;
    this.parent.add(s);
    let age = 0;
    this.items.push({
      update: dt => {
        age += dt;
        const k = age / life;
        if (k >= 1) return false;
        const sz = size * (1 + grow * k);
        s.scale.set(sz, sz, 1);
        mat.rotation += spin * dt;
        mat.opacity = opacity * (1 - k * k);
        return true;
      },
      dispose: () => { this.parent.remove(s); mat.dispose(); },
    });
  }

  // A mark lying flat on the board that slowly fades (scorch).
  decal({ pos, tex, color = 0x000000, size = 2.4, life = 8, opacity = 0.75 }) {
    const mat = new THREE.MeshBasicMaterial({ map: this.tex[tex], color, transparent: true, opacity, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -4 });
    const m = new THREE.Mesh(new THREE.PlaneGeometry(size, size), mat);
    m.rotation.x = -Math.PI / 2;
    m.rotation.z = Math.random() * 6.28;
    m.position.set(pos.x, (pos.y || 0) + 0.012, pos.z);
    m.raycast = () => {};
    this.parent.add(m);
    let age = 0;
    this.items.push({
      update: dt => { age += dt; mat.opacity = opacity * Math.min(1, (life - age) / (life * 0.5)); return age < life; },
      dispose: () => { this.parent.remove(m); m.geometry.dispose(); mat.dispose(); },
    });
  }

  // A sprite flying on an arc with a fading trail; calls onHit when it lands.
  projectile({ from, to, arc = 1, dur = 0.4, tex, color = 0xffffff, size = 0.5, trailTex, trailColor = 0xffffff, trailSize = 0.3, onHit }) {
    const mat = this.mat(tex, color, true);
    const head = new THREE.Sprite(mat);
    head.scale.set(size, size, 1);
    head.raycast = () => {};
    head.renderOrder = 9;
    this.parent.add(head);
    let age = 0, sinceTrail = 0;
    const p = new THREE.Vector3();
    this.items.push({
      update: dt => {
        age += dt;
        const k = Math.min(1, age / dur);
        p.lerpVectors(from, to, k);
        p.y += Math.sin(k * Math.PI) * arc;
        head.position.copy(p);
        sinceTrail += dt;
        if (trailTex && sinceTrail > 0.03) {
          sinceTrail = 0;
          this.burst({ pos: p, tex: trailTex, color: trailColor, count: 1, size: trailSize, life: 0.3, speed: 0.2, up: 0.5, grow: 0.8, spread: 0.02 });
        }
        if (k >= 1) { if (onHit) onHit(); return false; }
        return true;
      },
      dispose: () => { this.parent.remove(head); mat.dispose(); },
    });
  }

  // A small looping flame for braziers. Returns the group so the caller can hide it.
  flame(pos) {
    const group = new THREE.Group();
    group.position.copy(pos);
    this.parent.add(group);
    const parts = [];
    for (let i = 0; i < 7; i++) {
      const mat = this.mat(i % 2 ? 'flame_05' : 'fire_01', 0xff8a30, true);
      const s = new THREE.Sprite(mat);
      s.raycast = () => {};
      s.renderOrder = 7;
      group.add(s);
      parts.push({ s, mat, t: i / 7 });
    }
    this.items.push({
      update: dt => {
        for (const q of parts) {
          q.t += dt * 1.6;
          if (q.t >= 1) { q.t -= 1; q.x = (Math.random() - 0.5) * 0.16; q.z = (Math.random() - 0.5) * 0.16; }
          const sz = 0.5 * (1 - q.t * 0.7);
          q.s.position.set(q.x || 0, 0.1 + q.t * 0.6, q.z || 0);
          q.s.scale.set(sz, sz * 1.3, 1);
          q.mat.opacity = Math.sin(Math.min(1, q.t * 1.2) * Math.PI) * 0.9;
        }
        return !group.userData.dead;
      },
      dispose: () => {},
    });
    return group;
  }

  lightFlash(pos, color, intensity, life) {
    this.light.position.set(pos.x, (pos.y || 0) + 1.4, pos.z);
    this.light.color.setHex(color);
    this.lightPeak = intensity; this.lightLife = this.lightMax = life;
  }

  update(dt) {
    for (let i = this.items.length - 1; i >= 0; i--) {
      if (!this.items[i].update(dt)) { this.items[i].dispose(); this.items.splice(i, 1); }
    }
    this.lightLife = Math.max(0, this.lightLife - dt);
    this.light.intensity = this.lightPeak * (this.lightLife / this.lightMax) ** 2;
  }
}
