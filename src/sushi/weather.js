// the run's weather, after THE MARKET's (src/131-weather.js: cloud, rain, mist and wind, its rain drawn as streaks round you): here it is the run's own, a sum of the run's clock (G.clock.frac), so every page on the block sees the same sky: a clear day, cloud gathering through the dusk, a thin drizzle while the night is at its worst, then clearing to a hazy dawn; what is heard (audio.js) follows what falls
import * as THREE from 'three';
import { G, clamp } from './ctx.js';
import { NZ, FZ } from './plan.js';

const sm = (a, b, x) => { const t = clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };
const hsh = (i) => { const v = Math.sin(i * 12.9898 + 78.233) * 43758.5453; return v - Math.floor(v); };
const noise = (t) => { const i = Math.floor(t), f = t - i, u = f * f * (3 - 2 * f); return hsh(i) * (1 - u) + hsh(i + 1) * u; };
// the weather at a share of the run (0 the morning, 1 the dawn after): { cloud, rain, mist, wind } each 0..1
export function weatherAt(f) {
  const cloud = clamp(0.08 + 0.1 * sm(0.18, 0.3, f) + 0.25 * sm(0.3, 0.45, f) + 0.3 * sm(0.45, 0.6, f) - 0.45 * sm(0.78, 0.95, f) + 0.06 * (noise(f * 40) - 0.5), 0.04, 0.92);
  const rain = clamp(0.32 * sm(0.53, 0.6, f) * (1 - sm(0.72, 0.8, f)) * (0.75 + 0.5 * noise(f * 90 + 3)), 0, 1);   // a drizzle, never a storm, through the middle of the night
  const mist = clamp(0.06 + 0.2 * sm(0.32, 0.42, f) + 0.12 * sm(0.62, 0.8, f) + 0.45 * sm(0.84, 0.93, f) * (1 - 0.6 * sm(0.97, 1, f)), 0, 1);   // haze at dusk, mist over the fields before the sun
  const wind = clamp(0.22 + 0.1 * sm(0.3, 0.5, f) + 0.12 * sm(0.5, 0.62, f) * (1 - sm(0.75, 0.88, f)) - 0.12 * sm(0.85, 0.95, f) + 0.1 * (noise(f * 60 + 9) - 0.5), 0.05, 0.6);
  return { cloud, rain, mist, wind };
}

export function buildWeather(scene, o = {}) {
  const W = { now: weatherAt(0), rainK: 0 };
  // the rain: thin streaks falling round you (THE MARKET's), never drawn under the cart's roof or indoors
  const NR = o.lean ? 700 : 1400, RB = 14, RH = 12, rs = new Float32Array(NR * 3), rp = new Float32Array(NR * 6);
  for (let i = 0; i < NR; i++) { rs[i * 3] = (Math.random() - 0.5) * 2 * RB; rs[i * 3 + 1] = Math.random() * RH; rs[i * 3 + 2] = (Math.random() - 0.5) * 2 * RB; }
  const rg = new THREE.BufferGeometry(); rg.setAttribute('position', new THREE.BufferAttribute(rp, 3).setUsage(THREE.DynamicDrawUsage));
  const rm = new THREE.LineBasicMaterial({ color: 0x9aaabb, transparent: true, opacity: 0.32, depthWrite: false, fog: true });
  const RAIN = new THREE.LineSegments(rg, rm); RAIN.frustumCulled = false; RAIN.visible = false; RAIN.userData.nopick = true; scene.add(RAIN);
  const dry = (x, y, z) => (Math.abs(x) < 1.95 && z > -1.95 && z < 2.25 && y < 2.75) || z > NZ || z < FZ;   // under the cart's roof, behind the fronts
  const cam = new THREE.Vector3();
  W.update = (dt) => {
    const K = G.clock, w = W.now = weatherAt(K ? K.frac : 0); W.rainK += clamp(w.rain - W.rainK, -dt * 0.05, dt * 0.05); G.rainK = W.rainK; G.wet = W.rainK > 0.01; G.wind = w.wind;
    const nr = Math.round(NR * clamp(W.rainK / 0.35, 0, 1)); RAIN.visible = nr > 0; if (!nr) return;
    G.camera.getWorldPosition(cam); const v = 9, L = 0.38, wx = 1.2 * w.wind, sx = (wx / v) * L, t = G.t;
    for (let i = 0; i < nr; i++) { let y = rs[i * 3 + 1] - v * dt; if (y < 0) y += RH; rs[i * 3 + 1] = y;
      const x = ((rs[i * 3] + wx * t) % (2 * RB) + 3 * RB) % (2 * RB) - RB + cam.x, z = ((rs[i * 3 + 2]) % (2 * RB) + 3 * RB) % (2 * RB) - RB + cam.z;
      if (dry(x, y, z)) { rp.fill(0, i * 6, i * 6 + 6); continue; } rp.set([x, y, z, x - sx, y + L, z], i * 6); }
    rg.setDrawRange(0, nr * 2); rg.attributes.position.needsUpdate = true; rm.opacity = 0.18 + 0.2 * clamp(W.rainK / 0.3, 0, 1);
  };
  W.rain = RAIN; G.weather = W; return W;
}
