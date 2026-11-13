// the asylum's painted textures and its lit materials (relief from the paint; a cheaper shader in a headset)
import * as T from 'three';

let seed = 11;
export const rnd = () => (seed = seed * 16807 % 2147483647) / 2147483647;
const QUEST = /OculusBrowser|Quest|Pico/i.test(navigator.userAgent);
export const lit = o => { const p = typeof o === 'number' ? { color: o } : { ...o }, rough = p.rough ?? .82; delete p.rough;
  if (QUEST) return new T.MeshLambertMaterial(p);
  const m = new T.MeshStandardMaterial({ roughness: rough, metalness: 0, ...p }); if (p.map && !p.transparent) { m.bumpMap = p.map; m.bumpScale = 1.6; } return m; };
export const glow = c => new T.MeshBasicMaterial({ color: c });
export function tex(w, h, draw, rx = 1, ry = 1) {
  const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h);
  const t = new T.CanvasTexture(c); t.wrapS = t.wrapT = T.RepeatWrapping; t.repeat.set(rx, ry); t.colorSpace = T.SRGBColorSpace; t.anisotropy = 4; return t;
}
const decal = (w, h, draw) => lit({ map: tex(w, h, draw), transparent: true, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -3, polygonOffsetUnits: -3 });

function stains(g, w, h, n, col, r0 = 8, r1 = 40) {
  for (let i = 0; i < n; i++) { const x = rnd() * w, y = rnd() * h, r = r0 + rnd() * r1, gr = g.createRadialGradient(x, y, 0, x, y, r);
    gr.addColorStop(0, col); gr.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = gr; g.fillRect(x - r, y - r, r * 2, r * 2); }
}
function streaks(g, w, h, n, col, y0 = 0) {
  g.strokeStyle = col; for (let i = 0; i < n; i++) { const x = rnd() * w; g.lineWidth = 1 + rnd() * 3; g.beginPath(); g.moveTo(x, y0); g.lineTo(x + rnd() * 6 - 3, y0 + (h - y0) * (.3 + rnd() * .7)); g.stroke(); }
}
function speck(g, w, h, n, a) { for (let i = 0; i < n; i++) { const v = rnd() * 60 | 0; g.fillStyle = `rgba(${v},${v},${v},${a})`; g.fillRect(rnd() * w, rnd() * h, 2, 2); } }
function cracks(g, w, h, n, col) {
  g.strokeStyle = col; g.lineWidth = 1; for (let i = 0; i < n; i++) { let x = rnd() * w, y = rnd() * h; g.beginPath(); g.moveTo(x, y);
    for (let k = 0; k < 6; k++) { x += rnd() * 30 - 15; y += rnd() * 26; g.lineTo(x, y); } g.stroke(); }
}
function tiles(g, x0, y0, w, h, s, base, line, miss = 0) {
  g.fillStyle = base; g.fillRect(x0, y0, w, h); g.strokeStyle = line; g.lineWidth = 1;
  for (let x = x0; x <= x0 + w; x += s) { g.beginPath(); g.moveTo(x + .5, y0); g.lineTo(x + .5, y0 + h); g.stroke(); }
  for (let y = y0; y <= y0 + h; y += s) { g.beginPath(); g.moveTo(x0, y + .5); g.lineTo(x0 + w, y + .5); g.stroke(); }
  for (let i = 0; i < miss; i++) { g.fillStyle = rnd() < .5 ? '#1a1c18' : 'rgba(40,36,24,.7)'; g.fillRect(x0 + (rnd() * w / s | 0) * s + 1, y0 + (rnd() * h / s | 0) * s + 1, s - 1, s - 1); }
}

const WW = 256, WH = 384;
const wall = draw => lit({ map: tex(WW, WH, draw) }), floor = draw => lit({ map: tex(256, 256, draw), rough: .5 });
export const WALL = {
  c: wall((g, w, h) => { g.fillStyle = '#868b7c'; g.fillRect(0, 0, w, h); stains(g, w, h * .55, 16, 'rgba(46,38,20,.5)'); streaks(g, w, h * .6, 18, 'rgba(54,40,18,.45)'); cracks(g, w, h * .4, 4, 'rgba(20,20,16,.7)');
    const y = h * .533; tiles(g, 0, y, w, h - y, 16, '#4c6657', '#22302a', 14); g.fillStyle = '#1b2520'; g.fillRect(0, y - 4, w, 7); stains(g, w, h, 10, 'rgba(0,0,0,.4)'); g.fillStyle = 'rgba(8,10,8,.55)'; g.fillRect(0, h - 14, w, 14); }),
  l: wall((g, w, h) => { g.fillStyle = '#8d8672'; g.fillRect(0, 0, w, h); stains(g, w, h * .6, 12, 'rgba(50,40,22,.45)'); streaks(g, w, h * .5, 8, 'rgba(40,30,16,.4)');
    const y = h * .63; g.fillStyle = '#2c1f15'; g.fillRect(0, y, w, h - y); g.fillStyle = '#3a2a1c'; g.fillRect(0, y, w, 6); g.strokeStyle = '#150e09'; g.lineWidth = 2; for (let x = 0; x < w; x += 64) g.strokeRect(x + 8, y + 16, 48, h - y - 34); stains(g, w, h, 6, 'rgba(0,0,0,.4)'); }),
  p: wall((g, w, h) => { g.fillStyle = '#8b8672'; g.fillRect(0, 0, w, h); g.strokeStyle = 'rgba(50,46,34,.8)'; g.lineWidth = 2;
    for (let i = -h; i < w + h; i += 48) { g.beginPath(); g.moveTo(i, 0); g.lineTo(i + h, h); g.stroke(); g.beginPath(); g.moveTo(i, 0); g.lineTo(i - h, h); g.stroke(); }
    stains(g, w, h, 26, 'rgba(40,30,12,.55)'); stains(g, w, h, 5, 'rgba(70,14,10,.5)', 6, 18); cracks(g, w, h, 6, 'rgba(15,12,8,.9)'); g.fillStyle = 'rgba(10,8,5,.5)'; g.fillRect(0, h - 40, w, 40); }),
  o: wall((g, w, h) => { g.fillStyle = '#55583c'; g.fillRect(0, 0, w, h); stains(g, w, h, 14, 'rgba(24,22,10,.5)'); streaks(g, w, h * .7, 8, 'rgba(20,16,8,.4)');
    g.fillStyle = '#231911'; g.fillRect(0, h * .66, w, 8); g.fillRect(0, h - 22, w, 22); g.fillStyle = '#44472e'; g.fillRect(0, h * .66 + 8, w, h * .34 - 30); stains(g, w, h, 6, 'rgba(0,0,0,.35)'); }),
  d: wall((g, w, h) => { g.fillStyle = '#8f8453'; g.fillRect(0, 0, w, h); for (let i = 0; i < 22; i++) { g.fillStyle = rnd() < .5 ? '#6f6f66' : '#7b7446'; g.beginPath(); g.ellipse(rnd() * w, rnd() * h, 6 + rnd() * 26, 4 + rnd() * 16, rnd() * 3, 0, 7); g.fill(); }
    stains(g, w, h, 12, 'rgba(40,30,10,.45)'); g.strokeStyle = 'rgba(120,30,30,.6)'; g.lineWidth = 2; for (let i = 0; i < 5; i++) { let x = rnd() * w, y = h * .62 + rnd() * h * .2; g.beginPath(); g.moveTo(x, y); for (let k = 0; k < 14; k++) g.lineTo(x += rnd() * 16 - 8, y += rnd() * 16 - 8); g.stroke(); }
    g.fillStyle = '#2a2114'; g.fillRect(0, h - 18, w, 18); }),
  t: wall((g, w, h) => { tiles(g, 0, 0, w, h, 16, '#a3a79c', '#5b6058', 10); stains(g, w, h, 18, 'rgba(50,44,26,.4)'); streaks(g, w, h, 14, 'rgba(96,50,20,.4)'); stains(g, w, h, 3, 'rgba(90,14,10,.45)', 8, 22); g.fillStyle = 'rgba(14,14,10,.5)'; g.fillRect(0, h - 26, w, 26); }),
  b: wall((g, w, h) => { g.fillStyle = '#1c1512'; g.fillRect(0, 0, w, h); for (let y = 0, r = 0; y < h; y += 12, r++) for (let x = -16 * (r % 2); x < w; x += 32) { const v = 52 + rnd() * 26 | 0; g.fillStyle = `rgb(${v + 22},${v - 6},${v - 18})`; g.fillRect(x + 1, y + 1, 30, 10); }
    stains(g, w, h, 20, 'rgba(0,0,0,.6)'); streaks(g, w, h, 8, 'rgba(0,0,0,.5)'); }),
};
if (WALL.t.isMeshStandardMaterial) { WALL.t.roughness = .42; WALL.c.roughness = .6; }
WALL.m = WALL.t; WALL.s = WALL.b; WALL.r = WALL.o; WALL.D = WALL.c;
export const FLOOR = {
  l: floor((g, w, h) => { for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) { g.fillStyle = (i + j) % 2 ? '#7c8473' : '#38423d'; g.fillRect(i * 64, j * 64, 64, 64); } g.strokeStyle = '#151916'; for (let i = 0; i <= 4; i++) { g.strokeRect(i * 64, 0, 0, h); g.strokeRect(0, i * 64, w, 0); } stains(g, w, h, 14, 'rgba(22,16,8,.5)'); speck(g, w, h, 300, .3); }),
  c: floor((g, w, h) => { g.fillStyle = '#56645a'; g.fillRect(0, 0, w, h); speck(g, w, h, 1400, .35); g.strokeStyle = '#2a332d'; g.strokeRect(0, 0, 128, 256); g.strokeRect(128, 0, 128, 256); stains(g, w, h, 16, 'rgba(14,14,8,.5)');
    g.strokeStyle = 'rgba(10,10,8,.5)'; g.lineWidth = 2; for (let i = 0; i < 9; i++) { g.beginPath(); g.arc(rnd() * w, rnd() * h, 20 + rnd() * 40, rnd() * 6, rnd() * 6 + 1); g.stroke(); } }),
  p: floor((g, w, h) => { g.fillStyle = '#3c3d38'; g.fillRect(0, 0, w, h); speck(g, w, h, 1500, .4); stains(g, w, h, 20, 'rgba(8,8,4,.6)'); cracks(g, w, h, 5, 'rgba(0,0,0,.8)'); stains(g, w, h, 3, 'rgba(60,10,8,.5)'); }),
  o: floor((g, w, h) => { for (let i = 0; i < 8; i++) { const v = 40 + rnd() * 20 | 0; g.fillStyle = `rgb(${v + 20},${v + 2},${v - 14})`; g.fillRect(i * 32, 0, 31, h); g.fillStyle = '#0c0806'; g.fillRect(i * 32 + 31, 0, 1, h); for (let j = 0; j < 3; j++) g.fillRect(i * 32, rnd() * h, 31, 1); } stains(g, w, h, 10, 'rgba(0,0,0,.45)'); }),
  d: floor((g, w, h) => { for (let i = 0; i < 8; i++) for (let j = 0; j < 8; j++) { g.fillStyle = (i + j) % 2 ? '#5a4630' : '#6d5a3c'; g.fillRect(i * 32, j * 32, 32, 32); } speck(g, w, h, 900, .3); stains(g, w, h, 14, 'rgba(16,10,4,.55)'); }),
  t: floor((g, w, h) => { tiles(g, 0, 0, w, h, 16, '#8e9388', '#4a4f48', 12); stains(g, w, h, 16, 'rgba(40,34,18,.5)'); stains(g, w, h, 4, 'rgba(84,12,8,.5)', 10, 30); }),
  b: floor((g, w, h) => { g.fillStyle = '#2f2f2c'; g.fillRect(0, 0, w, h); speck(g, w, h, 1800, .45); stains(g, w, h, 22, 'rgba(0,0,0,.6)'); cracks(g, w, h, 6, 'rgba(0,0,0,.8)'); }),
};
FLOOR.m = FLOOR.t; FLOOR.s = FLOOR.b; FLOOR.r = FLOOR.o; FLOOR.D = FLOOR.c;
export const CEIL = floor((g, w, h) => { g.fillStyle = '#5a5c54'; g.fillRect(0, 0, w, h); speck(g, w, h, 900, .25); g.strokeStyle = '#25261f'; g.lineWidth = 2; for (let i = 0; i <= 2; i++) { g.strokeRect(i * 128, 0, 0, h); g.strokeRect(0, i * 128, w, 0); }
  for (let i = 0; i < 5; i++) { const x = rnd() * w, y = rnd() * h, r = 14 + rnd() * 30; g.strokeStyle = 'rgba(60,40,14,.6)'; g.lineWidth = 3; g.beginPath(); g.arc(x, y, r, 0, 7); g.stroke(); g.fillStyle = 'rgba(60,44,18,.3)'; g.fill(); } g.fillStyle = '#080807'; g.fillRect(128, 0, 127, 127); });

const DW = 128, DHH = 282, dm = draw => lit({ map: tex(DW, DHH, draw) });
export const M = {
  doorWood: dm((g, w, h) => { g.fillStyle = '#34241a'; g.fillRect(0, 0, w, h); g.strokeStyle = '#150d08'; g.lineWidth = 4; g.strokeRect(14, 14, w - 28, 110); g.strokeRect(14, 142, w - 28, 122); stains(g, w, h, 8, 'rgba(0,0,0,.5)'); streaks(g, w, h, 6, 'rgba(0,0,0,.3)'); }),
  doorWard: dm((g, w, h) => { g.fillStyle = '#5e6a58'; g.fillRect(0, 0, w, h); g.fillStyle = '#080c0e'; g.fillRect(40, 30, 48, 70); g.strokeStyle = '#2a2e26'; g.lineWidth = 1; for (let i = 0; i < 9; i++) { g.strokeRect(40 + i * 6, 30, 0, 70); g.strokeRect(40, 30 + i * 9, 48, 0); }
    g.lineWidth = 3; g.strokeRect(40, 30, 48, 70); g.fillStyle = '#3a3d34'; g.fillRect(0, h - 40, w, 40); stains(g, w, h, 9, 'rgba(26,18,8,.55)'); g.fillStyle = 'rgba(80,12,8,.6)'; g.fillRect(70, 150, 22, 5); g.fillRect(74, 155, 4, 40); }),
  doorSteel: dm((g, w, h) => { g.fillStyle = '#4b5052'; g.fillRect(0, 0, w, h); speck(g, w, h, 500, .3); g.fillStyle = '#23272a'; for (let y = 10; y < h; y += 44) for (const x of [8, w - 12]) { g.beginPath(); g.arc(x + 2, y, 3, 0, 7); g.fill(); }
    g.strokeStyle = '#1a1d1f'; g.lineWidth = 3; g.strokeRect(4, 4, w - 8, h - 8); streaks(g, w, h, 12, 'rgba(96,48,20,.5)'); stains(g, w, h, 8, 'rgba(0,0,0,.45)'); g.fillStyle = '#34393b'; g.fillRect(0, h - 44, w, 44); }),
  doorExit: dm((g, w, h) => { g.fillStyle = '#1b1e1c'; g.fillRect(0, 0, w, h); g.fillStyle = '#0c1826'; g.fillRect(12, 16, 46, 180); g.fillRect(70, 16, 46, 180); g.fillStyle = '#16283a'; g.fillRect(12, 120, 46, 76); g.fillRect(70, 120, 46, 76);
    g.strokeStyle = '#2c302c'; g.lineWidth = 3; g.strokeRect(12, 16, 46, 180); g.strokeRect(70, 16, 46, 180); g.fillStyle = '#6a6d60'; g.fillRect(20, 206, 88, 8); g.fillStyle = '#0a0a0a'; g.fillRect(62, 0, 4, h); }),
  wood: lit(0x2a1d14), woodLight: lit(0x5a4630), woodDark: lit(0x160f0a),
  steel: lit({ color: 0x6a7274, rough: .4 }), steelDark: lit(0x2a2f31), chrome: lit({ color: 0x9aa3a6, rough: .25 }), black: lit(0x0b0b0b), rubber: lit(0x151515),
  rust: lit({ map: tex(128, 128, (g, w, h) => { g.fillStyle = '#4a2c18'; g.fillRect(0, 0, w, h); speck(g, w, h, 700, .5); stains(g, w, h, 14, 'rgba(120,60,20,.6)', 4, 20); stains(g, w, h, 10, 'rgba(0,0,0,.5)'); }) }),
  enamel: lit(0x9aa093), enamelDirty: lit(0x70766a), porcelain: lit({ color: 0xa7aba0, rough: .3 }),
  sheet: lit({ map: tex(128, 128, (g, w, h) => { g.fillStyle = '#a3a394'; g.fillRect(0, 0, w, h); streaks(g, w, h, 10, 'rgba(60,60,50,.25)'); stains(g, w, h, 8, 'rgba(70,56,24,.4)'); stains(g, w, h, 2, 'rgba(90,16,10,.5)', 6, 20); }) }),
  mattress: lit({ map: tex(128, 128, (g, w, h) => { g.fillStyle = '#7d7a66'; g.fillRect(0, 0, w, h); g.fillStyle = '#5c6470'; for (let x = 6; x < w; x += 16) g.fillRect(x, 0, 3, h); stains(g, w, h, 10, 'rgba(50,34,10,.6)'); stains(g, w, h, 2, 'rgba(70,10,8,.6)', 10, 26); }) }),
  leather: lit({ color: 0x3a1f1a, rough: .5 }), strap: lit(0x4a3a22), brass: lit({ color: 0x9a7a30, emissive: 0x2a1c04 }), ceramic: lit({ color: 0xc8c2a8, emissive: 0x2c2a20 }),
  yellow: lit({ color: 0xb09018, emissive: 0x2a2204 }), red: lit(0x7a1f18), green: lit(0x3b5a44), paper: lit({ color: 0xb8b29a, emissive: 0x1c1a14 }),
  cloth: lit(0x9a9a8c), coat: lit(0xa8a89a), plant: lit(0x2c2a16), pot: lit(0x5a3a26), plastic: lit(0x6a4a2c), skin: lit(0x8f8a78), bag: lit({ color: 0x15171a, rough: .35 }),
  tubeOn: glow(0xe6f4ff), brick: WALL.b, tile: WALL.t,
  fire: glow(0xff7a20), glass: lit({ color: 0x1a2428, transparent: true, opacity: .55 }),
  window: glow(0xffffff), tvBody: lit(0x2b241c),
  dials: lit({ map: tex(128, 64, (g, w, h) => { g.fillStyle = '#2a2d2a'; g.fillRect(0, 0, w, h); for (const [x, r] of [[22, 15], [58, 15], [98, 20]]) { g.fillStyle = '#c9c4a8'; g.beginPath(); g.arc(x, 30, r, 0, 7); g.fill(); g.strokeStyle = '#111'; g.lineWidth = 2; g.beginPath(); g.moveTo(x, 30); g.lineTo(x + r * .7, 30 - r * .6); g.stroke(); }
    g.fillStyle = '#8a1a14'; g.fillRect(8, 52, 10, 7); g.fillStyle = '#c9c4a8'; g.font = '8px sans-serif'; g.fillText('VOLTS      mA       SEC', 8, 10); }) }),
  drawer: lit({ map: tex(64, 64, (g, w, h) => { g.fillStyle = '#737b7c'; g.fillRect(0, 0, w, h); g.strokeStyle = '#2a2f31'; g.lineWidth = 3; g.strokeRect(2, 2, w - 4, h - 4); g.fillStyle = '#c4bfa4'; g.fillRect(22, 12, 20, 9); g.fillStyle = '#1c2022'; g.fillRect(18, 40, 28, 6); streaks(g, w, h, 5, 'rgba(90,48,20,.5)'); }) }),
  cabinet: lit({ map: tex(64, 128, (g, w, h) => { g.fillStyle = '#4d5448'; g.fillRect(0, 0, w, h); for (let i = 0; i < 4; i++) { g.strokeStyle = '#1c201a'; g.lineWidth = 2; g.strokeRect(3, i * 32 + 3, w - 6, 27); g.fillStyle = '#b8b29a'; g.fillRect(22, i * 32 + 8, 20, 6); g.fillStyle = '#15180f'; g.fillRect(24, i * 32 + 19, 16, 4); } stains(g, w, h, 6, 'rgba(60,34,10,.5)'); }) }),
  locker: lit({ map: tex(64, 128, (g, w, h) => { g.fillStyle = '#48584e'; g.fillRect(0, 0, w, h); g.strokeStyle = '#18201b'; g.lineWidth = 2; g.strokeRect(2, 2, w - 4, h - 4); g.fillStyle = '#18201b'; for (let y = 12; y < 30; y += 5) g.fillRect(14, y, 36, 2); g.fillRect(48, 64, 5, 10); stains(g, w, h, 6, 'rgba(60,30,10,.5)'); }) }),
  static: lit({ map: tex(64, 48, g => { g.fillStyle = '#000'; g.fillRect(0, 0, 64, 48); }) }),
  screenOff: lit(0x0a0f0d),
  win: glow(0xffffff),
  clock: decal(64, 64, (g) => { g.fillStyle = '#b9b49c'; g.beginPath(); g.arc(32, 32, 30, 0, 7); g.fill(); g.strokeStyle = '#111'; g.lineWidth = 3; g.stroke(); g.lineWidth = 2; g.beginPath(); g.moveTo(32, 32); g.lineTo(32, 10); g.moveTo(32, 32); g.lineTo(26, 17); g.stroke(); for (let i = 0; i < 12; i++) { const a = i * Math.PI / 6; g.fillStyle = '#111'; g.fillRect(31 + Math.sin(a) * 25, 31 - Math.cos(a) * 25, 2, 2); } }),
  board: lit({ map: tex(128, 96, (g, w, h) => { g.fillStyle = '#5a4428'; g.fillRect(0, 0, w, h); speck(g, w, h, 300, .4); for (let i = 0; i < 9; i++) { g.save(); g.translate(14 + (i % 4) * 30, 14 + (i / 4 | 0) * 28); g.rotate(rnd() * .3 - .15); g.fillStyle = rnd() < .3 ? '#a59a6a' : '#b8b29a'; g.fillRect(0, 0, 22, 26); g.fillStyle = '#333'; for (let y = 4; y < 22; y += 4) g.fillRect(3, y, 10 + rnd() * 7, 1); g.restore(); } g.strokeStyle = '#1c130a'; g.lineWidth = 5; g.strokeRect(0, 0, w, h); }) }),
  mirror: lit({ map: tex(64, 96, (g, w, h) => { g.fillStyle = '#39423f'; g.fillRect(0, 0, w, h); stains(g, w, h, 8, 'rgba(10,10,8,.6)'); g.strokeStyle = '#aab3ae'; g.lineWidth = 1; g.beginPath(); g.moveTo(40, 30); for (const [x, y] of [[10, 5], [40, 30], [62, 12], [40, 30], [58, 80], [40, 30], [6, 60], [40, 30], [30, 95]]) g.lineTo(x, y); g.stroke(); g.strokeStyle = '#1a1a16'; g.lineWidth = 4; g.strokeRect(0, 0, w, h); }) }),
  drawing: i => decal(64, 80, (g, w, h) => { g.fillStyle = '#b8b29a'; g.fillRect(0, 0, w, h); const col = ['#7a1f18', '#111', '#2a3a5a'][i % 3]; g.strokeStyle = col; g.lineWidth = 2;
    if (i % 4 == 0) { g.beginPath(); g.arc(32, 26, 12, 0, 7); g.stroke(); g.fillStyle = '#000'; g.fillRect(26, 21, 4, 6); g.fillRect(35, 21, 4, 6); g.beginPath(); g.moveTo(32, 38); g.lineTo(32, 72); g.moveTo(32, 46); g.lineTo(8, 76); g.moveTo(32, 46); g.lineTo(56, 76); g.stroke(); }
    else if (i % 4 == 1) { for (let k = 0; k < 5; k++) { g.strokeRect(8 + k * 10, 20, 0, 40); } g.beginPath(); g.moveTo(4, 30); g.lineTo(60, 52); g.stroke(); g.beginPath(); g.arc(32, 40, 5, 0, 7); g.fill(); }
    else if (i % 4 == 2) { g.beginPath(); for (let k = 0; k < 90; k++) g.lineTo(32 + Math.cos(k * .5) * k * .3, 40 + Math.sin(k * .5) * k * .3); g.stroke(); }
    else { g.font = 'bold 12px sans-serif'; g.fillStyle = col; g.fillText('HE IS', 12, 30); g.fillText('STILL', 12, 46); g.fillText('HERE', 12, 62); } }),
  blood: decal(128, 128, (g, w, h) => { stains(g, w, h, 9, 'rgba(70,8,6,.95)', 6, 30); for (let i = 0; i < 40; i++) { g.fillStyle = 'rgba(60,6,4,.9)'; g.beginPath(); g.arc(rnd() * w, rnd() * h, rnd() * 3, 0, 7); g.fill(); } }),
  trail: decal(64, 256, (g, w, h) => { for (let i = 0; i < 5; i++) { g.strokeStyle = `rgba(${52 + rnd() * 24 | 0},6,4,${.5 + rnd() * .4})`; g.lineWidth = 3 + rnd() * 9; let x = 14 + rnd() * 36; g.beginPath(); g.moveTo(x, 0); for (let y = 0; y <= h; y += 24) g.lineTo(x += rnd() * 8 - 4, y); g.stroke(); } }),
  hand: decal(64, 96, (g) => { g.fillStyle = 'rgba(64,8,6,.9)'; g.beginPath(); g.ellipse(32, 44, 13, 15, 0, 0, 7); g.fill(); for (const [x, y, l] of [[16, 30, 20], [25, 24, 26], [34, 23, 27], [43, 27, 22]]) g.fillRect(x, y - l, 6, l + 4); g.save(); g.translate(48, 48); g.rotate(.9); g.fillRect(0, -18, 6, 20); g.restore(); g.fillRect(24, 56, 4, 38); g.fillRect(36, 58, 3, 28); }),
  tally: decal(256, 128, (g) => { g.strokeStyle = 'rgba(20,16,10,.95)'; g.lineWidth = 2; for (let r = 0; r < 4; r++) for (let c = 0; c < 9; c++) { const x = 8 + c * 27, y = 6 + r * 30; for (let k = 0; k < 4; k++) { g.beginPath(); g.moveTo(x + k * 5, y); g.lineTo(x + k * 5 + rnd() * 2, y + 20); g.stroke(); } g.beginPath(); g.moveTo(x - 3, y + 16); g.lineTo(x + 20, y + 3); g.stroke(); } }),
  scrawl: t => decal(256, 128, (g, w, h) => { g.fillStyle = 'rgba(70,8,6,.92)'; g.font = 'bold 34px sans-serif'; g.textAlign = 'center'; t.split('\n').forEach((l, i, a) => { g.save(); g.translate(w / 2, h / 2 + (i - (a.length - 1) / 2) * 40 + 10); g.rotate(rnd() * .08 - .04); g.fillText(l, 0, 0); g.restore(); }); streaks(g, w, h, 5, 'rgba(70,8,6,.6)', 60); }),
  papers: decal(64, 64, (g) => { for (let i = 0; i < 3; i++) { g.save(); g.translate(20 + rnd() * 24, 20 + rnd() * 24); g.rotate(rnd() * 6); g.fillStyle = '#aaa48c'; g.fillRect(-12, -16, 24, 32); g.fillStyle = '#444'; for (let y = -12; y < 12; y += 4) g.fillRect(-9, y, 10 + rnd() * 8, 1); g.restore(); } }),
  grate: decal(64, 64, (g) => { g.fillStyle = '#0a0a0a'; g.fillRect(8, 8, 48, 48); g.fillStyle = '#4a4f48'; for (let x = 12; x < 56; x += 8) g.fillRect(x, 8, 3, 48); g.strokeStyle = '#30342f'; g.lineWidth = 3; g.strokeRect(8, 8, 48, 48); }),
};
const signs = {};
export function sign(text, bg = '#b8b29a', fg = '#15150f', w = 256, h = 64) {
  const k = text + bg; if (signs[k]) return signs[k];
  return signs[k] = lit({ emissive: 0x141410, map: tex(w, h, (g) => { g.fillStyle = bg; g.fillRect(0, 0, w, h); stains(g, w, h, 4, 'rgba(40,30,14,.35)'); g.strokeStyle = fg; g.lineWidth = 2; g.strokeRect(3, 3, w - 6, h - 6); g.fillStyle = fg; g.textAlign = 'center'; g.textBaseline = 'middle';
    const L = text.split('\n'); let s = Math.min(h * .62 / L.length, 40); g.font = `bold ${s}px sans-serif`; while (L.some(l => g.measureText(l).width > w - 20)) g.font = `bold ${--s}px sans-serif`; L.forEach((l, i) => g.fillText(l, w / 2, h / 2 + (i - (L.length - 1) / 2) * s * 1.15)); }) });
}
export function windowTex() {
  return tex(128, 128, (g, w, h) => { const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#16263c'); gr.addColorStop(1, '#0a121c'); g.fillStyle = gr; g.fillRect(0, 0, w, h); g.fillStyle = '#05080a'; for (let i = 0; i < 6; i++) { const x = rnd() * w; g.fillRect(x, 60 + rnd() * 30, 3, 70); g.beginPath(); g.moveTo(x - 14, 128); g.lineTo(x + 1, 30 + rnd() * 30); g.lineTo(x + 16, 128); g.fill(); }
    g.fillStyle = '#c8d4e0'; g.beginPath(); g.arc(96, 26, 9, 0, 7); g.fill(); g.fillStyle = '#060707'; for (let x = 0; x < w; x += 18) g.fillRect(x, 0, 4, h); g.fillRect(0, 60, w, 5); g.strokeStyle = '#060707'; g.lineWidth = 8; g.strokeRect(0, 0, w, h); });
}
M.win = new T.MeshBasicMaterial({ map: windowTex() });
const sctx = M.static.map.image.getContext('2d'), sd = sctx.createImageData(64, 48);
export function staticFrame(on) {
  for (let i = 0; i < sd.data.length; i += 4) { const v = on ? Math.random() * 255 : 6; sd.data[i] = sd.data[i + 1] = sd.data[i + 2] = v; sd.data[i + 3] = 255; }
  sctx.putImageData(sd, 0, 0); M.static.map.needsUpdate = true;
}
M.static.emissive = new T.Color(0x8090a0); M.static.emissiveMap = M.static.map; M.static.color.set(0x000000);
