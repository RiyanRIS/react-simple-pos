<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class AuthController extends Controller
{
    /**
     * Tampilkan Halaman Login
     */
    public function create(): Response
    {
        return Inertia::render('Auth/Login', [
            'showDemoAccounts' => app()->environment('local'),
        ]);
    }

    /**
     * Proses Autentikasi Pengguna dengan Proteksi Brute-Force
     */
    public function store(Request $request)
    {
        $credentials = $request->validate([
            'email' => ['required', 'string', 'email'],
            'password' => ['required', 'string'],
        ]);

        $remember = $request->boolean('remember');

        // Throttle key unik berdasarkan kombinasi email dan alamat IP
        $throttleKey = Str::transliterate(Str::lower($request->input('email')) . '|' . $request->ip());

        // Maksimal 5 percobaan gagal per menit
        if (RateLimiter::tooManyAttempts($throttleKey, 5)) {
            $seconds = RateLimiter::availableIn($throttleKey);
            throw ValidationException::withMessages([
                'email' => "Terlalu banyak percobaan masuk yang gagal. Demi keamanan, silakan tunggu {$seconds} detik sebelum mencoba kembali.",
            ]);
        }

        if (! Auth::attempt($credentials, $remember)) {
            // Catat percobaan gagal (berlaku selama 60 detik)
            RateLimiter::hit($throttleKey, 60);

            throw ValidationException::withMessages([
                'email' => 'Email atau kata sandi yang Anda masukkan salah.',
            ]);
        }

        // Reset hitung percobaan gagal setelah berhasil login
        RateLimiter::clear($throttleKey);

        $request->session()->regenerate();

        $user = Auth::user();

        // Redirect cerdas berdasarkan role pengguna
        if ($user->role === 'owner') {
            return redirect()->intended(route('dashboard.index'));
        }

        return redirect()->intended(route('pos.index'));
    }

    /**
     * Logout Pengguna
     */
    public function destroy(Request $request)
    {
        Auth::logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect()->route('login')->with('success', [
            'message' => 'Anda telah berhasil keluar.',
        ]);
    }
}

