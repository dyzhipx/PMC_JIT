@echo off
echo =======================================================
echo  Starting PMC Application
echo =======================================================

echo.
echo [1] Starting Backend Server (Port 3000)...
start "PMC Backend" cmd /c "cd server && npm run dev"

echo.
echo [2] Starting Frontend Server (Port 5137)...
start "PMC Frontend" cmd /c "npm run dev"

echo.
echo Servers have been started in separate windows.
echo.
echo Akses dari Komputer ini: 
echo   Frontend : http://localhost:5137/
echo   Backend  : http://localhost:3000/
echo.
echo =======================================================
echo CARA AKSES UNTUK ATASAN / HP / TABLET LAIN (WIFI SAMA):
echo Buka Browser (Chrome/Safari) dan ketik URL berikut:
echo =======================================================
echo.
echo   http://10.85.195.144:5137/
echo.
pause
