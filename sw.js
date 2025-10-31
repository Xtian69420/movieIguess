// Service Worker for MovieIGuess PWA
const CACHE_NAME = 'movieiguess-v1.0.0';
const STATIC_CACHE = 'movieiguess-static-v1.0.0';

// Files to cache for offline support
const STATIC_FILES = [
    '/',
    '/index.html',
    '/viewMovie.html',
    '/WatchMovie.html',
    '/netflix-style.css',
    '/search.css',
    '/toast.css',
    '/tv-support.css',
    '/watch.css',
    '/src/home.js',
    '/src/view.js',
    '/src/watch.js',
    '/src/search.js',
    '/src/toast.js',
    '/src/tv-support.js',
    '/src/loading.js',
    '/src/assets/logo.png',
    '/manifest.json'
];

// Install event - cache static files
self.addEventListener('install', (event) => {
    console.log('🚀 MovieIGuess Service Worker installing...');
    
    event.waitUntil(
        caches.open(STATIC_CACHE)
            .then((cache) => {
                console.log('📦 Caching static files');
                return cache.addAll(STATIC_FILES);
            })
            .then(() => {
                console.log('✅ Static files cached successfully');
                // Force the waiting service worker to become the active service worker
                return self.skipWaiting();
            })
            .catch((error) => {
                console.error('❌ Failed to cache static files:', error);
            })
    );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
    console.log('🔄 MovieIGuess Service Worker activating...');
    
    event.waitUntil(
        caches.keys()
            .then((cacheNames) => {
                return Promise.all(
                    cacheNames.map((cacheName) => {
                        if (cacheName !== STATIC_CACHE && cacheName !== CACHE_NAME) {
                            console.log('🗑️ Deleting old cache:', cacheName);
                            return caches.delete(cacheName);
                        }
                    })
                );
            })
            .then(() => {
                console.log('✅ Old caches cleaned up');
                // Claim control of all clients
                return self.clients.claim();
            })
    );
});

// Fetch event - serve cached content when offline
self.addEventListener('fetch', (event) => {
    const url = new URL(event.request.url);
    
    // Skip non-GET requests and chrome-extension requests
    if (event.request.method !== 'GET' || url.protocol === 'chrome-extension:') {
        return;
    }
    
    // Handle API requests differently (don't cache TMDB API calls)
    if (url.hostname.includes('themoviedb.org') || url.hostname.includes('api.')) {
        event.respondWith(
            fetch(event.request)
                .catch(() => {
                    // Return offline message for API calls
                    return new Response(
                        JSON.stringify({ 
                            error: 'Offline', 
                            message: 'Content not available offline' 
                        }),
                        { 
                            headers: { 'Content-Type': 'application/json' },
                            status: 503 
                        }
                    );
                })
        );
        return;
    }
    
    // For all other requests, use cache-first strategy
    event.respondWith(
        caches.match(event.request)
            .then((cachedResponse) => {
                if (cachedResponse) {
                    // Return cached version
                    return cachedResponse;
                }
                
                // Fetch from network and cache for next time
                return fetch(event.request)
                    .then((response) => {
                        // Don't cache non-successful responses
                        if (!response || response.status !== 200 || response.type !== 'basic') {
                            return response;
                        }
                        
                        // Clone the response
                        const responseToCache = response.clone();
                        
                        // Cache the response for next time
                        caches.open(CACHE_NAME)
                            .then((cache) => {
                                cache.put(event.request, responseToCache);
                            });
                        
                        return response;
                    })
                    .catch(() => {
                        // Return offline page if available
                        if (event.request.destination === 'document') {
                            return caches.match('/index.html');
                        }
                    });
            })
    );
});

// Handle background sync for offline actions
self.addEventListener('sync', (event) => {
    if (event.tag === 'background-sync') {
        console.log('🔄 Background sync triggered');
        event.waitUntil(doBackgroundSync());
    }
});

// Handle push notifications (future feature)
self.addEventListener('push', (event) => {
    console.log('🔔 Push notification received');
    
    const options = {
        body: event.data ? event.data.text() : 'New content available!',
        icon: '/src/assets/logo.png',
        badge: '/src/assets/logo.png',
        tag: 'movieiguess-notification',
        data: {
            url: '/'
        }
    };
    
    event.waitUntil(
        self.registration.showNotification('MovieIGuess', options)
    );
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
    console.log('🔔 Notification clicked');
    
    event.notification.close();
    
    event.waitUntil(
        clients.openWindow(event.notification.data.url || '/')
    );
});

// Background sync function
async function doBackgroundSync() {
    try {
        // Sync any offline actions when back online
        console.log('📡 Syncing offline data...');
        
        // Add your sync logic here
        // For example: sync user preferences, watch history, etc.
        
        console.log('✅ Background sync completed');
    } catch (error) {
        console.error('❌ Background sync failed:', error);
    }
}

// Handle service worker errors
self.addEventListener('error', (event) => {
    console.error('❌ Service Worker error:', event.error);
});

// Handle unhandled promise rejections
self.addEventListener('unhandledrejection', (event) => {
    console.error('❌ Service Worker unhandled promise rejection:', event.reason);
});

console.log('🎬 MovieIGuess Service Worker loaded successfully');