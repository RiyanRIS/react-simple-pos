/**
 * Dark Mode Utility & LocalStorage Persistence
 * Menjaga kenyamanan mata kasir untuk shift malam dan ruangan minim cahaya.
 */

export function getStoredThemeMode() {
    if (typeof window === 'undefined') return 'light';
    const stored = localStorage.getItem('theme_mode');
    if (stored === 'dark' || stored === 'light') {
        return stored;
    }
    // Default fallback ke system preference jika belum pernah diatur
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light';
}

export function isDarkModeActive() {
    if (typeof document === 'undefined') return false;
    return document.documentElement.classList.contains('dark');
}

export function applyThemeMode(mode) {
    if (typeof document === 'undefined') return;

    const isDark = mode === 'dark';
    if (isDark) {
        document.documentElement.classList.add('dark');
        localStorage.setItem('theme_mode', 'dark');
    } else {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('theme_mode', 'light');
    }

    // Trigger event agar semua komponen yang me-listen bisa update reaktif
    window.dispatchEvent(
        new CustomEvent('theme-mode-changed', {
            detail: { mode: isDark ? 'dark' : 'light', isDark },
        })
    );
}

export function toggleThemeMode() {
    const isCurrentlyDark = isDarkModeActive();
    const nextMode = isCurrentlyDark ? 'light' : 'dark';
    applyThemeMode(nextMode);
    return nextMode;
}
