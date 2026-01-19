# Cloud Integration Guide

## Overview

Your backend is now fully integrated with the cloud platform at `https://cloud.ielivate.com`. This guide explains the complete integration flow and how to use it.

---

## ✅ What's Been Fixed

### 1. **Authentication Headers**
- **Before**: `Authorization: Device {api_key}`
- **After**: `X-Device-API-Key: {api_key}` ✓

### 2. **Endpoint Paths**
- **Before**: `/api/device/data` (singular)
- **After**: `/api/devices/data` (plural) ✓

### 3. **Data Format**
- **Before**: `snake_case` format
- **After**: `camelCase` format with automatic transformation ✓

### 4. **Command Execution**
- **Added**: Automatic command execution from cloud ✓
- **Added**: Command status updates ✓

---

## 🔄 Complete Data Flow

```
1. Device reads sensors (backend/sensor_reader.py)
   ↓
2. MainController.run_monitoring_cycle()
   ↓
3. CloudIntegration.sync_with_cloud()
   ↓
4. POST /api/devices/data
   Headers: X-Device-API-Key: {your_api_key}
   Body: {
     "temperature": 24.5,
     "humidity": 65.0,
     "soilMoisture": 45.2,
     "timestamp": "2026-01-18T19:46:00.000Z",
     "metadata": {
       "waterFlow": 0.0,
       "waterPressure": 2.5,
       "batteryVoltage": 12.4,
       "solarVoltage": 18.2
     }
   }
   ↓
5. Cloud validates API key
   ↓
6. Cloud stores data in Parse
   ↓
7. Cloud returns pending commands
   Response: {
     "success": true,
     "dataId": "abc123",
     "commands": [
       {
         "id": "cmd_001",
         "type": "start_irrigation",
         "params": {
           "zoneId": 1,
           "duration": 600
         }
       }
     ]
   }
   ↓
8. Device executes commands (CloudIntegration.execute_command())
   ↓
9. PUT /api/devices/commands
   Body: {
     "commandId": "cmd_001",
     "status": "executed"
   }
```

---

## 📋 Registration Flow

### Option 1: Manual Link (Recommended)

1. **Get Device ID**
   ```bash
   # On Raspberry Pi
   curl http://localhost:5000/device-id
   ```
   
   Response:
   ```json
   {
     "success": true,
     "deviceId": "a1b2c3d4e5f6...",
     "registered": false
   }
   ```

2. **Register on Cloud**
   - Go to: `https://cloud.ielivate.com/link-device`
   - Paste your Device ID
   - Click "Link Device"
   - Copy the API key shown (only shown once!)

3. **Update Backend**
   ```bash
   curl -X POST http://localhost:5000/device-register \
     -H "Content-Type: application/json" \
     -d '{
       "apiKey": "YOUR_API_KEY_HERE",
       "deviceName": "My Garden",
       "ownerId": "user_123"
     }'
   ```

### Option 2: Automatic Registration

```bash
curl -X POST http://localhost:5000/cloud-register \
  -H "Content-Type: application/json" \
  -d '{
    "deviceName": "My Garden"
  }'
```

Response:
```json
{
  "success": true,
  "apiKey": "dev_abc123...",
  "deviceId": "a1b2c3d4e5f6...",
  "message": "Device registered successfully"
}
```

---

## 🔧 Integration Components

### 1. **cloud_integration.py**
Main integration bridge with these methods:

- `register_device(device_name)` - Register with cloud
- `send_sensor_data(sensor_data)` - Send data to cloud
- `fetch_commands()` - Get pending commands
- `execute_command(command, irrigation_controller)` - Execute cloud commands
- `update_command_status(command_id, status)` - Update command status
- `sync_with_cloud(sensor_data, irrigation_controller)` - Complete sync cycle
- `get_status()` - Get integration status

### 2. **vps_cloud_client.py**
Updated for cloud compatibility:

- ✓ Correct authentication headers
- ✓ Correct endpoint paths
- ✓ Automatic data format transformation

### 3. **main_controller.py**
Integrated cloud sync:

- ✓ Auto-initializes cloud integration
- ✓ Syncs data every monitoring cycle
- ✓ Executes cloud commands automatically
- ✓ Provides cloud status in system status

### 4. **api_server.py**
New endpoints:

- `GET /device-id` - Get device ID and registration status
- `POST /device-register` - Update registration from cloud
- `POST /cloud-register` - Register device with cloud
- `GET /cloud-status` - Get cloud integration status

---

## 🚀 Usage Examples

### Check Cloud Status

```python
from cloud_integration import CloudIntegration

cloud = CloudIntegration()
status = cloud.get_status()
print(status)
```

Output:
```json
{
  "registered": true,
  "cloud_url": "https://cloud.ielivate.com",
  "device_id": "a1b2c3d4e5f6...",
  "device_name": "My Garden",
  "has_api_key": true,
  "owner_id": "user_123"
}
```

### Send Sensor Data

```python
from cloud_integration import CloudIntegration

cloud = CloudIntegration()

# Backend format (snake_case)
sensor_data = {
    "soil_moisture": 45.2,
    "temperature": 24.5,
    "humidity": 65.0,
    "water_flow": 0.0,
    "water_pressure": 2.5,
    "battery_voltage": 12.4,
    "solar_voltage": 18.2
}

# Automatically transforms to camelCase and sends
result = cloud.send_sensor_data(sensor_data)
print(result)
```

### Complete Sync with Command Execution

```python
from cloud_integration import CloudIntegration
from main_controller import MainController

controller = MainController()

# Read sensors
sensors = controller.sensor_reader.read_all_sensors()

# Sync with cloud (sends data + executes commands)
result = controller.cloud_integration.sync_with_cloud(
    sensor_data=sensors,
    irrigation_controller=controller.irrigation_controller
)

print(f"Data sent: {result['data_sent']}")
print(f"Commands executed: {result['commands_executed']}")
```

---

## 🎯 Automatic Integration

The `MainController` automatically handles cloud sync:

```python
# This happens automatically every monitoring cycle
controller = MainController()
result = controller.run_monitoring_cycle()

# Result includes cloud sync status
print(result['cloud_sync'])
```

Output:
```json
{
  "success": true,
  "data_sent": true,
  "commands_executed": 1,
  "commands": [
    {
      "command_id": "cmd_001",
      "type": "start_irrigation",
      "result": {
        "success": true,
        "message": "Irrigation started"
      }
    }
  ]
}
```

---

## 🔐 Security

### API Key Storage

API keys are stored locally in:
```
backend/device_identity.json
```

**Never commit this file to version control!**

Add to `.gitignore`:
```
backend/device_identity.json
```

### API Key Format

Cloud API keys follow this format:
```
dev_abc123def456ghi789...
```

---

## 🐛 Troubleshooting

### Device Not Registered

**Symptom**: `"error": "Device not registered"`

**Solution**:
```bash
# Check status
curl http://localhost:5000/cloud-status

# Register device
curl -X POST http://localhost:5000/cloud-register \
  -H "Content-Type: application/json" \
  -d '{"deviceName": "My Garden"}'
```

### Authentication Failed

**Symptom**: `"error": "Authentication failed - Invalid API key"`

**Solution**:
1. Verify API key in `device_identity.json`
2. Re-register device if needed
3. Check cloud platform for device status

### Connection Error

**Symptom**: `"error": "Cannot reach cloud server"`

**Solution**:
1. Check internet connection
2. Verify cloud URL: `https://cloud.ielivate.com`
3. Check firewall settings

### Data Format Error

**Symptom**: Cloud rejects data with format error

**Solution**: The integration automatically transforms data format. If you're using `vps_cloud_client.py` directly, ensure you're using the updated version with automatic transformation.

---

## 📊 Monitoring

### View Cloud Sync Logs

```bash
# In backend directory
tail -f logs/cloud_sync.log
```

### Check Registration Status

```bash
curl http://localhost:5000/cloud-status
```

### Test Data Transmission

```bash
# Run monitoring cycle manually
python main_controller.py
```

---

## 🔄 Command Types Supported

### 1. Start Irrigation
```json
{
  "type": "start_irrigation",
  "params": {
    "zoneId": 1,
    "duration": 600
  }
}
```

### 2. Stop Irrigation
```json
{
  "type": "stop_irrigation",
  "params": {
    "zoneId": 1
  }
}
```

---

## 📝 Notes

1. **No Frontend Input Required**: API key is automatically provided during cloud registration
2. **Automatic Sync**: Data is sent to cloud every monitoring cycle
3. **Command Execution**: Cloud commands are executed automatically
4. **Backward Compatible**: Existing backend functionality unchanged
5. **Error Handling**: Robust retry logic with exponential backoff

---

## ✅ Verification Checklist

- [ ] Device registered on cloud platform
- [ ] API key stored in `device_identity.json`
- [ ] Cloud status shows `"registered": true`
- [ ] Sensor data appears on cloud dashboard
- [ ] Cloud commands execute successfully
- [ ] Command status updates sent to cloud

---

## 🆘 Support

If you encounter issues:

1. Check `backend/device_identity.json` exists and has `apiKey`
2. Verify cloud status: `GET /cloud-status`
3. Check backend logs for errors
4. Ensure cloud platform is accessible
5. Verify device is linked on cloud dashboard

---

**Integration Complete! Your backend now seamlessly communicates with the cloud platform.** 🚀
