// EYES DOWN's apartment: a studio on the 31st floor, 7 by 5 metres, 1985; its walls, window and wet glass, furniture, lights, loose things, doors, and the spots where they wait
import { THREE, RAPIER, LOW, scene, renderer, camera, P, G, grp, clamp, lerp, rnd, pick, mat, stat, block, dyn, sBox, sCyl, sBall, model, place, CLOCK } from './core.js';
import { CITY, dot } from './city.js';
import { Reflector } from 'three/addons/objects/Reflector.js';
import { mergeGeometries as mergeG } from 'three/addons/utils/BufferGeometryUtils.js';

const H = 2.6, XR = () => renderer.xr.isPresenting;
const ROOM = { uses: [], spots: {}, seats: {}, lights: {}, power: true, tv: { on: false, ch: 0, k: 0, msg: '' }, fridge: { open: false, a: 0 }, bathDoor: { shut: false, a: 0 }, chain: false, front: { a: 0 }, bed: null, glassM: null, rainRT: null, mirror: null, curtain: null, dirt: [] };
const V = (x, y, z) => new THREE.Vector3(x, y, z);
const plain = (color, rough = .6, o = {}) => { const m = new THREE.MeshStandardMaterial({ color, roughness: rough, metalness: o.metal || 0 }); if (o.emissive) { m.emissive = new THREE.Color(o.emissive); m.emissiveIntensity = o.ei ?? 1; } return m; };
const enamel = (color = 0xeee9dc) => new THREE.MeshPhysicalMaterial({ color, roughness: .32, clearcoat: .8, clearcoatRoughness: .15 });
function box(w, h, d, m, x, y, z, parent = scene, cast = true) { const o = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m); o.position.set(x, y, z); o.castShadow = cast; o.receiveShadow = true; parent.add(o); return o; }
function use(id, label, pos, r, act, o = {}) { const U = { id, label, pos, r, act, ...o }; ROOM.uses.push(U); return U; }

/* the rain on the glass: a picture of the water's surface, drawn each frame (drops that sit, drops that slide and leave trails) */
function rainGlass() {
  const rt = new THREE.WebGLRenderTarget(LOW ? 256 : 512, LOW ? 256 : 512, { type: THREE.HalfFloatType, generateMipmaps: true, minFilter: THREE.LinearMipmapLinearFilter, wrapS: THREE.RepeatWrapping, wrapT: THREE.RepeatWrapping });
  const sm = new THREE.ShaderMaterial({ uniforms: { t: { value: 0 } }, vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0., 1.); }',
    fragmentShader: `varying vec2 vUv; uniform float t;
      vec3 N3(float p){ vec3 p3 = fract(vec3(p) * vec3(.1031,.11369,.13787)); p3 += dot(p3, p3.yzx + 19.19); return fract(vec3((p3.x + p3.y)*p3.z, (p3.x+p3.z)*p3.y, (p3.y+p3.z)*p3.x)); }
      float N(float t){ return fract(sin(t*12345.564)*7658.76); }
      float S(float a, float b, float t){ return smoothstep(a, b, t); }
      // a layer of drops that hang, then slip down in jerks, leaving a trail
      vec3 layer(vec2 UV, float t){ vec2 a = vec2(6., 1.); vec2 g = a*2.; vec2 uv = UV*g; float y = 0.; uv.y += t*.75; vec2 id = floor(uv); vec3 n = N3(id.x*35.2 + id.y*2376.1); uv.x += (n.x-.5)*.6;
        vec2 st = fract(uv) - vec2(.5, 0.); float x = n.x - .5; float ti = fract(t + n.z); y = (S(.85,1.,ti) - S(0.,.85,ti))*.45 + .5 + (n.z-.5)*.2; float wig = sin(uv.y*40.)*.02*(1.-y);
        vec2 p = (st - vec2(x*.6 + wig, y))/vec2(1., 2.); float d = length(p); float m = S(.24, 0., d);
        float tr = S(-.05, .05, st.y - y)*S(1.,.4,st.y)*S(.06, .0, abs(st.x - x*.6 - wig)); vec2 tp = vec2(st.x - x*.6 - wig, fract(st.y*8.) - .5); float td = length(tp/vec2(1.,1.)); float tm = S(.28,0.,td)*tr*S(y, 1., st.y);
        vec2 dir = p * 3.; return vec3(dir*m + tp*tm*.6, max(m, tm*.7)); }
      // still beads
      vec3 beads(vec2 uv){ uv *= 40.; vec2 id = floor(uv); uv = fract(uv) - .5; vec3 n = N3(id.x*107.45 + id.y*3543.654); vec2 p = (n.xy - .5)*.7; float r = mix(.08,.24,n.z); vec2 q = uv - p; float d = length(q); float m = S(r, r*.4, d) * step(.55, fract(n.z*10.)); return vec3(q/r*m, m); }
      void main(){ vec2 uv = vUv * vec2(1., 1.6); vec3 a = layer(uv, t*.35), b = layer(uv*1.7 + 7.1, t*.27), c = beads(vUv);
        vec2 n = a.xy + b.xy*.8 + c.xy*.9; float wet = clamp(a.z + b.z + c.z, 0., 1.);
        gl_FragColor = vec4(n*.5 + .5, wet, 1.); }` });
  const q = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), sm), qs = new THREE.Scene(), qc = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1); q.frustumCulled = false; qs.add(q);
  ROOM.rainRT = { rt, sm, qs, qc }; rt.texture.repeat.set(3.2, 2.4);
  // the normal map reads the picture's first two channels as the surface's tilt
  const m = new THREE.MeshPhysicalMaterial({ color: 0xb8c4d0, transparent: true, opacity: .14, roughness: .02, metalness: 0, normalMap: rt.texture, specularIntensity: 1, envMapIntensity: 1.6, clearcoat: 1, clearcoatRoughness: 0, depthWrite: false });
  m.normalScale.set(.6, -.6); ROOM.glassM = m; return m;
}
function drawRain(t) { const R = ROOM.rainRT; if (!R) return; R.sm.uniforms.t.value = t; const xr = renderer.xr.enabled, old = renderer.getRenderTarget(); renderer.xr.enabled = false; renderer.setRenderTarget(R.rt); renderer.render(R.qs, R.qc); renderer.setRenderTarget(old); renderer.xr.enabled = xr; }

function walls(M) {
  const T = .35;
  // floors: kitchen tiles, parquet, bathroom tiles; none overlapping, all at y = 0
  stat(0, -.1, 0, 2.4, 0, 1.9, M.ktile); stat(2.4, -.1, 0, 7, 0, 3, M.parq); stat(0, -.1, 1.9, 2.4, 0, 5, M.parq); stat(2.4, -.1, 3, 5, 0, 5, M.parq); stat(5, -.1, 3, 7, 0, 5, M.btile);
  stat(-T - .3, H, -T - .3, 7 + T + .3, H + .35, 5 + T + .3, M.ceil); stat(-T - .3, -.45, -T - .3, 7 + T + .3, -.1, 5 + T + .3, null);
  // the north wall, around two windows
  const N = (x0, x1, y0, y1) => stat(x0, y0, -T, x1, y1, 0, M.wall);
  N(-T, 2.6, 0, H); N(2.6, 4.6, 0, .85); N(2.6, 4.6, 2.35, H); N(4.6, 5.1, 0, H); N(5.1, 5.9, 0, .95); N(5.1, 5.9, 2.25, H); N(5.9, 7 + T, 0, H);
  // south wall with the front door
  stat(-T, 0, 5, .3, H, 5 + T, M.wall); stat(.3, 2.1, 5, 1.2, H, 5 + T, M.wall); stat(1.2, 0, 5, 7 + T, H, 5 + T, M.wall);
  stat(-T, 0, 0, 0, H, 5, M.wall); stat(7, 0, 0, 7 + T, H, 5, M.wall);
  // the bed alcove's partition, and the bathroom's two walls with its doorway
  stat(4.75, 0, 0, 4.85, H, 1.6, M.wall);
  stat(5, 0, 2.95, 7, H, 3.05, M.wall); stat(5, 0, 3.05, 5.1, H, 3.3, M.wall); stat(5, 0, 4.1, 5.1, H, 5, M.wall); stat(5, 2.05, 3.3, 5.1, H, 4.1, M.wall);
  // wood panelling on the living room's south wall, tiles to shoulder height in the bathroom and behind the kitchen counter
  stat(1.97, 0, 4.975, 4.98, 2.4, 5, M.panel, { ghost: true }); stat(1.97, 2.4, 4.96, 4.98, 2.45, 5, M.trim, { ghost: true });
  stat(5.1, 0, 3.05, 7, 1.4, 3.075, M.wtile, { ghost: true }); stat(6.975, 0, 3.075, 7, 1.4, 5, M.wtile, { ghost: true }); stat(5.1, 0, 4.975, 6.975, 1.4, 5, M.wtile, { ghost: true });
  stat(.75, .92, 0, 2.4, 1.5, .02, M.wtile, { ghost: true });
  // skirting boards
  for (const [x0, z0, x1, z1] of [[0, .005, 7, .02], [0, 4.98, 1.97, 4.995], [4.98, 4.98, 5, 4.995], [.005, 0, .02, 5], [6.98, 0, 6.995, 3]]) stat(x0, 0, z0, x1, .09, z1, M.trim, { ghost: true });
}

function window_(M, x0, x1, y0, y1, blinds) {
  const fr = M.frame, w = x1 - x0, cx = (x0 + x1) / 2;
  stat(x0, y0 - .05, -.24, x1, y0, .08, M.sill); stat(x0 - .06, y0, -.04, x0, y1, .02, fr, { ghost: true }); stat(x1, y0, -.04, x1 + .06, y1, .02, fr, { ghost: true }); stat(x0, y1, -.04, x1, y1 + .06, .02, fr, { ghost: true });
  box(.05, y1 - y0, .05, fr, cx, (y0 + y1) / 2, -.08); box(w, .05, .05, fr, cx, y0 + (y1 - y0) * .62, -.08);
  const g = new THREE.Mesh(new THREE.PlaneGeometry(w, y1 - y0), ROOM.glassM); g.position.set(cx, (y0 + y1) / 2, -.1); g.renderOrder = 2; scene.add(g);
  const c = P.world.createCollider(RAPIER.ColliderDesc.cuboid(w / 2, (y1 - y0) / 2, .02).setTranslation(cx, (y0 + y1) / 2, -.1).setCollisionGroups(grp(G.SOLID, G.PLAYER | G.HAND))); P.byCol.set(c.handle, { kind: 'glass', fixed: true });
  // venetian blinds: a bundle drawn up, or let down with the slats half open
  const slat = new THREE.MeshStandardMaterial({ color: 0xcfc6b2, roughness: .5, metalness: .1, side: THREE.DoubleSide }), gs = [];
  const bottom = blinds === 'down' ? y0 + (y1 - y0) * .4 : y1 - .14, step = .045;
  for (let y = y1 - .03; y > bottom; y -= blinds === 'down' ? step : .008) { const s = new THREE.BoxGeometry(w + .02, .002, .05); s.rotateX(blinds === 'down' ? .6 : 0); s.translate(cx, y, .06); gs.push(s); }
  const BL = new THREE.Mesh(mergeG(gs), slat); BL.castShadow = true; BL.receiveShadow = true; scene.add(BL);
  box(w + .04, .04, .06, slat, cx, bottom - .02, .06); box(w + .06, .05, .07, fr, cx, y1 - .01, .06);
  return g;
}
function radiator(M, x0, x1) { const gs = []; for (let x = x0; x < x1; x += .065) { const f = new THREE.BoxGeometry(.045, .58, .12); f.translate(x, .44, .14); gs.push(f); const t = new THREE.CylinderGeometry(.03, .03, .58, 8); t.translate(x, .44, .14); gs.push(t); }
  const r = new THREE.Mesh(mergeG(gs.map(g => g.index ? g.toNonIndexed() : g)), M.radiator); r.castShadow = r.receiveShadow = true; scene.add(r); block(x1 - x0, .6, .14, (x0 + x1) / 2, .44, .14, 0, 'metal');
  for (const x of [x0 + .05, x1 - .05]) box(.04, .14, .04, M.radiator, x, .08, .14); }

function kitchen(M) {
  const top = plain(0xd8cdb4, .35), cab = M.cab;
  // the north counter: stove, sink; the west counter with the microwave
  stat(.75, 0, 0, 2.4, .86, .6, cab); stat(.72, .86, 0, 1.55, .9, .62, top.clone()); stat(2.15, .86, 0, 2.43, .9, .62, top); stat(1.55, .86, 0, 2.15, .9, .08, top); stat(1.55, .86, .54, 2.15, .9, .62, top);
  stat(0, 0, .75, .6, .86, 2.05, cab); stat(0, .86, .72, .62, .9, 2.08, top);
  for (let x = .8; x < 2.4; x += .55) box(.5, .66, .012, M.door, x + .25, .45, .607); for (let z = .8; z < 2; z += .6) box(.012, .66, .52, M.door, .607, .45, z + .3);
  // the sink: a steel basin let into the counter, a tap
  const steel = plain(0xb7bcc0, .25, { metal: 1 }); box(.6, .02, .46, steel, 1.85, .7, .31, scene, false); box(.6, .2, .02, steel, 1.85, .79, .085, scene, false); box(.6, .2, .02, steel, 1.85, .79, .535, scene, false); box(.02, .2, .44, steel, 1.555, .79, .31, scene, false); box(.02, .2, .44, steel, 2.145, .79, .31, scene, false);
  const tap = new THREE.Mesh(new THREE.TorusGeometry(.09, .012, 8, 16, Math.PI), steel); tap.position.set(1.85, .99, .05); tap.rotation.y = Math.PI / 2; scene.add(tap); box(.03, .1, .03, steel, 1.85, .94, .05);
  ROOM.seats.sink = { pos: V(1.85, 0, .95), yaw: 0 };
  // the stove, an enamel pot on it
  const st = model('electric_stove', { h: .9 }); place(st, 1.15, 0, .31, 0); stat(.8, 0, .02, 1.5, .88, .6, null);
  ROOM.stove = { pos: V(1.15, .95, .3), heat: 0, on: false };
  // upper cupboards and the light under them
  stat(.75, 1.5, 0, 2.4, 2.25, .34, cab, { ghost: true }); for (let x = .78; x < 2.4; x += .55) box(.5, .7, .012, M.door, x + .25, 1.875, .347);
  const ul = new THREE.Mesh(new THREE.BoxGeometry(1.4, .02, .04), plain(0xfff0d8, .5, { emissive: 0xffe2b0, ei: 1.2 })); ul.position.set(1.55, 1.49, .25); scene.add(ul); ROOM.lights.under = { m: ul.material, base: 2 };
  const under = new THREE.PointLight(0xffd9a8, 1.1, 2.2, 2); under.position.set(1.55, 1.4, .35); scene.add(under); ROOM.lights.under.L = under; ROOM.lights.under.I = 1.1;
  // the microwave, kettle, a radio
  const mw = model('vintage_microwave', { h: .3 }); place(mw, .3, .9, 1.25, Math.PI / 2); block(.4, .3, .6, .3, 1.05, 1.25);
  place(model('boombox', { h: .26 }), .25, .9, 1.85, Math.PI / 2); const led = box(.012, .012, .006, plain(0x330000, .5, { emissive: 0xff2200, ei: 0 }), .4, 1.0, 1.85, scene, false); ROOM.radio = { on: false, led: led.material, pos: V(.3, 1.05, 1.85) };
  use('radio', 'the radio', V(.3, 1.0, 1.85), 1.1, () => { ROOM.radio.on = !ROOM.radio.on; ROOM.sfx && ROOM.sfx('click', ROOM.radio.pos); return 'radio'; });
  // a blender on the counter, its glass jar
  const bl = new THREE.Group(), base = new THREE.Mesh(new THREE.CylinderGeometry(.07, .085, .14, 18), enamel(0xd9d1bd)); base.position.y = .07; bl.add(base);
  const jar = new THREE.Mesh(new THREE.CylinderGeometry(.07, .055, .2, 18, 1, true), new THREE.MeshPhysicalMaterial({ color: 0xdfe8ea, transmission: .7, roughness: .08, transparent: true, opacity: .45, side: THREE.DoubleSide })); jar.position.y = .24; bl.add(jar);
  const lid2 = new THREE.Mesh(new THREE.CylinderGeometry(.073, .073, .02, 18), plain(0x2a2a2a, .5)); lid2.position.y = .35; bl.add(lid2); const blade = new THREE.Mesh(new THREE.BoxGeometry(.09, .004, .015), plain(0x999999, .3, { metal: 1 })); blade.position.y = .16; bl.add(blade);
  bl.traverse(o => { o.castShadow = true; }); bl.position.set(2.28, .9, .3); scene.add(bl); block(.17, .36, .17, 2.28, 1.08, .3); ROOM.blender = { on: false, blade, g: bl, pos: V(2.28, 1.05, .3) };
  use('blender', 'the blender', V(2.28, 1.05, .32), 1.1, () => { ROOM.blender.on = !ROOM.blender.on; ROOM.sfx && ROOM.sfx('click', ROOM.blender.pos); return 'blender'; });
  // the refrigerator: enamel, a chrome handle, its own light, the door on a hinge
  const fm = enamel(0xe9e2cf); stat(.02, 0, .02, .07, 1.72, .7, fm); stat(.68, 0, .02, .73, 1.72, .7, fm); stat(.07, 0, .02, .68, .08, .7, fm); stat(.07, 1.66, .02, .68, 1.72, .7, fm); stat(.07, .08, .02, .68, 1.66, .07, fm);
  const inside = plain(0xe8eef0, .5); for (const y of [.55, 1.0, 1.35]) box(.6, .015, .6, new THREE.MeshPhysicalMaterial({ color: 0xffffff, transmission: .6, roughness: .2 }), .375, y, .38, scene, false);
  box(.6, 1.56, .01, inside, .375, .86, .08, scene, false);
  const fl = new THREE.PointLight(0xe8f4ff, 0, 2.4, 2); fl.position.set(.38, 1.5, .5); scene.add(fl); ROOM.lights.fridge = { L: fl, I: 2.2 };
  const hinge = new THREE.Group(); hinge.position.set(.73, 0, .73); scene.add(hinge); const door = box(.71, 1.7, .06, fm, -.355, .86, .03, hinge); box(.025, .5, .04, steel, -.65, 1.05, .09, hinge); box(.6, .7, .012, plain(0xe0e8ea, .5), -.355, .9, -.006, hinge, false);
  ROOM.fridge.hinge = hinge; ROOM.fridge.door = door;
  const milk = model('long_life_food', { h: .24 }); ROOM.milk = dyn(milk, [sBox(.11, .24, .11, 0, .12, 0)], { x: .3, y: 1.02, z: .35, mass: 1, kind: 'carton' });
  use('fridge', 'the refrigerator', V(.4, 1, .75), 1.3, () => { ROOM.fridge.open = !ROOM.fridge.open; ROOM.sfx && ROOM.sfx(ROOM.fridge.open ? 'fridgeOpen' : 'fridgeShut', V(.4, 1, .6)); return 'fridge'; });
  use('stove', 'the stove', V(1.15, .95, .45), 1.2, () => { ROOM.stove.on = !ROOM.stove.on; ROOM.sfx && ROOM.sfx('click', ROOM.stove.pos); return 'stove'; });
  const stream = new THREE.Mesh(new THREE.CylinderGeometry(.006, .008, .26, 8), new THREE.MeshPhysicalMaterial({ color: 0xcfe0e8, transmission: .8, roughness: .05, transparent: true, opacity: .55 })); stream.position.set(1.85, .83, .1); stream.visible = false; scene.add(stream);
  ROOM.tap = { on: false, stream, pos: V(1.85, .9, .15) };
  use('sink', 'the tap', V(1.85, .95, .4), 1.2, () => { ROOM.tap.on = !ROOM.tap.on; ROOM.sfx && ROOM.sfx('click', ROOM.tap.pos); return 'sink'; });
  const coil = new THREE.Mesh(new THREE.TorusGeometry(.075, .008, 6, 24), plain(0x222222, .6, { emissive: 0xff3300, ei: 0 })); coil.rotation.x = Math.PI / 2; coil.position.set(1.0, .905, .2); scene.add(coil); ROOM.coil = coil.material;
  // the table, two chairs, a plate and a glass
  const tb = model('round_wooden_table_01', { h: .75 }); place(tb, 1.25, 0, 2.65); block(.9, .75, .9, 1.25, .37, 2.65);
  place(model('dining_chair_02', { h: .95 }), .6, 0, 2.65, Math.PI / 2); block(.45, .48, .45, .6, .24, 2.65); place(model('dining_chair_02', { h: .95 }), 1.9, 0, 2.65, -Math.PI / 2); block(.45, .48, .45, 1.9, .24, 2.65);
  ROOM.seats.table = { pos: V(.62, 0, 2.65), yaw: -Math.PI / 2, eye: 1.18 };
  const plateM = enamel(0xf3efe6); dyn(new THREE.Mesh(new THREE.CylinderGeometry(.12, .1, .02, 24), plateM), [sCyl(.12, .02)], { x: .98, y: .77, z: 2.65, mass: .4, kind: 'plate' });
  dyn(new THREE.Mesh(new THREE.CylinderGeometry(.11, .09, .02, 24), plateM), [sCyl(.11, .02)], { x: 1.52, y: .77, z: 2.65, mass: .4, kind: 'plate' });
  const mug = new THREE.Group(), mm = enamel(0x8a2a1f), cyl = new THREE.Mesh(new THREE.CylinderGeometry(.045, .04, .1, 18), mm); cyl.castShadow = true; mug.add(cyl); const h2 = new THREE.Mesh(new THREE.TorusGeometry(.03, .008, 6, 12), mm); h2.position.x = .05; mug.add(h2);
  dyn(mug, [sCyl(.045, .1)], { x: 1.25, y: .81, z: 2.45, mass: .3, kind: 'plate' });
  dyn(model('jug_01', { h: .2 }), [sCyl(.08, .2, 0, .1)], { x: 1.3, y: .76, z: 2.85, mass: .8, kind: 'plate' });
  dyn(model('pot_enamel_01', { h: .17 }), [sCyl(.11, .17, 0, .085)], { x: 1.0, y: .92, z: .2, mass: 1.2, kind: 'metal' });
  dyn(model('vintage_electric_kettle', { h: .26 }), [sCyl(.1, .26, 0, .13)], { x: .3, y: .91, z: 1.65, mass: 1.1, kind: 'metal' });
  const bowl = model('wooden_bowl_01', { h: .08 }); dyn(bowl, [sCyl(.14, .08, 0, .04)], { x: .32, y: .91, z: .95, mass: .5, kind: 'wood' });
  for (const [x, z] of [[.28, .9], [.36, 1.0]]) dyn(model('food_apple_01', { h: .08 }), [sBall(.04, 0, .04, 0)], { x, y: .96, z, mass: .2, kind: 'soft' });
}

function living(M) {
  // a rug, the sofa facing the set, a footstool, the set on its cabinet
  stat(2.75, 0, 3.0, 4.3, .012, 4.8, M.rug, { ghost: true });
  const sofa = model('sofa_02', { long: 2.0 }); place(sofa, 2.45, 0, 3.9, Math.PI / 2); block(.8, .45, 2, 2.45, .22, 3.9, 0, 'soft'); block(.25, .8, 2, 2.15, .4, 3.9, 0, 'soft');
  ROOM.seats.sofa = { pos: V(2.5, 0, 4.35), yaw: -Math.PI / 2, eye: 1.12 }; ROOM.spots.sofa = { pos: V(2.5, 0, 3.4), yaw: Math.PI / 2, pose: 'sit' };
  for (const z of [3.1, 4.7]) dyn(pillow(M), [sBox(.4, .14, .4)], { x: 2.35, y: .6, z, mass: .5, kind: 'soft', ry: rnd(-.3, .3) });
  const ot = model('ottoman_01', { h: .42 }); place(ot, 3.55, 0, 3.9, Math.PI / 2); block(.62, .42, .88, 3.55, .21, 3.9, 0, 'soft');
  dyn(new THREE.Mesh(new THREE.BoxGeometry(.05, .02, .17), plain(0x1d1c1b, .5)), [sBox(.05, .02, .17)], { x: 3.5, y: .44, z: 3.7, mass: .15, kind: 'plastic', ry: .3, name: 'remote' });
  const cab = model('modern_wooden_cabinet', { long: 1.6 }); place(cab, 4.72, 0, 3.9, -Math.PI / 2); const ch = cab.userData.size.y; block(.5, ch, 1.6, 4.72, ch / 2, 3.9);
  const tv = model('television_02', { h: .6 }); place(tv, 4.7, ch, 3.9, -Math.PI / 2);
  dyn(model('cassette_player', { long: .24 }), [sBox(.13, .05, .24, 0, .025, 0)], { x: 4.75, y: ch + .03, z: 4.45, mass: .6, kind: 'plastic', ry: -Math.PI / 2 });
  // the picture on the tube: what the station is showing, drawn by the game (sport, the late news, test cards, snow)
  const sc = document.createElement('canvas'); sc.width = 256; sc.height = 192; const tex = new THREE.CanvasTexture(sc); tex.colorSpace = THREE.SRGBColorSpace;
  const sg = new THREE.PlaneGeometry(.34, .26, 12, 10), sp = sg.attributes.position; for (let i = 0; i < sp.count; i++) { const x = sp.getX(i) / .17, y = sp.getY(i) / .13; sp.setZ(i, .018 * (1 - x * x * .5 - y * y * .5)); } sg.computeVertexNormals();
  const scr = new THREE.Mesh(sg, new THREE.MeshBasicMaterial({ map: tex, toneMapped: false })); scr.position.set(4.44, ch + .33, 3.9); scr.scale.setScalar(1.15); scr.rotation.y = -Math.PI / 2; scene.add(scr);
  ROOM.tv = { ...ROOM.tv, canvas: sc, g: sc.getContext('2d'), tex, scr, pos: V(4.47, ch + .27, 3.9), noise: 0, last: 0 };
  const tl = new THREE.SpotLight(0x9fb8ff, 0, 7, 1.2, .9, 2); tl.position.set(4.44, ch + .28, 3.9); tl.target.position.set(1.5, .8, 3.9); scene.add(tl, tl.target); tl.castShadow = !LOW; tl.shadow.mapSize.set(512, 512); tl.shadow.bias = -.0005; tl.shadow.normalBias = .03; ROOM.lights.tv = { L: tl };
  use('tv', 'the television', V(4.5, ch + .2, 3.9), 1.4, () => { ROOM.tv.on = !ROOM.tv.on; ROOM.sfx && ROOM.sfx('tv', ROOM.tv.pos); return 'tv'; });
  use('sofa', 'the sofa', V(2.55, .5, 4.35), 1.2, () => 'sofa');
  // the reading chair by the window, a plant, a cupboard of books against the partition, a picture, the clock
  place(model('mid_century_lounge_chair', { h: .95 }), 2.55, 0, .95, Math.PI * .85); block(.8, .45, .8, 2.55, .22, .95, Math.PI * .85, 'soft');
  place(model('potted_plant_02', { h: .75 }), 2.3, 0, 4.72); block(.5, .5, .5, 2.3, .25, 4.72);
  const pc = model('painted_wooden_cabinet', { h: .95 }); place(pc, 4.43, 0, .95, -Math.PI / 2); const pw = pc.userData.size; block(pw.z, .95, pw.x, 4.43, .475, .95);
  const bk = [0x5a1e18, 0x1e3a5a, 0x2d4a28, 0x6b5a2a, 0x3a2a4a, 0x7a3a1a, 0x1a1a1a]; for (let i = 0; i < 9; i++) { const h = rnd(.19, .26), w = rnd(.03, .05); dyn(new THREE.Mesh(new THREE.BoxGeometry(.16, h, w), plain(pick(bk), .7)), [sBox(.16, h, w)], { x: 4.43, y: .96 + h / 2, z: .62 + i * .055, mass: .4, kind: 'book' }); }
  place(model('hanging_picture_frame_02', { w: .75 }), 4.735, 1.45, .95, -Math.PI / 2);
  const clock = model('wall_clock', { h: .32 }); place(clock, 3.3, 1.95, 4.95, Math.PI);
  radiator(M, 2.85, 4.35);
  // the light in the middle of the ceiling: a glass globe on a stem
  const lamp = model('modern_ceiling_lamp_01', { h: .5 }); place(lamp, 3.3, H - .5, 2.4); lamp.traverse(o => { if (o.isMesh) o.castShadow = false; });
  const glow = new THREE.Mesh(new THREE.SphereGeometry(.13, 20, 14), plain(0xfff1d8, .5, { emissive: 0xffd9a0, ei: .9 })); glow.position.set(3.3, H - .43, 2.4); glow.scale.setScalar(.75); glow.castShadow = false; scene.add(glow);
  const main = new THREE.SpotLight(0xffb873, 70, 0, 1.1, 1, 2); main.position.set(3.3, H - .5, 2.4); main.target.position.set(3.3, 0, 2.4); scene.add(main, main.target);
  main.castShadow = true; main.shadow.mapSize.set(LOW ? 1024 : 2048, LOW ? 1024 : 2048); main.shadow.bias = -.0003; main.shadow.normalBias = .025; main.shadow.camera.near = .2; main.shadow.camera.far = 9; main.shadow.radius = 3;
  const fill = new THREE.PointLight(0xffb873, 2.2, 6, 2); fill.position.set(3.3, H - .25, 2.4); scene.add(fill);
  ROOM.lights.main = { L: main, I: 70, fill, fI: 2.2, glow: glow.material, on: true };
}
function pillow(M) { const g = new THREE.SphereGeometry(.22, 20, 12); g.scale(1, .32, 1); const p = g.attributes.position; for (let i = 0; i < p.count; i++) { const x = p.getX(i), z = p.getZ(i); p.setY(i, p.getY(i) * (1 - Math.pow(Math.max(Math.abs(x), Math.abs(z)) / .22, 4) * .6)); } g.computeVertexNormals();
  const m = new THREE.Mesh(g, M.pillow); m.castShadow = m.receiveShadow = true; return m; }

function bedroom(M) {
  const bf = model('old_bed_frame', { long: 2.05 }); const s = bf.userData.size; place(bf, 6.45, 0, 1.1, s.x > s.z ? Math.PI / 2 : 0); block(.95, .55, 2.0, 6.45, .28, 1.1, 0, 'soft');
  const mat_ = new THREE.Mesh(new THREE.BoxGeometry(.92, .2, 1.92, 4, 1, 8), M.mattress); mat_.position.set(6.45, .46, 1.12); mat_.castShadow = mat_.receiveShadow = true; scene.add(mat_);
  const bl = new THREE.BoxGeometry(1.0, .06, 1.45, 10, 1, 14), bp = bl.attributes.position; for (let i = 0; i < bp.count; i++) { const x = bp.getX(i), z = bp.getZ(i); bp.setY(i, bp.getY(i) + Math.sin(x * 9 + z * 4) * .012 + Math.sin(z * 11) * .008 - (Math.abs(x) > .45 ? (Math.abs(x) - .45) * 2.5 : 0)); } bl.computeVertexNormals();
  const blanket = new THREE.Mesh(bl, M.blanket); blanket.position.set(6.45, .59, 1.4); blanket.castShadow = blanket.receiveShadow = true; scene.add(blanket); ROOM.blanket = blanket;
  for (const x of [6.25, 6.66]) { const p = pillow(M); p.position.set(x, .62, .35); p.scale.set(.95, 1, .7); scene.add(p); }
  ROOM.seats.bed = { pos: V(6.45, 0, 1.4), yaw: 0, eye: .78, lie: true }; ROOM.bed = { pos: V(6.45, .6, 1.2) };
  use('bed', 'the bed', V(6.3, .6, 1.6), 1.4, () => 'bed');
  const ns = model('classicnightstand_01', { h: .6 }); place(ns, 5.6, 0, .3); block(.48, .6, .38, 5.6, .3, .3);
  ROOM.alarm = dyn(model('alarm_clock_01', { h: .14 }), [sBox(.1, .14, .1, 0, .07, 0)], { x: 5.5, y: .62, z: .32, mass: .5, kind: 'metal', ry: .3 });
  const dl = model('desk_lamp_arm_01', { h: .48 }); place(dl, 5.75, .6, .22, -.4);
  const bl2 = new THREE.SpotLight(0xffc27a, 0, 5, 1.1, .8, 2); bl2.position.set(5.66, 1.02, .38); bl2.target.position.set(5.9, 0, 1.2); scene.add(bl2, bl2.target); bl2.castShadow = !LOW; bl2.shadow.mapSize.set(512, 512); bl2.shadow.bias = -.0005; bl2.shadow.normalBias = .03;
  ROOM.lights.bed = { L: bl2, I: 10, on: false };
  use('lamp', 'the bedside lamp', V(5.7, .9, .3), 1.1, () => { ROOM.lights.bed.on = !ROOM.lights.bed.on; ROOM.sfx && ROOM.sfx('click', V(5.7, .9, .3)); return 'lamp'; });
}

function bathroom(M) {
  // the basin on its pedestal, the mirror above it, a strip light
  const por = enamel(0xf2efe6); const ped = new THREE.Mesh(new THREE.CylinderGeometry(.09, .13, .78, 20), por); ped.position.set(5.75, .39, 3.25); ped.castShadow = true; scene.add(ped);
  box(.56, .14, .42, por, 5.75, .83, 3.28); box(.4, .02, .26, plain(0x9aa6ad, .2, { metal: 1 }), 5.75, .9, 3.3, scene, false); block(.56, .9, .42, 5.75, .45, 3.28, 0, 'stone');
  ROOM.seats.basin = { pos: V(5.75, 0, 3.85), yaw: 0 };
  const mir = model('ornate_mirror_01', { h: .8 }); place(mir, 5.75, 1.12, 3.06);
  const fl = new THREE.Mesh(new THREE.BoxGeometry(.6, .04, .05), plain(0xf0f8ff, .4, { emissive: 0xe8f6ff, ei: 1.2 })); fl.position.set(5.75, 1.98, 3.1); scene.add(fl);
  const bl = new THREE.PointLight(0xd6f0e6, 1.6, 3.2, 2); bl.position.set(5.75, 1.9, 3.3); scene.add(bl); ROOM.lights.bath = { L: bl, I: 1.6, m: fl.material, on: true, flick: 0 };
  // the reflection: a second picture of the room from behind the glass, only while you are in here
  const rf = new Reflector(new THREE.PlaneGeometry(.42, .62), { textureWidth: LOW ? 256 : 512, textureHeight: LOW ? 384 : 768, color: 0x8a8f8f, clipBias: .003 }); rf.position.set(5.75, 1.52, 3.082); scene.add(rf); ROOM.mirror = { rf, plane: new THREE.Plane(new THREE.Vector3(0, 0, 1), -3.082), w: .42, h: .62, c: V(5.75, 1.52, 3.082) };
  use('basin', 'the basin', V(5.75, .95, 3.4), 1.2, () => 'basin');
  box(.08, .12, .015, plain(0xe9e2cf, .4), 4.98, 1.25, 4.3).rotation.y = Math.PI / 2; use('bathlight', 'the bathroom light', V(4.97, 1.25, 4.3), 1.0, () => { ROOM.lights.bath.on = !ROOM.lights.bath.on; ROOM.sfx && ROOM.sfx('click', V(4.97, 1.25, 4.3)); return 'bathlight'; });
  // the bath, its curtain, the lavatory
  const tub = enamel(0xf4f1e8); stat(6.2, 0, 3.75, 6.98, .1, 4.98, tub); stat(6.2, .1, 3.75, 6.98, .55, 3.82, tub); stat(6.2, .1, 4.91, 6.98, .55, 4.98, tub); stat(6.2, .1, 3.82, 6.27, .55, 4.91, tub); stat(6.91, .1, 3.82, 6.98, .55, 4.91, tub);
  box(.02, .02, 1.25, plain(0xb7bcc0, .3, { metal: 1 }), 6.2, 2.0, 4.36);
  const cg = new THREE.PlaneGeometry(1.2, 1.75, 30, 4), cp = cg.attributes.position; ROOM.curtainBase = cp.array.slice(); const cm = new THREE.MeshStandardMaterial({ color: 0xc7d4cf, roughness: .7, transparent: true, opacity: .82, side: THREE.DoubleSide });
  const cur = new THREE.Mesh(cg, cm); cur.rotation.y = Math.PI / 2; cur.position.set(6.21, 1.12, 4.36); cur.castShadow = true; scene.add(cur); ROOM.curtain = cur;
  const wc = new THREE.Group(); const bowl = new THREE.Mesh(new THREE.CylinderGeometry(.2, .15, .4, 20), por); bowl.position.y = .2; wc.add(bowl); const tank = new THREE.Mesh(new THREE.BoxGeometry(.42, .38, .18), por); tank.position.set(0, .6, .2); wc.add(tank);
  const seat = new THREE.Mesh(new THREE.TorusGeometry(.17, .03, 8, 20), plain(0xeee9dc, .4)); seat.rotation.x = Math.PI / 2; seat.position.y = .41; wc.add(seat); wc.traverse(o => { o.castShadow = o.receiveShadow = true; }); wc.position.set(5.45, 0, 4.72); wc.rotation.y = Math.PI; scene.add(wc); block(.45, .8, .5, 5.45, .4, 4.72, 0, 'stone');
  // the door: shut it and bolt it
  const hinge = new THREE.Group(); hinge.position.set(5.05, 0, 4.1); scene.add(hinge); box(.04, 2.03, .8, M.doorW, 0, 1.015, -.4, hinge); box(.05, .05, .05, plain(0xc9a65a, .3, { metal: 1 }), -.05, 1.0, -.72, hinge);
  ROOM.bathDoor.hinge = hinge; ROOM.bathDoor.col = P.world.createCollider(RAPIER.ColliderDesc.cuboid(.02, 1, .4).setTranslation(5.05, 1, 3.7).setCollisionGroups(grp(G.SOLID, 0))); hinge.rotation.y = -1.45;
  use('bathdoor', 'the bathroom door', V(5.05, 1.1, 3.7), 1.2, () => { ROOM.bathDoor.shut = !ROOM.bathDoor.shut; ROOM.sfx && ROOM.sfx(ROOM.bathDoor.shut ? 'doorShut' : 'doorOpen', V(5.05, 1, 3.7)); return 'bathdoor'; });
}

function entry(M) {
  // the front door: chain, deadbolt, spyhole
  const hinge = new THREE.Group(); hinge.position.set(.3, 0, 5.04); scene.add(hinge); box(.9, 2.08, .05, M.doorW, .45, 1.04, 0, hinge); const brass = plain(0xc9a65a, .3, { metal: 1 });
  const knob = new THREE.Mesh(new THREE.SphereGeometry(.03, 12, 8), brass); knob.position.set(.8, 1.0, -.05); hinge.add(knob); box(.06, .06, .02, brass, .8, 1.15, -.035, hinge); box(.02, .02, .02, plain(0x111111, .2), .45, 1.55, -.035, hinge);
  ROOM.front.hinge = hinge; stat(.3, 0, 5.02, 1.2, 2.1, 5.07, null);
  const chain = new THREE.Group(); for (let i = 0; i < 9; i++) { const l = new THREE.Mesh(new THREE.TorusGeometry(.009, .0025, 4, 8), brass); l.position.set(.95 + i * .018, 1.48 - Math.sin(i / 8 * Math.PI) * .03, 4.99); l.rotation.y = i % 2 ? Math.PI / 2 : 0; chain.add(l); } scene.add(chain); ROOM.chainMesh = chain;
  const loose = new THREE.Group(); for (let i = 0; i < 9; i++) { const l = new THREE.Mesh(new THREE.TorusGeometry(.009, .0025, 4, 8), brass); l.position.set(1.12, 1.48 - i * .018, 4.99); l.rotation.y = i % 2 ? Math.PI / 2 : 0; loose.add(l); } scene.add(loose); ROOM.chainLoose = loose; chain.visible = false;
  use('chain', 'the door chain', V(1.0, 1.45, 4.95), 1.1, () => { ROOM.chain = !ROOM.chain; chain.visible = ROOM.chain; loose.visible = !ROOM.chain; ROOM.sfx && ROOM.sfx('chain', V(1, 1.45, 4.95)); return 'chain'; });
  use('front', 'the front door', V(.75, 1.1, 4.95), 1.0, () => 'front');
  // the light switch by the door
  box(.08, .12, .015, plain(0xe9e2cf, .4), 1.35, 1.25, 4.97); use('switch', 'the light switch', V(1.35, 1.25, 4.95), 1.0, () => { ROOM.lights.main.on = !ROOM.lights.main.on; ROOM.sfx && ROOM.sfx('click', V(1.35, 1.25, 4.95)); return 'switch'; });
  // the telephone on the wall, beige, its coiled cord
  const beige = plain(0xd9ccb0, .45), ph = new THREE.Group(); box(.07, .22, .1, beige, 0, 0, 0, ph); const hs = box(.05, .22, .06, beige, .045, 0, 0, ph); const cord = new THREE.Mesh(new THREE.TorusKnotGeometry(.03, .004, 80, 6, 2, 9), plain(0xcfc2a5, .5)); cord.position.set(.05, -.2, 0); cord.scale.set(.6, 2.2, .6); ph.add(cord);
  ph.position.set(.04, 1.45, 4.0); scene.add(ph); ROOM.phone = { g: ph, hs, pos: V(.06, 1.45, 4.0), ringing: false };
  use('phone', 'the telephone', V(.1, 1.45, 4.0), 1.2, () => 'phone');
  // the closet: a door left an inch open
  stat(1.3, 0, 4.2, 1.33, 2.2, 5, M.panel); stat(1.92, 0, 4.2, 1.95, 2.2, 5, M.panel); stat(1.3, 2.2, 4.2, 1.95, 2.25, 5, M.panel);
  const ch = new THREE.Group(); ch.position.set(1.33, 0, 4.2); scene.add(ch); box(.6, 2.18, .03, M.doorW, .3, 1.09, -.015, ch); ch.rotation.y = .18; ROOM.closet = { hinge: ch, a: .18 };
  block(.62, 2.2, .04, 1.62, 1.1, 4.21);
  use('closet', 'the closet', V(1.62, 1.2, 4.15), 1.1, () => { ROOM.closet.want = ROOM.closet.a > .5 ? .05 : 1.4; ROOM.sfx && ROOM.sfx('doorOpen', V(1.62, 1.2, 4.2)); return 'closet'; });
}

// where they wait: each the place a chore makes you look
function spots() {
  const S = (id, x, y, z, yaw, pose, name) => ROOM.spots[id] = { id, pos: V(x, y, z), yaw, pose, name };
  S('fridge', .38, .08, .4, 0, 'crouch', 'crouched inside the refrigerator');
  S('table', 1.92, 0, 2.65, -Math.PI / 2, 'sit', 'in the other chair at the table');
  S('sofa', 2.5, 0, 3.4, Math.PI / 2, 'sit', 'on the other cushion of the sofa');
  S('tvcorner', 4.68, 0, 4.78, -2.4, 'stand', 'standing in the corner beside the television');
  S('vent', 3.75, H, 1.3, 0, 'hang', 'hanging from the ceiling vent');
  S('window', 5.5, .9, -.45, 0, 'cling', 'on the outside of the bedroom window glass');
  S('bedfoot', 6.45, 0, 2.45, Math.PI, 'stand', 'standing at the foot of the bed');
  S('mirror', 5.75, 0, 4.5, Math.PI, 'stand', 'behind you, seen only in the mirror');
  S('closet', 1.62, 0, 4.62, Math.PI, 'stand', 'inside the closet, eyes in the gap of the door');
  S('underbed', 6.45, 0, .9, -Math.PI / 2, 'under', 'under the bed');
  S('tub', 6.6, .1, 4.35, -Math.PI / 2, 'stand', 'standing in the bath behind the curtain');
  S('corner', 4.5, 0, .3, -2.3, 'stand', 'tall, in the corner by the window');
  S('kitchen', 2.0, 0, 1.4, Math.PI * .75, 'stand', 'in the kitchen doorway');
  S('ceilingbed', 6.6, H, .5, 0, 'ceiling', 'flat on the ceiling over the bed');
  // the vent itself
  const v = new THREE.Mesh(new THREE.BoxGeometry(.36, .02, .22), plain(0x6a6a64, .5, { metal: .6 })); v.position.set(3.75, H - .011, 1.3); scene.add(v);
  for (let i = 0; i < 6; i++) box(.34, .015, .006, plain(0x1a1a18, .8), 3.75, H - .02, 1.21 + i * .036, scene, false);
}

// the window's light: neon from across the avenue through the glass, cold sky glow, and lightning
function outsideLight() {
  const pink = new THREE.SpotLight(0xff3f8a, 700, 0, .13, .6, 2); pink.position.set(-10, 6, -38); pink.target.position.set(4.4, .9, 4.6); scene.add(pink, pink.target);
  pink.castShadow = true; pink.shadow.mapSize.set(LOW ? 512 : 1024, LOW ? 512 : 1024); pink.shadow.bias = -.0002; pink.shadow.normalBias = .02; pink.shadow.camera.near = 32; pink.shadow.camera.far = 48;
  const cyan = new THREE.SpotLight(0x4fd8ff, 700, 0, .07, .7, 2); cyan.position.set(-10, 6, -38); cyan.target.position.set(5.9, .5, 1.6); cyan.castShadow = true; cyan.shadow.mapSize.set(512, 512); cyan.shadow.camera.near = 32; cyan.shadow.camera.far = 48; cyan.shadow.normalBias = .02; scene.add(cyan, cyan.target);
  const hemi = new THREE.HemisphereLight(0x3a4458, 0x100c0a, .22); scene.add(hemi);
  const flash = new THREE.DirectionalLight(0xc8d4ff, 0); flash.position.set(-1, 3, -8); flash.target.position.set(3.5, 0, 2.5); scene.add(flash, flash.target);
  ROOM.lights.out = { pink, cyan, hemi, flash, pI: 700, cI: 350 };
}

function build() {
  const M = {
    parq: mat('herringbone_parquet', { tile: 1.6, rough: .9, env: .5 }), ktile: mat('interior_tiles', { tile: 1.2, rough: .7, env: .6 }), btile: mat('interior_tiles', { tile: .9, rough: .6, color: 0xd8e2e0 }),
    wall: mat('plastered_wall_04', { tile: 2.5, color: 0x9a907c, ns: .5 }), ceil: mat('painted_plaster_wall', { tile: 2.5, color: 0x8a8274, ns: .4 }), panel: mat('dark_paneled_wood', { tile: 2.4, rough: .8, color: 0xc49a72 }),
    trim: plain(0x3a2a1c, .6), wtile: mat('long_white_tiles', { tile: 1.2, rough: .4, env: .8 }), cab: mat('dark_paneled_wood', { tile: 1.6, color: 0x9c7a58 }), door: plain(0x5a4030, .6),
    sill: plain(0xe2dccd, .5), frame: mat('rusty_painted_metal', { tile: 1, color: 0x6f6a5c, rough: .7 }), radiator: mat('rusty_painted_metal', { tile: .6, color: 0xd6cdb4, rough: .6 }),
    rug: mat('poly_wool_herringbone', { tile: .8, color: 0x8a3a2a }), pillow: mat('fabric_pattern_05', { tile: .5 }), blanket: mat('fabric_pattern_05', { tile: .8 }), mattress: plain(0xe7e1d4, .9),
    doorW: mat('dark_paneled_wood', { tile: 2, color: 0x7a5a40 }) };
  rainGlass(); walls(M);
  window_(M, 2.6, 4.6, .85, 2.35, 'up'); window_(M, 5.1, 5.9, .95, 2.25, 'down');
  kitchen(M); living(M); bedroom(M); bathroom(M); entry(M); spots(); outsideLight();
  // dust in the light
  const N = LOW ? 150 : 400, pg = new THREE.BufferGeometry(), pa = new Float32Array(N * 3); for (let i = 0; i < N; i++) { pa[i * 3] = rnd(.2, 6.8); pa[i * 3 + 1] = rnd(.2, 2.5); pa[i * 3 + 2] = rnd(.2, 4.8); } pg.setAttribute('position', new THREE.BufferAttribute(pa, 3));
  const dust = new THREE.Points(pg, new THREE.PointsMaterial({ size: .006, map: dot(), transparent: true, opacity: .45, depthWrite: false, color: 0xffe0c0, blending: THREE.AdditiveBlending })); scene.add(dust); ROOM.dust = dust;
}

/* each frame: doors swing, the lights do what the power and switches say, the set shows its picture, rain runs */
const NEWS = ['NEWS AT ELEVEN', 'MAYOR KOCH', 'SUBWAY FARES', 'WEATHER: RAIN', 'MISSING: 3', 'STAY INSIDE', 'TEST PATTERN'];
function drawTV(dt) {
  const T = ROOM.tv, g = T.g; T.last += dt; if (T.last < 1 / 15) return; T.last = 0; const W = 256, Hh = 192;
  if (!T.on || !ROOM.power) { g.fillStyle = '#050605'; g.fillRect(0, 0, W, Hh); T.k = lerp(T.k, 0, .5); T.tex.needsUpdate = true; return; }
  const t = CLOCK.t;
  if (T.msg) { g.fillStyle = '#000'; g.fillRect(0, 0, W, Hh); g.fillStyle = '#e8e8e8'; g.font = 'bold 30px monospace'; g.textAlign = 'center'; g.fillText(T.msg, W / 2, Hh / 2 + 10); T.k = .35; }
  else if (T.ch === 0) {   // the late news: a desk, an anchor's shape, a strap
    g.fillStyle = '#16304a'; g.fillRect(0, 0, W, Hh); g.fillStyle = '#2a4a6e'; g.fillRect(0, 120, W, 72); g.fillStyle = '#c9a07a'; g.beginPath(); g.arc(128 + Math.sin(t * .7) * 2, 70, 22, 0, 7); g.fill(); g.fillStyle = '#1d1d26'; g.fillRect(96, 92, 64, 50);
    g.fillStyle = '#b11'; g.fillRect(0, 150, W, 26); g.fillStyle = '#fff'; g.font = 'bold 16px sans-serif'; g.textAlign = 'left'; g.fillText(NEWS[Math.floor(t / 6) % NEWS.length], 8, 169); T.k = .5 + Math.sin(t * 3) * .05 + Math.random() * .06;
  } else if (T.ch === 1) { const bars = ['#c0c0c0', '#c0c000', '#00c0c0', '#00c000', '#c000c0', '#c00000', '#0000c0']; bars.forEach((c, i) => { g.fillStyle = c; g.fillRect(i * W / 7, 0, W / 7 + 1, Hh * .75); }); g.fillStyle = '#111'; g.fillRect(0, Hh * .75, W, Hh * .25); T.k = .7; }
  else { const id = g.createImageData(W, Hh); for (let i = 0; i < id.data.length; i += 4) { const v = Math.random() * 255; id.data[i] = id.data[i + 1] = id.data[i + 2] = v; id.data[i + 3] = 255; } g.putImageData(id, 0, 0); T.k = .55 + Math.random() * .2; }
  // the tube: scanlines and a faint roll
  g.fillStyle = 'rgba(0,0,0,.28)'; for (let y = 0; y < Hh; y += 2) g.fillRect(0, y, W, 1); g.fillStyle = 'rgba(255,255,255,.04)'; g.fillRect(0, (t * 40) % Hh, W, 14);
  T.tex.needsUpdate = true;
}

const _v = new THREE.Vector3();
function update(dt, t) {
  drawRain(t);
  const F = ROOM.fridge; F.a = lerp(F.a, F.open ? -1.75 : 0, 1 - Math.exp(-dt * 6)); F.hinge.rotation.y = F.a;
  const BD = ROOM.bathDoor, want = BD.shut ? 0 : -1.45; BD.a = lerp(BD.hinge.rotation.y, want, 1 - Math.exp(-dt * 7)); BD.hinge.rotation.y = BD.a; BD.col.setCollisionGroups(grp(G.SOLID, BD.shut && Math.abs(BD.a) < .2 ? G.PLAYER | G.HAND : 0));
  const C = ROOM.closet; if (C.want !== undefined) { C.a = lerp(C.a, C.want, 1 - Math.exp(-dt * 6)); C.hinge.rotation.y = C.a; }
  const L = ROOM.lights, pw = ROOM.power, k = CITY.signs ? CITY.signs[0].k : 1;
  const m = L.main, on = m.on && pw; m.k = lerp(m.k ?? 1, on ? 1 - (m.dip || 0) : 0, 1 - Math.exp(-dt * 25)); m.L.intensity = m.I * m.k; m.fill.intensity = m.fI * m.k; m.glow.emissiveIntensity = .9 * m.k; m.L.visible = m.fill.visible = m.k > .01;
  L.under.L.intensity = L.under.I * (pw ? m.k * .5 + .5 : 0) * (m.on ? 1 : .0); L.under.m.emissiveIntensity = pw && m.on ? 1.2 : 0;
  L.bed.L.intensity = L.bed.on && pw ? L.bed.I : 0;
  const B = L.bath; B.flick -= dt; if (B.flick < 0) B.flick = Math.random() < .08 ? rnd(.03, .2) : rnd(1, 6); const bo = B.on && pw && !(B.flick < .2 && Math.random() < .5); B.L.intensity = bo ? B.I : 0; B.m.emissiveIntensity = bo ? 1.2 : .05;
  L.fridge.L.intensity = pw && F.a < -.2 ? L.fridge.I : 0;
  const O = L.out; O.pink.intensity = O.pI * k; O.cyan.intensity = O.cI * (CITY.signs ? CITY.signs[1].k : 1); O.flash.intensity = CITY.flash * 2.4; O.hemi.intensity = .22 + CITY.flash * .8;
  ROOM.radio.led.emissiveIntensity = ROOM.radio.on && pw ? 2 : 0; if (ROOM.blender.on && pw) { ROOM.blender.blade.rotation.y += dt * 60; ROOM.blender.g.position.x = 2.28 + Math.sin(t * 90) * .0015; }
  ROOM.tap.stream.visible = ROOM.tap.on; ROOM.coil.emissiveIntensity = lerp(ROOM.coil.emissiveIntensity, ROOM.stove.on && pw ? 2.5 : 0, dt * .6);
  drawTV(dt); const T = ROOM.tv; L.tv.L.intensity = T.on && pw ? 5 * T.k : 0; L.tv.L.color.setHSL(.6, .4, .7 + T.k * .1);
  // the curtain stirs; the mirror draws only when you are near it
  const cp = ROOM.curtain.geometry.attributes.position, base = ROOM.curtainBase; for (let i = 0; i < cp.count; i++) { const x = base[i * 3], y = base[i * 3 + 1]; cp.setZ(i, Math.sin(x * 26) * .035 + Math.sin(t * .8 + x * 3) * .01 * (1 - (y + .875) / 1.75) + (ROOM.curtainPush || 0) * Math.exp(-Math.pow((x - (ROOM.curtainAt || 0)) * 4, 2)) * (1 - (y + .875) / 1.75)); } cp.needsUpdate = true; ROOM.curtain.geometry.computeVertexNormals();
  camera.getWorldPosition(_v); ROOM.mirror.rf.visible = _v.x > 4.9 && _v.z > 2.9;
  const dp = ROOM.dust.geometry.attributes.position; for (let i = 0; i < dp.count; i++) { dp.setY(i, dp.getY(i) + Math.sin(t * .3 + i) * .0004 - .00008); if (dp.getY(i) < .1) dp.setY(i, 2.5); } dp.needsUpdate = true;
}
// everything that can be switched, opened or left running: whether it is wrong now, where it is, and where one of them would stand beside it
const DEV = {
  tv: { label: 'the television', is: () => ROOM.tv.on, set: v => { ROOM.tv.on = v; }, at: () => ROOM.tv.pos, spot: 'tvcorner' },
  radio: { label: 'the radio', is: () => ROOM.radio.on, set: v => { ROOM.radio.on = v; }, at: () => ROOM.radio.pos, spot: 'kitchen' },
  blender: { label: 'the blender', is: () => ROOM.blender.on, set: v => { ROOM.blender.on = v; }, at: () => ROOM.blender.pos, spot: 'kitchen' },
  fridge: { label: 'the refrigerator door', is: () => ROOM.fridge.open, set: v => { ROOM.fridge.open = v; }, at: () => V(.4, 1, .6), spot: 'corner' },
  tap: { label: 'the tap', is: () => ROOM.tap.on, set: v => { ROOM.tap.on = v; }, at: () => ROOM.tap.pos, spot: 'kitchen' },
  stove: { label: 'the stove', is: () => ROOM.stove.on, set: v => { ROOM.stove.on = v; }, at: () => ROOM.stove.pos, spot: 'fridge' },
  light: { label: 'the big light', is: () => !ROOM.lights.main.on, set: v => { ROOM.lights.main.on = !v; }, at: () => V(3.3, 2.2, 2.4), spot: 'corner' },
  bathlight: { label: 'the bathroom light', is: () => !ROOM.lights.bath.on, set: v => { ROOM.lights.bath.on = !v; }, at: () => V(5.75, 2, 3.3), spot: 'tub' },
  closet: { label: 'the closet door', is: () => ROOM.closet.a > .7, set: v => { ROOM.closet.want = v ? 1.4 : .18; }, at: () => V(1.62, 1.2, 4.2), spot: 'closet' },
  bathdoor: { label: 'the bathroom door', is: () => ROOM.bathDoor.shut, set: v => { ROOM.bathDoor.shut = v; }, at: () => V(5.05, 1, 3.7), spot: 'mirror' } };
ROOM.dev = DEV;
// the nearest thing you could use, from where your hand or eye is, as long as nothing solid is between
function nearestUse(from, dir) { let best = null, bs = -1; for (const U of ROOM.uses) { if (U.off) continue; _v.subVectors(U.pos, from); const d = _v.length(); if (d > U.r) continue; const a = dir ? _v.normalize().dot(dir) : 1; if (dir && a < .55) continue; const s = a - d * .3; if (s > bs) { bs = s; best = U; } } return best; }

export { ROOM, H, build, update, nearestUse };
