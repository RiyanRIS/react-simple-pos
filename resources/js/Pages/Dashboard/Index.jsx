import React, { useState, useEffect } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import Navbar from '@/Components/Navbar';
import ThermalReceipt from '@/Components/ThermalReceipt';
import { isPrinterConnected, getConnectedPrinterName } from '@/Utils/BluetoothPrinterHelper';
import { getActiveTheme } from '@/Utils/themeHelper';
import { isDarkModeActive } from '@/Utils/darkMode';
import {
    BarChart3,
    Clock,
    Flame,
    Banknote,
    QrCode,
    TrendingUp,
    ShoppingBag,
    Award,
    Calendar,
    ChevronRight,
    Printer,
    CheckCircle,
    Store,
    ArrowUpRight,
    Wallet
} from 'lucide-react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement,
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement
);

export default function DashboardIndex({
    period,
    kpi,
    peakHours,
    topProducts,
    paymentStats,
    dailyTrends,
    recentOrders
}) {
    const { store } = usePage().props;
    const currentTheme = getActiveTheme(store?.theme_color);
    const [selectedOrderForReprint, setSelectedOrderForReprint] = useState(null);

    // Reactive Dark Mode Detection for Canvas Charts
    const [isDark, setIsDark] = useState(() => isDarkModeActive());

    useEffect(() => {
        const handleThemeChange = (e) => {
            setIsDark(e.detail?.mode === 'dark' || isDarkModeActive());
        };
        window.addEventListener('theme-mode-changed', handleThemeChange);
        return () => window.removeEventListener('theme-mode-changed', handleThemeChange);
    }, []);

    const handlePeriodChange = (newPeriod) => {
        router.get('/dashboard', { period: newPeriod }, { preserveState: true, preserveScroll: true });
    };

    // Chart Data: Analisis Jam Ramai (Peak Hours)
    const peakHoursChartData = {
        labels: peakHours.map(item => item.label),
        datasets: [
            {
                label: 'Jumlah Pesanan',
                data: peakHours.map(item => item.orders),
                backgroundColor: peakHours.map(item => {
                    // Beri warna tema lebih pekat untuk jam puncak
                    return item.orders > 0 && item.label.startsWith(kpi.busiest_hour.split(':')[0])
                        ? currentTheme.primaryHover
                        : currentTheme.primary;
                }),
                borderColor: isDark ? '#334155' : '#0f172a',
                borderWidth: 1.5,
                borderRadius: 2,
            },
        ],
    };

    const peakHoursChartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            tooltip: {
                callbacks: {
                    afterLabel: function (context) {
                        const index = context.dataIndex;
                        const rev = peakHours[index]?.revenue || 0;
                        return `Omzet: Rp ${rev.toLocaleString('id-ID')}`;
                    },
                },
            },
        },
        scales: {
            x: {
                grid: { display: false },
                ticks: {
                    color: isDark ? '#94a3b8' : '#64748b',
                    font: { family: 'Plus Jakarta Sans', weight: 'bold', size: 11 },
                },
            },
            y: {
                grid: { color: isDark ? '#334155' : '#e2e8f0' },
                ticks: {
                    color: isDark ? '#94a3b8' : '#64748b',
                    font: { family: 'Plus Jakarta Sans', size: 11 },
                },
            },
        },
    };

    // Chart Data: Rasio Pembayaran Cash vs QRIS
    const paymentChartData = {
        labels: ['Tunai (Cash)', 'QRIS'],
        datasets: [
            {
                data: [paymentStats.cash.count, paymentStats.qris.count],
                backgroundColor: [currentTheme.primary, '#0284c7'], // Theme Primary vs Sky Blue
                borderColor: isDark ? '#0f172a' : '#ffffff',
                borderWidth: 2,
            },
        ],
    };

    const paymentChartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'bottom',
                labels: {
                    color: isDark ? '#cbd5e1' : '#334155',
                    font: { family: 'Plus Jakarta Sans', weight: 'bold', size: 11 },
                    boxWidth: 14,
                },
            },
        },
    };

    return (
        <div className="min-h-screen bg-slate-100 dark:bg-slate-950 flex flex-col font-sans text-slate-900 dark:text-slate-100">
            <Head title={`Dashboard Analitik Pemilik - ${store?.name || 'Pecel Lele Sedap'}`} />

            <Navbar />

            <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-6 space-y-5">

                {/* Header Dashboard & Filter Waktu */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 border-2 border-slate-900 dark:border-slate-800 shadow-[3px_3px_0px_0px_rgba(15,23,42,1)] dark:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
                    <div>
                        <div className="flex items-center space-x-2">
                            <span className={`px-2 py-0.5 ${currentTheme.classes.badge} text-[10px] font-extrabold uppercase tracking-wide`}>
                                Owner Monitoring
                            </span>
                            <h1 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white tracking-tight uppercase">
                                Analisis Penjualan Warung
                            </h1>
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-400 font-medium mt-0.5">
                            Pantau menu favorit, jam lonjakan pembeli, serta rasio pembayaran Cash vs QRIS.
                        </p>
                    </div>

                    {/* Filter Tabs: Hari ini, 7 Hari, 30 Hari */}
                    <div className="flex items-center space-x-1.5 self-start sm:self-auto">
                        {[
                            { key: 'today', label: 'Hari Ini' },
                            { key: '7days', label: '7 Hari Terakhir' },
                            { key: '30days', label: '30 Hari Terakhir' },
                        ].map((btn) => (
                            <button
                                key={btn.key}
                                type="button"
                                onClick={() => handlePeriodChange(btn.key)}
                                className={`px-3 py-1.5 text-xs font-extrabold uppercase border-2 border-slate-900 dark:border-slate-700 transition ${period === btn.key
                                        ? `${currentTheme.classes.bgPrimary} text-white shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] dark:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]`
                                        : 'bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200'
                                    }`}
                            >
                                {btn.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* KPI METRIC CARDS (FLAT & BOXY CARDS) */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">

                    {/* 1. Total Omzet */}
                    <div className="bg-white dark:bg-slate-900 p-3.5 border-2 border-slate-900 dark:border-slate-800 shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] dark:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] flex flex-col justify-between">
                        <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1">
                            <span className="text-[11px] font-extrabold uppercase tracking-wider">Total Omzet</span>
                            <TrendingUp className={`w-4 h-4 ${currentTheme.classes.textPrimary}`} />
                        </div>
                        <div className="text-lg sm:text-xl font-black text-slate-900 dark:text-white font-mono">
                            Rp {kpi.total_revenue.toLocaleString('id-ID')}
                        </div>
                        <div className={`text-[10px] font-semibold ${currentTheme.classes.textPrimary} mt-1`}>
                            Laba Kotor: Rp {kpi.gross_profit.toLocaleString('id-ID')}
                        </div>
                    </div>

                    {/* 2. Total Transaksi */}
                    <div className="bg-white dark:bg-slate-900 p-3.5 border-2 border-slate-900 dark:border-slate-800 shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] dark:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] flex flex-col justify-between">
                        <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1">
                            <span className="text-[11px] font-extrabold uppercase tracking-wider">Transaksi</span>
                            <ShoppingBag className={`w-4 h-4 ${currentTheme.classes.textPrimary}`} />
                        </div>
                        <div className="text-lg sm:text-xl font-black text-slate-900 dark:text-white font-mono">
                            {kpi.total_orders} <span className="text-xs font-bold text-slate-600 dark:text-slate-400">Pesanan</span>
                        </div>
                        <div className="text-[10px] font-semibold text-slate-600 dark:text-slate-400 mt-1">
                            {kpi.items_sold} Total Porsi Terjual
                        </div>
                    </div>

                    {/* 3. Rata-rata Nilai Belanja (AOV) */}
                    <div className="bg-white dark:bg-slate-900 p-3.5 border-2 border-slate-900 dark:border-slate-800 shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] dark:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] flex flex-col justify-between">
                        <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1">
                            <span className="text-[11px] font-extrabold uppercase tracking-wider">Rata-Rata Meja</span>
                            <Wallet className={`w-4 h-4 ${currentTheme.classes.textPrimary}`} />
                        </div>
                        <div className="text-lg sm:text-xl font-black text-slate-900 dark:text-white font-mono">
                            Rp {kpi.average_order_value.toLocaleString('id-ID')}
                        </div>
                        <div className="text-[10px] font-semibold text-slate-600 dark:text-slate-400 mt-1">
                            Rata-rata per transaksi
                        </div>
                    </div>

                    {/* 4. Jam Paling Ramai (Peak Hour) */}
                    <div className={`${currentTheme.classes.bgPrimaryLight} p-3.5 border-2 border-slate-900 dark:border-slate-800 shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] dark:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] flex flex-col justify-between`}>
                        <div className={`flex items-center justify-between ${currentTheme.classes.textPrimaryDark} mb-1`}>
                            <span className="text-[11px] font-extrabold uppercase tracking-wider">Jam Paling Ramai</span>
                            <Clock className={`w-4 h-4 ${currentTheme.classes.textPrimary}`} />
                        </div>
                        <div className={`text-base sm:text-lg font-black ${currentTheme.classes.textPrimaryDark} font-mono`}>
                            {kpi.busiest_hour}
                        </div>
                        <div className={`text-[10px] font-bold ${currentTheme.classes.textPrimary} mt-1 flex items-center space-x-1`}>
                            <Flame className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                            <span>Puncak Pesanan Warung</span>
                        </div>
                    </div>

                    {/* 5. Menu Terfavorit #1 */}
                    <div className="bg-white dark:bg-slate-900 p-3.5 border-2 border-slate-900 dark:border-slate-800 shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] dark:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] flex flex-col justify-between">
                        <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1">
                            <span className="text-[11px] font-extrabold uppercase tracking-wider">Menu Terlaris #1</span>
                            <Award className="w-4 h-4 text-amber-500" />
                        </div>
                        <div className="text-xs sm:text-sm font-black text-slate-900 dark:text-white line-clamp-1 leading-snug">
                            {kpi.favorite_product}
                        </div>
                        <div className={`text-[10px] font-bold ${currentTheme.classes.textPrimary} mt-1`}>
                            {kpi.favorite_count} Porsi Ludes
                        </div>
                    </div>

                    {/* 6. Metode Dominan */}
                    <div className="bg-white dark:bg-slate-900 p-3.5 border-2 border-slate-900 dark:border-slate-800 shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] dark:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] flex flex-col justify-between">
                        <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1">
                            <span className="text-[11px] font-extrabold uppercase tracking-wider">Metode Bayar</span>
                            <Banknote className={`w-4 h-4 ${currentTheme.classes.textPrimary}`} />
                        </div>
                        <div className="text-xs sm:text-sm font-black text-slate-900 dark:text-white">
                            <span className={currentTheme.classes.textPrimary}>{paymentStats.cash.percentage}% Cash</span>
                        </div>
                        <div className="text-[10px] font-bold text-sky-700 dark:text-sky-300 mt-1">
                            {paymentStats.qris.percentage}% QRIS (Scan)
                        </div>
                    </div>
                </div>

                {/* DUA GRAFIK UTAMA: JAM RAMAI & METODE PEMBAYARAN CASH VS QRIS */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

                    {/* GRAFIK 1: JAM RAMAI WARUNG (PEAK HOURS) */}
                    <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-4 border-2 border-slate-900 dark:border-slate-800 shadow-[3px_3px_0px_0px_rgba(15,23,42,1)] dark:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] flex flex-col">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 mb-3 border-b-2 border-slate-200 dark:border-slate-800 gap-2">
                            <div>
                                <div className="flex items-center space-x-1.5">
                                    <Clock className={`w-4 h-4 ${currentTheme.classes.textPrimary}`} />
                                    <h2 className="font-extrabold text-sm uppercase text-slate-900 dark:text-white">
                                        Analisis Jam Ramai (Pukul 15:00 - 24:00)
                                    </h2>
                                </div>
                                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                                    Mengetahui jam lonjakan transaksi untuk efisiensi persiapan bahan dan staf.
                                </p>
                            </div>
                            <div className={`px-2.5 py-1 ${currentTheme.classes.badge} text-[11px] font-extrabold shrink-0`}>
                                Jam Puncak: <span className={`font-mono ${currentTheme.classes.textPrimaryDark}`}>{kpi.busiest_hour}</span>
                            </div>
                        </div>

                        {/* Chart Area */}
                        <div className="h-64 sm:h-72 w-full">
                            <Bar data={peakHoursChartData} options={peakHoursChartOptions} />
                        </div>

                        {/* Insight Kotak Bawah */}
                        <div className="mt-3 p-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-300 flex items-start space-x-2">
                            <span className={`font-extrabold ${currentTheme.classes.textPrimary} shrink-0 uppercase tracking-wide`}>
                                💡 Catatan Operasional:
                            </span>
                            <span>
                                Transaksi meningkat pesat pada rentang <strong>{kpi.busiest_hour}</strong>. Pastikan lele ungkep, ayam bakar bumbu, serta racikan sambal sudah siap matang sebelum jam tersebut agar antrean tidak menumpuk.
                            </span>
                        </div>
                    </div>

                    {/* GRAFIK 2: RASIO METODE PEMBAYARAN (CASH VS QRIS) */}
                    <div className="bg-white dark:bg-slate-900 p-4 border-2 border-slate-900 dark:border-slate-800 shadow-[3px_3px_0px_0px_rgba(15,23,42,1)] dark:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] flex flex-col justify-between">
                        <div className="pb-2 mb-2 border-b-2 border-slate-200 dark:border-slate-800">
                            <div className="flex items-center space-x-1.5">
                                <Banknote className={`w-4 h-4 ${currentTheme.classes.textPrimary}`} />
                                <h2 className="font-extrabold text-sm uppercase text-slate-900 dark:text-white">
                                    Rasio Cash vs QRIS
                                </h2>
                            </div>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                                Seberapa banyak pelanggan yang bayar tunai dibanding scan QRIS.
                            </p>
                        </div>

                        {/* Donut Chart */}
                        <div className="h-44 sm:h-48 my-auto relative">
                            <Doughnut data={paymentChartData} options={paymentChartOptions} />
                        </div>

                        {/* Breakdown Kartu Detail */}
                        <div className="space-y-2 mt-3 pt-3 border-t border-slate-200 dark:border-slate-800">
                            {/* Cash Card */}
                            <div className={`p-2.5 ${currentTheme.classes.bgPrimaryLight} border-2 border-slate-900 dark:border-slate-800 flex items-center justify-between`}>
                                <div className="flex items-center space-x-2">
                                    <div className={`w-3 h-3 ${currentTheme.classes.bgPrimary} border border-slate-900 dark:border-slate-700`}></div>
                                    <div>
                                        <div className="font-bold text-xs text-slate-900 dark:text-white uppercase">Uang Tunai (Cash)</div>
                                        <div className="text-[10px] text-slate-600 dark:text-slate-400">{paymentStats.cash.count} transaksi ({paymentStats.cash.percentage}%)</div>
                                    </div>
                                </div>
                                <div className={`font-extrabold font-mono text-xs ${currentTheme.classes.textPrimaryDark}`}>
                                    Rp {paymentStats.cash.total.toLocaleString('id-ID')}
                                </div>
                            </div>

                            {/* QRIS Card */}
                            <div className="p-2.5 bg-sky-50 dark:bg-sky-950/40 border-2 border-sky-800 dark:border-sky-700 flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                    <div className="w-3 h-3 bg-sky-600 border border-slate-900 dark:border-slate-700"></div>
                                    <div>
                                        <div className="font-bold text-xs text-slate-900 dark:text-white uppercase">QRIS (Non-Tunai)</div>
                                        <div className="text-[10px] text-slate-600 dark:text-slate-400">{paymentStats.qris.count} transaksi ({paymentStats.qris.percentage}%)</div>
                                    </div>
                                </div>
                                <div className="font-extrabold font-mono text-xs text-sky-900 dark:text-sky-200">
                                    Rp {paymentStats.qris.total.toLocaleString('id-ID')}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* MENU TERFAVORIT / TERLARIS (TOP SELLING PRODUCTS TABLE) */}
                <div className="bg-white dark:bg-slate-900 p-4 border-2 border-slate-900 dark:border-slate-800 shadow-[3px_3px_0px_0px_rgba(15,23,42,1)] dark:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 mb-3 border-b-2 border-slate-200 dark:border-slate-800 gap-1">
                        <div className="flex items-center space-x-1.5">
                            <Award className={`w-4 h-4 ${currentTheme.classes.textPrimary}`} />
                            <h2 className="font-extrabold text-sm uppercase text-slate-900 dark:text-white">
                                Peringkat Menu Terfavorit (Paling Laku)
                            </h2>
                        </div>
                        <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                            Diurutkan berdasarkan jumlah porsi terjual
                        </span>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-xs">
                            <thead>
                                <tr className="border-b-2 border-slate-900 dark:border-slate-800 bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-300">
                                    <th className="py-2.5 px-3 font-black uppercase text-[11px] w-12 text-center">No</th>
                                    <th className="py-2.5 px-3 font-black uppercase text-[11px]">Nama Menu</th>
                                    <th className="py-2.5 px-3 font-black uppercase text-[11px] text-center w-28">Porsi Terjual</th>
                                    <th className="py-2.5 px-3 font-black uppercase text-[11px] text-right w-36">Total Omzet</th>
                                    <th className="py-2.5 px-3 font-black uppercase text-[11px] w-40">Kontribusi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                                {topProducts.map((prod, index) => (
                                    <tr key={index} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
                                        <td className="py-2.5 px-3 text-center font-mono font-bold">
                                            {index === 0 ? (
                                                <span className="inline-block w-5 h-5 bg-amber-400 border border-slate-900 text-slate-950 text-[11px] font-black leading-tight">
                                                    1
                                                </span>
                                            ) : index === 1 ? (
                                                <span className="inline-block w-5 h-5 bg-slate-300 border border-slate-900 text-slate-950 text-[11px] font-black leading-tight">
                                                    2
                                                </span>
                                            ) : index === 2 ? (
                                                <span className="inline-block w-5 h-5 bg-amber-600 border border-slate-900 text-white text-[11px] font-black leading-tight">
                                                    3
                                                </span>
                                            ) : (
                                                index + 1
                                            )}
                                        </td>
                                        <td className="py-2.5 px-3 font-bold text-slate-900 dark:text-white">
                                            {prod.name}
                                        </td>
                                        <td className="py-2.5 px-3 text-center font-mono font-black text-slate-900 dark:text-white bg-slate-50/70 dark:bg-slate-800/50">
                                            {prod.quantity} <span className="text-[10px] font-normal text-slate-500 dark:text-slate-400">porsi</span>
                                        </td>
                                        <td className={`py-2.5 px-3 text-right font-mono font-black ${currentTheme.classes.textPrimary}`}>
                                            Rp {prod.sales.toLocaleString('id-ID')}
                                        </td>
                                        <td className="py-2.5 px-3">
                                            <div className="flex items-center space-x-2">
                                                <div className="flex-1 bg-slate-200 dark:bg-slate-700 h-2 border border-slate-300 dark:border-slate-600">
                                                    <div
                                                        className={`${currentTheme.classes.bgPrimary} h-full`}
                                                        style={{ width: `${Math.min(100, prod.percentage * 3)}%` }}
                                                    ></div>
                                                </div>
                                                <span className="text-[10px] font-mono font-bold text-slate-600 dark:text-slate-400 w-9 text-right">
                                                    {prod.percentage}%
                                                </span>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* RIWAYAT TRANSAKSI TERAKHIR DENGAN TOMBOL CETAK ULANG */}
                <div className="bg-white dark:bg-slate-900 p-4 border-2 border-slate-900 dark:border-slate-800 shadow-[3px_3px_0px_0px_rgba(15,23,42,1)] dark:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
                    <div className="flex items-center justify-between pb-3 mb-3 border-b-2 border-slate-200 dark:border-slate-800">
                        <div className="flex items-center space-x-1.5">
                            <ShoppingBag className={`w-4 h-4 ${currentTheme.classes.textPrimary}`} />
                            <h2 className="font-extrabold text-sm uppercase text-slate-900 dark:text-white">
                                Transaksi Terakhir Masuk
                            </h2>
                        </div>
                        <Link
                            href="/orders"
                            className={`text-xs font-bold ${currentTheme.classes.textPrimary} hover:opacity-80 flex items-center space-x-1`}
                        >
                            <span>Lihat Semua Transaksi</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                        </Link>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-xs">
                            <thead>
                                <tr className="border-b-2 border-slate-900 dark:border-slate-800 bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-300">
                                    <th className="py-2 px-3 font-black uppercase text-[11px]">No Struk</th>
                                    <th className="py-2 px-3 font-black uppercase text-[11px]">Waktu</th>
                                    <th className="py-2 px-3 font-black uppercase text-[11px]">Tipe / Meja</th>
                                    <th className="py-2 px-3 font-black uppercase text-[11px]">Menu Item</th>
                                    <th className="py-2 px-3 font-black uppercase text-[11px] text-center">Metode</th>
                                    <th className="py-2 px-3 font-black uppercase text-[11px] text-right">Total</th>
                                    <th className="py-2 px-3 font-black uppercase text-[11px] text-center w-24">Struk</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                                {recentOrders.map((order) => (
                                    <tr key={order.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
                                        <td className="py-2 px-3 font-mono font-bold text-slate-900 dark:text-white">
                                            {order.order_number}
                                        </td>
                                        <td className="py-2 px-3 text-slate-600 dark:text-slate-400 font-mono text-[11px]">
                                            {new Date(order.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                                        </td>
                                        <td className="py-2 px-3 font-semibold text-slate-800 dark:text-slate-200">
                                            {order.order_type === 'dine_in'
                                                ? `Meja ${order.table_number || '-'}`
                                                : 'Bungkus'}
                                        </td>
                                        <td className="py-2 px-3 text-slate-700 dark:text-slate-300 max-w-xs truncate">
                                            {(order.items || []).map(i => `${i.quantity}x ${i.product_name}`).join(', ')}
                                        </td>
                                        <td className="py-2 px-3 text-center">
                                            {order.payment_method === 'cash' ? (
                                                <span className={`px-2 py-0.5 ${currentTheme.classes.badge} font-extrabold text-[10px] uppercase`}>
                                                    Cash
                                                </span>
                                            ) : (
                                                <span className="px-2 py-0.5 bg-sky-100 dark:bg-sky-950/80 border border-sky-700 dark:border-sky-600 text-sky-900 dark:text-sky-300 font-extrabold text-[10px] uppercase">
                                                    QRIS
                                                </span>
                                            )}
                                        </td>
                                        <td className="py-2 px-3 text-right font-mono font-black text-slate-900 dark:text-white">
                                            Rp {order.total_amount.toLocaleString('id-ID')}
                                        </td>
                                        <td className="py-2 px-3 text-center">
                                            <button
                                                type="button"
                                                onClick={() => setSelectedOrderForReprint(order)}
                                                className="px-2 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-900 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 hover:text-white dark:hover:text-white border border-slate-900 dark:border-slate-700 font-bold text-[10px] uppercase transition flex items-center justify-center space-x-1 mx-auto"
                                            >
                                                <Printer className="w-3 h-3" />
                                                <span>Cetak</span>
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>

            {/* MODAL CETAK STRUK ULANG */}
            {selectedOrderForReprint && (
                <ThermalReceipt
                    order={selectedOrderForReprint}
                    onClose={() => setSelectedOrderForReprint(null)}
                    isBluetoothConnected={isPrinterConnected()}
                    printerName={getConnectedPrinterName()}
                />
            )}
        </div>
    );
}
