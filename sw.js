// Cache name
const CACHE_NAME = 'egg-shooter-v2';

// Assets to cache (including audio URLs)
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './pwa.js',
  './manifest.json',
  'https://cdn-icons-png.flaticon.com/512/528/528076.png',
 

// Install event
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Caching assets...');
        // Cache HTML, CSS, JS files first
        return cache.addAll(ASSETS_TO_CACHE.slice(0, 7))
          .then(() => {
            console.log('Core assets cached');
            // Cache audio files separately
            const audioPromises = ASSETS_TO_CACHE.slice(7).map(url => {
              return fetch(url).then(response => {
                if (response.ok) {
                  return cache.put(url, response);
                }
              }).catch(err => {
                console.log('Failed to cache:', url, err);
              });
            });
            return Promise.all(audioPromises);
          });
      })
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
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch event
self.addEventListener('fetch', event => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') return;
  
  // Skip Chrome extensions
  if (event.request.url.startsWith('chrome-extension://')) return;
  
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Return cached response if found
        if (response) {
          return response;
        }
        
        // Otherwise fetch from network
        return fetch(event.request)
          .then(response => {
            // Don't cache if not a success response
            if (!response || response.status !== 200) {
              return response;
            }
            
            // Clone the response
            const responseToCache = response.clone();
            
            // Cache the new resource
            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseToCache);
              });
            
            return response;
          })
          .catch(error => {
            console.log('Fetch failed:', error);
            // Return offline page for HTML requests
            if (event.request.headers.get('accept').includes('text/html')) {
              return caches.match('./index.html');
            }
          });
      })
  );
});