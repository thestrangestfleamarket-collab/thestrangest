// BREACHLINE: two-player transport. Default: WebRTC data channel brokered by PeerJS (room code = peer id suffix).
// `?net=local` swaps in a BroadcastChannel so two tabs on one machine can play without any server.
import { Peer } from 'peerjs';
const PREFIX = 'vrduel-x7-';
export const makeCode = () => Array.from({ length: 5 }, () => 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'[Math.floor(Math.random() * 32)]).join('');

export class Net {
  constructor() { this.open = false; this.isHost = false; this.onOpen = () => {}; this.onMsg = () => {}; this.onClose = () => {}; this.onStatus = () => {}; this.local = new URLSearchParams(location.search).get('net') === 'local'; }

  host(code) {
    this.isHost = true; this.code = code;
    if (this.local) return this._bc(code);
    this.peer = new Peer(PREFIX + code);
    this.peer.on('open', () => this.onStatus('Waiting for opponent — share code ' + code));
    this.peer.on('connection', (c) => { if (this.conn && this.conn.open) { c.close(); return; } this._wire(c); });
    this.peer.on('error', (e) => this.onStatus('Network error: ' + (e.type === 'unavailable-id' ? 'code already in use, try again' : e.type)));
    this.peer.on('disconnected', () => { try { this.peer.reconnect(); } catch (e) { /* destroyed */ } });
  }
  join(code) {
    this.isHost = false; this.code = code;
    if (this.local) return this._bc(code);
    this.peer = new Peer();
    this.peer.on('open', () => { this.onStatus('Connecting to ' + code + '…'); this._wire(this.peer.connect(PREFIX + code, { reliable: true, serialization: 'json' })); });
    this.peer.on('error', (e) => this.onStatus(e.type === 'peer-unavailable' ? 'No match found with code ' + code : 'Network error: ' + e.type));
  }
  _wire(c) {
    this.conn = c;
    c.on('open', () => { this.open = true; this.onOpen(); });
    c.on('data', (d) => this.onMsg(d));
    c.on('close', () => { this.open = false; this.onClose(); });
    c.on('error', () => { this.open = false; this.onClose(); });
  }
  _bc(code) {
    this.bc = new BroadcastChannel(PREFIX + code);
    this.bc.onmessage = (e) => {
      const m = e.data;
      if (m.t === '_hello') { if (!this.open) { this.open = true; this.bc.postMessage({ t: '_hello' }); this.onOpen(); } return; }
      if (m.t === '_bye') { this.open = false; this.onClose(); return; }
      this.onMsg(m);
    };
    this.bc.postMessage({ t: '_hello' });
    addEventListener('pagehide', () => this.bc.postMessage({ t: '_bye' }));
    this.onStatus(this.isHost ? 'Waiting for opponent — share code ' + code : 'Connecting to ' + code + '…');
  }
  send(m) {
    if (!this.open) return;
    if (this.bc) this.bc.postMessage(m); else if (this.conn && this.conn.open) this.conn.send(m);
  }
}
