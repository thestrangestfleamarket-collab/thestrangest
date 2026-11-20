// Keyboard / mouse / gamepad / XR-thumbstick input, merged into one control state.
const clamp = (x, a, b) => x < a ? a : x > b ? b : x;
export class Input {
  constructor(dom) {
    this.dom = dom; this.keys = {}; this.pitch = 0; this.roll = 0; this.yaw = 0; this.throttle = 0.85; this.fire = false; this.brake = 0; this.events = []; this.mouse = { x: 0, y: 0, locked: false, look: false, lx: 0, ly: 0 }; this.kp = 0; this.kr = 0; this.ky = 0; this.xr = { fire: false, btn: {} };
    const map = { KeyG: 'gear', KeyF: 'flaps', KeyB: 'airbrake', KeyV: 'view', KeyL: 'lights', KeyX: 'weapon', KeyR: 'rocket', KeyI: 'engine', KeyP: 'autopilot', KeyN: 'nextPlane', KeyT: 'time', Enter: 'respawn', Escape: 'menu', KeyH: 'help', KeyM: 'markers' };
    addEventListener('keydown', e => { if (e.repeat) return; this.keys[e.code] = true; if (map[e.code]) { this.events.push(map[e.code]); } if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) e.preventDefault(); });
    addEventListener('keyup', e => { this.keys[e.code] = false; });
    addEventListener('blur', () => { this.keys = {}; });
    document.addEventListener('pointerlockchange', () => { this.mouse.locked = document.pointerLockElement === dom; if (!this.mouse.locked) { this.mouse.x = this.mouse.y = 0; } });
    dom.addEventListener('mousemove', e => { if (this.mouse.locked) { if (this.mouse.look) { this.mouse.lx -= e.movementX * 0.003; this.mouse.ly = clamp(this.mouse.ly - e.movementY * 0.003, -1.3, 1.3); } else { this.mouse.x = clamp(this.mouse.x + e.movementX * 0.0022, -1, 1); this.mouse.y = clamp(this.mouse.y + e.movementY * 0.0022, -1, 1); } } this.mouse.cx = e.clientX; this.mouse.cy = e.clientY; });
    dom.addEventListener('mousedown', e => { if (e.button === 0) { this.mouse.down = true; this.events.push('click'); } if (e.button === 2) this.mouse.look = true; });
    addEventListener('mouseup', e => { if (e.button === 0) this.mouse.down = false; if (e.button === 2) { this.mouse.look = false; } });
    dom.addEventListener('contextmenu', e => e.preventDefault());
    dom.addEventListener('wheel', e => { this.setThrottle(this.throttle - Math.sign(e.deltaY) * 0.05); }, { passive: true });
  }
  setThrottle(v) { this.throttle = clamp(v, 0, 1); }
  pop() { const e = this.events; this.events = []; return e; }
  update(dt, session) {
    const k = this.keys, ax = (pos, neg) => (k[pos] ? 1 : 0) - (k[neg] ? 1 : 0), ramp = (cur, tgt, up = 3.2, down = 5) => cur + clamp(tgt - cur, -dt * (tgt === 0 ? down : up), dt * (tgt === 0 ? down : up));
    this.kp = ramp(this.kp, ax('KeyS', 'KeyW') + ax('ArrowDown', 'ArrowUp')); this.kr = ramp(this.kr, ax('KeyD', 'KeyA') + ax('ArrowRight', 'ArrowLeft')); this.ky = ramp(this.ky, ax('KeyE', 'KeyQ'));
    let pitch = clamp(this.kp, -1, 1), roll = clamp(this.kr, -1, 1), yaw = this.ky, fire = !!k.Space, brake = k.KeyB ? 1 : 0;
    if (k.ShiftLeft || k.Equal || k.PageUp) this.throttle = clamp(this.throttle + dt * 0.6, 0, 1); if (k.ControlLeft || k.Minus || k.PageDown) this.throttle = clamp(this.throttle - dt * 0.6, 0, 1);
    if (this.mouse.locked) { pitch += this.mouse.y; roll += this.mouse.x; if (this.mouse.down) fire = true; if (!this.mouse.look) { this.mouse.x *= Math.exp(-dt * 1.2); this.mouse.y *= Math.exp(-dt * 1.2); } }
    // standard gamepad
    for (const gp of navigator.getGamepads ? navigator.getGamepads() : []) { if (!gp || gp.mapping !== 'standard') continue; const dz = v => Math.abs(v) < 0.12 ? 0 : v; roll += dz(gp.axes[0]); pitch += dz(gp.axes[1]); yaw += dz(gp.axes[2]);
      const b = gp.buttons; if (b[7]?.value > 0.05) this.throttle = clamp(this.throttle + dt * b[7].value * 0.7, 0, 1); if (b[6]?.value > 0.05) this.throttle = clamp(this.throttle - dt * b[6].value * 0.7, 0, 1); if (b[0]?.pressed) fire = true;
      this.edge('gp1', b[1]?.pressed, 'rocket'); this.edge('gp2', b[2]?.pressed, 'weapon'); this.edge('gp3', b[3]?.pressed, 'view'); this.edge('gp9', b[9]?.pressed, 'respawn'); this.edge('gp12', b[12]?.pressed, 'gear'); this.edge('gp13', b[13]?.pressed, 'flaps'); }
    this.pitch = clamp(pitch, -1, 1); this.roll = clamp(roll, -1, 1); this.yaw = clamp(yaw, -1, 1); this.fire = fire; this.brake = brake;
  }
  edge(id, pressed, ev) { if (pressed && !this.xr.btn[id]) this.events.push(ev); this.xr.btn[id] = !!pressed; }
}
