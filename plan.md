# Rencana Implementasi: Modul Pengaturan Warung (Store Settings) & Branding Dinamis

Dokumen ini berisi analisis kebutuhan, arsitektur data, dan pembagian tahapan pengerjaan (*phased roadmap*) untuk membuat identitas visual warung (Nama, Logo/Inisial, Slogan, Warna Tema, Struk Kasir, dan Operasional POS) menjadi dinamis dan dapat dikonfigurasi penuh oleh **Pemilik (*Owner*)** demi persiapan sistem menjadi **Multi-Tenant SaaS**.

---

## 1. Analisis Kebutuhan & Arsitektur

### Kebutuhan Bisnis
1. **Personalisasi Identitas Bisnis (Branding)**:
   - Setiap pemilik warung dapat mengganti nama toko (*Pecel Lele Sedap*, *Penyetan Mbok Galak*, *Ayam Geprek Juara*, dll).
   - Inisial badge logo (2-4 karakter) atau logo gambar.
   - Slogan / Tagline bisnis.
   - Tampilan dinamis di halaman Login, Navbar, Tab Title browser, dan Struk Thermal.
2. **Personalisasi Tema Visual (Theme & Colors)**:
   - Owner dapat memilih palet warna sesuai karakteristik usahanya (misal: *Emerald Fresh* untuk lalapan, *Crimson Spicy* untuk penyetan pedas, *Retro Amber* untuk selera nusantara).
   - Tetap konsisten dengan estetika *Neo-Brutalist / Flat Retro* (`border-2 border-slate-900 shadow-[...]`).
3. **Kustomisasi Struk Kasir Thermal (58mm & ESC/POS Bluetooth)**:
   - Header struk: Nama warung, alamat, nomor telepon/WhatsApp.
   - Footer struk: Pesan penutup (*Terima kasih*, info WiFi, info akun medsos).
   - Opsi *Auto-print*: Otomatis mencetak saat transaksi selesai.
4. **Operasional Kasir & QRIS Toko**:
   - Pengaturan mode meja: Apakah warung menggunakan sistem nomor meja (*Dine-in*) atau kasir cepat (*Takeaway only*).
   - Barcode QRIS statis warung yang bisa ditampilkan saat pembeli memilih pembayaran QRIS.

### Desain Arsitektur Data (Persiapan SaaS)
Kita membuat tabel `store_settings` (atau `stores`) dengan pendekatan *single-tenant instance* saat ini, yang siap bermigrasi menjadi *multi-tenant* (cukup menambahkan kolom `tenant_id` / `user_id` di masa depan):
- `id`
- `name` (string) — default: *Pecel Lele Sedap*
- `tagline` (string) — default: *Sistem Kasir POS & Manajemen Warung*
- `initials` (string, max 4) — default: *PL*
- `logo_path` (string, nullable)
- `theme_color` (string) — default: *emerald* (pilihan: *emerald*, *rose*, *amber*, *indigo*, *orange*, *slate*)
- `address` (string, nullable) — default: *Jl. Raya Warung Malam No. 12*
- `phone` (string, nullable) — default: *0812-3456-7890*
- `receipt_footer` (text, nullable) — default: *"Matur Nuwun / Terima Kasih\nSelamat Menikmati Hidangan Kami"*
- `receipt_auto_print` (boolean) — default: `false`
- `enable_table_number` (boolean) — default: `true`
- `qris_image_path` (string, nullable)
- `tax_percentage` (decimal) — default: `0`

Data ini dibagikan secara global ke seluruh halaman frontend via **`HandleInertiaRequests.php` (`share()`)** sebagai `store`, sehingga setiap komponen frontend (`Navbar`, `Login`, `POS`, `Receipt`, dll) dapat langsung mengaksesnya tanpa query berulang.

---

## 2. Pembagian Tahapan Pengerjaan (Phased Roadmap)

### 📌 FASE 1: Pondasi Database & Branding Global (Navbar, Login, Header)
*Fokus: Menyimpan identitas toko di database dan menghubungkannya secara global ke antarmuka.*

- [x] **Task 1.1**: Buat Migration & Model `StoreSetting` dengan nilai default (*Pecel Lele Sedap*).
- [x] **Task 1.2**: Buat Database Seeder untuk mengisi data awal toko agar sistem lama tetap berjalan mulus.
- [x] **Task 1.3**: Registrasikan data `store` pada `app/Http/Middleware/HandleInertiaRequests.php`.
- [x] **Task 1.4**: Ubah `resources/js/Components/Navbar.jsx` agar membaca `store.name`, `store.initials`, `store.tagline`.
- [x] **Task 1.5**: Ubah `resources/js/Pages/Auth/Login.jsx` agar membaca `store.name`, `store.initials`, `store.tagline`.
- [x] **Task 1.6**: Hubungkan dynamic `<Head title>` di seluruh halaman dengan nama warung aktif.

---

### 📌 FASE 2: Halaman Manajemen Pengaturan Warung (`/settings`) & Tema Warna
*Fokus: Menyediakan antarmuka khusus Owner untuk mengubah identitas, tema warna, dan kontak.*

- [x] **Task 2.1**: Buat `SettingController.php` dengan method `index()` dan `update()`.
- [x] **Task 2.2**: Daftarkan rute `/settings` di `routes/web.php` di bawah grup proteksi `role:owner`.
- [x] **Task 2.3**: Tambahkan tab navigasi **Pengaturan** di `Navbar.jsx` (ikon `Settings`, hanya tampil untuk role Pemilik).
- [x] **Task 2.4**: Implementasikan sistem tema warna (*theme presets* & CSS variables) di `app.css` & `tailwind.config.js`.
- [x] **Task 2.5**: Buat halaman `resources/js/Pages/Settings/Index.jsx` bertema Neo-Brutalist:
  - **Tab 1: Identitas Bisnis** (Nama warung, slogan, inisial logo).
  - **Tab 2: Tema & Palet Warna** (Pilihan kartu preset warna dengan live preview).
  - **Tab 3: Kontak & Alamat** (Alamat fisik, No WhatsApp/Telp).
- [x] **Task 2.6**: Integrasi form submit dengan Inertia `useForm` & flash feedback sukses.

---

### 📌 FASE 3: Dinamisasi Struk Kasir Thermal (58mm & Bluetooth) & Pengaturan Meja
*Fokus: Mengintegrasikan hasil pengaturan ke struk belanja dan fleksibilitas POS.*

- [x] **Task 3.1**: Hubungkan `resources/js/Components/ThermalReceipt.jsx` dengan data dinamis `store` (Nama toko, alamat, telepon, pesan kaki struk).
- [x] **Task 3.2**: Hubungkan `resources/js/Utils/BluetoothPrinterHelper.js` agar perintah ESC/POS mencetak header & footer dinamis.
- [x] **Task 3.3**: Hubungkan opsi `receipt_auto_print` ke state awal cetak di kasir POS.
- [x] **Task 3.4**: Hubungkan opsi `enable_table_number` ke tampilan kasir POS (bisa menyembunyikan input nomor meja jika warung berkonsep *quick service*).

---

### 📌 FASE 4: Unggah Gambar Logo & QRIS Warung (Tahap Lanjutan)
*Fokus: Media upload untuk logo kustom dan barcode pembayaran mandiri.*

- [ ] **Task 4.1**: Konfigurasi storage Laravel (`php artisan storage:link`) untuk media publik.
- [ ] **Task 4.2**: Tambahkan input upload file logo & gambar QRIS di form pengaturan.
- [ ] **Task 4.3**: Buat modal popup QRIS di kasir POS: saat kasir memilih metode QRIS, gambar barcode toko langsung muncul di layar agar pelanggan dapat langsung memindai.
