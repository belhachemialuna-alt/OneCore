@echo off
echo ========================================
echo   FORCE RESTART - Kill and Restart Server
echo ========================================
echo.
echo Killing any Python processes on port 5000...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :5000') do taskkill /F /PID %%a 2>nul
timeout /t 2 /nobreak >nul

echo.
echo Starting server with FIXED code...
cd /d "%~dp0backend"
python api_server.py

pause
