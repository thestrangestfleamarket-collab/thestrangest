// THE GARAGE's shotgun: a pump-action twelve-bore on the back wall and a box of shells on the shelf beside it; shells go from your belt into the tube one at a time, the fore-end is worked by the off hand, and what the shot does is worked out pellet by pellet
import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { ROOM } from './garage.js';
import { model, plain, canvasTex } from './assets.js';

const TUBE = 5, PELLETS = 9, SPREAD = 0.035, STROKE = 0.09, PORT = new THREE.Vector3(0, -0.03, -0.1), FORE = 0.36, MUZZLE = 0.66;
export const RACK = new THREE.Vector3(0.95, 1.55, ROOM.z1 - 0.1), BOX = new THREE.Vector3(-1.2, 0.5, ROOM.z1 - 0.34), CANS = [-5, ROOM.z0 - 6];
const _a = new THREE.Vector3(), _b = new THREE.Vector3(), _c = new THREE.Vector3(), _d = new THREE.Vector3(), _q = new THREE.Quaternion(), _m = new THREE.Matrix4(), UP = new THREE.Vector3(0, 1, 0);

export function buildGun(scene, garage, street, sound, kit, T, hooks) {
  const wood = new THREE.MeshStandardMaterial({ ...T.maple, color: 0x8a5a3a, roughness: 1, bumpScale: 0.1 }), steel = plain(0x24272b, { rough: 0.38, metal: 0.9, env: 1 });
  // the gun, its grip at the origin, the barrel along -z
  const g = new THREE.Group(), cyl = (r, a, b, y) => new THREE.CylinderGeometry(r, r, Math.abs(b - a), 10).rotateX(Math.PI / 2).translate(0, y, (a + b) / 2);
  const metal = new THREE.Mesh(mergeGeometries([cyl(0.0125, 0.02, -MUZZLE, 0.045), cyl(0.011, 0.0, -0.52, 0.018), new THREE.BoxGeometry(0.036, 0.062, 0.2).translate(0, 0.028, 0.04), new THREE.BoxGeometry(0.008, 0.03, 0.06).translate(0, -0.018, 0.03), new THREE.SphereGeometry(0.005, 6, 5).translate(0, 0.062, -MUZZLE + 0.01)]), steel);
  const stock = new THREE.Mesh(mergeGeometries([new THREE.BoxGeometry(0.034, 0.05, 0.11).rotateX(0.5).translate(0, -0.03, 0.12), new THREE.BoxGeometry(0.036, 0.085, 0.3).rotateX(0.14).translate(0, -0.012, 0.31), new THREE.BoxGeometry(0.038, 0.12, 0.02).translate(0, -0.035, 0.46)]), wood);
  const pump = new THREE.Mesh(new THREE.CylinderGeometry(0.024, 0.024, 0.17, 10).rotateX(Math.PI / 2).translate(0, 0.02, -FORE), wood);
  g.add(metal, stock, pump);
  g.traverse((o) => { if (o.isMesh) o.castShadow = true; });
  scene.add(g);
  const flash = new THREE.PointLight(0xffc27a, 0, 9, 1.6); scene.add(flash);
  const fire = new THREE.Mesh(new THREE.ConeGeometry(0.07, 0.3, 8).rotateX(-Math.PI / 2).translate(0, 0.045, -MUZZLE - 0.15), new THREE.MeshBasicMaterial({ color: 0xffd9a0, transparent: true, opacity: 0.85, depthWrite: false, fog: false })); fire.visible = false; g.add(fire);
  // its two pegs on the wall, and the box of shells
  const pegs = new THREE.Mesh(mergeGeometries([-0.2, 0.25].map((x) => new THREE.CylinderGeometry(0.008, 0.008, 0.09, 6).rotateX(Math.PI / 2).translate(RACK.x + x, RACK.y - 0.035, ROOM.z1 - 0.045))), steel); scene.add(pegs);
  const label = canvasTex(64, 32, (c) => { c.fillStyle = '#9c1f1a'; c.fillRect(0, 0, 64, 32); c.fillStyle = '#f1e2b0'; c.font = 'bold 15px sans-serif'; c.textAlign = 'center'; c.fillText('12 GA', 32, 15); c.font = '8px sans-serif'; c.fillText('25 SHELLS', 32, 26); });
  const box = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.075, 0.11), new THREE.MeshStandardMaterial({ map: label, roughness: 0.8 })); box.position.copy(BOX); box.castShadow = true; scene.add(box);
  const shellG = mergeGeometries([new THREE.CylinderGeometry(0.0105, 0.0105, 0.05, 8).translate(0, 0.008, 0), new THREE.CylinderGeometry(0.0112, 0.0112, 0.014, 8).translate(0, -0.024, 0)]), shellM = new THREE.MeshStandardMaterial({ color: 0xa3221c, roughness: 0.5 });
  const inHand = new THREE.Mesh(shellG, shellM); inHand.visible = false; scene.add(inHand);
  // loose things that fall and roll: spent shells, and the cans set up on the lawn
  const bodies = [];
  const body = (mesh, r) => { const b = { mesh, r, v: new THREE.Vector3(), w: new THREE.Vector3(), rest: true, home: null }; bodies.push(b); return b; };
  const spent = []; for (let i = 0; i < 8; i++) { const m = new THREE.Mesh(shellG, shellM); m.visible = false; scene.add(m); spent.push(body(m, 0.012)); }
  let spentI = 0;
  model('wooden_crate_02', CANS[0] - 0.75, 0, CANS[1], 0, { h: 0.5, shadow: false }, scene); model('wooden_crate_02', CANS[0] + 0.75, 0, CANS[1], 1.57, { h: 0.5, shadow: false }, scene);
  const plank = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.03, 0.18), wood); plank.position.set(CANS[0], 0.52, CANS[1]); scene.add(plank);
  const cans = []; for (let i = 0; i < 6; i++) { const m = model('can_rusted', 0, 0, 0, i, { h: 0.13, shadow: false }, scene), b = body(m, 0.065); b.home = new THREE.Vector3(CANS[0] - 0.9 + i * 0.36, 0.535, CANS[1]); m.position.copy(b.home); cans.push(b); }
  street.solids.push([CANS[0] - 1.15, CANS[1] - 0.3, CANS[0] + 1.15, CANS[1] + 0.3]);
  // holes: small dark marks where the shot lands, a ring of them reused
  const holeG = new THREE.CircleGeometry(0.012, 6), holeM = new THREE.MeshBasicMaterial({ color: 0x0a0908, transparent: true, opacity: 0.8, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -3, polygonOffsetUnits: -3 }), holes = [];
  for (let i = 0; i < 72; i++) { const m = new THREE.Mesh(holeG, holeM); m.visible = false; m.renderOrder = 3; scene.add(m); holes.push(m); }
  let holeI = 0, solidList = null;
  const ray = new THREE.Raycaster(); ray.far = 90;

  const S = { g, where: 'rack', tube: 0, chamber: 0, pump: 0, wasBack: false, pouch: 0, shell: false, held: false, fore: false, kick: 0, shots: 0, hits: { can: 0, kit: 0, wall: 0, tv: 0 }, floor: new THREE.Vector3() };
  const say = (t) => hooks.readout(t);
  const status = () => say((S.chamber === 1 ? 'READY · ' : S.chamber === 2 ? 'SPENT · ' : '') + S.tube + ' IN THE TUBE · ' + S.pouch + ' ON YOU');
  const eject = () => { if (!S.chamber) return; const b = spent[spentI++ % spent.length]; b.mesh.visible = true; b.mesh.position.copy(_a.set(0.03, 0.04, 0.02).applyQuaternion(g.quaternion).add(g.position)); b.v.copy(_a.set(1.6, 1.4, 0.3).applyQuaternion(g.quaternion)); b.w.set(9, 4, 7); b.rest = false; S.chamber = 0; };
  // the fore-end: back throws out what is in the chamber, forward carries a shell up from the tube
  const setPump = (v) => {
    S.pump = Math.min(1, Math.max(0, v)); pump.position.z = S.pump * STROKE;
    if (S.pump > 0.85 && !S.wasBack) { S.wasBack = true; eject(); sound.action('back'); hooks.pulse('left', 0.6, 30); }
    if (S.pump < 0.15 && S.wasBack) { S.wasBack = false; if (S.tube > 0) { S.tube--; S.chamber = 1; } sound.action('fwd'); hooks.pulse('left', 0.7, 30); status(); }
  };
  const load = () => { if (!S.shell || S.tube >= TUBE) return false; S.shell = false; S.tube++; sound.action('shell'); hooks.pulse('left', 0.5, 25); hooks.pulse('right', 0.3, 20); status(); return true; };
  const takeBox = () => { if (S.pouch >= 25) return; S.pouch = 25; sound.action('shell'); say('25 SHELLS ON YOUR BELT'); };

  // eye: on a screen the shot goes where the middle of the picture is, from your eye; in a headset from the muzzle, where the barrel points
  function shoot(eye) {
    if (S.chamber !== 1 || S.pump > 0.15) { sound.action('dry'); return false; }
    S.chamber = 2; S.shots++; S.kick = 1; sound.boom(); hooks.pulse('right', 1, 140); hooks.pulse('left', 0.8, 120);
    const mz = _a.set(0, 0.045, -MUZZLE).applyQuaternion(g.quaternion).add(g.position).clone(), o = eye ? eye.pos.clone() : mz, fwd = _b.set(0, 0, -1).applyQuaternion(eye ? eye.quat : g.quaternion).clone();
    flash.position.copy(mz); flash.intensity = 60; fire.visible = true;
    if (!solidList) { solidList = []; for (const root of [garage.group, street.group]) root.traverse((m) => { if (m.isMesh && !m.isSkinnedMesh && m.material && !(m.material.transparent && !m.material.depthWrite) && !m.material.isMeshBasicMaterial) solidList.push(m); }); }
    for (let i = 0; i < PELLETS; i++) {
      const d = _c.copy(fwd).add(_d.set((Math.random() - 0.5) * 2, (Math.random() - 0.5) * 2, (Math.random() - 0.5) * 2).multiplyScalar(SPREAD)).normalize().clone();
      let best = 90, what = null;
      for (const b of cans) { _d.copy(b.mesh.position).sub(o); const t = _d.dot(d); if (t > 0 && t < best && _d.addScaledVector(d, -t).length() < 0.09) { best = t; what = b; } }
      for (const p of kit.pieces) { _d.copy(o).applyMatrix4(p.inv); const dl = _q.set(0, 0, 0, 1) && _c.copy(d).transformDirection(p.inv); if (Math.abs(dl.y) < 1e-4) continue; const t = -_d.y / dl.y; if (t <= 0 || t >= best) continue; _d.addScaledVector(dl, t); const rho = Math.hypot(_d.x, _d.z); if (rho <= p.radius) { best = t; what = { piece: p, rho }; } }
      { _d.copy(garage.tv.at).sub(o); const t = _d.dot(d); if (t > 0 && t < best && _d.addScaledVector(d, -t).length() < 0.2) { best = t; what = 'tv'; } }
      // (something put away, a car waiting its turn, is not there to be hit)
      ray.set(o, d); const seen = (m) => { for (let p = m; p; p = p.parent) if (!p.visible) return false; return true; }, hit = ray.intersectObjects(solidList, false).find((h) => seen(h.object));
      if (hit && hit.distance < best) {
        const h = holes[holeI++ % holes.length]; h.visible = true; h.position.copy(hit.point); if (hit.face) { _d.copy(hit.face.normal).transformDirection(hit.object.matrixWorld); h.position.addScaledVector(_d, 0.004); h.quaternion.setFromUnitVectors(_a.set(0, 0, 1), _d); } S.hits.wall++;
      } else if (what === 'tv') { garage.tvShot(); S.hits.tv++; }
      else if (what && what.piece) { const p = what.piece, u = what.rho / p.radius; hooks.kit(p.name, 0.75 + Math.random() * 0.25, p.kind === 'cymbal' ? (u < 0.24 ? 'bell' : u > 0.82 ? 'edge' : 'bow') : 'head', u); S.hits.kit++; }
      else if (what) { what.rest = false; what.v.copy(d).multiplyScalar(5 + Math.random() * 3).add(_d.set((Math.random() - 0.5) * 2, 2.5 + Math.random() * 2, (Math.random() - 0.5) * 2)); what.w.set(Math.random() * 20, Math.random() * 20, Math.random() * 20); S.hits.can++; }
    }
    street.scare(o.x, o.z);
    return true;
  }

  // inp: { vr, R: {pos, quat, grip, gripDown, gripUp, trigDown}, L: {...}, head: {pos, quat}, feet: Vector3, screen: {fire, reload, pump, use} }
  S.update = (dt, time, inp) => {
    const R = inp.R, L = inp.L; S.eye = inp.head;
    flash.intensity = Math.max(0, flash.intensity - dt * 700); if (flash.intensity <= 0) fire.visible = false;
    S.kick = Math.max(0, S.kick - dt * 6);
    if (inp.vr) {
      if (!S.held && R.gripDown && R.pos.distanceTo(g.position) < 0.4) { S.held = true; S.where = 'hand'; status(); }
      else if (S.held && R.gripUp) { S.held = false; S.fore = false; if (R.pos.distanceTo(RACK) < 0.6) S.where = 'rack'; else { S.where = 'floor'; S.floor.set(R.pos.x, 0.03, R.pos.z); } }
      if (S.held) {
        g.position.copy(R.pos);
        // the off hand on the fore-end steers the barrel and works the pump
        _a.copy(L.pos).sub(R.pos); const along = _a.dot(_b.set(0, 0, -1).applyQuaternion(g.quaternion));
        if (L.gripDown && !S.shell && along > 0.18 && along < 0.6 && _a.addScaledVector(_b, -along).length() < 0.16) S.fore = true;
        if (!L.grip) S.fore = false;
        if (S.fore) { _a.copy(L.pos).sub(R.pos); const len = _a.length(); _m.lookAt(R.pos, L.pos, UP); g.quaternion.setFromRotationMatrix(_m).multiply(_q.setFromAxisAngle(_b.set(1, 0, 0), -0.06)); setPump((FORE + 0.04 - len) / STROKE); }
        else { g.quaternion.copy(R.quat).multiply(_q.setFromAxisAngle(_b.set(1, 0, 0), -0.55)); if (S.pump > 0) setPump(S.pump - dt * 6); }
        if (R.trigDown) shoot();
        // a shell: taken at the hip or from the box, then pushed in under the receiver
        if (L.gripDown && !S.fore && !S.shell) { _a.copy(L.pos).sub(inp.head.pos); if (L.pos.distanceTo(BOX) < 0.3) { takeBox(); S.pouch--; S.shell = true; } else if (S.pouch > 0 && _a.y < -0.3 && _a.y > -1.0 && Math.hypot(_a.x, _a.z) < 0.45) { S.pouch--; S.shell = true; hooks.pulse('left', 0.3, 15); } }
        if (S.shell && !L.grip) { S.shell = false; S.pouch++; }
        if (S.shell && L.pos.distanceTo(_a.copy(PORT).applyQuaternion(g.quaternion).add(g.position)) < 0.1) load();
      } else if (L.gripDown && L.pos.distanceTo(BOX) < 0.3) takeBox();
      inHand.visible = S.shell; if (S.shell) { inHand.position.copy(L.pos); inHand.quaternion.copy(L.quat); }
    } else if (inp.screen) {
      const sc = inp.screen, near = (p, r) => Math.hypot(inp.feet.x - p.x, inp.feet.z - p.z) < r;
      if (sc.use) { if (!S.held && (S.where === 'rack' ? near(RACK, 1.4) : near(S.floor, 1.4))) { S.held = true; S.where = 'hand'; status(); } else if (S.held && near(RACK, 1.4)) { S.held = false; S.where = 'rack'; } else if (near(BOX, 1.4)) takeBox(); else if (near(garage.tv.at, 1.6)) garage.tvToggle(); }
      if (S.held) {
        g.quaternion.copy(inp.head.quat).multiply(_q.setFromAxisAngle(_b.set(1, 0, 0), S.kick * 0.22));
        g.position.copy(_a.set(0.17, -0.2 - (S.act ? 0.03 : 0), -0.28).applyQuaternion(inp.head.quat).add(inp.head.pos));
        // one key works the whole action a step at a time, as hands would
        if (S.act) { S.actT += dt; if (S.act === 'pump') { if (!S.gone) { setPump(Math.min(1, S.actT / 0.13)); if (S.actT >= 0.13) { setPump(1); S.gone = true; } } else { setPump(Math.max(0, 1 - (S.actT - 0.16) / 0.13)); if (S.pump <= 0) S.act = null; } } else if (S.actT >= 0.45) { S.shell = true; S.pouch--; load(); S.act = null; } }
        else if (sc.fire) { if (S.chamber === 1) shoot(inp.head); else if (S.tube > 0 || S.chamber === 2) { S.act = 'pump'; S.actT = 0; S.gone = false; } else sound.action('dry'); }
        else if (sc.pump) { S.act = 'pump'; S.actT = 0; S.gone = false; }
        else if (sc.reload && S.pouch > 0 && S.tube < TUBE) { S.act = 'load'; S.actT = 0; }
      }
    }
    if (!S.held) { if (S.where === 'rack') { g.position.copy(RACK); g.rotation.set(0, Math.PI / 2, 0); } else { g.position.copy(S.floor); g.rotation.set(0, 0.7, Math.PI / 2); } }
    for (const b of bodies) {
      if (b.rest) continue;
      b.v.y -= 9.8 * dt; b.mesh.position.addScaledVector(b.v, dt); b.mesh.rotation.x += b.w.x * dt; b.mesh.rotation.z += b.w.z * dt;
      if (b.mesh.position.y < b.r) { b.mesh.position.y = b.r; b.v.y = -b.v.y * 0.32; b.v.x *= 0.7; b.v.z *= 0.7; b.w.multiplyScalar(0.6); if (b.v.lengthSq() < 0.2) { b.rest = true; b.v.set(0, 0, 0); } }
    }
  };
  // the cans stood up again (each new day, and when asked)
  S.reset = () => { for (const b of cans) { b.mesh.position.copy(b.home); b.mesh.rotation.set(0, 0, 0); b.v.set(0, 0, 0); b.rest = true; } for (const h of holes) h.visible = false; };
  S.shoot = (fromEye) => shoot(fromEye ? S.eye : undefined); S.cans = cans;
  return S;
}
