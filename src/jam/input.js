// STADIUM JAM's input: unifies VR controllers, tracked hands and desktop keyboard/mouse into two "hands".
import * as THREE from 'three';
import { XRHandModelFactory } from 'three/addons/webxr/XRHandModelFactory.js';
import { STICK_TIP } from './drums.js';

const PICK_TIP = new THREE.Vector3(0, 0, -0.07);

function makeHand() {
  return {
    active: false, isHand: false,
    pos: new THREE.Vector3(), quat: new THREE.Quaternion(),
    tip: new THREE.Vector3(), // drum stick tip
    pick: new THREE.Vector3(), // guitar pick / fretting point
    trigger: false, squeeze: false, a: false, b: false, thumb: false, pinch: false,
    down: {}, // buttons that went down this frame
    _prev: {}, source: null,
    pulse(intensity, ms) {
      this.source?.gamepad?.hapticActuators?.[0]?.pulse?.(Math.min(1, intensity), ms);
    },
  };
}
const BUTTONS = ['trigger', 'squeeze', 'a', 'b', 'thumb', 'pinch'];

export class Input {
  constructor(renderer, rig, camera, dom) {
    this.renderer = renderer;
    this.camera = camera;
    this.hands = { left: makeHand(), right: makeHand() };
    this.slots = [];
    // Fully articulated hand meshes: every finger joint follows the headset's hand tracking.
    this.handMat = new THREE.MeshStandardMaterial({ color: 0xd9a984, roughness: 0.62, metalness: 0 });
    const factory = new XRHandModelFactory(null, (object) => {
      object.traverse((o) => { if (o.isMesh) { o.material = this.handMat; o.castShadow = true; o.receiveShadow = true; } });
    });
    factory.setPath('/jam-assets/');
    for (let i = 0; i < 2; i++) {
      const grip = renderer.xr.getControllerGrip(i);
      const hand = renderer.xr.getHand(i);
      const slot = { grip, hand, source: null };
      grip.addEventListener('connected', (e) => { slot.source = e.data; });
      grip.addEventListener('disconnected', () => { slot.source = null; });
      hand.add(factory.createHandModel(hand, 'mesh'));
      rig.add(grip, hand);
      this.slots.push(slot);
    }

    // desktop
    this.yaw = 0;
    this.pitch = -0.12;
    this.keys = new Set();
    this.keyHandlers = [];
    let dragging = false;
    dom.addEventListener('mousedown', () => { dragging = true; });
    window.addEventListener('mouseup', () => { dragging = false; });
    window.addEventListener('mousemove', (e) => {
      if (!dragging && document.pointerLockElement !== dom) return;
      this.yaw -= e.movementX * 0.0028;
      this.pitch = Math.max(-1.4, Math.min(1.2, this.pitch - e.movementY * 0.0028));
    });
    window.addEventListener('keydown', (e) => {
      if (e.target instanceof HTMLInputElement) return;
      if (e.repeat) return e.preventDefault();
      this.keys.add(e.code);
      for (const h of this.keyHandlers) if (h(e.code, true) === true) e.preventDefault();
    });
    window.addEventListener('keyup', (e) => {
      this.keys.delete(e.code);
      for (const h of this.keyHandlers) h(e.code, false);
    });
    window.addEventListener('blur', () => this.keys.clear());
  }

  setSkin(color) { this.handMat.color.copy(color); }

  onKey(fn) { this.keyHandlers.push(fn); }
  isDown(code) { return this.keys.has(code); }

  applyDesktopLook() {
    this.camera.rotation.set(this.pitch, this.yaw, 0, 'YXZ');
  }

  // Reads XR input sources into this.hands. Call once per frame while presenting.
  updateXR() {
    const H = this.hands;
    H.left.active = H.right.active = false;
    for (const slot of this.slots) {
      const src = slot.source;
      if (!src || (src.handedness !== 'left' && src.handedness !== 'right')) continue;
      const h = H[src.handedness];
      h.source = src;
      if (src.hand) {
        const j = slot.hand.joints;
        const wrist = j['wrist'], index = j['index-finger-tip'], thumb = j['thumb-tip'];
        if (!wrist || !index || !thumb || !wrist.visible) continue;
        h.active = true;
        h.isHand = true;
        wrist.getWorldPosition(h.pos);
        wrist.getWorldQuaternion(h.quat);
        index.getWorldPosition(h.tip);
        h.pick.copy(h.tip);
        thumb.getWorldPosition(_v);
        const d = _v.distanceTo(h.tip);
        h.pinch = h.pinch ? d < 0.035 : d < 0.018;
        h.trigger = h.squeeze = h.a = h.b = h.thumb = false;
      } else {
        if (!slot.grip.visible) continue;
        h.active = true;
        h.isHand = false;
        slot.grip.getWorldPosition(h.pos);
        slot.grip.getWorldQuaternion(h.quat);
        h.tip.copy(STICK_TIP).applyQuaternion(h.quat).add(h.pos);
        h.pick.copy(PICK_TIP).applyQuaternion(h.quat).add(h.pos);
        const b = src.gamepad?.buttons || [];
        h.trigger = !!b[0]?.pressed;
        h.squeeze = !!b[1]?.pressed;
        h.thumb = !!b[3]?.pressed;
        h.a = !!b[4]?.pressed;
        h.b = !!b[5]?.pressed;
        h.pinch = false;
      }
    }
    this._edges();
  }

  _edges() {
    for (const h of [this.hands.left, this.hands.right]) {
      for (const k of BUTTONS) {
        h.down[k] = h.active && h[k] && !h._prev[k];
        h._prev[k] = h.active && h[k];
      }
    }
  }
}
const _v = new THREE.Vector3();
