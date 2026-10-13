/* Service worker do Arco.
 * Ao publicar uma nova versão, atualize CACHE_VERSION (acompanha package.json)
 * para que os caches antigos sejam descartados no "activate".
 */
const CACHE_VERSION = 'arco-v1.0.0';
const OFFLINE_URL = '/offline.html';
const PRECACHE_URLS = [
  OFFLINE_URL,
  '/manifest.webmanifest',
  '/icon-192.png',
  '/icon-512.png',
  '/apple-touch-icon.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE_VERSION)
      .then((cache) => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((names) =>
        Promise.all(names.filter((name) => name !== CACHE_VERSION).map((name) => caches.delete(name)))
      )
      .then(() => self.clients.claim())
  );
});

function isCacheable(response) {
  return response && response.ok && response.type === 'basic';
}

async function putInCache(request, response) {
  if (!isCacheable(response)) return;
  const cache = await caches.open(CACHE_VERSION);
  await cache.put(request, response);
}

/** Navegações: rede primeiro; offline → versão em cache da página → página offline. */
async function handleNavigation(event) {
  try {
    const response = await fetch(event.request);
    event.waitUntil(putInCache(event.request, response.clone()));
    return response;
  } catch {
    const cached = await caches.match(event.request);
    if (cached) return cached;
    const offline = await caches.match(OFFLINE_URL);
    return offline || Response.error();
  }
}

/** Assets estáticos versionados: cache primeiro. */
async function handleStatic(event) {
  const cached = await caches.match(event.request);
  if (cached) return cached;
  const response = await fetch(event.request);
  event.waitUntil(putInCache(event.request, response.clone()));
  return response;
}

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);

  // Nunca interceptar/cachear requisições de outra origem (inclui a API) nem rotas /api.
  if (url.origin !== self.location.origin) return;
  if (url.pathname.startsWith('/api/')) return;

  if (request.mode === 'navigate') {
    event.respondWith(handleNavigation(event));
    return;
  }

  const isStaticAsset =
    url.pathname.startsWith('/_next/static/') ||
    /\.(?:png|ico|svg|webp|woff2?)$/.test(url.pathname);

  if (isStaticAsset) {
    event.respondWith(handleStatic(event));
  }
});
