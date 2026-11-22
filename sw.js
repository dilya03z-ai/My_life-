
const CACHE_NAME = 'my-life-v1';

const APP_FILES = [
  './',
  './index.html',
  './style.css',
  './script.js',
  './manifest.json',

  './pages/calendar.html',
  './pages/finance.html',
  './pages/notes.html',
  './pages/nutrition.html',
  './pages/nutrition.js',
  './pages/fitness.html',
  './pages/fitness.js',

  './icons/icon-192.png',
  './icons/icon-512.png'
];

// Установка и сохранение файлов приложения

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(APP_FILES))
      .then(() => self.skipWaiting())
  );
});

// Очистка старого кэша

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(key =>
            key.startsWith('my-life-') &&
            key !== CACHE_NAME
          )
          .map(key => caches.delete(key))
      )
    ).then(() => self.clients.claim())
  );
});

// Загрузка страниц и файлов

self.addEventListener('fetch', event => {
  const request = event.request;

  if (request.method !== 'GET') return;

  const url = new URL(request.url);

  // Внешние сайты, включая YouTube, не кэшируем
  if (url.origin !== self.location.origin) return;

  event.respondWith(
    fetch(request)
      .then(response => {
        if (response && response.status === 200) {
          const copy = response.clone();

          caches.open(CACHE_NAME).then(cache => {
            cache.put(request, copy);
          });
        }

        return response;
      })
      .catch(() => {
        return caches.match(request).then(cached => {
          if (cached) return cached;

          if (request.mode === 'navigate') {
            return caches.match('./index.html');
          }

          return new Response('Файл недоступен офлайн', {
            status: 503,
            headers: {
              'Content-Type': 'text/plain; charset=utf-8'
            }
          });
        });
      })
  );
});
