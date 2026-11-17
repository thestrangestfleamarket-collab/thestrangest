// SPACE FLEET's lens, for open space only: the battle is drawn into a picture first, then put on the screen through a pass that blurs what is nearer or farther than what you look at (depth of field) and lets what moves leave a short trail (motion blur: each frame is mixed with the last, the last carried to where the world now is, so turning your head smears nothing that stands still). Works for the headset's two eyes or a plain screen. The wrist panel, the notices and the pointers are drawn after it, sharp
import * as THREE from 'three';

const VS = 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }';
const LENS = `
uniform sampler2D tC, tD, tH; uniform mat4 uInv0, uInv1, uPrev0, uPrev1; uniform vec4 uR0, uR1; uniform vec2 uPx; uniform float uFocus, uHist, uBlend, uK; varying vec2 vUv;
void main(){
  bool one = vUv.x >= uR0.y; vec4 R = one ? uR1 : uR0;
  float d = texture2D(tD, vUv).x, z = R.w / (d * 2.0 - 1.0 + R.z), c = 1.0 / uFocus - 1.0 / max(z, 0.02), rad = c > 0.0 ? min(c * uK, uK * 0.42) : min(-c * uK, uK * 1.7);
  vec3 col = texture2D(tC, vUv).rgb;
  if (rad > 0.4) { vec3 a = col; for (int i = 0; i < 12; i++) { float fi = float(i), r = sqrt((fi + 0.5) / 12.0) * rad, t = fi * 2.39996; a += texture2D(tC, vec2(clamp(vUv.x + cos(t) * r * uPx.x, R.x + uPx.x, R.y - uPx.x), vUv.y + sin(t) * r * uPx.y)).rgb; } col = a / 13.0; }
  if (uHist > 0.5) { vec4 w = (one ? uInv1 : uInv0) * vec4((vUv.x - R.x) / (R.y - R.x) * 2.0 - 1.0, vUv.y * 2.0 - 1.0, d * 2.0 - 1.0, 1.0); w /= w.w; vec4 p = (one ? uPrev1 : uPrev0) * w; vec2 u = p.xy / p.w * 0.5 + 0.5;
    if (p.w > 0.0 && u.x > 0.0 && u.x < 1.0 && u.y > 0.0 && u.y < 1.0) col = mix(col, texture2D(tH, vec2(R.x + u.x * (R.y - R.x), u.y)).rgb, uBlend); }
  gl_FragColor = vec4(col, 1.0);
}`;
const OUT = 'uniform sampler2D tC; varying vec2 vUv; void main(){ gl_FragColor = vec4(texture2D(tC, vUv).rgb, 1.0);\n#include <tonemapping_fragment>\n#include <colorspace_fragment>\n}';

class Post {
  constructor(renderer) { this.r = renderer; this.w = 0; this.focus = 1; this.valid = false; this.i = 0; this.hud = 3;
    this.type = renderer.extensions.has('EXT_color_buffer_half_float') || renderer.extensions.has('EXT_color_buffer_float') ? THREE.HalfFloatType : THREE.UnsignedByteType;
    const M = () => new THREE.Matrix4(), V = () => new THREE.Vector4(0, 1, -1, -0.04);
    this.lens = new THREE.ShaderMaterial({ vertexShader: VS, fragmentShader: LENS, depthTest: false, depthWrite: false, toneMapped: false, uniforms: { tC: { value: null }, tD: { value: null }, tH: { value: null }, uInv0: { value: M() }, uInv1: { value: M() }, uPrev0: { value: M() }, uPrev1: { value: M() }, uR0: { value: V() }, uR1: { value: V() }, uPx: { value: new THREE.Vector2() }, uFocus: { value: 1 }, uHist: { value: 0 }, uBlend: { value: 0.45 }, uK: { value: 3.2 } } });
    this.out = new THREE.ShaderMaterial({ vertexShader: VS, fragmentShader: OUT, depthTest: false, depthWrite: false, uniforms: { tC: { value: null } } });
    this.quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), this.lens); this.quad.frustumCulled = false; this.qs = new THREE.Scene(); this.qs.add(this.quad); this.cam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1); this.vp = [M(), M()]; this.sz = new THREE.Vector2(); }
  size(w, h) { if (w === this.w && h === this.h) return; this.w = w; this.h = h; for (const t of [this.a, ...(this.hist || [])]) t && t.dispose();
    this.a = new THREE.WebGLRenderTarget(w, h, { type: this.type, samples: 4, depthTexture: new THREE.DepthTexture(w, h) }); this.hist = [0, 1].map(() => new THREE.WebGLRenderTarget(w, h, { type: this.type, depthBuffer: false })); this.valid = false; }
  // focus: how far off (metres) what you look at is
  render(scene, camera, focus) {
    const r = this.r, xr = r.xr, target = r.getRenderTarget(), on = xr.enabled, pres = xr.isPresenting, U = this.lens.uniforms; if (target) this.size(target.width, target.height); else { r.getDrawingBufferSize(this.sz); this.size(this.sz.x, this.sz.y); }
    this.focus += (focus - this.focus) * 0.08;
    camera.layers.set(0); r.shadowMap.autoUpdate = true; r.setRenderTarget(this.a); r.render(scene, camera);
    const cams = pres ? xr.getCamera().cameras : [camera], next = this.hist[this.i], last = this.hist[1 - this.i];
    for (let e = 0; e < 2; e++) { const c = cams[Math.min(e, cams.length - 1)], R = U['uR' + e].value, P = c.projectionMatrix.elements; if (pres && c.viewport) R.set(c.viewport.x / this.w, (c.viewport.x + c.viewport.z) / this.w, P[10], P[14]); else R.set(0, 1, P[10], P[14]);
      U['uPrev' + e].value.copy(this.vp[e]); this.vp[e].multiplyMatrices(c.projectionMatrix, c.matrixWorldInverse); U['uInv' + e].value.copy(this.vp[e]).invert(); }
    if (cams.length < 2) U.uR0.value.y = 2;   // one eye: all of the picture is its
    U.tC.value = this.a.texture; U.tD.value = this.a.depthTexture; U.tH.value = last.texture; U.uPx.value.set(1 / this.w, 1 / this.h); U.uFocus.value = Math.max(0.15, this.focus); U.uK.value = 2.8 * this.h / 720; U.uHist.value = this.valid ? 1 : 0;
    xr.enabled = false; r.shadowMap.autoUpdate = false;
    this.quad.material = this.lens; r.setRenderTarget(next); r.render(this.qs, this.cam);
    this.out.uniforms.tC.value = next.texture; this.quad.material = this.out; r.setRenderTarget(target); r.render(this.qs, this.cam);
    xr.enabled = on; camera.layers.set(this.hud); r.autoClear = false; r.clearDepth(); r.render(scene, camera); r.autoClear = true; camera.layers.set(0); camera.layers.enable(this.hud); r.shadowMap.autoUpdate = true;
    this.i = 1 - this.i; this.valid = true;
  }
  rest() { this.valid = false; }
}
export { Post };
