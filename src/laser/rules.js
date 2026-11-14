// LASER TAG's pack: Super Charge 25 by the arena rules (tournament settings: one shot a second, reflex shot, defense shield), no screen or network here
export const RULES = {
  LIVES: 25,        // Super Charge 25
  SHOTS: 20,        // shots per life; a good shot fills them again, running out costs a life
  LOW: 3,           // "LOW ON SHOTS" from here
  RATE: 1000,       // one shot a second
  REFLEX: 1000,     // after a tag: a second to fire back, if you had not fired in the second before it
  SHIELD: 3000,     // then the defense shield: no tagging, no being tagged
  WARN: 3000,       // then the warning: you can be tagged, you cannot fire
  MOMENT: 150,      // "the same moment" (ms): a trigger pulled within it cancels a tag; in the reflex second, a tag within it of the reflex shot is a double
  ROW: 5,           // tags in a row without being tagged: supercharged, and every life back
  BURST: 3,         // supercharged: three shots to a pull
  GAP: 90,          // ms between the burst's shots
  TAG: 200,         // classic scoring: a tag
  HIT_BY_REFLEX: -100,
};

// phases: 'u' not energized, 'n' in play, 'r' reflex second, 's' defense shield, 'w' warning, 'o' out of lives
export class Pack {
  constructor(rules = RULES) { this.R = rules; this.on = () => {}; this.reset(); }

  reset() {
    Object.assign(this, { phase: 'u', lives: 0, shots: 0, score: 0, streak: 0, supercharged: false, ends: 0,
      lastFire: -1e12, fires: [], pending: [], canReflex: false, reflexUsed: false });
  }

  energize() {
    this.reset();
    Object.assign(this, { phase: 'n', lives: this.R.LIVES, shots: this.R.SHOTS });
    this.on('energized');
  }

  get playing() { return this.phase !== 'u' && this.phase !== 'o'; }

  // the trigger: null when the gun will not fire, else how many shots and whether this is the reflex shot
  pull(now) {
    if (now - this.lastFire < this.R.RATE) return null;
    if (this.phase === 'o' || this.phase === 's' || this.phase === 'w') return null;
    let reflex = false;
    if (this.phase === 'r') { if (!this.canReflex || this.reflexUsed) return null; reflex = this.reflexUsed = true; }
    this.lastFire = now;
    this.fires.push({ t: now, reflex });
    if (this.fires.length > 8) this.fires.shift();
    if (this.phase === 'u') return { n: 1, reflex: false, practice: true };
    const n = this.supercharged ? this.R.BURST : 1;
    const before = this.shots;
    this.shots = Math.max(0, this.shots - n);
    if (this.shots <= this.R.LOW && before > this.R.LOW && this.shots > 0) this.on('low');
    if (this.shots === 0) {
      this.shots = this.R.SHOTS;
      this.loseLife(1, 'shots');
    }
    return { n, reflex, practice: false };
  }

  // a tag arrived from the other pack (it saw the beam reach a sensor); it is judged once "the moment" has passed
  hit(now, { reflex = false, id = 0 } = {}) {
    if (!this.playing) return;
    this.pending.push({ t: now, reflex, id });
  }

  // the other pack said one of our shots tagged
  good(now) {
    if (!this.playing) return;
    this.shots = this.R.SHOTS;
    this.score += this.R.TAG;
    this.streak++;
    if (this.streak >= this.R.ROW) {
      this.streak = 0;
      this.supercharged = true;
      this.lives = this.R.LIVES;
      this.on('super');
    } else this.on('good', this.streak);
  }

  update(now) {
    for (let i = 0; i < this.pending.length; i++) {
      const p = this.pending[i];
      if (now - p.t < this.R.MOMENT) continue;
      this.pending.splice(i--, 1);
      this.judge(p);
    }
    while (this.playing && this.phase !== 'n' && now >= this.ends) {
      if (this.phase === 'r') { this.phase = 's'; this.ends += this.R.SHIELD; this.on('shield'); }
      else if (this.phase === 's') { this.phase = 'w'; this.ends += this.R.WARN; this.on('warning'); }
      else { this.phase = 'n'; this.on('clear'); }
    }
  }

  judge(p) {
    if (!this.playing) return this.on('ignored', p);
    const near = this.fires.find(f => Math.abs(f.t - p.t) <= this.R.MOMENT);
    if (this.phase === 'n') {
      if (near) return this.on('cancel', p);
      return this.tag(p);
    }
    if (this.phase === 'r') {
      if (near && near.reflex) { this.on('double', p); this.loseLife(1, 'double'); return; }
      return this.on('ignored', p);
    }
    if (this.phase === 'w') return this.tag(p);
    this.on('ignored', p);
  }

  tag(p) {
    this.streak = 0;
    this.supercharged = false;
    if (p.reflex) this.score += this.R.HIT_BY_REFLEX;
    this.canReflex = !this.fires.some(f => f.t < p.t && p.t - f.t < this.R.RATE);
    this.reflexUsed = false;
    this.phase = 'r';
    this.ends = p.t + this.R.REFLEX;
    this.on('tagged', p);
    this.loseLife(1, 'tag');
  }

  loseLife(n, why) {
    this.lives = Math.max(0, this.lives - n);
    if (this.lives === 0) {
      this.phase = 'o';
      this.supercharged = false;
      this.pending.length = 0;
      this.on('out', why);
    }
  }

  // what the other pack shows on its gun and back panel
  view() {
    return { ph: this.phase, l: this.lives, s: this.shots, sc: this.score, k: this.streak, su: this.supercharged ? 1 : 0 };
  }
}
