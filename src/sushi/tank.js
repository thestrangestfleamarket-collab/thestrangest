// the cart's little fish tank (owner, 16 Nov 2026: "add the fish tank from the apartment to the food cart, make it small, 1 fish"): THE MARKET's apartment tank in miniature on a shelf at the front left post, sand, pebbles, weed, a gently moving surface and one of Polyfork's koi (data/sushi/koi.json) swimming its rounds
import * as THREE from 'three';
import { G, mat, box, mesh } from './ctx.js';

const B64 = (s) => { const t = atob(s), u = new Uint8Array(t.length); for (let i = 0; i < t.length; i++) u[i] = t.charCodeAt(i); return u; };

export function buildTank(scene) {
  const W = 0.26, D = 0.15, H = 0.17, GL = 0.004, SAND = 0.025, WATER = H - 0.022;
  const root = new THREE.Group(); root.position.set(-0.9, 1.625, -0.38); root.rotation.y = 0.75; scene.add(root);   // across from the television, turned to the cook
  const dark = mat({ color: 0x1a1a1c, roughness: 0.6 });
  box(W + 0.06, 0.02, D + 0.06, dark, 0, -0.01, 0, root);
  box(W + 0.01, 0.012, D + 0.01, dark, 0, 0.006, 0, root); box(W + 0.01, 0.01, D + 0.01, dark, 0, H + 0.005, 0, root);   // the black base and rim
  // glass: four thin panes, seen through
  const glass = new THREE.MeshLambertMaterial({ color: 0xcfe6ea, transparent: true, opacity: 0.16, depthWrite: false, side: THREE.DoubleSide });
  for (const [w, x, z, ry] of [[W, 0, D / 2, 0], [W, 0, -D / 2, 0], [D, W / 2, 0, Math.PI / 2], [D, -W / 2, 0, Math.PI / 2]]) { const p = mesh(new THREE.PlaneGeometry(w, H - 0.012), glass, x, H / 2 + 0.006, z, root); p.rotation.y = ry; p.castShadow = false; p.renderOrder = 3; }
  // the bed: sand, a few pebbles, weed
  box(W - 2 * GL, SAND, D - 2 * GL, mat({ color: 0xc8b48a }), 0, 0.012 + SAND / 2, 0, root);
  const peb = mat({ color: 0x8a8478 }); for (let i = 0; i < 9; i++) { const r = 0.006 + (i % 3) * 0.003, s = mesh(new THREE.SphereGeometry(r, 6, 4), peb, -W / 2 + 0.02 + ((i * 37) % 100) / 100 * (W - 0.04), 0.012 + SAND, -D / 2 + 0.02 + ((i * 61) % 100) / 100 * (D - 0.04), root); s.scale.y = 0.6; }
  const weed = mat({ color: 0x3c6a2c, side: THREE.DoubleSide }), blades = [];
  for (let i = 0; i < 7; i++) { const h = 0.05 + (i % 4) * 0.018, g = new THREE.PlaneGeometry(0.008, h, 1, 4); g.translate(0, h / 2, 0); const b = mesh(g, weed, -W / 2 + 0.03 + (i % 3) * 0.012, 0.012 + SAND, -D / 2 + 0.03 + i * 0.006, root); b.rotation.y = i * 0.9; b.castShadow = false; blades.push(b); }
  // the water: a tinted body and a surface that moves a little
  const wm = new THREE.MeshLambertMaterial({ color: 0x6fa6a0, transparent: true, opacity: 0.22, depthWrite: false });
  const body = box(W - 2 * GL, WATER - SAND, D - 2 * GL, wm, 0, 0.012 + SAND + (WATER - SAND) / 2, 0, root); body.castShadow = false; body.renderOrder = 2;
  const sg = new THREE.PlaneGeometry(W - 2 * GL, D - 2 * GL, 10, 6); sg.rotateX(-Math.PI / 2); const sp = sg.attributes.position, sy0 = Float32Array.from(sp.array);
  const surf = mesh(sg, new THREE.MeshLambertMaterial({ color: 0x9fd0cc, transparent: true, opacity: 0.35, depthWrite: false, side: THREE.DoubleSide }), 0, 0.012 + WATER, 0, root); surf.castShadow = false; surf.renderOrder = 2;
  const lamp = new THREE.PointLight(0xdff2ff, 0.12, 0.6, 2); lamp.position.set(0, H + 0.02, 0); root.add(lamp);   // a soft lid light, steady
  // the koi: Polyfork's, the apartment tank's own fish, small
  const fish = { g: null, t: Math.random() * 10, x: 0, z: 0, y: 0, yaw: 0 }, tank = { root, fish, ready: false };
  fetch('/sushi-assets/koi.json').then((r) => r.json()).then((d) => {
    const p = new Float32Array(B64(d.p).buffer), c = B64(d.c), n = c.length / 3, C = new Float32Array(n * 3), q = new THREE.Color();
    for (let i = 0; i < n; i++) { q.setRGB(c[i * 3] / 255, c[i * 3 + 1] / 255, c[i * 3 + 2] / 255, THREE.SRGBColorSpace); C[i * 3] = q.r; C[i * 3 + 1] = q.g; C[i * 3 + 2] = q.b; }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(p, 3)); g.setAttribute('color', new THREE.BufferAttribute(C, 3)); g.computeVertexNormals(); g.computeBoundingBox();
    const bb = g.boundingBox, L = bb.max.x - bb.min.x; g.translate(-(bb.max.x + bb.min.x) / 2, -(bb.max.y + bb.min.y) / 2, -(bb.max.z + bb.min.z) / 2);
    const m = new THREE.MeshLambertMaterial({ vertexColors: true, side: THREE.DoubleSide }), sw = { value: 0 };
    m.onBeforeCompile = (sh) => { sh.uniforms.uSw = sw; sh.vertexShader = 'uniform float uSw;\n' + sh.vertexShader.replace('#include <begin_vertex>', `#include <begin_vertex>
      { float w = clamp(0.5 - position.x / ${L.toFixed(4)}, 0., 1.); transformed.z += (0.012 + w * w * 0.07) * ${L.toFixed(4)} * sin(uSw + position.x / ${L.toFixed(4)} * 7.); }`); };
    m.customProgramCacheKey = () => 'tankkoi';
    const k = new THREE.Mesh(g, m); k.scale.setScalar(0.075 / L); k.castShadow = false; k.userData.nopick = true; k.userData.sw = sw;
    fish.g = new THREE.Group(); fish.g.add(k); root.add(fish.g); tank.ready = true;
  }).catch(() => { });
  // a slow round of the tank, turning at the glass, rising and sinking a little; the tail beats with its speed
  tank.update = (dt) => {
    const t = (fish.t += dt), a = sy0; for (let i = 0; i < sp.count; i++) sp.array[i * 3 + 1] = a[i * 3 + 1] + Math.sin(t * 1.3 + a[i * 3] * 40 + a[i * 3 + 2] * 30) * 0.0012; sp.needsUpdate = true;
    for (let i = 0; i < blades.length; i++) blades[i].rotation.z = Math.sin(t * 0.8 + i) * 0.08;
    if (!fish.g) return;
    const rx = W / 2 - 0.045, rz = D / 2 - 0.035, sp2 = 0.32, x = Math.sin(t * sp2) * rx, z = Math.sin(t * sp2 * 2) * rz, y = 0.012 + SAND + 0.035 + (Math.sin(t * 0.37) * 0.5 + 0.5) * (WATER - SAND - 0.06);
    const dx = x - fish.x, dz = z - fish.z; if (dx * dx + dz * dz > 1e-9) fish.yaw = Math.atan2(-dz, dx);
    fish.x = x; fish.z = z; fish.g.position.set(x, y, z); fish.g.rotation.y = fish.yaw; fish.g.children[0].userData.sw.value = t * 6;
  };
  G.tank = tank; return tank;
}
