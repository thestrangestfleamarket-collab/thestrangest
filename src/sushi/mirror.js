// THE CART AS IT IS, FOR WHOEVER ELSE IS IN THE ALLEY: every loose thing on the cart is told as its place and the meshes it is made of, each mesh named by a number worked from its own points, so a guest's page and another cook's (live.js) draw the very same meshes where the cook has them
import * as THREE from 'three';
import { G } from './ctx.js';

const _v = new THREE.Vector3(), _q = new THREE.Quaternion(), _s = new THREE.Vector3(), _m = new THREE.Matrix4(), _i = new THREE.Matrix4(), _n = new THREE.Vector3();
const r3 = (v) => Math.round(v * 1000) / 1000, r4 = (v) => Math.round(v * 1e4) / 1e4;
export const geoKey = (g) => g.userData.mk || (g.userData.mk = (() => { const p = g.attributes.position; if (!p) return ''; let h = (2166136261 ^ p.count) >>> 0; const st = Math.max(1, Math.floor(p.count / 200));
  for (let i = 0; i < p.count; i += st) for (const v of [p.getX(i), p.getY(i), p.getZ(i)]) { h ^= Math.round(v * 5000) & 0xffff; h = Math.imul(h, 16777619) >>> 0; } return h.toString(36); })());
const tc = document.createElement('canvas'); tc.width = tc.height = 8; const tg = tc.getContext('2d', { willReadFrequently: true });
export const texKey = (t) => { if (!t || !t.image) return ''; if (t.userData.mk != null) return t.userData.mk; const im = t.image; let d = null;
  try { if (im.data) { d = []; const n = im.data.length, st = Math.max(1, Math.floor(n / 256)); for (let i = 0; i < n; i += st) d.push(im.data[i]); } else { if (im.complete === false || !(im.width || im.videoWidth)) return ''; tg.clearRect(0, 0, 8, 8); tg.drawImage(im, 0, 0, 8, 8); d = tg.getImageData(0, 0, 8, 8).data; } } catch (e) { return t.userData.mk = ''; }
  let h = 2166136261; for (let i = 0; i < d.length; i++) { h ^= d[i] >> 5; h = Math.imul(h, 16777619) >>> 0; } return t.userData.mk = h.toString(36); };
// a material in a few numbers: colour, picture, 1 unlit + 2 see-through + 4 both sides + 8 its points' own colours, how solid, its own glow
const one = (m) => { const f = (m.isMeshBasicMaterial ? 1 : 0) | (m.transparent ? 2 : 0) | (m.side === THREE.DoubleSide ? 4 : 0) | (m.vertexColors ? 8 : 0), e = m.emissive && m.emissiveIntensity > 0.2 ? m.emissive.getHex() : 0;
  const a = [m.color ? m.color.getHex() : 0xffffff, texKey(m.map), f]; if (m.transparent || e) a.push(r3(m.opacity ?? 1)); if (e) a.push(e); return a; };
export const matDesc = (m) => (Array.isArray(m) ? m.map(one) : one(m));
const drawn = (o) => o.isMesh && !o.isSkinnedMesh && o.geometry && o.geometry.attributes.position && o.material && !(o.material.visible === false);
// what a thing is made of, seen from its own root
const parts = (root) => { const out = []; _i.copy(root.matrixWorld).invert();
  const walk = (o) => { if (!o.visible) return; if (drawn(o)) { _m.multiplyMatrices(_i, o.matrixWorld).decompose(_v, _q, _s); const g = o.geometry, k = geoKey(g), p = [k, matDesc(o.material), [r4(_v.x), r4(_v.y), r4(_v.z), r3(_q.x), r3(_q.y), r3(_q.z), r3(_q.w), r3(_s.x), r3(_s.y), r3(_s.z)]];
      if (g.attributes.position.count <= 24) { if (!g.boundingBox) g.computeBoundingBox(); const b = g.boundingBox; p.push([r4(b.max.x - b.min.x), r4(b.max.y - b.min.y), r4(b.max.z - b.min.z)]); } out.push(p); }
    for (const c of o.children) walk(c); }; walk(root); return out; };
const place = (o) => { o.matrixWorld.decompose(_v, _q, _s); return [r3(_v.x), r3(_v.y), r3(_v.z), r3(_q.x), r3(_q.y), r3(_q.z), r3(_q.w), r3(_s.x), r3(_s.y), r3(_s.z)]; };

export function buildMirror() {
  const mirror = {}; G.mirror = mirror; let seq = 0, turn = 0; const sent = new Map();
  // everything to tell: [id, its root] (the cook's own body, head and arms go as the market's headset body does: live.js)
  const rag = () => { for (const it of G.items) if (it.kind === 'rag') it.obj.traverse((o) => { if (o.geometry && !o.geometry.userData.mk) o.geometry.userData.mk = 'rag'; }); };   // the cloth moves point by point: it is one mesh by name
  const things = () => { const L = []; rag();
    for (const it of G.items) if (!it.dead && it.obj && it.obj.parent) L.push([it.mid || (it.mid = (++seq).toString(36)), it.obj]);
    return L; };
  // one message of at most about 9 KB: who exists, where each thing that moved is, and the looks that changed (the rest in turn, so a newcomer has it all in a few seconds)
  mirror.frame = () => { const L = things(), ids = L.map((t) => t[0]), s = [], l = []; let size = ids.length * 5, n = 0; for (const id of [...sent.keys()]) if (!ids.includes(id)) sent.delete(id);
    const N = L.length; turn = N ? (turn + 3) % N : 0;
    for (let j = 0; j < N; j++) { const [id, o, look] = L[j], w = sent.get(id) || {}, due = (j - turn + N) % N < 3; sent.set(id, w);
      const p = JSON.stringify(place(o)); if ((p !== w.p || due) && size < 9000) { w.p = p; s.push('[' + JSON.stringify(id) + ',' + p.slice(1)); size += p.length + 8; }
      const k = JSON.stringify(look || parts(o)); if ((k !== w.k || (due && n < 2)) && size + k.length < 9000) { w.k = k; l.push('[' + JSON.stringify(id) + ',' + k + ']'); size += k.length + 8; n++; } }
    return JSON.parse('{"ids":' + JSON.stringify(ids) + ',"s":[' + s.join(',') + '],"l":[' + l.join(',') + ']}'); };

  return mirror;
}
