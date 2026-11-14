// the cart seen from THE MARKET: when this page runs inside the holodeck's shell, what the cook is doing (head, hands, what is held, the burners, the bowls, who sits where, what is said) goes to the shell four times a second, and from there to everyone in the section
import { G } from './ctx.js';
import { SEATS } from './cart.js';

export function buildLive() {
  if (window.parent === window) return { update() { } };
  const r2 = (v) => Math.round(v * 100) / 100, V = (p) => [r2(p.x), r2(p.y), r2(p.z)]; let t = 0, said = 0;
  const snap = () => { const g = G.game, C = G.cart, cam = G.camera.getWorldPosition(new G.debug.THREE.Vector3()), dir = G.camera.getWorldDirection(new G.debug.THREE.Vector3());
    const hands = (G.hands || []).filter((h) => h.active !== false).slice(0, 2).map((h) => [...V(h.pos), h.held ? String(h.held.name || h.held.kind).slice(0, 24) : '']);
    const cs = g.customers.map((c) => [c.seat, c.state === 'walk' || c.state === 'leaving' ? 0 : c.state === 'eating' ? 2 : 1, String((c.voice && c.voice.name) || (c.nb && c.nb.def.name) || '').slice(0, 20), r2(c.p.root.position.x), r2(c.p.root.position.z), c.maxPatience ? Math.round(100 * c.patience / c.maxPatience) : 100]);
    const bowls = G.items.filter((i) => i.kind === 'bowl' && !i.dead).slice(0, 8).map((b) => [...V(b.obj.position), b.dirty ? 3 : b.served ? 2 : b.empty ? 0 : 1]);
    const last = G.talk && G.talk.last, say = last && last.n !== said ? { who: String(last.who).slice(0, 24), text: String(last.line).slice(0, 180) } : null; if (say) said = last.n;
    return { o: g.state === 'open' || g.state === 'closing' ? 1 : 0, n: g.night, m: g.money + g.tips, sv: g.served, b: C.burners.map((q) => (q.on ? 1 : 0)), l: C.pots.map((p) => r2(p.level ?? 1)), h: [...V(cam), r2(Math.atan2(dir.x, dir.z))], hands, cs, bowls, say, seats: SEATS }; };
  return { update(dt) { if ((t += dt) < 0.25) return; t = 0; try { window.parent.postMessage({ yatai: snap() }, location.origin); } catch (e) { /* alone */ } } };
}
