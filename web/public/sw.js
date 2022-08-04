self.addEventListener('install', (event) => {
  event.waitUntil(caches.open('shartube-cache').then((cache) => {
    cache.addAll([
      '/',
      '/index.html',
      '/register',
      '/login'
    ]);
  }))
});