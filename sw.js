// Offline cache. Everything is stored on first load; later loads are served from the cache
// and refreshed in the background, so an update shows up the second time the app is opened online.
const CACHE = 'survival-language-v1';
const ASSETS = [
  './',
  'index.html',
  'manifest.webmanifest',
  'css/styles.css',
  'fonts/PressStart2P-Regular.ttf',
  'icons/icon-180.png',
  'icons/icon-192.png',
  'icons/icon-512.png',
  'js/sprites.js',
  'js/tones.js',
  'js/store.js',
  'js/audio.js',
  'js/ui.js',
  'js/flashcards.js',
  'js/quiz.js',
  'js/app.js',
  'packs/index.js',
  'packs/vi.js'
];

self.addEventListener('install', function (event) {
  event.waitUntil(caches.open(CACHE).then(function (c) { return c.addAll(ASSETS); }).then(function () {
    return self.skipWaiting();
  }));
});

self.addEventListener('activate', function (event) {
  event.waitUntil(caches.keys().then(function (keys) {
    return Promise.all(keys.filter(function (k) { return k !== CACHE; }).map(function (k) { return caches.delete(k); }));
  }).then(function () { return self.clients.claim(); }));
});

self.addEventListener('fetch', function (event) {
  const req = event.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== self.location.origin) return;
  event.respondWith(caches.open(CACHE).then(function (cache) {
    return cache.match(req, { ignoreSearch: true }).then(function (hit) {
      const fresh = fetch(req).then(function (res) {
        if (res.ok) cache.put(req, res.clone());
        return res;
      });
      if (hit) {
        fresh.catch(function () { /* offline: the cached copy is already on its way */ });
        return hit;
      }
      return fresh.catch(function () { return cache.match('index.html'); });
    });
  }));
});
