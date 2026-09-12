import './bootstrap';
import '../css/app.css';

import { createRoot } from 'react-dom/client';
import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';

const appName = import.meta.env.VITE_APP_NAME || 'Penyetan POS';

createInertiaApp({
    title: (title) => title,
    resolve: (name) => resolvePageComponent(`./Pages/${name}.jsx`, import.meta.glob('./Pages/**/*.jsx')),
    setup({ el, App, props }) {
        const initialTheme = props.initialPage.props?.store?.theme_color || 'emerald';
        if (typeof document !== 'undefined') {
            document.documentElement.setAttribute('data-theme', initialTheme);
        }
        const root = createRoot(el);
        root.render(<App {...props} />);
    },
    progress: {
        color: '#059669',
    },
});

// PWA Service Worker Registration
if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker
            .register('/sw.js')
            .then((registration) => {
                // Cek pembaruan berkala jika ada versi sw baru
                registration.onupdatefound = () => {
                    const installingWorker = registration.installing;
                    if (installingWorker) {
                        installingWorker.onstatechange = () => {
                            if (installingWorker.state === 'installed' && navigator.serviceWorker.controller) {
                                console.log('Versi baru Penyetan POS tersedia. Refresh untuk memperbarui.');
                            }
                        };
                    }
                };
            })
            .catch((error) => {
                console.warn('PWA Service Worker gagal didaftarkan:', error);
            });
    });
}
