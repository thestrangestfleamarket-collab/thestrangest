// LUCKY LANES SKEE-BALL (the owner's module, 11 Nov 2026): SKEE.make(options) builds a 3D cabinet (lane, ski-jump ramp, tilted board with raised rings and holes) and runs a game of nine balls on its own ball physics; GAMES.skee plays it in the minigames' window.
import {THREE} from './003-shx.js';
import {SFX} from './003b-systems.js';
import {OWNED} from './005-save.js';
const SKEE={}; window.SKEE=SKEE;
{ const phys=()=>{ '@later';
  var G = 9.81, R = 0.038;
  var HALF = 0.30, Z_START = 0.9, Z_RAMP = -1.0, RAMP_R = 0.4037;
  var PHI = 48 * Math.PI / 180;
  var Z_LIP = Z_RAMP - RAMP_R * Math.sin(PHI), H_LIP = RAMP_R * (1 - Math.cos(PHI));
  var TH = 32 * Math.PI / 180, ST = Math.sin(TH), CT = Math.cos(TH);
  var OY = 0.03, OZ = -1.42, L = 1.0;
  var HW = 0.026, TUBE = 0.007, NET = 0.62;
  var PI = Math.PI;
  var rings = [
    { u: 0, v: 0.40, r: 0.30, arc: true },
    { u: 0, v: 0.42, r: 0.185 },
    { u: 0, v: 0.45, r: 0.075 },
    { u: 0, v: 0.715, r: 0.075 },
    { u: 0, v: 0.885, r: 0.07 },
    { u: -0.235, v: 0.90, r: 0.06 },
    { u: 0.235, v: 0.90, r: 0.06 }
  ];
  var holes = [
    { pts: 10, u: 0, v: 0.162, r: 0.052, ring: 0 },
    { pts: 20, u: 0, v: 0.297, r: 0.052, ring: 1 },
    { pts: 30, u: 0, v: 0.45, r: 0.052, ring: 2 },
    { pts: 40, u: 0, v: 0.715, r: 0.052, ring: 3 },
    { pts: 50, u: 0, v: 0.885, r: 0.05, ring: 4 },
    { pts: 100, u: -0.235, v: 0.90, r: 0.046, ring: 5 },
    { pts: 100, u: 0.235, v: 0.90, r: 0.046, ring: 6 }
  ];

  function newBall(x, z, vx, vz) {
    return { x: x, y: R, z: z, vx: vx, vy: 0, vz: vz, state: 'live', inGap: false, still: 0, nudges: 0, t: 0,
      contact: false, cnx: 0, cny: 1, cnz: 0, onBoard: false, hole: -1, result: null };
  }

  function hit(b, nx, ny, nz, pen, e, mu, kind, ev, surface) {
    b.x += nx * pen; b.y += ny * pen; b.z += nz * pen;
    var vn = b.vx * nx + b.vy * ny + b.vz * nz;
    if (vn < 0) {
      var s = -vn, k = s > 0.35 ? 1 + e : 1;
      b.vx -= k * vn * nx; b.vy -= k * vn * ny; b.vz -= k * vn * nz;
      if (mu > 0 && s > 0.5) {
        var vn2 = b.vx * nx + b.vy * ny + b.vz * nz;
        var tx = b.vx - vn2 * nx, ty = b.vy - vn2 * ny, tz = b.vz - vn2 * nz;
        var tl = Math.sqrt(tx * tx + ty * ty + tz * tz);
        if (tl > 1e-6) { var d = Math.min(mu * k * s, tl) / tl; b.vx -= tx * d; b.vy -= ty * d; b.vz -= tz * d; }
      }
      if (s > 0.3 && ev) ev.push({ k: kind, s: s });
    }
    if (surface) { b.contact = true; b.cnx = nx; b.cny = ny; b.cnz = nz; }
  }

  function finish(b, res, ev) { b.state = 'done'; b.result = res; ev.push({ k: res }); }

  function sink(b, i, ev) { b.state = 'sunk'; b.hole = i; b.result = holes[i].pts; ev.push({ k: 'score', pts: holes[i].pts, hole: i }); }

  function nearestHole(u, v) {
    var best = 0, bd = 1e9;
    for (var i = 0; i < holes.length; i++) { var d = Math.hypot(u - holes[i].u, v - holes[i].v); if (d < bd) { bd = d; best = i; } }
    return best;
  }

  function step(b, dt, ev) {
    if (b.state !== 'live') return;
    b.t += dt;
    b.vy -= G * dt;
    b.x += b.vx * dt; b.y += b.vy * dt; b.z += b.vz * dt;
    b.contact = false; b.onBoard = false;

    var lim = HALF - R;
    if (b.x > lim) { b.x = lim; if (b.vx > 0) { if (b.vx > 0.3) ev.push({ k: 'rail', s: b.vx }); b.vx *= -0.6; } }
    else if (b.x < -lim) { b.x = -lim; if (b.vx < 0) { if (b.vx < -0.3) ev.push({ k: 'rail', s: -b.vx }); b.vx *= -0.6; } }

    if (b.inGap) {
      if (b.z > Z_LIP - R) { b.z = Z_LIP - R; if (b.vz > 0) b.vz *= -0.3; }
      if (b.y < -0.3) finish(b, 'gutter', ev);
      return;
    }

    var dy = b.y - OY, dz = b.z - OZ;
    var u = b.x, v = dy * ST - dz * CT, w = dy * CT + dz * ST;
    var i, h, g;

    // ----- lane and ramp
    if (b.z >= Z_RAMP) {
      if (b.y < R) hit(b, 0, 1, 0, R - b.y, 0.2, 0.2, 'lane', ev, true);
    } else {
      var ry = b.y - RAMP_R, rz = b.z - Z_RAMP;
      var alpha = Math.atan2(-rz, -ry);
      if (alpha >= 0 && alpha <= PHI) {
        var d = Math.sqrt(ry * ry + rz * rz);
        if (d > RAMP_R - R && d > 1e-6) hit(b, 0, -ry / d, -rz / d, d - (RAMP_R - R), 0.2, 0.2, 'lane', ev, true);
      } else if (b.z < Z_LIP && b.y < H_LIP && v < -0.012) {
        b.inGap = true; return;
      } else {
        var py = b.y - H_LIP, pz = b.z - Z_LIP, pd = Math.sqrt(py * py + pz * pz);
        if (pd < R && pd > 1e-6) hit(b, 0, py / pd, pz / pd, R - pd, 0.3, 0, 'lane', ev, false);
      }
    }

    // ----- target board
    if (v >= -0.012 && w > -0.08 && b.z < Z_LIP) {
      b.onBoard = w < R + 0.02;
      if (w < R + 0.006) {
        for (i = 0; i < holes.length; i++) {
          h = holes[i];
          if (Math.hypot(u - h.u, v - h.v) < h.r * 0.78) { sink(b, i, ev); return; }
        }
      }
      for (i = 0; i < rings.length; i++) {
        g = rings[i];
        var qu = u - g.u, qv = v - g.v, qd = Math.sqrt(qu * qu + qv * qv);
        if (qd < 1e-5) continue;
        var cu, cv;
        if (g.arc) {
          // tall catch wall: nothing hops over it, so a miss still drains to the 10
          if (qv <= 0 && w < 0.11 && Math.abs(qd - g.r) < R + TUBE) {
            var sg = qd < g.r ? -1 : 1, wu = sg * qu / qd, wv = sg * qv / qd;
            hit(b, wu, wv * ST, -wv * CT, R + TUBE - Math.abs(qd - g.r), 0.4, 0, 'ring', ev, false);
            dy = b.y - OY; dz = b.z - OZ; u = b.x; v = dy * ST - dz * CT; w = dy * CT + dz * ST;
          }
          continue;
        }
        cu = g.u + qu / qd * g.r; cv = g.v + qv / qd * g.r;
        var ex = u - cu, ey = v - cv, ez = w - HW, ed = Math.sqrt(ex * ex + ey * ey + ez * ez);
        if (ed < R + TUBE && ed > 1e-6) {
          var nu = ex / ed, nv = ey / ed, nw = ez / ed;
          hit(b, nu, nv * ST + nw * CT, -nv * CT + nw * ST, R + TUBE - ed, 0.45, 0, 'ring', ev, false);
          dy = b.y - OY; dz = b.z - OZ; u = b.x; v = dy * ST - dz * CT; w = dy * CT + dz * ST;
        }
      }
      if (w < R && v <= L + 0.05) {
        hit(b, 0, CT, ST, R - w, 0.3, 0.3, 'board', ev, true);
        dy = b.y - OY; dz = b.z - OZ; v = dy * ST - dz * CT; w = dy * CT + dz * ST;
      }
      if (v > L - R) {
        hit(b, 0, -ST, CT, v - (L - R), 0.55, 0, 'wall', ev, false);
        dy = b.y - OY; dz = b.z - OZ; v = dy * ST - dz * CT; w = dy * CT + dz * ST;
      }
      if (w > NET - R) hit(b, 0, -CT, -ST, w - (NET - R), 0.2, 0, 'net', ev, false);
    }

    // ----- rolling contact: a rolling sphere accelerates at 5/7 g along a slope, plus felt drag
    if (b.contact) {
      var c = (2 / 7) * dt * G, ny = b.cny;
      b.vx -= c * ny * b.cnx; b.vy -= c * (ny * ny - 1); b.vz -= c * ny * b.cnz;
      var sp0 = Math.sqrt(b.vx * b.vx + b.vy * b.vy + b.vz * b.vz), a = (b.onBoard ? 0.5 : 0.22) * dt;
      if (sp0 > a) { var f = (sp0 - a) / sp0; b.vx *= f; b.vy *= f; b.vz *= f; } else { b.vx = b.vy = b.vz = 0; }
    }

    var sp = Math.sqrt(b.vx * b.vx + b.vy * b.vy + b.vz * b.vz);
    if (b.onBoard && sp < 0.05) {
      b.still += dt;
      if (b.still > 0.8) {
        b.nudges++; b.still = 0.3;
        if (b.nudges > 4) { sink(b, nearestHole(u, v), ev); return; }
        b.vx += (Math.random() - 0.5) * 0.5; b.vy -= 0.25 * ST; b.vz += 0.25 * CT;
      }
    } else if (!b.onBoard && b.contact && sp < 0.04) {
      b.still += dt; if (b.still > 0.5) { finish(b, 'return', ev); return; }
    } else b.still = 0;

    if (b.z > Z_START + 0.45 && b.vz > 0) { finish(b, 'return', ev); return; }
    if (b.t > 14) { if (b.onBoard) sink(b, nearestHole(u, v), ev); else finish(b, 'return', ev); }
  }

  return { G: G, R: R, HALF: HALF, Z_START: Z_START, Z_RAMP: Z_RAMP, RAMP_R: RAMP_R, PHI: PHI, Z_LIP: Z_LIP, H_LIP: H_LIP,
    TH: TH, ST: ST, CT: CT, OY: OY, OZ: OZ, L: L, HW: HW, TUBE: TUBE, NET: NET, rings: rings, holes: holes,
    newBall: newBall, step: step };
};
  SKEE.make=options=>{ '@later';
  var T = THREE, P = SKEE.P || (SKEE.P = phys()), PHYS = P, opt = options || {};
  var BALLS = opt.balls || 9;
  var clamp = function (v, a, b) { return v < a ? a : v > b ? b : v; };
  var lerp = function (a, b, t) { return a + (b - a) * t; };
  var COLORS = [0x21e6ff, 0x39ff88, 0xffe14a, 0xff9a3c, 0xff3fa4, 0xff3b3b, 0xff3b3b];
  var CSS = ['#21e6ff', '#39ff88', '#ffe14a', '#ff9a3c', '#ff3fa4', '#ff5a5a', '#ff5a5a'];
  var FONT = opt.font || "'Bungee','Chakra Petch',system-ui,sans-serif";
  var disposables = [];

  function canvasTex(w, h, draw) {
    var c = document.createElement('canvas'); c.width = w; c.height = h;
    var g = c.getContext('2d'); draw(g, w, h);
    var t = new T.CanvasTexture(c);
    if ('colorSpace' in t) t.colorSpace = 'srgb'; else t.encoding = T.sRGBEncoding;
    t.anisotropy = 8; t._skee = { g: g, w: w, h: h, draw: draw };
    disposables.push(t); return t;
  }
  function redraw(t) { var d = t._skee; d.g.clearRect(0, 0, d.w, d.h); d.draw(d.g, d.w, d.h); t.needsUpdate = true; }

  var S = { mode: 'idle', score: 0, shown: 0, balls: BALLS, counts: {}, throws: 0, b: null, held: { x: 0, z: P.Z_START }, gen: 0 };
  var listeners = {};
  function emit(name, data) { (listeners[name] || []).forEach(function (f) { f(data || {}); }); }

  // ---- textures
  var laneLen = (1.5 - P.Z_RAMP) + P.RAMP_R * P.PHI;
  var laneTex = canvasTex(256, 1024, function (g, W, H) {
    var i, x;
    for (i = 0; i < 8; i++) { g.fillStyle = 'hsl(' + (28 + (i % 3) * 2) + ',55%,' + (44 + ((i * 37) % 9)) + '%)'; g.fillRect(i * W / 8, 0, W / 8 + 1, H); }
    for (i = 0; i < 700; i++) {
      x = Math.random() * W;
      g.strokeStyle = 'rgba(' + (Math.random() < 0.5 ? '70,35,10' : '255,220,170') + ',' + (0.04 + Math.random() * 0.08) + ')';
      g.lineWidth = 0.6 + Math.random();
      var y0 = Math.random() * H; g.beginPath(); g.moveTo(x, y0); g.lineTo(x + (Math.random() - 0.5) * 3, y0 + 40 + Math.random() * 220); g.stroke();
    }
    for (i = 1; i < 8; i++) { g.fillStyle = 'rgba(40,18,5,.35)'; g.fillRect(i * W / 8 - 0.7, 0, 1.4, H); }
    var Y = function (s) { return s / laneLen * H; };
    g.fillStyle = 'rgba(210,30,60,.85)'; g.fillRect(0, Y(1.08), W, 5);
    g.fillStyle = 'rgba(255,255,255,.55)';
    [-1, 0, 1].forEach(function (k) {
      var cx = W / 2 + k * 62, cy = Y(1.75) - Math.abs(k) * 26;
      g.beginPath(); g.moveTo(cx, cy + 34); g.lineTo(cx - 11, cy); g.lineTo(cx + 11, cy); g.closePath(); g.fill();
    });
    for (i = 0; i < 7; i++) { g.beginPath(); g.arc(W / 2 + (i - 3) * 31, Y(1.3), 3, 0, 7); g.fill(); }
    var gr = g.createLinearGradient(0, Y(2.5) - 20, 0, H);
    gr.addColorStop(0, 'rgba(20,6,30,0)'); gr.addColorStop(1, 'rgba(20,6,30,.45)');
    g.fillStyle = gr; g.fillRect(0, Y(2.5) - 20, W, H);
  });
  var boardTex = canvasTex(600, 1000, function (g, W, H) {
    var sc = W / 0.6, X = function (u) { return (u + 0.3) * sc; }, Y = function (v) { return (1 - v / P.L) * H; }, i;
    var bg = g.createLinearGradient(0, 0, 0, H);
    bg.addColorStop(0, '#34105c'); bg.addColorStop(0.55, '#1b1458'); bg.addColorStop(1, '#0b1c4a');
    g.fillStyle = bg; g.fillRect(0, 0, W, H);
    for (i = 0; i < 5000; i++) { g.fillStyle = 'rgba(255,255,255,' + Math.random() * 0.05 + ')'; g.fillRect(Math.random() * W, Math.random() * H, 1.5, 1.5); }
    var zone = function (r, col, a) { g.globalAlpha = a; g.fillStyle = col; g.beginPath(); g.arc(X(r.u), Y(r.v), r.r * sc, 0, 7); g.fill(); g.globalAlpha = 1; };
    g.globalAlpha = 0.16; g.fillStyle = CSS[0]; g.beginPath(); g.arc(X(0), Y(0.40), 0.30 * sc, 0, Math.PI); g.fill();
    g.fillRect(0, Y(0.62), W, Y(0.40) - Y(0.62)); g.globalAlpha = 1;
    zone(P.rings[1], '#0d3a2c', 1); zone(P.rings[1], CSS[1], 0.22);
    zone(P.rings[2], CSS[2], 0.38); zone(P.rings[3], CSS[3], 0.4); zone(P.rings[4], CSS[4], 0.42);
    zone(P.rings[5], CSS[5], 0.45); zone(P.rings[6], CSS[6], 0.45);
    P.holes.forEach(function (h) { g.fillStyle = '#000'; g.beginPath(); g.arc(X(h.u), Y(h.v), h.r * sc, 0, 7); g.fill(); });
    var label = function (txt, u, v, px, col) {
      g.font = px + 'px ' + FONT; g.textAlign = 'center'; g.textBaseline = 'middle';
      g.shadowColor = col; g.shadowBlur = 16; g.fillStyle = '#fff'; g.fillText(txt, X(u), Y(v)); g.shadowBlur = 0;
      g.lineWidth = 2; g.strokeStyle = col; g.strokeText(txt, X(u), Y(v));
    };
    label('10', -0.16, 0.2, 46, CSS[0]); label('10', 0.16, 0.2, 46, CSS[0]);
    label('20', -0.127, 0.41, 40, CSS[1]); label('20', 0.127, 0.41, 40, CSS[1]);
    label('30', 0, 0.563, 32, CSS[2]);
    label('40', -0.155, 0.715, 44, CSS[3]); label('40', 0.155, 0.715, 44, CSS[3]);
    label('50', 0, 0.787, 30, CSS[4]);
    label('100', -0.235, 0.812, 34, CSS[5]); label('100', 0.235, 0.812, 34, CSS[5]);
  });
  var ballTex = canvasTex(256, 128, function (g, W, H) {
    var gr = g.createLinearGradient(0, 0, 0, H);
    gr.addColorStop(0, '#a55f2c'); gr.addColorStop(0.5, '#c9813f'); gr.addColorStop(1, '#8f4f22');
    g.fillStyle = gr; g.fillRect(0, 0, W, H);
    g.fillStyle = 'rgba(255,236,200,.85)'; g.fillRect(40, 0, 9, H); g.fillRect(168, 0, 9, H);
    g.fillStyle = 'rgba(70,25,10,.6)'; g.fillRect(104, 0, 4, H); g.fillRect(232, 0, 4, H);
  });
  var dispTex = canvasTex(600, 500, function (g, W, H) {
    g.fillStyle = '#0a0614'; g.fillRect(0, 0, W, H);
    g.strokeStyle = '#ff3fa4'; g.lineWidth = 8; g.strokeRect(16, 16, W - 32, H - 32);
    g.textAlign = 'center'; g.textBaseline = 'middle';
    g.font = '40px ' + FONT; g.fillStyle = '#21e6ff'; g.fillText('SCORE', W / 2, 74);
    g.font = '190px ' + FONT; g.fillStyle = '#ffb02e'; g.shadowColor = '#ff6a00'; g.shadowBlur = 34;
    var s = String(Math.round(S.shown)); while (s.length < 3) s = '0' + s;
    g.fillText(s, W / 2, 232); g.shadowBlur = 0;
    for (var i = 0; i < BALLS; i++) {
      g.beginPath(); g.arc(W / 2 + (i - (BALLS - 1) / 2) * 50, 408, 16, 0, 7);
      g.fillStyle = i < S.balls ? '#ffd9a6' : 'rgba(255,255,255,.08)'; g.fill();
    }
  });
  var dotTex = canvasTex(64, 64, function (g) {
    var r = g.createRadialGradient(32, 32, 0, 32, 32, 32);
    r.addColorStop(0, 'rgba(255,255,255,1)'); r.addColorStop(0.4, 'rgba(255,255,255,.5)'); r.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = r; g.fillRect(0, 0, 64, 64);
  });

  // ---- meshes (everything is a child of `group`, in cabinet-local metres)
  var group = new T.Group(); group.name = 'SkeeBallCabinet';
  var mat = function (m) { disposables.push(m); return m; };
  var geo = function (g) { disposables.push(g); return g; };
  var std = function (o) { return mat(new T.MeshStandardMaterial(o)); };
  var neon = function (col) { return mat(new T.MeshBasicMaterial({ color: col, toneMapped: false })); };
  var box = function (w, h, d, m, x, y, z, parent) { var me = new T.Mesh(geo(new T.BoxGeometry(w, h, d)), m); me.position.set(x, y, z); (parent || group).add(me); return me; };

  (function () {
    var pts = [[1.5, 0, 0], [P.Z_RAMP, 0, 1.5 - P.Z_RAMP]], n = 28, i;
    for (i = 1; i <= n; i++) { var a = P.PHI * i / n; pts.push([P.Z_RAMP - P.RAMP_R * Math.sin(a), P.RAMP_R * (1 - Math.cos(a)), (1.5 - P.Z_RAMP) + P.RAMP_R * a]); }
    var pos = [], uv = [], idx = [];
    pts.forEach(function (p) { pos.push(-P.HALF, p[1], p[0], P.HALF, p[1], p[0]); uv.push(0, 1 - p[2] / laneLen, 1, 1 - p[2] / laneLen); });
    for (i = 0; i < pts.length - 1; i++) { var k = 2 * i; idx.push(k, k + 1, k + 2, k + 1, k + 3, k + 2); }
    var g = geo(new T.BufferGeometry());
    g.setAttribute('position', new T.Float32BufferAttribute(pos, 3));
    g.setAttribute('uv', new T.Float32BufferAttribute(uv, 2));
    g.setIndex(idx); g.computeVertexNormals();
    var lane = new T.Mesh(g, std({ map: laneTex, roughness: 0.28, metalness: 0.05, side: T.DoubleSide }));
    lane.receiveShadow = true; group.add(lane);
  })();

  var bodyMat = std({ color: 0x1a0c33, roughness: 0.6, metalness: 0.2 });
  var trimMat = std({ color: 0x2b1552, roughness: 0.4, metalness: 0.4 });
  box(0.72, 0.74, 3.95, bodyMat, 0, -0.38, -0.475);
  [-1, 1].forEach(function (s) {
    box(0.05, 0.13, 2.92, trimMat, s * 0.326, 0.05, 0.04);
    box(0.014, 0.014, 2.92, neon(s < 0 ? 0xff3fa4 : 0x21e6ff), s * 0.304, 0.118, 0.04);
    box(0.05, 1.12, 1.06, trimMat, s * 0.326, 0.55, -1.93);
    box(0.016, 1.12, 0.016, neon(s < 0 ? 0xff3fa4 : 0x21e6ff), s * 0.305, 0.55, -1.405);
    box(0.016, 0.016, 1.06, neon(0xffe14a), s * 0.305, 1.105, -1.93);
  });
  box(0.72, 1.5, 0.06, bodyMat, 0, 0.36, -2.49);
  box(0.12, 0.03, 1.2, trimMat, 0.435, -0.02, 0.75);
  box(0.012, 0.05, 1.2, trimMat, 0.495, 0.0, 0.75);

  var board = new T.Group();
  board.position.set(0, P.OY, P.OZ); board.rotation.x = P.TH - Math.PI / 2; group.add(board);
  var felt = new T.Mesh(geo(new T.PlaneGeometry(0.6, P.L)), std({ map: boardTex, roughness: 0.85, metalness: 0 }));
  felt.position.set(0, P.L / 2, 0); felt.receiveShadow = true; board.add(felt);
  var ringMats = [], ringFlash = [];
  P.rings.forEach(function (r, i) {
    var m = std({ color: COLORS[i], emissive: COLORS[i], emissiveIntensity: 0.6, roughness: 0.35, metalness: 0.25 });
    var g = geo(new T.TorusGeometry(r.r, 0.0085, 10, r.arc ? 64 : Math.max(28, Math.round(r.r * 420)), r.arc ? Math.PI : Math.PI * 2));
    var me = new T.Mesh(g, m); me.position.set(r.u, r.v, r.arc ? 0.04 : 0.0165); me.scale.z = r.arc ? 4.8 : 2.0;
    if (r.arc) me.rotation.z = Math.PI;
    me.castShadow = true; board.add(me); ringMats.push(m); ringFlash.push(0);
  });
  P.holes.forEach(function (h) {
    var me = new T.Mesh(geo(new T.CircleGeometry(h.r, 32)), mat(new T.MeshBasicMaterial({ color: 0x000000 })));
    me.position.set(h.u, h.v, 0.0012); board.add(me);
  });
  var disp = new T.Mesh(geo(new T.PlaneGeometry(0.6, P.NET)), mat(new T.MeshBasicMaterial({ map: dispTex, toneMapped: false })));
  disp.rotation.x = Math.PI / 2; disp.position.set(0, P.L, P.NET / 2); board.add(disp);

  var flashL = null;
  if (opt.lights) {
    var spot = new T.SpotLight(0xfff0dd, 1.5, 9, 0.55, 0.7, 1.2);
    spot.position.set(0.25, 2.6, 0.9); spot.target.position.set(0, 0.15, -1.5); spot.castShadow = true;
    group.add(spot); group.add(spot.target);
    flashL = new T.PointLight(0xffffff, 0, 3); flashL.position.set(0, 0.9, -1.7); group.add(flashL);
  }

  var ballGeo = geo(new T.SphereGeometry(P.R, 32, 22));
  var ballMat = std({ map: ballTex, roughness: 0.38, metalness: 0.05 });
  var ball = new T.Mesh(ballGeo, ballMat); ball.castShadow = true; ball.visible = false; group.add(ball);
  var queue = [];
  for (var qi = 0; qi < Math.min(BALLS - 1, 12); qi++) {
    var qb = new T.Mesh(ballGeo, ballMat); qb.position.set(0.435, P.R - 0.005, 1.02 - qi * 0.079);
    qb.rotation.set(qi * 1.3, qi * 0.7, qi); group.add(qb); queue.push(qb);
  }

  // particles
  var PN = 260, pPos = new Float32Array(PN * 3), pCol = new Float32Array(PN * 3), pVel = new Float32Array(PN * 3), pLife = new Float32Array(PN), pBase = new Float32Array(PN * 3), pNext = 0;
  for (var pi = 0; pi < PN; pi++) pPos[pi * 3 + 1] = -99;
  var pGeo = geo(new T.BufferGeometry());
  pGeo.setAttribute('position', new T.BufferAttribute(pPos, 3)); pGeo.setAttribute('color', new T.BufferAttribute(pCol, 3));
  var parts = new T.Points(pGeo, mat(new T.PointsMaterial({ size: 0.045, map: dotTex, vertexColors: true, transparent: true, blending: T.AdditiveBlending, depthWrite: false })));
  parts.frustumCulled = false; group.add(parts);
  var tmpC = new T.Color();
  function burst(x, y, z, hex, n, power) {
    tmpC.setHex(hex);
    for (var i = 0; i < n; i++) {
      var k = pNext; pNext = (pNext + 1) % PN;
      pPos[k * 3] = x; pPos[k * 3 + 1] = y; pPos[k * 3 + 2] = z;
      var a = Math.random() * 6.283, e = Math.random() * 1.2, sp = power * (0.4 + Math.random() * 0.8);
      pVel[k * 3] = Math.cos(a) * Math.cos(e) * sp; pVel[k * 3 + 1] = Math.sin(e) * sp * 1.4 + 0.4; pVel[k * 3 + 2] = Math.sin(a) * Math.cos(e) * sp + 0.5;
      var w = Math.random() * 0.5;
      pBase[k * 3] = lerp(tmpC.r, 1, w); pBase[k * 3 + 1] = lerp(tmpC.g, 1, w); pBase[k * 3 + 2] = lerp(tmpC.b, 1, w);
      pLife[k] = 0.6 + Math.random() * 0.7;
    }
  }
  function updateParticles(dt) {
    for (var k = 0; k < PN; k++) {
      if (pLife[k] <= 0) continue;
      pLife[k] -= dt;
      if (pLife[k] <= 0) { pPos[k * 3 + 1] = -99; continue; }
      pVel[k * 3 + 1] -= 3.2 * dt;
      pPos[k * 3] += pVel[k * 3] * dt; pPos[k * 3 + 1] += pVel[k * 3 + 1] * dt; pPos[k * 3 + 2] += pVel[k * 3 + 2] * dt;
      var f = Math.min(1, pLife[k] * 2.2);
      pCol[k * 3] = pBase[k * 3] * f; pCol[k * 3 + 1] = pBase[k * 3 + 1] * f; pCol[k * 3 + 2] = pBase[k * 3 + 2] * f;
    }
    pGeo.attributes.position.needsUpdate = true; pGeo.attributes.color.needsUpdate = true;
  }

  // ---- game flow
  var VMIN = 2.0, VMAX = 5.5, STEP = 1 / 600;
  var timers = [], acc = 0, ev = [], time = 0, sinkT = 0, spinRate = 0;
  var spinAxis = new T.Vector3(1, 0, 0), q4 = new T.Quaternion(), hw = new T.Vector3(), tmpRay = new T.Ray(), tmpM = new T.Matrix4();
  var lanePlane = new T.Plane(new T.Vector3(0, 1, 0), -P.R), hitP = new T.Vector3();
  function later(sec, fn) { timers.push({ t: sec, fn: fn, gen: S.gen }); }
  function holeLocal(h, out) { return out.set(h.u, P.OY + h.v * P.ST, P.OZ - h.v * P.CT); }
  function refresh() { var nq = S.balls - (S.mode === 'aim' ? 1 : 0); queue.forEach(function (q, i) { q.visible = i < nq; }); redraw(dispTex); }

  function startGame() {
    S.gen++; timers.length = 0;
    S.score = 0; S.shown = 0; S.balls = BALLS; S.counts = {}; S.throws = 0; S.b = null; S.mode = 'aim';
    S.held.x = 0; S.held.z = P.Z_START;
    ball.visible = true; ball.scale.setScalar(1); ball.position.set(0, P.R, P.Z_START);
    refresh(); emit('ready', { balls: S.balls });
  }
  function nextBall() {
    S.b = null;
    if (S.balls <= 0) { S.mode = 'over'; ball.visible = false; refresh(); emit('gameover', { score: S.score, counts: S.counts }); return; }
    S.mode = 'aim'; S.held.z = P.Z_START;
    ball.visible = true; ball.scale.setScalar(1); ball.position.set(S.held.x, P.R, P.Z_START + 0.5);
    refresh(); emit('ready', { balls: S.balls });
  }
  function throwBall(speed, angle) {
    if (S.mode !== 'aim') return false;
    var v0 = clamp(speed, VMIN, VMAX), a = clamp(angle || 0, -0.17, 0.17);
    S.b = P.newBall(S.held.x, S.held.z, Math.sin(a) * v0, -Math.cos(a) * v0);
    ball.position.set(S.b.x, S.b.y, S.b.z);
    S.mode = 'rolling'; S.balls--; S.throws++; refresh();
    emit('throw', { speed: v0, angle: a, power: (v0 - VMIN) / (VMAX - VMIN) });
    return true;
  }
  // swipe speed in screen-heights per second -> a roll. Returns false if the swipe was too slow to count.
  function flick(up, side) {
    if (up < 0.35) return false;
    return throwBall(2.25 + 0.58 * up, Math.atan2(side || 0, up) * 0.45);
  }
  function setAim(x, z) { S.held.x = clamp(x, -0.24, 0.24); S.held.z = z === undefined ? P.Z_START : clamp(z, 0.62, 1.04); }
  // pass a world-space THREE.Ray (e.g. raycaster.ray); the waiting ball follows where it meets the lane
  function aimWithRay(worldRay, drag) {
    group.updateMatrixWorld(true);
    tmpM.copy(group.matrixWorld).invert();
    tmpRay.copy(worldRay).applyMatrix4(tmpM);
    var p = tmpRay.intersectPlane(lanePlane, hitP);
    if (!p) return false;
    setAim(p.x, drag ? p.z : undefined); return true;
  }
  function onScore(pts, hi) {
    var h = P.holes[hi]; holeLocal(h, hw);
    S.score += pts; S.counts[pts] = (S.counts[pts] || 0) + 1;
    ringFlash[h.ring] = 1;
    if (pts >= 100) ringFlash.forEach(function (_, i) { ringFlash[i] = 1; });
    if (flashL) { flashL.color.setHex(COLORS[h.ring]); flashL.intensity = pts >= 100 ? 5 : 2.2 + pts / 40; }
    burst(hw.x, hw.y + 0.03, hw.z, COLORS[h.ring], pts >= 100 ? 150 : 24 + pts, pts >= 100 ? 2.2 : 1.1 + pts / 80);
    S.mode = 'sink'; sinkT = 0; refresh();
    emit('score', { pts: pts, hole: hi, total: S.score, color: COLORS[h.ring], position: group.localToWorld(hw.clone()) });
    later(0.85, nextBall);
  }

  function update(dt) {
    dt = Math.min(dt, 0.05); time += dt;
    var i;
    for (i = timers.length - 1; i >= 0; i--) { var tm = timers[i]; tm.t -= dt; if (tm.t <= 0) { timers.splice(i, 1); if (tm.gen === S.gen) tm.fn(); } }
    var b = S.b;
    if (S.mode === 'aim') {
      var k = 1 - Math.exp(-dt * 18), px = ball.position.x, pz = ball.position.z;
      ball.position.x = lerp(px, S.held.x, k); ball.position.z = lerp(pz, S.held.z, k); ball.position.y = P.R;
      var mvx = ball.position.x - px, mvz = ball.position.z - pz, mv = Math.sqrt(mvx * mvx + mvz * mvz);
      if (mv > 1e-6) { spinAxis.set(mvz, 0, -mvx).normalize(); q4.setFromAxisAngle(spinAxis, mv / P.R); ball.quaternion.premultiply(q4); }
    } else if (S.mode === 'rolling' && b) {
      acc += dt; ev.length = 0;
      while (acc >= STEP && b.state === 'live') { P.step(b, STEP, ev); acc -= STEP; }
      if (b.state !== 'live') acc = 0;
      ball.position.set(b.x, b.y, b.z);
      var sp = Math.sqrt(b.vx * b.vx + b.vy * b.vy + b.vz * b.vz);
      if (b.contact && sp > 0.01) {
        spinAxis.set(b.cny * b.vz - b.cnz * b.vy, b.cnz * b.vx - b.cnx * b.vz, b.cnx * b.vy - b.cny * b.vx);
        if (spinAxis.lengthSq() > 1e-8) { spinAxis.normalize(); spinRate = sp / P.R; }
      }
      q4.setFromAxisAngle(spinAxis, spinRate * dt); ball.quaternion.premultiply(q4);
      for (i = 0; i < ev.length; i++) {
        var e = ev[i];
        if (e.k === 'score') onScore(e.pts, e.hole);
        else if (e.k === 'gutter') { S.mode = 'wait'; ball.visible = false; emit('gutter'); later(0.7, nextBall); }
        else if (e.k === 'return') { S.balls++; S.mode = 'wait'; ball.visible = false; emit('return'); later(0.45, nextBall); }
        else emit('bounce', { kind: e.k, strength: e.s });
      }
    } else if (S.mode === 'sink' && b) {
      sinkT += dt;
      var h = P.holes[b.hole], kk = clamp(sinkT / 0.22, 0, 1); holeLocal(h, hw);
      ball.position.set(lerp(b.x, hw.x, kk), lerp(b.y, hw.y + P.CT * (P.R - 0.11 * kk), kk), lerp(b.z, hw.z + P.ST * (P.R - 0.11 * kk), kk));
      ball.scale.setScalar(1 - 0.25 * kk);
      if (sinkT > 0.26) ball.visible = false;
    }
    if (S.shown !== S.score) {
      var d = S.score - S.shown; S.shown += d * Math.min(1, dt * 12) + Math.sign(d) * 0.5;
      if ((d > 0 && S.shown > S.score) || (d < 0 && S.shown < S.score)) S.shown = S.score;
      redraw(dispTex);
    }
    var attract = S.mode === 'idle' || S.mode === 'over';
    for (i = 0; i < ringMats.length; i++) {
      ringFlash[i] = Math.max(0, ringFlash[i] - dt * 1.6);
      var pulse = attract ? Math.max(0, Math.sin(time * 4 - i * 0.9)) * 1.2 : 0.12 * Math.sin(time * 2 + i);
      ringMats[i].emissiveIntensity = 0.6 + pulse + ringFlash[i] * 3.5 * (0.6 + 0.4 * Math.sin(time * 40));
    }
    if (flashL) flashL.intensity = Math.max(0, flashL.intensity - dt * 6);
    updateParticles(dt);
  }

  refresh();
  return {
    group: group, state: S, physics: PHYS,
    startGame: startGame, update: update, throwBall: throwBall, flick: flick, setAim: setAim, aimWithRay: aimWithRay,
    redrawText: function () { redraw(boardTex); redraw(dispTex); },   // call once your web font has loaded
    on: function (name, fn) { (listeners[name] = listeners[name] || []).push(fn); return this; },
    off: function (name, fn) { listeners[name] = (listeners[name] || []).filter(function (f) { return f !== fn; }); return this; },
    dispose: function () { if (group.parent) group.parent.remove(group); disposables.forEach(function (d) { if (d.dispose) d.dispose(); }); }
  };
};
  // the arcade's window: the cabinet drawn by a renderer of its own (made when the window opens, dropped when it closes) onto the minigames' canvas
  SKEE.game=(o={})=>{ '@later'; const W=380, H=540, BK='skee-best', T=THREE;
    let R=null, K=null, sc=null, cam=null, cur=null; const rc=new T.Raycaster(), v2=new T.Vector2();
    const best=()=>+(OWNED.get(BK)||0)||0;
    const beep=(f,d=.08,ty='square',v=.05)=>{ const a=SFX.live&&SFX.live(); if(!a||!SFX.on)return; const os=a.createOscillator(), g=a.createGain(), t=a.currentTime; os.type=ty; os.frequency.setValueAtTime(f,t); g.gain.setValueAtTime(v,t); g.gain.exponentialRampToValueAtTime(.0001,t+d); os.connect(g); g.connect(SFX.out(a)); os.start(t); os.stop(t+d+.02); };
    const setup=()=>{ if(R)return; R=new T.WebGLRenderer({antialias:true}); R.setPixelRatio(1); R.setSize(W,H,false); R.outputColorSpace=T.SRGBColorSpace; R.toneMapping=T.ACESFilmicToneMapping; R.shadowMap.enabled=true;
      sc=new T.Scene(); sc.background=new T.Color(0x120a20); sc.add(new T.HemisphereLight(0xb8a0ff,0x201030,.9)); const d=new T.DirectionalLight(0xffffff,1.1); d.position.set(-1,3,2); sc.add(d);
      cam=new T.PerspectiveCamera(46,W/H,.05,30); cam.position.set(0,1.05,2.3); cam.lookAt(0,.2,-1.05);
      K=SKEE.make({lights:true,font:"bold sans-serif"}); sc.add(K.group);
      K.on('throw',()=>beep(180,.12,'triangle')).on('bounce',e=>beep(90+e.strength*40,.04,'sine',.03))
       .on('score',e=>{ beep(e.pts>=100?1040:420+e.pts*6,.18); if(cur)cur.line=`${e.pts}! · ${e.total} SO FAR · ${K.state.balls} BALL${K.state.balls===1?'':'S'} LEFT`; })
       .on('gutter',()=>{ beep(70,.25,'sawtooth',.04); if(cur)cur.line=`GUTTER · ${K.state.balls} BALL${K.state.balls===1?'':'S'} LEFT`; })
       .on('return',()=>{ if(cur)cur.line='TOO SOFT: IT ROLLS BACK. TRY AGAIN.'; })
       .on('gameover',e=>{ const S=cur; if(!S)return; const n=Math.floor(e.score/40), was=best(); if(e.score>was)OWNED.set(BK,String(e.score)); S.score=e.score; S.tickets=n; S.over=`${e.score} POINTS: ${n} TICKET${n===1?'':'S'}.${e.score>was&&was?' A NEW BEST!':''}`; }); };
    const drop=()=>{ if(!R)return; K.dispose(); R.dispose(); R.forceContextLoss(); R=K=sc=cam=null; cur=null; };
    const aim=S=>{ v2.set(S.mx/W*2-1,-(S.my/H*2-1)); rc.setFromCamera(v2,cam); K.aimWithRay(rc.ray); };
    return {title:'SKEE-BALL',w:W,h:H,again:true,help:'Drag the ball sideways to line up, flick upward and let go to roll: flick speed is power. Keys: ← → aim, hold Space to charge, let go to roll. The corner pockets pay 100; every 40 points is a ticket.',
      can:o.can,
      start:S=>{ if(o.pay)o.pay(); setup(); cur=S; S.trail=[]; S.pw=0; S.chg=false; S.line='GRAB THE BALL, FLICK UP, AND LET GO'; K.startGame(); },
      tick:(S,dt)=>{ S.t+=dt; const st=K.state, k=S.keys;
        if(st.mode==='aim'){
          if(S.press&&!k.has(' '))S.trail=[];
          if(S.down){ aim(S); S.trail.push([S.t,S.mx,S.my]); while(S.trail.length>2&&S.t-S.trail[0][0]>.12)S.trail.shift(); }
          if(S.release&&S.trail.length>1){ const a=S.trail[0], b=S.trail[S.trail.length-1], span=Math.max(.016,b[0]-a[0]); K.flick((a[2]-b[2])/H/span,(b[1]-a[1])/H/span); S.trail=[]; }
          const ax=(k.has('arrowright')||k.has('d')?1:0)-(k.has('arrowleft')||k.has('a')?1:0); if(ax)K.setAim(st.held.x+ax*.45*dt);
          if(k.has(' ')){ S.chg=true; S.pw=Math.min(1,S.pw+dt*.8); } else if(S.chg){ K.throwBall(2+S.pw*3.5,0); S.chg=false; S.pw=0; } }
        K.update(dt); },
      draw:(S,g)=>{ if(!R)return; if(S.over)K.update(1/60); R.render(sc,cam); g.drawImage(R.domElement,0,0,W,H);
        const st=K.state; g.font='bold 15px monospace'; g.textBaseline='top'; g.fillStyle='#21e6ff'; g.textAlign='left'; g.fillText('SCORE '+st.score,12,10); g.textAlign='right'; g.fillStyle='#ffe14a'; g.fillText('BEST '+Math.max(best(),S.over?st.score:0),W-12,10);
        g.textAlign='left'; g.fillStyle='#ffd9a6'; g.fillText('BALLS '+st.balls,12,30);
        if(S.chg){ g.fillStyle='rgba(0,0,0,.5)'; g.fillRect(W-26,H-212,14,200); g.fillStyle='#ff3fa4'; g.fillRect(W-26,H-12-S.pw*200,14,S.pw*200); g.fillStyle='#fff'; g.textAlign='right'; g.fillText('POWER',W-32,H-28); } },
      close:drop, quit:drop,
      end:S=>o.end&&o.end(S)}; };
}
export {SKEE};
