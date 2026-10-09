const CACHE_NAME = 'challenges-v1';
const APP_FILES = ['./', 'index.html', 'style.css', 'app.js', 'manifest.webmanifest', 'icon-192.png', 'icon-512.png', 'apple-touch-icon.png'];

function cacheAppFiles() {
  return caches.open(CACHE_NAME).then(cache => cache.addAll(APP_FILES));
}

function removeOldCaches() {
  return caches.keys().then(keys => Promise.all(keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))));
}

function respondFromNetwork(request) {
  return fetch(request)
    .then(response => {
      const copy = response.clone();
      caches.open(CACHE_NAME).then(cache => cache.put(request, copy));
      return response;
    })
    .catch(() => caches.match(request));
}

self.addEventListener('install', event => event.waitUntil(cacheAppFiles().then(() => self.skipWaiting())));
self.addEventListener('activate', event => event.waitUntil(removeOldCaches().then(() => self.clients.claim())));
self.addEventListener('fetch', event => {
  if (event.request.method === 'GET') {
    event.respondWith(respondFromNetwork(event.request));
  }
});
