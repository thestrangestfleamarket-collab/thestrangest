// THE GARAGE's lessons: a first course at the kit as a teacher gives it: how to sit and hold the sticks, counting, the hi-hat, the backbeat, the kick, the first beat, fills, the rudiments, loud and soft; each shown on the kit as it comes, counted by the click, marked on how near the beat you were, and passed before the next
import * as THREE from 'three';

// steps to the bar; lanes by piece: x a note, X a loud one, g a soft one, o the hi-hat open; hands: who plays each snare step (R L); pass: the share to get right
export const LESSONS = [
  { name: 'SIT AND HOLD', say: 'Sit tall, thighs level, feet on the pedals. Hold each stick a third of the way up between thumb and first finger, the other fingers loose round it. Let it bounce. Hit the snare eight times, any speed.', free: 8 },
  { name: 'COUNT TO FOUR', say: 'Every bar has four beats. Count out loud: one, two, three, four. Play the snare on each, right hand then left.', bpm: 60, steps: 4, lanes: { snare: 'xxxx' }, hands: 'RLRL' },
  { name: 'EIGHTH NOTES', say: 'Now two notes to a beat: one and two and three and four and. Right hand on the hi-hat, even and relaxed.', bpm: 60, steps: 8, lanes: { hat: 'xxxxxxxx' } },
  { name: 'THE BACKBEAT', say: 'Keep the hi-hat going and bring the left hand down on the snare on two and four. That is the backbeat: most songs you know sit on it.', bpm: 60, steps: 8, lanes: { hat: 'xxxxxxxx', snare: '..x...x.' } },
  { name: 'THE KICK', say: 'The right foot. Play the kick on one and three, and count the others in your head.', bpm: 60, steps: 8, lanes: { kick: 'x...x...' } },
  { name: 'YOUR FIRST BEAT', say: 'Put them together slowly: hi-hat on every count, kick on one and three, snare on two and four. This is the beat of a thousand songs.', bpm: 60, steps: 8, lanes: { hat: 'xxxxxxxx', snare: '..x...x.', kick: 'x...x...' } },
  { name: 'THE SAME, FASTER', say: 'Same beat, a little quicker. Stay loose: speed comes from relaxing, not from trying.', bpm: 84, steps: 8, lanes: { hat: 'xxxxxxxx', snare: '..x...x.', kick: 'x...x...' } },
  { name: 'A BUSIER KICK', say: 'Add a kick on the and of three. The hands do not change; only the foot learns something new.', bpm: 76, steps: 8, lanes: { hat: 'xxxxxxxx', snare: '..x...x.', kick: 'x...xx..' } },
  { name: 'ROUND THE KIT', say: 'A fill: two on the snare, two on each tom, two on the floor tom, hands taking turns. Then the crash with the kick on one.', bpm: 66, steps: 8, lanes: { snare: 'xx......', tom1: '..xx....', tom2: '....xx..', floor: '......xx' }, hands: 'RLRLRLRL' },
  { name: 'SINGLE STROKES', say: 'The first rudiment: right, left, right, left, four to a beat. Make both hands sound the same.', bpm: 60, steps: 16, lanes: { snare: 'xxxxxxxxxxxxxxxx' }, hands: 'RLRLRLRLRLRLRLRL' },
  { name: 'DOUBLE STROKES', say: 'Two with each hand: right right, left left. Let the second note be a bounce.', bpm: 54, steps: 16, lanes: { snare: 'xxxxxxxxxxxxxxxx' }, hands: 'RRLLRRLLRRLLRRLL' },
  { name: 'THE PARADIDDLE', say: 'Right left right right, left right left left. Say it as you play it: pa-ra-did-dle.', bpm: 54, steps: 16, lanes: { snare: 'xxxxxxxxxxxxxxxx' }, hands: 'RLRRLRLLRLRRLRLL' },
  { name: 'LOUD AND SOFT', say: 'Dynamics. Play every eighth on the snare, but only two and four loud; the rest as quiet as you can, the stick barely leaving the head.', bpm: 60, steps: 8, lanes: { snare: 'ggXgggXg' } },
  { name: 'THE OPEN HI-HAT', say: 'The beat again, and on the and of four let the hi-hat open, closing it on one.', bpm: 72, steps: 8, lanes: { hat: 'xxxxxxxo', snare: '..x...x.', kick: 'x...x...' } },
  { name: 'ON THE RIDE', say: 'Move the right hand to the ride cymbal. Same beat, a different colour. Then go and play along to anything you like.', bpm: 80, steps: 8, lanes: { ride: 'xxxxxxxx', snare: '..x...x.', kick: 'x...x...' } },
];
const BARS = 4, PERFECT = 0.05, GOOD = 0.11, ROW = ['hat', 'ride', 'tom1', 'tom2', 'floor', 'snare', 'kick'], SHORT = { hat: 'HH', ride: 'RD', tom1: 'T1', tom2: 'T2', floor: 'FT', snare: 'SN', kick: 'BD' };

export function buildTeach(scene, kit, sound, saved, keep) {
  const C = document.createElement('canvas'); C.width = 1024; C.height = 512;
  const g = C.getContext('2d'), tex = new THREE.CanvasTexture(C); tex.colorSpace = THREE.SRGBColorSpace;
  const board = new THREE.Mesh(new THREE.PlaneGeometry(1.3, 0.65), new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthTest: false, fog: false, toneMapped: false }));
  board.position.set(0.12, 1.78, -1.85); board.rotation.x = 0.1; board.renderOrder = 19; board.visible = false; scene.add(board);
  // a ring over each piece that closes on it as its note comes
  const rings = {}, ringG = new THREE.TorusGeometry(1, 0.028, 6, 32).rotateX(Math.PI / 2);
  for (const p of kit.pieces) { rings[p.name] = [0, 1, 2].map(() => { const m = new THREE.Mesh(ringG, new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0, depthTest: false, fog: false, toneMapped: false })); m.renderOrder = 18; m.visible = false; scene.add(m); return m; }); }
  const T = { on: false, i: Math.min(LESSONS.length - 1, saved.lesson | 0), board, notes: [], t0: 0, bar: -1, got: 0, of: 0, free: 0, last: '', msg: '', best: saved.best || {}, state: 'idle', bpm: 60 };
  T.clock = () => sound.ctx.currentTime; // (a check can put its own clock here)
  const L = () => LESSONS[T.i];
  function draw(cursor) {
    const l = L();
    g.clearRect(0, 0, 1024, 512); g.fillStyle = 'rgba(8,8,10,.86)'; g.fillRect(0, 0, 1024, 512);
    g.textAlign = 'left'; g.fillStyle = '#ffb347'; g.font = '700 34px system-ui,sans-serif'; g.fillText('LESSON ' + (T.i + 1) + ' OF ' + LESSONS.length + ' · ' + l.name, 28, 46);
    g.fillStyle = '#f2efe6'; g.font = '500 25px system-ui,sans-serif';
    let line = '', y = 86; for (const w of l.say.split(' ')) { if (g.measureText(line + w).width > 965) { g.fillText(line, 28, y); y += 31; line = ''; } line += w + ' '; } g.fillText(line, 28, y);
    if (l.lanes) {
      const rows = ROW.filter((r) => l.lanes[r]), x0 = 96, w = (1024 - x0 - 30) / l.steps, y0 = 250, h = Math.min(44, 190 / rows.length), per = l.steps / 4;
      for (let s = 0; s < l.steps; s++) { g.fillStyle = s === cursor ? 'rgba(255,179,71,.35)' : s % per === 0 ? 'rgba(255,255,255,.08)' : 'rgba(255,255,255,.03)'; g.fillRect(x0 + s * w + 2, y0 - 34, w - 4, rows.length * h + 40); g.fillStyle = '#a8a498'; g.font = '600 20px system-ui,sans-serif'; g.textAlign = 'center'; g.fillText(s % per === 0 ? String(s / per + 1) : per === 2 || s % per === per / 2 ? '&' : per === 4 ? (s % per === 1 ? 'e' : 'a') : '', x0 + s * w + w / 2, y0 - 12); }
      rows.forEach((r, k) => { g.textAlign = 'left'; g.fillStyle = '#a8a498'; g.font = '700 22px system-ui,sans-serif'; g.fillText(SHORT[r], 28, y0 + k * h + h * 0.7);
        for (let s = 0; s < l.steps; s++) { const c = l.lanes[r][s]; if (!c || c === '.') continue; const hand = r === 'snare' || l.hands ? (l.hands || '')[s] : ''; g.fillStyle = c === 'X' ? '#ff6a3c' : c === 'g' ? '#7f8a96' : c === 'o' ? '#4cc9f0' : '#f2efe6'; g.beginPath(); g.arc(x0 + s * w + w / 2, y0 + k * h + h / 2, c === 'g' ? 8 : c === 'X' ? 16 : 12, 0, 7); g.fill(); if (hand && r !== 'kick') { g.fillStyle = '#111'; g.font = '700 15px system-ui,sans-serif'; g.textAlign = 'center'; g.fillText(hand, x0 + s * w + w / 2, y0 + k * h + h / 2 + 5); } } });
    }
    g.textAlign = 'left'; g.fillStyle = '#ffb347'; g.font = '700 26px system-ui,sans-serif'; g.fillText(T.msg || (l.free ? T.free + ' OF ' + l.free : Math.round(T.bpm) + ' BPM'), 28, 492);
    g.textAlign = 'right'; g.fillStyle = '#a8a498'; g.font = '500 21px system-ui,sans-serif'; g.fillText((T.best[T.i] ? 'BEST ' + T.best[T.i] + '% · ' : '') + 'left stick ↔ / , . : other lessons', 996, 492);
    tex.needsUpdate = true;
  }
  const begin = () => { const l = L(); T.notes = []; T.bar = -1; T.got = T.of = T.free = 0; T.msg = ''; T.bpm = l.bpm || 60; T.state = l.free ? 'free' : 'count'; T.t0 = sound.ctx ? T.clock() + 0.4 : 0; T.sched = 0; T.barQ = -1; T.last = ''; draw(-1); };
  T.start = (on) => { T.on = on ?? !T.on; board.visible = T.on; for (const k in rings) for (const m of rings[k]) m.visible = false; if (T.on) begin(); };
  T.go = (d) => { T.i = Math.max(0, Math.min(LESSONS.length - 1, T.i + d)); saved.lesson = T.i; keep(); if (T.on) begin(); };
  // a hit is matched to the nearest waiting note of its piece
  T.hit = (piece, vel, side) => {
    if (!T.on || !sound.ctx) return;
    const l = L(), t = T.clock();
    if (l.free) { if (piece === 'snare') { T.free++; if (T.free >= l.free) pass(100); else draw(-1); } return; }
    let best = null, bd = GOOD; for (const n of T.notes) { if (n.done || n.piece !== piece) continue; const d = Math.abs(n.t - t); if (d < bd) { bd = d; best = n; } }
    if (!best) { T.last = 'EXTRA'; return; }
    best.done = true;
    const hand = best.hand && side ? (side === 'right' ? 'R' : 'L') === best.hand : true, dyn = best.c === 'X' ? vel > 0.5 : best.c === 'g' ? vel < 0.42 : true;
    if (hand && dyn) { T.got += bd < PERFECT ? 1 : 0.7; T.last = bd < PERFECT ? 'ON IT' : t < best.t ? 'EARLY' : 'LATE'; } else T.last = !hand ? 'OTHER HAND' : best.c === 'X' ? 'LOUDER' : 'SOFTER';
    best.ring && (best.ring.material.color.setHex(hand && dyn ? (bd < PERFECT ? 0x5ee07a : 0xffd34d) : 0xff5a4a), best.ring.userData.flash = 0.18);
  };
  function pass(score) { T.best[T.i] = Math.max(T.best[T.i] || 0, score); saved.best = T.best; const ok = score >= 80; T.msg = score + '%  ' + (ok ? (T.i < LESSONS.length - 1 ? 'GOOD. NEXT LESSON.' : 'THAT IS THE COURSE. GO AND PLAY.') : 'AGAIN, A LITTLE SLOWER.'); T.state = 'done'; T.doneT = T.clock(); T.passed = ok; if (ok && T.i < LESSONS.length - 1) saved.lesson = T.i + 1; keep(); draw(-1); }
  T.update = () => {
    if (!T.on || !sound.ctx) return;
    const l = L(), now = T.clock();
    for (const k in rings) for (const m of rings[k]) { if (m.userData.flash > 0) { m.userData.flash -= 0.016; if (m.userData.flash <= 0) m.visible = false; } }
    if (T.state === 'done') { if (now - T.doneT > 3.2) { if (T.passed && T.i < LESSONS.length - 1) T.i++; else if (!T.passed && l.bpm) T.slow = true; begin(); if (T.slow) { T.bpm = Math.max(40, (l.bpm || 60) - 8); T.slow = false; } } return; }
    if (l.free) return;
    const beat = 60 / T.bpm, stepT = beat * 4 / l.steps, barT = beat * 4;
    // the click a little ahead on the audio clock; one bar counted in, then the bars to play
    while (T.sched * beat + T.t0 < now + 0.15) { if (!T.mute) sound.tick(T.t0 + T.sched * beat, T.sched % 4 === 0); T.sched++; }
    const bar = Math.floor((now - T.t0) / barT) - 1, step = Math.floor(((now - T.t0) % barT) / stepT);
    // the notes of the bar after this one are laid out as this one starts
    const want = Math.floor((now - T.t0) / barT);
    if (want >= 0 && want > T.barQ && want < BARS) { T.barQ = want; for (const r in l.lanes) for (let s = 0; s < l.steps; s++) { const c = l.lanes[r][s]; if (c && c !== '.') { T.notes.push({ piece: r, t: T.t0 + (want + 1) * barT + s * stepT, c, hand: l.hands && r !== 'kick' && r !== 'hat' && r !== 'ride' ? l.hands[s] : '' }); T.of++; } } }
    if (bar !== T.bar || step !== T.step) { T.bar = bar; T.step = step; T.msg = bar < 0 ? 'COUNT IN: ' + (Math.floor(((now - T.t0) % barT) / beat) + 1) : bar < BARS ? 'BAR ' + (bar + 1) + ' OF ' + BARS + (T.last ? ' · ' + T.last : '') : ''; draw(bar >= 0 && bar < BARS ? step : -1); }
    // rings: each waiting note's ring closes from wide to the piece's own size at its moment
    for (const k in rings) { let i = 0; const P = kit.P[k]; for (const n of T.notes) { if (n.piece !== k || n.done || i > 2) continue; const dt = n.t - now; if (dt < -GOOD) { n.done = true; continue; } if (dt > beat * 1.5) continue; const m = rings[k][i++]; n.ring = m; m.visible = true; m.userData.flash = 0; m.position.copy(P.wc).addScaledVector(P.wn, 0.03); m.quaternion.setFromUnitVectors(UP, P.wn); const s = P.radius * (1 + Math.max(0, dt) / beat * 0.7); m.scale.setScalar(s); m.material.opacity = 0.9 - 0.65 * Math.min(1, Math.max(0, dt) / beat); m.material.color.setHex(n.hand === 'L' ? 0x4cc9f0 : n.hand === 'R' ? 0xffb347 : n.c === 'X' ? 0xff6a3c : n.c === 'g' ? 0x9aa4ae : 0xf2efe6); } for (; i < 3; i++) if (!(rings[k][i].userData.flash > 0)) rings[k][i].visible = false; }
    if (bar >= BARS && T.state !== 'done') pass(T.of ? Math.round(100 * T.got / T.of) : 0);
  };
  const UP = new THREE.Vector3(0, 1, 0);
  return T;
}
