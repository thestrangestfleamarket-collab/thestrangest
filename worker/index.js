// SPACE FLEET's server: the page at / (and /space), its models, sky and sounds under /space-assets/, its one public room (the Space Durable Object, /parties/space/public) and the bot's admiral (POST /space/mind, Claude Haiku)
import { DurableObject } from "cloudflare:workers";
import { routePartykitRequest, Server } from "partyserver";
import { SPACE } from "./space.js";

const json = (o, status = 200) => new Response(JSON.stringify(o), { status, headers: { "content-type": "application/json", "cache-control": "no-store" } });
const hits = new Map(), tooMany = (key, n) => { const now = Date.now(), h = hits.get(key) || { t: now, n: 0 }; if (now - h.t > 60000) { h.t = now; h.n = 0; } h.n++; hits.set(key, h); if (hits.size > 5000) hits.clear(); return h.n > n; };
const ASSET = /^\/space-assets\/((m|snd)\/[A-Za-z0-9_-]+\.(glb|mp3)|tex\/[a-z0-9_]+\.jpg|stars\.json)$/;

export default {
  async fetch(request, env) {
    const url = new URL(request.url), p = url.pathname, dev = url.hostname === "localhost" || url.hostname === "127.0.0.1", get = request.method === "GET" || request.method === "HEAD";
    if (get && (p === "/" || p === "/space")) { const r = await env.ASSETS.fetch(new Request(url.origin + "/space", { headers: request.headers })), out = new Response(r.body, r); out.headers.set("cache-control", "no-cache"); return out; }
    if (p === "/space/") return Response.redirect(url.origin + "/space" + url.search, 301);
    if (get && ASSET.test(p)) { const r = await env.ASSETS.fetch(request), out = new Response(r.body, r); out.headers.set("cache-control", "public, max-age=3600"); return out; }
    if (request.method === "POST" && p === "/space/mind") {
      if (request.headers.get("Origin") !== url.origin && !(dev && !request.headers.get("Origin"))) return json({ why: "not from the game's page" }, 403);
      const key = "ip:" + (request.headers.get("CF-Connecting-IP") || "?"); let body; try { body = await request.json(); } catch (e) { body = {}; } if (!body || typeof body !== "object") body = {};
      if (!env.ANTHROPIC_API_KEY) return json({ why: "the server has no ANTHROPIC_API_KEY secret yet" }); if (tooMany(key, 24)) return json({ why: "too much at once, wait a minute" }, 429);
      const T = env.Tally.get(env.Tally.idFromName(key)); return json(await SPACE.think(env, { get: () => T.read(), put: v => T.write(v) }, body)); }
    if (p.startsWith("/parties/")) return (await routePartykitRequest(request, env, {
      onBeforeConnect: async (req, { party, name }) => { if (party !== "space" || name !== "public" || (request.headers.get("Origin") !== url.origin && !dev)) return new Response("not found", { status: 404 }); const r = new Request(req); r.headers.set("x-partykit-room", name); return r; },
    })) || new Response("not found", { status: 404 });
    return new Response("not found", { status: 404 });
  },
};

// the one public battle, two players; the first in is the host, whose pictures of the battle go to the other, whose orders come back (space.js says what passes)
export class Space extends Server {
  static options = { hibernate: false };
  peers(not) { const a = []; for (const o of this.getConnections()) if (o.id !== not && o.state) a.push({ id: o.id, ...o.state }); return a; }
  onMessage(c, raw) {
    if (typeof raw !== "string" || raw.length > 12000) return; let m; try { m = JSON.parse(raw); } catch (e) { return; }
    const now = Date.now(), rl = c.rl || (c.rl = { t: now, n: 0 }); if (now - rl.t > 1000) { rl.t = now; rl.n = 0; } if (++rl.n > 40) return;
    if (m && m.t === "join") { if (c.state) return; const peers = this.peers(c.id);
      if (peers.length >= SPACE.MAX) { c.send('{"t":"full"}'); return c.close(4002, "full"); }
      const st = { slot: SPACE.slot(peers.map(q => q.slot)) }; c.setState(st);
      c.send(JSON.stringify({ t: "welcome", id: c.id, slot: st.slot, peers })); return this.broadcast(JSON.stringify({ t: "peer-join", id: c.id, ...st }), [c.id]); }
    if (!c.state) return; const out = SPACE.clean(m, c.state.slot); if (!out) return;
    out.id = c.id; this.broadcast(JSON.stringify(out), [c.id]); }
  onClose(c) { if (c.state) this.broadcast(JSON.stringify({ t: "peer-leave", id: c.id }), [c.id]); }
  onError(c) { this.onClose(c); }
}

// each player's count of the admiral's calls today
export class Tally extends DurableObject {
  async read() { return (await this.ctx.storage.get("m")) || null; }
  async write(v) { await this.ctx.storage.put("m", v); }
}
