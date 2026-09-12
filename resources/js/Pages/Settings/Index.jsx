import React, { useState } from 'react';
import { Head, useForm, usePage } from '@inertiajs/react';
import Navbar from '@/Components/Navbar';
import {
    Settings,
    Store,
    Palette,
    Receipt,
    Sliders,
    Save,
    CheckCircle2,
    AlertTriangle,
    Sparkles,
    Check,
    HelpCircle,
    Info,
    Smartphone,
    MapPin,
    Phone,
    Printer,
    TableProperties,
    Percent
} from 'lucide-react';
import { THEME_PRESETS, getActiveTheme } from '@/Utils/themeHelper';

export default function SettingsIndex({ settings }) {
    const { flash, errors, store } = usePage().props;
    const [activeTab, setActiveTab] = useState('identity'); // identity, theme, receipt, operational

    // Inertia useForm
    const { data, setData, put, processing, recentlySuccessful, isDirty } = useForm({
        name: settings?.name || 'Pecel Lele Sedap',
        tagline: settings?.tagline || 'Sistem Kasir POS & Manajemen Warung',
        initials: settings?.initials || 'PL',
        theme_color: settings?.theme_color || 'emerald',
        address: settings?.address || 'Jl. Raya Warung Malam No. 12',
        phone: settings?.phone || '0812-3456-7890',
        receipt_footer: settings?.receipt_footer || "Matur Nuwun / Terima Kasih\nSelamat Menikmati Hidangan Kami",
        receipt_auto_print: settings?.receipt_auto_print ?? false,
        enable_table_number: settings?.enable_table_number ?? true,
        tax_percentage: settings?.tax_percentage || 0,
    });

    const previewTheme = getActiveTheme(data.theme_color);

    const handleSubmit = (e) => {
        e.preventDefault();
        put('/settings', {
            preserveScroll: true,
            onSuccess: () => {
                // Perbarui data-theme di dokumen secara langsung
                if (typeof document !== 'undefined') {
                    document.documentElement.setAttribute('data-theme', data.theme_color);
                }
            },
        });
    };

    return (
        <div className="min-h-screen bg-slate-100 dark:bg-slate-950 flex flex-col font-sans text-slate-900 dark:text-slate-100">
            <Head title={`Pengaturan Warung - ${store?.name || 'Pecel Lele Sedap'}`} />

            {/* Navbar Utama */}
            <Navbar />

            <main className="flex-1 max-w-6xl w-full mx-auto p-3 sm:p-6 space-y-5">
                {/* Header Judul & Deskripsi Halaman */}
                <div className="bg-white dark:bg-slate-900 border-2 border-slate-900 dark:border-slate-800 shadow-[3px_3px_0px_0px_rgba(15,23,42,1)] dark:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center space-x-3">
                        <div className={`w-11 h-11 ${previewTheme.classes.bgPrimary} border-2 border-slate-900 dark:border-slate-700 flex items-center justify-center text-white shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] dark:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] shrink-0 transition-colors`}>
                            <Settings className="w-6 h-6" />
                        </div>
                        <div>
                            <div className="flex items-center space-x-2">
                                <h1 className="text-lg sm:text-xl font-black uppercase tracking-tight text-slate-900 dark:text-white">
                                    Pengaturan Warung & Branding
                                </h1>
                                <span className="px-2 py-0.5 bg-amber-200 dark:bg-amber-950/80 border border-slate-900 dark:border-slate-700 font-extrabold text-[9px] uppercase text-amber-950 dark:text-amber-200">
                                    Pemilik (Owner)
                                </span>
                            </div>
                            <p className="text-xs text-slate-600 dark:text-slate-400 font-medium mt-0.5">
                                Personalisasi nama, slogan, palet warna visual, hingga format struk kasir thermal Anda.
                            </p>
                        </div>
                    </div>

                    {/* Tombol Simpan Cepat di Header */}
                    <button
                        type="button"
                        onClick={handleSubmit}
                        disabled={processing}
                        className={`self-start sm:self-auto flex items-center space-x-2 py-2.5 px-4 ${previewTheme.classes.bgPrimary} ${previewTheme.classes.bgPrimaryHover} text-white font-black text-xs uppercase tracking-wider border-2 border-slate-900 dark:border-slate-700 shadow-[3px_3px_0px_0px_rgba(15,23,42,1)] dark:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5 transition disabled:opacity-50`}
                    >
                        <Save className="w-4 h-4" />
                        <span>{processing ? 'Menyimpan...' : 'Simpan Pengaturan'}</span>
                    </button>
                </div>

                {/* Flash Messages & Alerts */}
                {flash?.success?.message && (
                    <div className={`p-3 ${previewTheme.classes.badge} border-2 border-slate-900 dark:border-slate-800 shadow-[3px_3px_0px_0px_rgba(15,23,42,1)] dark:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] flex items-center space-x-2 ${previewTheme.classes.textPrimaryDark} text-xs font-bold animate-in fade-in duration-200`}>
                        <CheckCircle2 className={`w-4 h-4 ${previewTheme.classes.textPrimary} shrink-0`} />
                        <span>{flash.success.message}</span>
                    </div>
                )}

                {Object.keys(errors).length > 0 && (
                    <div className="p-3 bg-rose-50 dark:bg-rose-950/60 border-2 border-slate-900 dark:border-slate-800 shadow-[3px_3px_0px_0px_rgba(15,23,42,1)] dark:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] flex items-start space-x-2 text-rose-950 dark:text-rose-200 text-xs font-bold animate-in fade-in duration-200">
                        <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                        <div>
                            <div className="font-extrabold uppercase">Terdapat kesalahan pengisian:</div>
                            <ul className="list-disc list-inside mt-1 font-medium text-rose-800 dark:text-rose-300">
                                {Object.values(errors).map((err, idx) => (
                                    <li key={idx}>{err}</li>
                                ))}
                            </ul>
                        </div>
                    </div>
                )}

                {/* Layout Grid: Navigasi Tab & Konten Form */}
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                    {/* Tab Navigation Menu */}
                    <div className="lg:col-span-1 space-y-1.5">
                        <button
                            type="button"
                            onClick={() => setActiveTab('identity')}
                            className={`w-full flex items-center space-x-2.5 px-3.5 py-3 text-xs font-extrabold uppercase tracking-wide border-2 border-slate-900 dark:border-slate-800 transition text-left ${activeTab === 'identity'
                                ? 'bg-white dark:bg-slate-900 shadow-[3px_3px_0px_0px_rgba(15,23,42,1)] dark:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] translate-x-0.5 text-slate-900 dark:text-white'
                                : 'bg-slate-50 dark:bg-slate-900/60 hover:bg-white dark:hover:bg-slate-900 text-slate-700 dark:text-slate-300'
                                }`}
                        >
                            <Store className={`w-4 h-4 ${activeTab === 'identity' ? previewTheme.classes.textPrimary : 'text-slate-500 dark:text-slate-400'}`} />
                            <div className="flex flex-col">
                                <span>Identitas Warung</span>
                                <span className="text-[10px] font-normal text-slate-500 dark:text-slate-400 lowercase">nama, logo & slogan</span>
                            </div>
                        </button>

                        <button
                            type="button"
                            onClick={() => setActiveTab('theme')}
                            className={`w-full flex items-center space-x-2.5 px-3.5 py-3 text-xs font-extrabold uppercase tracking-wide border-2 border-slate-900 dark:border-slate-800 transition text-left ${activeTab === 'theme'
                                ? 'bg-white dark:bg-slate-900 shadow-[3px_3px_0px_0px_rgba(15,23,42,1)] dark:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] translate-x-0.5 text-slate-900 dark:text-white'
                                : 'bg-slate-50 dark:bg-slate-900/60 hover:bg-white dark:hover:bg-slate-900 text-slate-700 dark:text-slate-300'
                                }`}
                        >
                            <Palette className={`w-4 h-4 ${activeTab === 'theme' ? previewTheme.classes.textPrimary : 'text-slate-500 dark:text-slate-400'}`} />
                            <div className="flex flex-col">
                                <span>Tema & Warna</span>
                                <span className="text-[10px] font-normal text-slate-500 dark:text-slate-400 lowercase">palet warna flat retro</span>
                            </div>
                        </button>

                        <button
                            type="button"
                            onClick={() => setActiveTab('receipt')}
                            className={`w-full flex items-center space-x-2.5 px-3.5 py-3 text-xs font-extrabold uppercase tracking-wide border-2 border-slate-900 dark:border-slate-800 transition text-left ${activeTab === 'receipt'
                                ? 'bg-white dark:bg-slate-900 shadow-[3px_3px_0px_0px_rgba(15,23,42,1)] dark:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] translate-x-0.5 text-slate-900 dark:text-white'
                                : 'bg-slate-50 dark:bg-slate-900/60 hover:bg-white dark:hover:bg-slate-900 text-slate-700 dark:text-slate-300'
                                }`}
                        >
                            <Receipt className={`w-4 h-4 ${activeTab === 'receipt' ? previewTheme.classes.textPrimary : 'text-slate-500 dark:text-slate-400'}`} />
                            <div className="flex flex-col">
                                <span>Struk Thermal</span>
                                <span className="text-[10px] font-normal text-slate-500 dark:text-slate-400 lowercase">kustom teks kertas 58mm</span>
                            </div>
                        </button>

                        <button
                            type="button"
                            onClick={() => setActiveTab('operational')}
                            className={`w-full flex items-center space-x-2.5 px-3.5 py-3 text-xs font-extrabold uppercase tracking-wide border-2 border-slate-900 dark:border-slate-800 transition text-left ${activeTab === 'operational'
                                ? 'bg-white dark:bg-slate-900 shadow-[3px_3px_0px_0px_rgba(15,23,42,1)] dark:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] translate-x-0.5 text-slate-900 dark:text-white'
                                : 'bg-slate-50 dark:bg-slate-900/60 hover:bg-white dark:hover:bg-slate-900 text-slate-700 dark:text-slate-300'
                                }`}
                        >
                            <Sliders className={`w-4 h-4 ${activeTab === 'operational' ? previewTheme.classes.textPrimary : 'text-slate-500 dark:text-slate-400'}`} />
                            <div className="flex flex-col">
                                <span>Operasional POS</span>
                                <span className="text-[10px] font-normal text-slate-500 dark:text-slate-400 lowercase">mode meja & auto-print</span>
                            </div>
                        </button>

                        {/* Live Mini Preview Box */}
                        <div className="p-3 bg-white dark:bg-slate-900 border-2 border-slate-900 dark:border-slate-800 shadow-[3px_3px_0px_0px_rgba(15,23,42,1)] dark:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] space-y-2 mt-4">
                            <div className="font-extrabold text-[10px] uppercase text-slate-600 dark:text-slate-400 flex items-center justify-between">
                                <span>Pratinjau Langsung:</span>
                                <span className="px-1.5 py-0.2 bg-slate-200 dark:bg-slate-800 border border-slate-900 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-[8.5px] font-mono">LIVE</span>
                            </div>
                            <div className="flex items-center space-x-2 p-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700">
                                <div className={`w-7 h-7 ${previewTheme.classes.bgPrimary} border border-slate-900 dark:border-slate-700 text-white font-black text-xs flex items-center justify-center shadow-[1px_1px_0px_0px_rgba(15,23,42,1)] shrink-0 transition-colors`}>
                                    {data.initials || 'PL'}
                                </div>
                                <div className="flex flex-col overflow-hidden">
                                    <span className="font-black text-xs text-slate-900 dark:text-white truncate">
                                        {data.name || 'Nama Warung'}
                                    </span>
                                    <span className={`text-[9px] font-bold ${previewTheme.classes.textPrimary} truncate`}>
                                        {data.tagline || 'Slogan Warung'}
                                    </span>
                                </div>
                            </div>
                            <div className="text-[10px] text-slate-500 dark:text-slate-400 italic">
                                * Perubahan akan langsung tercermin di seluruh navbar, struk, dan login.
                            </div>
                        </div>
                    </div>

                    {/* Tab Content Box */}
                    <div className="lg:col-span-3">
                        <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-900 border-2 border-slate-900 dark:border-slate-800 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] dark:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-5 space-y-5">
                            {/* TAB 1: IDENTITAS BISNIS */}
                            {activeTab === 'identity' && (
                                <div className="space-y-4 animate-in fade-in duration-150">
                                    <div className="border-b-2 border-slate-200 dark:border-slate-800 pb-2">
                                        <h2 className="font-black text-sm uppercase text-slate-900 dark:text-white">
                                            Identitas & Branding Warung
                                        </h2>
                                        <p className="text-xs text-slate-600 dark:text-slate-400">
                                            Informasi ini digunakan sebagai nama merek utama aplikasi dan label warung kasir.
                                        </p>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                        <div className="sm:col-span-2 space-y-1">
                                            <label className="block text-xs font-black uppercase text-slate-800 dark:text-slate-200">
                                                Nama Warung / Usaha <span className="text-rose-600">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                required
                                                value={data.name}
                                                onChange={(e) => setData('name', e.target.value)}
                                                placeholder="Contoh: Pecel Lele Sedap / Penyetan Cak Riyan"
                                                className="w-full px-3 py-2 border-2 border-slate-900 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold text-slate-900 dark:text-white focus:outline-hidden focus:ring-0 focus:border-slate-900 dark:focus:border-slate-500 shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] dark:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                                            />
                                            <p className="text-[10px] text-slate-500 dark:text-slate-400">
                                                Akan tampil di Navbar, Login, Tab Title, dan Struk Pembelian.
                                            </p>
                                        </div>

                                        <div className="space-y-1">
                                            <label className="block text-xs font-black uppercase text-slate-800 dark:text-slate-200">
                                                Inisial Logo (2-4 Huruf) <span className="text-rose-600">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                maxLength={4}
                                                required
                                                value={data.initials}
                                                onChange={(e) => setData('initials', e.target.value.toUpperCase())}
                                                placeholder="PL"
                                                className="w-full px-3 py-2 border-2 border-slate-900 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-black uppercase text-slate-900 dark:text-white focus:outline-hidden focus:ring-0 focus:border-slate-900 dark:focus:border-slate-500 shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] dark:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                                            />
                                            <p className="text-[10px] text-slate-500 dark:text-slate-400">
                                                Singkatan badge logo kotak (misal: PL, CR, MG).
                                            </p>
                                        </div>
                                    </div>

                                    <div className="space-y-1">
                                        <label className="block text-xs font-black uppercase text-slate-800 dark:text-slate-200">
                                            Slogan / Tagline Bisnis
                                        </label>
                                        <input
                                            type="text"
                                            value={data.tagline}
                                            onChange={(e) => setData('tagline', e.target.value)}
                                            placeholder="Contoh: Sambal Cobek Mantap & Bikin Nagih"
                                            className="w-full px-3 py-2 border-2 border-slate-900 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold text-slate-900 dark:text-white focus:outline-hidden focus:ring-0 focus:border-slate-900 dark:focus:border-slate-500 shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] dark:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                                        />
                                        <p className="text-[10px] text-slate-500 dark:text-slate-400">
                                            Tampil di bawah nama toko pada Navbar dan halaman Login.
                                        </p>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-200 dark:border-slate-800">
                                        <div className="space-y-1">
                                            <label className="block text-xs font-black uppercase text-slate-800 dark:text-slate-200 flex items-center space-x-1">
                                                <Phone className="w-3.5 h-3.5 text-slate-700 dark:text-slate-300" />
                                                <span>Nomor Telepon / WhatsApp Warung</span>
                                            </label>
                                            <input
                                                type="text"
                                                value={data.phone}
                                                onChange={(e) => setData('phone', e.target.value)}
                                                placeholder="0812-3456-7890"
                                                className="w-full px-3 py-2 border-2 border-slate-900 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold text-slate-900 dark:text-white focus:outline-hidden focus:ring-0 focus:border-slate-900 dark:focus:border-slate-500 shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] dark:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                                            />
                                        </div>

                                        <div className="space-y-1">
                                            <label className="block text-xs font-black uppercase text-slate-800 dark:text-slate-200 flex items-center space-x-1">
                                                <MapPin className="w-3.5 h-3.5 text-slate-700 dark:text-slate-300" />
                                                <span>Alamat Fisik / Lokasi Cabang</span>
                                            </label>
                                            <input
                                                type="text"
                                                value={data.address}
                                                onChange={(e) => setData('address', e.target.value)}
                                                placeholder="Jl. Raya Sambal Lamongan No. 12"
                                                className="w-full px-3 py-2 border-2 border-slate-900 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold text-slate-900 dark:text-white focus:outline-hidden focus:ring-0 focus:border-slate-900 dark:focus:border-slate-500 shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] dark:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* TAB 2: TEMA & PALET WARNA */}
                            {activeTab === 'theme' && (
                                <div className="space-y-4 animate-in fade-in duration-150">
                                    <div className="border-b-2 border-slate-200 dark:border-slate-800 pb-2">
                                        <h2 className="font-black text-sm uppercase text-slate-900 dark:text-white">
                                            Pilihan Tema & Palet Warna Visual
                                        </h2>
                                        <p className="text-xs text-slate-600 dark:text-slate-400">
                                            Pilih preset palet warna terkurasi dengan estetika Neo-Brutalist kontras tinggi.
                                        </p>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        {THEME_PRESETS.map((t) => {
                                            const isSelected = data.theme_color === t.id;
                                            return (
                                                <button
                                                    key={t.id}
                                                    type="button"
                                                    onClick={() => setData('theme_color', t.id)}
                                                    className={`p-3.5 border-2 text-left transition flex flex-col justify-between space-y-3 relative ${isSelected
                                                        ? 'border-slate-900 dark:border-slate-600 bg-white dark:bg-slate-800/90 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] dark:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] ring-2 ring-slate-900 dark:ring-slate-500'
                                                        : 'border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/40 hover:bg-white dark:hover:bg-slate-800 hover:border-slate-900 dark:hover:border-slate-600'
                                                        }`}
                                                >
                                                    {/* Header Card Tema */}
                                                    <div className="flex items-start justify-between">
                                                        <div>
                                                            <div className="flex items-center space-x-2">
                                                                <span className="font-black text-xs uppercase text-slate-900 dark:text-white">
                                                                    {t.name}
                                                                </span>
                                                                <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.2 bg-slate-200 dark:bg-slate-700 border border-slate-900 dark:border-slate-600 text-slate-800 dark:text-slate-200">
                                                                    {t.tag}
                                                                </span>
                                                            </div>
                                                            <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-1 leading-snug">
                                                                {t.description}
                                                            </p>
                                                        </div>

                                                        {isSelected && (
                                                            <div className="w-5 h-5 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-950 flex items-center justify-center shrink-0">
                                                                <Check className="w-3.5 h-3.5" />
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Swatch Warna Preview */}
                                                    <div className="flex items-center space-x-2 pt-2 border-t border-slate-200 dark:border-slate-700">
                                                        <div
                                                            className="w-8 h-6 border border-slate-900 dark:border-slate-700 shadow-[1px_1px_0px_0px_rgba(15,23,42,1)]"
                                                            style={{ backgroundColor: t.primary }}
                                                            title="Primary"
                                                        />
                                                        <div
                                                            className="w-8 h-6 border border-slate-900 dark:border-slate-700 shadow-[1px_1px_0px_0px_rgba(15,23,42,1)]"
                                                            style={{ backgroundColor: t.accent }}
                                                            title="Accent"
                                                        />
                                                        <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400">
                                                            {t.primary} / {t.accent}
                                                        </span>
                                                    </div>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* TAB 3: STRUK THERMAL & PRINTER */}
                            {activeTab === 'receipt' && (
                                <div className="space-y-4 animate-in fade-in duration-150">
                                    <div className="border-b-2 border-slate-200 dark:border-slate-800 pb-2">
                                        <h2 className="font-black text-sm uppercase text-slate-900 dark:text-white">
                                            Pengaturan Struk Kasir Thermal (58mm)
                                        </h2>
                                        <p className="text-xs text-slate-600 dark:text-slate-400">
                                            Sesuaikan teks header, footer, dan pesan khusus yang dicetak di kertas struk pelanggan.
                                        </p>
                                    </div>

                                    <div className="space-y-3">
                                        <div className="space-y-1">
                                            <label className="block text-xs font-black uppercase text-slate-800 dark:text-slate-200">
                                                Pesan Penutup Struk (Footer)
                                            </label>
                                            <textarea
                                                rows={3}
                                                value={data.receipt_footer}
                                                onChange={(e) => setData('receipt_footer', e.target.value)}
                                                placeholder="Contoh: Matur Nuwun / Terima Kasih&#10;Selamat Menikmati Hidangan Kami&#10;Password WiFi: sambal99"
                                                className="w-full px-3 py-2 border-2 border-slate-900 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-mono text-slate-900 dark:text-white focus:outline-hidden focus:ring-0 focus:border-slate-900 dark:focus:border-slate-500 shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] dark:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                                            />
                                            <p className="text-[10px] text-slate-500 dark:text-slate-400">
                                                Tercetak di bagian paling bawah struk thermal. Gunakan enter untuk baris baru.
                                            </p>
                                        </div>

                                        <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border-2 border-slate-900 dark:border-slate-700 text-xs flex items-start space-x-2.5">
                                            <Info className="w-4 h-4 text-amber-800 dark:text-amber-400 shrink-0 mt-0.5" />
                                            <div className="text-[11px] text-amber-950 dark:text-amber-200 font-medium">
                                                <strong>Header Struk</strong> otomatis mengambil data <strong>Nama Warung</strong>, <strong>Alamat</strong>, dan <strong>Nomor WhatsApp</strong> dari tab Identitas Bisnis di atas.
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* TAB 4: OPERASIONAL POS */}
                            {activeTab === 'operational' && (
                                <div className="space-y-4 animate-in fade-in duration-150">
                                    <div className="border-b-2 border-slate-200 dark:border-slate-800 pb-2">
                                        <h2 className="font-black text-sm uppercase text-slate-900 dark:text-white">
                                            Operasional & Fitur POS
                                        </h2>
                                        <p className="text-xs text-slate-600 dark:text-slate-400">
                                            Atur alur kasir agar sesuai dengan metode pelayanan warung Anda.
                                        </p>
                                    </div>

                                    <div className="space-y-3">
                                        {/* Toggle Nomor Meja */}
                                        <div className="p-3.5 bg-slate-50 dark:bg-slate-800/80 border-2 border-slate-900 dark:border-slate-700 flex items-center justify-between">
                                            <div className="space-y-0.5 pr-4">
                                                <div className="font-black text-xs uppercase text-slate-900 dark:text-white flex items-center space-x-2">
                                                    <TableProperties className="w-4 h-4 text-slate-700 dark:text-slate-300" />
                                                    <span>Gunakan Nomor Meja (Dine-in)</span>
                                                </div>
                                                <p className="text-[11px] text-slate-600 dark:text-slate-400">
                                                    Jika dimatikan, kasir berjalan dalam mode <strong>Quick Service / Takeaway</strong> tanpa menanyakan nomor meja pelanggan.
                                                </p>
                                            </div>
                                            <label className="relative inline-flex items-center cursor-pointer shrink-0">
                                                <input
                                                    type="checkbox"
                                                    checked={data.enable_table_number}
                                                    onChange={(e) => setData('enable_table_number', e.target.checked)}
                                                    className="sr-only peer"
                                                />
                                                <div className="w-11 h-6 bg-slate-300 dark:bg-slate-700 peer-focus:outline-hidden border-2 border-slate-900 dark:border-slate-600 peer-checked:bg-slate-900 dark:peer-checked:bg-slate-100 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white dark:after:bg-slate-900 after:border-2 after:border-slate-900 dark:after:border-slate-700 after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full"></div>
                                            </label>
                                        </div>

                                        {/* Toggle Auto-Print Struk */}
                                        <div className="p-3.5 bg-slate-50 dark:bg-slate-800/80 border-2 border-slate-900 dark:border-slate-700 flex items-center justify-between">
                                            <div className="space-y-0.5 pr-4">
                                                <div className="font-black text-xs uppercase text-slate-900 dark:text-white flex items-center space-x-2">
                                                    <Printer className="w-4 h-4 text-slate-700 dark:text-slate-300" />
                                                    <span>Cetak Struk Otomatis (Auto-Print)</span>
                                                </div>
                                                <p className="text-[11px] text-slate-600 dark:text-slate-400">
                                                    Otomatis mengirim perintah cetak ESC/POS ke printer Bluetooth begitu kasir menekan tombol Simpan & Bayar.
                                                </p>
                                            </div>
                                            <label className="relative inline-flex items-center cursor-pointer shrink-0">
                                                <input
                                                    type="checkbox"
                                                    checked={data.receipt_auto_print}
                                                    onChange={(e) => setData('receipt_auto_print', e.target.checked)}
                                                    className="sr-only peer"
                                                />
                                                <div className="w-11 h-6 bg-slate-300 dark:bg-slate-700 peer-focus:outline-hidden border-2 border-slate-900 dark:border-slate-600 peer-checked:bg-slate-900 dark:peer-checked:bg-slate-100 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white dark:after:bg-slate-900 after:border-2 after:border-slate-900 dark:after:border-slate-700 after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full"></div>
                                            </label>
                                        </div>

                                        {/* Persentase Pajak PB1 */}
                                        <div className="p-3.5 bg-slate-50 dark:bg-slate-800/80 border-2 border-slate-900 dark:border-slate-700 space-y-2">
                                            <div className="font-black text-xs uppercase text-slate-900 dark:text-white flex items-center space-x-2">
                                                <Percent className="w-4 h-4 text-slate-700 dark:text-slate-300" />
                                                <span>Pajak Restoran / PB1 (%)</span>
                                            </div>
                                            <div className="flex items-center space-x-2 max-w-xs">
                                                <input
                                                    type="number"
                                                    min="0"
                                                    max="100"
                                                    step="0.5"
                                                    value={data.tax_percentage}
                                                    onChange={(e) => setData('tax_percentage', e.target.value)}
                                                    className="w-28 px-3 py-1.5 border-2 border-slate-900 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-bold text-slate-900 dark:text-white focus:outline-hidden focus:ring-0 focus:border-slate-900 dark:focus:border-slate-500 shadow-[1px_1px_0px_0px_rgba(15,23,42,1)]"
                                                />
                                                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">%</span>
                                            </div>
                                            <p className="text-[10px] text-slate-500 dark:text-slate-400">
                                                Isi 0 jika harga menu sudah bersih tanpa biaya pajak tambahan.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Tombol Simpan Bawah Form */}
                            <div className="pt-4 border-t-2 border-slate-200 dark:border-slate-800 flex items-center justify-between">
                                <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                                    {isDirty ? (
                                        <span className="text-amber-700 dark:text-amber-400 font-bold flex items-center space-x-1">
                                            <span>● Ada perubahan belum tersimpan</span>
                                        </span>
                                    ) : (
                                        <span className="text-slate-400 dark:text-slate-500">Semua pengaturan telah tersimpan</span>
                                    )}
                                </div>

                                <button
                                    type="submit"
                                    disabled={processing}
                                    className={`py-2.5 px-5 ${previewTheme.classes.bgPrimary} ${previewTheme.classes.bgPrimaryHover} text-white font-black text-xs uppercase tracking-wider border-2 border-slate-900 dark:border-slate-700 shadow-[3px_3px_0px_0px_rgba(15,23,42,1)] dark:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5 transition flex items-center space-x-2 disabled:opacity-50`}
                                >
                                    <Save className="w-4 h-4" />
                                    <span>{processing ? 'Menyimpan...' : 'Simpan Semua Pengaturan'}</span>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </main>
        </div>
    );
}
