@echo off
echo Starting BDS PRO Servers...
echo.

echo Killing any existing Node processes...
taskkill /f /im node.exe >nul 2>&1

echo.
echo Starting Backend Server on port 5001...
start "Backend Server" cmd /k "cd /d C:\Users\mahima joshi\Downloads\Final\Final\backend && set PORT=5001 && node server.js"

echo.
echo Waiting 3 seconds for backend to start...
timeout /t 3 /nobreak >nul

echo.
echo Starting Frontend Server on port 3000...
start "Frontend Server" cmd /k "cd /d C:\Users\mahima joshi\Downloads\Final\Final && npm run dev"

echo.
echo Both servers are starting...
echo Backend: http://localhost:5001
echo Frontend: http://localhost:3000
echo.
echo Press any key to exit...
pause >nul