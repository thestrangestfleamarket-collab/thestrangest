// SKIRMISH TABLE's match server (src/chess/): one room's two seats, its turn clock and every move, judged by the game's own rules (src/chess/game.js); the Chess Durable Object in door.js gives it sockets and storage
import * as G from "../src/chess/game.js";

const LETTERS = "ABCDEFGHJKLMNPQRSTUVWXYZ", IDLE_MS = 2 * 3600e3;   // a room nobody has used for two hours is forgotten
// a login's own record (Home, by /chess/save and /chess/load): saved teams [{ name, units: [{ type, dx, r }] }], each unit by its place from the middle column and the back row
const tidyTeams = a => (Array.isArray(a) ? a : []).slice(0, 12).map(t => ({ name: String((t && t.name) || "").replace(/[^\w '.-]/g, "").trim().slice(0, 24), units: (Array.isArray(t && t.units) ? t.units : []).slice(0, G.TEAM_MAX).filter(u => u && Object.hasOwn(G.TYPES, u.type) && Number.isInteger(u.dx) && Number.isInteger(u.r) && Math.abs(u.dx) <= 12 && u.r >= 0 && u.r < 8).map(u => ({ type: u.type, dx: u.dx, r: u.r })) })).filter(t => t.name && t.units.length);
const CHESS = {
  // store: { get, put } on this player's own key
  async load(store) { const v = (await store.get()) || {}; return { rec: { teams: tidyTeams(v.teams) } }; },
  async save(store, body) { const v = (await store.get()) || {}; if (Array.isArray(body.teams)) v.teams = tidyTeams(body.teams); await store.put(v); return { ok: true, teams: v.teams.length }; },
  G, IDLE_MS, CODE: /^[A-Z]{4}$/,
  code: () => { let c = ""; for (let i = 0; i < 4; i++) c += LETTERS[Math.floor(Math.random() * LETTERS.length)]; return c; },
  // a match: host is { room (kept), save() }; sockets map each socket to its seat (-1 a spectator, null not joined yet)
  Match: class {
    constructor(host) { this.host = host; this.sockets = new Map(); this.timer = null; }
    get room() { return this.host.room; }
    send(ws, msg) { try { ws.send(JSON.stringify(msg)); } catch (e) {} }
    started() { return this.room && this.room.tokens[0] && this.room.tokens[1] && this.room.state.phase !== 'setup'; }
    // while the sides set out, each sees only its own units
    view(seat) { const s = this.room.state; return s.phase === 'setup' ? { ...s, units: s.units.filter(u => u.owner === seat) } : s; }
    open(ws) { this.sockets.set(ws, null); }
    gone(ws) { if (this.sockets.delete(ws)) this.broadcast(); }
    broadcast(events = []) {
      if (!this.room) return;
      const seats = [...this.sockets.values()];
      const msg = { t: "state", events, deadline: this.room.deadline, now: Date.now(), present: [seats.includes(0), seats.includes(1)], started: !!this.started(), ready: this.room.ready || [true, true], seated: [!!this.room.tokens[0], !!this.room.tokens[1]] };
      for (const [ws, seat] of this.sockets) if (seat !== null) this.send(ws, { ...msg, state: this.view(seat) });
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
          this.host.room = { code, state: G.newGame(typeof m.map === 'string' ? m.map : 'board', { setup: true }), tokens: [null, null], ready: [false, false], deadline: null };
        } else if (!this.room) return this.send(ws, { t: "error", msg: "No room with that code" });
        const r = this.room;
        let seat = r.tokens.indexOf(token);
        if (seat === -1) { seat = r.tokens.indexOf(null); if (seat !== -1) { r.tokens[seat] = token; this.armTimer(true); } }
        else this.armTimer(false);   // back in the same seat: the clock keeps running
        this.sockets.set(ws, seat);
        this.host.save();
        this.send(ws, { t: "joined", code: r.code, you: seat });
        this.broadcast();
      } else if (m.t === "team" || m.t === "ready") {   // setting out: a side's team is checked by the rules; the match starts when both are ready
        const seat = this.sockets.get(ws), r = this.room;
        if (!r || seat == null || seat < 0) return;
        if (r.state.phase !== "setup") return this.send(ws, { t: "error", msg: "The match has started" });
        if (m.t === "team") {
          if (r.ready[seat]) return this.send(ws, { t: "error", msg: "You are ready: stand down to change your team" });
          const e = G.setTeam(r.state, seat, m.units);
          if (e) return this.send(ws, { t: "error", msg: e });
        } else {
          r.ready[seat] = !!m.on;
          if (r.ready[0] && r.ready[1] && r.tokens[0] && r.tokens[1]) { G.begin(r.state); this.armTimer(true); }
        }
        this.host.save();
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
