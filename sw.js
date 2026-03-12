const CACHE_NAME = 'audino-shell-v1'
const BASE_PATH = new URL('./', self.location).pathname
const APP_SHELL_URLS = [
  BASE_PATH,
  `${BASE_PATH}index.html`,
  `${BASE_PATH}manifest.webmanifest`,
  `${BASE_PATH}audino_logo.png`,
  `${BASE_PATH}audino_wortmarke.png`,
  `${BASE_PATH}audino_app_icon.png`,
  `${BASE_PATH}favicon.svg`,
  `${BASE_PATH}apple-touch-icon.png`,
  `${BASE_PATH}icon-192.png`,
  `${BASE_PATH}icon-512.png`,
]

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL_URLS))
  )
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) =>
      Promise.all(
        cacheNames
          .filter((cacheName) => cacheName !== CACHE_NAME)
          .map((cacheName) => caches.delete(cacheName))
      )
    )
  )
  self.clients.claim()
})

self.addEventListener('fetch', (event) => {
  const { request } = event

  if (request.method !== 'GET') {
    return
  }

  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).catch(async () => {
        const cache = await caches.open(CACHE_NAME)
        return cache.match(`${BASE_PATH}index.html`) || cache.match(BASE_PATH)
      })
    )
    return
  }

  if (new URL(request.url).origin !== self.location.origin) {
    return
  }

  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse
      }

      return fetch(request).then((networkResponse) => {
        const responseClone = networkResponse.clone()
        caches.open(CACHE_NAME).then((cache) => cache.put(request, responseClone))
        return networkResponse
      })
    })
  )
})
