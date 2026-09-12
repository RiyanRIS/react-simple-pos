<?php

namespace App\Http\Controllers;

use App\Models\StoreSetting;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class SettingController extends Controller
{
    /**
     * Tampilkan Halaman Pengaturan Toko / Warung
     */
    public function index(): Response
    {
        $settings = StoreSetting::current();

        return Inertia::render('Settings/Index', [
            'settings' => $settings,
        ]);
    }

    /**
     * Perbarui Pengaturan Toko / Warung
     */
    public function update(Request $request)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:100'],
            'tagline' => ['nullable', 'string', 'max:150'],
            'initials' => ['required', 'string', 'max:4'],
            'theme_color' => ['required', 'in:emerald,rose,amber,indigo,orange,slate'],
            'address' => ['nullable', 'string', 'max:255'],
            'phone' => ['nullable', 'string', 'max:50'],
            'receipt_footer' => ['nullable', 'string', 'max:500'],
            'receipt_auto_print' => ['boolean'],
            'enable_table_number' => ['boolean'],
            'tax_percentage' => ['numeric', 'min:0', 'max:100'],
        ], [
            'name.required' => 'Nama warung / toko wajib diisi.',
            'initials.required' => 'Inisial logo badge (2-4 karakter) wajib diisi.',
            'initials.max' => 'Inisial logo maksimal 4 karakter.',
            'theme_color.in' => 'Pilihan tema visual tidak valid.',
            'tax_percentage.numeric' => 'Persentase pajak harus berupa angka.',
        ]);

        $settings = StoreSetting::first();
        if (!$settings) {
            $settings = new StoreSetting();
        }

        $settings->fill([
            'name' => trim($validated['name']),
            'tagline' => isset($validated['tagline']) ? trim($validated['tagline']) : null,
            'initials' => strtoupper(trim($validated['initials'])),
            'theme_color' => $validated['theme_color'],
            'address' => isset($validated['address']) ? trim($validated['address']) : null,
            'phone' => isset($validated['phone']) ? trim($validated['phone']) : null,
            'receipt_footer' => isset($validated['receipt_footer']) ? trim($validated['receipt_footer']) : null,
            'receipt_auto_print' => (bool) ($validated['receipt_auto_print'] ?? false),
            'enable_table_number' => (bool) ($validated['enable_table_number'] ?? true),
            'tax_percentage' => (float) ($validated['tax_percentage'] ?? 0),
        ]);

        $settings->save();
        StoreSetting::clearCache();

        return redirect()->back()->with('success', [
            'message' => 'Pengaturan warung & tema visual berhasil diperbarui!',
        ]);
    }
}
