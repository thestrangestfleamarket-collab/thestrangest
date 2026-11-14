// LASER TAG's line to its one public room (the Laser Durable Object, /parties/laser/public, two players at most); ?local&slot=0|1 links two tabs of one browser instead, for the check
export class Net {
  constructor(handlers) { this.h = handlers; this.ws = null; this.connected = false; this.retry = 1000; this.local = null; }

  connect(opts = {}) {
    if (opts.local) return this._local(opts.slot | 0);
    this._open();
  }

  _open() {
    const proto = location.protocol === 'https:' ? 'wss' : 'ws';
    let ws; try { ws = new WebSocket(`${proto}://${location.host}/parties/laser/public`); } catch { return; }
    this.ws = ws;
    ws.onopen = () => { this.retry = 1000; ws.send('{"t":"join"}'); };
    ws.onmessage = (e) => { let m; try { m = JSON.parse(e.data); } catch { return; }
      if (m.t === 'welcome') this.connected = true;
      if (m.t === 'full') { this.full = true; }
      this.h[m.t]?.(m); };
    ws.onclose = () => { const was = this.connected; this.connected = false; if (was) this.h.disconnect?.();
      if (this.full) return; setTimeout(() => this._open(), this.retry); this.retry = Math.min(this.retry * 2, 15000); };
    ws.onerror = () => {};
  }

  _local(slot) {
    const bc = new BroadcastChannel('laser-local'), id = 'p' + Math.random().toString(36).slice(2, 8);
    this.local = { bc, id };
    bc.onmessage = (e) => { const d = e.data; if (!d || d.from === id) return;
      if (d.hello) { this.h['peer-join']?.({ id: d.from, slot: d.slot }); if (d.hello === 1) bc.postMessage({ from: id, hello: 2, slot }); return; }
      if (d.bye) return this.h['peer-leave']?.({ id: d.from });
      this.h[d.m.t]?.({ ...d.m, id: d.from }); };
    this.connected = true;
    this.h.welcome?.({ id, slot, peers: [] });
    bc.postMessage({ from: id, hello: 1, slot });
    addEventListener('pagehide', () => bc.postMessage({ from: id, bye: 1 }));
  }

  send(msg) {
    if (this.local) return this.local.bc.postMessage({ from: this.local.id, m: msg });
    if (this.connected && this.ws?.readyState === 1) this.ws.send(JSON.stringify(msg));
  }
}
