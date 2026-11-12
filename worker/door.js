import { DurableObject } from "cloudflare:workers";
import { getServerByName, routePartykitRequest, Server } from "partyserver";
import { DISH, DISHK } from "./dish.js";
import { MAPPATCH } from "./mappatch.js";
import { FOLKSIM } from "./folk.js";
import { MOBSIM } from "./dunmobs.js";
import { lvBrief, lvGoal, lvH, lvMeet, lvRun } from "./lives.js";
import { CLK } from "./clock.js";
import { BOWLS } from "./lanes.js";
import LIVESDATA from "../data/lives.json";
import ITEMDATA from "../data/items.json";
import WORLD from "../data/world.json";
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i, CODE = /^[A-Z0-9-]{6,32}$/, MAIL = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
const json = (o, status = 200) => Response.json(o, { status, headers: { "cache-control": "no-store" } });
const loopback = ip => !ip || ip === "::1" || ip === "localhost" || /^127\./.test(ip) || /^::ffff:127\./.test(ip);
const SECROOMS = WORLD.sections.ids.flat().map(i => "s-" + String(i).toLowerCase().replace(/[^a-z0-9-]/g, "")), ROOM = /^[a-z0-9-]{1,32}$/, GUESS_MAX = 20, guesses = new Map(), passed = new Map(), FILE = /^\/g\/[a-z0-9-]+\.[0-9a-f]{10}\.(js|json|bin|mp3|jpg|png|webp)$/;
const APPF = /^\/(app\.webmanifest|icon-(192|512)\.png)$/;   // the installable app's manifest and icon: to anyone
const EDMAP = /^\/edmap\/t\d{1,2}_\d{1,2}\.jpg$/;
const BOOK = /^\/book\/(\d{1,6})\.txt$/, FILM = /^\/film\/([A-Za-z0-9_.-]{1,80})\/([A-Za-z0-9_.-]{1,120}\.mp4)$/, IA = /^\/ia\/([A-Za-z0-9_.-]{1,80})\.jpg$/, YT = /^\/yt\/([A-Za-z0-9_-]{11})\.jpg$/, BLANK = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYGD4DwABBAEAHnOcQAAAAABJRU5ErkJggg==";
const SKYJD = () => Date.now() / 864e5 + 2440587.5, SBDB = "https://ssd-api.jpl.nasa.gov/sbdb_query.api?", SWPC = "https://services.swpc.noaa.gov/";
const SKYFEEDS = {
  weather: { ttl: 1800, u: () => "https://api.open-meteo.com/v1/forecast?latitude=40.7128&longitude=-74.006&hourly=cloud_cover,visibility,precipitation,snowfall&past_days=1&forecast_days=2&timezone=UTC" },
  sats: { ttl: 21600, text: 1, u: () => ["https://celestrak.org/NORAD/elements/gp.php?GROUP=stations&FORMAT=tle", "https://celestrak.org/NORAD/elements/gp.php?GROUP=visual&FORMAT=tle"] },
  comets: { ttl: 86400, u: () => { const j = Math.round(SKYJD()); return SBDB + new URLSearchParams({ fields: "full_name,e,q,i,om,w,tp,M1,K1", "sb-kind": "c", "sb-cdata": JSON.stringify({ AND: ["tp|RG|" + (j - 400) + "|" + (j + 400), "M1|LT|11", "q|LT|3.5"] }) }); } },
  rocks: { ttl: 86400, u: () => SBDB + new URLSearchParams({ fields: "full_name,a,e,i,om,w,ma,epoch,H,G", "sb-kind": "a", "sb-cdata": JSON.stringify({ AND: ["H|LT|6.5"] }) }) },
  sun: { ttl: 900, jpg: 1, u: () => "https://sdo.gsfc.nasa.gov/assets/img/latest/latest_1024_HMIIC.jpg" },
  spots: { ttl: 3600, u: () => SWPC + "json/solar_regions.json" },
  flares: { ttl: 1800, u: () => SWPC + "json/goes/primary/xray-flares-7-day.json" },
  kp: { ttl: 1800, u: () => [SWPC + "products/noaa-planetary-k-index.json", SWPC + "products/noaa-planetary-k-index-forecast.json"] } };
async function skyFeed(k, request) {
  const F = SKYFEEDS[k], key = new Request(new URL(request.url).origin + "/sky-cache/" + k + (F.jpg ? ".jpg" : "")), cache = caches.default;
  const hit = await cache.match(key).catch(() => null); if (hit) return hit;
  const urls = [].concat(F.u()); let body = null, ok = true;
  try { const rs = await Promise.all(urls.map(u => fetch(u, { headers: { "user-agent": "thestrangestfleamarket.com telescope" } })));
    ok = rs.every(r => r.ok); if (ok) body = F.jpg ? await rs[0].arrayBuffer() : F.text ? (await Promise.all(rs.map(r => r.text()))).join("\n") : urls.length > 1 ? JSON.stringify(await Promise.all(rs.map(r => r.json()))) : await rs[0].text(); } catch (e) { ok = false; }
  if (!ok || body == null) return new Response("not now", { status: 503, headers: { "cache-control": "no-store" } });
  const out = new Response(body, { headers: { "content-type": F.jpg ? "image/jpeg" : F.text ? "text/plain; charset=utf-8" : "application/json", "cache-control": "public, max-age=" + F.ttl, "x-robots-tag": "noindex" } });
  await cache.put(key, out.clone()).catch(() => {}); return out; }
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
    if ((request.method === "GET" || request.method === "HEAD") && APPF.test(p)) {
      const r = await env.ASSETS.fetch(new Request(url.origin + p)); if (!r.ok) return new Response("not found", { status: 404 });
      const out = new Response(r.body, r); if (p.endsWith(".webmanifest")) out.headers.set("content-type", "application/manifest+json"); out.headers.set("cache-control", "public, max-age=86400"); return out; }
    if (request.method === "GET" && p === "/sw.js") {
      if (!(await inside(env, request, dev))) return new Response("not found", { status: 404 });
      const out = await page(env, url, "/sw.js", request, "private, no-cache"); out.headers.set("content-type", "text/javascript; charset=utf-8"); return out; }
    // the owners' map editor: its own light page (dist/editor.html) and its ground picture (dist/edmap/), only to a login in admins; anyone else is told nothing is there
    if ((request.method === "GET" || request.method === "HEAD") && (p === "/editor" || EDMAP.test(p))) {
      const id = await who(env, request, dev); if (!id || (await owner(env, id, dev)) !== true) return new Response("not found", { status: 404 });
      if (p === "/editor") return page(env, url, "/editor", request, "private, no-cache");
      const r = await env.ASSETS.fetch(new Request(url.origin + p)); if (!r.ok) return new Response("not found", { status: 404 });
      const out = new Response(r.body, r); out.headers.set("cache-control", "private, max-age=3600"); out.headers.set("x-robots-tag", "noindex"); return out; }
    if ((request.method === "GET" || request.method === "HEAD") && FILE.test(p)) {
      if (!(await inside(env, request, dev))) return new Response("not found", { status: 404 });
      const rg = request.headers.get("range"), r = await env.ASSETS.fetch(new Request(url.origin + p, rg ? { headers: { range: rg } } : undefined)); if (!(r.ok || r.status === 206)) return new Response("not found", { status: 404 });
      const gz = p.endsWith(".bin"), out = gz ? new Response(r.body, { status: r.status, headers: r.headers, encodeBody: "manual" }) : new Response(r.body, r);
      if (gz) { out.headers.set("content-type", "application/octet-stream"); out.headers.set("content-encoding", "gzip"); }
      out.headers.set("cache-control", "private, max-age=31536000, immutable"); out.headers.set("x-robots-tag", "noindex"); return out; }
    // voice's relay (src/111dc-voice.js): short-lived Cloudflare TURN logins for a player (TURN_KEY_ID, TURN_KEY_TOKEN); without them only STUN
    if (request.method === "GET" && p === "/turn") {
      if (!(await inside(env, request, dev))) return new Response("not found", { status: 404 });
      let ice = [{ urls: "stun:stun.cloudflare.com:3478" }];
      if (env.TURN_KEY_ID && env.TURN_KEY_TOKEN) try { const r = await fetch("https://rtc.live.cloudflare.com/v1/turn/keys/" + env.TURN_KEY_ID + "/credentials/generate-ice-servers", { method: "POST", headers: { Authorization: "Bearer " + env.TURN_KEY_TOKEN, "content-type": "application/json" }, body: JSON.stringify({ ttl: 86400 }) });
        if (r.ok) { const j = await r.json(), L = [].concat(j.iceServers || []).map(v => ({ ...v, urls: [].concat(v.urls || []).filter(u => !/:53(\?|$)/.test(u)) })).filter(v => v.urls.length); if (L.length) ice = L; } } catch (e) {}
      return new Response(JSON.stringify({ iceServers: ice }), { headers: { "content-type": "application/json", "cache-control": "private, no-store" } }); }
    if (request.method === "GET" && p === "/now") {
      let r = null; try { r = await fetch(env.SUPABASE_URL + "/rest/v1/now_playing?select=*&id=eq.theatre", { headers: { apikey: env.SUPABASE_KEY } }); } catch (e) {}
      const out = new Response(r && r.ok ? r.body : "[]", { status: 200 }); out.headers.set("content-type", "application/json"); out.headers.set("cache-control", "no-store"); return out; }
    if (request.method === "GET" && p === "/texts") { if (!(await inside(env, request, dev))) return json({}, 401); return json(await postOf(env).texts()); }
    if (request.method === "GET" && BOOK.test(p)) {
      if (!(await inside(env, request, dev))) return new Response("not found", { status: 404 });
      const id = BOOK.exec(p)[1], r = await bookText(id);
      if (!r.ok) return new Response("not found: " + r.why, { status: 404 });
      const out = new Response(r.body, { status: 200 }); out.headers.set("content-type", "text/plain; charset=utf-8"); out.headers.set("cache-control", "private, max-age=2592000"); out.headers.set("x-robots-tag", "noindex"); return out; }
    // a film copied into our own R2 bucket (FILMS): an owner opens /film-fill/<id>/<file> once, the worker copies it from the Internet Archive in parts
    if (request.method === "GET" && p.startsWith("/film-fill/") && FILM.test("/film" + p.slice(10))) {
      const uid = await who(env, request, dev); if (!uid || (await owner(env, uid, dev)) !== true) return new Response("not found", { status: 404 });
      const [, id, file] = FILM.exec("/film" + p.slice(10)); return new Response(await filmFill(env, id, file), { headers: { "content-type": "text/plain; charset=utf-8", "cache-control": "no-store" } }); }
    if ((request.method === "GET" || request.method === "HEAD") && FILM.test(p)) {
      if (!(await inside(env, request, dev))) return new Response("not found", { status: 404 });
      const [, id, file] = FILM.exec(p), h = new Headers(), rg = request.headers.get("range"); if (rg) h.set("range", rg);
      const kept = await filmR2(env, id + "/" + file, request); if (kept) return kept;
      let r = null; try { r = await fetch("https://archive.org/download/" + id + "/" + file, { method: request.method, headers: h }); } catch (e) {}
      if (!r || !(r.ok || r.status === 206)) return new Response("not found", { status: 404 });
      const out = new Response(r.body, { status: r.status }); for (const k of ["content-type", "content-length", "content-range", "accept-ranges"]) { const v = r.headers.get(k); if (v) out.headers.set(k, v); }
      out.headers.set("cache-control", "private, max-age=86400"); out.headers.set("x-robots-tag", "noindex"); return out; }
    if (request.method === "GET" || request.method === "HEAD") { const m = YT.exec(p), ia = !m && IA.exec(p); if (m || ia) {
      let r = null; try { r = await fetch(m ? "https://i.ytimg.com/vi/" + m[1] + "/hqdefault.jpg" : "https://archive.org/services/img/" + ia[1]); } catch (e) {}
      const miss = !r || !r.ok, out = miss ? new Response(Uint8Array.from(atob(BLANK), c => c.charCodeAt(0)), { status: 200 }) : new Response(r.body, { status: r.status });
      out.headers.set("content-type", miss ? "image/png" : "image/jpeg"); out.headers.set("access-control-allow-origin", "*");
      out.headers.set("cache-control", "public, max-age=86400"); out.headers.set("x-robots-tag", "noindex"); return out; } }
    // the telescope's live sky (src/150fg): the real weather, satellites, comets, asteroids, today's Sun and space weather, fetched here once for everyone and kept a while
    const sky = /^\/sky\/([a-z]{2,12})(\.jpg)?$/.exec(p);
    if (sky && request.method === "GET" && SKYFEEDS[sky[1]] && !!sky[2] === !!SKYFEEDS[sky[1]].jpg) {
      if (!(await inside(env, request, dev))) return new Response("not found", { status: 404 });
      return skyFeed(sky[1], request); }
    if (p.startsWith("/parties/")) return (await routePartykitRequest(request, env, {
      onBeforeConnect: async (req, { party, name }) => {
        const room = party === "block" ? ROOM.test(name) : party === "dish" && name === "petri";   // the dish: one for the whole market, the arcade's PETRI
        if (!room || (request.headers.get("Origin") !== url.origin && !dev)) return new Response("not found", { status: 404 });
        const id = await who(env, request, dev); if (!id) return new Response("login", { status: 401 });
        const r = new Request(req); r.headers.set("x-tsfm-id", id); r.headers.set("x-partykit-room", name); if (dev) r.headers.set("x-tsfm-dev", "1"); return r; },
      onBeforeRequest: () => new Response("not found", { status: 404 }) })) || new Response("not found", { status: 404 });
    // the market's shared files the owner sets (the busker's song): anyone logged in reads one, only the owner writes it
    const sh = /^\/shared\/([a-z0-9.-]{1,40})$/.exec(p);
    if (sh) { const id = await who(env, request, dev); if (!id) return new Response("login", { status: 401 });
      if (request.method === "GET") { const f = await postOf(env).getFile(sh[1]); if (!f) return new Response(null, { status: 204 }); return new Response(f.data, { headers: { "content-type": f.type, "cache-control": "no-store" } }); }
      if (request.method === "POST") { if (request.headers.get("Origin") !== url.origin && !(dev && !request.headers.get("Origin"))) return json({ why: "not from the game's page" }, 403);
        const own = await owner(env, id, dev); if (own !== true) return json({ why: "only the owner (" + own + ")" }, 403);
        const buf = await request.arrayBuffer(); if (!buf.byteLength || buf.byteLength > 8 << 20) return json({ why: "too big (8 MB at most)" }, 400);
        if (MAPPATCH.NAME.test(sh[1])) { let m = null; try { m = JSON.parse(new TextDecoder().decode(buf)); } catch (e) {} if (!m || m.v !== MAPPATCH.v || !m.set || typeof m.set !== "object") return json({ why: "not a map editor file" }, 400); }
        return json({ ok: await postOf(env).putFile(sh[1], word(request.headers.get("content-type") || "application/octet-stream", 60), buf), size: buf.byteLength }); }
      return new Response("not found", { status: 404 }); }
    if (request.method === "POST" && (p === "/post" || p === "/admin" || p === "/home" || p === "/owned" || p === "/name" || p === "/scores" || p === "/art" || p === "/orchard")) {
      if (request.headers.get("Origin") !== url.origin && !(dev && !request.headers.get("Origin"))) return json({ why: "not from the game's page" }, 403);
      const id = await who(env, request, dev); if (!id) return json({ why: "login" }, 401);
      let body; try { body = await request.json(); } catch (e) { body = {}; } if (!body || typeof body !== "object") body = {};
      if (p === "/home") { if (body.list !== undefined) return json({ list: (await homeOf(env).tenants()).filter(t => t.who !== id) });   // every tenant's apartment, for the map's quick jumps
        if (body.who !== undefined) return json({ home: await homeOf(env).get(word(body.who, 64)) });   // a visit: another player's apartment, to look at
        if (body.put === undefined) return json({ home: await homeOf(env).get(id) });
        const t = JSON.stringify(body.put); if (!body.put || typeof body.put !== "object" || Array.isArray(body.put) || t.length > 65536) return json({ why: "bad room" }, 400);
        if (tooMany("home:" + id, 120)) return json({ why: "too many saves, wait a minute" }, 429);
        return json({ ok: await homeOf(env).put(id, t) }); }
      // what you own (cash, pack, skills, logs...): one copy a player, read at the start, written back key by key
      if (p === "/owned") { if (body.put === undefined) { const H = homeOf(env), [owned, no, name] = await Promise.all([H.ownedGet(id), H.passport(id), H.nameGet(id)]); return json({ owned, me: { ...meOf(request, id), no, name } }); }
        if (body.kit !== undefined) { if (await owner(env, id, dev) !== true) { if (!body.beta) return json({ why: "owners only" }, 403); return (await homeOf(env).betaKit(id, Math.min(20000, Math.max(0, Math.floor(+body.kit || 0))))) ? json({ ok: true }) : json({ why: "had it" }, 409); }   // the beta kit, once a player (owner, 11 Nov 2026)
          await homeOf(env).econAllow(id, 0, Math.min(20000, Math.max(0, Math.floor(+body.kit || 0))), "owners' kit"); return json({ ok: true }); }   // an owner's own kit, each start (141-forage)
        const put = body.put; if (!put || typeof put !== "object" || Array.isArray(put)) return json({ why: "bad save" }, 400);
        const ks = Object.keys(put); if (ks.length > 80 || ks.some(k => !/^[a-z0-9_.-]{1,40}$/i.test(k) || (put[k] !== null && (typeof put[k] !== "string" || put[k].length > 262144)))) return json({ why: "bad save" }, 400);
        if (tooMany("owned:" + id, 120)) return json({ why: "too many saves, wait a minute" }, 429);
        const r = await homeOf(env).ownedSave(id, put); return r.ok ? json(r.clip ? { ok: true, clip: r.clip } : { ok: true }) : json({ why: "too much saved (2 MB a player)", full: true }, 413); }
      // your name (owner, 7 Nov 2026: a unique name chosen at the first day's setup): 3 to 16 letters, digits, spaces, ' or -, in capitals; no one else may have it, whatever its case
      if (p === "/name") { const n = String(body.claim || "").toUpperCase().replace(/\s+/g, " ").trim();
        if (!/^[A-Z0-9][A-Z0-9 '-]{1,14}[A-Z0-9]$/.test(n) || /^(TENANT|ADMIN|OWNER|MODERATOR|SYSTEM|GUEST)\b/.test(n)) return json({ why: "3 to 16 letters or digits" }, 400);
        if (tooMany("name:" + id, 30)) return json({ why: "too many tries, wait a minute" }, 429);
        return (await homeOf(env).nameClaim(id, n)) ? json({ ok: true, name: n }) : json({ why: "taken", taken: true }, 409); }
      // paintings (the painter): a picture a row (in 1 MB parts); finished ones never change and any player may look at them, unfinished ones only their painter
      if (p === "/art") { const H = homeOf(env), aid = x => (typeof x === "string" && /^[a-z0-9]{6,40}$/.test(x) ? x : "");
        if (body.have !== undefined) return (await H.artOffed(aid(body.have))) ? json({ gone: true }, 410) : json({ ok: true });   // taken down by an owner: no picture, not even the thumbnail
        if (body.get !== undefined) { const r = await H.artGet(aid(body.get), id); return r ? json(r) : json({ why: "no such picture" }, 404); }
        if (body.del !== undefined) return json({ ok: await H.artDel(aid(body.del), id) });
        const put = body.put && typeof body.put === "object" ? body.put : {}, k = aid(put.id);
        if (!k || typeof put.d !== "string" || !/^data:image\/(png|webp|jpeg);base64,|^\{/.test(put.d) || put.d.length > 12 << 20) return json({ why: "bad picture" }, 400);
        if (tooMany("art:" + id, 60)) return json({ why: "too many saves, wait a minute" }, 429);
        const r = await H.artPut(k, id, put.d, put.fin ? 1 : 0); return r === true ? json({ ok: true }) : json({ why: r, full: r === "full" }, r === "full" ? 413 : 409); }
      // the park orchard's plots (src/147d): one a player a section, its trees in it; anyone reads them all, only its keeper writes one; a plot left untouched for 60 days can be taken
      if (p === "/orchard") { const sec = word(body.sec, 8).toUpperCase(), H = homeOf(env); if (!/^[A-Z0-9]{1,8}$/.test(sec)) return json({ why: "bad section" }, 400);
        if (body.put === undefined && body.claim === undefined && body.leave === undefined) return json({ plots: await H.orchList(sec), me: id });
        if (tooMany("orchard:" + id, 120)) return json({ why: "too many saves, wait a minute" }, 429);
        if (body.claim !== undefined) return json(await H.orchClaim(sec, id, Math.floor(+body.claim)));
        if (body.leave !== undefined) return json({ ok: await H.orchLeave(sec, id) });
        const t = JSON.stringify(body.put); if (!body.put || typeof body.put !== "object" || Array.isArray(body.put) || t.length > 16384) return json({ why: "bad plot" }, 400);
        return json({ ok: await H.orchPut(sec, id, t) }); }
      // the arcade's high scores: a top ten a cabinet with three initials, shared by everyone; {cab} reads one ("*" all), {cab, put} adds a run
      if (p === "/scores") { const cab = word(body.cab, 20); if (!/^[A-Z0-9 *]{1,20}$/.test(cab)) return json({ why: "bad cabinet" }, 400);
        if (body.put === undefined) return json({ top: await postOf(env).top(cab) });
        const put = body.put && typeof body.put === "object" ? body.put : {}, ini = word(put.ini, 3).toUpperCase(), score = Math.floor(+put.score), sub = word(put.sub, 20);
        if (cab === "*" || !/^[A-Z0-9 ]{3}$/.test(ini) || !(score >= 1 && score <= 99999999)) return json({ why: "bad score" }, 400);
        if (tooMany("score:" + id, 30)) return json({ why: "too many scores, wait a minute" }, 429);
        return json(await postOf(env).score(cab, id, ini, score, sub)); }
      if (p === "/post") return json({ letters: await postOf(env).mine(id, Array.isArray(body.seen) ? body.seen.filter(Number.isInteger).slice(0, 50) : []) });
      const own = await owner(env, id, dev); if (own !== true) return json({ why: "only the owner (" + own + ")" }, 403);
      if (body.do === "text") { const key = String(body.key || ""), text = String(body.text || ""); if (!/^[a-z0-9_.\- ]{1,80}$/i.test(key) || text.length > 400) return json({ why: "bad text" }, 400); return json({ ok: await postOf(env).putText(key, text) }); }
      return json(await admin(env, body, url.origin)); }
    if (request.method !== "POST" || !["/enter", "/join/check", "/join", "/ask"].includes(p)) return new Response("not found", { status: 404 });
    if (request.headers.get("Origin") !== url.origin && !(dev && !request.headers.get("Origin"))) return json({ why: "not from the game's page" }, 403);
    if (tooMany(request.headers.get("CF-Connecting-IP") || "local")) return json({ why: "too many tries, wait a minute" }, 429);
    if (p === "/enter") { const t = (request.headers.get("Authorization") || "").replace(/^Bearer\s+/i, ""); return json(t && t.length < 5000 ? await pass(env, t, dev) : { why: "login" }); }
    let body; try { body = await request.json(); } catch (e) { body = null; } if (!body || typeof body !== "object") return json({ why: "bad message" }, 400);
    // asking for an invite (owner, 10 Nov 2026): the email waits in TENANTS until the owner sends it a code
    if (p === "/ask") { const m = String(body.email || "").trim().toLowerCase(); if (!MAIL.test(m) || m.length > 200) return json({ why: "email" }); return json({ ok: await postOf(env).ask(m) }); }
    const k = svc(env); if (!k) return json({ why: "the market can't take new tenants yet (the server has no key to make accounts)" });
    const code = String(body.code || "").trim().toUpperCase(); if (!CODE.test(code) || !(await codeOk(env, k, code))) return json({ why: "code" });
    return p === "/join/check" ? json({ ok: true }) : json(await join(env, k, code, body));
  }
};

async function who(env, request, dev) {
  const m = /(?:^|;\s*)tsfm-pass=([^;]+)/.exec(request.headers.get("Cookie") || ""); if (!m) return "";
  const t = decodeURIComponent(m[1]), now = Date.now(), seen = passed.get(t); if (seen && seen.until > now) return seen.id;
  const r = await pass(env, t, dev); if (!r.ok) return "";
  if (passed.size > 2000) for (const [k, v] of passed) if (v.until <= now) passed.delete(k); passed.set(t, { until: now + 300000, id: r.id, joined: r.joined || "", email: r.email || "", apt: r.apt ?? null });
  return r.id;
}
// who you are, for your passport: the login's id, email and the day it was made (only what who() just checked)
function meOf(request, id) { const m = /(?:^|;\s*)tsfm-pass=([^;]+)/.exec(request.headers.get("Cookie") || ""), s = m && passed.get(decodeURIComponent(m[1])); return { id, email: s && s.id === id && s.email || "", joined: s && s.id === id && s.joined || "", apt: s && s.id === id ? s.apt ?? null : null }; }
// a book's text from Project Gutenberg, else its mirrors (gutenberg.org turns away Cloudflare's servers, 7 Nov 2026)
async function bookText(id) {
  const d = id.length > 1 ? id.slice(0, -1).split("").join("/") + "/" + id : "0/" + id, why = [];
  for (const u of ["https://www.gutenberg.org/cache/epub/" + id + "/pg" + id + ".txt", "https://gutenberg.pglaf.org/cache/epub/" + id + "/pg" + id + ".txt",
    "https://mirror.cs.odu.edu/gutenberg/" + d + "/" + id + "-0.txt", "https://mirror.cs.odu.edu/gutenberg/" + d + "/" + id + ".txt"]) {
    try { const r = await fetch(u, { cf: { cacheTtl: 2592000, cacheEverything: true } }); if (r.ok) return { ok: true, body: r.body }; why.push(new URL(u).host + " " + r.status); } catch (e) { why.push(new URL(u).host + " failed"); } }
  return { ok: false, why: why.join(", ") };
}
// the films kept in R2: served with ranges (a video seeks); null when there is no bucket or no copy, and the Internet Archive serves it
async function filmR2(env, key, request) {
  if (!env.FILMS) return null;
  let o = null; try { o = request.method === "HEAD" ? await env.FILMS.head(key) : await env.FILMS.get(key, { range: request.headers }); } catch (e) { return null; }
  if (!o) return null;
  const hd = new Headers(), size = o.size, rg = o.range && request.headers.get("range") ? o.range : null;
  hd.set("content-type", "video/mp4"); hd.set("accept-ranges", "bytes"); hd.set("etag", o.httpEtag); hd.set("cache-control", "private, max-age=86400"); hd.set("x-robots-tag", "noindex");
  if (rg) { const a = rg.offset != null ? rg.offset : size - rg.suffix, n = rg.length != null ? rg.length : size - a; hd.set("content-range", "bytes " + a + "-" + (a + n - 1) + "/" + size); hd.set("content-length", String(n)); }
  else hd.set("content-length", String(size));
  return new Response(request.method === "HEAD" ? null : o.body, { status: rg ? 206 : 200, headers: hd });
}
async function filmFill(env, id, file) {
  if (!env.FILMS) return "no FILMS bucket on the worker (wrangler.jsonc r2_buckets)";
  const key = id + "/" + file, have = await env.FILMS.head(key); if (have) return "already kept: " + key + " (" + have.size + " bytes)";
  const src = "https://archive.org/download/" + id + "/" + file, hr = await fetch(src, { method: "HEAD", redirect: "follow" }), size = +hr.headers.get("content-length");
  if (!hr.ok || !(size > 0)) return "the Internet Archive has no " + key + " (" + hr.status + ")";
  const PART = 32 * 1024 * 1024, up = await env.FILMS.createMultipartUpload(key, { httpMetadata: { contentType: "video/mp4" } }), parts = [];
  try {
    for (let a = 0, n = 1; a < size; a += PART, n++) {
      const b = Math.min(size, a + PART) - 1, r = await fetch(src, { headers: { range: "bytes=" + a + "-" + b }, redirect: "follow" });
      if (r.status !== 206) throw new Error("part " + n + ": " + r.status);
      parts.push(await up.uploadPart(n, await r.arrayBuffer())); }
    await up.complete(parts); return "kept: " + key + " (" + size + " bytes, " + parts.length + " parts)";
  } catch (e) { try { await up.abort(); } catch (x) {} return "could not copy " + key + ": " + e.message; }
}
const inside = async (env, request, dev) => !!(await who(env, request, dev));
const forget = id => { for (const [k, v] of passed) if (v.id === id) passed.delete(k); };

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
  const pr = await get("/rest/v1/players?select=id,apt&id=eq." + u.id), pl = pr.ok ? (await pr.json())[0] : null;
  if (pl && pl.apt == null) pl.apt = await freeFlat(env, u.id);
  return pl ? { ok: true, id: u.id, joined: u.created_at || "", email: u.email || "", apt: pl.apt ?? null } : { why: "code" };
}

// a free flat at first login (owner, 6 Nov 2026): the next number after the highest given, never a penthouse (every 21st, src/059a-apts.js APTS.PER), kept on the player; none without the service key
const FLATS_PER = 21;
async function freeFlat(env, id) {
  const H = svc(env); if (!H) return null;
  try {
    // players.apt is unique: two first logins at once can pick the same number, so the loser of the race takes the next one
    for (let t = 0; t < 6; t++) {
      const r = await fetch(env.SUPABASE_URL + "/rest/v1/players?select=apt&apt=not.is.null&order=apt.desc&limit=1", { headers: H }), top = r.ok ? (await r.json())[0] : null;
      let n = (top && top.apt > 0 ? top.apt : 0) + 1 + t; if (n % FLATS_PER === 0) n++;
      const w = await fetch(env.SUPABASE_URL + "/rest/v1/players?id=eq." + id + "&apt=is.null&select=apt", { method: "PATCH", headers: { ...H, "content-type": "application/json", Prefer: "return=representation" }, body: JSON.stringify({ apt: n }) });
      if (w.ok) { const got = (await w.json())[0]; if (got) return got.apt; const me = await fetch(env.SUPABASE_URL + "/rest/v1/players?select=apt&id=eq." + id, { headers: H }); return me.ok ? ((await me.json())[0]?.apt ?? null) : null; }
      if (w.status !== 409) return null;
    }
    return null;
  } catch (e) { return null; }
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
const sayStyle = o => { const r = {}; if (!o || typeof o !== "object") return r; if (Number.isInteger(o.f) && o.f >= 0 && o.f < 6) r.f = o.f; if (typeof o.c === "string" && /^#[0-9a-f]{6}$/i.test(o.c)) r.c = o.c.toLowerCase(); if (Number.isInteger(o.s) && o.s >= 0 && o.s < 3) r.s = o.s; return r; };   // the font, colour and size a player chose for their words
const word = (v, n) => String(v ?? "").replace(/[\u0000-\u001f\u007f<>]/g, "").trim().slice(0, n);
export class Block extends Server {
  static options = { hibernate: false };
  roster(skip) { const by = new Map(); for (const c of this.getConnections()) if (c.id !== skip && c.state && c.state.id) by.set(c.state.id, c.state); return [...by.values()]; }
  // the block's shared world: small values every player here sees the same (a bin's fill), kept for good
  async world() { if (!this.W) { this.W = (await this.ctx.storage.get("world")) || {};
      // the cars grew 40% (3 Nov 2026): their spots saved before then are cleared once so they park in their own places again (owner, 7 Nov 2026)
      if ((await this.ctx.storage.get("carsv")) !== 2) {   // 2: moved past the forcefield (owner, 8 Nov 2026)
        for (const k of Object.keys(this.W)) if (k.startsWith("car:")) delete this.W[k]; await this.ctx.storage.put("world", this.W); await this.ctx.storage.put("carsv", 2); } }
    return this.W; }
  // the folk's walks (worker/folk.js): every walker on the street, stepped here every second while anyone is in, every ten seconds when nobody is, kept for good; the page sends the walk grid (its build's free ground) and each walker's mode
  async folk() { if (!this.F) { this.F = FOLKSIM.load(await this.ctx.storage.get("folk")); this.F.cast = (await this.ctx.storage.get("folkcast")) || null; const a = await this.ctx.storage.getAlarm(); if (a == null || a < Date.now()) await this.ctx.storage.setAlarm(Date.now() + 1000); } return this.F; }   // (an alarm left in the past, a stale record on disk, is set afresh)
  // the cast's goals on the game hour (worker/lives.js lvGoal: to work, home, a habit's place), from the cast's table a page sent; after a gap of hours they are put there, not walked
  castHour(F, H, jump) { const C = F.cast; if (!C || !C.keys) return; const recs = this.lives(), X = { hg: C.hg, doors: C.doors };
    for (const k in C.keys) { const E = F.by[k], c = C.keys[k]; if (!E || !c) continue; const job = LIVESDATA[k];
      try { const g = lvGoal(k, { job: job || {}, life: !!job, hours: c.hours, work: c.work, home: c.home }, H, recs[k], X, F.T, E); FOLKSIM.set(F, k, { goal: { gid: g.w + "@" + H, at: g.at, in: g.in, now: jump ? 1 : 0, b: g.b, hold: g.hold, fast: g.fast } }); } catch (e) {} } }
  // the game's clock as the owner set it (/shared/time.json clk), read again each minute and when the owner changes it
  async clock(now) { if (this.clkAt && now - this.clkAt < 60000) return; this.clkAt = now;
    try { const f = await postOf(this.env).getFile("time.json"), j = f ? JSON.parse(new TextDecoder().decode(f.data)) : null; this.clk = j && CLK.ok(j.clk) ? j.clk : null; } catch (e) {} }
  // the dungeon's monsters (worker/dunmobs.js): kept for good, stepped five times a second while anyone is below, each player told of the monsters in the rooms players are in and of the blows that reach them
  async mobs() { if (!this.MS) this.MS = MOBSIM.load(await this.ctx.storage.get("mobs")); return this.MS; }
  mobGo() { if (!this.mobT && this.MS && this.MS.g) { this.mobAt = Date.now(); this.mobT = setInterval(() => { try { this.mobTick(); } catch (e) { console.error("mobs", e); } }, 200); } }
  mobTick() { const MS = this.MS, now = Date.now(), dt = Math.min(1, (now - (this.mobAt || now)) / 1000); this.mobAt = now; const P = [], who = new Map();
    for (const c of this.getConnections()) { const t = c.state; if (!t || !t.id || !t.at || !MOBSIM.roomAt(MS, t.at[0], t.at[1], t.at[4] === "down" ? "down" : "up")) continue; P.push({ id: t.id, x: t.at[0], z: t.at[1], lv: t.at[4] === "down" ? "down" : "up", ok: !t.dead && !(t.x && t.x.invis) }); who.set(t.id, c); }
    const rooms = new Set(P.map(p => MOBSIM.roomAt(MS, p.x, p.z, p.lv)).filter(Boolean));
    if (!rooms.size) { clearInterval(this.mobT); this.mobT = null; this.ctx.storage.put("mobs", MOBSIM.save(MS)); return; }
    for (const e of MOBSIM.step(MS, dt, P)) { const c = who.get(e.to); if (c) c.send(JSON.stringify({ ...e, t: "mobhurt" })); }
    const msgs = new Map(); for (const [id, c] of who) { const r = MOBSIM.roomAt(MS, c.state.at[0], c.state.at[1], c.state.at[4] === "down" ? "down" : "up"); if (!r) continue; if (!msgs.has(r)) msgs.set(r, JSON.stringify({ t: "mobs", ...MOBSIM.snap(MS, new Set([r])) })); c.send(msgs.get(r)); }   // each player told of their own room
    if (now - (this.mobSaved || 0) > 30000) { this.mobSaved = now; this.ctx.storage.put("mobs", MOBSIM.save(MS)); } }
  async onAlarm() { const now = Date.now(), n = [...this.getConnections()].length;
    if (this.play && now - (this.playAt || 0) > 300000) { this.playAt = now; for (const id of [...this.play.keys()]) this.playOut(id, this.roster().some(p => p.id === id)); }
    try { this.dropSweep(now); } catch (e) { console.error("drops", e); }
    try { await this.bodySweep(now); } catch (e) { console.error("bodies", e); }
    try { await this.stallSweep(now); } catch (e) { console.error("stalls", e); }
    try { await this.clock(now); const F = await this.folk(); F.now = now / 1000; F.p0 = +((await this.world())["xing:gate"]) || 0; FOLKSIM.step(F, Math.min(600, Math.max(0, (now - (F.at || now)) / 1000))); F.at = now;
      { const H = lvH(now, this.clk); if (F.cast && F.H !== H) { const jump = F.H == null || Math.abs(H - F.H) > 1; F.H = H; this.castHour(F, H, jump); this.folkDirty = true; } }
      if (n) this.broadcast(JSON.stringify({ t: "folk", ...FOLKSIM.snap(F) }));
      if (this.folkDirty || !this.folkSaved || now - this.folkSaved > 30000) { this.folkDirty = false; this.folkSaved = now; await this.ctx.storage.put("folk", FOLKSIM.save(F)); } }
    catch (e) { console.error("folk alarm", e); }
    await this.ctx.storage.setAlarm(now + (n ? 1000 : 10000)); }   // (set again whatever happened: the walks never stop)
  async onConnect(c, ctx) {
    const id = ctx.request.headers.get("x-tsfm-id") || ""; if (!id) return c.close(4001, "login");
    for (const o of this.getConnections()) if (o.id !== c.id && o.state && o.state.id === id) o.close(4000, "joined again");
    c.setState({ id, name: "", look: "", at: null }); this.playIn(id); if (ctx.request.headers.get("x-tsfm-dev") === "1") (this.dev || (this.dev = new Set())).add(c.id);
    const F = await this.folk(), MS = await this.mobs();
    c.send(JSON.stringify({ t: "hi", mv: MS.g ? MS.g.v : "", you: id, all: this.roster().filter(p => p.id !== id), world: { ...(await this.world()), ...this.drops(this.W) }, cars: Object.fromEntries(this.cars || []), folk: FOLKSIM.snap(F), fv: F.g ? F.g.v : "", fc: F.cast ? F.cast.v + ":" + Object.keys(F.cast.keys || {}).length : "" }));
    c.send(JSON.stringify({ t: "puts", all: this.puts() })); c.send(JSON.stringify({ t: "dm", d: MS.dm || null }));
  }
  // time played (TENANTS): each player's time in, kept by Home, added when they leave and every five minutes while in
  playIn(id) { const P = this.play || (this.play = new Map()); if (!P.has(id)) { P.set(id, Date.now()); homeOf(this.env).playAdd(id, 0, 1).catch(() => {}); } }
  playOut(id, keep) { const P = this.play, t0 = P && P.get(id); if (!t0) return; const now = Date.now(); if (keep) P.set(id, now); else P.delete(id); homeOf(this.env).playAdd(id, now - t0, 0).catch(() => {}); }
  // things players set down in the world (hives...): kept by the section, so others see them while their owner is away
  putT() { this.ctx.storage.sql.exec("create table if not exists puts(who text, k text, name text, list text, at integer, primary key(who, k))"); }
  puts() { this.putT(); return this.ctx.storage.sql.exec("select who as id, k, name, list from puts").toArray().map(r => { let list = []; try { list = JSON.parse(r.list); } catch (e) {} return { id: r.id, k: r.k, name: r.name, list }; }); }
  // things dropped on the ground (src/162e-bag.js): drop:<id> records the section keeps, sent with its world; each gone 60 to 120 minutes after it was dropped (the alarm), at most 200 (the oldest go first); whoever takes one first gets it
  dropT() { if (this.dropOk) return; this.dropOk = 1; this.ctx.storage.sql.exec("create table if not exists drops(k text primary key, rec text, at integer, until integer)"); this.ctx.storage.sql.exec("create index if not exists drops_until on drops(until)"); }
  drops(W) { this.dropT(); if (W) { let moved = false; for (const k of Object.keys(W)) if (k.startsWith("drop:")) { this.dropAdd(k, W[k], null, 0); delete W[k]; moved = true; } if (moved) this.ctx.storage.put("world", W); }   // (drops kept in the world before 7 Nov 2026 move over)
    const o = {}; for (const r of this.ctx.storage.sql.exec("select k, rec from drops").toArray()) o[r.k] = r.rec; return o; }
  dropAdd(k, v, by, life) { this.dropT(); if (typeof v !== "string" || v.length > 1200 || this.ctx.storage.sql.exec("select 1 from drops where k = ?", k).toArray().length) return null; let r; try { r = JSON.parse(v); } catch (e) { return null; }
    const id = String(r && r.id || ""), n = Math.floor(+r.n); if (!/^[a-z0-9_]{1,48}$/.test(id) || !(n >= 1 && n <= 9999)) return null; const now = Date.now();
    const o = { id, n, x: num(r.x, -1e5, 1e5), y: num(r.y, -1e4, 1e4), z: num(r.z, -1e5, 1e5), lv: word(r.lv, 24) || "street", t: now, until: now + (life || (60 + Math.random() * 60) * 60000), by: by || word(r.by, 48) };
    if (r.rm) o.rm = word(r.rm, 40); if (r.in && typeof r.in === "object") o.in = r.in; if (r.subs && typeof r.subs === "object") o.subs = r.subs; if (!by) o.until = Math.min(o.until, (+r.t || now) + 7200000);
    const rec = JSON.stringify(o); this.ctx.storage.sql.exec("insert into drops(k, rec, at, until) values(?, ?, ?, ?)", k, rec, now, o.until);
    const over = this.ctx.storage.sql.exec("select count(*) as n from drops").one().n - 200, gone = over > 0 ? this.ctx.storage.sql.exec("select k from drops order by at, k limit ?", over).toArray().map(q => q.k) : [];
    for (const g of gone) this.dropGone(g); return gone.includes(k) ? null : rec; }
  // a dead player's body (src/103a-death.js): where it lies; an hour after, what it held (their saved 'corpse') falls to the ground as drops anyone may take, and is theirs no more
  bodyT() { if (this.bodyOk) return; this.bodyOk = 1; this.ctx.storage.sql.exec("create table if not exists bodies(who text primary key, at text, until integer)"); }
  bodyAt(who, v, life) { this.bodyT(); const o = { x: num(+(v && v.x), -1e5, 1e5), y: num(+(v && v.y), -1e4, 1e4), z: num(+(v && v.z), -1e5, 1e5), lv: word(v && v.lv, 24) || "street" }; if (v && v.rm) o.rm = word(v.rm, 40);
    this.ctx.storage.sql.exec("insert into bodies(who, at, until) values(?, ?, ?) on conflict(who) do update set at = excluded.at, until = excluded.until", who, JSON.stringify(o), Date.now() + (life || BODY_LIFE)); }
  bodyOff(who) { this.bodyT(); this.ctx.storage.sql.exec("delete from bodies where who = ?", who); }
  async bodySweep(now) { this.bodyT(); for (const r of this.ctx.storage.sql.exec("select who, at from bodies where until < ?", now).toArray()) { this.bodyOff(r.who); await this.bodyFall(r.who, JSON.parse(r.at)); } }
  async bodyFall(who, at) { const H = homeOf(this.env), o = await H.ownedGet(who); let c = null; try { c = JSON.parse(o.corpse || "null"); } catch (e) {} if (!c || typeof c !== "object") return 0;
    const L = [], add = (id, n) => { n = Math.floor(+n); if (!/^[a-z0-9_]{1,48}$/.test(id) || !(n > 0)) return; while (n > 0) { const k = Math.min(n, 9999); L.push([id, k]); n -= k; } };
    for (const k in c.items || {}) add(k, c.items[k]); for (const b in c.inside || {}) for (const k in c.inside[b] || {}) add(k, c.inside[b][k]); add("cash", Math.min(1e9, +c.cash || 0));
    await H.ownedPut(who, { corpse: null }); H.econNote(who, -Math.floor(+c.cash || 0), 0, 0, "body fell: " + L.length + " drops").catch(() => {});
    let i = 0; for (const [id, n] of L.slice(0, 60)) { const a = i++ * 2.4, d = .25 + .12 * Math.sqrt(i), k = "drop:b" + Math.random().toString(36).slice(2, 12);
      const rec = this.dropAdd(k, JSON.stringify({ id, n, x: at.x + Math.cos(a) * d * 40, y: at.y, z: at.z + Math.sin(a) * d * 40, lv: at.lv, rm: at.rm }), "body:" + who, 0); if (rec) this.broadcast(JSON.stringify({ t: "world", k, v: rec })); }
    this.broadcast(JSON.stringify({ t: "world", k: "body:" + who, v: "" })); return L.length; }
  // the market's stalls (src/159j-stalls.js): a player rents one for days, sets out things at their own prices; they sell while the renter is away; the till, less the market's cut, is theirs to collect; when the days run out what is left and the till go home (OWNED 'tradein')
  // the museum's fossil hall (src/150cyc-fossils.js): a skeleton a player gives stands there for everyone in the section, one of each kind, the giver named on its plaque
  fosT() { if (this.fosOk) return; this.fosOk = 1; this.ctx.storage.sql.exec("create table if not exists fossils(k text primary key, by text, at integer)"); }
  fosAll() { this.fosT(); const o = {}; for (const r of this.ctx.storage.sql.exec("select k, by, at from fossils").toArray()) o[r.k] = { by: r.by, at: r.at }; return o; }
  fos(c, s, m) { const op = String(m.op || ""), say = x => c.send(JSON.stringify({ t: "fos", ...x })), k = /^[a-z]{1,16}$/.test(String(m.k || "")) ? String(m.k) : "", H = homeOf(this.env);
    if (op === "list") return say({ op: "list", all: this.fosAll() });
    if (op !== "give" || !k) return; const all = this.fosAll(); if (all[k]) return say({ op: "no", k, why: "the museum already has one" }); if (Object.keys(all).length >= 32) return say({ op: "no", k, why: "the hall is full" });
    H.econPay(s.id, 0, { ["skel_" + k]: 1 }, "given to the museum").then(r => { if (!r.ok) return say({ op: "no", k, why: r.why });
      if (this.fosAll()[k]) { H.econGive(s.id, 0, { ["skel_" + k]: 1 }, "the museum had one").catch(() => {}); return say({ op: "no", k, why: "the museum already has one" }); }
      const o = { by: word(s.name, 24) || "A TENANT", at: Date.now() }; this.ctx.storage.sql.exec("insert into fossils(k, by, at) values(?, ?, ?)", k, o.by, o.at);
      say({ op: "took", k }); this.broadcast(JSON.stringify({ t: "fos", op: "one", k, o })); }).catch(() => say({ op: "no", k, why: "try again" })); }
  exch(c, s, m) { const item = word(m.item, 48), n = Math.max(0, Math.min(9999, Math.floor(+m.n || 0))), say = x => c.send(JSON.stringify({ t: "xm", ...x })), H = homeOf(this.env);
    if (String(m.op || "") !== "sell" || !/^[a-z0-9_]{1,48}$/.test(item) || n < 1) return; const v = exchVal(item), back = why => say({ op: "back", why, items: { [item]: n }, cash: 0 });
    if (!v) return back("it is worth nothing here"); const pay = Math.max(1, Math.floor(v * EXCH.pays)) * n;
    H.econPay(s.id, 0, { [item]: n }, "exchanged").then(r => { if (!r.ok) return back(r.why); H.econAllow(s.id, pay, 0, "exchanged").catch(() => {}); say({ op: "paid", item, n, cash: pay }); }).catch(() => back("try again")); }
  stallT() { if (this.stallOk) return; this.stallOk = 1; this.ctx.storage.sql.exec("create table if not exists stalls(id text primary key, rec text)"); }
  stallGet(id) { this.stallT(); const r = this.ctx.storage.sql.exec("select rec from stalls where id = ?", id).toArray()[0]; try { return r ? JSON.parse(r.rec) : null; } catch (e) { return null; } }
  stallSet(id, o) { if (o) this.ctx.storage.sql.exec("insert into stalls(id, rec) values(?, ?) on conflict(id) do update set rec = excluded.rec", id, JSON.stringify(o)); else this.ctx.storage.sql.exec("delete from stalls where id = ?", id);
    this.broadcast(JSON.stringify({ t: "st", op: "one", id, o: o ? stallPub(o) : null })); }
  stallAll() { this.stallT(); const o = {}; for (const r of this.ctx.storage.sql.exec("select id, rec from stalls").toArray()) { try { o[r.id] = stallPub(JSON.parse(r.rec)); } catch (e) {} } return o; }
  stallHome(o, why) { const items = {}; for (const g of o.goods) items[g.id] = (items[g.id] || 0) + g.n; const got = { items, cash: Math.floor(o.till), art: {} }; if (!got.cash && !Object.keys(items).length) return;
    const H = homeOf(this.env); H.econAllow(o.who, got.cash, Object.values(items).reduce((a, b) => a + b, 0), "stall " + why).catch(() => {});
    const c = [...this.getConnections()].find(x => x.state && x.state.id === o.who); if (c) c.send(JSON.stringify({ t: "st", op: "back", why, ...got })); else H.ownedAdd(o.who, "tradein", got).catch(() => {}); }
  async stallSweep(now) { this.stallT(); for (const r of this.ctx.storage.sql.exec("select id, rec from stalls").toArray()) { let o = null; try { o = JSON.parse(r.rec); } catch (e) {} if (o && o.until < now) { this.stallHome(o, "the rent ran out"); this.stallSet(r.id, null); } } }
  stall(c, s, m) { const op = String(m.op || ""), id = word(m.id, 8), say = x => c.send(JSON.stringify({ t: "st", ...x })), now = Date.now();
    if (op === "list") return say({ op: "list", all: this.stallAll(), mine: this.stallMine(s.id) });
    if (!STALL.ids.includes(id)) return; let o = this.stallGet(id); if (o && o.until < now) { this.stallHome(o, "the rent ran out"); this.stallSet(id, null); o = null; }
    const mine = o && o.who === s.id, item = word(m.item, 48), n = Math.floor(+m.n || 0);
    if (op === "rent") { const d = Math.max(1, Math.min(STALL.days, Math.floor(+m.days || 1)));
      if (o && !mine) return say({ op: "no", why: "someone else rents it" }); if (!o && Object.values(this.stallMineAll(s.id)).length) return say({ op: "no", why: "you already rent a stall" });
      const left = o ? Math.ceil((o.until - now) / 864e5) : 0; if (left + d > STALL.days) return say({ op: "no", why: "a stall is rented " + STALL.days + " days ahead at most" });
      const H = homeOf(this.env), cost = d * STALL.rent;
      H.econPay(s.id, cost, {}, "stall rent").then(r => { if (!r.ok) return say({ op: "no", why: r.why });
        let q = this.stallGet(id); if (q && q.until < Date.now()) q = null;
        if ((q && q.who !== s.id) || (!q && Object.values(this.stallMineAll(s.id)).length) || (q ? Math.ceil((q.until - Date.now()) / 864e5) : 0) + d > STALL.days) { H.econGive(s.id, cost, {}, "stall rent").catch(() => {}); return say({ op: "no", why: "someone else rents it" }); }
        q = q || { who: s.id, name: word(s.name, 24) || "A TENANT", until: Date.now(), till: 0, goods: [] }; q.until += d * 864e5; this.stallSet(id, q); say({ op: "rented", id, cost, days: d }); }).catch(() => say({ op: "no", why: "try again" })); return; }
    if (op === "buy") { if (!o || mine) return; const g = o.goods.find(q => q.id === item); if (!g || n < 1) return say({ op: "no", why: "it is gone" }); const k = Math.min(n, g.n), p = g.p, cost = p * k;
      if (Math.floor(+m.p || 0) !== p) return say({ op: "no", why: "the price changed" });
      const H = homeOf(this.env);
      H.econPay(s.id, cost, {}, "bought at a stall").then(r => { if (!r.ok) return say({ op: "no", why: r.why });
        const q = this.stallGet(id), h = q && q.until >= Date.now() && q.goods.find(x => x.id === item);
        if (!h || h.n < k || h.p !== p) { H.econGive(s.id, cost, {}, "stall sale lost").catch(() => {}); return say({ op: "no", why: "it is gone" }); }
        h.n -= k; if (!h.n) q.goods = q.goods.filter(x => x !== h); q.till += cost * (1 - STALL.cut); q.sold = (q.sold || 0) + k; this.stallSet(id, q);
        H.econAllow(s.id, 0, k, "bought at a stall").catch(() => {});
        const w = [...this.getConnections()].find(x => x.state && x.state.id === q.who); if (w) w.send(JSON.stringify({ t: "st", op: "sold", id, item, n: k, cost }));
        say({ op: "bought", id, item, n: k, cost }); }).catch(() => say({ op: "no", why: "try again" })); return; }
    if (!mine) return op === "put" && n > 0 && /^[a-z0-9_]{1,48}$/.test(item) ? say({ op: "back", why: "the stall is not yours", items: { [item]: Math.min(n, 9999) }, cash: 0 }) : say({ op: "no", why: "not your stall" });
    if (op === "put") { const p = Math.max(1, Math.min(1e6, Math.floor(+m.p || 0))); const g = o.goods.find(q => q.id === item);
      if (!/^[a-z0-9_]{1,48}$/.test(item) || n < 0 || n > 9999 || (!g && o.goods.length >= STALL.kinds)) { if (n > 0) say({ op: "back", why: "the stall is full", items: { [item]: n }, cash: 0 }); return; }
      if (n < 1) { if (g && g.p !== p) { g.p = p; this.stallSet(id, o); } return; }
      homeOf(this.env).econPay(s.id, 0, { [item]: n }, "set out at a stall").then(r => { if (!r.ok) return say({ op: "back", why: r.why, items: { [item]: n }, cash: 0 });
        const q = this.stallGet(id), h = q && q.who === s.id && q.until >= Date.now() && q.goods.find(x => x.id === item);
        if (!q || q.who !== s.id || q.until < Date.now() || (!h && q.goods.length >= STALL.kinds)) { homeOf(this.env).econGive(s.id, 0, { [item]: n }, "stall put").catch(() => {}); return say({ op: "back", why: "the stall is not yours", items: { [item]: n }, cash: 0 }); }
        if (h) { h.n += n; h.p = p; } else q.goods.push({ id: item, n, p }); this.stallSet(id, q); }).catch(() => say({ op: "back", why: "try again", items: { [item]: n }, cash: 0 })); return; }
    if (op === "take") { const g = o.goods.find(q => q.id === item); if (!g) return; o.goods = o.goods.filter(q => q !== g); this.stallSet(id, o);
      homeOf(this.env).econAllow(s.id, 0, g.n, "stall take back").catch(() => {}); return say({ op: "back", why: "", items: { [g.id]: g.n }, cash: 0 }); }
    if (op === "collect") { const v = Math.floor(o.till); if (!v) return; o.till -= v; this.stallSet(id, o); homeOf(this.env).econAllow(s.id, v, 0, "stall till").catch(() => {}); return say({ op: "back", why: "", items: {}, cash: v }); }
    if (op === "leave") { o.until = 0; this.stallHome(o, "you gave it up"); this.stallSet(id, null); } }
  stallMineAll(who) { const o = {}; for (const r of this.ctx.storage.sql.exec("select id, rec from stalls").toArray()) { try { const q = JSON.parse(r.rec); if (q.who === who && q.until >= Date.now()) o[r.id] = q; } catch (e) {} } return o; }
  stallMine(who) { this.stallT(); const L = this.stallMineAll(who), id = Object.keys(L)[0]; return id ? { id, till: Math.floor(L[id].till), sold: L[id].sold || 0 } : null; }
  dropGone(k) { this.ctx.storage.sql.exec("delete from drops where k = ?", k); this.broadcast(JSON.stringify({ t: "world", k, v: "" })); }
  dropSweep(now) { this.dropT(); for (const r of this.ctx.storage.sql.exec("select k from drops where until < ?", now).toArray()) this.dropGone(r.k); }
  // the townspeople's lives (worker/lives.js): one record each, kept by the section and brought up to the game hour when asked
  livesT() { this.ctx.storage.sql.exec("create table if not exists lives(k text primary key, rec text)"); }
  lives(only) {
    this.livesT(); const H = lvH(Date.now(), this.clk), out = {}, keys = only ? [only] : Object.keys(LIVESDATA);
    if (!only && this.livesAt === H && this.livesMap) return this.livesMap;
    const have = {}; for (const r of this.ctx.storage.sql.exec("select k, rec from lives").toArray()) { try { have[r.k] = JSON.parse(r.rec); } catch (e) {} }
    for (const k of keys) { if (!LIVESDATA[k]) continue; const h0 = have[k] ? have[k].H : -1, r = lvRun(k, { job: LIVESDATA[k] }, have[k] || null, H, null); out[k] = r;
      if (h0 !== r.H) this.ctx.storage.sql.exec("insert into lives(k, rec) values(?, ?) on conflict(k) do update set rec = excluded.rec", k, JSON.stringify(r)); }
    if (!only) { this.livesAt = H; this.livesMap = out; } else if (this.livesMap) this.livesMap[only] = out[only];
    return out; }
  // a player within reach of another: both placed, same level and room, a few tiles apart
  near(s, to, r) { if (!s.at) return null; for (const o of this.getConnections()) if (o.state && o.state.id === to) { const a = o.state.at;
      return a && a[4] === s.at[4] && a[5] === s.at[5] && Math.hypot(a[0] - s.at[0], a[1] - s.at[1]) < r ? o : null; } return null; }
  onMessage(c, raw) {
    const s = c.state; if (!s || typeof raw !== "string" || raw.length > (raw.startsWith('{"t":"folk"') ? 400000 : raw.startsWith('{"t":"mobgrid"') || raw.startsWith('{"t":"dmset"') ? 200000 : raw.startsWith('{"t":"rtc"') ? 12000 : 2500)) return; let m; try { m = JSON.parse(raw); } catch (e) { return; }
    const now = Date.now(), rl = c.rl || (c.rl = { t: now, n: 0, at: {} }); if (now - rl.t > 1000) { rl.t = now; rl.n = 0; } if (++rl.n > 60) return;
    const gap = { hit: 90, grab: 200, drop: 200, toss: 200, free: 200, parried: 250, say: 400, aim: 120, swing: 150, kite: 200, sky: 200, skyw: 100, ride: 300, car: 300, curse: 1500, puff: 800, drone: 3000, ps: 150, fish: 200, craft: 150, world: 120, puts: 1000, lives: 3000, met: 1000, tr: 100, gtr: 25, ins: 20, jug: 200, mobgrid: 3000, dmset: 3000, breakout: 5000, mobhit: 60, mobpar: 200, vr: 60, tv: 200, body: 1000, st: 150, jet: 150, zap: 120, arm: 40, mobtame: 1000, tame: 500, bowl: 80 }[m.t]; if (gap) { if (now - (rl.at[m.t] || 0) < gap) return; rl.at[m.t] = now; }
    if (m.t === "bye") { this.onClose(c); c.setState({ ...s, id: "" }); try { c.close(1000, "bye"); } catch (e) {} return; }   // leaving: out for everyone now, not when the socket times out
    if (m.t === "mv" && Array.isArray(m.at)) {
      const a = m.at, at = [num(a[0], -1e5, 1e5), num(a[1], -1e5, 1e5), num(a[2], -1e4, 1e4), num(a[3], -10, 10), word(a[4], 8), word(a[5], 60)];
      c.setState({ ...s, at }); this.broadcast(JSON.stringify({ t: "mv", id: s.id, at }), [c.id]); if (!this.mobT) this.mobs().then(MS => { if (MS.g && MOBSIM.roomAt(MS, at[0], at[1], at[4] === "down" ? "down" : "up")) this.mobGo(); });
    } else if (m.t === "me") {
      const x = {}; if (m.x && typeof m.x === "object") for (const k of Object.keys(m.x).slice(0, 16)) { const v = m.x[k]; if (/^[a-z]{1,8}$/.test(k)) x[k] = typeof v === "number" ? num(v, -1e4, 1e4) : word(v, k === "id" ? 140 : k === "pf" || k === "mt" ? 400 : 24); }
      const p = { ...s, name: word(m.name, 24), look: word(m.look, 400), dead: m.dead ? 1 : 0, hp: typeof m.hp === "number" ? num(m.hp, 0, 1) : 1, x }; c.setState(p); this.broadcast(JSON.stringify({ t: "in", p }), [c.id]);
    } else if (m.t === "act") {
      // a key's move, a flinch, an emote or dance (111da: mc_<name>, looped or once) and its stop: every one reaches the others (owner, 7 Nov 2026)
      const k = typeof m.k === "string" && /^([ JKRVUFNXCQEB]|carry)$/.test(m.k) ? m.k : "", mv = m.m === "flinch" || typeof m.m === "string" && /^mc_[A-Za-z0-9_]{1,32}$/.test(m.m) ? m.m : "";
      if (m.stop) { this.broadcast(JSON.stringify({ t: "act", id: s.id, stop: 1 }), [c.id]); return; }
      if (!k && !mv) return;
      this.broadcast(JSON.stringify(mv ? { t: "act", id: s.id, m: mv, loop: m.loop ? 1 : 0 } : { t: "act", id: s.id, k, on: m.on ? 1 : 0 }), [c.id]);
    } else if (m.t === "ragon" && Array.isArray(m.n) && Array.isArray(m.jl) && m.n.length <= 16) {
      const n = m.n.map(x => word(x, 12)), jl = m.jl.slice(0, 16).map(a => (Array.isArray(a) ? a.slice(0, 8) : []).filter(Array.isArray).map(j => [word(j[0], 12), num(j[1], -9, 9), num(j[2], -9, 9), num(j[3], -9, 9)]));
      this.broadcast(JSON.stringify({ t: "ragon", id: s.id, n, jl }), [c.id]);
    } else if (m.t === "rag" && Array.isArray(m.b) && Array.isArray(m.o) && m.b.length <= 16) {
      const b = m.b.map(v => (Array.isArray(v) ? v.slice(0, 7) : []).map((x, i) => num(x, i < 3 ? -1e5 : -1, i < 3 ? 1e5 : 1)));
      this.broadcast(JSON.stringify({ t: "rag", id: s.id, o: [num(m.o[0], -1e5, 1e5), num(m.o[1], -1e5, 1e5)], hd: num(m.hd, -20, 20), b }), [c.id]);
    } else if (m.t === "vr") {   // a headset player's own head, hands and fingers (162cb), to everyone else in the section
      const arr = (a, n) => Array.isArray(a) && a.length ? a.slice(0, n).map(x => num(x, -9, 9)) : 0;
      this.broadcast(JSON.stringify(m.off ? { t: "vr", id: s.id, off: 1 } : { t: "vr", id: s.id, h: arr(m.h, 4), L: arr(m.L, 27), R: arr(m.R, 27) }), [c.id]);
    } else if (m.t === "ragoff") {
      this.broadcast(JSON.stringify({ t: "ragoff", id: s.id }), [c.id]);
    } else if (m.t === "grab" || m.t === "drop" || m.t === "toss" || m.t === "free") {
      const to = String(m.to || ""), H = this.held || (this.held = new Map()); if (!to || to === s.id) return;
      const o = m.t === "grab" ? this.near(s, to, 6) : [...this.getConnections()].find(x => x.state && x.state.id === to); if (!o) return;
      if (m.t === "free") { if (H.get(s.id) === to) H.delete(s.id); } else if (m.t === "grab") H.set(to, s.id); else { if (H.get(to) !== s.id) return; H.delete(to); }
      const v = Array.isArray(m.v) ? [num(m.v[0], -2, 2), num(m.v[1], -2, 2)] : null; o.send(JSON.stringify(m.t === "toss" ? { t: "toss", id: s.id, v } : { t: m.t, id: s.id }));
    } else if (m.t === "jet") {   // a flamethrower or freeze ray firing (146hb), or stopping
      const k = m.k === "f" || m.k === "i" ? m.k : "", v = k && Array.isArray(m.v) ? [num(m.v[0], -1, 1), num(m.v[1], -1, 1), num(m.v[2], -1, 1)] : null;
      const md = Number.isInteger(m.m) && m.m >= 0 && m.m < 8 ? m.m : 0;
      this.broadcast(JSON.stringify(v ? { t: "jet", id: s.id, k, v, m: md } : { t: "jet", id: s.id, k }), [c.id]);
    } else if (m.t === "zap") {   // its stream on a player near the shooter: they burn or freeze
      const to = String(m.to || ""); if (!to || to === s.id) return; const o = this.near(s, to, 12); if (!o) return;
      o.send(JSON.stringify({ t: "zap", id: s.id, k: m.k === "i" ? "i" : "f", from: [s.at[0], s.at[1]] }));
    } else if (m.t === "arm") {   // a weapon fired, thrown or set (146hc), for everyone else to draw
      const k = /^(shot|proj|mine|boom|trap|portal|blow)$/.test(m.k) ? m.k : ""; if (!k) return;
      const v3 = a => Array.isArray(a) ? [num(a[0], -1e5, 1e5), num(a[1], -1e4, 1e4), num(a[2], -1e5, 1e5)] : null, o = { t: "arm", id: s.id, k, w: word(m.w, 16) };
      if (m.p) o.p = v3(m.p); if (Array.isArray(m.v)) o.v = [num(m.v[0], -1, 1), num(m.v[1], -1, 1), num(m.v[2], -1, 1)]; if (Array.isArray(m.e)) o.e = m.e.slice(0, 8).map(v3);
      if (k === "mine" || k === "boom") o.i = num(m.i, 0, 1e6); if (k === "portal") o.c = m.c ? 1 : 0; if (k === "blow") o.on = m.on ? 1 : 0;
      if (k === "trap") { o.to = word(m.to, 140); o.s = m.s === "bubble" ? "bubble" : "net"; o.d = num(m.d, 0, 6); }
      this.broadcast(JSON.stringify(o), [c.id]);
    } else if (m.t === "shot") {   // a weapon's hit on a player in its reach, judged by the one who fired: hurt, thrown, caught, alight
      const to = String(m.to || ""); if (!to || to === s.id) return; const o = this.near(s, to, 170); if (!o) return;
      const fx = Array.isArray(m.f) ? num(m.f[0], -1e5, 1e5) : s.at[0], fz = Array.isArray(m.f) ? num(m.f[1], -1e5, 1e5) : s.at[1], f = Math.hypot(fx - s.at[0], fz - s.at[1]) < 170 ? [fx, fz] : [s.at[0], s.at[1]];
      o.send(JSON.stringify({ t: "shot", id: s.id, w: word(m.w, 16), d: num(m.d, 0, .6), kb: num(m.kb, 0, 3), dn: m.dn ? 1 : 0, tr: m.tr === "net" || m.tr === "bubble" ? m.tr : "", tt: num(m.tt, 0, 6), fire: m.fire ? 1 : 0, from: f }));
    } else if (m.t === "hit" || m.t === "parried") {
      const to = String(m.to || ""); if (!to || to === s.id) return; const o = this.near(s, to, 6); if (!o) return;
      o.send(JSON.stringify(m.t === "hit" ? { t: "hit", id: s.id, d: num(m.d, 0, .5), kb: num(m.kb, 0, 3), heavy: !!m.heavy, k: word(m.k, 6), from: [s.at[0], s.at[1]] } : { t: "parried", id: s.id }));
    } else if (m.t === "dmset" && m.d) {   // the dungeon master's design, published: only an owner's goes live for everyone
      owner(this.env, s.id, !!(this.dev && this.dev.has(c.id))).then(o => { if (o !== true) { c.send(JSON.stringify({ t: "dmres", ok: 0, why: "only the owner publishes the dungeon" })); return; }
        this.mobs().then(MS => { const d = MOBSIM.design(MS, { ...m.d, by: s.name || s.id }); this.mobSaved = 0; this.ctx.storage.put("mobs", MOBSIM.save(MS)); this.broadcast(JSON.stringify({ t: "dm", d })); c.send(JSON.stringify({ t: "dmres", ok: 1, n: d ? d.mobs.length : 0 })); this.mobGo(); }); });
    } else if (m.t === "breakout") {   // a wave night: the first page to see it asks; once a day, from the published dungeon
      this.mobs().then(MS => { const d = Math.floor(Date.now() / 864e5); if (MS.boDay === d) return; MS.boDay = d; const n = MOBSIM.breakout(MS, 3 + Math.floor(Math.random() * 4)); if (!n) return; this.mobSaved = 0; this.ctx.storage.put("mobs", MOBSIM.save(MS)); this.broadcast(JSON.stringify({ t: "breakout", n })); this.mobGo(); });
    } else if (m.t === "mobgrid" && m.g) {   // the dungeon's map and the monsters' book, baked by a page (worker/dunmobs.js)
      this.mobs().then(MS => { if (MOBSIM.grid(MS, m.g)) { this.mobSaved = 0; this.ctx.storage.put("mobs", MOBSIM.save(MS)); this.mobGo(); } });
    } else if (m.t === "mobhit" || m.t === "mobpar") {   // a blow on a monster, or a monster's blow caught on the beat
      this.mobs().then(MS => { if (!MS.g || !s.at || !MOBSIM.roomAt(MS, s.at[0], s.at[1], s.at[4] === "down" ? "down" : "up")) return; const i = num(m.i, 0, 1e9), mo = MS.m.find(q => q.i === i); if (!mo || Math.hypot(mo.x - s.at[0], mo.z - s.at[1]) > (m.rg ? 60 : 4) * MS.g.T) return;
        if (m.t === "mobpar") { MOBSIM.parried(MS, i); return; }
        const r = MOBSIM.hit(MS, i, { d: num(m.d, 0, 20), kb: num(m.kb, 0, 3), heavy: !!m.hv, x: s.at[0], z: s.at[1] });
        if (r.res === "dead") c.send(JSON.stringify({ t: "mobkill", i, w: r.m.kind, key: r.m.key, x: r.m.x, z: r.m.z, n: r.n, loot: r.m.loot || "" })); else if (r.res === "blocked") c.send(JSON.stringify({ t: "mobres", i, res: "blocked" })); });
    } else if (m.t === "mobtame") {   // a monster tamed (src/146zjd): the first to do it has it
      this.mobs().then(MS => { const i = num(m.i, 0, 1e9), mo = MS.g && s.at && MS.m.find(q => q.i === i), ok = !!mo && Math.hypot(mo.x - s.at[0], mo.z - s.at[1]) <= 4 * MS.g.T && !!MOBSIM.tame(MS, i); c.send(JSON.stringify({ t: "mobtamed", i, ok: ok ? 1 : 0 })); });
    } else if (m.t === "tame") {   // a wild creature claimed by the one taming it (src/146zjd): nobody else may while they try, and it is theirs once tamed
      const k = word(m.k, 48), now = Date.now(), T = this.tames || (this.tames = new Map()), cl = T.get(k); if (!k) return;
      if (cl && cl.until > now && cl.id !== s.id) { c.send(JSON.stringify({ t: "tamek", k, ok: 0 })); return; }
      if (T.size > 500) for (const [q, v] of T) if (v.until < now) T.delete(q);
      T.set(k, { id: s.id, until: now + (m.done ? 600000 : 8000) }); c.send(JSON.stringify({ t: "tamek", k, ok: 1 })); this.broadcast(JSON.stringify({ t: "tamek", k, by: s.id, done: m.done ? 1 : 0 }), [c.id]);
    } else if (m.t === "aim") {
      const v = Array.isArray(m.v) ? [num(m.v[0], -1, 1), num(m.v[1], -1, 1), num(m.v[2], -1, 1)] : null;
      this.broadcast(JSON.stringify({ t: "aim", id: s.id, w: word(m.w, 16), v }), [c.id]);
    } else if (m.t === "swing") {
      this.broadcast(JSON.stringify({ t: "swing", id: s.id, s: m.s < 0 ? -1 : 1, h: m.h ? 1 : 0 }), [c.id]);
    } else if (m.t === "kite") {
      const k = Array.isArray(m.k) ? [num(m.k[0], -1e5, 1e5), num(m.k[1], -1e4, 1e4), num(m.k[2], -1e5, 1e5)] : null;
      this.broadcast(JSON.stringify({ t: "kite", id: s.id, k }), [c.id]);
    } else if (m.t === "curse") {
      const k = /^(rats|cloud|stink)$/.test(m.k) ? m.k : ""; const to = String(m.to || ""); if (!k || !to || to === s.id || !this.near(s, to, 12)) return;
      this.broadcast(JSON.stringify({ t: "curse", id: s.id, to, k }), [c.id]);
    } else if (m.t === "ride") {
      this.broadcast(JSON.stringify({ t: "ride", id: s.id, b: m.b ? word(m.b, 24) : null }), [c.id]);
    } else if (m.t === "trk") {   // a skater's trick as it happens (146ib): what the board and body are doing, for the others to draw
      const w = v => /^[a-z]{0,8}$/.test(String(v || "")) ? String(v || "") : "";
      this.broadcast(JSON.stringify({ t: "trk", id: s.id, s: w(m.s), g: w(m.g), fk: w(m.fk), fd: num(m.fd, 0, 3), ft: num(m.ft, 0, 3), n: m.n ? 1 : 0, f: m.f ? 1 : 0, sl: m.sl ? 1 : 0, p: m.p ? 1 : 0, c: num(m.c, 0, 1), v: num(m.v, 0, 400), z: num(m.z, -50, 400) }), [c.id]);
    } else if (m.t === "car") {
      // the parked cars (150p-cars): one driver a car; getting out parks it where it stands, kept in the block's world as car:<id> = "x,z,heading"
      const k = word(m.k, 24); if (!k) return; const cars = this.cars || (this.cars = new Map()), by = cars.get(k);
      if (m.on) { if (by && by !== s.id && this.roster().some(p => p.id === by)) { c.send(JSON.stringify({ t: "car", k, by, no: 1 })); return; }
        for (const [q, w] of cars) if (w === s.id && q !== k) cars.delete(q); cars.set(k, s.id); this.broadcast(JSON.stringify({ t: "car", k, by: s.id })); return; }
      if (by !== s.id) return; cars.delete(k); const a = Array.isArray(m.at) ? m.at : null;
      if (a) { const v = [num(a[0], -1e5, 1e5), num(a[1], -1e5, 1e5), num(a[2], -10, 10)].map(x => +x.toFixed(3)).join(","); this.world().then(W => { W["car:" + k] = v; this.ctx.storage.put("world", W); this.broadcast(JSON.stringify({ t: "car", k, by: null, at: v })); }); }
      else this.broadcast(JSON.stringify({ t: "car", k, by: null }));
    } else if (m.t === "ps") {
      // a pose state (sitting, climbing, hanging, swimming, gripping, flying: the page's PS, 111d): each a few numbers or flags
      const ps = {}; if (m.s && typeof m.s === "object") for (const k of ["sit", "climb", "hang", "water", "grip", "fly"]) { const v = m.s[k]; if (!v || typeof v !== "object") continue; const o = {}; let n = 0;
        for (const f in v) { if (n >= 16) break; const key = word(f, 12); if (!/^[a-zA-Z]+$/.test(key)) continue; const x = v[f]; if (typeof x === "number") { o[key] = num(x, -1e5, 1e5); n++; } else if (typeof x === "boolean") { o[key] = x; n++; } } ps[k] = o; }
      this.broadcast(JSON.stringify({ t: "ps", id: s.id, s: ps }), [c.id]);
    } else if (m.t === "fish") {
      const v = (a, n) => Array.isArray(a) && a.length === n ? a.map(x => num(x, -1e5, 1e5)) : null;
      this.broadcast(JSON.stringify({ t: "fish", id: s.id, b: v(m.b, 3), x: v(m.x, 3), k: m.k ? word(m.k, 24) : null, boat: v(m.boat, 4) }), [c.id]);
    } else if (m.t === "craft") {
      // a moored boat rowed (src/111ff-boats.js): which one and where
      if (Array.isArray(m.p) && m.p.length === 3) this.broadcast(JSON.stringify({ t: "craft", id: s.id, i: word(m.i, 16), p: m.p.map(x => num(x, -1e5, 1e5)), e: m.e ? 1 : 0 }), [c.id]);
    } else if (m.t === "gtr") {
      // the guitar (src/146zob-guitar.js): what a player plays, for everyone near to hear and see
      const k = /^(on|off|chord|strum|pluck|capo|song|stop)$/.test(m.k) ? m.k : ""; if (!k) return; const v = word(m.v, 12); if (!/^[0-9.:a-zA-Z#]*$/.test(v)) return;
      this.broadcast(JSON.stringify({ t: "gtr", id: s.id, k, v }), [c.id]);
    } else if (m.t === "ins") {
      // the instruments you sit at (src/146zp-instruments.js): the piano, the drums, the harp; what a player plays, for everyone near to hear and see
      const k = /^(on|off|b|song|stop)$/.test(m.k) ? m.k : "", i = /^(piano|drums|harp|violin|flute|trumpet)$/.test(m.i) ? m.i : ""; if (!k || !i) return; const v = word(m.v, 48); if (!/^[0-9.,:LRFPnup-]*$/.test(v)) return;
      this.broadcast(JSON.stringify({ t: "ins", id: s.id, k, i, v }), [c.id]);
    } else if (m.t === "jug") {
      // juggling (src/146zr-juggle.js): the pattern, when it drops and with what ("i:fail:b|c"), or "" to stop
      const v = word(m.v, 24); if (!/^([0-9]+:[0-9.]+:[bc])?$/.test(v)) return;
      this.broadcast(JSON.stringify({ t: "jug", id: s.id, v }), [c.id]);
    } else if (m.t === "drone") {   // a delivery drone flying to a player: everyone near sees it (src/146-drone)
      this.broadcast(JSON.stringify({ t: "drone", id: s.id, lb: word(m.lb, 40), f: m.f ? 1 : 0, x: num(m.x, -1e5, 1e5), y: num(m.y, -1e4, 1e4), z: num(m.z, -1e5, 1e5) }), [c.id]);
    } else if (m.t === "puff") {
      const k = /^cigar(_blue)?$/.test(m.k) ? m.k : "cigar";
      this.broadcast(JSON.stringify({ t: "puff", id: s.id, x: num(m.x, -1e5, 1e5), y: num(m.y, -1e4, 1e4), z: num(m.z, -1e5, 1e5), k }), [c.id]);
    } else if (m.t === "puts" && typeof m.k === "string" && /^[a-z]{1,12}$/.test(m.k) && Array.isArray(m.list)) {
      const list = m.list.slice(0, 6).filter(Array.isArray).map(a => [num(a[0], -1e5, 1e5), num(a[1], -1e4, 1e4), num(a[2], -1e5, 1e5), num(a[3], 0, 100)]);
      this.putT(); if (list.length) this.ctx.storage.sql.exec("insert into puts(who, k, name, list, at) values(?, ?, ?, ?, ?) on conflict(who, k) do update set name = excluded.name, list = excluded.list, at = excluded.at", s.id, m.k, s.name || "", JSON.stringify(list), now);
      else this.ctx.storage.sql.exec("delete from puts where who = ? and k = ?", s.id, m.k);
      this.broadcast(JSON.stringify({ t: "puts", id: s.id, k: m.k, name: s.name || "", list }), [c.id]);
    } else if (m.t === "folk") {
      this.folk().then(F => { let ch = false; if (m.grid && typeof m.grid === "object" && typeof m.grid.v === "string" && m.grid.v.length <= 64 && m.grid.v !== (F.g && F.g.v)) ch = FOLKSIM.grid(F, m.grid) || ch;
        if (Array.isArray(m.set)) for (const a of m.set.slice(0, 400)) if (Array.isArray(a) && FOLKSIM.set(F, a[0], a[1])) ch = true;
        const C = m.cast; if (C && typeof C === "object" && typeof C.v === "string" && C.v.length <= 64 && C.keys && typeof C.keys === "object" && Object.keys(C.keys).length <= 600 && raw.length <= 400000) {
          const old = F.cast; if (!old || old.v !== C.v || Object.keys(old.keys || {}).length < Object.keys(C.keys).length) { F.cast = { v: C.v, keys: C.keys, hg: C.hg && typeof C.hg === "object" ? C.hg : {}, doors: C.doors && typeof C.doors === "object" ? C.doors : {} }; F.H = null; this.ctx.storage.put("folkcast", F.cast); } }
        if (ch) this.folkDirty = true; });
    } else if (m.t === "lives") {
      const all = this.lives(), b = {}; for (const k in all) b[k] = lvBrief(all[k]); c.send(JSON.stringify({ t: "lives", all: b }));
    } else if (m.t === "met" && typeof m.k === "string" && LIVESDATA[m.k] && s.name) {
      const r = lvMeet(this.lives(m.k)[m.k], s.name); this.ctx.storage.sql.exec("update lives set rec = ? where k = ?", JSON.stringify(r), m.k); if (this.livesMap) this.livesMap[m.k] = r;
      this.broadcast(JSON.stringify({ t: "lives", all: { [m.k]: lvBrief(r) } }));
    } else if (m.t === "say") {
      const text = word(m.text, 200), st = sayStyle(m.st), sg = typeof m.sg === "string" ? m.sg.replace(/[^wWs]/g, "").slice(0, 200) : "";   // (sg: signed, each word's kind; src/146zs-signs.js)
      if (text) this.broadcast(JSON.stringify(sg ? { t: "say", id: s.id, name: s.name, text, st, sg } : { t: "say", id: s.id, name: s.name, text, st }), [c.id]);
    } else if (m.t === "rtc") {   // voice (src/111dc-voice.js): one player's WebRTC handshake handed to another near them; the voices go browser to browser
      const to = word(m.to, 64), d = m.d; if (!to || to === s.id || !d || typeof d !== "object") return; const o = this.near(s, to, 45); let x = null;
      if (d.sdp && (d.sdp.type === "offer" || d.sdp.type === "answer") && typeof d.sdp.sdp === "string" && d.sdp.sdp.length < 10000) x = { sdp: { type: d.sdp.type, sdp: d.sdp.sdp } };
      else if (d.c && typeof d.c.candidate === "string" && d.c.candidate.length < 500) x = { c: { candidate: d.c.candidate, sdpMid: d.c.sdpMid == null ? null : word(d.c.sdpMid, 16), sdpMLineIndex: num(d.c.sdpMLineIndex, 0, 16) | 0 } };
      else if (d.bye || d.no) x = d.bye ? { bye: 1 } : { no: 1 };
      if (!x) return; if (!o) { if (!x.bye) c.send(JSON.stringify({ t: "rtc", from: to, d: { bye: 1 } })); return; } o.send(JSON.stringify({ t: "rtc", from: s.id, d: x }));
    } else if (m.t === "pm" && s.name) {   // a message to one player in this section (the paper doll's MESSAGE)
      const to = word(m.to, 64), text = word(m.text, 200); if (!to || to === s.id || !text) return;
      if (!this.hand(to, { t: "pm", from: s.id, name: s.name, text })) c.send(JSON.stringify({ t: "pm", op: "gone", from: to }));
    } else if (m.t === "ring" && s.name) {   // the apartment house's callbox (src/150n-callbox.js): one tenant rings another, who lets them in or not
      const to = word(m.to, 64), op = m.op === "yes" || m.op === "no" ? m.op : "ask"; if (!to || to === s.id) return;
      if (!this.hand(to, { t: "ring", op, from: s.id, name: s.name }) && op === "ask") c.send(JSON.stringify({ t: "ring", op: "gone", from: to }));
    } else if (m.t === "tr") {
      this.trade(c, s, m);
    } else if ((m.t === "inv" || m.t === "invr") && s.name) {   // an invitation to a player online anywhere (inv), or their answer (invr): handed on by this section's block or another's
      const to = word(m.to, 64); if (!to || to === s.id) return; const d = {}; if (m.d && typeof m.d === "object") for (const k of Object.keys(m.d).slice(0, 6)) if (/^[a-z]{1,8}$/.test(k)) d[k] = typeof m.d[k] === "number" ? num(m.d[k], -1e4, 1e4) : word(m.d[k], 24);
      const x = { t: "inv", op: m.t === "inv" ? "ask" : m.op === "yes" ? "yes" : "no", from: s.id, name: s.name, sec: this.name, k: /^[a-z]{1,12}$/.test(m.k || "") ? m.k : "", d, at: now };
      this.invite(to, x).then(n => { if (!n && x.op === "ask") c.send(JSON.stringify({ t: "inv", op: "gone", from: to })); });
    } else if (m.t === "everyone") {   // who is online in every section, for an invitation
      Promise.all(SECROOMS.map(r => r === this.name ? Promise.resolve(this.names()) : blockAsk(this.env, r, "names").catch(() => []))).then(L => c.send(JSON.stringify({ t: "everyone", all: L.flat().filter(p => p.id !== s.id).slice(0, 200) })));
    } else if (m.t === "st") { this.stall(c, s, m);
    } else if (m.t === "xm") { this.exch(c, s, m);
    } else if (m.t === "fos") { this.fos(c, s, m);
    } else if (m.t === "body") {   // you died here (v), or took your body back (take)
      if (m.take) { this.bodyOff(s.id); this.broadcast(JSON.stringify({ t: "world", k: "body:" + s.id, v: "" })); } else if (m.v && typeof m.v === "object") this.bodyAt(s.id, m.v, this.dev && this.dev.has(c.id) && m.life ? num(m.life, 500, BODY_LIFE) : 0);
    } else if (m.t === "take") {   // a loose thing on the ground: whoever asks first gets it, told with its record; the rest see it go
      const k = word(m.k, 40); if (!k || !k.startsWith("drop:")) return; this.dropT(); const r = this.ctx.storage.sql.exec("select rec, until from drops where k = ?", k).toArray()[0], v = r && r.until >= now ? r.rec : "";
      if (r) this.dropGone(k); c.send(JSON.stringify({ t: "took", k, v }));
      if (v) { try { const o = JSON.parse(v); if (String(o.by || "").startsWith("body:")) homeOf(this.env).econAllow(s.id, o.id === "cash" ? o.n : 0, o.id === "cash" ? 0 : o.n, "a body's drop").catch(() => {}); } catch (e) {} }
    } else if (m.t === "sky") {   // a telescope shared at a star party (src/150fh): where it points, to everyone in the section
      this.broadcast(JSON.stringify({ t: "sky", id: s.id, name: word(s.name, 24), on: m.on ? 1 : 0, alt: num(m.alt, -90, 90), az: num(m.az, 0, 360), mag: num(m.mag, 1, 400), f: num(m.f, -1, 1), fl: m.fl ? 1 : 0, jd: num(m.jd, 2.4e6, 2.6e6), ctl: word(m.ctl, 60), obs: m.obs ? 1 : 0, n: num(m.n, 0, 99) | 0 }), [c.id]);
    } else if (m.t === "bowl") { this.bowl(c, s, m);   // the bowling alley's lanes (src/146zkb, worker/lanes.js)
    } else if (m.t === "tv") {   // an apartment's CRT TV (src/150fa): power, channel and what THE GUIDE plays, to everyone else in that apartment
      const rm = s.at && s.at[5]; if (!rm || !rm.startsWith("apt:")) return;
      const q = m.p && typeof m.p === "object" ? m.p : null, p = q && /^[A-Za-z0-9_.-]{1,80}$/.test(q.id || "") && /^[A-Za-z0-9_.-]{1,120}\.mp4$/.test(q.file || "") ? { id: q.id, file: q.file, title: word(q.title, 90), year: num(q.year, 0, 3000) | 0, len: num(q.len, 1, 20000) } : null;
      const x = JSON.stringify({ t: "tv", id: s.id, on: m.on ? 1 : 0, ch: num(m.ch, 0, 99) | 0, p, t0: num(m.t0, 0, 1e14) });
      for (const o of this.getConnections()) if (o !== c && o.state && o.state.at && o.state.at[5] === rm) o.send(x);
    } else if (m.t === "skyw") {   // a watcher joining, leaving or (handed the tube) steering someone's telescope: to that one player
      const to = String(m.to || ""), op = /^(join|leave|steer|ask)$/.test(m.op) ? m.op : ""; if (!to || to === s.id || !op) return;
      for (const o of this.getConnections()) if (o.state && o.state.id === to) { o.send(JSON.stringify({ t: "skyw", id: s.id, name: word(s.name, 24), op, alt: num(m.alt, -90, 90), az: num(m.az, 0, 360) })); break; }
    } else if (m.t === "world") {
      const k = word(m.k, 40); if (!k) return; if (k === "time") this.clkAt = 0;
      if (k.startsWith("drop:")) { if (!/^drop:[a-z0-9]{4,24}$/.test(k)) return; const life = this.dev && this.dev.has(c.id) && m.life ? num(m.life, 500, 7200000) : 0; this.world().then(W => { this.drops(W); const rec = this.dropAdd(k, m.v, s.id, life); if (rec) this.broadcast(JSON.stringify({ t: "world", k, v: rec })); }); return; }   // a drop is set once, never changed or cleared by a player (a test's server may give it a short life)   // (the owner changed the clock: read it at the next step)
      if (k.startsWith("sum:")) { owner(this.env, s.id, !!(this.dev && this.dev.has(c.id))).then(o => { if (o === true) this.put(k, typeof m.v === "string" ? word(m.v, 120) : ""); }); return; }   // a summoned character: only an owner moves one
      if (k.startsWith("first:")) { const v = word(m.v, 80), night = v.split("|")[0]; if (!/^first:[a-z0-9_]{2,30}$/.test(k) || !/^\d{8}$/.test(night)) return;   // tonight's firsts (src/150fcz): the first to find it keeps it until the next night
        this.world().then(W => { if (String(W[k] || "").split("|")[0] === night) return; W[k] = v; this.ctx.storage.put("world", W); this.broadcast(JSON.stringify({ t: "world", k, v })); }); return; }
      const kind = WORLD_KEYS.find(r => r.re.test(k)); if (!kind || (m.add != null) !== !!kind.add) return;   // only the kinds of shared things the game has; counters only where it counts
      if (kind.owner) { owner(this.env, s.id, !!(this.dev && this.dev.has(c.id))).then(o => { if (o === true) this.put(k, typeof m.v === "number" ? num(m.v, 0, 1e13) : word(m.v, 40)); }); return; }
      if (kind.add) m.add = num(m.add, -1, 1);
      this.world().then(W => { if (Object.keys(W).length > 6000 && !(k in W)) return;
        const v = m.add != null ? Math.max(0, Math.min(1e6, (+W[k] || 0) + num(m.add, -1e6, 1e6))) : typeof m.v === "number" ? num(m.v, -1e6, 1e6) : word(m.v, k.startsWith("tag:") ? 4000 : k.startsWith("tbl:") ? 3600 : k.startsWith("drop:") ? 1200 : 200);
        W[k] = v; this.ctx.storage.put("world", W); this.broadcast(JSON.stringify({ t: "world", k, v })); });
    }
  }
  // the bowling alley: one bowler a lane; a throw (where, which way, how hard, the spin, the ball, its seed) and its result go to everyone in the alley, who roll it themselves
  bowl(c, s, m) {
    const L = this.lanes || (this.lanes = BOWLS.lanes()), op = String(m.op || ""), ln = Math.floor(num(m.ln, -1, BOWLS.N - 1)), inAlley = o => o.state && o.state.at && o.state.at[5] === "bowling";
    const all = () => JSON.stringify({ t: "bowl", op: "lanes", lanes: L }), tell = () => { const x = all(); for (const o of this.getConnections()) if (inAlley(o)) o.send(x); };
    if (op === "ask") return c.send(all());
    if (op === "take") { if (BOWLS.take(L, s.id, word(s.name, 24), ln)) tell(); else c.send(all()); return; }
    if (op === "free") { if (BOWLS.free(L, s.id, ln)) tell(); return; }
    const h = L[ln]; if (!h || h.id !== s.id) return; let x;
    if (op === "throw" && Array.isArray(m.v)) x = { t: "bowl", op, id: s.id, name: h.name, ln, v: [num(m.v[0], -1, 1), num(m.v[1], -.5, .5), num(m.v[2], 0, 15), num(m.v[3], -1, 1), num(m.v[4], 6, 16), Math.floor(num(m.v[5], 0, 4294967295))], st: Math.floor(num(m.st, 0, 1023)) };
    else if (op === "res" && Array.isArray(m.rolls)) { const R = m.rolls.slice(0, 21).map(v => Math.floor(num(v, 0, 10))); if (!BOWLS.roll(L, s.id, ln, R)) return; x = { t: "bowl", op, id: s.id, name: h.name, ln, out: Math.floor(num(m.out, 0, 1023)), rolls: R }; }
    else if (op === "new") { h.rolls = []; x = { t: "bowl", op, id: s.id, name: h.name, ln }; }
    if (!x) return; const j = JSON.stringify(x); for (const o of this.getConnections()) if (o !== c && inAlley(o)) o.send(j); }
  // a trade between two players: one asks, the other says yes; each puts things in (an offer resets both ACCEPTs); when both accept, each is told what to give and what to get
  trade(c, s, m) {
    const T = this.trades || (this.trades = new Map()), A = this.asks || (this.asks = new Map()), conn = id => [...this.getConnections()].find(x => x.state && x.state.id === id), say = (o, x) => o && o.send(JSON.stringify({ t: "tr", ...x }));
    const op = String(m.op || ""), to = String(m.to || ""), mine = T.get(s.id);
    if (op === "ask") { if (!to || to === s.id || mine) return; const o = this.near(s, to, 12); if (!o) return say(c, { op: "far", with: to });
      if (T.has(to)) return say(c, { op: "busy", with: to }); A.set(s.id, { to, at: Date.now() }); return say(o, { op: "ask", from: s.id, name: s.name || "" }); }
    if (op === "yes" || op === "no") { const a = A.get(to); if (!a || a.to !== s.id || Date.now() - a.at > 60000) return; A.delete(to); const o = conn(to); if (!o) return;
      if (op === "no") return say(o, { op: "no", from: s.id, name: s.name || "" });
      if (T.has(to) || mine) return say(c, { op: "busy", with: to });
      const t = { a: to, b: s.id, o: { [to]: null, [s.id]: null }, ok: {} }; T.set(to, t); T.set(s.id, t);
      say(o, { op: "open", with: s.id, name: s.name || "" }); return say(c, { op: "open", with: to, name: o.state.name || "" }); }
    if (!mine) return; const other = mine.a === s.id ? mine.b : mine.a, oc = conn(other);
    const end = why => { if (mine.pay) return this.tradeEnd(mine, why); T.delete(mine.a); T.delete(mine.b); say(c, { op: "x", why }); say(oc, { op: "x", why }); };
    if (op === "x") return end("called off");
    if (!oc || !this.near(s, other, 20)) return end("too far apart");
    const st = () => { for (const [x, y] of [[c, other], [oc, s.id]]) { const me = x.state.id; say(x, { op: "st", mine: mine.o[me], theirs: mine.o[y], okMe: !!mine.ok[me], okThem: !!mine.ok[y] }); } };
    if (op === "offer") { if (mine.pay) return; mine.o[s.id] = tradeClean(m.o); mine.ok = {}; return st(); }
    // both accept: each game takes what it put in out of its own pack and says what it really took; only that changes hands
    if (op === "ok") { if (mine.pay) return; mine.ok[s.id] = !!m.v;
      if (mine.ok[mine.a] && mine.ok[mine.b]) { mine.pay = {}; say(c, { op: "pay", give: mine.o[s.id] || tradeNone() }); say(oc, { op: "pay", give: mine.o[other] || tradeNone() });
        mine.timer = setTimeout(() => this.tradeEnd(mine, "the other side did not answer"), 10000); return; }
      return st(); }
    if (op === "paid") { if (!mine.pay || mine.pay[s.id] || mine.paying === s.id) return; const g = tradeAtMost(tradeClean(m.o), mine.o[s.id] || tradeNone()); mine.paying = s.id;
      homeOf(this.env).econPay(s.id, g.cash, g.items, "trade").then(r => { if (mine.paying === s.id) mine.paying = null; if (this.trades.get(s.id) !== mine) { if (r.ok) { homeOf(this.env).econGive(s.id, g.cash, g.items, "trade ended").catch(() => {}); c.send(JSON.stringify({ t: "tr", op: "x", why: "the trade ended", back: g })); } return; }
        if (!r.ok) { (mine.unpaid || (mine.unpaid = {}))[s.id] = g; return this.tradeEnd(mine, "they could not pay"); }
        mine.pay[s.id] = g; if (mine.pay[mine.a] && mine.pay[mine.b]) this.tradeEnd(mine); }).catch(() => { if (mine.paying === s.id) mine.paying = null; }); }
  }
  // a trade's end once paying began: both paid, each gets the other's; otherwise what was paid goes back; a player who left gets it at the next start (OWNED 'tradein')
  tradeEnd(t, why, gone) { clearTimeout(t.timer); const T = this.trades; if (T.get(t.a) !== t) return; T.delete(t.a); T.delete(t.b);
    const conn = id => [...this.getConnections()].find(x => x.state && x.state.id === id);
    for (const [me, them] of [[t.a, t.b], [t.b, t.a]]) { const mine = t.pay[me], theirs = t.pay[them];
      const un = t.unpaid && t.unpaid[me], x = why ? (mine ? { op: "x", why, back: mine } : un ? { op: "x", why: "you do not have what you put in", back: un } : { op: "x", why }) : { op: "done", with: them, give: mine, get: theirs };
      const got = why ? mine : theirs, o = me === gone ? null : conn(me);
      const H = homeOf(this.env); if (got && (got.cash || Object.keys(got.items).length)) H.econAllow(me, got.cash, Object.values(got.items).reduce((a, b) => a + b, 0), why ? "trade back" : "trade").catch(() => {});
      if (o) o.send(JSON.stringify({ t: "tr", ...x })); else if (got && (got.cash || Object.keys(got.items).length)) H.ownedAdd(me, "tradein", got).catch(() => {}); } }
  names() { return this.roster().filter(p => p.name).map(p => ({ id: p.id, name: p.name, sec: this.name })); }
  hand(to, x) { let n = 0; const j = JSON.stringify(x); for (const o of this.getConnections()) if (o.state && o.state.id === to) { o.send(j); n++; } return n; }
  async invite(to, x) { const n = this.hand(to, x); if (n) return n;
    const L = await Promise.all(SECROOMS.filter(r => r !== this.name).map(r => blockAsk(this.env, r, "inv", { to, m: x }).then(o => o.n || 0).catch(() => 0))); return L.reduce((a, b) => a + b, 0); }
  put(k, v) { this.world().then(W => { if (v === "") delete W[k]; else W[k] = v; this.ctx.storage.put("world", W); this.broadcast(JSON.stringify({ t: "world", k, v })); });
  }
  async onRequest(req) { const path = new URL(req.url).pathname;
    if (path === "/who") return Response.json(this.roster().map(p => p.id));
    if (path === "/names") return Response.json(this.names());
    let b = {}; try { b = await req.json(); } catch (e) {}
    if (path === "/tell") { const m = JSON.stringify({ t: "tell", from: "THE MARKET", text: word(b.text, 500) }); let n = 0;
      for (const c of this.getConnections()) if (c.state && (b.to === "*" || c.state.id === b.to)) { c.send(m); n++; } return Response.json({ n }); }
    if (path === "/inv") return Response.json({ n: b && b.m && b.m.t === "inv" ? this.hand(String(b.to || ""), b.m) : 0 });
    if (path === "/kick") { for (const c of this.getConnections()) if (c.state && c.state.id === b.id) c.close(b.out ? 4002 : 4001, b.out ? "out" : "removed"); return Response.json({ ok: true }); }
    return new Response("not found", { status: 404 }); }
  onClose(c) { if (this.dev) this.dev.delete(c.id); const s = c.state; if (s && s.id && !this.roster(c.id).some(p => p.id === s.id)) { this.broadcast(JSON.stringify({ t: "out", id: s.id }));
      this.playOut(s.id);
      if (this.held) for (const [k, v] of this.held) if (k === s.id || v === s.id) this.held.delete(k);
      if (this.asks) this.asks.delete(s.id);
      if (this.lanes && BOWLS.leave(this.lanes, s.id)) { const x = JSON.stringify({ t: "bowl", op: "lanes", lanes: this.lanes }); for (const o of this.getConnections()) if (o !== c && o.state && o.state.at && o.state.at[5] === "bowling") o.send(x); }
      const tr = this.trades && this.trades.get(s.id); if (tr && tr.pay) this.tradeEnd(tr, "they left", s.id); else if (tr) { this.trades.delete(tr.a); this.trades.delete(tr.b); const o = [...this.getConnections()].find(x => x.state && x.state.id === (tr.a === s.id ? tr.b : tr.a)); if (o) o.send(JSON.stringify({ t: "tr", op: "x", why: "they left" })); }
      if (this.cars) for (const [k, v] of this.cars) if (v === s.id) { this.cars.delete(k); const a = s.at, v2 = a ? [a[0], a[1], a[3]].map(x => +(+x || 0).toFixed(3)).join(",") : null;
        if (v2) this.world().then(W => { W["car:" + k] = v2; this.ctx.storage.put("world", W); this.broadcast(JSON.stringify({ t: "car", k, by: null, at: v2 })); }); else this.broadcast(JSON.stringify({ t: "car", k, by: null })); } } }
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
// a trade's offer, cleaned: at most 16 kinds of things (1 to 9999 each), cash, and a painting's description for each painting in it (a copy keeps its mark: the masterwork, its score)
// the kinds of shared things a player may set on the block (the rest are refused): owner: only an owner (they tell everyone to read again); add: a counter, one at a time
const WORLD_KEYS = [{ re: /^time$/, owner: 1 }, { re: /^looks$/, owner: 1 }, { re: /^veh$/, owner: 1 }, { re: /^snd$/, owner: 1 }, { re: /^we$/, owner: 1 }, { re: /^riverbell$/ }, { re: /^riverbell:rung$/, add: 1 }, { re: /^cairn:\d{1,2}$/, add: 1 },
  { re: /^car:[\w-]{1,32}$/ }, { re: /^radio:[\w-]{1,32}$/ }, { re: /^paint:[\w-]{1,32}$/ }, { re: /^cst:[\w-]{1,32}$/ }, { re: /^gate:[\w-]{1,32}$/ }, { re: /^flag:[\w-]{1,32}$/ }, { re: /^tbl:[\w:-]{1,34}$/ }, { re: /^tag:[\w:.-]{1,34}$/ }];
// the stalls: their names, the rent a day, how many days ahead, the market's cut of a sale, how many kinds a stall shows
const STALL = { ids: ["s1", "s2", "s3", "s4", "s5"], rent: 15, days: 7, cut: .05, kinds: 12 };
// the exchange machines (src/159ba-exchange.js): the eye pays half an item's value (data/items.json) and the thing is gone
const EXCH = { pays: .5 }, exchVal = id => { const d = ITEMDATA[id]; const v = d && +d.value; return v > 0 && !(d && d.archived) ? v : 0; };
const stallPub = o => ({ who: o.who, name: o.name, until: o.until, goods: o.goods });
const BODY_LIFE = 3600000;   // an hour, then a body's things fall to the ground
const tradeNone = () => ({ items: {}, cash: 0, art: {} });
const tradeClean = o => { o = o && typeof o === "object" ? o : {}; const items = {}, art = {};
  for (const k of Object.keys(o.items || {}).slice(0, 16)) { const n = Math.floor(+o.items[k]); if (/^[a-z0-9_]{1,48}$/.test(k) && n >= 1 && n <= 9999) items[k] = n; }
  for (const k of Object.keys(o.art || {}).slice(0, 6)) { const a = o.art[k]; if (/^[a-z0-9]{6,40}$/.test(k) && a && typeof a === "object" && items["pt_" + k]) art[k] = { t: word(a.t, 40), by: word(a.by, 24), w: num(+a.w || 0, 1, 4096), h: num(+a.h || 0, 1, 4096), c: word(a.c, 16), fr: word(a.fr, 8), d: word(a.d, 16), e: num(+a.e || 0, 0, 1) }; const cp = a.cp; if (cp && typeof cp === "object") art[k].cp = { i: word(cp.i, 24), s: Math.round(num(+cp.s || 0, 0, 100)), b: Math.floor(num(+cp.b || 0, 0, 9)), a: word(cp.a, 40) }; }
  return { items, cash: Math.floor(num(+o.cash || 0, 0, 1e9)), art }; };
// what a game says it paid, never more than it offered
const tradeAtMost = (p, o) => { const r = { items: {}, cash: Math.min(p.cash, o.cash), art: {} }; for (const k in p.items) if (o.items[k]) r.items[k] = Math.min(p.items[k], o.items[k]); for (const k in p.art) if (r.items["pt_" + k]) r.art[k] = p.art[k]; return r; };
// what a player is worth, read from their saved things: cash (on you, in the bank, on your body) and things (your bag, the vault, your body)
const ECON = { cash: 2500, cashMin: 40, units: 600, unitsMin: 30, start: 1000, keys: ["inv", "bank", "vault", "corpse"] };
const econOf = get => { const J = k => { try { const v = get(k); return v == null ? null : JSON.parse(v); } catch (e) { return null; } };
  const items = {}, add = o => { if (o && typeof o === "object") for (const k in o) { const n = Math.floor(+o[k]); if (n > 0) items[k] = (items[k] || 0) + Math.min(n, 1e6); } };
  const inv = J("inv"), bank = J("bank"), vault = J("vault"), body = J("corpse"), n = v => Math.max(0, Math.min(1e9, Math.floor(+v || 0)));
  let cash = inv && inv.cash != null ? n(inv.cash) : ECON.start; if (inv) add(inv.items); if (bank) cash += n(bank.bal); if (vault) add(vault.items); if (body) { cash += n(body.cash); add(body.items); }
  return { cash, items }; };
const homeOf = env => env.Home.get(env.Home.idFromName("homes"));
const blockAsk = async (env, room, path, body) => { const s = await getServerByName(env.Block, room);
  const r = await s.fetch(new Request("https://block/" + path, { method: body ? "POST" : "GET", body: body ? JSON.stringify(body) : undefined, headers: { "x-partykit-room": room, "content-type": "application/json" } }));
  return r.json(); };
const newCode = () => { const A = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789", b = crypto.getRandomValues(new Uint8Array(8)); let s = ""; for (const x of b) s += A[x % 32]; return "MARKET-" + s.slice(0, 4) + "-" + s.slice(4); };
// one request per 100 emails (Resend's batch), so a message to everyone stays under the worker's subrequest limit
async function email(env, to, subject, text, why = {}) {
  const from = env.MAIL_FROM || "THE MARKET <market@auth.thestrangestfleamarket.com>"; let n = 0;
  for (let i = 0; i < to.length; i += 100) { const part = to.slice(i, i + 100);
    const r = await fetch("https://api.resend.com/emails/batch", { method: "POST", headers: { Authorization: "Bearer " + env.RESEND_API_KEY, "content-type": "application/json" },
      body: JSON.stringify(part.map(x => ({ from, to: [x], subject, text }))) });
    if (r.ok) n += part.length; else why.t = r.status + " " + (await r.text()).slice(0, 200); }
  return n;
}
async function admin(env, b, origin) {
  const k = svc(env); if (!k && b.do !== "tell" && !/^art/.test(b.do || "")) return { why: "the server has no service key" };
  const call = (path, init = {}) => fetch(env.SUPABASE_URL + path, { ...init, headers: { ...k, "content-type": "application/json", Prefer: "return=minimal", ...(init.headers || {}) } });
  const res = async r => r.ok ? { ok: true } : { why: r.status + " " + (await r.text()).slice(0, 200) };
  const room = ROOM.test(b.room || "") ? b.room : SECROOMS[0], kick = id => Promise.all(SECROOMS.map(r => blockAsk(env, r, "kick", { id, out: 1 }).catch(() => {}))), id = String(b.id || ""), user = () => UUID.test(id);
  const users = async () => { if (!k) return []; const r = await call("/auth/v1/admin/users?per_page=1000"); return r.ok ? (await r.json()).users || [] : []; };
  if (b.do === "list") {
    { const P = postOf(env), gone = await P.botIds(); let all = true;   // the bots are gone (owner, 10 Nov 2026): their accounts and what they kept, cleared once
      for (const g of gone) { if (UUID.test(g) && k) { const r = await call("/auth/v1/admin/users/" + g, { method: "DELETE" }); if (!r.ok && r.status !== 404) { all = false; continue; } await call("/rest/v1/players?id=eq." + g, { method: "DELETE" }); } forget(g); await kick(g); }
      if (gone.length && all) await P.botsDrop(gone); }
    const [us, pl, ad, co, on] = await Promise.all([users(), call("/rest/v1/players?select=*").then(r => r.ok ? r.json() : []), call("/rest/v1/admins?select=*").then(r => r.ok ? r.json() : []),
      call("/rest/v1/invite_codes?select=*").then(r => r.ok ? r.json() : []), blockAsk(env, room, "who").catch(() => [])]), nm = await homeOf(env).namesAll().catch(() => ({})), pa = await homeOf(env).playAll().catch(() => ({}));
    return { ok: true, email: !!env.RESEND_API_KEY, codes: co, letters: await postOf(env).list(), asks: await postOf(env).asks(),
      users: us.map(x => ({ id: x.id, email: x.email, name: nm[x.id] || "", phone: x.phone || "", joined: x.created_at, last: x.last_sign_in_at, confirmed: x.email_confirmed_at, provider: x.app_metadata && x.app_metadata.provider,
        banned: x.banned_until && Date.parse(x.banned_until) > Date.now() ? x.banned_until : null, player: pl.find(p => p.id === x.id) || null, admin: ad.some(a => a.user_id === x.id), online: on.includes(x.id), play: pa[x.id] || null })) };
  }
  if (b.do === "code") { const n = Math.max(1, Math.min(1000, Math.floor(+b.uses || 1))), code = newCode();
    const r = await call("/rest/v1/invite_codes", { method: "POST", body: JSON.stringify({ code, uses: 0, max_uses: n }) }); return r.ok ? { ok: true, code } : res(r); }
  if (b.do === "codeoff") { const code = String(b.code || ""); if (!CODE.test(code)) return { why: "no such code" };
    const r = await call("/rest/v1/invite_codes?select=uses&code=eq." + encodeURIComponent(code)), c = r.ok ? (await r.json())[0] : null; if (!c) return { why: "no such code" };
    return res(await call("/rest/v1/invite_codes?code=eq." + encodeURIComponent(code), { method: "PATCH", body: JSON.stringify({ max_uses: c.uses }) })); }
  if (b.do === "askcode" || b.do === "askoff") { const m = String(b.email || "").trim().toLowerCase(); if (!MAIL.test(m)) return { why: "no such email" };
    if (b.do === "askoff") return { ok: await postOf(env).askOff(m) };
    if (!env.RESEND_API_KEY) return { why: "email is not set up" };
    const code = newCode(), r = await call("/rest/v1/invite_codes", { method: "POST", body: JSON.stringify({ code, uses: 0, max_uses: 1 }) }); if (!r.ok) return res(r);
    const w = {}, n = await email(env, [m], "YOUR INVITE TO THE STRANGEST FLEA MARKET", "Your invite code: " + code + "\n\nEnter it at " + origin + "/ to make your account.", w);
    if (!n) return { why: "the email did not go out (code " + code + "): " + (w.t || "?") };
    await postOf(env).askSent(m); return { ok: true, code }; }
  if (b.do === "tell") {
    const to = b.to === "*" ? "*" : id, subject = String(b.subject || "A LETTER FROM THE MARKET").slice(0, 120), text = String(b.text || "").slice(0, 4000).trim(), out = { ok: true };
    if (!text || (to !== "*" && !user())) return { why: "who to, and what?" };
    if (b.live) out.live = (await blockAsk(env, room, "tell", { to, text: text.slice(0, 500) }).catch(() => ({ n: 0 }))).n;
    if (b.letter) out.letter = await postOf(env).send(to, subject, text);
    if (b.email) out.email = env.RESEND_API_KEY ? await email(env, (await users()).filter(x => x.email && (to === "*" || x.id === to)).map(x => x.email).slice(0, 1000), subject, text) : "email is not set up";
    return out;
  }
  if (b.do === "ledger") { if (!user()) return { why: "no such player" }; return { ok: true, ledger: await homeOf(env).ledger(id) }; }
  if (b.do === "art" || b.do === "artget" || b.do === "artoff") { const H = homeOf(env), a = typeof b.art === "string" && /^a[a-z0-9]{6,40}$/.test(b.art) ? b.art : "";
    if (b.do === "art") return { ok: true, art: await H.artList() };
    if (!a) return { why: "no such painting" };
    if (b.do === "artget") { const d = await H.artAny(a); return d ? { ok: true, d } : { why: "no such painting" }; }
    return (await H.artOff(a)) ? { ok: true } : { why: "no such painting" }; }
  if (!user()) return { why: "no such player" };
  if (b.do === "user") {
    const a = {}; if (b.email) a.email = String(b.email).trim().toLowerCase(), a.email_confirm = true; if (b.password) a.password = String(b.password);
    if (a.email && !MAIL.test(a.email)) return { why: "that email doesn't look right" }; if (a.password && a.password.length < 8) return { why: "a password needs 8 letters or more" };
    if (Object.keys(a).length) { const r = await call("/auth/v1/admin/users/" + id, { method: "PUT", body: JSON.stringify(a) }); if (!r.ok) return res(r); }
    if (b.apt !== undefined) { const apt = b.apt === "" || b.apt === null ? null : Math.floor(+b.apt); if (apt !== null && !(apt > 0)) return { why: "an apartment is a number" };
      const r = await call("/rest/v1/players?id=eq." + id, { method: "PATCH", body: JSON.stringify({ apt }) }); if (!r.ok) return res(r); }
    return { ok: true };
  }
  // the full kit: the player's game hands it over at its next start (FORAGE.fullKit)
  if (b.do === "kit") { if (!user()) return { why: "no such player" }; await homeOf(env).econAllow(id, 0, 1e5, "kit"); return (await homeOf(env).ownedPut(id, { gift: "kit" })) ? { ok: true } : { why: "their save is full" }; }
  if (b.do === "admin") return res(b.on ? await call("/rest/v1/admins", { method: "POST", body: JSON.stringify({ user_id: id }) }) : await call("/rest/v1/admins?user_id=eq." + id, { method: "DELETE" }));
  if (b.do === "ban") { const r = await call("/auth/v1/admin/users/" + id, { method: "PUT", body: JSON.stringify({ ban_duration: b.on ? "876000h" : "none" }) });
    if (r.ok && b.on) { forget(id); await kick(id); } return res(r); }
  if (b.do === "delete") { const r = await call("/auth/v1/admin/users/" + id, { method: "DELETE" }); if (!r.ok) return res(r);
    forget(id); await kick(id); await call("/rest/v1/admins?user_id=eq." + id, { method: "DELETE" }); await call("/rest/v1/players?id=eq." + id, { method: "DELETE" }); return { ok: true }; }
  return { why: "unknown" };
}

// THE DISH: PETRI's arena for the whole market, the simulation (worker/dish.js) run here twenty times a second while anyone is in it;
// each player sends only how they steer, and gets back what is in their view ten times a second
export class Dish extends Server {
  static options = { hibernate: false };
  dish() { if (!this.S) { this.S = DISH.make(Math.floor(Math.random() * 1e9) + 1); this.S.ev = []; } return this.S; }
  snap(S) { return { t: S.t, cells: S.cells.map(c => [c.id, c.o, Math.round(c.x), Math.round(c.y), +c.m.toFixed(1), Math.round(c.vx), Math.round(c.vy), +(c.mt - S.t).toFixed(1)]), pellets: S.pellets.map(q => [q.id, Math.round(q.x), Math.round(q.y), q.c]), vir: S.viruses.map(v => [Math.round(v.x), Math.round(v.y), v.m, Math.round(v.vx), Math.round(v.vy)]),
    blobs: S.blobs.map(b => [Math.round(b.x), Math.round(b.y), b.m, b.c, Math.round(b.vx), Math.round(b.vy)]), players: Object.values(S.players).map(p => [p.id, p.name, p.col, p.dead, Math.round(p.best), p.eaten]), board: S.board }; }
  async onConnect(c, ctx) {
    const id = ctx.request.headers.get("x-tsfm-id") || ""; if (!id) return c.close(4001, "login");
    for (const o of this.getConnections()) if (o.id !== c.id && o.state && o.state.id === id) o.close(4000, "joined again");
    const S = this.dish(); c.setState({ id, cx: DISHK.DW / 2, cy: DISHK.DH / 2 }); if (!S.players[id]) DISH.join(S, id, "???", DISHK.COLS[Math.floor(Math.random() * DISHK.COLS.length)]);
    c.send(JSON.stringify({ t: "hi", you: id, S: this.snap(S) }));
    if (!this.timer) { this.last = Date.now(); this.n = 0; this.timer = setInterval(() => this.tick(), 50); }
  }
  onClose(c) { const S = this.S; if (S && c.state && c.state.id) DISH.leave(S, c.state.id); if (![...this.getConnections()].length && this.timer) { clearInterval(this.timer); this.timer = null; } }
  onError(c) { this.onClose(c); }
  onMessage(c, raw) {
    const s = c.state, S = this.S; if (!s || !S || typeof raw !== "string" || raw.length > 300) return; let m; try { m = JSON.parse(raw); } catch (e) { return; }
    const now = Date.now(), rl = c.rl || (c.rl = { t: now, n: 0 }); if (now - rl.t > 1000) { rl.t = now; rl.n = 0; } if (++rl.n > 40) return;
    const p = S.players[s.id]; if (!p) return;
    if (m.t === "in") DISH.input(S, s.id, num(m.dx, -1, 1), num(m.dy, -1, 1), !!m.s, !!m.e);
    else if (m.t === "name") { p.name = word(m.n, 12) || "???"; if (/^#[0-9a-f]{6}$/i.test(m.c || "")) p.col = m.c; }
    else if (m.t === "again") { if (p.dead) { p.eaten = 0; p.best = 0; DISH.spawn(S, p); } }
  }
  tick() { const S = this.S; if (!S) return; const now = Date.now(), dt = Math.min(.1, (now - this.last) / 1000); this.last = now; DISH.step(S, dt); if (++this.n % 2) return;
    const ev = S.ev.splice(0), vir = S.viruses.map(v => [Math.round(v.x), Math.round(v.y), v.m, Math.round(v.vx), Math.round(v.vy)]), blobs = S.blobs.map(b => [Math.round(b.x), Math.round(b.y), b.m, b.c, Math.round(b.vx), Math.round(b.vy)]);
    const who = Object.values(S.players).map(p => [p.id, p.name, p.col, p.dead, Math.round(p.best), p.eaten]);
    for (const c of this.getConnections()) { const s = c.state; if (!s) continue; const p = S.players[s.id]; if (!p) continue;
      let cx = 0, cy = 0, w = 0, mass = 0; for (const q of S.cells) if (q.o === s.id) { cx += q.x * q.m; cy += q.y * q.m; w += q.m; mass += q.m; } if (w) { s.cx = cx / w; s.cy = cy / w; }
      const z = 1 / (1 + Math.sqrt(Math.max(mass, 10)) / 20), rx = 256 / z, ry = 224 / z, cells = [];
      for (const q of S.cells) if (Math.abs(q.x - s.cx) < rx + q.r && Math.abs(q.y - s.cy) < ry + q.r) cells.push([q.id, q.o, Math.round(q.x), Math.round(q.y), +q.m.toFixed(1), Math.round(q.vx), Math.round(q.vy), +(q.mt - S.t).toFixed(1)]);
      c.send(JSON.stringify({ t: "tk", t2: +S.t.toFixed(2), cells, vir, blobs, ev, board: S.board, who, me: [p.dead, Math.round(p.best), p.eaten, p.n, p.ate || ""] })); } }
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
  // the arcade's high scores: the hundred best runs a cabinet are kept, the ten best shown
  scoresT() { this.sql.exec("create table if not exists scores(id integer primary key autoincrement, cab text, who text, ini text, score integer, sub text, at integer)"); }
  top(cab) { this.scoresT(); const rows = this.sql.exec(cab === "*" ? "select cab, ini, score, sub from scores order by score desc, id" : "select cab, ini, score, sub from scores where cab = ? order by score desc, id limit 10", ...(cab === "*" ? [] : [cab])).toArray();
    if (cab !== "*") return rows.map(r => ({ ini: r.ini, score: r.score, sub: r.sub })); const all = {}; for (const r of rows) { const l = all[r.cab] || (all[r.cab] = []); if (l.length < 10) l.push({ ini: r.ini, score: r.score, sub: r.sub }); } return all; }
  score(cab, who, ini, score, sub) { this.scoresT(); this.sql.exec("insert into scores(cab, who, ini, score, sub, at) values(?, ?, ?, ?, ?, ?)", cab, who, ini, score, sub, Date.now());
    this.sql.exec("delete from scores where cab = ? and id not in (select id from scores where cab = ? order by score desc, id limit 100)", cab, cab);
    const top = this.top(cab), rank = this.sql.exec("select count(*) as n from scores where cab = ? and score > ?", cab, score).toArray()[0].n + 1; return { ok: true, top, rank }; }
  // the owner's words over the game's text boxes (TEXT in the game), one row a text box
  texts() { this.sql.exec("create table if not exists texts(k text primary key, t text, at integer)"); const o = {}; for (const r of this.sql.exec("select k, t from texts").toArray()) o[r.k] = r.t; return o; }
  putText(k, t) { this.sql.exec("create table if not exists texts(k text primary key, t text, at integer)"); if (t) this.sql.exec("insert into texts(k, t, at) values(?, ?, ?) on conflict(k) do update set t = excluded.t, at = excluded.at", k, t, Date.now()); else this.sql.exec("delete from texts where k = ?", k); return true; }
  // what the bots left (removed 10 Nov 2026): their ids, then their rows, test results, screenshots, key and AI memory dropped
  botIds() { return this.sql.exec("select name from sqlite_master where type = 'table' and name = 'bots'").toArray().length ? this.sql.exec("select id from bots").toArray().map(r => r.id) : []; }
  async botsDrop(ids) { for (const id of ids) await this.ctx.storage.delete("twin:" + id); await this.ctx.storage.delete("botkey"); this.sql.exec("drop table if exists bots"); this.sql.exec("drop table if exists tests");
    if (this.sql.exec("select name from sqlite_master where type = 'table' and name = 'files'").toArray().length) this.sql.exec("delete from files where k like 'bs-%'"); return true; }
  // who asked for an invite at the door (at most 2000 waiting)
  askT() { this.sql.exec("create table if not exists asks(email text primary key, at integer, sent integer)"); }
  ask(m) { this.askT(); if (this.sql.exec("select count(*) as n from asks where sent is null").toArray()[0].n >= 2000) return true;
    this.sql.exec("insert or ignore into asks(email, at) values(?, ?)", m, Date.now()); return true; }
  asks() { this.askT(); return this.sql.exec("select email, at, sent from asks order by at desc limit 500").toArray(); }
  askSent(m) { this.askT(); this.sql.exec("update asks set sent = ? where email = ?", Date.now(), m); return true; }
  askOff(m) { this.askT(); this.sql.exec("delete from asks where email = ?", m); return true; }
  // shared files, kept in 1 MB parts
  putFile(k, type, buf) { this.sql.exec("create table if not exists files(k text, part integer, type text, data blob, at integer, primary key(k, part))"); this.sql.exec("delete from files where k = ?", k);
    for (let i = 0, n = 0; i < buf.byteLength; i += 1 << 20, n++) this.sql.exec("insert into files(k, part, type, data, at) values(?, ?, ?, ?, ?)", k, n, type, buf.slice(i, i + (1 << 20)), Date.now()); return true; }
  getFile(k) { this.sql.exec("create table if not exists files(k text, part integer, type text, data blob, at integer, primary key(k, part))");
    const rows = this.sql.exec("select type, data from files where k = ? order by part", k).toArray(); if (!rows.length) return null;
    const parts = rows.map(r => new Uint8Array(r.data)), out = new Uint8Array(parts.reduce((a, b) => a + b.length, 0)); let o = 0; for (const q of parts) { out.set(q, o); o += q.length; } return { type: rows[0].type, data: out.buffer }; }
}

// HOMES: each player's apartment as they decorated it (the room editor), one row a player; and what they own (OWNED)
export class Home extends DurableObject {
  constructor(ctx, env) { super(ctx, env); this.sql = ctx.storage.sql; this.sql.exec("create table if not exists homes(who text primary key, room text, at integer)"); }
  get(id) { const r = this.sql.exec("select room from homes where who = ?", id).toArray()[0]; try { return r ? JSON.parse(r.room) : null; } catch (e) { return null; } }
  tenants() { this.nameT(); return this.sql.exec("select n.who as who, n.name as name from names n union select h.who, null from homes h where h.who not in (select who from names) limit 2000").toArray().map(r => ({ who: r.who, name: r.name || null })); }
  put(id, room) { this.sql.exec("insert into homes(who, room, at) values(?, ?, ?) on conflict(who) do update set room = excluded.room, at = excluded.at", id, room, Date.now()); return true; }
  // each player's owned things, a row a key (at most 2 MB a player)
  ownedT() { this.sql.exec("create table if not exists owned(who text, k text, v text, at integer, primary key(who, k))"); }
  // every citizen's passport number, issued in order from 1000 the first time the game asks
  passport(id) { this.sql.exec("create table if not exists passports(who text primary key, no integer, at integer)"); const r = this.sql.exec("select no from passports where who = ?", id).toArray()[0]; if (r) return r.no;
    const no = this.sql.exec("select coalesce(max(no), 999) + 1 as no from passports").toArray()[0].no; this.sql.exec("insert into passports(who, no, at) values(?, ?, ?)", id, no, Date.now()); return no; }
  // every citizen's name, one a player and no two alike (low: the name in small letters, for the check)
  nameT() { this.sql.exec("create table if not exists names(who text primary key, name text, low text unique, at integer)"); }
  playT() { this.sql.exec("create table if not exists play(who text primary key, ms integer, n integer, last integer)"); }
  playAdd(id, ms, n) { this.playT(); this.sql.exec("insert into play(who, ms, n, last) values(?, ?, ?, ?) on conflict(who) do update set ms = ms + excluded.ms, n = n + excluded.n, last = excluded.last", id, Math.max(0, Math.min(ms, 864e5)), n, Date.now()); return true; }
  playAll() { this.playT(); const o = {}; for (const r of this.sql.exec("select who, ms, n, last from play").toArray()) o[r.who] = { ms: r.ms, n: r.n, last: r.last }; return o; }
  namesAll() { this.nameT(); const o = {}; for (const r of this.sql.exec("select who, name from names").toArray()) o[r.who] = r.name; return o; }
  nameGet(id) { this.nameT(); const r = this.sql.exec("select name from names where who = ?", id).toArray()[0]; return r ? r.name : null; }
  nameClaim(id, name) { this.nameT(); const low = name.toLowerCase(), r = this.sql.exec("select who from names where low = ?", low).toArray()[0]; if (r && r.who !== id) return false;
    this.sql.exec("insert into names(who, name, low, at) values(?, ?, ?, ?) on conflict(who) do update set name = excluded.name, low = excluded.low, at = excluded.at", id, name, low, Date.now()); return true; }
  ownedGet(id) { this.ownedT(); const o = {}; for (const r of this.sql.exec("select k, v from owned where who = ?", id).toArray()) o[r.k] = r.v; return o; }
  // the money check: what you own only grows as fast as play allows (a bucket of cash and of things that refills a minute at a time; a trade or an owners' gift adds to it); more than that is not kept
  econT() { this.sql.exec("create table if not exists econ(who text primary key, cb real, ib real, at integer)"); this.sql.exec("create table if not exists ledger(who text, at integer, dc integer, du integer, cut integer, note text)"); }
  econGet(id) { this.econT(); const now = Date.now(), r = this.sql.exec("select cb, ib, at from econ where who = ?", id).toArray()[0], e = r ? { cb: r.cb, ib: r.ib } : { cb: ECON.cash, ib: ECON.units }, m = r ? Math.max(0, (now - r.at) / 60000) : 0;
    e.cb = Math.max(e.cb, Math.min(ECON.cash, e.cb + m * ECON.cashMin)); e.ib = Math.max(e.ib, Math.min(ECON.units, e.ib + m * ECON.unitsMin)); return e; }
  econSet(id, e) { this.sql.exec("insert into econ(who, cb, ib, at) values(?, ?, ?, ?) on conflict(who) do update set cb = excluded.cb, ib = excluded.ib, at = excluded.at", id, Math.min(1e9, e.cb), Math.min(1e9, e.ib), Date.now()); }
  econNote(id, dc, du, cut, note) { this.sql.exec("insert into ledger(who, at, dc, du, cut, note) values(?, ?, ?, ?, ?, ?)", id, Date.now(), dc, du, cut, note || ""); this.sql.exec("delete from ledger where at < ?", Date.now() - 14 * 864e5); }
  betaKit(id, units) { this.sql.exec("create table if not exists once(who text, k text, primary key(who, k))"); if (this.sql.exec("select 1 from once where who = ? and k = 'betakit'", id).toArray().length) return false; this.sql.exec("insert into once(who, k) values(?, 'betakit')", id); return this.econAllow(id, 0, units, "beta kit"); }
  econAllow(id, cash, units, note) { const e = this.econGet(id); e.cb += Math.max(0, +cash || 0); e.ib += Math.max(0, +units || 0); this.econSet(id, e); this.econNote(id, 0, 0, 0, "allow " + (note || "") + " $" + Math.floor(+cash || 0) + " +" + Math.floor(+units || 0)); return true; }
  // paying from the server's own copy of the pack (a stall's rent, goods set out or bought, a trade's side): what isn't there isn't taken, and nothing changes hands
  econPay(id, cash, items, note) { const c = Math.max(0, Math.floor(+cash || 0)), it = {}; for (const k in items || {}) { const n = Math.floor(+items[k] || 0); if (n > 0) it[k] = n; }
    const had = this.ownedGet(id); let inv = null; try { inv = JSON.parse(had.inv || "null"); } catch (e) {} if (!inv || typeof inv !== "object") inv = { v: 1, items: {}, cash: ECON.start }; inv.items = inv.items || {};
    if (Math.floor(+inv.cash || 0) < c) return { ok: false, why: "not enough money" };
    for (const k in it) if (Math.floor(+inv.items[k] || 0) < it[k]) return { ok: false, why: "you do not have that" };
    if (!c && !Object.keys(it).length) return { ok: true };
    inv.cash = Math.floor(+inv.cash || 0) - c; for (const k in it) { inv.items[k] -= it[k]; if (inv.items[k] <= 0) delete inv.items[k]; }
    if (!this.ownedPut(id, { inv: JSON.stringify(inv) })) return { ok: false, why: "the save is full" };
    this.econNote(id, -c, 0, 0, "paid " + (note || "") + " $" + c + " " + JSON.stringify(it).slice(0, 160)); return { ok: true }; }
  // a payment handed back (it lost a race): straight into the server's copy of the pack
  econGive(id, cash, items, note) { const had = this.ownedGet(id); let inv = null; try { inv = JSON.parse(had.inv || "null"); } catch (e) {} if (!inv || typeof inv !== "object") inv = { v: 1, items: {}, cash: ECON.start }; inv.items = inv.items || {};
    inv.cash = Math.floor(+inv.cash || 0) + Math.max(0, Math.floor(+cash || 0)); for (const k in items || {}) { const n = Math.floor(+items[k] || 0); if (n > 0) inv.items[k] = (Math.floor(+inv.items[k] || 0)) + n; }
    this.ownedPut(id, { inv: JSON.stringify(inv) }); this.econNote(id, 0, 0, 0, "refund " + (note || "")); return true; }
  ledger(id) { this.econT(); return this.sql.exec("select at, dc, du, cut, note from ledger where who = ? order by at desc limit 200", id).toArray(); }
  ownedSave(id, put) { if (!ECON.keys.some(k => k in put)) return { ok: this.ownedPut(id, put) };
    const had = this.ownedGet(id), after = { ...had }; for (const k in put) { if (put[k] === null) delete after[k]; else after[k] = put[k]; }
    const A = econOf(k => had[k]), B = econOf(k => after[k]), e = this.econGet(id), dc = B.cash - A.cash; let du = 0; const up = {};
    for (const k in B.items) { const g = B.items[k] - (A.items[k] || 0); if (g > 0) { up[k] = g; du += g; } }
    const clip = { cash: 0, items: {} };
    if (dc > e.cb) clip.cash = Math.ceil(dc - e.cb);
    if (du > e.ib) { let left = Math.floor(e.ib); for (const k of Object.keys(up).sort()) { const keep = Math.min(up[k], left); left -= keep; if (up[k] > keep) clip.items[k] = up[k] - keep; } }
    const cut = clip.cash > 0 || Object.keys(clip.items).length > 0;
    if (cut) { const J = k => { try { const o = JSON.parse(after[k] || "null"); return o && typeof o === "object" ? o : null; } catch (e) { return null; } }, fix = {};
      const inv = J("inv") || { cash: ECON.start, items: {} }, bank = J("bank"), vault = J("vault"), body = J("corpse");
      let c = clip.cash; for (const [o, f] of [[inv, "cash"], [bank, "bal"], [body, "cash"]]) { if (!o || c <= 0) continue; const v = Math.max(0, Math.floor(+o[f] || 0)), t = Math.min(v, c); o[f] = v - t; c -= t; }
      for (const k in clip.items) { let n = clip.items[k]; for (const o of [inv, vault, body]) { if (!o || !o.items || n <= 0) continue; const v = Math.max(0, Math.floor(+o.items[k] || 0)), t = Math.min(v, n); o.items[k] = v - t; if (!o.items[k]) delete o.items[k]; n -= t; } }
      put = { ...put, inv: JSON.stringify(inv) }; if (bank) put.bank = JSON.stringify(bank); if (vault) put.vault = JSON.stringify(vault); if (body) put.corpse = JSON.stringify(body); clip.fix = { inv: put.inv, bank: put.bank, vault: put.vault, corpse: put.corpse }; }
    if (!this.ownedPut(id, put)) return { ok: false };
    e.cb -= Math.max(0, dc - clip.cash); e.ib -= Math.max(0, du - Object.values(clip.items).reduce((a, b) => a + b, 0)); this.econSet(id, e);
    if (dc || du || cut) this.econNote(id, dc, du, cut ? 1 : 0, cut ? "cut $" + clip.cash + " " + JSON.stringify(clip.items).slice(0, 200) : "");
    return cut ? { ok: true, clip } : { ok: true }; }
  ownedAdd(id, k, x) { this.ownedT(); const r = this.sql.exec("select v from owned where who = ? and k = ?", id, k).toArray()[0]; let L = []; try { L = JSON.parse(r ? r.v : "[]"); } catch (e) {} if (!Array.isArray(L)) L = []; L.push(x); return this.ownedPut(id, { [k]: JSON.stringify(L.slice(-50)) }); }
  ownedPut(id, put) { this.ownedT(); const now = Date.now(), had = this.ownedGet(id); let n = 0; for (const k in had) n += k in put ? 0 : had[k].length; for (const k in put) n += put[k] === null ? 0 : put[k].length;
    if (n > 2 << 20) return false;
    for (const k in put) { if (put[k] === null) this.sql.exec("delete from owned where who = ? and k = ?", id, k); else this.sql.exec("insert into owned(who, k, v, at) values(?, ?, ?, ?) on conflict(who, k) do update set v = excluded.v, at = excluded.at", id, k, put[k], now); }
    return true; }
  // the park orchard: eight plots a section (plot 0 to 7), one a player
  orchT() { this.sql.exec("create table if not exists orchard(sec text, plot integer, who text, d text, at integer, primary key(sec, plot))"); }
  orchList(sec) { this.orchT(); this.nameT(); return this.sql.exec("select o.plot as plot, o.who as who, n.name as name, o.d as d, o.at as at from orchard o left join names n on n.who = o.who where o.sec = ?", sec).toArray().map(r => { let d = null; try { d = JSON.parse(r.d); } catch (e) {} return { plot: r.plot, who: r.who, name: r.name || null, d, at: r.at }; }); }
  orchClaim(sec, who, want) { this.orchT(); const mine = this.sql.exec("select plot from orchard where sec = ? and who = ?", sec, who).toArray()[0]; if (mine) return { plot: mine.plot };
    const old = Date.now() - 60 * 864e5, rows = this.sql.exec("select plot, at from orchard where sec = ?", sec).toArray(), free = i => { const r = rows.find(x => x.plot === i); return !r || r.at < old; };
    const i = want >= 0 && want < 8 && free(want) ? want : [0, 1, 2, 3, 4, 5, 6, 7].find(free); if (i == null) return { why: "every plot is taken" };
    this.sql.exec("insert into orchard(sec, plot, who, d, at) values(?, ?, ?, ?, ?) on conflict(sec, plot) do update set who = excluded.who, d = excluded.d, at = excluded.at", sec, i, who, "{}", Date.now()); return { plot: i }; }
  orchPut(sec, who, d) { this.orchT(); const r = this.sql.exec("select plot from orchard where sec = ? and who = ?", sec, who).toArray()[0]; if (!r) return false;
    this.sql.exec("update orchard set d = ?, at = ? where sec = ? and plot = ?", d, Date.now(), sec, r.plot); return true; }
  orchLeave(sec, who) { this.orchT(); this.sql.exec("delete from orchard where sec = ? and who = ?", sec, who); return true; }
  // paintings: a picture in 1 MB parts; its painter alone writes it while it is unfinished, nobody once it is finished; 96 MB a painter
  artT() { this.sql.exec("create table if not exists art(id text, part integer, who text, fin integer, d text, at integer, primary key(id, part))"); }
  artGet(k, who) { this.artT(); if (!k) return null; const r = this.sql.exec("select who, fin, d from art where id = ? order by part", k).toArray(); if (!r.length || r[0].fin === 2 || (!r[0].fin && r[0].who !== who)) return null;
    return { d: r.map(x => x.d).join(""), fin: r[0].fin, by: r[0].who }; }
  artPut(k, who, d, fin) { this.artT(); const had = this.sql.exec("select who, fin from art where id = ? limit 1", k).toArray()[0];
    if (had && had.who !== who) return "not yours"; if (had && had.fin === 2) return "taken down"; if (had && had.fin) return "finished";
    const used = this.sql.exec("select coalesce(sum(length(d)), 0) as n from art where who = ? and id != ?", who, k).toArray()[0].n; if (used + d.length > 96 << 20) return "full";
    this.ctx.storage.transactionSync(() => { this.sql.exec("delete from art where id = ?", k); for (let i = 0, n = 0; i < d.length; i += 1 << 20, n++) this.sql.exec("insert into art(id, part, who, fin, d, at) values(?, ?, ?, ?, ?, ?)", k, n, who, fin, d.slice(i, i + (1 << 20)), Date.now()); });
    return true; }
  // the owner's panel: every finished painting (no pictures), one picture, and a takedown (the picture goes; its id stays, marked fin 2, so it can't be put back)
  artOffed(k) { this.artT(); return !!k && this.sql.exec("select 1 from art where id = ? and fin = 2 limit 1", k).toArray().length > 0; }
  artList() { this.artT(); return this.sql.exec("select id, who, sum(length(d)) as n, max(at) as at from art where fin = 1 group by id order by at desc limit 500").toArray(); }
  artAny(k) { this.artT(); const r = this.sql.exec("select d from art where id = ? and fin = 1 order by part", k).toArray(); return r.length ? r.map(x => x.d).join("") : null; }
  artOff(k) { this.artT(); const r = this.sql.exec("select who from art where id = ? limit 1", k).toArray()[0]; if (!r) return false;
    this.ctx.storage.transactionSync(() => { this.sql.exec("delete from art where id = ?", k); this.sql.exec("insert into art(id, part, who, fin, d, at) values(?, 0, ?, 2, '', ?)", k, r.who, Date.now()); }); return true; }
  artDel(k, who) { this.artT(); const r = this.sql.exec("select who, fin from art where id = ? limit 1", k).toArray()[0]; if (!r || r.who !== who || r.fin) return false; this.sql.exec("delete from art where id = ?", k); return true; }
}
