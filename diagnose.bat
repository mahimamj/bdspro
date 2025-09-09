@echo off
echo BDS PRO Project Diagnostic Tool
echo ================================
echo.

echo Checking Node.js...
node --version
if %errorlevel% neq 0 (
    echo ERROR: Node.js not found!
    pause
    exit
)

echo.
echo Checking project structure...
if not exist "backend\package.json" (
    echo ERROR: Backend package.json not found!
    pause
    exit
)

if not exist "package.json" (
    echo ERROR: Frontend package.json not found!
    pause
    exit
)

echo.
echo Checking dependencies...
cd backend
if not exist "node_modules" (
    echo Installing backend dependencies...
    npm install
)

cd ..
if not exist "node_modules" (
    echo Installing frontend dependencies...
    npm install
)

echo.
echo Testing backend startup...
cd backend
echo Starting backend server (will run for 5 seconds)...
timeout 5 node server.js
echo Backend test complete.

echo.
echo Testing frontend startup...
cd ..
echo Starting frontend server (will run for 5 seconds)...
timeout 5 npm run dev
echo Frontend test complete.

echo.
echo Diagnostic complete!
echo If you see any errors above, please report them.
pause
