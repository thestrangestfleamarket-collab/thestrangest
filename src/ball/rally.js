// a racket game against the house, by the metre: one ball under drag, spin and gravity, a net, a racket in your hand, an opponent who runs and returns, the points; tennis and ping pong are each a row of numbers given to it
export function makeRally(K, C) {
  const T = K.THREE, V3 = K.V3, G = 9.81, R = C.R, g = new T.Group(); g.position.copy(C.O); g.visible = false; C.parent.add(g);
  const _a = new V3(), _b = new V3(), _c = new V3(), _n = new V3(), _t = new V3(), UP = new V3(0, 1, 0);
  const ball = { p: new V3(), v: new V3(), w: new V3(), mesh: K.shadowOn(new T.Mesh(new T.SphereGeometry(R, 20, 14), C.ballMat)) }; g.add(ball.mesh);
  const S = { on: false, state: 'idle', t: 0, last: null, bounces: 0, server: 'P', pts: [0, 0], games: [0, 0], over: false, sinceB: 0, cool: 0, hover: false, level: 1, rallies: 0, dead: 0 };
  // ---- the racket: handle along -Z, head centre at -L, strings facing X
  const rk = makeRacket(1), ark = makeRacket(0); g.add(ark.g); K.scene.add(rk.g); rk.g.visible = false; K.noBake.push(rk.g);
  function makeRacket(mine) { const q = new T.Group(), c = C.racket, frame = new T.MeshStandardMaterial({ color: mine ? c.color : c.color2, roughness: .4, metalness: .2 });
    const h = K.shadowOn(new T.Mesh(new T.CylinderGeometry(c.grip, c.grip, c.L - c.a, 10), new T.MeshStandardMaterial({ color: 0x1c1c1e, roughness: .8 }))); h.rotation.x = Math.PI / 2; h.position.z = -(c.L - c.a) / 2; q.add(h);
    if (c.solid) { const b = K.shadowOn(new T.Mesh(new T.CylinderGeometry(c.a, c.a, c.th * 2, 28), frame)); b.rotation.z = Math.PI / 2; b.scale.set(1, 1, c.b / c.a); b.position.z = -c.L; q.add(b); }
    else { const r = K.shadowOn(new T.Mesh(new T.TorusGeometry(c.a, c.th, 8, 36), frame)); r.rotation.y = Math.PI / 2; r.scale.set(1, c.b / c.a, 1); r.position.z = -c.L; q.add(r);
      const sc = K.cv(64, 64), x = sc.getContext('2d'); x.strokeStyle = '#f2f0e6'; x.lineWidth = 1.5; for (let i = 4; i < 64; i += 6) { x.beginPath(); x.moveTo(i, 0); x.lineTo(i, 64); x.moveTo(0, i); x.lineTo(64, i); x.stroke(); }
      const st = new T.Mesh(new T.CircleGeometry(c.a, 28), new T.MeshBasicMaterial({ map: K.tex(sc), transparent: true, side: T.DoubleSide })); st.rotation.y = Math.PI / 2; st.scale.set(1, c.b / c.a, 1); st.position.z = -c.L; q.add(st); }
    return { g: q, C: new V3(), N: new V3(1, 0, 0), A: new V3(0, 0, -1), C0: new V3(), N0: new V3(1, 0, 0), A0: new V3(0, 0, -1), sub: 0, fdt: .016, d0: 0, has: false, swing: 0 }; }
  // ---- the house's player
  const foe = new T.Group(); g.add(foe); { const m = new T.MeshStandardMaterial({ color: C.foeColor || 0xb8332b, roughness: .8 }), sk = new T.MeshStandardMaterial({ color: 0xb98a6a, roughness: .7 });
    const b = K.shadowOn(new T.Mesh(new T.CapsuleGeometry(.17, .5, 6, 12), m)); b.position.y = 1.08; const hd = K.shadowOn(new T.Mesh(new T.SphereGeometry(.11, 14, 10), sk)); hd.position.y = 1.62;
    const l = K.shadowOn(new T.Mesh(new T.CapsuleGeometry(.1, .6, 4, 10), new T.MeshStandardMaterial({ color: 0x14171a, roughness: .9 }))); l.position.y = .42; foe.add(b, hd, l); }
  const AI = { x: 0, z: -C.ai.home, tx: 0, tz: -C.ai.home, plan: null, swing: 0 };
  const L = v => _a.copy(v).sub(C.O), over = p => Math.abs(p.x) <= C.hw + (C.table ? 0 : R) && Math.abs(p.z) <= C.hl + (C.table ? 0 : R);
  const netH = x => C.net + (C.netPost - C.net) * Math.min(1, (x / C.netW) ** 2);
  // ---- one step of the ball alone; ev(kind, data) hears what it met
  function fly(b, hs, ev) { const sp = b.v.length(); b.v.addScaledVector(b.v, -C.kd * sp * hs); _c.crossVectors(b.w, b.v).multiplyScalar(C.km * hs); b.v.add(_c); b.v.y -= G * hs; b.w.multiplyScalar(1 - .12 * hs);
    const z0 = b.p.z, y0 = b.p.y; b.p.addScaledVector(b.v, hs);
    if (z0 * b.p.z <= 0 && z0 !== b.p.z && Math.abs(b.p.x) < C.netW) { const top = C.y0 + netH(b.p.x); if (b.p.y < top + R * .3 && b.p.y > C.y0 - .02) { b.p.z = Math.sign(z0 || 1) * (R + .002); b.v.z *= -.12; b.v.x *= .4; b.v.y *= .4; ev && ev('net'); }
      else if (b.p.y < top + R) { b.v.y = Math.abs(b.v.y) * .4 + .6; b.v.z *= .7; ev && ev('cord'); } }
    const tab = !C.table || (Math.abs(b.p.x) <= C.hw + R * .5 && Math.abs(b.p.z) <= C.hl + R * .5), fy = tab ? C.y0 : 0;
    if (b.p.y < fy + R && (y0 >= fy + R - 1e-4 || !C.table)) { b.p.y = fy + R; if (b.v.y < 0) { const vn = b.v.y, e = tab ? C.e : .75, sp2 = -vn;
        _t.set(b.v.x + b.w.z * R, 0, b.v.z - b.w.x * R); const vt = _t.length(), jn = -(1 + e) * vn; b.v.y += jn;   // the contact point's slide: friction turns it into spin
        if (vt > 1e-4) { _t.multiplyScalar(1 / vt); const jt = Math.min(.4 * vt, C.mu * jn); b.v.addScaledVector(_t, -jt); b.w.x += _t.z * jt * 1.5 / R; b.w.z -= _t.x * jt * 1.5 / R; }
        if (sp2 > .25) ev && ev('bounce', { on: tab, inb: tab && over(b.p), side: b.p.z > 0 ? 'P' : 'A', sp: sp2 }); else { b.v.x *= 1 - 2 * hs; b.v.z *= 1 - 2 * hs; } } } }
  // where the ball will be a moment after it next lands on `side`
  const pb = { p: new V3(), v: new V3(), w: new V3() };
  function predict(side, after) { pb.p.copy(ball.p); pb.v.copy(ball.v); pb.w.copy(ball.w); let hit = -1, bad = false, t = 0; const hs = 1 / 120;
    for (let i = 0; i < 480; i++) { t += hs; fly(pb, hs, (k, d) => { if (k === 'bounce' && hit < 0) { if (d.inb && d.side === side) hit = t; else bad = true; } if (k === 'net') bad = true; }); if (bad) return null; if (hit >= 0 && t >= hit + after) return { x: pb.p.x, y: pb.p.y, z: pb.p.z, t }; } return null; }
  // a shot from where the ball is to a spot on the far side, by the sums, raised until it clears the net
  function shoot(tx, tz, T0, spin) { const p = ball.p, dx = tx - p.x, dz = tz - p.z, d = Math.hypot(dx, dz); let Tm = T0;
    for (let i = 0; i < 12; i++) { const k = 1 + C.kd * d * .55, vx = dx / Tm * k, vz = dz / Tm * k, vy = (C.y0 + R - p.y) / Tm + .5 * G * Tm, tn = -p.z / vz, yn = p.y + vy * tn - .5 * G * tn * tn;
      ball.v.set(vx, vy, vz); if (tn < 0 || tn > Tm || yn > C.y0 + netH(p.x + vx * tn) + R + C.clear) break; Tm += C.dT; }
    _a.set(dx, 0, dz).normalize(); ball.w.crossVectors(UP, _a).multiplyScalar(spin); }
  function say() { C.board(S, score()); }
  function score() { if (C.rules === 'tennis') { const [a, b] = S.pts, n = ['0', '15', '30', '40']; return a >= 3 && b >= 3 ? (a === b ? 'DEUCE' : a > b ? 'ADV YOU' : 'ADV HOUSE') : n[Math.min(a, 3)] + ' - ' + n[Math.min(b, 3)]; } return S.pts[0] + ' - ' + S.pts[1]; }
  function point(who) { if (S.state === 'dead' || S.over) return; const i = who === 'P' ? 0 : 1; S.pts[i]++; S.fault = 0; S.serving = false; S.state = 'dead'; S.dead = 1.3; S.hover = false; K.flash(who === 'P' ? 'YOUR POINT' : 'HOUSE POINT');
    const [a, b] = S.pts;
    if (C.rules === 'tennis') { if ((a >= 4 || b >= 4) && Math.abs(a - b) >= 2) { S.games[i]++; S.pts = [0, 0]; S.server = S.server === 'P' ? 'A' : 'P'; if (S.games[i] >= C.games) { S.over = true; K.flash(who === 'P' ? 'YOU WIN THE MATCH' : 'THE HOUSE WINS'); } } }
    else { if ((a + b) % 2 === 0) S.server = S.server === 'P' ? 'A' : 'P'; if ((a >= C.to || b >= C.to) && Math.abs(a - b) >= 2) { S.over = true; K.flash(who === 'P' ? 'YOU WIN ' + a + '-' + b : 'THE HOUSE WINS ' + b + '-' + a); } }
    say(); }
  function serve() { S.state = 'live'; S.last = null; S.bounces = 0; S.sinceB = 0; S.t = 0; AI.plan = null; ball.w.set(0, 0, 0);
    if (C.servePos && K.mode !== 'ar') { const even = (S.pts[0] + S.pts[1]) % 2 === 0; if (S.server === 'P') { K.rig.position.set(C.O.x + (even ? 1 : -1) * C.servePos[0], K.rig.position.y, C.O.z + C.servePos[1]); K.rig.updateMatrixWorld(true); K.camera.updateMatrixWorld(true); } else AI.x = (even ? -1 : 1) * C.servePos[0]; }
    if (S.server === 'P') { S.hover = true; K.headPos(); const hp = L(K.headPos()); ball.p.set(hp.x + (K.racketHand === 'right' ? .3 : -.3), C.table ? C.y0 + .28 : Math.max(1.1, hp.y - .45), C.table ? C.hl - .12 : hp.z - .6); ball.v.set(0, 0, 0); }
    else { S.hover = false; ball.p.set(AI.x + .3, C.y0 + C.ai.hitY, AI.z + .3); S.last = 'A'; S.serving = true; const sv = C.serveAim ? C.serveAim('A', (S.pts[0] + S.pts[1]) % 2 === 0) : [(Math.random() * 2 - 1) * C.ai.tx, C.ai.tz0 + Math.random() * (C.ai.tz1 - C.ai.tz0)]; shoot(sv[0], sv[1], C.ai.T * 1.15, C.ai.spin * .5); AI.swing = 1; hitSound(8); moveYou(); } }
  const hitSound = sp => K.snd('bounce', _b.copy(ball.p).add(C.O), sp, C.pitch);
  // tennis only: you are stood where the ball is coming, on your racket's side
  function moveYou() { if (!C.autoMove || K.mode === 'ar') return; const q = predict('P', C.autoAfter); if (!q) return; const hp = L(K.headPos()), sd = K.racketHand === 'right' ? -1 : 1;
    const x = T.MathUtils.clamp(q.x + sd * .55, -C.hw - 3, C.hw + 3), z = T.MathUtils.clamp(q.z + .7, 1.5, C.hl + 3.2); K.rig.position.x += x - hp.x; K.rig.position.z += z - hp.z; K.vel.set(0, 0, 0); K.rig.updateMatrixWorld(true); }
  function onEv(k, d) { if (k === 'net') { K.snd('fence', _b.copy(ball.p).add(C.O), 4); return; } if (k === 'cord') return;
    K.snd('bounce', _b.copy(ball.p).add(C.O), d.sp, C.pitch * 1.5); if (S.state !== 'live' || !S.last) return; const recv = S.last === 'P' ? 'A' : 'P'; S.sinceB = 0;
    if (S.serving) { S.serving = false; if (C.serveIn && !C.serveIn(ball.p, S.last, (S.pts[0] + S.pts[1]) % 2 === 0)) { if (S.fault) { S.fault = 0; K.flash('DOUBLE FAULT'); point(recv); } else { S.fault = 1; S.state = 'dead'; S.dead = 1.1; K.flash('FAULT'); } return; } S.fault = 0; }
    if (S.bounces === 0) { if (d.inb && d.side === recv) S.bounces = 1; else point(recv); } else point(S.last); }
  function struck(by) { S.serving = S.hover || S.serving === 'A'; S.last = by; S.bounces = 0; S.hover = false; S.rallies++; AI.plan = null;
    if (by === 'P') { const q = predict('A', C.ai.after); if (q) AI.plan = q; } else moveYou(); }
  // ---- your racket against the ball, swept between frames
  function racketHit(hs) { if (!rk.has || S.cool > 0) return; rk.sub = Math.min(1, rk.sub + hs / rk.fdt); const a = rk.sub;
    _a.lerpVectors(rk.C0, rk.C, a); _n.lerpVectors(rk.N0, rk.N, a).normalize(); _t.lerpVectors(rk.A0, rk.A, a).normalize(); _c.subVectors(ball.p, _a);
    const d = _c.dot(_n), u = _c.dot(_t), bx = _b.crossVectors(_n, _t), s = _c.dot(bx), c = C.racket, d0 = rk.d0; rk.d0 = d;
    if ((u / (c.a + R * .6)) ** 2 + (s / (c.b + R * .6)) ** 2 > 1) return; if (!(Math.abs(d) < R + c.th || (d * d0 < 0 && Math.abs(d0) < .6))) return;
    const sg = (Math.abs(d0) > 1e-4 ? d0 : d) >= 0 ? 1 : -1; _n.multiplyScalar(sg);
    // the struck point's own speed, from where the racket was a frame ago
    const vp = new V3().subVectors(rk.C, rk.C0).addScaledVector(new V3().subVectors(rk.A, rk.A0), u).multiplyScalar(C.boost / rk.fdt); if (vp.length() > C.vmaxR) vp.setLength(C.vmaxR);
    const vr = _c.subVectors(ball.v, vp), vn = vr.dot(_n); if (vn >= 0 && !S.hover) return;
    ball.v.addScaledVector(_n, -(1 + c.e) * Math.min(vn, 0)); const vt = new V3().copy(vr).addScaledVector(_n, -vn); ball.v.addScaledVector(vt, -c.mu); ball.w.crossVectors(_n, vt).multiplyScalar(c.spin / R);
    if (S.hover && ball.v.length() < 1.5) { S.cool = .05; return; } if (ball.v.length() > C.vmax) ball.v.setLength(C.vmax);
    ball.p.copy(_a).addScaledVector(_t, u).addScaledVector(bx, s).addScaledVector(_n, R + c.th + .003); S.cool = .12; hitSound(ball.v.length());
    for (const h of K.hands) K.buzz(h, Math.min(1, .3 + ball.v.length() * .04), 40); struck('P'); }
  // on a screen there is no arm to swing: a click plays the ball to where you look
  function action() { if (!S.on) return; rk.swing = 1; if (S.state !== 'live') return; const hp = L(K.headPos()); if (ball.p.z < -.05 && !S.hover) return; if (_b.copy(ball.p).sub(hp).length() > C.reachP) return;
    K.camera.getWorldDirection(_n); const k = _n.y < -.02 ? (hp.y - C.y0) / -_n.y : 30, tx = T.MathUtils.clamp(hp.x + _n.x * k, -C.hw * .85, C.hw * .85), tz = T.MathUtils.clamp(hp.z + _n.z * k, -C.hl * .9, -C.hl * .25);
    const sv = S.hover && C.serveAim ? C.serveAim('P', (S.pts[0] + S.pts[1]) % 2 === 0, tx) : null; shoot(sv ? sv[0] : tx, sv ? sv[1] : tz, C.ai.T * .92, C.ai.spin); hitSound(ball.v.length()); struck('P'); }
  function restart() { S.pts = [0, 0]; S.games = [0, 0]; S.over = false; S.server = 'P'; S.rallies = 0; say(); serve(); }
  function setOn(v) { if (S.on === v) return; S.on = v; g.visible = v; rk.g.visible = v; rk.has = false; if (v) restart(); else S.state = 'idle'; }
  function frame(t, dt) { if (!S.on) return;
    // the racket follows your hand: a controller's grip, a tracked wrist, or the camera on a screen
    const h = K.mode ? (K.hands.find(q => q.src && q.src.handedness === K.racketHand) || K.hands.find(q => q.src)) : null, q = rk.g;
    if (h) { if (h.isHand && h.handObj.joints.wrist) { const wj = h.handObj.joints.wrist; wj.getWorldQuaternion(q.quaternion); const sd = K.racketHand === 'right' ? -1 : 1;
        const zr = _a.set(sd * .9, 0, -.45).normalize().negate().clone(), xr = new V3(0, -1, 0), yr = new V3().crossVectors(zr, xr).normalize(); xr.crossVectors(yr, zr); q.quaternion.multiply(new T.Quaternion().setFromRotationMatrix(new T.Matrix4().makeBasis(xr, yr, zr))); q.position.copy(h.pos); }
      else { h.grip.getWorldPosition(q.position); h.grip.getWorldQuaternion(q.quaternion); } }
    else { rk.swing = Math.max(0, rk.swing - dt * 3.5); const s = Math.sin(rk.swing * Math.PI); q.position.set(.34 - s * .3, -.34 + s * .12, -.5 - s * .25); q.quaternion.setFromEuler(new T.Euler(.5 - s * .9, -.25 + s * 1.3, -.3)); K.camera.updateMatrixWorld(true); q.applyMatrix4(K.camera.matrixWorld); }
    q.updateMatrixWorld(true); rk.C0.copy(rk.C); rk.N0.copy(rk.N); rk.A0.copy(rk.A);
    rk.A.set(0, 0, -1).applyQuaternion(q.quaternion); rk.N.set(1, 0, 0).applyQuaternion(q.quaternion); rk.C.copy(q.position).addScaledVector(rk.A, C.racket.L).sub(C.O);
    if (!rk.has) { rk.C0.copy(rk.C); rk.N0.copy(rk.N); rk.A0.copy(rk.A); rk.d0 = 0; } rk.has = !!h; rk.sub = 0; rk.fdt = Math.max(dt, 1 / 240);
    logic(dt); S.cool -= dt; ball.mesh.position.copy(ball.p); ball.mesh.visible = S.state !== 'idle'; }
  // the house: runs to where the ball is going, swings when it comes; and the clock between points
  function logic(dt) {
    const A = C.ai, lv = A.levels[S.level]; if (AI.plan) { AI.tx = AI.plan.x - .35; AI.tz = Math.min(-A.near, AI.plan.z - .15); } else if (S.state !== 'live' || S.last === 'A') { AI.tx = 0; AI.tz = -A.home; }
    AI.tx = T.MathUtils.clamp(AI.tx, -C.hw - A.wide, C.hw + A.wide); const dx = AI.tx - AI.x, dz = AI.tz - AI.z, dd = Math.hypot(dx, dz), mv = lv.speed * dt; if (dd > mv) { AI.x += dx / dd * mv; AI.z += dz / dd * mv; } else { AI.x = AI.tx; AI.z = AI.tz; }
    foe.position.set(AI.x, C.table ? 0 : 0, AI.z); AI.swing = Math.max(0, AI.swing - dt * 3); const sw = Math.sin(AI.swing * Math.PI);
    ark.g.position.set(AI.x + .35 - sw * .3, C.table ? C.y0 + .22 : 1.05 + sw * .2, AI.z + .2 + sw * .35); ark.g.rotation.set(-.6 + sw * 1.2, Math.PI + .3 - sw * .9, .2);
    if (S.state === 'live' && S.last === 'P' && ball.p.z < 0 && (S.bounces === 1 ? S.sinceB >= A.after : (!C.table && ball.p.z < AI.z + 1.2 && ball.p.y < 2.2 && ball.p.y > .5))) {
      const rx = ball.p.x - (AI.x + .35), rz = ball.p.z - AI.z; if (Math.hypot(rx, rz) < A.reach && ball.p.y - C.y0 < A.high) { AI.swing = 1;
        if (Math.random() < lv.miss) { S.last = 'P'; AI.plan = null; S.bounces = 1; S.sinceB = -9; }
        else { shoot((Math.random() * 2 - 1) * A.tx * lv.aim, A.tz0 + Math.random() * (A.tz1 - A.tz0), A.T * (0.9 + Math.random() * .25) / lv.pace, A.spin); hitSound(ball.v.length()); struck('A'); } } }
    if (S.state === 'dead') { S.dead -= dt; if (S.dead <= 0) { if (S.over) { S.state = 'idle'; } else serve(); } }
    if (S.state === 'live') { S.t += dt; S.sinceB += dt; if (!S.hover && (S.t > 14 || ball.p.y < -2 || Math.abs(ball.p.x) > 40 || Math.abs(ball.p.z) > 40)) point(S.last === 'P' ? 'A' : 'P'); }
  }
  function step(hs) { if (!S.on || S.state !== 'live') { if (S.on && S.state === 'dead') fly(ball, hs, null); return; } racketHit(hs); if (S.hover) return; fly(ball, hs, onEv); }
  return { S, g, ball, AI, rk, frame, sim: logic, step, action, setOn, restart, serve, predict, shoot, struck, point, score, fly };
}
