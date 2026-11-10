// THE KEEPER: the website's service worker. It keeps the game's own files (/g/, each named by its content) on the device, so the next visit reads them from there; the page itself always comes from the website.
const KEEP = new Set(__KEEP__), NAME = "g";
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", e => e.waitUntil((async () => {
  const c = await caches.open(NAME); for (const r of await c.keys()) if (!KEEP.has(new URL(r.url).pathname)) await c.delete(r);
  await self.clients.claim(); })()));
self.addEventListener("fetch", e => { const q = e.request, u = new URL(q.url);
  if (q.method !== "GET" || u.origin !== location.origin || !KEEP.has(u.pathname) || q.headers.has("range")) return;
  e.respondWith((async () => { const c = await caches.open(NAME), hit = await c.match(u.pathname, { ignoreVary: true }); if (hit) return hit;
    const r = await fetch(q); if (r.status === 200 && r.type === "basic") e.waitUntil(c.put(u.pathname, r.clone()).catch(() => {})); return r; })()); });
