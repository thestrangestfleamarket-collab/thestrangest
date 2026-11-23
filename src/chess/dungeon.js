// SKIRMISH TABLE's place round the board: Kilnhold's ruined hall, broken open on the mountainside above the Tarnwater's gorge (baked by tools/chess-bake.cjs dungeon from photographed and scanned things: Poly Haven and ambientCG, CC0).
// All of it is unlit and nothing in it is worked out while you play. Five draws: the hall, the near ground and the gorge's far wall one mesh on one picture (the walls' stone on a picture of its own with their light in another, the things' light in each point's colour, the ground's in its own painted picture); ivy, chains and the trees' cards a second; the lava a third (its picture drifting slowly, its brightness capped);
// the waterfall, the gorge's mist and the far birds a fourth (the water's picture runs down, the mist drifts, each bird keeps its slow circle); the far country and its sky a fifth, one all-round picture at no distance, a thin layer of cloud drifting over its sky.
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

const A = '/chess-assets/dungeon/';
const R0 = 5, R1 = 46, EL0 = -35 * Math.PI / 180;   // as the bake laid the ground's picture and the far one out (tools/chess-dungeon.page.js)
export const HAZE = 0xb2bfca;                      // the far air's colour
// soft noise that tiles, for the drifting cloud; a soft dot and falling streaks for the mist and the water
function airPictures() {
  const S = 128, c = document.createElement('canvas'); c.width = c.height = S; const x = c.getContext('2d'), im = x.createImageData(S, S);
  const h = (i, j, p) => { let n = Math.imul(((i % p) + p) % p, 374761393) + Math.imul(((j % p) + p) % p, 668265263) | 0; n = Math.imul(n ^ (n >>> 13), 1274126177); return ((n ^ (n >>> 16)) >>> 0) / 4294967296; };
  const vn = (u, v, p) => { const i = Math.floor(u), j = Math.floor(v), a = u - i, b = v - j, s = a * a * (3 - 2 * a), t = b * b * (3 - 2 * b); return (h(i, j, p) * (1 - s) + h(i + 1, j, p) * s) * (1 - t) + (h(i, j + 1, p) * (1 - s) + h(i + 1, j + 1, p) * s) * t; };
  for (let j = 0; j < S; j++) for (let i = 0; i < S; i++) { const u = i / S, v = j / S, n = 0.5 * vn(u * 4, v * 4, 4) + 0.27 * vn(u * 8, v * 8, 8) + 0.15 * vn(u * 16, v * 16, 16) + 0.08 * vn(u * 32, v * 32, 32);
    const d = Math.hypot(u - 0.5, v - 0.5) * 2, dot = Math.max(0, 1 - d) ** 1.6, streak = 0.5 * vn(u * 16, v * 3, 16) + 0.3 * vn(u * 32 + 5, v * 5, 32) + 0.2 * vn(u * 64, v * 9, 64);
    im.data.set([n * 255, dot * 255, streak * 255, 255], (j * S + i) * 4); }
  x.putImageData(im, 0, 0);
  const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; return t;
}

export function makeDungeon(renderer) {
  const group = new THREE.Group(), t = { value: 0 }, an = Math.min(4, renderer.capabilities.getMaxAnisotropy());
  const pic = (name, wrap, flip = false) => { const x = new THREE.TextureLoader().load(A + name); x.flipY = flip; x.colorSpace = THREE.SRGBColorSpace; x.anisotropy = an; if (wrap) x.wrapS = x.wrapT = THREE.RepeatWrapping; return x; };
  const lava = new THREE.Mesh(new THREE.PlaneGeometry(11, 13).rotateX(-Math.PI / 2).translate(0, -0.3, 0), new THREE.ShaderMaterial({
    uniforms: { map: { value: pic('lava.jpg', true) }, t },
    vertexShader: 'varying vec2 vUv; void main() { vUv = position.xz / 3.2; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
    fragmentShader: 'uniform sampler2D map; uniform float t; varying vec2 vUv; void main() { vec3 a = texture2D(map, vUv + vec2(t * 0.006, t * 0.004)).rgb, b = texture2D(map, vUv * 1.37 + vec2(-t * 0.005, t * 0.007)).rgb; gl_FragColor = vec4(vec3(0.03, 0.018, 0.016) + min((a + b) * vec3(0.5, 0.3, 0.2), vec3(0.62, 0.3, 0.12)), 1.0);\n#include <colorspace_fragment>\n}',
  }));
  const airPic = airPictures(), still = o => { o.raycast = () => {}; o.matrixAutoUpdate = false; o.frustumCulled = false; };
  // the far country: drawn where nothing else is, as far away as can be, turning with the board but never nearer
  const far = pic('pano.jpg', false, true), mask = pic('mask.jpg', false, true);
  for (const x of [far, mask]) { x.wrapS = THREE.RepeatWrapping; x.generateMipmaps = false; x.minFilter = THREE.LinearFilter; x.anisotropy = 1; }
  const sky = new THREE.Mesh(new THREE.BoxGeometry(2, 2, 2), new THREE.ShaderMaterial({ side: THREE.BackSide, depthWrite: false, uniforms: { map: { value: far }, mask: { value: mask }, cloud: { value: airPic }, t },
    vertexShader: 'varying vec3 vD; void main() { vD = position; gl_Position = projectionMatrix * vec4(mat3(modelViewMatrix) * position, 1.0); gl_Position.z = gl_Position.w * 0.99999; }',
    fragmentShader: `uniform sampler2D map, mask, cloud; uniform float t; varying vec3 vD;
void main() { vec3 d = normalize(vD); vec2 uv = vec2(atan(d.z, d.x) / 6.2831853 + 0.5, clamp((asin(clamp(d.y, -1.0, 1.0)) - (${EL0.toFixed(6)})) / ${(Math.PI / 2 - EL0).toFixed(6)}, 0.002, 0.998));
  vec3 c = texture2D(map, uv).rgb; vec2 q = d.xz / max(d.y + 0.14, 0.06);
  float n = texture2D(cloud, q * 0.045 + t * vec2(0.0011, 0.0004)).r * 0.62 + texture2D(cloud, q * 0.11 + t * vec2(0.0017, -0.0003)).r * 0.38;
  float a = smoothstep(0.5, 0.74, n) * texture2D(mask, uv).r * smoothstep(0.03, 0.24, d.y) * 0.5;
  gl_FragColor = vec4(mix(c, vec3(0.8, 0.82, 0.84), a), 1.0);
  #include <colorspace_fragment>
}` }));
  still(sky); sky.renderOrder = 5; sky.visible = false;
  still(lava); lava.visible = false;
  group.add(lava, sky);
  const out = { group, lava, sky, air: null, ready: false, tris: 0, tick(now) { t.value = now; } };
  new GLTFLoader().loadAsync(A + 'dungeon.glb').then(g => {
    const stone = pic('stone.webp'), light = pic('light.webp'); stone.wrapS = THREE.RepeatWrapping; light.generateMipmaps = false; light.minFilter = THREE.LinearFilter; light.anisotropy = 1;
    const mats = {
      // a point's alpha says where its light is: in its own colour (the hall's things), in the ground's picture, found from where the point is, or (the walls, on the stone picture) in the light picture
      dungeon: new THREE.ShaderMaterial({ vertexColors: true, uniforms: { map: { value: pic('atlas.jpg') }, land: { value: pic('land.jpg', false, true) }, stone: { value: stone }, light: { value: light } },
        vertexShader: 'attribute vec2 uv1; varying vec2 vUv, vUv1, vQ; varying vec4 vC; void main() { vUv = uv; vUv1 = uv1; vC = color; vQ = position.xz; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
        fragmentShader: `uniform sampler2D map, land, stone, light; varying vec2 vUv, vUv1, vQ; varying vec4 vC;
void main() { vec3 c;
  if (vC.a > 0.75) c = texture2D(map, vUv).rgb * vC.rgb;
  else if (vC.a > 0.25) c = texture2D(stone, vUv).rgb * texture2D(light, vUv1).rgb * vC.rgb;
  else { float m = max(max(abs(vQ.x), abs(vQ.y)), ${R0}.0); c = texture2D(map, vUv).rgb * texture2D(land, 0.5 + 0.5 * vQ / m * min(1.0, log(m / ${R0}.0) / ${Math.log(R1 / R0).toFixed(6)})).rgb; }
  gl_FragColor = vec4(c, 1.0);
  #include <colorspace_fragment>
}` }),
      ivy: new THREE.MeshBasicMaterial({ map: pic('leaf.webp'), vertexColors: true, alphaTest: 0.5, side: THREE.DoubleSide }),
      air: new THREE.ShaderMaterial({ vertexColors: true, transparent: true, depthWrite: false, side: THREE.DoubleSide, uniforms: { map: { value: airPic }, t },
        vertexShader: `attribute vec4 _move; attribute vec3 _cen; uniform float t; varying vec2 vUv; varying vec4 vC; varying float vK;
void main() { vec3 p = position; vUv = uv; vC = color; vK = _move.x;
  if (_move.x > 1.5) { float a = _move.y + t * _move.w, s = sign(_move.w); vec3 r = vec3(cos(a), 0.0, sin(a)), f = vec3(-sin(a), 0.0, cos(a)) * s; p = _cen + r * (_move.z + position.x * s) + f * position.z + vec3(0.0, position.y - position.x * s * 0.2, 0.0); }
  else if (_move.x > 0.5) { p.z += sin(t * _move.w + _move.y) * _move.z; p.y += cos(t * _move.w * 0.7 + _move.y) * _move.z * 0.2; }
  else vUv.y -= t * 0.035 * _move.w;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0); }`,
        fragmentShader: `uniform sampler2D map; varying vec2 vUv; varying vec4 vC; varying float vK;
void main() { vec4 c = vC;
  if (vK < 0.5) { float s = texture2D(map, vUv).b * 0.6 + texture2D(map, vUv * vec2(0.5, 1.7) + 0.31).b * 0.4; c.rgb *= 0.86 + 0.2 * s; c.a *= smoothstep(0.0, 0.3, vUv.x) * smoothstep(1.0, 0.7, vUv.x) * (0.5 + 0.7 * s); }
  else if (vK < 1.5) c.a *= texture2D(map, vUv).g;
  gl_FragColor = c;
  #include <colorspace_fragment>
}` }),
    };
    const meshes = []; g.scene.traverse(o => { if (o.isMesh && mats[o.name]) meshes.push(o); });
    for (const o of meshes) { o.material = mats[o.name]; still(o); out.tris += (o.geometry.index ? o.geometry.index.count : o.geometry.attributes.position.count) / 3; group.add(o); if (o.name === 'air') { o.renderOrder = 4; out.air = o; } }
    out.tris += 14; lava.visible = sky.visible = true; out.ready = true;
  }).catch(err => console.warn('The dungeon failed to load; the board stands alone.', err));
  return out;
}
