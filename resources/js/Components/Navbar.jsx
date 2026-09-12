import React, { useState, useEffect } from 'react';
import { Link, router, usePage } from '@inertiajs/react';
import {
    Store,
    BarChart3,
    Receipt,
    Bluetooth,
    BluetoothConnected,
    Clock,
    UtensilsCrossed,
    LogOut,
    User,
    Users,
    AlertTriangle,
    Settings,
    Sun,
    Moon,
    WifiOff
} from 'lucide-react';
import { connectPrinter, disconnectPrinter, getConnectedPrinterName, isPrinterConnected, isWebBluetoothSupported } from '@/Utils/BluetoothPrinterHelper';
import { getActiveTheme } from '@/Utils/themeHelper';
import { toggleThemeMode, isDarkModeActive } from '@/Utils/darkMode';

export default function Navbar({ onPrinterStatusChange }) {
    const { url } = usePage();
    const { auth, store } = usePage().props;
    const isOwner = auth?.user?.role === 'owner';
    const currentTheme = getActiveTheme(store?.theme_color);

    const storeName = store?.name || 'Pecel Lele Sedap';
    const storeInitials = store?.initials || 'PL';
    const storeTagline = store?.tagline || 'POS & Monitor Penjualan';

    const [currentTime, setCurrentTime] = useState('');
    const [printerStatus, setPrinterStatus] = useState({
        connected: false,
        name: null,
    });
    const [isConnecting, setIsConnecting] = useState(false);
    const [isDark, setIsDark] = useState(false);
    const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);

    // Deteksi Status Online / Offline Jaringan
    useEffect(() => {
        const handleOnline = () => setIsOnline(true);
        const handleOffline = () => setIsOnline(false);
        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);
        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    // State Modal Konfirmasi Bertema Flat Retro / Neo-Brutalist
    const [showLogoutModal, setShowLogoutModal] = useState(false);
    const [showDisconnectModal, setShowDisconnectModal] = useState(false);
    const [printerAlertMessage, setPrinterAlertMessage] = useState(null);

    useEffect(() => {
        setIsDark(isDarkModeActive());
        const handleThemeModeChange = (e) => {
            if (e?.detail) {
                setIsDark(e.detail.isDark);
            }
        };
        window.addEventListener('theme-mode-changed', handleThemeModeChange);
        return () => window.removeEventListener('theme-mode-changed', handleThemeModeChange);
    }, []);

    const handleToggleDarkMode = () => {
        const nextMode = toggleThemeMode();
        setIsDark(nextMode === 'dark');
    };

    useEffect(() => {
        // Cek inisialisasi status koneksi printer
        const isConn = isPrinterConnected();
        const name = getConnectedPrinterName();
        const initialInfo = { connected: isConn, name };
        setPrinterStatus(initialInfo);
        if (onPrinterStatusChange) onPrinterStatusChange(initialInfo);

        // Dengarkan event sinkronisasi status printer global
        const handleStatusChanged = (e) => {
            if (e?.detail) {
                setPrinterStatus(e.detail);
                if (onPrinterStatusChange) onPrinterStatusChange(e.detail);
            }
        };

        window.addEventListener('printer-status-changed', handleStatusChanged);
        return () => window.removeEventListener('printer-status-changed', handleStatusChanged);
    }, [onPrinterStatusChange]);

    // Sinkronisasi data-theme ke elemen <html> setiap kali store.theme_color berubah
    useEffect(() => {
        if (typeof document !== 'undefined' && store?.theme_color) {
            document.documentElement.setAttribute('data-theme', store.theme_color);
        }
    }, [store?.theme_color]);

    useEffect(() => {
        const updateTime = () => {
            const now = new Date();
            const formatted = now.toLocaleDateString('id-ID', {
                weekday: 'short',
                day: 'numeric',
                month: 'short',
                hour: '2-digit',
                minute: '2-digit',
            });
            setCurrentTime(formatted);
        };
        updateTime();
        const timer = setInterval(updateTime, 10000);
        return () => clearInterval(timer);
    }, []);

    const handleConnectPrinter = async () => {
        if (printerStatus.connected) {
            setShowDisconnectModal(true);
            return;
        }

        if (!isWebBluetoothSupported()) {
            setPrinterAlertMessage('Browser ini belum mendukung Web Bluetooth API. Gunakan Google Chrome di Android atau PC untuk menghubungkan langsung ke printer Bluetooth.');
            return;
        }

        setIsConnecting(true);
        try {
            const res = await connectPrinter();
            setPrinterStatus({
                connected: true,
                name: res.name,
            });
            if (onPrinterStatusChange) {
                onPrinterStatusChange({ connected: true, name: res.name });
            }
        } catch (err) {
            console.log('Bluetooth connection cancelled or failed', err);
        } finally {
            setIsConnecting(false);
        }
    };

    const handleConfirmDisconnect = () => {
        disconnectPrinter();
        setShowDisconnectModal(false);
    };

    const handleLogout = () => {
        setShowLogoutModal(true);
    };

    const handleConfirmLogout = () => {
        setShowLogoutModal(false);
        router.post('/logout');
    };

    const isPos = url.startsWith('/pos') || url === '/';
    const isDashboard = url.startsWith('/dashboard');
    const isOrders = url.startsWith('/orders');
    const isProducts = url.startsWith('/products');
    const isUsers = url.startsWith('/users');
    const isSettings = url.startsWith('/settings');

    const activeTabClass = `${currentTheme.classes.bgPrimary} text-white shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] dark:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] border-slate-900 dark:border-slate-700`;
    const inactiveTabClass = 'bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white border-slate-900 dark:border-slate-700';

    return (
        <header className="no-print bg-white dark:bg-slate-900 border-b-2 border-slate-900 dark:border-slate-800 shrink-0 sticky top-0 z-40 select-none">
            <div className="w-full max-w-[1500px] mx-auto px-3 sm:px-5 lg:px-6">
                <div className="flex items-center justify-between h-14 sm:h-16 gap-2 sm:gap-4">
                    {/* Brand & Logo (Dynamic Store Identity) */}
                    <Link
                        href={isOwner ? "/dashboard" : "/pos"}
                        className="shrink-0 flex items-center space-x-2.5 group"
                    >
                        <div className={`w-8 h-8 sm:w-9 sm:h-9 ${currentTheme.classes.bgPrimary} border-2 border-slate-900 dark:border-slate-700 flex items-center justify-center font-black text-white text-sm sm:text-base tracking-wider shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] dark:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] group-hover:translate-x-0.5 group-hover:translate-y-0.5 transition shrink-0`}>
                            {storeInitials}
                        </div>
                        <div className="flex flex-col">
                            <span className="font-black text-xs sm:text-sm text-slate-900 dark:text-white tracking-tight leading-tight uppercase whitespace-nowrap">
                                {storeName}
                            </span>
                            <span className={`text-[9.5px] sm:text-[10px] font-bold ${currentTheme.classes.textPrimary} tracking-wider uppercase leading-none whitespace-nowrap`}>
                                {storeTagline}
                            </span>
                        </div>
                    </Link>

                    {/* Navigation Links (Sleek Flat Retro Tabs, No Wrap) */}
                    <nav className="flex items-center space-x-1 sm:space-x-1.5 overflow-x-auto no-scrollbar py-1">
                        {/* Kasir (POS) */}
                        <Link
                            href="/pos"
                            className={`flex items-center space-x-1.5 px-2.5 sm:px-3 py-1.5 text-xs font-extrabold uppercase tracking-wide border-2 transition whitespace-nowrap shrink-0 ${isPos ? activeTabClass : inactiveTabClass}`}
                        >
                            <Store className="w-3.5 h-3.5 shrink-0" />
                            <span>Kasir (POS)</span>
                        </Link>

                        {/* Kelola Menu (Hanya Pemilik) */}
                        {isOwner && (
                            <Link
                                href="/products"
                                className={`flex items-center space-x-1.5 px-2.5 sm:px-3 py-1.5 text-xs font-extrabold uppercase tracking-wide border-2 transition whitespace-nowrap shrink-0 ${isProducts ? activeTabClass : inactiveTabClass}`}
                            >
                                <UtensilsCrossed className="w-3.5 h-3.5 shrink-0" />
                                <span>Kelola Menu</span>
                            </Link>
                        )}

                        {/* Kelola Kasir (Hanya Pemilik) */}
                        {isOwner && (
                            <Link
                                href="/users"
                                className={`flex items-center space-x-1.5 px-2.5 sm:px-3 py-1.5 text-xs font-extrabold uppercase tracking-wide border-2 transition whitespace-nowrap shrink-0 ${isUsers ? activeTabClass : inactiveTabClass}`}
                            >
                                <Users className="w-3.5 h-3.5 shrink-0" />
                                <span>Kelola Kasir</span>
                            </Link>
                        )}

                        {/* Analitik Pemilik (Hanya Pemilik) */}
                        {isOwner && (
                            <Link
                                href="/dashboard"
                                className={`flex items-center space-x-1.5 px-2.5 sm:px-3 py-1.5 text-xs font-extrabold uppercase tracking-wide border-2 transition whitespace-nowrap shrink-0 ${isDashboard ? activeTabClass : inactiveTabClass}`}
                            >
                                <BarChart3 className="w-3.5 h-3.5 shrink-0" />
                                <span>Analitik</span>
                            </Link>
                        )}

                        {/* Pengaturan Warung (Hanya Pemilik) */}
                        {isOwner && (
                            <Link
                                href="/settings"
                                className={`flex items-center space-x-1.5 px-2.5 sm:px-3 py-1.5 text-xs font-extrabold uppercase tracking-wide border-2 transition whitespace-nowrap shrink-0 ${isSettings ? activeTabClass : inactiveTabClass}`}
                            >
                                <Settings className="w-3.5 h-3.5 shrink-0" />
                                <span>Pengaturan</span>
                            </Link>
                        )}

                        {/* Riwayat Transaksi */}
                        <Link
                            href="/orders"
                            className={`flex items-center space-x-1.5 px-2.5 sm:px-3 py-1.5 text-xs font-extrabold uppercase tracking-wide border-2 transition whitespace-nowrap shrink-0 ${isOrders ? activeTabClass : inactiveTabClass}`}
                        >
                            <Receipt className="w-3.5 h-3.5 shrink-0" />
                            <span>Riwayat</span>
                        </Link>
                    </nav>

                    {/* Right Tools: Theme Toggle, Printer, User Info & Logout */}
                    <div className="shrink-0 flex items-center space-x-1.5 sm:space-x-2">
                        {/* Indikator Offline */}
                        {!isOnline && (
                            <div 
                                title="Koneksi jaringan terputus. Mode offline aktif."
                                className="flex items-center space-x-1.5 px-2 py-1.5 bg-rose-500 text-white border-2 border-slate-900 dark:border-slate-700 text-xs font-black uppercase tracking-wider animate-pulse whitespace-nowrap shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                            >
                                <WifiOff className="w-3.5 h-3.5 shrink-0" />
                                <span className="hidden sm:inline">Offline</span>
                            </div>
                        )}

                        {/* Mode Gelap / Terang Toggle */}
                        <button
                            type="button"
                            onClick={handleToggleDarkMode}
                            title={isDark ? "Beralih ke Mode Terang (Light Mode)" : "Beralih ke Mode Gelap (Dark Mode)"}
                            className="flex items-center space-x-1.5 px-2.5 py-1.5 text-xs font-extrabold uppercase tracking-wider border-2 border-slate-900 dark:border-slate-700 bg-amber-100 hover:bg-amber-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-amber-950 dark:text-amber-300 transition whitespace-nowrap shadow-[1px_1px_0px_0px_rgba(15,23,42,1)] dark:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5"
                        >
                            {isDark ? (
                                <>
                                    <Sun className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                                    {/* <span className="hidden xl:inline">Terang</span> */}
                                </>
                            ) : (
                                <>
                                    <Moon className="w-3.5 h-3.5 text-slate-700 shrink-0" />
                                    {/* <span className="hidden xl:inline">Gelap</span> */}
                                </>
                            )}
                        </button>

                        {/* Bluetooth Printer Button */}
                        <button
                            type="button"
                            onClick={handleConnectPrinter}
                            disabled={isConnecting}
                            title="Koneksi Printer Bluetooth 58mm"
                            className={`flex items-center space-x-1.5 px-2.5 py-1.5 text-xs font-extrabold uppercase tracking-wider border-2 border-slate-900 dark:border-slate-700 transition whitespace-nowrap shadow-[1px_1px_0px_0px_rgba(15,23,42,1)] dark:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] ${printerStatus.connected
                                ? `${currentTheme.classes.badge}`
                                : 'bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200'
                                }`}
                        >
                            {printerStatus.connected ? (
                                <>
                                    <BluetoothConnected className={`w-3.5 h-3.5 ${currentTheme.classes.textPrimary} shrink-0`} />
                                    <span className="hidden xl:inline">{printerStatus.name || 'Printer 58mm'}</span>
                                    {/* <span className="xl:hidden">Print ON</span> */}
                                </>
                            ) : (
                                <>
                                    <Bluetooth className="w-3.5 h-3.5 text-slate-600 dark:text-slate-400 shrink-0" />
                                    {/* <span className="hidden xl:inline">
                                        {isConnecting ? 'Mencari...' : 'Printer'}
                                    </span> */}
                                    {/* <span className="xl:hidden">Printer</span> */}
                                </>
                            )}
                        </button>

                        {/* Profile Badge & Logout Button */}
                        {auth?.user && (
                            <div className="flex items-center space-x-2 pl-2 border-l-2 border-slate-300 dark:border-slate-700">
                                <div className="hidden lg:flex items-center space-x-2">
                                    <div className={`w-7 h-7 border-2 border-slate-900 dark:border-slate-700 flex items-center justify-center font-black text-xs uppercase shadow-[1px_1px_0px_0px_rgba(15,23,42,1)] dark:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] shrink-0 ${isOwner ? 'bg-amber-300 text-amber-950' : 'bg-sky-300 text-sky-950'
                                        }`}>
                                        {auth.user.name.charAt(0)}
                                    </div>
                                    <div className="flex flex-col text-left">
                                        <span className="text-xs font-black text-slate-900 dark:text-white leading-none whitespace-nowrap truncate max-w-[130px]">
                                            {auth.user.name}
                                        </span>
                                        <span className={`text-[8.5px] font-black uppercase px-1 py-0.2 border border-slate-900 dark:border-slate-700 mt-0.5 self-start tracking-wider ${isOwner
                                            ? 'bg-amber-200 text-amber-950'
                                            : 'bg-sky-200 text-sky-950'
                                            }`}>
                                            {isOwner ? 'Pemilik' : 'Kasir'}
                                        </span>
                                    </div>
                                </div>

                                <button
                                    type="button"
                                    onClick={handleLogout}
                                    title="Keluar dari sistem (Logout)"
                                    className="flex items-center space-x-1.5 px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900/60 text-rose-800 dark:text-rose-300 border-2 border-slate-900 dark:border-slate-700 shadow-[1px_1px_0px_0px_rgba(15,23,42,1)] dark:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5 transition text-xs font-black uppercase tracking-wider whitespace-nowrap"
                                >
                                    <LogOut className="w-3.5 h-3.5 text-rose-700 dark:text-rose-400 shrink-0" />
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* MODAL KONFIRMASI KELUAR SISTEM (LOGOUT) */}
            {showLogoutModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-900/70 backdrop-blur-sm animate-in fade-in duration-150">
                    <div className="bg-white dark:bg-slate-900 border-2 border-slate-900 dark:border-slate-700 shadow-[6px_6px_0px_0px_rgba(15,23,42,1)] dark:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] w-full max-w-md p-5 space-y-4">
                        <div className="flex items-start space-x-3">
                            <div className="p-2.5 bg-rose-100 dark:bg-rose-950/60 border-2 border-slate-900 dark:border-slate-700 text-rose-700 dark:text-rose-400 shrink-0 shadow-[1px_1px_0px_0px_rgba(15,23,42,1)] dark:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]">
                                <LogOut className="w-6 h-6" />
                            </div>
                            <div className="flex-1">
                                <h3 className="font-black text-base text-slate-900 dark:text-white uppercase tracking-tight">
                                    Konfirmasi Keluar (Logout)
                                </h3>
                                <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                                    Apakah Anda yakin ingin mengakhiri sesi kasir ini? Anda perlu memasukkan email dan kata sandi untuk masuk kembali.
                                </p>
                                {auth?.user && (
                                    <div className="mt-3 p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs flex items-center justify-between">
                                        <span className="text-slate-500 dark:text-slate-400 font-medium">Akun Aktif:</span>
                                        <span className="font-extrabold text-slate-900 dark:text-white">
                                            {auth.user.name} ({isOwner ? 'Pemilik' : 'Kasir'})
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="flex items-center justify-end space-x-2 pt-2 border-t-2 border-slate-100 dark:border-slate-800">
                            <button
                                type="button"
                                onClick={() => setShowLogoutModal(false)}
                                className="py-2 px-3.5 bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-extrabold text-xs uppercase tracking-wide border-2 border-slate-900 dark:border-slate-700 transition"
                            >
                                Batal
                            </button>
                            <button
                                type="button"
                                onClick={handleConfirmLogout}
                                className="py-2 px-4 bg-rose-600 hover:bg-rose-700 text-white font-black text-xs uppercase tracking-wider border-2 border-slate-900 dark:border-slate-700 shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] dark:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5 transition flex items-center space-x-1.5"
                            >
                                <LogOut className="w-3.5 h-3.5" />
                                <span>Ya, Keluar Sistem</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL KONFIRMASI PUTUSKAN PRINTER */}
            {showDisconnectModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-900/70 backdrop-blur-sm animate-in fade-in duration-150">
                    <div className="bg-white dark:bg-slate-900 border-2 border-slate-900 dark:border-slate-700 shadow-[6px_6px_0px_0px_rgba(15,23,42,1)] dark:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] w-full max-w-md p-5 space-y-4">
                        <div className="flex items-start space-x-3">
                            <div className="p-2.5 bg-amber-100 dark:bg-amber-950/60 border-2 border-slate-900 dark:border-slate-700 text-amber-800 dark:text-amber-400 shrink-0 shadow-[1px_1px_0px_0px_rgba(15,23,42,1)] dark:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]">
                                <BluetoothConnected className="w-6 h-6" />
                            </div>
                            <div className="flex-1">
                                <h3 className="font-black text-base text-slate-900 dark:text-white uppercase tracking-tight">
                                    Putuskan Koneksi Printer?
                                </h3>
                                <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                                    Printer thermal Bluetooth <strong className="text-slate-900 dark:text-white font-black">"{printerStatus.name}"</strong> sedang terhubung. Apakah Anda ingin memutuskan sambungan?
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center justify-end space-x-2 pt-2 border-t-2 border-slate-100 dark:border-slate-800">
                            <button
                                type="button"
                                onClick={() => setShowDisconnectModal(false)}
                                className="py-2 px-3.5 bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-extrabold text-xs uppercase tracking-wide border-2 border-slate-900 dark:border-slate-700 transition"
                            >
                                Batal
                            </button>
                            <button
                                type="button"
                                onClick={handleConfirmDisconnect}
                                className="py-2 px-4 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs uppercase tracking-wider border-2 border-slate-900 dark:border-slate-700 shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] dark:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5 transition"
                            >
                                Putuskan Koneksi
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL PERINGATAN BLUETOOTH TIDAK DIDUKUNG */}
            {printerAlertMessage && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-900/70 backdrop-blur-sm animate-in fade-in duration-150">
                    <div className="bg-white dark:bg-slate-900 border-2 border-slate-900 dark:border-slate-700 shadow-[6px_6px_0px_0px_rgba(15,23,42,1)] dark:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] w-full max-w-md p-5 space-y-4">
                        <div className="flex items-start space-x-3">
                            <div className="p-2.5 bg-amber-100 dark:bg-amber-950/60 border-2 border-slate-900 dark:border-slate-700 text-amber-800 dark:text-amber-400 shrink-0 shadow-[1px_1px_0px_0px_rgba(15,23,42,1)] dark:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]">
                                <AlertTriangle className="w-6 h-6" />
                            </div>
                            <div className="flex-1">
                                <h3 className="font-black text-base text-slate-900 dark:text-white uppercase tracking-tight">
                                    Bluetooth Tidak Didukung
                                </h3>
                                <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                                    {printerAlertMessage}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center justify-end pt-2 border-t-2 border-slate-100 dark:border-slate-800">
                            <button
                                type="button"
                                onClick={() => setPrinterAlertMessage(null)}
                                className={`py-2 px-4 ${currentTheme.classes.bgPrimary} ${currentTheme.classes.bgPrimaryHover} text-white font-black text-xs uppercase tracking-wider border-2 border-slate-900 dark:border-slate-700 shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] dark:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5 transition`}
                            >
                                Mengerti
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </header>
    );
}
