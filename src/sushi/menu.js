// the in-game menu: every setting on one board of big rows, eight shown at a time; a thumbstick (arrow keys, the wheel) moves a highlight up and down it and scrolls, left and right change a value, the trigger or A/X (Enter) selects, or point at a row and pull the trigger, or poke it; the Y or B button (or the MENU button on the right wing, or saying "menu") brings it up in front of you and puts it away; it can be gripped and moved (boards.js)
import * as THREE from 'three';
import { G, V3 } from './ctx.js';
import * as T from './tex.js';

export function buildMenu(scene, cart, guide, talk, shadowLights, report) {
  const m = { open: false }, W = 0.7, H = 0.62, PW = 700, PH = 620, VIS = 8, RH = 62, tex = T.panelTex(PW, PH, () => { });
  const board = new THREE.Mesh(new THREE.PlaneGeometry(W, H), new THREE.MeshBasicMaterial({ map: tex, color: 0xd8d8d8, side: THREE.DoubleSide })); board.visible = false; board.userData.nopick = true; scene.add(board);
  const S = (G.set = { volume: 1, tts: true, mic: true, shadows: true, turn: 30, easy: (() => { try { return localStorage.getItem('yatai-easy') !== '0'; } catch (e) { return true; } })() });
  const rows = [
    ['EASY ON THE EYES', () => (S.easy ? 'ON' : 'OFF'), () => { S.easy = !S.easy; try { localStorage.setItem('yatai-easy', S.easy ? '1' : '0'); } catch (e) { /* not kept */ } G.eyes?.(S.easy); }],
    ['THE MARKET', () => (G.live ? G.live.status() : 'NOT LINKED'), () => { }],
    ['GUIDE MODE', () => (guide.on ? 'ON' : 'OFF'), () => guide.set(!guide.on)],
    ...(G.guest ? [] : [['EASY DAYS', () => (G.prog.P.easy ? 'ON' : 'OFF') + ' · DAY ' + G.prog.P.day, () => G.prog.setEasy(!G.prog.P.easy)]]),
    ['VOLUME', () => Math.round(S.volume * 100) + '%', () => { S.volume = S.volume >= 1.5 ? 0.25 : S.volume + 0.25; if (G.audio.master) G.audio.master.gain.value = S.volume; }],
    ['SPOKEN VOICES', () => (S.tts ? 'ON' : 'OFF'), () => { S.tts = !S.tts; G.muteVoices = !S.tts; if (!S.tts) window.speechSynthesis?.cancel(); }],
    ['MICROPHONE', () => (S.mic ? (talk.mic || 'ON').toUpperCase() : 'OFF'), () => { S.mic = !S.mic; talk.listen(S.mic); }],
    ['VOICE CHECK', () => `ear ${talk.diag.hear} · mind ${talk.diag.think} · voice ${talk.diag.say}`, () => { }],
    ['SHADOWS', () => (S.shadows ? 'ON' : 'OFF'), () => { S.shadows = !S.shadows; G.quality = S.shadows ? 0 : 1; shadowLights.forEach((l) => (l.castShadow = S.shadows)); }],
    ['SNAP TURN', () => S.turn + '°', () => { S.turn = S.turn === 30 ? 45 : S.turn === 45 ? 90 : 30; }],
    ['MY HEIGHT', () => (G.rig.position.y >= 0 ? '+' : '') + Math.round(G.rig.position.y * 100) + ' cm', () => { G.rig.position.y = G.rig.position.y >= 0.3 ? -0.3 : G.rig.position.y + 0.1; }],
    ['OPEN / CLOSE CART', () => G.game.state.toUpperCase(), () => G.game.toggleOpen()],
    ['REPORT A BUG (X / A)', () => (report.busy ? 'RECORDING' : 'PICTURE + VOICE'), () => { m.toggle(false); setTimeout(() => report.press(), 400); }],
    ['LEAVE VR', () => '', () => G.renderer.xr.getSession()?.end()],
    ['RADIO', () => (G.audio.radioOn ? 'ON' : 'OFF'), () => G.audio.setRadio(!G.audio.radioOn)],
    ['STATION', () => G.audio.label().toUpperCase(), () => { if (!G.audio.radioOn) G.audio.setRadio(true); else G.audio.tune(); }],
    ['TELEVISION', () => (G.tv?.on ? 'CH ' + G.tv.ch.ch + ' ' + G.tv.ch.name : 'OFF'), () => (G.tv.on ? G.tv.next() : G.tv.power(true))],
    ...(G.guest ? [['LEAVE THE BLOCK', () => 'TO THE MARKET', () => G.guestRole?.leave()]] : []),
  ];
  // which rows have a value that goes down and up (the stick's left and right; the others are switched either way)
  const STEP = { VOLUME: (d) => { S.volume = Math.max(0, Math.min(1.5, S.volume + d * 0.25)); if (G.audio.master) G.audio.master.gain.value = S.volume; }, 'SNAP TURN': (d) => { const a = [30, 45, 90]; S.turn = a[(a.indexOf(S.turn) + d + 3) % 3]; }, 'MY HEIGHT': (d) => { G.rig.position.y = Math.max(-0.3, Math.min(0.3, Math.round((G.rig.position.y + d * 0.1) * 10) / 10)); } };
  rows.push(['BOARDS', () => 'RESET PLACES', () => { G.boards?.reset(); place(); }]);
  const far = new V3(0, -99, 0), tmp = new V3(), ROWY = 78, y0 = (i) => ROWY + i * RH;
  let sel = 0, top = 0, lastAct = -1;
  const show = () => { if (sel < top) top = sel; if (sel >= top + VIS) top = sel - VIS + 1; top = Math.max(0, Math.min(rows.length - VIS, top)); };
  const act = (i, d = 0) => { const r = rows[i]; if (!r || lastAct === G.t) return; lastAct = G.t; sel = i; show(); if (d && STEP[r[0]]) STEP[r[0]](d); else r[2](); G.audio.play('click'); draw(); };
  m.move = (d) => { sel = Math.max(0, Math.min(rows.length - 1, sel + d)); show(); G.audio.play('click'); draw(); };
  m.select = () => act(sel); m.step = (d) => act(sel, d); m.rows = rows; m.state = () => ({ open: m.open, sel, top, name: rows[sel][0], value: rows[sel][1](), n: rows.length, vis: VIS });
  for (let i = 0; i < VIS; i++) { const local = new V3(W * 0.24, H / 2 - (y0(i) + RH / 2) / PH * H, 0.004); G.buttons.push({ getPos: () => (m.open ? board.localToWorld(tmp.copy(local)).clone() : far), r: 0.028, get name() { return rows[top + i] ? rows[top + i][0] : ''; }, press: () => act(top + i) }); }
  const slot = (hit) => { const y = hit.v * PH, i = Math.floor((y - ROWY) / RH); return i >= 0 && i < VIS && top + i < rows.length ? top + i : -1; };
  function draw() {
    tex.redraw((g, w, h) => { g.fillStyle = '#14161c'; g.fillRect(0, 0, w, h); g.strokeStyle = '#ffb040'; g.lineWidth = 8; g.strokeRect(4, 4, w - 8, h - 8);
      g.fillStyle = '#ffb040'; g.font = `bold 40px ${T.MONO}`; g.textAlign = 'left'; g.fillText('RAMEN — SETTINGS', 24, 52); g.textAlign = 'right'; g.font = `bold 26px ${T.MONO}`; g.fillText(`${sel + 1}/${rows.length}`, w - 40, 50);
      for (let k = 0; k < VIS; k++) { const i = top + k, r = rows[i]; if (!r) break; const y = y0(k), on = i === sel;
        g.fillStyle = on ? '#ffb040' : k % 2 ? '#1a1d25' : '#171a21'; g.fillRect(14, y + 3, w - 50, RH - 6); if (on) { g.strokeStyle = '#fff4d0'; g.lineWidth = 5; g.strokeRect(14, y + 3, w - 50, RH - 6); }
        g.fillStyle = on ? '#14161c' : '#e8e4d8'; g.font = `bold 32px ${T.JP}`; g.textAlign = 'left'; g.fillText((on ? '▶ ' : '   ') + r[0], 22, y + RH / 2 + 11, w * 0.5);
        g.fillStyle = on ? '#14161c' : '#2a3a30'; g.fillRect(w * 0.56, y + 9, w * 0.36, RH - 18); g.strokeStyle = '#40e080'; g.lineWidth = 3; g.strokeRect(w * 0.56, y + 9, w * 0.36, RH - 18);
        g.fillStyle = '#ffffff'; g.textAlign = 'center'; g.font = `bold 28px ${T.MONO}`; g.fillText((on && STEP[r[0]] ? '◀ ' : '') + (r[1]() || 'PRESS') + (on && STEP[r[0]] ? ' ▶' : ''), w * 0.74, y + RH / 2 + 10, w * 0.34); }
      { const x = w - 28, y = ROWY + 4, hh = VIS * RH - 8, k = VIS / rows.length; g.fillStyle = '#2a2d36'; g.fillRect(x, y, 12, hh); g.fillStyle = '#ffb040'; g.fillRect(x, y + hh * top / rows.length, 12, hh * k); }
      g.fillStyle = '#b8b4a8'; g.font = `bold 21px ${T.JP}`; g.textAlign = 'left'; g.fillText(G.renderer.xr.isPresenting ? 'Stick ↑↓ move · ←→ change · trigger or A/X select · B/Y close · grip moves the board' : '↑↓ or wheel move · ←→ change · Enter or click select · M close · hold click to move', 20, h - 16, w - 36); });
  }
  const rec = G.boards ? G.boards.add('settings', board, W, H) : null;
  if (rec) { rec.hover = (hit) => { const i = slot(hit); if (i >= 0 && i !== sel) { sel = i; draw(); } }; rec.press = (hit) => { const i = hit ? slot(hit) : -1; if (i >= 0) act(i); }; }
  const place = () => { if (rec) G.boards.summon(rec, 0.66, 0.1); else { const c = G.camera, p = c.getWorldPosition(new V3()), d = c.getWorldDirection(new V3()); d.y = 0; d.normalize(); board.position.copy(p).addScaledVector(d, 0.66); board.position.y = Math.max(1.2, p.y - 0.1); board.lookAt(p.x, board.position.y, p.z); } };
  m.toggle = (on = !m.open) => { m.open = G.menuOpen = on; board.visible = on; if (on) { place(); draw(); } G.audio.play('click'); };
  addEventListener('keydown', (e) => { if (!m.open || G.mode !== 'desktop' || (e.target && e.target.tagName === 'INPUT')) return; const k = e.code;
    if (k === 'ArrowUp' || k === 'KeyW') m.move(-1); else if (k === 'ArrowDown' || k === 'KeyS') m.move(1); else if (k === 'ArrowLeft' || k === 'KeyA') m.step(-1); else if (k === 'ArrowRight' || k === 'KeyD') m.step(1); else if (k === 'Enter' || k === 'NumpadEnter') m.select(); else if (k === 'Escape') m.toggle(false); else return; e.preventDefault(); });
  addEventListener('wheel', (e) => { if (m.open && G.mode === 'desktop') m.move(e.deltaY > 0 ? 1 : -1); }, { passive: true });
  const mpos = new V3(0.9, 0.93, -0.07), mb = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.034, 0.03, 12), new THREE.MeshBasicMaterial({ color: 0xd09020 })); mb.position.copy(mpos); mb.userData.keep = true; cart.group.add(mb);
  const lb = new THREE.Mesh(new THREE.PlaneGeometry(0.11, 0.03), new THREE.MeshBasicMaterial({ map: T.labelTex(['MENU'], { w: 256, h: 70, fs: 44 }), color: 0xbbbbbb })); lb.rotation.x = -Math.PI / 2; lb.position.set(0.9, 0.906, 0.0); lb.userData.keep = true; cart.group.add(lb);
  const btn = { getPos: () => mpos, r: 0.045, press: () => m.toggle(), name: 'MENU' }; mb.userData.button = btn; G.buttons.push(btn);
  let latch = false, acc = 0, rep = 0, xl = false, al = false;
  m.update = (dt) => { const ses = G.renderer.xr.getSession?.(); let down = false, ax = 0, ay = 0, a = false;
    if (ses) for (const s of ses.inputSources) { const gp = s.gamepad; if (!gp || s.hand) continue; if (gp.buttons[5] && gp.buttons[5].pressed) down = true; if (gp.buttons[4] && gp.buttons[4].pressed) a = true; const x = gp.axes.length >= 4 ? gp.axes[2] : gp.axes[0] || 0, y = gp.axes.length >= 4 ? gp.axes[3] : gp.axes[1] || 0; if (Math.abs(x) > Math.abs(ax)) ax = x; if (Math.abs(y) > Math.abs(ay)) ay = y; }
    if (down && !latch) m.toggle(); latch = down; if (!m.open) { al = a; return; }
    // the stick: one row a push, then on steadily while it is held; left and right once a push
    if (Math.abs(ay) > 0.55 && Math.abs(ay) > Math.abs(ax)) { rep -= dt; if (rep <= 0) { m.move(ay > 0 ? 1 : -1); rep = rep < -1 ? 0.4 : 0.16; } } else rep = -9;
    if (Math.abs(ax) > 0.6 && Math.abs(ax) > Math.abs(ay)) { if (!xl) { xl = true; m.step(ax > 0 ? 1 : -1); } } else if (Math.abs(ax) < 0.3) xl = false;
    if ((a && !al) || (ses && G.hands.some((h) => h.xr && h.active && h.useDown && !h.held && !h.board))) m.select(); al = a;
    acc += dt; if (acc > 1) { acc = 0; draw(); } };
  return m;
}
