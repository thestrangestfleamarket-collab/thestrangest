// SKIRMISH TABLE's dungeon round the board (baked by tools/chess-bake.cjs dungeon from photographed and scanned things: Poly Haven and ambientCG, CC0): a moat of lava, a bank of rock, low broken walls before each seat, a brick wall with its gate and two towers to the east, the cavern's rock to the west, ivy.
// All of it is still and unlit: one mesh on one picture with its light, shade and the lava's glow in each point's colour, the ivy a second, the lava a third (its picture drifting slowly, its brightness capped).
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

const A = '/chess-assets/dungeon/';
export function makeDungeon(renderer) {
  const group = new THREE.Group(), t = { value: 0 }, an = Math.min(4, renderer.capabilities.getMaxAnisotropy());
  const pic = (name, wrap) => { const x = new THREE.TextureLoader().load(A + name); x.flipY = false; x.colorSpace = THREE.SRGBColorSpace; x.anisotropy = an; if (wrap) x.wrapS = x.wrapT = THREE.RepeatWrapping; return x; };
  const lava = new THREE.Mesh(new THREE.PlaneGeometry(11, 13).rotateX(-Math.PI / 2).translate(0, -0.3, 0), new THREE.ShaderMaterial({
    uniforms: { map: { value: pic('lava.jpg', true) }, t },
    vertexShader: 'varying vec2 vUv; void main() { vUv = position.xz / 3.2; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
    fragmentShader: 'uniform sampler2D map; uniform float t; varying vec2 vUv; void main() { vec3 a = texture2D(map, vUv + vec2(t * 0.006, t * 0.004)).rgb, b = texture2D(map, vUv * 1.37 + vec2(-t * 0.005, t * 0.007)).rgb; gl_FragColor = vec4(vec3(0.03, 0.018, 0.016) + min((a + b) * vec3(0.5, 0.3, 0.2), vec3(0.62, 0.3, 0.12)), 1.0);\n#include <colorspace_fragment>\n}',
  }));
  lava.raycast = () => {}; lava.matrixAutoUpdate = false; lava.visible = false;
  group.add(lava);
  const out = { group, lava, ready: false, tris: 0, tick(now) { t.value = now; } };
  new GLTFLoader().loadAsync(A + 'dungeon.glb').then(g => {
    const mats = { dungeon: new THREE.MeshBasicMaterial({ map: pic('atlas.jpg'), vertexColors: true }), ivy: new THREE.MeshBasicMaterial({ map: pic('ivy.png'), vertexColors: true, alphaTest: 0.5, side: THREE.DoubleSide }) };
    const meshes = []; g.scene.traverse(o => { if (o.isMesh && mats[o.name]) meshes.push(o); });
    for (const o of meshes) { o.material = mats[o.name]; o.raycast = () => {}; o.matrixAutoUpdate = false; o.frustumCulled = false; out.tris += o.geometry.index.count / 3; group.add(o); }
    lava.visible = true; out.ready = true;
  }).catch(err => console.warn('The dungeon failed to load; the board stands alone.', err));
  return out;
}
