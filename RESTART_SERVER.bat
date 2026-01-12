@echo off
echo ============================================
echo   BAYYTI-B1 Server Restart Script
echo ============================================
echo.
echo This will stop any running Python servers and start fresh
echo.

REM Kill any existing Python processes running api_server.py
taskkill /F /FI "WINDOWTITLE eq *api_server*" 2>nul
taskkill /F /FI "IMAGENAME eq python.exe" /FI "COMMANDLINE eq *api_server.py*" 2>nul

echo Waiting for processes to close...
timeout /t 2 /nobreak >nul

echo.
echo Starting BAYYTI-B1 API Server...
echo.
echo IMPORTANT: 
echo 1. The new dashboard is at: http://localhost:5000
echo 2. Clear your browser cache: Ctrl+Shift+Delete
echo 3. Or use incognito/private browsing mode
echo.
echo Dashboard will load automatically...
echo.

cd backend
python api_server.py

pause
