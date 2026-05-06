# Implementasi Ulang Alur Rijek Line (Tanpa Barcode & Dengan Verifikasi Transit)

Sesuai permintaan Anda, kita akan merombak fitur "Reject Out" yang sebelumnya berbasis *scan barcode* menjadi formulir *dropdown*, serta memisahkan wewenang pemotongan stok ke pihak Transit (Helper Limbah Transit).

## Proposed Changes

---
### 1. Perubahan Database Schema
#### [MODIFY] [schema.prisma](file:///C:/Users/54321/Desktop/jit%202%20sql%20server/server/prisma/schema.prisma)
Kita perlu memodifikasi tabel `LineReject`:
- `barcode` tidak lagi wajib (diubah menjadi `String?`).
- Ditambahkan kolom `status` standar untuk melacak persetujuan (`pending`, `approved`, `rejected`).

```prisma
model LineReject {
  // ...
  barcode      String?  @db.VarChar(50)
  // ...
  status       String   @default("pending") @db.VarChar(20)
}
```

---
### 2. Perubahan Logika Backend
#### [MODIFY] production.service.ts
1. **`processLineReject` (Pengajuan Rijek):**
   - Merima input *Line*, *Material*, *PCS*, dan *Alasan*.
   - Hanya akan **mencatat** ke tabel `LineReject` dengan status `"pending"`.
   - **TIDAK ADA** pemotongan *Line Stock* di tahap ini.

2. **`verifyLineReject(id, action)` (Verifikasi oleh Transit):**
   - Jika `action = "reject"`, cukup perbarui status ke `"rejected"`.
   - Jika `action = "accept"`, sistem akan **memotong stok otomatis dengan metode FIFO**.
     Sistem akan mencari palet-palet (*LineBarcode*) yang memiliki *material* tersebut di *line* tersebut mulai dari yang tertua, lalu menguranginya bertahap hingga berjumlah akumulasi dari PCS yang diajukan. Saldo `LineStock` juga akan dipotong saat itu juga, dan status rijek menjadi `"approved"`.

#### [MODIFY] line.routes.ts
- Menambahkan *endpoint* baru `POST /api/production/reject/:id/verify`.

---
### 3. Perubahan Tampilan Frontend (Produksi)
#### [MODIFY] produksi-reject.js
- Menghapus UI *Scan Barcode*.
- Menggantinya dengan:
  - **Dropdown Line**: (Line 1 - Line 8 dll).
  - **Dropdown Material**: Otomatis mengisi opsi material berdasarkan apa yang sedang *On-Hand* di Line terkait.
  - **Input Qty PCS**.
  - **Dropdown Kriteria Rijek**.
- Tombol berubah menjadi **"Ajukan Rijek"**. Status rijek tersebut akan muncul di log dengan label `"⏳ Menunggu Verifikasi"`.

---
### 4. Pembuatan Layar Baru (Transit Verifikasi)
#### [NEW] transit-reject-verify.js
- Membuat halaman tabel khusus untuk pihak Transit melihat antrean rijek dari Line (mirip seperti *Pending Returns* di Inbound Transit, namun ini khusus Limbah/Afkir).
- Tabel menampilkan: Waktu, Line, Material, Alasan, Qty PCS.
- Opsi untuk **Setujui** (Memotong stok Line real-time) atau **Tolak** (Membatalkan pengajuan).

#### [MODIFY] router.js & sidebar.js
- Mendaftarkan *route* `#/transit/verify-reject`.
- Menambahkan menu **♻️ Verifikasi Rijek** di sidebar `Operasional Transit`.

## Open Questions
> [!IMPORTANT]
> 1. Apakah *helper limbah transit* berhak mengedit jumlah *PCS* (misal orang Line bilang afkir 10, tapi rillnya cuma 8)? Atau hanya berhak menyetujui/menolak (kalau tolak, orang Line harus input ulang)?

## Verification Plan
1. Modifikasi tabel database dengan `npx prisma db push`.
2. Update backend API & server dir-restart.
3. Melalui UI *Produksi Rijek*, mengajukan rijek *Handling* sebesar 10 PCS dengan *dropdown* opsi Line dan Material.
4. Memastikan stok On-Hand belum terpotong.
5. Pindah ke halaman *Verifikasi Rijek* Transit, klik setujui.
6. Memastikan aplikasi sekarang memotong saldo *On-Hand*, dan laporan rijek terekam utuh.
