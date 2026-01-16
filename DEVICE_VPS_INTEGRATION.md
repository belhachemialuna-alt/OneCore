# Device VPS Cloud Integration Guide

## 🌐 Architecture Overview

```
┌────────────────────┐
│  Physical Device   │
│  (Raspberry Pi)    │
│                    │
│ Python Agent       │
│ - Device ID        │
│ - API Key          │
│ - Sensors          │
└───────┬────────────┘
        │ HTTPS (JSON)
        ▼
┌────────────────────┐
│  VPS Cloud         │
│                    │
│ Next.js API        │
│ - Auth             │
│ - Device Linking   │
│ - Validation       │
└───────┬────────────┘
        │
        ▼
┌────────────────────┐
│  Parse Server      │
│                    │
│ - Users            │
│ - Devices          │
│ - Logs             │
│ - AI Inputs        │
└───────┬────────────┘
        │
        ▼
┌────────────────────┐
│ AI Decision Layer  │
│                    │
│ - Rules / ML       │
│ - Irrigation logic │
└────────────────────┘
```

## 📋 Table of Contents

1. [Device Setup](#device-setup)
2. [VPS Setup](#vps-setup)
3. [Device Pairing Process](#device-pairing-process)
4. [Data Flow](#data-flow)
5. [API Reference](#api-reference)
6. [Parse Server Schema](#parse-server-schema)
7. [Troubleshooting](#troubleshooting)

---

## 🔧 Device Setup

### 1. Install Required Dependencies

```bash
pip install requests flask flask-cors
```

### 2. Device Identity Module

The device identity is automatically generated and persists across reboots:

**File:** `backend/device_identity.py`

```python
from device_identity import get_device_identity, is_device_registered

# Get device identity (creates if doesn't exist)
identity = get_device_identity()
print(f"Device ID: {identity['deviceId']}")
print(f"Registered: {identity['registered']}")
```

**Key Features:**
- ✅ Stable device ID based on hardware (MAC address, system info)
- ✅ Persists across reboots
- ✅ Stored in `device_identity.json`
- ✅ No duplicates

### 3. Start Device Pairing Server

The pairing server runs on port 5001 and exposes device ID for pairing:

```bash
python backend/device_pairing_server.py
```

Or integrate into your main application:

```python
from device_pairing_server import start_pairing_server_background

# Start in background
start_pairing_server_background(host="0.0.0.0", port=5001)
```

### 4. VPS Cloud Client

Send data to VPS cloud:

```python
from vps_cloud_client import VPSCloudClient

# Initialize client
client = VPSCloudClient(vps_url="https://your-vps.com")

# Check if registered
if client.check_registration():
    # Send sensor data
    sensor_data = {
        "soil_moisture": 45.2,
        "temperature": 24.5,
        "humidity": 65.0,
        "water_flow": 0.0,
        "water_pressure": 2.5,
        "battery_voltage": 12.4,
        "solar_voltage": 18.2
    }
    
    result = client.send_sensor_data(sensor_data)
    print(result)
else:
    print("Device not registered. Please pair with VPS first.")
```

---

## ☁️ VPS Setup

### 1. Install Dependencies

```bash
cd vps-nextjs
npm install
```

**Required packages:**
- `next` - Next.js framework
- `parse` - Parse SDK
- `parse-server` - Parse Server
- `express` - Web server
- `@types/node` - TypeScript types

### 2. Configure Environment

Copy `.env.example` to `.env` and configure:

```bash
cp .env.example .env
```

**Edit `.env`:**
```env
PARSE_APP_ID=your_unique_app_id
PARSE_JS_KEY=your_javascript_key
PARSE_MASTER_KEY=your_secure_master_key
PARSE_SERVER_URL=http://localhost:1337/parse
DATABASE_URI=mongodb://localhost:27017/bayyti
```

### 3. Start Parse Server

```bash
npm run parse-server
```

Parse Server will run on port 1337.

### 4. Start Next.js API

```bash
npm run dev
```

Next.js will run on port 3000.

---

## 🔗 Device Pairing Process

### Step 1: User Opens Pairing Interface

Navigate to: `http://your-device-ip/device-pairing.html`

### Step 2: Detect Device

The interface automatically detects the device on the local network:

```javascript
// Fetches from local device pairing server
fetch('http://localhost:5001/device-id')
```

### Step 3: User Provides Credentials

User enters:
- **Device Name**: Friendly name (e.g., "Garden Irrigation")
- **VPS URL**: Cloud server URL (e.g., "https://your-vps.com")
- **Session Token**: User's authentication token from VPS

### Step 4: Register with VPS

```javascript
// Register device with VPS
fetch('https://your-vps.com/api/device/register', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-session-token': sessionToken
  },
  body: JSON.stringify({
    deviceId: deviceId,
    name: deviceName
  })
})
```

### Step 5: Update Local Device

VPS returns an API key, which is stored locally:

```javascript
// Update local device with API key
fetch('http://localhost:5001/device-register', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    apiKey: apiKey,
    deviceName: deviceName,
    ownerId: userId
  })
})
```

### Step 6: Pairing Complete ✅

Device is now registered and can communicate with VPS!

---

## 📊 Data Flow

### Sensor Data Submission

```python
from vps_cloud_client import VPSCloudClient

client = VPSCloudClient(vps_url="https://your-vps.com")

# Send sensor data every 60 seconds
sensor_data = {
    "soil_moisture": 45.2,
    "temperature": 24.5,
    "humidity": 65.0,
    "water_flow": 0.0,
    "water_pressure": 2.5,
    "battery_voltage": 12.4,
    "solar_voltage": 18.2
}

result = client.send_sensor_data(sensor_data)
```

**VPS Endpoint:** `POST /api/device/data`

### Irrigation Event Logging

```python
# Log irrigation event
event_data = {
    "zone_id": 1,
    "action": "start",
    "duration": 1800,
    "water_used": 150.5,
    "trigger": "scheduled"
}

result = client.send_irrigation_event(event_data)
```

**VPS Endpoint:** `POST /api/device/irrigation`

### Alert Submission

```python
# Send alert
alert_data = {
    "type": "leak",
    "severity": "critical",
    "message": "Water leak detected",
    "details": {"zone": 1}
}

result = client.send_alert(alert_data)
```

**VPS Endpoint:** `POST /api/device/alert`

### Heartbeat

```python
# Send heartbeat every 5 minutes
result = client.heartbeat()
```

**VPS Endpoint:** `POST /api/device/heartbeat`

---

## 🔌 API Reference

### Device Authentication

All device API requests require:

**Headers:**
```
Authorization: Device {apiKey}
X-Device-ID: {deviceId}
```

### Endpoints

#### 1. Register Device
- **Endpoint:** `POST /api/device/register`
- **Auth:** User session token
- **Body:**
  ```json
  {
    "deviceId": "abc123...",
    "name": "Garden Irrigation"
  }
  ```
- **Response:**
  ```json
  {
    "success": true,
    "device": {
      "id": "xyz789",
      "deviceId": "abc123...",
      "name": "Garden Irrigation",
      "apiKey": "device-api-key",
      "status": "offline"
    }
  }
  ```

#### 2. Submit Sensor Data
- **Endpoint:** `POST /api/device/data`
- **Auth:** Device API key
- **Body:**
  ```json
  {
    "deviceId": "abc123...",
    "timestamp": "2026-01-16T08:00:00Z",
    "sensors": {
      "soil_moisture": 45.2,
      "temperature": 24.5,
      "humidity": 65.0
    }
  }
  ```

#### 3. Log Irrigation Event
- **Endpoint:** `POST /api/device/irrigation`
- **Auth:** Device API key
- **Body:**
  ```json
  {
    "deviceId": "abc123...",
    "timestamp": "2026-01-16T08:00:00Z",
    "event": {
      "zone_id": 1,
      "action": "start",
      "duration": 1800
    }
  }
  ```

#### 4. Send Alert
- **Endpoint:** `POST /api/device/alert`
- **Auth:** Device API key
- **Body:**
  ```json
  {
    "deviceId": "abc123...",
    "timestamp": "2026-01-16T08:00:00Z",
    "alert": {
      "type": "leak",
      "severity": "critical",
      "message": "Water leak detected"
    }
  }
  ```

#### 5. Heartbeat
- **Endpoint:** `POST /api/device/heartbeat`
- **Auth:** Device API key
- **Body:**
  ```json
  {
    "deviceId": "abc123...",
    "timestamp": "2026-01-16T08:00:00Z",
    "status": "online"
  }
  ```

#### 6. Get Device Config
- **Endpoint:** `GET /api/device/config`
- **Auth:** Device API key
- **Response:**
  ```json
  {
    "success": true,
    "config": {
      "minMoisture": 30,
      "maxMoisture": 70,
      "irrigationDuration": 1800
    }
  }
  ```

---

## 🗄️ Parse Server Schema

### Device Class

| Field | Type | Description |
|-------|------|-------------|
| deviceId | String | Unique device identifier (SHA256) |
| name | String | User-friendly device name |
| owner | Pointer (User) | Device owner |
| apiKey | String | Device API key for authentication |
| status | String | online/offline |
| lastSeen | Date | Last communication timestamp |
| config | Object | Device configuration |
| stats | Object | Device statistics |

### SensorLog Class

| Field | Type | Description |
|-------|------|-------------|
| device | Pointer (Device) | Associated device |
| deviceId | String | Device identifier |
| timestamp | Date | Sensor reading timestamp |
| soilMoisture | Number | Soil moisture (%) |
| temperature | Number | Temperature (°C) |
| humidity | Number | Humidity (%) |
| waterFlow | Number | Water flow (L/min) |
| waterPressure | Number | Water pressure (bar) |
| batteryVoltage | Number | Battery voltage (V) |
| solarVoltage | Number | Solar voltage (V) |

### IrrigationLog Class

| Field | Type | Description |
|-------|------|-------------|
| device | Pointer (Device) | Associated device |
| deviceId | String | Device identifier |
| timestamp | Date | Event timestamp |
| zoneId | Number | Irrigation zone ID |
| action | String | start/stop |
| duration | Number | Duration (seconds) |
| waterUsed | Number | Water used (liters) |
| trigger | String | manual/scheduled/ai |

### Alert Class

| Field | Type | Description |
|-------|------|-------------|
| device | Pointer (Device) | Associated device |
| deviceId | String | Device identifier |
| timestamp | Date | Alert timestamp |
| type | String | leak/battery_low/sensor_error |
| severity | String | info/warning/critical |
| message | String | Alert message |
| details | Object | Additional details |
| resolved | Boolean | Alert resolution status |

### AIInput Class

| Field | Type | Description |
|-------|------|-------------|
| device | Pointer (Device) | Associated device |
| deviceId | String | Device identifier |
| timestamp | Date | Input timestamp |
| sensors | Object | Sensor data snapshot |
| trigger | String | Trigger reason |
| processed | Boolean | Processing status |
| recommendation | String | AI recommendation |

---

## 🔍 Troubleshooting

### Device Not Detected

**Problem:** Pairing interface can't find device

**Solutions:**
1. Ensure device pairing server is running: `python backend/device_pairing_server.py`
2. Check if port 5001 is accessible
3. Verify firewall settings
4. Try accessing directly: `http://localhost:5001/device-id`

### Registration Failed

**Problem:** Device registration fails with VPS

**Solutions:**
1. Verify VPS URL is correct and accessible
2. Check session token is valid
3. Ensure Parse Server is running
4. Check VPS logs for errors
5. Verify MongoDB is running and accessible

### Data Not Syncing

**Problem:** Sensor data not appearing in VPS

**Solutions:**
1. Check device is registered: `is_device_registered()`
2. Verify API key is stored locally
3. Check VPS URL in `VPSCloudClient`
4. Test network connectivity to VPS
5. Check VPS API logs

### Device Shows Offline

**Problem:** Device status shows offline in VPS

**Solutions:**
1. Ensure heartbeat is being sent regularly
2. Check last heartbeat timestamp
3. Verify device clock is synchronized
4. Check network connectivity

---

## 🚀 Quick Start Checklist

### Device Side
- [ ] Install Python dependencies
- [ ] Run device pairing server
- [ ] Open pairing interface
- [ ] Complete pairing process
- [ ] Verify device is registered
- [ ] Start sending sensor data

### VPS Side
- [ ] Install Node.js dependencies
- [ ] Configure environment variables
- [ ] Start MongoDB
- [ ] Start Parse Server
- [ ] Start Next.js API
- [ ] Create user account
- [ ] Get session token
- [ ] Register device

---

## 📞 Support

For issues or questions:
- Check logs: Device logs and VPS logs
- Verify configuration files
- Test endpoints with curl/Postman
- Review Parse Server dashboard

---

**Version:** 1.0.0  
**Last Updated:** January 2026
