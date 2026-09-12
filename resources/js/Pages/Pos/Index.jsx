import React, { useState, useMemo, useEffect } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import Navbar from '@/Components/Navbar';
import ThermalReceipt from '@/Components/ThermalReceipt';
import {
    Search,
    Plus,
    Minus,
    Trash2,
    ShoppingBag,
    Utensils,
    Fish,
    Flame,
    CupSoda,
    Egg,
    UtensilsCrossed,
    QrCode,
    Banknote,
    Check,
    Printer,
    Tag,
    X,
    MessageSquare,
    AlertTriangle,
    CheckCircle2,
    ArrowRight
} from 'lucide-react';
import { isPrinterConnected, getConnectedPrinterName, printReceiptESC } from '@/Utils/BluetoothPrinterHelper';
import { getCategoryIcon } from '@/Utils/categoryIcons';
import { getActiveTheme } from '@/Utils/themeHelper';

const PRESET_NOTES = [
    'Sambal Terasi Sedang',
    'Sambal Bawang Pedas',
    'Sambal Pisah',
    'Goreng Kering / Garing',
    'Kurang Manis',
    'Tanpa Es',
];

const INDONESIAN_BILLS = [
    { label: '100rb', value: 100000, color: 'bg-rose-50 border-rose-800 text-rose-950 hover:bg-rose-100' },
    { label: '50rb', value: 50000, color: 'bg-sky-50 border-sky-800 text-sky-950 hover:bg-sky-100' },
    { label: '20rb', value: 20000, color: 'bg-emerald-50 border-emerald-800 text-emerald-950 hover:bg-emerald-100' },
    { label: '10rb', value: 10000, color: 'bg-purple-50 border-purple-800 text-purple-950 hover:bg-purple-100' },
    { label: '5rb', value: 5000, color: 'bg-amber-50 border-amber-800 text-amber-950 hover:bg-amber-100' },
    { label: '2rb', value: 2000, color: 'bg-slate-100 border-slate-700 text-slate-900 hover:bg-slate-200' },
];

export default function PosIndex({ categories, todaySummary, recentOrders }) {
    const { flash, store } = usePage().props;
    const currentTheme = getActiveTheme(store?.theme_color);

    // State Filter & Search
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');

    // State Keranjang (Cart)
    const [cart, setCart] = useState([]);
    const [orderType, setOrderType] = useState('dine_in'); // dine_in, takeaway
    const [tableNumber, setTableNumber] = useState('');
    const [customerName, setCustomerName] = useState('');

    // State Modal Catatan Item
    const [editingNoteItem, setEditingNoteItem] = useState(null);
    const [customNoteText, setCustomNoteText] = useState('');

    // State Modal Checkout Pembayaran
    const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState('cash'); // cash, qris
    const [cashReceivedInput, setCashReceivedInput] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // State Struk & Deteksi Printer
    const [completedOrder, setCompletedOrder] = useState(null);
    const [printerInfo, setPrinterInfo] = useState({ connected: false, name: null });
    const [autoPrintReceipt, setAutoPrintReceipt] = useState(false);
    const [showThermalReceipt, setShowThermalReceipt] = useState(false);
    const [transactionError, setTransactionError] = useState(null);

    // Cek status printer saat inisialisasi & dengarkan perubahan koneksi
    useEffect(() => {
        const isConn = isPrinterConnected();
        const name = getConnectedPrinterName();
        setPrinterInfo({ connected: isConn, name });
        const autoPrint = isConn && (store?.receipt_auto_print ?? false);
        setAutoPrintReceipt(autoPrint);

        const handleStatusChanged = (e) => {
            if (e?.detail) {
                setPrinterInfo(e.detail);
                if (e.detail.connected) {
                    setAutoPrintReceipt(true);
                }
            }
        };

        window.addEventListener('printer-status-changed', handleStatusChanged);
        return () => window.removeEventListener('printer-status-changed', handleStatusChanged);
    }, []);

    // Handle flash success dari backend setelah order disimpan
    useEffect(() => {
        if (flash?.success?.order) {
            const savedOrder = flash.success.order;
            setCompletedOrder(savedOrder);
            // Reset keranjang belanja setelah sukses
            setCart([]);
            setTableNumber('');
            setCustomerName('');
            setIsCheckoutOpen(false);

            // Jika printer aktif dan kasir memilih cetak, cetak via thermal ESC/POS
            if (printerInfo.connected && autoPrintReceipt) {
                setShowThermalReceipt(true);
                printReceiptESC(savedOrder, { fallbackToBrowser: false });
            } else {
                // Jika printer TIDAK terdeteksi: jangan buka dialog thermal print yang bikin stuck!
                setShowThermalReceipt(false);
            }
        }
    }, [flash, printerInfo.connected, autoPrintReceipt]);

    // Flat list produk dengan info kategori
    const allProducts = useMemo(() => {
        const list = [];
        categories.forEach(cat => {
            cat.products.forEach(p => {
                list.push({
                    ...p,
                    categorySlug: cat.slug,
                    categoryName: cat.name,
                });
            });
        });
        return list;
    }, [categories]);

    // Filter produk berdasarkan kategori dan pencarian
    const filteredProducts = useMemo(() => {
        return allProducts.filter(product => {
            const matchCategory = selectedCategory === 'all' || product.categorySlug === selectedCategory;
            const matchSearch = searchQuery === '' ||
                product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (product.code && product.code.toLowerCase().includes(searchQuery.toLowerCase()));
            return matchCategory && matchSearch;
        });
    }, [allProducts, selectedCategory, searchQuery]);

    // Hitung Total Keranjang
    const cartSummary = useMemo(() => {
        let total = 0;
        let totalItems = 0;
        cart.forEach(item => {
            total += item.price * item.quantity;
            totalItems += item.quantity;
        });
        return { total, totalItems };
    }, [cart]);

    // Tambah Produk ke Keranjang
    const addToCart = (product) => {
        if (product.is_available === false) return;
        setCart(prev => {
            const existingIndex = prev.findIndex(item => item.id === product.id && !item.notes);
            if (existingIndex > -1) {
                const updated = [...prev];
                updated[existingIndex].quantity += 1;
                return updated;
            }
            return [...prev, {
                id: product.id,
                name: product.name,
                price: product.price,
                cost_price: product.cost_price,
                quantity: 1,
                notes: '',
            }];
        });
    };

    // Update Kuantitas
    const updateQuantity = (index, delta) => {
        setCart(prev => {
            const updated = [...prev];
            const newQty = updated[index].quantity + delta;
            if (newQty <= 0) {
                return updated.filter((_, i) => i !== index);
            }
            updated[index].quantity = newQty;
            return updated;
        });
    };

    // Hapus Item
    const removeFromCart = (index) => {
        setCart(prev => prev.filter((_, i) => i !== index));
    };

    // Buka Modal Catatan
    const openNotesModal = (index) => {
        setEditingNoteItem(index);
        setCustomNoteText(cart[index].notes || '');
    };

    // Simpan Catatan Item
    const saveNote = (noteText) => {
        if (editingNoteItem === null) return;
        setCart(prev => {
            const updated = [...prev];
            updated[editingNoteItem].notes = noteText;
            return updated;
        });
        setEditingNoteItem(null);
        setCustomNoteText('');
    };

    // Cek kuantitas item dalam keranjang
    const getItemCartCount = (productId) => {
        return cart
            .filter(item => item.id === productId)
            .reduce((sum, item) => sum + item.quantity, 0);
    };

    // Buka Modal Pembayaran
    const handleOpenCheckout = () => {
        if (cart.length === 0) return;
        setCashReceivedInput(cartSummary.total.toString());
        // Default cetak struk hanya aktif jika printer terdeteksi
        setAutoPrintReceipt(printerInfo.connected);
        setIsCheckoutOpen(true);
    };

    // Perhitungan Kembalian
    const cashReceivedNum = parseInt(cashReceivedInput, 10) || 0;
    const changeAmount = Math.max(0, cashReceivedNum - cartSummary.total);
    const isCashShort = paymentMethod === 'cash' && cashReceivedNum < cartSummary.total;

    // Rekomendasi uang pas & pembulatan pecahan nominal pintar
    const quickCashOptions = useMemo(() => {
        const total = cartSummary.total;
        if (total <= 0) return [];

        const set = new Set();
        set.add(total); // Uang pas

        // Pembulatan ke 5.000 terdekat (misal 68k -> 70k)
        const round5k = Math.ceil(total / 5000) * 5000;
        if (round5k > total) set.add(round5k);

        // Pembulatan ke 10.000 terdekat
        const round10k = Math.ceil(total / 10000) * 10000;
        if (round10k > total) set.add(round10k);

        // Pembulatan ke 20.000 terdekat
        const round20k = Math.ceil(total / 20000) * 20000;
        if (round20k > total) set.add(round20k);

        // Pembulatan ke 50.000 terdekat
        const round50k = Math.ceil(total / 50000) * 50000;
        if (round50k > total) set.add(round50k);

        // Standar pecahan lembaran (10k, 20k, 50k, 100k)
        [10000, 20000, 50000, 100000].forEach(denom => {
            if (denom > total) set.add(denom);
        });

        // Tambahkan pecahan 100k di atasnya jika total > 100k
        if (total > 100000) {
            const nextHundred = Math.ceil(total / 100000) * 100000;
            if (!set.has(nextHundred)) set.add(nextHundred);
        }

        return Array.from(set).sort((a, b) => a - b).slice(0, 6);
    }, [cartSummary.total]);

    // Tambah lembaran pecahan uang
    const handleAddBill = (amount) => {
        setCashReceivedInput(prev => {
            const current = parseInt(prev, 10) || 0;
            // Jika nilai masih default uang pas, ganti langsung dengan pecahan pertama yang diklik
            if (current === cartSummary.total) {
                return amount.toString();
            }
            return (current + amount).toString();
        });
    };

    // Kosongkan nominal uang
    const handleClearCash = () => {
        setCashReceivedInput('0');
    };

    // Submit Transaksi ke Backend
    const handleProcessOrder = (e) => {
        e.preventDefault();
        if (isCashShort || isSubmitting) return;

        setIsSubmitting(true);

        const currentTotal = cartSummary.total;
        const currentCashReceived = paymentMethod === 'cash' ? cashReceivedNum : currentTotal;
        const currentChange = Math.max(0, currentCashReceived - currentTotal);
        const currentItems = cart.map(item => ({
            ...item,
            product_id: item.id,
            product_name: item.name,
            subtotal: item.price * item.quantity,
            quantity: item.quantity,
            notes: item.notes || null,
        }));
        const currentOrderType = orderType;
        const currentTable = tableNumber;
        const currentCustomer = customerName;
        const currentPaymentMethod = paymentMethod;

        const payload = {
            order_type: currentOrderType,
            customer_name: currentCustomer || null,
            table_number: currentOrderType === 'dine_in' ? (currentTable || null) : null,
            payment_method: currentPaymentMethod,
            cash_received: currentCashReceived,
            items: currentItems.map(i => ({
                product_id: i.product_id,
                quantity: i.quantity,
                notes: i.notes,
            })),
        };

        router.post('/pos/orders', payload, {
            preserveScroll: true,
            onSuccess: (page) => {
                setIsSubmitting(false);
                const savedOrder = page.props?.flash?.success?.order
                    || (page.props?.flash?.success?.id ? page.props?.flash?.success : null)
                    || {
                    order_number: 'PL-' + new Date().toISOString().slice(0, 10).replace(/-/g, '') + '-OK',
                    total_amount: currentTotal,
                    payment_method: currentPaymentMethod,
                    cash_received: currentCashReceived,
                    change_returned: currentChange,
                    order_type: currentOrderType,
                    table_number: currentTable,
                    customer_name: currentCustomer,
                    items: currentItems,
                    created_at: new Date().toISOString(),
                };

                setCompletedOrder(savedOrder);
                setCart([]);
                setTableNumber('');
                setCustomerName('');
                setIsCheckoutOpen(false);

                if (printerInfo.connected && autoPrintReceipt) {
                    setShowThermalReceipt(true);
                    printReceiptESC(savedOrder, { fallbackToBrowser: false, store });
                } else {
                    setShowThermalReceipt(false);
                }
            },
            onError: (errs) => {
                setIsSubmitting(false);
                console.error('Error saat menyimpan transaksi:', errs);
                const firstError = typeof errs === 'object' && errs !== null ? Object.values(errs)[0] : null;
                setTransactionError(firstError || 'Gagal menyimpan transaksi. Silakan periksa kelengkapan item pesanan atau koneksi internet warung Anda.');
            },
            onFinish: () => setIsSubmitting(false),
        });
    };

    return (
        <div className="h-screen h-[100dvh] bg-slate-100 dark:bg-slate-950 flex flex-col font-sans overflow-hidden">
            <Head title={`Kasir POS - ${store?.name || 'Pecel Lele Sedap'}`} />

            {/* Navbar Utama */}
            <Navbar onPrinterStatusChange={setPrinterInfo} />

            {/* Alert Error / Otorisasi Terbatas */}
            {flash?.error && (
                <div className="max-w-7xl w-full mx-auto px-2 sm:px-3 pt-2 shrink-0">
                    <div className="p-2.5 bg-rose-50 dark:bg-rose-950/50 border-2 border-slate-900 dark:border-slate-700 shadow-[3px_3px_0px_0px_rgba(15,23,42,1)] dark:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] flex items-center justify-between text-rose-950 dark:text-rose-200 text-xs font-bold">
                        <div className="flex items-center space-x-2">
                            <AlertTriangle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
                            <span>{flash.error}</span>
                        </div>
                    </div>
                </div>
            )}

            {/* Body Area: Split 2 Kolom (Katalog Menu & Keranjang Kasir) */}
            <div className="flex-1 min-h-0 flex flex-col md:flex-row overflow-hidden max-w-7xl w-full mx-auto p-2 sm:p-3 gap-2 sm:gap-3">

                {/* KOLOM KIRI & TENGAH: KATALOG MENU (TOUCH-FRIENDLY & FLAT) */}
                <div className="flex-1 min-h-0 flex flex-col min-w-0 bg-white dark:bg-slate-900 border-2 border-slate-900 dark:border-slate-800 shadow-[3px_3px_0px_0px_rgba(15,23,42,1)] dark:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] p-2.5 sm:p-3 overflow-hidden">

                    {/* Header Pencarian & Summary Singkat */}
                    <div className="shrink-0 flex flex-col sm:flex-row gap-2 items-stretch sm:items-center justify-between pb-2.5 border-b-2 border-slate-200 dark:border-slate-800">
                        {/* Search Bar Flat */}
                        <div className="relative flex-1">
                            <Search className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Cari menu lele, ayam, nasi, sambal, es teh..."
                                className="w-full pl-10 pr-3 py-2.5 bg-slate-50 dark:bg-slate-800 border-2 border-slate-900 dark:border-slate-700 text-sm font-semibold placeholder-slate-400 dark:placeholder-slate-500 text-slate-900 dark:text-white focus:outline-none focus:bg-white dark:focus:bg-slate-800 focus:border-slate-900 dark:focus:border-slate-600 transition"
                            />
                            {searchQuery && (
                                <button
                                    onClick={() => setSearchQuery('')}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            )}
                        </div>

                        {/* Kasir Quick Stats */}
                        <div className={`hidden sm:flex items-center space-x-3 px-3 py-2 ${currentTheme.classes.bgPrimaryLight} border-2 border-slate-900 dark:border-slate-700 text-xs ${currentTheme.classes.textPrimaryDark} font-bold shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] dark:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]`}>
                            <div>
                                Hari Ini: <span className={`font-mono ${currentTheme.classes.textPrimary}`}>{todaySummary.count}</span> Transaksi
                            </div>
                            <div className="h-4 w-px bg-slate-300 dark:bg-slate-700"></div>
                            <div>
                                Rp <span className={`font-mono ${currentTheme.classes.textPrimary}`}>{todaySummary.total.toLocaleString('id-ID')}</span>
                            </div>
                        </div>
                    </div>

                    {/* Filter Kategori Menu - Tombol Kotak Rata (Flat Boxy Buttons) */}
                    <div className="shrink-0 flex items-center space-x-2 py-2 overflow-x-auto no-scrollbar border-b border-slate-200 dark:border-slate-800">
                        <button
                            type="button"
                            onClick={() => setSelectedCategory('all')}
                            className={`flex items-center space-x-1.5 px-3 py-2 text-xs font-extrabold tracking-wide uppercase border-2 border-slate-900 dark:border-slate-700 shrink-0 transition ${selectedCategory === 'all'
                                ? `${currentTheme.classes.bgPrimary} text-white shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] dark:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]`
                                : 'bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200'
                                }`}
                        >
                            <span>Semua Menu</span>
                            <span className={`px-1.5 py-0.2 text-[10px] font-mono ${selectedCategory === 'all' ? 'bg-black/25 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'}`}>
                                {allProducts.length}
                            </span>
                        </button>

                        {categories.map((cat) => {
                            const IconComponent = getCategoryIcon(cat);
                            const isSelected = selectedCategory === cat.slug;
                            return (
                                <button
                                    key={cat.id}
                                    type="button"
                                    onClick={() => setSelectedCategory(cat.slug)}
                                    className={`flex items-center space-x-1.5 px-3 py-2 text-xs font-extrabold tracking-wide uppercase border-2 border-slate-900 dark:border-slate-700 shrink-0 transition ${isSelected
                                        ? `${currentTheme.classes.bgPrimary} text-white shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] dark:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]`
                                        : 'bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200'
                                        }`}
                                >
                                    <IconComponent className="w-3.5 h-3.5" />
                                    <span>{cat.name}</span>
                                    <span className={`px-1.5 py-0.2 text-[10px] font-mono ${isSelected ? 'bg-black/25 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'}`}>
                                        {cat.products.length}
                                    </span>
                                </button>
                            );
                        })}
                    </div>

                    {/* Grid Daftar Menu (Flat Box Cards) */}
                    <div className="flex-1 min-h-0 overflow-y-auto pt-2.5 pr-1 pb-2">
                        {filteredProducts.length === 0 ? (
                            <div className="text-center py-16 text-slate-400">
                                <Utensils className="w-12 h-12 mx-auto mb-2 text-slate-300" />
                                <div className="font-bold text-sm">Menu tidak ditemukan</div>
                                <div className="text-xs">Coba cari dengan kata kunci lain</div>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-2.5 sm:gap-3">
                                {filteredProducts.map((product) => {
                                    const inCartCount = getItemCartCount(product.id);
                                    const isAvailable = product.is_available !== false;
                                    return (
                                        <div
                                            key={product.id}
                                            onClick={() => isAvailable && addToCart(product)}
                                            className={`relative flex flex-col justify-between p-3 border-2 border-slate-900 dark:border-slate-700 select-none transition ${!isAvailable
                                                    ? 'bg-slate-100/90 dark:bg-slate-800/50 border-slate-400 dark:border-slate-700 opacity-80 cursor-not-allowed'
                                                    : inCartCount > 0
                                                        ? `${currentTheme.classes.bgPrimaryLight} border-slate-900 dark:border-slate-600 shadow-[3px_3px_0px_0px_rgba(15,23,42,1)] dark:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] cursor-pointer`
                                                        : 'bg-white dark:bg-slate-800/90 hover:bg-slate-50 dark:hover:bg-slate-700/80 hover:translate-y-[-1px] shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] dark:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-0 cursor-pointer'
                                                }`}
                                        >
                                            {/* Badge Overlay Habis / Kosong */}
                                            {!isAvailable && (
                                                <div className="absolute inset-0 bg-slate-900/20 backdrop-blur-[0.5px] flex items-center justify-center pointer-events-none z-10">
                                                    <span className="px-2.5 py-1 bg-rose-600 text-white font-black text-[11px] uppercase tracking-wider border-2 border-slate-900 dark:border-slate-700 shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] -rotate-6">
                                                        Habis / Kosong
                                                    </span>
                                                </div>
                                            )}

                                            {/* Quantity Badge jika sudah di keranjang */}
                                            {inCartCount > 0 && isAvailable && (
                                                <div className={`absolute -top-2 -right-2 w-6 h-6 ${currentTheme.classes.bgPrimary} border-2 border-slate-900 dark:border-slate-700 text-white font-extrabold text-xs flex items-center justify-center shadow-xs`}>
                                                    {inCartCount}
                                                </div>
                                            )}

                                            <div>
                                                {/* Kode Produk */}
                                                <div className="flex items-center justify-between mb-1">
                                                    <span className={`text-[10px] font-bold font-mono px-1.5 py-0.5 border ${!isAvailable ? 'bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400 border-slate-300 dark:border-slate-600' : 'bg-slate-100 dark:bg-slate-700/70 border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-300'
                                                        } uppercase`}>
                                                        {product.code || 'MENU'}
                                                    </span>
                                                    <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">
                                                        {product.categoryName}
                                                    </span>
                                                </div>

                                                {/* Nama Menu */}
                                                <div className={`font-bold text-xs sm:text-sm leading-snug line-clamp-2 mb-1 ${!isAvailable ? 'text-slate-500 line-through decoration-rose-500 decoration-2' : 'text-slate-900 dark:text-white'
                                                    }`}>
                                                    {product.name}
                                                </div>

                                                {/* Keterangan singkat */}
                                                {product.description && (
                                                    <div className="text-[10px] text-slate-500 dark:text-slate-400 line-clamp-1 mb-2">
                                                        {product.description}
                                                    </div>
                                                )}
                                            </div>

                                             {/* Harga & Tombol Tambah */}
                                            <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-slate-700 mt-2">
                                                <div className={`font-extrabold text-xs sm:text-sm font-mono ${!isAvailable ? 'text-slate-400 line-through' : currentTheme.classes.textPrimary
                                                    }`}>
                                                    Rp {product.price.toLocaleString('id-ID')}
                                                </div>
                                                {isAvailable ? (
                                                    <div className={`w-6 h-6 bg-slate-900 dark:bg-slate-700 text-white flex items-center justify-center text-xs font-bold hover:${currentTheme.classes.bgPrimary} transition`}>
                                                        <Plus className="w-3.5 h-3.5" />
                                                    </div>
                                                ) : (
                                                    <div className="px-1.5 py-0.5 bg-rose-100 dark:bg-rose-950/60 border border-rose-400 dark:border-rose-800 text-rose-800 dark:text-rose-300 font-extrabold text-[9px] uppercase tracking-wider">
                                                        Habis
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>

                {/* KOLOM KANAN: PANEL KERANJANG KASIR (DRAWER CART) */}
                <div className="w-full md:w-80 lg:w-96 shrink-0 h-full min-h-0 flex flex-col bg-white dark:bg-slate-900 border-2 border-slate-900 dark:border-slate-800 shadow-[3px_3px_0px_0px_rgba(15,23,42,1)] dark:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] overflow-hidden">

                    {/* Header Keranjang & Opsi Dine-in / Takeaway */}
                    <div className="shrink-0 p-2.5 sm:p-3 bg-slate-50 dark:bg-slate-800/80 border-b-2 border-slate-900 dark:border-slate-800">
                        <div className="flex items-center justify-between mb-2.5">
                            <div className="flex items-center space-x-1.5 font-extrabold text-slate-900 dark:text-white text-sm uppercase tracking-wide">
                                <ShoppingBag className={`w-4 h-4 ${currentTheme.classes.textPrimary}`} />
                                <span>Keranjang Pesanan</span>
                            </div>
                            {cart.length > 0 && (
                                <button
                                    type="button"
                                    onClick={() => setCart([])}
                                    className="text-[11px] font-bold text-rose-600 dark:text-rose-400 hover:text-rose-800 flex items-center space-x-1"
                                >
                                    <Trash2 className="w-3 h-3" />
                                    <span>Hapus Semua</span>
                                </button>
                            )}
                        </div>

                        {/* Switch Dine In vs Takeaway */}
                        <div className="grid grid-cols-2 gap-1.5 mb-2.5">
                            <button
                                type="button"
                                onClick={() => setOrderType('dine_in')}
                                className={`py-1.5 text-xs font-extrabold uppercase border-2 border-slate-900 dark:border-slate-700 transition ${orderType === 'dine_in'
                                    ? `${currentTheme.classes.bgPrimary} text-white shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] dark:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]`
                                    : 'bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200'
                                    }`}
                            >
                                Makan di Tempat
                            </button>
                            <button
                                type="button"
                                onClick={() => setOrderType('takeaway')}
                                className={`py-1.5 text-xs font-extrabold uppercase border-2 border-slate-900 dark:border-slate-700 transition ${orderType === 'takeaway'
                                    ? `${currentTheme.classes.bgPrimary} text-white shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] dark:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]`
                                    : 'bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200'
                                    }`}
                            >
                                Bungkus / Bawa
                            </button>
                        </div>

                        {/* Input No Meja & Nama Pelanggan (Flat) */}
                        <div className={store?.enable_table_number === false ? "w-full" : "grid grid-cols-2 gap-1.5"}>
                            {store?.enable_table_number !== false && (
                                orderType === 'dine_in' ? (
                                    <div>
                                        <input
                                            type="text"
                                            placeholder="No Meja (mis: 04)"
                                            value={tableNumber}
                                            onChange={(e) => setTableNumber(e.target.value)}
                                            className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-800 border border-slate-400 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-slate-900 dark:focus:border-slate-500"
                                        />
                                    </div>
                                ) : (
                                    <div>
                                        <span className="inline-block w-full py-1.5 px-2 bg-slate-200 dark:bg-slate-700 text-[11px] font-bold text-slate-600 dark:text-slate-300 border border-slate-300 dark:border-slate-600 text-center uppercase">
                                            Takeaway
                                        </span>
                                    </div>
                                )
                            )}

                            <div>
                                <input
                                    type="text"
                                    placeholder={store?.enable_table_number === false ? "Nama Pelanggan / No Antrean (Opsional)" : "Nama (Opsional)"}
                                    value={customerName}
                                    onChange={(e) => setCustomerName(e.target.value)}
                                    className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-800 border border-slate-400 dark:border-slate-700 text-xs font-semibold text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-slate-900 dark:focus:border-slate-500"
                                />
                            </div>
                        </div>
                    </div>

                    {/* List Item dalam Keranjang */}
                    <div className="flex-1 min-h-0 overflow-y-auto p-2.5 space-y-2">
                        {cart.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 text-center py-10">
                                <ShoppingBag className="w-10 h-10 mb-2 stroke-1 text-slate-300 dark:text-slate-600" />
                                <div className="text-xs font-bold text-slate-500 dark:text-slate-400">Keranjang masih kosong</div>
                                <div className="text-[11px]">Pilih menu di sebelah kiri untuk menambah pesanan</div>
                            </div>
                        ) : (
                            cart.map((item, idx) => (
                                <div
                                    key={idx}
                                    className="p-2.5 bg-white dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 flex flex-col gap-1.5 text-xs select-none"
                                >
                                    {/* Baris Atas: Nama & Harga */}
                                    <div className="flex items-start justify-between">
                                        <div className="font-bold text-slate-900 dark:text-white text-xs pr-2">
                                            {item.name}
                                        </div>
                                        <div className="font-extrabold text-slate-900 dark:text-white font-mono shrink-0">
                                            Rp {(item.price * item.quantity).toLocaleString('id-ID')}
                                        </div>
                                    </div>

                                    {/* Catatan Kustom (Sambal, Goreng kering, dll) */}
                                    {item.notes ? (
                                        <div
                                            onClick={() => openNotesModal(idx)}
                                            className={`text-[10px] ${currentTheme.classes.badge} px-2 py-0.5 border cursor-pointer hover:opacity-90 flex items-center justify-between`}
                                        >
                                            <span className="font-semibold italic truncate">Catatan: {item.notes}</span>
                                            <span className="opacity-70 hover:opacity-100">ubah</span>
                                        </div>
                                    ) : (
                                        <button
                                            type="button"
                                            onClick={() => openNotesModal(idx)}
                                            className={`text-[10px] text-slate-500 dark:text-slate-400 hover:${currentTheme.classes.textPrimary} flex items-center space-x-1 w-fit`}
                                        >
                                            <MessageSquare className="w-3 h-3" />
                                            <span>+ Tambah Catatan (Sambal/Pedas)</span>
                                        </button>
                                    )}

                                    {/* Baris Bawah: Counter Qty & Hapus */}
                                    <div className="flex items-center justify-between pt-1 border-t border-slate-100 dark:border-slate-700">
                                        <div className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                                            @ Rp {item.price.toLocaleString('id-ID')}
                                        </div>

                                        <div className="flex items-center space-x-1">
                                            <button
                                                type="button"
                                                onClick={() => updateQuantity(idx, -1)}
                                                className="w-6 h-6 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-600 font-bold flex items-center justify-center active:scale-95"
                                            >
                                                <Minus className="w-3 h-3" />
                                            </button>
                                            <span className="w-7 text-center font-bold font-mono text-xs text-slate-900 dark:text-white">
                                                {item.quantity}
                                            </span>
                                            <button
                                                type="button"
                                                onClick={() => updateQuantity(idx, 1)}
                                                className="w-6 h-6 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-600 font-bold flex items-center justify-center active:scale-95"
                                            >
                                                <Plus className="w-3 h-3" />
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => removeFromCart(idx)}
                                                className="p-1 text-slate-400 hover:text-rose-600 ml-1"
                                                title="Hapus"
                                            >
                                                <X className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Ringkasan Subtotal & Tombol Checkout */}
                    <div className="shrink-0 p-2.5 sm:p-3 bg-slate-50 dark:bg-slate-800/80 border-t-2 border-slate-900 dark:border-slate-800">
                        <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400 mb-1">
                            <span>Jumlah Porsi</span>
                            <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{cartSummary.totalItems} item</span>
                        </div>
                        <div className="flex items-center justify-between text-sm font-extrabold text-slate-900 dark:text-white mb-3 pt-1 border-t border-slate-200 dark:border-slate-700">
                            <span>TOTAL TAGIHAN</span>
                            <span className={`${currentTheme.classes.textPrimary} font-mono text-base font-black`}>
                                Rp {cartSummary.total.toLocaleString('id-ID')}
                            </span>
                        </div>

                        {/* Tombol Besar Bayar (Touch Friendly) */}
                        <button
                            type="button"
                            disabled={cart.length === 0}
                            onClick={handleOpenCheckout}
                            className={`w-full py-3.5 px-4 font-extrabold text-sm uppercase tracking-wide border-2 border-slate-900 dark:border-slate-700 shadow-[3px_3px_0px_0px_rgba(15,23,42,1)] dark:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5 transition flex items-center justify-center space-x-2 ${cart.length === 0
                                ? 'bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-600 border-slate-400 dark:border-slate-700 shadow-none cursor-not-allowed'
                                : `${currentTheme.classes.bgPrimary} ${currentTheme.classes.bgPrimaryHover} text-white`
                                }`}
                        >
                            <Banknote className="w-5 h-5" />
                            <span>Proses Pembayaran (Rp {cartSummary.total.toLocaleString('id-ID')})</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* MODAL CHECKOUT & PEMBAYARAN (FLAT & BOXY) */}
            {isCheckoutOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/70 backdrop-blur-xs">
                    <div className="bg-white dark:bg-slate-900 w-full max-w-md border-2 border-slate-900 dark:border-slate-700 shadow-[6px_6px_0px_0px_rgba(15,23,42,1)] dark:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] flex flex-col">

                        {/* Header Modal */}
                        <div className="flex items-center justify-between px-4 py-3 bg-slate-900 dark:bg-slate-800 text-white border-b-2 border-slate-900 dark:border-slate-700">
                            <div className="font-extrabold text-sm uppercase tracking-wide flex items-center space-x-2">
                                <Banknote className={`w-5 h-5 ${currentTheme.classes.textPrimary}`} />
                                <span>Pembayaran Pesanan</span>
                            </div>
                            <button
                                type="button"
                                onClick={() => setIsCheckoutOpen(false)}
                                className="text-slate-400 hover:text-white"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleProcessOrder} className="p-4 space-y-4">
                            {/* Kotak Total Belanja Terang */}
                            <div className={`p-3 ${currentTheme.classes.bgPrimaryLight} border-2 border-slate-900 dark:border-slate-700 text-center`}>
                                <div className={`text-xs font-bold ${currentTheme.classes.textPrimary} uppercase tracking-wider mb-0.5`}>
                                    Total Yang Harus Dibayar
                                </div>
                                <div className={`text-2xl sm:text-3xl font-black ${currentTheme.classes.textPrimary} font-mono`}>
                                    Rp {cartSummary.total.toLocaleString('id-ID')}
                                </div>
                                <div className={`text-[11px] font-semibold ${currentTheme.classes.textPrimary} mt-1`}>
                                    {orderType === 'dine_in' ? `Makan di Tempat ${tableNumber ? `(Meja ${tableNumber})` : ''}` : 'Bungkus / Takeaway'} • {cartSummary.totalItems} item
                                </div>
                            </div>

                            {/* Pilihan Metode Bayar: TUNAI vs QRIS */}
                            <div>
                                <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wide mb-1.5">
                                    Pilih Metode Pembayaran
                                </label>
                                <div className="grid grid-cols-2 gap-2">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setPaymentMethod('cash');
                                            setCashReceivedInput(cartSummary.total.toString());
                                        }}
                                        className={`py-3 px-3 border-2 border-slate-900 dark:border-slate-700 flex items-center justify-center space-x-2 font-extrabold text-xs uppercase tracking-wide transition ${paymentMethod === 'cash'
                                            ? `${currentTheme.classes.bgPrimary} text-white shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] dark:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]`
                                            : 'bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200'
                                            }`}
                                    >
                                        <Banknote className="w-4 h-4" />
                                        <span>Tunai / Cash</span>
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => {
                                            setPaymentMethod('qris');
                                            setCashReceivedInput(cartSummary.total.toString());
                                        }}
                                        className={`py-3 px-3 border-2 border-slate-900 dark:border-slate-700 flex items-center justify-center space-x-2 font-extrabold text-xs uppercase tracking-wide transition ${paymentMethod === 'qris'
                                            ? `${currentTheme.classes.bgPrimary} text-white shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] dark:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]`
                                            : 'bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200'
                                            }`}
                                    >
                                        <QrCode className="w-4 h-4" />
                                        <span>QRIS (Stiker / Scan)</span>
                                    </button>
                                </div>
                            </div>

                            {/* Konten Spesifik Pembayaran */}
                            {paymentMethod === 'cash' ? (
                                <div className="space-y-3">
                                    {/* Input Nominal Uang Diterima & Tombol Reset */}
                                    <div>
                                        <div className="flex items-center justify-between mb-1">
                                            <label className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wide">
                                                Uang Tunai Diterima (Rp)
                                            </label>
                                            {cashReceivedNum > 0 && (
                                                <button
                                                    type="button"
                                                    onClick={handleClearCash}
                                                    className="text-[11px] font-bold text-rose-600 dark:text-rose-400 hover:text-rose-800"
                                                >
                                                    Reset / Kosongkan
                                                </button>
                                            )}
                                        </div>
                                        <div className="relative">
                                            <input
                                                type="number"
                                                autoFocus
                                                value={cashReceivedInput}
                                                onChange={(e) => setCashReceivedInput(e.target.value)}
                                                className="w-full pl-3 pr-12 py-2.5 bg-slate-50 dark:bg-slate-800 border-2 border-slate-900 dark:border-slate-700 text-lg font-black font-mono text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:border-slate-900 dark:focus:border-slate-500"
                                                placeholder="0"
                                            />
                                            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-black text-slate-400 pointer-events-none font-mono">
                                                IDR
                                            </div>
                                        </div>
                                    </div>

                                    {/* Baris 1: Pilihan Cepat Nominal Bulat (1 Tap Langsung Terpilih) */}
                                    <div>
                                        <div className="text-[11px] font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wide mb-1">
                                            Pilihan Nominal Cepat (1-Tap):
                                        </div>
                                        <div className="flex flex-wrap gap-1.5">
                                            {quickCashOptions.map((amount) => (
                                                <button
                                                    key={amount}
                                                    type="button"
                                                    onClick={() => setCashReceivedInput(amount.toString())}
                                                    className={`py-1.5 px-2.5 text-center text-xs font-extrabold border-2 border-slate-900 dark:border-slate-700 transition ${cashReceivedNum === amount
                                                        ? `${currentTheme.classes.bgPrimary} text-white shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] dark:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]`
                                                        : 'bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200'
                                                        }`}
                                                >
                                                    {amount === cartSummary.total ? 'Uang Pas' : `Rp ${amount.toLocaleString('id-ID')}`}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Baris 2: Tombol Semua Pecahan Uang Kertas (+ Lembaran) */}
                                    <div>
                                        <div className="text-[11px] font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wide mb-1">
                                            Tambah Lembaran Uang (Pecahan):
                                        </div>
                                        <div className="grid grid-cols-6 gap-1.5">
                                            {INDONESIAN_BILLS.map((bill) => (
                                                <button
                                                    key={bill.value}
                                                    type="button"
                                                    onClick={() => handleAddBill(bill.value)}
                                                    className={`py-2 px-1 text-center text-xs font-black border-2 border-slate-900 dark:border-slate-700 shadow-[1px_1px_0px_0px_rgba(15,23,42,1)] dark:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] transition active:scale-95 flex flex-col items-center justify-center ${bill.color}`}
                                                >
                                                    <span className="text-[9px] font-bold opacity-60 leading-none">+</span>
                                                    <span>{bill.label}</span>
                                                </button>
                                            ))}
                                        </div>
                                        <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 italic">
                                            * Bisa tap berkali-kali (mis: tap 50rb lalu 20rb untuk Rp 70.000).
                                        </div>
                                    </div>

                                    {/* Kalkulator Kembalian */}
                                    <div className={`p-2.5 border-2 ${isCashShort ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-600 dark:border-rose-800' : 'bg-slate-100 dark:bg-slate-800 border-slate-900 dark:border-slate-700'}`}>
                                        <div className="flex items-center justify-between text-xs font-bold uppercase mb-0.5">
                                            <span className={isCashShort ? 'text-rose-700 dark:text-rose-400' : 'text-slate-700 dark:text-slate-300'}>
                                                {isCashShort ? 'Uang Masih Kurang' : 'Uang Kembalian'}
                                            </span>
                                            <span className={`text-base font-black font-mono ${isCashShort ? 'text-rose-700 dark:text-rose-400' : currentTheme.classes.textPrimary}`}>
                                                Rp {Math.abs(changeAmount).toLocaleString('id-ID')}
                                            </span>
                                        </div>
                                        {isCashShort && (
                                            <div className="text-[11px] text-rose-600 dark:text-rose-400 font-medium">
                                                Nominal uang tunai kurang dari total pesanan.
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ) : (
                                /* Panduan QRIS Statis Warung */
                                <div className={`p-3 ${currentTheme.classes.bgPrimaryLight} border-2 border-slate-900 dark:border-slate-700 space-y-2`}>
                                    <div className={`flex items-center space-x-2 ${currentTheme.classes.textPrimary} font-extrabold text-xs uppercase`}>
                                        <QrCode className={`w-5 h-5 ${currentTheme.classes.textPrimary}`} />
                                        <span>Instruksi Bayar QRIS</span>
                                    </div>
                                    <div className="text-xs text-slate-700 dark:text-slate-300 space-y-1">
                                        <div>1. Minta pembeli men-scan stiker QRIS warung di meja kasir.</div>
                                        <div>2. Nominal pas yang harus ditransfer: <strong className={`font-mono ${currentTheme.classes.textPrimary}`}>Rp {cartSummary.total.toLocaleString('id-ID')}</strong>.</div>
                                        <div>3. Cek notifikasi/bukti transfer sukses di layar HP pembeli.</div>
                                    </div>
                                    <div className={`text-[11px] font-bold ${currentTheme.classes.textPrimary} bg-white dark:bg-slate-900 p-2 border border-slate-300 dark:border-slate-700 text-center`}>
                                        Status: Siap Konfirmasi Lunas
                                    </div>
                                </div>
                            )}

                            {/* Opsi & Status Deteksi Mesin Printer */}
                            <div className={`p-2.5 border-2 ${printerInfo.connected
                                ? `${currentTheme.classes.bgPrimaryLight} border-slate-900 dark:border-slate-700 ${currentTheme.classes.textPrimaryDark}`
                                : 'bg-amber-50 dark:bg-amber-950/40 border-amber-600 dark:border-amber-700 text-amber-950 dark:text-amber-300'
                                }`}>
                                <div className="flex items-center justify-between">
                                    <label className="flex items-center space-x-2 cursor-pointer select-none">
                                        <input
                                            type="checkbox"
                                            checked={autoPrintReceipt}
                                            onChange={(e) => setAutoPrintReceipt(e.target.checked)}
                                            className="w-4 h-4 text-slate-900 border-slate-400 focus:ring-0 cursor-pointer"
                                        />
                                        <span className="text-xs font-black uppercase text-slate-900 dark:text-slate-100">
                                            Cetak Struk Fisik (Thermal)
                                        </span>
                                    </label>
                                    <span className={`text-[10px] font-black px-1.5 py-0.5 border ${printerInfo.connected
                                        ? `${currentTheme.classes.badge}`
                                        : 'bg-amber-200 dark:bg-amber-900/60 text-amber-950 dark:text-amber-200 border-amber-500 dark:border-amber-700'
                                        }`}>
                                        {printerInfo.connected ? 'Printer Terhubung' : 'Printer Belum Terdeteksi'}
                                    </span>
                                </div>
                                {!printerInfo.connected && (
                                    <div className="text-[11px] text-amber-900 dark:text-amber-300 mt-1.5 leading-snug">
                                        ⚠️ Mesin printer thermal belum terpasang. Transaksi akan disimpan langsung ke sistem tanpa proses cetak.
                                    </div>
                                )}
                            </div>

                            {/* Tombol Aksi Simpan & Selesai */}
                            <div className="pt-2 border-t border-slate-200 dark:border-slate-700 flex space-x-2">
                                <button
                                    type="button"
                                    onClick={() => setIsCheckoutOpen(false)}
                                    className="w-1/3 py-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs border border-slate-400 dark:border-slate-700 transition"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={isCashShort || isSubmitting}
                                    className={`w-2/3 py-3 font-extrabold text-xs uppercase tracking-wide border-2 border-slate-900 dark:border-slate-700 shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] dark:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5 transition flex items-center justify-center space-x-1.5 ${isCashShort || isSubmitting
                                        ? 'bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-600 border-slate-400 dark:border-slate-700 cursor-not-allowed shadow-none'
                                        : `${currentTheme.classes.bgPrimary} ${currentTheme.classes.bgPrimaryHover} text-white`
                                        }`}
                                >
                                    {isSubmitting ? (
                                        <span>Menyimpan Pesanan...</span>
                                    ) : printerInfo.connected && autoPrintReceipt ? (
                                        <>
                                            <Printer className="w-4 h-4" />
                                            <span>Selesai & Cetak Struk</span>
                                        </>
                                    ) : (
                                        <>
                                            <Check className="w-4 h-4" />
                                            <span>Selesai & Simpan Pesanan</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* MODAL CATATAN ITEM (Level pedas, sambal terasi, dll) */}
            {editingNoteItem !== null && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs">
                    <div className="bg-white dark:bg-slate-900 w-full max-w-sm border-2 border-slate-900 dark:border-slate-700 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] dark:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-4 space-y-3">
                        <div className="flex items-center justify-between border-b pb-2 border-slate-200 dark:border-slate-800">
                            <div className="font-extrabold text-xs uppercase text-slate-900 dark:text-white">
                                Catatan: {cart[editingNoteItem]?.name}
                            </div>
                            <button
                                onClick={() => setEditingNoteItem(null)}
                                className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Preset Chips Cepat */}
                        <div>
                            <div className="text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1.5">Pilihan Cepat:</div>
                            <div className="flex flex-wrap gap-1.5">
                                {PRESET_NOTES.map(preset => (
                                    <button
                                        key={preset}
                                        type="button"
                                        onClick={() => setCustomNoteText(preset)}
                                        className={`text-[11px] font-semibold px-2 py-1 bg-slate-100 dark:bg-slate-800 hover:${currentTheme.classes.bgPrimaryLight} text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700 transition`}
                                    >
                                        {preset}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Input Bebas */}
                        <div>
                            <input
                                type="text"
                                placeholder="Ketik catatan khusus..."
                                value={customNoteText}
                                onChange={(e) => setCustomNoteText(e.target.value)}
                                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-400 dark:border-slate-700 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:border-slate-900 dark:focus:border-slate-500"
                            />
                        </div>

                        <div className="flex space-x-2 pt-2">
                            <button
                                type="button"
                                onClick={() => saveNote('')}
                                className="w-1/2 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold border border-slate-300 dark:border-slate-700"
                            >
                                Hapus Catatan
                            </button>
                            <button
                                type="button"
                                onClick={() => saveNote(customNoteText)}
                                className={`w-1/2 py-2 ${currentTheme.classes.bgPrimary} ${currentTheme.classes.bgPrimaryHover} text-white text-xs font-bold border-2 border-slate-900 dark:border-slate-700 shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] dark:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]`}
                            >
                                Simpan
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL SUKSES CEPAT KASIR */}
            {completedOrder && !showThermalReceipt && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs">
                    <div className="bg-white dark:bg-slate-900 w-full max-w-sm border-2 border-slate-900 dark:border-slate-700 shadow-[6px_6px_0px_0px_rgba(15,23,42,1)] dark:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] p-5 space-y-4 animate-in fade-in zoom-in-95 duration-150">
                        {/* Header Sukses */}
                        <div className="text-center space-y-1">
                            <div className={`inline-flex p-2.5 ${currentTheme.classes.badge} border-2 rounded-full mb-1 shadow-sm`}>
                                <CheckCircle2 className="w-8 h-8" />
                            </div>
                            <h3 className="text-base font-black uppercase text-slate-900 dark:text-white tracking-wide">
                                Transaksi Berhasil Disimpan!
                            </h3>
                            <p className="text-xs font-mono font-bold text-slate-600 dark:text-slate-400">
                                No. Struk: {completedOrder.order_number}
                            </p>
                        </div>

                        {/* Kotak Ringkasan & Uang Kembalian */}
                        <div className="bg-slate-50 dark:bg-slate-800/80 border-2 border-slate-900 dark:border-slate-700 p-3 space-y-2">
                            <div className="flex justify-between text-xs font-bold text-slate-600 dark:text-slate-400 border-b pb-1.5 border-slate-200 dark:border-slate-700">
                                <span>Total Pesanan:</span>
                                <span className="font-mono text-slate-900 dark:text-white font-bold">
                                    Rp {completedOrder.total_amount?.toLocaleString('id-ID')}
                                </span>
                            </div>

                            {completedOrder.payment_method === 'cash' ? (
                                <>
                                    <div className="flex justify-between text-xs font-bold text-slate-600 dark:text-slate-400">
                                        <span>Uang Diterima:</span>
                                        <span className="font-mono text-slate-900 dark:text-white">
                                            Rp {(completedOrder.cash_received || completedOrder.total_amount)?.toLocaleString('id-ID')}
                                        </span>
                                    </div>
                                    <div className={`flex justify-between items-center ${currentTheme.classes.badge} p-2.5 border`}>
                                        <span className={`text-xs font-black uppercase ${currentTheme.classes.textPrimaryDark}`}>
                                            Uang Kembalian:
                                        </span>
                                        <span className={`text-xl font-black font-mono ${currentTheme.classes.textPrimaryDark}`}>
                                            Rp {(completedOrder.change_returned || 0)?.toLocaleString('id-ID')}
                                        </span>
                                    </div>
                                </>
                            ) : (
                                <div className={`${currentTheme.classes.badge} p-2 border text-center font-bold text-xs`}>
                                    Pembayaran QRIS Sukses (Lunas)
                                </div>
                            )}
                        </div>

                        {/* Peringatan Kondisi Printer Belum Terpasang */}
                        <div className="p-2.5 bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 text-amber-950 dark:text-amber-300 text-[11px] space-y-1">
                            <div className="flex items-center space-x-1.5 font-bold text-amber-900 dark:text-amber-400">
                                <AlertTriangle className="w-3.5 h-3.5 text-amber-700 dark:text-amber-400 shrink-0" />
                                <span>Status Printer: Belum Terpasang</span>
                            </div>
                            <div className="text-[10px] text-amber-900 dark:text-amber-300 leading-tight">
                                Struk tidak dicetak fisik. Seluruh data transaksi sudah masuk ke riwayat & laporan kasir.
                            </div>
                        </div>

                        {/* Tombol Aksi Kasir */}
                        <div className="space-y-2 pt-1">
                            <button
                                type="button"
                                autoFocus
                                onClick={() => {
                                    setCompletedOrder(null);
                                    setShowThermalReceipt(false);
                                }}
                                className={`w-full py-3 ${currentTheme.classes.bgPrimary} ${currentTheme.classes.bgPrimaryHover} text-white font-black text-xs uppercase tracking-wider border-2 border-slate-900 dark:border-slate-700 shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] dark:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5 transition flex items-center justify-center space-x-1.5`}
                            >
                                <span>Transaksi Baru (Lanjut Antrean)</span>
                                <ArrowRight className="w-4 h-4" />
                            </button>

                            <button
                                type="button"
                                onClick={() => setShowThermalReceipt(true)}
                                className="w-full py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs border border-slate-300 dark:border-slate-700 transition flex items-center justify-center space-x-1"
                            >
                                <Printer className="w-3.5 h-3.5 text-slate-600 dark:text-slate-400" />
                                <span>Lihat Rincian Struk / Cetak PDF</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL CETAK STRUK THERMAL 58MM */}
            {completedOrder && showThermalReceipt && (
                <ThermalReceipt
                    order={completedOrder}
                    onClose={() => {
                        setCompletedOrder(null);
                        setShowThermalReceipt(false);
                    }}
                    isBluetoothConnected={printerInfo.connected}
                    printerName={printerInfo.name}
                />
            )}

            {/* MODAL PERINGATAN GAGAL TRANSAKSI */}
            {transactionError && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-900/70 backdrop-blur-sm animate-in fade-in duration-150">
                    <div className="bg-white dark:bg-slate-900 border-2 border-slate-900 dark:border-slate-700 shadow-[6px_6px_0px_0px_rgba(15,23,42,1)] dark:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] w-full max-w-md p-5 space-y-4">
                        <div className="flex items-start space-x-3">
                            <div className="p-2.5 bg-rose-100 dark:bg-rose-950/60 border-2 border-slate-900 dark:border-slate-700 text-rose-700 dark:text-rose-400 shrink-0 shadow-[1px_1px_0px_0px_rgba(15,23,42,1)] dark:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]">
                                <AlertTriangle className="w-6 h-6" />
                            </div>
                            <div className="flex-1">
                                <h3 className="font-black text-base text-slate-900 dark:text-white uppercase tracking-tight">
                                    Transaksi Gagal Disimpan
                                </h3>
                                <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                                    {transactionError}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center justify-end pt-2 border-t-2 border-slate-100 dark:border-slate-800">
                            <button
                                type="button"
                                onClick={() => setTransactionError(null)}
                                className="py-2 px-4 bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 text-white font-black text-xs uppercase tracking-wider border-2 border-slate-900 dark:border-slate-700 shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] dark:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5 transition"
                            >
                                Tutup
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
