<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class PosController extends Controller
{
    /**
     * Halaman Utama POS Kasir (Tablet Mode)
     */
    public function index(): Response
    {
        $categories = Category::with(['products' => function ($query) {
            $query->orderBy('is_available', 'desc')->orderBy('name');
        }])->orderBy('sort_order')->get();

        // Ringkasan transaksi kasir hari ini
        $today = Carbon::today();
        $todayOrdersCount = Order::whereDate('created_at', $today)->count();
        $todaySalesTotal = Order::whereDate('created_at', $today)->sum('total_amount');

        // 5 Pesanan Terakhir hari ini untuk riwayat cepat kasir
        $recentOrders = Order::with('items')
            ->whereDate('created_at', $today)
            ->latest()
            ->take(6)
            ->get();

        return Inertia::render('Pos/Index', [
            'categories' => $categories,
            'todaySummary' => [
                'count' => $todayOrdersCount,
                'total' => (int) $todaySalesTotal,
            ],
            'recentOrders' => $recentOrders,
        ]);
    }

    /**
     * Simpan Transaksi Penjualan Baru
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'order_type' => 'required|in:dine_in,takeaway',
            'customer_name' => 'nullable|string|max:100',
            'table_number' => 'nullable|string|max:20',
            'payment_method' => 'required|in:cash,qris',
            'cash_received' => 'nullable|numeric|min:0',
            'notes' => 'nullable|string|max:255',
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.quantity' => 'required|integer|min:1',
            'items.*.notes' => 'nullable|string|max:255',
        ]);

        $order = DB::transaction(function () use ($validated, $request) {
            $today = Carbon::today();
            $todayStr = Carbon::now()->format('Ymd');

            // Generate nomor urut transaksi harian (e.g. PL-20260911-0001)
            $countToday = Order::whereDate('created_at', $today)->lockForUpdate()->count();
            $orderNumber = 'PL-' . $todayStr . '-' . sprintf('%04d', $countToday + 1);

            // Hitung total dan persiapkan order items
            $totalAmount = 0;
            $itemsData = [];

            foreach ($validated['items'] as $itemInput) {
                $product = Product::findOrFail($itemInput['product_id']);
                if (!$product->is_available) {
                    throw \Illuminate\Validation\ValidationException::withMessages([
                        'items' => "Menu \"{$product->name}\" saat ini sedang habis.",
                    ]);
                }
                $qty = (int) $itemInput['quantity'];
                $subtotal = $product->price * $qty;
                $totalAmount += $subtotal;

                $itemsData[] = [
                    'product_id' => $product->id,
                    'product_name' => $product->name,
                    'unit_price' => $product->price,
                    'cost_price' => $product->cost_price,
                    'quantity' => $qty,
                    'subtotal' => $subtotal,
                    'notes' => $itemInput['notes'] ?? null,
                ];
            }

            $paymentMethod = $validated['payment_method'];
            $cashReceived = null;
            $changeReturned = null;

            if ($paymentMethod === 'cash') {
                $cashReceived = (int) ($validated['cash_received'] ?? $totalAmount);
                $changeReturned = max(0, $cashReceived - $totalAmount);
            } else {
                // QRIS langsung pas
                $cashReceived = $totalAmount;
                $changeReturned = 0;
            }

            $order = Order::create([
                'order_number' => $orderNumber,
                'cashier_id' => auth()->id() ?? null,
                'cashier_name' => auth()->user()->name ?? 'Kasir Utama',
                'customer_name' => $validated['customer_name'] ?: 'Pelanggan',
                'table_number' => $validated['table_number'] ?: null,
                'order_type' => $validated['order_type'],
                'total_amount' => $totalAmount,
                'payment_method' => $paymentMethod,
                'cash_received' => $cashReceived,
                'change_returned' => $changeReturned,
                'status' => 'completed',
                'notes' => $validated['notes'] ?? null,
            ]);

            foreach ($itemsData as $data) {
                $order->items()->create($data);
            }

            return $order;
        });

        $order->load('items');

        return redirect()->back()->with('success', [
            'message' => 'Transaksi berhasil disimpan!',
            'order' => $order,
        ]);
    }
}
