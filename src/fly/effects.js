// Clouds (instanced lit impostor puffs), pooled particle system (smoke, fire, vapour, flares), bullet tracers.
import * as THREE from 'three';
import { atmo, ATMO_GLSL } from './sky.js';

const hash = n => { const x = Math.sin(n * 127.1) * 43758.5453; return x - Math.floor(x); };

function puffTexture() { // eroded-noise cloud puff: soft core, wispy broken edge
  const S = 128, c = document.createElement('canvas'); c.width = c.height = S; const g = c.getContext('2d'); const im = g.createImageData(S, S);
  const vn = (x, y) => { const xi = Math.floor(x), yi = Math.floor(y), xf = x - xi, yf = y - yi, u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf); const h = (a, b) => hash(a * 12.9898 + b * 78.233); return h(xi, yi) * (1 - u) * (1 - v) + h(xi + 1, yi) * u * (1 - v) + h(xi, yi + 1) * (1 - u) * v + h(xi + 1, yi + 1) * u * v; };
  for (let y = 0; y < S; y++) for (let x = 0; x < S; x++) { const dx = x / S - 0.5, dy = y / S - 0.5, r = Math.hypot(dx, dy) * 2; let n = 0, a = 0.5, f = 5; for (let o = 0; o < 4; o++) { n += a * vn(x / S * f + 3.3, y / S * f + 7.1); a *= 0.5; f *= 2.1; }
    let al = (1 - r) - 0.62 * (1 - n * 1.05) * (0.35 + r); al = Math.max(0, Math.min(1, al * 2.6)); al = al * al * (3 - 2 * al); const k = (y * S + x) * 4; im.data[k] = im.data[k + 1] = im.data[k + 2] = 255; im.data[k + 3] = al * 255; }
  g.putImageData(im, 0, 0); const t = new THREE.CanvasTexture(c); t.generateMipmaps = true; return t;
}

export class Clouds {
  constructor(scene, quality = 1) {
    const NC = Math.round(170 * quality), per = 14; const max = NC * per; this.count = max;
    this.base = new Float32Array(max * 4); this.par = new Float32Array(max * 4); let n = 0;
    for (let c = 0; c < NC; c++) {
      const cx = (hash(c * 3.1) - 0.5) * 110000, cz = (hash(c * 7.7 + 1) - 0.5) * 110000, cy = 1500 + hash(c * 5.3 + 2) * 1300, big = 0.6 + hash(c + 0.5) * 1.3;
      for (let p = 0; p < per; p++) { const k = c * 31 + p; const a = hash(k) * 6.283, r = hash(k + 0.3) * 520 * big; const up = hash(k + 0.6);
        const x = cx + Math.cos(a) * r * 1.6, z = cz + Math.sin(a) * r, y = cy + up * up * 520 * big * (1 - r / (540 * big));
        this.base.set([x, y, z, (190 + hash(k + 0.9) * 260) * big * (1.25 - 0.5 * up)], n * 4); this.par.set([(y - cy) / (520 * big), hash(k + 0.2) * 6.28, 0.75 + hash(k + 0.4) * 0.25, 0], n * 4); n++; }
    }
    const g = new THREE.InstancedBufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute([-1, -1, 0, 1, -1, 0, 1, 1, 0, -1, 1, 0], 3)); g.setIndex([0, 1, 2, 0, 2, 3]);
    this.aBase = new THREE.InstancedBufferAttribute(new Float32Array(max * 4), 4); this.aPar = new THREE.InstancedBufferAttribute(new Float32Array(max * 4), 4); this.aBase.setUsage(THREE.DynamicDrawUsage); this.aPar.setUsage(THREE.DynamicDrawUsage);
    g.setAttribute('iBase', this.aBase); g.setAttribute('iPar', this.aPar); g.instanceCount = max;
    this.mat = new THREE.ShaderMaterial({ uniforms: { ...atmo, tPuff: { value: puffTexture() } }, transparent: true, depthWrite: false, fog: false, blending: THREE.CustomBlending, blendSrc: THREE.OneFactor, blendDst: THREE.OneMinusSrcAlphaFactor,
      vertexShader: /* glsl */`attribute vec4 iBase, iPar; varying vec2 vUv; varying vec3 vW; varying float vH, vA, vOp;
        void main(){ vec3 c = iBase.xyz; vec3 toC = cameraPosition - c; float d = length(toC);
          vec3 f = toC / d; vec3 r = normalize(cross(vec3(0.0, 1.0, 0.0), f)); vec3 u = cross(f, r);
          float cs = cos(iPar.y), sn = sin(iPar.y); vec2 q = mat2(cs, -sn, sn, cs) * position.xy;
          vec3 p = c + (r * q.x + u * q.y) * iBase.w; vW = p; vUv = position.xy * 0.5 + 0.5; vH = iPar.x + q.y * 0.35; vOp = iPar.z;
          vA = smoothstep(iBase.w * 0.35, iBase.w * 1.6, d);        // fade when the camera enters a puff (no hard clipping, low overdraw)
          gl_Position = projectionMatrix * viewMatrix * vec4(p, 1.0); if (vA < 0.004) gl_Position = vec4(2.0, 2.0, 2.0, 1.0); }`,
      fragmentShader: ATMO_GLSL + /* glsl */`uniform sampler2D tPuff; varying vec2 vUv; varying vec3 vW; varying float vH, vA, vOp;
        void main(){ float a = texture2D(tPuff, vUv).a * vA * vOp; if (a < 0.006) discard;
          vec3 vd = normalize(vW - cameraPosition); float fwd = pow(max(dot(vd, uSunDir), 0.0), 6.0);
          float h = clamp(vH, 0.0, 1.0);
          float tex = texture2D(tPuff, vUv + uSunDir.xy * 0.06).a; float shade = clamp(0.55 + (a / max(vA * vOp, 0.01) - tex) * 1.6, 0.0, 1.0);
          vec3 col = uSunCol * (0.1 + 0.22 * h + 0.14 * shade + 0.4 * fwd * (1.0 - a)) * (0.45 + 0.55 * max(uSunDir.y, 0.0) + 0.3 * fwd) + mix(uGroundAmb * 2.0 + uSkyAmb * 0.42, uSkyAmb * 1.05, h);
          col = applyFog(col, vW, cameraPosition);
          gl_FragColor = vec4(col * a, a);
          #include <tonemapping_fragment>
          #include <colorspace_fragment>
          gl_FragColor.rgb *= 1.0; }` });
    // premultiplied output must be multiplied after tone mapping: patch shader tail
    this.mat.fragmentShader = this.mat.fragmentShader.replace('gl_FragColor = vec4(col * a, a);', 'gl_FragColor = vec4(col, a);').replace('gl_FragColor.rgb *= 1.0;', 'gl_FragColor.rgb *= gl_FragColor.a;');
    this.mesh = new THREE.Mesh(g, this.mat); this.mesh.frustumCulled = false; this.mesh.renderOrder = 5; scene.add(this.mesh);
    this.order = new Uint32Array(max).map((_, i) => i); this.dist = new Float32Array(max); this.timer = 0; this.sort(new THREE.Vector3());
  }
  sort(cam) { const b = this.base, d = this.dist, n = this.count; for (let i = 0; i < n; i++) { const dx = b[i * 4] - cam.x, dy = b[i * 4 + 1] - cam.y, dz = b[i * 4 + 2] - cam.z; d[i] = dx * dx + dy * dy + dz * dz; }
    this.order.sort((a, c) => d[c] - d[a]); const A = this.aBase.array, P = this.aPar.array, pa = this.par;
    for (let i = 0; i < n; i++) { const s = this.order[i] * 4, t = i * 4; A[t] = b[s]; A[t + 1] = b[s + 1]; A[t + 2] = b[s + 2]; A[t + 3] = b[s + 3]; P[t] = pa[s]; P[t + 1] = pa[s + 1]; P[t + 2] = pa[s + 2]; }
    this.aBase.needsUpdate = true; this.aPar.needsUpdate = true; }
  setQuality(q) { this.mesh.geometry.instanceCount = Math.floor(this.count * (q < 1 ? 0.6 : 1) / 14) * 14; this.limit = this.mesh.geometry.instanceCount; }
  update(dt, cam) { this.timer -= dt; if (this.timer <= 0) { this.timer = 0.4; this.sort(cam); } }
}

// ---------- particles ----------
const MAXP = 3500;
export class Particles {
  constructor(scene) {
    this.p = new Float32Array(MAXP * 3); this.v = new Float32Array(MAXP * 3); this.life = new Float32Array(MAXP); this.max = new Float32Array(MAXP); this.s0 = new Float32Array(MAXP); this.s1 = new Float32Array(MAXP);
    this.col = new Float32Array(MAXP * 4); this.kind = new Float32Array(MAXP); this.next = 0;
    const g = new THREE.InstancedBufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute([-1, -1, 0, 1, -1, 0, 1, 1, 0, -1, 1, 0], 3)); g.setIndex([0, 1, 2, 0, 2, 3]);
    this.aP = new THREE.InstancedBufferAttribute(new Float32Array(MAXP * 4), 4); this.aC = new THREE.InstancedBufferAttribute(new Float32Array(MAXP * 4), 4); this.aP.setUsage(THREE.DynamicDrawUsage); this.aC.setUsage(THREE.DynamicDrawUsage);
    g.setAttribute('iP', this.aP); g.setAttribute('iC', this.aC); g.instanceCount = 0;
    this.mat = new THREE.ShaderMaterial({ uniforms: { ...atmo }, transparent: true, depthWrite: false, fog: false, blending: THREE.CustomBlending, blendSrc: THREE.OneFactor, blendDst: THREE.OneMinusSrcAlphaFactor,
      vertexShader: /* glsl */`attribute vec4 iP, iC; varying vec2 vUv; varying vec4 vC; varying vec3 vW;
        void main(){ vec4 mv = viewMatrix * vec4(iP.xyz, 1.0); mv.xy += position.xy * iP.w; vUv = position.xy; vC = iC; vW = iP.xyz; gl_Position = projectionMatrix * mv; }`,
      fragmentShader: ATMO_GLSL + /* glsl */`varying vec2 vUv; varying vec4 vC; varying vec3 vW;
        void main(){ float r = dot(vUv, vUv); if (r > 1.0) discard; float fall = (1.0 - r); float add = step(1.5, vC.a); float a = fall * fall * (add > 0.5 ? vC.a - 2.0 : vC.a);
          vec3 col = vC.rgb; if (add < 0.5) { col *= (uSunCol * (0.35 + 0.3 * max(uSunDir.y, 0.0)) + uSkyAmb * 1.1); col = applyFog(col, vW, cameraPosition); }
          gl_FragColor = vec4(col, a);
          #include <tonemapping_fragment>
          #include <colorspace_fragment>
          gl_FragColor.rgb *= a; gl_FragColor.a *= (1.0 - add); }` });
    this.mesh = new THREE.Mesh(g, this.mat); this.mesh.frustumCulled = false; this.mesh.renderOrder = 8; scene.add(this.mesh);
  }
  // kind: 0 lit smoke/vapour, 1 additive (fire, flash)
  spawn(x, y, z, vx, vy, vz, life, s0, s1, r, g, b, a, additive = false) {
    const i = this.next; this.next = (this.next + 1) % MAXP; this.p[i * 3] = x; this.p[i * 3 + 1] = y; this.p[i * 3 + 2] = z; this.v[i * 3] = vx; this.v[i * 3 + 1] = vy; this.v[i * 3 + 2] = vz;
    this.life[i] = this.max[i] = life; this.s0[i] = s0; this.s1[i] = s1; this.col[i * 4] = r; this.col[i * 4 + 1] = g; this.col[i * 4 + 2] = b; this.col[i * 4 + 3] = a; this.kind[i] = additive ? 1 : 0;
  }
  update(dt) {
    const P = this.aP.array, C = this.aC.array; let n = 0;
    for (let i = 0; i < MAXP; i++) { if (this.life[i] <= 0) continue; this.life[i] -= dt; if (this.life[i] <= 0) continue; const t = 1 - this.life[i] / this.max[i];
      const k = i * 3; const drag = Math.exp(-dt * (this.kind[i] ? 2.5 : 1.2)); this.v[k] *= drag; this.v[k + 1] = this.v[k + 1] * drag + (this.kind[i] ? 1.5 : 0.6) * dt; this.v[k + 2] *= drag;
      this.p[k] += this.v[k] * dt; this.p[k + 1] += this.v[k + 1] * dt; this.p[k + 2] += this.v[k + 2] * dt;
      P[n * 4] = this.p[k]; P[n * 4 + 1] = this.p[k + 1]; P[n * 4 + 2] = this.p[k + 2]; P[n * 4 + 3] = this.s0[i] + (this.s1[i] - this.s0[i]) * Math.sqrt(t);
      const fade = Math.min(1, t * 12) * (1 - t) ** (this.kind[i] ? 1.5 : 1); C[n * 4] = this.col[i * 4]; C[n * 4 + 1] = this.col[i * 4 + 1]; C[n * 4 + 2] = this.col[i * 4 + 2]; C[n * 4 + 3] = this.col[i * 4 + 3] * fade + (this.kind[i] ? 2 : 0); n++; }
    this.mesh.geometry.instanceCount = n; this.aP.needsUpdate = true; this.aC.needsUpdate = true;
  }
  explosion(pos, vel, scale = 1) {
    for (let i = 0; i < 26; i++) { const a = Math.random() * 6.28, b = Math.acos(2 * Math.random() - 1), sp = (8 + Math.random() * 26) * scale; const dx = Math.sin(b) * Math.cos(a), dy = Math.cos(b), dz = Math.sin(b) * Math.sin(a);
      this.spawn(pos.x, pos.y, pos.z, vel.x * 0.4 + dx * sp, vel.y * 0.4 + dy * sp, vel.z * 0.4 + dz * sp, 0.5 + Math.random() * 0.7, 3 * scale, 13 * scale, 6, 2.6 + Math.random() * 1.5, 0.5, 0.9, true);
      if (i % 2) this.spawn(pos.x + dx * 4, pos.y + dy * 4, pos.z + dz * 4, vel.x * 0.3 + dx * sp * 0.5, vel.y * 0.3 + dy * sp * 0.5, vel.z * 0.3 + dz * sp * 0.5, 3 + Math.random() * 3.5, 5 * scale, 34 * scale, 0.05, 0.05, 0.05, 0.75); }
    this.spawn(pos.x, pos.y, pos.z, vel.x * 0.4, vel.y * 0.4, vel.z * 0.4, 0.22, 26 * scale, 60 * scale, 12, 9, 5, 1, true);
  }
}

// ---------- tracers ----------
const MAXB = 1400;
export class Tracers {
  constructor(scene) {
    this.pos = new Float32Array(MAXB * 3); this.vel = new Float32Array(MAXB * 3); this.life = new Float32Array(MAXB); this.owner = new Array(MAXB).fill(null); this.dmg = new Float32Array(MAXB); this.next = 0;
    const g = new THREE.InstancedBufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute([0, -1, 0, 1, -1, 0, 1, 1, 0, 0, 1, 0], 3)); g.setIndex([0, 1, 2, 0, 2, 3]);
    this.aA = new THREE.InstancedBufferAttribute(new Float32Array(MAXB * 3), 3); this.aB = new THREE.InstancedBufferAttribute(new Float32Array(MAXB * 3), 3); this.aA.setUsage(THREE.DynamicDrawUsage); this.aB.setUsage(THREE.DynamicDrawUsage);
    g.setAttribute('iA', this.aA); g.setAttribute('iB', this.aB); g.instanceCount = 0;
    this.mesh = new THREE.Mesh(g, new THREE.ShaderMaterial({ transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, fog: false,
      vertexShader: /* glsl */`attribute vec3 iA, iB; varying vec2 vUv;
        void main(){ vec4 a = viewMatrix * vec4(iA, 1.0), b = viewMatrix * vec4(iB, 1.0); vec4 p = mix(a, b, position.x); vec2 dir = normalize(b.xy / -b.z - a.xy / -a.z + 1e-6);
          float w = max(0.13, -p.z * 0.0026); p.xy += vec2(-dir.y, dir.x) * position.y * w; vUv = position.xy; gl_Position = projectionMatrix * p; }`,
      fragmentShader: /* glsl */`varying vec2 vUv; void main(){ float a = (1.0 - abs(vUv.y)) * smoothstep(0.0, 0.25, vUv.x); gl_FragColor = vec4(mix(vec3(1.0, 0.55, 0.15), vec3(1.0, 0.95, 0.7), a * a) * 4.0 * a, 1.0);
          #include <tonemapping_fragment>
          #include <colorspace_fragment>
        }` }));
    this.mesh.frustumCulled = false; this.mesh.renderOrder = 9; scene.add(this.mesh);
  }
  fire(pos, vel, owner, dmg) { const i = this.next; this.next = (this.next + 1) % MAXB; this.pos.set([pos.x, pos.y, pos.z], i * 3); this.vel.set([vel.x, vel.y, vel.z], i * 3); this.life[i] = 2.6; this.owner[i] = owner; this.dmg[i] = dmg; }
  // integrates bullets; onStep(i, x0,y0,z0, x1,y1,z1) returns true if the bullet was consumed
  update(dt, onStep) {
    const A = this.aA.array, B = this.aB.array, p = this.pos, v = this.vel; let n = 0;
    for (let i = 0; i < MAXB; i++) { if (this.life[i] <= 0) continue; this.life[i] -= dt; const k = i * 3; const x0 = p[k], y0 = p[k + 1], z0 = p[k + 2];
      v[k + 1] -= 9.81 * dt; const dr = 1 - 0.12 * dt; v[k] *= dr; v[k + 1] *= dr; v[k + 2] *= dr; p[k] += v[k] * dt; p[k + 1] += v[k + 1] * dt; p[k + 2] += v[k + 2] * dt;
      if (onStep(i, x0, y0, z0, p[k], p[k + 1], p[k + 2])) { this.life[i] = 0; continue; }
      if (this.life[i] <= 0) continue; const tl = 0.03;
      A[n * 3] = p[k] - v[k] * tl; A[n * 3 + 1] = p[k + 1] - v[k + 1] * tl; A[n * 3 + 2] = p[k + 2] - v[k + 2] * tl; B[n * 3] = p[k]; B[n * 3 + 1] = p[k + 1]; B[n * 3 + 2] = p[k + 2]; n++; }
    this.mesh.geometry.instanceCount = n; this.aA.needsUpdate = true; this.aB.needsUpdate = true;
  }
}

// ---------- light glows (nav lights, engine flames, flares, runway / town lights): one additive draw call, rebuilt per frame ----------
const MAXG = 3000;
export class Glows {
  constructor(scene) {
    const g = new THREE.InstancedBufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute([-1, -1, 0, 1, -1, 0, 1, 1, 0, -1, 1, 0], 3)); g.setIndex([0, 1, 2, 0, 2, 3]);
    this.aP = new THREE.InstancedBufferAttribute(new Float32Array(MAXG * 4), 4); this.aC = new THREE.InstancedBufferAttribute(new Float32Array(MAXG * 3), 3); this.aP.setUsage(THREE.DynamicDrawUsage); this.aC.setUsage(THREE.DynamicDrawUsage);
    g.setAttribute('iP', this.aP); g.setAttribute('iC', this.aC); this.n = 0; this.staticN = 0;
    this.mesh = new THREE.Mesh(g, new THREE.ShaderMaterial({ transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, fog: false,
      vertexShader: /* glsl */`attribute vec4 iP; attribute vec3 iC; varying vec2 vUv; varying vec3 vC;
        void main(){ vec4 mv = viewMatrix * vec4(iP.xyz, 1.0); float s = max(iP.w, -mv.z * 0.0011); mv.xy += position.xy * s; vUv = position.xy; vC = iC * min(1.0, (iP.w * iP.w) / (s * s) * 6.0 + 0.25) * exp(mv.z / 30000.0); gl_Position = projectionMatrix * mv; }`,
      fragmentShader: /* glsl */`varying vec2 vUv; varying vec3 vC; void main(){ float r = dot(vUv, vUv); if (r > 1.0) discard; float a = pow(1.0 - r, 3.0); gl_FragColor = vec4(vC * a, 1.0);
          #include <tonemapping_fragment>
          #include <colorspace_fragment>
        }` }));
    this.mesh.frustumCulled = false; this.mesh.renderOrder = 10; scene.add(this.mesh);
  }
  begin() { this.n = this.staticN; }
  add(x, y, z, size, r, g, b) { const i = this.n; if (i >= MAXG) return; const P = this.aP.array, C = this.aC.array; P[i * 4] = x; P[i * 4 + 1] = y; P[i * 4 + 2] = z; P[i * 4 + 3] = size; C[i * 3] = r; C[i * 3 + 1] = g; C[i * 3 + 2] = b; this.n++; }
  lockStatic() { this.staticN = this.n; }
  end() { this.mesh.geometry.instanceCount = this.n; this.aP.needsUpdate = true; this.aC.needsUpdate = true; }
}

// ---------- birds: flocks kept near the player, each bird a pair of wings flapped in the vertex shader ----------
export class Birds {
  constructor(scene, world, flocks = 26, per = 18) {
    this.world = world; this.flocks = []; this.per = per; const n = flocks * per;
    const g = new THREE.InstancedBufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute([0, 0, -0.5, 0, 0, 0.45, -1, 0, 0.1, 0, 0, -0.5, 1, 0, 0.1, 0, 0, 0.45], 3)); g.setAttribute('aW', new THREE.Float32BufferAttribute([0, 0, 1, 0, 1, 0], 1));
    this.aF = new THREE.InstancedBufferAttribute(new Float32Array(n * 4), 4); this.aO = new THREE.InstancedBufferAttribute(new Float32Array(n * 4), 4); this.aF.setUsage(THREE.DynamicDrawUsage); g.setAttribute('iF', this.aF); g.setAttribute('iO', this.aO); g.instanceCount = n;
    for (let f = 0; f < flocks; f++) { this.flocks.push({ x: 1e9, y: 0, z: 0, r: 120 + hash(f) * 260, w: (hash(f + 9) < 0.5 ? -1 : 1) * (0.05 + hash(f + 3) * 0.06) });
      for (let b = 0; b < per; b++) { const i = f * per + b, k = f * 31 + b; this.aO.array.set([(hash(k) - 0.5) * 46, (hash(k + 0.3) - 0.5) * 14, (hash(k + 0.6) - 0.5) * 46, hash(k + 0.9) * 6.28], i * 4); } }
    this.mesh = new THREE.Mesh(g, new THREE.ShaderMaterial({ uniforms: { ...atmo }, side: THREE.DoubleSide, fog: false,
      vertexShader: /* glsl */`attribute float aW; attribute vec4 iF, iO; uniform float uTime; varying vec3 vW;
        void main(){ float a = uTime * iF.w * 6.2832 / max(abs(iF.w), 0.001) * abs(iF.w) + iO.w; float R = 140.0 + 60.0 * sin(iO.w * 3.0);
          vec3 c = iF.xyz + vec3(cos(a) * R, sin(uTime * 0.3 + iO.w) * 8.0, sin(a) * R) + iO.xyz; float dirA = a + 1.5708 * sign(iF.w);
          float flap = sin(uTime * (7.0 + iO.w) + iO.w * 5.0); vec3 p = position * 0.9; p.y += aW * flap * 0.55; p.x *= 1.0 - aW * 0.25 * abs(flap);
          float cs = cos(-dirA + 1.5708), sn = sin(-dirA + 1.5708); p.xz = mat2(cs, -sn, sn, cs) * p.xz; vW = c + p; gl_Position = projectionMatrix * viewMatrix * vec4(vW, 1.0); }`,
      fragmentShader: ATMO_GLSL + /* glsl */`varying vec3 vW; void main(){ vec3 col = vec3(0.06, 0.055, 0.05) * (sunLight(0.6) + hemi(vec3(0.0, 1.0, 0.0))) * 3.0; gl_FragColor = vec4(applyFog(col, vW, cameraPosition), 1.0);
          #include <tonemapping_fragment>
          #include <colorspace_fragment>
        }` }));
    this.mesh.frustumCulled = false; scene.add(this.mesh); this.timer = 0; this.seed = 1;
  }
  update(dt, cam, fwd) { this.timer -= dt; if (this.timer > 0) return; this.timer = 1.5; let dirty = false; const F = this.aF.array;
    this.flocks.forEach((f, i) => { if (Math.hypot(f.x - cam.x, f.z - cam.z) < 7000) return; let x, z, h, tries = 0;
      do { const a = Math.atan2(fwd.x, fwd.z) + (hash(this.seed++) - 0.5) * 3.6, d = 1200 + hash(this.seed++) * 4800; x = cam.x + Math.sin(a) * d; z = cam.z + Math.cos(a) * d; h = this.world.heightAt(x, z); } while (h < 1 && ++tries < 6);
      f.x = x; f.z = z; f.y = Math.max(h, 0) + 40 + hash(this.seed++) * 260; for (let b = 0; b < this.per; b++) F.set([f.x, f.y, f.z, f.w], (i * this.per + b) * 4); dirty = true; });
    if (dirty) this.aF.needsUpdate = true; }
}
