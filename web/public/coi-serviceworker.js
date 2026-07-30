// COOP/COEP service-worker shim: re-adds the cross-origin-isolation headers to every
// response so SharedArrayBuffer — and thus the wasm CPU-thread pool — is available on
// a static host that can't set headers (GitHub Pages). The app registers this and
// reloads once so it controls the page. Based on coi-serviceworker (Guido Zuidhof, MIT).
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (event) => event.waitUntil(self.clients.claim()));

self.addEventListener("fetch", (event) => {
  const req = event.request;
  // Range requests / only-if-cached cross-origin can't be reconstructed; pass through.
  if (req.cache === "only-if-cached" && req.mode !== "same-origin") return;
  event.respondWith(
    fetch(req)
      .then((response) => {
        if (response.status === 0) return response; // opaque response — leave as-is
        const headers = new Headers(response.headers);
        headers.set("Cross-Origin-Embedder-Policy", "require-corp");
        headers.set("Cross-Origin-Resource-Policy", "cross-origin");
        headers.set("Cross-Origin-Opener-Policy", "same-origin");
        return new Response(response.body, {
          status: response.status,
          statusText: response.statusText,
          headers,
        });
      })
      .catch((err) => console.error(err))
  );
});
