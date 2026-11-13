// Damage the shots leave on the room: burn holes, scorch craters, slash burns, plasma
// cracks, frost patches and lingering fires. Marks are flat decals laid on the arena's
// floor, walls and ceiling. Dark soot uses normal blending so it shows up on a bright
// camera feed; the hot/glowing layer on top is additive and cools off over a few seconds.
import * as THREE from 'three';

const MAX_MARKS = 70;
const Z = new THREE.Vector3(0, 0, 1);
const _m = new THREE.Matrix4(), _x = new THREE.Vector3(), _y = new THREE.Vector3(), _p = new THREE.Vector3();
const PLANE = new THREE.PlaneGeometry(1, 1);

function tex(w, h, draw) {
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  draw(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace;
  return t;
}
const rnd = (a, b) => a + Math.random() * (b - a);

function radial(ctx, s, stops) {
  const g = ctx.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2);
  for (const [o, c] of stops) g.addColorStop(o, c);
  ctx.fillStyle = g; ctx.fillRect(0, 0, s, s);
}

const TEX = {
  // Irregular soot stain.
  scorch: tex(256, 256, (ctx, s) => {
    radial(ctx, s, [[0, 'rgba(8,6,5,0.95)'], [0.35, 'rgba(14,10,8,0.8)'], [0.7, 'rgba(20,14,10,0.3)'], [1, 'rgba(20,14,10,0)']]);
    for (let i = 0; i < 70; i++) {
      const a = rnd(0, Math.PI * 2), r = rnd(0.05, 0.4) * s, rad = rnd(3, 10);
      ctx.fillStyle = `rgba(6,4,3,${rnd(0.05, 0.16)})`;
      ctx.beginPath(); ctx.arc(s / 2 + Math.cos(a) * r, s / 2 + Math.sin(a) * r, rad, 0, 7); ctx.fill();
    }
    ctx.strokeStyle = 'rgba(8,6,5,0.35)';
    for (let i = 0; i < 26; i++) {       // soot streaks blown outward
      const a = rnd(0, Math.PI * 2), r0 = rnd(0.15, 0.3) * s, r1 = rnd(0.34, 0.5) * s;
      ctx.lineWidth = rnd(1, 5);
      ctx.beginPath(); ctx.moveTo(s / 2 + Math.cos(a) * r0, s / 2 + Math.sin(a) * r0);
      ctx.lineTo(s / 2 + Math.cos(a) * r1, s / 2 + Math.sin(a) * r1); ctx.stroke();
    }
  }),
  // Burn hole: black pit, charred lip.
  hole: tex(128, 128, (ctx, s) => {
    radial(ctx, s, [[0, 'rgba(0,0,0,1)'], [0.3, 'rgba(0,0,0,1)'], [0.42, 'rgba(30,18,10,0.95)'], [0.6, 'rgba(18,12,8,0.5)'], [1, 'rgba(18,12,8,0)']]);
    for (let i = 0; i < 14; i++) {
      const a = rnd(0, Math.PI * 2), r = rnd(0.3, 0.4) * s;
      ctx.fillStyle = 'rgba(0,0,0,0.8)';
      ctx.beginPath(); ctx.arc(s / 2 + Math.cos(a) * r, s / 2 + Math.sin(a) * r, rnd(3, 8), 0, 7); ctx.fill();
    }
  }),
  // Glowing rim of a fresh hole (white, tinted by material colour).
  rim: tex(128, 128, (ctx, s) => {
    radial(ctx, s, [[0, 'rgba(255,255,255,0)'], [0.26, 'rgba(255,255,255,0)'], [0.36, 'rgba(255,255,255,1)'], [0.55, 'rgba(255,255,255,0.25)'], [1, 'rgba(255,255,255,0)']]);
  }),
  heat: tex(128, 128, (ctx, s) => {
    radial(ctx, s, [[0, 'rgba(255,255,255,1)'], [0.3, 'rgba(255,255,255,0.6)'], [1, 'rgba(255,255,255,0)']]);
  }),
  // Jagged cracks radiating from an impact.
  crack: tex(256, 256, (ctx, s) => {
    ctx.strokeStyle = '#fff'; ctx.lineCap = 'round';
    const branch = (x, y, a, len, w) => {
      ctx.lineWidth = w; ctx.beginPath(); ctx.moveTo(x, y);
      const steps = 5;
      for (let i = 0; i < steps; i++) { a += rnd(-0.5, 0.5); x += Math.cos(a) * len / steps; y += Math.sin(a) * len / steps; ctx.lineTo(x, y);
        if (w > 1.5 && Math.random() < 0.35) { ctx.stroke(); branch(x, y, a + rnd(-1, 1), len * 0.45, w * 0.55); ctx.lineWidth = w; ctx.beginPath(); ctx.moveTo(x, y); } }
      ctx.stroke();
    };
    for (let i = 0; i < 9; i++) branch(s / 2, s / 2, (i / 9) * Math.PI * 2 + rnd(-0.3, 0.3), rnd(0.25, 0.46) * s, rnd(2.5, 4.5));
    ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(s / 2, s / 2, 7, 0, 7); ctx.fill();
  }),
  // Ice: pale bloom with crystal needles.
  frost: tex(256, 256, (ctx, s) => {
    radial(ctx, s, [[0, 'rgba(235,248,255,0.85)'], [0.4, 'rgba(200,232,255,0.6)'], [0.8, 'rgba(190,225,255,0.2)'], [1, 'rgba(190,225,255,0)']]);
    ctx.lineCap = 'round';
    const needle = (x, y, a, len, w, depth) => {
      const x2 = x + Math.cos(a) * len, y2 = y + Math.sin(a) * len;
      ctx.strokeStyle = `rgba(255,255,255,${depth ? 0.6 : 0.9})`; ctx.lineWidth = w;
      ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x2, y2); ctx.stroke();
      if (depth < 2) for (let k = 1; k <= 3; k++) for (const sgn of [-1, 1]) {
        needle(x + (x2 - x) * k / 4, y + (y2 - y) * k / 4, a + sgn * 1.05, len * 0.3, w * 0.6, depth + 1);
      }
    };
    for (let i = 0; i < 12; i++) needle(s / 2, s / 2, (i / 12) * Math.PI * 2 + rnd(-0.1, 0.1), rnd(0.3, 0.47) * s, 2.5, 0);
  }),
  // Long burn left by the Wave bar.
  slash: tex(256, 64, (ctx, w, h) => {
    const g = ctx.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, 'rgba(10,7,5,0)'); g.addColorStop(0.5, 'rgba(6,4,3,0.95)'); g.addColorStop(1, 'rgba(10,7,5,0)');
    ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
    ctx.globalCompositeOperation = 'destination-in';
    const e = ctx.createLinearGradient(0, 0, w, 0);
    e.addColorStop(0, 'rgba(0,0,0,0)'); e.addColorStop(0.12, 'rgba(0,0,0,1)'); e.addColorStop(0.88, 'rgba(0,0,0,1)'); e.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = e; ctx.fillRect(0, 0, w, h);
  }),
  slashHeat: tex(256, 64, (ctx, w, h) => {
    const g = ctx.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0.3, 'rgba(255,255,255,0)'); g.addColorStop(0.5, 'rgba(255,255,255,1)'); g.addColorStop(0.7, 'rgba(255,255,255,0)');
    ctx.fillStyle = g; ctx.fillRect(w * 0.08, 0, w * 0.84, h);
  }),
};

function layer(map, color, additive, opacity = 1) {
  return new THREE.MeshBasicMaterial({
    map, color, transparent: true, opacity, depthWrite: false, toneMapped: !additive ? false : true,
    blending: additive ? THREE.AdditiveBlending : THREE.NormalBlending,
    polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2,
  });
}

export class Scars {
  constructor(root, fx) {
    this.root = root; this.fx = fx;
    this.marks = []; this.fires = []; this.frosts = [];
    this.n = 0;
  }

  // One decal layer. `hot` layers fade out over `cool` seconds; soot stays for `life`.
  add(map, pos, normal, w, h, { color = 0xffffff, additive = false, life = 40, cool = 0, opacity = 1, axis = null, smoke = 0 } = {}) {
    const mesh = new THREE.Mesh(PLANE, layer(map, color, additive, opacity));
    if (axis) {
      // Lay the long side along `axis`, flattened onto the surface.
      _x.copy(axis).addScaledVector(normal, -axis.dot(normal));
      if (_x.lengthSq() < 1e-4) _x.set(1, 0, 0).addScaledVector(normal, -normal.x);
      _x.normalize(); _y.crossVectors(normal, _x);
      mesh.quaternion.setFromRotationMatrix(_m.makeBasis(_x, _y, normal));
    } else {
      mesh.quaternion.setFromUnitVectors(Z, normal);
      mesh.rotateZ(Math.random() * Math.PI * 2);
    }
    this.n = (this.n + 1) % 400;
    mesh.position.copy(pos).addScaledVector(normal, 0.004 + this.n * 0.00002);
    mesh.scale.set(w, h, 1);
    mesh.renderOrder = additive ? 2 : 1;
    this.root.add(mesh);
    this.marks.push({ mesh, age: 0, life: cool || life, cool: !!cool, base: opacity, smoke, pos: mesh.position });
    if (this.marks.length > MAX_MARKS) this.drop(0);
    return mesh;
  }

  drop(i) {
    const d = this.marks[i];
    this.root.remove(d.mesh); d.mesh.material.dispose();
    this.marks.splice(i, 1);
  }

  hole(pos, normal, color = 0xff7a2a, size = 0.14) {
    this.add(TEX.scorch, pos, normal, size * 2.4, size * 2.4, { opacity: 0.75 });
    this.add(TEX.hole, pos, normal, size, size, { smoke: 2.2 });
    this.add(TEX.rim, pos, normal, size * 1.15, size * 1.15, { color, additive: true, cool: 3.5 });
  }

  crack(pos, normal, color, size = 0.55) {
    this.add(TEX.crack, pos, normal, size, size, { color: 0x050506, opacity: 0.85 });
    this.add(TEX.crack, pos, normal, size, size, { color, additive: true, cool: 2.5 });
    this.add(TEX.heat, pos, normal, size * 0.7, size * 0.7, { color, additive: true, cool: 0.8, opacity: 0.8 });
  }

  slash(pos, normal, axis, length, color) {
    this.add(TEX.slash, pos, normal, length, 0.22, { axis, opacity: 0.9, smoke: 1.5 });
    this.add(TEX.slashHeat, pos, normal, length, 0.16, { axis, color, additive: true, cool: 3 });
  }

  scorch(pos, normal, size, color = 0xff6a1a) {
    this.add(TEX.scorch, pos, normal, size, size, { smoke: 3 });
    this.add(TEX.heat, pos, normal, size * 0.75, size * 0.75, { color, additive: true, cool: 5, opacity: 0.9 });
  }

  frost(pos, normal, size) {
    this.add(TEX.frost, pos, normal, size, size, { life: 22, opacity: 0.9 });
    this.add(TEX.frost, pos, normal, size * 0.9, size * 0.9, { color: 0x9fdcff, additive: true, cool: 6, opacity: 0.5 });
    this.frosts.push({ pos: pos.clone().addScaledVector(normal, 0.05), r: size * 0.4, t: 5 });
  }

  // Lingering flames on the floor.
  fire(pos, radius, life) {
    this.fires.push({ pos: new THREE.Vector3(pos.x, 0.02, pos.z), r: radius, t: life, max: life });
  }

  clearFires() { this.fires.length = 0; this.frosts.length = 0; }

  clear() {
    while (this.marks.length) this.drop(0);
    this.clearFires();
  }

  update(dt) {
    const { sparks, smoke } = this.fx;
    for (let i = this.marks.length - 1; i >= 0; i--) {
      const d = this.marks[i];
      d.age += dt;
      if (d.age >= d.life) { this.drop(i); continue; }
      const k = d.age / d.life;
      // Glow cools quickly; soot holds, then fades over its last fifth.
      d.mesh.material.opacity = d.base * (d.cool ? (1 - k) ** 2 : Math.min(1, (1 - k) * 5));
      if (d.smoke > d.age && Math.random() < 0.12) {
        smoke.emit(d.pos, rnd(-0.05, 0.05), rnd(0.15, 0.3), rnd(-0.05, 0.05), { color: 0x30303a, size: 0.05, endSize: 0.22, life: 1.4, alpha: 0.35 });
      }
    }
    for (let i = this.fires.length - 1; i >= 0; i--) {
      const f = this.fires[i];
      f.t -= dt;
      if (f.t <= 0) { this.fires.splice(i, 1); continue; }
      const strength = Math.min(1, f.t / 1.2);     // dies down at the end
      for (let n = 0; n < 7; n++) {
        if (Math.random() > strength) continue;
        const a = rnd(0, Math.PI * 2), r = Math.sqrt(Math.random()) * f.r;
        _p.set(f.pos.x + Math.cos(a) * r, 0.03, f.pos.z + Math.sin(a) * r);
        const edge = r / f.r;
        sparks.emit(_p, rnd(-0.1, 0.1), rnd(0.7, 1.5) * (1.2 - edge * 0.6), rnd(-0.1, 0.1),
          { color: Math.random() < 0.4 ? 0xffe08a : Math.random() < 0.6 ? 0xff8a1e : 0xff3a0a, size: rnd(0.14, 0.28), endSize: 0.03, life: rnd(0.45, 0.9), drag: 0.6 });
        // An opaque flame body so fire still reads against a bright room.
        if (n < 3) smoke.emit(_p, 0, rnd(0.7, 1.2), 0, { color: n ? 0xff7a1a : 0xffc24a, size: 0.2, endSize: 0.04, life: 0.5, alpha: 0.7 });
      }
      if (Math.random() < 0.12) {
        _p.set(f.pos.x + rnd(-f.r, f.r) * 0.5, 0.5, f.pos.z + rnd(-f.r, f.r) * 0.5);
        smoke.emit(_p, 0, 0.5, 0, { color: 0x24242c, size: 0.15, endSize: 0.5, life: 1.8, alpha: 0.3 });
      }
      if (Math.random() < 0.06) sparks.emit(f.pos, rnd(-0.4, 0.4), rnd(1.5, 2.5), rnd(-0.4, 0.4), { color: 0xffc060, size: 0.03, life: 1.2, gravity: -1.5 });
      if (Math.random() < 0.25) this.fx.light(_p.set(f.pos.x, 0.4, f.pos.z), 0xff7a2a, 5 * strength * rnd(0.6, 1), 0.2);
    }
    for (let i = this.frosts.length - 1; i >= 0; i--) {
      const f = this.frosts[i];
      f.t -= dt;
      if (f.t <= 0) { this.frosts.splice(i, 1); continue; }
      if (Math.random() < 0.35) {       // cold mist rolling off the ice
        _p.set(f.pos.x + rnd(-f.r, f.r), f.pos.y + rnd(0, 0.1), f.pos.z + rnd(-f.r, f.r));
        smoke.emit(_p, rnd(-0.08, 0.08), rnd(-0.02, 0.1), rnd(-0.08, 0.08), { color: 0xd8f0ff, size: 0.1, endSize: 0.4, life: 1.6, alpha: 0.22 });
      }
      if (Math.random() < 0.2) sparks.emit(_p, 0, 0.05, 0, { color: 0xcfefff, size: 0.03, life: 0.5 });
    }
  }
}
