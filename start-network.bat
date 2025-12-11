@echo off
chcp 65001 >nul
echo ========================================
echo   DHL Shipping - Network Access Mode
echo ========================================
echo.

echo [1/2] Starting Backend Server...
start "Backend Server" cmd /k "cd backend && npm start"
timeout /t 3 /nobreak >nul

echo [2/2] Starting Frontend Server...
start "Frontend Server" cmd /k "cd frontend && npm run dev"
timeout /t 2 /nobreak >nul

echo.
echo ========================================
echo   Servers are starting...
echo ========================================
echo.
echo Check the console windows for IP addresses
echo Người khác có thể truy cập bằng địa chỉ Network IP
echo.
echo Press any key to exit this window...
echo (Servers will continue running in separate windows)
pause >nul

