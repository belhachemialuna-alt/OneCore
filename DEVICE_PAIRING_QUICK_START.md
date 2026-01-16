# Device Pairing Quick Start Guide

## 🎯 Overview

This guide walks you through pairing your physical Raspberry Pi device with the VPS cloud server.

## ⚡ Quick Steps

### 1️⃣ Start Device Pairing Server

On your Raspberry Pi:

```bash
cd backend
python device_pairing_server.py
```

Server will start on port 5001.

### 2️⃣ Open Pairing Interface

On any device connected to the same network, open:

```
http://[raspberry-pi-ip]/device-pairing.html
```

Or locally on the Pi:
```
http://localhost/device-pairing.html
```

### 3️⃣ Detect Device

Click **"Detect Device"** button. The interface will:
- Connect to local pairing server
- Retrieve unique device ID
- Show registration status

### 4️⃣ Get VPS Session Token

1. Go to your VPS cloud dashboard
2. Log in with your user account
3. Copy your session token from settings/profile

### 5️⃣ Register Device

Fill in the form:
- **Device Name**: e.g., "Garden Irrigation System"
- **VPS URL**: Your cloud server URL (e.g., `https://your-vps.com`)
- **Session Token**: Paste token from step 4

Click **"Register Device"**

### 6️⃣ Pairing Complete! ✅

Device is now registered and can communicate with VPS cloud.

## 🔄 Integration with Main Application

### Option A: Background Server

Add to your main application:

```python
# In your main.py or api_server.py
from device_pairing_server import start_pairing_server_background

# Start pairing server in background
start_pairing_server_background(host="0.0.0.0", port=5001)
```

### Option B: Standalone Service

Create systemd service for pairing server:

```bash
sudo nano /etc/systemd/system/device-pairing.service
```

```ini
[Unit]
Description=BAYYTI Device Pairing Server
After=network.target

[Service]
Type=simple
User=pi
WorkingDirectory=/home/pi/OneCore/backend
ExecStart=/usr/bin/python3 device_pairing_server.py
Restart=always

[Install]
WantedBy=multi-user.target
```

Enable and start:
```bash
sudo systemctl enable device-pairing
sudo systemctl start device-pairing
```

## 📤 Sending Data to VPS

After pairing, use VPS Cloud Client:

```python
from vps_cloud_client import VPSCloudClient

# Initialize client
client = VPSCloudClient(vps_url="https://your-vps.com")

# Check registration
if not client.check_registration():
    print("Device not registered!")
    exit(1)

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
print(f"Data sent: {result}")

# Send heartbeat every 5 minutes
result = client.heartbeat()
print(f"Heartbeat: {result}")
```

## 🔍 Verify Registration

Check device identity:

```python
from device_identity import get_device_identity, is_device_registered

identity = get_device_identity()
print(f"Device ID: {identity['deviceId']}")
print(f"Registered: {identity['registered']}")
print(f"Device Name: {identity.get('deviceName')}")
print(f"API Key: {'Set' if identity.get('apiKey') else 'Not set'}")
```

## 🛠️ Troubleshooting

### Device Not Detected

**Problem:** Pairing interface can't find device

**Solution:**
```bash
# Check if pairing server is running
curl http://localhost:5001/health

# Should return: {"success": true, "status": "running"}
```

### Registration Failed

**Problem:** VPS registration returns error

**Solutions:**
1. Verify VPS URL is correct and accessible
2. Check session token is valid (not expired)
3. Ensure VPS Parse Server is running
4. Check network connectivity

### Device Shows as Unregistered

**Problem:** `is_device_registered()` returns False

**Solution:**
```bash
# Check device identity file
cat backend/device_identity.json

# Should contain:
# {
#   "deviceId": "...",
#   "registered": true,
#   "apiKey": "...",
#   ...
# }
```

### Data Not Syncing

**Problem:** Sensor data not appearing in VPS

**Solutions:**
1. Verify device is registered
2. Check VPS URL in client initialization
3. Test network connectivity to VPS
4. Check VPS API logs for errors

## 🔄 Re-pairing Device

To re-pair device (e.g., with different user):

```python
from device_identity import reset_device_identity

# WARNING: This will require re-pairing
reset_device_identity()
print("Device identity reset. Please pair again.")
```

Or via API:

```bash
curl -X POST http://localhost:5001/device-unregister
```

Then follow pairing steps again.

## 📋 Checklist

- [ ] Device pairing server running
- [ ] Device detected successfully
- [ ] VPS session token obtained
- [ ] Device registered with VPS
- [ ] API key stored locally
- [ ] Sensor data sending works
- [ ] Heartbeat working
- [ ] Device shows online in VPS

## 🎉 Next Steps

After successful pairing:

1. **Integrate with main app**: Add VPS client to your irrigation system
2. **Schedule data sync**: Send sensor data every 60 seconds
3. **Enable heartbeat**: Send heartbeat every 5 minutes
4. **Log events**: Send irrigation events to VPS
5. **Monitor alerts**: Send critical alerts to VPS

## 📞 Need Help?

Check the complete documentation: `DEVICE_VPS_INTEGRATION.md`

---

**Quick Reference:**
- Pairing Server Port: `5001`
- Pairing Interface: `/device-pairing.html`
- Device Identity File: `backend/device_identity.json`
- VPS API Base: `https://your-vps.com/api/device/`
