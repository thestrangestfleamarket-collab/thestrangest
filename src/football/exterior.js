// FOURTH & LONG's stadium from outside: the outer walls with their rows of windows and gates, corner towers, a roof on trusses and cables over the upper seats. Nothing stands round it (owner, 26 Nov 2026: the field floats in the air). Its surfaces are COLD BORE's photographed ones (/sniper-assets/tex/)
import * as THREE from 'three';
import { KIT } from './players.js';

const TEX = '/sniper-assets/tex/', FLOOR = 3.6, BAY = 3.4;
// a mesh built quad by quad, with the picture laid by the metre, not stretched
class Quads { constructor() { this.p = []; this.u = []; this.i = []; this.n = 0; }
  quad(a, b, c, d, u, v) { this.p.push(...a, ...b, ...c, ...d); this.u.push(0, 0, u, 0, u, v, 0, v); this.i.push(this.n, this.n + 1, this.n + 2, this.n, this.n + 2, this.n + 3); this.n += 4; }
  // an upright box's four walls (su, sv: yards to one turn of the picture) and, on another mesh, its roof
  box(x, z, w, d, y0, h, ry, su, sv, roof) { const c = Math.cos(ry), s = Math.sin(ry), P = (lx, y, lz) => [x + lx * c + lz * s, y, z - lx * s + lz * c], hw = w / 2, hd = d / 2, y1 = y0 + h;
    const W = [[-hw, hd, hw, hd, w], [hw, hd, hw, -hd, d], [hw, -hd, -hw, -hd, w], [-hw, -hd, -hw, hd, d]]; for (const [ax, az, bx, bz, len] of W) this.quad(P(ax, y0, az), P(bx, y0, bz), P(bx, y1, bz), P(ax, y1, az), len / su, h / sv);
    if (roof) roof.quad(P(-hw, y1, hd), P(hw, y1, hd), P(hw, y1, -hd), P(-hw, y1, -hd), w / 8, d / 8); }
  flat(x, z, w, d, y, ry, su, sv) { const c = Math.cos(ry), s = Math.sin(ry), P = (lx, lz) => [x + lx * c + lz * s, y, z - lx * s + lz * c]; this.quad(P(-w / 2, d / 2), P(w / 2, d / 2), P(w / 2, -d / 2), P(-w / 2, -d / 2), w / su, d / sv); }
  mesh(mat) { const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(this.p, 3)); g.setAttribute('uv', new THREE.Float32BufferAttribute(this.u, 2)); g.setIndex(this.i); g.computeVertexNormals(); const m = new THREE.Mesh(g, mat); m.frustumCulled = false; return m; } }
const load = (name, rep = true) => { const t = new THREE.TextureLoader().load(TEX + name + '.jpg'); t.colorSpace = THREE.SRGBColorSpace; if (rep) t.wrapS = t.wrapT = THREE.RepeatWrapping; t.anisotropy = 4; return t; };
// a wall of windows, four by four: each a recess with a shaded head and a lit sill, drawn over a photographed wall; and the same sheet with only the windows that are lit at night
function facade(photo, o) {
  const mk = () => { const c = document.createElement('canvas'); c.width = c.height = 512; return c; }, day = mk(), night = mk(), g = day.getContext('2d'), n = night.getContext('2d'), t = new THREE.CanvasTexture(day), e = new THREE.CanvasTexture(night); let s = o.seed || 3; const R = () => (s = (s * 16807) % 2147483647) / 2147483647;
  const draw = (img) => { g.fillStyle = o.wall; g.fillRect(0, 0, 512, 512); if (img) { g.globalAlpha = o.mix ?? 0.85; g.drawImage(img, 0, 0, 512, 512); g.globalAlpha = 1; g.fillStyle = o.tint || 'rgba(0,0,0,0)'; g.fillRect(0, 0, 512, 512); } n.fillStyle = '#000'; n.fillRect(0, 0, 512, 512);
    for (let j = 0; j < 4; j++) { if (o.band) { g.fillStyle = 'rgba(0,0,0,.25)'; g.fillRect(0, j * 128 + 122, 512, 6); g.fillStyle = 'rgba(255,255,255,.18)'; g.fillRect(0, j * 128, 512, 4); }
      for (let i = 0; i < 4; i++) { const x = i * 128 + (o.wide ? 8 : 34), y = j * 128 + (o.tall ? 14 : 30), w = o.wide ? 112 : 60, h = o.tall ? 100 : 72; g.fillStyle = '#1b2530'; g.fillRect(x, y, w, h); const gl = g.createLinearGradient(x, y, x + w, y + h); gl.addColorStop(0, o.glass || '#3a5068'); gl.addColorStop(1, '#16202c'); g.fillStyle = gl; g.fillRect(x + 4, y + 6, w - 8, h - 10);
        g.fillStyle = 'rgba(0,0,0,.55)'; g.fillRect(x, y, w, 7); g.fillStyle = 'rgba(0,0,0,.3)'; g.fillRect(x, y, 5, h); g.fillStyle = 'rgba(255,255,255,.4)'; g.fillRect(x - 3, y + h, w + 6, 5); g.fillStyle = 'rgba(255,255,255,.12)'; g.fillRect(x + w / 2 - 1, y + 6, 2, h - 10);
        if (R() < (o.lit ?? 0.4)) { n.fillStyle = ['#ffd890', '#fff0c8', '#cfe4ff'][Math.floor(R() * 3)]; n.globalAlpha = 0.5 + R() * 0.5; n.fillRect(x + 4, y + 6, w - 8, h - 10); n.globalAlpha = 1; } } }
    t.needsUpdate = e.needsUpdate = true; };
  draw(null); if (photo) new THREE.ImageLoader().load(TEX + photo + '.jpg', draw); for (const q of [t, e]) { q.wrapS = q.wrapT = THREE.RepeatWrapping; q.colorSpace = THREE.SRGBColorSpace; q.anisotropy = 4; }
  return new THREE.MeshLambertMaterial({ map: t, emissiveMap: e, emissive: 0xffffff, emissiveIntensity: 0 });
}
const paint = (w, h, draw, rx = 1, ry = 1) => { const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(rx, ry); t.anisotropy = 4; return t; };

// S: the stadium's group; sides: its four banks (z+, z-, x+, x-: a bank's own wall, roof and gates go with it when it is hidden)
export function buildExterior(S, sides, o = {}) {
  const lean = !!o.lean, X = { lit: [], t: 0 }; let seed = 77; const R = () => (seed = (seed * 16807) % 2147483647) / 2147483647, add = (m, p = S) => { p.add(m); return m; };
  const dimmed = [], lam = (opt) => { const m = new THREE.MeshLambertMaterial(opt); m.userData.c = m.color.clone(); dimmed.push(m); return m; }, M = { stadium: facade('painted_concrete_d', { wall: '#b9b6ae', band: 1, tall: 1, wide: 1, glass: '#4d6a86', lit: 0.7, seed: 5 }), brick: facade('brick_wall_001_d', { wall: '#8a4a38', lit: 0.2, seed: 9 }), plaster: facade('grey_plaster_02_d', { wall: '#b8b2a4', lit: 0.22, band: 1, seed: 21 }), glass: facade(null, { wall: '#2b3a4c', wide: 1, tall: 1, glass: '#5f88ad', band: 1, lit: 0.4, seed: 33 }) };
  X.lit.push(...Object.values(M)); const roofM = lam({ map: load('corrugated_iron_d'), color: 0x9aa0a6 }), gravel = lam({ map: load('concrete_floor_02_d'), color: 0x8c8a86 }), steel = lam({ color: 0x5c6168 }), dark = lam({ color: 0x1c1f24 });
  // the stadium's own outside: behind each bank a wall of windows over a row of gates, a roof over the long sides; towers at the corners
  const BANK = [[132, 73, 30], [132, 73, 30], [84, 98.6, 23], [84, 98.6, 23]];
  sides.forEach((g, bi) => { const [len, z0, h] = BANK[bi], q = new Quads(), rf = new Quads(), gates = new Quads(); q.box(0, z0 + 2.5, len + 10, 5, 0, h, 0, BAY * 4, FLOOR * 4 * 1.4, rf); add(q.mesh(M.stadium), g);
    for (let x = -len / 2 + 8; x < len / 2 - 4; x += 16) { gates.flat(x, z0 + 5.06, 6, 5.5, 0, 0, 6, 5.5); } const gm = gates.mesh(dark); gm.geometry.rotateX(0); add(gm, g); gm.visible = false;
    for (let x = -len / 2 + 8; x < len / 2 - 4; x += 16) { const d = add(new THREE.Mesh(new THREE.PlaneGeometry(6.5, 6), dark), g); d.position.set(x, 3, z0 + 5.05); const a = add(new THREE.Mesh(new THREE.BoxGeometry(8, 0.5, 3), new THREE.MeshLambertMaterial({ color: KIT[bi % 2].jersey })), g); a.position.set(x, 6.4, z0 + 6.3); }   // a gate and its awning
    if (bi < 2) { rf.flat(0, z0 - 8, len + 10, 26, h + 3, 0, 8, 8); for (let x = -len / 2; x <= len / 2; x += 12) { const t = add(new THREE.Mesh(new THREE.BoxGeometry(0.5, 1.6, 27), steel), g); t.position.set(x, h + 2.1, z0 - 8); const p = add(new THREE.Mesh(new THREE.BoxGeometry(0.7, 12, 0.7), steel), g); p.position.set(x, h + 6, z0 + 4.2); }
      const w = []; for (let x = -len / 2; x <= len / 2; x += 12) w.push(x, h + 12, z0 + 4.2, x, h + 3.1, z0 - 20, x, h + 12, z0 + 4.2, x, h + 3.1, z0 - 6); const wg = new THREE.BufferGeometry(); wg.setAttribute('position', new THREE.Float32BufferAttribute(w, 3)); add(new THREE.LineSegments(wg, new THREE.LineBasicMaterial({ color: 0x2a2d32 })), g); }   // the roof's cables from its masts
    add(rf.mesh(roofM), g); });
  X.towers = [[1, 1], [1, -1], [-1, 1], [-1, -1]].map(([sx, sz]) => { const g = new THREE.Group(); g.position.set(sx * 86, 0, sz * 62); S.add(g); const t = add(new THREE.Mesh(new THREE.CylinderGeometry(13, 13, 34, 12, 1, true), M.stadium.clone()), g); t.material.map = M.stadium.map; t.position.y = 17; const uv = t.geometry.attributes.uv; for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * 6, uv.getY(i) * 2.4); X.lit.push(t.material);
    const cap = add(new THREE.Mesh(new THREE.ConeGeometry(14.5, 5, 12), roofM), g); cap.position.y = 36.5; const pole = add(new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 9, 5), steel), g); pole.position.y = 43; const f = add(new THREE.Mesh(new THREE.PlaneGeometry(5, 3).translate(2.5, 0, 0), new THREE.MeshBasicMaterial({ color: KIT[(sx * sz > 0) ? 0 : 1].jersey, side: THREE.DoubleSide })), g); f.position.y = 46; (X.flags ||= []).push(f); g.userData.s = [sz > 0 ? 0 : 1, sx > 0 ? 2 : 3]; return g; });
  // night: the windows that are lit, the lamps' heads and their pools on the ground
  X.set = (night) => { for (const m of X.lit) { m.emissiveIntensity = night * 0.5; m.color.setScalar(1 - 0.82 * night); } for (const m of dimmed) m.color.copy(m.userData.c).multiplyScalar(1 - 0.85 * night);   // the floodlights are the stadium's: by night the district keeps only its own lamps and windows
    };
  X.update = (dt, time, vis, wind) => { X.towers.forEach(t => { t.visible = vis[t.userData.s[0]] && vis[t.userData.s[1]]; }); for (const f of X.flags) f.rotation.y = Math.sin(time * 2.4 + f.parent.position.x) * 0.3 * (0.3 + wind) + 0.5;
  };
  return X;
}
function mergeTwo(a, b) { a = a.toNonIndexed(); b = b.toNonIndexed(); const g = new THREE.BufferGeometry(); for (const k of ['position', 'normal', 'uv']) { const A = a.attributes[k].array, B2 = b.attributes[k].array, o = new Float32Array(A.length + B2.length); o.set(A); o.set(B2, A.length); g.setAttribute(k, new THREE.BufferAttribute(o, a.attributes[k].itemSize)); } return g; }
