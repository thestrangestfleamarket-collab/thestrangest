// the block where the cart stands, downtown New York in 1985: the north pavement of East 1st Street just west of First Avenue, tenements with fire escapes on both sides (fronts.js), a bodega, a laundromat and a record shop on the cart's side, a bar, a television repair shop, an empty lot and its mural across the street, parked cars, a subway stair, sodium lamps and neon (street.js), the Twin Towers to the south; its sky, sun, moon and lamps follow the run's clock (clock.js)
import * as THREE from 'three';
import { G, mat, mesh, box, cyl, clamp } from './ctx.js';
import * as T from './tex.js';
import { buildBlock } from './block.js';
import { buildSky } from './sky.js';
import * as E from './ephem.js';
import { AIR } from './air.js';
import { weatherAt } from './weather.js';
import { buildFronts, LOT } from './fronts.js';
import { buildStreet } from './street.js';

export const FOG = 0xb8c4cc;
// the pavement the cart stands on runs from the tenements' fronts behind it (NZ) to its kerb; the street, one lane between two rows of parked cars; the far pavement and the fronts across (FZ)
export const NZ = 3.4, KERB = -5.3, FKERB = -13.3, FZ = -16.6, W0 = -3.5 * LOT, E0 = 3.5 * LOT, ROAD = -0.15;
export function buildAlley(scene, o = {}) {
  const rich = !!o.rich;   // a screen: the richer path (a wider, softer sun shadow); a headset: the lean one
  E.site(40.7243, -73.9878);   // East 1st Street and First Avenue
  const city = new THREE.Group(); scene.add(city); const glow = new THREE.Group(); city.add(glow); const ups = [], R = T.rng(1985);
  const glowMap = T.glowTex(), S = { easy: true };
  const halo = (color, size, x, y, z, parent = glow, op = 0.5) => { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowMap, color, blending: THREE.AdditiveBlending, depthWrite: false, transparent: true, opacity: op, fog: true })); s.scale.set(size, size, 1); s.position.set(x, y, z); parent.add(s); s.userData.nopick = true; return s; };
  const real = (n, size, color = 0xffffff, o = {}) => T.surface(T.worldUV(mat({ map: T.photo(n), color, side: o.side }), size), { bomb: o.bomb ?? 1, grime: o.grime ?? 0.3, band: o.band ?? 0.8, scale: 0.6, worn: o.worn ?? 0 }), flat = (c, o = {}) => mat({ color: c, ...o });
  // ---- the ground: the pavement's concrete flags, the kerbs, the asphalt and its paint, the avenue at the east end
  const paveM = real('paving', 2.4, 0xa4a8ae, { grime: 0.45 }), kerbM = real('concrete', 2, 0x9a9890, { grime: 0.5, bomb: 0 }), roadM = real('asphalt', 4, 0x8a8a90, { grime: 0.35 }), lineM = flat(0xc8c4b0), yellowM = flat(0xb89a2a);
  const flag = (x0, x1, z0, z1, m = paveM, y = 0) => { const b = box(x1 - x0, 0.4, z1 - z0, m, (x0 + x1) / 2, y - 0.2, (z0 + z1) / 2, city); b.castShadow = false; return b; };
  const SUB = { x0: 19.2, x1: 23.6, z0: -5.12, z1: -3.92 };   // the subway stair's well in the pavement, by the kerb
  flag(W0 - 60, SUB.x0, KERB, NZ); flag(SUB.x1, E0 + 4, KERB, NZ); flag(SUB.x0, SUB.x1, SUB.z1, NZ); flag(SUB.x0, SUB.x1, KERB, SUB.z0);
  flag(W0 - 60, E0 + 4, FZ, FKERB);
  box(E0 + 4 - (W0 - 60), 0.16, 0.18, kerbM, (E0 + 4 + W0 - 60) / 2, -0.07, KERB - 0.09, city).castShadow = false; box(E0 + 4 - (W0 - 60), 0.16, 0.18, kerbM, (E0 + 4 + W0 - 60) / 2, -0.07, FKERB + 0.09, city).castShadow = false;
  const rd = box(260, 0.4, FKERB - KERB + 0.02, roadM, 20, ROAD - 0.2, (KERB + FKERB) / 2, city); rd.castShadow = false;
  // the avenue: six lanes across the block's east end, its far pavement and the blocks beyond
  const AX0 = E0 + 4, AX1 = E0 + 22; { const av = box(AX1 - AX0, 0.4, 320, roadM, (AX0 + AX1) / 2, ROAD - 0.2, 0, city); av.castShadow = false; flag(AX1, AX1 + 60, KERB, NZ + 40); flag(AX1, AX1 + 60, FZ - 40, FKERB); flag(AX0 - 60 + 56, AX0, NZ, NZ + 150); flag(AX0 - 4, AX0, FZ - 150, FZ);
    for (let z = -150; z < 150; z += 9) for (const x of [AX0 + 6, AX0 + 12]) { const l = box(0.14, 0.01, 3, lineM, x, ROAD + 0.006, z, city); l.castShadow = false; }
    for (let i = 0; i < 9; i++) for (const x of [AX0 + 0.8]) { const l = box(0.5, 0.01, 0.6, lineM, x + 0.0, ROAD + 0.006, KERB - 0.6 - i * 0.92, city); l.scale.x = 4.4; l.position.x = x + 1.1; l.castShadow = false; }   // the crosswalk over the street's mouth
  }
  for (let i = 0; i < 14; i++) { const m = mesh(new THREE.CircleGeometry(0.5 + R() * 1.3, 9), flat(0x3a3a40), W0 + 3 + R() * 50, ROAD + 0.004, FKERB + 0.8 + R() * (KERB - FKERB - 1.6), city); m.rotation.x = -Math.PI / 2; m.scale.y = 0.5 + R(); m.castShadow = false; }   // patches in the asphalt
  // ---- the lamps: everything that shines at night shares a few materials and one drawing of glows, all coming up together at dusk and going at dawn (steadily: nothing flickers)
  const HU = { map: { value: glowMap }, opacity: { value: 0 }, grow: { value: 1 }, fogD: { value: 0.006 } };
  const haloM = new THREE.ShaderMaterial({ uniforms: HU, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, fog: false,
    vertexShader: 'uniform float grow; attribute vec3 hue; varying vec2 vUv; varying float vD; varying vec3 vC; void main(){ vec4 c = modelViewMatrix * instanceMatrix * vec4(0.0, 0.0, 0.0, 1.0); float s = length(instanceMatrix[0].xyz) * grow; c.xy += position.xy * s; vUv = uv; vD = -c.z; vC = hue; gl_Position = projectionMatrix * c; }',
    fragmentShader: 'uniform sampler2D map; uniform float opacity, fogD; varying vec2 vUv; varying float vD; varying vec3 vC; void main(){ vec4 t = texture2D(map, vUv); float f = exp(-fogD * vD * 0.8); gl_FragColor = vec4(vC * t.rgb * t.a * opacity * f, 1.0); }' });
  const NH = 96, hue = new Float32Array(NH * 3), haloG = new THREE.PlaneGeometry(1, 1); haloG.setAttribute('hue', new THREE.InstancedBufferAttribute(hue, 3));
  const haloIM = new THREE.InstancedMesh(haloG, haloM, NH); haloIM.count = 0; haloIM.frustumCulled = false; haloIM.userData.nopick = true; haloIM.castShadow = haloIM.receiveShadow = false; city.add(haloIM);
  const _hm = new THREE.Matrix4(), _hc = new THREE.Color(), haloSet = (i, x, y, z, size) => { _hm.makeScale(size, size, size).setPosition(x, y, z); haloIM.setMatrixAt(i, _hm); haloIM.instanceMatrix.needsUpdate = true; };
  const addHalo = (x, y, z, size, color = 0xffa860) => { if (haloIM.count >= NH) return -1; const i = haloIM.count++; _hc.set(color); hue.set([_hc.r, _hc.g, _hc.b], i * 3); haloG.attributes.hue.needsUpdate = true; haloSet(i, x, y, z, size); return i; };
  const lampMats = [];   // each: emissiveIntensity = lit * (userData.k or 1.6)
  // ---- the buildings: [brick, floors above the shop, what the ground floor is]
  const near = [{ kind: 1, floors: 5, shop: 'stoop' }, { kind: 0, floors: 5, shop: 'stoop', o: { brick: 'brick_red', tint: '#b8a098', door: '#2a3a30' } }, { kind: 3, floors: 4, shop: 'bodega' }, { kind: 4, floors: 5, shop: 'shutter' }, { kind: 2, floors: 5, shop: 'laundromat' }, { kind: 5, floors: 4, shop: 'records' }, { kind: 3, floors: 5, shop: 'coffee' }];
  const far = [{ kind: 2, floors: 5, shop: 'stoop', o: { brick: 'brick_orange', tint: '#a89080' } }, { kind: 4, floors: 5, shop: 'bar' }, { kind: 1, floors: 4, shop: 'tv' }, { shop: 'lot' }, { kind: 0, floors: 5, shop: 'pizza' }, { kind: 5, floors: 6, shop: 'checks' }, { kind: 2, floors: 4, shop: 'liquor' }];
  const fronts = buildFronts({ city, R, lampMats, NZ, FZ, W0 }, near, far);
  // ---- everything standing in the street (street.js): lamps, cars, the subway stair, the phone, the hydrant, the steam, the skyline
  const street = buildStreet({ city, scene, R, real, flat, halo, addHalo, haloSet, lampMats, ups, fronts, SUB, AX0, AX1, glowMap, api: () => lit });
  // ---- the light, after THE MARKET's: the real sun and moon over New York on the run's clock (sky.js, ephem.js), the light from whichever is up and its shadows, the hemisphere's fill by the sky's colour, the air's haze and mist (air.js) by the hour and the weather (weather.js)
  const fill = new THREE.HemisphereLight(0xbcd0ec, 0x5a5a5e, 1.05); scene.add(fill);
  const sun = new THREE.DirectionalLight(0xfff2dc, 2.4); sun.castShadow = true; const SH = rich ? 14 : 10; sun.shadow.mapSize.set(1024, 1024); Object.assign(sun.shadow.camera, { left: -SH, right: SH, top: SH, bottom: -SH, near: 1, far: 90 }); sun.shadow.bias = -0.0012; sun.shadow.normalBias = 0.02; sun.shadow.radius = rich ? 2 : 1.2; scene.add(sun, sun.target);
  sun.shadow.camera.layers.set(2); sun.shadow.autoUpdate = false; sun.shadow.needsUpdate = true; let shT = 0; ups.push((dt) => { if ((shT -= dt) <= 0) { shT = 3; sun.shadow.needsUpdate = true; } });   // the sun's (and the moon's) shadows are the still street's (layer 2, only its larger things), laid again every three seconds as the light creeps; what moves takes its shadows from the lamp over the cart
  const moon = sun, sky = buildSky(scene);
  // the day the run is set on: Friday 4 October 1985, by New York's clocks (daylight time, four hours behind Greenwich); the clock's hours run true through the day and the dusk, and the night is drawn so the sun comes up as the dawn's light does (clock.js: dawn 29 to 30.5)
  const BASE = Date.UTC(1985, 9, 4, 4), R0 = (() => { for (let h = 3; h < 9; h += 0.01) if (E.seen('sun', E.jdOf(BASE + (24 + h) * 3600e3)).alt > -0.83) return 24 + h; return 31; })();
  const realH = (h) => (h <= 19.5 ? h : h <= 29 ? 19.5 + ((h - 19.5) * (R0 - 1.15 - 19.5)) / 9.5 : R0 - 1.15 + (h - 29));
  city.jd = (h) => E.jdOf(BASE + realH(h) * 3600e3);
  // the sodium lamps' own light on the pavement (three, as many as the frame can afford); the rest of the night's light is drawn, not cast
  const lampLights = street.lampAt.slice(0, 3).map(([x, y, z]) => { const p = new THREE.PointLight(0xffa04a, 0, 22, 1.5); p.position.set(x, y - 0.3, z); scene.add(p); return p; });
  const fogC = new THREE.Color(), tmp = new THREE.Color(), tmp2 = new THREE.Color(), _mp = new THREE.Vector3(), MOONC = new THREE.Color(0x9ab0e8), NIGHTF = new THREE.Color(0x6a6480), DAYF = new THREE.Color(0xbcd0ec), EARTH = new THREE.Color(0x5a5a5e), CITYGLOW = new THREE.Color(0x4a3428);
  let lit = 0, skyT = 0, wet = 0, lastH = -1; const api = {};
  const sm = (a, b, x) => { const t = clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };
  const paint = () => { const K = G.clock, h = K ? K.hour : 11, w = G.weather ? G.weather.now : weatherAt(K ? K.frac : 0), jd = city.jd(h);
    const Sk = sky.set(jd, w, null), e = Sk.e, day = sm(-10, 8, e);   // (the twilight counts: the dawn brightens the street before the sun is up)
    // the air's colour: the horizon's, greyed (more under cloud and in the mist), as THE MARKET's haze; at night the city's own glow is in it
    const l = Sk.horizon.r * 0.3 + Sk.horizon.g * 0.59 + Sk.horizon.b * 0.11; fogC.copy(Sk.horizon).lerp(tmp.setRGB(l, l, l), 0.3 + 0.35 * w.cloud + 0.2 * w.mist); fogC.lerp(tmp.copy(Sk.zen).lerp(Sk.horizon, 0.55), 0.22 * day * (1 - w.cloud)); fogC.lerp(CITYGLOW, 0.35 * (1 - day));
    if (scene.fog) { scene.fog.color.copy(fogC); scene.fog.density = 0.0058 + 0.003 * (1 - day) + 0.014 * (G.rainK || 0) + 0.006 * w.mist; } scene.background = fogC;
    AIR.mist[0] = 0.002 + 0.02 * w.mist + 0.006 * (1 - day) + 0.01 * (G.rainK || 0); AIR.mist[1] = 1 / (2.4 + 2.4 * w.mist); AIR.mist[2] = -0.1;
    HU.fogD.value = scene.fog ? scene.fog.density : 0.006; HU.grow.value = 1 + 0.8 * w.mist + 1.5 * (G.rainK || 0);   // the lamps' glow spreads in damp air
    sky.U.uFogC.value.copy(fogC); sky.U.uFogK.value = 0.5 + 0.4 * w.mist;
    // the light: the sun's while it is up, the moon's after (the same light, so one shadow map), passing between them through the twilight
    const f = sm(1, -5, e), sunK = sm(-1, 9, e) * 2.7 * (1 - 0.6 * clamp((w.cloud - 0.25) / 0.7, 0, 1)), mk = (1 - sm(-4, 2, e)) * clamp((Sk.moonAlt + 2) / 12, 0, 1) * (0.25 + 0.75 * Sk.moonLit) * (1 - 0.55 * clamp((w.cloud - 0.3) / 0.6, 0, 1));
    _mp.copy(Sk.sunDir).lerp(Sk.moonDir, f); _mp.y = Math.max(0.12, _mp.y); _mp.normalize(); sun.position.copy(_mp).multiplyScalar(40); sun.target.position.set(0, 0, 0);
    sun.color.copy(Sk.sunC).lerp(MOONC, f); sun.intensity = sunK * (1 - f) + 0.9 * mk * f;
    AIR.sun[0] = _mp.x; AIR.sun[1] = _mp.y; AIR.sun[2] = _mp.z; const gl = sm(-3, 3, e) * (0.35 + 0.65 * (1 - clamp((e - 5) / 25, 0, 1))) * 0.22 * (1 - 0.7 * w.cloud);
    tmp.copy(Sk.sunC).multiplyScalar(gl).lerp(tmp2.copy(MOONC).multiplyScalar(0.03 * mk), f); AIR.sunC[0] = tmp.r; AIR.sunC[1] = tmp.g; AIR.sunC[2] = tmp.b;
    fill.color.copy(NIGHTF).lerp(DAYF, day).lerp(Sk.sunC, 0.22 * day * (1 - clamp(e / 20, 0, 1))).lerp(tmp2.setRGB(0.6, 0.62, 0.66), 0.3 * w.cloud * day); fill.groundColor.copy(EARTH).multiplyScalar(0.3 + 0.7 * day);
    fill.intensity = (0.95 + 0.5 * day + 0.25 * mk) * (S.easy ? 1.2 : 1);   // (by day the pavement, the walls and the cart's roof throw the sky's light back up under it: the counter is bright)
    if (G.renderer) G.renderer.toneMappingExposure = 1.15 + 0.7 * (1 - day);   // the eye opens in the dark: night dark but readable
    if (G.weather) G.weather.rain.material.color.setHex(0x8a98a8).multiplyScalar(0.16 + 0.84 * day + 0.25 * lit);
    street.paint && street.paint({ day, fogC, Sk, lit });
    api.sky = { e: +e.toFixed(2), day: +day.toFixed(3), moon: +mk.toFixed(3), sun: +sun.intensity.toFixed(3), hour: +h.toFixed(2) }; lastH = h; };
  paint();
  ups.push((dt, t) => {
    const K = G.clock, hr = K ? K.hour : 11, want = hr >= 17.9 && hr < 29.4 ? 1 : hr >= 29.4 && hr < 30.3 ? clamp((30.3 - hr) / 0.9, 0, 1) : 0;   // the street's lamps and signs come on as the sun goes and go off through the dawn
    lit += clamp(want - lit, -dt / 4, dt / 4); const e = S.easy ? 0.6 : 1; api.lit = lit;
    for (const m of lampMats) m.emissiveIntensity = lit * (m.userData.k || 1.6) * e + (m.userData.day || 0); HU.opacity.value = lit * 0.3 * e;
    lampLights.forEach((l) => { l.intensity = lit * 9; });
    wet += clamp(clamp((G.rainK || 0) / 0.2, 0, 1) - wet, -dt / 300, dt / 60); T.SURF.wet.value = wet;   // the ground darkens as it rains and dries slowly after
    if (G.cart && G.cart.lamps) G.cart.lamps(lit);
    sky.update(dt, G.renderer && G.renderer.xr.isPresenting ? 1.5 : 1);
    if ((skyT -= dt) <= 0 || Math.abs((G.clock ? G.clock.hour : 11) - lastH) > 0.05) { skyT = 0.25; paint(); } });   // (at once when the clock jumps: a guest joining, a new run)
  S.easy = !!(G.set && G.set.easy); city.setEasy = (on) => { S.easy = on; paint(); };
  // where the block's people stop: the bodega's door, the laundromat's, the record shop's, the corner by the subway stair, a stoop up the block, the pay phone
  const P = (x, z) => new THREE.Vector3(x, 0, z), door = (shop) => { const s = fronts.shops.find((q) => q.shop === shop && q.s > 0); return s ? P(s.door.x, NZ - 1.2) : P(0, NZ - 1.2); };
  const shops = [{ type: 'bar', open: true, p: door('bodega'), name: 'the bodega' }, { type: 'kitchen', open: true, p: door('laundromat'), name: 'the laundromat' }, { type: 'stage', open: true, p: door('records'), name: 'the record shop' }, { type: 'corner', open: true, p: P(E0 - 1.2, -3.3), name: 'the corner' }, { type: 'stoop', open: true, p: P(W0 + 1.5 * LOT + 1.4, NZ - 1.2), name: 'the stoop' }, { type: 'fence', open: true, p: P(street.phone.x + 0.9, street.phone.z + 0.9), name: 'the pay phone' }];
  const tvShop = fronts.shops.find((q) => q.shop === 'tv'), all = [...shops, ...(tvShop ? [{ type: 'tv', open: true, p: P(tvShop.x + (tvShop.info.window[0] + tvShop.info.window[1]) / 2 - LOT / 2, FZ + 1.55) }] : [])];
  if (tvShop) { // the repair shop's window: a shallow bay of dark wood and plate glass that its sets stand in (tv.js puts them there)
    const cx = all[all.length - 1].p.x, w = tvShop.info.window[1] - tvShop.info.window[0], dk = flat(0x1c1c20), z0 = FZ + 0.33; box(w, 0.42, 0.66, dk, cx, 0.21, z0, city).castShadow = false; box(w + 0.1, 0.1, 0.72, dk, cx, 2.62, z0, city).castShadow = false; for (const e of [-1, 1]) box(0.06, 2.2, 0.66, dk, cx + e * (w / 2), 1.5, z0, city).castShadow = false;
    const gl = mesh(new THREE.PlaneGeometry(w, 2.16), new THREE.MeshBasicMaterial({ color: 0x8aa0b8, transparent: true, opacity: 0.1, depthWrite: false }), cx, 1.5, FZ + 0.66, city); gl.userData.keep = true; gl.userData.nopick = true; gl.castShadow = false; addHalo(cx, 1.2, FZ + 0.9, 3.4, 0x9ab8ff); }
  const block = buildBlock(city, shops, { near: -2.6, far: -3.5, split: -3.05, end: E0 + 3 }); ups.push((dt, t) => block.update(dt, t));   // (two lanes of the pavement, clear of the kerb's poles, the phone and the subway stair)
  return Object.assign(api, { group: city, jd: (h) => city.jd(h), shops: all, fronts, street, glow, fill, sun, moon, lamps: lampMats, alley: true, vent: street.vent, skyDome: sky, weatherAt, setEasy(on) { S.easy = on; paint(); }, update(dt, t) { for (const u of ups) u(dt, t); }, halo, rain: null, cars: street.cars, glowMap, bakeFar() { }, reflect() { } });
}
