@echo off
echo Starting BDS PRO Investment and Referral System...
echo.

echo Starting Backend Server...
cd "C:\Users\mahima joshi\Downloads\Final\Final\backend"
start "Backend Server" cmd /k "node server.js"

echo Waiting for backend to start...
timeout /t 5 /nobreak > nul

echo Starting Frontend Server...
cd "C:\Users\mahima joshi\Downloads\Final\Final"
start "Frontend Server" cmd /k "npm run dev"

echo.
echo Both servers are starting...
echo Backend: http://localhost:5000
echo Frontend: http://localhost:3000
echo Referral System: http://localhost:3000/referral
echo.
echo Press any key to exit...
pause > nul
