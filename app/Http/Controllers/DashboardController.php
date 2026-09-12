<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    /**
     * Dashboard Analitik Pemilik (Owner Dashboard)
     */
    public function index(Request $request): Response
    {
        $period = $request->query('period', '7days'); // today, 7days, 30days

        $now = Carbon::now();
        $startDate = match ($period) {
            'today' => Carbon::today(),
            '30days' => $now->copy()->subDays(29)->startOfDay(),
            default => $now->copy()->subDays(6)->startOfDay(), // 7days
        };
        $endDate = $now->copy()->endOfDay();

        // Query dasar transaksi dalam rentang waktu
        $ordersQuery = Order::whereBetween('created_at', [$startDate, $endDate])
            ->where('status', 'completed');

        // 1. KPI Metrik Utama
        $totalOrders = (clone $ordersQuery)->count();
        $totalRevenue = (int) (clone $ordersQuery)->sum('total_amount');
        $averageOrderValue = $totalOrders > 0 ? (int) round($totalRevenue / $totalOrders) : 0;

        // Total Item Terjual & Estimasi Laba Kotor
        $orderIds = (clone $ordersQuery)->pluck('id');
        $itemsSold = OrderItem::whereIn('order_id', $orderIds)->sum('quantity');
        $totalCost = OrderItem::whereIn('order_id', $orderIds)
            ->selectRaw('SUM(cost_price * quantity) as total_cost')
            ->value('total_cost') ?? 0;
        $grossProfit = $totalRevenue - (int) $totalCost;

        // 2. Analisis Jam Ramai (Peak Hours: per jam)
        // Group by HOUR(created_at)
        $hourlyDataRaw = (clone $ordersQuery)
            ->select(
                DB::raw('HOUR(created_at) as hour'),
                DB::raw('COUNT(*) as total_orders'),
                DB::raw('SUM(total_amount) as total_revenue')
            )
            ->groupBy(DB::raw('HOUR(created_at)'))
            ->orderBy(DB::raw('HOUR(created_at)'))
            ->get()
            ->keyBy('hour');

        // Bentuk deret jam 15:00 - 24:00 (jam operasional warung pecel lele)
        $peakHours = [];
        $busiestHour = null;
        $maxHourlyOrders = 0;

        for ($h = 15; $h <= 23; $h++) {
            $formattedHour = sprintf('%02d:00', $h);
            $orderCount = isset($hourlyDataRaw[$h]) ? (int) $hourlyDataRaw[$h]->total_orders : 0;
            $revenue = isset($hourlyDataRaw[$h]) ? (int) $hourlyDataRaw[$h]->total_revenue : 0;

            if ($orderCount > $maxHourlyOrders) {
                $maxHourlyOrders = $orderCount;
                $busiestHour = sprintf('%02d:00 - %02d:00', $h, ($h + 1) % 24);
            }

            $peakHours[] = [
                'hour' => $h,
                'label' => $formattedHour,
                'orders' => $orderCount,
                'revenue' => $revenue,
            ];
        }

        // 3. Analisis Menu Terfavorit (Top Selling Products)
        $topProductsRaw = OrderItem::whereIn('order_id', $orderIds)
            ->select(
                'product_name',
                DB::raw('SUM(quantity) as total_qty'),
                DB::raw('SUM(subtotal) as total_sales')
            )
            ->groupBy('product_name')
            ->orderByDesc('total_qty')
            ->take(8)
            ->get();

        $topProducts = $topProductsRaw->map(function ($item) use ($totalRevenue) {
            $sales = (int) $item->total_sales;
            $pct = $totalRevenue > 0 ? round(($sales / $totalRevenue) * 100, 1) : 0;
            return [
                'name' => $item->product_name,
                'quantity' => (int) $item->total_qty,
                'sales' => $sales,
                'percentage' => $pct,
            ];
        });

        // 4. Analisis Rasio Pembayaran (Cash vs QRIS)
        $paymentDistributionRaw = (clone $ordersQuery)
            ->select(
                'payment_method',
                DB::raw('COUNT(*) as count'),
                DB::raw('SUM(total_amount) as total')
            )
            ->groupBy('payment_method')
            ->get()
            ->keyBy('payment_method');

        $cashCount = isset($paymentDistributionRaw['cash']) ? (int) $paymentDistributionRaw['cash']->count : 0;
        $cashTotal = isset($paymentDistributionRaw['cash']) ? (int) $paymentDistributionRaw['cash']->total : 0;

        $qrisCount = isset($paymentDistributionRaw['qris']) ? (int) $paymentDistributionRaw['qris']->count : 0;
        $qrisTotal = isset($paymentDistributionRaw['qris']) ? (int) $paymentDistributionRaw['qris']->total : 0;

        $cashPercentage = $totalOrders > 0 ? round(($cashCount / $totalOrders) * 100, 1) : 0;
        $qrisPercentage = $totalOrders > 0 ? round(($qrisCount / $totalOrders) * 100, 1) : 0;

        $paymentStats = [
            'cash' => [
                'count' => $cashCount,
                'total' => $cashTotal,
                'percentage' => $cashPercentage,
            ],
            'qris' => [
                'count' => $qrisCount,
                'total' => $qrisTotal,
                'percentage' => $qrisPercentage,
            ],
        ];

        // 5. Tren Penjualan Harian (Daily Trend)
        $dailyTrendsRaw = (clone $ordersQuery)
            ->select(
                DB::raw('DATE(created_at) as date'),
                DB::raw('COUNT(*) as orders'),
                DB::raw('SUM(total_amount) as revenue')
            )
            ->groupBy(DB::raw('DATE(created_at)'))
            ->orderBy(DB::raw('DATE(created_at)'))
            ->get();

        $dailyTrends = $dailyTrendsRaw->map(function ($day) {
            $cDate = Carbon::parse($day->date);
            return [
                'date' => $day->date,
                'day_name' => $cDate->translatedFormat('D, d M'),
                'orders' => (int) $day->orders,
                'revenue' => (int) $day->revenue,
            ];
        });

        // 6. Transaksi Terbaru (Recent Orders)
        $recentOrders = Order::with('items')
            ->latest()
            ->take(8)
            ->get();

        return Inertia::render('Dashboard/Index', [
            'period' => $period,
            'kpi' => [
                'total_orders' => $totalOrders,
                'total_revenue' => $totalRevenue,
                'average_order_value' => $averageOrderValue,
                'items_sold' => (int) $itemsSold,
                'gross_profit' => $grossProfit,
                'busiest_hour' => $busiestHour ?: '19:00 - 20:00',
                'favorite_product' => $topProducts->first()['name'] ?? '-',
            ],
            'peakHours' => $peakHours,
            'topProducts' => $topProducts,
            'paymentStats' => $paymentStats,
            'dailyTrends' => $dailyTrends,
            'recentOrders' => $recentOrders,
        ]);
    }
}
