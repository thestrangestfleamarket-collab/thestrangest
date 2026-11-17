// the people: Polyfork's New Yorkers (pf.js, data/sushi/cast.json): walking, standing, sitting at the counter, eating
import * as THREE from 'three';
import { makePerson as makeFallback } from './people.js';
import { mat } from './ctx.js';
import { loadCast, pfPerson, CUSTOMERS } from './pf.js';

const BASE = '/sushi-assets/';
const lib = { ready: false, next: (Math.random() * 30) | 0 };
export const avatarsReady = () => lib.ready;

export async function loadAvatars(onProgress = () => { }) {
  try { await loadCast(`${BASE}cast.json`); onProgress(1); lib.ready = true; } catch (e) { console.warn('the people did not load, using fallback figures:', e); lib.ready = false; }
  return lib.ready;
}

let stickGeo, stickMat;
const stickSet = () => { stickGeo ||= new THREE.CylinderGeometry(0.0028, 0.0018, 0.22, 5).rotateX(Math.PI / 2).translate(0, 0, 0.07); stickMat ||= mat({ color: 0xd8c49a, roughness: 0.6 });
  const g = new THREE.Group(); g.visible = false; for (const s of [-1, 1]) { const m = new THREE.Mesh(stickGeo, stickMat); m.position.x = s * 0.006; m.rotation.y = s * 0.04; g.add(m); } return g; };
// a person by Polyfork's name (pf.js PF), or one of the passers-by in turn
export function makePerson(seed, style) {
  if (!lib.ready) return makeFallback(seed);
  const key = style || CUSTOMERS[lib.next++ % CUSTOMERS.length], sticks = stickSet(), P = pfPerson(key, sticks); P.seed = seed; P.root.add(sticks); return P;
}
