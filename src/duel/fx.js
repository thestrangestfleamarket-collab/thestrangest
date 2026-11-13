// Visuals: projectile models, explosions, shields, avatars, canvas-texture labels.
import * as THREE from 'three';
import { WEAPONS, ORDER } from './weapons.js';
import { Particles } from './particles.js';
import { HEX_GLSL } from './world.js';
import { Scars } from './scars.js';
import { sfx } from './audio.js';

export const COLORS = { own: 0x35e0ff, foe: 0xff4466 };

const SPHERE = new THREE.SphereGeometry(1, 24, 16);
const Z = new THREE.Vector3(0, 0, 1);
const X = new THREE.Vector3(1, 0, 0);
const _v = new THREE.Vector3(), _c = new THREE.Color();

function canvasTex(size, draw) {
  const c = document.createElement('canvas'); c.width = c.height = size;
  draw(c.getContext('2d'), size);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace;
  return t;
}
const GLOW_TEX = canvasTex(128, (ctx, s) => {
  const g = ctx.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2);
  g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(0.18, 'rgba(255,255,255,0.75)');
  g.addColorStop(0.45, 'rgba(255,255,255,0.22)'); g.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = g; ctx.fillRect(0, 0, s, s);
});
const RING_TEX = canvasTex(256, (ctx, s) => {
  const g = ctx.createRadialGradient(s / 2, s / 2, s * 0.3, s / 2, s / 2, s / 2);
  g.addColorStop(0, 'rgba(255,255,255,0)'); g.addColorStop(0.72, 'rgba(255,255,255,0.15)');
  g.addColorStop(0.9, 'rgba(255,255,255,1)'); g.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = g; ctx.fillRect(0, 0, s, s);
});

const glow = (color, opacity = 1) => new THREE.MeshBasicMaterial({
  color, transparent: true, opacity, blending: THREE.AdditiveBlending, depthWrite: false,
});
const hot = (color, boost = 2) => {            // over-bright so bloom picks it up
  const m = new THREE.MeshBasicMaterial({ color });
  m.color.multiplyScalar(boost);
  return m;
};
// Real scanned metal (CC0, ambientCG): colour + normal + roughness maps.
const loader = new THREE.TextureLoader();
const TEX = {};
for (const name of ['plates', 'gunmetal', 'brushed', 'carbon', 'rubber']) {
  TEX[name] = ['color', 'normal', 'rough'].map((kind) => {
    const t = loader.load(`duel-assets/${name}_${kind}.jpg`, (tex) => {
      tex.userData.loaded = true;
      for (const c of tex.userData.clones) c.needsUpdate = true;   // clones share the image but need their own upload flag
    });
    t.userData.clones = [];
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    if (kind === 'color') t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 4;
    return t;
  });
}
export function pbr(name, rx = 1, ry = 1, { tint = 0xffffff, emissive = 0x000000, ei = 1, metalness = 1 } = {}) {
  const [map, normalMap, roughnessMap] = TEX[name].map((t) => {
    const c = t.clone(); c.userData = {}; c.repeat.set(rx, ry);
    t.userData.clones.push(c);
    if (t.userData.loaded) c.needsUpdate = true;
    return c;
  });
  return new THREE.MeshStandardMaterial({ map, normalMap, roughnessMap, color: tint, metalness, roughness: 1, emissive, emissiveIntensity: ei });
}

function ball(r, mat) {
  const m = new THREE.Mesh(SPHERE, mat);
  m.scale.setScalar(r);
  return m;
}

function halo(color, size, opacity = 1, tex = GLOW_TEX) {
  const s = new THREE.Sprite(new THREE.SpriteMaterial({
    map: tex, color, transparent: true, opacity, blending: THREE.AdditiveBlending, depthWrite: false,
  }));
  s.scale.setScalar(size);
  return s;
}

// Rim-lit energy surface with an optional hex pattern (shields, orbs, blast shells).
export function energyMat(color, { power = 2.2, opacity = 1, hex = 0 } = {}) {
  return new THREE.ShaderMaterial({
    uniforms: {
      uColor: { value: new THREE.Color(color) }, uPower: { value: power }, uOpacity: { value: opacity },
      uHex: { value: hex }, uFlash: { value: 0 }, uTime: { value: 0 },
    },
    vertexShader: `
      varying vec3 vN; varying vec3 vV; varying vec3 vP;
      void main() {
        vec4 mv = modelViewMatrix * vec4(position, 1.0);
        vN = normalize(normalMatrix * normal); vV = normalize(-mv.xyz); vP = position;
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: `
      uniform vec3 uColor; uniform float uPower, uOpacity, uHex, uFlash, uTime;
      varying vec3 vN; varying vec3 vV; varying vec3 vP;
      ${HEX_GLSL}
      void main() {
        float f = pow(1.0 - abs(dot(normalize(vN), normalize(vV))), uPower);
        float pat = 0.0;
        if (uHex > 0.0) {
          vec3 n = abs(normalize(vP));
          vec2 uv = n.z > n.x && n.z > n.y ? vP.xy : (n.x > n.y ? vP.zy : vP.xz);
          pat = hexGrid(uv * uHex) * (0.55 + 0.45 * sin(uTime * 3.0 + vP.y * 6.0));
        }
        float a = (f + pat * 0.35 + uFlash * 0.6) * uOpacity;
        gl_FragColor = vec4(uColor * (0.6 + f * 1.6 + pat * 0.8 + uFlash * 2.0), a);
        #include <colorspace_fragment>
      }`,
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide,
  });
}

export function makeShield() {
  const mat = energyMat(0x55b8ff, { power: 2.0, opacity: 0.9, hex: 7 });
  const mesh = new THREE.Mesh(SPHERE, mat);
  mesh.scale.setScalar(0.3);
  mesh.renderOrder = 6;
  return mesh;
}

// A sprite whose texture is a 2D canvas; redraws only when `key` changes.
export class CanvasSprite {
  constructor(w, h, worldWidth) {
    this.canvas = document.createElement('canvas');
    this.canvas.width = w; this.canvas.height = h;
    this.ctx = this.canvas.getContext('2d');
    this.tex = new THREE.CanvasTexture(this.canvas);
    this.tex.colorSpace = THREE.SRGBColorSpace;
    this.sprite = new THREE.Sprite(new THREE.SpriteMaterial({
      map: this.tex, transparent: true, depthTest: false, depthWrite: false, toneMapped: false, fog: false,
    }));
    this.sprite.renderOrder = 999;
    this.sprite.scale.set(worldWidth, worldWidth * h / w, 1);
    this.key = null;
  }
  draw(key, fn) {
    if (key === this.key) return;
    this.key = key;
    const { ctx, canvas } = this;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    fn(ctx, canvas.width, canvas.height);
    this.tex.needsUpdate = true;
  }
  text(str, color = '#ffffff') {
    this.sprite.visible = !!str;
    if (!str) return;
    this.draw(str + color, (ctx, w, h) => {
      const lines = str.split('\n');
      const size = Math.min(h / (lines.length * 1.25), 110);
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      lines.forEach((line, i) => {
        const s = i === 0 ? size : size * 0.62;
        ctx.font = `800 ${s}px system-ui, sans-serif`;
        const y = h / 2 + (i - (lines.length - 1) / 2) * size * 1.05;
        ctx.lineWidth = s * 0.16; ctx.strokeStyle = 'rgba(0,0,0,0.85)';
        ctx.strokeText(line, w / 2, y, w - 20);
        ctx.fillStyle = i === 0 ? color : '#e8ecf4';
        ctx.fillText(line, w / 2, y, w - 20);
      });
    });
  }
}

export class FX {
  constructor(root) {
    this.root = root;
    this.items = [];
    this.sparks = new Particles(root, 2600, THREE.AdditiveBlending);
    this.smoke = new Particles(root, 500, THREE.NormalBlending);
    // Two pooled lights give explosions and muzzle flashes real illumination.
    this.lights = [0, 1].map(() => {
      const l = new THREE.PointLight(0xffffff, 0, 7, 2);
      l.userData.t = 0; l.userData.peak = 0;
      root.add(l);
      return l;
    });
    this.lightI = 0;
    this.wallHit = null;     // set by main: (pos) => world.wallHit(pos)
    this.bounds = null;      // set by the game: arena half-sizes
    this.scars = new Scars(root, this);
    this.shake = 0;
  }

  add(obj, life, fn) {
    this.root.add(obj);
    this.items.push({ obj, life, max: life, fn });
    fn(obj, 0);
  }

  light(pos, color, peak, dur = 0.35) {
    const l = this.lights[this.lightI]; this.lightI = (this.lightI + 1) % this.lights.length;
    l.position.copy(pos); l.color.set(color);
    l.userData.peak = peak; l.userData.t = l.userData.dur = dur;
  }

  update(dt) {
    for (let i = this.items.length - 1; i >= 0; i--) {
      const it = this.items[i];
      it.life -= dt;
      if (it.life <= 0) {
        this.root.remove(it.obj);
        it.obj.material?.dispose();
        this.items.splice(i, 1);
      } else it.fn(it.obj, 1 - it.life / it.max);
    }
    for (const l of this.lights) {
      l.userData.t = Math.max(0, l.userData.t - dt);
      l.intensity = l.userData.t > 0 ? l.userData.peak * (l.userData.t / l.userData.dur) ** 2 : 0;
    }
    this.scars.update(dt);
    this.sparks.update(dt);
    this.smoke.update(dt);
    this.shake = Math.max(0, this.shake - dt * 2.5);
  }

  explosion(pos, radius, color = 0xffaa33) {
    const p = pos.clone();
    this.add(halo(0xffffff, radius * 3.2), 0.14, (m, k) => { m.material.opacity = 1 - k; });
    this.items[this.items.length - 1].obj.position.copy(p);
    const core = new THREE.Mesh(SPHERE, glow(color, 0.9));
    core.position.copy(p);
    this.add(core, 0.38, (m, k) => {
      m.scale.setScalar(radius * (0.2 + 0.65 * Math.sqrt(k)));
      m.material.opacity = 0.9 * (1 - k) ** 2;
    });
    // Rim-lit shell at the true blast radius, so players learn the range.
    const shell = new THREE.Mesh(SPHERE, energyMat(color, { power: 1.6, opacity: 1, hex: 5 }));
    shell.position.copy(p); shell.scale.setScalar(radius);
    this.add(shell, 0.65, (m, k) => { m.material.uniforms.uOpacity.value = 1 - k; m.scale.setScalar(radius * (0.85 + 0.15 * Math.sqrt(k))); });
    const ring = halo(color, 0.1, 1, RING_TEX);
    ring.position.copy(p);
    this.add(ring, 0.45, (m, k) => { m.scale.setScalar(radius * 2.6 * Math.sqrt(k) + 0.1); m.material.opacity = 1 - k; });

    this.sparks.burst(p, 46, 5.5, { color: 0xffffff, size: 0.05, endSize: 0.01, life: 0.7, drag: 1.6, gravity: -5 });
    this.sparks.burst(p, 30, 3.0, { color, size: 0.11, endSize: 0.02, life: 0.5, drag: 2.5 });
    this.smoke.burst(p, 12, 0.9, { color: 0x1a1a22, size: 0.25, endSize: 0.8, life: 1.8, drag: 1.2, gravity: 0.35, alpha: 0.5 });
    this.light(p, color, 60 * radius, 0.45);
    this.shake = Math.min(1, this.shake + 0.6);

  }

  // A projectile struck a wall, the floor or the ceiling: leave a mark that suits it.
  surfaceHit(p, normal) {
    this.wallHit?.(p.pos);
    const c = p.mesh.userData.color;
    if (p.type === 'pulse') { this.scars.hole(p.pos, normal, 0xff7a2a, 0.13); sfx('sizzle'); }
    else if (p.type === 'bouncer') {
      this.scars.crack(p.pos, normal, c, 0.5);
      this.sparks.burst(p.pos, 14, 3, { color: c, size: 0.04, life: 0.4, drag: 2, gravity: -3 }, normal, 0.8);
    } else if (p.type === 'wave') {
      this.scars.slash(p.pos, normal, p.axis, WEAPONS.wave.half * 2, c); sfx('sizzle');
      for (let i = 0; i < 16; i++) {
        _v.copy(p.axis).multiplyScalar((Math.random() * 2 - 1) * WEAPONS.wave.half).add(p.pos);
        this.sparks.burst(_v, 2, 2, { color: 0xffc060, size: 0.04, life: 0.5, gravity: -3 }, normal, 0.7);
      }
    }
  }

  // An explosion marks every surface it reaches: fire scorches, cryo freezes.
  blastMarks(pos, type) {
    const B = this.bounds, W = WEAPONS[type];
    if (!B) return;
    const faces = [
      [0, 1, 0, pos.y], [0, -1, 0, B.h - pos.y],
      [1, 0, 0, pos.x + B.hx], [-1, 0, 0, B.hx - pos.x],
      [0, 0, 1, pos.z + B.hz], [0, 0, -1, B.hz - pos.z],
    ];
    for (const [nx, ny, nz, d] of faces) {
      if (d >= W.blast) continue;
      const size = 2 * Math.sqrt(W.blast * W.blast - d * d) * 0.9;
      const n = new THREE.Vector3(nx, ny, nz);
      const at = pos.clone().addScaledVector(n, -d);
      if (W.cryo) this.scars.frost(at, n, size * 1.1);
      else this.scars.scorch(at, n, size, W.color);
    }
    if (W.cryo) {
      this.smoke.burst(pos, 26, 1.6, { color: 0xd8f0ff, size: 0.2, endSize: 0.7, life: 1.6, drag: 1.5, alpha: 0.35 });
      this.sparks.burst(pos, 40, 4, { color: 0xcfefff, size: 0.05, life: 0.9, drag: 1.5, gravity: -2 });
      sfx('freeze');
    }
  }

  fire(pos, radius, life) { this.scars.fire(pos, radius, life); sfx('whoosh'); }

  puff(pos, color, size = 0.12, life = 0.25) {
    const h = halo(color, size * 3);
    h.position.copy(pos);
    this.add(h, life, (m, k) => { m.material.opacity = 1 - k; m.scale.setScalar(size * (2 + 3 * k)); });
    this.sparks.burst(pos, Math.round(6 + size * 30), 1.8, { color, size: 0.035, life: 0.35, drag: 2, gravity: -2 });
  }

  muzzle(pos, vel, color) {
    const h = halo(color, 0.3);
    h.position.copy(pos);
    this.add(h, 0.09, (m, k) => { m.material.opacity = 1 - k; });
    _v.copy(vel).normalize();
    this.sparks.burst(pos, 7, 2.5, { color, size: 0.03, life: 0.25, drag: 3 }, _v, 0.45);
    this.light(pos, color, 6, 0.12);
  }

  projectile(type, hostile) {
    const W = WEAPONS[type];
    const c = hostile ? COLORS.foe : COLORS.own;
    const g = new THREE.Group();
    g.userData.color = c;
    if (type === 'pulse') {
      const core = ball(0.035, hot(0xffffff)); core.scale.z = 0.13;
      g.add(core, halo(c, 0.3, 0.9));
    } else if (type === 'orb') {
      const shell = new THREE.Mesh(SPHERE, energyMat(c, { power: 1.4, hex: 9 }));
      shell.scale.setScalar(W.r);
      const h = halo(c, 0.75, 0.7);
      g.add(ball(0.07, hot(0xffffff)), shell, h);
      g.userData.shell = shell; g.userData.halo = h;
    } else if (type === 'missile') {
      const nose = new THREE.Mesh(new THREE.ConeGeometry(0.045, 0.13, 12).rotateX(Math.PI / 2), pbr('gunmetal', 1, 1, { emissive: c, ei: 1.6 }));
      nose.position.z = 0.1;
      const body = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 0.17, 16).rotateX(Math.PI / 2), pbr('brushed', 2, 1));
      body.position.z = -0.05;
      for (let i = 0; i < 4; i++) {
        const fin = new THREE.Mesh(new THREE.BoxGeometry(0.004, 0.07, 0.06), pbr('gunmetal', 0.3, 0.3, { emissive: c, ei: 0.6 }));
        fin.position.set(Math.cos(i * Math.PI / 2) * 0.06, Math.sin(i * Math.PI / 2) * 0.06, -0.11);
        fin.rotation.z = i * Math.PI / 2 + Math.PI / 2;
        g.add(fin);
      }
      const flame = halo(0xffa040, 0.3); flame.position.z = -0.17;
      g.add(nose, body, flame, halo(c, 0.22, 0.6));
    } else if (type === 'bouncer') {
      const cage = new THREE.Mesh(new THREE.IcosahedronGeometry(W.r, 0),
        new THREE.MeshBasicMaterial({ color: c, wireframe: true }));
      cage.material.color.multiplyScalar(2);
      g.add(cage, ball(0.04, hot(0xffffff)), halo(c, 0.42, 0.8));
      g.userData.cage = cage;
    } else if (type === 'wave') {
      g.add(new THREE.Mesh(new THREE.BoxGeometry(W.half * 2, 0.03, 0.03), hot(0xffffff, 1.2)));
      g.add(new THREE.Mesh(new THREE.BoxGeometry(W.half * 2 + 0.04, 0.1, 0.1), glow(c, 0.4)));
      g.add(new THREE.Mesh(new THREE.BoxGeometry(W.half * 2 + 0.1, 0.22, 0.22), glow(c, 0.12)));
      for (const sx of [-1, 1]) { const e = halo(c, 0.35, 0.9); e.position.x = sx * W.half; g.add(e); }
    } else if (type === 'mine') {
      const body = new THREE.Mesh(new THREE.OctahedronGeometry(W.r, 0), pbr('plates', 1.5, 1.5, { emissive: c, ei: 0.5 }));
      const band = new THREE.Mesh(new THREE.TorusGeometry(W.r * 0.8, 0.012, 6, 20), hot(c));
      const zone = new THREE.Mesh(SPHERE, energyMat(c, { power: 3, opacity: 0.35 }));
      zone.scale.setScalar(W.trigger); zone.visible = false;
      const light = halo(0xffffff, 0.3); light.visible = false;
      g.add(body, band, zone, light);
      g.userData.body = body; g.userData.band = band; g.userData.zone = zone; g.userData.light = light;
    }
    return g;
  }

  // Per-frame placement, animation and trail for a projectile.
  place(p, time) {
    const W = WEAPONS[p.type], m = p.mesh, c = m.userData.color, s = this.sparks;
    m.position.copy(p.pos);
    if (W.orient && p.vel.lengthSq() > 1e-6) m.quaternion.setFromUnitVectors(Z, _v.copy(p.vel).normalize());
    if (p.type === 'pulse') {
      s.emit(p.pos, 0, 0, 0, { color: c, size: 0.06, life: 0.18 });
    } else if (p.type === 'missile') {
      _v.copy(p.vel).normalize().multiplyScalar(-0.18).add(p.pos);
      s.emit(_v, (Math.random() - 0.5) * 0.3, (Math.random() - 0.5) * 0.3, (Math.random() - 0.5) * 0.3,
        { color: Math.random() < 0.5 ? 0xffc060 : 0xff6020, size: 0.1, endSize: 0.02, life: 0.35 });
      if (Math.random() < 0.5) this.smoke.emit(_v, 0, 0.15, 0, { color: 0x2a2a33, size: 0.08, endSize: 0.3, life: 1.1, alpha: 0.35 });
    } else if (W.bar) {
      m.quaternion.setFromUnitVectors(X, p.axis);
      _v.copy(p.axis).multiplyScalar((Math.random() * 2 - 1) * W.half).add(p.pos);
      s.emit(_v, 0, 0, 0, { color: c, size: 0.05, life: 0.3 });
    } else if (p.type === 'bouncer') {
      m.userData.cage.rotation.x += 0.2; m.userData.cage.rotation.y += 0.13;
      s.emit(p.pos, 0, 0, 0, { color: c, size: 0.07, endSize: 0.01, life: 0.3 });
    } else if (p.type === 'orb') {
      const pulse = 1 + 0.08 * Math.sin(time * 9);
      m.userData.shell.scale.setScalar(W.r * pulse);
      m.userData.shell.material.uniforms.uTime.value = time;
      m.userData.halo.scale.setScalar(0.75 * pulse);
      if (Math.random() < 0.4) {
        _v.set(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5).normalize().multiplyScalar(W.r).add(p.pos);
        s.emit(_v, 0, 0.1, 0, { color: c, size: 0.04, life: 0.45 });
      }
    } else if (p.type === 'mine') {
      const armed = p.age >= W.armTime, u = m.userData;
      u.body.rotation.y += 0.04; u.band.rotation.x += 0.03;
      u.zone.visible = armed;
      u.light.visible = armed && Math.sin(time * 14) > 0;
    }
  }
}

// Hand-held launcher, pointing down -Z. `glowMat` is recoloured to match the selected weapon.
// The receiver and grip are extruded from side-profile outlines so the silhouette reads as
// a real firearm rather than a stack of boxes.
function profile(points, thickness, bevel = 0.003) {
  const shape = new THREE.Shape(points.map(([u, v]) => new THREE.Vector2(u, v)));
  const geo = new THREE.ExtrudeGeometry(shape, { depth: thickness - bevel * 2, bevelEnabled: true, bevelThickness: bevel, bevelSize: bevel, bevelSegments: 2 });
  geo.translate(0, 0, -(thickness - bevel * 2) / 2);
  geo.rotateY(Math.PI / 2);          // profile's forward axis -> -Z, thickness -> X
  return geo;
}

export function makeGun() {
  const group = new THREE.Group();
  const glowMat = new THREE.MeshBasicMaterial({ color: 0x66ffff });
  const steel = pbr('gunmetal', 5, 5), steelFine = pbr('gunmetal', 9, 9, { tint: 0x9aa0aa });
  const bright = pbr('brushed', 6, 2), carbon = pbr('carbon', 7, 5, { metalness: 0.35 });
  const rubber = pbr('rubber', 10, 10, { metalness: 0, tint: 0xbbbbbb });
  const add = (geo, mat, x = 0, y = 0, z = 0) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); group.add(m); return m; };
  const tube = (r0, r1, len, seg = 20) => new THREE.CylinderGeometry(r0, r1, len, seg).rotateX(Math.PI / 2);

  // Receiver: angular upper with a cut-away underside.
  add(profile([[-0.085, -0.018], [-0.085, 0.022], [-0.06, 0.04], [0.105, 0.04], [0.15, 0.026], [0.15, -0.004], [0.115, -0.024], [0.03, -0.028], [0.0, -0.018]], 0.04), steel);
  // Side armour panels with a glowing seam between them.
  for (const sx of [-1, 1]) {
    add(new THREE.BoxGeometry(0.004, 0.03, 0.11), steelFine, sx * 0.021, 0.014, -0.03);
    add(new THREE.BoxGeometry(0.003, 0.004, 0.2), glowMat, sx * 0.0215, -0.006, -0.03);
    for (const z of [0.05, -0.105]) { const bolt = add(new THREE.CylinderGeometry(0.004, 0.004, 0.004, 8), bright, sx * 0.0225, 0.014, z); bolt.rotation.z = Math.PI / 2; }
  }
  // Grip (rubber), trigger and guard.
  add(profile([[-0.07, -0.016], [-0.03, -0.016], [-0.047, -0.125], [-0.09, -0.118]], 0.03, 0.005), rubber);
  const guard = add(new THREE.TorusGeometry(0.024, 0.0035, 6, 18, Math.PI), steelFine, 0, -0.026, 0.003);
  guard.rotation.set(0, Math.PI / 2, Math.PI);
  add(new THREE.BoxGeometry(0.006, 0.02, 0.006), bright, 0, -0.034, 0.012).rotation.x = -0.3;
  // Power cell slung under the front of the receiver, with a lit window.
  add(profile([[0.04, -0.026], [0.1, -0.026], [0.093, -0.075], [0.047, -0.075]], 0.028), steel);
  for (const sx of [-1, 1]) add(new THREE.BoxGeometry(0.002, 0.03, 0.026), glowMat, sx * 0.0145, -0.05, -0.07);
  // Carbon-fibre handguard (octagonal) with glowing vent slots.
  add(tube(0.031, 0.031, 0.13, 8), carbon, 0, 0.008, -0.205).rotation.z = Math.PI / 8;
  for (let i = 0; i < 4; i++) for (const sx of [-1, 1]) add(new THREE.BoxGeometry(0.003, 0.007, 0.02), glowMat, sx * 0.0295, 0.008, -0.16 - i * 0.03);
  add(tube(0.034, 0.034, 0.012, 8), steelFine, 0, 0.008, -0.142).rotation.z = Math.PI / 8;
  add(tube(0.034, 0.034, 0.012, 8), steelFine, 0, 0.008, -0.268).rotation.z = Math.PI / 8;
  // Barrel, energy coils, muzzle brake.
  add(tube(0.013, 0.013, 0.12), bright, 0, 0.008, -0.32);
  for (const z of [-0.29, -0.31, -0.33]) add(new THREE.TorusGeometry(0.019, 0.0035, 8, 22), glowMat, 0, 0.008, z);
  add(tube(0.024, 0.021, 0.045, 12), steel, 0, 0.008, -0.372);
  add(new THREE.TorusGeometry(0.0195, 0.003, 6, 20), glowMat, 0, 0.008, -0.396);
  add(tube(0.012, 0.012, 0.01), new THREE.MeshBasicMaterial({ color: 0x050505 }), 0, 0.008, -0.392);
  // Top rail with notches, and a holographic sight.
  add(new THREE.BoxGeometry(0.016, 0.008, 0.19), bright, 0, 0.046, -0.02);
  for (let i = 0; i < 9; i++) add(new THREE.BoxGeometry(0.02, 0.004, 0.008), steelFine, 0, 0.052, 0.06 - i * 0.02);
  add(new THREE.BoxGeometry(0.03, 0.008, 0.045), steel, 0, 0.058, -0.02);
  for (const sx of [-1, 1]) add(new THREE.BoxGeometry(0.003, 0.034, 0.034), steel, sx * 0.0135, 0.078, -0.02);
  add(new THREE.BoxGeometry(0.03, 0.003, 0.034), steel, 0, 0.096, -0.02);
  const reticle = add(new THREE.RingGeometry(0.004, 0.006, 20), glowMat, 0, 0.078, -0.02);
  reticle.material = glowMat;
  add(new THREE.PlaneGeometry(0.024, 0.03), new THREE.MeshBasicMaterial({ color: 0x88ccff, transparent: true, opacity: 0.12, depthWrite: false, side: THREE.DoubleSide }), 0, 0.078, -0.021);
  // Rear cap.
  add(new THREE.BoxGeometry(0.03, 0.03, 0.012), rubber, 0, 0.004, 0.09);

  const sight = new THREE.Line(
    new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0, 0.008, -0.4), new THREE.Vector3(0, 0.008, -1.1)]),
    new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.3 }));
  const waveGuide = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.006, 0.006), glowMat);
  waveGuide.position.set(0, 0.008, -0.4);
  group.add(sight, waveGuide);
  return { group, glowMat, waveGuide, sight };
}

// The other player. Against a real person in AR you simply see THEM through the headset:
// nothing is drawn over their body, only the launcher in their hand, their shield, and a
// health bar above their head. The armoured hover-drone body is used for the practice bot
// (and for a remote opponent when you play on a flat screen, where there is no camera view).
export class Avatar {
  constructor(root, color) {
    this.group = new THREE.Group();
    root.add(this.group);
    this.mats = [];
    const mat = (m) => { m.transparent = true; this.mats.push(m); m.userData.base = m.opacity; return m; };
    const lit = () => mat(hot(color, 1.3));
    const mesh = (geo, m, parent, x = 0, y = 0, z = 0) => { const o = new THREE.Mesh(geo, m); o.position.set(x, y, z); parent.add(o); return o; };

    // Head: armoured helmet with a glowing visor. The group is aimed where they look (+Z).
    this.head = new THREE.Group();
    mesh(new THREE.SphereGeometry(0.13, 28, 20), mat(pbr('gunmetal', 2, 1)), this.head);
    mesh(new THREE.SphereGeometry(0.134, 24, 10, 0, Math.PI * 2, 0, Math.PI * 0.42), mat(pbr('plates', 3, 1)), this.head);   // crown plate
    mesh(new THREE.BoxGeometry(0.19, 0.04, 0.09), lit(), this.head, 0, 0.005, 0.085);                                          // visor
    mesh(new THREE.BoxGeometry(0.2, 0.012, 0.1), mat(pbr('brushed', 1, 0.2)), this.head, 0, 0.035, 0.083);                    // brow
    for (const sx of [-1, 1]) {
      const ear = mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.03, 14), mat(pbr('brushed', 1, 0.3)), this.head, sx * 0.13, 0, 0);
      ear.rotation.z = Math.PI / 2;
      mesh(new THREE.BoxGeometry(0.008, 0.09, 0.012), mat(pbr('gunmetal', 0.2, 0.5)), this.head, sx * 0.14, 0.07, -0.01);    // antenna
    }
    mesh(new THREE.BoxGeometry(0.02, 0.05, 0.14), mat(pbr('gunmetal', 0.3, 0.3)), this.head, 0, 0.125, -0.02);                // crest

    // Torso: plated chest that turns to face its target, with shoulder guards and a backpack.
    this.torso = new THREE.Group();
    mesh(new THREE.CylinderGeometry(0.215, 0.14, 0.42, 22), mat(pbr('plates', 4, 1.2)), this.torso, 0, -0.21, 0);
    mesh(new THREE.TorusGeometry(0.2, 0.024, 8, 28).rotateX(Math.PI / 2), mat(pbr('brushed', 4, 1)), this.torso);
    mesh(new THREE.TorusGeometry(0.205, 0.008, 6, 28).rotateX(Math.PI / 2), lit(), this.torso, 0, -0.1, 0);
    mesh(new THREE.BoxGeometry(0.1, 0.07, 0.03), lit(), this.torso, 0, -0.17, 0.18);                                // chest core
    mesh(new THREE.BoxGeometry(0.16, 0.12, 0.04), mat(pbr('brushed', 0.6, 0.4)), this.torso, 0, -0.17, 0.165);
    mesh(new THREE.BoxGeometry(0.22, 0.24, 0.1), mat(pbr('gunmetal', 0.8, 0.8)), this.torso, 0, -0.17, -0.2);      // backpack
    for (const sx of [-1, 1]) {
      mesh(new THREE.SphereGeometry(0.08, 18, 12), mat(pbr('gunmetal', 1, 1)), this.torso, sx * 0.25, -0.04, 0);
      const guard = mesh(new THREE.SphereGeometry(0.095, 18, 8, 0, Math.PI * 2, 0, Math.PI * 0.5), mat(pbr('plates', 2, 1)), this.torso, sx * 0.25, -0.03, 0);
      guard.rotation.z = -sx * 0.5;
      const jet = mesh(new THREE.CylinderGeometry(0.03, 0.022, 0.07, 12), lit(), this.torso, sx * 0.07, -0.31, -0.2);
      jet.rotation.x = 0;
    }
    mesh(new THREE.SphereGeometry(0.12, 18, 12), mat(pbr('brushed', 2, 1)), this.torso, 0, -0.45, 0);              // waist joint
    // Below the waist: a slim spine inside a hover field. The field is as wide as the real
    // hitbox, so what you see is what you can hit.
    this.spine = mesh(new THREE.CylinderGeometry(0.045, 0.03, 1, 12), mat(pbr('brushed', 1, 3)), this.group);
    this.field = mesh(new THREE.CylinderGeometry(0.19, 0.19, 1, 24, 1, true), energyMat(color, { power: 1.5, opacity: 0.5, hex: 16 }), this.group);
    this.base = mesh(new THREE.TorusGeometry(0.13, 0.02, 8, 24).rotateX(Math.PI / 2), lit(), this.group);
    this.thrust = halo(color, 0.5, 0.8);
    // Hands: armoured gauntlets.
    const gauntlet = () => {
      const g = new THREE.Group();
      mesh(new THREE.BoxGeometry(0.07, 0.07, 0.11), mat(pbr('gunmetal', 0.5, 0.5)), g);
      mesh(new THREE.BoxGeometry(0.074, 0.012, 0.06), lit(), g, 0, 0.03, 0.01);
      this.group.add(g);
      return g;
    };
    this.lh = gauntlet(); this.rh = gauntlet();
    const g = makeGun(); g.sight.visible = false; g.waveGuide.visible = false;
    this.gun = g.group; this.gunGlow = g.glowMat;
    this.group.add(this.gun);
    this.charge = halo(0xffffff, 0.4);
    this.ice = halo(0xbfefff, 0.45, 0.9);
    this.shield = makeShield();
    this.hp = new CanvasSprite(256, 48, 0.4);
    this.group.add(this.head, this.torso, this.thrust, this.charge, this.ice, this.shield, this.hp.sprite);
    this.a = new THREE.Vector3(); this.b = new THREE.Vector3();
  }

  // human = a real person is standing there, visible through passthrough.
  setHuman(human) {
    for (const part of [this.head, this.torso, this.spine, this.field, this.base, this.thrust, this.lh, this.rh]) part.visible = !human;
    this.human = human;
  }

  update(actor, time) {
    const x = actor.head.x, z = actor.head.z;
    this.head.position.copy(actor.head);
    this.head.lookAt(_v.copy(actor.head).add(actor.aim));
    actor.bodySeg(this.a, this.b);
    const top = this.b.y + 0.12, bottom = this.a.y - 0.08;
    this.torso.position.set(x, top, z);
    this.torso.rotation.y = Math.atan2(actor.aim.x, actor.aim.z);
    const waist = top - 0.5, len = Math.max(0.02, waist - bottom);
    this.spine.position.set(x, bottom + len / 2, z); this.spine.scale.y = len;
    this.field.position.copy(this.spine.position); this.field.scale.y = len;
    this.field.material.uniforms.uTime.value = time;
    this.base.position.set(x, bottom, z);
    this.thrust.position.set(x, bottom - 0.05, z);
    this.thrust.scale.setScalar(0.45 + 0.08 * Math.sin(time * 23));
    this.lh.position.copy(actor.lh); this.rh.position.copy(actor.rh);
    this.rh.lookAt(_v.copy(actor.rh).add(actor.aim)); this.lh.quaternion.copy(this.rh.quaternion);
    this.rh.visible = false;   // the launcher replaces the right gauntlet
    this.gun.position.copy(actor.rh);
    this.gun.quaternion.setFromUnitVectors(_v.set(0, 0, -1), actor.aim);
    this.gunGlow.color.setHex(actor.frozen > 0 ? 0xdff6ff : WEAPONS[ORDER[actor.weapon] || 'pulse'].color).multiplyScalar(1.6);
    this.ice.visible = actor.frozen > 0;
    this.ice.position.copy(actor.rh);
    this.charge.visible = !!actor.charging;
    this.charge.position.copy(actor.rh);
    this.charge.scale.setScalar(0.3 + 0.15 * Math.sin(time * 30));
    this.shield.visible = actor.shieldUp;
    this.shield.position.copy(actor.lh);
    this.shield.material.uniforms.uTime.value = time;
    this.hp.sprite.position.copy(actor.head); this.hp.sprite.position.y += 0.36;
    this.hp.draw('hp' + actor.hp, (ctx, w, h) => {
      ctx.fillStyle = 'rgba(0,0,0,0.7)'; ctx.fillRect(0, 8, w, h - 16);
      ctx.fillStyle = actor.hp > 35 ? '#ff4466' : '#ffcc33';
      ctx.fillRect(4, 12, (w - 8) * actor.hp / 100, h - 24);
    });
  }
}
