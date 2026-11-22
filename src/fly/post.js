// The screen's lens: the frame drawn to a float target, then bloom, rays from the sun, a soft vignette, tone mapping.
import * as THREE from 'three';

const VS = 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }';
const mat = (fs, u) => new THREE.ShaderMaterial({ uniforms: u, vertexShader: VS, fragmentShader: fs, depthTest: false, depthWrite: false, fog: false });
export class Post {
  constructor(renderer) {
    this.r = renderer; this.size = new THREE.Vector2(); this.cam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1); this.quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2)); this.quad.frustumCulled = false;
    this.bright = mat('uniform sampler2D t; varying vec2 vUv; void main(){ vec3 c = texture2D(t, vUv).rgb; float l = dot(c, vec3(0.2126, 0.7152, 0.0722)); gl_FragColor = vec4(c * smoothstep(0.85, 2.2, l), 1.0); }', { t: { value: null } });
    this.blur = mat('uniform sampler2D t; uniform vec2 d; varying vec2 vUv; void main(){ vec3 c = texture2D(t, vUv).rgb * 0.227; c += (texture2D(t, vUv + d * 1.38).rgb + texture2D(t, vUv - d * 1.38).rgb) * 0.316; c += (texture2D(t, vUv + d * 3.23).rgb + texture2D(t, vUv - d * 3.23).rgb) * 0.07; gl_FragColor = vec4(c, 1.0); }', { t: { value: null }, d: { value: new THREE.Vector2() } });
    this.rays = mat('uniform sampler2D t; uniform vec2 sun; uniform float k; varying vec2 vUv; void main(){ vec2 st = (sun - vUv) / 28.0 * 0.92; vec2 p = vUv; vec3 c = vec3(0.0); float w = 1.0; for (int i = 0; i < 28; i++){ p += st; c += texture2D(t, p).rgb * w; w *= 0.955; } gl_FragColor = vec4(c / 14.0 * k, 1.0); }', { t: { value: null }, sun: { value: new THREE.Vector2() }, k: { value: 0 } });
    this.final = mat('uniform sampler2D t, tb, tr; uniform float bloom, vig; varying vec2 vUv; void main(){ vec3 c = texture2D(t, vUv).rgb + texture2D(tb, vUv).rgb * bloom + texture2D(tr, vUv).rgb; vec2 q = vUv - 0.5; c *= 1.0 - vig * dot(q, q) * 1.6; gl_FragColor = vec4(c, 1.0);\n#include <tonemapping_fragment>\n#include <colorspace_fragment>\n}', { t: { value: null }, tb: { value: null }, tr: { value: null }, bloom: { value: 0.35 }, vig: { value: 0.55 } });
  }
  fit() { const s = this.r.getDrawingBufferSize(new THREE.Vector2()); if (this.rt && s.equals(this.size)) return; this.size.copy(s); for (const k of ['rt', 'a', 'b', 'c']) this[k]?.dispose();
    const o = { type: THREE.HalfFloatType, minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, depthBuffer: false }, w = Math.max(2, s.x >> 2), h = Math.max(2, s.y >> 2);
    this.rt = new THREE.WebGLRenderTarget(s.x, s.y, { ...o, depthBuffer: true, samples: 4 }); this.a = new THREE.WebGLRenderTarget(w, h, o); this.b = new THREE.WebGLRenderTarget(w, h, o); this.c = new THREE.WebGLRenderTarget(w, h, o); this.blur.uniforms.d.value.set(1 / w, 1 / h); }
  pass(m, to) { this.quad.material = m; this.r.setRenderTarget(to); this.r.render(this.quad, this.cam); }
  // sun: its place on the screen (0..1) and how much of it faces the camera
  end(sun, facing) { const r = this.r, u = this.blur.uniforms;
    this.bright.uniforms.t.value = this.rt.texture; this.pass(this.bright, this.a);
    u.t.value = this.a.texture; const d = u.d.value, dx = d.x, dy = d.y; d.set(dx, 0); this.pass(this.blur, this.b); u.t.value = this.b.texture; d.set(0, dy); this.pass(this.blur, this.a); d.set(dx, dy);
    this.rays.uniforms.t.value = this.a.texture; this.rays.uniforms.sun.value.copy(sun); this.rays.uniforms.k.value = facing; this.pass(this.rays, this.c);
    const f = this.final.uniforms; f.t.value = this.rt.texture; f.tb.value = this.a.texture; f.tr.value = this.c.texture; this.pass(this.final, null); }
}
