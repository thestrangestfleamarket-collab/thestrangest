// Painted menu art, generated once at boot on canvases and handed to CSS as images:
'use strict';
// a matchbox-and-crumbs title logo, an old recipe card, wooden ticket rails, bottle-cap night tokens,
// paper order tickets for buttons, a pushpin, a torn diner receipt and rubber-stamp stars.
(function () {
const N = MC.noise, root = document.documentElement;
const cv = (w, h) => { const c = document.createElement('canvas'); c.width = w; c.height = h; return [c, c.getContext('2d')]; };
const url = c => 'url(' + c.toDataURL('image/png') + ')';
const set = (k, c) => root.style.setProperty(k, url(c));
function grain(g, w, h, amt, seed, dark = '40,25,10', light = '255,250,235') { const r = MC.rng(seed); for (let i = 0; i < w * h * amt; i++) { g.fillStyle = 'rgba(' + (r() < 0.5 ? dark : light) + ',' + (r() * 0.09) + ')'; g.fillRect(r() * w, r() * h, 1 + r() * 2, 1 + r() * 2); } }
function stains(g, w, h, n, seed) { const r = MC.rng(seed); for (let i = 0; i < n; i++) { const x = r() * w, y = r() * h, rad = 20 + r() * 90, gr = g.createRadialGradient(x, y, rad * 0.6, x, y, rad); gr.addColorStop(0, 'rgba(150,100,40,0)'); gr.addColorStop(0.85, 'rgba(150,100,40,' + (0.05 + r() * 0.07) + ')'); gr.addColorStop(1, 'rgba(150,100,40,0)'); g.fillStyle = gr; g.fillRect(x - rad, y - rad, rad * 2, rad * 2); } }

// old recipe card: warm paper, fibres, coffee rings, ruled lines, red margin
function paper() {
  const [c, g] = cv(512, 512); g.fillStyle = '#efe2c4'; g.fillRect(0, 0, 512, 512);
  const id = g.getImageData(0, 0, 512, 512), d = id.data;
  for (let y = 0; y < 512; y++) for (let x = 0; x < 512; x++) { const n = N.fbm(x / 512, y / 512, 4, 6, 6, 4) - 0.5, f = N.vnoise(x / 3, y / 40, 171, 9) - 0.5, i = (y * 512 + x) * 4; d[i] += n * 40 + f * 8; d[i + 1] += n * 34 + f * 7; d[i + 2] += n * 22 + f * 5; }
  g.putImageData(id, 0, 0); stains(g, 512, 512, 5, 3); grain(g, 512, 512, 0.25, 8);
  g.strokeStyle = 'rgba(90,120,170,0.16)'; g.lineWidth = 1; for (let y = 34; y < 512; y += 34) { g.beginPath(); g.moveTo(0, y); g.lineTo(512, y); g.stroke(); }
  return c;
}
// dark stained wood for rails and the board behind everything
function wood(w, h, base, seed) {
  const [c, g] = cv(w, h), id = g.createImageData(w, h), d = id.data, b = [parseInt(base.slice(1, 3), 16), parseInt(base.slice(3, 5), 16), parseInt(base.slice(5, 7), 16)];
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { const n = N.fbm(x / w, y / h, 4, 3, 10, seed), ring = 0.5 + 0.5 * Math.sin((y / h * 26 + n * 7) * 3.1), k = 0.68 + 0.22 * ring + 0.25 * (n - 0.5), i = (y * w + x) * 4; d[i] = b[0] * k; d[i + 1] = b[1] * k; d[i + 2] = b[2] * k; d[i + 3] = 255; }
  g.putImageData(id, 0, 0); grain(g, w, h, 0.15, seed + 1, '0,0,0', '255,220,170'); return c;
}
// bottle-cap token: crimped tin rim, painted face, little rust
function cap(face, ring, seed, rusty) {
  const [c, g] = cv(160, 160), cx = 80, cy = 80, r = MC.rng(seed);
  g.fillStyle = 'rgba(0,0,0,0.45)'; g.beginPath(); g.ellipse(cx + 4, cy + 7, 70, 68, 0, 0, 7); g.fill();
  g.beginPath(); for (let i = 0; i <= 84; i++) { const a = i / 84 * 6.2832, R = i % 4 < 2 ? 74 : 67; g.lineTo(cx + Math.cos(a) * R, cy + Math.sin(a) * R); } g.closePath();
  let gr = g.createLinearGradient(20, 10, 140, 150); gr.addColorStop(0, '#f4f4f0'); gr.addColorStop(0.45, '#9ea3a8'); gr.addColorStop(0.7, '#d9dcdf'); gr.addColorStop(1, '#5d6268'); g.fillStyle = gr; g.fill();
  for (let i = 0; i < 42; i++) { const a = i / 42 * 6.2832; g.strokeStyle = 'rgba(0,0,0,0.25)'; g.lineWidth = 2; g.beginPath(); g.moveTo(cx + Math.cos(a) * 58, cy + Math.sin(a) * 58); g.lineTo(cx + Math.cos(a) * 72, cy + Math.sin(a) * 72); g.stroke(); }
  gr = g.createRadialGradient(cx - 18, cy - 22, 6, cx, cy, 58); gr.addColorStop(0, face[0]); gr.addColorStop(1, face[1]); g.fillStyle = gr; g.beginPath(); g.arc(cx, cy, 56, 0, 7); g.fill();
  g.strokeStyle = ring; g.lineWidth = 4; g.beginPath(); g.arc(cx, cy, 49, 0, 7); g.stroke(); g.strokeStyle = 'rgba(255,255,255,0.25)'; g.lineWidth = 2; g.beginPath(); g.arc(cx, cy, 55, 3.6, 5.2); g.stroke();
  if (rusty) for (let i = 0; i < 60; i++) { g.fillStyle = 'rgba(' + (120 + r() * 60) + ',' + (50 + r() * 30) + ',20,' + (0.1 + r() * 0.3) + ')'; const a = r() * 6.28, d = 30 + r() * 42; g.beginPath(); g.arc(cx + Math.cos(a) * d, cy + Math.sin(a) * d, 1 + r() * 4, 0, 7); g.fill(); }
  return c;
}
// paper order ticket for buttons: perforated top, punched hole, slight shadow
function ticket(col, ink, seed) {
  const [c, g] = cv(320, 110), r = MC.rng(seed);
  g.fillStyle = col; g.beginPath(); g.moveTo(6, 10); for (let x = 6; x <= 314; x += 8) g.lineTo(x + 4, 10 + (r() * 3)); g.lineTo(314, 102); g.lineTo(6, 104); g.closePath(); g.fill();
  grain(g, 320, 110, 0.4, seed, '60,40,20', '255,255,240'); g.fillStyle = 'rgba(0,0,0,0.12)'; for (let x = 12; x < 312; x += 10) { g.beginPath(); g.arc(x, 16, 1.6, 0, 7); g.fill(); }
  g.strokeStyle = ink; g.globalAlpha = 0.35; g.setLineDash([6, 5]); g.lineWidth = 2; g.strokeRect(14, 24, 292, 70); g.setLineDash([]); g.globalAlpha = 1;
  return c;
}
// a red pushpin like the ones on the counter
function pin() {
  const [c, g] = cv(64, 64); g.fillStyle = 'rgba(0,0,0,0.35)'; g.beginPath(); g.ellipse(36, 40, 18, 9, 0.4, 0, 7); g.fill();
  let gr = g.createRadialGradient(24, 20, 2, 30, 28, 22); gr.addColorStop(0, '#ff8a7a'); gr.addColorStop(0.4, '#d4302a'); gr.addColorStop(1, '#6a0e0a'); g.fillStyle = gr; g.beginPath(); g.arc(30, 28, 19, 0, 7); g.fill();
  g.fillStyle = 'rgba(255,255,255,0.75)'; g.beginPath(); g.ellipse(23, 20, 6, 4, -0.6, 0, 7); g.fill(); return c;
}
// torn receipt
function receipt() {
  const [c, g] = cv(480, 720), r = MC.rng(12); g.fillStyle = '#f7f3ea'; g.beginPath(); g.moveTo(0, 12);
  for (let x = 0; x <= 480; x += 16) g.lineTo(x, (x / 16) % 2 ? 0 : 12);
  for (let x = 480; x >= 0; x -= 10) g.lineTo(x, 704 + r() * 16); g.closePath(); g.fill();
  grain(g, 480, 720, 0.15, 13, '80,70,60', '255,255,255'); stains(g, 480, 720, 2, 14);
  return c;
}
function stamp(on) { // rubber-stamped star
  const [c, g] = cv(140, 140), r = MC.rng(on ? 21 : 22); g.translate(70, 70); g.rotate((r() - 0.5) * 0.4);
  g.beginPath(); for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, R = i % 2 ? 26 : 58; g.lineTo(Math.cos(a) * R, Math.sin(a) * R); } g.closePath();
  if (on) { g.fillStyle = '#c4321f'; g.fill(); } else { g.strokeStyle = 'rgba(80,70,60,0.5)'; g.setLineDash([7, 6]); g.lineWidth = 5; g.stroke(); }
  g.globalCompositeOperation = 'destination-out'; for (let i = 0; i < 500; i++) { g.fillStyle = 'rgba(0,0,0,' + r() * 0.6 + ')'; g.fillRect((r() - 0.5) * 130, (r() - 0.5) * 130, 1 + r() * 3, 1 + r() * 3); }
  return c;
}
// the logo: matchbox lettering, a little mouse on the M, crumbs, a crescent moon
function logo() {
  const [c, g] = cv(1200, 340), F = '"Bree Serif", Georgia, serif';
  g.save(); g.translate(600, 0);
  g.fillStyle = '#f6efd8'; g.beginPath(); g.arc(-505, 92, 50, 0, 7); g.fill(); g.fillStyle = '#1a1830'; g.beginPath(); g.arc(-485, 76, 46, 0, 7); g.fill(); // moon
  const word = (t, y, size, fill, edge) => { g.font = '700 ' + size + 'px ' + F; g.textAlign = 'center'; g.lineJoin = 'round';
    g.strokeStyle = 'rgba(0,0,0,0.55)'; g.lineWidth = 22; g.strokeText(t, 6, y + 9);
    g.strokeStyle = edge; g.lineWidth = 16; g.strokeText(t, 0, y);
    const gr = g.createLinearGradient(0, y - size, 0, y); gr.addColorStop(0, fill[0]); gr.addColorStop(1, fill[1]); g.fillStyle = gr; g.fillText(t, 0, y);
    g.fillStyle = 'rgba(255,255,255,0.35)'; g.save(); g.beginPath(); g.rect(-600, y - size, 1200, size * 0.42); g.clip(); g.fillText(t, 0, y); g.restore(); };
  word('MIDNIGHT', 150, 132, ['#ffe39a', '#f2a93b'], '#3b1d0c');
  word('CRUMBS', 292, 150, ['#fff4dc', '#e7c48a'], '#3b1d0c');
  // mouse peeking over the M
  g.translate(-370, 42); g.fillStyle = '#8f8678'; g.beginPath(); g.ellipse(0, 22, 42, 28, 0, 0, 7); g.fill();
  for (const sd of [-1, 1]) { g.fillStyle = '#8f8678'; g.beginPath(); g.arc(sd * 32, -4, 22, 0, 7); g.fill(); g.fillStyle = '#e9a6a0'; g.beginPath(); g.arc(sd * 32, -4, 13, 0, 7); g.fill(); }
  g.fillStyle = '#111'; for (const sd of [-1, 1]) { g.beginPath(); g.arc(sd * 14, 14, 6, 0, 7); g.fill(); } g.fillStyle = '#fff'; for (const sd of [-1, 1]) { g.beginPath(); g.arc(sd * 14 - 2, 12, 2, 0, 7); g.fill(); }
  g.fillStyle = '#e9a6a0'; g.beginPath(); g.arc(0, 32, 7, 0, 7); g.fill(); g.strokeStyle = 'rgba(30,20,10,0.6)'; g.lineWidth = 1.5; for (const sd of [-1, 1]) for (let k = -1; k <= 1; k++) { g.beginPath(); g.moveTo(sd * 8, 32 + k * 3); g.lineTo(sd * 44, 28 + k * 9); g.stroke(); }
  g.fillStyle = '#8f8678'; for (const sd of [-1, 1]) { g.beginPath(); g.ellipse(sd * 24, 52, 10, 7, 0, 0, 7); g.fill(); }
  g.restore();
  const r = MC.rng(4); for (let i = 0; i < 26; i++) { const x = 180 + r() * 840, y = 300 + r() * 34, s = 3 + r() * 7; g.fillStyle = r() < 0.5 ? '#e7c48a' : '#b98444'; g.beginPath(); g.moveTo(x, y - s); g.lineTo(x + s, y); g.lineTo(x + s * 0.3, y + s * 0.8); g.lineTo(x - s, y + s * 0.2); g.closePath(); g.fill(); }
  return c;
}
let built = false;
MC.menuArt = function () {
  if (built) return; built = true;
  set('--paper', paper()); set('--wood', wood(512, 256, '#6b4423', 5)); set('--wood-dark', wood(512, 512, '#3a2414', 9));
  set('--cap', cap(['#ffd27a', '#d98a1c'], '#7a3b0c', 1)); set('--cap-sel', cap(['#ff8a6a', '#c42f1c'], '#5a1208', 2)); set('--cap-locked', cap(['#7a7f86', '#3d4148'], '#24272c', 3, true));
  set('--ticket', ticket('#fbf6e6', '#7a5a3a', 6)); set('--ticket-hot', ticket('#ffd88a', '#7a3b0c', 7)); set('--ticket-dim', ticket('#d9cdb4', '#5a4a3a', 8));
  set('--pin', pin()); set('--receipt', receipt()); set('--stamp', stamp(true)); set('--stamp-off', stamp(false));
  const L = logo(), img = document.getElementById('logo'); if (img) img.src = L.toDataURL('image/png');
};
const go = () => { MC.menuArt(); if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => { built = false; MC.menuArt(); }); };
go();
})();
