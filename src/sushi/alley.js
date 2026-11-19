// the corner where the cart stands: THE MARKET's Market St and West St, park side, in 1985: the park's stone wall and railings behind the cart, the wide pavement, Market St and the art museum and the bank across it, West St's apartment houses, all read out of the market's own page (corner.js, tools/ramen-corner.cjs); what stands lit and what drives by (street.js); its sky, moon and lamps follow the run's clock (clock.js)
import * as THREE from 'three';
import { G, mat, mesh, box, cyl, clamp } from './ctx.js';
import * as T from './tex.js';
import { buildBlock } from './block.js';
import { buildSky } from './sky.js';
import * as E from './ephem.js';
import { AIR } from './air.js';
import { weatherAt } from './weather.js';
import { buildCorner, NIGHT } from './corner.js';
import { buildStreet } from './street.js';
import { NZ, KERB, FKERB, FZ, W0, E0, ROAD, LANES, XWALK, SPOTS } from './plan.js';
export { NZ, KERB, FKERB, FZ, W0, E0, ROAD } from './plan.js';

export const FOG = 0xb8c4cc;
export function buildAlley(scene, o = {}) {
  const rich = !!o.rich;   // a screen: the richer path (a wider, softer sun shadow); a headset: the lean one
  E.site(40.7243, -73.9878);   // (New York's sky, as THE MARKET's)
  const city = new THREE.Group(); scene.add(city); const glow = new THREE.Group(); city.add(glow); const ups = [], R = T.rng(1985);
  const glowMap = T.glowTex(), S = { easy: true };
  const halo = (color, size, x, y, z, parent = glow, op = 0.5) => { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowMap, color, blending: THREE.AdditiveBlending, depthWrite: false, transparent: true, opacity: op, fog: true })); s.scale.set(size, size, 1); s.position.set(x, y, z); parent.add(s); s.userData.nopick = true; return s; };
  const real = (n, size, color = 0xffffff, o = {}) => T.surface(T.worldUV(mat({ map: T.photo(n), color, side: o.side }), size), { bomb: o.bomb ?? 1, grime: o.grime ?? 0.3, band: o.band ?? 0.8, scale: 0.6, worn: o.worn ?? 0 }), flat = (c, o = {}) => mat({ color: c, ...o });
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
  // ---- the corner itself (corner.js), and what stands lit and drives by on it (street.js)
  const corner = buildCorner(city);
  const street = buildStreet({ city, scene, R, flat, halo, addHalo, haloSet, lampMats, ups, corner, glowMap, api: () => lit });
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
  let lit = 0, skyT = 0, wet = 0, lastH = -1, envAt = [-1, -1]; const api = {};
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
    if (Math.abs(day - envAt[0]) > 0.07 || Math.abs(lit - envAt[1]) > 0.12) { envAt = [day, lit]; T.envPaint(Sk.zen, fogC, day, lit); }   // what glass, paint and puddles mirror follows the light, a step at a time
    api.sky = { e: +e.toFixed(2), day: +day.toFixed(3), moon: +mk.toFixed(3), sun: +sun.intensity.toFixed(3), hour: +h.toFixed(2) }; lastH = h; };
  paint();
  ups.push((dt, t) => {
    const K = G.clock, hr = K ? K.hour : 11, want = hr >= 17.9 && hr < 29.4 ? 1 : hr >= 29.4 && hr < 30.3 ? clamp((30.3 - hr) / 0.9, 0, 1) : 0;   // the street's lamps and signs come on as the sun goes and go off through the dawn
    lit += clamp(want - lit, -dt / 4, dt / 4); const e = S.easy ? 0.6 : 1; api.lit = lit;
    for (const m of lampMats) m.emissiveIntensity = lit * (m.userData.k || 1.6) * e + (m.userData.day || 0); HU.opacity.value = lit * 0.3 * e; NIGHT.value = lit * e;
    lampLights.forEach((l) => { l.intensity = lit * 9; });
    wet += clamp(clamp((G.rainK || 0) / 0.2, 0, 1) - wet, -dt / 300, dt / 60); T.SURF.wet.value = wet;   // the ground darkens as it rains and dries slowly after
    if (G.cart && G.cart.lamps) G.cart.lamps(lit);
    sky.update(dt, G.renderer && G.renderer.xr.isPresenting ? 1.5 : 1);
    if ((skyT -= dt) <= 0 || Math.abs((G.clock ? G.clock.hour : 11) - lastH) > 0.05) { skyT = 0.25; paint(); } });   // (at once when the clock jumps: a guest joining, a new run)
  S.easy = !!(G.set && G.set.easy); city.setEasy = (on) => { S.easy = on; paint(); };
  // where the corner's people stop (plan.js SPOTS): the park bench, the crossing, the railings, the museum's steps and the bank's door across Market St, the apartment house's door on West St
  const P = (x, z) => new THREE.Vector3(x, 0, z), shops = SPOTS.map((s) => ({ type: s.type, open: true, p: P(s.x, s.z), name: s.name })), all = shops;
  const block = buildBlock(city, shops, { near: LANES[0], far: LANES[1], split: (KERB + FKERB) / 2, end: E0, west: W0, cross: XWALK }); ups.push((dt, t) => block.update(dt, t));
  return Object.assign(api, { group: city, jd: (h) => city.jd(h), shops: all, fronts: { shops: [] }, street, corner, glow, fill, sun, moon, lamps: lampMats, alley: true, vent: null, skyDome: sky, weatherAt, setEasy(on) { S.easy = on; paint(); }, update(dt, t) { for (const u of ups) u(dt, t); }, halo, rain: null, cars: street.cars, glowMap, bakeFar() { }, reflect() { } });
}
