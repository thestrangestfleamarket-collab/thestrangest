// the run's one clock: one day and one night (G.clock = { phase, stage, t, frac }); frac runs 0 to 1 over the whole run, the light's phases and the story's stages follow it; G.clock.on(name, fn) hangs a system on a phase ('day' 'dusk' 'night' 'dawn') or a stage ('stage:signs' ...) beginning; ?fast=1 runs it quick, G.clock.skip() goes on to the next stage
import { G, clamp } from './ctx.js';

export const RUN = 38 * 60;   // seconds of play, the whole run
// the owner's curve (16 Nov 2026): what share of the run each stage is
export const STAGES = [['normal', 0.2], ['signs', 0.1], ['obvious', 0.1], ['ramp', 0.1], ['harder', 0.1], ['hardest', 0.1], ['winddown', 0.2], ['end', 0.1]];
// the light over them: day is normal and signs (the signs in the late afternoon), dusk is obvious, night runs from ramp through the wind-down, dawn is the end
export const PHASES = [['day', 0, 0.3], ['dusk', 0.3, 0.4], ['night', 0.4, 0.9], ['dawn', 0.9, 1]];
export const ORDER = PHASES.map((p) => p[0]);
const HOURS = { day: [10, 17.5], dusk: [17.5, 19.5], night: [19.5, 29], dawn: [29, 30.5] };   // the village's hour over each (29 is five in the morning)
const ETO = ['RAT 子', 'OX 丑', 'TIGER 寅', 'HARE 卯', 'DRAGON 辰', 'SNAKE 巳', 'HORSE 午', 'SHEEP 未', 'MONKEY 申', 'ROOSTER 酉', 'DOG 戌', 'BOAR 亥'];   // the old twelve hours, each two long, the Rat's from eleven at night
const START = {}; { let a = 0; for (const [n, f] of STAGES) { START[n] = a; a += f; } }

export function buildClock(params) {
  const f = params && params.get('fast'), hooks = {};
  const c = { phase: 'day', stage: 'normal', t: 0, frac: 0, pfrac: 0, speed: f != null ? (+f > 1 ? +f : 40) : 1, running: false, over: false, hour: 10, light: 1, run: RUN };
  const emit = (k, ...a) => { for (const fn of hooks[k] || []) { try { fn(...a); } catch (e) { console.error('clock ' + k, e); } } };
  c.on = (k, fn) => { (hooks[k] ||= []).push(fn); return () => { hooks[k] = hooks[k].filter((x) => x !== fn); }; };   // k: a phase, 'stage:<name>', 'end' (the run is over: help has come), 'reset' (back to the morning), 'tick' (fn(dt) every frame it runs)
  const where = () => { const ph = PHASES.find((p) => c.frac < p[2]) || PHASES[PHASES.length - 1], st = [...STAGES].reverse().find(([n]) => c.frac >= START[n] - 1e-9) || STAGES[0];
    return { ph: ph[0], pf: clamp((c.frac - ph[1]) / (ph[2] - ph[1]), 0, 1), st: st[0] }; };
  const sky = () => { const [a, b] = HOURS[c.phase]; c.hour = a + (b - a) * c.pfrac; const h = c.hour;
    c.light = h < 16.5 ? 1 : h < 19.5 ? clamp(1 - (h - 16.5) / 3, 0, 1) ** 1.4 : h < 29 ? 0 : clamp((h - 29) / 1.5, 0, 1) * 0.75; };
  const set = (frac, quiet) => { c.frac = clamp(frac, 0, 1); c.t = c.frac * RUN; const w = where(), was = [c.phase, c.stage]; c.phase = w.ph; c.pfrac = w.pf; c.stage = w.st; sky();
    if (quiet) return; if (c.phase !== was[0]) emit(c.phase, c.phase); if (c.stage !== was[1]) emit('stage:' + c.stage, c.stage); };
  c.eto = (h = c.hour) => ETO[Math.floor((((h + 1) % 24) + 24) % 24 / 2)];
  c.at = (stage) => START[stage];   // where a stage begins, as a share of the run
  c.start = () => { if (c.running || c.over) return; c.running = true; emit('day', 'day'); emit('stage:normal', 'normal'); };   // the stall opens: the day begins to pass
  c.go = (name) => { const ph = PHASES.find((p) => p[0] === name), at = ph ? ph[1] : START[name]; if (at == null) return; c.running = true; c.over = false; set(at + 1e-6); };   // to a phase's or a stage's beginning (a test, or a debug key)
  c.skip = () => { const i = STAGES.findIndex(([n]) => n === c.stage); if (i < STAGES.length - 1) c.go(STAGES[i + 1][0]); else c.finish(); };
  c.finish = () => { if (c.over) return; set(1); c.over = true; c.running = false; emit('end'); };
  c.reset = () => { c.running = false; c.over = false; set(0, true); emit('reset'); };
  c.update = (dt) => { if (!c.running || c.over || G.guest) return; const k = dt * c.speed; set(c.frac + k / RUN); emit('tick', k); if (c.frac >= 1) c.finish(); };
  c.follow = (frac) => { if (!(frac >= 0)) return; c.running = true; set(frac); };   // a guest's clock is the cook's (live.js)
  set(0, true);
  G.clock = c; return c;
}
