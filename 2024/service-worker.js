const CACHE_NAME = 'site-cache-v1'; // Update this when you want to bust the cache

// Install Event - Cache new assets
self.addEventListener('install', event => {
    event.waitUntil(
        fetch('manifest.json')
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to fetch manifest.json');
                }
                return response.json();
            })
            .then(data => {
                return caches.open(CACHE_NAME).then(cache => {
                    return cache.addAll(data.assets);
                });
            })
            .catch(error => {
                console.error('Error during install');
            })
    );
    // Force the waiting service worker to become active
    self.skipWaiting();
});

// Activate Event - Remove old caches and claim control
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cache => {
                    if (cache !== CACHE_NAME) {
                        console.log('Deleting old cache:', cache);
                        return caches.delete(cache);
                    }
                })
            );
        }).then(() => {
            console.log("Service Worker: Activated");
        })
    );
    // Take control of all pages immediately
    self.clients.claim();
});

// Fetch Event - Serve from cache or fetch and cache
self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request).then(cachedResponse => {
            if (cachedResponse) {
                return cachedResponse; // Return cached response if available
            }
            return fetch(event.request).then(networkResponse => {
                if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
                    return networkResponse; // Skip caching non-OK responses
                }
                return caches.open(CACHE_NAME).then(cache => {
                    cache.put(event.request, networkResponse.clone()); // Cache the new response
                    return networkResponse;
                });
            });
        }).catch(error => {
            console.error('Fetch failed:');
        })
    );
});
