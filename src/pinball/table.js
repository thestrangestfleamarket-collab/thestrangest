// POOH and MICKEY pinball — embeddable ES module for three.js games (the owner's, 12 Nov 2026; put into src/146zcz-pinball.js by the build). A mesh that never moves or changes is marked userData.still.
//   import * as THREE from 'three';
//   import { createPinball } from './pinball.module.js';
//   const pooh = createPinball(THREE, { theme: 'pooh' });   const mickey = createPinball(THREE, { theme: 'mickey' });

// makePB(cfg): pure 2D pinball simulation and rules (cfg.bumpers moves the pop bumpers). PB is the default table. Playfield coordinates in metres: x across (0..0.51), y up the table (0..1.07).
function makePB(cfg) {
  cfg = cfg || {};
  var TW = 0.51, TH = 1.07, PW = 0.468, BR = 0.0125, GRAV = 1.35, VMAX = 6.5, WR = 0.003, D = Math.PI / 180;
  var segs = [], circs = [];
  function seg(ax, ay, bx, by, o) {
    var dx = bx - ax, dy = by - ay, len = Math.sqrt(dx * dx + dy * dy);
    var s = { ax: ax, ay: ay, bx: bx, by: by, dx: dx, dy: dy, len2: len * len, len: len, nx: -dy / len, ny: dx / len, r: WR, e: 0.45, kind: 'wall' };
    if (o) for (var k in o) s[k] = o[k];
    segs.push(s); return s;
  }
  function arc(cx, cy, R, a0, a1, n, o) {
    for (var i = 0; i < n; i++) {
      var a = a0 + (a1 - a0) * i / n, b = a0 + (a1 - a0) * (i + 1) / n;
      seg(cx + R * Math.cos(a), cy + R * Math.sin(a), cx + R * Math.cos(b), cy + R * Math.sin(b), o);
    }
  }
  function circ(x, y, r, o) { var c = { x: x, y: y, r: r, e: 0.5, kind: 'post' }; if (o) for (var k in o) c[k] = o[k]; circs.push(c); return c; }
  var mx = function (x) { return PW - x; };

  // ---- cabinet outline, shooter lane, top arch
  seg(0, -0.05, 0, 0.815, { kind: 'rail' }); seg(TW, 0.0, TW, 0.815, { kind: 'rail' });
  seg(PW, -0.05, PW, 0.815, { kind: 'rail' });
  seg(PW, 0.03, TW, 0.03, { kind: 'rail', e: 0.1 });
  arc(0.255, 0.815, 0.255, 0, Math.PI, 30, { kind: 'rail' });
  seg(PW, 0.815, 0.476, 0.9425, { kind: 'gate', oneWay: true });
  seg(0.1353, 1.0401, 0.152, 0.992, { kind: 'rubberwall', e: 0.6 });   // stopper: plunged balls drop into the top lanes
  // ---- inlanes, slingshots (left, then mirrored right)
  [0, 1].forEach(function (side) {
    var X = side ? mx : function (x) { return x; };
    seg(X(0.036), 0.33, X(0.036), 0.19, { kind: 'guide' }); seg(X(0.036), 0.19, X(0.130), 0.133, { kind: 'guide' });
    circ(X(0.036), 0.33, 0.006, { e: 0.7, kind: 'rubber' });
    seg(X(0.080), 0.205, X(0.080), 0.325, { kind: 'slingbody' }); seg(X(0.080), 0.205, X(0.132), 0.187, { kind: 'slingbody' });
    seg(X(0.080), 0.325, X(0.132), 0.187, { kind: 'sling', side: side, e: 0.5 });
    circ(X(0.105), 0.40, 0.008, { e: 0.75, kind: 'rubber' });
  });
  // ---- left: honey-tree saucer pocket on top of the HUNNY target bank
  seg(0, 0.45, 0.045, 0.49, { kind: 'block' });
  for (var i = 0; i < 5; i++) seg(0.045, 0.49 + i * 0.04, 0.045, 0.53 + i * 0.04, { kind: 'target', bank: 0, i: i, e: 0.55 });
  seg(0.045, 0.69, 0.07, 0.75, { kind: 'block' }); seg(0.07, 0.75, 0.032, 0.725, { kind: 'block', e: 0.2 }); seg(0.032, 0.725, 0, 0.75, { kind: 'block', e: 0.2 });
  var SAUCER = { x: 0.032, y: 0.7405, r: 0.012 };
  // ---- right: orbit guide carrying the WILLIE targets, ship's-wheel spinner in the orbit lane
  for (i = 0; i < 6; i++) seg(0.40, 0.55 + i * 0.04, 0.40, 0.59 + i * 0.04, { kind: 'target', bank: 1, i: i, e: 0.55 });
  circ(0.40, 0.55, 0.006, { e: 0.7, kind: 'rubber' }); circ(0.40, 0.79, 0.006, { e: 0.7, kind: 'rubber' });
  var SPIN = { y: 0.52, x0: 0.404, x1: 0.464 };
  // ---- top rollover lanes and honey-pot pop bumpers
  var LANES = [0.165, 0.235, 0.305], LANE_Y = 0.915;
  [0.13, 0.20, 0.27, 0.34].forEach(function (x) { seg(x, 0.885, x, 0.945, { kind: 'guide', e: 0.5 }); });
  var BUMP = (cfg.bumpers || [[0.165, 0.745], [0.305, 0.745], [0.235, 0.655]]).map(function (p, i) { return circ(p[0], p[1], 0.03, { kind: 'bumper', i: i }); });

  function flipper(side) {
    var rest = side ? 210 * D : -30 * D, up = side ? 150 * D : 30 * D;
    return { side: side, px: side ? mx(0.142) : 0.142, py: 0.125, len: 0.072, r0: 0.011, r1: 0.006, rest: rest, up: up, ang: rest, om: 0, on: false };
  }
  function create() {
    return { balls: [], fl: [flipper(0), flipper(1)], spin: { ang: 0, om: 0 }, t: 0, score: 0, ball: 0, phase: 'idle', mult: 1,
      hunny: [0, 0, 0, 0, 0], willie: [0, 0, 0, 0, 0, 0], bee: [0, 0, 0], frenzy: 0, steam: 0, mbReady: false, multiball: false, save: 0,
      bumps: 0, hits: 0, hold: null, charge: 0, charging: false, doneH: false, doneW: false, pending: 0 };
  }
  function serve(s, auto) {
    var b = { x: 0.489, y: 0.03 + WR + BR + 0.002, vx: 0, vy: 0, still: 0, auto: auto || 0, held: false, inLane: -1, py: 0 };
    s.balls.push(b); return b;
  }
  function startGame(s, ev) {
    var n = create(); for (var k in n) s[k] = n[k];
    s.ball = 1; s.phase = 'ready'; serve(s); if (ev) ev.push({ k: 'ready', ball: 1 });
  }
  function nextBall(s, ev) {
    if (s.phase !== 'between') return;
    if (s.ball >= 3) { s.phase = 'over'; ev.push({ k: 'gameover', score: s.score }); return; }
    s.ball++; s.mult = 1; s.hits = 0; s.bumps = 0; s.frenzy = 0; s.steam = 0; s.save = 0; s.bee = [0, 0, 0];
    s.phase = 'ready'; serve(s); ev.push({ k: 'ready', ball: s.ball });
  }
  function resting(b) { return b.x > PW && b.y < 0.09 && Math.abs(b.vy) < 0.4; }
  function launch(s, b, power, ev) {
    b.vy = 1.9 + 2.4 * power; b.vx = 0; b.y += 0.002;
    if (s.phase === 'ready') { s.phase = 'play'; s.save = 12; }
    ev.push({ k: 'launch', s: power });
  }
  function plunge(s, on, ev) {
    if (on) { if (!s.charging) { s.charging = true; s.charge = 0; } return; }
    if (!s.charging) return;
    s.charging = false;
    for (var i = 0; i < s.balls.length; i++) if (resting(s.balls[i]) && !(s.balls[i].auto > 0)) launch(s, s.balls[i], s.charge, ev);
    s.charge = 0;
  }
  function flip(s, side, on, ev) {
    var f = s.fl[side]; if (f.on === on) return; f.on = on;
    if (on) {
      ev.push({ k: 'flipper', side: side });
      if (side) s.bee.unshift(s.bee.pop()); else s.bee.push(s.bee.shift());   // lane change
    }
  }
  function add(s, pts) { s.score += pts * (s.multiball ? 2 : 1); }

  function bounce(s, b, nx, ny, pen, e, o, ev) {
    b.x += nx * pen; b.y += ny * pen;
    var vn = b.vx * nx + b.vy * ny;
    if (vn >= 0) return;
    var sp = -vn, k = sp > 0.12 ? 1 + e : 1;
    b.vx -= k * vn * nx; b.vy -= k * vn * ny;
    var kind = o.kind;
    if (kind === 'sling' && sp > 0.25) { b.vx += nx * 1.5; b.vy += ny * 1.5; add(s, 10); ev.push({ k: 'sling', side: o.side, s: sp }); }
    else if (kind === 'bumper' && sp > 0.08) { b.vx += nx * 1.3; b.vy += ny * 1.3; s.bumps++; add(s, s.frenzy > 0 ? 1000 : 100); ev.push({ k: 'bumper', i: o.i, s: sp }); }
    else if (kind === 'target' && sp > 0.2) hitTarget(s, o, ev);
    else if (sp > 0.25) ev.push({ k: kind === 'rubber' ? 'rubber' : 'wall', s: sp });
  }
  function hitTarget(s, o, ev) {
    var arr = o.bank ? s.willie : s.hunny;
    if (arr[o.i]) { add(s, 50); ev.push({ k: 'target', bank: o.bank, i: o.i, lit: false }); return; }
    arr[o.i] = 1; s.hits++; add(s, 500); ev.push({ k: 'target', bank: o.bank, i: o.i, lit: true });
    for (var i = 0; i < arr.length; i++) if (!arr[i]) return;
    for (i = 0; i < arr.length; i++) arr[i] = 0;
    add(s, 5000);
    if (o.bank) { s.steam = 20; s.doneW = true; } else { s.frenzy = 20; s.doneH = true; }
    ev.push({ k: 'bank', bank: o.bank });
    if (s.doneH && s.doneW && !s.multiball && !s.mbReady) { s.mbReady = true; ev.push({ k: 'mbready' }); }
  }

  function step(s, dt, ev) {
    var i, j, b, f, g, dx, dy, d, t, n;
    s.t += dt;
    if (s.phase === 'play') { if (s.frenzy > 0) s.frenzy -= dt; if (s.steam > 0) s.steam -= dt; if (s.save > 0) s.save -= dt; }
    if (s.jackT > 0) s.jackT -= dt;
    if (s.charging) s.charge = Math.min(1, s.charge + dt / 0.9);
    for (i = 0; i < 2; i++) {
      f = s.fl[i]; var tgt = f.on ? f.up : f.rest, sp = (f.on ? 38 : 22) * dt, da = tgt - f.ang, o = f.ang;
      f.ang = Math.abs(da) <= sp ? tgt : f.ang + (da > 0 ? sp : -sp); f.om = (f.ang - o) / dt;
    }
    s.spin.ang += s.spin.om * dt; s.spin.om *= Math.exp(-1.6 * dt);
    if (s.hold) {
      s.hold.t -= dt;
      if (s.hold.t <= 0) { b = s.hold.b; b.held = false; b.vx = 1.25 + Math.random() * 0.35; b.vy = 0.02 + Math.random() * 0.22; b.x += 0.01; b.y += 0.012; b.cool = 0.5; s.hold = null; ev.push({ k: 'kick' }); }
    }
    for (i = 0; i < s.balls.length; i++) {
      b = s.balls[i]; if (b.held) continue;
      if (b.auto > 0) { b.auto -= dt; if (b.auto <= 0 && resting(b)) launch(s, b, 0.72 + Math.random() * 0.15, ev); }
      if (b.cool > 0) b.cool -= dt;
      b.py = b.y;
      b.vy -= GRAV * dt; var dr = 1 - 0.06 * dt; b.vx *= dr; b.vy *= dr;
      b.x += b.vx * dt; b.y += b.vy * dt;
      for (j = 0; j < segs.length; j++) {
        g = segs[j];
        t = ((b.x - g.ax) * g.dx + (b.y - g.ay) * g.dy) / g.len2; t = t < 0 ? 0 : t > 1 ? 1 : t;
        dx = b.x - (g.ax + g.dx * t); dy = b.y - (g.ay + g.dy * t); d = dx * dx + dy * dy; n = BR + g.r;
        if (d >= n * n) continue;
        d = Math.sqrt(d);
        if (g.oneWay) { if (b.vx * g.nx + b.vy * g.ny >= 0) continue; if ((b.x - g.ax) * g.nx + (b.y - g.ay) * g.ny < -0.3 * BR) continue; }
        if (d > 1e-7) bounce(s, b, dx / d, dy / d, n - d, g.e, g, ev); else bounce(s, b, g.nx, g.ny, n, g.e, g, ev);
      }
      for (j = 0; j < circs.length; j++) {
        g = circs[j]; dx = b.x - g.x; dy = b.y - g.y; d = dx * dx + dy * dy; n = BR + g.r;
        if (d >= n * n || d < 1e-12) continue;
        d = Math.sqrt(d); bounce(s, b, dx / d, dy / d, n - d, g.e, g, ev);
      }
      for (j = 0; j < 2; j++) {
        f = s.fl[j]; var fx = Math.cos(f.ang) * f.len, fy = Math.sin(f.ang) * f.len;
        t = ((b.x - f.px) * fx + (b.y - f.py) * fy) / (f.len * f.len); t = t < 0 ? 0 : t > 1 ? 1 : t;
        var cx = f.px + fx * t, cy = f.py + fy * t; dx = b.x - cx; dy = b.y - cy; d = Math.sqrt(dx * dx + dy * dy); n = BR + f.r0 + (f.r1 - f.r0) * t;
        if (d >= n || d < 1e-7) continue;
        var nx = dx / d, ny = dy / d, sx = -f.om * (cy - f.py), sy = f.om * (cx - f.px), vn = (b.vx - sx) * nx + (b.vy - sy) * ny;
        b.x += nx * (n - d); b.y += ny * (n - d);
        if (vn < 0) { var k = -vn > 0.3 ? 1.3 : 1; b.vx -= k * vn * nx; b.vy -= k * vn * ny; if (-vn > 0.5) ev.push({ k: 'flip', s: -vn }); }
      }
      // sensors
      if (b.x > SPIN.x0 && b.x < SPIN.x1 && (b.py - SPIN.y) * (b.y - SPIN.y) < 0) { s.spin.om += b.vy * 22; ev.push({ k: 'spinhit', s: Math.abs(b.vy) }); }
      var ln = -1;
      if (Math.abs(b.y - LANE_Y) < 0.02) for (j = 0; j < 3; j++) if (Math.abs(b.x - LANES[j]) < 0.028) ln = j;
      if (ln !== b.inLane) {
        b.inLane = ln;
        if (ln >= 0) {
          if (!s.bee[ln]) {
            s.bee[ln] = 1; add(s, 300); ev.push({ k: 'lane', i: ln });
            if (s.bee[0] && s.bee[1] && s.bee[2]) { s.bee = [0, 0, 0]; if (s.mult < 5) s.mult++; add(s, 1000); ev.push({ k: 'mult', mult: s.mult }); }
          } else add(s, 30);
        }
      }
      dx = b.x - SAUCER.x; dy = b.y - SAUCER.y;
      if (!s.hold && !(b.cool > 0) && dx * dx + dy * dy < SAUCER.r * SAUCER.r && b.vx * b.vx + b.vy * b.vy < 2.25) {
        b.held = true; b.x = SAUCER.x; b.y = SAUCER.y; b.vx = b.vy = 0; s.hold = { b: b, t: 1.3 };
        if (s.mbReady) {
          s.mbReady = false; s.multiball = true; s.doneH = s.doneW = false; s.score += 10000; s.save = Math.max(s.save, 15);
          serve(s, 0.5); s.pending = 1; ev.push({ k: 'multiball' });
        } else if (s.multiball && !(s.jackT > 0)) { add(s, 25000); s.jackT = 8; ev.push({ k: 'jackpot' }); }   // jackpot relights after 8 s
        else { add(s, 2500); ev.push({ k: 'saucer' }); }
      }
      var v2 = b.vx * b.vx + b.vy * b.vy;
      if (v2 > VMAX * VMAX) { v2 = VMAX / Math.sqrt(v2); b.vx *= v2; b.vy *= v2; }
      if (v2 < 0.0009 && !resting(b)) { b.still += dt; if (b.still > 3) { b.still = 0; b.vx += (Math.random() - 0.5) * 0.6; b.vy += 0.3; ev.push({ k: 'nudge' }); } } else b.still = 0;
    }
    // a second multiball ball is fed once the first has left the lane
    if (s.pending > 0) { var busy = false; for (i = 0; i < s.balls.length; i++) if (s.balls[i].x > PW && s.balls[i].y < 0.3) busy = true; if (!busy) { s.pending--; serve(s, 0.4); } }
    for (i = 0; i < s.balls.length; i++) for (j = i + 1; j < s.balls.length; j++) {
      var a = s.balls[i], c = s.balls[j]; dx = c.x - a.x; dy = c.y - a.y; d = dx * dx + dy * dy;
      if (d >= 4 * BR * BR || d < 1e-12) continue;
      d = Math.sqrt(d); var ux = dx / d, uy = dy / d, ov = (2 * BR - d) / 2;
      if (!a.held) { a.x -= ux * ov; a.y -= uy * ov; } if (!c.held) { c.x += ux * ov; c.y += uy * ov; }
      var rv = (c.vx - a.vx) * ux + (c.vy - a.vy) * uy;
      if (rv < 0) { var im = -0.95 * rv; if (!a.held) { a.vx -= im * ux; a.vy -= im * uy; } if (!c.held) { c.vx += im * ux; c.vy += im * uy; } if (rv < -0.3) ev.push({ k: 'ballhit', s: -rv }); }
    }
    for (i = s.balls.length - 1; i >= 0; i--) {
      b = s.balls[i];
      if (b.y > -0.04 && isFinite(b.x + b.y)) continue;
      s.balls.splice(i, 1);
      if (s.phase !== 'play') continue;
      if (s.save > 0) { serve(s, 0.6); ev.push({ k: 'saved' }); continue; }
      ev.push({ k: 'drain', left: s.balls.length + s.pending });
      if (s.multiball && s.balls.length + s.pending <= 1) { s.multiball = false; ev.push({ k: 'mbend' }); }
      if (s.balls.length + s.pending === 0) {
        var bonus = (s.hits * 250 + s.bumps * 50) * s.mult; s.score += bonus; s.phase = 'between';
        ev.push({ k: 'ballend', bonus: bonus, mult: s.mult, ball: s.ball });
      }
    }
  }

  return { TW: TW, TH: TH, PW: PW, BR: BR, WR: WR, segs: segs, circs: circs, SAUCER: SAUCER, SPIN: SPIN, LANES: LANES, LANE_Y: LANE_Y, BUMP: BUMP,
    create: create, startGame: startGame, nextBall: nextBall, step: step, flip: flip, plunge: plunge, resting: resting };
}
const PB = makePB();

// Two tables share one engine: POOH (A. A. Milne's Winnie-the-Pooh, 1926) and MICKEY (Steamboat Willie, 1928).
var PIN_THEMES = {
  pooh: { id: 'pooh', title: 'POOH', sub: 'WINNIE-THE-POOH · 1926', who: 'WINNIE-THE-POOH', bank0: 'HUNNY', bank1: 'PIGLET', lanes: 'BEE',
    mode0: 'HUNNY FRENZY', mode0sub: 'POTS 10X', mode1: 'WOOZLE HUNT', mode1sub: 'SPINNER 10X', saucer: 'HONEY TREE', mb: 'HUNNY MULTIBALL', lit: 'HONEY TREE IS LIT',
    rules: 'Spell HUNNY and PIGLET, then find the Honey Tree for MULTIBALL', bumpers: [[0.165, 0.745], [0.305, 0.745], [0.235, 0.655]],
    pal: { paper: '#efdfb4', s1: '120,90,40', s2: '255,250,230', r1: '#8fb3c2', r2: '#b9d3dc', ink: '#4a3218', inkR: '#2f5565', title: '#b3660a', lane: '#3a2a1c', chev: '#e8c45a', halo: 'rgba(239,223,180,.9)' },
    c: { slingbody: 0xb97a12, block: 0x3f6b2d, pl: 0xe9a81c, pr: 0xe9a81c, bank: 0x4f7d33, cab: 0x1b2d5a, t0: 0xf2b530, t1: 0xf7b6c6, e0: 0xffb000, e1: 0xff8fb0,
      i0: 0xffc21a, i1: 0xffa6c0, il: 0xffe14a, fx: 0xffb81f, flRub: 0xd3202a, apron: '#1b2d5a', apronLine: '#e9a81c', apronTitle: '#ffe9a8' } },
  mickey: { id: 'mickey', title: 'MICKEY', sub: 'STEAMBOAT WILLIE · 1928', who: 'MICKEY', bank0: 'STEAM', bank1: 'WILLIE', lanes: 'MOO',
    mode0: 'WHISTLE FRENZY', mode0sub: 'WHISTLES 10X', mode1: 'FULL STEAM AHEAD', mode1sub: 'WHEEL 10X', saucer: 'POTATO BIN', mb: 'ALL ABOARD MULTIBALL', lit: 'POTATO BIN IS LIT',
    rules: 'Spell STEAM and WILLIE, then find the Potato Bin for MULTIBALL', bumpers: [[0.235, 0.765], [0.168, 0.66], [0.302, 0.66]],
    pal: { paper: '#dcdcdc', s1: '40,40,40', s2: '255,255,255', r1: '#7d7d7d', r2: '#a9a9a9', ink: '#1c1c1c', inkR: '#1c1c1c', title: '#111111', lane: '#1a1a1a', chev: '#f2f2f2', halo: 'rgba(220,220,220,.9)' },
    c: { slingbody: 0x3a3a3a, block: 0x2c2c2c, pl: 0xf0f0f0, pr: 0xf0f0f0, bank: 0x4a4a4a, cab: 0x101010, t0: 0xf2f2f2, t1: 0xf2f2f2, e0: 0xffffff, e1: 0xffffff,
      i0: 0xffffff, i1: 0xffffff, il: 0xffffff, fx: 0xffffff, flRub: 0x111111, apron: '#111111', apronLine: '#f2f2f2', apronTitle: '#ffffff' } }
};
// ---------------------------------------------------------------------------
// createPinball(THREE, { theme: 'pooh' | 'mickey' }) -> a self-contained pinball table you add to your own scene.
// POOH draws on A. A. Milne's Winnie-the-Pooh (1926); MICKEY on Steamboat Willie (1928). Both are in the US public domain.
// The bear has no red shirt and the mouse is the black-and-white, gloveless 1928 design: later versions are not public domain.
// The 3D figures are hand-built stand-ins. For the exact original artwork pass { backglassImage: <img or canvas> } with a
// frame of the 1928 film or a scan of a 1926 illustration and it is shown on the backbox as-is.
//
//   const pin = createPinball(THREE, { theme: 'mickey', lights: true });
//   scene.add(pin.group);                      // table is centred on the group; player stands at +z looking toward -z
//   pin.on('score', e => hud(e.score));  pin.on('message', e => toast(e.text));
//   pin.start();
//   // every frame:  pin.update(dt);
//   // input:        pin.flip(0|1, true|false);   pin.plunge(true) to pull back, pin.plunge(false) to release
//
// Units are metres (playfield 0.51 x 1.07). Events: 'score' {score}, 'message' {text, big}, 'sound' {name, strength},
// 'ready' {ball}, 'ballend' {bonus, mult, ball}, 'gameover' {score}. No DOM, audio, camera or input handling is included.
// Works with three r128 and newer.
// ---------------------------------------------------------------------------
function createPinball(THREE, options) {
  var T = THREE, opt = options || {}, K = PIN_THEMES[opt.theme] || PIN_THEMES.pooh, POOH = K.id === 'pooh', P = makePB({ bumpers: K.bumpers }), TW = P.TW, TH = P.TH, PI = Math.PI;
  var clamp = function (v, a, b) { return v < a ? a : v > b ? b : v; };
  var FONT = opt.font || "'Bungee','Arial Black',Arial,sans-serif", HAND = opt.handFont || "'Patrick Hand','Comic Sans MS',cursive";
  var disposables = [], listeners = {};
  function emit(name, data) { (listeners[name] || []).forEach(function (f) { f(data || {}); }); }
  function canvasTex(w, h, draw) {
    var c = document.createElement('canvas'); c.width = w; c.height = h;
    var g = c.getContext('2d'); draw(g, w, h);
    var t = new T.CanvasTexture(c);
    if ('colorSpace' in t) t.colorSpace = 'srgb'; else t.encoding = T.sRGBEncoding;
    t.anisotropy = 8; t._pb = { c: c, g: g, w: w, h: h, draw: draw }; disposables.push(t); return t;
  }
  function redraw(t) { var d = t._pb; d.g.clearRect(0, 0, d.w, d.h); d.draw(d.g, d.w, d.h); t.needsUpdate = true; }
  var mat = function (m) { disposables.push(m); return m; }, geo = function (g) { disposables.push(g); return g; };
  var std = function (o) { return mat(new T.MeshStandardMaterial(o)); };
  var basic = function (o) { o.toneMapped = false; return mat(new T.MeshBasicMaterial(o)); };

  var S = P.create();
  var group = new T.Group(); group.name = 'PinballTable';
  var tbl = new T.Group(); tbl.rotation.x = -PI / 2 + 0.115; tbl.position.set(-TW / 2, 0, TH / 2 * Math.cos(0.115)); group.add(tbl);
  function put(mesh, x, y, z, parent) { mesh.position.set(x, y, z || 0); (parent || tbl).add(mesh); return mesh; }
  function upright(mesh) { mesh.rotation.x = PI / 2; return mesh; }

  // ---------------- playfield art: a storybook map of the wood, with the river running down the right
  var fieldTex = canvasTex(1020, 2140, function (g, W, H) {
    var sc = W / TW, X = function (x) { return x * sc; }, Y = function (y) { return (TH - y) * sc; }, i, pal = K.pal;
    g.fillStyle = pal.paper; g.fillRect(0, 0, W, H);
    for (i = 0; i < 9000; i++) { g.fillStyle = 'rgba(' + (Math.random() < 0.5 ? pal.s1 : pal.s2) + ',' + Math.random() * 0.06 + ')'; g.fillRect(Math.random() * W, Math.random() * H, 3, 3); }
    if (!POOH) {   // deck planks
      g.strokeStyle = 'rgba(0,0,0,.16)'; g.lineWidth = 3;
      for (i = 1; i < 12; i++) { g.beginPath(); g.moveTo(i * W / 12, 0); g.lineTo(i * W / 12, H); g.stroke(); }
    }
    var river = [[0.44, 1.0], [0.435, 0.8], [0.43, 0.6], [0.38, 0.44], [0.28, 0.33], [0.236, 0.2], [0.234, 0.0]];
    g.lineCap = 'round'; g.lineJoin = 'round';
    g.strokeStyle = pal.r1; g.lineWidth = 0.078 * sc; g.beginPath(); river.forEach(function (p, k) { k ? g.lineTo(X(p[0]), Y(p[1])) : g.moveTo(X(p[0]), Y(p[1])); }); g.stroke();
    g.strokeStyle = pal.r2; g.lineWidth = 0.05 * sc; g.stroke();
    g.strokeStyle = 'rgba(255,255,255,.75)'; g.lineWidth = 3;
    for (i = 0; i < 70; i++) {
      var k = Math.floor(Math.random() * (river.length - 1)), tt = Math.random(), rx = river[k][0] + (river[k + 1][0] - river[k][0]) * tt + (Math.random() - 0.5) * 0.04, ry = river[k][1] + (river[k + 1][1] - river[k][1]) * tt;
      g.beginPath(); g.moveTo(X(rx) - 12, Y(ry)); g.quadraticCurveTo(X(rx) - 4, Y(ry) - 8, X(rx) + 4, Y(ry)); g.quadraticCurveTo(X(rx) + 9, Y(ry) + 6, X(rx) + 14, Y(ry)); g.stroke();
    }
    if (POOH) {
      var hr = 26;
      for (var hx = -6; hx <= 6; hx++) for (var hy = -5; hy <= 5; hy++) {
        var cx = X(0.235) + hx * hr * 1.5, cy = Y(0.715) + (hy + (hx % 2 ? 0.5 : 0)) * hr * 1.732, dd = Math.hypot(cx - X(0.235), cy - Y(0.715));
        if (dd > 0.135 * sc) continue;
        g.beginPath(); for (i = 0; i < 6; i++) { var a = i * PI / 3; g.lineTo(cx + Math.cos(a) * hr * 0.92, cy + Math.sin(a) * hr * 0.92); } g.closePath();
        g.fillStyle = 'rgba(244,178,36,' + (0.75 - dd / (0.135 * sc) * 0.55) + ')'; g.fill(); g.strokeStyle = '#b97a12'; g.lineWidth = 3; g.stroke();
      }
      var tree = function (x, y, r) {
        g.fillStyle = '#6b4a2a'; g.fillRect(X(x) - r * 0.12, Y(y), r * 0.24, r * 0.9);
        [[0, 0, 1, '#4f7d33'], [-0.55, 0.25, 0.7, '#5f8f3d'], [0.55, 0.2, 0.75, '#447029'], [0.05, -0.5, 0.7, '#6a9a45']].forEach(function (b) {
          g.fillStyle = b[3]; g.beginPath(); g.arc(X(x) + b[0] * r, Y(y) + b[1] * r - r * 0.3, b[2] * r, 0, 7); g.fill();
        });
      };
      [[0.1, 0.845, 46], [0.2, 0.47, 40], [0.115, 0.52, 34], [0.15, 0.3, 30], [0.29, 0.5, 34], [0.33, 0.87, 30], [0.07, 0.4, 26], [0.25, 0.42, 26], [0.19, 0.57, 28]].forEach(function (t) { tree(t[0], t[1], t[2]); });
    } else {
      // steam ring under the whistles, life rings and musical notes
      g.fillStyle = 'rgba(255,255,255,.55)'; g.beginPath(); g.arc(X(0.235), Y(0.7), 0.13 * sc, 0, 7); g.fill();
      g.strokeStyle = '#1c1c1c'; g.lineWidth = 5; g.beginPath(); g.arc(X(0.235), Y(0.7), 0.13 * sc, 0, 7); g.stroke();
      [[0.11, 0.42], [0.3, 0.52], [0.16, 0.86], [0.33, 0.88]].forEach(function (p) {
        g.lineWidth = 16; g.strokeStyle = '#f4f4f4'; g.beginPath(); g.arc(X(p[0]), Y(p[1]), 34, 0, 7); g.stroke();
        g.lineWidth = 3; g.strokeStyle = '#1c1c1c'; g.beginPath(); g.arc(X(p[0]), Y(p[1]), 42, 0, 7); g.stroke(); g.beginPath(); g.arc(X(p[0]), Y(p[1]), 26, 0, 7); g.stroke();
      });
      g.fillStyle = '#1c1c1c';
      [[0.19, 0.5], [0.13, 0.31], [0.27, 0.44], [0.2, 0.57], [0.07, 0.38], [0.3, 0.36]].forEach(function (p, q) {
        g.beginPath(); g.ellipse(X(p[0]), Y(p[1]), 13, 9, -0.4, 0, 7); g.fill(); g.fillRect(X(p[0]) + 9, Y(p[1]) - 46, 4, 46); if (q % 2) g.fillRect(X(p[0]) + 9, Y(p[1]) - 46, 20, 7);
      });
    }
    g.setLineDash([10, 12]); g.strokeStyle = POOH ? 'rgba(90,60,30,.7)' : 'rgba(20,20,20,.6)'; g.lineWidth = 4;
    [[[0.2, 0.2], [0.11, 0.5], [0.07, 0.68]], [[0.26, 0.2], [0.36, 0.45], [0.432, 0.5]], [[0.234, 0.24], [0.235, 0.58]]].forEach(function (pth) {
      g.beginPath(); pth.forEach(function (p, k) { k ? g.lineTo(X(p[0]), Y(p[1])) : g.moveTo(X(p[0]), Y(p[1])); }); g.stroke();
    });
    g.setLineDash([]);
    var label = function (txt, x, y, px, rot, col, font) {
      g.save(); g.translate(X(x), Y(y)); g.rotate(rot || 0); g.font = px + 'px ' + (font || HAND); g.textAlign = 'center'; g.textBaseline = 'middle';
      g.lineWidth = 6; g.strokeStyle = pal.halo; g.strokeText(txt, 0, 0); g.fillStyle = col || pal.ink; g.fillText(txt, 0, 0); g.restore();
    };
    if (POOH) { label('100 AKER WOOD', 0.17, 0.375, 46, -0.12); label('BEES', 0.235, 0.862, 34, 0); label('THE STREAM', 0.33, 0.37, 34, 0.75, pal.inkR); label('WOOZLE TRACKS', 0.433, 0.4, 28, -PI / 2, pal.inkR); }
    else { label('THE BIG RIVER', 0.33, 0.37, 34, 0.75); label('COW ON BOARD', 0.235, 0.862, 30, 0); label('FULL STEAM', 0.433, 0.42, 30, -PI / 2); label('WHISTLES', 0.235, 0.57, 32, 0); }
    label(K.saucer, 0.125, 0.795, 34, 0.1);
    label(K.title, 0.234, 0.3, POOH ? 96 : 74, 0, pal.title, FONT); label(K.sub, 0.234, 0.258, 30, 0, pal.ink);
    g.fillStyle = pal.lane; g.fillRect(X(P.PW), 0, W - X(P.PW), H);
    g.fillStyle = pal.chev; for (i = 0; i < 9; i++) { var ly = Y(0.15 + i * 0.08); g.beginPath(); g.moveTo(X(0.489), ly - 16); g.lineTo(X(0.489) - 14, ly + 8); g.lineTo(X(0.489) + 14, ly + 8); g.closePath(); g.fill(); }
    g.fillStyle = '#120a06'; g.beginPath(); g.arc(X(P.SAUCER.x), Y(P.SAUCER.y), 0.015 * sc, 0, 7); g.fill();
  });
  var field = put(new T.Mesh(geo(new T.PlaneGeometry(TW, TH)), std({ map: fieldTex, roughness: 0.32, metalness: 0.05 })), TW / 2, TH / 2, 0);
  field.receiveShadow = true;

  // ---------------- walls, posts, cabinet
  var M = {
    rail: std({ color: 0x17130f, roughness: 0.45, metalness: 0.3 }), guide: std({ color: 0xcfd3d8, roughness: 0.25, metalness: 0.9 }),
    slingbody: std({ color: K.c.slingbody, roughness: 0.5 }), sling: std({ color: 0xf4f1e8, roughness: 0.7 }), block: std({ color: K.c.block, roughness: 0.6 }),
    gate: std({ color: 0xcfd3d8, roughness: 0.3, metalness: 0.9 }), rubberwall: std({ color: 0xf4f1e8, roughness: 0.7 }),
    rubber: std({ color: 0xf4f1e8, roughness: 0.7 }), cab: std({ color: K.c.cab, roughness: 0.5 }), wood: std({ color: 0x5a3a1e, roughness: 0.6 }),
    brass: std({ color: 0xd9a441, roughness: 0.3, metalness: 0.85 }), black: std({ color: 0x0e0e10, roughness: 0.6 })
  };
  var HGT = { rail: 0.03, guide: 0.02, slingbody: 0.018, sling: 0.016, block: 0.024, gate: 0.012, rubberwall: 0.02 };
  var box = function (w, h, d, m, x, y, z, parent) { var me = new T.Mesh(geo(new T.BoxGeometry(w, h, d)), m); me.castShadow = true; me.receiveShadow = true; return put(me, x, y, z, parent); };
  P.segs.forEach(function (s) {
    if (s.kind === 'target') return;
    var h = HGT[s.kind] || 0.02, w = s.kind === 'rail' ? 0.012 : 2 * s.r + 0.001;
    var me = box(s.len + (s.kind === 'rail' ? 0.004 : 0), w, h, M[s.kind] || M.rail, (s.ax + s.bx) / 2, (s.ay + s.by) / 2, h / 2);
    me.rotation.z = Math.atan2(s.dy, s.dx); if (s.kind !== 'sling') me.userData.still = true;
  });
  P.circs.forEach(function (c) {
    if (c.kind === 'bumper') return;
    var me = upright(new T.Mesh(geo(new T.CylinderGeometry(c.r, c.r, 0.022, 16)), M.rubber)); me.castShadow = true; put(me, c.x, c.y, 0.011).userData.still = true;
    put(upright(new T.Mesh(geo(new T.CylinderGeometry(c.r * 0.7, c.r * 0.7, 0.004, 12)), M.brass)), c.x, c.y, 0.024).userData.still = true;
  });
  // plastics over the slingshots and the target bank
  function plastic(pts, color, z) {
    var sh = new T.Shape(); pts.forEach(function (p, i) { i ? sh.lineTo(p[0], p[1]) : sh.moveTo(p[0], p[1]); });
    var me = new T.Mesh(geo(new T.ShapeGeometry(sh)), std({ color: color, roughness: 0.35, side: T.DoubleSide })); me.castShadow = true; return put(me, 0, 0, z);
  }
  plastic([[0.080, 0.205], [0.080, 0.325], [0.132, 0.187]], K.c.pl, 0.019);
  plastic([[P.PW - 0.080, 0.205], [P.PW - 0.080, 0.325], [P.PW - 0.132, 0.187]], K.c.pr, 0.019);
  plastic([[0, 0.45], [0.045, 0.49], [0.045, 0.69], [0.062, 0.73], [0.032, 0.712], [0, 0.735]], K.c.bank, 0.025);
  // cabinet body, side rails, apron, legs
  [box(TW + 0.06, 0.03, 0.34, M.cab, TW / 2, -0.065, -0.14), box(TW + 0.06, 0.04, 0.34, M.cab, TW / 2, TH + 0.02, -0.14),
    box(0.03, TH + 0.12, 0.34, M.cab, -0.015 - 0.006, TH / 2 - 0.02, -0.14), box(0.03, TH + 0.12, 0.34, M.cab, TW + 0.015 + 0.006, TH / 2 - 0.02, -0.14),
    box(TW + 0.06, TH + 0.12, 0.02, M.black, TW / 2, TH / 2 - 0.02, -0.3),
    box(0.022, TH + 0.1, 0.03, M.guide, -0.017, TH / 2 - 0.02, 0.04), box(0.022, TH + 0.1, 0.03, M.guide, TW + 0.017, TH / 2 - 0.02, 0.04)
  ].concat([[-1, -1], [1, -1], [-1, 1], [1, 1]].map(function (c) { return box(0.05, 0.05, 0.62, M.guide, TW / 2 + c[0] * (TW / 2 + 0.02), TH / 2 + c[1] * (TH / 2 + 0.02), -0.6); })).forEach(function (me) { me.userData.still = true; });
  var apronTex = canvasTex(1024, 256, function (g, W, H) {
    g.fillStyle = K.c.apron; g.fillRect(0, 0, W, H); g.fillStyle = K.c.apronLine; g.fillRect(0, 0, W, 10);
    g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillStyle = K.c.apronTitle; g.font = '72px ' + FONT; g.fillText(K.title, W * 0.43, 86);
    g.font = '30px ' + HAND; g.fillStyle = '#fff';
    g.fillText(K.rules, W * 0.43, 160);
    g.fillText(K.lanes + ' lanes raise the bonus  ·  3 balls', W * 0.43, 205);
  });
  var apron = put(new T.Mesh(geo(new T.PlaneGeometry(P.PW, 0.13)), std({ map: apronTex, roughness: 0.5 })), P.PW / 2, 0.012, 0.032); apron.rotation.x = 0.08;
  box(P.PW, 0.004, 0.034, M.black, P.PW / 2, 0.079, 0.016);

  // ---------------- inserts (playfield lights)
  function letterTex(ch) {
    return canvasTex(64, 64, function (g) {
      g.fillStyle = '#fff'; g.beginPath(); g.arc(32, 32, 30, 0, 7); g.fill();
      g.fillStyle = '#000'; g.font = (ch.length > 1 ? 24 : 40) + 'px ' + FONT; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(ch, 32, 35);
    });
  }
  var texts = [];
  function insert(ch, x, y, r, color) {
    var tx = letterTex(ch); texts.push(tx);
    var m = basic({ map: tx, color: 0x222222, transparent: true, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2 });
    var me = put(new T.Mesh(geo(new T.CircleGeometry(r, 24)), m), x, y, 0.0012);
    return { m: m, on: new T.Color(color), off: new T.Color(color).multiplyScalar(0.16), lit: -1, mesh: me };
  }
  function setLit(ins, v) { if (ins.lit === v) return; ins.lit = v; ins.m.color.copy(v ? ins.on : ins.off); }
  var I = {
    hunny: K.bank0.split('').map(function (c, i) { return insert(c, 0.078, 0.51 + i * 0.04, 0.014, K.c.i0); }),
    willie: K.bank1.split('').map(function (c, i) { return insert(c, 0.368, 0.57 + i * 0.04, 0.014, K.c.i1); }),
    bee: K.lanes.split('').map(function (c, i) { return insert(c, P.LANES[i], 0.915, 0.016, K.c.il); }),
    mult: ['2X', '3X', '4X', '5X'].map(function (c, i) { return insert(c, 0.183 + i * 0.034, 0.215, 0.013, 0x7dff6a); }),
    save: insert('SAVE', 0.234, 0.07, 0.017, 0xff5a3c), mb: insert('MB', 0.105, 0.735, 0.017, 0xff3fa4),
    frenzy: insert('10X', 0.235, POOH ? 0.72 : 0.7, 0.016, K.c.fx), steam: insert('10X', 0.434, 0.47, 0.014, 0x9fe6ff)
  };

  // ---------------- standup targets
  var targets = [[], []];
  P.segs.forEach(function (s) {
    if (s.kind !== 'target') return;
    var dir = s.bank ? -1 : 1, m = std({ color: s.bank ? K.c.t1 : K.c.t0, roughness: 0.4, emissive: s.bank ? K.c.e1 : K.c.e0, emissiveIntensity: 0 });
    var me = box(0.006, 0.03, 0.03, m, s.ax + dir * 0.001, (s.ay + s.by) / 2, 0.016);
    targets[s.bank][s.i] = { mesh: me, m: m, x0: me.position.x, dir: dir, kick: 0 };
  });
  box(0.045, 0.2, 0.024, M.block, 0.0215, 0.59, 0.012); box(0.012, 0.24, 0.02, M.wood, 0.407, 0.67, 0.01);

  // ---------------- honey-pot pop bumpers
  var V2 = function (x, y) { return new T.Vector2(x, y); };
  var potTex = canvasTex(256, 64, function (g, W, H) {
    g.fillStyle = '#c98a3c'; g.fillRect(0, 0, W, H); g.fillStyle = '#f6e3b0'; g.fillRect(8, 14, 112, 38); g.fillRect(136, 14, 112, 38);
    g.fillStyle = '#3a2410'; g.font = '30px ' + HAND; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('HUNNY', 64, 34); g.fillText('HUNNY', 192, 34);
  });
  var potGeo = geo(new T.LatheGeometry([V2(0.0, 0), V2(0.024, 0), V2(0.031, 0.012), V2(0.033, 0.028), V2(0.029, 0.042), V2(0.022, 0.048), V2(0.025, 0.054), V2(0.021, 0.058), V2(0, 0.058)], 28));
  // MICKEY: the steamboat's three whistles
  var whistleGeo = geo(new T.LatheGeometry([V2(0, 0), V2(0.027, 0), V2(0.027, 0.008), V2(0.017, 0.013), V2(0.017, 0.05), V2(0.022, 0.054), V2(0.022, 0.058), V2(0.013, 0.062), V2(0.013, 0.07), V2(0.008, 0.078), V2(0, 0.08)], 24));
  var bumpers = P.BUMP.map(function (c) {
    var m = POOH ? std({ map: potTex, roughness: 0.45, emissive: 0xffa000, emissiveIntensity: 0 }) : std({ color: 0xc9c9c9, roughness: 0.3, metalness: 0.75, emissive: 0xffffff, emissiveIntensity: 0 });
    var g2 = new T.Group(); put(g2, c.x, c.y, 0);
    var pot = upright(new T.Mesh(POOH ? potGeo : whistleGeo, m)); pot.castShadow = true; g2.add(pot);
    var hm = basic({ color: K.c.fx }); var honey = upright(new T.Mesh(geo(new T.CylinderGeometry(POOH ? 0.019 : 0.011, POOH ? 0.019 : 0.011, 0.004, 20)), hm)); honey.position.z = POOH ? 0.058 : 0.071; g2.add(honey);
    var ring = upright(new T.Mesh(geo(new T.CylinderGeometry(0.036, 0.036, 0.004, 28)), M.rubber)); ring.position.z = 0.004; g2.add(ring);
    var light = null; if (opt.lights) { light = new T.PointLight(K.c.fx, 0, 0.5); light.position.z = 0.09; g2.add(light); }
    return { g: g2, m: m, hm: hm, flash: 0, light: light };
  });

  // ---------------- flippers
  function flipperGeo(len, r0, r1) {
    var sh = new T.Shape(); sh.moveTo(0, r0); sh.lineTo(len, r1); sh.absarc(len, 0, r1, PI / 2, -PI / 2, true); sh.lineTo(0, -r0); sh.absarc(0, 0, r0, -PI / 2, PI / 2, true);
    return geo(new T.ExtrudeGeometry(sh, { depth: 0.016, bevelEnabled: false, curveSegments: 10 }));
  }
  var flMat = std({ color: 0xf5f1e6, roughness: 0.35 }), flRub = std({ color: K.c.flRub, roughness: 0.6 });
  var flippers = S.fl.map(function (f) {
    var g2 = new T.Group(); put(g2, f.px, f.py, 0.003);
    var rub = new T.Mesh(flipperGeo(f.len, f.r0, f.r1), flRub); rub.scale.z = 0.6; rub.castShadow = true; g2.add(rub);
    var top = new T.Mesh(flipperGeo(f.len - 0.002, f.r0 - 0.0025, f.r1 - 0.002), flMat); top.position.z = 0.009; top.scale.z = 0.5; g2.add(top);
    g2.add(upright(new T.Mesh(geo(new T.CylinderGeometry(0.005, 0.005, 0.02, 12)), M.brass))).position.z = 0.012;
    return g2;
  });

  // ---------------- ship's-wheel spinner, plunger
  var wheelMat = std({ color: POOH ? 0x6a4424 : 0x2e2e2e, roughness: 0.5 });
  function shipWheel(R, mtl) {
    var g2 = new T.Group(); g2.add(new T.Mesh(geo(new T.TorusGeometry(R, R * 0.11, 8, 28)), mtl));
    for (var i = 0; i < 4; i++) { var sp = new T.Mesh(geo(new T.CylinderGeometry(R * 0.07, R * 0.07, R * 2.6, 6)), mtl); sp.rotation.z = i * PI / 4; g2.add(sp); }
    g2.add(new T.Mesh(geo(new T.SphereGeometry(R * 0.22, 10, 8)), M.brass)); return g2;
  }
  var spinner = new T.Group(); put(spinner, (P.SPIN.x0 + P.SPIN.x1) / 2, P.SPIN.y, 0.03);
  var wheel = shipWheel(0.021, wheelMat); wheel.rotation.x = PI / 2; spinner.add(wheel);
  box(0.004, 0.004, 0.05, M.guide, P.SPIN.x0 + 0.002, P.SPIN.y, 0.025); box(0.004, 0.004, 0.05, M.guide, P.SPIN.x1 - 0.004, P.SPIN.y, 0.025);
  var plunger = box(0.02, 0.07, 0.02, M.guide, 0.489, -0.012, 0.012), knob = box(0.03, 0.02, 0.03, M.black, 0.489, -0.06, 0.012);

  // ---------------- honey tree with bees (over the saucer)
  var bees = [];
  if (POOH) {
  var leaf = std({ color: 0x4f7d33, roughness: 0.8, flatShading: true }), leaf2 = std({ color: 0x6a9a45, roughness: 0.8, flatShading: true });
  put(upright(new T.Mesh(geo(new T.CylinderGeometry(0.011, 0.016, 0.11, 8)), M.wood)), 0.018, 0.67, 0.08).castShadow = true;
  [[0.018, 0.67, 0.15, 0.04, leaf], [0.04, 0.655, 0.135, 0.028, leaf2], [0.004, 0.69, 0.14, 0.03, leaf2], [0.022, 0.64, 0.165, 0.026, leaf]].forEach(function (b) {
    put(new T.Mesh(geo(new T.IcosahedronGeometry(b[3], 1)), b[4]), b[0], b[1], b[2]).castShadow = true;
  });
  put(new T.Mesh(geo(new T.SphereGeometry(0.013, 10, 8)), std({ color: 0xd9a21b, roughness: 0.6 })), 0.04, 0.7, 0.105).scale.z = 1.3;
  var beeMat = basic({ color: 0xffd21a });
  for (var bi = 0; bi < 9; bi++) bees.push({ m: put(new T.Mesh(geo(new T.SphereGeometry(0.0035, 6, 5)), beeMat), 0, 0, 0), ph: Math.random() * 6.3, r: 0.02 + Math.random() * 0.03, sp: 2 + Math.random() * 3, h: Math.random() });

  } else {
    // crates and a sack of potatoes by the potato bin
    var crate = std({ color: 0x6f6f6f, roughness: 0.8 });
    box(0.036, 0.036, 0.036, crate, 0.02, 0.665, 0.043).rotation.z = 0.2; box(0.03, 0.03, 0.03, crate, 0.024, 0.66, 0.076).rotation.z = -0.3;
    var sack = put(new T.Mesh(geo(new T.SphereGeometry(0.017, 12, 10)), std({ color: 0xd8d8d8, roughness: 0.9 })), 0.02, 0.705, 0.042); sack.scale.z = 1.25; sack.castShadow = true;
  }

  // ---------------- the bear (after E. H. Shepard's 1926 drawings: a plain teddy bear, no shirt)
  function ball3(r, color, x, y, z, sx, sy, sz, parent, m) {
    var me = new T.Mesh(geo(new T.SphereGeometry(r, 18, 14)), m || std({ color: color, roughness: 0.75 }));
    me.position.set(x, y, z); me.scale.set(sx || 1, sy || 1, sz || 1); me.castShadow = true; parent.add(me); return me;
  }
  function makeBear() {
    var g2 = new T.Group(), fur = std({ color: 0xc79a55, roughness: 0.9 }), pale = std({ color: 0xe6cc96, roughness: 0.9 }), blk = std({ color: 0x1a1208, roughness: 0.5 });
    ball3(0.30, 0, 0, 0.32, 0, 1, 1.08, 0.95, g2, fur); var head = ball3(0.22, 0, 0, 0.74, 0.03, 1, 0.95, 0.95, g2, fur);
    ball3(0.07, 0, -0.16, 0.91, 0, 1, 1, 0.6, g2, fur); ball3(0.07, 0, 0.16, 0.91, 0, 1, 1, 0.6, g2, fur);
    ball3(0.095, 0, 0, 0.69, 0.19, 1.1, 0.85, 1, g2, pale); ball3(0.03, 0, 0, 0.72, 0.28, 1.2, 0.9, 1, g2, blk);
    ball3(0.017, 0, -0.075, 0.79, 0.2, 1, 1, 1, g2, blk); ball3(0.017, 0, 0.075, 0.79, 0.2, 1, 1, 1, g2, blk);
    var la = ball3(0.085, 0, -0.26, 0.42, 0.14, 1, 1.9, 1, g2, fur); la.rotation.set(-0.9, 0, -0.5); var ra = ball3(0.085, 0, 0.26, 0.42, 0.14, 1, 1.9, 1, g2, fur); ra.rotation.set(-0.9, 0, 0.5);
    ball3(0.11, 0, -0.18, 0.1, 0.22, 1, 1, 1.5, g2, fur); ball3(0.11, 0, 0.18, 0.1, 0.22, 1, 1, 1.5, g2, fur);
    var pot = new T.Mesh(potGeo, std({ map: potTex, roughness: 0.5 })); pot.scale.setScalar(3.6); pot.position.set(0, 0.12, 0.34); pot.castShadow = true; g2.add(pot);
    var honey = new T.Mesh(geo(new T.CylinderGeometry(0.07, 0.07, 0.012, 16)), basic({ color: 0xffb81f })); honey.position.set(0, 0.33, 0.34); g2.add(honey);
    g2.userData.head = head; return g2;
  }
  // ---------------- the mouse (the 1928 black-and-white design: no gloves, no colour) at the wheel of his steamboat
  function makeMouse() {
    var g2 = new T.Group(), blk = std({ color: 0x0c0c0c, roughness: 0.55 }), wht = std({ color: 0xf1f1f1, roughness: 0.7 }), gry = std({ color: 0xcfcfcf, roughness: 0.7 }), dk = std({ color: 0x3a3a3a, roughness: 0.6 });
    var cyl = function (r, h, m, x, y, z, rx, rz) { var me = new T.Mesh(geo(new T.CylinderGeometry(r, r, h, 8)), m); me.position.set(x, y, z); me.rotation.set(rx || 0, 0, rz || 0); me.castShadow = true; g2.add(me); return me; };
    cyl(0.024, 0.26, blk, -0.08, 0.2, 0); cyl(0.024, 0.26, blk, 0.08, 0.2, 0);
    ball3(0.09, 0, -0.09, 0.06, 0.05, 1.1, 0.7, 1.6, g2, gry); ball3(0.09, 0, 0.09, 0.06, 0.05, 1.1, 0.7, 1.6, g2, gry);
    ball3(0.17, 0, 0, 0.38, 0, 1, 0.85, 1, g2, wht); ball3(0.024, 0, -0.06, 0.42, 0.155, 1, 1, 0.6, g2, blk); ball3(0.024, 0, 0.06, 0.42, 0.155, 1, 1, 0.6, g2, blk);
    ball3(0.14, 0, 0, 0.53, 0, 1, 1.15, 1, g2, blk);
    cyl(0.02, 0.26, blk, -0.17, 0.56, 0.12, 1.25, 0.25); cyl(0.02, 0.26, blk, 0.17, 0.56, 0.12, 1.25, -0.25);
    ball3(0.045, 0, -0.2, 0.6, 0.25, 1, 1, 1, g2, blk); ball3(0.045, 0, 0.2, 0.6, 0.25, 1, 1, 1, g2, blk);
    var head = new T.Group(); head.position.set(0, 0.83, 0); g2.add(head);
    ball3(0.2, 0, 0, 0, 0, 1, 1, 1, head, blk);
    ball3(0.13, 0, -0.2, 0.2, -0.02, 1, 1, 0.25, head, blk); ball3(0.13, 0, 0.2, 0.2, -0.02, 1, 1, 0.25, head, blk);
    ball3(0.165, 0, 0, -0.03, 0.07, 0.95, 0.9, 0.85, head, wht); ball3(0.08, 0, 0, -0.07, 0.23, 1.1, 0.8, 1.3, head, wht);
    ball3(0.04, 0, 0, -0.05, 0.34, 1, 0.9, 1, head, blk);
    ball3(0.035, 0, -0.06, 0.05, 0.195, 0.7, 1.5, 0.4, head, blk); ball3(0.035, 0, 0.06, 0.05, 0.195, 0.7, 1.5, 0.4, head, blk);
    cyl(0.01, 0.3, blk, 0.1, 0.34, -0.2, -1.0, 0);
    var wh = shipWheel(0.17, dk); wh.position.set(0, 0.56, 0.36); g2.add(wh); cyl(0.03, 0.56, dk, 0, 0.28, 0.4);
    // steamboat
    var hull = new T.Mesh(geo(new T.BoxGeometry(1.1, 0.16, 1.0)), wht); hull.position.set(0, -0.08, 0); hull.castShadow = true; g2.add(hull);
    var keel = new T.Mesh(geo(new T.BoxGeometry(1.14, 0.08, 1.04)), blk); keel.position.set(0, -0.2, 0); g2.add(keel);
    var cabin = new T.Mesh(geo(new T.BoxGeometry(0.9, 0.5, 0.3)), gry); cabin.position.set(0, 0.25, -0.33); cabin.castShadow = true; g2.add(cabin);
    cyl(0.07, 0.75, blk, -0.25, 0.85, -0.33); cyl(0.07, 0.75, blk, 0.25, 0.85, -0.33); cyl(0.085, 0.06, dk, -0.25, 1.22, -0.33); cyl(0.085, 0.06, dk, 0.25, 1.22, -0.33);
    var smoke = []; var sm = std({ color: 0xbdbdbd, roughness: 1, transparent: true, opacity: 0.8 });
    for (var i = 0; i < 8; i++) smoke.push({ m: ball3(0.09, 0, 0, 0, 0, 1, 1, 1, g2, sm), side: i % 2 ? 1 : -1, ph: i / 8 });
    g2.userData = { head: head, wheel: wh, smoke: smoke }; return g2;
  }
  var bear = null, mouse = null, balloon = null;
  if (POOH) {
    bear = makeBear(); bear.scale.setScalar(0.105); bear.rotation.x = PI / 2; bear.rotation.y = 0.35; put(bear, 0.04, 1.03, 0.03);
    box(0.11, 0.1, 0.004, M.block, 0.04, 1.03, 0.03); box(0.11, 0.1, 0.004, M.block, TW - 0.05, 1.025, 0.03);
    // the blue balloon from chapter one
    balloon = new T.Group(); put(balloon, TW - 0.05, 1.03, 0.13);
    var bl = new T.Mesh(geo(new T.SphereGeometry(0.03, 20, 16)), std({ color: 0x3f7fd0, roughness: 0.25 })); bl.scale.z = 1.2; bl.castShadow = true; balloon.add(bl);
    balloon.add(upright(new T.Mesh(geo(new T.CylinderGeometry(0.0006, 0.0006, 0.1, 4)), M.black))).position.z = -0.085;
  } else {
    mouse = makeMouse(); mouse.scale.setScalar(0.085); mouse.rotation.x = PI / 2; mouse.rotation.y = -0.3; put(mouse, TW - 0.05, 1.025, 0.05);
    box(0.11, 0.1, 0.004, std({ color: 0x8a8a8a, roughness: 0.4 }), 0.04, 1.03, 0.03); box(0.11, 0.1, 0.004, std({ color: 0x8a8a8a, roughness: 0.4 }), TW - 0.05, 1.025, 0.03);
    var lr = new T.Mesh(geo(new T.TorusGeometry(0.03, 0.009, 10, 24)), std({ color: 0xf2f2f2, roughness: 0.6 })); lr.rotation.x = PI / 2; lr.rotation.y = 0.4; lr.castShadow = true; put(lr, 0.042, 1.03, 0.075);
  }

  // ---------------- backbox: art and dot-matrix display
  var artTex = canvasTex(1024, 640, function (g, W, H) {
    var sky = g.createLinearGradient(0, 0, 0, H);
    if (POOH) { sky.addColorStop(0, '#1b2d5a'); sky.addColorStop(0.6, '#3d5a8c'); sky.addColorStop(1, '#efdfb4'); }
    else { sky.addColorStop(0, '#0d0d0d'); sky.addColorStop(0.6, '#5a5a5a'); sky.addColorStop(1, '#d8d8d8'); }
    g.fillStyle = sky; g.fillRect(0, 0, W, H);
    if (opt.backglassImage) {   // the original public-domain artwork, shown as supplied
      try { var im = opt.backglassImage, iw = im.naturalWidth || im.width, ih = im.naturalHeight || im.height, k = Math.min(W / iw, (H - 150) / ih); g.drawImage(im, (W - iw * k) / 2, 150 + (H - 150 - ih * k) / 2, iw * k, ih * k); } catch (e) {}
    } else if (POOH) {
      g.fillStyle = '#ffe9a8'; g.beginPath(); g.arc(820, 300, 60, 0, 7); g.fill();
      g.fillStyle = '#35602a'; g.beginPath(); g.moveTo(0, H); g.lineTo(0, 470); g.quadraticCurveTo(360, 380, W, 500); g.lineTo(W, H); g.fill();
    } else {
      g.fillStyle = '#efefef'; g.beginPath(); g.arc(820, 300, 60, 0, 7); g.fill();
      g.fillStyle = '#8a8a8a'; g.fillRect(0, 500, W, 140); g.strokeStyle = '#fff'; g.lineWidth = 4;
      for (var i = 0; i < 26; i++) { var wx = (i * 97) % W, wy = 520 + (i * 53) % 100; g.beginPath(); g.moveTo(wx, wy); g.quadraticCurveTo(wx + 14, wy - 12, wx + 28, wy); g.stroke(); }
    }
    g.textAlign = 'center'; g.textBaseline = 'middle';
    g.font = '170px ' + FONT; g.fillStyle = POOH ? '#7a3d06' : '#000'; g.fillText(K.title, W / 2 + 7, 110); g.fillStyle = POOH ? '#ffc21a' : '#f4f4f4'; g.fillText(K.title, W / 2, 102);
    g.font = '40px ' + HAND; g.fillStyle = '#fff'; g.fillText(K.sub, W / 2, 215);
  });
  var back = put(new T.Mesh(geo(new T.PlaneGeometry(0.6, 0.375)), basic({ map: artTex })), TW / 2, TH + 0.045, 0.24); back.rotation.x = PI / 2;
  box(0.64, 0.06, 0.47, M.cab, TW / 2, TH + 0.078, 0.2);
  var dmdSrc = document.createElement('canvas'); dmdSrc.width = 128; dmdSrc.height = 24; var dmdG = dmdSrc.getContext('2d');
  var dmdLines = [K.title + ' PINBALL', 'PRESS START'];
  var dmdTex = canvasTex(768, 144, function (g, W, H) {
    g.fillStyle = '#120600'; g.fillRect(0, 0, W, H);
    dmdG.fillStyle = '#000'; dmdG.fillRect(0, 0, 128, 24); dmdG.fillStyle = '#fff'; dmdG.textBaseline = 'middle'; dmdG.textAlign = 'center';
    dmdG.font = 'bold 11px monospace'; dmdG.fillText(dmdLines[0], 64, 6.5); dmdG.fillText(dmdLines[1], 64, 18);
    var px = null; try { px = dmdG.getImageData(0, 0, 128, 24).data; } catch (e) {}
    for (var y = 0; y < 24; y++) for (var x = 0; x < 128; x++) {
      var on = px && px[(y * 128 + x) * 4] > 110;
      g.fillStyle = on ? '#ff9a1f' : '#2b1200'; g.beginPath(); g.arc(x * 6 + 3, y * 6 + 3, 2.4, 0, 7); g.fill();
    }
  });
  put(new T.Mesh(geo(new T.PlaneGeometry(0.3, 0.05625)), basic({ map: dmdTex })), TW / 2, TH + 0.043, 0.09).rotation.x = PI / 2;
  var dmdDirty = false, dmdHold = 0, dmdClock = 0;
  function fmt(n) { return String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ','); }
  function dmd(a, b, hold) { dmdLines[0] = a; dmdLines[1] = b; dmdDirty = true; dmdHold = hold || 0; }
  function say(text, big, sub) { dmd(text, sub || fmt(S.score), 2.2); emit('message', { text: text, big: !!big }); }

  // ---------------- balls
  var envTex = canvasTex(256, 128, function (g, W, H) {
    var gr = g.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, '#20263a'); gr.addColorStop(0.45, '#9aa6c4'); gr.addColorStop(0.55, '#e9d7a8'); gr.addColorStop(1, '#3a2a1a');
    g.fillStyle = gr; g.fillRect(0, 0, W, H); g.fillStyle = '#fff'; g.fillRect(40, 18, 46, 14); g.fillRect(150, 26, 60, 10); g.fillStyle = '#ffb81f'; g.fillRect(100, 70, 30, 8);
  });
  envTex.mapping = T.EquirectangularReflectionMapping;
  var ballMat = std({ color: 0xe6e8ee, metalness: 0.95, roughness: 0.16, envMap: envTex, envMapIntensity: 1.2 });
  var ballGeo = geo(new T.SphereGeometry(P.BR, 28, 20)), balls = [];
  for (var k = 0; k < 4; k++) { var bm = put(new T.Mesh(ballGeo, ballMat), 0, 0, P.BR); bm.castShadow = true; bm.visible = false; balls.push(bm); }

  // ---------------- particles (honey drops, steam, sparks)
  var dotTex = canvasTex(64, 64, function (g) {
    var r = g.createRadialGradient(32, 32, 0, 32, 32, 32); r.addColorStop(0, 'rgba(255,255,255,1)'); r.addColorStop(0.4, 'rgba(255,255,255,.5)'); r.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = r; g.fillRect(0, 0, 64, 64);
  });
  var PN = 360, pPos = new Float32Array(PN * 3), pCol = new Float32Array(PN * 3), pVel = new Float32Array(PN * 3), pLife = new Float32Array(PN), pBase = new Float32Array(PN * 3), pNext = 0;
  for (var pi = 0; pi < PN; pi++) pPos[pi * 3 + 2] = -9;
  var pGeo = geo(new T.BufferGeometry());
  pGeo.setAttribute('position', new T.BufferAttribute(pPos, 3)); pGeo.setAttribute('color', new T.BufferAttribute(pCol, 3));
  var parts = new T.Points(pGeo, mat(new T.PointsMaterial({ size: 0.014, map: dotTex, vertexColors: true, transparent: true, blending: T.AdditiveBlending, depthWrite: false })));
  parts.frustumCulled = false; tbl.add(parts);
  var tmpC = new T.Color();
  function burst(x, y, z, hex, n, power) {
    tmpC.setHex(hex);
    for (var i = 0; i < n; i++) {
      var q = pNext; pNext = (pNext + 1) % PN;
      pPos[q * 3] = x; pPos[q * 3 + 1] = y; pPos[q * 3 + 2] = z;
      var a = Math.random() * 6.283, e = Math.random() * 1.3, sp = power * (0.3 + Math.random() * 0.9);
      pVel[q * 3] = Math.cos(a) * Math.cos(e) * sp; pVel[q * 3 + 1] = Math.sin(a) * Math.cos(e) * sp; pVel[q * 3 + 2] = Math.sin(e) * sp;
      var w = Math.random() * 0.5; pBase[q * 3] = tmpC.r + (1 - tmpC.r) * w; pBase[q * 3 + 1] = tmpC.g + (1 - tmpC.g) * w; pBase[q * 3 + 2] = tmpC.b + (1 - tmpC.b) * w;
      pLife[q] = 0.4 + Math.random() * 0.6;
    }
  }
  function updateParticles(dt) {
    for (var q = 0; q < PN; q++) {
      if (pLife[q] <= 0) continue;
      pLife[q] -= dt; if (pLife[q] <= 0) { pPos[q * 3 + 2] = -9; continue; }
      pVel[q * 3 + 2] -= 1.6 * dt;
      pPos[q * 3] += pVel[q * 3] * dt; pPos[q * 3 + 1] += pVel[q * 3 + 1] * dt; pPos[q * 3 + 2] += pVel[q * 3 + 2] * dt;
      var f = Math.min(1, pLife[q] * 3); pCol[q * 3] = pBase[q * 3] * f; pCol[q * 3 + 1] = pBase[q * 3 + 1] * f; pCol[q * 3 + 2] = pBase[q * 3 + 2] * f;
    }
    pGeo.attributes.position.needsUpdate = true; pGeo.attributes.color.needsUpdate = true;
  }

  // ---------------- game loop
  var STEP = 1 / 1200, acc = 0, ev = [], time = 0, between = 0, lastScore = -1, slingFlash = [0, 0], spinLast = 0, whistle = 0;
  function snd(name, strength) { emit('sound', { name: name, strength: strength || 1 }); }
  function handle(e) {
    var b;
    switch (e.k) {
      case 'bumper': b = bumpers[e.i]; b.flash = 1; burst(P.BUMP[e.i].x, P.BUMP[e.i].y, POOH ? 0.05 : 0.08, K.c.fx, S.frenzy > 0 ? 16 : 7, 0.5); snd('bumper', e.s); break;
      case 'sling': slingFlash[e.side] = 1; snd('sling', e.s); break;
      case 'target': b = targets[e.bank][e.i]; b.kick = 1; snd(e.lit ? 'target' : 'thud', 1); break;
      case 'bank':
        if (e.bank) { say(K.mode1, true, K.mode1sub); whistle = 2.5; snd(POOH ? 'frenzy' : 'whistle'); }
        else { say(K.mode0, true, K.mode0sub); snd(POOH ? 'frenzy' : 'whistle'); burst(0.235, 0.7, 0.06, K.c.fx, 90, 0.9); }
        break;
      case 'mbready': say(K.lit, true, 'SHOOT FOR MULTIBALL'); break;
      case 'lane': snd('lane'); break;
      case 'mult': say(K.lanes + ' LANES ' + e.mult + 'X', false); snd('mult'); break;
      case 'spinhit': snd('spin', e.s); break;
      case 'saucer': say(K.saucer, false, '2,500'); snd('saucer'); burst(P.SAUCER.x, P.SAUCER.y, 0.03, K.c.fx, 20, 0.5); break;
      case 'multiball': say(K.mb, true, 'ALL SCORES DOUBLE'); snd('multiball'); burst(P.SAUCER.x, P.SAUCER.y, 0.05, 0xff3fa4, 120, 1.2); break;
      case 'jackpot': say('JACKPOT', true, '50,000'); snd('jackpot'); burst(P.SAUCER.x, P.SAUCER.y, 0.05, 0xffe14a, 140, 1.3); break;
      case 'kick': snd('kick'); break;
      case 'launch': snd('launch', e.s); break;
      case 'flipper': snd('flipper'); break;
      case 'flip': snd('ballflip', e.s); break;
      case 'wall': case 'rubber': snd('wall', e.s); break;
      case 'ballhit': snd('ballhit', e.s); break;
      case 'saved': say('BALL SAVED', false); snd('saved'); break;
      case 'drain': snd('drain'); break;
      case 'mbend': say('MULTIBALL OVER', false); break;
      case 'ballend': between = 2.6; say('BONUS ' + fmt(e.bonus), false, e.mult + 'X MULTIPLIER'); emit('ballend', e); break;
      case 'ready': dmd(K.who + '  BALL ' + e.ball, fmt(S.score)); emit('ready', e); break;
      case 'gameover': dmd('GAME OVER', fmt(S.score)); snd('gameover'); emit('gameover', e); break;
    }
  }
  function start() { ev.length = 0; P.startGame(S, ev); lastScore = -1; between = 0; ev.forEach(handle); snd('start'); }
  function update(dt) {
    dt = Math.min(dt, 0.04); time += dt;
    var i, e;
    if (S.phase === 'between') { between -= dt; if (between <= 0) { ev.length = 0; P.nextBall(S, ev); ev.forEach(handle); } }
    acc += dt; ev.length = 0;
    while (acc >= STEP) { P.step(S, STEP, ev); acc -= STEP; }
    for (i = 0; i < ev.length; i++) handle(ev[i]);
    // spinner score: one award per half turn
    var half = Math.floor(S.spin.ang / PI);
    if (half !== spinLast) { var n = Math.min(6, Math.abs(half - spinLast)); spinLast = half; if (S.phase === 'play') { S.score += n * (S.steam > 0 ? 1000 : 100) * (S.multiball ? 2 : 1); snd('spintick'); } }
    if (S.score !== lastScore) { lastScore = S.score; emit('score', { score: S.score, ball: S.ball, mult: S.mult }); if (dmdHold <= 0) dmd(S.phase === 'over' ? 'GAME OVER' : 'BALL ' + S.ball + '   ' + S.mult + 'X', fmt(S.score)); }
    if (dmdHold > 0) { dmdHold -= dt; if (dmdHold <= 0 && S.phase !== 'idle') dmd(S.phase === 'over' ? 'GAME OVER' : 'BALL ' + S.ball + '   ' + S.mult + 'X', fmt(S.score)); }
    dmdClock -= dt; if (dmdDirty && dmdClock <= 0) { dmdDirty = false; dmdClock = 0.1; redraw(dmdTex); }

    for (i = 0; i < balls.length; i++) {
      var b = S.balls[i], m = balls[i];
      if (!b) { m.visible = false; continue; }
      m.visible = true; m.position.set(b.x, b.y, b.held ? P.BR * 0.6 : P.BR);
      var sp = Math.sqrt(b.vx * b.vx + b.vy * b.vy);
      if (sp > 0.01) { m.rotation.x -= b.vy * dt / P.BR; m.rotation.y += b.vx * dt / P.BR; }
    }
    for (i = 0; i < 2; i++) flippers[i].rotation.z = S.fl[i].ang;
    spinner.rotation.x = S.spin.ang;
    plunger.position.y = -0.012 - S.charge * 0.03; knob.position.y = -0.06 - S.charge * 0.03;
    var blink = Math.sin(time * 10) > 0;
    for (i = 0; i < 5; i++) setLit(I.hunny[i], S.hunny[i] || (S.frenzy > 0 && blink));
    for (i = 0; i < 6; i++) setLit(I.willie[i], S.willie[i] || (S.steam > 0 && blink));
    for (i = 0; i < 3; i++) setLit(I.bee[i], S.bee[i]);
    for (i = 0; i < 4; i++) setLit(I.mult[i], S.mult >= i + 2);
    setLit(I.save, S.save > 0 && (S.save > 3 || blink)); setLit(I.mb, S.mbReady ? blink : S.multiball);
    setLit(I.frenzy, S.frenzy > 0 && blink); setLit(I.steam, S.steam > 0 && blink);
    for (i = 0; i < 2; i++) {
      targets[i].forEach(function (t) { t.kick = Math.max(0, t.kick - dt * 6); t.mesh.position.x = t.x0 - t.dir * t.kick * 0.004; t.m.emissiveIntensity = t.kick * 1.5; });
      slingFlash[i] = Math.max(0, slingFlash[i] - dt * 5);
    }
    M.sling.emissive.setHex(0xff6a00); M.sling.emissiveIntensity = Math.max(slingFlash[0], slingFlash[1]) * 2;
    bumpers.forEach(function (bp, q) {
      bp.flash = Math.max(0, bp.flash - dt * 5);
      var fr = S.frenzy > 0 ? 0.5 + 0.5 * Math.sin(time * 14 + q * 2) : 0, v = Math.max(bp.flash, fr * 0.7);
      bp.m.emissiveIntensity = v * 1.4; bp.g.scale.setScalar(1 + bp.flash * 0.12); bp.hm.color.setHex(v > 0.3 ? 0xffffff : K.c.fx);
      if (bp.light) bp.light.intensity = v * 2.2;
    });
    var buzz = S.frenzy > 0 ? 3 : (S.mbReady ? 2 : 1);
    bees.forEach(function (be) {
      var a = be.ph + time * be.sp * buzz;
      be.m.position.set(0.03 + Math.cos(a) * be.r * buzz * 0.8, 0.69 + Math.sin(a * 1.3) * be.r * buzz * 0.8, 0.09 + be.h * 0.07 + Math.sin(a * 2.1) * 0.012);
    });
    whistle = Math.max(0, whistle - dt);
    if (bear) {
      bear.userData.head.rotation.z = Math.sin(time * 1.3) * 0.12; bear.position.z = 0.03 + (S.frenzy > 0 ? Math.abs(Math.sin(time * 9)) * 0.012 : 0);
      balloon.position.z = 0.13 + Math.sin(time * 1.2) * 0.008; balloon.position.x = TW - 0.05 + Math.sin(time * 0.7) * 0.006;
    }
    if (mouse) {
      var md = mouse.userData; md.wheel.rotation.z = S.spin.ang * 0.5 + Math.sin(time * 0.8) * 0.4; md.head.rotation.z = Math.sin(time * 2.2) * 0.1;
      mouse.position.z = 0.05 + Math.sin(time * 1.7) * 0.003; mouse.rotation.z = Math.sin(time * 1.1) * 0.03;
      var steamy = S.steam > 0 || S.frenzy > 0 || whistle > 0 ? 2.2 : 1;
      md.smoke.forEach(function (sm) {
        var t = (sm.ph + time * 0.35 * steamy) % 1; sm.m.position.set(sm.side * 0.25 + Math.sin(t * 5 + sm.ph * 9) * 0.08, 1.3 + t * 1.3, -0.33 - t * 0.3); sm.m.scale.setScalar(0.5 + t * 1.6 * (steamy > 1 ? 1.3 : 1));
      });
    }
    updateParticles(dt);
  }

  dmdDirty = true; update(0);
  return {
    group: group, state: S, sim: P,
    start: start, update: update,
    flip: function (side, on) { var e2 = []; P.flip(S, side, on, e2); e2.forEach(handle); },
    plunge: function (on) { var e2 = []; P.plunge(S, on, e2); e2.forEach(handle); },
    ballWaiting: function () { for (var i = 0; i < S.balls.length; i++) if (P.resting(S.balls[i]) && !(S.balls[i].auto > 0)) return true; return false; },
    theme: K, redrawText: function () { redraw(fieldTex); redraw(apronTex); redraw(artTex); redraw(potTex); texts.forEach(redraw); dmdDirty = true; },
    on: function (name, fn) { (listeners[name] = listeners[name] || []).push(fn); return this; },
    off: function (name, fn) { listeners[name] = (listeners[name] || []).filter(function (f) { return f !== fn; }); return this; },
    dispose: function () { if (group.parent) group.parent.remove(group); disposables.forEach(function (d) { if (d.dispose) d.dispose(); }); }
  };
}
