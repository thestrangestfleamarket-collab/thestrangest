// TENNIS in the clearing: a full hard court painted on the slab, a net, a racket and a match against the house on rally.js
import { makeRally } from './rally.js';
export function makeTennis(K) {
  const T = K.THREE, V3 = K.V3, HL = 11.885, HW = 4.115, DW = 5.485, SL = 6.40, g = new T.Group(); g.visible = false; K.scene.add(g);
  let map = null;
  function paint() { const S = 108, W = Math.round((K.FX * 2) * S), H = Math.round((K.FZ * 2) * S), c = K.cv(W, H), x = c.getContext('2d'); x.drawImage(K.courtMap.image, 0, 0);
    x.save(); x.translate(W / 2, H / 2); x.scale(S, S); x.globalAlpha = .93; x.fillStyle = '#2f5d43'; x.fillRect(-K.FX, -K.FZ, 2 * K.FX, 2 * K.FZ); x.fillStyle = '#2d5f8f'; x.fillRect(-DW, -HL, 2 * DW, 2 * HL); x.globalAlpha = 1;
    x.strokeStyle = '#f0eee6'; x.lineWidth = .05; x.strokeRect(-DW, -HL, 2 * DW, 2 * HL); x.strokeRect(-HW, -HL, 2 * HW, 2 * HL);
    x.beginPath(); for (const z of [-SL, SL]) { x.moveTo(-HW, z); x.lineTo(HW, z); } x.moveTo(0, -SL); x.lineTo(0, SL); for (const z of [-HL, HL]) { x.moveTo(0, z); x.lineTo(0, z - Math.sign(z) * .1); } x.stroke(); x.restore();
    const t = K.tex(c); return t; }
  // the net: a band, mesh, two posts and the centre strap
  { const nc = K.cv(64, 64), x = nc.getContext('2d'); x.strokeStyle = '#15171a'; x.lineWidth = 3; for (let i = 0; i <= 64; i += 16) { x.beginPath(); x.moveTo(i, 0); x.lineTo(i, 64); x.moveTo(0, i); x.lineTo(64, i); x.stroke(); }
    const geo = new T.PlaneGeometry(12.8, 1, 24, 1), p = geo.attributes.position; for (let i = 0; i < p.count; i++) { const X = p.getX(i), top = .914 + (1.07 - .914) * (X / 6.4) ** 2; p.setY(i, p.getY(i) > 0 ? top : 0.02); }
    const t = K.tex(nc, { rep: [12.8 / .09, 1 / .09] }); const net = new T.Mesh(geo, new T.MeshStandardMaterial({ map: t, transparent: true, side: T.DoubleSide, roughness: 1 })); g.add(net);
    const band = new T.Mesh(new T.PlaneGeometry(12.8, .06, 24, 1), new T.MeshStandardMaterial({ color: 0xf2f0e8, side: T.DoubleSide, roughness: .9 })); const bp = band.geometry.attributes.position; for (let i = 0; i < bp.count; i++) { const X = bp.getX(i); bp.setY(i, bp.getY(i) + .914 + (1.07 - .914) * (X / 6.4) ** 2 - .03); } g.add(band);
    for (const sx of [-6.4, 6.4]) K.tube(new V3(sx, 0, 0), new V3(sx, 1.09, 0), .04, K.galv, g); K.tube(new V3(0, 0, 0), new V3(0, .914, 0), .012, new T.MeshStandardMaterial({ color: 0xf2f0e8 }), g); }
  // in passthrough there is no slab: the court's lines are drawn on your floor
  const lines = new T.LineSegments(new T.BufferGeometry().setFromPoints([[-DW, -HL, DW, -HL], [-DW, HL, DW, HL], [-DW, -HL, -DW, HL], [DW, -HL, DW, HL], [-HW, -HL, -HW, HL], [HW, -HL, HW, HL], [-HW, -SL, HW, -SL], [-HW, SL, HW, SL], [0, -SL, 0, SL]].flatMap(([a, b, c, d]) => [new V3(a, .01, b), new V3(c, .01, d)])), new T.LineBasicMaterial({ color: 0xf0eee6 })); lines.visible = false; g.add(lines);
  const R = makeRally(K, { O: new V3(0, 0, 0), parent: K.scene, rules: 'tennis', games: 3, y0: 0, hw: HW, hl: HL, net: .914, netPost: 1.07, netW: 6.4, R: .0335, kd: .0204, km: 7.5e-4, e: .75, mu: .6, clear: .25, dT: .07,
    arNear: [2.4, 3.3], vmax: 46, vmaxR: 22, boost: 1.45, pitch: 1.9, reachP: 2.8, autoMove: true, autoAfter: .34, ballMat: new T.MeshStandardMaterial({ color: 0xd7e83a, roughness: .95 }), foeColor: 0xb8332b,
    racket: { L: .52, a: .16, b: .125, th: .012, grip: .017, e: .72, mu: .22, spin: .28, color: 0x1f6fd0, color2: 0xd03a2f },
    ai: { home: HL + .6, near: 2.5, wide: 1.5, reach: 1.7, high: 2.4, after: .34, hitY: 1.0, T: 1.45, spin: 45, tx: 3.0, tz0: 5.2, tz1: 10.2,
      levels: [{ speed: 4.2, miss: .12, aim: .6, pace: .92 }, { speed: 5.6, miss: .05, aim: .85, pace: 1 }, { speed: 7, miss: .02, aim: 1, pace: 1.1 }] },
    servePos: [1.4, HL + .3],   // a serve is from your right at an even score, into the box across the net; two tries
    serveIn: (p, by, even) => (K.mode === 'ar' && by === 'A') || Math.abs(p.z) <= SL + .04 && Math.abs(p.x) <= HW + .04 && p.x * (by === 'P' ? -1 : 1) * (even ? 1 : -1) >= -.04 && (by === 'P' ? p.z < 0 : p.z > 0),
    serveAim: (by, even, want) => { const sx = (by === 'P' ? -1 : 1) * (even ? 1 : -1), x = want == null ? .6 + Math.random() * 2.6 : Math.min(3.4, Math.max(.5, Math.abs(want))); return [sx * x, (by === 'P' ? -1 : 1) * (2.6 + Math.random() * 2.8)]; },
    board: (S, sc) => K.board(['YOU ' + S.games[0] + '   GAMES   ' + S.games[1] + ' HOUSE', sc, S.over ? 'MATCH OVER' : (S.server === 'P' ? 'YOUR SERVE' : 'HOUSE SERVES'), '']) });
  return { name: 'Tennis', help: 'click or <kbd>Space</kbd> swings: the ball goes where you look', touch: 'Tap <b>Shoot</b> to swing.', R, restart: R.restart, action: R.action, step: R.step, frame: R.frame, sim: R.sim,
    enter() { K.venue = 'clearing'; const ar = K.mode === 'ar'; lines.visible = ar; if (!ar) { if (!map) map = paint(); K.courtMat.map = map; } g.visible = true; K.BND.cx = K.BND.cz = 0; K.BND.x = K.FX - .4; K.BND.z = K.FZ - .4; K.rig.position.set(0, 0, HL + .3); R.setOn(true); },
    leave() { g.visible = false; R.setOn(false); K.courtMat.map = K.courtMap; } };
}
