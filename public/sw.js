const CACHE = "cyber-doc-shell-v3";
const DEV_PATHS = ["/@vite/", "/@react-refresh", "/__next", "/node_modules/"];

self.addEventListener("install", event => event.waitUntil(self.skipWaiting()));

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(key => key !== CACHE).map(key => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", event => {
  const request = event.request;
  const url = new URL(request.url);
  if (request.method !== "GET" || url.origin !== self.location.origin || DEV_PATHS.some(path => url.pathname.startsWith(path))) return;

  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then(response => {
          if (response.ok) caches.open(CACHE).then(cache => cache.put(request, response.clone()));
          return response;
        })
        .catch(() => caches.match(request).then(response => response || caches.match("/")))
    );
    return;
  }

  const isStaticAsset = /\.(?:css|js|mjs|png|jpe?g|webp|svg|gif|ico|woff2?|lottie)$/i.test(url.pathname);
  if (!isStaticAsset) return;
  event.respondWith(
    caches.match(request).then(cached => cached || fetch(request).then(response => {
      if (response.ok) caches.open(CACHE).then(cache => cache.put(request, response.clone()));
      return response;
    }))
  );
});
