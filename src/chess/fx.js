// SKIRMISH TABLE's effects: puffs, glows and shots, each one mesh of flat squares turned to the eye, parented to the board so they scale and move with it in AR. Soft on purpose: each eases in and out, none is brighter than its cap, none lights the board.
import * as THREE from 'three';

const NAMES = ['fire_01', 'flame_05', 'smoke_04', 'smoke_07', 'spark_01', 'spark_05', 'star_06', 'magic_03', 'magic_05',
  'twirl_01', 'slash_02', 'circle_05', 'light_01', 'scorch_02', 'trace_01', 'dirt_02', 'flare_01'];
const GLOW = 0.62;   // the most an additive effect may add

// n squares in one mesh; put(i, ...) sets one each frame
class Quads extends THREE.Mesh {
  constructor(n, material) {
    const g = new THREE.BufferGeometry(), uv = new Float32Array(n * 8), idx = [];
    for (let i = 0; i < n; i++) { uv.set([0, 0, 1, 0, 1, 1, 0, 1], i * 8); idx.push(i * 4, i * 4 + 1, i * 4 + 2, i * 4, i * 4 + 2, i * 4 + 3); }
    g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(n * 12), 3).setUsage(THREE.DynamicDrawUsage)); g.setAttribute('uv', new THREE.BufferAttribute(uv, 2)); g.setIndex(idx);
    super(g, material);
    this.frustumCulled = false; this.matrixAutoUpdate = false; this.raycast = () => {};
  }
  put(i, c, r, u, w, h, turn = 0) {
    const p = this.geometry.attributes.position.array, o = i * 12, cs = Math.cos(turn), sn = Math.sin(turn);
    for (let k = 0; k < 4; k++) { const x = (k === 0 || k === 3 ? -0.5 : 0.5) * w, y = (k < 2 ? -0.5 : 0.5) * h, sx = x * cs - y * sn, sy = x * sn + y * cs;
      p[o + k * 3] = c.x + r.x * sx + u.x * sy; p[o + k * 3 + 1] = c.y + r.y * sx + u.y * sy; p[o + k * 3 + 2] = c.z + r.z * sx + u.z * sy; }
  }
  done() { this.geometry.attributes.position.needsUpdate = true; }
}

export class FX {
  constructor(parent, renderer) {
    this.parent = parent;
    this.tex = {};
    this.items = []; // each has update(dt, r, u) -> false when finished, and dispose()
    const loader = new THREE.TextureLoader(), an = Math.min(4, renderer.capabilities.getMaxAnisotropy());
    for (const n of NAMES) {
      const t = loader.load(`/chess-assets/fx/${n}.png`);
      t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = an;
      this.tex[n] = t;
    }
  }

  mat(tex, color, additive, opacity = 1) {
    return new THREE.MeshBasicMaterial({ map: this.tex[tex], color, transparent: true, opacity: additive ? Math.min(GLOW, opacity) : opacity, depthWrite: false, blending: additive ? THREE.AdditiveBlending : THREE.NormalBlending });
  }
  mesh(n, mat, order) { const q = new Quads(n, mat); q.renderOrder = order; this.parent.add(q); return q; }
  end(q) { this.parent.remove(q); q.geometry.dispose(); q.material.dispose(); }

  // A puff of squares flying outward: one mesh.
  burst({ pos, tex, color = 0xffffff, count = 10, size = 0.4, life = 0.6, speed = 2, up = 1, gravity = 0, drag = 2, grow = 0, additive = true, spread = 0.1, opacity = 1 }) {
    const mat = this.mat(tex, color, additive, opacity), top = mat.opacity, q = this.mesh(count, mat, 8), P = [], V = [], S = [];
    for (let i = 0; i < count; i++) {
      const a = Math.random() * Math.PI * 2, r = Math.random(), sp = speed * (0.4 + Math.random() * 0.8);
      P.push(new THREE.Vector3(pos.x + Math.cos(a) * r * spread, pos.y + Math.random() * spread, pos.z + Math.sin(a) * r * spread));
      V.push(new THREE.Vector3(Math.cos(a) * sp, (Math.random() * 0.8 + 0.2) * up * speed, Math.sin(a) * sp)); S.push(size * (0.6 + Math.random() * 0.8));
    }
    let age = 0;
    this.items.push({
      update: (dt, r, u) => {
        age += dt;
        const k = age / life;
        if (k >= 1) return false;
        mat.opacity = top * (k < 0.2 ? k / 0.2 : 1 - (k - 0.2) / 0.8);
        for (let i = 0; i < count; i++) {
          const v = V[i];
          v.multiplyScalar(Math.max(0, 1 - drag * dt)); v.y -= gravity * dt;
          P[i].addScaledVector(v, dt);
          if (P[i].y < 0.03) { P[i].y = 0.03; v.y *= -0.3; }
          const sz = S[i] * (1 + grow * k);
          q.put(i, P[i], r, u, sz, sz);
        }
        q.done();
        return true;
      },
      dispose: () => this.end(q),
    });
  }

  // One square that swells and fades (slashes, glows, rings).
  flash({ pos, tex, color = 0xffffff, size = 1, life = 0.25, grow = 0.6, rotation = 0, spin = 0, additive = true, opacity = 1 }) {
    const mat = this.mat(tex, color, additive, opacity), top = mat.opacity, q = this.mesh(1, mat, 9), at = pos.clone();
    let age = 0, turn = rotation;
    mat.opacity = 0;
    this.items.push({
      update: (dt, r, u) => {
        age += dt;
        const k = age / life;
        if (k >= 1) return false;
        const sz = size * (1 + grow * k);
        turn += spin * dt;
        q.put(0, at, r, u, sz, sz, turn); q.done();
        mat.opacity = top * Math.min(1, k / 0.25) * (1 - k * k);
        return true;
      },
      dispose: () => this.end(q),
    });
  }

  // A mark lying flat on the board that slowly fades (scorch).
  decal({ pos, tex, color = 0x000000, size = 2.4, life = 8, opacity = 0.6 }) {
    const mat = new THREE.MeshBasicMaterial({ map: this.tex[tex], color, transparent: true, opacity: 0, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -4 });
    const m = new THREE.Mesh(new THREE.PlaneGeometry(size, size), mat);
    m.rotation.x = -Math.PI / 2;
    m.rotation.z = Math.random() * 6.28;
    m.position.set(pos.x, (pos.y || 0) + 0.012, pos.z);
    m.raycast = () => {}; m.renderOrder = 3;
    this.parent.add(m);
    let age = 0;
    this.items.push({
      update: dt => { age += dt; mat.opacity = opacity * Math.min(1, age / 0.3, (life - age) / (life * 0.5)); return age < life; },
      dispose: () => { this.parent.remove(m); m.geometry.dispose(); mat.dispose(); },
    });
  }

  // A square flying on an arc with a fading trail (one mesh for the trail); calls onHit when it lands.
  projectile({ from, to, arc = 1, dur = 0.4, tex, color = 0xffffff, size = 0.5, trailTex, trailColor = 0xffffff, trailSize = 0.3, onHit }) {
    const N = 10, head = this.mesh(1, this.mat(tex, color, true), 9), trail = trailTex ? this.mesh(N, this.mat(trailTex, trailColor, true, 0.4), 8) : null;
    const p = new THREE.Vector3(), T = [];
    let age = 0, since = 1, next = 0;
    if (trail) for (let i = 0; i < N; i++) T.push({ p: new THREE.Vector3(), a: 9 });
    this.items.push({
      update: (dt, r, u) => {
        age += dt; since += dt;
        const k = Math.min(1, age / dur);
        p.lerpVectors(from, to, k);
        p.y += Math.sin(k * Math.PI) * arc;
        head.put(0, p, r, u, size, size); head.done();
        if (trail) {
          if (since > 0.035) { since = 0; T[next].p.copy(p); T[next].a = 0; next = (next + 1) % N; }
          for (let i = 0; i < N; i++) { const t = T[i]; t.a += dt; const f = Math.max(0, 1 - t.a / 0.32); trail.put(i, t.p, r, u, trailSize * f * (1 + t.a * 2), trailSize * f * (1 + t.a * 2)); }
          trail.done();
        }
        if (k >= 1) { if (onHit) onHit(); return false; }
        return true;
      },
      dispose: () => { this.end(head); if (trail) this.end(trail); },
    });
  }

  // r, u: the eye's right and up in the board's own space
  update(dt, r, u) {
    for (let i = this.items.length - 1; i >= 0; i--) {
      if (!this.items[i].update(dt, r, u)) { this.items[i].dispose(); this.items.splice(i, 1); }
    }
  }
}
