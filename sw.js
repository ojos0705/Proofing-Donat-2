// sw.js
const CACHE_NAME = 'donut-pwa-v3';
const ASSETS = [
  '/index.html',
  '/manifest.json'
];

// Tahap instalasi aset esensial
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return Promise.all(
        ASSETS.map((url) => {
          return cache.add(url).catch((err) => {
            console.warn(`Aset dilewati dari cache offline: ${url}`, err);
          });
        })
      );
    }).then(() => self.skipWaiting())
  );
});

// Aktivasi dan pembersihan cache usang
self.addEventListener('activate', (e) => {
  e.waitUntil(
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

// Interseptor Request Jaringan
self.addEventListener('fetch', (e) => {
  // JANGAN intercept rute /api/ agar request cuaca tetap berjalan dinamis ke cloud proxy
  if (e.request.url.includes('/api/')) {
    return;
  }

  e.respondWith(
    caches.match(e.request).then((response) => {
      return response || fetch(e.request).catch(() => {
        if (e.request.mode === 'navigate') {
          return caches.match('/index.html');
        }
      });
    })
  );
});
