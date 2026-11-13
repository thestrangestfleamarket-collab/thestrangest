// Practice opponent. Drives one Actor the same way a remote player would.
import * as THREE from 'three';
import { WEAPONS } from './weapons.js';
import { distToActor } from './game.js';

const _t = new THREE.Vector3(), _o = new THREE.Vector3(), _d = new THREE.Vector3(), _x = new THREE.Vector3();
const rand = (a, b) => a + Math.random() * (b - a);

export class Bot {
  constructor(game, id) {
    this.g = game; this.id = id; this.a = game.actors[id];
    this.side = id === 0 ? 1 : -1;
    this.tx = 0; this.tz = this.side * 1.8;
    this.moveT = 0; this.crouchT = 0;
    this.fireT = 1.5; this.charge = 0; this.next = null;
    this.shieldT = 0; this.seen = new Set();
    this.burst = 0;
  }

  update(dt) {
    const g = this.g, a = this.a, foe = g.actors[1 - this.id], B = g.bounds, side = this.side;
    const fighting = g.phase === 'fight';

    // Wander around its own half, ducking now and then.
    this.moveT -= dt; this.crouchT -= dt;
    if (this.moveT <= 0) {
      this.tx = rand(-1, 1) * Math.max(0.2, B.hx - 0.5);
      this.tz = side * rand(1.0, Math.max(1.2, B.hz - 0.6));
      this.moveT = rand(0.8, 2.2);
      if (Math.random() < 0.25) this.crouchT = 0.9;
    }
    if (fighting) {
      _t.set(this.tx - a.head.x, 0, this.tz - a.head.z);
      const dist = _t.length();
      if (dist > 0.02) a.head.addScaledVector(_t.normalize(), Math.min(dist, 1.3 * dt));
    }
    const wantY = this.crouchT > 0 ? 1.0 : 1.6;
    a.head.y += (wantY - a.head.y) * Math.min(1, dt * 8);
    a.aim.copy(foe.head).sub(a.head).normalize();
    a.rh.set(a.head.x + side * 0.25, a.head.y - 0.35, a.head.z - side * 0.3);
    if (this.shieldT <= 0) a.lh.set(a.head.x - side * 0.25, a.head.y - 0.3, a.head.z - side * 0.35);

    if (!fighting) { g.setShield(this.id, false, dt); a.charging = false; this.next = null; return; }

    // Sometimes raise the shield into the path of an incoming shot.
    this.shieldT -= dt;
    for (const p of g.projectiles.values()) {
      if (p.owner === this.id || WEAPONS[p.type].mine || this.seen.has(p.id)) continue;
      _t.copy(a.head).sub(p.pos);
      if (_t.length() < 1.4 && _t.dot(p.vel) > 0) {
        this.seen.add(p.id);
        if (Math.random() < 0.35) {
          this.shieldT = 0.7;
          a.lh.copy(a.head).addScaledVector(_t.normalize(), -0.4);
          a.lh.y -= 0.15;
        }
      }
    }
    g.setShield(this.id, this.shieldT > 0, dt);

    // Detonate its orb once it is close to the player (or has gone past).
    for (const p of g.liveOf(this.id, 'orb')) {
      const past = (p.pos.z - foe.head.z) * side < -0.4;
      if (distToActor(foe, p.pos) < 0.8 || past) g.fire(this.id, 'orb', p.pos, a.aim);
    }

    // Pick a weapon, telegraph with a glowing hand, then fire.
    this.fireT -= dt;
    if (!this.next && this.fireT <= 0) {
      const options = [['pulse', 4], ['bouncer', 2], ['wave', 2], ['missile', 1.5], ['mine', 1]];
      if (!g.liveOf(this.id, 'orb').length) options.push(['orb', 1.5]);
      const ready = options.filter(([w]) => g.cdFrac(this.id, w) === 0);
      if (this.burst > 0) {
        if (g.cdFrac(this.id, 'pulse') === 0) { this.next = 'pulse'; this.charge = 0.05; }
      } else if (ready.length) {
        let r = Math.random() * ready.reduce((s, o) => s + o[1], 0);
        this.next = ready.find((o) => (r -= o[1]) <= 0)?.[0] || ready[0][0];
        this.charge = 0.55;
      }
    }
    a.charging = !!this.next;
    if (this.next) {
      this.charge -= dt;
      if (this.charge <= 0) { this.shoot(this.next, foe, B); this.next = null; }
    }
  }

  shoot(type, foe, B) {
    const a = this.a, side = this.side;
    _o.copy(a.rh);
    _t.copy(foe.head); _t.y -= 0.25;
    _t.x += rand(-0.15, 0.15); _t.y += rand(-0.15, 0.15);
    _x.set(1, 0, 0);
    if (type === 'bouncer' && Math.random() < 0.5) {
      const wallX = Math.random() < 0.5 ? B.hx : -B.hx;   // bank shot off a side wall
      _t.x = 2 * wallX - _t.x;
    } else if (type === 'wave') {
      if (Math.random() < 0.5) _x.set(0, 1, 0);             // vertical bar: sidestep it
      else _t.y = foe.head.y - 0.1;                         // horizontal bar: duck it
    } else if (type === 'mine') {
      _t.x += rand(-0.6, 0.6);
    }
    _d.copy(_t).sub(_o).normalize();
    if (type === 'missile') { _d.y += 0.3; _d.x += rand(-0.6, 0.6); _d.normalize(); }   // lobbed, but below the ceiling
    this.g.fire(this.id, type, _o.addScaledVector(_d, 0.4), _d, _x);   // from the launcher's muzzle
    if (type === 'pulse') {
      this.burst = this.burst > 0 ? this.burst - 1 : 2;     // pulses come in bursts of three
      this.fireT = this.burst > 0 ? 0.3 : rand(0.9, 1.8);
    } else { this.burst = 0; this.fireT = rand(0.9, 2.0); }
  }
}
