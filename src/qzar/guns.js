// SLOWFIRE DUEL's weapons: each gun's own model (forward is -z, the grip at the origin), the shield, the shots and the glow they share
import * as THREE from 'three';

const WCOL = { pip: 0xffd166, needle: 0xdff3ff, scatter: 0xb388ff, drifter: 0x7cffb2, buckler: 0x9ad0ff };
const OFF = 0x1a2036, H = Math.PI / 2;
const mats = []; let env = null;
const metal = (c, o = {}) => { const m = new THREE.MeshStandardMaterial({ color: c, metalness: .78, roughness: .36, envMap: env, envMapIntensity: .8, ...o }); mats.push(m); return m; };
function setEnv(t, skin) {
  env = t; for (const m of mats) { m.envMap = t; m.needsUpdate = true; }
  for (const m of [steel, dark]) { m.normalMap = skin.normalMap; m.normalScale = new THREE.Vector2(.6, .6); m.roughnessMap = skin.roughnessMap; m.roughness = .9; }
}
const steel = metal(0x33405f), dark = metal(0x161c30, { roughness: .55 }), bright = metal(0xb4c0e0, { roughness: .2 });
const rubber = new THREE.MeshStandardMaterial({ color: 0x0b0e18, metalness: .05, roughness: .92 });
const lit = c => new THREE.MeshBasicMaterial({ color: c });
const cell = c => metal(c, { emissive: c, emissiveIntensity: .55, roughness: .3 });
const box = (w, h, d) => new THREE.BoxGeometry(w, h, d), cyl = (a, b, h, n = 18) => new THREE.CylinderGeometry(a, b, h, n);
const tor = (r, t, n = 28) => new THREE.TorusGeometry(r, t, 8, n), ball = (r, n = 20) => new THREE.SphereGeometry(r, n, Math.ceil(n * .7));
function put(g, geo, mat, x = 0, y = 0, z = 0, rx = 0, ry = 0, rz = 0) { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.rotation.set(rx, ry, rz); g.add(m); return m; }

const glowTex = (() => {
  const c = document.createElement('canvas'); c.width = c.height = 64; const x = c.getContext('2d'), g = x.createRadialGradient(32, 32, 0, 32, 32, 32);
  g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(.25, 'rgba(255,255,255,.55)'); g.addColorStop(1, 'rgba(255,255,255,0)');
  x.fillStyle = g; x.fillRect(0, 0, 64, 64); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
})();
function halo(col, size) {
  const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, color: col, blending: THREE.AdditiveBlending, depthWrite: false, transparent: true }));
  s.scale.setScalar(size); return s;
}

function grip(g, z = .035) {
  put(g, box(.03, .09, .038), rubber, 0, -.052, z, .32);
  put(g, tor(.017, .003, 14), dark, 0, -.024, z - .04, 0, H, 0);
  put(g, box(.005, .02, .006), bright, 0, -.022, z - .036, -.25);
}
function pips(g, n, col, at) {
  const list = []; for (let i = 0; i < n; i++) list.push(at(i, lit(col)));
  g.userData.setAmmo = k => list.forEach((m, i) => m.material.color.setHex(i < k ? col : OFF));
}
const screw = (g, x, y, z) => put(g, cyl(.0035, .0035, .004, 8), bright, x, y, z, 0, 0, H);

const BUILD = {
  pip(g, c) {
    put(g, box(.036, .042, .17), steel, 0, .012, -.05);
    put(g, box(.038, .004, .13), dark, 0, .0, -.05); put(g, box(.038, .004, .13), dark, 0, .024, -.05);
    put(g, box(.014, .009, .15), dark, 0, .0375, -.05);
    for (let i = 0; i < 5; i++) put(g, box(.039, .014, .005), dark, 0, .012, .012 - i * .011, 0, 0, .5);
    put(g, cyl(.0115, .0115, .05), bright, 0, .014, -.158, H); put(g, cyl(.015, .015, .012), dark, 0, .014, -.14, H);
    put(g, tor(.0135, .003), lit(c), 0, .014, -.184);
    put(g, box(.022, .018, .07), cell(c), 0, -.013, -.085); put(g, box(.026, .005, .074), dark, 0, -.023, -.085);
    put(g, box(.006, .01, .006), bright, 0, .046, -.122); put(g, box(.016, .008, .005), bright, 0, .045, .026);
    for (const x of [-.019, .019]) { screw(g, x, .012, .022); screw(g, x, .012, -.118); }
    pips(g, 6, c, (i, m) => put(g, box(.009, .004, .013), m, 0, .0425, -.108 + i * .021));
    grip(g); return new THREE.Vector3(0, .014, -.19);
  },
  needle(g, c) {
    put(g, box(.032, .048, .13), steel, 0, .012, -.02); put(g, box(.034, .006, .1), dark, 0, .012, -.02);
    for (const x of [-.0115, .0115]) { put(g, box(.006, .012, .36), bright, x, .018, -.25); put(g, box(.004, .02, .05), dark, x, .018, -.12); }
    put(g, cyl(.0035, .0035, .37, 8), lit(c), 0, .018, -.255, H);
    for (let i = 0; i < 7; i++) put(g, tor(.0165, .0026, 18), i % 2 ? dark : steel, 0, .018, -.11 - i * .045);
    put(g, cyl(.013, .013, .08), dark, 0, .058, -.03, H); put(g, cyl(.016, .013, .014), dark, 0, .058, -.076, H);
    put(g, new THREE.CircleGeometry(.0125, 18), lit(c), 0, .058, -.0835, 0, Math.PI, 0);
    put(g, box(.008, .014, .012), steel, 0, .042, -.05); put(g, box(.008, .014, .012), steel, 0, .042, -.008);
    put(g, box(.022, .034, .11), dark, 0, .004, .1); put(g, box(.03, .05, .012), rubber, 0, .004, .158); put(g, box(.012, .012, .09), steel, 0, .027, .09);
    for (const r of [0, H]) put(g, box(.003, .034, .03), bright, 0, .018, -.42, 0, 0, r);
    pips(g, 3, c, (i, m) => put(g, cyl(.0075, .0075, .022, 12), m, .021, .012, -.055 + i * .03));
    for (let i = 0; i < 3; i++) put(g, cyl(.009, .009, .004, 12), dark, .021, .024, -.055 + i * .03);
    grip(g); return new THREE.Vector3(0, .018, -.435);
  },
  scatter(g, c) {
    put(g, box(.052, .052, .14), steel, 0, .012, -.03); put(g, box(.054, .005, .11), dark, 0, .012, -.03);
    put(g, cyl(.036, .036, .058, 22), dark, 0, -.004, -.02, 0, 0, H);
    for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4; put(g, cyl(.006, .006, .06, 8), bright, 0, -.004 + Math.sin(a) * .024, -.02 + Math.cos(a) * .024, 0, 0, H); }
    for (let i = -2; i <= 2; i++) {
      const p = new THREE.Group(); p.position.set(0, .014, -.095); p.rotation.y = -i * .12; g.add(p);
      put(p, cyl(.011, .0095, .13), bright, 0, 0, -.065, H); put(p, tor(.0115, .0028, 16), lit(c), 0, 0, -.131); put(p, cyl(.013, .013, .012), dark, 0, 0, -.03, H);
    }
    put(g, box(.13, .006, .05), dark, 0, .032, -.185); put(g, box(.13, .006, .05), dark, 0, -.004, -.185);
    put(g, cyl(.016, .016, .07, 12), rubber, 0, -.03, -.115, H); for (let i = 0; i < 4; i++) put(g, tor(.0165, .002, 12), dark, 0, -.03, -.09 - i * .017);
    put(g, box(.03, .012, .06), cell(c), 0, .044, -.03);
    pips(g, 2, c, (i, m) => put(g, box(.016, .006, .024), m, -.011 + i * .022, .052, -.03));
    for (const x of [-.027, .027]) { screw(g, x, .012, .03); screw(g, x, .012, -.09); }
    grip(g); return new THREE.Vector3(0, .014, -.23);
  },
  drifter(g, c) {
    put(g, cyl(.023, .028, .1), steel, 0, .014, -.015, H); put(g, cyl(.03, .03, .012), dark, 0, .014, .03, H);
    put(g, tor(.031, .0065), bright, 0, .014, -.07); put(g, tor(.026, .003), lit(c), 0, .014, -.078);
    for (let k = 0; k < 3; k++) {
      const p = new THREE.Group(); p.position.set(0, .014, 0); p.rotation.z = k * Math.PI * 2 / 3; g.add(p);
      put(p, box(.01, .013, .09), steel, 0, .043, -.105, -.28); put(p, box(.009, .012, .05), bright, 0, .05, -.165, .5); put(p, box(.012, .008, .02), lit(c), 0, .046, -.12, -.28);
    }
    const orb = put(g, ball(.03), new THREE.MeshBasicMaterial({ color: c, transparent: true, opacity: .85 }), 0, .014, -.14);
    const r1 = put(g, tor(.04, .002), lit(c), 0, .014, -.14), r2 = put(g, tor(.045, .0015), lit(0xffffff), 0, .014, -.14, H);
    const h = halo(c, .16); h.position.set(0, .014, -.14); g.add(h);
    put(g, cyl(.011, .011, .07, 12), cell(c), 0, -.014, -.03, H); put(g, box(.004, .02, .004), dark, 0, 0, -.06);
    g.userData.setAmmo = k => { orb.visible = r1.visible = r2.visible = h.visible = k > 0; };
    g.userData.tick = t => { r1.rotation.x = t * 2.2; r2.rotation.y = t * 1.6; orb.scale.setScalar(1 + Math.sin(t * 5) * .06); };
    grip(g); return new THREE.Vector3(0, .014, -.19);
  },
  buckler(g, c) {
    put(g, cyl(.015, .015, .1, 12), rubber, 0, -.03, 0); for (let i = 0; i < 4; i++) put(g, tor(.0155, .002, 12), dark, 0, -.065 + i * .022, 0, H);
    put(g, cyl(.042, .042, .016, 6), steel, 0, .03, -.03, H); put(g, cyl(.03, .03, .02, 6), dark, 0, .03, -.034, H);
    put(g, tor(.024, .004), lit(c), 0, .03, -.046); put(g, new THREE.CircleGeometry(.018, 6), lit(c), 0, .03, -.0445, 0, Math.PI, 0);
    for (let k = 0; k < 3; k++) { const p = new THREE.Group(); p.position.set(0, .03, -.03); p.rotation.z = k * Math.PI * 2 / 3 + .5; g.add(p); put(p, box(.008, .03, .01), bright, 0, .05, 0); }
    g.userData.setAmmo = () => {}; return new THREE.Vector3(0, .03, -.05);
  }
};
Object.assign(WCOL, { twin: 0xffb347, lobber: 0xff8a5c, ricochet: 0x6fe3ff, seeker: 0xff5fa2, wall: 0xf4f06a, pillar: 0x8cf46a, ring: 0x5cf0d0, burst: 0xffa14a, charger: 0x9f8cff, mine: 0xff6b6b, splitter: 0x7ad7ff, spiral: 0xe58cff,
  beam: 0xff4d6d, breaker: 0xd9a066, freezer: 0xbfe9ff, leech: 0x9be36a, boomerang: 0xffe08a, curtain: 0xa0b4ff, decoy: 0xc8c8d8, mirror: 0xf2f6ff });
const body = (g, w, h, d, z = -.04) => put(g, box(w, h, d), steel, 0, .014, z);
const tube = (g, r, l, x, y, z, mat = bright) => put(g, cyl(r, r, l), mat, x, y, z - l / 2, H);
Object.assign(BUILD, {
  twin(g, c) {
    body(g, .075, .04, .15); put(g, box(.06, .008, .11), dark, 0, .038, -.04);
    for (const x of [-.021, .021]) { tube(g, .011, .12, x, .014, -.1); put(g, tor(.013, .003), lit(c), x, .014, -.222); put(g, cyl(.015, .015, .012), dark, x, .014, -.13, H); }
    put(g, box(.012, .02, .1), cell(c), 0, .014, -.16);
    pips(g, 8, c, (i, m) => put(g, box(.008, .004, .012), m, i < 4 ? -.02 : .02, .044, -.075 + (i % 4) * .022));
    grip(g); return new THREE.Vector3(0, .014, -.225);
  },
  lobber(g, c) {
    put(g, cyl(.04, .046, .16, 20), steel, 0, .03, -.085, H); put(g, tor(.042, .008), lit(c), 0, .03, -.168); put(g, cyl(.05, .05, .02, 20), dark, 0, .03, -.01, H);
    put(g, box(.03, .03, .1), dark, 0, -.008, -.07); for (const z of [-.04, -.1]) put(g, tor(.046, .004), bright, 0, .03, z);
    pips(g, 3, c, (i, m) => put(g, ball(.016, 10), m, 0, .078, -.04 - i * .04));
    grip(g); return new THREE.Vector3(0, .03, -.17);
  },
  ricochet(g, c) {
    put(g, box(.11, .024, .17), steel, 0, .014, -.07); put(g, box(.09, .006, .012), lit(c), 0, .014, -.156); for (const x of [-.058, .058]) put(g, box(.008, .034, .15), dark, x, .014, -.07);
    put(g, cyl(.04, .04, .004, 20), dark, 0, .028, -.07);
    pips(g, 4, c, (i, m) => put(g, cyl(.034, .034, .005, 20), m, 0, .034 + i * .008, -.07));
    grip(g); return new THREE.Vector3(0, .014, -.16);
  },
  seeker(g, c) {
    body(g, .048, .08, .13); for (const y of [.034, -.006]) { tube(g, .017, .1, 0, y, -.08, dark); put(g, tor(.018, .003), bright, 0, y, -.18); }
    put(g, cyl(.002, .002, .06, 6), bright, 0, .085, -.02); put(g, tor(.02, .003), lit(c), 0, .115, -.02, H); for (const x of [-.03, .03]) put(g, box(.004, .05, .06), bright, x, .014, .0, 0, 0, x > 0 ? -.4 : .4);
    pips(g, 2, c, (i, m) => put(g, ball(.012, 10), m, 0, i ? -.006 : .034, -.176));
    grip(g); return new THREE.Vector3(0, .014, -.19);
  },
  wall(g, c) {
    body(g, .04, .04, .13); put(g, box(.26, .022, .03), bright, 0, .02, -.125); put(g, box(.24, .008, .006), lit(c), 0, .02, -.142);
    for (const x of [-.09, .09]) { put(g, box(.006, .006, .09), dark, x * .5, .02, -.08, 0, x > 0 ? -.5 : .5, 0); put(g, box(.012, .04, .04), dark, x * 1.42, .02, -.125); }
    pips(g, 1, c, (i, m) => put(g, box(.02, .006, .03), m, 0, .037, -.04));
    grip(g); return new THREE.Vector3(0, .02, -.145);
  },
  pillar(g, c) {
    body(g, .04, .04, .13); put(g, box(.022, .26, .03), bright, 0, .08, -.125); put(g, box(.008, .24, .006), lit(c), 0, .08, -.142);
    put(g, box(.04, .012, .04), dark, 0, .212, -.125); put(g, box(.04, .012, .04), dark, 0, -.052, -.125); put(g, box(.006, .006, .08), dark, 0, .06, -.08, .6);
    pips(g, 1, c, (i, m) => put(g, box(.006, .03, .02), m, .022, .014, -.04));
    grip(g); return new THREE.Vector3(0, .05, -.145);
  },
  ring(g, c) {
    put(g, cyl(.02, .026, .1), steel, 0, .014, -.03, H); put(g, tor(.062, .008), bright, 0, .03, -.125); put(g, tor(.046, .004), lit(c), 0, .03, -.125);
    for (let k = 0; k < 3; k++) { const a = k * Math.PI * 2 / 3 + .5; put(g, box(.006, .006, .07), dark, Math.cos(a) * .04, .022 + Math.sin(a) * .04, -.09, Math.sin(a) * .35, -Math.cos(a) * .35, 0); }
    pips(g, 2, c, (i, m) => put(g, tor(.014, .003, 14), m, 0, .014, .01 + i * .014));
    grip(g); return new THREE.Vector3(0, .03, -.13);
  },
  burst(g, c) {
    body(g, .034, .075, .15); for (let i = 0; i < 3; i++) { tube(g, .008, .09, 0, -.008 + i * .022, -.1); put(g, tor(.009, .002, 12), lit(c), 0, -.008 + i * .022, -.192); }
    put(g, box(.03, .06, .04), dark, 0, -.045, -.085, -.15); put(g, box(.036, .006, .12), dark, 0, .054, -.04);
    pips(g, 3, c, (i, m) => put(g, box(.036, .008, .016), m, 0, -.008 + i * .022, -.04));
    grip(g); return new THREE.Vector3(0, .014, -.195);
  },
  charger(g, c) {
    body(g, .036, .04, .1, -.01); tube(g, .012, .17, 0, .016, -.05); put(g, cyl(.03, .03, .05, 16), cell(c), 0, .016, .03, H);
    const coils = []; for (let i = 0; i < 5; i++) coils.push(put(g, tor(.017 + i * .003, .003, 18), lit(c), 0, .016, -.08 - i * .03));
    pips(g, 3, c, (i, m) => put(g, box(.008, .004, .014), m, 0, .038, -.03 + i * .02));
    g.userData.tick = t => coils.forEach((m, i) => m.scale.setScalar(1 + .12 * Math.sin(t * 9 - i)));
    grip(g); return new THREE.Vector3(0, .016, -.225);
  },
  mine(g, c) {
    put(g, cyl(.05, .03, .09, 18), steel, 0, .02, -.06, H); put(g, tor(.05, .005), bright, 0, .02, -.105); body(g, .034, .034, .06, .02);
    const m0 = put(g, new THREE.IcosahedronGeometry(.03), dark, 0, .02, -.09), m1 = put(g, new THREE.OctahedronGeometry(.045), lit(c), 0, .02, -.09); m1.scale.setScalar(.55);
    pips(g, 2, c, (i, m) => put(g, ball(.01, 8), m, i ? .018 : -.018, .045, .02));
    const lights = g.userData.setAmmo; g.userData.setAmmo = k => { lights(k); m0.visible = m1.visible = k > 0; };
    g.userData.tick = t => { m0.rotation.y = t * 2; m1.rotation.x = t * 3; };
    grip(g); return new THREE.Vector3(0, .02, -.12);
  },
  splitter(g, c) {
    body(g, .036, .04, .12); tube(g, .012, .06, 0, .014, -.1);
    for (const k of [-1, 0, 1]) { const p = new THREE.Group(); p.position.set(0, .014, -.16); p.rotation.y = -k * .4; g.add(p); put(p, cyl(.007, .009, .07), bright, 0, 0, -.035, H); put(p, tor(.009, .002, 12), lit(c), 0, 0, -.072); }
    put(g, ball(.018, 12), cell(c), 0, .014, -.16);
    pips(g, 2, c, (i, m) => put(g, box(.01, .004, .02), m, 0, .037, -.03 - i * .03));
    grip(g); return new THREE.Vector3(0, .014, -.235);
  },
  spiral(g, c) {
    body(g, .034, .04, .1, -.01); tube(g, .009, .19, 0, .016, -.05);
    for (let i = 0; i < 12; i++) { const a = i * .9; put(g, ball(.006, 8), lit(c), Math.cos(a) * .019, .016 + Math.sin(a) * .019, -.07 - i * .014); }
    put(g, tor(.02, .004), bright, 0, .016, -.245);
    pips(g, 4, c, (i, m) => put(g, box(.008, .004, .012), m, 0, .038, -.035 + i * .017));
    grip(g); return new THREE.Vector3(0, .016, -.25);
  },
  beam(g, c) {
    body(g, .03, .04, .11, -.01); tube(g, .011, .24, 0, .016, -.05); put(g, ball(.02, 14), lit(c), 0, .016, -.3); put(g, cyl(.02, .014, .03), dark, 0, .016, -.28, H);
    for (let i = 0; i < 6; i++) put(g, box(.05, .03, .004), dark, 0, .016, -.1 - i * .025); put(g, box(.026, .03, .07), cell(c), 0, -.02, -.03);
    pips(g, 2, c, (i, m) => put(g, box(.008, .004, .02), m, 0, .038, -.02 - i * .03));
    grip(g); return new THREE.Vector3(0, .016, -.32);
  },
  breaker(g, c) {
    body(g, .072, .072, .14); put(g, cyl(.03, .03, .08, 14), dark, 0, .014, -.15, H); put(g, box(.09, .056, .022), bright, 0, .014, -.195); put(g, box(.06, .02, .024), lit(c), 0, .014, -.196);
    for (const x of [-.037, .037]) { screw(g, x, .035, .01); screw(g, x, -.008, .01); screw(g, x, .035, -.09); screw(g, x, -.008, -.09); }
    pips(g, 2, c, (i, m) => put(g, box(.022, .008, .04), m, i ? .018 : -.018, .054, -.04));
    grip(g); return new THREE.Vector3(0, .014, -.21);
  },
  freezer(g, c) {
    body(g, .034, .04, .09, -.01); put(g, cyl(.012, .034, .09, 14), bright, 0, .016, -.1, H); put(g, cyl(.028, .028, .11, 14), cell(c), 0, .062, -.01, H); put(g, cyl(.004, .004, .05, 6), dark, 0, .04, -.06, .9);
    for (let k = 0; k < 4; k++) { const a = k * Math.PI / 2; const m = put(g, new THREE.OctahedronGeometry(.012), lit(c), Math.cos(a) * .03, .016 + Math.sin(a) * .03, -.15); m.scale.z = 2.2; }
    pips(g, 2, c, (i, m) => put(g, ball(.009, 8), m, .03, .062, -.03 + i * .04));
    grip(g); return new THREE.Vector3(0, .016, -.16);
  },
  leech(g, c) {
    put(g, ball(.042, 16), dark, 0, .02, -.03); put(g, cyl(.01, .018, .1, 12), steel, 0, .02, -.11, H); put(g, tor(.014, .004, 14), lit(c), 0, .02, -.162);
    for (const x of [-.04, .04]) put(g, ball(.022, 12), cell(c), x, .03, -.02); put(g, new THREE.TorusGeometry(.03, .004, 6, 14, Math.PI), bright, 0, .05, -.03, 0, H, 0);
    pips(g, 3, c, (i, m) => put(g, ball(.007, 8), m, 0, .034, -.08 - i * .022));
    grip(g); return new THREE.Vector3(0, .02, -.165);
  },
  boomerang(g, c) {
    body(g, .03, .034, .1, -.01); put(g, cyl(.006, .006, .05, 8), bright, 0, .05, -.05);
    const blade = new THREE.Group(); blade.position.set(0, .078, -.05); g.add(blade);
    for (const k of [-1, 1]) { put(blade, box(.15, .01, .036), bright, k * .058, 0, -.02, 0, k * .6, 0); put(blade, box(.14, .004, .008), lit(c), k * .062, 0, -.04, 0, k * .6, 0); }
    g.userData.setAmmo = k => { blade.visible = k > 0; }; g.userData.tick = t => { blade.rotation.y = t * 4; };
    grip(g); return new THREE.Vector3(0, .078, -.1);
  },
  curtain(g, c) {
    body(g, .04, .04, .11); put(g, box(.22, .15, .014), dark, 0, .05, -.125); put(g, box(.23, .008, .02), bright, 0, .128, -.125); put(g, box(.23, .008, .02), bright, 0, -.028, -.125);
    for (let x = 0; x < 4; x++) for (let y = 0; y < 3; y++) put(g, ball(.009, 8), lit(c), -.075 + x * .05, .005 + y * .045, -.134);
    pips(g, 1, c, (i, m) => put(g, box(.02, .006, .03), m, 0, .037, -.03));
    grip(g); return new THREE.Vector3(0, .05, -.14);
  },
  decoy(g, c) {
    put(g, box(.13, .036, .12), steel, 0, .014, -.05); for (let i = 0; i < 4; i++) { tube(g, .009, .06, -.045 + i * .03, .014, -.11); put(g, tor(.01, .002, 12), lit(c), -.045 + i * .03, .014, -.172); }
    put(g, box(.1, .008, .08), dark, 0, .036, -.05); for (const x of [-.02, .02]) put(g, new THREE.CircleGeometry(.008, 10), lit(c), x, .041, -.05, -H);
    pips(g, 2, c, (i, m) => put(g, box(.03, .005, .014), m, i ? .03 : -.03, .041, -.085));
    grip(g); return new THREE.Vector3(0, .014, -.175);
  },
  mirror(g, c) {
    put(g, cyl(.015, .015, .1, 12), rubber, 0, -.03, 0); put(g, cyl(.05, .05, .008, 24), bright, 0, .03, -.03, H); put(g, tor(.05, .005), lit(c), 0, .03, -.036); put(g, cyl(.02, .03, .02, 12), steel, 0, .03, -.018, H);
    g.userData.setAmmo = () => {}; return new THREE.Vector3(0, .03, -.05);
  }
});
function makeGun(key) {
  const g = new THREE.Group(); g.userData.muzzle = BUILD[key](g, WCOL[key]); return g;
}

const hexTex = (() => {
  const c = document.createElement('canvas'); c.width = c.height = 256; const x = c.getContext('2d'), R = 17, w = R * Math.sqrt(3);
  x.strokeStyle = '#fff'; x.lineWidth = 2;
  for (let row = -1; row < 12; row++) for (let col = -1; col < 10; col++) {
    const cx = col * w + (row % 2 ? w / 2 : 0), cy = row * R * 1.5, d = Math.hypot(cx - 128, cy - 128) / 128; if (d > 1.05) continue;
    x.globalAlpha = .25 + .75 * d * d; x.beginPath(); for (let k = 0; k < 6; k++) { const a = Math.PI / 6 + k * Math.PI / 3; x[k ? 'lineTo' : 'moveTo'](cx + R * Math.cos(a), cy + R * Math.sin(a)); } x.closePath(); x.stroke();
  }
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
})();
function makeShield(col) {
  const g = new THREE.Group(), add = { blending: THREE.AdditiveBlending, depthWrite: false, transparent: true, side: THREE.DoubleSide };
  const face = put(g, new THREE.CircleGeometry(.32, 40), new THREE.MeshBasicMaterial({ map: hexTex, color: col, ...add }));
  const fill = put(g, new THREE.CircleGeometry(.32, 40), new THREE.MeshBasicMaterial({ color: col, opacity: .12, ...add }));
  const rim = put(g, tor(.32, .008, 48), new THREE.MeshBasicMaterial({ color: col, transparent: true }));
  const gauge = put(g, new THREE.RingGeometry(.34, .375, 48), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: .9, side: THREE.DoubleSide, depthWrite: false })); let step = -1;
  let mir = false;
  g.userData.kind = mirror => { mir = mirror; face.material.color.set(mirror ? 0xf2f6ff : col); fill.material.color.set(col); rim.material.color.set(mirror ? 0xffffff : col); fill.material.opacity = mirror ? .3 : .12; };
  g.userData.tone = c => { col = c; g.userData.kind(mir); };
  g.userData.life = f => {                           // the bright arc round the rim is the power left
    f = Math.max(0, Math.min(1, f)); const n = Math.ceil(f * 30);
    if (n !== step) { step = n; gauge.geometry.dispose(); gauge.geometry = new THREE.RingGeometry(.34, .375, 48, 1, Math.PI / 2, Math.max(.001, n / 30 * Math.PI * 2)); gauge.material.color.setHex(f > .5 ? 0xffffff : f > .25 ? 0xffd166 : 0xff5a4d); }
    face.material.opacity = .3 + .7 * f; fill.material.opacity = .04 + .1 * f; rim.material.opacity = .35;
  };
  return g;
}

function makeShot(key, col) {
  const g = new THREE.Group(), core = new THREE.Color(col).lerp(new THREE.Color(0xffffff), .65), soft = o => new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: o, depthWrite: false });
  const spin = (m, x, y, z) => { g.userData.tick = dt => { m.rotation.x += dt * x; m.rotation.y += dt * y; m.rotation.z += dt * z; }; };
  const bolt = (r, tail, glow) => { put(g, ball(r), lit(core)); put(g, cyl(.004, r * .7, tail, 10), soft(.5), 0, 0, -tail * .55, H); g.add(halo(col, glow)); };
  if (key === 'needle') { put(g, cyl(.004, .014, .34, 10), lit(core), 0, 0, 0, H); put(g, cyl(.002, .022, .2, 10), soft(.45), 0, 0, -.08, H); g.add(halo(col, .22)); }
  else if (key === 'scatter' || key === 'shard' || key === 'splitter') { const m = put(g, new THREE.OctahedronGeometry(key === 'splitter' ? .07 : .045), lit(core)); g.add(halo(col, key === 'splitter' ? .4 : .26)); spin(m, 0, 0, 9); }
  else if (key === 'drifter') {
    put(g, ball(.28, 28), soft(.28)); put(g, ball(.1), lit(core));
    const a = put(g, tor(.3, .008, 48), lit(col)), b = put(g, tor(.3, .006, 48), lit(core), 0, 0, 0, H); g.add(halo(col, 1.1));
    g.userData.tick = dt => { a.rotation.x += dt * 1.7; b.rotation.y += dt * 1.3; };
  }
  else if (key === 'lobber') { const m = put(g, ball(.12, 16), new THREE.MeshBasicMaterial({ color: 0x10131f })); put(m, tor(.12, .012, 24), lit(col)); put(g, ball(.045), lit(core), 0, .11, 0); g.add(halo(col, .5)); spin(m, 5, 0, 2); }
  else if (key === 'ricochet') { const m = put(g, cyl(.11, .11, .014, 24), lit(core)); put(m, tor(.11, .012, 24), lit(col), 0, 0, 0, H); g.add(halo(col, .4)); spin(m, 0, 14, 0); }
  else if (key === 'seeker') { put(g, cyl(0, .06, .18, 12), lit(core), 0, 0, 0, H); put(g, cyl(.06, .02, .08, 12), lit(col), 0, 0, -.13, H); for (const r of [0, H]) put(g, box(.004, .16, .07), lit(col), 0, 0, -.14, 0, 0, r); g.add(halo(col, .45)); }
  else if (key === 'wall' || key === 'pillar') { const x = key === 'wall'; put(g, x ? box(2.2, .05, .05) : box(.05, 2, .05), lit(core)); put(g, x ? box(2.2, .16, .02) : box(.16, 2, .02), soft(.3)); for (const k of [-1, 1]) { const h = halo(col, .4); h.position.set(x ? k * 1.1 : 0, x ? 0 : k, 0); g.add(h); } }
  else if (key === 'ring') { put(g, tor(.15, .013, 40), lit(core)); put(g, tor(.15, .03, 40), soft(.3)); }
  else if (key === 'charger') { put(g, ball(.06), lit(core)); put(g, ball(.09), soft(.35)); g.add(halo(col, .5)); }
  else if (key === 'mine') { const m = put(g, new THREE.IcosahedronGeometry(.14), new THREE.MeshBasicMaterial({ color: 0x10131f })); const k = put(m, new THREE.OctahedronGeometry(.2), lit(col)); k.scale.setScalar(.55); put(g, ball(.18, 16), soft(.2)); g.add(halo(col, .6)); spin(m, 1.5, 2.2, 0); }
  else if (key === 'spiral') { put(g, ball(.06), lit(core)); const m = put(g, tor(.09, .008, 20), lit(col)); g.add(halo(col, .34)); spin(m, 7, 5, 0); }
  else if (key === 'breaker') { put(g, cyl(.07, .11, .22, 14), lit(core), 0, 0, 0, H); put(g, cyl(.115, .115, .04, 14), lit(col), 0, 0, -.1, H); g.add(halo(col, .5)); }
  else if (key === 'freezer') { const m = put(g, new THREE.IcosahedronGeometry(.1), lit(new THREE.Color(col).lerp(new THREE.Color(0xffffff), .85))); put(g, ball(.14, 14), soft(.25)); g.add(halo(0xbfe9ff, .5)); spin(m, 2, 3, 0); }
  else if (key === 'leech') { put(g, ball(.065), lit(core)); put(g, cyl(.004, .05, .2, 10), soft(.55), 0, 0, -.12, H); put(g, tor(.08, .008, 20), lit(0x9be36a)); g.add(halo(col, .36)); }
  else if (key === 'boomerang') { const m = new THREE.Group(); g.add(m); for (const k of [-1, 1]) { put(m, box(.2, .014, .05), lit(core), k * .075, 0, -.03, 0, k * .6, 0); put(m, box(.2, .03, .012), soft(.4), k * .08, 0, -.055, 0, k * .6, 0); } g.add(halo(col, .4)); spin(m, 0, 16, 0); }
  else if (key === 'disc') {
    const m = new THREE.Group(); g.add(m); put(m, tor(.15, .016, 36), lit(core), 0, 0, 0, H); put(m, tor(.11, .006, 30), lit(col), 0, 0, 0, H);
    for (let k = 0; k < 3; k++) { const a = k * Math.PI * 2 / 3; put(m, box(.012, .008, .1), lit(col), Math.sin(a) * .06, 0, Math.cos(a) * .06, 0, a, 0); }
    put(m, cyl(.15, .15, .004, 30), soft(.18)); g.add(halo(col, .5)); spin(m, 0, 18, 0);
  }
  else if (key === 'curtain') bolt(.035, .08, .16);
  else if (key === 'decoy') { put(g, ball(.07), lit(core)); put(g, ball(.1), soft(.3)); g.add(halo(col, .4)); }
  else if (key === 'twin' || key === 'burst') bolt(.04, .14, .3);
  else bolt(.045, .16, .36);
  return g;
}
function makeBeam(col) {
  const g = new THREE.Group(), a = new THREE.CylinderGeometry(.012, .012, 1, 8), b = new THREE.CylinderGeometry(.04, .04, 1, 8); a.translate(0, .5, 0); b.translate(0, .5, 0);
  g.add(new THREE.Mesh(a, new THREE.MeshBasicMaterial({ color: 0xffffff })), new THREE.Mesh(b, new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: .35, blending: THREE.AdditiveBlending, depthWrite: false })));
  g.userData.tone = c => g.children[1].material.color.set(c);
  g.visible = false; return g;
}

export { WCOL, makeGun, makeShield, makeShot, makeBeam, glowTex, setEnv };
