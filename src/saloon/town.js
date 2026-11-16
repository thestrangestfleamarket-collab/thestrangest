// Perdition outside THE LAST CHANCE: the main street at true scale (the saloon's own front, ten more buildings with false fronts, porches, boardwalks and real recessed windows), its wagons, horses and lamps, the desert round it (ground, ruts, scrub, rock, mesas), the sky, the moon and its light, the night's air, and where you may walk; all laid out in the street's own frame (x along the street, z into the saloon) and turned onto the saloon's front in one place (FRAME)
import * as THREE from 'three';
import { G, BOUNDS, clamp } from '../sushi/ctx.js';
import { R } from './room.js';
import { BASE, pbr, model } from './kit.js';

// the street's frame: its origin is the saloon's doorway on the front wall, +z runs into the saloon, +x along the street
const FRAME = R.E != null ? { x: R.E, z: R.door.z, ry: -Math.PI / 2, half: (R.L + R.B) / 2, deep: R.E + R.W, win: [-2.25, 2.25], winW: 2.3 } : { x: 0, z: -R.L, ry: 0, half: R.W, deep: R.L + R.B, win: [-4.4, 4.4], winW: 2.4 };
const ST = { walk: 2.6, wide: 18, low: -0.3, far: 60 }, SZ = -ST.walk - ST.wide - ST.walk;   // the boardwalks' depth, the street's width, its level under the boardwalks, how far you may go; the far row's fronts
const MOON = new THREE.Vector3(-0.42, 0.5, -0.76).normalize();   // toward the moon, in the street's frame
const rnd = (() => { let s = 4711; return () => ((s = (s * 16807) % 2147483647) / 2147483647); })(), rr = (a, b) => a + rnd() * (b - a);
const sm = (a, b, v) => { const t = clamp((v - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };
const TOWN = { x0: -50, x1: 46, z0: -44, z1: 26 };

// the ground's height anywhere (the street's frame): flat under the town, low swells beyond it, higher toward the horizon
function land(x, z) {
  const dx = Math.max(TOWN.x0 - x, 0, x - TOWN.x1), dz = Math.max(TOWN.z0 - z, 0, z - TOWN.z1), d = Math.hypot(dx, dz), w = sm(0, 45, d);
  return ST.low + w * (0.9 * Math.sin(x * 0.031 + 1.3) * Math.cos(z * 0.027 + 0.4) + 0.45 * Math.sin(x * 0.083 + z * 0.057) + 0.12 * Math.sin(x * 0.31) * Math.sin(z * 0.27)) + sm(120, 600, d) * (5 + 4 * Math.sin(x * 0.006 + 2) * Math.cos(z * 0.007));
}

// ---- what the outside is made of: the photographed surfaces, greyed, lit by the moon and the street's few lamps only (no room lamps, no room reflections), thinned by the night's air
const HZ = { c: { value: new THREE.Color(0.024, 0.034, 0.06) }, k: { value: new THREE.Vector2(0.0009, 1.2) }, amb: { value: new THREE.Color(0.12, 0.15, 0.22) } };
const LB = THREE.ShaderChunk.lights_fragment_begin.replace(/NUM_SPOT_LIGHTS/g, '0').replace(/NUM_HEMI_LIGHTS/g, '0');
function out(m, sat = 0.55) {
  m.fog = false; m.envMapIntensity = 0; m.vertexColors = true; m.metalness = Math.min(m.metalness, 0.2); if (m.roughness < 0.85) m.roughness = 0.9;
  m.onBeforeCompile = (s) => { s.uniforms.uHzC = HZ.c; s.uniforms.uHzK = HZ.k; s.uniforms.uAmb = HZ.amb;
    s.vertexShader = s.vertexShader.replace('#include <common>', '#include <common>\nvarying float vHY;').replace('#include <project_vertex>', '#include <project_vertex>\n{ vec4 hw = vec4( transformed, 1.0 );\n#ifdef USE_INSTANCING\nhw = instanceMatrix * hw;\n#endif\nvHY = ( modelMatrix * hw ).y; }');
    s.fragmentShader = s.fragmentShader.replace('#include <common>', '#include <common>\nvarying float vHY; uniform vec3 uHzC; uniform vec3 uAmb; uniform vec2 uHzK;')
      .replace('#include <map_fragment>', `#include <map_fragment>\ndiffuseColor.rgb = mix( vec3( dot( diffuseColor.rgb, vec3( 0.3, 0.59, 0.11 ) ) ), diffuseColor.rgb, ${sat.toFixed(2)} );`)
      .replace('#include <lights_fragment_begin>', LB + '\n#if defined( RE_IndirectDiffuse )\nirradiance += uAmb;\n#endif')
      .replace('#include <lights_fragment_maps>', '')
      .replace('#include <opaque_fragment>', 'outgoingLight = mix( outgoingLight, uHzC, 1.0 - exp( - length( vViewPosition ) * uHzK.x * ( 1.0 + uHzK.y * exp( - max( vHY, 0.0 ) * 0.05 ) ) ) );\n#include <opaque_fragment>'); };
  m.customProgramCacheKey = () => 'perdition' + sat; return m;
}
const surf = (name, tile, o = {}) => { const m = out(pbr(name, { tile, town: 1, ...o }), o.sat); m.userData.tile = tile; m.color.setScalar(o.lift ?? 1); if (o.bump) m.normalScale.setScalar(o.bump); return m; };

// ---- many still things as few meshes: everything added to a chunk under one material becomes one mesh, each piece with its own tint
const _m = new THREE.Matrix4(), _l = new THREE.Matrix4(), _n = new THREE.Matrix3(), _v = new THREE.Vector3(), _e = new THREE.Euler(), _q = new THREE.Quaternion(), _s = new THREE.Vector3(), _c = new THREE.Color();
function boxG(w, h, d, t = 1, turn) { const g = new THREE.BoxGeometry(w, h, d), uv = g.attributes.uv, dims = [[d, h], [d, h], [w, d], [w, d], [w, h], [w, h]];
  for (let f = 0; f < 6; f++) for (let i = 0; i < 4; i++) { const k = f * 4 + i, [a, b] = dims[f]; if (turn) uv.setXY(k, uv.getY(k) * b / t, uv.getX(k) * a / t); else uv.setXY(k, uv.getX(k) * a / t, uv.getY(k) * b / t); } return g; }
function chunk(parent) {
  const by = new Map(), base = new THREE.Matrix4();
  const C = { base, meshes: [],
    at(x, z, ry = 0) { base.makeRotationY(ry).setPosition(x, 0, z); C.ry = ry; return C; },
    // a piece: where, turned how (o.rx, ry, rz), scaled o.s, tinted o.c (a colour) and o.k (lighter or darker), o.g darkening its foot
    add(mat, geo, x = 0, y = 0, z = 0, o = {}) {
      let b = by.get(mat); if (!b) by.set(mat, (b = { pos: [], nor: [], uv: [], col: [], idx: [] }));
      _l.compose(_v.set(x, y, z), _q.setFromEuler(_e.set(o.rx || 0, o.ry || 0, o.rz || 0)), _s.setScalar(o.s || 1)); if (o.m) _l.multiply(o.m); _m.multiplyMatrices(base, _l); _n.getNormalMatrix(_m);
      const p = geo.attributes.position, nn = geo.attributes.normal, u = geo.attributes.uv, cc = geo.attributes.color, off = b.pos.length / 3, k = (o.k ?? 1) * (o.flat ? 1 : 0.9 + rnd() * 0.2); _c.set(o.c ?? 0xffffff);
      let lo = 0, hi = 1; if (o.g != null) { geo.computeBoundingBox(); lo = geo.boundingBox.min.y; hi = geo.boundingBox.max.y; }
      for (let i = 0; i < p.count; i++) { _v.fromBufferAttribute(p, i); const f = o.g != null ? o.g + (1 - o.g) * sm(lo, lo + Math.min(1.6, hi - lo), _v.y) : 1; _v.applyMatrix4(_m); b.pos.push(_v.x, _v.y, _v.z); _v.fromBufferAttribute(nn, i).applyMatrix3(_n).normalize(); b.nor.push(_v.x, _v.y, _v.z);
        b.uv.push(u ? u.getX(i) : 0, u ? u.getY(i) : 0); b.col.push(_c.r * k * f * (cc ? cc.getX(i) : 1), _c.g * k * f * (cc ? cc.getY(i) : 1), _c.b * k * f * (cc ? cc.getZ(i) : 1)); }
      if (geo.index) for (let i = 0; i < geo.index.count; i++) b.idx.push(geo.index.getX(i) + off); else for (let i = 0; i < p.count; i++) b.idx.push(i + off);
      return C; },
    box(mat, w, h, d, x, y, z, o = {}) { const g = boxG(w, h, d, mat.userData.tile || 1, o.turn ?? (h > w && h > d)); C.add(mat, g, x, y, z, o); g.dispose(); return C; },
    cyl(mat, r0, r1, h, x, y, z, o = {}) { const g = new THREE.CylinderGeometry(r0, r1, h, o.seg || 8); C.add(mat, g, x, y, z, o); g.dispose(); return C; },
    // a Poly Haven model stood at (x, z)
    ph(name, x, y, z, ry = 0, o = {}) { const g = model(name, 0, 0, 0, 0, o); g.updateMatrixWorld(true); g.traverse((q) => { if (q.isMesh && q.geometry.attributes.normal) C.add(phMat(q.material), q.geometry, x, y, z, { ry, m: q.matrixWorld, flat: 1, k: o.k ?? 0.8, rx: o.rx, rz: o.rz }); }); return C; },
    // where a box of this chunk lies in the street's frame
    rect(x0, x1, z0, z1) { const a = _v.set(x0, 0, z0).applyMatrix4(base).clone(), b = _v.set(x1, 0, z1).applyMatrix4(base); return { x0: Math.min(a.x, b.x), x1: Math.max(a.x, b.x), z0: Math.min(a.z, b.z), z1: Math.max(a.z, b.z) }; },
    done() { for (const [mat, b] of by) { const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(b.pos, 3)); g.setAttribute('normal', new THREE.Float32BufferAttribute(b.nor, 3)); g.setAttribute('uv', new THREE.Float32BufferAttribute(b.uv, 2)); g.setAttribute('color', new THREE.Float32BufferAttribute(b.col, 3)); g.setIndex(b.idx);
        const m = new THREE.Mesh(g, mat); m.userData.cast = !mat.userData.nocast; m.receiveShadow = !mat.userData.nocast; m.matrixAutoUpdate = false; if (mat.transparent) m.renderOrder = 2; parent.add(m); C.meshes.push(m); } by.clear(); return C; } };
  return C;
}
const phMats = new Map(), phMat = (m) => { let o = phMats.get(m); if (!o) { const glass = m.transmission > 0 || m.transparent; o = out(glass ? new THREE.MeshStandardMaterial({ color: 0x2a2a26, transparent: true, opacity: 0.25, depthWrite: false }) : m.clone(), 0.5); o.roughness = 1; if (glass) o.userData.nocast = true; phMats.set(m, o); } return o; };   // (a lantern's glass as plain thin glass: glass that bends light would have the whole street drawn twice)

export function buildTown(scene, room) {
  const T0 = new THREE.Group(), T = new THREE.Group(); T0.position.set(FRAME.x, 0, FRAME.z); T0.rotation.y = FRAME.ry; T0.add(T); scene.add(T0); T0.updateMatrixWorld(true);   // T0 the frame and its lights, T what is drawn
  const cs = Math.cos(FRAME.ry), sn = Math.sin(FRAME.ry);
  const toWorld = (x, z) => ({ x: FRAME.x + x * cs + z * sn, z: FRAME.z - x * sn + z * cs }), toStreet = (x, z) => { const a = x - FRAME.x, b = z - FRAME.z; return { x: a * cs - b * sn, z: a * sn + b * cs }; };
  const decks = [], props = [];
  const solid = (r, pad = 0) => { const a = toWorld(r.x0 - pad, r.z0 - pad), b = toWorld(r.x1 + pad, r.z1 + pad); room.solids.push({ x0: Math.min(a.x, b.x), x1: Math.max(a.x, b.x), z0: Math.min(a.z, b.z), z1: Math.max(a.z, b.z), town: 1 }); };
  const HW = FRAME.half, DEEP = FRAME.deep;

  const M = { siding: surf('siding', 2.2, { sat: 0.4, lift: 2 }), boards: surf('planks', 1.8, { sat: 0.4, lift: 1.5 }), dark: surf('dark', 1.8, { sat: 0.4, lift: 1.3 }), plaster: surf('plaster', 2.6, { sat: 0.5 }), paint: surf('peel', 1.6, { sat: 0.25 }), ground: surf('sand', 4, { sat: 0.7, lift: 1.1, bump: 2 }), rock: surf('rock', 16, { sat: 0.5 }), iron: surf('rust', 1, { sat: 0.3 }),
    prop: out(new THREE.MeshStandardMaterial({ roughness: 1, metalness: 0 }), 0.6),
    glass: out(new THREE.MeshStandardMaterial({ color: 0x0b0e12, roughness: 0.85, metalness: 0 })), pane: out(new THREE.MeshStandardMaterial({ color: 0x20262c, roughness: 0.9, transparent: true, opacity: 0.3, depthWrite: false })),
    lit: new THREE.MeshBasicMaterial({ vertexColors: true, fog: false }), signs: null };
  M.pane.userData.nocast = M.lit.userData.nocast = true;

  // ---- the painted signs: hand-lettered, each letter a little off, the paint worn along the grain; one picture for the whole town
  const SG = { c: document.createElement('canvas'), n: 0 }; SG.c.width = 2048; SG.c.height = 1536; SG.x = SG.c.getContext('2d');
  { const t = new THREE.CanvasTexture(SG.c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; M.signs = out(new THREE.MeshStandardMaterial({ map: t, roughness: 1, transparent: true, alphaTest: 0.08, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2 }), 0.7); M.signs.userData.nocast = true; SG.t = t; }
  function sign(C, text, w, h, x, y, z, o = {}) {
    const i = SG.n++, c = SG.x, cw = 1024, ch = 128, ox = (i % 2) * cw, oy = (i >> 1) * ch, pale = o.pale ?? true;
    c.save(); c.translate(ox, oy); c.beginPath(); c.rect(0, 0, cw, ch); c.clip();
    let px = Math.min(96, ch * 0.74); c.font = `bold ${px}px Georgia, "Times New Roman", serif`; const tw = c.measureText(text).width + text.length * 4; if (tw > cw - 40) px *= (cw - 40) / tw; c.font = `bold ${px}px Georgia, "Times New Roman", serif`;
    let cx = (cw - (c.measureText(text).width + text.length * 3)) / 2; c.textBaseline = 'middle';
    for (const chr of text) { const a = c.measureText(chr).width; c.save(); c.translate(cx + a / 2, ch / 2 + rr(-3, 3)); c.rotate(rr(-0.035, 0.035)); c.scale(rr(0.94, 1.06), rr(0.95, 1.05)); c.fillStyle = pale ? `rgba(${196 + rr(-14, 10) | 0},${186 + rr(-14, 10) | 0},${160 + rr(-14, 10) | 0},${rr(0.78, 0.95)})` : `rgba(22,18,15,${rr(0.8, 0.95)})`; c.fillText(chr, -a / 2, 0); c.restore(); cx += a + 3; }
    c.globalCompositeOperation = 'destination-out'; for (let k = 0; k < 420; k++) { c.fillStyle = `rgba(0,0,0,${rr(0.15, 0.7)})`; c.fillRect(rr(0, cw), rr(0, ch), rr(8, 120), rr(0.6, 2.4)); } for (let k = 0; k < 24; k++) { const bx = rr(0, cw), by2 = rr(0, ch), br = rr(6, 30), gr = c.createRadialGradient(bx, by2, 0, bx, by2, br); gr.addColorStop(0, 'rgba(0,0,0,.7)'); gr.addColorStop(1, 'rgba(0,0,0,0)'); c.fillStyle = gr; c.fillRect(bx - br, by2 - br, 2 * br, 2 * br); }
    c.restore(); SG.t.needsUpdate = true;
    const g = new THREE.PlaneGeometry(w, h), uv = g.attributes.uv; for (let k = 0; k < 4; k++) uv.setXY(k, (ox + uv.getX(k) * cw) / 2048, 1 - (oy + (1 - uv.getY(k)) * ch) / 1536);
    C.add(M.signs, g, x, y, z, { flat: 1, k: o.k ?? 0.55, ry: o.ry, rx: o.rx }); g.dispose();
  }

  // ---- a wall with holes in it (x across, from y0 to y1, at depth z), built of the pieces round the holes
  function wall(C, mat, w, y0, y1, th, z, holes, o = {}) {
    const hs = holes.filter((h) => h.y1 > y0 && h.y0 < y1).sort((a, b) => a.x - b.x); let x = -w / 2;
    for (const h of hs) { const a = h.x - h.w / 2, b = h.x + h.w / 2; if (a > x + 1e-3) C.box(mat, a - x, y1 - y0, th, (a + x) / 2, (y0 + y1) / 2, z, o); if (h.y0 > y0 + 1e-3) C.box(mat, h.w, h.y0 - y0, th, h.x, (y0 + h.y0) / 2, z, o); if (h.y1 < y1 - 1e-3) C.box(mat, h.w, y1 - h.y1, th, h.x, (h.y1 + y1) / 2, z, { c: o.c, k: o.k }); x = b; }
    if (w / 2 > x + 1e-3) C.box(mat, w / 2 - x, y1 - y0, th, (w / 2 + x) / 2, (y0 + y1) / 2, z, o);
  }
  // a window set back in its wall: casing, sill, sash bars, glass; dark behind a half-drawn blind, or a shallow room with one lamp burning low
  function win(C, h, z, o = {}) {
    if (h.kind === 'open') return;
    const { x, w, y0, y1 } = h, hh = y1 - y0, trim = o.trim ?? M.boards, tc = o.tc ?? 0x9a948a;
    for (const s of [-1, 1]) C.box(trim, 0.1, hh + 0.2, 0.05, x + s * (w / 2 + 0.05), (y0 + y1) / 2, z + 0.02, { c: tc }); C.box(trim, w + 0.28, 0.1, 0.07, x, y1 + 0.05, z + 0.03, { c: tc }); C.box(trim, w + 0.24, 0.06, 0.16, x, y0 - 0.03, z + 0.03, { c: tc });
    const zz = z - 0.11; C.box(trim, w, 0.05, 0.05, x, (y0 + y1) / 2, zz, { c: tc, k: 0.8 }); for (let k = 1; k < (o.bars ?? 2); k++) C.box(trim, 0.035, hh, 0.04, x - w / 2 + k * w / (o.bars ?? 2), (y0 + y1) / 2, zz, { c: tc, k: 0.8 });
    if (h.kind === 'jail') for (let k = 0; k < 6; k++) C.cyl(M.iron, 0.014, 0.014, hh, x - w / 2 + (k + 0.5) * w / 6, (y0 + y1) / 2, z - 0.04, { seg: 5, k: 0.5 });
    if (h.kind === 'lit') { C.box(M.pane, w, hh, 0.01, x, (y0 + y1) / 2, zz - 0.02, { flat: 1 }); room2(C, x, y0, w, hh, zz - 0.04, o.warm ?? 1); }
    else { C.box(M.glass, w, hh, 0.02, x, (y0 + y1) / 2, zz - 0.04, { flat: 1, k: rr(0.7, 1.3) }); if (h.kind !== 'shop' && rnd() < 0.7) { const d = rr(0.25, 0.7) * hh; C.box(M.plaster, w - 0.06, d, 0.008, x, y1 - d / 2, zz - 0.024, { c: 0x6a6456, k: 0.5 }); } }
  }
  // the room behind a lit window: walls, floor and ceiling painted by its one lamp, a table and what stands on it dark against them
  function room2(C, x, y0, w, hh, z, warm) {
    const rw = w + 1.4, rh = Math.max(2.5, hh + 1.1), rd = 2.4, fy = y0 - 0.85, lamp = new THREE.Vector3(x + rr(-0.4, 0.4), fy + 1.05, z - rr(0.9, 1.5)), tone = [1.0 * warm, 0.62 * warm, 0.32 * warm];
    const face = (pw, ph, px, py, pz, rx, ry, tint) => { const g = new THREE.PlaneGeometry(pw, ph, 5, 4), p = g.attributes.position, col = new Float32Array(p.count * 3); _l.compose(_v.set(px, py, pz), _q.setFromEuler(_e.set(rx, ry, 0)), _s.setScalar(1));
      for (let i = 0; i < p.count; i++) { _v.fromBufferAttribute(p, i).applyMatrix4(_l); const d2 = _v.distanceToSquared(lamp), k = 0.26 / (0.35 + d2) * tint; col.set([tone[0] * k, tone[1] * k, tone[2] * k], i * 3); } g.setAttribute('color', new THREE.BufferAttribute(col, 3)); C.add(M.lit, g, px, py, pz, { rx, ry, flat: 1 }); g.dispose(); };
    face(rw, rh, x, fy + rh / 2, z - rd, 0, 0, 1); face(rd, rh, x - rw / 2, fy + rh / 2, z - rd / 2, 0, Math.PI / 2, 0.85); face(rd, rh, x + rw / 2, fy + rh / 2, z - rd / 2, 0, -Math.PI / 2, 0.85); face(rw, rd, x, fy, z - rd / 2, -Math.PI / 2, 0, 0.6); face(rw, rd, x, fy + rh, z - rd / 2, Math.PI / 2, 0, 0.7);
    const g = boxG(1, 1, 1), blk = (bw, bh, bd, bx, by2, bz, k) => C.add(M.lit, g, bx, by2, bz, { m: new THREE.Matrix4().makeScale(bw, bh, bd), flat: 1, c: new THREE.Color(tone[0] * k, tone[1] * k, tone[2] * k) });
    blk(0.9, 0.05, 0.6, lamp.x, fy + 0.78, lamp.z, 0.05); blk(0.06, 0.78, 0.06, lamp.x - 0.38, fy + 0.39, lamp.z, 0.02); blk(0.06, 0.78, 0.06, lamp.x + 0.38, fy + 0.39, lamp.z, 0.02); blk(0.07, 0.1, 0.07, lamp.x, fy + 0.86, lamp.z, 0.08); blk(0.035, 0.11, 0.035, lamp.x, fy + 1.0, lamp.z, 1.5);
    blk(0.5, 1.9, 0.4, x + (rnd() < 0.5 ? -1 : 1) * (rw / 2 - 0.3), fy + 0.95, z - rd + 0.25, 0.03); for (const s of [-1, 1]) blk(0.22, hh + 0.1, 0.03, x + s * (w / 2 - 0.08), y0 + hh / 2, z - 0.06, 0.07);
  }
  // a plank door in its frame, set back; its panels, its knob, sometimes a pane over it
  function door(C, x, w, h, z, o = {}) {
    for (const s of [-1, 1]) C.box(M.boards, 0.11, h + 0.1, 0.06, x + s * (w / 2 + 0.055), h / 2 + 0.05, z + 0.02, { c: 0x9a948a }); C.box(M.boards, w + 0.3, 0.12, 0.08, x, h + 0.06, z + 0.03, { c: 0x9a948a });
    C.box(o.mat ?? M.paint, w, h, 0.05, x, h / 2, z - 0.12, { c: o.c ?? 0x7a7468, k: 0.7 }); for (const [py, ph] of [[0.5, 0.62], [1.38, 0.86]]) for (const s of [-1, 1]) C.box(o.mat ?? M.paint, w / 2 - 0.14, ph, 0.02, x + s * w / 4, py, z - 0.09, { c: o.c ?? 0x7a7468, k: 0.55 });
    C.cyl(M.iron, 0.025, 0.025, 0.05, x + w / 2 - 0.1, 1.0, z - 0.07, { rx: Math.PI / 2, k: 0.6 }); C.box(M.boards, w + 0.1, 0.05, 0.3, x, 0.0, z + 0.02, { k: 0.6 });
  }
  // a boardwalk: short boards laid across, none quite level or the same length, on a beam and piers; a step down to the street where asked
  function walk(C, x0, x1, o = {}) {
    const d = ST.walk; let x = x0; while (x < x1 - 0.05) { const bw = Math.min(rr(0.19, 0.3), x1 - x), len = d + rr(-0.02, 0.1); C.box(M.boards, bw - 0.012, 0.045, len, x + bw / 2, -0.0225 - rr(0, 0.012), len / 2, { k: rr(0.62, 1.0), turn: true, rz: rr(-0.008, 0.008) }); x += bw; }
    C.box(M.dark, x1 - x0, 0.2, 0.09, (x0 + x1) / 2, -0.15, d - 0.03, { k: 0.5 }); C.box(M.dark, x1 - x0, 0.26, 0.08, (x0 + x1) / 2, -0.17, 0.3, { k: 0.4 }); for (let px = x0 + 0.2; px < x1; px += 1.9) C.box(M.dark, 0.18, 0.5, 0.18, px, -0.3, d - 0.12, { k: 0.4 });
    for (const s of [x0, x1]) C.box(M.dark, 0.07, 0.26, d - 0.1, s + (s === x0 ? 0.035 : -0.035), -0.16, d / 2, { k: 0.45 });
    decks.push({ ...C.rect(x0, x1, -0.3, d + 0.03), y: 0 });
    for (const [sx, sw] of o.steps || []) { C.box(M.boards, sw, 0.05, 0.36, sx, -0.165, d + 0.2, { k: 0.7 }); for (const s of [-1, 1]) C.box(M.dark, 0.06, 0.14, 0.34, sx + s * (sw / 2 - 0.1), -0.25, d + 0.2, { k: 0.45 }); decks.push({ ...C.rect(sx - sw / 2, sx + sw / 2, d, d + 0.38), y: -0.15 }); }
  }
  // a porch roof on posts over the boardwalk (or a balcony with a rail), shingled in old boards
  function porch(C, x0, x1, y, o = {}) {
    const d = ST.walk - 0.05, n = Math.max(2, Math.round((x1 - x0) / 2.7) + 1), skip = o.skip || [];
    for (let i = 0; i < n; i++) { const px = x0 + 0.1 + i * (x1 - x0 - 0.2) / (n - 1); if (skip.some((s) => Math.abs(s - px) < 0.7)) continue; C.box(M.boards, 0.13, y + 0.3, 0.13, px, (y - 0.3) / 2, d - 0.12, { k: 0.7, g: 0.6, rz: rr(-0.012, 0.012) }); for (const s of [-1, 1]) C.box(M.boards, 0.07, 0.5, 0.07, px + s * 0.17, y - 0.24, d - 0.12, { rz: s * 0.75, k: 0.6 }); const r = C.rect(px - 0.08, px + 0.08, d - 0.2, d - 0.04); solid(r, 0.02); }
    C.box(M.boards, x1 - x0, 0.16, 0.12, (x0 + x1) / 2, y - 0.08, d - 0.12, { k: 0.6 });
    if (o.balcony) { C.box(M.boards, x1 - x0 + 0.1, 0.07, d + 0.1, (x0 + x1) / 2, y + 0.035, d / 2, { k: 0.6 }); for (let jx = x0 + 0.3; jx < x1; jx += 0.62) C.box(M.dark, 0.06, 0.16, d, jx, y - 0.08, d / 2, { k: 0.4 });
      C.box(M.boards, x1 - x0, 0.07, 0.09, (x0 + x1) / 2, y + 1.0, d - 0.06, { k: 0.75 }); C.box(M.boards, x1 - x0, 0.05, 0.05, (x0 + x1) / 2, y + 0.2, d - 0.06, { k: 0.7 }); for (let bx = x0 + 0.08; bx < x1; bx += 0.31) C.box(M.boards, 0.035, 0.78, 0.035, bx, y + 0.6, d - 0.06, { k: rr(0.55, 0.85) }); for (const s of [x0, x1]) { C.box(M.boards, 0.07, 0.07, d, s, y + 1.0, d / 2, { k: 0.75 }); for (let bz = 0.2; bz < d; bz += 0.33) C.box(M.boards, 0.035, 0.78, 0.035, s, y + 0.6, bz, { k: 0.7 }); } }
    else { const sl = 0.13, len = Math.hypot(d + 0.25, (d + 0.25) * sl); let x = x0 - 0.15; while (x < x1 + 0.1) { const bw = Math.min(rr(0.5, 1.0), x1 + 0.15 - x); C.box(M.dark, bw - 0.01, 0.035, len, x + bw / 2, y + 0.17 + (d + 0.25) * sl / 2 + rr(0, 0.012), (d + 0.25) / 2 - 0.02, { rx: Math.atan(sl), k: rr(0.4, 0.75), turn: true }); x += bw; }
      for (let rx2 = x0 + 0.4; rx2 < x1; rx2 += 1.1) C.box(M.dark, 0.06, 0.1, len - 0.1, rx2, y + 0.1 + (d + 0.25) * sl / 2, (d + 0.25) / 2 - 0.02, { rx: Math.atan(sl), k: 0.4 }); }
  }
  // a roof in two slopes behind the false front, its boards run down the slope, with the gable's triangle at the back
  function roof(C, w, d, y, rise, o = {}) {
    const half = w / 2 + 0.25, len = Math.hypot(half, rise), a = Math.atan2(rise, half);
    for (const s of [-1, 1]) { let z = -d - 0.25; while (z < 0) { const bw = Math.min(rr(0.7, 1.3), -z); C.box(o.mat ?? M.dark, len, 0.04, bw - 0.012, s * half / 2, y + rise / 2 + 0.03 + rr(0, 0.015), z + bw / 2, { rz: -s * a, k: rr(0.4, 0.7) * (o.k ?? 1) }); z += bw; } }
    const g = new THREE.BufferGeometry(), hw = w / 2; g.setAttribute('position', new THREE.Float32BufferAttribute([hw, y, -d, -hw, y, -d, 0, y + rise * hw / half, -d], 3)); g.setAttribute('normal', new THREE.Float32BufferAttribute([0, 0, -1, 0, 0, -1, 0, 0, -1], 3)); g.setAttribute('uv', new THREE.Float32BufferAttribute([0, 0, w / 2.2, 0, w / 4.4, rise / 2.2], 2)); C.add(o.wall ?? M.siding, g, 0, 0, 0, { c: o.c, k: 0.85 });
    if (o.front) { const g2 = g.clone().applyMatrix4(new THREE.Matrix4().makeRotationY(Math.PI).setPosition(0, 0, -d)); C.add(o.wall ?? M.siding, g2, 0, 0, 0, { c: o.c, k: 0.9 }); }
    C.box(M.dark, 0.14, 0.06, d + 0.5, 0, y + rise + 0.05, -d / 2 - 0.1, { k: 0.5 });
    if (o.pipe) { C.cyl(M.iron, 0.07, 0.07, 1.3, o.pipe, y + rise * (1 - Math.abs(o.pipe) / half) + 0.6, -d * 0.6, { k: 0.5 }); C.cyl(M.iron, 0.11, 0.09, 0.1, o.pipe, y + rise * (1 - Math.abs(o.pipe) / half) + 1.28, -d * 0.6, { k: 0.4 }); }
  }

  // ---- a building of the street: its walls with their holes, false front and cornice, roof, boardwalk, porch, door, windows, sign; front at z = 0 facing +z, x across
  function house(C, o) {
    const w = o.w, h = o.h, d = o.d, mat = M[o.mat || 'siding'], tint = o.c ?? 0xffffff, th = 0.16, ff = o.ff ?? h + 1.6, ridge = w * 0.15, up = o.up || [], st = o.wins || [];
    const holes = [...st, ...up]; if (o.door !== null) holes.push({ x: o.door ?? 0, w: o.doorW ?? 1.0, y0: 0, y1: o.doorH ?? 2.15, door: 1 });
    wall(C, mat, w, -0.5, h, th, -th / 2, holes, { c: tint, g: 0.5 });
    if (!o.gable) { C.box(mat, w + 0.06, ff - h, th * 0.8, 0, (ff + h) / 2, -th / 2 + 0.02, { c: tint, k: 0.92 }); C.box(M.boards, w + 0.4, 0.11, 0.3, 0, ff + 0.05, 0.03, { c: 0x9a948a, k: 0.75 }); C.box(M.boards, w + 0.24, 0.16, 0.16, 0, ff - 0.1, 0.02, { c: 0x9a948a, k: 0.65 }); for (let bx = -w / 2 + 0.25; bx < w / 2; bx += 0.95) C.box(M.boards, 0.1, 0.26, 0.14, bx, ff - 0.3, 0.05, { c: 0x9a948a, k: 0.6 });
      if (o.step) { C.box(mat, w * 0.5, 0.7, th * 0.8, 0, ff + 0.45, -th / 2 + 0.02, { c: tint }); C.box(M.boards, w * 0.5 + 0.3, 0.1, 0.28, 0, ff + 0.85, 0.02, { c: 0x9a948a, k: 0.7 }); }
      for (let k = 0; k < 3; k++) C.box(M.dark, 0.09, 0.09, 1.6, (k - 1) * w * 0.36, ff - 0.9, -0.85, { rx: -0.65, k: 0.4 }); }
    for (const s of [-1, 1]) { C.box(mat, th, h + 0.5, d - th, s * (w / 2 - th / 2), h / 2 - 0.25, -d / 2 - th / 2, { c: tint, g: 0.5, k: 0.9 }); C.box(M.boards, 0.13, (o.gable ? h : ff) + 0.4, 0.13, s * (w / 2 + 0.01), (o.gable ? h : ff) / 2 - 0.2, 0.01, { c: 0x9a948a, k: 0.7 }); }
    C.box(mat, w, h + 0.5, th, 0, h / 2 - 0.25, -d + th / 2, { c: tint, g: 0.5, k: 0.85 });
    roof(C, w, d, h, ridge, { wall: mat, c: tint, front: o.gable, pipe: o.pipe, k: o.roofK });
    if (o.st2) C.box(M.boards, w + 0.04, 0.12, 0.05, 0, o.st2, 0.01, { c: 0x9a948a, k: 0.7 });
    for (const q of st) win(C, q, 0, o); for (const q of up) win(C, q, 0, o);
    if (o.door !== null) door(C, o.door ?? 0, o.doorW ?? 1.0, o.doorH ?? 2.15, 0, { c: o.doorC });
    if (o.walk !== false) walk(C, -w / 2 - 0.25, w / 2 + 0.25, { steps: o.steps ?? [[o.door ?? 0, 2.0]] });
    if (o.porch) porch(C, -w / 2 - 0.1, w / 2 + 0.1, o.porch, { balcony: o.balcony, skip: o.skip });
    if (o.awning) { const a = o.awning; C.box(M.plaster, a.w, 0.03, 1.9, a.x, a.y - 0.28, 0.9, { rx: 0.3, c: 0x8a8272, k: 0.7 }); for (const s of [-1, 1]) C.box(M.iron, 0.03, 0.03, 1.95, a.x + s * (a.w / 2 - 0.05), a.y - 0.3, 0.9, { rx: 0.3, k: 0.5 }); C.box(M.plaster, a.w, 0.22, 0.02, a.x, a.y - 0.68, 1.82, { c: 0x8a8272, k: 0.6 }); }
    if (o.sign) { const sw = Math.min(w * 0.86, o.sign.length * 0.52 + 0.8), sy = o.signY ?? (h + ff) / 2 + (o.gable ? -0.4 : 0), sh = o.signH ?? 0.78; C.box(M.boards, sw + 0.16, sh + 0.14, 0.04, 0, sy, 0.035, { c: o.board ?? 0x4a4640, k: o.boardK ?? 0.75 }); sign(C, o.sign, sw, sh, 0, sy, 0.062, { pale: o.pale }); }
    if (o.sign2) { const s2 = o.sign2; C.box(M.boards, s2.w + 0.1, s2.h + 0.08, 0.03, s2.x, s2.y, 0.03, { c: 0x8a857a, k: 0.8 }); sign(C, s2.t, s2.w, s2.h, s2.x, s2.y, 0.05, { pale: false }); }
    solid(C.rect(-w / 2, w / 2, -d, 0.05));
    o.more?.(C);
  }
  const W1 = (x, w = 0.9, kind = 'dark') => ({ x, w, y0: 0.95, y1: 2.35, kind }), W2 = (x, y, w = 0.85, kind = 'dark') => ({ x, w, y0: y, y1: y + 1.35, kind });
  const PF = (name, x, z, ry = 0, s = 1, hx, hz) => { props.push({ name, x, z, ry, s }); if (hx) solid({ x0: x - hx, x1: x + hx, z0: z - (hz ?? hx), z1: z + (hz ?? hx) }); };
  const LP = (C, name, x, z, ry = 0, s = 1, hx, hz) => { const p = _v.set(x, 0, z).applyMatrix4(C.base); props.push({ name, x: p.x, z: p.z, ry: ry + C.ry, s }); if (hx) solid(C.rect(x - hx, x + hx, z - (hz ?? hx), z + (hz ?? hx))); };
  const crates = (C, x, z, n = 3) => { for (let i = 0; i < n; i++) { const h = rr(0.38, 0.6); C.ph('wooden_crate_01', x + (i % 2) * 0.62 + rr(-0.05, 0.05), i > 1 ? 0.5 : 0, z + (i > 1 ? 0.1 : (i % 2) * rr(-0.1, 0.1)), rr(0, 1.5), { h }); } solid(C.rect(x - 0.35, x + 0.95, z - 0.35, z + 0.35)); };
  const barrels = (C, x, z, n = 2) => { for (let i = 0; i < n; i++) C.ph('wine_barrel_01', x + i * 0.72, 0, z + (i % 2) * 0.25, rr(0, 3), { h: rr(0.85, 0.95), rx: 0 }); solid(C.rect(x - 0.35, x + (n - 1) * 0.72 + 0.35, z - 0.35, z + 0.5)); };

  // ---- the near row (the saloon's side of the street): each chunk is drawn, or skipped when out of sight, as one
  const rows = [];
  const N = (x0, x1, o) => { const C = chunk(T).at((x0 + x1) / 2, 0, Math.PI); house(C, { w: x1 - x0, ...o }); rows.push(C.done()); }, S = (x0, x1, o) => { const C = chunk(T).at((x0 + x1) / 2, SZ, 0); house(C, { w: x1 - x0, ...o }); rows.push(C.done()); };

  { // THE LAST CHANCE itself, from outside: a plank skin round the room with its door and windows cut through, a tall false front with its name, a roof, a porch on posts, a boardwalk, lanterns by the door
    const C = chunk(T).at(0, 0, Math.PI), w = 2 * HW + 0.4, h = R.H + 0.45, ff = h + 2.3, th = 0.1, holes = [{ x: 0, w: 1.9, y0: -0.6, y1: 2.5 }, ...FRAME.win.map((x) => ({ x, w: FRAME.winW, y0: 0.9, y1: 3.0 }))];
    wall(C, M.siding, w, -0.5, h, th, 0.17, holes, { c: 0xd8d0c4, g: 0.55 }); C.box(M.siding, w + 0.06, ff - h, th, 0, (ff + h) / 2, 0.17, { c: 0xd8d0c4 });
    C.box(M.boards, w + 0.44, 0.12, 0.34, 0, ff + 0.06, 0.2, { c: 0x9a948a, k: 0.75 }); C.box(M.boards, w + 0.26, 0.18, 0.18, 0, ff - 0.1, 0.22, { c: 0x9a948a, k: 0.65 }); for (let bx = -w / 2 + 0.3; bx < w / 2; bx += 0.82) C.box(M.boards, 0.11, 0.3, 0.16, bx, ff - 0.33, 0.25, { c: 0x9a948a, k: 0.6 });
    C.box(M.siding, w * 0.55, 0.8, th, 0, ff + 0.5, 0.17, { c: 0xd8d0c4 }); C.box(M.boards, w * 0.55 + 0.3, 0.1, 0.3, 0, ff + 0.95, 0.2, { c: 0x9a948a, k: 0.7 });
    for (const q of holes.slice(1)) { for (const s of [-1, 1]) C.box(M.boards, 0.12, 2.34, 0.05, q.x + s * (q.w / 2 + 0.06), 1.95, 0.235, { c: 0x9a948a }); C.box(M.boards, q.w + 0.34, 0.13, 0.08, q.x, 3.07, 0.24, { c: 0x9a948a }); C.box(M.boards, q.w + 0.3, 0.07, 0.2, q.x, 0.87, 0.25, { c: 0x9a948a }); }
    for (const s of [-1, 1]) C.box(M.boards, 0.13, 2.62, 0.06, s * 1.02, 1.25, 0.235, { c: 0x9a948a }); C.box(M.boards, 2.3, 0.14, 0.08, 0, 2.57, 0.24, { c: 0x9a948a });
    for (const s of [-1, 1]) { C.box(M.siding, th, h + 0.5, DEEP + 0.5, s * (w / 2 - th / 2), h / 2 - 0.25, -DEEP / 2 - 0.03, { c: 0xd8d0c4, g: 0.5, k: 0.9 }); C.box(M.boards, 0.14, ff + 0.4, 0.14, s * (w / 2 + 0.01), ff / 2 - 0.2, 0.2, { c: 0x9a948a, k: 0.7 }); }
    C.box(M.siding, w, h + 0.5, th, 0, h / 2 - 0.25, -DEEP - 0.23, { c: 0xd8d0c4, g: 0.5, k: 0.85 });
    C.base.multiply(new THREE.Matrix4().makeTranslation(0, 0, 0.22)); roof(C, w, DEEP + 0.5, h, w * 0.15, { pipe: 1.2 }); C.at(0, 0, Math.PI);
    for (let k = 0; k < 4; k++) C.box(M.dark, 0.1, 0.1, 2.2, (k - 1.5) * w * 0.28, ff - 1.1, -0.95, { rx: -0.6, k: 0.4 });
    { const sw = w * 0.9, sy = h + 1.25; C.box(M.boards, sw + 0.2, 1.24, 0.05, 0, sy, 0.25, { c: 0x3c3834, k: 0.7 }); sign(C, 'THE LAST CHANCE', sw, 1.05, 0, sy, 0.285); sign(C, 'SALOON', 2.4, 0.5, 0, ff + 0.5, 0.235, { k: 0.8 }); }
    C.base.multiply(new THREE.Matrix4().makeTranslation(0, 0, 0.22)); walk(C, -w / 2 - 0.3, w / 2 + 0.3, { steps: [[0, 2.6]] }); porch(C, -w / 2 - 0.1, w / 2 + 0.1, 3.72, { skip: [0] }); C.at(0, 0, Math.PI);
    for (const s of [-1, 1]) { C.ph('lantern_01', s * 1.35, 2.32, 0.5, 0, { h: 0.4, k: 0.9 }); C.cyl(M.iron, 0.006, 0.006, 0.95, s * 1.35, 3.19, 0.5, { seg: 4, k: 0.4 }); C.box(M.lit, 0.03, 0.06, 0.03, s * 1.35, 2.5, 0.5, { flat: 1, c: new THREE.Color(1.6, 0.9, 0.42) }); }
    C.ph('painted_wooden_bench', -HW + 0.3, 0, 0.7, 0, { w: 1.5, k: 0.6 }); solid(C.rect(-HW - 0.45, -HW + 1.05, 0.3, 0.95)); barrels(C, HW - 0.5, 0.75, 2);
    solid(C.rect(-w / 2, -w / 2 + 0.3, -DEEP, 0.3)); solid(C.rect(w / 2 - 0.3, w / 2, -DEEP, 0.3));
    C.box(M.boards, 2.0, 0.05, 0.44, 0, -0.026, 0.05, { turn: true, k: 0.7 });
    PF('hitch', -2.9, -ST.walk - 0.9, 0, 1, 1, 0.2); PF('hitch', 3.1, -ST.walk - 0.9, 0, 1, 1, 0.2); PF('horse', 3.2, -ST.walk - 2.4, 0.12, 1, 0.45, 1.2); PF('trough', -5.6, -ST.walk - 0.8, 0.04, 1, 1.25, 0.3);
    rows.push(C.done());
  }
  N(-12.6, -5.4, { h: 4.0, d: 11, mat: 'siding', c: 0xc8c0b4, sign: 'GENERAL MERCHANDISE', wins: [{ x: -2.1, w: 2.0, y0: 0.7, y1: 2.5, kind: 'shop' }, { x: 2.1, w: 2.0, y0: 0.7, y1: 2.5, kind: 'shop' }], bars: 3, porch: 3.0, pipe: -1.6,
    sign2: { t: 'DRY GOODS  TOOLS  FEED', w: 3.2, h: 0.3, x: 0, y: 2.78 }, more: (C) => { barrels(C, -3.1, 0.6, 3); crates(C, 1.6, 0.55, 3); C.ph('wooden_bucket_01', 0.95, 0, 0.5, 0, { h: 0.3 }); C.ph('wooden_broom', -0.85, 0, 0.12, 0, { h: 1.3, rx: -0.12 }); LP(C, 'freight', 3.0, ST.walk + 0.7, 0.3, 1, 0.75, 0.5); } });
  N(-21.4, -14.0, { h: 4.6, d: 10, mat: 'plaster', c: 0xb4aea0, ff: 6.6, step: 1, sign: 'PERDITION BANK', board: 0x2e2c2a, wins: [W1(-2.2, 1.0, 'jail'), W1(2.2, 1.0, 'jail')], doorW: 1.2, doorH: 2.3, doorC: 0x4a4038, walk: true, steps: [[0, 2.4]],
    more: (C) => { for (const s of [-1, 1]) for (const px of [0.85, 3.5]) C.box(M.plaster, 0.34, 4.6, 0.1, s * px, 2.3, 0.04, { c: 0xb4aea0, k: 0.85, g: 0.6 }); C.box(M.plaster, 7.5, 0.3, 0.14, 0, 4.45, 0.05, { c: 0xb4aea0, k: 0.8 }); } });
  N(-30.4, -23.0, { h: 3.5, d: 9, mat: 'siding', c: 0xbab2a4, ff: 4.9, sign: 'SHERIFF', signH: 0.7, wins: [W1(-2.2, 1.0, 'lit'), W1(2.3, 0.8, 'jail')], door: -0.4, porch: 2.75, pipe: 1.5, warm: 0.8, sign2: { t: 'JAIL', w: 0.9, h: 0.32, x: 2.3, y: 2.75 },
    more: (C) => { LP(C, 'wanted', -3.25, 0.3, 0, 0.8); C.ph('rockingchair_01', 0.9, 0, 0.9, -0.3, { h: 1.0, k: 0.6 }); LP(C, 'hitch', 0.5, ST.walk + 0.9, 0, 1, 1, 0.2); } });
  N(5.6, 16.2, { h: 6.4, d: 13, mat: 'siding', c: 0xcec6ba, ff: 8.0, st2: 3.25, sign: 'COSMOPOLITAN HOTEL', signY: 7.2, signH: 0.72, wins: [W1(-3.6), W1(-1.9), W1(2.0), W1(3.7)], up: [W2(-3.9, 3.95, 0.85, 'lit'), W2(-1.3, 3.95), W2(1.3, 3.95), W2(3.9, 3.95)], door: 0, doorW: 1.3, doorH: 2.3, porch: 3.1, balcony: 1, pipe: 2.5, warm: 0.7,
    more: (C) => { C.ph('painted_wooden_bench', 2.8, 0, 0.45, 0, { w: 1.5, k: 0.6 }); C.ph('vintage_suitcase', -1.1, 0, 0.5, 0.4, { h: 0.45, k: 0.6 }); LP(C, 'hitch', -3, ST.walk + 0.9, 0, 1, 1, 0.2); } });
  N(17.8, 25.4, { h: 6.0, d: 10, mat: 'siding', c: 0xb0a898, ff: 7.2, st2: 3.1, sign: 'ROOMS', signH: 0.6, sign2: { t: 'BOARD BY THE WEEK', w: 2.6, h: 0.28, x: 0, y: 2.75 }, wins: [W1(-2.4), W1(2.4)], up: [W2(-2.4, 3.8), W2(0, 3.8), W2(2.4, 3.8)], porch: 2.9, pipe: -2,
    more: (C) => { C.ph('wooden_ladder', 3.2, 0, 0.25, 0, { h: 2.7, rx: -0.14, k: 0.6 }); crates(C, -3.2, 0.5, 2); } });

  // ---- the far row (across the street)
  S(-9.4, -4.0, { h: 3.4, d: 7, mat: 'siding', c: 0xc4bcb0, ff: 4.9, sign: 'ASSAY OFFICE', signH: 0.6, wins: [W1(-1.5, 1.0, 'lit')], door: 1.2, porch: 2.7, pipe: 1.6, warm: 1, more: (C) => { LP(C, 'barrow', -2.9, ST.walk + 1.2, 0.5, 1, 0.5); crates(C, -2.2, 0.45, 2); } });
  S(-2.4, 5.4, { h: 4.4, d: 12, mat: 'siding', c: 0xa8a092, ff: 6.2, sign: 'FEED & GRAIN', wins: [W1(-2.4, 1.3), W1(2.4, 1.3)], doorW: 1.6, doorH: 2.4, bars: 3, awning: { x: 0, w: 7.2, y: 3.3 },
    more: (C) => { for (let i = 0; i < 7; i++) C.box(M.plaster, 0.75, 0.24, 0.45, -3.1 + (i % 3) * 0.3 + rr(-0.1, 0.1), 0.12 + (i / 3 | 0) * 0.23, 0.55 + rr(-0.06, 0.06), { c: 0x8f866f, ry: rr(-0.2, 0.2), k: 0.75 }); solid(C.rect(-3.6, -2.0, 0.25, 0.85)); barrels(C, 2.7, 0.6, 2); LP(C, 'trough', 2.2, ST.walk + 0.8, 0.05, 1, 1.25, 0.3); LP(C, 'hitch', -1.8, ST.walk + 0.9, 0, 1, 1, 0.2); } });
  S(13.6, 25.6, { h: 5.2, d: 16, mat: 'boards', c: 0xb8b0a4, gable: 1, sign: 'LIVERY & FEED STABLE', signY: 4.35, signH: 0.62, wins: [{ x: 0, w: 3.4, y0: -0.5, y1: 3.3, kind: 'open' }], door: null, walk: false, roofK: 0.9,
    more: (C) => { C.box(M.boards, 1.72, 3.5, 0.07, -0.86, 1.5, 0.05, { c: 0x8a8274, k: 0.7, turn: true }); for (const y of [0.3, 1.6, 2.9]) C.box(M.dark, 1.72, 0.14, 0.03, -0.86, y, 0.1, { k: 0.5 }); C.add(M.boards, boxG(1.7, 3.5, 0.07, 1.8, true), 1.72, 1.5, 0.05, { m: new THREE.Matrix4().makeRotationY(-1.15).multiply(new THREE.Matrix4().makeTranslation(-0.85, 0, 0)), c: 0x8a8274, k: 0.7 });
      C.box(M.boards, 3.9, 0.2, 0.12, 0, 3.42, 0.04, { c: 0x9a948a, k: 0.7 }); C.box(M.boards, 1.2, 1.3, 0.05, 0, 5.3, 0.03, { c: 0x8a8274, k: 0.6, turn: true }); C.box(M.dark, 0.14, 0.14, 1.6, 0, 6.2, 0.6, { k: 0.4 });
      for (const sx of [-3, 3]) for (const sz of [-4, -8, -12]) { C.box(M.dark, 0.14, 1.4, 2.6, sx, 0.4, sz, { k: 0.4 }); } C.box(M.ground, 11, 0.06, 15, 0, -0.3, -8, { k: 0.5, flat: 1 });
      C.ph('wooden_barrels_01', -4.3, 0, 0.8, 0.4, { w: 1.5, k: 0.6 }); solid(C.rect(-5.1, -3.5, 0.2, 1.4)); C.ph('wooden_ladder', 4.6, 0, 0.3, 0, { h: 3.2, rx: -0.13, k: 0.6 }); LP(C, 'saddle', 3.4, 0.9, 0.2, 1, 0.5, 0.3); LP(C, 'buckboard', -2.5, 5.2, 1.45, 1, 2.6, 1.1);
      // the corral beside it: posts and three rails, none straight
      const cx0 = 6.6, cx1 = 19, cz0 = -13, cz1 = 1.2, rail = (ax, az, bx, bz) => { const len = Math.hypot(bx - ax, bz - az), ry = Math.atan2(-(bz - az), bx - ax), n = Math.round(len / 2.4); for (let i = 0; i <= n; i++) { const f = i / n, px = ax + (bx - ax) * f, pz = az + (bz - az) * f; C.cyl(M.dark, 0.06, 0.075, 1.75, px, 0.55, pz, { seg: 6, k: 0.5, rz: rr(-0.04, 0.04) }); if (i < n) for (const y of [0.45, 0.85, 1.25]) C.cyl(M.boards, 0.04, 0.045, len / n + 0.15, px + (bx - ax) / n / 2, y + rr(-0.04, 0.04) - 0.0, pz + (bz - az) / n / 2, { seg: 5, ry, rz: Math.PI / 2 + rr(-0.02, 0.02), k: rr(0.5, 0.8) }); } solid(C.rect(Math.min(ax, bx) - 0.08, Math.max(ax, bx) + 0.08, Math.min(az, bz) - 0.08, Math.max(az, bz) + 0.08)); };
      rail(cx0, cz1, cx1, cz1); rail(cx1, cz1, cx1, cz0); rail(cx1, cz0, cx0, cz0); rail(cx0, cz0, cx0, -1); LP(C, 'horse', 12, -5, 2.2, 1, 0.8); LP(C, 'trough', 17.5, -2, 1.57, 1, 0.3, 1.25); LP(C, 'windmill', 23.5, -9, 0.6, 1, 1.3); } });
  S(-18.4, -11.2, { h: 3.6, d: 8, mat: 'boards', c: 0x9a9286, ff: 5.0, sign: 'BLACKSMITH', signH: 0.62, wins: [{ x: -0.6, w: 4.8, y0: -0.5, y1: 2.6, kind: 'open' }], door: null, walk: false,
    more: (C) => { // an open front: the forge banked for the night, its coals still red, the anvil on its stump, a wheel waiting
      C.box(M.boards, 5.1, 0.2, 0.14, -0.6, 2.66, 0.05, { c: 0x9a948a, k: 0.6 }); for (const px of [-3.05, 1.85]) C.box(M.boards, 0.16, 3.1, 0.14, px, 1.25, 0.05, { k: 0.6 }); C.box(M.ground, 7, 0.06, 7.6, 0, -0.3, -4, { k: 0.45, flat: 1 });
      C.box(M.plaster, 1.3, 0.85, 1.0, -1.9, 0.12, -1.3, { c: 0x6a625a, k: 0.6 }); C.box(M.lit, 0.7, 0.04, 0.5, -1.9, 0.56, -1.3, { flat: 1, c: new THREE.Color(0.42, 0.07, 0.015) }); C.box(M.iron, 1.0, 1.9, 0.9, -1.9, 2.6, -1.5, { k: 0.4 }); C.box(M.boards, 2.2, 0.06, 0.7, 2.0, 0.6, -2.6, { k: 0.5 }); for (const sx of [1.1, 2.9]) C.box(M.dark, 0.08, 0.9, 0.6, sx, 0.15, -2.6, { k: 0.4 });
      C.ph('tree_stump_01', 0.1, -0.3, -1.4, 0, { h: 0.6, k: 0.6 }); C.box(M.iron, 0.5, 0.12, 0.16, 0.1, 0.38, -1.4, { k: 0.35 }); C.box(M.iron, 0.2, 0.1, 0.12, 0.1, 0.3, -1.4, { k: 0.35 }); C.box(M.iron, 0.16, 0.07, 0.1, 0.42, 0.4, -1.4, { k: 0.35 });
      const g = new THREE.TorusGeometry(0.6, 0.035, 5, 18); C.add(M.dark, g, 2.9, 0.33, 0.25, { rx: -0.2, k: 0.5 }); for (let k = 0; k < 6; k++) C.box(M.dark, 1.16, 0.04, 0.04, 2.9, 0.33, 0.25, { rz: k * Math.PI / 6, rx: -0.2, k: 0.5 }); barrels(C, 2.9, 0.9, 1); LP(C, 'barrow', -3.4, 1.6, -0.4, 1, 0.5); } });
  S(-26.2, -20.4, { h: 4.0, d: 9, mat: 'siding', c: 0x8c867c, ff: 6.3, sign: 'UNDERTAKER', signH: 0.62, sign2: { t: 'COFFINS MADE TO MEASURE', w: 2.9, h: 0.26, x: 0, y: 2.72 }, wins: [W1(1.5, 1.2)], door: -1.2, porch: 2.9,
    more: (C) => { for (const [x, a] of [[2.2, 0.14], [1.55, 0.1]]) { const sh = new THREE.Shape(); sh.moveTo(-0.18, 0); sh.lineTo(0.18, 0); sh.lineTo(0.3, 1.35); sh.lineTo(0.2, 1.9); sh.lineTo(-0.2, 1.9); sh.lineTo(-0.3, 1.35); const g = new THREE.ExtrudeGeometry(sh, { depth: 0.3, bevelEnabled: false }); C.add(M.boards, g, x, 0, 0.12, { rx: -a, k: 0.9, c: 0xb0a898 }); g.dispose(); } solid(C.rect(1.2, 2.55, 0, 0.6)); } });

  { // the church closing the street's west end: a clapboard nave, its gable to the street, a square tower and a spire, a fence of pickets, the graves beside it
    const C = chunk(T).at(-41.5, SZ / 2, Math.PI / 2), w = 7.4, h = 5.2, d = 13, wh = 0xdedad0;
    house(C, { w, h, d, mat: 'siding', c: wh, gable: 1, wins: [], door: 0, doorW: 1.5, doorH: 2.6, doorC: 0x5a5248, walk: false, tc: 0xc8c4ba });
    C.box(M.boards, 3.0, 0.14, 1.5, 0, -0.07, 0.8, { k: 0.8 }); C.box(M.boards, 3.4, 0.14, 0.4, 0, -0.2, 1.72, { k: 0.75 }); decks.push({ ...C.rect(-1.5, 1.5, 0, 1.55), y: 0 }, { ...C.rect(-1.7, 1.7, 1.52, 1.92), y: -0.13 });
    for (const s of [-1, 1]) for (const z of [-2.5, -6, -9.5]) { C.box(M.glass, 0.05, 2.2, 0.8, s * (w / 2 - 0.02), 2.7, z, { flat: 1 }); for (const e of [-1, 1]) C.box(M.boards, 0.06, 2.3, 0.09, s * (w / 2 + 0.01), 2.7, z + e * 0.45, { c: 0xc8c4ba }); C.box(M.boards, 0.07, 0.09, 1.05, s * (w / 2 + 0.01), 3.85, z, { c: 0xc8c4ba }); }
    const ty = h + w * 0.15 - 0.3; C.box(M.siding, 2.4, 4.2, 2.4, 0, ty + 1.5, -1.3, { c: wh, k: 0.95 }); for (const s of [-1, 1]) for (const e of [-1, 1]) C.box(M.boards, 0.2, 1.7, 0.2, s * 1.05, ty + 4.45, -1.3 + e * 1.05, { c: 0xc8c4ba }); C.box(M.boards, 2.7, 0.14, 2.7, 0, ty + 3.63, -1.3, { c: 0xc8c4ba, k: 0.8 }); C.box(M.boards, 2.7, 0.16, 2.7, 0, ty + 5.35, -1.3, { c: 0xc8c4ba, k: 0.8 });
    C.cyl(M.iron, 0.2, 0.42, 0.5, 0, ty + 4.7, -1.3, { seg: 8, k: 0.35 }); const sp = new THREE.ConeGeometry(1.9, 4.6, 4); sp.rotateY(Math.PI / 4); C.add(M.dark, sp, 0, ty + 7.7, -1.3, { k: 0.55 }); C.box(M.boards, 0.09, 1.2, 0.09, 0, ty + 10.5, -1.3, { c: 0xc8c4ba }); C.box(M.boards, 0.6, 0.09, 0.09, 0, ty + 10.7, -1.3, { c: 0xc8c4ba });
    for (let i = 0; i < 9; i++) { const gx = 6 + (i % 3) * 2.1 + rr(-0.3, 0.3), gz = -2 - (i / 3 | 0) * 2.6 + rr(-0.3, 0.3); if (i % 4 === 3) { C.box(M.plaster, 0.5, 0.75, 0.1, gx, 0.05, gz, { c: 0x8a877e, rz: rr(-0.08, 0.08), ry: Math.PI / 2 }); } else { C.box(M.boards, 0.07, 1.0, 0.05, gx, 0.2, gz, { rz: rr(-0.1, 0.1), c: 0xb0aa9c }); C.box(M.boards, 0.05, 0.07, 0.5, gx, 0.45, gz, { c: 0xb0aa9c }); } C.box(M.ground, 0.8, 0.16, 1.9, gx + 0.0, -0.27, gz - 1.0 + 1.0, { ry: Math.PI / 2, k: 0.8, c: 0x9a8c78 }); }
    for (let px = 4.6; px < 13; px += 0.2) { const ph = rr(0.8, 0.95); if (rnd() < 0.12) continue; C.box(M.boards, 0.07, ph, 0.02, px, ph / 2 - 0.3, 1.0, { c: 0xb8b2a4, rz: rr(-0.05, 0.05) }); } C.box(M.boards, 8.5, 0.06, 0.04, 8.8, 0.35, 0.97, { c: 0xb8b2a4 }); solid(C.rect(4.5, 13.1, 0.9, 1.1));
    rows.push(C.done());
  }
  // what stands in the street and at its ends
  PF('stagecoach', 9.4, SZ - 3.2, 0.25, 1, 1.3, 2.5); PF('lamp', -3.4, SZ + ST.walk + 0.6, 0, 1, 0.15); PF('lamp', -13.3, -ST.walk - 0.6, 0, 1, 0.15); PF('lamp', -27, SZ + ST.walk + 0.6, 0, 1, 0.15); PF('lamp', 16.9, -ST.walk - 0.6, 0, 1, 0.15);
  PF('tower', 31, 7, 0.4, 1, 1.5); PF('cottonwood', 33, SZ - 9, 1.0, 1.1, 0.5); PF('cottonwood', -47, 9, 2.4, 0.9, 0.5); PF('tumbleweed', -13.6, -ST.walk - 0.3, 0.5, 1.3); PF('tumbleweed', 6.6, SZ - 0.6, 1.5, 1.6); PF('tumbleweed', 27.5, -8.5, 2.5, 1.4); PF('barrel', 7.0, SZ - 1.2, 0.3, 1.25, 0.35); PF('barrel', 7.7, SZ - 1.0, 1.3, 1.25, 0.35); PF('freight', 12, SZ - 1.4, -0.4, 1, 0.75, 0.5);
  for (let i = 0; i < 7; i++) PF('telegraph', 46 + i * 8.15, SZ - 1.5 + i * 0.3, Math.PI / 2 + 0.035, 1);
  // ---- the ground: one sheet of dry earth out to the horizon, finer near the town; the street on it, cut by wheels and hooves
  { const n = 104, g = new THREE.PlaneGeometry(2, 2, n, n).rotateX(-Math.PI / 2), p = g.attributes.position, uv = g.attributes.uv, col = new Float32Array(p.count * 3);
    for (let i = 0; i < p.count; i++) { const u = p.getX(i), v = p.getZ(i), x = 84 * u + 640 * u ** 5 - 2, z = 84 * v + 640 * v ** 5 - 8; let y = land(x, z);
      const inS = Math.min(sm(TOWN.x0 + 2, TOWN.x0 + 5, x), sm(62, 59, x), sm(SZ + ST.walk - 0.4, SZ + ST.walk + 1.6, z), sm(-ST.walk + 0.4, -ST.walk - 1.6, z)); y -= inS * 0.45;
      p.setXYZ(i, x, y, z); uv.setXY(i, x / 4, z / 4); const k = 0.62 + 0.2 * Math.sin(x * 0.05 + z * 0.03) * Math.sin(z * 0.041) + 0.1 * Math.sin(x * 0.4 + 1) * Math.sin(z * 0.33); col.set([k, k * 0.97, k * 0.93], i * 3); }
    g.setAttribute('color', new THREE.BufferAttribute(col, 3)); g.computeVertexNormals(); const m = new THREE.Mesh(g, M.ground); m.receiveShadow = true; T.add(m);
    const X0 = TOWN.x0 + 1.5, X1 = 63, Z0 = SZ + ST.walk - 0.9, Z1 = -ST.walk + 0.9, nx = 62, nz = 104, s = new THREE.PlaneGeometry(1, 1, nx, nz).rotateX(-Math.PI / 2), sp = s.attributes.position, su = s.attributes.uv, sc = new Float32Array(sp.count * 3);
    const tracks = [[-7.3, 0.55, 0.043, 0.4], [-8.82, 0.55, 0.043, 0.4], [-12.4, 0.7, 0.031, 2.1], [-13.95, 0.7, 0.031, 2.1], [-16.1, 0.4, 0.06, 4], [-17.6, 0.4, 0.06, 4]];
    for (let i = 0; i < sp.count; i++) { const x = X0 + (sp.getX(i) + 0.5) * (X1 - X0), z = Z0 + (sp.getZ(i) + 0.5) * (Z1 - Z0), edge = Math.min(sm(X0, X0 + 3, x), sm(X1, X1 - 3, x), sm(Z0, Z0 + 0.7, z), sm(Z1, Z1 - 0.7, z)); let rut = 0;
      for (const [tz, amp, f, ph] of tracks) { const c = tz + amp * Math.sin(x * f + ph) + 0.25 * Math.sin(x * 0.19 + ph * 3), e = (z - c) / 0.17; rut += Math.exp(-e * e) - 0.35 * Math.exp(-(((Math.abs(z - c) - 0.36) / 0.2) ** 2)); }
      const hoof = 0.018 * Math.sin(x * 2.9 + z * 1.3) * Math.sin(z * 3.7 - x * 0.8) + 0.012 * Math.sin(x * 7.1) * Math.sin(z * 6.3), y = ST.low - 0.07 * (1 - edge) + edge * (0.012 - 0.055 * rut + hoof + 0.03 * Math.sin(x * 0.13) * Math.sin(z * 0.45));
      sp.setXYZ(i, x, y, z); su.setXY(i, x / 4, z / 4); const k = 0.5 - 0.16 * clamp(rut, -0.3, 1) * edge + 0.06 * Math.sin(x * 0.7 + z * 2.1); sc.set([k, k * 0.96, k * 0.92], i * 3); }
    s.setAttribute('color', new THREE.BufferAttribute(sc, 3)); s.computeVertexNormals(); const st = new THREE.Mesh(s, M.ground); st.receiveShadow = true; T.add(st); }

  // ---- the mesas and buttes on the horizon, built: a skirt of fallen rock, cliffs cut in flutes and ledges, a flat cap
  { const C = chunk(T), mesa = (cx, cz, rad, ht, long, turn, seed) => { const N2 = 30, lv = [[2.1, 0], [1.6, 0.16], [1.18, 0.38], [1.1, 0.42], [1.04, 0.7], [0.99, 0.72], [0.95, 1], [0.95, 1], [0, 1]], pos = [], uv = [], col = [], idx = [], nz2 = (a, k) => 1 + 0.22 * Math.sin(a * 2 + seed) + 0.12 * Math.sin(a * 5 + seed * 2.3) + (k > 1 && k < 8 ? 0.05 * Math.sin(a * 17 + seed + k) + 0.03 * Math.sin(a * 31 + k * 2) : 0);
      for (let k = 0; k < lv.length; k++) for (let i = 0; i <= N2; i++) { const a = i / N2 * Math.PI * 2, r = rad * lv[k][0] * nz2(a, k), lx = Math.cos(a) * r * long, lz = Math.sin(a) * r; pos.push(cx + lx * Math.cos(turn) - lz * Math.sin(turn), -9 + ht * lv[k][1] * (k > 5 ? 1 + 0.03 * Math.sin(a * 3 + seed) : 1), cz + lx * Math.sin(turn) + lz * Math.cos(turn)); uv.push(a * rad / 16, ht * lv[k][1] / 16); const c = k < 2 ? 0.72 : k % 2 ? 0.5 : 0.62; col.push(c, c * 0.95, c * 0.9); }
      for (let k = 0; k < lv.length - 1; k++) { if (k === 6) continue; for (let i = 0; i < N2; i++) { const a = k * (N2 + 1) + i, b = a + N2 + 1; idx.push(a, b, a + 1, a + 1, b, b + 1); } }
      const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2)); g.setAttribute('color', new THREE.Float32BufferAttribute(col, 3)); g.setIndex(idx); g.computeVertexNormals(); C.add(M.rock, g, 0, 0, 0, { flat: 1 }); g.dispose(); };
    for (const [a, dist, rad, ht, long] of [[200, 330, 60, 72, 2.2], [232, 420, 26, 95, 1], [246, 390, 12, 80, 1], [275, 520, 95, 110, 2.6], [305, 360, 34, 64, 1.4], [330, 470, 16, 100, 1], [352, 430, 70, 84, 1.8], [25, 380, 44, 70, 1.6], [58, 520, 110, 120, 2.4], [88, 340, 20, 88, 1], [102, 360, 11, 70, 1], [128, 450, 80, 90, 2], [160, 400, 30, 76, 1.2], [182, 560, 120, 130, 2]]) { const t = a * Math.PI / 180; mesa(Math.sin(t) * dist, -Math.cos(t) * dist - 10, rad, ht, long, rr(0, 3), a); }
    C.done(); for (const m of C.meshes) { m.userData.cast = false; m.receiveShadow = false; } }

  // ---- the sky: a dome that pales to the air's colour at the horizon, stars as points, the moon
  const sky = new THREE.Group(); T.add(sky);
  { const g = new THREE.SphereGeometry(1400, 32, 20), p = g.attributes.position, col = new Float32Array(p.count * 3); for (let i = 0; i < p.count; i++) { const e = clamp(p.getY(i) / 1400, -1, 1), k = Math.pow(1 - clamp(e, 0, 1), 5), md = _v.fromBufferAttribute(p, i).normalize().dot(MOON), mg = Math.pow(clamp(md, 0, 1), 6) * 0.012; col.set([0.007 + 0.017 * k + mg, 0.01 + 0.024 * k + mg * 1.1, 0.022 + 0.038 * k + mg * 1.3], i * 3); } g.setAttribute('color', new THREE.BufferAttribute(col, 3));
    const dome = new THREE.Mesh(g, new THREE.MeshBasicMaterial({ vertexColors: true, side: THREE.BackSide, fog: false, depthWrite: false })); dome.renderOrder = -3; sky.add(dome);
    const n = 1700, sp = new Float32Array(n * 3), sc = new Float32Array(n * 3); for (let i = 0; i < n; i++) { let v; do { v = _v.set(rr(-1, 1), rr(-0.05, 1), rr(-1, 1)); } while (v.lengthSq() > 1 || v.lengthSq() < 0.01); v.normalize(); if (i % 3 === 0) { const a = rr(0, 6.283), b = rr(-0.16, 0.16) * rr(0.2, 1); v.set(Math.cos(a), b, Math.sin(a)).applyAxisAngle(_s.set(0.3, 0, 0.95).normalize(), 1.0).normalize(); if (v.y < 0) v.y = -v.y; } sp.set([v.x * 1300, v.y * 1300, v.z * 1300], i * 3); const b = Math.pow(rnd(), 5) * 0.9 + 0.1, k = b * sm(0.0, 0.28, v.y) * (v.dot(MOON) > 0.985 ? 0 : 1), t = rnd(); sc.set([k * (0.85 + 0.15 * t), k * 0.9, k * (1 - 0.2 * t)], i * 3); }
    const sg = new THREE.BufferGeometry(); sg.setAttribute('position', new THREE.BufferAttribute(sp, 3)); sg.setAttribute('color', new THREE.BufferAttribute(sc, 3)); const stars = new THREE.Points(sg, new THREE.PointsMaterial({ size: 1.6, sizeAttenuation: false, vertexColors: true, fog: false, depthWrite: false, transparent: true, blending: THREE.AdditiveBlending })); stars.renderOrder = -2; stars.frustumCulled = false; sky.add(stars);
    const mc = document.createElement('canvas'); mc.width = mc.height = 256; const x = mc.getContext('2d'); x.fillStyle = '#d4d6d2'; x.beginPath(); x.arc(128, 128, 118, 0, 7); x.fill(); x.save(); x.clip(); for (let i = 0; i < 26; i++) { const bx = rr(30, 226), by2 = rr(30, 226), br = rr(10, 46), gr = x.createRadialGradient(bx, by2, 0, bx, by2, br); gr.addColorStop(0, `rgba(96,100,104,${rr(0.2, 0.5)})`); gr.addColorStop(1, 'rgba(96,100,104,0)'); x.fillStyle = gr; x.fillRect(0, 0, 256, 256); } const sh = x.createRadialGradient(214, 96, 60, 150, 120, 220); sh.addColorStop(0, 'rgba(0,0,0,0)'); sh.addColorStop(0.62, 'rgba(0,0,0,0)'); sh.addColorStop(0.8, 'rgba(2,3,6,.96)'); x.fillStyle = sh; x.fillRect(0, 0, 256, 256); x.restore();
    const mt = new THREE.CanvasTexture(mc); mt.colorSpace = THREE.SRGBColorSpace; const moon = new THREE.Mesh(new THREE.CircleGeometry(21, 40), new THREE.MeshBasicMaterial({ map: mt, transparent: true, fog: false, depthWrite: false, color: 0xb8c0cc })); moon.position.copy(MOON).multiplyScalar(1250); moon.lookAt(0, 0, 0); moon.renderOrder = -1; sky.add(moon); }

  // ---- light: the moon over the whole street (its shadows drawn once, nothing out here moves but people), the same moon through the saloon's windows, the porch lanterns, the forge's coals
  const sun = new THREE.DirectionalLight(0xa3afc4, 4.5); sun.position.copy(MOON).multiplyScalar(170).add(_v.set(-2, 0, -11)); sun.target.position.set(-2, 0, -11); T0.add(sun, sun.target);
  sun.shadow.mapSize.set(2048, 2048); Object.assign(sun.shadow.camera, { left: -58, right: 58, top: 56, bottom: -44, near: 40, far: 330 }); sun.shadow.bias = -0.0004; sun.shadow.normalBias = 0.06; sun.shadow.autoUpdate = false;
  Promise.resolve().then(() => { sun.castShadow = true; });   // after the page has listed the lamps whose shadows it may drop when frames run long: without this one the moon would shine through the roof
  // the moon's shadows are drawn once (and once more when the street's things have come): the street throws shadows for that one frame only, so the room's lamps never draw it into theirs
  let bake = 1; const casts = (on) => T.traverse((o) => { if (o.userData.cast) o.castShadow = on; });
  const moonIn = new THREE.SpotLight(0x8fa4d0, 300, 44, 0.4, 0.5, 1.4); moonIn.position.copy(MOON).multiplyScalar(21); moonIn.target.position.set(0, 0, 4.2); moonIn.castShadow = true; moonIn.shadow.mapSize.set(1024, 1024); moonIn.shadow.bias = -0.002; moonIn.shadow.camera.near = 6; moonIn.shadow.camera.far = 36; T0.add(moonIn, moonIn.target);
  const porchL = new THREE.PointLight(0xffc48a, 2.2, 9, 2); porchL.position.set(0, 2.45, -0.75); T0.add(porchL);
  const forgeL = new THREE.PointLight(0xff5a20, 1.1, 6, 2); forgeL.position.set(-16.7, 0.75, SZ - 1.3); T0.add(forgeL);

  // ---- the desert's own: scrub, cactus and rock scattered by one rule (thicker away from the town, none on the street), each kind one drawn thing
  const far = [], open = (x, z, pad = 3) => x < TOWN.x0 + 6 - pad || x > TOWN.x1 - 4 + pad || z < TOWN.z0 + 2 - pad || z > TOWN.z1 - 4 + pad;
  const scatter = (n, r0, r1, keep) => { const L = []; let guard = 0; while (L.length < n && guard++ < n * 40) { const a = rr(0, 6.283), r = r0 + (r1 - r0) * Math.pow(rnd(), 0.6), x = Math.cos(a) * r - 2, z = Math.sin(a) * r - 10; if (!open(x, z) || (Math.abs(z - SZ / 2) < 7 && x > 0 && x < 170) || (keep && !keep(x, z))) continue; L.push([x, z]); } return L; };
  const inst = (geo, mat, L, f, cast = true) => { const im = new THREE.InstancedMesh(geo, mat, L.length); L.forEach(([x, z], i) => { const o = f(x, z, i); _l.compose(_v.set(x, land(x, z) - (o.sink || 0), z), _q.setFromEuler(_e.set(o.rx || 0, rr(0, 6.283), o.rz || 0)), _s.set(o.s * (o.sx || 1), o.s * (o.sy || 1), o.s)); im.setMatrixAt(i, _l); }); im.userData.cast = cast; im.receiveShadow = true; im.instanceMatrix.needsUpdate = true; T.add(im); far.push(im); return im; };
  { const parts = [], cols = []; for (let k = 0; k < 3; k++) { const g = new THREE.IcosahedronGeometry(0.34, 0).toNonIndexed(), p = g.attributes.position; for (let i = 0; i < p.count; i++) { _v.fromBufferAttribute(p, i); const j = 0.75 + 0.5 * Math.abs(Math.sin(_v.x * 37 + _v.y * 17 + _v.z * 29 + k)); p.setXYZ(i, _v.x * j * 1.2 + (k - 1) * 0.3, Math.max(0, _v.y * j * 0.85 + 0.2), _v.z * j * 1.2 + (k % 2) * 0.25); } parts.push(g); }
    const g = new THREE.BufferGeometry(), pos = [], uv = []; for (const q of parts) { pos.push(...q.attributes.position.array); for (let i = 0; i < q.attributes.position.count; i++) { const c = 0.2 + 0.1 * Math.sin(i * 1.7); cols.push(c * 0.92, c, c * 0.8); uv.push(0, 0); } } g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('color', new THREE.Float32BufferAttribute(cols, 3)); g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2)); g.computeVertexNormals();
    inst(g, M.prop, scatter(360, 30, 230, (x, z) => Math.sin(x * 0.045 + 1) * Math.sin(z * 0.05 + 2) + rnd() * 0.9 > 0.35), () => ({ s: rr(0.7, 1.7), sy: rr(0.7, 1.2), sink: 0.05 }), false); }
  for (const [name, n, r0, r1, s0, s1] of [['namaqualand_boulder_02', 14, 34, 190, 0.7, 3.2], ['namaqualand_boulder_05', 12, 30, 170, 0.5, 2.4]]) { const src = model(name, 0, 0, 0, 0, { h: 1 }); src.updateMatrixWorld(true); let ms = null; src.traverse((q) => { if (q.isMesh && !ms) ms = q; }); if (!ms) continue; const g = ms.geometry.clone().applyMatrix4(ms.matrixWorld); g.deleteAttribute('tangent'); g.setAttribute('color', new THREE.BufferAttribute(new Float32Array(g.attributes.position.count * 3).fill(0.75), 3));
    const L = scatter(n, r0, r1); inst(g, phMat(ms.material), L, () => ({ s: rr(s0, s1), sy: rr(0.6, 1), sink: 0.15, rx: rr(-0.2, 0.2) })); L.forEach(([x, z]) => { if (Math.hypot(x, z + 10) < ST.far + 6) solid({ x0: x - 0.5, x1: x + 0.5, z0: z - 0.5, z1: z + 0.5 }); }); }
  for (const [x, z, ry] of [[-37, SZ - 12, 0.5], [39, 20, 2]]) { const C = chunk(T); C.ph('dead_tree_trunk', x, land(x, z) - 0.1, z, ry, { h: 2.6, k: 0.7 }); C.ph('tree_stump_01', x + 3, land(x + 3, z + 2) - 0.05, z + 2, ry, { h: 0.5, k: 0.7 }); rows.push(C.done()); solid({ x0: x - 0.5, x1: x + 0.5, z0: z - 0.5, z1: z + 0.5 }); }

  // ---- Polyfork's frontier things (data/saloon/town.json): the wagons, horses, lamps and poles as three meshes along the street, the cactus and sage as one each
  fetch(`${BASE}town.json`).then((r) => r.json()).then((D) => {
    const geo = {}, mk = (k) => { if (geo[k]) return geo[k]; const d = D.props[k]; if (!d) return null; const bin = (s) => Uint8Array.from(atob(s), (c) => c.charCodeAt(0)), q = new Int16Array(bin(d.p).buffer), c = bin(d.c), P = new Float32Array(q.length), Cc = new Float32Array(q.length); for (let i = 0; i < q.length; i++) { const a = i % 3; P[i] = d.b[a] + (q[i] + 32768) / 65535 * (d.b[a + 3] - d.b[a]); Cc[i] = Math.pow(c[i] / 255, 2.2) * 0.5; }
      const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(P, 3)); g.setAttribute('color', new THREE.BufferAttribute(Cc, 3)); g.setAttribute('uv', new THREE.BufferAttribute(new Float32Array(q.length / 3 * 2), 2)); g.computeVertexNormals(); return (geo[k] = g); };
    const C3 = [chunk(T), chunk(T), chunk(T)]; for (const p of props) { const g = mk(p.name); if (g) C3[p.x < -11 ? 0 : p.x < 13 ? 1 : 2].add(M.prop, g, p.x, p.y ?? (open(p.x, p.z, 0) ? land(p.x, p.z) : Math.abs(p.z + ST.walk / 2) < ST.walk / 2 || Math.abs(p.z - SZ - ST.walk / 2) < ST.walk / 2 ? 0 : ST.low), p.z, { ry: p.ry, s: p.s, flat: 1 }); }
    for (const c of C3) rows.push(c.done());
    for (const p of props) if (p.name === 'lamp') { const C = C3[0]; C.box(M.lit, 0.05, 0.09, 0.05, p.x, 2.78 + ST.low, p.z, { flat: 1, c: new THREE.Color(1.3, 0.72, 0.3) }); } C3[0].done();
    if (mk('saguaro')) inst(mk('saguaro'), M.prop, scatter(15, 40, 210), () => ({ s: rr(0.8, 1.7), sink: 0.1 }));
    if (mk('sage')) inst(mk('sage'), M.prop, [...scatter(12, 26, 70), [-46, -3], [47, -4], [44, -17], [29.5, 3], [-36, 16]], () => ({ s: rr(0.9, 1.5), sink: 0.04 }), false);
    bake = 1;
  }).catch((e) => console.warn('the street things did not load', e));

  // ---- where you may walk: out of the saloon's door, the boardwalks, the street, a little way into the desert; your eyes follow the ground
  const inside = { ...BOUNDS }, camP = new THREE.Vector3(), fwd = new THREE.Vector3(), holesW = [[0, 1.25], ...FRAME.win.map((x) => [x, 1.95])].map(([x, y]) => { const p = toWorld(x, -0.06); return new THREE.Vector3(p.x, y, p.z); });
  Object.assign(BOUNDS, { minX: -1e4, maxX: 1e4, minZ: -1e4, maxZ: 1e4 });
  const groundAt = (x, z) => { if (z > -0.3 && Math.abs(x) < HW + 0.2) return 0; let y = null; for (const d of decks) if (x >= d.x0 && x <= d.x1 && z >= d.z0 && z <= d.z1) y = Math.max(y ?? -9, d.y); return y ?? land(x, z); };
  let footY = 0, wasIn = true;
  const town = { group: T0, drawn: T, moon: moonIn, sun, frame: FRAME, toWorld, toStreet, land, groundAt, decks, haze: HZ, isInside: () => wasIn,
    update(dt, t) {
      const rig = G.rig; G.camera.getWorldPosition(camP); const p = toStreet(camP.x, camP.z), isIn = p.z > 0.02 && Math.abs(p.x) < HW + 0.3; wasIn = isIn;
      if (G.mode === 'desktop' || G.mode === 'vr') {
        if (isIn) { const nx = clamp(camP.x, inside.minX, FRAME.ry ? 1e4 : inside.maxX), nz = clamp(camP.z, FRAME.ry ? inside.minZ : -1e4, inside.maxZ); rig.position.x += nx - camP.x; rig.position.z += nz - camP.z; }
        else { const d = Math.hypot(p.x, p.z + 11); if (d > ST.far) { const k = (d - ST.far) / d * Math.min(1, dt * 8), w = toWorld(p.x * (1 - k), (p.z + 11) * (1 - k) - 11); rig.position.x += w.x - camP.x; rig.position.z += w.z - camP.z; } }
        footY += (groundAt(p.x, p.z) - footY) * Math.min(1, dt * 9); rig.position.y = Math.abs(footY) < 1e-3 ? 0 : footY;
      }
      // from inside, the street is drawn only while a window or the doorway is before your eyes
      if (isIn) { G.camera.getWorldDirection(fwd); let see = false; for (const h of holesW) { _v.copy(h).sub(camP); const d = _v.length(); if (d < 2.6 || _v.dot(fwd) / d > 0.2) { see = true; break; } } T.visible = see; } else T.visible = true;
      forgeL.intensity = 1.0 + 0.25 * Math.sin(t * 2.3) * Math.sin(t * 5.1);
      if (bake === 2) { casts(false); bake = 0; } else if (bake === 1 && sun.castShadow) { casts(true); T.visible = true; sun.shadow.needsUpdate = true; bake = 2; }
    } };
  if (!G.camera.userData.townFar) { G.camera.userData.townFar = 1; G.camera.far = 1700; G.camera.updateProjectionMatrix(); }
  return town;
}
