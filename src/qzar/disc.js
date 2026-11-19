// SLOWFIRE DUEL's disc arena: the closed room, a disc's bounce off its walls, the side boost, the banked throw and where a ray leaves the room; no game state
import * as THREE from 'three';

const SIZES = [{ x: 3, y: 5, z: 6 }, { x: 5, y: 7, z: 8 }, { x: 8, y: 9, z: 11 }];   // half the width, the height, half the length: small, medium, large
const ROOM = { ...SIZES[1] };
function setRoom(i) { Object.assign(ROOM, SIZES[i] || SIZES[1]); }
const JET = { energy: 10, speed: 5.5, walk: 1.6, refill: 2.5, head: 1.6 };
const HOLSTERS = [[-.17, -.14, .2], [.17, -.14, .2], [-.24, -.74, .02], [.24, -.74, .02]];   // behind each shoulder, at each hip, from the head
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

function wallHit(p, r = .12) {            // turn a disc back off whatever walls it has reached; how many
  let n = 0;
  for (const [a, lo, hi] of [['x', -ROOM.x, ROOM.x], ['y', 0, ROOM.y], ['z', -ROOM.z, ROOM.z]]) {
    if (p.pos[a] > hi - r && p.vel[a] > 0) { p.pos[a] = hi - r; p.vel[a] *= -1; n++; }
    else if (p.pos[a] < lo + r && p.vel[a] < 0) { p.pos[a] = lo + r; p.vel[a] *= -1; n++; }
  }
  return n;
}
function boost(m, dir, dt, walk) {        // m: {x, vx, e}; dir -1, 0 or 1: a burst to that side while there is energy; walk: how fast you go without it
  const on = dir !== 0 && m.e > 0;
  if (on) m.e = Math.max(0, m.e - dt); else if (dir === 0) m.e = Math.min(JET.energy, m.e + JET.refill * dt);
  m.vx += (dir * (on ? JET.speed : JET.walk * walk) - m.vx) * Math.min(1, dt * 6);
  m.x = clamp(m.x + m.vx * dt, -ROOM.x + .6, ROOM.x - .6); m.y = 0; m.vy = 0;
  return on;
}
function bank(from, to, speed, wall) {    // the throw that reaches a point straight, or off one wall: x+, x-, y+ (ceiling), y- (floor)
  const t = to.clone();
  if (wall === 'x+') t.x = 2 * ROOM.x - t.x; else if (wall === 'x-') t.x = -2 * ROOM.x - t.x; else if (wall === 'y+') t.y = 2 * ROOM.y - t.y; else if (wall === 'y-') t.y = -t.y;
  return t.sub(from).setLength(speed);
}
function leave(o, d, out) {               // where a ray from inside the room meets its walls
  let t = 1e9;
  for (const [a, lo, hi] of [['x', -ROOM.x, ROOM.x], ['y', 0, ROOM.y], ['z', -ROOM.z, ROOM.z]]) if (Math.abs(d[a]) > 1e-6) { const k = ((d[a] > 0 ? hi : lo) - o[a]) / d[a]; if (k > 0 && k < t) t = k; }
  return out.copy(o).addScaledVector(d, t);
}

function makeRoom() {                     // the holodeck's look: black, a green grid a metre square on every face
  const g = new THREE.Group(), walls = new THREE.Group(), c = document.createElement('canvas'); c.width = c.height = 128; const x = c.getContext('2d');
  x.fillStyle = '#080e0a'; x.fillRect(0, 0, 128, 128); x.strokeStyle = '#1c783a'; x.lineWidth = 7; x.strokeRect(0, 0, 128, 128); x.strokeStyle = '#3cff78'; x.lineWidth = 2.5; x.strokeRect(0, 0, 128, 128);
  const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace; tex.wrapS = tex.wrapT = THREE.RepeatWrapping; tex.anisotropy = 4;
  const mat = new THREE.MeshBasicMaterial({ map: tex });
  const wall = (w, h, px, py, pz, rx, ry) => {
    const geo = new THREE.PlaneGeometry(w, h), uv = geo.attributes.uv; for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * w, uv.getY(i) * h);
    const m = new THREE.Mesh(geo, mat); m.position.set(px, py, pz); m.rotation.set(rx, ry, 0); walls.add(m);
  };
  wall(2 * ROOM.z, ROOM.y, -ROOM.x, ROOM.y / 2, 0, 0, Math.PI / 2); wall(2 * ROOM.z, ROOM.y, ROOM.x, ROOM.y / 2, 0, 0, -Math.PI / 2);
  wall(2 * ROOM.x, ROOM.y, 0, ROOM.y / 2, -ROOM.z, 0, 0); wall(2 * ROOM.x, ROOM.y, 0, ROOM.y / 2, ROOM.z, 0, Math.PI);
  wall(2 * ROOM.x, 2 * ROOM.z, 0, ROOM.y, 0, Math.PI / 2, 0); wall(2 * ROOM.x, 2 * ROOM.z, 0, .02, 0, -Math.PI / 2, 0);
  const box = new THREE.BoxGeometry(2 * ROOM.x, ROOM.y, 2 * ROOM.z); box.translate(0, ROOM.y / 2, 0);
  const lines = new THREE.LineSegments(new THREE.EdgesGeometry(box), new THREE.LineBasicMaterial({ color: 0x3cff78 }));
  g.userData.fade = through => {            // a quarter faded: toward the dark behind it, or, in passthrough, letting the real room show
    mat.transparent = through; mat.opacity = through ? .75 : 1; mat.depthWrite = !through; mat.color.setScalar(through ? 1 : .75); mat.needsUpdate = true;
  };
  g.userData.fade(false); g.add(walls, lines); g.userData.walls = walls; return g;
}

export { ROOM, SIZES, setRoom, JET, HOLSTERS, wallHit, boost, bank, leave, makeRoom };
