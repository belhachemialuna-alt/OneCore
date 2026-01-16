@echo off
echo ========================================
echo   Starting ALL Services - Auto Mode
echo ========================================
echo.
echo This will start:
echo - Main API Server (Port 8080)
echo - Device Service (Port 5000) - AUTO
echo - Frontend Dashboard
echo.
echo ========================================
echo.
echo Main Dashboard: http://localhost:8080/
echo Device Link: http://localhost:5000/device-link.html
echo Hardware: http://localhost:5000/hardware.html
echo.
echo Press Ctrl+C to stop all services
echo ========================================
echo.

cd /d "%~dp0backend"
python api_server.py

pause
