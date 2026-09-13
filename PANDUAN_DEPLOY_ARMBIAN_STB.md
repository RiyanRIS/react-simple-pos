# Panduan Instalasi & Deployment Penyetan POS di Server Armbian STB (Set-Top Box)

Panduan ini disusun khusus untuk memasang dan menjalankan sistem kasir **Penyetan POS** pada perangkat **STB (B860H, HG680P, X96 Mini, dsb.)** berbasis **Armbian Linux** dengan **PHP 8.3**.

---

## Karakteristik Perangkat STB
- **Arsitektur:** ARM64 / aarch64 (atau armhf)
- **RAM:** Umumnya terbatas (1 GB – 2 GB)
- **Kelebihan:** Sangat hemat daya (~5 Watt), senyap tanpa kipas, ideal untuk server kasir lokal warung 24/7.
- **Prinsip Utama:** **Jangan jalankan `npm run build` di STB** agar RAM tidak habis (*crash/freeze*). Selalu gunakan aset frontend yang telah di-build dari laptop/PC development (`public/build/`).

---

## Langkah 1: Pasang Ekstensi PHP 8.3 & Web Server di STB

Buka terminal SSH ke STB Anda (menggunakan PuTTY atau terminal):

```bash
# 1. Perbarui daftar repositori paket & instal dependensi dasar
sudo apt update
sudo apt install -y curl lsb-release apt-transport-https ca-certificates software-properties-common

# 2. Tambahkan repositori PHP (Ondřej Surý) agar PHP 8.3 tersedia di Armbian/Debian/Ubuntu:
# JALANKAN PERINTAH INI JIKA ARMBIAN BERBASIS DEBIAN:
sudo curl -sSLo /usr/share/keyrings/deb.sury.org-php.gpg https://packages.sury.org/php/apt.gpg
echo "deb [signed-by=/usr/share/keyrings/deb.sury.org-php.gpg] https://packages.sury.org/php/ $(lsb_release -sc) main" | sudo tee /etc/apt/sources.list.d/php.list
sudo apt update

# ATAU JIKA ARMBIAN BERBASIS UBUNTU:
# sudo add-apt-repository -y ppa:ondrej/php && sudo apt update

# 3. Pasang Nginx, MariaDB Server, Git, Unzip, dan ekstensi PHP 8.3 yang dibutuhkan Laravel
sudo apt install -y nginx mariadb-server curl git unzip \
php8.3-fpm php8.3-mysql php8.3-mbstring php8.3-xml php8.3-curl \
php8.3-zip php8.3-bcmath php8.3-gd php8.3-intl php8.3-cli

# 4. Pasang Composer (jika belum terpasang)
sudo curl -sS https://getcomposer.org/installer | php
sudo mv composer.phar /usr/local/bin/composer
```

Pastikan service Nginx dan MariaDB sudah berjalan:
```bash
sudo systemctl status nginx
sudo systemctl status mariadb
```

---

## Langkah 2: Buat Database MySQL / MariaDB di STB

Masuk ke console MariaDB:
```bash
sudo mysql -u root
```

Jalankan perintah SQL berikut untuk membuat database dan akun user khusus aplikasi kasir:
```sql
CREATE DATABASE prod_simple_pos CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'prod_simple_pos_user'@'localhost' IDENTIFIED BY 'akuAnakuat99!';
GRANT ALL PRIVILEGES ON prod_simple_pos.* TO 'prod_simple_pos_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

---

## Langkah 3: Salin File Proyek ke STB

Pastikan di laptop Anda sudah menjalankan:
```bash
npm run build
```
Folder `public/build/` harus sudah berisi file bundle Vite (`manifest.json`, file `.css`, `.js`).

Salin seluruh folder proyek ke STB pada direktori `/var/www/penyetan`. Anda bisa menggunakan:
- **WinSCP / FileZilla (SFTP)**: Hubungkan ke IP STB (port 22) lalu upload folder.
- **Git Clone**: `git clone <repo-url> /var/www/penyetan` lalu salin folder `public/build/`.

Setelah file berada di `/var/www/penyetan`:
```bash
cd /var/www/penyetan

# Pasang pustaka PHP produksi (tanpa package dev agar hemat memori)
composer install --no-dev --optimize-autoloader
```

---

## Langkah 4: Konfigurasi File Lingkungan (.env)

Buat file `.env` dari template:
```bash
cp .env.example .env
nano .env
```

Sesuaikan baris-baris berikut di dalam file `.env`:
```dotenv
APP_NAME="Penyetan POS"
APP_ENV=production
APP_DEBUG=false
APP_URL=http://192.168.1.100:8081   # Ganti dengan IP STB Anda + port 8081

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=prod_simple_pos
DB_USERNAME=prod_simple_pos_user
DB_PASSWORD=akuAnakuat99!
DB_COLLATION=utf8mb4_unicode_ci

SESSION_DRIVER=database
SESSION_LIFETIME=120
CACHE_STORE=database
QUEUE_CONNECTION=database
```
*Simpan perubahan: Tekan `Ctrl + O`, lalu `Enter`. Keluar: Tekan `Ctrl + X`.*

Lalu generate Application Key Laravel:
```bash
php artisan key:generate
```

---

## Langkah 5: Migrasi Database & Seeding Data Awal

Jalankan migrasi tabel dan data default (menu pecel lele, akun owner, dan akun kasir):
```bash
php artisan migrate --seed --force
```

> **Akun Default Setelah Seeding:**
> - **Pemilik (Owner):** `owner@penyetan.com` / `password`
> - **Kasir:** `kasir@penyetan.com` / `password`
> 
> *Catatan Keamanan: Segera ubah kata sandi akun pemilik setelah berhasil masuk pertama kali di menu Kelola Kasir & Pengguna.*

---

## Langkah 6: Atur Izin Akses Direktori (Permissions)

Nginx dan PHP-FPM berjalan di bawah user `www-data`. Berikan izin tulis pada direktori `storage` dan `bootstrap/cache`:

```bash
# Tambahkan user Anda saat ini ke grup www-data
sudo usermod -aG www-data $USER

# Berikan kepemilikan file ke user Anda ($USER) dan grup web server (www-data)
sudo chown -R $USER:www-data /var/www/simple_pos

# Berikan izin tulis untuk user dan grup pada direktori storage dan cache
sudo chmod -R 775 /var/www/simple_pos/storage
sudo chmod -R 775 /var/www/simple_pos/bootstrap/cache
```

---

## Langkah 7: Konfigurasi Web Server Nginx

Buat file konfigurasi virtual host baru untuk aplikasi:
```bash
sudo nano /etc/nginx/sites-available/simple_pos
```

Tempelkan konfigurasi berikut:
```nginx
server {
    listen 8081;
    server_name _; # Menangani akses dari IP STB lokal port 8081
    root /var/www/simple_pos/public;

    add_header X-Frame-Options "SAMEORIGIN";
    add_header X-Content-Type-Options "nosniff";

    index index.php index.html;
    charset utf-8;

    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }

    location = /favicon.ico { access_log off; log_not_found off; }
    location = /robots.txt  { access_log off; log_not_found off; }

    error_page 404 /index.php;

    location ~ \.php$ {
        fastcgi_pass unix:/var/run/php/php8.3-fpm.sock;
        fastcgi_param SCRIPT_FILENAME $realpath_root$fastcgi_script_name;
        include fastcgi_params;
        fastcgi_hide_header X-Powered-By;
    }

    location ~ /\.(?!well-known).* {
        deny all;
    }
}
```

Aktifkan konfigurasi virtual host:
```bash
# Aktifkan virtual host simple_pos (port 8081 berdampingan dengan default site port 80)
sudo ln -sf /etc/nginx/sites-available/simple_pos /etc/nginx/sites-enabled/

# Uji validitas sintaks konfigurasi
sudo nginx -t

# Muat ulang service Nginx dan PHP-FPM
sudo systemctl restart php8.3-fpm
sudo systemctl restart nginx
```

---

## Langkah 8: Eksekusi Cache Optimasi Laravel

Jalankan perintah cache produksi agar Laravel memuat rute dan konfigurasi secara instan tanpa membaca file berulang-ulang:
```bash
cd /var/www/simple_pos
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

---

## Langkah 9: Panduan Krusial Cetak Bluetooth Thermal (Persyaratan HTTPS)

Browser Google Chrome di tablet/HP Android **hanya mengizinkan Web Bluetooth API pada koneksi HTTPS yang aman** (atau `localhost`). Jika tablet kasir membuka via `http://192.168.1.100`, browser akan memblokir tombol koneksi printer Bluetooth.

Pilih salah satu solusi termudah di bawah ini:

### Opsi A (Sangat Direkomendasikan): Cloudflare Tunnel (Gratis & Otomatis SSL)
1. Pasang `cloudflared` di Armbian STB.
2. Hubungkan ke domain Anda (misal: `kasir.warunganda.com`).
3. **Keuntungan:** Otomatis mendapatkan SSL HTTPS resmi, tidak perlu IP publik, tidak perlu port forwarding modem, dan kasir bisa mencetak Bluetooth secara mulus baik dari warung maupun jarak jauh.

### Opsi B: Self-Signed SSL / mkcert di Jaringan Wi-Fi Lokal
1. Buat sertifikat SSL lokal dengan `mkcert` untuk IP STB Anda.
2. Tambahkan konfigurasi SSL (port 443) pada file Nginx `/etc/nginx/sites-available/penyetan`.
3. Pasang sertifikat root `mkcert` pada tablet Android kasir.

### Opsi C: Layar Kasir Dicolok Langsung ke STB (HDMI)
Jika STB dicolokkan ke monitor kasir via kabel HDMI dan dibuka menggunakan browser bawaan STB di alamat:
```text
http://localhost
```
Browser menganggap `localhost` sebagai konteks aman (*Secure Context*), sehingga Web Bluetooth dapat berfungsi langsung tanpa SSL.

---

## Pemeliharaan & Troubleshooting di Armbian STB

### Mengaktifkan Swap File (Pencegah Crash RAM 1GB)
Jika STB Anda hanya memiliki RAM 1 GB, aktifkan swap file 1 GB agar sistem tetap stabil saat ada beban kueri berat:
```bash
sudo fallocate -l 1G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
```

### Memperbarui Aplikasi di Masa Depan
Setiap kali Anda mengubah kode atau UI di laptop Windows:
1. Jalankan `npm run build` di laptop.
2. Upload file yang berubah (termasuk folder `public/build/`) ke STB.
3. Di STB, jalankan:
   ```bash
   cd /var/www/penyetan
   php artisan migrate --force
   php artisan optimize:clear
   php artisan config:cache
   php artisan route:cache
   php artisan view:cache
   ```
