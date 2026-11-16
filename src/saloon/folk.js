// the townspeople in the room: Polyfork's bodies walking in from the street, taking a stool or a table, ordering, drinking and paying, getting drunk, looking at you when you speak, taking a bullet, falling, dying, drawing and firing; what the story asks of them they do here
import * as THREE from 'three';
import { G, V3, clamp, pick, rand } from '../sushi/ctx.js';
import { pfPerson } from '../sushi/pf.js';
import { PEOPLE, DRINKS } from './cast.js';
import { tender } from './bar.js';
import { R } from './room.js';
import { glow } from './kit.js';

const _v = new V3(), _d = new V3(), _a = new V3(), _b = new V3(), _c = new V3();
const skinM = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.92, metalness: 0, envMapIntensity: 0.35, color: 0xc8c0b8 });   // cloth and skin that take the lamps' light softly, not flat facets
const blobM = new THREE.MeshBasicMaterial({ map: null, color: 0x000000, transparent: true, opacity: 0.38, depthWrite: false });

export function buildFolk(scene, room) {
  const people = [], by = {};
  const folk = { people, shots: 0 };
  blobM.map = glow();
  const ev = (name, d) => G.story?.event?.(name, d);

  function make(id) {
    const S = PEOPLE[id]; if (!S || by[id] || !G.castReady) return by[id] || null;
    const P = pfPerson(S.body, new THREE.Group()); P.root.traverse((o) => { o.userData.nopick = true; if (o.isMesh) o.castShadow = true; if (o.isMesh && !o.isSkinnedMesh) o.userData.rich = true; if (o.isMesh && o.material.color && o.material.color.getHex() === 0xf2efe6) o.material.color.set(0x7c776c); }); P.root.visible = false; G.peopleRoot.add(P.root);
    const blob = new THREE.Mesh(new THREE.PlaneGeometry(0.9, 0.9).rotateX(-Math.PI / 2), blobM); blob.position.y = 0.012; blob.userData.nopick = true; P.root.add(blob);
    const p = { id, S,  name: S.name, P, root: P.root, alive: true, here: false, hidden: false, state: 'out', seat: null, spot: null, tgt: null, plan: [], act: null, t: 0, drunk: 0, hp: 100, want: null, wait: 0, glass: null, rounds: 0, trust: 0, armed: false, gun: null, drawn: false, foe: null, aimT: 0, sipT: 0, house: false, cut: false, said: 0, dead: 0, fled: false };
    people.push(p); by[id] = p; return p;
  }
  folk.byId = (id) => by[id] || make(id);
  folk.crowd = () => people.reduce((n, p) => n + (p.here && p.alive ? 1 : 0), 0);
  const head = (p, out) => out.copy(p.root.position).setY(p.root.position.y + (p.state === 'sit' ? 1.3 : 1.62));

  // ---- seats and standing places
  const freeSeat = (at) => { const L = room.seats.filter((s) => !s.who && (at === 'bar' ? s.kind === 'stool' : s.at === at)); return L.length ? (at === 'bar' ? L.sort((a, b) => Math.abs(a.x) - Math.abs(b.x))[(Math.random() * Math.min(3, L.length)) | 0] : L[0]) : null; };
  const leaveSeat = (p) => { if (p.seat) { p.seat.who = null; p.seat = null; } if (p.spot) { p.spot.who = null; p.spot = null; } p.P.pose = 'stand'; p.root.position.y = 0; };
  const barSpot = () => { const L = room.spots.bar.filter((s) => !s.who); return L.length ? pick(L) : null; };

  // ---- the plan: what they came to do tonight, one act after another
  // ['bar', rounds] ['sit', table, seconds] ['stand', spot, seconds] ['leave'] ['hide'] ['wait', seconds]
  folk.enter = (id, plan, o = {}) => { const p = folk.byId(id); if (!p || !p.alive || p.here) return p; leaveSeat(p); p.here = true; p.hidden = false; p.fled = false; p.root.visible = true; p.root.position.set(room.spots.street.x + rand(-0.6, 0.6), 0, room.spots.street.z); p.root.rotation.y = 0; p.plan = plan.slice(); p.act = null; p.state = 'walk'; p.tgt = { ...room.spots.door }; p.cut = false; p.rounds = 0; if (o.drunk) p.drunk = o.drunk; G.audio.play('door'); ev('arrive', { id }); return p; };
  folk.send = (id, plan) => { const p = by[id]; if (!p || !p.alive || !p.here) return; leaveSeat(p); p.plan = plan.slice(); p.act = null; p.want = null; releaseGlass(p); };
  folk.leave = (id) => folk.send(id, [['leave']]);
  folk.add = (id, act) => { const p = by[id]; if (p) p.plan.push(act); };
  function next(p) {
    const a = (p.act = p.plan.shift() || ['leave']); p.t = 0; leaveSeat(p);
    if (a[0] === 'bar') { const s = freeSeat('bar') || barSpot(); if (!s) { p.plan.unshift(a); p.act = ['wait', 6]; p.tgt = { ...room.spots.stove }; p.state = 'walk'; return; } s.who = p; if (s.kind) p.seat = s; else p.spot = s; p.tgt = { x: s.x, z: s.z }; p.rounds = a[1] ?? 1; p.want = null; p.wait = 0; p.state = 'walk'; }
    else if (a[0] === 'sit') { const s = freeSeat(a[1]); if (!s) return next(p); s.who = p; p.seat = s; p.tgt = { x: s.x, z: s.z }; p.state = 'walk'; }
    else if (a[0] === 'stand') { const s = room.spots[a[1]] || room.spots.stove; p.tgt = { x: s.x + rand(-0.25, 0.25), z: s.z + rand(-0.25, 0.25) }; p.state = 'walk'; }
    else if (a[0] === 'leave' || a[0] === 'hide') { p.tgt = a[0] === 'hide' ? { x: room.spots.flap.x, z: room.spots.flap.z } : { ...room.spots.street }; p.state = 'walk'; }
    else if (a[0] === 'wait') { p.state = 'stand'; }
  }
  function arrived(p) {
    const a = p.act; if (!a) { next(p); return; }
    if (a[0] === 'leave') { p.here = false; p.root.visible = false; p.state = 'out'; holster(p); ev('left', { id: p.id }); return; }
    if (a[0] === 'hide') { p.here = false; p.hidden = true; p.root.visible = false; p.state = 'out'; ev('hid', { id: p.id }); return; }
    if (p.seat) { p.state = 'sit'; p.P.pose = 'sit'; p.root.position.set(p.seat.x, p.seat.y, p.seat.z); p.root.rotation.y = p.seat.ry; }
    else { p.state = 'stand'; p.P.pose = 'stand'; if (a[0] === 'bar') p.root.rotation.y = 0; else if (a[2] !== undefined || a[0] === 'stand') face(p, a[1] === 'piano' ? p.root.position.x : a[1] === 'door' ? 2 : 2, a[1] === 'piano' ? R.piano.z - 1 : a[1] === 'board' ? 9 : -2.4); }
    ev('at', { id: p.id, act: a });
  }
  const face = (p, x, z) => { p.root.rotation.y = Math.atan2(x - p.root.position.x, z - p.root.position.z); };

  // ---- the drink in front of them
  function releaseGlass(p) { const gl = p.glass; p.glass = null; if (gl && !gl.dead) { gl.owner = null; gl.locked = false; if (gl.inHand) { G.itemRoot.add(gl.obj); gl.obj.position.copy(gl.homeP); gl.obj.quaternion.identity(); gl.inHand = false; } } }
  function barLife(p, dt) {
    const a = p.act, x = p.root.position.x;
    if (p.due > 0) change(p, dt); if (p.wantCigar) cigar(p);
    if (p.cut) { if (p.t > 6 && !(p.due > 0)) next(p); return; }
    if (!p.want && !p.glass) { if (p.rounds <= 0) { if (p.t > (a[2] ?? 14) && !(p.due > 0) && p.wantCigar !== 1) next(p); return; } if ((p.wait += dt) > (p.said ? rand(10, 22) : rand(2.5, 5))) { p.want = p.S.drink; p.wait = 0; p.asked = 1; ev('order', { id: p.id, drink: p.want }); } return; }
    if (p.want) { p.wait += dt;
      const gl = G.bar.glassAt(x, R.barZ0 + 0.2, 0.36);
      if (gl && gl !== p.refused && gl.vol > 0.1) { const j = G.bar.judge(gl, p.want); if (j.ok) { p.glass = gl; gl.owner = p; gl.locked = true; gl.homeP = gl.obj.position.clone(); p.want = null; p.rounds--; p.sipT = 2; G.bar.served++; ev('served', { id: p.id, drink: gl.what(), short: j.short, waited: p.wait }); p.wait = 0; } else { p.refused = gl; ev('wrong', { id: p.id, why: j.why, got: j.got, want: p.want }); } }
      else if (p.wait > 40 * p.asked && p.asked < 3) { p.asked++; ev('waiting', { id: p.id, drink: p.want, n: p.asked }); }
      else if (p.wait > 130) { p.want = null; p.rounds = 0; ev('unserved', { id: p.id }); }
      return; }
    // drinking it: a sip every few seconds, the glass to the mouth and back
    const gl = p.glass; if (gl.dead) { p.glass = null; return; }
    p.sipT -= dt;
    if (gl.inHand && p.sipT < -1.7) { G.itemRoot.add(gl.obj); gl.obj.position.copy(gl.homeP); gl.obj.quaternion.identity(); gl.inHand = false; gl.vol = Math.max(0, gl.vol - (gl.shape === 'shot' ? 0.5 : 0.22)); gl.refresh(); p.sipT = gl.shape === 'shot' ? rand(5, 9) : rand(4, 8);
      if (gl.vol <= 0.05) { gl.empty(true); const w = DRINKS[p.S.drink]; p.drunk += p.S.drink === 'sarsaparilla' ? 0 : p.S.drink === 'beer' ? 0.6 : 1; releaseGlass(p); p.t = 0; p.said = 1; ev('drank', { id: p.id, drunk: p.drunk, holds: p.S.holds, cents: w[1] }); } }
    else if (!gl.inHand && p.sipT <= 0) { p.P.gesture('Drinking'); const hb = p.P.bones.find((b) => b.name === 'handR'); if (hb) { gl.inHand = true; hb.add(gl.obj); gl.obj.position.set(0, -0.02, 0.06); gl.obj.quaternion.identity(); p.sipT = 0; } else p.sipT = -1.7; }
  }
  // they put down what they have; if it is more than the price they wait for their change to be laid on the bar
  folk.pays = (id, cents) => { const p = by[id]; if (!p || !p.here) return; const t = tender(cents); G.bar.pay(t, p.root.position.x, id); p.due = t - cents; p.dueT = 0; p.dueAsk = 0; if (p.due) ev('change', { id, due: p.due, gave: t }); };
  function change(p, dt) { p.dueT += dt; const c = G.bar.changeAt(p.root.position.x); if (c.cents >= p.due) { for (const k of c.coins) k.remove(); G.audio.play('coin'); ev('changed', { id: p.id, over: c.cents - p.due }); p.due = 0; } else if (p.dueT > 35 && !p.dueAsk) { p.dueAsk = 1; ev('changeWait', { id: p.id, due: p.due }); } else if (p.dueT > 100) { ev('shortchanged', { id: p.id, due: p.due - c.cents }); p.due = 0; } }
  // a cigar set before them is taken; then they want a light, and a lit match held near their face gives it
  function cigar(p) { if (p.wantCigar === 1) { const c = G.bar.thingAt('cigar', p.root.position.x, R.barZ0 + 0.2, 0.36); if (c) { c.remove(); p.wantCigar = 2; G.bar.pay(5, p.root.position.x, p.id); ev('cigar', { id: p.id }); } } }
  folk.lightFor = (pt) => { for (const p of people) if (p.here && p.alive && p.wantCigar === 2 && head(p, _c).distanceTo(pt) < 0.45) { p.wantCigar = 3; p.smoke = 240; ev('lit', { id: p.id }); } };

  // ---- guns in their hands
  function holster(p) { if (p.gun) { p.gun.removeFromParent(); p.gun = null; } p.drawn = false; p.foe = null; }
  folk.arm = (id, on = true) => { const p = folk.byId(id); if (p) p.armed = on; };
  folk.draw = (id, foe) => { const p = by[id]; if (!p || !p.alive || !p.here || !p.armed) return false; if (!p.drawn) { p.drawn = true; p.gun = G.guns?.giveGun?.(p.P, 'revolver') || null; G.audio.play('cock'); if (p.state === 'sit') { leaveSeat(p); p.state = 'stand'; } p.plan = []; p.act = ['wait', 999]; } p.foe = foe; p.aimT = rand(0.7, 1.4) * (1 + p.drunk * 0.12); return true; };
  folk.holster = (id) => { const p = by[id]; if (p) { holster(p); p.act = null; } };
  const where = (foe, out) => { if (foe === 'you') return G.camera.getWorldPosition(out).setY(out.y - 0.25); const q = by[foe]; return q && q.alive && q.here ? head(q, out).setY(out.y - 0.3) : null; };
  function gunLife(p, dt) {
    const T = where(p.foe, _a); if (!T) { p.foe = null; ev('foeGone', { id: p.id }); return; }
    face(p, T.x, T.z); p.P.look = T;
    if ((p.aimT -= dt) > 0) return;
    const from = head(p, _b).setY(p.root.position.y + 1.35).addScaledVector(_c.copy(T).sub(p.root.position).setY(0).normalize(), 0.45), skill = clamp((p.id === "pike" ? 0.95 : 0.7) - p.drunk * 0.06, 0.2, 0.97), e = (1 - skill) * 0.22;
    _d.copy(T).sub(from).normalize(); _d.x += rand(-e, e); _d.y += rand(-e, e) * 0.6; _d.z += rand(-e, e); _d.normalize();
    G.guns?.fire?.({ from: from.clone(), dir: _d.clone(), by: p.id, kind: 'revolver' }); p.P.gesture('Punch'); p.aimT = rand(0.9, 1.7); p.shots = (p.shots || 0) + 1; if (p.shots % 6 === 0) p.aimT += 3.2;
  }

  // ---- bullets
  folk.rayHit = (o, d, far = 40) => { let best = null, bd = far; for (const p of people) { if (!p.here || p.dead > 1.4) continue; const h = p.state === 'sit' ? 1.38 : p.P.down() ? 0.45 : 1.74, base = p.root.position; _a.copy(o).sub(base); const dd = d.x * d.x + d.z * d.z; if (dd < 1e-8) continue; const tb = -(_a.x * d.x + _a.z * d.z) / dd; if (tb < 0 || tb > bd) continue; const px = _a.x + d.x * tb, pz = _a.z + d.z * tb, y = o.y + d.y * tb - base.y; if (Math.hypot(px, pz) > 0.21 || y < 0 || y > h) continue; const back = Math.sqrt(Math.max(0, 0.21 * 0.21 - px * px - pz * pz)) / Math.sqrt(dd), t = Math.max(0, tb - back); bd = t; best = { person: p, point: new V3().copy(o).addScaledVector(d, t), dist: t, head: y > h - 0.26 }; } return best; };
  folk.shot = (p, point, dir, o = {}) => { if (!p || !p.alive) return; const dmg = o.dmg ?? 60; p.hp -= dmg; p.P.hit(dir, point, 1); p.P.stain(point, 0x7a0a0a, 0.045 + dmg * 0.0004); G.fx.drops(point, 0x6a0606, 5); G.audio.play('hit'); releaseGlass(p); p.want = null;
    if (p.hp <= 0) { p.alive = false; p.dead = 0.001; p.state = 'dead'; leaveSeat(p); p.plan = []; G.audio.play('fall'); ev('killed', { id: p.id, by: o.by }); } else { if (p.state === 'sit') { leaveSeat(p); p.state = 'stand'; } ev('wounded', { id: p.id, by: o.by, hp: p.hp }); } };
  folk.heard = (kind, pos, who) => { folk.shots++; for (const p of people) if (p.here && p.alive && p.id !== who && !p.drawn) { if (p.root.position.distanceTo(pos) < 14) p.P.duck(); } ev('gunfire', { by: who, pos }); };
  folk.kill = (id, byWho) => { const p = by[id]; if (p && p.alive) { p.hp = 1; folk.shot(p, head(p, new V3()).setY(1.2), _d.set(0, 0, 1), { by: byWho, dmg: 100 }); } };
  folk.flee = () => { for (const p of people) if (p.here && p.alive && !p.drawn && !p.S.brave) { releaseGlass(p); p.want = null; leaveSeat(p); p.plan = []; p.act = ['leave']; p.tgt = { ...room.spots.street }; p.state = 'walk'; p.run = true; p.fled = true; } };
  folk.clear = () => { for (const p of people) { if (!p.alive && p.root.visible) { p.root.visible = false; p.here = false; } if (p.here && p.alive) { p.here = false; p.root.visible = false; p.state = 'out'; leaveSeat(p); releaseGlass(p); holster(p); } p.hidden = false; p.run = false; p.drunk = 0; p.want = null; p.due = 0; p.wantCigar = 0; p.smoke = 0; p.plan = []; p.act = null; } };

  // ---- who you are looking at, and who can hear
  folk.lookedAt = (far = 6) => { const c = G.camera.getWorldPosition(_a), f = G.camera.getWorldDirection(_b); let best = null, bs = 0.86; for (const p of people) { if (!p.here || !p.alive) continue; head(p, _c).sub(c); const d = _c.length(); if (d > far) continue; const s = _c.normalize().dot(f) - d * 0.006; if (s > bs) { bs = s; best = p; } } return best; };
  folk.near = (id, r = 3.2) => { const p = by[id]; if (!p || !p.here) return []; return people.filter((q) => q !== p && q.here && q.alive && q.root.position.distanceTo(p.root.position) < r); };
  folk.nearYou = (r = 3) => { const c = G.camera.getWorldPosition(_a); return people.filter((q) => q.here && q.alive && Math.hypot(q.root.position.x - c.x, q.root.position.z - c.z) < r); };
  folk.say = (id, text, about) => { const p = by[id]; if (p && p.here && p.alive) G.talk?.voice?.(p, text, about); };

  folk.update = (dt) => {
    const cam = G.camera.getWorldPosition(_v);
    for (const it of G.items) { if (!it.free || it.dead || it.kind === 'bit' || it.kind === 'debris' || it.vel.lengthSq() < 4 || it.struck > G.t) continue; const ip = it.worldCenter(_a); for (const p of people) { if (!p.here || !p.alive) continue; const b = p.root.position, top = p.state === 'sit' ? 1.38 : 1.74; if (ip.y < b.y + 0.3 || ip.y > b.y + top || Math.hypot(ip.x - b.x, ip.z - b.z) > 0.26) continue; it.struck = G.t + 1; const sp = it.vel.length(), hard = sp * (it.mass || 0.1); p.P.hit(_b.copy(it.vel).normalize(), ip.clone(), Math.min(1, 0.3 + hard * 0.35)); G.audio.play('hit'); if (it.vol > 0.05) { p.P.stain(ip.clone(), 0x4a3010, 0.07); it.empty?.(false); } ev('struck', { id: p.id, with: it.name, hard }); it.vel.multiplyScalar(-0.2); if (it.onImpact?.(sp) !== true) it.drop(it.vel.clone()); break; } }
    for (const p of people) {
      if (!p.here) continue;
      if (!p.alive) { if (p.dead < 1.5) { p.dead += dt; p.P.update(dt); } continue; }   // the dead lie where they fell
      p.t += dt;
      if (p.state === 'walk' && p.tgt && !p.P.reeling()) {
        const pos = p.root.position; _d.set(p.tgt.x - pos.x, 0, p.tgt.z - pos.z); const d = _d.length();
        if (d < 0.12) arrived(p);
        else { const sp = (p.run ? 2.6 : 1.15) * (1 - Math.min(0.35, p.drunk * 0.03)); _d.multiplyScalar(Math.min(d, sp * dt) / d); pos.add(_d);
          if (d > 0.45) for (const s of room.solids) { if (s.step || (s.low && p.seat && Math.abs(s.x0 + 0.17 - p.seat.x) < 0.05)) continue; const cx = clamp(pos.x, s.x0, s.x1), cz = clamp(pos.z, s.z0, s.z1), dx = pos.x - cx, dz = pos.z - cz, dd = Math.hypot(dx, dz); if (dd < 0.26 && dd > 1e-5) { const tx = dz / dd, tz = -dx / dd, sg = tx * (p.tgt.x - pos.x) + tz * (p.tgt.z - pos.z) >= 0 ? 1 : -1; pos.x += dx / dd * (0.26 - dd) + sg * tx * sp * dt * 0.85; pos.z += dz / dd * (0.26 - dd) + sg * tz * sp * dt * 0.85; } }   // round what is in the way, on the side nearer where they are going
          const ty = Math.atan2(_d.x, _d.z); let dy = ty - p.root.rotation.y; dy = Math.atan2(Math.sin(dy), Math.cos(dy)); p.root.rotation.y += dy * Math.min(1, dt * 8); p.P.pose = 'walk'; p.P.speed = sp;
          if (p.drunk > p.S.holds * 0.7) p.root.rotation.y += Math.sin(G.t * 2.3 + p.t) * 0.02; }
      } else if (p.drawn && p.foe) gunLife(p, dt);
      else if (p.state !== 'walk') {
        const a = p.act; if (!a) next(p);
        else if (a[0] === 'bar') barLife(p, dt);
        else if (a[0] === 'wait' || a[0] === 'sit' || a[0] === 'stand') { if (p.t > (a[0] === 'wait' ? a[1] : a[2] ?? 60)) next(p); }
      }
      // they look at you when you are close or speaking to them, or at who is speaking
      const d = Math.hypot(cam.x - p.root.position.x, cam.z - p.root.position.z); if (!(p.drawn && p.foe)) p.P.look = (d < 2.6 || p.heed > G.t) && p.state !== 'walk' ? cam : null;
      if (p.smoke > 0) { p.smoke -= dt; if ((p.puff = (p.puff || 0) - dt) < 0) { p.puff = rand(3, 7); G.fx.steam(head(p, _c).addScaledVector(_d.set(Math.sin(p.root.rotation.y), 0, Math.cos(p.root.rotation.y)), 0.15), 0.5); } }
      p.P.act = p.state !== 'walk' && p.drunk >= p.S.holds && p.state !== 'sit' ? 'Drunk idle' : p.state === 'stand' && p.act && p.act[0] === 'bar' && !p.glass?.inHand ? 'Leaning on rail' : null;
      p.P.update(dt);
    }
  };
  folk.make = make;
  return folk;
}
