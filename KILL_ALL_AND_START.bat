@echo off
echo ========================================
echo   KILLING ALL PYTHON PROCESSES ON PORT 5000
echo ========================================
echo.

echo Killing process 21716...
taskkill /F /PID 21716 2>nul

echo Killing process 13740...
taskkill /F /PID 13740 2>nul

echo Killing process 22308...
taskkill /F /PID 22308 2>nul

echo.
echo Killing any other Python on port 5000...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :5000 ^| findstr LISTENING') do (
    echo Killing PID %%a
    taskkill /F /PID %%a 2>nul
)

timeout /t 3 /nobreak >nul

echo.
echo ========================================
echo   STARTING FRESH SERVER
echo ========================================
echo.

cd /d "%~dp0backend"
python api_server.py

pause
