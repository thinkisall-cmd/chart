const CACHE_NAME = 'nextchart-v1.0.0';
const STATIC_CACHE_URLS = [
  '/',
  '/manifest.json',
  // Core app shell files will be auto-added by Next.js
];

const DYNAMIC_CACHE_NAME = 'nextchart-dynamic-v1.0.0';
const API_CACHE_NAME = 'nextchart-api-v1.0.0';

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('Service Worker: Install event');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Service Worker: Caching static assets');
        return cache.addAll(STATIC_CACHE_URLS);
      })
      .then(() => {
        console.log('Service Worker: Skip waiting');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('Service Worker: Install failed:', error);
      })
  );
});

// Activate event - cleanup old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activate event');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME && 
                cacheName !== DYNAMIC_CACHE_NAME && 
                cacheName !== API_CACHE_NAME) {
              console.log('Service Worker: Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('Service Worker: Claiming clients');
        return self.clients.claim();
      })
  );
});
// Fetch event - network first, then cache for API calls, cache first for static assets
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Skip Chrome extension requests
  if (url.protocol === 'chrome-extension:') {
    return;
  }

  // Skip external scripts (Google AdSense, Vercel analytics, etc.)
  if (url.hostname !== location.hostname &&
      !url.hostname.includes('bithumb.com') &&
      !url.hostname.includes('coinmarketcap.com')) {
    return;
  }

  // API requests - network first, cache as fallback
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Only cache successful responses
          if (response.status === 200) {
            const responseClone = response.clone();
            caches.open(API_CACHE_NAME).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return response;
        })
        .catch(() => {
          // Fallback to cache if network fails
          return caches.match(request);
        })
    );
    return;
  }

  // Static assets and pages - cache first, network as fallback
  event.respondWith(
    caches.match(request)
      .then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }

        // Not in cache, fetch from network
        return fetch(request)
          .then((response) => {
            // Don't cache non-successful responses
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            const responseClone = response.clone();
            
            // Cache dynamic content
            caches.open(DYNAMIC_CACHE_NAME)
              .then((cache) => {
                cache.put(request, responseClone);
              });

            return response;
          })
          .catch((error) => {
            console.error('Service Worker: Fetch failed:', error);
            
            // Return offline fallback if available
            if (url.pathname === '/' || url.pathname.startsWith('/sectors')) {
              return caches.match('/');
            }
            
            throw error;
          });
      })
  );
});

// Background sync for offline support
self.addEventListener('sync', (event) => {
  console.log('Service Worker: Background sync:', event.tag);
  
  if (event.tag === 'background-sync') {
    event.waitUntil(
      // Attempt to fetch latest data when back online
      fetch('/api/bithumb-proxy')
        .then((response) => {
          if (response.ok) {
            return caches.open(API_CACHE_NAME).then((cache) => {
              return cache.put('/api/bithumb-proxy', response);
            });
          }
        })
        .catch((error) => {
          console.log('Service Worker: Background sync failed:', error);
        })
    );
  }
});

// Push notifications support (for future use)
self.addEventListener('push', (event) => {
  console.log('Service Worker: Push message received');
  
  const options = {
    body: event.data ? event.data.text() : '새로운 암호화폐 알림이 있습니다',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-72x72.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: '1'
    },
    actions: [
      {
        action: 'explore', 
        title: '확인하기',
        icon: '/icons/icon-192x192.png'
      },
      {
        action: 'close', 
        title: '닫기'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification('NextChart 알림', options)
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  console.log('Service Worker: Notification click received');

  event.notification.close();

  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('https://www.damoabom.com')
    );
  }
});
