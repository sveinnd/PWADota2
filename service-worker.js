const cacheName = "dota2heroes-v1";
const preCache = [
  "/",
  "/index.html",
  "/manifest.json",
  "https://cdn.jsdelivr.net/npm/bootstrap@5.3.0-alpha1/dist/css/bootstrap.min.css"
];

self.addEventListener("install", (e) => {
  console.log("✅ Service Worker Installed");
  e.waitUntil(
    caches.open(cacheName).then((cache) => cache.addAll(preCache))
  );
});

self.addEventListener("activate", (e) => {
  console.log("♻️ Service Worker Activated");
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.map((key) => {
          if (key !== cacheName) {
            console.log("🗑 Deleting old cache:", key);
            return caches.delete(key);
          }
        })
      )
    )
  );
});

self.addEventListener("fetch", (e) => {
  e.respondWith(
    caches.match(e.request).then((cachedResponse) => {
      if (cachedResponse) return cachedResponse;

      return fetch(e.request)
        .then((networkResponse) => {
          return caches.open(cacheName).then((cache) => {
            cache.put(e.request, networkResponse.clone());
            return networkResponse;
          });
        })
        .catch((error) => {
          console.warn("⚠️ Fetch failed:", error);
          if (e.request.mode === "navigate") {
            return caches.match("/index.html");
          }
        });
    })
  );
});
