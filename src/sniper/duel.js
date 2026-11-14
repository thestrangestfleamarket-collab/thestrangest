// COLD BORE one on one: when a second rifle is on the page the two are set on facing roofs 530 m apart, each the other's target; first to five. The one who fires judges the hit, the one hit falls
import * as THREE from 'three';
import { Net } from './net.js';
import { SOUND } from './ballistics.js';

const SPOT = [-13, 0, 13], WIN = 5, _v = new THREE.Vector3(), _q = new THREE.Quaternion();
// where a seat's rifle lies: the tower's roof, or the roof of the flats across the city
const nestOf = (slot, spot) => slot === 0 ? new THREE.Vector3(SPOT[spot], 52, -17.5) : new THREE.Vector3(-140 + SPOT[spot], 29.2, -547.5);

export class Duel {
  constructor(game) {
    this.g = game; this.on = false; this.peer = null; this.want = false; this.slot = 0; this.score = [0, 0]; this.sendT = 0; this.rdSent = -1; this.phase = 'off'; this.t = 0; this.rival = null; this.pose = null; this.legs = 0; this.myLegs = 0;
    this.def = { id: 'duel', name: 'THE OTHER RIFLE', tag: 'One on one · first to five', site: 'city', env: 'day', seed: 5, wind: { from: 0, speed: 3, gust: 1.5 }, look: [0, 0, 0], rounds: 1e9, par: 1, brief: [], setup: (g, S, R) => this.mission(R) };
    this.net = new Net({
      welcome: (m) => { this.slot = m.slot; if (m.peers && m.peers[0]) this.arrive(m.peers[0]); }, 'peer-join': (m) => this.arrive(m), 'peer-leave': () => this.gone('The other rifle has left.'), disconnect: () => this.gone('The line dropped.'),
      rd: (m) => { if (!this.peer) return; this.peer.rd = !!m.rd; if (m.q && this.on) this.stop('The other rifle stood down.'); this.g.board.draw(); },
      go: (m) => this.go(m), pose: (m) => { this.pose = m.p; }, fire: (m) => this.heard(m), hit: (m) => this.struck(m),
    });
  }
  connect() { if (!this.started) { this.started = true; this.net.connect(); } }
  arrive(p) { this.peer = { id: p.id, slot: p.slot, rd: false }; this.want = true; this.rdSent = -1; this.g.say('Another rifle is on the net.'); this.g.board.draw(); }
  gone(text) { this.peer = null; this.want = false; if (this.on) this.stop(text); this.g.board.draw(); }
  stop(text) { this.on = false; this.phase = 'off'; this.want = false; this.clearRival(); this.g.toMissions(); this.g.say(text); }
  quit() { if (!this.on) return; this.on = false; this.phase = 'off'; this.want = false; this.clearRival(); this.net.send({ t: 'rd', rd: 0, q: 1 }); this.rdSent = 0; }
  toggle() { if (!this.peer) return; this.want = !this.want; this.g.board.draw(); }
  rematch() { this.want = true; this.g.board.draw(); }
  ready() { const s = this.g.state; return this.want && !this.g.loading && s !== 'menu' && (this.on ? this.phase === 'over' : s !== 'live'); }
  label() { return !this.peer ? 'NO OTHER RIFLE ON THE NET' : this.want ? (this.peer.rd ? 'DUEL STARTING' : 'DUEL: WAITING FOR THE OTHER') : 'DUEL THE OTHER RIFLE'; }
  clearRival() { if (this.cover) { this.cover.removeFromParent(); const i = this.g.world.solids.indexOf(this.hull); if (i >= 0) this.g.world.solids.splice(i, 1); this.cover = null; } this.rival = null; if (this.glint) this.glint.visible = false; }

  // the round's start, said by seat 0: where each lies, how long until weapons free
  async go(m) {
    const g = this.g; if (this.starting) return; this.starting = true; if (m.n || !this.on) { this.score = [0, 0]; }
    this.spots = [m.a, m.b]; const mine = nestOf(this.slot, this.spots[this.slot]), theirs = nestOf(1 - this.slot, this.spots[1 - this.slot]);
    if (!this.on || g.mission?.def !== this.def) { this.on = true; this.phase = 'load'; g.loading = true; if (document.pointerLockElement) document.exitPointerLock(); await g.fade(1); this.def.nest = mine; this.def.look = [theirs.x, theirs.y + 1.2, theirs.z]; await g.setup(this.def, true); g.loading = false; g.fade(0); if (g.vr) g.restAt = 0.3; }
    this.place(mine, theirs); g.state = 'live'; g.live = false; this.phase = 'count'; this.t = m.in / 1000; this.legs = this.myLegs = 0; g.rifle.reset(); g.rifle.home(g.rest); g.rifle.drawHud(); this.obj(); g.board.show('live'); g.say('Round ' + (this.score[0] + this.score[1] + 1) + '. He is on the ' + (this.slot ? 'tower' : 'flats') + '.'); if (!g.vr) g.lock(); this.starting = false;
  }
  place(mine, theirs) {
    const g = this.g; g.rig.position.copy(mine); g.rig.rotation.y = Math.atan2(-(theirs.x - mine.x), -(theirs.z - mine.z)); g.rig.updateMatrixWorld(true); g.floorY = mine.y; g.lookD = mine.distanceTo(theirs); g.aim.yaw = 0; g.aim.pitch = Math.atan2(theirs.y - mine.y, Math.hypot(theirs.x - mine.x, theirs.z - mine.z));
    g.windDir.set(0.94, 0, 0.34); const f = _v.set(0, 0, -1).applyQuaternion(g.rig.quaternion), from = g.windDir.clone().negate(); g.windA = Math.atan2(from.x * -f.z + from.z * f.x, from.x * f.x + from.z * f.z);
    const R = this.rival; if (R) { R.alive = true; R.fall = 0; R.gone = false; R.g.visible = true; R.inner.rotation.x = 0; R.inner.position.y = 0; R.blob.visible = true; R.pos.copy(theirs); R.tasks = []; }
    if (this.cover) { this.cover.position.copy(theirs); this.cover.rotation.y = Math.atan2(-(mine.x - theirs.x), -(mine.z - theirs.z)); this.cover.updateMatrixWorld(true); } this.theirs = theirs; this.pose = null;
  }
  // the contract the duel hands the game: the other rifle as its one person, his sandbags a real wall
  mission(R) {
    const g = this.g, at = nestOf(1 - this.slot, this.spots[1 - this.slot]); this.rival = g.crowd.add({ name: 'the other rifle', role: 'rival', av: 'Military_Male_03', gun: true, y: at.y, at: [at.x, at.z], tasks: [], pose: 'aim' }, R);
    this.cover = new THREE.Group(); const bags = g.nest.clone(true); bags.position.set(0, 1.05, 0); this.cover.add(bags); this.hull = new THREE.Mesh(new THREE.BoxGeometry(1.7, 1.05, 0.46), new THREE.MeshBasicMaterial({ visible: false })); this.hull.position.set(0, 0.525, -0.6); this.cover.add(this.hull); g.world.group.add(this.cover); g.world.solids.push(this.hull);
    this.glint = this.glint || g.fx.glint(); this.glint.visible = false;
    return { target: this.rival, focus: () => [g.crowd.head(this.rival, new THREE.Vector3())], update() {}, person: (p, zone, d) => this.hitHim(p, zone, d) };
  }
  obj() { const me = this.score[this.slot], him = this.score[1 - this.slot]; this.g.objective(`One on one, first to ${WIN}.   You ${me} : ${him} him`); }
  hitHim(p, zone, d) {
    if (p !== this.rival || this.phase !== 'live') return; const kill = zone !== 'legs' || ++this.legs >= 2; this.net.send({ t: 'hit', k: kill ? 1 : 0 });
    if (!kill) return this.g.say('Leg. He is hit but still up.'); this.g.crowd.kill(p, d); this.point(this.slot, 'He is down.');
  }
  struck(m) { const g = this.g; if (!this.on || this.phase !== 'live') return; g.audio.play('hurt'); for (const h of g.hands) h.pulse(1, 300); if (!m.k) { g.red = 0.5; return g.say('You are hit in the leg!'); } g.red = 1; this.point(1 - this.slot, 'He got you.'); }
  point(who, text) {
    const g = this.g; this.score[who]++; g.live = false; g.rifle.drawHud(); this.obj(); const won = this.score[who] >= WIN, mine = who === this.slot;
    if (won) { this.phase = 'over'; this.want = false; g.state = 'debrief'; g.audio.play(mine ? 'win' : 'fail'); const t = mine ? 'The other rifle is beaten.' : 'The other rifle beat you.'; g.audio.say(t); if (document.pointerLockElement) g.later(1.6, () => document.exitPointerLock());
      g.board.show('debrief', { duel: true, win: mine, text: t, me: this.score[this.slot], him: this.score[1 - this.slot], shots: g.shots, time: g.mt }); }
    else { this.phase = 'pause'; this.t = 4; g.say(text + ' ' + this.score[this.slot] + ' : ' + this.score[1 - this.slot] + '.'); }
  }
  // his shot: its report after the distance, its crack as it passes
  heard(m) { const g = this.g; if (!this.on) return; const o = new THREE.Vector3(m.o[0], m.o[1], m.o[2]), d = o.distanceTo(g.eye()); g.fx.flash(o, 2); g.later(d / 760, () => { if (this.on) g.audio.play('crack'); }); g.later(d / SOUND, () => { if (this.on) g.audio.play('report', 0, d); }); }
  fired(from, dir) { if (this.on) this.net.send({ t: 'fire', o: [from.x, from.y, from.z], d: [dir.x, dir.y, dir.z] }); }

  tick(dt) {
    const g = this.g, rd = this.ready() ? 1 : 0; if (!this.started) return;
    if (this.peer && rd !== this.rdSent) { this.rdSent = rd; this.net.send({ t: 'rd', rd }); }
    if (this.peer && this.slot === 0 && rd && this.peer.rd && !this.starting && (!this.on || this.phase === 'over')) { this.peer.rd = false; const m = { t: 'go', a: Math.random() * 3 | 0, b: Math.random() * 3 | 0, in: 5000, n: 1 }; this.net.send(m); this.go(m); }
    if (!this.on) return;
    if (this.phase === 'count') { this.t -= dt; if (this.t <= 0) { this.phase = 'live'; g.live = true; g.rifle.drawHud(); g.say('Weapons free.'); } }
    if (this.phase === 'pause') { this.t -= dt; if (this.t <= 0 && this.slot === 0 && this.peer) { this.phase = 'wait'; const m = { t: 'go', a: Math.random() * 3 | 0, b: Math.random() * 3 | 0, in: 4000, n: 0 }; this.net.send(m); this.go(m); } }
    // where I am, for him: my head, my rifle and where it points, whether my eye is at the glass
    this.sendT -= dt; if (this.sendT <= 0 && this.peer) { this.sendT = 0.08; const h = g.eye(), R = g.rifle.g; R.updateMatrixWorld(true); const rp = R.getWorldPosition(_v), rq = R.getWorldQuaternion(_q);
      this.net.send({ t: 'pose', p: [h.x, h.y, h.z, rp.x, rp.y, rp.z, rq.x, rq.y, rq.z, rq.w, g.rifle.scoped ? 1 : 0, g.rest.y].map(v => +v.toFixed(3)) }); }
    const P = this.pose, T = this.rival; if (!T || !this.theirs) return;
    if (P && T.alive) { const dir = _v.set(0, 0, -1).applyQuaternion(_q.set(P[6], P[7], P[8], P[9])); T.pos.set(P[0], this.theirs.y, P[2]); T.yaw = Math.atan2(dir.x, dir.z); T.pose = P[1] - this.theirs.y < 1.35 ? 'aim' : 'guard';
      T.inner.position.y = Math.max(-0.7, Math.min(0.4, T.inner.position.y + (P[1] - (T.head.y - 0.07)) * 0.3));
      if (this.cover) this.cover.children[0].position.y = P[11];
      const me = g.eye().sub(_v.set(P[3], P[4], P[5])).normalize(), on = P[10] > 0.5 && me.dot(dir) > 0.9985; this.glint.visible = on; if (on) { this.glint.position.set(P[3], P[4] + 0.19, P[5]); this.glint.scale.setScalar(0.5 + Math.sin(g.time * 9) * 0.1); } }
    else this.glint.visible = false;
  }
}
