import React, { useState, useMemo } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import Navbar from '@/Components/Navbar';
import {
    Plus,
    Search,
    Filter,
    Edit2,
    Trash2,
    CheckCircle2,
    XCircle,
    UtensilsCrossed,
    TrendingUp,
    Tag,
    AlertTriangle,
    X,
    Check,
    ChevronLeft,
    ChevronRight,
    ShoppingBag,
    FolderTree,
    ShieldAlert
} from 'lucide-react';
import { CATEGORY_ICON_LIST, getCategoryIcon } from '@/Utils/categoryIcons';
import { getActiveTheme } from '@/Utils/themeHelper';

export default function ProductsIndex({ products, categories, stats, filters }) {
    const { flash, errors, store } = usePage().props;
    const currentTheme = getActiveTheme(store?.theme_color);

    // State Filter & Pencarian
    const [search, setSearch] = useState(filters.search || '');
    const [selectedCategory, setSelectedCategory] = useState(filters.category_id || '');
    const [selectedStatus, setSelectedStatus] = useState(filters.status || '');

    // State Modal Tambah / Edit Menu
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // State Modal Kelola Kategori
    const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState(null);
    const [categoryFormData, setCategoryFormData] = useState({ name: '', sort_order: '', icon: 'Utensils' });
    const [isCategorySubmitting, setIsCategorySubmitting] = useState(false);
    const [categoryDeleteError, setCategoryDeleteError] = useState(null);
    const [deletingCategory, setDeletingCategory] = useState(null);

    // Form Data State Menu
    const [formData, setFormData] = useState({
        category_id: categories[0]?.id || '',
        name: '',
        code: '',
        price: '',
        cost_price: '',
        description: '',
        is_available: true,
    });

    // State Modal Hapus Menu
    const [deletingProduct, setDeletingProduct] = useState(null);

    // Filter Trigger
    const handleFilterChange = (newFilters) => {
        router.get('/products', {
            search: newFilters.search !== undefined ? newFilters.search : search,
            category_id: newFilters.category_id !== undefined ? newFilters.category_id : selectedCategory,
            status: newFilters.status !== undefined ? newFilters.status : selectedStatus,
        }, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        handleFilterChange({ search });
    };

    // Buka Modal Tambah Menu Baru
    const handleOpenAddModal = () => {
        setEditingProduct(null);
        setFormData({
            category_id: categories[0]?.id || '',
            name: '',
            code: '',
            price: '',
            cost_price: '',
            description: '',
            is_available: true,
        });
        setIsFormModalOpen(true);
    };

    // Buka Modal Edit Menu
    const handleOpenEditModal = (product) => {
        setEditingProduct(product);
        setFormData({
            category_id: product.category_id,
            name: product.name,
            code: product.code || '',
            price: product.price,
            cost_price: product.cost_price || '',
            description: product.description || '',
            is_available: product.is_available,
        });
        setIsFormModalOpen(true);
    };

    // Simpan Form (Create / Update)
    const handleFormSubmit = (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        const payload = {
            ...formData,
            price: parseInt(formData.price, 10) || 0,
            cost_price: parseInt(formData.cost_price, 10) || 0,
        };

        if (editingProduct) {
            router.put(`/products/${editingProduct.id}`, payload, {
                onSuccess: () => {
                    setIsFormModalOpen(false);
                    setEditingProduct(null);
                },
                onFinish: () => setIsSubmitting(false),
            });
        } else {
            router.post('/products', payload, {
                onSuccess: () => {
                    setIsFormModalOpen(false);
                },
                onFinish: () => setIsSubmitting(false),
            });
        }
    };

    // Toggle Ketersediaan Cepat (Ready / Habis)
    const handleToggleStatus = (product) => {
        router.patch(`/products/${product.id}/toggle`, {}, {
            preserveScroll: true,
        });
    };

    // Eksekusi Hapus Menu
    const handleConfirmDelete = () => {
        if (!deletingProduct) return;
        router.delete(`/products/${deletingProduct.id}`, {
            onSuccess: () => setDeletingProduct(null),
        });
    };

    // Handler Modal Kategori
    const handleOpenCategoryModal = () => {
        setEditingCategory(null);
        setCategoryFormData({ name: '', sort_order: (categories.length + 1).toString(), icon: 'Utensils' });
        setCategoryDeleteError(null);
        setIsCategoryModalOpen(true);
    };

    const handleEditCategory = (cat) => {
        setEditingCategory(cat);
        setCategoryFormData({
            name: cat.name,
            sort_order: cat.sort_order?.toString() || '0',
            icon: cat.icon || 'Utensils',
        });
        setCategoryDeleteError(null);
    };

    const handleCancelEditCategory = () => {
        setEditingCategory(null);
        setCategoryFormData({ name: '', sort_order: (categories.length + 1).toString(), icon: 'Utensils' });
        setCategoryDeleteError(null);
    };

    const handleCategoryFormSubmit = (e) => {
        e.preventDefault();
        setIsCategorySubmitting(true);
        setCategoryDeleteError(null);

        const payload = {
            name: categoryFormData.name,
            icon: categoryFormData.icon || 'Utensils',
            sort_order: categoryFormData.sort_order ? parseInt(categoryFormData.sort_order, 10) : undefined,
        };

        if (editingCategory) {
            router.put(`/categories/${editingCategory.id}`, payload, {
                onSuccess: () => {
                    handleCancelEditCategory();
                },
                onFinish: () => setIsCategorySubmitting(false),
            });
        } else {
            router.post('/categories', payload, {
                onSuccess: () => {
                    handleCancelEditCategory();
                },
                onFinish: () => setIsCategorySubmitting(false),
            });
        }
    };

    const handleDeleteCategory = (cat) => {
        if (cat.products_count > 0) {
            setCategoryDeleteError(`Kategori "${cat.name}" tidak dapat dihapus karena masih memuat ${cat.products_count} menu. Hapus atau pindahkan menu terlebih dahulu.`);
            return;
        }

        setCategoryDeleteError(null);
        setDeletingCategory(cat);
    };

    const handleConfirmDeleteCategory = () => {
        if (!deletingCategory) return;
        router.delete(`/categories/${deletingCategory.id}`, {
            onSuccess: () => {
                setCategoryDeleteError(null);
                if (editingCategory?.id === deletingCategory.id) {
                    handleCancelEditCategory();
                }
                setDeletingCategory(null);
            },
            onError: (errs) => {
                if (errs.category) {
                    setCategoryDeleteError(errs.category);
                }
                setDeletingCategory(null);
            }
        });
    };

    // Kalkulasi Margin Keuntungan Otomatis di Form
    const estimatedProfit = useMemo(() => {
        const p = parseInt(formData.price, 10) || 0;
        const c = parseInt(formData.cost_price, 10) || 0;
        const profit = p - c;
        const marginPct = p > 0 ? ((profit / p) * 100).toFixed(1) : 0;
        return { profit, marginPct };
    }, [formData.price, formData.cost_price]);

    return (
        <div className="min-h-screen bg-slate-100 dark:bg-slate-950 flex flex-col font-sans">
            <Head title={`Kelola Menu - ${store?.name || 'Pecel Lele Sedap'}`} />

            {/* Navbar Utama */}
            <Navbar />

            {/* Notifikasi Flash Success */}
            {flash?.success?.message && (
                <div className="max-w-7xl w-full mx-auto px-3 sm:px-6 pt-3">
                    <div className={`p-3 ${currentTheme.classes.badge} border-2 border-slate-900 dark:border-slate-700 shadow-[3px_3px_0px_0px_rgba(15,23,42,1)] dark:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] flex items-center justify-between`}>
                        <div className={`flex items-center space-x-2 ${currentTheme.classes.textPrimaryDark} text-xs font-bold`}>
                            <CheckCircle2 className={`w-4 h-4 ${currentTheme.classes.textPrimary}`} />
                            <span>{flash.success.message}</span>
                        </div>
                    </div>
                </div>
            )}

            {/* Konten Utama */}
            <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-6 space-y-4">
                {/* Header Judul & Tombol Tambah */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 border-2 border-slate-900 dark:border-slate-800 shadow-[3px_3px_0px_0px_rgba(15,23,42,1)] dark:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
                    <div>
                        <h1 className="text-xl sm:text-2xl font-black uppercase text-slate-900 dark:text-white tracking-tight flex items-center space-x-2">
                            <UtensilsCrossed className={`w-6 h-6 ${currentTheme.classes.textPrimary}`} />
                            <span>Manajemen Menu & Kategori</span>
                        </h1>
                        <p className="text-xs font-medium text-slate-600 dark:text-slate-400 mt-0.5">
                            Atur daftar menu makanan & minuman, sesuaikan harga jual, modal HPP, serta status stok ketersediaan.
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                        <button
                            type="button"
                            onClick={handleOpenCategoryModal}
                            className="py-2.5 px-3.5 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-900 dark:text-slate-100 font-extrabold text-xs uppercase tracking-wide border-2 border-slate-900 dark:border-slate-700 shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] dark:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5 transition flex items-center justify-center space-x-1.5"
                        >
                            <FolderTree className={`w-4 h-4 ${currentTheme.classes.textPrimary}`} />
                            <span>Atur Kategori ({categories.length})</span>
                        </button>

                        <button
                            type="button"
                            onClick={handleOpenAddModal}
                            className={`py-2.5 px-4 ${currentTheme.classes.bgPrimary} ${currentTheme.classes.bgPrimaryHover} text-white font-black text-xs uppercase tracking-wide border-2 border-slate-900 dark:border-slate-700 shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] dark:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5 transition flex items-center justify-center space-x-1.5 shrink-0`}
                        >
                            <Plus className="w-4 h-4" />
                            <span>Tambah Menu Baru</span>
                        </button>
                    </div>
                </div>

                {/* Ringkasan Statistik Kartu */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3">
                    <div className="bg-white dark:bg-slate-900 p-3 sm:p-3.5 border-2 border-slate-900 dark:border-slate-800 shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] dark:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                        <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Total Menu</div>
                        <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white font-mono mt-0.5">
                            {stats.total} <span className="text-xs font-sans text-slate-500 dark:text-slate-400 font-semibold">item</span>
                        </div>
                    </div>

                    <div className={`${currentTheme.classes.bgPrimaryLight} border-2 border-slate-900 dark:border-slate-800 shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] dark:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] p-3 sm:p-3.5`}>
                        <div className={`text-[11px] font-bold ${currentTheme.classes.textPrimaryDark} uppercase tracking-wide flex items-center space-x-1`}>
                            <CheckCircle2 className={`w-3.5 h-3.5 ${currentTheme.classes.textPrimary}`} />
                            <span>Menu Ready / Aktif</span>
                        </div>
                        <div className={`text-xl sm:text-2xl font-black ${currentTheme.classes.textPrimaryDark} font-mono mt-0.5`}>
                            {stats.available} <span className={`text-xs font-sans ${currentTheme.classes.textPrimary} font-semibold`}>item</span>
                        </div>
                    </div>

                    <div className="bg-rose-50 dark:bg-rose-950/40 border-2 border-slate-900 dark:border-slate-800 shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] dark:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] p-3 sm:p-3.5">
                        <div className="text-[11px] font-bold text-rose-800 dark:text-rose-300 uppercase tracking-wide flex items-center space-x-1">
                            <XCircle className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
                            <span>Habis / Kosong</span>
                        </div>
                        <div className="text-xl sm:text-2xl font-black text-rose-900 dark:text-rose-200 font-mono mt-0.5">
                            {stats.unavailable} <span className="text-xs font-sans text-rose-700 dark:text-rose-400 font-semibold">item</span>
                        </div>
                    </div>

                    <div className="bg-sky-50 dark:bg-sky-950/40 border-2 border-slate-900 dark:border-slate-800 shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] dark:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] p-3 sm:p-3.5">
                        <div className="text-[11px] font-bold text-sky-800 dark:text-sky-300 uppercase tracking-wide flex items-center space-x-1">
                            <TrendingUp className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
                            <span>Rata-rata Margin</span>
                        </div>
                        <div className="text-xl sm:text-2xl font-black text-sky-950 dark:text-sky-200 font-mono mt-0.5">
                            {stats.avg_margin}% <span className="text-xs font-sans text-sky-700 dark:text-sky-400 font-semibold">laba kotor</span>
                        </div>
                    </div>
                </div>

                {/* Filter & Search Bar */}
                <div className="bg-white dark:bg-slate-900 p-3.5 border-2 border-slate-900 dark:border-slate-800 shadow-[3px_3px_0px_0px_rgba(15,23,42,1)] dark:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] space-y-3">
                    <div className="flex flex-col sm:flex-row gap-2.5 items-stretch sm:items-center justify-between">
                        {/* Search Input */}
                        <form onSubmit={handleSearchSubmit} className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Cari nama menu atau kode..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full pl-9 pr-20 py-2 bg-slate-50 dark:bg-slate-800 border-2 border-slate-900 dark:border-slate-700 text-xs font-semibold text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:border-slate-900 dark:focus:border-slate-500"
                            />
                            {search && (
                                <button
                                    type="button"
                                    onClick={() => { setSearch(''); handleFilterChange({ search: '' }); }}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                                >
                                    <X className="w-3.5 h-3.5" />
                                </button>
                            )}
                        </form>

                        {/* Filter Status Stok */}
                        <div className="w-full sm:w-48">
                            <select
                                value={selectedStatus}
                                onChange={(e) => {
                                    setSelectedStatus(e.target.value);
                                    handleFilterChange({ status: e.target.value });
                                }}
                                className="w-full py-2 px-3 bg-slate-50 dark:bg-slate-800 border-2 border-slate-900 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-slate-900 dark:focus:border-slate-500"
                            >
                                <option value="">Semua Status</option>
                                <option value="available">Tersedia (Ready)</option>
                                <option value="unavailable">Habis (Kosong)</option>
                            </select>
                        </div>
                    </div>

                    {/* Filter Tab Kategori */}
                    <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 no-scrollbar">
                        <button
                            type="button"
                            onClick={() => {
                                setSelectedCategory('');
                                handleFilterChange({ category_id: '' });
                            }}
                            className={`py-1.5 px-3 text-xs font-bold uppercase tracking-wide border-2 border-slate-900 dark:border-slate-700 shrink-0 transition ${selectedCategory === ''
                                    ? 'bg-slate-900 dark:bg-slate-800 text-white shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] dark:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
                                    : 'bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200'
                                }`}
                        >
                            Semua Kategori ({stats.total})
                        </button>

                        {categories.map((cat) => {
                            const CatIcon = getCategoryIcon(cat);
                            return (
                                <button
                                    key={cat.id}
                                    type="button"
                                    onClick={() => {
                                        const next = selectedCategory === cat.id.toString() ? '' : cat.id.toString();
                                        setSelectedCategory(next);
                                        handleFilterChange({ category_id: next });
                                    }}
                                    className={`py-1.5 px-3 text-xs font-bold uppercase tracking-wide border-2 border-slate-900 dark:border-slate-700 shrink-0 transition flex items-center space-x-1.5 ${selectedCategory === cat.id.toString()
                                            ? `${currentTheme.classes.bgPrimary} text-white shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] dark:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]`
                                            : 'bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200'
                                        }`}
                                >
                                    <CatIcon className="w-3.5 h-3.5" />
                                    <span>{cat.name}</span>
                                    <span className={`px-1.5 py-0.2 text-[10px] font-mono ${selectedCategory === cat.id.toString() ? 'bg-black/25 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                                        }`}>
                                        {cat.products_count}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Tabel Data Menu */}
                <div className="bg-white dark:bg-slate-900 border-2 border-slate-900 dark:border-slate-800 shadow-[3px_3px_0px_0px_rgba(15,23,42,1)] dark:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-xs">
                            <thead>
                                <tr className="bg-slate-900 dark:bg-slate-950 text-white border-b-2 border-slate-900 dark:border-slate-800 uppercase tracking-wider text-[11px] font-black">
                                    <th className="py-3 px-3.5">Menu Makanan / Minuman</th>
                                    <th className="py-3 px-3">Kategori</th>
                                    <th className="py-3 px-3 text-right">Harga Jual</th>
                                    <th className="py-3 px-3 text-right">Modal (HPP)</th>
                                    <th className="py-3 px-3 text-right">Est. Profit</th>
                                    <th className="py-3 px-3 text-center">Status Stok</th>
                                    <th className="py-3 px-3 text-center">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200 dark:divide-slate-800 font-medium">
                                {products.data.length === 0 ? (
                                    <tr>
                                        <td colSpan="7" className="py-8 text-center text-slate-500 dark:text-slate-400 font-bold">
                                            Tidak ada menu yang cocok dengan filter atau pencarian Anda.
                                        </td>
                                    </tr>
                                ) : (
                                    products.data.map((product) => {
                                        const profit = product.price - product.cost_price;
                                        const marginPct = product.price > 0 ? ((profit / product.price) * 100).toFixed(0) : 0;

                                        return (
                                            <tr key={product.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
                                                <td className="py-2.5 px-3.5">
                                                    <div className="font-extrabold text-slate-900 dark:text-white text-xs">
                                                        {product.name}
                                                    </div>
                                                    {product.code && (
                                                        <span className="inline-block font-mono text-[10px] text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-1 border border-slate-300 dark:border-slate-700 mt-0.5">
                                                            {product.code}
                                                        </span>
                                                    )}
                                                    {product.description && (
                                                        <div className="text-[10px] text-slate-500 dark:text-slate-400 line-clamp-1 italic mt-0.5">
                                                            {product.description}
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="py-2.5 px-3">
                                                    <span className={`inline-block px-2 py-0.5 font-bold text-[10px] uppercase ${currentTheme.classes.badge}`}>
                                                        {product.category?.name || '-'}
                                                    </span>
                                                </td>
                                                <td className="py-2.5 px-3 text-right font-black font-mono text-slate-900 dark:text-white text-xs">
                                                    Rp {product.price.toLocaleString('id-ID')}
                                                </td>
                                                <td className="py-2.5 px-3 text-right font-mono text-slate-600 dark:text-slate-400 text-[11px]">
                                                    Rp {(product.cost_price || 0).toLocaleString('id-ID')}
                                                </td>
                                                <td className="py-2.5 px-3 text-right font-mono">
                                                    <div className={`${currentTheme.classes.textPrimary} font-bold text-xs`}>
                                                        Rp {profit.toLocaleString('id-ID')}
                                                    </div>
                                                    <div className="text-[10px] text-slate-500 dark:text-slate-400">
                                                        ({marginPct}%)
                                                    </div>
                                                </td>
                                                <td className="py-2.5 px-3 text-center">
                                                    <button
                                                        type="button"
                                                        onClick={() => handleToggleStatus(product)}
                                                        title="Klik untuk mengubah status ketersediaan"
                                                        className={`px-2.5 py-1 text-[10px] font-black uppercase tracking-wider border-2 transition active:scale-95 ${product.is_available
                                                                ? `${currentTheme.classes.badge} hover:opacity-90`
                                                                : 'bg-rose-100 dark:bg-rose-950/60 text-rose-900 dark:text-rose-300 border-rose-700 dark:border-rose-600 hover:bg-rose-200 dark:hover:bg-rose-900/60'
                                                            }`}
                                                    >
                                                        {product.is_available ? '✓ Ready' : '✕ Habis'}
                                                    </button>
                                                </td>
                                                <td className="py-2.5 px-3 text-center">
                                                    <div className="flex items-center justify-center space-x-1.5">
                                                        <button
                                                            type="button"
                                                            onClick={() => handleOpenEditModal(product)}
                                                            className="p-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-400 dark:border-slate-700 transition"
                                                            title="Edit Menu"
                                                        >
                                                            <Edit2 className="w-3.5 h-3.5" />
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => setDeletingProduct(product)}
                                                            className="p-1.5 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/40 text-rose-700 dark:text-rose-300 border border-rose-400 dark:border-rose-800 transition"
                                                            title="Hapus Menu"
                                                        >
                                                            <Trash2 className="w-3.5 h-3.5" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {products.links && products.links.length > 3 && (
                        <div className="p-3 border-t-2 border-slate-900 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/80 flex items-center justify-between text-xs font-bold">
                            <div className="text-slate-600 dark:text-slate-400 text-[11px]">
                                Menampilkan {products.from || 0} - {products.to || 0} dari {products.total} menu
                            </div>
                            <div className="flex space-x-1">
                                {products.links.map((link, i) => (
                                    <button
                                        key={i}
                                        disabled={!link.url}
                                        onClick={() => link.url && router.get(link.url, {}, { preserveScroll: true, preserveState: true })}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                        className={`px-2.5 py-1 text-xs border border-slate-900 dark:border-slate-700 transition ${link.active
                                                ? `${currentTheme.classes.bgPrimary} text-white font-black`
                                                : link.url
                                                    ? 'bg-white dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200'
                                                    : 'bg-slate-100 dark:bg-slate-900 text-slate-400 dark:text-slate-600 border-slate-300 dark:border-slate-800 cursor-not-allowed'
                                            }`}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </main>

            {/* MODAL FORM TAMBAH / EDIT MENU */}
            {isFormModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/70 backdrop-blur-xs">
                    <div className="bg-white dark:bg-slate-900 w-full max-w-md border-2 border-slate-900 dark:border-slate-800 shadow-[6px_6px_0px_0px_rgba(15,23,42,1)] dark:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] flex flex-col max-h-[92vh] p-4 overflow-y-auto">
                        {/* Header Modal Form */}
                        <div className="flex items-center justify-between pb-3 border-b-2 border-slate-900 dark:border-slate-800">
                            <div className="flex items-center space-x-2">
                                <UtensilsCrossed className={`w-4 h-4 ${currentTheme.classes.textPrimary}`} />
                                <h3 className="font-black uppercase text-sm text-slate-900 dark:text-white tracking-wide">
                                    {editingProduct ? 'Edit Menu Makanan / Minuman' : 'Tambah Menu Baru'}
                                </h3>
                            </div>
                            <button
                                type="button"
                                onClick={() => setIsFormModalOpen(false)}
                                className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 border border-transparent hover:border-slate-900 dark:hover:border-slate-700 transition"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Form Body */}
                        <form onSubmit={handleFormSubmit} className="space-y-3 pt-3">
                            {/* Kategori Menu */}
                            <div>
                                <label className="block font-extrabold uppercase text-slate-800 dark:text-slate-200 text-[11px] mb-1">
                                    Kategori Menu *
                                </label>
                                <select
                                    value={formData.category_id}
                                    onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border-2 border-slate-900 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:border-slate-900 dark:focus:border-slate-500"
                                >
                                    {categories.map((c) => (
                                        <option key={c.id} value={c.id}>
                                            {c.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Nama Menu */}
                            <div>
                                <label className="block font-extrabold uppercase text-slate-800 dark:text-slate-200 text-[11px] mb-1">
                                    Nama Menu *
                                </label>
                                <input
                                    type="text"
                                    required
                                    placeholder="misal: Ayam Bakar Madu Pedas, Es Teh Manis"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border-2 border-slate-900 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:border-slate-900 dark:focus:border-slate-500"
                                />
                            </div>

                            {/* Kode Menu / SKU */}
                            <div>
                                <label className="block font-extrabold uppercase text-slate-800 dark:text-slate-200 text-[11px] mb-1">
                                    Kode / SKU (Opsional)
                                </label>
                                <input
                                    type="text"
                                    placeholder="misal: ABM-01, EST-02"
                                    value={formData.code}
                                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border-2 border-slate-900 dark:border-slate-700 text-xs font-mono font-bold text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:border-slate-900 dark:focus:border-slate-500"
                                />
                            </div>

                            {/* Harga Jual & Harga Modal HPP */}
                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <label className="block font-extrabold uppercase text-slate-800 dark:text-slate-200 text-[11px] mb-1">
                                        Harga Jual (Rp) *
                                    </label>
                                    <input
                                        type="number"
                                        required
                                        min="0"
                                        step="100"
                                        placeholder="0"
                                        value={formData.price}
                                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                        className={`w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border-2 border-slate-900 dark:border-slate-700 text-sm font-mono font-black focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:border-slate-900 dark:focus:border-slate-500 ${currentTheme.classes.textPrimaryDark}`}
                                    />
                                </div>
                                <div>
                                    <label className="block font-extrabold uppercase text-slate-800 dark:text-slate-200 text-[11px] mb-1">
                                        Modal HPP (Rp)
                                    </label>
                                    <input
                                        type="number"
                                        min="0"
                                        step="1"
                                        placeholder="0"
                                        value={formData.cost_price}
                                        onChange={(e) => setFormData({ ...formData, cost_price: e.target.value })}
                                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border-2 border-slate-900 dark:border-slate-700 text-sm font-mono font-bold focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:border-slate-900 dark:focus:border-slate-500 text-slate-700 dark:text-slate-200"
                                    />
                                </div>
                            </div>

                            {/* Kalkulator Preview Margin */}
                            {formData.price > 0 && (
                                <div className={`p-2.5 ${currentTheme.classes.bgPrimaryLight} border border-slate-300 dark:border-slate-700 flex items-center justify-between text-[11px]`}>
                                    <span className={`font-bold ${currentTheme.classes.textPrimaryDark}`}>Perkiraan Untung / Porsi:</span>
                                    <span className={`font-mono font-black ${currentTheme.classes.textPrimary}`}>
                                        Rp {estimatedProfit.profit.toLocaleString('id-ID')} ({estimatedProfit.marginPct}%)
                                    </span>
                                </div>
                            )}

                            {/* Deskripsi Menu */}
                            <div>
                                <label className="block font-extrabold uppercase text-slate-800 dark:text-slate-200 text-[11px] mb-1">
                                    Deskripsi Singkat (Opsional)
                                </label>
                                <textarea
                                    rows="2"
                                    placeholder="Keterangan porsi, bumbu rempah, lauk tambahan..."
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border-2 border-slate-900 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:border-slate-900 dark:focus:border-slate-500"
                                />
                            </div>

                            {/* Status Ketersediaan Checkbox */}
                            <div className="pt-1">
                                <label className="flex items-center space-x-2 cursor-pointer select-none">
                                    <input
                                        type="checkbox"
                                        checked={formData.is_available}
                                        onChange={(e) => setFormData({ ...formData, is_available: e.target.checked })}
                                        className="w-4 h-4 text-slate-900 dark:text-slate-100 border-slate-400 dark:border-slate-600 focus:ring-0 cursor-pointer"
                                    />
                                    <span className="text-xs font-black uppercase text-slate-900 dark:text-white">
                                        Menu Tersedia (Ready untuk dipesan di kasir)
                                    </span>
                                </label>
                            </div>

                            {/* Tombol Aksi */}
                            <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex space-x-2">
                                <button
                                    type="button"
                                    onClick={() => setIsFormModalOpen(false)}
                                    className="w-1/3 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs border border-slate-400 dark:border-slate-700 transition"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className={`w-2/3 py-2.5 ${currentTheme.classes.bgPrimary} ${currentTheme.classes.bgPrimaryHover} text-white font-extrabold text-xs uppercase tracking-wide border-2 border-slate-900 dark:border-slate-700 shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] dark:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5 transition`}
                                >
                                    {isSubmitting ? 'Menyimpan...' : editingProduct ? 'Simpan Perubahan' : 'Tambah Menu'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* MODAL KONFIRMASI HAPUS MENU */}
            {deletingProduct && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs">
                    <div className="bg-white dark:bg-slate-900 w-full max-w-sm border-2 border-slate-900 dark:border-slate-800 shadow-[6px_6px_0px_0px_rgba(15,23,42,1)] dark:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] p-5 space-y-4">
                        <div className="flex items-center space-x-3 text-rose-700 dark:text-rose-400">
                            <div className="p-2 bg-rose-100 dark:bg-rose-950/60 border border-rose-400 dark:border-rose-700 rounded-full">
                                <AlertTriangle className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="text-sm font-black uppercase text-slate-900 dark:text-white">
                                    Hapus Menu?
                                </h3>
                                <p className="text-xs text-slate-600 dark:text-slate-400">
                                    Tindakan ini tidak dapat dibatalkan.
                                </p>
                            </div>
                        </div>

                        <div className="p-3 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-300">
                            Anda akan menghapus menu: <strong className="text-slate-900 dark:text-white">{deletingProduct.name}</strong>
                        </div>

                        <div className="flex space-x-2 pt-1">
                            <button
                                type="button"
                                onClick={() => setDeletingProduct(null)}
                                className="w-1/2 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs border border-slate-400 dark:border-slate-700"
                            >
                                Batal
                            </button>
                            <button
                                type="button"
                                onClick={handleConfirmDelete}
                                className="w-1/2 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs uppercase tracking-wide border-2 border-slate-900 dark:border-slate-700 shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] dark:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                            >
                                Ya, Hapus
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL KONFIRMASI HAPUS KATEGORI */}
            {deletingCategory && (
                <div className="fixed inset-0 z-[70] flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
                    <div className="bg-white dark:bg-slate-900 border-2 border-slate-900 dark:border-slate-800 shadow-[6px_6px_0px_0px_rgba(15,23,42,1)] dark:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] w-full max-w-sm p-5 space-y-4">
                        <div className="flex items-start space-x-3">
                            <div className="p-2.5 bg-rose-100 dark:bg-rose-950/60 border-2 border-slate-900 dark:border-slate-700 text-rose-700 dark:text-rose-300 shrink-0 shadow-[1px_1px_0px_0px_rgba(15,23,42,1)] dark:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]">
                                <AlertTriangle className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="font-black text-sm uppercase text-slate-900 dark:text-white">
                                    Hapus Kategori?
                                </h3>
                                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                                    Apakah Anda yakin ingin menghapus kategori <strong className="text-slate-900 dark:text-white font-black">"{deletingCategory.name}"</strong>? Tindakan ini tidak dapat dibatalkan.
                                </p>
                            </div>
                        </div>

                        <div className="p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-[11px] text-slate-600 dark:text-slate-400">
                            * Kategori ini memiliki <strong>0 menu</strong> dan aman untuk dihapus dari sistem warung.
                        </div>

                        <div className="flex items-center justify-end space-x-2 pt-2 border-t-2 border-slate-100 dark:border-slate-800">
                            <button
                                type="button"
                                onClick={() => setDeletingCategory(null)}
                                className="py-2 px-3.5 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-extrabold text-xs uppercase tracking-wide border-2 border-slate-900 dark:border-slate-700 transition"
                            >
                                Batal
                            </button>
                            <button
                                type="button"
                                onClick={handleConfirmDeleteCategory}
                                className="py-2 px-4 bg-rose-600 hover:bg-rose-700 text-white font-black text-xs uppercase tracking-wider border-2 border-slate-900 dark:border-slate-700 shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] dark:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5 transition flex items-center space-x-1.5"
                            >
                                <Trash2 className="w-3.5 h-3.5" />
                                <span>Ya, Hapus Kategori</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL KELOLA KATEGORI (PERSIAPAN SAAS) */}
            {isCategoryModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/70 backdrop-blur-xs">
                    <div className="bg-white dark:bg-slate-900 w-full max-w-lg border-2 border-slate-900 dark:border-slate-800 shadow-[6px_6px_0px_0px_rgba(15,23,42,1)] dark:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] flex flex-col max-h-[92vh]">
                        {/* Header Modal */}
                        <div className="flex items-center justify-between px-4 py-3 bg-slate-900 dark:bg-slate-950 text-white border-b-2 border-slate-900 dark:border-slate-800">
                            <div className="font-extrabold text-sm uppercase tracking-wide flex items-center space-x-2">
                                <FolderTree className={`w-4 h-4 ${currentTheme.classes.textPrimary}`} />
                                <span>Kelola Kategori Menu</span>
                            </div>
                            <button
                                onClick={() => setIsCategoryModalOpen(false)}
                                className="p-1 hover:bg-slate-800 text-slate-400 hover:text-white transition"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <div className="p-4 overflow-y-auto space-y-4 text-xs font-semibold">
                            {/* Alert Pesan Error / Proteksi */}
                            {(categoryDeleteError || errors?.category) && (
                                <div className="p-3 bg-rose-50 dark:bg-rose-950/60 border-2 border-rose-600 text-rose-900 dark:text-rose-300 text-xs font-bold flex items-start space-x-2">
                                    <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                                    <span>{categoryDeleteError || errors.category}</span>
                                </div>
                            )}

                            {/* Form Tambah / Edit Kategori */}
                            <form onSubmit={handleCategoryFormSubmit} className="p-3.5 bg-slate-50 dark:bg-slate-800/80 border-2 border-slate-900 dark:border-slate-700 space-y-2.5">
                                <div className="font-extrabold text-[11px] uppercase tracking-wide text-slate-800 dark:text-slate-200 flex items-center justify-between">
                                    <span>{editingCategory ? `Edit Kategori: "${editingCategory.name}"` : 'Tambah Kategori Baru'}</span>
                                    {editingCategory && (
                                        <button
                                            type="button"
                                            onClick={handleCancelEditCategory}
                                            className="text-[10px] text-rose-600 dark:text-rose-400 hover:underline"
                                        >
                                            Batal Edit
                                        </button>
                                    )}
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                                    <div className="sm:col-span-2">
                                        <label className="block text-[10px] font-bold uppercase text-slate-600 dark:text-slate-400 mb-1">
                                            Nama Kategori *
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            placeholder="Misal: Paket Hemat, Sayuran, Camilan..."
                                            value={categoryFormData.name}
                                            onChange={(e) => setCategoryFormData({ ...categoryFormData, name: e.target.value })}
                                            className="w-full px-3 py-1.5 bg-white dark:bg-slate-900 border-2 border-slate-900 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-slate-900 dark:focus:border-slate-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-bold uppercase text-slate-600 dark:text-slate-400 mb-1">
                                            Urutan Tampil
                                        </label>
                                        <input
                                            type="number"
                                            min="0"
                                            placeholder="1"
                                            value={categoryFormData.sort_order}
                                            onChange={(e) => setCategoryFormData({ ...categoryFormData, sort_order: e.target.value })}
                                            className="w-full px-3 py-1.5 bg-white dark:bg-slate-900 border-2 border-slate-900 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-slate-900 dark:focus:border-slate-500"
                                        />
                                    </div>
                                </div>

                                {/* Pilihan Ikon Kategori */}
                                <div className="space-y-1.5 pt-1">
                                    <div className="flex items-center justify-between">
                                        <label className="block text-[10px] font-bold uppercase text-slate-600 dark:text-slate-400">
                                            Pilih Ikon Kategori
                                        </label>
                                        {(() => {
                                            const SelectedIcon = getCategoryIcon(categoryFormData.icon);
                                            const currentItem = CATEGORY_ICON_LIST.find(i => i.key === categoryFormData.icon);
                                            return (
                                                <div className={`flex items-center space-x-1.5 px-2 py-0.5 ${currentTheme.classes.badge} text-[10px] font-extrabold shadow-[1px_1px_0px_0px_rgba(15,23,42,1)] dark:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]`}>
                                                    <SelectedIcon className={`w-3.5 h-3.5 ${currentTheme.classes.textPrimary}`} />
                                                    <span>Terpilih: {currentItem?.label || categoryFormData.icon}</span>
                                                </div>
                                            );
                                        })()}
                                    </div>

                                    {/* Grid Pilihan Ikon */}
                                    <div className="grid grid-cols-4 sm:grid-cols-8 gap-1.5 max-h-36 overflow-y-auto p-1 border-2 border-slate-900 dark:border-slate-700 bg-slate-100 dark:bg-slate-800">
                                        {CATEGORY_ICON_LIST.map((item) => {
                                            const IconComp = item.icon;
                                            const isSelected = categoryFormData.icon === item.key;
                                            return (
                                                <button
                                                    key={item.key}
                                                    type="button"
                                                    onClick={() => setCategoryFormData({ ...categoryFormData, icon: item.key })}
                                                    title={`${item.label} (${item.key})`}
                                                    className={`flex flex-col items-center justify-center p-1.5 border-2 transition text-center ${isSelected
                                                            ? `${currentTheme.classes.bgPrimary} text-white border-slate-900 dark:border-slate-600 shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] dark:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] ring-1 ring-slate-900 dark:ring-slate-500 scale-105 z-10`
                                                            : 'bg-slate-50 dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700 hover:border-slate-900'
                                                        }`}
                                                >
                                                    <IconComp className="w-4 h-4 mb-0.5" />
                                                    <span className="text-[8.5px] font-semibold leading-tight line-clamp-1 w-full text-center">
                                                        {item.label.split(' ')[0]}
                                                    </span>
                                                </button>
                                            );
                                        })}
                                    </div>
                                    <div className="text-[9.5px] text-slate-500 dark:text-slate-400 italic">
                                        * Ikon ini akan otomatis tampil pada tombol menu POS kasir dan label kategori warung.
                                    </div>
                                </div>

                                <div className="pt-1 flex justify-end">
                                    <button
                                        type="submit"
                                        disabled={isCategorySubmitting}
                                        className={`py-1.5 px-3 ${currentTheme.classes.bgPrimary} ${currentTheme.classes.bgPrimaryHover} text-white font-extrabold text-xs uppercase tracking-wide border-2 border-slate-900 dark:border-slate-700 shadow-[1px_1px_0px_0px_rgba(15,23,42,1)] dark:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5 transition`}
                                    >
                                        {isCategorySubmitting ? 'Menyimpan...' : editingCategory ? 'Simpan Perubahan' : '+ Tambah Kategori'}
                                    </button>
                                </div>
                            </form>

                            {/* Daftar Kategori Yang Ada */}
                            <div>
                                <div className="font-extrabold text-[11px] uppercase tracking-wide text-slate-700 dark:text-slate-300 mb-2">
                                    Daftar Kategori Warung ({categories.length})
                                </div>
                                <div className="border-2 border-slate-900 dark:border-slate-700 overflow-hidden">
                                    <table className="w-full text-left text-xs border-collapse">
                                        <thead className="bg-slate-100 dark:bg-slate-950 border-b-2 border-slate-900 dark:border-slate-700 font-extrabold text-[10px] uppercase text-slate-700 dark:text-slate-300">
                                            <tr>
                                                <th className="py-2 px-3">Nama Kategori</th>
                                                <th className="py-2 px-2 text-center">Urutan</th>
                                                <th className="py-2 px-2 text-center">Jumlah Menu</th>
                                                <th className="py-2 px-3 text-center">Aksi</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                                            {categories.map((cat) => {
                                                const hasProducts = cat.products_count > 0;
                                                const CatIcon = getCategoryIcon(cat);
                                                return (
                                                    <tr key={cat.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
                                                        <td className="py-2 px-3">
                                                            <div className="flex items-center space-x-2">
                                                                <div className="w-7 h-7 bg-amber-100 dark:bg-amber-950/80 border border-slate-900 dark:border-slate-700 flex items-center justify-center text-slate-900 dark:text-amber-200 shrink-0 shadow-[1px_1px_0px_0px_rgba(15,23,42,1)] dark:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]">
                                                                    <CatIcon className="w-3.5 h-3.5" />
                                                                </div>
                                                                <div>
                                                                    <div className="font-bold text-slate-900 dark:text-white">{cat.name}</div>
                                                                    <div className="text-[10px] font-mono text-slate-500 dark:text-slate-400">
                                                                        {cat.slug} <span className={`${currentTheme.classes.textPrimary} font-bold`}>({cat.icon || 'Utensils'})</span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="py-2 px-2 text-center font-mono font-bold text-slate-700 dark:text-slate-300">
                                                            {cat.sort_order}
                                                        </td>
                                                        <td className="py-2 px-2 text-center">
                                                            <span className={`px-2 py-0.5 text-[10px] font-extrabold border ${hasProducts
                                                                    ? currentTheme.classes.badge
                                                                    : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-300 dark:border-slate-700'
                                                                }`}>
                                                                {cat.products_count} menu
                                                            </span>
                                                        </td>
                                                        <td className="py-2 px-3 text-center">
                                                            <div className="flex items-center justify-center space-x-1.5">
                                                                <button
                                                                    type="button"
                                                                    onClick={() => handleEditCategory(cat)}
                                                                    title="Ubah Nama/Urutan"
                                                                    className="p-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-400 dark:border-slate-700 transition"
                                                                >
                                                                    <Edit2 className="w-3 h-3" />
                                                                </button>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => handleDeleteCategory(cat)}
                                                                    title={hasProducts ? `Tidak bisa dihapus: masih ada ${cat.products_count} menu` : "Hapus Kategori"}
                                                                    className={`p-1 border transition ${hasProducts
                                                                            ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 border-slate-300 dark:border-slate-700 cursor-not-allowed opacity-60'
                                                                            : 'bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/40 text-rose-700 dark:text-rose-300 border-rose-400 dark:border-rose-800'
                                                                        }`}
                                                                >
                                                                    <Trash2 className="w-3 h-3" />
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                                <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-1.5 italic">
                                    * Kategori yang masih memiliki menu tidak dapat dihapus demi keamanan data produk Anda.
                                </div>
                            </div>
                        </div>

                        {/* Footer Modal */}
                        <div className="p-3 bg-slate-50 dark:bg-slate-950 border-t-2 border-slate-900 dark:border-slate-800 flex justify-end">
                            <button
                                type="button"
                                onClick={() => setIsCategoryModalOpen(false)}
                                className="py-2 px-4 bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 text-white font-extrabold text-xs uppercase tracking-wide border-2 border-slate-900 dark:border-slate-700"
                            >
                                Selesai
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
