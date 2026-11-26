// SKIRMISH TABLE's cavern, the place round a table whose map asks for it (maps.js look.place 'cavern'): a vast wet cave in the dark, an old delve. A dome of rock far overhead with stalactites and columns, a rolling floor, a black lake with a trickle falling into it, crystals and mushrooms that glow, pits of embers, a ruined doorway with its iron gate and a paved way, a camp by the water (the dungeon's and THE LAST CHANCE's own crates, barrels, chest, ladder and shields, copied by the build), a dead tree, ivy hanging from the hole in the roof, and one shaft of pale light down it onto the table. Its light and its shadows are in each point's colour (no lamp); the rock's wet shine is worked out from where you look. Only the trickle and the dust in the shaft move, slowly. Nothing tall stands before a seat. `light` is how much of the usual light its pieces stand in.
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';

const A = '/chess-assets/', GROUND = -0.34, RX = 36, RY = 25, RZ = 42, CY = GROUND + 1.5;
const rnd = seed => () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; };
const hash = (i, j, k) => { let n = Math.imul(i, 374761393) + Math.imul(j, 668265263) + Math.imul(k, 1440662683) | 0; n = Math.imul(n ^ (n >>> 13), 1274126177); return ((n ^ (n >>> 16)) >>> 0) / 4294967296; };
const vn = (x, y, z) => { const i = Math.floor(x), j = Math.floor(y), k = Math.floor(z), a = x - i, b = y - j, c = z - k, s = a * a * (3 - 2 * a), t = b * b * (3 - 2 * b), u = c * c * (3 - 2 * c), m = (p, q, r) => p + (q - p) * r;
  return m(m(m(hash(i, j, k), hash(i + 1, j, k), s), m(hash(i, j + 1, k), hash(i + 1, j + 1, k), s), t), m(m(hash(i, j, k + 1), hash(i + 1, j, k + 1), s), m(hash(i, j + 1, k + 1), hash(i + 1, j + 1, k + 1), s), t), u); };
const fbm = (x, y, z) => 0.55 * vn(x, y, z) + 0.28 * vn(x * 2.1, y * 2.1, z * 2.1) + 0.17 * vn(x * 4.3, y * 4.3, z * 4.3);
const clear = (x, z) => Math.abs(x) < 6.8 && Math.abs(z) < 17;   // the way from each seat to the table
// the floor's height: a level shelf under the table, rolling beyond it, a basin for the lake to the east, rising to the walls
const LAKE = [17, -5, 10], DOOR = [-21, 2], CAMP = [11.5, 5.5];
const floorAt = (x, z) => { const r = Math.hypot(x / 8.2, z / 9.2), out = Math.max(0, r - 1), d = Math.hypot(x, z), l = Math.hypot(x - LAKE[0], z - LAKE[1]) / LAKE[2];
  return GROUND + Math.min(1, out * 0.6) * (fbm(x * 0.16 + 9, 0, z * 0.16) - 0.42) * 3.2 + Math.pow(d / 34, 3) * 9 - Math.max(0, 1 - l * l) * 1.9 * Math.min(1, out); };
// what glows: [x, z, colour, reach]
const CRYSTALS = [[-10.5, -7, [0.25, 0.85, 1], 9], [10.5, 6.5, [0.25, 0.85, 1], 8], [-13, 9, [0.55, 0.4, 1], 9], [12, -11, [0.3, 0.9, 0.95], 10], [-20, -15, [0.25, 0.85, 1], 11], [22, 14, [0.55, 0.4, 1], 11], [-9, 19, [0.3, 0.9, 0.95], 8], [8.5, -19, [0.55, 0.4, 1], 8], [25, -6, [0.25, 0.85, 1], 10]];
const EMBERS = [[-7.7, -8.6], [7.7, 8.6], [7.7, -8.6], [-7.7, 8.6], [DOOR[0] + 3.2, DOOR[1] + 2.6], [CAMP[0] + 1.2, CAMP[1] - 1.6]], WARM = [1, 0.5, 0.18];

export function makeCavern(renderer) {
  const group = new THREE.Group(), extra = new THREE.Group(), Q = rnd(23), an = Math.min(4, renderer.capabilities.getMaxAnisotropy()), t = { value: 0 };
  group.add(extra);
  const still = (o, to = group) => { o.raycast = () => {}; o.matrixAutoUpdate = false; o.frustumCulled = false; to.add(o); return o; };
  const pic = (f, wrap = true) => { const x = new THREE.TextureLoader().load(A + f); x.colorSpace = THREE.SRGBColorSpace; x.anisotropy = an; if (wrap) x.wrapS = x.wrapT = THREE.RepeatWrapping; return x; };
  const at = (x, y, z, ry = 0, s = 1, rx = 0, rz = 0) => new THREE.Matrix4().compose(new THREE.Vector3(x, y, z), new THREE.Quaternion().setFromEuler(new THREE.Euler(rx, ry, rz)), new THREE.Vector3(s, s, s));
  const lamps = [], shades = [], blobs = [];   // what gives light; what stands in its way [x, z, radius, top]; the dark under a thing [x, z, radius]
  const lamp = (x, y, z, col, reach, k = 0.6) => lamps.push({ p: new THREE.Vector3(x, y, z), col, reach, k });
  for (const [x, z, col, reach] of CRYSTALS) lamp(x, floorAt(x, z) + 1.2, z, col, reach);
  for (const [x, z] of EMBERS) lamp(x, floorAt(x, z) + 0.9, z, WARM, 10, 1.0);
  // the light at a point, baked: a little from nowhere, the shaft from the roof's hole over the table, each glow near it; less where something stands between
  const v = new THREE.Vector3(), n = new THREE.Vector3(), l = new THREE.Vector3(), p = new THREE.Vector3(), HOLE = new THREE.Vector3(0, CY + RY, 0);
  const hidden = (from, to) => { for (const s of shades) { if (Math.hypot(from.x - s[0], from.z - s[1]) < s[2] + 0.25) continue;
    for (let i = 1; i <= 6; i++) { p.lerpVectors(from, to, i * 0.11); if (p.y < s[3] && Math.hypot(p.x - s[0], p.z - s[1]) < s[2]) return true; } } return false; };
  const light = (g, { flip = 1, tint = [1, 1, 1], cast = false, face = true } = {}) => { const P = g.attributes.position, N = g.attributes.normal, col = new Float32Array(P.count * 3);
    for (let i = 0; i < P.count; i++) { v.fromBufferAttribute(P, i); n.fromBufferAttribute(N, i).multiplyScalar(flip);
      const d = Math.hypot(v.x, v.z), up = Math.max(0, v.y - 6), dot = q => (face ? 0.3 + 0.7 * Math.max(0, n.dot(q)) : 0.8);
      const shaft = Math.exp(-((d / 10.5) ** 2)) * dot(l.copy(HOLE).sub(v).normalize()) * Math.exp(-up / 9) * (cast && hidden(v, HOLE) ? 0.3 : 1);
      let r = 0.016 + shaft * 0.3, gr = 0.02 + shaft * 0.35, b = 0.028 + shaft * 0.42;
      const hole = v.y > CY + RY * 0.8 ? Math.max(0, 1 - Math.hypot(v.x, v.z) / 5) : 0; r += hole * 1.4; gr += hole * 1.6; b += hole * 1.8;   // the hole itself, bright
      for (const L of lamps) { const dist = l.copy(L.p).sub(v).length(); if (dist > L.reach) continue; const k = (1 - dist / L.reach) ** 2 * dot(l.normalize()) * L.k * (cast && hidden(v, L.p) ? 0.2 : 1); r += L.col[0] * k; gr += L.col[1] * k; b += L.col[2] * k; }
      col[i * 3] = Math.min(1, r * tint[0]); col[i * 3 + 1] = Math.min(1, gr * tint[1]); col[i * 3 + 2] = Math.min(1, b * tint[2]); }
    g.setAttribute('color', new THREE.BufferAttribute(col, 3)); return g; };
  // rock: its picture laid on by where a point is (no seams on a dome), its baked light, a wet shine from the shaft and from the edge of sight, the dark with distance
  const rock = (map, scale, wet) => new THREE.ShaderMaterial({ uniforms: { map: { value: map }, scale: { value: scale }, wet: { value: wet } }, side: THREE.DoubleSide,
    vertexShader: 'attribute vec3 color; varying vec3 vP, vN, vC, vCam; void main() { vP = position; vN = normal; vC = color; vCam = (inverse(modelMatrix) * vec4(cameraPosition, 1.0)).xyz; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
    fragmentShader: `uniform sampler2D map; uniform float scale, wet; varying vec3 vP, vN, vC, vCam;
      void main() { vec3 n = normalize(vN), V = normalize(vCam - vP); if (dot(n, V) < 0.0) n = -n;
        vec3 w = pow(abs(n), vec3(4.0)); w /= w.x + w.y + w.z;
        vec3 t = texture2D(map, vP.zy * scale).rgb * w.x + texture2D(map, vP.xz * scale).rgb * w.y + texture2D(map, vP.xy * scale).rgb * w.z;
        vec3 L = normalize(vec3(0.0, ${(CY + RY).toFixed(1)}, 0.0) - vP); float lum = dot(t, vec3(0.333)), lit = dot(vC, vec3(0.333));
        float shine = pow(max(dot(reflect(-L, n), V), 0.0), 26.0) * (0.25 + lit * 2.2) + pow(1.0 - max(dot(n, V), 0.0), 4.0) * (0.03 + lit * 0.5);
        vec3 c = t * vC * 1.9 + shine * wet * (0.35 + lum) * (vC * 2.0 + vec3(0.1, 0.13, 0.16));
        c *= 1.0 - 0.8 * smoothstep(16.0, 46.0, length(vP.xz));
        gl_FragColor = vec4(min(c, vec3(0.92)), 1.0);
        #include <colorspace_fragment>
      }` });
  const plain = (g, keep = ['position', 'normal']) => { const o = g.index ? g.toNonIndexed() : g; for (const k of Object.keys(o.attributes)) if (!keep.includes(k)) o.deleteAttribute(k); return o; };

  // ---- the shapes, gathered first (what stands is noted, so the light can be laid with its shadows after) ----
  const walls = [], stone = [];
  { const g = new THREE.SphereGeometry(1, 56, 30, 0, Math.PI * 2, 0, Math.PI * 0.62), P = g.attributes.position;
    for (let i = 0; i < P.count; i++) { v.fromBufferAttribute(P, i); const k = 1 + (fbm(v.x * 2.2 + 3, v.y * 2.2, v.z * 2.2) - 0.5) * 0.34 + (vn(v.x * 6, v.y * 6, v.z * 6) - 0.5) * 0.06; P.setXYZ(i, v.x * RX * k, CY + v.y * RY * k, v.z * RZ * k); }
    g.computeVertexNormals(); walls.push([plain(g), { flip: -1 }]); }
  const roofAt = (x, z) => CY + RY * Math.sqrt(Math.max(0.02, 1 - (x / RX) ** 2 - (z / RZ) ** 2)) * 0.9;
  const spike = (x, y, z, r, len, down) => { const g = new THREE.ConeGeometry(r, len, 6, 2, true), P = g.attributes.position;
    for (let i = 0; i < P.count; i++) { const k = 0.8 + Q() * 0.4; P.setX(i, P.getX(i) * k + (Q() - 0.5) * r * 0.2); P.setZ(i, P.getZ(i) * k); }
    if (down) g.rotateX(Math.PI); g.translate(x, y + (down ? -len / 2 : len / 2), z); g.computeVertexNormals(); walls.push([plain(g), {}]); if (!down && len > 0.9) shades.push([x, z, r * 0.6, y + len * 0.8]); };
  for (let i = 0; i < 120; i++) { const a = Q() * 6.283, r = Math.sqrt(Q()) * 0.86, x = Math.sin(a) * r * RX, z = Math.cos(a) * r * RZ, len = 1.5 + Q() * Q() * 11; if (Math.hypot(x, z) < 6.5) continue; spike(x, roofAt(x, z) + 1.5, z, 0.25 + len * 0.07, len, true); }
  for (let i = 0; i < 70; i++) { const a = Q() * 6.283, r = 9.5 + Q() * 24, x = Math.sin(a) * r, z = Math.cos(a) * r * 1.1, tall = !clear(x, z) && Math.abs(x) > 8.5, h = tall ? 1 + Q() * Q() * 7 : 0.3 + Q() * 0.5;
    if (Math.hypot(x - LAKE[0], z - LAKE[1]) < LAKE[2] * 0.8 || Math.hypot(x - CAMP[0], z - CAMP[1]) < 4 || (x < -8 && Math.abs(z - DOOR[1]) < 3.2)) continue;
    spike(x, floorAt(x, z) - 0.3, z, 0.22 + h * 0.09, h + 0.3, false); }
  const COLUMNS = [[-19, -6], [18, 17], [-24, -20], [27, -20], [-15, 26], [4, 30], [-3, -31]];
  for (const [x, z] of COLUMNS) { const top = roofAt(x, z) + 1.5, bot = floorAt(x, z) - 0.4, mid = (top + bot) / 2; spike(x, top, z, 1.5, top - mid + 1.5, true); spike(x, bot, z, 1.7, mid - bot + 1.5, false); shades.push([x, z, 1.1, 30]); }

  // the old delve's stone: a doorway in the west with steps and a dark way in, a paved way from it to the table, broken pillars beside it
  const block = (w, h, d, x, y, z, ry = 0, rx = 0) => { stone.push(new THREE.BoxGeometry(w, h, d).applyMatrix4(at(x, y, z, ry, 1, rx))); if (h > 1) shades.push([x, z, Math.max(w, d) * 0.5, y + h / 2]); };
  { const [dx, dz] = DOOR, y = floorAt(dx, dz);
    for (const s of [-1, 1]) block(1.1, 4.4, 1.1, dx, y + 2.1, dz + s * 1.75); block(1.3, 0.9, 5, dx, y + 4.7, dz); block(0.9, 0.5, 3.4, dx, y + 5.4, dz);
    for (const s of [-1, 1]) block(3.5, 5.6, 2.4, dx - 1.6, y + 2.6, dz + s * 3.4, 0.1 * s);
    stone.push(new THREE.PlaneGeometry(2.6, 4.4).rotateY(Math.PI / 2).translate(dx - 0.5, y + 2.1, dz));
    for (let i = 0; i < 3; i++) block(1.1, 0.3, 3.6 + i * 0.5, dx + 0.9 + i * 0.95, y + 0.55 - i * 0.26, dz);
    for (let x = dx + 4.2; x < -8.4; x += 1.55) { const z = dz * (x + 8.4) / (dx + 12.6) * 1.0 + (Q() - 0.5) * 0.25; block(1.4, 0.16, 1.9 + Q() * 0.5, x, floorAt(x, z) + 0.03, z, (Q() - 0.5) * 0.2, (Q() - 0.5) * 0.06); }
    for (const [px, pz, h] of [[-17, DOOR[1] + 2.6, 3.2], [-17, DOOR[1] - 2.6, 1.4], [-13, DOOR[1] + 2.4, 0.9], [-13, DOOR[1] - 2.4, 2.4]]) { const fy = floorAt(px, pz); stone.push(new THREE.CylinderGeometry(0.42, 0.5, h, 10).translate(px, fy + h / 2 - 0.1, pz)); block(1.2, 0.3, 1.2, px, fy + 0.1, pz); shades.push([px, pz, 0.5, fy + h]); blobs.push([px, pz, 1.2]); }
    for (let i = 0; i < 9; i++) { const x = dx + 2 + Q() * 9, z = dz + (Q() - 0.5) * 7, s = 0.3 + Q() * 0.5; block(s * 1.5, s, s, x, floorAt(x, z) + s * 0.25, z, Q() * 3, (Q() - 0.5) * 0.6); } }

  // the lake: black, still, a little of the light on it; a trickle down the wall into it; thin mist lying over it
  { const g = new THREE.CircleGeometry(LAKE[2] * 1.05, 40).rotateX(-Math.PI / 2).translate(LAKE[0], GROUND - 1.05, LAKE[1]), cam = 'varying vec3 vP, vCam; varying vec2 vU; void main() { vP = position; vU = uv; vCam = (inverse(modelMatrix) * vec4(cameraPosition, 1.0)).xyz; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }';
    still(new THREE.Mesh(g, new THREE.ShaderMaterial({ transparent: true, vertexShader: cam,
      fragmentShader: `varying vec3 vP, vCam; void main() { vec3 V = normalize(vCam - vP); float f = pow(1.0 - max(V.y, 0.0), 3.0); vec3 c = vec3(0.004, 0.008, 0.012) + f * vec3(0.05, 0.11, 0.14); gl_FragColor = vec4(c, 0.93);
        #include <colorspace_fragment>
      }` })));
    const fx = LAKE[0] + 9.5, top = roofAt(fx, LAKE[1]) * 0.55, H = top - GROUND + 1;
    still(new THREE.Mesh(new THREE.PlaneGeometry(1.5, H).rotateY(-Math.PI / 2).translate(fx, GROUND - 1 + H / 2, LAKE[1]), new THREE.ShaderMaterial({ uniforms: { t }, transparent: true, depthWrite: false, side: THREE.DoubleSide, vertexShader: cam,
      fragmentShader: `uniform float t; varying vec2 vU; float h(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
        float nz(vec2 p) { vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f); return mix(mix(h(i), h(i + vec2(1, 0)), f.x), mix(h(i + vec2(0, 1)), h(i + vec2(1, 1)), f.x), f.y); }
        void main() { float s = nz(vec2(vU.x * 9.0, vU.y * 5.0 + t * 0.9)) * 0.6 + nz(vec2(vU.x * 22.0, vU.y * 11.0 + t * 1.5)) * 0.4; float a = smoothstep(0.35, 0.8, s) * (1.0 - abs(vU.x - 0.5) * 2.0) * smoothstep(0.0, 0.08, vU.y) * smoothstep(1.0, 0.85, vU.y);
          gl_FragColor = vec4(vec3(0.42, 0.52, 0.6), a * 0.5);
          #include <colorspace_fragment>
        }` }))).renderOrder = 4;
    const cv = document.createElement('canvas'); cv.width = cv.height = 64; const x = cv.getContext('2d'), q = x.createRadialGradient(32, 32, 0, 32, 32, 32); q.addColorStop(0, 'rgba(255,255,255,1)'); q.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = q; x.fillRect(0, 0, 64, 64);
    const mist = [[LAKE[0], LAKE[1], 9], [LAKE[0] - 5, LAKE[1] + 6, 6], [-16, 14, 7], [-12, -16, 8], [6, 22, 7]].map(([mx, mz, r], i) => new THREE.PlaneGeometry(r * 2, r * 2).rotateX(-Math.PI / 2).translate(mx, Math.max(GROUND - 0.7, floorAt(mx, mz)) + 0.5 + i * 0.07, mz));
    still(new THREE.Mesh(mergeGeometries(mist), new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(cv), color: 0x5f7686, transparent: true, opacity: 0.1, depthWrite: false }))).renderOrder = 3; }

  // what glows of itself: crystals, mushrooms at the foot of the rock, the embers in their pits; their glow in the air; the shaft of light and the dust in it
  const dust = new THREE.Group(); group.add(dust);
  { const xs = [], glow = [], paint = (g, f) => { const P = g.attributes.position, col = new Float32Array(P.count * 3); for (let k = 0; k < P.count; k++) col.set(f(P.getY(k)), k * 3); g.setAttribute('color', new THREE.BufferAttribute(col, 3)); return g; };
    const halo = (x, y, z, r, col) => { for (const ry of [0, Math.PI / 2]) glow.push(paint(new THREE.PlaneGeometry(r, r).rotateY(ry).translate(x, y, z), () => col)); };
    for (const [x, z, col] of CRYSTALS) { const y = floorAt(x, z); for (let i = 0; i < 6; i++) { const h = 0.7 + Q() * 2.2;
        xs.push(paint(plain(new THREE.ConeGeometry(0.14 + h * 0.09, h, 5, 1).translate(0, h / 2, 0).rotateX((Q() - 0.5) * 1.1).rotateZ((Q() - 0.5) * 1.1).translate(x + (Q() - 0.5) * 1.4, y - 0.3, z + (Q() - 0.5) * 1.4)), py => { const up = Math.min(1, Math.max(0, (py - y + 0.3) / h)), b = 0.35 + 0.5 * up; return [col[0] * b + 0.12 * up, col[1] * b + 0.1 * up, col[2] * b + 0.08 * up]; })); }
      halo(x, y + 0.9, z, 6, col); }
    for (let i = 0; i < 16; i++) { const a = Q() * 6.283, r = 10 + Q() * 16, cx = Math.sin(a) * r, cz = Math.cos(a) * r, G = [0.3, 0.95, 0.6]; if (clear(cx, cz) || Math.hypot(cx - LAKE[0], cz - LAKE[1]) < 8) continue;
      lamp(cx, floorAt(cx, cz) + 0.5, cz, G, 3.6, 0.45);
      for (let k = 0; k < 5; k++) { const x = cx + (Q() - 0.5) * 1.2, z = cz + (Q() - 0.5) * 1.2, y = floorAt(x, z), h = 0.12 + Q() * 0.3, w = 0.1 + Q() * 0.16;
        xs.push(paint(plain(new THREE.CylinderGeometry(w * 0.2, w * 0.25, h, 3, 1, true).translate(x, y + h / 2, z)), () => [0.12, 0.3, 0.2]), paint(plain(new THREE.SphereGeometry(w, 5, 2, 0, 6.283, 0, 1.6).scale(1, 0.7, 1).translate(x, y + h, z)), () => [G[0] * 0.75, G[1] * 0.75, G[2] * 0.75])); }
      halo(cx, floorAt(cx, cz) + 0.4, cz, 2.6, G); }
    for (const [x, z] of EMBERS) { const y = floorAt(x, z); xs.push(paint(plain(new THREE.CircleGeometry(0.5, 10).rotateX(-Math.PI / 2).translate(x, y + 0.33, z)), () => [0.95, 0.42, 0.1])); halo(x, y + 0.75, z, 3.4, [1, 0.55, 0.22]); blobs.push([x, z, 1.5]); }
    still(new THREE.Mesh(mergeGeometries(xs), new THREE.MeshBasicMaterial({ vertexColors: true })));
    const cv = document.createElement('canvas'); cv.width = cv.height = 64; const x = cv.getContext('2d'), q = x.createRadialGradient(32, 32, 0, 32, 32, 32); q.addColorStop(0, 'rgba(255,255,255,1)'); q.addColorStop(0.3, 'rgba(255,255,255,0.35)'); q.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = q; x.fillRect(0, 0, 64, 64);
    const dot = new THREE.CanvasTexture(cv);
    still(new THREE.Mesh(mergeGeometries(glow), new THREE.MeshBasicMaterial({ map: dot, vertexColors: true, transparent: true, opacity: 0.2, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide }))).renderOrder = 5;
    const rv = document.createElement('canvas'); rv.width = 64; rv.height = 128; const y = rv.getContext('2d'), g1 = y.createLinearGradient(0, 0, 64, 0); g1.addColorStop(0, 'rgba(255,255,255,0)'); g1.addColorStop(0.5, 'rgba(255,255,255,1)'); g1.addColorStop(1, 'rgba(255,255,255,0)'); y.fillStyle = g1; y.fillRect(0, 0, 64, 128);
    y.globalCompositeOperation = 'destination-in'; const g2 = y.createLinearGradient(0, 0, 0, 128); g2.addColorStop(0, 'rgba(0,0,0,1)'); g2.addColorStop(1, 'rgba(0,0,0,0.15)'); y.fillStyle = g2; y.fillRect(0, 0, 64, 128);
    const H = CY + RY - GROUND, rays = [0, 1.05, 2.1].map(ry => new THREE.PlaneGeometry(9, H).rotateY(ry).translate(0, GROUND + H / 2, 0));
    still(new THREE.Mesh(mergeGeometries(rays), new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(rv), color: 0xbcd4ee, transparent: true, opacity: 0.05, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide }))).renderOrder = 6;
    const motes = []; for (let i = 0; i < 110; i++) { const a = Q() * 6.283, r = 6.8 + Q() * 2, s = 0.015 + Q() * 0.025; motes.push(new THREE.PlaneGeometry(s, s).rotateY(Q() * 3).rotateX(Q() * 3).translate(Math.sin(a) * r, 1.5 + Q() * 14, Math.cos(a) * r)); }
    still(new THREE.Mesh(mergeGeometries(motes), new THREE.MeshBasicMaterial({ color: 0xcfe0f0, transparent: true, opacity: 0.22, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide })), dust).renderOrder = 6; dust.matrixAutoUpdate = true; }

  // ---- built, now that everything that stands is known ----
  { const g = new THREE.RingGeometry(0.01, 46, 56, 22).rotateX(-Math.PI / 2), P = g.attributes.position;   // the floor, finer near the table, where the shadows fall
    for (let i = 0; i < P.count; i++) { const x = P.getX(i), z = P.getZ(i), r = Math.hypot(x, z) || 1, k = 46 * (r / 46) ** 1.7 / r; P.setXYZ(i, x * k, floorAt(x * k, z * k), z * k); } g.computeVertexNormals();
    still(new THREE.Mesh(light(plain(g), { cast: true }), rock(pic('board/rock.jpg'), 0.19, 0.9))); }
  still(new THREE.Mesh(mergeGeometries(walls.map(([g, o]) => light(g, o))), rock(pic('board/rock.jpg'), 0.11, 1)));
  still(new THREE.Mesh(mergeGeometries(stone.map(g => light(plain(g), { cast: true, tint: [1.15, 1.12, 1.05] }))), rock(pic('board/wall.jpg'), 0.42, 0.7)));

  // ivy: down from the rim of the roof's hole where the light comes in, up the nearer columns and the doorway, over the ground round the shelf
  { const cards = [], IVY = [[15, 525, 255, 770], [275, 530, 480, 755], [545, 535, 730, 755], [795, 530, 1025, 760]];
    const card = (s, m) => { const [x0, y0, x1, y1] = IVY[Q() * 4 | 0], g = new THREE.PlaneGeometry(s, s), U = g.attributes.uv; for (let i = 0; i < U.count; i++) U.setXY(i, (x0 + U.getX(i) * (x1 - x0)) / 2048, 1 - (y1 - U.getY(i) * (y1 - y0)) / 1024);
      const k = 1.5 + Q() * 1.1; cards.push(light(g.applyMatrix4(m), { face: false, tint: [k * 0.75, k, k * 0.6] })); };
    for (let i = 0; i < 16; i++) { const a = i / 16 * 6.283 + Q() * 0.3, r = 7.4 + Q() * 2.6, x = Math.sin(a) * r, z = Math.cos(a) * r, top = roofAt(x, z) + 0.5, len = 5 + Q() * 9; for (let y = 0; y < len; y += 0.8) card(1.5, at(x + (Q() - 0.5) * 0.3, top - y, z + (Q() - 0.5) * 0.3, a + (Q() - 0.5), 1, (Q() - 0.5) * 0.4)); }
    for (const [x, z] of [COLUMNS[0], [-17, DOOR[1] + 2.6], [-13, DOOR[1] - 2.4]]) for (let i = 0; i < 26; i++) { const a = Q() * 6.283, y = floorAt(x, z) + Q() * (x === COLUMNS[0][0] ? 9 : 2.6), r = x === COLUMNS[0][0] ? 1.5 - y * 0.05 : 0.5; card(1.1, at(x + Math.sin(a) * r, y, z + Math.cos(a) * r, a, 1, (Q() - 0.5) * 0.5)); }
    for (let i = 0; i < 34; i++) card(1.3, at(DOOR[0] + 0.62 + Q() * 0.2, floorAt(...DOOR) + 0.4 + Q() * 5.2, DOOR[1] + (Q() - 0.5) * 9.5, Math.PI / 2 + (Q() - 0.5) * 0.5, 1, (Q() - 0.5) * 0.6));
    for (let i = 0; i < 44; i++) { const a = Q() * 6.283, r = 7.2 + Q() * Q() * 5, cx = Math.sin(a) * r * 0.95, cz = Math.cos(a) * r * 1.12; if (Math.abs(cx) < 6.7 && Math.abs(cz) < 7.7) continue;   // low clumps, close to the ground
      for (let k = 0; k < 7; k++) { const x = cx + (Q() - 0.5) * 0.9, z = cz + (Q() - 0.5) * 0.9; card(0.3 + Q() * 0.3, at(x, floorAt(x, z) + 0.03 + Q() * 0.1, z, Q() * 6, 1, -Math.PI / 2 + (Q() - 0.5) * 0.7)); } }
    still(new THREE.Mesh(mergeGeometries(cards), new THREE.MeshBasicMaterial({ map: pic('dungeon/leaf.webp', false), vertexColors: true, alphaTest: 0.5, side: THREE.DoubleSide }))); }

  // the real things, when their files come: embers' pits, the gate in its doorway, boulders, and the camp by the water (the heavier of it on a screen only)
  const load = f => new Promise((ok, no) => new GLTFLoader().load(A + f + '.glb', ok, undefined, no)).then(s => { s.scene.updateMatrixWorld(true); const out = []; s.scene.traverse(o => { if (o.isMesh) out.push({ geo: plain(o.geometry.clone().applyMatrix4(o.matrixWorld), ['position', 'normal', 'uv']), mat: o.material }); }); return out; });
  const FILES = ['cavern/stone_fire_pit', 'cavern/large_iron_gate', 'jungle/rocks', 'cavern/wooden_crate_01', 'cavern/kite_shield', 'cavern/treasure_chest', 'cavern/wine_barrel_01', 'cavern/wooden_ladder', 'cavern/deadtree'];
  const ready = Promise.all(FILES.map(load)).then(([pit, gate, rocks, crate, shield, chest, barrel, ladder, tree]) => {
    const sets = new Map(), put = (parts, m, heavy, r, tint = [2.1, 2.1, 2.1]) => { for (const q of parts) { const k = q.mat.uuid + (heavy ? 'h' : ''); if (!sets.has(k)) sets.set(k, { mat: q.mat, heavy, gs: [] }); sets.get(k).gs.push(light(q.geo.clone().applyMatrix4(m), { cast: true, tint })); }
      if (r) { v.setFromMatrixPosition(m); blobs.push([v.x, v.z, r]); } };
    const on = (x, z, dy = 0) => [x, floorAt(x, z) + dy, z];
    for (const [x, z] of EMBERS) put(pit, at(...on(x, z, 0.14), Q() * 6, 0.85), false, 0);
    put(gate, at(DOOR[0] + 0.25, floorAt(...DOOR) - 0.05, DOOR[1] - 1.2, -Math.PI / 2 - 0.5, 1.45), true, 0); put(gate, at(DOOR[0] + 0.25, floorAt(...DOOR) - 0.05, DOOR[1] + 1.2, Math.PI / 2 + 1.1, 1.45), true, 0);
    for (const [x, z, s, ry] of [[10.5, -9.5, 0.9, 1], [-10.5, 10, 1, 4], [-12, -3.5, 0.6, 2.5]]) put(rocks, at(...on(x, z, -0.1), ry, s), false, 3 * s);
    const [cx, cz] = CAMP;
    for (const [dx, dz, ry, dy] of [[0, 0, 0.3, 0], [0.95, 0.2, 1.2, 0], [0.4, 0.15, 0.8, 0.52], [-1.4, 1.6, 2, 0]]) put(crate, at(cx + dx, floorAt(cx + dx, cz + dz) - 0.3 * 1.5 + dy * 1.5, cz + dz, ry, 1.5), true, dy ? 0 : 1);
    put(shield, at(cx - 0.55, floorAt(cx, cz) + 0.72, cz + 0.1, 1.9, 1, 0, 0.35), false, 0); put(shield, at(DOOR[0] + 1.1, floorAt(...DOOR) + 1.1, DOOR[1] + 2.5, 1.2, 1, 0.3, 0), true, 0);
    put(chest, at(...on(cx + 2.6, cz + 1.2, 0.02), -2.2, 1.25), true, 1.1);
    for (const [dx, dz] of [[1.9, -0.6], [2.6, -0.2]]) put(barrel, at(cx + dx, floorAt(cx + dx, cz + dz) - 0.82 * 0 - 0.0, cz + dz, Q() * 6, 1.15).multiply(new THREE.Matrix4().makeTranslation(0, -0.0, 0)), true, 0.9);
    put(ladder, at(COLUMNS[1][0] - 1.6, floorAt(COLUMNS[1][0] - 1.6, COLUMNS[1][1]) + 2.9, COLUMNS[1][1] - 0.4, 0.6, 2.6, 0, 0.18), true, 0);
    put(tree, at(...on(-11.5, -11.5, -0.2), 1.3, 0.62), true, 1.6);
    for (const s of sets.values()) still(new THREE.Mesh(mergeGeometries(s.gs), new THREE.MeshBasicMaterial({ map: s.mat.map, vertexColors: true, alphaTest: s.mat.alphaTest || 0, side: s.mat.side })), s.heavy ? extra : group);
  }).catch(err => console.warn('The cavern\'s things did not load', err)).then(() => {
    // the dark on the ground under each thing that stands
    const cv = document.createElement('canvas'); cv.width = cv.height = 64; const x = cv.getContext('2d'), q = x.createRadialGradient(32, 32, 4, 32, 32, 32); q.addColorStop(0, 'rgba(0,0,0,1)'); q.addColorStop(0.5, 'rgba(0,0,0,0.6)'); q.addColorStop(1, 'rgba(0,0,0,0)'); x.fillStyle = q; x.fillRect(0, 0, 64, 64);
    for (const s of shades) if (s[2] > 0.25 && s[3] < 29) blobs.push([s[0], s[1], s[2] * 2.4]);
    const gs = blobs.map(([bx, bz, r]) => new THREE.PlaneGeometry(r * 2, r * 2).rotateX(-Math.PI / 2).translate(bx, floorAt(bx, bz) + 0.05, bz));
    still(new THREE.Mesh(mergeGeometries(gs), new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(cv), transparent: true, opacity: 0.62, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2 }))).renderOrder = 2; });

  const fires = EMBERS.map(([x, z]) => new THREE.Vector3(x, floorAt(x, z) + 0.5, z));
  return { group, ready, extra, fires, water: new THREE.Vector3(LAKE[0] + 9, GROUND, LAKE[1]), haze: 0x030405, light: 0.36,
    quality(xr) { extra.visible = !xr; }, tick(now) { t.value = now; dust.rotation.y = now * 0.012; } };
}
