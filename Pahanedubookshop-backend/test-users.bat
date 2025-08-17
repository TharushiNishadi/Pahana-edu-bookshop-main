@echo off
echo ========================================
echo Testing Users Endpoint
echo ========================================
echo.

echo Waiting for server to start...
timeout /t 5 /nobreak >nul

echo.
echo Testing GET /users endpoint...
curl -X GET http://localhost:8080/users

echo.
echo.
echo Testing POST /users endpoint...
curl -X POST http://localhost:8080/users ^
  -H "Content-Type: application/json" ^
  -d "{\"username\":\"testuser\",\"email\":\"test@example.com\",\"password\":\"password123\"}"

echo.
echo.
echo Test completed!
pause
