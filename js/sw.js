/* =========================================================
   PRANAV — Service Worker
   File: sw.js
   ========================================================= */

const CACHE_NAME = "pranav-v1";

const APP_SHELL = [
  "./",
  "./index.html",
  "./css/style.css",
  "./css/responsive.css",
  "./css/animations.css",
  "./js/app.js",
  "./js/loader.js",
  "./assets/logo/pranav-logo.png"
];

/* ---------------------------------------------------------
   Install
   --------------------------------------------------------- */

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(APP_SHELL);
    })
  );

  self.skipWaiting();
});

/* ---------------------------------------------------------
   Activate
   --------------------------------------------------------- */

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    })
  );

  self.clients.claim();
});

/* ---------------------------------------------------------
   Fetch
   --------------------------------------------------------- */

self.addEventListener("fetch", (event) => {
  const request = event.request;

  if (request.method !== "GET") {
    return;
  }

  /*
   * HTML pages:
   * Network first so GitHub Pages gets the newest version.
   * Falls back to cache when offline.
   */

  if (
    request.mode === "navigate" ||
    request.headers.get("accept")?.includes("text/html")
  ) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (
            response &&
            response.status === 200
          ) {
            const copy = response.clone();

            caches.open(CACHE_NAME).then(
              (cache) => {
                cache.put(request, copy);
              }
            );
          }

          return response;
        })
        .catch(() => {
          return caches.match(request).then(
            (cached) => {
              return (
                cached ||
                caches.match("./index.html")
              );
            }
          );
        })
    );

    return;
  }

  /*
   * CSS, JS, images and other static files:
   * Cache first, then network.
   */

  event.respondWith(
    caches.match(request).then(
      (cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }

        return fetch(request).then(
          (response) => {
            if (
              response &&
              response.status === 200 &&
              response.type !== "opaque"
            ) {
              const copy =
                response.clone();

              caches.open(CACHE_NAME).then(
                (cache) => {
                  cache.put(
                    request,
                    copy
                  );
                }
              );
            }

            return response;
          }
        );
      }
    )
  );
});

/* ---------------------------------------------------------
   Message — force update
   --------------------------------------------------------- */

self.addEventListener("message", (event) => {
  if (
    event.data &&
    event.data.type === "SKIP_WAITING"
  ) {
    self.skipWaiting();
  }
});
