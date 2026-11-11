// Cache per uso offline. Se modifichi i file dell'app, cambia il numero di versione qui sotto.
const CACHE = "cedolini-v2";
const CDN = [
  "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js",
  "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js"
];
self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c =>
    Promise.all(["./", "./index.html", "./icon.png", ...CDN].map(u => c.add(u).catch(() => {})))
  ));
  self.skipWaiting();
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => clients.claim()));
});
self.addEventListener("fetch", e => {
  if (e.request.method !== "GET") return;
  const same = new URL(e.request.url).origin === location.origin;
  const store = res => {
    if (res && res.ok) { const copy = res.clone(); caches.open(CACHE).then(c => c.put(e.request, copy)).catch(() => {}); }
    return res;
  };
  e.respondWith(same
    ? fetch(e.request).then(store).catch(() => caches.match(e.request))
    : caches.match(e.request).then(r => r || fetch(e.request).then(store)));
});
