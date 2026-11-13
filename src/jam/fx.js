// STADIUM JAM's pyrotechnics: fireworks over the far stands and spark fountains at the stage edge, one particle pool
import * as THREE from 'three';

const PALETTE = [[1, 0.25, 0.2], [1, 0.75, 0.25], [0.3, 0.6, 1], [0.4, 1, 0.5], [1, 0.4, 0.9], [1, 1, 1], [1, 0.55, 0.15]];

export class Fx {
  constructor(scene, low, onBoom) {
    this.low = low;
    this.onBoom = onBoom;
    const N = (this.N = low ? 1600 : 6000);
    this.pos = new Float32Array(N * 3);
    this.vel = new Float32Array(N * 3);
    this.base = new Float32Array(N * 3);
    this.col = new Float32Array(N * 3);
    this.size = new Float32Array(N);
    this.life = new Float32Array(N);
    this.max = new Float32Array(N);
    this.phys = new Float32Array(N * 2); // drag, gravity
    this.next = 0;
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(this.pos, 3));
    g.setAttribute('aColor', new THREE.BufferAttribute(this.col, 3));
    g.setAttribute('aSize', new THREE.BufferAttribute(this.size, 1));
    this.points = new THREE.Points(g, new THREE.ShaderMaterial({
      transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, fog: false,
      vertexShader: `attribute vec3 aColor; attribute float aSize; varying vec3 vC;
        void main(){ vC = aColor; vec4 mv = modelViewMatrix * vec4(position, 1.); gl_PointSize = clamp(aSize * 420. / -mv.z, 0., 40.); gl_Position = projectionMatrix * mv; }`,
      fragmentShader: `varying vec3 vC; void main(){ float d = length(gl_PointCoord - .5); float a = smoothstep(.5, .0, d); gl_FragColor = vec4(vC * a * a, 1.); }`,
    }));
    this.points.frustumCulled = false;
    scene.add(this.points);
    this.shells = [];
    this.gerb = 0;
    this.flash = new THREE.Color(0, 0, 0);
  }

  spawn(x, y, z, vx, vy, vz, c, life, size, drag, grav) {
    const i = this.next;
    this.next = (i + 1) % this.N;
    this.pos.set([x, y, z], i * 3);
    this.vel.set([vx, vy, vz], i * 3);
    this.base.set(c, i * 3);
    this.life[i] = this.max[i] = life;
    this.size[i] = size;
    this.phys[i * 2] = drag;
    this.phys[i * 2 + 1] = grav;
  }

  // Launch a shell from behind the stands.
  firework() {
    const side = Math.random();
    const x = side < 0.6 ? (Math.random() - 0.5) * 170 : (side < 0.8 ? -1 : 1) * (95 + Math.random() * 25);
    const z = side < 0.6 ? -135 - Math.random() * 30 : -30 - Math.random() * 70;
    this.shells.push({ p: new THREE.Vector3(x, 30, z), vy: 46 + Math.random() * 16, t: 1.5 + Math.random() * 0.5, c: PALETTE[(Math.random() * PALETTE.length) | 0] });
  }

  // Spark fountains along the downstage edge for `seconds`.
  gerbs(seconds = 1.6) { this.gerb = Math.max(this.gerb, seconds); }

  _burst(s, listener) {
    const n = this.low ? 110 : 320, sp = 16 + Math.random() * 10;
    const c2 = Math.random() < 0.4 ? PALETTE[(Math.random() * PALETTE.length) | 0] : s.c;
    for (let i = 0; i < n; i++) {
      const u = Math.random() * 2 - 1, a = Math.random() * 6.283, r = Math.sqrt(1 - u * u), v = sp * (0.85 + Math.random() * 0.3);
      this.spawn(s.p.x, s.p.y, s.p.z, r * Math.cos(a) * v, u * v, r * Math.sin(a) * v, i % 3 ? s.c : c2, 1.6 + Math.random() * 1.2, 1.5, 1.1, 5);
    }
    this.flash.r = Math.min(1.2, this.flash.r + s.c[0] * 0.8); this.flash.g = Math.min(1.2, this.flash.g + s.c[1] * 0.8); this.flash.b = Math.min(1.2, this.flash.b + s.c[2] * 0.8);
    this.onBoom?.(s.p.distanceTo(listener) / 343);
  }

  update(dt, listener) {
    for (let k = this.shells.length - 1; k >= 0; k--) {
      const s = this.shells[k];
      s.p.y += s.vy * dt;
      s.vy -= 14 * dt;
      s.t -= dt;
      this.spawn(s.p.x, s.p.y, s.p.z, (Math.random() - 0.5) * 2, -3, (Math.random() - 0.5) * 2, [1, 0.7, 0.35], 0.5, 0.8, 1, 3);
      if (s.t <= 0) { this._burst(s, listener); this.shells.splice(k, 1); }
    }
    if (this.gerb > 0) {
      this.gerb -= dt;
      const per = this.low ? 4 : 10;
      for (let x = -11; x <= 11; x += 5.5) {
        for (let i = 0; i < per; i++) {
          this.spawn(x, 0.1, -5.75, (Math.random() - 0.5) * 2.4, 8 + Math.random() * 5, (Math.random() - 0.5) * 2.4, [1, 0.72 + Math.random() * 0.2, 0.3], 0.6 + Math.random() * 0.5, 0.22, 0.6, 9.8);
        }
      }
    }
    const { pos, vel, col, base, life, max, phys } = this;
    for (let i = 0; i < this.N; i++) {
      if (life[i] <= 0) continue;
      life[i] -= dt;
      const j = i * 3;
      if (life[i] <= 0) { col[j] = col[j + 1] = col[j + 2] = 0; continue; }
      const drag = Math.exp(-phys[i * 2] * dt);
      vel[j] *= drag; vel[j + 1] = vel[j + 1] * drag - phys[i * 2 + 1] * dt; vel[j + 2] *= drag;
      pos[j] += vel[j] * dt; pos[j + 1] += vel[j + 1] * dt; pos[j + 2] += vel[j + 2] * dt;
      const f = life[i] / max[i], k = f * f * (0.75 + 0.5 * Math.random()) * 2.2; // fade with a sparkle
      col[j] = base[j] * k; col[j + 1] = base[j + 1] * k; col[j + 2] = base[j + 2] * k;
    }
    const g = this.points.geometry;
    g.attributes.position.needsUpdate = true;
    g.attributes.aColor.needsUpdate = true;
    g.attributes.aSize.needsUpdate = true;
    this.flash.multiplyScalar(Math.exp(-dt * 4));
    return this.flash;
  }
}
