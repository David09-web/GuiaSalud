// GuiaSalud Service Worker v1.0 — Offline-first PWA
const CACHE_NAME = 'guiasalud-v1';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/icon-512.png',
  '/manifest.json',
];

// Install: pre-cache static shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

// Activate: purge old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Fetch: network-first for HTML/API, cache-first for assets
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET and cross-origin
  if (request.method !== 'GET' || url.origin !== location.origin) return;

  // Don't intercept Chrome/browser extensions or dev scripts
  if (url.protocol !== 'http:' && url.protocol !== 'https:') return;

  // API calls: network only
  if (url.pathname.startsWith('/api/')) return;

  // HTML navigation: network-first with offline fallback
  if (request.mode === 'navigate' || request.headers.get('accept')?.includes('text/html')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          return response;
        })
        .catch(() => caches.match('/index.html'))
    );
    return;
  }

  // Static assets: cache-first
  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;
      return fetch(request).then((response) => {
        if (response.ok) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
        }
        return response;
      });
    })
  );
});

// Push notification support (Apple APNs / Google FCM / Web Push)
self.addEventListener('push', (event) => {
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch {
    data = { body: event.data ? event.data.text() : '' };
  }

  const title = data.title || '🏥 GuiaSalud';
  const options = {
    body: data.body || 'Tienes un recordatorio de salud programado',
    icon: '/icon-512.png',
    badge: '/icon-512.png',
    vibrate: [200, 100, 200],
    tag: data.tag || 'guiasalud-alert',
    data: data.data || { url: '/' },
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

// Programador de recordatorios en segundo plano
let scheduledTimeouts = [];

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SCHEDULE_REMINDERS') {
    // Limpiar temporizadores previos para evitar duplicados
    scheduledTimeouts.forEach((id) => clearTimeout(id));
    scheduledTimeouts = [];

    const reminders = event.data.reminders || [];
    const now = Date.now();

    reminders.forEach((r) => {
      const delay = r.targetTimeMs - now;
      // Si la alerta está en el futuro y dentro de las próximas 24 horas
      if (delay > 0 && delay < 24 * 60 * 60 * 1000) {
        const timeoutId = setTimeout(() => {
          self.registration.showNotification(r.title, {
            body: r.body,
            icon: '/icon-512.png',
            badge: '/icon-512.png',
            tag: r.tag,
            vibrate: [200, 100, 200],
            data: { url: r.url || '/' },
          });
        }, delay);
        scheduledTimeouts.push(timeoutId);
      }
    });
  }
});

// Handle notification click
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = event.notification.data?.url || '/';
  event.waitUntil(
    self.clients.matchAll({ type: 'window' }).then((clients) => {
      for (const client of clients) {
        if (client.url === url && 'focus' in client) return client.focus();
      }
      return self.clients.openWindow(url);
    })
  );
});
