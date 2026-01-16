@echo off
echo ========================================
echo   Starting Device Service - Port 5000
echo ========================================
echo.
echo Device ID will be generated automatically
echo Dashboard: http://localhost:5000/hardware.html
echo Device Link: http://localhost:5000/device-link.html
echo.
echo Press Ctrl+C to stop
echo ========================================
echo.

cd /d "%~dp0backend\device"
python local_api.py

pause
