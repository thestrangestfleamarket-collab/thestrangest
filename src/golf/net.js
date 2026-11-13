// WebSocket client for the room relay in server.js.
export class Net {
  constructor() { this.ws = null; this.id = null; this.room = null; this.peers = new Map(); this.offset = 0; this.status = 'offline'; this.on = {}; }
  get connected() { return this.status === 'online'; }
  now() { return Date.now() + this.offset; }
  join(room, name, color) {
    this.leave();
    this.status = 'connecting'; this.room = room;
    let ws;
    try { ws = this.ws = new WebSocket(`${location.protocol === 'https:' ? 'wss' : 'ws'}://${location.host}/ws`); }
    catch { this.status = 'offline'; this.on.status?.(); return; }
    ws.onopen = () => ws.send(JSON.stringify({ t: 'join', room, name, color }));
    ws.onmessage = (e) => {
      let m; try { m = JSON.parse(e.data); } catch { return; }
      if (m.t === 'welcome') {
        this.id = m.id; this.offset = m.now - Date.now(); this.status = 'online';
        this.peers.clear(); for (const p of m.peers) this.peers.set(p.id, p);
        this.on.status?.(); this.on.welcome?.(m);
      } else if (m.t === 'peer-join') { this.peers.set(m.peer.id, m.peer); this.on.join?.(m.peer); this.on.status?.(); }
      else if (m.t === 'peer-leave') { this.peers.delete(m.id); this.on.leave?.(m.id); this.on.status?.(); }
      else if (m.t === 'full') { this.status = 'full'; this.on.status?.(); }
      else this.on.msg?.(m);
    };
    ws.onclose = () => { if (this.ws !== ws) return; const ids = [...this.peers.keys()]; this.peers.clear(); this.ws = null; if (this.status !== 'full') this.status = 'offline'; ids.forEach(i => this.on.leave?.(i)); this.on.status?.(); };
    ws.onerror = () => { };
    this.on.status?.();
  }
  leave() { const ws = this.ws; if (ws) { this.ws = null; ws.close(); } const ids = [...this.peers.keys()]; this.peers.clear(); ids.forEach(i => this.on.leave?.(i)); this.status = 'offline'; this.id = null; this.on.status?.(); }
  send(m) { if (this.ws && this.ws.readyState === 1 && this.status === 'online') this.ws.send(JSON.stringify(m)); }
}
