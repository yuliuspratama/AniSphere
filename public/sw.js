// Service Worker for AniSphere PWA
const CACHE_NAME = "anisphere-v1";
const RUNTIME_CACHE = "anisphere-runtime-v1";

// Assets to cache on install
const PRECACHE_ASSETS = [
  "/",
  "/beranda",
  "/koleksiku",
  "/arena",
  "/jelajah",
  "/icon-192x192.png",
  "/icon-512x512.png",
];

// Install event - cache assets
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => {
        console.log("Service Worker: Caching assets");
        return cache.addAll(PRECACHE_ASSETS);
      })
      .then(() => self.skipWaiting())
  );
});

// Activate event - clean up old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((cacheName) => {
              return (
                cacheName !== CACHE_NAME && cacheName !== RUNTIME_CACHE
              );
            })
            .map((cacheName) => {
              console.log("Service Worker: Deleting old cache", cacheName);
              return caches.delete(cacheName);
            })
        );
      })
      .then(() => self.clients.claim())
  );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener("fetch", (event) => {
  // Skip non-GET requests
  if (event.request.method !== "GET") {
    return;
  }

  // Skip API routes (they should always use network)
  if (event.request.url.includes("/api/")) {
    return;
  }

  // Skip external API calls
  if (
    event.request.url.includes("jikan.moe") ||
    event.request.url.includes("kitsu.io") ||
    event.request.url.includes("anilist.co") ||
    event.request.url.includes("waifu.pics") ||
    event.request.url.includes("animechan.xyz") ||
    event.request.url.includes("katanime.vercel.app") ||
    event.request.url.includes("anime-facts-rest-api.herokuapp.com")
  ) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      // Return cached version if available
      if (cachedResponse) {
        return cachedResponse;
      }

      // Otherwise, fetch from network
      return fetch(event.request)
        .then((response) => {
          // Don't cache if not a valid response
          if (!response || response.status !== 200 || response.type !== "basic") {
            return response;
          }

          // Clone the response
          const responseToCache = response.clone();

          // Cache the response
          caches.open(RUNTIME_CACHE).then((cache) => {
            cache.put(event.request, responseToCache);
          });

          return response;
        })
        .catch(() => {
          // Return offline page if available
          if (event.request.destination === "document") {
            return caches.match("/");
          }
        });
    })
  );
});

// Message event - handle cache clearing
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});

