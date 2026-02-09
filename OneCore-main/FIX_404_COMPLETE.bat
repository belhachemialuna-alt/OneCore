@echo off
echo ========================================
echo   COMPLETE FIX FOR 404 ERROR
echo ========================================
echo.
echo Step 1: Stopping all processes on port 5000...
echo.

REM Kill all Python processes on port 5000
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :5000 ^| findstr LISTENING') do (
    echo Killing PID %%a...
    taskkill /F /PID %%a >nul 2>&1
)

echo.
echo Waiting 3 seconds for processes to terminate...
timeout /t 3 /nobreak >nul

echo.
echo Step 2: Verifying port 5000 is free...
netstat -ano | findstr :5000 | findstr LISTENING >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo WARNING: Some processes still on port 5000
    echo Trying again...
    for /f "tokens=5" %%a in ('netstat -ano ^| findstr :5000 ^| findstr LISTENING') do (
        taskkill /F /PID %%a >nul 2>&1
    )
    timeout /t 2 /nobreak >nul
) else (
    echo SUCCESS: Port 5000 is free!
)

echo.
echo ========================================
echo   STARTING FRESH SERVER
echo ========================================
echo.
echo You should see:
echo   - STATIC FOLDER CONFIGURATION
echo   - Static folder path: E:\Bayyti.com\...
echo   - Files in static folder: XX files
echo.
echo If you DON'T see this, press Ctrl+C and run again.
echo ========================================
echo.

cd /d "%~dp0backend"
python api_server.py

pause
