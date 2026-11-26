// BALL's line to its one public room (the Ball Durable Object, /parties/ball/public, eight players at most); the game plays alone if it never connects
export class Net {
  constructor(handlers) { this.handlers = handlers; this.ws = null; this.connected = false; this.retry = 1000; }
  open() { const proto = location.protocol === 'https:' ? 'wss' : 'ws'; let ws; try { ws = new WebSocket(`${proto}://${location.host}/parties/ball/public`); } catch { return; } this.ws = ws;
    ws.onopen = () => { this.retry = 1000; ws.send('{"t":"join"}'); };
    ws.onmessage = e => { let m; try { m = JSON.parse(e.data); } catch { return; } if (m.t === 'welcome') this.connected = true; this.handlers[m.t]?.(m); };
    ws.onclose = () => { const was = this.connected; this.connected = false; if (was) this.handlers.disconnect?.(); setTimeout(() => this.open(), this.retry); this.retry = Math.min(this.retry * 2, 30000); };
    ws.onerror = () => {}; }
  send(msg) { if (this.connected && this.ws.readyState === 1) this.ws.send(JSON.stringify(msg)); }
}
