// Talking to THE CANTINA's regulars: T beside one opens a panel; the website's /cantina/talk answers as that character (Claude, worker/cantina.js); without it they say their own line.
import { Vector3 } from 'three';
import CAST from './cast.json';
const _d = new Vector3();
export class Talk {
  constructor(game) {
    this.game = game; this.open = false; this.who = null; this.cast = Object.fromEntries(CAST.map((c) => [c.id, c]));
    this.box = document.getElementById('talk'); this.log = document.getElementById('talkLog'); this.name = document.getElementById('talkName'); this.sub = document.getElementById('talkSub');
    this.field = document.getElementById('talkSay');
    document.getElementById('talkForm').addEventListener('submit', (e) => { e.preventDefault(); const v = this.field.value.trim(); if (v) { this.field.value = ''; this.say(v); } });
    document.getElementById('talkClose').addEventListener('click', () => this.close());
    this.field.addEventListener('keydown', (e) => { e.stopPropagation(); if (e.key === 'Escape') this.close(); });
    this.field.addEventListener('keyup', (e) => e.stopPropagation());
  }
  names() { return Object.fromEntries(CAST.map((c) => [c.id, c.name])); }
  // the regular you are standing by and facing
  near() {
    const g = this.game, e = g.me.pose.head.p; let best = null, bd = 3.2;
    g.camera.getWorldDirection(_d);
    for (const n of g.world.npcs) { const dx = n.x - e.x, dz = n.z - e.z, d = Math.hypot(dx, dz); if (d < bd && Math.abs(n.y - e.y) < 2.6 && (dx * _d.x + dz * _d.z) / (d || 1) > 0.5) { bd = d; best = n; } }
    return best && this.cast[best.id] ? this.cast[best.id] : null;
  }
  line(who, text, cls) { const p = document.createElement('p'); p.className = cls; if (who) { const b = document.createElement('b'); b.textContent = who; p.append(b); } p.append(text); this.log.append(p); this.log.scrollTop = this.log.scrollHeight; return p; }
  start(c) {
    this.who = c; this.open = true; this.log.textContent = ''; this.name.textContent = c.name; this.sub.textContent = c.kind + ' · ' + c.job;
    this.box.hidden = false; document.exitPointerLock?.(); this.line(c.name, c.hello, 'them'); setTimeout(() => this.field.focus(), 30);
  }
  close() { this.open = false; this.box.hidden = true; this.field.blur(); }
  async say(text) {
    const c = this.who, g = this.game; this.line('', text, 'me');
    const wait = this.line(c.name, '…', 'them');
    let out = null;
    try {
      const r = await fetch('cantina/talk', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ who: c.id, say: text, state: g.state() }) });
      const j = await r.json().catch(() => ({})); out = j.say || null; if (!out && j.why) this.why = j.why;
    } catch (e) { }
    wait.lastChild.textContent = out || this.offline(c);
    if (!out && this.why) { this.line('', '(' + this.why + ')', 'note'); this.why = ''; }
  }
  // no voice from the website: the character's own few lines, in turn
  offline(c) { c.n = (c.n || 0) + 1; return [c.hello, 'I ' + c.hobby.charAt(0).toLowerCase() + c.hobby.slice(1) + ', when the room lets me.', 'Ask me again later. ' + c.favorites.split('.')[0] + ', that is all I need tonight.'][c.n % 3]; }
}
