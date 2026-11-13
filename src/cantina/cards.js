// Cards: textures, meshes, ownership state, hand fans, and throw physics.
import * as THREE from 'three';
import { CARD, TABLES, ROOM, DECK_SIZE, deckPos, flatQuat, tableY, onFelt, inLoft } from './layout.js';
import { mSide, pinchLocal } from './hands.js';

const SUITS = ['♠', '♥', '♦', '♣'];
const RANKS = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
const CW = 256, CH = 358;
const PIPS = {
  2: [[.5, .2], [.5, .8]], 3: [[.5, .2], [.5, .5], [.5, .8]],
  4: [[.3, .2], [.7, .2], [.3, .8], [.7, .8]], 5: [[.3, .2], [.7, .2], [.5, .5], [.3, .8], [.7, .8]],
  6: [[.3, .2], [.7, .2], [.3, .5], [.7, .5], [.3, .8], [.7, .8]],
  7: [[.3, .2], [.7, .2], [.5, .35], [.3, .5], [.7, .5], [.3, .8], [.7, .8]],
  8: [[.3, .2], [.7, .2], [.5, .35], [.3, .5], [.7, .5], [.5, .65], [.3, .8], [.7, .8]],
  9: [[.3, .2], [.7, .2], [.3, .4], [.7, .4], [.5, .5], [.3, .6], [.7, .6], [.3, .8], [.7, .8]],
  10: [[.3, .2], [.7, .2], [.5, .3], [.3, .4], [.7, .4], [.3, .6], [.7, .6], [.5, .7], [.3, .8], [.7, .8]],
};

function drawFace(ctx, x, y, rank, suit) {
  const red = suit === 1 || suit === 2;
  const ink = red ? '#c8102e' : '#16161a';
  ctx.save();
  ctx.translate(x, y);
  ctx.fillStyle = '#fbf8f0';
  ctx.fillRect(0, 0, CW, CH);
  ctx.fillStyle = ink;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  const corner = () => {
    ctx.font = `bold ${RANKS[rank] === '10' ? 40 : 46}px Georgia, serif`;
    ctx.fillText(RANKS[rank], 32, 40);
    ctx.font = '38px serif';
    ctx.fillText(SUITS[suit], 32, 82);
  };
  corner();
  ctx.save(); ctx.translate(CW, CH); ctx.rotate(Math.PI); corner(); ctx.restore();
  const X0 = 40, X1 = CW - 40, Y0 = 40, Y1 = CH - 40;
  if (rank === 0) {
    ctx.font = '170px serif';
    ctx.fillText(SUITS[suit], CW / 2, CH / 2 + 6);
  } else if (rank >= 10) {
    ctx.strokeStyle = ink; ctx.lineWidth = 3;
    ctx.strokeRect(62, 54, CW - 124, CH - 108);
    ctx.fillStyle = red ? 'rgba(200,16,46,.09)' : 'rgba(20,20,40,.08)';
    ctx.fillRect(62, 54, CW - 124, CH - 108);
    ctx.fillStyle = ink;
    ctx.font = 'bold 120px Georgia, serif';
    ctx.fillText(RANKS[rank], CW / 2, CH / 2 - 24);
    ctx.font = '74px serif';
    ctx.fillText(SUITS[suit], CW / 2, CH / 2 + 70);
  } else {
    ctx.font = '62px serif';
    for (const [u, v] of PIPS[rank + 1]) {
      ctx.save();
      ctx.translate(X0 + (X1 - X0) * u, Y0 + (Y1 - Y0) * v);
      if (v > 0.5) ctx.rotate(Math.PI);
      ctx.fillText(SUITS[suit], 0, 4);
      ctx.restore();
    }
  }
  ctx.restore();
}

function makeTextures(maxAniso) {
  const atlas = document.createElement('canvas');
  atlas.width = CW * 13; atlas.height = CH * 4;
  const ctx = atlas.getContext('2d');
  for (let s = 0; s < 4; s++) for (let r = 0; r < 13; r++) drawFace(ctx, r * CW, s * CH, r, s);
  const face = new THREE.CanvasTexture(atlas);

  const bc = document.createElement('canvas');
  bc.width = CW; bc.height = CH;
  const b = bc.getContext('2d');
  b.fillStyle = '#fbf8f0'; b.fillRect(0, 0, CW, CH);
  b.fillStyle = '#7a1420'; b.fillRect(16, 16, CW - 32, CH - 32);
  b.save(); b.beginPath(); b.rect(16, 16, CW - 32, CH - 32); b.clip();
  b.strokeStyle = '#d9a441'; b.lineWidth = 2;
  for (let i = -CH; i < CW + CH; i += 22) {
    b.beginPath(); b.moveTo(i, 0); b.lineTo(i + CH, CH); b.stroke();
    b.beginPath(); b.moveTo(i, CH); b.lineTo(i + CH, 0); b.stroke();
  }
  b.restore();
  b.strokeStyle = '#d9a441'; b.lineWidth = 5; b.strokeRect(26, 26, CW - 52, CH - 52);
  b.fillStyle = '#7a1420'; b.beginPath(); b.ellipse(CW / 2, CH / 2, 52, 66, 0, 0, Math.PI * 2); b.fill(); b.stroke();
  b.fillStyle = '#d9a441'; b.font = '64px serif'; b.textAlign = 'center'; b.textBaseline = 'middle';
  b.fillText('♠', CW / 2, CH / 2 + 4);
  const back = new THREE.CanvasTexture(bc);
  for (const t of [face, back]) { t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = maxAniso; }
  return { face, back };
}

function roundedRect(w, h, r) {
  const s = new THREE.Shape(), x = -w / 2, y = -h / 2;
  s.moveTo(x + r, y);
  s.lineTo(x + w - r, y); s.absarc(x + w - r, y + r, r, -Math.PI / 2, 0);
  s.lineTo(x + w, y + h - r); s.absarc(x + w - r, y + h - r, r, 0, Math.PI / 2);
  s.lineTo(x + r, y + h); s.absarc(x + r, y + h - r, r, Math.PI / 2, Math.PI);
  s.lineTo(x, y + r); s.absarc(x + r, y + r, r, Math.PI, Math.PI * 1.5);
  return s;
}

// Card frame: face normal +Y, top edge toward -Z, right edge toward +X.
function cardGeometry(col, row) {
  const geo = new THREE.ExtrudeGeometry(roundedRect(CARD.w, CARD.h, 0.0045), { depth: CARD.t, bevelEnabled: false, curveSegments: 5 });
  geo.translate(0, 0, -CARD.t / 2);
  const pos = geo.attributes.position, uv = geo.attributes.uv, nrm = geo.attributes.normal;
  const caps = geo.groups[0].count, sides = geo.groups[1].count, half = caps / 2;
  for (let i = 0; i < caps; i++) {
    const u = pos.getX(i) / CARD.w + 0.5, v = pos.getY(i) / CARD.h + 0.5;
    if (nrm.getZ(i) > 0) uv.setXY(i, (col + u) / 13, 1 - (row + 1 - v) / 4);
    else uv.setXY(i, 1 - u, v);
  }
  const firstIsFront = nrm.getZ(0) > 0;
  geo.clearGroups();
  geo.addGroup(0, half, firstIsFront ? 0 : 1);
  geo.addGroup(half, half, firstIsFront ? 1 : 0);
  geo.addGroup(caps, sides, 2);
  geo.rotateX(-Math.PI / 2);
  return geo;
}

const _n = new THREE.Vector3(0, -1, 0), _u = new THREE.Vector3(), _r = new THREE.Vector3(), _u0 = new THREE.Vector3(), _r0 = new THREE.Vector3();
const _z = new THREE.Vector3(), _m = new THREE.Matrix4();

// Pose of fan slot `fi` of `fn` cards, in the hand frame.
export function fanLocal(side, fi, fn, lift, outP, outQ) {
  const m = mSide(side);
  const spread = Math.min(0.2, 1.9 / Math.max(fn - 1, 1));
  const phi = (fi - (fn - 1) / 2) * spread;
  _u0.set(m, 0, -0.08).normalize();
  _r0.crossVectors(_u0, _n);
  _u.copy(_u0).multiplyScalar(Math.cos(phi)).addScaledVector(_r0, Math.sin(phi));
  _r.crossVectors(_u, _n);
  outP.set(-0.01 * m, -0.03, -0.065).addScaledVector(_u, 0.05 + lift).addScaledVector(_n, fi * 0.0009);
  outQ.setFromRotationMatrix(_m.makeBasis(_r, _n, _z.copy(_u).negate()));
}

// Default grip for a card held between thumb and index finger, in the hand frame.
export function pinchDefault(side) {
  const m = mSide(side);
  const u = new THREE.Vector3(m * 0.3, 0, -0.95).normalize();
  const r = new THREE.Vector3().crossVectors(u, _n);
  const p = pinchLocal(side, new THREE.Vector3()).addScaledVector(u, 0.035);
  const q = new THREE.Quaternion().setFromRotationMatrix(new THREE.Matrix4().makeBasis(r, _n, u.clone().negate()));
  return { p: p.toArray(), q: q.toArray() };
}

const Q_FLIP = new THREE.Quaternion(0, 0, 1, 0);
const _tp = new THREE.Vector3(), _tq = new THREE.Quaternion(), _lp = new THREE.Vector3(), _lq = new THREE.Quaternion();
const _a = new THREE.Vector3(), _b = new THREE.Vector3(), _c = new THREE.Vector3(), _q = new THREE.Quaternion();

// Flat resting orientation closest to q (keeps heading and which side is up).
export function flatten(q, out) {
  const up = _a.set(0, 1, 0).applyQuaternion(q).y >= 0;
  _b.set(0, 0, -1).applyQuaternion(q);
  if (_b.x * _b.x + _b.z * _b.z < 1e-4) _b.set(1, 0, 0).applyQuaternion(q);
  return out.fromArray(flatQuat(Math.atan2(-_b.x, -_b.z), up));
}

export class CardSystem {
  constructor(game) {
    this.game = game;
    const tex = makeTextures(game.renderer.capabilities.getMaxAnisotropy());
    const mats = [
      new THREE.MeshStandardMaterial({ map: tex.face, roughness: 0.5, color: 0xcfcfcf }),
      new THREE.MeshStandardMaterial({ map: tex.back, roughness: 0.5, color: 0xd8d8d8 }),
      new THREE.MeshStandardMaterial({ color: 0xf2ede2, roughness: 0.8 }),
    ];
    const geos = [];
    for (let k = 0; k < DECK_SIZE; k++) geos.push(cardGeometry(k % 13, Math.floor(k / 13)));

    this.cards = [];
    this.decks = TABLES.map(() => []);
    this.fans = new Map();   // pid -> { L: [ids], R: [ids] }
    this.pinch = new Map();  // pid -> { L: id|null, R: id|null }
    this.pickables = [];
    this.acc = 0;

    TABLES.forEach((_, t) => {
      for (let k = 0; k < DECK_SIZE; k++) {
        const mesh = new THREE.Mesh(geos[k], mats);
        mesh.castShadow = mesh.receiveShadow = true;
        const id = t * DECK_SIZE + k;
        mesh.userData.card = id;
        game.scene.add(mesh);
        this.cards.push({
          id, table: t, mesh, loc: 'deck', holder: 0, side: '',
          p: new THREE.Vector3(), q: new THREE.Quaternion(), v: new THREE.Vector3(), w: new THREE.Vector3(),
          rel: null, bl: null, fi: 0, fn: 1, lift: 0, liftT: 0, landed: false, mine: false, age: 0,
        });
        this.decks[t].push(id);
      }
    });

    // Hover outlines (one per hand / pointer)
    const frame = roundedRect(CARD.w + 0.008, CARD.h + 0.008, 0.008);
    frame.holes.push(roundedRect(CARD.w + 0.001, CARD.h + 0.001, 0.0045));
    const fg = new THREE.ShapeGeometry(frame);
    fg.rotateX(-Math.PI / 2);
    this.hl = [0, 1].map(() => {
      const m = new THREE.Mesh(fg, new THREE.MeshBasicMaterial({ color: 0xffd76a, side: THREE.DoubleSide, transparent: true, opacity: 0.9, depthWrite: false }));
      m.visible = false;
      m.renderOrder = 5;
      game.scene.add(m);
      return m;
    });
    this.hlId = [-1, -1];
    this.snap();
  }

  // ---------- containers ----------
  fan(pid, side) {
    let f = this.fans.get(pid);
    if (!f) this.fans.set(pid, (f = { L: [], R: [] }));
    return f[side];
  }
  pinched(pid, side) { const p = this.pinch.get(pid); return p ? p[side] : null; }
  topOfDeck(t) { const d = this.decks[t]; return d.length ? d[d.length - 1] : -1; }

  detach(c) {
    if (c.loc === 'deck') { const d = this.decks[c.table], i = d.indexOf(c.id); if (i >= 0) d.splice(i, 1); }
    else if (c.loc === 'fan') { const f = this.fan(c.holder, c.side), i = f.indexOf(c.id); if (i >= 0) f.splice(i, 1); }
    else if (c.loc === 'pinch') { const p = this.pinch.get(c.holder); if (p && p[c.side] === c.id) p[c.side] = null; }
    c.holder = 0; c.side = ''; c.rel = null; c.mine = false;
  }

  blend(c, dur = 0.16, arc = 0, delay = 0) {
    c.bl = { t: 0, dur, arc, delay, p0: c.mesh.position.clone(), q0: c.mesh.quaternion.clone() };
  }

  // ---------- operations (applied locally first, and for remote players) ----------
  take(pid, id, side, mode, index, rel) {
    const c = this.cards[id];
    this.detach(c);
    c.loc = mode; c.holder = pid; c.side = side;
    if (mode === 'fan') {
      const f = this.fan(pid, side);
      index = index === undefined ? f.length : Math.max(0, Math.min(f.length, index));
      f.splice(index, 0, id);
      c.fi = index; c.fn = f.length; c.lift = 0;
    } else {
      let p = this.pinch.get(pid);
      if (!p) this.pinch.set(pid, (p = { L: null, R: null }));
      p[side] = id;
      c.rel = { p: new THREE.Vector3().fromArray(rel.p), q: new THREE.Quaternion().fromArray(rel.q) };
    }
    this.blend(c, 0.14);
    this.game.sfx.card(c.mesh.position, 0.5);
  }

  drop(id, p, q, v, w, mine) {
    const c = this.cards[id];
    this.detach(c);
    c.loc = 'fly'; c.mine = mine; c.landed = false; c.age = 0;
    c.p.fromArray(p); c.q.fromArray(q); c.v.fromArray(v); c.w.fromArray(w);
    this.blend(c, 0.08);
  }

  put(id, p, q, dur = 0.26, arc = 0.05, delay = 0) {
    const c = this.cards[id];
    const wasFlying = c.loc === 'fly';
    this.detach(c);
    c.loc = 'table';
    c.p.fromArray(p); c.q.fromArray(q);
    if (wasFlying) this.blend(c, 0.1); else { this.blend(c, dur, arc, delay); this.game.sfx.card(c.p, 0.8, (dur + delay) * 1000); }
  }

  toDeck(id) {
    const c = this.cards[id];
    this.detach(c);
    c.loc = 'deck';
    this.decks[c.table].push(id);
    this.blend(c, 0.24, 0.04);
    this.game.sfx.card(c.mesh.position, 0.6, 200);
  }

  deckSet(t, deck, shuffled) {
    for (const id of deck) { const c = this.cards[id]; if (c.loc !== 'deck') { this.detach(c); c.loc = 'deck'; } }
    this.decks[t] = deck.slice();
    deck.forEach((id, i) => this.blend(this.cards[id], 0.4, shuffled ? 0.03 + (i % 5) * 0.012 : 0.03, shuffled ? (i % 9) * 0.012 : 0));
    if (shuffled) this.game.sfx.shuffle(deckPos(t));
  }

  dealt(items) {
    items.forEach((it, i) => this.put(it.card, it.p, it.q, 0.38, 0.07, i * 0.13));
  }

  sync(state) {
    this.fans.clear(); this.pinch.clear();
    this.decks = state.decks.map((d) => d.slice());
    for (const pid in state.fans) this.fans.set(Number(pid), { L: state.fans[pid].L.slice(), R: state.fans[pid].R.slice() });
    state.cards.forEach((s, id) => {
      const c = this.cards[id];
      c.loc = s.l; c.holder = s.h; c.side = s.s; c.mine = false; c.bl = null; c.rel = null;
      if (s.p) c.p.fromArray(s.p);
      if (s.q) c.q.fromArray(s.q);
      if (s.l === 'pinch') {
        let p = this.pinch.get(s.h);
        if (!p) this.pinch.set(s.h, (p = { L: null, R: null }));
        p[s.s] = id;
        c.rel = { p: new THREE.Vector3().fromArray(s.r.p), q: new THREE.Quaternion().fromArray(s.r.q) };
      }
    });
    this.snap();
  }

  snap() {
    for (const c of this.cards) { c.bl = null; if (c.loc === 'fan') { const f = this.fan(c.holder, c.side); c.fi = f.indexOf(c.id); c.fn = f.length; } }
    this.update(0);
  }

  // ---------- queries ----------
  surfaceAt(x, z, y) {
    for (let t = 0; t < TABLES.length; t++) if (y > tableY(t) - 0.03 && onFelt(t, x, z)) return tableY(t);
    return inLoft(x, z) && y > ROOM.loft - 0.03 ? ROOM.loft : 0;
  }

  // Resting height for a card at (x, z): on top of whatever is already lying there.
  restY(id, x, z, surf) {
    let y = surf + CARD.t / 2;
    for (const o of this.cards) {
      if (o.id === id || o.loc !== 'table' || o.p.y < surf || o.p.y > surf + 0.06) continue;
      if (Math.abs(o.p.x - x) < 0.09 && Math.abs(o.p.z - z) < 0.11) y = Math.max(y, o.p.y + CARD.t * 1.2);
    }
    for (let t = 0; t < TABLES.length; t++) {
      const d = deckPos(t);
      if (surf === tableY(t) && Math.abs(d.x - x) < 0.09 && Math.abs(d.z - z) < 0.11) y = Math.max(y, surf + (this.decks[t].length + 1) * CARD.t);
    }
    return y;
  }

  deckTopPos(t, out) {
    const d = deckPos(t);
    return out.set(d.x, d.y + Math.max(this.decks[t].length, 1) * CARD.t, d.z);
  }

  // Nearest card a hand at `point` could grab: table cards, deck tops, and the player's other hand.
  nearest(point, maxDist, pid, side) {
    let best = -1, bd = maxDist;
    const other = side === 'L' ? 'R' : 'L';
    for (const c of this.cards) {
      if (c.loc === 'fly') continue;
      if (c.loc === 'deck' && this.topOfDeck(c.table) !== c.id) continue;
      if ((c.loc === 'fan' || c.loc === 'pinch') && (c.holder !== pid || c.side !== other)) continue;
      let d = c.mesh.position.distanceTo(point);
      if (c.loc === 'fan') {
        // only the top-left strip of a fanned card is exposed; measure to that
        _c.set(-CARD.w * 0.3, 0, -CARD.h * 0.3).applyQuaternion(c.mesh.quaternion).add(c.mesh.position);
        d = _c.distanceTo(point) - 0.02;
      }
      if (d < bd) { bd = d; best = c.id; }
    }
    return best;
  }

  pickList() {
    const list = this.pickables;
    list.length = 0;
    for (const c of this.cards) if (c.loc === 'table' || c.loc === 'deck') list.push(c.mesh);
    return list;
  }
  // Clicking anywhere on a deck means its top card.
  resolvePick(id) { const c = this.cards[id]; return c.loc === 'deck' ? this.topOfDeck(c.table) : id; }

  highlight(slot, id) { this.hlId[slot] = id; }
  liftCard(id, amount = 0.022) { if (id >= 0) this.cards[id].liftT = amount; }

  // ---------- simulation ----------
  stepFly(c, h) {
    const prevY = c.p.y;
    const n = _a.set(0, 1, 0).applyQuaternion(c.q);
    c.v.y -= 9.8 * h;
    c.v.addScaledVector(n, -c.v.dot(n) * Math.min(1, 9 * h)); // a card resists moving face-first
    c.v.multiplyScalar(1 - 0.4 * h);
    c.p.addScaledVector(c.v, h);
    const wl = c.w.length();
    if (wl > 1e-4) c.q.premultiply(_q.setFromAxisAngle(_b.copy(c.w).divideScalar(wl), wl * h)).normalize();
    c.w.multiplyScalar(1 - 1.5 * h);
    const hw = ROOM.w / 2 - 0.1, hd = ROOM.d / 2 - 0.1;
    if (Math.abs(c.p.x) > hw) { c.p.x = Math.sign(c.p.x) * hw; c.v.x *= -0.2; }
    if (Math.abs(c.p.z) > hd) { c.p.z = Math.sign(c.p.z) * hd; c.v.z *= -0.2; }

    const surf = this.surfaceAt(c.p.x, c.p.z, prevY);
    const xa = _b.set(1, 0, 0).applyQuaternion(c.q), za = _c.set(0, 0, 1).applyQuaternion(c.q);
    const e = 0.5 * (CARD.w * Math.abs(xa.y) + CARD.h * Math.abs(za.y)) + CARD.t;
    if (c.p.y - e > surf) return false;
    if (!c.landed) { c.landed = true; this.game.sfx.card(c.p, Math.min(1, 0.4 + c.v.length() * 0.3)); }
    c.p.y = surf + e;
    c.v.y = 0;
    const f = Math.max(0, 1 - 7 * h);
    c.v.x *= f; c.v.z *= f;
    flatten(c.q, _q);
    c.q.slerp(_q, Math.min(1, 16 * h));
    c.w.x = c.w.z = 0;
    c.w.y *= Math.max(0, 1 - 9 * h);
    if (c.v.x * c.v.x + c.v.z * c.v.z < 0.001 && c.q.angleTo(_q) < 0.03) {
      c.loc = 'table';
      c.q.copy(_q);
      c.p.y = this.restY(c.id, c.p.x, c.p.z, surf);
      if (c.mine) this.game.net.send({ op: 'put', card: c.id, p: c.p.toArray(), q: c.q.toArray() });
      c.mine = false;
      return true;
    }
    return false;
  }

  update(dt) {
    const H = 1 / 120;
    this.acc = Math.min(this.acc + dt, 0.1);
    while (this.acc >= H) {
      this.acc -= H;
      for (const c of this.cards) if (c.loc === 'fly') { c.age += H; if (c.age > 8) { c.v.set(0, 0, 0); c.w.set(0, 0, 0); } this.stepFly(c, H); }
    }

    const k = Math.min(1, dt * 16);
    for (const c of this.cards) {
      let ok = true;
      if (c.loc === 'deck') {
        const i = this.decks[c.table].indexOf(c.id), d = deckPos(c.table);
        _tp.set(d.x, d.y + CARD.t / 2 + i * CARD.t, d.z);
        _tq.fromArray(flatQuat(((c.id * 37) % 11 - 5) * 0.004, false));
      } else if (c.loc === 'table' || c.loc === 'fly') {
        _tp.copy(c.p); _tq.copy(c.q);
      } else {
        const hand = this.game.handObj(c.holder, c.side);
        if (!hand) ok = false;
        else {
          if (c.loc === 'fan') {
            const f = this.fan(c.holder, c.side);
            c.fi += (f.indexOf(c.id) - c.fi) * k;
            c.fn += (f.length - c.fn) * k;
            c.lift += (c.liftT - c.lift) * Math.min(1, dt * 20);
            fanLocal(c.side, c.fi, c.fn, c.lift, _lp, _lq);
          } else { _lp.copy(c.rel.p); _lq.copy(c.rel.q); }
          _tp.copy(_lp).applyQuaternion(hand.quaternion).add(hand.position);
          _tq.copy(hand.quaternion).multiply(_lq);
        }
      }
      c.liftT = 0;
      c.mesh.visible = ok;
      if (!ok) continue;
      if (c.bl) {
        const b = c.bl;
        b.t += dt;
        const u = Math.min(1, Math.max(0, (b.t - b.delay) / b.dur)), e = u * u * (3 - 2 * u);
        c.mesh.position.lerpVectors(b.p0, _tp, e);
        c.mesh.position.y += Math.sin(Math.PI * e) * b.arc;
        c.mesh.quaternion.slerpQuaternions(b.q0, _tq, e);
        if (u >= 1) c.bl = null;
      } else { c.mesh.position.copy(_tp); c.mesh.quaternion.copy(_tq); }
    }

    for (let s = 0; s < 2; s++) {
      const id = this.hlId[s], h = this.hl[s];
      h.visible = id >= 0;
      if (id >= 0) {
        const m = this.cards[id].mesh;
        h.quaternion.copy(m.quaternion);
        h.position.copy(m.position);
      }
      this.hlId[s] = -1;
    }
  }
}
