@echo off
echo Testing BDS PRO Authentication System
echo =====================================
echo.

echo Testing Backend API...
curl -X GET http://localhost:5000/health
echo.
echo.

echo Testing User Registration...
curl -X POST http://localhost:5000/api/auth/register ^
  -H "Content-Type: application/json" ^
  -d "{\"name\":\"Test User\",\"email\":\"test@example.com\",\"password\":\"password123\",\"confirmPassword\":\"password123\"}"
echo.
echo.

echo Testing User Login...
curl -X POST http://localhost:5000/api/auth/login ^
  -H "Content-Type: application/json" ^
  -d "{\"email\":\"test@example.com\",\"password\":\"password123\"}"
echo.
echo.

echo Test completed!
pause
