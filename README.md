# Website Desa Kaligayam — Versi Supabase + Vercel

Versi ini memakai **Supabase** (database online gratis) sehingga data kegiatan
tersimpan permanen dan aman dipakai di **Vercel** (yang tidak punya disk permanen).

Struktur folder:
```
desa-kaligayam-vercel/
├── app.js              → semua logic backend (API, koneksi Supabase)
├── server.js            → untuk jalan di lokal/Replit (app.listen)
├── api/index.js          → untuk jalan di Vercel (serverless function)
├── vercel.json            → konfigurasi routing Vercel
├── supabase-setup.sql      → SQL untuk membuat tabel di Supabase
├── .env.example
└── public/index.html       → frontend
```

---

## LANGKAH 1 — Buat akun & project Supabase (gratis)

1. Buka **https://supabase.com** → klik **Start your project** → daftar
   pakai email atau akun GitHub. Tidak perlu kartu kredit untuk paket gratis.
2. Setelah login, klik **New Project**.
   - **Name**: `desa-kaligayam` (bebas)
   - **Database Password**: buat password kuat, **simpan baik-baik**
   - **Region**: pilih yang terdekat (misalnya Singapore)
   - Klik **Create new project**, tunggu ± 1-2 menit sampai project siap.
3. Setelah project siap, buka menu **SQL Editor** di sidebar kiri →
   **New query**. Buka file `supabase-setup.sql` dari folder ini, **copy
   semua isinya**, paste ke SQL Editor, lalu klik **Run**.
   Ini akan membuat tabel `kegiatan` beserta 3 data contoh.
4. Buka menu **Project Settings** (ikon gear) → **API**. Catat dua nilai ini:
   - **Project URL** → contoh: `https://abcdefgh.supabase.co`
   - **service_role key** (di bagian "Project API keys", bukan yang "anon public")
     ⚠️ Key ini rahasia, jangan pernah ditaruh di kode frontend / di-share publik.

Paket gratis Supabase: 500MB database, cukup untuk ribuan data kegiatan + foto
ukuran wajar. Project otomatis pause kalau tidak diakses 7 hari berturut-turut
(tinggal klik "Restore" di dashboard kalau itu terjadi, gratis tetap aman).

---

## LANGKAH 2 — Coba jalankan di lokal dulu (opsional)

```bash
cd desa-kaligayam-vercel
cp .env.example .env
```
Edit file `.env`, isi `SUPABASE_URL` dan `SUPABASE_SERVICE_KEY` dengan nilai
dari Langkah 1, lalu:
```bash
npm install
npm start
```
Buka `http://localhost:3000`, coba login admin (default `admin` / `kaligayam2026`),
upload kegiatan, lalu cek di dashboard Supabase (menu **Table Editor** → tabel
`kegiatan`) — data baru harusnya langsung muncul di sana.

---

## LANGKAH 3 — Deploy ke Vercel

1. **Push folder ini ke GitHub** dulu:
   - Buat repository baru di github.com (bisa private)
   - Di folder project:
     ```bash
     git init
     git add .
     git commit -m "Website Desa Kaligayam"
     git branch -M main
     git remote add origin https://github.com/USERNAME/NAMA-REPO.git
     git push -u origin main
     ```
   (Pastikan `.env` **tidak ikut ter-push** — sudah otomatis diabaikan lewat `.gitignore`.)

2. Buka **https://vercel.com** → daftar/login (bisa pakai akun GitHub langsung).
3. Klik **Add New... → Project** → pilih repository GitHub yang baru dibuat →
   klik **Import**.
4. Di halaman konfigurasi sebelum deploy, buka bagian **Environment Variables**
   dan tambahkan satu-satu:

   | Name | Value |
   |---|---|
   | `ADMIN_USER` | username admin pilihanmu |
   | `ADMIN_PASS` | password admin pilihanmu |
   | `JWT_SECRET` | string acak panjang, contoh `kaligayam-2026-rahasia-xyz` |
   | `SUPABASE_URL` | dari Langkah 1 |
   | `SUPABASE_SERVICE_KEY` | dari Langkah 1 (service_role key) |

5. Klik **Deploy**. Tunggu ± 1 menit. Vercel akan kasih URL seperti
   `https://nama-project.vercel.app` — itu sudah live dan bisa diakses siapa saja.
6. Tes: buka URL tersebut → klik **Admin** → login → upload kegiatan baru →
   refresh halaman/buka di HP lain → kegiatan harus tetap muncul (karena
   sudah tersimpan di Supabase, bukan di memori sementara).

### Update website setelah deploy
Setiap kali kamu `git push` perubahan ke branch `main`, Vercel **otomatis
deploy ulang**. Tidak perlu klik apa-apa lagi di dashboard Vercel.

### Custom domain (opsional)
Di dashboard project Vercel → tab **Domains** → masukkan domain desa kamu
(kalau sudah beli, misal `desakaligayam.id`) → ikuti instruksi pengaturan DNS.

---

## Kalau mau pakai Replit juga (bukan Vercel)
File-file di folder ini (`server.js`, `app.js`) juga jalan langsung di Replit —
caranya sama seperti versi sebelumnya: upload semua file, isi Secrets dengan
5 environment variable di atas, lalu klik **Run**. Karena sudah pakai Supabase,
data tetap aman tersimpan permanen meski dijalankan di Replit maupun Vercel.

---

## Troubleshooting umum
- **"Gagal memuat data kegiatan dari server"** → cek `SUPABASE_URL` &
  `SUPABASE_SERVICE_KEY` sudah benar di Environment Variables.
- **Login admin gagal terus** → cek `ADMIN_USER` / `ADMIN_PASS` di Environment
  Variables sudah sesuai dengan yang diketik di form login.
- **Foto kegiatan tidak muncul setelah upload** → ukuran foto terlalu besar
  (limit saat ini 8MB per request). Kompres foto dulu sebelum upload, atau
  kabari saya untuk diupgrade pakai Supabase Storage (lebih efisien untuk foto).
