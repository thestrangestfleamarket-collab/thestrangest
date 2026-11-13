// Halcyon Greens: the desktop picture's finish (lantern and firefly glow, a soft vignette and film grain); the headset draws the scene directly
import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';

export function makePost(renderer, scene, camera) {
  let composer = null, grain = null;
  const build = () => {
    const size = renderer.getSize(new THREE.Vector2());
    composer = new EffectComposer(renderer, new THREE.WebGLRenderTarget(size.x, size.y, { type: THREE.HalfFloatType, samples: 4 }));
    composer.addPass(new RenderPass(scene, camera));
    composer.addPass(new UnrealBloomPass(new THREE.Vector2(size.x, size.y), 0.55, 0.6, 1.1));
    composer.addPass(new OutputPass());
    grain = new ShaderPass({
      uniforms: { tDiffuse: { value: null }, uTime: { value: 0 } },
      vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
      fragmentShader: `uniform sampler2D tDiffuse; uniform float uTime; varying vec2 vUv;
        float h(vec2 p){ return fract(sin(dot(p, vec2(12.9898, 78.233)) + uTime * 61.7) * 43758.5453); }
        void main(){ vec4 c = texture2D(tDiffuse, vUv); vec2 d = vUv - 0.5;
          c.rgb *= mix(1.0, 0.62, smoothstep(0.25, 0.85, dot(d, d) * 2.2));
          c.rgb += (h(vUv * 913.0) - 0.5) * 0.028; gl_FragColor = c; }`,
    });
    composer.addPass(grain);
    composer.setSize(size.x, size.y);
  };
  return {
    render(dt) { if (!composer) build(); grain.uniforms.uTime.value = (grain.uniforms.uTime.value + dt) % 100; composer.render(dt); },
    setSize(w, h) { if (composer) composer.setSize(w, h); },
  };
}
