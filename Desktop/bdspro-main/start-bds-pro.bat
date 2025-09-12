@echo off
echo ========================================
echo    BDS PRO Crypto Trading Platform
echo ========================================
echo.

echo Starting Backend Server...
cd /d "%~dp0Final\backend"
start "BDS PRO Backend" cmd /k "echo Backend Server Starting... && node server.js"
timeout /t 3 /nobreak >nul

echo.
echo Starting Frontend Server...
cd /d "%~dp0Final"
start "BDS PRO Frontend" cmd /k "echo Frontend Server Starting... && npm run dev"
timeout /t 3 /nobreak >nul

echo.
echo ========================================
echo    Servers are starting...
echo ========================================
echo Backend:  http://localhost:5000
echo Frontend: http://localhost:3000
echo.
echo Opening website in browser...
timeout /t 5 /nobreak >nul
start http://localhost:3000

echo.
echo Press any key to exit this window...
pause >nul
