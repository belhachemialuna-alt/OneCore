@echo off
echo ========================================
echo   Testing Device ID Generation
echo ========================================
echo.

cd /d "%~dp0backend\device"

echo Testing device identity module...
echo.
python -c "import identity; print('Device ID:', identity.get_device_id()); print('Registered:', identity.is_registered())"

echo.
echo ========================================
echo   Testing Local API
echo ========================================
echo.
echo Checking if port 5000 is available...
netstat -ano | findstr :5000

echo.
echo If you see output above, port 5000 is in use.
echo Otherwise, port 5000 is available.
echo.

pause
