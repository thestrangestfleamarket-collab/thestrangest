// Game rules and simulation. Everything here is in "arena space": origin on the floor at
// the middle of the centre line, X along the line, player 0 (host) on +Z, player 1 on -Z.
//
// Authority model: each device decides hits on ITS OWN player (it knows that body with zero
// lag, so dodges are fair). Projectiles are sent once as a spawn event and simulated on both
// sides. The host alone decides when a round ends.
import * as THREE from 'three';
import { WEAPONS, ORDER } from './weapons.js';
import { sfx } from './audio.js';

export const SHIELD_R = 0.3, HEAD_R = 0.13, BODY_R = 0.2;
const PARRY_WINDOW = 0.3;
const _a = new THREE.Vector3(), _b = new THREE.Vector3(), _c = new THREE.Vector3(),
  _d = new THREE.Vector3(), _e = new THREE.Vector3(), _f = new THREE.Vector3(),
  _n = new THREE.Vector3(), _s = new THREE.Vector3();
const clamp01 = (x) => Math.max(0, Math.min(1, x));
const arr = (v) => [+v.x.toFixed(3), +v.y.toFixed(3), +v.z.toFixed(3)];

function distPointSeg(p, a, b) {
  _c.subVectors(b, a);
  const len2 = _c.lengthSq();
  const t = len2 > 1e-9 ? clamp01(_d.subVectors(p, a).dot(_c) / len2) : 0;
  return _d.copy(a).addScaledVector(_c, t).distanceTo(p);
}

function distSegSeg(p1, q1, p2, q2) {
  const d1 = _c.subVectors(q1, p1), d2 = _d.subVectors(q2, p2), r = _e.subVectors(p1, p2);
  const a = d1.dot(d1), e = d2.dot(d2), f = d2.dot(r);
  let s, t;
  if (a <= 1e-9 && e <= 1e-9) return r.length();
  if (a <= 1e-9) { s = 0; t = clamp01(f / e); }
  else {
    const c = d1.dot(r);
    if (e <= 1e-9) { t = 0; s = clamp01(-c / a); }
    else {
      const b = d1.dot(d2), denom = a * e - b * b;
      s = denom > 1e-9 ? clamp01((b * f - c * e) / denom) : 0;
      t = (b * s + f) / e;
      if (t < 0) { t = 0; s = clamp01(-c / a); }
      else if (t > 1) { t = 1; s = clamp01((b - c) / a); }
    }
  }
  _f.copy(p1).addScaledVector(d1, s);
  return _f.distanceTo(_e.copy(p2).addScaledVector(d2, t));
}

export class Actor {
  constructor(id) {
    this.id = id;
    const side = id === 0 ? 1 : -1;
    this.head = new THREE.Vector3(0, 1.6, side * 1.8);
    this.lh = new THREE.Vector3(-0.2 * side, 1.3, side * 1.5);
    this.rh = new THREE.Vector3(0.2 * side, 1.3, side * 1.5);
    this.aim = new THREE.Vector3(0, 0, -side);
    this.height = 1.6;        // standing head height; crouching = head below this
    this.hp = 100;
    this.energy = 100;        // shield energy
    this.shieldUp = false;
    this.shieldSince = 0;
    this.shieldLock = false;  // drained: must release before raising again
    this.weapon = 0;
    this.charging = false;
    this.frozen = 0;          // seconds the launcher stays iced up
    this.burnAcc = 0;
    this.target = null;       // latest network pose (remote actors only)
  }
  feetY() { return Math.max(0, this.head.y - this.height); }
  // Torso+legs capsule axis. Shrinks when you duck, lifts when you jump.
  bodySeg(a, b) {
    const f = this.feetY();
    a.set(this.head.x, f + BODY_R, this.head.z);
    b.set(this.head.x, Math.max(f + BODY_R + 0.05, this.head.y - 0.32), this.head.z);
  }
}

// Distance from a point to the actor's surface (<= 0 means inside).
export function distToActor(actor, p) {
  actor.bodySeg(_a, _b);
  return Math.min(p.distanceTo(actor.head) - HEAD_R, distPointSeg(p, _a, _b) - BODY_R);
}

function barDistToActor(actor, s0, s1) {
  actor.bodySeg(_a, _b);
  return Math.min(distPointSeg(actor.head, s0, s1) - HEAD_R, distSegSeg(s0, s1, _a, _b) - BODY_R);
}

export class Game {
  constructor({ root, fx, localId, botId = null, send = null, hooks = {} }) {
    this.root = root; this.fx = fx;
    this.localId = localId; this.botId = botId;
    this.send = send; this.hooks = hooks;
    this.isHost = localId === 0;
    this.actors = [new Actor(0), new Actor(1)];
    this.projectiles = new Map();
    this.exploded = new Set();
    this.bounds = { hx: 2, hz: 3, h: 2.6 };
    this.phase = 'waiting';
    this.ready = [false, false];
    if (botId !== null) this.ready[botId] = true;
    this.round = 0; this.score = [0, 0]; this.winner = null;
    this.timer = 0; this.time = 0; this.fightTime = 0;
    this.cd = [{}, {}];
    this.counter = 0;
    this.hazards = [];         // burning patches of floor
    fx.bounds = this.bounds;
  }

  get local() { return this.actors[this.localId]; }
  get remote() { return this.actors[1 - this.localId]; }
  isAuth(id) { return id === this.localId || id === this.botId; }

  emit(ev) { this.apply(ev); this.send?.(ev); }

  onMessage(ev) {
    if (!ev || typeof ev.t !== 'string') return;
    if (ev.t === 'p') { this.remote.target = ev; return; }
    this.apply(ev);
  }

  // ---- player actions -------------------------------------------------------------

  setReady(id, height) {
    if (this.phase !== 'waiting' && this.phase !== 'matchEnd') return;
    if (this.ready[id]) return;
    this.emit({ t: 'ready', a: id, h: +height.toFixed(2) });
  }

  cdFrac(id, type) {
    const until = this.cd[id][type] || 0;
    return clamp01((until - this.time) / WEAPONS[type].cd);
  }

  liveOf(id, type) {
    const out = [];
    for (const p of this.projectiles.values()) if (p.owner === id && p.type === type) out.push(p);
    return out;
  }

  // Returns 'fired', 'detonated' or null.
  fire(id, type, origin, dir, axis) {
    if (this.phase !== 'fight' || this.actors[id].frozen > 0) return null;
    const W = WEAPONS[type];
    if (W.detonate) {
      const live = this.liveOf(id, type);
      if (live.length) { for (const p of live) this.explode(p); return 'detonated'; }
    }
    if ((this.cd[id][type] || 0) > this.time) return null;
    this.cd[id][type] = this.time + W.cd;
    if (W.max) {
      const live = this.liveOf(id, type);
      if (live.length >= W.max) this.emit({ t: 'kill', id: live[0].id, p: arr(live[0].pos) });
    }
    _a.copy(dir).normalize();
    const ev = { t: 'spawn', id: `${id}-${this.counter++}`, o: id, w: type, p: arr(origin), v: arr(_a.multiplyScalar(W.speed)) };
    if (W.bar) ev.x = arr(_b.copy(axis).normalize());
    this.emit(ev);
    return 'fired';
  }

  setShield(id, want, dt) {
    const a = this.actors[id];
    if (!want) a.shieldLock = false;
    const up = !!want && !a.shieldLock && a.energy > 0 && this.phase === 'fight';
    if (up && !a.shieldUp) a.shieldSince = this.time;
    a.shieldUp = up;
    if (up) {
      a.energy -= 30 * dt;
      if (a.energy <= 0) { a.energy = 0; a.shieldUp = false; a.shieldLock = true; }
    } else a.energy = Math.min(100, a.energy + 18 * dt);
  }

  explode(p) { this.emit({ t: 'explode', id: p.id, w: p.type, o: p.owner, p: arr(p.pos) }); }

  damage(a, amount) {
    if (this.phase !== 'fight') return;
    amount = Math.round(amount);
    if (amount < 1) return;
    this.emit({ t: 'dmg', a: a.id, hp: Math.max(0, a.hp - amount), amt: amount });
  }

  // ---- events (applied identically on both devices) ---------------------------------

  apply(ev) {
    switch (ev.t) {
      case 'spawn': {
        if (this.projectiles.has(ev.id)) return;
        const hostile = ev.o !== this.localId;
        const p = {
          id: ev.id, owner: ev.o, type: ev.w, age: 0, bounces: 0, dead: false,
          pos: new THREE.Vector3().fromArray(ev.p), vel: new THREE.Vector3().fromArray(ev.v),
          axis: ev.x ? new THREE.Vector3().fromArray(ev.x) : null,
          mesh: this.fx.projectile(ev.w, hostile),
        };
        this.root.add(p.mesh);
        this.fx.place(p, this.time);
        this.projectiles.set(p.id, p);
        this.fx.muzzle(p.pos, p.vel, p.mesh.userData.color);
        sfx(ev.w);
        break;
      }
      case 'kill': {
        const p = this.projectiles.get(ev.id);
        if (!p) return;
        this.remove(p);
        this.fx.puff(p.pos, ev.fx === 'block' || ev.fx === 'parry' ? 0x88ccff : 0xffffff, ev.fx ? 0.25 : 0.12);
        if (ev.fx) sfx(ev.fx);
        if (ev.fx === 'block' || ev.fx === 'parry') {
          this.hooks.onShieldHit?.(ev.a);
          if (ev.a === this.localId) this.hooks.onBlock?.(ev.fx);
        }
        break;
      }
      case 'explode': {
        if (this.exploded.has(ev.id)) return;
        this.exploded.add(ev.id);
        const p = this.projectiles.get(ev.id);
        if (p) this.remove(p);
        const W = WEAPONS[ev.w];
        const pos = _a.fromArray(ev.p).clone();
        this.fx.explosion(pos, W.blast, W.color);
        this.fx.blastMarks(pos, ev.w);
        sfx('explode');
        if (W.burn && pos.y < 0.9 && this.phase === 'fight') {   // fire weapons leave the floor burning
          this.hazards.push({ x: pos.x, z: pos.z, r: 0.55, t: 5 });
          this.fx.fire(pos, 0.55, 5);
        }
        for (const a of this.actors) {
          if (!this.isAuth(a.id)) continue;
          const d = Math.max(0, distToActor(a, pos));
          if (d >= W.blast) continue;
          let dmg = W.blastDmg * (1 - d / W.blast);
          if (a.shieldUp) dmg *= 0.5;
          if (a.id === ev.o) dmg *= 0.5; // your own blast hurts, but less
          this.damage(a, dmg);
          if (W.cryo && this.phase === 'fight') {
            a.frozen = a.shieldUp ? W.cryo * 0.5 : W.cryo;
            if (a.id === this.localId) this.hooks.onFrozen?.();
          }
        }
        break;
      }
      case 'dmg': {
        const a = this.actors[ev.a];
        a.hp = ev.hp;
        if (a.id === this.localId) { sfx('hurt'); this.hooks.onHurt?.(ev.amt); }
        else { sfx('hit'); this.fx.puff(a.head, 0xff4466, 0.3, 0.3); }
        if (this.isHost && a.hp <= 0 && this.phase === 'fight') {
          const score = this.score.slice();
          const winner = 1 - a.id;
          score[winner]++;
          this.emit({ t: 'roundEnd', winner, score, match: score[winner] >= 2 });
        }
        break;
      }
      case 'ready': {
        this.ready[ev.a] = true;
        this.actors[ev.a].height = ev.h;
        if (this.isHost && this.ready[0] && this.ready[1] && (this.phase === 'waiting' || this.phase === 'matchEnd')) {
          this.emit({ t: 'start', round: 1, score: [0, 0] });
        }
        break;
      }
      case 'start': {
        this.clearProjectiles();
        if (ev.round === 1) this.fx.scars.clear();   // new match, fresh room
        this.round = ev.round; this.score = ev.score;
        this.phase = 'countdown'; this.timer = 3; this.lastBeep = 4;
        for (const a of this.actors) { a.hp = 100; a.energy = 100; a.shieldUp = false; a.frozen = 0; a.burnAcc = 0; }
        this.cd = [{}, {}];
        break;
      }
      case 'roundEnd': {
        if (this.phase !== 'fight' && this.phase !== 'countdown') return;
        this.score = ev.score; this.winner = ev.winner;
        this.phase = ev.match ? 'matchEnd' : 'roundEnd';
        this.timer = 4;
        this.clearProjectiles();
        for (const a of this.actors) a.shieldUp = false;
        if (ev.match) {
          this.ready = [false, false];
          if (this.botId !== null) this.ready[this.botId] = true;
        }
        sfx(ev.winner === this.localId ? 'win' : 'lose');
        break;
      }
    }
  }

  remove(p) {
    p.dead = true;
    this.projectiles.delete(p.id);
    this.root.remove(p.mesh);
  }

  clearProjectiles() {
    for (const p of [...this.projectiles.values()]) { this.fx.puff(p.pos, 0xffffff); this.remove(p); }
    this.exploded.clear();
    this.hazards.length = 0;
    this.fx.scars.clearFires();
  }

  // ---- simulation -----------------------------------------------------------------

  update(dt) {
    this.time += dt;

    if (this.phase === 'countdown') {
      this.timer -= dt;
      const n = Math.ceil(this.timer);
      if (n < this.lastBeep && n > 0) { this.lastBeep = n; sfx('beep'); }
      if (this.timer <= 0) { this.phase = 'fight'; this.fightTime = 0; sfx('go'); }
    } else if (this.phase === 'fight') {
      this.fightTime += dt;
    } else if (this.phase === 'roundEnd') {
      this.timer -= dt;
      if (this.timer <= 0 && this.isHost) this.emit({ t: 'start', round: this.round + 1, score: this.score });
    }

    // Smooth the remote player toward their latest network pose.
    for (const a of this.actors) {
      if (this.isAuth(a.id) || !a.target) continue;
      const m = a.target, k = 1 - Math.exp(-dt * 25);
      a.head.lerp(_a.fromArray(m.h), k);
      a.lh.lerp(_a.fromArray(m.l), k);
      a.rh.lerp(_a.fromArray(m.r), k);
      a.aim.fromArray(m.d);
      a.shieldUp = !!m.s;
      a.weapon = m.w | 0;
      a.frozen = m.z ? 1 : 0;
    }

    // Burning floor hurts whoever stands in it; frozen launchers thaw.
    for (let i = this.hazards.length - 1; i >= 0; i--) if ((this.hazards[i].t -= dt) <= 0) this.hazards.splice(i, 1);
    for (const a of this.actors) {
      if (!this.isAuth(a.id)) continue;
      a.frozen = Math.max(0, a.frozen - dt);
      if (this.phase !== 'fight' || a.feetY() > 0.25) continue;
      for (const h of this.hazards) {
        if (Math.hypot(a.head.x - h.x, a.head.z - h.z) < h.r + 0.15) { a.burnAcc += 7 * dt; break; }
      }
      if (a.burnAcc >= 2) { a.burnAcc -= 2; this.damage(a, 2); }
    }

    const list = [...this.projectiles.values()];
    for (const p of list) if (!p.dead) this.stepProjectile(p, dt);
    if (this.phase === 'fight') {
      for (const a of this.actors) if (this.isAuth(a.id)) this.checkHits(a, list);
    }
    for (const p of this.projectiles.values()) this.fx.place(p, this.time);
  }

  stepProjectile(p, dt) {
    const W = WEAPONS[p.type], B = this.bounds;
    p.age += dt;

    if (W.homing && p.age > W.homingDelay && p.age < W.homingEnd) {
      const foe = this.actors[1 - p.owner];
      const want = _a.copy(foe.head); want.y -= 0.25; want.sub(p.pos).normalize();
      const speed = Math.min(W.maxSpeed, p.vel.length() + W.accel * dt);
      const dir = _b.copy(p.vel).normalize();
      const angle = dir.angleTo(want);
      if (angle > 1e-4) dir.lerp(want, Math.min(1, W.turn * dt / angle)).normalize();
      p.vel.copy(dir).multiplyScalar(speed);
      if (Math.random() < 0.5) this.fx.puff(_c.copy(p.pos).addScaledVector(dir, -0.2), 0xffaa33, 0.05, 0.3);
    }
    if (W.drag) p.vel.multiplyScalar(Math.exp(-W.drag * dt));
    p.pos.addScaledVector(p.vel, dt);

    // Arena walls, floor and ceiling.
    const r = W.r;
    let hit = false;
    _n.set(0, 0, 0);
    const wall = (axis, lo, hi) => {
      if (p.pos[axis] < lo) { p.pos[axis] = lo; if (p.vel[axis] < 0) p.vel[axis] *= -1; hit = true; _n.set(0, 0, 0)[axis] = 1; }
      else if (p.pos[axis] > hi) { p.pos[axis] = hi; if (p.vel[axis] > 0) p.vel[axis] *= -1; hit = true; _n.set(0, 0, 0)[axis] = -1; }
    };
    if (!W.bar) wall('x', -B.hx + r, B.hx - r);
    wall('y', r, B.h - r);
    wall('z', -B.hz + r, B.hz - r);

    if (hit) {
      _s.copy(p.pos).addScaledVector(_n, -r);   // the point on the surface itself
      const at = p.pos; p.pos = _s; this.fx.surfaceHit(p, _n); p.pos = at;
      if (W.bounces && p.bounces < W.bounces) {
        p.bounces++; sfx('bounce'); this.fx.puff(p.pos, W.color, 0.2);
      } else if (W.sticky) {
        p.vel.set(0, 0, 0);
      } else if (W.explosive) {
        p.vel.set(0, 0, 0);
        if (this.isAuth(p.owner)) this.explode(p);
      } else {
        this.fx.puff(p.pos, 0xffffff);
        this.remove(p);
        return;
      }
    }
    if (!p.dead && p.age > W.life) {
      if (W.explosive) { if (this.isAuth(p.owner)) this.explode(p); }
      else { this.fx.puff(p.pos, 0xffffff); this.remove(p); }
    }
  }

  // Hits against actor `a`, decided by the device that owns `a`.
  checkHits(a, list) {
    const foe = this.actors[1 - a.id];
    for (const p of list) {
      if (p.dead || p.owner === a.id) continue;
      const W = WEAPONS[p.type];
      let s0, s1;
      if (W.bar) {
        s0 = new THREE.Vector3().copy(p.pos).addScaledVector(p.axis, -W.half);
        s1 = new THREE.Vector3().copy(p.pos).addScaledVector(p.axis, W.half);
      }

      if (W.mine) {
        if (p.age >= W.armTime && distToActor(a, p.pos) < W.trigger) { this.explode(p); continue; }
      } else {
        if (a.shieldUp) {
          const ds = W.bar ? distPointSeg(a.lh, s0, s1) : a.lh.distanceTo(p.pos);
          if (ds < SHIELD_R + W.r) {
            const parry = this.time - a.shieldSince < PARRY_WINDOW;
            a.energy = Math.max(0, a.energy - 12);
            this.emit({ t: 'kill', id: p.id, fx: parry ? 'parry' : 'block', a: a.id });
            if (parry) {
              // Send it straight back at whoever fired it, a little faster.
              const speed = Math.max(p.vel.length(), W.speed) * 1.3;
              const v = _a.copy(foe.head); v.y -= 0.2; v.sub(p.pos).normalize().multiplyScalar(speed);
              const ev = { t: 'spawn', id: `${a.id}-${this.counter++}`, o: a.id, w: p.type, p: arr(p.pos), v: arr(v) };
              if (W.bar) ev.x = arr(p.axis);
              this.emit(ev);
            }
            continue;
          }
        }
        const d = W.bar ? barDistToActor(a, s0, s1) : distToActor(a, p.pos);
        if (d < W.r) {
          if (W.explosive) this.explode(p);
          else { this.emit({ t: 'kill', id: p.id, fx: 'hit' }); this.damage(a, W.dmg); }
          continue;
        }
      }

      // Shoot incoming explosives out of the air with your own bolts.
      if (W.shootable) {
        for (const q of list) {
          if (q.dead || q.owner !== a.id || !WEAPONS[q.type].canShoot) continue;
          if (q.pos.distanceTo(p.pos) < W.r + WEAPONS[q.type].r + 0.05) {
            this.emit({ t: 'kill', id: q.id });
            this.explode(p);
            break;
          }
        }
      }
    }
  }

  poseMessage() {
    const a = this.local;
    return { t: 'p', h: arr(a.head), l: arr(a.lh), r: arr(a.rh), d: arr(a.aim), s: a.shieldUp ? 1 : 0, w: a.weapon, z: a.frozen > 0 ? 1 : 0 };
  }
}

export { ORDER };
