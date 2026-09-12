import React, { useState } from 'react';
import { usePage } from '@inertiajs/react';
import { Printer, CheckCircle, X, AlertTriangle, Bluetooth, FileText, Check, Loader2 } from 'lucide-react';
import { printReceiptESC, triggerBrowserPrint, connectPrinter } from '@/Utils/BluetoothPrinterHelper';
import { getActiveTheme } from '@/Utils/themeHelper';

export default function ThermalReceipt({ order, onClose, isBluetoothConnected, printerName }) {
    if (!order) return null;

    const { store } = usePage().props;
    const currentTheme = getActiveTheme(store?.theme_color);

    const [isPrinting, setIsPrinting] = useState(false);
    const [connectedInfo, setConnectedInfo] = useState({
        connected: isBluetoothConnected,
        name: printerName,
    });
    const [statusMessage, setStatusMessage] = useState(null);

    // Hubungkan printer langsung dari modal
    const handleConnectFromModal = async () => {
        setIsPrinting(true);
        setStatusMessage(null);
        try {
            const res = await connectPrinter();
            setConnectedInfo({ connected: true, name: res.name });
            setStatusMessage({ type: 'success', text: `Berhasil terhubung ke ${res.name}. Siap mencetak!` });
        } catch (err) {
            setStatusMessage({
                type: 'error',
                text: 'Koneksi printer dibatalkan atau perangkat tidak ditemukan.',
            });
        } finally {
            setIsPrinting(false);
        }
    };

    // Cetak ke Printer Bluetooth
    const handlePrintBluetooth = async () => {
        setIsPrinting(true);
        setStatusMessage(null);
        try {
            const res = await printReceiptESC(order, { fallbackToBrowser: false, store });
            if (res.success) {
                setStatusMessage({ type: 'success', text: 'Struk berhasil dikirim ke printer thermal!' });
            } else {
                setStatusMessage({
                    type: 'error',
                    text: res.message || 'Gagal mencetak. Pastikan printer menyala.',
                });
            }
        } catch (err) {
            setStatusMessage({ type: 'error', text: 'Terjadi kendala saat mengirim perintah cetak.' });
        } finally {
            setIsPrinting(false);
        }
    };

    // Cetak via dialog print browser (Manual PDF/Windows Driver)
    const handlePrintBrowser = () => {
        setStatusMessage({ type: 'info', text: 'Membuka dialog cetak browser...' });
        triggerBrowserPrint();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs">
            {/* Modal Box */}
            <div className="bg-white dark:bg-slate-900 w-full max-w-sm border-2 border-slate-900 dark:border-slate-700 shadow-[6px_6px_0px_0px_rgba(15,23,42,1)] dark:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] flex flex-col max-h-[92vh]">
                {/* Header Modal (No Print) */}
                <div className={`no-print flex items-center justify-between px-4 py-3 ${currentTheme.classes.bgPrimary} text-white border-b-2 border-slate-900 dark:border-slate-800`}>
                    <div className="flex items-center space-x-2">
                        <CheckCircle className="w-5 h-5 text-white/90" />
                        <span className="font-extrabold text-xs sm:text-sm tracking-wide uppercase">
                            Transaksi Sukses Tersimpan
                        </span>
                    </div>
                    <button
                        onClick={onClose}
                        title="Tutup (ESC)"
                        className="p-1 hover:bg-black/20 text-white transition"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Banner Kondisi Printer (No Print) */}
                <div className="no-print p-3 border-b border-slate-200 dark:border-slate-800 text-xs">
                    {connectedInfo.connected ? (
                        <div className={`flex items-center space-x-2 ${currentTheme.classes.badge} p-2 border`}>
                            <Check className={`w-4 h-4 ${currentTheme.classes.textPrimary} shrink-0`} />
                            <div className="font-bold truncate">
                                Terhubung ke: <span className="underline">{connectedInfo.name || 'Printer Bluetooth 58mm'}</span>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-1.5 bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 p-2.5 text-amber-900 dark:text-amber-300">
                            <div className="flex items-center space-x-1.5 font-extrabold text-[11px] uppercase tracking-wide text-amber-800 dark:text-amber-400">
                                <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                                <span>Mesin Printer Belum Terdeteksi</span>
                            </div>
                            <div className="text-[11px] text-amber-950 dark:text-amber-200 leading-relaxed">
                                Transaksi sudah tersimpan aman. Jika printer thermal sudah tersedia, silakan koneksikan di bawah atau cetak manual.
                            </div>
                        </div>
                    )}

                    {statusMessage && (
                        <div className={`mt-2 p-2 text-[11px] font-bold border ${statusMessage.type === 'success'
                                ? currentTheme.classes.badge
                                : statusMessage.type === 'error'
                                    ? 'bg-rose-100 dark:bg-rose-950/50 border-rose-400 dark:border-rose-800 text-rose-900 dark:text-rose-300'
                                    : 'bg-sky-100 dark:bg-sky-950/50 border-sky-400 dark:border-sky-800 text-sky-900 dark:text-sky-300'
                            }`}>
                            {statusMessage.text}
                        </div>
                    )}
                </div>

                {/* Struk Thermal View (58mm) - Kertas fisik tetap putih */}
                <div className="p-4 overflow-y-auto bg-slate-100 dark:bg-slate-950 flex justify-center flex-1">
                    <div
                        id="receipt-print-area"
                        className="bg-white p-4 border border-slate-300 w-[58mm] min-w-[58mm] font-mono text-[11px] leading-tight text-slate-900 shadow-sm"
                    >
                        {/* Nama Warung */}
                        <div className="text-center font-bold text-sm mb-0.5 uppercase tracking-wider">
                            {store?.name ? store.name.toUpperCase() : 'PECEL LELE SEDAP'}
                        </div>
                        <div className="text-center text-[10px] text-slate-600 mb-2">
                            {store?.address || 'Jl. Raya Warung Malam No. 12'}<br />
                            {store?.phone ? `Telp / WA: ${store.phone}` : 'Telp / WA: 0812-3456-7890'}
                        </div>

                        <div className="border-t border-dashed border-slate-400 my-2"></div>

                        {/* Info Transaksi */}
                        <div className="space-y-0.5 text-[10px]">
                            <div className="flex justify-between">
                                <span>No Struk:</span>
                                <span className="font-bold">{order.order_number}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Waktu:</span>
                                <span>{new Date(order.created_at || Date.now()).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Kasir:</span>
                                <span>{order.cashier_name || 'Kasir'}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Tipe:</span>
                                <span className="font-bold">{order.order_type === 'dine_in' ? 'Makan di Tempat' : 'Bungkus / Bawa'}</span>
                            </div>
                            {order.table_number && (
                                <div className="flex justify-between font-bold">
                                    <span>No Meja:</span>
                                    <span>Meja {order.table_number}</span>
                                </div>
                            )}
                            {order.customer_name && (
                                <div className="flex justify-between">
                                    <span>Pelanggan:</span>
                                    <span>{order.customer_name}</span>
                                </div>
                            )}
                        </div>

                        <div className="border-t border-dashed border-slate-400 my-2"></div>

                        {/* Rincian Menu */}
                        <div className="space-y-1.5 mb-2">
                            {(order.items || []).map((item, idx) => (
                                <div key={idx} className="text-[10px]">
                                    <div className="flex justify-between items-start">
                                        <span className="font-semibold pr-1">
                                            {item.quantity}x {item.product_name || item.name}
                                        </span>
                                        <span className="font-mono whitespace-nowrap">
                                            Rp {(item.subtotal || (item.unit_price * item.quantity)).toLocaleString('id-ID')}
                                        </span>
                                    </div>
                                    {item.notes && (
                                        <div className="text-[9px] text-slate-500 pl-3 italic">
                                            * {item.notes}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>

                        <div className="border-t border-dashed border-slate-400 my-2"></div>

                        {/* Total & Kembalian */}
                        <div className="space-y-1 text-[11px]">
                            <div className="flex justify-between font-bold text-xs pt-0.5">
                                <span>TOTAL</span>
                                <span>Rp {order.total_amount.toLocaleString('id-ID')}</span>
                            </div>

                            {order.payment_method === 'cash' ? (
                                <>
                                    <div className="flex justify-between text-[10px]">
                                        <span>TUNAI</span>
                                        <span>Rp {(order.cash_received || order.total_amount).toLocaleString('id-ID')}</span>
                                    </div>
                                    <div className="flex justify-between text-[10px] font-bold">
                                        <span>KEMBALI</span>
                                        <span>Rp {(order.change_returned || 0).toLocaleString('id-ID')}</span>
                                    </div>
                                </>
                            ) : (
                                <div className={`flex justify-between text-[10px] font-bold ${currentTheme.classes.textPrimary}`}>
                                    <span>METODE</span>
                                    <span>QRIS (LUNAS)</span>
                                </div>
                            )}
                        </div>

                        <div className="border-t border-dashed border-slate-400 my-2"></div>

                        {/* Footer Struk */}
                        <div className="text-center text-[10px] text-slate-600 mt-2 space-y-0.5 whitespace-pre-line">
                            {store?.receipt_footer || "Matur Nuwun / Terima Kasih\nSelamat Menikmati Hidangan Kami"}
                        </div>
                    </div>
                </div>

                {/* Footer Modal Action Buttons (No Print) */}
                <div className="no-print p-3 bg-white dark:bg-slate-900 border-t-2 border-slate-900 dark:border-slate-800 flex flex-col gap-2">
                    {connectedInfo.connected ? (
                        /* Kondisi: Printer Bluetooth Terdeteksi & Terhubung */
                        <button
                            type="button"
                            onClick={handlePrintBluetooth}
                            disabled={isPrinting}
                            className={`w-full flex items-center justify-center space-x-2 py-3 ${currentTheme.classes.bgPrimary} ${currentTheme.classes.bgPrimaryHover} active:opacity-90 text-white font-black text-xs sm:text-sm uppercase tracking-wide border-2 border-slate-900 dark:border-slate-700 shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] dark:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5 transition`}
                        >
                            {isPrinting ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <Printer className="w-4 h-4" />
                            )}
                            <span>{isPrinting ? 'Mengirim Data...' : `Cetak ke ${connectedInfo.name || 'Printer 58mm'}`}</span>
                        </button>
                    ) : (
                        /* Kondisi: Printer BELUM Terdeteksi / Belum Terpasang */
                        <div className="space-y-2">
                            <div className="grid grid-cols-2 gap-2">
                                <button
                                    type="button"
                                    onClick={handleConnectFromModal}
                                    disabled={isPrinting}
                                    className={`py-2.5 px-2 ${currentTheme.classes.bgPrimaryLight} hover:opacity-90 ${currentTheme.classes.textPrimaryDark} font-bold text-[11px] border-2 border-slate-900 dark:border-slate-700 shadow-[1px_1px_0px_0px_rgba(15,23,42,1)] dark:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5 transition flex items-center justify-center space-x-1.5`}
                                >
                                    <Bluetooth className={`w-3.5 h-3.5 ${currentTheme.classes.textPrimary}`} />
                                    <span>Konek Bluetooth</span>
                                </button>

                                <button
                                    type="button"
                                    onClick={handlePrintBrowser}
                                    className="py-2.5 px-2 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-[11px] border-2 border-slate-900 dark:border-slate-700 shadow-[1px_1px_0px_0px_rgba(15,23,42,1)] dark:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5 transition flex items-center justify-center space-x-1.5"
                                >
                                    <FileText className="w-3.5 h-3.5 text-slate-600 dark:text-slate-400" />
                                    <span>Cetak via PDF/PC</span>
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Tombol Selesai / Transaksi Baru */}
                    <button
                        type="button"
                        onClick={onClose}
                        className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 text-white font-extrabold text-xs uppercase tracking-wide border-2 border-slate-900 dark:border-slate-700 shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] dark:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5 transition"
                    >
                        Tutup & Transaksi Baru
                    </button>
                </div>
            </div>
        </div>
    );
}
