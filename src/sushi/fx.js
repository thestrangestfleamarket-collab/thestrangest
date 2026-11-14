// steam, drops and the slip of paper that says how a bowl went
import * as THREE from 'three';
import { G, V3, mat } from './ctx.js';
import * as T from './tex.js';

export function buildFx(scene) {
  const root = new THREE.Group(); scene.add(root);
  const smoke = T.smokeTex();
  const steam = [], NS = 70;
  for (let i = 0; i < NS; i++) {
    const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: smoke, color: 0xffe8d0, transparent: true, opacity: 0, depthWrite: false }));
    s.visible = false; s.userData = { life: 0, nopick: true }; root.add(s); steam.push(s);
  }
  const drops = [], ND = 48, dg = new THREE.SphereGeometry(0.006, 6, 5);
  for (let i = 0; i < ND; i++) { const d = new THREE.Mesh(dg, mat({ roughness: 0.1 })); d.visible = false; d.userData = { v: new V3(), life: 0, nopick: true }; root.add(d); drops.push(d); }
  const pops = [], splats = [];
  let si = 0, di = 0;
  const fx = {
    steam(p, k = 1) {
      const s = steam[si++ % NS]; s.visible = true; s.position.copy(p); s.userData.life = 1; s.userData.k = k; s.userData.vx = (Math.random() - 0.5) * 0.06; s.userData.r = Math.random() * 6;
      s.scale.setScalar(0.08 * k + 0.04);
    },
    drops(p, color, n = 8) {
      for (let i = 0; i < n; i++) { const d = drops[di++ % ND]; d.visible = true; d.position.copy(p); d.material.color.set(color); d.userData.v.set((Math.random() - 0.5) * 0.5, Math.random() * 0.4, (Math.random() - 0.5) * 0.5); d.userData.life = 0.6; }
    },
    popup(pos, lines, good) {
      const t = T.canvasTex(512, 320, (g, w, h) => {
        g.fillStyle = 'rgba(250,246,232,0.96)'; g.fillRect(0, 0, w, h); g.strokeStyle = good ? '#1c7a3a' : '#a01c1c'; g.lineWidth = 10; g.strokeRect(5, 5, w - 10, h - 10);
        g.textAlign = 'center'; g.fillStyle = good ? '#1c7a3a' : '#a01c1c'; g.font = `bold 54px ${T.JP}`; g.fillText(lines[0], w / 2, 66, w - 30);
        g.fillStyle = '#1b1b1b'; g.font = `bold 34px ${T.JP}`; lines.slice(1, 7).forEach((l, i) => g.fillText(l, w / 2, 120 + i * 40, w - 30));
      });
      const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: t, transparent: true, depthTest: false })); s.renderOrder = 50; s.userData.nopick = true;
      s.scale.set(0.36, 0.225, 1); s.position.copy(pos); root.add(s); pops.push({ s, life: 6.5 });
    },
    splat(p, color, r = 0.08, yolk) { // what a broken egg or a spilt bowl leaves where it hit
      const m = new THREE.Mesh(new THREE.CircleGeometry(r, 12).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ color: new THREE.Color(color).multiplyScalar(0.45), transparent: true, opacity: 0.85, depthWrite: false })); m.position.set(p.x, Math.max(0.006, p.y + 0.004), p.z); m.scale.set(0.7 + Math.random() * 0.8, 1, 0.7 + Math.random() * 0.8); m.rotation.y = Math.random() * 6; m.userData.nopick = true; root.add(m); splats.push({ m, life: 50 });
      if (yolk) { const y = new THREE.Mesh(new THREE.SphereGeometry(r * 0.38, 8, 6), new THREE.MeshBasicMaterial({ color: new THREE.Color(yolk).multiplyScalar(0.6) })); y.scale.y = 0.35; y.position.set(p.x + 0.01, m.position.y + 0.004, p.z); y.userData.nopick = true; root.add(y); splats.push({ m: y, life: 50 }); }
    },
    update(dt) {
      for (let i = splats.length - 1; i >= 0; i--) { const s = splats[i]; s.life -= dt; if (s.life <= 0) { s.m.removeFromParent(); splats.splice(i, 1); } }
      for (const s of steam) if (s.visible) {
        const u = s.userData; u.life -= dt * 0.55; if (u.life <= 0) { s.visible = false; continue; }
        s.position.y += dt * 0.22; s.position.x += u.vx * dt; s.scale.addScalar(dt * 0.11); s.material.rotation = u.r + u.life;
        s.material.opacity = Math.sin(u.life * Math.PI) * 0.13 * Math.min(1, u.k);
      }
      for (const d of drops) if (d.visible) { const u = d.userData; u.life -= dt; if (u.life <= 0) { d.visible = false; continue; } u.v.y -= 9.8 * dt; d.position.addScaledVector(u.v, dt); }
      for (let i = pops.length - 1; i >= 0; i--) { const p = pops[i]; p.life -= dt; p.s.position.y += dt * 0.012; p.s.material.opacity = Math.min(1, p.life); if (p.life <= 0) { p.s.removeFromParent(); p.s.material.map.dispose(); p.s.material.dispose(); pops.splice(i, 1); } }
    },
  };
  G.fx = fx; return fx;
}
