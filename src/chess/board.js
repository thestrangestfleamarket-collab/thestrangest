// SKIRMISH TABLE's plain board: stone tiles on a wooden slab with a brazier at each corner (the map with no ground rules)
import * as THREE from 'three';
import { makeStone, makeWood } from './procedural.js';

const MARK = { sel: [0xffe08a, 0x5a4600], hit: [0xff9a9a, 0x7a1010], heal: [0xa8ffc4, 0x0f5a2a], move: [0x9cc0ff, 0x12409a] };

export function makeBoard(map, { fx, id }) {
  const { cols, rows } = map, group = new THREE.Group(), spots = [];
  const wood = makeWood(11);
  for (const t of Object.values(wood)) t.repeat.set(3, 3);
  const slab = new THREE.Mesh(new THREE.BoxGeometry(cols + 0.7, 0.24, rows + 0.7), new THREE.MeshStandardMaterial({ ...wood, color: 0xffffff }));
  slab.position.y = -0.22; slab.receiveShadow = true; slab.raycast = () => {};
  group.add(slab);
  const stone = [makeStone(3), makeStone(8)], tiles = [], pick = new THREE.Group(), tileGeo = new THREE.BoxGeometry(0.95, 0.1, 0.95);
  for (let y = 0; y < rows; y++) for (let x = 0; x < cols; x++) {
    const m = new THREE.Mesh(tileGeo, new THREE.MeshStandardMaterial({ ...stone[(x * 7 + y * 3) % 2], normalScale: new THREE.Vector2(1.2, 1.2) }));
    m.position.set(x - (cols - 1) / 2, -0.05, y - (rows - 1) / 2);
    m.receiveShadow = true; m.userData.pick = { kind: 'tile', x, y };
    pick.add(m); tiles.push(m);
  }
  group.add(pick);
  const fires = [], lights = [], iron = new THREE.MeshStandardMaterial({ color: 0x2a2a2e, metalness: 0.9, roughness: 0.5 });
  for (const [sx, sz] of [[-1, -1], [1, 1], [1, -1], [-1, 1]]) {
    const pos = new THREE.Vector3(sx * (cols / 2 + 0.75), 0, sz * (rows / 2 + 0.75));
    const post = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.1, 1.0, 8), iron), bowl = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.12, 0.16, 12), iron);
    post.position.copy(pos).setY(0.4); bowl.position.copy(pos).setY(0.95);
    post.castShadow = bowl.castShadow = true; post.raycast = bowl.raycast = () => {};
    group.add(post, bowl);
    spots.push(fx.flame(pos.clone().setY(1.0)));
    fires.push(pos.clone().setY(1.2));
    if (lights.length < 2) { // two real lights (opposite corners) are enough and keep shading cheap
      const l = new THREE.PointLight(0xff9a4a, 5, 16, 1.5);
      l.position.copy(pos).setY(1.2); group.add(l); lights.push(l);
    }
  }
  const paint = (m, c, e) => { m.material.color.setHex(c); m.material.emissive.setHex(e); };
  return {
    id, group, pick, look: null, fires, lights, river: null, woods: null, cols, rows, border: 0.35, land: false,
    yAt: () => 0, ground: () => '.',
    clear() { for (const m of tiles) { const { x, y } = m.userData.pick; paint(m, (x + y) % 2 ? 0xd8d4cc : 0x8f8b85, 0); } },   // tints multiply the stone texture
    mark(x, y, kind) { paint(tiles[y * cols + x], ...MARK[kind]); },
    flush() {}, cut() {}, setDetail() {}, setFog() {},
    stats() { return { draws: tiles.length + 9, tris: tiles.length * 12 + 400 }; },
    update(dt, now) { for (let i = 0; i < lights.length; i++) lights[i].intensity = 5 * (0.82 + 0.12 * Math.sin(now * 11 + i * 2) + 0.08 * Math.sin(now * 23.7 + i)); },
    dispose() { for (const f of spots) { f.userData.dead = true; f.parent && f.parent.remove(f); } group.parent && group.parent.remove(group); },
  };
}
