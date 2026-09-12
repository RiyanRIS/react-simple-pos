<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('store_settings', function (Blueprint $table) {
            $table->id();
            $table->string('name')->default('Pecel Lele Sedap');
            $table->string('tagline')->default('Sistem Kasir POS & Manajemen Warung');
            $table->string('initials', 4)->default('PL');
            $table->string('logo_path')->nullable();
            $table->string('theme_color')->default('emerald');
            $table->string('address')->nullable()->default('Jl. Raya Warung Malam No. 12');
            $table->string('phone')->nullable()->default('0812-3456-7890');
            $table->text('receipt_footer')->nullable();
            $table->boolean('receipt_auto_print')->default(false);
            $table->boolean('enable_table_number')->default(true);
            $table->decimal('tax_percentage', 5, 2)->default(0);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('store_settings');
    }
};
