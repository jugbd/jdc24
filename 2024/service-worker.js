const CACHE_NAME = 'site-cache-v6'; // Update this when you want to bust the cache

self.addEventListener('install', event => {
    event.waitUntil(
        fetch('manifest.json')
            .then(response => response.json())
            .then(data => {
                return caches.open(CACHE_NAME).then(cache => {
                    return cache.addAll(data.assets);
                });
            })
    );
});

// Activate Event - Remove Old Caches
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
        })
    );
});

// Fetch Event - Serve from Cache or Network
self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request).then(cachedResponse => {
            if (cachedResponse) {
                return cachedResponse;
            }
            return fetch(event.request).then(networkResponse => {
                return caches.open(CACHE_NAME).then(cache => {
                    cache.put(event.request, networkResponse.clone());
                    return networkResponse;
                });
            });
        })
    );
});
