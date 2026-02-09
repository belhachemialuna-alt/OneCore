# Complete Raspberry Pi – Next.js – Parse Server Integration Guide

## 🎯 System Architecture

This is a complete end-to-end guide for connecting a Raspberry Pi device (Python + HTML) to a Next.js backend using REST APIs and Parse Server.

```
┌─────────────────────────────────────────────────────────┐
│                  USER (Browser)                         │
│  - Login with email/password                            │
│  - Gets session token                                   │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│         RASPBERRY PI (192.168.137.193:5000)             │
│                                                         │
│  ┌─────────────────────────────────────────────────┐  │
│  │ Python Flask (device/local_api.py)              │  │
│  │ - GET /device-id                                │  │
│  │ - POST /device-register                         │  │
│  │ - Generates stable device ID                    │  │
│  └─────────────────────────────────────────────────┘  │
│                                                         │
└────────────────────┬────────────────────────────────────┘
                     │ HTTP JSON
                     ▼
┌─────────────────────────────────────────────────────────┐
│         NEXT.JS API (192.168.1.6:3000)                  │
│         Production: cloud.ielivate.com                  │
│                                                         │
│  ┌─────────────────────────────────────────────────┐  │
│  │ API Routes                                      │  │
│  │ - POST /api/device/register                     │  │
│  │ - POST /api/device/heartbeat                    │  │
│  │ - POST /api/device/data                         │  │
│  │ - Validates session token                       │  │
│  │ - Links device to user                          │  │
│  └─────────────────────────────────────────────────┘  │
│                                                         │
└────────────────────┬────────────────────────────────────┘
                     │ Parse SDK
                     ▼
┌─────────────────────────────────────────────────────────┐
│              PARSE SERVER + DATABASE                    │
│                                                         │
│  Classes:                                               │
│  - User (email, password, sessionToken)                 │
│  - Device (deviceId, owner, apiKey, status)             │
│  - SensorLog (device, timestamp, data)                  │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

## 🌐 Network Configuration

### Your Specific Setup

| Component | IP/Domain | Port | Purpose |
|-----------|-----------|------|---------|
| **Raspberry Pi** | 192.168.137.193 | 5000 | Device local API (Python/Flask) |
| **Windows PC** | 192.168.1.6 | 3000 | Next.js API server |
| **Cloud Domain** | cloud.ielivate.com | 443 | Production HTTPS endpoint |

### Port Rules

- **Port 5000**: Raspberry Pi Flask service (device identity)
- **Port 3000**: Next.js API server (device registration, data)
- **Different ports required**: They communicate over network

## 📦 Installation & Setup

### 1. Raspberry Pi Setup

```bash
# Install dependencies
pip install flask flask-cors requests

# Navigate to device module
cd /path/to/backend/device

# Start device service (local testing)
python main.py --env local

# Or for cloud production
python main.py --env cloud
```

### 2. Windows PC (Next.js) Setup

```bash
# Navigate to Next.js project
cd vps-nextjs

# Install dependencies
npm install

# Create .env file
cat > .env << EOF
PARSE_APP_ID=your-app-id
PARSE_MASTER_KEY=your-master-key
PARSE_SERVER_URL=http://localhost:1337/parse
DATABASE_URI=mongodb://localhost:27017/bayyti
EOF

# Start Parse Server
node parse-server.js

# In another terminal, start Next.js
npm run dev
```

## 🔄 Complete Lifecycle Flow

### Phase 1: User Authentication

**User logs in via Next.js dashboard:**

```javascript
// User login
const user = await Parse.User.logIn(email, password);
const sessionToken = user.getSessionToken();

// Store in browser
localStorage.setItem('sessionToken', sessionToken);
```

**Result:** User has session token proving their identity.

### Phase 2: Device Identity Generation

**Raspberry Pi generates stable device ID:**

```python
# backend/device/identity.py
import uuid, hashlib, platform

def generate_device_id():
    mac = uuid.getnode()              # MAC address
    system = platform.system()        # Linux
    machine = platform.machine()      # armv7l
    
    raw = f"{mac}{system}{machine}"
    return hashlib.sha256(raw.encode()).hexdigest()

# Generated once, stored in device_identity.json
DEVICE_ID = generate_device_id()
```

**Result:** Device has permanent, unique ID.

### Phase 3: Device Registration (Critical Linking)

**This is where device becomes owned by user:**

```javascript
// frontend/device-pairing.html

// 1. Get device ID from Raspberry Pi
const deviceResponse = await fetch('http://192.168.137.193:5000/device-id');
const { deviceId } = await deviceResponse.json();

// 2. Register with Next.js using user's session token
const registerResponse = await fetch('http://192.168.1.6:3000/api/device/register', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'x-session-token': localStorage.getItem('sessionToken')
    },
    body: JSON.stringify({
        deviceId: deviceId,
        deviceName: 'My Raspberry Pi'
    })
});

const { apiKey } = await registerResponse.json();

// 3. Update device with API key
await fetch('http://192.168.137.193:5000/device-register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        apiKey: apiKey,
        deviceName: 'My Raspberry Pi'
    })
});
```

**Next.js API handles registration:**

```javascript
// vps-nextjs/api/device/register/route.js
import Parse from 'parse/node';
import crypto from 'crypto';

export async function POST(req) {
    // 1. Validate user session
    const sessionToken = req.headers.get('x-session-token');
    const user = await Parse.User.become(sessionToken);
    
    // 2. Get device info
    const { deviceId, deviceName } = await req.json();
    
    // 3. Create or update device
    const Device = Parse.Object.extend('Device');
    const query = new Parse.Query(Device);
    query.equalTo('deviceId', deviceId);
    
    let device = await query.first({ useMasterKey: true });
    
    if (!device) {
        device = new Device();
        device.set('deviceId', deviceId);
        device.set('name', deviceName);
        device.set('owner', user);  // LINK TO USER
        device.set('apiKey', crypto.randomUUID());
        device.set('status', 'offline');
        
        // Set ACL so only owner can access
        const acl = new Parse.ACL(user);
        device.setACL(acl);
        
        await device.save(null, { useMasterKey: true });
    }
    
    return Response.json({
        success: true,
        apiKey: device.get('apiKey')
    });
}
```

**Result:** 
- Device permanently linked to user's email
- Device receives API key for future authentication
- Only this user can see/control this device

### Phase 4: Normal Operation

**Device sends data using API key:**

```python
# backend/device/sender.py
import requests

def send_sensor_data(sensor_data, api_key, vps_url):
    response = requests.post(
        f"{vps_url}/api/device/data",
        headers={
            "Authorization": f"Device {api_key}",
            "Content-Type": "application/json"
        },
        json={
            "sensors": sensor_data,
            "timestamp": datetime.utcnow().isoformat()
        }
    )
    return response.json()
```

**Next.js validates device:**

```javascript
// vps-nextjs/api/device/data/route.js
export async function POST(req) {
    // 1. Extract API key
    const authHeader = req.headers.get('authorization');
    const apiKey = authHeader.replace('Device ', '');
    
    // 2. Find device by API key
    const Device = Parse.Object.extend('Device');
    const query = new Parse.Query(Device);
    query.equalTo('apiKey', apiKey);
    
    const device = await query.first({ useMasterKey: true });
    
    if (!device) {
        return Response.json({ error: 'Invalid API key' }, { status: 401 });
    }
    
    // 3. Save sensor data
    const { sensors, timestamp } = await req.json();
    
    const SensorLog = Parse.Object.extend('SensorLog');
    const log = new SensorLog();
    log.set('device', device);
    log.set('data', sensors);
    log.set('timestamp', new Date(timestamp));
    
    await log.save(null, { useMasterKey: true });
    
    // 4. Update device status
    device.set('status', 'online');
    device.set('lastSeen', new Date());
    await device.save(null, { useMasterKey: true });
    
    return Response.json({ success: true });
}
```

**Device sends heartbeat:**

```python
# backend/device/heartbeat.py
import time, requests

def heartbeat_loop(api_key, vps_url, interval=300):
    while True:
        try:
            requests.post(
                f"{vps_url}/api/device/heartbeat",
                headers={"Authorization": f"Device {api_key}"}
            )
            print("Heartbeat sent")
        except Exception as e:
            print(f"Heartbeat failed: {e}")
        
        time.sleep(interval)  # 5 minutes
```

### Phase 5: User Dashboard

**User sees only their devices:**

```javascript
// Dashboard query
const currentUser = Parse.User.current();

const Device = Parse.Object.extend('Device');
const query = new Parse.Query(Device);
query.equalTo('owner', currentUser);  // Only user's devices
query.descending('lastSeen');

const devices = await query.find();

// Display devices
devices.forEach(device => {
    console.log({
        name: device.get('name'),
        status: device.get('status'),
        lastSeen: device.get('lastSeen')
    });
});
```

## 🧪 Testing Commands

### 1. Test Raspberry Pi Device Service

```bash
# From any device on network
curl http://192.168.137.193:5000/device-id

# Expected response:
{
  "success": true,
  "deviceId": "a1b2c3d4e5f6789...",
  "registered": false
}
```

### 2. Test Next.js API

```bash
# Health check
curl http://192.168.1.6:3000/api/health

# Test device registration (need session token)
curl -X POST http://192.168.1.6:3000/api/device/register \
  -H "Content-Type: application/json" \
  -H "x-session-token: YOUR_SESSION_TOKEN" \
  -d '{
    "deviceId": "test123",
    "deviceName": "Test Device"
  }'
```

### 3. Test Complete Flow

```bash
# 1. Start Raspberry Pi service
python backend/device/main.py --env local

# 2. Start Next.js (in another terminal)
cd vps-nextjs && npm run dev

# 3. Open browser
http://192.168.1.6:3000/device-pairing.html

# 4. Follow pairing wizard
```

## 🌍 Local vs Cloud Configuration

### Local Testing (Development)

```javascript
// frontend/device-pairing.html
const ENVIRONMENT = 'local';
const LOCAL_DEVICE_URL = 'http://192.168.137.193:5000';
const VPS_URL = 'http://192.168.1.6:3000';
```

```python
# backend/device/main.py
python main.py --env local
# Uses: http://192.168.1.6:3000
```

### Cloud Production

```javascript
// frontend/device-pairing.html
const ENVIRONMENT = 'cloud';
const LOCAL_DEVICE_URL = 'http://localhost:5000';  // Device is local
const VPS_URL = 'https://cloud.ielivate.com';      // API is cloud
```

```python
# backend/device/main.py
python main.py --env cloud
# Uses: https://cloud.ielivate.com
```

## 🔐 Security Best Practices

### ✅ DO

1. **Use HTTPS in production** (cloud.ielivate.com)
2. **Never expose Parse Master Key** to frontend
3. **Validate session tokens** on every API call
4. **Use ACLs** to restrict device access to owner
5. **Store API keys securely** on device
6. **Use environment variables** for sensitive config

### ❌ DON'T

1. **Don't hardcode API keys** in frontend
2. **Don't use HTTP** in production
3. **Don't expose device API** to internet
4. **Don't skip session validation**
5. **Don't allow public device access**

## 📊 Parse Server Schema

### User Class (Built-in)

```javascript
{
  "objectId": "user123",
  "email": "user@example.com",
  "password": "hashed",
  "sessionToken": "r:abc123..."
}
```

### Device Class

```javascript
{
  "objectId": "device123",
  "deviceId": "a1b2c3d4...",       // Unique hardware ID
  "name": "My Raspberry Pi",
  "owner": { "__type": "Pointer", "className": "_User", "objectId": "user123" },
  "apiKey": "device-api-key-xxx",
  "status": "online",
  "lastSeen": { "__type": "Date", "iso": "2026-01-16T10:00:00.000Z" }
}
```

### SensorLog Class

```javascript
{
  "objectId": "log123",
  "device": { "__type": "Pointer", "className": "Device", "objectId": "device123" },
  "timestamp": { "__type": "Date", "iso": "2026-01-16T10:00:00.000Z" },
  "data": {
    "soil_moisture": 45.2,
    "temperature": 24.5,
    "humidity": 65.0
  }
}
```

## 🎓 Key Concepts

### 1. Device Identity = Source of Truth
- Generated once from hardware
- Never changes
- Stored in `device_identity.json`

### 2. Two-Phase Authentication
- **User**: email/password → session token
- **Device**: deviceId → API key

### 3. Ownership Linking
- Happens during registration
- User's session token proves ownership
- Device.owner = User pointer

### 4. Network Separation
- Device API (port 5000) = Local only
- Next.js API (port 3000) = Network accessible
- Parse Server = Backend only

## 📞 Troubleshooting

See `NETWORK_SETUP_GUIDE.md` for detailed troubleshooting steps.

---

**Version:** 1.0.0  
**Network:** Local (192.168.x.x) + Cloud (cloud.ielivate.com)  
**Last Updated:** January 2026
