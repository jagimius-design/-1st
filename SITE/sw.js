// Cache-first, refreshed in the background, so the site works offline after one visit.
// Bump VERSION when the file list changes.
const VERSION = "v1";
const FILES = ["./", "index.html", "invoice.html", "style.css", "config.js", "invoice-core.js",
  "invoice.js", "register-sw.js", "manifest.webmanifest", "icon.svg"];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(VERSION).then((c) => c.addAll(FILES)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (e) => {
  e.waitUntil(caches.keys()
    .then((keys) => Promise.all(keys.filter((k) => k !== VERSION).map((k) => caches.delete(k))))
    .then(() => self.clients.claim()));
});

self.addEventListener("fetch", (e) => {
  if (e.request.method !== "GET" || new URL(e.request.url).origin !== location.origin) return;
  e.respondWith(caches.open(VERSION).then(async (cache) => {
    const hit = await cache.match(e.request, { ignoreSearch: true });
    const net = fetch(e.request).then((res) => {
      if (res.ok) cache.put(e.request, res.clone());
      return res;
    }).catch(() => hit);
    return hit || net;
  }));
});
