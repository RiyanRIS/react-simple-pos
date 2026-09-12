import React, { useState } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import Navbar from '@/Components/Navbar';
import ThermalReceipt from '@/Components/ThermalReceipt';
import { isPrinterConnected, getConnectedPrinterName } from '@/Utils/BluetoothPrinterHelper';
import { getActiveTheme } from '@/Utils/themeHelper';
import {
    Receipt,
    Search,
    Filter,
    Calendar,
    Printer,
    ChevronLeft,
    ChevronRight,
    ArrowLeft,
    Banknote,
    QrCode,
    X
} from 'lucide-react';

export default function OrdersIndex({ orders, filters }) {
    const { store } = usePage().props;
    const currentTheme = getActiveTheme(store?.theme_color);
    const [search, setSearch] = useState(filters.search || '');
    const [paymentMethod, setPaymentMethod] = useState(filters.payment_method || '');
    const [orderType, setOrderType] = useState(filters.order_type || '');
    const [date, setDate] = useState(filters.date || '');
    const [selectedOrder, setSelectedOrder] = useState(null);

    const handleFilter = (e) => {
        if (e) e.preventDefault();
        router.get('/orders', {
            search: search || undefined,
            payment_method: paymentMethod || undefined,
            order_type: orderType || undefined,
            date: date || undefined,
        }, { preserveState: true, preserveScroll: true });
    };

    const handleReset = () => {
        setSearch('');
        setPaymentMethod('');
        setOrderType('');
        setDate('');
        router.get('/orders', {}, { preserveState: true });
    };

    return (
        <div className="min-h-screen bg-slate-100 dark:bg-slate-950 flex flex-col font-sans text-slate-900 dark:text-slate-100">
            <Head title={`Riwayat Transaksi - ${store?.name || 'Pecel Lele Sedap'}`} />

            <Navbar />

            <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-6 space-y-4">

                {/* Header Riwayat */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 border-2 border-slate-900 dark:border-slate-800 shadow-[3px_3px_0px_0px_rgba(15,23,42,1)] dark:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
                    <div>
                        <div className="flex items-center space-x-2">
                            <span className={`px-2 py-0.5 ${currentTheme.classes.badge} text-[10px] font-extrabold uppercase tracking-wide`}>
                                Data Penjualan
                            </span>
                            <h1 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white tracking-tight uppercase">
                                Riwayat Transaksi & Cetak Ulang Struk
                            </h1>
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-400 font-medium mt-0.5">
                            Cari struk pesanan lama, cetak ulang ke printer Bluetooth 58mm, atau filter per tanggal.
                        </p>
                    </div>

                    <Link
                        href="/pos"
                        className={`px-3 py-2 ${currentTheme.classes.bgPrimary} ${currentTheme.classes.bgPrimaryHover} text-white font-extrabold text-xs uppercase border-2 border-slate-900 dark:border-slate-700 shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] dark:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] flex items-center space-x-1.5 self-start sm:self-auto`}
                    >
                        <ArrowLeft className="w-4 h-4" />
                        <span>Kembali Ke Kasir</span>
                    </Link>
                </div>

                {/* Filter & Search Box (Flat) */}
                <div className="bg-white dark:bg-slate-900 p-4 border-2 border-slate-900 dark:border-slate-800 shadow-[3px_3px_0px_0px_rgba(15,23,42,1)] dark:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
                    <form onSubmit={handleFilter} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5">
                        {/* Search Query */}
                        <div className="relative">
                            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                            <input
                                type="text"
                                placeholder="Cari No Struk / Nama..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-400 dark:border-slate-700 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:border-slate-900 dark:focus:border-slate-500"
                            />
                        </div>

                        {/* Tanggal */}
                        <div>
                            <input
                                type="date"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-400 dark:border-slate-700 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:border-slate-900 dark:focus:border-slate-500"
                            />
                        </div>

                        {/* Metode Bayar */}
                        <div>
                            <select
                                value={paymentMethod}
                                onChange={(e) => setPaymentMethod(e.target.value)}
                                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-400 dark:border-slate-700 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:border-slate-900 dark:focus:border-slate-500"
                            >
                                <option value="">Semua Metode Bayar</option>
                                <option value="cash">Tunai (Cash)</option>
                                <option value="qris">QRIS</option>
                            </select>
                        </div>

                        {/* Tipe Pesanan */}
                        <div>
                            <select
                                value={orderType}
                                onChange={(e) => setOrderType(e.target.value)}
                                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-400 dark:border-slate-700 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:border-slate-900 dark:focus:border-slate-500"
                            >
                                <option value="">Semua Tipe Pesanan</option>
                                <option value="dine_in">Makan di Tempat</option>
                                <option value="takeaway">Bungkus (Takeaway)</option>
                            </select>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex space-x-1.5">
                            <button
                                type="submit"
                                className={`flex-1 py-2 ${currentTheme.classes.bgPrimary} ${currentTheme.classes.bgPrimaryHover} text-white font-extrabold text-xs uppercase border border-slate-900 dark:border-slate-700 transition`}
                            >
                                Filter
                            </button>
                            <button
                                type="button"
                                onClick={handleReset}
                                className="px-3 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs border border-slate-400 dark:border-slate-700 transition"
                            >
                                Reset
                            </button>
                        </div>
                    </form>
                </div>

                {/* Tabel Riwayat Pesanan */}
                <div className="bg-white dark:bg-slate-900 border-2 border-slate-900 dark:border-slate-800 shadow-[3px_3px_0px_0px_rgba(15,23,42,1)] dark:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-xs">
                            <thead>
                                <tr className="border-b-2 border-slate-900 dark:border-slate-800 bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-300">
                                    <th className="py-2.5 px-3 font-black uppercase text-[11px]">No Struk</th>
                                    <th className="py-2.5 px-3 font-black uppercase text-[11px]">Waktu Transaksi</th>
                                    <th className="py-2.5 px-3 font-black uppercase text-[11px]">Kasir</th>
                                    <th className="py-2.5 px-3 font-black uppercase text-[11px]">Pelanggan / Meja</th>
                                    <th className="py-2.5 px-3 font-black uppercase text-[11px]">Rincian Menu</th>
                                    <th className="py-2.5 px-3 font-black uppercase text-[11px] text-center">Metode</th>
                                    <th className="py-2.5 px-3 font-black uppercase text-[11px] text-right">Total Tagihan</th>
                                    <th className="py-2.5 px-3 font-black uppercase text-[11px] text-center w-24">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                                {orders.data.length === 0 ? (
                                    <tr>
                                        <td colSpan="8" className="py-12 text-center text-slate-400 dark:text-slate-500 font-bold">
                                            Tidak ada data transaksi yang cocok dengan filter
                                        </td>
                                    </tr>
                                ) : (
                                    orders.data.map((order) => (
                                        <tr key={order.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
                                            <td className="py-2.5 px-3 font-mono font-bold text-slate-900 dark:text-white">
                                                {order.order_number}
                                            </td>
                                            <td className="py-2.5 px-3 text-slate-600 dark:text-slate-400 font-mono text-[11px]">
                                                {new Date(order.created_at).toLocaleDateString('id-ID', {
                                                    day: 'numeric',
                                                    month: 'short',
                                                    year: 'numeric',
                                                    hour: '2-digit',
                                                    minute: '2-digit',
                                                })}
                                            </td>
                                            <td className="py-2.5 px-3 text-slate-700 dark:text-slate-300">
                                                {order.cashier_name}
                                            </td>
                                            <td className="py-2.5 px-3 font-semibold text-slate-900 dark:text-white">
                                                {order.order_type === 'dine_in'
                                                    ? `Meja ${order.table_number || '-'}`
                                                    : 'Bungkus'}
                                                {order.customer_name && (
                                                    <span className="text-[11px] font-normal text-slate-500 dark:text-slate-400 block">
                                                        {order.customer_name}
                                                    </span>
                                                )}
                                            </td>
                                            <td className="py-2.5 px-3 text-slate-700 dark:text-slate-300 max-w-xs">
                                                {(order.items || []).map(i => `${i.quantity}x ${i.product_name}`).join(', ')}
                                            </td>
                                            <td className="py-2.5 px-3 text-center">
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
                                            <td className="py-2.5 px-3 text-right font-mono font-black text-slate-900 dark:text-white">
                                                Rp {order.total_amount.toLocaleString('id-ID')}
                                            </td>
                                            <td className="py-2.5 px-3 text-center">
                                                <button
                                                    type="button"
                                                    onClick={() => setSelectedOrder(order)}
                                                    className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-900 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 hover:text-white dark:hover:text-white border border-slate-900 dark:border-slate-700 font-bold text-[10px] uppercase transition flex items-center justify-center space-x-1 mx-auto"
                                                >
                                                    <Printer className="w-3 h-3" />
                                                    <span>Struk</span>
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {orders.links && orders.links.length > 3 && (
                        <div className="p-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/80 flex items-center justify-between">
                            <div className="text-xs text-slate-600 dark:text-slate-400">
                                Menampilkan {orders.from || 0} - {orders.to || 0} dari total {orders.total} transaksi
                            </div>
                            <div className="flex items-center space-x-1">
                                {orders.links.map((link, idx) => {
                                    if (!link.url) {
                                        return (
                                            <span
                                                key={idx}
                                                dangerouslySetInnerHTML={{ __html: link.label }}
                                                className="px-2.5 py-1 text-xs text-slate-400 dark:text-slate-600 border border-slate-200 dark:border-slate-800"
                                            />
                                        );
                                    }
                                    return (
                                        <Link
                                            key={idx}
                                            href={link.url}
                                            dangerouslySetInnerHTML={{ __html: link.label }}
                                            className={`px-2.5 py-1 text-xs font-bold border transition ${link.active
                                                    ? `${currentTheme.classes.bgPrimary} text-white border-slate-900 dark:border-slate-700`
                                                    : 'bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border-slate-300 dark:border-slate-700'
                                                }`}
                                        />
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>
            </main>

            {/* MODAL CETAK STRUK */}
            {selectedOrder && (
                <ThermalReceipt
                    order={selectedOrder}
                    onClose={() => setSelectedOrder(null)}
                    isBluetoothConnected={isPrinterConnected()}
                    printerName={getConnectedPrinterName()}
                />
            )}
        </div>
    );
}
