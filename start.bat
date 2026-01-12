@echo off
echo =========================================
echo   BAYYTI Smart Irrigation System v1.0
echo =========================================
echo.

cd backend

echo Initializing database...
python database.py

echo.
echo Starting API Server...
echo Dashboard will be available at: http://localhost:5000
echo.
echo Press Ctrl+C to stop
echo.

python api_server.py
