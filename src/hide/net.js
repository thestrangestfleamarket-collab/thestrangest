// DEAD END for two: a link between the one who hides (the host, whose page runs the alley) and the one who hunts. PeerJS introduces the two browsers and the game's words then pass directly; `local` uses a BroadcastChannel between two tabs, for the check.
import { Peer } from 'peerjs';

const PREFIX = 'deadend-v1-';
const link = (send, close) => ({ send, close, onmessage: null, onclose: null });
function local(code, host) { return new Promise(res => { const bc = new BroadcastChannel(PREFIX + code), me = host ? 'h' : 'g'; let L = null; const open = () => { if (L) return; L = link(d => bc.postMessage({ from: me, d }), () => bc.close()); res(L); };
  bc.onmessage = e => { const m = e.data; if (!m || m.from === me) return; if (m.hello) { if (host) bc.postMessage({ from: me, hello: 1 }); open(); return; } if (L && L.onmessage) L.onmessage(m.d); }; if (!host) bc.postMessage({ from: me, hello: 1 }); }); }
function peer(code, host, say) { return new Promise((res, rej) => { const p = host ? new Peer(PREFIX + code) : new Peer();
  const wire = c => { const L = link(d => { if (c.open) c.send(d); }, () => p.destroy()); c.on('data', d => L.onmessage && L.onmessage(d)); c.on('close', () => L.onclose && L.onclose()); c.on('error', () => L.onclose && L.onclose()); res(L); };
  p.on('error', e => { const m = e.type === 'unavailable-id' ? 'That code is in use: pick another.' : e.type === 'peer-unavailable' ? 'Nobody is waiting with that code.' : 'The link failed: ' + (e.type || e.message); say(m); rej(new Error(m)); });
  p.on('open', () => { if (host) { say('Waiting for the other player. Code: ' + code); p.on('connection', c => c.on('open', () => wire(c))); } else { say('Joining ' + code + '…'); const c = p.connect(PREFIX + code, { reliable: true, serialization: 'json' }); c.on('open', () => wire(c)); } }); }); }
const connect = (code, host, isLocal, say) => { code = String(code).trim().toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 12); return isLocal ? local(code, host) : peer(code, host, say || (() => {})); };
export { connect };
