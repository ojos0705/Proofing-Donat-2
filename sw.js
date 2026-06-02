// sw.js
const CACHE_NAME = 'donut-pwa-v5';
const ASSETS = [
  '/index.html',
  '/manifest.json'
];

// Menginstall Service Worker dan mengamankan aset esensial ke dalam cache offline
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return Promise.all(
        ASSETS.map((url) => {
          return cache.add(url).catch((err) => console.warn(`Aset dilewati dari cache: ${url}`, err));
        })
      );
    }).then(() => self.skipWaiting())
  );
});

// Pembersihan cache usang ketika aplikasi diperbarui ke versi baru
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) return caches.delete(key);
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Strategi Interseptor Jaringan Statis
self.addEventListener('fetch', (e) => {
  // PENTING: Jangan biarkan service worker meng-intercept rute API agar datanya selalu aktual dari cloud
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
