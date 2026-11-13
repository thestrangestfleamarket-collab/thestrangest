// World container: batched static geometry, AABB colliders, raycasts, lights and ambient effects.
import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';

// Sun / moon direction shared by every arena so the patched fog shader can add forward-scattering toward it.
export const FOG_SUN = [-0.88, 0.36, 0.3];

const SKY_FRAG = `
uniform vec3 uSun, uSunCol, uZenith, uHorizon, uGround, uCloudCol, uCloudDark; uniform float uStars, uCloud, uTime, uDisc, uDiscI, uNebula;
varying vec3 vDir;
float h21(vec2 p){ p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
float h31(vec3 p){ p = fract(p * vec3(.1031, .1030, .0973)); p += dot(p, p.yzx + 33.33); return fract((p.x + p.y) * p.z); }
float vn(vec2 p){ vec2 i = floor(p), f = fract(p); f = f * f * (3. - 2. * f); return mix(mix(h21(i), h21(i + vec2(1, 0)), f.x), mix(h21(i + vec2(0, 1)), h21(i + vec2(1, 1)), f.x), f.y); }
float fbm(vec2 p){ float a = .5, s = 0.; for (int i = 0; i < 5; i++) { s += a * vn(p); p = p * 2.03 + vec2(17., 9.); a *= .5; } return s; }
void main(){
  vec3 d = normalize(vDir); float h = max(d.y, 0.);
  vec3 col = mix(uHorizon, uZenith, pow(h, .5));
  float sd = max(dot(d, uSun), 0.);
  col += uSunCol * (pow(sd, 5.) * .16 + pow(sd, 40.) * .45) * (1. - .5 * h);
  if (uNebula > 0.) { float n = fbm(d.xy * 2.5 + d.z * 1.7); col += uNebula * vec3(.10, .22, .32) * smoothstep(.45, .8, n) + uNebula * vec3(.25, .08, .1) * smoothstep(.55, .9, fbm(d.zy * 3. + 4.)); }
  if (uStars > 0.) {
    vec3 p = d * 380.; vec3 ip = floor(p); float r = h31(ip);
    float tw = .65 + .35 * sin(uTime * 2.5 + r * 90.);
    col += uStars * step(.9965, r) * smoothstep(.38, .0, length(fract(p) - .5)) * tw * vec3(.9, .95, 1.) * (.3 + 2.2 * fract(r * 77.)) * (uNebula > 0. ? 1. : smoothstep(0., .15, d.y));
  }
  col += uSunCol * uDiscI * smoothstep(uDisc, uDisc + .00025, sd);
  if (uCloud > 0. && d.y > 0.) {
    vec2 uv = d.xz / (d.y + .08) * .55 + uTime * vec2(.006, .003);
    float n = fbm(uv), n2 = fbm(uv + uSun.xz * .12);
    float cov = smoothstep(1. - uCloud, 1. - uCloud + .3, n);
    float lit = clamp((n - n2) * 3. + .5, 0., 1.);
    vec3 cc = mix(uCloudDark, uCloudCol, lit) + uSunCol * pow(sd, 8.) * .3 * (1. - cov * .5);
    col = mix(col, cc, cov * smoothstep(0., .12, d.y));
  }
  if (uNebula <= 0.) col = mix(uGround, col, smoothstep(-.06, .0, d.y));
  gl_FragColor = vec4(col, 1.);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}`;

// Replace three's flat fog with height-attenuated haze (denser near the ground, integrated along the view ray)
// plus forward scattering that brightens the haze when looking toward the sun or moon.
export function installAtmosphere() {
  const C = THREE.ShaderChunk;
  C.fog_pars_vertex = '#ifdef USE_FOG\n varying float vFogDepth; varying vec3 vFogW;\n#endif';
  C.fog_vertex = '#ifdef USE_FOG\n vFogDepth = - mvPosition.z; vFogW = (inverse(viewMatrix) * mvPosition).xyz;\n#endif';
  C.fog_pars_fragment = '#ifdef USE_FOG\n uniform vec3 fogColor; varying float vFogDepth; varying vec3 vFogW;\n #ifdef FOG_EXP2\n uniform float fogDensity;\n #else\n uniform float fogNear; uniform float fogFar;\n #endif\n#endif';
  C.fog_fragment = `#ifdef USE_FOG
  #ifdef FOG_EXP2
    vec3 fogV = vFogW - cameraPosition; float fogL = max(length(fogV), 1e-4);
    float fy0 = cameraPosition.y, fdy = vFogW.y - fy0, fk = 0.085;
    float fInt = abs(fdy) > 0.01 ? (exp(-fk * fy0) - exp(-fk * vFogW.y)) / (fk * fdy) : exp(-fk * fy0);
    float fogFactor = 1.0 - exp(-fogDensity * fogL * fInt);
    float fPh = pow(max(dot(fogV / fogL, normalize(vec3(${FOG_SUN.join(',')}))), 0.0), 6.0);
    gl_FragColor.rgb = mix(gl_FragColor.rgb, fogColor * (1.0 + 2.2 * fPh), fogFactor);
  #else
    gl_FragColor.rgb = mix(gl_FragColor.rgb, fogColor, smoothstep(fogNear, fogFar, vFogDepth));
  #endif
#endif`;
}


// box with UVs in world units so textures tile at a constant density
function boxGeo(w, h, d, tile) {
  const g = new THREE.BoxGeometry(w, h, d).toNonIndexed();
  const uv = g.attributes.uv, dims = [[d, h], [d, h], [w, d], [w, d], [w, h], [w, h]];
  for (let f = 0; f < 6; f++) for (let i = 0; i < 6; i++) {
    const k = f * 6 + i;
    uv.setXY(k, uv.getX(k) * dims[f][0] / tile, uv.getY(k) * dims[f][1] / tile);
  }
  return g;
}

const _m = new THREE.Matrix4(), _q = new THREE.Quaternion(), _e = new THREE.Euler(), _s = new THREE.Vector3(1, 1, 1), _p = new THREE.Vector3();

export class World {
  constructor(scene, mats, quality) {
    this.scene = scene; this.mats = mats; this.q = quality;
    this.group = new THREE.Group(); scene.add(this.group);
    this.batches = new Map(); // material -> geometries[]
    this.farBatches = new Map(); // distant scenery: never casts or receives shadows
    this.colliders = [];      // {min:[3], max:[3], surf}
    this.spawns = [];
    this.updaters = [];
    this.lightCount = 0;
    this.name = ''; this.ambience = 'hum'; this.reverb = 1.2;
    this.bounds = 15;
  }

  // x,z = centre, y = base height
  box(mat, x, y, z, w, h, d, o = {}) {
    const g = boxGeo(w, h, d, o.tile || 2);
    _e.set(o.rx || 0, o.ry || 0, o.rz || 0); _q.setFromEuler(_e);
    _m.compose(_p.set(x, y + h / 2, z), _q, _s);
    g.applyMatrix4(_m);
    this._push(mat, g, Math.abs(x) > 34 || Math.abs(z) > 34 || y > 40);
    if (o.collide !== false) {
      let hw = w / 2, hd = d / 2;
      if (o.ry) { const c = Math.abs(Math.cos(o.ry)), s = Math.abs(Math.sin(o.ry)); hw = (w * c + d * s) / 2; hd = (w * s + d * c) / 2; }
      this.colliders.push({ min: [x - hw, y, z - hd], max: [x + hw, y + h, z + hd], surf: o.surf || 'hard' });
    }
  }
  collider(x, y, z, w, h, d, surf = 'hard') {
    this.colliders.push({ min: [x - w / 2, y, z - d / 2], max: [x + w / 2, y + h, z + d / 2], surf });
  }
  // arbitrary geometry (cylinders etc.), positioned by centre
  mesh(mat, geo, x, y, z, rx = 0, ry = 0, rz = 0) {
    const g = geo.index ? geo.toNonIndexed() : geo.clone();
    _e.set(rx, ry, rz); _q.setFromEuler(_e);
    g.applyMatrix4(_m.compose(_p.set(x, y, z), _q, _s));
    this._push(mat, g, Math.abs(x) > 34 || Math.abs(z) > 34);
  }
  _push(mat, g, far = false) {
    for (const k of Object.keys(g.attributes)) if (k !== 'position' && k !== 'normal' && k !== 'uv') g.deleteAttribute(k);
    const B = far ? this.farBatches : this.batches;
    if (!B.has(mat)) B.set(mat, []);
    B.get(mat).push(g);
  }

  light(l, shadow = false) {
    if (shadow) {
      l.castShadow = true;
      l.shadow.mapSize.setScalar(l.isDirectionalLight ? this.q.sunShadow : this.q.shadow);
      l.shadow.bias = -0.0004; l.shadow.normalBias = 0.03;
    }
    this.group.add(l); if (l.target) this.group.add(l.target);
    return l;
  }
  onUpdate(fn) { this.updaters.push(fn); }

  // axis 'x': wall runs along X at z=fixed; 'z': runs along Z at x=fixed. Openings {c, w, b, t} are cut for real.
  wall(mat, axis, fixed, a, b, y0, h, t, ops = [], o = {}) {
    const seg = (s0, s1, yy, hh) => { if (s1 - s0 < 0.03 || hh < 0.03) return; const c = (s0 + s1) / 2, len = s1 - s0; if (axis === 'x') this.box(mat, c, yy, fixed, len, hh, t, o); else this.box(mat, fixed, yy, c, t, hh, len, o); };
    let cur = a;
    for (const op of ops.filter((q) => q.c - q.w / 2 >= a && q.c + q.w / 2 <= b).sort((p, q) => p.c - q.c)) {
      const o0 = op.c - op.w / 2, o1 = op.c + op.w / 2;
      seg(cur, o0, y0, h); seg(o0, o1, y0, op.b); seg(o0, o1, y0 + op.t, h - op.t); cur = o1;
    }
    seg(cur, b, y0, h);
  }

  // analytic atmosphere: gradient scattering, sun/moon disc + glow, procedural stars, drifting lit clouds.
  // The same shader is rendered into a PMREM so reflections and ambient light come from the real sky.
  sky(o) {
    const C = (c) => new THREE.Color(c[0], c[1], c[2]);
    const sun = new THREE.Vector3(...(o.sun || FOG_SUN)).normalize();
    const mat = new THREE.ShaderMaterial({
      side: THREE.BackSide, depthWrite: false, fog: false,
      uniforms: { uSun: { value: sun }, uSunCol: { value: C(o.sunCol) }, uZenith: { value: C(o.zenith) }, uHorizon: { value: C(o.horizon) }, uGround: { value: C(o.ground) }, uCloudCol: { value: C(o.cloudCol || [0, 0, 0]) }, uCloudDark: { value: C(o.cloudDark || [0, 0, 0]) }, uStars: { value: o.stars || 0 }, uCloud: { value: o.clouds || 0 }, uTime: { value: 0 }, uDisc: { value: o.disc || 0.9997 }, uDiscI: { value: o.discI || 0 }, uNebula: { value: o.nebula || 0 } },
      vertexShader: 'varying vec3 vDir; void main(){ vDir = position; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
      fragmentShader: SKY_FRAG,
    });
    const m = new THREE.Mesh(new THREE.SphereGeometry(5000, 32, 16), mat); m.frustumCulled = false; m.renderOrder = -10; this.group.add(m);
    this.onUpdate((dt, t, cam) => { mat.uniforms.uTime.value = t; m.position.copy(cam); });
    const envScene = new THREE.Scene(); envScene.add(new THREE.Mesh(new THREE.SphereGeometry(50, 32, 16), mat));
    const pm = new THREE.PMREMGenerator(this.mats.renderer); this.envRT = pm.fromScene(envScene, 0.02, 0.1, 100); pm.dispose();
    this.scene.environment = this.envRT.texture; this.scene.environmentIntensity = o.env === undefined ? 1 : o.env;
    this.scene.fog = new THREE.FogExp2(o.fog, o.density); this.scene.background = null;
    this.sun = sun;
  }

  finish() {
    for (const B of [this.batches, this.farBatches]) {
      for (const [mat, geos] of B) {
        const g = mergeGeometries(geos, false);
        geos.forEach((x) => x.dispose());
        const m = new THREE.Mesh(g, mat);
        const lit = !mat.isMeshBasicMaterial && B === this.batches;
        m.castShadow = lit && !mat.transparent; m.receiveShadow = lit;
        m.matrixAutoUpdate = false;
        this.group.add(m);
      }
      B.clear();
    }
  }

  update(dt, t, camPos) { for (const f of this.updaters) f(dt, t, camPos); }

  dispose() {
    this.scene.remove(this.group);
    this.group.traverse((o) => {
      if (o.geometry) o.geometry.dispose();
      if (o.isLight && o.shadow && o.shadow.map) o.shadow.map.dispose();
    });
    if (this.envRT) this.envRT.dispose();
    this.scene.environment = null;
  }

  // ray vs colliders + floor. o,d: Vector3 (d normalised). Returns {t, nx,ny,nz, surf} or null
  raycast(o, d, maxT = 200) {
    let best = maxT, bn = null, surf = 'hard';
    const O = [o.x, o.y, o.z], D = [d.x, d.y, d.z];
    if (d.y < -1e-6) { const t = -o.y / d.y; if (t > 0 && t < best) { best = t; bn = [0, 1, 0]; surf = 'floor'; } }
    for (const c of this.colliders) {
      let t0 = 0, t1 = best, ax = -1, sg = 0, ok = true;
      for (let a = 0; a < 3; a++) {
        if (Math.abs(D[a]) < 1e-9) { if (O[a] < c.min[a] || O[a] > c.max[a]) { ok = false; break; } continue; }
        const inv = 1 / D[a];
        let ta = (c.min[a] - O[a]) * inv, tb = (c.max[a] - O[a]) * inv, s = -1;
        if (ta > tb) { const tmp = ta; ta = tb; tb = tmp; s = 1; }
        if (ta > t0) { t0 = ta; ax = a; sg = s; }
        if (tb < t1) t1 = tb;
        if (t0 > t1) { ok = false; break; }
      }
      if (ok && ax >= 0 && t0 < best) { best = t0; bn = [0, 0, 0]; bn[ax] = sg; surf = c.surf; }
    }
    return bn ? { t: best, nx: bn[0], ny: bn[1], nz: bn[2], surf } : null;
  }

  blocked(a, b) { // line of sight between two points
    _p.subVectors(b, a); const len = _p.length(); if (len < 1e-4) return false;
    _p.multiplyScalar(1 / len);
    const h = this.raycast(a, _p, len); return !!h && h.t < len - 0.02;
  }

  // push a vertical cylinder (pos.x/z, radius r, y span) out of colliders
  resolveCircle(pos, r, y0, y1) {
    for (let pass = 0; pass < 3; pass++) {
      for (const c of this.colliders) {
        if (c.max[1] <= y0 || c.min[1] >= y1) continue;
        const cx = Math.max(c.min[0], Math.min(pos.x, c.max[0])), cz = Math.max(c.min[2], Math.min(pos.z, c.max[2]));
        let dx = pos.x - cx, dz = pos.z - cz; const d2 = dx * dx + dz * dz;
        if (d2 >= r * r) continue;
        if (d2 > 1e-10) { const dd = Math.sqrt(d2), k = (r - dd) / dd; pos.x += dx * k; pos.z += dz * k; }
        else {
          const l = pos.x - c.min[0], rr = c.max[0] - pos.x, n = pos.z - c.min[2], f = c.max[2] - pos.z, m = Math.min(l, rr, n, f);
          if (m === l) pos.x = c.min[0] - r; else if (m === rr) pos.x = c.max[0] + r; else if (m === n) pos.z = c.min[2] - r; else pos.z = c.max[2] + r;
        }
      }
    }
    const b = this.bounds - r;
    pos.x = Math.max(-b, Math.min(b, pos.x)); pos.z = Math.max(-b, Math.min(b, pos.z));
  }
}

// ---------- shared ambient effect helpers ----------
export function lightCone(world, x, y, z, radius, height, color, opacity = 0.06) {
  const g = new THREE.ConeGeometry(radius, height, 24, 1, true);
  g.translate(0, -height / 2, 0);
  const col = g.attributes.position.count, c = new Float32Array(col * 3), cc = new THREE.Color(color);
  for (let i = 0; i < col; i++) { const k = 1 + g.attributes.position.getY(i) / height; c[i * 3] = cc.r * k; c[i * 3 + 1] = cc.g * k; c[i * 3 + 2] = cc.b * k; }
  g.setAttribute('color', new THREE.BufferAttribute(c, 3));
  const m = new THREE.Mesh(g, new THREE.MeshBasicMaterial({ vertexColors: true, transparent: true, opacity, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide, fog: false }));
  m.position.set(x, y, z); world.group.add(m); return m;
}

// drifting particles that wrap around the camera (dust, rain, embers)
export function particles(world, { count, box, size, color, opacity, vel, jitter = 0, streak = 0, additive = true }) {
  let obj;
  const pos = new Float32Array(count * 3 * (streak ? 2 : 1));
  const base = new Float32Array(count * 3), ph = new Float32Array(count);
  for (let i = 0; i < count; i++) { base[i * 3] = Math.random() * box[0]; base[i * 3 + 1] = Math.random() * box[1]; base[i * 3 + 2] = Math.random() * box[2]; ph[i] = Math.random() * 6.28; }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const common = { color, transparent: true, opacity, depthWrite: false, blending: additive ? THREE.AdditiveBlending : THREE.NormalBlending };
  if (streak) obj = new THREE.LineSegments(g, new THREE.LineBasicMaterial(common));
  else obj = new THREE.Points(g, new THREE.PointsMaterial({ ...common, size, sizeAttenuation: true }));
  obj.frustumCulled = false; world.group.add(obj);
  const wrap = (v, c, s) => ((((v - c) % s) + s * 1.5) % s) - s / 2 + c;
  world.onUpdate((dt, t, cam) => {
    for (let i = 0; i < count; i++) {
      const j = i * 3;
      base[j] += vel[0] * dt; base[j + 1] += vel[1] * dt; base[j + 2] += vel[2] * dt;
      const x = wrap(base[j] + Math.sin(t * 0.7 + ph[i]) * jitter, cam.x, box[0]);
      let y = ((base[j + 1] % box[1]) + box[1]) % box[1];
      const z = wrap(base[j + 2] + Math.cos(t * 0.6 + ph[i]) * jitter, cam.z, box[2]);
      if (streak) { const k = i * 6; pos[k] = x; pos[k + 1] = y; pos[k + 2] = z; pos[k + 3] = x + vel[0] * streak; pos[k + 4] = y + vel[1] * streak; pos[k + 5] = z + vel[2] * streak; }
      else { pos[j] = x; pos[j + 1] = y; pos[j + 2] = z; }
    }
    g.attributes.position.needsUpdate = true;
  });
  return obj;
}
