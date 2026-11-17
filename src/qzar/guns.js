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
  g.userData.life = f => { face.material.opacity = .35 + .65 * f; fill.material.opacity = .05 + .1 * f; rim.material.opacity = f < .25 ? .4 + .6 * Math.abs(Math.sin(f * 60)) : 1; };
  return g;
}

function makeShot(key, col) {
  const g = new THREE.Group(), core = new THREE.Color(col).lerp(new THREE.Color(0xffffff), .65);
  if (key === 'needle') { put(g, cyl(.004, .014, .34, 10), lit(core), 0, 0, 0, H); put(g, cyl(.002, .022, .2, 10), new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: .45 }), 0, 0, -.08, H); g.add(halo(col, .22)); }
  else if (key === 'scatter') { put(g, new THREE.OctahedronGeometry(.045), lit(core)); g.add(halo(col, .26)); g.userData.tick = dt => { g.children[0].rotation.z += dt * 9; }; }
  else if (key === 'drifter') {
    put(g, ball(.28, 28), new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: .28, depthWrite: false })); put(g, ball(.1), lit(core));
    const a = put(g, tor(.3, .008, 48), lit(col)), b = put(g, tor(.3, .006, 48), lit(core), 0, 0, 0, H); g.add(halo(col, 1.1));
    g.userData.tick = dt => { a.rotation.x += dt * 1.7; b.rotation.y += dt * 1.3; };
  } else { put(g, ball(.045), lit(core)); put(g, cyl(.004, .03, .16, 10), new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: .5 }), 0, 0, -.09, H); g.add(halo(col, .36)); }
  return g;
}

export { WCOL, makeGun, makeShield, makeShot, glowTex, setEnv };
