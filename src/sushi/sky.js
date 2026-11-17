// the sky over the village, after THE MARKET's (src/132-sky.js): its colours by the sun's height (horizon, middle, zenith, the side toward the sun and away from it), the sun's disc and halo, the moon lit on the side that faces the sun, the stars turned by the sidereal time over Edo, and clouds drifting at the weather's cover (a baked picture read twice, so it costs the headset little); nothing in it twinkles or flickers
import * as THREE from 'three';
import * as E from './ephem.js';

const cl = (v) => Math.max(0, Math.min(1, v));
// THE MARKET's sky through the day, by the sun's height: [height, horizon, middle, zenith, toward the sun, away from it]
const P = [[-90, 0x1a2234, 0x141a28, 0x0c101c, 0x1a2234, 0x1a2234], [-18, 0x1e2838, 0x161e2e, 0x0e1424, 0x222c40, 0x1e2838], [-12, 0x2e3450, 0x1c2238, 0x10162a, 0x3a3048, 0x262c44],
  [-6, 0x3c4070, 0x1f2a58, 0x0f1838, 0x8a4a40, 0x2a3060], [-2.5, 0x8a6a80, 0x4a4a84, 0x1e2a58, 0xe8703a, 0x6a5878], [0, 0xd89070, 0x8a7aa0, 0x2e4078, 0xff8a3a, 0xb888a0],
  [3, 0xf0b070, 0x98aed0, 0x3c62a8, 0xffb050, 0xb4bede], [8, 0xc8d4e0, 0x9ec2ea, 0x4a84d0, 0xd8d4d0, 0xb0c4dc], [16, 0xc4d4e4, 0x88b8ea, 0x3f7fd8, 0xc8d8e8, 0xbcd0e4], [90, 0xc0d2e4, 0x7aaee6, 0x3270d0, 0xc0d2e4, 0xc0d2e4]];
const SUN = [[-2, 0xff4a20], [0, 0xff6428], [3, 0xff8c3a], [8, 0xffc070], [20, 0xfff0d0], [90, 0xfff8ee]];
// the brightest stars (right ascension, declination, magnitude) and the Dipper, so the sky over Edo is its own; the rest a faint field thickest along the Milky Way
const BRIGHT = [[101.29, -16.72, -1.4], [279.23, 38.78, 0], [213.92, 19.18, -0.1], [79.17, 45.99, 0.1], [78.63, -8.2, 0.1], [114.83, 5.22, 0.4], [88.79, 7.41, 0.5], [297.7, 8.87, 0.8], [68.98, 16.51, 0.9], [247.35, -26.43, 1],
  [201.3, -11.16, 1], [116.33, 28.03, 1.1], [310.36, 45.28, 1.25], [152.09, 11.97, 1.35], [37.95, 89.26, 2], [165.93, 61.75, 1.8], [165.46, 56.38, 2.4], [178.46, 53.69, 2.4], [183.86, 57.03, 3.3], [193.51, 55.96, 1.8], [200.98, 54.93, 2.2], [206.89, 49.31, 1.9],
  [263.73, 12.56, 2.1], [10.9, 56.54, 2.2], [14.18, 60.72, 2.5], [2.29, 59.15, 2.3], [21.45, 60.24, 2.7], [28.6, 63.67, 3.4], [83.0, -0.3, 2.2], [84.05, -1.2, 1.7], [85.19, -1.94, 1.8], [81.28, 6.35, 1.6], [86.94, -9.67, 2.1], [56.87, 24.1, 2.9], [186.65, -63.1, 0.8], [252.17, -69.03, 1.9], [233.67, 26.71, 2.2], [222.68, 74.16, 2.1], [326.05, 9.88, 2.4], [345.94, 28.08, 2.4], [346.19, 15.2, 2.5], [3.31, 15.18, 2.8]];

const CLD = (() => { // a tiling cloud picture: soft fractal noise, made once
  const N = 256, d = new Uint8Array(N * N * 4), h = (x, y, s) => { let n = Math.imul(x | 0, 374761393) + Math.imul(y | 0, 668265263) + Math.imul(s | 0, 2246822519); n = Math.imul(n ^ (n >>> 13), 1274126177); return ((n ^ (n >>> 16)) >>> 0) / 4294967296; };
  const vn = (x, y, p, s) => { const xi = Math.floor(x), yi = Math.floor(y), fx = x - xi, fy = y - yi, u = fx * fx * (3 - 2 * fx), v = fy * fy * (3 - 2 * fy), m = (k) => ((k % p) + p) % p; const a = h(m(xi), m(yi), s), b = h(m(xi + 1), m(yi), s), c = h(m(xi), m(yi + 1), s), e = h(m(xi + 1), m(yi + 1), s); return a + (b - a) * u + (c - a) * v + (a - b - c + e) * u * v; };
  for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) { let t = 0, a = 0.5, f = 4, n = 0; for (let o = 0; o < 5; o++) { t += a * vn((x / N) * f, (y / N) * f, f, 7 + o * 13); n += a; a *= 0.5; f *= 2; } const v = Math.round(cl((t / n - 0.2) / 0.62) * 255); d.set([v, v, v, 255], (y * N + x) * 4); }
  const t = new THREE.DataTexture(d, N, N); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.magFilter = THREE.LinearFilter; t.minFilter = THREE.LinearMipmapLinearFilter; t.generateMipmaps = true; t.needsUpdate = true; return t;
})();
const CLOUD = `uniform sampler2D uCld; uniform float uCov, uT;
  float cloudAt(vec3 d, out float n) { vec2 uv = d.xz / (d.y + 0.1) * 0.22 + vec2(uT * 0.0016, uT * 0.0006);
    n = texture2D(uCld, uv).r * 0.68 + texture2D(uCld, uv * 2.7 + 0.37).r * 0.32; return smoothstep(uCov, uCov + 0.26, n) * smoothstep(0.0, 0.1, d.y); }`;

export function buildSky(scene) {
  const U = { uH: { value: new THREE.Color() }, uM: { value: new THREE.Color() }, uZ: { value: new THREE.Color() }, uS: { value: new THREE.Color() }, uA: { value: new THREE.Color() }, uSideK: { value: 1 },
    uSunDir: { value: new THREE.Vector3(0, 1, 0) }, uSunCol: { value: new THREE.Color() }, uSunK: { value: 0 }, uSunR: { value: 0.03 }, uMoonDir: { value: new THREE.Vector3(0, 1, 0) }, uMoonK: { value: 0 }, uMoonR: { value: 0.022 },
    uFogC: { value: new THREE.Color() }, uFogK: { value: 0.6 }, uGrey: { value: new THREE.Color() }, uGreyK: { value: 0 }, uCld: { value: CLD }, uCov: { value: 0.7 }, uT: { value: 0 }, uLit: { value: new THREE.Color() }, uShade: { value: new THREE.Color() } };
  const mat = new THREE.ShaderMaterial({ uniforms: U, side: THREE.BackSide, depthWrite: false, fog: false,
    vertexShader: 'varying vec3 vD; void main(){ vD = position; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
    fragmentShader: `uniform vec3 uH, uM, uZ, uS, uA, uSunDir, uSunCol, uMoonDir, uFogC, uGrey, uLit, uShade; uniform float uSideK, uSunK, uSunR, uMoonK, uMoonR, uFogK, uGreyK; varying vec3 vD;
      ${CLOUD}
      void main(){ vec3 d = normalize(vD); float el = max(d.y, 0.0); vec2 hz = normalize(d.xz + vec2(1e-4, 0.0)), sh = normalize(uSunDir.xz + vec2(1e-4, 0.0)); float cs = dot(hz, sh);
        vec3 c = mix(uH, uM, smoothstep(0.0, 0.3, el)); c = mix(c, uZ, smoothstep(0.2, 0.85, el));
        c = mix(c, uS, pow(max(cs, 0.0), 3.0) * exp(-el * 5.0) * uSideK); c = mix(c, uA, pow(max(-cs, 0.0), 2.0) * exp(-el * 6.0) * uSideK * 0.7);
        c *= 1.0 - clamp(-d.y * 2.0, 0.0, 1.0) * 0.5;
        { float a = acos(clamp(dot(d, uMoonDir), -1.0, 1.0)); c += vec3(0.5, 0.56, 0.7) * exp(-a * 9.0) * 0.07 * uMoonK;
          if (a < uMoonR * 1.2) { vec3 t1 = normalize(cross(uMoonDir, vec3(0.0, 1.0, 0.0))), t2 = cross(uMoonDir, t1); vec2 q = vec2(dot(d, t1), dot(d, t2)) / uMoonR; float r2 = dot(q, q);
            vec3 n = q.x * t1 + q.y * t2 - sqrt(max(0.0, 1.0 - r2)) * uMoonDir; float lit = smoothstep(-0.08, 0.08, dot(n, uSunDir)), mar = 0.82 + 0.3 * (texture2D(uCld, q * 0.21 + 0.3).r - 0.5);
            vec3 mc = vec3(0.86, 0.88, 0.92) * mar; c = mix(c, mix(c + mc * 0.05, mc * 1.6, lit), smoothstep(1.0, 0.92, sqrt(r2)) * uMoonK); } }
        { float a = acos(clamp(dot(d, uSunDir), -1.0, 1.0)); c = mix(c, mix(uSunCol, vec3(1.0, 0.96, 0.9), 0.45), (1.0 - smoothstep(uSunR, uSunR * 5.0, a)) * 0.4 * uSunK); c += uSunCol * exp(-a * 3.0) * 0.12 * uSunK; c = mix(c, uSunCol * 2.4, smoothstep(uSunR, uSunR * 0.85, a) * uSunK); }
        c = mix(c, uGrey, uGreyK * smoothstep(-0.02, 0.2, d.y));
        if (d.y > -0.02) { float n, n2; float D = cloudAt(d, n); if (D > 0.002) { cloudAt(normalize(d + uSunDir * 0.06), n2);
            float lit = clamp(0.55 + (n - n2) * 2.6, 0.0, 1.0); vec3 cc = mix(uShade, uLit, lit); float sp = max(dot(d, uSunDir), 0.0); cc += uSunCol * (1.0 - D) * (pow(sp, 10.0) * 0.9 + pow(sp, 3.0) * 0.2) * uSunK;
            cc = mix(cc, c, (1.0 - smoothstep(0.0, 0.25, el)) * 0.55); c = mix(c, cc, D); } }
        c = mix(c, uFogC, uFogK * (1.0 - smoothstep(0.0, 0.16, el)));
        gl_FragColor = vec4(c, 1.0);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }` });
  const dome = new THREE.Mesh(new THREE.SphereGeometry(400, 32, 16), mat); dome.renderOrder = -10; dome.frustumCulled = false; Object.assign(dome.userData, { nopick: true, dyn: true }); scene.add(dome);
  // the stars: points on the celestial sphere, turned as the night goes by the matrix from the sky's coordinates to the village's
  const R = (() => { let s = 1862; return () => { s = (s * 16807) % 2147483647; return s / 2147483647; }; })(), pos = [], mag = [];
  const eq = (ra, dec) => { const a = ra * Math.PI / 180, b = dec * Math.PI / 180; return [Math.cos(b) * Math.cos(a), Math.cos(b) * Math.sin(a), Math.sin(b)]; };
  for (const [ra, dec, m] of BRIGHT) { pos.push(...eq(ra, dec)); mag.push(m); }
  for (let i = 0; i < 1500; i++) { let ra = R() * 360, dec = Math.asin(R() * 2 - 1) * 180 / Math.PI; if (R() < 0.45) { const t = R() * 360, gl = (R() - 0.5) * 18; ra = (266 + t + 360) % 360; dec = -29 + 92 * Math.sin(t * Math.PI / 180) * 0.68 + gl; dec = Math.max(-89, Math.min(89, dec)); }   // (roughly the galaxy's band)
    pos.push(...eq(ra, dec)); mag.push(3.2 + R() * 2.8); }
  const sg = new THREE.BufferGeometry(); sg.setAttribute('position', new THREE.Float32BufferAttribute(pos.map((v) => v * 380), 3)); sg.setAttribute('mag', new THREE.Float32BufferAttribute(mag, 1));
  const SU = { uK: { value: 0 }, uCld: U.uCld, uCov: U.uCov, uT: U.uT, uPx: { value: 1 } };
  const stars = new THREE.Points(sg, new THREE.ShaderMaterial({ uniforms: SU, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, fog: false,
    vertexShader: 'attribute float mag; uniform float uPx; varying float vB; varying vec3 vD; void main(){ vD = (modelMatrix * vec4(position, 0.0)).xyz; vB = clamp(pow(2.512, 2.0 - mag) * 0.5, 0.06, 1.6); gl_PointSize = uPx * (1.4 + clamp(1.6 - mag * 0.45, 0.0, 1.8)); gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
    fragmentShader: `uniform float uK; varying float vB; varying vec3 vD; ${CLOUD}
      void main(){ vec2 p = gl_PointCoord - 0.5; float r = 1.0 - smoothstep(0.15, 0.5, length(p)); vec3 d = normalize(vD); float n; float D = cloudAt(d, n);
        float k = r * vB * uK * (1.0 - D) * smoothstep(-0.02, 0.15, d.y) * (0.45 + 0.55 * smoothstep(0.0, 0.35, d.y)); gl_FragColor = vec4(vec3(0.86, 0.9, 1.0) * k, 1.0); }` }));
  stars.renderOrder = -9; stars.frustumCulled = false; stars.matrixAutoUpdate = false; stars.userData.nopick = true; scene.add(stars);
  const tc = new THREE.Color(), tc2 = new THREE.Color(), tv = new THREE.Vector3(), ax = [new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3()];
  const mixP = (e, k, out) => { let i = 0; while (i < P.length - 2 && e > P[i + 1][0]) i++; const A = P[i], B = P[i + 1], t = cl((e - A[0]) / (B[0] - A[0])); return out.setHex(A[k]).lerp(tc2.setHex(B[k]), t); };
  const sunCol = (e, out) => { let j = 0; while (j < SUN.length - 2 && e > SUN[j + 1][0]) j++; const t = cl((e - SUN[j][0]) / (SUN[j + 1][0] - SUN[j][0])); return out.setHex(SUN[j][1]).lerp(tc2.setHex(SUN[j + 1][1]), t); };
  const S = { sunDir: new THREE.Vector3(0, 1, 0), moonDir: new THREE.Vector3(0, -1, 0), e: 30, moonAlt: -10, moonLit: 0.9, horizon: new THREE.Color(), mid: new THREE.Color(), zen: new THREE.Color(), sunC: new THREE.Color() };
  // jd: the moment; w: the weather ({cloud}); fog: the land's haze colour, k how much of the horizon it takes
  S.set = (jd, w, fog, fogK) => {
    const s = E.seen('sun', jd), m = E.seen('moon', jd); E.dir(s.alt, s.az, S.sunDir); E.dir(m.alt, m.az, S.moonDir); S.e = s.alt; S.moonAlt = m.alt; S.moonLit = m.lit;
    const e = s.alt, cloud = w ? w.cloud : 0.2;
    mixP(e, 1, U.uH.value); mixP(e, 2, U.uM.value); mixP(e, 3, U.uZ.value); mixP(e, 4, U.uS.value); mixP(e, 5, U.uA.value); S.horizon.copy(U.uH.value); S.mid.copy(U.uM.value); S.zen.copy(U.uZ.value);
    U.uSideK.value = 1 - 0.6 * cl((e - 8) / 20); U.uSunDir.value.copy(S.sunDir); U.uSunR.value = 0.026 + 0.012 * (1 - cl(e / 12)); sunCol(e, U.uSunCol.value); S.sunC.copy(U.uSunCol.value);
    U.uSunK.value = cl((e + 1.5) / 1.5) * (1 - 0.85 * cl((cloud - 0.35) / 0.55));
    U.uMoonDir.value.copy(S.moonDir); const night = cl((-e + 1) / 9); U.uMoonK.value = night * cl((m.alt + 3) / 4) * (1 - 0.7 * cl((cloud - 0.4) / 0.5));
    const day = cl((e + 4) / 14); U.uGrey.value.setRGB(0.5, 0.53, 0.57).multiplyScalar(0.12 + 0.88 * day); U.uGreyK.value = cl((cloud - 0.3) * 1.1) * 0.75;
    U.uCov.value = 0.78 - cloud * 0.5; U.uLit.value.copy(U.uSunCol.value).lerp(tc.setRGB(1, 1, 1), 0.55).multiplyScalar(0.06 + 0.94 * day * day).lerp(tc.setRGB(0.05, 0.055, 0.075), (1 - day) * 0.8);
    U.uShade.value.copy(U.uH.value).lerp(U.uGrey.value, 0.5).multiplyScalar(0.55 + 0.2 * day); if (U.uMoonK.value > 0) U.uLit.value.lerp(tc.setRGB(0.12, 0.13, 0.17), U.uMoonK.value * (1 - day) * 0.6);   // (by night the clouds are lit only by the moon, and dimly)
    if (fog) U.uFogC.value.copy(fog); U.uFogK.value = fogK ?? 0.6;
    SU.uK.value = cl((-e - 7) / 8) * (1 - 0.55 * m.lit * cl(m.alt / 10)) * 1.3;
    const l = E.lst(jd); [[0, 0], [90, 0], [0, 90]].forEach(([ra, dec], i) => { const h = E.eq2hor(ra, dec, l); E.dir(h.alt, h.az, ax[i]); });
    stars.matrix.makeBasis(ax[0], ax[1], ax[2]); stars.matrixWorldNeedsUpdate = true;
    return S;
  };
  S.update = (dt, px) => { U.uT.value += dt; SU.uPx.value = px || 1; };
  S.dome = dome; S.stars = stars; S.U = U; S.cloudTex = CLD;
  return S;
}
