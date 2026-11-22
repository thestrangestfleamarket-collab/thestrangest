// People: Microsoft Rocketbox avatars (MIT) with recorded motion. Walkers follow the streets on the sidewalk side,
// others wait at bus stops, sit on benches or stand talking outside shops. Cars yield to them.
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import * as SkeletonUtils from 'three/addons/utils/SkeletonUtils.js';

const BASE = '/drive-assets/people/';
const AV = ['Security_Male_01', 'Male_Adult_03', 'Male_Adult_05', 'Male_Adult_06', 'Male_Adult_08', 'Female_Adult_01', 'Female_Adult_02', 'Female_Adult_04', 'Female_Adult_09', 'Business_Female_03', 'Business_Male_01', 'Business_Male_05'];
const MOVES = ['walk', 'idle', 'phone', 'talk', 'sit'], FACE = /Eye|Jaw|lip|Tongue|Mouth|Masseter|Caninus|Cheek|Nose|Finger|Toe|Footsteps|Nub/i;

export class People {
  constructor(world, scene, traffic, count) { this.world = world; this.scene = scene; this.traffic = traffic; this.count = count; this.list = []; this.ready = false; this.p = {}; this.clip = { m: {}, f: {} }; this.spots = null; this._o = {}; if (count) this.load(); }
  async load() {
    const gl = new GLTFLoader(); const jobs = [];
    for (const n of AV) jobs.push(gl.loadAsync(BASE + n + '.glb').then((g) => { g.scene.updateMatrixWorld(true); const b = new THREE.Box3().setFromObject(g.scene); g.scene.traverse((m) => { if (m.isMesh && m.material.transparent) { m.material.transparent = false; m.material.alphaTest = 0.4; } }); this.p[n] = { scene: g.scene, fit: 1.74 / Math.max(0.01, b.max.y - b.min.y) }; }));
    for (const s of ['m', 'f']) for (const c of MOVES) jobs.push(gl.loadAsync(BASE + 'a_' + s + '_' + c + '.glb').then((g) => { const clip = g.animations[0], keep = [];
      for (const t of clip.tracks) { if (FACE.test(t.name)) continue; if (t.name.endsWith('.quaternion')) keep.push(t); else if (/Pelvis\.position$/.test(t.name)) { const v = t.values, n = v.length / 3; for (let a = 0; a < 3; a++) { const d = v[(n - 1) * 3 + a] - v[a]; if (Math.abs(d) > 8) for (let i = 0; i < n; i++) v[i * 3 + a] = v[a] + (v[i * 3 + a] - v[a] - d * i / (n - 1)); } keep.push(t); } }
      clip.tracks = keep; clip.name = c; this.clip[s][c] = clip; }));
    try { this.cast = await fetch(BASE + 'cast.json').then(r => r.json()); } catch { this.cast = []; } // the owner's neighbours (THE GARAGE): names, characters and their own lines
    const res = await Promise.allSettled(jobs); if (res.some(r => r.status === 'rejected')) { console.warn('some people files did not load'); }
    this.names = AV.filter(n => this.p[n]); this.ready = this.names.length > 0 && !!this.clip.m.walk;
    // places where people stand or sit, from the mapped features
    const m = this.world.meta; this.spots = [];
    for (const q of m.panels || []) { if (q[3] === 6) this.spots.push({ x: q[0] + Math.sin(q[4] - 1.5708) * 1.3, z: q[2] + Math.cos(q[4] - 1.5708) * 1.3, yaw: q[4] - 1.5708, pose: 'phone' }); if (q[3] === 3 && !q[8]) this.spots.push({ x: q[0] + Math.sin(q[4]) * 2.2, z: q[2] + Math.cos(q[4]) * 2.2, yaw: q[4], pose: 'talk', pair: true }); }
    for (const f of m.furn || []) if (f[4] === 0) this.spots.push({ x: f[0] + Math.sin(f[3]) * 0.12, z: f[2] + Math.cos(f[3]) * 0.12, yaw: f[3], pose: 'sit' });
  }
  // someone to talk to: the nearest person roughly where you are looking
  lookAt(origin, dir, maxD = 4.5) { let best = null, bd = maxD; for (const f of this.list) { const dx = f.g.position.x - origin.x, dz = f.g.position.z - origin.z, dy = f.g.position.y + 1.4 - origin.y; const d = Math.hypot(dx, dy, dz); if (d > maxD || d < 0.3) continue; if ((dx * dir.x + dy * dir.y + dz * dir.z) / d < 0.9) continue; if (d < bd) { bd = d; best = f; } } return best; }
  talk(f, dark, towardYaw) { const c = f.who; const generic = dark ? ['Evening.', 'Nice night for a drive.', 'You be careful out there.'] : ['Hi there.', 'Morning.', 'Lovely day, isn\'t it?', 'Watch your speed round here, kids about.']; let line; if (c) { const bucket = f.spoke ? 'bye' : (dark && c.lines.night && c.lines.night.length ? 'night' : 'hi'); const a = c.lines[bucket] || c.lines.hi; line = a[(Math.random() * a.length) | 0]; f.spoke = !f.spoke; } else line = generic[(Math.random() * generic.length) | 0]; f.talkT = 3.5; if (f.kind !== 'walk' || true) { f.faceYaw = towardYaw; } return { name: c ? c.name : 'Passer-by', line, about: c ? c.job : '' }; }
  make(name) { const src = this.p[name], sex = /Female/.test(name) ? 'f' : 'm'; const g = new THREE.Group(); const body = SkeletonUtils.clone(src.scene); body.scale.multiplyScalar(src.fit * (0.96 + Math.random() * 0.08)); g.add(body); body.traverse((o) => { if (o.isMesh) { o.frustumCulled = false; o.castShadow = this.world.q.shadows; } });
    const mixer = new THREE.AnimationMixer(body), acts = {}; for (const k in this.clip[sex]) acts[k] = mixer.clipAction(this.clip[sex][k]); const who = (this.cast || []).find(c => c.av === name && !this.list.some(f => f.who === c)) || null; return { g, mixer, acts, cur: null, who }; }
  pose(f, name) { if (f.cur === name || !f.acts[name]) return; const a = f.acts[name]; a.reset().play(); if (f.cur) f.acts[f.cur].crossFadeTo(a, 0.3, false); a.time = Math.random() * a.getClip().duration; f.cur = name; }
  spawnWalker(px, pz) { const T = this.traffic; if (!T || !T.roads) return null;
    for (let tries = 0; tries < 25; tries++) { const r = T.roads[(Math.random() * T.roads.length) | 0]; if (r.c >= 9 || r.y) continue; const s = Math.random() * r.len; const o = T.pointAt(r, s, this._o); const d = Math.hypot(o.x - px, o.z - pz); if (d < 35 || d > 115) continue;
      const f = this.make(this.names[(Math.random() * this.names.length) | 0]); Object.assign(f, { kind: 'walk', r, s, dir: Math.random() < 0.5 ? 1 : -1, side: r.o ? 1 : (Math.random() < 0.5 ? 1 : -1), v: 1.15 + Math.random() * 0.4, x: o.x, z: o.z, y: 0, yaw: 0, init: false, pause: 0 }); this.pose(f, 'walk'); return f; }
    return null; }
  spawnSpot(px, pz) { if (!this.spots.length) return null; for (let tries = 0; tries < 40; tries++) { const sp = this.spots[(Math.random() * this.spots.length) | 0]; if (sp.used) continue; const d = Math.hypot(sp.x - px, sp.z - pz); if (d > 110) continue; sp.used = true; const f = this.make(this.names[(Math.random() * this.names.length) | 0]); Object.assign(f, { kind: 'spot', sp, x: sp.x, z: sp.z, yaw: sp.yaw }); this.pose(f, sp.pose); const y = this.world.surfaceY(sp.x, sp.z, 1e9); f.g.position.set(sp.x, y + (sp.pose === 'sit' ? 0.02 : 0.06), sp.z); f.g.rotation.y = sp.yaw; return f; } return null; }
  // returns circles for the player's car to collide with
  update(dt, player) {
    if (!this.ready) return []; const px = player.x, pz = player.z, W = this.world, T = this.traffic; const o = this._o;
    for (let i = this.list.length - 1; i >= 0; i--) { const f = this.list[i]; if (Math.hypot(f.x - px, f.z - pz) > 160) { this.scene.remove(f.g); f.mixer.stopAllAction(); if (f.sp) f.sp.used = false; this.list.splice(i, 1); } }
    if (this.list.length < this.count) { const walkers = this.list.filter(f => f.kind === 'walk').length; const f = walkers < this.count * 0.6 ? this.spawnWalker(px, pz) : (this.spawnSpot(px, pz) || this.spawnWalker(px, pz)); if (f) { this.list.push(f); this.scene.add(f.g); } }
    const circles = []; if (T) T.peds = this.list;
    for (const f of this.list) {
      if (f.kind === 'walk') {
        // wait for a car that is about to pass right in front
        let wait = false; const fx = Math.sin(f.yaw), fz = Math.cos(f.yaw); const chk = (cx, cz, cv) => { const dx = cx - f.x, dz = cz - f.z; const d = Math.hypot(dx, dz); if (d < 7 && cv > 2.5 && dx * fx + dz * fz > 0.5) wait = true; }; if (T) for (const c of T.cars) chk(c.x, c.z, c.v); chk(px, pz, player.speed || 0);
        if (f.talkT > 0) { f.talkT -= dt; f.pause = 0.3; this.pose(f, 'talk'); if (f.faceYaw !== undefined) f.g.rotation.y = f.faceYaw; f.mixer.update(dt); continue; }
        f.pause = wait ? 0.8 : Math.max(0, f.pause - dt); const moving = f.pause <= 0; this.pose(f, moving ? 'walk' : 'idle');
        if (moving) { f.s += f.dir * f.v * dt; if (f.s > f.r.len || f.s < 0) { const k = f.dir > 0 ? f.r.k1 : f.r.k0; const opts = (T.ends.get(k) || []).filter(e => e.r !== f.r && e.r.c < 9 && !e.r.y && e.r.len > 12); if (opts.length) { const e = opts[(Math.random() * opts.length) | 0]; f.r = e.r; f.dir = e.end === 0 ? 1 : -1; f.s = e.end === 0 ? 0 : e.r.len; if (f.r.o) f.side = 1; } else { f.dir *= -1; f.side *= -1; f.s = Math.max(0, Math.min(f.r.len, f.s)); } } }
        T.pointAt(f.r, f.s, o); const off = (f.r.w / 2 + 2.1) * f.side; const tx = o.x - o.dz * off, tz = o.z + o.dx * off; const k = f.init ? Math.min(1, dt * 2.5) : 1; f.x += (tx - f.x) * k; f.z += (tz - f.z) * k;
        const wantYaw = Math.atan2(o.dx * f.dir, o.dz * f.dir); let dy = wantYaw - f.yaw; while (dy > Math.PI) dy -= 2 * Math.PI; while (dy < -Math.PI) dy += 2 * Math.PI; f.yaw = f.init ? f.yaw + dy * Math.min(1, dt * 4) : wantYaw;
        const gy = W.surfaceY(f.x, f.z, f.init ? f.y + 1 : 1e9); f.y = f.init ? f.y + (gy - f.y) * Math.min(1, dt * 8) : gy; f.init = true; f.g.position.set(f.x, f.y + 0.05, f.z); f.g.rotation.y = f.yaw; // avatars face +Z; walking direction is (sin, cos) of the yaw
      }
      if (f.kind === 'spot' && f.talkT > 0) { f.talkT -= dt; this.pose(f, 'talk'); if (f.sp.pose !== 'sit' && f.faceYaw !== undefined) f.g.rotation.y = f.faceYaw; if (f.talkT <= 0) { this.pose(f, f.sp.pose); f.g.rotation.y = f.sp.yaw; } }
      const d = Math.hypot(f.x - px, f.z - pz); const dc = player.cam ? Math.hypot(f.x - player.cam.x, f.z - player.cam.z) : d; f.g.visible = dc < 140; if (dc < 70) f.mixer.update(dt); if (d < 25) circles.push([f.x, f.z, 0.32, (f.y || f.g.position.y) + 0.8]);
    }
    return circles;
  }
}
