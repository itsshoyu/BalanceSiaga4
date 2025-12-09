const CACHE_NAME = "balance-siaga-cache-v1";
const ASSETS_TO_CACHE = [
  "/",
  "/index.html",
  "/icon-192x192.png",
  "/icon-512x512.png",
  "/manifest.webmanifest",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      );
    })
  );
});

self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((cacheRes) => {
      return (
        cacheRes ||
        fetch(event.request).catch(() => caches.match("/index.html"))
      );
    })
  );
});
