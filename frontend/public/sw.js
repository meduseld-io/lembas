const CACHE_NAME = 'lembas-v7';

// On install, cache everything the browser has already requested
// (the precache list approach fails because hashed asset names change each build)
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) =>
      cache.addAll([
        '/',
        '/index.html',
        '/manifest.json',
        '/logo.png',
        '/favicon.ico',
        '/apple-touch-icon.png',
      ])
    )
  );
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
      )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (e) => {
  // Only handle GET requests for same-origin or cdn assets
  if (e.request.method !== 'GET') return;

  const url = new URL(e.request.url);

  // For navigation requests (HTML pages), use cache-first with network fallback
  if (e.request.mode === 'navigate') {
    e.respondWith(
      caches.match('/index.html').then((cached) => {
        if (cached) return cached;
        return fetch(e.request).then((res) => {
          const clone = res.clone();
          caches.open(CACHE_NAME).then((c) => c.put(e.request, clone));
          return res;
        });
      })
    );
    return;
  }

  // For JS/CSS/image assets: cache-first, update in background
  e.respondWith(
    caches.match(e.request).then((cached) => {
      const networkFetch = fetch(e.request).then((res) => {
        if (res.ok) {
          const clone = res.clone();
          caches.open(CACHE_NAME).then((c) => c.put(e.request, clone));
        }
        return res;
      });

      // Return cached immediately if available, otherwise wait for network
      return cached || networkFetch;
    })
  );
});
