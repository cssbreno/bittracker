const CACHE = "bittracker-v4";
const ASSETS = [
  "/bittracker/",
  "/bittracker/index.html",
  "/bittracker/css/style.css",
  "/bittracker/js/script.js",
  "/bittracker/favicon.ico",
];

self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(CACHE).then((c) => c.addAll(ASSETS)).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (e) => {
  // Ignora requisições de API (RAWG) — sempre vai para a rede
  if (e.request.url.includes("api.rawg.io")) return;

  e.respondWith(
    caches.match(e.request).then((cached) => {
      if (cached) return cached;
      return fetch(e.request).then((res) => {
        if (!res || res.status !== 200 || res.type === "opaque") return res;
        const clone = res.clone();
        caches.open(CACHE).then((c) => c.put(e.request, clone));
        return res;
      }).catch(() => caches.match("/bittracker/index.html"));
    })
  );
});
