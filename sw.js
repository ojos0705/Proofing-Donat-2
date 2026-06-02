const CACHE_NAME = 'donut-pwa-v1';
const ASSETS = [
  './',
  './index.html',
  './manifest.json'
];

// Menginstall Service Worker dan menyimpan aset
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    })
  );
});

// Menjalankan aplikasi secara offline dengan mengambil data dari cache
self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request).then((response) => {
      return response || fetch(e.request);
    })
  );
});

self.addEventListener('message', (event) => {
    if (event.data.action === 'fetchWeather') {
        // Lakukan fetch di sini
        console.log("Menerima request:", event.data);
        const apiKey = 'YOUR_API_KEY';
    }
});