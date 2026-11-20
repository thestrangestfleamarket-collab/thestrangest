// Aircraft entity: visual model (full / LOD), flight model, guns, missiles, damage, effects. Also the missile class.
import * as THREE from 'three';
import { FlightModel, G } from './physics.js';
import { ROCKET } from './planes.js';

const _v = new THREE.Vector3(), _v2 = new THREE.Vector3(), _v3 = new THREE.Vector3(), _q = new THREE.Quaternion(), _m = new THREE.Matrix4();
const clamp = (x, a, b) => x < a ? a : x > b ? b : x;

// model-space hard points (x right, y up, z back). zi = inset from the tail.
const NOZ = { f86: [[0, 0.1, 0.25]], mig15: [[0, 0.15, 0.6]], f4: [[-0.72, -0.5, 4.2], [0.72, -0.5, 4.2]], mig21: [[0, 0.05, 0.5]], f14: [[-1.42, -0.2, 0.9], [1.42, -0.2, 0.9]], f15: [[-0.85, -0.05, 0.9], [0.85, -0.05, 0.9]], f16: [[0, -0.1, 0.3]], mig29: [[-0.9, -0.3, 1.0], [0.9, -0.3, 1.0]], su27: [[-1.15, -0.45, 2.6], [1.15, -0.45, 2.6]], f22: [[-0.75, -0.1, 1.3], [0.75, -0.1, 1.3]] };
function muzzles(spec, len, span) {
  const id = spec.id;
  if (spec.era === 'WW1') return [[-0.16, 0.42, -len * 0.3], [0.16, 0.42, -len * 0.3]];
  if (id === 'bf109') return [[0, 0.05, -len * 0.5], [-0.22, 0.45, -len * 0.28], [0.22, 0.45, -len * 0.28]];
  if (id === 'zero') return [[-0.2, 0.45, -len * 0.3], [0.2, 0.45, -len * 0.3], [-2.1, -0.3, -1.6], [2.1, -0.3, -1.6]];
  if (spec.era === 'WW2') { const a = []; const n = spec.gun.n / 2; for (let i = 0; i < n; i++) { const x = span * 0.2 + i * 0.25; a.push([-x, -0.25, -1.6], [x, -0.25, -1.6]); } return a; }
  if (id === 'f86') return [[-0.55, 0, -len * 0.4], [0.55, 0, -len * 0.4], [-0.55, -0.2, -len * 0.4], [0.55, -0.2, -len * 0.4], [-0.55, -0.4, -len * 0.4], [0.55, -0.4, -len * 0.4]];
  if (id === 'mig15') return [[0.35, -0.75, -len * 0.38], [-0.35, -0.75, -len * 0.38], [-0.4, -0.75, -len * 0.3]];
  return [[0.75, 0.1, -len * 0.25]];
}

export class Aircraft {
  constructor(game, spec, asset, opts = {}) {
    this.game = game; this.spec = spec; this.meta = asset.meta; this.isPlayer = !!opts.player; this.team = opts.team ?? 0; this.name = opts.name || spec.name;
    const m = asset.meta; this.len = m.size[2]; this.span = m.size[0];
    this.fm = new FlightModel(spec, { len: this.len, gearY: Math.min(m.body.min[1], m.gear ? m.gear.min[1] : 9), propD: m.prop ? Math.min(3.4, Math.max(m.prop.max[0] - m.prop.min[0], m.prop.max[1] - m.prop.min[1])) : 0 });
    this.group = new THREE.Group(); this.group.rotation.order = 'YXZ';
    this.full = null; this.lod = null; this.asset = asset;
    if (this.isPlayer) this.setFull(true); else { this.lod = asset.lod.clone(); this.group.add(this.lod); }
    this.hpMax = 55 + Math.sqrt(spec.mass) * 1.25; this.hp = this.hpMax; this.alive = true; this.dead = false; this.removed = false; this.deadT = 0;
    this.ammo = spec.gun.ammo; this.rockets = spec.rockets || 0;
    this.firing = false; this.gunAcc = 0; this.gunIdx = 0; this.muz = muzzles(spec, this.len, this.span); this.masterArm = true;
    this.noz = (NOZ[spec.id] || []).map(n => new THREE.Vector3(n[0], n[1], this.len / 2 - n[2]));
    this.weapon = 'gun'; this.msCool = 0;
    this.kills = 0; this.ai = null; this.smokeAcc = 0; this.trailAcc = 0; this.lights = { nav: !this.isPlayer || true, landing: false, strobeT: Math.random() * 2 };
    this.hitRadius = Math.max(this.len, this.span) * 0.55; this.fwd = new THREE.Vector3(0, 0, -1); this.up = new THREE.Vector3(0, 1, 0); this.right = new THREE.Vector3(1, 0, 0);
    this.burners = [];
    if (spec.engine === 'jet') for (const n of this.noz) { const b = makeBurner(); b.position.copy(n); this.group.add(b); this.burners.push(b); }
    this.lastHitBy = null; this.gForceAvg = 1;
  }

  setFull(on) {
    if (on && !this.full) {
      this.full = this.asset.full.clone(); this.group.add(this.full);
      this.full.traverse(o => { if (o.isMesh) { o.castShadow = this.isPlayer; o.receiveShadow = this.isPlayer; } });
      if (this.isPlayer) { // cut the exterior model away around the pilot in cockpit view (the built cockpit replaces it)
        this.clipU = { uCkC: { value: new THREE.Vector3() }, uCkS: { value: new THREE.Vector3(1, 1, 1) }, uCkOn: { value: 0 } };
        for (const c of this.full.children) { if (c.name === 'glass' || c.name === 'prop') continue; c.traverse(o => { if (!o.isMesh) return; const m = o.material = o.material.clone(); m.onBeforeCompile = sh => { Object.assign(sh.uniforms, this.clipU);
          sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nvarying vec3 vMP;').replace('#include <begin_vertex>', '#include <begin_vertex>\nvMP = position;');
          sh.fragmentShader = sh.fragmentShader.replace('#include <common>', '#include <common>\nvarying vec3 vMP; uniform vec3 uCkC, uCkS; uniform float uCkOn;').replace('#include <clipping_planes_fragment>', '#include <clipping_planes_fragment>\nif (uCkOn > 0.5) { vec3 dq = abs(vMP - uCkC) / uCkS; if (max(dq.x, max(dq.y, dq.z)) < 1.0) discard; }'); }; }); } }
      this.parts = {}; for (const c of this.full.children) this.parts[c.name] = c;
      // propeller pivot
      const pr = this.parts.prop, mp = this.meta.prop;
      if (pr && mp) { const piv = new THREE.Group(); const c = new THREE.Vector3((mp.min[0] + mp.max[0]) / 2, (mp.min[1] + mp.max[1]) / 2, (mp.min[2] + mp.max[2]) / 2); if (Math.abs(c.x) < 0.25) c.x = 0; piv.position.copy(c); pr.position.sub(c); this.full.add(piv); piv.add(pr); this.propPivot = piv;
        const d = Math.max(mp.max[0] - mp.min[0], mp.max[1] - mp.min[1]); const disc = new THREE.Mesh(new THREE.CircleGeometry(Math.min(d, 3.4) / 2, 40), new THREE.MeshBasicMaterial({ color: 0x555049, transparent: true, opacity: 0.0, side: THREE.DoubleSide, depthWrite: false })); disc.position.copy(c); this.full.add(disc); this.propDisc = disc; }
      if (this.parts.glass) this.parts.glass.traverse(o => { if (o.isMesh) { o.material = this.glassMat = new THREE.MeshPhysicalMaterial({ color: 0x9fb4b8, transparent: true, opacity: 0.16, roughness: 0.04, metalness: 0, side: THREE.DoubleSide, depthWrite: false, envMapIntensity: 1.6, specularIntensity: 1 }); o.castShadow = false; o.renderOrder = 4; } });
      if (this.parts.fx) this.parts.fx.traverse(o => { if (o.isMesh) { o.castShadow = false; o.material.depthWrite = false; } });
    }
    if (this.full) this.full.visible = on; if (this.lod) this.lod.visible = !on;
  }

  spawn(pos, heading, speed, onGround = false) {
    this.fm.reset(pos, heading, speed, onGround); this.hp = this.hpMax; this.alive = true; this.dead = false; this.removed = false; this.group.visible = true; this.deadT = 0;
    this.ammo = this.spec.gun.ammo; this.rockets = this.spec.rockets || 0; this.sync();
  }
  sync() { this.group.position.copy(this.fm.pos); this.group.quaternion.copy(this.fm.quat); this.fwd.set(0, 0, -1).applyQuaternion(this.fm.quat); this.up.set(0, 1, 0).applyQuaternion(this.fm.quat); this.right.set(1, 0, 0).applyQuaternion(this.fm.quat); }

  update(dt) {
    if (this.removed) return; const g = this.game, fm = this.fm;
    if (this.ai && this.alive) this.ai.update(dt);
    if (!this.alive) { fm.ctl.pitch = 0.25; fm.ctl.roll = 0.9; fm.ctl.throttle = 0; fm.damage.wing = 1; fm.damage.engine = 1; }
    const n = Math.max(1, Math.min(8, Math.ceil(dt * 120))), h = dt / n;
    for (let i = 0; i < n; i++) fm.step(h, g.world.ground);
    this.sync(); this.gForceAvg += (fm.gLoad - this.gForceAvg) * Math.min(1, dt * 3);
    if (!fm.crashed && fm.agl < 90 && g.world.obstacleTop(fm.pos.x, fm.pos.z) > fm.pos.y + fm.gearY * 0.5) fm.crashed = 'ground'; // buildings, forest canopy
    if (this.alive && fm.damage.wing >= 1 && fm.overspeed) this.damage(this.hpMax, this.lastHitBy);
    if (fm.crashed) { this.crash(); return; }
    const camD = this.group.position.distanceTo(g.camPos);
    if (!this.isPlayer) { const wantFull = camD < 260; if (wantFull !== !!(this.full && this.full.visible)) this.setFull(wantFull); this.group.visible = camD < 32000; }
    // propeller
    if (this.propPivot) { const rpm = fm.rpm; this.propPivot.rotation.z -= dt * (rpm > 0.3 ? 38 + rpm * 9 : rpm * 60); const fast = rpm > 0.4; // blades blur into a disc at speed
      if (this.propDisc) { this.propDisc.material.opacity = fast ? 0.2 + rpm * 0.16 : 0; this.propDisc.visible = fast; } if (this.parts.prop && !this.parts.fx) this.parts.prop.visible = !fast; }
    if (this.parts?.gear) { const gp = fm.gearPos, gm = this.meta.gear; this.parts.gear.visible = gp > 0.03; this.parts.gear.scale.y = Math.max(gp, 0.03); this.parts.gear.position.y = gm.max[1] * (1 - Math.max(gp, 0.03)); }
    this.updateShadow();
    // afterburner / exhaust flame
    for (const b of this.burners) { const ab = fm.ab, hot = clamp((fm.rpm - 0.6) / 0.4, 0, 1); b.visible = ab > 0.02 || hot > 0.3 && g.night > 0.3; b.scale.set(1, 1, 0.25 + ab * (0.9 + Math.random() * 0.12)); b.material.uniforms.uI.value = ab * 1.0 + hot * 0.12; }
    // weapons
    this.msCool -= dt;
    if (this.firing && this.alive && this.masterArm && this.ammo > 0) this.fireGuns(dt); else this.gunAcc = Math.min(this.gunAcc, 0);
    // effects
    if (camD < 9000) this.emit(dt, camD);
    if (!this.alive) { this.deadT += dt; if (this.deadT > 120) this.crash(); }
  }

  // soft contact shadow on the ground when low
  updateShadow() {
    const g = this.game, fm = this.fm; if (!this.shadow) { this.shadow = new THREE.Mesh(shadowGeo, shadowMat.clone()); this.shadow.renderOrder = 2; g.scene.add(this.shadow); }
    const sd = g.sunDir, h = fm.agl; const on = h < 350 && sd.y > 0.08 && !this.removed; this.shadow.visible = on; if (!on) return;
    const k = h / sd.y, x = fm.pos.x - sd.x * k, z = fm.pos.z - sd.z * k; this.shadow.position.set(x, g.world.ground(x, z) + 0.25 + h * 0.004, z); this.shadow.rotation.y = Math.atan2(-this.fwd.x, -this.fwd.z);
    const s = 1 + h * 0.012; this.shadow.scale.set(this.span * 0.55 * s, 1, this.len * 0.55 * s); this.shadow.material.opacity = 0.55 * (1 - h / 350) / s;
  }
  dispose() { if (this.shadow) { this.game.scene.remove(this.shadow); this.shadow.material.dispose(); } this.group.parent?.remove(this.group); if (this.isPlayer && this.full) this.full.traverse(o => { if (o.isMesh && o.material && o.material.onBeforeCompile) o.material.dispose(); }); }

  fireGuns(dt) {
    const s = this.spec.gun, g = this.game; this.gunAcc += dt * s.rof * s.n;
    while (this.gunAcc >= 1 && this.ammo > 0) { this.gunAcc -= 1; this.ammo--; const m = this.muz[this.gunIdx++ % this.muz.length];
      _v.set(m[0], m[1], m[2]).applyQuaternion(this.fm.quat).add(this.fm.pos);
      // converge at 280 m
      _v2.set(-m[0] / 280 + (Math.random() - 0.5) * 2 * s.spread, -m[1] / 400 + 0.004 + (Math.random() - 0.5) * 2 * s.spread, -1).normalize().applyQuaternion(this.fm.quat).multiplyScalar(s.v0).add(this.fm.vel);
      _v.addScaledVector(_v2, Math.random() * dt + 0.004);
      g.tracers.fire(_v, _v2, this, s.dmg);
      if (Math.random() < 0.5) g.particles.spawn(_v.x, _v.y, _v.z, this.fm.vel.x, this.fm.vel.y, this.fm.vel.z, 0.05, 0.25, 0.6, 9, 5, 1.5, 0.9, true); }
  }

  fireRocket() {
    if (!this.alive || !this.masterArm || this.msCool > 0 || this.rockets <= 0) return false;
    this.rockets--; this.msCool = 0.35; const side = (this.rockets % 2 ? 1 : -1) * this.span * 0.3;
    _v.set(side, -0.6, 0).applyQuaternion(this.fm.quat).add(this.fm.pos); this.game.spawnRocket(this, _v); return true;
  }
  cycleWeapon() { this.weapon = this.weapon === 'gun' && this.spec.rockets ? 'rocket' : 'gun'; return this.weapon; }

  damage(amount, by, local) {
    if (!this.alive) return; this.hp -= amount; this.lastHitBy = by; const d = this.fm.damage, r = Math.random();
    const sev = amount / this.hpMax;
    if (r < 0.3) d.engine = Math.min(0.95, d.engine + sev * 1.6); else if (r < 0.55) d.wing = Math.min(0.8, d.wing + sev * 1.2); else if (r < 0.7) d.ctl = Math.min(0.8, d.ctl + sev * 1.5);
    if (this.ai) this.ai.onHit(by);
    if (this.hp <= 0) { this.alive = false; this.game.onKill(this, by); this.game.particles.explosion(this.fm.pos, this.fm.vel, 0.9); this.game.audio?.explosionAt(this.fm.pos, 1); }
  }
  crash() {
    if (this.removed) return; const g = this.game, wasAlive = this.alive; this.alive = false; this.removed = true; this.group.visible = false;
    g.particles.explosion(this.fm.pos, _v.set(0, 6, 0), this.fm.crashed === 'water' ? 0.8 : 1.7); g.audio?.explosionAt(this.fm.pos, 1.4);
    if (this.fm.crashed === 'water') for (let i = 0; i < 20; i++) g.particles.spawn(this.fm.pos.x, 1, this.fm.pos.z, (Math.random() - 0.5) * 20, 14 + Math.random() * 30, (Math.random() - 0.5) * 20, 2.2, 3, 14, 0.9, 0.95, 1, 0.8);
    if (this.shadow) this.shadow.visible = false;
    if (wasAlive) g.onKill(this, this.lastHitBy, true);
  }

  emit(dt, camD) {
    const g = this.game, fm = this.fm, p = fm.pos, v = fm.vel, P = g.particles; const hpF = this.hp / this.hpMax;
    this.smokeAcc += dt;
    const tail = _v.copy(this.fwd).multiplyScalar(-this.len * 0.35).add(p);
    if ((hpF < 0.6 || fm.damage.engine > 0.3) && this.smokeAcc > 0.035) { this.smokeAcc = 0; const dark = hpF < 0.3 || !this.alive ? 0.05 : 0.32;
      P.spawn(tail.x, tail.y, tail.z, v.x * 0.15, v.y * 0.15, v.z * 0.15, 2.4 + Math.random() * 2, 1.2, 8 + Math.random() * 6, dark, dark, dark, 0.55);
      if (hpF < 0.3 || !this.alive) P.spawn(tail.x, tail.y, tail.z, v.x * 0.7, v.y * 0.7, v.z * 0.7, 0.3, 1.5, 3.5, 7, 2.6, 0.5, 0.9, true); }
    // contrails
    if (this.alive && fm.alt > 7200 && fm.rpm > 0.6 && this.spec.engine === 'jet') { this.trailAcc += dt; if (this.trailAcc > 0.05) { this.trailAcc = 0; for (const n of this.noz) { _v2.copy(n).applyQuaternion(fm.quat).add(p); P.spawn(_v2.x, _v2.y, _v2.z, 0, 0, 0, 9, 1.5, 9, 1, 1, 1, 0.3); } } }
    // wingtip vapour under heavy g
    if (this.alive && Math.abs(fm.gLoad) > 5.5 && fm.ias > 90 && Math.random() < 0.6) for (const s of [-1, 1]) { _v2.copy(this.right).multiplyScalar(s * this.span * 0.48).add(p); P.spawn(_v2.x, _v2.y, _v2.z, v.x * 0.2, v.y * 0.2, v.z * 0.2, 0.5, 0.3, 1.6, 1, 1, 1, 0.3); }
    // nav lights + strobes + engine glow (drawn through the shared glow batch)
    const L = g.glows, nt = g.night; this.lights.strobeT += dt;
    if (this.lights.nav && this.alive && camD < 8000) { const k = 0.25 + nt * 0.9, s = 0.1 + nt * 0.1; const tipY = -0.1;
      _v2.copy(this.right).multiplyScalar(-this.span * 0.49).addScaledVector(this.up, tipY).add(p); L.add(_v2.x, _v2.y, _v2.z, s, 2.4 * k, 0.1 * k, 0.08 * k);
      _v2.copy(this.right).multiplyScalar(this.span * 0.49).addScaledVector(this.up, tipY).add(p); L.add(_v2.x, _v2.y, _v2.z, s, 0.08 * k, 2.2 * k, 0.3 * k);
      _v2.copy(this.fwd).multiplyScalar(-this.len * 0.49).add(p); L.add(_v2.x, _v2.y, _v2.z, s, 1.4 * k, 1.4 * k, 1.4 * k);
      if (this.spec.engine === 'jet' && this.lights.strobeT % 1.3 < 0.06) { _v2.copy(this.up).multiplyScalar(-1.0).add(p); L.add(_v2.x, _v2.y, _v2.z, 0.35, 5, 0.4, 0.3); } }
    if (this.lights.landing && this.alive) { _v2.copy(this.fwd).multiplyScalar(this.len * 0.2).addScaledVector(this.up, -0.9).add(p); L.add(_v2.x, _v2.y, _v2.z, 0.35, 6, 5.6, 4.6); }
    if (fm.ab > 0.05) for (const n of this.noz) { _v2.copy(n).applyQuaternion(fm.quat).add(p).addScaledVector(this.fwd, -1.5); L.add(_v2.x, _v2.y, _v2.z, 0.6 + fm.ab * 0.25, 0.9 * fm.ab, 0.4 * fm.ab, 0.14 * fm.ab); }
    if (this.firing && this.ammo > 0 && this.masterArm && this.alive) { const m = this.muz[this.gunIdx % this.muz.length]; _v2.set(m[0], m[1], m[2] - 0.5).applyQuaternion(fm.quat).add(p); L.add(_v2.x, _v2.y, _v2.z, 0.5 + Math.random() * 0.5, 5, 3.2, 1); }
  }

  // segment (world) vs this aircraft: fuselage + wing boxes in local space
  hitTest(x0, y0, z0, x1, y1, z1) {
    const p = this.fm.pos, R = this.hitRadius + 3; const mx = (x0 + x1) / 2 - p.x, my = (y0 + y1) / 2 - p.y, mz = (z0 + z1) / 2 - p.z; const hl = Math.hypot(x1 - x0, y1 - y0, z1 - z0) / 2;
    if (mx * mx + my * my + mz * mz > (R + hl) * (R + hl)) return false;
    _q.copy(this.fm.quat).invert(); _v.set(x0 - p.x, y0 - p.y, z0 - p.z).applyQuaternion(_q); _v2.set(x1 - p.x, y1 - p.y, z1 - p.z).applyQuaternion(_q);
    const L = this.len / 2, S = this.span / 2; return segBox(_v, _v2, 1.0, 1.1, L) || segBox(_v, _v2, S, 0.45, Math.max(1.6, this.len * 0.16));
  }
}
function segBox(a, b, hx, hy, hz) { let t0 = 0, t1 = 1; const d = [b.x - a.x, b.y - a.y, b.z - a.z], o = [a.x, a.y, a.z], h = [hx, hy, hz];
  for (let i = 0; i < 3; i++) { if (Math.abs(d[i]) < 1e-9) { if (Math.abs(o[i]) > h[i]) return false; } else { let ta = (-h[i] - o[i]) / d[i], tb = (h[i] - o[i]) / d[i]; if (ta > tb) { const t = ta; ta = tb; tb = t; } t0 = Math.max(t0, ta); t1 = Math.min(t1, tb); if (t0 > t1) return false; } } return true; }

const shadowGeo = new THREE.PlaneGeometry(2, 2).rotateX(-Math.PI / 2);
const shadowMat = new THREE.ShaderMaterial({ uniforms: { opacity: { value: 0.5 } }, transparent: true, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -6, polygonOffsetUnits: -6,
  vertexShader: 'varying vec2 vU; void main(){ vU = uv * 2.0 - 1.0; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
  fragmentShader: 'uniform float opacity; varying vec2 vU; void main(){ float wing = smoothstep(1.0, 0.55, abs(vU.x)) * smoothstep(0.3, 0.08, abs(vU.y + 0.08)); float body = smoothstep(0.2, 0.05, abs(vU.x)) * smoothstep(1.0, 0.75, abs(vU.y)); gl_FragColor = vec4(0.0, 0.0, 0.0, opacity * clamp(max(wing, body), 0.0, 1.0)); }' });
Object.defineProperty(shadowMat, 'opacity', { get() { return this.uniforms.opacity.value; }, set(v) { if (this.uniforms) this.uniforms.opacity.value = v; } });
const burnerGeo = new THREE.ConeGeometry(0.46, 7, 14, 1, true).rotateX(-Math.PI / 2).translate(0, 0, 3.5);
function makeBurner() {
  const m = new THREE.Mesh(burnerGeo, new THREE.ShaderMaterial({ uniforms: { uI: { value: 0 } }, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide, fog: false,
    vertexShader: `varying float vZ; varying vec3 vN, vV; void main(){ vZ = position.z / 7.0; vec4 mv = modelViewMatrix * vec4(position, 1.0); vN = normalMatrix * normal; vV = -mv.xyz; gl_Position = projectionMatrix * mv; }`,
    fragmentShader: `uniform float uI; varying float vZ; varying vec3 vN, vV; void main(){ float rim = abs(dot(normalize(vN), normalize(vV))); float d = sin(vZ * 38.0) * 0.5 + 0.5;
      vec3 c = mix(vec3(0.55, 0.65, 1.0), vec3(1.0, 0.5, 0.14), smoothstep(0.0, 0.5, vZ)) * (1.0 - vZ) * (1.0 - vZ) * (0.5 + rim) * (0.75 + 0.5 * d * (1.0 - vZ)); gl_FragColor = vec4(c * uI * 3.0, 1.0);
      #include <tonemapping_fragment>
      #include <colorspace_fragment>
    }` }));
  m.visible = false; m.renderOrder = 7; return m;
}

// ---------- unguided rockets (straight-flying projectiles with a blast radius) ----------
const rocketGeo = new THREE.CylinderGeometry(0.065, 0.065, 2.6, 8).rotateX(Math.PI / 2);
const rocketMat = new THREE.MeshStandardMaterial({ color: 0xd8d8d8, roughness: 0.5, metalness: 0.4 });
export class Rocket {
  constructor(game, owner, pos) {
    this.game = game; this.owner = owner; this.t = 0; this.alive = true; this.pos = pos.clone(); this.prev = pos.clone();
    this.dir = owner.fwd.clone(); this.vel = owner.fm.vel.clone().addScaledVector(owner.up, -4);
    this.mesh = new THREE.Mesh(rocketGeo, rocketMat); game.scene.add(this.mesh);
  }
  update(dt) {
    const g = this.game; this.t += dt; this.prev.copy(this.pos);
    if (this.t < ROCKET.burn) this.vel.addScaledVector(this.dir, ROCKET.accel * dt);
    this.vel.y -= G * dt; this.vel.multiplyScalar(1 - 0.05 * dt); this.pos.addScaledVector(this.vel, dt);
    this.mesh.position.copy(this.pos); _v.copy(this.pos).add(this.vel); this.mesh.lookAt(_v);
    const P = g.particles, p = this.pos;
    if (this.t < ROCKET.burn) { g.glows.add(p.x, p.y, p.z, 1.2, 5, 3, 1.2); P.spawn(p.x, p.y, p.z, 0, 0, 0, 2.2, 0.6, 5, 0.9, 0.9, 0.9, 0.4); }
    let hit = p.y <= g.world.ground(p.x, p.z) || this.t > ROCKET.life;
    if (!hit) for (const o of g.aircraft) { if (o === this.owner || o.removed) continue; if (o.hitTest(this.prev.x, this.prev.y, this.prev.z, p.x, p.y, p.z)) { hit = true; break; } }
    if (hit) this.explode();
  }
  explode() {
    const g = this.game; this.alive = false; g.scene.remove(this.mesh); g.particles.explosion(this.pos, _v.set(0, 0, 0), 1.1); g.audio?.explosionAt(this.pos, 1);
    for (const o of g.aircraft) { if (o.removed || !o.alive || o.team === this.owner.team) continue; const d = o.fm.pos.distanceTo(this.pos); if (d < ROCKET.blast + o.hitRadius * 0.5) o.damage(ROCKET.dmg * clamp(1.2 - d / (ROCKET.blast + o.hitRadius * 0.5), 0.2, 1), this.owner); }
  }
}
