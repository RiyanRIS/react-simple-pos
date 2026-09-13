<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Mode Demo Aplikasi
    |--------------------------------------------------------------------------
    |
    | Jika bernilai true:
    | 1. Menampilkan 1-klik akun demo di halaman login (Owner & Kasir).
    | 2. Menampilkan banner demo & tombol kontak WhatsApp / Telegram pengembang.
    | 3. Mengaktifkan jadwal cron reset database otomatis di server STB.
    |
    | Ubah ke false di file .env saat dipasang untuk klien asli (Production).
    |
    */
    'enabled' => env('APP_DEMO_MODE', false),

    /*
    |--------------------------------------------------------------------------
    | Identitas & Kontak Pengembang
    |--------------------------------------------------------------------------
    |
    | Data ini digunakan pada banner demo dan tombol kontak ajakan pasang gratis.
    |
    */
    'developer_name' => env('DEMO_DEV_NAME', 'Developer'),
    'whatsapp' => env('DEMO_CONTACT_WA', '6281234567890'),
    'telegram' => env('DEMO_CONTACT_TELEGRAM', 'username_kamu'),

    /*
    |--------------------------------------------------------------------------
    | Interval Auto Reset Database
    |--------------------------------------------------------------------------
    |
    | Pilihan: 'hourly', 'every_two_hours', 'daily'
    |
    */
    'reset_interval' => env('DEMO_RESET_INTERVAL', 'hourly'),
];
