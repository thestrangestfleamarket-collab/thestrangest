// THE ALLEY'S PEOPLE, THE SAME ON EVERY PAGE: one page in the alley is its world's authority (a cook working the first cart, else the first guest in); it runs the passers-by and the beat cop and tells where each is and what they do ten times a second; every cook tells their own customers; every other page draws those same people there, eased between words
import * as THREE from 'three';
import { G } from './ctx.js';
import { makePerson } from './avatars.js';

const POSES = ['stand', 'walk', 'sit', 'eat'], GEST = ['', 'wave', 'nod', 'no', 'laugh', 'shrug', 'think'];
const r2 = (v) => Math.round(v * 100) / 100;
// a page's place in line for the authority: a cook before any guest, the first cart first; then whoever came first
const better = (a, b) => { for (let i = 0; i < 3; i++) { if (a[i] < b[i]) return true; if (a[i] > b[i]) return false; } return false; };

export function buildShare(live) {
  const S = { lead: true, by: '', lanes: new Map(), drawn: new Map(), since: Date.now(), sent: 0, t: 0, seq: 0 }; live.share = S;
  const B = G.block;
  // what a person is doing, in a few numbers: where, which way, how (stand, walk, sit, eat, knocked down), their last gesture and whether their hands are talking
  const watch = (p) => { if (p._gw || !p.gesture) return; p._gw = 1; const g0 = p.gesture.bind(p); p._gs = 0; p.gesture = (n) => { p._gs++; p._gn = n; g0(n); }; };
  const code = (p) => { if ((p.waveT || 0) > (p._wl || 0) + 0.05 && p._gn !== 'wave') { p._gs = (p._gs || 0) + 1; p._gn = 'wave'; } p._wl = p.waveT || 0; if (p.waveT <= 0 && p._gn === 'wave') p._gn = ''; return ((p._gs || 0) % 1000) * 8 + Math.max(0, GEST.indexOf(p._gn || '')); };
  const pose = (p) => (p.down && p.down() ? 4 : Math.max(0, POSES.indexOf(p.pose)));
  const look = (p) => (p.look ? [r2(p.look.x), r2(p.look.y), r2(p.look.z)] : 0);
  const say = (p) => [r2(p.root.position.x), r2(p.root.position.z), r2(p.root.rotation.y), pose(p), code(p), p.talkT > 0 ? 1 : 0, look(p)];
  if (B) for (const h of B.people) watch(h.p);
  const mine = () => { const cs = []; for (const c of G.game.customers) { if (c.guest || !c.p || !c.p.root.parent) continue; watch(c.p); const k = c.nb ? 'b' + c.nb.n : (c._sk ||= 'c' + (++S.seq).toString(36)); cs.push([k, String(c.p.style || ''), ...say(c.p), c.seat]); } return cs; };
  const out = () => { const w = { r: S.rank, sx: live.sx, t: r2(G.t) }; if (S.lead && B) w.p = B.people.filter((h) => !h.taken && !h.hidden && h.p.root.visible).map((h) => [h.n, ...say(h.p)]); if (live.slot >= 0 && !G.guest) w.c = mine(); return w; };

  // the rest of the line: the cooks the section knows (their cart's slot, since when) and the guests (since when), each heard within a few seconds
  S.rankOf = () => (live.slot >= 0 && !G.guest ? [0, live.slot, live.ks || 0] : [1, S.since, live.me || '~']);
  S.decide = () => { S.rank = S.rankOf(); let lead = true, by = ''; const now = Date.now();
    for (const [id, L] of S.lanes) { if (now - L.at > 3000) { S.lanes.delete(id); continue; } if (L.w.r && Array.isArray(L.w.r) && better(L.w.r, S.rank)) { if (lead || better(L.w.r, S.lanes.get(by).w.r)) { lead = false; by = id; } } }
    for (const p of live.peers || []) if (better(p.r, S.rank)) lead = false;   // (someone ahead of us, whose word has not come yet: wait for it)
    if (lead !== S.lead) { S.lead = lead; if (lead) for (const h of B ? B.people : []) { h.t = Math.min(h.t || 0, 3); h.path = null; h.step = 'stand'; } }   // (taking over: each goes on with the night from where they stand)
    S.by = by; };
  S.take = (from, w) => { if (!from || !w || typeof w !== 'object') return; S.lanes.set(String(from), { w, at: Date.now() }); };

  // the passers-by, when another page runs them: moved where its word says; the cart does not take them for customers (its own come from the street)
  if (B) { const run = B.update, take = B.take; B.update = (dt, t) => (S.lead || !S.lanes.get(S.by) ? run(dt, t) : follow(dt, t)); B.take = (w) => (S.lead ? take(w) : null); }
  const _v = new THREE.Vector3(), _l = new THREE.Vector3();
  const steer = (p, d, e, dt, t, dx, st) => { const x = (+e[0] || 0) + dx, z = +e[1] || 0, now = G.t;   // (st: the sender's own clock, for how fast they go; eased ahead by as long as their word has been here)
    if (!d.to) { d.to = new THREE.Vector3(x, 0, z); d.v = new THREE.Vector3(); d.at = now; d.st = st; p.root.position.set(x, 0, z); p.root.rotation.y = +e[2] || 0; }
    else if (st !== d.st) { const gap = st - d.st; if (gap > 0.02 && gap < 2) { d.v.set((x - d.to.x) / gap, 0, (z - d.to.z) / gap); if (d.v.length() > 4) d.v.set(0, 0, 0); } else d.v.set(0, 0, 0); d.to.set(x, 0, z); d.at = now; d.st = st; }
    const ahead = Math.min(0.2, now - d.at), k = Math.min(1, dt * 10); _v.copy(d.to).addScaledVector(d.v, ahead); if (p.root.position.distanceTo(_v) > 3) p.root.position.copy(_v); else p.root.position.lerp(_v, k);
    const ry = +e[2] || 0; p.root.rotation.y += Math.atan2(Math.sin(ry - p.root.rotation.y), Math.cos(ry - p.root.rotation.y)) * Math.min(1, dt * 8);
    const ps = e[3] | 0; if (ps === 4) { if (p.hit && !p.down()) { _v.set(Math.sin(ry), 0, Math.cos(ry)).negate(); p.hit(_v, _l.copy(p.root.position).setY(1.5), 1); } } else { p.pose = POSES[ps] || 'stand'; if (p.pose === 'walk') p.speed = Math.max(0.6, Math.min(2.6, d.v.length() || 1.2)); }
    const g = e[4] | 0; if (d.g == null) d.g = g; else if (g !== d.g) { d.g = g; const n = GEST[g & 7]; if (n && p.gesture) p.gesture(n); }
    if (e[5]) p.talkT = Math.max(p.talkT || 0, 0.3);
    p.look = Array.isArray(e[6]) ? (d.lk ||= new THREE.Vector3()).set((+e[6][0] || 0) + dx, +e[6][1] || 0, +e[6][2] || 0) : null;
    p.update(dt, t); };
  const follow = (dt, t) => { const L = S.lanes.get(S.by), w = L.w, dx = (+w.sx || 0) - live.sx, at = new Map();
    for (const e of Array.isArray(w.p) ? w.p : []) if (Array.isArray(e)) at.set(e[0] | 0, e.slice(1));
    for (const c of Array.isArray(w.c) ? w.c : []) if (Array.isArray(c) && /^b\d+$/.test(String(c[0]))) at.set(+String(c[0]).slice(1), c.slice(2));   // (one of them sitting at the cart over there)
    for (const h of B.people) { const e = at.get(h.n), p = h.p, d = h.sh || (h.sh = {}); if (h.taken) continue; if (!e) { h.hidden = true; p.root.visible = false; d.to = null; continue; } h.hidden = false; p.root.visible = true; steer(p, d, e, dt, t, dx, +w.t || 0); } };   // (one already at this page's own cart stays its customer)

  // other cooks' customers (and, on a guest's page, every cook's): the very people they serve, where they are at that cart
  const draw = (dt, t) => { const seen = new Set();
    for (const [id, L] of S.lanes) { const w = L.w; if (!Array.isArray(w.c) || (w.r && w.r[0] !== 0)) continue; const dx = (+w.sx || 0) - live.sx;
      for (const c of w.c) { if (!Array.isArray(c) || /^b\d+$/.test(String(c[0])) && id === S.by && B) continue; const k = id + '/' + c[0]; seen.add(k); let d = S.drawn.get(k);
        if (!d) { const p = makePerson(1, String(c[1] || '') || undefined); p.root.traverse((o) => { o.userData.nopick = true; if (o.isMesh) o.castShadow = true; }); (G.peopleRoot || G.scene).add(p.root); d = { p }; S.drawn.set(k, d); }
        steer(d.p, d, c.slice(2), dt, t, dx, +w.t || 0); } }
    for (const [k, d] of S.drawn) if (!seen.has(k)) { d.p.root.removeFromParent(); S.drawn.delete(k); } };

  // what is there to compare, for the checks: every person drawn here, by who they are, where they stand
  S.list = () => { const o = {}; if (B) for (const h of B.people) if (h.p.root.visible && !h.hidden) o['b' + h.n] = [r2(h.p.root.position.x), r2(h.p.root.position.z), h.p.pose];
    for (const c of G.game.customers) if (!c.guest && c.p.root.parent) o[c.nb ? 'b' + c.nb.n : c._sk || 'c?'] = [r2(c.p.root.position.x), r2(c.p.root.position.z), c.p.pose];
    for (const [k, d] of S.drawn) o[k.split('/').pop()] = [r2(d.p.root.position.x), r2(d.p.root.position.z), d.p.pose]; return o; };
  S.update = (dt) => { S.decide(); draw(dt, G.t); if ((S.t += dt) < 0.1) return; S.t = 0; if (!live.seen()) return; const w = out(); if (w.p || w.c) live.send({ t: 'yt', d: { w } }); };
  return S;
}
