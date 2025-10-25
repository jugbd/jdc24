const CACHE_NAME = 'cache-v1761387835'; // ⬅️ bump this on each deploy to bust cache

// ---- INSTALL ----
self.addEventListener('install', event => {
    console.log('[SW] Installing new version...');

    event.waitUntil(
        fetch('manifest.json', {cache: 'no-store'})
            .then(response => {
                if (!response.ok) throw new Error('Failed to fetch manifest.json');
                return response.json();
            })
            .then(data => {
                const assetsToCache = (data.assets || []).filter(url => {
                    const u = url.toLowerCase();
                    return !(
                        u.endsWith('service-worker.js') ||
                        u.endsWith('manifest.json')
                    );
                });
                return caches.open(CACHE_NAME).then(cache => cache.addAll(assetsToCache));
            })
            .catch(err => console.error('[SW] Install error:', err))
    );

    // Activate immediately — don’t wait for old worker to release control
    self.skipWaiting();
});

// ---- ACTIVATE ----
self.addEventListener('activate', event => {
    console.log('[SW] Activating new version...');

    event.waitUntil(
        caches.keys().then(names =>
            Promise.all(
                names.map(name => {
                    const shouldDelete = name !== CACHE_NAME && (name.startsWith('cache-') || name.startsWith('site-cache-'));
                    if (shouldDelete) {
                        console.log('[SW] Deleting old cache:', name);
                        return caches.delete(name);
                    }
                })
            )
        ).then(() => self.clients.claim()) // Take control of all open pages immediately
    );
});

// ---- FETCH ----
self.addEventListener('fetch', event => {
    const reqUrl = new URL(event.request.url);

    // Always bypass cache for these files
    if (reqUrl.pathname.endsWith('/service-worker.js') || reqUrl.pathname.endsWith('/manifest.json')) {
        event.respondWith(fetch(event.request, {cache: 'no-store'}));
        return;
    }

    event.respondWith(
        caches.match(event.request).then(cached => {
            if (cached) return cached;

            return fetch(event.request).then(response => {
                if (!response || response.status !== 200 || response.type !== 'basic') return response;

                const cloned = response.clone();
                caches.open(CACHE_NAME).then(cache => cache.put(event.request, cloned));
                return response;
            });
        }).catch(err => console.error('[SW] Fetch failed:', err))
    );
});
