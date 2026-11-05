// THE ANCHORS: ANCHORS gives a baked model's named points (data/anchors.json: by kind, a record's own or the kind's "*", in the model's own frame): where the hook goes in a fish's mouth, later a seat or a hand; ANCHORS.at turns one with a mesh, ANCHORS.place puts a mesh so its point sits where you say.
import {THREE} from './003-shx.js';
const ANCHORS={};
{ const D=__DATA__("data/anchors.json")||{}, V=new THREE.Vector3();
  ANCHORS.of=(kind,id,name)=>{ const K=D[kind]||{}, r=(K[id]&&K[id][name])||(K['*']&&K['*'][name]); return r?V.set(r[0],r[1],r[2]):null; };
  ANCHORS.at=(mesh,kind,id,name,out)=>{ const a=ANCHORS.of(kind,id,name); return a?(out||new THREE.Vector3()).copy(a).multiply(mesh.scale).applyQuaternion(mesh.quaternion).add(mesh.position):null; };
  ANCHORS.place=(mesh,kind,id,name,p)=>{ const a=ANCHORS.of(kind,id,name); mesh.position.copy(p); if(a)mesh.position.sub(a.multiply(mesh.scale).applyQuaternion(mesh.quaternion)); return !!a; };
  ANCHORS.kinds=()=>Object.keys(D).filter(k=>k!=='note'); window.ANCHORS=ANCHORS; }
export {ANCHORS};
