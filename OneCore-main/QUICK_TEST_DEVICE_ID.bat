@echo off
echo ========================================
echo   Quick Device ID Test
echo ========================================
echo.

cd /d "%~dp0backend\device"

echo Generating Device ID...
echo.
python -c "import identity; print('Device ID:', identity.get_device_id()); print('Registered:', identity.is_registered())"

echo.
echo ========================================
echo Device identity file location:
echo %~dp0backend\device_identity.json
echo.

if exist "%~dp0backend\device_identity.json" (
    echo File exists! Contents:
    type "%~dp0backend\device_identity.json"
) else (
    echo File does not exist yet - will be created when service starts
)

echo.
echo ========================================
pause
