<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Cache;

class StoreSetting extends Model
{
    use HasFactory;

    protected $table = 'store_settings';

    protected $fillable = [
        'name',
        'tagline',
        'initials',
        'logo_path',
        'theme_color',
        'address',
        'phone',
        'receipt_footer',
        'receipt_auto_print',
        'enable_table_number',
        'tax_percentage',
    ];

    protected $casts = [
        'receipt_auto_print' => 'boolean',
        'enable_table_number' => 'boolean',
        'tax_percentage' => 'float',
    ];

    /**
     * Mengambil data pengaturan toko aktif (single row).
     * Jika belum ada, otomatis membuat data default dan mencache-nya.
     */
    public static function current(): self
    {
        return Cache::rememberForever('active_store_settings', function () {
            return self::firstOrCreate([], [
                'name' => 'Pecel Lele Sedap',
                'tagline' => 'Sistem Kasir POS & Manajemen Warung',
                'initials' => 'PL',
                'theme_color' => 'emerald',
                'address' => 'Jl. Raya Warung Malam No. 12',
                'phone' => '0812-3456-7890',
                'receipt_footer' => "Matur Nuwun / Terima Kasih\nSelamat Menikmati Hidangan Kami",
                'receipt_auto_print' => false,
                'enable_table_number' => true,
                'tax_percentage' => 0,
            ]);
        });
    }

    /**
     * Hapus cache pengaturan toko saat diperbarui.
     */
    public static function clearCache(): void
    {
        Cache::forget('active_store_settings');
    }
}
