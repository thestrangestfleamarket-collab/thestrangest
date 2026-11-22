// SKIRMISH TABLE's clouds, after RAMEN's sky (../sushi/sky.js): one baked picture of soft noise, read by the sky's dome over a landscaped map (lit from the sun's side, dark beneath) and, a vertex at a time, for the shade the same clouds lay on the ground as they drift; nothing in it flickers
import * as THREE from 'three';

const cl = v => Math.min(1, Math.max(0, v));
let CLD = null;
function picture() {   // a tiling cloud picture: soft fractal noise, made once
  if (CLD) return CLD;
  const N = 256, d = new Uint8Array(N * N * 4), h = (x, y, s) => { let n = Math.imul(x | 0, 374761393) + Math.imul(y | 0, 668265263) + Math.imul(s | 0, 2246822519); n = Math.imul(n ^ (n >>> 13), 1274126177); return ((n ^ (n >>> 16)) >>> 0) / 4294967296; };
  const vn = (x, y, p, s) => { const xi = Math.floor(x), yi = Math.floor(y), fx = x - xi, fy = y - yi, u = fx * fx * (3 - 2 * fx), v = fy * fy * (3 - 2 * fy), m = k => ((k % p) + p) % p; const a = h(m(xi), m(yi), s), b = h(m(xi + 1), m(yi), s), c = h(m(xi), m(yi + 1), s), e = h(m(xi + 1), m(yi + 1), s); return a + (b - a) * u + (c - a) * v + (a - b - c + e) * u * v; };
  for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) { let t = 0, a = 0.5, f = 4, n = 0; for (let o = 0; o < 5; o++) { t += a * vn((x / N) * f, (y / N) * f, f, 7 + o * 13); n += a; a *= 0.5; f *= 2; } const v = Math.round(cl((t / n - 0.2) / 0.62) * 255); d.set([v, v, v, 255], (y * N + x) * 4); }
  CLD = new THREE.DataTexture(d, N, N); CLD.wrapS = CLD.wrapT = THREE.RepeatWrapping; CLD.magFilter = THREE.LinearFilter; CLD.minFilter = THREE.LinearMipmapLinearFilter; CLD.generateMipmaps = true; CLD.needsUpdate = true;
  return CLD;
}

const TILE = 1 / 56, HIGH = 24;   // the picture repeats every 56 tiles; the layer hangs 24 tiles up
// uCl: the picture's scale on the ground, how far it has drifted (x, z), how dark its shade is (0: no clouds, the plain board); uClC: where cloud begins; uBoard: the room to the board's own space
export const CLOUD = { uCld: { value: null }, uCl: { value: new THREE.Vector4(TILE, 0, 0, 0) }, uClC: { value: 0.5 }, uBoard: { value: new THREE.Matrix4() } };
const V_PARS = 'uniform sampler2D uCld; uniform vec4 uCl; uniform float uClC; uniform mat4 uBoard; varying float vCl;\n';
const V_MAIN = `{ vec4 cw = vec4(transformed, 1.);
  #ifdef USE_INSTANCING
  cw = instanceMatrix * cw;
  #endif
  cw = uBoard * (modelMatrix * cw);
  vCl = 1. - uCl.w * smoothstep(uClC, uClC + .3, texture2D(uCld, cw.xz * uCl.x + uCl.yz).r); }
`;
// the clouds' shade on a material, with whatever its own onBeforeCompile does: read at each vertex, so a pixel pays one multiply
const shaded = new WeakSet();
export function shade(mat) {
  if (shaded.has(mat)) return mat;
  shaded.add(mat);
  const before = mat.onBeforeCompile, key = mat.customProgramCacheKey;
  mat.onBeforeCompile = (s, r) => {
    before.call(mat, s, r); Object.assign(s.uniforms, CLOUD);
    s.vertexShader = s.vertexShader.replace('#include <common>', '#include <common>\n' + V_PARS).replace('#include <project_vertex>', '#include <project_vertex>\n' + V_MAIN);
    s.fragmentShader = s.fragmentShader.replace('#include <common>', '#include <common>\nvarying float vCl;').replace('#include <alphatest_fragment>', 'diffuseColor.rgb *= vCl;\n#include <alphatest_fragment>');
  };
  mat.customProgramCacheKey = () => key.call(mat) + '+cloud';
  return mat;
}
// for a shader of its own (the water): the cloud over a point of the ground, and the cloud a ray from near the ground meets
export const CLOUD_GLSL = `uniform sampler2D uCld; uniform vec4 uCl; uniform float uClC;
float cloudOver(vec2 p) { return smoothstep(uClC, uClC + .3, texture2D(uCld, p * uCl.x + uCl.yz).r); }
float cloudAlong(vec3 d) { return smoothstep(uClC, uClC + .22, texture2D(uCld, d.xz / (d.y + .14) * ${(HIGH * TILE).toFixed(4)} + uCl.yz).r) * smoothstep(0., .1, d.y); }
`;

// cover 0..1 and the shade's depth; null for no clouds
export function setClouds(cover, depth) {
  CLOUD.uCld.value = picture();
  CLOUD.uClC.value = 0.72 - (cover || 0) * 0.4; CLOUD.uCl.value.w = depth || 0;
}
// wind: the wind's x and z; board: the board's matrixWorld
export function driftClouds(dt, wind, board) {
  const u = CLOUD.uCl.value; u.y -= wind.x * dt * 0.3 * TILE; u.z -= wind.y * dt * 0.3 * TILE;
  if (board) CLOUD.uBoard.value.copy(board).invert();
}

// the sky: a dome round the eye, the hour's colours by height, the sun's glow, and the cloud layer the shade is read from
export function makeSky(look) {
  const c = v => new THREE.Color(v), sun = c(look.sun[0]), k = Math.min(1, look.sun[1] / 3);
  const U = { ...CLOUD, uZ: { value: c(look.sky[0]) }, uM: { value: c(look.sky[1]) }, uH: { value: c(look.sky[2]) }, uSun: { value: new THREE.Vector3(...look.dir).normalize() },
    uSunC: { value: sun.clone().multiplyScalar(k) }, uLit: { value: sun.clone().lerp(c(0xffffff), 0.6).multiplyScalar(0.25 + 0.75 * k) },
    uDark: { value: c(look.sky[1]).lerp(c(look.sky[0]), 0.5).lerp(c(0x60646c), 0.35).multiplyScalar(0.3 + 0.4 * k) }, uFogC: { value: c(look.fog[0]) } };
  const mat = new THREE.ShaderMaterial({ uniforms: U, side: THREE.BackSide, depthWrite: false, toneMapped: false, defines: { FINE: 1 },
    vertexShader: 'varying vec3 vD; void main(){ vD = position; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.); }',
    fragmentShader: `uniform sampler2D uCld; uniform vec4 uCl; uniform float uClC; uniform vec3 uZ, uM, uH, uSun, uSunC, uLit, uDark, uFogC; varying vec3 vD;
float puff(vec2 uv) {
  #if FINE
  return texture2D(uCld, uv).r * .62 + texture2D(uCld, uv * 2.7 + .37).r * .27 + texture2D(uCld, uv * 6.3 + .71).r * .11;
  #else
  return texture2D(uCld, uv).r * .7 + texture2D(uCld, uv * 2.7 + .37).r * .3;
  #endif
}
void main(){
  vec3 d = normalize(vD); float el = d.y, sd = max(dot(d, uSun), 0.);
  vec3 col = mix(uH, uM, smoothstep(0., .22, el)); col = mix(col, uZ, smoothstep(.15, .8, el));
  col += uSunC * (pow(sd, 5.) * .1 + pow(sd, 40.) * .22);
  float disc = smoothstep(.9992, .9996, dot(d, uSun));
  if (el > -.02) {
    vec2 uv = d.xz / (el + .14) * ${(HIGH * TILE).toFixed(4)} + uCl.yz;
    float n = puff(uv), D = smoothstep(uClC, uClC + .2, n) * smoothstep(-.02, .1, el);
    col = mix(col, uSunC * 3. + .2, disc * (1. - D));
    if (D > .003) {
      vec2 to = normalize(uSun.xz + 1e-4) * .03;   // toward the sun through the layer: what stands in its light's way
      float thick = max(n - uClC, 0.), way = max(puff(uv + to) - uClC, 0.);
      #if FINE
      way = way * .6 + max(puff(uv + to * 2.6) - uClC, 0.) * .5;
      #endif
      float lit = exp(-way * 7.) * (1. - .55 * smoothstep(.05, .4, thick));   // thick cloud is dark beneath
      vec3 cc = mix(uDark, uLit, clamp(lit + .08, 0., 1.));
      cc += uSunC * pow(sd, 8.) * (1. - D) * .8;   // its thin edges shine toward the sun
      cc = mix(cc, col, (1. - smoothstep(0., .25, el)) * .65);
      col = mix(col, cc, D);
    }
    col = mix(col, uFogC, .5 * (1. - smoothstep(0., .12, el)));
  } else col = mix(uH, uFogC, .5) * (1. - .5 * smoothstep(0., -.9, el));   // under the horizon the far haze, as the land's own fog has it
  gl_FragColor = vec4(col, 1.);
  #include <colorspace_fragment>
}` });
  const dome = new THREE.Mesh(new THREE.SphereGeometry(140, 32, 16), mat);
  dome.renderOrder = 10; dome.frustumCulled = false; dome.raycast = () => {};
  dome.userData.fine = on => { if (mat.defines.FINE !== (on ? 1 : 0)) { mat.defines.FINE = on ? 1 : 0; mat.needsUpdate = true; } };
  return dome;
}
