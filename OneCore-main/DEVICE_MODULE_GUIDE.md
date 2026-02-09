# Device Module Implementation Guide

## 🎯 Architecture Overview

The device module follows a **modular, production-ready architecture** where each component has a single responsibility:

```
┌─────────────────────────────────────────────────────────┐
│                    DEVICE SYSTEM                        │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌──────────────┐  ┌──────────────┐  ┌─────────────┐ │
│  │  identity.py │  │ local_api.py │  │ sensors.py  │ │
│  │              │  │              │  │             │ │
│  │ Device ID    │  │ Port 5000    │  │ Read HW     │ │
│  │ API Key      │  │ Frontend     │  │ Mock Data   │ │
│  │ Registration │  │ Bridge       │  │             │ │
│  └──────────────┘  └──────────────┘  └─────────────┘ │
│                                                         │
│  ┌──────────────┐  ┌──────────────┐  ┌─────────────┐ │
│  │  sender.py   │  │ heartbeat.py │  │   main.py   │ │
│  │              │  │              │  │             │ │
│  │ Cloud Sync   │  │ Online       │  │ Orchestrate │ │
│  │ VPS API      │  │ Status       │  │ All Modules │ │
│  │ Auth         │  │ 5min Loop    │  │             │ │
│  └──────────────┘  └──────────────┘  └─────────────┘ │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

## 📂 File Structure

```
backend/
├── device/                      # NEW: Device module
│   ├── __init__.py             # Module initialization
│   ├── identity.py             # Device ID & API key (SOURCE OF TRUTH)
│   ├── local_api.py            # Local API server (port 5000)
│   ├── sensors.py              # Sensor reading wrapper
│   ├── sender.py               # Cloud data transmission
│   ├── heartbeat.py            # Online status maintenance
│   ├── main.py                 # Main orchestrator
│   └── README.md               # Module documentation
│
├── device_identity.json        # Device identity file (auto-generated)
├── start_device.py             # Device startup script
│
├── sensor_reader.py            # Existing sensor hardware interface
├── api_server.py               # Existing Flask API server
└── ... (other existing files)
```

## 🔑 Key Concepts

### 1. Device Identity (Source of Truth)

**File:** `device/identity.py`

The device ID is generated **once** and **never changes**:

```python
# Generate stable device ID from hardware
def generate_device_id():
    mac = uuid.getnode()              # MAC address
    system = platform.system()        # OS (Linux)
    machine = platform.machine()      # Architecture (armv7l)
    
    raw = f"{mac}{system}{machine}"
    return hashlib.sha256(raw.encode()).hexdigest()
```

**Stored in:** `backend/device_identity.json`

```json
{
  "deviceId": "a1b2c3d4e5f6...",
  "apiKey": null,
  "registered": false,
  "deviceName": null,
  "ownerId": null,
  "createdAt": "2026-01-16T08:00:00Z",
  "updatedAt": null
}
```

### 2. Local API Server (Frontend Bridge)

**File:** `device/local_api.py`  
**Port:** 5000 (CRITICAL - Frontend expects this port)

Provides endpoints for frontend to interact with device:

- `GET /device-id` - Get device ID for pairing
- `POST /device-register` - Update after VPS registration
- `GET /health` - Health check

### 3. Modular Design

Each module can be used **independently** or **together**:

```python
# Use just identity
from device import identity
device_id = identity.get_device_id()

# Use just sensors
from device import sensors
data = sensors.read_all_sensors()

# Use complete system
from device.main import DeviceOrchestrator
orchestrator = DeviceOrchestrator()
orchestrator.start_all()
```

## 🚀 Usage Examples

### Example 1: Start Complete Device System

```bash
# Start all device services
python backend/start_device.py --vps-url https://your-vps.com

# Or with custom intervals
python backend/start_device.py \
    --vps-url https://your-vps.com \
    --sensor-interval 60 \
    --heartbeat-interval 300
```

This starts:
- ✅ Local API on port 5000
- ✅ Sensor reading loop
- ✅ Cloud data sync
- ✅ Heartbeat

### Example 2: Integrate with Existing API Server

```python
# In api_server.py or main_controller.py

from device import local_api, identity, sensors, sender, heartbeat

# Start local API in background
local_api.start_local_api_background()

# Get device info
device_id = identity.get_device_id()
is_registered = identity.is_registered()

# Read sensors
sensor_data = sensors.read_all_sensors()

# Send to cloud if registered
if is_registered:
    sender.send_sensor_data(sensor_data, vps_url="https://your-vps.com")

# Start heartbeat
heartbeat.start_heartbeat(vps_url="https://your-vps.com", interval=300)
```

### Example 3: Use in Existing Sensor Loop

```python
# In your existing sensor reading code

from device import sensors, sender, identity

# Replace direct sensor reading
# OLD: data = sensor_reader.read_all_sensors()
# NEW:
data = sensors.read_all_sensors()

# Send to cloud if registered
if identity.is_registered():
    result = sender.send_sensor_data(data, vps_url="https://your-vps.com")
    if result.get('success'):
        print("Data synced to cloud")
```

## 🔄 Device Lifecycle

### Phase 1: First Boot (Unregistered)

```
1. Device boots
2. identity.py generates device ID
3. Saved to device_identity.json
4. local_api.py starts on port 5000
5. Device ID available at http://localhost:5000/device-id
```

**Status:** `registered: false`, `apiKey: null`

### Phase 2: Pairing

```
1. User opens hardware.html
2. Frontend fetches device ID from port 5000
3. User opens device-pairing.html
4. User provides VPS credentials
5. Frontend registers device with VPS
6. VPS returns API key
7. Frontend calls /device-register with API key
8. identity.py updates device_identity.json
```

**Status:** `registered: true`, `apiKey: "xxx"`

### Phase 3: Normal Operation

```
1. Sensors read every 60s
2. Data sent to VPS via sender.py
3. Heartbeat sent every 5min via heartbeat.py
4. Device shows online in VPS dashboard
```

## 📊 Data Flow Diagram

```
┌─────────────────────────────────────────────────────────┐
│                  FRONTEND (Browser)                     │
│                                                         │
│  hardware.html ──────────────────▶ Port 5000           │
│  device-pairing.html ─────────────▶ Port 5000          │
│                                                         │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│              DEVICE (Raspberry Pi)                      │
│                                                         │
│  ┌─────────────────────────────────────────────────┐  │
│  │ local_api.py (Port 5000)                        │  │
│  │ - GET /device-id                                │  │
│  │ - POST /device-register                         │  │
│  └─────────────────┬───────────────────────────────┘  │
│                    │                                   │
│                    ▼                                   │
│  ┌─────────────────────────────────────────────────┐  │
│  │ identity.py                                     │  │
│  │ - Device ID: abc123...                          │  │
│  │ - API Key: (from VPS)                           │  │
│  │ - Registered: true/false                        │  │
│  └─────────────────┬───────────────────────────────┘  │
│                    │                                   │
│         ┌──────────┴──────────┐                       │
│         ▼                     ▼                       │
│  ┌─────────────┐      ┌─────────────┐               │
│  │ sensors.py  │      │ sender.py   │               │
│  │ Read HW     │      │ Send to VPS │               │
│  └─────────────┘      └──────┬──────┘               │
│                              │                        │
│                              ▼                        │
│                       ┌─────────────┐                │
│                       │heartbeat.py │                │
│                       │ 5min loop   │                │
│                       └─────────────┘                │
│                                                       │
└───────────────────────────┬───────────────────────────┘
                            │ HTTPS
                            ▼
┌─────────────────────────────────────────────────────────┐
│                    VPS CLOUD                            │
│                                                         │
│  /api/device/register ◀── Device registration          │
│  /api/device/data ◀────── Sensor data                  │
│  /api/device/heartbeat ◀─ Online status                │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

## 🔧 Integration Steps

### Step 1: Test Device Module Standalone

```bash
# Test identity
cd backend/device
python -c "import identity; print(identity.get_device_id())"

# Test local API
python local_api.py
# Visit: http://localhost:5000/device-id

# Test complete system
python main.py --vps-url https://your-vps.com
```

### Step 2: Integrate with Existing Backend

```python
# In your main application (e.g., api_server.py)

from device import local_api, identity

# Start local API in background (for frontend pairing)
local_api.start_local_api_background()

# Get device info
print(f"Device ID: {identity.get_device_id()}")
print(f"Registered: {identity.is_registered()}")
```

### Step 3: Update Frontend

Frontend already updated to use port 5000:
- `hardware.html` - Shows device ID with copy button
- `device-pairing.html` - Pairing interface

### Step 4: Test Pairing

1. Start device system: `python start_device.py`
2. Open: `http://localhost:5000/hardware.html`
3. See device ID displayed
4. Open: `http://localhost:5000/device-pairing.html`
5. Complete pairing process

## 🐛 Troubleshooting

### Issue: Port 5000 Already in Use

**Solution:**
```bash
# Find process using port 5000
lsof -i :5000

# Kill process
kill -9 <PID>

# Or use different port
python device/local_api.py --port 5001
```

### Issue: Device ID Not Showing

**Check:**
1. Local API running: `curl http://localhost:5000/health`
2. Device identity file exists: `ls backend/device_identity.json`
3. Frontend using correct port (5000, not 5001)

### Issue: Import Errors

**Solution:**
```bash
# Make sure you're in backend directory
cd backend

# Or add to PYTHONPATH
export PYTHONPATH="${PYTHONPATH}:$(pwd)"
```

## 📝 Migration from Old System

### Old System (device_identity.py, device_pairing_server.py)

```python
# OLD - Scattered files
from device_identity import get_device_identity
from device_pairing_server import start_pairing_server_background
from vps_cloud_client import VPSCloudClient
```

### New System (device/ module)

```python
# NEW - Organized module
from device import identity, local_api, sender

device_id = identity.get_device_id()
local_api.start_local_api_background()
sender.send_sensor_data(data)
```

**Benefits:**
- ✅ Better organization
- ✅ Single responsibility per module
- ✅ Easier to test
- ✅ Cleaner imports
- ✅ Production-ready structure

## 🎓 Best Practices

1. **Always start local API** for frontend access
2. **Check registration** before cloud operations
3. **Handle network errors** gracefully
4. **Use background threads** for long-running tasks
5. **Never regenerate device ID** in production
6. **Log important events** for debugging

## 📞 Support

**Device Module Location:** `backend/device/`

**Key Files:**
- Identity: `backend/device_identity.json`
- Local API: Port 5000
- Logs: Console output

**Quick Checks:**
```bash
# Check device ID
python -c "from device import identity; print(identity.get_device_id())"

# Check local API
curl http://localhost:5000/health

# Check registration
python -c "from device import identity; print(identity.is_registered())"
```

---

**Version:** 1.0.0  
**Architecture:** Modular Device System  
**Last Updated:** January 2026
