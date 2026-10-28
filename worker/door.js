import { DurableObject } from "cloudflare:workers";
import { getServerByName, routePartykitRequest, Server } from "partyserver";
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i, CODE = /^[A-Z0-9-]{6,32}$/, MAIL = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
const json = (o, status = 200) => Response.json(o, { status, headers: { "cache-control": "no-store" } });
const loopback = ip => !ip || ip === "::1" || ip === "localhost" || /^127\./.test(ip) || /^::ffff:127\./.test(ip);
const ROOM = /^[a-z0-9-]{1,32}$/, GUESS_MAX = 20, guesses = new Map(), passed = new Map(), FILE = /^\/g\/[a-z0-9-]+\.[0-9a-f]{10}\.(js|json|bin)$/;
const FILM = /^\/film\/([A-Za-z0-9_.-]{1,80})\/([A-Za-z0-9_.-]{1,120}\.mp4)$/, IA = /^\/ia\/([A-Za-z0-9_.-]{1,80})\.jpg$/, YT = /^\/yt\/([A-Za-z0-9_-]{11})\.jpg$/, BLANK = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYGD4DwABBAEAHnOcQAAAAABJRU5ErkJggg==";
function tooMany(ip, max = GUESS_MAX) { const min = Math.floor(Date.now() / 60000), g = guesses.get(ip);
  if (!g || g.min !== min) { if (guesses.size > 5000) for (const [k, v] of guesses) if (v.min !== min) guesses.delete(k); guesses.set(ip, { n: 1, min }); return false; }
  return ++g.n > max; }

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
    if ((request.method === "GET" || request.method === "HEAD") && FILM.test(p)) {
      if (!(await inside(env, request, dev))) return new Response("not found", { status: 404 });
      const [, id, file] = FILM.exec(p), h = new Headers(), rg = request.headers.get("range"); if (rg) h.set("range", rg);
      let r = null; try { r = await fetch("https://archive.org/download/" + id + "/" + file, { method: request.method, headers: h }); } catch (e) {}
      if (!r || !(r.ok || r.status === 206)) return new Response("not found", { status: 404 });
      const out = new Response(r.body, { status: r.status }); for (const k of ["content-type", "content-length", "content-range", "accept-ranges"]) { const v = r.headers.get(k); if (v) out.headers.set(k, v); }
      out.headers.set("cache-control", "private, max-age=86400"); out.headers.set("x-robots-tag", "noindex"); return out; }
    if (request.method === "GET" || request.method === "HEAD") { const m = YT.exec(p), ia = !m && IA.exec(p); if (m || ia) {
      let r = null; try { r = await fetch(m ? "https://i.ytimg.com/vi/" + m[1] + "/hqdefault.jpg" : "https://archive.org/services/img/" + ia[1]); } catch (e) {}
      const miss = !r || !r.ok, out = miss ? new Response(Uint8Array.from(atob(BLANK), c => c.charCodeAt(0)), { status: 200 }) : new Response(r.body, { status: r.status });
      out.headers.set("content-type", miss ? "image/png" : "image/jpeg"); out.headers.set("access-control-allow-origin", "*");
      out.headers.set("cache-control", "public, max-age=86400"); out.headers.set("x-robots-tag", "noindex"); return out; } }
    if (p.startsWith("/parties/")) return (await routePartykitRequest(request, env, {
      onBeforeConnect: async (req, { party, name }) => {
        if (party !== "block" || !ROOM.test(name) || (request.headers.get("Origin") !== url.origin && !dev)) return new Response("not found", { status: 404 });
        const id = await who(env, request, dev); if (!id) return new Response("login", { status: 401 });
        const r = new Request(req); r.headers.set("x-tsfm-id", id); r.headers.set("x-partykit-room", name); return r; },
      onBeforeRequest: () => new Response("not found", { status: 404 }) })) || new Response("not found", { status: 404 });
    if (request.method === "POST" && (p === "/post" || p === "/admin" || p === "/home")) {
      if (request.headers.get("Origin") !== url.origin && !(dev && !request.headers.get("Origin"))) return json({ why: "not from the game's page" }, 403);
      const id = await who(env, request, dev); if (!id) return json({ why: "login" }, 401);
      let body; try { body = await request.json(); } catch (e) { body = {}; } if (!body || typeof body !== "object") body = {};
      if (p === "/home") { if (body.put === undefined) return json({ home: await homeOf(env).get(id) });
        const t = JSON.stringify(body.put); if (!body.put || typeof body.put !== "object" || Array.isArray(body.put) || t.length > 65536) return json({ why: "bad room" }, 400);
        if (tooMany("home:" + id, 120)) return json({ why: "too many saves, wait a minute" }, 429);
        return json({ ok: await homeOf(env).put(id, t) }); }
      if (p === "/post") return json({ letters: await postOf(env).mine(id, Array.isArray(body.seen) ? body.seen.filter(Number.isInteger).slice(0, 50) : []) });
      const own = await owner(env, id, dev); if (own !== true) return json({ why: "only the owner (" + own + ")" }, 403);
      return json(await admin(env, body)); }
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
  const u = await r.json(); if (!u || !UUID.test(u.id || "") || (u.banned_until && Date.parse(u.banned_until) > Date.now())) return { why: "login" };
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
  const jr = await call("/rest/v1/rpc/join_beta", { method: "POST", headers: { apikey: env.SUPABASE_KEY, Authorization: "Bearer " + s.access_token, ...J }, body: JSON.stringify({ invite: code }) });
  if (!jr.ok) { const t = (await jr.text()).slice(0, 200); await gone(); return { why: "the code was not taken (" + jr.status + " " + t + ")" }; }
  return { ok: true, access_token: s.access_token, refresh_token: s.refresh_token };
}

const num = (v, lo, hi) => typeof v === "number" && isFinite(v) ? Math.max(lo, Math.min(hi, v)) : 0;
const word = (v, n) => String(v ?? "").replace(/[\u0000-\u001f\u007f<>]/g, "").trim().slice(0, n);
export class Block extends Server {
  static options = { hibernate: false };
  roster(skip) { const by = new Map(); for (const c of this.getConnections()) if (c.id !== skip && c.state && c.state.id) by.set(c.state.id, c.state); return [...by.values()]; }
  onConnect(c, ctx) {
    const id = ctx.request.headers.get("x-tsfm-id") || ""; if (!id) return c.close(4001, "login");
    for (const o of this.getConnections()) if (o.id !== c.id && o.state && o.state.id === id) o.close(4000, "joined again");
    c.setState({ id, name: "", look: "", at: null });
    c.send(JSON.stringify({ t: "hi", you: id, all: this.roster().filter(p => p.id !== id) }));
  }
  // a player within reach of another: both placed, same level and room, a few tiles apart
  near(s, to, r) { if (!s.at) return null; for (const o of this.getConnections()) if (o.state && o.state.id === to) { const a = o.state.at;
      return a && a[4] === s.at[4] && a[5] === s.at[5] && Math.hypot(a[0] - s.at[0], a[1] - s.at[1]) < r ? o : null; } return null; }
  onMessage(c, raw) {
    const s = c.state; if (!s || typeof raw !== "string" || raw.length > 2500) return; let m; try { m = JSON.parse(raw); } catch (e) { return; }
    const now = Date.now(), rl = c.rl || (c.rl = { t: now, n: 0, at: {} }); if (now - rl.t > 1000) { rl.t = now; rl.n = 0; } if (++rl.n > 60) return;
    const gap = { hit: 90, grab: 200, drop: 200, toss: 200, free: 200, parried: 250, say: 400, aim: 120, swing: 150, kite: 200 }[m.t]; if (gap) { if (now - (rl.at[m.t] || 0) < gap) return; rl.at[m.t] = now; }
    if (m.t === "mv" && Array.isArray(m.at)) {
      const a = m.at, at = [num(a[0], -1e5, 1e5), num(a[1], -1e5, 1e5), num(a[2], -1e4, 1e4), num(a[3], -10, 10), word(a[4], 8), word(a[5], 60)];
      c.setState({ ...s, at }); this.broadcast(JSON.stringify({ t: "mv", id: s.id, at }), [c.id]);
    } else if (m.t === "me") {
      const p = { ...s, name: word(m.name, 24), look: word(m.look, 400), dead: m.dead ? 1 : 0, hp: typeof m.hp === "number" ? num(m.hp, 0, 1) : 1 }; c.setState(p); this.broadcast(JSON.stringify({ t: "in", p }), [c.id]);
    } else if (m.t === "act") {
      const k = typeof m.k === "string" && /^([ JKRVUFNXCQEB]|carry)$/.test(m.k) ? m.k : "", mv = m.m === "flinch" ? m.m : ""; if (!k && !mv) return;
      this.broadcast(JSON.stringify(mv ? { t: "act", id: s.id, m: mv } : { t: "act", id: s.id, k, on: m.on ? 1 : 0 }), [c.id]);
    } else if (m.t === "ragon" && Array.isArray(m.n) && Array.isArray(m.jl) && m.n.length <= 16) {
      const n = m.n.map(x => word(x, 12)), jl = m.jl.slice(0, 16).map(a => (Array.isArray(a) ? a.slice(0, 8) : []).filter(Array.isArray).map(j => [word(j[0], 12), num(j[1], -9, 9), num(j[2], -9, 9), num(j[3], -9, 9)]));
      this.broadcast(JSON.stringify({ t: "ragon", id: s.id, n, jl }), [c.id]);
    } else if (m.t === "rag" && Array.isArray(m.b) && Array.isArray(m.o) && m.b.length <= 16) {
      const b = m.b.map(v => (Array.isArray(v) ? v.slice(0, 7) : []).map((x, i) => num(x, i < 3 ? -1e5 : -1, i < 3 ? 1e5 : 1)));
      this.broadcast(JSON.stringify({ t: "rag", id: s.id, o: [num(m.o[0], -1e5, 1e5), num(m.o[1], -1e5, 1e5)], hd: num(m.hd, -20, 20), b }), [c.id]);
    } else if (m.t === "ragoff") {
      this.broadcast(JSON.stringify({ t: "ragoff", id: s.id }), [c.id]);
    } else if (m.t === "grab" || m.t === "drop" || m.t === "toss" || m.t === "free") {
      const to = String(m.to || ""), H = this.held || (this.held = new Map()); if (!to || to === s.id) return;
      const o = m.t === "grab" ? this.near(s, to, 6) : [...this.getConnections()].find(x => x.state && x.state.id === to); if (!o) return;
      if (m.t === "free") { if (H.get(s.id) === to) H.delete(s.id); } else if (m.t === "grab") H.set(to, s.id); else { if (H.get(to) !== s.id) return; H.delete(to); }
      const v = Array.isArray(m.v) ? [num(m.v[0], -2, 2), num(m.v[1], -2, 2)] : null; o.send(JSON.stringify(m.t === "toss" ? { t: "toss", id: s.id, v } : { t: m.t, id: s.id }));
    } else if (m.t === "hit" || m.t === "parried") {
      const to = String(m.to || ""); if (!to || to === s.id) return; const o = this.near(s, to, 6); if (!o) return;
      o.send(JSON.stringify(m.t === "hit" ? { t: "hit", id: s.id, d: num(m.d, 0, .5), kb: num(m.kb, 0, 3), heavy: !!m.heavy, k: word(m.k, 6), from: [s.at[0], s.at[1]] } : { t: "parried", id: s.id }));
    } else if (m.t === "aim") {
      const v = Array.isArray(m.v) ? [num(m.v[0], -1, 1), num(m.v[1], -1, 1), num(m.v[2], -1, 1)] : null;
      this.broadcast(JSON.stringify({ t: "aim", id: s.id, w: word(m.w, 16), v }), [c.id]);
    } else if (m.t === "swing") {
      this.broadcast(JSON.stringify({ t: "swing", id: s.id, s: m.s < 0 ? -1 : 1, h: m.h ? 1 : 0 }), [c.id]);
    } else if (m.t === "kite") {
      const k = Array.isArray(m.k) ? [num(m.k[0], -1e5, 1e5), num(m.k[1], -1e4, 1e4), num(m.k[2], -1e5, 1e5)] : null;
      this.broadcast(JSON.stringify({ t: "kite", id: s.id, k }), [c.id]);
    } else if (m.t === "say") {
      const text = word(m.text, 200); if (text) this.broadcast(JSON.stringify({ t: "say", id: s.id, name: s.name, text }), [c.id]);
    }
  }
  async onRequest(req) { const path = new URL(req.url).pathname;
    if (path === "/who") return Response.json(this.roster().map(p => p.id));
    let b = {}; try { b = await req.json(); } catch (e) {}
    if (path === "/tell") { const m = JSON.stringify({ t: "tell", from: "THE MARKET", text: word(b.text, 500) }); let n = 0;
      for (const c of this.getConnections()) if (c.state && (b.to === "*" || c.state.id === b.to)) { c.send(m); n++; } return Response.json({ n }); }
    if (path === "/kick") { for (const c of this.getConnections()) if (c.state && c.state.id === b.id) c.close(4001, "removed"); return Response.json({ ok: true }); }
    return new Response("not found", { status: 404 }); }
  onClose(c) { const s = c.state; if (s && s.id && !this.roster(c.id).some(p => p.id === s.id)) { this.broadcast(JSON.stringify({ t: "out", id: s.id }));
      if (this.held) for (const [k, v] of this.held) if (k === s.id || v === s.id) this.held.delete(k); } }
}

// the owner's panel (TENANTS in the game): every call checks the caller is in admins, then uses the service key
const owners = new Map();
async function owner(env, id, dev) {
  if (dev && id.startsWith("dev-owner")) return true;
  const now = Date.now(), c = owners.get(id); if (c && c.until > now) return true;
  const k = svc(env); if (!k) return "the worker has no SUPABASE_SERVICE_KEY";
  const r = await fetch(env.SUPABASE_URL + "/rest/v1/admins?select=user_id&user_id=eq." + encodeURIComponent(id), { headers: k });
  if (!r.ok) return "Supabase refused the worker's key: " + r.status + " " + (await r.text()).slice(0, 120);
  if (!(await r.json()).length) return "no admins row for " + id;
  owners.set(id, { until: now + 60000 }); return true;
}
const postOf = env => env.Post.get(env.Post.idFromName("post"));
const homeOf = env => env.Home.get(env.Home.idFromName("homes"));
const blockAsk = async (env, room, path, body) => { const s = await getServerByName(env.Block, room);
  const r = await s.fetch(new Request("https://block/" + path, { method: body ? "POST" : "GET", body: body ? JSON.stringify(body) : undefined, headers: { "x-partykit-room": room, "content-type": "application/json" } }));
  return r.json(); };
const newCode = () => { const A = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789", b = crypto.getRandomValues(new Uint8Array(8)); let s = ""; for (const x of b) s += A[x % 32]; return "MARKET-" + s.slice(0, 4) + "-" + s.slice(4); };
// one request per 100 emails (Resend's batch), so a message to everyone stays under the worker's subrequest limit
async function email(env, to, subject, text) {
  const from = env.MAIL_FROM || "THE MARKET <market@thestrangestfleamarket.com>"; let n = 0;
  for (let i = 0; i < to.length; i += 100) { const part = to.slice(i, i + 100);
    const r = await fetch("https://api.resend.com/emails/batch", { method: "POST", headers: { Authorization: "Bearer " + env.RESEND_API_KEY, "content-type": "application/json" },
      body: JSON.stringify(part.map(x => ({ from, to: [x], subject, text }))) });
    if (r.ok) n += part.length; }
  return n;
}
async function admin(env, b) {
  const k = svc(env); if (!k && b.do !== "tell") return { why: "the server has no service key" };
  const call = (path, init = {}) => fetch(env.SUPABASE_URL + path, { ...init, headers: { ...k, "content-type": "application/json", Prefer: "return=minimal", ...(init.headers || {}) } });
  const res = async r => r.ok ? { ok: true } : { why: r.status + " " + (await r.text()).slice(0, 200) };
  const room = ROOM.test(b.room || "") ? b.room : "s-a", id = String(b.id || ""), user = () => UUID.test(id);
  const users = async () => { if (!k) return []; const r = await call("/auth/v1/admin/users?per_page=1000"); return r.ok ? (await r.json()).users || [] : []; };
  if (b.do === "list") {
    const [us, pl, ad, co, on] = await Promise.all([users(), call("/rest/v1/players?select=*").then(r => r.ok ? r.json() : []), call("/rest/v1/admins?select=*").then(r => r.ok ? r.json() : []),
      call("/rest/v1/invite_codes?select=*").then(r => r.ok ? r.json() : []), blockAsk(env, room, "who").catch(() => [])]);
    return { ok: true, email: !!env.RESEND_API_KEY, codes: co, letters: await postOf(env).list(),
      users: us.map(x => ({ id: x.id, email: x.email, phone: x.phone || "", joined: x.created_at, last: x.last_sign_in_at, confirmed: x.email_confirmed_at, provider: x.app_metadata && x.app_metadata.provider,
        banned: x.banned_until && Date.parse(x.banned_until) > Date.now() ? x.banned_until : null, player: pl.find(p => p.id === x.id) || null, admin: ad.some(a => a.user_id === x.id), online: on.includes(x.id) })) };
  }
  if (b.do === "code") { const n = Math.max(1, Math.min(1000, Math.floor(+b.uses || 1))), code = newCode();
    const r = await call("/rest/v1/invite_codes", { method: "POST", body: JSON.stringify({ code, uses: 0, max_uses: n }) }); return r.ok ? { ok: true, code } : res(r); }
  if (b.do === "codeoff") { const code = String(b.code || ""); if (!CODE.test(code)) return { why: "no such code" };
    const r = await call("/rest/v1/invite_codes?select=uses&code=eq." + encodeURIComponent(code)), c = r.ok ? (await r.json())[0] : null; if (!c) return { why: "no such code" };
    return res(await call("/rest/v1/invite_codes?code=eq." + encodeURIComponent(code), { method: "PATCH", body: JSON.stringify({ max_uses: c.uses }) })); }
  if (b.do === "tell") {
    const to = b.to === "*" ? "*" : id, subject = String(b.subject || "A LETTER FROM THE MARKET").slice(0, 120), text = String(b.text || "").slice(0, 4000).trim(), out = { ok: true };
    if (!text || (to !== "*" && !user())) return { why: "who to, and what?" };
    if (b.live) out.live = (await blockAsk(env, room, "tell", { to, text: text.slice(0, 500) }).catch(() => ({ n: 0 }))).n;
    if (b.letter) out.letter = await postOf(env).send(to, subject, text);
    if (b.email) out.email = env.RESEND_API_KEY ? await email(env, (await users()).filter(x => x.email && (to === "*" || x.id === to)).map(x => x.email).slice(0, 1000), subject, text) : "email is not set up";
    return out;
  }
  if (!user()) return { why: "no such player" };
  if (b.do === "user") {
    const a = {}; if (b.email) a.email = String(b.email).trim().toLowerCase(), a.email_confirm = true; if (b.password) a.password = String(b.password);
    if (a.email && !MAIL.test(a.email)) return { why: "that email doesn't look right" }; if (a.password && a.password.length < 8) return { why: "a password needs 8 letters or more" };
    if (Object.keys(a).length) { const r = await call("/auth/v1/admin/users/" + id, { method: "PUT", body: JSON.stringify(a) }); if (!r.ok) return res(r); }
    if (b.apt !== undefined) { const apt = b.apt === "" || b.apt === null ? null : Math.floor(+b.apt); if (apt !== null && !(apt > 0)) return { why: "an apartment is a number" };
      const r = await call("/rest/v1/players?id=eq." + id, { method: "PATCH", body: JSON.stringify({ apt }) }); if (!r.ok) return res(r); }
    return { ok: true };
  }
  if (b.do === "admin") return res(b.on ? await call("/rest/v1/admins", { method: "POST", body: JSON.stringify({ user_id: id }) }) : await call("/rest/v1/admins?user_id=eq." + id, { method: "DELETE" }));
  if (b.do === "ban") { const r = await call("/auth/v1/admin/users/" + id, { method: "PUT", body: JSON.stringify({ ban_duration: b.on ? "876000h" : "none" }) });
    if (r.ok && b.on) await blockAsk(env, room, "kick", { id }).catch(() => {}); return res(r); }
  if (b.do === "delete") { const r = await call("/auth/v1/admin/users/" + id, { method: "DELETE" }); if (!r.ok) return res(r);
    await blockAsk(env, room, "kick", { id }).catch(() => {}); await call("/rest/v1/admins?user_id=eq." + id, { method: "DELETE" }); await call("/rest/v1/players?id=eq." + id, { method: "DELETE" }); return { ok: true }; }
  return { why: "unknown" };
}
// letters from the market: kept here (no Supabase table needed), shown to the player when they next open the game
export class Post extends DurableObject {
  constructor(ctx, env) { super(ctx, env); this.sql = ctx.storage.sql;
    this.sql.exec("create table if not exists letters(id integer primary key autoincrement, too text not null, subject text, body text, at integer)");
    this.sql.exec("create table if not exists seen(letter integer, who text, primary key(letter, who))"); }
  send(to, subject, body) { this.sql.exec("insert into letters(too, subject, body, at) values(?, ?, ?, ?)", to, subject, body, Date.now()); return true; }
  mine(id, seen) { for (const l of seen) this.sql.exec("insert or ignore into seen(letter, who) values(?, ?)", l, id);
    return this.sql.exec("select id, subject, body, at from letters where (too = ? or too = '*') and at > ? and id not in (select letter from seen where who = ?) order by id limit 20", id, Date.now() - 30 * 864e5, id).toArray(); }
  list() { return this.sql.exec("select id, too, subject, body, at, (select count(*) from seen where letter = letters.id) as read from letters order by id desc limit 100").toArray(); }
}

// HOMES: each player's apartment as they decorated it (the room editor), one row a player
export class Home extends DurableObject {
  constructor(ctx, env) { super(ctx, env); this.sql = ctx.storage.sql; this.sql.exec("create table if not exists homes(who text primary key, room text, at integer)"); }
  get(id) { const r = this.sql.exec("select room from homes where who = ?", id).toArray()[0]; try { return r ? JSON.parse(r.room) : null; } catch (e) { return null; } }
  put(id, room) { this.sql.exec("insert into homes(who, room, at) values(?, ?, ?) on conflict(who) do update set room = excluded.room, at = excluded.at", id, room, Date.now()); return true; }
}
