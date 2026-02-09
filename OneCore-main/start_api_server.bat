@echo off
title BAYYTI-B1 API Server
color 0A
echo.
echo ============================================================
echo  BAYYTI-B1 IoT Irrigation Controller - API Server Launcher
echo ============================================================
echo.

REM Change to the backend directory
cd /d "D:\Bayyti.com\OneCore v1.0.0\OneCore v1.0.0\backend"

REM Check if Python is available
python --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Python is not installed or not in PATH
    echo Please install Python 3.7+ and add it to your PATH
    pause
    exit /b 1
)

REM Check if api_server.py exists
if not exist "api_server.py" (
    echo ERROR: api_server.py not found in current directory
    echo Current directory: %CD%
    pause
    exit /b 1
)

echo Starting BAYYTI-B1 API Server...
echo.
echo Server will be available at:
echo   - Dashboard: http://localhost:5000/
echo   - API Keys:  http://localhost:5000/api-keys
echo   - Hardware:  http://localhost:5000/hardware.html
echo.
echo Press Ctrl+C to stop the server
echo.

REM Start the Python API server
python api_server.py

REM If the server stops, pause to show any error messages
echo.
echo Server stopped. Press any key to exit...
pause >nul
