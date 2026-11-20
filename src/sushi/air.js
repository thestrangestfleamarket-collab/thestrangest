// the air between you and everything, after THE MARKET's distance fog (src/134e-distfog.js): a thin haze everywhere and a ground mist that thins with height, worked out along each sightline, and the sun's (or moon's) glow in it toward the light; done in every material's own fog step, not a pass after the picture, so it costs the headset a few sums a pixel and no extra picture
import * as THREE from 'three';

// shared by every material (the arrays are kept by reference when three copies a material's uniforms)
export const AIR = {
  sun: new Float32Array([0, 1, 0, 0.6]),   // the light's direction (to it) and how forward its glow is thrown
  sunC: new Float32Array([0, 0, 0, 0]),    // the glow's colour and strength
  mist: new Float32Array([0, 1 / 3, 0, 0.97]),   // ground mist's density (per metre at the ground), 1 / its height, the ground's height, the most the air ever takes
};

let done = false;
export function installAir() {
  if (done) return; done = true;
  const C = THREE.ShaderChunk;
  C.fog_pars_vertex = '#ifdef USE_FOG\n varying float vFogDepth; varying vec3 vFogW;\n#endif\n';
  C.fog_vertex = '#ifdef USE_FOG\n vFogDepth = - mvPosition.z; vFogW = ( mvPosition.xyz - viewMatrix[ 3 ].xyz ) * mat3( viewMatrix );\n#endif\n';
  C.fog_pars_fragment = `#ifdef USE_FOG
  uniform vec3 fogColor; varying float vFogDepth; varying vec3 vFogW; uniform vec4 fogSun, fogSunC, fogMist;
  #ifdef FOG_EXP2
    uniform float fogDensity;
  #else
    uniform float fogNear; uniform float fogFar;
  #endif
#endif
`;
  C.fog_fragment = `#ifdef USE_FOG
  {
  #ifdef FOG_EXP2
    vec3 fr = vFogW - cameraPosition; float fL = length(fr), fk = fogMist.y;
    float flo = max(0.0, min(cameraPosition.y, vFogW.y) - fogMist.z) * fk, fdh = abs(fr.y) * fk;
    float favg = (fdh < 0.001 ? 1.0 - fdh * 0.5 : (1.0 - exp(-fdh)) / fdh) * exp(-flo);
    float fogFactor = min(fogMist.w, 1.0 - exp(-fL * (fogDensity + fogMist.x * favg)));
    float fmu = dot(fr / max(fL, 0.0001), fogSun.xyz), fg = fogSun.w;
    vec3 fcol = fogColor + fogSunC.rgb * (1.0 - fg * fg) / pow(1.0 + fg * fg - 2.0 * fg * fmu, 1.5);
  #else
    float fogFactor = smoothstep(fogNear, fogFar, vFogDepth); vec3 fcol = fogColor;
  #endif
    gl_FragColor.rgb = mix(gl_FragColor.rgb, fcol, fogFactor);
  }
#endif
`;
  for (const k in THREE.ShaderLib) { const u = THREE.ShaderLib[k].uniforms; if (u && u.fogColor) Object.assign(u, { fogSun: { value: AIR.sun }, fogSunC: { value: AIR.sunC }, fogMist: { value: AIR.mist } }); }
}
