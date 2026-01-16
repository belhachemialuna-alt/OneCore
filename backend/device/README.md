# Device Module - BAYYTI Smart Irrigation

## 🎯 Overview

This is the **core device module** for Raspberry Pi / Smart Box. It provides a modular, production-ready architecture for device identity, sensor reading, cloud communication, and system orchestration.

## 📁 Module Structure

```
device/
├── __init__.py          # Module initialization
├── identity.py          # Device ID & API key (SOURCE OF TRUTH)
├── local_api.py         # Local API server (port 5000)
├── sensors.py           # Sensor reading wrapper
├── sender.py            # Cloud data transmission
├── heartbeat.py         # Online status maintenance
├── main.py              # Main orchestrator
└── README.md            # This file
```

## 🔑 Critical Concepts

### 1. Device Identity (identity.py)

**This is the source of truth for device identification.**

- Generates **stable, unique device ID** based on hardware (MAC, system, machine)
- Device ID **never changes** after first generation
- Stores in `device_identity.json` at backend root
- Manages API key from VPS registration
- Tracks registration status

**Key Functions:**
```python
from device import identity

# Load device identity
device_id = identity.get_device_id()

# Check registration
is_registered = identity.is_registered()

# Get API key
api_key = identity.get_api_key()
```

### 2. Local API Server (local_api.py)

**Runs on port 5000 - Frontend bridge for device pairing.**

Exposes endpoints:
- `GET /device-id` - Get device ID for pairing
- `GET /device-status` - Get detailed device status
- `POST /device-register` - Update registration after VPS pairing
- `POST /device-unregister` - Reset registration
- `GET /health` - Health check

**Usage:**
```python
from device import local_api

# Start in background
local_api.start_local_api_background()

# Or run standalone
local_api.start_local_api()
```

### 3. Sensors (sensors.py)

**Unified sensor interface.**

Wraps existing `sensor_reader.py` or provides mock data for testing.

**Usage:**
```python
from device import sensors

# Read all sensors
data = sensors.read_all_sensors()
# Returns: {soil_moisture, temperature, humidity, water_flow, ...}

# Get sensor status
status = sensors.get_sensor_status()
```

### 4. Cloud Sender (sender.py)

**Sends data to VPS cloud.**

Handles:
- Sensor data transmission
- Irrigation event logging
- Alert notifications
- Device authentication

**Usage:**
```python
from device import sender

# Send sensor data
result = sender.send_sensor_data(sensor_data, vps_url="https://your-vps.com")

# Send irrigation event
result = sender.send_irrigation_event(event_data)

# Send alert
result = sender.send_alert(alert_data)
```

### 5. Heartbeat (heartbeat.py)

**Maintains online status with VPS.**

Sends periodic heartbeat (default: every 5 minutes) to indicate device is online.

**Usage:**
```python
from device import heartbeat

# Start heartbeat (300s = 5 minutes)
heartbeat.start_heartbeat(vps_url="https://your-vps.com", interval=300)

# Stop heartbeat
heartbeat.stop_heartbeat()

# Get status
status = heartbeat.get_heartbeat_status()
```

### 6. Main Orchestrator (main.py)

**Coordinates all device modules.**

Manages:
- Device identity initialization
- Local API server startup
- Sensor reading loop
- Cloud data synchronization
- Heartbeat maintenance

## 🚀 Quick Start

### Option 1: Run Complete Device System

```bash
cd backend/device
python main.py --vps-url https://your-vps.com --sensor-interval 60 --heartbeat-interval 300
```

This starts:
- ✅ Local API server on port 5000
- ✅ Sensor reading loop (every 60s)
- ✅ Cloud data sync (if registered)
- ✅ Heartbeat (every 300s)

### Option 2: Integrate into Existing System

```python
from device.main import DeviceOrchestrator

# Create orchestrator
orchestrator = DeviceOrchestrator(
    vps_url="https://your-vps.com",
    sensor_interval=60,
    heartbeat_interval=300
)

# Start all services
orchestrator.start_all()

# Get status
status = orchestrator.get_status()
```

### Option 3: Use Individual Modules

```python
# Just identity
from device import identity
device_id = identity.get_device_id()

# Just local API
from device import local_api
local_api.start_local_api_background()

# Just sensors
from device import sensors
data = sensors.read_all_sensors()

# Just sender
from device import sender
sender.send_sensor_data(data, vps_url="https://your-vps.com")
```

## 🔄 Device Lifecycle

### 1. First Boot (Unregistered)

```
Device boots → Identity generated → Local API starts → Device ID available
```

Device ID is displayed in frontend (hardware.html) for user to pair.

### 2. Pairing Process

```
User opens pairing UI → Fetches device ID from port 5000 → 
Registers with VPS → VPS returns API key → 
Local API updates identity → Device now registered
```

### 3. Normal Operation (Registered)

```
Sensors read every 60s → Data sent to VPS → 
Heartbeat sent every 5min → Device shows online in VPS
```

## 📊 Data Flow

```
┌─────────────────────────────────────────────────────┐
│                  DEVICE (Raspberry Pi)              │
│                                                     │
│  ┌──────────┐    ┌──────────┐    ┌──────────┐    │
│  │ Identity │───▶│  Sender  │───▶│   VPS    │    │
│  └──────────┘    └──────────┘    └──────────┘    │
│       │                                            │
│       ▼                                            │
│  ┌──────────┐    ┌──────────┐                    │
│  │ Sensors  │───▶│ Local API│◀───Frontend         │
│  └──────────┘    └──────────┘    (Port 5000)     │
│                        │                           │
│                        ▼                           │
│                  ┌──────────┐                     │
│                  │Heartbeat │                     │
│                  └──────────┘                     │
└─────────────────────────────────────────────────────┘
```

## 🔧 Configuration

### Environment Variables (Optional)

```bash
export VPS_URL="https://your-vps.com"
export SENSOR_INTERVAL=60
export HEARTBEAT_INTERVAL=300
```

### Device Identity File

Located at: `backend/device_identity.json`

```json
{
  "deviceId": "abc123...",
  "apiKey": "device-api-key",
  "registered": true,
  "deviceName": "Garden Irrigation",
  "ownerId": "user123",
  "createdAt": "2026-01-16T08:00:00Z",
  "updatedAt": "2026-01-16T09:00:00Z"
}
```

**⚠️ IMPORTANT:** Never delete this file in production. It contains the device's identity.

## 🧪 Testing

### Test Device Identity

```bash
cd backend/device
python -c "import identity; print(identity.get_device_id())"
```

### Test Local API

```bash
cd backend/device
python local_api.py
# Visit: http://localhost:5000/device-id
```

### Test Sensors

```bash
cd backend/device
python -c "import sensors; print(sensors.read_all_sensors())"
```

### Test Complete System

```bash
cd backend/device
python main.py --vps-url https://your-vps.com
```

## 🐛 Troubleshooting

### Device ID Not Showing in Frontend

**Problem:** Frontend shows "Not Available"

**Solutions:**
1. Check local API is running: `curl http://localhost:5000/health`
2. Verify port 5000 is not blocked
3. Check device identity file exists: `backend/device_identity.json`

### Device Not Registered

**Problem:** `identity.is_registered()` returns False

**Solutions:**
1. Complete pairing process in frontend
2. Check `device_identity.json` has `apiKey` and `registered: true`
3. Re-pair device if needed

### Cloud Sync Failing

**Problem:** Data not reaching VPS

**Solutions:**
1. Verify device is registered
2. Check VPS URL is correct
3. Test network connectivity to VPS
4. Check VPS API logs for errors

### Sensors Return Mock Data

**Problem:** Getting fake sensor readings

**Solutions:**
1. Check `sensor_reader.py` is available
2. Verify hardware connections
3. Check sensor initialization in logs

## 📝 API Reference

### Identity Module

- `load_identity()` - Load device identity
- `save_identity(identity)` - Save device identity
- `get_device_id()` - Get device ID
- `get_api_key()` - Get API key
- `is_registered()` - Check registration status
- `update_identity(**kwargs)` - Update identity fields
- `reset_identity()` - Reset identity (testing only)

### Local API Module

- `start_local_api(host, port, debug)` - Start server
- `start_local_api_background(host, port)` - Start in background

### Sensors Module

- `read_all_sensors()` - Read all sensors
- `get_sensor_status()` - Get sensor system status

### Sender Module

- `send_sensor_data(data, vps_url)` - Send sensor data
- `send_irrigation_event(event, vps_url)` - Send irrigation event
- `send_alert(alert, vps_url)` - Send alert

### Heartbeat Module

- `start_heartbeat(vps_url, interval)` - Start heartbeat
- `stop_heartbeat()` - Stop heartbeat
- `get_heartbeat_status()` - Get heartbeat status

## 🔒 Security Notes

1. **Device ID** - Public, used for identification
2. **API Key** - Secret, used for authentication
3. **Never expose API key** in logs or frontend
4. **HTTPS only** for VPS communication in production

## 📦 Dependencies

- `flask` - Local API server
- `flask-cors` - CORS support
- `requests` - HTTP client for VPS communication

Install:
```bash
pip install flask flask-cors requests
```

## 🎓 Best Practices

1. **Always check registration** before cloud operations
2. **Handle network errors** gracefully
3. **Log important events** for debugging
4. **Use background threads** for long-running tasks
5. **Never regenerate device ID** after first creation

## 📞 Support

For issues or questions about the device module, check:
- Device identity file: `backend/device_identity.json`
- Local API health: `http://localhost:5000/health`
- Module logs in console output

---

**Version:** 1.0.0  
**Last Updated:** January 2026
