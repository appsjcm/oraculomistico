const CACHE_NAME = 'oraculo-v20-6-ideal';
const APP_SHELL = [
  './',
  './index.html',
  './styles.css',
  './manifest.json',
  './icon-192.png',
  './icon-512.png',
  './apple-touch-icon.png',
  './favicon.svg',
  './grabovoi_db.json',
  './js/app.js',
  './js/utils.js',
  './js/pdf.js',
  './js/voice.js',
  './js/ia.js',
  './js/store.js',
  './js/tarot.js',
  './js/runas.js',
  './js/tiradas.js',
  './js/luna.js',
  './js/suenos.js',
  './js/numerologia.js',
  './js/grabovoi.js',
  './js/settings.js',
  './js/chat.js',
  './js/config.js',
  './js/data.js',
  './js/lazyLoad.js',
  './js/microphone.js',
  './js/speechRecognition.js',
  './js/voiceRecorder.js',
  './js/moonshine.js'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => Promise.allSettled(APP_SHELL.map(url => cache.add(url))))
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))))
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET') return;

  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then(response => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put('./index.html', copy));
          return response;
        })
        .catch(() => caches.match('./index.html'))
    );
    return;
  }

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) {
    event.respondWith(fetch(request).catch(() => caches.match(request)));
    return;
  }

  event.respondWith(
    caches.match(request).then(cached => {
      const refresh = fetch(request).then(response => {
        if (response && response.ok) {
          const copy = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(request, copy));
        }
        return response;
      }).catch(() => cached);
      return cached || refresh;
    })
  );
});
