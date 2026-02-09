@echo off
echo ========================================
echo   BAYYTI OneCore - Unified Server
echo ========================================
echo.
echo Starting all services on Port 5000:
echo - Main API Server
echo - Device ID Service (integrated)
echo - Dashboard
echo - All Endpoints
echo.
echo ========================================
echo.

cd /d "%~dp0backend"
python api_server.py

pause
