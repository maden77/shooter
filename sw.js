const CACHE_NAME = 'egg-shooter-v1';
const ASSETS_TO_CACHE = [
  '/egg-shooter-game/',
  '/egg-shooter-game/index.html',
  '/egg-shooter-game/style.css',
  '/egg-shooter-game/script.js',
  '/egg-shooter-game/pwa.js',
  '/egg-shooter-game/sw.js',
  '/egg-shooter-game/manifest.json',
  '/egg-shooter-game/icon-192.png',
  '/egg-shooter-game/icon-512.png'
];

// Install event
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(ASSETS_TO_CACHE))
      .then(() => self.skipWaiting())
  );
});

// Activate event
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch event
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => response || fetch(event.request))
  );
});