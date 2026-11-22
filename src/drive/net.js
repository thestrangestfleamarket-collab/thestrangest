// Multiplayer client: room join, state relay with snapshot interpolation, seat arbitration, events.
export class Net {
  constructor() { this.ws = null; this.id = 0; this.slot = 0; this.players = new Map(); this.seats = {}; this.offset = 0; this.connected = false; this.handlers = {}; this.room = ''; }
  on(name, fn) { this.handlers[name] = fn; }
  emit(name, ...a) { const f = this.handlers[name]; if (f) f(...a); }
  connect(room, name, color) {
    this.room = room;
    return new Promise((resolve) => {
      let done = false; const fin = (ok) => { if (!done) { done = true; resolve(ok); } };
      try { const proto = location.protocol === 'https:' ? 'wss' : 'ws'; this.ws = new WebSocket(`${proto}://${location.host}/parties/drive/${String(room).toLowerCase().replace(/[^a-z0-9-]/g, '').slice(0, 32) || 'main'}`); } catch { return fin(false); }
      const ws = this.ws; setTimeout(() => fin(false), 4000);
      ws.onopen = () => ws.send(JSON.stringify({ t: 'join', room, name, color }));
      ws.onerror = () => fin(false); ws.onclose = () => { this.connected = false; fin(false); this.emit('status', false); };
      ws.onmessage = (ev) => { const m = JSON.parse(ev.data);
        switch (m.t) {
          case 'welcome': this.id = m.id; this.slot = m.slot; this.offset = m.now - Date.now(); this.seats = m.seats; this.connected = true; for (const p of m.players) this.addPlayer(p); fin(true); this.emit('status', true); break;
          case 'joined': this.addPlayer(m); this.seats[m.id] = [null, null, null, null]; this.emit('joined', this.players.get(m.id)); break;
          case 'left': { const p = this.players.get(m.id); this.players.delete(m.id); this.seats = m.seats; if (p) this.emit('left', p); break; }
          case 's': { const p = this.players.get(m.id); if (p) { p.snaps.push({ ts: m.ts, s: m.s }); if (p.snaps.length > 30) p.snaps.shift(); } break; }
          case 'seats': this.seats = m.seats; this.emit('seats', m); break;
          case 'ev': this.emit('ev', m.id, m.e); break;
        } };
    });
  }
  addPlayer(p) { const o = { id: p.id, slot: p.slot, name: p.name, color: p.color, snaps: [] }; if (p.state) o.snaps.push({ ts: Date.now() + this.offset, s: p.state }); this.players.set(p.id, o); return o; }
  send(m) { if (this.ws && this.ws.readyState === 1) this.ws.send(JSON.stringify(m)); }
  sendState(s) { this.send({ t: 's', s }); }
  sit(car, seat, req) { this.send({ t: 'sit', car, seat, req }); }
  event(e) { this.send({ t: 'ev', e }); }
  serverNow() { return Date.now() + this.offset; }
  seatOwner(car, seat) { const a = this.seats[car]; return a ? a[seat] : null; }
  // returns [a, b, t] snapshots bracketing render time for player p
  sample(p, delay = 130) { const t = this.serverNow() - delay; const s = p.snaps; if (!s.length) return null; if (s.length === 1 || t <= s[0].ts) return [s[0].s, s[0].s, 0]; for (let i = s.length - 1; i > 0; i--) if (s[i - 1].ts <= t) { const a = s[i - 1], b = s[i]; return [a.s, b.s, Math.max(0, Math.min(1.25, (t - a.ts) / Math.max(1, b.ts - a.ts)))]; } return [s[0].s, s[0].s, 0]; }
}
