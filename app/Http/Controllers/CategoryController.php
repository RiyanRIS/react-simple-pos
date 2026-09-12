<?php

namespace App\Http\Controllers;

use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class CategoryController extends Controller
{
    /**
     * Tambah Kategori Baru
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:100',
            'icon' => 'nullable|string|max:50',
            'sort_order' => 'nullable|integer|min:0',
        ]);

        $name = trim($validated['name']);
        $baseSlug = Str::slug($name);
        $slug = $baseSlug;
        $counter = 1;

        // Pastikan slug unik
        while (Category::where('slug', $slug)->exists()) {
            $slug = $baseSlug . '-' . $counter++;
        }

        // Tentukan urutan tampil jika tidak diisi
        $maxSort = Category::max('sort_order') ?? 0;
        $sortOrder = isset($validated['sort_order']) && $validated['sort_order'] !== '' 
            ? (int) $validated['sort_order'] 
            : $maxSort + 1;

        Category::create([
            'name' => $name,
            'slug' => $slug,
            'icon' => !empty($validated['icon']) ? $validated['icon'] : 'Utensils',
            'sort_order' => $sortOrder,
        ]);

        return redirect()->back()->with('success', [
            'message' => "Kategori \"{$name}\" berhasil ditambahkan!",
        ]);
    }

    /**
     * Perbarui Kategori
     */
    public function update(Request $request, Category $category)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:100',
            'icon' => 'nullable|string|max:50',
            'sort_order' => 'nullable|integer|min:0',
        ]);

        $name = trim($validated['name']);
        
        $updateData = [
            'name' => $name,
            'sort_order' => isset($validated['sort_order']) && $validated['sort_order'] !== '' 
                ? (int) $validated['sort_order'] 
                : $category->sort_order,
        ];

        if (isset($validated['icon']) && $validated['icon'] !== '') {
            $updateData['icon'] = $validated['icon'];
        }

        $category->update($updateData);

        return redirect()->back()->with('success', [
            'message' => "Kategori \"{$name}\" berhasil diperbarui!",
        ]);
    }

    /**
     * Hapus Kategori dengan Proteksi Keamanan
     */
    public function destroy(Category $category)
    {
        $productsCount = $category->products()->count();

        // Proteksi: Tidak boleh menghapus jika masih ada produk di dalamnya
        if ($productsCount > 0) {
            return redirect()->back()->withErrors([
                'category' => "Kategori \"{$category->name}\" tidak dapat dihapus karena masih memuat {$productsCount} menu. Hapus atau pindahkan menu terlebih dahulu.",
            ]);
        }

        $categoryName = $category->name;
        $category->delete();

        return redirect()->back()->with('success', [
            'message' => "Kategori \"{$categoryName}\" berhasil dihapus!",
        ]);
    }
}
