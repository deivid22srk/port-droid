/*
   port-droid — play/coi.js
   Service worker de escopo restrito à pasta play/ do player.

   O runner do port web precisa de SharedArrayBuffer, e isso exige que a
   PÁGINA DO TOPO esteja isolada cross-origin (COOP + COEP). Hospedeiros
   estáticos como o GitHub Pages não enviam esses cabeçalhos — então este
   worker os adiciona apenas nas respostas consumidas dentro de play/,
   sem alterar o restante do site (que embute iframes externos, como o
   player do YouTube, e não pode ter COEP global).

   Mesma técnica usada pelo próprio Halo CE Mobile (sw.js do projeto,
   licença CC0-1.0).
*/
"use strict";

self.addEventListener("install", () => self.skipWaiting());

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;
  event.respondWith(
    (async () => {
      try {
        const res = await fetch(req);
        const headers = new Headers(res.headers);
        /* COOP só na navegação do TOPO (destination "document"). Em iframes
           (destination "iframe") COOP: same-origin moveria o frame para outro
           agent cluster e o pai perderia o acesso ao DOM do runner (atalho
           "Selecionar ISO"). O COEP vale para tudo — é o que dá threads ao
           runner junto com o COOP do topo. */
        if (req.destination === "document") {
          headers.set("Cross-Origin-Opener-Policy", "same-origin");
        }
        headers.set("Cross-Origin-Embedder-Policy", "require-corp");
        return new Response(res.body, {
          status: res.status,
          statusText: res.statusText,
          headers,
        });
      } catch (_) {
        return fetch(req);
      }
    })()
  );
});
