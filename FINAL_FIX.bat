@echo off
echo ========================================
echo   FINAL FIX - Complete Server Restart
echo ========================================
echo.

echo Step 1: Killing ALL Python processes...
taskkill /F /IM python.exe /T >nul 2>&1
taskkill /F /IM pythonw.exe /T >nul 2>&1

echo Step 2: Waiting 5 seconds...
timeout /t 5 /nobreak >nul

echo Step 3: Verifying port 5000 is free...
netstat -ano | findstr :5000 | findstr LISTENING >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo WARNING: Port still in use, killing processes...
    for /f "tokens=5" %%a in ('netstat -ano ^| findstr :5000 ^| findstr LISTENING') do (
        taskkill /F /PID %%a >nul 2>&1
    )
    timeout /t 3 /nobreak >nul
)

echo.
echo ========================================
echo   Starting Server with DEBUG LOGGING
echo ========================================
echo.
echo IMPORTANT: You MUST see these logs when accessing pages:
echo   - REQUEST: / (root)
echo   - REQUEST: /setup.html
echo   - Static folder: E:\...
echo   - File exists: True
echo.
echo If you DON'T see REQUEST logs, the old code is still cached.
echo ========================================
echo.

cd /d "%~dp0backend"

echo Starting in 3 seconds...
timeout /t 3 /nobreak >nul

python api_server.py

pause
