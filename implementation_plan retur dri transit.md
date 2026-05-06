# Transit Outbound + Multi-Destination Return System

## Latar Belakang
Membuat menu **Pengeluaran (Outbound)** di Transit Produksi untuk men-scan barcode keluar dari area transit, dengan pilihan tujuan retur. Stok transit berkurang setelah retur diterima. Sistem baru juga dibuat untuk tujuan yang belum memiliki on-hand (3P2, 3F2).

## Proposed Changes

### 1. Store Logic ([store.js](file:///c:/Users/54321/Desktop/jit%202/src/store.js))

#### Data Baru
- `transitOutboundPending[]` — antrean outbound transit menunggu verifikasi tujuan
- `externalOnhand.3P2{}`, `externalOnhand.3F2{}` — on-hand stok untuk Gudang Packing 3IN1 dan Produksi 3IN1

#### Fungsi Baru
- `requestTransitOutbound(material, barcode, pcs, destination)` — kurangi stok transit, masukkan ke pending outbound
- `verifyTransitOutbound(id, action)` — terima/tolak di tujuan
  - `accept` → masukkan ke on-hand tujuan (lineStock untuk 3F1, externalOnhand untuk 3P2/3F2, WMS untuk 3P1)
  - `reject` → kembalikan stok ke transit
- `getExternalOnhand(dest)` — ambil data on-hand 3P2/3F2

---

### 2. [NEW] Transit Outbound Page (`transit-outbound.js`)

UI mirip Inbound Transit:
- **Kiri:** Scanner barcode, pilihan tujuan (dropdown 4 opsi), field alokasi menampilkan `Dari: B1.2` (blok asal)
- **Kanan:** Log scan sesi

#### 4 Pilihan Tujuan:
| ID | Label |
|----|-------|
| `3P1` | Gudang Packing RNG |
| `3F1` | Line Produksi RNG |
| `3F2` | Produksi 3IN1 |
| `3P2` | Gudang Packing 3IN1 |

---

### 3. [NEW] On-Hand Pages untuk 3P2 & 3F2 (`external-onhand.js`)

Halaman sederhana menampilkan tabel stok per material + total pcs/pallet. Dapat menerima notifikasi verifikasi (pending outbound dari transit).

---

### 4. Notifikasi Pending di Inbound Tujuan

Sama seperti [renderPendingReturns()](file:///c:/Users/54321/Desktop/jit%202/src/pages/inbound.js#353-426) di Transit Inbound:
- **3F1** → Notifikasi muncul di [produksi-inbound.js](file:///c:/Users/54321/Desktop/jit%202/src/pages/produksi-inbound.js)
- **3P1** → Notifikasi di halaman gudang (atau WMS)  
- **3P2/3F2** → Notifikasi di `external-onhand.js`

Setiap notifikasi memiliki tombol **Terima** / **Tolak**.

---

### 5. Sidebar & Router Updates

Sidebar Transit Produksi → tambah `Pengeluaran (Outbound)`.
Sidebar grup baru **3IN1 System** → On-Hand 3F2, On-Hand 3P2.
Router → 3 route baru.

---

## Verification Plan
- Scan barcode dari transit → stok transit berkurang
- Verifikasi terima di tujuan → stok tujuan bertambah
- Verifikasi tolak → stok kembali ke transit
- Mutasi tercatat di log
