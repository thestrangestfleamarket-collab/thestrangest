// SKIRMISH TABLE's match server (src/chess/): one room's two seats, its turn clock and every move, judged by the game's own rules (src/chess/game.js); the Chess Durable Object in door.js gives it sockets and storage
import * as G from "../src/chess/game.js";
import * as AI from "../src/chess/ai.js";
import { CAMPAIGN, nodeOf, budgetFor, isOpen } from "../src/chess/campaign.js";

const LETTERS = "ABCDEFGHJKLMNPQRSTUVWXYZ", IDLE_MS = 2 * 3600e3;   // a room nobody has used for two hours is forgotten
// a login's own record (Home, by /chess/save and /chess/load): saved teams [{ name, units: [{ type, dx, r }] }], each unit by its place from the middle column and the back row
const tidyTeams = a => (Array.isArray(a) ? a : []).slice(0, 12).map(t => ({ name: String((t && t.name) || "").replace(/[^\w '.-]/g, "").trim().slice(0, 24), units: (Array.isArray(t && t.units) ? t.units : []).slice(0, G.TEAM_MAX).filter(u => u && Object.hasOwn(G.TYPES, u.type) && Number.isInteger(u.dx) && Number.isInteger(u.r) && Math.abs(u.dx) <= 12 && u.r >= 0 && u.r < 8).map(u => ({ type: u.type, dx: u.dx, r: u.r })) })).filter(t => t.name && t.units.length);
const tidyXp = x => { const o = {}; for (const k of Object.keys(G.UPGRADES)) { const n = Math.floor(+(x && x[k]) || 0); if (n > 0) o[k] = Math.min(999, n); } return o; };
const tidyDone = a => [...new Set((Array.isArray(a) ? a : []).filter(id => typeof id === "string" && nodeOf(id)))];
const CHESS = {
  AI, CAMPAIGN,
  // store: { get, put } on this player's own key
  // the campaign's battles won (camp.done) are written only by the room, when the rules say the battle is won
  // experience (xp) is written only by the room, when a match ends; the upgrades taken (ups) are the page's to choose, cut to what that experience allows
  async award(store, gains) { const v = (await store.get()) || {}, xp = tidyXp(v.xp); for (const [k, n] of Object.entries(gains)) if (Object.hasOwn(G.UPGRADES, k)) xp[k] = Math.min(999, (xp[k] || 0) + Math.max(0, Math.floor(n))); v.xp = xp; await store.put(v); },
  async load(store) { const v = (await store.get()) || {}; return { rec: { xp: tidyXp(v.xp), ups: G.tidyUps(v.ups, tidyXp(v.xp)), teams: tidyTeams(v.teams), company: tidyTeams([{ name: "company", units: v.company }])[0]?.units || [], camp: { done: tidyDone(v.camp && v.camp.done) } } }; },
  async save(store, body) { const v = (await store.get()) || {}; if (Array.isArray(body.teams)) v.teams = tidyTeams(body.teams); if (body.ups && typeof body.ups === "object") v.ups = G.tidyUps(body.ups, tidyXp(v.xp)); if (Array.isArray(body.company)) v.company = tidyTeams([{ name: "company", units: body.company }])[0]?.units || []; await store.put(v); return { ok: true, teams: (v.teams || []).length }; },
  async won(store, node) { const v = (await store.get()) || {}; v.camp = { done: tidyDone([...((v.camp && v.camp.done) || []), node]) }; await store.put(v); },
  G, IDLE_MS, CODE: /^[A-Z]{4}$/,
  code: () => { let c = ""; for (let i = 0; i < 4; i++) c += LETTERS[Math.floor(Math.random() * LETTERS.length)]; return c; },
  // a match: host is { room (kept), save() }; sockets map each socket to its seat (-1 a spectator, null not joined yet)
  Match: class {
    constructor(host) { this.host = host; this.sockets = new Map(); this.ids = new Map(); this.timer = null; this.aiTimer = null; this.aiPlan = []; }
    get room() { return this.host.room; }
    send(ws, msg) { try { ws.send(JSON.stringify(msg)); } catch (e) {} }
    started() { return this.room && this.room.tokens[0] && this.room.tokens[1] && this.room.state.phase !== 'setup'; }
    // while the sides set out, each sees only its own units
    view(seat) { const s = this.room.state; return s.phase === 'setup' ? { ...s, units: s.units.filter(u => u.owner === seat) } : s; }
    open(ws, pid = "") { this.sockets.set(ws, null); this.ids.set(ws, pid); }
    gone(ws) { this.ids.delete(ws); if (this.sockets.delete(ws)) this.broadcast(); }
    // the computer's seat (seat 1 of a solo room): when it is its turn it plans by what a player would see (ai.js) and its actions go through the rules like anyone's, a step at a time so the page can show them
    aiSoon(delay = 700) {
      clearTimeout(this.aiTimer); const r = this.room;
      if (!r || !r.ai || r.state.phase === "setup" || r.state.winner !== null || r.state.turn !== 1) { this.aiPlan = []; return; }
      this.aiTimer = setTimeout(() => this.aiStep(), delay);
    }
    aiStep() {
      const r = this.room; if (!r || !r.ai || r.state.phase === "setup" || r.state.winner !== null || r.state.turn !== 1) return false;
      if (!this.aiPlan.length) this.aiPlan = AI.plan(r.state, 1, r.ai.level);
      let res = G.apply(r.state, 1, this.aiPlan.shift());
      if (!res.ok) { this.aiPlan = []; res = G.apply(r.state, 1, { type: "end" }); }
      this.after(res.ok ? res.events : []);
      return true;
    }
    after(events) { this.finish(); this.host.save(); this.broadcast(events); this.aiSoon(800); }
    // a battle of the campaign won by the rules is written to the login's own record
    finish() {
      const r = this.room; if (!r || r.state.winner === null || r.over) return;
      r.over = true;
      const jobs = [];
      if (r.camp && r.state.winner === 0 && r.ids && r.ids[0] && this.host.store) jobs.push(() => CHESS.won(this.host.store(r.ids[0]), r.camp));
      // what each login's unit types earned (half in a plain match against the computer); never both seats for one login
      for (const seat of [0, 1]) { const pid = r.ids && r.ids[seat]; if (!pid || !this.host.store || (seat === 1 && pid === r.ids[0])) continue;
        const g = G.earned(r.state, seat); if (r.ai && !r.camp) for (const k in g) g[k] = Math.ceil(g[k] / 2);
        if (Object.keys(g).length) jobs.push(() => CHESS.award(this.host.store(pid), g)); }
      jobs.reduce((p, j) => p.then(j), Promise.resolve()).catch(() => {});
    }
    broadcast(events = []) {
      if (!this.room) return;
      const seats = [...this.sockets.values()];
      const r = this.room, msg = { t: "state", events, deadline: r.deadline, now: Date.now(), present: [seats.includes(0), seats.includes(1) || !!r.ai], started: !!this.started(), ready: r.ready || [true, true], seated: [!!r.tokens[0], !!r.tokens[1]], solo: r.ai ? r.ai.level : null, camp: r.camp || null, open: !!(r.open || r.ai) };
      for (const [ws, seat] of this.sockets) if (seat !== null) this.send(ws, { ...msg, state: this.view(seat) });
    }
    armTimer(fresh) {
      clearTimeout(this.timer);
      const r = this.room;
      if (!this.started() || r.state.winner !== null || r.ai) { r.deadline = null; return; }   // no clock against the computer
      if (fresh || !r.deadline) r.deadline = Date.now() + (this.host.turnSeconds || G.TURN_SECONDS) * 1000;
      this.timer = setTimeout(() => {
        const res = G.apply(r.state, r.state.turn, { type: "end" });
        if (res.ok) { this.armTimer(true); this.host.save(); this.broadcast(res.events); }
      }, Math.max(0, r.deadline - Date.now()));
    }
    async message(ws, code, raw) {
      if (typeof raw !== "string" || raw.length > 4096) return;
      let m; try { m = JSON.parse(raw); } catch (e) { return; }
      if (!m || typeof m !== "object") return;
      if (m.t === "create" || m.t === "join") {
        if (this.sockets.get(ws) !== null) return;
        const token = String(m.token || "").slice(0, 64);
        if (!token) return this.send(ws, { t: "error", msg: "Missing player token" });
        if (m.t === "create") {
          if (this.room) return this.send(ws, { t: "error", msg: "That room code was just taken, please try again" });
          // a duel (two seats), a match against the computer (solo: its level), or a battle of the campaign (camp: its id; open by the battles this login has won, or for anyone else by the ones their page says)
          const pid = this.ids.get(ws) || "", n = typeof m.camp === "string" ? nodeOf(m.camp) : null;
          let map = typeof m.map === "string" ? m.map : "board", ai = null, budget = G.BUDGET;
          if (typeof m.camp === "string") {
            const rec = pid && this.host.store ? await CHESS.load(this.host.store(pid)) : null, done = rec ? rec.rec.camp.done : tidyDone(m.done);
            if (this.room) return this.send(ws, { t: "error", msg: "That room code was just taken, please try again" });
            if (!n || !isOpen(n.id, done)) return this.send(ws, { t: "error", msg: "That battle is not open yet" });
            map = n.map; ai = { level: n.level }; budget = budgetFor(done);
          } else if (typeof m.solo === "string" && Object.hasOwn(AI.LEVELS, m.solo)) ai = { level: m.solo };
          const state = G.newGame(map, { setup: true, budget });
          if (n) G.placeTeam(state, 1, n.enemy.map(([type, x, y]) => ({ type, x, y })));
          if (budget < G.BUDGET) { const t = G.defaultTeam(map, 0); while (G.teamCost(t) > budget) t.pop(); G.setTeam(state, 0, t); }
          // a duel is fair unless its host opens it: upgrades count only in an open match, or against the computer
          this.host.room = { code, state, tokens: [null, ai ? "computer" : null], ready: [false, !!ai], deadline: null, ai, camp: n ? n.id : null, ids: ["", ""], open: !!m.open && !ai, ups: [null, null] };
        } else if (!this.room) return this.send(ws, { t: "error", msg: "No room with that code" });
        const r = this.room;
        let seat = r.tokens.indexOf(token);
        if (seat === -1 && token !== "computer") { seat = r.tokens.indexOf(null); if (seat !== -1) { r.tokens[seat] = token; if (r.ids) r.ids[seat] = this.ids.get(ws) || ""; this.armTimer(true);
          // the seat's upgrades: a login's from its record; against the computer, anyone else's as their own browser gives them (cut to what its experience allows)
          if ((r.open || r.ai) && r.ups && r.state.phase === "setup") { const pid = r.ids[seat];
            const prog = pid && this.host.store ? (await CHESS.load(this.host.store(pid))).rec : r.ai && m.prog && typeof m.prog === "object" ? { xp: tidyXp(m.prog.xp), ups: m.prog.ups } : null;
            if (prog) { r.ups[seat] = G.upsOf(G.tidyUps(prog.ups, prog.xp)); G.setTeam(r.state, seat, r.state.units.filter(u => u.owner === seat).map(u => ({ type: u.type, x: u.x, y: u.y })), r.ups[seat]); } } } }
        else this.armTimer(false);   // back in the same seat: the clock keeps running
        this.sockets.set(ws, seat);
        this.host.save();
        this.send(ws, { t: "joined", code: r.code, you: seat });
        this.broadcast(); this.aiSoon();
      } else if (m.t === "team" || m.t === "ready") {   // setting out: a side's team is checked by the rules; the match starts when both are ready
        const seat = this.sockets.get(ws), r = this.room;
        if (!r || seat == null || seat < 0) return;
        if (r.state.phase !== "setup") return this.send(ws, { t: "error", msg: "The match has started" });
        if (m.t === "team") {
          if (r.ready[seat]) return this.send(ws, { t: "error", msg: "You are ready: stand down to change your team" });
          const e = G.setTeam(r.state, seat, m.units, r.ups && r.ups[seat]);
          if (e) return this.send(ws, { t: "error", msg: e });
        } else {
          r.ready[seat] = !!m.on;
          if (r.ready[0] && r.ready[1] && r.tokens[0] && r.tokens[1]) { G.begin(r.state); this.armTimer(true); }
        }
        this.host.save();
        this.broadcast(); this.aiSoon();
      } else if (m.t === "act") {
        const seat = this.sockets.get(ws), r = this.room;
        if (!r || seat == null || seat < 0) return;
        if (!this.started()) return this.send(ws, { t: "error", msg: "Waiting for an opponent" });
        const before = r.state.turn, res = G.apply(r.state, seat, m.action);
        if (!res.ok) return this.send(ws, { t: "error", msg: res.error });
        if (r.state.turn !== before || r.state.winner !== null) this.armTimer(true);
        this.after(res.events);
      }
    }
  },
};
export { CHESS };
