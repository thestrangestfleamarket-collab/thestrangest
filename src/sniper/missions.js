// COLD BORE's five contracts: who is where, what they do, what ends it. Each setup(g, S, R) returns {focus, update, person, hitTest, struck, shot, impact}
import * as THREE from 'three';

const V = (x, y, z) => new THREE.Vector3(x, y, z), GREY = [0.47, 0.48, 0.5], NAVY = [0.1, 0.12, 0.22], BLACK = [0.05, 0.05, 0.06], WHITE = [0.92, 0.91, 0.87], RED = [0.72, 0.07, 0.07], BLUE = [0.1, 0.25, 0.7], TAN = [0.36, 0.21, 0.1];
const bystander = (g, p, d) => { g.crowd.kill(p, d); g.fail('You shot a bystander.'); };

// people going about the streets round a place: along the pavements either side of the nearest roads
const streetLife = (g, c, R, n) => { for (let i = 0; i < n; i++) { const along = R() < 0.5, line = Math.round(((along ? c.x : c.z) - (along ? 40 : 30)) / 80 + (R() < 0.5 ? 0 : (R() < 0.5 ? 1 : -1))) * 80 + (along ? 40 : 30) + (R() < 0.5 ? -9 : 9) + (R() - 0.5) * 1.6, a = (along ? c.z : c.x) - 150 + R() * 300, b = a + (R() < 0.5 ? -1 : 1) * (60 + R() * 120), fem = R() < 0.5, P = (q) => along ? [line, q] : [q, line];
  g.crowd.add({ female: fem, skirt: fem && R() < 0.4, suit: R() < 0.4, pack: R() < 0.2 ? [0.2, 0.25, 0.3] : null, cap: R() < 0.15 ? [0.2, 0.2, 0.5] : null, at: P(a), tasks: [{ to: P(b), speed: 1.1 + R() * 0.5 }, { wait: R() * 6, pose: R() < 0.3 ? 'phone' : 'stand' }, { to: P(a), speed: 1.1 + R() * 0.5 }, { wait: R() * 4 }] }, R); } };

export const MISSIONS = [
  { id: 'zero', name: 'ZERO DAY', tag: 'Qualification · steel from 100 m to 1000 m', site: 'range', env: 'noon', seed: 3, wind: { from: 80, speed: 2.2, gust: 1 }, look: [0, 3, -500], rounds: 20, par: 4,
    brief: ['Before we send you anywhere, prove the rifle.', 'Ring the steel at 100, 300, 500 and 800 metres. Any order.', 'Lase the plate. Dial the UP the card gives. Hold off for wind: the card says how far one metre a second pushes it. Hold your breath. Squeeze.', 'The rifle is zeroed at 100: no dial there.'],
    setup(g, S) {
      const need = [100, 300, 500, 800], done = new Set(), obj = () => g.objective('Ring steel at ' + need.map(d => (done.has(d) ? '[x] ' : '[ ] ') + d).join('   ')); obj();
      return { focus: () => S.plates.map(p => p.pos), update() {},
        hitTest(a, b) { for (const p of S.plates) { const pz = p.pos.z; if (a.z > pz && b.z <= pz) { const s = (a.z - pz) / (a.z - b.z), x = a.x + (b.x - a.x) * s, y = a.y + (b.y - a.y) * s; if (Math.hypot(x - p.pos.x, y - p.pos.y) <= p.r) return { s, plate: p, at: V(x, y, pz) }; } } return null; },
        struck(h) { const p = h.plate; p.sv += 4 + Math.random() * 2; p.hits++; g.audio.play('ding', p.d / 343, p.d); g.fx.impact(h.at, V(0, 0, 1), 'steel');
          const mk = new THREE.Mesh(new THREE.CircleGeometry(0.018 + p.r * 0.04, 10), new THREE.MeshBasicMaterial({ color: 0x2a2a2a })); mk.userData.own = true; mk.rotation.x = -Math.PI / 2; mk.position.set(h.at.x - p.pos.x, 0.012, -(h.at.y - p.pos.y)); p.mesh.add(mk);
          g.say('Hit. ' + p.d + '.'); if (need.includes(p.d)) { done.add(p.d); obj(); if (done.size === need.length) g.win('Rifle proven. You are cleared for work.'); } } };
    } },

  { id: 'paper', name: 'PAPER TRAIL', tag: 'City plaza · 255 m · one man in a crowd', site: 'city', env: 'day', seed: 5, wind: { from: 270, speed: 2, gust: 1.2 }, look: [0, 0, -250], rounds: 5, par: 1, shadow: 'plaza',
    brief: ['Viktor Dahl launders money for people who start wars. Today he carries the ledger across Meridian Plaza.', 'He waits by the fountain, takes a call at the cafe, then leaves in the black saloon on the west kerb.', 'There are other suits down there. Be certain. One bystander and we are finished.', 'The round arrives before the sound does: the first shot is the free one.'],
    dossier: { name: 'VIKTOR DAHL', lines: ['Grey suit', 'Red tie', 'Bald', 'Brown briefcase'], look: { coat: GREY, tie: RED, bald: true, case: TAN } },
    setup(g, S, R) {
      const P = S.plaza, C = g.crowd, exits = [[P.x - 95, P.z + 40], [P.x + 95, P.z - 40], [P.x - 40, P.z - 90], [P.x + 40, P.z + 90]], carAt = [P.x - 34.6, P.z + 8], t0 = S.tables[0];
      const T = C.add({ name: 'Dahl', role: 'target', coat: GREY, legs: GREY, tie: RED, bald: true, case: TAN, skin: [0.9, 0.72, 0.6], scale: 1.0, at: carAt, yaw: 1.57, loop: false,
        tasks: [{ wait: 7 }, { to: [P.x - 7.4, P.z + 3.5] }, { wait: 26, pose: 'watch', yaw: 2.6 }, { to: [t0[0] - 1.9, t0[1] + 0.2] }, { wait: 24, pose: 'phone', yaw: 0.4 }, { to: carAt }, { wait: 1 }, { call: (p) => { p.gone = true; p.g.visible = false; g.fail('Dahl drove away with the ledger.'); } }] }, R);
      T.onAlarm = (p) => C.set(p, [{ wait: 0.5, pose: 'cower' }, { to: carAt, run: !p.hurt, speed: p.hurt ? 1.1 : 0 }, { wait: 1.2 }, { call: (q) => { q.gone = true; q.g.visible = false; g.fail('Dahl reached his car.'); } }]);
      C.add({ coat: GREY, legs: GREY, tie: BLUE, case: [0.1, 0.1, 0.1], hair: [0.25, 0.15, 0.08], at: [P.x + 24, P.z + 20], tasks: [{ to: [P.x - 18, P.z - 16] }, { wait: 9, pose: 'watch' }, { to: [P.x + 5, P.z + 8] }, { wait: 12, pose: 'phone' }, { to: [P.x + 24, P.z + 20] }, { wait: 6 }] }, R);
      C.add({ coat: NAVY, legs: NAVY, tie: RED, hat: [0.2, 0.2, 0.22], case: TAN, at: [P.x + 10.6, P.z + 9.1], yaw: 3.14, tasks: [{ wait: 22, pose: 'sit', yaw: 3.14 }, { to: [P.x + 6.5, P.z - 3] }, { wait: 14, pose: 'watch' }, { to: [P.x + 10.6, P.z + 9.1] }] }, R);
      C.add({ coat: GREY, legs: GREY, tie: RED, hair: [0.08, 0.06, 0.05], phone: true, at: [P.x + 6.8, P.z - 5.5], tasks: [{ wait: 30, pose: 'phone', yaw: 1 }, { to: [P.x - 14, P.z + 12] }, { wait: 16, pose: 'phone', yaw: 4 }, { to: [P.x + 6.8, P.z - 5.5] }] }, R);
      const pts = [[-28, -24], [28, -24], [-28, 24], [28, 24], [0, -18], [0, 18], [-20, 0], [20, 2], [-12, -12], [12, 14]];
      for (let i = 0; i < 20; i++) { const a = pts[R() * pts.length | 0], b = pts[R() * pts.length | 0], c = pts[R() * pts.length | 0], fem = R() < 0.5;
        C.add({ female: fem, skirt: fem && R() < 0.5, pack: R() < 0.25 ? [0.2, 0.3, 0.2] : null, cap: R() < 0.2 ? [0.6, 0.1, 0.1] : null, at: [P.x + a[0], P.z + a[1]], tasks: [{ to: [P.x + b[0], P.z + b[1]] }, { wait: 2 + R() * 9, pose: R() < 0.4 ? 'phone' : 'stand' }, { to: [P.x + c[0], P.z + c[1]] }, { wait: 1 + R() * 5 }, { to: [P.x + a[0], P.z + a[1]] }] }, R); }
      for (let i = 1; i < 4; i++) { const t = S.tables[i]; C.add({ female: i % 2 === 0, at: [t[0] - 0.85, t[1]], yaw: 1.57, tasks: [{ wait: 999, pose: 'sit', yaw: 1.57 }] }, R); if (i !== 2) C.add({ female: true, skirt: true, at: [t[0] + 0.85, t[1]], yaw: -1.57, tasks: [{ wait: 999, pose: 'sit', yaw: -1.57 }] }, R); }
      C.add({ at: [P.x - 9, P.z - 9.6], tasks: [{ wait: 999, pose: 'talk', yaw: 1.57 }] }, R); C.add({ female: true, at: [P.x - 7.8, P.z - 9.6], tasks: [{ wait: 999, pose: 'talk', yaw: -1.57 }] }, R);
      streetLife(g, P, R, 34); g.objective('Find Viktor Dahl: grey suit, red tie, bald, brown briefcase.');
      const scare = (at, r) => { if (!scare.done) { scare.done = true; g.audio.play('scream', 0.5); } C.alarm(at, r, exits); };
      return { target: T, focus: () => [C.chest(T, V())], update() {},
        shot() { g.later(P.distanceTo(g.eye()) / 343, () => scare(P, 120)); }, impact(at) { if (at.distanceTo(P) < 70) scare(at, 45); },
        person(p, zone, d) { if (p !== T) return bystander(g, p, d); if (zone === 'legs') { p.hurt = true; p.alert = false; g.say('Leg. He is hit but moving.'); scare(p.pos, 60); return; } C.kill(p, d); scare(p.pos, 60); g.win('Dahl is down. The ledger dies with him.'); } };
    } },

  { id: 'air', name: 'DEAD AIR', tag: 'Penthouse terrace · 440 m · dusk', site: 'city', env: 'dusk', seed: 5, wind: { from: 60, speed: 4, gust: 1.5 }, look: [168, 25, -399], rounds: 5, par: 1, shadow: 'terrace',
    brief: ['Colonel Reza Marek sells the coordinates his own men die at. Tonight he is on the roof of the Calder building, on the phone as always.', 'White jacket, sunglasses at dusk. His waiter wears white too: check for the glasses before you send it.', 'Two guards with him. The moment a round lands they take him inside, and he does not come out again.', 'Four hundred and forty metres with a quartering wind from your right. Dial it. Hold into it.'],
    dossier: { name: 'COL. REZA MAREK', lines: ['White jacket', 'Sunglasses', 'On the phone', 'Not the waiter'], look: { coat: WHITE, shades: true, phone: true, legs: WHITE } },
    setup(g, S, R) {
      const E = S.terrace, C = g.crowd, y = E.y, door = [E.x + 4.7, E.z - 9], lap = [{ to: [E.x - 10, E.z + 11.2] }, { wait: 15, pose: 'phone', yaw: 3.6 }, { to: [E.x + 4, E.z + 3.2] }, { wait: 9, pose: 'talk', yaw: 1.2 }, { to: [E.x - 10.5, E.z - 8] }, { wait: 13, pose: 'phone', yaw: 4.4 }, { to: [E.x + 5.2, E.z + 7.9] }, { wait: 13, pose: 'sit', yaw: 2.4 }];
      const T = C.add({ name: 'Marek', role: 'target', y, coat: WHITE, legs: WHITE, shades: true, phone: true, hair: [0.08, 0.06, 0.05], skin: [0.78, 0.58, 0.44], scale: 1.02, at: door, loop: false,
        tasks: [{ wait: 5 }, ...lap, ...lap, { to: door }, { call: (p) => { p.gone = true; p.g.visible = false; g.fail('Marek went inside for the night.'); } }] }, R);
      T.onAlarm = (p) => C.set(p, [{ wait: 0.45, pose: 'cower' }, { to: door, run: true }, { call: (q) => { q.gone = true; q.g.visible = false; g.fail('His guards got Marek inside.'); } }]);
      C.add({ y, coat: WHITE, legs: BLACK, hair: [0.25, 0.15, 0.08], at: [E.x + 9.4, E.z + 2], tasks: [{ wait: 8, yaw: -1.57 }, { to: [E.x + 5, E.z + 6.9] }, { wait: 5 }, { to: [E.x - 6.8, E.z + 4.6] }, { wait: 6 }, { to: [E.x + 9.4, E.z + 2] }] }, R);
      C.add({ y, female: true, skirt: true, coat: [0.7, 0.08, 0.1], hair: [0.08, 0.06, 0.05], at: [E.x + 5, E.z + 3.6], tasks: [{ wait: 40, pose: 'talk', yaw: -2 }, { to: [E.x - 4.5, E.z + 9] }, { wait: 20, pose: 'phone' }, { to: [E.x + 5, E.z + 3.6] }] }, R);
      const guard = (at, path) => { const p = C.add({ y, role: 'guard', coat: BLACK, legs: BLACK, vest: [0.12, 0.13, 0.1], cap: BLACK, gun: true, shades: true, at, tasks: path }, R); p.onAlarm = (q) => C.set(q, [{ wait: 99, pose: 'aim', yaw: Math.atan2(g.eye().x - q.pos.x, g.eye().z - q.pos.z) }]); return p; };
      guard([E.x - 12.5, E.z + 12.5], [{ wait: 9, pose: 'guard', yaw: 3.9 }, { to: [E.x + 12.5, E.z + 12.5] }, { wait: 9, pose: 'guard', yaw: 2.4 }, { to: [E.x - 12.5, E.z + 12.5] }]);
      guard([E.x - 12.5, E.z - 12], [{ wait: 12, pose: 'guard', yaw: 4.6 }, { to: [E.x - 12.5, E.z + 4] }, { wait: 7, pose: 'guard', yaw: 4.6 }, { to: [E.x - 12.5, E.z - 12] }]);
      streetLife(g, new THREE.Vector3(E.x, 0, E.z), R, 26); g.objective('Find Colonel Marek: white jacket, sunglasses, on the phone.');
      const ctr = V(E.x, E.y, E.z), scare = (at, r) => { if (!scare.done) { scare.done = true; g.audio.play('alarm'); } C.alarm(at, r, [door]); };
      return { target: T, focus: () => [C.chest(T, V())], update() {},
        shot() { g.later(ctr.distanceTo(g.eye()) / 343, () => scare(ctr, 60)); }, impact(at) { if (at.distanceTo(ctr) < 40) scare(ctr, 60); },
        person(p, zone, d) { if (p.role === 'civ') return bystander(g, p, d); C.kill(p, d); scare(ctr, 60); if (p === T) g.win('Marek is off the air for good.'); else g.say('Guard down. Marek is moving!'); } };
    } },

  { id: 'glass', name: 'GLASS', tag: 'Counter-sniper · 580 m · rain', site: 'city', env: 'rain', seed: 5, wind: { from: 300, speed: 5, gust: 2 }, look: [-140, 14, -553], rounds: 8, par: 1, hp: 2,
    brief: ['There is another rifle in the city and it is looking for you. He has taken a room in the Meridian flats, 580 metres, somewhere behind an open window.', 'You will not see him. You will see his glass catch the light, and you will see his muzzle flash a second and a half before you hear it.', 'People live in those flats. A face at a window is not a rifle.', 'He gets better with every shot. Find him first.'],
    dossier: { name: 'UNKNOWN MARKSMAN', lines: ['Open window', 'Lens glint', 'Muzzle flash', 'Moves after firing'], look: { coat: BLACK, cap: BLACK, legs: BLACK } },
    setup(g, S, R) {
      const C = g.crowd, W = S.wins.slice(), take = () => W.splice(R() * W.length | 0, 1)[0], nests = [take(), take(), take()], eye = g.eye();
      for (let i = 0; i < 3; i++) { const w = take(); C.add({ y: w.y + 0.11, female: i === 1, coat: [[0.8, 0.75, 0.6], [0.3, 0.5, 0.7], [0.6, 0.3, 0.3]][i], phone: i === 0, at: [w.x + (R() - 0.5) * 0.8, w.z - 0.2], yaw: 0.2, tasks: [{ wait: 12 + R() * 10, pose: i === 0 ? 'phone' : 'stand', yaw: 0.2 }, { to: [w.x, w.z - 3.5] }, { wait: 8 + R() * 8 }, { to: [w.x + (R() - 0.5) * 0.8, w.z - 0.2] }] }, R); }
      let at = 0; const T = C.add({ name: 'the marksman', role: 'target', y: nests[0].y + 0.11, coat: BLACK, legs: BLACK, cap: BLACK, gun: true, skin: [0.78, 0.58, 0.44], at: [nests[0].x, nests[0].z], yaw: Math.atan2(eye.x - nests[0].x, eye.z - nests[0].z), loop: true, tasks: [{ wait: 999, pose: 'aim' }] }, R);
      const glint = g.fx.glint(), st = { next: 13, n: 0, gl: 2, hide: 0 }, lens = (o) => o.set(T.pos.x + Math.sin(T.yaw) * 0.5, T.pos.y + 1.13, T.pos.z + Math.cos(T.yaw) * 0.5);
      const move = () => { st.hide = 2.6; T.g.visible = false; T.gone = true; at = (at + 1 + (R() * 2 | 0)) % 3; const w = nests[at]; T.pos.set(w.x, w.y + 0.11, w.z); T.yaw = Math.atan2(eye.x - w.x, eye.z - w.z); };
      const where = () => { const w = nests[at]; return (w.f <= 3 ? 'low floors' : w.f <= 5 ? 'middle floors' : 'top floors') + ', ' + (w.b < 5 ? 'left half' : 'right half'); };
      streetLife(g, new THREE.Vector3(S.T.block.x, 0, S.T.block.z + 40), R, 22); g.objective('Find the marksman in the flats before he finds you.');
      return { target: T, focus: () => [C.head(T, V())],
        update(dt) {
          if (!T.alive) { glint.visible = false; return; }
          if (st.hide > 0) { st.hide -= dt; glint.visible = false; if (st.hide <= 0) { T.gone = false; T.g.visible = true; } return; }
          st.next -= dt; st.gl -= dt; const pre = st.next < 1.3; if (st.gl < -0.28) st.gl = 1.8 + R() * 2.2;
          glint.visible = pre || st.gl < 0; lens(glint.position); glint.scale.setScalar(pre ? 0.5 + (1.3 - st.next) * 0.9 : 0.55);
          if (st.next <= 0) { const from = lens(V()); g.fx.flash(from, 2.2); g.enemyShot(from, Math.min(0.62, 0.1 + st.n * 0.14)); st.n++; st.next = 7.5 + R() * 3.5; if (st.n === 1 || st.n % 2 === 0) g.later(0.9, () => g.say('Shot! ' + where() + '.')); if (R() < 0.45) g.later(1.4, () => { if (T.alive) move(); }); }
        },
        impact(a) { if (T.alive && st.hide <= 0 && a.distanceTo(T.pos) < 3.2) { g.later(0.5, () => { if (T.alive) move(); }); st.next = Math.min(st.next, 5); } },
        person(p, zone, d) { if (p !== T) return bystander(g, p, d); C.kill(p, d); glint.visible = false; g.win('The other rifle is silent.'); } };
    } },

  { id: 'light', name: 'LAST LIGHT', tag: 'Harbour pier · 830 m · moving target, strong wind', site: 'harbor', env: 'dawn', seed: 9, wind: { from: 250, speed: 6.5, gust: 2.5 }, look: [60, 4, -820], rounds: 6, par: 1,
    brief: ['They call him the Commodore. He has bought a navy one stolen hull at a time, and in ninety seconds he flies out of our reach for good.', 'His cars stop on the long pier. He walks sixty metres to the helicopter: white suit, white hat, a guard in front and one behind. The woman with the case is not ours to touch.', 'Eight hundred and thirty metres across open water. The round is in the air for more than a second: lead him by where he will be, and the wind will take it a man\'s width or more.', 'Read the flags on the pier. Wait for the lull if you can. If you miss, they run.'],
    dossier: { name: 'THE COMMODORE', lines: ['White suit', 'White hat', 'Walks between two guards', '830 m, walking left to right'], look: { coat: WHITE, legs: WHITE, hat: WHITE, shades: true } },
    setup(g, S, R) {
      const C = g.crowd, y = S.PY, z = S.PZ, board = [S.HX - 3, z + 0.6], stops = [34, 25], ctr = V(60, y, z); let out = false, t = 0, lift = 0, T = null, team = [];
      S.suvs.forEach((s, i) => { s.position.set(-100 - i * 9, y, z + 3.2); s.rotation.y = Math.PI / 2; s.traverse(o => { o.matrixAutoUpdate = true; }); });
      const spinner = g.world.spin[0]; spinner.w = 7; g.objective('Stop the Commodore before he reaches the helicopter.');
      const run = () => { for (const p of team) if (p.alive && !p.gone) { const tk = p.tasks[p.ti]; if (tk && tk.to) { tk.run = true; tk.speed = 0; } } };
      const scare = () => { if (scare.done) return; scare.done = true; g.say('They are running!'); run(); };
      return { get target() { return T; }, focus: () => T ? [C.chest(T, V())] : [ctr],
        update(dt) {
          t += dt; S.suvs.forEach((s, i) => { const k = Math.min(1, t / (9 + i * 0.4)), e = 1 - (1 - k) * (1 - k); s.position.x = -100 - i * 9 + (stops[i] + 100 + i * 9) * e; });
          if (!out && t > 11.5) { out = true; g.say('He is out of the car. White suit, white hat.');
            const mk = (o, dx, dz, lag) => { const p = C.add({ y, ...o, at: [stops[0] + 3 + dx, z + 0.6 + dz], yaw: 1.57, loop: false, tasks: [{ wait: lag }, { to: [board[0] + dx * 0.4, board[1] + dz], speed: 1.3 }, { call: (q) => { q.gone = true; q.g.visible = false; if (q === T) { lift = 0.01; g.fail('The Commodore is aboard.'); } } }] }, R); p.onAlarm = () => {}; team.push(p); return p; };
            mk({ role: 'guard', coat: BLACK, legs: BLACK, shades: true, tie: BLACK }, 4, 0, 0); T = mk({ name: 'the Commodore', role: 'target', coat: WHITE, legs: WHITE, hat: WHITE, shades: true, skin: [0.9, 0.72, 0.6], scale: 1.03 }, 0, 0, 1.6);
            mk({ female: true, coat: [0.7, 0.6, 0.45], case: [0.1, 0.1, 0.1], hair: [0.55, 0.42, 0.2] }, -1.2, 1.3, 2.2); mk({ role: 'guard', coat: BLACK, legs: BLACK, shades: true, tie: BLACK }, -3.5, -0.3, 3.4); }
          if (lift > 0) { lift += dt; spinner.w = Math.min(34, 7 + lift * 6); if (lift > 4.5) { S.heli.position.y += Math.min(6, (lift - 4.5) * 1.2) * dt; S.heli.position.x += Math.min(9, Math.max(0, lift - 7) * 2) * dt; } }
          g.audio.loop('heli', 0.05 + Math.min(0.1, lift * 0.012), 90 + spinner.w * 3, 1.2, spinner.w / 3.14 * 0.5);
        },
        shot() { g.later(ctr.distanceTo(g.eye()) / 343, scare); }, impact(a) { if (a.distanceTo(ctr) < 70 || (T && a.distanceTo(T.pos) < 25)) scare(); },
        person(p, zone, d) { if (p.role === 'civ') return bystander(g, p, d); C.kill(p, d); scare(); if (p === T) g.win('The Commodore never made his flight.'); else g.say('Guard down.'); } };
    } },
];
