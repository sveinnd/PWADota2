const cacheName = "woilahhdotacik-v1";
const preCache = [
  "/",
  "/index.html", 
  "https://cdn.jsdelivr.net/npm/bootstrap@5.3.0-alpha1/dist/css/bootstrap.min.css"
];

self.addEventListener("install", (e) => {
  console.log("Service worker installed");

  e.waitUntil(
    (async () => {
      const cache = await caches.open(cacheName);
      await cache.addAll(preCache);
    })()
  );
});

self.addEventListener("activate", (e) => {
  console.log("Service worker activated");

  e.waitUntil(
    (async () => {
      const keys = await caches.keys();
      // Hapus cache lama jika ada versi berbeda
      await Promise.all(
        keys.map((key) => {
          if (key !== cacheName) {
            console.log(`Deleting old cache: ${key}`);
            return caches.delete(key);
          }
        })
      );
    })()
  );
});

self.addEventListener("fetch", (e) => {
  e.respondWith(
    (async () => {
      const cache = await caches.open(cacheName);
      const resCache = await cache.match(e.request);

      if (resCache) return resCache;

      try {
        const res = await fetch(e.request);

        // Cache hasil respons
        cache.put(e.request, res.clone());
        return res;
      } catch (error) {
        console.error("Fetch failed; returning offline page instead.", error);

        // Fallback jika fetch gagal (misalnya jika offline)
        if (e.request.mode === "navigate") {
          return cache.match("/index.html"); // Halaman fallback
        }
      }
    })()
  );
});
