@echo off
setlocal enabledelayedexpansion

echo ========================================
echo OneCore PI Data Simulator v2.0
echo ========================================
echo.

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Python is not installed or not in PATH
    echo Please install Python 3.7+ and try again
    pause
    exit /b 1
)

REM Check if pip is available
python -m pip --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: pip is not available
    echo Please ensure pip is installed with Python
    pause
    exit /b 1
)

echo Installing/updating dependencies...
python -m pip install -r requirements.txt
if errorlevel 1 (
    echo ERROR: Failed to install dependencies
    pause
    exit /b 1
)

echo.
echo ========================================
echo Device Linking Options
echo ========================================
echo.
echo 1. Register New Device (First Time Setup)
echo 2. Check Registration Status
echo 3. Start Data Simulation
echo 4. Single Test Reading
echo 5. Start Device Server Only
echo 6. Exit
echo.

set /p choice="Select option (1-6): "

if "%choice%"=="1" goto register_device
if "%choice%"=="2" goto check_status
if "%choice%"=="3" goto start_simulation
if "%choice%"=="4" goto single_test
if "%choice%"=="5" goto device_server
if "%choice%"=="6" goto exit
goto invalid_choice

:register_device
echo.
echo ========================================
echo Device Registration Process
echo ========================================
echo.
echo Step 1: Starting device server...
start /B python device_server.py
timeout /t 3 /nobreak >nul

echo Step 2: Opening registration interface...
start device_registration.html

echo.
echo IMPORTANT: Complete these steps in your browser:
echo 1. Log in to OneCore dashboard at http://localhost:3000
echo 2. Complete device registration in the opened page
echo 3. Return here when registration is complete
echo.
pause
goto main_menu

:check_status
echo.
echo Checking device registration status...
echo.
python pi_data_simulator.py --check-registration
echo.
pause
goto main_menu

:start_simulation
echo.
echo ========================================
echo Starting Data Simulation
echo ========================================
echo.
echo 1. Localhost Only (Development)
echo 2. Remote PI Connection
echo 3. Custom Configuration
echo.
set /p sim_choice="Select simulation type (1-3): "

if "%sim_choice%"=="1" goto localhost_sim
if "%sim_choice%"=="2" goto remote_sim
if "%sim_choice%"=="3" goto custom_sim
goto start_simulation

:localhost_sim
echo.
echo Starting simulation with localhost endpoints...
echo Cloud Dashboard: http://localhost:3000
echo PI Server: http://localhost:5000
echo.
python pi_data_simulator.py --cloud http://localhost:3000 --pi-server http://localhost:5000
goto end

:remote_sim
echo.
set /p pi_ip="Enter PI IP address (e.g., 192.168.137.193): "
if "%pi_ip%"=="" (
    echo ERROR: IP address cannot be empty
    goto remote_sim
)
echo.
echo Starting simulation with remote PI...
echo Cloud Dashboard: http://localhost:3000
echo PI Server: http://%pi_ip%:5000
echo.
python pi_data_simulator.py --cloud http://localhost:3000 --pi-ip %pi_ip%
goto end

:custom_sim
echo.
echo Custom Configuration
echo.
set /p cloud_url="Cloud endpoint (default: http://localhost:3000): "
if "%cloud_url%"=="" set cloud_url=http://localhost:3000

set /p pi_url="PI server endpoint (default: http://localhost:5000): "
if "%pi_url%"=="" set pi_url=http://localhost:5000

set /p interval="Interval in seconds (default: 30): "
if "%interval%"=="" set interval=30

echo.
echo Starting simulation with custom configuration...
echo Cloud: %cloud_url%
echo PI Server: %pi_url%
echo Interval: %interval%s
echo.
python pi_data_simulator.py --cloud "%cloud_url%" --pi-server "%pi_url%" --interval %interval%
goto end

:single_test
echo.
echo Sending single test reading...
echo.
python pi_data_simulator.py --single
echo.
pause
goto main_menu

:device_server
echo.
echo Starting device server only...
echo Open device_registration.html to register devices
echo.
python device_server.py
goto end

:invalid_choice
echo.
echo Invalid choice. Please select 1-6.
echo.
goto main_menu

:main_menu
echo.
echo ========================================
echo Device Linking Options
echo ========================================
echo.
echo 1. Register New Device (First Time Setup)
echo 2. Check Registration Status
echo 3. Start Data Simulation
echo 4. Single Test Reading
echo 5. Start Device Server Only
echo 6. Exit
echo.

set /p choice="Select option (1-6): "

if "%choice%"=="1" goto register_device
if "%choice%"=="2" goto check_status
if "%choice%"=="3" goto start_simulation
if "%choice%"=="4" goto single_test
if "%choice%"=="5" goto device_server
if "%choice%"=="6" goto exit
goto invalid_choice

:exit
echo.
echo Exiting...
goto end

:end
echo.
echo ========================================
echo Session Complete
echo ========================================
echo.
pause
