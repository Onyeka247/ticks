const CACHE_NAME = 'ticketmaster-cache-v2';
const ASSETS_CACHE = 'ticketmaster-assets-v2';

const urlsToCache = [
  '/',
  '/splash.html',
  '/index.html',
  '/home.html',
  '/for-you.html',
  '/my-events.html',
  '/sell.html',
  '/account.html',
  '/ticket-details.html',
  '/qr-code.html'
];

const assetsToCache = [
  '/assets/ticketmaster-5-logo-black-and-white2.png',
  '/assets/icon.png',
  '/assets/icon-512.png',
  '/manifest.json'
];

// Helper function to handle network requests with timeout
function timeoutFetch(request, timeout = 5000) {
  return Promise.race([
    fetch(request),
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Timeout')), timeout)
    )
  ]);
}

// Install event handler
self.addEventListener('install', event => {
  event.waitUntil(
    Promise.all([
      // Cache main pages
      caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache)),
      // Cache assets
      caches.open(ASSETS_CACHE).then(cache => cache.addAll(assetsToCache))
    ]).then(() => self.skipWaiting())
  );
});

// Activate event handler
self.addEventListener('activate', event => {
  event.waitUntil(
    Promise.all([
      // Remove old caches
      caches.keys().then(cacheNames => {
        return Promise.all(
          cacheNames
            .filter(cacheName => 
              cacheName !== CACHE_NAME && cacheName !== ASSETS_CACHE)
            .map(cacheName => caches.delete(cacheName))
        );
      }),
      // Take control of all clients
      self.clients.claim()
    ])
  );
});

// Fetch event handler with improved caching strategy
self.addEventListener('fetch', event => {
  // Parse the request URL
  const requestUrl = new URL(event.request.url);

  // Handle assets differently
  if (assetsToCache.some(asset => requestUrl.pathname.endsWith(asset))) {
    event.respondWith(
      caches.match(event.request)
        .then(response => response || fetch(event.request))
        .catch(() => {
          // Return a fallback for images if needed
          if (requestUrl.pathname.match(/\.(png|jpg|jpeg|gif|webp)$/)) {
            return caches.match('/assets/icon.png');
          }
          throw new Error('Asset not found');
        })
    );
    return;
  }

  // For HTML pages, try network first, then cache
  if (urlsToCache.includes(requestUrl.pathname) || event.request.mode === 'navigate') {
    event.respondWith(
      timeoutFetch(event.request)
        .then(response => {
          // Clone the response before caching
          const responseClone = response.clone();
          caches.open(CACHE_NAME)
            .then(cache => cache.put(event.request, responseClone));
          return response;
        })
        .catch(() => {
          // If network fails, try cache
          return caches.match(event.request)
            .then(response => {
              if (response) return response;
              // If no cache, return splash screen for navigation requests
              if (event.request.mode === 'navigate') {
                return caches.match('/splash.html');
              }
              throw new Error('No cached response found');
            });
        })
    );
    return;
  }

  // Default fetch behavior for other requests
  event.respondWith(
    caches.match(event.request)
      .then(response => response || fetch(event.request))
  );
});