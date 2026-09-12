/**
 * Penyetan POS - Modern Service Worker
 * Cache Strategy: 
 * - Static Assets (CSS, JS, Fonts, Icons): Cache-First with Network Fallback
 * - Navigation & Inertia JSON: Network-First with Cache Fallback
 * - Mutations (POST, PUT, DELETE): Direct Network (Never Cached)
 */

const CACHE_NAME = 'penyetan-pos-v1';

// Aset statis inti untuk pre-caching saat instalasi
const PRECACHE_ASSETS = [
    '/',
    '/pos',
    '/manifest.json',
    '/favicon.png',
    '/icon-192.png',
    '/icon-512.png',
    '/apple-touch-icon.png'
];

// Event: Install (Simpan aset inti ke cache)
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(PRECACHE_ASSETS);
        }).then(() => self.skipWaiting())
    );
});

// Event: Activate (Bersihkan cache lama)
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName.startsWith('penyetan-pos-') && cacheName !== CACHE_NAME) {
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => self.clients.claim())
    );
});

// Event: Fetch (Tangani request offline/online)
self.addEventListener('fetch', (event) => {
    const request = event.request;
    const url = new URL(request.url);

    // 1. Jangan cache request non-GET (POST pesanan, PUT, DELETE)
    if (request.method !== 'GET') {
        return;
    }

    // 2. Jangan intercept request chrome-extension atau API pihak ketiga
    if (!url.protocol.startsWith('http')) {
        return;
    }

    // 3. Strategi Cache-First untuk aset statis (/build/*, fonts, images)
    const isStaticAsset = 
        url.pathname.startsWith('/build/') ||
        url.pathname.match(/\.(png|jpg|jpeg|svg|webp|ico|woff2|woff|ttf|css|js)$/i) ||
        url.hostname.includes('fonts.googleapis.com') ||
        url.hostname.includes('fonts.gstatic.com');

    if (isStaticAsset) {
        event.respondWith(
            caches.match(request).then((cachedResponse) => {
                if (cachedResponse) {
                    return cachedResponse;
                }

                return fetch(request).then((networkResponse) => {
                    if (networkResponse && networkResponse.status === 200) {
                        const responseToCache = networkResponse.clone();
                        caches.open(CACHE_NAME).then((cache) => {
                            cache.put(request, responseToCache);
                        });
                    }
                    return networkResponse;
                }).catch(() => {
                    // Fallback jika aset gambar/statis gagal diakses offline
                    return cachedResponse || new Response('', { status: 408 });
                });
            })
        );
        return;
    }

    // 4. Strategi Network-First untuk Navigasi & Inertia Requests
    // Selalu coba ambil data terbaru dari server; jika offline, fallback ke cache terakhir
    event.respondWith(
        fetch(request)
            .then((networkResponse) => {
                if (networkResponse && networkResponse.status === 200) {
                    const responseToCache = networkResponse.clone();
                    caches.open(CACHE_NAME).then((cache) => {
                        cache.put(request, responseToCache);
                    });
                }
                return networkResponse;
            })
            .catch(async () => {
                const cachedResponse = await caches.match(request);
                if (cachedResponse) {
                    return cachedResponse;
                }

                // Jika navigasi halaman HTML offline dan belum ada di cache, arahkan ke cache POS
                if (request.mode === 'navigate') {
                    const fallbackPos = await caches.match('/pos');
                    if (fallbackPos) {
                        return fallbackPos;
                    }
                }

                return new Response(
                    `<!DOCTYPE html>
                    <html lang="id">
                    <head>
                        <meta charset="utf-8">
                        <title>Koneksi Terputus - Penyetan POS</title>
                        <meta name="viewport" content="width=device-width, initial-scale=1.0">
                        <style>
                            body { font-family: sans-serif; background: #0f172a; color: #f8fafc; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; padding: 16px; text-align: center; }
                            .card { background: #1e293b; border: 2px solid #334155; padding: 24px; max-width: 400px; box-shadow: 4px 4px 0px 0px #000; }
                            h1 { font-size: 1.25rem; font-weight: 800; margin-bottom: 8px; color: #f59e0b; text-transform: uppercase; }
                            p { font-size: 0.875rem; color: #94a3b8; line-height: 1.5; }
                            button { margin-top: 16px; padding: 8px 16px; background: #059669; color: white; border: 2px solid #000; font-weight: 800; cursor: pointer; text-transform: uppercase; font-size: 0.75rem; }
                        </style>
                    </head>
                    <body>
                        <div class="card">
                            <h1>Koneksi Terputus</h1>
                            <p>Perangkat Anda sedang tidak terhubung ke jaringan internet / server kasir.</p>
                            <button onclick="window.location.reload()">Coba Muat Ulang</button>
                        </div>
                    </body>
                    </html>`,
                    {
                        headers: { 'Content-Type': 'text/html; charset=utf-8' }
                    }
                );
            })
    );
});
