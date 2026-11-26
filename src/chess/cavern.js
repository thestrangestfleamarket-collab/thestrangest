// SKIRMISH TABLE's cavern, the place round a table whose map asks for it (maps.js look.place 'cavern'): a vast wet cave in the dark. A dome of rock far overhead with stalactites, a rolling floor of stalagmites and boulders, a black lake, crystals that glow, and one shaft of pale light down a hole in the roof onto the table. All of it still; its light is in each point's colour (no lamp), and the rock's wet shine is worked out from where you look. Nothing tall stands before a seat.
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
const LAKE = [17, -5, 10];
const floorAt = (x, z) => { const r = Math.hypot(x / 8.2, z / 9.2), out = Math.max(0, r - 1), d = Math.hypot(x, z), l = Math.hypot(x - LAKE[0], z - LAKE[1]) / LAKE[2];
  return GROUND + Math.min(1, out * 0.6) * (fbm(x * 0.16 + 9, 0, z * 0.16) - 0.42) * 3.2 + Math.pow(d / 34, 3) * 9 - Math.max(0, 1 - l * l) * 1.9 * Math.min(1, out); };
// what glows: [x, z, colour, reach]; the first is the roof's hole, the rest crystals
const CRYSTALS = [[-10.5, -7, [0.25, 0.85, 1], 9], [10.5, 6.5, [0.25, 0.85, 1], 8], [-13, 9, [0.55, 0.4, 1], 9], [12, -11, [0.3, 0.9, 0.95], 10], [-20, -15, [0.25, 0.85, 1], 11], [22, 14, [0.55, 0.4, 1], 11], [-9, 19, [0.3, 0.9, 0.95], 8], [8.5, -19, [0.55, 0.4, 1], 8], [25, -6, [0.25, 0.85, 1], 10]];

export function makeCavern(renderer) {
  const group = new THREE.Group(), Q = rnd(23), an = Math.min(4, renderer.capabilities.getMaxAnisotropy());
  const still = o => { o.raycast = () => {}; o.matrixAutoUpdate = false; o.frustumCulled = false; group.add(o); return o; };
  const pic = f => { const t = new THREE.TextureLoader().load(A + f); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = an; t.wrapS = t.wrapT = THREE.RepeatWrapping; return t; };
  const lamps = CRYSTALS.map(([x, z, col, reach]) => ({ p: new THREE.Vector3(x, floorAt(x, z) + 1.2, z), col, reach }));
  // the light at a point of rock, baked: a little from nowhere, the shaft from the roof's hole over the table, each crystal near it
  const v = new THREE.Vector3(), n = new THREE.Vector3(), l = new THREE.Vector3(), HOLE = new THREE.Vector3(0, CY + RY, 0);
  const light = (g, flip = 1, tint = [1, 1, 1]) => { const P = g.attributes.position, N = g.attributes.normal, col = new Float32Array(P.count * 3);
    for (let i = 0; i < P.count; i++) { v.fromBufferAttribute(P, i); n.fromBufferAttribute(N, i).multiplyScalar(flip);
      const d = Math.hypot(v.x, v.z), up = Math.max(0, v.y - 6), shaft = Math.exp(-((d / 10.5) ** 2)) * (0.35 + 0.65 * Math.max(0, n.dot(l.copy(HOLE).sub(v).normalize()))) * Math.exp(-up / 9);
      let r = 0.016 + shaft * 0.3, gr = 0.02 + shaft * 0.35, b = 0.028 + shaft * 0.42;
      const hole = v.y > CY + RY * 0.8 ? Math.max(0, 1 - Math.hypot(v.x, v.z) / 5) : 0; r += hole * 1.4; gr += hole * 1.6; b += hole * 1.8;   // the hole itself, bright
      for (const L of lamps) { const q = l.copy(L.p).sub(v), dist = q.length(); if (dist > L.reach) continue; const k = (1 - dist / L.reach) ** 2 * (0.3 + 0.7 * Math.max(0, n.dot(q.normalize()))) * 0.6; r += L.col[0] * k; gr += L.col[1] * k; b += L.col[2] * k; }
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
        vec3 c = t * vC * 1.9 + shine * wet * (0.35 + lum) * vec3(0.5, 0.62, 0.74);
        c *= 1.0 - 0.8 * smoothstep(16.0, 46.0, length(vP.xz));
        gl_FragColor = vec4(min(c, vec3(0.92)), 1.0);
        #include <colorspace_fragment>
      }` });
  const plain = g => { const o = g.index ? g.toNonIndexed() : g; for (const k of Object.keys(o.attributes)) if (!['position', 'normal'].includes(k)) o.deleteAttribute(k); return o; };

  // the floor
  { const g = new THREE.RingGeometry(0.01, 46, 72, 30).rotateX(-Math.PI / 2), P = g.attributes.position;
    for (let i = 0; i < P.count; i++) P.setY(i, floorAt(P.getX(i), P.getZ(i))); g.computeVertexNormals();
    still(new THREE.Mesh(light(plain(g)), rock(pic('board/rock.jpg'), 0.19, 0.9))); }

  // the dome and what hangs from it and stands under it: one mesh
  const parts = [];
  { const g = new THREE.SphereGeometry(1, 56, 30, 0, Math.PI * 2, 0, Math.PI * 0.62), P = g.attributes.position;
    for (let i = 0; i < P.count; i++) { v.fromBufferAttribute(P, i); const k = 1 + (fbm(v.x * 2.2 + 3, v.y * 2.2, v.z * 2.2) - 0.5) * 0.34 + (vn(v.x * 6, v.y * 6, v.z * 6) - 0.5) * 0.06; P.setXYZ(i, v.x * RX * k, CY + v.y * RY * k, v.z * RZ * k); }
    g.computeVertexNormals(); parts.push(light(plain(g), -1)); }
  const roofAt = (x, z) => CY + RY * Math.sqrt(Math.max(0.02, 1 - (x / RX) ** 2 - (z / RZ) ** 2)) * 0.9;
  const spike = (x, y, z, r, len, down) => { const g = new THREE.ConeGeometry(r, len, 6, 3), P = g.attributes.position;
    for (let i = 0; i < P.count; i++) { const k = 0.8 + Q() * 0.4; P.setX(i, P.getX(i) * k + (Q() - 0.5) * r * 0.2); P.setZ(i, P.getZ(i) * k); }
    if (down) g.rotateX(Math.PI); g.translate(x, y + (down ? -len / 2 : len / 2), z); g.computeVertexNormals(); parts.push(light(plain(g))); };
  for (let i = 0; i < 150; i++) { const a = Q() * 6.283, r = Math.sqrt(Q()) * 0.86, x = Math.sin(a) * r * RX, z = Math.cos(a) * r * RZ, len = 1.5 + Q() * Q() * 11; if (Math.hypot(x, z) < 6.5) continue; spike(x, roofAt(x, z) + 1.5, z, 0.25 + len * 0.07, len, true); }
  for (let i = 0; i < 70; i++) { const a = Q() * 6.283, r = 9.5 + Q() * 24, x = Math.sin(a) * r, z = Math.cos(a) * r * 1.1, tall = !clear(x, z) && Math.abs(x) > 8.5, h = tall ? 1 + Q() * Q() * 7 : 0.3 + Q() * 0.5; if (Math.hypot(x - LAKE[0], z - LAKE[1]) < LAKE[2] * 0.8) continue;
    spike(x, floorAt(x, z) - 0.3, z, 0.22 + h * 0.09, h + 0.3, false); }
  for (const [x, z] of [[-19, 3], [18, 17], [-24, -20], [27, -20], [-15, 26], [4, 30], [-3, -31]]) { const top = roofAt(x, z) + 1.5, bot = floorAt(x, z) - 0.4, mid = (top + bot) / 2; spike(x, top, z, 1.5, top - mid + 1.5, true); spike(x, bot, z, 1.7, mid - bot + 1.5, false); }   // columns, floor to roof
  still(new THREE.Mesh(mergeGeometries(parts), rock(pic('board/rock.jpg'), 0.11, 1)));

  // the lake: black, still, a little of the light on it
  { const g = new THREE.CircleGeometry(LAKE[2] * 1.05, 40).rotateX(-Math.PI / 2).translate(LAKE[0], GROUND - 1.05, LAKE[1]);
    still(new THREE.Mesh(g, new THREE.ShaderMaterial({ transparent: true, vertexShader: 'varying vec3 vP, vCam; void main() { vP = position; vCam = (inverse(modelMatrix) * vec4(cameraPosition, 1.0)).xyz; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
      fragmentShader: `varying vec3 vP, vCam; void main() { vec3 V = normalize(vCam - vP); float f = pow(1.0 - max(V.y, 0.0), 3.0); vec3 c = vec3(0.004, 0.008, 0.012) + f * vec3(0.05, 0.11, 0.14); gl_FragColor = vec4(c, 0.93);
        #include <colorspace_fragment>
      }` }))); }

  // the crystals and their glow in the air, and the shaft of light
  { const xs = [], glow = [];
    for (const L of lamps) { for (let i = 0; i < 6; i++) { const h = 0.7 + Q() * 2.2, g = plain(new THREE.ConeGeometry(0.14 + h * 0.09, h, 5, 1).translate(0, h / 2, 0).rotateX((Q() - 0.5) * 1.1).rotateZ((Q() - 0.5) * 1.1).translate(L.p.x + (Q() - 0.5) * 1.4, L.p.y - 1.5, L.p.z + (Q() - 0.5) * 1.4)), P = g.attributes.position, col = new Float32Array(P.count * 3);
        for (let k = 0; k < P.count; k++) { const up = Math.min(1, Math.max(0, (P.getY(k) - L.p.y + 1.5) / h)), b = 0.35 + 0.5 * up; col[k * 3] = L.col[0] * b + 0.12 * up; col[k * 3 + 1] = L.col[1] * b + 0.1 * up; col[k * 3 + 2] = L.col[2] * b + 0.08 * up; }
        g.setAttribute('color', new THREE.BufferAttribute(col, 3)); xs.push(g); }
      for (const ry of [0, Math.PI / 2]) { const g = new THREE.PlaneGeometry(6, 6).rotateY(ry).translate(L.p.x, L.p.y - 0.3, L.p.z), col = new Float32Array(12); for (let k = 0; k < 4; k++) col.set(L.col, k * 3); g.setAttribute('color', new THREE.BufferAttribute(col, 3)); glow.push(g); } }
    still(new THREE.Mesh(mergeGeometries(xs), new THREE.MeshBasicMaterial({ vertexColors: true })));
    const cv = document.createElement('canvas'); cv.width = cv.height = 64; const x = cv.getContext('2d'), q = x.createRadialGradient(32, 32, 0, 32, 32, 32); q.addColorStop(0, 'rgba(255,255,255,1)'); q.addColorStop(0.3, 'rgba(255,255,255,0.35)'); q.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = q; x.fillRect(0, 0, 64, 64);
    still(new THREE.Mesh(mergeGeometries(glow), new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(cv), vertexColors: true, transparent: true, opacity: 0.2, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide }))).renderOrder = 5;
    const rv = document.createElement('canvas'); rv.width = 64; rv.height = 128; const y = rv.getContext('2d'), g1 = y.createLinearGradient(0, 0, 64, 0); g1.addColorStop(0, 'rgba(255,255,255,0)'); g1.addColorStop(0.5, 'rgba(255,255,255,1)'); g1.addColorStop(1, 'rgba(255,255,255,0)'); y.fillStyle = g1; y.fillRect(0, 0, 64, 128);
    y.globalCompositeOperation = 'destination-in'; const g2 = y.createLinearGradient(0, 0, 0, 128); g2.addColorStop(0, 'rgba(0,0,0,1)'); g2.addColorStop(1, 'rgba(0,0,0,0.15)'); y.fillStyle = g2; y.fillRect(0, 0, 64, 128);
    const H = CY + RY - GROUND, rays = [0, 1.05, 2.1].map(ry => new THREE.PlaneGeometry(9, H).rotateY(ry).translate(0, GROUND + H / 2, 0));
    still(new THREE.Mesh(mergeGeometries(rays), new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(rv), color: 0xbcd4ee, transparent: true, opacity: 0.05, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide }))).renderOrder = 6; }

  // boulders (HULL DOWN's mossy rocks, copied by the build), when their file comes
  const ready = new Promise((ok, no) => new GLTFLoader().load(A + 'jungle/rocks.glb', ok, undefined, no)).then(s => { let src = null; s.scene.traverse(o => { if (o.isMesh && !src) src = o; });
    const rs = []; for (const [x, z, sc, ry] of [[10.5, -9.5, 0.9, 1], [-10.5, 10, 1, 4], [-12, -2, 0.6, 2.5], [14, 12, 1.3, 5]]) { const g = src.geometry.index ? src.geometry.toNonIndexed() : src.geometry.clone(); for (const k of Object.keys(g.attributes)) if (!['position', 'normal', 'uv'].includes(k)) g.deleteAttribute(k);
      rs.push(light(g.applyMatrix4(new THREE.Matrix4().compose(new THREE.Vector3(x, floorAt(x, z) - 0.1, z), new THREE.Quaternion().setFromEuler(new THREE.Euler(0, ry, 0)), new THREE.Vector3(sc, sc, sc))), 1, [2.2, 2.2, 2.2])); }
    still(new THREE.Mesh(mergeGeometries(rs), new THREE.MeshBasicMaterial({ map: src.material.map, vertexColors: true })));
  }).catch(err => console.warn('The cavern\'s boulders did not load', err));

  return { group, ready, haze: 0x030405, quality() {} };
}
