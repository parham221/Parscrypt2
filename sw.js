const CACHE_NAME = 'crypto-parham-v1';
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './icons/icon-192.png',
  './icons/icon-512.png'
];

// نصب و کش‌سازی اولیه
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(ASSETS))
      .then(() => self.skipWaiting())
  );
});

// فعال‌سازی و پاک‌سازی کش‌های قدیمی
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.map(key => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      )
    ).then(() => self.clients.claim())
  );
});

// هندل درخواست‌ها
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(cached => {
        if (cached) {
          return cached;
        }
        return fetch(event.request)
          .then(response => {
            // فقط درخواست‌های موفق را کش کن
            if (response.ok) {
              const clone = response.clone();
              caches.open(CACHE_NAME).then(cache => {
                cache.put(event.request, clone);
              });
            }
            return response;
          });
      })
      .catch(() => {
        // fallback: اگر درخواست عکس یا فایل html باشد
        if (event.request.destination === 'document') {
          return caches.match('./index.html');
        }
      })
  );
});