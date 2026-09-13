<?php

namespace App\Providers;

use Illuminate\Support\Facades\URL;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // Paksa skema HTTPS jika di production, APP_URL menggunakan https,
        // atau request datang dari reverse proxy HTTPS (Cloudflare / Cloudflare Tunnel / SSL Proxy)
        if (
            app()->environment('production') ||
            str_starts_with((string) config('app.url'), 'https://') ||
            request()->header('X-Forwarded-Proto') === 'https' ||
            request()->server('HTTP_X_FORWARDED_PROTO') === 'https'
        ) {
            URL::forceScheme('https');
        }
    }
}
