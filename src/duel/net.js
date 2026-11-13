// Peer-to-peer link between the two players.
// Default: WebRTC data channel via PeerJS (public signalling server, game data goes direct).
// `local: true` uses BroadcastChannel instead — two tabs of one browser, for testing.
import { Peer } from 'peerjs';

const PREFIX = 'arduel-v1-';

function makeLink(sendFn, closeFn) {
  return { send: sendFn, close: closeFn, onmessage: null, onclose: null };
}

function connectLocal(code, host) {
  return new Promise((resolve) => {
    const bc = new BroadcastChannel(PREFIX + code);
    const me = host ? 'h' : 'g';
    let link = null;
    const open = () => {
      if (link) return;
      link = makeLink((d) => bc.postMessage({ from: me, d }), () => bc.close());
      resolve(link);
    };
    bc.onmessage = (e) => {
      const m = e.data;
      if (!m || m.from === me) return;
      if (m.hello) { if (host) bc.postMessage({ from: me, hello: 1 }); open(); return; }
      link?.onmessage?.(m.d);
    };
    if (!host) bc.postMessage({ from: me, hello: 1 });
  });
}

function connectPeer(code, host, onStatus) {
  return new Promise((resolve, reject) => {
    const peer = host ? new Peer(PREFIX + code) : new Peer();
    const wire = (conn) => {
      const link = makeLink((d) => { if (conn.open) conn.send(d); }, () => peer.destroy());
      conn.on('data', (d) => link.onmessage?.(d));
      conn.on('close', () => link.onclose?.());
      conn.on('error', () => link.onclose?.());
      resolve(link);
    };
    peer.on('error', (err) => {
      const msg = err.type === 'unavailable-id' ? 'That room code is already in use - try again.'
        : err.type === 'peer-unavailable' ? 'No room with that code. Check the code and that the host is waiting.'
        : 'Connection error: ' + (err.type || err.message);
      onStatus?.(msg);
      reject(new Error(msg));
    });
    peer.on('open', () => {
      if (host) {
        onStatus?.('Waiting for opponent to join...');
        peer.on('connection', (conn) => conn.on('open', () => wire(conn)));
      } else {
        onStatus?.('Connecting to host...');
        const conn = peer.connect(PREFIX + code, { reliable: true, serialization: 'json' });
        conn.on('open', () => wire(conn));
      }
    });
  });
}

export function connect({ code, host, local, onStatus }) {
  code = String(code).trim().toUpperCase();
  return local ? connectLocal(code, host) : connectPeer(code, host, onStatus);
}

export function randomCode() {
  const abc = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  let s = '';
  for (let i = 0; i < 4; i++) s += abc[Math.floor(Math.random() * abc.length)];
  return s;
}
