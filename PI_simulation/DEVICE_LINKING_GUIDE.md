# Complete Guide: Linking Python Devices with Next.js Dashboard

This guide provides a complete, production-ready implementation for linking physical devices (Python scripts) with the Next.js cloud dashboard using Parse Server.

## 1. System Architecture Overview

**Python** is the device authority. It generates a unique Device ID.  
**HTML/JS** is the pairing interface.  
**Next.js** is the secure gateway.  
**Parse Server** is the data and authentication layer.

### Architecture Flow:
```
[ Python Device ] → [ HTML/JS Pairing ] → [ Next.js API ] → [ Parse Server ] → [ Database ]
```

## 2. Responsibilities per Layer

| Layer | Responsibility |
|-------|---------------|
| Python | Generate Device ID, send data |
| HTML/JS | Send Device ID to cloud |
| Next.js | Security, validation, linking |
| Parse Server | Auth, storage, ACLs |

## 3. Database Schema

### User (Parse.User)
| Field | Type | Description |
|-------|------|-------------|
| username | String | Email |
| email | String | User email |
| password | String | Hashed |

### Device
| Field | Type | Description |
|-------|------|-------------|
| deviceId | String | Unique hardware hash |
| name | String | Device name |
| owner | Pointer<User> | Linked user |
| apiKey | String | Device token |
| status | String | online/offline |
| lastSeen | Date | Heartbeat |

## 4. Python: Device ID Generation

```python
import uuid
import hashlib
import platform

def get_device_id():
    raw = f"{uuid.getnode()}{platform.system()}{platform.machine()}"
    return hashlib.sha256(raw.encode()).hexdigest()

DEVICE_ID = get_device_id()
print(f"Device ID: {DEVICE_ID}")
```

## 5. Python: Expose Device ID to HTML

### Option A: Write to file
```python
import json

with open("device_id.json", "w") as f:
    json.dump({"deviceId": DEVICE_ID}, f)
```

### Option B: Local server (recommended)
```python
from flask import Flask, jsonify

app = Flask(__name__)

@app.route("/device-id")
def device_id():
    return jsonify({"deviceId": DEVICE_ID})

if __name__ == "__main__":
    app.run(port=5000)
```

## 6. HTML/JavaScript: Send Device ID to Next.js

```html
<!DOCTYPE html>
<html>
<head>
    <title>Device Registration</title>
</head>
<body>
    <h1>Register Device</h1>
    <input type="text" id="deviceName" placeholder="Device Name" />
    <button onclick="registerDevice()">Register</button>
    <div id="result"></div>

    <script>
        async function registerDevice() {
            try {
                // Get device ID from Python server
                const deviceResponse = await fetch("http://localhost:5000/device-id");
                const { deviceId } = await deviceResponse.json();

                // Get device name
                const deviceName = document.getElementById("deviceName").value || "My Device";

                // Get session token (user must be logged in)
                const sessionToken = localStorage.getItem("sessionToken");

                if (!sessionToken) {
                    alert("Please log in first!");
                    return;
                }

                // Register device with Next.js API
                const response = await fetch("http://localhost:3000/api/device/register", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "x-session-token": sessionToken
                    },
                    body: JSON.stringify({ deviceId, deviceName })
                });

                const data = await response.json();

                if (data.success) {
                    document.getElementById("result").innerHTML = 
                        `<p>Device registered! API Key: ${data.apiKey}</p>`;
                    
                    // Save API key for Python to use
                    await fetch("http://localhost:5000/save-api-key", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ apiKey: data.apiKey })
                    });
                } else {
                    document.getElementById("result").innerHTML = 
                        `<p>Error: ${data.error}</p>`;
                }
            } catch (error) {
                console.error(error);
                document.getElementById("result").innerHTML = 
                    `<p>Error: ${error.message}</p>`;
            }
        }
    </script>
</body>
</html>
```

## 7. Next.js API Routes (Already Created)

### `/api/device/register` - Register a new device
### `/api/device/heartbeat` - Send device heartbeat
### `/api/device/list` - List user's devices

## 8. Python: Store API Key and Use It

```python
import requests
import json
import time
from flask import Flask, jsonify, request

app = Flask(__name__)

# Store API key
API_KEY = None

@app.route("/device-id")
def device_id():
    return jsonify({"deviceId": DEVICE_ID})

@app.route("/save-api-key", methods=["POST"])
def save_api_key():
    global API_KEY
    data = request.json
    API_KEY = data.get("apiKey")
    
    # Save to file for persistence
    with open("api_key.txt", "w") as f:
        f.write(API_KEY)
    
    return jsonify({"success": True})

def send_heartbeat():
    """Send heartbeat to cloud"""
    if not API_KEY:
        print("No API key available")
        return
    
    try:
        response = requests.post(
            "http://localhost:3000/api/device/heartbeat",
            headers={"Authorization": f"Device {API_KEY}"}
        )
        print(f"Heartbeat: {response.json()}")
    except Exception as e:
        print(f"Heartbeat error: {e}")

# Load API key if exists
try:
    with open("api_key.txt", "r") as f:
        API_KEY = f.read().strip()
except FileNotFoundError:
    pass

if __name__ == "__main__":
    # Start heartbeat in background
    import threading
    
    def heartbeat_loop():
        while True:
            send_heartbeat()
            time.sleep(30)  # Send every 30 seconds
    
    threading.Thread(target=heartbeat_loop, daemon=True).start()
    
    # Start Flask server
    app.run(port=5000)
```

## 9. Security Rules

✅ Python NEVER talks directly to Parse  
✅ Parse keys stay on the server  
✅ Device uses API key only  
✅ ACL restricts device access  
✅ HTTPS is mandatory in production

## 10. Testing the System

### Step 1: Start Python server
```bash
python device.py
```

### Step 2: Open HTML file in browser
```bash
# Open registration.html in browser
```

### Step 3: Log in to Next.js app
```bash
# Go to http://localhost:3000/login
# Log in with your credentials
```

### Step 4: Register device
- Enter device name
- Click "Register"
- API key will be saved automatically

### Step 5: Check devices in dashboard
```bash
# Go to http://localhost:3000/devices
# You should see your registered device
```

## 11. API Endpoints Summary

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/api/device/register` | POST | Session Token | Register new device |
| `/api/device/heartbeat` | POST | Device API Key | Send heartbeat |
| `/api/device/list` | GET | Session Token | List user devices |

## 12. Environment Variables Required

Add to `.env.local`:
```env
NEXT_PUBLIC_PARSE_APP_ID=your_app_id
NEXT_PUBLIC_PARSE_JS_KEY=your_js_key
NEXT_PUBLIC_PARSE_SERVER_URL=your_server_url
PARSE_MASTER_KEY=your_master_key
```

## 13. Parse Server Schema Setup

The Device class will be created automatically when you register the first device. However, you can pre-create it in Parse Dashboard:

1. Go to Parse Dashboard
2. Create new class: `Device`
3. Add columns:
   - `deviceId` (String)
   - `name` (String)
   - `owner` (Pointer to _User)
   - `apiKey` (String)
   - `status` (String)
   - `lastSeen` (Date)

## 14. Complete Python Example

See `examples/device.py` for a complete working example.

## 15. Troubleshooting

### Device not registering
- Check session token is valid
- Verify Parse Server is running
- Check network connectivity

### Heartbeat failing
- Verify API key is correct
- Check device status in Parse Dashboard
- Ensure Next.js server is running

### CORS errors
- Add CORS headers to Next.js API routes
- Use proper domain in production
