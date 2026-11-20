// Scripted player. Drives the same input layer a human uses (no teleports, no state edits) so a night can be play-tested in fast-forward.
'use strict';
(function () {
const { V3 } = MC, W = MC.world, PL = MC.player, G = MC.game, C = MC.cook, P = MC.phys, I = MC.input, E = MC.events;
const B = MC.bot = { fails: [], log: [], verbose: false };
const rig = MC.rig;
const step = B.step = (n = 1) => { for (let i = 0; i < n; i++) MC.tick(1 / 60); };
const note = m => { B.log.push(G.time.toFixed(0) + 's ' + m); if (B.verbose) console.log(B.log[B.log.length - 1]); };
const fail = m => { B.fails.push(G.time.toFixed(0) + 's ' + m); note('FAIL ' + m); if (playing()) step(45); return false; };
const playing = () => G.mode === 'play';
// stand perfectly still while anything can see us
function calm() { let n = 0; while (playing() && (E.danger || (E.active && W.litTarget > 0)) && n++ < 3000) { I.mx = I.mz = 0; step(1); } }
B.look = function (t) { const h = PL.headW(), dx = t.x - h.x, dy = t.y - h.y, dz = t.z - h.z; PL.yaw = Math.atan2(-dx, -dz); PL.pitch = Math.atan2(dy, Math.hypot(dx, dz)); step(1); };
B.walkStraight = function (x, z, tol = 0.2, maxT = 7) {
  let n = 0, stuck = 0, lx = rig.position.x, lz = rig.position.z;
  while (n++ < maxT * 60 && playing()) {
    calm(); const p = rig.position, dx = x - p.x, dz = z - p.z, d = Math.hypot(dx, dz);
    if (d < tol) { I.mz = 0; step(3); return true; }
    PL.yaw = Math.atan2(-dx, -dz); PL.pitch = 0; I.mz = d < 0.7 ? 0.4 : 1; step(1);
    if (n % 30 === 0) { if (Math.hypot(p.x - lx, p.z - lz) < 0.15) stuck++; else stuck = 0; lx = p.x; lz = p.z; if (stuck > 2) { I.jump = true; I.mx = (stuck % 2 ? 1 : -1); step(12); I.mx = 0; } }
  }
  I.mz = 0; step(2); return false;
};
function clear(ax, az, bx, bz) { const d = Math.hypot(bx - ax, bz - az), n = Math.ceil(d / 0.2), Gd = P.grid; for (let i = 0; i <= n; i++) { const x = ax + (bx - ax) * i / n, z = az + (bz - az) * i / n, [ci, cj] = P.cellOf(x, z); if (Gd.g[cj * Gd.nx + ci]) return false; } return true; }
B.walkTo = function (x, z, tol = 0.3) {
  for (let attempt = 0; attempt < 3 && playing(); attempt++) {
    const p = rig.position; if (Math.hypot(x - p.x, z - p.z) < tol) return true;
    if (p.y > 1.0) { if (B.walkStraight(x, z, tol)) return true; continue; }
    const path = P.path(p.x, p.z, x, z); if (!path) return B.walkStraight(x, z, tol);
    const pts = path.pts; let i = 0;
    while (i < pts.length && playing()) { let j = pts.length - 1; while (j > i && !clear(rig.position.x, rig.position.z, pts[j][0], pts[j][1])) j--; if (!B.walkStraight(pts[j][0], pts[j][1], 0.3, 3 + Math.hypot(pts[j][0] - rig.position.x, pts[j][1] - rig.position.z) / 3)) break; i = j + 1; }   // time for the leg's own length: the larder is a long walk
    if (B.walkStraight(x, z, tol, 3 + Math.hypot(x - rig.position.x, z - rig.position.z) / 3)) return true;
  }
  return Math.hypot(x - rig.position.x, z - rig.position.z) < tol + 0.5;
};
B.down = (h = 0) => { I.q.push({ t: 'down', h }); step(1); }; B.up = (h = 0) => { I.q.push({ t: 'up', h }); step(1); };
B.click = (h = 0) => { B.down(h); step(1); B.up(h); step(2); };
B.pull = (dy, frames = 12) => { for (let i = 0; i < frames; i++) { I.pullY += dy / frames; step(1); } };
B.packKey = () => { I.q.push({ t: 'pack' }); step(2); };
B.held = () => PL.hands[0].item || PL.hands[1].item;
// hand-over-hand up whatever grip is in front of us, then hop onto the ledge
B.climb = function () {
  calm(); const y0 = rig.position.y; let h = 0; PL.pitch = 0; step(1); B.down(h); if (!PL.hands[h].grip) return fail('climb: nothing to grip');
  for (let i = 0; i < 14 && playing(); i++) { calm(); B.pull(240); if (PL.mantleReady()) break; const nh = 1 - h; B.down(nh); if (!PL.hands[nh].grip) break; B.up(h); h = nh; }
  B.up(0); B.up(1); step(25); return rig.position.y > y0 + 1 ? true : fail('climb: did not reach the top (y=' + rig.position.y.toFixed(2) + ')');
};
B.climbDown = function (flap) {
  calm(); B.look(flap); B.down(0); if (!PL.hands[0].grip) { return fail('climbDown: no grip'); }
  for (let i = 0; i < 30 && rig.position.y > 0.9 && PL.hands[0].grip && playing(); i++) B.pull(-90, 4);
  B.up(0); B.up(1); step(45); return rig.position.y < 1 ? true : fail('climbDown: still up at y=' + rig.position.y.toFixed(2));
};
function pickItem(it) {
  if (rig.position.y < 1.0 && it.pos.y < 1.3) {   // approach from whichever side is open
    const Gd = P.grid, free = (x, z) => { const [ci, cj] = P.cellOf(x, z); return !Gd.g[cj * Gd.nx + ci]; }, sides = [[0, 0.75], [0.75, 0], [-0.75, 0], [0, -0.75], [0.55, 0.55], [-0.55, 0.55]];
    const sd = sides.find(([dx, dz]) => free(it.pos.x + dx, it.pos.z + dz)) || sides[0]; B.walkTo(it.pos.x + sd[0], it.pos.z + sd[1], 0.3);
  } let n = 0; while (n++ < 4 && it.state !== 'held' && it.state !== 'gone' && playing()) { step(10); B.look(it.pos); B.click(0); } return it.state === 'held' ? it : null; }
const st = () => W.st;
B.onToaster = function () { const t = st().toaster; if (Math.abs(rig.position.y - t.pos.y) < 0.2) return true; B.walkTo(t.base.x, t.base.z, 0.2); B.look(new V3(t.base.x + 0.6, PL.headW().y, t.base.z)); return B.climb(); };
B.offToaster = function () { const t = st().toaster; B.walkStraight(t.standTop.x, t.standTop.z, 0.15); return B.climbDown(new V3(t.standTop.x - 0.35, t.pos.y + 0.07, t.standTop.z)); };
B.onBox = function () { const b = st().boxTop; if (Math.abs(rig.position.y - b.y) < 0.2) return true; B.walkTo(b.base.x, b.base.z, 0.2); B.look(new V3(b.base.x, PL.headW().y, b.base.z - 0.6)); return B.climb(); };
B.offBox = function () { const b = st().boxTop; B.walkStraight(b.stand.x, b.stand.z, 0.15); return B.climbDown(new V3(b.stand.x, b.y + 0.07, b.stand.z + 0.25)); };
B.get = function (type) {
  if (B.held()) return fail('get: paws not empty');
  const loose = C.items.filter(i => i.type === type && i.state === 'free' && i.cook === 0 && !i.cut && i.pos.y < 1).sort((a, b) => a.pos.distanceTo(rig.position) - b.pos.distanceTo(rig.position))[0];
  if (loose && (type === 'pea' || loose.pos.distanceTo(rig.position) < 12)) return pickItem(loose) || fail('get: could not pick loose ' + type);
  if (type === 'egg') { const e = W.st.egg; if (!e) return fail('get: no egg here'); if (!waitFor(() => !!C.egg, 25)) return fail('get: no egg spawned'); B.walkTo(e.stand.x, e.stand.z, 0.25);
    for (let k = 0; k < 4 && C.egg && playing(); k++) { B.look(C.egg.pos); B.click(0); waitFor(() => !C.egg, 2.5); }
    if (C.egg) return fail('get: egg did not crack'); step(50); const d = C.items.filter(i => i.type === 'egg' && i.state === 'free' && i.cook === 0)[0]; return d ? (pickItem(d) || fail('get: could not pick egg drop')) : fail('get: no egg drops'); }
  const src = W.sources.find(s => s.type === type); if (!src) return fail('get: no source for ' + type);
  if (src.high) { if (!B.onBox()) return null; B.walkStraight(src.stand.x, src.stand.z, 0.2); } else B.walkTo(src.stand.x, src.stand.z, 0.25);
  if (!src.min) return fail('get: nothing loose for ' + type);
  B.look(new V3((src.min.x + src.max.x) / 2, (src.min.y + src.max.y) / 2, (src.min.z + src.max.z) / 2)); B.click(0);
  const it = B.held(); if (!it) return fail('get: source gave nothing for ' + type);
  if (src.high) { B.packKey(); if (!B.offBox()) return null; B.packKey(); }
  return B.held();
};
B.waitFor = waitFor;
function waitFor(fn, maxS) { let n = 0; while (!fn() && n < maxS * 60 && playing()) { step(1); if (!G.hiding) n++; } return fn(); }
// take whatever is sitting in the pan out of the way
function clearPan() { const p = st().pan, it = C.pan.item; if (!it) return; if (B.held()) return; B.walkTo(p.stand.x, p.stand.z, 0.3); pickItem(it); if (B.held() === it) { PL.yaw += 2.2; B.dropHeld(); } }
B.toastCycle = function (it) {
  const t = st().toaster; if (PL.pack.length >= PL.packMax) return fail('toast: pack full');
  B.packKey(); if (!B.onToaster()) return null; B.packKey(); if (!B.held()) return fail('toast: lost the crumb');
  waitFor(() => C.T.state === 'up', 12); B.look(new V3(t.standTop.x + 1.2, t.pos.y + 0.15, t.pos.z + 0.45)); B.click(0); step(20);
  if (it.state !== 'slot') return fail('toast: crumb not in slot (' + it.state + ')');
  B.walkStraight(t.leverStand.x, t.leverStand.z, 0.15); B.look(new V3(t.lever.min.x + 0.3, C.T.y, t.pos.z)); B.down(0);
  if (!PL.hands[0].grip) return fail('toast: could not grab the lever');
  waitFor(() => C.T.state === 'down', 4); B.up(0); step(40);
  if (!waitFor(() => it.state === 'free', 12)) return fail('toast: never popped');
  step(100); return pickItem(it) || fail('toast: could not pick popped crumb');
};
B.make = function (key) {
  const need = MC.COMPONENT[key]; let it;
  if (key === 'char') { it = B.make('toast'); if (!it) return null; return B.toastCycle(it); }
  it = B.get(need.src); if (!it) return null;
  if (need.st === 'toaster') { if (!C.noPower) return B.toastCycle(it); const p = st().pan; if (C.pan.item) { const keep = B.held(); if (keep) { B.packKey(); } clearPan(); if (keep) B.packKey(); } B.walkTo(p.stand.x, p.stand.z, 0.3); B.look(new V3(p.pos.x, p.pos.y + 0.25, p.pos.z)); B.click(0); step(20); if (it.state !== 'pan') return fail('pan-toast: not in pan'); if (!waitFor(() => it.cook >= 1, 14)) return fail('pan-toast: never cooked'); return pickItem(it) || fail('pan-toast: could not take it'); }
  if (need.st === 'blade') { const b = st().blade; B.walkTo(b.stand.x, b.stand.z, 0.3); B.look(b.pos); B.click(0); return it.cut ? it : fail('cut failed'); }
  if (need.st === 'pan') { const p = st().pan; if (C.pan.item) { const keep = B.held(); if (keep) { B.packKey(); } clearPan(); if (keep) B.packKey(); } B.walkTo(p.stand.x, p.stand.z, 0.3); B.look(new V3(p.pos.x, p.pos.y + 0.25, p.pos.z)); B.click(0); step(20); if (it.state !== 'pan') return fail('pan: not in pan (' + it.state + ')'); if (!waitFor(() => it.cook === 1, 14)) return fail('pan: never cooked'); return pickItem(it) || fail('pan: could not take it out'); }
  if (need.st === 'pot') { const p = st().pot; waitFor(() => C.pot.state === 'empty', 20); B.walkTo(p.stand.x, p.stand.z, 0.3); B.look(new V3(p.pos.x, p.pos.y + 0.3, p.pos.z)); B.click(0); step(20); if (C.pot.state === 'empty') return fail('pot: pea not accepted'); if (!waitFor(() => C.pot.state === 'done', 14)) return fail('pot: never done'); B.look(new V3(p.pos.x, p.pos.y - 0.2, p.pos.z)); B.click(0); return B.held() || fail('pot: could not ladle'); }
  return fail('make: unknown ' + key);
};
B.dropHeld = function () { for (let k = 0; k < 4; k++) { const h = PL.hands.find(x => x.item); if (!h) return; if (k) PL.yaw += 1.6; PL.pitch = -1.2; step(1); B.click(h.i); step(10); } };   // a station can refuse it: turn and try elsewhere
B.deliver = function (o, it) {
  const s = o.seat; B.walkTo(s.serve.x, s.serve.z, 0.3); waitFor(() => !G.hiding, 40);
  if (o.state !== 'wait') { B.dropHeld(); return false; }
  B.look(new V3(s.plate.x, s.plate.y + 0.25, s.plate.z)); B.click(PL.hands[0].item === it ? 0 : 1); step(20);
  return it.state === 'plated' || it.state === 'gone' ? true : fail('deliver: ' + C.name(it) + ' not plated (' + it.state + ')');
};
// play a whole night: serve orders first-come first-served
B.playNight = function (o = {}) {
  B.fails.length = 0; B.log.length = 0; let guard = 0;
  while (playing() && guard++ < 400) {
    if (o.stopAfter && G.served >= o.stopAfter) break;
    const ord = G.orders.filter(x => x.state === 'wait').sort((a, b) => a.pat / a.maxPat - b.pat / b.maxPat)[0];
    if (!ord) { step(30); continue; }
    const keys = G.remaining(ord); if (!keys.length) { step(10); continue; }
    const key = keys[0]; note('order ' + ord.R.name + ' / ' + ord.recipe + ' -> ' + key);
    if (B.held()) B.dropHeld();
    while (PL.pack.length && !B.held()) { B.packKey(); B.dropHeld(); }
    // reuse a finished component lying around
    let it = C.items.find(i => i.state === 'free' && C.key(i) === key && i.pos.y < 1.3); if (it) it = pickItem(it); else it = B.make(key);
    if (!it || !playing()) { step(20); continue; }
    if (ord.state !== 'wait') { B.dropHeld(); continue; }
    if (B.deliver(ord, it)) note('plated ' + key);
  }
  return { served: G.served, tips: G.tips, lost: G.lost, caught: G.caughtN, fails: B.fails.slice(), stars: G.result ? G.result.stars : G.stars(), time: G.time, mode: G.mode };
};
})();
