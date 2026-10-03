/* =============================================================================
   port-droid — sw.js (Service Worker / PWA)
   Estratégia:
   - HTML/navegação e games.json: network-first (conteúdo sempre fresco,
     com fallback para o cache quando offline).
   - Demais recursos (CSS/JS/imagens): stale-while-revalidate (rápido e
     atualiza em segundo plano).
   Para publicar uma nova versão do site, aumente a constante VERSION.
   ============================================================================= */
"use strict";

const VERSION = "v1.4.0";
const CACHE = `port-droid-${VERSION}`;

const PRECACHE = [
  "./",
  "./index.html",
  "./catalog.html",
  "./game.html",
  "./about.html",
  "./legal.html",
  "./404.html",
  "./manifest.json",
  "./data/games.json",
  "./assets/css/style.css",
  "./assets/css/pages.css",
  "./assets/js/main.js",
  "./assets/js/home.js",
  "./assets/js/catalog.js",
  "./assets/js/game.js",
  "./assets/img/logo.svg",
  "./assets/img/favicon.svg",
  "./assets/img/games/sonic-unleashed/cover.svg",
  "./assets/img/games/sonic-unleashed/banner.svg",
  "./assets/img/games/skate-3/cover.svg",
  "./assets/img/games/skate-3/banner.svg",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE)
      .then((cache) => cache.addAll(PRECACHE))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;

  const url = new URL(req.url);
  if (url.origin !== location.origin) return; // não intercepta terceiros (YouTube, GitHub…)

  const isNavigation =
    req.mode === "navigate" ||
    url.pathname.endsWith(".html") ||
    url.pathname.endsWith("/") ||
    url.pathname.endsWith(".json");

  /* Páginas e dados: rede primeiro, cache como fallback (inclui offline) */
  if (isNavigation) {
    event.respondWith(
      fetch(req)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(req, copy));
          return res;
        })
        .catch(() =>
          caches
            .match(req, { ignoreSearch: true })
            .then((m) => m || caches.match("./404.html"))
        )
    );
    return;
  }

  /* Assets estáticos: cache primeiro + revalidação em segundo plano */
  event.respondWith(
    caches.match(req).then((hit) => {
      const network = fetch(req)
        .then((res) => {
          if (res && res.ok) {
            const copy = res.clone();
            caches.open(CACHE).then((c) => c.put(req, copy));
          }
          return res;
        })
        .catch(() => hit);
      return hit || network;
    })
  );
});
