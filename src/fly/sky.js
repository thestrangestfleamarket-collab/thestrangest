// Analytic sky + sun + shared atmosphere uniforms. Every world shader fogs toward the *same* skyColor()
// function evaluated at the horizon in the view direction, so terrain melts seamlessly into the sky.
import * as THREE from 'three';

export const atmo = {
  uSunDir: { value: new THREE.Vector3(0.3, 0.8, 0.5).normalize() },
  uSunCol: { value: new THREE.Color() }, uZenith: { value: new THREE.Color() }, uHorizon: { value: new THREE.Color() },
  uHorizonSun: { value: new THREE.Color() }, uSkyAmb: { value: new THREE.Color() }, uGroundAmb: { value: new THREE.Color() },
  uSunGlow: { value: new THREE.Color() }, uFogDensity: { value: 1 / 42000 }, uTime: { value: 0 }, uNoise: { value: null }, uNight: { value: 0 }, uCover: { value: 0 },
};

export const ATMO_GLSL = /* glsl */`
uniform vec3 uSunDir, uSunCol, uZenith, uHorizon, uHorizonSun, uSkyAmb, uGroundAmb, uSunGlow;
uniform float uFogDensity, uTime, uNight, uCover;
uniform sampler2D uNoise;
vec3 skyColor(vec3 d){
  float y = max(d.y, 0.0); float sd = max(dot(d, uSunDir), 0.0);
  float az = max(dot(normalize(vec2(d.x, d.z) + 1e-5), normalize(vec2(uSunDir.x, uSunDir.z) + 1e-5)), 0.0);
  vec3 hz = mix(uHorizon, uHorizonSun, pow(az, 3.0) * (1.0 - y) );
  vec3 c = mix(hz, uZenith, 1.0 - exp(-y * 3.6));
  c += uSunGlow * (pow(sd, 10.0) * 0.16 + pow(sd, 120.0) * 0.6);
  return c;
}
vec3 applyFog(vec3 col, vec3 wpos, vec3 cam){
  vec3 v = wpos - cam; float d = length(v);
  // height-aware haze: thinner when looking up through / from high altitude
  float hm = exp(-max(0.5 * (wpos.y + cam.y), 0.0) / 5200.0);
  float f = 1.0 - exp(-pow(d * uFogDensity * (0.35 + 0.65 * hm), 1.25));
  vec3 fd = normalize(vec3(v.x, max(v.y, 0.0) * 0.3 + 0.015 * d, v.z));
  return mix(col, skyColor(fd), clamp(f, 0.0, 1.0));
}
vec3 hemi(vec3 n){ return mix(uGroundAmb, uSkyAmb, n.y * 0.5 + 0.5) * 0.7; }
vec3 sunLight(float ndl){ return uSunCol * ndl * 0.318; }
float cloudShadow(vec3 wpos){
  vec2 uv = (wpos.xz + uSunDir.xz / max(uSunDir.y, 0.15) * (2200.0 - wpos.y)) / 9000.0 + vec2(uTime * 0.0011, 0.0);
  float n = texture2D(uNoise, uv).r * 0.65 + texture2D(uNoise, uv * 2.7 + 0.3).g * 0.35;
  return mix(1.0, 0.45, smoothstep(0.52, 0.68, n));
}
`;

export const TIMES = {
  day: { label: 'Midday', elev: 52, az: 140, sun: [1.0, 0.95, 0.86, 3.1], zen: [0.085, 0.22, 0.62], hor: [0.5, 0.66, 0.9], horSun: [0.62, 0.72, 0.9], skyAmb: [0.34, 0.46, 0.66], gndAmb: [0.13, 0.12, 0.1], glow: [1.0, 0.9, 0.75], fog: 1 / 46000, night: 0 },
  golden: { label: 'Golden hour', elev: 11, az: 250, sun: [1.0, 0.63, 0.34, 2.6], zen: [0.07, 0.16, 0.42], hor: [0.5, 0.47, 0.5], horSun: [1.1, 0.58, 0.22], skyAmb: [0.4, 0.43, 0.56], gndAmb: [0.17, 0.13, 0.11], glow: [1.2, 0.62, 0.25], fog: 1 / 36000, night: 0 },
  dusk: { label: 'Dusk', elev: 1.5, az: 265, sun: [1.0, 0.4, 0.16, 0.9], zen: [0.022, 0.045, 0.14], hor: [0.2, 0.17, 0.24], horSun: [0.95, 0.36, 0.1], skyAmb: [0.17, 0.19, 0.3], gndAmb: [0.07, 0.06, 0.07], glow: [1.0, 0.4, 0.12], fog: 1 / 34000, night: 0.55 },
  overcast: { label: 'Overcast', elev: 40, az: 150, sun: [0.9, 0.93, 1.0, 0.75], zen: [0.3, 0.33, 0.38], hor: [0.42, 0.45, 0.5], horSun: [0.48, 0.5, 0.54], skyAmb: [0.5, 0.54, 0.6], gndAmb: [0.16, 0.16, 0.15], glow: [0.25, 0.25, 0.25], fog: 1 / 16000, night: 0, cover: 1 },
  night: { label: 'Moonlit night', elev: 38, az: 200, sun: [0.55, 0.68, 1.0, 0.16], zen: [0.0035, 0.007, 0.02], hor: [0.012, 0.02, 0.04], horSun: [0.014, 0.024, 0.048], skyAmb: [0.018, 0.026, 0.05], gndAmb: [0.006, 0.007, 0.01], glow: [0.1, 0.13, 0.2], fog: 1 / 38000, night: 1 },
};

export class Sky {
  // world scene: sun + sky light (no shadows). local scene (own aircraft + cockpit): shadow-casting sun.
  constructor(scene, local, noiseTex) {
    atmo.uNoise.value = noiseTex; this.scenes = [scene, local];
    this.sunW = new THREE.DirectionalLight(0xffffff, 1); this.hemiW = new THREE.HemisphereLight(0xffffff, 0x444444, 1); scene.add(this.sunW, this.hemiW);
    this.sun = new THREE.DirectionalLight(0xffffff, 1); this.sun.castShadow = true;
    this.hemi = new THREE.HemisphereLight(0xffffff, 0x444444, 1);
    local.add(this.sun, this.sun.target, this.hemi);
    const s = this.sun.shadow; s.mapSize.set(2048, 2048); s.bias = -0.0006; s.normalBias = 0.03;
    const c = s.camera; c.left = c.bottom = -16; c.right = c.top = 16; c.near = 1; c.far = 120; c.updateProjectionMatrix();
    this.material = new THREE.ShaderMaterial({
      uniforms: { ...atmo }, side: THREE.BackSide, depthWrite: false, depthTest: false, fog: false,
      vertexShader: `varying vec3 vDir; void main(){ vDir = position; vec4 p = modelViewMatrix * vec4(position, 0.0); gl_Position = projectionMatrix * vec4(p.xyz, 1.0); gl_Position.z = gl_Position.w * 0.9999; }`,
      fragmentShader: ATMO_GLSL + /* glsl */`
        varying vec3 vDir;
        float hash(vec3 p){ return fract(sin(dot(p, vec3(127.1, 311.7, 74.7))) * 43758.5453); }
        void main(){
          vec3 d = normalize(vDir);
          vec3 c = skyColor(d);
          float sd = dot(d, uSunDir);
          c += uSunCol * smoothstep(0.99985, 0.99996, sd) * 14.0 * (1.0 - uNight * 0.6) * (1.0 - uCover);       // sun / moon disc
          // high cirrus sheet
          if (d.y > 0.01) { vec2 uv = d.xz / (d.y + 0.08) * 0.34 + vec2(uTime * 0.0006, 0.0);
            float n = texture2D(uNoise, uv).r * 0.6 + texture2D(uNoise, uv * 3.1).g * 0.4; n *= 0.55 + 0.9 * texture2D(uNoise, uv * vec2(0.31, 0.47) + 0.4).b;
            float a = smoothstep(0.46, 0.9, n) * smoothstep(0.01, 0.2, d.y) * 0.55; a = max(a, uCover * smoothstep(-0.02, 0.09, d.y) * (0.82 + 0.18 * n));
            vec3 cc = uSkyAmb * 1.1 + uSunCol * (0.16 + 0.25 * pow(max(sd, 0.0), 6.0));
            cc += uSunGlow * (pow(max(sd, 0.0), 10.0) * 0.5 + pow(max(sd, 0.0), 60.0) * 0.6); cc = mix(cc, uSkyAmb * (0.95 + 0.5 * n) + uSunCol * 0.1 * pow(max(sd, 0.0), 3.0), uCover); c = mix(c, mix(max(cc, c * 1.04), cc, uCover), a); }
          // stars
          if (uNight > 0.8) { vec3 p = d * 190.0, g = floor(p); float h = hash(g); vec3 o = vec3(hash(g + 1.3), hash(g + 2.7), hash(g + 4.1)) * 0.6 + 0.2; float r = length(p - g - o); c += vec3(1.0, 0.95, 0.85) * step(0.994, h) * (0.3 + (h - 0.994) * 280.0) * smoothstep(0.22, 0.0, r) * smoothstep(0.02, 0.3, d.y); }
          if (d.y < 0.0) c = mix(c, skyColor(vec3(d.x, 0.0, d.z)) * 0.9, smoothstep(0.0, -0.05, d.y));
          gl_FragColor = vec4(c, 1.0);
          #include <tonemapping_fragment>
          #include <colorspace_fragment>
        }` });
    this.dome = new THREE.Mesh(new THREE.IcosahedronGeometry(1, 3), this.material);
    this.dome.frustumCulled = false; this.dome.renderOrder = -1000; scene.add(this.dome);
    this.envScene = new THREE.Scene(); this.envDome = new THREE.Mesh(this.dome.geometry, this.material); this.envScene.add(this.envDome);
    this.timeKey = 'day';
  }
  setTime(key, renderer) { const scene = this.scenes[0];
    const t = TIMES[key]; this.timeKey = key; this.t = t;
    const el = t.elev * Math.PI / 180, az = t.az * Math.PI / 180;
    atmo.uSunDir.value.set(Math.cos(el) * Math.sin(az), Math.sin(el), -Math.cos(el) * Math.cos(az)).normalize();
    atmo.uSunCol.value.setRGB(t.sun[0] * t.sun[3], t.sun[1] * t.sun[3], t.sun[2] * t.sun[3]);
    atmo.uZenith.value.fromArray(t.zen); atmo.uHorizon.value.fromArray(t.hor); atmo.uHorizonSun.value.fromArray(t.horSun);
    atmo.uSkyAmb.value.fromArray(t.skyAmb); atmo.uGroundAmb.value.fromArray(t.gndAmb); atmo.uSunGlow.value.fromArray(t.glow);
    atmo.uFogDensity.value = t.fog; this.fog0 = t.fog; atmo.uNight.value = t.night; atmo.uCover.value = t.cover || 0;
    this.sun.color.setRGB(t.sun[0], t.sun[1], t.sun[2]); this.sun.intensity = t.sun[3];
    this.hemi.color.fromArray(t.skyAmb); this.hemi.groundColor.fromArray(t.gndAmb); this.hemi.intensity = 2.2;
    this.sunW.color.copy(this.sun.color); this.sunW.intensity = t.sun[3]; this.sunW.position.copy(atmo.uSunDir.value); this.hemiW.color.copy(this.hemi.color); this.hemiW.groundColor.copy(this.hemi.groundColor); this.hemiW.intensity = 2.2;
    scene.fog = new THREE.FogExp2(new THREE.Color().fromArray(t.hor), t.fog * 0.75);
    // image-based lighting from the sky itself
    const pm = new THREE.PMREMGenerator(renderer); const old = scene.environment;
    const tm = renderer.toneMapping; renderer.toneMapping = THREE.NoToneMapping;
    scene.environment = pm.fromScene(this.envScene, 0, 0.1, 10).texture; renderer.toneMapping = tm;
    scene.environmentIntensity = 0.85; this.scenes[1].environment = scene.environment; this.scenes[1].environmentIntensity = 0.85; pm.dispose(); if (old) old.dispose();
  }
  // keep dome on camera; fit the shadow frustum around the player's aircraft
  update(camPos, focus) {
    this.dome.position.copy(camPos);
    this.sun.target.position.copy(focus); this.sun.position.copy(focus).addScaledVector(atmo.uSunDir.value, 60);
    this.sun.target.updateMatrixWorld();
  }
}
