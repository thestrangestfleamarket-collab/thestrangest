// the asylum's shared state: the player, what they carry, how far the night has gone
import * as T from 'three';

export const G = {
  mode: 'title', t: 0, xr: false, touch: false,
  p: { x: 13.5, z: 28.5, yaw: 0, pitch: 0, speed: 0 },
  head: new T.Vector3(13.5, 1.65, 28.5), fwd: new T.Vector3(0, 0, -1),
  lightPos: new T.Vector3(), lightDir: new T.Vector3(0, 0, -1), lightOn: true, lightCut: 0, batt: .7,
  inv: { key: false, mkey: false, fuses: 0 }, placed: false, power: false, red: false,
  flags: {}, cp: { x: 13.5, z: 28.5, yaw: 0 }, deaths: 0, t0: 0, objective: '',
};
let timers = [];
export const after = (s, fn) => { timers.push({ t: G.t + s, fn }); };
export function runTimers() {
  const due = timers.filter(x => x.t <= G.t); if (!due.length) return;
  timers = timers.filter(x => x.t > G.t); for (const d of due) d.fn();
}
export const once = k => G.flags[k] ? false : (G.flags[k] = true);
