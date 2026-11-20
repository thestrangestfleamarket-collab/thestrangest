// the octopus's busking across Market St and what goes with THE MARKET's own people at the corner: his piece, recorded from the market's own guitar (data/sushi/snd/busker.mp3, tools/ramen-folk.cjs), heard from where he stands while he plays; a tin on the counter's end to send him a dollar (he says Gracias); THE BIG CAT by the westmost telephone pole across the street, as in the market
import * as THREE from 'three';
import { G, mat, cyl, V3 } from './ctx.js';
import * as T from './tex.js';
import { hasFolk, makeFolk } from './folk.js';
import { CAT } from './plan.js';

// every word of this file a player hears or reads, and what the talking mind is told
export const TEXT = { tin: 'FOR THE OCTOPUS', tip: 'tip the octopus', thanks: { prompt: 'The cook at the ramen cart across the street just sent a dollar over for your playing. Thank them in a word or two of Spanish.', lines: ['Gracias.', 'Gracias, amigo.', 'Muchas gracias.'] }, tipped: (n) => `The cook has tipped your playing ${n} time${n === 1 ? '' : 's'} tonight.` };
export const TIP = 100;   // a dollar, in cents

export function buildBusk(scene) {
  const B = { tips: 0, playing: false, level: 0 }; G.busk = B;
  const oct = () => G.block && G.block.by.octopus, at = new THREE.Vector3(), where = () => { const h = oct(); return h ? at.copy(h.p.root.position).setY(1.4) : at.set(0, 1.4, -27); };
  // ---- his piece, from where he is
  let snd = null, loading = false;
  const start = () => { const A = G.audio; if (snd || loading || !A || !A.ctx || !A.spatial) return; loading = true;
    fetch('/sushi-assets/snd/busker.mp3').then((r) => r.arrayBuffer()).then((b) => A.ctx.decodeAudioData(b)).then((buf) => { const e = A.spatial('car', where), s = A.ctx.createBufferSource(); s.buffer = buf; s.loop = true; e.input.gain.value = 0; s.connect(e.input); s.start(); snd = { e, s }; }).catch((e) => console.warn('the busker\'s piece did not come', e)); };
  // ---- the tin on the counter's end: press it and a dollar of the night's takings goes over the road
  if (!G.guest && G.cart && hasFolk('octobusk')) { const y = G.cart.seatSpots[0] ? G.cart.seatSpots[0].y : 0.98, z = G.cart.seatSpots[0] ? G.cart.seatSpots[0].z + 0.02 : -0.62, x = 1.78;
    const tin = cyl(0.045, 0.045, 0.1, mat({ color: 0xb8b0a0 }), x, y + 0.05, z, scene, 14); tin.userData.keep = true;
    const lab = new THREE.Mesh(new THREE.PlaneGeometry(0.12, 0.05), new THREE.MeshBasicMaterial({ map: T.canvasTex(256, 96, (g, w, h) => { g.fillStyle = '#e8dcc0'; g.fillRect(0, 0, w, h); g.fillStyle = '#5a2a6a'; g.font = `bold 34px ${T.MONO || 'monospace'}`; g.textAlign = 'center'; g.fillText('FOR THE', w / 2, 40); g.fillText('OCTOPUS', w / 2, 80); }) })); lab.position.set(x, y + 0.05, z + 0.0462); scene.add(lab);
    const btn = { getPos: () => new V3(x, y + 0.1, z), r: 0.08, name: TEXT.tip, press: () => { const h = oct(); if (!h || h.hidden || !G.game || G.game.money + G.game.extra < TIP) { G.audio.play('click'); return; } G.game.extra -= TIP; B.tips++; G.audio.play('coin1'); h.p.gesture?.('nod'); G.talk?.event(h.spk, 'told', { as: 'busk', prompt: TEXT.thanks.prompt, lines: TEXT.thanks.lines, facts: TEXT.tipped(B.tips) }); } };
    tin.userData.button = btn; lab.userData.button = btn; G.buttons.push(btn); B.tin = btn; }
  // ---- THE BIG CAT, peeking round his pole
  if (hasFolk('bigcat')) { const c = makeFolk('bigcat', 3); c.root.position.set(CAT.x, 0, CAT.z); c.root.rotation.y = Math.atan2(-CAT.x, -CAT.z); c.root.traverse((o) => { o.userData.nopick = true; o.userData.keep = true; }); scene.add(c.root); c.update(0.1); B.cat = c; }
  B.update = (dt) => { const h = oct(); B.playing = !!(h && !h.hidden && !h.taken && h.p.root.visible && h.p.pose === 'play'); if (B.playing && !snd) start();
    if (snd) { B.level += ((B.playing ? 1.5 : 0) - B.level) * Math.min(1, dt * 1.5); snd.e.input.gain.value = B.level; } };
  return B;
}
