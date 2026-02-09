# Network Setup Guide - Raspberry Pi to Next.js Integration

## 🌐 Network Configuration

### Your Network Setup

```
┌─────────────────────────────────────────────────────────┐
│                    LOCAL NETWORK                        │
│                                                         │
│  ┌──────────────────────┐      ┌──────────────────┐   │
│  │  Raspberry Pi        │      │  Windows PC      │   │
│  │  IP: 192.168.137.193 │◄────►│  IP: 192.168.1.6 │   │
│  │  Port: 5000          │      │  Port: 3000      │   │
│  │  (Python/Flask)      │      │  (Next.js)       │   │
│  └──────────────────────┘      └──────────────────┘   │
│                                                         │
└─────────────────────────────────────────────────────────┘
                         │
                         │ Internet
                         ▼
              ┌──────────────────────┐
              │  Cloud Production    │
              │  cloud.ielivate.com  │
              │  (HTTPS)             │
              └──────────────────────┘
```

### IP Addresses & Ports

| Component | IP Address | Port | URL |
|-----------|------------|------|-----|
| **Raspberry Pi** | 192.168.137.193 | 5000 | http://192.168.137.193:5000 |
| **Windows PC (Next.js)** | 192.168.1.6 | 3000 | http://192.168.1.6:3000 |
| **Cloud Domain** | cloud.ielivate.com | 443 | https://cloud.ielivate.com |

## 🚀 Quick Start

### 1. Start Raspberry Pi Device Service

```bash
# On Raspberry Pi
cd /path/to/backend/device
python main.py --env local

# This starts:
# - Local API on port 5000
# - Connects to Next.js at http://192.168.1.6:3000
```

### 2. Start Next.js API Server

```bash
# On Windows PC
cd vps-nextjs
npm run dev

# This starts:
# - Next.js API on port 3000
# - Accessible at http://192.168.1.6:3000
```

### 3. Access Frontend

```bash
# From any device on the network
http://192.168.1.6:3000/hardware.html
http://192.168.1.6:3000/device-pairing.html
```

## 🔧 Configuration Files

### Device Configuration (`backend/device/config.py`)

```python
# Network Configuration
RASPBERRY_PI_IP = "192.168.137.193"
PC_IP = "192.168.1.6"
CLOUD_DOMAIN = "cloud.ielivate.com"

# Port Configuration
DEVICE_PORT = 5000  # Raspberry Pi
NEXTJS_PORT = 3000  # Next.js

# Environment
ENVIRONMENT = "local"  # or "cloud"
```

### Frontend Configuration

Update these files to use correct IPs:

**`frontend/hardware.html`:**
```javascript
// Local testing
const response = await fetch('http://192.168.137.193:5000/device-id');

// Cloud production
const response = await fetch('http://localhost:5000/device-id');
```

**`frontend/device-pairing.html`:**
```javascript
// Local testing
const LOCAL_DEVICE_URL = 'http://192.168.137.193:5000';
const VPS_URL = 'http://192.168.1.6:3000';

// Cloud production
const LOCAL_DEVICE_URL = 'http://localhost:5000';
const VPS_URL = 'https://cloud.ielivate.com';
```

## 📋 Testing Checklist

### Local Network Testing

#### 1. Test Raspberry Pi Device Service

```bash
# From Windows PC or any device on network
curl http://192.168.137.193:5000/device-id

# Expected response:
# {"success":true,"deviceId":"abc123...","registered":false}
```

#### 2. Test Next.js API

```bash
# From Raspberry Pi or any device on network
curl http://192.168.1.6:3000/api/device/register

# Should return API endpoint info
```

#### 3. Test Device Registration Flow

```bash
# 1. Get device ID from Raspberry Pi
curl http://192.168.137.193:5000/device-id

# 2. Register device with Next.js (with user session token)
curl -X POST http://192.168.1.6:3000/api/device/register \
  -H "Content-Type: application/json" \
  -H "x-session-token: YOUR_SESSION_TOKEN" \
  -d '{
    "deviceId": "DEVICE_ID_FROM_STEP_1",
    "deviceName": "My Raspberry Pi"
  }'

# Expected response:
# {"success":true,"apiKey":"device-api-key-xxx"}
```

#### 4. Test Heartbeat

```bash
# From Raspberry Pi (after registration)
curl -X POST http://192.168.1.6:3000/api/device/heartbeat \
  -H "Authorization: Device YOUR_API_KEY"

# Expected response:
# {"success":true,"status":"online"}
```

## 🌍 Cloud Production Setup

### 1. Update Environment Variable

```bash
# On Raspberry Pi
export DEVICE_ENV=cloud

# Or in command line
python main.py --env cloud
```

### 2. Update Next.js Configuration

```bash
# In vps-nextjs/.env
NEXT_PUBLIC_API_URL=https://cloud.ielivate.com
PARSE_SERVER_URL=https://cloud.ielivate.com/parse
```

### 3. Deploy Next.js to Cloud

```bash
# Build Next.js
cd vps-nextjs
npm run build

# Deploy to cloud.ielivate.com
# (Use your deployment method: Vercel, AWS, etc.)
```

### 4. Update Frontend URLs

**For Cloud Production:**

```javascript
// hardware.html - Keep localhost (device is local)
const response = await fetch('http://localhost:5000/device-id');

// device-pairing.html
const LOCAL_DEVICE_URL = 'http://localhost:5000';
const VPS_URL = 'https://cloud.ielivate.com';
```

## 🔐 Security Considerations

### Local Testing
- ✅ HTTP is acceptable
- ✅ Use local IP addresses
- ✅ Firewall rules may need adjustment

### Cloud Production
- ⚠️ **MUST use HTTPS** for cloud.ielivate.com
- ⚠️ **Never expose Parse Server keys** to frontend
- ⚠️ **Use environment variables** for sensitive data
- ⚠️ **Enable CORS** properly in Next.js
- ⚠️ **Use ACLs** in Parse Server for user data

## 🐛 Troubleshooting

### Issue: Cannot connect from PC to Raspberry Pi

**Check:**
1. Both devices on same network
2. Raspberry Pi firewall allows port 5000
3. Correct IP address (run `hostname -I` on Pi)

```bash
# On Raspberry Pi - Allow port 5000
sudo ufw allow 5000
```

### Issue: Cannot connect from Raspberry Pi to PC

**Check:**
1. Windows Firewall allows port 3000
2. Next.js running on 0.0.0.0 (not just localhost)
3. Correct PC IP (run `ipconfig` on Windows)

```bash
# On Windows - Allow port 3000 in firewall
# Or temporarily disable firewall for testing
```

### Issue: Device ID shows "Not Available"

**Solutions:**
1. Check Raspberry Pi service is running
2. Verify port 5000 is accessible
3. Check frontend is using correct IP

```bash
# Test from browser console
fetch('http://192.168.137.193:5000/device-id')
  .then(r => r.json())
  .then(console.log)
```

### Issue: Registration fails

**Check:**
1. User is logged in (session token exists)
2. Next.js API is running
3. Parse Server is accessible
4. Network connectivity

## 📝 Command Reference

### Raspberry Pi Commands

```bash
# Check IP address
hostname -I

# Start device service (local)
python backend/device/main.py --env local

# Start device service (cloud)
python backend/device/main.py --env cloud

# Test device ID
curl http://localhost:5000/device-id

# Check if port 5000 is listening
netstat -tuln | grep 5000
```

### Windows PC Commands

```bash
# Check IP address
ipconfig

# Start Next.js
cd vps-nextjs
npm run dev

# Test Next.js API
curl http://localhost:3000/api/device/register

# Check if port 3000 is listening
netstat -ano | findstr :3000
```

### Network Testing Commands

```bash
# From any device - test Raspberry Pi
curl http://192.168.137.193:5000/health

# From any device - test Next.js
curl http://192.168.1.6:3000/api/health

# Ping test
ping 192.168.137.193
ping 192.168.1.6
```

## 🎯 Environment Comparison

| Feature | Local Testing | Cloud Production |
|---------|--------------|------------------|
| **Raspberry Pi URL** | http://192.168.137.193:5000 | http://localhost:5000 |
| **Next.js URL** | http://192.168.1.6:3000 | https://cloud.ielivate.com |
| **Protocol** | HTTP | HTTPS |
| **Network** | Local LAN | Internet |
| **Device Access** | Direct IP | Localhost only |
| **API Access** | PC IP | Cloud domain |

## 🔄 Migration Path: Local → Cloud

### Step 1: Test Locally
```bash
# Raspberry Pi
python main.py --env local

# Windows PC
npm run dev
```

### Step 2: Deploy Next.js to Cloud
```bash
# Build and deploy to cloud.ielivate.com
npm run build
# Deploy using your method
```

### Step 3: Switch Raspberry Pi to Cloud
```bash
# Raspberry Pi
python main.py --env cloud
```

### Step 4: Update Frontend
- Change VPS_URL to https://cloud.ielivate.com
- Keep device URL as localhost:5000

## 📞 Support

**Network Issues:**
- Check firewall settings
- Verify IP addresses with `ipconfig` / `hostname -I`
- Test connectivity with `ping`

**API Issues:**
- Check logs in Next.js console
- Verify Parse Server is running
- Test endpoints with `curl`

**Device Issues:**
- Check device service logs
- Verify port 5000 is open
- Test device ID endpoint

---

**Last Updated:** January 2026  
**Network:** 192.168.x.x (Local) → cloud.ielivate.com (Production)
