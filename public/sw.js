// Service Worker for Performance Optimization
const CACHE_NAME = 'etimad-mart-v1';
const STATIC_CACHE = 'static-v1';

// Cache static assets
const STATIC_ASSETS = [
  '/',
  '/static/js/bundle.js',
  '/static/css/main.css',
  '/trimmer.webp',
  '/mehndi.webp',
  '/beauty.webp',
  '/loadingCard.png'
];

// Cache API responses for short time
const API_CACHE_TIME = 5 * 60 * 1000; // 5 minutes

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then(cache => cache.addAll(STATIC_ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME && cacheName !== STATIC_CACHE) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Cache images with stale-while-revalidate
  if (request.destination === 'image') {
    event.respondWith(
      caches.open(CACHE_NAME).then(cache => {
        return cache.match(request).then(response => {
          if (response) {
            // Serve from cache, update in background
            fetch(request).then(fetchResponse => {
              cache.put(request, fetchResponse.clone());
            });
            return response;
          }
          // Not in cache, fetch and cache
          return fetch(request).then(fetchResponse => {
            cache.put(request, fetchResponse.clone());
            return fetchResponse;
          });
        });
      })
    );
    return;
  }

  // Cache API responses for short time
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      caches.open(CACHE_NAME).then(cache => {
        return cache.match(request).then(response => {
          if (response) {
            const cacheTime = response.headers.get('sw-cache-time');
            if (cacheTime) {
              const responseTime = new Date(cacheTime);
              if (Date.now() - responseTime.getTime() < API_CACHE_TIME) {
                return response;
              }
            }
          }
          
          return fetch(request).then(fetchResponse => {
            // Create new response with custom header
            const responseBody = fetchResponse.clone();
            const headers = new Headers(fetchResponse.headers);
            headers.set('sw-cache-time', new Date().toISOString());
            
            const modifiedResponse = new Response(responseBody.body, {
              status: fetchResponse.status,
              statusText: fetchResponse.statusText,
              headers: headers
            });
            
            cache.put(request, modifiedResponse.clone());
            return fetchResponse;
          });
        });
      })
    );
    return;
  }

  // Default: network first, fallback to cache
  event.respondWith(
    fetch(request).catch(() => {
      return caches.match(request);
    })
  );
});
