import {
    Utensils,
    UtensilsCrossed,
    Fish,
    Drumstick,
    Flame,
    Egg,
    CupSoda,
    Coffee,
    GlassWater,
    Soup,
    Salad,
    Package,
    Sparkles,
    Cookie,
    Sandwich,
    Beef,
    Pizza,
    Apple,
    Store,
    Tag,
} from 'lucide-react';

/**
 * Pilihan Ikon Kategori yang Dikurasi Khusus untuk Bisnis Kuliner / Warung / Restoran
 */
export const CATEGORY_ICON_LIST = [
    { key: 'Utensils', label: 'Alat Makan', icon: Utensils, group: 'Umum' },
    { key: 'UtensilsCrossed', label: 'Sendok & Garpu', icon: UtensilsCrossed, group: 'Umum' },
    { key: 'Fish', label: 'Ikan & Lele', icon: Fish, group: 'Lauk' },
    { key: 'Drumstick', label: 'Ayam & Bebek', icon: Drumstick, group: 'Lauk' },
    { key: 'Egg', label: 'Telur & Nasi', icon: Egg, group: 'Lauk' },
    { key: 'Beef', label: 'Daging Sapi', icon: Beef, group: 'Lauk' },
    { key: 'Flame', label: 'Sambal Pedas', icon: Flame, group: 'Sambal' },
    { key: 'Soup', label: 'Kuah & Sup', icon: Soup, group: 'Sayur' },
    { key: 'Salad', label: 'Sayur & Lalapan', icon: Salad, group: 'Sayur' },
    { key: 'CupSoda', label: 'Minuman Dingin', icon: CupSoda, group: 'Minuman' },
    { key: 'Coffee', label: 'Kopi & Teh', icon: Coffee, group: 'Minuman' },
    { key: 'GlassWater', label: 'Air / Es Jeruk', icon: GlassWater, group: 'Minuman' },
    { key: 'Package', label: 'Paket Hemat', icon: Package, group: 'Paket' },
    { key: 'Sparkles', label: 'Menu Spesial', icon: Sparkles, group: 'Favorit' },
    { key: 'Cookie', label: 'Kerupuk & Snack', icon: Cookie, group: 'Camilan' },
    { key: 'Sandwich', label: 'Gorengan / Snack', icon: Sandwich, group: 'Camilan' },
    { key: 'Pizza', label: 'Bakaran / Panggangan', icon: Pizza, group: 'Lainnya' },
    { key: 'Apple', label: 'Buah & Jus', icon: Apple, group: 'Minuman' },
    { key: 'Store', label: 'Warung / Outlet', icon: Store, group: 'Umum' },
    { key: 'Tag', label: 'Promo & Diskon', icon: Tag, group: 'Favorit' },
];

/**
 * Mapping Nama Ikon String ke Komponen Lucide
 */
export const CATEGORY_ICON_MAP = CATEGORY_ICON_LIST.reduce((acc, item) => {
    acc[item.key] = item.icon;
    return acc;
}, {});

/**
 * Fallback mapping untuk slug bawaan (kompatibilitas data lama)
 */
const SLUG_FALLBACK_MAP = {
    'lele-ikan': Fish,
    'ayam-bebek': Drumstick,
    'nasi-lauk': Egg,
    'sambal': Flame,
    'minuman': CupSoda,
};

/**
 * Helper untuk mendapatkan Icon Component dari Object Kategori atau Nama Ikon
 * @param {Object|string} categoryOrIcon - Bisa berupa objek kategori `{ icon, slug }` atau string nama icon misal `'Fish'`
 * @returns {React.ComponentType} Komponen Icon Lucide
 */
export function getCategoryIcon(categoryOrIcon) {
    if (!categoryOrIcon) return Utensils;

    // Jika parameter berupa string nama icon langsung (misal: 'Fish', 'Flame')
    if (typeof categoryOrIcon === 'string') {
        return CATEGORY_ICON_MAP[categoryOrIcon] || SLUG_FALLBACK_MAP[categoryOrIcon] || Utensils;
    }

    // Jika parameter berupa object category
    const iconName = categoryOrIcon.icon;
    if (iconName && CATEGORY_ICON_MAP[iconName]) {
        return CATEGORY_ICON_MAP[iconName];
    }

    // Fallback berdasarkan slug
    const slug = categoryOrIcon.slug;
    if (slug && SLUG_FALLBACK_MAP[slug]) {
        return SLUG_FALLBACK_MAP[slug];
    }

    return Utensils;
}
