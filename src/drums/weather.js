// THE GARAGE's weather: cloud that gathers and clears over the hours, rain when it is thick, mist at the day's ends; the rain drawn as streaks round you where there is no roof, heard on it where there is
import * as THREE from 'three';
import { ROOM } from './garage.js';

const hsh = (i) => { const v = Math.sin(i * 12.9898 + 78.233) * 43758.5453; return v - Math.floor(v); };
const noise = (t) => { const i = Math.floor(t), f = t - i, u = f * f * (3 - 2 * f); return hsh(i) * (1 - u) + hsh(i + 1) * u; };
const ss = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };

export function buildWeather(scene, low, fixed) {
  const W = { now: { cloud: 0.2, rain: 0, mist: 0.1 }, rainK: 0 };
  const N = low ? 300 : 1100, RB = 12, RH = 10, seed = new Float32Array(N * 3), pos = new Float32Array(N * 6);
  for (let i = 0; i < N; i++) { seed[i * 3] = (Math.random() - 0.5) * 2 * RB; seed[i * 3 + 1] = Math.random() * RH; seed[i * 3 + 2] = (Math.random() - 0.5) * 2 * RB; }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(pos, 3).setUsage(THREE.DynamicDrawUsage));
  const rain = new THREE.LineSegments(g, new THREE.LineBasicMaterial({ color: 0x9aaabb, transparent: true, opacity: 0.3, depthWrite: false }));
  rain.frustumCulled = false; rain.visible = false; scene.add(rain);
  const dry = (x, z) => x > ROOM.x0 - 0.3 && x < ROOM.x1 + 0.3 && z > ROOM.z0 - 0.3 && z < ROOM.z1 + 0.3;
  // hour: the game's hour; days: whole game days gone by; the weather is the same for a given day and hour
  W.update = (dt, time, hour, days, cam) => {
    const t = days * 24 + hour, cloud = fixed !== undefined ? fixed : Math.min(0.95, Math.max(0.04, 0.1 + 0.95 * noise(t / 7 + 3.3) * noise(t / 2.3 + 9.1) + 0.25 * (noise(t / 1.1) - 0.5)));
    W.now.cloud = cloud; W.now.rain = ss(0.62, 0.9, cloud); W.now.mist = Math.min(1, 0.08 + 0.5 * ss(4, 6.5, hour) * (1 - ss(7, 9, hour)) + 0.25 * W.now.rain);
    W.rainK += Math.max(-dt * 0.1, Math.min(dt * 0.1, W.now.rain - W.rainK));
    const n = Math.round(N * Math.min(1, W.rainK / 0.5)); rain.visible = n > 0;
    if (!n) return;
    const v = 9, L = 0.36; let k = 0;
    for (let i = 0; i < n; i++) {
      const x = cam.x + seed[i * 3], z = cam.z + seed[i * 3 + 2], y = RH - ((seed[i * 3 + 1] + time * v) % RH);
      if (dry(x, z)) continue;
      pos[k++] = x; pos[k++] = y; pos[k++] = z; pos[k++] = x + 0.03; pos[k++] = y - L; pos[k++] = z;
    }
    g.setDrawRange(0, k / 3); g.attributes.position.needsUpdate = true;
  };
  return W;
}
