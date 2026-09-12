<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\PosController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\SettingController;
use App\Http\Controllers\UserController;
use Illuminate\Support\Facades\Route;

// Rute Tamu / Guest (Autentikasi Login)
Route::middleware('guest')->group(function () {
    Route::get('/login', [AuthController::class, 'create'])->name('login');
    Route::post('/login', [AuthController::class, 'store'])->name('login.store')->middleware('throttle:10,1');
});

// Rute Terproteksi Autentikasi (Harus Login)
Route::middleware('auth')->group(function () {
    // Logout
    Route::post('/logout', [AuthController::class, 'destroy'])->name('logout');

    // Halaman Root (Arahkan sesuai role)
    Route::get('/', function () {
        if (auth()->user()->role === 'owner') {
            return redirect()->route('dashboard.index');
        }
        return redirect()->route('pos.index');
    });

    // Rute Operasional Kasir (Dapat diakses Owner & Cashier)
    Route::get('/pos', [PosController::class, 'index'])->name('pos.index');
    Route::post('/pos/orders', [PosController::class, 'store'])->name('pos.store');

    // Riwayat Transaksi (Dapat diakses Owner & Cashier)
    Route::get('/orders', [OrderController::class, 'index'])->name('orders.index');
    Route::get('/orders/{id}', [OrderController::class, 'show'])->name('orders.show');

    // Rute Khusus Pemilik (Role: Owner)
    Route::middleware('role:owner')->group(function () {
        // Dashboard Pemilik (Analitik & Omzet)
        Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard.index');

        // Manajemen Menu (Katalog Produk & HPP)
        Route::get('/products', [ProductController::class, 'index'])->name('products.index');
        Route::post('/products', [ProductController::class, 'store'])->name('products.store');
        Route::put('/products/{product}', [ProductController::class, 'update'])->name('products.update');
        Route::patch('/products/{product}/toggle', [ProductController::class, 'toggle'])->name('products.toggle');
        Route::delete('/products/{product}', [ProductController::class, 'destroy'])->name('products.destroy');

        // Manajemen Kategori
        Route::post('/categories', [CategoryController::class, 'store'])->name('categories.store');
        Route::put('/categories/{category}', [CategoryController::class, 'update'])->name('categories.update');
        Route::delete('/categories/{category}', [CategoryController::class, 'destroy'])->name('categories.destroy');

        // Manajemen Kasir & Pengguna
        Route::get('/users', [UserController::class, 'index'])->name('users.index');
        Route::post('/users', [UserController::class, 'store'])->name('users.store');
        Route::put('/users/{user}', [UserController::class, 'update'])->name('users.update');
        Route::delete('/users/{user}', [UserController::class, 'destroy'])->name('users.destroy');

        // Pengaturan Warung & Tema Visual
        Route::get('/settings', [SettingController::class, 'index'])->name('settings.index');
        Route::put('/settings', [SettingController::class, 'update'])->name('settings.update');
    });
});
