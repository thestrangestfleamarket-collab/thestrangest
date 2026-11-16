// THE CART AS IT IS, FOR THE MARKET: every loose thing on the cart is told as its place and the meshes it is made of, each mesh named by a number worked from its own points, so THE MARKET's alley can draw the very same meshes (baked out of this page into data/yatai.json by tools/yatai-bake.cjs) where the cook has them
import * as THREE from 'three';
import { G } from './ctx.js';
import { Bowl, Food, Raw, Drink, toppingMesh, TOPPINGS, RAW } from './items.js';
import { Cash, KINDS } from './till.js';

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

  // ---- the bake (tools/yatai-bake.cjs calls it in this page): the cart standing still, joined by material, and one of every mesh a loose thing can be made of
  const b64 = (a) => { const u = new Uint8Array(a.buffer, a.byteOffset, a.byteLength); let s = ''; for (let i = 0; i < u.length; i += 0x8000) s += String.fromCharCode.apply(null, u.subarray(i, i + 0x8000)); return btoa(s); };
  mirror.bake = async (maxTex = 256) => { const tex = {}, lib = {}, mats = [], matIx = new Map(), chunks = new Map(); G.scene.updateMatrixWorld(true); rag();
    const pic = (t) => { const k = texKey(t); if (!k || tex[k]) return k; const im = t.image, w0 = im.width || im.videoWidth, h0 = im.height || im.videoHeight, f = Math.min(1, maxTex / Math.max(w0, h0)), c = document.createElement('canvas'); c.width = Math.max(1, Math.round(w0 * f)); c.height = Math.max(1, Math.round(h0 * f)); const g = c.getContext('2d');
      try { if (im.data) { const s = document.createElement('canvas'); s.width = w0; s.height = h0; const id = new ImageData(w0, h0); if (im.data.length === w0 * h0 * 4) id.data.set(im.data); else for (let i = 0; i < w0 * h0; i++) { id.data[i * 4] = id.data[i * 4 + 1] = id.data[i * 4 + 2] = im.data[i]; id.data[i * 4 + 3] = 255; } s.getContext('2d').putImageData(id, 0, 0); g.drawImage(s, 0, 0, c.width, c.height); } else g.drawImage(im, 0, 0, c.width, c.height);
        const a = g.getImageData(0, 0, c.width, c.height).data; let alpha = false; for (let i = 3; i < a.length; i += 4) if (a[i] < 250) { alpha = true; break; } tex[k] = { u: c.toDataURL(alpha ? 'image/webp' : 'image/jpeg', 0.82), r: [r3(t.repeat.x), r3(t.repeat.y)], w: t.wrapS === THREE.RepeatWrapping ? 1 : 0, y: t.flipY ? 1 : 0 }; } catch (e) { return ''; } return k; };
    const md = (m) => { const d = one(m); pic(m.map); return d; }, mi = (m) => { const d = md(m), k = JSON.stringify(d); if (!matIx.has(k)) { matIx.set(k, mats.length); mats.push(d); } return matIx.get(k); };
    // the still cart, in its own metres
    const isItem = (o) => { for (let q = o; q; q = q.parent) if (q === G.itemRoot || (q.userData && q.userData.item)) return true; return false; };
    const add = (o) => { const g = o.geometry, P = g.attributes.position, N = g.attributes.normal, U = g.attributes.uv, C = g.attributes.color, ix = g.index, nm = new THREE.Matrix3().getNormalMatrix(o.matrixWorld), flip = o.matrixWorld.determinant() < 0;
      const groups = Array.isArray(o.material) ? g.groups.map((q) => [o.material[q.materialIndex], q.start, q.count]) : [[o.material, 0, ix ? ix.count : P.count]];
      for (const [m, st, ct] of groups) { if (!m || m.visible === false) continue; const k = mi(m); let c = chunks.get(k); if (!c) chunks.set(k, c = { p: [], n: [], uv: [], c: [], i: [], at: new Map(), vc: !!m.vertexColors }); const end = Math.min(st + ct, ix ? ix.count : P.count);
        for (let a = st; a + 2 < end + 0; a += 3) for (const t of flip ? [0, 2, 1] : [0, 1, 2]) { const i = ix ? ix.getX(a + t) : a + t; _v.fromBufferAttribute(P, i).applyMatrix4(o.matrixWorld); if (N) _n.fromBufferAttribute(N, i).applyMatrix3(nm).normalize(); else _n.set(0, 1, 0); const u = U ? U.getX(i) : 0, w = U ? U.getY(i) : 0, col = c.vc ? [C ? C.getX(i) : 1, C ? C.getY(i) : 1, C ? C.getZ(i) : 1] : [];
          const key = [Math.round(_v.x * 2000), Math.round(_v.y * 2000), Math.round(_v.z * 2000), Math.round(_n.x * 127), Math.round(_n.y * 127), Math.round(_n.z * 127), Math.round(u * 4096), Math.round(w * 4096), ...col.map((q) => Math.round(q * 255))].join(); let j = c.at.get(key);
          if (j == null) { j = c.p.length / 3; c.at.set(key, j); c.p.push(_v.x, _v.y, _v.z); c.n.push(_n.x, _n.y, _n.z); c.uv.push(u, w); if (c.vc) c.c.push(...col); } c.i.push(j); } } };
    const walk = (o) => { if (!o.visible || isItem(o) || o.userData.nobake) return; if (drawn(o)) add(o); for (const c of o.children) walk(c); }; walk(G.cart.group);
    const box = new THREE.Box3(); const cart = [...chunks].map(([k, c]) => { const p = new Float32Array(c.p); for (let i = 0; i < p.length; i += 3) box.expandByPoint(_v.set(p[i], p[i + 1], p[i + 2])); return { m: k, p: b64(new Int16Array(c.p.map((v) => Math.round(v * 2000)))), n: b64(new Int8Array(c.n.map((v) => Math.round(v * 127)))), uv: b64(new Float32Array(c.uv)), i: b64(c.p.length / 3 < 65536 ? new Uint16Array(c.i) : new Uint32Array(c.i)), ...(c.p.length / 3 < 65536 ? {} : { w: 1 }), ...(c.vc ? { c: b64(new Uint8Array(c.c.map((v) => Math.round(v * 255)))) } : {}) }; });
    // one of every mesh: what is out now, and one of each thing that can be taken, with what it hides until it is filled
    const keep = (g) => { const k = geoKey(g); if (!k || lib[k]) return; const P = g.attributes.position, N = g.attributes.normal, U = g.attributes.uv, C = g.attributes.color, ix = g.index, p = new Float32Array(P.count * 3), n = new Int8Array(P.count * 3), uv = new Float32Array(P.count * 2);
      for (let i = 0; i < P.count; i++) { p[i * 3] = P.getX(i); p[i * 3 + 1] = P.getY(i); p[i * 3 + 2] = P.getZ(i); if (N) { n[i * 3] = Math.round(N.getX(i) * 127); n[i * 3 + 1] = Math.round(N.getY(i) * 127); n[i * 3 + 2] = Math.round(N.getZ(i) * 127); } else n[i * 3 + 1] = 127; if (U) { uv[i * 2] = U.getX(i); uv[i * 2 + 1] = U.getY(i); } }
      const e = { p: b64(p), n: b64(n), uv: b64(uv) }; if (ix) { const a = new Uint16Array(ix.count); for (let i = 0; i < ix.count; i++) a[i] = ix.getX(i); if (P.count < 65536) e.i = b64(a); } if (C) { const c = new Uint8Array(P.count * 3); for (let i = 0; i < P.count; i++) { c[i * 3] = C.getX(i) * 255; c[i * 3 + 1] = C.getY(i) * 255; c[i * 3 + 2] = C.getZ(i) * 255; } e.c = b64(c); } if (g.groups.length) e.g = g.groups.map((q) => [q.start, q.count, q.materialIndex]); lib[k] = e; };
    const all = (o) => o.traverse((q) => { if (q.isMesh && !q.isSkinnedMesh && q.geometry && q.geometry.attributes.position) { keep(q.geometry); for (const m of Array.isArray(q.material) ? q.material : [q.material]) if (m && m.map) pic(m.map); } });
    const made = []; for (const k in TOPPINGS) { made.push(new Food(k)); all(toppingMesh(k)); } made.push(new Food('noodle')); for (const k in RAW) made.push(new Raw(k)); for (const d of ['beer', 'cola', 'sake', 'tea', 'water']) { try { made.push(new Drink(d)); } catch (e) { /* not a drink here */ } } made.push(new Bowl()); for (const k of KINDS) made.push(new Cash(k));
    all(G.itemRoot); for (const it of G.items) all(it.obj); for (const h of G.hands || []) if (h.arm) for (const k in h.arm) all(h.arm[k]); for (const it of made) it.remove();
    // the hands, open and closed, as they stand skinned
    const hand = G.hands && G.hands.find((h) => h.models); if (hand) for (const side in hand.models) { const H = hand.models[side]; for (let t = 0; t < 200 && !H.rig; t++) await new Promise((r) => setTimeout(r, 50)); if (!H.rig) continue;
      for (const grip of [0, 1]) { H.cur = grip ? [0.6, 0.85, 0.9, 0.9, 0.9] : [0.15, 0.1, 0.1, 0.1, 0.1]; H.apply(); H.root.updateWorldMatrix(true, true); const inv = new THREE.Matrix4().copy(H.root.matrixWorld).invert();
        H.root.traverse((o) => { if (!o.isSkinnedMesh) return; o.skeleton.update(); const P = o.geometry.attributes.position, g = new THREE.BufferGeometry(), a = new Float32Array(P.count * 3); for (let i = 0; i < P.count; i++) { o.getVertexPosition(i, _v).applyMatrix4(o.matrixWorld).applyMatrix4(inv); a[i * 3] = _v.x; a[i * 3 + 1] = _v.y; a[i * 3 + 2] = _v.z; }
          g.setAttribute('position', new THREE.BufferAttribute(a, 3)); if (o.geometry.index) g.setIndex(o.geometry.index.clone()); g.computeVertexNormals(); g.userData.mk = 'hand' + side + grip; keep(g); }); } H.cur = [0.15, 0.1, 0.1, 0.1, 0.1]; H.apply(); }
    return { v: 1, box: [r3(box.min.x), r3(box.min.y), r3(box.min.z), r3(box.max.x), r3(box.max.y), r3(box.max.z)], mats, cart, lib, tex }; };
  return mirror;
}
