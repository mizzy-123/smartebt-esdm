# SMART-EBT — Sistem Monitoring Aksi Rencana Transisi EBT

Dokumen ini adalah spesifikasi teknis untuk AI coding agent yang akan membangun aplikasi **SMART-EBT** menggunakan stack **Laravel 13 + Inertia.js v3 + React 19 + TypeScript + Tailwind v4**, mengikuti struktur `laravel/react-starter-kit` yang sudah tersedia di project (Fortify untuk auth, Wayfinder untuk routing typed, shadcn/ui + Radix untuk komponen).

Jangan generate ulang scaffolding starter kit (auth pages, layout dasar, dsb) — gunakan yang sudah ada dan **extend**, bukan replace.

---

## 1. Ringkasan Aplikasi

SMART-EBT adalah sistem untuk mengelola pengajuan bantuan/hibah program transisi Energi Baru Terbarukan (EBT) dari masyarakat/organisasi ke pemerintah, dengan verifikasi berjenjang oleh admin, serta menampilkan sebaran titik potensi EBT di peta publik.

Ada 2 role:
- **admin** — hanya 1 akun admin (seed manual, tidak ada registrasi admin baru dari UI)
- **user** — masyarakat umum/organisasi pemohon, bisa self-register

---

## 2. Asumsi & Klarifikasi (WAJIB dibaca sebelum implementasi)

Beberapa bagian requirement asli ambigu. Berikut asumsi yang dipakai — AI agent boleh menyesuaikan jika developer memberi instruksi lebih spesifik nanti, tapi default ke ini:

1. **Kategori pengajuan ada 4** (bukan sub-pilihan di dalam satu form), masing-masing dengan form lanjutan berbeda setelah form dasar (A) diisi:
   - `peternakan_ebt` (form A1) — mencakup Digester Biogas / PLTS / BSG untuk kebutuhan peternakan. Field "Pilih salah satu (Digester biogas/PLTS/BSG, Pompa Air Tenaga Surya)" pada A1 diperlakukan sebagai sub-field **`jenis_teknologi`** (enum) di dalam kategori ini — bukan kategori terpisah dari A4.
   - `plts_rooftop` (form A2)
   - `plts_perikanan` (form A3)
   - `pats` (form A4) — Pompa Air Tenaga Surya sebagai kategori mandiri dengan field sendiri (berbeda dari opsi `jenis_teknologi` di A1).
2. **Form dasar (A)** wajib diisi untuk **semua kategori**, field `kesediaan_ganti_kwh_pascabayar` hanya **wajib & ditampilkan** untuk kategori `plts_rooftop` dan `plts_perikanan` (karena spesifik untuk PLTS on-grid / IUPTLU), untuk kategori lain field ini disembunyikan/null.
3. **"Nama dan identitas yang jelas"** diasumsikan sebagai kombinasi field teks: `nama_pemohon` + `nomor_identitas` (KTP/NIK), bukan file upload. Jika ternyata perlu upload KTP, tambahkan field file `identitas_path`.
4. **"Surat permohonan ... dilampiri proposal"** diasumsikan **satu file upload gabungan** (PDF), bukan dua file terpisah.
5. **Dokumen tagihan listrik 6 bulan terakhir** (A2 & A3) adalah **multi-file upload** (bisa lebih dari satu file / bulan).
6. **Sistem acc per-field**: setiap field input (baik file maupun non-file) punya status individual `pending | approved | rejected` + alasan penolakan jika `rejected`. Status keseluruhan submission (`belum_intervensi` / `sudah_intervensi`) mengikuti field `status` di tabel `submissions`, yang berubah jadi `sudah_intervensi` saat admin menekan tombol **"Setujui Semua"**, atau otomatis ketika seluruh field individual berstatus `approved`.
7. **Titik yang tampil di peta publik (landing page)** hanya submission dengan `status = sudah_intervensi` (sudah di-ACC admin) DAN punya koordinat valid.
8. **Login user**: bisa pakai `username` atau `email` — Laravel Fortify dikonfigurasi untuk menerima kolom `login` yang divalidasi ke salah satu dari dua kolom tersebut.
9. **Peta**: menggunakan **Leaflet.js** via `react-leaflet` (ringan, tanpa API key, cocok untuk kebutuhan ini) — bukan Google Maps.
10. **Chart dashboard admin**: menggunakan **Recharts** (ringan, terintegrasi baik dengan React + Tailwind, tidak perlu library tambahan yang berat).
11. **Field select/enum yang punya opsi "Lainnya"**: setiap field seperti ini disertai kolom teks pendamping `*_lainnya` yang hanya wajib diisi jika opsi yang dipilih adalah `lainnya`. Di frontend, saat user memilih `Lainnya` pada `<Select>`, otomatis muncul `<Input type="text">` di bawahnya untuk isi manual. Field yang kena aturan ini: `jenis_atap` (A2 & A3), `kerangka_atap` (A3), `sumber_air` (A4). Backend menyimpan pilihan asli di kolom enum (`lainnya`) + nilai bebas di kolom `_lainnya`, dan saat ditampilkan (detail/admin review) yang muncul adalah isi `_lainnya` jika ada.

> Package tambahan yang perlu di-`npm install`: `leaflet`, `react-leaflet`, `@types/leaflet`, `recharts`.

---

## 3. Skema Database

### 3.1 `users` (extend tabel bawaan starter kit)
Tambahkan migration untuk kolom berikut jika belum ada:
| kolom | tipe | keterangan |
|---|---|---|
| `username` | string, unique | login alternatif |
| `role` | enum(`admin`,`user`) default `user` | |

Seeder: buat 1 user `role=admin` via `DatabaseSeeder` (bukan lewat form register).

### 3.2 `submissions` (pengajuan — data form A / dasar)
| kolom | tipe | keterangan |
|---|---|---|
| `id` | bigint pk | |
| `user_id` | FK users | |
| `category` | enum(`peternakan_ebt`,`plts_rooftop`,`plts_perikanan`,`pats`) | |
| `status` | enum(`belum_intervensi`,`sudah_intervensi`) default `belum_intervensi` | status keseluruhan |
| `nama_pemohon` | string | |
| `nomor_identitas` | string | |
| `alamat_organisasi` | text | alamat organisasi/ketua sesuai proposal |
| `nama_ketua` | string | |
| `surat_permohonan_proposal_path` | string (file) | |
| `dokumen_kepengurusan_path` | string (file) | bukti organisasi tidak fiktif |
| `dokumen_sk_kemenkumham_path` | string (file) | SK Kemenkumham / surat ket. dinas kabupaten |
| `surat_keterangan_desa_path` | string (file) | |
| `kesediaan_ganti_kwh_pascabayar` | boolean nullable | hanya relevan utk plts_rooftop & plts_perikanan |
| `latitude` | decimal(10,7) | |
| `longitude` | decimal(10,7) | |
| `deskripsi_titik` | text | muncul di popup peta |
| `field_reviews` | json | lihat format di §3.6 |
| `created_at`, `updated_at` | | |

### 3.3 `submission_peternakan` (detail kategori A1, 1:1 ke submissions)
| kolom | tipe |
|---|---|
| `submission_id` | FK unique |
| `jenis_teknologi` | enum(`digester_biogas`,`plts`,`bsg`,`pats`) |
| `kapasitas_kandang_m2` | decimal |
| `jenis_ternak` | string |
| `jenis_usaha` | string |
| `jumlah_ternak` | integer |
| `ketersediaan_lahan` | text |
| `komitmen_pengelolaan` | text |

### 3.4 `submission_plts_rooftop` (detail A2, 1:1)
| kolom | tipe |
|---|---|
| `submission_id` | FK unique |
| `kapasitas_kwh_eksisting` | decimal |
| `kondisi_lokasi` | text |
| `panjang_instalasi` | decimal |
| `jenis_bangunan` | enum(`permanen`,`sementara`) |
| `jenis_gedung` | string (kelas/aula/asrama/dll) |
| `umur_bangunan` | string |
| `luas_bangunan` | decimal |
| `tinggi_bangunan` | decimal |
| `jenis_atap` | enum(`baja_ringan`,`kayu`,`kanal_c`,`kanal_i`,`beton`,`lainnya`) |
| `jenis_atap_lainnya` | string nullable — diisi jika `jenis_atap = lainnya` |
| `tahun_pemasangan_atap` | year/integer |
| `luas_atap` | decimal |
| `potensi_bayangan` | text |
| `nomor_pelanggan` | string |
| `jenis_layanan_listrik` | enum(`pascabayar`,`prabayar`) |
| `data_pelanggan` | text |
| `daya_terpasang_pln` | decimal |
| `perkiraan_kapasitas_plts` | decimal |
| `jumlah_pengguna` | integer |
| `kesediaan_ganti_meteran` | boolean |

### 3.5 `submission_plts_perikanan` (detail A3, 1:1)
Sama seperti `submission_plts_rooftop` tapi:
- `jenis_atap` → enum(`genteng`,`kayu`,`asbes`,`seng`,`lainnya`) + kolom `jenis_atap_lainnya` (string nullable)
- tambah `kerangka_atap` → enum(`baja_ringan`,`kayu`,`kanal_c`,`kanal_i`,`beton`,`lainnya`) + kolom `kerangka_atap_lainnya` (string nullable)
- `daya_terpasang_pln` & `perkiraan_kapasitas_plts` diganti → `daya_peralatan_perikanan` (decimal, untuk estimasi kapasitas PLTS Atap)
- field lain identik (kapasitas_kwh_eksisting, kondisi_lokasi, panjang_instalasi, jenis_bangunan, jenis_gedung, umur_bangunan, luas_bangunan, tinggi_bangunan, tahun_pemasangan_atap, luas_atap, potensi_bayangan, nomor_pelanggan, jenis_layanan_listrik, data_pelanggan, kesediaan_ganti_meteran)

### 3.6 `submission_pats` (detail A4, 1:1)
| kolom | tipe |
|---|---|
| `submission_id` | FK unique |
| `ketersediaan_pompa` | enum(`sudah_ada`,`belum`) |
| `jenis_pompa` | enum(`permukaan`,`submersible`) |
| `kapasitas_pompa_watt` | decimal |
| `sumber_air` | enum(`air_tanah`,`sungai`,`mata_air`,`lainnya`) |
| `sumber_air_lainnya` | string nullable — diisi jika `sumber_air = lainnya` |
| `izin_pemanfaatan_air` | enum(`ada`,`belum_ada`) |
| `ketersediaan_lahan_kontrol` | enum(`ada`,`tidak`) |
| `status_kepemilikan_lahan` | string (pribadi/tanah desa/dll) |

### 3.7 `submission_files` (untuk multi-file, misal 6 bulan tagihan listrik)
| kolom | tipe |
|---|---|
| `id` | pk |
| `submission_id` | FK |
| `field_key` | string, contoh `tagihan_listrik` |
| `file_path` | string |
| `original_name` | string |
| `periode` | string nullable (mis. "Januari 2026") |

### 3.8 Format kolom `submissions.field_reviews` (JSON)
Struktur per-field review yang bisa di-ACC satu-satu oleh admin:
```json
{
  "surat_permohonan_proposal_path": { "status": "pending", "reason": null },
  "dokumen_kepengurusan_path": { "status": "approved", "reason": null },
  "dokumen_sk_kemenkumham_path": { "status": "rejected", "reason": "Dokumen buram, mohon unggah ulang" },
  "nama_pemohon": { "status": "pending", "reason": null }
}
```
Buat helper `App\Support\SubmissionFieldRegistry` (PHP class/enum) yang mendefinisikan daftar `field_key` + label per kategori, dipakai untuk:
- inisialisasi `field_reviews` saat submission dibuat (semua `pending`)
- generate checklist di halaman detail admin
- validasi bahwa key yang di-update oleh admin memang valid untuk kategori tsb

Tombol **"Setujui Semua"** di admin panel: set semua entry `field_reviews.*.status = approved`, lalu set `submissions.status = sudah_intervensi`.
Jika admin menolak satu field saja → status field itu `rejected` + `reason` wajib diisi, `submissions.status` tetap `belum_intervensi`, user melihat alasan di halaman status pengajuannya dan bisa mengedit ulang field tersebut untuk resubmit (reset field itu ke `pending`).

---

## 4. Autentikasi & Otorisasi

- Gunakan **Laravel Fortify** yang sudah ada di stack.
- Login menerima `login` (bisa username atau email) + `password`. Override `FortifyServiceProvider::authenticateUsing` untuk cek `username` atau `email`.
- Register: hanya untuk role `user` (field: name, username, email, password). Tidak ada opsi pilih role di form register.
- Buat middleware/gate `is-admin` (`Gate::define('admin', fn($user) => $user->role === 'admin')`) untuk melindungi semua route `/admin/*`.
- Redirect setelah login: admin → `/admin/dashboard`, user → `/dashboard`.

---

## 5. Struktur Halaman & Routing (Inertia pages)

```
resources/js/pages/
  landing.tsx                     -> "/" (public, tidak perlu login)
  auth/... (sudah ada dari starter kit)

  user/
    dashboard.tsx                 -> "/dashboard" (list pengajuan milik user + status)
    submissions/
      create.tsx                  -> "/submissions/create" (pilih kategori -> form dinamis)
      show.tsx                    -> "/submissions/{id}" (detail + status per-field + alasan tolak)
      edit.tsx                    -> "/submissions/{id}/edit" (revisi field yang rejected)

  admin/
    dashboard.tsx                 -> "/admin/dashboard" (grafik ringkas)
    submissions/
      index.tsx                   -> "/admin/submissions" (tabel + filter belum/sudah intervensi + kategori)
      show.tsx                    -> "/admin/submissions/{id}" (checklist acc per field + tombol setujui semua)
    downloads/
      index.tsx                   -> "/admin/downloads" (kelola file surat/form yang bisa diunduh publik)
```

### Routes (`routes/web.php`) — ringkasan
```php
// Public
Route::get('/', LandingController::class)->name('landing');
Route::get('/map-data', [LandingController::class, 'mapData']); // json titik yang sudah di-acc
Route::get('/downloads', [DownloadController::class, 'index']);
Route::get('/downloads/{file}', [DownloadController::class, 'download']);

// User (auth + role user tidak perlu dibatasi, admin pun boleh akses dashboard user jika perlu)
Route::middleware('auth')->group(function () {
    Route::get('/dashboard', [UserDashboardController::class, 'index']);
    Route::resource('submissions', SubmissionController::class)->except(['index','destroy']);
});

// Admin
Route::middleware(['auth', 'can:admin'])->prefix('admin')->name('admin.')->group(function () {
    Route::get('/dashboard', [Admin\DashboardController::class, 'index']);
    Route::get('/submissions', [Admin\SubmissionController::class, 'index']);
    Route::get('/submissions/{submission}', [Admin\SubmissionController::class, 'show']);
    Route::patch('/submissions/{submission}/field-review', [Admin\SubmissionController::class, 'reviewField']);
    Route::patch('/submissions/{submission}/approve-all', [Admin\SubmissionController::class, 'approveAll']);
    Route::resource('downloads', Admin\DownloadResourceController::class)->except(['show']);
});
```

---

## 6. Detail Fitur per Role

### 6.1 User
1. **Register/Login** — simple, pakai starter kit Fortify (name, username, email, password).
2. **Dashboard** — tabel pengajuan milik sendiri: kategori, tanggal, status (`Belum Diverifikasi` / `Terverifikasi`), badge jika ada field yang ditolak (perlu revisi).
3. **Buat Pengajuan** (`/submissions/create`):
   - Step 1: pilih kategori (4 kartu pilihan dengan ikon+deskripsi singkat: Peternakan EBT, PLTS Rooftop, PLTS Perikanan, Pompa Air Tenaga Surya).
   - Step 2: form dasar (A) — semua field di §3.2, upload file pakai drag-drop componen (gunakan shadcn/ui + `react-dropzone` opsional, atau `<input type=file>` yang di-style).
   - Step 3: form spesifik kategori (A1/A2/A3/A4) sesuai pilihan.
   - Step khusus koordinat: komponen peta Leaflet interaktif — user klik titik di map untuk set `latitude`/`longitude`, ada juga input manual sebagai fallback.
   - Submit → validasi server-side (Laravel Form Request per kategori), simpan file ke `storage/app/public/submissions/{id}/...`, inisialisasi `field_reviews` via `SubmissionFieldRegistry`.
4. **Detail Pengajuan** (`/submissions/{id}`) — tampilkan semua data + status per-field (badge hijau/kuning/merah) + alasan penolakan bila ada.
5. **Edit/Revisi** — hanya field berstatus `rejected` yang bisa diedit ulang; setelah disimpan, status field itu kembali ke `pending`.

### 6.2 Admin
1. **Dashboard** (`/admin/dashboard`):
   - Ringkasan angka: total pengajuan, belum intervensi, sudah intervensi, per kategori.
   - Grafik sederhana (Recharts): bar chart jumlah pengajuan per kategori, pie/donut chart status belum vs sudah intervensi.
2. **Daftar Pengajuan** (`/admin/submissions`):
   - Tabel dengan filter status (`belum_intervensi`/`sudah_intervensi`) dan kategori, search nama pemohon.
3. **Detail & Verifikasi** (`/admin/submissions/{id}`):
   - Tampilkan seluruh data (dasar + detail kategori) dan file (preview PDF/gambar).
   - Untuk tiap field: toggle/checkbox **ACC** atau **Tidak ACC** (jika tidak ACC, textarea alasan wajib diisi sebelum bisa disimpan).
   - Tombol besar **"Setujui Semua"** di bagian atas/bawah halaman.
   - Field koordinat ditampilkan di preview map kecil.
4. **Kelola Dokumen Unduhan** (`/admin/downloads`) — CRUD sederhana untuk upload file surat/form (PDF/Word) yang muncul di landing page publik untuk diunduh pemohon (mis. template surat permohonan, template proposal).

---

## 7. Landing Page (Publik, tanpa login)

1. **Hero section** singkat tentang program SMART-EBT.
2. **Peta sebaran potensi EBT** — komponen Leaflet full-width, marker diambil dari endpoint `/map-data` (hanya submission `status = sudah_intervensi`), tiap marker punya popup berisi `deskripsi_titik`, kategori, dan (opsional) nama organisasi jika memang boleh dipublikasikan — kalau tidak boleh, cukup tampilkan kategori + deskripsi saja untuk menjaga privasi pemohon.
3. **Ringkasan statistik publik** (opsional, boleh reuse sebagian data chart dari admin dashboard yang aman dipublikasikan, misal total titik per kategori).
4. **Pusat Unduhan** — daftar file/form yang bisa diunduh (dari tabel `downloads` yang dikelola admin), misalnya "Form Surat Permohonan", "Template Proposal".
5. **CTA** — tombol "Ajukan Sekarang" mengarah ke `/register` atau `/login` jika sudah punya akun.

---

## 8. Validasi & Keamanan File Upload

- Batasi tipe file: PDF, JPG, PNG untuk dokumen; maksimal ukuran per file (mis. 5MB, sesuaikan dengan kebutuhan nyata).
- Simpan di disk `public` (`storage/app/public/submissions/{submission_id}/{field_key}.{ext}`), buat symlink `php artisan storage:link`.
- Gunakan Laravel Form Request terpisah per kategori untuk validasi (`StoreSubmissionBaseRequest`, `StorePeternakanRequest`, `StorePltsRooftopRequest`, `StorePltsPerikananRequest`, `StorePatsRequest`), digabung di controller sesuai kategori yang dipilih.
- Semua endpoint admin dilindungi `Gate::authorize('admin')`.
- Hindari expose path storage internal ke publik — endpoint `/map-data` hanya mengembalikan field yang aman dipublikasikan (lat, long, kategori, deskripsi), **tidak** termasuk data pemohon/file.

---

## 9. Struktur Folder Tambahan yang Disarankan

```
app/
  Enums/
    SubmissionCategory.php
    SubmissionStatus.php
    FieldReviewStatus.php
  Support/
    SubmissionFieldRegistry.php   // daftar field_key + label per kategori
  Http/
    Controllers/
      LandingController.php
      DownloadController.php
      SubmissionController.php
      Admin/DashboardController.php
      Admin/SubmissionController.php
      Admin/DownloadResourceController.php
    Requests/
      StoreSubmissionBaseRequest.php
      StorePeternakanRequest.php
      StorePltsRooftopRequest.php
      StorePltsPerikananRequest.php
      StorePatsRequest.php
  Models/
    Submission.php
    SubmissionPeternakan.php
    SubmissionPltsRooftop.php
    SubmissionPltsPerikanan.php
    SubmissionPats.php
    SubmissionFile.php
    Download.php

resources/js/
  components/
    submission-form/
      base-form.tsx
      peternakan-form.tsx
      plts-rooftop-form.tsx
      plts-perikanan-form.tsx
      pats-form.tsx
    map/
      coordinate-picker.tsx       // Leaflet, klik untuk set lat/long
      public-map.tsx              // Leaflet, marker + popup
    admin/
      field-review-item.tsx       // checkbox ACC/Tidak ACC + textarea alasan
      stat-chart.tsx              // wrapper Recharts
```

---

## 10. Urutan Implementasi yang Disarankan

1. Migration + model + enum (§3) dan seeder admin.
2. Fortify: tambah kolom `username`, custom `login` field.
3. `SubmissionFieldRegistry` + logic `field_reviews` JSON.
4. CRUD submission sisi user (form multi-kategori + upload + koordinat).
5. Landing page + endpoint `/map-data` + peta publik.
6. Admin: index + detail + review per-field + approve-all.
7. Admin dashboard (chart).
8. Pusat unduhan (admin CRUD + tampil di landing page).
9. Polish: validasi, empty states, loading states, mobile responsiveness (banyak petani/pemohon kemungkinan akses dari HP).

---

## 11. Package Tambahan yang Perlu Di-install

```bash
npm install leaflet react-leaflet
npm install -D @types/leaflet
npm install recharts
```

Tidak perlu package composer tambahan — cukup `laravel/fortify` (sudah ada) dan storage/filesystem bawaan Laravel.
