@echo off
echo ========================================
echo   LAPTOP DEVICE TEST - Port 5000
echo ========================================
echo.
echo This will start your laptop as a test device
echo Device ID will be generated and available at:
echo http://localhost:5000/device-id
echo.
echo Dashboard will show Device ID at:
echo http://localhost:5000/hardware.html
echo.
echo Press Ctrl+C to stop
echo ========================================
echo.

cd /d "%~dp0backend\device"

echo Starting device service...
python main.py --env cloud

pause
