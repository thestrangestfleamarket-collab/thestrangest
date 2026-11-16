// a model off the shelf (data/sushi/m, CC0), once per file, in the game's one cheap material; every copy shares it; and the sake barrel, built here
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/addons/libs/meshopt_decoder.module.js';
import { mat } from './ctx.js';
import * as T from './tex.js';

const gl = new GLTFLoader(), got = {}; gl.setMeshoptDecoder(MeshoptDecoder);
export const glb = (file, tint = 0xa8a8a8) => (got[file] ||= gl.loadAsync('/sushi-assets/m/' + file + '.glb').then((d) => { d.scene.traverse((o) => { if (o.isMesh) { o.material = mat({ map: o.material.map, color: tint }); o.castShadow = false; o.userData.nopick = true; } }); return d.scene; }));

// a sake barrel (komodaru): cedar under a straw wrap tied with rope, its maker's mark brushed on (the CC0 barrels are later ones)
let TARU = null;
export function taru(parent, x, z, s = 1, ry = 0) {
  if (!TARU) { const wrap = T.canvasTex(256, 128, (g, w, h) => { g.fillStyle = '#c8b484'; g.fillRect(0, 0, w, h); g.strokeStyle = 'rgba(90,70,30,0.35)'; for (let x0 = 0; x0 < w; x0 += 3) { g.beginPath(); g.moveTo(x0, 0); g.lineTo(x0 + 2, h); g.stroke(); } g.fillStyle = '#7a1c14'; g.font = `bold 64px ${T.JP}`; g.textAlign = 'center'; g.fillText('福', w / 4, 84); g.fillText('酒', (w * 3) / 4, 84); g.fillStyle = '#5a4428'; g.fillRect(0, 12, w, 6); g.fillRect(0, h - 18, w, 6); });
    TARU = { body: T.surface(mat({ map: wrap }), { grime: 0.35, bomb: 0 }), top: T.surface(mat({ map: T.photo('wood'), color: 0x9a8268 }), { grime: 0.3 }), rope: T.surface(mat({ map: T.photo('thatch'), color: 0x7a6040 }), { grime: 0.3 }) }; }
  const g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = ry; g.scale.setScalar(s); parent.add(g);
  const m = (geo, mt, y) => { const o = new THREE.Mesh(geo, mt); o.position.y = y; o.castShadow = o.receiveShadow = true; g.add(o); return o; };
  m(new THREE.CylinderGeometry(0.27, 0.25, 0.56, 16), TARU.body, 0.28); m(new THREE.CylinderGeometry(0.255, 0.255, 0.03, 16), TARU.top, 0.575);
  for (const y of [0.1, 0.46]) m(new THREE.TorusGeometry(0.265, 0.012, 5, 18), TARU.rope, y).rotation.x = Math.PI / 2;
  return g;
}
