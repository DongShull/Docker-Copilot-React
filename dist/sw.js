const CACHE_PREFIX = 'docker-copilot-static-';
const CACHE_NAME = `${CACHE_PREFIX}v2`;
const BASE_PATH = new URL(self.registration.scope).pathname;
const staticResources = [
  BASE_PATH,
  `${BASE_PATH}index.html`,
  `${BASE_PATH}logo.png`,
  `${BASE_PATH}manifest.json`
];

self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(staticResources)));
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => Promise.all(
      cacheNames
        .filter(name => name.startsWith(CACHE_PREFIX) && name !== CACHE_NAME)
        .map(name => caches.delete(name))
    ))
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  const request = event.request;
  const requestURL = new URL(request.url);
  if (
    request.method !== 'GET' ||
    requestURL.origin !== self.location.origin ||
    !requestURL.pathname.startsWith(BASE_PATH) ||
    requestURL.pathname.startsWith('/api/')
  ) {
    return;
  }

  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then(async response => {
          if (response.ok) {
            const copy = response.clone();
            const cache = await caches.open(CACHE_NAME);
            await cache.put(`${BASE_PATH}index.html`, copy);
          }
          return response;
        })
        .catch(() => caches.match(`${BASE_PATH}index.html`))
    );
    return;
  }

  event.respondWith(
    caches.match(request).then(cached => cached || fetch(request).then(async response => {
      if (response.ok && requestURL.pathname.startsWith(`${BASE_PATH}assets/`)) {
        const copy = response.clone();
        const cache = await caches.open(CACHE_NAME);
        await cache.put(request, copy);
      }
      return response;
    }))
  );
});
