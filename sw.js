// Cache name dengan versi
const CACHE_NAME = 'egg-shooter-v1.0.0';

// Assets to cache on install
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './style.css',
  './script.js',
  './pwa.js',
  './manifest.json',
  './icon-72.png',
  './icon-96.png',
  './icon-128.png',
  './icon-144.png',
  './icon-152.png',
  './icon-192.png',
  './icon-384.png',
  './icon-512.png',
  'https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap'
];

// Install event - cache assets
self.addEventListener('install', event => {
  console.log('🛠️ Service Worker: Installing...');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('📦 Caching app assets');
        return cache.addAll(ASSETS_TO_CACHE);
      })
      .then(() => {
        console.log('✅ Assets cached');
        return self.skipWaiting();
      })
      .catch(error => {
        console.error('❌ Cache failed:', error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  console.log('🔄 Service Worker: Activating...');
  
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log(`🗑️ Deleting old cache: ${cacheName}`);
            return caches.delete(cacheName);
          }
        })
      );
    })
    .then(() => {
      console.log('✅ Service Worker aktif dan siap!');
      return self.clients.claim();
    })
  );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', event => {
  // Skip cross-origin requests
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }
  
  // Skip non-GET requests
  if (event.request.method !== 'GET') {
    return;
  }
  
  event.respondWith(
    caches.match(event.request)
      .then(cachedResponse => {
        // Return cached response if found
        if (cachedResponse) {
          console.log(`📄 Cache hit: ${event.request.url}`);
          return cachedResponse;
        }
        
        // Otherwise fetch from network
        console.log(`🌐 Fetching from network: ${event.request.url}`);
        return fetch(event.request)
          .then(response => {
            // Check if we received a valid response
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }
            
            // Clone the response
            const responseToCache = response.clone();
            
            // Cache the new resource
            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseToCache);
                console.log(`✅ Cached new resource: ${event.request.url}`);
              });
            
            return response;
          })
          .catch(error => {
            console.error('❌ Fetch failed:', error);
            
            // Return offline page or fallback
            if (event.request.headers.get('accept').includes('text/html')) {
              return caches.match('./index.html');
            }
            
            // For images, return a placeholder
            if (event.request.headers.get('accept').includes('image')) {
              return new Response(
                `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200">
                  <rect width="200" height="200" fill="#4a008e"/>
                  <text x="100" y="100" text-anchor="middle" fill="white" font-family="Arial" font-size="20">
                    🥚 Egg
                  </text>
                </svg>`,
                {
                  headers: { 'Content-Type': 'image/svg+xml' }
                }
              );
            }
          });
      })
  );
});

// Handle messages from client
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// Background sync (optional)
self.addEventListener('sync', event => {
  if (event.tag === 'sync-data') {
    console.log('🔄 Background sync triggered');
    // Handle background sync here
  }
});

// Push notifications (optional)
self.addEventListener('push', event => {
  console.log('📢 Push notification received');
  
  const options = {
    body: event.data ? event.data.text() : 'Ada update baru!',
    icon: './icon-192.png',
    badge: './icon-96.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'Main Sekarang',
        icon: './icon-96.png'
      },
      {
        action: 'close',
        title: 'Tutup',
        icon: './icon-96.png'
      }
    ]
  };
  
  event.waitUntil(
    self.registration.showNotification('Egg Shooter', options)
  );
});

self.addEventListener('notificationclick', event => {
  console.log('🔔 Notification clicked');
  
  event.notification.close();
  
  if (event.action === 'explore') {
    // Open the app
    event.waitUntil(
      clients.openWindow('./index.html')
    );
  }
});