// STADIUM JAM's venue: night sky, bowl, stage, rigging, light show, haze and an animated instanced crowd.
import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { drawnTexture, fbm } from './textures.js';

// Player stations on stage (x, z). Everyone faces the crowd (-Z).
export const SLOTS = [[-2, -1], [2, -1], [-6, -1.5], [6, -1.5], [0, 2.8], [-4.5, 2.8], [4.5, 2.8], [-9.5, -0.5]];

const FIELD_Y = -2.2;
const CZ = -46, A0 = 52, B0 = 44; // bowl centre and inner radii
const THETA0 = Math.PI - Math.asin(0.886); // stands are open behind the stage
const THETA_SPAN = Math.PI * 2 - (Math.PI - 2 * Math.asin(0.886));
const TIER1 = { rows: 18, off: 0, y: -1.0, depth: 0.8, rise: 0.42 };
const TIER2 = { rows: 24, off: 18 * 0.8 + 2.5, y: -1.0 + 18 * 0.42 + 2.4, depth: 0.75, rise: 0.56 };
const T2_OUT = TIER2.off + TIER2.rows * TIER2.depth, T2_TOP = TIER2.y + TIER2.rows * TIER2.rise;
export const MOON_DIR = new THREE.Vector3(-0.38, 0.5, -0.78).normalize();

const rep = (set, x, y) => {
  const out = {};
  for (const k in set) { out[k] = set[k].clone(); out[k].repeat.set(x, y); }
  return out;
};

function glowTexture() {
  return drawnTexture(128, 128, (g) => {
    const grad = g.createRadialGradient(64, 64, 0, 64, 64, 64);
    grad.addColorStop(0, 'rgba(255,255,255,1)');
    grad.addColorStop(0.12, 'rgba(255,255,255,0.8)');
    grad.addColorStop(0.4, 'rgba(255,255,255,0.14)');
    grad.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = grad;
    g.fillRect(0, 0, 128, 128);
  });
}

function smokeTexture() {
  return drawnTexture(128, 128, (g) => {
    const img = g.createImageData(128, 128);
    for (let y = 0; y < 128; y++) for (let x = 0; x < 128; x++) {
      const u = x / 128, v = y / 128, r = Math.hypot(u - 0.5, v - 0.5) * 2;
      const n = fbm(u, v, 4, 4, 4, 5);
      const a = Math.max(0, 1 - r) ** 1.5 * Math.min(1, n * 1.9);
      img.data.set([255, 255, 255, a * 255], (y * 128 + x) * 4);
    }
    g.putImageData(img, 0, 0);
  });
}

// ---------- sky ----------
function buildSky(scene, low, uniforms) {
  const sky = new THREE.Mesh(
    new THREE.SphereGeometry(900, 48, 24),
    new THREE.ShaderMaterial({
      side: THREE.BackSide, depthWrite: false, fog: false,
      uniforms: { uTime: uniforms.uTime, uFlash: uniforms.uFlash, uMoon: { value: MOON_DIR } },
      defines: { OCT: low ? 3 : 5 },
      vertexShader: 'varying vec3 vD; void main(){ vD = position; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.); }',
      fragmentShader: `
        varying vec3 vD; uniform float uTime; uniform vec3 uFlash; uniform vec3 uMoon;
        float h3(vec3 p){ p = fract(p * 0.3183099 + 0.1); p *= 17.0; return fract(p.x * p.y * p.z * (p.x + p.y + p.z)); }
        float h2(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
        float n2(vec2 p){ vec2 i = floor(p), f = fract(p); f = f*f*(3.-2.*f);
          return mix(mix(h2(i), h2(i+vec2(1,0)), f.x), mix(h2(i+vec2(0,1)), h2(i+vec2(1,1)), f.x), f.y); }
        float fbm(vec2 p){ float s = 0., a = .5; for (int i = 0; i < OCT; i++){ s += a * n2(p); p = p * 2.03 + 7.1; a *= .5; } return s; }
        vec3 stars(vec3 d){
          vec3 col = vec3(0.);
          for (int i = 0; i < 2; i++){
            float sc = i == 0 ? 130. : 240.;
            vec3 p = d * sc, ip = floor(p), fp = fract(p) - .5;
            float h = h3(ip + float(i) * 17.);
            vec3 off = (vec3(h3(ip + 1.3), h3(ip + 2.7), h3(ip + 4.1)) - .5) * .4;
            float star = smoothstep(.28, .0, length(fp - off)) * step(.972, h);
            float tw = .65 + .35 * sin(uTime * (1. + h * 5.) + h * 60.);
            col += star * star * tw * mix(vec3(1., .82, .65), vec3(.7, .82, 1.), h3(ip + 9.1)) * (.5 + 2.2 * h3(ip + 5.5));
          }
          return col;
        }
        void main(){
          vec3 d = normalize(vD);
          float h = d.y;
          vec3 col = mix(vec3(0.045, 0.05, 0.095), vec3(0.004, 0.007, 0.022), smoothstep(-0.05, 0.6, h));
          // milky way
          float band = exp(-pow(dot(d, normalize(vec3(0.5, 0.35, 0.8))) * 3.5, 2.));
          float mw = band * fbm(d.xz * 5. + d.y * 3.);
          col += vec3(0.05, 0.055, 0.08) * mw * mw * 2.2;
          vec3 st = stars(d) * (0.6 + band);
          // moon
          float md = dot(d, uMoon);
          float disc = smoothstep(0.99962, 0.99972, md);
          vec2 mp = (d - uMoon).xy * 60.;
          vec3 moon = vec3(1.0, 0.96, 0.86) * (0.75 + 0.35 * n2(mp * 2.5) - 0.25 * n2(mp * 0.8 + 3.)) * 2.2;
          float halo = pow(max(md, 0.), 900.) * 0.6 + pow(max(md, 0.), 60.) * 0.12 + pow(max(md, 0.), 8.) * 0.04;
          // thin drifting cloud
          vec2 cuv = d.xz / (max(h, 0.) + 0.22);
          float c = smoothstep(0.42, 0.85, fbm(cuv * 1.3 + vec2(uTime * 0.006, uTime * 0.002))) * smoothstep(0.0, 0.18, h);
          vec3 cloudCol = vec3(0.035, 0.04, 0.065) + vec3(0.5, 0.52, 0.6) * pow(max(md, 0.), 14.) * 0.5
            + vec3(0.32, 0.2, 0.12) * exp(-max(h, 0.) * 5.) + uFlash * 0.5;
          col += st * (1. - c);
          col = mix(col, cloudCol, c * 0.75);
          col = mix(col, moon, disc * (1. - c * 0.6));
          col += vec3(0.6, 0.68, 0.9) * halo;
          // light pollution and stadium spill at the horizon
          col += vec3(0.36, 0.2, 0.09) * exp(-max(h, 0.) * 9.) * 0.6 + vec3(0.1, 0.12, 0.2) * exp(-max(h, 0.) * 3.) * 0.25;
          col += uFlash * 0.12 * exp(-max(h, 0.) * 2.);
          gl_FragColor = vec4(col, 1.);
        }`,
    }),
  );
  sky.frustumCulled = false;
  scene.add(sky);
}

// ---------- bowl ----------
function ellipse(theta, off) {
  return [(A0 + off) * Math.cos(theta), CZ + (B0 + off) * Math.sin(theta)];
}

// A strip between two elliptical loops; the whole bowl is made of these.
function ring(offIn, yIn, offOut, yOut, material, segs = 120) {
  const pos = [], idx = [], uv = [];
  for (let j = 0; j <= segs; j++) {
    const th = THETA0 + (j / segs) * THETA_SPAN;
    const [x0, z0] = ellipse(th, offIn), [x1, z1] = ellipse(th, offOut);
    pos.push(x0, yIn, z0, x1, yOut, z1);
    uv.push(j / segs, 0, j / segs, 1);
    if (j < segs) idx.push(j * 2, j * 2 + 1, j * 2 + 2, j * 2 + 1, j * 2 + 3, j * 2 + 2);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
  g.setIndex(idx);
  g.computeVertexNormals();
  return new THREE.Mesh(g, material);
}

function ledMaterial(uniforms, cols, rows) {
  return new THREE.ShaderMaterial({
    uniforms: { ...uniforms, uGrid: { value: new THREE.Vector2(cols, rows) } },
    fog: false, side: THREE.DoubleSide,
    vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.); }',
    fragmentShader: `varying vec2 vUv; uniform float uTime; uniform float uEnergy; uniform vec3 uColA; uniform vec3 uColB; uniform vec2 uGrid;
      void main(){
        vec2 g = floor(vUv * uGrid) / uGrid;
        float plasma = sin(g.x * 9. + uTime * 0.9) + sin(g.y * 7. - uTime * 1.2) + sin((g.x + g.y) * 5. + uTime * 0.6);
        vec3 col = mix(uColA, uColB, 0.5 + 0.5 * sin(plasma * 1.6));
        float h = 0.08 + uEnergy * 0.85 * abs(sin(g.x * 37. + uTime * 2.3)) * (0.55 + 0.45 * sin(g.x * 11.3 - uTime * 1.9));
        float bar = step(g.y, h);
        col = col * (0.14 + 0.35 * uEnergy) + mix(uColB, vec3(1.), 0.35) * bar * (0.7 + 0.9 * uEnergy);
        vec2 cell = fract(vUv * uGrid) - 0.5;
        col *= smoothstep(0.52, 0.25, length(cell)) * 1.5;
        gl_FragColor = vec4(col, 1.);
      }`,
  });
}

function beamMaterial(uniforms) {
  return new THREE.ShaderMaterial({
    uniforms: { uColor: { value: new THREE.Color() }, uIntensity: { value: 0.3 }, uTime: uniforms.uTime },
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide, fog: false,
    vertexShader: `varying vec3 vN; varying vec3 vV; varying float vL; varying float vA;
      void main(){ vL = uv.y; vA = uv.x; vec4 mv = modelViewMatrix * vec4(position,1.); vN = normalMatrix * normal; vV = -mv.xyz; gl_Position = projectionMatrix * mv; }`,
    fragmentShader: `varying vec3 vN; varying vec3 vV; varying float vL; varying float vA; uniform vec3 uColor; uniform float uIntensity; uniform float uTime;
      void main(){
        float rim = pow(abs(dot(normalize(vN), normalize(vV))), 2.5);
        float dust = 0.72 + 0.28 * sin(vL * 31. + uTime * 1.7 + sin(vA * 12.56 + uTime * 0.4) * 3.);
        float a = rim * vL * vL * dust * uIntensity;
        gl_FragColor = vec4(uColor * a, 1.);
      }`,
  });
}

function buildBowl(scene, T, low, uniforms, glow) {
  const tierMat = (rows) => new THREE.MeshStandardMaterial({ ...rep(T.tier, 13, rows / 8), roughness: 1, side: THREE.DoubleSide, envMapIntensity: 0 });
  const wall = new THREE.MeshStandardMaterial({ ...rep(T.concrete, 40, 1), roughness: 1, side: THREE.DoubleSide, envMapIntensity: 0 });
  const dark = new THREE.MeshLambertMaterial({ color: 0x08090c, side: THREE.DoubleSide });
  const t1Out = TIER1.off + TIER1.rows * TIER1.depth, t1Top = TIER1.y + TIER1.rows * TIER1.rise;
  scene.add(ring(0, FIELD_Y, 0, TIER1.y, wall));
  scene.add(ring(0, TIER1.y, t1Out, t1Top, tierMat(TIER1.rows)));
  scene.add(ring(t1Out, t1Top, TIER2.off, t1Top, dark));
  scene.add(ring(TIER2.off, TIER2.y, T2_OUT, T2_TOP, tierMat(TIER2.rows)));
  scene.add(ring(T2_OUT, T2_TOP, T2_OUT, T2_TOP + 7, wall));
  // roof canopy with its steel underside
  const roofTex = drawnTexture(256, 256, (g) => {
    g.fillStyle = '#0d0f14'; g.fillRect(0, 0, 256, 256);
    g.strokeStyle = '#2a2e38'; g.lineWidth = 5;
    for (let i = 0; i <= 4; i++) { g.beginPath(); g.moveTo(i * 64, 0); g.lineTo(i * 64, 256); g.stroke(); }
    g.lineWidth = 2;
    for (let i = 0; i < 4; i++) { g.beginPath(); g.moveTo(i * 64, 0); g.lineTo(i * 64 + 64, 256); g.moveTo(i * 64 + 64, 0); g.lineTo(i * 64, 256); g.stroke(); }
    for (let j = 0; j <= 4; j++) { g.beginPath(); g.moveTo(0, j * 64); g.lineTo(256, j * 64); g.stroke(); }
  });
  roofTex.wrapS = roofTex.wrapT = THREE.RepeatWrapping;
  roofTex.repeat.set(24, 1);
  scene.add(ring(T2_OUT, T2_TOP + 7, T2_OUT - 17, T2_TOP + 9.5, new THREE.MeshLambertMaterial({ map: roofTex, side: THREE.DoubleSide })));
  // LED ribbon on the fascia between the tiers
  scene.add(ring(TIER2.off - 0.05, t1Top + 0.5, TIER2.off - 0.05, TIER2.y, ledMaterial(uniforms, 900, 5)));

  // floodlight banks under the canopy edge, with shafts of light in the haze
  const bankTex = drawnTexture(256, 96, (g) => {
    g.fillStyle = '#05060a'; g.fillRect(0, 0, 256, 96);
    for (let i = 0; i < 12; i++) for (let j = 0; j < 4; j++) {
      const x = 12 + i * 21, y = 13 + j * 23;
      const gr = g.createRadialGradient(x, y, 0, x, y, 10);
      gr.addColorStop(0, '#ffffff'); gr.addColorStop(0.5, '#dfe8ff'); gr.addColorStop(1, 'rgba(120,150,255,0)');
      g.fillStyle = gr; g.fillRect(x - 10, y - 10, 20, 20);
    }
  });
  const bankMat = new THREE.MeshBasicMaterial({ map: bankTex, fog: false, toneMapped: false });
  const sm = new THREE.SpriteMaterial({ map: glow, color: 0xd6e4ff, blending: THREE.AdditiveBlending, depthWrite: false, fog: false, transparent: true, opacity: 0.8 });
  const shaftGeo = new THREE.CylinderGeometry(1.5, 15, 80, 20, 1, true);
  shaftGeo.translate(0, -40, 0);
  const shafts = [];
  const N = 14;
  for (let j = 0; j < N; j++) {
    const th = THETA0 + ((j + 0.5) / N) * THETA_SPAN;
    const [x, z] = ellipse(th, T2_OUT - 17.5);
    const y = T2_TOP + 8.6;
    const bank = new THREE.Mesh(new THREE.PlaneGeometry(11, 4), bankMat);
    bank.position.set(x, y, z);
    bank.lookAt(0, -10, CZ);
    const s = new THREE.Sprite(sm);
    s.position.set(x, y, z);
    s.scale.setScalar(20);
    scene.add(bank, s);
    if (!low) {
      const shaft = new THREE.Mesh(shaftGeo, beamMaterial(uniforms));
      shaft.material.uniforms.uColor.value.set(0xaec4ff);
      shaft.material.uniforms.uIntensity.value = 0.05;
      shaft.position.set(x, y, z);
      shaft.lookAt(x * 0.2, -400, CZ + (z - CZ) * 0.2);
      shaft.rotateX(Math.PI / 2);
      shaft.frustumCulled = false;
      scene.add(shaft);
      shafts.push(shaft);
    }
  }
  // big screen at the far end
  const screen = new THREE.Mesh(new THREE.PlaneGeometry(38, 13), ledMaterial(uniforms, 190, 65));
  screen.position.set(0, T2_TOP + 1.5, CZ - B0 - T2_OUT + 1.5);
  scene.add(screen);
}

// ---------- crowd ----------
function figureGeometry(detail) {
  const parts = [];
  const add = (g, id) => {
    g = g.index ? g.toNonIndexed() : g;
    g.deleteAttribute('uv');
    g.setAttribute('aPart', new THREE.Float32BufferAttribute(new Float32Array(g.attributes.position.count).fill(id), 1));
    parts.push(g);
  };
  if (detail === 0) {
    const body = new THREE.CylinderGeometry(0.2, 0.13, 1.44, 5, 1, true);
    body.scale(1, 1, 0.6);
    body.translate(0, 0.72, 0);
    add(body, 0);
    add(new THREE.OctahedronGeometry(0.125, 0).translate(0, 1.6, 0), 1);
  } else {
    const seg = detail === 2 ? 7 : 5;
    for (const s of [-1, 1]) add(new THREE.CylinderGeometry(0.088, 0.066, 0.88, seg, 1, true).translate(s * 0.09, 0.44, 0), 3);
    const torso = new THREE.CylinderGeometry(0.2, 0.155, 0.6, seg + 1, 1, false);
    torso.scale(1, 1, 0.6);
    add(torso.translate(0, 1.16, 0), 0);
    add(new THREE.IcosahedronGeometry(0.115, detail === 2 ? 1 : 0).scale(0.92, 1.12, 1).translate(0, 1.61, 0), 1);
    for (const s of [-1, 1]) add(new THREE.CylinderGeometry(0.047, 0.038, 0.6, seg, 1, false).translate(s * 0.25, 1.1, 0), 2);
  }
  return mergeGeometries(parts);
}

function crowdMaterial(uniforms) {
  const m = new THREE.MeshLambertMaterial();
  m.onBeforeCompile = (s) => {
    s.uniforms.uTime = uniforms.uTime;
    s.uniforms.uEnergy = uniforms.uEnergy;
    s.vertexShader = s.vertexShader
      .replace('#include <common>', `#include <common>
        attribute float aPart; attribute vec3 aRand;
        uniform float uTime; uniform float uEnergy;
        varying float vPart; varying float vSkin; varying vec3 vLocal;`)
      .replace('#include <begin_vertex>', `
        vec3 transformed = vec3(position);
        vPart = aPart; vSkin = aRand.x; vLocal = position;
        float ph = aRand.x * 6.2831;
        float hype = uEnergy * (0.35 + 0.65 * aRand.y);
        float jump = aRand.z * hype * 0.3 * pow(max(0., sin(uTime * 6.8 + ph * 0.3)), 2.);
        if (aPart > 1.5 && aPart < 2.5) {
          vec3 pivot = vec3(sign(position.x) * 0.25, 1.4, 0.);
          float up = step(0.35, aRand.y) * step(sign(position.x) * (aRand.x - 0.5), 0.2);
          float raise = hype * 2.7 * up + 0.12 + sin(uTime * 6.8 + ph) * 0.3 * hype;
          vec3 q = transformed - pivot;
          float c = cos(raise), sn = sin(raise);
          q.yz = vec2(c * q.y + sn * q.z, -sn * q.y + c * q.z);
          transformed = pivot + q;
        }
        transformed.y += jump;
        transformed.x += sin(uTime * 1.7 + ph) * 0.035 * (0.3 + uEnergy) * position.y;`);
    s.fragmentShader = s.fragmentShader
      .replace('#include <common>', '#include <common>\nvarying float vPart; varying float vSkin; varying vec3 vLocal;')
      .replace('#include <color_fragment>', `#include <color_fragment>
        vec3 skin = mix(vec3(0.9,0.68,0.54), vec3(0.3,0.18,0.11), fract(vSkin * 7.31));
        vec3 pants = mix(vec3(0.05,0.07,0.15), vec3(0.11,0.11,0.12), fract(vSkin * 3.3));
        if (vPart > 2.5) diffuseColor.rgb = pants;
        else if (vPart > 1.5) { if (vLocal.y < 1.12) diffuseColor.rgb = skin; }
        else if (vPart > 0.5) {
          vec3 hair = mix(vec3(0.04,0.03,0.025), vec3(0.42,0.28,0.13), fract(vSkin * 13.7));
          diffuseColor.rgb = (vLocal.y > 1.66 || vLocal.z < -0.035) ? hair : skin;
        } else if (vLocal.y < 0.84) diffuseColor.rgb = pants;
        diffuseColor.rgb *= mix(0.3, 1.0, smoothstep(0.1, 1.45, vLocal.y)); // packed bodies shade each other`);
  };
  return m;
}

const CLOTHES = [0x1b1b1f, 0x25262b, 0xe8e6e0, 0x8c1c1c, 0x1d3f7a, 0x2c5e3a, 0xd9a521, 0x5a2a6e, 0x3a3a40, 0xc2c2c8, 0x7a4a2a, 0x10656b, 0x101014, 0x101014];

function buildCrowd(scene, low, uniforms, density) {
  const people = []; // x, y, z, standing
  const sp = (low ? 0.92 : 0.62) / Math.sqrt(density);
  for (let z = -10.5; z > CZ - B0 + 3; z -= sp) {
    for (let x = -A0 + 3; x < A0 - 3; x += sp) {
      const ex = x / (A0 - 2.5), ez = (z - CZ) / (B0 - 2.5);
      if (ex * ex + ez * ez > 1) continue;
      if (Math.abs(x) < 4.2 && z < -40 && z > -49) continue; // front-of-house mix position
      people.push(x + (Math.random() - 0.5) * sp * 0.8, FIELD_Y, z + (Math.random() - 0.5) * sp * 0.8, 1);
    }
  }
  const seat = (low ? 1.15 : 0.62) / density;
  for (const tier of [TIER1, TIER2]) {
    for (let k = 0; k < tier.rows; k++) {
      const off = tier.off + (k + 0.5) * tier.depth, y = tier.y + k * tier.rise;
      let th = THETA0 + 0.004;
      while (th < THETA0 + THETA_SPAN - 0.004) {
        const r = Math.hypot((A0 + off) * Math.sin(th), (B0 + off) * Math.cos(th));
        if (Math.random() < 0.94) {
          const [x, z] = ellipse(th, off);
          people.push(x, y, z, 0.3);
        }
        th += seat / r;
      }
    }
  }

  const count = people.length / 4;
  const near = [], far = [];
  for (let i = 0; i < count; i++) (people[i * 4 + 3] === 1 && people[i * 4 + 2] > (low ? -22 : -36) ? near : far).push(i);

  const material = crowdMaterial(uniforms);
  const dummy = new THREE.Object3D(), color = new THREE.Color();
  const make = (ids, detail) => {
    const geo = figureGeometry(detail);
    const rand = new Float32Array(ids.length * 3);
    geo.setAttribute('aRand', new THREE.InstancedBufferAttribute(rand, 3));
    const mesh = new THREE.InstancedMesh(geo, material, ids.length);
    ids.forEach((id, n) => {
      const x = people[id * 4], y = people[id * 4 + 1], z = people[id * 4 + 2], standing = people[id * 4 + 3];
      dummy.position.set(x, y, z);
      dummy.rotation.y = Math.atan2(-x, -z) + (Math.random() - 0.5) * 0.35;
      const s = 0.88 + Math.random() * 0.2;
      dummy.scale.set(s * (0.92 + Math.random() * 0.2), s * (standing === 1 ? 1 : 0.72), s);
      dummy.updateMatrix();
      mesh.setMatrixAt(n, dummy.matrix);
      color.setHex(CLOTHES[(Math.random() * CLOTHES.length) | 0]).multiplyScalar(0.7 + Math.random() * 0.5);
      mesh.setColorAt(n, color);
      rand.set([Math.random(), Math.random(), standing], n * 3);
    });
    mesh.frustumCulled = false;
    scene.add(mesh);
  };
  make(near, low ? 1 : 2);
  make(far, 0);

  // phone torches that turn into synced LED wristbands as the show heats up
  const lights = [], phases = [];
  for (let i = 0; i < count; i++) {
    if (Math.random() > (low ? 0.14 : 0.22)) continue;
    lights.push(people[i * 4], people[i * 4 + 1] + (people[i * 4 + 3] === 1 ? 1.95 : 1.35), people[i * 4 + 2]);
    phases.push(Math.random());
  }
  const pg = new THREE.BufferGeometry();
  pg.setAttribute('position', new THREE.Float32BufferAttribute(lights, 3));
  pg.setAttribute('aPhase', new THREE.Float32BufferAttribute(phases, 1));
  const points = new THREE.Points(pg, new THREE.ShaderMaterial({
    uniforms, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, fog: false,
    vertexShader: `attribute float aPhase; uniform float uTime; uniform float uEnergy; uniform vec3 uColA; uniform vec3 uColB; varying vec3 vC;
      void main(){
        vec3 p = position;
        p.x += sin(uTime * 2. + aPhase * 40.) * 0.12; p.y += sin(uTime * 6.8 + aPhase * 9.) * 0.06 * uEnergy;
        vec4 mv = modelViewMatrix * vec4(p, 1.);
        float on = step(aPhase, 0.1 + 0.9 * uEnergy);
        float tw = 0.55 + 0.45 * sin(uTime * (2. + aPhase * 5.) + aPhase * 80.);
        float wave = 0.5 + 0.5 * sin(length(position.xz) * 0.16 - uTime * 3.5);
        vec3 band = mix(uColA, uColB, step(0.5, wave)) * (0.4 + 1.4 * wave);
        vC = mix(vec3(1.0, 0.95, 0.85) * tw, band, smoothstep(0.35, 0.7, uEnergy)) * on;
        gl_PointSize = clamp(190. / -mv.z, 1.5, 15.);
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: `varying vec3 vC;
      void main(){ float a = smoothstep(0.5, 0.05, length(gl_PointCoord - 0.5)); gl_FragColor = vec4(vC * a, 1.); }`,
  }));
  points.frustumCulled = false;
  scene.add(points);
  return count;
}

// ---------- stage ----------
function buildStage(scene, T, low, uniforms, glow) {
  const shadow = (m) => { m.castShadow = true; m.receiveShadow = true; return m; };
  const top = new THREE.Mesh(new THREE.PlaneGeometry(26, 14),
    new THREE.MeshStandardMaterial({ ...T.deck, bumpScale: 1.2, roughness: 1, metalness: 0.05, envMapIntensity: 0.5 }));
  top.rotation.x = -Math.PI / 2;
  top.position.set(0, 0, 1);
  top.receiveShadow = true;
  scene.add(top);
  const black = new THREE.MeshStandardMaterial({ color: 0x050506, roughness: 0.95 });
  const base = new THREE.Mesh(new THREE.BoxGeometry(26, 2.2, 14), black);
  base.position.set(0, -1.101, 1);
  scene.add(base);

  // trusses
  const trussTex = drawnTexture(64, 64, (g) => {
    g.clearRect(0, 0, 64, 64);
    g.strokeStyle = '#c4c8d0';
    g.lineWidth = 7;
    g.strokeRect(0, 3.5, 64, 57);
    g.lineWidth = 4;
    g.beginPath(); g.moveTo(0, 4); g.lineTo(64, 60); g.moveTo(64, 4); g.lineTo(0, 60); g.stroke();
  });
  trussTex.wrapS = THREE.RepeatWrapping;
  const truss = (a, b) => {
    const len = a.distanceTo(b), w = 0.45;
    const tex = trussTex.clone();
    tex.repeat.set(len / w, 1);
    const mat = new THREE.MeshStandardMaterial({ map: tex, alphaTest: 0.5, side: THREE.DoubleSide, metalness: 0.9, roughness: 0.32 });
    const geo = new THREE.PlaneGeometry(len, w);
    const grp = new THREE.Group();
    for (let i = 0; i < 4; i++) {
      const p = new THREE.Mesh(geo, mat);
      p.rotation.x = (i * Math.PI) / 2;
      p.position.set(0, Math.sin((i * Math.PI) / 2) * -w / 2, Math.cos((i * Math.PI) / 2) * w / 2);
      grp.add(p);
    }
    grp.position.copy(a).add(b).multiplyScalar(0.5);
    grp.quaternion.setFromUnitVectors(new THREE.Vector3(1, 0, 0), b.clone().sub(a).normalize());
    scene.add(grp);
  };
  const V = (x, y, z) => new THREE.Vector3(x, y, z);
  const H = 10.6, X = 12.6, ZF = -5.6, ZB = 7.6;
  for (const x of [-X, X]) for (const z of [ZF, ZB]) truss(V(x, 0, z), V(x, H, z));
  truss(V(-X, H, ZF), V(X, H, ZF));
  truss(V(-X, H, ZB), V(X, H, ZB));
  truss(V(-X, H, 1), V(X, H, 1));
  truss(V(-X, H, ZF), V(-X, H, ZB));
  truss(V(X, H, ZF), V(X, H, ZB));
  const roof = new THREE.Mesh(new THREE.BoxGeometry(26.4, 0.15, 13.8), black);
  roof.position.set(0, H + 0.5, 1);
  scene.add(roof);
  for (const x of [-13.1, 13.1]) { // side drapes
    const d = new THREE.Mesh(new THREE.PlaneGeometry(8, H), new THREE.MeshStandardMaterial({ color: 0x040405, roughness: 1, side: THREE.DoubleSide }));
    d.position.set(x, H / 2, 3.6);
    d.rotation.y = Math.PI / 2;
    scene.add(d);
  }

  // LED wall behind the band
  const wall = new THREE.Mesh(new THREE.PlaneGeometry(22, 7.6), ledMaterial(uniforms, 176, 61));
  wall.position.set(0, 4.7, 7.35);
  wall.rotation.y = Math.PI;
  scene.add(wall);

  // PA, backline, wedges, cases
  const tolex = new THREE.MeshStandardMaterial({ ...T.tolex, roughness: 1, bumpScale: 0.6 });
  const grille = new THREE.MeshStandardMaterial({ ...rep(T.grille, 2, 2), roughness: 1, metalness: 0.7, bumpScale: 1 });
  const cab = (w, h, d, x, y, z, rx = 0, front = 1) => {
    const g = new THREE.Group();
    g.add(shadow(new THREE.Mesh(new THREE.BoxGeometry(w, h, d), tolex)));
    const f = new THREE.Mesh(new THREE.PlaneGeometry(w * 0.92, h * 0.88), grille);
    f.position.z = (-d / 2 - 0.004) * front;
    if (front > 0) f.rotation.y = Math.PI;
    g.add(f);
    g.position.set(x, y, z);
    g.rotation.x = rx;
    scene.add(g);
  };
  for (const side of [-1, 1]) {
    for (let i = 0; i < 9; i++) cab(1.35, 0.42, 0.85, side * 14.8, 9.6 - i * 0.45, -5.6 - i * i * 0.012, -i * 0.035);
    for (let i = 0; i < 4; i++) cab(1.3, 1.0, 1.1, side * (10.5 + (i % 2) * 1.4), FIELD_Y + 0.5 + Math.floor(i / 2), -7.3);
  }
  const ampFace = drawnTexture(256, 96, (g) => {
    g.fillStyle = '#0a0a0b'; g.fillRect(0, 0, 256, 96);
    g.fillStyle = '#c9a24a'; g.fillRect(8, 30, 240, 44);
    g.fillStyle = '#111'; for (let i = 0; i < 8; i++) { g.beginPath(); g.arc(34 + i * 27, 52, 8, 0, 7); g.fill(); }
    g.fillStyle = '#ff3020'; g.beginPath(); g.arc(238, 52, 4, 0, 7); g.fill();
  });
  for (const x of [-8.2, -7.3, -1.5, 7.3, 8.2]) {
    cab(0.78, 0.76, 0.36, x, 0.38, 5.6);
    cab(0.78, 0.76, 0.36, x, 1.14, 5.6);
    const head = shadow(new THREE.Mesh(new THREE.BoxGeometry(0.72, 0.26, 0.3), tolex));
    head.position.set(x, 1.65, 5.6);
    const face = new THREE.Mesh(new THREE.PlaneGeometry(0.68, 0.22), new THREE.MeshStandardMaterial({ map: ampFace, roughness: 0.4, metalness: 0.4, emissive: 0xff2010, emissiveMap: ampFace, emissiveIntensity: 0.25 }));
    face.position.set(x, 1.65, 5.445);
    face.rotation.y = Math.PI;
    scene.add(head, face);
  }
  for (const x of [-7, -3.5, 0, 3.5, 7]) cab(0.62, 0.34, 0.46, x, 0.15, -5.15, -0.55, -1);
  const steel = new THREE.MeshStandardMaterial({ color: 0x9aa0aa, metalness: 0.9, roughness: 0.35 });
  for (const [x, z, r] of [[-11, 4.5, 0.2], [10.8, 3.2, -0.3], [11.2, 5.2, 0.1]]) { // flight cases
    const c = shadow(new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.7, 0.6), tolex));
    c.position.set(x, 0.35, z);
    c.rotation.y = r;
    const trim = new THREE.Mesh(new THREE.BoxGeometry(1.22, 0.04, 0.62), steel);
    trim.position.set(x, 0.7, z);
    trim.rotation.y = r;
    scene.add(c, trim);
  }
  // cable runs across the deck
  const rubber = new THREE.MeshStandardMaterial({ color: 0x050505, roughness: 0.6 });
  const cable = (pts) => {
    const curve = new THREE.CatmullRomCurve3(pts.map(([x, z]) => V(x, 0.012, z)));
    const m = new THREE.Mesh(new THREE.TubeGeometry(curve, 40, 0.011, 5), rubber);
    m.receiveShadow = true;
    scene.add(m);
  };
  cable([[-7.3, 5.3], [-6.2, 3], [-6.6, 0.5], [-6.1, -1.1]]);
  cable([[7.3, 5.3], [6.6, 2.5], [6.3, 0.2], [6.2, -1.2]]);
  cable([[-1.5, 5.3], [-2.6, 3.4], [-1.6, 1], [-2.2, -0.6]]);
  cable([[-1.5, 5.3], [0.8, 4.2], [2.6, 1.5], [2.3, -0.6]]);
  cable([[-11, -5.2], [-6, -4.7], [0, -4.85], [6, -4.7], [11, -5.2]]);
  const tape = new THREE.MeshStandardMaterial({ color: 0xd8d8d0, roughness: 0.9 });
  for (const [x, z] of SLOTS) {
    for (const r of [0.78, -0.78]) {
      const t = new THREE.Mesh(new THREE.PlaneGeometry(0.3, 0.045), tape);
      t.rotation.set(-Math.PI / 2, 0, r);
      t.position.set(x, 0.003, z + 0.75);
      t.receiveShadow = true;
      scene.add(t);
    }
  }

  // crowd barrier and the front-of-house mix tower out in the crowd
  const barrier = new THREE.Mesh(new THREE.BoxGeometry(90, 1.15, 0.12), steel);
  barrier.position.set(0, FIELD_Y + 0.575, -9.4);
  scene.add(barrier);
  const foh = new THREE.Group();
  const deck = new THREE.Mesh(new THREE.BoxGeometry(7, 1.2, 7.5), black);
  deck.position.y = 0.6;
  const canopy = new THREE.Mesh(new THREE.BoxGeometry(7.4, 0.15, 7.9), black);
  canopy.position.y = 4.2;
  foh.add(deck, canopy);
  for (const x of [-3.4, 3.4]) for (const z of [-3.6, 3.6]) {
    const post = new THREE.Mesh(new THREE.BoxGeometry(0.15, 3, 0.15), steel);
    post.position.set(x, 2.7, z);
    foh.add(post);
  }
  const desk = new THREE.Mesh(new THREE.BoxGeometry(5, 0.25, 1.2), new THREE.MeshStandardMaterial({ color: 0x101014, emissive: 0x2050ff, emissiveIntensity: 0.5, roughness: 0.5 }));
  desk.position.set(0, 2.1, 2.2);
  foh.add(desk);
  foh.position.set(0, FIELD_Y, -44.5);
  scene.add(foh);

  // moving-head beams
  const beamGeo = new THREE.CylinderGeometry(0.07, 1.5, 46, 14, 1, true);
  beamGeo.translate(0, -23, 0);
  const beams = [];
  const fixtureMat = new THREE.MeshStandardMaterial({ color: 0x0a0a0c, roughness: 0.5, metalness: 0.5 });
  const addBeam = (x, y, z, back) => {
    const mesh = new THREE.Mesh(beamGeo, beamMaterial(uniforms));
    mesh.position.set(x, y, z);
    mesh.frustumCulled = false;
    const body = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.13, 0.4, 10), fixtureMat);
    body.position.y = 0.05;
    mesh.add(body);
    const lens = new THREE.Sprite(new THREE.SpriteMaterial({ map: glow, blending: THREE.AdditiveBlending, depthWrite: false, fog: false, transparent: true }));
    lens.position.set(x, y - 0.15, z);
    lens.scale.setScalar(1.5);
    scene.add(mesh, lens);
    beams.push({ mesh, lens, back, phase: beams.length * 0.9 });
  };
  const nFront = low ? 8 : 12;
  for (let i = 0; i < nFront; i++) addBeam(-11 + (22 * i) / (nFront - 1), H - 0.35, ZF, false);
  for (let i = 0; i < 6; i++) addBeam(-10 + 4 * i, H - 0.35, ZB, true);
  return beams;
}

function buildHaze(scene, low) {
  const tex = smokeTexture();
  const puffs = [];
  const n = low ? 10 : 34;
  for (let i = 0; i < n; i++) {
    const mat = new THREE.SpriteMaterial({ map: tex, transparent: true, depthWrite: false, fog: false, opacity: 0.06, rotation: Math.random() * 6 });
    const s = new THREE.Sprite(mat);
    const onStage = i % 3 !== 0;
    s.position.set((Math.random() - 0.5) * 30, onStage ? 3 + Math.random() * 6 : 1 + Math.random() * 4, onStage ? 1 + Math.random() * 6 : -9 - Math.random() * 16); // kept out of the players' faces
    s.scale.setScalar(6 + Math.random() * 7);
    s.renderOrder = 2;
    scene.add(s);
    puffs.push({ s, v: 0.15 + Math.random() * 0.35, spin: (Math.random() - 0.5) * 0.05, base: 0.02 + Math.random() * 0.03 });
  }
  return puffs;
}

export function buildStadium(scene, renderer, T, { low, density = 1 }) {
  const uniforms = {
    uTime: { value: 0 },
    uEnergy: { value: 0 },
    uColA: { value: new THREE.Color(0x2030ff) },
    uColB: { value: new THREE.Color(0xff2080) },
    uFlash: { value: new THREE.Color(0, 0, 0) },
  };
  scene.background = new THREE.Color(0x03040a);
  scene.fog = new THREE.FogExp2(0x0b0e1a, 0.0058);
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environmentIntensity = 0.22;
  pmrem.dispose();

  const glow = glowTexture();
  buildSky(scene, low, uniforms);
  const field = new THREE.Mesh(new THREE.PlaneGeometry(500, 500), new THREE.MeshStandardMaterial({ ...rep(T.concrete, 60, 60), roughness: 1, color: 0x30343a, envMapIntensity: 0 }));
  field.rotation.x = -Math.PI / 2;
  field.position.y = FIELD_Y;
  scene.add(field);
  buildBowl(scene, T, low, uniforms, glow);
  const beams = buildStage(scene, T, low, uniforms, glow);
  const crowdCount = buildCrowd(scene, low, uniforms, density);
  const puffs = buildHaze(scene, low);

  // ----- lighting -----
  const hemi = new THREE.HemisphereLight(0x8fa6e0, 0x1a1510, 0.42);
  scene.add(hemi);
  const moon = new THREE.DirectionalLight(0xa9c0ff, 0.5);
  moon.position.copy(MOON_DIR).multiplyScalar(200);
  const flood = new THREE.DirectionalLight(0xc4d4ff, 0.42);
  flood.position.set(20, 90, -30);
  const wash = new THREE.DirectionalLight(0xffffff, 1);
  wash.position.set(0, 14, 0);
  wash.target.position.set(0, -6, -60);
  scene.add(moon, flood, wash, wash.target);

  const spot = (color, intensity, x, y, z, angle, mapSize) => {
    const s = new THREE.SpotLight(color, intensity, 50, angle, 0.65, 2);
    s.position.set(x, y, z);
    scene.add(s, s.target);
    if (mapSize) {
      s.castShadow = true;
      s.shadow.mapSize.set(mapSize, mapSize);
      s.shadow.bias = -0.0005;
      s.shadow.normalBias = 0.02;
      s.shadow.camera.near = 3;
      s.shadow.camera.far = 32;
    }
    return s;
  };
  // warm front key lights (one always casts shadows) + cool back light for rim
  const keyA = spot(0xfff0d8, 190, -6.5, 10, -5, 0.8, low ? 1024 : 2048);
  keyA.target.position.set(-1, 0, 0.5);
  const keyB = spot(0xffe6c8, 150, 7, 10, -5, 0.8, 0);
  keyB.target.position.set(1.5, 0, 0.5);
  const rim = spot(0x9fc0ff, 240, 0, 10, 7, 1.0, 0);
  rim.target.position.set(0, 0, -1);
  // two colour movers that sweep the stage and throw moving shadows
  const movers = low ? [] : [spot(0xffffff, 500, -9, 10, 1, 0.42, 1024), spot(0xffffff, 500, 9, 10, 1, 0.42, 1024)];
  const backA = new THREE.PointLight(0xff3090, 260, 30, 2);
  backA.position.set(-8, 6, 6);
  const backB = new THREE.PointLight(0x30a0ff, 260, 30, 2);
  backB.position.set(8, 6, 6);
  scene.add(backA, backB);

  const cA = new THREE.Color(), cB = new THREE.Color(), white = new THREE.Color(0xffffff), tmp = new THREE.Color();
  let blind = 0;
  return {
    crowdCount,
    // a burst of audience blinders (white wash over the crowd), e.g. on a crash
    blinder(v) { blind = Math.max(blind, v); },
    update(time, energy, dt, flash) {
      uniforms.uTime.value = time;
      uniforms.uEnergy.value = energy;
      if (flash) uniforms.uFlash.value.copy(flash);
      const hue = (time * 0.025) % 1;
      cA.setHSL(hue, 0.95, 0.5);
      cB.setHSL((hue + 0.38) % 1, 0.95, 0.5);
      uniforms.uColA.value.copy(cA);
      uniforms.uColB.value.copy(cB);
      backA.color.copy(cB);
      backB.color.copy(cA);
      backA.intensity = backB.intensity = 110 + 150 * energy;
      blind *= Math.exp(-dt * 3.5);
      wash.color.copy(cA).lerp(cB, 0.5 + 0.5 * Math.sin(time * 0.7)).lerp(white, Math.min(1, 0.3 + blind));
      wash.intensity = 0.45 + 1.3 * energy + blind * 1.3;
      hemi.intensity = 0.42 + (flash ? Math.min(0.5, (flash.r + flash.g + flash.b) * 0.1) : 0);
      movers.forEach((m, i) => {
        const t = time * (0.35 + energy * 0.9) + i * 2.1;
        m.target.position.set(Math.sin(t * 0.9) * 8, 0, Math.sin(t * 1.3 + i) * 3.5);
        m.color.copy(i ? cA : cB).lerp(white, 0.25);
        m.intensity = 90 + 260 * energy;
      });
      const speed = 0.25 + energy * 1.3;
      for (const b of beams) {
        const t = time * speed + b.phase;
        if (b.back) {
          b.mesh.rotation.x = Math.PI - 0.5 + Math.sin(t * 0.7) * 0.25;
          b.mesh.rotation.z = Math.sin(t * 0.9) * 0.6;
        } else {
          b.mesh.rotation.x = 1.15 + Math.sin(t * 0.8) * 0.3;
          b.mesh.rotation.z = Math.sin(t * 0.6 + b.phase) * 0.55;
        }
        const col = Math.floor(b.phase) % 2 ? cA : cB;
        b.mesh.material.uniforms.uColor.value.copy(col);
        b.mesh.material.uniforms.uIntensity.value = 0.2 + 0.6 * energy;
        b.lens.material.color.copy(col).lerp(white, 0.3);
      }
      for (const p of puffs) {
        p.s.position.x += p.v * dt;
        if (p.s.position.x > 16) p.s.position.x = -16;
        p.s.material.rotation += p.spin * dt;
        tmp.copy(cA).lerp(cB, 0.5 + 0.5 * Math.sin(p.s.position.x * 0.3 + time * 0.5)).lerp(white, 0.45);
        p.s.material.color.copy(tmp);
        p.s.material.opacity = p.base * (0.6 + 0.5 * energy);
      }
    },
  };
}
