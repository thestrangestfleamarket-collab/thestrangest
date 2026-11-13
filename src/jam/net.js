// STADIUM JAM's line to its room (the Jam Durable Object, /parties/jam/<room>); the game plays solo if it never connects
export class Net {
  constructor(handlers) {
    this.handlers = handlers;
    this.ws = null;
    this.join = null;
    this.connected = false;
    this.retry = 1000;
  }

  connect(join) {
    this.join = join;
    this._open();
  }

  _open() {
    const proto = location.protocol === 'https:' ? 'wss' : 'ws';
    let ws;
    try { ws = new WebSocket(`${proto}://${location.host}/parties/jam/${encodeURIComponent(this.join().room)}`); } catch { return; }
    this.ws = ws;
    ws.onopen = () => {
      this.retry = 1000;
      ws.send(JSON.stringify({ t: 'join', ...this.join() }));
    };
    ws.onmessage = (e) => {
      let m;
      try { m = JSON.parse(e.data); } catch { return; }
      if (m.t === 'welcome') this.connected = true;
      this.handlers[m.t]?.(m);
    };
    ws.onclose = () => {
      const was = this.connected;
      this.connected = false;
      if (was) this.handlers.disconnect?.();
      setTimeout(() => this._open(), this.retry);
      this.retry = Math.min(this.retry * 2, 15000);
    };
    ws.onerror = () => {};
  }

  send(msg) {
    if (this.connected && this.ws.readyState === 1) this.ws.send(JSON.stringify(msg));
  }
}
