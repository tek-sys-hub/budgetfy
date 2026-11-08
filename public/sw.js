// Offline-ready Service Worker for budgetfy
const CACHE_NAME = 'budgetfy-cache-v3';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  // Only handle GET requests
  if (event.request.method !== 'GET') return;

  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        // When online, cache valid responses for offline use
        if (networkResponse && networkResponse.status === 200 && networkResponse.type !== 'opaque') {
          const responseClone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
        }
        return networkResponse;
      })
      .catch(async () => {
        // When offline, serve from cache
        const cached = await caches.match(event.request);
        if (cached) return cached;

        // Fallback for page navigation when offline
        if (event.request.mode === 'navigate') {
          return (await caches.match('/')) || (await caches.match('/index.html'));
        }
      })
  );
});
