// UI. In the world: order tickets, the chalkboard, the microwave clock, cook-progress rings, the candle (noise). On the page: a light HUD + menus.
'use strict';
(function () {
const { V3, col, clamp, $ } = MC, W = MC.world, C = MC.cook, G = MC.game, PL = MC.player;
const U = MC.ui = { tickets: [], dirty: true };
function plane(w, h, cw, ch, pos, o = {}) {
  const c = document.createElement('canvas'); c.width = cw; c.height = ch; const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 4;
  const mat = o.basic ? new THREE.MeshBasicMaterial({ map: tex, fog: false, transparent: !!o.alpha }) : new THREE.MeshStandardMaterial({ map: tex, roughness: 0.9, side: THREE.DoubleSide, emissive: new THREE.Color(1, 1, 1), emissiveMap: tex, emissiveIntensity: o.glow == null ? 0.22 : o.glow });
  const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat); m.position.copy(pos); m.castShadow = !o.basic; m.receiveShadow = !o.basic; W.group.add(m);
  return { g: c.getContext('2d'), tex, cw, ch, mesh: m, key: '' };
}
// component pictograms
const ICON = {
  toast: (g, s) => { rr(g, -s * 0.8, -s * 0.7, s * 1.6, s * 1.4, s * 0.3, '#d9a14e'); dots(g, s, '#b07a2e'); }, char: (g, s) => { rr(g, -s * 0.8, -s * 0.7, s * 1.6, s * 1.4, s * 0.3, '#4a3324'); dots(g, s, '#221610'); },
  crumbs: (g, s) => { for (let i = 0; i < 6; i++) circ(g, Math.cos(i * 1.1) * s * 0.55, Math.sin(i * 1.7) * s * 0.5, s * 0.22, '#ecd9a8'); },
  melt: (g, s) => { g.fillStyle = '#f4a81f'; g.beginPath(); g.ellipse(0, s * 0.1, s * 0.95, s * 0.5, 0, 0, 7); g.fill(); circ(g, -s * 0.5, s * 0.5, s * 0.22, '#f4a81f'); circ(g, s * 0.45, s * 0.62, s * 0.16, '#f4a81f'); circ(g, -s * 0.2, -s * 0.05, s * 0.14, '#ffd98a'); },
  slice: (g, s) => { g.fillStyle = '#f6c63c'; g.beginPath(); g.moveTo(-s * 0.95, s * 0.5); g.lineTo(s * 0.95, s * 0.5); g.lineTo(s * 0.95, -s * 0.55); g.closePath(); g.fill(); circ(g, s * 0.5, s * 0.15, s * 0.15, '#d99a1c'); circ(g, 0, s * 0.3, s * 0.1, '#d99a1c'); },
  roast: (g, s) => { circ(g, 0, 0, s * 0.8, '#4f6a1d'); circ(g, -s * 0.25, -s * 0.2, s * 0.2, '#3a2a12'); circ(g, s * 0.3, s * 0.25, s * 0.16, '#3a2a12'); },
  mash: (g, s) => { g.fillStyle = '#8cc152'; g.beginPath(); g.ellipse(0, s * 0.2, s * 0.95, s * 0.5, 0, 0, 7); g.fill(); circ(g, -s * 0.3, -s * 0.05, s * 0.35, '#8cc152'); circ(g, s * 0.3, -s * 0.1, s * 0.3, '#9fd163'); },
  soup: (g, s) => { g.fillStyle = '#8a5a2b'; g.beginPath(); g.moveTo(-s, -s * 0.1); g.lineTo(s, -s * 0.1); g.lineTo(s * 0.6, s * 0.7); g.lineTo(-s * 0.6, s * 0.7); g.closePath(); g.fill(); g.fillStyle = '#79b23c'; g.beginPath(); g.ellipse(0, -s * 0.1, s * 0.92, s * 0.28, 0, 0, 7); g.fill(); },
  boiled: (g, s) => { g.strokeStyle = '#f1dc9a'; g.lineWidth = s * 0.22; g.beginPath(); g.arc(0, 0, s * 0.6, 0.4, 5.6); g.stroke(); g.beginPath(); g.arc(s * 0.1, s * 0.05, s * 0.28, 2, 7); g.stroke(); },
  fried: (g, s) => { g.fillStyle = '#fbfaf2'; g.beginPath(); g.ellipse(0, 0, s * 0.95, s * 0.75, 0.3, 0, 7); g.fill(); circ(g, s * 0.1, -s * 0.05, s * 0.36, '#f5a81c'); },
};
function rr(g, x, y, w, h, r, fill) { g.fillStyle = fill; g.beginPath(); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r); g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath(); g.fill(); }
function circ(g, x, y, r, fill) { g.fillStyle = fill; g.beginPath(); g.arc(x, y, r, 0, 7); g.fill(); }
function dots(g, s, c) { for (let i = 0; i < 5; i++) circ(g, Math.cos(i * 2.3) * s * 0.4, Math.sin(i * 1.9) * s * 0.35, s * 0.08, c); }
U.icon = (g, key, x, y, s) => { g.save(); g.translate(x, y); (ICON[key] || ICON.toast)(g, s); g.restore(); };
const SHORT = { toast: 'toasted', char: 'charred', crumbs: 'crumbs', melt: 'melted', slice: 'sliced', roast: 'roasted', mash: 'mashed', soup: 'soup', boiled: 'boiled', fried: 'fried' };
const HOW = { toast: 'toaster ×1', char: 'toaster ×2', crumbs: 'blade', melt: 'pan', slice: 'blade', roast: 'pan', mash: 'blade', soup: 'pot', boiled: 'pot', fried: 'pan' };

// order-pad paper, shared with the menu look: warm stock, fibres, a perforated top edge
const SLAB = '"Bree Serif", Georgia, serif', HAND = '"Kalam", "Comic Sans MS", cursive';
let PAPER = null;
function paperBg(vip) {
  if (!PAPER) { PAPER = {}; for (const v of [0, 1]) { const c = document.createElement('canvas'); c.width = 256; c.height = 320; const g = c.getContext('2d'), r = MC.rng(9 + v); g.fillStyle = v ? '#f6dd98' : '#f3e8cc'; g.fillRect(0, 0, 256, 320);
    for (let i = 0; i < 2600; i++) { g.fillStyle = 'rgba(' + (r() < 0.5 ? '90,60,30' : '255,250,235') + ',' + r() * 0.08 + ')'; g.fillRect(r() * 256, r() * 320, 1 + r() * 2, 1 + r() * 2); }
    g.strokeStyle = 'rgba(110,140,190,0.18)'; for (let y = 96; y < 300; y += 26) { g.beginPath(); g.moveTo(0, y); g.lineTo(256, y); g.stroke(); }
    g.fillStyle = 'rgba(0,0,0,0.18)'; for (let x = 8; x < 256; x += 12) { g.beginPath(); g.arc(x, 7, 2, 0, 7); g.fill(); }
    const vg = g.createRadialGradient(128, 160, 90, 128, 160, 210); vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(120,80,30,0.22)'); g.fillStyle = vg; g.fillRect(0, 0, 256, 320); PAPER[v] = c; } }
  return PAPER[vip ? 1 : 0];
}
document.fonts && document.fonts.ready.then(() => { for (const t of U.tickets) t.key = ''; U.boardKey = ''; });
function drawTicket(t, o) {
  const g = t.g, w = t.cw, h = t.ch;
  g.drawImage(paperBg(o.vip), 0, 0);
  if (o.vip) { g.strokeStyle = '#b8861e'; g.lineWidth = 6; g.setLineDash([10, 6]); g.strokeRect(9, 16, w - 18, h - 25); g.setLineDash([]); }
  g.fillStyle = '#2a2622'; g.textAlign = 'center'; g.font = '30px ' + SLAB; g.fillText((o.vip ? '★ ' : '') + o.R.name, w / 2, 46);
  g.font = '21px ' + HAND; g.fillStyle = '#7a4a2a'; g.fillText(o.rec.name + (o.recipe === G.cfg.special ? '  ★ special' : ''), w / 2, 74);
  const n = o.parts.length, done = o.plated.map(i => C.key(i)), sp = n === 1 ? 0 : n === 2 ? 110 : 82, x0 = w / 2 - sp * (n - 1) / 2;
  for (let i = 0; i < n; i++) {
    const k = o.parts[i], x = x0 + i * sp, s = n === 3 ? 30 : 40; U.icon(g, k, x, 135, s);
    g.fillStyle = '#2a2622'; g.font = '700 ' + (n === 3 ? 18 : 21) + 'px ' + HAND; g.fillText(SHORT[k], x, 200); g.font = (n === 3 ? 15 : 17) + 'px ' + HAND; g.fillStyle = '#7a6f62'; g.fillText(HOW[k], x, 221);
    const di = done.indexOf(k); if (di >= 0) { done.splice(di, 1); g.strokeStyle = '#2a9d4a'; g.lineWidth = 9; g.lineCap = 'round'; g.beginPath(); g.moveTo(x - 22, 135); g.lineTo(x - 6, 152); g.lineTo(x + 24, 112); g.stroke(); }
    if (i < n - 1) { g.fillStyle = '#6a5f52'; g.font = '28px ' + SLAB; g.fillText('+', x + sp / 2, 143); }
  }
  const f = clamp(o.pat / o.maxPat, 0, 1); g.fillStyle = '#d8ccb4'; g.fillRect(24, h - 52, w - 48, 16); g.fillStyle = f > 0.5 ? '#3f9d5a' : f > 0.25 ? '#d9992a' : '#c9422e'; g.fillRect(24, h - 52, (w - 48) * f, 16);
  g.fillStyle = '#7a6f62'; g.font = '17px ' + HAND; g.fillText(o.state === 'eat' ? 'Delicious! +' + MC.money(o.tip) : G.hiding ? '(hiding)' : 'patience', w / 2, h - 16);
  t.tex.needsUpdate = true;
}
function wrap(g, text, x, y, maxW, lh, maxLines) { const words = text.split(' '); let line = '', n = 0; for (const wd of words) { if (g.measureText(line + wd).width > maxW && line) { g.fillText(line.trim(), x, y); y += lh; line = ''; if (++n >= maxLines - 1) { /* last line */ } } line += wd + ' '; } g.fillText(line.trim(), x, y); }
function drawBoard() {
  const b = U.board, g = b.g, c = G.cfg; g.fillStyle = '#18241d'; g.fillRect(0, 0, b.cw, b.ch); g.strokeStyle = '#7a5a36'; g.lineWidth = 14; g.strokeRect(7, 7, b.cw - 14, b.ch - 14);
  g.textAlign = 'center'; g.fillStyle = '#f6c95a'; g.font = '30px ' + SLAB; g.fillText(c ? c.title : 'MIDNIGHT CRUMBS', b.cw / 2, 50);
  g.fillStyle = '#f2efe6'; g.font = '25px ' + HAND;
  if (G.mode === 'dawn' && G.result) {
    const r = G.result; g.font = 'bold 56px sans-serif'; g.fillStyle = '#f6c95a'; g.fillText('★'.repeat(r.stars) + '☆'.repeat(3 - r.stars), b.cw / 2, 120);
    g.font = '24px sans-serif'; g.fillStyle = '#f2efe6'; g.fillText('Served ' + r.served + ' · Tips ' + MC.money(r.tips) + (MC.isXR() ? ' · squeeze to continue' : ''), b.cw / 2, 165);
  } else { const m = MC.isXR() ? (G.msgT > 0 ? G.msg : (G.tip || 'Check the tickets. Stay quiet.')) : (c ? (c.special ? 'Special of the night: ' + MC.RECIPES[c.special].name + ' (pays 1.5×). ' : '') + 'Tonight: ' + c.recipes.map(k => MC.RECIPES[k].name).join(' · ') : ''); /* desktop has its own message strip, so the board shows the menu */ if (m.length > 110) g.font = '21px ' + HAND; wrap(g, m, b.cw / 2, m.length > 110 ? 86 : 96, b.cw - 50, m.length > 110 ? 24 : 30, 4); }
  if (c && G.mode === 'play') { const line = c.long ? 'Served ' + G.served + ' · Tips ' + MC.money(G.tips) + ' · Lives ' + '♥'.repeat(Math.max(0, G.lives)) : '★ ' + G.served + '/' + c.need + ' served   ★★ ' + MC.money(G.tips) + '/' + MC.money(c.target) + (c.vip ? '   ★★★ VIP ' + (G.vipServed ? 'served ✔' : 'still to come') : '   ★★★ nobody walks out');
    g.fillStyle = '#9fe0a8'; let fs = 26; void 0; do { g.font = fs + 'px ' + SLAB; fs -= 1; } while (g.measureText(line).width > b.cw - 56 && fs > 14); g.fillText(line, b.cw / 2, b.ch - 28); }
  b.tex.needsUpdate = true;
}
function drawClock() {
  const k = U.clock, g = k.g, txt = G.mode === 'play' && W.clockDead ? '--:--' : G.mode === 'play' || G.mode === 'dawn' ? G.clockText() : '12:00';
  if (txt === k.key) return; k.key = txt; g.fillStyle = '#020806'; g.fillRect(0, 0, k.cw, k.ch); g.fillStyle = '#48ff8a'; g.shadowColor = '#48ff8a'; g.shadowBlur = 14; g.font = 'bold 76px monospace'; g.textAlign = 'center'; g.fillText(txt, k.cw / 2, 80); g.shadowBlur = 0; k.tex.needsUpdate = true;
}
function ring(pos) {
  const c = document.createElement('canvas'); c.width = c.height = 96; const tex = new THREE.CanvasTexture(c), sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, depthTest: false, transparent: true, fog: false, toneMapped: false }));
  sp.position.copy(pos); sp.scale.set(0.75, 0.75, 1); sp.renderOrder = 50; W.group.add(sp);
  return { sp, key: -9, set(p, left) { const k = Math.round(p * 24) + '|' + (left == null ? '' : Math.ceil(left)); if (k === this.key) return; this.key = k; sp.visible = p >= 0; if (p < 0) return;
    const g = c.getContext('2d'); g.clearRect(0, 0, 96, 96); g.fillStyle = 'rgba(10,12,20,0.78)'; g.beginPath(); g.arc(48, 48, 44, 0, 7); g.fill();
    g.lineWidth = 9; g.strokeStyle = 'rgba(255,255,255,0.18)'; g.beginPath(); g.arc(48, 48, 34, 0, 7); g.stroke();
    // shapes and text carry the meaning; colours are a blue/orange pair that survives colour-blindness
    if (p < 1) { g.strokeStyle = '#5ab0ff'; g.beginPath(); g.arc(48, 48, 34, -Math.PI / 2, -Math.PI / 2 + p * 6.283); g.stroke(); }
    else { const burn = Math.min(1, p - 1); g.strokeStyle = '#ff8a1a'; g.beginPath(); g.arc(48, 48, 34, -Math.PI / 2, -Math.PI / 2 + burn * 6.283); g.stroke();
      if (p < 2) { g.fillStyle = '#fff'; g.font = 'bold 30px sans-serif'; g.textAlign = 'center'; g.fillText(left != null ? '✔' + Math.ceil(left) : '✔', 48, 58); } else { g.fillStyle = '#ff8a1a'; g.font = 'bold 40px sans-serif'; g.textAlign = 'center'; g.fillText('✖', 48, 62); } }
    tex.needsUpdate = true; } };
}
MC.on('world:built', () => {
  U.tickets = W.seats.map(s => { const t = plane(1.15, 1.44, 256, 320, s.ticket, { glow: 0.06 }); t.mesh.visible = false; t.mesh.rotation.x = 0.28; return t; });   // tilted down toward the cook
  const b = W.st.board; U.board = plane(b.w, b.h, 640, 240, b.pos, { glow: 0.55 }); U.clock = plane(2.6, 1.0, 256, 96, W.st.clock, { basic: true });
  // rings float just in front of the pan / pot at eye level, so they stay on screen while you watch the food
  U.panRing = ring(new V3(W.st.pan.pos.x + 0.75, W.st.pan.pos.y + 0.25, W.st.pan.pos.z + 0.5)); U.potRing = ring(new V3(W.st.pot.pos.x + 0.75, W.st.pot.pos.y + 0.2, W.st.pot.pos.z + 0.5));
  U.boardKey = ''; drawClock();
});

// ---------- DOM ----------
let toastT = 0;
MC.on('tip', m => { const t = $('tip'); t.textContent = m; t.hidden = !m; });
// a short message stack (newest at the bottom) instead of one line that busy moments overwrite
const stack = [];
MC.on('say', m => { if (stack.length && stack[stack.length - 1].m === m) stack.pop(); stack.push({ m, t: Math.max(3, G.msgT) }); while (stack.length > 3) stack.shift(); drawStack(); });
function drawStack() { const t = $('toast'); t.innerHTML = stack.map((s, i) => '<span class="m' + (i < stack.length - 1 ? ' old' : '') + '">' + s.m.replace(/</g, '&lt;') + '</span>').join(''); t.style.opacity = stack.length ? 1 : 0; }
MC.applyAccess = function () { const o = MC.opt; document.documentElement.style.setProperty('--ui', o.uiScale || 1); document.body.classList.toggle('plain', !!o.plainFont); document.body.classList.toggle('bigcross', !!o.bigCross); if (o.plainFont) { for (const t of U.tickets) t.key = ''; U.boardKey = ''; } };
MC.applyAccess();
U.show = (id, on) => { $(id).hidden = !on; };
U.update = function (dt) {
  if (!U.board) return;
  for (let i = 0; i < W.seats.length; i++) {
    const o = W.seats[i].order, t = U.tickets[i]; t.mesh.visible = !!o && o.state !== 'out';
    if (o) { const key = o.reg + o.recipe + o.plated.length + o.state + Math.round(o.pat / o.maxPat * 50) + G.hiding; if (key !== t.key) { t.key = key; drawTicket(t, o); } t.mesh.rotation.z = Math.sin(W.t * 1.3 + i) * 0.025; }
  }
  const bk = G.mode + (MC.isXR() ? (G.msgT > 0 ? G.msg : G.tip) : '') + G.served + G.tips + G.vipServed + G.lives + MC.isXR(); if (bk !== U.boardKey) { U.boardKey = bk; drawBoard(); }
  drawClock(); U.panRing.set(C.panPct == null ? -1 : C.panPct, C.panLeft); U.potRing.set(C.potPct == null ? -1 : C.potPct, C.potLeft);
  if (MC.isXR()) return;
  // page HUD
  if (stack.length) { let ch = false; for (const s of stack) s.t -= dt; while (stack.length && stack[0].t <= 0) { stack.shift(); ch = true; } if (ch) drawStack(); }
  // visual sound cues
  const cue = $('cue'), thunder = MC.opt.cues && MC.events.mask > 0 && G.mode === 'play'; cue.hidden = !thunder; if (thunder) cue.textContent = '⚡ Thunder: nobody can hear you';
  const ar = $('arrow'); if (G.arrivalT > 0) G.arrivalT -= dt;
  if (MC.opt.cues && G.mode === 'play' && G.arrivalT > 0 && G.arrivalAt) { const d = new V3().subVectors(G.arrivalAt, PL.head); d.y = 0; d.normalize(); const f = PL.fwdFlat, cr = f.x * d.z - f.z * d.x, dot = f.dot(d);
    if (dot > 0.75) ar.hidden = true; else { ar.hidden = false; ar.className = dot < -0.5 ? 'b' : cr > 0 ? 'r' : 'l'; ar.textContent = dot < -0.5 ? '▼ new customer behind you' : cr > 0 ? 'new customer ▶' : '◀ new customer'; } } else ar.hidden = true;
  // order list on the HUD (the in-world tickets are small from far away)
  const ol = $('orders'), wait = G.orders.filter(o => o.state === 'wait'); ol.hidden = G.mode !== 'play' || !wait.length;
  if (!ol.hidden) { const key = wait.map(o => o.reg + o.plated.length + Math.round(o.pat / o.maxPat * 10)).join('|'); if (key !== ol.dataset.k) { ol.dataset.k = key; ol.innerHTML = wait.map(o => { const done = o.plated.map(i => C.key(i)); return '<div><b>' + o.R.name + (o.vip ? ' ★VIP' : '') + '</b> ' + '▮'.repeat(Math.ceil(clamp(o.pat / o.maxPat, 0, 1) * 5)) + '▯'.repeat(5 - Math.ceil(clamp(o.pat / o.maxPat, 0, 1) * 5)) + '<br>' + o.parts.map(k => { const j = done.indexOf(k); if (j >= 0) { done.splice(j, 1); return '<span class="done">✔ ' + SHORT[k] + '</span>'; } return SHORT[k] + ' (' + HOW[k] + ')'; }).join(' + ') + '</div>'; }).join(''); } }
  const play = G.mode === 'play'; $('hud').hidden = !play; $('cross').hidden = !play; $('hint').hidden = !play; if (!play) { $('tip').hidden = true; $('eye').hidden = true; } else $('tip').hidden = !G.tip;
  if (!play) return;
  const c = G.cfg;
  $('h-clock').textContent = (W.clockDead ? '--:--' : G.clockText()) + ' am'; $('h-tips').textContent = (c.long ? '' : '★★ ') + MC.money(G.tips) + (c.long ? '' : ' / ' + MC.money(c.target)) + (c.long ? '' : c.vip ? '   ★★★ VIP ' + (G.vipServed ? 'served ✔' : 'still to come') : '   ★★★ ' + (G.lost ? '✘' : 'nobody leaves'));
  $('h-served').textContent = c.long ? G.served + ' served · ' + '♥'.repeat(Math.max(0, G.lives)) : '★ ' + G.served + ' / ' + c.need + ' served';
  $('noisefill').style.width = G.noise + '%'; $('noisefill').style.background = G.noise > 70 ? '#ff5a3c' : G.noise > 40 ? '#ffb347' : '#8fd18a';
  const nm = h => h.item ? C.name(h.item) : h.grip ? 'gripping' : '—';
  $('h-hands').textContent = 'L ' + nm(PL.hands[0]) + ' · R ' + nm(PL.hands[1]) + ' · pack ' + (PL.pack.length ? PL.pack.map(i => C.name(i)).join(', ') : '—') + (PL.packMax > 1 ? ' (' + PL.pack.length + '/' + PL.packMax + ')' : '');
  let hint = '', on = false;
  if (PL.daze <= 0) {
    if (PL.mantleReady()) { hint = 'let go: hop onto the ledge'; on = true; }
    else if (!PL.activeGrip() && !PL.zip) { const hh = PL.hands.find(h => h.item), a = PL.aim(hh || PL.hands[0]); if (a && a.hint) { hint = a.hint; on = a.kind !== 'none'; } }
  }
  if (!hint && MC.talkHint) hint = MC.talkHint();
  $('cross').className = on ? 'on' : ''; $('hint').textContent = hint;
  const es = MC.events.state, eye = $('eye'); eye.hidden = !es;
  if (es) { eye.textContent = es === 'coming' ? '… footsteps …' : es === 'hidden' ? 'HIDDEN' : es === 'frozen' ? 'IN VIEW — FREEZE' : es === 'stare' ? 'STARING AT YOU — GET TO COVER?' : 'SEEN — STOP MOVING!'; eye.className = es === 'stare' ? 'seen' : es; }
};
})();
