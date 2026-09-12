<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\Product;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ProductController extends Controller
{
    /**
     * Halaman Utama Manajemen Menu & Kategori
     */
    public function index(Request $request): Response
    {
        $query = Product::with('category');

        // Pencarian nama atau kode produk
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('code', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%");
            });
        }

        // Filter Kategori
        if ($request->filled('category_id')) {
            $query->where('category_id', $request->category_id);
        }

        // Filter Status Ketersediaan
        if ($request->filled('status')) {
            if ($request->status === 'available') {
                $query->where('is_available', true);
            } elseif ($request->status === 'unavailable') {
                $query->where('is_available', false);
            }
        }

        // Urutkan berdasarkan kategori lalu nama
        $products = $query->orderBy('category_id')
            ->orderBy('name')
            ->paginate(15)
            ->withQueryString();

        // Data Kategori untuk Tab dan Pilihan Form
        $categories = Category::withCount('products')
            ->orderBy('sort_order')
            ->get();

        // Ringkasan Statistik Menu
        $totalProducts = Product::count();
        $availableProducts = Product::where('is_available', true)->count();
        $unavailableProducts = Product::where('is_available', false)->count();

        // Hitung estimasi rata-rata margin keuntungan
        $avgMargin = 0;
        $activeProducts = Product::where('price', '>', 0)->get();
        if ($activeProducts->count() > 0) {
            $marginSum = $activeProducts->sum(function ($p) {
                $margin = (($p->price - $p->cost_price) / $p->price) * 100;
                return max(0, $margin);
            });
            $avgMargin = round($marginSum / $activeProducts->count(), 1);
        }

        return Inertia::render('Products/Index', [
            'products' => $products,
            'categories' => $categories,
            'stats' => [
                'total' => $totalProducts,
                'available' => $availableProducts,
                'unavailable' => $unavailableProducts,
                'avg_margin' => $avgMargin,
            ],
            'filters' => $request->only(['search', 'category_id', 'status']),
        ]);
    }

    /**
     * Tambah Menu Baru
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'category_id' => 'required|exists:categories,id',
            'name' => 'required|string|max:150',
            'code' => 'nullable|string|max:50|unique:products,code',
            'price' => 'required|numeric|min:0',
            'cost_price' => 'nullable|numeric|min:0',
            'description' => 'nullable|string|max:500',
            'is_available' => 'boolean',
        ]);

        Product::create([
            'category_id' => $validated['category_id'],
            'name' => $validated['name'],
            'code' => $validated['code'] ?? null,
            'price' => (int) $validated['price'],
            'cost_price' => (int) ($validated['cost_price'] ?? 0),
            'description' => $validated['description'] ?? null,
            'is_available' => $request->boolean('is_available', true),
        ]);

        return redirect()->back()->with('success', [
            'message' => "Menu \"{$validated['name']}\" berhasil ditambahkan!",
        ]);
    }

    /**
     * Perbarui Data Menu
     */
    public function update(Request $request, Product $product)
    {
        $validated = $request->validate([
            'category_id' => 'required|exists:categories,id',
            'name' => 'required|string|max:150',
            'code' => 'nullable|string|max:50|unique:products,code,' . $product->id,
            'price' => 'required|numeric|min:0',
            'cost_price' => 'nullable|numeric|min:0',
            'description' => 'nullable|string|max:500',
            'is_available' => 'boolean',
        ]);

        $product->update([
            'category_id' => $validated['category_id'],
            'name' => $validated['name'],
            'code' => $validated['code'] ?? null,
            'price' => (int) $validated['price'],
            'cost_price' => (int) ($validated['cost_price'] ?? 0),
            'description' => $validated['description'] ?? null,
            'is_available' => $request->boolean('is_available', true),
        ]);

        return redirect()->back()->with('success', [
            'message' => "Menu \"{$product->name}\" berhasil diperbarui!",
        ]);
    }

    /**
     * Toggle Cepat Status Ketersediaan (Ready / Habis)
     */
    public function toggle(Product $product)
    {
        $newStatus = !$product->is_available;
        $product->update(['is_available' => $newStatus]);

        $statusText = $newStatus ? 'Tersedia (Ready)' : 'Habis (Sold Out)';

        return redirect()->back()->with('success', [
            'message' => "Status menu \"{$product->name}\" diubah menjadi {$statusText}!",
        ]);
    }

    /**
     * Hapus Menu
     */
    public function destroy(Product $product)
    {
        $name = $product->name;
        $product->delete();

        return redirect()->back()->with('success', [
            'message' => "Menu \"{$name}\" berhasil dihapus!",
        ]);
    }
}
