<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Log;

class ResetDemoCommand extends Command
{
    /**
     * Nama dan signature dari console command.
     *
     * @var string
     */
    protected $signature = 'app:reset-demo {--force : Paksa eksekusi meskipun tidak dalam mode demo}';

    /**
     * Deskripsi console command.
     *
     * @var string
     */
    protected $description = 'Me-reset database demo ke data awal (seeding) dan membersihkan cache';

    /**
     * Eksekusi console command.
     */
    public function handle(): int
    {
        $isDemo = config('demo.enabled', false);
        $force = $this->option('force');

        if (! $isDemo && ! $force) {
            $this->warn('Mode demo dinonaktifkan (APP_DEMO_MODE=false). Reset dibatalkan untuk melindungi data produksi.');
            Log::info('[ResetDemoCommand] Eksekusi reset dibatalkan karena mode demo tidak aktif.');
            return Command::SUCCESS;
        }

        $this->info('Memulai proses reset database demo...');

        try {
            // 1. Jalankan migrate:fresh dengan seeding default
            Artisan::call('migrate:fresh', [
                '--seed' => true,
                '--force' => true,
            ]);
            $this->line(Artisan::output());

            // 2. Bersihkan cache aplikasi
            Artisan::call('cache:clear');
            $this->line(Artisan::output());

            $message = 'Database demo berhasil di-reset ke kondisi awal pada: ' . now()->toDateTimeString();
            $this->info($message);
            Log::info("[ResetDemoCommand] {$message}");

            return Command::SUCCESS;
        } catch (\Throwable $e) {
            $this->error('Gagal me-reset database demo: ' . $e->getMessage());
            Log::error('[ResetDemoCommand] Error saat reset demo: ' . $e->getMessage(), [
                'exception' => $e,
            ]);

            return Command::FAILURE;
        }
    }
}
