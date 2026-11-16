// the notice board on the wall by the bar: WANTED bills with each man's own face drawn from life (his body, pictured once), the reward, and what the week does to them (taken, dead, a new bill posted); the town's other paper beside them
import * as THREE from 'three';
import { G } from '../sushi/ctx.js';
import { R } from './room.js';
import { pbr, slab, canvasTex } from './kit.js';

const BILLS = { cole: ['COLE MADDOX', '$500', 'for the ROBBERY of the TUCSON STAGE and the MURDER of its guard', 'Thirty-four years. Dark. A scar at the left brow.'], pike: ['JOHN "JACK" PIKE', '$750', 'for the MURDER of ELI GARRETT and of THOMAS BELL', 'Forty-one years. A gambler. Carries a .41 Colt.'] };

export function buildPosters(scene, room) {
  const g = new THREE.Group(); g.position.set(R.board.x, 1.62, R.board.z); g.rotation.y = R.board.ry; scene.add(g);
  slab(1.9, 1.25, 0.03, pbr('planks', { tile: 0.9, color: 0x6a5846 }), 0, 0, 0, g); for (const s of [-1, 1]) { slab(1.98, 0.06, 0.05, pbr('walnut', { tile: 0.5, color: 0x4a3020 }), 0, s * 0.64, 0.005, g); slab(0.06, 1.3, 0.05, pbr('walnut', { tile: 0.5, color: 0x4a3020 }), s * 0.97, 0, 0.005, g); }
  const faces = {}, bills = {}; let made = false;
  // his face, from his own body: stood in a plain light, looked at once, kept as a brown print
  const portrait = (id) => { const p = G.folk.byId(id); if (!p) return null; const S = 192, rt = new THREE.WebGLRenderTarget(S, S), sc = new THREE.Scene(), cam = new THREE.PerspectiveCamera(22, 1, 0.1, 10), was = p.root.parent, vis = p.root.visible, pos = p.root.position.clone(), ry = p.root.rotation.y;
    sc.background = new THREE.Color(0xb8a888); sc.add(new THREE.HemisphereLight(0xffffff, 0x554433, 2.2)); const dl = new THREE.DirectionalLight(0xffffff, 2.5); dl.position.set(1, 2, 2); sc.add(dl); sc.add(p.root); p.root.visible = true; p.root.position.set(0, 0, 0); p.root.rotation.y = 0.25; p.P.pose = 'stand'; p.P.update(0.016); sc.updateMatrixWorld(true);
    const hb = p.P.bones.find((b) => b.name === 'head'), hp = hb.getWorldPosition(new THREE.Vector3()); cam.position.set(hp.x + 0.25, hp.y + 0.08, hp.z + 1.25); cam.lookAt(hp.x, hp.y + 0.06, hp.z);
    const r = G.renderer, px = new Uint8Array(S * S * 4), tm = r.toneMapping, xe = r.xr.enabled; r.xr.enabled = false; r.toneMapping = THREE.NoToneMapping; r.setRenderTarget(rt); r.render(sc, cam); r.readRenderTargetPixels(rt, 0, 0, S, S, px); r.setRenderTarget(null); r.toneMapping = tm; r.xr.enabled = xe; rt.dispose();
    was.add(p.root); p.root.visible = vis; p.root.position.copy(pos); p.root.rotation.y = ry;
    const c = document.createElement('canvas'); c.width = c.height = S; const x = c.getContext('2d'), im = x.createImageData(S, S); for (let y = 0; y < S; y++) for (let i = 0; i < S; i++) { const s = ((S - 1 - y) * S + i) * 4, d = (y * S + i) * 4, l = Math.pow((px[s] * 0.3 + px[s + 1] * 0.59 + px[s + 2] * 0.11) / 255, 0.8), q = Math.round(l * 5) / 5; im.data[d] = 60 + q * 150; im.data[d + 1] = 44 + q * 140; im.data[d + 2] = 28 + q * 110; im.data[d + 3] = 255; } x.putImageData(im, 0, 0); return c; };
  const draw = (id, stamp) => canvasTex(384, 512, (x, w, h) => { const [name, sum, why, desc] = BILLS[id]; x.fillStyle = '#c9b88e'; x.fillRect(0, 0, w, h); for (let i = 0; i < 900; i++) { x.fillStyle = `rgba(70,50,20,${Math.random() * 0.1})`; x.fillRect(Math.random() * w, Math.random() * h, 1 + Math.random() * 4, 1 + Math.random() * 3); }
    x.fillStyle = '#231608'; x.textAlign = 'center'; x.font = 'bold 76px Georgia'; x.fillText('WANTED', w / 2, 78); x.font = 'bold 20px Georgia'; x.fillText('DEAD OR ALIVE', w / 2, 106); if (faces[id]) { x.drawImage(faces[id], w / 2 - 96, 118, 192, 192); x.lineWidth = 3; x.strokeStyle = '#231608'; x.strokeRect(w / 2 - 96, 118, 192, 192); }
    x.font = 'bold 30px Georgia'; x.fillText(name, w / 2, 348); x.font = 'bold 60px Georgia'; x.fillText(sum, w / 2, 408); x.font = '15px Georgia'; const words = why.split(' '); let line = '', y = 436; for (const wd of words) { if (x.measureText(line + wd).width > w - 50) { x.fillText(line, w / 2, y); y += 18; line = ''; } line += wd + ' '; } x.fillText(line, w / 2, y); x.font = 'italic 13px Georgia'; x.fillText(desc, w / 2, y + 22); x.fillText('A. HALE, Sheriff, Perdition, A.T.', w / 2, h - 10);
    if (stamp) { x.save(); x.translate(w / 2, 230); x.rotate(-0.3); x.strokeStyle = x.fillStyle = 'rgba(140,20,10,.85)'; x.lineWidth = 6; x.font = 'bold 64px Georgia'; x.strokeRect(-150, -46, 300, 84); x.fillText(stamp, 0, 22); x.restore(); } });
  const post = (id, x, y, rz) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(0.42, 0.56), new THREE.MeshStandardMaterial({ map: draw(id), roughness: 0.95 })); m.position.set(x, y, 0.02); m.rotation.z = rz; g.add(m); bills[id] = { m, stamp: '' }; };
  const paper = (lines, x, y, w, h, rz, bg = '#d2c49c') => { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshStandardMaterial({ roughness: 0.95, map: canvasTex(256, Math.round(256 * h / w), (c, cw, ch) => { c.fillStyle = bg; c.fillRect(0, 0, cw, ch); c.fillStyle = '#2a1a0c'; c.textAlign = 'center'; lines.forEach(([t, f], i) => { c.font = f; c.fillText(t, cw / 2, 34 + i * (ch - 40) / lines.length); }); }) })); m.position.set(x, y, 0.018); m.rotation.z = rz; g.add(m); };
  paper([['FARO', 'bold 44px Georgia'], ['NIGHTLY', 'bold 30px Georgia'], ['at the back table', 'italic 18px Georgia'], ['House rules. No markers.', '15px Georgia']], 0.62, 0.3, 0.34, 0.4, 0.05);
  paper([['QUIMBY\'S', 'bold 34px Georgia'], ['CELEBRATED', 'bold 22px Georgia'], ['VITAL TONIC', 'bold 30px Georgia'], ['cures ague, dropsy, melancholy', 'italic 14px Georgia'], ['ONE DOLLAR', 'bold 22px Georgia']], 0.66, -0.26, 0.32, 0.42, -0.07, '#c8b070');
  paper([['NOTICE', 'bold 34px Georgia'], ['All firearms to be', '17px Georgia'], ['checked with the barkeep.', '17px Georgia'], ['By order, A. Hale', 'italic 15px Georgia']], -0.68, 0.34, 0.36, 0.3, -0.04);
  paper([['CROWE CATTLE CO.', 'bold 22px Georgia'], ['buys land and water rights', '15px Georgia'], ['FAIR PRICES PAID', 'bold 18px Georgia']], -0.68, -0.22, 0.38, 0.24, 0.06, '#bfb090');
  return { group: g, bills,
    update() { if (!G.castReady || !G.story) return; if (!made) { made = true; for (const id of ['cole', 'pike']) faces[id] = portrait(id); post('cole', -0.14, 0.02, -0.03); }
      const W = G.story.W, want = { cole: W.facts.has('cole_dead') ? 'DEAD' : W.facts.has('cole_taken') ? 'TAKEN' : '', pike: W.facts.has('pike_dead') ? 'DEAD' : '' };
      if (!bills.pike && W.facts.has('hale_turns')) post('pike', 0.28, -0.05, 0.05);
      for (const id in bills) if (bills[id].stamp !== want[id]) { bills[id].stamp = want[id]; bills[id].m.material.map.dispose(); bills[id].m.material.map = draw(id, want[id]); } } };
}
