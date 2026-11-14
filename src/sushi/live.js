// the cart and THE MARKET, live both ways: when this page runs inside the holodeck's shell, what the cook is doing (head, hands, what is held, the burners, the bowls, who sits where, what is said) goes to the shell four times a second and from there to everyone in the section; and whoever in the market is standing by its cart is seen standing in the alley
import * as THREE from 'three';
import { G } from './ctx.js';
import { SEATS } from './cart.js';
import { makePerson } from './avatars.js';
import * as T from './tex.js';

const TILE = 1.13, K = 2.6 / 2.4; // the market's tile, and its cart's tiles to this cart's metre (146bg-yatai.js)
export function buildLive() {
  const live = { watchers: new Map(), last: null }; G.live = live;
  if (window.parent === window && !new URLSearchParams(location.search).has('live')) { live.update = () => { }; return live; }
  const r2 = (v) => Math.round(v * 100) / 100, V = (p) => [r2(p.x), r2(p.y), r2(p.z)], _a = new THREE.Vector3(), _b = new THREE.Vector3(); let t = 0, said = 0;
  const snap = () => { const g = G.game, C = G.cart, cam = G.camera.getWorldPosition(_a), dir = G.camera.getWorldDirection(_b);
    const hands = (G.hands || []).filter((h) => h.active !== false).slice(0, 2).map((h) => [...V(h.pos), h.held ? String(h.held.name || h.held.kind).slice(0, 24) : '']);
    const cs = g.customers.map((c) => [c.seat, c.state === 'walk' || c.state === 'leaving' ? 0 : c.state === 'eating' ? 2 : 1, String((c.voice && c.voice.name) || (c.nb && c.nb.def.name) || '').slice(0, 20), r2(c.p.root.position.x), r2(c.p.root.position.z), c.maxPatience ? Math.round(100 * c.patience / c.maxPatience) : 100]);
    const bowls = G.items.filter((i) => i.kind === 'bowl' && !i.dead).slice(0, 8).map((b) => [...V(b.obj.position), b.dirty ? 3 : b.served ? 2 : b.empty ? 0 : 1]);
    const last = G.talk && G.talk.last, say = last && last.n !== said ? { who: String(last.who).slice(0, 24), text: String(last.line).slice(0, 180) } : null; if (say) said = last.n;
    return { o: g.state === 'open' || g.state === 'closing' ? 1 : 0, n: g.night, m: g.money + g.tips, sv: g.served, b: C.burners.map((q) => (q.on ? 1 : 0)), l: C.pots.map((p) => r2(p.level ?? 1)), h: [...V(cam), r2(Math.atan2(dir.x, dir.z))], hands, cs, bowls, say, seats: SEATS }; };
  // the market's people by the cart: each a figure standing in the alley where they stand there, with their name over them
  const tag = (name) => { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: T.labelTex([String(name || 'TENANT').toUpperCase().slice(0, 18)], { w: 512, h: 96, fs: 56, bg: 'rgba(8,10,14,0.75)', fg: '#7dffa4' }), depthWrite: false })); s.scale.set(0.8, 0.15, 1); s.position.y = 2.0; s.userData.nopick = true; return s; };
  live.market = (m) => { if (!m || !Array.isArray(m.me) || !Array.isArray(m.others)) return; const seen = new Set();
    for (const o of m.others.slice(0, 6)) { if (!Array.isArray(o) || (o[4] && m.me[4] && o[4] !== m.me[4])) continue; let x = -(o[3] - m.me[1]) / (TILE * K), z = (o[2] - m.me[0]) / (TILE * K) + 0.33; if (Math.abs(x) > 11 || z < -4.6 || z > 1.4) continue; if (Math.abs(x) < 1.7 && z > -2.0) z = -2.1; // nobody stands inside the cart
      const id = String(o[0]); seen.add(id); let w = live.watchers.get(id); if (!w) { const p = makePerson((Math.random() * 1e6) | 0, 'Male_Adult_08'); p.pose = 'stand'; p.root.traverse((q) => { q.userData.nopick = true; }); p.root.add(tag(o[1])); p.root.position.set(x, 0, z); (G.peopleRoot || G.scene).add(p.root); w = { p, to: new THREE.Vector3(x, 0, z), name: o[1] }; live.watchers.set(id, w); } w.to.set(x, 0, z); }
    for (const [id, w] of live.watchers) if (!seen.has(id)) { w.p.root.removeFromParent(); live.watchers.delete(id); } };
  addEventListener('message', (e) => { if (e.origin === location.origin && e.data && e.data.market) live.market(e.data.market); });
  live.update = (dt) => {
    for (const w of live.watchers.values()) { const pos = w.p.root.position, d = pos.distanceTo(w.to); if (d > 0.08) { _a.copy(w.to).sub(pos).multiplyScalar(Math.min(d, 1.4 * dt) / d); pos.add(_a); w.p.root.rotation.y = Math.atan2(_a.x, _a.z); w.p.pose = 'walk'; } else { w.p.pose = 'stand'; w.p.root.rotation.y = Math.atan2(-pos.x, -0.6 - pos.z); } w.p.look = G.camera.getWorldPosition(_b); w.p.update(dt, G.t); }
    if ((t += dt) < 0.25) return; t = 0; live.last = snap(); try { window.parent.postMessage({ yatai: live.last }, location.origin); } catch (e) { /* alone */ } };
  return live;
}
