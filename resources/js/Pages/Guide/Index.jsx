import React, { useState, useEffect } from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import {
    BookOpen,
    Store,
    Receipt,
    Printer,
    UtensilsCrossed,
    Users,
    BarChart3,
    CheckCircle2,
    HelpCircle,
    ArrowLeft,
    Sun,
    Moon,
    MessageCircle,
    Send,
    Sparkles,
    Smartphone,
    Zap,
    ShieldCheck,
    ChevronDown,
    ChevronUp,
    DollarSign,
    Layers,
    Settings,
    Clock,
    AlertTriangle,
    Info,
    Check,
    ArrowRight
} from 'lucide-react';
import { getActiveTheme } from '@/Utils/themeHelper';
import { isDarkModeActive, toggleThemeMode } from '@/Utils/darkMode';

export default function Guide() {
    const { auth, store, demo } = usePage().props;
    const currentTheme = getActiveTheme(store?.theme_color);

    const storeName = store?.name || 'Pecel Lele Sedap';
    const storeInitials = store?.initials || 'PL';
    const storeTagline = store?.tagline || 'Panduan Pemakaian Sistem Kasir';

    const isLoggedIn = !!auth?.user;
    const isOwner = auth?.user?.role === 'owner';
    const devName = demo?.developer_name || 'Developer';
    const waNumber = demo?.whatsapp ? demo.whatsapp.replace(/\D/g, '') : '';
    const telegramUser = demo?.telegram ? demo.telegram.replace('@', '') : '';

    const waLink = waNumber
        ? `https://wa.me/${waNumber}?text=${encodeURIComponent(`Halo ${devName}, saya membaca panduan Penyetan POS dan ingin konsultasi/tanya terkait aplikasi kasir ini.`)}`
        : null;

    const teleLink = telegramUser ? `https://t.me/${telegramUser}` : null;

    const [darkMode, setDarkMode] = useState(false);
    const [activeSection, setActiveSection] = useState('kasir'); // 'kasir' | 'printer' | 'menu' | 'users' | 'laporan' | 'faq'
    const [openFaq, setOpenFaq] = useState(null);

    useEffect(() => {
        setDarkMode(isDarkModeActive());
        const handleThemeChange = (e) => setDarkMode(e.detail.isDark);
        window.addEventListener('theme-mode-changed', handleThemeChange);
        return () => window.removeEventListener('theme-mode-changed', handleThemeChange);
    }, []);

    const handleToggleTheme = () => {
        const newDark = toggleThemeMode();
        setDarkMode(newDark);
    };

    const toggleFaq = (index) => {
        setOpenFaq(openFaq === index ? null : index);
    };

    // Navigasi Kembali Cerdas
    const getBackUrl = () => {
        if (!isLoggedIn) return '/login';
        if (isOwner) return '/dashboard';
        return '/pos';
    };

    const getBackLabel = () => {
        if (!isLoggedIn) return 'Kembali ke Login';
        if (isOwner) return 'Kembali ke Dashboard';
        return 'Kembali ke Kasir (POS)';
    };

    const faqs = [
        {
            q: "Bagaimana jika jaringan internet di warung mati/terputus?",
            a: "Aplikasi ini berjalan secara lokal di perangkat server STB mini Anda di warung. Jadi meskipun internet mati atau paket data habis, kasir tetap bisa melayani pesanan, menghitung total bayar, dan mencetak struk kasir tanpa kendala sama sekali!"
        },
        {
            q: "Apa yang terjadi jika listrik warung tiba-tiba padam?",
            a: "Semua data transaksi yang sudah tersimpan di database STB tidak akan hilang. Begitu listrik menyala kembali, server STB akan menyala otomatis dan kasir bisa langsung melanjutkan transaksi."
        },
        {
            q: "Apakah aplikasi ini mewajibkan biaya langganan bulanan?",
            a: "TIDAK ADA langganan bulanan. Anda memiliki perangkat dan data sepenuhnya secara mandiri (Self-Hosted). Anda bisa menggunakannya secara gratis selamanya."
        },
        {
            q: "Bagaimana jika kertas printer thermal habis di tengah transaksi?",
            a: "Cukup buka tutup printer thermal, pasang gulungan kertas baru (Thermal 58mm / 80mm), lalu tutup kembali. Masuk ke menu 'Riwayat Transaksi', pilih nota yang bersangkutan, lalu klik tombol 'Cetak Struk Ulang'."
        },
        {
            q: "Apakah bisa digunakan di banyak HP / Tablet kasir sekaligus?",
            a: "BISA. Cukup hubungkan HP/tablet karyawan kasir ke Wi-Fi lokal warung yang sama dengan STB, lalu buka alamat IP kasir di browser Chrome browser HP masing-masing."
        }
    ];

    return (
        <div className="min-h-screen bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans transition-colors duration-200 selection:bg-amber-300 selection:text-slate-950">
            <Head title={`Buku Panduan Kasir & Pemilik - ${storeName}`} />

            {/* Top Navigation Bar */}
            <header className="sticky top-0 z-40 bg-white dark:bg-slate-900 border-b-2 border-slate-900 dark:border-slate-800 shadow-[0_2px_0_0_rgba(15,23,42,1)] dark:shadow-[0_2px_0_0_rgba(0,0,0,1)]">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 sm:h-16 flex items-center justify-between gap-3">
                    <div className="flex items-center space-x-3">
                        <Link
                            href={getBackUrl()}
                            className="p-2 sm:py-1.5 sm:px-3 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border-2 border-slate-900 dark:border-slate-700 text-xs font-black uppercase tracking-wider flex items-center space-x-1.5 shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] dark:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5 transition shrink-0"
                        >
                            <ArrowLeft className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">{getBackLabel()}</span>
                        </Link>

                        <div className="flex items-center space-x-2">
                            <div className={`w-8 h-8 ${currentTheme.classes.bgPrimary} border-2 border-slate-900 dark:border-slate-700 text-white font-black text-sm flex items-center justify-center shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] shrink-0`}>
                                <BookOpen className="w-4 h-4" />
                            </div>
                            <div>
                                <h1 className="font-black text-xs sm:text-sm uppercase tracking-tight leading-none text-slate-900 dark:text-white">
                                    Panduan Pemakaian
                                </h1>
                                <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                    {storeName}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center space-x-2">
                        {/* Dark Mode Toggle */}
                        <button
                            type="button"
                            onClick={handleToggleTheme}
                            className="p-2 bg-white dark:bg-slate-800 border-2 border-slate-900 dark:border-slate-700 shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] dark:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:bg-slate-100 dark:hover:bg-slate-700 active:translate-x-0.5 active:translate-y-0.5 transition"
                            title={darkMode ? 'Mode Terang' : 'Mode Gelap'}
                        >
                            {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
                        </button>

                        {/* Direct WA Help Link */}
                        {waLink && (
                            <a
                                href={waLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="hidden sm:flex items-center space-x-1.5 py-1.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white border-2 border-slate-900 text-xs font-black uppercase tracking-wider shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] active:translate-x-0.5 active:translate-y-0.5 transition"
                            >
                                <MessageCircle className="w-3.5 h-3.5" />
                                <span>Bantuan WA</span>
                            </a>
                        )}
                    </div>
                </div>
            </header>

            {/* Hero Banner */}
            <section className="bg-gradient-to-b from-amber-200/60 to-transparent dark:from-amber-950/20 border-b-2 border-slate-900 dark:border-slate-800 py-8 px-4 sm:px-6">
                <div className="max-w-4xl mx-auto text-center space-y-3">
                    <div className="inline-flex items-center space-x-1.5 px-3 py-1 bg-amber-300 dark:bg-amber-400 border-2 border-slate-900 text-slate-950 text-xs font-black uppercase tracking-wider shadow-[2px_2px_0px_0px_rgba(15,23,42,1)]">
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Buku Petunjuk Operasional Ringkas</span>
                    </div>

                    <h2 className="text-2xl sm:text-4xl font-black uppercase tracking-tight text-slate-900 dark:text-white">
                        Cara Mudah Menggunakan Sistem Kasir
                    </h2>

                    <p className="text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
                        Dirancang khusus agar kasir dan pemilik warung makan/resto dapat langsung berjualan dengan cepat tanpa perlu keahlian komputer yang rumit.
                    </p>
                </div>
            </section>

            {/* Main Content Area */}
            <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
                {/* Section Navigation Tabs */}
                <div className="flex items-center space-x-2 overflow-x-auto pb-4 no-scrollbar border-b-2 border-slate-300 dark:border-slate-800 mb-6">
                    <button
                        type="button"
                        onClick={() => setActiveSection('kasir')}
                        className={`flex items-center space-x-2 px-3.5 py-2 text-xs font-black uppercase tracking-wide border-2 transition whitespace-nowrap shrink-0 ${
                            activeSection === 'kasir'
                                ? `${currentTheme.classes.bgPrimary} text-white border-slate-900 shadow-[3px_3px_0px_0px_rgba(15,23,42,1)] dark:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]`
                                : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-900 dark:border-slate-700 hover:bg-slate-100'
                        }`}
                    >
                        <Store className="w-4 h-4" />
                        <span>1. Kasir & Transaksi</span>
                    </button>

                    <button
                        type="button"
                        onClick={() => setActiveSection('printer')}
                        className={`flex items-center space-x-2 px-3.5 py-2 text-xs font-black uppercase tracking-wide border-2 transition whitespace-nowrap shrink-0 ${
                            activeSection === 'printer'
                                ? `${currentTheme.classes.bgPrimary} text-white border-slate-900 shadow-[3px_3px_0px_0px_rgba(15,23,42,1)] dark:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]`
                                : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-900 dark:border-slate-700 hover:bg-slate-100'
                        }`}
                    >
                        <Printer className="w-4 h-4" />
                        <span>2. Printer Bluetooth</span>
                    </button>

                    <button
                        type="button"
                        onClick={() => setActiveSection('menu')}
                        className={`flex items-center space-x-2 px-3.5 py-2 text-xs font-black uppercase tracking-wide border-2 transition whitespace-nowrap shrink-0 ${
                            activeSection === 'menu'
                                ? `${currentTheme.classes.bgPrimary} text-white border-slate-900 shadow-[3px_3px_0px_0px_rgba(15,23,42,1)] dark:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]`
                                : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-900 dark:border-slate-700 hover:bg-slate-100'
                        }`}
                    >
                        <UtensilsCrossed className="w-4 h-4" />
                        <span>3. Kelola Menu & Harga</span>
                    </button>

                    <button
                        type="button"
                        onClick={() => setActiveSection('users')}
                        className={`flex items-center space-x-2 px-3.5 py-2 text-xs font-black uppercase tracking-wide border-2 transition whitespace-nowrap shrink-0 ${
                            activeSection === 'users'
                                ? `${currentTheme.classes.bgPrimary} text-white border-slate-900 shadow-[3px_3px_0px_0px_rgba(15,23,42,1)] dark:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]`
                                : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-900 dark:border-slate-700 hover:bg-slate-100'
                        }`}
                    >
                        <Users className="w-4 h-4" />
                        <span>4. Kelola Akun Kasir</span>
                    </button>

                    <button
                        type="button"
                        onClick={() => setActiveSection('laporan')}
                        className={`flex items-center space-x-2 px-3.5 py-2 text-xs font-black uppercase tracking-wide border-2 transition whitespace-nowrap shrink-0 ${
                            activeSection === 'laporan'
                                ? `${currentTheme.classes.bgPrimary} text-white border-slate-900 shadow-[3px_3px_0px_0px_rgba(15,23,42,1)] dark:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]`
                                : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-900 dark:border-slate-700 hover:bg-slate-100'
                        }`}
                    >
                        <BarChart3 className="w-4 h-4" />
                        <span>5. Laporan & Omzet</span>
                    </button>

                    <button
                        type="button"
                        onClick={() => setActiveSection('faq')}
                        className={`flex items-center space-x-2 px-3.5 py-2 text-xs font-black uppercase tracking-wide border-2 transition whitespace-nowrap shrink-0 ${
                            activeSection === 'faq'
                                ? `${currentTheme.classes.bgPrimary} text-white border-slate-900 shadow-[3px_3px_0px_0px_rgba(15,23,42,1)] dark:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]`
                                : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-900 dark:border-slate-700 hover:bg-slate-100'
                        }`}
                    >
                        <HelpCircle className="w-4 h-4" />
                        <span>6. Tanya Jawab (FAQ)</span>
                    </button>
                </div>

                {/* ========================================================================= */}
                {/* SECTION 1: KASIR & TRANSAKSI */}
                {/* ========================================================================= */}
                {activeSection === 'kasir' && (
                    <div className="space-y-6">
                        <div className="bg-white dark:bg-slate-900 border-2 border-slate-900 dark:border-slate-800 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] dark:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-5 sm:p-6">
                            <div className="flex items-center space-x-2.5 mb-2">
                                <div className="p-2 bg-amber-400 border border-slate-900 text-slate-950 font-black">
                                    <Store className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="font-black text-lg sm:text-xl uppercase text-slate-900 dark:text-white tracking-tight">
                                        Panduan Transaksi Kasir (POS)
                                    </h3>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                                        Langkah melayani pesanan pelanggan dari awal sampai cetak struk nota.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {/* Step 1 */}
                            <div className="bg-white dark:bg-slate-900 border-2 border-slate-900 dark:border-slate-800 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] dark:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-5 flex flex-col justify-between space-y-4">
                                <div>
                                    <div className="flex items-center justify-between mb-3">
                                        <span className="w-8 h-8 rounded-none bg-slate-900 text-white dark:bg-amber-400 dark:text-slate-950 font-black text-sm flex items-center justify-center border border-slate-900">
                                            1
                                        </span>
                                        <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 bg-slate-100 dark:bg-slate-800 border border-slate-900 text-slate-800 dark:text-slate-200">
                                            PILIH MENU
                                        </span>
                                    </div>
                                    <h4 className="font-black text-sm uppercase text-slate-900 dark:text-white mb-1.5">
                                        Klik Menu Yang Dipesan
                                    </h4>
                                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                                        Klik gambar / kartu menu makanan atau minuman (misal: <em>Pecel Lele Goreng</em>). Menu akan langsung masuk ke keranjang belanja di sebelah kanan layar.
                                    </p>
                                </div>
                                <div className="p-2.5 bg-amber-50 dark:bg-amber-950/30 border border-amber-300 dark:border-amber-800 text-[11px] text-amber-900 dark:text-amber-200 font-bold">
                                    💡 <strong>Tips:</strong> Gunakan tab kategori (Makanan, Minuman, Paket) atau kolom pencarian jika menu sangat banyak.
                                </div>
                            </div>

                            {/* Step 2 */}
                            <div className="bg-white dark:bg-slate-900 border-2 border-slate-900 dark:border-slate-800 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] dark:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-5 flex flex-col justify-between space-y-4">
                                <div>
                                    <div className="flex items-center justify-between mb-3">
                                        <span className="w-8 h-8 rounded-none bg-slate-900 text-white dark:bg-amber-400 dark:text-slate-950 font-black text-sm flex items-center justify-center border border-slate-900">
                                            2
                                        </span>
                                        <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 bg-slate-100 dark:bg-slate-800 border border-slate-900 text-slate-800 dark:text-slate-200">
                                            ATUR JUMLAH & CATATAN
                                        </span>
                                    </div>
                                    <h4 className="font-black text-sm uppercase text-slate-900 dark:text-white mb-1.5">
                                        Sesuaikan Porsi & Catatan
                                    </h4>
                                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                                        Tekan tombol <strong className="font-bold">(+)</strong> atau <strong className="font-bold">(-)</strong> untuk menambah/mengurangi porsi. Anda juga bisa mengisi nomor meja atau catatan khusus pelanggan (misal: <em>"Sambal dipisah, es sedikit"</em>).
                                    </p>
                                </div>
                                <div className="p-2.5 bg-sky-50 dark:bg-sky-950/30 border border-sky-300 dark:border-sky-800 text-[11px] text-sky-900 dark:text-sky-200 font-bold">
                                    📝 Catatan pesanan akan otomatis tercetak di struk nota untuk bagian dapur!
                                </div>
                            </div>

                            {/* Step 3 */}
                            <div className="bg-white dark:bg-slate-900 border-2 border-slate-900 dark:border-slate-800 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] dark:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-5 flex flex-col justify-between space-y-4">
                                <div>
                                    <div className="flex items-center justify-between mb-3">
                                        <span className="w-8 h-8 rounded-none bg-slate-900 text-white dark:bg-amber-400 dark:text-slate-950 font-black text-sm flex items-center justify-center border border-slate-900">
                                            3
                                        </span>
                                        <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 bg-emerald-100 dark:bg-emerald-950 border border-slate-900 text-emerald-900 dark:text-emerald-300">
                                            BAYAR & CETAK
                                        </span>
                                    </div>
                                    <h4 className="font-black text-sm uppercase text-slate-900 dark:text-white mb-1.5">
                                        Pilih Pembayaran & Cetak Nota
                                    </h4>
                                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                                        Klik tombol <strong className="font-bold uppercase">Bayar</strong>. Pilih metode pembayaran:
                                    </p>
                                    <ul className="text-xs text-slate-700 dark:text-slate-300 font-medium space-y-1 mt-2 list-disc list-inside">
                                        <li><strong>Tunai (Cash):</strong> Masukkan uang kas atau pilih tombol nominal cepat (Uang Pas, 50rb, 100rb). Kembalian otomatis dihitung!</li>
                                        <li><strong>QRIS / Transfer:</strong> Langsung terhitung lunas.</li>
                                    </ul>
                                </div>
                                <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-300 dark:border-emerald-800 text-[11px] text-emerald-900 dark:text-emerald-200 font-bold">
                                    🖨️ Tekan tombol <strong>"Cetak Struk"</strong> untuk mencetak struk fisik ke printer kasir.
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* ========================================================================= */}
                {/* SECTION 2: PRINTER BLUETOOTH */}
                {/* ========================================================================= */}
                {activeSection === 'printer' && (
                    <div className="space-y-6">
                        <div className="bg-white dark:bg-slate-900 border-2 border-slate-900 dark:border-slate-800 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] dark:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-5 sm:p-6">
                            <div className="flex items-center space-x-2.5 mb-2">
                                <div className="p-2 bg-sky-400 border border-slate-900 text-slate-950 font-black">
                                    <Printer className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="font-black text-lg sm:text-xl uppercase text-slate-900 dark:text-white tracking-tight">
                                        Panduan Sambung Printer Bluetooth Thermal
                                    </h3>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                                        Mendukung printer thermal standar 58mm & 80mm via Web Bluetooth langsung dari browser.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="bg-white dark:bg-slate-900 border-2 border-slate-900 dark:border-slate-800 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] dark:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-5 space-y-3">
                                <div className="flex items-center space-x-2">
                                    <div className="w-6 h-6 bg-sky-500 text-white font-black text-xs flex items-center justify-center border border-slate-900">
                                        1
                                    </div>
                                    <h4 className="font-black text-sm uppercase text-slate-900 dark:text-white">
                                        Nyalakan Printer & Bluetooth HP/Tablet
                                    </h4>
                                </div>
                                <p className="text-xs text-slate-600 dark:text-slate-300 font-medium leading-relaxed">
                                    Pastikan printer thermal mini Anda sudah menyala (lampu indikator berwarna biru/hijau) dan bluetooth di tablet atau HP kasir dalam keadaan <strong>AKTIF</strong>.
                                </p>
                            </div>

                            <div className="bg-white dark:bg-slate-900 border-2 border-slate-900 dark:border-slate-800 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] dark:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-5 space-y-3">
                                <div className="flex items-center space-x-2">
                                    <div className="w-6 h-6 bg-sky-500 text-white font-black text-xs flex items-center justify-center border border-slate-900">
                                        2
                                    </div>
                                    <h4 className="font-black text-sm uppercase text-slate-900 dark:text-white">
                                        Klik Tombol Sambungkan Printer di Kasir
                                    </h4>
                                </div>
                                <p className="text-xs text-slate-600 dark:text-slate-300 font-medium leading-relaxed">
                                    Di pojok kanan atas aplikasi kasir (atau di bawah total keranjang), klik tombol <strong>"Sambungkan Printer"</strong> dengan ikon bluetooth.
                                </p>
                            </div>

                            <div className="bg-white dark:bg-slate-900 border-2 border-slate-900 dark:border-slate-800 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] dark:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-5 space-y-3">
                                <div className="flex items-center space-x-2">
                                    <div className="w-6 h-6 bg-sky-500 text-white font-black text-xs flex items-center justify-center border border-slate-900">
                                        3
                                    </div>
                                    <h4 className="font-black text-sm uppercase text-slate-900 dark:text-white">
                                        Pilih Nama Printer Anda (Contoh: MPT-II / RPP02N)
                                    </h4>
                                </div>
                                <p className="text-xs text-slate-600 dark:text-slate-300 font-medium leading-relaxed">
                                    Jendela pop-up browser akan muncul menampilkan daftar printer bluetooth sekitar. Pilih nama printer thermal Anda lalu klik <strong>Pair / Sambungkan</strong>.
                                </p>
                            </div>

                            <div className="bg-white dark:bg-slate-900 border-2 border-slate-900 dark:border-slate-800 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] dark:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-5 space-y-3">
                                <div className="flex items-center space-x-2">
                                    <div className="w-6 h-6 bg-emerald-500 text-white font-black text-xs flex items-center justify-center border border-slate-900">
                                        4
                                    </div>
                                    <h4 className="font-black text-sm uppercase text-slate-900 dark:text-white">
                                        Siap Cetak Otomatis
                                    </h4>
                                </div>
                                <p className="text-xs text-slate-600 dark:text-slate-300 font-medium leading-relaxed">
                                    Status printer akan berubah menjadi hijau <strong>"Terhubung"</strong>. Setiap kali transaksi selesai, klik "Cetak Struk" dan struk akan keluar langsung dalam 1 detik!
                                </p>
                            </div>
                        </div>

                        <div className="bg-amber-50 dark:bg-amber-950/40 border-2 border-slate-900 dark:border-slate-700 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] p-4 flex items-start space-x-3">
                            <Info className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                            <div className="text-xs text-slate-800 dark:text-slate-200 font-medium space-y-1">
                                <span className="font-black uppercase block">Catatan Penting Bluetooth di HP/Tablet Android:</span>
                                <span>Gunakan browser <strong>Google Chrome</strong>. Jika printer tidak terdeteksi, pastikan izin <em>Lokasi / Nearby Devices</em> untuk Chrome di HP Anda sudah diizinkan (Allow).</span>
                            </div>
                        </div>
                    </div>
                )}

                {/* ========================================================================= */}
                {/* SECTION 3: KELOLA MENU & HARGA */}
                {/* ========================================================================= */}
                {activeSection === 'menu' && (
                    <div className="space-y-6">
                        <div className="bg-white dark:bg-slate-900 border-2 border-slate-900 dark:border-slate-800 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] dark:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-5 sm:p-6">
                            <div className="flex items-center space-x-2.5 mb-2">
                                <div className="p-2 bg-emerald-400 border border-slate-900 text-slate-950 font-black">
                                    <UtensilsCrossed className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="font-black text-lg sm:text-xl uppercase text-slate-900 dark:text-white tracking-tight">
                                        Panduan Kelola Menu & Harga (Untuk Pemilik)
                                    </h3>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                                        Menambah makanan baru, mengatur harga jual, menghitung modal (HPP), dan menonaktifkan menu yang habis.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="bg-white dark:bg-slate-900 border-2 border-slate-900 dark:border-slate-800 shadow-[3px_3px_0px_0px_rgba(15,23,42,1)] p-5 space-y-2">
                                <h4 className="font-black text-sm uppercase text-slate-900 dark:text-white flex items-center space-x-2">
                                    <span className="w-5 h-5 bg-emerald-500 text-white text-xs flex items-center justify-center font-bold">1</span>
                                    <span>Menambah Menu Makanan / Minuman Baru</span>
                                </h4>
                                <p className="text-xs text-slate-600 dark:text-slate-300 font-medium leading-relaxed pl-7">
                                    Masuk ke menu <strong className="font-bold uppercase">Kelola Menu</strong> di bagian atas. Klik tombol kuning <strong>"+ Tambah Produk"</strong>. Isi nama menu, pilih kategori, isi harga jual, dan (opsional) harga modal / HPP untuk menghitung laba bersih otomatis.
                                </p>
                            </div>

                            <div className="bg-white dark:bg-slate-900 border-2 border-slate-900 dark:border-slate-800 shadow-[3px_3px_0px_0px_rgba(15,23,42,1)] p-5 space-y-2">
                                <h4 className="font-black text-sm uppercase text-slate-900 dark:text-white flex items-center space-x-2">
                                    <span className="w-5 h-5 bg-emerald-500 text-white text-xs flex items-center justify-center font-bold">2</span>
                                    <span>Mengubah Harga Menu</span>
                                </h4>
                                <p className="text-xs text-slate-600 dark:text-slate-300 font-medium leading-relaxed pl-7">
                                    Di tabel daftar menu, klik tombol ikon <strong className="font-bold">Pensil (Edit)</strong> pada baris menu yang ingin diubah harganya. Ganti nominal harga jual, lalu klik <strong>Simpan Perubahan</strong>. Harga kasir akan seketika terbarui secara instan.
                                </p>
                            </div>

                            <div className="bg-white dark:bg-slate-900 border-2 border-slate-900 dark:border-slate-800 shadow-[3px_3px_0px_0px_rgba(15,23,42,1)] p-5 space-y-2">
                                <h4 className="font-black text-sm uppercase text-slate-900 dark:text-white flex items-center space-x-2">
                                    <span className="w-5 h-5 bg-emerald-500 text-white text-xs flex items-center justify-center font-bold">3</span>
                                    <span>Menonaktifkan Menu yang Sedang Habis (Stok Kosong)</span>
                                </h4>
                                <p className="text-xs text-slate-600 dark:text-slate-300 font-medium leading-relaxed pl-7">
                                    Jika ada menu yang bahan bakunya habis di warung hari ini, cukup klik tombol switch status dari <strong>"Aktif"</strong> menjadi <strong>"Non-Aktif"</strong>. Menu tersebut otomatis tidak akan muncul di layar kasir sehingga kasir tidak salah input.
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* ========================================================================= */}
                {/* SECTION 4: KELOLA AKUN KASIR */}
                {/* ========================================================================= */}
                {activeSection === 'users' && (
                    <div className="space-y-6">
                        <div className="bg-white dark:bg-slate-900 border-2 border-slate-900 dark:border-slate-800 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] dark:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-5 sm:p-6">
                            <div className="flex items-center space-x-2.5 mb-2">
                                <div className="p-2 bg-indigo-400 border border-slate-900 text-slate-950 font-black">
                                    <Users className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="font-black text-lg sm:text-xl uppercase text-slate-900 dark:text-white tracking-tight">
                                        Panduan Kelola Kasir & Karyawan
                                    </h3>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                                        Membuat akun khusus untuk karyawan kasir dengan hak akses yang aman dan terisolasi.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="bg-white dark:bg-slate-900 border-2 border-slate-900 dark:border-slate-800 shadow-[3px_3px_0px_0px_rgba(15,23,42,1)] p-5 space-y-3">
                                <div className="flex items-center space-x-2">
                                    <span className="w-6 h-6 bg-indigo-500 text-white font-black text-xs flex items-center justify-center border border-slate-900">
                                        A
                                    </span>
                                    <h4 className="font-black text-sm uppercase text-slate-900 dark:text-white">
                                        Perbedaan Hak Akses (Role)
                                    </h4>
                                </div>
                                <div className="space-y-2 text-xs font-medium text-slate-700 dark:text-slate-300">
                                    <div className="p-2 bg-amber-50 dark:bg-amber-950/30 border border-amber-300">
                                        <strong className="text-amber-950 dark:text-amber-300 uppercase block font-black">👑 Akun Pemilik (Owner):</strong>
                                        Akses penuh ke semua menu, laporan laba rugi, ubah harga, hapus produk, dan kelola karyawan.
                                    </div>
                                    <div className="p-2 bg-sky-50 dark:bg-sky-950/30 border border-sky-300">
                                        <strong className="text-sky-950 dark:text-sky-300 uppercase block font-black">🛒 Akun Kasir (Cashier):</strong>
                                        Hanya bisa melayani transaksi kasir (POS) dan melihat riwayat nota hari ini. <em>Kasir TIDAK BISA melihat keuntungan atau mengubah harga menu!</em>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white dark:bg-slate-900 border-2 border-slate-900 dark:border-slate-800 shadow-[3px_3px_0px_0px_rgba(15,23,42,1)] p-5 space-y-3">
                                <div className="flex items-center space-x-2">
                                    <span className="w-6 h-6 bg-indigo-500 text-white font-black text-xs flex items-center justify-center border border-slate-900">
                                        B
                                    </span>
                                    <h4 className="font-black text-sm uppercase text-slate-900 dark:text-white">
                                        Cara Menambah Akun Kasir Baru
                                    </h4>
                                </div>
                                <ol className="text-xs font-medium text-slate-600 dark:text-slate-300 space-y-2 list-decimal list-inside leading-relaxed">
                                    <li>Masuk ke menu <strong>Kelola Kasir</strong> di atas.</li>
                                    <li>Klik tombol <strong>"+ Tambah Pengguna"</strong>.</li>
                                    <li>Isi nama kasir (misal: <em>Budi Santoso</em>), alamat email, dan buatkan kata sandi sederhana yang mudah diingat.</li>
                                    <li>Pilih peran sebagai <strong>Kasir (Cashier)</strong> lalu klik Simpan.</li>
                                </ol>
                            </div>
                        </div>
                    </div>
                )}

                {/* ========================================================================= */}
                {/* SECTION 5: LAPORAN & OMZET */}
                {/* ========================================================================= */}
                {activeSection === 'laporan' && (
                    <div className="space-y-6">
                        <div className="bg-white dark:bg-slate-900 border-2 border-slate-900 dark:border-slate-800 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] dark:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-5 sm:p-6">
                            <div className="flex items-center space-x-2.5 mb-2">
                                <div className="p-2 bg-rose-400 border border-slate-900 text-slate-950 font-black">
                                    <BarChart3 className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="font-black text-lg sm:text-xl uppercase text-slate-900 dark:text-white tracking-tight">
                                        Panduan Membaca Laporan & Keuntungan
                                    </h3>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                                        Dashboard cerdas pemilik untuk melihat omzet, laba bersih, dan menu makanan terlaris.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div className="bg-white dark:bg-slate-900 border-2 border-slate-900 dark:border-slate-800 shadow-[3px_3px_0px_0px_rgba(15,23,42,1)] p-5 space-y-2">
                                <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 bg-emerald-100 dark:bg-emerald-950 text-emerald-900 dark:text-emerald-300 border border-slate-900">
                                    KOTAK 1
                                </span>
                                <h4 className="font-black text-sm uppercase text-slate-900 dark:text-white">
                                    Total Omzet Hari Ini
                                </h4>
                                <p className="text-xs text-slate-600 dark:text-slate-300 font-medium leading-relaxed">
                                    Menampilkan total rupiah uang masuk hari ini dari seluruh transaksi (Tunai + QRIS).
                                </p>
                            </div>

                            <div className="bg-white dark:bg-slate-900 border-2 border-slate-900 dark:border-slate-800 shadow-[3px_3px_0px_0px_rgba(15,23,42,1)] p-5 space-y-2">
                                <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 bg-sky-100 dark:bg-sky-950 text-sky-900 dark:text-sky-300 border border-slate-900">
                                    KOTAK 2
                                </span>
                                <h4 className="font-black text-sm uppercase text-slate-900 dark:text-white">
                                    Perkiraan Laba Bersih
                                </h4>
                                <p className="text-xs text-slate-600 dark:text-slate-300 font-medium leading-relaxed">
                                    Dihitung dari selisih (Harga Jual - Harga Modal HPP) setiap porsi makanan yang terjual.
                                </p>
                            </div>

                            <div className="bg-white dark:bg-slate-900 border-2 border-slate-900 dark:border-slate-800 shadow-[3px_3px_0px_0px_rgba(15,23,42,1)] p-5 space-y-2">
                                <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 bg-amber-100 dark:bg-amber-950 text-amber-900 dark:text-amber-300 border border-slate-900">
                                    KOTAK 3
                                </span>
                                <h4 className="font-black text-sm uppercase text-slate-900 dark:text-white">
                                    Menu Paling Laris (Top Seller)
                                </h4>
                                <p className="text-xs text-slate-600 dark:text-slate-300 font-medium leading-relaxed">
                                    Mengetahui menu apa yang paling digemari pembeli agar persiapan bahan baku dapur tidak kurang.
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* ========================================================================= */}
                {/* SECTION 6: TANYA JAWAB (FAQ) */}
                {/* ========================================================================= */}
                {activeSection === 'faq' && (
                    <div className="space-y-6">
                        <div className="bg-white dark:bg-slate-900 border-2 border-slate-900 dark:border-slate-800 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] dark:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-5 sm:p-6">
                            <div className="flex items-center space-x-2.5 mb-2">
                                <div className="p-2 bg-amber-400 border border-slate-900 text-slate-950 font-black">
                                    <HelpCircle className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="font-black text-lg sm:text-xl uppercase text-slate-900 dark:text-white tracking-tight">
                                        Pertanyaan yang Sering Diajukan (FAQ)
                                    </h3>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                                        Jawaban sederhana untuk pertanyaan umum seputar sistem kasir dan server STB.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-3">
                            {faqs.map((faq, idx) => (
                                <div
                                    key={idx}
                                    className="bg-white dark:bg-slate-900 border-2 border-slate-900 dark:border-slate-800 shadow-[3px_3px_0px_0px_rgba(15,23,42,1)] dark:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] overflow-hidden"
                                >
                                    <button
                                        type="button"
                                        onClick={() => toggleFaq(idx)}
                                        className="w-full p-4 text-left flex items-center justify-between font-black text-xs sm:text-sm uppercase tracking-tight text-slate-900 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-800/50 transition"
                                    >
                                        <span className="flex items-center space-x-2">
                                            <span className="w-5 h-5 bg-amber-300 text-slate-950 text-[11px] font-black flex items-center justify-center border border-slate-900 shrink-0">
                                                ?
                                            </span>
                                            <span>{faq.q}</span>
                                        </span>
                                        {openFaq === idx ? (
                                            <ChevronUp className="w-4 h-4 shrink-0 text-slate-700 dark:text-slate-300" />
                                        ) : (
                                            <ChevronDown className="w-4 h-4 shrink-0 text-slate-400" />
                                        )}
                                    </button>

                                    {openFaq === idx && (
                                        <div className="p-4 pt-0 text-xs font-medium text-slate-700 dark:text-slate-300 border-t-2 border-dashed border-slate-200 dark:border-slate-800 mt-1 leading-relaxed bg-slate-50/50 dark:bg-slate-900/40">
                                            {faq.a}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Call to Action: Butuh Bantuan / Pasang di Warung */}
                <div className="mt-8 bg-gradient-to-r from-emerald-100 to-teal-100 dark:from-emerald-950/60 dark:to-teal-950/60 border-2 border-slate-900 dark:border-slate-700 shadow-[5px_5px_0px_0px_rgba(15,23,42,1)] p-6 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="space-y-1">
                            <div className="flex items-center space-x-2">
                                <h3 className="font-black text-base sm:text-lg uppercase text-emerald-950 dark:text-emerald-300">
                                    Butuh Bantuan Instalasi di Warung Anda?
                                </h3>
                                <span className="px-2 py-0.5 bg-emerald-400 text-slate-950 border border-slate-900 text-[10px] font-black uppercase">
                                    GRATIS
                                </span>
                            </div>
                            <p className="text-xs font-medium text-slate-700 dark:text-slate-300 max-w-xl leading-relaxed">
                                Jika Anda ingin memasang sistem kasir ini di warung makan, kafe, atau resto Anda (menggunakan STB mini hemat daya), hubungi saya secara langsung.
                            </p>
                        </div>

                        <div className="flex items-center space-x-2 shrink-0">
                            {waLink && (
                                <a
                                    href={waLink}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center space-x-2 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs uppercase tracking-wider border-2 border-slate-900 shadow-[3px_3px_0px_0px_rgba(15,23,42,1)] active:translate-x-0.5 active:translate-y-0.5 transition"
                                >
                                    <MessageCircle className="w-4 h-4" />
                                    <span>WhatsApp</span>
                                </a>
                            )}

                            {teleLink && (
                                <a
                                    href={teleLink}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center space-x-2 py-2.5 px-4 bg-sky-600 hover:bg-sky-700 text-white font-black text-xs uppercase tracking-wider border-2 border-slate-900 shadow-[3px_3px_0px_0px_rgba(15,23,42,1)] active:translate-x-0.5 active:translate-y-0.5 transition"
                                >
                                    <Send className="w-4 h-4" />
                                    <span>Telegram</span>
                                </a>
                            )}
                        </div>
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="mt-12 border-t-2 border-slate-900 dark:border-slate-800 bg-white dark:bg-slate-900 py-6 px-4 text-center select-none">
                <p className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                    Sistem Kasir {storeName} &copy; {new Date().getFullYear()} • Panduan Pemakaian Resmi
                </p>
            </footer>
        </div>
    );
}
