/* Timekeeper service worker — precache the whole shell, serve cache-first.
   Bump CACHE on every asset change; the old cache is dropped on activate. */
const CACHE = "timekeeper-v2";

const ASSETS = [
  "./",
  "./index.html",
  "./fonts.css",
  "./manifest.webmanifest",
  "./fonts/doto-500-latin-ext.woff2",
  "./fonts/doto-500-latin.woff2",
  "./fonts/ibmplexmono-400-latin-ext.woff2",
  "./fonts/ibmplexmono-400-latin.woff2",
  "./fonts/ibmplexmono-500-latin-ext.woff2",
  "./fonts/ibmplexmono-500-latin.woff2",
  "./fonts/ibmplexsanscondensed-400-latin-ext.woff2",
  "./fonts/ibmplexsanscondensed-400-latin.woff2",
  "./fonts/ibmplexsanscondensed-500-latin-ext.woff2",
  "./fonts/ibmplexsanscondensed-500-latin.woff2",
  "./fonts/ibmplexsanscondensed-600-latin-ext.woff2",
  "./fonts/ibmplexsanscondensed-600-latin.woff2",
  "./icons/favicon-32.png",
  "./icons/icon-180.png",
  "./icons/icon-192.png",
  "./icons/icon-512-maskable.png",
  "./icons/icon-512.png"
];

self.addEventListener("install", e => {
  e.waitUntil(
    caches.open(CACHE)
      .then(c => c.addAll(ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET") return;
  if (new URL(req.url).origin !== self.location.origin) return;

  // Navigations always resolve to the shell, online or off.
  if (req.mode === "navigate") {
    e.respondWith(
      caches.match("./index.html").then(hit => hit || fetch(req))
    );
    return;
  }

  e.respondWith(
    caches.match(req).then(hit => hit || fetch(req).then(res => {
      if (res.ok && res.type === "basic") {
        const copy = res.clone();
        caches.open(CACHE).then(c => c.put(req, copy));
      }
      return res;
    }))
  );
});
