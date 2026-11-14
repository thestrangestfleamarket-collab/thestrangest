// the cart's and the street's pictures, all drawn on canvases; ageing them (dirty), relief from a picture (normalOf)
import * as THREE from 'three';

export const JP = "'Noto Sans JP','Noto Sans CJK JP','Hiragino Sans','Hiragino Kaku Gothic ProN','Yu Gothic','Meiryo','IPAGothic','IPAPGothic',sans-serif";
export const MONO = "'Courier New',Courier,monospace";

export function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function canvasTex(w, h, draw, o = {}) {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  const g = c.getContext('2d');
  draw(g, w, h);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = o.linear ? THREE.NoColorSpace : THREE.SRGBColorSpace;
  t.anisotropy = 8;
  if (o.repeat) { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(o.repeat[0], o.repeat[1]); }
  t.userData.canvas = c; t.userData.ctx = g;
  return t;
}

function speckle(g, w, h, n, r, cols, R, aMin = 0.1, aMax = 0.5) {
  for (let i = 0; i < n; i++) {
    g.globalAlpha = aMin + R() * (aMax - aMin);
    g.fillStyle = cols[(R() * cols.length) | 0];
    const s = r * (0.4 + R());
    g.fillRect(R() * w, R() * h, s, s);
  }
  g.globalAlpha = 1;
}

export function woodTex(base = '#5a3a22', dark = '#2c1a0e', repeat = [1, 1], seed = 3) {
  return canvasTex(512, 512, (g, w, h) => {
    const R = rng(seed);
    g.fillStyle = base; g.fillRect(0, 0, w, h);
    for (let i = 0; i < 260; i++) {
      g.globalAlpha = 0.05 + R() * 0.22;
      g.strokeStyle = R() > 0.3 ? dark : '#c9965c';
      g.lineWidth = 0.5 + R() * 2.2;
      const y = R() * h; g.beginPath(); g.moveTo(0, y);
      const a = R() * 6, f = 0.004 + R() * 0.01, p = R() * 6;
      for (let x = 0; x <= w; x += 16) g.lineTo(x, y + Math.sin(x * f + p) * a);
      g.stroke();
    }
    g.globalAlpha = 0.5; g.fillStyle = dark;
    for (let i = 1; i < 4; i++) g.fillRect(0, (i * h) / 4 - 1, w, 2.5); // plank seams
    g.globalAlpha = 1;
    speckle(g, w, h, 500, 2, [dark, '#000'], R, 0.03, 0.15);
  }, { repeat });
}

export function steelTex(repeat = [1, 1]) {
  return canvasTex(256, 256, (g, w, h) => {
    const R = rng(11);
    g.fillStyle = '#b9bcc0'; g.fillRect(0, 0, w, h);
    for (let i = 0; i < 900; i++) {
      g.globalAlpha = 0.04 + R() * 0.1;
      g.fillStyle = R() > 0.5 ? '#fff' : '#555';
      g.fillRect(R() * w, R() * h, 20 + R() * 120, 1);
    }
    g.globalAlpha = 1;
  }, { repeat });
}

export function asphaltTex(repeat) {
  return canvasTex(512, 512, (g, w, h) => {
    const R = rng(5);
    g.fillStyle = '#16161a'; g.fillRect(0, 0, w, h);
    speckle(g, w, h, 9000, 2.2, ['#2b2b31', '#0b0b0d', '#3a3a40', '#1d1d22'], R, 0.2, 0.8);
    g.strokeStyle = '#08080a'; g.lineWidth = 1.4; g.globalAlpha = 0.6;
    for (let i = 0; i < 7; i++) {
      g.beginPath(); let x = R() * w, y = R() * h; g.moveTo(x, y);
      for (let k = 0; k < 9; k++) { x += (R() - 0.5) * 80; y += (R() - 0.5) * 80; g.lineTo(x, y); }
      g.stroke();
    }
    g.globalAlpha = 1;
  }, { repeat });
}

// alpha map: darker = more see-through = puddle (mirror shows through)
export function puddleTex(repeat, seed = 9, dry = 225, wet = 120) {
  return canvasTex(512, 512, (g, w, h) => {
    const R = rng(seed);
    g.fillStyle = `rgb(${dry},${dry},${dry})`; g.fillRect(0, 0, w, h);
    for (let i = 0; i < 26; i++) {
      const x = R() * w, y = R() * h, r = 30 + R() * 90;
      for (const [ox, oy] of [[0, 0], [w, 0], [-w, 0], [0, h], [0, -h]]) {
        const gr = g.createRadialGradient(x + ox, y + oy, r * 0.3, x + ox, y + oy, r);
        gr.addColorStop(0, `rgba(${wet},${wet},${wet},1)`); gr.addColorStop(1, `rgba(${wet},${wet},${wet},0)`);
        g.fillStyle = gr; g.save(); g.translate(x + ox, y + oy); g.scale(1.8, 0.7); g.translate(-x - ox, -y - oy);
        g.fillRect(x + ox - r, y + oy - r, r * 2, r * 2); g.restore();
      }
    }
  }, { repeat, linear: true });
}

export function paverTex(repeat) {
  return canvasTex(512, 512, (g, w, h) => {
    const R = rng(21);
    g.fillStyle = '#1c1c20'; g.fillRect(0, 0, w, h);
    const n = 8, s = w / n;
    for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) {
      const v = 34 + R() * 16;
      g.fillStyle = `rgb(${v},${v},${v + 4})`;
      g.fillRect(i * s + 1.5, j * s + 1.5, s - 3, s - 3);
    }
    speckle(g, w, h, 5000, 2, ['#4a4a52', '#0e0e10'], R, 0.1, 0.4);
  }, { repeat });
}

export function tileWallTex(repeat) {
  return canvasTex(512, 512, (g, w, h) => {
    const R = rng(33);
    g.fillStyle = '#2a2622'; g.fillRect(0, 0, w, h);
    const bw = 64, bh = 24;
    for (let j = 0; j < h / bh; j++) for (let i = -1; i < w / bw + 1; i++) {
      const v = R();
      g.fillStyle = `rgb(${92 + v * 30},${58 + v * 22},${44 + v * 16})`;
      g.fillRect(i * bw + (j % 2) * bw / 2 + 1.5, j * bh + 1.5, bw - 3, bh - 3);
    }
    speckle(g, w, h, 4000, 3, ['#000', '#1a1410'], R, 0.05, 0.3);
    // grime streaks
    for (let i = 0; i < 30; i++) { g.globalAlpha = 0.12; g.fillStyle = '#000'; g.fillRect(R() * w, 0, 3 + R() * 10, h * R()); }
    g.globalAlpha = 1;
  }, { repeat });
}

export function shutterTex() {
  return canvasTex(512, 512, (g, w, h) => {
    const R = rng(8);
    for (let y = 0; y < h; y += 16) {
      const gr = g.createLinearGradient(0, y, 0, y + 16);
      gr.addColorStop(0, '#6d7377'); gr.addColorStop(0.5, '#8d9499'); gr.addColorStop(1, '#3f4447');
      g.fillStyle = gr; g.fillRect(0, y, w, 16);
    }
    speckle(g, w, h, 1500, 4, ['#3a2a1c', '#222'], R, 0.05, 0.25);
    g.globalAlpha = 0.5; g.fillStyle = '#7a1612'; g.font = `bold 120px ${JP}`; g.textAlign = 'center';
    g.fillText('山田商店', w / 2, 290);
    g.globalAlpha = 1;
  });
}

// Building facade: returns {map, emissive}
export function facadeTex(seed, cols = 9, rows = 16) {
  const W = 512, H = 1024;
  const R0 = rng(seed);
  const wall = ['#3b3a40', '#4a4038', '#2f3640', '#40383c', '#353530', '#48423c'][(R0() * 6) | 0];
  const cells = [];
  const tints = ['#ffd9a0', '#ffe9c4', '#cfe6ff', '#fff3d6', '#b7ffdf', '#ffc27a', '#9fd0ff'];
  for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++)
    cells.push({ lit: R0() < 0.3, tint: tints[(R0() * tints.length) | 0], blind: R0(), tv: R0() < 0.07, b: 0.2 + R0() * R0() * 0.8 });
  const band = R0() < 0.5;
  const layout = (g, emissive) => {
    const R = rng(seed + 1);
    g.fillStyle = emissive ? '#000' : wall; g.fillRect(0, 0, W, H);
    if (!emissive) speckle(g, W, H, 3000, 4, ['#000', '#666'], R, 0.03, 0.12);
    const mx = 22, my = 18, cw = (W - mx * 2) / cols, ch = (H - my * 2) / rows;
    cells.forEach((c, k) => {
      const i = k % cols, j = (k / cols) | 0;
      const x = mx + i * cw + cw * 0.12, y = my + j * ch + ch * 0.2, ww = cw * (band ? 0.92 : 0.76), hh = ch * 0.58;
      if (emissive) {
        if (!c.lit) return;
        g.globalAlpha = c.b;
        g.fillStyle = c.tv ? '#5d8bff' : c.tint; g.fillRect(x, y, ww, hh);
        g.globalAlpha = 1; g.fillStyle = '#000';
        if (c.blind < 0.35) for (let s = 0; s < hh; s += 5) g.fillRect(x, y + s, ww, 2);          // blinds
        else if (c.blind < 0.6) g.fillRect(x, y, ww, hh * (0.25 + c.blind * 0.5));                // half shade
        else if (c.blind > 0.9) { g.fillRect(x + ww * 0.3, y + hh * 0.35, ww * 0.18, hh * 0.65); g.beginPath(); g.arc(x + ww * 0.39, y + hh * 0.3, ww * 0.1, 0, 7); g.fill(); } // silhouette
        g.fillRect(x + ww / 2 - 1, y, 2, hh); // mullion
      } else {
        g.fillStyle = '#0c0f14'; g.fillRect(x, y, ww, hh);
        g.fillStyle = '#5c5a58'; g.fillRect(x - 2, y + hh, ww + 4, 4);
        if (R() < 0.3) { g.fillStyle = '#77777a'; g.fillRect(x + ww * 0.55, y + hh + 5, ww * 0.4, ch * 0.16); } // AC unit
      }
    });
  };
  return {
    map: canvasTex(W, H, (g) => layout(g, false)),
    emissive: canvasTex(W, H, (g) => layout(g, true)),
  };
}

// Neon / lit sign. vertical=true stacks characters.
export function neonTex(text, color, o = {}) {
  const vertical = !!o.vertical, sub = o.sub || '';
  const chars = [...text];
  const fs = o.fs || 96;
  const W = vertical ? 160 : Math.max(256, Math.ceil(chars.length * fs * (/[　-鿿]/.test(text) ? 1.08 : 0.7) + 80));
  const H = vertical ? chars.length * (fs + 8) + 60 + (sub ? 40 : 0) : fs + 90 + (sub ? 34 : 0);
  return canvasTex(W, H, (g, w, h) => {
    g.fillStyle = o.bg || '#07060a'; g.fillRect(0, 0, w, h);
    if (o.panel) { g.fillStyle = o.panel; g.fillRect(6, 6, w - 12, h - 12); }
    g.strokeStyle = color; g.lineWidth = 5; g.shadowColor = color; g.shadowBlur = 22;
    if (o.border !== false) { g.strokeRect(14, 14, w - 28, h - 28); }
    g.font = `bold ${fs}px ${JP}`; g.textAlign = 'center'; g.textBaseline = 'middle';
    const fill = o.fill || '#fff';
    const drawGlow = (s, x, y) => {
      g.shadowBlur = 30; g.fillStyle = color; g.fillText(s, x, y);
      g.shadowBlur = 12; g.fillText(s, x, y);
      g.shadowBlur = 0; g.globalAlpha = 0.75; g.fillStyle = fill; g.fillText(s, x, y); g.globalAlpha = 1; g.shadowColor = color;
    };
    if (vertical) chars.forEach((c, i) => drawGlow(c, w / 2, 36 + fs / 2 + i * (fs + 8)));
    else drawGlow(text, w / 2, 45 + fs / 2);
    if (sub) { g.font = `bold 26px ${JP}`; g.shadowBlur = 10; g.fillStyle = o.subColor || '#ffe9a8'; g.fillText(sub, w / 2, h - 34); }
  });
}

export function glowTex() {
  return canvasTex(128, 128, (g, w, h) => {
    const gr = g.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2);
    gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.18, 'rgba(255,255,255,0.55)');
    gr.addColorStop(0.5, 'rgba(255,255,255,0.12)'); gr.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = gr; g.fillRect(0, 0, w, h);
  });
}

export function smokeTex() {
  return canvasTex(128, 128, (g, w, h) => {
    const R = rng(77);
    for (let i = 0; i < 14; i++) {
      const x = w / 2 + (R() - 0.5) * 50, y = h / 2 + (R() - 0.5) * 50, r = 18 + R() * 26;
      const gr = g.createRadialGradient(x, y, 0, x, y, r);
      gr.addColorStop(0, 'rgba(255,255,255,0.22)'); gr.addColorStop(1, 'rgba(255,255,255,0)');
      g.fillStyle = gr; g.fillRect(0, 0, w, h);
    }
  });
}

export function skyTex() {
  return canvasTex(64, 512, (g, w, h) => {
    const gr = g.createLinearGradient(0, 0, 0, h);
    gr.addColorStop(0, '#04040a'); gr.addColorStop(0.3, '#0a0916'); gr.addColorStop(0.44, '#231231');
    gr.addColorStop(0.5, '#4a2038'); gr.addColorStop(0.52, '#0a0810'); gr.addColorStop(1, '#000');
    g.fillStyle = gr; g.fillRect(0, 0, w, h);
  });
}

export function labelTex(lines, o = {}) {
  // hand-lettered masking tape unless an explicit background is given
  const W = o.w || 256, H = o.h || 96, tape = !o.bg;
  return canvasTex(W, H, (g, w, h) => {
    const R = rng(lines.join('').length * 13 + W);
    g.fillStyle = o.bg || '#d9cfa8'; g.fillRect(0, 0, w, h);
    if (tape) { for (let i = 0; i < 260; i++) { g.globalAlpha = 0.06; g.fillStyle = R() > 0.5 ? '#6a5a30' : '#fff'; g.fillRect(R() * w, R() * h, 6 + R() * 40, 1); } g.globalAlpha = 0.22; g.fillStyle = '#5a4a28'; for (let i = 0; i < 3; i++) { g.beginPath(); g.ellipse(R() * w, R() * h, 10 + R() * 30, 6 + R() * 14, R() * 3, 0, 7); g.fill(); } g.globalAlpha = 1; }
    g.fillStyle = o.fg || '#1c1a22'; g.textAlign = 'center'; g.textBaseline = 'middle';
    const fs = o.fs || 34;
    g.save(); g.translate(w / 2, h / 2); if (tape) g.rotate((R() - 0.5) * 0.07);
    lines.forEach((l, i) => { g.font = `${tape ? 'italic ' : ''}bold ${i === 0 ? fs : fs * 0.72}px ${JP}`; g.globalAlpha = tape ? 0.82 : 1; g.fillText(l, tape ? (R() - 0.5) * 6 : 0, (i - (lines.length - 1) / 2) * fs * 1.05, w - 10); });
    g.restore(); g.globalAlpha = 1;
  });
}

export function bowlTex() {
  return canvasTex(512, 64, (g, w, h) => {
    g.fillStyle = '#f3efe6'; g.fillRect(0, 0, w, h);
    g.fillStyle = '#b3201a'; g.fillRect(0, 0, w, 7); g.fillRect(0, 33, w, 3);
    g.strokeStyle = '#b3201a'; g.lineWidth = 3;
    for (let x = 0; x < w; x += 32) { // raimon (thunder) fret
      g.beginPath(); g.moveTo(x + 2, 30); g.lineTo(x + 2, 12); g.lineTo(x + 26, 12); g.lineTo(x + 26, 26); g.lineTo(x + 10, 26); g.lineTo(x + 10, 19); g.lineTo(x + 19, 19); g.stroke();
    }
    g.fillStyle = '#1f4b8a'; g.fillRect(0, 40, w, 2);
  });
}

export function swirlTex(kind) {
  return canvasTex(128, 128, (g, w, h) => {
    const R = rng(kind === 'naruto' ? 4 : 6);
    if (kind === 'naruto') {
      g.fillStyle = '#fbf7f1'; g.fillRect(0, 0, w, h);
      g.strokeStyle = '#ee6f95'; g.lineWidth = 9; g.lineCap = 'round'; g.beginPath();
      for (let a = 0; a < 11; a += 0.1) { const r = 4 + a * 3.6; g.lineTo(64 + Math.cos(a) * r, 64 + Math.sin(a) * r); }
      g.stroke();
    } else if (kind === 'chashu') {
      g.fillStyle = '#a9765c'; g.fillRect(0, 0, w, h);
      for (let i = 0; i < 500; i++) { g.globalAlpha = 0.18; g.fillStyle = R() > 0.5 ? '#7d4f3a' : '#c79b80'; const a = R() * 6.28, d = R() * 60; g.save(); g.translate(64 + Math.cos(a) * d, 64 + Math.sin(a) * d); g.rotate(a + 1.57); g.fillRect(-6, -1, 6 + R() * 12, 1.5 + R() * 2); g.restore(); }
      g.globalAlpha = 0.9; g.strokeStyle = '#ead9c2'; g.lineCap = 'round'; g.shadowColor = '#ead9c2'; g.shadowBlur = 3;
      let px = 64, py = 64;
      for (let a = 0.6; a < 8.2; a += 0.22) { const r = 9 + a * 5.6 + Math.sin(a * 3.1) * 3, x = 64 + Math.cos(a) * r, y = 64 + Math.sin(a) * r * 0.92; if (Math.sin(a * 1.7) > -0.55) { g.lineWidth = 2.5 + Math.abs(Math.sin(a * 2.3)) * 6; g.beginPath(); g.moveTo(px, py); g.lineTo(x, y); g.stroke(); } px = x; py = y; }
      g.shadowBlur = 0; g.globalAlpha = 1;
      const gr = g.createRadialGradient(64, 64, 46, 64, 64, 64); gr.addColorStop(0, 'rgba(70,36,20,0)'); gr.addColorStop(0.75, 'rgba(70,36,20,0.85)'); gr.addColorStop(1, '#3a1d10'); g.fillStyle = gr; g.fillRect(0, 0, w, h);
    } else if (kind === 'egg') {
      g.fillStyle = '#f6efe2'; g.fillRect(0, 0, w, h);
      const gr = g.createRadialGradient(64, 64, 4, 64, 64, 34);
      gr.addColorStop(0, '#f08a1a'); gr.addColorStop(0.75, '#f6a52a'); gr.addColorStop(1, '#f4c56b');
      g.fillStyle = gr; g.beginPath(); g.arc(64, 64, 33, 0, 7); g.fill();
      g.fillStyle = 'rgba(255,255,255,0.5)'; g.beginPath(); g.ellipse(54, 54, 9, 5, -0.6, 0, 7); g.fill();
      g.strokeStyle = '#b98850'; g.lineWidth = 8; g.beginPath(); g.arc(64, 64, 61, 0, 7); g.stroke();
    }
  });
}

export function brothTex(kind) {
  return canvasTex(256, 256, (g, w, h) => {
    const R = rng(kind.length * 7);
    g.fillStyle = '#fff'; g.fillRect(0, 0, w, h);
    for (let i = 0; i < 130; i++) { // fat droplets
      const x = R() * w, y = R() * h, r = 2 + R() * 9;
      g.strokeStyle = 'rgba(120,90,40,0.28)'; g.lineWidth = 1.2; g.beginPath(); g.arc(x, y, r, 0, 7); g.stroke();
      g.fillStyle = 'rgba(255,240,190,0.22)'; g.fill();
    }
  });
}

export function faceTex(skin, o = {}) {
  return canvasTex(256, 128, (g, w, h) => {
    g.fillStyle = skin; g.fillRect(0, 0, w, h);
    const cx = 64;
    // cheeks
    for (const s of [-1, 1]) { const gr = g.createRadialGradient(cx + s * 17, 74, 0, cx + s * 17, 74, 10); gr.addColorStop(0, 'rgba(210,90,80,0.25)'); gr.addColorStop(1, 'rgba(210,90,80,0)'); g.fillStyle = gr; g.fillRect(cx - 40, 55, 80, 40); }
    g.fillStyle = '#fdfdfd';
    for (const s of [-1, 1]) { g.beginPath(); g.ellipse(cx + s * 12.5, 58, 5.2, 2.9, 0, 0, 7); g.fill(); }
    g.fillStyle = '#20140e';
    for (const s of [-1, 1]) { g.beginPath(); g.arc(cx + s * 12.5, 58, 2.7, 0, 7); g.fill(); }
    g.strokeStyle = o.hair || '#17110d'; g.lineWidth = 2.6; g.lineCap = 'round';
    for (const s of [-1, 1]) { g.beginPath(); g.moveTo(cx + s * 7, 51.5); g.lineTo(cx + s * 18, 50 + (o.brow || 0)); g.stroke(); }
    g.strokeStyle = 'rgba(80,40,30,0.5)'; g.lineWidth = 1.5; g.beginPath(); g.moveTo(cx - 1, 62); g.lineTo(cx - 3, 71); g.lineTo(cx + 2, 72); g.stroke();
    g.strokeStyle = o.lip || '#8c3f3a'; g.lineWidth = 2.6; g.beginPath(); g.moveTo(cx - 7, 82); g.quadraticCurveTo(cx, 85 + (o.smile ?? 2), cx + 7, 82); g.stroke();
    if (o.glasses) { g.strokeStyle = '#111'; g.lineWidth = 2; for (const s of [-1, 1]) g.strokeRect(cx + s * 12.5 - 8, 52, 16, 12); g.beginPath(); g.moveTo(cx - 4.5, 57); g.lineTo(cx + 4.5, 57); g.stroke(); }
    if (o.stache) { g.fillStyle = o.hair || '#17110d'; g.fillRect(cx - 8, 76, 16, 3); }
  });
}

// Generic text panel that can be redrawn.
export function panelTex(w, h, draw) {
  const t = canvasTex(w, h, draw);
  t.redraw = (fn) => { fn(t.userData.ctx, w, h); t.needsUpdate = true; };
  return t;
}

// Derive a tangent-space normal map from a canvas texture's luminance (cheap surface relief).
export function normalOf(tex, strength = 2) {
  const src = tex.userData.canvas || tex.image, w = src.width, h = src.height;
  const d = (tex.userData.ctx || src.getContext('2d')).getImageData(0, 0, w, h).data;
  const c = document.createElement('canvas'); c.width = w; c.height = h; const g = c.getContext('2d'), out = g.createImageData(w, h);
  const H = (x, y) => { const i = (((y + h) % h) * w + ((x + w) % w)) * 4; return (d[i] * 0.3 + d[i + 1] * 0.59 + d[i + 2] * 0.11) / 255; };
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const dx = (H(x + 1, y) - H(x - 1, y)) * strength, dy = (H(x, y + 1) - H(x, y - 1)) * strength, l = 1 / Math.hypot(dx, dy, 1), i = (y * w + x) * 4;
    out.data[i] = (-dx * l * 0.5 + 0.5) * 255; out.data[i + 1] = (dy * l * 0.5 + 0.5) * 255; out.data[i + 2] = (l * 0.5 + 0.5) * 255; out.data[i + 3] = 255;
  }
  g.putImageData(out, 0, 0);
  const t = new THREE.CanvasTexture(c); t.wrapS = tex.wrapS; t.wrapT = tex.wrapT; t.repeat.copy(tex.repeat); t.anisotropy = 8; return t;
}

export function posterTex(kind) {
  return canvasTex(256, 384, (g, w, h) => {
    const R = rng(kind * 31 + 7);
    const P = [['#d8c8a0', '#a01c1c', '生ビール', 'ICE COLD BEER', '#1c1c1c'], ['#1c2c5a', '#ffd21f', 'ディスコ', "SATURDAY NIGHT '86", '#ff5ab0'], ['#e8e0d0', '#1c5a3a', '火の用心', 'FIRE SAFETY WEEK', '#a01c1c'], ['#2a1a2e', '#ff7a2a', '映画祭', 'MIDNIGHT CINEMA', '#22d8ff'], ['#c8d8e0', '#12406a', '歌謡ショー', 'LIVE · 8PM', '#c8201c']][kind % 5];
    g.fillStyle = P[0]; g.fillRect(0, 0, w, h);
    g.fillStyle = P[4]; g.beginPath(); g.arc(w / 2, 150, 70, 0, 7); g.fill(); g.fillStyle = P[1]; g.fillRect(0, 250, w, 60);
    g.textAlign = 'center'; g.fillStyle = P[1]; g.font = `bold 62px ${JP}`; g.fillText(P[2], w / 2, 76, w - 16);
    g.fillStyle = P[0]; g.font = `bold 24px ${JP}`; g.fillText(P[3], w / 2, 290, w - 16);
    g.fillStyle = P[1]; g.font = `bold 20px ${MONO}`; g.fillText('1986', w / 2, 350);
    for (let i = 0; i < 1400; i++) { g.globalAlpha = 0.07; g.fillStyle = R() > 0.5 ? '#000' : '#fff'; g.fillRect(R() * w, R() * h, 2 + R() * 14, 1 + R() * 3); } // weathering
    g.globalAlpha = 0.35; g.fillStyle = P[0]; for (let i = 0; i < 4; i++) { g.beginPath(); g.moveTo(R() * w, R() < 0.5 ? 0 : h); g.lineTo(R() * w, R() * h); g.lineTo(R() * w, R() < 0.5 ? 0 : h); g.fill(); } g.globalAlpha = 1; // torn corners
  });
}

// Age an existing canvas texture in place: stains, drips, scratches, cracks, rust, patches, soot.
export function dirty(tex, seed = 1, o = {}) {
  const c = tex.userData.canvas, g = tex.userData.ctx, w = c.width, h = c.height, R = rng(seed * 977 + 13);
  const blob = (x, y, r, col, a) => { const gr = g.createRadialGradient(x, y, 0, x, y, r); gr.addColorStop(0, col); gr.addColorStop(1, 'rgba(0,0,0,0)'); g.globalAlpha = a; g.fillStyle = gr; g.fillRect(x - r, y - r, r * 2, r * 2); };
  for (let i = 0; i < (o.patch || 0); i++) { g.globalAlpha = 0.25 + R() * 0.3; g.fillStyle = R() > 0.5 ? '#0c0c0e' : '#3a3a3e'; g.fillRect(R() * w, R() * h, 30 + R() * 120, 20 + R() * 90); }
  for (let i = 0; i < (o.stains || 0); i++) { const x = R() * w, y = R() * h, r = 12 + R() * 70; g.save(); g.translate(x, y); g.scale(1 + R(), 0.5 + R() * 0.6); g.rotate(R() * 3); blob(0, 0, r, R() > 0.25 ? 'rgba(10,8,6,1)' : 'rgba(90,60,30,1)', 0.12 + R() * 0.3); g.restore(); }
  for (let i = 0; i < (o.rings || 0); i++) { g.globalAlpha = 0.25; g.strokeStyle = '#2a2018'; g.lineWidth = 1.5 + R() * 2; g.beginPath(); g.arc(R() * w, R() * h, 8 + R() * 16, R() * 6, R() * 6 + 3 + R() * 3); g.stroke(); }
  for (let i = 0; i < (o.drips || 0); i++) { const x = R() * w, y = R() * h * 0.7, len = 30 + R() * h * 0.5, ww = 2 + R() * 9; const gr = g.createLinearGradient(0, y, 0, y + len); gr.addColorStop(0, 'rgba(8,6,5,0.5)'); gr.addColorStop(1, 'rgba(8,6,5,0)'); g.globalAlpha = 0.3 + R() * 0.5; g.fillStyle = gr; g.fillRect(x, y, ww, len); }
  for (let i = 0; i < (o.rust || 0); i++) { const x = R() * w, y = R() * h, r = 6 + R() * 34; blob(x, y, r, 'rgba(120,52,14,1)', 0.35 + R() * 0.4); blob(x + R() * 8, y + R() * 8, r * 0.5, 'rgba(50,20,6,1)', 0.5); if (R() < 0.6) { g.globalAlpha = 0.3; g.fillStyle = '#6a3010'; g.fillRect(x - 1, y, 2 + R() * 3, 20 + R() * 80); } }
  for (let i = 0; i < (o.scratches || 0); i++) { g.globalAlpha = 0.1 + R() * 0.25; g.strokeStyle = R() > 0.4 ? '#f0f0f0' : '#101010'; g.lineWidth = 0.4 + R(); const x = R() * w, y = R() * h, a = R() * 6.28, l = 8 + R() * 70; g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + Math.cos(a) * l * 0.5 + (R() - 0.5) * 12, y + Math.sin(a) * l * 0.5 + (R() - 0.5) * 12, x + Math.cos(a) * l, y + Math.sin(a) * l); g.stroke(); }
  for (let i = 0; i < (o.cracks || 0); i++) { g.globalAlpha = 0.75; g.strokeStyle = '#050506'; g.lineWidth = 0.8 + R() * 1.6; g.beginPath(); let x = R() * w, y = R() * h, a = R() * 6.28; g.moveTo(x, y); for (let k = 0; k < 14; k++) { a += (R() - 0.5) * 1.3; x += Math.cos(a) * (8 + R() * 22); y += Math.sin(a) * (8 + R() * 22); g.lineTo(x, y); if (R() < 0.18) { g.lineTo(x + (R() - 0.5) * 40, y + (R() - 0.5) * 40); g.moveTo(x, y); } } g.stroke(); }
  for (let i = 0; i < (o.gum || 0); i++) { g.globalAlpha = 0.5 + R() * 0.4; g.fillStyle = R() > 0.3 ? '#08080a' : '#5a5a60'; g.beginPath(); g.ellipse(R() * w, R() * h, 1.5 + R() * 4, 1.5 + R() * 3, R() * 3, 0, 7); g.fill(); }
  for (let i = 0; i < (o.missing || 0); i++) { g.globalAlpha = 0.85; g.fillStyle = R() > 0.5 ? '#3a342e' : '#191614'; g.fillRect(Math.floor(R() * 8) * 64 + (R() > 0.5 ? 32 : 0) + 2, Math.floor(R() * 21) * 24 + 2, 60, 20); }
  if (o.soot) { let gr = g.createLinearGradient(0, h * 0.72, 0, h); gr.addColorStop(0, 'rgba(0,0,0,0)'); gr.addColorStop(1, 'rgba(0,0,0,0.6)'); g.globalAlpha = 1; g.fillStyle = gr; g.fillRect(0, 0, w, h); gr = g.createLinearGradient(0, 0, 0, h * 0.2); gr.addColorStop(0, 'rgba(0,0,0,0.4)'); gr.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = gr; g.fillRect(0, 0, w, h); }
  if (o.fade) { g.globalAlpha = 0.16; g.fillStyle = '#b8a890'; g.fillRect(0, 0, w, h); const gr = g.createLinearGradient(0, h * 0.6, 0, h); gr.addColorStop(0, 'rgba(30,20,14,0)'); gr.addColorStop(1, 'rgba(30,20,14,0.55)'); g.globalAlpha = 1; g.fillStyle = gr; g.fillRect(0, 0, w, h); }
  if (o.yellow) { g.globalAlpha = 0.22; g.fillStyle = '#8a6a20'; g.fillRect(0, 0, w, h); }
  if (o.graffiti) { g.globalAlpha = 0.55; g.strokeStyle = '#111'; g.lineWidth = 5; g.lineCap = 'round'; g.beginPath(); let x = w * 0.15, y = h * 0.8; g.moveTo(x, y); for (let k = 0; k < 16; k++) { x += 12 + R() * 22; y += (R() - 0.5) * 70; g.lineTo(x, Math.min(h - 8, Math.max(h * 0.6, y))); } g.stroke(); }
  g.globalAlpha = 1; tex.needsUpdate = true; return tex;
}

// Greasy, uneven roughness (smears, fingerprints, wiped arcs) for worktops.
export function smudgeTex(repeat = [1, 1], seed = 4) {
  return canvasTex(512, 512, (g, w, h) => {
    const R = rng(seed); g.fillStyle = '#9a9a9a'; g.fillRect(0, 0, w, h);
    for (let i = 0; i < 90; i++) { g.globalAlpha = 0.25 + R() * 0.4; g.strokeStyle = R() > 0.5 ? '#3c3c3c' : '#e6e6e6'; g.lineWidth = 8 + R() * 40; g.lineCap = 'round'; g.beginPath(); const x = R() * w, y = R() * h; g.arc(x, y, 30 + R() * 160, R() * 6, R() * 6 + 0.4 + R() * 1.2); g.stroke(); }
    for (let i = 0; i < 400; i++) { g.globalAlpha = 0.3; g.fillStyle = R() > 0.5 ? '#222' : '#fff'; g.beginPath(); g.ellipse(R() * w, R() * h, 2 + R() * 7, 2 + R() * 5, R() * 3, 0, 7); g.fill(); }
  }, { repeat, linear: true });
}
