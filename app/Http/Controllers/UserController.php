<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class UserController extends Controller
{
    /**
     * Tampilkan Daftar Pengguna & Kasir
     */
    public function index(Request $request): Response
    {
        $query = User::withCount('orders')
            ->withSum('orders', 'total_amount');

        // Filter Pencarian Nama atau Email
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
        }

        // Filter Berdasarkan Role (owner / cashier)
        if ($request->filled('role')) {
            $query->where('role', $request->role);
        }

        $users = $query->orderBy('role', 'asc')
            ->orderBy('name', 'asc')
            ->paginate(15)
            ->withQueryString();

        // Statistik Pengguna
        $totalUsers = User::count();
        $totalCashiers = User::where('role', 'cashier')->count();
        $totalOwners = User::where('role', 'owner')->count();

        return Inertia::render('Users/Index', [
            'users' => $users,
            'stats' => [
                'total' => $totalUsers,
                'cashiers' => $totalCashiers,
                'owners' => $totalOwners,
            ],
            'filters' => [
                'search' => $request->search ?? '',
                'role' => $request->role ?? '',
            ],
        ]);
    }

    /**
     * Tambah Pengguna / Kasir Baru
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users,email'],
            'password' => ['required', 'string', 'min:6'],
            'role' => ['required', 'in:owner,cashier'],
        ], [
            'name.required' => 'Nama lengkap wajib diisi.',
            'email.required' => 'Email wajib diisi.',
            'email.email' => 'Format email tidak valid.',
            'email.unique' => 'Email ini sudah terdaftar di sistem.',
            'password.required' => 'Kata sandi wajib diisi.',
            'password.min' => 'Kata sandi minimal 6 karakter.',
            'role.in' => 'Pilihan peran tidak valid.',
        ]);

        $user = User::create([
            'name' => trim($validated['name']),
            'email' => strtolower(trim($validated['email'])),
            'password' => Hash::make($validated['password']),
            'role' => $validated['role'],
        ]);

        return redirect()->back()->with('success', [
            'message' => "Akun {$user->name} (" . ($user->role === 'owner' ? 'Pemilik' : 'Kasir') . ") berhasil didaftarkan!",
        ]);
    }

    /**
     * Perbarui Data Pengguna / Kasir
     */
    public function update(Request $request, User $user)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', Rule::unique('users', 'email')->ignore($user->id)],
            'role' => ['required', 'in:owner,cashier'],
            'password' => ['nullable', 'string', 'min:6'],
        ], [
            'name.required' => 'Nama lengkap wajib diisi.',
            'email.required' => 'Email wajib diisi.',
            'email.email' => 'Format email tidak valid.',
            'email.unique' => 'Email ini sudah digunakan oleh akun lain.',
            'password.min' => 'Kata sandi minimal 6 karakter.',
        ]);

        // Proteksi: Tidak boleh mengubah role satu-satunya pemilik menjadi kasir
        if ($user->role === 'owner' && $validated['role'] === 'cashier') {
            $otherOwnersCount = User::where('role', 'owner')->where('id', '!=', $user->id)->count();
            if ($otherOwnersCount === 0) {
                return redirect()->back()->withErrors([
                    'user' => 'Tidak dapat mengubah role satu-satunya Pemilik warung menjadi kasir.',
                ]);
            }
        }

        $updateData = [
            'name' => trim($validated['name']),
            'email' => strtolower(trim($validated['email'])),
            'role' => $validated['role'],
        ];

        // Jika password diisi, perbarui password
        if (!empty($validated['password'])) {
            $updateData['password'] = Hash::make($validated['password']);
        }

        $user->update($updateData);

        return redirect()->back()->with('success', [
            'message' => "Data akun {$user->name} berhasil diperbarui!",
        ]);
    }

    /**
     * Hapus Pengguna / Kasir
     */
    public function destroy(User $user)
    {
        // Proteksi 1: Tidak boleh menghapus akun yang sedang digunakan saat ini
        if ($user->id === Auth::id()) {
            return redirect()->back()->withErrors([
                'user' => 'Anda tidak dapat menghapus akun Anda sendiri yang sedang aktif digunakan.',
            ]);
        }

        // Proteksi 2: Tidak boleh menghapus satu-satunya pemilik di sistem
        if ($user->role === 'owner') {
            $otherOwnersCount = User::where('role', 'owner')->where('id', '!=', $user->id)->count();
            if ($otherOwnersCount === 0) {
                return redirect()->back()->withErrors([
                    'user' => 'Tidak dapat menghapus satu-satunya akun Pemilik warung di sistem.',
                ]);
            }
        }

        $userName = $user->name;
        $user->delete();

        return redirect()->back()->with('success', [
            'message' => "Akun {$userName} berhasil dihapus dari sistem!",
        ]);
    }
}
