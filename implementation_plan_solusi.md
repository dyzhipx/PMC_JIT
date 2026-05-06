# Implementasi Solusi 1: Transit Buffer (Fleksibilitas Pengiriman Gudang)

Tujuan dari perubahan ini adalah untuk memungkinkan gudang mengirim barang dengan jumlah fisik aktual per pallet (misal: 72 roll), meskipun sistem SPB aslinya meminta jumlah standar (misal: 54 roll). Kelebihan jumlah ini akan diterima oleh area transit dan dicatat secara matematis sebagai persentase dari pallet (misal: ~1.33 pallet), yang mana saat dikonversi kembali ke pieces otomatis menjadi 72 roll. Sisa/kelebihan tersebut akan berfungsi sebagai buffer untuk jam berikutnya.

## Proposed Changes

### 1. Backend / Global Store
Ubah logika validasi pada saat scan barang untuk pengiriman gudang.

#### [MODIFY] `store.js`
- Pada method `scanDeliveryItem`:
  - **Hapus** batasan ketat yang menolak qty jika melebihi requirement (`item.scanned + qtyPallet > item.required + 0.001`).
  - **Ubah** menjadi: Tiga baris validasi cukup mengecek jika `item.scanned >= item.required`. Selama barang belum lengkap, sistem akan menerima pallet berapapun isinya (sehingga pallet terakhir yang discan boleh membuat total qty berlebih alias *over-fulfillment*).

### 2. Area Transit (Penerimaan Inbound)
Ubah logika pada saat scanner transit secara manual.

#### [MODIFY] `src/pages/inbound.js`
- Pada fungsi `processBarcode`:
  - **Hapus** blok kode validasi `if (inputQty !== pQty)` yang memunculkan error "Cek ulang jumlah barangnya".
  - **Ubah** nilai argumen pallet pada `PMCStore.receiveToTransit` dari yang tadinya *hardcode* `1` pallet menjadi proporsional secara matematis berdasarkan qty input dibagi qty pallet master data (`inputQty / pQty`). Contoh: jika datang 72 dan master 54, maka dicatat stok sebesar 1.333 pallet di Transit.

*(Catatan: File `warehouse-delivery.js` tidak perlu diubah secara logika, karena form input manual (Qty Pcs) sudah ada, dan error rejection sepenuhnya dikendalikan oleh fungsi `scanDeliveryItem` di `store.js` yang akan kita ubah di atas).*

---

## Verification Plan

### Manual Verification
Setelah perubahan diterapkan, langkah-langkah untuk memverifikasi adalah sebagai berikut:
1. Buka aplikasi dan asumsikan terdapat jadwal permintaan untuk produk yang membutuhkan **Plastik Susu/Mocca**.
2. Buka menu **Warehouse Request (Gudang -> Produksi)**.
3. Di bagian input scanner:
   - Isi No Barcode secara bebas (misal: `P-001`).
   - Isi Nama Material: *Plastik Mocca* (asumsi target 1 pallet = 5 pcs/roll, namun kita akan input lebih).
   - Isi Qty Aktual: **7** (angka lebih besar dari master data).
4. Klik **Proses Scan**. Sistem seharusnya menerima dan menampilkan *Progress Bar* penuh / *Over-fulfilled* tanpa pesan error.
5. Buka menu **Inbound Area Transit**.
6. Pada bagian modul *Validasi Pengiriman Aktif*, Anda akan melihat pengiriman yang barusan dikirim. Sistem akan menampilkan bahwa 7 Pcs dikirimkan.
7. Klik **Terima Barang & Masuk Stok** untuk mengunci penerimaan stok ke *Transit*.
8. Aksi ini secara matematis akan otomatis tercatat di fitur-fitur seperti *Cek Stok*, *Live Distribution*, dan *Stock Mutation* dengan kalkulasi aktual 7 Pcs dan persentase utilisasi space pallet yang proporsional.
