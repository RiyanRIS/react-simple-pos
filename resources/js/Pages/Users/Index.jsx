import React, { useState } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import Navbar from '@/Components/Navbar';
import {
    Users,
    UserCheck,
    UserPlus,
    Shield,
    Search,
    Plus,
    Edit2,
    Trash2,
    Eye,
    EyeOff,
    Lock,
    Mail,
    CheckCircle2,
    ShieldAlert,
    AlertTriangle,
    X,
    ChevronLeft,
    ChevronRight,
    ShoppingBag,
    KeyRound
} from 'lucide-react';
import { getActiveTheme } from '@/Utils/themeHelper';

export default function UsersIndex({ users, stats, filters }) {
    const { auth, flash, errors, store } = usePage().props;
    const currentTheme = getActiveTheme(store?.theme_color);

    // Filter & Search State
    const [search, setSearch] = useState(filters.search || '');
    const [selectedRole, setSelectedRole] = useState(filters.role || '');

    // Modal Form State (Tambah / Edit)
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        role: 'cashier',
        password: '',
    });

    // Modal Hapus State
    const [deletingUser, setDeletingUser] = useState(null);

    // Trigger Filter
    const handleFilterChange = (newFilters) => {
        router.get('/users', {
            search: newFilters.search !== undefined ? newFilters.search : search,
            role: newFilters.role !== undefined ? newFilters.role : selectedRole,
        }, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        handleFilterChange({ search });
    };

    // Buka Modal Tambah User
    const handleOpenAddModal = () => {
        setEditingUser(null);
        setFormData({
            name: '',
            email: '',
            role: 'cashier',
            password: '',
        });
        setShowPassword(false);
        setIsFormModalOpen(true);
    };

    // Buka Modal Edit User
    const handleOpenEditModal = (user) => {
        setEditingUser(user);
        setFormData({
            name: user.name,
            email: user.email,
            role: user.role,
            password: '',
        });
        setShowPassword(false);
        setIsFormModalOpen(true);
    };

    // Simpan Form (Create / Update)
    const handleFormSubmit = (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        const payload = {
            name: formData.name,
            email: formData.email,
            role: formData.role,
        };

        if (formData.password) {
            payload.password = formData.password;
        }

        if (editingUser) {
            router.put(`/users/${editingUser.id}`, payload, {
                onSuccess: () => {
                    setIsFormModalOpen(false);
                    setEditingUser(null);
                },
                onFinish: () => setIsSubmitting(false),
            });
        } else {
            router.post('/users', payload, {
                onSuccess: () => {
                    setIsFormModalOpen(false);
                },
                onFinish: () => setIsSubmitting(false),
            });
        }
    };

    // Eksekusi Hapus User
    const handleConfirmDelete = () => {
        if (!deletingUser) return;
        router.delete(`/users/${deletingUser.id}`, {
            onSuccess: () => setDeletingUser(null),
        });
    };

    return (
        <div className="min-h-screen bg-slate-100 dark:bg-slate-950 flex flex-col font-sans text-slate-900 dark:text-slate-100">
            <Head title={`Kelola Kasir & Pengguna - ${store?.name || 'Pecel Lele Sedap'}`} />

            {/* Navbar Utama */}
            <Navbar />

            {/* Notifikasi Flash Success */}
            {flash?.success?.message && (
                <div className="max-w-7xl w-full mx-auto px-3 sm:px-6 pt-3">
                    <div className={`p-3 ${currentTheme.classes.badge} border-2 border-slate-900 dark:border-slate-800 shadow-[3px_3px_0px_0px_rgba(15,23,42,1)] dark:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] flex items-center justify-between`}>
                        <div className={`flex items-center space-x-2 ${currentTheme.classes.textPrimaryDark} text-xs font-bold`}>
                            <CheckCircle2 className={`w-4 h-4 ${currentTheme.classes.textPrimary}`} />
                            <span>{flash.success.message}</span>
                        </div>
                    </div>
                </div>
            )}

            {/* Notifikasi Error Proteksi */}
            {(flash?.error || errors?.user) && (
                <div className="max-w-7xl w-full mx-auto px-3 sm:px-6 pt-3">
                    <div className="p-3 bg-rose-50 dark:bg-rose-950/60 border-2 border-slate-900 dark:border-slate-800 shadow-[3px_3px_0px_0px_rgba(15,23,42,1)] dark:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] flex items-start space-x-2 text-rose-950 dark:text-rose-200 text-xs font-bold">
                        <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                        <span>{flash?.error || errors?.user}</span>
                    </div>
                </div>
            )}

            {/* Content Container */}
            <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-6 space-y-4 sm:space-y-5">
                {/* Header Title & Tombol Aksi */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 sm:p-5 border-2 border-slate-900 dark:border-slate-800 shadow-[3px_3px_0px_0px_rgba(15,23,42,1)] dark:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
                    <div>
                        <div className="flex items-center space-x-2">
                            <span className={`p-1.5 ${currentTheme.classes.bgPrimary} border-2 border-slate-900 dark:border-slate-700 text-white font-black`}>
                                <Users className="w-5 h-5" />
                            </span>
                            <h1 className="text-lg sm:text-xl font-black uppercase tracking-tight text-slate-900 dark:text-white">
                                Kelola Kasir & Pengguna
                            </h1>
                        </div>
                        <p className="text-xs font-medium text-slate-600 dark:text-slate-400 mt-1">
                            Atur staf kasir yang melayani operasional POS dan kelola akun pemilik warung.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={handleOpenAddModal}
                        className={`py-2.5 px-4 ${currentTheme.classes.bgPrimary} ${currentTheme.classes.bgPrimaryHover} text-white font-black text-xs uppercase tracking-wide border-2 border-slate-900 dark:border-slate-700 shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] dark:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5 transition flex items-center justify-center space-x-1.5 shrink-0`}
                    >
                        <UserPlus className="w-4 h-4" />
                        <span>Tambah Kasir / Pengguna</span>
                    </button>
                </div>

                {/* Ringkasan Statistik Pengguna */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="bg-white dark:bg-slate-900 p-3.5 border-2 border-slate-900 dark:border-slate-800 shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] dark:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                        <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Total Pengguna Terdaftar</div>
                        <div className="text-2xl font-black text-slate-900 dark:text-white font-mono mt-0.5">
                            {stats.total} <span className="text-xs font-sans text-slate-500 dark:text-slate-400 font-semibold">akun</span>
                        </div>
                    </div>

                    <div className="bg-sky-50 dark:bg-sky-950/40 border-2 border-slate-900 dark:border-slate-800 shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] dark:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] p-3.5">
                        <div className="text-[11px] font-bold text-sky-800 dark:text-sky-300 uppercase tracking-wide flex items-center space-x-1">
                            <UserCheck className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
                            <span>Staf Kasir (POS)</span>
                        </div>
                        <div className="text-2xl font-black text-sky-950 dark:text-sky-100 font-mono mt-0.5">
                            {stats.cashiers} <span className="text-xs font-sans text-sky-700 dark:text-sky-300 font-semibold">orang</span>
                        </div>
                    </div>

                    <div className="bg-amber-50 dark:bg-amber-950/40 border-2 border-slate-900 dark:border-slate-800 shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] dark:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] p-3.5">
                        <div className="text-[11px] font-bold text-amber-800 dark:text-amber-300 uppercase tracking-wide flex items-center space-x-1">
                            <Shield className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                            <span>Pemilik (Owner)</span>
                        </div>
                        <div className="text-2xl font-black text-amber-950 dark:text-amber-100 font-mono mt-0.5">
                            {stats.owners} <span className="text-xs font-sans text-amber-700 dark:text-amber-300 font-semibold">orang</span>
                        </div>
                    </div>
                </div>

                {/* Filter & Search Bar */}
                <div className="bg-white dark:bg-slate-900 p-3.5 border-2 border-slate-900 dark:border-slate-800 shadow-[3px_3px_0px_0px_rgba(15,23,42,1)] dark:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] flex flex-col sm:flex-row gap-2.5 items-stretch sm:items-center justify-between">
                    {/* Search Input */}
                    <form onSubmit={handleSearchSubmit} className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Cari nama kasir atau email..."
                            className="w-full pl-9 pr-20 py-2 bg-slate-50 dark:bg-slate-800 border-2 border-slate-900 dark:border-slate-700 text-xs font-semibold text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:border-slate-900 dark:focus:border-slate-500"
                        />
                        <button
                            type="submit"
                            className="absolute right-1.5 top-1/2 -translate-y-1/2 px-2.5 py-1 bg-slate-900 dark:bg-slate-700 text-white text-[11px] font-bold hover:bg-slate-800 dark:hover:bg-slate-600"
                        >
                            Cari
                        </button>
                    </form>

                    {/* Filter Role */}
                    <div className="flex items-center space-x-2 shrink-0">
                        <span className="text-xs font-bold text-slate-600 dark:text-slate-300">Peran:</span>
                        <select
                            value={selectedRole}
                            onChange={(e) => {
                                setSelectedRole(e.target.value);
                                handleFilterChange({ role: e.target.value });
                            }}
                            className="py-2 px-3 bg-slate-50 dark:bg-slate-800 border-2 border-slate-900 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-slate-900 dark:focus:border-slate-500"
                        >
                            <option value="">Semua Peran ({stats.total})</option>
                            <option value="cashier">Khusus Kasir ({stats.cashiers})</option>
                            <option value="owner">Khusus Pemilik ({stats.owners})</option>
                        </select>
                    </div>
                </div>

                {/* Tabel Data Pengguna */}
                <div className="bg-white dark:bg-slate-900 border-2 border-slate-900 dark:border-slate-800 shadow-[3px_3px_0px_0px_rgba(15,23,42,1)] dark:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs border-collapse">
                            <thead className="bg-slate-100 dark:bg-slate-950 border-b-2 border-slate-900 dark:border-slate-800 font-extrabold text-[11px] uppercase tracking-wider text-slate-700 dark:text-slate-300">
                                <tr>
                                    <th className="py-3 px-4">Nama Pengguna</th>
                                    <th className="py-3 px-4">Peran (Role)</th>
                                    <th className="py-3 px-4 text-center">Riwayat Pelayanan POS</th>
                                    <th className="py-3 px-4 text-center">Tanggal Dibuat</th>
                                    <th className="py-3 px-4 text-center">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y-2 divide-slate-100 dark:divide-slate-800">
                                {users.data.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="py-12 text-center text-slate-500 dark:text-slate-400">
                                            <div className="flex flex-col items-center justify-center space-y-2">
                                                <Users className="w-8 h-8 text-slate-400" />
                                                <span className="font-bold text-sm">Tidak ada pengguna yang ditemukan.</span>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    users.data.map((user) => {
                                        const isCurrentUser = auth?.user?.id === user.id;
                                        const isOwner = user.role === 'owner';

                                        return (
                                            <tr key={user.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition">
                                                {/* Kolom Pengguna */}
                                                <td className="py-3 px-4">
                                                    <div className="flex items-center space-x-3">
                                                        <div className={`w-9 h-9 border-2 border-slate-900 dark:border-slate-700 flex items-center justify-center font-black text-xs uppercase shrink-0 shadow-[1px_1px_0px_0px_rgba(15,23,42,1)] dark:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] ${isOwner ? 'bg-amber-300 dark:bg-amber-500 text-amber-950' : 'bg-sky-300 dark:bg-sky-500 text-sky-950'
                                                            }`}>
                                                            {user.name.charAt(0)}
                                                        </div>
                                                        <div>
                                                            <div className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center space-x-1.5">
                                                                <span>{user.name}</span>
                                                                {isCurrentUser && (
                                                                    <span className={`px-1.5 py-0.2 ${currentTheme.classes.badge} text-[10px] font-black border`}>
                                                                        Anda
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <div className="text-xs text-slate-500 dark:text-slate-400 font-mono flex items-center space-x-1">
                                                                <Mail className="w-3 h-3 text-slate-400" />
                                                                <span>{user.email}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>

                                                {/* Kolom Peran */}
                                                <td className="py-3 px-4">
                                                    <span className={`inline-flex items-center space-x-1 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider border-2 border-slate-900 dark:border-slate-700 shadow-[1px_1px_0px_0px_rgba(15,23,42,1)] dark:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] ${isOwner
                                                            ? 'bg-amber-100 dark:bg-amber-950/80 text-amber-950 dark:text-amber-200 border-slate-900 dark:border-slate-700'
                                                            : 'bg-sky-100 dark:bg-sky-950/80 text-sky-950 dark:text-sky-200 border-slate-900 dark:border-slate-700'
                                                        }`}>
                                                        {isOwner ? (
                                                            <>
                                                                <Shield className="w-3 h-3 text-amber-700 dark:text-amber-400" />
                                                                <span>Pemilik</span>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <UserCheck className="w-3 h-3 text-sky-700 dark:text-sky-400" />
                                                                <span>Kasir POS</span>
                                                            </>
                                                        )}
                                                    </span>
                                                </td>

                                                {/* Kolom Pelayanan POS */}
                                                <td className="py-3 px-4 text-center">
                                                    <div className="font-mono font-extrabold text-slate-800 dark:text-slate-200">
                                                        {user.orders_count} Transaksi
                                                    </div>
                                                    <div className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                                                        Rp {(user.orders_sum_total_amount || 0).toLocaleString('id-ID')}
                                                    </div>
                                                </td>

                                                {/* Kolom Tanggal Dibuat */}
                                                <td className="py-3 px-4 text-center text-slate-600 dark:text-slate-400 font-mono text-[11px]">
                                                    {new Date(user.created_at).toLocaleDateString('id-ID', {
                                                        day: 'numeric',
                                                        month: 'short',
                                                        year: 'numeric',
                                                    })}
                                                </td>

                                                {/* Kolom Aksi */}
                                                <td className="py-3 px-4 text-center">
                                                    <div className="flex items-center justify-center space-x-1.5">
                                                        <button
                                                            type="button"
                                                            onClick={() => handleOpenEditModal(user)}
                                                            title="Ubah Data / Reset Sandi"
                                                            className="p-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border-2 border-slate-900 dark:border-slate-700 shadow-[1px_1px_0px_0px_rgba(15,23,42,1)] dark:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5 transition"
                                                        >
                                                            <Edit2 className="w-3.5 h-3.5" />
                                                        </button>

                                                        <button
                                                            type="button"
                                                            disabled={isCurrentUser}
                                                            onClick={() => setDeletingUser(user)}
                                                            title={isCurrentUser ? "Anda tidak dapat menghapus akun Anda sendiri" : "Hapus Pengguna"}
                                                            className={`p-1.5 border-2 border-slate-900 dark:border-slate-700 shadow-[1px_1px_0px_0px_rgba(15,23,42,1)] dark:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] transition ${isCurrentUser
                                                                    ? 'bg-slate-100 dark:bg-slate-900 text-slate-400 dark:text-slate-600 border-slate-300 dark:border-slate-800 opacity-50 cursor-not-allowed'
                                                                    : 'bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/40 text-rose-700 dark:text-rose-300 active:translate-x-0.5 active:translate-y-0.5'
                                                                }`}
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
                    {users.links && users.links.length > 3 && (
                        <div className="p-3 bg-slate-50 dark:bg-slate-900/80 border-t-2 border-slate-900 dark:border-slate-800 flex items-center justify-between">
                            <div className="text-xs text-slate-600 dark:text-slate-400 font-semibold">
                                Menampilkan <span className="font-bold">{users.from || 0}</span> - <span className="font-bold">{users.to || 0}</span> dari <span className="font-bold">{users.total}</span> pengguna
                            </div>
                            <div className="flex items-center space-x-1">
                                {users.links.map((link, i) => (
                                    <button
                                        key={i}
                                        disabled={!link.url}
                                        onClick={() => link.url && router.get(link.url, {}, { preserveState: true, preserveScroll: true })}
                                        className={`px-2.5 py-1 text-xs font-extrabold border-2 border-slate-900 dark:border-slate-700 transition ${link.active
                                                ? `${currentTheme.classes.bgPrimary} text-white shadow-[1px_1px_0px_0px_rgba(15,23,42,1)] dark:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]`
                                                : link.url
                                                    ? 'bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200'
                                                    : 'bg-slate-100 dark:bg-slate-900 text-slate-400 dark:text-slate-600 border-slate-300 dark:border-slate-800 cursor-not-allowed'
                                            }`}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </main>

            {/* MODAL FORM TAMBAH / EDIT PENGGUNA */}
            {isFormModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white dark:bg-slate-900 border-2 border-slate-900 dark:border-slate-800 shadow-[6px_6px_0px_0px_rgba(15,23,42,1)] dark:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] w-full max-w-md overflow-hidden animate-scale-up">
                        {/* Header Modal */}
                        <div className="bg-slate-900 dark:bg-slate-950 text-white p-3.5 flex items-center justify-between border-b-2 border-slate-900 dark:border-slate-800">
                            <div className="font-black text-sm uppercase tracking-wider flex items-center space-x-2">
                                <KeyRound className={`w-4 h-4 ${currentTheme.classes.textPrimary}`} />
                                <span>{editingUser ? `Edit Akun: ${editingUser.name}` : 'Tambah Kasir / Pengguna Baru'}</span>
                            </div>
                            <button
                                onClick={() => setIsFormModalOpen(false)}
                                className="p-1 hover:bg-slate-800 text-slate-400 hover:text-white transition"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Body Form Modal */}
                        <form onSubmit={handleFormSubmit} className="p-4 sm:p-5 space-y-3.5 text-xs font-semibold">
                            {/* Error Validasi Form */}
                            {Object.keys(errors).length > 0 && (
                                <div className="p-3 bg-rose-50 dark:bg-rose-950/60 border-2 border-rose-600 dark:border-rose-500 text-rose-900 dark:text-rose-200 text-xs font-bold space-y-1">
                                    {Object.values(errors).map((err, idx) => (
                                        <div key={idx} className="flex items-center space-x-1.5">
                                            <ShieldAlert className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                                            <span>{err}</span>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Nama Lengkap */}
                            <div>
                                <label className="block text-[11px] font-extrabold uppercase text-slate-700 dark:text-slate-300 mb-1">
                                    Nama Lengkap *
                                </label>
                                <input
                                    type="text"
                                    required
                                    placeholder="Misal: Siti Nurhaliza, Budi..."
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border-2 border-slate-900 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:border-slate-900 dark:focus:border-slate-500"
                                />
                            </div>

                            {/* Email */}
                            <div>
                                <label className="block text-[11px] font-extrabold uppercase text-slate-700 dark:text-slate-300 mb-1">
                                    Alamat Email *
                                </label>
                                <input
                                    type="email"
                                    required
                                    placeholder="kasir@penyetan.com"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border-2 border-slate-900 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:border-slate-900 dark:focus:border-slate-500"
                                />
                            </div>

                            {/* Role / Hak Akses */}
                            <div>
                                <label className="block text-[11px] font-extrabold uppercase text-slate-700 dark:text-slate-300 mb-1">
                                    Peran (Hak Akses) *
                                </label>
                                <div className="grid grid-cols-2 gap-2">
                                    <label className={`p-2.5 border-2 cursor-pointer transition flex flex-col space-y-1 ${formData.role === 'cashier'
                                            ? 'bg-sky-50 dark:bg-sky-950/50 border-slate-900 dark:border-slate-600 shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] dark:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] ring-1 ring-slate-900 dark:ring-slate-500'
                                            : 'bg-white dark:bg-slate-800/80 border-slate-300 dark:border-slate-700 hover:border-slate-800 dark:hover:border-slate-500'
                                        }`}>
                                        <div className="flex items-center justify-between">
                                            <span className="font-extrabold text-[11px] uppercase text-sky-950 dark:text-sky-200">Kasir (POS)</span>
                                            <input
                                                type="radio"
                                                name="role"
                                                value="cashier"
                                                checked={formData.role === 'cashier'}
                                                onChange={() => setFormData({ ...formData, role: 'cashier' })}
                                                className="text-sky-600 focus:ring-0"
                                            />
                                        </div>
                                        <span className="text-[10px] text-slate-500 dark:text-slate-400 font-normal">
                                            Hanya akses kasir & riwayat transaksi
                                        </span>
                                    </label>

                                    <label className={`p-2.5 border-2 cursor-pointer transition flex flex-col space-y-1 ${formData.role === 'owner'
                                            ? 'bg-amber-50 dark:bg-amber-950/50 border-slate-900 dark:border-slate-600 shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] dark:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] ring-1 ring-slate-900 dark:ring-slate-500'
                                            : 'bg-white dark:bg-slate-800/80 border-slate-300 dark:border-slate-700 hover:border-slate-800 dark:hover:border-slate-500'
                                        }`}>
                                        <div className="flex items-center justify-between">
                                            <span className="font-extrabold text-[11px] uppercase text-amber-950 dark:text-amber-200">Pemilik</span>
                                            <input
                                                type="radio"
                                                name="role"
                                                value="owner"
                                                checked={formData.role === 'owner'}
                                                onChange={() => setFormData({ ...formData, role: 'owner' })}
                                                className="text-amber-600 focus:ring-0"
                                            />
                                        </div>
                                        <span className="text-[10px] text-slate-500 dark:text-slate-400 font-normal">
                                            Akses penuh (menu, laba, pengguna)
                                        </span>
                                    </label>
                                </div>
                            </div>

                            {/* Kata Sandi */}
                            <div>
                                <div className="flex items-center justify-between mb-1">
                                    <label className="block text-[11px] font-extrabold uppercase text-slate-700 dark:text-slate-300">
                                        Kata Sandi {editingUser ? '(Opsional)' : '*'}
                                    </label>
                                    {editingUser && (
                                        <span className="text-[10px] text-slate-500 dark:text-slate-400 italic">
                                            Kosongkan jika tidak ingin ganti sandi
                                        </span>
                                    )}
                                </div>
                                <div className="relative">
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        required={!editingUser}
                                        placeholder={editingUser ? '•••••••• (Biarkan kosong jika tidak diubah)' : 'Minimal 6 karakter'}
                                        value={formData.password}
                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                        className="w-full px-3 pr-10 py-2 bg-slate-50 dark:bg-slate-800 border-2 border-slate-900 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:border-slate-900 dark:focus:border-slate-500"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 p-0.5"
                                    >
                                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                            </div>

                            {/* Tombol Aksi Modal */}
                            <div className="pt-3 border-t-2 border-slate-200 dark:border-slate-800 flex items-center justify-end space-x-2">
                                <button
                                    type="button"
                                    onClick={() => setIsFormModalOpen(false)}
                                    className="py-2 px-3.5 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-extrabold text-xs uppercase tracking-wide border-2 border-slate-900 dark:border-slate-700 transition"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className={`py-2 px-4 ${currentTheme.classes.bgPrimary} ${currentTheme.classes.bgPrimaryHover} text-white font-black text-xs uppercase tracking-wider border-2 border-slate-900 dark:border-slate-700 shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] dark:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5 transition`}
                                >
                                    {isSubmitting ? 'Menyimpan...' : editingUser ? 'Simpan Perubahan' : 'Daftarkan Pengguna'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* MODAL KONFIRMASI HAPUS PENGGUNA */}
            {deletingUser && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white dark:bg-slate-900 border-2 border-slate-900 dark:border-slate-800 shadow-[6px_6px_0px_0px_rgba(15,23,42,1)] dark:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] w-full max-w-md p-5 space-y-4 animate-scale-up">
                        <div className="flex items-start space-x-3">
                            <div className="p-2 bg-rose-100 dark:bg-rose-950/60 border-2 border-slate-900 dark:border-slate-700 text-rose-700 dark:text-rose-300 shrink-0">
                                <AlertTriangle className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="font-black text-base text-slate-900 dark:text-white uppercase">
                                    Hapus Pengguna "{deletingUser.name}"?
                                </h3>
                                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                                    Akun ini ({deletingUser.email}) tidak akan dapat lagi masuk ke dalam sistem POS maupun web.
                                </p>
                                <div className="mt-2 p-2 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-[11px] text-slate-600 dark:text-slate-300">
                                    * Seluruh data transaksi masa lalu yang pernah dilayani oleh kasir ini <strong>tetap aman tersimpan</strong> di riwayat transaksi.
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center justify-end space-x-2 pt-2 border-t-2 border-slate-100 dark:border-slate-800">
                            <button
                                type="button"
                                onClick={() => setDeletingUser(null)}
                                className="py-2 px-3.5 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-extrabold text-xs uppercase tracking-wide border-2 border-slate-900 dark:border-slate-700 transition"
                            >
                                Batal
                            </button>
                            <button
                                type="button"
                                onClick={handleConfirmDelete}
                                className="py-2 px-4 bg-rose-600 hover:bg-rose-700 text-white font-black text-xs uppercase tracking-wider border-2 border-slate-900 dark:border-slate-700 shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] dark:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5 transition"
                            >
                                Ya, Hapus Pengguna
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
