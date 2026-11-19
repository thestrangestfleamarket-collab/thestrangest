// a model off the shelf (data/sushi/m, CC0), once per file, in the game's one cheap material; every copy shares it
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/addons/libs/meshopt_decoder.module.js';
import { mat } from './ctx.js';
const gl = new GLTFLoader(), got = {}; gl.setMeshoptDecoder(MeshoptDecoder);
export const glb = (file, tint = 0xa8a8a8) => (got[file + tint] ||= gl.loadAsync('/sushi-assets/m/' + file + '.glb').then((d) => { d.scene.traverse((o) => { if (o.isMesh) { o.material = mat({ map: o.material.map, color: tint }); o.castShadow = false; o.userData.nopick = true; } }); return d.scene; }));
