<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('orders', function (Blueprint $table) {
            $table->id();
            $table->string('order_number')->unique();
            $table->foreignId('cashier_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('cashier_name')->default('Kasir Warung');
            $table->string('customer_name')->nullable()->default('Pelanggan');
            $table->string('table_number')->nullable();
            $table->enum('order_type', ['dine_in', 'takeaway'])->default('dine_in');
            $table->unsignedInteger('total_amount'); // Total belanja
            $table->enum('payment_method', ['cash', 'qris'])->default('cash');
            $table->unsignedInteger('cash_received')->nullable(); // Uang diterima jika cash
            $table->unsignedInteger('change_returned')->nullable(); // Kembalian
            $table->string('status')->default('completed'); // completed, cancelled
            $table->text('notes')->nullable();
            $table->timestamps();

            // Index untuk optimasi pencarian analitik berdasarkan waktu
            $table->index('created_at');
            $table->index('payment_method');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('orders');
    }
};
