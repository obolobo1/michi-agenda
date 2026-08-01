const CACHE_NAME = 'michi-agenda-v6';  
const ARCHIVOS_CACHE = [
    '/michi-agenda/',
    '/michi-agenda/index.html',
    '/michi-agenda/style.css',
    '/michi-agenda/app.js',
    '/michi-agenda/firebase.js',
    '/michi-agenda/manifest.json',
    '/michi-agenda/michis/naranjoso.png',
    '/michi-agenda/michis/negro.png',
    '/michi-agenda/michis/blanco.png',
    '/michi-agenda/michis/gris.png',
    '/michi-agenda/michis/calica.png',
    '/michi-agenda/michis/azul.png',
    '/michi-agenda/michis/tony.png',
    '/michi-agenda/michis/sombra.png',
    '/michi-agenda/michis/pachon.png',
    '/michi-agenda/michis/especial1.png',
    '/michi-agenda/michis/vikingo.png',
    '/michi-agenda/michis/transportadora.png',
    '/michi-agenda/michis/marcofuego.png',
    '/michi-agenda/michis/marcoflores.png',
    '/michi-agenda/michis/marcocyber.png',
    '/michi-agenda/michis/marcovikingo.png',
    '/michi-agenda/michis/marcorosas.png',
];

// Instalación — cachear archivos estáticos
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            return cache.addAll(ARCHIVOS_CACHE);
        })
    );
    self.skipWaiting();
});

// Activación — limpiar cachés viejos
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(keys => {
            return Promise.all(
                keys.filter(key => key !== CACHE_NAME)
                    .map(key => caches.delete(key))
            );
        })
    );
    self.clients.claim();
});

// Fetch — cachear estáticos, red para Firebase
self.addEventListener('fetch', event => {
    const url = new URL(event.request.url);

    // Firebase y APIs externas — siempre red
    if (url.hostname.includes('firebase') ||
        url.hostname.includes('googleapis') ||
        url.hostname.includes('gstatic') ||
        url.hostname.includes('anthropic')) {
        event.respondWith(fetch(event.request));
        return;
    }

    // Archivos estáticos — caché primero, red como respaldo
    event.respondWith(
        caches.match(event.request).then(cached => {
            return cached || fetch(event.request).then(response => {
                // Guardar en caché si es un recurso válido
                if (response && response.status === 200 && response.type === 'basic') {
                    const clone = response.clone();
                    caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
                }
                return response;
            });
        }).catch(() => {
            // Sin red y sin caché — mostrar index.html
            if (event.request.destination === 'document') {
                return caches.match('/michi-agenda/index.html');
            }
        })
    );
});
