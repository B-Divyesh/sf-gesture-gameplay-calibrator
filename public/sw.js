const VERSION = 'movemap-v1.0.3';
const SHELL = `${VERSION}-shell`;
const ASSETS = `${VERSION}-assets`;
const SHELL_URLS = ['/', '/privacy/', '/terms/', '/offline.html', '/manifest.webmanifest', '/icons/icon.svg', '/icons/icon-192.png', '/icons/icon-512.png'];

async function precacheShell() {
  const cache = await caches.open(SHELL);
  await cache.addAll(SHELL_URLS.map((url) => new Request(url, { cache: 'reload' })));
  const home = await cache.match('/');
  if (!home) return;
  const html = await home.text();
  const builtAssets = [...html.matchAll(/(?:src|href)="(\/assets\/[^"?]+)"/g)].map((match) => match[1]);
  await cache.addAll(builtAssets.map((url) => new Request(url, { cache: 'reload' })));
}

self.addEventListener('install', (event) => {
  event.waitUntil(precacheShell().then(() => self.skipWaiting()));
});

self.addEventListener('activate', (event) => {
  event.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((key) => ![SHELL, ASSETS].includes(key)).map((key) => caches.delete(key)))).then(() => self.clients.claim()));
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.origin !== location.origin) return;

  if (request.mode === 'navigate') {
    event.respondWith(fetch(request).then((response) => {
      const copy = response.clone();
      caches.open(SHELL).then((cache) => cache.put(request, copy));
      return response;
    }).catch(async () => (await caches.match(url.pathname)) || (await caches.match('/')) || caches.match('/offline.html')));
    return;
  }

  event.respondWith((async () => {
    const cached = await caches.match(url.pathname);
    if (cached) return cached;
    const response = await fetch(request);
    if (response.ok) event.waitUntil(caches.open(ASSETS).then((cache) => cache.put(url.pathname, response.clone())));
    return response;
  })());
});
