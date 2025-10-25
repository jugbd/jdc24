const CACHE_NAME = 'cache-v1761385858'; // Update this when you want to bust the cache

// Install Event - Cache new assets
self.addEventListener('install', event => {
    event.waitUntil(
        fetch('manifest.json', { cache: 'no-store' })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to fetch manifest.json');
                }
                return response.json();
            })
            .then(data => {
                // Exclude files that must never be cached to avoid blocking updates
                const assetsToCache = (data.assets || []).filter(url => {
                    const u = url.toLowerCase();
                    return !(
                        u.endsWith('service-worker.js') ||
                        u.endsWith('manifest.json')
                    );
                });
                return caches.open(CACHE_NAME).then(cache => {
                    return cache.addAll(assetsToCache);
                });
            })
            .catch(error => {
                console.error('Error during install', error);
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
    const reqUrl = new URL(event.request.url);

    // Always bypass cache for the service worker and manifest to ensure updates
    if (reqUrl.pathname.endsWith('/service-worker.js') || reqUrl.pathname.endsWith('/manifest.json')) {
        event.respondWith(fetch(event.request, { cache: 'no-store' }));
        return;
    }

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
            console.error('Fetch failed:', error);
        })
    );
});
