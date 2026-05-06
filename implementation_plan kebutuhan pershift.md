# Distribusi Bahan per Shift

Menambahkan halaman baru bernama "Distribusi Bahan per Shift" di bawah menu "Perhitungan" untuk mengatur pembagian distribusi material (Total SPB) dari hasil `Material Requirement` ke masing-masing shift (SH1, SH2, SH3) dengan memperhitungkan sisa stok.

## User Review Required
**Jika kebutuhan per-shift ditambah Buffer 2J dikurangi sisa stok menghasilkan nilai X, apakah pembagian ke masing-masing shift harus dibulatkan ke kelipatan *Qty per Pallet*?** 
Misal: Total butuh 1.5 pallet, apakah shift 1 dikirim 2 pallet atau 1 pallet? (Dalam rencana ini, kita akan mendistribusikan dalam bentuk persentase / jumlah pallet pembulatan).

## Proposed Changes

### UI & Routing
#### [MODIFY] [src/components/sidebar.js](file:///c:/Users/54321/Desktop/jit%202/src/components/sidebar.js)
- Tambah menu `Distribusi Bahan` di bawah grup Perhitungan dengan route `#/distribution`.

#### [MODIFY] [src/router.js](file:///c:/Users/54321/Desktop/jit%202/src/router.js)
- Daftarkan route `'/distribution': () => DistributionPage.render()`.

#### [MODIFY] [index.html](file:///c:/Users/54321/Desktop/jit%202/index.html)
- Tambahkan `<script src="src/pages/distribution.js"></script>`

### Distribution Logic & Store
#### [NEW] `src/pages/distribution.js`
- **Header**: Pilihan Tanggal.
- **Tabel Distribusi**:
  - Kolom: Material, Total SPB, Sisa Stok, Kebutuhan SH1, Kebutuhan SH2, Kebutuhan SH3, % Pengiriman.
  - **Logika Distribusi**:
    - Distribusi berurutan: SH1 -> SH2 -> SH3.
    - Untuk tiap shift: `Kebutuhan Nett = (Kebutuhan Shift + Buffer) - Sisa Stok Tersedia`.
    - Jika `Sisa Stok >= (Kebutuhan + Buffer)`, maka shift tersebut = 0 (tidak perlu dikirim), dan `Sisa Stok` dilimpahkan ke shift berikutnya.
    - Jika `Sisa Stok < (Kebutuhan + Buffer)`, maka kekurangannya dikirim ke shift tersebut (dalam satuan Pallet, berdasarkan `Total SPB`).
    - Pastikan *Total Kirim SH1 + SH2 + SH3 === Total SPB*.
- **Export Data**: Fitur untuk export jadwal distribusi ke Excel.

## Verification Plan
1. Buka halaman Material Requirement untuk memastikan `Total SPB` dan `Sisa Stok` ada.
2. Buka halaman Distribusi Bahan.
3. Cek apakah perhitungan shift sudah mengurangi sisa stok secara progresif (SH1, lalu SH2, lalu SH3) dan memastikan Total Distribusi = Total SPB.
4. Cek kolom persentase pengiriman per shift.
