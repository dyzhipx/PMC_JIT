# PMC Frontend — Walkthrough

## Hasil Implementasi

Aplikasi **Packaging Material Calculator (PMC)** telah berhasil dibangun sebagai standalone SPA (Single Page Application) dengan dark theme premium. Semua 6 halaman berfungsi dengan baik.

> [!TIP]
> Buka melalui `http://localhost:8080/` atau buka langsung [index.html](file:///c:/Users/54321/Desktop/jit%202/index.html)

---

## Screenshots

````carousel
### 🏠 Dashboard Overview
Stat cards (Total SKU, BOM, Produksi, Pending) + Line chart tren produksi + Bar chart per shift + Tabel jadwal terbaru

![Dashboard page with stat cards, charts, and schedule table](C:/Users/54321/.gemini/antigravity/brain/e2ee8450-d6a3-4fdc-bb0b-1a30ab0d6605/screenshot_dashboard.png)
<!-- slide -->
### 🧾 Master BOM
Accordion per SKU, menampilkan komponen BOM dengan koefisien dan opsi pembulatan

![Master BOM with accordion UI showing component details](C:/Users/54321/.gemini/antigravity/brain/e2ee8450-d6a3-4fdc-bb0b-1a30ab0d6605/screenshot_master_bom.png)
<!-- slide -->
### 📋 Step 1: Schedule Import
Drag-drop Excel upload + manual input form + mapping table preview

![Schedule Import page with drag-drop and manual input](C:/Users/54321/.gemini/antigravity/brain/e2ee8450-d6a3-4fdc-bb0b-1a30ab0d6605/screenshot_schedule.png)
<!-- slide -->
### 📊 Step 2: Shift Summary
Shift cards (SH1/SH2/SH3) + aggregated summary table + Export Excel

![Shift Summary with cards and aggregation table](C:/Users/54321/.gemini/antigravity/brain/e2ee8450-d6a3-4fdc-bb0b-1a30ab0d6605/screenshot_shift_summary.png)
<!-- slide -->
### 🏭 Step 3: Material Calc
Warehouse Picklist (grouped) + per-SKU accordion + view toggle

![Material Requirement page with grouped picklist](C:/Users/54321/.gemini/antigravity/brain/e2ee8450-d6a3-4fdc-bb0b-1a30ab0d6605/screenshot_material_calc.png)
````

## Browser Recording

![Full navigation test across all 6 pages](C:/Users/54321/.gemini/antigravity/brain/e2ee8450-d6a3-4fdc-bb0b-1a30ab0d6605/pmc_full_test_1773349753757.webp)

---

## File Structure

| Folder | File | Purpose |
|---|---|---|
| `/` | `index.html` | Root HTML with CDN scripts |
| `src/styles/` | `index.css` | Design tokens, reset, animations |
| | `layout.css` | Sidebar, topbar, responsive |
| | `components.css` | Buttons, cards, tables, modals |
| | `pages.css` | Page-specific styles |
| `src/` | `store.js` | State, demo data, calculation engine |
| | `router.js` | Hash-based SPA router |
| | `main.js` | App entry point |
| `src/components/` | 9 files | Sidebar, topbar, stat-card, data-table, modal, drag-drop, pagination, toast, chart-wrapper |
| `src/pages/` | 6 files | Dashboard, master-sku, master-bom, schedule-import, shift-summary, material-calc |

## Fitur Terverifikasi

- ✅ Dark theme premium dengan design tokens
- ✅ Sidebar collapsible dengan navigasi submenu
- ✅ Dashboard dengan Chart.js (line + bar chart)
- ✅ Master SKU CRUD (tambah, edit, hapus) + UOM conversion
- ✅ Master BOM accordion dengan rounding config
- ✅ Schedule Import: drag-drop Excel + manual input + validasi
- ✅ Shift Summary: auto-aggregation + export Excel
- ✅ Material Calc: grouped picklist + per-SKU detail + mark done
- ✅ Toast notifications dan modal dialogs
- ✅ Animasi (fade, slide-up, count-up, hover effects)
- ✅ Responsive breakpoints (full/collapsed/mobile drawer)
