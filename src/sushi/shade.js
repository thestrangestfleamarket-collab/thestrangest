// everyone's shadow on the pavement, so nobody floats: a soft dark patch under the feet day and night, and by day, wherever the sun reaches them (not in a housefront's shade or under the cart's roof), a longer one laid away from the sun; all of them two drawings
import * as THREE from 'three';
import { G, clamp } from './ctx.js';
import * as T from './tex.js';
import { PEOPLE } from './pf.js';
import { NZ, KERB, FKERB, FZ, W0, ROAD } from './plan.js';

const LOT = 7.6, N = 40;
export function buildShade(scene, city) {
  const tex = T.canvasTex(64, 64, (g, w, h) => { const gd = g.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2); gd.addColorStop(0, 'rgba(0,0,0,1)'); gd.addColorStop(0.45, 'rgba(0,0,0,0.62)'); gd.addColorStop(1, 'rgba(0,0,0,0)'); g.clearRect(0, 0, w, h); g.fillStyle = gd; g.fillRect(0, 0, w, h); });
  const mk = () => { const m = new THREE.InstancedMesh(new THREE.PlaneGeometry(1, 1).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ map: tex, transparent: true, opacity: 0.5, depthWrite: false, fog: false }), N); m.count = 0; m.frustumCulled = false; m.renderOrder = -1; m.castShadow = m.receiveShadow = false; m.userData.nopick = true; scene.add(m); return m; };
  const under = mk(), cast = mk(), M = new THREE.Matrix4(), q = new THREE.Quaternion(), p = new THREE.Vector3(), sc = new THREE.Vector3(), UP = new THREE.Vector3(0, 1, 0), w = new THREE.Vector3(), d = new THREE.Vector3();
  // how high each lot's front stands, by row (the empty lot none): what shades the pavement
  const tall = { near: new Array(7).fill(0), far: new Array(7).fill(0) }; for (const s of city.fronts.shops) { const i = Math.round((s.x - W0 - LOT / 2) / LOT); if (i >= 0 && i < 7) tall[s.s > 0 ? 'near' : 'far'][i] = s.H; }
  const sunlit = (x, z) => { if (d.y < 0.05) return false; const t = 3.0 / d.y, rx = x + d.x * t, rz = z + d.z * t; if (Math.abs(rx) < 1.8 && rz > -1.9 && rz < 2.25) return false;   // the cart's roof
    for (const [zw, row] of [[FZ, tall.far], [NZ, tall.near]]) { const k = (zw - z) / d.z; if (!(k > 0)) continue; const i = Math.floor((x + d.x * k - W0) / LOT); if (i >= 0 && i < 7 && d.y * k < row[i]) return false; } return true; };
  return { update() { let nu = 0, nc = 0; const sky = city.sky || {}, sunK = clamp(((sky.e ?? 30) - 2) / 10, 0, 1) * clamp((city.sun ? city.sun.intensity : 2) / 1.6, 0, 1); if (city.sun) d.copy(city.sun.position).normalize();
      const len = clamp(1.7 * Math.hypot(d.x, d.z) / Math.max(0.12, d.y), 0.5, 4.5), az = Math.atan2(-d.x, -d.z);
      if (PEOPLE.length > 90) for (let i = PEOPLE.length - 1; i >= 0; i--) if (!PEOPLE[i].root.parent) PEOPLE.splice(i, 1);
      for (const P of PEOPLE) { const r = P.root; if (!r.parent || !r.visible || P.hands || nu >= N) continue; let ok = true; for (let o = r.parent; o; o = o.parent) if (!o.visible) { ok = false; break; } if (!ok) continue;
        r.getWorldPosition(w); const road = w.z < KERB && w.z > FKERB, y = (road ? ROAD : 0) + 0.014, seated = P.pose === 'sit' || P.pose === 'eat', k = seated ? 0.62 : 0.56;
        M.compose(p.set(w.x, y, w.z), q.setFromAxisAngle(UP, r.rotation.y), sc.set(k, 1, k * 0.72)); under.setMatrixAt(nu++, M);
        if (sunK > 0.05 && nc < N && !P.down?.() && sunlit(w.x, w.z)) { const L = seated ? len * 0.7 : len; M.compose(p.set(w.x - d.x / Math.hypot(d.x, d.z) * L * 0.46, y + 0.002, w.z - d.z / Math.hypot(d.x, d.z) * L * 0.46), q.setFromAxisAngle(UP, az), sc.set(0.58, 1, L * 1.25)); cast.setMatrixAt(nc++, M); } }
      under.count = nu; cast.count = nc; under.instanceMatrix.needsUpdate = cast.instanceMatrix.needsUpdate = true; under.material.opacity = 0.34 + 0.14 * clamp(sky.day ?? 1, 0, 1); cast.material.opacity = 0.46 * sunK; cast.visible = nc > 0; under.visible = nu > 0; } };
}
