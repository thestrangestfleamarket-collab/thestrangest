// the block's ground, downtown New York in 1985: concrete flags, granite kerbs standing a hand above the gutter, coarse asphalt patched and seamed with tar, a worn lane line, crosswalks and stop lines at both avenues, manhole covers and storm drains as real things, puddles that mirror the street while it rains
import * as THREE from 'three';
import { box } from './ctx.js';
import * as T from './tex.js';
import { strew } from './models.js';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { NZ, KERB, FKERB, FZ, W0, E0, ROAD, AX0, AX1, WX0, WX1, SUB, VENT } from './plan.js';

export function buildRoad(X) {
  const { city, real, flat, ups } = X, R = T.rng(851), MID = (KERB + FKERB) / 2;
  const paveM = real('paving', 2.4, 0xa4a8ae, { grime: 0.45 }), kerbM = real('concrete', 2, 0xb4b2aa, { grime: 0.3, bomb: 0 }), roadM = real('asphalt_road', 3.4, 0xffffff, { grime: 0.2 }); roadM.color.setRGB(1.75, 1.75, 1.85);   // (the photograph is of fresh black tar: this street's has had twenty summers)
  const slab = (x0, x1, z0, z1, m, y) => { const b = box(x1 - x0, 0.4, z1 - z0, m, (x0 + x1) / 2, y - 0.2, (z0 + z1) / 2, city); b.castShadow = false; return b; };
  // ---- the pavements: the cart's, the one across (round the subway stair's well), the avenues' at each corner and along their far sides
  slab(WX1, AX0, KERB, NZ, paveM, 0);
  slab(WX1, SUB.x0, FZ, FKERB, paveM, 0); slab(SUB.x1, AX0, FZ, FKERB, paveM, 0); slab(SUB.x0, SUB.x1, FZ, SUB.z0, paveM, 0); slab(SUB.x0, SUB.x1, SUB.z1, FKERB, paveM, 0);
  for (const [x0, x1] of [[E0, AX0], [WX1, W0]]) { slab(x0, x1, NZ, NZ + 150, paveM, 0); slab(x0, x1, FZ - 150, FZ, paveM, 0); }
  slab(AX1, AX1 + 5, -150, 150, paveM, 0); slab(WX0 - 5, WX0, -150, 150, paveM, 0);
  // ---- the asphalt: the street and the two avenues
  slab(WX1, AX0, FKERB, KERB, roadM, ROAD); slab(AX0, AX1, -150, 150, roadM, ROAD); slab(WX0, WX1, -150, 150, roadM, ROAD);
  // ---- the kerbs: granite, their tops level with the flags, their faces down to the gutter
  const kerb = (x0, z0, x1, z1) => { const along = Math.abs(x1 - x0) > Math.abs(z1 - z0), len = Math.hypot(x1 - x0, z1 - z0), k = box(along ? len : 0.17, 0.24, along ? 0.17 : len, kerbM, (x0 + x1) / 2, -0.115, (z0 + z1) / 2, city); k.castShadow = false; };
  kerb(WX1, KERB - 0.085, AX0, KERB - 0.085); kerb(WX1, FKERB + 0.085, AX0, FKERB + 0.085);
  for (const [x, e] of [[AX0, 1], [WX1, -1]]) { kerb(x + e * 0.085, KERB, x + e * 0.085, 150); kerb(x + e * 0.085, -150, x + e * 0.085, FKERB); }
  kerb(AX1 - 0.085, -150, AX1 - 0.085, 150); kerb(WX0 + 0.085, -150, WX0 + 0.085, 150);
  // ---- what is on the asphalt, all one drawing: tar seams, patches old and new, cracks, oil under the parked cars, the paint
  const at = T.canvasTex(1024, 1024, (g, w, h) => { g.clearRect(0, 0, w, h); const RR = T.rng(85), old = T.photoImg('asphalt_old'), road = T.photoImg('asphalt_road');
    const soft = (x, y, ww, hh, e = 10) => { g.globalCompositeOperation = 'destination-out'; for (const [x0, y0, x1, y1, rx, ry, rw, rh] of [[0, y, 0, y + e, x, y, ww, e], [0, y + hh, 0, y + hh - e, x, y + hh - e, ww, e], [x, 0, x + e, 0, x, y, e, hh], [x + ww, 0, x + ww - e, 0, x + ww - e, y, e, hh]]) { const gd = g.createLinearGradient(x0, y0, x1, y1); gd.addColorStop(0, 'rgba(0,0,0,1)'); gd.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = gd; g.fillRect(rx, ry, rw, rh); } g.globalCompositeOperation = 'source-over'; };   // a region's edges faded out
    // two tar seams (0,0)-(1024,64) and (0,64)-(1024,128): a poured line, wandering, beaded
    for (const [y0, wd] of [[32, 10], [96, 6]]) { g.strokeStyle = 'rgba(10,10,12,0.94)'; g.lineCap = 'round'; g.lineJoin = 'round'; g.lineWidth = wd; g.beginPath(); g.moveTo(10, y0); for (let x = 26; x <= w - 10; x += 16) g.lineTo(x, y0 + Math.sin(x * 0.021 + y0) * 7 + (RR() - 0.5) * 7); g.stroke(); for (let i = 0; i < 40; i++) { g.fillStyle = 'rgba(10,10,12,0.85)'; g.beginPath(); g.arc(10 + RR() * (w - 20), y0 + (RR() - 0.5) * 16, 1.5 + RR() * 4.5, 0, 7); g.fill(); } }
    // a new patch (0,128) 384x256: darker asphalt, a tar line round it; an old one (384,128) 384x256: paler, cracked
    if (road) g.drawImage(road, 0, 0, 384, 256, 0, 128, 384, 256); g.fillStyle = 'rgba(8,8,12,0.55)'; g.fillRect(0, 128, 384, 256); soft(0, 128, 384, 256, 8); g.strokeStyle = 'rgba(8,8,10,0.9)'; g.lineWidth = 5; g.beginPath(); g.moveTo(14, 142); for (const [x, y] of [[370, 140], [372, 370], [12, 372], [14, 142]]) g.lineTo(x + (RR() - 0.5) * 6, y + (RR() - 0.5) * 6); g.stroke();
    if (old) g.drawImage(old, 0, 0, 384, 256, 384, 128, 384, 256); else { g.fillStyle = '#6a6a70'; g.fillRect(384, 128, 384, 256); } g.fillStyle = 'rgba(20,20,26,0.3)'; g.fillRect(384, 128, 384, 256); soft(384, 128, 384, 256, 26);
    // the paint: a white dash (768,128) 256x64, a yellow one (768,192), a crosswalk's line (768,256) 256x128: all worn through
    const paint = (x, y, ww, hh, col, wear) => { g.fillStyle = col; g.fillRect(x + 4, y + 6, ww - 8, hh - 12); g.globalCompositeOperation = 'destination-out'; for (let i = 0; i < wear; i++) { g.globalAlpha = 0.25 + RR() * 0.6; g.beginPath(); g.ellipse(x + RR() * ww, y + RR() * hh, 2 + RR() * 16, 1 + RR() * 5, RR() * 0.6 - 0.3, 0, 7); g.fill(); } g.globalAlpha = 1; g.globalCompositeOperation = 'source-over'; };
    paint(768, 128, 256, 64, 'rgba(214,210,196,0.9)', 90); paint(768, 192, 256, 64, 'rgba(196,160,40,0.88)', 90); paint(768, 256, 256, 128, 'rgba(210,206,192,0.9)', 190);
    // oil (0,384) 256x256, cracks (256,384) 512x256
    for (let i = 0; i < 9; i++) { const x = 128 + (RR() - 0.5) * 120, y = 512 + (RR() - 0.5) * 120, r = 20 + RR() * 60, gd = g.createRadialGradient(x, y, 0, x, y, r); gd.addColorStop(0, 'rgba(6,6,8,0.75)'); gd.addColorStop(1, 'rgba(6,6,8,0)'); g.fillStyle = gd; g.fillRect(x - r, y - r, 2 * r, 2 * r); }
    g.strokeStyle = 'rgba(8,8,10,0.85)'; for (let i = 0; i < 7; i++) { g.lineWidth = 1 + RR() * 2.2; g.beginPath(); let x = 280 + RR() * 460, y = 400 + RR() * 220, a = RR() * 6.28; g.moveTo(x, y); for (let k = 0; k < 16; k++) { a += (RR() - 0.5) * 1.2; x = Math.min(752, Math.max(270, x + Math.cos(a) * (10 + RR() * 22))); y = Math.min(626, Math.max(398, y + Math.sin(a) * (10 + RR() * 22))); g.lineTo(x, y); } g.stroke(); } });
  at.anisotropy = 8;
  const gs = [], dec = ([u, v, uw, vh], x, z, w, d, rot = 0, y = ROAD + 0.006) => { const g = new THREE.PlaneGeometry(w, d).rotateX(-Math.PI / 2).rotateY(rot).translate(x, y, z), uv = g.attributes.uv; for (let i = 0; i < uv.count; i++) uv.setXY(i, (u + uv.getX(i) * uw) / 1024, 1 - (v + (1 - uv.getY(i)) * vh) / 1024); gs.push(g.toNonIndexed()); };
  const line = (reg, x, z, len, wid, alongZ) => dec(reg, x, z, len, wid, alongZ ? Math.PI / 2 : 0);
  const SEAM = [0, 0, 1024, 64], SEAM2 = [0, 64, 1024, 64], NEW = [0, 128, 384, 256], OLD = [384, 128, 384, 256], WHITE = [768, 128, 256, 64], YEL = [768, 192, 256, 64], BAR = [768, 256, 256, 128], OIL = [0, 384, 256, 256], CRACK = [256, 384, 512, 256];
  for (const [x, z, w, d] of [[-14.5, MID + 1.4, 3.6, 1.7], [6.5, MID - 1.9, 2.6, 2.1], [19.5, MID + 0.6, 4.4, 1.5]]) dec(NEW, x, z, w, d, (R() - 0.5) * 0.08);   // the gas and water men's cuts
  for (const [x, z, w, d] of [[-4, MID - 0.4, 5.5, 3.0], [13, MID + 1.6, 4.2, 2.6], [-22, MID - 1.2, 5, 2.8]]) dec(OLD, x, z, w, d, (R() - 0.5) * 0.2);
  for (let x = WX1 + 4; x < AX0 - 6; x += 11.6) dec(R() < 0.5 ? SEAM : SEAM2, x + 5.8, MID + 2.25 + (R() - 0.5) * 0.2, 11.8, 0.6, (R() - 0.5) * 0.02);   // a trench down the far lane, sealed
  for (const x of [-18.2, 1.2, 15.4]) dec(SEAM2, x, MID, KERB - FKERB - 0.6, 0.5, Math.PI / 2 + (R() - 0.5) * 0.05);
  for (let i = 0; i < 6; i++) dec(CRACK, WX1 + 6 + R() * (AX0 - WX1 - 12), FKERB + 1.4 + R() * (KERB - FKERB - 2.8), 3.2 + R() * 2, 1.6 + R(), R() * 3.1);
  for (const z of [KERB - 1.25, FKERB + 1.25]) for (let x = WX1 + 5; x < AX0 - 4; x += 5.8) if (R() < 0.75) dec(OIL, x + R() * 2, z + (R() - 0.5) * 0.4, 0.9 + R() * 0.9, 0.7 + R() * 0.7, R() * 3);
  for (let x = W0 + 3; x < E0 - 3; x += 7.4) dec(WHITE, x, MID - 0.05, 3.1, 0.2);   // the lane's line, worn by twenty winters
  // each avenue: its lane lines, a crosswalk over the street's mouth, crosswalks over the avenue in line with both pavements, the street's stop line
  for (const [a0, a1, m0, m1, stop] of [[AX0, AX1, E0, AX0, null], [WX0, WX1, WX1, W0, W0 + 0.9]]) {
    for (let z = -148; z < 150; z += 9) for (const k of [1, 2]) { if (z > FZ - 2 && z < NZ + 2) continue; line(k === 1 ? WHITE : YEL, a0 + (a1 - a0) * k / 3, z, 3.2, 0.18, true); }
    for (const x of [m0 + 0.7, m1 - 0.7]) line(BAR, x, MID, KERB - FKERB - 0.1, 0.34, true);
    for (const z of [KERB + 0.5, NZ - 0.3, FKERB - 0.5, FZ + 0.3]) dec(BAR, (a0 + a1) / 2, z, a1 - a0 - 0.5, 0.34, 0);
    if (stop != null) line(BAR, stop, MID, KERB - FKERB - 0.1, 0.55, true);
  }
  const marks = new THREE.Mesh(mergeGeometries(gs), new THREE.MeshLambertMaterial({ map: at, transparent: true, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2 })); marks.renderOrder = -3; marks.castShadow = false; marks.receiveShadow = true; marks.userData.nopick = true; marks.userData.keep = true; city.add(marks);
  // ---- iron in the road: manhole covers set in the asphalt, storm drains at the gutters with their mouths in the kerb
  strew(city, 'manhole', [[VENT[0], ROAD - 0.074, VENT[1], 0.4, 1], [-7.2, ROAD - 0.074, MID - 0.3, 1.9, 1], [12.4, ROAD - 0.074, MID + 0.5, 0.2, 0.92], [-21.5, ROAD - 0.074, MID + 1.1, 2.6, 1]], 0x8a8684);
  const iron = flat(0x1e1e22), dark = flat(0x050506);
  for (const [x, s] of [[5.3, 1], [-15.6, 1], [-6.4, -1], [17.8, -1]]) { const z = (s > 0 ? KERB : FKERB) - s * 0.45; // a grate of bars in a frame, its pit dark under it
    box(1.0, 0.02, 0.56, dark, x, ROAD - 0.004, z, city).castShadow = false; for (const e of [-1, 1]) { box(1.06, 0.04, 0.05, iron, x, ROAD + 0.012, z + e * 0.28, city).castShadow = false; box(0.05, 0.04, 0.56, iron, x + e * 0.505, ROAD + 0.012, z, city).castShadow = false; }
    for (let i = 0; i < 8; i++) box(0.045, 0.035, 0.52, iron, x - 0.42 + i * 0.12, ROAD + 0.012, z, city).castShadow = false;
    box(0.96, 0.1, 0.03, dark, x, -0.075, (s > 0 ? KERB : FKERB) - s * 0.168, city).castShadow = false; }
  // ---- puddles in the low places by the gutters: nothing while the street is dry, a mirror of the street when it has rained
  { const pt = T.canvasTex(128, 128, (g, w, h) => { g.fillStyle = '#000'; g.fillRect(0, 0, w, h); const RR = T.rng(7); for (let i = 0; i < 9; i++) { const x = 64 + (RR() - 0.5) * 50, y = 64 + (RR() - 0.5) * 50, r = 18 + RR() * 22, gd = g.createRadialGradient(x, y, r * 0.55, x, y, r); gd.addColorStop(0, '#fff'); gd.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gd; g.fillRect(x - r, y - r, 2 * r, 2 * r); } }, { linear: true });
    const pg = []; for (const [x, z, w, d] of [[5.6, KERB - 0.75, 2.8, 1.1], [-12.2, KERB - 0.7, 3.4, 1.2], [-2.2, FKERB + 0.8, 3, 1.2], [9.4, MID + 0.9, 2.2, 1.5], [-19.5, MID - 0.6, 2.6, 1.7], [18.3, KERB - 0.62, 2.2, 0.9], [1.6, MID + 1.9, 1.7, 1.1], [-7.5, KERB - 0.6, 1.6, 0.8]]) pg.push(new THREE.PlaneGeometry(w, d).rotateX(-Math.PI / 2).rotateY(R() * 0.5 - 0.25).translate(x, ROAD + 0.011, z).toNonIndexed());
    for (const [x, z, w, d] of [[-3.4, -2.75, 1.5, 0.7], [7.2, -2.3, 1.2, 0.8], [-14, -1.6, 1.6, 0.9]]) pg.push(new THREE.PlaneGeometry(w, d).rotateX(-Math.PI / 2).rotateY(R() * 3).translate(x, 0.004, z).toNonIndexed());   // and where the flags have sunk
    const pm = new THREE.MeshBasicMaterial({ color: 0x0c0e12, envMap: T.env(), reflectivity: 0.92, combine: THREE.MixOperation, alphaMap: pt, transparent: true, opacity: 0, depthWrite: false }), puddles = new THREE.Mesh(mergeGeometries(pg), pm); puddles.renderOrder = -2; puddles.visible = false; puddles.userData.nopick = true; puddles.userData.keep = true; puddles.castShadow = puddles.receiveShadow = false; city.add(puddles);
    ups.push(() => { const w = T.SURF.wet.value; puddles.visible = w > 0.02; pm.opacity = Math.min(1, w * 1.25) * 0.88; }); }
  return { paveM, roadM };
}
