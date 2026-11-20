// Canvas-rendered avionics: attitude indicator, radar / threat CRTs, multi-function displays, UFC LCD, HUD symbology,
// and the dial-face / placard atlases used by the analog instruments.
import * as THREE from 'three';
import { N, CELL, HALF } from './world.js';

const TAU = Math.PI * 2, D2R = Math.PI / 180;
const clamp = (x, a, b) => x < a ? a : x > b ? b : x;
export const MS2KT = 1.94384, M2FT = 3.28084;

export function canvasTex(w, h, srgb = true) { const c = document.createElement('canvas'); c.width = w; c.height = h; const t = new THREE.CanvasTexture(c); if (srgb) t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return { c, g: c.getContext('2d'), t }; }

// ---------- atlas of static dial faces (8x8 cells of 256px) ----------
export class FaceAtlas {
  constructor(cream) { const o = canvasTex(2048, 2048); this.c = o.c; this.g = o.g; this.tex = o.t; this.n = 0; this.cream = cream; }
  // returns uv rect [u0,v0,u1,v1]
  dial(o) {
    const i = this.n++, cx = (i % 8) * 256 + 128, cy = Math.floor(i / 8) * 256 + 128, g = this.g, R = 122, ink = this.cream ? '#1b1712' : '#e9e9e2';
    g.save(); g.translate(cx, cy); g.fillStyle = this.cream ? '#e6dcc0' : '#0b0c0d'; g.beginPath(); g.arc(0, 0, 128, 0, TAU); g.fill();
    if (this.cream) { const gr = g.createRadialGradient(0, 0, 30, 0, 0, 128); gr.addColorStop(0, 'rgba(255,255,255,0.12)'); gr.addColorStop(1, 'rgba(90,60,20,0.3)'); g.fillStyle = gr; g.fillRect(-128, -128, 256, 256); }
    const a0 = (o.a0 ?? -225) * D2R, sw = (o.sweep ?? 270) * D2R, ang = v => a0 + sw * (v - o.min) / (o.max - o.min);
    for (const [from, to, col] of o.arcs || []) { g.strokeStyle = col; g.lineWidth = 9; g.beginPath(); g.arc(0, 0, R - 8, ang(from), ang(to)); g.stroke(); }
    g.strokeStyle = ink; g.fillStyle = ink; g.textAlign = 'center'; g.textBaseline = 'middle';
    if (o.minor) for (let v = o.min; v <= o.max + 1e-6; v += o.minor) { const a = ang(v); g.lineWidth = 2; g.beginPath(); g.moveTo(Math.cos(a) * (R - 12), Math.sin(a) * (R - 12)); g.lineTo(Math.cos(a) * R, Math.sin(a) * R); g.stroke(); }
    if (o.major) for (let v = o.min; v <= o.max + 1e-6; v += o.major) { const a = ang(v); g.lineWidth = 5; g.beginPath(); g.moveTo(Math.cos(a) * (R - 24), Math.sin(a) * (R - 24)); g.lineTo(Math.cos(a) * R, Math.sin(a) * R); g.stroke();
      if (o.sweep === 360 && v >= o.max) continue; g.font = `bold ${o.fs || 26}px Arial`; g.fillText(String(Math.round(v / (o.div || 1) * 10) / 10), Math.cos(a) * (R - 46), Math.sin(a) * (R - 46)); }
    g.font = 'bold 19px Arial'; g.fillText(o.label || '', 0, o.ly ?? 42); if (o.sub) { g.font = '15px Arial'; g.fillText(o.sub, 0, (o.ly ?? 42) + 20); }
    if (o.custom) o.custom(g, R, ink);
    g.restore(); this.tex.needsUpdate = true;
    const u0 = (cx - 128) / 2048, v1 = 1 - (cy - 128) / 2048; return [u0, v1 - 0.125, u0 + 0.125, v1];
  }
}
// ---------- placard / label atlas ----------
export class LabelAtlas {
  constructor() { const o = canvasTex(1024, 1024); this.c = o.c; this.g = o.g; this.tex = o.t; this.n = 0; this.g.clearRect(0, 0, 1024, 1024); }
  label(text, o = {}) { const i = this.n++, x = (i % 4) * 256, y = Math.floor(i / 4) * 64, g = this.g;
    g.fillStyle = o.bg || 'rgba(0,0,0,0)'; g.clearRect(x, y, 256, 64); if (o.bg) { g.fillRect(x + 2, y + 2, 252, 60); if (o.border) { g.strokeStyle = o.fg || '#ddd'; g.lineWidth = 3; g.strokeRect(x + 5, y + 5, 246, 54); } }
    g.fillStyle = o.fg || '#e4e4dc'; g.textAlign = 'center'; g.textBaseline = 'middle'; let fs = o.fs || 40; g.font = `bold ${fs}px Arial`; while (g.measureText(text).width > 236 && fs > 14) { fs -= 2; g.font = `bold ${fs}px Arial`; }
    g.fillText(text, x + 128, y + 34); this.tex.needsUpdate = true; return [x / 1024, 1 - (y + 64) / 1024, (x + 256) / 1024, 1 - y / 1024]; }
}

// ---------- attitude indicator ----------
export function drawADI(g, S, pitch, bank, cream) {
  g.save(); g.translate(S / 2, S / 2); g.beginPath(); g.arc(0, 0, S / 2, 0, TAU); g.clip(); g.rotate(-bank); const k = S / 2 / (40 * D2R), py = pitch * k;
  g.fillStyle = cream ? '#6f97b8' : '#2a6fc2'; g.fillRect(-S, -S * 2 + py, S * 2, S * 2); g.fillStyle = cream ? '#5c4127' : '#6b4a25'; g.fillRect(-S, py, S * 2, S * 2);
  g.strokeStyle = '#fff'; g.fillStyle = '#fff'; g.lineWidth = 2; g.beginPath(); g.moveTo(-S, py); g.lineTo(S, py); g.stroke(); g.font = `${S * 0.085}px Arial`; g.textAlign = 'center'; g.textBaseline = 'middle';
  for (let p = -90; p <= 90; p += 5) { if (!p) continue; const y = py - p * D2R * k; if (Math.abs(y) > S * 0.42) continue; const w = p % 10 ? S * 0.07 : S * 0.15; g.beginPath(); g.moveTo(-w, y); g.lineTo(w, y); g.stroke(); if (p % 10 === 0) { g.fillText(Math.abs(p), -w - S * 0.07, y); g.fillText(Math.abs(p), w + S * 0.07, y); } }
  g.restore(); g.save(); g.translate(S / 2, S / 2);
  g.strokeStyle = '#fff'; g.lineWidth = 2; for (const a of [-60, -30, -20, -10, 0, 10, 20, 30, 60]) { const r = (a - 90) * D2R, l = a % 30 ? 0.42 : 0.38; g.beginPath(); g.moveTo(Math.cos(r) * S * 0.48, Math.sin(r) * S * 0.48); g.lineTo(Math.cos(r) * S * l, Math.sin(r) * S * l); g.stroke(); }
  g.rotate(-bank); g.fillStyle = '#fff'; g.beginPath(); g.moveTo(0, -S * 0.37); g.lineTo(-S * 0.04, -S * 0.29); g.lineTo(S * 0.04, -S * 0.29); g.fill(); g.rotate(bank);
  g.strokeStyle = '#ffb300'; g.lineWidth = S * 0.035; g.beginPath(); g.moveTo(-S * 0.3, 0); g.lineTo(-S * 0.1, 0); g.lineTo(-S * 0.1, S * 0.05); g.moveTo(S * 0.3, 0); g.lineTo(S * 0.1, 0); g.lineTo(S * 0.1, S * 0.05); g.stroke(); g.fillStyle = '#ffb300'; g.fillRect(-3, -3, 6, 6); g.restore();
}

// ---------- tactical picture helpers ----------
function contacts(ac, game, maxR) { const out = []; const p = ac.fm.pos; const hdg = Math.atan2(ac.fwd.x, -ac.fwd.z);
  for (const o of game.aircraft) { if (o === ac || o.removed || !o.alive) continue; const dx = o.fm.pos.x - p.x, dz = o.fm.pos.z - p.z, d = Math.hypot(dx, dz); if (d > maxR) continue; const brg = Math.atan2(dx, -dz) - hdg; out.push({ o, d, brg: Math.atan2(Math.sin(brg), Math.cos(brg)), dy: o.fm.pos.y - p.y, foe: o.team !== ac.team, hdg: Math.atan2(o.fwd.x, -o.fwd.z) - hdg }); } return out; }

// green-phosphor B-scope radar (cold-war jets): forward +-60 deg sector, with sweep and persistence
export function drawRadarCRT(g, S, ac, game, st) {
  g.fillStyle = 'rgba(0,10,2,0.22)'; g.fillRect(0, 0, S, S); if (!st.power) { g.fillStyle = '#000'; g.fillRect(0, 0, S, S); return; }
  st.sweep = ((st.sweep || 0) + 0.11) % 2; const sx = (st.sweep < 1 ? st.sweep : 2 - st.sweep) * S; const R = st.range;
  g.strokeStyle = 'rgba(60,255,110,0.16)'; g.lineWidth = 1; for (let i = 1; i < 4; i++) { g.beginPath(); g.moveTo(0, S * i / 4); g.lineTo(S, S * i / 4); g.moveTo(S * i / 4, 0); g.lineTo(S * i / 4, S); g.stroke(); }
  g.strokeStyle = 'rgba(90,255,140,0.75)'; g.lineWidth = 2; g.beginPath(); g.moveTo(sx, 0); g.lineTo(sx, S); g.stroke();
  for (const c of contacts(ac, game, R)) { if (Math.abs(c.brg) > 60 * D2R) continue; const x = S / 2 + c.brg / (60 * D2R) * S / 2, y = S - c.d / R * S; if (Math.abs(x - sx) < S * 0.07) { g.fillStyle = '#b8ffc8'; g.fillRect(x - 5, y - 2, 10, 5); } }
  g.fillStyle = 'rgba(120,255,160,0.9)'; g.font = `${S * 0.07}px monospace`; g.textAlign = 'left'; g.fillText(`${(R / 1852).toFixed(0)}NM`, 6, S * 0.08);
}
// 360 deg warning scope
export function drawThreatCRT(g, S, ac, game, st) {
  g.fillStyle = '#020803'; g.fillRect(0, 0, S, S); if (!st.power) { g.fillStyle = '#000'; g.fillRect(0, 0, S, S); return; }
  g.save(); g.translate(S / 2, S / 2); g.strokeStyle = 'rgba(70,255,120,0.5)'; g.lineWidth = 1.5; for (const r of [0.22, 0.44]) { g.beginPath(); g.arc(0, 0, S * r, 0, TAU); g.stroke(); } g.beginPath(); g.moveTo(0, -S * 0.46); g.lineTo(0, S * 0.46); g.moveTo(-S * 0.46, 0); g.lineTo(S * 0.46, 0); g.stroke();
  g.font = `bold ${S * 0.12}px monospace`; g.textAlign = 'center'; g.textBaseline = 'middle';
  for (const c of contacts(ac, game, 6000)) { if (!c.foe) continue; const r = (0.1 + 0.34 * c.d / 6000) * S; g.fillStyle = c.d < 1200 ? '#ffffff' : '#7dffa0'; g.fillText(c.d < 1200 ? '◆' : '^', Math.sin(c.brg) * r, -Math.cos(c.brg) * r); }
  g.restore();
}

// pre-rendered relief map of the island for the moving-map display
export function makeMapCanvas(world) {
  const S = 512, c = document.createElement('canvas'); c.width = c.height = S; const g = c.getContext('2d'), im = g.createImageData(S, S), H = world.H, k = N / S;
  for (let y = 0; y < S; y++) for (let x = 0; x < S; x++) { const i = (y * k | 0) * N + (x * k | 0), h = H[i], sh = clamp(0.5 + (h - H[Math.min(i + 3, N * N - 1)]) * 0.004, 0.2, 1.1); let r, gg, b;
    if (h <= 0) { r = 8; gg = 24 + clamp(h / 8, -14, 0); b = 46; } else if (h < 300) { r = 30 + h * 0.08; gg = 62 + h * 0.04; b = 30; } else if (h < 1500) { r = 54 + (h - 300) * 0.035; gg = 74 - (h - 300) * 0.012; b = 34; } else { r = gg = b = 110 + (h - 1500) * 0.06; }
    const o = (y * S + x) * 4; im.data[o] = r * sh; im.data[o + 1] = gg * sh; im.data[o + 2] = b * sh; im.data[o + 3] = 255; }
  g.putImageData(im, 0, 0); g.fillStyle = '#cfd3d8'; for (const b of world.bases) { const x = (b.x + HALF) / CELL / k, y = (b.z + HALF) / CELL / k; g.fillRect(x - 1, y - 4, 2, 8); }
  g.fillStyle = '#b9a98a'; for (const t of world.towns) { const x = (t.x + HALF) / CELL / k, y = (t.z + HALF) / CELL / k; g.beginPath(); g.arc(x, y, 3, 0, TAU); g.fill(); }
  return c;
}

const GREEN = '#35ff6a', CYAN = '#4fe3ff', AMBER = '#ffbf3a', RED = '#ff4a3a';
function frame(g, S, title, osb) { g.fillStyle = '#020405'; g.fillRect(0, 0, S, S); g.font = `bold ${S * 0.05}px monospace`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillStyle = CYAN; g.fillText(title, S / 2, S * 0.045);
  osb.forEach((t, i) => { const x = S * (0.1 + 0.2 * i); g.fillStyle = t.on ? '#02120a' : '#020405'; if (t.on) { g.fillStyle = GREEN; g.fillRect(x - S * 0.075, S * 0.925, S * 0.15, S * 0.06); g.fillStyle = '#021006'; } else g.fillStyle = GREEN; g.fillText(t.t, x, S * 0.957); }); }
export const MFD_PAGES = ['RDR', 'MAP', 'ENG', 'SMS', 'FLT'];
// modern glass-cockpit pages
export function drawMFD(g, S, page, ac, game, st, mapCanvas) {
  if (!st.power) { g.fillStyle = '#000'; g.fillRect(0, 0, S, S); return; }
  frame(g, S, { RDR: 'FCR  AIR-AIR', MAP: 'HSD', ENG: 'ENGINE', SMS: 'STORES', FLT: 'FLIGHT' }[page], MFD_PAGES.map(t => ({ t, on: t === page })));
  const fm = ac.fm, hdg = Math.atan2(ac.fwd.x, -ac.fwd.z); g.lineWidth = 2;
  if (page === 'RDR') { const R = st.range, cx = S / 2, cy = S * 0.86, sc = S * 0.72 / R;
    g.strokeStyle = 'rgba(60,220,255,0.35)'; for (let i = 1; i <= 4; i++) { g.beginPath(); g.arc(cx, cy, S * 0.72 * i / 4, -Math.PI * 5 / 6, -Math.PI / 6); g.stroke(); } for (const a of [-60, -30, 0, 30, 60]) { g.beginPath(); g.moveTo(cx, cy); g.lineTo(cx + Math.sin(a * D2R) * S * 0.72, cy - Math.cos(a * D2R) * S * 0.72); g.stroke(); }
    g.font = `${S * 0.042}px monospace`; g.textAlign = 'left'; g.fillStyle = CYAN; g.fillText(`RNG ${(R / 1852).toFixed(0)} NM`, S * 0.03, S * 0.11);
    const cs = contacts(ac, game, R).filter(c => Math.abs(c.brg) < 62 * D2R).sort((a, b) => a.d - b.d);
    cs.forEach((c, i) => { const x = cx + Math.sin(c.brg) * c.d * sc, y = cy - Math.cos(c.brg) * c.d * sc; g.strokeStyle = g.fillStyle = c.foe ? RED : GREEN; g.save(); g.translate(x, y); g.rotate(c.hdg);
      if (c.foe) { g.beginPath(); g.moveTo(0, -8); g.lineTo(7, 7); g.lineTo(-7, 7); g.closePath(); g.stroke(); } else { g.beginPath(); g.arc(0, 0, 6, 0, TAU); g.stroke(); } g.beginPath(); g.moveTo(0, -8); g.lineTo(0, -20); g.stroke(); g.restore();
      g.font = `${S * 0.036}px monospace`; g.fillText(`${(c.d / 1852).toFixed(1)} ${c.dy >= 0 ? '+' : '-'}${Math.abs(c.dy * M2FT / 1000).toFixed(0)}`, x + 10, y + 4);
      if (i === 0 && c.foe) { g.strokeRect(x - 13, y - 13, 26, 26); g.textAlign = 'right'; g.fillText(`TGT ${c.o.spec.id.toUpperCase()}  ${(c.o.fm.tas * MS2KT).toFixed(0)}KT`, S * 0.97, S * 0.11); g.textAlign = 'left'; } });
    if (!cs.length) { g.fillStyle = GREEN; g.textAlign = 'center'; g.fillText('NO CONTACT', S / 2, S * 0.4); }
  } else if (page === 'MAP') { const R = st.range * 1.5, cx = S / 2, cy = S * 0.62, sc = S * 0.5 / R; g.save(); g.beginPath(); g.rect(0, S * 0.08, S, S * 0.83); g.clip(); g.translate(cx, cy); g.rotate(-hdg);
    const ppm = 512 / (N * CELL); g.scale(sc / ppm, sc / ppm); g.translate(-(fm.pos.x + HALF) * ppm, -(fm.pos.z + HALF) * ppm); g.imageSmoothingEnabled = true; g.drawImage(mapCanvas, 0, 0); g.restore();
    g.strokeStyle = 'rgba(255,255,255,0.5)'; for (const r of [0.25, 0.5]) { g.beginPath(); g.arc(cx, cy, S * r, 0, TAU); g.stroke(); }
    for (const c of contacts(ac, game, R)) { const x = cx + Math.sin(c.brg) * c.d * sc, y = cy - Math.cos(c.brg) * c.d * sc; if (y < S * 0.1 || y > S * 0.9) continue; g.fillStyle = c.foe ? RED : GREEN; g.fillRect(x - 4, y - 4, 8, 8); }
    g.strokeStyle = '#fff'; g.lineWidth = 3; g.beginPath(); g.moveTo(cx, cy - 12); g.lineTo(cx, cy + 10); g.moveTo(cx - 10, cy); g.lineTo(cx + 10, cy); g.moveTo(cx - 5, cy + 10); g.lineTo(cx + 5, cy + 10); g.stroke();
    g.fillStyle = '#fff'; g.font = `${S * 0.042}px monospace`; g.textAlign = 'left'; g.fillText(`HDG ${String(Math.round((hdg / D2R + 360) % 360)).padStart(3, '0')}`, S * 0.03, S * 0.11);
    let nb = null, nd = 1e9; for (const b of game.world.bases) { const d = Math.hypot(b.x - fm.pos.x, b.z - fm.pos.z); if (d < nd) { nd = d; nb = b; } } if (nb) { const br = (Math.atan2(nb.x - fm.pos.x, -(nb.z - fm.pos.z)) / D2R + 360) % 360; g.textAlign = 'right'; g.fillText(`BASE ${String(Math.round(br)).padStart(3, '0')}/${(nd / 1852).toFixed(0)}NM`, S * 0.97, S * 0.11); }
  } else if (page === 'ENG') { const bar = (x, v, lab, txt, warn) => { g.strokeStyle = CYAN; g.strokeRect(x - S * 0.04, S * 0.2, S * 0.08, S * 0.5); g.fillStyle = warn ? RED : GREEN; g.fillRect(x - S * 0.04 + 2, S * 0.7 - S * 0.5 * clamp(v, 0, 1), S * 0.08 - 4, S * 0.5 * clamp(v, 0, 1)); g.fillStyle = '#fff'; g.font = `${S * 0.04}px monospace`; g.textAlign = 'center'; g.fillText(lab, x, S * 0.15); g.fillText(txt, x, S * 0.76); };
    bar(S * 0.14, fm.rpm, 'RPM', `${(fm.rpm * 100).toFixed(0)}%`); bar(S * 0.32, 0.25 + fm.rpm * 0.55 + fm.ab * 0.2, 'EGT', `${(250 + fm.rpm * 520 + fm.ab * 180).toFixed(0)}C`, fm.damage.engine > 0.5); bar(S * 0.5, fm.ab, 'NOZ/AB', fm.ab > 0.5 ? 'A/B' : 'MIL');
    bar(S * 0.68, fm.fuel, 'FUEL', `${(fm.fuel * 100).toFixed(0)}%`, fm.fuel < 0.15); bar(S * 0.86, fm.thrustN / (ac.spec.thrustAB || ac.spec.thrust || 1), 'THR', `${(fm.thrustN / 1000).toFixed(0)}kN`);
    g.textAlign = 'left'; g.fillStyle = fm.damage.engine > 0.3 ? RED : GREEN; g.fillText(fm.damage.engine > 0.3 ? 'ENG DAMAGE' : fm.engineOn ? 'ENG NORMAL' : 'ENG OFF', S * 0.06, S * 0.84); g.fillStyle = fm.damage.ctl > 0.3 ? RED : GREEN; g.fillText(fm.damage.ctl > 0.3 ? 'HYD LOW' : 'HYD OK', S * 0.55, S * 0.84);
  } else if (page === 'SMS') { g.strokeStyle = GREEN; g.beginPath(); g.moveTo(S * 0.5, S * 0.14); g.lineTo(S * 0.58, S * 0.4); g.lineTo(S * 0.92, S * 0.56); g.lineTo(S * 0.58, S * 0.6); g.lineTo(S * 0.56, S * 0.8); g.lineTo(S * 0.44, S * 0.8); g.lineTo(S * 0.42, S * 0.6); g.lineTo(S * 0.08, S * 0.56); g.lineTo(S * 0.42, S * 0.4); g.closePath(); g.stroke();
    g.font = `bold ${S * 0.05}px monospace`; g.textAlign = 'center'; g.fillStyle = ac.weapon === 'gun' ? '#fff' : GREEN; g.fillText(`GUN ${ac.ammo}`, S * 0.5, S * 0.3); g.fillStyle = ac.weapon === 'rocket' ? '#fff' : GREEN; g.fillText(`RKT ${Math.ceil(ac.rockets / 2)}`, S * 0.2, S * 0.66); g.fillText(`RKT ${Math.floor(ac.rockets / 2)}`, S * 0.8, S * 0.66);
    g.fillStyle = ac.masterArm ? RED : GREEN; g.fillText(ac.masterArm ? 'MASTER ARM' : 'SAFE', S * 0.5, S * 0.87); g.fillStyle = CYAN; g.fillText(`SEL: ${ac.weapon === 'gun' ? 'GUN' : 'ROCKETS'}`, S * 0.5, S * 0.12 + S * 0.0);
  } else { g.save(); g.translate(S * 0.2, S * 0.12); drawADI(g, S * 0.6, Math.asin(clamp(ac.fwd.y, -1, 1)), Math.atan2(-ac.right.y, ac.up.y), false); g.restore();
    g.fillStyle = '#fff'; g.font = `bold ${S * 0.05}px monospace`; g.textAlign = 'left'; g.fillText(`${(fm.ias * MS2KT).toFixed(0)}`, S * 0.03, S * 0.42); g.fillText('KT', S * 0.03, S * 0.48); g.textAlign = 'right'; g.fillText(`${(fm.alt * M2FT).toFixed(0)}`, S * 0.98, S * 0.42); g.fillText('FT', S * 0.98, S * 0.48);
    g.textAlign = 'center'; g.fillStyle = GREEN; g.fillText(`M ${fm.mach.toFixed(2)}   G ${fm.gLoad.toFixed(1)}   AOA ${(fm.alpha / D2R).toFixed(0)}`, S / 2, S * 0.8); g.fillText(`VS ${(fm.vs * M2FT * 60).toFixed(0)} FPM   ${fm.autopilot ? 'A/P ALT' : ''}`, S / 2, S * 0.86); }
}
// up-front LCD
export function drawUFC(g, W, Hh, mode, ac, game, power) {
  g.fillStyle = power ? '#1c2a10' : '#080a06'; g.fillRect(0, 0, W, Hh); if (!power) return; const fm = ac.fm; g.fillStyle = '#b6ff5a'; g.font = `bold ${Hh * 0.36}px monospace`; g.textAlign = 'left'; g.textBaseline = 'middle';
  const hdg = String(Math.round((Math.atan2(ac.fwd.x, -ac.fwd.z) / D2R + 360) % 360)).padStart(3, '0'); const d = new Date();
  const l = [[`HDG ${hdg}  SPD ${(fm.ias * MS2KT).toFixed(0)}`, `ALT ${(fm.alt * M2FT).toFixed(0)} FT`], [`GUN ${ac.ammo}  RKT ${ac.rockets}`, `KILLS ${game.kills}  WAVE ${game.wave}`], [`TIME ${d.toTimeString().slice(0, 8)}`, `FUEL ${(fm.fuel * 100).toFixed(0)}%  G ${fm.gLoad.toFixed(1)}`]][mode % 3];
  g.fillText(l[0], W * 0.04, Hh * 0.3); g.fillText(l[1], W * 0.04, Hh * 0.72);
}

// ---------- HUD symbology (collimated). canvas spans +-fov radians ----------
export function drawHUD(g, S, ac, game, o) {
  g.clearRect(0, 0, S, S); if (!o.power) return; const fm = ac.fm, k = S / 2 / Math.tan(o.fov), col = o.color || GREEN; g.strokeStyle = g.fillStyle = col; g.lineWidth = o.lw || 3; g.lineCap = 'round';
  const proj = v => v.z > -0.01 ? null : [S / 2 + v.x / -v.z * k, S / 2 - v.y / -v.z * k]; // v in aircraft body frame
  if (o.simple) { // reflector / gyro sight: ring, dot, range bars (+ lead-computing pipper for jets)
    let cx = S / 2, cy = S / 2 + o.dep * k; if (o.lead) { const tof = 0.42; cx += -(-fm.omega.y) * tof * k * 1; cy += -(fm.omega.x) * tof * k * -1; cx = clamp(cx, S * 0.1, S * 0.9); cy = clamp(cy, S * 0.1, S * 0.9); }
    g.beginPath(); g.arc(cx, cy, o.ring * k, 0, TAU); g.stroke(); g.beginPath(); g.arc(cx, cy, 3.5, 0, TAU); g.fill();
    for (let i = 0; i < 4; i++) { const a = i * Math.PI / 2; g.beginPath(); g.moveTo(cx + Math.cos(a) * o.ring * k * 1.15, cy + Math.sin(a) * o.ring * k * 1.15); g.lineTo(cx + Math.cos(a) * o.ring * k * 1.6, cy + Math.sin(a) * o.ring * k * 1.6); g.stroke(); }
    if (o.lead) for (let i = 0; i < 6; i++) { const a = i * Math.PI / 3 + 0.5; g.beginPath(); g.arc(cx + Math.cos(a) * o.ring * k * 0.62, cy + Math.sin(a) * o.ring * k * 0.62, 2.5, 0, TAU); g.fill(); }
    return; }
  const q = o.qi, V = o.v; g.font = `bold ${S * 0.034}px monospace`; g.textBaseline = 'middle';
  // pitch ladder, horizon-stabilised
  const pitch = Math.asin(clamp(ac.fwd.y, -1, 1)), bank = Math.atan2(-ac.right.y, ac.up.y);
  g.save(); g.translate(S / 2, S / 2); g.rotate(-bank); for (let p = -90; p <= 90; p += 5) { const y = (pitch - p * D2R) * k; if (Math.abs(y) > S * 0.36) continue; const w = p === 0 ? S * 0.3 : S * 0.09; g.setLineDash(p < 0 ? [10, 8] : []); g.beginPath(); g.moveTo(-w, y); g.lineTo(-S * 0.04, y); g.moveTo(S * 0.04, y); g.lineTo(w, y); g.stroke(); if (p) { g.textAlign = 'right'; g.fillText(p, -w - 6, y); g.textAlign = 'left'; g.fillText(p, w + 6, y); } } g.setLineDash([]); g.restore();
  // boresight cross + flight-path marker
  g.beginPath(); g.moveTo(S / 2 - 14, S / 2); g.lineTo(S / 2 + 14, S / 2); g.moveTo(S / 2, S / 2 - 14); g.lineTo(S / 2, S / 2 + 14); g.stroke();
  V.copy(fm.vel).applyQuaternion(q); const f = proj(V); if (f && fm.tas > 20) { const x = clamp(f[0], S * 0.08, S * 0.92), y = clamp(f[1], S * 0.08, S * 0.92); g.beginPath(); g.arc(x, y, 9, 0, TAU); g.moveTo(x - 24, y); g.lineTo(x - 9, y); g.moveTo(x + 9, y); g.lineTo(x + 24, y); g.moveTo(x, y - 9); g.lineTo(x, y - 18); g.stroke(); }
  // speed / altitude boxes, heading tape
  g.textAlign = 'center'; g.strokeRect(S * 0.06, S * 0.47, S * 0.13, S * 0.06); g.fillText((fm.ias * MS2KT).toFixed(0), S * 0.125, S * 0.5); g.strokeRect(S * 0.8, S * 0.47, S * 0.15, S * 0.06); g.fillText((fm.alt * M2FT).toFixed(0), S * 0.875, S * 0.5);
  const hd = (Math.atan2(ac.fwd.x, -ac.fwd.z) / D2R + 360) % 360; g.save(); g.beginPath(); g.rect(S * 0.3, S * 0.06, S * 0.4, S * 0.09); g.clip(); for (let h = Math.floor(hd / 10) * 10 - 30; h <= hd + 30; h += 10) { const x = S / 2 + (h - hd) * S * 0.012; g.beginPath(); g.moveTo(x, S * 0.115); g.lineTo(x, S * 0.14); g.stroke(); g.fillText(String(((h + 360) % 360) / 10 | 0).padStart(2, '0'), x, S * 0.09); } g.restore(); g.beginPath(); g.moveTo(S / 2, S * 0.15); g.lineTo(S / 2 - 7, S * 0.17); g.lineTo(S / 2 + 7, S * 0.17); g.closePath(); g.stroke();
  g.textAlign = 'left'; g.fillText(`M ${fm.mach.toFixed(2)}`, S * 0.06, S * 0.58); g.fillText(`G ${fm.gLoad.toFixed(1)}`, S * 0.06, S * 0.62); g.fillText(`a ${(fm.alpha / D2R).toFixed(0)}`, S * 0.06, S * 0.66);
  g.fillText(ac.masterArm ? (ac.weapon === 'gun' ? `GUN ${ac.ammo}` : `RKT ${ac.rockets}`) : 'SAFE', S * 0.06, S * 0.8); if (fm.autopilot) g.fillText('A/P', S * 0.06, S * 0.84); if (fm.gearPos > 0.5) g.fillText('GEAR', S * 0.06, S * 0.88);
  g.textAlign = 'right'; g.fillText(`VS ${(fm.vs * M2FT * 60 / 100).toFixed(0)}`, S * 0.95, S * 0.58); g.fillText(`R ${Math.max(0, fm.agl * M2FT).toFixed(0)}`, S * 0.95, S * 0.62);
  // nearest hostile: target box + range, and gun pipper at the bullet time-of-flight for that range
  let tgt = null, td = 1e9; for (const c of game.aircraft) { if (c.team === ac.team || !c.alive) continue; const d = c.fm.pos.distanceTo(fm.pos); V.copy(c.fm.pos).sub(fm.pos).applyQuaternion(q); if (V.z < 0 && d < td) { const pp = proj(V); if (pp && Math.abs(pp[0] - S / 2) < S * 0.48 && Math.abs(pp[1] - S / 2) < S * 0.48) { td = d; tgt = [c, pp]; } } }
  if (tgt) { const [c, pp] = tgt; g.strokeRect(pp[0] - 16, pp[1] - 16, 32, 32); g.textAlign = 'center'; g.fillText(`${(td / 1000).toFixed(1)}KM`, pp[0], pp[1] + 32); g.textAlign = 'right'; g.fillText(`Vc ${(-(V.copy(c.fm.vel).sub(fm.vel).dot(o.v2.copy(c.fm.pos).sub(fm.pos).normalize())) * MS2KT).toFixed(0)}`, S * 0.95, S * 0.8); }
  if (ac.weapon === 'gun' && ac.masterArm) { const R = clamp(tgt ? td : 450, 150, 1100), tof = R / (ac.spec.gun.v0 + 30); 
    const lx = S / 2 - (-fm.omega.y) * tof * 0.55 * k, ly = S / 2 + fm.omega.x * tof * 0.55 * k + (4.9 * tof * tof / R) * k * ac.up.y; const x = clamp(lx, S * 0.1, S * 0.9), y = clamp(ly, S * 0.1, S * 0.9);
    g.beginPath(); g.arc(x, y, 22, 0, TAU); g.stroke(); g.beginPath(); g.arc(x, y, 3, 0, TAU); g.fill(); g.beginPath(); g.arc(x, y, 30, -Math.PI / 2, -Math.PI / 2 + TAU * clamp(R / 1100, 0, 1)); g.stroke(); }
  else if (ac.masterArm) { g.beginPath(); g.arc(S / 2, S / 2 + 0.012 * k, 26, 0, TAU); g.stroke(); }
  if (o.warn) { g.font = `bold ${S * 0.06}px monospace`; g.textAlign = 'center'; g.fillText(o.warn, S / 2, S * 0.72); }
}
