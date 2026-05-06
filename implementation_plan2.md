# Goal Description
Menambahkan fitur "**Cek Stok Akhir Shift**" yang memungkinkan pengguna mendata sisa material di area pabrik yang terbagi dalam blok-blok (default 12 blok). Setiap blok akan mendata material per pallet (hingga 20 pallet per blok) dan menampilkan ringkasan/total per blok.

## User Review Required
> [!IMPORTANT]  
> Mohon konfirmasi mengenai rancangan input 20 pallet ini:
> Apakah yang dimaksud adalah **20 baris input (satu tabel dengan 20 baris)** di mana setiap baris mewakili 1 pallet? Kami akan membuat satu tabel per blok dengan 20 baris drop-down untuk memilih material dan input qty pcs-nya.

## Proposed Changes

### Configuration & Routing
#### [MODIFY] [index.html](file:///c:/Users/54321/Desktop/jit%202/index.html)
- Menambahkan import script baru `<script src="src/pages/stock-check.js"></script>`

#### [MODIFY] [src/router.js](file:///c:/Users/54321/Desktop/jit%202/src/router.js)
- Menambahkan route baru `'/stock': () => StockCheckPage.render()`

#### [MODIFY] [src/components/sidebar.js](file:///c:/Users/54321/Desktop/jit%202/src/components/sidebar.js)
- Menambahkan menu "Cek Stok" di bawah grup "Perhitungan" dengan route `#/stock`.

---

### Data Store
#### [MODIFY] [src/store.js](file:///c:/Users/54321/Desktop/jit%202/src/store.js)
- Menambahkan state `stockChecks` yang menyimpan riwayat per tanggal.
- Menambahkan fungsi `getStockCheck(date)`, `saveStockCheck(date, data)`, dan inisialisasi default 12 blok.

---

### UI Implementation
#### [NEW] [src/pages/stock-check.js](file:///c:/Users/54321/Desktop/jit%202/src/pages/stock-check.js)
- **Tampilan Utama**: Memilih tanggal dan tombol "Tambah Blok".
- **List Blok**: Menampilkan card/section untuk setiap blok (Blok 1 s/d Blok 12+).
- **Tabel Input per Blok**:
  - Berisi tabel dengan **20 baris**.
  - Setiap baris mewakili 1 Pallet.
  - Kolom: `No`, `Material (Dropdown)`, `Qty Pcs (Input)`.
- **Summary per Blok**: 
  - Dibawah tabel 20 baris, terdapat ringkasan otomatis: Jumlah total Pallet dan Jumlah total Pcs per item material dalam blok tersebut.

## Verification Plan
### Automated Tests
- Menjalankan dev server `npm run dev` atau sejenisnya.
### Manual Verification
- Buka browser ke halaman "Cek Stok".
- Verifikasi bahwa 12 blok ter-render dengan benar.
- Isi baris pallet ke-1 dan ke-2 di Blok 1, lalu verifikasi "Summary" menjumlahkan Total Pcs dan mendeteksi terdapat 2 Pallet.
- Klik "Tambah Blok" dan verifikasi Blok ke-13 ditambahkan.
