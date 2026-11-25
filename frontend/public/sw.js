const CACHE_NAME = 'lembas-v10';

const PRECACHE = [
  '/',
  '/index.html',
  '/manifest.json',
  '/logo.png',
  '/favicon.ico',
  '/apple-touch-icon.png',
  '/icon-192.png',
  '/icon-512.png',
  '/icon-maskable-512.png',
];

// Vite gives the built JS/CSS hashed names, so read them out of index.html at install time.
// Without this, the first visit's app bundle is fetched before the worker is active and never
// cached, and the app opens blank the first time it is launched from the home screen offline.
async function precache() {
  const cache = await caches.open(CACHE_NAME);
  await cache.addAll(PRECACHE);
  try {
    const html = await (await cache.match('/index.html')).text();
    const assets = [...html.matchAll(/(?:src|href)="(\/assets\/[^"]+)"/g)].map((m) => m[1]);
    await cache.addAll([...new Set(assets)]);
  } catch (err) {
    // Assets are still cached on first use by the fetch handler below.
    console.warn('Lembas: could not precache app assets', err);
  }
}

self.addEventListener('install', (e) => {
  e.waitUntil(precache());
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
  if (e.request.method !== 'GET') return;

  const url = new URL(e.request.url);

  // Only handle same-origin requests
  if (url.origin !== self.location.origin) return;

  // Navigation requests (HTML pages): network-first, fall back to cached index.html.
  // Do NOT respond with a redirect - Safari rejects opaque redirects from service workers.
  if (e.request.mode === 'navigate') {
    e.respondWith(
      fetch(e.request).then((res) => {
        // Only cache successful, non-redirected responses
        if (res.ok && res.type === 'basic') {
          const clone = res.clone();
          caches.open(CACHE_NAME).then((c) => c.put('/index.html', clone));
        }
        return res;
      }).catch(() => {
        // Offline fallback: serve cached index.html
        return caches.match('/index.html');
      })
    );
    return;
  }

  // Assets: cache-first, update in background
  e.respondWith(
    // ignoreVary: a 'Vary: Origin' header would otherwise stop module scripts matching the precache.
    caches.match(e.request, { ignoreVary: true }).then((cached) => {
      const networkFetch = fetch(e.request).then((res) => {
        if (res.ok && res.type === 'basic') {
          const clone = res.clone();
          caches.open(CACHE_NAME).then((c) => c.put(e.request, clone));
        }
        return res;
      }).catch(() => cached);

      return cached || networkFetch;
    })
  );
});
