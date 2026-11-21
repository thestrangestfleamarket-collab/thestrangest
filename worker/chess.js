// SKIRMISH TABLE's match server (src/chess/): one room's two seats, its turn clock and every move, judged by the game's own rules (src/chess/game.js); the Chess Durable Object in door.js gives it sockets and storage
import * as G from "../src/chess/game.js";

const LETTERS = "ABCDEFGHJKLMNPQRSTUVWXYZ", IDLE_MS = 2 * 3600e3;   // a room nobody has used for two hours is forgotten
const CHESS = {
  G, IDLE_MS, CODE: /^[A-Z]{4}$/,
  code: () => { let c = ""; for (let i = 0; i < 4; i++) c += LETTERS[Math.floor(Math.random() * LETTERS.length)]; return c; },
  // a match: host is { room (kept), save() }; sockets map each socket to its seat (-1 a spectator, null not joined yet)
  Match: class {
    constructor(host) { this.host = host; this.sockets = new Map(); this.timer = null; }
    get room() { return this.host.room; }
    send(ws, msg) { try { ws.send(JSON.stringify(msg)); } catch (e) {} }
    started() { return this.room && this.room.tokens[0] && this.room.tokens[1]; }
    open(ws) { this.sockets.set(ws, null); }
    gone(ws) { if (this.sockets.delete(ws)) this.broadcast(); }
    broadcast(events = []) {
      if (!this.room) return;
      const seats = [...this.sockets.values()];
      const msg = { t: "state", state: this.room.state, events, deadline: this.room.deadline, now: Date.now(), present: [seats.includes(0), seats.includes(1)], started: !!this.started() };
      for (const [ws, seat] of this.sockets) if (seat !== null) this.send(ws, msg);
    }
    armTimer(fresh) {
      clearTimeout(this.timer);
      const r = this.room;
      if (!this.started() || r.state.winner !== null) { r.deadline = null; return; }
      if (fresh || !r.deadline) r.deadline = Date.now() + G.TURN_SECONDS * 1000;
      this.timer = setTimeout(() => {
        const res = G.apply(r.state, r.state.turn, { type: "end" });
        if (res.ok) { this.armTimer(true); this.host.save(); this.broadcast(res.events); }
      }, Math.max(0, r.deadline - Date.now()));
    }
    message(ws, code, raw) {
      if (typeof raw !== "string" || raw.length > 4096) return;
      let m; try { m = JSON.parse(raw); } catch (e) { return; }
      if (!m || typeof m !== "object") return;
      if (m.t === "create" || m.t === "join") {
        if (this.sockets.get(ws) !== null) return;
        const token = String(m.token || "").slice(0, 64);
        if (!token) return this.send(ws, { t: "error", msg: "Missing player token" });
        if (m.t === "create") {
          if (this.room) return this.send(ws, { t: "error", msg: "That room code was just taken, please try again" });
          this.host.room = { code, state: G.newGame(typeof m.map === 'string' ? m.map : 'board'), tokens: [null, null], deadline: null };
        } else if (!this.room) return this.send(ws, { t: "error", msg: "No room with that code" });
        const r = this.room;
        let seat = r.tokens.indexOf(token);
        if (seat === -1) { seat = r.tokens.indexOf(null); if (seat !== -1) { r.tokens[seat] = token; this.armTimer(true); } }
        else this.armTimer(false);   // back in the same seat: the clock keeps running
        this.sockets.set(ws, seat);
        this.host.save();
        this.send(ws, { t: "joined", code: r.code, you: seat });
        this.broadcast();
      } else if (m.t === "act") {
        const seat = this.sockets.get(ws), r = this.room;
        if (!r || seat == null || seat < 0) return;
        if (!this.started()) return this.send(ws, { t: "error", msg: "Waiting for an opponent" });
        const before = r.state.turn, res = G.apply(r.state, seat, m.action);
        if (!res.ok) return this.send(ws, { t: "error", msg: res.error });
        if (r.state.turn !== before || r.state.winner !== null) this.armTimer(true);
        this.host.save();
        this.broadcast(res.events);
      }
    }
  },
};
export { CHESS };
