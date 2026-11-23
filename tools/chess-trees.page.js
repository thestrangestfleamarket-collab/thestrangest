// SKIRMISH TABLE's trees, the part that runs in a browser (tools/chess-bake.cjs trees): each whole tree (Poly Haven, CC0) pictured from the side under the sky's light, on one sheet with its outline; the game draws the pictures on crossed cards
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { b64 } from './chess-bake.page.js';

// the sheet: [tree, which of its trees, turn, x, y, w, h, tiers]. The firs and pines are saplings: a grown one is drawn as tiers of them, widest at the foot
export const TW = 2048, TH = 512;
export const SHEET = [['fir_sapling', 0, 0, 0, 0, 256, 512, 6], ['fir_sapling', 1, 1.7, 256, 0, 256, 512, 6], ['fir_sapling', 2, 0.6, 512, 0, 256, 512, 5], ['pine_sapling_small', 1, 0, 768, 0, 256, 512, 4], ['pine_sapling_small', 0, 1.6, 1024, 0, 256, 512, 4],
  ['island_tree_02', 0, 0, 1280, 0, 384, 256, 0], ['island_tree_02', 0, 1.9, 1664, 0, 384, 256, 0], ['island_tree_02', 0, 3.4, 1280, 256, 384, 256, 0], ['island_tree_02', 0, 4.9, 1664, 256, 384, 256, 0]];

window.bakeTrees = async () => {
  const log = [], out = document.createElement('canvas'); out.width = TW; out.height = TH; const ctx = out.getContext('2d');
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true, premultipliedAlpha: false });
  renderer.setClearColor(0x000000, 0); renderer.toneMapping = THREE.NoToneMapping;
  const loaded = {};
  const shot = (name, which, turn, w, h) => {   // one tree from the side, its foot at the picture's foot
    const src = loaded[name][Math.min(which, loaded[name].length - 1)], tree = src.clone(true), scene = new THREE.Scene(), pivot = new THREE.Group();
    tree.position.set(0, 0, 0); tree.traverse(o => { if (o.isMesh) { const m = o.material, leafy = /leaves|twig/.test(m.name); o.material = new THREE.MeshLambertMaterial({ map: m.map, side: THREE.DoubleSide, alphaTest: leafy ? 0.4 : 0 }); } });
    pivot.add(tree); pivot.rotation.y = turn; scene.add(pivot); pivot.updateMatrixWorld(true);
    const bb = new THREE.Box3().setFromObject(pivot), c = bb.getCenter(new THREE.Vector3()), s = bb.getSize(new THREE.Vector3());
    let tall = s.y * 1.02, wide = tall * w / h; if (wide < s.x * 1.02) { wide = s.x * 1.02; tall = wide * h / w; }
    const cam = new THREE.OrthographicCamera(-wide / 2, wide / 2, bb.min.y + tall, bb.min.y, 0.01, 100);
    cam.position.set(c.x, 0, c.z + 20); cam.lookAt(c.x, 0, c.z);
    scene.add(new THREE.HemisphereLight(0xdfe8f4, 0x4a4a3c, 2.6)); const sun = new THREE.DirectionalLight(0xfff0dc, 2.4); sun.position.set(6, 8, 5); scene.add(sun);
    renderer.setSize(w * 2, h * 2, false); renderer.render(scene, cam);
    const cv = document.createElement('canvas'); cv.width = w; cv.height = h; cv.getContext('2d').drawImage(renderer.domElement, 0, 0, w, h);
    return cv;
  };
  for (const [name, which, turn, x, y, w, h, tiers] of SHEET) {
    if (!loaded[name]) { const g = await new GLTFLoader().loadAsync('/trees/' + name + '/' + name + '.gltf'); g.scene.updateMatrixWorld(true); loaded[name] = g.scene.children.filter(o => o.isMesh || o.children.length); }
    if (!tiers) ctx.drawImage(shot(name, which, turn, w, h), x, y);
    else for (let k = 0; k < tiers; k++) { const f = k / (tiers - 1), dw = w * (1 - 0.72 * f), dh = h * (0.5 - 0.14 * f), foot = y + h - f * (h * 0.66);
      ctx.filter = 'brightness(' + (0.78 + 0.22 * f) + ')'; ctx.drawImage(shot(name, which + k, turn + k * 2.1, 256, 256), x + (w - dw) / 2, foot - dh, dw, dh); ctx.filter = 'none'; }
    log.push(name + ' ' + which);
  }
  // a leaf's colour carried out past its edge, so no dark rim shows where the picture is drawn small
  const im = ctx.getImageData(0, 0, TW, TH), d = im.data;
  for (let pass = 0; pass < 6; pass++) { const a0 = new Uint8Array(TW * TH); for (let i = 0; i < TW * TH; i++) a0[i] = d[i * 4 + 3] > 8 || d[i * 4 + 3] === 1 ? 1 : 0;
    for (let y = 0; y < TH; y++) for (let x = 0; x < TW; x++) { const i = y * TW + x; if (a0[i]) continue; let r = 0, g = 0, b = 0, n = 0;
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const xx = x + dx, yy = y + dy; if (xx < 0 || yy < 0 || xx >= TW || yy >= TH) continue; const j = yy * TW + xx; if (a0[j]) { r += d[j * 4]; g += d[j * 4 + 1]; b += d[j * 4 + 2]; n++; } }
      if (n) { d[i * 4] = r / n; d[i * 4 + 1] = g / n; d[i * 4 + 2] = b / n; d[i * 4 + 3] = 1; } } }
  ctx.putImageData(im, 0, 0);
  return { files: { 'trees.png': out.toDataURL('image/png').split(',')[1] }, log };
};
export { b64 };
