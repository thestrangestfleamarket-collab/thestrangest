// the render inspector (on a screen: the I key, or ?inspect): what the picture costs this frame, what the crosshair is on, every number of the look on a slider, and its export: saved for everyone who plays (the owner), copied, or kept as a file; the game takes the saved look at its start
import * as THREE from 'three';
import { Pane } from 'tweakpane';
import { G } from '../sushi/ctx.js';

// the look as built; a saved look holds only what was changed
export const LOOK = { exposure: 1.0, fog: 0.05, fogColor: '#0e0c0a', room: 0.26, wheels: 130, lanterns: 13, stove: 4, moon: 1, moonIn: 1, lampColor: '#ffc896', reflect: 1, shadows: true, soft: 4,
  smoke: 0.085, dust: 0.5, bright: 0.7, sat: 0.5, warm: 0.07, vig: 0.38, grain: 0.018, contrast: 0.3, rough: 0, fov: 68 };
const FILE = '/shared/saloon-look.json';

export function buildInspect(scene, room, look, renderer, camera) {
  const L = { ...LOOK }, base = new Map(), lights = { moon: [], moonIn: look.moon ? [look.moon] : [] };
  scene.traverse((o) => { if (o.isDirectionalLight) lights.moon.push(o); if (o.isLight) base.set(o, o.intensity); });
  const mats = new Set(); scene.traverse((o) => { if (o.isMesh && o.material && o.material.isMeshStandardMaterial && !o.isSkinnedMesh) mats.add(o.material); }); for (const m of mats) base.set(m, m.roughness);
  const apply = () => {
    renderer.toneMappingExposure = L.exposure; scene.fog.density = L.fog; scene.fog.color.set(L.fogColor); room.hemi.intensity = L.room; 
    for (const o of room.lamps) { if (o.lv !== undefined) continue; if (o.wheel) { o.k = L.wheels; o.l.color.set(L.lampColor); o.l.shadow.radius = L.soft; } else if (o === room.fire) o.k = L.stove; else { o.k = L.lanterns; o.l.color.set(L.lampColor); } if (o.on) o.l.intensity = o.k; }
    for (const l of lights.moon) l.intensity = base.get(l) * L.moon; for (const l of lights.moonIn) l.intensity = base.get(l) * L.moonIn;
    renderer.shadowMap.enabled = L.shadows; scene.traverse((o) => { if (o.material && L.shadows !== apply.sh) (Array.isArray(o.material) ? o.material : [o.material]).forEach((m) => { m.needsUpdate = true; }); }); apply.sh = L.shadows;
    for (const s of look.smoke) s.m.material.opacity = L.smoke; look.motes.material.opacity = L.dust;
    for (const k of ['bright', 'sat', 'warm', 'vig', 'grain', 'contrast']) look.grade[k].value = L[k];
    for (const m of mats) m.roughness = Math.min(1, Math.max(0.02, base.get(m) + L.rough));
    if (!renderer.xr.isPresenting && camera.fov !== L.fov) { camera.fov = L.fov; camera.updateProjectionMatrix(); }
  };
  const changed = () => { const o = {}; for (const k in LOOK) if (L[k] !== LOOK[k]) o[k] = L[k]; return o; };
  const take = (j) => { if (!j || typeof j !== 'object') return; for (const k in LOOK) if (k in j && typeof j[k] === typeof LOOK[k]) L[k] = j[k]; apply(); pane && pane.refresh(); };
  // the look saved for everyone, taken at the start
  if (!G.params?.has('nopost')) fetch('/saloon/look').then((r) => (r.ok && r.status !== 204 ? r.json() : null)).then((j) => take(j && j.look)).catch(() => { });

  let pane = null, stat = { calls: 0, tris: 0, textures: 0, geometries: 0, ms: 0, fps: 0, lights: 0, shadowLights: 0, on: '', say: '' }, last = performance.now(), ema = 16;
  const ray = new THREE.Raycaster();
  const open = () => { if (pane) { pane.hidden = !pane.hidden; return; }
    pane = new Pane({ title: 'RENDER INSPECTOR  (I)' }); pane.element.parentElement.style.cssText += ';z-index:20;width:330px;max-height:96vh;overflow:auto;pointer-events:auto';
    const f0 = pane.addFolder({ title: 'THIS FRAME' }); for (const [k, l] of [['fps', 'frames a second'], ['ms', 'ms a frame'], ['calls', 'draw calls'], ['tris', 'triangles'], ['textures', 'textures'], ['geometries', 'geometries'], ['lights', 'lights on'], ['shadowLights', 'casting shadows']]) f0.addBinding(stat, k, { readonly: true, label: l, format: (v) => String(Math.round(v)) });
    f0.addBinding(stat, 'on', { readonly: true, label: 'crosshair on', multiline: true, rows: 3 });
    const add = (f, k, label, o = {}) => f.addBinding(L, k, { label, ...o }).on('change', apply);
    const f1 = pane.addFolder({ title: 'LIGHT' }); add(f1, 'exposure', 'exposure', { min: 0.2, max: 2.5 }); add(f1, 'room', 'fill light', { min: 0, max: 1.5 }); add(f1, 'wheels', 'chandeliers', { min: 0, max: 400 }); add(f1, 'lanterns', 'bar lanterns', { min: 0, max: 60 }); add(f1, 'stove', 'stove', { min: 0, max: 30 }); add(f1, 'lampColor', 'lamp colour'); add(f1, 'moonIn', 'moon through windows', { min: 0, max: 4 }); add(f1, 'moon', 'moon outside', { min: 0, max: 4 }); add(f1, 'shadows', 'shadows'); add(f1, 'soft', 'shadow softness', { min: 0, max: 12 });
    const f2 = pane.addFolder({ title: 'AIR' }); add(f2, 'fog', 'haze', { min: 0, max: 0.2 }); add(f2, 'fogColor', 'haze colour'); add(f2, 'smoke', 'smoke', { min: 0, max: 0.5 }); add(f2, 'dust', 'dust', { min: 0, max: 1 });
    const f3 = pane.addFolder({ title: 'SURFACES' }); add(f3, 'rough', 'duller / shinier', { min: -0.6, max: 0.6 }); add(f3, 'reflect', 'reflections', { min: 0, max: 3 });
    const f4 = pane.addFolder({ title: 'PICTURE (screen only)' }); add(f4, 'bright', 'brightness', { min: 0.3, max: 2.5 }); add(f4, 'sat', 'colour', { min: 0, max: 1.4 }); add(f4, 'warm', 'warmth', { min: -0.5, max: 0.8 }); add(f4, 'contrast', 'contrast', { min: 0, max: 1 }); add(f4, 'vig', 'dark edges', { min: 0, max: 0.9 }); add(f4, 'grain', 'grain', { min: 0, max: 0.1 }); add(f4, 'fov', 'field of view', { min: 40, max: 100 });
    const f5 = pane.addFolder({ title: 'EXPORT TO GAME' }); f5.addBinding(stat, 'say', { readonly: true, label: '' });
    f5.addButton({ title: 'SAVE FOR EVERYONE (owner)' }).on('click', () => { stat.say = 'saving...'; fetch(FILE, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ v: 1, at: Date.now(), look: changed() }) }).then((r) => r.json().then((j) => { stat.say = r.ok && j.ok ? 'saved: everyone gets this look' : 'not saved: ' + (j.why || r.status); })).catch(() => { stat.say = 'not saved: no answer from the site'; }); });
    f5.addButton({ title: 'COPY AS TEXT' }).on('click', () => { const t = JSON.stringify(changed(), null, 1); navigator.clipboard?.writeText(t).then(() => { stat.say = 'copied'; }, () => { stat.say = t; }); });
    f5.addButton({ title: 'SAVE AS A FILE' }).on('click', () => { const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([JSON.stringify({ v: 1, at: Date.now(), look: changed() }, null, 1)], { type: 'application/json' })); a.download = 'saloon-look.json'; a.click(); stat.say = 'saved as saloon-look.json'; });
    f5.addButton({ title: 'OPEN A FILE' }).on('click', () => { const i = document.createElement('input'); i.type = 'file'; i.accept = '.json'; i.onchange = () => i.files[0] && i.files[0].text().then((t) => { try { const j = JSON.parse(t); take(j.look || j); stat.say = 'opened'; } catch (e) { stat.say = 'not a look file'; } }); i.click(); });
    f5.addButton({ title: 'BACK TO THE GAME\'S OWN' }).on('click', () => { Object.assign(L, LOOK); apply(); pane.refresh(); stat.say = 'as built (not saved yet)'; });
    f5.addButton({ title: 'TAKE THE ROOM\'S REFLECTIONS AGAIN' }).on('click', () => look.reflect());
    document.exitPointerLock?.(); };
  return { L, LOOK, apply, take, changed, open, stat, get shown() { return !!pane && !pane.hidden; },
    update() { const now = performance.now(); ema += (now - last - ema) * 0.1; last = now; if (!pane || pane.hidden) return; const i = renderer.info; stat.calls = i.render.calls; stat.tris = i.render.triangles; stat.textures = i.memory.textures; stat.geometries = i.memory.geometries; stat.ms = ema; stat.fps = 1000 / Math.max(1, ema);
      if ((G.t * 4 | 0) !== update_t) { update_t = G.t * 4 | 0; let n = 0, sh = 0; scene.traverse((o) => { if (o.isLight && o.intensity > 0 && o.visible) { n++; if (o.castShadow) sh++; } }); stat.lights = n; stat.shadowLights = sh;
        ray.setFromCamera({ x: 0, y: 0 }, camera); const h = ray.intersectObjects(scene.children, true).find((x) => { if (!x.object.isMesh || x.object.material.opacity <= 0.05 || x.object.material.blending !== THREE.NormalBlending) return false; for (let q = x.object; q; q = q.parent) if (!q.visible) return false; return true; }); if (h) { const o = h.object, m = o.material, g = o.geometry, t = m.map && m.map.image; stat.on = `${o.name || o.parent?.name || o.type}  ${(g.index ? g.index.count : g.attributes.position.count) / 3 | 0} triangles, ${h.distance.toFixed(1)} m\n${m.type.replace('Mesh', '').replace('Material', '')} #${m.color ? m.color.getHexString() : '-'} rough ${m.roughness?.toFixed(2) ?? '-'} metal ${m.metalness?.toFixed(2) ?? '-'}\n${t ? 'picture ' + t.width + 'x' + t.height : 'no picture'}${m.normalMap ? ', relief' : ''}${o.castShadow ? ', casts' : ''}${o.receiveShadow ? ', takes shadow' : ''}`; } else stat.on = 'nothing'; } } };
}
let update_t = -1;
