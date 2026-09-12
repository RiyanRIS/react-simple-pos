<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Order extends Model
{
    use HasFactory;

    protected $fillable = [
        'order_number',
        'cashier_id',
        'cashier_name',
        'customer_name',
        'table_number',
        'order_type',
        'total_amount',
        'payment_method',
        'cash_received',
        'change_returned',
        'status',
        'notes',
    ];

    protected $casts = [
        'total_amount' => 'integer',
        'cash_received' => 'integer',
        'change_returned' => 'integer',
        'created_at' => 'datetime',
    ];

    public function cashier(): BelongsTo
    {
        return $this->belongsTo(User::class, 'cashier_id');
    }

    public function items(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }
}
