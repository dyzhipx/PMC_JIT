@echo off
title PMC JIT - Ngrok Online System
echo ========================================================
echo   MENYIAPKAN SISTEM ONLINE PMC JIT (VIA NGROK)
echo ========================================================
echo.

echo [1/3] Menjalankan Backend Server (Port 3000)...
start "PMC-BACKEND" cmd /c "cd server && npm run dev"

echo [2/3] Menjalankan Frontend App (Port 5137)...
start "PMC-FRONTEND" cmd /c "npm run dev"

echo.
echo Menunggu servis siap... (5 detik)
timeout /t 5 /nobreak > nul

echo [3/3] Menjalankan Ngrok Tunnel (Port 5137)...
echo.
echo --------------------------------------------------------
echo PETUNJUK:
echo 1. Salin URL "Forwarding" (https://....ngrok-free.app)
echo 2. Bagikan URL tersebut ke Atasan/Tim.
echo 3. JANGAN TUTUP jendela terminal ini atau terminal lainnya.
echo --------------------------------------------------------
echo.

ngrok http 5137

pause
