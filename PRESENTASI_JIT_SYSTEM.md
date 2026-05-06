# 🚀 Presentasi Eksekutif: Sistem PMC (Packaging Material Calculator) JIT

Selamat datang di presentasi end-to-end aplikasi **PMC JIT (Just-In-Time) & Inventory Management**. Sistem ini dirancang untuk mendigitalisasi dan mengoptimalkan aliran material dari Gudang menuju Produksi, melalui area Transit, dengan tingkat presisi dan kecepatan tinggi.

---

## 🌟 1. Halaman Login Premium & Interaktif
Aplikasi dimulai dengan antarmuka login yang modern, futuristik, dan dilengkapi animasi 3D responsif untuk memberikan kesan pertama yang "WOW".

![Login Screen](C:/Users/54321/.gemini/antigravity/brain/4e6ad590-5593-46fc-b3d8-a2298f34da8f/artifacts/login.png)

> [!TIP]
> **Keunggulan UI/UX:** Menggunakan *glassmorphism*, animasi interaktif (robot yang merespons ketikan pengguna), dan lokalisasi bahasa (Bahasa Sunda) untuk kedekatan kultural operasional pabrik.

---

## 📊 2. Dashboard Eksekutif & PPIC
Pusat kontrol untuk tim PPIC dan Manajemen, memberikan visibilitas penuh terhadap seluruh pergerakan stok, rencana distribusi, dan ringkasan shift.

![Dashboard PPIC](C:/Users/54321/.gemini/antigravity/brain/4e6ad590-5593-46fc-b3d8-a2298f34da8f/artifacts/dashboard.png)

### Fitur Utama PPIC:
- **Live Distribution:** Pantauan real-time status distribusi material di seluruh line produksi.
- **Stock & Schedule Monitoring:** Prediksi kebutuhan material berdasarkan jadwal produksi (*Master Schedule*).
- **Manual SPB:** Pembuatan Surat Permintaan Barang secara instan bila ada kebutuhan mendesak (*urgent*).

---

## 🏭 3. Modul Gudang (Warehouse)
Gudang adalah hulu dari sistem JIT ini. Modul ini berfokus pada kecepatan scan dan akurasi pengeluaran barang.

![Modul Gudang](C:/Users/54321/.gemini/antigravity/brain/4e6ad590-5593-46fc-b3d8-a2298f34da8f/artifacts/warehouse.png)

### Alur Kerja Gudang:
1. **Warehouse Stock:** Pemantauan ketersediaan bahan baku.
2. **Warehouse Outbound:** Pengeluaran material ke Transit menggunakan fitur pemindaian Barcode / Kamera yang cepat.
3. **Delivery Tracking:** Status barang yang sedang dikirim (Dalam Perjalanan).

---

## 🔄 4. Modul Transit (Area Buffer)
Area Transit berfungsi sebagai *buffer zone* dan pusat konsolidasi sebelum material masuk ke line produksi. Ini adalah nyawa dari penerapan JIT untuk mencegah penumpukan stok di area produksi.

````carousel
![Transit Stock On Hand](C:/Users/54321/.gemini/antigravity/brain/4e6ad590-5593-46fc-b3d8-a2298f34da8f/artifacts/transit.png)
<!-- slide -->
![TV Dashboard Transit](C:/Users/54321/.gemini/antigravity/brain/4e6ad590-5593-46fc-b3d8-a2298f34da8f/artifacts/tv_dashboard.png)
````

### Fitur Area Transit:
- **Stock On Hand (Transit):** Inventaris real-time barang yang siap dikirim ke produksi.
- **TV Dashboard Inbound:** Layar monitor operasional yang *distraction-free*, menampilkan antrean barang yang masuk dari Gudang secara otomatis (tanpa perlu *refresh*).
- **Opname Transit:** Alat kalkulator opname canggih untuk mengonversi barang sisa (receh/roll) kembali ke satuan standar.

---

## ⚙️ 5. Modul Produksi (End-User JIT)
Titik akhir dari perjalanan JIT. Material diterima sesuai kebutuhan aktual pada saat itu juga (Just-In-Time).

![Modul Produksi](C:/Users/54321/.gemini/antigravity/brain/4e6ad590-5593-46fc-b3d8-a2298f34da8f/artifacts/produksi.png)

### Fitur Utama Produksi:
- **Produksi Inbound:** Penerimaan material dari Transit melalui pemindaian barcode SCC yang akurat.
- **Produksi Outbound & Reject:** Pencatatan material yang sudah dipakai, dikembalikan (return), atau ditandai sebagai reject.
- **Produksi On Hand:** Pemantauan limit stok per line untuk mencegah kelebihan suplai (*over-supply*).

---

## 💡 Arsitektur & Teknologi (Under the Hood)
Sistem ini tidak hanya indah secara visual, tetapi juga sangat kuat dan optimal dari sisi *engineering*:

1. **Frontend:** React-based architecture via Vite SPA, memastikan navigasi antar menu (*routing*) secepat kilat tanpa reload.
2. **Atomic UI Updates:** Rendering yang dioptimalkan untuk mencegah *UI flickering* saat melakukan pencarian stok (*search filter*) dengan performa 60fps.
3. **Backend & Database:** Node.js Express + Prisma ORM. Menjamin konsistensi data transaksi jutaan *records*.
4. **Barcode Engine:** Terintegrasi dengan algoritma *dynamic barcode generator* dan modul cetak label (*batch printing*).

> [!IMPORTANT]
> **Kesimpulan:** Aplikasi JIT PMC adalah tonggak transformasi digital pabrik. Menggantikan proses manual dengan otomatisasi *end-to-end* (Gudang ➡️ Transit ➡️ Produksi), meminimalisir *human error*, mempercepat distribusi material, dan menjadikan operasional 100% *paperless* dan *real-time*.
