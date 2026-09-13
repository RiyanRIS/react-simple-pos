<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote')->hourly();

// Jadwal Reset Otomatis Database Demo di STB
// Hanya aktif ketika APP_DEMO_MODE=true di .env
if (config('demo.enabled', false)) {
    $interval = config('demo.reset_interval', 'hourly');
    $scheduledCommand = Schedule::command('app:reset-demo')
        ->withoutOverlapping()
        ->runInBackground();

    match ($interval) {
        'every_two_hours' => $scheduledCommand->everyTwoHours(),
        'daily' => $scheduledCommand->dailyAt('03:00'),
        default => $scheduledCommand->hourly(),
    };
}

