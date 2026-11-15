// the in-game menu: every setting on one board you poke or point at; the Y or B button (or the MENU button on the right wing, or saying "menu") brings it up in front of you
import * as THREE from 'three';
import { G, V3 } from './ctx.js';
import * as T from './tex.js';

export function buildMenu(scene, cart, guide, talk, shadowLights, report) {
  const m = { open: false }, W = 0.62, H = 0.56, tex = T.panelTex(620, 560, () => { });
  const board = new THREE.Mesh(new THREE.PlaneGeometry(W, H), new THREE.MeshBasicMaterial({ map: tex, color: 0xd8d8d8, side: THREE.DoubleSide })); board.visible = false; board.userData.nopick = true; scene.add(board);
  const S = (G.set = { volume: 1, tts: true, mic: true, shadows: true, turn: 30, easy: (() => { try { return localStorage.getItem('yatai-easy') !== '0'; } catch (e) { return true; } })() });
  const rows = [
    ['EASY ON THE EYES', () => (S.easy ? 'ON' : 'OFF'), () => { S.easy = !S.easy; try { localStorage.setItem('yatai-easy', S.easy ? '1' : '0'); } catch (e) { /* not kept */ } G.eyes?.(S.easy); }],
    ['THE MARKET', () => (G.live ? G.live.status() : 'NOT LINKED'), () => { }],
    ['GUIDE MODE', () => (guide.on ? 'ON' : 'OFF'), () => guide.set(!guide.on)],
    ['RADIO', () => (G.audio.radioOn ? 'ON' : 'OFF'), () => G.audio.setRadio(!G.audio.radioOn)],
    ['STATION', () => G.audio.label().toUpperCase(), () => { if (!G.audio.radioOn) G.audio.setRadio(true); else G.audio.tune(); }],
    ['TELEVISION', () => (G.tv?.on ? 'CH ' + G.tv.ch.ch + ' ' + G.tv.ch.name : 'OFF'), () => (G.tv.on ? G.tv.next() : G.tv.power(true))],
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
  ];
  const rh = H / (rows.length + 1.4), far = new V3(0, -99, 0), tmp = new V3();
  rows.forEach((r, i) => { const local = new V3(W * 0.22, H / 2 - rh * (i + 1.75), 0.004); const b = { getPos: () => (m.open ? board.localToWorld(tmp.copy(local)).clone() : far), r: 0.028, name: r[0], press: () => { r[2](); G.audio.play('click'); draw(); } }; G.buttons.push(b); });
  function draw() {
    tex.redraw((g, w, h) => { g.fillStyle = '#14161c'; g.fillRect(0, 0, w, h); g.strokeStyle = '#ffb040'; g.lineWidth = 8; g.strokeRect(4, 4, w - 8, h - 8);
      g.fillStyle = '#ffb040'; g.font = `bold 38px ${T.MONO}`; g.textAlign = 'left'; g.fillText("YATAI '86 — SETTINGS", 24, 50);
      const rp = h / (rows.length + 1.4);
      rows.forEach((r, i) => { const y = rp * (i + 1.75); g.fillStyle = '#e8e4d8'; g.font = `bold 30px ${T.JP}`; g.textAlign = 'left'; g.fillText(r[0], 26, y + 10);
        g.fillStyle = '#2a3a30'; g.fillRect(w * 0.56, y - rp * 0.36, w * 0.4, rp * 0.72); g.strokeStyle = '#40e080'; g.lineWidth = 3; g.strokeRect(w * 0.56, y - rp * 0.36, w * 0.4, rp * 0.72);
        g.fillStyle = '#ffffff'; g.textAlign = 'center'; g.font = `bold 28px ${T.MONO}`; g.fillText(r[1]() || 'PRESS', w * 0.76, y + 10, w * 0.38); });
      g.fillStyle = '#9a968a'; g.font = `bold 22px ${T.JP}`; g.textAlign = 'left'; g.fillText('Poke a green box, or point and pull the trigger.  Y / B closes.', 24, h - 16, w - 40); });
  }
  m.toggle = (on = !m.open) => { m.open = on; board.visible = on; if (on) { const c = G.camera, p = c.getWorldPosition(new V3()), d = c.getWorldDirection(new V3()); d.y = 0; d.normalize(); board.position.copy(p).addScaledVector(d, 0.55); board.position.y = Math.max(1.2, p.y - 0.12); board.lookAt(p.x, board.position.y, p.z); draw(); } G.audio.play('click'); };
  const mpos = new V3(0.9, 0.93, -0.07), mb = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.034, 0.03, 12), new THREE.MeshBasicMaterial({ color: 0xd09020 })); mb.position.copy(mpos); mb.userData.keep = true; cart.group.add(mb);
  const lb = new THREE.Mesh(new THREE.PlaneGeometry(0.11, 0.03), new THREE.MeshBasicMaterial({ map: T.labelTex(['MENU'], { w: 256, h: 70, fs: 44 }), color: 0xbbbbbb })); lb.rotation.x = -Math.PI / 2; lb.position.set(0.9, 0.906, 0.0); lb.userData.keep = true; cart.group.add(lb);
  const btn = { getPos: () => mpos, r: 0.045, press: () => m.toggle(), name: 'MENU' }; mb.userData.button = btn; G.buttons.push(btn);
  let latch = false, acc = 0;
  m.update = (dt) => { const ses = G.renderer.xr.getSession?.(); let down = false; if (ses) for (const s of ses.inputSources) if (s.gamepad && s.gamepad.buttons[5] && s.gamepad.buttons[5].pressed) down = true; if (down && !latch) m.toggle(); latch = down; if (m.open) { acc += dt; if (acc > 1) { acc = 0; draw(); } } };
  return m;
}
