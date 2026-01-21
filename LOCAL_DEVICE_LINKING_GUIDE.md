# Local Device Linking Guide - OneCore v1.0.0
## Complete Setup for Standalone Operation Without Cloud Dependencies

This guide provides step-by-step instructions to configure your OneCore device for local operation and successful linking with the CloudIelivate dashboard without requiring external cloud services.

## 📋 Overview

Based on your backend structure, here's what needs to be updated to make device linking work locally:

### Current Issues:
- Device shows "Registered: False" 
- Backend tries to connect to cloud services
- Missing local API endpoints configuration
- Authentication mismatch between frontend (Supabase) and backend (local)

## 🔧 Required Updates

### 1. Backend Configuration Updates

#### A. Update `config.py`
```python
import os

# Device Configuration
DEVICE_NAME = "BAYYTI-B1"
API_VERSION = "1.0.0"

# Local Operation Mode
LOCAL_MODE = True
CLOUD_INTEGRATION_ENABLED = False

# Local Dashboard Configuration
LOCAL_DASHBOARD_URL = "http://localhost:3000"
LOCAL_API_ENDPOINT = "http://localhost:3000/api/devices"

# Device Registration
DEVICE_REGISTRATION_ENDPOINT = f"{LOCAL_DASHBOARD_URL}/api/devices/manual-link"
DEVICE_DATA_ENDPOINT = f"{LOCAL_DASHBOARD_URL}/api/devices/data"

# Authentication
API_KEY_HEADER = "X-Device-API-Key"
DEFAULT_API_KEY = "local_device_key_12345"

# Sensor Configuration
SENSOR_READ_INTERVAL = 60
SOIL_MOISTURE_THRESHOLD = 30
MAX_IRRIGATION_DURATION = 1800

# GPIO Configuration
ENABLE_GPIO = os.environ.get('ENABLE_GPIO', 'false').lower() == 'true'
VALVE_GPIO_PIN = 17
RELAY_GPIO_PIN = 27
FLOW_SENSOR_PIN = 22
LEAK_SENSOR_PIN = 23

# Local Database
LOCAL_DB_PATH = "irrigation.db"
ENABLE_LOCAL_STORAGE = True

# Network Configuration
DEVICE_SERVER_HOST = "0.0.0.0"
DEVICE_SERVER_PORT = 5000
PAIRING_SERVER_PORT = 5001
```

#### B. Create `local_registration.py`
```python
"""
Local Device Registration Module
Handles device registration with local CloudIelivate dashboard
"""

import requests
import json
import time
from device_identity import get_device_identity, update_device_identity
from config import LOCAL_DASHBOARD_URL, DEVICE_REGISTRATION_ENDPOINT

class LocalDeviceRegistration:
    def __init__(self):
        self.dashboard_url = LOCAL_DASHBOARD_URL
        self.registration_endpoint = DEVICE_REGISTRATION_ENDPOINT
        
    def register_with_dashboard(self, user_token=None):
        """
        Register device with local CloudIelivate dashboard
        
        Args:
            user_token (str): User authentication token (optional for local mode)
        
        Returns:
            dict: Registration result
        """
        identity = get_device_identity()
        device_id = identity["deviceId"]
        
        registration_data = {
            "deviceId": device_id,
            "name": f"BAYYTI-B1-{device_id[:8]}",
            "location": "Local Network",
            "firmwareVersion": "1.0.0",
            "deviceType": "irrigation_controller"
        }
        
        headers = {
            "Content-Type": "application/json"
        }
        
        # Add user token if provided
        if user_token:
            headers["Authorization"] = f"Bearer {user_token}"
        
        try:
            print(f"🔗 Registering device {device_id} with local dashboard...")
            
            response = requests.post(
                self.registration_endpoint,
                json=registration_data,
                headers=headers,
                timeout=10
            )
            
            if response.status_code == 200:
                result = response.json()
                
                if result.get("success"):
                    # Update local device identity
                    api_key = result.get("apiKey")
                    if api_key:
                        update_device_identity(
                            api_key=api_key,
                            registered=True,
                            device_name=registration_data["name"]
                        )
                    
                    print(f"✅ Device registered successfully!")
                    print(f"📋 Device ID: {device_id}")
                    print(f"🔑 API Key: {api_key[:20]}..." if api_key else "🔑 API Key: Not provided")
                    
                    return {
                        "success": True,
                        "deviceId": device_id,
                        "apiKey": api_key,
                        "message": "Device registered with local dashboard"
                    }
                else:
                    print(f"❌ Registration failed: {result.get('error', 'Unknown error')}")
                    return {"success": False, "error": result.get("error")}
            
            else:
                print(f"❌ Registration failed: HTTP {response.status_code}")
                print(f"Response: {response.text}")
                return {
                    "success": False, 
                    "error": f"HTTP {response.status_code}: {response.text}"
                }
                
        except requests.exceptions.ConnectionError:
            print(f"❌ Cannot connect to dashboard at {self.dashboard_url}")
            print("💡 Make sure CloudIelivate dashboard is running on localhost:3000")
            return {
                "success": False,
                "error": "Dashboard not accessible. Is it running on localhost:3000?"
            }
        except Exception as e:
            print(f"❌ Registration error: {e}")
            return {"success": False, "error": str(e)}
    
    def check_registration_status(self):
        """
        Check if device is properly registered
        
        Returns:
            dict: Registration status
        """
        identity = get_device_identity()
        
        return {
            "deviceId": identity["deviceId"],
            "registered": identity.get("registered", False),
            "hasApiKey": identity.get("apiKey") is not None,
            "deviceName": identity.get("deviceName"),
            "lastUpdated": identity.get("updatedAt")
        }
    
    def test_connection(self):
        """
        Test connection to local dashboard
        
        Returns:
            bool: True if dashboard is accessible
        """
        try:
            response = requests.get(f"{self.dashboard_url}/api/health", timeout=5)
            return response.status_code == 200
        except:
            return False

def auto_register_device():
    """
    Automatically register device on startup if not already registered
    """
    registration = LocalDeviceRegistration()
    
    # Check current status
    status = registration.check_registration_status()
    
    if not status["registered"]:
        print("🔄 Device not registered. Attempting auto-registration...")
        
        # Test dashboard connection first
        if registration.test_connection():
            result = registration.register_with_dashboard()
            return result
        else:
            print("⚠️ Dashboard not accessible. Manual registration required.")
            return {"success": False, "error": "Dashboard not accessible"}
    else:
        print(f"✅ Device already registered: {status['deviceName']}")
        return {"success": True, "message": "Already registered"}

if __name__ == "__main__":
    # Test registration
    registration = LocalDeviceRegistration()
    result = registration.register_with_dashboard()
    print(json.dumps(result, indent=2))
```

#### C. Update `api_server.py` - Add Local Registration Endpoint
Add this to your existing `api_server.py`:

```python
# Add this import at the top
from local_registration import LocalDeviceRegistration

# Add this route after your existing routes
@app.route('/api/register-local', methods=['POST'])
def register_with_local_dashboard():
    """
    Register this device with the local CloudIelivate dashboard
    """
    try:
        registration = LocalDeviceRegistration()
        
        # Get user token from request if provided
        data = request.get_json() or {}
        user_token = data.get('userToken')
        
        result = registration.register_with_dashboard(user_token)
        
        if result["success"]:
            return jsonify(result), 200
        else:
            return jsonify(result), 400
            
    except Exception as e:
        return jsonify({
            "success": False,
            "error": f"Registration failed: {str(e)}"
        }), 500

@app.route('/api/registration-status', methods=['GET'])
def get_registration_status():
    """
    Get current device registration status
    """
    try:
        registration = LocalDeviceRegistration()
        status = registration.check_registration_status()
        return jsonify(status), 200
    except Exception as e:
        return jsonify({
            "error": f"Failed to get status: {str(e)}"
        }), 500
```

#### D. Create `start_local_mode.py`
```python
#!/usr/bin/env python3
"""
Local Mode Startup Script
Starts all services required for local operation
"""

import os
import sys
import time
import threading
from pathlib import Path

# Add backend directory to path
backend_dir = Path(__file__).parent
sys.path.insert(0, str(backend_dir))

from api_server import app
from device_pairing_server import start_pairing_server_background
from local_registration import auto_register_device
from device_identity import get_device_identity
from config import DEVICE_SERVER_PORT, PAIRING_SERVER_PORT

def print_banner():
    """Print startup banner"""
    print("=" * 60)
    print("🌱 OneCore v1.0.0 - Local Mode Startup")
    print("=" * 60)

def print_device_info():
    """Print device information"""
    identity = get_device_identity()
    print(f"🆔 Device ID: {identity['deviceId']}")
    print(f"📝 Registered: {identity.get('registered', False)}")
    print(f"🏷️  Device Name: {identity.get('deviceName', 'Not set')}")
    print("-" * 60)

def print_endpoints():
    """Print available endpoints"""
    print("📡 Available Endpoints:")
    print(f"   Main API Server:    http://localhost:{DEVICE_SERVER_PORT}/")
    print(f"   Device Dashboard:   http://localhost:{DEVICE_SERVER_PORT}/")
    print(f"   Device Pairing:     http://localhost:{PAIRING_SERVER_PORT}/")
    print(f"   Device ID:          http://localhost:{PAIRING_SERVER_PORT}/device-id")
    print(f"   Registration:       http://localhost:{DEVICE_SERVER_PORT}/api/register-local")
    print("-" * 60)

def start_services():
    """Start all required services"""
    print("🚀 Starting services...")
    
    # Start pairing server in background
    print(f"   Starting Device Pairing Server on port {PAIRING_SERVER_PORT}...")
    pairing_thread = start_pairing_server_background(port=PAIRING_SERVER_PORT)
    
    # Wait a moment for pairing server to start
    time.sleep(1)
    
    # Attempt auto-registration
    print("🔗 Attempting device registration...")
    registration_result = auto_register_device()
    
    if registration_result["success"]:
        print("✅ Device registration successful!")
    else:
        print(f"⚠️  Registration issue: {registration_result.get('error', 'Unknown')}")
        print("💡 You can manually register later via the dashboard")
    
    print("-" * 60)
    print("✅ All services started successfully!")
    print("💡 To register manually, visit: http://localhost:3000/link-device")
    print("🔧 Device API available at: http://localhost:5000/")
    print("=" * 60)
    
    # Start main API server (this will block)
    print(f"🌐 Starting Main API Server on port {DEVICE_SERVER_PORT}...")
    app.run(host="0.0.0.0", port=DEVICE_SERVER_PORT, debug=False)

def main():
    """Main startup function"""
    print_banner()
    print_device_info()
    print_endpoints()
    
    try:
        start_services()
    except KeyboardInterrupt:
        print("\n🛑 Shutting down services...")
        sys.exit(0)
    except Exception as e:
        print(f"❌ Startup error: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
```

#### E. Create `start_local.bat` (Windows)
```batch
@echo off
echo ========================================
echo OneCore v1.0.0 - Local Mode Startup
echo ========================================
echo.

REM Check if Python is available
python --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Python is not installed or not in PATH
    echo Please install Python 3.7+ and try again
    pause
    exit /b 1
)

REM Change to backend directory
cd /d "%~dp0"

REM Install requirements if needed
echo Installing/updating requirements...
pip install flask flask-cors requests sqlite3

echo.
echo Starting OneCore Local Mode...
echo.

REM Start local mode
python start_local_mode.py

pause
```

#### F. Create `start_local.sh` (Linux/Mac)
```bash
#!/bin/bash

echo "========================================"
echo "OneCore v1.0.0 - Local Mode Startup"
echo "========================================"
echo

# Check if Python is available
if ! command -v python3 &> /dev/null; then
    echo "ERROR: Python 3 is not installed or not in PATH"
    echo "Please install Python 3.7+ and try again"
    exit 1
fi

# Change to backend directory
cd "$(dirname "$0")"

# Install requirements if needed
echo "Installing/updating requirements..."
pip3 install flask flask-cors requests

echo
echo "Starting OneCore Local Mode..."
echo

# Start local mode
python3 start_local_mode.py
```

### 2. Frontend Dashboard Updates

#### A. Update Device Registration API
The device registration API in your CloudIelivate dashboard needs to handle local devices properly. Make sure the `/api/devices/manual-link` endpoint accepts devices without user authentication for local mode.

#### B. Add Local Device Detection
Add this to your link-device page to detect local devices:

```typescript
// Add to your link-device page component
const detectLocalDevices = async () => {
  try {
    // Check for local device on port 5001
    const response = await fetch('http://localhost:5001/device-id');
    if (response.ok) {
      const deviceInfo = await response.json();
      setDetectedDevices([deviceInfo]);
      return deviceInfo;
    }
  } catch (error) {
    console.log('No local device detected on port 5001');
  }
  return null;
};
```

## 🚀 Step-by-Step Setup Instructions

### Step 1: Update Backend Files
1. **Replace `config.py`** with the updated version above
2. **Create `local_registration.py`** with the provided code
3. **Update `api_server.py`** to add the new registration endpoints
4. **Create `start_local_mode.py`** for easy startup
5. **Create startup scripts** (`start_local.bat` for Windows, `start_local.sh` for Linux/Mac)

### Step 2: Install Required Dependencies
```bash
# In your backend directory
pip install flask flask-cors requests
```

### Step 3: Start Local Mode
```bash
# Windows
start_local.bat

# Linux/Mac
chmod +x start_local.sh
./start_local.sh
```

### Step 4: Start CloudIelivate Dashboard
```bash
# In your CloudIelivate directory
npm run dev
```

### Step 5: Link Device
1. Open browser to `http://localhost:3000/link-device`
2. Your device should auto-detect or you can manually enter the Device ID
3. Device ID is available at: `http://localhost:5001/device-id`

## 🔍 Troubleshooting

### Device Shows "Registered: False"
1. **Check Dashboard Connection**: Ensure CloudIelivate is running on `localhost:3000`
2. **Verify API Endpoints**: Test `http://localhost:3000/api/devices/manual-link`
3. **Check Device Identity**: Visit `http://localhost:5001/device-status`
4. **Manual Registration**: Use the registration endpoint directly

### Connection Issues
1. **Firewall**: Ensure ports 5000 and 5001 are not blocked
2. **Port Conflicts**: Check if other services are using these ports
3. **Network**: Ensure localhost resolution works properly

### API Key Issues
1. **Check Generation**: API keys should be generated during registration
2. **Verify Storage**: Check `device_identity.json` file
3. **Test Authentication**: Use the API key in requests to dashboard

## 📝 Testing Commands

### Test Device Registration
```bash
# Check device status
curl http://localhost:5001/device-status

# Get device ID
curl http://localhost:5001/device-id

# Test registration
curl -X POST http://localhost:5000/api/register-local \
  -H "Content-Type: application/json" \
  -d '{}'
```

### Test Dashboard Connection
```bash
# Test dashboard health
curl http://localhost:3000/api/health

# Test device linking endpoint
curl -X POST http://localhost:3000/api/devices/manual-link \
  -H "Content-Type: application/json" \
  -d '{"deviceId": "your_device_id", "name": "Test Device"}'
```

## 🎯 Expected Results

After following this guide:
1. ✅ Device shows "Registered: True"
2. ✅ Device appears in CloudIelivate dashboard
3. ✅ Sensor data flows to dashboard
4. ✅ AI decisions are processed locally
5. ✅ No cloud dependencies required

## 📞 Support

If you encounter issues:
1. Check the console output for error messages
2. Verify all services are running on correct ports
3. Test each endpoint individually
4. Check `device_identity.json` for proper registration data

This setup creates a fully functional local system where your OneCore device can operate independently and link successfully with your CloudIelivate dashboard without any external cloud dependencies.
