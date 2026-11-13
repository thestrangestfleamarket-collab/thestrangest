// Pooled point-sprite particles (sparks, fire, smoke) plus GPU-animated weather.
import * as THREE from 'three';

const _vp = new THREE.Vector4();

// Point size has to be scaled by the pixel height of whatever is being rendered to
// (window, or one eye of the headset), so read it at draw time.
function trackViewport(points) {
  points.onBeforeRender = (renderer) => {
    renderer.getCurrentViewport(_vp);
    points.material.uniforms.uScale.value = _vp.w * 0.5;
    points.material.uniformsNeedUpdate = true;
  };
}

export class Particles {
  constructor(root, max = 2500, blending = THREE.AdditiveBlending) {
    this.max = max; this.cursor = 0;
    this.pos = new Float32Array(max * 3);
    this.col = new Float32Array(max * 3);
    this.data = new Float32Array(max * 2);       // size, alpha
    this.vel = new Float32Array(max * 3);
    this.life = new Float32Array(max);
    this.maxLife = new Float32Array(max);
    this.drag = new Float32Array(max);
    this.grav = new Float32Array(max);
    this.s0 = new Float32Array(max); this.s1 = new Float32Array(max);
    this.a0 = new Float32Array(max);
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(this.pos, 3).setUsage(THREE.DynamicDrawUsage));
    g.setAttribute('aColor', new THREE.BufferAttribute(this.col, 3).setUsage(THREE.DynamicDrawUsage));
    g.setAttribute('aData', new THREE.BufferAttribute(this.data, 2).setUsage(THREE.DynamicDrawUsage));
    const mat = new THREE.ShaderMaterial({
      uniforms: { uScale: { value: 400 } },
      vertexShader: `
        attribute vec3 aColor; attribute vec2 aData; uniform float uScale;
        varying vec3 vC; varying float vA;
        void main() {
          vec4 mv = modelViewMatrix * vec4(position, 1.0);
          gl_Position = projectionMatrix * mv;
          gl_PointSize = aData.x * uScale * projectionMatrix[1][1] / max(0.05, -mv.z);
          vC = aColor; vA = aData.y;
        }`,
      fragmentShader: `
        varying vec3 vC; varying float vA;
        void main() {
          float a = smoothstep(0.5, 0.0, length(gl_PointCoord - 0.5));
          gl_FragColor = vec4(vC, a * a * vA);
          #include <colorspace_fragment>
        }`,
      transparent: true, depthWrite: false, blending,
    });
    this.points = new THREE.Points(g, mat);
    this.points.frustumCulled = false;
    this.points.renderOrder = 5;
    trackViewport(this.points);
    root.add(this.points);
    this.c = new THREE.Color();
  }

  // o: { color, size, endSize, life, alpha, drag, gravity }
  emit(p, vx, vy, vz, o) {
    const i = this.cursor; this.cursor = (i + 1) % this.max;
    const i3 = i * 3;
    this.pos[i3] = p.x; this.pos[i3 + 1] = p.y; this.pos[i3 + 2] = p.z;
    this.vel[i3] = vx; this.vel[i3 + 1] = vy; this.vel[i3 + 2] = vz;
    this.c.set(o.color ?? 0xffffff);
    this.col[i3] = this.c.r; this.col[i3 + 1] = this.c.g; this.col[i3 + 2] = this.c.b;
    this.life[i] = this.maxLife[i] = o.life ?? 0.5;
    this.s0[i] = o.size ?? 0.05; this.s1[i] = o.endSize ?? 0;
    this.a0[i] = o.alpha ?? 1;
    this.drag[i] = o.drag ?? 0; this.grav[i] = o.gravity ?? 0;
  }

  // Spray n particles in random directions (optionally biased along `dir`).
  burst(p, n, speed, o, dir = null, spread = 1) {
    for (let k = 0; k < n; k++) {
      let x = Math.random() * 2 - 1, y = Math.random() * 2 - 1, z = Math.random() * 2 - 1;
      const l = Math.hypot(x, y, z) || 1;
      x /= l; y /= l; z /= l;
      if (dir) { x = dir.x + x * spread; y = dir.y + y * spread; z = dir.z + z * spread; }
      const s = speed * (0.35 + Math.random() * 0.65);
      this.emit(p, x * s, y * s, z * s, { ...o, life: (o.life ?? 0.5) * (0.6 + Math.random() * 0.6) });
    }
  }

  update(dt) {
    const { pos, vel, life, maxLife, data } = this;
    for (let i = 0; i < this.max; i++) {
      if (life[i] <= 0) continue;
      life[i] -= dt;
      const i3 = i * 3, i2 = i * 2;
      if (life[i] <= 0) { data[i2] = 0; data[i2 + 1] = 0; continue; }
      const d = Math.exp(-this.drag[i] * dt);
      vel[i3] *= d; vel[i3 + 1] = vel[i3 + 1] * d + this.grav[i] * dt; vel[i3 + 2] *= d;
      pos[i3] += vel[i3] * dt; pos[i3 + 1] += vel[i3 + 1] * dt; pos[i3 + 2] += vel[i3 + 2] * dt;
      const k = 1 - life[i] / maxLife[i];
      data[i2] = this.s0[i] + (this.s1[i] - this.s0[i]) * k;
      data[i2 + 1] = this.a0[i] * (1 - k * k);
    }
    const g = this.points.geometry;
    g.attributes.position.needsUpdate = true;
    g.attributes.aColor.needsUpdate = true;
    g.attributes.aData.needsUpdate = true;
  }
}

// Rain / snow / embers / dust. Motion is computed in the vertex shader, so it costs
// nothing on the CPU. Drops wrap around inside a box centred on the arena.
const WEATHER_VERT = `
  attribute float aSeed; attribute float aEnd;
  uniform float uTime, uFall, uSway, uSize, uScale, uStreak; uniform vec3 uBox;
  varying float vFade;
  void main() {
    vec3 p = position;
    float sp = 0.6 + 0.8 * aSeed;
    p.y = fract(p.y - uTime * uFall * sp / uBox.y);
    p.x += sin(uTime * (0.5 + aSeed) + aSeed * 40.0) * uSway / uBox.x;
    p.z += cos(uTime * (0.4 + aSeed) + aSeed * 17.0) * uSway / uBox.z;
    vFade = smoothstep(0.0, 0.08, p.y) * smoothstep(1.0, 0.85, p.y);
    p = (p - vec3(0.5, 0.0, 0.5)) * uBox;
    p.y += aEnd * uStreak; p.x += aEnd * uStreak * 0.12;
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = uSize * (0.5 + aSeed) * uScale * projectionMatrix[1][1] / max(0.05, -mv.z);
  }`;

function weatherGeometry(n, lines) {
  const per = lines ? 2 : 1;
  const pos = new Float32Array(n * per * 3), seed = new Float32Array(n * per), end = new Float32Array(n * per);
  for (let i = 0; i < n; i++) {
    const x = Math.random(), y = Math.random(), z = Math.random(), s = Math.random();
    for (let k = 0; k < per; k++) {
      const j = i * per + k;
      pos[j * 3] = x; pos[j * 3 + 1] = y; pos[j * 3 + 2] = z;
      seed[j] = s; end[j] = k;
    }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  g.setAttribute('aSeed', new THREE.BufferAttribute(seed, 1));
  g.setAttribute('aEnd', new THREE.BufferAttribute(end, 1));
  return g;
}

export class Weather {
  constructor(root) {
    this.root = root;
    this.obj = null;
  }

  // cfg: { type: 'rain'|'snow'|'embers'|'dust', count, color, fall, sway, size, opacity }
  set(cfg, box) {
    if (this.obj) { this.root.remove(this.obj); this.obj.geometry.dispose(); this.obj.material.dispose(); this.obj = null; }
    if (!cfg) return;
    const lines = cfg.type === 'rain';
    const mat = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 }, uFall: { value: cfg.fall }, uSway: { value: cfg.sway ?? 0 },
        uSize: { value: cfg.size ?? 0.03 }, uScale: { value: 400 }, uStreak: { value: cfg.streak ?? 0 },
        uBox: { value: box.clone() }, uColor: { value: new THREE.Color(cfg.color) }, uOpacity: { value: cfg.opacity ?? 0.6 },
      },
      vertexShader: WEATHER_VERT,
      fragmentShader: lines ? `
        uniform vec3 uColor; uniform float uOpacity; varying float vFade;
        void main() {
          gl_FragColor = vec4(uColor, uOpacity * vFade);
          #include <colorspace_fragment>
        }` : `
        uniform vec3 uColor; uniform float uOpacity; varying float vFade;
        void main() {
          float a = smoothstep(0.5, 0.0, length(gl_PointCoord - 0.5));
          gl_FragColor = vec4(uColor, a * uOpacity * vFade);
          #include <colorspace_fragment>
        }`,
      transparent: true, depthWrite: false,
      blending: cfg.type === 'snow' ? THREE.NormalBlending : THREE.AdditiveBlending,
    });
    const geo = weatherGeometry(cfg.count, lines);
    this.obj = lines ? new THREE.LineSegments(geo, mat) : new THREE.Points(geo, mat);
    this.obj.frustumCulled = false;
    this.obj.renderOrder = 4;
    if (!lines) trackViewport(this.obj);
    this.root.add(this.obj);
  }

  update(time) {
    if (this.obj) this.obj.material.uniforms.uTime.value = time;
  }
}
