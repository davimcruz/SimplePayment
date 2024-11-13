const CACHE_NAME = 'simple-finance-v2'
const OFFLINE_URL = '/offline'

const STATIC_ASSETS = [
  '/',
  '/offline',
  '/manifest.json',
  
  '/logos/icon-192.png',
  '/logos/icon-512.png',
  '/images/favicon.ico',
  '/utilities/profile.png',
  '/og-image.png',
  
  '/cards/elo.svg',
  '/cards/hipercard.svg',
  '/cards/mastercard.svg',
  '/cards/visa.svg',
  '/cards/amex.svg'
]

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return Promise.allSettled(
          STATIC_ASSETS.map(url => 
            cache.add(url).catch(error => {
              console.warn(`Falha ao cachear ${url}:`, error)
            })
          )
        )
      })
  )
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((cacheName) => cacheName !== CACHE_NAME)
          .map((cacheName) => caches.delete(cacheName))
      )
    })
  )
})

self.addEventListener('fetch', (event) => {
  if (event.request.mode === 'navigate' || 
      (event.request.method === 'GET' && 
       event.request.headers.get('accept')?.includes('text/html'))) {
    event.respondWith(
      fetch(event.request)
        .catch(() => {
          return caches.match(OFFLINE_URL) || caches.match('/')
        })
    )
    return
  }

  if (event.request.destination === 'image') {
    event.respondWith(
      caches.match(event.request)
        .then((response) => {
          return response || fetch(event.request)
            .then((fetchResponse) => {
              const clonedResponse = fetchResponse.clone()
              caches.open(CACHE_NAME)
                .then((cache) => cache.put(event.request, clonedResponse))
              return fetchResponse
            })
            .catch(() => {
              if (event.request.url.includes('profile.png')) {
                return caches.match('/utilities/profile.png')
              }
              return new Response('', { 
                status: 408, 
                statusText: 'Request timeout' 
              })
            })
        })
    )
    return
  }

  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        if (response) {
          return response
        }
        return fetch(event.request)
          .then((fetchResponse) => {
            if (event.request.url.includes('/api/')) {
              return fetchResponse
            }
            
            const clonedResponse = fetchResponse.clone()
            caches.open(CACHE_NAME)
              .then((cache) => cache.put(event.request, clonedResponse))
            return fetchResponse
          })
          .catch(() => {
            return new Response('', { 
              status: 408, 
              statusText: 'Request timeout' 
            })
          })
      })
  )
})

self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-transactions') {
    event.waitUntil(syncTransactions())
  }
})

async function syncTransactions() {
  try {
    const pendingTransactions = await getPendingTransactions()
    for (const transaction of pendingTransactions) {
      await fetch('/api/transactions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(transaction)
      })
    }
    await clearPendingTransactions()
  } catch (error) {
    console.error('Erro na sincronização:', error)
  }
} 