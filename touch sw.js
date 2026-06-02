const CACHE_NAME = 'michi-agenda-v1';
const ARCHIVOS = [
    '/',
    '/michi-agenda/',
    '/michi-agenda/index.html',
    '/michi-agenda/style.css',
    '/michi-agenda/app.js',
    '/michi-agenda/manifest.json',
    '/michi-agenda/Icono agenda.png'
];

// ── INSTALACIÓN ───────────────────────────────────────
self.addEventListener('install', evento => {
    evento.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            console.log('Michi Agenda: archivos en caché');
            return cache.addAll(ARCHIVOS);
        })
    );
    self.skipWaiting();
});

// ── ACTIVACIÓN ────────────────────────────────────────
self.addEventListener('activate', evento => {
    evento.waitUntil(
        caches.keys().then(keys => {
            return Promise.all(
                keys.filter(key => key !== CACHE_NAME)
                    .map(key => caches.delete(key))
            );
        })
    );
    self.clients.claim();
});

// ── INTERCEPTAR RED ───────────────────────────────────
self.addEventListener('fetch', evento => {
    evento.respondWith(
        caches.match(evento.request).then(cached => {
            // Si está en caché, sirve desde ahí
            // Pero también actualiza en segundo plano
            const fetchPromise = fetch(evento.request).then(response => {
                if (response && response.status === 200) {
                    const clone = response.clone();
                    caches.open(CACHE_NAME).then(cache => {
                        cache.put(evento.request, clone);
                    });
                }
                return response;
            }).catch(() => cached);

            return cached || fetchPromise;
        })
    );
});

// ── NOTIFICACIONES ────────────────────────────────────
self.addEventListener('notificationclick', evento => {
    evento.notification.close();
    evento.waitUntil(
        clients.openWindow('/michi-agenda/')
    );
});