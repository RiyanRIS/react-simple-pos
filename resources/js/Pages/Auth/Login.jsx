import React, { useState, useEffect } from 'react';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import {
    Store,
    Lock,
    Mail,
    UserCheck,
    ShieldAlert,
    CheckCircle2,
    ArrowRight,
    Eye,
    EyeOff,
    Sparkles,
    Sun,
    Moon,
    MessageCircle,
    Send,
    RefreshCw,
    HeartHandshake,
    BookOpen
} from 'lucide-react';
import { getActiveTheme } from '@/Utils/themeHelper';
import { isDarkModeActive, toggleThemeMode } from '@/Utils/darkMode';

export default function Login() {
    const { flash, errors, store, showDemoAccounts, demo } = usePage().props;
    const currentTheme = getActiveTheme(store?.theme_color);

    const storeName = store?.name || 'Pecel Lele Sedap';
    const storeInitials = store?.initials || 'PL';
    const storeTagline = store?.tagline || 'Sistem Kasir POS & Manajemen Warung';

    const isDemoActive = demo?.enabled || showDemoAccounts;
    const devName = demo?.developer_name || 'Developer';
    const waNumber = demo?.whatsapp ? demo.whatsapp.replace(/\D/g, '') : '';
    const telegramUser = demo?.telegram ? demo.telegram.replace('@', '') : '';

    const waLink = waNumber
        ? `https://wa.me/${waNumber}?text=${encodeURIComponent(`Halo ${devName}, saya sedang coba Demo Penyetan POS dan tertarik menggunakannya secara gratis untuk usaha saya.`)}`
        : null;

    const teleLink = telegramUser
        ? `https://t.me/${telegramUser}`
        : null;

    const resetPeriodLabel = demo?.reset_interval === 'daily'
        ? 'setiap hari'
        : (demo?.reset_interval === 'every_two_hours' ? 'setiap 2 jam' : 'setiap 1 jam');

    const [showPassword, setShowPassword] = useState(false);
    const [darkMode, setDarkMode] = useState(false);

    useEffect(() => {
        setDarkMode(isDarkModeActive());
        const handleThemeChange = (e) => {
            setDarkMode(e.detail.isDark);
        };
        window.addEventListener('theme-mode-changed', handleThemeChange);
        return () => window.removeEventListener('theme-mode-changed', handleThemeChange);
    }, []);

    const handleToggleTheme = () => {
        const newDark = toggleThemeMode();
        setDarkMode(newDark);
    };

    const { data, setData, post, processing } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post('/login');
    };

    // Helper untuk 1-Klik Isi Akun Cepat
    const handleQuickFill = (email, password) => {
        setData({
            email,
            password,
            remember: true,
        });
    };

    return (
        <div className="min-h-screen bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col justify-center items-center p-4 font-sans select-none relative transition-colors duration-200">
            <Head title={`Masuk - ${storeName}`} />

            {/* Top Right Dark/Light Mode Toggle */}
            <div className="absolute top-4 right-4 sm:top-6 sm:right-6">
                <button
                    type="button"
                    onClick={handleToggleTheme}
                    className="p-2.5 bg-white dark:bg-slate-900 border-2 border-slate-900 dark:border-slate-700 shadow-[3px_3px_0px_0px_rgba(15,23,42,1)] dark:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:bg-slate-100 dark:hover:bg-slate-800 transition active:translate-x-0.5 active:translate-y-0.5 flex items-center space-x-2 text-xs font-black uppercase tracking-wider"
                    title={darkMode ? 'Beralih ke Mode Terang' : 'Beralih ke Mode Gelap'}
                >
                    {darkMode ? (
                        <>
                            <Sun className="w-4 h-4 text-amber-400" />
                            <span className="hidden sm:inline text-slate-200">Light Mode</span>
                        </>
                    ) : (
                        <>
                            <Moon className="w-4 h-4 text-slate-700" />
                            <span className="hidden sm:inline text-slate-800">Dark Mode</span>
                        </>
                    )}
                </button>
            </div>

            <div className="w-full max-w-md my-6">
                {/* Brand Header (Dynamic Store Identity) */}
                <div className="text-center mb-6">
                    <div className={`inline-flex items-center justify-center w-14 h-14 ${currentTheme.classes.bgPrimary} border-2 border-slate-900 dark:border-slate-700 shadow-[3px_3px_0px_0px_rgba(15,23,42,1)] dark:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] mb-3 text-white font-black text-2xl tracking-wider`}>
                        {storeInitials}
                    </div>
                    <h1 className="text-2xl font-black uppercase tracking-tight text-slate-900 dark:text-white">
                        {storeName}
                    </h1>
                    <p className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mt-1">
                        {storeTagline}
                    </p>
                </div>

                {/* Notifikasi Flash Message */}
                {flash?.success?.message && (
                    <div className={`mb-4 p-3 ${currentTheme.classes.badge} border-2 border-slate-900 dark:border-slate-700 shadow-[3px_3px_0px_0px_rgba(15,23,42,1)] dark:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] flex items-center space-x-2 ${currentTheme.classes.textPrimaryDark} text-xs font-bold`}>
                        <CheckCircle2 className={`w-4 h-4 ${currentTheme.classes.textPrimary} shrink-0`} />
                        <span>{flash.success.message}</span>
                    </div>
                )}

                {(flash?.error || errors?.email || errors?.password) && (
                    <div className="mb-4 p-3 bg-rose-50 dark:bg-rose-950/40 border-2 border-slate-900 dark:border-slate-700 shadow-[3px_3px_0px_0px_rgba(15,23,42,1)] dark:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] flex items-start space-x-2 text-rose-950 dark:text-rose-200 text-xs font-bold">
                        <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                        <span>{flash?.error || errors?.email || errors?.password}</span>
                    </div>
                )}

                {/* Card Form Login */}
                <div className="bg-white dark:bg-slate-900 border-2 border-slate-900 dark:border-slate-800 shadow-[5px_5px_0px_0px_rgba(15,23,42,1)] dark:shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] p-6 space-y-5">
                    <div className="border-b-2 border-slate-200 dark:border-slate-800 pb-3">
                        <div className="font-extrabold text-sm uppercase tracking-wide text-slate-900 dark:text-white flex items-center space-x-2">
                            <Lock className={`w-4 h-4 ${currentTheme.classes.textPrimary}`} />
                            <span>Silakan Masuk ke Akun Anda</span>
                        </div>
                        <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mt-0.5">
                            Gunakan email dan kata sandi yang telah terdaftar.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Input Email */}
                        <div>
                            <label className="block text-[11px] font-extrabold uppercase text-slate-700 dark:text-slate-300 mb-1">
                                Alamat Email
                            </label>
                            <div className="relative">
                                <Mail className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                                <input
                                    type="email"
                                    required
                                    value={data.email}
                                    onChange={(e) => setData('email', e.target.value)}
                                    placeholder="contoh: owner@penyetan.com"
                                    className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border-2 border-slate-900 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:border-slate-900 dark:focus:border-slate-500 transition"
                                />
                            </div>
                        </div>

                        {/* Input Password */}
                        <div>
                            <label className="block text-[11px] font-extrabold uppercase text-slate-700 dark:text-slate-300 mb-1">
                                Kata Sandi
                            </label>
                            <div className="relative">
                                <Lock className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    required
                                    value={data.password}
                                    onChange={(e) => setData('password', e.target.value)}
                                    placeholder="••••••••"
                                    className="w-full pl-9 pr-10 py-2 bg-slate-50 dark:bg-slate-800 border-2 border-slate-900 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:border-slate-900 dark:focus:border-slate-500 transition"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 p-0.5"
                                    title={showPassword ? 'Sembunyikan sandi' : 'Lihat sandi'}
                                >
                                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>

                        {/* Remember Me */}
                        <div className="flex items-center justify-between text-xs pt-1">
                            <label className="flex items-center space-x-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={data.remember}
                                    onChange={(e) => setData('remember', e.target.checked)}
                                    className="w-4 h-4 rounded-none border-2 border-slate-900 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-emerald-500 focus:ring-0 focus:ring-offset-0 cursor-pointer"
                                />
                                <span className="font-bold text-slate-700 dark:text-slate-300 text-[11px]">Ingat Saya di Perangkat Ini</span>
                            </label>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={processing}
                            className={`w-full py-2.5 px-4 ${currentTheme.classes.bgPrimary} ${currentTheme.classes.bgPrimaryHover} text-white font-black text-xs uppercase tracking-wider border-2 border-slate-900 dark:border-slate-700 shadow-[3px_3px_0px_0px_rgba(15,23,42,1)] dark:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5 transition flex items-center justify-center space-x-2 disabled:opacity-50`}
                        >
                            <span>{processing ? 'Memproses...' : 'Masuk ke Sistem'}</span>
                            <ArrowRight className="w-4 h-4" />
                        </button>

                        <div className="pt-1 text-center">
                            <Link
                                href="/guide"
                                className="inline-flex items-center space-x-1.5 text-[11px] font-black uppercase tracking-wide text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition group py-1"
                            >
                                <BookOpen className="w-3.5 h-3.5 text-amber-500 group-hover:scale-110 transition shrink-0" />
                                <span className="underline decoration-2 underline-offset-4 decoration-amber-400">
                                    Lihat Panduan Singkat Pemakaian
                                </span>
                            </Link>
                        </div>
                    </form>

                    {/* Quick Account Switcher (Aktif saat APP_DEMO_MODE=true) */}
                    {isDemoActive && (
                        <div className="pt-4 border-t-2 border-dashed border-slate-300 dark:border-slate-800 space-y-3">
                            <div className="flex items-center justify-between">
                                <div className="text-[10px] font-extrabold uppercase tracking-wide text-slate-700 dark:text-slate-300 flex items-center space-x-1">
                                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                                    <span>Pilih Akun Demo (1-Klik)</span>
                                </div>
                                <span className="text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700 flex items-center space-x-1">
                                    <RefreshCw className="w-2.5 h-2.5 animate-spin" />
                                    <span>Auto-Reset {resetPeriodLabel}</span>
                                </span>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                {/* Tombol Pemilik */}
                                <button
                                    type="button"
                                    onClick={() => handleQuickFill('owner@penyetan.com', 'password')}
                                    className="p-2.5 bg-amber-50 dark:bg-amber-950/30 hover:bg-amber-100 dark:hover:bg-amber-900/40 border-2 border-slate-900 dark:border-slate-700 text-left transition shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] dark:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5 group"
                                >
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="font-black text-[11px] text-amber-950 dark:text-amber-300 uppercase">Pemilik (Owner)</span>
                                        <span className="px-1 py-0.2 bg-amber-300 border border-slate-900 text-[9px] font-extrabold text-amber-950">
                                            FULL
                                        </span>
                                    </div>
                                    <div className="text-[10px] text-slate-600 dark:text-slate-300 font-mono truncate">owner@penyetan.com</div>
                                    <div className="text-[9px] text-slate-500 dark:text-slate-400 mt-1">
                                        POS, Menu, Kasir & Analitik
                                    </div>
                                </button>

                                {/* Tombol Kasir */}
                                <button
                                    type="button"
                                    onClick={() => handleQuickFill('kasir@penyetan.com', 'password')}
                                    className="p-2.5 bg-sky-50 dark:bg-sky-950/30 hover:bg-sky-100 dark:hover:bg-sky-900/40 border-2 border-slate-900 dark:border-slate-700 text-left transition shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] dark:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5 group"
                                >
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="font-black text-[11px] text-sky-950 dark:text-sky-300 uppercase">Kasir (Siti)</span>
                                        <span className="px-1 py-0.2 bg-sky-300 border border-slate-900 text-[9px] font-extrabold text-sky-950">
                                            KASIR
                                        </span>
                                    </div>
                                    <div className="text-[10px] text-slate-600 dark:text-slate-300 font-mono truncate">kasir@penyetan.com</div>
                                    <div className="text-[9px] text-slate-500 dark:text-slate-400 mt-1">
                                        Operasional POS & Cetak Struk
                                    </div>
                                </button>
                            </div>

                            <p className="text-[10px] text-slate-500 dark:text-slate-400 italic text-center">
                                *Password default semua akun: <span className="font-mono font-bold text-slate-800 dark:text-slate-200">password</span>
                            </p>
                        </div>
                    )}
                </div>

                {/* Neo-Brutalist CTA Card: Hubungi Pengembang (Gratis) */}
                {isDemoActive && (
                    <div className="mt-4 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/40 dark:to-teal-950/40 border-2 border-slate-900 dark:border-slate-700 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] dark:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-4 space-y-3">
                        <div className="flex items-start space-x-2.5">
                            <div className="p-1.5 bg-emerald-500 border border-slate-900 text-white shrink-0 mt-0.5">
                                <HeartHandshake className="w-4 h-4" />
                            </div>
                            <div className="flex-1">
                                <div className="flex items-center space-x-2">
                                    <h2 className="text-xs font-black uppercase text-emerald-950 dark:text-emerald-300">
                                        Tertarik Menggunakan Aplikasi Ini?
                                    </h2>
                                    <span className="text-[9px] font-black uppercase px-1.5 py-0.2 bg-emerald-400 text-slate-900 border border-slate-900">
                                        GRATIS
                                    </span>
                                </div>
                                <p className="text-[11px] font-medium text-slate-700 dark:text-slate-300 mt-1 leading-relaxed">
                                    Silakan explore semua fitur kasir, bluetooth printer, dan laporan. Untuk bantuan instalasi di STB atau server warung Anda, hubungi saya langsung:
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                            {waLink && (
                                <a
                                    href={waLink}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center justify-center space-x-2 py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-[11px] uppercase tracking-wider border-2 border-slate-900 shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] active:translate-x-0.5 active:translate-y-0.5 transition"
                                >
                                    <MessageCircle className="w-3.5 h-3.5" />
                                    <span>WhatsApp</span>
                                </a>
                            )}

                            {teleLink && (
                                <a
                                    href={teleLink}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center justify-center space-x-2 py-2 px-3 bg-sky-600 hover:bg-sky-700 text-white font-black text-[11px] uppercase tracking-wider border-2 border-slate-900 shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] active:translate-x-0.5 active:translate-y-0.5 transition"
                                >
                                    <Send className="w-3.5 h-3.5" />
                                    <span>Telegram</span>
                                </a>
                            )}
                        </div>
                    </div>
                )}

                {/* Footer Notes */}
                <div className="text-center mt-4 text-[11px] font-medium text-slate-500 dark:text-slate-500">
                    Sistem Kasir {storeName} &copy; {new Date().getFullYear()} {isDemoActive && `• Dikelola oleh ${devName}`}
                </div>
            </div>
        </div>
    );
}

