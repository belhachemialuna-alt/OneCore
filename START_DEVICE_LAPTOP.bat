@echo off
echo ========================================
echo   Starting Device Service on Laptop
echo ========================================
echo.
echo This will:
echo 1. Generate a unique Device ID for your laptop
echo 2. Start local API on port 5000
echo 3. Make Device ID available to dashboard
echo.
echo Press Ctrl+C to stop the service
echo ========================================
echo.

cd /d "%~dp0backend\device"
python main.py --env cloud

pause
