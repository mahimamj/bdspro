@echo off
echo Starting BDS PRO Project...
echo.

echo Starting Backend Server...
cd backend
start "BDS PRO Backend" cmd /k "node server.js"
cd ..

echo.
echo Starting Frontend Server...
start "BDS PRO Frontend" cmd /k "npm run dev"

echo.
echo Both servers are starting...
echo Backend: http://localhost:5000
echo Frontend: http://localhost:3000
echo.
echo Press any key to exit...
pause
