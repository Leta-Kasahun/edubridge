const CACHE_NAME = "edubridge-core-v3";
const SHELL_CACHE = "edubridge-shell-v3";

const PRECACHE_ASSETS = [
  "/logo.png",
  "/manifest.webmanifest",
  "/favicon.ico",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) =>
        Promise.allSettled(
          PRECACHE_ASSETS.map((asset) =>
            fetch(asset)
              .then((res) => {
                if (res && res.status === 200) {
                  return cache.put(asset, res);
                }
              })
              .catch(() => null)
          )
        )
      )
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((k) => k !== CACHE_NAME && k !== SHELL_CACHE)
            .map((k) => caches.delete(k))
        )
      )
      .then(() => self.clients.claim())
  );
});

const cacheStaticAsset = (request, networkResponse) => {
  if (
    networkResponse &&
    networkResponse.status === 200 &&
    networkResponse.type !== "opaque"
  ) {
    const clone = networkResponse.clone();
    caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
  }
};

const cachePageShell = (request, networkResponse) => {
  if (networkResponse && networkResponse.status === 200) {
    const clone = networkResponse.clone();
    caches.open(SHELL_CACHE).then((cache) => cache.put(request, clone));
  }
};

const findAnyShell = async () => {
  const cache = await caches.open(SHELL_CACHE);
  const keys = await cache.keys();
  if (keys.length === 0) return null;
  const dashboardKey = keys.find((k) =>
    new URL(k.url).pathname.startsWith("/dashboard")
  );
  return cache.match(dashboardKey || keys[0]);
};

const emptyImageResponse = () =>
  new Response("", {
    status: 200,
    headers: { "Content-Type": "image/png" },
  });

const isPrecachedAsset = (url) =>
  PRECACHE_ASSETS.includes(url.pathname);

const isStaticAsset = (url) =>
  url.pathname.startsWith("/_next/static/") ||
  url.pathname.startsWith("/_next/image") ||
  url.pathname.match(/\.(png|jpg|jpeg|svg|webp|woff|woff2|ico|js|css)$/);

self.addEventListener("fetch", (event) => {
  const request = event.request;
  const url = new URL(request.url);

  if (request.method !== "GET") {
    return;
  }

  // Let API calls go straight to the network — never intercept
  if (url.pathname.startsWith("/api/")) {
    return;
  }

  // Serve precached assets (logo, favicon, manifest) from cache-first
  if (isPrecachedAsset(url)) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached;
        return fetch(request)
          .then((res) => {
            cacheStaticAsset(request, res);
            return res;
          })
          .catch(() =>
            new Response("", {
              status: 200,
              headers: { "Content-Type": "application/octet-stream" },
            })
          );
      })
    );
    return;
  }

  // Page navigations: network-first, cache the HTML shell for offline use
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((networkResponse) => {
          cachePageShell(request, networkResponse);
          return networkResponse;
        })
        .catch(async () => {
          const exactMatch = await caches.match(request);
          if (exactMatch) return exactMatch;

          const anyShell = await findAnyShell();
          if (anyShell) return anyShell;

          return new Response(
            `<!doctype html><html><head><meta charset="utf-8">
             <meta name="viewport" content="width=device-width,initial-scale=1">
             <title>EduBridge — Offline</title>
             <style>
               body{font-family:system-ui,sans-serif;display:flex;align-items:center;
               justify-content:center;min-height:100vh;margin:0;background:#f8fafc;}
               .card{text-align:center;padding:2rem;max-width:360px;}
               h1{font-size:1.25rem;font-weight:700;color:#0f172a;margin:0 0 .5rem;}
               p{color:#64748b;font-size:.875rem;margin:0 0 1.5rem;}
               button{background:#0ea5e9;color:#fff;border:none;padding:.625rem 1.5rem;
               border-radius:.75rem;font-size:.875rem;font-weight:600;cursor:pointer;}
             </style></head>
             <body><div class="card">
               <h1>You are offline</h1>
               <p>Please reconnect to continue using EduBridge.</p>
               <button onclick="window.location.reload()">Try Again</button>
             </div></body></html>`,
            {
              status: 200,
              headers: { "Content-Type": "text/html; charset=utf-8" },
            }
          );
        })
    );
    return;
  }

  // Static assets: cache-first (serve from cache, update in background)
  if (isStaticAsset(url)) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        // Always revalidate in the background while serving the cache
        const networkFetch = fetch(request)
          .then((networkResponse) => {
            cacheStaticAsset(request, networkResponse);
            return networkResponse;
          })
          .catch(() => null);

        // Serve cached version immediately; fall back to network if not cached
        if (cachedResponse) {
          return cachedResponse;
        }

        return networkFetch.then((networkResponse) => {
          if (networkResponse) return networkResponse;

          // Offline and not cached — return empty but valid response
          if (
            url.pathname.startsWith("/_next/image") ||
            url.pathname.match(/\.(png|jpg|jpeg|svg|webp|ico)$/)
          ) {
            const originalPath = url.searchParams.get("url");
            if (originalPath) {
              return caches
                .match(originalPath)
                .then((cached) => cached || emptyImageResponse());
            }
            return emptyImageResponse();
          }

          return new Response("", {
            status: 200,
            headers: { "Content-Type": "application/octet-stream" },
          });
        });
      })
    );
  }
});
