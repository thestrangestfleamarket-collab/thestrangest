import { routePartykitRequest, Server } from "partyserver";
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i, CODE = /^[A-Z0-9-]{6,32}$/, MAIL = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
const json = (o, status = 200) => Response.json(o, { status, headers: { "cache-control": "no-store" } });
const loopback = ip => !ip || ip === "::1" || ip === "localhost" || /^127\./.test(ip) || /^::ffff:127\./.test(ip);
const ROOM = /^[a-z0-9-]{1,32}$/, GUESS_MAX = 20, guesses = new Map(), passed = new Map(), FILE = /^\/g\/[a-z0-9-]+\.[0-9a-f]{10}\.(js|json|bin)$/;
const YT = /^\/yt\/([A-Za-z0-9_-]{11})\.jpg$/, BLANK = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYGD4DwABBAEAHnOcQAAAAABJRU5ErkJggg==";
function tooMany(ip) { const min = Math.floor(Date.now() / 60000), g = guesses.get(ip);
  if (!g || g.min !== min) { if (guesses.size > 5000) for (const [k, v] of guesses) if (v.min !== min) guesses.delete(k); guesses.set(ip, { n: 1, min }); return false; }
  return ++g.n > GUESS_MAX; }

export default {
  async fetch(request, env) {
    const url = new URL(request.url), p = url.pathname, dev = env.DEV_AUTH === "1" && loopback(request.headers.get("CF-Connecting-IP"));
    if ((request.method === "GET" || request.method === "HEAD") && (p === "/" || p === "/index.html")) {
      const ok = await inside(env, request, dev);
      const out = ok ? await page(env, url, "/g/market", request, "private, no-cache") : await page(env, url, "/door", request, "no-cache");
      out.headers.set("vary", "Cookie"); return out; }
    if ((request.method === "GET" || request.method === "HEAD") && FILE.test(p)) {
      if (!(await inside(env, request, dev))) return new Response("not found", { status: 404 });
      const r = await env.ASSETS.fetch(new Request(url.origin + p)); if (!r.ok) return new Response("not found", { status: 404 });
      const gz = p.endsWith(".bin"), out = gz ? new Response(r.body, { status: r.status, headers: r.headers, encodeBody: "manual" }) : new Response(r.body, r);
      if (gz) { out.headers.set("content-type", "application/octet-stream"); out.headers.set("content-encoding", "gzip"); }
      out.headers.set("cache-control", "private, max-age=31536000, immutable"); out.headers.set("x-robots-tag", "noindex"); return out; }
    if (request.method === "GET" && p === "/now") {
      let r = null; try { r = await fetch("https://jvcetttmqseoteidfggn.supabase.co/rest/v1/now_playing?select=*&id=eq.theatre", { headers: { apikey: "sb_publishable_UkzD8hOizW1hPr6hm3duQQ_07ZodPik" } }); } catch (e) {}
      const out = new Response(r && r.ok ? r.body : "[]", { status: 200 }); out.headers.set("content-type", "application/json"); out.headers.set("cache-control", "no-store"); return out; }
    if (request.method === "GET" || request.method === "HEAD") { const m = YT.exec(p); if (m) {
      let r = null; try { r = await fetch("https://i.ytimg.com/vi/" + m[1] + "/hqdefault.jpg"); } catch (e) {}
      const miss = !r || !r.ok, out = miss ? new Response(Uint8Array.from(atob(BLANK), c => c.charCodeAt(0)), { status: 200 }) : new Response(r.body, { status: r.status });
      out.headers.set("content-type", miss ? "image/png" : "image/jpeg"); out.headers.set("access-control-allow-origin", "*");
      out.headers.set("cache-control", "public, max-age=86400"); out.headers.set("x-robots-tag", "noindex"); return out; } }
    if (p.startsWith("/parties/")) return (await routePartykitRequest(request, env, {
      onBeforeConnect: async (req, { party, name }) => {
        if (party !== "block" || !ROOM.test(name) || (request.headers.get("Origin") !== url.origin && !dev)) return new Response("not found", { status: 404 });
        const id = await who(env, request, dev); if (!id) return new Response("login", { status: 401 });
        const r = new Request(req); r.headers.set("x-tsfm-id", id); r.headers.set("x-partykit-room", name); return r; },
      onBeforeRequest: () => new Response("not found", { status: 404 }) })) || new Response("not found", { status: 404 });
    if (request.method !== "POST" || !["/enter", "/join/check", "/join"].includes(p)) return new Response("not found", { status: 404 });
    if (request.headers.get("Origin") !== url.origin && !(dev && !request.headers.get("Origin"))) return json({ why: "not from the game's page" }, 403);
    if (tooMany(request.headers.get("CF-Connecting-IP") || "local")) return json({ why: "too many tries, wait a minute" }, 429);
    if (p === "/enter") { const t = (request.headers.get("Authorization") || "").replace(/^Bearer\s+/i, ""); return json(t && t.length < 5000 ? await pass(env, t, dev) : { why: "login" }); }
    let body; try { body = await request.json(); } catch (e) { body = null; } if (!body || typeof body !== "object") return json({ why: "bad message" }, 400);
    const k = svc(env); if (!k) return json({ why: "the market can't take new tenants yet (the server has no key to make accounts)" });
    const code = String(body.code || "").trim().toUpperCase(); if (!CODE.test(code) || !(await codeOk(env, k, code))) return json({ why: "code" });
    return p === "/join/check" ? json({ ok: true }) : json(await join(env, k, code, body));
  }
};

async function who(env, request, dev) {
  const m = /(?:^|;\s*)tsfm-pass=([^;]+)/.exec(request.headers.get("Cookie") || ""); if (!m) return "";
  const t = decodeURIComponent(m[1]), now = Date.now(), seen = passed.get(t); if (seen && seen.until > now) return seen.id;
  const r = await pass(env, t, dev); if (!r.ok) return "";
  if (passed.size > 2000) for (const [k, v] of passed) if (v.until <= now) passed.delete(k); passed.set(t, { until: now + 300000, id: r.id });
  return r.id;
}
const inside = async (env, request, dev) => !!(await who(env, request, dev));

async function page(env, url, path, request, cache) {
  const h = new Headers(); const inm = request.headers.get("If-None-Match"); if (inm) h.set("If-None-Match", inm);
  const r = await env.ASSETS.fetch(new Request(url.origin + path, { headers: h })), out = new Response(r.body, r);
  out.headers.set("cache-control", cache); out.headers.set("x-robots-tag", "noindex"); return out;
}

async function pass(env, token, dev) {
  if (dev && token.startsWith("dev:")) return { ok: true, id: "dev-" + token.slice(4, 40) };
  const headers = { apikey: env.SUPABASE_KEY, Authorization: "Bearer " + token }, get = path => fetch(env.SUPABASE_URL + path, { headers });
  const r = await get("/auth/v1/user"); if (!r.ok) return { why: "login" };
  const u = await r.json(); if (!u || !UUID.test(u.id || "")) return { why: "login" };
  const pr = await get("/rest/v1/players?select=id&id=eq." + u.id);
  return pr.ok && (await pr.json()).length > 0 ? { ok: true, id: u.id } : { why: "code" };
}

const svc = env => { const k = env.SUPABASE_SERVICE_KEY; return k ? { apikey: k, ...(k.startsWith("ey") ? { Authorization: "Bearer " + k } : {}) } : null; };
async function codeOk(env, k, code) {
  const r = await fetch(env.SUPABASE_URL + "/rest/v1/invite_codes?select=uses,max_uses&code=eq." + encodeURIComponent(code), { headers: k });
  const c = r.ok ? (await r.json())[0] : null; return !!c && c.uses < c.max_uses;
}

async function join(env, k, code, body) {
  const email = String(body.email || "").trim().toLowerCase(), password = String(body.password || "");
  if (!MAIL.test(email) || email.length > 200) return { why: "email" };
  if (password.length < 8 || password.length > 200) return { why: "short" };
  const call = (path, init) => fetch(env.SUPABASE_URL + path, init), J = { "content-type": "application/json" };
  const made = await call("/auth/v1/admin/users", { method: "POST", headers: { ...k, ...J }, body: JSON.stringify({ email, password, email_confirm: true }) });
  if (!made.ok) { const t = await made.text(); return { why: /already|exists|registered/i.test(t) ? "exists" : "could not make the account (" + made.status + ")" }; }
  const user = await made.json(), uid = user && (user.id || user.user && user.user.id);
  const tk = await call("/auth/v1/token?grant_type=password", { method: "POST", headers: { apikey: env.SUPABASE_KEY, ...J }, body: JSON.stringify({ email, password }) });
  const s = tk.ok ? await tk.json() : null, gone = () => UUID.test(uid || "") && call("/auth/v1/admin/users/" + uid, { method: "DELETE", headers: k });
  if (!s || !s.access_token) { await gone(); return { why: "could not log in to the new account (" + tk.status + ")" }; }
  const joined = (await call("/rest/v1/rpc/join_beta", { method: "POST", headers: { apikey: env.SUPABASE_KEY, Authorization: "Bearer " + s.access_token, ...J }, body: JSON.stringify({ invite: code }) })).ok;
  if (!joined) { await gone(); return { why: "code" }; }
  return { ok: true, access_token: s.access_token, refresh_token: s.refresh_token };
}

const num = (v, lo, hi) => typeof v === "number" && isFinite(v) ? Math.max(lo, Math.min(hi, v)) : 0;
const word = (v, n) => String(v ?? "").replace(/[\u0000-\u001f\u007f<>]/g, "").trim().slice(0, n);
export class Block extends Server {
  static options = { hibernate: true };
  roster(skip) { const by = new Map(); for (const c of this.getConnections()) if (c.id !== skip && c.state && c.state.id) by.set(c.state.id, c.state); return [...by.values()]; }
  onConnect(c, ctx) {
    const id = ctx.request.headers.get("x-tsfm-id") || ""; if (!id) return c.close(4001, "login");
    for (const o of this.getConnections()) if (o.id !== c.id && o.state && o.state.id === id) o.close(4000, "joined again");
    c.setState({ id, name: "", look: "", at: null });
    c.send(JSON.stringify({ t: "hi", you: id, all: this.roster().filter(p => p.id !== id) }));
  }
  onMessage(c, raw) {
    const s = c.state; if (!s || typeof raw !== "string" || raw.length > 600) return; let m; try { m = JSON.parse(raw); } catch (e) { return; }
    if (m.t === "mv" && Array.isArray(m.at)) {
      const a = m.at, at = [num(a[0], -1e5, 1e5), num(a[1], -1e5, 1e5), num(a[2], -1e4, 1e4), num(a[3], -10, 10), word(a[4], 8), word(a[5], 60)];
      c.setState({ ...s, at }); this.broadcast(JSON.stringify({ t: "mv", id: s.id, at }), [c.id]);
    } else if (m.t === "me") {
      const p = { ...s, name: word(m.name, 24), look: word(m.look, 24) }; c.setState(p); this.broadcast(JSON.stringify({ t: "in", p }), [c.id]);
    } else if (m.t === "say") {
      const text = word(m.text, 200); if (text) this.broadcast(JSON.stringify({ t: "say", id: s.id, name: s.name, text }), [c.id]);
    }
  }
  onClose(c) { const s = c.state; if (s && s.id && !this.roster(c.id).some(p => p.id === s.id)) this.broadcast(JSON.stringify({ t: "out", id: s.id })); }
}
