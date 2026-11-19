// THE MARKET's own people at the corner (the octopus busker, the mushroom seller, the badger from THE BAR, the vegetable seller, THE BIG CAT): each the market's own body, made and posed by the market itself (tools/ramen-folk.cjs, data/sushi/folk.json) and drawn as a visiting tenant's figure is (tenant.js): standing, walking, sitting at a stool, and for the octopus playing his guitar; what they wear apart from the body (a skull, hair, the guitar) rides its bone
import * as THREE from 'three';
import { G } from './ctx.js';
import { tenantFigure } from './tenant.js';
import { PEOPLE } from './pf.js';

let D = { folk: {} };
export async function loadFolk(base = '/sushi-assets/') { try { const r = await fetch(base + 'folk.json'); if (r.ok) D = await r.json(); } catch (e) { console.warn('the market\'s people did not come', e); } return D; }
export const hasFolk = (k) => !!(D.folk && D.folk[k] && D.folk[k].fig);
export const folkSong = () => D.song || null;
const figs = {};
export function makeFolk(key, seed = 0) {
  const F = D.folk[key], fig = (figs[key] ||= (() => { const f = JSON.parse(F.fig.D); if (F.x && F.x.length) f.x = F.x; return f; })()), av = tenantFigure(fig, 1), C = F.clips, n12 = fig.np * 12, tall = (F.height || 1.7);
  const lerp = (A, B, x) => { const o = new Array(n12); for (let i = 0; i < n12; i++) o[i] = A[i] + (B[i] - A[i]) * x; return o; }, loop = (L, f) => { const n = L.length, a = Math.floor(f) % n; return lerp(L[a], L[(a + 1) % n], f - Math.floor(f)); };
  // back and forth through what was read off him playing, so it never jumps
  const pong = (L, f) => { const n = L.length, k = f % (2 * n - 2), a = k < n - 1 ? k : 2 * n - 2 - k, i = Math.min(n - 2, Math.floor(a)); return [lerp(L[i], L[i + 1], a - i), i, a - i]; };
  const head = new THREE.Vector3(), P = {
    root: av.root, folk: key, style: 'm:' + key, sex: 'm', pose: 'stand', speed: 1.2, look: null, talkT: 0, waveT: 0, eyeY: tall * 0.88, ph: (seed * 0.37) % 1, t: (seed % 7), tall, market: true,
    update(dt) { const how = this.pose === 'eat' ? 'sit' : this.pose; let m, held = null, gi = -1, gx = 0;
      if (how === 'walk') { this.ph = (this.ph + dt * this.speed * 0.62) % 1; m = loop(C.walk, this.ph * C.walk.length); }
      else if (how === 'play' && F.play) { this.t += dt * 8; [m, gi, gx] = pong(F.play, this.t); }
      else m = how === 'sit' ? C.sit : C.stand;
      if (F.x && F.x.length) held = F.x.map((x) => (x.bone >= 0 ? m.slice(x.bone * 12, x.bone * 12 + 12) : gi >= 0 && F.gx && F.gx[gi + 1] ? F.gx[gi].map((v, k) => v + (F.gx[gi + 1][k] - v) * gx) : null));
      av.pose(m, held); av.update(dt); },
    headAt(out = head) { return out.set(this.root.position.x, this.root.position.y + (this.pose === 'sit' || this.pose === 'eat' ? Math.min(tall * 0.75, 1.45) : tall * 0.9), this.root.position.z); },
    gesture() { }, reeling: () => false, down: () => false, duck() { }, stain() { }, dispose() { av.dispose(); },
  };
  PEOPLE.push(P); P.update(0); return P;
}
