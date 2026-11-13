// Stage dressing. The game is AR-first: the room you are standing in IS the arena, so
// there is no virtual world here — only lighting for the game objects, the arena markings,
// faint energy walls that light up when hit, and optional in-room weather effects.
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { Weather } from './particles.js';
import { sfx } from './audio.js';

export const HEX_GLSL = `
  float hexDist(vec2 p) { p = abs(p); return max(dot(p, vec2(0.5, 0.866)), p.x); }
  float hexGrid(vec2 uv) {
    vec2 r = vec2(1.0, 1.732), h = r * 0.5;
    vec2 a = mod(uv, r) - h, b = mod(uv - h, r) - h;
    vec2 gv = dot(a, a) < dot(b, b) ? a : b;
    return smoothstep(0.43, 0.5, hexDist(gv));
  }`;

// Optional effects that fall inside your room. Off by default.
export const THEMES = {
  none: { label: 'None' },
  rain: {
    label: 'Rain + lightning', lightning: true, ambience: 'rain',
    weather: { type: 'rain', count: 900, color: 0x9fc4ff, fall: 9, streak: 0.2, opacity: 0.3 },
  },
  embers: {
    label: 'Embers', ambience: 'rumble',
    weather: { type: 'embers', count: 350, color: 0xff8a3a, fall: -0.6, sway: 0.25, size: 0.026, opacity: 0.9 },
  },
  snow: {
    label: 'Snow', ambience: 'wind',
    weather: { type: 'snow', count: 600, color: 0xffffff, fall: 0.7, sway: 0.3, size: 0.024, opacity: 0.8 },
  },
};
export const THEME_ORDER = ['none', 'rain', 'embers', 'snow'];

const MAX_HITS = 4;

export class World {
  constructor({ scene, arena, renderer }) {
    this.scene = scene; this.arena = arena;
    this.isAR = false; this.theme = THEMES.none; this.themeName = 'none';
    this.flash = 0; this.strikeT = 6; this.second = 0;

    // Neutral studio lighting + reflections so the metal on guns and drones reads as real
    // under any room lighting.
    this.hemi = new THREE.HemisphereLight(0xffffff, 0x444450, 1.0);
    this.key = new THREE.DirectionalLight(0xffffff, 1.6);
    this.key.position.set(2, 5, 3);
    arena.add(this.hemi, this.key);
    const pmrem = new THREE.PMREMGenerator(renderer);
    scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environmentIntensity = 0.9;

    this.weather = new Weather(arena);
    this.accentMat = new THREE.MeshBasicMaterial({ color: new THREE.Color(0x35e0ff).multiplyScalar(1.5) });
    this.lineMat = new THREE.MeshBasicMaterial({ color: new THREE.Color(0xffcc33).multiplyScalar(1.3) });

    this.hits = Array.from({ length: MAX_HITS }, () => new THREE.Vector4(0, -99, 0, 99));
    this.hitI = 0;
    this.wallMat = new THREE.ShaderMaterial({
      uniforms: { uTime: { value: 0 }, uColor: { value: new THREE.Color(0x35e0ff) }, uHits: { value: this.hits } },
      vertexShader: `
        attribute vec2 aUV; varying vec2 vUV; varying vec3 vP;
        void main() { vUV = aUV; vP = position; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
      fragmentShader: `
        uniform float uTime; uniform vec3 uColor; uniform vec4 uHits[${MAX_HITS}];
        varying vec2 vUV; varying vec3 vP;
        ${HEX_GLSL}
        void main() {
          float lines = hexGrid(vUV * 3.0);
          float scan = 0.5 + 0.5 * sin(vUV.y * 9.0 - uTime * 1.5);
          // Nearly invisible until something hits it: just a faint skirt near the floor.
          float a = lines * 0.07 * exp(-vP.y * 3.0) * (0.6 + 0.4 * scan);
          float glow = 0.0;
          for (int i = 0; i < ${MAX_HITS}; i++) {
            float d = distance(vP, uHits[i].xyz), w = uHits[i].w;
            float ring = smoothstep(0.1, 0.0, abs(d - w * 2.2)) * exp(-w * 3.0);
            glow += ring + (0.25 + lines) * exp(-d * 2.5) * exp(-w * 2.5);
          }
          gl_FragColor = vec4(uColor * (1.0 + glow), a + glow * 0.8);
          #include <colorspace_fragment>
        }`,
      transparent: true, depthWrite: false, side: THREE.DoubleSide, blending: THREE.AdditiveBlending,
    });
    this.built = new THREE.Group();
    arena.add(this.built);
  }

  // (Re)build everything that depends on the arena size.
  build(B) {
    this.bounds = B;
    this.built.traverse((o) => o.geometry?.dispose());
    this.built.clear();
    const box = (w, h, d, mat, x, y, z) => {
      const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
      mesh.position.set(x, y, z); this.built.add(mesh); return mesh;
    };
    // Centre line (the safety line) and floor outline.
    box(B.hx * 2, 0.012, 0.06, this.lineMat, 0, 0.008, 0);
    for (const sz of [-1, 1]) box(B.hx * 2, 0.01, 0.02, this.accentMat, 0, 0.007, sz * B.hz);
    for (const sx of [-1, 1]) box(0.02, 0.01, B.hz * 2, this.accentMat, sx * B.hx, 0.007, 0);

    // Energy walls, built directly in arena coordinates.
    const pos = [], uv = [], idx = [];
    const quad = (a, b, ua, ub) => {
      const n = pos.length / 3;
      pos.push(a[0], 0, a[1], b[0], 0, b[1], b[0], B.h, b[1], a[0], B.h, a[1]);
      uv.push(ua, 0, ub, 0, ub, B.h, ua, B.h);
      idx.push(n, n + 1, n + 2, n, n + 2, n + 3);
    };
    quad([-B.hx, -B.hz], [B.hx, -B.hz], -B.hx, B.hx);
    quad([-B.hx, B.hz], [B.hx, B.hz], -B.hx, B.hx);
    quad([-B.hx, -B.hz], [-B.hx, B.hz], -B.hz, B.hz);
    quad([B.hx, -B.hz], [B.hx, B.hz], -B.hz, B.hz);
    const wg = new THREE.BufferGeometry();
    wg.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    wg.setAttribute('aUV', new THREE.Float32BufferAttribute(uv, 2));
    wg.setIndex(idx);
    const walls = new THREE.Mesh(wg, this.wallMat);
    walls.frustumCulled = false; walls.renderOrder = 3;
    this.built.add(walls);

    // Flat-screen play has no camera feed, so give it a plain floor grid for reference.
    this.grid = new THREE.GridHelper(Math.max(B.hx, B.hz) * 2, Math.round(Math.max(B.hx, B.hz) * 4), 0x2c3a58, 0x18223a);
    this.grid.position.y = 0.002;
    this.grid.visible = !this.isAR;
    this.built.add(this.grid);
    this.applyWeather();
  }

  applyWeather() {
    if (!this.bounds) return;
    const B = this.bounds;
    this.weather.set(this.theme.weather, new THREE.Vector3(B.hx * 2 + 1, 3, B.hz * 2 + 1));
  }

  setTheme(name) {
    this.theme = THEMES[name] || THEMES.none; this.themeName = name;
    this.flash = 0; this.strikeT = 4 + Math.random() * 5;
    this.applyWeather();
  }

  setAR(isAR) {
    this.isAR = isAR;
    this.scene.background = isAR ? null : new THREE.Color(0x07090f);
    if (this.grid) this.grid.visible = !isAR;
  }

  wallHit(p) {
    this.hits[this.hitI].set(p.x, p.y, p.z, 0);
    this.hitI = (this.hitI + 1) % MAX_HITS;
  }

  update(dt, time) {
    this.wallMat.uniforms.uTime.value = time;
    this.weather.update(time);
    for (const h of this.hits) h.w += dt;
    if (this.theme.lightning) {
      this.strikeT -= dt;
      if (this.strikeT <= 0) { this.flash = 1; this.second = 0.14; this.strikeT = 6 + Math.random() * 10; sfx('thunder'); }
      if (this.second > 0) { this.second -= dt; if (this.second <= 0) this.flash = 0.8; }
    }
    this.flash = Math.max(0, this.flash - dt * 3.5);
    this.hemi.intensity = 1.0 + this.flash * 4;   // lightning lights up the game objects
  }
}
