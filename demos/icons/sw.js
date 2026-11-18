// Service worker. DESIGN.md §14.
//
// A classic (non-module) script so it works everywhere service workers do.
//
//   app shell (same origin)         precached, cache-first, one cache per app version
//   icon sets, per-icon data        stale-while-revalidate
//   font files (version-pinned)     cache-first
//   catalogs (set list, font list)  stale-while-revalidate
//   icon search                     network only (the page falls back to local search)
//
// VERSION is stamped by `npm run precache`, which also writes precache.json. Changing it
// is what makes browsers install a new worker.

const VERSION = '0ea15774ff3ed99d';
const SHELL = `mis-shell-${VERSION}`;
const ICONS = 'mis-icons';
const FONTS = 'mis-fonts';
const CATALOG = 'mis-catalog';

self.addEventListener('install', (event) => {
  event.waitUntil(
    (async () => {
      const res = await fetch(`./precache.json?v=${VERSION}`, { cache: 'no-store' });
      const manifest = await res.json();
      const cache = await caches.open(SHELL);
      // `reload` bypasses the HTTP cache so a new version never precaches stale files.
      await cache.addAll(manifest.files.map((url) => new Request(url, { cache: 'reload' })));
    })(),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      for (const name of await caches.keys()) {
        if (name.startsWith('mis-shell-') && name !== SHELL) await caches.delete(name);
      }
      await self.clients.claim();
    })(),
  );
});

self.addEventListener('message', (event) => {
  if (event.data?.type === 'skip-waiting') self.skipWaiting();
});

async function cacheFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  const hit = await cache.match(request);
  if (hit) return hit;
  const res = await fetch(request);
  if (res.ok) cache.put(request, res.clone());
  return res;
}

async function staleWhileRevalidate(request, cacheName, event) {
  const cache = await caches.open(cacheName);
  const hit = await cache.match(request);
  const refresh = fetch(request)
    .then((res) => {
      if (res.ok) cache.put(request, res.clone());
      return res;
    })
    .catch(() => null);
  if (hit) {
    event.waitUntil(refresh);
    return hit;
  }
  const res = await refresh;
  if (res) return res;
  return new Response('Offline and not cached', { status: 503, statusText: 'Offline' });
}

async function shell(request) {
  const cache = await caches.open(SHELL);
  // Navigations (including ones with a query string, like ?sw=1) get the app page.
  const hit = (await cache.match(request, { ignoreSearch: true })) ?? (request.mode === 'navigate' ? await cache.match('./index.html') : null);
  if (hit) return hit;
  return fetch(request);
}

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);

  if (url.origin === self.location.origin) {
    event.respondWith(shell(request));
    return;
  }
  if (url.hostname === 'cdn.jsdelivr.net') {
    if (url.pathname.startsWith('/npm/@iconify-json/')) {
      event.respondWith(staleWhileRevalidate(request, ICONS, event));
    } else if (url.pathname.startsWith('/fontsource/') || url.pathname.startsWith('/gh/')) {
      // "@latest" preview files can change; everything else is pinned to a version.
      event.respondWith(url.pathname.includes('@latest/') ? staleWhileRevalidate(request, FONTS, event) : cacheFirst(request, FONTS));
    }
    return;
  }
  if (url.hostname === 'api.iconify.design') {
    if (url.pathname === '/search') return;
    if (url.pathname === '/collections' || url.pathname === '/collection') {
      event.respondWith(staleWhileRevalidate(request, CATALOG, event));
    } else {
      event.respondWith(staleWhileRevalidate(request, ICONS, event));
    }
    return;
  }
  if (url.hostname === 'api.fontsource.org') {
    event.respondWith(staleWhileRevalidate(request, CATALOG, event));
  }
});
