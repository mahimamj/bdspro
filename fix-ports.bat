@echo off
echo Fixing Port Issues for BDS PRO
echo ================================
echo.

echo Killing processes on ports 3000 and 5000...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3000') do taskkill /f /pid %%a 2>nul
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :5000') do taskkill /f /pid %%a 2>nul

echo.
echo Ports cleared! Starting servers...
echo.

echo Starting Backend Server on port 5000...
cd /d "%~dp0Final\backend"
start "BDS PRO Backend" cmd /k "node server.js"

timeout /t 3 /nobreak >nul

echo Starting Frontend Server on port 3000...
cd /d "%~dp0Final"
start "BDS PRO Frontend" cmd /k "npm run dev"

timeout /t 5 /nobreak >nul

echo.
echo Opening website...
start http://localhost:3000

echo.
echo Done! Your BDS PRO platform should now be running on:
echo Backend:  http://localhost:5000
echo Frontend: http://localhost:3000
echo.
pause
