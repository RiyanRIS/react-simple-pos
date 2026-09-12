<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // 0. Pengaturan Awal Toko / Warung
        \App\Models\StoreSetting::current();

        // 1. Buat User: Pemilik (Owner) dan Kasir
        $owner = User::updateOrCreate(
            ['email' => 'owner@penyetan.com'],
            [
                'name' => 'Cak Riyan (Pemilik)',
                'password' => Hash::make('password'),
                'role' => 'owner',
            ]
        );

        $cashier = User::updateOrCreate(
            ['email' => 'kasir@penyetan.com'],
            [
                'name' => 'Siti (Kasir)',
                'password' => Hash::make('password'),
                'role' => 'cashier',
            ]
        );

        // 2. Kategori Menu
        $categoriesData = [
            ['name' => 'Lele & Ikan', 'slug' => 'lele-ikan', 'icon' => 'Fish', 'sort_order' => 1],
            ['name' => 'Ayam & Bebek', 'slug' => 'ayam-bebek', 'icon' => 'UtensilsCrossed', 'sort_order' => 2],
            ['name' => 'Nasi & Lauk Ekstra', 'slug' => 'nasi-lauk', 'icon' => 'Egg', 'sort_order' => 3],
            ['name' => 'Aneka Sambal', 'slug' => 'sambal', 'icon' => 'Flame', 'sort_order' => 4],
            ['name' => 'Minuman Segar', 'slug' => 'minuman', 'icon' => 'CupSoda', 'sort_order' => 5],
        ];

        $categories = [];
        foreach ($categoriesData as $cat) {
            $categories[$cat['slug']] = Category::create($cat);
        }

        // 3. Menu Produk Pecel Lele Realistis (Harga Jual & HPP Modal)
        $productsData = [
            // Lele & Ikan
            [
                'category_id' => $categories['lele-ikan']->id,
                'name' => 'Pecel Lele Goreng Crispy',
                'code' => 'LL-GR',
                'description' => 'Lele segar bumbu ketumbar digoreng garing renyah dengan lalapan segar',
                'price' => 14000,
                'cost_price' => 7500,
            ],
            [
                'category_id' => $categories['lele-ikan']->id,
                'name' => 'Lele Bakar Madu Manis',
                'code' => 'LL-BK',
                'description' => 'Lele bakar olesan kecap rempah & madu khas Lamongan',
                'price' => 16000,
                'cost_price' => 8500,
            ],
            [
                'category_id' => $categories['lele-ikan']->id,
                'name' => 'Nila Goreng Kering',
                'code' => 'NL-GR',
                'description' => 'Ikan nila goreng utuh renyah dengan sambal pilihan',
                'price' => 22000,
                'cost_price' => 13000,
            ],

            // Ayam & Bebek
            [
                'category_id' => $categories['ayam-bebek']->id,
                'name' => 'Ayam Goreng Lengkuas',
                'code' => 'AY-GR',
                'description' => 'Ayam ungkep rempah gurih bertabur serundeng lengkuas renyah',
                'price' => 18000,
                'cost_price' => 10500,
            ],
            [
                'category_id' => $categories['ayam-bebek']->id,
                'name' => 'Ayam Bakar Kecap Pedas',
                'code' => 'AY-BK',
                'description' => 'Ayam bakar rempah karamelisasi gurih manis pedas',
                'price' => 19000,
                'cost_price' => 11000,
            ],
            [
                'category_id' => $categories['ayam-bebek']->id,
                'name' => 'Bebek Goreng Kremes',
                'code' => 'BB-GR',
                'description' => 'Bebek empuk bumbu rempah hitam khas Madura dengan kremesan',
                'price' => 28000,
                'cost_price' => 17000,
            ],

            // Nasi & Lauk Ekstra
            [
                'category_id' => $categories['nasi-lauk']->id,
                'name' => 'Nasi Uduk Gurih Pulen',
                'code' => 'NS-UD',
                'description' => 'Nasi santan daun pandan wangi dengan taburan bawang merah goreng',
                'price' => 6000,
                'cost_price' => 2500,
            ],
            [
                'category_id' => $categories['nasi-lauk']->id,
                'name' => 'Nasi Putih Pulen',
                'code' => 'NS-PT',
                'description' => 'Nasi putih beras pilihan hangat',
                'price' => 5000,
                'cost_price' => 2000,
            ],
            [
                'category_id' => $categories['nasi-lauk']->id,
                'name' => 'Tahu Tempe Goreng (Sepasang)',
                'code' => 'TT-GR',
                'description' => '1 Tahu & 1 Tempe goreng bumbu bawang ketumbar gurih',
                'price' => 5000,
                'cost_price' => 2000,
            ],
            [
                'category_id' => $categories['nasi-lauk']->id,
                'name' => 'Kol Goreng Gurih',
                'code' => 'KL-GR',
                'description' => 'Kol segar digoreng setengah garing manis gurih',
                'price' => 5000,
                'cost_price' => 1500,
            ],
            [
                'category_id' => $categories['nasi-lauk']->id,
                'name' => 'Terong Goreng Crispy',
                'code' => 'TR-GR',
                'description' => 'Terong ungu belah digoreng lezat',
                'price' => 6000,
                'cost_price' => 2000,
            ],
            [
                'category_id' => $categories['nasi-lauk']->id,
                'name' => 'Pete Goreng / Bakar (1 Papan)',
                'code' => 'PT-GR',
                'description' => 'Pete segar digoreng/bakar wangi gurih',
                'price' => 10000,
                'cost_price' => 5000,
            ],

            // Aneka Sambal
            [
                'category_id' => $categories['sambal']->id,
                'name' => 'Sambal Terasi Matang (Uleg Cobek)',
                'code' => 'SB-TR',
                'description' => 'Sambal tomat terasi khas warung Lamongan gurih nikmat',
                'price' => 4000,
                'cost_price' => 1500,
            ],
            [
                'category_id' => $categories['sambal']->id,
                'name' => 'Sambal Bawang Korek Pedas Gila',
                'code' => 'SB-BW',
                'description' => 'Cabai rawit merah segar disiram minyak panas gurih',
                'price' => 4000,
                'cost_price' => 1500,
            ],
            [
                'category_id' => $categories['sambal']->id,
                'name' => 'Sambal Ijo Tomat Segar',
                'code' => 'SB-IJ',
                'description' => 'Cabai hijau uleg kasar dengan tomat hijau segar',
                'price' => 4000,
                'cost_price' => 1500,
            ],

            // Minuman Segar
            [
                'category_id' => $categories['minuman']->id,
                'name' => 'Es Teh Manis Jumbo',
                'code' => 'MN-TEH',
                'description' => 'Teh wangi melati segar manis dingin porsi jumbo',
                'price' => 5000,
                'cost_price' => 1200,
            ],
            [
                'category_id' => $categories['minuman']->id,
                'name' => 'Es Jeruk Peras Murni',
                'code' => 'MN-JRK',
                'description' => 'Perasan jeruk asli segar pelepas dahaga pedas',
                'price' => 7000,
                'cost_price' => 3000,
            ],
            [
                'category_id' => $categories['minuman']->id,
                'name' => 'Kopi Hitam Tubruk',
                'code' => 'MN-KPI',
                'description' => 'Kopi bubuk robusta seduh panas mantap',
                'price' => 5000,
                'cost_price' => 1500,
            ],
            [
                'category_id' => $categories['minuman']->id,
                'name' => 'Air Mineral Botol Dingin',
                'code' => 'MN-AIR',
                'description' => 'Air mineral 600ml dingin segar',
                'price' => 4000,
                'cost_price' => 2000,
            ],
        ];

        $createdProducts = [];
        foreach ($productsData as $prod) {
            $createdProducts[] = Product::create($prod);
        }

        // 4. Seeder Dummy Transaksi Realistis untuk Visualisasi Jam Ramai & Menu Favorit
        // Pola Warung Pecel Lele:
        // Buka jam 16:30, Mulai ramai jam 17:30 - 19:00, Puncak (Peak) jam 19:00 - 21:30, Reda jam 22:00 - 23:30.
        // Hari: Simulasi 7 hari ke belakang sampai hari ini.
        $customerNames = ['Mas Joko', 'Mbak Anisa', 'Pak Bambang', 'Mas Dimas', 'Mbak Rina', 'Cak Sugeng', 'Bu Sri', 'Mas Hendra', 'Mbak Maya', 'Pak RT', 'Pelanggan'];
        $notesOptions = ['Sambal Terasi Pedas Sedang', 'Sambal Bawang Pedas Banget', 'Lele Goreng Garing', 'Nasi Jangan Terlalu Banyak', 'Es Teh Manis Jangan Manis-manis', 'Bungkus Sambal Dipisah', 'Lalap Tambah Timun'];

        $orderIndex = 1;
        $now = Carbon::now();

        // Buat 140 pesanan realistis tersebar di 7 hari terakhir
        for ($daysAgo = 6; $daysAgo >= 0; $daysAgo--) {
            $date = $now->copy()->subDays($daysAgo);
            
            // Hari Jumat, Sabtu, Minggu lebih ramai (weekend surge)
            $isWeekend = in_array($date->dayOfWeek, [Carbon::FRIDAY, Carbon::SATURDAY, Carbon::SUNDAY]);
            $ordersCount = $isWeekend ? rand(25, 35) : rand(15, 22);

            for ($i = 0; $i < $ordersCount; $i++) {
                // Bobot probabilitas jam buka warung (16.00 - 23.00)
                // 16: 5%, 17: 10%, 18: 20%, 19: 25%, 20: 25%, 21: 10%, 22: 4%, 23: 1%
                $randPercent = rand(1, 100);
                if ($randPercent <= 5) {
                    $hour = 16;
                } elseif ($randPercent <= 15) {
                    $hour = 17;
                } elseif ($randPercent <= 35) {
                    $hour = 18;
                } elseif ($randPercent <= 60) {
                    $hour = 19; // Peak!
                } elseif ($randPercent <= 85) {
                    $hour = 20; // Peak!
                } elseif ($randPercent <= 95) {
                    $hour = 21;
                } else {
                    $hour = rand(22, 23);
                }

                $orderTime = $date->copy()->setTime($hour, rand(0, 59), rand(0, 59));

                // 60% Tunai (Cash), 40% QRIS
                $paymentMethod = rand(1, 10) <= 6 ? 'cash' : 'qris';
                $orderType = rand(1, 10) <= 7 ? 'dine_in' : 'takeaway';
                $tableNumber = $orderType === 'dine_in' ? sprintf('%02d', rand(1, 12)) : null;

                // Pilih 2 - 5 item menu secara acak (dengan bobot Lele Goreng, Ayam, Nasi, & Es Teh paling sering dipilih)
                $itemsCount = rand(2, 4);
                $selectedProducts = [];
                
                // Lele goreng selalu favorit tinggi (60% pesanan ada lele)
                if (rand(1, 10) <= 6) {
                    $selectedProducts[] = $createdProducts[0]; // Pecel Lele Goreng
                }
                // Nasi uduk / putih (80% pesanan ada nasi)
                if (rand(1, 10) <= 8) {
                    $selectedProducts[] = rand(1, 2) === 1 ? $createdProducts[6] : $createdProducts[7];
                }
                // Minuman Es Teh (75% pesanan ada es teh)
                if (rand(1, 10) <= 7) {
                    $selectedProducts[] = $createdProducts[15]; // Es Teh
                }

                // Tambahkan random side-dish (kol goreng / tahu tempe / pete / sambal)
                while (count($selectedProducts) < $itemsCount) {
                    $randomProd = $createdProducts[array_rand($createdProducts)];
                    if (!in_array($randomProd, $selectedProducts)) {
                        $selectedProducts[] = $randomProd;
                    }
                }

                $totalAmount = 0;
                $orderItemsToCreate = [];

                foreach ($selectedProducts as $prod) {
                    $qty = rand(1, 2);
                    $subtotal = $prod->price * $qty;
                    $totalAmount += $subtotal;

                    $orderItemsToCreate[] = [
                        'product_id' => $prod->id,
                        'product_name' => $prod->name,
                        'unit_price' => $prod->price,
                        'cost_price' => $prod->cost_price,
                        'quantity' => $qty,
                        'subtotal' => $subtotal,
                        'notes' => rand(1, 4) === 1 ? $notesOptions[array_rand($notesOptions)] : null,
                    ];
                }

                $cashReceived = null;
                $changeReturned = null;
                if ($paymentMethod === 'cash') {
                    // Pembeli bayar dengan nominal bulat di atasnya (50rb, 100rb, dll)
                    $multipliers = [10000, 20000, 50000, 100000];
                    foreach ($multipliers as $m) {
                        if ($m >= $totalAmount) {
                            $cashReceived = $m;
                            break;
                        }
                    }
                    if (!$cashReceived) {
                        $cashReceived = ceil($totalAmount / 50000) * 50000;
                    }
                    $changeReturned = $cashReceived - $totalAmount;
                }

                $orderNumber = 'PL-' . $orderTime->format('Ymd') . '-' . sprintf('%04d', $orderIndex++);

                $order = Order::create([
                    'order_number' => $orderNumber,
                    'cashier_id' => $cashier->id,
                    'cashier_name' => $cashier->name,
                    'customer_name' => $customerNames[array_rand($customerNames)],
                    'table_number' => $tableNumber,
                    'order_type' => $orderType,
                    'total_amount' => $totalAmount,
                    'payment_method' => $paymentMethod,
                    'cash_received' => $cashReceived,
                    'change_returned' => $changeReturned,
                    'status' => 'completed',
                    'notes' => rand(1, 5) === 1 ? 'Pesanan reguler' : null,
                    'created_at' => $orderTime,
                    'updated_at' => $orderTime,
                ]);

                foreach ($orderItemsToCreate as $itemData) {
                    $itemData['order_id'] = $order->id;
                    $itemData['created_at'] = $orderTime;
                    $itemData['updated_at'] = $orderTime;
                    OrderItem::create($itemData);
                }
            }
        }
    }
}
