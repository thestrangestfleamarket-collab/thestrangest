// THE SPECKLED BAND's stage: each place built from boxes and painted cloth (no files), and the people as simple figures. You stand at 0,0 looking down -z.
import * as T from 'three';

const paint = (w, h, fn, rx = 1, ry = 1) => { const c = document.createElement('canvas'); c.width = w; c.height = h; fn(c.getContext('2d'), w, h); const x = new T.CanvasTexture(c); x.colorSpace = T.SRGBColorSpace; x.wrapS = x.wrapT = T.RepeatWrapping; x.repeat.set(rx, ry); return x; };
const rnd = (s => () => (s = (s * 16807) % 2147483647) / 2147483647)(1883);
const speck = (g, w, h, n, cols, max = 3) => { for (let i = 0; i < n; i++) { g.fillStyle = cols[i % cols.length]; g.globalAlpha = .08 + rnd() * .14; g.fillRect(rnd() * w, rnd() * h, 1 + rnd() * max, 1 + rnd() * max); } g.globalAlpha = 1; };
const TEX = {
  paper: (a, b) => paint(128, 128, (g, w, h) => { g.fillStyle = a; g.fillRect(0, 0, w, h); g.fillStyle = b; for (let x = 0; x < w; x += 32) { g.fillRect(x, 0, 3, h); for (let y = 16; y < h; y += 32) { g.beginPath(); g.arc(x + 17, y, 5, 0, 7); g.fill(); } } speck(g, w, h, 300, ['#000', '#fff']); }, 6, 3),
  planks: (a, b) => paint(128, 128, (g, w, h) => { g.fillStyle = a; g.fillRect(0, 0, w, h); for (let x = 0; x < w; x += 16) { g.fillStyle = b; g.fillRect(x, 0, 1.5, h); g.fillRect(x, (x * 37) % h, 16, 1.5); } speck(g, w, h, 500, ['#000', b], 6); }, 4, 4),
  stone: (a, b) => paint(128, 128, (g, w, h) => { g.fillStyle = a; g.fillRect(0, 0, w, h); g.strokeStyle = b; g.lineWidth = 2; for (let y = 0; y < h; y += 32) for (let x = (y / 32 % 2) * 32 - 32; x < w; x += 64) g.strokeRect(x, y, 64, 32); speck(g, w, h, 900, ['#000', '#fff', '#4a5a3a'], 5); }, 5, 3),
  grass: () => paint(128, 128, (g, w, h) => { g.fillStyle = '#4f6a36'; g.fillRect(0, 0, w, h); speck(g, w, h, 1600, ['#2c4420', '#6f8a48', '#8a9a50'], 3); }, 40, 40),
  plain: (a) => paint(64, 64, (g, w, h) => { g.fillStyle = a; g.fillRect(0, 0, w, h); speck(g, w, h, 260, ['#000', '#fff'], 4); }, 3, 2),
};
const L = (c, o = {}) => new T.MeshLambertMaterial({ color: c, ...o }), mat = m => typeof m === 'number' ? L(m) : m;
const box = (g, w, h, d, x, y, z, m) => { const b = new T.Mesh(new T.BoxGeometry(w, h, d), mat(m)); b.position.set(x, y, z); g.add(b); return b; };
const cyl = (g, r0, r1, h, x, y, z, m, seg = 12) => { const b = new T.Mesh(new T.CylinderGeometry(r0, r1, h, seg), mat(m)); b.position.set(x, y, z); g.add(b); return b; };
const glow = (g, w, h, x, y, z, c, ry = 0) => { const b = new T.Mesh(new T.PlaneGeometry(w, h), new T.MeshBasicMaterial({ color: c, fog: false })); b.position.set(x, y, z); b.rotation.y = ry; g.add(b); return b; };
const lamp = (g, c, i, x, y, z, d = 9) => { const l = new T.PointLight(c, i, d, 1.6); l.position.set(x, y, z); g.add(l); return l; };
// a room about you: w wide, d deep (z from +back to -d+back), h high
const room = (g, w, d, h, wall, floor, ceil, back = 1.6) => { const z = back - d / 2;
  const fl = new T.Mesh(new T.PlaneGeometry(w, d), L(0xffffff, { map: floor })); fl.rotation.x = -Math.PI / 2; fl.position.set(0, 0, z); g.add(fl);
  const ce = new T.Mesh(new T.PlaneGeometry(w, d), L(ceil)); ce.rotation.x = Math.PI / 2; ce.position.set(0, h, z); g.add(ce);
  const wm = L(0xffffff, { map: wall, side: T.BackSide }); const ws = new T.Mesh(new T.BoxGeometry(w, h, d), [wm, wm, L(0, { visible: false }), L(0, { visible: false }), wm, wm]); ws.position.set(0, h / 2, z); g.add(ws); return { x0: -w / 2, x1: w / 2, zb: back, zf: back - d }; };
const chair = (g, x, z, ry, c) => { const k = new T.Group(); box(k, .7, .42, .7, 0, .21, 0, c); box(k, .7, .6, .14, 0, .72, .28, c); box(k, .12, .3, .7, -.33, .5, 0, c); box(k, .12, .3, .7, .33, .5, 0, c); k.position.set(x, 0, z); k.rotation.y = ry; g.add(k); return k; };
const tree = (g, x, z, s = 1) => { cyl(g, .12 * s, .18 * s, 2.2 * s, x, 1.1 * s, z, 0x3a2c1e, 6); const c = new T.Mesh(new T.IcosahedronGeometry(1.5 * s, 0), L(0x3f5a2c, { flatShading: true })); c.position.set(x, 3 * s, z); c.scale.y = 1.2; g.add(c); };
const sky = (top, low) => { const g = new T.Mesh(new T.SphereGeometry(180, 16, 10), new T.MeshBasicMaterial({ side: T.BackSide, fog: false, map: paint(4, 128, (c, w, h) => { const gr = c.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, top); gr.addColorStop(.55, low); gr.addColorStop(1, low); c.fillStyle = gr; c.fillRect(0, 0, w, h); }) })); return g; };
const ground = g => { const m = new T.Mesh(new T.PlaneGeometry(300, 300), L(0xffffff, { map: TEX.grass() })); m.rotation.x = -Math.PI / 2; g.add(m); };
// the lived-in wing of Stoke Moran, its three windows towards you, at z
const wing = (g, z, night, lit = -1) => { const st = L(0xffffff, { map: TEX.stone('#8d897c', '#5d5a50') }); box(g, 13, 4.2, 4, 0, 2.1, z - 2, st); const rf = box(g, 13.6, 1.6, 4.6, 0, 4.9, z - 2, 0x4a4038); rf.scale.z = .8;
  box(g, 6, 7, 6, -9.5, 3.5, z - 3, st); box(g, 6.6, 2, 6.6, -9.5, 8, z - 3, 0x4a4038); [-3.6, 0, 3.6].forEach((x, n) => { box(g, 1.5, 1.9, .12, x, 1.7, z + .02, 0x2a241c); glow(g, 1.2, 1.6, x, 1.7, z + .09, n === lit ? 0xffd27a : night ? 0x0c0f16 : 0x39424a); box(g, 1.7, .12, .3, x, .7, z + .1, 0x77736a); });
  for (let x = 5.2; x < 7.4; x += 1) { cyl(g, .04, .04, 4.4, x, 2.2, z + .7, 0x6b5236, 5); } box(g, 2.6, .06, .7, 6.2, 2.2, z + .7, 0x6b5236); box(g, 2.6, .06, .7, 6.2, 3.8, z + .7, 0x6b5236); };

const SPOTS = { watson: [-1.6, -3], helen: [1.6, -3], roylott: [.4, -4.2], other: [1.1, -3.8] };

const BUILD = {
  baker(g) { const R = room(g, 6.4, 7.2, 3.2, TEX.paper('#5c2a26', '#7a3e33'), TEX.planks('#4a3423', '#2a1c12'), 0xd8cfb8);
    g.add(new T.AmbientLight(0xffe6c4, .55)); const fire = lamp(g, 0xff9a4a, 6, -2.5, .7, -1.6, 10); const day = lamp(g, 0xc8d8ff, 9, 2.6, 2, -1.2, 9);
    box(g, .5, 1.5, 2, R.x0 + .25, .75, -1.6, 0x2b2622); box(g, .7, .14, 2.3, R.x0 + .33, 1.55, -1.6, 0x3a2a1c); box(g, .3, .9, 1.1, R.x0 + .3, .5, -1.6, 0x0a0806); const fl = glow(g, .8, .5, R.x0 + .52, .32, -1.6, 0xff8a2a, Math.PI / 2);
    cyl(g, .015, .015, .9, R.x0 + .75, .45, -.7, 0x555860, 5).rotation.z = .12;
    glow(g, 1.3, 1.9, R.x1 - .02, 1.75, -1.2, 0xcfdcea, -Math.PI / 2); box(g, .08, 2.1, .1, R.x1 - .04, 1.75, -1.2, 0x2a1c12); box(g, .08, .1, 1.4, R.x1 - .04, 1.75, -1.2, 0x2a1c12); box(g, .16, 2.4, .5, R.x1 - .1, 1.7, -.3, 0x4a2222); box(g, .16, 2.4, .5, R.x1 - .1, 1.7, -2.1, 0x4a2222);
    chair(g, -2.3, -2.9, Math.PI / 2 - .3, 0x3f3026); chair(g, 2.45, -3, -Math.PI / 2 + .3, 0x4b2c26);
    cyl(g, .5, .5, .05, 0, .74, -4.3, 0x3a2a1c, 16); cyl(g, .06, .2, .74, 0, .37, -4.3, 0x3a2a1c, 8); cyl(g, .09, .07, .12, .15, .83, -4.3, 0xe8e4d8, 8); cyl(g, .16, .16, .02, -.15, .78, -4.2, 0xe8e4d8, 12);
    box(g, 1.7, 2.4, .35, -2.1, 1.2, R.zf + .2, 0x3a2a1c); for (let y = .35; y < 2.3; y += .46) for (let x = -2.8; x < -1.4; x += .09 + rnd() * .05) box(g, .06, .3 + rnd() * .08, .2, x, y + .15, R.zf + .34, [0x6a2a22, 0x2a4a3a, 0x3a3a5a, 0x7a6a3a][Math.floor(rnd() * 4)]);
    box(g, 1.05, 2.15, .08, 1.3, 1.08, R.zf + .05, 0x2e2118); cyl(g, .035, .035, .03, .95, 1.05, R.zf + .11, 0xc9a24a, 8).rotation.x = Math.PI / 2;
    const rug = new T.Mesh(new T.PlaneGeometry(3.4, 2.6), L(0xffffff, { map: TEX.paper('#6a3a2a', '#3a4a5a') })); rug.rotation.x = -Math.PI / 2; rug.position.set(0, .01, -2.2); g.add(rug);
    return { bg: new T.Color(0x1a120e), spots: { roylott: [1.1, -4.7] }, tick: t => { const f = .8 + .2 * Math.sin(t * 11) * Math.sin(t * 3.7); fire.intensity = 6 * f; fl.scale.y = .8 + .3 * f; day.intensity = 9; } }; },
  lane(g) { ground(g); g.add(sky('#7fa9d6', '#dfe7ea')); g.add(new T.HemisphereLight(0xdfeeff, 0x55683a, 1.5)); const s = new T.DirectionalLight(0xfff2d8, 1.6); s.position.set(-4, 8, 3); g.add(s);
    const rd = new T.Mesh(new T.PlaneGeometry(3.2, 120), L(0x8a7a5e)); rd.rotation.x = -Math.PI / 2; rd.rotation.z = .5; rd.position.set(-3, .01, -6); g.add(rd);
    for (let x = -1.6; x <= 1.6; x += 1.6) cyl(g, .05, .06, 1.1, x + 2.6, .55, -3.4, 0x6b5236, 6); box(g, 3.4, .07, .07, 2.6, .9, -3.4, 0x6b5236); box(g, 3.4, .07, .07, 2.6, .5, -3.4, 0x6b5236); box(g, .5, .06, .9, 2.6, .35, -3.4, 0x6b5236);
    for (let i = 0; i < 26; i++) { const a = rnd() * 6.28, r = 12 + rnd() * 50; tree(g, Math.cos(a) * r, Math.sin(a) * r - 8, .8 + rnd() * .9); }
    const hill = new T.Mesh(new T.SphereGeometry(30, 16, 8), L(0x4a6434)); hill.scale.y = .22; hill.position.set(6, -1, -60); g.add(hill); const st = 0x8d897c; box(g, 14, 5, 5, 6, 7.5, -62, st); box(g, 5, 8, 5, 6, 9, -62, st); box(g, 15, 1.4, 5.6, 6, 10.6, -62, 0x4a4038); for (let x = 0; x < 13; x += 3) tree(g, x, -54, 1.6);
    return { bg: new T.Color(0xdfe7ea), fog: new T.Fog(0xdfe7ea, 40, 170), spots: { helen: [1.2, -4.6], watson: [-1.6, -2.2] } }; },
  lawn(g) { ground(g); g.add(sky('#7fa9d6', '#dfe7ea')); g.add(new T.HemisphereLight(0xdfeeff, 0x55683a, 1.5)); const s = new T.DirectionalLight(0xfff2d8, 1.5); s.position.set(5, 8, 4); g.add(s); wing(g, -7, false);
    for (let i = 0; i < 16; i++) { const a = rnd() * 3.14, r = 18 + rnd() * 30; tree(g, Math.cos(a) * r, Math.sin(a) * r + 4, .9 + rnd()); }
    return { bg: new T.Color(0xdfe7ea), fog: new T.Fog(0xdfe7ea, 40, 170), spots: { helen: [1.7, -2.6] } }; },
  bedroom(g, night) { const R = room(g, 4.2, 4.8, 2.3, TEX.planks('#5a4028', '#33241a'), TEX.planks('#4e3a26', '#2a1c12'), 0x6a5a44, 1.3);
    g.add(new T.AmbientLight(night ? 0x5a6a9a : 0xfff0d8, night ? .22 : .7)); if (!night) lamp(g, 0xdfe8ff, 10, -1.2, 1.6, -3, 9);
    const bx = R.x1 - .55; box(g, .95, .5, 2, bx, .3, -2, 0x3a2a1c); box(g, .97, .14, 2.02, bx, .6, -2, 0xe8e4d8); box(g, .6, .12, .4, bx, .72, -2.75, 0xf4f1e6); box(g, .08, .06, .08, bx - .42, .03, -1.1, 0x555860); box(g, .08, .06, .08, bx - .42, .03, -2.9, 0x555860);
    cyl(g, .022, .022, 1.35, bx + .2, 1.42, -2.8, 0x8a2a22, 6); cyl(g, .05, .03, .14, bx + .2, .78, -2.8, 0xc9a24a, 6); box(g, .08, .05, .04, bx + .2, 2.1, -2.84, 0x555860);
    box(g, .04, .16, .22, R.x1 - .03, 2.12, -2.8, 0x0a0806); if (night) glow(g, .2, .13, R.x1 - .06, 2.12, -2.8, 0x3a1a0a, -Math.PI / 2);
    box(g, .9, .95, .45, R.x0 + .5, .48, R.zf + .3, 0x4a3423); box(g, .8, .75, .4, -.6, .38, R.zf + .25, 0x5a4530); box(g, .5, .5, .03, -.6, 1.05, R.zf + .12, 0x9aa6aa);
    glow(g, 1, 1.3, .5, 1.35, R.zf + .02, night ? 0x06080c : 0xcfdcea); box(g, .5, 1.36, .05, night ? .25 : -.28, 1.35, R.zf + .06, 0x33241a); box(g, .5, 1.36, .05, night ? .75 : 1.28, 1.35, R.zf + .06, 0x33241a); if (night) box(g, 1.05, .07, .07, .5, 1.35, R.zf + .1, 0x555860);
    box(g, .25, 1.1, 1.1, R.x0 + .13, .55, -1.6, 0x241c16); box(g, .3, 1, .9, R.x0 + .16, .5, -1.6, 0x050403);
    chair(g, -1.2, -.6, 2.4, 0xb89a5a).scale.setScalar(.7); const rug = new T.Mesh(new T.PlaneGeometry(2, 2), L(0x6a4a3a)); rug.rotation.x = -Math.PI / 2; rug.position.set(-.2, .01, -1.6); g.add(rug);
    return { bg: new T.Color(night ? 0x020306 : 0x1a140e), spots: { watson: [-1.3, -2.4], helen: [.1, -3], roylott: [-.5, -3.1] } }; },
  vigil(g) { return BUILD.bedroom(g, true); },
  roylott(g) { const R = room(g, 5, 5.2, 2.5, TEX.plain('#8a8270'), TEX.planks('#4e3a26', '#2a1c12'), 0x8a8270, 1.4); g.add(new T.AmbientLight(0xfff0d8, .6)); const lp = lamp(g, 0xffd9a0, 10, .3, 1.5, -2.4, 9);
    box(g, .85, .3, 1.9, R.x0 + .55, .35, -2.2, 0x6a6a52); box(g, .9, .05, 1.95, R.x0 + .55, .52, -2.2, 0x9a9684); cyl(g, .012, .012, .5, R.x0 + .98, .75, -1.3, 0x3a2a1c, 5); const loop = new T.Mesh(new T.TorusGeometry(.07, .008, 5, 14), L(0xb8a070)); loop.position.set(R.x0 + .98, .46, -1.3); g.add(loop);
    box(g, 1, .04, .22, -1.2, 1.5, R.zf + .13, 0x3a2a1c); for (let x = -1.65; x < -.78; x += .08) box(g, .05, .26, .16, x, 1.65, R.zf + .13, [0x5a2a22, 0x2a3a2a, 0x3a3a4a][Math.floor(rnd() * 3)]);
    chair(g, R.x0 + 1.5, -1.6, 1.2, 0x4a3a2e); box(g, .42, .04, .42, R.x1 - .3, .45, -2.6, 0x7a5c3a); box(g, .42, .5, .04, R.x1 - .11, .7, -2.6, 0x7a5c3a); for (const [a, b] of [[-.17, -.17], [.17, -.17], [-.17, .17], [.17, .17]]) cyl(g, .02, .02, .45, R.x1 - .3 + a, .22, -2.6 + b, 0x7a5c3a, 5);
    box(g, .04, .16, .22, R.x1 - .03, 2.2, -2.6, 0x0a0806);
    cyl(g, .45, .45, .04, .5, .72, -3.3, 0x4a3423, 14); cyl(g, .05, .16, .72, .5, .36, -3.3, 0x4a3423, 8);
    box(g, .8, 1.1, .7, 1.5, .55, R.zf + .45, 0x2c2f33); box(g, .06, .2, .04, 1.2, .6, R.zf + .82, 0xc9a24a); cyl(g, .09, .06, .025, 1.5, 1.115, R.zf + .5, 0xe8e4d8, 12); cyl(g, .075, .075, .006, 1.5, 1.127, R.zf + .5, 0xfffdf4, 12);
    return { bg: new T.Color(0x14100c), spots: { watson: [-1.5, -2], helen: [-.4, -3.2], roylott: [1.9, -2.6] }, tick: t => lp.intensity = 10 + Math.sin(t * 9) * .6 }; },
  inn(g) { const R = room(g, 4.6, 4.6, 2.5, TEX.plain('#7a6a54'), TEX.planks('#4a3423', '#2a1c12'), 0x5a4a38, 1.5); g.add(new T.AmbientLight(0xc8b8d8, .45)); lamp(g, 0xffb060, 5, -1.5, 1.2, -1, 7);
    glow(g, 2.4, 1.4, 0, 1.5, R.zf + .02, 0x3a3550); glow(g, 2.4, .5, 0, 1.05, R.zf + .03, 0x15181a); glow(g, .9, .28, .5, 1.36, R.zf + .04, 0x0c0e10); glow(g, .06, .05, .5, 1.3, R.zf + .05, 0xffd27a); glow(g, 2.4, .25, 0, 2.08, R.zf + .03, 0x6a4a5a);
    box(g, .07, 1.5, .07, 0, 1.5, R.zf + .06, 0x2a1c12); box(g, 2.5, .07, .07, 0, 1.5, R.zf + .06, 0x2a1c12); chair(g, -1.2, -2, .6, 0x4a3a2e); chair(g, 1.2, -2, -.6, 0x4a3a2e);
    return { bg: new T.Color(0x0e0c10), spots: { watson: [-1.3, -2.2] } }; },
  train(g) { const R = room(g, 2.6, 4, 2.2, TEX.plain('#5a4632'), TEX.planks('#4a3423', '#2a1c12'), 0xd8cfb8, 1.2); g.add(new T.AmbientLight(0xffffff, .8)); lamp(g, 0xfff0d0, 6, 0, 1.9, -1.4, 6);
    box(g, 2.4, .45, .6, 0, .25, R.zf + .4, 0x5a2a26); box(g, 2.4, .9, .14, 0, .95, R.zf + .12, 0x5a2a26); const w = [glow(g, 1.3, .8, R.x0 + .02, 1.4, -1.4, 0x9fc08a, Math.PI / 2), glow(g, 1.3, .8, R.x1 - .02, 1.4, -1.4, 0x9fc08a, -Math.PI / 2)];
    return { bg: new T.Color(0x1a140e), spots: { watson: [-.5, -2.3] }, tick: t => w.forEach(m => m.material.color.setHSL(.27, .3, .6 + .05 * Math.sin(t * 6))) }; },
  elsewhere(g) { const m = new T.Mesh(new T.CircleGeometry(30, 24), L(0x3a3a38)); m.rotation.x = -Math.PI / 2; g.add(m); g.add(new T.AmbientLight(0xb8c0d0, .5));
    cyl(g, .06, .09, 3.2, 2.2, 1.6, -3.4, 0x1c1c1c, 8); box(g, .3, .36, .3, 2.2, 3.35, -3.4, new T.MeshBasicMaterial({ color: 0xffd98a })); lamp(g, 0xffd98a, 30, 2.2, 3.2, -3.4, 14);
    return { bg: new T.Color(0x70757a), fog: new T.Fog(0x70757a, 3, 22) }; },
};
const made = {};
function PLACE(id) { if (!BUILD[id]) id = 'elsewhere'; if (!made[id]) { const g = new T.Group(); made[id] = { id, g, ...BUILD[id](g) }; if (id === 'inn') made[id].bg = new T.Color(0x0e0c10); } return made[id]; }

const LOOKS = {
  watson: { coat: 0x5a4632, legs: 0x2e2a26, skin: 0xe2b99a, hat: 'bowler', hatc: 0x2a2420, tash: 0x5a3a22, s: 1 },
  helen: { coat: 0x15151a, skin: 0xe8c8b4, hat: 'veil', hatc: 0x101014, skirt: true, hair: 0x8a8684, s: .93 },
  roylott: { coat: 0x1c1a18, legs: 0x4a4030, skin: 0xc9a060, hat: 'top', hatc: 0x0c0c0c, crop: true, s: 1.24, w: 1.25 },
  other: { coat: 0x5a5a52, legs: 0x3a3630, skin: 0xdcb596, hat: 'cap', hatc: 0x4a4438, s: .98 },
};
function plate(name) { const c = document.createElement('canvas'); c.width = 512; c.height = 96; const g = c.getContext('2d'); g.font = 'bold 44px Georgia,serif'; const w = Math.min(500, g.measureText(name).width + 48); g.fillStyle = 'rgba(29,26,20,.86)'; g.fillRect(256 - w / 2, 12, w, 72); g.fillStyle = '#ece3cc'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(name, 256, 50, 480);
  const s = new T.Sprite(new T.SpriteMaterial({ map: new T.CanvasTexture(c), transparent: true, depthTest: false, fog: false })); s.scale.set(.8, .15, 1); s.renderOrder = 5; return s; }
function figure(who, name) { const k = LOOKS[who] || LOOKS.other, g = new T.Group(), w = k.w || 1, toon = c => new T.MeshToonMaterial({ color: c });
  if (k.skirt) cyl(g, .13, .4, 1.02, 0, .51, 0, toon(k.coat), 14); else { cyl(g, .085, .1, .86, -.1, .43, 0, toon(k.legs), 8); cyl(g, .085, .1, .86, .1, .43, 0, toon(k.legs), 8); cyl(g, .2 * w, .25 * w, .5, 0, .98, 0, toon(k.coat), 12); }
  cyl(g, .19 * w, .17 * w, .5, 0, 1.25, 0, toon(k.coat), 12); const sh = new T.Mesh(new T.SphereGeometry(.2 * w, 12, 8), toon(k.coat)); sh.scale.y = .45; sh.position.y = 1.5; g.add(sh);
  for (const sx of [-1, 1]) { const a = cyl(g, .055, .05, .62, sx * .25 * w, 1.2, 0, toon(k.coat), 8); a.rotation.z = sx * .08; const h = new T.Mesh(new T.SphereGeometry(.05, 8, 6), toon(k.skin)); h.position.set(sx * .275 * w, .88, 0); g.add(h); }
  cyl(g, .05, .06, .1, 0, 1.56, 0, toon(k.skin), 8); const head = new T.Mesh(new T.SphereGeometry(.115, 14, 10), toon(k.skin)); head.position.y = 1.7; head.scale.set(.92, 1.08, 1); g.add(head);
  for (const sx of [-1, 1]) { const e = new T.Mesh(new T.SphereGeometry(.014, 6, 4), new T.MeshBasicMaterial({ color: 0x15100c })); e.position.set(sx * .042, 1.715, .102); g.add(e); }
  const nose = box(g, .022, .04, .03, 0, 1.685, .115, toon(k.skin)); nose.rotation.x = -.3;
  if (k.tash) box(g, .075, .018, .02, 0, 1.655, .108, toon(k.tash)); if (k.hair) { const h = new T.Mesh(new T.SphereGeometry(.12, 12, 8), toon(k.hair)); h.position.set(0, 1.73, -.025); g.add(h); }
  if (k.hat === 'bowler') { const c = new T.Mesh(new T.SphereGeometry(.118, 12, 8, 0, 6.3, 0, 1.6), toon(k.hatc)); c.position.y = 1.77; g.add(c); cyl(g, .165, .165, .014, 0, 1.775, 0, toon(k.hatc), 16); }
  if (k.hat === 'top') { cyl(g, .112, .108, .24, 0, 1.91, 0, toon(k.hatc), 14); cyl(g, .175, .175, .014, 0, 1.79, 0, toon(k.hatc), 16); }
  if (k.hat === 'cap') { const c = new T.Mesh(new T.SphereGeometry(.122, 12, 8, 0, 6.3, 0, 1.4), toon(k.hatc)); c.position.y = 1.76; c.scale.y = .6; g.add(c); box(g, .13, .012, .09, 0, 1.765, .12, toon(k.hatc)); }
  if (k.hat === 'veil') { const c = new T.Mesh(new T.SphereGeometry(.128, 12, 8, 0, 6.3, 0, 1.5), toon(k.hatc)); c.position.y = 1.76; c.scale.y = .7; g.add(c); cyl(g, .15, .15, .012, 0, 1.775, 0, toon(k.hatc), 16); const v = cyl(g, .13, .16, .3, 0, 1.6, -.04, new T.MeshBasicMaterial({ color: 0x101014, transparent: true, opacity: .35, side: T.DoubleSide }), 12); v.scale.z = .9; }
  if (k.crop) { const c = cyl(g, .012, .008, .7, .34 * w, .7, .12, toon(0x3a2a1c), 5); c.rotation.x = .9; }
  const body = new T.Group(); while (g.children.length) body.add(g.children[0]); body.scale.setScalar(k.s); g.add(body);
  const pl = plate(name); pl.position.y = 1.98 * k.s + (k.hat === 'top' ? .28 : .1); g.add(pl); g.userData = { plate: pl, ph: rnd() * 6, y0: 0, speaks: false }; return g; }

export { PLACE, figure, SPOTS };
