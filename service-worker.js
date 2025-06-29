const cacheName = "dota2heroes-v1";
const preCache = [
  "/",
  "/index.html",
  "/manifest.json",
  "/icons/str.png", // contoh ikon lokal
  "/assets/heroes/axe.png", // contoh hero lokal
  // tambahkan file lokal lainnya sesuai kebutuhan
];

self.addEventListener("install", (e) => {
  console.log("✅ Service Worker Installed");
  e.waitUntil(
    caches.open(cacheName).then((cache) => {
      return cache.addAll(preCache);
    })
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
          // Jangan cache jika berasal dari domain luar (CORS/opaque)
          if (
            e.request.url.startsWith(self.location.origin)
          ) {
            return caches.open(cacheName).then((cache) => {
              cache.put(e.request, networkResponse.clone());
              return networkResponse;
            });
          } else {
            return networkResponse;
          }
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
