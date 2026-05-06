@echo off
set /p SUBDOMAIN="Masukkan nama unik untuk URL (contoh: pmc-sja): "

echo [1/4] Menyiapkan Konfigurasi Online...
echo VITE_API_BASE_URL=https://%SUBDOMAIN%-api.loca.lt > .env

echo [2/4] Menjalankan Backend ^& API Tunnel...
start "PMC-BACKEND" cmd /c "cd server && npm run dev"
start "TUNNEL-API" cmd /c "npx localtunnel --port 3000 --subdomain %SUBDOMAIN%-api"

echo [3/4] Menjalankan Frontend...
start "PMC-FRONTEND" cmd /c "npm run dev"

echo [4/4] Menjalankan App Tunnel...
start "TUNNEL-APP" cmd /c "npx localtunnel --port 5137 --subdomain %SUBDOMAIN%"

echo.
echo ========================================================
echo BERHASIL! 
echo ========================================================
echo URL UNTUK ATASAN: https://%SUBDOMAIN%.loca.lt
echo ========================================================
echo.
echo Catatan:
echo 1. Pastikan internet stabil.
echo 2. Jangan tutup jendela terminal yang baru terbuka.
echo 3. Jika diminta "Click to Continue" di browser, klik saja.
echo.
pause
