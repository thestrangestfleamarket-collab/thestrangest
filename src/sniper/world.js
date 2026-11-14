// COLD BORE's places, built in the page: the sky and light, the kit that merges boxes into a few meshes, the range, the city, the harbour
import * as THREE from 'three';
import { computeBoundsTree, acceleratedRaycast } from 'three-mesh-bvh';
import { A, surface } from './assets.js';
import { SunLight } from 'three/addons/lights/SunLight.js';
THREE.BufferGeometry.prototype.computeBoundsTree = computeBoundsTree; THREE.Mesh.prototype.raycast = acceleratedRaycast;

export const rng = (s) => () => { s |= 0; s = s + 0x6D2B79F5 | 0; let t = Math.imul(s ^ s >>> 15, 1 | s); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
const hash = (x, y) => { const s = Math.sin(x * 127.1 + y * 311.7) * 43758.5453; return s - Math.floor(s); };
export function noise(x, y) { const xi = Math.floor(x), yi = Math.floor(y), xf = x - xi, yf = y - yi, u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf);
  return (hash(xi, yi) * (1 - u) + hash(xi + 1, yi) * u) * (1 - v) + (hash(xi, yi + 1) * (1 - u) + hash(xi + 1, yi + 1) * u) * v; }
export const fbm = (x, y) => noise(x, y) * 0.5 + noise(x * 2.1, y * 2.1) * 0.25 + noise(x * 4.3, y * 4.3) * 0.125 + noise(x * 8.7, y * 8.7) * 0.0625;

export function canvasTex(w, h, draw, rep = true) { const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; if (rep) t.wrapS = t.wrapT = THREE.RepeatWrapping; return t; }

const FACES = [[[1, 0, 0], [0, 0, -1], [0, 1, 0]], [[-1, 0, 0], [0, 0, 1], [0, 1, 0]], [[0, 1, 0], [1, 0, 0], [0, 0, -1]], [[0, -1, 0], [1, 0, 0], [0, 0, 1]], [[0, 0, 1], [1, 0, 0], [0, 1, 0]], [[0, 0, -1], [-1, 0, 0], [0, 1, 0]]];
const _m = new THREE.Matrix4(), _v = new THREE.Vector3(), _n = new THREE.Vector3(), _q = new THREE.Quaternion(), _s = new THREE.Vector3(), _e = new THREE.Euler();
export const M4 = (x, y, z, rx = 0, ry = 0, rz = 0, sx = 1, sy = sx, sz = sx) => new THREE.Matrix4().compose(new THREE.Vector3(x, y, z), new THREE.Quaternion().setFromEuler(new THREE.Euler(rx, ry, rz, 'YXZ')), new THREE.Vector3(sx, sy, sz));

// boxes and shapes gathered by material, each material one mesh at the end
const TEXD = new Set(['rock', 'concrete', 'asphalt', 'pave', 'roof', 'wood', 'sand', 'brickw', 'plaster', 'cont', 'iron', 'ground', 'paintc']);
export class Kit {
  constructor() { this.p = new Map(); }
  tint(mat, c) { if (mat !== 'glow') c = [Math.pow(c[0], 2.2), Math.pow(c[1], 2.2), Math.pow(c[2], 2.2)]; if (!TEXD.has(mat)) return c; const m = Math.max(c[0], c[1], c[2], 0.01), k = 0.3; return [(c[0] / m * (1 - k) + c[0] * k) * 0.96, (c[1] / m * (1 - k) + c[1] * k) * 0.96, (c[2] / m * (1 - k) + c[2] * k) * 0.96]; }
  part(mat) { let a = this.p.get(mat); if (!a) this.p.set(mat, a = { pos: [], nor: [], uv: [], col: [], idx: [] }); return a; }
  box(mat, x, y, z, w, h, d, o = {}) {
    const hs = [w / 2, h / 2, d / 2], c = o.color || [1, 1, 1], tile = o.tile || 3, ry = o.ry || 0, cs = Math.cos(ry), sn = Math.sin(ry);
    FACES.forEach(([n, u, v], fi) => {
      if (o.skip && o.skip.includes(fi)) return;
      const fm = (fi === 2 || fi === 3) && o.cap ? o.cap : mat, a = this.part(fm), cc = this.tint(fm, (fi === 2 || fi === 3) && o.capColor ? o.capColor : c), base = a.pos.length / 3;
      const ax = (q) => Math.abs(q[0]) * hs[0] + Math.abs(q[1]) * hs[1] + Math.abs(q[2]) * hs[2], hn = ax(n), hu = ax(u), hv = ax(v);
      for (const [su, sv] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) {
        const lx = n[0] * hn + u[0] * hu * su + v[0] * hv * sv, ly = n[1] * hn + u[1] * hu * su + v[1] * hv * sv, lz = n[2] * hn + u[2] * hu * su + v[2] * hv * sv;
        a.pos.push(x + lx * cs + lz * sn, y + ly, z - lx * sn + lz * cs); a.nor.push(n[0] * cs + n[2] * sn, n[1], -n[0] * sn + n[2] * cs);
        a.uv.push((su + 1) * hu / tile, (sv + 1) * hv / tile); a.col.push(cc[0], cc[1], cc[2]);
      }
      a.idx.push(base, base + 1, base + 2, base, base + 2, base + 3);
    });
  }
  geo(mat, g, m, c = [1, 1, 1], us = 1) {
    c = this.tint(mat, c); const a = this.part(mat), base = a.pos.length / 3, P = g.attributes.position, N = g.attributes.normal, U = g.attributes.uv, nm = new THREE.Matrix3().getNormalMatrix(m);
    for (let i = 0; i < P.count; i++) { _v.fromBufferAttribute(P, i).applyMatrix4(m); a.pos.push(_v.x, _v.y, _v.z); _n.fromBufferAttribute(N, i).applyMatrix3(nm).normalize(); a.nor.push(_n.x, _n.y, _n.z);
      a.uv.push(U ? U.getX(i) * us : 0, U ? U.getY(i) * us : 0); a.col.push(c[0], c[1], c[2]); }
    if (g.index) for (let i = 0; i < g.index.count; i++) a.idx.push(base + g.index.getX(i)); else for (let i = 0; i < P.count; i++) a.idx.push(base + i);
    g.dispose();
  }
  cyl(mat, x, y, z, r, h, c, o = {}) { this.geo(mat, new THREE.CylinderGeometry(o.top ?? r, r, h, o.seg || 10, 1, !!o.open), M4(x, y, z, o.rx || 0, o.ry || 0, o.rz || 0), c); }
  bag(mat, x, y, z, r, c, sy, sx, sz, us) { this.geo(mat, new THREE.SphereGeometry(r, 18, 12), M4(x, y, z, 0, 0, Math.PI / 2, sy, sx, sz), c, us); }
  ball(mat, x, y, z, r, c, sy = 1, sx = 1, sz = 1, us = 1, det = 1) { this.geo(mat, new THREE.IcosahedronGeometry(r, det), M4(x, y, z, 0, 0, 0, sx, sy, sz), c, us); }
  build(mats, group, solids, opts = {}) {
    const out = [];
    for (const [k, a] of this.p) {
      if (!a.pos.length) continue;
      const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(a.pos, 3)); g.setAttribute('normal', new THREE.Float32BufferAttribute(a.nor, 3));
      g.setAttribute('uv', new THREE.Float32BufferAttribute(a.uv, 2)); g.setAttribute('color', new THREE.Float32BufferAttribute(a.col, 3)); g.setIndex(a.idx);
      const m = new THREE.Mesh(g, mats[k]); m.userData.surf = k; m.castShadow = opts.cast !== false && k !== 'glass' && k !== 'water' && k !== 'glow'; m.receiveShadow = true; m.matrixAutoUpdate = false;
      if (group) group.add(m); if (solids && k !== 'glass' && k !== 'water' && k !== 'glow') { g.computeBoundsTree(); solids.push(m); } out.push(m);
    }
    return out;
  }
}

// a building's wall: every window a real recess with its reveals and their shadow, a frame, glass that mirrors the sky, and a room behind it with depth
const FAC_V = `#include <fog_pars_vertex>
varying vec2 vUv; varying vec3 vW; varying vec3 vN; varying vec3 vT; varying vec3 vC;
void main(){ vUv = uv; vC = color; vec4 w = modelMatrix * vec4(position, 1.); vW = w.xyz; vN = normalize(mat3(modelMatrix) * normal); vT = normalize(cross(vec3(0., 1., 0.), vN)); vec4 mvPosition = viewMatrix * w; gl_Position = projectionMatrix * mvPosition;
  #include <fog_vertex>
}`;
const FAC_F = `#include <fog_pars_fragment>
uniform sampler2D wallD, wallN, sky; uniform vec3 sunDir, sunCol, ambSky, ambGnd, frameCol, wallTint; uniform float skyRot, lit, texS; uniform vec2 cell; uniform vec4 win;
varying vec2 vUv; varying vec3 vW; varying vec3 vN; varying vec3 vT; varying vec3 vC;
float h1(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
vec3 skyAt(vec3 d){ float c = cos(skyRot), s = sin(skyRot); d = vec3(d.x * c - d.z * s, d.y, d.x * s + d.z * c); return textureLod(sky, vec2(atan(d.z, d.x) * .15915494 + .5, asin(clamp(d.y, -1., 1.)) * .31830989 + .5), 0.).rgb; }
void main(){
  vec3 N = normalize(vN), T = normalize(vT), B = vec3(0., 1., 0.), Vw = normalize(vW - cameraPosition);
  vec3 V = vec3(dot(Vw, T), dot(Vw, B), max(1e-3, -dot(Vw, N))), L = vec3(dot(sunDir, T), dot(sunDir, B), -dot(sunDir, N));
  vec2 id = floor(vUv / cell) + floor(vC.rg * 61.) * 7., f = (fract(vUv / cell) - .5) * cell; f.y -= win.z; vec2 hw = win.xy; float d = win.w, seed = h1(id);
  vec3 tn = texture2D(wallN, vUv / texS).xyz * 2. - 1., alb = texture2D(wallD, vUv / texS).rgb * wallTint * vC, n = normalize(T * tn.x + B * tn.y + N * tn.z); float sh = 1., glass = 0.; vec3 col = vec3(0.), alb0 = alb;
  float band = fract(vUv.y / cell.y) * cell.y; alb *= band < .2 ? .78 : 1.; vec2 e0 = abs(f) - hw; alb *= .8 + .2 * smoothstep(0., .18, max(e0.x, e0.y));
  if (abs(f.x) < hw.x && abs(f.y) < hw.y) {
    vec2 q = f + V.xy / V.z * d;
    if (abs(q.x) < hw.x && abs(q.y) < hw.y) {
      sh = 0.; if (L.z < 0.) { vec2 o = q + L.xy / (-L.z) * d; sh = abs(o.x) < hw.x && abs(o.y) < hw.y ? 1. : 0.; }
      vec2 e = hw - abs(q); float fw = .055, fr = step(min(e.x, e.y), fw) + step(abs(q.x), fw * .45) * step(1.2, hw.x) + step(abs(q.y - hw.y * .35), fw * .4) * step(hw.x, 1.19);
      if (fr > 0.) { alb = frameCol; n = N; }
      else {
        glass = 1.; vec2 rh = cell * .5 - vec2(.1, .14); vec3 ro = vec3(q.x, q.y + win.z, 0.); float D = 4. + seed * 2.5;
        vec3 tr = (vec3(sign(V.xy) * rh, D) - ro) / vec3(V.xy + sign(V.xy) * 1e-4 + 1e-5, V.z); float t = min(tr.x, min(tr.y, tr.z)); vec3 h = ro + V * t, rn;
        vec3 wc = mix(vec3(.74, .7, .62), vec3(.52, .6, .66), h1(id + 3.)) * (.75 + .5 * h1(id + 5.)), rc;
        if (t == tr.z) { rc = wc; rn = vec3(0., 0., -1.); float dx = (h1(id + 9.) - .5) * rh.x; if (abs(h.x - dx) < .45 && h.y < -rh.y + 2.05) rc = vec3(.3, .2, .13) * (abs(h.x - dx) > .4 ? .6 : 1.); vec2 pf = abs(h.xy - vec2(-dx * .8, .35)) - vec2(.38, .28); if (max(pf.x, pf.y) < 0.) rc = max(pf.x, pf.y) > -.04 ? vec3(.1) : .5 + .4 * cos(6.28 * (seed + vec3(0., .33, .67))); }
        else if (t == tr.y) { rn = vec3(0., -sign(V.y), 0.); rc = V.y < 0. ? mix(vec3(.4, .27, .16), vec3(.3, .3, .32), step(.5, h1(id + 2.))) * (.85 + .15 * step(.06, fract(h.x * 2.2))) : vec3(.82); if (V.y > 0. && length(h.xz - vec2(0., D * .5)) < .32) rc = vec3(1.) + lit * 3.; }
        else { rn = vec3(-sign(V.x), 0., 0.); rc = wc * .9; if (fract(h.y * 1.6 + seed) < .08 && h.z > D * .35) rc *= .5; }
        vec3 bc = vec3((h1(id + 4.) - .5) * rh.x, -rh.y + .42, D * .55), bh = vec3(.95, .42, .5), t1 = (bc - bh - ro) / V, t2 = (bc + bh - ro) / V, tmn = min(t1, t2), tmx = max(t1, t2); float tn2 = max(tmn.x, max(tmn.y, tmn.z)), tf = min(tmx.x, min(tmx.y, tmx.z));
        if (tn2 < tf && tn2 > 0. && tn2 < t) { t = tn2; h = ro + V * t; rc = (.25 + .5 * cos(6.28 * (h1(id + 6.) + vec3(0., .2, .45))) * .6 + .2) * (tn2 == tmn.y ? 1.1 : .8); rn = vec3(0., 0., -1.); }
        float on = step(h1(id + 7.), lit * .55), fall = exp(-h.z * .3), sunIn = 0.;
        if (L.z < 0.) { vec2 o = h.xy - vec2(0., win.z) + L.xy / (-L.z) * (h.z + d); sunIn = (abs(o.x) < hw.x && abs(o.y) < hw.y ? 1. : 0.) * max(0., dot(rn, L)); }
        vec3 inside = rc * (ambSky * (.07 + .3 * fall) + sunCol * sunIn + on * vec3(1., .74, .46) * (1.1 + .9 * fall));
        float bl = h1(id + 11.);
        if (bl < .34) { float cov = (.25 + h1(id + 13.) * .75) * 2. * hw.y; if (q.y > hw.y - cov) inside = mix(inside, vec3(.5, .49, .44) * (.8 + .2 * step(.5, fract(q.y * 14.))) * (ambSky * 1.1 + sunCol * sh * max(0., -L.z) + on * vec3(.9, .65, .4)), .93); }
        else if (bl < .56) { float cw = hw.x * (.5 + .35 * h1(id + 5.)); if (abs(q.x) > cw) inside = mix(inside, (.3 + .22 * cos(6.28 * (h1(id + 15.) + vec3(0., .15, .3)))) * (.75 + .25 * sin(q.x * 46.)) * (ambSky * 1.1 + sunCol * sh * max(0., -L.z) + on * vec3(.9, .65, .4)), .95); }
        vec3 R = reflect(Vw, N), refl = skyAt(R); if (R.y < 0.) refl = mix(refl, ambGnd * .7, clamp(-R.y * 5., 0., 1.)); float F = .05 + .95 * pow(1. - max(dot(-Vw, N), 0.), 5.);
        col = inside * (1. - F) * vec3(.8, .88, .86) + refl * F * 1.05 + sunCol * sh * .02;
      }
    } else { vec2 tt = (sign(V.xy) * hw - f) / (V.xy + sign(V.xy) * 1e-4 + 1e-5); vec3 rn = tt.x < tt.y ? vec3(-sign(V.x), 0., 0.) : vec3(0., -sign(V.y), 0.); n = normalize(T * rn.x + B * rn.y); alb *= .9; float z = min(tt.x, tt.y) * V.z; sh = L.z < 0. ? step(z * 1.2, d * max(0., dot(rn, L)) / max(1e-3, -L.z) * 2.) : 0.; }
  }
  if (glass < .5) col = alb * (sunCol * max(dot(n, sunDir), 0.) * sh + mix(ambGnd, ambSky, n.y * .5 + .5));
  float far = smoothstep(.3, 1.3, length(fwidth(vUv))); if (far > 0.) { float wf = 4. * hw.x * hw.y / (cell.x * cell.y); vec3 rf = skyAt(reflect(Vw, N)); col = mix(col, alb0 * (sunCol * max(dot(N, sunDir), 0.) + mix(ambGnd, ambSky, .5)) * (1. - wf) + (rf * .3 + ambSky * .12) * wf, far); }
  gl_FragColor = vec4(col, 1.);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
  #include <fog_fragment>
}`;

// where each hour's sun should stand (degrees round from the firing line, 0 ahead, 90 right), its strength, the haze, the lit windows
export const ENV = {
  noon: { az: 128, sunCol: 0xfff0d8, sunI: 5.2, env: 0.62, haze: 0.00042, exp: 0.78, lit: 0 },
  day: { az: 232, sunCol: 0xffeed2, sunI: 5.0, env: 0.62, haze: 0.00058, exp: 0.78, lit: 0.04 },
  dusk: { az: 285, sunCol: 0xff8f4a, sunI: 3.6, env: 0.7, haze: 0.00085, exp: 1.0, lit: 1 },
  rain: { az: 200, sunCol: 0xd6dde2, sunI: 0.6, env: 0.95, haze: 0.0024, exp: 0.85, lit: 0.6, rain: true },
  dawn: { az: 62, sunCol: 0xffb070, sunI: 3.8, env: 0.7, haze: 0.0011, exp: 1.0, lit: 0.45 },
};

export class World {
  constructor(game) {
    this.g = game; const sc = game.scene; this.group = null; this.solids = []; this.flags = []; this.spin = []; this.time = 0;
    
    // the sun: three's cascaded light, its two shadow maps fitted each time to the camera that is drawing (sharp by you, sharp in the scope's far view)
    this.sun = new SunLight(); this.sun.castShadow = true; this.sun.shadow.mapSize.setScalar(game.q.shadow); this.sun.shadow.camera.far = 1400; this.sun.shadow.bias = -0.0005; this.sun.shadow.normalBias = 0.06; sc.add(this.sun);
    sc.fog = new THREE.FogExp2(0xffffff, 0.0006);
    const std = (o) => new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.9, metalness: 0, ...o });
    const wn = canvasTex(256, 256, (g, W, H) => { const im = g.createImageData(W, H), hgt = (x, y) => fbm(x / 18 + 3, y / 18) + fbm(x / 6, y / 6 + 9) * 0.4; for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) { const i = (y * W + x) * 4, dx = (hgt((x + 1) % W, y) - hgt(x, y)) * 6, dy = (hgt(x, (y + 1) % H) - hgt(x, y)) * 6; im.data[i] = 128 + dx * 127; im.data[i + 1] = 128 + dy * 127; im.data[i + 2] = 255; im.data[i + 3] = 255; } g.putImageData(im, 0, 0); }); wn.colorSpace = THREE.NoColorSpace; this.waterN = wn;
    this.mats = { concrete: surface('concrete_floor_02'), asphalt: surface('asphalt_02'), pave: surface('rectangular_paving'), roof: surface('asphalt_02'), wood: surface('wood_floor_deck'), sand: surface('hessian_230'), brickw: surface('brick_wall_001'), plaster: surface('grey_plaster_02'),
      rock: surface('aerial_rocks_02'), cont: surface('container_side', { props: { metalness: 0.35 } }), iron: surface('corrugated_iron', { props: { metalness: 0.4 } }), ground: surface('aerial_grass_rock'), paintc: surface('painted_concrete'),
      metal: std({ roughness: 0.42, metalness: 0.75 }), paint: std({ roughness: 0.38, metalness: 0.1 }), leaf: std({ roughness: 0.95 }),
      glass: new THREE.MeshStandardMaterial({ color: 0xa8c8d8, roughness: 0.04, metalness: 0.9, transparent: true, opacity: 0.38, depthWrite: false }),
      water: new THREE.MeshStandardMaterial({ color: 0x1c3a44, roughness: 0.06, metalness: 0.2, normalMap: wn, normalScale: new THREE.Vector2(0.55, 0.55) }), glow: new THREE.MeshBasicMaterial({ vertexColors: true, fog: false }) };
    wn.repeat.set(1, 1);
    const U = this.facU = { sky: { value: null }, sunDir: { value: new THREE.Vector3() }, sunCol: { value: new THREE.Color() }, ambSky: { value: new THREE.Color() }, ambGnd: { value: new THREE.Color() }, skyRot: { value: 0 }, lit: { value: 0 } };
    const fac = (wall, tint, frame, cell, win) => new THREE.ShaderMaterial({ vertexShader: FAC_V, fragmentShader: FAC_F, vertexColors: true, fog: true, uniforms: { ...THREE.UniformsLib.fog, ...U, wallD: { value: A.tex[wall].d }, wallN: { value: A.tex[wall].n }, wallTint: { value: new THREE.Color(tint) }, frameCol: { value: new THREE.Color(frame) }, texS: { value: 2.6 }, cell: { value: new THREE.Vector2(cell[0], cell[1]) }, win: { value: new THREE.Vector4(win[0], win[1], win[2], win[3]) } } });
    Object.assign(this.mats, { office: fac('painted_concrete', 0x66727c, 0x1c2024, [3.5, 3.5], [1.55, 1.3, 0.12, 0.14]), brick: fac('brick_wall_001', 0xffffff, 0xd9d6cc, [3.5, 3.5], [0.78, 0.98, 0.12, 0.26]), concrete2: fac('grey_plaster_02', 0xd9d2c4, 0x2e3033, [3.5, 3.5], [1.15, 0.9, 0.1, 0.3]) });
    this.figMat = std({ roughness: 0.78 });
    const n = 1400, pos = new Float32Array(n * 6); this.rainMesh = new THREE.LineSegments(new THREE.BufferGeometry().setAttribute('position', new THREE.BufferAttribute(pos, 3)), new THREE.LineBasicMaterial({ color: 0xb8c4cc, transparent: true, opacity: 0.35 }));
    for (let i = 0; i < n; i++) { const x = (Math.random() - 0.5) * 28, y = Math.random() * 14, z = (Math.random() - 0.5) * 28; pos.set([x, y, z, x, y - 0.5, z], i * 6); } this.rainMesh.frustumCulled = false; this.rainMesh.visible = false;
  }
  // the hour: its sky turned so the sun stands where the place wants it, the light and haze taken from that sky
  setEnv(name, tex, yaw) {
    const e = ENV[name], I = A.info[name], sc = this.g.scene, d0 = new THREE.Vector3(Math.cos(I.el) * Math.cos(I.phi), Math.sin(I.el), Math.cos(I.el) * Math.sin(I.phi)), az = e.az * Math.PI / 180 - yaw;
    const want = new THREE.Vector3(Math.sin(az) * Math.cos(I.el), Math.sin(I.el), -Math.cos(az) * Math.cos(I.el)), rot = Math.atan2(want.x, want.z) - Math.atan2(d0.x, d0.z);
    sc.background = tex.bg; sc.environment = tex.env; sc.backgroundRotation.set(0, rot, 0); sc.environmentRotation.set(0, rot, 0); sc.environmentIntensity = e.env; sc.backgroundIntensity = 1;
    this.sun.color.set(e.sunCol); this.sun.intensity = e.sunI; this.sunDir = want; const hor = new THREE.Color().setRGB(I.hor[0], I.hor[1], I.hor[2], THREE.SRGBColorSpace), top = new THREE.Color().setRGB(I.top[0], I.top[1], I.top[2], THREE.SRGBColorSpace);
    sc.fog.color.copy(hor).lerp(top, 0.2); sc.fog.density = e.haze; this.sun.position.copy(want); this.sun.updateMatrixWorld(); this.g.renderer.toneMappingExposure = e.exp;
    const U = this.facU; U.sky.value = tex.env; U.skyRot.value = rot; U.sunDir.value.copy(want); U.sunCol.value.copy(this.sun.color).multiplyScalar(e.sunI / Math.PI); U.ambSky.value.copy(top).lerp(hor, 0.5).multiplyScalar(0.5 * e.env); U.ambGnd.value.copy(hor).multiplyScalar(0.16 * e.env); U.lit.value = e.lit;
    this.rainMesh.visible = !!e.rain; this.env = e; this.dusk = e.lit > 0.4;
  }
  clear() {
    if (this.group) { this.g.scene.remove(this.group); this.group.traverse(o => { if (o.geometry && !o.userData.shared) { if (o.geometry.disposeBoundsTree) o.geometry.disposeBoundsTree(); o.geometry.dispose(); } if (o.material && o.userData.own) { if (o.material.map) o.material.map.dispose(); o.material.dispose(); } }); }
    this.group = new THREE.Group(); this.g.scene.add(this.group); this.solids = []; this.flags = []; this.spin = []; this.group.add(this.rainMesh);
  }
  build(site, env, seed, tex, yawOf) { this.clear(); this.pendingEnv = [env, tex]; this.env = ENV[env]; this.dusk = this.env.lit > 0.4; this.site = SITES[site](this, rng(seed)); this.group.updateMatrixWorld(true); return this.site; }
  // a model from disk set down in the place: scaled, turned, its meshes casting
  prop(name, x, y, z, ry = 0, s = 1) { const o = A.m[name].clone(true); o.position.set(x, y, z); o.rotation.y = ry; o.scale.setScalar(s); o.traverse((m) => { if (m.isMesh) { m.castShadow = true; m.receiveShadow = true; m.userData.shared = true; } }); this.group.add(o); return o; }
  // the ground of open country: grass that turns to rock where it steepens, each seen at two sizes so no pattern repeats, big patches of tone over it
  terrain() {
    const m = surface('aerial_grass_rock'), rock = A.tex.aerial_rocks_02.d; m.roughness = 1;
    m.onBeforeCompile = (sh) => { sh.uniforms.rockMap = { value: rock };
      sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nvarying vec3 vWN; varying vec3 vWP;').replace('#include <begin_vertex>', '#include <begin_vertex>\nvWN = normalize(mat3(modelMatrix) * normal); vWP = (modelMatrix * vec4(position, 1.)).xyz;');
      sh.fragmentShader = sh.fragmentShader.replace('#include <common>', '#include <common>\nuniform sampler2D rockMap; varying vec3 vWN; varying vec3 vWP;').replace('#include <map_fragment>', `vec2 u1 = vWP.xz / 4., u2 = vWP.xz / 37.; vec3 gr = texture2D(map, u1).rgb * .55 + texture2D(map, u2).rgb * .45, rk = texture2D(rockMap, u1 * .6).rgb * .55 + texture2D(rockMap, u2 * .8).rgb * .45;
        float big = texture2D(map, vWP.xz / 330.).g, mid = texture2D(rockMap, vWP.xz / 110.).r, sl = 1. - normalize(vWN).y, rm = smoothstep(.16, .36, sl + (mid - .35) * .3);
        diffuseColor.rgb *= mix(gr * vec3(.82, .9, .62), rk * .85, rm) * (.6 + big * 1.1) * (.8 + mid * .5);`);
    }; return m;
  }
  // trees as crossed cards of a photographed tree (baked from Poly Haven's scans): spots = [x, y, z, height]
  trees(kind, spots) {
    const map = A.card[kind]; if (!map || !spots.length) return; const g = new THREE.BufferGeometry(), pos = [], uv = [], nor = [], idx = [];
    for (let q = 0; q < 2; q++) { const c = Math.cos(q * Math.PI / 2 + 0.4), s = Math.sin(q * Math.PI / 2 + 0.4), b = pos.length / 3; for (const [u, v] of [[0, 0], [1, 0], [1, 1], [0, 1]]) { const x = (u - 0.5) * (kind === 'fir' ? 0.57 : 0.95); pos.push(x * c, v, x * s); uv.push(u, v); nor.push(x * c * 0.8, 1, x * s * 0.8); } idx.push(b, b + 1, b + 2, b, b + 2, b + 3); }
    g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2)); g.setAttribute('normal', new THREE.Float32BufferAttribute(nor, 3)); g.setIndex(idx);
    const m = new THREE.MeshStandardMaterial({ map, color: 0xffffff, alphaTest: 0.45, side: THREE.DoubleSide, roughness: 1, envMapIntensity: 1.5 }), inst = new THREE.InstancedMesh(g, m, spots.length); m.userData.own = true;
    inst.customDepthMaterial = new THREE.MeshDepthMaterial({ depthPacking: THREE.RGBADepthPacking, map, alphaTest: 0.45 }); inst.castShadow = true; inst.receiveShadow = false; inst.userData.own = true;
    spots.forEach(([x, y, z, h], i) => inst.setMatrixAt(i, M4(x, y, z, 0, (i * 2.4) % 6.28, 0, h, h, h))); inst.frustumCulled = false; this.group.add(inst);
  }
  // many of one model from disk, drawn together: list = [x, y, z, turn, size]
  scatter(name, list) {
    const src = A.m[name]; if (!src || !list.length) return; src.updateMatrixWorld(true);
    src.traverse((o) => { if (!o.isMesh) return; const im = new THREE.InstancedMesh(o.geometry, o.material, list.length); im.userData.shared = true; im.castShadow = true; im.receiveShadow = true; list.forEach(([x, y, z, ry = 0, sc = 1], i) => im.setMatrixAt(i, M4(x, y, z, 0, ry, 0, sc).multiply(o.matrixWorld))); im.frustumCulled = false; this.group.add(im); });
  }
  // a flag on a pole: how far it lifts and where it points tell the wind
  flag(x, y, z, h = 4, color = 0xe2552e, size = 1) {
    const k = new Kit(); k.cyl('metal', 0, h / 2, 0, 0.035 * size, h, [0.8, 0.8, 0.82], { seg: 6 }); const pole = k.build(this.mats, null, null)[0];
    const g = new THREE.Group(); g.position.set(x, y, z); g.add(pole);
    const geo = new THREE.PlaneGeometry(1.5 * size, 0.9 * size, 6, 1); geo.translate(0.75 * size, 0, 0);
    const f = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ color, side: THREE.DoubleSide, roughness: 0.9 })); f.userData.own = true; const piv = new THREE.Group(); piv.position.y = h - 0.5 * size; piv.add(f); g.add(piv);
    this.group.add(g); this.flags.push({ piv, f, base: geo.attributes.position.array.slice(), ph: Math.random() * 9 }); return g;
  }
  sign(text, x, y, z, w = 1.6, h = 0.8, ry = 0, bg = '#f4f1e4', fg = '#16181a') {
    const t = canvasTex(256, 128, (g) => { g.fillStyle = bg; g.fillRect(0, 0, 256, 128); g.fillStyle = fg; g.font = '900 ' + (text.length > 4 ? 60 : 92) + 'px system-ui, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(text, 128, 68); }, false);
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: t })); m.userData.own = true; m.position.set(x, y, z); m.rotation.y = ry; this.group.add(m); return m;
  }
  update(dt, wind) {
    this.time += dt; this.waterN.offset.set(this.time * 0.012, this.time * 0.02);
    const sp = Math.hypot(wind.x, wind.z), yaw = Math.atan2(-wind.z, wind.x), lift = Math.min(1, sp / 9);
    for (const fl of this.flags) { fl.piv.rotation.y = yaw + Math.sin(this.time * 1.3 + fl.ph) * 0.12; const p = fl.f.geometry.attributes.position, b = fl.base;
      for (let i = 0; i < p.count; i++) { const x = b[i * 3], k = x / 1.5; p.array[i * 3 + 1] = b[i * 3 + 1] - k * k * (1 - lift) * 1.1 + Math.sin(this.time * (5 + sp) - x * 4 + fl.ph) * 0.05 * k * (0.3 + lift); p.array[i * 3 + 2] = Math.sin(this.time * (6 + sp) - x * 5 + fl.ph) * 0.12 * k * (0.2 + lift); p.array[i * 3] = x * (0.55 + 0.45 * lift); }
      p.needsUpdate = true; }
    for (const s of this.spin) s.o.rotation[s.ax] += s.w * dt;
    if (this.rainMesh.visible) { const p = this.rainMesh.geometry.attributes.position, a = p.array, r = this.g.rig.position; this.rainMesh.position.set(r.x, r.y - 2, r.z);
      for (let i = 0; i < a.length; i += 6) { a[i + 1] -= 16 * dt; a[i + 4] -= 16 * dt; a[i] += wind.x * dt; a[i + 3] += wind.x * dt; if (a[i + 4] < 0) { const x = (Math.random() - 0.5) * 28; a[i] = x; a[i + 3] = x + wind.x * 0.03; a[i + 1] = 14; a[i + 4] = 13.5; } } p.needsUpdate = true; }
    if (this.site && this.site.update) this.site.update(dt, this.time);
  }
}

const car = (k, x, y, z, ry, c, van) => { const L = van ? 5.1 : 4.5, H = van ? 0.95 : 0.62, cs = Math.cos(ry), sn = Math.sin(ry), at = (lx, lz) => [x + lx * cs + lz * sn, z - lx * sn + lz * cs], CH = van ? 0.75 : 0.5, cl = van ? L * 0.78 : L * 0.5, co = van ? -0.35 : -0.2;
  const b = (mat, lx, ly, lz, w, h, d, col) => { const [px, pz] = at(lx, lz); k.box(mat, px, y + ly, pz, w, h, d, { ry, color: col }); };
  b('paint', 0, 0.3 + H / 2, 0, 1.82, H, L, c); b('paint', 0, 0.3 + H * 0.45, L / 2 - 0.02, 1.7, H * 0.5, 0.12, [0.05, 0.05, 0.05]); b('paint', 0, 0.3 + H * 0.45, -L / 2 + 0.02, 1.7, H * 0.5, 0.12, [0.05, 0.05, 0.05]);
  b('glass', 0, 0.3 + H + CH / 2, co, 1.6, CH, cl); b('paint', 0, 0.3 + H + CH / 2 - 0.04, co, 1.5, CH - 0.08, cl - 0.2, [0.03, 0.03, 0.035]); b('paint', 0, 0.3 + H + CH + 0.025, co, 1.64, 0.05, cl - 0.25, c);
  for (const sx of [-1, 1]) for (const sz of [-1, 0, 1]) b('paint', sx * 0.8, 0.3 + H + CH / 2, co + sz * (cl / 2 - 0.08), 0.06, CH, 0.07, c);
  for (const sx of [-1, 1]) { b('glow', sx * 0.62, 0.3 + H * 0.7, L / 2 + 0.01, 0.3, 0.12, 0.03, [1.1, 1.05, 0.9]); b('glow', sx * 0.62, 0.3 + H * 0.7, -L / 2 - 0.01, 0.3, 0.1, 0.03, [0.7, 0.05, 0.03]); }
  for (const [sx, sz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) { const [px, pz] = at(sx * 0.86, sz * L * 0.31); k.cyl('paint', px, y + 0.33, pz, 0.33, 0.22, [0.03, 0.03, 0.03], { rz: Math.PI / 2, ry, seg: 14 }); k.cyl('metal', px + sx * 0.06 * cs, y + 0.33, pz - sx * 0.06 * sn, 0.19, 0.12, [0.7, 0.7, 0.72], { rz: Math.PI / 2, ry, seg: 10 }); } };
const tree = (k, x, y, z, s, R) => { if (A.card.leaf) { (k.trees = k.trees || []).push([x, y - 0.1, z, 6.5 * s]); return; } k.cyl('wood', x, y + 1.6 * s, z, 0.16 * s, 3.2 * s, [0.45, 0.36, 0.3], { seg: 6 }); const g = 0.25 + R() * 0.15; k.ball('leaf', x, y + 4.2 * s, z, 2.1 * s, [0.16, g + 0.12, 0.12], 0.9); k.ball('leaf', x + 0.9 * s, y + 3.6 * s, z + 0.5 * s, 1.4 * s, [0.14, g + 0.08, 0.1]); k.ball('leaf', x - 0.8 * s, y + 3.7 * s, z - 0.6 * s, 1.5 * s, [0.18, g + 0.15, 0.12]); };
const lamp = (k, x, y, z, glow, W) => { W.prop('street_lamp_01', x, y, z, 0, 1.35); if (glow) k.ball('glow', x, y + 4.9, z, 0.16, [2.4, 2.0, 1.4]); };
const nestFloor = (k, y, w = 9, d = 7, mat = 'concrete') => k.box(mat, 0, y - 0.15, 0, w, 0.3, d, { color: [0.9, 0.88, 0.85], tile: 2 });

const SITES = {
  // a valley range: steel from 100 m to 1000 m down a flat lane between hills
  range(W, R) {
    const k = new Kit(), G = W.group, ridge = (x, z) => { let a = 0.5, f = 1, t = 0; for (let i = 0; i < 5; i++) { const n = 1 - Math.abs(noise(x * f, z * f) * 2 - 1); t += n * n * a; a *= 0.5; f *= 2.1; } return t; };
    const H = (x, z) => { const wx = x + (fbm(x * 0.002 + 7, z * 0.002) - 0.5) * 260, wz = z + (fbm(x * 0.002, z * 0.002 + 4) - 0.5) * 260, lane = Math.min(1, Math.max(0, (Math.abs(x) - 42) / 230)), l2 = lane * lane * (3 - 2 * lane), far = Math.min(1.6, Math.max(0, (-z - 1120) / 420)), back = Math.max(0, (z - 30) / 120);
      const m = Math.max(l2, far * far * 0.6, Math.min(1, back)); return ridge(wx * 0.0016 + 3, wz * 0.0016 + 9) * 300 * m + fbm(x * 0.012, z * 0.012) * 14 * m + m * 8 + fbm(x * 0.05, z * 0.05) * 0.5 + fbm(x * 0.006 + 2, z * 0.006) * 2.2 * (1 - m); };
    const tg = new THREE.PlaneGeometry(3600, 3600, 300, 300); tg.rotateX(-Math.PI / 2); tg.translate(0, 0, -1000);
    const P = tg.attributes.position, col = new Float32Array(P.count * 3);
    for (let i = 0; i < P.count; i++) { const x = P.getX(i), z = P.getZ(i), h = H(x, z); P.setY(i, h); const dry = fbm(x * 0.004 + 5, z * 0.004), v = 0.85 + fbm(x * 0.03, z * 0.03) * 0.3; col[i * 3] = v * (0.96 + dry * 0.1); col[i * 3 + 1] = v; col[i * 3 + 2] = v * (0.95 - dry * 0.1); }
    tg.setAttribute('color', new THREE.BufferAttribute(col, 3)); tg.computeVertexNormals(); const uv = tg.attributes.uv; for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * 900, uv.getY(i) * 900);
    const terr = new THREE.Mesh(tg, W.terrain()); terr.receiveShadow = true; terr.castShadow = true; terr.userData.surf = 'dirt'; tg.computeBoundsTree(); G.add(terr); W.solids.push(terr);
    const ny = 3.2; nestFloor(k, ny, 10, 8, 'wood');
    for (const [x, z] of [[-4.6, -3.6], [4.6, -3.6], [-4.6, 3.6], [4.6, 3.6]]) k.box('wood', x, ny / 2 - 0.2, z, 0.3, ny, 0.3, { color: [0.7, 0.6, 0.5] });
    const plates = [];
    for (const [d, r, x] of [[100, 0.1, -3], [200, 0.15, 4], [300, 0.2, -6], [400, 0.25, 7], [500, 0.3, -9], [600, 0.35, 10], [800, 0.45, -12], [1000, 0.6, 6]]) {
      const z = -d, gy = H(x, z), py = gy + 1.5 + r;
      k.box('metal', x - r - 0.25, gy + (1.6 + r * 2) / 2, z, 0.1, 1.6 + r * 2, 0.1, { color: [0.3, 0.3, 0.3] }); k.box('metal', x + r + 0.25, gy + (1.6 + r * 2) / 2, z, 0.1, 1.6 + r * 2, 0.1, { color: [0.3, 0.3, 0.3] }); k.box('metal', x, gy + 1.65 + r * 2, z, r * 2 + 0.7, 0.1, 0.1, { color: [0.3, 0.3, 0.3] });
      for (let i = 0; i < 9; i++) { const a = i / 8 * Math.PI; k.ball('ground', x + Math.cos(a) * (3 + r * 4), gy + 0.1, z - 5 - Math.sin(a) * 2, 1.7 + r * 3, [0.46, 0.38, 0.27], 0.7); }
      const m = new THREE.Mesh(new THREE.CylinderGeometry(r, r, 0.02, 24), new THREE.MeshStandardMaterial({ color: 0xf2f2ee, roughness: 0.6, metalness: 0.2 })); m.userData.own = true; m.rotation.x = Math.PI / 2; m.castShadow = true;
      const piv = new THREE.Group(); piv.position.set(x, py + r + 0.12, z); m.position.y = -r - 0.12; piv.add(m); G.add(piv);
      W.sign(String(d), x + r + 1.9, gy + 1.1 + r, z, 1.5 + r * 2.5, 0.75 + r * 1.25); k.box('metal', x + r + 1.9, gy + 0.4, z - 0.05, 0.08, 0.9 + r, 0.08, { color: [0.3, 0.3, 0.3] });
      plates.push({ d, r, pos: new THREE.Vector3(x, py, z), piv, mesh: m, swing: 0, sv: 0, hits: 0 });
      if (d >= 300) W.flag(x - r - 5, gy, z, 5, 0xe2552e, 1 + d / 500);
    }
    W.flag(9, H(9, -40), -40, 5);
    const spots = []; for (let i = 0; i < 40000 && spots.length < 5200; i++) { const x = (R() - 0.5) * 2600, z = -R() * 2300 + 250; if (Math.abs(x) < 55 + Math.max(0, -z) * 0.02 && z < 40) continue; if (fbm(x * 0.004 + 11, z * 0.004) < 0.42 + R() * 0.12) continue; spots.push([x, H(x, z) - 0.4, z, 7 + R() * 11]); }
    for (let i = 0; i < 420; i++) { const x = (R() - 0.5) * 1500, z = -R() * 1500 + 120; if (Math.abs(x) < 14 && z < 20) continue; const r = 0.4 + R() * R() * 2.6; k.ball('rock', x, H(x, z) + r * 0.15, z, r, [0.9, 0.88, 0.85], 0.55 + R() * 0.3, 0.8 + R() * 0.5, 0.8 + R() * 0.5, 2, 1); }
    for (let z = -20; z > -420; z -= 12) for (const s of [-1, 1]) { k.cyl('wood', s * 16, H(s * 16, z) + 0.6, z, 0.07, 1.4, [0.6, 0.5, 0.4], { seg: 6 }); k.box('wood', s * 16, H(s * 16, z) + 0.95, z - 6, 0.04, 0.1, 12, { color: [0.6, 0.5, 0.4], tile: 1 }); }
    const gy = H(8, 6); k.box('wood', -9.5, gy + 1.5, 4, 5, 3, 4, { color: [0.7, 0.6, 0.5], tile: 1.5, cap: 'iron', capColor: [0.7, 0.7, 0.7] }); k.box('iron', -9.5, gy + 3.1, 4, 5.8, 0.1, 4.8, { color: [0.7, 0.7, 0.72] }); W.prop('covered_car', 12, gy + 0.3, 8, 0.5, 1.05);
    W.scatter('wooden_picnic_table', [[-3.6, ny, 2.4, 1.57, 0.8], [3.6, ny, 2.6, 1.5, 0.8]]); W.scatter('barrel_01', [[-4.4, ny, -3.2, 0, 1], [4.5, ny, -3.3, 1, 1], [-7, gy, 1.4, 2, 1], [-6.3, gy, 1.8, 3, 1], [10, gy, 3, 1, 1]]); W.scatter('wooden_crate_02', [[4.3, ny, -1.8, 0.2, 1], [4.3, ny + 0.44, -1.8, 0.5, 0.9], [-4.3, ny, -1.9, 1.4, 1], [-7.2, gy, 6.5, 0, 1], [-6.9, gy + 0.44, 6.4, 0.4, 1]]);
    W.scatter('metal_jerrycan_green', [[3.2, ny, -3.3, 0.4, 1], [2.8, ny, -3.4, 1, 1], [-3.5, ny, 3.5, 2, 1]]); W.scatter('old_tyre', plates.flatMap(p => [[p.pos.x - p.r - 1.2, H(p.pos.x, p.pos.z) + 0.3, p.pos.z - 0.3, 0.4, 1.2], [p.pos.x + p.r + 0.9, H(p.pos.x, p.pos.z) + 0.3, p.pos.z - 0.4, -0.3, 1.2]])); W.scatter('propane_tank', [[-7.4, gy, 2.6, 0, 1]]); W.scatter('ammo_box', [[-3.4, ny + 0.6, 2.2, 0.3, 1], [-3.7, ny + 0.6, 2.7, 1.2, 1], [3.5, ny + 0.6, 2.4, 2, 1]]);
    W.trees('fir', spots);
    k.build(W.mats, G, W.solids);
    return { nest: new THREE.Vector3(0, ny, 0), yaw: 0, plates, height: H,
      update(dt) { for (const p of plates) { p.sv += (-p.swing * 60 - p.sv * 1.6) * dt; p.swing += p.sv * dt; p.piv.rotation.x = p.swing; } } };
  },

  // a city of blocks seen from a tower roof: a plaza, a penthouse terrace, an apartment block with open windows
  city(W, R) {
    const k = new Kit(), G = W.group, NY = 52, eye = [0, NY + 1.5, 0], dusk = W.env.lit > 0.4;
    const T = { plaza: new THREE.Vector3(0, 0, -250), terrace: new THREE.Vector3(168, 24.5, -399), block: new THREE.Vector3(-140, 14, -553) };
    const los = [[T.plaza.x, 0, T.plaza.z], [T.terrace.x, T.terrace.y, T.terrace.z], [T.block.x, 2, T.block.z + 7]];
    k.box('asphalt', 0, -0.5, -350, 1500, 1, 1500, { color: [0.8, 0.8, 0.8], tile: 4 });
    const kinds = ['office', 'brick', 'concrete2'], tints = { office: [[0.9, 0.95, 1], [0.7, 0.8, 0.9], [1, 0.92, 0.8], [0.55, 0.6, 0.62]], brick: [[1, 1, 1], [0.8, 0.72, 0.7], [1.1, 0.95, 0.8], [0.75, 0.6, 0.5]], concrete2: [[1, 1, 1], [0.85, 0.88, 0.92], [1.05, 0.98, 0.86], [0.7, 0.72, 0.7]] };
    const near = (x, z) => x > -260 && x < 300 && z > -700 && z < 80;
    const building = (x, z, w, d, h, kind) => { const u = 3.5; w = Math.max(2, Math.round(w / u)) * u; d = Math.max(2, Math.round(d / u)) * u; h = Math.max(2, Math.round(h / u)) * u;
      kind = kind || kinds[R() * 3 | 0]; k.box(kind, x, h / 2, z, w, h, d, { tile: 1, color: tints[kind][R() * 4 | 0].map(v => v * (0.9 + R() * 0.1)), cap: 'roof', capColor: [0.8, 0.8, 0.8] });
      k.box('concrete', x, h + 0.3, z, w + 0.3, 0.6, d + 0.3, { color: [0.8, 0.8, 0.8], skip: [3] });
      const rx = () => x + (R() - 0.5) * (w - 4), rz = () => z + (R() - 0.5) * (d - 4); for (let i = 0, n = 2 + R() * 5 | 0; i < n; i++) { const ax = rx(), az = rz(); k.box('metal', ax, h + 1.1, az, 1.6 + R() * 1.6, 1.2 + R() * 0.8, 1.4 + R(), { color: [0.62, 0.64, 0.65] }); k.cyl('metal', ax, h + 1.9, az, 0.45, 0.25, [0.3, 0.3, 0.32], { seg: 10 }); }
      k.box('brickw', rx(), h + 1.6, rz(), 3.2, 2.6, 2.6, { color: [0.85, 0.8, 0.76], cap: 'roof' }); for (let i = 0; i < 3; i++) k.cyl('metal', rx(), h + 0.9, rz(), 0.18, 1.2, [0.5, 0.5, 0.52], { seg: 8 });
      if (R() < 0.6) { const ax = rx(), az = rz(); k.cyl('metal', ax, h + 4, az, 0.05, 7, [0.6, 0.6, 0.6], { seg: 5 }); for (let i = 0; i < 3; i++) k.box('metal', ax, h + 5 + i * 0.8, az, 1.4 - i * 0.3, 0.04, 0.04, { color: [0.6, 0.6, 0.6] }); }
      if (R() < 0.5) { const ax = rx(), az = rz(); k.cyl('metal', ax, h + 0.9, az, 0.06, 1.2, [0.6, 0.6, 0.6], { seg: 5 }); k.geo('paint', new THREE.ConeGeometry(0.6, 0.3, 14, 1, true), M4(ax, h + 1.6, az + 0.2, -1.0, R() * 6, 0), [0.85, 0.85, 0.85]); }
      for (let i = 0; i < 2; i++) k.box('metal', x + (R() - 0.5) * w * 0.6, h + 0.75, z, 0.25, 0.25, d * (0.4 + R() * 0.4), { color: [0.55, 0.55, 0.57] });
      if (kind === 'brick' || kind === 'concrete2') for (let f = 1, nf = h / 3.5 | 0; f < nf; f++) for (const [nx, nz, len] of [[0, 1, w], [0, -1, w], [1, 0, d], [-1, 0, d]]) for (let b = 0, nb = len / 3.5 | 0; b < nb; b++) { const q = R(); if (q > 0.16) continue; const o = (b + 0.5) * 3.5 - len / 2, px = x + nx * (w / 2) + (nx ? 0 : o), pz = z + nz * (d / 2) + (nz ? 0 : o), y0 = f * 3.5;
        if (kind === 'brick') k.box('metal', px + nx * 0.25, y0 + 1.1, pz + nz * 0.25, nx ? 0.5 : 0.7, 0.45, nz ? 0.5 : 0.7, { color: [0.75, 0.75, 0.72] });
        else { k.box('concrete', px + nx * 0.7, y0 + 0.12, pz + nz * 0.7, nx ? 1.4 : 3.1, 0.14, nz ? 1.4 : 3.1, { color: [0.85, 0.85, 0.85] }); k.box('metal', px + nx * 1.36, y0 + 0.7, pz + nz * 1.36, nx ? 0.05 : 3.1, 1.0, nz ? 0.05 : 3.1, { color: [0.25, 0.25, 0.27] }); if (q < 0.07) k.box('paint', px + nx * 1.0, y0 + 1.5, pz + nz * 1.0, nx ? 0.04 : 2.2, 0.9, nz ? 0.04 : 2.2, { color: [[0.9, 0.9, 0.85], [0.7, 0.2, 0.2], [0.2, 0.4, 0.7]][b % 3] }); } }
      if (near(x, z)) for (const [nx, nz, len] of [[0, 1, w], [0, -1, w], [1, 0, d], [-1, 0, d]]) for (let b = 0, nb = len / 7 | 0; b < nb; b++) { const o = (b + 0.5) * 7 - len / 2, px = x + nx * (w / 2 + 0.7) + (nx ? 0 : o), pz = z + nz * (d / 2 + 0.7) + (nz ? 0 : o), c = [[0.6, 0.12, 0.1], [0.1, 0.3, 0.2], [0.85, 0.8, 0.6], [0.12, 0.2, 0.45], [0.75, 0.45, 0.1]][R() * 5 | 0];
        k.box('paint', px, 3.1, pz, nx ? 1.5 : 6, 0.12, nz ? 1.5 : 6, { color: c }); k.box('paint', px + nx * 0.72, 2.85, pz + nz * 0.72, nx ? 0.06 : 6, 0.5, nz ? 0.06 : 6, { color: c }); k.box(dusk ? 'glow' : 'paint', px - nx * 0.55, 3.75, pz - nz * 0.55, nx ? 0.1 : 4.5, 0.7, nz ? 0.1 : 4.5, { color: dusk ? [1.6, 1.3 + R() * 0.5, 0.8 + R()] : [0.9, 0.88, 0.8] }); }
      if (R() < 0.3) { k.cyl('wood', x + w * 0.25, h + 2.6, z - d * 0.25, 1.5, 3, [0.6, 0.5, 0.42]); k.geo('wood', new THREE.ConeGeometry(1.7, 1, 10), M4(x + w * 0.25, h + 4.6, z - d * 0.25), [0.3, 0.24, 0.18]); } return h; };
    const cap = (x, z, rad) => { let c = 200; for (const t of los) { const dx = t[0], dz = t[2], L2 = dx * dx + dz * dz, s = Math.max(0, Math.min(1.08, (x * dx + z * dz) / L2)), px = dx * s, pz = dz * s, dist = Math.hypot(x - px, z - pz);
      if (dist < rad + 16) c = Math.min(c, eye[1] + (t[1] - eye[1]) * Math.min(1, s) - 9 - (s > 0.85 ? 0 : 4)); } return c; };
    const free = (x, z) => !(Math.abs(x) < 45 && Math.abs(z + 250) < 45) && !(Math.abs(x) < 30 && Math.abs(z) < 30) && !(Math.abs(x - 168) < 30 && Math.abs(z + 399) < 30) && !(Math.abs(x + 140) < 36 && Math.abs(z + 560) < 36);
    for (let bx = -6; bx <= 6; bx++) for (let bz = -11; bz <= 2; bz++) {
      const cx = bx * 80, cz = bz * 80 - 10; k.box('pave', cx, 0.08, cz, 66, 0.16, 66, { color: [0.9, 0.9, 0.88], tile: 3 });
      if (!free(cx, cz)) continue;
      const far = Math.hypot(cx, cz + 300) > 420, n = far ? 1 : R() < 0.5 ? 2 : 4, sub = n === 1 ? [[0, 0, 56, 56]] : n === 2 ? [[-15, 0, 26, 56], [15, 0, 26, 56]] : [[-15, -15, 26, 26], [15, -15, 26, 26], [-15, 15, 26, 26], [15, 15, 26, 26]];
      for (const [ox, oz, w, d] of sub) { const x = cx + ox, z = cz + oz, hmax = cap(x, z, Math.hypot(w, d) / 2); if (hmax < 7) { if (R() < 0.5) tree(k, x, 0.16, z, 1 + R() * 0.5, R); continue; }
        const kind = kinds[R() * 3 | 0]; building(x, z, w, d, Math.min(hmax, (far ? 30 : 14) + R() * R() * (kind === 'office' ? 90 : 45)), kind); }
    }
    const clearOf = (x, z) => Math.abs(x - T.plaza.x) < 52 && Math.abs(z - T.plaza.z) < 50 && z > T.plaza.z - 20 || (Math.abs(x - T.plaza.x) < 14 && z > T.plaza.z && z < -30);
    const lamps = [], bins = [], hyd = [], benches = [], pots = [], boxes = [], traffic = [], walks = [];
    for (let i = -4; i <= 4; i++) { const sx = i * 80 + 40, szz = i * 80 + 30; 
      for (let q = -720; q < 90; q += 9) { k.box('paint', sx, 0.02, q, 0.16, 0.02, 3.4, { color: [0.9, 0.9, 0.86] }); }
      for (let q = -700; q < 80; q += 6.2) { for (const s of [-1, 1]) { if (R() < 0.6 && Math.abs(((q + 10) % 80 + 80) % 80 - 40) < 30 && !clearOf(sx + s * 5.2, q)) car(k, sx + s * 5.2, 0, q, s > 0 ? 0 : Math.PI, [R() * 0.7, R() * 0.7, R() * 0.7].map((v, j, a) => R() < 0.5 ? (a[0] + a[1] + a[2]) / 3 : v), R() < 0.15); } }
      for (let q = -700; q < 80; q += 26) for (const s of [-1, 1]) { lamps.push([sx + s * 7.6, 0.16, q + s * 6, s > 0 ? Math.PI / 2 : -Math.PI / 2, 1.35]); if (dusk) k.ball('glow', sx + s * 7.6, 5.05, q + s * 6, 0.16, [2.4, 2.0, 1.4]); if (!clearOf(sx + s * 8.6, q + 13 - s * 4)) tree(k, sx + s * 8.6, 0.16, q + 13 - s * 4, 0.9 + R() * 0.5, R); if (R() < 0.5) bins.push([sx + s * 8.2, 0.2, q + 3, R() * 6, 1]); if (R() < 0.3) hyd.push([sx + s * 7.9, 0.16, q - 8, R() * 6, 1]); if (R() < 0.35) benches.push([sx + s * 9.4, 0.16, q + 8, s * Math.PI / 2, 1.5]); if (R() < 0.4) boxes.push([sx + s * 9.8, 0.34, q - 3, R() * 6, 1.2 + R()]); }
      traffic.push({ x: sx - 2, z0: 90, z1: -720, t: R(), sp: 9 + R() * 5 }, { x: sx + 2, z0: -720, z1: 90, t: R(), sp: 9 + R() * 5 }); }
    for (let j = -8; j <= 0; j++) { const sz = j * 80 + 30; for (let q = -340; q < 340; q += 6.2) for (const s of [-1, 1]) if (R() < 0.5 && Math.abs(((q + 40) % 80 + 80) % 80 - 40) < 30 && !clearOf(q, sz + s * 5.2)) car(k, q, 0, sz + s * 5.2, s > 0 ? Math.PI / 2 : -Math.PI / 2, [R() * 0.6, R() * 0.6, R() * 0.65], R() < 0.15);
      for (let q = -340; q < 340; q += 9) k.box('paint', q, 0.02, sz, 3.4, 0.02, 0.16, { color: [0.9, 0.9, 0.86] }); for (let q = -330; q < 340; q += 26) for (const s of [-1, 1]) { lamps.push([q, 0.16, sz + s * 7.6, s > 0 ? 0 : Math.PI, 1.35]); if (!clearOf(q + 13, sz + s * 8.6)) tree(k, q + 13, 0.16, sz + s * 8.6, 0.9 + R() * 0.5, R); if (R() < 0.4) bins.push([q + 4, 0.2, sz + s * 8.2, R() * 6, 1]); }
      for (const xs of [-280, -200, -120, -40, 40, 120, 200, 280]) for (const s of [-1, 1]) for (let q = -4; q <= 4; q += 1) k.box('paint', xs + s * 9 , 0.025, sz + q * 1.1, 2.6, 0.02, 0.55, { color: [0.92, 0.92, 0.9] }); }
    W.scatter('street_lamp_01', lamps); W.scatter('metal_trash_can', bins); W.scatter('fire_hydrant', hyd); W.scatter('painted_wooden_bench', benches); W.scatter('cardboard_box_01', boxes);
    const tk = new Kit(); car(tk, 0, 0, 0, 0, [0.5, 0.5, 0.52]); const tk2 = new Kit(); car(tk2, 0, 0, 0, 0, [0.75, 0.6, 0.1], false); const tk3 = new Kit(); car(tk3, 0, 0, 0, 0, [0.85, 0.85, 0.86], true); const kinds3 = [tk, tk2, tk3].map(q => q.build(W.mats, null, null));
    traffic.forEach((t, i) => { const g = new THREE.Group(); for (const m of kinds3[i % 3]) { const c = m.clone(); c.userData.shared = true; g.add(c); } g.rotation.y = t.z1 < t.z0 ? 0 : Math.PI; t.g = g; G.add(g); });
    // the tower you shoot from
    k.box('concrete2', 0, NY / 2 - 0.15, 0, 42, NY - 0.3, 42, { tile: 1, cap: 'roof', capColor: [0.85, 0.85, 0.85] });
    for (const [x, z, w, d] of [[0, -20.8, 42, 0.4], [0, 20.8, 42, 0.4], [-20.8, 0, 0.4, 42], [20.8, 0, 0.4, 42]]) k.box('concrete', x, NY + 0.1, z, w, 0.5, d, { color: [0.85, 0.85, 0.85] });
    k.box('metal', 9, NY + 1.1, 9, 4, 2.2, 3, { color: [0.6, 0.62, 0.63] }); k.box('brickw', -11, NY + 1.5, 8, 5, 3, 4, { color: [0.9, 0.85, 0.8], cap: 'roof' });
    // the plaza
    const P = T.plaza; k.box('pave', P.x, 0.2, P.z, 70, 0.1, 62, { color: [1, 0.96, 0.88], tile: 2 });
    k.cyl('concrete', P.x, 0.55, P.z, 5.2, 0.6, [0.9, 0.9, 0.88], { seg: 28 }); k.cyl('water', P.x, 0.8, P.z, 4.8, 0.14, [1, 1, 1], { seg: 20 }); k.cyl('concrete', P.x, 1.6, P.z, 0.45, 2.2, [0.9, 0.9, 0.88], { seg: 14 }); k.cyl('concrete', P.x, 2.75, P.z, 1.3, 0.2, [0.9, 0.9, 0.88], { seg: 18 });
    for (const [x, z] of [[-24, -20], [-8, -24], [10, -24], [26, -20], [-27, 4], [27, 6], [-22, 22], [22, 23]]) tree(k, P.x + x, 0.2, P.z + z, 1, R);
    for (const [x, z, ry] of [[-10, 9, 0], [10, 9, 0], [-12, -9, 0], [12, -9, 0], [-17, 0, 1.57], [17, 0, 1.57]]) { k.box('wood', P.x + x, 0.65, P.z + z, 2, 0.1, 0.55, { ry, color: [0.7, 0.55, 0.4], tile: 1 }); k.box('wood', P.x + x - Math.sin(ry) * 0.25, 0.95, P.z + z - Math.cos(ry) * 0.25, 2, 0.45, 0.06, { ry, color: [0.7, 0.55, 0.4], tile: 1 }); k.box('metal', P.x + x, 0.42, P.z + z, 1.7, 0.4, 0.1, { ry, color: [0.2, 0.2, 0.2] }); }
    for (const [x, z] of [[-30, -28], [30, -28], [-30, 28], [30, 28], [0, -29], [0, 29]]) lamp(k, P.x + x, 0.2, P.z + z, dusk, W);
    const tables = []; for (let i = 0; i < 4; i++) { const x = P.x + 16 + (i % 2) * 6, z = P.z - 14 + (i >> 1) * 6; k.cyl('metal', x, 0.6, z, 0.05, 0.75, [0.7, 0.7, 0.7], { seg: 6 }); k.cyl('paint', x, 0.98, z, 0.5, 0.04, [0.9, 0.9, 0.88], { seg: 12 });
      k.cyl('metal', x, 1.7, z, 0.03, 1.5, [0.8, 0.8, 0.8], { seg: 5 }); k.geo('paint', new THREE.ConeGeometry(1.6, 0.5, 8), M4(x, 2.65, z), i % 2 ? [0.75, 0.16, 0.14] : [0.92, 0.9, 0.84]);
      for (const s of [-1, 1]) k.box('metal', x + s * 0.85, 0.48, z, 0.4, 0.5, 0.4, { color: [0.25, 0.25, 0.27] }); tables.push([x, z]); }
    k.box('brick', P.x + 30, 3.7, P.z - 11, 10.5, 7, 21, { tile: 1, cap: 'roof', capColor: [0.8, 0.8, 0.8] }); k.box('paint', P.x + 24.3, 3.3, P.z - 11, 1.2, 0.2, 14, { color: [0.16, 0.3, 0.22] });
    car(k, P.x - 36.5, 0.16, P.z + 8, 0, [0.03, 0.03, 0.04]); W.prop('covered_car', P.x - 36.5, 0.46, P.z - 9, 0, 1.05); for (let i = 0; i < 9; i++) W.prop('concrete_road_barrier', P.x - 14 + i * 3.4, 0.2, P.z + 31.6, 0, 2.1); car(k, P.x + 14, 0.16, P.z + 33.2, 1.57, [0.75, 0.75, 0.78], true); car(k, P.x - 12, 0.16, P.z - 33.2, 1.57, [0.15, 0.25, 0.45]);
    const pb = [], pp = [], pc = [], pbar = [], pt = [];
    for (let i = 0; i < 6; i++) { const sx = P.x - 26 + i * 4.6, sz = P.z - 27, c = [[0.75, 0.15, 0.12], [0.95, 0.92, 0.85], [0.15, 0.35, 0.6], [0.9, 0.7, 0.15]][i % 4]; for (const [ax, az] of [[-1.8, -1.2], [1.8, -1.2], [-1.8, 1.2], [1.8, 1.2]]) k.cyl('metal', sx + ax, 1.4, sz + az, 0.03, 2.4, [0.7, 0.7, 0.7], { seg: 5 });
      k.box('paint', sx, 2.65, sz, 4.1, 0.08, 2.9, { color: c }); k.box('paint', sx, 2.45, sz + 1.45, 4.1, 0.35, 0.04, { color: c }); k.box('wood', sx, 0.85, sz, 3.6, 0.08, 1.6, { color: [0.8, 0.7, 0.55], tile: 1 }); for (let j = 0; j < 5; j++) { k.box('paint', sx - 1.4 + j * 0.7, 1.02, sz + (j % 2) * 0.3 - 0.2, 0.5, 0.25, 0.4, { color: [[0.85, 0.3, 0.1], [0.3, 0.6, 0.2], [0.9, 0.8, 0.2], [0.6, 0.1, 0.15]][(i + j) % 4] }); }
      pc.push([sx - 2.3, 0.2, sz + 1.5, i, 1.1], [sx + 2.2, 0.2, sz - 1.4, i * 2, 1.3]); pbar.push([sx + 2.4, 0.2, sz + 0.8, 0, 1]); }
    for (const [x, z, ry] of [[-22, 12, 0.3], [22, 14, -0.4], [-6, 22, 0], [8, 22, 0.1], [-24, -6, 1.57], [24, -4, -1.57], [-13, 3, 1.3], [13, 2, -1.3], [0, 12, 3.14], [0, -12, 0]]) pb.push([P.x + x, 0.25, P.z + z, ry, 1.5]);
    for (let i = 0; i < 14; i++) { const a = i / 14 * 6.28; pp.push([P.x + Math.cos(a) * 7.2, 0.25, P.z + Math.sin(a) * 7.2, a, 5]); } for (const [x, z] of [[-33, -29], [33, -29], [-33, 29], [33, 29], [20, -3], [-20, 16]]) { pp.push([P.x + x, 0.25, P.z + z, 0, 9]); pt.push([P.x + x + 1.5, 0.25, P.z + z, 0, 1]); }
    W.scatter('painted_wooden_bench', pb); W.scatter('potted_plant_04', pp); W.scatter('wooden_crate_02', pc); W.scatter('barrel_01', pbar); W.scatter('metal_trash_can', pt); W.scatter('wooden_picnic_table', [[P.x + 19, 0.25, P.z + 12, 0.2, 1], [P.x + 24, 0.25, P.z + 17, 1.2, 1]]);
    W.flag(P.x - 31, 0.2, P.z + 29, 9, 0x2c58b8, 2); W.flag(P.x + 31, 0.2, P.z + 29, 9, 0xd8d8d0, 2);
    // the penthouse terrace
    const E = T.terrace; k.box('office', E.x, E.y / 2, E.z, 28, E.y, 28, { tile: 1, color: [0.8, 0.85, 0.9], cap: 'wood', capColor: [0.85, 0.8, 0.72] });
    for (const [x, z, w, d] of [[0, 14, 28, 0.06], [0, -14, 28, 0.06], [-14, 0, 0.06, 28], [14, 0, 0.06, 28]]) { k.box('glass', E.x + x, E.y + 0.55, E.z + z, w, 1.1, d); k.box('metal', E.x + x, E.y + 1.12, E.z + z, w + 0.06, 0.05, d + 0.06, { color: [0.75, 0.75, 0.75] }); }
    k.box('concrete', E.x - 2, E.y + 0.12, E.z - 2, 11, 0.24, 5, { color: [0.95, 0.95, 0.92] }); k.box('glow', E.x - 2, E.y + 0.25, E.z - 2, 10.2, 0.02, 4.2, { color: dusk ? [0.25, 0.75, 0.9] : [0.2, 0.55, 0.7] });
    k.box('plaster', E.x + 9, E.y + 1.75, E.z - 9.5, 7, 3.5, 7, { color: [0.95, 0.93, 0.9], cap: 'roof' }); k.box('paint', E.x + 5.45, E.y + 1.1, E.z - 9, 0.1, 2.2, 1.2, { color: [0.07, 0.07, 0.08] });
    for (let i = 0; i < 3; i++) { k.box('paint', E.x - 9 + i * 2.2, E.y + 0.3, E.z + 6, 0.7, 0.12, 1.9, { color: [0.92, 0.9, 0.85] }); k.box('paint', E.x - 9 + i * 2.2, E.y + 0.55, E.z + 5.2, 0.7, 0.5, 0.1, { color: [0.92, 0.9, 0.85] }); }
    k.cyl('paint', E.x + 6, E.y + 0.75, E.z + 7, 0.7, 0.05, [0.2, 0.2, 0.2], { seg: 12 }); k.cyl('metal', E.x + 6, E.y + 0.38, E.z + 7, 0.05, 0.75, [0.6, 0.6, 0.6], { seg: 6 });
    k.box('wood', E.x + 10.5, E.y + 0.55, E.z + 2, 1.2, 1.1, 5, { color: [0.45, 0.32, 0.24], tile: 1.5 }); k.box('paint', E.x + 10.5, E.y + 1.12, E.z + 2, 1.4, 0.06, 5.2, { color: [0.85, 0.85, 0.85] });
    for (const [x, z] of [[-13, 13], [13, 13], [-13, -13]]) { k.cyl('concrete', E.x + x, E.y + 0.35, E.z + z, 0.4, 0.7, [0.8, 0.7, 0.62]); k.ball('leaf', E.x + x, E.y + 1.2, E.z + z, 0.7, [0.13, 0.3, 0.12], 1.3); if (dusk) k.ball('glow', E.x + x * 0.92, E.y + 0.25, E.z + z * 0.92, 0.12, [1.8, 1.5, 0.9]); }
    W.scatter('potted_plant_04', [[E.x - 13, E.y, E.z + 5, 0, 6], [E.x - 13, E.y, E.z - 4, 1, 7], [E.x + 3, E.y, E.z + 13, 2, 6], [E.x - 5, E.y, E.z + 13, 3, 5], [E.x + 12.6, E.y, E.z + 6, 4, 7], [E.x + 4.5, E.y, E.z - 5, 0, 6]]); W.scatter('barrel_01', [[E.x + 12.3, E.y, E.z - 1.5, 0, 1], [E.x + 12.5, E.y, E.z + 5, 1, 1]]); W.scatter('wooden_crate_02', [[E.x + 12, E.y, E.z - 3.5, 0.3, 1]]);
    for (let i = 0; i < 4; i++) { k.cyl('metal', E.x + 9.6, E.y + 0.4, E.z + 0.2 + i * 1.2, 0.03, 0.8, [0.7, 0.7, 0.7], { seg: 5 }); k.cyl('paint', E.x + 9.6, E.y + 0.82, E.z + 0.2 + i * 1.2, 0.2, 0.05, [0.1, 0.1, 0.1], { seg: 10 }); }
    W.flag(E.x - 13, E.y, E.z - 13, 6, 0x1b1b1b, 1.6);
    // the apartment block, its windows real holes, its rooms furnished
    const room = (k, x, y, z, st) => { const wc = [[0.6, 0.56, 0.5], [0.45, 0.52, 0.56], [0.56, 0.48, 0.45], [0.5, 0.56, 0.5]][st % 4]; k.box('plaster', x, y + 1.5, z + 1, 3.45, 3, 0.12, { color: wc });
      k.box('wood', x - 0.9, y + 0.22, z + 3.2, 1.5, 0.44, 2, { color: [0.5, 0.42, 0.35], tile: 1 }); k.box('paint', x - 0.9, y + 0.52, z + 3.2, 1.42, 0.18, 1.9, { color: [[0.45, 0.14, 0.14], [0.15, 0.22, 0.4], [0.6, 0.6, 0.52]][st % 3] }); k.box('paint', x - 0.9, y + 0.7, z + 2.4, 1.3, 0.14, 0.4, { color: [0.85, 0.85, 0.82] });
      k.box('wood', x + 1, y + 0.38, z + 4.8, 0.8, 0.76, 0.8, { color: [0.45, 0.36, 0.28], tile: 1 }); k.box('paint', x + 0.6, y + 1.7, z + 1.08, 0.9, 0.6, 0.04, { color: [0.2 + (st % 3) * 0.15, 0.3, 0.35] }); k.box('wood', x + 1.3, y + 1, z + 1.3, 0.8, 2, 0.45, { color: [0.4, 0.3, 0.24], tile: 1 });
      if (W.dusk && st % 2) { k.ball('glow', x + 1, y + 1.0, z + 4.8, 0.13, [2.4, 1.8, 1.0]); k.cyl('metal', x + 1, y + 0.85, z + 4.8, 0.02, 0.2, [0.3, 0.3, 0.3], { seg: 5 }); } };
    const B = T.block, bw = 36, bays = 10, floors = 9, fh = 3.2, bh = floors * fh, zf = B.z + 7, wins = [];
    k.box('plaster', B.x, bh / 2, B.z - 7, bw, bh, 0.3, { color: [0.9, 0.8, 0.7] }); k.box('plaster', B.x - bw / 2, bh / 2, B.z, 0.3, bh, 14, { color: [0.9, 0.8, 0.7] }); k.box('plaster', B.x + bw / 2, bh / 2, B.z, 0.3, bh, 14, { color: [0.9, 0.8, 0.7] });
    k.box('roof', B.x, bh + 0.2, B.z, bw + 0.6, 0.4, 14.6, { color: [0.8, 0.8, 0.8] });
    for (let f = 0; f <= floors; f++) { k.box('plaster', B.x, f * fh + (f === floors ? -0.25 : 0.3), zf, bw, f === floors ? 0.9 : 1.1, 0.35, { color: [0.95, 0.85, 0.74] }); if (f < floors) k.box('wood', B.x, f * fh + 0.05, B.z, bw, 0.12, 14, { color: [0.75, 0.62, 0.5], tile: 1.5 }); }
    for (let b = 0; b <= bays; b++) { k.box('plaster', B.x - bw / 2 + b * (bw / bays), bh / 2, zf, 1.2, bh, 0.4, { color: [1, 0.9, 0.78] }); if (b > 0 && b < bays) k.box('plaster', B.x - bw / 2 + b * (bw / bays), bh / 2, B.z, 0.15, bh, 13.6, { color: [[0.6, 0.56, 0.5], [0.45, 0.52, 0.56], [0.56, 0.48, 0.45]][b % 3] }); }
    for (let f = 1; f < floors; f++) for (let b = 0; b < bays; b++) { const x = B.x - bw / 2 + (b + 0.5) * (bw / bays), y = f * fh, open = (b * 7 + f * 3) % 5 === 0;
      if (open) wins.push({ x, y, z: zf - 0.9, f, b }); else { k.box('glass', x, y + 1.9, zf - 0.1, 2.4, 2.1, 0.04); k.box('paint', x, y + 1.9, zf - 0.1, 0.06, 2.1, 0.07, { color: [0.9, 0.9, 0.88] }); if ((b + f) % 3 === 0) k.box('paint', x, y + 2.4, zf - 0.2, 2.4, 1.0, 0.03, { color: [0.8, 0.78, 0.7] }); }
      room(k, x, y + 0.11, B.z, (b * 5 + f * 11) % 7); }
    W.flag(B.x + bw / 2 - 2, bh + 0.4, B.z + 6, 6, 0xc23a2a, 2.2); W.flag(B.x - bw / 2 + 2, bh + 0.4, B.z + 6, 6, 0xc23a2a, 2.2);
    for (let i = 0; i < 26; i++) { const along = R() < 0.5, sx = Math.round((R() - 0.5) * 8) * 80 + 40 + (R() < 0.5 ? -5 : 5), q = (R() - 0.5) * 800; if (along) car(k, sx, 0, q - 300, 0, [R() * 0.6, R() * 0.6, R() * 0.6], R() < 0.2); else car(k, q, 0, Math.round(R() * 8 - 7) * 80 + 30 + (R() < 0.5 ? -5 : 5), 1.57, [R() * 0.6, R() * 0.6, R() * 0.6], R() < 0.2); }
    W.trees('leaf', k.trees || []); k.build(W.mats, G, W.solids);
    return { nest: new THREE.Vector3(0, NY, -17.5), T, wins, tables, plaza: P, terrace: E,
      update(dt) { for (const t of traffic) { t.t = (t.t + dt * t.sp / 810) % 1; t.g.position.set(t.x, 0, t.z0 + (t.z1 - t.z0) * t.t); } } };
  },

  // a harbour at first light: you on a crane's cab, across the water a pier with a helicopter waiting
  harbor(W, R) {
    const k = new Kit(), G = W.group, NY = 34, PZ = -820, PY = 3;
    k.box('water', 0, -0.5, -600, 5000, 1, 4000); k.box('concrete', 0, 0.9, 110, 900, 1.8, 200, { color: [0.85, 0.85, 0.84], tile: 4 });
    for (const x of [-7, 7]) for (const z of [-5, 5]) k.box('metal', x, NY / 2 + 1.8, z + 6, 1.2, NY, 1.2, { color: [0.85, 0.5, 0.1] });
    k.box('metal', 0, NY + 1.2, 6, 17, 1.4, 12.5, { color: [0.85, 0.5, 0.1] }); k.box('metal', 13, NY + 0.4, -22, 3, 2.4, 60, { color: [0.85, 0.5, 0.1] }); nestFloor(k, NY + 2.05, 8, 7);
    const cols = [[0.62, 0.18, 0.14], [0.16, 0.32, 0.55], [0.2, 0.45, 0.3], [0.8, 0.6, 0.15], [0.55, 0.55, 0.55], [0.75, 0.35, 0.12]];
    const stack = (x, y, z, n, ry = 0) => { for (let i = 0; i < n; i++) k.box('cont', x, y + 1.3 + i * 2.6, z, 2.44, 2.59, 12.2, { ry, color: cols[R() * 6 | 0], tile: 2.6 }); };
    for (let i = 0; i < 40; i++) stack(-200 + (i % 10) * 34 + R() * 4, 1.8, 40 + (i / 10 | 0) * 16, 1 + R() * 3 | 0, R() < 0.5 ? 0 : 1.57);
    // the far shore and the pier
    k.box('concrete', 0, PY - 2, PZ - 130, 1800, 4, 200, { color: [0.82, 0.82, 0.8], tile: 4 }); k.box('concrete', 20, PY - 1, PZ, 260, 2, 16, { color: [0.95, 0.93, 0.9], tile: 3 });
    for (let x = -105; x <= 145; x += 12.5) for (const z of [-7, 7]) k.cyl('wood', x, PY - 3, PZ + z, 0.5, 6, [0.5, 0.42, 0.36], { seg: 8 });
    for (let i = 0; i < 12; i++) { const x = -420 + i * 80 + R() * 20, h = 10 + R() * 14; k.box(R() < 0.5 ? 'iron' : 'brick', x, PY + h / 2, PZ - 70 - R() * 30, 56, h, 31.5, { tile: R() < 2 ? 1 : 1, cap: 'iron', capColor: [0.8, 0.82, 0.85] }); }
    for (let i = 0; i < 30; i++) stack(-300 + i * 21 + R() * 5, PY, PZ - 28 - R() * 14, 1 + R() * 4 | 0, 1.57);
    for (const cx of [-260, 250, 420]) { for (const x of [-9, 9]) for (const z of [-6, 6]) k.box('metal', cx + x, PY + 22, PZ - 40 + z, 1.4, 44, 1.4, { color: [0.2, 0.35, 0.6] }); k.box('metal', cx, PY + 45, PZ - 20, 4, 3, 90, { color: [0.2, 0.35, 0.6] }); k.box('metal', cx, PY + 49, PZ - 44, 6, 6, 8, { color: [0.9, 0.9, 0.9] }); }
    const hull = (x, z, L, c) => { k.box('paint', x, 2.5, z, L, 6, 16, { color: c }); k.box('paint', x + L * 0.32, 9, z, L * 0.2, 8, 13, { color: [0.9, 0.9, 0.88] }); stack(x - L * 0.1, 5.5, z, 2, 1.57); stack(x - L * 0.3, 5.5, z, 3, 1.57); };
    hull(-330, -560, 150, [0.12, 0.16, 0.3]); hull(380, -680, 120, [0.4, 0.1, 0.1]);
    for (const [x, z] of [[-60, -300], [80, -480], [-20, -640], [150, -700]]) { W.prop('ocean_buoy', x, 0.3, z, 0, 1.6); W.flag(x, 2.6, z, 3.5, 0xf0c020, 1.4); }
    for (let x = -100; x <= 140; x += 40) lamp(k, x, PY, PZ - 7.2, true, W);
    const hb = [], hc = [], ht = [], hj = [], hp = [];
    for (let x = -100; x < 140; x += 7) { k.cyl('metal', x, PY + 0.25, PZ + 7.4, 0.22, 0.5, [0.15, 0.15, 0.16], { seg: 8 }); if (R() < 0.55) hb.push([x + R() * 3, PY, PZ - 5.5 + R() * 2, R() * 6, 1]); if (R() < 0.5) hc.push([x + R() * 4, PY, PZ - 6 + R(), R() * 6, 1 + R() * 0.4]); if (R() < 0.4) ht.push([x + 2, PY + 0.3, PZ + 7.9, 1.57, 1.3]); if (R() < 0.2) hj.push([x + 1, PY, PZ - 4.8, R() * 6, 1]); }
    for (let i = 0; i < 60; i++) { const x = (R() - 0.5) * 700, z = 20 + R() * 150; (i % 3 === 0 ? hb : i % 3 === 1 ? hc : hp).push([x, 1.8, z, R() * 6, 1 + R() * 0.3]); } for (let x = -360; x <= 360; x += 30) { W.prop('street_lamp_01', x, 1.8, 14, 0, 1.6); k.ball('glow', x, 1.8 + 5.9, 14, 0.18, [2.4, 2.0, 1.4]); k.cyl('metal', x + 15, 2.05, 11.5, 0.25, 0.5, [0.15, 0.15, 0.16], { seg: 8 }); ht.push([x + 9, 1.3, 9.9, 1.57, 1.4]); }
    W.scatter('barrel_01', hb); W.scatter('wooden_crate_02', hc); W.scatter('old_tyre', ht); W.scatter('metal_jerrycan_green', hj); W.scatter('propane_tank', hp);
    const boat = (x, z, ry, L, c) => { k.box('paint', x, 0.5, z, L * 0.3, 1.3, L, { ry, color: c }); k.box('wood', x, 1.2, z, L * 0.27, 0.08, L * 0.94, { ry, color: [0.8, 0.7, 0.55], tile: 1 }); k.box('paint', x - Math.sin(ry) * L * 0.18, 2.1, z - Math.cos(ry) * L * 0.18, L * 0.2, 1.7, L * 0.28, { ry, color: [0.92, 0.92, 0.9] }); k.box('glass', x - Math.sin(ry) * L * 0.18, 2.45, z - Math.cos(ry) * L * 0.18, L * 0.205, 0.6, L * 0.285, { ry }); k.cyl('metal', x, 3.6, z, 0.05, 4.5, [0.8, 0.8, 0.8], { seg: 5 }); };
    for (let i = 0; i < 16; i++) boat(-140 + i * 19 + R() * 5, PZ + 14 + R() * 5, 1.57 + (R() - 0.5) * 0.3, 8 + R() * 6, [[0.85, 0.85, 0.82], [0.15, 0.25, 0.45], [0.55, 0.12, 0.1], [0.1, 0.35, 0.3]][i % 4]); for (let i = 0; i < 18; i++) boat((R() - 0.5) * 520, -40 - R() * 520, R() * 6.28, 7 + R() * 9, [[0.85, 0.85, 0.82], [0.15, 0.25, 0.45], [0.55, 0.12, 0.1]][i % 3]);
    for (let i = 0; i < 7; i++) { const x = -430 + i * 150 + R() * 30; k.cyl('iron', x, PY + 9, PZ - 150, 11, 18, [0.85, 0.85, 0.85], { seg: 20 }); k.geo('iron', new THREE.ConeGeometry(11.2, 2.4, 20), M4(x, PY + 19.2, PZ - 150), [0.75, 0.75, 0.75]); }
    for (let i = 0; i < 60; i++) stack(-520 + i * 18 + R() * 5, PY, PZ - 34 - R() * 22, 1 + R() * 4 | 0, 1.57); for (let i = 0; i < 80; i++) stack(-380 + (i % 20) * 38 + R() * 4, 1.8, 30 + (i / 20 | 0) * 16 + 70, 1 + R() * 4 | 0, R() < 0.5 ? 0 : 1.57);
    W.flag(-102, PY, PZ + 6.5, 9, 0xd22f2f, 2.6); W.flag(18, PY, PZ + 7.2, 9, 0xd22f2f, 2.6); W.flag(142, PY, PZ + 6.5, 9, 0xd22f2f, 2.6);
    // the helipad and the helicopter
    const HX = 96; k.cyl('paint', HX, PY + 0.03, PZ, 7, 0.06, [0.25, 0.27, 0.3], { seg: 28 }); k.cyl('glow', HX, PY + 0.07, PZ, 5.2, 0.02, [0.95, 0.85, 0.3], { seg: 28, open: true });
    k.box('paint', HX, PY + 0.08, PZ, 3.4, 0.03, 0.6, { color: [0.95, 0.95, 0.9] }); k.box('paint', HX - 1.4, PY + 0.08, PZ, 0.6, 0.03, 3.4, { color: [0.95, 0.95, 0.9] }); k.box('paint', HX + 1.4, PY + 0.08, PZ, 0.6, 0.03, 3.4, { color: [0.95, 0.95, 0.9] });
    const hk = new Kit(); hk.ball('paint', 0, 1.7, 0, 1.25, [0.08, 0.09, 0.1], 0.95, 1, 1.9); hk.ball('glass', 0.0, 1.85, 1.3, 0.95, [1, 1, 1], 0.85, 0.95, 1.1); hk.cyl('paint', 0, 1.9, -3.6, 0.22, 4.6, [0.08, 0.09, 0.1], { rx: Math.PI / 2, top: 0.12 });
    hk.box('paint', 0, 2.6, -5.7, 0.08, 1.4, 0.6, { color: [0.7, 0.1, 0.1] }); for (const s of [-1, 1]) { hk.box('metal', s * 0.95, 0.12, 0, 0.08, 0.08, 3.4, { color: [0.3, 0.3, 0.3] }); hk.box('metal', s * 0.75, 0.6, 0.8, 0.06, 1, 0.06, { color: [0.3, 0.3, 0.3] }); hk.box('metal', s * 0.75, 0.6, -0.8, 0.06, 1, 0.06, { color: [0.3, 0.3, 0.3] }); }
    hk.cyl('metal', 0, 3.0, 0, 0.1, 0.5, [0.3, 0.3, 0.3], { seg: 6 });
    const heli = new THREE.Group(); hk.build(W.mats, heli, null); heli.traverse(o => { o.matrixAutoUpdate = true; }); heli.position.set(HX, PY + 0.06, PZ); heli.rotation.y = -Math.PI / 2; G.add(heli);
    const rk = new Kit(); rk.box('metal', 0, 0, 0, 10.4, 0.04, 0.3, { color: [0.12, 0.12, 0.12] }); rk.box('metal', 0, 0, 0, 0.3, 0.04, 10.4, { color: [0.12, 0.12, 0.12] });
    const rotor = rk.build(W.mats, null, null)[0]; rotor.matrixAutoUpdate = true; rotor.position.y = 3.25; heli.add(rotor); W.spin.push({ o: rotor, ax: 'y', w: 24 });
    const ck = new Kit(); car(ck, 0, 0, 0, 0, [0.02, 0.02, 0.03], true); const suv = () => { const g = new THREE.Group(); ck.build(W.mats, g, null); return g; };
    const suv1 = suv(), suv2 = (() => { const g = new THREE.Group(); for (const c of suv1.children) { const m = c.clone(); g.add(m); } return g; })(); G.add(suv1, suv2);
    k.build(W.mats, G, W.solids);
    return { nest: new THREE.Vector3(0, NY + 2.05, -2.2), heli, rotor, suvs: [suv1, suv2], PY, PZ, HX };
  },
};
