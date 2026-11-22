// BOWLING: one lane behind the clubhouse's third door. The lane's sizes, the pin and the throw rolled in Rapier are THE STRANGEST LANES' (src/146zkb-bowling.js, copied in); the ten-pin scoring is its own file (worker/lanes.js)
import RAPIER from '@dimforge/rapier3d-compat';
import { BOWLS } from '../../worker/lanes.js';
export function makeBowl(K) {
  const T = K.THREE, V3 = K.V3, O = new V3(0, 0, 600), g = new T.Group(); g.position.copy(O); g.rotation.y = Math.PI; g.visible = false; K.scene.add(g);   // the lane runs down +z in its own space, away from you
  const G = { LW: .527, DIV: .762, LY: .05, HEAD: 18.288, OIL: 12.2, DECK: 19.156, PIT: 20.05, BR: .1085 }, popc = n => { let c = 0; for (; n; n >>= 1) c += n & 1; return c; };
  const SPOT = [[0, 0], [-.1524, .2639], [.1524, .2639], [-.3048, .5278], [0, .5278], [.3048, .5278], [-.4572, .7917], [-.1524, .7917], [.1524, .7917], [.4572, .7917]];
  const PROF = [[0, .0254], [.03, .038], [.07, .052], [.114, .0605], [.16, .056], [.21, .04], [.234, .031], [.236, .031], [.25, .029], [.264, .029], [.266, .029], [.29, .029], [.33, .032], [.36, .026], [.381, .008]];
  const HULL = new Float32Array(PROF.flatMap(([y, r]) => Array.from({ length: 10 }, (_, k) => [Math.cos(k / 10 * Math.PI * 2) * r, y, Math.sin(k / 10 * Math.PI * 2) * r]).flat()));
  let ready = false; const boot = RAPIER.init().then(() => { ready = true; });
  const simNew = (v, stand) => { const R = RAPIER, [x0, ang, spd, spin, lb] = v, W = new R.World({ x: 0, y: -9.81, z: 0 }); W.timestep = 1 / 120;
    const fix = W.createRigidBody(R.RigidBodyDesc.fixed()), cub = (hx, hy, hz, x, y, z, f = .2, e = .1) => W.createCollider(R.ColliderDesc.cuboid(hx, hy, hz).setTranslation(x, y, z).setFriction(f).setRestitution(e), fix);
    cub(G.LW, .025, (G.OIL + .6) / 2, 0, G.LY - .025, (G.OIL - .6) / 2, .04); cub(G.LW, .025, (G.DECK - G.OIL) / 2, 0, G.LY - .025, (G.DECK + G.OIL) / 2, .2);
    for (const s of [-1, 1]) { cub((G.DIV - G.LW) / 2, .025, (G.DECK + .6) / 2, s * (G.LW + G.DIV) / 2, -.025, (G.DECK - .6) / 2, .15); cub(.05, .1, G.HEAD / 2, s * (G.DIV + .05), .1, G.HEAD / 2 - .6, .1, .2); cub(.05, .75, (G.PIT - G.HEAD + .6) / 2, s * (G.DIV + .05), .25, (G.PIT + G.HEAD - .6) / 2, .3, .5); }
    cub(G.DIV + .1, .05, (G.PIT - G.DECK) / 2, 0, -.35, (G.PIT + G.DECK) / 2, .8, 0); cub(G.DIV + .1, .6, .05, 0, .2, G.PIT + .05, .6, 0);
    const b = W.createRigidBody(R.RigidBodyDesc.dynamic().setTranslation(x0, G.LY + G.BR + .002, .3).setLinvel(Math.sin(ang) * spd, 0, Math.cos(ang) * spd).setAngvel({ x: spd / G.BR * .25, y: 0, z: spin * 20 }).setCcdEnabled(true).setAngularDamping(.02));
    W.createCollider(R.ColliderDesc.ball(G.BR).setMass(lb * .4536).setFriction(0).setFrictionCombineRule(R.CoefficientCombineRule.Max).setRestitution(.05), b);
    const pins = SPOT.map(([px, pz], i) => { if (!(stand >> i & 1)) return null; const p = W.createRigidBody(R.RigidBodyDesc.dynamic().setTranslation(px, G.LY + .001, G.HEAD + pz).setCcdEnabled(true));
      W.createCollider(R.ColliderDesc.convexHull(HULL).setMassProperties(1.53, { x: 0, y: .145, z: 0 }, { x: .0195, y: .0019, z: .0195 }, { x: 0, y: 0, z: 0, w: 1 }).setFriction(.3).setRestitution(.5).setRestitutionCombineRule(R.CoefficientCombineRule.Max), p); return p; });
    return { W, b, pins, stand, t: 0, calm: 0, done: false, hit: false, acc: 0 }; };
  const simStep = S => { S.W.step(); S.t += 1 / 120; const p = S.b.translation(), v = S.b.linvel(), past = p.z > G.DECK || p.y < -.1 || Math.hypot(v.x, v.z) < .05;
    const moving = S.pins.some(q => q && !q.isSleeping() && q.translation().z < G.DECK && q.translation().y > -.05 && (Math.hypot(q.linvel().x, q.linvel().y, q.linvel().z) > .03 || Math.hypot(q.angvel().x, q.angvel().y, q.angvel().z) > .2));
    if (!S.hit && S.pins.some(q => q && Math.hypot(q.linvel().x, q.linvel().z) > .4)) S.hit = true;
    if (past && !moving) { if ((S.calm += 1 / 120) > .5) S.done = true; } else S.calm = 0; if (S.t > 10) S.done = true; };
  const simOut = S => { let out = 0; S.pins.forEach((q, i) => { if (!q) return; const p = q.translation(), r = q.rotation(); if (1 - 2 * (r.x * r.x + r.z * r.z) > .8 && p.y > G.LY - .02 && Math.abs(p.x) < G.LW + .02 && p.z < G.DECK) out |= 1 << i; }); return out; };
  // ---- the hall and the lane
  const hall = new T.Group(); g.add(hall);   // the room round the lane: not shown in passthrough
  const std = (c, o = {}) => new T.MeshStandardMaterial({ color: c, roughness: .9, ...o }), box = (w, h, d, m, x, y, z, p = g) => { const q = K.shadowOn(new T.Mesh(new T.BoxGeometry(w, h, d), m)); q.position.set(x, y, z); p.add(q); return q; };
  { const maple = new T.MeshStandardMaterial({ map: K.ptex('floor_d', .5, 9), normalMap: K.ptex('floor_n', .5, 9, false), color: 0xf0d8ae, roughness: .5 }), dark = std(0x24201c), wall = std(0x2b3440);
    box(8, .1, 28, std(0x3a3f47), 0, -.05, 8.5, hall); box(2 * G.LW, G.LY, G.DECK + .6, maple, 0, G.LY / 2, (G.DECK - .6) / 2); box(3.4, G.LY, 4.6, maple, 0, G.LY / 2, -2.9);
    for (const s of [-1, 1]) { box(G.DIV - G.LW, .02, G.DECK + .6, dark, s * (G.LW + G.DIV) / 2, .01, (G.DECK - .6) / 2); box(.1, .2, G.HEAD, std(0x7a1f1f), s * (G.DIV + .05), .1, G.HEAD / 2 - .6); box(.1, 1.5, G.PIT - G.HEAD + .6, dark, s * (G.DIV + .05), .75, (G.PIT + G.HEAD - .6) / 2); }
    box(2 * G.DIV + .2, 1.2, .1, dark, 0, .6, G.PIT + .1); box(2 * G.DIV + .2, .7, .1, std(0x7a1f1f), 0, 1.85, G.HEAD - .3);
    const fl = new T.Mesh(new T.PlaneGeometry(2 * G.LW, .02).rotateX(-Math.PI / 2), new T.MeshBasicMaterial({ color: 0x111111 })); fl.position.set(0, G.LY + .001, 0); g.add(fl);
    for (const [w, h, x, y, z, ry] of [[8, 4, 0, 2, -5.2, 0], [8, 4, 0, 2, 22.5, Math.PI], [28, 4, -4, 2, 8.5, Math.PI / 2], [28, 4, 4, 2, 8.5, -Math.PI / 2]]) { const m = new T.Mesh(new T.PlaneGeometry(w, h), wall); m.position.set(x, y, z); m.rotation.y = ry; m.receiveShadow = true; hall.add(m); }
    const ce = new T.Mesh(new T.PlaneGeometry(8, 28).rotateX(Math.PI / 2), std(0x15181c)); ce.position.set(0, 4, 8.5); hall.add(ce);
    for (const z of [-2.5, 5, 12, 18.6]) { const l = new T.SpotLight(0xfff0d8, z > 18 ? 110 : 150, 18, 1.15, .7, 1.6); l.position.set(0, 3.6, z); l.target.position.set(0, 0, z); if (z > 18 || z < 0) { l.castShadow = true; l.shadow.mapSize.set(1024, 1024); l.shadow.bias = -.0005; l.shadow.camera.near = .5; l.shadow.camera.far = 6; } hall.add(l, l.target); } hall.add(new T.HemisphereLight(0xdfe8ff, 0x30281e, .3)); }
  const pinGeo = (() => { const q = new T.LatheGeometry(PROF.map(([y, r]) => new T.Vector2(Math.max(r, .001), y)), 14), p = q.attributes.position, c = []; for (let i = 0; i < p.count; i++) { const y = p.getY(i), red = y > .234 && y < .25 || y > .265 && y < .282; c.push(...(red ? [.85, .08, .1] : [.96, .95, .92])); } q.setAttribute('color', new T.Float32BufferAttribute(c, 3)); return q; })();
  const pinM = new T.MeshStandardMaterial({ vertexColors: true, roughness: .3 }), pins = SPOT.map(() => { const m = K.shadowOn(new T.Mesh(pinGeo, pinM)); g.add(m); return m; });
  const ball = K.shadowOn(new T.Mesh(new T.SphereGeometry(G.BR, 28, 20), new T.MeshStandardMaterial({ color: 0x24347a, roughness: .35, metalness: .1 }))); g.add(ball);
  const bC = K.cv(1024, 192), bT = K.tex(bC); { const m = new T.Mesh(new T.PlaneGeometry(3.2, .6), new T.MeshStandardMaterial({ map: bT, emissive: 0xffffff, emissiveMap: bT, emissiveIntensity: .8 })); m.position.set(0, 2.75, G.HEAD - .36); m.rotation.y = Math.PI; g.add(m); }
  const B = { rolls: [], stand: 1023, S: null, over: false, hold: false, charge: -1, last: null };
  function board() { const x = bC.getContext('2d'), sc = BOWLS.score(B.rolls); x.fillStyle = '#07090a'; x.fillRect(0, 0, 1024, 192); x.textAlign = 'center';
    sc.frames.forEach((f, i) => { const X = 12 + i * 100; x.strokeStyle = '#3a3d40'; x.lineWidth = 3; x.strokeRect(X, 14, 96, 164); x.fillStyle = '#d8d6cc'; x.font = '700 34px Arial'; x.fillText(f.m.join(' '), X + 48, 62); x.fillStyle = '#ffb629'; x.font = '700 54px "Courier New",monospace'; x.fillText(f.tot == null ? '' : f.tot, X + 48, 142); }); bT.needsUpdate = true; }
  function setPins() { SPOT.forEach(([px, pz], i) => { const m = pins[i]; m.visible = !!(B.stand >> i & 1); m.position.set(px, G.LY, G.HEAD + pz); m.quaternion.identity(); }); }
  function restart() { if (B.S) { try { B.S.W.free(); } catch (e) { } } B.rolls = []; B.stand = 1023; B.S = null; B.over = false; B.last = null; setPins(); board(); }
  // a throw: where across the lane, its line, its speed, its side spin, the ball's pounds
  function roll(v) { if (!ready || B.S || B.over) return false; B.S = simNew(v, B.stand); K.snd('bounce', K.headPos(), 4, .5); return true; }
  function settle() { const S = B.S, out = simOut(S), down = popc(B.stand) - popc(out); B.rolls.push(down); const nx = BOWLS.next(B.rolls); B.last = { down, out }; B.stand = nx.rack ? 1023 : out; try { S.W.free(); } catch (e) { } B.S = null; B.over = nx.done;
    K.flash(nx.done ? 'GAME ' + BOWLS.score(B.rolls).total : down === 10 || (nx.rack && down > 0 && B.rolls.length > 1 && BOWLS.mark(B.rolls)) ? (down === 10 && popc(S.stand) === 10 ? 'STRIKE' : 'SPARE') : down ? String(down) : 'GUTTER'); setPins(); board(); }
  const loc = (w, out) => out.set(-(w.x - O.x), w.y, -(w.z - O.z)), _l = new V3(), _v = new V3(), _d = new V3();
  function throwFrom(x, vx, vz, spin) { const spd = T.MathUtils.clamp(Math.hypot(vx, vz), 3.5, 9.5); return roll([T.MathUtils.clamp(x, -(G.LW - G.BR), G.LW - G.BR), T.MathUtils.clamp(Math.atan2(vx, vz), -.2, .2), spd, T.MathUtils.clamp(spin, -1, 1), 12]); }
  return { name: 'Bowling', help: 'look down the lane, hold click or <kbd>Space</kbd> for power, let go to bowl', touch: 'Hold <b>Shoot</b> for power, let go to bowl.', B, G, O, restart, roll, get ready() { return ready; }, boot,
    action() { if (B.over) restart(); else if (!B.S) B.charge = K.t; },
    release() { if (B.charge < 0 || B.S) { B.charge = -1; return; } const p = Math.min(1, (K.t - B.charge) / 1.2); B.charge = -1; loc(K.headPos(), _l); K.camera.getWorldDirection(_d); throwFrom(_l.x + .25, -_d.x * (5 + 4 * p), Math.abs(_d.z) * (5 + 4 * p), 0); },
    sim(dt) { const S = B.S; if (!S) return; S.acc = Math.min(.25, S.acc + dt); while (S.acc >= 1 / 120 && !S.done) { S.acc -= 1 / 120; simStep(S); } if (S.done) settle(); },
    frame(t, dt) { const h = K.mode ? (K.hands.find(q => q.src && q.src.handedness === K.racketHand) || K.hands.find(q => q.src)) : null, S = B.S;
      if (S) { this.sim(dt); if (B.S) { const p = S.b.translation(), r = S.b.rotation(); ball.position.set(p.x, p.y, p.z); ball.quaternion.set(r.x, r.y, r.z, r.w); S.pins.forEach((q, i) => { if (!q) return; const a = q.translation(), b = q.rotation(); pins[i].position.set(a.x, a.y, a.z); pins[i].quaternion.set(b.x, b.y, b.z, b.w); }); if (!S.said && S.hit) { S.said = true; K.snd('board', _v.set(O.x, .3, O.z - G.HEAD), 7, 1.6); } } }
      else if (h) { loc(h.pos, _l); if (h.pressed) { B.hold = true; ball.position.set(_l.x, Math.max(G.LY + G.BR, _l.y - .12), _l.z); } else { if (B.hold) { B.hold = false; _v.set(-h.vel.x, 0, -h.vel.z).multiplyScalar(1.7); if (_v.z > 2 && !B.over) throwFrom(_l.x, _v.x, _v.z, -h.angVel.z * .04); else if (B.over) restart(); } if (!B.S) ball.position.set(.9, .75, -1.6); } }
      else { loc(K.headPos(), _l); ball.position.set(_l.x + .25, .5, _l.z + .5); } },
    enter() { K.venue = 'room'; g.visible = true; hall.visible = K.mode !== 'ar'; K.BND.cx = O.x; K.BND.cz = O.z + 2.6; K.BND.x = 1.5; K.BND.z = 2.1; K.rig.position.set(O.x, 0, O.z + 2.4); if (B.over || !B.rolls.length) restart(); },
    leave() { g.visible = false; } };
}
